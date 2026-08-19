import api from './api';

export const registerItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data;
};

export const getAllItems = async (filters = {}) => {
  const response = await api.get('/items', { params: filters });
  return response.data;
};

export const getMyItems = async (filters = {}) => {
  const response = await api.get('/items/my-items', { params: filters });
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const updateItem = async (id, itemData) => {
  const response = await api.patch(`/items/${id}`, itemData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};
