import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Avatar,
  Typography,
  Grid,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Fade,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Event as EventIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth,
  LocationOn,
  Group,
  AttachMoney,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import EventService from '../services/event.service';
import UserService from '../services/user.service';
import { Link } from 'react-router-dom';
import FavoriteService from '../services/favorite.service';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: null
  });
  const [imageUploadDialog, setImageUploadDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
    fetchUserEvents();
    fetchFavorites();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await UserService.getProfile();
      if (response && response.data) {
        console.log('Backend doğum tarihi:', response.data.firstName);
        setProfileData(response.data);
        setEditData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          birthDate: response.data.birthDate || ''
        });
      }
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      setError('Profil bilgileri alınamadı');
    }
  };

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const [participatedResponse, createdResponse] = await Promise.all([
        EventService.getMyEvents(),
        EventService.getMyCreatedEvents()
      ]);
      setParticipatedEvents(participatedResponse.data || []);
      setCreatedEvents(createdResponse.data || []);
    } catch (error) {
      console.error('Etkinlikler alınamadı:', error);
      setError('Etkinlikler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await FavoriteService.getFavorites();
      setFavorites(response || []);
    } catch (error) {
      console.error('Favoriler alınamadı:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setError('');
  };

  const handleEditSubmit = async () => {
    try {
      setError('');
      const response = await UserService.updateProfile(editData);
      setProfileData(response.data);
      handleEditDialogClose();
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      setError('Profil güncellenirken bir hata oluştu');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      setSelectedImage(file);
      setImageUploadDialog(true);
    }
  };

  const handleImageUploadSubmit = async () => {
    if (!selectedImage) return;

    setUploadLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      const response = await UserService.updateProfilePicture(formData);
      
      if (response && response.data) {
        // Profil verilerini güncelle
        const updatedProfileData = {
          ...profileData,
          profilePicture: response.data
        };
        setProfileData(updatedProfileData);
        
        // AuthContext'teki user bilgisini güncelle
        const updatedUser = {
          ...authUser,
          profilePicture: response.data
        };
        updateUser(updatedUser);
        
        // Dialog'u kapat ve seçili resmi temizle
        setImageUploadDialog(false);
        setSelectedImage(null);

        // Sayfayı yenile
        window.location.reload();
      }
    } catch (error) {
      console.error('Fotoğraf yüklenemedi:', error);
      setError('Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Doğum tarihi belirtilmemiş';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Doğum tarihi belirtilmemiş';
      return format(date, 'dd/MM/yyyy', { locale: tr });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return 'Geçersiz tarih';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          pt: '64px',
          bgcolor: '#001E3C'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#001E3C',
        pt: '84px',
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          {/* Sol Taraf - Profil Bilgileri */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                position: 'relative'
              }}
            >
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      sx={{
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#0d47a1' },
                        width: 32,
                        height: 32
                      }}
                      component="label"
                    >
                      <PhotoCamera sx={{ color: 'white', fontSize: 18 }} />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                      />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profileData?.profilePicture}
                    alt={profileData?.firstName}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      border: '4px solid white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                  />
                </Badge>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                  {profileData?.firstName} {profileData?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ color: '#1a237e', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.birthDate || 'Doğum tarihi belirtilmemiş'}
                  </Typography>
                </Box>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditDialogOpen}
                  variant="outlined"
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      bgcolor: 'rgba(26, 35, 126, 0.04)'
                    }
                  }}
                >
                  Profili Düzenle
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#1a237e', mb: 2, fontWeight: 600 }}>
                  İletişim Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ color: '#1a237e', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#1a237e', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData?.phoneNumber || 'Telefon numarası eklenmemiş'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#1a237e', mb: 2, fontWeight: 600 }}>
                  İstatistikler
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(26, 35, 126, 0.04)',
                        borderRadius: '12px'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                        {participatedEvents.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Katıldığım
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(26, 35, 126, 0.04)',
                        borderRadius: '12px'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                        {createdEvents.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Düzenlediğim
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      component={Link}
                      to="/favorites"
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(255, 23, 68, 0.04)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        '&:hover': {
                          bgcolor: 'rgba(255, 23, 68, 0.08)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#ff1744', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ fontSize: 20 }} /> {favorites.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#ff1744' }}>
                        Favori Etkinliklerim
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Sağ Taraf - Etkinlikler */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': { bgcolor: '#1a237e' },
                  '& .MuiTab-root': { color: '#1a237e' }
                }}
              >
                <Tab label="Katıldığım Etkinlikler" />
                <Tab label="Düzenlediğim Etkinlikler" />
              </Tabs>

              <Box>
                {activeTab === 0 ? (
                  // Katıldığım Etkinlikler
                  <Grid container spacing={2}>
                    {participatedEvents.length === 0 ? (
                      <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                          Henüz bir etkinliğe katılmadınız.
                        </Typography>
                      </Grid>
                    ) : (
                      participatedEvents.map((event) => (
                        <Grid item xs={12} key={event.id}>
                          <Card
                            component={Link}
                            to={`/events/${event.id}`}
                            sx={{
                              display: 'flex',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              textDecoration: 'none',
                              transition: 'transform 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: '120px',
                                bgcolor: '#0A2540',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 2,
                                color: 'white'
                              }}
                            >
                              <CalendarMonth sx={{ fontSize: 32, mb: 1 }} />
                              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                                {formatDate(event.startDate)}
                              </Typography>
                            </Box>
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="h6" sx={{ color: '#1a237e' }}>
                                  {event.title}
                                </Typography>
                                <Avatar
                                  src={profileData?.profilePicture}
                                  alt={profileData?.firstName}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOn sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.location}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Group sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.participantCount} Katılımcı
                                </Typography>
                              </Box>
                              {event.isPaid && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AttachMoney sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {event.price} TL
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                ) : (
                  // Düzenlediğim Etkinlikler
                  <Grid container spacing={2}>
                    {createdEvents.length === 0 ? (
                      <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                          Henüz bir etkinlik düzenlemediniz.
                        </Typography>
                      </Grid>
                    ) : (
                      createdEvents.map((event) => (
                        <Grid item xs={12} key={event.id}>
                          <Card
                            component={Link}
                            to={`/events/${event.id}`}
                            sx={{
                              display: 'flex',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              textDecoration: 'none',
                              transition: 'transform 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: '120px',
                                bgcolor: '#0A2540',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 2,
                                color: 'white'
                              }}
                            >
                              <CalendarMonth sx={{ fontSize: 32, mb: 1 }} />
                              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                                {formatDate(event.startDate)}
                              </Typography>
                            </Box>
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="h6" sx={{ color: '#1a237e' }}>
                                  {event.title}
                                </Typography>
                                <Avatar
                                  src={profileData?.profilePicture}
                                  alt={profileData?.firstName}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOn sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.location}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Group sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.participantCount} Katılımcı
                                </Typography>
                              </Box>
                              {event.isPaid && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AttachMoney sx={{ fontSize: 18, color: '#1a237e', mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {event.price} TL
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Profil Düzenleme Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
        aria-labelledby="edit-profile-dialog-title"
      >
        <DialogTitle id="edit-profile-dialog-title" sx={{ pb: 1 }}>Profili Düzenle</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefon"
                value={editData.phoneNumber}
                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                  label="Doğum Tarihi"
                  value={editData.birthDate}
                  onChange={(date) => setEditData({ ...editData, birthDate: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined"
                    }
                  }}
                  maxDate={new Date()}
                  minDate={new Date(1900, 0, 1)}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleEditDialogClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' },
              px: 3
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fotoğraf Yükleme Dialog */}
      <Dialog
        open={imageUploadDialog}
        onClose={() => setImageUploadDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
        aria-labelledby="upload-photo-dialog-title"
      >
        <DialogTitle id="upload-photo-dialog-title">Profil Fotoğrafını Güncelle</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {selectedImage && (
            <Box
              sx={{
                width: '100%',
                height: 200,
                backgroundImage: `url(${URL.createObjectURL(selectedImage)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                mb: 2
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setImageUploadDialog(false);
              setError('');
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleImageUploadSubmit}
            variant="contained"
            disabled={uploadLoading}
            sx={{
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' },
              px: 3
            }}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 