import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Paper,
    Grid,
    Divider,
    Button,
    CircularProgress,
    Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import EventService from '../services/event.service';
import EventCard from '../components/EventCard';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { LocationOn, CalendarToday } from '@mui/icons-material';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [userEvents, setUserEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Eğer id yoksa dashboard'a yönlendir
                if (!id) {
                    navigate('/dashboard');
                    return;
                }

                // Eğer kendi profili ise profile sayfasına yönlendir
                if (currentUser && currentUser.id.toString() === id.toString()) {
                    navigate('/profile');
                    return;
                }

                const userResponse = await UserService.getUserById(id);
                if (!userResponse.data) {
                    toast.error('Kullanıcı bulunamadı');
                    navigate('/dashboard');
                    return;
                }

                setUser(userResponse.data);

                const eventsResponse = await EventService.getUserCreatedEvents(id);
                if (eventsResponse && eventsResponse.data) {
                setUserEvents(eventsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id, currentUser, navigate]);

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 'calc(100vh - 64px)',
                pt: '64px',
                bgcolor: '#0A1929'
            }}>
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 'calc(100vh - 64px)',
                pt: '64px',
                bgcolor: '#0A1929'
            }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                    Kullanıcı bulunamadı
                </Typography>
            </Box>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmemiş';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
    };

    return (
        <Box sx={{ pt: '84px', pb: 8, bgcolor: '#0A1929', minHeight: '100vh' }}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ 
                    p: 3, 
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                            <Avatar
                                src={user?.profilePicture}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mx: 'auto',
                                    mb: 2,
                                    border: '3px solid #3f51b5'
                                }}
                            />
                            <Typography variant="h5" sx={{ mb: 1, color: '#fff', fontWeight: 500 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                                {user?.email}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
                                Kullanıcı Bilgileri
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                                    <strong style={{ color: '#fff' }}>Doğum Tarihi:</strong> {formatDate(user?.birthDate)}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                                    <strong style={{ color: '#fff' }}>Katılım Tarihi:</strong> {formatDate(user?.createdAt)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
                                Oluşturduğu Etkinlikler
                            </Typography>
                            <Grid container spacing={2}>
                                {userEvents.length > 0 ? (
                                    userEvents.map((event) => (
                                        <Grid item xs={12} sm={6} key={event.id}>
                                            <Paper 
                                                elevation={2} 
                                                sx={{ 
                                                    borderRadius: '8px',
                                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        bgcolor: 'rgba(255, 255, 255, 0.05)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', height: '120px' }}>
                                                    {/* Sol taraf - Resim */}
                                                    <Box sx={{ width: '120px', position: 'relative' }}>
                                                        <img
                                                            src={event.imageUrl || '/images/categories/default.jpg'}
                                                            alt={event.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                borderTopLeftRadius: '8px',
                                                                borderBottomLeftRadius: '8px'
                                                            }}
                                                        />
                                                    </Box>
                                                    
                                                    {/* Sağ taraf - İçerik */}
                                                    <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column' }}>
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            sx={{ 
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                                mb: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 1,
                                                                WebkitBoxOrient: 'vertical'
                                                            }}
                                                        >
                                                            {event.title}
                                                        </Typography>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            <LocationOn sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                                                                {event.location}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            <CalendarToday sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                                                                {format(new Date(event.date), 'd MMMM yyyy', { locale: tr })}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Chip 
                                                                label={event.isPaid ? `${event.price} ₺` : 'Ücretsiz'} 
                                                                size="small"
                                                                sx={{ 
                                                                    height: '20px',
                                                                    fontSize: '0.7rem',
                                                                    bgcolor: event.isPaid ? 'error.dark' : 'success.dark',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                            <Button
                                                                size="small"
                                                                onClick={() => navigate(`/events/${event.id}`)}
                                                                sx={{
                                                                    minWidth: 'auto',
                                                                    fontSize: '0.7rem',
                                                                    color: 'primary.main',
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(63, 81, 181, 0.1)'
                                                                    }
                                                                }}
                                                            >
                                                                Detaylar
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                        </Box>
                                            </Paper>
                                    </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body1" sx={{ 
                                            textAlign: 'center',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontStyle: 'italic'
                                        }}>
                                            Henüz oluşturduğu etkinlik bulunmuyor.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default UserProfile; 