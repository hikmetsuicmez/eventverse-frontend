import api from './api';

const NotificationService = {
  // Tüm bildirimleri getir
  getNotifications: async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data;
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }
};

export default NotificationService; 