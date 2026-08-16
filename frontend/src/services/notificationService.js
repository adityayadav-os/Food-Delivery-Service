import api from './api';

export const getNotifications = async (recipientType, recipientId) => {
  const res = await api.get(`/notification-service/api/notifications/${recipientType}/${recipientId}`);
  return res.data;
};
export const markAsRead = async (id) => {
  const res = await api.put(`/notification-service/api/notifications/${id}/mark-read`);
  return res.data;
};

export const updateEta = async (customerId, eta) => {
  const res = await api.post(`/notification-service/api/notifications/update-eta`, { customerId, eta });
  return res.data;
};
