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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0A1929',
        py: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: '16px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              color: '#fff',
              fontWeight: 600
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

          <form onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
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
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#90caf9',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#90caf9',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#f44336',
                },
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
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#90caf9',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#90caf9',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#f44336',
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                py: 1.5,
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                mb: 2
              }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Giriş Yap'}
            </Button>
          </form>

          <Typography
            align="center"
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              style={{
                color: '#90caf9',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Kayıt Ol
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 