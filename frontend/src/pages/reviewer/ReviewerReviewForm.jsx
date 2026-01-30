import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getReviewErrorMessage } from '../../utils/errorHandler';

const ReviewerReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paper, setPaper] = useState(null);
  
  const [formData, setFormData] = useState({
    originality_score: 0,
    technical_quality_score: 0,
    clarity_score: 0,
    relevance_score: 0,
    overall_score: 0,
    strengths: '',
    weaknesses: '',
    detailed_comments: '',
    recommendation: ''
  });

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiAssistant, setShowAiAssistant] = useState(true);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/papers/${id}`);
      if (response.data.status === 'success') {
        const paperData = response.data.data.paper;
        setPaper(paperData);
        generateAiSuggestions(paperData);
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
      alert('Không thể tải thông tin bài báo');
    } finally {
      setLoading(false);
    }
  };

  const generateAiSuggestions = (paper) => {
    const suggestions = [
      'Đánh giá tính mới mẻ của phương pháp đề xuất so với các nghiên cứu trước',
      'Kiểm tra xem tác giả có so sánh với các phương pháp baseline không',
      'Xem xét độ rõ ràng của phần methodology',
      'Đánh giá tính đầy đủ của experiments và kết quả',
      'Kiểm tra references có đủ và phù hợp không'
    ];
    setAiSuggestions(suggestions);
  };

  const handleScoreChange = (field, value) => {
    const newFormData = { ...formData, [field]: parseInt(value) };
    
    // Auto-calculate overall score
    const scores = [
      newFormData.originality_score,
      newFormData.technical_quality_score,
      newFormData.clarity_score,
      newFormData.relevance_score
    ].filter(s => s > 0);
    
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      newFormData.overall_score = Math.round(avg * 10) / 10;
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.originality_score === 0 || formData.technical_quality_score === 0 ||
        formData.clarity_score === 0 || formData.relevance_score === 0) {
      alert('Vui lòng nhập đầy đủ điểm cho tất cả các tiêu chí');
      return;
    }
    
    if (!formData.strengths.trim() || !formData.weaknesses.trim()) {
      alert('Vui lòng nhập điểm mạnh và điểm yếu của bài báo');
      return;
    }
    
    if (!formData.recommendation) {
      alert('Vui lòng chọn khuyến nghị cuối cùng');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/reviews', {
        paper_id: parseInt(id),
        ...formData
      });
      
      if (response.data.status === 'success') {
        alert('Đã nộp phản biện thành công!');
        navigate('/reviewer');
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(getReviewErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Mã bài: {paper?.paper_code}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Hạn nộp phản biện: {new Date(paper?.deadline).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{paper?.title}</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Tải bài báo
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Main Form - Left Side */}
        <div className="lg:flex-1 flex flex-col gap-4">
          {/* PDF Viewer Placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{height: 'calc(100vh - 280px)'}}>
            <div className="h-10 bg-gray-100 border-b border-slate-200 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined cursor-pointer text-slate-600">menu</span>
                <span className="text-xs font-medium text-slate-600">Page 1 / 12</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-slate-200 rounded">
                  <span className="material-symbols-outlined text-lg text-slate-600">zoom_out</span>
                </button>
                <span className="text-xs text-slate-600">100%</span>
                <button className="p-1 hover:bg-slate-200 rounded">
                  <span className="material-symbols-outlined text-lg text-slate-600">zoom_in</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center h-[calc(100%-40px)] bg-slate-100">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-2">description</span>
                <p className="text-slate-500">PDF Viewer sẽ hiển thị tại đây</p>
                <p className="text-xs text-slate-400 mt-1">Tích hợp PDF.js hoặc React-PDF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Form - Right Side */}
        <div className="lg:w-[500px] bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Đánh Giá Chi Tiết</h3>
                
                {/* Scoring Section */}
                <div className="space-y-4">
                  {[
                    { field: 'originality_score', label: 'Tính Độc Đáo & Mới Mẻ', icon: 'psychology' },
                    { field: 'technical_quality_score', label: 'Chất Lượng Kỹ Thuật', icon: 'engineering' },
                    { field: 'clarity_score', label: 'Độ Rõ Ràng & Trình Bày', icon: 'text_fields' },
                    { field: 'relevance_score', label: 'Tính Phù Hợp Chủ Đề', icon: 'check_circle' }
                  ].map(({ field, label, icon }) => (
                    <div key={field} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-blue-600">{icon}</span>
                        <label className="font-medium text-slate-900">{label}</label>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleScoreChange(field, score)}
                            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                              formData[field] === score
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Score Display */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Điểm Tổng Quát</span>
                    <span className="text-3xl font-bold text-blue-600">{formData.overall_score.toFixed(1)}/5.0</span>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className="block font-medium text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">thumb_up</span>
                    Điểm Mạnh
                  </span>
                </label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                  rows="4"
                  className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Những ưu điểm nổi bật của bài báo..."
                />
              </div>

              {/* Weaknesses */}
              <div>
                <label className="block font-medium text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600">thumb_down</span>
                    Điểm Yếu & Gợi Ý Cải Thiện
                  </span>
                </label>
                <textarea
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({...formData, weaknesses: e.target.value})}
                  rows="4"
                  className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Những vấn đề cần được cải thiện..."
                />
              </div>

              {/* Detailed Comments */}
              <div>
                <label className="block font-medium text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">comment</span>
                    Nhận Xét Chi Tiết
                  </span>
                </label>
                <textarea
                  value={formData.detailed_comments}
                  onChange={(e) => setFormData({...formData, detailed_comments: e.target.value})}
                  rows="6"
                  className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Nhận xét chi tiết về methodology, experiments, results..."
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block font-medium text-slate-900 mb-3">
                  Khuyến Nghị Cuối Cùng
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'accept', label: 'Chấp nhận (Accept)', color: 'green' },
                    { value: 'minor_revision', label: 'Chỉnh sửa nhỏ (Minor Revision)', color: 'blue' },
                    { value: 'major_revision', label: 'Chỉnh sửa lớn (Major Revision)', color: 'yellow' },
                    { value: 'reject', label: 'Từ chối (Reject)', color: 'red' }
                  ].map(({ value, label, color }) => (
                    <label key={value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.recommendation === value
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="recommendation"
                        value={value}
                        checked={formData.recommendation === value}
                        onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                        className={`mr-3 text-${color}-600 focus:ring-${color}-500`}
                      />
                      <span className="font-medium text-slate-900">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/reviewer')}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang nộp...' : 'Nộp Phản Biện'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {showAiAssistant && (
          <div className="lg:w-[320px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h4 className="font-bold">Trợ Lý AI</h4>
              </div>
              <button
                onClick={() => setShowAiAssistant(false)}
                className="hover:bg-white/20 rounded p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{height: 'calc(100vh - 280px)'}}>
              <div className="space-y-3">
                <p className="text-sm text-slate-700 font-medium">Gợi ý đánh giá:</p>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-purple-200 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">lightbulb</span>
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerReviewForm;
