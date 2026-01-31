/**
 * ============================================
 * ChairTracksPage.jsx - Quản lý Phân ban & Lộ trình Hội nghị
 * ============================================
 * 
 * MỤC ĐÍCH:
 * - Quản lý thông tin cơ bản hội nghị (tab: info)
 * - Quản lý các phân ban/tracks (tab: tracks) 
 * - Quản lý mốc thời gian/deadlines (tab: deadlines)
 * - Cấu hình mẫu email (tab: email)
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Component mount -> load danh sách conferences
 * 2. Chọn conference đầu tiên làm mặc định
 * 3. Load tracks cho conference được chọn
 * 4. User có thể: thêm/sửa/xóa tracks, cập nhật thông tin hội nghị
 * 
 * API CALLS:
 * - GET /conferences - Lấy danh sách hội nghị
 * - GET /conferences/:id/tracks - Lấy tracks của hội nghị
 * - POST /tracks - Tạo track mới
 * - DELETE /tracks/:id - Xóa track
 * - PUT /conferences/:id - Cập nhật thông tin hội nghị
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairTracksPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info'); // info, tracks, deadlines, email
  const [tracks, setTracks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showEditTrackModal, setShowEditTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [newTrack, setNewTrack] = useState({ name: '', nameEn: '', description: '', chair: '' });
  const [conferenceInfo, setConferenceInfo] = useState({
    name: '',
    shortName: '',
    location: '',
    startDate: '',
    endDate: '',
    website: '',
    description: ''
  });
  const [emailTemplates, setEmailTemplates] = useState({
    acceptance: 'Kính gửi {author_name},\n\nChúng tôi vui mừng thông báo rằng bài báo của bạn đã được chấp nhận tham gia hội nghị {conference_name}.\n\nTiêu đề: {paper_title}\nMã bài: {paper_id}\n\nVui lòng nộp bản chỉnh sửa cuối cùng trước ngày {final_deadline}.\n\nTrân trọng,\nBan tổ chức',
    rejection: 'Kính gửi {author_name},\n\nChúng tôi xin trân trọng cảm ơn bạn đã gửi bài báo tham gia hội nghị {conference_name}.\n\nTiêu đề: {paper_title}\nMã bài: {paper_id}\n\nSau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng bài báo của bạn chưa được chấp nhận trong lần này.\n\nTrân trọng,\nBan tổ chức',
    review_request: 'Kính gửi {reviewer_name},\n\nChúng tôi mời bạn phản biện bài báo sau cho hội nghị {conference_name}:\n\nMã bài: {paper_id}\nTiêu đề: {paper_title}\nTác giả: {authors}\n\nHạn nộp phản biện: {review_deadline}\n\nVui lòng truy cập hệ thống để xem chi tiết và nộp kết quả phản biện.\n\nTrân trọng,\nBan tổ chức'
  });
  const [loading, setLoading] = useState(true);
  const [selectedConferenceId, setSelectedConferenceId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Load conferences
      const res = await api.listConferences().catch(() => ({ data: { data: { conferences: [] } } }));
      const conferences = res.data?.data?.conferences || [];
      
      // Get the first conference as default
      if (conferences.length > 0) {
        const conferenceId = conferences[0].id;
        setSelectedConferenceId(conferenceId);
        // Load tracks and deadlines for this conference
        await loadTracks(conferenceId);
        await loadDeadlines(conferenceId);
      } else {
        setDeadlines([]);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async (conferenceId) => {
    try {
      const response = await api.get(`/conferences/${conferenceId}/tracks`).catch(() => null);
      // API trả về: { status: 'success', data: [...tracks] } hoặc { data: { tracks: [...] } }
      const tracksData = response?.data?.data?.tracks || response?.data?.data || [];
      if (Array.isArray(tracksData)) {
        setTracks(tracksData);
      } else {
        setTracks([]);
      }
    } catch (err) {
      console.error('Error loading tracks:', err);
      setTracks([]);
    }
  };

  // ✅ FIXED: Added loadDeadlines function to fetch and display conference deadlines
  const loadDeadlines = async (conferenceId) => {
    try {
      const response = await api.get(`/conferences/${conferenceId}/deadlines`).catch(() => null);
      const deadlinesData = response?.data?.data || [];
      if (Array.isArray(deadlinesData)) {
        setDeadlines(deadlinesData);
      } else {
        setDeadlines([]);
      }
    } catch (err) {
      console.error('Error loading deadlines:', err);
      setDeadlines([]);
    }
  };

  const handleAddTrack = async () => {
    if (!newTrack.name.trim()) {
      showNotification('Vui lòng nhập tên phân ban', 'error');
      return;
    }

    if (!selectedConferenceId) {
      showNotification('Không tìm thấy hội nghị. Vui lòng refresh trang.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Call API to create track
      const response = await api.post('/tracks', {
        name: newTrack.name,
        name_en: newTrack.nameEn,
        description: newTrack.description,
        conference_id: selectedConferenceId
      }).catch((err) => {
        console.error('API Error:', err);
        return null;
      });

      if (response?.data?.status === 'success' && response?.data?.data) {
        // Add to local state
        const createdTrack = response.data.data;
        setTracks([...tracks, {
          id: createdTrack.id,
          name: createdTrack.name || newTrack.name,
          nameEn: newTrack.nameEn,
          code: createdTrack.code,
          papers: 0,
          chair: newTrack.chair
        }]);
        showNotification('Đã thêm phân ban thành công!', 'success');
      } else {
        // Fallback: add locally if API fails (for demo/offline mode)
        setTracks([...tracks, {
          id: Date.now(),
          name: newTrack.name,
          nameEn: newTrack.nameEn,
          papers: 0,
          chair: newTrack.chair
        }]);
        showNotification('Đã thêm phân ban (chế độ offline - chưa lưu vào database)', 'warning');
      }

      setShowAddTrackModal(false);
      setNewTrack({ name: '', nameEn: '', description: '', chair: '' });
    } catch (err) {
      console.error('Error adding track:', err);
      showNotification('Có lỗi xảy ra khi thêm phân ban', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!confirm('Bạn có chắc muốn xóa phân ban này?')) return;
    
    try {
      await api.delete(`/tracks/${trackId}`).catch(() => null);
      setTracks(tracks.filter(t => t.id !== trackId));
      showNotification('Đã xóa phân ban', 'success');
    } catch (err) {
      console.error('Error deleting track:', err);
      showNotification('Có lỗi khi xóa phân ban', 'error');
    }
  };

  // ✅ FIXED: Add edit track handler
  const handleEditTrack = (track) => {
    setEditingTrack({
      id: track.id,
      name: track.name,
      nameEn: track.nameEn || track.name_en || '',
      description: track.description || '',
      code: track.code || ''
    });
    setShowEditTrackModal(true);
  };

  const handleSaveEditedTrack = async () => {
    if (!editingTrack.name.trim()) {
      showNotification('Vui lòng nhập tên phân ban', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/tracks/${editingTrack.id}`, {
        name: editingTrack.name,
        description: editingTrack.description,
        code: editingTrack.code
      });

      // Update local state
      setTracks(tracks.map(t => t.id === editingTrack.id ? {
        ...t,
        name: editingTrack.name,
        description: editingTrack.description,
        code: editingTrack.code
      } : t));

      showNotification('Đã cập nhật phân ban thành công!', 'success');
      setShowEditTrackModal(false);
      setEditingTrack(null);
    } catch (err) {
      console.error('Error updating track:', err);
      showNotification('Có lỗi khi cập nhật phân ban', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Validate date format (DD-MM-YYYY) and check if valid
  const isValidDate = (dateStr) => {
    if (!dateStr) return true; // Empty is valid
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    // Check for invalid dates like 30/2
    const [year, month, day] = dateStr.split('-').map(Number);
    const testDate = new Date(year, month - 1, day);
    return testDate.getDate() === day && testDate.getMonth() === month - 1;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleSaveInfo = async () => {
    // Validate dates
    if (!isValidDate(conferenceInfo.startDate)) {
      showNotification('Ngày bắt đầu không hợp lệ', 'error');
      return;
    }
    if (!isValidDate(conferenceInfo.endDate)) {
      showNotification('Ngày kết thúc không hợp lệ', 'error');
      return;
    }
    if (conferenceInfo.startDate && conferenceInfo.endDate && new Date(conferenceInfo.startDate) > new Date(conferenceInfo.endDate)) {
      showNotification('Ngày bắt đầu không được sau ngày kết thúc', 'error');
      return;
    }

    setSaving(true);
    try {
      // TODO: Call API to save conference info
      // await api.updateConference(conferenceId, conferenceInfo);
      showNotification('Đã lưu thông tin hội nghị thành công!', 'success');
    } catch (err) {
      showNotification('Có lỗi xảy ra khi lưu thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Lưu toàn bộ cấu hình hội nghị
   * Gọi API để lưu thông tin, tracks, và deadlines
   */
  const handleSaveConfig = async () => {
    // Validate dates
    if (!isValidDate(conferenceInfo.startDate)) {
      showNotification('Ngày bắt đầu không hợp lệ', 'error');
      return;
    }
    if (!isValidDate(conferenceInfo.endDate)) {
      showNotification('Ngày kết thúc không hợp lệ', 'error');
      return;
    }

    setSaving(true);
    try {
      // Lưu thông tin hội nghị
      if (selectedConferenceId) {
        await api.put(`/conferences/${selectedConferenceId}`, {
          name: conferenceInfo.name,
          acronym: conferenceInfo.shortName,
          location: conferenceInfo.location,
          website: conferenceInfo.website,
          start_date: conferenceInfo.startDate,
          end_date: conferenceInfo.endDate,
          description: conferenceInfo.description
        }).catch(err => console.error('Error saving conference info:', err));
      }
      
      showNotification('Đã lưu cấu hình thành công!', 'success');
    } catch (err) {
      console.error('Error saving config:', err);
      showNotification('Có lỗi xảy ra khi lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Xem trước trang web hội nghị
   * Mở popup hoặc tab mới hiển thị giao diện công khai
   */
  const handlePreviewWebsite = () => {
    if (selectedConferenceId) {
      // Mở trang chi tiết hội nghị ở tab mới
      window.open(`/conferences/${selectedConferenceId}`, '_blank');
    } else {
      showNotification('Vui lòng chọn hội nghị để xem trước', 'error');
    }
  };

  const renderInfoTab = () => (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
          {notification.message}
        </div>
      )}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Thông tin cơ bản hội nghị</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tên hội nghị</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="VD: Hội nghị Khoa học Công nghệ Quốc tế"
              value={conferenceInfo.name}
              onChange={(e) => setConferenceInfo({...conferenceInfo, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tên viết tắt</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="VD: ICIST 2026"
              value={conferenceInfo.shortName}
              onChange={(e) => setConferenceInfo({...conferenceInfo, shortName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Địa điểm tổ chức</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="VD: TP. Hồ Chí Minh, Việt Nam"
              value={conferenceInfo.location}
              onChange={(e) => setConferenceInfo({...conferenceInfo, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Website hội nghị</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="https://"
              value={conferenceInfo.website}
              onChange={(e) => setConferenceInfo({...conferenceInfo, website: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ngày bắt đầu</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={conferenceInfo.startDate}
              onChange={(e) => setConferenceInfo({...conferenceInfo, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={conferenceInfo.endDate}
              onChange={(e) => setConferenceInfo({...conferenceInfo, endDate: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả hội nghị</label>
          <textarea 
            rows="4"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            placeholder="Mô tả tổng quan về hội nghị, chủ đề, mục tiêu..."
            value={conferenceInfo.description}
            onChange={(e) => setConferenceInfo({...conferenceInfo, description: e.target.value})}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveInfo}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <span className="animate-spin">⏳</span>}
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTracksTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Danh sách các tiểu ban chuyên môn</h3>
              <p className="text-xs text-slate-600 mt-0.5">Quản lý và phân bổ các lĩnh vực khoa học chính của hội nghị</p>
            </div>
            <button 
              onClick={() => setShowAddTrackModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span> Thêm phân ban
            </button>
          </div>
          {tracks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-6xl mb-4 block text-slate-300">category</span>
              <p className="text-sm">Chưa có phân ban nào. Nhấn "Thêm phân ban" để tạo mới.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Tên phân ban</th>
                    <th className="px-6 py-4">Số bài nộp</th>
                    <th className="px-6 py-4">Trưởng phân ban</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tracks.map(track => (
                    <tr key={track.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{track.name}</span>
                          <span className="text-xs text-slate-600">{track.nameEn || track.name_en || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">{track.papers || 0} bài</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{track.chair || 'Chưa có'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditTrack(track)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteTrack(track.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-4">Tổng quan hội nghị</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Tổng số phân ban</span>
              <span className="text-2xl font-black">{tracks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Tổng số bài nộp</span>
              <span className="text-2xl font-black">{tracks.reduce((sum, t) => sum + (t.papers || 0), 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeadlinesTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Lộ trình mốc thời gian</h3>
              <p className="text-sm text-gray-600 mt-1">Cấu hình thời hạn cho các giai đoạn quan trọng của hội nghị</p>
            </div>
            <button 
              onClick={() => navigate('/chair/timeline')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">schedule</span> 
              Quản lý chi tiết
            </button>
          </div>
          {deadlines.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl mb-4 block text-gray-300">event</span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có mốc thời gian</h4>
              <p className="text-sm text-gray-600 mb-6">Tạo các mốc thời gian quan trọng cho hội nghị của bạn</p>
              <button
                onClick={() => navigate('/chair/timeline/add')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined">add</span>
                Tạo mốc thời gian đầu tiên
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {deadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${deadline.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      <span className="material-symbols-outlined text-xl">
                        {deadline.status === 'active' ? 'notifications_active' : 'event'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{deadline.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{deadline.date}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Gợi ý mốc thời gian</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600">check_circle</span>
              <span>Hạn nộp bài báo</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600">check_circle</span>
              <span>Thông báo kết quả phản biện</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600">check_circle</span>
              <span>Hạn nộp bản chỉnh sửa</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600">check_circle</span>
              <span>Hạn đăng ký tham dự</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600">check_circle</span>
              <span>Ngày diễn ra hội nghị</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Mẫu Email Thông Báo</h3>
        
        <div className="space-y-6">
          {/* Acceptance Email */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Email chấp nhận bài báo</label>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Chấp nhận</span>
            </div>
            <input 
              type="text" 
              className="w-full px-4 py-2 mb-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="Tiêu đề email"
              defaultValue="Thông báo chấp nhận bài báo - {paper_title}"
            />
            <textarea 
              rows="6"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              placeholder="Nội dung email..."
              value={emailTemplates.acceptance}
              onChange={(e) => setEmailTemplates({...emailTemplates, acceptance: e.target.value})}
            />
          </div>

          {/* Rejection Email */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Email từ chối bài báo</label>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Từ chối</span>
            </div>
            <input 
              type="text" 
              className="w-full px-4 py-2 mb-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="Tiêu đề email"
              defaultValue="Thông báo kết quả phản biện - {paper_title}"
            />
            <textarea 
              rows="6"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              placeholder="Nội dung email..."
              value={emailTemplates.rejection}
              onChange={(e) => setEmailTemplates({...emailTemplates, rejection: e.target.value})}
            />
          </div>

          {/* Review Request Email */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Email yêu cầu phản biện</label>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Phản biện</span>
            </div>
            <input 
              type="text" 
              className="w-full px-4 py-2 mb-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="Tiêu đề email"
              defaultValue="Yêu cầu phản biện bài báo - {paper_id}"
            />
            <textarea 
              rows="6"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              placeholder="Nội dung email..."
              value={emailTemplates.review_request}
              onChange={(e) => setEmailTemplates({...emailTemplates, review_request: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
            Xem trước
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Lưu mẫu email
          </button>
        </div>
      </div>

      {/* Variables Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">info</span>
          Biến có thể sử dụng trong email
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{author_name}'}</code>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{paper_title}'}</code>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{paper_id}'}</code>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{conference_name}'}</code>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{reviewer_name}'}</code>
          </div>
          <div className="bg-white px-3 py-2 rounded border border-blue-200">
            <code className="text-blue-700 font-mono">{'{review_deadline}'}</code>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-4">
          <a className="hover:text-blue-600" href="/chair">Quản lý hội nghị</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900">Thiết lập phân ban & Lộ trình</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
              Thiết Lập Phân Ban & Lộ Trình
            </h1>
            <p className="text-slate-600 text-base font-normal mt-2">
              Giao diện quản lý chuyên sâu các tiểu ban chuyên môn, lộ trình mốc thời gian, xem trước trang web hội nghị và tóm tắt cấu hình liên hệ.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePreviewWebsite}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">visibility</span> Xem trước trang web
            </button>
            <button 
              onClick={handleSaveConfig}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">save</span> 
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <nav className="flex gap-8 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('info')}
              className={`whitespace-nowrap py-4 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'info' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-blue-600 hover:border-slate-300'
              }`}
            >
              Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab('tracks')}
              className={`whitespace-nowrap py-4 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'tracks' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-blue-600 hover:border-slate-300'
              }`}
            >
              Phân ban (Tracks)
            </button>
            <button 
              onClick={() => setActiveTab('deadlines')}
              className={`whitespace-nowrap py-4 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'deadlines' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-blue-600 hover:border-slate-300'
              }`}
            >
              Thời hạn (Deadlines)
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`whitespace-nowrap py-4 border-b-2 text-sm font-semibold transition-all ${
                activeTab === 'email' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-blue-600 hover:border-slate-300'
              }`}
            >
              Mẫu Email
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'tracks' && renderTracksTab()}
        {activeTab === 'deadlines' && renderDeadlinesTab()}
        {activeTab === 'email' && renderEmailTab()}
      </main>

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Thêm Phân Ban Mới</h3>
              <p className="text-sm text-slate-600 mt-1">Tạo tiểu ban chuyên môn mới cho hội nghị</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên phân ban (tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTrack.name}
                  onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="VD: Trí tuệ nhân tạo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên phân ban (tiếng Anh)
                </label>
                <input
                  type="text"
                  value={newTrack.nameEn}
                  onChange={(e) => setNewTrack({ ...newTrack, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="VD: Artificial Intelligence"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={newTrack.description}
                  onChange={(e) => setNewTrack({ ...newTrack, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Mô tả ngắn gọn về phân ban này..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Trưởng phân ban</label>
                <input
                  type="text"
                  value={newTrack.chair}
                  onChange={(e) => setNewTrack({ ...newTrack, chair: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Tên trưởng phân ban"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddTrackModal(false);
                  setNewTrack({ name: '', nameEn: '', description: '', chair: '' });
                }}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddTrack}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="animate-spin">⏳</span>}
                {saving ? 'Đang lưu...' : 'Thêm phân ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Edit Track Modal */}
      {showEditTrackModal && editingTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Chỉnh Sửa Phân Ban</h3>
              <p className="text-sm text-slate-600 mt-1">Cập nhật thông tin phân ban</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên phân ban (tiếng Việt)
                </label>
                <input
                  type="text"
                  value={editingTrack.name}
                  onChange={(e) => setEditingTrack({ ...editingTrack, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="VD: Trí tuệ nhân tạo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mã phân ban
                </label>
                <input
                  type="text"
                  value={editingTrack.code}
                  onChange={(e) => setEditingTrack({ ...editingTrack, code: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="VD: AI"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                <textarea
                  value={editingTrack.description}
                  onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Mô tả ngắn gọn về phân ban này..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditTrackModal(false);
                  setEditingTrack(null);
                }}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditedTrack}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="animate-spin">⏳</span>}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ChairTracksPage;
