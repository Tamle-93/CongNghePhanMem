"""
Backend/src/api/controllers/feature_flags_controller.py
Feature Flags API Routes - Control AI and optional features per conference
"""

from flask import Blueprint, request, jsonify
from infrastructure.databases.base import SessionLocal
from infrastructure.models import FeatureFlag, Conference, AuditLog
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import Schema, fields, ValidationError
import json

feature_flags_bp = Blueprint('feature_flags', __name__)


class FeatureFlagToggleSchema(Schema):
    """Schema for toggling feature flags"""
    enabled = fields.Bool(required=True)
    config = fields.Str()


class FeatureFlagCreateSchema(Schema):
    """Schema for creating feature flags"""
    conference_id = fields.Int(required=True)
    feature_name = fields.Str(required=True)
    enabled = fields.Bool(required=True)
    config = fields.Str()
    description = fields.Str()


toggle_schema = FeatureFlagToggleSchema()
create_schema = FeatureFlagCreateSchema()


@feature_flags_bp.route('/<int:conference_id>', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_conference_flags(conference_id):
    """
    ✅ Get feature flags for a conference
    ---
    tags:
      - Feature Flags
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Feature flags list
    """
    db = SessionLocal()
    
    try:
        # Verify conference exists
        conference = db.query(Conference).filter(Conference.id == conference_id).first()
        if not conference:
            return jsonify({
                'status': 'error',
                'message': 'Conference not found'
            }), 404
        
        flags = db.query(FeatureFlag).filter(
            FeatureFlag.conference_id == conference_id
        ).all()
        
        data = [{
            'id': flag.id,
            'feature_name': flag.feature_name,
            'enabled': flag.enabled,
            'config': json.loads(flag.config) if flag.config else None,
            'description': flag.description,
            'created_at': flag.created_at.isoformat(),
            'updated_at': flag.updated_at.isoformat()
        } for flag in flags]
        
        return jsonify({
            'status': 'success',
            'data': data,
            'conference_id': conference_id,
            'total': len(data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@feature_flags_bp.route('/<int:conference_id>/<feature_name>', methods=['GET'])
@require_auth
def get_feature_flag(conference_id, feature_name):
    """
    ✅ Get a specific feature flag status
    Useful for checking feature availability before exposing UI elements
    ---
    tags:
      - Feature Flags
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
      - name: feature_name
        in: path
        type: string
        required: true
    responses:
      200:
        description: Feature flag status
    """
    db = SessionLocal()
    
    try:
        flag = db.query(FeatureFlag).filter(
            FeatureFlag.conference_id == conference_id,
            FeatureFlag.feature_name == feature_name
        ).first()
        
        if not flag:
            # Default: feature disabled if not found
            return jsonify({
                'status': 'success',
                'data': {
                    'conference_id': conference_id,
                    'feature_name': feature_name,
                    'enabled': False,
                    'config': None
                }
            }), 200
        
        return jsonify({
            'status': 'success',
            'data': {
                'id': flag.id,
                'conference_id': flag.conference_id,
                'feature_name': flag.feature_name,
                'enabled': flag.enabled,
                'config': json.loads(flag.config) if flag.config else None,
                'description': flag.description,
                'created_at': flag.created_at.isoformat(),
                'updated_at': flag.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@feature_flags_bp.route('/<int:conference_id>/<feature_name>', methods=['POST'])
@require_auth
@require_role(['Chair', 'Admin'])
def toggle_feature_flag(conference_id, feature_name):
    """
    ✅ Toggle a feature flag or create new one
    ---
    tags:
      - Feature Flags
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
      - name: feature_name
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - enabled
          properties:
            enabled:
              type: boolean
            config:
              type: string
              description: JSON configuration string
            description:
              type: string
    responses:
      200:
        description: Feature flag toggled successfully
      400:
        description: Validation error
    """
    db = SessionLocal()
    
    try:
        data = toggle_schema.load(request.json)
        
        # Verify conference exists
        conference = db.query(Conference).filter(Conference.id == conference_id).first()
        if not conference:
            return jsonify({
                'status': 'error',
                'message': 'Conference not found'
            }), 404
        
        # Get or create flag
        flag = db.query(FeatureFlag).filter(
            FeatureFlag.conference_id == conference_id,
            FeatureFlag.feature_name == feature_name
        ).first()
        
        if not flag:
            flag = FeatureFlag(
                conference_id=conference_id,
                feature_name=feature_name,
                enabled=data['enabled'],
                config=data.get('config'),
                description=request.json.get('description')
            )
            db.add(flag)
        else:
            flag.enabled = data['enabled']
            if 'config' in data:
                flag.config = data['config']
            if 'description' in request.json:
                flag.description = request.json['description']
        
        db.commit()
        db.refresh(flag)
        
        # Log to audit
        AuditLog.log_action(
            db_session=db,
            user_id=request.current_user['user_id'],
            action='FEATURE_FLAG_TOGGLED',
            entity_type='FeatureFlag',
            entity_id=flag.id,
            changes={
                'feature_name': feature_name,
                'enabled': data['enabled']
            }
        )
        
        return jsonify({
            'status': 'success',
            'message': f'Feature flag "{feature_name}" {"enabled" if data["enabled"] else "disabled"}',
            'data': {
                'id': flag.id,
                'conference_id': flag.conference_id,
                'feature_name': flag.feature_name,
                'enabled': flag.enabled,
                'config': json.loads(flag.config) if flag.config else None,
                'created_at': flag.created_at.isoformat(),
                'updated_at': flag.updated_at.isoformat()
            }
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'status': 'error',
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    except Exception as e:
        db.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@feature_flags_bp.route('/<int:conference_id>', methods=['POST'])
@require_auth
@require_role(['Chair', 'Admin'])
def create_feature_flag(conference_id):
    """
    ✅ Create a new feature flag
    ---
    tags:
      - Feature Flags
    parameters:
      - name: conference_id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - feature_name
            - enabled
          properties:
            feature_name:
              type: string
            enabled:
              type: boolean
            config:
              type: string
            description:
              type: string
    responses:
      201:
        description: Feature flag created successfully
    """
    db = SessionLocal()
    
    try:
        data = create_schema.load(request.json)
        
        # Verify conference
        conference = db.query(Conference).filter(Conference.id == data['conference_id']).first()
        if not conference:
            return jsonify({
                'status': 'error',
                'message': 'Conference not found'
            }), 404
        
        # Check if already exists
        existing = db.query(FeatureFlag).filter(
            FeatureFlag.conference_id == data['conference_id'],
            FeatureFlag.feature_name == data['feature_name']
        ).first()
        
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'Feature flag already exists'
            }), 400
        
        flag = FeatureFlag(
            conference_id=data['conference_id'],
            feature_name=data['feature_name'],
            enabled=data['enabled'],
            config=data.get('config'),
            description=data.get('description')
        )
        db.add(flag)
        db.commit()
        db.refresh(flag)
        
        # Log
        AuditLog.log_action(
            db_session=db,
            user_id=request.current_user['user_id'],
            action='FEATURE_FLAG_CREATED',
            entity_type='FeatureFlag',
            entity_id=flag.id,
            changes={'feature_name': data['feature_name']}
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Feature flag created successfully',
            'data': {
                'id': flag.id,
                'conference_id': flag.conference_id,
                'feature_name': flag.feature_name,
                'enabled': flag.enabled,
                'config': json.loads(flag.config) if flag.config else None,
                'created_at': flag.created_at.isoformat()
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'status': 'error',
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    except Exception as e:
        db.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()
