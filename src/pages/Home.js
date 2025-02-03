import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001E3C 0%, #0A1929 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 15, md: 20 },
            pb: { xs: 10, md: 15 },
            position: 'relative'
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              align="center"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                mb: 3,
                background: 'linear-gradient(45deg, #90CAF9, #42A5F5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              EventVerse'e Hoş Geldiniz
            </Typography>

            <Typography
              variant="h5"
              align="center"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 6,
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Etkinlikleri keşfedin, oluşturun ve katılın. Sosyal deneyimlerinizi zenginleştirin.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 10 }}
            >
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Hemen Başla
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  borderColor: 'rgba(144, 202, 249, 0.5)',
                  color: '#90caf9',
                  '&:hover': {
                    borderColor: '#90caf9',
                    background: 'rgba(144, 202, 249, 0.08)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Giriş Yap
              </Button>
            </Stack>
          </MotionBox>

          {/* Özellikler */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <AddCircleOutlineIcon sx={{ fontSize: 60, color: '#90caf9', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                    Etkinlik Oluştur
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Kendi etkinliğinizi oluşturun ve insanları bir araya getirin. Yaratıcılığınızı konuşturun.
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{
                      mt: 3,
                      borderColor: '#90caf9',
                      color: '#90caf9',
                      '&:hover': {
                        borderColor: '#42a5f5',
                        background: 'rgba(144, 202, 249, 0.08)'
                      }
                    }}
                  >
                    Etkinlik Oluştur
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <ExploreIcon sx={{ fontSize: 60, color: '#90caf9', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                    Etkinlikleri Keşfet
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Size özel etkinlikleri keşfedin ve yeni deneyimler yaşayın. İlgi alanlarınıza göre filtreleme yapın.
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{
                      mt: 3,
                      borderColor: '#90caf9',
                      color: '#90caf9',
                      '&:hover': {
                        borderColor: '#42a5f5',
                        background: 'rgba(144, 202, 249, 0.08)'
                      }
                    }}
                  >
                    Keşfet
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <PersonOutlineIcon sx={{ fontSize: 60, color: '#90caf9', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                    Profil Oluştur
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Kişisel profilinizi oluşturun ve etkinlik deneyimlerinizi paylaşın. Yeni insanlarla tanışın.
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{
                      mt: 3,
                      borderColor: '#90caf9',
                      color: '#90caf9',
                      '&:hover': {
                        borderColor: '#42a5f5',
                        background: 'rgba(144, 202, 249, 0.08)'
                      }
                    }}
                  >
                    Profil Oluştur
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>

          {/* Alt Bilgi */}
          <Typography
            variant="body1"
            align="center"
            sx={{
              mt: 8,
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500
            }}
          >
            Binlerce kullanıcı ve yüzlerce etkinlik ile büyüyen topluluğumuza katılın.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 