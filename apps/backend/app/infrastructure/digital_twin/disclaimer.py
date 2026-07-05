from __future__ import annotations

from datetime import datetime, timezone

from app.domain.digital_twin.entities import ScenarioDisclaimer
from app.domain.digital_twin.interfaces import DisclaimerGenerator


class DefaultDisclaimerGenerator(DisclaimerGenerator):
    async def generate(
        self,
        scenario_type: str,
        inputs: dict,
        assumptions: list[str],
    ) -> ScenarioDisclaimer:
        scenario_name = scenario_type.replace("_", " ").title()

        default_assumptions = [
            "Returns are based on historical averages and Monte Carlo simulation",
            "Inflation adjustments applied annually",
            "Tax implications are not modeled",
            "All projections are pre-tax estimates",
        ]
        all_assumptions = default_assumptions + assumptions

        limitations = [
            "This simulation is for educational and informational purposes only",
            "It does not constitute financial advice or a guarantee of future outcomes",
            "Actual returns may differ significantly from projected values",
            "Market conditions, regulatory changes, and personal circumstances can alter results",
            "Consult a SEBI-registered financial advisor for personalized advice",
        ]

        confidence = (
            "Results are probabilistic estimates based on Monte Carlo simulation. "
            "The model provides a range of possible outcomes with associated confidence intervals. "
            "These should not be interpreted as precise predictions."
        )

        educational = (
            f"The {scenario_name} scenario helps you understand how this specific life event "
            f"or market condition could impact your financial trajectory. Use this information "
            f"to make informed decisions, not to predict the future. Financial planning should "
            f"account for multiple scenarios and be reviewed regularly with a qualified advisor."
        )

        return ScenarioDisclaimer(
            assumptions=all_assumptions,
            inputs_used=inputs,
            limitations=limitations,
            confidence_statement=confidence,
            educational_note=educational,
            generated_at=datetime.now(timezone.utc),
        )
