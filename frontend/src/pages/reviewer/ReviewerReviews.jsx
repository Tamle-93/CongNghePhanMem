import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ReviewerReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Assuming there's an endpoint to get all reviews by reviewer
      const response = await api.get('/reviews/my-reviews');
      let fetchedReviews = response.data.data || [];
      
      if (filter === 'pending') {
        fetchedReviews = fetchedReviews.filter(r => !r.submitted_at);
      } else if (filter === 'submitted') {
        fetchedReviews = fetchedReviews.filter(r => r.submitted_at);
      }
      
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to assignments if reviews endpoint doesn't exist
      try {
        const response = await api.get('/assignments/my-assignments');
        const assignments = response.data.data.assignments || [];
        setReviews(assignments.map(a => ({
          id: a.id,
          paper_id: a.paper_id,
          paper_title: a.paper_title,
          conference_name: a.conference_name,
          submitted_at: a.review_submitted_at,
          deadline: a.deadline,
          score: a.review_score || null
        })));
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getScoreText = (score) => {
    if (!score) return 'Chưa chấm';
    return `${score}/10`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đánh Giá Của Tôi</h1>
        <p className="text-gray-600">Quản lý tất cả các đánh giá phản biện</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-1 p-2">
          {[
            { value: 'all', label: 'Tất cả', icon: 'list' },
            { value: 'pending', label: 'Chưa hoàn thành', icon: 'pending' },
            { value: 'submitted', label: 'Đã nộp', icon: 'check_circle' }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-2xl">rate_review</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-2xl">done_all</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.submitted_at).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">pending_actions</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => !r.submitted_at).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 text-2xl">star</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Điểm TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.score).length > 0
                  ? (reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.filter(r => r.score).length).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">rate_review</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
          <p className="text-gray-600">Bạn chưa thực hiện đánh giá nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.paper_title || `Paper #${review.paper_id}`}
                      </h3>
                      {review.score && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(review.score)}`}>
                          {getScoreText(review.score)}
                        </span>
                      )}
                      {review.submitted_at ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-300">
                          Đã nộp
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300">
                          Chưa nộp
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">event_note</span>
                        <span>{review.conference_name || 'N/A'}</span>
                      </div>
                      {review.submitted_at && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">event</span>
                          <span>Nộp: {new Date(review.submitted_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                      {!review.submitted_at && review.deadline && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          <span>Hạn: {new Date(review.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/reviewer/papers/${review.paper_id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {review.submitted_at ? 'visibility' : 'edit'}
                    </span>
                    <span>{review.submitted_at ? 'Xem' : 'Đánh giá'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewerReviews;
