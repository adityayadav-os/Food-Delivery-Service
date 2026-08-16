import api from './api';

export const getRestaurants = async () => {
  const res = await api.get('/restaurant-service/api/restaurants');
  return res.data;
};

export const getRestaurantById = async (id) => {
  const res = await api.get(`/restaurant-service/api/restaurants/${id}`);
  return res.data;
};

export const getRestaurantsByOwner = async (ownerId) => {
  const res = await api.get(`/restaurant-service/api/restaurants/owner/${ownerId}`);
  return res.data;
};

export const getMenuByRestaurant = async (id) => {
  const res = await api.get(`/restaurant-service/api/restaurants/${id}/menu`);
  return res.data;
};

export const getPendingRestaurants = async () => {
  const res = await api.get('/restaurant-service/api/restaurants/pending');
  return res.data;
};

export const approveRestaurant = async (id, subscriptionType = 'MONTHLY', subscriptionFee = 0) => {
  const res = await api.put(`/restaurant-service/api/restaurants/${id}/approve?subscriptionType=${subscriptionType}&subscriptionFee=${subscriptionFee}`);
  return res.data;
};

export const searchRestaurants = async (query) => {
  const res = await api.get(`/restaurant-service/api/restaurants/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const universalSearch = async (query) => {
  const res = await api.get(`/restaurant-service/api/restaurants/search/universal?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const createRestaurant = async (restaurantData) => {
  const res = await api.post('/restaurant-service/api/restaurants', restaurantData);
  return res.data;
};

export const addMenuItem = async (restaurantId, menuData) => {
  const res = await api.post(`/restaurant-service/api/restaurants/${restaurantId}/menu`, menuData);
  return res.data;
};

export const deleteMenuItem = async (itemId) => {
  const res = await api.delete(`/restaurant-service/api/menu/${itemId}`);
  return res.data;
};

export const deleteRestaurant = async (restaurantId) => {
  const res = await api.delete(`/restaurant-service/api/restaurants/${restaurantId}`);
  return res.data;
};

export const updateMenuItem = async (itemId, menuData) => {
  const res = await api.put(`/restaurant-service/api/menu/${itemId}`, menuData);
  return res.data;
};
