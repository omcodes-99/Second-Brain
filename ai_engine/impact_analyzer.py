
from collections import deque

import networkx as nx

from ai_engine.schemas import (
    EntityType,
    ImpactItem,
    ImpactReport,
    Severity,
)


def _get_severity(entity_type: str) -> Severity:
    """Assign a transparent default severity by entity type."""

    severity_map = {
        EntityType.BUDGET.value: Severity.HIGH,
        EntityType.APPROVAL.value: Severity.MEDIUM,
        EntityType.DELIVERABLE.value: Severity.MEDIUM,
        EntityType.TASK.value: Severity.MEDIUM,
        EntityType.DEPARTMENT.value: Severity.MEDIUM,
        EntityType.EVENT.value: Severity.HIGH,
        EntityType.SPONSOR.value: Severity.LOW,
    }

    return severity_map.get(entity_type, Severity.LOW)


def analyze_impact(
    graph: nx.DiGraph,
    changed_entity_id: str,
    old_value: float,
    new_value: float,
) -> ImpactReport:
    """
    Find all downstream entities connected to a changed entity.

    Uses breadth-first search to find shortest dependency paths.
    Reports potential impacts, not confirmed real-world consequences.
    """

    if changed_entity_id not in graph:
        raise ValueError(
            f"Changed entity not found in graph: {changed_entity_id}"
        )

    impacts = []
    visited = {changed_entity_id}

    # Each queue entry contains:
    # (current entity ID, path from the changed entity)
    queue = deque([(changed_entity_id, [changed_entity_id])])

    while queue:
        current_id, current_path = queue.popleft()

        for neighbor_id in graph.successors(current_id):
            if neighbor_id in visited:
                continue

            visited.add(neighbor_id)
            new_path = current_path + [neighbor_id]

            node_data = graph.nodes[neighbor_id]
            entity_type = node_data.get("entity_type", "unknown")

            impacts.append(
                ImpactItem(
                    entity_id=neighbor_id,
                    entity_name=node_data.get("name", neighbor_id),
                    severity=_get_severity(entity_type),
                    impact_type="potential_downstream_dependency",
                    reason=(
                        "This entity is connected to the changed entity "
                        "through a recorded dependency path. Its actual "
                        "financial or operational impact requires "
                        "human assessment."
                    ),
                    dependency_path=new_path,
                    is_direct=(len(new_path) == 2),
                    confidence="confirmed_relationship",
                )
            )

            queue.append((neighbor_id, new_path))

    return ImpactReport(
        changed_entity_id=changed_entity_id,
        old_value=old_value,
        new_value=new_value,
        funding_reduction=old_value - new_value,
        currency="INR",
        impacts=impacts,
    )
