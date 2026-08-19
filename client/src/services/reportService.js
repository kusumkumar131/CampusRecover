import api from './api';

export const reportLost = async (reportData) => {
  const response = await api.post('/reports/lost', reportData);
  return response.data;
};

export const reportFound = async (reportData) => {
  const response = await api.post('/reports/found', reportData);
  return response.data;
};

export const getAllReports = async (filters = {}) => {
  const response = await api.get('/reports', { params: filters });
  return response.data;
};

export const getMyReports = async (tab = 'lost') => {
  const response = await api.get('/reports/my', { params: { tab } });
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const updateReport = async (id, reportData) => {
  const response = await api.patch(`/reports/${id}`, reportData);
  return response.data;
};

export const confirmReturn = async (id) => {
  const response = await api.post(`/reports/${id}/confirm-return`);
  return response.data;
};
