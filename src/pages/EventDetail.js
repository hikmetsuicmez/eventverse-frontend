import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Button,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondary,
    TextField,
    Card,
    CardContent
} from '@mui/material';
import {
    LocationOn,
    CalendarToday,
    AccessTime,
    Group,
    AttachMoney,
    Share,
    Favorite,
    FavoriteBorder,
    Warning,
    Check,
    Close,
    Forum,
    Send,
    Reply,
    ChatBubbleOutline,
    CalendarMonth,
    Edit,
    Category,
    Person
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EventService from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FavoriteService from '../services/favorite.service';
import CommentSection from '../components/CommentSection';
import NotificationService from '../services/notification.service';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';

// Leaflet varsayılan ikonunu düzeltmek için
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventMap = ({ event }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!event?.latitude || !event?.longitude) {
            return;
        }

        const position = [parseFloat(event.latitude), parseFloat(event.longitude)];

        if (!mapRef.current) {
            mapRef.current = L.map('event-map').setView(position, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            const defaultIcon = L.icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
                shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            L.marker(position, { icon: defaultIcon })
                .bindPopup(`
          <strong>${event.title}</strong><br/>
          ${event.location}
        `)
                .addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [event]);

    if (!event?.latitude || !event?.longitude) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Konum bilgisi bulunamadı
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <div id="event-map" style={{ height: '100%', width: '100%' }} />
        </Box>
    );
};

const getDefaultImage = (category) => {
    switch (category?.toLowerCase()) {
        case 'eğitim':
            return '/images/categories/education.jpg';
        case 'spor':
            return '/images/categories/sports.jpg';
        case 'müzik':
            return '/images/categories/music.jpg';
        case 'sanat':
            return '/images/categories/art.jpg';
        case 'teknoloji':
            return '/images/categories/technology.jpg';
        case 'iş':
            return '/images/categories/business.jpg';
        case 'sağlık':
            return '/images/categories/health.jpg';
        default:
            return '/images/categories/default.jpg';
    }
};

const EventDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [participationStatus, setParticipationStatus] = useState(null);
    const [participantActionLoading, setParticipantActionLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const navigate = useNavigate();

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const response = await EventService.getEventById(id);
            console.log('Event details response:', response.data);
            setEvent(response.data);

            console.log('Participants:', response.data.participants);
            console.log('Current user:', user);

            // Kullanıcının katılım durumunu kontrol et
            const userParticipation = response.data.participants?.find(
                participant => participant.user?.id === user?.id
            );

            console.log('User participation:', userParticipation);
            setParticipationStatus(userParticipation?.status || null);
            console.log('Participation status:', userParticipation?.status);
        } catch (error) {
            console.error('Etkinlik detayları alınamadı:', error);
            setError('Etkinlik detayları yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [id, user?.id]);

    // Favori durumunu kontrol et
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!user || !id) return;
            
            try {
                const response = await FavoriteService.getFavoriteStatus(id);
                if (response && response.data) {
                    setIsLiked(true);
                    setFavoriteId(response.data.id);
                } else {
                    setIsLiked(false);
                    setFavoriteId(null);
                }
            } catch (error) {
                console.error('Favori durumu kontrol edilirken hata:', error);
                setIsLiked(false);
                setFavoriteId(null);
            }
        };

        checkFavoriteStatus();
    }, [id, user]);

    const handleFavoriteClick = async () => {
        if (!user) {
            setError('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }

        try {
            setFavoriteLoading(true);
            setError('');

            if (isLiked && favoriteId) {
                await FavoriteService.deleteFavorite(favoriteId);
                setIsLiked(false);
                setFavoriteId(null);
                setSuccessMessage('Etkinlik favorilerden kaldırıldı');
            } else {
                const response = await FavoriteService.addFavorite(id);
                if (response && response.data) {
                    setFavoriteId(response.data.id);
                    setIsLiked(true);
                    setSuccessMessage('Etkinlik favorilere eklendi');
                }
            }
        } catch (error) {
            console.error('Favori işlemi sırasında hata:', error);
            setError('Favori işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const getParticipantStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Onay Bekliyor';
            case 'APPROVED':
                return 'Onaylandı';
            case 'REJECTED':
                return 'Reddedildi';
            case 'PAYMENT_PENDING':
                return 'Ödeme Bekleniyor';
            case 'PAYMENT_FAILED':
                return 'Ödeme Başarısız';
            case 'CANCELLED':
                return 'İptal Edildi';
            case 'COMPLETED':
                return 'Katılım Tamamlandı';
            default:
                return '';
        }
    };

    const getParticipantStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return '#ffb74d';
            case 'APPROVED':
                return '#81c784';
            case 'REJECTED':
                return '#e57373';
            case 'PAYMENT_PENDING':
                return '#64b5f6';
            case 'PAYMENT_FAILED':
                return '#e57373';
            case 'CANCELLED':
                return '#9e9e9e';
            case 'COMPLETED':
                return '#81c784';
            default:
                return '#ffffff';
        }
    };

    const getParticipationButton = () => {
        if (!user) {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/login')}
                    startIcon={<Group />}
                >
                    Giriş Yap
                </Button>
            );
        }

        if (event.organizer.id === user.id) {
            return null;
        }

        if (participationStatus) {
            if (participationStatus === 'PAYMENT_PENDING') {
                return (
                    <Chip
                        label={getParticipantStatusText(participationStatus)}
                        onClick={() => setShowPaymentModal(true)}
                        sx={{
                            bgcolor: `${getParticipantStatusColor(participationStatus)}20`,
                            color: getParticipantStatusColor(participationStatus),
                            borderRadius: '16px',
                            px: 2,
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: `${getParticipantStatusColor(participationStatus)}30`,
                            }
                        }}
                    />
                );
            }
            
            return (
                <Chip
                    label={getParticipantStatusText(participationStatus)}
                    sx={{
                        bgcolor: `${getParticipantStatusColor(participationStatus)}20`,
                        color: getParticipantStatusColor(participationStatus),
                        borderRadius: '16px',
                        px: 2
                    }}
                />
            );
        }

        return (
            <Button
                variant="contained"
                color="primary"
                onClick={handleJoinEvent}
                disabled={joinLoading}
                startIcon={<Group />}
            >
                {joinLoading ? 'İşleniyor...' : 'Katıl'}
            </Button>
        );
    };

    const handleJoinEvent = async () => {
        try {
            setJoinLoading(true);
            setError('');
            setSuccessMessage('');

            const response = await EventService.joinEvent(id);
            if (response.data) {
                if (event.isPaid) {
                    setParticipationStatus('PAYMENT_PENDING');
                    setShowPaymentModal(true);
                    toast.info('Ödeme yapmanız gerekmektedir');
                } else {
                    setParticipationStatus('PENDING');
                    toast.success('Katılım talebiniz alındı');
                }
            }
            await fetchEventDetails();
        } catch (error) {
            console.error('Etkinliğe katılırken hata:', error);
            if (error.message) {
                setError(error.message);
                toast.error(error.message);
            } else {
                setError('Etkinliğe katılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                toast.error('Etkinliğe katılırken bir hata oluştu');
            }
        } finally {
            setJoinLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
        } catch {
            return dateString;
        }
    };

    const handleParticipantAction = async (participantId, status) => {
        try {
            setParticipantActionLoading(true);
            await EventService.updateParticipantStatus(id, participantId, status);
            await fetchEventDetails();
            setSuccessMessage(status === 'APPROVED' ? 'Katılımcı onaylandı!' : 'Katılımcı reddedildi!');
        } catch (error) {
            console.error('Katılımcı durumu güncellenirken hata:', error);
            setError('Katılımcı durumu güncellenirken bir hata oluştu');
        } finally {
            setParticipantActionLoading(false);
        }
    };

    const getImageUrl = (event) => {
        if (event?.imageUrl) {
            return event.imageUrl;
        }
        return getDefaultImage(event?.category);
    };

    const handleOrganizerClick = (organizerId) => {
        if (user?.id === organizerId) {
            navigate('/profile');
        } else {
            navigate(`/users/${organizerId}`);
        }
    };

    const handlePayment = async (paymentData) => {
        try {
            const response = await EventService.processPayment(id, paymentData);
            if (response.data) {
                setParticipationStatus('COMPLETED');
                toast.success('Ödeme başarıyla tamamlandı');
                setShowPaymentModal(false);
                await NotificationService.getNotifications();
                await fetchEventDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ödeme işlemi sırasında bir hata oluştu');
        }
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    pt: '64px',
                    bgcolor: '#001E3C'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!event) {
        return (
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    pt: '84px',
                    pb: 4,
                    bgcolor: '#001E3C'
                }}
            >
                <Container maxWidth="lg">
                    <Alert severity="error">Etkinlik bulunamadı</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ pt: '84px', pb: 8, bgcolor: '#0A1929', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ 
                    p: 4, 
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ 
                            color: '#fff',
                            fontWeight: 600,
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            {event?.title}
                        </Typography>
                        {user?.id === event.organizer?.id && (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => navigate(`/events/${id}/edit`)}
                                sx={{ 
                                    bgcolor: 'ffffff',
                                    '&:hover': { 
                                        bgcolor: 'rgb(226, 226, 230)'
                                    }
                                }}
                            >
                                Düzenle
                            </Button>
                        )}
                    </Box>

                    {/* Ana içerik kısmı */}
                    <Box sx={{ 
                        width: '100%', 
                        height: 400, 
                        position: 'relative', 
                        mb: 4,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <Box
                            component="img"
                            src={getImageUrl(event)}
                            alt={event?.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                            {successMessage}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Sol Taraf - Etkinlik Detayları */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={3} sx={{
                                p: 3,
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <Box sx={{ position: 'relative', mb: 3 }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        display: 'flex',
                                        gap: 1
                                    }}>
                                        <IconButton
                                            onClick={handleFavoriteClick}
                                            disabled={favoriteLoading}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                                            }}
                                        >
                                            {favoriteLoading ? (
                                                <CircularProgress size={20} sx={{ color: '#e91e63' }} />
                                            ) : isLiked ? (
                                                <Favorite sx={{ color: '#e91e63' }} />
                                            ) : (
                                                <FavoriteBorder sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            onClick={handleShare}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                                            }}
                                        >
                                            <Share sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Category sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {event.category}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AttachMoney sx={{ mr: 1, color: event.isPaid ? 'error.main' : 'success.main' }} />
                                        <Typography variant="body2" color={event.isPaid ? 'error.main' : 'success.main'}>
                                            {event.price === 0 ? 'Ücretsiz' : `${event.price} ₺`}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<LocationOn sx={{ color: 'inherit' }} />}
                                        label={event.location}
                                        sx={{
                                            bgcolor: 'rgba(76, 175, 80, 0.2)',
                                            color: '#a5d6a7',
                                            '& .MuiChip-icon': { color: 'inherit' }
                                        }}
                                    />
                                    {event.hasAgeLimit && (
                                        <Chip
                                            icon={<Person sx={{ color: 'inherit' }} />}
                                            label={`${event.ageLimit}+ Yaş`}
                                            sx={{
                                                bgcolor: 'rgba(255, 152, 0, 0.2)',
                                                color: '#ffcc80',
                                                '& .MuiChip-icon': { color: 'inherit' }
                                            }}
                                        />
                                    )}
                                </Box>

                                <Typography variant="h6" sx={{ color: '#90caf9', mb: 2, fontWeight: 500 }}>
                                    Etkinlik Açıklaması
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, lineHeight: 1.7 }}>
                                    {event.description}
                                </Typography>

                                <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {getParticipationButton()}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Typography variant="body2" sx={{ 
                                            color: event.participants?.length >= event.maxParticipants ? 'error.main' : 'text.secondary',
                                            fontWeight: 'medium'
                                        }}>
                                            {event.participants?.length || 0}/{event.maxParticipants} kişilik kontenjan
                                        </Typography>
                                        {event.participants?.length >= event.maxParticipants && (
                                            <Typography variant="body2" color="error" sx={{ fontWeight: 'medium' }}>
                                                Kontenjan Dolu
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <CommentSection 
                                        eventId={event.id} 
                                        currentUser={user} 
                                        sx={{
                                            '& .MuiTypography-root': {
                                                color: '#ffffff !important'
                                            },
                                            '& .MuiTypography-h6': {
                                                color: '#90caf9 !important',
                                                fontWeight: 500,
                                                mb: 2
                                            },
                                            '& .comment-author': {
                                                color: '#90caf9 !important',
                                                fontWeight: 500
                                            },
                                            '& .comment-text': {
                                                color: '#ffffff !important',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.5,
                                                fontWeight: 400
                                            },
                                            '& .comment-date': {
                                                color: 'rgba(255, 255, 255, 0.6) !important',
                                                fontSize: '0.8rem'
                                            },
                                            '& .MuiInputBase-root': {
                                                color: '#ffffff',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                '&::before': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)'
                                                },
                                                '&:hover:not(.Mui-disabled)::before': {
                                                    borderColor: 'rgba(255, 255, 255, 0.4)'
                                                },
                                                '&.Mui-focused::before': {
                                                    borderColor: '#90caf9'
                                                }
                                            },
                                            '& .MuiCard-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                marginBottom: 2
                                            },
                                            '& .MuiCardContent-root': {
                                                padding: '12px 16px'
                                            },
                                            '& .reply-button': {
                                                color: '#90caf9',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(144, 202, 249, 0.1)'
                                                }
                                            },
                                            '& .MuiAvatar-root': {
                                                border: '2px solid rgba(144, 202, 249, 0.3)'
                                            }
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Sağ Taraf - Organizatör Bilgileri ve Harita */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{
                                p: 3,
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                mb: 3
                            }}>
                                <Typography variant="h6" sx={{ color: '#90caf9', mb: 2, fontWeight: 500 }}>
                                    Organizatör
                                </Typography>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.8
                                        }
                                    }}
                                    onClick={() => handleOrganizerClick(event?.organizer?.id)}
                                >
                                    <Avatar
                                        src={event?.organizer?.profilePicture}
                                        alt={`${event?.organizer?.firstName} ${event?.organizer?.lastName}`}
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            mr: 2,
                                            border: '2px solid #90caf9',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                transition: 'transform 0.2s'
                                            }
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: 500
                                        }}
                                    >
                                        {event?.organizer?.firstName} {event?.organizer?.lastName}
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* Konum kartı */}
                            <Paper elevation={3} sx={{
                                p: 3,
                                borderRadius: '12px',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                mb: 3
                            }}>
                                <Typography variant="h6" sx={{ color: '#90caf9', mb: 2, fontWeight: 500 }}>
                                    Konum
                                </Typography>
                                <EventMap event={event} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 2,
                                        mb: 2
                                    }}
                                >
                                    <LocationOn sx={{ fontSize: 18, mr: 1, color: '#90caf9' }} />
                                    {event.location}
                                </Typography>
                                {event?.latitude && event?.longitude && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<LocationOn />}
                                        fullWidth
                                        onClick={() => {
                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
                                            window.open(url, '_blank');
                                        }}
                                        sx={{
                                            borderColor: '#90caf9',
                                            color: '#90caf9',
                                            '&:hover': {
                                                borderColor: '#64b5f6',
                                                bgcolor: 'rgba(144, 202, 249, 0.1)'
                                            }
                                        }}
                                    >
                                        Yol Tarifi Al
                                    </Button>
                                )}
                            </Paper>

                            {/* Katılımcılar kartı */}
                            {user?.id === event.organizer?.id && (
                                <Paper elevation={3} sx={{
                                    p: 3,
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <Typography variant="h6" sx={{ color: '#90caf9', mb: 2, fontWeight: 500 }}>
                                        Katılımcılar
                                    </Typography>
                                    {event.participants?.length > 0 ? (
                                        <List>
                                            {event.participants.map((participant) => (
                                                <ListItem
                                                    key={participant.id}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        py: 1
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                        <Avatar
                                                            src={participant.user.profilePicture}
                                                            alt={`${participant.user.firstName} ${participant.user.lastName}`}
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                border: '2px solid',
                                                                borderColor: getParticipantStatusColor(participant.status)
                                                            }}
                                                        />
                                                        <ListItemText
                                                            primary={
                                                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                                    {`${participant.user.firstName} ${participant.user.lastName}`}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Chip
                                                                    label={getParticipantStatusText(participant.status)}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: `${getParticipantStatusColor(participant.status)}20`,
                                                                        color: getParticipantStatusColor(participant.status),
                                                                        borderRadius: '16px',
                                                                        px: 1,
                                                                        mt: 0.5
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    </Box>
                                                    {event.organizer.id === user?.id && participant.status === 'PENDING' && (
                                                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                                            <IconButton
                                                                onClick={() => handleParticipantAction(participant.id, 'APPROVED')}
                                                                disabled={participantActionLoading}
                                                                sx={{ color: '#81c784' }}
                                                            >
                                                                <Check />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => handleParticipantAction(participant.id, 'REJECTED')}
                                                                disabled={participantActionLoading}
                                                                sx={{ color: '#e57373' }}
                                                            >
                                                                <Close />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                                            Henüz katılımcı yok
                                        </Typography>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Ödeme Modal'ı */}
            <PaymentModal
                show={showPaymentModal}
                onClose={handleClosePaymentModal}
                onSubmit={handlePayment}
                amount={event?.price}
            />
        </Box>
    );
};

export default EventDetail; 