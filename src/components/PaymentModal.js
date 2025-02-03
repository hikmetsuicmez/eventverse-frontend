import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography
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
      .matches(/^\d{3}$/, 'Geçerli bir CVC giriniz')
  });

  const formik = useFormik({
    initialValues: {
      cardNumber: '',
      cardHolderName: '',
      expireMonth: '',
      expireYear: '',
      cvc: '',
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
    <Dialog open={show} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ödeme Bilgileri</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ödenecek Tutar: {amount} TL
              </Typography>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentModal; 