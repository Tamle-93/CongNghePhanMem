// Frontend/src/pages/chair/ChairProgramPage.jsx
// ✅ Program Schedule & Proceedings Export

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ChairProgramPage = ({ onNavigate }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConf, setSelectedConf] = useState(null);
  const [acceptedPapers, setAcceptedPapers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    chair: ''
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadConferences();
  }, []);

  useEffect(() => {
    if (selectedConf) {
      loadData();
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

  const loadData = async () => {
    try {
      // Load accepted papers
      const papersRes = await api.listPapers({ conference_id: selectedConf, status: 'accepted' });
      setAcceptedPapers(papersRes.data?.papers || []);

      // Load sessions (mock)
      setSessions([
        {
          id: 1,
          name: 'Session 1: Machine Learning',
          date: '2026-03-20',
          start_time: '09:00',
          end_time: '10:30',
          location: 'Room A',
          chair: 'Prof. Nguyen Van A',
          papers: [101, 103]
        },
        {
          id: 2,
          name: 'Session 2: Computer Vision',
          date: '2026-03-20',
          start_time: '11:00',
          end_time: '12:30',
          location: 'Room A',
          chair: 'Dr. Tran Thi B',
          papers: [102]
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddSession = () => {
    if (!sessionForm.name || !sessionForm.date || !sessionForm.start_time || !sessionForm.end_time) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const newSession = {
      id: Date.now(),
      ...sessionForm,
      papers: []
    };

    setSessions([...sessions, newSession]);
    setSessionForm({ name: '', date: '', start_time: '', end_time: '', location: '', chair: '' });
    setShowAddSession(false);
    alert('✅ Thêm session thành công!');
  };

  const handleDeleteSession = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa session này?')) return;
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleAssignPaper = (sessionId, paperId) => {
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        const papers = s.papers.includes(paperId) 
          ? s.papers.filter(p => p !== paperId)
          : [...s.papers, paperId];
        return { ...s, papers };
      }
      return s;
    }));
  };

  const handleExportProgram = async () => {
    setExporting(true);
    try {
      // Generate program HTML
      const html = generateProgramHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'conference-program.html';
      a.click();
      URL.revokeObjectURL(url);
      
      alert('✅ Xuất chương trình thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportProceedings = async () => {
    setExporting(true);
    try {
      // Generate proceedings JSON
      const proceedings = {
        conference: conferences.find(c => c.id === selectedConf),
        sessions: sessions.map(s => ({
          ...s,
          papers: s.papers.map(pid => acceptedPapers.find(p => p.id === pid))
        })),
        totalPapers: acceptedPapers.length,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(proceedings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proceedings.json';
      a.click();
      URL.revokeObjectURL(url);

      alert('✅ Xuất kỷ yếu thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const generateProgramHTML = () => {
    const conf = conferences.find(c => c.id === selectedConf);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${conf?.name || 'Conference'} - Program</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    .session { margin: 30px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #2563eb; }
    .session-header { font-size: 1.2em; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    .session-info { color: #64748b; font-size: 0.9em; margin-bottom: 15px; }
    .paper { margin: 10px 0 10px 20px; padding: 10px; background: white; border-radius: 4px; }
    .paper-title { font-weight: bold; color: #1e293b; }
    .paper-authors { color: #64748b; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${conf?.name || 'Conference Program'}</h1>
  <p><strong>Date:</strong> ${conf?.submission_deadline ? new Date(conf.submission_deadline).toLocaleDateString('vi-VN') : 'TBD'}</p>
  
  ${sessions.map(session => `
    <div class="session">
      <div class="session-header">${session.name}</div>
      <div class="session-info">
        📅 ${new Date(session.date).toLocaleDateString('vi-VN')} | 
        🕒 ${session.start_time} - ${session.end_time} | 
        📍 ${session.location} | 
        👤 Chair: ${session.chair}
      </div>
      ${session.papers.map(pid => {
        const paper = acceptedPapers.find(p => p.id === pid);
        return paper ? `
          <div class="paper">
            <div class="paper-title">${paper.title}</div>
            <div class="paper-authors">${paper.submitter_name}</div>
          </div>
        ` : '';
      }).join('')}
    </div>
  `).join('')}
</body>
</html>`;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><p>Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lập Chương trình & Kỷ yếu</h2>
          <p className="text-sm text-gray-600 mt-1">Tạo lịch trình và xuất kỷ yếu hội nghị</p>
        </div>
        <div className="flex space-x-4">
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

      {/* Export Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleExportProgram}
          disabled={exporting || sessions.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? 'Đang xuất...' : 'Xuất Chương trình (HTML)'}
        </button>
        <button
          onClick={handleExportProceedings}
          disabled={exporting || acceptedPapers.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Đang xuất...' : 'Xuất Kỷ yếu (JSON)'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Bài đã chấp nhận</p>
          <p className="text-3xl font-bold text-green-600">{acceptedPapers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Sessions đã tạo</p>
          <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Bài chưa phân session</p>
          <p className="text-3xl font-bold text-yellow-600">
            {acceptedPapers.length - sessions.reduce((sum, s) => sum + s.papers.length, 0)}
          </p>
        </div>
      </div>

      {/* Add Session Button */}
      <button
        onClick={() => setShowAddSession(!showAddSession)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm Session mới
      </button>

      {/* Add Session Form */}
      {showAddSession && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tạo Session mới</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên session</label>
              <input
                type="text"
                value={sessionForm.name}
                onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                placeholder="Ví dụ: Session 1: Machine Learning"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={sessionForm.date}
                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
              <input
                type="text"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                placeholder="Room A"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</label>
              <input
                type="time"
                value={sessionForm.start_time}
                onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc</label>
              <input
                type="time"
                value={sessionForm.end_time}
                onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Session chair</label>
              <input
                type="text"
                value={sessionForm.chair}
                onChange={(e) => setSessionForm({ ...sessionForm, chair: e.target.value })}
                placeholder="Tên người chủ trì"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleAddSession}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tạo session
            </button>
            <button
              onClick={() => setShowAddSession(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{session.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>📅 {new Date(session.date).toLocaleDateString('vi-VN')}</span>
                  <span>🕒 {session.start_time} - {session.end_time}</span>
                  <span>📍 {session.location}</span>
                  <span>👤 {session.chair}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSession(session.id)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Bài báo trong session ({session.papers.length}):
              </p>
              <div className="space-y-2">
                {acceptedPapers.map(paper => (
                  <label key={paper.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={session.papers.includes(paper.id)}
                      onChange={() => handleAssignPaper(session.id, paper.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{paper.title}</p>
                      <p className="text-xs text-gray-600">{paper.submitter_name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChairProgramPage;