import api from './api';

export const createPaymentOrder = async (orderId, amount, currency = 'INR', userEmail = 'customer@test.com') => {
  const payload = {
    amount,
    currency,
    orderId,
    userEmail
  };
  const res = await api.post('/payment-service/api/payments/createOrder', payload);
  return res.data;
};

export const verifyPayment = async (verificationData) => {
  const payload = {
    razorpay_order_id: verificationData.razorpayOrderId,
    razorpay_payment_id: verificationData.razorpayPaymentId,
    razorpay_signature: verificationData.razorpaySignature
  };
  const res = await api.post('/payment-service/api/payments/verify', payload);
  return res.data;
};
export const syncPaymentStatus = async (orderId) => {
  const res = await api.get(`/payment-service/api/payments/sync-status/${orderId}`);
  return res.data;
};
