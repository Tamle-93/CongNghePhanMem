# Tổng hợp Fixes - 31/01/2026 11:50

## ✅ ĐÃ FIX

### 1. Author không thấy bài báo đã nộp
**Nguyên nhân**: Backend check roles thay vì check X-Active-Role header
**Fix**: 
- Backend: Kiểm tra `X-Active-Role` header từ frontend
- Nếu `X-Active-Role = 'Author'` → tự động filter `submitter_id = current_user_id`
- File: `Backend/src/api/controllers/papers_controller.py` - `list_papers()`

**Test**: Chuyển sang role Author → refresh trang → sẽ thấy bài báo

---

### 2. Chair không xem được PDF
**Nguyên nhân**: Thiếu route `/api/papers/:id/pdf`
**Fix**:
- Thêm route `GET /api/papers/<int:paper_id>/pdf`
- Return file PDF với `send_file()`
- File: `Backend/src/api/controllers/papers_controller.py`

**Test**: Vào Chair → click "Xem PDF" → sẽ mở được file

---

## 🔄 CẦN KIỂM TRA

### 3. Mời thành viên mới (Reviewer)
**Vấn đề**: Báo "đã là thành viên" nhưng không hiển thị
**Cần check**:
- API endpoint: `/api/admin/users` (POST) - thêm reviewer
- API endpoint: `/api/users?role=reviewer` (GET) - list reviewers
- Database: table `user_roles` có record với `role_id = Reviewer`

**Debug command**:
```sql
-- Kiểm tra reviewers trong DB
SELECT u.id, u.full_name, u.email, r.name as role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE r.name = 'Reviewer' AND ur.is_active = true;
```

---

### 4. Ra quyết định không tìm thấy bài báo
**Vấn đề**: Trang `/chair/papers/:id/decision` không load được paper
**Cần check**:
- Route: `GET /api/papers/:id` có trả về data không
- Frontend: `ChairDecisions.jsx` có gọi đúng API không
- Có thể do permission check quá strict

**Debug**: Check F12 Network tab xem API `/api/papers/:id` trả về gì

---

### 5. Reviewer không có dữ liệu
**Vấn đề**: Reviewer không thấy assignments
**Nguyên nhân có thể**:
- Chair chưa phân công reviewer cho bài báo nào
- API `/api/assignments/my-assignments` không trả về data

**Cần check**:
```sql
-- Kiểm tra assignments trong DB
SELECT a.id, a.paper_id, a.reviewer_id, p.title, a.status
FROM assignments a
JOIN papers p ON a.paper_id = p.id
WHERE a.is_deleted = false;
```

**Phân công reviewer**:
- API endpoint: `POST /api/assignments` 
- Body: `{"paper_id": 226, "reviewer_ids": [reviewer_id]}`

---

## 📋 HƯỚNG DẪN TEST

### Bước 1: Test Author thấy papers
1. Login với user có role Author (hoặc switch sang Author)
2. Vào `/author/papers`
3. Refresh (Ctrl+F5)
4. Kiểm tra có thấy papers đã nộp không

### Bước 2: Test Chair xem PDF
1. Switch sang role Chair
2. Vào `/chair/papers`
3. Click "Xem chi tiết" bất kỳ paper nào
4. Click nút "Xem PDF"
5. PDF nên mở trong tab mới

### Bước 3: Test mời Reviewer
1. Switch sang role Admin
2. Vào `/admin/users`
3. Click "Thêm người dùng"
4. Điền form, chọn role "Reviewer"
5. Submit
6. Kiểm tra user mới có xuất hiện trong danh sách không

### Bước 4: Test phân công Reviewer
1. Switch sang role Chair
2. Vào `/chair/papers`
3. Click "Phân công phản biện" cho 1 paper
4. Chọn reviewer từ danh sách
5. Click "Gửi"
6. Kiểm tra thông báo thành công

### Bước 5: Test Reviewer thấy assignments
1. Switch sang role Reviewer
2. Vào `/reviewer/assignments`
3. Kiểm tra có thấy papers được phân công không

---

## 🐛 DEBUGGING COMMANDS

```powershell
# 1. Check backend logs
docker logs uth-confms-backend --tail 50

# 2. Check papers in DB
docker exec uth-confms-db psql -U postgres -d uth_confms -c "SELECT id, title, submitter_id, status FROM papers ORDER BY created_at DESC LIMIT 10;"

# 3. Check user roles
docker exec uth-confms-db psql -U postgres -d uth_confms -c "SELECT u.id, u.full_name, r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.id = YOUR_USER_ID;"

# 4. Check reviewers
docker exec uth-confms-db psql -U postgres -d uth_confms -c "SELECT u.id, u.full_name, u.email FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE r.name = 'Reviewer';"

# 5. Check assignments
docker exec uth-confms-db psql -U postgres -d uth_confms -c "SELECT a.id, a.paper_id, a.reviewer_id, a.status FROM assignments a WHERE a.is_deleted = false;"

# 6. Restart containers
docker-compose restart backend frontend
```

---

## 📞 NEXT STEPS

1. **Test vấn đề 1 & 2** (Author papers, Chair PDF) → nên OK rồi
2. **Debug vấn đề 3** (mời reviewer): Kiểm tra API endpoint và database
3. **Debug vấn đề 4** (ra quyết định): Check route và permissions
4. **Debug vấn đề 5** (reviewer assignments): Cần phân công reviewer trước

Hãy test từng bước và báo lại kết quả!
