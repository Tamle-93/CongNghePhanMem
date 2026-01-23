// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [data, setData] = useState({
    username: '',
    email: '',
    full_name: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API = 'http://localhost:5000/api/controllers';

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError('');
  };

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (data.newPassword !== data.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          full_name: data.full_name,
          password: data.newPassword,
          roles: ['Author']
        })
      });

      const d = await res.json();

      if (res.ok) {
        setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        setError(d.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
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
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px'
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
            <Lock size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            UTH-ConfMS
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Hệ thống quản lý hội nghị khoa học UTH
          </p>
          <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500', marginTop: '8px' }}>
            Đăng Ký Tài Khoản Mới
          </p>
        </div>

        {/* Form */}
        <form onSubmit={register}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Tài khoản / Mã
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <User size={20} />
              </div>
              <input
                type="text"
                name="username"
                value={data.username}
                onChange={change}
                placeholder="Mã sinh viên / UTH"
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

          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Họ và tên
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <User size={20} />
              </div>
              <input
                type="text"
                name="full_name"
                value={data.full_name}
                onChange={change}
                placeholder="Nhập họ và tên"
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

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={change}
                placeholder="email@uth.edu.vn"
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

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="newPassword"
                  value={data.newPassword}
                  onChange={change}
                  placeholder="Mật khẩu"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Xác nhận
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={change}
                  placeholder="Nhập lại"
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
          </div>

          {/* Error/Success */}
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginTop: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', fontSize: '14px', marginTop: '16px' }}>
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
              marginTop: '16px',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Tôi đã có tài khoản?{' '}
            <Link to="/auth/login" style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
              Đăng nhập ngay
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

export default RegisterPage;