import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ConferencesPage = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await api.listConferences();
      setConferences(response.data?.conferences || []);
    } catch (err) {
      console.error('Error fetching conferences:', err);
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
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
            Danh sách hội nghị khoa học
          </h1>
          <p className="text-slate-500 text-base">
            Khám phá và nộp bài cho các hội nghị khoa học uy tín.
          </p>
        </div>

        {conferences.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-slate-400 mb-4">
              <span className="material-symbols-outlined text-6xl">event</span>
            </div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">Chưa có hội nghị nào</h3>
            <p className="text-slate-500">Hiện tại chưa có hội nghị nào đang mở.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conf) => (
              <div key={conf.conference_id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined text-3xl">event</span>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    Đang mở
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {conf.name}
                </h3>
                
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                  {conf.description || 'Hội nghị khoa học quốc tế'}
                </p>
                
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
                
                <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ConferencesPage;
