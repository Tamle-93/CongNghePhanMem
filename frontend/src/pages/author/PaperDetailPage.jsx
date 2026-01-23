// src/pages/author/PaperDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PaperDetailPage = ({ paperId, onNavigate, isChair = false }) => {
  const [paper, setPaper] = useState(null);
  const [decision, setDecision] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [paperId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load paper details
      const paperRes = await api.getPaper(paperId);
      if (paperRes.status === 'success') {
        setPaper(paperRes.data);
      }

      // Try to load decision
      try {
        const decisionRes = await api.getPaperDecision(paperId);
        if (decisionRes.status === 'success') {
          setDecision(decisionRes.data);
        }
      } catch (err) {
        // Decision not found - it's okay
        console.log('No decision yet');
      }

      // Try to load reviews (if decision exists or user is chair)
      if (isChair || user.role === 'Chair') {
        try {
          const reviewsRes = await api.getPaperReviews(paperId);
          if (reviewsRes.status === 'success') {
            setReviews(reviewsRes.data.reviews || []);
          }
        } catch (err) {
          console.log('Cannot load reviews');
        }
      }
    } catch (err) {
      setError('Không thể tải thông tin bài báo: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  if (error || !paper) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate(isChair ? 'papers' : 'author')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Không tìm thấy bài báo'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(isChair ? 'papers' : 'author')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(paper.status)}`}>
          {getStatusText(paper.status)}
        </span>
      </div>

      {/* Paper Information */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{paper.title}</h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Hội nghị</label>
            <p className="text-gray-900 font-medium">{paper.conference_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Track</label>
            <p className="text-gray-900">{paper.track_name || 'Không có'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Người nộp</label>
            <p className="text-gray-900">{paper.submitter_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Ngày nộp</label>
            <p className="text-gray-900">
              {new Date(paper.created_at).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Keywords */}
        {paper.keywords && (
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-500 block mb-2">Từ khóa</label>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.split(',').map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Abstract */}
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-500 block mb-2">Tóm tắt</label>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{paper.abstract}</p>
        </div>

        {/* Authors */}
        {paper.authors && paper.authors.length > 0 && (
          <div className="mb-8">
            <label className="text-sm font-medium text-gray-500 block mb-3">Tác giả</label>
            <div className="space-y-2">
              {paper.authors.map((author, idx) => (
                <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{author.full_name}</p>
                    <p className="text-sm text-gray-600">{author.email}</p>
                    {author.affiliation && (
                      <p className="text-sm text-gray-500 mt-1">{author.affiliation}</p>
                    )}
                  </div>
                  {author.is_corresponding && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Corresponding
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File */}
        <div className="border-t pt-6">
          <label className="text-sm font-medium text-gray-500 block mb-2">File đính kèm</label>
          <div className="flex items-center space-x-4">
            <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Paper.pdf</p>
              <p className="text-sm text-gray-500">{paper.pdf_path}</p>
            </div>
            <a
              href={`http://localhost:5000/${paper.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Tải xuống
            </a>
          </div>
        </div>

        {/* Camera Ready */}
        {paper.camera_ready_path && (
          <div className="border-t pt-6 mt-6">
            <label className="text-sm font-medium text-gray-500 block mb-2">Bản hoàn chỉnh (Camera-ready)</label>
            <div className="flex items-center space-x-4">
              <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Camera-Ready.pdf</p>
                <p className="text-sm text-gray-500">{paper.camera_ready_path}</p>
              </div>
              <a
                href={`http://localhost:5000/${paper.camera_ready_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Tải xuống
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Đánh giá từ Reviewers
          </h3>
          <div className="space-y-6">
            {reviews.map((review, idx) => (
              <div key={review.id} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Reviewer {idx + 1}</span>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                      Điểm: {review.score}/10
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {review.comments_for_author && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{review.comments_for_author}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Section */}
      {decision && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quyết định
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Kết quả:</span>
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                decision.result === 'Accept' ? 'bg-green-100 text-green-800' :
                decision.result === 'Reject' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {decision.result}
              </span>
            </div>
            {decision.final_comment && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-700 block mb-2">Nhận xét từ Chair:</label>
                <p className="text-gray-700 whitespace-pre-wrap">{decision.final_comment}</p>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Quyết định bởi: {decision.chair_name} • {new Date(decision.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetailPage;
