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

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/v1/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/api/v1/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/api/v1/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  joinEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/v1/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      console.error('Join event error:', error);
      throw error;
    }
  },

  leaveEvent: async (eventId) => {
    try {
      const response = await api.post(`/api/v1/events/${eventId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Leave event error:', error);
      throw error;
    }
  }
};

export default EventService; 