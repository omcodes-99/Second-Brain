import sys
from types import ModuleType

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import backend.main as backend_main
from backend.database import get_db


def _install_ai_stub(monkeypatch, implementation):
    module = ModuleType("ai_engine")
    module.run_impact_investigation = implementation
    monkeypatch.setitem(sys.modules, "ai_engine", module)


def _successful_investigation(**kwargs):
    assert kwargs == {
        "changed_entity_id": "sponsor_abc",
        "old_value": 200000,
        "new_value": 100000,
    }
    return {
        "impact_report": {
            "changed_entity_id": "sponsor_abc",
            "old_value": 200000,
            "new_value": 100000,
            "funding_reduction": 100000,
            "currency": "INR",
            "impacts": [],
        },
        "recovery_plan": {
            "summary": "Review the possible impacts.",
            "recommendations": [
                {
                    "action_id": "model_action_1",
                    "title": "Review marketing allocation",
                    "description": "Review priorities with the event team.",
                    "affected_entity": "Marketing Budget",
                    "priority": "high",
                    "reason": "Funding changed.",
                },
                {
                    "action_id": "model_action_2",
                    "title": "Confirm sponsor commitment",
                    "description": "Confirm the revised commitment.",
                    "affected_entity": "ABC Technologies",
                    "priority": "medium",
                    "reason": "Funding changed.",
                },
            ],
        },
    }


@pytest.fixture
def client(monkeypatch):
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)
    monkeypatch.setattr(backend_main, "engine", test_engine)
    monkeypatch.setattr(backend_main, "SessionLocal", test_session)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    backend_main.app.dependency_overrides[get_db] = override_get_db
    with TestClient(backend_main.app) as test_client:
        yield test_client
    backend_main.app.dependency_overrides.clear()
    test_engine.dispose()


def test_health_and_seeded_sponsor(client):
    assert client.get("/api/health").json() == {"status": "ok"}

    response = client.get("/api/sponsors")
    assert response.status_code == 200
    sponsor = response.json()[0]
    assert sponsor["name"] == "ABC Technologies"
    assert sponsor["previousCommitment"] == 200000
    assert sponsor["currentCommitment"] == 200000
    assert sponsor["status"] == "Active"


def test_frontend_dashboard_and_graph_contract(client):
    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    assert dashboard.json() == {
        "totalSponsors": 1,
        "committedFunding": 200000,
        "activeTasks": 0,
        "pendingApprovals": 0,
    }

    graph = client.get("/api/graph")
    assert graph.status_code == 200
    graph_data = graph.json()
    assert graph_data["nodes"]
    assert graph_data["edges"]
    assert all(
        {"id", "type", "title", "detail", "severity", "x", "y"} <= node.keys()
        for node in graph_data["nodes"]
    )
    assert all(
        value is not None
        for node in graph_data["nodes"]
        for value in node.values()
    )
    assert all(
        {"id", "source", "target"} <= edge.keys()
        for edge in graph_data["edges"]
    )


def test_frontend_investigation_and_approval_contract(client, monkeypatch):
    _install_ai_stub(monkeypatch, _successful_investigation)
    response = client.post(
        "/api/investigations/run",
        json={
            "sponsorId": "sponsor_abc",
            "previousAmount": 200000,
            "currentAmount": 100000,
        },
    )

    assert response.status_code == 200
    recommendations = response.json()["recommendations"]
    assert len(recommendations) == 2
    assert {
        "id",
        "title",
        "explanation",
        "priority",
        "affectedEntities",
        "status",
        "createdAt",
    } <= recommendations[0].keys()
    assert recommendations[0]["priority"] == "High"
    assert recommendations[0]["status"] == "pending"

    approvals = client.get("/api/approvals")
    assert approvals.status_code == 200
    assert approvals.json()[0]["id"] in {
        item["id"] for item in recommendations
    }
    assert "financialAdjustment" not in approvals.json()[0]

    decision = client.post(
        f"/api/approvals/{recommendations[0]['id']}",
        json={"decision": "approved"},
    )
    assert decision.status_code == 200
    assert decision.json()["id"] == recommendations[0]["id"]
    assert decision.json()["status"] == "approved"
    assert set(decision.json()) == {"id", "status", "message"}


def test_impact_saves_recommendations_and_approval_audit(client, monkeypatch):
    _install_ai_stub(monkeypatch, _successful_investigation)
    response = client.post(
        "/api/impact/analyze",
        json={
            "sponsor_id": "sponsor_abc",
            "old_value": 200000,
            "new_value": 100000,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["impact_report"]["funding_reduction"] == 100000
    recommendations = body["recovery_plan"]["recommendations"]
    assert len(recommendations) == 2
    assert all(item["requires_human_approval"] for item in recommendations)
    assert all(item["status"] == "pending" for item in recommendations)

    action_ids = [item["action_id"] for item in recommendations]
    assert action_ids[0] != action_ids[1]
    assert len(client.get("/api/approvals").json()) == 2

    approved = client.post(f"/api/approvals/{action_ids[0]}/approve")
    assert approved.status_code == 200
    assert approved.json()["status"] == "approved"
    assert client.post(f"/api/approvals/{action_ids[0]}/reject").status_code == 409

    rejected = client.post(f"/api/approvals/{action_ids[1]}/reject")
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"

    activity = client.get("/api/activity").json()
    assert {item["event_type"] for item in activity} >= {
        "funding_change",
        "impact_analysis",
        "recovery_plan_generated",
        "recommendation_approved",
        "recommendation_rejected",
    }
    updated_sponsor = client.get("/api/sponsors").json()[0]
    assert updated_sponsor["committed_funding"] == 100000


def test_invalid_and_missing_sponsor_requests(client):
    assert client.post("/api/impact/analyze", json={}).status_code == 422
    response = client.post(
        "/api/impact/analyze",
        json={"sponsor_id": "missing", "old_value": 100, "new_value": 50},
    )
    assert response.status_code == 404


def test_ai_failure_does_not_change_funding_or_activity(client, monkeypatch):
    def fail(**kwargs):
        raise RuntimeError("AI service unavailable")

    _install_ai_stub(monkeypatch, fail)
    response = client.post(
        "/api/impact/analyze",
        json={
            "sponsor_id": "sponsor_abc",
            "old_value": 200000,
            "new_value": 100000,
        },
    )

    assert response.status_code == 502
    assert client.get("/api/sponsors").json()[0]["committed_funding"] == 200000
    assert client.get("/api/activity").json() == []
