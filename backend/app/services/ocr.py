"""
OCR service for extracting text from images using Tesseract OCR
"""

import os
import sys
import platform
import pytesseract
from PIL import Image
from typing import Optional, Dict, Any
import io
import logging

logger = logging.getLogger(__name__)

# Configure Tesseract path for Windows
# Explicitly set for Windows
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def get_tesseract_info() -> Dict[str, Any]:
    """
    Get Tesseract OCR availability and version info.
    
    Returns:
        Dictionary with availability status and version
    """
    try:
        version = pytesseract.get_tesseract_version()
        return {
            "available": True,
            "version": str(version),
            "platform": platform.system(),
            "tesseract_cmd": pytesseract.pytesseract.tesseract_cmd
        }
    except Exception as e:
        logger.warning(f"Tesseract not available: {e}")
        return {
            "available": False,
            "version": None,
            "platform": platform.system(),
            "error": str(e)
        }


def extract_text_from_image(image_data: bytes) -> Dict[str, Any]:
    """
    Extract text from image data using Tesseract OCR.
    
    Args:
        image_data: Raw image bytes (e.g., from upload)
    
    Returns:
        Dictionary with extracted text and confidence score
    """
    tesseract_info = get_tesseract_info()
    if not tesseract_info["available"]:
        return {
            "success": False,
            "error": "Tesseract OCR engine not found. Please install Tesseract OCR.",
            "text": None,
            "confidence": 0
        }
    
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Extract text with confidence data
        data = pytesseract.image_to_data(
            image, 
            output_type=pytesseract.Output.DICT,
            lang='eng'
        )
        
        # Extract full text
        text = pytesseract.image_to_string(image, lang='eng')
        
        # Calculate average confidence
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "success": True,
            "text": text.strip(),
            "confidence": round(avg_confidence, 2),
            "words": len(text.split()),
            "characters": len(text)
        }
        
    except pytesseract.TesseractNotFoundError:
        return {
            "success": False,
            "error": "Tesseract OCR engine not found. Please install Tesseract OCR.",
            "text": None,
            "confidence": 0
        }
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        return {
            "success": False,
            "error": str(e),
            "text": None,
            "confidence": 0
        }


def extract_text_from_file(file_path: str) -> Dict[str, Any]:
    """
    Extract text from an image file.
    
    Args:
        file_path: Path to the image file
    
    Returns:
        Dictionary with extracted text and confidence score
    """
    tesseract_info = get_tesseract_info()
    if not tesseract_info["available"]:
        return {
            "success": False,
            "error": "Tesseract OCR engine not found. Please install Tesseract OCR.",
            "text": None,
            "confidence": 0
        }
    
    try:
        image = Image.open(file_path)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        text = pytesseract.image_to_string(image, lang='eng')
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, lang='eng')
        
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "success": True,
            "text": text.strip(),
            "confidence": round(avg_confidence, 2),
            "words": len(text.split()),
            "characters": len(text)
        }
        
    except pytesseract.TesseractNotFoundError:
        return {
            "success": False,
            "error": "Tesseract OCR engine not found. Please install Tesseract OCR.",
            "text": None,
            "confidence": 0
        }
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        return {
            "success": False,
            "error": str(e),
            "text": None,
            "confidence": 0
        }


def is_tesseract_available() -> bool:
    """
    Check if Tesseract OCR is available and properly configured.
    
    Returns:
        True if Tesseract is available, False otherwise
    """
    return get_tesseract_info()["available"]
