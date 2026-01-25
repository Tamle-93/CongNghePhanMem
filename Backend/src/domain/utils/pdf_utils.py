"""
Backend/src/domain/utils/pdf_utils.py
PDF Processing Utilities - Remove metadata for privacy
"""

import os
from PyPDF2 import PdfReader, PdfWriter


class PDFUtils:
    """Utilities for PDF processing and privacy"""
    
    @staticmethod
    def strip_metadata(input_path, output_path=None):
        """
        ✅ Strip metadata from PDF file for privacy
        Remove author, creator, subject, keywords, creation date, etc.
        
        Args:
            input_path: Path to input PDF
            output_path: Path to save cleaned PDF (if None, overwrites input)
        
        Returns:
            (success, output_path) or (False, error_message)
        """
        try:
            if not os.path.exists(input_path):
                return False, "Input file not found"
            
            # Read PDF
            pdf_reader = PdfReader(input_path)
            pdf_writer = PdfWriter()
            
            # Copy all pages without metadata
            for page in pdf_reader.pages:
                pdf_writer.add_page(page)
            
            # Clear metadata
            pdf_writer.add_metadata({
                '/Title': '',
                '/Author': '',
                '/Subject': '',
                '/Creator': '',
                '/Producer': 'UTH-ConfMS',
                '/Keywords': ''
            })
            
            # Write cleaned PDF
            output_file = output_path or input_path
            with open(output_file, 'wb') as f:
                pdf_writer.write(f)
            
            return True, output_file
            
        except Exception as e:
            return False, f"Failed to strip PDF metadata: {str(e)}"
    
    @staticmethod
    def get_pdf_info(file_path):
        """Get basic PDF information"""
        try:
            if not os.path.exists(file_path):
                return None, "File not found"
            
            pdf_reader = PdfReader(file_path)
            
            info = {
                'pages': len(pdf_reader.pages),
                'title': pdf_reader.metadata.get('/Title', 'N/A') if pdf_reader.metadata else 'N/A',
                'author': pdf_reader.metadata.get('/Author', 'N/A') if pdf_reader.metadata else 'N/A',
                'file_size': os.path.getsize(file_path)
            }
            
            return info, None
            
        except Exception as e:
            return None, str(e)
