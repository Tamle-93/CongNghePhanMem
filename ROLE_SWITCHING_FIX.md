# 🎭 Sửa Lỗi Chuyển Đổi Vai Trò (Role Switching Bug Fix)

## 🐛 Vấn đề Ban Đầu

Khi người dùng có nhiều vai trò (Author, Chair, Admin, Reviewer), việc chuyển đổi giữa các vai trò không hoạt động đúng:
- Chọn "Admin" → tự động quay về "Author"
- Chọn "Chair" → tự động quay về "Author"
- Role selector không duy trì trạng thái đã chọn

## 🔍 Nguyên Nhân Gốc

1. **Thiếu localStorage sync khi đăng nhập**: Khi user chọn role tại LoginPage, active role không được lưu vào localStorage
2. **activeRole state không sync qua các lần navigation**: Khi user chuyển page, state không được khôi phục từ localStorage
3. **API calls không gửi active role info**: Backend không biết user đang hoạt động với role nào

## ✅ Giải Pháp

### 1. LoginPage.jsx
```jsx
// ✅ Lưu active role khi đăng nhập với single role
localStorage.setItem('activeRole', user.roles?.[0] || 'Author');

// ✅ Lưu active role khi user chọn role từ modal
localStorage.setItem('activeRole', selectedRole);
```

### 2. MainLayout.jsx
```jsx
// ✅ Thêm effect để sync activeRole từ localStorage khi navigation
useEffect(() => {
  const savedRole = localStorage.getItem('activeRole');
  if (savedRole && user?.roles?.includes(savedRole)) {
    setActiveRole(savedRole);
  }
}, [location, user]); // Re-sync when navigating or user changes
```

### 3. api.js (axiosConfig)
```jsx
// ✅ Thêm X-Active-Role header để backend biết user đang dùng role nào
api.interceptors.request.use((config) => {
  const activeRole = localStorage.getItem('activeRole');
  if (activeRole) {
    config.headers['X-Active-Role'] = activeRole;
  }
  return config;
});
```

## 📊 Quy Trình Hoạt Động Sau Fix

```
User Login
  ↓
Backend trả về user.roles = ['Author', 'Chair', 'Admin']
  ↓
LoginPage -> localStorage.setItem('activeRole', selectedRole)
  ↓
MainLayout -> activeRole state khởi tạo từ localStorage
  ↓
User click role selector
  ↓
handleRoleChange() -> 
  - setActiveRole(newRole) 
  - localStorage.setItem('activeRole', newRole)
  - navigate to role's home page
  ↓
Navigation xảy ra
  ↓
MainLayout useEffect triggered [location, user]
  ↓
activeRole sync lại từ localStorage
  ↓
Role selector button hiển thị đúng role đã chọn ✅
```

## 🎯 Files Được Sửa

1. **frontend/src/pages/LoginPage.jsx**
   - Dòng 61-63: Lưu activeRole cho single role login
   - Dòng 74-77: Lưu activeRole cho multi-role selection

2. **frontend/src/components/layout/MainLayout.jsx**
   - Dòng 26-31: Thêm effect để sync activeRole từ localStorage
   - Dòng 42-56: Cải thiện handleRoleChange validation

3. **frontend/src/services/api.js**
   - Dòng 12-23: Thêm X-Active-Role header vào request

## 🧪 Cách Kiểm Tra Fix

1. **Đăng nhập với user có nhiều roles**
2. **Chọn role khác từ role selector** (ví dụ: Admin)
3. **Chuyển đến page khác** (ví dụ: /admin/users)
4. **Quay lại /home hoặc refresh page**
5. **Role selector vẫn hiển thị Admin (không quay về Author)** ✅

## 📝 Lưu Ý

- `activeRole` được lưu trong `localStorage`, nên sẽ persist qua các lần refresh
- Khi logout, `activeRole` sẽ được xóa khỏi localStorage
- API header `X-Active-Role` có thể được sử dụng để ghi log audit hành động của user
