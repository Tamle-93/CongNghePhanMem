from fastapi import APIRouter

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.get("/")
def decision_placeholder():
    return {"message": "Decision API placeholder"}
