import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminAddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    organization: '',
    password: '',
    roles: [],
    auto_generate_password: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'auto_generate_password') {
      setFormData(prev => ({
        ...prev,
        auto_generate_password: checked,
        password: checked ? '' : prev.password
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      roles: isChecked
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      alert('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Vui lòng nhập email hợp lệ');
      return false;
    }
    if (!formData.organization) {
      alert('Vui lòng chọn đơn vị công tác');
      return false;
    }
    if (!formData.auto_generate_password && !formData.password) {
      alert('Vui lòng nhập mật khẩu hoặc chọn tự động tạo');
      return false;
    }
    if (!formData.auto_generate_password && formData.password.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (formData.roles.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/admin/users', {
        full_name: formData.full_name,
        email: formData.email,
        organization: formData.organization,
        password: formData.auto_generate_password ? null : formData.password,
        roles: formData.roles,
        auto_generate_password: formData.auto_generate_password
      });

      if (response.data.status === 'success') {
        alert('Thêm người dùng mới thành công!');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      navigate('/admin/users');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Biểu Mẫu Thêm Người Dùng Mới
              </h3>
              <p className="text-xs text-text-sub">Hệ thống quản trị UTH-ConfMS</p>
            </div>
          </div>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="full_name">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Ví dụ: Nguyễn Văn A"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="email@uth.edu.vn"
                required
              />
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="organization">
              Đơn vị / Khoa <span className="text-red-500">*</span>
            </label>
            <select
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              required
            >
              <option value="">Chọn đơn vị công tác</option>
              <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
              <option value="Khoa Giao thông vận tải">Khoa Giao thông vận tải</option>
              <option value="Khoa Kinh tế">Khoa Kinh tế</option>
              <option value="Viện KH&CN">Viện KH&CN</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                Mật khẩu
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_generate_password"
                  name="auto_generate_password"
                  checked={formData.auto_generate_password}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="auto_generate_password">
                  Tự động tạo và gửi qua email
                </label>
              </div>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={formData.auto_generate_password}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Nhập mật khẩu hoặc để trống nếu tự động tạo"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-[20px]"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </div>
          </div>

          {/* Roles */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">shield_person</span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Phân quyền vai trò
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="relative flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark cursor-pointer hover:border-primary/50 transition-all">
                <input
                  type="checkbox"
                  name="roles"
                  value="Author"
                  checked={formData.roles.includes('Author')}
                  onChange={handleRoleChange}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">Tác giả</span>
                </div>
              </label>

              <label className="relative flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark cursor-pointer hover:border-primary/50 transition-all">
                <input
                  type="checkbox"
                  name="roles"
                  value="Reviewer"
                  checked={formData.roles.includes('Reviewer')}
                  onChange={handleRoleChange}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">Người phản biện</span>
                </div>
              </label>

              <label className="relative flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark cursor-pointer hover:border-primary/50 transition-all">
                <input
                  type="checkbox"
                  name="roles"
                  value="Chair"
                  checked={formData.roles.includes('Chair')}
                  onChange={handleRoleChange}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">Chủ tọa phân ban</span>
                </div>
              </label>
            </div>

            <p className="text-[11px] text-text-sub italic">
              Lưu ý: Một người dùng có thể đảm nhận nhiều vai trò đồng thời trong hệ thống.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            {loading ? 'Đang xử lý...' : 'Xác nhận thêm người dùng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddUser;
