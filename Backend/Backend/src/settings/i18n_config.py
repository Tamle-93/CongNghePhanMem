"""
Backend/src/config/i18n_config.py
Internationalization Configuration
"""
from flask_babel import Babel

babel = Babel()

# Supported languages
LANGUAGES = {
    'en': 'English',
    'vi': 'Tiếng Việt'
}

def get_locale():
    """Determine locale from request header or default"""
    from flask import request
    
    # Check Accept-Language header
    return request.accept_languages.best_match(LANGUAGES.keys()) or 'en'

def init_i18n(app):
    """Initialize i18n for the app"""
    app.config['BABEL_DEFAULT_LOCALE'] = 'en'
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'
    
    babel.init_app(app, locale_selector=get_locale)
    
    return babel