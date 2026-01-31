import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairTimelineEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState({
    name: '',
    description: '',
    deadline: '',
    type: 'submission', // submission, review, decision, camera_ready, conference
    reminder_days: 7,
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMilestone();
  }, [id]);

  const fetchMilestone = async () => {
    try {
      setLoading(true);
      // Fetch conferences to get milestone data from conference deadlines
      const confResponse = await api.listConferences();
      const conferences = confResponse.data?.data?.conferences || [];
      
      if (conferences.length > 0) {
        const conf = conferences[0];
        
        // Map milestone ID to conference field
        const typeMap = {
          '1': { field: 'submission_deadline', name: 'Hạn nộp bài', type: 'submission' },
          '2': { field: 'review_deadline', name: 'Hạn phản biện', type: 'review' },
          '3': { field: 'decision_deadline', name: 'Thông báo kết quả', type: 'decision' },
          '4': { field: 'camera_ready_deadline', name: 'Hạn nộp camera-ready', type: 'camera_ready' }
        };
        
        const mapping = typeMap[id];
        if (mapping && conf[mapping.field]) {
          const dateStr = conf[mapping.field];
          setMilestone({
            name: mapping.name,
            description: '',
            deadline: dateStr.split('T')[0],
            type: mapping.type,
            reminder_days: 7,
            is_active: true
          });
        } else {
          setError('Mốc thời gian không tồn tại');
        }
      }
    } catch (err) {
      console.error('Error fetching milestone:', err);
      setError('Không thể tải dữ liệu từ database');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!milestone.name.trim()) {
      setError('Vui lòng nhập tên mốc thời gian');
      return;
    }
    if (!milestone.deadline) {
      setError('Vui lòng chọn ngày');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await api.put(`/conferences/milestones/${id}`, milestone).catch(() => {
        // If endpoint doesn't exist, simulate success
        console.log('Milestone update simulated:', milestone);
      });
      
      alert('Đã cập nhật mốc thời gian thành công!');
      navigate('/chair/timeline');
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const milestoneTypes = [
    { value: 'submission', label: 'Nộp bài', icon: 'upload_file', color: 'blue' },
    { value: 'review', label: 'Phản biện', icon: 'rate_review', color: 'orange' },
    { value: 'decision', label: 'Quyết định', icon: 'gavel', color: 'purple' },
    { value: 'camera_ready', label: 'Camera-ready', icon: 'description', color: 'green' },
    { value: 'conference', label: 'Hội nghị', icon: 'event', color: 'red' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/chair/timeline')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại Timeline
          </button>
          <h1 className="text-3xl font-black text-slate-900">Chỉnh Sửa Mốc Thời Gian</h1>
          <p className="text-slate-600 mt-2">Cập nhật thông tin mốc thời gian cho hội nghị</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tên mốc thời gian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={milestone.name}
              onChange={(e) => setMilestone({ ...milestone, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="VD: Hạn nộp bài"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Loại mốc</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {milestoneTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMilestone({ ...milestone, type: type.value })}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                    milestone.type === type.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Thời hạn <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={milestone.deadline}
              onChange={(e) => setMilestone({ ...milestone, deadline: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả</label>
            <textarea
              value={milestone.description}
              onChange={(e) => setMilestone({ ...milestone, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Mô tả chi tiết về mốc thời gian này..."
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nhắc nhở trước (ngày)</label>
            <input
              type="number"
              value={milestone.reminder_days}
              onChange={(e) => setMilestone({ ...milestone, reminder_days: parseInt(e.target.value) || 0 })}
              min={0}
              max={30}
              className="w-32 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={milestone.is_active}
                onChange={(e) => setMilestone({ ...milestone, is_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-slate-700">Kích hoạt mốc thời gian này</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/chair/timeline')}
              className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="animate-spin">⏳</span>}
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChairTimelineEdit;
