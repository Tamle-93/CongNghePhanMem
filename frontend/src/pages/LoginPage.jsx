import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  
  // Auto-clear error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // State for role selection modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const navigateByRole = (role) => {
    if (role === 'Admin') navigate('/admin');
    else if (role === 'Chair') navigate('/chair');
    else if (role === 'Reviewer') navigate('/reviewer');
    else navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(formData);
      console.log('Login response:', response.data);
      
      if (response.data?.data?.token && response.data?.data?.user) {
        const { token, user } = response.data.data;
        
        // If user has multiple roles, show role selection modal
        if (user.roles && user.roles.length > 1) {
          setPendingLoginData({ token, user });
          setAvailableRoles(user.roles);
          setSelectedRole(user.roles[0]);
          setShowRoleModal(true);
          setLoading(false);
          return;
        }
        
        // Single role - proceed normally
        login(token, user);
        navigateByRole(user.roles?.[0] || 'Author');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = () => {
    if (pendingLoginData && selectedRole) {
      const { token, user } = pendingLoginData;
      const updatedUser = { ...user, selectedRole: selectedRole };
      login(token, updatedUser);
      setShowRoleModal(false);
      navigateByRole(selectedRole);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'Admin': 'Quản trị viên',
      'Chair': 'Chủ tọa hội nghị',
      'Reviewer': 'Phản biện',
      'Author': 'Tác giả'
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Admin': '👑',
      'Chair': '🎓',
      'Reviewer': '📝',
      'Author': '✍️'
    };
    return icons[role] || '👤';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">🎓</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-4">UTH-ConfMS</h1>
            <p className="text-slate-500 mt-2">Hệ thống Quản lý Hội nghị Khoa học</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <p className="text-red-700 font-semibold">Lỗi đăng nhập</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập hoặc Email</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="remember" className="ml-2 text-slate-600">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Chưa có tài khoản? </span>
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎭</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Chọn vai trò đăng nhập</h2>
              <p className="text-slate-500 text-sm mt-2">
                Tài khoản của bạn có nhiều vai trò. Vui lòng chọn vai trò để tiếp tục.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {availableRoles.map((role) => (
                <label
                  key={role}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl mr-4">{getRoleIcon(role)}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{getRoleDisplayName(role)}</p>
                    <p className="text-xs text-slate-500">
                      {role === 'Admin' && 'Quản trị toàn bộ hệ thống'}
                      {role === 'Chair' && 'Quản lý hội nghị và quyết định bài báo'}
                      {role === 'Reviewer' && 'Phản biện và đánh giá bài báo'}
                      {role === 'Author' && 'Nộp và theo dõi bài báo'}
                    </p>
                  </div>
                  {selectedRole === role && (
                    <span className="text-blue-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRoleSelection}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;


