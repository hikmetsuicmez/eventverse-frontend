import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { EventAvailable, People, LocationOn, Notifications } from '@mui/icons-material';

const DashboardCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      bgcolor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
      }
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        bgcolor: `${color}15`,
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" gutterBottom sx={{ color: '#001E3C', fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ color: color, fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#001E3C',
        pt: '100px',
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            mb: 4,
            fontWeight: 700,
          }}
        >
          Hoş Geldiniz, [Kullanıcı Adı]
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              icon={<EventAvailable sx={{ fontSize: 32, color: '#2196F3' }} />}
              title="Etkinliklerim"
              value="12"
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              icon={<People sx={{ fontSize: 32, color: '#4CAF50' }} />}
              title="Katılımcılar"
              value="48"
              color="#4CAF50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              icon={<LocationOn sx={{ fontSize: 32, color: '#FF9800' }} />}
              title="Aktif Etkinlikler"
              value="5"
              color="#FF9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              icon={<Notifications sx={{ fontSize: 32, color: '#F44336' }} />}
              title="Bildirimler"
              value="3"
              color="#F44336"
            />
          </Grid>
        </Grid>

        {/* Yaklaşan Etkinlikler ve Diğer İçerikler İçin Yer Tutucu */}
        <Box sx={{ mt: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: '#001E3C', fontWeight: 600 }}>
              Yaklaşan Etkinlikler
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Henüz yaklaşan etkinlik bulunmuyor.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard; 