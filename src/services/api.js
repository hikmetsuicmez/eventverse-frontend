import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token süresi dolmuşsa veya geçersizse
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      
      // Hata mesajını konsola yazdır
      console.error('API Hatası:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    } else if (error.request) {
      console.error('Sunucudan yanıt alınamadı');
    } else {
      console.error('İstek hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 