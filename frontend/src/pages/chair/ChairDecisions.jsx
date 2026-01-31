import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairDecisions = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, decided

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.listPapers();
      console.log('ChairDecisions - Papers response:', response.data);
      const papersData = response.data?.data?.papers || response.data?.papers || [];
      setPapers(papersData);
    } catch (error) {
      console.error('Error fetching papers:', error);
      setError('Không thể tải danh sách bài báo. Vui lòng thử lại.');
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 text-yellow-700', text: 'Chờ quyết định' },
      under_review: { bg: 'bg-blue-100 text-blue-700', text: 'Đang phản biện' },
      accepted: { bg: 'bg-green-100 text-green-700', text: 'Đã chấp nhận' },
      rejected: { bg: 'bg-red-100 text-red-700', text: 'Đã từ chối' },
      revision_required: { bg: 'bg-orange-100 text-orange-700', text: 'Yêu cầu chỉnh sửa' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`${badge.bg} px-2.5 py-1 rounded-full text-xs font-semibold`}>{badge.text}</span>;
  };

  const filteredPapers = papers.filter(paper => {
    if (filter === 'pending') return paper.status === 'pending' || paper.status === 'under_review';
    if (filter === 'decided') return paper.status === 'accepted' || paper.status === 'rejected' || paper.status === 'revision_required';
    return true;
  });

  const stats = {
    total: papers.length,
    pending: papers.filter(p => p.status === 'pending' || p.status === 'under_review').length,
    accepted: papers.filter(p => p.status === 'accepted').length,
    rejected: papers.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">error</span>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPapers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
            Ra Quyết Định
          </h1>
          <p className="text-slate-600 text-base font-normal mt-2">
            Quản lý và đưa ra quyết định chấp nhận/từ chối cho các bài báo đã được phản biện
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Tổng số bài</p>
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Chờ quyết định</p>
            <span className="text-2xl font-black text-yellow-600">{stats.pending}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Đã chấp nhận</p>
            <span className="text-2xl font-black text-green-600">{stats.accepted}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Đã từ chối</p>
            <span className="text-2xl font-black text-red-600">{stats.rejected}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-2">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'pending', label: 'Chờ quyết định' },
              { value: 'decided', label: 'Đã quyết định' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Papers List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-6xl mb-4 block text-slate-300">description</span>
              <p className="text-sm">Không có bài báo nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Tiêu đề</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Tác giả</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">#{paper.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{paper.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {Array.isArray(paper.authors) 
                          ? paper.authors.map(a => a.full_name || a.name).join(', ')
                          : (typeof paper.authors === 'string' ? paper.authors : paper.submitter_name || 'N/A')}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(paper.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/chair/papers/${paper.id}/decision`)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ra quyết định
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChairDecisions;
