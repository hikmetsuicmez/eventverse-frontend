import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    FormControlLabel,
    Switch,
    MenuItem,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import EventService from '../services/event.service';
import MapComponent from '../components/MapComponent';
import { toast } from 'react-hot-toast';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const EventForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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

    const initialValues = {
        title: '',
        description: '',
        date: '',
        eventTime: '',
        location: '',
        address: '',
        maxParticipants: 1,
        category: 'Eğitim',
        paid: false,
        price: 0,
        hasAgeLimit: false,
        ageLimit: 0,
        requiresApproval: false
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Başlık zorunludur'),
        description: Yup.string().required('Açıklama zorunludur'),
        date: Yup.date()
            .min(new Date(), 'Geçmiş bir tarih seçemezsiniz')
            .required('Tarih zorunludur'),
        eventTime: Yup.string().required('Saat zorunludur'),
        location: Yup.string().required('Konum zorunludur'),
        address: Yup.string().required('Adres detayı zorunludur'),
        maxParticipants: Yup.number()
            .min(1, 'En az 1 katılımcı olmalıdır')
            .required('Katılımcı sayısı zorunludur'),
        category: Yup.string().required('Kategori zorunludur'),
        price: Yup.number().min(0, 'Fiyat 0\'dan küçük olamaz'),
        ageLimit: Yup.number().min(0, 'Yaş sınırı 0\'dan küçük olamaz')
    });

    const handlePositionSelect = (pos) => {
        const [lat, lng] = pos;
        setSelectedLocation({ lat, lng });
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Lütfen geçerli bir resim dosyası seçin');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const eventData = {
                    title: values.title,
                    description: values.description,
                    date: values.date,
                    eventTime: values.eventTime,
                    location: values.location,
                    address: values.address,
                    maxParticipants: values.maxParticipants,
                    category: values.category,
                    paid: values.paid,
                    price: values.price,
                    hasAgeLimit: values.hasAgeLimit,
                    ageLimit: values.ageLimit,
                    requiresApproval: values.requiresApproval,
                    coordinates: {
                        latitude: selectedLocation?.lat,
                        longitude: selectedLocation?.lng,
                        city: values.location.split(',')[0].trim(),
                        country: 'Türkiye'
                    }
                };

                const response = await EventService.createEvent(eventData);
                
                if (selectedImage) {
                    const formData = new FormData();
                    formData.append('image', selectedImage);
                    await EventService.uploadEventImage(response.data.id, formData);
                }

                toast.success('Etkinlik başarıyla oluşturuldu');
                navigate('/dashboard');
            } catch (error) {
                console.error('Error creating event:', error);
                toast.error(error.response?.data?.message || 'Etkinlik oluşturulurken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Box sx={{ pt: '84px', pb: 8, bgcolor: '#0A1929', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h4" sx={{ mb: 4, color: '#ffffff', fontWeight: 600 }}>
                        Yeni Etkinlik Oluştur
                    </Typography>

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
                                    label="Konum (Şehir, İlçe)"
                                    value={formik.values.location}
                                    onChange={formik.handleChange}
                                    error={formik.touched.location && Boolean(formik.errors.location)}
                                    helperText={formik.touched.location && formik.errors.location}
                                    placeholder="Örnek: İstanbul, Kadıköy"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="address"
                                    name="address"
                                    label="Adres Detayı"
                                    multiline
                                    rows={2}
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    helperText={formik.touched.address && formik.errors.address}
                                    placeholder="Sokak, mahalle ve bina numarası gibi detaylı adres bilgilerini giriniz"
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

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.requiresApproval}
                                            onChange={formik.handleChange}
                                            name="requiresApproval"
                                        />
                                    }
                                    label="Katılımcı Onayı Gerekli"
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                />
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                                    Bu seçenek etkinleştirildiğinde, katılımcılar sizin onayınızdan sonra etkinliğe katılabilirler.
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        border: '2px dashed #90caf9',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        mb: 2,
                                        '&:hover': {
                                            bgcolor: 'rgba(144, 202, 249, 0.08)'
                                        }
                                    }}
                                    onClick={() => document.getElementById('event-image').click()}
                                >
                                    <input
                                        type="file"
                                        id="event-image"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageSelect}
                                    />
                                    <IconButton color="primary" component="span">
                                        <CloudUploadIcon />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        {imagePreview ? 'Resmi Değiştir' : 'Etkinlik Resmi Yükle'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                        PNG, JPG veya JPEG (max. 5MB)
                                    </Typography>
                                </Box>
                                {imagePreview && (
                                    <Box
                                        component="img"
                                        src={imagePreview}
                                        alt="Etkinlik önizleme"
                                        sx={{
                                            width: '100%',
                                            maxHeight: 300,
                                            objectFit: 'cover',
                                            borderRadius: 1
                                        }}
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{
                                            color: '#ffffff',
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
                                        disabled={loading}
                                        sx={{
                                            bgcolor: 'ffffff',
                                            '&:hover': { bgcolor: '#0d47a1' }
                                        }}
                                    >
                                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
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

export default EventForm; 