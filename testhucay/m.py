import os

# Tên dự án gốc
PROJECT_NAME = "UTH-ConfMS"

# Cấu trúc thư mục và file
structure = {
    # 1. Cấu hình & Migrations
    "": ["requirements.txt", ".env", "README.md", "setup_project.py"],
    "migrations/scripts": ["run_postgres.sh"],
    
    # 2. Source Code Gốc
    "src": ["config.py", "app.py", "__init__.py"],
    
    # 3. Tầng API (Giao tiếp)
    "src/api": ["routes.py", "middleware.py", "__init__.py"],
    "src/api/controllers": [
        "__init__.py",
        "auth_controller.py",
        "conference_controller.py",
        "paper_controller.py",
        "assignment_controller.py",
        "review_controller.py",
        "ai_controller.py"
    ],
    "src/api/schemas": [
        "__init__.py", 
        "user_schema.py",
        "conference_schema.py",
        "paper_schema.py"
    ],

    # 4. Tầng Infrastructure (Hạ tầng & Database)
    "src/infrastructure": ["__init__.py"],
    "src/infrastructure/databases": ["__init__.py", "postgres.py"],
    "src/infrastructure/models": [
        "__init__.py",
        "base_model.py",
        "user_model.py",
        "conference_model.py",
        "paper_model.py",
        "assignment_model.py",
        "review_model.py",
        "audit_log_model.py"
    ],
    "src/infrastructure/repositories": [
        "__init__.py",
        "user_repo.py",
        "conference_repo.py",
        "paper_repo.py"
    ],
    "src/infrastructure/services": [
        "__init__.py",
        "email_service.py",
        "file_storage_service.py",
        "openai_service.py"
    ],

    # 5. Tầng Domain (Nghiệp vụ cốt lõi)
    "src/domain": ["__init__.py"],
    "src/domain/services": [
        "__init__.py",
        "auth_logic.py",
        "assignment_logic.py",
        "scoring_logic.py"
    ]
}

# Nội dung mẫu cho các file quan trọng (Boilerplate)
file_contents = {
    "requirements.txt": """flask
flask-sqlalchemy
flask-cors
flask-migrate
python-dotenv
psycopg2-binary
marshmallow
openai
""",
    ".env": """FLASK_APP=src/app.py
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/uth_confms
SECRET_KEY=supersecretkey
OPENAI_API_KEY=your_key_here
""",
    "src/config.py": """import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
""",
    "src/infrastructure/databases/postgres.py": """from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    # Import các models để Flask-Migrate nhận diện
    from src.infrastructure.models import user_model, conference_model, paper_model
""",
    "src/infrastructure/models/base_model.py": """from src.infrastructure.databases.postgres import db
from datetime import datetime

class BaseModel(db.Model):
    __abstract__ = True
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
""",
    "src/infrastructure/models/user_model.py": """from src.infrastructure.models.base_model import BaseModel, db

class User(BaseModel):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='author') # admin, chair, reviewer, author
    
    def __repr__(self):
        return f"<User {self.email}>"
""",
    "src/infrastructure/models/conference_model.py": """from src.infrastructure.models.base_model import BaseModel, db

class Conference(BaseModel):
    __tablename__ = 'conferences'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    # Khóa ngoại đến Chair (User)
    chair_id = db.Column(db.Integer, db.ForeignKey('users.id'))
""",
    "src/app.py": """from flask import Flask
from flask_cors import CORS
from src.config import Config
from src.infrastructure.databases.postgres import db, init_db
from src.api.routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Init Plugins
    CORS(app)
    init_db(app)
    
    # Register Blueprints (Routes)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/')
    def health_check():
        return {"status": "success", "message": "UTH-ConfMS API is running!"}, 200
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
""",
    "src/api/routes.py": """from flask import Blueprint
from src.api.controllers import auth_controller

api_bp = Blueprint('api', __name__)

# Định nghĩa các routes
api_bp.route('/auth/login', methods=['POST'])(auth_controller.login)
api_bp.route('/auth/register', methods=['POST'])(auth_controller.register)
""",
    "src/api/controllers/auth_controller.py": """from flask import request, jsonify

def login():
    data = request.json
    # TODO: Gọi Service để check password
    return jsonify({"message": "Login logic here", "token": "fake-jwt-token"}), 200

def register():
    data = request.json
    return jsonify({"message": "Register logic here"}), 201
"""
}

def create_project_structure():
    base_path = os.getcwd() # Tạo ngay tại thư mục hiện tại
    
    print(f"🚀 Đang khởi tạo dự án: {PROJECT_NAME}...")

    # 1. Tạo thư mục
    for folder in structure.keys():
        if folder: # Bỏ qua thư mục gốc rỗng
            path = os.path.join(base_path, folder)
            os.makedirs(path, exist_ok=True)
            print(f"   [Folder] {folder}")

    # 2. Tạo file và ghi nội dung
    for folder, files in structure.items():
        for file in files:
            file_path = os.path.join(base_path, folder, file)
            
            # Kiểm tra xem có nội dung mẫu không
            content = ""
            key_path = f"{folder}/{file}" if folder else file # Key trong dictionary file_contents
            
            if key_path in file_contents:
                content = file_contents[key_path]
            elif file.endswith(".py"):
                # Ghi comment mặc định cho file .py
                content = f"# Module: {file}\n# Created automatically for {PROJECT_NAME}\n"
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"   [File] {os.path.join(folder, file)}")

    print("\n✅ HOÀN TẤT! Cấu trúc dự án đã được tạo thành công.")
    print("👉 Hãy chạy lệnh: pip install -r requirements.txt")
    print("👉 Sau đó chạy thử: python src/app.py")

if __name__ == "__main__":
    create_project_structure()