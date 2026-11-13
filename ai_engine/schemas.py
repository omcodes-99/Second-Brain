
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EntityType(str, Enum):
    SPONSOR = "sponsor"
    EVENT = "event"
    DEPARTMENT = "department"
    BUDGET = "budget"
    TASK = "task"
    DELIVERABLE = "deliverable"
    APPROVAL = "approval"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Entity(BaseModel):
    id: str
    name: str
    entity_type: EntityType
    metadata: dict = Field(default_factory=dict)


class Relationship(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str


class ImpactItem(BaseModel):
    entity_id: str
    entity_name: str
    severity: Severity
    impact_type: str
    reason: str
    dependency_path: list[str] = Field(default_factory=list)
    is_direct: bool = True
    confidence: str = "confirmed_relationship"


class ImpactReport(BaseModel):
    changed_entity_id: str
    old_value: float
    new_value: float
    funding_reduction: float
    currency: str = "INR"
    impacts: list[ImpactItem] = Field(default_factory=list)


class ActionProposal(BaseModel):
    action_id: str
    title: str
    description: str
    affected_entity: str
    priority: Priority
    reason: str
    requires_human_approval: bool = True
    status: str = "pending"


class RecoveryPlan(BaseModel):
    summary: str
    recommendations: list[ActionProposal] = Field(
        default_factory=list
    )
    requires_human_review: bool = True
