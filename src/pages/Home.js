import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #001E3C 0%, #0A47A9 100%)',
        pt: '64px',
      }}
    >
      <Box
        sx={{
          background: 'url("/pattern.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              color: 'white',
              mb: 8,
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 3,
                animation: 'fadeIn 1s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(-20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              EventVerse'e Hoş Geldiniz
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Etkinlikleri keşfedin, oluşturun ve katılın. Sosyal deneyimlerinizi zenginleştirin.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/login"
              sx={{
                backgroundColor: '#2196F3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976D2',
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                padding: '10px 20px',
                marginTop: '40px',
                marginBottom: '-10px',
                borderRadius: '30px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textTransform: 'none',
              }}
            >
              Hemen Başla
            </Button>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                  },
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <AddCircleOutlineIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Etkinlik Oluştur
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Kendi etkinliğinizi oluşturun, katılımcılarla buluşun ve unutulmaz anlar yaratın.
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Etkinlik Oluştur
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                  },
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <ExploreIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Etkinlikleri Keşfet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Çevrenizdeki etkinlikleri harita üzerinde görüntüleyin ve size en uygun olana katılın.
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Keşfet
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                  },
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <PersonOutlineIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Profil Oluştur
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Kişisel profilinizi oluşturun, etkinliklerinizi yönetin ve yeni bağlantılar kurun.
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Profil Oluştur
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8, color: 'white' }}>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Binlerce kullanıcı ve yüzlerce etkinlik ile büyüyen topluluğumuza katılın.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 