import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Paper, Box, Card, CardContent, Button, IconButton, Divider, CircularProgress, Fab, Avatar, Tooltip, Chip } from '@mui/material';
import { EventAvailable, People, LocationOn, CalendarMonth, AccessTime, Category, Add, FilterList, Warning, AttachMoney } from '@mui/icons-material';
import EventService from '../services/event.service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

// Leaflet varsayılan ikonunu düzeltmek için
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const StatisticCard = ({ icon, title, value, color, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, rgba(255,255,255,0.02) 100%)`,
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 24px ${color}10`,
        '& .stat-icon': {
          transform: 'scale(1.1) rotate(5deg)',
        },
        '& .stat-value': {
          color: color,
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at top right, ${color}10, transparent 70%)`,
        opacity: 0.5,
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box
        className="stat-icon"
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}15`,
          transition: 'all 0.3s ease',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28, color: color } })}
      </Box>
      {trend && (
        <Chip
          label={`${trend > 0 ? '+' : ''}${trend}%`}
          size="small"
          sx={{
            bgcolor: trend > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            color: trend > 0 ? '#81c784' : '#e57373',
            borderRadius: '12px',
            height: '24px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        />
      )}
    </Box>

    <Box sx={{ mt: 'auto' }}>
      <Typography 
        className="stat-value"
        variant="h3" 
        sx={{ 
          color: 'white', 
          fontWeight: 700,
          transition: 'color 0.3s ease',
          fontSize: { xs: '1.8rem', sm: '2.2rem' }
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontWeight: 500,
          mt: 1,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        {title}
      </Typography>
    </Box>
  </Paper>
);

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  } catch {
    return dateString;
  }
};

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

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      {/* Sol taraf - Tarih ve Görsel */}
      <Box 
        sx={{ 
          width: '180px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={event?.imageUrl || 'https://via.placeholder.com/300x200'}
          alt={event?.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, lineHeight: 1, mb: 1 }}>
            {event?.date ? new Date(event.date).getDate() : '--'}
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, textTransform: 'uppercase' }}>
            {event?.date ? format(new Date(event.date), 'MMM', { locale: tr }) : ''}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white', mt: 1, fontWeight: 500 }}>
            {event?.eventTime || '--:--'}
          </Typography>
        </Box>
      </Box>

      {/* Sağ taraf - İçerik */}
      <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              {event?.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<Category sx={{ color: 'inherit' }} />}
                label={event?.category}
                size="small"
                sx={{
                  bgcolor: 'rgba(63, 81, 181, 0.2)',
                  color: '#90caf9',
                  borderRadius: '8px',
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Chip
                icon={<LocationOn sx={{ color: 'inherit' }} />}
                label={event?.location}
                size="small"
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  color: '#a5d6a7',
                  borderRadius: '8px',
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Chip
                icon={<AttachMoney sx={{ color: 'inherit' }} />}
                label={event?.isPaid ? `${event.price} ₺` : 'Ücretsiz'}
                size="small"
                sx={{
                  bgcolor: event?.isPaid ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                  color: event?.isPaid ? '#ef9a9a' : '#a5d6a7',
                  borderRadius: '8px',
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>
          </Box>
          
          <Tooltip title={`${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}>
            <Avatar
              src={event?.organizer?.profilePicture}
              alt={`${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}
              onClick={(e) => handleOrganizerClick(e, event?.organizer?.id)}
              sx={{ 
                width: 44,
                height: 44,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  borderColor: 'primary.main'
                }
              }}
            />
          </Tooltip>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            flex: 1
          }}
        >
          {event?.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {event?.hasAgeLimit && (
              <Chip
                label={`${event.ageLimit}+ Yaş`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                  color: '#ffcc80',
                  borderRadius: '8px',
                  height: '24px'
                }}
              />
            )}
            <Chip
              icon={<People sx={{ fontSize: '16px' }} />}
              label={`${event?.participants?.length || 0}/${event?.maxParticipants || '∞'}`}
              size="small"
              sx={{
                bgcolor: 'rgba(156, 39, 176, 0.2)',
                color: '#ce93d8',
                borderRadius: '8px',
                height: '24px',
                '& .MuiChip-icon': {
                  color: '#ce93d8'
                }
              }}
            />
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(`/events/${event?.id}`)}
            sx={{
              textTransform: 'none',
              bgcolor: 'rgba(63, 81, 181, 0.2)',
              color: '#90caf9',
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.4)'
              }
            }}
          >
            Detayları Gör
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

const MapComponent = ({ events }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const center = [41.0082, 28.9784]; // İstanbul koordinatları

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(center, 10);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Marker ikonunu ayarla
      const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Markerları ekle
      events.forEach((event) => {
        if (event?.latitude && event?.longitude) {
          const popupContent = document.createElement('div');
          popupContent.className = 'custom-popup';
          popupContent.innerHTML = `
            <div style="
              font-family: Arial, sans-serif;
              padding: 10px;
              max-width: 250px;
            ">
              <h3 style="
                margin: 0 0 8px 0;
                color: #1a237e;
                font-size: 16px;
                font-weight: 600;
              ">${event.title}</h3>
              
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                color: #666;
                font-size: 13px;
              ">
                <span style="
                  background: rgba(25, 118, 210, 0.1);
                  color: #1976d2;
                  padding: 4px 8px;
                  border-radius: 4px;
                  margin-right: 8px;
                ">${new Date(event.date).toLocaleDateString('tr-TR')}</span>
                <span style="
                  background: rgba(25, 118, 210, 0.1);
                  color: #1976d2;
                  padding: 4px 8px;
                  border-radius: 4px;
                ">${event.eventTime || 'Saat belirtilmemiş'}</span>
              </div>
              
              <div style="
                margin-bottom: 8px;
                color: #666;
                font-size: 13px;
              ">${event.location}</div>
              
              <button 
                onclick="window.location.href='/events/${event.id}'"
                style="
                  background: #1a237e;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  width: 100%;
                  font-size: 13px;
                  transition: background-color 0.2s;
                "
                onmouseover="this.style.backgroundColor='#0d47a1'"
                onmouseout="this.style.backgroundColor='#1a237e'"
              >
                Detayları Gör
              </button>
            </div>
          `;

          L.marker([parseFloat(event.latitude), parseFloat(event.longitude)], { icon: defaultIcon })
            .bindPopup(popupContent)
            .addTo(mapRef.current);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [events, navigate]);

  return <div id="map" style={{ height: '100%', width: '100%', borderRadius: '16px' }} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await EventService.getAllEvents();
        console.log('Gelen event verileri:', response);
        
        // Backend'den gelen data array'ini direkt kullan
        const eventList = response.data || [];
        setEvents(eventList);

      } catch (error) {
        console.error('Etkinlikler yüklenirken hata oluştu:', error);
        setError('Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0A1929',
        pt: '80px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, flex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            mb: 6,
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Etkinlikler Dünyasına Hoş Geldiniz
        </Typography>

        {/* Ana İçerik Bölümü */}
        <Grid container spacing={6} sx={{ mb: 8 }}>
          {/* Harita Bölümü */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                p: { xs: 2, sm: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                height: '700px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 4 }}>
                Etkinlik Haritası
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', borderRadius: '20px', overflow: 'hidden' }}>
                <MapComponent events={events} />
              </Box>
            </Box>
          </Grid>

          {/* Etkinlikler Listesi */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                p: { xs: 2, sm: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                height: '700px',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  Tüm Etkinlikler
                </Typography>
                <Button
                  component={Link}
                  to="/events"
                  startIcon={<FilterList />}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  Filtreleme
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="error" gutterBottom>
                    {error}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => window.location.reload()}
                    sx={{ mt: 2 }}
                  >
                    Yeniden Dene
                  </Button>
                </Box>
              ) : events.length > 0 ? (
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  pr: 2,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  height: '100%'
                }}>
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Henüz etkinlik bulunmuyor
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/create-event')}
                    sx={{
                      bgcolor: '#3f51b5',
                      '&:hover': { bgcolor: '#283593' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      px: 4
                    }}
                  >
                    Yeni Etkinlik Oluştur
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* İstatistik Kartları */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 4, 
              textAlign: 'center',
              position: 'relative',
              display: 'inline-block',
              left: '50%',
              transform: 'translateX(-50%)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '10%',
                width: '80%',
                height: '4px',
                background: 'linear-gradient(90deg, #3f51b5 0%, #f50057 100%)',
                borderRadius: '2px',
              }
            }}
          >
            Platform İstatistikleri
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatisticCard
                icon={<EventAvailable />}
                title="Toplam Etkinlik"
                value={events.length}
                color="#3f51b5"
                trend={12}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatisticCard
                icon={<People />}
                title="Toplam Katılımcı"
                value={events.reduce((total, event) => total + (event.participants?.length || 0), 0)}
                color="#4CAF50"
                trend={8}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatisticCard
                icon={<LocationOn />}
                title="Aktif Şehir"
                value={new Set(events.map(event => event.location?.split(',')[0])).size}
                color="#FF9800"
                trend={5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatisticCard
                icon={<CalendarMonth />}
                title="Bu Ayki Etkinlik"
                value={events.filter(event => {
                  const eventDate = new Date(event.date);
                  const currentDate = new Date();
                  return eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length}
                color="#F44336"
                trend={15}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                EventVerse
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Etkinliklerin dünyasına hoş geldiniz. Yeni deneyimler keşfedin, insanlarla tanışın ve unutulmaz anılar biriktirin.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Hızlı Bağlantılar
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  component={Link} 
                  to="/"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textAlign: 'left', 
                    justifyContent: 'flex-start',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Ana Sayfa
                </Button>
                <Button 
                  component={Link} 
                  to="/events"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textAlign: 'left', 
                    justifyContent: 'flex-start',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Etkinlikler
                </Button>
                <Button 
                  component={Link} 
                  to="/about"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    textAlign: 'left', 
                    justifyContent: 'flex-start',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Hakkımızda
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                İletişim
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                Email: info@eventverse.com
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Tel: +90 (212) 123 45 67
              </Typography>
            </Grid>
          </Grid>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              textAlign: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            © 2024 EventVerse. Tüm hakları saklıdır.
          </Typography>
        </Container>
      </Box>

      {/* Yeni Etkinlik Oluştur Butonu */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: '#3f51b5',
          '&:hover': {
            bgcolor: '#283593'
          }
        }}
        onClick={() => navigate('/create-event')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Dashboard; 