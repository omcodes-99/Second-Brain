
from ai_engine.knowledge_graph import build_demo_graph
from ai_engine.impact_analyzer import analyze_impact
from ai_engine.recovery_planner import create_recovery_plan


def run_impact_investigation(
    changed_entity_id: str,
    old_value: float,
    new_value: float,
    graph=None,
):
    """
    Run deterministic impact analysis and generate
    AI recovery recommendations.

    Returns both the impact report and recovery plan.
    """

    if graph is None:
        graph = build_demo_graph()

    impact_report = analyze_impact(
        graph=graph,
        changed_entity_id=changed_entity_id,
        old_value=old_value,
        new_value=new_value,
    )

    recovery_plan = create_recovery_plan(impact_report)

    return {
        "impact_report": impact_report,
        "recovery_plan": recovery_plan,
    }
