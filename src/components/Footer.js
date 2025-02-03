import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Divider,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: '#0A1929',
        color: 'white',
        py: 6,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo ve Açıklama */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                background: 'linear-gradient(45deg, #90caf9, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              EventVerse
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Etkinliklerin yeni evreni. Sosyal hayatınızı zenginleştirin, yeni insanlarla tanışın ve unutulmaz deneyimler yaşayın.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                sx={{
                  color: 'white',
                  '&:hover': {
                    color: '#90caf9',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  '&:hover': {
                    color: '#90caf9',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  '&:hover': {
                    color: '#90caf9',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  '&:hover': {
                    color: '#90caf9',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <LinkedIn />
              </IconButton>
            </Stack>
          </Grid>

          {/* Hızlı Linkler */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Hızlı Linkler
            </Typography>
            <Stack spacing={1}>
              <Link href="/about" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Hakkımızda
              </Link>
              <Link href="/events" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Etkinlikler
              </Link>
              <Link href="/blog" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Blog
              </Link>
              <Link href="/contact" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                İletişim
              </Link>
            </Stack>
          </Grid>

          {/* Kategoriler */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Kategoriler
            </Typography>
            <Stack spacing={1}>
              <Link href="/events?category=Eğitim" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Eğitim
              </Link>
              <Link href="/events?category=Teknoloji" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Teknoloji
              </Link>
              <Link href="/events?category=Sanat" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Sanat
              </Link>
              <Link href="/events?category=Spor" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
                Spor
              </Link>
            </Stack>
          </Grid>

          {/* İletişim */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              İletişim
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#90caf9' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  İstanbul, Türkiye
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: '#90caf9' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  info@eventverse.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: '#90caf9' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  +90 (212) 123 45 67
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Alt Bilgi */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            © 2024 EventVerse. Tüm hakları saklıdır.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/privacy" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
              Gizlilik Politikası
            </Link>
            <Link href="/terms" sx={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', '&:hover': { color: '#90caf9' } }}>
              Kullanım Şartları
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 