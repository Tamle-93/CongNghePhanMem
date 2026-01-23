// src/pages/reviewer/ReviewPaperPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReviewPaperPage = ({ assignmentId, paperId, onNavigate }) => {
  const [paper, setPaper] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [formData, setFormData] = useState({
    score: '',
    comments_for_author: '',
    confidential_content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [paperId, assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load paper details
      const paperRes = await api.getPaper(paperId);
      if (paperRes.status === 'success') {
        setPaper(paperRes.data);
      }

      // Check if review already exists
      try {
        const reviewsRes = await api.getMyReviews();
        if (reviewsRes.status === 'success') {
          const review = reviewsRes.data.find(r => r.assignment_id === assignmentId);
          if (review) {
            setExistingReview(review);
            setFormData({
              score: review.score || '',
              comments_for_author: review.comments_for_author || '',
              confidential_content: review.confidential_content || ''
            });
          }
        }
      } catch (err) {
        console.log('No existing review');
      }
    } catch (err) {
      setError('Không thể tải thông tin bài báo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.score) {
      setError('Vui lòng chọn điểm');
      return false;
    }
    const score = parseInt(formData.score);
    if (score < 1 || score > 10) {
      setError('Điểm phải từ 1 đến 10');
      return false;
    }
    if (!formData.comments_for_author.trim()) {
      setError('Vui lòng nhập nhận xét cho tác giả');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!window.confirm('Bạn có chắc muốn gửi đánh giá này? Sau khi gửi bạn không thể chỉnh sửa.')) {
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        assignment_id: assignmentId,
        score: parseInt(formData.score),
        comments_for_author: formData.comments_for_author.trim(),
        confidential_content: formData.confidential_content.trim()
      };

      const response = await api.submitReview(reviewData);

      if (response.status === 'success') {
        alert('Gửi đánh giá thành công!');
        onNavigate('reviewer');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
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

  if (error && !paper) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate('reviewer')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const isReadOnly = existingReview !== null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('reviewer')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </button>
        {isReadOnly && (
          <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            ✓ Đã gửi đánh giá
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Paper Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin bài báo</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Tiêu đề</label>
              <p className="text-gray-900 font-medium">{paper?.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Hội nghị</label>
              <p className="text-gray-900">{paper?.conference_name}</p>
            </div>

            {paper?.track_name && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Track</label>
                <p className="text-gray-900">{paper?.track_name}</p>
              </div>
            )}

            {paper?.keywords && (
              <div>
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

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Tóm tắt</label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {paper?.abstract}
                </p>
              </div>
            </div>

            {paper?.pdf_path && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">File PDF</label>
                <a
                  href={`http://localhost:5000/${paper.pdf_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                >
                  <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Tải xuống bài báo</p>
                    <p className="text-xs text-gray-500">Click để xem PDF</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Review Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isReadOnly ? 'Đánh giá của bạn' : 'Phản biện bài báo'}
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isReadOnly && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Bạn đã gửi đánh giá cho bài báo này. Dưới đây là nội dung đánh giá của bạn.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <select
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg font-semibold"
                  required
                  disabled={isReadOnly || submitting}
                >
                  <option value="">-- Chọn điểm --</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <option key={score} value={score}>
                      {score} điểm
                    </option>
                  ))}
                </select>
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                1-3: Kém | 4-5: Trung bình | 6-7: Khá | 8-9: Tốt | 10: Xuất sắc
              </p>
            </div>

            {/* Comments for Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét cho tác giả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comments_for_author"
                value={formData.comments_for_author}
                onChange={handleChange}
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập nhận xét chi tiết về bài báo, điểm mạnh, điểm yếu, đề xuất cải thiện..."
                required
                disabled={isReadOnly || submitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                Nhận xét này sẽ được gửi đến tác giả
              </p>
            </div>

            {/* Confidential Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét riêng cho Chair (tùy chọn)
              </label>
              <textarea
                name="confidential_content"
                value={formData.confidential_content}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhận xét riêng sẽ không được gửi đến tác giả..."
                disabled={isReadOnly || submitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                Nội dung này chỉ Chair mới thấy được
              </p>
            </div>

            {/* Submit Button */}
            {!isReadOnly && (
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Gửi đánh giá
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('reviewer')}
                  disabled={submitting}
                  className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Hủy
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewPaperPage;
