import api from './api';

const SearchService = {
    search: async (query) => {
        try {
            const response = await api.get(`/api/v1/search?query=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }
};

export default SearchService; 