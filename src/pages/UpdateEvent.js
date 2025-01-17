import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    Paper,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import EventService from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import toast from 'react-hot-toast';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Close } from '@mui/icons-material';

const UpdateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [initialValues, setInitialValues] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await EventService.getEventById(id);
                const event = response.data;

                // Check if current user is the organizer
                if (event.organizer.id !== user?.id) {
                    navigate('/dashboard');
                    toast.error('Bu etkinliği düzenleme yetkiniz yok.');
                    return;
                }

                setInitialValues({
                    title: event.title,
                    description: event.description,
                    date: format(new Date(event.date), 'yyyy-MM-dd'),
                    eventTime: event.eventTime || '',
                    location: event.location,
                    maxParticipants: event.maxParticipants,
                    category: event.category,
                    paid: event.paid,
                    price: event.price || 0,
                    hasAgeLimit: event.hasAgeLimit,
                    ageLimit: event.ageLimit || 0,
                });

                setSelectedLocation({
                    lat: parseFloat(event.latitude),
                    lng: parseFloat(event.longitude)
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching event:', error);
                setError('Etkinlik bilgileri yüklenirken bir hata oluştu.');
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, user?.id, navigate]);

    const validationSchema = Yup.object({
        title: Yup.string().required('Başlık zorunludur'),
        description: Yup.string().required('Açıklama zorunludur'),
        date: Yup.date()
            .min(new Date(), 'Geçmiş bir tarih seçemezsiniz')
            .required('Tarih zorunludur'),
        eventTime: Yup.string().required('Saat zorunludur'),
        location: Yup.string().required('Konum zorunludur'),
        maxParticipants: Yup.number()
            .min(1, 'En az 1 katılımcı olmalıdır')
            .required('Katılımcı sayısı zorunludur'),
        category: Yup.string().required('Kategori zorunludur'),
        price: Yup.number().min(0, 'Fiyat 0\'dan küçük olamaz'),
        ageLimit: Yup.number().min(0, 'Yaş sınırı 0\'dan küçük olamaz')
    });

    const categories = [
        'Eğitim',
        'Spor',
        'Müzik',
        'Sanat',
        'Teknoloji',
        'Eğlence',
        'İş',
        'Sağlık'
    ];

    const handlePositionSelect = (pos) => {
        const [lat, lng] = pos;
        setSelectedLocation({ lat, lng });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
                return;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast.error('Sadece JPEG, JPG ve PNG formatları desteklenmektedir');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const formik = useFormik({
        initialValues: initialValues || {
            title: '',
            description: '',
            date: '',
            eventTime: '',
            location: '',
            maxParticipants: 1,
            category: 'Eğitim',
            paid: false,
            price: 0,
            hasAgeLimit: false,
            ageLimit: 0
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                let imageUrl = initialValues?.imageUrl;

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append('image', selectedImage);
                    const uploadResponse = await EventService.uploadEventImage(id, formData);
                    if (uploadResponse.data) {
                        imageUrl = uploadResponse.data;
                    }
                }

                const eventData = {
                    title: values.title,
                    description: values.description,
                    date: values.date,
                    eventTime: values.eventTime,
                    location: values.location,
                    maxParticipants: values.maxParticipants,
                    category: values.category,
                    paid: values.paid,
                    price: values.price,
                    hasAgeLimit: values.hasAgeLimit,
                    ageLimit: values.ageLimit,
                    imageUrl,
                    coordinates: {
                        latitude: selectedLocation.lat,
                        longitude: selectedLocation.lng,
                        city: values.location.split(',')[0].trim(),
                        country: 'Türkiye'
                    }
                };

                await EventService.updateEvent(id, eventData);
                toast.success('Etkinlik başarıyla güncellendi');
                navigate(`/events/${id}`);
            } catch (error) {
                console.error('Error updating event:', error);
                toast.error(error.response?.data?.message || 'Etkinlik güncellenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        }
    });

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    pt: '64px'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: '84px', pb: 8, bgcolor: '#0A1929', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h4" sx={{ mb: 4, color: '#1a237e', fontWeight: 600 }}>
                        Etkinliği Düzenle
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="title"
                                    name="title"
                                    label="Etkinlik Başlığı"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="description"
                                    name="description"
                                    label="Etkinlik Açıklaması"
                                    multiline
                                    rows={4}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="date"
                                    name="date"
                                    label="Tarih"
                                    type="date"
                                    value={formik.values.date}
                                    onChange={formik.handleChange}
                                    error={formik.touched.date && Boolean(formik.errors.date)}
                                    helperText={formik.touched.date && formik.errors.date}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="eventTime"
                                    name="eventTime"
                                    label="Saat"
                                    type="time"
                                    value={formik.values.eventTime}
                                    onChange={formik.handleChange}
                                    error={formik.touched.eventTime && Boolean(formik.errors.eventTime)}
                                    helperText={formik.touched.eventTime && formik.errors.eventTime}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="location"
                                    name="location"
                                    label="Konum"
                                    value={formik.values.location}
                                    onChange={formik.handleChange}
                                    error={formik.touched.location && Boolean(formik.errors.location)}
                                    helperText={formik.touched.location && formik.errors.location}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ height: 400, mb: 2 }}>
                                    <MapComponent
                                        onLocationSelect={handlePositionSelect}
                                        selectedPosition={selectedLocation}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="maxParticipants"
                                    name="maxParticipants"
                                    label="Maksimum Katılımcı Sayısı"
                                    type="number"
                                    value={formik.values.maxParticipants}
                                    onChange={formik.handleChange}
                                    error={formik.touched.maxParticipants && Boolean(formik.errors.maxParticipants)}
                                    helperText={formik.touched.maxParticipants && formik.errors.maxParticipants}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="category"
                                    name="category"
                                    select
                                    label="Kategori"
                                    value={formik.values.category}
                                    onChange={formik.handleChange}
                                    error={formik.touched.category && Boolean(formik.errors.category)}
                                    helperText={formik.touched.category && formik.errors.category}
                                >
                                    {categories.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.paid}
                                            onChange={formik.handleChange}
                                            name="paid"
                                        />
                                    }
                                    label="Ücretli Etkinlik"
                                />
                                {formik.values.paid && (
                                    <TextField
                                        fullWidth
                                        id="price"
                                        name="price"
                                        label="Fiyat"
                                        type="number"
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        error={formik.touched.price && Boolean(formik.errors.price)}
                                        helperText={formik.touched.price && formik.errors.price}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                                        }}
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.hasAgeLimit}
                                            onChange={formik.handleChange}
                                            name="hasAgeLimit"
                                        />
                                    }
                                    label="Yaş Sınırı"
                                />
                                {formik.values.hasAgeLimit && (
                                    <TextField
                                        fullWidth
                                        id="ageLimit"
                                        name="ageLimit"
                                        label="Minimum Yaş"
                                        type="number"
                                        value={formik.values.ageLimit}
                                        onChange={formik.handleChange}
                                        error={formik.touched.ageLimit && Boolean(formik.errors.ageLimit)}
                                        helperText={formik.touched.ageLimit && formik.errors.ageLimit}
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </Grid>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Etkinlik Görseli</Typography>
                                <Box
                                    sx={{
                                        border: '2px dashed #90caf9',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'rgba(144, 202, 249, 0.08)'
                                        }
                                    }}
                                    onClick={() => document.getElementById('event-image-input').click()}
                                >
                                    {imagePreview || initialValues?.imageUrl ? (
                                        <Box sx={{ position: 'relative' }}>
                                            <img
                                                src={imagePreview || initialValues?.imageUrl}
                                                alt="Etkinlik görseli"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(null);
                                                    setImagePreview(null);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    minWidth: 'auto',
                                                    p: '6px'
                                                }}
                                            >
                                                <Close />
                                            </Button>
                                        </Box>
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 48, color: '#90caf9', mb: 1 }} />
                                            <Typography>
                                                Görsel yüklemek için tıklayın veya sürükleyin
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                PNG, JPG veya JPEG (max. 5MB)
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                                <input
                                    type="file"
                                    id="event-image-input"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </Box>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(`/events/${id}`)}
                                        sx={{
                                            color: '#1a237e',
                                            borderColor: '#1a237e',
                                            '&:hover': {
                                                borderColor: '#0d47a1',
                                                bgcolor: 'rgba(26, 35, 126, 0.04)'
                                            }
                                        }}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#1a237e',
                                            '&:hover': { bgcolor: '#0d47a1' }
                                        }}
                                    >
                                        Güncelle
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default UpdateEvent; 