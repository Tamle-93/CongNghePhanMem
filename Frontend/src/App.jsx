// File: Frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthorDashboard from './pages/AuthorDashboard';

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
        
        {/* Author Dashboard */}
        <Route path="/author/dashboard" element={<AuthorDashboard />} />
        
        {/* TODO: Các dashboard khác */}
        {/* <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} /> */}
        {/* <Route path="/chair/dashboard" element={<ChairDashboard />} /> */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        
        {/* 404 Not Found */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;