from decimal import Decimal

from app.domain.compliance.entities import ComplianceRule, Regulation, Severity

SEBI_RULES: list[ComplianceRule] = [
    ComplianceRule(
        rule_id="SEBI-001",
        regulation=Regulation.SEBI,
        category="kyc",
        description="KYC verification must be completed before account activation",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="SEBI-002",
        regulation=Regulation.SEBI,
        category="investment_limit",
        description="Retail investor single-day equity purchase limit",
        severity=Severity.HIGH,
        threshold=Decimal("500000"),
    ),
    ComplianceRule(
        rule_id="SEBI-003",
        regulation=Regulation.SEBI,
        category="disclosure",
        description="Portfolio holdings disclosure for positions above 5% of listed company",
        severity=Severity.MEDIUM,
        threshold=Decimal("0.05"),
    ),
    ComplianceRule(
        rule_id="SEBI-004",
        regulation=Regulation.SEBI,
        category="risk_assessment",
        description="Risk profiling must be completed before recommending derivatives",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="SEBI-005",
        regulation=Regulation.SEBI,
        category="transaction_monitoring",
        description="Suspicious transactions above threshold must be reported",
        severity=Severity.HIGH,
        threshold=Decimal("1000000"),
    ),
]

RBI_RULES: list[ComplianceRule] = [
    ComplianceRule(
        rule_id="RBI-001",
        regulation=Regulation.RBI,
        category="aml",
        description="KYC/AML checks mandatory for all financial transactions",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="RBI-002",
        regulation=Regulation.RBI,
        category="transaction_limit",
        description="NEFT/RTGS transaction limit compliance",
        severity=Severity.HIGH,
        threshold=Decimal("2000000"),
    ),
    ComplianceRule(
        rule_id="RBI-003",
        regulation=Regulation.RBI,
        category="data_localization",
        description="Payment data must be stored within India",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="RBI-004",
        regulation=Regulation.RBI,
        category="fraud_monitoring",
        description="Real-time fraud detection for digital payments",
        severity=Severity.HIGH,
    ),
]

DPDP_RULES: list[ComplianceRule] = [
    ComplianceRule(
        rule_id="DPDP-001",
        regulation=Regulation.DPDP,
        category="consent",
        description="Explicit consent required before processing personal data",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="DPDP-002",
        regulation=Regulation.DPDP,
        category="data_minimization",
        description="Only collect data necessary for the stated purpose",
        severity=Severity.HIGH,
    ),
    ComplianceRule(
        rule_id="DPDP-003",
        regulation=Regulation.DPDP,
        category="breach_notification",
        description="Data breach must be reported to authorities within 72 hours",
        severity=Severity.CRITICAL,
    ),
    ComplianceRule(
        rule_id="DPDP-004",
        regulation=Regulation.DPDP,
        category="right_to_erasure",
        description="Users can request deletion of their personal data",
        severity=Severity.MEDIUM,
    ),
    ComplianceRule(
        rule_id="DPDP-005",
        regulation=Regulation.DPDP,
        category="cross_border_transfer",
        description="Personal data transfer outside India requires adequate protection",
        severity=Severity.HIGH,
    ),
]

ALL_RULES = SEBI_RULES + RBI_RULES + DPDP_RULES
