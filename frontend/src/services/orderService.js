import api from './api';

export const createOrder = async (orderData) => {
  const res = await api.post('/order-service/api/orders/create', orderData);
  return res.data;
};

export const getUserOrders = async (userId) => {
  const res = await api.get(`/order-service/api/orders/user/${userId}`);
  return res.data;
};

export const getRestaurantOrders = async (restaurantId) => {
  const res = await api.get(`/order-service/api/orders/restaurant/${restaurantId}`);
  return res.data;
};

export const updateOrderStatus = async (orderId, status, estimatedPrepTime) => {
  let url = `/order-service/api/orders/${orderId}/status?status=${status}`;
  if (estimatedPrepTime) {
    url += `&estimatedPrepTime=${estimatedPrepTime}`;
  }
  const res = await api.put(url);
  return res.data;
};

export const getOrdersByStatus = async (status) => {
  const res = await api.get(`/order-service/api/orders/status/${status}`);
  return res.data;
};

export const getOrdersByDeliveryPartner = async (partnerId) => {
  const res = await api.get(`/order-service/api/orders/delivery/${partnerId}`);
  return res.data;
};

export const assignDeliveryPartner = async (orderId, partnerId, partnerName, partnerPhone) => {
  const res = await api.put(`/order-service/api/orders/${orderId}/assign-delivery?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}&partnerPhone=${encodeURIComponent(partnerPhone)}`);
  return res.data;
};
export const getOrderById = async (orderId) => {
  const res = await api.get(`/order-service/api/orders/${orderId}`);
  return res.data;
};
