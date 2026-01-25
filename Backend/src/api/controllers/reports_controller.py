"""
Backend/src/api/controllers/reports_controller.py
Reports & Statistics API Routes - Conference analytics and metrics
"""

from flask import Blueprint, request, jsonify
from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Paper, Review, Decision, Assignment, Conference, Track,
    PaperStatus, User
)
from domain.utils.auth_utils import require_auth, require_role
from sqlalchemy import func, and_
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/statistics/<int:conference_id>', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_conference_statistics(conference_id):
    """
    ✅ Get comprehensive conference statistics
    ---
    tags:
      - Reports
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Conference statistics
      404:
        description: Conference not found
    """
    db = SessionLocal()
    
    try:
        # Verify conference
        conference = db.query(Conference).filter(Conference.id == conference_id).first()
        if not conference:
            return jsonify({
                'status': 'error',
                'message': 'Conference not found'
            }), 404
        
        # Get papers stats
        total_papers = db.query(Paper).filter(
            Paper.conference_id == conference_id
        ).count()
        
        submitted_papers = db.query(Paper).filter(
            Paper.conference_id == conference_id,
            Paper.status.in_([
                PaperStatus.SUBMITTED, 
                PaperStatus.UNDER_REVIEW,
                PaperStatus.REVIEWED
            ])
        ).count()
        
        accepted_papers = db.query(Paper).filter(
            Paper.conference_id == conference_id,
            Paper.status == PaperStatus.ACCEPTED
        ).count()
        
        rejected_papers = db.query(Paper).filter(
            Paper.conference_id == conference_id,
            Paper.status == PaperStatus.REJECTED
        ).count()
        
        withdrawn_papers = db.query(Paper).filter(
            Paper.conference_id == conference_id,
            Paper.is_withdrawn == True
        ).count()
        
        # Calculate acceptance rate
        acceptance_rate = (accepted_papers / total_papers * 100) if total_papers > 0 else 0
        
        # Get papers by track
        papers_by_track = db.query(
            Track.name,
            func.count(Paper.id).label('count')
        ).join(Paper, Paper.track_id == Track.id).filter(
            Paper.conference_id == conference_id
        ).group_by(Track.name).all()
        
        # Get review stats
        total_reviews = db.query(Review).join(
            Paper, Review.paper_id == Paper.id
        ).filter(Paper.conference_id == conference_id).count()
        
        avg_reviews_per_paper = db.query(
            func.avg(
                db.query(func.count(Review.id)).filter(
                    Review.paper_id == Paper.id
                ).scalar_subquery()
            )
        ).filter(Paper.conference_id == conference_id).scalar() or 0
        
        # Get reviewer stats
        total_reviewers = db.query(User).join(
            Assignment, Assignment.reviewer_id == User.id
        ).filter(
            Assignment.conference_id == conference_id
        ).distinct().count()
        
        # Get assignments stats
        total_assignments = db.query(Assignment).filter(
            Assignment.conference_id == conference_id
        ).count()
        
        auto_assignments = db.query(Assignment).filter(
            Assignment.conference_id == conference_id,
            Assignment.is_auto_assigned == True
        ).count()
        
        # Decision stats
        decisions_made = db.query(Decision).join(
            Paper, Decision.paper_id == Paper.id
        ).filter(Paper.conference_id == conference_id).count()
        
        # Timeline stats
        days_until_deadline = (conference.submission_deadline - datetime.utcnow()).days
        
        return jsonify({
            'status': 'success',
            'data': {
                'conference': {
                    'id': conference.id,
                    'name': conference.name,
                    'submission_deadline': conference.submission_deadline.isoformat(),
                    'days_until_deadline': days_until_deadline
                },
                'papers': {
                    'total': total_papers,
                    'submitted': submitted_papers,
                    'accepted': accepted_papers,
                    'rejected': rejected_papers,
                    'withdrawn': withdrawn_papers,
                    'acceptance_rate_percent': round(acceptance_rate, 2),
                    'by_track': [{
                        'track': track[0],
                        'count': track[1]
                    } for track in papers_by_track]
                },
                'reviews': {
                    'total': total_reviews,
                    'avg_per_paper': round(float(avg_reviews_per_paper), 2)
                },
                'assignments': {
                    'total': total_assignments,
                    'auto_assigned': auto_assignments,
                    'manual_assigned': total_assignments - auto_assignments
                },
                'reviewers': {
                    'total': total_reviewers
                },
                'decisions': {
                    'made': decisions_made,
                    'pending': total_papers - decisions_made
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@reports_bp.route('/timeline/<int:conference_id>', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_conference_timeline(conference_id):
    """
    Get timeline-based statistics (papers submitted over time)
    ---
    tags:
      - Reports
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
      - name: granularity
        in: query
        type: string
        enum: [daily, weekly]
        default: daily
    """
    db = SessionLocal()
    
    try:
        conference = db.query(Conference).filter(Conference.id == conference_id).first()
        if not conference:
            return jsonify({
                'status': 'error',
                'message': 'Conference not found'
            }), 404
        
        # Get all papers with submission dates
        papers = db.query(Paper).filter(
            Paper.conference_id == conference_id
        ).order_by(Paper.created_at).all()
        
        # Aggregate by day
        daily_stats = {}
        for paper in papers:
            day = paper.created_at.date()
            if day not in daily_stats:
                daily_stats[day] = {
                    'total': 0,
                    'submitted': 0,
                    'accepted': 0,
                    'rejected': 0,
                    'withdrawn': 0
                }
            
            daily_stats[day]['total'] += 1
            
            if paper.status == PaperStatus.SUBMITTED:
                daily_stats[day]['submitted'] += 1
            elif paper.status == PaperStatus.ACCEPTED:
                daily_stats[day]['accepted'] += 1
            elif paper.status == PaperStatus.REJECTED:
                daily_stats[day]['rejected'] += 1
            elif paper.is_withdrawn:
                daily_stats[day]['withdrawn'] += 1
        
        timeline = [{
            'date': str(day),
            'stats': stats
        } for day, stats in sorted(daily_stats.items())]
        
        return jsonify({
            'status': 'success',
            'data': {
                'conference_id': conference_id,
                'timeline': timeline,
                'total_days': len(timeline)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@reports_bp.route('/reviewer-workload/<int:conference_id>', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_reviewer_workload(conference_id):
    """
    Get reviewer workload distribution
    ---
    tags:
      - Reports
    """
    db = SessionLocal()
    
    try:
        # Get workload per reviewer
        reviewers_workload = db.query(
            User.id,
            User.full_name,
            User.email,
            func.count(Assignment.id).label('assignment_count')
        ).join(
            Assignment, Assignment.reviewer_id == User.id
        ).filter(
            Assignment.conference_id == conference_id
        ).group_by(User.id, User.full_name, User.email).all()
        
        data = [{
            'reviewer_id': reviewer[0],
            'reviewer_name': reviewer[1],
            'reviewer_email': reviewer[2],
            'assignments': reviewer[3]
        } for reviewer in reviewers_workload]
        
        # Calculate stats
        if data:
            assignment_counts = [r['assignments'] for r in data]
            avg_workload = sum(assignment_counts) / len(assignment_counts)
            max_workload = max(assignment_counts)
            min_workload = min(assignment_counts)
        else:
            avg_workload = max_workload = min_workload = 0
        
        return jsonify({
            'status': 'success',
            'data': {
                'reviewers': sorted(data, key=lambda x: x['assignments'], reverse=True),
                'statistics': {
                    'total_reviewers': len(data),
                    'avg_workload': round(avg_workload, 2),
                    'max_workload': max_workload,
                    'min_workload': min_workload
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()
