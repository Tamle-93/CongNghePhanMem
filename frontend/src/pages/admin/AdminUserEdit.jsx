import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { getSaveErrorMessage } from '../../utils/errorHandler';

const AdminUserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    organization: '',
    roles: [],
    is_blocked: false
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      if (response.data.status === 'success') {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          organization: userData.organization || '',
          roles: userData.roles || [],
          is_blocked: userData.status === 'blocked'
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Không thể tải thông tin người dùng');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.roles.length === 0) {
      alert('Vui lòng chọn ít nhất một vai trò');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/admin/users/${id}`, formData);
      
      if (response.data.status === 'success') {
        alert('Cập nhật người dùng thành công!');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(getSaveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Chỉnh Sửa Người Dùng
              </h3>
              <p className="text-xs text-gray-500">ID: {id}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/users')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700" htmlFor="full_name">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="organization">
              Đơn vị / Khoa
            </label>
            <select
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn đơn vị --</option>
              <option value="cntt">Khoa Công nghệ Thông tin</option>
              <option value="dien">Khoa Điện - Điện tử</option>
              <option value="co_khi">Khoa Cơ khí</option>
              <option value="kinh_te">Khoa Kinh tế</option>
              <option value="khac">Khác</option>
            </select>
          </div>

          {/* Roles */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">shield_person</span>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Phân quyền vai trò
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Author', 'Reviewer', 'Chair', 'Admin'].map((role) => (
                <label 
                  key={role}
                  className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.roles.includes(role) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:border-blue-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleRoleChange}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-900">
                    {role === 'Author' && 'Tác giả'}
                    {role === 'Reviewer' && 'Phản biện'}
                    {role === 'Chair' && 'Chủ tọa'}
                    {role === 'Admin' && 'Quản trị viên'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Trạng thái tài khoản</h4>
                <p className="text-xs text-gray-500 mt-1">Khóa tài khoản sẽ ngăn người dùng đăng nhập</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_blocked"
                  checked={formData.is_blocked}
                  onChange={handleInputChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {formData.is_blocked ? 'Đã khóa' : 'Hoạt động'}
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserEdit;
