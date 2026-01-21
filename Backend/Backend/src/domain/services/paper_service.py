"""
Backend/src/domain/services/paper_service.py
Paper Service - Business Logic for Paper Submission
"""
from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Paper, PaperAuthor, User, Conference, Track,
    AuditLogAI, PaperStatus
)
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import json

class PaperService:
    """Paper management service"""
    
    UPLOAD_FOLDER = 'uploads/papers'
    CAMERA_READY_FOLDER = 'uploads/camera_ready'
    ALLOWED_EXTENSIONS = {'pdf'}
    
    @staticmethod
    def _allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in PaperService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def _save_file(file, paper_id, is_camera_ready=False):
        """Save uploaded file"""
        if file and PaperService._allowed_file(file.filename):
            filename = secure_filename(f"paper_{paper_id}_{file.filename}")
            folder = PaperService.CAMERA_READY_FOLDER if is_camera_ready else PaperService.UPLOAD_FOLDER
            os.makedirs(folder, exist_ok=True)
            filepath = os.path.join(folder, filename)
            file.save(filepath)
            return filepath
        return None
    
    @staticmethod
    def submit_paper(submitter_id, conference_id, title, abstract,
                    keywords, track_id, authors, file):
        """Submit a new paper"""
        db = SessionLocal()
        
        try:
            # Verify conference
            conference = db.query(Conference).filter(
                Conference.id == conference_id,
                Conference.is_deleted == False
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            if datetime.utcnow() > conference.submission_deadline:
                return None, "Submission deadline has passed"
            
            # Verify submitter
            submitter = db.query(User).filter(User.id == submitter_id).first()
            if not submitter:
                return None, "Submitter not found"
            
            # Verify track
            if track_id:
                track = db.query(Track).filter(
                    Track.id == track_id,
                    Track.conference_id == conference_id
                ).first()
                if not track:
                    return None, "Invalid track for this conference"
            
            # Create paper
            paper = Paper(
                title=title,
                abstract=abstract,
                keywords=keywords,
                submitter_id=submitter_id,
                conference_id=conference_id,
                track_id=track_id,
                status=PaperStatus.SUBMITTED,
                pdf_path=""
            )
            
            db.add(paper)
            db.flush()
            
            # Save file
            if file:
                filepath = PaperService._save_file(file, paper.id)
                if not filepath:
                    db.rollback()
                    return None, "Invalid file format. Only PDF allowed"
                paper.pdf_path = filepath
            else:
                db.rollback()
                return None, "PDF file is required"
            
            # Add authors
            for author_data in authors:
                author = PaperAuthor(
                    paper_id=paper.id,
                    user_id=author_data['user_id'],
                    author_order=author_data.get('order', 1),
                    is_corresponding=author_data.get('is_corresponding', False),
                    affiliation=author_data.get('affiliation', '')
                )
                db.add(author)
            
            db.commit()
            db.refresh(paper)
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=submitter_id,
                action_type='paper_submitted',
                table_name='papers',
                record_id=paper.id,
                data=json.dumps({"title": title, "conference_id": conference_id})
            )
            
            return PaperService._serialize_paper(db, paper), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_paper(paper_id, user_id=None):
        """Get paper by ID"""
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            # Access control
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                
                is_submitter = paper.submitter_id == user_id
                is_chair = paper.conference.chair_id == user_id
                is_admin = 'Admin' in user.roles
                
                from infrastructure.models import Assignment
                is_reviewer = db.query(Assignment).filter(
                    Assignment.paper_id == paper_id,
                    Assignment.reviewer_id == user_id
                ).first() is not None
                
                if not (is_submitter or is_chair or is_reviewer or is_admin):
                    return None, "Access denied"
            
            return PaperService._serialize_paper(db, paper), None
            
        finally:
            db.close()
    
    @staticmethod
    def list_papers(conference_id=None, submitter_id=None, status=None, page=1, per_page=10):
        """List papers with filters"""
        db = SessionLocal()
        
        try:
            query = db.query(Paper)
            
            if conference_id:
                query = query.filter(Paper.conference_id == conference_id)
            
            if submitter_id:
                query = query.filter(Paper.submitter_id == submitter_id)
            
            if status:
                query = query.filter(Paper.status == status)
            
            total = query.count()
            
            papers = query.order_by(Paper.created_at.desc())\
                         .limit(per_page)\
                         .offset((page - 1) * per_page)\
                         .all()
            
            return {
                'papers': [PaperService._serialize_paper(db, p) for p in papers],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def update_paper(paper_id, user_id, **updates):
        """Update paper"""
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            # Permission check
            if paper.submitter_id != user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if 'Chair' not in user.roles and 'Admin' not in user.roles:
                    return None, "Permission denied"
            
            # Deadline check
            conference = paper.conference
            if datetime.utcnow() > conference.submission_deadline:
                return None, "Cannot update after deadline"
            
            # Update allowed fields
            allowed_fields = ['title', 'abstract', 'keywords', 'track_id']
            for key, value in updates.items():
                if key in allowed_fields and hasattr(paper, key):
                    setattr(paper, key, value)
            
            db.commit()
            db.refresh(paper)
            
            return PaperService._serialize_paper(db, paper), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def withdraw_paper(paper_id, user_id):
        """Withdraw paper"""
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return False, "Paper not found"
            
            if paper.submitter_id != user_id:
                return False, "Only submitter can withdraw"
            
            if paper.status in [PaperStatus.ACCEPTED, PaperStatus.REJECTED]:
                return False, "Cannot withdraw after decision"
            
            paper.status = PaperStatus.WITHDRAWN
            paper.is_withdrawn = True
            
            db.commit()
            
            return True, None
            
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def upload_camera_ready(paper_id, user_id, file):
        """Upload camera-ready version"""
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            if paper.status != PaperStatus.ACCEPTED:
                return None, "Only accepted papers can upload camera-ready"
            
            if paper.submitter_id != user_id:
                return None, "Only submitter can upload"
            
            filepath = PaperService._save_file(file, paper_id, is_camera_ready=True)
            if not filepath:
                return None, "Invalid file format"
            
            paper.camera_ready_path = filepath
            paper.status = PaperStatus.CAMERA_READY
            
            db.commit()
            db.refresh(paper)
            
            return PaperService._serialize_paper(db, paper), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def _serialize_paper(db, paper):
        """Serialize paper with relations"""
        
        authors = []
        for pa in paper.authors:
            authors.append({
                'user_id': pa.user_id,
                'full_name': pa.author.full_name,
                'email': pa.author.email,
                'order': pa.author_order,
                'is_corresponding': pa.is_corresponding,
                'affiliation': pa.affiliation
            })
        
        return {
            'id': paper.id,
            'title': paper.title,
            'abstract': paper.abstract,
            'keywords': paper.keywords,
            'status': paper.status.value if paper.status else None,
            'is_withdrawn': paper.is_withdrawn,
            'submitter_id': paper.submitter_id,
            'submitter_name': paper.submitter.full_name,
            'conference_id': paper.conference_id,
            'conference_name': paper.conference.name,
            'track_id': paper.track_id,
            'track_name': paper.track.name if paper.track else None,
            'pdf_path': paper.pdf_path,
            'camera_ready_path': paper.camera_ready_path,
            'authors': sorted(authors, key=lambda x: x['order']),
            'created_at': paper.created_at.isoformat(),
            'updated_at': paper.updated_at.isoformat()
        }