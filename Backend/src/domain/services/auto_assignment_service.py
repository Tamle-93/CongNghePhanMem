"""
Backend/src/domain/services/auto_assignment_service.py
Auto-Assignment Algorithm - Reviewer-Paper Matching with COI Enforcement
"""
from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Assignment, Paper, User, Conference, ConflictOfInterest, Track,
    AuditLog, FeatureFlag
)
from sqlalchemy import func
import json
from datetime import datetime

class AutoAssignmentService:
    """
    Automatic reviewer assignment based on:
    1. Topic/Track matching
    2. Keyword similarity
    3. Load balancing (equal distribution)
    4. COI avoidance
    """
    
    @staticmethod
    def auto_assign_reviewers(conference_id, papers_per_reviewer=3, reviewers_per_paper=3):
        """
        Automatically assign reviewers to papers
        
        Args:
            conference_id: Conference ID
            papers_per_reviewer: Max papers per reviewer (default: 3)
            reviewers_per_paper: Target reviewers per paper (default: 3)
            
        Returns: (assignments, statistics, errors)
        """
        db = SessionLocal()
        
        try:
            # Verify conference
            conference = db.query(Conference).filter(
                Conference.id == conference_id
            ).first()
            
            if not conference:
                return None, None, "Conference not found"
            
            # Get all papers in conference
            papers = db.query(Paper).filter(
                Paper.conference_id == conference_id,
                Paper.is_withdrawn == False
            ).all()
            
            if not papers:
                return None, None, "No papers to assign"
            
            # Get all eligible reviewers (Reviewer + Chair roles)
            from infrastructure.models import UserRole, Role
            
            reviewer_role = db.query(Role).filter(Role.name == 'Reviewer').first()
            chair_role = db.query(Role).filter(Role.name == 'Chair').first()
            
            reviewers = db.query(User).join(UserRole).filter(
                UserRole.role_id.in_([reviewer_role.id, chair_role.id]),
                UserRole.is_active == True,
                User.is_deleted == False
            ).distinct().all()
            
            if not reviewers:
                return None, None, "No reviewers available"
            
            # Get existing assignments
            existing_assignments = db.query(Assignment).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).all()
            
            # Get conflicts
            conflicts = db.query(ConflictOfInterest).filter(
                ConflictOfInterest.conference_id == conference_id
            ).all()
            
            # ✅ BUILD CONFLICT MAP FOR FAST LOOKUP
            conflict_map = {}
            for c in conflicts:
                key = (c.paper_id, c.reviewer_id)
                conflict_map[key] = c.reason  # Store reason for audit logging
            
            print(f"✅ Found {len(conflicts)} conflicts of interest for conference {conference_id}")
            
            # Track reviewer workload
            reviewer_workload = {r.id: 0 for r in reviewers}
            for assign in existing_assignments:
                if assign.reviewer_id in reviewer_workload:
                    reviewer_workload[assign.reviewer_id] += 1
            
            # Track paper assignments
            paper_assignments = {p.id: [] for p in papers}
            for assign in existing_assignments:
                if assign.paper_id in paper_assignments:
                    paper_assignments[assign.paper_id].append(assign.reviewer_id)
            
            # Assignment algorithm
            new_assignments = []
            errors = []
            
            for paper in papers:
                # Skip if already has enough reviewers
                current_count = len(paper_assignments[paper.id])
                if current_count >= reviewers_per_paper:
                    continue
                
                needed = reviewers_per_paper - current_count
                
                # Score each reviewer for this paper
                reviewer_scores = []
                
                for reviewer in reviewers:
                    # Skip if already assigned
                    if reviewer.id in paper_assignments[paper.id]:
                        continue
                    
                    # ✅ SKIP IF CONFLICT OF INTEREST - STRICT ENFORCEMENT
                    if (paper.id, reviewer.id) in conflict_map:
                        # Don't even offer option to assign
                        continue
                    
                    # Skip if author (self-review protection)
                    if paper.submitter_id == reviewer.id:
                        continue
                    
                    # Skip if workload exceeded
                    if reviewer_workload[reviewer.id] >= papers_per_reviewer:
                        continue
                    
                    # Calculate score
                    score = AutoAssignmentService._calculate_match_score(
                        paper, reviewer, db
                    )
                    
                    # Penalize high workload (load balancing)
                    workload_penalty = reviewer_workload[reviewer.id] * 10
                    final_score = score - workload_penalty
                    
                    reviewer_scores.append({
                        'reviewer_id': reviewer.id,
                        'reviewer_name': reviewer.full_name,
                        'score': final_score,
                        'workload': reviewer_workload[reviewer.id]
                    })
                
                # Sort by score (highest first)
                reviewer_scores.sort(key=lambda x: x['score'], reverse=True)
                
                # Assign top N reviewers
                assigned_count = 0
                for item in reviewer_scores[:needed]:
                    try:
                        assignment = Assignment(
                            conference_id=conference_id,
                            paper_id=paper.id,
                            reviewer_id=item['reviewer_id'],
                            is_auto_assigned=True,
                            status='Assigned'
                        )
                        
                        db.add(assignment)
                        new_assignments.append({
                            'paper_id': paper.id,
                            'paper_title': paper.title,
                            'reviewer_id': item['reviewer_id'],
                            'reviewer_name': item['reviewer_name'],
                            'match_score': item['score']
                        })
                        
                        reviewer_workload[item['reviewer_id']] += 1
                        paper_assignments[paper.id].append(item['reviewer_id'])
                        assigned_count += 1
                        
                    except Exception as e:
                        errors.append(f"Error assigning reviewer {item['reviewer_id']} to paper {paper.id}: {str(e)}")
                
                if assigned_count < needed:
                    errors.append(f"Paper {paper.id} ({paper.title}): Only assigned {assigned_count}/{needed} reviewers")
            
            db.commit()
            
            # ✅ LOG AUTO-ASSIGNMENT TO AUDIT
            AuditLog.log_action(
                db_session=db,
                user_id=None,  # System action
                action='AUTO_ASSIGNMENT_RUN',
                entity_type='Conference',
                entity_id=conference_id,
                changes={
                    'new_assignments': len(new_assignments),
                    'total_papers': len(papers),
                    'total_reviewers': len(reviewers),
                    'errors': len(errors)
                },
                status='success' if not errors else 'partial',
                description=f'Auto-assignment completed: {len(new_assignments)} assignments created'
            )
            
            # Statistics
            stats = {
                'total_papers': len(papers),
                'total_reviewers': len(reviewers),
                'new_assignments': len(new_assignments),
                'reviewer_workload': reviewer_workload,
                'papers_fully_assigned': sum(1 for p_id, assigns in paper_assignments.items() if len(assigns) >= reviewers_per_paper),
                'papers_partially_assigned': sum(1 for p_id, assigns in paper_assignments.items() if 0 < len(assigns) < reviewers_per_paper),
                'papers_not_assigned': sum(1 for p_id, assigns in paper_assignments.items() if len(assigns) == 0),
                'conflicts_respected': len(conflicts)
            }
            
            return new_assignments, stats, errors if errors else None
            
        except Exception as e:
            db.rollback()
            return None, None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def _calculate_match_score(paper, reviewer, db):
        """
        Calculate match score between paper and reviewer
        Based on:
        1. Track matching (50 points)
        2. Keyword matching (30 points)
        3. Random baseline (20 points)
        """
        score = 20  # Baseline
        
        # Track matching
        if paper.track_id:
            # Check if reviewer has reviewed papers in same track
            from infrastructure.models import Review
            
            same_track_reviews = db.query(func.count(Review.id)).join(Assignment).join(Paper).filter(
                Assignment.reviewer_id == reviewer.id,
                Paper.track_id == paper.track_id,
                Review.is_deleted == False
            ).scalar()
            
            if same_track_reviews > 0:
                score += 50
        
        # Keyword matching
        if paper.keywords and reviewer.email:  # Simple heuristic
            paper_keywords = set(paper.keywords.lower().split(','))
            
            # Check past reviewed papers' keywords
            past_papers = db.query(Paper).join(Assignment).filter(
                Assignment.reviewer_id == reviewer.id,
                Paper.keywords.isnot(None)
            ).limit(10).all()
            
            reviewer_keywords = set()
            for p in past_papers:
                if p.keywords:
                    reviewer_keywords.update(p.keywords.lower().split(','))
            
            # Calculate overlap
            if reviewer_keywords:
                overlap = len(paper_keywords & reviewer_keywords)
                score += min(overlap * 10, 30)  # Max 30 points
        
        return score
    
    @staticmethod
    def get_assignment_suggestions(paper_id, limit=10):
        """
        Get reviewer suggestions for a specific paper
        
        Returns: List of (reviewer, score) tuples
        """
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            # Get eligible reviewers
            from infrastructure.models import UserRole, Role
            
            reviewer_role = db.query(Role).filter(Role.name == 'Reviewer').first()
            
            reviewers = db.query(User).join(UserRole).filter(
                UserRole.role_id == reviewer_role.id,
                UserRole.is_active == True,
                User.is_deleted == False
            ).all()
            
            # Get conflicts
            conflicts = db.query(ConflictOfInterest).filter(
                ConflictOfInterest.paper_id == paper_id
            ).all()
            
            conflict_ids = {c.reviewer_id for c in conflicts}
            
            # Calculate scores
            suggestions = []
            
            for reviewer in reviewers:
                # Skip if conflict or author
                if reviewer.id in conflict_ids or reviewer.id == paper.submitter_id:
                    continue
                
                score = AutoAssignmentService._calculate_match_score(paper, reviewer, db)
                
                suggestions.append({
                    'reviewer_id': reviewer.id,
                    'reviewer_name': reviewer.full_name,
                    'reviewer_email': reviewer.email,
                    'match_score': score
                })
            
            # Sort by score
            suggestions.sort(key=lambda x: x['match_score'], reverse=True)
            
            return suggestions[:limit], None
            
        finally:
            db.close()