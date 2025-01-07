import api from './api';

const LocationService = {
    getAllCities: async () => {
        try {
            const response = await api.get('/api/geolocation/cities');
            return response.data;
        } catch (error) {
            console.error('Şehirler alınırken hata:', error);
            return [];
        }
    },

    getDistrictsByCity: async (cityId) => {
        try {
            const response = await api.get(`/api/geolocation/cities/${cityId}/districts`);
            return response.data;
        } catch (error) {
            console.error('İlçeler alınırken hata:', error);
            return [];
        }
    },

    getNeighborhoodsByDistrict: async (districtId) => {
        try {
            const response = await api.get(`/api/geolocation/districts/${districtId}/neighborhoods`);
            return response.data;
        } catch (error) {
            console.error('Mahalleler alınırken hata:', error);
            return [];
        }
    }
};

export default LocationService; 