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
  Alert
} from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import EventService from '../services/event.service';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
    location: '',
    address: '',
    maxParticipants: 1,
    category: '',
    eventImage: '',
    hasAgeLimit: false,
    ageLimit: 0,
    isPaid: false,
    price: 0
  });

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

  const validateImageUrl = (url) => {
    const pattern = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*\.(jpg|jpeg|png|gif)$/;
    return pattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coordinates) {
      setError('Lütfen haritadan konum seçiniz');
      return;
    }

    if (formData.eventImage && !validateImageUrl(formData.eventImage)) {
      setError('Lütfen geçerli bir resim URL\'si giriniz (jpg, jpeg, png veya gif)');
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

      await EventService.createEvent(eventData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handlePositionSelect = (pos) => {
    setCoordinates(pos);
  };

  return (
    <Box sx={{ pt: '84px' }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', maxWidth: 800, mx: 'auto', my: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 600, mb: 4 }}>
          Yeni Etkinlik Oluştur
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
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
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Etkinlik Görseli URL"
                name="eventImage"
                value={formData.eventImage}
                onChange={handleChange}
                error={formData.eventImage && !validateImageUrl(formData.eventImage)}
                helperText={
                  formData.eventImage && !validateImageUrl(formData.eventImage)
                    ? 'Geçerli bir resim URL\'si giriniz (örn: https://example.com/image.jpg)'
                    : 'Örnek: https://domain.com/image.jpg (jpg, jpeg, png veya gif)'
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasAgeLimit}
                    onChange={handleChange}
                    name="hasAgeLimit"
                  />
                }
                label="Yaş Sınırı Var Mı?"
              />
              {formData.hasAgeLimit && (
                <TextField
                  fullWidth
                  label="Yaş Limiti"
                  name="ageLimit"
                  type="number"
                  value={formData.ageLimit}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="0-100 arası"
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPaid}
                    onChange={handleChange}
                    name="isPaid"
                  />
                }
                label="Ücretli Mi?"
              />
              {formData.isPaid && (
                <TextField
                  fullWidth
                  label="Ücret (TL)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                  inputProps={{ min: 0, max: 100000 }}
                  helperText="0-100.000 TL arası"
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: '#1a237e' }}>
                Etkinlik Konumu
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Harita üzerinde etkinliğin gerçekleşeceği konumu işaretleyin
              </Typography>
              <Box sx={{ height: 400, borderRadius: '16px', overflow: 'hidden' }}>
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
                  mt: 3,
                  bgcolor: '#1a237e',
                  '&:hover': {
                    bgcolor: '#0d47a1'
                  },
                  height: '48px',
                  borderRadius: '8px'
                }}
              >
                Etkinlik Oluştur
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EventForm; 