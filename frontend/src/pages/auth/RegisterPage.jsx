import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    affiliation: '',
    password: '',
    confirmPassword: '',
    role: 'Author'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.register({
        username: formData.username.trim() || formData.email.split('@')[0],
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        affiliation: formData.affiliation.trim(),
        password: formData.password,
        role: formData.role
      });

      if (response?.status === 'success' || response?.token) {
        setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 1500);
      } else {
        // Handle specific error messages
        const errorMsg = response?.message || 'Đăng ký thất bại';
        if (errorMsg === 'USERNAME_EXISTS') {
          setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
        } else if (errorMsg === 'EMAIL_EXISTS') {
          setError('Email đã được đăng ký. Vui lòng sử dụng email khác.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = err?.message || 'Lỗi kết nối với server';
      if (errorMsg === 'USERNAME_EXISTS') {
        setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      } else if (errorMsg === 'EMAIL_EXISTS') {
        setError('Email đã được đăng ký. Vui lòng sử dụng email khác.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-lg shadow-green-600/30 mb-4">
              <span className="material-symbols-outlined text-white text-3xl">school</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="mt-2 text-gray-500">Tham gia hệ thống quản lý hội nghị khoa học UTH</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@uth.edu.vn"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Affiliation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị công tác
              </label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleChange}
                placeholder="Đại học UTH"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Vai trò đăng ký <span className="text-red-500">*</span>
              </label>
              <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-700 text-2xl">edit_note</span>
                  <div>
                    <div className="font-semibold text-green-700">Tác giả</div>
                    <div className="text-xs text-gray-500">Gửi bài báo và theo dõi trạng thái</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                  * Các vai trò khác (Phản biện, Chủ tọa) sẽ được Admin cấp quyền
                </p>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-600 font-medium">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-700 to-green-800 text-white font-semibold rounded-xl shadow-lg shadow-green-600/30 hover:shadow-green-600/40 hover:from-green-800 hover:to-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/auth/login" className="font-semibold text-green-700 hover:text-green-800">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-white/70 text-sm">
          © 2026 UTH Conference Management System
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

