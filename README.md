# CongNghePhanMem
THÀNH VIÊN	MODULE	CÁC FILE CHỊU TRÁCH NHIỆM (Owner)
1. LEADER	Auth & Core	- controllers/auth_controller.py
- controllers/admin_controller.py (Quản lý User)
- models/user_model.py
- routes/auth_routes.py
- config/database.py
- utils/security.py, utils/response.py
- schemas/auth_schema.py
2. MEMBER 2	Conference	- controllers/conference_controller.py
- models/conference_model.py
- routes/api_routes.py (Phần Conference)
- Tự tạo: schemas/conference_schema.py
3. MEMBER 3	Submission	- controllers/paper_controller.py (Phần Nộp/Sửa/Xóa)
- models/paper_model.py
- routes/paper_routes.py
- schemas/paper_schema.py
- services/file_service.py (Code xử lý upload file PDF)
4. MEMBER 4	Assignment	- controllers/review_controller.py (Viết các hàm assign_*)
- models/review_model.py (Phần Assignment)
- routes/api_routes.py (Phần Assignment)
5. MEMBER 5	Reviewing	- controllers/review_controller.py (Viết các hàm submit_review)
- models/review_model.py (Phần Review)
- services/email_service.py (Gửi mail khi có kết quả review)
6. MEMBER 6	Decision	- controllers/decision_controller.py
- models/paper_model.py (Cập nhật status bài báo)
- utils/helpers.py (Viết các hàm phụ trợ nếu cần)
7. MEMBER 7	AI Features	- controllers/ai_controller.py
- models/audit_log_model.py
- services/ai_service.py (Gọi API AI xử lý)
- routes/api_routes.py (Phần AI)
