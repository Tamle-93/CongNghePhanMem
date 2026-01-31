import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ReviewerPaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/papers/${id}`);
      const data = response.data?.data || response.data;
      // Handle different response formats
      const paperData = data.paper || data;
      
      // Normalize keywords - handle all cases
      if (paperData.keywords) {
        if (typeof paperData.keywords === 'string') {
          paperData.keywords = paperData.keywords.split(',').map(k => k.trim()).filter(k => k);
        } else if (!Array.isArray(paperData.keywords)) {
          paperData.keywords = [];
        }
      } else {
        paperData.keywords = [];
      }
      
      // Normalize authors - handle all cases
      if (paperData.authors) {
        if (typeof paperData.authors === 'string') {
          try {
            const parsed = JSON.parse(paperData.authors);
            paperData.authors = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            paperData.authors = [{ name: paperData.authors, affiliation: '', email: '' }];
          }
        } else if (!Array.isArray(paperData.authors)) {
          paperData.authors = [];
        }
      } else {
        paperData.authors = [];
      }
      
      setPaper(paperData);
    } catch (error) {
      console.error('Error fetching paper:', error);
      // Don't alert, just show the empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">description</span>
        <p className="text-slate-500">Không tìm thấy bài báo</p>
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
              <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded">
                {paper.track}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{paper.title}</h1>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Hội nghị:</span> {paper.conference}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined">download</span>
            Tải PDF
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-600 mb-1">Ngày nộp</p>
            <p className="font-medium text-slate-900">{new Date(paper.submission_date).toLocaleDateString('vi-VN')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Hạn phản biện</p>
            <p className="font-medium text-red-600">{new Date(paper.deadline).toLocaleDateString('vi-VN')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Số tác giả</p>
            <p className="font-medium text-slate-900">{paper.authors?.length || 0} người</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Từ khóa</p>
            <p className="font-medium text-slate-900">{paper.keywords?.length || 0} keywords</p>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">local_offer</span>
          Từ khóa
        </h3>
        <div className="flex flex-wrap gap-2">
          {(paper.keywords || []).map((keyword, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {keyword}
            </span>
          ))}
          {(!paper.keywords || paper.keywords.length === 0) && (
            <span className="text-slate-500 text-sm">Chưa có từ khóa</span>
          )}
        </div>
      </div>

      {/* Authors */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">group</span>
          Tác giả
        </h3>
        <div className="space-y-3">
          {(paper.authors || []).map((author, index) => (
            <div key={index} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {(author.name || author.full_name || 'A').charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{author.name || author.full_name}</p>
                  {author.is_corresponding && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                      Tác giả liên hệ
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{author.affiliation || author.institution || ''}</p>
                <p className="text-xs text-slate-500">{author.email || ''}</p>
              </div>
            </div>
          ))}
          {(!paper.authors || paper.authors.length === 0) && (
            <p className="text-slate-500 text-sm">Chưa có thông tin tác giả</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/reviewer/papers/${id}/review`)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          <span className="material-symbols-outlined">rate_review</span>
          Bắt đầu phản biện
        </button>
        <button
          onClick={() => navigate('/reviewer')}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default ReviewerPaperDetail;
