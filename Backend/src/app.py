"""
Backend/src/app.py - MANUAL SWAGGER UI
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, render_template_string
from flask_cors import CORS
from flask_mail import Mail

# Import từ config.py
from config import config, get_config

# Import từ settings package
from settings import (
    init_i18n, init_cache, init_rate_limiter
)

mail = Mail()

def create_app(config_name=None):
    """Application Factory"""
    
    if config_name is None:
        config_name = os.getenv('APP_ENV', 'development')
    
    app = Flask(__name__)
    
    # ========================================
    # LOAD CONFIGURATION
    # ========================================
    config_class = config.get(config_name, config['default'])
    app.config.from_object(config_class())
    
    # ========================================
    # EMAIL CONFIGURATION
    # ========================================
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@uth-confms.edu.vn')
    
    mail.init_app(app)
    
    # ========================================
    # INTERNATIONALIZATION (i18n)
    # ========================================
    init_i18n(app)
    print("✅ Internationalization (EN/VN) enabled")
    
    # ========================================
    # CACHING
    # ========================================
    cache = init_cache(app)
    cache_type = app.config.get('CACHE_TYPE', 'simple')
    print(f"✅ Caching enabled: {cache_type}")
    
    # ========================================
    # RATE LIMITING
    # ========================================
    limiter = init_rate_limiter(app)
    print("✅ Rate limiting enabled")
    
    # ========================================
    # CORS CONFIGURATION
    # ========================================
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "Accept-Language"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    print("✅ CORS configured")
    
    # ========================================
    # REGISTER BLUEPRINTS
    # ========================================
    from api.controllers import (
        auth_bp,
        papers_bp,
        assignments_bp,
        conferences_bp,
        reviews_bp,
        decisions_bp,
        users_bp,
        admin_bp
    )
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(papers_bp, url_prefix='/api/v1/papers')
    app.register_blueprint(assignments_bp, url_prefix='/api/v1/assignments')
    app.register_blueprint(conferences_bp, url_prefix='/api/v1/conferences')
    app.register_blueprint(reviews_bp, url_prefix='/api/v1/reviews')
    app.register_blueprint(decisions_bp, url_prefix='/api/v1/decisions')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    
    print("✅ All API blueprints registered")
    
    # ========================================
    # API DOCUMENTATION - MANUAL
    # ========================================
    @app.route('/api/docs')
    def api_docs():
        """Simple API documentation page"""
        
        docs_html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UTH-ConfMS API Documentation</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                }
                .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 8px 8px 0 0;
                }
                .header h1 { font-size: 32px; margin-bottom: 10px; }
                .header p { opacity: 0.9; }
                .content { padding: 30px; }
                .section { margin-bottom: 40px; }
                .section h2 { 
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #667eea;
                }
                .endpoint {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-radius: 4px;
                }
                .endpoint .method {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 12px;
                    margin-right: 10px;
                }
                .method.post { background: #49cc90; color: white; }
                .method.get { background: #61affe; color: white; }
                .method.put { background: #fca130; color: white; }
                .method.delete { background: #f93e3e; color: white; }
                .endpoint .path {
                    font-family: 'Courier New', monospace;
                    font-size: 16px;
                    color: #333;
                }
                .endpoint .description {
                    margin-top: 10px;
                    color: #666;
                    font-size: 14px;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    background: #e3f2fd;
                    color: #1976d2;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-left: 10px;
                }
                .info-box {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .info-box strong { color: #856404; }
                code {
                    background: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    color: #e83e8c;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📚 UTH-ConfMS API Documentation</h1>
                    <p>Conference Management System - REST API v1.0.0</p>
                </div>
                
                <div class="content">
                    <div class="info-box">
                        <strong>🔑 Authentication:</strong> Most endpoints require JWT token. 
                        Add header: <code>Authorization: Bearer {token}</code>
                    </div>
                    
                    <!-- AUTHENTICATION -->
                    <div class="section">
                        <h2>🔐 Authentication</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/auth/register</span>
                            <span class="badge">Public</span>
                            <div class="description">
                                Register new user account
                                <br><strong>Body:</strong> username, password, email, full_name, roles (optional)
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/auth/login</span>
                            <span class="badge">Public</span>
                            <div class="description">
                                Login to get JWT token
                                <br><strong>Body:</strong> username, password
                                <br><strong>Returns:</strong> user info + JWT token
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/auth/me</span>
                            <span class="badge">Protected</span>
                            <div class="description">
                                Get current user information
                            </div>
                        </div>
                    </div>
                    
                    <!-- PAPERS -->
                    <div class="section">
                        <h2>📄 Papers</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/papers</span>
                            <span class="badge">Author</span>
                            <div class="description">
                                Submit a new paper
                                <br><strong>Content-Type:</strong> multipart/form-data
                                <br><strong>Body:</strong> title, abstract, keywords, conference_id, track_id, authors (JSON), file (PDF)
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/papers</span>
                            <span class="badge">Protected</span>
                            <div class="description">
                                List papers with filters
                                <br><strong>Query params:</strong> conference_id, submitter_id, status, page, per_page
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/papers/{paper_id}</span>
                            <span class="badge">Protected</span>
                            <div class="description">
                                Get paper details by ID
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method put">PUT</span>
                            <span class="path">/api/v1/papers/{paper_id}</span>
                            <span class="badge">Author</span>
                            <div class="description">
                                Update paper (before deadline)
                                <br><strong>Body:</strong> title, abstract, keywords, track_id
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/papers/{paper_id}/withdraw</span>
                            <span class="badge">Author</span>
                            <div class="description">
                                Withdraw submitted paper
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/papers/{paper_id}/camera-ready</span>
                            <span class="badge">Author</span>
                            <div class="description">
                                Upload camera-ready version (accepted papers only)
                                <br><strong>Content-Type:</strong> multipart/form-data
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/papers/my-papers</span>
                            <span class="badge">Author</span>
                            <div class="description">
                                Get all papers submitted by current user
                            </div>
                        </div>
                    </div>
                    
                    <!-- CONFERENCES -->
                    <div class="section">
                        <h2>🎓 Conferences</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/conferences</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Create new conference
                                <br><strong>Body:</strong> name, description, submission_deadline, review_deadline, start_date, end_date, is_blind_review
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/conferences</span>
                            <span class="badge">Public</span>
                            <div class="description">
                                List all conferences
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/conferences/{conference_id}</span>
                            <span class="badge">Public</span>
                            <div class="description">
                                Get conference details
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/conferences/{conference_id}/tracks</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Create track for conference
                                <br><strong>Body:</strong> name, code
                            </div>
                        </div>
                    </div>
                    
                    <!-- REVIEWS -->
                    <div class="section">
                        <h2>⭐ Reviews</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/reviews</span>
                            <span class="badge">Reviewer</span>
                            <div class="description">
                                Submit or update review
                                <br><strong>Body:</strong> assignment_id, score (1-10), comments_for_author, confidential_content
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/reviews/my-reviews</span>
                            <span class="badge">Reviewer</span>
                            <div class="description">
                                Get all reviews by current user
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/reviews/paper/{paper_id}</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Get all reviews for a paper
                            </div>
                        </div>
                    </div>
                    
                    <!-- ASSIGNMENTS -->
                    <div class="section">
                        <h2>📋 Assignments</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/assignments</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Manually assign reviewer to paper
                                <br><strong>Body:</strong> conference_id, paper_id, reviewer_id
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/assignments/auto-assign</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Auto-assign reviewers to papers
                                <br><strong>Body:</strong> conference_id, papers_per_reviewer, reviewers_per_paper
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/assignments/my-assignments</span>
                            <span class="badge">Reviewer</span>
                            <div class="description">
                                Get papers assigned to current user
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/assignments/conflict</span>
                            <span class="badge">Reviewer</span>
                            <div class="description">
                                Declare conflict of interest
                                <br><strong>Body:</strong> paper_id, reason
                            </div>
                        </div>
                    </div>
                    
                    <!-- DECISIONS -->
                    <div class="section">
                        <h2>✅ Decisions</h2>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/decisions</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Make decision on paper
                                <br><strong>Body:</strong> paper_id, result (Accept/Reject/Revision), final_comment
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/decisions/paper/{paper_id}</span>
                            <span class="badge">Protected</span>
                            <div class="description">
                                Get decision for paper
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/decisions/conference/{conference_id}/notify</span>
                            <span class="badge">Chair/Admin</span>
                            <div class="description">
                                Send bulk notifications to all authors
                            </div>
                        </div>
                    </div>
                    
                    <!-- ADMIN -->
                    <div class="section">
                        <h2>🔧 Admin</h2>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/admin/statistics</span>
                            <span class="badge">Admin</span>
                            <div class="description">
                                Get system-wide statistics
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/v1/admin/users</span>
                            <span class="badge">Admin</span>
                            <div class="description">
                                List all users
                            </div>
                        </div>
                        
                        <div class="endpoint">
                            <span class="method post">POST</span>
                            <span class="path">/api/v1/admin/users</span>
                            <span class="badge">Admin</span>
                            <div class="description">
                                Create new user
                                <br><strong>Body:</strong> username, password, email, full_name, roles
                            </div>
                        </div>
                    </div>
                    
                    <!-- SYSTEM -->
                    <div class="section">
                        <h2>🔍 System</h2>
                        
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/health</span>
                            <span class="badge">Public</span>
                            <div class="description">
                                Health check endpoint - database status, app info
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return render_template_string(docs_html)
    
    print("✅ API Documentation enabled at /api/docs")
    
    # ========================================
    # ROOT ENDPOINT
    # ========================================
    @app.route('/')
    def index():
        return jsonify({
            "status": "success",
            "message": "UTH-ConfMS API is running",
            "version": "1.0.0",
            "environment": config_name,
            "features": {
                "i18n": ["en", "vi"],
                "caching": cache_type,
                "rate_limiting": True,
                "email": bool(app.config.get('MAIL_USERNAME'))
            },
            "database": {
                "type": app.config.get('DB_TYPE', 'unknown'),
                "name": app.config.get('DB_NAME', 'unknown')
            },
            "endpoints": {
                "health": "/health",
                "documentation": "/api/docs",
                "auth": {
                    "register": "POST /api/v1/auth/register",
                    "login": "POST /api/v1/auth/login",
                    "me": "GET /api/v1/auth/me"
                },
                "papers": "GET /api/v1/papers",
                "reviews": "GET /api/v1/reviews/my-reviews",
                "assignments": "GET /api/v1/assignments/my-assignments",
                "admin": "GET /api/v1/admin/statistics"
            }
        }), 200
    
    # ========================================
    # HEALTH CHECK
    # ========================================
    @app.route('/health')
    def health():
        from infrastructure.databases.base import check_connection, get_db_info
        
        db_connected, db_message = check_connection()
        db_info = get_db_info()
        
        status = "healthy" if db_connected else "unhealthy"
        status_code = 200 if db_connected else 503
        
        return jsonify({
            "status": status,
            "environment": config_name,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
            "database": {
                "connected": db_connected,
                "message": db_message,
                "type": db_info.get('type', 'unknown'),
                "name": db_info.get('database', 'unknown')
            },
            "app": {
                "debug": app.config.get('DEBUG', False),
                "port": app.config.get('PORT', 5000)
            },
            "features": {
                "email_configured": bool(app.config.get('MAIL_USERNAME')),
                "caching": app.config.get('CACHE_TYPE', 'simple'),
                "rate_limiting": True,
                "i18n": True
            }
        }), status_code
    
    # ========================================
    # ERROR HANDLERS
    # ========================================
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Endpoint not found",
            "code": 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "code": 500
        }), 500
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "status": "error",
            "message": "Method not allowed",
            "code": 405
        }), 405
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            "status": "error",
            "message": "Rate limit exceeded. Please try again later.",
            "code": 429
        }), 429
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    print(f"\n{'='*70}")
    print(f"🚀 UTH-ConfMS API")
    print(f"{'='*70}")
    print(f"📍 Environment: {app.config.get('APP_ENV')}")
    print(f"🗄️  Database: {app.config.get('DB_TYPE').upper()}")
    print(f"📦 DB Name: {app.config.get('DB_NAME')}")
    print(f"🌐 Server: http://localhost:{app.config.get('PORT')}")
    print(f"📚 API Docs: http://localhost:{app.config.get('PORT')}/api/docs")
    print(f"🌍 Languages: EN, VN")
    print(f"⚡ Caching: {app.config.get('CACHE_TYPE', 'simple')}")
    print(f"🛡️  Rate Limiting: Enabled")
    print(f"🔧 Debug Mode: {app.config.get('DEBUG')}")
    print(f"📧 Email: {app.config.get('MAIL_USERNAME') or 'Not configured'}")
    print(f"{'='*70}\n")
    
    # Check database
    if app.config.get('APP_ENV') == 'development':
        print("📋 Checking database...")
        from infrastructure.databases.base import check_connection
        
        connected, message = check_connection()
        if connected:
            print("✅ Database is accessible!\n")
        else:
            print(f"⚠️  Warning: {message}\n")
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True),
        use_reloader=False
    )