// src/pages/chair/ChairDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    submitted: 0,
    underReview: 0,
    reviewProgress: 0,
    decisions: {
      accepted: 0,
      rejected: 0,
      pending: 0
    }
  });
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      loadStats();
    }
  }, [selectedConference]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success' && response.data.conferences.length > 0) {
        setConferences(response.data.conferences);
        setSelectedConference(response.data.conferences[0].id);
      }
    } catch (err) {
      console.error('Error loading conferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedConference) return;

    try {
      // Load papers
      const papersRes = await api.listPapers({ conference_id: selectedConference });
      const papers = papersRes.data?.papers || [];

      // Load review progress
      let reviewProgress = 0;
      try {
        const progressRes = await api.getReviewProgress(selectedConference);
        reviewProgress = progressRes.data?.completion_rate || 0;
      } catch (err) {
        console.log('Cannot load review progress');
      }

      // Load decisions
      let decisions = { accepted: 0, rejected: 0, pending: 0 };
      try {
        const decisionsRes = await api.getDecisionStatistics(selectedConference);
        if (decisionsRes.status === 'success') {
          decisions = {
            accepted: decisionsRes.data.accepted || 0,
            rejected: decisionsRes.data.rejected || 0,
            pending: decisionsRes.data.pending_decisions || 0
          };
        }
      } catch (err) {
        console.log('Cannot load decisions');
      }

      setStats({
        totalPapers: papers.length,
        submitted: papers.filter(p => p.status === 'submitted').length,
        underReview: papers.filter(p => p.status === 'under_review').length,
        reviewProgress,
        decisions
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const currentConference = conferences.find(c => c.id === selectedConference);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Quản lý</h2>
          <p className="text-sm text-gray-600 mt-1">Tổng quan và thống kê hội nghị</p>
        </div>
        {conferences.length > 1 && (
          <select
            value={selectedConference || ''}
            onChange={(e) => setSelectedConference(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {conferences.map(conf => (
              <option key={conf.id} value={conf.id}>{conf.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Conference Info */}
      {currentConference && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">{currentConference.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-90">Hạn nộp bài:</span>
              <span className="ml-2 font-semibold">
                {new Date(currentConference.submission_deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="opacity-90">Hạn phản biện:</span>
              <span className="ml-2 font-semibold">
                {new Date(currentConference.review_deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Tổng bài nộp</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPapers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Đang phản biện</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.underReview}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Tiến độ phản biện</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.reviewProgress}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Đã quyết định</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.decisions.accepted + stats.decisions.rejected}
          </p>
        </div>
      </div>

      {/* Decisions Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Thống kê quyết định</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Chấp nhận</p>
            <p className="text-2xl font-bold text-green-600">{stats.decisions.accepted}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Từ chối</p>
            <p className="text-2xl font-bold text-red-600">{stats.decisions.rejected}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Chưa quyết định</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.decisions.pending}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('papers')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Quản lý bài nộp</h3>
          <p className="text-sm text-gray-600">Xem và quản lý tất cả bài báo đã nộp</p>
        </button>

        <button
          onClick={() => onNavigate('assignments')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Phân công reviewer</h3>
          <p className="text-sm text-gray-600">Phân công và theo dõi tiến độ phản biện</p>
        </button>

        <button
          onClick={() => onNavigate('decisions')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Ra quyết định</h3>
          <p className="text-sm text-gray-600">Quyết định chấp nhận hoặc từ chối bài báo</p>
        </button>
      </div>
    </div>
  );
};

export default ChairDashboard;
