import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairTimeline = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      // Mock data - replace with real API
      setMilestones([
        { id: 1, name: 'Hạn nộp bài', date: '2026-03-15T23:59:00', type: 'submission', status: 'upcoming', reminder_days: 7 },
        { id: 2, name: 'Hạn phản biện', date: '2026-04-30T23:59:00', type: 'review', status: 'upcoming', reminder_days: 3 },
        { id: 3, name: 'Thông báo kết quả', date: '2026-05-15T17:00:00', type: 'notification', status: 'upcoming', reminder_days: 1 }
      ]);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mốc thời gian này?')) return;
    setMilestones(milestones.filter(m => m.id !== id));
    alert('Đã xóa mốc thời gian');
  };

  const getMilestoneTypeColor = (type) => {
    const colors = {
      'submission': 'bg-blue-200 text-blue-800 border-blue-300',
      'review': 'bg-purple-200 text-purple-800 border-purple-300',
      'notification': 'bg-green-200 text-green-800 border-green-300',
      'conference': 'bg-orange-200 text-orange-800 border-orange-300'
    };
    return colors[type] || 'bg-gray-200 text-gray-800 border-gray-300';
  };

  const getMilestoneTypeLabel = (type) => {
    const labels = { 'submission': 'Nộp bài', 'review': 'Phản biện', 'notification': 'Thông báo', 'conference': 'Hội nghị' };
    return labels[type] || type;
  };

  const getDaysRemaining = (dateString) => {
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Mốc Thời Gian</h1>
            <p className="mt-2 text-base text-gray-600">Thiết lập các mốc thời gian quan trọng cho hội nghị</p>
          </div>
          <button onClick={() => navigate('/chair/timeline/add')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm mốc thời gian
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex gap-1 p-2 border-b border-gray-200">
            <button onClick={() => setActiveTab('timeline')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined text-xl">timeline</span>
              <span>Timeline</span>
            </button>
            <button onClick={() => setActiveTab('config')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'config' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined text-xl">settings</span>
              <span>Cấu hình</span>
            </button>
          </div>

          {activeTab === 'timeline' && (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12 text-gray-600">Đang tải...</div>
              ) : milestones.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">event</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có mốc thời gian</h3>
                  <p className="text-gray-600 mb-4">Tạo các mốc thời gian để theo dõi tiến độ hội nghị</p>
                  <button onClick={() => navigate('/chair/timeline/add')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Tạo mốc đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative">
                      {index !== milestones.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                          {index + 1}
                        </div>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{milestone.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMilestoneTypeColor(milestone.type)}`}>
                                  {getMilestoneTypeLabel(milestone.type)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">schedule</span>
                                  <span>{formatDate(milestone.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">event</span>
                                  <span className="font-medium text-blue-700">{getDaysRemaining(milestone.date)} ngày nữa</span>
                                </div>
                              </div>
                              {milestone.reminder_days && (
                                <div className="text-sm text-gray-600">
                                  <span className="material-symbols-outlined text-base align-middle">notifications</span>
                                  <span className="align-middle"> Nhắc nhở trước {milestone.reminder_days} ngày</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => navigate(`/chair/timeline/${milestone.id}/edit`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(milestone.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Email nhắc nhở tự động</p>
                  <p className="text-sm text-gray-600">Gửi email thông báo trước deadline</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                <select className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="UTC+7">UTC+7 (Việt Nam)</option>
                  <option value="UTC+8">UTC+8</option>
                  <option value="UTC+9">UTC+9</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChairTimeline;
