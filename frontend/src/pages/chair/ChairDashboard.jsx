import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, assignmentsRes] = await Promise.all([
          api.listPapers().catch(() => ({ data: { data: { papers: [] } } })),
          api.listAssignments().catch(() => ({ data: { data: { assignments: [] } } }))
        ]);
        setPapers(papersRes.data?.data?.papers || papersRes.data?.papers || []);
        setAssignments(assignmentsRes.data?.data?.assignments || assignmentsRes.data?.assignments || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'under_review': 'Đang đánh giá',
      'accepted': 'Chấp nhận',
      'rejected': 'Từ chối'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingPapers = papers.filter(p => p.status === 'pending');
  const underReviewPapers = papers.filter(p => p.status === 'under_review');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Chair</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📄</div>
            <div>
              <p className="text-sm text-slate-500">Tổng bài nộp</p>
              <p className="text-2xl font-bold text-slate-900">{papers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">⏳</div>
            <div>
              <p className="text-sm text-slate-500">Chờ phân công</p>
              <p className="text-2xl font-bold text-slate-900">{pendingPapers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">📝</div>
            <div>
              <p className="text-sm text-slate-500">Đang đánh giá</p>
              <p className="text-2xl font-bold text-slate-900">{underReviewPapers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">✓</div>
            <div>
              <p className="text-sm text-slate-500">Phân công</p>
              <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Danh sách bài nộp</h2>
        </div>
        
        <div className="overflow-x-auto">
          {papers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Chưa có bài nộp nào
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Tiêu đề</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Tác giả</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Ngày nộp</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Trạng thái</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 max-w-xs truncate">{paper.title}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{paper.authors || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {paper.created_at ? new Date(paper.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(paper.status)}`}>
                        {getStatusText(paper.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline text-sm">
                        Phân công
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairDashboard;





