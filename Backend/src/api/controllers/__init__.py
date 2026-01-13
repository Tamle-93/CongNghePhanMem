# Shared SQLAlchemy Base (infrastructure/models/base.py)
from datetime import datetime
from sqlalchemy.orm import declarative_base

Base = declarative_base()
# infrastructure/models/audit_log_ai_model.py
from sqlalchemy import Column, Integer, String, DateTime, Text

class AuditLogAI(Base):
    __tablename__ = "audit_log_ai"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    actor = Column(String(255), nullable=False)
    target = Column(String(255), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<AuditLogAI action={self.action} actor={self.actor}>"

# infrastructure/models/brow_history_model.py

from sqlalchemy import Column, Integer, String, DateTime

class BrowseHistory(Base):
    __tablename__ = "browse_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    url = Column(String(512), nullable=False)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<BrowseHistory user_id={self.user_id} url={self.url}>"


# infrastructure/models/umcauthres_model.py
from sqlalchemy import Column, Integer, String, Boolean

class UMCAuthResource(Base):
    __tablename__ = "umc_auth_resource"

    id = Column(Integer, primary_key=True, index=True)
    resource_name = Column(String(255), nullable=False)
    permission = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    def __repr__(self) -> str:
        return (
            f"<UMCAuthResource resource={self.resource_name} "
            f"perm={self.permission}>"
        )


# domain/services/ai_service.py

class AIService:
    

    def __init__(self, audit_repo=None):
        self.audit_repo = audit_repo

    def analyze_text(self, text: str) -> dict:
        if not isinstance(text, str):
            raise TypeError("text must be a string")

        result = {
            "length": len(text),
            "summary": text[:100],
        }

        if self.audit_repo is not None:
            self.audit_repo.log(
                action="AI_ANALYZE",
                actor="system",
                detail=text,
            )

        return result

# api/v1/admin.py (PATH-SAFE VERSION)

def create_admin_router():
    """Factory function to create FastAPI router safely."""
    try:
        from fastapi import APIRouter, Depends
    except ModuleNotFoundError as exc:  # pragma: no cover
        raise RuntimeError(
            "FastAPI cannot be imported. "
            "Either SSL is missing or FastAPI is not installed."
        ) from exc

    router = APIRouter(prefix="/admin", tags=["Admin AI"])

    def get_ai_service():
        return AIService()

    @router.post("/ai/analyze")
    def analyze_text(payload: dict, service: AIService = Depends(get_ai_service)):
        text = payload.get("text", "")
        return service.analyze_text(text)

    return router

# tests/test_ai_service.py

def test_analyze_text_basic():
    service = AIService()
    result = service.analyze_text("hello world")

    assert result["length"] == 11
    assert result["summary"] == "hello world"


def test_analyze_text_long_text():
    service = AIService()
    text = "a" * 500
    result = service.analyze_text(text)

    assert result["length"] == 500
    assert result["summary"] == "a" * 100


def test_analyze_text_invalid_type():
    service = AIService()
    try:
        service.analyze_text(123)  # type: ignore
    except TypeError:
        assert True
    else:
        assert False, "TypeError was expected"


def test_ai_service_no_audit_repo():
    service = AIService(audit_repo=None)
    result = service.analyze_text("ok")

    assert result == {"length": 2, "summary": "ok"}

