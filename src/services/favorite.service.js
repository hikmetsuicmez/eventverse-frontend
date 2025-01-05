import api from './api';

const FavoriteService = {
    addFavorite: async (eventId) => {
        try {
            const response = await api.post('/api/v1/favorites', { eventId });
            return response.data.data;
        } catch (error) {
            console.error('Favori ekleme hatası:', error);
            throw error;
        }
    },

    deleteFavorite: async (favoriteId) => {
        try {
            const response = await api.delete(`/api/v1/favorites/${favoriteId}`);
            return response.data.data;
        } catch (error) {
            console.error('Favori silme hatası:', error);
            throw error;
        }
    },

    getFavorites: async () => {
        try {
            const response = await api.get('/api/v1/favorites');
            return response.data.data;
        } catch (error) {
            console.error('Favorileri getirme hatası:', error);
            throw error;
        }
    },

    getFavoriteStatus: async (eventId) => {
        try {
            const response = await api.get(`/api/v1/favorites/status/${eventId}`);
            return response.data.data;
        } catch (error) {
            console.error('Favori durumu kontrol hatası:', error);
            return null;
        }
    }
};

export default FavoriteService; 