import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Avatar,
  Button,
  styled,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationService from '../../services/notification.service';

// Event emitter için basit bir yapı
const notificationEvents = {
  listeners: new Set(),
  emit(event) {
    this.listeners.forEach(listener => listener(event));
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export { notificationEvents }; // Event emitter'ı dışa aktar

// Search input için özel stil
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  width: '300px',
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 255, 255, 0.7)'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1
    }
  }
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await NotificationService.getUnreadNotifications();
          const notifications = response.data.data || [];
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error('Bildirimler alınamadı:', error);
          setUnreadCount(0);
        }
      }
    };

    // Event listener'ı ekle
    const unsubscribe = notificationEvents.subscribe(() => {
      fetchNotifications();
    });

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#001E3C', 
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(90deg, #001E3C 0%, #0A2540 100%)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', px: 0, height: 70 }}>
          {/* Sol Taraf - Logo ve Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 700,
                letterSpacing: 1,
                background: 'linear-gradient(45deg, #fff, #e0e0e0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(255,255,255,0.2)'
              }}
            >
              EventVerse
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Etkinlik Adı, Kullanıcı Adı..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Box>

          {/* Sağ Taraf */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  component={Link}
                  to="/dashboard"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
                <IconButton 
                  component={Link}
                  to="/notifications"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #FF5252, #FF1744)',
                        boxShadow: '0 2px 5px rgba(255,23,68,0.5)'
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => navigate('/profile')}
                >
                  <Avatar 
                    src={user?.profileImage} 
                    alt={user?.firstName}
                    sx={{ 
                      width: 38, 
                      height: 38,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Typography 
                    sx={{ 
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={handleLogout}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    '&:hover': { 
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Giriş Yap
                </Button>
                <Button 
                  component={Link} 
                  to="/register"
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(25,118,210,0.5)',
                    '&:hover': { 
                      background: 'linear-gradient(45deg, #1976D2, #1565C0)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 