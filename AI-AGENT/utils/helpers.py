import re
from typing import Optional

def format_file_size(bytes_size: int) -> str:
  """Formats a byte count into a readable string (e.g. 2.4 MB)"""
  if bytes_size is None:
    return '0 Bytes'
  for unit in ['Bytes', 'KB', 'MB', 'GB']:
    if bytes_size < 1024.0:
      return f'{bytes_size:.1f} {unit}'
    bytes_size /= 1024.0
  return f'{bytes_size:.1f} TB'

def sanitize_text(text: str) -> str:
  """Removes null bytes and cleans up common encoding translation artifacts"""
  if not text:
    return ''
  # Remove null bytes
  text = text.replace('\x00', '')
  # Fix unicode translations
  text = text.encode('utf-8', errors='ignore').decode('utf-8')
  return text

def truncate_text(text: str, max_tokens: int) -> str:
  """Approximate token truncation (1 token ≈ 4 characters)"""
  if not text:
    return ''
  max_chars = max_tokens * 4
  if len(text) <= max_chars:
    return text
  return text[:max_chars]

def extract_doi(text: str) -> str:
  """Regex to locate a DOI pattern in the text"""
  if not text:
    return ''
  # Standard DOI regex patterns
  doi_pattern = re.compile(r'\b10\.\d{4,9}/[-._;()/:A-Za-z0-9]+\b')
  match = doi_pattern.search(text)
  if match:
    return match.group(0)
  
  # Search for URL formatted DOIs
  url_doi_pattern = re.compile(r'doi\.org/(10\.\d{4,9}/[-._;()/:A-Za-z0-9]+)')
  match_url = url_doi_pattern.search(text)
  if match_url:
    return match_url.group(1)
    
  return ''

def extract_year(text: str) -> Optional[int]:
  """Locate potential publication year in the header text (usually between 1980 and 2030)"""
  if not text:
    return None
  
  # Search for 4 digit numbers
  years = re.findall(r'\b(19\d{2}|20[0-2]\d|2030)\b', text[:3000])
  if years:
    # Prefer newer years, or the first occurrence in document metadata
    return int(years[0])
  return None

def clean_json_response(raw_response: str) -> str:
    """
    Strips markdown code block wrappers (like ```json ... ```) from LLM output
    to return a clean JSON string.
    """
    if not raw_response:
        return "{}"
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        # Remove opening block
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned

