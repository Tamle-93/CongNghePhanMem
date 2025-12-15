# File: review_model.py
# Nhiệm vụ: Viết code xử lý cho review_model
# Team Member: Điền tên người phụ trách vào đây
# Backend/models/review_model.py

# Backend/models/review_model.py
from config.database import get_db_connection


class ReviewModel:
    @staticmethod
    def get_assignments_for_reviewer(user_id):
        """
        Lấy danh sách bài 'Tôi được phân công' theo reviewer_users_id (UUID)
        Trả về: assignment_id, paper_title, pdf_url, assignment_status, deadline_date, paper_status
        """
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
              a.id           AS assignment_id,
              p.id           AS paper_id,
              p.title        AS paper_title,
              p.fileurl      AS pdf_url,
              a.status       AS assignment_status,
              a.deadlinedate AS deadline_date,
              p.status       AS paper_status
            FROM assignments a
            JOIN papers p ON p.id = a.paper_id
            WHERE a.reviewer_users_id = %s
              AND a.isdeleted = FALSE
            ORDER BY a.createddate DESC
            """,
            (user_id,),
        )

        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]

        cur.close()
        conn.close()

        return [dict(zip(cols, r)) for r in rows]

    @staticmethod
    def submit_review(assignment_id, score, comment_for_author="", comment_for_chair=""):
        """
        Submit review:
        - Nếu chưa có review cho assignment -> INSERT
        - Nếu đã có -> UPDATE
        - Update assignments.status = 'Reviewed'
        - Update papers.status = 'Reviewed'
        """
        conn = get_db_connection()
        cur = conn.cursor()

        # 1) kiểm tra review đã tồn tại chưa
        cur.execute(
            "SELECT id FROM reviews WHERE assignment_id = %s AND isdeleted = FALSE LIMIT 1",
            (assignment_id,),
        )
        existing = cur.fetchone()

        if existing:
            # UPDATE review
            cur.execute(
                """
                UPDATE reviews
                SET score = %s,
                    commentsforauthor = %s,
                    commentsforchair = %s,
                    submitteddate = NOW(),
                    updateddate = NOW()
                WHERE assignment_id = %s
                """,
                (score, comment_for_author, comment_for_chair, assignment_id),
            )
        else:
            # INSERT review mới
            cur.execute(
                """
                INSERT INTO reviews (assignment_id, score, confidencelevel,
                                    commentsforauthor, commentsforchair,
                                    submitteddate, createddate, updateddate, isdeleted)
                VALUES (%s, %s, NULL, %s, %s, NOW(), NOW(), NOW(), FALSE)
                """,
                (assignment_id, score, comment_for_author, comment_for_chair),
            )

        # 2) update assignment status -> Reviewed
        cur.execute(
            """
            UPDATE assignments
            SET status = 'Reviewed', updateddate = NOW()
            WHERE id = %s
            """,
            (assignment_id,),
        )

        # 3) update paper status -> Reviewed
        cur.execute(
            """
            UPDATE papers
            SET status = 'Reviewed', updateddate = NOW()
            WHERE id = (SELECT paper_id FROM assignments WHERE id = %s)
            """,
            (assignment_id,),
        )

        conn.commit()
        cur.close()
        conn.close()
