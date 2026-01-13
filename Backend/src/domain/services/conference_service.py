# ============================================
# File: Backend/src/domain/services/conference_service.py
# ============================================
"""
Conference Service - Business Logic
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import Conference, Track, User, AuditLogAI
from datetime import datetime
import json


class ConferenceService:
    """Conference management service"""
    
    @staticmethod
    def create_conference(chair_id, name, description, submission_deadline, 
                         review_deadline, start_date=None, end_date=None, 
                         is_blind_review=True):
        """Create a new conference"""
        db = SessionLocal()
        
        try:
            # Verify chair exists
            chair = db.query(User).filter(User.id == chair_id).first()
            if not chair or chair.role not in ['Chair', 'Admin']:
                return None, "Invalid chair or insufficient permissions"
            
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
            
            # Log creation
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
        """Get conference by ID"""
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
    def list_conferences(page=1, per_page=10):
        """List all conferences"""
        db = SessionLocal()
        try:
            offset = (page - 1) * per_page
            
            conferences = db.query(Conference).filter(
                Conference.is_deleted == False
            ).order_by(Conference.created_at.desc()).limit(per_page).offset(offset).all()
            
            total = db.query(Conference).filter(Conference.is_deleted == False).count()
            
            return {
                'conferences': [ConferenceService._serialize_conference(c) for c in conferences],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
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
            if conference.chair_id != user_id and user.role != 'Admin':
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
            if conference.chair_id != user_id and user.role != 'Admin':
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
            if conference.chair_id != user_id and user.role != 'Admin':
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
    def _serialize_conference(conference):
        """Serialize conference object"""
        return {
            'id': conference.id,
            'name': conference.name,
            'description': conference.description,
            'chair_id': conference.chair_id,
            'submission_deadline': conference.submission_deadline.isoformat(),
            'review_deadline': conference.review_deadline.isoformat(),
            'start_date': conference.start_date.isoformat() if conference.start_date else None,
            'end_date': conference.end_date.isoformat() if conference.end_date else None,
            'is_blind_review': conference.is_blind_review,
            'created_at': conference.created_at.isoformat()
        }