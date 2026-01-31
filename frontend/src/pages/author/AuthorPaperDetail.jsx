import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function AuthorPaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaperDetail();
  }, [id]);

  const fetchPaperDetail = async () => {
    try {
      const response = await api.getPaperById(id);
      setPaper(response.data.data);
    } catch (error) {
      console.error('Error fetching paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      revision_required: 'bg-orange-100 text-orange-700 border-orange-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ phân công',
      under_review: 'Đang phản biện',
      revision_required: 'Yêu cầu chỉnh sửa',
      accepted: 'Đã chấp nhận',
      rejected: 'Từ chối',
    };
    return labels[status] || status;
  };

  const getProgressPercentage = (status) => {
    const percentages = {
      pending: 25,
      under_review: 50,
      revision_required: 50,
      accepted: 100,
      rejected: 100,
    };
    return percentages[status] || 0;
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
        <button
          onClick={() => navigate('/author/papers')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(paper.status);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/author/papers" className="hover:text-primary transition-colors">
          Bài báo của tôi
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span>Chi tiết bài báo #{paper.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
          Chi Tiết Bài Báo &amp; Theo Dõi Tiến Độ
        </h1>
        <div className="flex items-center gap-3">
          {paper.status === 'revision_required' && (
            <button
              onClick={() => navigate(`/author/papers/${id}/revision`)}
              className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">edit_document</span>
              <span>Chỉnh sửa bài báo</span>
            </button>
          )}
          {paper.reviews && paper.reviews.length > 0 && (
            <button
              onClick={() => navigate(`/author/papers/${id}/reviews`)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary text-slate-700 font-bold py-2.5 px-5 rounded-lg transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">comment</span>
              <span>Xem phản hồi phản biện</span>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">timeline</span>
          Lịch sử trạng thái
        </h3>
        
        <div className="relative flex items-center justify-between w-full">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          {/* Progress Bar Active */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          
          {/* Step 1: Nộp bài */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`size-10 rounded-full ${paper.status !== 'pending' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center shadow-lg ${paper.status !== 'pending' ? 'shadow-blue-500/30' : ''}`}>
              <span className="material-symbols-outlined">check</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">Nộp bài</p>
              <p className="text-xs text-slate-500">{new Date(paper.submission_date).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Step 2: Đang phản biện */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`size-10 rounded-full ${['under_review', 'revision_required', 'accepted', 'rejected'].includes(paper.status) ? 'bg-primary text-white border-4 border-white' : 'bg-slate-200 text-slate-500 border-4 border-white'} flex items-center justify-center shadow-lg ${['under_review', 'revision_required', 'accepted', 'rejected'].includes(paper.status) ? 'shadow-blue-500/30' : ''}`}>
              <span className={`material-symbols-outlined ${paper.status === 'under_review' ? 'animate-spin' : ''}`}>
                {paper.status === 'under_review' ? 'sync' : 'rate_review'}
              </span>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${['under_review', 'revision_required', 'accepted', 'rejected'].includes(paper.status) ? 'text-primary' : 'text-slate-500'}`}>
                Đang phản biện
              </p>
              <p className="text-xs text-slate-500">
                {paper.review_start_date ? new Date(paper.review_start_date).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
              </p>
            </div>
          </div>

          {/* Step 3: Có kết quả */}
          <div className="relative z-10 flex flex-col items-center gap-3 opacity-50">
            <div className={`size-10 rounded-full ${['accepted', 'rejected'].includes(paper.status) ? 'bg-primary text-white border-4 border-white' : 'bg-slate-200 text-slate-500 border-4 border-white'} flex items-center justify-center`}>
              <span className="material-symbols-outlined">flag</span>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${['accepted', 'rejected'].includes(paper.status) ? 'text-primary' : 'text-slate-500'}`}>
                Có kết quả
              </p>
              <p className="text-xs text-slate-400">
                {paper.decision_date ? new Date(paper.decision_date).toLocaleDateString('vi-VN') : 'Dự kiến 10/10/2024'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Thông tin chung</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tiêu đề bài báo
                </label>
                <p className="text-slate-900 text-lg font-semibold leading-snug">
                  {paper.title}
                </p>
              </div>
              
              {paper.abstract && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Abstract (Tóm tắt)
                  </label>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>
              )}

              {paper.keywords && paper.keywords.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Từ khóa
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(paper.keywords) ? paper.keywords : paper.keywords.split(',')).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100"
                      >
                        {typeof keyword === 'string' ? keyword.trim() : keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Authors List */}
          {paper.authors && paper.authors.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Danh sách tác giả</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Họ và tên
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Đơn vị công tác
                      </th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paper.authors.map((author, index) => (
                      <tr key={index}>
                        <td className="p-4 text-sm font-semibold text-slate-900">
                          {author.full_name || author.name}
                        </td>
                        <td className="p-4 text-sm text-slate-600">{author.email}</td>
                        <td className="p-4 text-sm text-slate-600">
                          {author.affiliation || 'Không rõ'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              author.is_corresponding || index === 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {author.is_corresponding || index === 0
                              ? 'Tác giả liên hệ'
                              : 'Đồng tác giả'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Files Submitted */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined">attach_file</span>
                Tài liệu đã nộp
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {(paper.pdf_path || paper.file_path) ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500 text-3xl">
                      picture_as_pdf
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {(paper.pdf_path || paper.file_path).split('/').pop()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {paper.created_at ? new Date(paper.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/papers/${paper.id}/pdf`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Failed to fetch PDF');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        setTimeout(() => window.URL.revokeObjectURL(url), 100);
                      } catch (error) {
                        console.error('Error loading PDF:', error);
                        alert('Không thể tải file PDF. Vui lòng thử lại.');
                      }
                    }}
                    className="p-2 text-primary hover:bg-blue-100 rounded-lg transition-all"
                    title="Download"
                  >
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    file_present
                  </span>
                  <p className="text-sm">Chưa có tài liệu</p>
                </div>
              )}
            </div>
          </div>

          {/* Conference Info */}
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/20">
            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">
              Thông tin hội nghị
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs opacity-70 mb-1">Hội nghị</p>
                <p className="font-bold">{paper.conference_name || paper.conference?.name || 'Không rõ'}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">Phân ban</p>
                <p className="font-bold">{paper.track_name || paper.track?.name || 'Chưa phân công'}</p>
              </div>
              {paper.status === 'revision_required' && paper.revision_deadline && (
                <div>
                  <p className="text-xs opacity-70 mb-1">Thời hạn chỉnh sửa</p>
                  <p className="font-bold">
                    {new Date(paper.revision_deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs opacity-70 mb-1">Trạng thái hiện tại</p>
                <p className="font-bold">{getStatusLabel(paper.status)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
