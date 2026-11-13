
import pytest

from ai_engine.knowledge_graph import build_demo_graph
from ai_engine.impact_analyzer import analyze_impact


def test_funding_reduction():
    graph = build_demo_graph()

    report = analyze_impact(
        graph, "sponsor_abc", 200000, 100000
    )

    assert report.funding_reduction == 100000
    assert len(report.impacts) == 7


def test_direct_and_indirect_impacts():
    graph = build_demo_graph()

    report = analyze_impact(
        graph, "sponsor_abc", 200000, 100000
    )

    impacts = {
        item.entity_id: item for item in report.impacts
    }

    assert impacts["event_main"].is_direct is True
    assert impacts["budget_marketing"].is_direct is False


def test_no_duplicate_impacts_with_cycle():
    graph = build_demo_graph()

    # Add a cycle to check that traversal does not loop forever.
    graph.add_edge("deliverable_poster", "event_main")

    report = analyze_impact(
        graph, "sponsor_abc", 200000, 100000
    )

    impacted_ids = [item.entity_id for item in report.impacts]

    assert len(impacted_ids) == len(set(impacted_ids))
    assert len(impacted_ids) == 7


def test_missing_entity_raises_error():
    graph = build_demo_graph()

    with pytest.raises(ValueError):
        analyze_impact(
            graph, "unknown_sponsor", 200000, 100000
        )


def test_funding_increase():
    graph = build_demo_graph()

    report = analyze_impact(
        graph, "sponsor_abc", 100000, 150000
    )

    assert report.funding_reduction == -50000
