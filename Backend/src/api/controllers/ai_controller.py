"""
Backend/src/api/controllers/ai_controller.py
AI API Routes for spell checking and text analysis
"""
from flask import Blueprint, request, jsonify
from domain.services.ai_service import AIService
from domain.utils.auth_utils import require_auth

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/spell-check', methods=['POST'])
@require_auth
def spell_check():
    """
    Check spelling and grammar
    ---
    POST /api/ai/spell-check
    Headers: Authorization: Bearer <token>
    Body: {
        "text": "string (required)",
        "language": "vi|en|auto (optional, default: vi)"
    }
    
    Response: {
        "status": "success",
        "data": {
            "wordCount": 21,
            "issues": 2,
            "suggestions": [
                {
                    "word": "hong",
                    "suggestion": "không",
                    "message": "Possible spelling mistake",
                    "category": "Misspelling",
                    "position": 45
                }
            ],
            "score": 80,
            "language": "Vietnamese"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Text is required'
            }), 400
        
        text = data.get('text', '').strip()
        language = data.get('language', 'vi')
        
        if not text:
            return jsonify({
                'status': 'error',
                'message': 'Text cannot be empty'
            }), 400
        
        # Check spelling using AI
        result, error = AIService.check_spelling(text, language)
        
        if error:
            return jsonify({
                'status': 'error',
                'message': error
            }), 500
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ai_bp.route('/analyze-text', methods=['POST'])
@require_auth
def analyze_text():
    """
    Analyze text quality
    ---
    POST /api/ai/analyze-text
    Headers: Authorization: Bearer <token>
    Body: {
        "text": "string (required)"
    }
    
    Response: {
        "status": "success",
        "data": {
            "wordCount": 150,
            "sentenceCount": 8,
            "avgWordLength": 5.2,
            "avgWordsPerSentence": 18.7,
            "complexity": 65,
            "readability": "Medium"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Text is required'
            }), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'status': 'error',
                'message': 'Text cannot be empty'
            }), 400
        
        # Analyze text
        result = AIService.analyze_text_quality(text)
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
