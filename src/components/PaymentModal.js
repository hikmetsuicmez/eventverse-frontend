import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const PaymentModal = ({ show, onClose, onSubmit, amount }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .required('Kart numarası zorunludur')
      .matches(/^\d{16}$/, 'Geçerli bir kart numarası giriniz'),
    cardHolderName: Yup.string()
      .required('Kart sahibinin adı zorunludur'),
    expireMonth: Yup.string()
      .required('Son kullanma ayı zorunludur')
      .matches(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay giriniz (01-12)'),
    expireYear: Yup.string()
      .required('Son kullanma yılı zorunludur')
      .matches(/^20\d{2}$/, 'Geçerli bir yıl giriniz'),
    cvc: Yup.string()
      .required('CVC zorunludur')
      .matches(/^\d{3}$/, 'Geçerli bir CVC giriniz'),
    address: Yup.string()
      .required('Adres bilgisi zorunludur')
      .min(10, 'Adres en az 10 karakter olmalıdır')
  });

  const formik = useFormik({
    initialValues: {
      cardNumber: '',
      cardHolderName: '',
      expireMonth: '',
      expireYear: '',
      cvc: '',
      address: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit({
          ...values,
          price: amount,
          installment: "1"
        });
      } catch (error) {
        console.error('Payment error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Dialog 
      open={show} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#132f4c',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: '#fff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        pb: 2
      }}>
        Ödeme Bilgileri
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.08)', 
                p: 2, 
                borderRadius: 2,
                mb: 2
              }}>
                <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                  Ödenecek Tutar: <strong>{amount} TL</strong>
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Fatura Adresi"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="cardNumber"
                label="Kart Numarası"
                value={formik.values.cardNumber}
                onChange={formik.handleChange}
                error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                placeholder="5528790000000008"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="cardHolderName"
                label="Kart Sahibinin Adı"
                value={formik.values.cardHolderName}
                onChange={formik.handleChange}
                error={formik.touched.cardHolderName && Boolean(formik.errors.cardHolderName)}
                helperText={formik.touched.cardHolderName && formik.errors.cardHolderName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                name="expireMonth"
                label="Ay"
                value={formik.values.expireMonth}
                onChange={formik.handleChange}
                error={formik.touched.expireMonth && Boolean(formik.errors.expireMonth)}
                helperText={formik.touched.expireMonth && formik.errors.expireMonth}
                placeholder="12"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                name="expireYear"
                label="Yıl"
                value={formik.values.expireYear}
                onChange={formik.handleChange}
                error={formik.touched.expireYear && Boolean(formik.errors.expireYear)}
                helperText={formik.touched.expireYear && formik.errors.expireYear}
                placeholder="2030"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                name="cvc"
                label="CVC"
                value={formik.values.cvc}
                onChange={formik.handleChange}
                error={formik.touched.cvc && Boolean(formik.errors.cvc)}
                helperText={formik.touched.cvc && formik.errors.cvc}
                placeholder="123"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: '#fff' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { color: '#fff' }
            }}
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PaymentModal; 