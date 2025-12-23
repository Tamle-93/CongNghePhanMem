# Backend/models/review_model.py

from config.database import get_db_connection


class ReviewModel:

    @staticmethod
    def get_assignments_for_reviewer(user_id):
        """
        Lấy danh sách bài báo được phân công cho reviewer
        """
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                a.id AS assignment_id,
                p.title AS paper_title,
                a.status,
                a.deadlinedate
            FROM assignments a
            JOIN papers p ON a.paper_id = p.id
            WHERE a.reviewer_users_id = %s
              AND a.isdeleted = FALSE
        """, (user_id,))

        rows = cur.fetchall()

      
