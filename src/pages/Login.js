import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .required('E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: Yup.string()
    .required('Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoginError('');
      try {
        await login(values);
        toast.success('Giriş başarılı!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Giriş hatası:', error);
        
        // Hata mesajlarını kullanıcı dostu hale getir
        if (error.response?.status === 401) {
          setLoginError('E-posta adresi veya şifre hatalı');
        } else if (error.response?.status === 404) {
          setLoginError('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı');
        } else if (error.response?.status === 400) {
          setLoginError('Lütfen tüm alanları doğru şekilde doldurunuz');
        } else if (!navigator.onLine) {
          setLoginError('İnternet bağlantınızı kontrol ediniz');
        } else {
          setLoginError('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz');
        }
      }
    },
  });

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
            Giriş Yap
          </Typography>

          {loginError && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
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
              InputProps={{
                autoComplete: 'email'
              }}
            />

            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ mb: 3 }}
              disabled={formik.isSubmitting}
              InputProps={{
                autoComplete: 'current-password',
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
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Hesabınız yok mu?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#2196F3',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 