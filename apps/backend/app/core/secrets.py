from typing import Optional
import os

class SecretsManager:
    """Abstract secrets accessor. Production should implement AWS Secrets Manager or Vault.
    This implementation falls back to environment variables.
    """
    def get(self, key: str) -> Optional[str]:
        return os.environ.get(key)

secrets_manager = SecretsManager()
