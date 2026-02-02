# Backend/src/domain/utils/text_normalization.py
# -*- coding: utf-8 -*-
"""
Text Normalization Utilities
- Vietnamese text speak to proper Vietnamese
- Common English spelling mistakes corrections
"""

# Vietnamese text speak & common spelling mistakes
VIETNAMESE_CORRECTIONS = {
    # === PHU DINH / NEGATIVE ===
    'hong': 'khong',
    'ko': 'khong',
    'k': 'khong',
    'hem': 'khong',
    'hok': 'khong',
    'khum': 'khong',
    'kh': 'khong',
    'chx': 'chua',
    'cx': 'cung',
    
    # === DAI TU / PRONOUNS ===
    'tui': 'toi',
    't': 'toi',
    'mik': 'minh',
    'mk': 'minh',
    'm': 'minh',
    'bn': 'ban',
    'b': 'ban',
    'ck': 'chong',
    'vk': 'vo',
    'gf': 'ban gai',
    'bf': 'ban trai',
    'nyc': 'nguoi yeu cu',
    'ny': 'nguoi yeu',
    'ng': 'nguoi',
    'nguoi': 'nguoi',
    'no': 'no',
    
    # === DONG TU / VERBS ===
    'dc': 'duoc',
    'duoc': 'duoc',
    'lm': 'lam',
    'bik': 'biet',
    'biet': 'biet',
    'bit': 'biet',
    'hieu': 'hieu',
    'nghi': 'nghi',
    'ngh': 'nghi',
    'ns': 'noi',
    'noi': 'noi',
    'viet': 'viet',
    'doc': 'doc',
    'thay': 'thay',
    'thik': 'thich',
    'thix': 'thich',
    'yeu': 'yeu',
    'iu': 'yeu',
    'ghet': 'ghet',
    'can': 'can',
    'muon': 'muon',
    'mun': 'muon',
    'phai': 'phai',
    'fai': 'phai',
    'nen': 'nen',
    'gui': 'gui',
    'nhan': 'nhan',
    'tra': 'tra',
    'doi': 'doi',
    'gap': 'gap',
    'roi': 'roi',
    'r': 'roi',
    'xog': 'xong',
    
    # === TINH TU / ADJECTIVES ===
    'dep': 'dep',
    'xau': 'xau',
    'tot': 'tot',
    'hay': 'hay',
    'nhanh': 'nhanh',
    'cham': 'cham',
    'lon': 'lon',
    'nho': 'nho',
    'nhiu': 'nhieu',
    'it': 'it',
    'moi': 'moi',
    'cu': 'cu',
    'tre': 'tre',
    'gia': 'gia',
    'kho': 'kho',
    'de': 'de',
    'vui': 'vui',
    'buon': 'buon',
    'bun': 'buon',
    'chan': 'chan',
    'met': 'met',
    'khoe': 'khoe',
    'bt': 'binh thuong',
    
    # === TRANG TU / ADVERBS ===
    'lun': 'luon',
    'luon': 'luon',
    'thuong': 'thuong',
    'rat': 'rat',
    'qua': 'qua',
    'wa': 'qua',
    'cuc': 'cuc',
    'sieu': 'sieu',
    'het': 'het',
    'con': 'con',
    'nua': 'nua',
    'nx': 'nua',
    'lai': 'lai',
    'cg': 'cung',
    'cung': 'cung',
    
    # === LIEN TU / CONJUNCTIONS ===
    'ma': 'ma',
    'nhung': 'nhung',
    'nh': 'nhung',
    'hoac': 'hoac',
    'hoc': 'hoac',
    'neu': 'neu',
    'thi': 'thi',
    'vi': 'vi',
    'do': 'do',
    'khi': 'khi',
    
    # === GIOI TU / PREPOSITIONS ===
    'o': 'o',
    'tren': 'tren',
    'duoi': 'duoi',
    'ngoai': 'ngoai',
    'trong': 'trong',
    'truoc': 'truoc',
    'sau': 'sau',
    'ben': 'ben',
    'canh': 'canh',
    'giua': 'giua',
    'voi': 'voi',
    'cua': 'cua',
    'tu': 'tu',
    'den': 'den',
    've': 've',
    
    # === CHI HUONG / DIRECTIONS ===
    'vao': 'vao',
    'ra': 'ra',
    'len': 'len',
    'xuong': 'xuong',
    'di': 'di',
    
    # === THOI GIAN / TIME ===
    'hom': 'hom',
    'hnay': 'hom nay',
    'hqua': 'hom qua',
    'ngay': 'ngay',
    'dem': 'dem',
    'sang': 'sang',
    'trua': 'trua',
    'chieu': 'chieu',
    'toi': 'toi',
    'gio': 'gio',
    'h': 'gio',
    'phut': 'phut',
    'giay': 'giay',
    'tuan': 'tuan',
    'thang': 'thang',
    'nam': 'nam',
    'muoi': 'muoi',
    'luc': 'luc',
    'bgio': 'bay gio',
    
    # === CAU HOI / QUESTIONS ===
    'j': 'gi',
    'gi': 'gi',
    'sao': 'sao',
    'nao': 'nao',
    'dau': 'dau',
    'ai': 'ai',
    'tnao': 'the nao',
    
    # === TRANG THAI / STATES ===
    'da': 'da',
    'dang': 'dang',
    'dag': 'dang',
    'chua': 'chua',
    'se': 'se',
    'vua': 'vua',
    
    # === CAM THAN / EXCLAMATIONS ===
    'ok': 'duoc',
    'okie': 'duoc',
    'oke': 'duoc',
    'uk': 'u',
    'uh': 'u',
    'uhm': 'um',
    'ah': 'a',
    'oh': 'o',
    'oi': 'oi',
    'troi': 'troi',
    
    # === VIET TAT PHO BIEN / COMMON ABBREVIATIONS ===
    'vs': 'voi',
    'nc': 'noi chuyen',
    'nt': 'nhan tin',
    'ntn': 'nhu the nao',
    'zui': 'vui',
    'z': 'vay',
    'zay': 'vay',
    'vay': 'vay',
    'ak': 'a',
    'nha': 'nhe',
    'ne': 'ne',
    'hen': 'hen',
    'thui': 'thoi',
    'thoy': 'thoi',
    
    # === HOC THUAT / ACADEMIC ===
    'sv': 'sinh vien',
    'gv': 'giao vien',
    'gs': 'giao su',
    'pgs': 'pho giao su',
    'ts': 'tien si',
    'ths': 'thac si',
    'cn': 'cu nhan',
    'ks': 'ky su',
    'bs': 'bac si',
    'dh': 'dai hoc',
    'cd': 'cao dang',
    'tc': 'trung cap',
    'thpt': 'trung hoc pho thong',
    'thcs': 'trung hoc co so',
    'lv': 'luan van',
    'la': 'luan an',
    'dt': 'de tai',
    'kh': 'khoa hoc',
    'qtkd': 'quan tri kinh doanh',
    'tcnh': 'tai chinh ngan hang',
    
    # === CONG NGHE / TECHNOLOGY ===
    'mt': 'may tinh',
    'pm': 'phan mem',
    'pc': 'phan cung',
    'app': 'ung dung',
    'dl': 'du lieu',
    'httt': 'he thong thong tin',
    'cntt': 'cong nghe thong tin',
    'mmt': 'mang may tinh',
    'csdl': 'co so du lieu',
    'hdh': 'he dieu hanh',
    'lth': 'lap trinh',
    'ml': 'hoc may',
}

# English common spelling mistakes
ENGLISH_CORRECTIONS = {
    # === COMMON MISSPELLINGS ===
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
    'truely': 'truly',
    
    # === ACADEMIC WRITING ===
    'accomodate': 'accommodate',
    'acheive': 'achieve',
    'adress': 'address',
    'agressive': 'aggressive',
    'apparant': 'apparent',
    'arguement': 'argument',
    'begining': 'beginning',
    'beleive': 'believe',
    'buisness': 'business',
    'calender': 'calendar',
    'catagory': 'category',
    'collegue': 'colleague',
    'comittee': 'committee',
    'commitee': 'committee',
    'concensus': 'consensus',
    'consistant': 'consistent',
    'decission': 'decision',
    'dependant': 'dependent',
    'develope': 'develop',
    'diffrent': 'different',
    'disapear': 'disappear',
    'dissapoint': 'disappoint',
    'embarass': 'embarrass',
    'enviroment': 'environment',
    'explaination': 'explanation',
    'familar': 'familiar',
    'finaly': 'finally',
    'foriegn': 'foreign',
    'goverment': 'government',
    'grammer': 'grammar',
    'harrass': 'harass',
    'immediatly': 'immediately',
    'independant': 'independent',
    'inteligence': 'intelligence',
    'knowlege': 'knowledge',
    'liason': 'liaison',
    'libary': 'library',
    'maintenence': 'maintenance',
    'millenium': 'millennium',
    'mispell': 'misspell',
    'neccessary': 'necessary',
    'necesary': 'necessary',
    'noticable': 'noticeable',
    'occassion': 'occasion',
    'occurence': 'occurrence',
    'orignal': 'original',
    'parliment': 'parliament',
    'perseverence': 'perseverance',
    'posession': 'possession',
    'potencial': 'potential',
    'prefered': 'preferred',
    'privelege': 'privilege',
    'proffesional': 'professional',
    'profesional': 'professional',
    'pronounciation': 'pronunciation',
    'publically': 'publicly',
    'questionaire': 'questionnaire',
    'recomend': 'recommend',
    'refered': 'referred',
    'relevent': 'relevant',
    'repetative': 'repetitive',
    'responsability': 'responsibility',
    'rythm': 'rhythm',
    'seize': 'seize',
    'similer': 'similar',
    'sincerly': 'sincerely',
    'succesful': 'successful',
    'successfull': 'successful',
    'suprise': 'surprise',
    'temperture': 'temperature',
    'tendancy': 'tendency',
    'therefor': 'therefore',
    'tommorow': 'tomorrow',
    'tounge': 'tongue',
    'vaccuum': 'vacuum',
    'vegatable': 'vegetable',
    'wether': 'whether',
    'writting': 'writing',
    
    # === TECHNICAL TERMS ===
    'algorythm': 'algorithm',
    'analisis': 'analysis',
    'artifical': 'artificial',
    'authentification': 'authentication',
    'automaticaly': 'automatically',
    'compatability': 'compatibility',
    'configuraton': 'configuration',
    'conectivity': 'connectivity',
    'databse': 'database',
    'dependecy': 'dependency',
    'documentaion': 'documentation',
    'efficency': 'efficiency',
    'encription': 'encryption',
    'functionalty': 'functionality',
    'implemention': 'implementation',
    'initalize': 'initialize',
    'infrastrucure': 'infrastructure',
    'integeration': 'integration',
    'maintainance': 'maintenance',
    'managment': 'management',
    'methodolgy': 'methodology',
    'optimisation': 'optimization',
    'paramater': 'parameter',
    'performace': 'performance',
    'permision': 'permission',
    'persistance': 'persistence',
    'procesor': 'processor',
    'programing': 'programming',
    'protocal': 'protocol',
    'refactoring': 'refactoring',
    'refrences': 'references',
    'repositry': 'repository',
    'requirment': 'requirement',
    'resourse': 'resource',
    'responisve': 'responsive',
    'scaleable': 'scalable',
    'securtiy': 'security',
    'sofware': 'software',
    'specifcation': 'specification',
    'synchonize': 'synchronize',
    'technolgy': 'technology',
    'templete': 'template',
    'trasaction': 'transaction',
    'validaton': 'validation',
    'vulnerabilty': 'vulnerability',
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
