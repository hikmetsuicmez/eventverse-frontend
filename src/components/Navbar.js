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
  ListItemAvatar,
  ListItemIcon,
  Paper,
  Popper,
  CircularProgress
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
import InfoIcon from '@mui/icons-material/Info';
import { alpha } from '@mui/material/styles';
import NotificationService from '../services/notification.service';
import { notificationEvents } from '../utils/notificationEvents';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import SearchService from '../services/search.service';
import { debounce } from 'lodash';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-hot-toast';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ events: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const theme = useTheme();

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

  const handleSearch = async (value) => {
    try {
        setSearchQuery(value);
        if (!value.trim()) {
            setSearchResults({ events: [], users: [] });
            setSearchAnchorEl(null);
            return;
        }
        
        if (value.trim().length < 2) {
            return;
        }

        setIsSearching(true);
        const response = await SearchService.search(value);
        if (response.data) {
            setSearchResults(response.data);
            const searchInput = document.querySelector('#search-input');
            if (searchInput && !searchAnchorEl) {
                setSearchAnchorEl(searchInput);
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        toast.error('Arama sırasında bir hata oluştu');
    } finally {
        setIsSearching(false);
    }
  };

  const handleSearchItemClick = (type, item) => {
    if (type === 'event') {
        navigate(`/events/${item.id}`);
    } else if (type === 'user') {
        navigate(`/users/${item.id}`);
    }
    setSearchQuery('');
    setSearchResults({ events: [], users: [] });
    setSearchAnchorEl(null);
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#0A1929',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
          gap: 3,
          flex: '1 1 auto'
        }}>
          <Typography
            variant="h6"
            component={Link}
            to={user ? '/dashboard' : '/'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              letterSpacing: '0.5px',
              background: 'linear-gradient(45deg, #90caf9, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                filter: 'brightness(1.2)'
              }
            }}
          >
            <Logo size={36} />
            EventVerse
          </Typography>

          {/* Ana Menü Linkleri */}
          {user && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component={Link}
                to="/dashboard"
                startIcon={<HomeIcon />}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Ana Sayfa
              </Button>
              <Button
                component={Link}
                to="/events"
                startIcon={<EventIcon />}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Etkinlikler
              </Button>
            </Box>
          )}

          <Box sx={{ 
            position: 'relative',
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
            },
            width: '300px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s'
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
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px' }}/>
            </Box>
            <InputBase
              id="search-input"
              placeholder="Etkinlik veya kullanıcı ara..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              autoComplete="off"
              onFocus={(e) => {
                if (searchQuery.trim().length >= 2) {
                  setSearchAnchorEl(e.currentTarget);
                }
              }}
              sx={{
                color: 'white',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: '10px 12px 10px 40px',
                  fontSize: '0.95rem',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Sağ Kısım - Kullanıcı Menüsü */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
          {user ? (
            <>
              <Button
                component={Link}
                to="/create-event"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#1565c0',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                  '&:hover': {
                    bgcolor: '#0d47a1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.4)'
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
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
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
                  gap: 1.5,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiAvatar-root': {
                      transform: 'scale(1.05)',
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
                    transition: 'transform 0.3s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      lineHeight: 1.2
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.8rem'
                    }}
                  >
                    Profil
                  </Typography>
                </Box>
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
                    minWidth: '220px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: '8px',
                      margin: '4px 8px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.08)',
                        transform: 'translateX(4px)'
                      }
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleClose} component={Link} to="/profile" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#90caf9' }} />
                  <Typography>Profilim</Typography>
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
              <Button 
                component={Link} 
                to="/login" 
                sx={{ 
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Giriş Yap
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                Kayıt Ol
              </Button>
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
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                    <InfoIcon sx={{ color: '#90caf9', width: 24, height: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ 
                        color: 'white',
                        fontWeight: 500,
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
                    </Box>
                    <IconButton
                      size="small"
                      sx={{ 
                        color: 'rgba(255,255,255,0.5)',
                        '&:hover': { color: 'white' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationRead(notification.id, notification.eventId, notifications);
                      }}
                    >
                      <Badge variant="dot" color="error">
                        <NotificationsIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Menu>

        <Menu
          anchorEl={searchAnchorEl}
          open={Boolean(searchAnchorEl) && Boolean(searchResults)}
          onClose={() => setSearchAnchorEl(null)}
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
              position: 'absolute',
              zIndex: 9999
            },
            onMouseDown: (e) => {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          MenuListProps={{
            sx: { py: 0 },
            onMouseEnter: () => {
              const input = document.querySelector('#search-input');
              if (input) input.blur();
            },
            onMouseLeave: () => {
              const input = document.querySelector('#search-input');
              if (input) input.focus();
            }
          }}
          disableAutoFocus
          disableEnforceFocus
          keepMounted
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          {searchResults.events.length > 0 && (
            <>
              <Typography sx={{ px: 2, py: 1, color: 'rgba(255,255,255,0.7)' }}>
                Etkinlikler
              </Typography>
              {searchResults.events.map(event => (
                <MenuItem
                  key={event.id}
                  onClick={() => handleSearchItemClick('event', event)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(144, 202, 249, 0.08)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <EventIcon sx={{ color: '#90caf9' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {event.location}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))}
            </>
          )}

          {searchResults.users.length > 0 && (
            <>
              <Typography sx={{ px: 2, py: 1, color: 'rgba(255,255,255,0.7)' }}>
                Kullanıcılar
              </Typography>
              {searchResults.users.map(user => (
                <MenuItem
                  key={user.id}
                  onClick={() => handleSearchItemClick('user', user)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(144, 202, 249, 0.08)'
                    }
                  }}
                >
                  <ListItemIcon>
                    {user.profilePicture ? (
                      <Avatar
                        src={user.profilePicture}
                        sx={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <PersonIcon sx={{ color: '#90caf9' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {user.email}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))}
            </>
          )}

          {(!searchResults.events.length && !searchResults.users.length && searchQuery) && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              Sonuç bulunamadı
            </Typography>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 