"""
Backend/src/config/cache_config.py
Redis Caching Configuration
"""
from flask_caching import Cache
import os

cache = Cache()

def init_cache(app):
    """Initialize caching"""
    
    cache_type = os.getenv('CACHE_TYPE', 'simple')  # simple, redis, memcached
    
    if cache_type == 'redis':
        app.config['CACHE_TYPE'] = 'redis'
        app.config['CACHE_REDIS_HOST'] = os.getenv('REDIS_HOST', 'localhost')
        app.config['CACHE_REDIS_PORT'] = int(os.getenv('REDIS_PORT', 6379))
        app.config['CACHE_REDIS_DB'] = int(os.getenv('REDIS_DB', 0))
        app.config['CACHE_REDIS_PASSWORD'] = os.getenv('REDIS_PASSWORD', None)
        app.config['CACHE_DEFAULT_TIMEOUT'] = int(os.getenv('CACHE_TIMEOUT', 300))
    else:
        # Simple in-memory cache for development
        app.config['CACHE_TYPE'] = 'simple'
        app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    
    cache.init_app(app)
    
    return cache

# Usage example:
# from config.cache_config import cache
#
# @cache.cached(timeout=300, key_prefix='all_conferences')
# def get_all_conferences():
#     return db.query(Conference).all()