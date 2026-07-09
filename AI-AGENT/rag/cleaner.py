import re
from typing import Dict
from utils.logger import get_logger

logger = get_logger("cleaner")

def clean_text(text: str) -> str:
    """
    Cleans extracted text to fix ligatures, hyphens, page numbers, and headers.
    """
    if not text:
        return ''

    # 1. Remove null bytes
    text = text.replace('\x00', '')

    # 2. Decode any unicode escape sequences
    try:
        text = text.encode('utf-8', errors='ignore').decode('utf-8')
    except Exception as e:
        logger.warning(f"Encoding normalization issue: {e}")

    # 3. Fix common PDF ligatures
    ligatures = {
        'ﬁ': 'fi',
        'ﬂ': 'fl',
        'ﬀ': 'ff',
        'ﬃ': 'ffi',
        'ﬄ': 'ffl',
        'ﬅ': 'ft',
        'ﬆ': 'st',
        'Æ': 'AE',
        'œ': 'oe'
    }
    for lig, rep in ligatures.items():
        text = text.replace(lig, rep)

    # 4. Normalize line endings to \n
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # 5. Fix hyphenation at line breaks: e.g. "compu-\nting" -> "computing"
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)

    # 6. Remove excessive whitespace (3+ spaces -> single space)
    text = re.sub(r'[ \t]{3,}', ' ', text)

    # 7. Remove page header/footer patterns (e.g. "Page 1 of 12", "arXiv:1706.03762v7 [cs.CL] 12 Jun 2020", single page numbers at start/end of lines)
    text = re.sub(r'(?i)^\s*(page|pg\.?)\s*\d+\s*(of\s*\d+)?\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE) # single number lines
    text = re.sub(r'(?i)arXiv:\d{4}\.\d{4,5}(v\d+)?\s*\[\w+\.\w+\]\s*\d+\s*\w+\s*\d{4}', '', text)

    # 8. Remove reference list index numbers at line start e.g. "[1] ", "(1) "
    # But preserve mathematical list formats or inline citations in context.
    # We only clean if it appears to be a bullet header.
    text = re.sub(r'^\[\d+\]\s+', '', text, flags=re.MULTILINE)

    # 9. Preserve mathematical notations (e.g. don't strip symbols like LaTeX formulas, $, \sum, etc.)
    # We return the cleaned text.
    return text.strip()

def detect_sections(text: str) -> Dict[str, str]:
    """
    Identifies sections using Regex boundaries and splits the text accordingly.
    """
    logger.info("Detecting sections in paper text...")
    
    # Define section regex headers
    sections_patterns = {
        'abstract': r'(?i)\babstract\b',
        'introduction': r'(?i)\b(1\.?\s+)?introduction\b',
        'background': r'(?i)\b(2\.?\s+)?(background|related\s+work)\b',
        'methodology': r'(?i)\b(\d\.?\s+)?(methodology|methods|proposed\s+approach|model)\b',
        'experiments': r'(?i)\b(\d\.?\s+)?(experiments|experimental\s+setup|evaluation)\b',
        'results': r'(?i)\b(\d\.?\s+)?(results|findings|discussion)\b',
        'conclusion': r'(?i)\b(\d\.?\s+)?(conclusion|concluding\s+remarks)\b',
        'references': r'(?i)\b(references|bibliography)\b'
    }

    # Find position of each section
    positions = []
    for section_name, pattern in sections_patterns.items():
        matches = list(re.finditer(pattern, text))
        if matches:
            # Take the first match for each section
            positions.append((section_name, matches[0].start()))

    # Sort positions by start index
    positions.sort(key=lambda x: x[1])

    section_map = {}
    if not positions:
        # Fallback if no sections detected: dump all to introduction
        section_map['introduction'] = text
        return section_map

    # Extract text slices between section headings
    for i in range(len(positions)):
        current_sec, start_pos = positions[i]
        end_pos = positions[i+1][1] if i + 1 < len(positions) else len(text)
        
        # Crop section heading text out from contents
        section_map[current_sec] = text[start_pos:end_pos].strip()

    logger.info(f"Sections detected: {list(section_map.keys())}")
    return section_map
