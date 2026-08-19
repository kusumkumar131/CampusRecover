import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const toggleSuspendUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/suspend`);
  return response.data;
};

export const getAdminItems = async () => {
  const response = await api.get('/admin/items');
  return response.data;
};

export const getAdminReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/admin/reports/${id}`);
  return response.data;
};
