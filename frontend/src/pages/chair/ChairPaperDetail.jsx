/**
 * ============================================
 * ChairPaperDetail.jsx - Trang Chi Tiết Bài Báo cho Chair
 * ============================================
 * 
 * MỤC ĐÍCH:
 * - Hiển thị chi tiết đầy đủ của một bài báo cho Chair xem xét
 * - Cho phép Chair xem thông tin tác giả, abstract, file PDF
 * - Hiển thị danh sách phản biện được phân công và kết quả review
 * - Cung cấp các action: phân công phản biện, ra quyết định
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Component mount -> lấy paper ID từ URL params
 * 2. Gọi API lấy thông tin paper và reviews
 * 3. Hiển thị thông tin chi tiết
 * 4. Chair có thể: xem PDF, phân công reviewer, ra quyết định
 * 
 * PROPS: Không có (lấy ID từ useParams)
 * 
 * STATE:
 * - paper: Object chứa thông tin bài báo
 * - reviews: Array các bài review
 * - assignments: Array các phân công reviewer
 * - loading: Boolean trạng thái loading
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ChairPaperDetail() {
  // ========== HOOKS & STATE ==========
  const { id } = useParams();  // Lấy paper ID từ URL
  const navigate = useNavigate();
  
  const [paper, setPaper] = useState(null);       // Thông tin bài báo
  const [reviews, setReviews] = useState([]);     // Danh sách reviews
  const [assignments, setAssignments] = useState([]); // Danh sách assignments
  const [loading, setLoading] = useState(true);   // Trạng thái loading

  // ========== EFFECTS ==========
  /**
   * Effect: Fetch dữ liệu khi component mount hoặc ID thay đổi
   * - Gọi API lấy paper detail
   * - Gọi API lấy reviews của paper
   */
  useEffect(() => {
    fetchPaperDetail();
  }, [id]);

  // ========== API CALLS ==========
  /**
   * Lấy thông tin chi tiết bài báo và reviews
   * - GET /papers/:id - Lấy paper info
   * - GET /papers/:id/reviews - Lấy danh sách reviews
   */
  const fetchPaperDetail = async () => {
    try {
      setLoading(true);
      
      // Gọi song song 3 API để tối ưu thời gian
      const [paperRes, reviewsRes, assignmentsRes] = await Promise.all([
        api.getPaperById(id),
        api.getReviewsByPaper(id).catch(() => ({ data: { data: [] } })),
        api.get(`/assignments/paper/${id}`).catch(() => ({ data: { data: { assignments: [] } } }))
      ]);
      
      // ✅ FIXED: Correct data path from API response
      const paperData = paperRes.data?.data;
      if (!paperData) {
        console.error('Invalid paper response:', paperRes.data);
        return;
      }
      
      setPaper(paperData);
      
      // ✅ FIXED: Handle multiple possible response structures for reviews
      let reviewsData = reviewsRes.data?.data?.reviews;
      if (reviewsData && typeof reviewsData === 'object' && !Array.isArray(reviewsData)) {
        reviewsData = reviewsData.reviews || [];
      }
      if (!Array.isArray(reviewsData)) {
        reviewsData = reviewsRes.data?.data || reviewsRes.data?.reviews || [];
      }
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // ✅ FIXED: Handle assignments response
      let assignmentsData = assignmentsRes.data?.data?.assignments || [];
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error('Error fetching paper:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== HELPER FUNCTIONS ==========
  /**
   * Trả về class CSS dựa trên status của paper
   * @param {string} status - Trạng thái bài báo
   * @returns {string} CSS classes cho badge
   */
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      submitted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
      revision_required: 'bg-orange-100 text-orange-700 border-orange-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      camera_ready: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[statusLower] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  /**
   * Chuyển đổi status code thành label tiếng Việt
   * @param {string} status - Trạng thái bài báo
   * @returns {string} Label tiếng Việt
   */
  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase();
    const labels = {
      submitted: 'Chờ phân công',
      pending: 'Chờ phân công',
      under_review: 'Đang phản biện',
      reviewed: 'Đã phản biện',
      revision_required: 'Yêu cầu chỉnh sửa',
      accepted: 'Đã chấp nhận',
      rejected: 'Từ chối',
      camera_ready: 'Camera-Ready',
    };
    return labels[statusLower] || status;
  };

  /**
   * Tính số lượng reviewer đã được phân công
   * @returns {number} Số reviewer đã phân công
   */
  const getTotalAssignedReviewers = () => {
    // Count unique reviewers từ assignments
    if (!Array.isArray(assignments)) return 0;
    const uniqueReviewers = new Set(assignments.map(a => a.reviewer_id));
    return uniqueReviewers.size;
  };

  /**
   * Tính điểm trung bình từ các reviews
   * @returns {string} Điểm trung bình (1 decimal)
   */
  const calculateAverageScore = () => {
    try {
      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 'N/A';
      const total = reviews.reduce((sum, r) => {
        // Backend trả về 'score' hoặc 'overall_score'
        const score = parseFloat(r.overall_score || r.score) || 0;
        return sum + score;
      }, 0);
      return (total / reviews.length).toFixed(1);
    } catch (error) {
      console.error('Error calculating average score:', error, reviews);
      return 'N/A';
    }
  };

  // ========== RENDER: LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ========== RENDER: NOT FOUND ==========
  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">description_off</span>
        <p className="text-slate-500">Không tìm thấy bài báo</p>
        <button
          onClick={() => navigate('/chair/papers')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // ========== RENDER: MAIN CONTENT ==========
  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6 p-6">
      {/* ===== BREADCRUMB & BACK BUTTON ===== */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/chair/papers" className="hover:text-blue-600">Quản lý bài nộp</Link>
          <span>/</span>
          <span className="text-slate-900">Chi tiết bài báo</span>
        </div>
        <button 
          onClick={() => navigate('/chair/papers')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 w-fit"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại danh sách
        </button>
      </div>

      {/* ===== PAPER INFO CARD ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Header với title và status */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{paper.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paper.status)}`}>
                {getStatusLabel(paper.status)}
              </span>
              <span className="text-sm text-slate-500">
                Mã bài: #{paper.id || paper.paper_id}
              </span>
              <span className="text-sm text-slate-500">
                Nộp ngày: {paper.created_at ? new Date(paper.created_at).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {(paper.status === 'pending' || paper.status === 'submitted') && (
              <button
                onClick={() => navigate(`/chair/papers/${id}/assign`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span className="material-symbols-outlined">person_add</span>
                Phân công phản biện
              </button>
            )}
            {(paper.status === 'under_review' || paper.status === 'reviewed') && (
              <button
                onClick={() => navigate(`/chair/papers/${id}/decision`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <span className="material-symbols-outlined">gavel</span>
                Ra quyết định
              </button>
            )}
          </div>
        </div>

        {/* ===== THÔNG TIN CHI TIẾT ===== */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin bài báo */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Tác giả</h3>
              <p className="text-slate-900">
                {typeof paper.authors === 'string' 
                  ? paper.authors 
                  : Array.isArray(paper.authors) 
                    ? paper.authors.map(a => a.name || a.full_name || a.email).join(', ')
                    : paper.submitter_name || 'Chưa có thông tin'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Phân ban</h3>
              <p className="text-slate-900">{paper.track_name || paper.track || 'Chung'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Từ khóa</h3>
              <div className="flex flex-wrap gap-2">
                {(paper.keywords || '').split(',').map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Cột phải: Thống kê review */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Phản biện được phân công</h3>
              <p className="text-2xl font-bold text-slate-900">
                {getTotalAssignedReviewers()}
              </p>
              <p className="text-xs text-slate-500 mt-1">{reviews.length} đã hoàn tất</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Điểm trung bình</h3>
              <p className="text-2xl font-bold text-blue-600">{calculateAverageScore()}</p>
            </div>
            
            {paper.pdf_path && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">File bài báo</h3>
                <button 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const paperId = paper.id || paper.paper_id;
                      const response = await fetch(`http://localhost:5000/api/papers/${paperId}/pdf`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (!response.ok) throw new Error('Failed to fetch PDF');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      window.open(url, '_blank');
                      // Clean up after a delay
                      setTimeout(() => window.URL.revokeObjectURL(url), 100);
                    } catch (error) {
                      console.error('Error loading PDF:', error);
                      alert('Không thể tải file PDF. Vui lòng thử lại.');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                  Xem PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== ABSTRACT ===== */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Tóm tắt (Abstract)</h3>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{paper.abstract}</p>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">rate_review</span>
          Kết quả phản biện ({Array.isArray(reviews) ? reviews.length : 0})
        </h2>

        {!Array.isArray(reviews) || reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 block">pending</span>
            <p>Chưa có kết quả phản biện</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={review.id || index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-900">
                    Phản biện #{index + 1} - {review.reviewer_name || 'Reviewer'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    Điểm: {review.overall_score || review.score || 'N/A'}
                  </span>
                </div>
                
                {(review.comments_for_author || review.comments) && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-slate-600 mb-1">Nhận xét:</h4>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{review.comments_for_author || review.comments}</p>
                  </div>
                )}
                
                {review.recommendation && (
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Khuyến nghị: </span>
                    <span className={`font-bold ${
                      review.recommendation === 'accept' ? 'text-green-600' :
                      review.recommendation === 'reject' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {review.recommendation === 'accept' ? 'Chấp nhận' :
                       review.recommendation === 'reject' ? 'Từ chối' : 'Chỉnh sửa'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
