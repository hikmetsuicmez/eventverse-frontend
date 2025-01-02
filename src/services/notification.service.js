import api from './api';

const NotificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/api/v1/notifications');
      return response;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  getUnreadNotifications: async () => {
    try {
      const response = await api.get('/api/v1/notifications/unread');
      return response;
    } catch (error) {
      console.error('Get unread notifications error:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/api/v1/notifications/${notificationId}/read`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
};

export default NotificationService; 