import api from './api';

const AuthService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login response:', response);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Token alınamadı');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // Backend'den gelen hata
        throw new Error(error.response.data.message || 'Giriş başarısız');
      } else if (error.request) {
        // Backend'e ulaşılamadı
        throw new Error('Sunucuya ulaşılamıyor');
      } else {
        // Diğer hatalar
        throw new Error('Giriş yapılırken bir hata oluştu');
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber
      });

      console.log('Register response:', response);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Kayıt başarısız');
      } else if (error.request) {
        throw new Error('Sunucuya ulaşılamıyor');
      } else {
        throw new Error('Kayıt olurken bir hata oluştu');
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? JSON.parse(user) : null;
  },

  isLoggedIn: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default AuthService; 