import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Chip,
  Paper,
  IconButton,
  Grid,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  shopConfig,
  onComplete,
}) {
  const { t, formatMoney } = useI18n();
  const canvasRef = useRef(null);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [isRecording, setIsRecording] = useState(false);

  const amountPaise = booking?.price_paise || 0;
  const amountRupees = (amountPaise / 100).toFixed(2);
  const upiId = shopConfig?.upi_id || 'annachikadai@okhdfcbank';
  const shopName = shopConfig?.legal_name || 'Kadai Shop';

  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amountRupees}&tn=Booking_${booking?.id || 'Bill'}&cu=INR`;

  useEffect(() => {
    if (isOpen && canvasRef.current && paymentMode === 'upi') {
      QRCode.toCanvas(canvasRef.current, upiPayload, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      }).catch((err) => console.error('QR rendering error:', err));
    }
  }, [isOpen, paymentMode, upiPayload]);

  if (!isOpen || !booking) return null;

  const handleRecordPayment = async () => {
    setIsRecording(true);
    try {
      await onComplete(booking.id, paymentMode, amountPaise);
      onClose();
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentsRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          <span>{t('payment.title')}</span>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3, textAlign: 'center' }}>
        {/* Customer & Amount Summary */}
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
          {booking.customer_name} • {booking.item_name}
        </Typography>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '2.2rem',
            color: '#0F172A',
            letterSpacing: '-0.03em',
            my: 0.5,
          }}
        >
          {formatMoney(amountPaise)}
        </Typography>

        <Chip
          label={`${booking.gst_slab}% GST included`}
          size="small"
          sx={{
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.74rem',
            height: 22,
            mb: 2.5,
          }}
        />

        {/* Payment Modes Toggle */}
        <Grid container spacing={1} sx={{ mb: 2.5 }}>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={paymentMode === 'upi' ? 'contained' : 'outlined'}
              color={paymentMode === 'upi' ? 'primary' : 'inherit'}
              startIcon={<QrCode2RoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setPaymentMode('upi')}
              sx={{ py: 0.8, fontSize: '0.82rem', fontWeight: 700, borderRadius: 2 }}
            >
              {t('payment.upiQr')}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={paymentMode === 'cash' ? 'contained' : 'outlined'}
              color={paymentMode === 'cash' ? 'primary' : 'inherit'}
              startIcon={<PaymentsRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setPaymentMode('cash')}
              sx={{ py: 0.8, fontSize: '0.82rem', fontWeight: 700, borderRadius: 2 }}
            >
              {t('payment.cash')}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={paymentMode === 'card' ? 'contained' : 'outlined'}
              color={paymentMode === 'card' ? 'primary' : 'inherit'}
              startIcon={<CreditCardRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setPaymentMode('card')}
              sx={{ py: 0.8, fontSize: '0.82rem', fontWeight: 700, borderRadius: 2 }}
            >
              {t('payment.card')}
            </Button>
          </Grid>
        </Grid>

        {/* Mode Details Display */}
        {paymentMode === 'upi' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <canvas ref={canvasRef} style={{ width: 180, height: 180, borderRadius: 8 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B', mt: 1, fontSize: '0.82rem' }}>
              {t('payment.upiInstructions')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.4 }}>
              UPI ID: <strong style={{ color: '#0F172A' }}>{upiId}</strong>
            </Typography>
          </Paper>
        )}

        {paymentMode === 'cash' && (
          <Box
            sx={{
              p: 2.5,
              backgroundColor: '#F0FDF4',
              color: '#16A34A',
              borderRadius: 2.5,
              border: '1px solid #DCFCE7',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            💵 Collect cash of {formatMoney(amountPaise)} at the counter.
          </Box>
        )}

        {paymentMode === 'card' && (
          <Box
            sx={{
              p: 2.5,
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            💳 Swipe on counter POS terminal for {formatMoney(amountPaise)}.
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, height: 38, px: 2 }}>
          {t('common.close')}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={isRecording}
          onClick={handleRecordPayment}
          startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 2, px: 2.8, height: 38, fontWeight: 800 }}
        >
          {isRecording ? t('common.loading') : t('payment.paid')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
