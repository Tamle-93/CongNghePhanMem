// Frontend/src/pages/chair/ChairDiscussionsPage.jsx
// ✅ PC Internal Discussion Management

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChairDiscussionsPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    if (selectedPaper) {
      loadDiscussions(selectedPaper.id);
    }
  }, [selectedPaper]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const response = await api.listPapers({ status: 'under_review' });
      if (response.status === 'success') {
        setPapers(response.data.papers || []);
        if (response.data.papers.length > 0) {
          setSelectedPaper(response.data.papers[0]);
        }
      }
    } catch (error) {
      console.error('Error loading papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async (paperId) => {
    try {
      // Mock data - replace with actual API call
      const mockDiscussions = [
        {
          id: 1,
          user_name: 'Dr. Nguyen Van A',
          user_role: 'Reviewer',
          message: 'Tôi nghĩ phương pháp nghiên cứu còn thiếu chi tiết về sample size.',
          created_at: new Date().toISOString(),
          is_chair: false
        },
        {
          id: 2,
          user_name: 'Prof. Tran Thi B',
          user_role: 'Chair',
          message: 'Đồng ý. Tác giả nên bổ sung thêm phần này trong rebuttal.',
          created_at: new Date().toISOString(),
          is_chair: true
        }
      ];
      setDiscussions(mockDiscussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Mock API call
      const newDiscussion = {
        id: Date.now(),
        user_name: user.full_name,
        user_role: user.role,
        message: newMessage,
        created_at: new Date().toISOString(),
        is_chair: user.role === 'Chair'
      };

      setDiscussions([...discussions, newDiscussion]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById('discussion-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setSending(false);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">PC Discussion</h2>
          <p className="text-sm text-gray-600 mt-1">Thảo luận nội bộ giữa các reviewers</p>
        </div>
        <button
          onClick={() => onNavigate('chair')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Papers List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Bài báo đang phản biện</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {papers.map(paper => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaper(paper)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                  selectedPaper?.id === paper.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {paper.title}
                </h4>
                <p className="text-xs text-gray-500">ID: {paper.id}</p>
                <div className="flex items-center mt-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {Math.floor(Math.random() * 10)} messages
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Discussion Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col" style={{ height: '700px' }}>
          {selectedPaper ? (
            <>
              {/* Paper Info Header */}
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900 mb-2">{selectedPaper.title}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Tác giả: {selectedPaper.submitter_name}</span>
                  <span className="mx-2">•</span>
                  <span>Track: {selectedPaper.track_name || 'N/A'}</span>
                </div>
              </div>

              {/* Messages */}
              <div id="discussion-container" className="flex-1 overflow-y-auto p-4 space-y-4">
                {discussions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600">Chưa có thảo luận nào</p>
                  </div>
                ) : (
                  discussions.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_chair ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md ${msg.is_chair ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-semibold">{msg.user_name}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                            msg.is_chair ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {msg.user_role}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.is_chair ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {sending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn một bài báo để xem thảo luận
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairDiscussionsPage;