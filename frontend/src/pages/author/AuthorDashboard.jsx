// src/pages/author/AuthorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AuthorDashboard = ({ onNavigate }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.listPapers({ submitter_id: user.id });
      
      if (response.status === 'success') {
        setPapers(response.data.papers || []);
      }
    } catch (err) {
      setError('Không thể tải danh sách bài báo: ' + err.message);
      console.error('Error loading papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (paperId, paperTitle) => {
    if (!window.confirm(`Bạn có chắc muốn rút bài "${paperTitle}"?`)) {
      return;
    }

    try {
      const response = await api.withdrawPaper(paperId);
      
      if (response.status === 'success') {
        alert('Đã rút bài thành công!');
        loadPapers(); // Reload danh sách
      }
    } catch (err) {
      alert('Lỗi khi rút bài: ' + err.message);
    }
  };

  const handleViewDetail = (paperId) => {
    onNavigate('paper-detail', { paperId });
  };

  const handleEdit = (paperId) => {
    onNavigate('paper-edit', { paperId });
  };

  const handleUploadCameraReady = (paperId) => {
    onNavigate('camera-ready', { paperId });
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      camera_ready: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      submitted: 'Đã nộp',
      under_review: 'Đang phản biện',
      accepted: 'Chấp nhận',
      rejected: 'Từ chối',
      withdrawn: 'Đã rút',
      camera_ready: 'Bản hoàn chỉnh'
    };
    return texts[status] || status;
  };

  const canEdit = (paper) => {
    return paper.status === 'submitted' && !paper.is_withdrawn;
  };

  const canWithdraw = (paper) => {
    return ['submitted', 'under_review'].includes(paper.status) && !paper.is_withdrawn;
  };

  const needCameraReady = (paper) => {
    return paper.status === 'accepted' && !paper.camera_ready_path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý bài báo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{papers.length}</span> bài báo
          </p>
        </div>
        <button
          onClick={() => onNavigate('submit')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nộp bài mới</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Papers List */}
      {papers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài báo nào</h3>
          <p className="text-gray-600 mb-6">Bắt đầu bằng cách nộp bài báo đầu tiên của bạn</p>
          <button
            onClick={() => onNavigate('submit')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nộp bài ngay</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hội nghị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày nộp
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleViewDetail(paper.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 text-left"
                        >
                          {paper.title}
                        </button>
                        {paper.keywords && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Keywords:</span> {paper.keywords}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{paper.conference_name}</div>
                      {paper.track_name && (
                        <div className="text-xs text-gray-500">{paper.track_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
                        {getStatusText(paper.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(paper.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetail(paper.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                        title="Xem chi tiết"
                      >
                        Xem
                      </button>
                      
                      {canEdit(paper) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleEdit(paper.id)}
                            className="text-green-600 hover:text-green-900 font-medium"
                            title="Chỉnh sửa"
                          >
                            Sửa
                          </button>
                        </>
                      )}
                      
                      {canWithdraw(paper) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleWithdraw(paper.id, paper.title)}
                            className="text-red-600 hover:text-red-900 font-medium"
                            title="Rút bài"
                          >
                            Rút
                          </button>
                        </>
                      )}
                      
                      {needCameraReady(paper) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleUploadCameraReady(paper.id)}
                            className="text-purple-600 hover:text-purple-900 font-medium"
                            title="Nộp bản hoàn chỉnh"
                          >
                            Camera-ready
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {papers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đã nộp</div>
            <div className="text-2xl font-bold text-blue-600">
              {papers.filter(p => p.status === 'submitted').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đang phản biện</div>
            <div className="text-2xl font-bold text-yellow-600">
              {papers.filter(p => p.status === 'under_review').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Chấp nhận</div>
            <div className="text-2xl font-bold text-green-600">
              {papers.filter(p => p.status === 'accepted').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Từ chối</div>
            <div className="text-2xl font-bold text-red-600">
              {papers.filter(p => p.status === 'rejected').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;
