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
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import EventService from '../services/event.service';
import EventCard from '../components/EventCard';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

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
                // Eğer id yoksa veya geçersizse dashboard'a yönlendir
                if (!id) {
                    navigate('/dashboard');
                    return;
                }

                // Eğer kendi profili ise profile sayfasına yönlendir
                if (currentUser && currentUser.id === id) {
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
                setUserEvents(eventsResponse.data);
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
                pt: '64px'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmemiş';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
    };

    return (
        <Box sx={{ pt: '84px', pb: 8, bgcolor: '#0A1929', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                            <Avatar
                                src={user?.profilePicture}
                                sx={{
                                    width: 200,
                                    height: 200,
                                    mx: 'auto',
                                    mb: 2,
                                    border: '4px solid #1a237e'
                                }}
                            />
                            <Typography variant="h5" sx={{ mb: 1, color: '#1a237e', fontWeight: 600 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                                {user?.email}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                                Kullanıcı Bilgileri
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Doğum Tarihi:</strong> {formatDate(user?.birthDate)}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Katılım Tarihi:</strong> {formatDate(user?.createdAt)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                                Oluşturduğu Etkinlikler
                            </Typography>
                            <Grid container spacing={2}>
                                {userEvents.map((event) => (
                                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                                        <Box sx={{ transform: 'scale(0.9)' }}>
                                            <EventCard event={event} />
                                        </Box>
                                    </Grid>
                                ))}
                                {userEvents.length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body1" color="textSecondary">
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