import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
  Stack
} from '@mui/material';
import { Search, FilterList, Clear, ClearAll } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { tr } from 'date-fns/locale';
import EventService from '../services/event.service';
import EventCard from '../components/EventCard';
import { format } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useState({
    startDate: null,
    endDate: null,
    categories: [],
    location: '',
    searchText: '',
    minPrice: 0,
    maxPrice: 1000,
    minAge: 0,
    maxAge: 100,
    isPaid: null,
    hasAgeLimit: null,
    sortBy: 'date',
    sortOrder: 'ASC',
    page: 0,
    size: 8
  });

  const [selectedFilters, setSelectedFilters] = useState([]);

  const categories = [
    'Eğitim',
    'Spor',
    'Müzik',
    'Sanat',
    'Teknoloji',
    'İş',
    'Sağlık'
  ];

  const locations = [
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
    'Konya',
    'Gaziantep',
    'Şanlıurfa',
    'Kocaeli'
  ];

  const addSelectedFilter = (type, value) => {
    if (value) {
      setSelectedFilters(prev => [...prev.filter(f => f.type !== type), { type, value }]);
    } else {
      setSelectedFilters(prev => prev.filter(f => f.type !== type));
    }
  };

  const handleFilterChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value, page: 0 }));
    
    switch(field) {
      case 'categories':
        if (value && value.length > 0) {
          addSelectedFilter('categories', value.join(', '));
        } else {
          addSelectedFilter('categories', null);
        }
        break;
      case 'location':
        addSelectedFilter('location', value);
        break;
      case 'searchText':
        addSelectedFilter('search', value);
        break;
      case 'minPrice':
      case 'maxPrice':
        const priceRange = `${value[0]} TL - ${value[1]} TL`;
        addSelectedFilter('price', priceRange);
        break;
      case 'minAge':
      case 'maxAge':
        const ageRange = `${value[0]} - ${value[1]} yaş`;
        addSelectedFilter('age', ageRange);
        break;
      case 'isPaid':
        addSelectedFilter('paid', value ? 'Ücretli' : 'Ücretsiz');
        break;
      case 'hasAgeLimit':
        addSelectedFilter('ageLimit', value ? 'Yaş Sınırlı' : 'Yaş Sınırsız');
        break;
      default:
        break;
    }
  };

  const handleDateChange = (field, date) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: date,
      page: 0
    }));

    if (field === 'startDate' || field === 'endDate') {
      const start = field === 'startDate' ? date : searchParams.startDate;
      const end = field === 'endDate' ? date : searchParams.endDate;
      
      if (start && end) {
        const dateRange = `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
        addSelectedFilter('date', dateRange);
      } else {
        addSelectedFilter('date', null);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setSearchParams(prev => ({ ...prev, page: value - 1 }));
  };

  const clearFilters = () => {
    setSearchParams({
      startDate: null,
      endDate: null,
      categories: [],
      location: '',
      searchText: '',
      minPrice: 0,
      maxPrice: 1000,
      minAge: 0,
      maxAge: 100,
      isPaid: null,
      hasAgeLimit: null,
      sortBy: 'date',
      sortOrder: 'ASC',
      page: 0,
      size: 8
    });
    setSelectedFilters([]);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterData = {
        searchText: searchParams.searchText,
        startDate: searchParams.startDate ? format(searchParams.startDate, 'yyyy-MM-dd') : null,
        endDate: searchParams.endDate ? format(searchParams.endDate, 'yyyy-MM-dd') : null,
        categories: searchParams.categories,
        location: searchParams.location,
        minPrice: searchParams.minPrice || null,
        maxPrice: searchParams.maxPrice || null,
        minAge: searchParams.minAge || null,
        maxAge: searchParams.maxAge || null,
        isPaid: searchParams.isPaid,
        hasAgeLimit: searchParams.hasAgeLimit
      };

      const response = await EventService.filterEvents(
        filterData,
        searchParams.page,
        searchParams.size,
        searchParams.sortBy,
        searchParams.sortOrder
      );

      if (response?.data) {
        setEvents(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Etkinlikler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0A1929', pt: '80px', pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ color: 'white', mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Etkinlikler
        </Typography>

        {/* Filtreler */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterList sx={{ mr: 1 }} />
                <Typography variant="h6">Filtreler</Typography>
                <Button
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{ ml: 'auto' }}
                >
                  Filtreleri Temizle
                </Button>
              </Box>
            </Grid>

            {/* Arama */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Etkinlik Ara"
                value={searchParams.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Tarih Aralığı */}
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={searchParams.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={searchParams.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={searchParams.startDate || new Date()}
                />
              </LocalizationProvider>
            </Grid>

            {/* Kategoriler */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategoriler</InputLabel>
                <Select
                  multiple
                  value={searchParams.categories}
                  onChange={(e) => handleFilterChange('categories', e.target.value)}
                  renderValue={(selected) => (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Stack>
                  )}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Lokasyon */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={searchParams.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fiyat Aralığı */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Fiyat Aralığı (₺)</Typography>
              <Slider
                value={[searchParams.minPrice, searchParams.maxPrice]}
                onChange={(e, value) => handleFilterChange(['minPrice', 'maxPrice'], value)}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">{searchParams.minPrice}₺</Typography>
                <Typography variant="body2">{searchParams.maxPrice}₺</Typography>
              </Box>
            </Grid>

            {/* Yaş Aralığı */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Yaş Aralığı</Typography>
              <Slider
                value={[searchParams.minAge, searchParams.maxAge]}
                onChange={(e, value) => handleFilterChange(['minAge', 'maxAge'], value)}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">{searchParams.minAge} yaş</Typography>
                <Typography variant="body2">{searchParams.maxAge} yaş</Typography>
              </Box>
            </Grid>

            {/* Switchler */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchParams.isPaid || false}
                    onChange={(e) => handleFilterChange('isPaid', e.target.checked)}
                  />
                }
                label="Sadece Ücretli Etkinlikler"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchParams.hasAgeLimit || false}
                    onChange={(e) => handleFilterChange('hasAgeLimit', e.target.checked)}
                  />
                }
                label="Sadece Yaş Sınırlı Etkinlikler"
              />
            </Grid>

            {/* Sıralama */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sıralama Kriteri</InputLabel>
                <Select
                  value={searchParams.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="date">Tarih</MenuItem>
                  <MenuItem value="title">İsim</MenuItem>
                  <MenuItem value="price">Fiyat</MenuItem>
                  <MenuItem value="maxParticipants">Katılımcı Sayısı</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sıralama Yönü</InputLabel>
                <Select
                  value={searchParams.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <MenuItem value="ASC">Artan</MenuItem>
                  <MenuItem value="DESC">Azalan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Filtre etiketleri */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
          {selectedFilters.length > 0 && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearAll />}
              sx={{ mr: 2 }}
            >
              Filtreleri Temizle
            </Button>
          )}
          
          {selectedFilters.map((filter, index) => (
            <Chip
              key={index}
              label={`${filter.type === 'categories' ? 'Kategoriler' :
                      filter.type === 'location' ? 'Konum' :
                      filter.type === 'search' ? 'Arama' :
                      filter.type === 'price' ? 'Fiyat' :
                      filter.type === 'age' ? 'Yaş' :
                      filter.type === 'paid' ? 'Ücret' :
                      filter.type === 'ageLimit' ? 'Yaş Sınırı' :
                      filter.type === 'date' ? 'Tarih' : ''}: ${filter.value}`}
              onDelete={() => {
                switch(filter.type) {
                  case 'categories':
                    handleFilterChange('categories', []);
                    break;
                  case 'location':
                    handleFilterChange('location', '');
                    break;
                  case 'search':
                    handleFilterChange('searchText', '');
                    break;
                  case 'price':
                    handleFilterChange(['minPrice', 'maxPrice'], [0, 1000]);
                    break;
                  case 'age':
                    handleFilterChange(['minAge', 'maxAge'], [0, 100]);
                    break;
                  case 'paid':
                    handleFilterChange('isPaid', null);
                    break;
                  case 'ageLimit':
                    handleFilterChange('hasAgeLimit', null);
                    break;
                  case 'date':
                    handleDateChange('startDate', null);
                    handleDateChange('endDate', null);
                    break;
                  default:
                    break;
                }
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          ))}
        </Box>

        {/* Etkinlik Listesi */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>

            {events.length === 0 && (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Filtrelere uygun etkinlik bulunamadı.
                </Typography>
              </Box>
            )}

            {/* Sayfalama */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={searchParams.page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Events; 