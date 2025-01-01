import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Container, 
  IconButton, 
  Avatar,
  Badge,
  Typography,
  Button,
  styled
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationService from '../../services/notification.service';

const ProfileButton = styled(Button)(({ theme }) => ({
  color: 'white',
  textTransform: 'none',
  padding: theme.spacing(0.5, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));

const AuthButton = styled(Button)(({ theme }) => ({
  color: 'white',
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  borderRadius: '4px',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [notifications, setNotifications] = React.useState([]);

  // Bildirimleri getir
  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications();
      const unreadNotifications = data.filter(notification => !notification.read);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      setNotifications([]);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const defaultAvatarUrl = 'https://www.gravatar.com/avatar/default?d=mp';

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: '#001E3C',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: '60px', padding: '0 16px', gap: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            to={isAuthenticated ? "/dashboard" : "/"}
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.3rem',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            EventVerse
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <>
              <IconButton
                component={Link}
                to="/dashboard"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }
                }}
              >
                <HomeIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>

              <IconButton
                component={Link}
                to="/notifications"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }
                }}
              >
                {notifications.length > 0 ? (
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon sx={{ fontSize: '1.5rem' }} />
                  </Badge>
                ) : (
                  <NotificationsIcon sx={{ fontSize: '1.5rem' }} />
                )}
              </IconButton>

              <ProfileButton
                component={Link}
                to="/profile"
              >
                <Avatar
                  src={user?.profilePicture || defaultAvatarUrl}
                  alt="Profil"
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
                <Typography sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  {user?.firstName || 'Profilim'}
                </Typography>
              </ProfileButton>

              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>
            </>
          ) : (
            <>
              <AuthButton
                component={Link}
                to="/about"
              >
                Hakkımızda
              </AuthButton>
              <AuthButton
                component={Link}
                to="/team"
              >
                Ekibimiz
              </AuthButton>
              <AuthButton
                component={Link}
                to="/login"
              >
                Giriş Yap
              </AuthButton>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                sx={{
                  bgcolor: '#2196F3',
                  color: 'white',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: '#1976D2'
                  }
                }}
              >
                Kayıt Ol
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 