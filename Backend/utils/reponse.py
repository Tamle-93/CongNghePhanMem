# File: Backend/utils/response.py
# MỤC ĐÍCH: Thống nhất định dạng JSON trả về cho Frontend

from datetime import datetime

def success_response(data, message="Thành công"):
    """
    Dùng khi xử lý thành công.
    Output chuẩn:
    {
        "status": "success",
        "timestamp": "2025-12-03T10:00:00",
        "message": "Thành công",
        "data": { ...dữ liệu thật... }
    }
    """
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "data": data
    }

def error_response(message, error_code=400, details=None):
    """
    Dùng khi có lỗi xảy ra.
    Output chuẩn:
    {
        "status": "error",
        "timestamp": "2025-12-03T10:00:00",
        "code": 400,
        "message": "Sai mật khẩu",
        "details": null
    }
    """
    return {
        "status": "error",
        "timestamp": datetime.now().isoformat(),
        "code": error_code,
        "message": message,
        "details": details
    }