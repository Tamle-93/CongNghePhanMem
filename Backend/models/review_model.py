# File: review_model.py
# Nhiệm vụ: Viết code xử lý cho review_model
# Team Member: Điền tên người phụ trách vào đây
# Backend/models/review_model.py

from config.database import get_db_connection  # nếu project bạn dùng hàm khác thì đổi

class ReviewModel:
    @staticmethod
    def submit_review(assignment_id: int, score: float, comment: str):
        conn = get_db_connection()
        cur = conn.cursor()

        # TODO: đổi đúng tên bảng/cột theo DB_Script.sql
        # 1) Update bảng Reviews
        cur.execute("""
            UPDATE reviews
            SET score = ?, comment = ?, status = 'Submitted'
            WHERE assignment_id = ?
        """, (score, comment, assignment_id))

        # 2) Update trạng thái assignment -> Reviewed
        cur.execute("""
            UPDATE review_assignments
            SET status = 'Reviewed'
            WHERE id = ?
        """, (assignment_id,))

        # 3) Update paper status -> Reviewed (nếu DB có)
        cur.execute("""
            UPDATE papers
            SET status = 'Reviewed'
            WHERE id = (SELECT paper_id FROM review_assignments WHERE id = ?)
        """, (assignment_id,))

        conn.commit()
        conn.close()
