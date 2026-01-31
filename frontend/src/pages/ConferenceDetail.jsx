/**
 * ==============================================================================
 * CONFERENCE DETAIL PAGE
 * ==============================================================================
 * 
 * MỤC ĐÍCH:
 * - Hiển thị thông tin chi tiết về một hội nghị khoa học
 * - Cho phép người dùng xem timeline, tracks, và thông tin quan trọng
 * - Cung cấp nút nộp bài (cho Author)
 * 
 * ROUTE: /conferences/:id
 * 
 * API CALLS:
 * - GET /api/conferences/:id - Lấy thông tin hội nghị
 * - GET /api/conferences/:id/timeline - Lấy timeline (nếu có)
 * - GET /api/conferences/:id/tracks - Lấy danh sách tracks
 * 
 * COMPONENTS:
 * - ConferenceInfo: Thông tin cơ bản (tên, mô tả, địa điểm)
 * - TimelineSection: Các mốc thời gian quan trọng
 * - TracksSection: Danh sách chủ đề/tracks
 * - ActionButtons: Nút nộp bài, đăng ký, etc.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ConferenceDetail = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conference, setConference] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    fetchConferenceData();
  }, [id]);

  /**
   * Fetch tất cả dữ liệu của hội nghị
   * Gọi song song các API để tăng tốc độ load
   */
  const fetchConferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API chính để lấy thông tin hội nghị
      const conferenceRes = await api.get(`/conferences/${id}`);
      
      if (conferenceRes.data?.status === 'success') {
        const confData = conferenceRes.data.data;
        setConference(confData);
        
        // Nếu conference có tracks, lưu vào state
        if (confData.tracks) {
          setTracks(confData.tracks);
        }
        
        // Nếu conference có timeline/deadlines, lưu vào state
        if (confData.deadlines) {
          setTimeline(confData.deadlines);
        }
      } else {
        setError('Không tìm thấy thông tin hội nghị');
      }
    } catch (err) {
      console.error('Error fetching conference:', err);
      setError('Không thể tải thông tin hội nghị. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Format ngày tháng theo locale Việt Nam
   * @param {string} dateString - ISO date string
   * @returns {string} - Ngày đã format
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Kiểm tra deadline còn hạn hay không
   * @param {string} deadline - ISO date string
   * @returns {boolean}
   */
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  /**
   * Tính số ngày còn lại đến deadline
   * @param {string} deadline - ISO date string
   * @returns {number} - Số ngày (âm nếu đã qua)
   */
  const getDaysUntil = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  /**
   * Xử lý khi user click "Nộp bài"
   * Chuyển đến trang submit paper với conference_id
   */
  const handleSubmitPaper = () => {
    if (!user) {
      // Chưa đăng nhập -> redirect to login
      navigate('/login', { state: { from: `/conferences/${id}` } });
      return;
    }
    
    // Chuyển đến trang nộp bài với conference_id và tên hội nghị
    navigate(`/author/submit?conference_id=${id}&conference_name=${encodeURIComponent(conference?.name || '')}`);
  };

  // ============================================
  // RENDER LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải thông tin hội nghị...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER ERROR STATE
  // ============================================
  if (error || !conference) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <span className="material-symbols-outlined text-6xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {error || 'Không tìm thấy hội nghị'}
          </h2>
          <p className="text-slate-500 mb-6">
            Hội nghị này có thể không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate('/conferences')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER MAIN CONTENT
  // ============================================
  const daysUntilSubmission = getDaysUntil(conference.submission_deadline);
  const submissionClosed = isDeadlinePassed(conference.submission_deadline);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          {/* Back button */}
          <button
            onClick={() => navigate('/conferences')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Quay lại danh sách hội nghị</span>
          </button>
          
          {/* Conference Title */}
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/10 rounded-xl">
              <span className="material-symbols-outlined text-4xl">event</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                {conference.name}
              </h1>
              {conference.acronym && (
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {conference.acronym} {conference.year && `${conference.year}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                Giới thiệu
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {conference.description || 'Chưa có thông tin mô tả cho hội nghị này.'}
              </p>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">schedule</span>
                Các mốc thời gian quan trọng
              </h2>
              
              <div className="space-y-4">
                {/* Submission Deadline */}
                {conference.submission_deadline && (
                  <div className={`flex items-center gap-4 p-4 rounded-lg ${
                    submissionClosed ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      submissionClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Hạn nộp bài</div>
                      <div className="text-sm text-slate-600">{formatDate(conference.submission_deadline)}</div>
                    </div>
                    {!submissionClosed && daysUntilSubmission !== null && (
                      <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
                        Còn {daysUntilSubmission} ngày
                      </span>
                    )}
                    {submissionClosed && (
                      <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                        Đã hết hạn
                      </span>
                    )}
                  </div>
                )}

                {/* Review Deadline */}
                {conference.review_deadline && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="p-2 rounded-full bg-slate-100 text-slate-600">
                      <span className="material-symbols-outlined">rate_review</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Hạn phản biện</div>
                      <div className="text-sm text-slate-600">{formatDate(conference.review_deadline)}</div>
                    </div>
                  </div>
                )}

                {/* Conference Date */}
                {conference.start_date && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Ngày diễn ra hội nghị</div>
                      <div className="text-sm text-slate-600">
                        {formatDate(conference.start_date)}
                        {conference.end_date && conference.end_date !== conference.start_date && (
                          <> - {formatDate(conference.end_date)}</>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Timeline Items */}
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="p-2 rounded-full bg-slate-100 text-slate-600">
                      <span className="material-symbols-outlined">flag</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{item.name || item.title}</div>
                      <div className="text-sm text-slate-600">{formatDate(item.deadline || item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracks Card */}
            {tracks.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">category</span>
                  Chủ đề / Tracks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tracks.map((track, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="material-symbols-outlined text-blue-600">label</span>
                      <span className="text-slate-700">{track.name || track}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Tham gia hội nghị</h3>
              
              {!submissionClosed ? (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Hội nghị đang mở nhận bài. Hãy nộp bài nghiên cứu của bạn ngay!
                  </p>
                  <button
                    onClick={handleSubmitPaper}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">upload_file</span>
                    Nộp bài ngay
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Hội nghị đã đóng nhận bài. Vui lòng theo dõi các hội nghị khác.
                  </p>
                  <button
                    disabled
                    className="w-full py-3 bg-slate-200 text-slate-500 font-semibold rounded-lg cursor-not-allowed"
                  >
                    Đã hết hạn nộp bài
                  </button>
                </>
              )}
              
              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                {conference.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span>{conference.location}</span>
                  </div>
                )}
                {conference.website && (
                  <a
                    href={conference.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span className="material-symbols-outlined text-lg">language</span>
                    <span>Website hội nghị</span>
                  </a>
                )}
                {conference.contact_email && (
                  <a
                    href={`mailto:${conference.contact_email}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span>{conference.contact_email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Chair Info Card */}
            {conference.chair_name && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Ban tổ chức</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">person</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{conference.chair_name}</div>
                    <div className="text-sm text-slate-500">Chủ tọa hội nghị</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Google Material Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ConferenceDetail;
