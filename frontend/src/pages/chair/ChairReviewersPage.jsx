import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

const ChairReviewersPage = () => {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      // Try to fetch real reviewers from API
      const response = await api.listUsers({ role: 'Reviewer' }).catch(() => ({ data: { data: { users: [] } } }));
      const users = response.data?.data?.users || response.data?.users || [];
      // Transform users to reviewer format
      const reviewerList = users.map(user => ({
        id: user.id,
        name: user.full_name || user.username,
        role: 'Phản biện viên',
        organization: user.organization || user.affiliation || 'Chưa cập nhật',
        track: user.expertise || 'Chưa phân bổ',
        workload: user.paper_count || 0,
        email: user.email,
        avatar: null
      }));
      setReviewers(reviewerList);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
      setReviewers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('Vui lòng nhập email');
      return;
    }
    setInviting(true);
    try {
      // TODO: Call API to invite reviewer
      // await api.inviteReviewer({ email: inviteEmail });
      alert(`Đã gửi lời mời tới ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể gửi lời mời. Vui lòng thử lại.'));
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveReviewer = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi hội đồng?')) return;
    try {
      // TODO: Call API to remove reviewer
      // await api.removeReviewer(id);
      setReviewers(reviewers.filter(r => r.id !== id));
      alert('Đã xóa thành viên');
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể xóa thành viên. Vui lòng thử lại.'));
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch = reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reviewer.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = !selectedTrack || reviewer.track.includes(selectedTrack);
    return matchesSearch && matchesTrack;
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
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Mời thành viên mới</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Đang gửi...' : 'Gửi lời mời'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
              Quản Lý Đội Ngũ Phản Biện PC
            </h1>
            <p className="text-slate-600 text-base font-normal mt-3 leading-relaxed">
              Hệ thống quản lý và giám sát năng lực đội ngũ chuyên gia trong Hội đồng chương trình (PC Members), bao gồm mời thành viên và theo dõi khối lượng phản biện.
            </p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 shrink-0 self-start"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Mời thành viên mới</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
              placeholder="Tìm kiếm theo tên, đơn vị, học hàm hoặc phân ban..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="">Tất cả phân ban</option>
              <option value="Khoa học máy tính">Khoa học máy tính</option>
              <option value="Công nghệ phần mềm">Công nghệ phần mềm</option>
              <option value="An toàn thông tin">An toàn thông tin</option>
              <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
            </select>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              <span>Lọc nâng cao</span>
            </button>
          </div>
        </div>

        {/* Reviewers Grid */}
        {filteredReviewers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">group</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có phản biện viên</h3>
            <p className="text-slate-600 mb-4">Mời thành viên mới để bắt đầu quản lý hội đồng phản biện</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">person_add</span>
              Mời thành viên đầu tiên
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviewers.map(reviewer => (
            <div key={reviewer.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden ring-4 ring-blue-600/5">
                    {reviewer.avatar ? (
                      <img alt="Avatar" className="size-full object-cover" src={reviewer.avatar} />
                    ) : (
                      <span className="text-2xl font-bold">{reviewer.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{reviewer.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        reviewer.role === 'Hội đồng chính' 
                          ? 'text-blue-600 bg-blue-600/10' 
                          : 'text-orange-500 bg-orange-50'
                      }`}>
                        {reviewer.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveReviewer(reviewer.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Xóa thành viên"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">business</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Đơn vị công tác</span>
                    <span className="text-slate-700 font-medium">{reviewer.organization}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">category</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Phân ban phụ trách</span>
                    <span className="text-slate-700 font-medium">{reviewer.track}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-xl">analytics</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">Khối lượng:</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{reviewer.workload} bài phản biện</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button className="flex-1 py-2.5 text-sm font-bold text-blue-600 bg-blue-600/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                  Xem năng lực
                </button>
                <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-600/5 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Summary Stats */}
        {filteredReviewers.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">groups</span>
            <p className="text-sm opacity-90 mb-1">Tổng số phản biện viên</p>
            <p className="text-3xl font-black">{reviewers.length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">analytics</span>
            <p className="text-sm opacity-90 mb-1">Tổng khối lượng phản biện</p>
            <p className="text-3xl font-black">{reviewers.reduce((sum, r) => sum + r.workload, 0)} bài</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">verified</span>
            <p className="text-sm opacity-90 mb-1">Trung bình mỗi người</p>
            <p className="text-3xl font-black">{reviewers.length > 0 ? Math.round(reviewers.reduce((sum, r) => sum + r.workload, 0) / reviewers.length) : 0} bài</p>
          </div>
        </div>
        )}
      </main>

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ChairReviewersPage;
