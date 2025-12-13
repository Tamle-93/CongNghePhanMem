from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
from models.paper_model import Paper
from schemas.paper_schema import PaperCreateSchema, PaperUpdateSchema
from services.file_service import save_pdf_file
from database import db
from security import get_current_user
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/papers", tags=["Papers"])

# Nộp bài báo 
@router.post("/create")
async def create_paper(
    title: str = Form(...),
    abstract: str = Form(...),
    conference_id: int = Form(...),
    pdf_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Xử lí dữ liệu
    if pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    saved_path = save_pdf_file(pdf_filetôi)
@router.get("/mine")
async def get_my_papers(current_user: dict = Depends(get_current_user)):
    papers = db.query(Paper).filter(Paper.author_id == current_user["id"]).all()
    return {"papers": papers}

# Xem chi tiết bài báo
@router.get("/{paper_id}")
async def get_paper_detail(
    paper_id: int,
    current_user: dict = Depends(get_current_user)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    if paper.author_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    return {"paper": paper}

# Chỉnh sửa bài báo
@router.put("/update/{paper_id}")
async def update_paper(
    paper_id: int,
    data: PaperUpdateSchema = Depends(),
    pdf_file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    
@router.delete("/delete/{paper_id}")
async def delete_paper(
    paper_id: int,
    current_user: dict = Depends(get_current_user)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    if paper.author_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    db.delete(paper)
    db.commit()

    return {"message": "Paper deleted successfully"}
