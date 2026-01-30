import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

const ReviewerBidding = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailablePapers();
  }, []);

  const fetchAvailablePapers = async () => {
    try {
      setLoading(true);
      // Mock data với AI match scores
      const mockPapers = [
        {
          paper_id: 201,
          paper_code: 'UTH2024-101',
          title: 'Advanced Machine Learning Techniques for Real-Time Anomaly Detection',
          keywords: ['Machine Learning', 'Anomaly Detection', 'Real-Time Systems'],
          authors_count: 3,
          ai_match_score: 95,
          track: 'AI & Machine Learning'
        },
        {
          paper_id: 202,
          paper_code: 'UTH2024-102',
          title: 'Blockchain Integration in Supply Chain Management Systems',
          keywords: ['Blockchain', 'Supply Chain', 'Smart Contracts'],
          authors_count: 2,
          ai_match_score: 75,
          track: 'Distributed Systems'
        },
        {
          paper_id: 203,
          paper_code: 'UTH2024-103',
          title: 'Neural Network Optimization for Edge Computing Devices',
          keywords: ['Neural Networks', 'Edge Computing', 'Optimization'],
          authors_count: 4,
          ai_match_score: 90,
          track: 'AI & Machine Learning'
        }
      ];
      setPapers(mockPapers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaper = (paperId) => {
    if (selectedPapers.includes(paperId)) {
      setSelectedPapers(selectedPapers.filter(id => id !== paperId));
    } else {
      if (selectedPapers.length < 10) {
        setSelectedPapers([...selectedPapers, paperId]);
      } else {
        alert('Bạn chỉ có thể chọn tối đa 10 bài báo');
      }
    }
  };

  const handleSubmitBids = async () => {
    if (selectedPapers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài báo');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitBids({ paper_ids: selectedPapers });
      alert(`Đã gửi đấu thầu cho ${selectedPapers.length} bài báo thành công!`);
      setSelectedPapers([]);
    } catch (error) {
      console.error('Error submitting bids:', error);
      alert(getErrorMessage(error, 'Không thể gửi đấu thầu. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (score >= 75) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Đấu Thầu Bài Báo Nghiên Cứu Mới</h2>
            <p className="text-slate-600 mt-2">Chọn những bài báo bạn muốn phản biện dựa trên chuyên môn của mình</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">
                Tiến độ đấu thầu: <span className="text-slate-900 font-bold">{selectedPapers.length}/10 bài</span>
              </span>
            </div>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{width: `${(selectedPapers.length / 10) * 100}%`}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="flex flex-col gap-6">
        {papers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
            <p className="text-slate-500">Không có bài báo nào để đấu thầu</p>
          </div>
        ) : (
          papers.map((paper) => {
            const isSelected = selectedPapers.includes(paper.paper_id);
            const matchColor = getMatchColor(paper.ai_match_score);
            
            return (
              <div
                key={paper.paper_id}
                className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
                  isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                              {paper.paper_code}
                            </span>
                            <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded">
                              {paper.track}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">{paper.title}</h3>
                          <p className="text-sm text-slate-600">
                            {paper.authors_count} tác giả
                          </p>
                        </div>
                      </div>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {keyword}
                          </span>
                        ))}
                      </div>

                      {/* AI Match Score */}
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${matchColor.border} ${matchColor.bg}`}>
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span className={`text-sm font-bold ${matchColor.text}`}>
                          Độ phù hợp: {paper.ai_match_score}%
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col items-end gap-2 md:w-48">
                      <button
                        onClick={() => handleTogglePaper(paper.paper_id)}
                        className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            Đã chọn
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Chọn bài này
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Button */}
      {selectedPapers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Đã chọn</p>
            <p className="text-2xl font-bold text-blue-600">{selectedPapers.length} bài</p>
          </div>
          <button
            onClick={handleSubmitBids}
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang gửi...' : 'Xác nhận đấu thầu'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewerBidding;
