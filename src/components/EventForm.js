import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Container
} from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/event.service';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CloudUpload, Clear } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

// Leaflet ikon ayarları
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ onLocationSelect, selectedPosition }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const center = [41.0082, 28.9784]; // İstanbul koordinatları

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(center, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Haritaya tıklama olayını dinle
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Önceki marker'ı kaldır
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Yeni marker ekle
        markerRef.current = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup('Etkinlik Konumu')
          .openPopup();
        
        // Koordinatları parent component'e bildir
        onLocationSelect([lat, lng]);
      });
    }

    // Eğer seçili konum varsa marker'ı göster
    if (selectedPosition && mapRef.current) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = L.marker(selectedPosition, { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup('Etkinlik Konumu')
        .openPopup();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationSelect, selectedPosition]);

  return (
    <Box sx={{ position: 'relative', height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} />
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          p: 1,
          borderRadius: 1,
          fontSize: '0.875rem',
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        Haritaya tıklayarak etkinlik konumunu seçin
      </Box>
    </Box>
  );
};

const EventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    eventTime: '',
    location: '',
    address: '',
    maxParticipants: 1,
    category: '',
    hasAgeLimit: false,
    ageLimit: 0,
    isPaid: false,
    price: 0
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [position, setPosition] = useState([41.0082, 28.9784]); // İstanbul varsayılan konum

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB kontrol
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Sadece JPEG, PNG ve GIF formatları desteklenmektedir');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coordinates) {
      setError('Lütfen haritadan konum seçiniz');
      return;
    }

    try {
      const eventData = {
        ...formData,
        coordinates: {
          latitude: coordinates[0],
          longitude: coordinates[1],
          city: formData.location.split(',')[0].trim(),
          country: 'Türkiye'
        }
      };

      // Backend validasyonları
      if (formData.hasAgeLimit && (!formData.ageLimit || formData.ageLimit < 0 || formData.ageLimit > 100)) {
        setError('Yaş limiti 0-100 arasında olmalıdır');
        return;
      }

      if (formData.isPaid && (!formData.price || formData.price < 0 || formData.price > 100000)) {
        setError('Ücret 0-100.000 TL arasında olmalıdır');
        return;
      }

      if (formData.maxParticipants < 1 || formData.maxParticipants > 1000) {
        setError('Katılımcı sayısı 1-1000 arasında olmalıdır');
        return;
      }

      // Önce event'i oluştur
      const eventResponse = await EventService.createEvent(eventData);
      
      // Eğer resim seçildiyse yükle
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);
        await EventService.uploadEventImage(eventResponse.data.id, imageFormData);
      }

      navigate('/dashboard');
      toast.success('Etkinlik başarıyla oluşturuldu!');
    } catch (error) {
      setError(error.response?.data?.message || 'Bir hata oluştu');
      toast.error('Etkinlik oluşturulurken bir hata oluştu.');
    }
  };

  const handlePositionSelect = (pos) => {
    setCoordinates(pos);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0A1929',
      pt: '84px',
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: '24px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              mb: 4,
              background: 'linear-gradient(45deg, #90caf9, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Yeni Etkinlik Oluştur
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                bgcolor: 'rgba(211, 47, 47, 0.1)',
                color: '#ff1744',
                '& .MuiAlert-icon': {
                  color: '#ff1744'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Etkinlik Başlığı"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  inputProps={{ maxLength: 500 }}
                  helperText="En fazla 500 karakter"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Etkinlik Açıklaması"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  inputProps={{ maxLength: 500 }}
                  helperText="En fazla 500 karakter"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tarih"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Saat"
                  name="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{
                    step: 300
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Konum (Şehir, İlçe)"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  helperText="Örnek: İstanbul, Kadıköy"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres Detayı"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Kategori</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#90caf9',
                      },
                      '& .MuiSelect-icon': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  >
                    <MenuItem value="Eğitim">Eğitim</MenuItem>
                    <MenuItem value="Teknoloji">Teknoloji</MenuItem>
                    <MenuItem value="Sanat">Sanat</MenuItem>
                    <MenuItem value="Spor">Spor</MenuItem>
                    <MenuItem value="İş">İş</MenuItem>
                    <MenuItem value="Eğlence">Eğlence</MenuItem>
                    <MenuItem value="Kültür">Kültür</MenuItem>
                    <MenuItem value="Seyahat">Seyahat</MenuItem>
                    <MenuItem value="Diğer">Diğer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maksimum Katılımcı Sayısı"
                  name="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 1000 }}
                  helperText="1-1000 arası"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  border: '2px dashed rgba(255, 255, 255, 0.2)', 
                  borderRadius: 3, 
                  p: 4, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    borderColor: '#90caf9',
                    bgcolor: 'rgba(144, 202, 249, 0.08)'
                  }
                }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="event-image-input"
                  />
                  <label htmlFor="event-image-input">
                    {previewUrl ? (
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={previewUrl}
                          alt="Event preview"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            '&:hover': { 
                              bgcolor: 'rgba(0,0,0,0.8)',
                              transform: 'scale(1.1)'
                            }
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedImage(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <Clear sx={{ color: 'white' }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUpload sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.7)', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                          Etkinlik Görseli Yükle
                        </Typography>
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                          PNG, JPG veya GIF (max. 10MB)
                        </Typography>
                      </Box>
                    )}
                  </label>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 3
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.hasAgeLimit}
                        onChange={handleChange}
                        name="hasAgeLimit"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#90caf9',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#90caf9',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: 'white' }}>
                        Yaş Sınırı Var Mı?
                      </Typography>
                    }
                  />
                  {formData.hasAgeLimit && (
                    <TextField
                      fullWidth
                      label="Yaş Limiti"
                      name="ageLimit"
                      type="number"
                      value={formData.ageLimit}
                      onChange={handleChange}
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#90caf9',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                      inputProps={{ min: 0, max: 100 }}
                      helperText="0-100 arası"
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 3
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPaid}
                        onChange={handleChange}
                        name="isPaid"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#90caf9',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#90caf9',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: 'white' }}>
                        Ücretli Mi?
                      </Typography>
                    }
                  />
                  {formData.isPaid && (
                    <TextField
                      fullWidth
                      label="Ücret (TL)"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#90caf9',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>₺</InputAdornment>,
                      }}
                      inputProps={{ min: 0, max: 100000 }}
                      helperText="0-100.000 TL arası"
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', mt: 2 }}>
                  Etkinlik Konumu
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Harita üzerinde etkinliğin gerçekleşeceği konumu işaretleyin
                </Typography>
                <Box sx={{ 
                  height: 400, 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <MapComponent onLocationSelect={handlePositionSelect} selectedPosition={coordinates} />
                </Box>
                {!coordinates && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Lütfen haritada bir konum seçin
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    mt: 4,
                    height: '56px',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  Etkinlik Oluştur
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EventForm; 