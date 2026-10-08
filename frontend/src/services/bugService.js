import api from './api';

export const bugService = {
  getBugs: async (params = {}) => {
    const response = await api.get('/bugs', { params });
    return response.data;
  },

  getBug: async (id) => {
    const response = await api.get(`/bugs/${id}`);
    return response.data;
  },

  createBug: async (bugData) => {
    const response = await api.post('/bugs', bugData);
    return response.data;
  },

  updateBug: async (id, bugData) => {
    const response = await api.put(`/bugs/${id}`, bugData);
    return response.data;
  },

  deleteBug: async (id) => {
    const response = await api.delete(`/bugs/${id}`);
    return response.data;
  },
};
