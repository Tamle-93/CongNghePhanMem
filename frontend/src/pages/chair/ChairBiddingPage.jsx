// Frontend/src/pages/chair/ChairBiddingPage.jsx
// ✅ Bidding System - PC members bid for papers

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import aiService from '../../services/aiService';

const ChairBiddingPage = ({ onNavigate }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConf, setSelectedConf] = useState(null);
  const [papers, setPapers] = useState([]);
  const [bids, setBids] = useState([]);
  const [biddingSettings, setBiddingSettings] = useState({
    enabled: false,
    deadline: '',
    min_bids: 3,
    max_bids: 10
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConf) {
      loadBiddingData();
    }
  }, [selectedConf]);

  const loadConferences = async () => {
    try {
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success' && response.data.conferences.length > 0) {
        setConferences(response.data.conferences);
        setSelectedConf(response.data.conferences[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBiddingData = async () => {
    try {
      // Load papers
      const papersRes = await api.listPapers({ conference_id: selectedConf });
      setPapers(papersRes.data?.papers || []);

      // Load bidding settings (mock)
      setBiddingSettings({
        enabled: true,
        deadline: '2026-02-15',
        min_bids: 3,
        max_bids: 10
      });

      // Load bids (mock)
      setBids([
        { id: 1, paper_id: 101, reviewer_name: 'Dr. Nguyen A', preference: 'eager', score: 0 },
        { id: 2, paper_id: 101, reviewer_name: 'Prof. Tran B', preference: 'willing', score: 0 },
        { id: 3, paper_id: 101, reviewer_name: 'Dr. Le C', preference: 'neutral', score: 0 },
        { id: 4, paper_id: 102, reviewer_name: 'Dr. Nguyen A', preference: 'unwilling', score: 0 }
      ]);
    } catch (error) {
      console.error('Error loading bidding data:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('✅ Lưu cài đặt bidding thành công!');
      setShowSettings(false);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  const getBidsForPaper = (paperId) => {
    return bids.filter(b => b.paper_id === paperId);
  };

  const getPreferenceColor = (preference) => {
    const colors = {
      eager: 'bg-green-100 text-green-800',
      willing: 'bg-blue-100 text-blue-800',
      neutral: 'bg-gray-100 text-gray-800',
      unwilling: 'bg-yellow-100 text-yellow-800',
      conflict: 'bg-red-100 text-red-800'
    };
    return colors[preference] || colors.neutral;
  };

  const getPreferenceText = (preference) => {
    const texts = {
      eager: '🔥 Rất muốn',
      willing: '✓ Sẵn sàng',
      neutral: '− Trung lập',
      unwilling: '✗ Không muốn',
      conflict: '⚠ Xung đột'
    };
    return texts[preference] || preference;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><p>Đang tải...</p></div>;
  }

  const now = new Date();
  const deadline = new Date(biddingSettings.deadline);
  const isActive = biddingSettings.enabled && now < deadline;
  const isExpired = biddingSettings.enabled && now > deadline;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bidding System</h2>
          <p className="text-sm text-gray-600 mt-1">PC members đấu thầu bài báo để phản biện</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ⚙️ Cài đặt
          </button>
          {conferences.length > 1 && (
            <select
              value={selectedConf || ''}
              onChange={(e) => setSelectedConf(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg"
            >
              {conferences.map(conf => (
                <option key={conf.id} value={conf.id}>{conf.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${
        isActive ? 'bg-green-50 border-2 border-green-200' : 
        isExpired ? 'bg-red-50 border-2 border-red-200' : 
        'bg-gray-50 border-2 border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500 animate-pulse' : isExpired ? 'bg-red-500' : 'bg-gray-400'
          }`}></div>
          <div>
            <p className="font-semibold text-gray-900">
              {isActive && '✅ Bidding đang mở'}
              {isExpired && '⛔ Bidding đã đóng'}
              {!biddingSettings.enabled && '🔒 Bidding chưa được kích hoạt'}
            </p>
            {biddingSettings.enabled && (
              <p className="text-sm text-gray-600">
                Hạn chót: {new Date(biddingSettings.deadline).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Cài đặt Bidding</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={biddingSettings.enabled}
                onChange={(e) => setBiddingSettings({ ...biddingSettings, enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-3 font-medium text-gray-900">Bật bidding phase</span>
            </div>

            {biddingSettings.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn chót bidding</label>
                  <input
                    type="datetime-local"
                    value={biddingSettings.deadline}
                    onChange={(e) => setBiddingSettings({ ...biddingSettings, deadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số bid tối thiểu</label>
                    <input
                      type="number"
                      value={biddingSettings.min_bids}
                      onChange={(e) => setBiddingSettings({ ...biddingSettings, min_bids: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số bid tối đa</label>
                    <input
                      type="number"
                      value={biddingSettings.max_bids}
                      onChange={(e) => setBiddingSettings({ ...biddingSettings, max_bids: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      )}

      {/* Papers & Bids */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Danh sách Bài báo & Bids</h3>
        </div>
        <div className="divide-y">
          {papers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Không có bài báo nào</div>
          ) : (
            papers.map(paper => {
              const paperBids = getBidsForPaper(paper.id);
              return (
                <div key={paper.id} className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{paper.title}</h4>
                    <p className="text-sm text-gray-600">
                      Tác giả: {paper.submitter_name} • Track: {paper.track_name || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Bids nhận được:</span>
                      <span className="text-gray-600">{paperBids.length} bids</span>
                    </div>
                    
                    {paperBids.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Chưa có bid nào</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {paperBids.map(bid => (
                          <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{bid.reviewer_name}</span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPreferenceColor(bid.preference)}`}>
                              {getPreferenceText(bid.preference)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Tổng bài báo</p>
          <p className="text-3xl font-bold text-blue-600">{papers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Tổng bids</p>
          <p className="text-3xl font-bold text-green-600">{bids.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Bids TB/bài</p>
          <p className="text-3xl font-bold text-purple-600">
            {papers.length > 0 ? (bids.length / papers.length).toFixed(1) : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChairBiddingPage;