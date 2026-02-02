import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSaveErrorMessage } from '../../utils/errorHandler';

export default function ChairDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [decision, setDecision] = useState('accepted'); // accepted, revision_required, rejected
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [paperRes, reviewsRes] = await Promise.all([
        api.getPaperById(id),
        api.getReviewsByPaper(id).catch(() => ({ data: { data: [] } }))
      ]);
      
      // ✅ FIXED: Extract paper and reviews from API response correctly
      // API returns: { status: 'success', data: {...paperData} }
      const paperData = paperRes.data?.data || paperRes.data;
      setPaper(paperData);
      
      // Reviews API returns: { status: 'success', data: [...reviews] }
      const reviewsData = reviewsRes.data?.data?.reviews || reviewsRes.data?.reviews || reviewsRes.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Pre-fill feedback template based on decision
      generateFeedbackTemplate('accepted');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedbackTemplate = (decisionType) => {
    const templates = {
      accepted: `Kính gửi tác giả,

Hội đồng chương trình đã xem xét kỹ lưỡng bài báo của quý vị và rất vui mừng thông báo rằng bài báo đã được CHẤP NHẬN để công bố tại hội nghị.

Các ý kiến đóng góp từ phản biện đã được tổng hợp và gửi kèm theo. Vui lòng xem xét các góp ý này khi hoàn thiện bản Camera-ready.

Vui lòng nộp bản Camera-ready trước ngày [deadline] theo hướng dẫn đính kèm.

Trân trọng,
Ban Chương Trình`,
      
      revision_required: `Kính gửi tác giả,

Sau khi xem xét ý kiến từ Hội đồng phản biện, bài báo của quý vị cần được CHỈNH SỬA trước khi có thể được chấp nhận.

Các vấn đề cần giải quyết:
[Liệt kê các yêu cầu chính từ reviewers]

Vui lòng nộp bản chỉnh sửa kèm theo giải trình (Response to Reviewers) trước ngày [deadline].

Trân trọng,
Ban Chương Trình`,
      
      rejected: `Kính gửi tác giả,

Chúng tôi rất tiếc phải thông báo rằng bài báo của quý vị KHÔNG được chấp nhận tại hội nghị này.

Quyết định này dựa trên các ý kiến đánh giá từ Hội đồng phản biện. Chúng tôi khuyến khích quý vị xem xét các góp ý này cho các nghiên cứu tiếp theo.

Trân trọng,
Ban Chương Trình`
    };
    
    setFeedback(templates[decisionType] || '');
  };

  const handleDecisionChange = (newDecision) => {
    setDecision(newDecision);
    generateFeedbackTemplate(newDecision);
  };

  const calculateAverageScore = () => {
    if (reviews.length === 0) return 0;
    const validReviews = reviews.filter(review => review.score != null);
    if (validReviews.length === 0) return 0;
    const total = validReviews.reduce((sum, review) => sum + (review.score || 0), 0);
    return (total / validReviews.length).toFixed(1);
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Vui lòng nhập phản hồi cho tác giả');
      return;
    }

    setSubmitting(true);
    try {
      await api.makeDecision(id, {
        decision: decision,
        feedback: feedback,
        decision_date: new Date().toISOString()
      });
      
      alert('Đã lưu quyết định thành công! Email thông báo sẽ được gửi đến tác giả.');
      navigate('/chair/papers');
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert(getSaveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!paper) {
    return <div className="text-center py-12 text-slate-500">Không tìm thấy bài báo</div>;
  }

  const avgScore = calculateAverageScore();
  
  // ✅ Check if paper already has a final decision
  const paperStatus = paper.status?.toLowerCase();
  const hasDecision = ['accepted', 'rejected', 'camera_ready'].includes(paperStatus);
  
  const getStatusInfo = (status) => {
    const statusMap = {
      'accepted': { label: 'Đã chấp nhận', color: 'green', icon: 'check_circle' },
      'rejected': { label: 'Đã từ chối', color: 'red', icon: 'cancel' },
      'camera_ready': { label: 'Camera-Ready đã nộp', color: 'teal', icon: 'verified' },
      'revision_required': { label: 'Yêu cầu chỉnh sửa', color: 'yellow', icon: 'edit_note' },
    };
    return statusMap[status] || { label: status, color: 'slate', icon: 'help' };
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate('/chair/papers')} className="hover:text-primary transition-colors">
          Danh sách bài nộp
        </button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-medium">Chi tiết bài nộp #{paper.id}</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">Ra quyết định</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
          Ra Quyết Định &amp; Thông Báo Kết Quả
        </h1>
        <p className="text-slate-500 text-base font-normal mt-2">
          Đưa ra quyết định cuối cùng cho bài báo khoa học dựa trên ý kiến của hội đồng phản biện.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-7 space-y-8">
          {/* Paper Info */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">
                  Mã bài: #{paper.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{paper.title}</h2>
                <p className="text-sm text-slate-500">
                  Tác giả: <span className="font-medium">{paper.authors?.map(a => a.full_name || a.name).join(', ') || 'N/A'}</span>
                </p>
              </div>
              <button 
                onClick={() => window.open(paper.file_path, '_blank')}
                className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                Xem bài nộp
              </button>
            </div>
          </section>

          {/* ✅ Show existing decision banner if already decided */}
          {hasDecision && (
            <section className={`rounded-2xl border-2 p-6 ${
              paperStatus === 'accepted' || paperStatus === 'camera_ready' 
                ? 'bg-green-50 border-green-300' 
                : paperStatus === 'rejected' 
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`size-16 rounded-full flex items-center justify-center ${
                  paperStatus === 'accepted' || paperStatus === 'camera_ready'
                    ? 'bg-green-100 text-green-600'
                    : paperStatus === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <span className="material-symbols-outlined text-3xl">{getStatusInfo(paperStatus).icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bài báo đã có quyết định</h3>
                  <p className={`text-sm font-semibold ${
                    paperStatus === 'accepted' || paperStatus === 'camera_ready' ? 'text-green-600' :
                    paperStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    Trạng thái: {getStatusInfo(paperStatus).label}
                  </p>
                  {paperStatus === 'camera_ready' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Tác giả đã nộp bản Camera-Ready. Không thể thay đổi quyết định.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate('/chair/papers')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                >
                  ← Quay lại danh sách
                </button>
                <button
                  onClick={() => navigate(`/chair/papers/${id}`)}
                  className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600"
                >
                  Xem chi tiết bài báo
                </button>
              </div>
            </section>
          )}

          {/* Decision Selection - Only show if no final decision yet */}
          {!hasDecision && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">fact_check</span>
              Chọn trạng thái quyết định
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Accept */}
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="decision"
                  value="accepted"
                  checked={decision === 'accepted'}
                  onChange={(e) => handleDecisionChange(e.target.value)}
                  className="peer sr-only"
                />
                <div className="h-full p-4 rounded-xl border-2 border-slate-100 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all flex flex-col items-center text-center gap-3">
                  <div className="size-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <span className="font-bold text-slate-700">Chấp nhận</span>
                  <span className="text-xs text-slate-400">(Accept)</span>
                </div>
              </label>

              {/* Revision Required */}
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="decision"
                  value="revision_required"
                  checked={decision === 'revision_required'}
                  onChange={(e) => handleDecisionChange(e.target.value)}
                  className="peer sr-only"
                />
                <div className="h-full p-4 rounded-xl border-2 border-slate-100 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 transition-all flex flex-col items-center text-center gap-3">
                  <div className="size-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">edit_note</span>
                  </div>
                  <span className="font-bold text-slate-700">Yêu cầu sửa đổi</span>
                  <span className="text-xs text-slate-400">(Revision)</span>
                </div>
              </label>

              {/* Reject */}
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => handleDecisionChange(e.target.value)}
                  className="peer sr-only"
                />
                <div className="h-full p-4 rounded-xl border-2 border-slate-100 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all flex flex-col items-center text-center gap-3">
                  <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                  <span className="font-bold text-slate-700">Từ chối</span>
                  <span className="text-xs text-slate-400">(Reject)</span>
                </div>
              </label>
            </div>
          </section>
          )}

          {/* Feedback Textarea - Only show if no final decision */}
          {!hasDecision && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rate_review</span>
                Phản hồi chi tiết cho tác giả
              </h3>
              <button 
                onClick={() => generateFeedbackTemplate(decision)}
                className="text-sm font-semibold text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors"
              >
                Sử dụng mẫu phản hồi
              </button>
            </div>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={12}
              className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none font-mono text-sm"
              placeholder="Nhập phản hồi chi tiết cho tác giả..."
            />
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-400 italic">
                * Email này sẽ được gửi tự động đến tác giả
              </p>
              <span className="text-xs text-slate-400">{feedback.length} ký tự</span>
            </div>
          </section>
          )}

          {/* Submit Buttons - Only show if no final decision */}
          {!hasDecision && (
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/chair/papers')}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !feedback.trim()}
              className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">send</span>
                  Xác nhận &amp; Gửi quyết định
                </span>
              )}
            </button>
          </div>
          )}
        </div>

        {/* Sidebar - Review Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Review Statistics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Tổng quan phản biện
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-blue-600">{reviews.length}</div>
                <div className="text-xs text-blue-600 font-medium mt-1">Số phản biện</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-green-600">{avgScore}</div>
                <div className="text-xs text-green-600 font-medium mt-1">Điểm TB</div>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase">Phân bố điểm</div>
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có đánh giá nào</p>
              ) : (
                reviews.map((review, index) => (
                  <div key={review.id || index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 w-20">Reviewer {index + 1}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                        style={{ width: `${((review.score || 0) / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-10">{review.score?.toFixed(1) || '0.0'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Review Summary */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Tóm tắt nhận xét</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review, index) => (
                  <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                      Reviewer {index + 1}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {review.strengths || review.comments || 'Không có nhận xét'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Recommendation */}
          <div className={`rounded-2xl p-6 ${
            avgScore >= 4 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
            avgScore >= 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
            'bg-gradient-to-br from-red-500 to-pink-600'
          } text-white`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-2xl">lightbulb</span>
              <h3 className="font-bold text-lg">Gợi ý từ hệ thống</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {avgScore >= 4 ? 
                'Điểm trung bình cao (≥4.0). Bài báo có chất lượng tốt, đề xuất CHẤP NHẬN.' :
                avgScore >= 3 ?
                'Điểm trung bình khá (3.0-3.9). Bài báo có tiềm năng, đề xuất YÊU CẦU CHỈNH SỬA.' :
                'Điểm trung bình thấp (<3.0). Bài báo cần cải thiện đáng kể, cân nhắc TỪ CHỐI.'
              }
            </p>
            <div className="mt-4 text-xs text-white/70">
              * Đây chỉ là gợi ý tham khảo. Quyết định cuối cùng thuộc về Chair.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
