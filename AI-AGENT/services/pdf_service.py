import io
import httpx
import fitz  # PyMuPDF
import pdfplumber
from typing import Dict, Any, List
from utils.logger import get_logger

logger = get_logger("pdf_service")

async def download_pdf(url: str, paper_id: str) -> bytes:
    """
    Downloads a PDF document from a given Cloudinary secure URL.
    """
    logger.info(f"Downloading PDF for paper {paper_id} from URL: {url}")
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(url)
        if response.status_code != 200:
            logger.error(f"Failed to download PDF. Status: {response.status_code}")
            raise Exception(f"Failed to download PDF. HTTP Status: {response.status_code}")
        logger.info(f"PDF download successful for paper {paper_id}. Size: {len(response.content)} bytes")
        return response.content

def extract_text_pymupdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text and metadata using PyMuPDF (fitz).
    """
    logger.info("Extracting PDF content using PyMuPDF...")
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_content = []
        raw_text_parts = []
        
        for idx, page in enumerate(doc):
            page_num = idx + 1
            text = page.get_text()
            pages_content.append({
                'page_num': page_num,
                'text': text
            })
            raw_text_parts.append(text)
            
        metadata = doc.metadata or {}
        page_count = len(doc)
        doc.close()
        
        logger.info(f"PyMuPDF extraction finished. Pages: {page_count}, Text length: {sum(len(p['text']) for p in pages_content)}")
        
        return {
            'pages': pages_content,
            'metadata': {
                'title': metadata.get('title', ''),
                'author': metadata.get('author', ''),
                'subject': metadata.get('subject', ''),
                'keywords': metadata.get('keywords', ''),
                'creator': metadata.get('creator', ''),
                'producer': metadata.get('producer', ''),
            },
            'pageCount': page_count,
            'rawText': '\n\n'.join(raw_text_parts)
        }
    except Exception as e:
        logger.error(f"PyMuPDF extraction error: {e}")
        raise e

def extract_text_pdfplumber(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text and tables using pdfplumber.
    """
    logger.info("Extracting PDF content using pdfplumber...")
    try:
        pages_content = []
        raw_text_parts = []
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            page_count = len(pdf.pages)
            for idx, page in enumerate(pdf.pages):
                page_num = idx + 1
                text = page.extract_text() or ""
                
                # Try table extraction
                tables_str = ""
                try:
                    tables = page.extract_tables()
                    if tables:
                        tables_str_list = []
                        for t_idx, table in enumerate(tables):
                            rows = []
                            for row in table:
                                rows.append(" | ".join([str(cell or "").strip() for cell in row]))
                            tables_str_list.append(f"\n[Table {t_idx+1}]\n" + "\n".join(rows))
                        tables_str = "\n".join(tables_str_list)
                except Exception as tbl_err:
                    logger.debug(f"Table extraction failed on page {page_num}: {tbl_err}")
                
                combined_text = text + tables_str
                pages_content.append({
                    'page_num': page_num,
                    'text': combined_text
                })
                raw_text_parts.append(combined_text)
                
            metadata = pdf.metadata or {}
            
        logger.info(f"pdfplumber extraction finished. Pages: {page_count}")
        return {
            'pages': pages_content,
            'metadata': {
                'title': metadata.get('Title', ''),
                'author': metadata.get('Author', ''),
                'subject': metadata.get('Subject', ''),
                'keywords': metadata.get('Keywords', ''),
            },
            'pageCount': page_count,
            'rawText': '\n\n'.join(raw_text_parts)
        }
    except Exception as e:
        logger.error(f"pdfplumber extraction error: {e}")
        raise e

def extract_pdf_content(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Tries PyMuPDF (fitz) first. If the resulting text is empty or too short,
    falls back to pdfplumber. Merges pdfplumber tables if available.
    """
    # 1. Try PyMuPDF
    res = extract_text_pymupdf(pdf_bytes)
    
    # 2. Check if text is less than 100 characters (scanned PDF or extraction failure)
    if len(res['rawText'].strip()) < 100:
        logger.warning("PyMuPDF extracted minimal text. Falling back to pdfplumber...")
        try:
            res = extract_text_pdfplumber(pdf_bytes)
        except Exception as e:
            logger.error(f"Fallback pdfplumber extraction failed: {e}")
            # Keep PyMuPDF results if fallback fails
    else:
        # Optional: Parse tables from pdfplumber and append to PyMuPDF pages
        try:
            logger.info("Extracting tables via pdfplumber to merge with PyMuPDF text...")
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for idx, page in enumerate(pdf.pages):
                    if idx < len(res['pages']):
                        tables = page.extract_tables()
                        if tables:
                            tables_str_list = []
                            for t_idx, table in enumerate(tables):
                                rows = []
                                for row in table:
                                    rows.append(" | ".join([str(cell or "").strip() for cell in row]))
                                tables_str_list.append(f"\n[Table {t_idx+1}]\n" + "\n".join(rows))
                            res['pages'][idx]['text'] += "\n" + "\n".join(tables_str_list)
            # Re-generate raw text with merged tables
            res['rawText'] = '\n\n'.join([p['text'] for p in res['pages']])
        except Exception as table_merge_err:
            logger.warning(f"Could not merge tables: {table_merge_err}")
            
    return res
