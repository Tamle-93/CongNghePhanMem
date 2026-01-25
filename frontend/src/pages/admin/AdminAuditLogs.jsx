import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', user_id: '', action_type: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs', { params: filters });
      if (response.data.status === 'success') {
        setLogs(response.data.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchLogs();

  const getActionColor = (actionType) => {
    if (actionType.includes('created')) return 'text-green-700';
    if (actionType.includes('updated')) return 'text-blue-700';
    if (actionType.includes('deleted') || actionType.includes('blocked')) return 'text-red-700';
    if (actionType.includes('login')) return 'text-purple-700';
    return 'text-gray-700';
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('created')) return 'add_circle';
    if (actionType.includes('updated')) return 'edit';
    if (actionType.includes('deleted')) return 'delete';
    if (actionType.includes('login')) return 'login';
    if (actionType.includes('blocked')) return 'block';
    return 'info';
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Nhật Ký Hoạt Động & Kiểm Toán</h1>
          <p className="mt-2 text-base text-gray-600">Theo dõi và kiểm tra toàn bộ hoạt động hệ thống.</p>
        </div>

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Loại hành động</label>
              <select name="action_type" value={filters.action_type} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tất cả</option>
                <option value="user_created">Tạo người dùng</option>
                <option value="user_updated">Cập nhật người dùng</option>
                <option value="user_deleted">Xóa người dùng</option>
                <option value="user_blocked">Khóa người dùng</option>
                <option value="user_unblocked">Mở khóa người dùng</option>
                <option value="login">Đăng nhập</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                <span className="material-symbols-outlined text-[20px]">search</span>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Không có nhật ký nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">Thời gian</th>
                    <th scope="col" className="px-6 py-4">Người dùng</th>
                    <th scope="col" className="px-6 py-4">Hành động</th>
                    <th scope="col" className="px-6 py-4">Bảng</th>
                    <th scope="col" className="px-6 py-4">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.user_id || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${getActionColor(log.action_type)}`}>
                          <span className="material-symbols-outlined text-base">{getActionIcon(log.action_type)}</span>
                          <span className="font-medium">{formatActionType(log.action_type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.table_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 font-medium">Xem chi tiết</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => alert('Tính năng xuất CSV đang phát triển')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất CSV
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminAuditLogs;
