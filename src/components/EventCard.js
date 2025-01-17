import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  CardActions,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import {
  LocationOn,
  Category,
  AttachMoney,
  Person,
  CalendarToday
} from '@mui/icons-material';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOrganizerClick = (e, organizerId) => {
    e.stopPropagation();
    if (user?.id === organizerId) {
      navigate('/profile');
    } else {
      navigate(`/users/${organizerId}`);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Ücretsiz';
    return `${price} ₺`;
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

  const getImageUrl = (event) => {
    if (event?.imageUrl) {
        return event.imageUrl;
    }
    return getDefaultImage(event?.category);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={getImageUrl(event)}
        alt={event.title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          variant="h6" 
          component="div" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '64px'
          }}
        >
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Category sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {event.category}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoney sx={{ mr: 1, color: event.isPaid ? 'error.main' : 'success.main' }} />
          <Typography variant="body2" color={event.isPaid ? 'error.main' : 'success.main'}>
            {formatPrice(event.price)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {event.currentParticipants || 0}/{event.maxParticipants || 'Sınırsız'} Katılımcı
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {format(new Date(event.date), 'd MMMM yyyy', { locale: tr })}
          </Typography>
        </Box>

        {event.hasAgeLimit && (
          <Chip 
            label={`${event.ageLimit}+ Yaş`} 
            color="warning" 
            size="small" 
            sx={{ mr: 1, mt: 1 }} 
          />
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            cursor: 'pointer'
          }}
          onClick={(e) => handleOrganizerClick(e, event.organizer?.id)}
        >
          <Tooltip title={event.organizer?.fullName || 'Organizatör'}>
            <Avatar
              src={event.organizer?.profilePicture}
              alt={event.organizer?.fullName}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
          </Tooltip>
          <Typography variant="body2" color="text.secondary">
            {event.organizer?.fullName || 'Organizatör'}
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          fullWidth
          onClick={() => navigate(`/events/${event.id}`)}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            }
          }}
        >
          Detayları Gör
        </Button>
      </Box>
    </Card>
  );
};

export default EventCard; 