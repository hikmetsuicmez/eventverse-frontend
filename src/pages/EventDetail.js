import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
    CalendarMonth
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EventService from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FavoriteService from '../services/favorite.service';
import CommentSection from '../components/CommentSection';

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

    const handleJoinEvent = async () => {
        try {
            setJoinLoading(true);
            setError('');
            setSuccessMessage('');

            const response = await EventService.joinEvent(id);
            setParticipationStatus('PENDING');
            setSuccessMessage('Etkinliğe katılım talebiniz alındı. Organizatör onayı bekleniyor.');
            await fetchEventDetails(); // Etkinlik detaylarını güncelle
        } catch (error) {
            console.error('Etkinliğe katılırken hata:', error);
            if (error.message) {
                setError(error.message);
            } else {
                setError('Etkinliğe katılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
                    {/* Etkinlik Görseli */}
                    <Box sx={{ width: '100%', height: 400, position: 'relative', mb: 4 }}>
                        <Box
                            component="img"
                            src={getImageUrl(event)}
                            alt={event?.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '16px'
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
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                <Box sx={{ position: 'relative', mb: 3 }}>
                                    <Box
                                        component="img"
                                        src={event.eventImage || '/event-placeholder.jpg'}
                                        alt={event.title}
                                        sx={{
                                            width: '100%',
                                            height: '300px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            mb: 3
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            display: 'flex',
                                            gap: 1
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleFavoriteClick}
                                            disabled={favoriteLoading}
                                            sx={{
                                                bgcolor: 'white',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                                '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.7)' }
                                            }}
                                        >
                                            {favoriteLoading ? (
                                                <CircularProgress size={20} sx={{ color: '#e91e63' }} />
                                            ) : isLiked ? (
                                                <Favorite sx={{ color: '#e91e63' }} />
                                            ) : (
                                                <FavoriteBorder sx={{ color: '#666' }} />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            sx={{
                                                bgcolor: 'white',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                            }}
                                            onClick={handleShare}
                                        >
                                            <Share sx={{ color: '#666' }} />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography variant="h4" sx={{ color: '#1a237e', mb: 2, fontWeight: 600 }}>
                                    {event.title}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<CalendarMonth sx={{ fontSize: 18 }} />}
                                        label={`${formatDate(event.date)} ${event.eventTime || ''}`}
                                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
                                    />
                                    <Chip
                                        icon={<LocationOn sx={{ fontSize: 18 }} />}
                                        label={event.location}
                                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
                                    />
                                    <Chip
                                        icon={<Group sx={{ fontSize: 18 }} />}
                                        label={`${event.maxParticipants} Katılımcı`}
                                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
                                    />
                                    {event.hasAgeLimit && event.ageLimit > 0 && (
                                        <Chip
                                            icon={<Warning sx={{ fontSize: 18 }} />}
                                            label={`+${event.ageLimit} Yaş`}
                                            sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' }}
                                        />
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CalendarMonth sx={{ color: '#1a237e', mr: 1 }} />
                                    <Typography variant="body1">
                                        {event?.date ? format(new Date(event.date), 'dd MMMM yyyy', { locale: tr }) : 'Tarih belirtilmemiş'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccessTime sx={{ color: '#1a237e', mr: 1 }} />
                                    <Typography variant="body1">
                                        {event?.eventTime || 'Saat belirtilmemiş'}
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{ color: '#1a237e', mb: 2, fontWeight: 600 }}>
                                    Etkinlik Açıklaması
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.7 }}>
                                    {event.description}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {participationStatus === 'APPROVED' ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            disabled
                                            sx={{
                                                bgcolor: '#4CAF50',
                                                '&.Mui-disabled': {
                                                    bgcolor: '#4CAF50',
                                                    color: 'white'
                                                },
                                                borderRadius: '8px',
                                                px: 4
                                            }}
                                        >
                                            Katıldınız
                                        </Button>
                                    ) : participationStatus === 'PENDING' ? (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            disabled
                                            sx={{
                                                bgcolor: '#FFA726',
                                                '&.Mui-disabled': {
                                                    bgcolor: '#FFA726',
                                                    color: 'white'
                                                },
                                                borderRadius: '8px',
                                                px: 4
                                            }}
                                        >
                                            Organizatör Onayı Bekleniyor
                                        </Button>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={handleJoinEvent}
                                                disabled={joinLoading}
                                                sx={{
                                                    bgcolor: '#1a237e',
                                                    '&:hover': { bgcolor: '#0d47a1' },
                                                    borderRadius: '8px',
                                                    px: 4
                                                }}
                                            >
                                                {joinLoading ? (
                                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                                ) : (
                                                    'Katıl'
                                                )}
                                            </Button>
                                            {event.paid && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        bgcolor: 'rgba(58, 136, 214, 0.08)',
                                                        color: '#3083D5',
                                                        py: 1.5,
                                                        px: 3,
                                                        borderRadius: '12px',
                                                        fontWeight: 600,
                                                        fontSize: '1.1rem',
                                                        boxShadow: '0 2px 8px rgba(68, 145, 225, 0.15)',
                                                        border: '1px solid rgba(58, 136, 214, 0.2)',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(98, 159, 234, 0.2)'
                                                        }
                                                    }}
                                                >
                                                    
                                                    {event.price} ₺
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.maxParticipants} kişilik kontenjan
                                        </Typography>
                                        {event.participants && (
                                            <Typography variant="body2" color="text.secondary">
                                                {event.participants.length} katılımcı
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <CommentSection eventId={event.id} currentUser={user} />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Sağ Taraf - Organizatör Bilgileri, Harita ve Katılımcılar */}
                        <Grid item xs={12} md={4}>
                            {/* Organizatör Bilgileri */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    mb: 3
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#1a237e', mb: 3, fontWeight: 600 }}>
                                    Organizatör
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Tooltip title={`Organizatör: ${event.organizer?.firstName || ''} ${event.organizer?.lastName || ''}`}>
                                        <Avatar
                                            src={event.organizer?.profilePicture}
                                            alt={`${event.organizer?.firstName} ${event.organizer?.lastName}`}
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                border: '3px solid white',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    transition: 'transform 0.2s'
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: '#1a237e',
                                                fontWeight: 600
                                            }}
                                        >
                                            {event.organizer?.firstName} {event.organizer?.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.organizer?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Konum */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    mb: 3
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#1a237e', mb: 3, fontWeight: 600 }}>
                                    Konum
                                </Typography>
                                <EventMap event={event} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 2,
                                        mb: 2
                                    }}
                                >
                                    <LocationOn sx={{ fontSize: 18, mr: 1, color: '#1a237e' }} />
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
                                            borderColor: '#1a237e',
                                            color: '#1a237e',
                                            '&:hover': {
                                                borderColor: '#0d47a1',
                                                bgcolor: 'rgba(26, 35, 126, 0.04)'
                                            }
                                        }}
                                    >
                                        Yol Tarifi Al
                                    </Button>
                                )}
                            </Paper>

                            {/* Katılımcılar Listesi - Sadece organizatör için görünür */}
                            {user?.id === event.organizer?.id && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(20px)'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: '#1a237e', mb: 3, fontWeight: 600 }}>
                                        Katılımcılar
                                    </Typography>
                                    {event.participants && event.participants.length > 0 ? (
                                        <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                                            {event.participants.map((participant) => (
                                                <ListItem
                                                    key={participant.id}
                                                    sx={{
                                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        borderRadius: '8px',
                                                        mb: 1,
                                                        '&:last-child': { mb: 0 }
                                                    }}
                                                    secondaryAction={
                                                        participant.status === 'PENDING' && (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    edge="end"
                                                                    disabled={participantActionLoading}
                                                                    onClick={() => handleParticipantAction(participant.id, 'APPROVED')}
                                                                    sx={{
                                                                        color: 'success.main',
                                                                        '&:hover': { bgcolor: 'success.light' }
                                                                    }}
                                                                >
                                                                    <Check />
                                                                </IconButton>
                                                                <IconButton
                                                                    edge="end"
                                                                    disabled={participantActionLoading}
                                                                    onClick={() => handleParticipantAction(participant.id, 'REJECTED')}
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        '&:hover': { bgcolor: 'error.light' }
                                                                    }}
                                                                >
                                                                    <Close />
                                                                </IconButton>
                                                            </Box>
                                                        )
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={participant.user?.profilePicture}
                                                            alt={`${participant.user?.firstName} ${participant.user?.lastName}`}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${participant.user?.firstName} ${participant.user?.lastName}`}
                                                        secondary={
                                                            <Chip
                                                                label={
                                                                    participant.status === 'PENDING'
                                                                        ? 'Onay Bekliyor'
                                                                        : participant.status === 'APPROVED'
                                                                            ? 'Onaylandı'
                                                                            : 'Reddedildi'
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    bgcolor:
                                                                        participant.status === 'PENDING'
                                                                            ? 'warning.light'
                                                                            : participant.status === 'APPROVED'
                                                                                ? 'success.light'
                                                                                : 'error.light',
                                                                    color:
                                                                        participant.status === 'PENDING'
                                                                            ? 'warning.dark'
                                                                            : participant.status === 'APPROVED'
                                                                                ? 'success.dark'
                                                                                : 'error.dark'
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            Henüz katılımcı yok
                                        </Typography>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default EventDetail; 