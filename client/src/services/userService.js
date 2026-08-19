import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/me', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch('/users/me/password', passwordData);
  return response.data;
};
