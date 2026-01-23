// frontend/src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Calendar, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('request'); // 'request' hoặc 'reset'
  const [data, setData] = useState({
    username: '',
    email: '',
    fullName: '',
    dateOfBirth: '',
    resetCode: '',
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

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          full_name: data.fullName,
          date_of_birth: data.dateOfBirth
        })
      });

      const d = await res.json();

      if (res.ok) {
        setSuccess('Mã xác nhận đã được gửi đến email');
        setTimeout(() => {
          setStep('reset');
          setSuccess('');
        }, 2000);
      } else {
        setError(d.message || 'Thông tin không chính xác');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (data.newPassword !== data.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          reset_code: data.resetCode,
          new_password: data.newPassword
        })
      });

      const d = await res.json();

      if (res.ok) {
        setSuccess('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        setError(d.message || 'Mã xác nhận không đúng');
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
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            {step === 'request' ? 'Nhập thông tin để lấy lại mật khẩu' : 'Nhập mã xác nhận đã gửi đến email'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        {step === 'request' ? (
          <form onSubmit={requestReset}>
            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Tên đăng nhập
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
                  placeholder="Nhập email"
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
                  name="fullName"
                  value={data.fullName}
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
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Ngày sinh
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Calendar size={20} />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={data.dateOfBirth}
                  onChange={change}
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
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            {/* Reset Code */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Mã xác nhận
              </label>
              <input
                type="text"
                name="resetCode"
                value={data.resetCode}
                onChange={change}
                placeholder="Nhập mã xác nhận từ email"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  value={data.newPassword}
                  onChange={change}
                  placeholder="Nhập mật khẩu mới"
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
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Xác nhận mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={change}
                  placeholder="Nhập lại mật khẩu mới"
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
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/auth/login"
            style={{
              color: '#3b82f6',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;