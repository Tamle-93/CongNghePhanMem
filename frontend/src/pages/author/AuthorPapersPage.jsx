import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AuthorPapersPage = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    fetchPapers();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPapers, 60000);
    
    // Refresh when tab is focused
    const handleFocus = () => fetchPapers();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await api.listPapers();
      console.log('AuthorPapersPage - Full response:', response.data);
      const papersData = response.data?.data?.papers || response.data?.papers || [];
      console.log('AuthorPapersPage - Papers extracted:', papersData);
      setPapers(papersData);
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        label: 'Chờ phân công',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: 'hourglass_empty'
      },
      'under_review': {
        label: 'Đang phản biện',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: 'sync'
      },
      'revision_required': {
        label: 'Yêu cầu chỉnh sửa',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: 'warning',
        pulse: true
      },
      'accepted': {
        label: 'Đã chấp nhận',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: 'check_circle'
      },
      'rejected': {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: 'cancel'
      }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = !searchTerm || 
      paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.paper_id?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || paper.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Notification Banner - Only show if user has papers */}
        {showNotification && papers.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex gap-4 items-start shadow-sm">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600 flex-shrink-0">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-slate-900 text-sm font-bold">Hệ thống thông báo</span>
                <span className="text-slate-500 text-xs font-medium">• Vừa xong</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">
                Hạn chót nộp bản chỉnh sửa (Camera-ready) cho hội nghị <span className="font-bold">ICT-2024</span> là ngày <span className="font-bold">15/10/2024</span>. Vui lòng kiểm tra lại định dạng bài báo theo mẫu mới nhất.
              </p>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
              Danh sách bài báo của tôi
            </h1>
            <p className="text-slate-500 text-base">
              Quản lý các bài báo đã nộp và theo dõi tiến độ phản biện.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchPapers}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <span className="material-symbols-outlined text-xl text-slate-600">refresh</span>
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button 
              onClick={() => navigate('/author/submit')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
              <span>Nộp bài mới</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Tìm kiếm theo mã bài, tiêu đề..."
              />
            </div>
            <div className="relative md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">filter_alt</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ phân công</option>
                <option value="under_review">Đang phản biện</option>
                <option value="revision_required">Yêu cầu chỉnh sửa</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="rejected">Từ chối</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Papers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <span className="material-symbols-outlined text-6xl">description</span>
              </div>
              <h3 className="text-slate-900 text-lg font-bold mb-2">Chưa có bài báo nào</h3>
              <p className="text-slate-500 mb-4">Bạn chưa nộp bài báo nào. Hãy bắt đầu bằng cách nộp bài mới!</p>
              <button 
                onClick={() => navigate('/author/submit')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span>Nộp bài mới</span>
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                        Mã bài
                      </th>
                      <th className="p-4 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[300px]">
                        Tiêu đề
                      </th>
                      <th className="p-4 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="p-4 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPapers.map((paper) => {
                      const statusInfo = getStatusInfo(paper.status);
                      return (
                        <tr key={paper.paper_id} className="group hover:bg-slate-50 transition-colors">
                          <td className="p-4 align-top">
                            <span className="font-mono text-sm font-medium text-slate-500">
                              #{paper.paper_id}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                              {paper.title}
                            </h3>
                            <div className="flex flex-col gap-1 mt-1">
                              <p className="text-sm text-slate-500">
                                Nộp ngày: {paper.submitted_at ? new Date(paper.submitted_at).toLocaleDateString('vi-VN') : 'N/A'}
                              </p>
                              {paper.conference_name && (
                                <div className="text-xs text-slate-500">
                                  <span className="font-medium text-slate-700">{paper.conference_name}</span>
                                  {paper.track_name && ` • Phân ban: ${paper.track_name}`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                              {statusInfo.pulse && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                              )}
                              {!statusInfo.pulse && (
                                <span className="material-symbols-outlined text-[14px]">{statusInfo.icon}</span>
                              )}
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="p-4 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => navigate(`/author/papers/${paper.id}`)}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </button>
                              {paper.status === 'revision_required' && (
                                <button 
                                  onClick={() => navigate(`/author/papers/${paper.id}/revision`)}
                                  className="p-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all"
                                  title="Nộp bản chỉnh sửa"
                                >
                                  <span className="material-symbols-outlined text-xl">edit_document</span>
                                </button>
                              )}
                              {paper.status === 'accepted' && (
                                <button 
                                  onClick={() => navigate(`/author/papers/${paper.id}/camera-ready`)}
                                  className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                                  title="Nộp Camera-Ready"
                                >
                                  <span className="material-symbols-outlined text-xl">upload_file</span>
                                </button>
                              )}
                              {(paper.status === 'accepted' || paper.status === 'rejected') && (
                                <button 
                                  onClick={() => navigate(`/author/papers/${paper.id}/reviews`)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Xem kết quả phản biện"
                                >
                                  <span className="material-symbols-outlined text-xl">rate_review</span>
                                </button>
                              )}
                              {paper.status === 'pending' && (
                                <button 
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Rút bài"
                                >
                                  <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-4 py-4 flex items-center justify-between border-t border-slate-200 bg-slate-50">
                <span className="text-sm text-slate-500">
                  Hiển thị <span className="font-medium">1-{filteredPapers.length}</span> trong số <span className="font-medium">{filteredPapers.length}</span> bài báo
                </span>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled
                  >
                    Trước
                  </button>
                  <button 
                    className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Material Symbols Icons CDN */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default AuthorPapersPage;
