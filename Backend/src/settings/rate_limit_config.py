"""
Backend/src/config/rate_limit_config.py
Rate Limiting Configuration
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=os.getenv('RATE_LIMIT_STORAGE_URI', 'memory://')
)

def init_rate_limiter(app):
    """Initialize rate limiter"""
    limiter.init_app(app)
    return limiter

# Usage example:
# from config.rate_limit_config import limiter
#
# @app.route('/api/v1/auth/login', methods=['POST'])
# @limiter.limit("5 per minute")  # Max 5 login attempts per minute
# def login():
#     pass