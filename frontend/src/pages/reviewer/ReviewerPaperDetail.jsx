import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ReviewerPaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myReview, setMyReview] = useState(null); // Lưu review của mình

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/papers/${id}`);
      console.log('API Response:', response.data);
      
      // Extract paper data safely
      let paperData = response.data?.data?.paper || response.data?.data || response.data?.paper || response.data;
      
      if (!paperData || !paperData.id) {
        setError('Không tìm thấy bài báo');
        setPaper(null);
        return;
      }

      // Safely normalize all fields
      const safePaper = {
        id: paperData.id,
        title: paperData.title || 'Không có tiêu đề',
        abstract: paperData.abstract || 'Không có tóm tắt',
        paper_code: paperData.paper_code || `#${paperData.id}`,
        track: paperData.track || '',
        conference: paperData.conference || '',
        file_path: paperData.file_path || '',
        submission_date: paperData.submission_date || null,
        deadline: paperData.deadline || null,
        keywords: [],
        authors: []
      };

      // Safe keywords processing
      try {
        if (paperData.keywords) {
          if (typeof paperData.keywords === 'string') {
            safePaper.keywords = paperData.keywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k.length > 0);
          } else if (Array.isArray(paperData.keywords)) {
            safePaper.keywords = paperData.keywords.filter(k => k && typeof k === 'string');
          }
        }
      } catch (e) {
        console.warn('Keywords normalize error:', e);
        safePaper.keywords = [];
      }

      // Safe authors processing
      try {
        if (paperData.authors) {
          if (typeof paperData.authors === 'string') {
            try {
              const parsed = JSON.parse(paperData.authors);
              safePaper.authors = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              safePaper.authors = [{ name: paperData.authors, affiliation: '', email: '' }];
            }
          } else if (Array.isArray(paperData.authors)) {
            safePaper.authors = paperData.authors;
          }
        }
      } catch (e) {
        console.warn('Authors normalize error:', e);
        safePaper.authors = [];
      }

      setPaper(safePaper);

      // Check if current reviewer already submitted a review
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const reviewsRes = await api.getReviewsByPaper(id).catch(() => ({ data: [] }));
        const reviews = reviewsRes.data?.data?.reviews || reviewsRes.data?.reviews || reviewsRes.data || [];
        const myReviewData = Array.isArray(reviews)
          ? reviews.find(r => r.reviewer_id === user.id)
          : null;
        setHasReviewed(!!myReviewData);
        setMyReview(myReviewData);
      } catch (e) {
        setHasReviewed(false);
        setMyReview(null);
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
      setError('Lỗi khi tải dữ liệu bài báo');
      setPaper(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">description</span>
        <p className="text-slate-500 mb-4">{error || 'Không tìm thấy bài báo'}</p>
        <button 
          onClick={() => navigate('/reviewer')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/reviewer')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại
        </button>
      </div>

      {/* Paper Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                {paper.paper_code}
              </span>
              {paper.track && (
                <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded">
                  {paper.track}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{paper.title}</h1>
            {paper.conference && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Hội nghị:</span> {paper.conference}
              </p>
            )}
          </div>
          {paper.file_path && (
            <button 
              onClick={() => window.open(paper.file_path, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined">download</span>
              Tải PDF
            </button>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-600 mb-1">Ngày nộp</p>
            <p className="font-medium text-slate-900">
              {paper.submission_date 
                ? new Date(paper.submission_date).toLocaleDateString('vi-VN')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Hạn phản biện</p>
            <p className="font-medium text-red-600">
              {paper.deadline 
                ? new Date(paper.deadline).toLocaleDateString('vi-VN')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Số tác giả</p>
            <p className="font-medium text-slate-900">{paper.authors.length} người</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Từ khóa</p>
            <p className="font-medium text-slate-900">{paper.keywords.length} từ</p>
          </div>
        </div>
      </div>

      {/* Abstract */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">description</span>
          Tóm tắt
        </h3>
        <p className="text-slate-700 leading-relaxed">{paper.abstract}</p>
      </div>

      {/* Keywords */}
      {paper.keywords.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">local_offer</span>
            Từ khóa
          </h3>
          <div className="flex flex-wrap gap-2">
            {paper.keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Authors */}
      {paper.authors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">group</span>
            Tác giả ({paper.authors.length})
          </h3>
          <div className="space-y-3">
            {paper.authors.map((author, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(author.name || author.full_name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{author.name || author.full_name || 'Không xác định'}</p>
                  {(author.affiliation || author.institution) && (
                    <p className="text-sm text-slate-600">{author.affiliation || author.institution}</p>
                  )}
                  {author.email && (
                    <p className="text-xs text-slate-500">{author.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Review History - Hiển thị nếu đã review */}
      {hasReviewed && myReview && (
        <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            Đánh giá của bạn
          </h3>
          
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-green-700 w-32">Điểm đánh giá:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-green-600">{myReview.score?.toFixed(1) || 'N/A'}</span>
                <span className="text-sm text-green-600">/5.0</span>
              </div>
            </div>
            
            {/* Comments for Author */}
            <div>
              <span className="text-sm font-medium text-green-700 block mb-2">Nhận xét cho tác giả:</span>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-slate-700 whitespace-pre-wrap">{myReview.comments_for_author || 'Không có nhận xét'}</p>
              </div>
            </div>
            
            {/* Submission Time */}
            <div className="flex items-center gap-4 text-sm text-green-600">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>
                Đã nộp lúc: {myReview.created_at 
                  ? new Date(myReview.created_at).toLocaleString('vi-VN')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!hasReviewed && (
          <button
            onClick={() => navigate(`/reviewer/papers/${id}/review`)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            <span className="material-symbols-outlined">rate_review</span>
            Bắt đầu phản biện
          </button>
        )}
        <button
          onClick={() => navigate('/reviewer')}
          className={`${hasReviewed ? 'flex-1' : ''} px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors`}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default ReviewerPaperDetail;
