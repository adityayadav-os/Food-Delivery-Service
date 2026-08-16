import axios from 'axios';

// API Gateway URL
const API_GATEWAY_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Bypass API Gateway and route directly to microservices based on prefix
    if (config.url.startsWith('/user-service')) {
      config.baseURL = 'http://localhost:8081';
      config.url = config.url.replace('/user-service', '');
    } else if (config.url.startsWith('/restaurant-service')) {
      config.baseURL = 'http://localhost:8082';
      config.url = config.url.replace('/restaurant-service', '');
    } else if (config.url.startsWith('/order-service')) {
      config.baseURL = 'http://localhost:8083';
      config.url = config.url.replace('/order-service', '');
    } else if (config.url.startsWith('/payment-service')) {
      config.baseURL = 'http://localhost:8084';
      config.url = config.url.replace('/payment-service', '');
    } else if (config.url.startsWith('/notification-service')) {
      config.baseURL = 'http://localhost:8085';
      config.url = config.url.replace('/notification-service', '');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
