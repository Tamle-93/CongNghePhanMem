import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ReviewerAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/assignments/my-assignments', { params });
      setAssignments(response.data.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      overdue: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chưa bắt đầu',
      in_progress: 'Đang xử lý',
      completed: 'Hoàn thành',
      overdue: 'Quá hạn'
    };
    return texts[status] || status;
  };

  const handleViewPaper = (assignmentId, paperId) => {
    navigate(`/reviewer/papers/${paperId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải phân công...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phân Công Phản Biện</h1>
        <p className="text-gray-600">Danh sách các bài báo được phân công để phản biện</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-1 p-2">
          {[
            { value: 'all', label: 'Tất cả', icon: 'list' },
            { value: 'pending', label: 'Chưa bắt đầu', icon: 'schedule' },
            { value: 'in_progress', label: 'Đang xử lý', icon: 'pending' },
            { value: 'completed', label: 'Hoàn thành', icon: 'check_circle' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">assignment</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có phân công nào</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Bạn chưa được phân công phản biện bài báo nào.'
              : `Không có phân công nào ở trạng thái "${getStatusText(filter)}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.paper_title || `Paper #${assignment.paper_id}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                        {getStatusText(assignment.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">description</span>
                        <span>ID: {assignment.paper_id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">event</span>
                        <span>Hạn: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}</span>
                      </div>
                      {assignment.conference_name && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">event_note</span>
                          <span>{assignment.conference_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewPaper(assignment.id, assignment.paper_id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    <span>Xem chi tiết</span>
                  </button>
                </div>

                {/* Progress Info */}
                {assignment.review_submitted_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Đã nộp đánh giá vào {new Date(assignment.review_submitted_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                )}

                {assignment.status === 'overdue' && !assignment.review_submitted_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span className="material-symbols-outlined text-base">warning</span>
                      <span>Đã quá hạn phản biện. Vui lòng hoàn thành sớm nhất có thể.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewerAssignments;
