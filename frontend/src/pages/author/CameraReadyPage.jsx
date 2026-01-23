// src/pages/author/CameraReadyPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CameraReadyPage = ({ paperId, onNavigate }) => {
  const [paper, setPaper] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaper();
  }, [paperId]);

  const loadPaper = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.getPaper(paperId);
      
      if (response.status === 'success') {
        const paperData = response.data;
        
        // Check if paper is accepted
        if (paperData.status !== 'accepted') {
          setError('Chỉ có thể upload bản hoàn chỉnh cho bài báo đã được chấp nhận.');
          return;
        }
        
        setPaper(paperData);
      }
    } catch (err) {
      setError('Không thể tải thông tin bài báo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Chỉ chấp nhận file PDF');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Vui lòng chọn file PDF');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn upload bản hoàn chỉnh? Sau khi upload bạn có thể upload lại nếu cần.')) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.uploadCameraReady(paperId, file);
      
      if (response.status === 'success') {
        alert('✅ Upload bản hoàn chỉnh thành công!');
        onNavigate('author');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi upload file');
    } finally {
      setSubmitting(false);
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

  if (error && !paper) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate('author')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('author')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </button>
      </div>

      {/* Success Banner */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-green-900 mb-2">
              🎉 Chúc mừng! Bài báo của bạn đã được chấp nhận
            </h3>
            <p className="text-green-800">
              Vui lòng upload bản hoàn chỉnh (camera-ready) của bài báo để hoàn tất quy trình.
            </p>
          </div>
        </div>
      </div>

      {/* Paper Info */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin bài báo</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Tiêu đề</label>
            <p className="text-gray-900 font-medium">{paper?.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Hội nghị</label>
              <p className="text-gray-900">{paper?.conference_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Track</label>
              <p className="text-gray-900">{paper?.track_name || 'Không có'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Trạng thái</label>
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              ✓ Đã chấp nhận
            </span>
          </div>

          {/* Current camera-ready file if exists */}
          {paper?.camera_ready_path && (
            <div className="border-t pt-4 mt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">Bản hoàn chỉnh hiện tại</label>
              <a
                href={`http://localhost:5000/${paper.camera_ready_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
              >
                <svg className="w-8 h-8 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Camera-Ready.pdf</p>
                  <p className="text-xs text-gray-500">Đã upload</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                ⚠️ Bạn có thể upload file mới để thay thế file hiện tại
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {paper?.camera_ready_path ? 'Upload lại bản hoàn chỉnh' : 'Upload bản hoàn chỉnh'}
        </h2>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Guidelines */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">📋 Yêu cầu về bản hoàn chỉnh:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>File phải ở định dạng PDF</li>
            <li>Kích thước tối đa 10MB</li>
            <li>Đã chỉnh sửa theo nhận xét của reviewers (nếu có)</li>
            <li>Format đúng theo template của hội nghị</li>
            <li>Không chứa thông tin tác giả nếu là double-blind review</li>
            <li>Chất lượng in tốt, không bị mờ hoặc vỡ ảnh</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file PDF <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}>
                  {file ? (
                    <>
                      <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-medium text-green-700 mb-1">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-sm text-blue-600 mt-2">Click để chọn file khác</p>
                    </>
                  ) : (
                    <>
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-gray-600">
                        <span className="text-blue-600 font-medium">Chọn file PDF</span> hoặc kéo thả vào đây
                      </p>
                      <p className="text-xs text-gray-500 mt-2">PDF, tối đa 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={submitting}
                  required={!paper?.camera_ready_path}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="submit"
              disabled={submitting || !file}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang upload...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {paper?.camera_ready_path ? 'Upload lại file' : 'Upload bản hoàn chỉnh'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('author')}
              disabled={submitting}
              className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CameraReadyPage;