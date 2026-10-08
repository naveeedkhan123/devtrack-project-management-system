import api from './api';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getAdminUsers: async (params = {}) => {
    const response = await api.get('/users/admin', { params });
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.put(`/users/${id}/status`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.patch('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  removeProfilePicture: async () => {
    const response = await api.delete('/users/profile-picture');
    return response.data;
  },
};
