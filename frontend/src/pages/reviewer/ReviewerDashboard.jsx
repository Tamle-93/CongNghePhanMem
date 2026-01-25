import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/my-assignments');
      if (response.data.status === 'success') {
        setAssignments(response.data.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Fallback to empty array if error
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chưa bắt đầu', icon: 'schedule' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang thực hiện', icon: 'edit' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã hoàn tất', icon: 'check_circle' }
    };
    return badges[status] || badges.pending;
  };

  const getFilteredAssignments = () => {
    return assignments.filter(assignment => {
      const matchConference = selectedConference === 'all' || assignment.conference_name === selectedConference;
      const matchStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
      return matchConference && matchStatus;
    });
  };

  const uniqueConferences = [...new Set(assignments.map(a => a.conference_name))];
  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Phân công của tôi</h2>
          <p className="text-sm text-slate-600">Quản lý các bài báo khoa học đã được phân công phản biện</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Hội nghị</label>
          <select 
            value={selectedConference}
            onChange={(e) => setSelectedConference(e.target.value)}
            className="w-full rounded-lg border-slate-300 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="all">Tất cả hội nghị</option>
            {uniqueConferences.map(conf => (
              <option key={conf} value={conf}>{conf}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Trạng thái</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border-slate-300 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chưa bắt đầu</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Đã hoàn tất</option>
          </select>
        </div>

        <button 
          onClick={fetchAssignments}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm h-[42px] hover:bg-blue-600 transition-colors"
        >
          Lọc
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Mã bài</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Tiêu đề</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Hội nghị</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Hạn nộp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-6xl text-slate-300 mb-2">inbox</span>
                      <p className="text-slate-500">Không có phân công nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const badge = getStatusBadge(assignment.status);
                  return (
                    <tr key={assignment.assignment_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                          {assignment.paper_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 line-clamp-2">{assignment.paper_title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{assignment.conference_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(assignment.deadline).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/reviewer/papers/${assignment.paper_id}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Xem chi tiết
                          </button>
                          {assignment.status !== 'completed' && (
                            <button
                              onClick={() => navigate(`/reviewer/papers/${assignment.paper_id}/review`)}
                              className="text-sm font-medium text-green-600 hover:text-green-700"
                            >
                              {assignment.status === 'pending' ? 'Bắt đầu' : 'Tiếp tục'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;





