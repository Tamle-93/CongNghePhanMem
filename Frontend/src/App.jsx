import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Đảm bảo bạn đã tạo file này (tôi đã gửi code ở tin nhắn trước)
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthorDashboard from './pages/AuthorDashboard';
function App() {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn mặc định -> Chuyển về Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Đây là lý do tại sao Link hoạt động: Bạn phải định nghĩa nó ở đây */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/author-dashboard" element={<AuthorDashboard />} />
        {/* Trang Quên mật khẩu (Tạm thời để trống text) */}
        <Route path="/forgot-password" element={<div style={{textAlign: 'center', marginTop: 50}}>Chức năng đang phát triển...</div>} />
      </Routes>
    </Router>
  );
}

export default App;