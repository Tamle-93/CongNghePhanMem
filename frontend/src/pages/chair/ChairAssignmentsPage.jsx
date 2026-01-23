// src/pages/chair/ChairAssignmentsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairAssignmentsPage = ({ onNavigate, paperId: initialPaperId }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      loadConferenceData();
    }
  }, [selectedConference]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load conferences
      const confRes = await api.listConferences({ page: 1, per_page: 100 });
      if (confRes.status === 'success' && confRes.data.conferences.length > 0) {
        setConferences(confRes.data.conferences);
        setSelectedConference(confRes.data.conferences[0].id);
      }

      // Load reviewers
      const reviewersRes = await api.listReviewers();
      if (reviewersRes.status === 'success') {
        setReviewers(reviewersRes.data || []);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConferenceData = async () => {
    try {
      // Load papers
      const papersRes = await api.listPapers({ conference_id: selectedConference });
      if (papersRes.status === 'success') {
        setPapers(papersRes.data.papers || []);
      }

      // Load assignments
      const assignmentsRes = await api.getConferenceAssignments(selectedConference);
      if (assignmentsRes.status === 'success') {
        setAssignments(assignmentsRes.data.assignments || []);
      }
    } catch (err) {
      console.error('Error loading conference data:', err);
    }
  };

  const handleAssignReviewers = (paper) => {
    setSelectedPaper(paper);
    setSelectedReviewers([]);
    setShowAssignModal(true);
  };

  const toggleReviewer = (reviewerId) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        return prev.filter(id => id !== reviewerId);
      } else {
        return [...prev, reviewerId];
      }
    });
  };

  const submitAssignments = async () => {
    if (selectedReviewers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 reviewer');
      return;
    }

    setSubmitting(true);

    try {
      const promises = selectedReviewers.map(reviewerId =>
        api.createAssignment({
          conference_id: selectedConference,
          paper_id: selectedPaper.id,
          reviewer_id: reviewerId
        })
      );

      await Promise.all(promises);
      
      alert(`Đã phân công ${selectedReviewers.length} reviewers thành công!`);
      setShowAssignModal(false);
      loadConferenceData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phân công này?')) {
      return;
    }

    try {
      await api.deleteAssignment(assignmentId);
      alert('Đã xóa phân công thành công!');
      loadConferenceData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getAssignmentsForPaper = (paperId) => {
    return assignments.filter(a => a.paper_id === paperId);
  };

  const getReviewProgress = (paperId) => {
    const paperAssignments = getAssignmentsForPaper(paperId);
    if (paperAssignments.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    const completed = paperAssignments.filter(a => a.review_submitted).length;
    return {
      total: paperAssignments.length,
      completed,
      percentage: Math.round((completed / paperAssignments.length) * 100)
    };
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
          <h2 className="text-2xl font-bold text-gray-800">Phân công phản biện</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý việc phân công reviewers cho các bài báo
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
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Tổng phân công</h3>
          <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Đã phản biện</h3>
          <p className="text-3xl font-bold text-green-600">
            {assignments.filter(a => a.review_submitted).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Chưa phản biện</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {assignments.filter(a => !a.review_submitted).length}
          </p>
        </div>
      </div>

      {/* Papers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách bài báo và phân công</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {papers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">Chưa có bài báo nào</p>
            </div>
          ) : (
            papers.map(paper => {
              const progress = getReviewProgress(paper.id);
              const paperAssignments = getAssignmentsForPaper(paper.id);

              return (
                <div key={paper.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Tác giả: {paper.submitter_name}</span>
                        <span>•</span>
                        <span>Track: {paper.track_name || 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignReviewers(paper)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Phân công
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ phản biện</span>
                      <span className="font-medium text-gray-900">
                        {progress.completed}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Assignments List */}
                  {paperAssignments.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Reviewers đã phân công:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {paperAssignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{assignment.reviewer_name}</p>
                                <p className="text-xs text-gray-500">{assignment.reviewer_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {assignment.review_submitted ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                  ✓ Đã phản biện
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  ⏳ Chưa
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Xóa phân công"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {paperAssignments.length === 0 && (
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">⚠️ Chưa phân công reviewer nào cho bài này</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Phân công Reviewers</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedPaper.title}</p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Chọn các reviewers để phân công cho bài báo này:
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reviewers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Không có reviewer nào</p>
                ) : (
                  reviewers.map(reviewer => (
                    <label
                      key={reviewer.id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReviewers.includes(reviewer.id)}
                        onChange={() => toggleReviewer(reviewer.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900">{reviewer.full_name}</p>
                        <p className="text-sm text-gray-500">{reviewer.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Đã chọn: <span className="font-bold">{selectedReviewers.length}</span> reviewers
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-4">
              <button
                onClick={submitAssignments}
                disabled={submitting || selectedReviewers.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300 transition"
              >
                {submitting ? 'Đang phân công...' : `Phân công ${selectedReviewers.length} reviewers`}
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={submitting}
                className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChairAssignmentsPage;
