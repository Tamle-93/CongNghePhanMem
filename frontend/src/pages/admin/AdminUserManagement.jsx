import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: { search: searchTerm, role: selectedRole, status: selectedStatus }
      });
      if (response.data.status === 'success') {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats/users');
      if (response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => fetchUsers();

  const handleToggleBlock = async (userId, currentStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${currentStatus === 'active' ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;

    try {
      const endpoint = currentStatus === 'active' ? `/admin/users/${userId}/block` : `/admin/users/${userId}/unblock`;
      await api.put(endpoint);
      alert(`${currentStatus === 'active' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling block:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfigs = {
      'Author': { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' },
      'Reviewer': { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-300' },
      'Chair': { bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-300' },
      'Admin': { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-300' }
    };
    const config = roleConfigs[role] || roleConfigs['Author'];
    const label = { Author: 'Tác giả', Reviewer: 'Phản biện', Chair: 'Chủ tọa', Admin: 'Quản trị viên' }[role] || role;
    return (
      <span className={`px-2 py-0.5 rounded-md ${config.bg} ${config.text} text-xs font-medium border ${config.border}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-300">
          <span className="size-1.5 rounded-full bg-green-600"></span>
          Đang hoạt động
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800 border border-red-300">
        <span className="size-1.5 rounded-full bg-red-600"></span>
        Đã khóa
      </span>
    );
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-200 text-blue-800', 'bg-orange-200 text-orange-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getInitials = (name) => {
    const words = name.split(' ');
    if (words.length >= 2) return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Quản Trị Người Dùng</h1>
            <p className="mt-2 text-base text-gray-600">Quản lý tài khoản người dùng và thiết lập phân quyền RBAC toàn hệ thống.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/users/import')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Nhập hàng loạt
            </button>
            <button onClick={() => navigate('/admin/users/add')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số người dùng</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.total.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <h3 className="text-3xl font-bold mt-1 text-green-700">{stats.active.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                <span className="material-symbols-outlined">person_check</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã khóa</p>
                <h3 className="text-3xl font-bold mt-1 text-red-700">{stats.blocked.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <span className="material-symbols-outlined">person_off</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tìm kiếm theo họ tên, email hoặc đơn vị..." />
          </div>
          <div className="flex gap-3">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]">
              <option value="">Tất cả vai trò</option>
              <option value="Author">Tác giả</option>
              <option value="Reviewer">Phản biện</option>
              <option value="Chair">Chủ tọa</option>
              <option value="Admin">Quản trị viên</option>
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]">
              <option value="">Mọi trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Đã khóa</option>
            </select>
            <button onClick={handleSearch} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <span className="material-symbols-outlined text-[20px] leading-none">filter_list</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải dữ liệu...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Không tìm thấy người dùng nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">Người dùng</th>
                    <th scope="col" className="px-6 py-4">Đơn vị / Khoa</th>
                    <th scope="col" className="px-6 py-4">Vai trò hệ thống</th>
                    <th scope="col" className="px-6 py-4">Trạng thái</th>
                    <th scope="col" className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center font-bold ${getAvatarColor(user.full_name)}`}>
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-base">{user.full_name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{user.organization || 'Chưa cập nhật'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.map((role, index) => (
                            <span key={index}>{getRoleBadge(role)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/users/${user.id}/edit`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Thay đổi vai trò">
                            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                          </button>
                          {user.status === 'active' ? (
                            <button onClick={() => handleToggleBlock(user.id, 'active')} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Khóa tài khoản">
                              <span className="material-symbols-outlined text-[20px]">block</span>
                            </button>
                          ) : (
                            <button onClick={() => handleToggleBlock(user.id, 'blocked')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mở khóa tài khoản">
                              <span className="material-symbols-outlined text-[20px]">lock_open</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagement;
