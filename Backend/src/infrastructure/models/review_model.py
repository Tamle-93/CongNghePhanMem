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

        result = []
        for r in rows:
            result.append({
                "assignment_id": r[0],
                "paper_title": r[1],
                "status": r[2],
                "deadline_date": r[3]
            })

        cur.close()
        conn.close()
        return result

    @staticmethod
    def submit_review(assignment_id, score, comment):
        """
        Submit review:
        - Insert / Update bảng Reviews
        - Update Assignment status
        """
        conn = get_db_connection()
        cur = conn.cursor()

        # 1. Insert hoặc update bảng Reviews
        cur.execute("""
            INSERT INTO reviews (
                assignment_id,
                score,
                commentsforauthor,
                submitteddate
            )
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (assignment_id)
            DO UPDATE SET
                score = EXCLUDED.score,
                commentsforauthor = EXCLUDED.commentsforauthor,
                submitteddate = NOW()
        """, (assignment_id, score, comment))

        # 2. Update trạng thái assignment
        cur.execute("""
            UPDATE assignments
            SET status = 'Reviewed'
            WHERE id = %s
        """, (assignment_id,))

        conn.commit()
        cur.close()
        conn.close()
