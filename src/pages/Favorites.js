import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Alert,
  useTheme
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CalendarMonth,
  AttachMoney,
  Group
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import FavoriteService from '../services/favorite.service';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await FavoriteService.getFavorites();
      if (response && response.data) {
        setFavorites(response.data.data || []);
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
      setError('Favoriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await FavoriteService.deleteFavorite(favoriteId);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Favori kaldırılırken hata:', error);
      setError('Favori kaldırılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (event) => {
    if (event?.imageUrl) {
        return event.imageUrl;
    }
    return getDefaultImage(event?.category);
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0A1929',
        pt: '84px',
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: 'white',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Favori Etkinliklerim
        </Typography>

        <Grid container spacing={3}>
          {loading ? (
            // Loading skeletons...
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={24} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : favorites.length === 0 ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2
                }}
              >
                <FavoriteIcon sx={{ fontSize: 64, color: '#90caf9', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                  Henüz favori etkinliğiniz bulunmuyor
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  İlginizi çeken etkinlikleri favorilerinize ekleyerek takip edebilirsiniz
                </Typography>
              </Box>
            </Grid>
          ) : (
            favorites.map((favorite) => (
              <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                      '& img': {
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                  onClick={() => navigate(`/events/${favorite.eventId}`)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '60%',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      component="img"
                      src={favorite.eventImageUrl || '/images/categories/default.jpg'}
                      alt={favorite.eventTitle}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FavoriteIcon sx={{ color: '#e91e63' }} />
                    </IconButton>
                    {favorite.paid && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(245, 124, 0, 0.9)',
                          color: 'white',
                          py: 0.5,
                          px: 1.5,
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 18 }} />
                        {favorite.price} ₺
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                        fontWeight: 600
                      }}
                    >
                      {favorite.eventTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth sx={{ color: '#90caf9', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {formatDate(favorite.eventDate)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ color: '#90caf9', fontSize: 20 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {favorite.eventLocation}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Group sx={{ color: '#90caf9', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {favorite.maxParticipants} Katılımcı
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Favorites; 