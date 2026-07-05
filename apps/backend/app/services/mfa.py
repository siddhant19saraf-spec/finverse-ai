from __future__ import annotations

import pyotp
from typing import List


class MFAService:
    def generate_secret(self) -> str:
        return pyotp.random_base32()

    def get_totp_uri(self, secret: str, account_name: str, issuer_name: str = "FINVERSE AI") -> str:
        return pyotp.totp.TOTP(secret).provisioning_uri(name=account_name, issuer_name=issuer_name)

    def verify_totp(self, secret: str, token: str) -> bool:
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)

    def generate_backup_codes(self, count: int = 8) -> List[str]:
        return [f"{i:02d}-" + pyotp.random_base32(32)[:12] for i in range(count)]

    def verify_backup_code(self, candidate: str, backup_codes: List[str]) -> bool:
        return candidate in backup_codes
