// src/pages/admin/AdminConferencesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminConferencesPage = ({ onNavigate }) => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConf, setSelectedConf] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    submission_deadline: '',
    review_deadline: '',
    decision_deadline: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConferences();
  }, []);

  const loadConferences = async () => {
    try {
      setLoading(true);
      const response = await api.listConferences({ page: 1, per_page: 100 });
      if (response.status === 'success') {
        setConferences(response.data.conferences || []);
      }
    } catch (err) {
      setError('Không thể tải danh sách hội nghị: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      submission_deadline: '',
      review_deadline: '',
      decision_deadline: ''
    });
    setShowCreateModal(true);
  };

  const handleEdit = (conf) => {
    setSelectedConf(conf);
    setFormData({
      name: conf.name,
      description: conf.description || '',
      submission_deadline: conf.submission_deadline?.split('T')[0] || '',
      review_deadline: conf.review_deadline?.split('T')[0] || '',
      decision_deadline: conf.decision_deadline?.split('T')[0] || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (conf) => {
    if (!window.confirm(`Bạn có chắc muốn xóa hội nghị "${conf.name}"?`)) {
      return;
    }
    try {
      await api.deleteConference(conf.id);
      alert('Xóa hội nghị thành công!');
      loadConferences();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.createConference(formData);
      if (response.status === 'success') {
        alert('Tạo hội nghị thành công!');
        setShowCreateModal(false);
        loadConferences();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.updateConference(selectedConf.id, formData);
      if (response.status === 'success') {
        alert('Cập nhật thành công!');
        setShowEditModal(false);
        loadConferences();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
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
          <h2 className="text-2xl font-bold text-gray-800">Quản lý hội nghị</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{conferences.length}</span> hội nghị
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tạo hội nghị mới</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Conferences List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hội nghị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn nộp bài</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn phản biện</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số bài nộp</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conferences.map((conf) => (
                <tr key={conf.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{conf.name}</div>
                    {conf.description && (
                      <div className="text-xs text-gray-500 mt-1">{conf.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(conf.submission_deadline).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(conf.review_deadline).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {conf.paper_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(conf)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Sửa
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(conf)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Tạo hội nghị mới</h3>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hội nghị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn nộp bài <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({...formData, submission_deadline: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn phản biện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.review_deadline}
                    onChange={(e) => setFormData({...formData, review_deadline: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn quyết định <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.decision_deadline}
                    onChange={(e) => setFormData({...formData, decision_deadline: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo hội nghị'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure */}
      {showEditModal && selectedConf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Chỉnh sửa hội nghị</h3>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {/* Same fields as create modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên hội nghị</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-8 bg-gray-200 py-3 rounded-lg"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConferencesPage;
