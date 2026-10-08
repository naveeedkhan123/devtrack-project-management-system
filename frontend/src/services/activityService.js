import api from './api';

export const activityService = {
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/activity', { params });
    return response.data;
  },
};
