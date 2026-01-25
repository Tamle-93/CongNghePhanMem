import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ReviewerHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockHistory = [
        {
          review_id: 1,
          paper_code: 'UTH2023-045',
          paper_title: 'AI-based Traffic Management System',
          conference: 'UTH-IT 2023',
          review_date: '2023-12-15',
          overall_score: 4.5,
          recommendation: 'accept',
          status: 'accepted'
        },
        {
          review_id: 2,
          paper_code: 'UTH2023-067',
          paper_title: 'Blockchain for Healthcare Data Management',
          conference: 'UTH-IT 2023',
          review_date: '2023-11-20',
          overall_score: 3.8,
          recommendation: 'minor_revision',
          status: 'revision_required'
        },
        {
          review_id: 3,
          paper_code: 'UTH2023-089',
          paper_title: 'IoT Security Framework',
          conference: 'UTH Security 2023',
          review_date: '2023-10-05',
          overall_score: 2.5,
          recommendation: 'reject',
          status: 'rejected'
        }
      ];

      const mockStats = {
        total_reviews: 24,
        conferences_participated: 8,
        recent_year: 2024,
        acceptance_rate: 65,
        average_score: 3.9
      };

      setHistory(mockHistory);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationBadge = (recommendation) => {
    const badges = {
      'accept': { bg: 'bg-green-100', text: 'text-green-700', label: 'Chấp nhận' },
      'minor_revision': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sửa nhỏ' },
      'major_revision': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Sửa lớn' },
      'reject': { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' }
    };
    return badges[recommendation] || badges.accept;
  };

  const handleExportPDF = () => {
    alert('Chức năng xuất PDF đang được phát triển');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Lịch Sử Đóng Góp Phản Biện</h2>
          <p className="text-slate-600">Lưu trữ và quản lý hồ sơ chuyên môn phản biện khoa học của bạn tại UTH</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất báo cáo (PDF)
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-600 text-sm mb-1">Tổng bài đã phản biện</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total_reviews}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-600 text-sm mb-1">Số hội nghị tham gia</div>
          <div className="text-2xl font-bold text-blue-600">{String(stats.conferences_participated).padStart(2, '0')}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-600 text-sm mb-1">Năm hoạt động gần nhất</div>
          <div className="text-2xl font-bold text-blue-600">{stats.recent_year}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-600 text-sm mb-1">Tỷ lệ chấp nhận bài</div>
          <div className="text-2xl font-bold text-blue-600">{stats.acceptance_rate}%</div>
        </div>
      </div>

      {/* Average Score Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Điểm đánh giá trung bình</p>
            <p className="text-xs text-slate-600">Trên thang điểm 5.0</p>
          </div>
          <div className="text-4xl font-bold text-blue-600">{stats.average_score}/5.0</div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Mã bài</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Tiêu đề</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Hội nghị</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Ngày phản biện</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Điểm</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Khuyến nghị</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-6xl text-slate-300 mb-2">history</span>
                      <p className="text-slate-500">Chưa có lịch sử phản biện</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const badge = getRecommendationBadge(item.recommendation);
                  return (
                    <tr key={item.review_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                          {item.paper_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 line-clamp-2">{item.paper_title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.conference}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(item.review_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                          {item.overall_score}/5.0
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          item.status === 'revision_required' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {item.status === 'accepted' ? 'check_circle' : 
                             item.status === 'revision_required' ? 'edit' : 'cancel'}
                          </span>
                          {item.status === 'accepted' ? 'Đã chấp nhận' :
                           item.status === 'revision_required' ? 'Cần sửa' : 'Đã từ chối'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewerHistory;
