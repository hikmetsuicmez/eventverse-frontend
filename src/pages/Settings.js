import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  Divider,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  VolumeUp as VolumeUpIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Ayarlar
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <List>
          {/* Bildirim Ayarları */}
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon sx={{ color: '#90caf9' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Bildirim Ayarları" 
              secondary="E-posta ve anlık bildirimlerinizi yönetin"
            />
          </ListItem>
          <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
            <List disablePadding>
              <ListItem>
                <ListItemText primary="E-posta Bildirimleri" />
                <Switch
                  edge="end"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Anlık Bildirimler" />
                <Switch
                  edge="end"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Pazarlama Bildirimleri" />
                <Switch
                  edge="end"
                  checked={notifications.marketing}
                  onChange={() => handleNotificationChange('marketing')}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Güvenlik Ayarları */}
          <ListItemButton component="a" href="/settings/security">
            <ListItemIcon>
              <SecurityIcon sx={{ color: '#90caf9' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Güvenlik" 
              secondary="Şifre ve güvenlik ayarlarınızı yönetin"
            />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Görünüm Ayarları */}
          <ListItem>
            <ListItemIcon>
              <PaletteIcon sx={{ color: '#90caf9' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Görünüm" 
              secondary="Tema ve görünüm tercihlerinizi ayarlayın"
            />
          </ListItem>
          <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
            <List disablePadding>
              <ListItem>
                <ListItemText primary="Karanlık Mod" />
                <Switch
                  edge="end"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Dil Ayarları */}
          <ListItemButton component="a" href="/settings/language">
            <ListItemIcon>
              <LanguageIcon sx={{ color: '#90caf9' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Dil" 
              secondary="Uygulama dilini değiştirin"
            />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Ses Ayarları */}
          <ListItem>
            <ListItemIcon>
              <VolumeUpIcon sx={{ color: '#90caf9' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Ses" 
              secondary="Bildirim ve sistem seslerini yönetin"
            />
          </ListItem>
          <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
            <List disablePadding>
              <ListItem>
                <ListItemText primary="Sistem Sesleri" />
                <Switch
                  edge="end"
                  checked={sound}
                  onChange={() => setSound(!sound)}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Hesap Silme */}
          <ListItemButton 
            sx={{ 
              color: '#ff1744',
              '&:hover': {
                bgcolor: 'rgba(255, 23, 68, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <DeleteForeverIcon sx={{ color: '#ff1744' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Hesabı Sil" 
              secondary="Hesabınızı kalıcı olarak silin"
            />
          </ListItemButton>
        </List>
      </Paper>

      <Alert 
        severity="info" 
        sx={{ 
          mt: 3,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          '& .MuiAlert-icon': {
            color: '#2196F3'
          }
        }}
      >
        Ayarlarınızdaki değişiklikler otomatik olarak kaydedilir.
      </Alert>
    </Container>
  );
};

export default Settings; 