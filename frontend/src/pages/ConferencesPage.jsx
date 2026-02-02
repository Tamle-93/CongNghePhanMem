/**
 * ==============================================================================
 * CONFERENCES LIST PAGE
 * ==============================================================================
 * 
 * MỤC ĐÍCH:
 * - Hiển thị danh sách tất cả hội nghị khoa học đang mở
 * - Cho phép người dùng tìm kiếm và lọc hội nghị
 * - Link đến trang chi tiết của từng hội nghị
 * 
 * ROUTE: /conferences
 * 
 * API CALLS:
 * - GET /api/conferences - Lấy danh sách hội nghị
 * 
 * NAVIGATION:
 * - Click "Xem chi tiết" -> /conferences/:id
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ConferencesPage = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    fetchConferences();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchConferences, 60000);
    
    // Refresh when tab is focused
    const handleFocus = () => fetchConferences();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /**
   * Fetch danh sách hội nghị từ API
   * API trả về: { status: 'success', data: { conferences: [...] } }
   * CHỈ HIỂN THỊ HỘI NGHỊ ĐANG HOẠT ĐỘNG (is_active = true)
   */
  const fetchConferences = async () => {
    try {
      const response = await api.listConferences();
      console.log('Conferences response:', response.data);
      // Filter chỉ lấy hội nghị đang hoạt động
      const allConferences = response.data?.data?.conferences || [];
      const activeConferences = allConferences.filter(c => c.is_active === true);
      setConferences(activeConferences);
    } catch (err) {
      console.error('Error fetching conferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  /**
   * Xử lý khi user click vào nút "Xem chi tiết"
   * Chuyển đến trang chi tiết hội nghị
   * @param {number} conferenceId - ID của hội nghị
   */
  const handleViewDetail = (conferenceId) => {
    navigate(`/conferences/${conferenceId}`);
  };

  // ============================================
  // RENDER LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  // ============================================
  // RENDER MAIN CONTENT
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
              Danh sách hội nghị khoa học
            </h1>
            <p className="text-slate-500 text-base">
              Khám phá và nộp bài cho các hội nghị khoa học uy tín.
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchConferences}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* Empty State */}
        {conferences.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-slate-400 mb-4">
              <span className="material-symbols-outlined text-6xl">event</span>
            </div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">Chưa có hội nghị nào</h3>
            <p className="text-slate-500">Hiện tại chưa có hội nghị nào đang mở.</p>
          </div>
        ) : (
          /* Conference Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conf) => (
              <div 
                key={conf.conference_id || conf.id} 
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-lg text-green-700">
                    <span className="material-symbols-outlined text-3xl">event</span>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Đang mở
                  </span>
                </div>
                
                {/* Conference Title */}
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                  {conf.name}
                </h3>
                
                {/* Conference Description */}
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                  {conf.description || 'Hội nghị khoa học quốc tế'}
                </p>
                
                {/* Conference Info */}
                <div className="space-y-2 text-sm">
                  {conf.submission_deadline && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span>Hạn nộp: {new Date(conf.submission_deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {conf.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      <span>{conf.location}</span>
                    </div>
                  )}
                </div>
                
                {/* View Detail Button */}
                <button 
                  onClick={() => handleViewDetail(conf.conference_id || conf.id)}
                  className="w-full mt-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Google Material Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ConferencesPage;
