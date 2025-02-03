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
  Stack,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search, FilterList, Clear, ClearAll, LocationOn, CalendarToday, Category, Event } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { tr } from 'date-fns/locale';
import EventService from '../services/event.service';
import EventCard from '../components/EventCard';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
    size: 9
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

  const addSelectedFilter = (type, value) => {
    if (value) {
      setSelectedFilters(prev => [...prev.filter(f => f.type !== type), { type, value }]);
    } else {
      setSelectedFilters(prev => prev.filter(f => f.type !== type));
    }
  };

  const handleFilterChange = (field, value) => {
    if (field === 'startDate' || field === 'endDate') {
      const date = value || null;
      setSearchParams(prev => ({ ...prev, [field]: date, page: 0 }));
      
      const start = field === 'startDate' ? date : searchParams.startDate;
      const end = field === 'endDate' ? date : searchParams.endDate;
      
      if (start && end) {
        const dateRange = `${format(new Date(start), 'dd MMMM yyyy', { locale: tr })} - ${format(new Date(end), 'dd MMMM yyyy', { locale: tr })}`;
        addSelectedFilter('date', dateRange);
      } else {
        addSelectedFilter('date', null);
      }
      return;
    }
    
    if (field === 'minPrice' || field === 'maxPrice') {
      const newValue = Array.isArray(value) ? value : [value, searchParams.maxPrice];
      setSearchParams(prev => ({
        ...prev,
        minPrice: newValue[0],
        maxPrice: newValue[1],
        page: 0
      }));
      const priceRange = `${newValue[0]} TL - ${newValue[1]} TL`;
      addSelectedFilter('price', priceRange);
      return;
    }
    
    if (field === 'minAge' || field === 'maxAge') {
      const newValue = Array.isArray(value) ? value : [value, searchParams.maxAge];
      setSearchParams(prev => ({
        ...prev,
        minAge: newValue[0],
        maxAge: newValue[1],
        page: 0
      }));
      const ageRange = `${newValue[0]} - ${newValue[1]} yaş`;
      addSelectedFilter('age', ageRange);
      return;
    }
    
    setSearchParams(prev => ({ ...prev, [field]: value, page: 0 }));
    
    switch(field) {
      case 'categories':
        if (value && value.length > 0) {
          addSelectedFilter('categories', value.join(', '));
        } else {
          addSelectedFilter('categories', null);
        }
        break;
      case 'searchText':
        if (value) {
        addSelectedFilter('search', value);
        } else {
          addSelectedFilter('search', null);
        }
        break;
      case 'isPaid':
        if (value !== null) {
        addSelectedFilter('paid', value ? 'Ücretli' : 'Ücretsiz');
        } else {
          addSelectedFilter('paid', null);
        }
        break;
      case 'hasAgeLimit':
        if (value !== null) {
        addSelectedFilter('ageLimit', value ? 'Yaş Sınırlı' : 'Yaş Sınırsız');
        } else {
          addSelectedFilter('ageLimit', null);
        }
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
        const dateRange = `${format(start, 'dd MMMM yyyy', { locale: tr })} - ${format(end, 'dd MMMM yyyy', { locale: tr })}`;
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
      size: 9
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
        minPrice: searchParams.minPrice || null,
        maxPrice: searchParams.maxPrice || null,
        minAge: searchParams.minAge || null,
        maxAge: searchParams.maxAge || null,
        isPaid: searchParams.isPaid,
        hasAgeLimit: searchParams.hasAgeLimit
    };

    EventService.filterEvents(filterData, page, 9, searchParams.sortBy, searchParams.sortOrder)
        .then(response => {
            setEvents(response.data.content);
            setTotalPages(response.data.totalPages);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            setError('Etkinlikler yüklenirken bir hata oluştu');
        });
  }, [searchParams.searchText, searchParams.startDate, searchParams.endDate, searchParams.categories, searchParams.minPrice, searchParams.maxPrice, searchParams.minAge, searchParams.maxAge, searchParams.isPaid, searchParams.hasAgeLimit, searchParams.sortBy, searchParams.sortOrder, page]);

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
        addSelectedFilter('categories', null);
        break;
      case 'search':
        setSearchParams(prev => ({ ...prev, searchText: '' }));
        addSelectedFilter('search', null);
        break;
      case 'price':
        setSearchParams(prev => ({ ...prev, minPrice: 0, maxPrice: 1000 }));
        addSelectedFilter('price', null);
        break;
      case 'age':
        setSearchParams(prev => ({ ...prev, minAge: 0, maxAge: 100 }));
        addSelectedFilter('age', null);
        break;
      case 'paid':
        setSearchParams(prev => ({ ...prev, isPaid: null }));
        addSelectedFilter('paid', null);
        break;
      case 'ageLimit':
        setSearchParams(prev => ({ ...prev, hasAgeLimit: null }));
        addSelectedFilter('ageLimit', null);
        break;
      case 'date':
        setSearchParams(prev => ({ ...prev, startDate: null, endDate: null }));
        addSelectedFilter('date', null);
        break;
      default:
        break;
    }
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0A1929', pt: '80px', pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ color: 'white', mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Etkinlikler
        </Typography>

        <Grid container spacing={3}>
          {/* Sol Taraf - Filtreler */}
          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '16px', 
                position: 'sticky', 
                top: '100px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FilterList sx={{ mr: 1, color: 'white' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Filtreler</Typography>
                <Button
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{ 
                    ml: 'auto',
                    color: 'white',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                  size="small"
                >
                  Temizle
                </Button>
              </Box>

              <Stack spacing={3}>
                {/* Arama */}
                <TextField
                  fullWidth
                  label="Etkinlik Ara"
                  value={searchParams.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />

                {/* Tarih Seçimi */}
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  type="date"
                  value={searchParams.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  type="date"
                  value={searchParams.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  InputLabelProps={{ 
                    shrink: true,
                    sx: { color: 'rgba(255,255,255,0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                {/* Fiyat Aralığı */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                    Fiyat Aralığı (₺)
                  </Typography>
                  <Slider
                    value={[searchParams.minPrice, searchParams.maxPrice]}
                    onChange={(e, newValue) => {
                      setSearchParams(prev => ({
                        ...prev,
                        minPrice: newValue[0],
                        maxPrice: newValue[1]
                      }));
                      const priceRange = `${newValue[0]} TL - ${newValue[1]} TL`;
                      addSelectedFilter('price', priceRange);
                    }}
                    min={0}
                    max={1000}
                    step={10}
                    valueLabelDisplay="auto"
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-valueLabel': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {searchParams.minPrice} ₺
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {searchParams.maxPrice} ₺
                    </Typography>
                  </Box>
                </Box>

                {/* Yaş Aralığı */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                    Yaş Aralığı
                  </Typography>
                  <Slider
                    value={[searchParams.minAge, searchParams.maxAge]}
                    onChange={(e, newValue) => {
                      setSearchParams(prev => ({
                        ...prev,
                        minAge: newValue[0],
                        maxAge: newValue[1]
                      }));
                      const ageRange = `${newValue[0]} - ${newValue[1]} yaş`;
                      addSelectedFilter('age', ageRange);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-valueLabel': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {searchParams.minAge} yaş
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {searchParams.maxAge} yaş
                    </Typography>
                  </Box>
                </Box>

                {/* Kategoriler */}
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Kategoriler</InputLabel>
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
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                    renderValue={(selected) => (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small"
                            sx={{
                              bgcolor: 'primary.main',
                              color: 'white',
                            }}
                          />
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

                {/* Ücret ve Yaş Sınırı Switchleri */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={searchParams.isPaid}
                      onChange={(e) => handleFilterChange('isPaid', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label="Sadece Ücretli Etkinlikler"
                  sx={{ color: 'white' }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={searchParams.hasAgeLimit}
                      onChange={(e) => handleFilterChange('hasAgeLimit', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label="Sadece Yaş Sınırlı Etkinlikler"
                  sx={{ color: 'white' }}
                />

                {/* Sıralama */}
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sıralama Kriteri</InputLabel>
                  <Select
                    value={searchParams.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sıralama Yönü</InputLabel>
                  <Select
                    value={searchParams.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
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
              {selectedFilters.map((filter, index) => {
                let displayValue = filter.value;
                if (filter.type === 'price') {
                  displayValue = `Fiyat: ${filter.value}`;
                } else if (filter.type === 'age') {
                  displayValue = `Yaş: ${filter.value}`;
                } else if (filter.type === 'categories') {
                  displayValue = `Kategoriler: ${filter.value}`;
                } else if (filter.type === 'search') {
                  displayValue = `Arama: ${filter.value}`;
                } else if (filter.type === 'date') {
                  displayValue = `Tarih: ${filter.value}`;
                }

                return (
                <Chip
                  key={index}
                    label={displayValue}
                  onDelete={() => handleFilterRemove(filter.type)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                        '&:hover': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* Etkinlik Listesi */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress sx={{ color: 'white' }} />
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
                      <Paper
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            paddingTop: '60%',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={event.imageUrl || 'https://via.placeholder.com/300x200'}
                            alt={event.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              p: 2,
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Chip
                              label={event.category}
                              size="small"
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                              }}
                            />
                            {event.isPaid ? (
                              <Chip
                                label={`${event.price} ₺`}
                                size="small"
                                sx={{
                                  bgcolor: 'error.main',
                                  color: 'white',
                                }}
                              />
                            ) : (
                              <Chip
                                label="Ücretsiz"
                                size="small"
                                sx={{
                                  bgcolor: 'success.main',
                                  color: 'white',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            gutterBottom 
                            noWrap
                            sx={{ 
                              color: 'white',
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }}
                          >
                            {event.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              height: '40px'
                            }}
                          >
                            {event.description}
                          </Typography>
                          <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn fontSize="small" sx={{ color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                {event.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                              <CalendarToday fontSize="small" />
                              <Typography variant="body2">
                                {format(new Date(event.date), 'dd MMMM yyyy', { locale: tr })}
                              </Typography>
                            </Box>
                            {event.hasAgeLimit && (
                              <Chip
                                size="small"
                                label={`${event.ageLimit}+ Yaş`}
                                sx={{
                                  alignSelf: 'flex-start',
                                  bgcolor: 'warning.main',
                                  color: 'white',
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: 0,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                            },
                          }}
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Detayları Gör
                        </Button>
                      </Paper>
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
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
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