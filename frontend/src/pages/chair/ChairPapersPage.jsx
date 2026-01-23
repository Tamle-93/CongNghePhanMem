// src/pages/chair/ChairPapersPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairPapersPage = ({ onNavigate }) => {
  const [papers, setPapers] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [filter, setFilter] = useState('all'); // all, submitted, under_review, decided
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Decision Modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [decisionForm, setDecisionForm] = useState({
    result: '',
    final_comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      loadPapers();
    }
  }, [selectedConference]);

  const loadConferences = async () => {
    try {
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success' && response.data.conferences.length > 0) {
        setConferences(response.data.conferences);
        setSelectedConference(response.data.conferences[0].id);
      }
    } catch (err) {
      setError('Không thể tải danh sách hội nghị: ' + err.message);
    }
  };

  const loadPapers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.listPapers({ conference_id: selectedConference });
      
      if (response.status === 'success') {
        setPapers(response.data.papers || []);
      }
    } catch (err) {
      setError('Không thể tải danh sách bài báo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (paperId) => {
    onNavigate('paper-detail', { paperId });
  };

  const handleAssignReviewers = (paperId) => {
    onNavigate('assignments', { paperId });
  };

  const handleMakeDecision = (paper) => {
    setSelectedPaper(paper);
    setDecisionForm({ result: '', final_comment: '' });
    setShowDecisionModal(true);
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!decisionForm.result) {
      alert('Vui lòng chọn quyết định');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn ${decisionForm.result} bài báo này?`)) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.makeDecision({
        paper_id: selectedPaper.id,
        result: decisionForm.result,
        final_comment: decisionForm.final_comment
      });

      if (response.status === 'success') {
        alert('Đã gửi quyết định thành công!');
        setShowDecisionModal(false);
        loadPapers();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      submitted: 'Đã nộp',
      under_review: 'Đang phản biện',
      accepted: 'Chấp nhận',
      rejected: 'Từ chối',
      withdrawn: 'Đã rút'
    };
    return texts[status] || status;
  };

  const filteredPapers = papers.filter(paper => {
    if (filter === 'submitted') return paper.status === 'submitted';
    if (filter === 'under_review') return paper.status === 'under_review';
    if (filter === 'decided') return ['accepted', 'rejected'].includes(paper.status);
    return true;
  });

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
          <h2 className="text-2xl font-bold text-gray-800">Quản lý bài nộp</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{papers.length}</span> bài báo
          </p>
        </div>
        {conferences.length > 1 && (
          <select
            value={selectedConference || ''}
            onChange={(e) => setSelectedConference(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {conferences.map(conf => (
              <option key={conf.id} value={conf.id}>{conf.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đã nộp</p>
          <p className="text-2xl font-bold text-blue-600">
            {papers.filter(p => p.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang phản biện</p>
          <p className="text-2xl font-bold text-yellow-600">
            {papers.filter(p => p.status === 'under_review').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Chấp nhận</p>
          <p className="text-2xl font-bold text-green-600">
            {papers.filter(p => p.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">
            {papers.filter(p => p.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả ({papers.length})
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                filter === 'submitted'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã nộp ({papers.filter(p => p.status === 'submitted').length})
            </button>
            <button
              onClick={() => setFilter('under_review')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                filter === 'under_review'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Đang phản biện ({papers.filter(p => p.status === 'under_review').length})
            </button>
            <button
              onClick={() => setFilter('decided')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                filter === 'decided'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã quyết định ({papers.filter(p => ['accepted', 'rejected'].includes(p.status)).length})
            </button>
          </nav>
        </div>

        {/* Papers Table */}
        <div className="overflow-x-auto">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">Không có bài báo nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tác giả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPapers.map(paper => (
                  <tr key={paper.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetail(paper.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 text-left"
                      >
                        {paper.title}
                      </button>
                      {paper.track_name && (
                        <div className="text-xs text-gray-500 mt-1">{paper.track_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{paper.submitter_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
                        {getStatusText(paper.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      0/0
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetail(paper.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Xem
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleAssignReviewers(paper.id)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        Phân công
                      </button>
                      {paper.status === 'under_review' && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleMakeDecision(paper)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Quyết định
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Ra quyết định</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedPaper.title}</p>
            </div>

            <form onSubmit={submitDecision} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quyết định <span className="text-red-500">*</span>
                </label>
                <select
                  value={decisionForm.result}
                  onChange={(e) => setDecisionForm({ ...decisionForm, result: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  required
                  disabled={submitting}
                >
                  <option value="">-- Chọn quyết định --</option>
                  <option value="Accept">✓ Chấp nhận (Accept)</option>
                  <option value="Reject">✗ Từ chối (Reject)</option>
                  <option value="Revision">⟳ Yêu cầu sửa (Revision)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét cho tác giả
                </label>
                <textarea
                  value={decisionForm.final_comment}
                  onChange={(e) => setDecisionForm({ ...decisionForm, final_comment: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập nhận xét tổng hợp từ các reviewers và quyết định cuối cùng..."
                  disabled={submitting}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi quyết định'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  disabled={submitting}
                  className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChairPapersPage;
