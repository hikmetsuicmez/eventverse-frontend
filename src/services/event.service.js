import api from './api';

const EventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/v1/events');
      return response.data;
    } catch (error) {
      console.error('Get all events error:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/api/v1/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get event error:', error);
      throw error;
    }
  },

  getMyEvents: async () => {
    try {
      const response = await api.get('/api/v1/events/my-events');
      return response.data;
    } catch (error) {
      console.error('Get my events error:', error);
      throw error;
    }
  },

  getMyCreatedEvents: async () => {
    try {
      const response = await api.get('/api/v1/events/my-created-events');
      return response.data;
    } catch (error) {
      console.error('Get my created events error:', error);
      throw error;
    }
  },

  getUserEvents: async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}/events`);
      return {
        data: {
          data: response.data.data || []
        }
      };
    } catch (error) {
      console.error('Get user events error:', error);
      throw error;
    }
  },

  getUserCreatedEvents: async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}/created-events`);
      return {
        data: {
          data: response.data.data || []
        }
      };
    } catch (error) {
      console.error('Get user created events error:', error);
      throw error;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/v1/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },

  joinEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/v1/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      console.error('Join event error:', error);
      throw error;
    }
  },

  updateParticipantStatus: async (eventId, participantId, status) => {
    try {
      const response = await api.patch(`/api/v1/events/${eventId}/participants/${participantId}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Update participant status error:', error);
      throw error;
    }
  }
};

export default EventService; 