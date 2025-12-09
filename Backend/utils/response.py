# File: response.py
# Team UTH-ConfMS
# File: Backend/utils/response.py
# MỤC ĐÍCH: Thống nhất định dạng JSON trả về cho Frontend

from datetime import datetime

def success_response(data=None, message="Success"):
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "data": data
    }

def error_response(message="Error", code=400, details=None):
    return {
        "status": "error",
        "timestamp": datetime.now().isoformat(),
        "code": code,
        "message": message,
        "details": details
    }