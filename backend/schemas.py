from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class SponsorRead(BaseModel):
    id: str
    name: str
    initials: str
    category: str
    previousCommitment: int
    currentCommitment: int
    status: Literal["Active", "Pending", "At risk"]
    contact: str
    committed_funding: int
    currency: str
    updated_at: datetime


class ImpactAnalysisRequest(BaseModel):
    sponsor_id: str = Field(min_length=1, max_length=100)
    old_value: int = Field(ge=0)
    new_value: int = Field(ge=0)


class FrontendInvestigationRequest(BaseModel):
    sponsorId: str = Field(min_length=1, max_length=100)
    previousAmount: int = Field(ge=0)
    currentAmount: int = Field(ge=0)


class GeneratedRecommendation(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1)
    affected_entity: str = Field(min_length=1, max_length=300)
    priority: Literal["low", "medium", "high"]
    reason: str = Field(min_length=1)


class RecommendationRead(BaseModel):
    id: str
    title: str
    explanation: str
    priority: Literal["High", "Medium", "Low"]
    affectedEntities: list[str]
    financialAdjustment: dict[str, Any] | None = None
    status: Literal["pending", "approved", "rejected"]
    createdAt: str


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_type: str
    title: str
    description: str
    entity_ids: list[str]
    created_at: datetime


class ImpactAnalysisResponse(BaseModel):
    impact_report: dict[str, Any]
    recovery_plan: dict[str, Any]


class DashboardResponse(BaseModel):
    totalSponsors: int
    committedFunding: int
    activeTasks: int
    pendingApprovals: int


class ImpactGraphNode(BaseModel):
    id: str
    type: Literal["sponsor", "budget", "department", "task", "deliverable"]
    title: str
    detail: str
    severity: Literal["critical", "high", "medium", "low", "neutral"]
    x: float
    y: float
    sponsorId: str | None = None


class ImpactGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class ImpactGraphData(BaseModel):
    nodes: list[ImpactGraphNode]
    edges: list[ImpactGraphEdge]


class ApprovalDecisionRequest(BaseModel):
    decision: Literal["approved", "rejected"]


class ApprovalDecisionResponse(BaseModel):
    id: str
    status: Literal["approved", "rejected"]
    message: str
