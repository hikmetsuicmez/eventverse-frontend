import api from './api';

const UserService = {
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by id error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/v1/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/v1/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  updateProfilePicture: async (formData) => {
    try {
      const response = await api.post('/api/v1/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Profil fotoğrafı yükleme yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile picture error:', error);
      throw error;
    }
  }
};

export default UserService; 