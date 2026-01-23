// src/pages/admin/AdminAuditLogsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminAuditLogsPage = ({ onNavigate }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action_type: '',
    user_id: ''
  });

  const per_page = 50;

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        per_page,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.getAuditLogs(params);
      
      if (response.status === 'success') {
        setLogs(response.data.logs || []);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      setError('Không thể tải nhật ký: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleClearFilters = () => {
    setFilters({ action_type: '', user_id: '' });
    setPage(1);
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('created') || actionType.includes('register')) {
      return <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>;
    }
    if (actionType.includes('updated') || actionType.includes('edit')) {
      return <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>;
    }
    if (actionType.includes('deleted') || actionType.includes('remove')) {
      return <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>;
    }
    if (actionType.includes('login')) {
      return <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>;
    }
    return <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>;
  };

  const getActionBadgeColor = (actionType) => {
    if (actionType.includes('created')) return 'bg-green-100 text-green-800';
    if (actionType.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('deleted')) return 'bg-red-100 text-red-800';
    if (actionType.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const parseData = (dataString) => {
    try {
      return JSON.parse(dataString);
    } catch {
      return dataString;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Đang tải nhật ký...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / per_page);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nhật ký hệ thống</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{total}</span> hoạt động
          </p>
        </div>
        <button
          onClick={() => onNavigate('admin')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
        >
          ← Quay lại Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại hành động</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="user_login">User Login</option>
              <option value="user_registered">User Registered</option>
              <option value="paper_submitted">Paper Submitted</option>
              <option value="review_submitted">Review Submitted</option>
              <option value="decision_made">Decision Made</option>
              <option value="assignment_created">Assignment Created</option>
              <option value="admin_user_created">Admin User Created</option>
              <option value="admin_user_updated">Admin User Updated</option>
              <option value="admin_user_deleted">Admin User Deleted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="number"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              placeholder="Nhập User ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600">Không có nhật ký nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => {
              const data = parseData(log.data);
              
              return (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActionIcon(log.action_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action_type)}`}>
                          {formatActionType(log.action_type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User ID:</span>
                          <span className="ml-2 font-medium text-gray-900">{log.user_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Table:</span>
                          <span className="ml-2 font-medium text-gray-900">{log.table_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Record ID:</span>
                          <span className="ml-2 font-medium text-gray-900">{log.record_id || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Data preview */}
                      {data && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                            Xem chi tiết dữ liệu
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <pre className="text-xs text-gray-700 overflow-x-auto">
                              {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
            <span className="mx-2">•</span>
            Tổng <span className="font-medium">{total}</span> bản ghi
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;