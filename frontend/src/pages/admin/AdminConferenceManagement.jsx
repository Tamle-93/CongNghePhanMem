import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

const AdminConferenceManagement = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchConferences();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchConferences, 60000);
    
    // Refresh when tab is focused
    const handleFocus = () => fetchConferences();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/conferences', {
        params: { search: searchTerm, status: selectedStatus }
      });
      if (response.data.status === 'success') {
        setConferences(response.data.data.conferences);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setConferences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchConferences();

  const handleToggleActive = async (conferenceId, currentStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${currentStatus === 'active' ? 'tắt' : 'kích hoạt'} hội nghị này?`)) return;

    try {
      const endpoint = currentStatus === 'active' 
        ? `/admin/conferences/${conferenceId}/deactivate` 
        : `/admin/conferences/${conferenceId}/activate`;
      await api.put(endpoint);
      alert(`${currentStatus === 'active' ? 'Tắt' : 'Kích hoạt'} hội nghị thành công!`);
      fetchConferences();
    } catch (error) {
      console.error('Error toggling conference status:', error);
      alert(getErrorMessage(error, 'Không thể thay đổi trạng thái hội nghị. Vui lòng thử lại.'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfigs = {
      'active': { bg: 'bg-green-200', text: 'text-green-800', label: 'Đang hoạt động' },
      'inactive': { bg: 'bg-gray-200', text: 'text-gray-800', label: 'Không hoạt động' },
      'upcoming': { bg: 'bg-blue-200', text: 'text-blue-800', label: 'Sắp diễn ra' },
      'completed': { bg: 'bg-purple-200', text: 'text-purple-800', label: 'Đã kết thúc' }
    };
    const config = statusConfigs[status] || statusConfigs['inactive'];
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Quản Lý Hội Nghị</h1>
            <p className="mt-2 text-base text-gray-600">Quản lý thông tin và cấu hình các hội nghị khoa học.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchConferences}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button 
              onClick={() => navigate('/admin/conferences/create')} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden sm:inline">Tạo hội nghị</span>
            </button>
          </div>
        </div>

        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tìm kiếm theo tên hoặc từ viết tắt..." />
          </div>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="completed">Đã kết thúc</option>
          </select>
          <button onClick={handleSearch} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            <span className="material-symbols-outlined text-[20px] leading-none">filter_list</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải dữ liệu...</div>
          ) : conferences.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Không tìm thấy hội nghị nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">Hội nghị</th>
                    <th scope="col" className="px-6 py-4">Chủ tọa</th>
                    <th scope="col" className="px-6 py-4">Tổ chức</th>
                    <th scope="col" className="px-6 py-4">Trạng thái</th>
                    <th scope="col" className="px-6 py-4">Số bài</th>
                    <th scope="col" className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {conferences.map((conference) => (
                    <tr key={conference.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900 text-base">{conference.name}</div>
                          <div className="text-xs text-gray-500">{conference.acronym} • {conference.year}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{conference.chair_name || 'Chưa có'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{conference.organization || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(conference.status)}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{conference.paper_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/admin/conferences/${conference.id}/edit`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          {conference.status === 'active' ? (
                            <button onClick={() => handleToggleActive(conference.id, 'active')} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Tắt hội nghị">
                              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                            </button>
                          ) : (
                            <button onClick={() => handleToggleActive(conference.id, 'inactive')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Kích hoạt">
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
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

export default AdminConferenceManagement;
