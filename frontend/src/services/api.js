import axios from 'axios';

// ✅ FIXED: Use relative path for Docker deployment
// In development (npm run dev), Vite proxy will forward to localhost:5000
// In production (Docker), nginx will forward /api to backend container
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and active role to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const activeRole = localStorage.getItem('activeRole');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add active role header so backend knows which role user is operating as
  if (activeRole) {
    config.headers['X-Active-Role'] = activeRole;
  }
  
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Base axios methods for direct use
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config),
  
  // Auth
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Users
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Conferences
  listConferences: (params) => api.get('/conferences', { params }),
  getConference: (id) => api.get(`/conferences/${id}`),
  
  // Papers
  listPapers: (params) => api.get('/papers', { params }),
  getPaper: (id) => api.get(`/papers/${id}`),
  getPaperById: (id) => api.get(`/papers/${id}`), // Alias for compatibility
  submitPaper: (data) => {
    // For FormData, need to set multipart/form-data
    return api.post('/papers', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  updatePaper: (id, data) => api.put(`/papers/${id}`, data),
  submitRevision: (id, data) => {
    return api.post(`/papers/${id}/revision`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  // Reviews
  listReviews: (params) => api.get('/reviews', { params }),
  getReviewsByPaper: (paperId) => api.get(`/papers/${paperId}/reviews`),
  submitReview: (paperId, data) => api.post(`/papers/${paperId}/review`, data),
  
  // Assignments
  listAssignments: (params) => api.get('/assignments', { params }),
  getAssignedPapers: (reviewerId) => api.get(`/reviewers/${reviewerId}/papers`),
  assignReviewers: (data) => api.post('/assignments', data), // { paper_id, reviewer_ids[] }
  
  // Bidding
  getAvailablePapers: () => api.get('/papers/available-for-bidding'),
  submitBids: (data) => api.post('/bidding', data), // { paper_ids[] }
  
  // Reviewer History
  getReviewHistory: (reviewerId) => api.get(`/reviewers/${reviewerId}/history`),
  
  // Decisions
  makeDecision: (paperId, data) => api.post(`/papers/${paperId}/decision`, data), // { decision, feedback, decision_date }
  
  // Users (for Chair/Admin)
  listUsers: (params) => api.get('/users', { params }),  // Chair+Admin can access /users
  
  // Admin only
  adminListUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  
  // Admin - Conferences
  listConferencesAdmin: (params) => api.get('/admin/conferences', { params }),
  createConference: (data) => api.post('/admin/conferences', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateConference: (id, data) => api.put(`/admin/conferences/${id}`, data),
  activateConference: (id) => api.put(`/admin/conferences/${id}/activate`),
  deactivateConference: (id) => api.put(`/admin/conferences/${id}/deactivate`),
  
  // Admin - Statistics
  getAdminStats: () => api.get('/admin/stats'),
  getUserStats: () => api.get('/admin/stats/users'),
  
  // AI Services
  spellCheck: (text, language = 'vi') => api.post('/ai/spell-check', { text, language }),
  analyzeText: (text) => api.post('/ai/analyze-text', { text }),
  
  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),
  
  // Global Search
  globalSearch: (query) => api.get('/search', { params: { q: query } }),
  
  // File Downloads
  downloadPaper: (id) => api.get(`/papers/${id}/download`, { responseType: 'blob' }),
  downloadPapersZip: (ids) => api.post('/papers/download-batch', { paper_ids: ids }, { responseType: 'blob' }),
  downloadConferencePapers: (conferenceId, status) => api.get(`/conferences/${conferenceId}/download-papers`, { 
    params: { status }, 
    responseType: 'blob' 
  }),
  
  // Messaging (Optional)
  getMessages: (params) => api.get('/messages', { params }),
  sendMessage: (data) => api.post('/messages', data),
  markMessageRead: (id) => api.put(`/messages/${id}/read`),
};
