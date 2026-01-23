// src/pages/author/SubmitPaperPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SubmitPaperPage = ({ paperId, isEdit, onNavigate }) => {
  const { user } = useAuth();
  const [conferences, setConferences] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [formData, setFormData] = useState({
    conference_id: '',
    track_id: '',
    title: '',
    abstract: '',
    keywords: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConferences();
    if (isEdit && paperId) {
      loadPaperData();
    }
  }, []);

  useEffect(() => {
    if (formData.conference_id) {
      loadTracks(formData.conference_id);
    } else {
      setTracks([]);
    }
  }, [formData.conference_id]);

  const loadConferences = async () => {
    try {
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success') {
        setConferences(response.data.conferences || []);
      }
    } catch (err) {
      console.error('Error loading conferences:', err);
      setError('Không thể tải danh sách hội nghị');
    }
  };

  const loadTracks = async (conferenceId) => {
    try {
      const response = await api.getConferenceTracks(conferenceId);
      if (response.status === 'success') {
        setTracks(response.data || []);
      }
    } catch (err) {
      console.error('Error loading tracks:', err);
      setTracks([]);
    }
  };

  const loadPaperData = async () => {
    try {
      setLoadingData(true);
      const response = await api.getPaper(paperId);
      if (response.status === 'success') {
        const paper = response.data;
        setFormData({
          conference_id: paper.conference_id || '',
          track_id: paper.track_id || '',
          title: paper.title || '',
          abstract: paper.abstract || '',
          keywords: paper.keywords || ''
        });
      }
    } catch (err) {
      setError('Không thể tải thông tin bài báo');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Chỉ chấp nhận file PDF');
        e.target.value = '';
        return;
      }
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.conference_id) {
      setError('Vui lòng chọn hội nghị');
      return false;
    }
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }
    if (formData.title.length < 10) {
      setError('Tiêu đề phải có ít nhất 10 ký tự');
      return false;
    }
    if (!formData.abstract.trim()) {
      setError('Vui lòng nhập tóm tắt');
      return false;
    }
    if (formData.abstract.length < 100) {
      setError('Tóm tắt phải có ít nhất 100 ký tự');
      return false;
    }
    if (!isEdit && !file) {
      setError('Vui lòng chọn file PDF');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // Update existing paper
        const response = await api.updatePaper(paperId, formData);
        if (response.status === 'success') {
          alert('Cập nhật bài báo thành công!');
          onNavigate('author');
        }
      } else {
        // Submit new paper
        const submitData = new FormData();
        submitData.append('conference_id', formData.conference_id);
        submitData.append('track_id', formData.track_id);
        submitData.append('title', formData.title);
        submitData.append('abstract', formData.abstract);
        submitData.append('keywords', formData.keywords);
        submitData.append('file', file);
        
        // Add authors info
        const authors = [{
          user_id: user.id,
          order: 1,
          is_corresponding: true,
          affiliation: 'UTH'
        }];
        submitData.append('authors', JSON.stringify(authors));

        const response = await api.submitPaper(submitData);
        
        if (response.status === 'success') {
          alert('Nộp bài thành công!');
          onNavigate('author');
        }
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('author')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <span className="text-sm text-gray-500">
          Các trường có dấu <span className="text-red-500">*</span> là bắt buộc
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEdit ? 'Chỉnh sửa bài báo' : 'Nộp bài mới'}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Conference Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hội nghị <span className="text-red-500">*</span>
            </label>
            <select
              name="conference_id"
              value={formData.conference_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              disabled={loading || isEdit}
            >
              <option value="">-- Chọn hội nghị --</option>
              {conferences.map(conf => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </select>
            {isEdit && (
              <p className="mt-1 text-sm text-gray-500">Không thể thay đổi hội nghị khi chỉnh sửa</p>
            )}
          </div>

          {/* Track Selection */}
          {tracks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track / Chủ đề
              </label>
              <select
                name="track_id"
                value={formData.track_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
              >
                <option value="">-- Chọn track (tùy chọn) --</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.name} ({track.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Nhập tiêu đề bài báo (tối thiểu 10 ký tự)"
              required
              disabled={loading}
              minLength="10"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/500 ký tự
            </p>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt <span className="text-red-500">*</span>
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows="8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Nhập tóm tắt bài báo (tối thiểu 100 ký tự)"
              required
              disabled={loading}
              minLength="100"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.abstract.length}/5000 ký tự
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ khóa
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Machine Learning, Deep Learning, AI (cách nhau bởi dấu phẩy)"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Nhập các từ khóa liên quan, cách nhau bởi dấu phẩy
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File PDF {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-1 flex items-center">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4 text-sm text-gray-600">
                    {file ? (
                      <span className="text-blue-600 font-medium">{file.name}</span>
                    ) : (
                      <>
                        <span className="text-blue-600 font-medium">Chọn file</span> hoặc kéo thả vào đây
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, tối đa 10MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  required={!isEdit}
                />
              </label>
            </div>
            {isEdit && (
              <p className="mt-2 text-sm text-yellow-600">
                ⚠️ Khi chỉnh sửa, bạn không cần upload lại file PDF. Chỉ upload nếu muốn thay đổi file.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Đang cập nhật...' : 'Đang nộp...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? 'Cập nhật bài báo' : 'Nộp bài'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('author')}
              disabled={loading}
              className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPaperPage;
