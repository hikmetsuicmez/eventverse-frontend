import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Slider,
  Stack,
  useTheme
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
  Favorite as FavoriteIcon,
  ZoomIn,
  ZoomOut,
  Crop,
  RotateLeft,
  RotateRight
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
import ReactCrop, { makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-hot-toast';

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
  const theme = useTheme();
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [crop, setCrop] = useState({
    unit: 'px',
    x: 0,
    y: 0,
    width: 200,
    height: 200
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
    fetchUserEvents();
    fetchFavorites();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await UserService.getProfile();
      if (response && response.data) {
        console.log('Backend doğum tarihi:', response.data.birthDate);
        setProfileData(response.data);
        setEditData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          birthDate: response.data.birthDate ? new Date(response.data.birthDate) : null
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
      const formattedData = {
        ...editData,
        birthDate: editData.birthDate ? format(new Date(editData.birthDate), 'yyyy-MM-dd') : null
      };
      const response = await UserService.updateProfile(formattedData);
      setProfileData(response.data);
      handleEditDialogClose();
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      setError('Profil güncellenirken bir hata oluştu');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Sadece JPEG, PNG ve JPG formatları desteklenmektedir');
        return;
      }

      setSelectedImage(file);
      setImageUploadDialog(true);
      setError('');
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
        const updatedProfileData = {
          ...profileData,
          profilePicture: response.data
        };
        setProfileData(updatedProfileData);
        
        const updatedUser = {
          ...authUser,
          profilePicture: response.data
        };
        updateUser(updatedUser);
        
        setImageUploadDialog(false);
        setSelectedImage(null);
        toast.success('Profil fotoğrafı başarıyla güncellendi');
      }
    } catch (error) {
      console.error('Fotoğraf yüklenemedi:', error);
      setError(error.response?.data?.message || 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Doğum tarihi belirtilmemiş';
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Doğum tarihi belirtilmemiş';
      return format(date, 'dd/MM/yyyy', { locale: tr });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return 'Geçersiz tarih';
    }
  };

  const handleImageMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleImageMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => {
    setImageRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setImageRotation((prev) => prev + 90);
  };

  const handleScaleChange = (event, newValue) => {
    setImageScale(newValue);
  };

  const resetImageSettings = () => {
    setImageScale(1);
    setImageRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomChange = (event, newValue) => {
    const size = Math.max(newValue, 10);
    setCrop(prev => ({
      ...prev,
      width: size,
      height: size,
      x: Math.max(0, prev.x + ((prev.width - size) / 2)),
      y: Math.max(0, prev.y + ((prev.height - size) / 2))
    }));
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
          bgcolor: '#0A1929'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      pt: '84px', 
      pb: 8, 
      bgcolor: '#0A1929', 
      minHeight: '100vh' 
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Sol Taraf - Profil Bilgileri */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#132f4c',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      sx={{
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
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
                      border: '4px solid #1976d2',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                  />
                </Badge>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>
                  {profileData?.firstName} {profileData?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {formatDate(profileData?.birthDate)}
                  </Typography>
                </Box>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditDialogOpen}
                  variant="outlined"
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: '#1976d2',
                    color: '#fff',
                    '&:hover': {
                      borderColor: '#1565c0',
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  Profili Düzenle
                </Button>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                  İletişim Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {profileData?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {profileData?.phoneNumber || 'Telefon numarası eklenmemiş'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                  İstatistikler
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        borderRadius: '12px'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {participatedEvents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        borderRadius: '12px'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {createdEvents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                        bgcolor: 'rgba(244, 67, 54, 0.08)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.12)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ fontSize: 20 }} /> {favorites.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#f44336' }}>
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
              elevation={3}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: '#132f4c',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': { bgcolor: '#1976d2' },
                  '& .MuiTab-root': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                      color: '#1976d2'
                    }
                  }
                }}
              >
                <Tab label="Katıldığım Etkinlikler" />
                <Tab label="Düzenlediğim Etkinlikler" />
              </Tabs>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#1976d2' }} />
                </Box>
              ) : (
                <Box>
                  {activeTab === 0 ? (
                    // Katıldığım Etkinlikler
                    <Grid container spacing={2}>
                      {participatedEvents.length === 0 ? (
                        <Grid item xs={12}>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
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
                                bgcolor: '#1e3a5f',
                                color: '#fff',
                                textDecoration: 'none',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100px',
                                  bgcolor: '#0A2540',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 2
                                }}
                              >
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                                  {event?.date ? new Date(event.date).getDate() : '--'}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500, textTransform: 'uppercase' }}>
                                  {event?.date ? format(new Date(event.date), 'MMM', { locale: tr }) : ''}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#fff', mt: 1, fontWeight: 600 }}>
                                  {event?.eventTime || '--:--'}
                                </Typography>
                              </Box>
                              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="h6" sx={{ color: '#fff' }}>
                                    {event.title}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <LocationOn sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {event.location}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Group sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {event.participantCount} Katılımcı
                                  </Typography>
                                </Box>
                                {event.isPaid && (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoney sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
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
                                bgcolor: '#1e3a5f',
                                color: '#fff',
                                textDecoration: 'none',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100px',
                                  bgcolor: '#0A2540',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 2
                                }}
                              >
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                                  {event?.date ? new Date(event.date).getDate() : '--'}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500, textTransform: 'uppercase' }}>
                                  {event?.date ? format(new Date(event.date), 'MMM', { locale: tr }) : ''}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#fff', mt: 1, fontWeight: 600 }}>
                                  {event?.eventTime || '--:--'}
                                </Typography>
                              </Box>
                              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="h6" sx={{ color: '#fff' }}>
                                    {event.title}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <LocationOn sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {event.location}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Group sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {event.participantCount} Katılımcı
                                  </Typography>
                                </Box>
                                {event.isPaid && (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoney sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.7)', mr: 0.5 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Profil Düzenleme Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              bgcolor: '#132f4c',
              color: '#fff'
            }
          }}
        >
          <DialogTitle sx={{ color: '#fff' }}>
            Profili Düzenle
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Soyad"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-posta"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={editData.phoneNumber}
                  onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <DatePicker
                    label="Doğum Tarihi"
                    value={editData.birthDate}
                    onChange={(newValue) => setEditData({ ...editData, birthDate: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                            '&:hover fieldset': { borderColor: '#1976d2' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                          '& .MuiInputBase-input': { color: '#fff' }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleEditDialogClose}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#fff' }
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleEditSubmit}
              variant="contained"
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profil Fotoğrafı Güncelleme Dialog */}
        <Dialog
          open={imageUploadDialog}
          onClose={() => {
            setImageUploadDialog(false);
            setSelectedImage(null);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#132f4c',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: '#fff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            pb: 2 
          }}>
            Profil Fotoğrafını Güncelle
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedImage && (
              <Box sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                my: 2
              }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '400px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Profil fotoğrafı önizleme"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Seçilen fotoğrafı profil fotoğrafınız olarak kaydetmek için "Kaydet" butonuna tıklayın
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <Button
              onClick={() => {
                setImageUploadDialog(false);
                setSelectedImage(null);
                setError('');
              }}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#fff' }
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleImageUploadSubmit}
              variant="contained"
              disabled={uploadLoading || !selectedImage}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              {uploadLoading ? 'Yükleniyor...' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile; 