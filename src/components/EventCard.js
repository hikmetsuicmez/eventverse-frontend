import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import { LocationOn, Category, AttachMoney } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const EventCard = ({ event }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={event.eventImage || 'https://source.unsplash.com/random/?event'}
        alt={event.title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
            {event.title}
          </Typography>
          <Tooltip title={`Organizatör: ${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}>
            <Avatar
              src={event?.organizer?.profilePicture}
              alt={`${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}
              sx={{ 
                width: 32, 
                height: 32,
                border: '2px solid #4051B5',
                ml: 1,
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            icon={<Category sx={{ fontSize: 16 }} />}
            label={event.category}
            size="small"
            sx={{ 
              bgcolor: 'rgba(63, 81, 181, 0.1)',
              color: '#3F51B5',
              '& .MuiChip-icon': { color: '#3F51B5' }
            }}
          />
          <Chip
            icon={<LocationOn sx={{ fontSize: 16 }} />}
            label={event.location}
            size="small"
            sx={{ 
              bgcolor: 'rgba(63, 81, 181, 0.1)',
              color: '#3F51B5',
              '& .MuiChip-icon': { color: '#3F51B5' }
            }}
          />
          {event.isPaid && (
            <Chip
              icon={<AttachMoney sx={{ fontSize: 16 }} />}
              label={`${event.price} ₺`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(245, 124, 0, 0.1)',
                color: '#F57C00',
                '& .MuiChip-icon': { color: '#F57C00' }
              }}
            />
          )}
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {event.description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(event.date), 'dd MMMM yyyy', { locale: tr })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.eventTime}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {event.hasAgeLimit && (
              <Chip
                label={`${event.ageLimit}+`}
                size="small"
                sx={{ 
                  bgcolor: '#F57C00',
                  color: 'white'
                }}
              />
            )}
            <Chip
              label={`${event.participants ? event.participants.filter(p => p.status === 'APPROVED').length : 0}/${event.maxParticipants}`}
              size="small"
              sx={{ 
                bgcolor: '#7B1FA2',
                color: 'white'
              }}
            />
          </Box>

          <Button
            component={Link}
            to={`/events/${event.id}`}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#3F51B5',
              color: 'white',
              '&:hover': {
                bgcolor: '#303F9F'
              },
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Detayları Gör
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard; 