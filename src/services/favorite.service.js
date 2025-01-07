import api from './api';

const FavoriteService = {
    getFavorites: async () => {
        try {
            const response = await api.get('/api/v1/favorites');
            return response;
        } catch (error) {
            console.error('Get favorites error:', error);
            throw error;
        }
    },

    addFavorite: async (eventId) => {
        try {
            const response = await api.post('/api/v1/favorites', {
                eventId: eventId
            });
            return response.data;
        } catch (error) {
            console.error('Add favorite error:', error);
            throw error;
        }
    },

    deleteFavorite: async (favoriteId) => {
        try {
            const response = await api.delete(`/api/v1/favorites/${favoriteId}`);
            return response.data;
        } catch (error) {
            console.error('Remove favorite error:', error);
            throw error;
        }
    },

    getFavoriteStatus: async (eventId) => {
        try {
            const response = await api.get(`/api/v1/favorites/status/${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Check favorite error:', error);
            throw error;
        }
    }
};

export default FavoriteService; 