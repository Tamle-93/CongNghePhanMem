# Backend/src/domain/services/ai_service.py
"""AI Service for text analysis and spell checking using Google Gemini & OpenAI"""

import json
import os
import re
import requests
from typing import Dict, Tuple

from domain.utils.text_normalization import ALL_CORRECTIONS


class AIService:
    """Service for AI-powered text analysis"""

    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

    @staticmethod
    def check_spelling(text: str, language: str = 'vi') -> Tuple[Dict, str]:
        """
        Check spelling and grammar using Google Gemini or OpenAI (context-aware)
        Priority: Gemini > OpenAI > Fallback Dictionary
        """
        try:
            if AIService.GOOGLE_API_KEY:
                result, error = AIService._check_with_gemini(text, language)
                if result:
                    return result, None

            if AIService.OPENAI_API_KEY:
                result, error = AIService._check_with_openai(text, language)
                if result:
                    return result, None

            return AIService._check_vietnamese_spelling(text)
        except Exception:
            return AIService._check_vietnamese_spelling(text)

    @staticmethod
    def _check_with_gemini(text: str, language: str) -> Tuple[Dict, str]:
        """Use Google Gemini Pro for intelligent spell checking"""
        try:
            lang_name = "tiếng Việt" if language == 'vi' else "English"
            prompt = f"""Bạn là chuyên gia kiểm tra chính tả {lang_name} cho văn bản học thuật. 

NHIỆM VỤ: Phân tích văn bản và tìm TẤT CẢ các lỗi:
- Lỗi chính tả (sai từ, thiếu/sai dấu, viết tắt không chuẩn)
- Lỗi ngữ pháp và cấu trúc câu
- Từ không phù hợp ngữ cảnh (ví dụ: "gái" thay vì "gãy")
- Từ lóng, từ không phù hợp văn viết học thuật
- Lỗi dùng từ đồng âm sai nghĩa

VĂN BẢN CẦN KIỂM TRA:
"{text}"

YÊU CẦU ĐẦU RA: Chỉ trả về JSON thuần túy, KHÔNG có markdown, KHÔNG có giải thích thêm.

Format JSON:
{{
  "errors": [
    {{
      "word": "từ sai trong văn bản",
      "suggestion": "từ đúng cần thay thế",
      "message": "Giải thích ngắn gọn tại sao sai",
      "position": 0
    }}
  ]
}}

Nếu không có lỗi: {{"errors": []}}

BẮT ĐẦU JSON:"""

            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "topK": 20,
                    "topP": 0.8,
                    "maxOutputTokens": 2048
                }
            }

            url = f"{AIService.GEMINI_API_URL}?key={AIService.GOOGLE_API_KEY}"
            response = requests.post(url, json=payload, timeout=20)

            if response.status_code != 200:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                return None, f"Gemini API error: {response.status_code}"

            data = response.json()
            content = data['candidates'][0]['content']['parts'][0]['text'].strip()

            # Clean up response - remove markdown if present
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]

            if '{' in content:
                content = content[content.index('{'):]
            if '}' in content:
                content = content[:content.rindex('}') + 1]

            content = content.strip()
            result_json = json.loads(content)
            errors = result_json.get('errors', [])

            suggestions = []
            for i, error in enumerate(errors[:10]):
                suggestions.append({
                    'word': error.get('word', ''),
                    'suggestion': error.get('suggestion', ''),
                    'message': error.get('message', 'Lỗi chính tả'),
                    'category': 'Gemini AI',
                    'position': error.get('position', i)
                })

            word_count = len(text.split())
            issue_count = len(suggestions)
            score = AIService._calculate_score(issue_count)

            return {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': suggestions,
                'score': score,
                'language': f'{lang_name} (AI)',
                'provider': 'Google Gemini Pro'
            }, None

        except json.JSONDecodeError as e:
            print(f"Gemini JSON parse error: {str(e)}")
            return None, f"JSON parse error: {str(e)}"
        except Exception as e:
            print(f"Gemini error: {str(e)}")
            return None, str(e)

    @staticmethod
    def _check_with_openai(text: str, language: str) -> Tuple[Dict, str]:
        """Use OpenAI GPT-4 for intelligent spell checking"""
        try:
            lang_name = "tiếng Việt" if language == 'vi' else "English"
            prompt = f"""Bạn là chuyên gia kiểm tra chính tả {lang_name}. Phân tích văn bản sau và tìm TẤT CẢ các lỗi:
- Lỗi chính tả (sai từ, thiếu dấu, viết tắt không chuẩn)
- Lỗi ngữ pháp
- Từ không phù hợp ngữ cảnh
- Từ lóng, từ không phù hợp văn viết học thuật

Văn bản: "{text}"

Trả về JSON với format SAU ĐÂY (chỉ trả JSON, không giải thích thêm):
{{
  "errors": [
    {{
      "word": "từ sai",
      "suggestion": "từ đúng", 
      "message": "Lý do sai (ngắn gọn)",
      "position": vị_trí_số
    }}
  ]
}}

Nếu không có lỗi, trả về: {{"errors": []}}"""

            headers = {
                'Authorization': f'Bearer {AIService.OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            }

            payload = {
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are a Vietnamese spell checking expert. Always respond in valid JSON format.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3,
                'max_tokens': 1000
            }

            response = requests.post(
                AIService.OPENAI_API_URL,
                headers=headers,
                json=payload,
                timeout=15
            )

            if response.status_code != 200:
                return None, f"OpenAI API error: {response.status_code}"

            data = response.json()
            content = data['choices'][0]['message']['content'].strip()

            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            content = content.strip()

            result_json = json.loads(content)
            errors = result_json.get('errors', [])

            suggestions = []
            for error in errors[:10]:
                suggestions.append({
                    'word': error.get('word', ''),
                    'suggestion': error.get('suggestion', ''),
                    'message': error.get('message', 'Lỗi chính tả'),
                    'category': 'AI Detection',
                    'position': error.get('position', 0)
                })

            word_count = len(text.split())
            issue_count = len(suggestions)
            score = AIService._calculate_score(issue_count)

            return {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': suggestions,
                'score': score,
                'language': 'Vietnamese (AI)',
                'provider': 'OpenAI GPT-4'
            }, None

        except Exception as e:
            print(f"OpenAI error: {str(e)}")
            return None, str(e)

    @staticmethod
    def _check_vietnamese_spelling(text: str) -> Tuple[Dict, str]:
        """Custom Vietnamese spelling checker with expanded dictionary"""
        try:
            words = text.split()
            word_count = len(words)
            suggestions = []

            for mistake, correct in ALL_CORRECTIONS.items():
                pattern = re.compile(r'\b' + re.escape(mistake) + r'\b', re.IGNORECASE)
                for match in pattern.finditer(text):
                    suggestions.append({
                        'word': match.group(),
                        'suggestion': correct,
                        'message': 'Có thể viết sai chính tả',
                        'category': 'Lỗi chính tả',
                        'position': match.start()
                    })

            # Remove duplicates
            unique_suggestions = []
            seen_words = set()
            for s in suggestions:
                if s['word'].lower() not in seen_words:
                    unique_suggestions.append(s)
                    seen_words.add(s['word'].lower())

            unique_suggestions = unique_suggestions[:10]
            issue_count = len(unique_suggestions)
            score = AIService._calculate_score(issue_count)

            return {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': unique_suggestions,
                'score': score,
                'language': 'Vietnamese'
            }, None

        except Exception as e:
            return None, f"Error: {str(e)}"

    @staticmethod
    def _calculate_score(issue_count: int) -> int:
        """Calculate spelling score based on issue count"""
        if issue_count == 0:
            return 100
        elif issue_count <= 2:
            return 90
        elif issue_count <= 5:
            return 75
        elif issue_count <= 10:
            return 60
        return 50

    @staticmethod
    def analyze_text_quality(text: str) -> Dict:
        """Analyze text quality (readability, complexity, etc.)"""
        try:
            words = text.split()
            word_count = len(words)

            avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
            sentence_count = max(1, text.count('.') + text.count('!') + text.count('?'))
            avg_words_per_sentence = word_count / sentence_count
            complexity = min(100, int((avg_word_length * 10 + avg_words_per_sentence * 2)))

            return {
                'wordCount': word_count,
                'sentenceCount': sentence_count,
                'avgWordLength': round(avg_word_length, 1),
                'avgWordsPerSentence': round(avg_words_per_sentence, 1),
                'complexity': complexity,
                'readability': 'Easy' if complexity < 40 else 'Medium' if complexity < 70 else 'Hard'
            }
        except Exception as e:
            return {'error': str(e)}
