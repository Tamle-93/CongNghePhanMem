"""
Backend/src/settings/__init__.py
Settings Package
"""

# from .swagger_config import swagger_template, swagger_config
from .i18n_config import init_i18n, LANGUAGES
from .cache_config import init_cache, cache
from .rate_limit_config import init_rate_limiter, limiter

__all__ = [
    # 'swagger_template',
    # 'swagger_config',
    'init_i18n',
    'LANGUAGES',
    'init_cache',
    'cache',
    'init_rate_limiter',
    'limiter'
]