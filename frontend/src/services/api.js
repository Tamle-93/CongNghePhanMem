// Frontend/src/services/api.js - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/controllers';

class ApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error.response?.data || { message: error.message });
      }
    );
  }

  // Token management
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  setUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ==================== AUTH ====================
  async login(username, password) {
    try {
      const response = await this.axios.post('/auth/login', { username, password });
      
      // Save token and user
      if (response.token) {
        this.setToken(response.token);
      }
      if (response.user || response.data?.user) {
        this.setUser(response.user || response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async register(userData) {
    const response = await this.axios.post('/auth/register', userData);
    if (response.token) {
      this.setToken(response.token);
    }
    if (response.user) {
      this.setUser(response.user);
    }
    return response;
  }

  async getCurrentUser() {
    return this.axios.get('/auth/me');
  }

  async logout() {
    try {
      await this.axios.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async forgotPassword(email) {
    return this.axios.post('/auth/forgot-password', { email });
  }

  // ==================== PAPERS ====================
  async listPapers(params) {
    return this.axios.get('/papers', { params });
  }

  async getPaper(id) {
    return this.axios.get(`/papers/${id}`);
  }

  async submitPaper(formData) {
    return this.axios.post('/papers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async updatePaper(id, data) {
    return this.axios.put(`/papers/${id}`, data);
  }

  async withdrawPaper(id) {
    return this.axios.post(`/papers/${id}/withdraw`);
  }

  async uploadCameraReady(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.axios.post(`/papers/${id}/camera-ready`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // ==================== CONFERENCES ====================
  async listConferences(params) {
    return this.axios.get('/conferences', { params });
  }

  async getConference(id) {
    return this.axios.get(`/conferences/${id}`);
  }

  async createConference(data) {
    return this.axios.post('/conferences', data);
  }

  async updateConference(id, data) {
    return this.axios.put(`/conferences/${id}`, data);
  }

  async deleteConference(id) {
    return this.axios.delete(`/conferences/${id}`);
  }

  async getConferenceTracks(conferenceId) {
    return this.axios.get(`/conferences/${conferenceId}/tracks`);
  }

  // ==================== ASSIGNMENTS ====================
  async getMyAssignments(conferenceId) {
    const params = conferenceId ? { conference_id: conferenceId } : {};
    return this.axios.get('/assignments/my-assignments', { params });
  }

  async getConferenceAssignments(conferenceId, page = 1, per_page = 20) {
    return this.axios.get(`/assignments/conference/${conferenceId}`, {
      params: { page, per_page }
    });
  }

  async createAssignment(data) {
    return this.axios.post('/assignments', data);
  }

  async deleteAssignment(id) {
    return this.axios.delete(`/assignments/${id}`);
  }

  async getReviewProgress(conferenceId) {
    return this.axios.get(`/assignments/conference/${conferenceId}/progress`);
  }

  // ==================== REVIEWS ====================
  async submitReview(data) {
    return this.axios.post('/reviews', data);
  }

  async getMyReviews(conferenceId) {
    const params = conferenceId ? { conference_id: conferenceId } : {};
    return this.axios.get('/reviews/my-reviews', { params });
  }

  async getPaperReviews(paperId) {
    return this.axios.get(`/reviews/paper/${paperId}`);
  }

  // ==================== DECISIONS ====================
  async makeDecision(data) {
    return this.axios.post('/decisions', data);
  }

  async getPaperDecision(paperId) {
    return this.axios.get(`/decisions/paper/${paperId}`);
  }

  async getConferenceDecisions(conferenceId, page = 1, per_page = 20) {
    return this.axios.get(`/decisions/conference/${conferenceId}`, {
      params: { page, per_page }
    });
  }

  async getDecisionStatistics(conferenceId) {
    return this.axios.get(`/decisions/conference/${conferenceId}/statistics`);
  }

  async bulkNotifyAuthors(conferenceId) {
    return this.axios.post(`/decisions/conference/${conferenceId}/notify`);
  }

  // ==================== USERS ====================
  async listReviewers() {
    return this.axios.get('/users/reviewers');
  }

  // ==================== ADMIN ====================
  async getAdminStatistics() {
    return this.axios.get('/admin/statistics');
  }

  async listAllUsers(params) {
    return this.axios.get('/admin/users', { params });
  }

  async createUser(userData) {
    return this.axios.post('/admin/users', userData);
  }

  async updateUser(userId, data) {
    return this.axios.put(`/admin/users/${userId}`, data);
  }

  async deleteUser(userId) {
    return this.axios.delete(`/admin/users/${userId}`);
  }

  async getAuditLogs(params) {
    return this.axios.get('/admin/audit-logs', { params });
  }
}

const api = new ApiService();
export default api;