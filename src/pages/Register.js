import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { tr } from 'date-fns/locale';

const getPasswordErrors = (password) => {
  const errors = [];
  if (!password) {
    return ['Şifre boş olamaz'];
  }
  if (password.length < 6 || password.length > 20) {
    errors.push('Şifre 6-20 karakter arasında olmalıdır');
  }
  if (!/(?=.*[0-9])/.test(password)) {
    errors.push('En az bir rakam');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('En az bir küçük harf');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('En az bir büyük harf');
  }
  if (!/(?=.*[@#$%^&+=.])/.test(password)) {
    errors.push('En az bir özel karakter (@#$%^&+=.)');
  }
  return errors;
};

const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email boş olamaz')
    .email('Geçerli bir email adresi giriniz'),
  password: Yup.string()
    .required('Şifre boş olamaz')
    .min(6, 'Şifre 6-20 karakter arasında olmalıdır')
    .max(20, 'Şifre 6-20 karakter arasında olmalıdır')
    .test('password-validation', '', function (value) {
      const errors = getPasswordErrors(value);
      return errors.length === 0 ? true : this.createError({ message: errors.join(', ') });
    }),
  confirmPassword: Yup.string()
    .required('Şifre tekrarı boş olamaz')
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor'),
  firstName: Yup.string()
    .required('İsim boş olamaz')
    .min(2, 'İsim 2-50 karakter arasında olmalıdır')
    .max(50, 'İsim 2-50 karakter arasında olmalıdır'),
  lastName: Yup.string()
    .required('Soyisim boş olamaz')
    .min(2, 'Soyisim 2-50 karakter arasında olmalıdır')
    .max(50, 'Soyisim 2-50 karakter arasında olmalıdır'),
  phoneNumber: Yup.string()
    .required('Telefon numarası boş olamaz')
    .matches(/^[0-9]{10}$/, 'Telefon numarası 10 haneli olmalıdır'),
  address: Yup.string()
    .max(200, 'Adres en fazla 200 karakter olabilir'),
  birthDate: Yup.date()
    .required('Doğum tarihi boş olamaz')
    .max(new Date(), 'Doğum tarihi bugünden büyük olamaz')
    .min(new Date(1900, 0, 1), 'Geçerli bir doğum tarihi giriniz')
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      birthDate: null
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const formattedValues = {
          ...values,
          phoneNumber: values.phoneNumber.startsWith('+90') ? values.phoneNumber : '+90' + values.phoneNumber,
          birthDate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : null
        };
        console.log('Form verileri:', formattedValues);
        await register(formattedValues);
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
        navigate('/login');
      } catch (error) {
        console.error('Form gönderim hatası:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Kayıt sırasında bir hata oluştu.';
        toast.error(errorMessage);
      }
    },
  });

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    formik.setFieldValue('phoneNumber', value);
  };

  useEffect(() => {
    const errors = getPasswordErrors(formik.values.password);
    setPasswordErrors(errors);
  }, [formik.values.password]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #001E3C 0%, #0A47A9 100%)',
        pt: '64px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            mt: 4,
            mb: 4,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              color: '#001E3C',
              fontWeight: 700,
            }}
          >
            Kayıt Ol
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={formik.isSubmitting}
              />
              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={formik.isSubmitting}
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2 }}
              disabled={formik.isSubmitting}
            />

            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && (Boolean(formik.errors.password) || passwordErrors.length > 0)}
              helperText={
                formik.touched.password && (
                  <Box component="span" sx={{ display: 'block' }}>
                    {passwordErrors.map((error, index) => (
                      <Typography 
                        key={index} 
                        variant="caption" 
                        component="div"
                        sx={{ 
                          color: formik.values.password && !error.includes(error) ? 'success.main' : 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {error.includes(error) ? '✗' : '✓'} {error}
                      </Typography>
                    ))}
                  </Box>
                )
              }
              sx={{ mb: 2 }}
              disabled={formik.isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={formik.isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Şifre Tekrarı"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              sx={{ mb: 2 }}
              disabled={formik.isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={formik.isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Telefon Numarası"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={handlePhoneChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              sx={{ mb: 2 }}
              disabled={formik.isSubmitting}
              InputProps={{
                startAdornment: <InputAdornment position="start">+90</InputAdornment>,
              }}
              placeholder="5xxxxxxxxx"
            />

            <TextField
              fullWidth
              label="Adres (Opsiyonel)"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              disabled={formik.isSubmitting}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Doğum Tarihi"
                value={formik.values.birthDate}
                onChange={(date) => formik.setFieldValue('birthDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.birthDate && Boolean(formik.errors.birthDate),
                    helperText: formik.touched.birthDate && formik.errors.birthDate,
                    sx: { mb: 2 },
                    disabled: formik.isSubmitting
                  }
                }}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                disabled={formik.isSubmitting}
              />
            </LocalizationProvider>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                bgcolor: '#2196F3',
                color: 'white',
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1976D2',
                },
              }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Zaten hesabınız var mı?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#2196F3',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Giriş Yap
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 