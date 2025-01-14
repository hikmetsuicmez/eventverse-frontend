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
  const [page, setPage] = useState(0);
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
    setPage(value - 1);
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
        searchText: searchParams.searchText || null,
        startDate: searchParams.startDate ? format(searchParams.startDate, 'yyyy-MM-dd') : null,
        endDate: searchParams.endDate ? format(searchParams.endDate, 'yyyy-MM-dd') : null,
        categories: searchParams.categories.length > 0 ? searchParams.categories : null,
        location: searchParams.location || null,
        minPrice: searchParams.minPrice !== 0 ? searchParams.minPrice : null,
        maxPrice: searchParams.maxPrice !== 1000 ? searchParams.maxPrice : null,
        minAge: searchParams.minAge !== 0 ? searchParams.minAge : null,
        maxAge: searchParams.maxAge !== 100 ? searchParams.maxAge : null,
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
    const filterData = {
        searchText: searchParams.searchText || null,
        startDate: searchParams.startDate || null,
        endDate: searchParams.endDate || null,
        categories: searchParams.categories.length > 0 ? searchParams.categories : null,
        location: searchParams.location || null,
        minPrice: searchParams.minPrice || null,
        maxPrice: searchParams.maxPrice || null,
        minAge: searchParams.minAge || null,
        maxAge: searchParams.maxAge || null,
        isPaid: searchParams.isPaid,
        hasAgeLimit: searchParams.hasAgeLimit
    };

    EventService.filterEvents(filterData, page, 8, searchParams.sortBy, searchParams.sortOrder)
        .then(response => {
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            setError('Etkinlikler yüklenirken bir hata oluştu');
        });
  }, [searchParams.searchText, searchParams.startDate, searchParams.endDate, searchParams.categories, searchParams.location, 
    searchParams.minPrice, searchParams.maxPrice, searchParams.minAge, searchParams.maxAge, searchParams.isPaid, searchParams.hasAgeLimit, searchParams.sortBy, searchParams.sortOrder, page]);

  const sortOptions = [
    { value: "date", label: "Tarih" },
    { value: "title", label: "İsim" },
    { value: "price", label: "Fiyat" },
    { value: "maxParticipants", label: "Katılımcı Sayısı" }
  ];

  const handleFilterRemove = (filterType) => {
    switch(filterType) {
      case 'categories':
        setSearchParams(prev => ({ ...prev, categories: [] }));
        break;
      case 'location':
        setSearchParams(prev => ({ ...prev, location: '' }));
        break;
      case 'search':
        setSearchParams(prev => ({ ...prev, searchText: '' }));
        break;
      case 'price':
        setSearchParams(prev => ({ ...prev, minPrice: 0, maxPrice: 1000 }));
        break;
      case 'age':
        setSearchParams(prev => ({ ...prev, minAge: 0, maxAge: 100 }));
        break;
      case 'paid':
        setSearchParams(prev => ({ ...prev, isPaid: null }));
        break;
      case 'ageLimit':
        setSearchParams(prev => ({ ...prev, hasAgeLimit: null }));
        break;
      case 'date':
        setSearchParams(prev => ({ ...prev, startDate: null, endDate: null }));
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0A1929', pt: '80px', pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ color: 'white', mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Etkinlikler
        </Typography>

        <Grid container spacing={3}>
          {/* Sol Taraf - Filtreler */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: '16px', position: 'sticky', top: '100px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterList sx={{ mr: 1 }} />
                <Typography variant="h6">Filtreler</Typography>
                <Button
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{ ml: 'auto' }}
                  size="small"
                >
                  Temizle
                </Button>
              </Box>

              <Stack spacing={2}>
                {/* Arama */}
                <TextField
                  fullWidth
                  label="Etkinlik Ara"
                  value={searchParams.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                {/* Tarih Seçimi */}
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={searchParams.startDate ? format(searchParams.startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  type="date"
                  value={searchParams.endDate ? format(searchParams.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Kategoriler */}
                <FormControl fullWidth>
                  <InputLabel>Kategoriler</InputLabel>
                  <Select
                    multiple
                    value={searchParams.categories}
                    onChange={(e) => handleFilterChange('categories', e.target.value)}
                    MenuProps={{ 
                      PaperProps: { 
                        style: { maxHeight: 300 },
                        onMouseLeave: () => document.activeElement.blur() 
                      } 
                    }}
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
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

                {/* Lokasyon */}
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

                {/* Fiyat Aralığı */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Fiyat Aralığı (₺)
                  </Typography>
                  <Slider
                    value={[searchParams.minPrice, searchParams.maxPrice]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minPrice', newValue[0]);
                      handleFilterChange('maxPrice', newValue[1]);
                    }}
                    min={0}
                    max={1000}
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Yaş Aralığı */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Yaş Aralığı
                  </Typography>
                  <Slider
                    value={[searchParams.minAge, searchParams.maxAge]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minAge', newValue[0]);
                      handleFilterChange('maxAge', newValue[1]);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Ücret ve Yaş Sınırı Switchleri */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={searchParams.isPaid}
                      onChange={(e) => handleFilterChange('isPaid', e.target.checked)}
                    />
                  }
                  label="Sadece Ücretli Etkinlikler"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={searchParams.hasAgeLimit}
                      onChange={(e) => handleFilterChange('hasAgeLimit', e.target.checked)}
                    />
                  }
                  label="Sadece Yaş Sınırlı Etkinlikler"
                />

                {/* Sıralama */}
                <FormControl fullWidth>
                  <InputLabel>Sıralama Kriteri</InputLabel>
                  <Select
                    value={searchParams.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
              </Stack>
            </Paper>
          </Grid>

          {/* Sağ Taraf - Etkinlik Listesi */}
          <Grid item xs={12} md={9}>
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
                  onDelete={() => handleFilterRemove(filter.type)}
                  sx={{ backgroundColor: '#f5f5f5' }}
                />
              ))}
            </Box>

            {/* Etkinlik Listesi */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ) : events.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Filtrelere uygun etkinlik bulunamadı.
              </Alert>
            ) : (
              <>
                <Grid container spacing={3}>
                  {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <EventCard event={event} />
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: 'white',
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                            }
                        }
                    }}
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Events; 