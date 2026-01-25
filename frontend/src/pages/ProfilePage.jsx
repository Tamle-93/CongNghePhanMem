import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.updateProfile(formData);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    Admin: 'Quản trị viên',
    Chair: 'Chủ tọa',
    Reviewer: 'Phản biện',
    Author: 'Tác giả'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-slate-500">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {user?.full_name || user?.username}
              </h2>
              
              <p className="text-sm text-slate-500 mb-4">
                {roleLabels[user?.roles?.[0]] || 'Người dùng'}
              </p>
              
              <div className="pt-4 border-t border-slate-200 space-y-2 text-sm text-left">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-lg">email</span>
                  <span className="truncate">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-lg">badge</span>
                  <span>{user?.username}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  <span>Tham gia: {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Chỉnh sửa thông tin</h3>
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-slate-500">Tên đăng nhập không thể thay đổi</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mt-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Đổi mật khẩu</h3>
              <p className="text-sm text-slate-500 mb-4">
                Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và thay đổi định kỳ.
              </p>
              <button className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </main>

      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ProfilePage;
