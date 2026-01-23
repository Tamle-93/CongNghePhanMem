// src/pages/chair/ChairDecisionsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairDecisionsPage = ({ onNavigate }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [papers, setPapers] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, decided

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      loadData();
    }
  }, [selectedConference]);

  const loadConferences = async () => {
    try {
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success' && response.data.conferences.length > 0) {
        setConferences(response.data.conferences);
        setSelectedConference(response.data.conferences[0].id);
      }
    } catch (err) {
      setError('Không thể tải hội nghị: ' + err.message);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load papers
      const papersRes = await api.listPapers({ conference_id: selectedConference });
      setPapers(papersRes.data?.papers || []);

      // Load decisions
      const decisionsRes = await api.getConferenceDecisions(selectedConference);
      setDecisions(decisionsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDecision = (paper) => {
    onNavigate('paper-detail', { paperId: paper.id });
  };

  const handleBulkNotify = async () => {
    if (!window.confirm('Bạn có chắc muốn gửi email thông báo đến tất cả tác giả?')) {
      return;
    }
    try {
      await api.bulkNotifyAuthors(selectedConference);
      alert('Đã gửi email thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getDecisionColor = (result) => {
    const colors = {
      Accept: 'bg-green-100 text-green-800',
      Reject: 'bg-red-100 text-red-800',
      Revision: 'bg-yellow-100 text-yellow-800'
    };
    return colors[result] || 'bg-gray-100 text-gray-800';
  };

  const filteredPapers = papers.filter(paper => {
    if (filter === 'pending') return !['accepted', 'rejected'].includes(paper.status);
    if (filter === 'decided') return ['accepted', 'rejected'].includes(paper.status);
    return true;
  });

  const stats = {
    total: papers.length,
    accepted: papers.filter(p => p.status === 'accepted').length,
    rejected: papers.filter(p => p.status === 'rejected').length,
    pending: papers.filter(p => !['accepted', 'rejected'].includes(p.status)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý quyết định</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ra quyết định cho các bài báo đã được phản biện
          </p>
        </div>
        <div className="flex space-x-4">
          {conferences.length > 1 && (
            <select
              value={selectedConference || ''}
              onChange={(e) => setSelectedConference(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {conferences.map(conf => (
                <option key={conf.id} value={conf.id}>{conf.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleBulkNotify}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Gửi email hàng loạt
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng bài</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Chấp nhận</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Chưa quyết định</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                filter === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                filter === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500'
              }`}
            >
              Chưa quyết định ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('decided')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                filter === 'decided' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
              }`}
            >
              Đã quyết định ({stats.accepted + stats.rejected})
            </button>
          </nav>
        </div>

        {/* Papers List */}
        <div className="divide-y">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Không có bài báo nào</p>
            </div>
          ) : (
            filteredPapers.map(paper => {
              const decision = decisions.find(d => d.paper_id === paper.id);
              return (
                <div key={paper.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {paper.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>Tác giả: {paper.submitter_name}</span>
                        <span>•</span>
                        <span>Track: {paper.track_name || 'N/A'}</span>
                      </div>
                      {decision ? (
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(decision.result)}`}>
                            {decision.result}
                          </span>
                          <span className="text-sm text-gray-500">
                            bởi {decision.chair_name} • {new Date(decision.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Chưa quyết định
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleMakeDecision(paper)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {decision ? 'Xem chi tiết' : 'Ra quyết định'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairDecisionsPage;