import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/user-service/api/auth/signin', { identifier: email, password });
  return res.data; // Expecting { token, message }
};

export const register = async (name, email, password, phoneNumber, address, role) => {
  const res = await api.post('/user-service/api/auth/signup', { name, email, password, phoneNumber, address, role });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/user-service/api/auth/forgot-password', { identifier: email });
  return res.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await api.post('/user-service/api/auth/reset-password', { identifier: email, otp, newPassword });
  return res.data;
};
