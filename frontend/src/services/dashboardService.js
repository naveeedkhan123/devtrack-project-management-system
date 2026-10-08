import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getSystemOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
};
