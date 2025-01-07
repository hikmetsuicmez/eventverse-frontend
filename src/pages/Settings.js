import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Switch,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  VolumeUp as VolumeUpIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');
      await UserService.deleteAccount(password);
      logout();
      navigate('/');
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Hesap silinirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0A1929',
        pt: 8,
        pb: 4
      }}
    >
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
                primary={<Typography sx={{ color: 'white' }}>Bildirim Ayarları</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>E-posta ve anlık bildirimlerinizi yönetin</Typography>}
              />
            </ListItem>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white' }}>E-posta Bildirimleri</Typography>}
                  />
                  <Switch
                    edge="end"
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#90caf9'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#90caf9'
                      }
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white' }}>Anlık Bildirimler</Typography>}
                  />
                  <Switch
                    edge="end"
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#90caf9'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#90caf9'
                      }
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white' }}>Pazarlama Bildirimleri</Typography>}
                  />
                  <Switch
                    edge="end"
                    checked={notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#90caf9'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#90caf9'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Güvenlik Ayarları */}
            <ListItemButton 
              component="a" 
              href="/settings/security"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ListItemIcon>
                <SecurityIcon sx={{ color: '#90caf9' }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: 'white' }}>Güvenlik</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Şifre ve güvenlik ayarlarınızı yönetin</Typography>}
              />
            </ListItemButton>

            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Görünüm Ayarları */}
            <ListItem>
              <ListItemIcon>
                <PaletteIcon sx={{ color: '#90caf9' }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: 'white' }}>Görünüm</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tema ve görünüm tercihlerinizi ayarlayın</Typography>}
              />
            </ListItem>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white' }}>Karanlık Mod</Typography>}
                  />
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#90caf9'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#90caf9'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Dil Ayarları */}
            <ListItemButton 
              component="a" 
              href="/settings/language"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ListItemIcon>
                <LanguageIcon sx={{ color: '#90caf9' }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: 'white' }}>Dil</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Uygulama dilini değiştirin</Typography>}
              />
            </ListItemButton>

            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Ses Ayarları */}
            <ListItem>
              <ListItemIcon>
                <VolumeUpIcon sx={{ color: '#90caf9' }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: 'white' }}>Ses</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Bildirim ve sistem seslerini yönetin</Typography>}
              />
            </ListItem>
            <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemText 
                    primary={<Typography sx={{ color: 'white' }}>Sistem Sesleri</Typography>}
                  />
                  <Switch
                    edge="end"
                    checked={sound}
                    onChange={() => setSound(!sound)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#90caf9'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#90caf9'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Hesap Silme */}
            <ListItemButton 
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ 
                color: '#ff1744',
                '&:hover': {
                  backgroundColor: 'rgba(255, 23, 68, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <DeleteForeverIcon sx={{ color: '#ff1744' }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ color: '#ff1744' }}>Hesabı Sil</Typography>}
                secondary={<Typography sx={{ color: 'rgba(255, 23, 68, 0.7)' }}>Hesabınızı kalıcı olarak silin</Typography>}
              />
            </ListItemButton>
          </List>
        </Paper>

        <Alert 
          severity="info" 
          sx={{ 
            mt: 3,
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            color: 'white',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            '& .MuiAlert-icon': {
              color: '#90caf9'
            }
          }}
        >
          Ayarlarınızdaki değişiklikler otomatik olarak kaydedilir.
        </Alert>

        {/* Hesap Silme Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => {
            setDeleteDialogOpen(false);
            setPassword('');
            setError('');
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxWidth: 400,
              backgroundColor: '#0A1929',
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ color: '#ff1744' }}>
            Hesabı Sil
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
              Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              type="password"
              label="Şifrenizi Girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              sx={{ 
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#90caf9',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#90caf9',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => {
                setDeleteDialogOpen(false);
                setPassword('');
                setError('');
              }}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              İptal
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={!password || loading}
              sx={{
                bgcolor: '#ff1744',
                color: 'white',
                '&:hover': {
                  bgcolor: '#d50000'
                },
                '&:disabled': {
                  bgcolor: 'rgba(255, 23, 68, 0.3)',
                  color: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {loading ? 'Siliniyor...' : 'Hesabı Sil'}
            </Button>
          </DialogActions>
          
        </Dialog>
      </Container>
    </Box>
  );
};

export default Settings; 