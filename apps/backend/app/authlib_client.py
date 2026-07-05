from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from app.core.config import settings

# This file provides a thin wrapper for OAuth client setup.
# Configure providers via environment variables using AUTH_<PROVIDER>_CLIENT_ID and _SECRET

config = Config(environ=None)

oauth = OAuth()

# Example: register Google and GitHub when env provided
# Use Settings or env vars to add providers dynamically in production

try:
    if hasattr(settings, 'OAUTH_GOOGLE_CLIENT_ID') and settings.OAUTH_GOOGLE_CLIENT_ID:
        oauth.register(
            name='google',
            client_id=settings.OAUTH_GOOGLE_CLIENT_ID,
            client_secret=settings.OAUTH_GOOGLE_CLIENT_SECRET,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'},
        )
except Exception:
    pass
