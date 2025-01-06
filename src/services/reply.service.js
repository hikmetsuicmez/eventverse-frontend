import api from './api';

const ReplyService = {
    createReply: async (commentId, request) => {
        try {
            const response = await api.post(`/api/v1/comments/${commentId}/reply`, request);
            return response;
        } catch (error) {
            console.error('Error creating reply:', error);
            throw error;
        }
    }
};

export default ReplyService; 