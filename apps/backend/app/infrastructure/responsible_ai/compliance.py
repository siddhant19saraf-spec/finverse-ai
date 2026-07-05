from __future__ import annotations

from app.domain.responsible_ai.entities import ComplianceCheck
from app.domain.responsible_ai.interfaces import ComplianceEngine


class DefaultComplianceEngine(ComplianceEngine):
    async def check_compliance(self, user_id: int, action: str, context: dict) -> list[ComplianceCheck]:
        checks = []

        kyc = self._check_kyc(context)
        checks.append(kyc)

        sebi = self._check_sebi_compliance(action, context)
        checks.append(sebi)

        data_privacy = self._check_data_privacy(context)
        checks.append(data_privacy)

        suitability = self._check_suitability(context)
        checks.append(suitability)

        disclosure = self._check_disclosure(action)
        checks.append(disclosure)

        return checks

    def _check_kyc(self, context: dict) -> ComplianceCheck:
        kyc_status = context.get("kyc_status", "pending")
        passed = kyc_status == "verified"
        return ComplianceCheck(
            check_name="kyc_verification", regulation="RBI KYC Norms",
            passed=passed,
            details=f"KYC status: {kyc_status}",
            remediation="Complete KYC verification before proceeding" if not passed else None,
        )

    def _check_sebi_compliance(self, action: str, context: dict) -> ComplianceCheck:
        registered_advisor = context.get("registered_advisor", False)
        passed = registered_advisor or action in ("view", "portfolio_summary")
        return ComplianceCheck(
            check_name="sebi_registration", regulation="SEBI (Investment Advisers) Regulations, 2013",
            passed=passed,
            details=f"Advisor registration: {'verified' if registered_advisor else 'not required for this action'}",
            remediation="Register as SEBI Investment Advisor" if not passed else None,
        )

    def _check_data_privacy(self, context: dict) -> ComplianceCheck:
        consent = context.get("data_consent", False)
        passed = consent
        return ComplianceCheck(
            check_name="data_privacy_consent", regulation="DPDP Act 2023",
            passed=passed,
            details=f"Data consent: {'granted' if consent else 'not granted'}",
            remediation="Obtain user consent for data processing" if not passed else None,
        )

    def _check_suitability(self, context: dict) -> ComplianceCheck:
        risk_profile = context.get("risk_profile", "")
        product_risk = context.get("product_risk", "")
        risk_map = {"conservative": 1, "moderate": 2, "aggressive": 3}
        profile_val = risk_map.get(risk_profile, 0)
        product_val = risk_map.get(product_risk, 0)
        passed = product_val <= profile_val if profile_val > 0 else True
        return ComplianceCheck(
            check_name="product_suitability", regulation="SEBI Suitability Norms",
            passed=passed,
            details=f"Product risk '{product_risk}' vs profile '{risk_profile}'",
            remediation="Recommend products matching investor risk profile" if not passed else None,
        )

    def _check_disclosure(self, action: str) -> ComplianceCheck:
        financial_actions = ("invest", "trade", "rebalance")
        needs_disclosure = action in financial_actions
        return ComplianceCheck(
            check_name="risk_disclosure", regulation="SEBI Disclosure Requirements",
            passed=True,
            details=f"Risk disclosure {'required' if needs_disclosure else 'not required'} for '{action}'",
            remediation=None,
        )
