# Backend/src/domain/utils/text_normalization.py
"""
Text Normalization Utilities
- Vietnamese text speak to proper Vietnamese
- Common English spelling mistakes corrections
"""

# Vietnamese text speak & common spelling mistakes
VIETNAMESE_CORRECTIONS = {
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
}

# English common spelling mistakes
ENGLISH_CORRECTIONS = {
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

# Combine all corrections
ALL_CORRECTIONS = {**VIETNAMESE_CORRECTIONS, **ENGLISH_CORRECTIONS}


def get_vietnamese_corrections():
    """Get Vietnamese text speak corrections dictionary"""
    return VIETNAMESE_CORRECTIONS.copy()


def get_english_corrections():
    """Get English spelling corrections dictionary"""
    return ENGLISH_CORRECTIONS.copy()


def get_all_corrections():
    """Get all corrections dictionary (Vietnamese + English)"""
    return ALL_CORRECTIONS.copy()


def normalize_vietnamese(text: str) -> str:
    """
    Normalize Vietnamese text speak to proper Vietnamese
    
    Args:
        text: Text to normalize
        
    Returns:
        Normalized text
    """
    import re
    
    for mistake, correct in VIETNAMESE_CORRECTIONS.items():
        # Use word boundary regex for accurate replacement
        pattern = re.compile(r'\b' + re.escape(mistake) + r'\b', re.IGNORECASE)
        text = pattern.sub(correct, text)
    
    return text


def normalize_english(text: str) -> str:
    """
    Normalize English spelling mistakes
    
    Args:
        text: Text to normalize
        
    Returns:
        Normalized text
    """
    import re
    
    for mistake, correct in ENGLISH_CORRECTIONS.items():
        # Use word boundary regex for accurate replacement
        pattern = re.compile(r'\b' + re.escape(mistake) + r'\b', re.IGNORECASE)
        text = pattern.sub(correct, text)
    
    return text


def normalize_all(text: str) -> str:
    """
    Normalize all text speak and spelling mistakes
    
    Args:
        text: Text to normalize
        
    Returns:
        Normalized text
    """
    import re
    
    for mistake, correct in ALL_CORRECTIONS.items():
        # Use word boundary regex for accurate replacement
        pattern = re.compile(r'\b' + re.escape(mistake) + r'\b', re.IGNORECASE)
        text = pattern.sub(correct, text)
    
    return text
