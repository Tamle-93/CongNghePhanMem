/**
 * ============================================
 * ChairHomePage.jsx - Trang chủ Dashboard cho Chair
 * ============================================
 * 
 * MỤC ĐÍCH:
 * - Hiển thị tổng quan thống kê bài nộp của hội nghị
 * - Biểu đồ phân bố trạng thái bài báo (pending, reviewing, accepted, rejected)
 * - Nhật ký hoạt động gần đây
 * - Các tác vụ cần xử lý khẩn cấp
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Component mount -> gọi API lấy danh sách papers
 * 2. Tính toán stats từ dữ liệu papers
 * 3. Hiển thị biểu đồ donut và các card thống kê
 * 
 * ACTIONS:
 * - "Xuất báo cáo": Export stats ra file CSV
 * - "Phân công bài mới": Navigate đến trang quản lý bài nộp
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChairHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPapers: 0,
    underReview: 0,
    completed: 0,
    reviewers: 0
  });
  const [papers, setPapers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Export báo cáo thống kê ra file CSV
   * - Tạo file CSV từ dữ liệu papers
   * - Tự động download file
   */
  const handleExportReport = () => {
    try {
      const csvContent = [
        ['Báo cáo thống kê hội nghị', new Date().toLocaleDateString('vi-VN')].join(','),
        [''],
        ['Chỉ số', 'Giá trị'].join(','),
        ['Tổng số bài nộp', stats.totalPapers].join(','),
        ['Đang phản biện', stats.underReview].join(','),
        ['Đã có kết quả', stats.completed].join(','),
        ['Chờ phân công', stats.totalPapers - stats.underReview - stats.completed].join(','),
        [''],
        ['Danh sách bài nộp'],
        ['STT', 'Tiêu đề', 'Trạng thái', 'Ngày nộp'].join(','),
        ...papers.map((p, i) => [
          i + 1,
          `"${p.title?.replace(/"/g, '""') || ''}"`,
          p.status || 'pending',
          p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bao-cao-hoi-nghi-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Export error:', error);
      alert('Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  };

  const fetchData = async () => {
    try {
      const [papersRes] = await Promise.all([
        api.listPapers().catch(() => ({ data: { data: { papers: [] } } }))
      ]);

      const papersData = papersRes.data?.data?.papers || papersRes.data?.papers || [];

      // Calculate real stats from data
      setStats({
        totalPapers: papersData.length,
        underReview: papersData.filter(p => p.status === 'under_review').length,
        completed: papersData.filter(p => p.status === 'accepted' || p.status === 'rejected').length,
        reviewers: 0 // Will be loaded from API later
      });

      setPapers(papersData);

      // Activities and urgent tasks will come from real API
      setActivities([]);
      setUrgentTasks([]);

    } catch (err) {
      console.error('Error:', err);
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

  // Calculate percentages only if there are papers, otherwise show 0
  const total = stats.totalPapers || 0;
  const pendingCount = total - stats.underReview - stats.completed;
  const pendingPercent = total > 0 ? Math.round(pendingCount / total * 100) : 0;
  const reviewingPercent = total > 0 ? Math.round(stats.underReview / total * 100) : 0;
  const acceptedPercent = total > 0 ? Math.round((stats.completed / 2) / total * 100) : 0;
  const rejectedPercent = total > 0 ? Math.round((stats.completed / 2) / total * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight font-heading">
              Bảng Tổng Quan & Giám Sát Tiến Độ
            </h1>
            <p className="text-slate-600 text-base font-normal mt-2">
              Hệ thống quản lý hội nghị UTH-ConfMS - Theo dõi thống kê bài nộp và hoạt động hội nghị
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg text-slate-600">file_download</span>
              Xuất báo cáo
            </button>
            <button 
              onClick={() => navigate('/chair/papers')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Phân công bài mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Papers */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Tổng số bài nộp</p>
                <p className="text-slate-900 text-4xl font-black leading-tight">{stats.totalPapers}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <span className="material-symbols-outlined">article</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-green-600 font-bold">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +12%
              </span>
              <span className="text-slate-500 font-medium">so với tuần trước</span>
            </div>
          </div>

          {/* Under Review */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Đang phản biện</p>
                <p className="text-slate-900 text-4xl font-black leading-tight">{stats.underReview}</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${reviewingPercent}%`}}></div>
              </div>
              <span className="text-slate-500 font-medium whitespace-nowrap">{reviewingPercent}%</span>
            </div>
          </div>

          {/* Completed */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Đã có kết quả</p>
                <p className="text-slate-900 text-4xl font-black leading-tight">{stats.completed}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-green-600">
                <span className="material-symbols-outlined">verified</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium italic">
                12 bài mới cần phê duyệt
              </span>
            </div>
          </div>

          {/* Reviewers */}
          <div className="flex flex-col gap-4 rounded-xl p-6 bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Phản biện viên</p>
                <p className="text-slate-900 text-4xl font-black leading-tight">{stats.reviewers}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">85% hoạt động tích cực</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Charts & Activities */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Status Chart */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-slate-900 text-lg font-bold">Biểu đồ trạng thái bài nộp</h3>
                  <p className="text-sm text-slate-600">Tỷ lệ phân bổ các bài báo theo quy trình phản biện</p>
                </div>
                <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-blue-500">
                  <option>Toàn bộ hội nghị</option>
                  <option>Theo track chủ đề</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Donut Chart */}
                <div className="relative w-60 h-60 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="stroke-slate-100" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                    <circle className="stroke-blue-600" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${pendingPercent} 100`} strokeDashoffset="0" strokeWidth="4"></circle>
                    <circle className="stroke-orange-400" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${reviewingPercent} 100`} strokeDashoffset={`-${pendingPercent}`} strokeWidth="4"></circle>
                    <circle className="stroke-green-500" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${acceptedPercent} 100`} strokeDashoffset={`-${pendingPercent + reviewingPercent}`} strokeWidth="4"></circle>
                    <circle className="stroke-red-500" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${rejectedPercent} 100`} strokeDashoffset={`-${pendingPercent + reviewingPercent + acceptedPercent}`} strokeWidth="4"></circle>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-black text-slate-900 block">{stats.totalPapers}</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Tổng bài nộp</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]"></div>
                      <span className="text-sm font-semibold text-slate-900">Đang phản biện</span>
                    </div>
                    <span className="text-sm font-black text-orange-500">{reviewingPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(19,127,236,0.5)]"></div>
                      <span className="text-sm font-semibold text-slate-900">Chờ phân công</span>
                    </div>
                    <span className="text-sm font-black text-blue-600">{pendingPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-sm font-semibold text-slate-900">Chấp nhận</span>
                    </div>
                    <span className="text-sm font-black text-green-500">{acceptedPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                      <span className="text-sm font-semibold text-slate-900">Từ chối</span>
                    </div>
                    <span className="text-sm font-black text-red-500">{rejectedPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-slate-900 text-lg font-bold">Nhật ký hoạt động gần đây</h3>
                <button className="text-blue-600 text-xs font-bold hover:underline uppercase tracking-wider">
                  Xem lịch sử đầy đủ
                </button>
              </div>
              <div className="p-6 space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className={`flex gap-4 items-start relative pb-6 border-l-2 border-slate-100 ml-2 pl-6 ${index === activities.length - 1 ? 'pb-0 border-l-0' : ''}`}>
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-white ${
                      activity.type === 'review' ? 'bg-blue-600' : 
                      activity.type === 'system' ? 'bg-slate-400' : 'bg-orange-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-slate-900 font-medium">
                          <span className="font-bold">{activity.user}</span> {activity.action}
                        </p>
                        <span className="text-[10px] text-slate-600 font-bold uppercase">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">{activity.paper}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Urgent Tasks */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sticky top-[100px]">
              <div className="p-6 border-b border-slate-100 bg-red-50/30 rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="material-symbols-outlined">notification_important</span>
                  <h3 className="text-base font-bold">Việc cần xử lý ngay</h3>
                </div>
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                  {urgentTasks.length}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {urgentTasks.map((task) => {
                  const statusColors = {
                    overdue: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', hover: 'hover:border-red-200', icon: 'alarm' },
                    conflict: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:border-orange-200', icon: 'compare_arrows' },
                    config: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:border-blue-200', icon: 'mail' }
                  };
                  const colors = statusColors[task.status];

                  return (
                    <div key={task.id} className={`p-4 rounded-xl border border-slate-100 bg-slate-50/50 ${colors.hover} transition-all cursor-pointer group`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {task.id > 0 ? `Bài báo #${task.id}` : 'Hệ thống'}
                        </span>
                        <span className={`text-[9px] font-black ${colors.bg} ${colors.text} px-1.5 py-0.5 rounded border ${colors.border}`}>
                          {task.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h4>
                      <div className={`mt-3 flex items-center gap-2 text-[11px] font-medium ${colors.text}`}>
                        <span className="material-symbols-outlined text-sm">{colors.icon}</span>
                        <span>{task.message}</span>
                      </div>
                      <button className={`mt-4 w-full py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                        task.status === 'overdue' 
                          ? 'text-white bg-blue-600 hover:bg-blue-700' 
                          : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                      }`}>
                        {task.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
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

export default ChairHomePage;
