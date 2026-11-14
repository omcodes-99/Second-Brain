
import json

from ai_engine.llm_service import generate_json
from ai_engine.schemas import ImpactReport, RecoveryPlan


def create_recovery_plan(
    impact_report: ImpactReport,
) -> RecoveryPlan:
    """
    Generate recovery recommendations from an impact report.

    Gemini proposes actions only. It does not execute them.
    Every recommendation requires human approval.
    """

    report_data = impact_report.model_dump(mode="json")

    prompt = f"""
You are an event-management recovery planning assistant.

Analyze the following impact report and propose practical
recovery actions for a college event management team.

IMPACT REPORT:
{json.dumps(report_data, indent=2)}

RULES:
1. Use only information contained in the report.
2. Do not invent budgets, available funds, deadlines, or people.
3. Treat every impact as potential, not confirmed damage.
4. Do not claim that any task or deliverable is cancelled.
5. Prefer practical actions such as reviewing allocations,
   contacting the sponsor, reprioritizing deliverables, or
   seeking alternative funding.
6. Every recommendation must require human approval.
7. Do not execute or claim to execute any action.
8. Keep recommendations concise and specific.
9. If information is missing, explicitly say it needs verification.

Return ONLY valid JSON in this exact structure:
{{
  "summary": "Short summary of the situation",
  "recommendations": [
    {{
      "action_id": "action_1",
      "title": "Short action title",
      "description": "What the team should consider doing",
      "affected_entity": "Entity name",
      "priority": "high",
      "reason": "Why this action is suggested",
      "requires_human_approval": true,
      "status": "pending"
    }}
  ],
  "requires_human_review": true
}}

Priority must be one of: low, medium, high.
Return between 2 and 5 recommendations.
"""

    result = generate_json(prompt)

    return RecoveryPlan.model_validate(result)
