from flask import Blueprint
from src.api.controllers import auth_controller

api_bp = Blueprint('api', __name__)

# Định nghĩa các routes
api_bp.route('/auth/login', methods=['POST'])(auth_controller.login)
api_bp.route('/auth/register', methods=['POST'])(auth_controller.register)
