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
            const response = await api.get(`/api/v1/events/${userId}/events`);
            return response.data;
        } catch (error) {
            console.error('Get user events error:', error);
            throw error;
        }
    },

    getUserCreatedEvents: async (userId) => {
        try {
            const response = await api.get(`/api/v1/events/${userId}/created-events`);
            return response.data;
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

    filterEvents: async (filters, page, size, sortBy, sortOrder) => {
        try {
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => {
                    if (value === null || value === undefined || value === '') return false;
                    if (Array.isArray(value) && value.length === 0) return false;
                    if (typeof value === 'number' && isNaN(value)) return false;
                    return true;
                })
            );

            if (cleanFilters.isPaid === false) delete cleanFilters.isPaid;
            if (cleanFilters.hasAgeLimit === false) delete cleanFilters.hasAgeLimit;

            if (cleanFilters.minPrice === 0) delete cleanFilters.minPrice;
            if (cleanFilters.maxPrice === 1000) delete cleanFilters.maxPrice;
            if (cleanFilters.minAge === 0) delete cleanFilters.minAge;
            if (cleanFilters.maxAge === 100) delete cleanFilters.maxAge;

            const response = await api.post('/api/v1/events/filter', cleanFilters, {
                params: {
                    page,
                    size,
                    sortBy,
                    sortOrder
                }
            });
            return response.data;
        } catch (error) {
            console.error('Filter events error:', error);
            if (error.response) {
                if (error.response.status === 400) {
                    throw new Error('Geçersiz filtreleme parametreleri');
                } else if (error.response.status === 500) {
                    throw new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz');
                } else {
                    throw new Error(error.response.data.message || 'Filtreleme işlemi sırasında bir hata oluştu');
                }
            } else if (error.request) {
                throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol ediniz');
            } else {
                throw new Error('Beklenmeyen bir hata oluştu');
            }
        }
    },

    joinEvent: async (eventId) => {
        try {
            const response = await api.post(`/api/v1/events/${eventId}/participants`);
            return response.data;
        } catch (error) {
            console.error('Join event error:', error);
            if (error.response) {
                if (error.response.status === 400) {
                    throw new Error('Bu etkinliğe zaten katıldınız');
                } else if (error.response.status === 403) {
                    throw new Error('Etkinlik organizatörü kendi etkinliğine katılamaz');
                } else if (error.response.status === 404) {
                    throw new Error('Etkinlik bulunamadı');
                } else if (error.response.status === 500) {
                    throw new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz');
                } else {
                    throw new Error(error.response.data.message || 'Etkinliğe katılırken bir hata oluştu');
                }
            } else if (error.request) {
                throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol ediniz');
            } else {
                throw new Error('Beklenmeyen bir hata oluştu');
            }
        }
    },

    updateParticipantStatus: async (eventId, participantId, status) => {
        try {
            const response = await api.patch(
                `/api/v1/events/${eventId}/participants/${participantId}/status?status=${status}`
            );
            return response.data;
        } catch (error) {
            console.error('Update participant status error:', error);
            if (error.response) {
                if (error.response.status === 403) {
                    throw new Error('Bu işlem için yetkiniz bulunmuyor');
                } else if (error.response.status === 404) {
                    throw new Error('Katılımcı veya etkinlik bulunamadı');
                } else if (error.response.status === 500) {
                    throw new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz');
                } else {
                    throw new Error(error.response.data.message || 'Katılımcı durumu güncellenirken bir hata oluştu');
                }
            } else if (error.request) {
                throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol ediniz');
            } else {
                throw new Error('Beklenmeyen bir hata oluştu');
            }
        }
    },

    uploadEventImage: async (eventId, formData) => {
        try {
            const response = await api.post(`/api/v1/events/${eventId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Upload event image error:', error);
            if (error.response) {
                if (error.response.status === 400) {
                    throw new Error('Geçersiz resim formatı');
                } else if (error.response.status === 500) {
                    throw new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz');
                } else {
                    throw new Error(error.response.data.message || 'Resim yükleme işlemi sırasında bir hata oluştu');
                }
            } else if (error.request) {
                throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol ediniz');
            } else {
                throw new Error('Beklenmeyen bir hata oluştu');
            }
        }
    }
};

export default EventService; 