"""
Backend/src/config/rate_limit_config.py
Rate Limiting Configuration
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Disable rate limiting in development
RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'false').lower() == 'true'

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10000 per day", "1000 per hour", "200 per minute"] if RATE_LIMIT_ENABLED else [],
    storage_uri=os.getenv('RATE_LIMIT_STORAGE_URI', 'memory://'),
    enabled=RATE_LIMIT_ENABLED
)

def init_rate_limiter(app):
    """Initialize rate limiter"""
    limiter.init_app(app)
    return limiter

# Usage example:
# from config.rate_limit_config import limiter
#
# @app.route('/api/controllers/auth/login', methods=['POST'])
# @limiter.limit("5 per minute")  # Max 5 login attempts per minute
# def login():
#     pass