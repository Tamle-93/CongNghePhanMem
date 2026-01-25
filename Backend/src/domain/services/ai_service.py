# Backend/src/domain/services/ai_service.py
"""
AI Service for text analysis and spell checking using Google Gemini & OpenAI
"""
import requests
import re
import os
from typing import Dict, List, Tuple
import json

class AIService:
    """Service for AI-powered text analysis"""
    
    # API keys (set in environment variable or .env file)
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
    
    @staticmethod
    def check_spelling(text: str, language: str = 'vi') -> Tuple[Dict, str]:
        """
        Check spelling and grammar using Google Gemini or OpenAI (context-aware)
        
        Priority: Gemini > OpenAI > Fallback Dictionary
        
        Args:
            text: Text to check
            language: Language code (vi, en, auto)
            
        Returns:
            (result_dict, error_message)
        """
        try:
            # Try Google Gemini first (best for Vietnamese, free tier available)
            if AIService.GOOGLE_API_KEY:
                result, error = AIService._check_with_gemini(text, language)
                if result:
                    return result, None
            
            # Try OpenAI if Gemini fails
            if AIService.OPENAI_API_KEY:
                result, error = AIService._check_with_openai(text, language)
                if result:
                    return result, None
            
            # Fallback to custom Vietnamese checker
            return AIService._check_vietnamese_spelling(text)
            
        except Exception as e:
            return AIService._check_vietnamese_spelling(text)
    
    @staticmethod
    def _check_with_gemini(text: str, language: str) -> Tuple[Dict, str]:
        """
        Use Google Gemini Pro for intelligent spell checking
        
        Args:
            text: Text to check
            language: Language code
            
        Returns:
            (result_dict, error_message)
        """
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
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.2,
                    "topK": 20,
                    "topP": 0.8,
                    "maxOutputTokens": 2048
                }
            }
            
            url = f"{AIService.GEMINI_API_URL}?key={AIService.GOOGLE_API_KEY}"
            
            response = requests.post(
                url,
                json=payload,
                timeout=20
            )
            
            if response.status_code != 200:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                return None, f"Gemini API error: {response.status_code}"
            
            data = response.json()
            
            # Extract text from Gemini response
            content = data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Clean up response - remove markdown if present
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            # Remove any leading text before JSON
            if '{' in content:
                content = content[content.index('{'):]
            if '}' in content:
                content = content[:content.rindex('}')+1]
            
            content = content.strip()
            
            # Parse JSON
            result_json = json.loads(content)
            errors = result_json.get('errors', [])
            
            # Format suggestions
            suggestions = []
            for i, error in enumerate(errors[:10]):  # Max 10
                suggestions.append({
                    'word': error.get('word', ''),
                    'suggestion': error.get('suggestion', ''),
                    'message': error.get('message', 'Lỗi chính tả'),
                    'category': 'Gemini AI',
                    'position': error.get('position', i)
                })
            
            # Calculate metrics
            word_count = len(text.split())
            issue_count = len(suggestions)
            
            if issue_count == 0:
                score = 100
            elif issue_count <= 2:
                score = 90
            elif issue_count <= 5:
                score = 75
            elif issue_count <= 10:
                score = 60
            else:
                score = 50
            
            result = {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': suggestions,
                'score': score,
                'language': f'{lang_name} (AI)',
                'provider': 'Google Gemini Pro'
            }
            
            return result, None
            
        except json.JSONDecodeError as e:
            print(f"Gemini JSON parse error: {str(e)}, Content: {content[:200]}")
            return None, f"JSON parse error: {str(e)}"
        except Exception as e:
            print(f"Gemini error: {str(e)}")
            return None, str(e)
    
    @staticmethod
    def _check_with_openai(text: str, language: str) -> Tuple[Dict, str]:
        """
        Use OpenAI GPT-4 for intelligent spell checking
        
        Args:
            text: Text to check
            language: Language code
            
        Returns:
            (result_dict, error_message)
        """
        try:
            # Prepare prompt
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
                'model': 'gpt-4o-mini',  # Cheaper, faster model
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
            
            # Parse JSON response
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            content = content.strip()
            
            result_json = json.loads(content)
            errors = result_json.get('errors', [])
            
            # Format suggestions
            suggestions = []
            for error in errors[:10]:  # Max 10
                suggestions.append({
                    'word': error.get('word', ''),
                    'suggestion': error.get('suggestion', ''),
                    'message': error.get('message', 'Lỗi chính tả'),
                    'category': 'AI Detection',
                    'position': error.get('position', 0)
                })
            
            # Calculate metrics
            word_count = len(text.split())
            issue_count = len(suggestions)
            
            if issue_count == 0:
                score = 100
            elif issue_count <= 2:
                score = 90
            elif issue_count <= 5:
                score = 75
            elif issue_count <= 10:
                score = 60
            else:
                score = 50
            
            result = {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': suggestions,
                'score': score,
                'language': 'Vietnamese (AI)',
                'provider': 'OpenAI GPT-4'
            }
            
            return result, None
            
        except Exception as e:
            print(f"OpenAI error: {str(e)}")
            return None, str(e)
    
    @staticmethod
    def _check_vietnamese_spelling(text: str) -> Tuple[Dict, str]:
        """
        Custom Vietnamese spelling checker with expanded dictionary
        
        Args:
            text: Text to check
            
        Returns:
            (result_dict, None)
        """
        try:
            words = text.split()
            word_count = len(words)
            
            # Expanded Vietnamese spelling mistakes dictionary
            mistakes_dict = {
                # Common Vietnamese text speak
                'hong': 'không',
                'ko': 'không',
                'k': 'không',
                'dc': 'được',
                'đc': 'được',
                'tui': 'tôi',
                'mik': 'mình',
                'mk': 'mình',
                'bn': 'bạn',
                'j': 'gì',
                'biet': 'biết',
                'hom': 'hôm',
                'muoi': 'mười',
                'thang': 'tháng',
                'nam': 'năm',
                'nua': 'nữa',
                'tren': 'trên',
                'duoi': 'dưới',
                'ngoai': 'ngoài',
                'trong': 'trong',
                'vao': 'vào',
                'ra': 'ra',
                'len': 'lên',
                'xuong': 'xuống',
                've': 'về',
                'di': 'đi',
                'den': 'đến',
                'cho': 'cho',
                'cua': 'của',
                'voi': 'với',
                'ma': 'mà',
                'nhung': 'nhưng',
                'hay': 'hay',
                'hoac': 'hoặc',
                'neu': 'nếu',
                'thi': 'thì',
                'se': 'sẽ',
                'da': 'đã',
                'dang': 'đang',
                'chua': 'chưa',
                # English common mistakes
                'reserch': 'research',
                'analize': 'analyze',
                'recieve': 'receive',
                'occured': 'occurred',
                'seperate': 'separate',
                'definately': 'definitely',
                'thier': 'their',
                'wierd': 'weird',
                'accross': 'across',
                'alot': 'a lot',
                'untill': 'until',
                'truely': 'truly'
            }
            
            suggestions = []
            text_lower = text.lower()
            
            # Check each word
            for mistake, correct in mistakes_dict.items():
                # Use word boundary regex
                pattern = re.compile(r'\b' + re.escape(mistake) + r'\b', re.IGNORECASE)
                matches = pattern.finditer(text)
                
                for match in matches:
                    suggestions.append({
                        'word': match.group(),
                        'suggestion': correct,
                        'message': f'Có thể viết sai chính tả',
                        'category': 'Lỗi chính tả',
                        'position': match.start()
                    })
            
            # Remove duplicates based on word
            unique_suggestions = []
            seen_words = set()
            for s in suggestions:
                if s['word'].lower() not in seen_words:
                    unique_suggestions.append(s)
                    seen_words.add(s['word'].lower())
            
            # Limit to 10 suggestions
            unique_suggestions = unique_suggestions[:10]
            
            issue_count = len(unique_suggestions)
            
            # Calculate score
            if issue_count == 0:
                score = 100
            elif issue_count <= 2:
                score = 85
            elif issue_count <= 5:
                score = 70
            else:
                score = max(50, 100 - issue_count * 8)
            
            result = {
                'wordCount': word_count,
                'issues': issue_count,
                'suggestions': unique_suggestions,
                'score': score,
                'language': 'Vietnamese'
            }
            
            return result, None
            
        except Exception as e:
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def analyze_text_quality(text: str) -> Dict:
        """
        Analyze text quality (readability, complexity, etc.)
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict with analysis results
        """
        try:
            words = text.split()
            word_count = len(words)
            
            # Calculate average word length
            avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
            
            # Count sentences (rough estimate)
            sentence_count = text.count('.') + text.count('!') + text.count('?')
            sentence_count = max(1, sentence_count)
            
            # Calculate readability score (simple version)
            avg_words_per_sentence = word_count / sentence_count
            
            # Complexity score (0-100)
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
