import api from './api';

export const scanQRCode = async (itemId, location = '') => {
  const response = await api.get(`/qr/${itemId}`, { params: { location } });
  return response.data;
};

export const scanQRCodePost = async (itemId, location = '') => {
  const response = await api.post('/qr/scan', { itemId, location });
  return response.data;
};

export const getQRScanHistory = async (itemId) => {
  const response = await api.get(`/qr/${itemId}/history`);
  return response.data;
};
