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
  InputBase,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { alpha } from '@mui/material/styles';
import NotificationService from '../services/notification.service';
import { notificationEvents } from '../utils/notificationEvents';
import CalendarMonth from '@mui/icons-material/CalendarMonth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const unreadResponse = await NotificationService.getUnreadNotifications();
          const unreadNotifications = unreadResponse.data.data || [];
          setUnreadCount(unreadNotifications.length);
          setNotifications(unreadNotifications);
        } catch (error) {
          console.error('Bildirimler alınamadı:', error);
          setUnreadCount(0);
          setNotifications([]);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);

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

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationRead = async (notificationId, eventId, notifications) => {
    try {
      console.log('Bildirim ID:', notificationId);
      console.log('Etkinlik ID:', eventId);
      await NotificationService.markAsRead(notificationId);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      handleNotificationClose();
      // Etkinlik detay sayfasına yönlendir
      if (eventId) {
        navigate(`/events/${eventId}`);
      }
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
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
              transition: 'all 0.2s',
              '&:hover': {
                color: '#90caf9',
                transform: 'translateY(-2px)'
              }
            }}
          >
            EventVerse
          </Typography>

          <Box sx={{ 
            position: 'relative',
            borderRadius: '8px',
            bgcolor: alpha('#ffffff', 0.15),
            '&:hover': {
              bgcolor: alpha('#ffffff', 0.25),
            },
            width: '250px',
            height: '36px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box sx={{ 
              padding: '0 8px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px' }}/>
            </Box>
            <InputBase
              placeholder="Etkinlik veya kullanıcı ara..."
              sx={{
                color: 'white',
                padding: '4px 4px 4px 36px',
                width: '100%',
                fontSize: '0.9rem',
                '& input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                  fontSize: '0.9rem'
                }
              }}
            />
          </Box>
        </Box>

        {/* Sağ Kısım - Kullanıcı Menüsü */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
          {user ? (
            <>
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
              <Button
                component={Link}
                to="/create-event"
                startIcon={<AddIcon />}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                Etkinlik Oluştur
              </Button>
              <Tooltip title="Bildirimler">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClick}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
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
                  <PersonIcon sx={{ color: '#90caf9' }} />
                  Profilim
                </MenuItem>
                <MenuItem component={Link} to="/favorites">
                  <FavoriteIcon sx={{ color: '#ff1744' }} />
                  Favorilerim
                </MenuItem>
                <MenuItem component={Link} to="/create-event">
                  <AddIcon sx={{ color: '#90caf9' }} />
                  Etkinlik Oluştur
                </MenuItem>
                <MenuItem component={Link} to="/settings">
                  <SettingsIcon sx={{ color: '#90caf9' }} />
                  Ayarlar
                </MenuItem>
                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ color: '#ff1744' }} />
                  Çıkış Yap
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
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
            </>
          )}
        </Box>

        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: '400px',
              maxHeight: '500px',
              mt: 1.5,
              backgroundColor: '#0A1929',
              color: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '& .MuiList-root': {
                padding: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#0A1929'
          }}>
            <Typography sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: 'white'
            }}>
              Bildirimler
            </Typography>
            {unreadCount > 0 && (
              <Typography 
                onClick={handleMarkAllAsRead}
                sx={{ 
                  fontSize: '0.9rem',
                  color: '#90caf9',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Tümünü Okundu İşaretle
              </Typography>
            )}
          </Box>
          <List sx={{ 
            p: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          }}>
            {notifications.length === 0 ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                color: 'rgba(255,255,255,0.7)'
              }}>
                <NotificationsIcon sx={{ fontSize: 48, mb: 2, color: 'rgba(255,255,255,0.3)' }} />
                <Typography>Okunmamış bildirim bulunmuyor</Typography>
              </Box>
            ) : (
              notifications.map(notification => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationRead(notification.id, notification.eventId, notifications)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(144, 202, 249, 0.12)',
                      transform: 'translateY(-2px)'
                    },
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Typography sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '0.95rem',
                    lineHeight: 1.4
                  }}>
                    {notification.message}
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CalendarMonth sx={{ fontSize: 16 }} />
                    {new Date(notification.timestamp).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </ListItem>
              ))
            )}
          </List>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 