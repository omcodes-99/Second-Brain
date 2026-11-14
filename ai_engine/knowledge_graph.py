
import networkx as nx

from ai_engine.schemas import Entity, EntityType, Relationship


def create_event_graph() -> nx.DiGraph:
    """Create an empty directed event dependency graph."""
    return nx.DiGraph()


def add_entity(graph: nx.DiGraph, entity: Entity) -> None:
    """Add an entity to the graph."""
    if entity.id in graph:
        raise ValueError(f"Entity already exists: {entity.id}")

    graph.add_node(
        entity.id,
        id=entity.id,
        name=entity.name,
        entity_type=entity.entity_type.value,
        metadata=entity.metadata,
    )


def add_relationship(
    graph: nx.DiGraph,
    relationship: Relationship,
) -> None:
    """Add a directed relationship between two existing entities."""

    if relationship.source_id not in graph:
        raise ValueError(
            f"Source entity not found: {relationship.source_id}"
        )

    if relationship.target_id not in graph:
        raise ValueError(
            f"Target entity not found: {relationship.target_id}"
        )

    allowed_relationships = {
        "SPONSORS",
        "FUNDS",
        "ALLOCATED_TO",
        "OWNS",
        "DEPENDS_ON",
        "REQUIRES_APPROVAL",
    }

    if relationship.relationship_type not in allowed_relationships:
        raise ValueError(
            f"Unsupported relationship: {relationship.relationship_type}"
        )

    graph.add_edge(
        relationship.source_id,
        relationship.target_id,
        relationship_type=relationship.relationship_type,
    )


def get_graph(graph: nx.DiGraph) -> nx.DiGraph:
    """Return the event dependency graph."""
    return graph


def build_demo_graph() -> nx.DiGraph:
    """
    Build a sample college event graph.

    Sponsor ABC Technologies reduces its commitment
    from INR 200000 to INR 100000.
    """

    graph = create_event_graph()

    entities = [
        Entity(
            id="sponsor_abc",
            name="ABC Technologies",
            entity_type=EntityType.SPONSOR,
            metadata={
                "committed_amount": 200000,
                "currency": "INR",
            },
        ),
        Entity(
            id="event_main",
            name="Annual College Fest",
            entity_type=EntityType.EVENT,
        ),
        Entity(
            id="budget_marketing",
            name="Marketing Budget",
            entity_type=EntityType.BUDGET,
            metadata={"allocated_amount": 50000},
        ),
        Entity(
            id="budget_logistics",
            name="Logistics Budget",
            entity_type=EntityType.BUDGET,
            metadata={"allocated_amount": 50000},
        ),
        Entity(
            id="deliverable_poster",
            name="Promotional Posters",
            entity_type=EntityType.DELIVERABLE,
        ),
        Entity(
            id="deliverable_social",
            name="Social Media Campaign",
            entity_type=EntityType.DELIVERABLE,
        ),
        Entity(
            id="deliverable_banner",
            name="Event Banners",
            entity_type=EntityType.DELIVERABLE,
        ),
        Entity(
            id="approval_purchase",
            name="Purchase Approval",
            entity_type=EntityType.APPROVAL,
            metadata={"requested_amount": 30000},
        ),
    ]

    for entity in entities:
        add_entity(graph, entity)

    relationships = [
        Relationship(
            source_id="sponsor_abc",
            target_id="event_main",
            relationship_type="SPONSORS",
        ),
        Relationship(
            source_id="event_main",
            target_id="budget_marketing",
            relationship_type="ALLOCATED_TO",
        ),
        Relationship(
            source_id="event_main",
            target_id="budget_logistics",
            relationship_type="ALLOCATED_TO",
        ),
        Relationship(
            source_id="budget_marketing",
            target_id="deliverable_poster",
            relationship_type="DEPENDS_ON",
        ),
        Relationship(
            source_id="budget_marketing",
            target_id="deliverable_social",
            relationship_type="DEPENDS_ON",
        ),
        Relationship(
            source_id="budget_marketing",
            target_id="deliverable_banner",
            relationship_type="DEPENDS_ON",
        ),
        Relationship(
            source_id="budget_logistics",
            target_id="approval_purchase",
            relationship_type="REQUIRES_APPROVAL",
        ),
    ]

    for relationship in relationships:
        add_relationship(graph, relationship)

    return graph
