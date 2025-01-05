import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  InputBase
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { alpha } from '@mui/material/styles';
import NotificationService from '../services/notification.service';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#0A1929',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: '64px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Toolbar sx={{ 
        width: '100%', 
        maxWidth: '1400px', 
        mx: 'auto', 
        px: 2, 
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {/* Sol Kısım - Logo ve Arama */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flex: '1 1 auto'
        }}>
          <Typography
            variant="h6"
            component={Link}
            to={user ? '/dashboard' : '/'}
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              '&:hover': {
                color: '#90caf9'
              }
            }}
          >
            EventVerse
          </Typography>

          <Box sx={{ 
            position: 'relative',
            borderRadius: 1,
            bgcolor: alpha('#ffffff', 0.15),
            '&:hover': {
              bgcolor: alpha('#ffffff', 0.25),
            },
            width: '300px'
          }}>
            <Box sx={{ 
              padding: '0 12px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }}/>
            </Box>
            <InputBase
              placeholder="Etkinlik veya kullanıcı ara..."
              sx={{
                color: 'white',
                padding: '8px 8px 8px 48px',
                width: '100%',
                '& input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1
                }
              }}
            />
          </Box>
        </Box>

        {/* Sağ Kısım - Kullanıcı Menüsü */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
            <IconButton
              component={Link}
              to={user ? '/dashboard' : '/'}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              <HomeIcon />
            </IconButton>
            <Tooltip title="Bildirimler">
              <IconButton
                color="inherit"
                component={Link}
                to="/notifications"
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  invisible={unreadCount === 0}
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
            </Tooltip>

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  '& .MuiAvatar-root': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s'
                  }
                }
              }}
              onClick={handleMenu}
            >
              <Avatar
                src={user?.profilePicture}
                alt={user?.firstName}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid white',
                }}
              />
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1rem',
                  letterSpacing: '0.2px',
                  fontWeight: 500
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  backgroundColor: '#0A1929',
                  color: 'white',
                  minWidth: '200px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(144, 202, 249, 0.08)'
                    }
                  }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem component={Link} to="/profile">
                <Avatar 
                  src={user?.profilePicture} 
                  sx={{ width: 24, height: 24, mr: 2 }}
                />
                Profil
              </MenuItem>
              <MenuItem component={Link} to="/create-event">
                <AddIcon sx={{ color: 'white', fontSize: 20, mr: 2 }} />
                Etkinlik Oluştur
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ color: 'white', fontSize: 20, mr: 2 }} />
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
            >
              Giriş Yap
            </Link>
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none',
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
            >
              Kayıt Ol
            </Link>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 