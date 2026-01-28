import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ConferenceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConference();
  }, [id]);

  const fetchConference = async () => {
    try {
      const response = await api.getConference(id);
      setConference(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching conference:', err);
      setError('Không thể tải thông tin hội nghị');
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

  if (error || !conference) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400">error</span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            {error || 'Không tìm thấy hội nghị'}
          </h2>
          <button
            onClick={() => navigate('/conferences')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/conferences')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Quay lại danh sách
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
              <span className="material-symbols-outlined text-4xl">event</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {conference.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  conference.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {conference.is_active ? 'Đang mở' : 'Đã đóng'}
                </span>
              </div>
              {conference.acronym && (
                <p className="text-slate-500 text-lg font-medium">{conference.acronym}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">description</span>
            Giới thiệu
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {conference.description || 'Chưa có mô tả cho hội nghị này.'}
          </p>
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_month</span>
            Thời hạn quan trọng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.submission_deadline && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-orange-500">upload_file</span>
                <div>
                  <p className="text-sm text-slate-500">Hạn nộp bài</p>
                  <p className="font-medium text-slate-900">
                    {new Date(conference.submission_deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
            {conference.review_deadline && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-blue-500">rate_review</span>
                <div>
                  <p className="text-sm text-slate-500">Hạn phản biện</p>
                  <p className="font-medium text-slate-900">
                    {new Date(conference.review_deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
            {conference.decision_deadline && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-purple-500">gavel</span>
                <div>
                  <p className="text-sm text-slate-500">Hạn quyết định</p>
                  <p className="font-medium text-slate-900">
                    {new Date(conference.decision_deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
            {conference.camera_ready_deadline && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <div>
                  <p className="text-sm text-slate-500">Hạn Camera Ready</p>
                  <p className="font-medium text-slate-900">
                    {new Date(conference.camera_ready_deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}
            {conference.conference_start_date && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-red-500">event_available</span>
                <div>
                  <p className="text-sm text-slate-500">Ngày tổ chức</p>
                  <p className="font-medium text-slate-900">
                    {new Date(conference.conference_start_date).toLocaleDateString('vi-VN')}
                    {conference.conference_end_date && 
                      ` - ${new Date(conference.conference_end_date).toLocaleDateString('vi-VN')}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conference Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Thông tin chi tiết
          </h2>
          <div className="space-y-3">
            {conference.location && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">location_on</span>
                <span className="text-slate-600">{conference.location}</span>
              </div>
            )}
            {conference.website_url && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">language</span>
                <a 
                  href={conference.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {conference.website_url}
                </a>
              </div>
            )}
            {conference.blind_review_type && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">visibility_off</span>
                <span className="text-slate-600">
                  {conference.blind_review_type === 'double-blind' 
                    ? 'Phản biện ẩn danh hai chiều (Double-blind)' 
                    : 'Phản biện ẩn danh một chiều (Single-blind)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Paper Button */}
        {conference.is_active && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/author/submit?conference=${id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Nộp bài cho hội nghị này
            </button>
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

export default ConferenceDetailPage;
