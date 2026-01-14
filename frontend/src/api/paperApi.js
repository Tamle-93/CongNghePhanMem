import axiosInstance from './axiosConfig';

export const paperApi = {
  list: async (params = {}) => {
    const response = await axiosInstance.get('/papers', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await axiosInstance.get(`/papers/${id}`);
    return response.data;
  },

  create: async (paperData) => {
    const response = await axiosInstance.post('/papers', paperData);
    return response.data;
  },

  update: async (id, paperData) => {
    const response = await axiosInstance.put(`/papers/${id}`, paperData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/papers/${id}`);
    return response.data;
  },

  withdraw: async (id) => {
    const response = await axiosInstance.post(`/papers/${id}/withdraw`);
    return response.data;
  },

  uploadCameraReady: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/papers/${id}/camera-ready`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};