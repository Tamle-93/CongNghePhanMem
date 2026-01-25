import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    conferences: 0,
    papers: 0,
    users: 0
  });
  const [conferences, setConferences] = useState([]);
  const [myPapers, setMyPapers] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [conferencesRes, papersRes, usersRes] = await Promise.all([
        api.listConferences().catch(() => ({ data: { conferences: [] } })),
        api.listPapers().catch(() => ({ data: { papers: [] } })),
        api.listUsers().catch(() => ({ data: { users: [] } }))
      ]);

      const conferencesData = conferencesRes.data?.conferences || [];
      const papersData = papersRes.data?.papers || [];
      const usersData = usersRes.data?.users || [];

      // Filter active conferences (upcoming submission deadlines)
      const now = new Date();
      const activeConfs = conferencesData.filter(conf => {
        if (!conf.submission_deadline) return false;
        const deadline = new Date(conf.submission_deadline);
        return deadline > now;
      }).sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline));

      // Get deadlines from user's papers
      const papersWithDeadlines = papersData
        .filter(paper => paper.conference_id)
        .map(paper => {
          const conf = conferencesData.find(c => c.conference_id === paper.conference_id);
          return {
            ...paper,
            conference_name: conf?.name || 'N/A',
            submission_deadline: conf?.submission_deadline,
            review_deadline: conf?.review_deadline
          };
        })
        .filter(paper => {
          if (!paper.submission_deadline) return false;
          const deadline = new Date(paper.submission_deadline);
          return deadline > now;
        })
        .sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline))
        .slice(0, 3);

      setConferences(activeConfs.slice(0, 3));
      setMyPapers(papersData.slice(0, 3));
      setUpcomingDeadlines(papersWithDeadlines);
      setStats({
        conferences: conferencesData.length,
        papers: papersData.length,
        users: usersData.length
      });
    } catch (err) {
      console.error('Error fetching data:', err);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
        {/* Hero Welcome Section */}
        <section className="rounded-2xl overflow-hidden relative min-h-[320px] flex items-center shadow-lg group">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900"></div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
          
          {/* Hero Content */}
          <div className="relative z-20 px-6 lg:px-12 py-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-white text-xs font-medium mb-4">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Hệ thống Quản lý Hội nghị Khoa học</span>
            </div>
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4">
              Chào mừng {user?.full_name || user?.username}
            </h1>
            <p className="text-blue-100 text-base md:text-lg font-normal leading-relaxed mb-8 max-w-2xl">
              Nền tảng hỗ trợ nộp bài, phản biện và quản lý hội nghị chuyên nghiệp. Theo dõi tiến độ bài báo và cập nhật thông tin mới nhất từ các hội nghị uy tín.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/author/papers')}
                className="h-12 px-6 bg-white hover:bg-blue-50 text-blue-600 rounded-lg font-bold text-base transition-all flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined">description</span>
                Bài báo của tôi
              </button>
              <button 
                onClick={() => navigate('/author/submit')}
                className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-bold text-base transition-all backdrop-blur-sm"
              >
                Nộp bài mới
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <span className="material-symbols-outlined text-3xl">podium</span>
              </div>
              {stats.conferences > 10 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +2 mới
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Hội nghị đang mở</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.conferences}</p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-orange-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                <span className="material-symbols-outlined text-3xl">description</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Bài báo trong hệ thống</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.papers}+</p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-500 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <span className="material-symbols-outlined text-3xl">group</span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Thành viên tham gia</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.users}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">schedule</span>
                Hạn chót sắp tới
              </h2>
            </div>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((paper, idx) => {
                  const daysLeft = Math.ceil((new Date(paper.submission_deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{paper.title}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft <= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {daysLeft} ngày
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mb-1">{paper.conference_name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-sm">event</span>
                        <span>{new Date(paper.submission_deadline).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">event_available</span>
                <p className="text-sm">Không có hạn chót sắp tới</p>
              </div>
            )}
          </div>

          {/* News/Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">campaign</span>
                Tin tức & Thông báo
              </h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-1">Cập nhật hệ thống v2.0</p>
                    <p className="text-xs text-slate-600">Thêm tính năng nộp bài đa bước và tối ưu giao diện người dùng.</p>
                    <p className="text-xs text-slate-400 mt-1">2 giờ trước</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-1">Hội nghị mới được công bố</p>
                    <p className="text-xs text-slate-600">ICSE 2026 đã mở cổng nộp bài. Hạn chót: 30/03/2026.</p>
                    <p className="text-xs text-slate-400 mt-1">1 ngày trước</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg">workspace_premium</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-1">Chúc mừng tác giả xuất sắc</p>
                    <p className="text-xs text-slate-600">3 bài báo được chấp nhận tại ICSME 2026!</p>
                    <p className="text-xs text-slate-400 mt-1">3 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Conferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">event</span>
                Hội nghị đang mở
              </h2>
              <button 
                onClick={() => navigate('/conferences')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1"
              >
                Xem tất cả
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            {conferences.length > 0 ? (
              <div className="space-y-3">
                {conferences.map((conf) => {
                  const daysLeft = Math.ceil((new Date(conf.submission_deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={conf.conference_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-green-300 transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">{conf.name}</p>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                          Đang mở
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{conf.location || 'Online'}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <span className="material-symbols-outlined text-sm text-orange-600">schedule</span>
                        <span>Còn {daysLeft} ngày</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">event_busy</span>
                <p className="text-sm">Không có hội nghị đang mở</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Conferences */}
        {conferences.length > 0 && (
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Hội nghị gần đây</h2>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                Xem tất cả
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conferences.map((conf) => (
                <div key={conf.conference_id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Đang mở
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {conf.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {conf.description || 'Hội nghị khoa học quốc tế'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>Hạn nộp: {conf.submission_deadline ? new Date(conf.submission_deadline).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Material Symbols Icons CDN */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default HomePage;
