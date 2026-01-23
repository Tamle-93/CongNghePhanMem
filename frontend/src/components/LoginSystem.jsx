import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Calendar, ArrowLeft } from 'lucide-react';

const LoginSystem = () => {
  const [screen, setScreen] = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [data, setData] = useState({
    username: '', password: '', email: '', resetCode: '',
    newPassword: '', confirmPassword: '', fullName: '', dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API = 'http://localhost:5000/api/controllers';

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError('');
  };

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password })
      });
      const d = await res.json();
      if (res.ok) {
        setSuccess('Đăng nhập thành công!');
        localStorage.setItem('token', d.access_token);
      } else {
        setError(d.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Không thể kết nối. Kiểm tra: Backend chạy & CORS đã cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
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
          username: data.username, email: data.email,
          password: data.newPassword, full_name: data.fullName,
          date_of_birth: data.dateOfBirth
        })
      });
      const d = await res.json();
      if (res.ok) {
        setSuccess('Đăng ký thành công!');
        setTimeout(() => {
          setScreen('login');
          setData({ username: '', password: '', email: '', newPassword: '', confirmPassword: '', fullName: '', dateOfBirth: '' });
          setSuccess('');
        }, 2000);
      } else {
        setError(d.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const forgot = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username, email: data.email,
          full_name: data.fullName, date_of_birth: data.dateOfBirth
        })
      });
      const d = await res.json();
      if (res.ok) {
        setSuccess('Mã xác nhận đã được gửi đến email');
        setTimeout(() => { setScreen('reset'); setSuccess(''); }, 2000);
      } else {
        setError(d.message || 'Thông tin không chính xác');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
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
          email: data.email, reset_code: data.resetCode, new_password: data.newPassword
        })
      });
      const d = await res.json();
      if (res.ok) {
        setSuccess('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          setScreen('login');
          setData({ ...data, password: '', resetCode: '', newPassword: '', confirmPassword: '' });
          setSuccess('');
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

  const keyPress = (e, fn) => { if (e.key === 'Enter') fn(); };

  const Input = ({ label, name, type, placeholder, icon: Icon }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
            <Icon size={20} />
          </div>
        )}
        <input
          type={type === 'password' && showPwd ? 'text' : type}
          name={name}
          value={data[name]}
          onChange={change}
          onKeyPress={(e) => type === 'password' && keyPress(e, screen === 'login' ? login : screen === 'reset' ? reset : null)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px',
            paddingLeft: Icon ? '42px' : '12px',
            paddingRight: type === 'password' ? '42px' : '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        {type === 'password' && (
          <button
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
        )}
      </div>
    </div>
  );

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
            {screen === 'login' ? <Mail size={32} color="white" /> : <Lock size={32} color="white" />}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            UTH-ConfMS
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Hệ thống quản lý hội nghị khoa học UTH
          </p>
          {screen === 'register' && (
            <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500', marginTop: '8px' }}>
              Đăng Ký Tài Khoản Mới
            </p>
          )}
          {screen === 'forgot' && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              Nhập thông tin để lấy lại mật khẩu
            </p>
          )}
          {screen === 'reset' && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              Nhập mã xác nhận đã gửi đến email
            </p>
          )}
        </div>

        <div>
          {screen === 'login' && (
            <>
              <Input label="Tên đăng nhập / Email" name="username" type="text" placeholder="Nhập tên đăng nhập" icon={User} />
              <Input label="Mật khẩu" name="password" type="password" placeholder="Nhập mật khẩu" icon={Lock} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  <span style={{ color: '#6b7280' }}>Ghi nhớ đăng nhập</span>
                </label>
                <span onClick={() => setScreen('forgot')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>
                  Quên mật khẩu?
                </span>
              </div>
            </>
          )}

          {screen === 'register' && (
            <>
              <Input label="Tài khoản / Mã" name="username" type="text" placeholder="Mã sinh viên / UTH" icon={User} />
              <Input label="Họ và tên" name="fullName" type="text" placeholder="Nhập họ và tên" icon={User} />
              <Input label="Email" name="email" type="email" placeholder="email@uth.edu.vn" icon={Mail} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input label="Mật khẩu" name="newPassword" type="password" placeholder="Mật khẩu" icon={Lock} />
                <Input label="Xác nhận" name="confirmPassword" type="password" placeholder="Nhập lại" icon={Lock} />
              </div>
            </>
          )}

          {screen === 'forgot' && (
            <>
              <Input label="Tên đăng nhập" name="username" type="text" placeholder="Nhập tên đăng nhập" icon={User} />
              <Input label="Email" name="email" type="email" placeholder="email@uth.edu.vn" icon={Mail} />
              <Input label="Họ và tên" name="fullName" type="text" placeholder="Nhập họ và tên" icon={User} />
              <Input label="Ngày sinh (YYYY-MM-DD)" name="dateOfBirth" type="text" placeholder="VD: 2000-01-15" icon={Calendar} />
            </>
          )}

          {screen === 'reset' && (
            <>
              <Input label="Email" name="email" type="email" placeholder="email@uth.edu.vn" icon={Mail} />
              <Input label="Mã xác nhận" name="resetCode" type="text" placeholder="Nhập mã xác nhận" />
              <Input label="Mật khẩu mới" name="newPassword" type="password" placeholder="Nhập mật khẩu mới" icon={Lock} />
              <Input label="Xác nhận mật khẩu" name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" icon={Lock} />
            </>
          )}

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

          <button
            onClick={screen === 'login' ? login : screen === 'register' ? register : screen === 'forgot' ? forgot : reset}
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
            {loading ? 'Đang xử lý...' : screen === 'login' ? 'Đăng nhập' : screen === 'register' ? 'Đăng ký' : screen === 'forgot' ? 'Gửi yêu cầu' : 'Đặt lại mật khẩu'}
          </button>
        </div>

        {screen === 'login' && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#d1d5db' }}></div>
              <div style={{ position: 'relative', display: 'inline-block', padding: '0 8px', backgroundColor: 'white', fontSize: '14px', color: '#6b7280' }}>
                Hoặc
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Chưa có tài khoản?{' '}
              <span onClick={() => setScreen('register')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>
                Đăng ký ngay
              </span>
            </p>
          </div>
        )}

        {(screen === 'register' || screen === 'forgot' || screen === 'reset') && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            {screen === 'register' ? (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Tôi đã có tài khoản?{' '}
                <span onClick={() => setScreen('login')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}>
                  Đăng nhập ngay
                </span>
              </p>
            ) : (
              <span
                onClick={() => setScreen('login')}
                style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', color: '#6b7280', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Quay lại trang đăng nhập
              </span>
            )}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          © 2025 Trường Đại học UTH. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginSystem;