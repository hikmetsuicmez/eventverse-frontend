import React, { useState } from 'react';
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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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

          {/* Arama Çubuğu */}
          <Box
            sx={{
              maxWidth: '300px',
              minWidth: '200px',
              width: '100%'
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '8px',
                backgroundColor: '#fff',
                width: '100%',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 3px 7px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                pl: 1.5
              }}>
                <SearchIcon sx={{ color: '#666', fontSize: '18px' }} />
              </Box>
              <InputBase
                placeholder="Ara..."
                sx={{
                  width: '100%',
                  height: '100%',
                  '& .MuiInputBase-input': {
                    pl: 1,
                    pr: 2,
                    py: 0.5,
                    fontSize: '0.9rem',
                    width: '100%',
                    height: '100%',
                    color: '#333',
                    '&::placeholder': {
                      color: '#666',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>
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
                <Badge badgeContent={1} color="error">
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
          <Box sx={{ display: 'flex', gap: 3, minWidth: '200px', justifyContent: 'flex-end' }}>
            <Typography
              component={Link}
              to="/login"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#90caf9'
                }
              }}
            >
              Giriş Yap
            </Typography>
            <Typography
              component={Link}
              to="/register"
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#90caf9'
                }
              }}
            >
              Kayıt Ol
            </Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 