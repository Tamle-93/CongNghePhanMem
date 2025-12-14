// File: Frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Loginpage';
<<<<<<< HEAD
import RegisterPage from './pages/RegisterPage'; // Đảm bảo bạn đã tạo file này (tôi đã gửi code ở tin nhắn trước)
=======
import RegisterPage from './pages/RegisterPage';
>>>>>>> 641d0bdd6feb48ea2a6ce2b5ec91624bafcdb5cc
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* TODO: Protected routes - Sẽ thêm sau */}
        
        {/* 404 Not Found */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;