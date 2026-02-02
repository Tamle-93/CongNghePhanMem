"""
============================================
Backend/src/domain/services/paper_service.py
Paper Service - Business Logic for Paper Submission
============================================

MỤC ĐÍCH:
- Xử lý nghiệp vụ liên quan đến bài báo khoa học
- Nộp bài, cập nhật, lấy danh sách bài báo
- Quản lý file PDF và tác giả

LUỒNG HOẠT ĐỘNG CHÍNH:
1. submit_paper(): Tác giả nộp bài mới
   - Validate conference còn mở không
   - Lưu file PDF và strip metadata
   - Tạo paper record và paper_authors
   - Ghi audit log

2. get_paper(): Lấy chi tiết 1 bài báo
3. list_papers(): Lấy danh sách bài báo với filter
4. update_paper(): Cập nhật thông tin bài báo
5. submit_revision(): Nộp bản chỉnh sửa

MODELS LIÊN QUAN:
- Paper: Bài báo chính
- PaperAuthor: Danh sách tác giả của bài
- SubmissionVersion: Các phiên bản file đã nộp
- Conference, Track: Hội nghị và phân ban
"""
from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Paper, PaperAuthor, User, Conference, Track,
    AuditLogAI, AuditLog, PaperStatus, SubmissionVersion
)
from domain.utils.pdf_utils import PDFUtils
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import json
import traceback
from flask import abort


class PaperService:
    """
    Paper Management Service
    ========================
    Xử lý toàn bộ nghiệp vụ liên quan đến bài báo khoa học
    
    CONSTANTS:
    - UPLOAD_FOLDER: Thư mục lưu file bài nộp
    - CAMERA_READY_FOLDER: Thư mục lưu bản cuối cùng
    - ALLOWED_EXTENSIONS: Chỉ cho phép file PDF
    """
    
    UPLOAD_FOLDER = 'uploads/papers'
    CAMERA_READY_FOLDER = 'uploads/camera_ready'
    ALLOWED_EXTENSIONS = {'pdf'}
    
    @staticmethod
    def _allowed_file(filename):
        """
        Kiểm tra file có đúng định dạng cho phép không
        
        PARAMS:
        - filename: Tên file cần kiểm tra
        
        RETURNS:
        - True nếu là file PDF, False nếu không
        """
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in PaperService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def _save_file(file, paper_id, is_camera_ready=False):
        """
        Lưu file upload và tạo SubmissionVersion entry
        
        PARAMS:
        - file: File object từ request
        - paper_id: ID của bài báo
        - is_camera_ready: True nếu là bản camera-ready
        
        RETURNS:
        - (filepath, file_size) nếu thành công
        - (None, None) nếu thất bại
        
        PROCESS:
        1. Validate file extension
        2. Generate secure filename
        3. Save to appropriate folder
        4. Strip PDF metadata for privacy (double-blind review)
        5. Return filepath and size
        """
        if file and PaperService._allowed_file(file.filename):
            filename = secure_filename(f"paper_{paper_id}_{file.filename}")
            folder = PaperService.CAMERA_READY_FOLDER if is_camera_ready else PaperService.UPLOAD_FOLDER
            os.makedirs(folder, exist_ok=True)
            filepath = os.path.join(folder, filename)
            file.save(filepath)
            
            # ✅ STRIP PDF METADATA FOR PRIVACY (double-blind review)
            success, result = PDFUtils.strip_metadata(filepath)
            if not success:
                print(f"⚠️  Warning: Could not strip PDF metadata: {result}")
                # Continue anyway, don't fail the upload
            
            # Get file size
            file_size = os.path.getsize(filepath)
            
            return filepath, file_size
        return None, None
    
    @staticmethod
    def submit_paper(submitter_id, conference_id, title, abstract,
                    keywords, track_id, authors, file):
        """
        Nộp bài báo mới
        
        PARAMS:
        - submitter_id: ID người nộp (từ token)
        - conference_id: ID hội nghị
        - title: Tiêu đề bài báo
        - abstract: Tóm tắt
        - keywords: Từ khóa (string, phân cách bởi dấu phẩy)
        - track_id: ID phân ban (optional)
        - authors: List các tác giả [{name, email, order, is_corresponding}]
        - file: File PDF
        
        RETURNS:
        - (paper_dict, None) nếu thành công
        - (None, error_message) nếu thất bại
        
        PROCESS:
        1. Validate conference exists and is active
        2. Check submission deadline
        3. Save PDF file
        4. Create Paper record
        5. Create PaperAuthor records
        6. Create SubmissionVersion record
        7. Log to AuditLogAI
        """
        db = SessionLocal()
        
        try:
            # Verify conference exists and is active
            conference = db.query(Conference).filter(
                Conference.id == conference_id,
                Conference.is_deleted == False
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            # ✅ ENFORCE DEADLINE CHECK IN BACKEND (not just frontend)
            current_time = datetime.utcnow()
            if current_time > conference.submission_deadline:
                # Log this security-relevant action
                db.query(AuditLog).filter(
                    AuditLog.user_id == submitter_id,
                    AuditLog.action == 'SUBMISSION_AFTER_DEADLINE_ATTEMPT'
                ).first()  # Track failed submissions
                return None, "Submission deadline has passed (403 Forbidden)"
            
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
                filepath, file_size = PaperService._save_file(file, paper.id)
                if not filepath:
                    db.rollback()
                    return None, "Invalid file format. Only PDF allowed"
                paper.pdf_path = filepath
            else:
                db.rollback()
                return None, "PDF file is required"
            
            # Add authors
            for author_data in authors:
                # Check if user_id provided, otherwise use guest fields
                user_id = author_data.get('user_id')
                
                # If email provided but no user_id, try to find user by email
                if not user_id and author_data.get('email'):
                    existing_user = db.query(User).filter(
                        User.email == author_data['email']
                    ).first()
                    if existing_user:
                        user_id = existing_user.id
                
                author = PaperAuthor(
                    paper_id=paper.id,
                    user_id=user_id,  # Can be None for guest authors
                    guest_name=author_data.get('name') if not user_id else None,
                    guest_email=author_data.get('email') if not user_id else None,
                    author_order=author_data.get('order', 1),
                    is_corresponding=author_data.get('is_corresponding', False),
                    affiliation=author_data.get('affiliation', '')
                )
                db.add(author)
            
            db.commit()
            db.refresh(paper)
            
            # ✅ CREATE SUBMISSION VERSION ENTRY
            submission_version = SubmissionVersion(
                paper_id=paper.id,
                version=1,
                file_path=filepath,
                file_size=file_size,
                title=title,
                abstract=abstract,
                keywords=keywords,
                created_by=submitter_id,
                change_notes="Initial submission"
            )
            db.add(submission_version)
            db.commit()
            
            # Log to audit
            audit_log = AuditLog(
                user_id=submitter_id,
                action='PAPER_SUBMITTED',
                entity_type='Paper',
                entity_id=paper.id,
                changes={'title': title, 'conference_id': conference_id},
                status='success'
            )
            db.add(audit_log)
            db.commit()
            
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
                
                # Check if user has Chair role (any conference) or is chair_id of this conference
                from infrastructure.models import Conference, UserRole, Role
                conference = db.query(Conference).filter(
                    Conference.id == paper.conference_id
                ).first()
                
                # User có role Chair (global hoặc bất kỳ conference nào)
                has_chair_role = db.query(UserRole).join(Role).filter(
                    UserRole.user_id == user_id,
                    Role.name == 'Chair',
                    UserRole.is_active == True
                ).first() is not None
                
                # Hoặc là chair_id của conference này
                is_conference_chair = conference and conference.chair_id == user_id
                
                is_chair = has_chair_role or is_conference_chair
                
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
            
            print(f"[DEBUG] Found {len(papers)} papers, serializing...")
            
            serialized_papers = []
            for idx, p in enumerate(papers):
                try:
                    print(f"[DEBUG] Serializing paper {idx+1}/{len(papers)}: ID={p.id}")
                    serialized = PaperService._serialize_paper(db, p)
                    serialized_papers.append(serialized)
                except Exception as e:
                    print(f"[ERROR] Failed to serialize paper {p.id}: {str(e)}")
                    print(f"[ERROR] Traceback: {traceback.format_exc()}")
                    # Continue với các papers khác
                    continue
            
            return {
                'papers': serialized_papers,
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        except Exception as e:
            print(f"[ERROR] list_papers exception: {str(e)}")
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def update_paper(paper_id, user_id, file=None, **updates):
        """Update paper - creates new version if file is provided"""
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
            
            # Deadline check - ENFORCE IN BACKEND
            conference = paper.conference
            if datetime.utcnow() > conference.submission_deadline:
                return None, "Cannot update after deadline (403 Forbidden)"
            
            # Update allowed fields
            allowed_fields = ['title', 'abstract', 'keywords', 'track_id']
            changes = {}
            
            for key, value in updates.items():
                if key in allowed_fields and hasattr(paper, key):
                    old_val = getattr(paper, key)
                    setattr(paper, key, value)
                    changes[key] = {'from': old_val, 'to': value}
            
            # If file is provided, create new version
            if file:
                filepath, file_size = PaperService._save_file(file, paper.id)
                if not filepath:
                    db.rollback()
                    return None, "Invalid file format. Only PDF allowed"
                
                # Get latest version
                latest_version = db.query(SubmissionVersion)\
                    .filter(SubmissionVersion.paper_id == paper.id)\
                    .order_by(SubmissionVersion.version.desc())\
                    .first()
                
                new_version_num = (latest_version.version + 1) if latest_version else 1
                
                # Create new version
                submission_version = SubmissionVersion(
                    paper_id=paper.id,
                    version=new_version_num,
                    file_path=filepath,
                    file_size=file_size,
                    title=paper.title,
                    abstract=paper.abstract,
                    keywords=paper.keywords,
                    created_by=user_id,
                    change_notes=updates.get('change_notes', f'Version {new_version_num} update')
                )
                db.add(submission_version)
                paper.pdf_path = filepath
                changes['pdf_path'] = {'version': new_version_num}
            
            db.commit()
            db.refresh(paper)
            
            # Log to audit
            audit_log = AuditLog(
                user_id=user_id,
                action='PAPER_UPDATED',
                entity_type='Paper',
                entity_id=paper.id,
                changes=changes,
                status='success'
            )
            db.add(audit_log)
            db.commit()
            
            return PaperService._serialize_paper(db, paper), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def withdraw_paper(paper_id, user_id):
        """Withdraw paper - with deadline check"""
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return False, "Paper not found"
            
            if paper.submitter_id != user_id:
                return False, "Only submitter can withdraw"
            
            # Check deadline - can withdraw before deadline
            conference = paper.conference
            if datetime.utcnow() > conference.submission_deadline and paper.status != PaperStatus.SUBMITTED:
                return False, "Cannot withdraw after submission deadline"
            
            if paper.status in [PaperStatus.ACCEPTED, PaperStatus.REJECTED]:
                return False, "Cannot withdraw after decision"
            
            paper.status = PaperStatus.WITHDRAWN
            paper.is_withdrawn = True
            
            db.commit()
            
            # Log withdrawal
            audit_log = AuditLog(
                user_id=user_id,
                action='PAPER_WITHDRAWN',
                entity_type='Paper',
                entity_id=paper.id,
                changes={'status': 'withdrawn'},
                status='success'
            )
            db.add(audit_log)
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
                print(f"[ERROR] Paper {paper_id} not found")
                return None, "Paper not found"
            
            print(f"[DEBUG] Paper {paper_id}: status={paper.status}, submitter_id={paper.submitter_id}")
            print(f"[DEBUG] User trying to upload: {user_id}")
            print(f"[DEBUG] Status check: {paper.status} != {PaperStatus.ACCEPTED} = {paper.status != PaperStatus.ACCEPTED}")
            
            if paper.status != PaperStatus.ACCEPTED:
                return None, f"Only accepted papers can upload camera-ready. Current status: {paper.status}"
            
            if paper.submitter_id != user_id:
                return None, f"Only submitter can upload. Paper submitter: {paper.submitter_id}, Current user: {user_id}"
            
            filepath, _ = PaperService._save_file(file, paper_id, is_camera_ready=True)
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
        
        try:
            print(f"[DEBUG] Serializing paper ID={paper.id}, title='{paper.title[:30] if paper.title else 'None'}'")
            
            authors = []
            for pa in paper.authors:
                try:
                    authors.append({
                        'user_id': pa.user_id,
                        'full_name': pa.author.full_name if pa.author else 'Unknown',
                        'email': pa.author.email if pa.author else '',
                        'order': pa.author_order,
                        'is_corresponding': pa.is_corresponding,
                        'affiliation': pa.affiliation
                    })
                except Exception as e:
                    print(f"[ERROR] Error serializing author: {e}")
                    continue
            
            # Try to get status value - lowercase for frontend compatibility
            try:
                raw_status = paper.status.value if hasattr(paper.status, 'value') else str(paper.status) if paper.status else None
                status_value = raw_status.lower() if raw_status else None
                print(f"[DEBUG] Paper status: {raw_status} -> {status_value}")
            except Exception as e:
                print(f"[ERROR] Error getting paper status: {e}")
                status_value = 'unknown'
            
            result = {
                'id': paper.id,
                'title': paper.title,
                'abstract': paper.abstract,
                'keywords': paper.keywords,
                'status': status_value,
                'is_withdrawn': paper.is_withdrawn,
                'submitter_id': paper.submitter_id,
                'submitter_name': paper.submitter.full_name if paper.submitter else 'Unknown',
                'conference_id': paper.conference_id,
                'conference_name': paper.conference.name if paper.conference else 'Unknown',
                'track_id': paper.track_id,
                'track_name': paper.track.name if paper.track else None,
                'pdf_path': paper.pdf_path,
                'camera_ready_path': paper.camera_ready_path,
                'authors': sorted(authors, key=lambda x: x.get('order', 0)),
                'created_at': paper.created_at.isoformat() if paper.created_at else None,
                'updated_at': paper.updated_at.isoformat() if paper.updated_at else None
            }
            
            print(f"[DEBUG] Successfully serialized paper {paper.id}")
            return result
            
        except Exception as e:
            print(f"[ERROR] Critical error serializing paper {paper.id}: {e}")
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            return {
                'id': paper.id if hasattr(paper, 'id') else 0,
                'title': paper.title if hasattr(paper, 'title') else 'Unknown',
                'abstract': paper.abstract if hasattr(paper, 'abstract') else '',
                'keywords': '',
                'status': 'unknown',
                'is_withdrawn': False,
                'submitter_id': paper.submitter_id if hasattr(paper, 'submitter_id') else 0,
                'submitter_name': 'Unknown',
                'conference_id': paper.conference_id if hasattr(paper, 'conference_id') else 0,
                'conference_name': 'Unknown',
                'track_id': None,
                'track_name': None,
                'pdf_path': '',
                'camera_ready_path': '',
                'authors': [],
                'created_at': None,
                'updated_at': None
            }