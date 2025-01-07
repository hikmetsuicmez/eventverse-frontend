import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Grid, Paper, Box, Card, CardContent, Button, IconButton, Divider, CircularProgress, Fab, Avatar, Tooltip } from '@mui/material';
import { EventAvailable, People, LocationOn, CalendarMonth, AccessTime, Category, Add, FilterList } from '@mui/icons-material';
import EventService from '../services/event.service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Leaflet varsayılan ikonunu düzeltmek için
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const StatisticCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      height: '100%',
      bgcolor: '#23303F',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }
    }}
  >
    <Box
      sx={{
        width: 50,
        height: 50,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: `${color}15`,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24, color: color } })}
    </Box>
    <Box>
      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
        {value}
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
  console.log('Event data in EventCard:', event);
  console.log('Organizer data:', event?.organizer);
  console.log('Organizer ID:', event?.organizer?.id?.toString());
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Sol taraf - Tarih */}
      <Box 
        sx={{ 
          width: '100px',
          bgcolor: '#0A2540',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Typography variant="h2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
          {event?.date ? new Date(event.date).getDate() : '--'}
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, textTransform: 'uppercase' }}>
          TEM
        </Typography>
      </Box>

      {/* Sağ taraf - İçerik */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
              {event?.title || 'Etkinlik Adı'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                bgcolor: 'rgba(63, 81, 181, 0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <Category sx={{ fontSize: 16, color: '#3F51B5' }} />
                <Typography sx={{ color: '#3F51B5', fontWeight: 500 }}>
                  {event?.category || 'Kategori'}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                bgcolor: 'rgba(63, 81, 181, 0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <LocationOn sx={{ fontSize: 16, color: '#3F51B5' }} />
                <Typography sx={{ color: '#3F51B5', fontWeight: 500 }}>
                  {event?.location || 'Konum'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Tooltip title={`Organizatör: ${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}>
            <Avatar
              src={event?.organizer?.profilePicture}
              alt={`${event?.organizer?.firstName || ''} ${event?.organizer?.lastName || ''}`}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid #4051B5',
                ml: 2,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }} 
            />
          </Tooltip>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2
          }}
        >
          {event?.description || 'Etkinlik açıklaması'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {event?.ageLimit && (
              <Box sx={{ 
                bgcolor: '#F57C00',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                {event.ageLimit}+
              </Box>
            )}
            <Box sx={{ 
              bgcolor: '#F3E5F5',
              color: '#7B1FA2',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}>
              {event?.participants ? `${event.participants.filter(p => p.status === 'APPROVED').length}/${event.maxParticipants}` : '0/1000'}
            </Box>
          </Box>

          <Button 
            component={Link}
            to={`/events/${event?.id}`}
            variant="contained" 
            size="small"
            sx={{ 
              bgcolor: '#3F51B5',
              color: 'white',
              '&:hover': {
                bgcolor: '#303F9F'
              },
              textTransform: 'none',
              px: 2
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
          L.marker([parseFloat(event.latitude), parseFloat(event.longitude)], { icon: defaultIcon })
            .bindPopup(`
              <h3>${event.title}</h3>
              <p>${event.location}</p>
              <p>${new Date(event.date).toLocaleDateString('tr-TR')}</p>
            `)
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
  }, [events]);

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

        <Grid container spacing={4} sx={{ mb: 8, color: '#23303F' }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              icon={<EventAvailable />}
              title="Toplam Etkinlik"
              value={events.length}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              icon={<People />}
              title="Katılımcılar"
              value={events.reduce((total, event) => total + (event.participants?.length || 0), 0)}
              color="#4CAF50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              icon={<LocationOn />}
              title="Aktif Şehirler"
              value={new Set(events.map(event => event.location?.split(',')[0])).size}
              color="#FF9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              icon={<CalendarMonth />}
              title="Bu Ay"
              value={events.filter(event => {
                const eventDate = new Date(event.date);
                const currentDate = new Date();
                return eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
              }).length}
              color="#F44336"
            />
          </Grid>
        </Grid>

        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
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

          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
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
                <IconButton sx={{ color: 'white' }}>
                  <FilterList />
                </IconButton>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress />
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
      </Box>
      
      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          mt: 8
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
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left', justifyContent: 'flex-start' }}>
                  Ana Sayfa
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left', justifyContent: 'flex-start' }}>
                  Etkinlikler
                </Button>
                <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left', justifyContent: 'flex-start' }}>
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