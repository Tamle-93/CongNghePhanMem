from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    # Import các models để Flask-Migrate nhận diện
    from src.infrastructure.models import user_model, conference_model, paper_model
