import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function AuthorReviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaperAndReviews();
  }, [id]);

  const fetchPaperAndReviews = async () => {
    try {
      const [paperRes, reviewsRes] = await Promise.all([
        api.getPaperById(id),
        api.getReviewsByPaper(id)
      ]);
      setPaper(paperRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionStyle = (status) => {
    const styles = {
      accepted: {
        bg: 'bg-green-50',
        icon: 'check_circle',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        title: 'CHẤP NHẬN (ACCEPTED)',
        titleColor: 'text-slate-900',
        badge: 'text-green-600',
        description: 'Chúc mừng! Bài báo của bạn đã đủ điều kiện để công bố.'
      },
      rejected: {
        bg: 'bg-red-50',
        icon: 'cancel',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        title: 'TỪ CHỐI (REJECTED)',
        titleColor: 'text-slate-900',
        badge: 'text-red-600',
        description: 'Bài báo chưa đáp ứng yêu cầu của hội nghị.'
      },
      revision_required: {
        bg: 'bg-orange-50',
        icon: 'edit_note',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-100',
        title: 'YÊU CẦU CHỈNH SỬA',
        titleColor: 'text-slate-900',
        badge: 'text-orange-600',
        description: 'Bài báo cần được chỉnh sửa theo yêu cầu của người phản biện.'
      }
    };
    return styles[status] || styles.revision_required;
  };

  const calculateAverageScore = () => {
    if (reviews.length === 0) return 0;
    const totalScore = reviews.reduce((sum, review) => sum + (review.overall_score || 0), 0);
    return (totalScore / reviews.length).toFixed(1);
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
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">description_off</span>
        <p className="text-slate-500">Không tìm thấy bài báo</p>
      </div>
    );
  }

  const decisionStyle = getDecisionStyle(paper.status);
  const averageScore = calculateAverageScore();

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/author/papers" className="hover:text-primary">
            Bài báo của tôi
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span>Chi tiết phản biện</span>
        </div>
        <h1 className="text-slate-900 text-3xl font-black tracking-tight">
          Kết Quả Phản Biện &amp; Chứng Nhận
        </h1>
        <p className="text-slate-500 text-base">
          Mã bài báo: <span className="font-mono font-bold text-slate-700">#{paper.id}</span>
        </p>
      </div>

      {/* Decision Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${decisionStyle.bg}/50 border-b border-slate-100`}>
          <div className="flex items-center gap-6">
            <div className={`size-16 rounded-full ${decisionStyle.iconBg} ${decisionStyle.iconColor} flex items-center justify-center shadow-inner`}>
              <span className="material-symbols-outlined text-4xl">{decisionStyle.icon}</span>
            </div>
            <div>
              <div className={`text-sm font-bold ${decisionStyle.badge} uppercase tracking-widest mb-1`}>
                Quyết định cuối cùng
              </div>
              <h2 className={`text-2xl md:text-3xl font-black ${decisionStyle.titleColor}`}>
                {decisionStyle.title}
              </h2>
              <p className="text-slate-500 mt-1">{decisionStyle.description}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {paper.status === 'accepted' && (
              <>
                <button className="flex items-center justify-center gap-2 bg-primary hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95">
                  <span className="material-symbols-outlined text-xl">verified</span>
                  <span>Tải chứng nhận</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95">
                  <span className="material-symbols-outlined text-xl">upload_file</span>
                  <span>Nộp Camera-ready</span>
                </button>
              </>
            )}
            {paper.status === 'revision_required' && (
              <button 
                onClick={() => navigate(`/author/papers/${id}/revision`)}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">edit_document</span>
                <span>Nộp bản chỉnh sửa</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Paper Info */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">description</span>
              Thông tin bài báo
            </h3>
            <div className="grid md:grid-cols-2 gap-6 p-6 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Tiêu đề bài báo
                </span>
                <p className="font-semibold text-slate-800">{paper.title}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Hội nghị &amp; Phân ban
                </span>
                <p className="font-semibold text-slate-800">
                  {paper.conference?.name || 'Không rõ'} • {paper.track?.name || 'Chưa phân công'}
                </p>
              </div>
              {averageScore > 0 && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Điểm trung bình
                  </span>
                  <p className="font-semibold text-slate-800">{averageScore} / 5.0</p>
                </div>
              )}
              {paper.decision_date && (
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Ngày nhận kết quả
                  </span>
                  <p className="font-semibold text-slate-800">
                    {new Date(paper.decision_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">reviews</span>
                Nhận xét chi tiết từ Reviewer
              </h3>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={review.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-700">
                        Reviewer #{index + 1}
                      </span>
                      {review.overall_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Điểm tổng quát:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg border border-green-200">
                            {review.overall_score.toFixed(1)} / 5.0
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Strengths */}
                      {review.strengths && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                            Ưu điểm:
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {review.strengths}
                          </p>
                        </div>
                      )}
                      
                      {/* Weaknesses */}
                      {review.weaknesses && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                            Nhược điểm &amp; Góp ý:
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {review.weaknesses}
                          </p>
                        </div>
                      )}

                      {/* General Comments */}
                      {review.comments && !review.strengths && !review.weaknesses && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                            Nhận xét:
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {typeof review.comments === 'string' 
                              ? review.comments 
                              : review.comments.join('. ')}
                          </p>
                        </div>
                      )}

                      {/* Detailed Scores */}
                      {(review.originality_score || review.technical_quality_score || review.clarity_score || review.relevance_score) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                          {review.originality_score && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">Tính mới</div>
                              <div className="text-lg font-bold text-slate-900">
                                {review.originality_score}/5
                              </div>
                            </div>
                          )}
                          {review.technical_quality_score && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">Chất lượng</div>
                              <div className="text-lg font-bold text-slate-900">
                                {review.technical_quality_score}/5
                              </div>
                            </div>
                          )}
                          {review.clarity_score && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">Rõ ràng</div>
                              <div className="text-lg font-bold text-slate-900">
                                {review.clarity_score}/5
                              </div>
                            </div>
                          )}
                          {review.relevance_score && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">Liên quan</div>
                              <div className="text-lg font-bold text-slate-900">
                                {review.relevance_score}/5
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">rate_review</span>
              <p>Chưa có phản biện nào cho bài báo này</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => navigate('/author/papers')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Quay lại danh sách</span>
        </button>
        <div className="flex items-center gap-4">
          {paper.decision_date && (
            <p className="text-sm text-slate-500 italic">
              Ngày nhận kết quả: {new Date(paper.decision_date).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
