import os
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, select, text, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.database import Base, SessionLocal, engine, get_db
from backend.models import (
    ActivityEvent,
    ApprovalDecision,
    Recommendation,
    Sponsor,
)
from backend.schemas import (
    ActivityRead,
    ApprovalDecisionRequest,
    ApprovalDecisionResponse,
    DashboardResponse,
    FrontendInvestigationRequest,
    GeneratedRecommendation,
    ImpactGraphData,
    ImpactAnalysisRequest,
    ImpactAnalysisResponse,
    RecommendationRead,
    SponsorRead,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)
    sponsor_columns = {
        column["name"] for column in inspect(engine).get_columns("sponsors")
    }
    if "previous_commitment" not in sponsor_columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE sponsors ADD COLUMN previous_commitment INTEGER")
            )
            connection.execute(
                text(
                    "UPDATE sponsors SET previous_commitment = committed_funding "
                    "WHERE previous_commitment IS NULL"
                )
            )

    with SessionLocal() as db:
        if db.get(Sponsor, "sponsor_abc") is None:
            db.add(
                Sponsor(
                    id="sponsor_abc",
                    name="ABC Technologies",
                    committed_funding=200_000,
                    previous_commitment=200_000,
                    currency="INR",
                )
            )
            db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="SECOND BRAIN API", lifespan=lifespan)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _as_json(value: object) -> dict:
    if hasattr(value, "model_dump"):
        result = value.model_dump(mode="json")
    elif isinstance(value, dict):
        result = value
    else:
        raise ValueError("AI engine returned an invalid response.")
    if not isinstance(result, dict):
        raise ValueError("AI engine returned an invalid response.")
    return result


def _activity(
    event_type: str,
    title: str,
    description: str,
    entity_ids: list[str],
) -> ActivityEvent:
    return ActivityEvent(
        event_type=event_type,
        title=title,
        description=description,
        entity_ids=entity_ids,
    )


def _isoformat(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def _sponsor_status(sponsor: Sponsor) -> str:
    if sponsor.committed_funding < sponsor.previous_commitment:
        return "At risk"
    return "Active"


def _sponsor_response(sponsor: Sponsor) -> dict:
    initials = "".join(part[0].upper() for part in sponsor.name.split()[:2])
    return {
        "id": sponsor.id,
        "name": sponsor.name,
        "initials": initials,
        "category": "Technology",
        "previousCommitment": sponsor.previous_commitment,
        "currentCommitment": sponsor.committed_funding,
        "status": _sponsor_status(sponsor),
        "contact": "Unassigned",
        "committed_funding": sponsor.committed_funding,
        "currency": sponsor.currency,
        "updated_at": sponsor.updated_at,
    }


def _recommendation_response(recommendation: Recommendation | dict) -> dict:
    if isinstance(recommendation, dict):
        action_id = recommendation["action_id"]
        title = recommendation["title"]
        description = recommendation["description"]
        affected_entity = recommendation["affected_entity"]
        priority = recommendation["priority"]
        status = recommendation["status"]
        created_at = recommendation["createdAt"]
    else:
        action_id = recommendation.action_id
        title = recommendation.title
        description = recommendation.description
        affected_entity = recommendation.affected_entity
        priority = recommendation.priority
        status = recommendation.status
        created_at = _isoformat(recommendation.created_at)

    return {
        "id": action_id,
        "title": title,
        "explanation": description,
        "priority": priority.title(),
        "affectedEntities": [affected_entity],
        "status": status,
        "createdAt": created_at,
    }


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/api/sponsors", response_model=list[SponsorRead])
def list_sponsors(db: Session = Depends(get_db)) -> list[Sponsor]:
    sponsors = db.scalars(select(Sponsor).order_by(Sponsor.name)).all()
    return [_sponsor_response(sponsor) for sponsor in sponsors]


@app.get("/api/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    total_sponsors = db.scalar(select(func.count()).select_from(Sponsor)) or 0
    committed_funding = (
        db.scalar(select(func.coalesce(func.sum(Sponsor.committed_funding), 0))) or 0
    )
    pending_approvals = db.scalar(
        select(func.count())
        .select_from(Recommendation)
        .where(Recommendation.status == "pending")
    ) or 0
    return DashboardResponse(
        totalSponsors=total_sponsors,
        committedFunding=committed_funding,
        activeTasks=0,
        pendingApprovals=pending_approvals,
    )


@app.get(
    "/api/graph",
    response_model=ImpactGraphData,
    response_model_exclude_none=True,
)
def impact_graph(db: Session = Depends(get_db)) -> ImpactGraphData:
    import networkx as nx

    from ai_engine.knowledge_graph import build_demo_graph

    graph = build_demo_graph()
    sponsor = db.get(Sponsor, "sponsor_abc")
    visible_types = {"sponsor", "budget", "department", "task", "deliverable"}
    visible_nodes = {
        node_id
        for node_id, data in graph.nodes(data=True)
        if data.get("entity_type") in visible_types
    }
    depths = nx.single_source_shortest_path_length(graph, "sponsor_abc")
    layer_indices: dict[int, int] = defaultdict(int)
    nodes = []

    for node_id in sorted(visible_nodes, key=lambda node: (depths.get(node, 0), node)):
        data = graph.nodes[node_id]
        entity_type = data["entity_type"]
        metadata = data.get("metadata", {})
        if entity_type == "sponsor" and sponsor is not None:
            detail = f"INR {sponsor.committed_funding:,} committed"
            severity = "critical" if _sponsor_status(sponsor) == "At risk" else "neutral"
        elif entity_type == "budget":
            allocation = metadata.get("allocated_amount")
            detail = f"INR {allocation:,} allocated" if allocation is not None else "Budget"
            severity = "high"
        else:
            detail = "Potentially connected entity"
            severity = "medium"

        depth = depths.get(node_id, 0)
        nodes.append(
            {
                "id": node_id,
                "type": entity_type,
                "title": data.get("name", node_id),
                "detail": detail,
                "severity": severity,
                "x": 40 + depth * 260,
                "y": 80 + layer_indices[depth] * 180,
                **({"sponsorId": node_id} if entity_type == "sponsor" else {}),
            }
        )
        layer_indices[depth] += 1

    edges = []
    seen_edges = set()
    labels = {
        "SPONSORS": "funds",
        "ALLOCATED_TO": "allocates",
        "DEPENDS_ON": "depends on",
        "OWNS": "owns",
    }
    for source in graph.nodes:
        if source not in visible_nodes:
            continue
        for intermediate in graph.successors(source):
            targets = (
                [intermediate]
                if intermediate in visible_nodes
                else [
                    target
                    for target in graph.successors(intermediate)
                    if target in visible_nodes
                ]
            )
            for target in targets:
                if (source, target) in seen_edges:
                    continue
                seen_edges.add((source, target))
                relationship_edge = (
                    graph.edges[source, target]
                    if intermediate == target
                    else graph.edges[intermediate, target]
                )
                relationship = relationship_edge.get(
                    "relationship_type", "DEPENDS_ON"
                )
                edges.append(
                    {
                        "id": f"{source}-{target}",
                        "source": source,
                        "target": target,
                        "label": (
                            "funds"
                            if graph.nodes[source].get("entity_type") == "sponsor"
                            else labels.get(relationship, "connected to")
                        ),
                    }
                )

    return ImpactGraphData(nodes=nodes, edges=edges)


@app.post("/api/impact/analyze", response_model=ImpactAnalysisResponse)
def analyze_sponsor_impact(
    payload: ImpactAnalysisRequest,
    db: Session = Depends(get_db),
) -> ImpactAnalysisResponse:
    sponsor = db.get(Sponsor, payload.sponsor_id)
    if sponsor is None:
        raise HTTPException(status_code=404, detail="Sponsor not found.")
    if sponsor.committed_funding != payload.old_value:
        raise HTTPException(
            status_code=409,
            detail="The sponsor funding has changed; refresh and retry.",
        )

    try:
        from ai_engine import run_impact_investigation

        result = run_impact_investigation(
            changed_entity_id=payload.sponsor_id,
            old_value=payload.old_value,
            new_value=payload.new_value,
        )
        impact_report = _as_json(result["impact_report"])
        recovery_plan = _as_json(result["recovery_plan"])
        generated = recovery_plan.get("recommendations")
        if not isinstance(generated, list) or not 2 <= len(generated) <= 5:
            raise ValueError("AI engine returned an invalid recommendation count.")

        saved_recommendations = []
        for item in generated:
            if not isinstance(item, dict):
                raise ValueError("AI engine returned an invalid recommendation.")
            recommendation_data = GeneratedRecommendation.model_validate(item)
            recommendation_id = str(uuid4())
            recommendation = Recommendation(
                action_id=recommendation_id,
                sponsor_id=sponsor.id,
                title=recommendation_data.title,
                description=recommendation_data.description,
                affected_entity=recommendation_data.affected_entity,
                priority=recommendation_data.priority,
                reason=recommendation_data.reason,
                requires_human_approval=True,
                status="pending",
                created_at=utc_now(),
            )
            db.add(recommendation)
            saved_recommendations.append(
                {
                    "action_id": recommendation_id,
                    "title": recommendation.title,
                    "description": recommendation.description,
                    "affected_entity": recommendation.affected_entity,
                    "priority": recommendation.priority,
                    "reason": recommendation.reason,
                    "requires_human_approval": True,
                    "status": "pending",
                    "createdAt": _isoformat(recommendation.created_at),
                }
            )
    except ImportError as error:
        db.rollback()
        raise HTTPException(
            status_code=503, detail="The AI engine is unavailable."
        ) from error
    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail="Impact analysis failed; no changes were saved.",
        ) from error

    sponsor.previous_commitment = payload.old_value
    sponsor.committed_funding = payload.new_value
    db.add(
        _activity(
            "funding_change",
            f"{sponsor.name} funding updated",
            f"Funding changed from INR {payload.old_value} to INR {payload.new_value}.",
            [sponsor.id],
        )
    )
    db.add(
        _activity(
            "impact_analysis",
            "Sponsor impact analysis completed",
            "Connected entities are potential impacts and require human assessment.",
            [sponsor.id],
        )
    )
    db.add(
        _activity(
            "recovery_plan_generated",
            "Recovery recommendations generated",
            f"{len(saved_recommendations)} proposals were saved for human review.",
            [sponsor.id],
        )
    )

    try:
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="Could not save the impact analysis."
        ) from error

    recovery_plan["recommendations"] = saved_recommendations
    recovery_plan["requires_human_review"] = True
    return ImpactAnalysisResponse(
        impact_report=impact_report,
        recovery_plan=recovery_plan,
    )


@app.post("/api/investigations/run")
def run_frontend_investigation(
    payload: FrontendInvestigationRequest,
    db: Session = Depends(get_db),
) -> dict[str, list[dict]]:
    result = analyze_sponsor_impact(
        ImpactAnalysisRequest(
            sponsor_id=payload.sponsorId,
            old_value=payload.previousAmount,
            new_value=payload.currentAmount,
        ),
        db,
    )
    recommendations = [
        _recommendation_response(item)
        for item in result.recovery_plan["recommendations"]
    ]
    return {"recommendations": recommendations}


@app.get(
    "/api/approvals",
    response_model=list[RecommendationRead],
    response_model_exclude_none=True,
)
def list_approvals(db: Session = Depends(get_db)) -> list[dict]:
    statement = select(Recommendation).order_by(Recommendation.created_at.desc())
    return [
        _recommendation_response(item)
        for item in db.scalars(statement).all()
    ]


def _decide(
    action_id: str,
    decision: str,
    db: Session,
) -> ApprovalDecisionResponse:
    recommendation = db.get(Recommendation, action_id)
    if recommendation is None:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    if recommendation.status != "pending":
        raise HTTPException(
            status_code=409, detail="This recommendation already has a decision."
        )

    decided_at = utc_now()
    result = db.execute(
        update(Recommendation)
        .where(
            Recommendation.action_id == action_id,
            Recommendation.status == "pending",
        )
        .values(status=decision, decision_at=decided_at)
    )
    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="This recommendation already has a decision."
        )

    db.add(
        ApprovalDecision(
            action_id=action_id,
            decision=decision,
            decided_at=decided_at,
        )
    )
    db.add(
        _activity(
            f"recommendation_{decision}",
            f"Recommendation {decision}",
            "A human recorded a decision. No external action was executed.",
            [recommendation.sponsor_id, action_id],
        )
    )
    try:
        db.commit()
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="Could not save the approval decision."
        ) from error

    return ApprovalDecisionResponse(
        id=action_id,
        status=decision,
        message="Decision recorded; no action was executed.",
    )


@app.post(
    "/api/approvals/{action_id}",
    response_model=ApprovalDecisionResponse,
)
def submit_approval(
    action_id: str,
    payload: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
) -> ApprovalDecisionResponse:
    return _decide(action_id, payload.decision, db)


@app.post(
    "/api/approvals/{action_id}/approve",
    response_model=ApprovalDecisionResponse,
)
def approve_recommendation(
    action_id: str,
    db: Session = Depends(get_db),
) -> ApprovalDecisionResponse:
    return _decide(action_id, "approved", db)


@app.post(
    "/api/approvals/{action_id}/reject",
    response_model=ApprovalDecisionResponse,
)
def reject_recommendation(
    action_id: str,
    db: Session = Depends(get_db),
) -> ApprovalDecisionResponse:
    return _decide(action_id, "rejected", db)


@app.get("/api/activity", response_model=list[ActivityRead])
def list_activity(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ActivityEvent]:
    statement = select(ActivityEvent).order_by(ActivityEvent.created_at.desc()).limit(limit)
    return list(db.scalars(statement).all())
