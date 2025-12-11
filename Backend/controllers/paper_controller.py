from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
from models.paper_model import Paper
from schemas.paper_schema import PaperCreateSchema, PaperUpdateSchema
from services.file_service import save_pdf_file
from database import db
from security import get_current_user
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/papers", tags=["Papers"])

#  CREATE PAPER
@router.post("/create")
async def create_paper(
    title: str = Form(...),
    abstract: str = Form(...),
    conference_id: int = Form(...),
    pdf_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file
    if pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    saved_path = save_pdf_file(pdf_file)

    new_paper = Paper(
        title=title,
        abstract=abstract,
        conference_id=conference_id,
        author_id=current_user["id"],
        pdf_path=saved_path,
        status="submitted"
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return {"message": "Paper submitted successfully", "paper": new_paper}

#  GET MY PAPERS
@router.get("/mine")
async def get_my_papers(current_user: dict = Depends(get_current_user)):
    papers = db.query(Paper).filter(Paper.author_id == current_user["id"]).all()
    return {"papers": papers}

#  GET PAPER DETAIL
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

#  UPDATE PAPER
@router.put("/update/{paper_id}")
async def update_paper(
    paper_id: int,
    data: PaperUpdateSchema = Depends(),
    pdf_file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    if paper.author_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Update metadata
    if data.title:
        paper.title = data.title
    if data.abstract:
        paper.abstract = data.abstract

    # Update file nếu user upload PDF mới
    if pdf_file:
        if pdf_file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be PDF")

        new_path = save_pdf_file(pdf_file)
        paper.pdf_path = new_path

    db.commit()
    db.refresh(paper)

    return {"message": "Paper updated successfully", "paper": paper}

#  DELETE PAPER
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
