// frontend/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [data, setData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(data.username, data.password);
      
      if (result.success) {
        setSuccess('Đăng nhập thành công!');
        const role = result.user?.roles?.[0]?.toLowerCase() || 'author';
        setTimeout(() => navigate(`/${role}/dashboard`), 500);
      } else {
        setError(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const keyPress = (e) => {
    if (e.key === 'Enter') handleLogin(e);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #1e293b 100%)',
      padding: '20px'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#3b82f6',
            borderRadius: '16px',
            marginBottom: '16px'
          }}>
            <Mail size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            UTH-ConfMS
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Hệ thống quản lý hội nghị khoa học UTH
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Tên đăng nhập / Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                <User size={20} />
              </div>
              <input
                type="text"
                name="username"
                value={data.username}
                onChange={change}
                placeholder="Nhập tên đăng nhập"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingLeft: '42px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
                <Lock size={20} />
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={data.password}
                onChange={change}
                onKeyPress={keyPress}
                placeholder="Nhập mật khẩu"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingLeft: '42px',
                  paddingRight: '42px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px'
                }}
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} />
              <span style={{ color: '#6b7280' }}>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/auth/forgot-password" style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
              Quên mật khẩu?
            </Link>
          </div>

          {/* Error/Success */}
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#d1d5db' }}></div>
            <div style={{ position: 'relative', display: 'inline-block', padding: '0 8px', backgroundColor: 'white', fontSize: '14px', color: '#6b7280' }}>
              Hoặc
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Chưa có tài khoản?{' '}
            <Link to="/auth/register" style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          © 2025 Trường Đại học UTH. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;