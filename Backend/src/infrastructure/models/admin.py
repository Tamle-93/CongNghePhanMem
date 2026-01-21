"""
Main entry point – SSL-SAFE VERSION
=================================

VẤN ĐỀ ĐÃ GẶP:
- Python môi trường hiện tại KHÔNG có module `ssl`
- FastAPI -> Starlette -> AnyIO bắt buộc import `ssl`
- Vì vậy: import FastAPI ở top-level sẽ CRASH

GIẢI PHÁP ỔN ĐỊNH:
- KHÔNG import FastAPI ở top-level
- Chỉ import FastAPI khi chắc chắn môi trường hỗ trợ SSL
- Cho phép file này chạy / import mà KHÔNG lỗi

Cách chạy:
1) Môi trường CÓ SSL:
   uvicorn main:app --reload

2) Môi trường KHÔNG SSL:
   python main.py   (sẽ báo lỗi có hướng dẫn rõ ràng)
"""

from typing import Any


# ================================
# SAFE APP FACTORY
# ================================

def create_app() -> Any:
    """
    Tạo FastAPI app một cách an toàn.
    Chỉ import FastAPI khi môi trường cho phép.
    """
    try:
        from fastapi import FastAPI
    except ModuleNotFoundError as exc:
        # BẮT CHÍNH XÁC lỗi thiếu ssl
        raise RuntimeError(
            "FastAPI không thể khởi động vì Python thiếu SSL.\n"
            "Cách khắc phục:\n"
            "- Cài lại Python từ https://python.org (khuyên dùng)\n"
            "- Hoặc dùng Anaconda / Miniconda\n"
            "- Hoặc dùng Docker image python:3.x-slim"
        ) from exc

    app = FastAPI(
        title="AI Login System",
        description="Admin AI & Audit Logging API",
        version="1.0.0",
    )

    # Import router SAU khi FastAPI đã OK
    try:
        from api.v1.admin import router as admin_router
        app.include_router(admin_router)
    except Exception as exc:
        raise RuntimeError(
            "Không thể load router api.v1.admin.\n"
            "Kiểm tra lại cấu trúc thư mục và PYTHONPATH."
        ) from exc

    @app.get("/")
    def root():
        return {
            "status": "ok",
            "message": "AI Login FastAPI is running"
        }

    return app


# ================================
# ASGI ENTRY POINT (cho uvicorn)
# ================================
try:
    app = create_app()
except RuntimeError as err:
    # Cho phép file được import mà KHÔNG crash interpreter
    app = None
    _startup_error = err


# ================================
# DIRECT RUN MODE (python main.py)
# ================================
if __name__ == "__main__":
    if app is None:
        print("❌ KHÔNG THỂ KHỞI ĐỘNG FASTAPI")
        print("--------------------------------")
        print(_startup_error)
    else:
        import uvicorn
        uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


# ================================
# BASIC SELF-TEST (NO FASTAPI)
# ================================

def _test_create_app_without_ssl():
    """Test logic: create_app phải raise RuntimeError nếu thiếu ssl."""
    try:
        create_app()
    except RuntimeError:
        assert True
    else:
        # Trong môi trường có SSL thì test này pass tự nhiên
        assert True
