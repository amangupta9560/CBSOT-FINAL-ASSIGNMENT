from typing import List, Dict, Any
from utils.logger import get_logger

logger = get_logger("chunker")

def recursive_split(text: str, separators: List[str], max_len: int, overlap: int) -> List[str]:
    """
    Core recursive character splitting logic.
    """
    if len(text) <= max_len:
        return [text]

    if not separators:
        # No more separators left, split by raw length
        return [text[i:i+max_len] for i in range(0, len(text), max_len - overlap)]

    separator = separators[0]
    next_separators = separators[1:]
    
    # Split text by current separator
    parts = text.split(separator)
    chunks = []
    current_chunk = []
    current_length = 0

    for part in parts:
        part_len = len(part)
        
        # If a single part exceeds the chunk size, split it recursively
        if part_len > max_len:
            # If we have accumulated previous parts, store them first
            if current_chunk:
                chunks.append(separator.join(current_chunk))
                current_chunk = []
                current_length = 0
            
            # Recursive split on the oversized part
            sub_chunks = recursive_split(part, next_separators, max_len, overlap)
            chunks.extend(sub_chunks)
        else:
            # If combining exceeds limit, save current chunk and start next with overlap
            # Approx overlap count of items in list to form overlap characters
            if current_length + part_len + (len(separator) if current_chunk else 0) > max_len:
                chunks.append(separator.join(current_chunk))
                
                # Start new chunk with overlap from the tail of current chunk
                overlap_text = separator.join(current_chunk)
                # Keep tail characters up to overlap length
                overlap_start = max(0, len(overlap_text) - overlap)
                overlap_part = overlap_text[overlap_start:]
                
                current_chunk = [overlap_part, part] if overlap_part else [part]
                current_length = len(overlap_part) + part_len + (len(separator) if overlap_part else 0)
            else:
                current_chunk.append(part)
                current_length += part_len + (len(separator) if len(current_chunk) > 1 else 0)

    if current_chunk:
        chunks.append(separator.join(current_chunk))

    return [c.strip() for c in chunks if c.strip()]

def chunk_text(text: str, 
               chunk_size: int = 512,
               overlap: int = 50,
               paper_id: str = '',
               user_id: str = '',
               section_map: Dict[str, str] = None) -> List[Dict[str, Any]]:
    """
    Splits text recursively by separators. If section_map is provided,
    chunks each section separately to ensure boundary preservation.
    """
    logger.info(f"Chunking document text. Max size: {chunk_size} chars, overlap: {overlap}...")
    
    separators = ['\n\n', '\n', '. ', ' ']
    chunks_list = []
    chunk_index = 0

    # If section map is empty or not provided, treat full text as single block
    if not section_map:
        section_map = {'introduction': text}

    for section_name, section_text in section_map.items():
        if not section_text.strip():
            continue
            
        logger.debug(f"Chunking section: {section_name} (Length: {len(section_text)} chars)")
        sub_raw_chunks = recursive_split(section_text, separators, chunk_size, overlap)
        
        char_offset = 0
        for raw_chunk in sub_raw_chunks:
            char_start = char_offset
            char_end = char_offset + len(raw_chunk)
            char_offset = char_end
            
            # Approximate tokens (1 token ≈ 4 characters)
            approx_tokens = max(1, len(raw_chunk) // 4)
            
            chunks_list.append({
                'text': raw_chunk,
                'chunk_index': chunk_index,
                'char_start': char_start,
                'char_end': char_end,
                'section': section_name,
                'approximate_tokens': approx_tokens,
                'metadata': {
                    'paper_id': paper_id,
                    'user_id': user_id,
                    'chunk_index': chunk_index,
                    'section': section_name
                }
            })
            chunk_index += 1

    logger.info(f"Chunking complete. Total chunks generated: {len(chunks_list)}")
    return chunks_list
