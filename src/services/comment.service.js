import api from './api';

const CommentService = {
    getCommentsByEventId: async (eventId) => {
        try {
            const response = await api.get(`/api/v1/events/${eventId}/comments`);
            return response;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    createComment: async (eventId, request) => {
        try {
            const response = await api.post(`/api/v1/events/${eventId}/comments`, request);
            return response;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }
};

export default CommentService; 