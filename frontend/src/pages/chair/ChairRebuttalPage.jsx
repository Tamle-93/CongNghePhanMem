// Frontend/src/pages/chair/ChairRebuttalPage.jsx
// ✅ Rebuttal Phase Management (Author Response Window)

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairRebuttalPage = ({ onNavigate }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConf, setSelectedConf] = useState(null);
  const [rebuttalSettings, setRebuttalSettings] = useState({
    enabled: false,
    start_date: '',
    end_date: '',
    word_limit: 500,
    allow_file_upload: false
  });
  const [rebuttals, setRebuttals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConf) {
      loadRebuttalSettings();
      loadRebuttals();
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

  const loadRebuttalSettings = async () => {
    // Mock data
    setRebuttalSettings({
      enabled: true,
      start_date: '2026-02-01',
      end_date: '2026-02-07',
      word_limit: 500,
      allow_file_upload: false
    });
  };

  const loadRebuttals = async () => {
    // Mock rebuttals
    setRebuttals([
      {
        id: 1,
        paper_id: 101,
        paper_title: 'Deep Learning for Medical Image Analysis',
        author_name: 'Nguyen Van A',
        rebuttal_text: 'Thank you for your valuable feedback. We have addressed the concerns about sample size...',
        word_count: 245,
        submitted_at: '2026-02-05T10:30:00',
        status: 'submitted'
      },
      {
        id: 2,
        paper_id: 102,
        paper_title: 'Blockchain in Supply Chain Management',
        author_name: 'Tran Thi B',
        rebuttal_text: null,
        word_count: 0,
        submitted_at: null,
        status: 'pending'
      }
    ]);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Lưu cài đặt rebuttal thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRebuttal = () => {
    setRebuttalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(rebuttalSettings.start_date);
  const endDate = new Date(rebuttalSettings.end_date);
  const isActive = rebuttalSettings.enabled && now >= startDate && now <= endDate;
  const isPending = rebuttalSettings.enabled && now < startDate;
  const isExpired = rebuttalSettings.enabled && now > endDate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Rebuttal Phase</h2>
          <p className="text-sm text-gray-600 mt-1">Cửa sổ phản hồi của tác giả</p>
        </div>
        {conferences.length > 1 && (
          <select
            value={selectedConf || ''}
            onChange={(e) => setSelectedConf(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {conferences.map(conf => (
              <option key={conf.id} value={conf.id}>{conf.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${
        isActive ? 'bg-green-50 border-2 border-green-200' :
        isPending ? 'bg-yellow-50 border-2 border-yellow-200' :
        isExpired ? 'bg-red-50 border-2 border-red-200' :
        'bg-gray-50 border-2 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-500 animate-pulse' :
              isPending ? 'bg-yellow-500' :
              isExpired ? 'bg-red-500' :
              'bg-gray-400'
            }`}></div>
            <div>
              <p className="font-semibold text-gray-900">
                {isActive && '✅ Rebuttal phase đang hoạt động'}
                {isPending && '⏳ Rebuttal phase sắp bắt đầu'}
                {isExpired && '⛔ Rebuttal phase đã kết thúc'}
                {!rebuttalSettings.enabled && '🔒 Rebuttal phase chưa được kích hoạt'}
              </p>
              {rebuttalSettings.enabled && (
                <p className="text-sm text-gray-600">
                  {new Date(rebuttalSettings.start_date).toLocaleDateString('vi-VN')} → {new Date(rebuttalSettings.end_date).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cài đặt Rebuttal Phase</h3>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rebuttalSettings.enabled}
                onChange={handleToggleRebuttal}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="ml-3 font-medium text-gray-900">Bật rebuttal phase</span>
            </label>
          </div>

          {rebuttalSettings.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={rebuttalSettings.start_date}
                    onChange={(e) => setRebuttalSettings({ ...rebuttalSettings, start_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={rebuttalSettings.end_date}
                    onChange={(e) => setRebuttalSettings({ ...rebuttalSettings, end_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn từ</label>
                <input
                  type="number"
                  value={rebuttalSettings.word_limit}
                  onChange={(e) => setRebuttalSettings({ ...rebuttalSettings, word_limit: parseInt(e.target.value) })}
                  min="100"
                  max="1000"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rebuttalSettings.allow_file_upload}
                  onChange={(e) => setRebuttalSettings({ ...rebuttalSettings, allow_file_upload: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Cho phép tác giả tải file đính kèm</span>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </form>
      </div>

      {/* Rebuttals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Danh sách Rebuttals</h3>
        </div>
        <div className="divide-y">
          {rebuttals.map(rebuttal => (
            <div key={rebuttal.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rebuttal.paper_title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Tác giả: {rebuttal.author_name}</p>
                  {rebuttal.status === 'submitted' && (
                    <>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{rebuttal.rebuttal_text}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{rebuttal.word_count} từ</span>
                        <span>•</span>
                        <span>Nộp lúc: {new Date(rebuttal.submitted_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </>
                  )}
                </div>
                <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${
                  rebuttal.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rebuttal.status === 'submitted' ? '✓ Đã nộp' : '⏳ Chưa nộp'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChairRebuttalPage;