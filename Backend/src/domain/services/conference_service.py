# ============================================
# File: Backend/src/domain/services/conference_service.py
# ============================================
"""
============================================
Conference Service - Business Logic
============================================

MỤC ĐÍCH:
- Quản lý toàn bộ nghiệp vụ liên quan đến Hội nghị (Conference)
- CRUD operations cho conferences
- Quản lý tracks (chủ đề/phân ban) của hội nghị

CHỨC NĂNG CHÍNH:
1. create_conference(): Tạo hội nghị mới
   - Chỉ Chair/Admin mới có quyền tạo
   - Ghi log vào AuditLogAI
   
2. get_conference(): Lấy thông tin hội nghị theo ID
3. list_conferences(): Danh sách tất cả hội nghị (phân trang)
4. update_conference(): Cập nhật thông tin hội nghị
5. delete_conference(): Xóa mềm hội nghị

6. add_track(): Thêm track vào hội nghị
7. get_tracks(): Lấy danh sách tracks
8. update_track(): Cập nhật track
9. delete_track(): Xóa track

RELATIONSHIPS:
- Conference 1-N Paper (một hội nghị có nhiều bài báo)
- Conference 1-N Track (một hội nghị có nhiều chủ đề)
- Conference N-1 User (nhiều hội nghị do 1 chair quản lý)
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import Conference, Track, User, AuditLogAI
from datetime import datetime
import json


class ConferenceService:
    """
    Conference Management Service
    =============================
    Xử lý nghiệp vụ liên quan đến hội nghị khoa học
    """
    
    @staticmethod
    def create_conference(chair_id, name, description, submission_deadline, 
                         review_deadline, start_date=None, end_date=None, 
                         is_blind_review=True):
        """
        Tạo hội nghị mới
        
        PARAMS:
        - chair_id: ID của người tạo (phải có role Chair/Admin)
        - name: Tên hội nghị
        - description: Mô tả
        - submission_deadline: Hạn nộp bài
        - review_deadline: Hạn phản biện
        - start_date: Ngày bắt đầu (optional)
        - end_date: Ngày kết thúc (optional)
        - is_blind_review: Phản biện ẩn danh (default: True)
        
        RETURNS:
        - (conference_dict, None) nếu thành công
        - (None, error_message) nếu thất bại
        """
        db = SessionLocal()
        
        try:
            # Verify chair exists and has permission
            chair = db.query(User).filter(User.id == chair_id).first()
            if not chair or not (chair.has_role('Chair') or chair.has_role('Admin')):
                return None, "Invalid chair or insufficient permissions"
            
            # Create conference object
            conference = Conference(
                chair_id=chair_id,
                name=name,
                description=description,
                submission_deadline=submission_deadline,
                review_deadline=review_deadline,
                start_date=start_date,
                end_date=end_date,
                is_blind_review=is_blind_review
            )
            
            db.add(conference)
            db.commit()
            db.refresh(conference)
            
            # Log creation to audit trail
            AuditLogAI.log(
                db_session=db,
                user_id=chair_id,
                action_type='conference_created',
                table_name='conferences',
                record_id=conference.id,
                data=json.dumps({"name": name})
            )
            
            return ConferenceService._serialize_conference(conference), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_conference(conference_id):
        """
        Lấy thông tin chi tiết hội nghị
        
        PARAMS:
        - conference_id: ID của hội nghị
        
        RETURNS:
        - (conference_dict, None) nếu tìm thấy
        - (None, 'Conference not found') nếu không tìm thấy
        """
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(
                Conference.id == conference_id,
                Conference.is_deleted == False
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            return ConferenceService._serialize_conference(conference), None
        finally:
            db.close()
    
    @staticmethod
    def list_conferences(page=1, per_page=10, only_active=True, chair_id=None):
        """
        Lấy danh sách hội nghị (có phân trang)
        
        PARAMS:
        - page: Số trang (bắt đầu từ 1)
        - per_page: Số item mỗi trang
        - only_active: Nếu True, chỉ show conferences có is_active=True
        - chair_id: Nếu có, chỉ lấy conferences do chair_id này quản lý
        
        RETURNS:
        - { conferences: [...], total, page, per_page }
        """
        db = SessionLocal()
        try:
            from datetime import datetime
            offset = (page - 1) * per_page
            
            # Base query: không deleted
            query = db.query(Conference).filter(Conference.is_deleted == False)
            
            # Filter: chỉ show active conferences nếu only_active=True
            if only_active:
                query = query.filter(Conference.is_active == True)
            
            # Filter: chỉ lấy conferences của chair cụ thể (cho Chair dashboard)
            if chair_id:
                query = query.filter(Conference.chair_id == chair_id)
            
            # Order + pagination
            conferences = query.order_by(Conference.created_at.desc())\
                               .limit(per_page)\
                               .offset(offset)\
                               .all()
            
            total = query.count()
            
            return {
                'conferences': [ConferenceService._serialize_conference(c) for c in conferences],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
        except Exception as e:
            print(f"Error in list_conferences: {str(e)}")
            import traceback
            traceback.print_exc()
            return None, f"Error listing conferences: {str(e)}"
        finally:
            db.close()
    
    @staticmethod
    def update_conference(conference_id, user_id, **updates):
        """Update conference"""
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(
                Conference.id == conference_id,
                Conference.is_deleted == False
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            # Check permission
            user = db.query(User).filter(User.id == user_id).first()
            if conference.chair_id != user_id and 'Admin' not in user.roles:
                return None, "Permission denied"
            
            # Update fields
            for key, value in updates.items():
                if hasattr(conference, key):
                    setattr(conference, key, value)
            
            db.commit()
            db.refresh(conference)
            
            return ConferenceService._serialize_conference(conference), None
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def delete_conference(conference_id, user_id):
        """Soft delete conference"""
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            
            if not conference:
                return False, "Conference not found"
            
            user = db.query(User).filter(User.id == user_id).first()
            if conference.chair_id != user_id and 'Admin' not in user.roles:
                return False, "Permission denied"
            
            conference.is_deleted = True
            db.commit()
            
            return True, None
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def create_track(conference_id, name, code, user_id):
        """Create a track for conference"""
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            if not conference:
                return None, "Conference not found"
            
            # Check permission
            user = db.query(User).filter(User.id == user_id).first()
            if conference.chair_id != user_id and 'Admin' not in user.roles:
                return None, "Permission denied"
            
            track = Track(
                conference_id=conference_id,
                name=name,
                code=code
            )
            
            db.add(track)
            db.commit()
            db.refresh(track)
            
            return {
                'id': track.id,
                'name': track.name,
                'code': track.code,
                'conference_id': track.conference_id
            }, None
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_conference_tracks(conference_id):
        """Get all tracks for a conference"""
        db = SessionLocal()
        try:
            tracks = db.query(Track).filter(
                Track.conference_id == conference_id,
                Track.is_deleted == False
            ).all()
            
            return [{
                'id': t.id,
                'name': t.name,
                'code': t.code,
                'conference_id': t.conference_id
            } for t in tracks], None
        finally:
            db.close()
    
    @staticmethod
    @staticmethod
    def _serialize_conference(conference):
        """Serialize conference object - BULLETPROOF"""
        try:
            result = {}
            
            # Basic fields
            result['id'] = getattr(conference, 'id', None)
            result['name'] = getattr(conference, 'name', 'Untitled')
            result['description'] = getattr(conference, 'description', None)
            result['location'] = getattr(conference, 'location', None)
            result['website_url'] = getattr(conference, 'website_url', None)
            result['chair_id'] = getattr(conference, 'chair_id', None)
            
            # Datetime fields - safe conversion
            def safe_iso(dt):
                try:
                    return dt.isoformat() if dt else None
                except:
                    return str(dt) if dt else None
            
            result['submission_deadline'] = safe_iso(getattr(conference, 'submission_deadline', None))
            result['review_deadline'] = safe_iso(getattr(conference, 'review_deadline', None))
            result['decision_deadline'] = safe_iso(getattr(conference, 'decision_deadline', None))
            result['camera_ready_deadline'] = safe_iso(getattr(conference, 'camera_ready_deadline', None))
            result['registration_deadline'] = safe_iso(getattr(conference, 'registration_deadline', None))
            result['conference_start_date'] = safe_iso(getattr(conference, 'conference_start_date', None))
            result['conference_end_date'] = safe_iso(getattr(conference, 'conference_end_date', None))
            result['created_at'] = safe_iso(getattr(conference, 'created_at', None))
            result['updated_at'] = safe_iso(getattr(conference, 'updated_at', None))
            
            # Boolean/Enum fields
            result['blind_review_type'] = getattr(conference, 'blind_review_type', 'double-blind')
            result['is_active'] = getattr(conference, 'is_active', True)
            result['is_deleted'] = getattr(conference, 'is_deleted', False)
            result['max_reviewers_per_paper'] = getattr(conference, 'max_reviewers_per_paper', 3)
            result['min_reviewers_per_paper'] = getattr(conference, 'min_reviewers_per_paper', 2)
            
            return result
        except Exception as e:
            print(f"Error serializing conference: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return minimal valid response
            return {
                'id': getattr(conference, 'id', 'unknown'),
                'name': getattr(conference, 'name', 'Error'),
                'error': str(e)
            }