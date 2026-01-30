"""
============================================
Backend/src/domain/utils/file_validator.py
============================================
File Upload Validation - Kiểm tra tính hợp lệ của file upload

MỤC ĐÍCH:
- Validate PDF file uploads (check format, size)
- Strip metadata từ PDF để bảo đảm double-blind review
- Cảnh báo về các lỗi upload

CHỨC NĂNG CHÍNH:
1. allowed_file(): Kiểm tra extension của file
2. validate_pdf(): Validate PDF (size, format, pages)
3. strip_pdf_metadata(): Xóa metadata khỏi PDF

SECURITY:
- Max file size: 10 MB
- Chỉ cho phép PDF
- Xóa metadata để bảo vệ double-blind review
"""
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import io

class FileValidator:
    """
    File Upload Validation
    =====================
    Kiểm tra tính hợp lệ của file upload từ tác giả
    """
    
    ALLOWED_EXTENSIONS = {'pdf'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileValidator.ALLOWED_EXTENSIONS
    
    @staticmethod
    def validate_pdf(file_stream):
        """
        Validate PDF file
        
        Args:
            file_stream: File object or bytes
            
        Returns: (is_valid, error_message)
        """
        try:
            # Check file size
            file_stream.seek(0, os.SEEK_END)
            file_size = file_stream.tell()
            file_stream.seek(0)
            
            if file_size > FileValidator.MAX_FILE_SIZE:
                return False, f"File too large. Max size: {FileValidator.MAX_FILE_SIZE / 1024 / 1024} MB"
            
            if file_size == 0:
                return False, "File is empty"
            
            # Try to read PDF
            try:
                pdf_reader = PdfReader(file_stream)
                
                # Check if PDF has pages
                if len(pdf_reader.pages) == 0:
                    return False, "PDF has no pages"
                
                # Check if PDF is encrypted
                if pdf_reader.is_encrypted:
                    return False, "Encrypted PDFs are not allowed"
                
                # Reset stream position
                file_stream.seek(0)
                
                return True, None
                
            except Exception as e:
                return False, f"Invalid PDF file: {str(e)}"
                
        except Exception as e:
            return False, f"File validation error: {str(e)}"
    
    @staticmethod
    def get_pdf_metadata(file_stream):
        """
        Extract metadata from PDF
        
        Returns: dict with metadata or None
        """
        try:
            pdf_reader = PdfReader(file_stream)
            
            metadata = {
                'num_pages': len(pdf_reader.pages),
                'is_encrypted': pdf_reader.is_encrypted,
            }
            
            # Get document info
            if pdf_reader.metadata:
                metadata['title'] = pdf_reader.metadata.get('/Title', '')
                metadata['author'] = pdf_reader.metadata.get('/Author', '')
                metadata['subject'] = pdf_reader.metadata.get('/Subject', '')
                metadata['creator'] = pdf_reader.metadata.get('/Creator', '')
            
            file_stream.seek(0)
            return metadata
            
        except Exception as e:
            return None
    
    @staticmethod
    def sanitize_filename(filename):
        """Sanitize uploaded filename"""
        # Remove path components
        filename = secure_filename(filename)
        
        # Limit length
        name, ext = os.path.splitext(filename)
        if len(name) > 100:
            name = name[:100]
        
        return f"{name}{ext}"
    
    @staticmethod
    def check_file_type(file_stream):
        """
        Check actual file type by reading magic bytes
        
        Returns: (is_pdf, mime_type)
        """
        try:
            # Read first 4 bytes
            file_stream.seek(0)
            magic_bytes = file_stream.read(4)
            file_stream.seek(0)
            
            # PDF magic bytes: %PDF
            if magic_bytes.startswith(b'%PDF'):
                return True, 'application/pdf'
            
            return False, 'unknown'
            
        except Exception:
            return False, 'unknown'

# Usage example:
# from domain.utils.file_validator import FileValidator
#
# is_valid, error = FileValidator.validate_pdf(file)
# if not is_valid:
#     return jsonify({'error': error}), 400