# File: Backend/controllers/paper_controller.py
# Team UTH-ConfMS
# MỤC ĐÍCH: Xử lý logic Submission (Papers)

from flask import request, jsonify
from models.paper_model import PaperModel
from services.file_service import save_pdf_file, delete_pdf_file
from utils.security import require_auth
from utils.response import success_response, error_response
import json

class PaperController:
    """
    Controller xử lý các tác vụ liên quan đến Papers
    """
    
    def __init__(self):
        self.paper_model = PaperModel()
    
    @require_auth
    def create_paper(self):
        """
        Nộp bài báo mới
        """
        try:
            # Lấy user_id từ token
            user_info = request.user_info
            author_id = user_info['user_id']
            
            # Lấy dữ liệu từ form
            title = request.form.get('title', '').strip()
            abstract = request.form.get('abstract', '').strip()
            track_id = request.form.get('track_id', '').strip()
            pdf_file = request.files.get('pdf_file')
            authors_json = request.form.get('authors', '[]')
            
            # Validate
            if not all([title, abstract, track_id, pdf_file]):
                return jsonify(error_response(
                    message="Thiếu thông tin bắt buộc",
                    code=400,
                    details="Cần có: title, abstract, track_id, pdf_file"
                )), 400
            
            # Validate PDF
            if not pdf_file.filename.endswith('.pdf'):
                return jsonify(error_response(
                    message="File phải có định dạng PDF",
                    code=400
                )), 400
            
            # Upload file
            file_url = save_pdf_file(pdf_file)
            
            # Parse authors
            try:
                authors = json.loads(authors_json)
            except:
                return jsonify(error_response(
                    message="Dữ liệu authors không hợp lệ",
                    code=400
                )), 400
            
            # Tạo paper trong database
            paper = self.paper_model.create_paper(
                track_id=track_id,
                submitter_id=author_id,
                title=title,
                abstract=abstract,
                file_url=file_url,
                authors=authors
            )
            
            if not paper:
                return jsonify(error_response(
                    message="Không thể nộp bài báo",
                    code=500
                )), 500
            
            return jsonify(success_response(
                data=paper,
                message="Nộp bài báo thành công"
            )), 201
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def get_my_papers(self):
        """
        Lấy danh sách bài báo của tôi
        """
        try:
            user_info = request.user_info
            author_id = user_info['user_id']
            
            papers = self.paper_model.get_papers_by_author(author_id)
            
            return jsonify(success_response(
                data={"papers": papers, "total": len(papers)},
                message="Lấy danh sách bài báo thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def get_paper_detail(self, paper_id):
        """
        Xem chi tiết bài báo
        """
        try:
            user_info = request.user_info
            user_id = user_info['user_id']
            user_role = user_info['role']
            
            paper = self.paper_model.get_paper_by_id(paper_id)
            
            if not paper:
                return jsonify(error_response(
                    message="Không tìm thấy bài báo",
                    code=404
                )), 404
            
            # Kiểm tra quyền xem
            submitter_id = paper.get('submitter_users_id') or paper.get('Submitter_Users_Id')
            if submitter_id != user_id and user_role not in ['Chair', 'Reviewer', 'Admin']:
                return jsonify(error_response(
                    message="Bạn không có quyền xem bài báo này",
                    code=403
                )), 403
            
            return jsonify(success_response(
                data=paper,
                message="Lấy thông tin bài báo thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def update_paper(self, paper_id):
        """
        Cập nhật bài báo (chỉ Author)
        """
        try:
            user_info = request.user_info
            author_id = user_info['user_id']
            
            # Kiểm tra quyền sở hữu
            paper = self.paper_model.get_paper_by_id(paper_id)
            if not paper:
                return jsonify(error_response(
                    message="Không tìm thấy bài báo",
                    code=404
                )), 404
            
            submitter_id = paper.get('submitter_users_id') or paper.get('Submitter_Users_Id')
            if submitter_id != author_id:
                return jsonify(error_response(
                    message="Bạn không có quyền chỉnh sửa bài báo này",
                    code=403
                )), 403
            
            # Lấy dữ liệu cập nhật
            update_data = {}
            
            if 'title' in request.form:
                update_data['title'] = request.form.get('title').strip()
            
            if 'abstract' in request.form:
                update_data['abstract'] = request.form.get('abstract').strip()
            
            # Upload file mới (nếu có)
            pdf_file = request.files.get('pdf_file')
            if pdf_file:
                # Xóa file cũ
                old_file_url = paper.get('fileurl') or paper.get('FileUrl')
                if old_file_url:
                    delete_pdf_file(old_file_url)
                
                # Upload file mới
                new_file_url = save_pdf_file(pdf_file)
                update_data['file_url'] = new_file_url
            
            if not update_data:
                return jsonify(error_response(
                    message="Không có dữ liệu để cập nhật",
                    code=400
                )), 400
            
            # Cập nhật database
            updated_paper = self.paper_model.update_paper(paper_id, **update_data)
            
            return jsonify(success_response(
                data=updated_paper,
                message="Cập nhật bài báo thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def delete_paper(self, paper_id):
        """
        Xóa bài báo (chỉ Author)
        """
        try:
            user_info = request.user_info
            author_id = user_info['user_id']
            
            # Kiểm tra quyền sở hữu
            paper = self.paper_model.get_paper_by_id(paper_id)
            if not paper:
                return jsonify(error_response(
                    message="Không tìm thấy bài báo",
                    code=404
                )), 404
            
            submitter_id = paper.get('submitter_users_id') or paper.get('Submitter_Users_Id')
            if submitter_id != author_id:
                return jsonify(error_response(
                    message="Bạn không có quyền xóa bài báo này",
                    code=403
                )), 403
            
            # Xóa file PDF
            file_url = paper.get('fileurl') or paper.get('FileUrl')
            if file_url:
                delete_pdf_file(file_url)
            
            # Xóa paper
            success = self.paper_model.delete_paper(paper_id)
            
            if not success:
                return jsonify(error_response(
                    message="Không thể xóa bài báo",
                    code=500
                )), 500
            
            return jsonify(success_response(
                data=None,
                message="Xóa bài báo thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def withdraw_paper(self, paper_id):
        """
        Rút bài báo (Status -> Withdrawn)
        """
        try:
            user_info = request.user_info
            author_id = user_info['user_id']
            
            # Kiểm tra quyền sở hữu
            paper = self.paper_model.get_paper_by_id(paper_id)
            if not paper:
                return jsonify(error_response(
                    message="Không tìm thấy bài báo",
                    code=404
                )), 404
            
            submitter_id = paper.get('submitter_users_id') or paper.get('Submitter_Users_Id')
            if submitter_id != author_id:
                return jsonify(error_response(
                    message="Bạn không có quyền rút bài báo này",
                    code=403
                )), 403
            
            # Cập nhật status
            success = self.paper_model.withdraw_paper(paper_id)
            
            if not success:
                return jsonify(error_response(
                    message="Không thể rút bài báo",
                    code=500
                )), 500
            
            return jsonify(success_response(
                data=None,
                message="Rút bài báo thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500

