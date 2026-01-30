import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairPapersPage = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    track: '',
    status: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await api.listPapers().catch(() => ({ data: { data: { papers: [] } } }));
      // API returns {status, data: {papers, total, page, per_page}}
      const papersData = response.data?.data?.papers || response.data?.papers || [];
      setPapers(papersData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-blue-100 text-blue-700', text: 'Chờ phân công' },
      under_review: { bg: 'bg-orange-100 text-orange-700', text: 'Đang phản biện' },
      completed: { bg: 'bg-green-100 text-green-700', text: 'Đã có kết quả' },
      accepted: { bg: 'bg-green-100 text-green-700', text: 'Đã chấp nhận' },
      rejected: { bg: 'bg-red-100 text-red-700', text: 'Đã từ chối' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`${badge.bg} px-2.5 py-1 rounded-full text-xs font-semibold`}>{badge.text}</span>;
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.authors?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = !filters.track || paper.track === filters.track;
    const matchesStatus = !filters.status || paper.status === filters.status;
    return matchesSearch && matchesTrack && matchesStatus;
  });

  const stats = {
    total: papers.length,
    pending: papers.filter(p => p.status === 'pending').length,
    reviewing: papers.filter(p => p.status === 'under_review').length,
    completed: papers.filter(p => p.status === 'accepted' || p.status === 'rejected').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Download all papers as ZIP
  const handleDownloadAll = async () => {
    try {
      alert('Đang chuẩn bị file... Tính năng này sẽ được hoàn thiện.');
      // TODO: Implement actual download
    } catch (error) {
      console.error('Download error:', error);
      alert('Không thể tải xuống. Vui lòng thử lại.');
    }
  };

  // Export to CSV/Excel
  const handleExportReport = () => {
    try {
      const csvContent = [
        ['Mã bài', 'Tiêu đề', 'Tác giả', 'Phân ban', 'Trạng thái', 'Ngày nộp'].join(','),
        ...filteredPapers.map((paper, index) => [
          `#${String(index + 1).padStart(3, '0')}`,
          `"${paper.title?.replace(/"/g, '""') || ''}"`,
          `"${typeof paper.authors === 'string' ? paper.authors : (Array.isArray(paper.authors) ? paper.authors.map(a => a.name || a.full_name).join('; ') : paper.submitter_name || '')}"`,
          paper.track_name || paper.track || 'Chung',
          paper.status || 'pending',
          paper.created_at ? new Date(paper.created_at).toLocaleDateString('vi-VN') : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bao-cao-bai-nop-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
      alert('Không thể xuất báo cáo. Vui lòng thử lại.');
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
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
              Quản Lý & Phân Công Bài Nộp
            </h1>
            <p className="text-slate-600 text-base font-normal mt-2">
              Trung tâm quản lý toàn bộ danh sách bài nộp, thực hiện phân công phản biện và ra quyết định chấp nhận/từ chối.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Tải tất cả bài báo
            </button>
            <button 
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              <span className="material-symbols-outlined text-lg">export_notes</span>
              Xuất báo cáo (CSV/Excel)
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Tổng số bài nộp</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{stats.total}</span>
              <span className="text-xs text-green-500 flex items-center">
                <span className="material-symbols-outlined text-xs">trending_up</span> +12
              </span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Chưa phân công</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-blue-600">{stats.pending}</span>
              <span className="text-xs text-blue-500">Cần xử lý ngay</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Đang phản biện</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-orange-500">{stats.reviewing}</span>
              <span className="text-xs text-slate-400">Trên tổng số</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Đã có quyết định</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-green-500">{stats.completed}</span>
              <span className="text-xs text-slate-400">{Math.round(stats.completed / stats.total * 100)}% hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm shadow-sm"
                    placeholder="Tìm kiếm theo mã ID, tiêu đề, tác giả hoặc từ khóa..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                    Bộ lọc nâng cao
                  </button>
                  <button 
                    onClick={fetchPapers}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Phân ban chuyên môn</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
                    value={filters.track}
                    onChange={(e) => setFilters({...filters, track: e.target.value})}
                  >
                    <option value="">Tất cả phân ban</option>
                    <option value="cs">Khoa học máy tính</option>
                    <option value="se">Công nghệ phần mềm</option>
                    <option value="is">An toàn thông tin</option>
                    <option value="ai">Trí tuệ nhân tạo</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Trạng thái xử lý</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ phân công</option>
                    <option value="under_review">Đang phản biện</option>
                    <option value="completed">Đã có kết quả phản biện</option>
                    <option value="accepted">Đã chấp nhận</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Thời gian nộp</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
                    value={filters.sort}
                    onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="deadline">Gần hạn phản biện</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Số lượng hiển thị</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value="10">10 bản ghi / trang</option>
                    <option value="20">20 bản ghi / trang</option>
                    <option value="50">50 bản ghi / trang</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 w-24 text-center">
                    Mã bài
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    Tiêu đề bài báo & Tác giả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    Phân ban
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    Phản biện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-2 block text-slate-300">description</span>
                      Không tìm thấy bài báo nào
                    </td>
                  </tr>
                ) : (
                  paginatedPapers.map((paper, index) => (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 border-b border-slate-100 text-center font-mono font-medium text-slate-500">
                        #{String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 border-b border-slate-100">
                        <div className="flex flex-col max-w-md">
                          <span className="font-bold text-slate-900 truncate" title={paper.title}>
                            {paper.title}
                          </span>
                          <span className="text-xs text-slate-600 mt-1">
                            {typeof paper.authors === 'string' 
                              ? paper.authors 
                              : Array.isArray(paper.authors) 
                                ? paper.authors.map(a => a.name || a.full_name || a.email).join(', ')
                                : paper.submitter_name || 'Chưa có tác giả'
                            } • {paper.created_at ? new Date(paper.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-100">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">
                          {typeof paper.track === 'object' ? paper.track?.name : (paper.track || paper.track_name || 'Chung')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-100">
                        {paper.status === 'pending' ? (
                          <span className="text-xs text-slate-400 italic">Chưa chỉ định</span>
                        ) : (
                          <div className="flex -space-x-2">
                            <div className="size-6 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[8px] font-bold">PB1</div>
                            <div className="size-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[8px] font-bold">PB2</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-100">
                        {getStatusBadge(paper.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm border-b border-slate-100">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/chair/papers/${paper.id || paper.paper_id}`)}
                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          {paper.status === 'pending' ? (
                            <button 
                              onClick={() => navigate(`/chair/papers/${paper.id || paper.paper_id}/assign`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">person_add</span>
                              Phân công
                            </button>
                          ) : paper.status === 'under_review' ? (
                            <button 
                              onClick={() => navigate(`/chair/papers/${paper.id || paper.paper_id}/assign`)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Điều chỉnh
                            </button>
                          ) : (paper.status === 'reviewed' || paper.status === 'completed') && (
                            <button 
                              onClick={() => navigate(`/chair/papers/${paper.id || paper.paper_id}/decision`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">gavel</span>
                              Quyết định
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Hiển thị <span className="font-bold">{paginatedPapers.length}</span> trong tổng số <span className="font-bold">{filteredPapers.length}</span> bài báo
            </span>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-slate-200 hover:bg-slate-50'
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ChairPapersPage;


