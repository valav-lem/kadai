import React, { useState, useEffect, useRef } from 'react';
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
  Select,
  MenuItem,
  IconButton,
  Alert,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SanitizerRoundedIcon from '@mui/icons-material/SanitizerRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function ProductSaleModal({
  isOpen,
  onClose,
  product,
  customers = [],
  shopConfig,
  onSaleComplete,
}) {
  const { t, formatMoney } = useI18n();
  const canvasRef = useRef(null);

  const [qty, setQty] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('walkin');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxQty = product?.stock_qty || 0;
  const totalPricePaise = (product?.price_paise || 0) * qty;
  const totalRupees = (totalPricePaise / 100).toFixed(2);
  const upiId = shopConfig?.upi_id || 'annachikadai@okhdfcbank';
  const shopName = shopConfig?.legal_name || 'Kadai Shop';

  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${totalRupees}&tn=Product_Sale_${product?.name || 'Retail'}&cu=INR`;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setSelectedCustomerId('walkin');
      setPaymentMode('cash');
      setError(null);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen && canvasRef.current && paymentMode === 'upi') {
      QRCode.toCanvas(canvasRef.current, upiPayload, {
        width: 160,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      }).catch((err) => console.error('QR error:', err));
    }
  }, [isOpen, paymentMode, upiPayload]);

  if (!isOpen || !product) return null;

  const handleSale = async () => {
    if (qty <= 0 || qty > maxQty) {
      setError(`Quantity must be between 1 and available stock (${maxQty})`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSaleComplete({
        productId: product.id,
        productName: product.name,
        qty,
        totalPaise: totalPricePaise,
        paymentMode,
        customerId: selectedCustomerId !== 'walkin' ? selectedCustomerId : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record product sale');
    } finally {
      setLoading(false);
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
          <SanitizerRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          <span>{t('catalogue.productSaleTitle')}</span>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ fontWeight: 700, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Product Details Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
              {product.name}
            </Typography>
            <Chip
              label={product.hsn || 'HSN: 3305'}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.74rem', height: 22, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Unit: <strong style={{ color: '#0F172A' }}>{formatMoney(product.price_paise)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: maxQty < 5 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
              {maxQty} in stock
            </Typography>
          </Box>
        </Paper>

        {/* Quantity Stepper */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748B', mb: 1 }}>
            {t('catalogue.saleQuantity')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              sx={{ minWidth: 40, height: 40, borderRadius: 2, fontSize: '1.1rem', fontWeight: 800 }}
            >
              -
            </Button>
            <TextField
              size="small"
              type="number"
              value={qty}
              inputProps={{ min: 1, max: maxQty, style: { textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' } }}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setQty(Math.min(maxQty, Math.max(1, val)));
              }}
              sx={{ width: 80 }}
            />
            <Button
              variant="outlined"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              sx={{ minWidth: 40, height: 40, borderRadius: 2, fontSize: '1.1rem', fontWeight: 800 }}
            >
              +
            </Button>

            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Total Payable
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {formatMoney(totalPricePaise)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Customer Selector */}
        <FormControl fullWidth size="small">
          <InputLabel>{t('booking.selectCustomer')}</InputLabel>
          <Select
            value={selectedCustomerId}
            label={t('booking.selectCustomer')}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <MenuItem value="walkin">👤 Walk-in Retail Customer</MenuItem>
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.mobile}) {c.gstin ? `[B2B: ${c.gstin}]` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Payment Modes */}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748B', mb: 1 }}>
            {t('payment.mode')}
          </Typography>
          <Grid container spacing={1}>
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
        </Box>

        {/* Dynamic UPI QR */}
        {paymentMode === 'upi' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <canvas ref={canvasRef} style={{ width: 150, height: 150, borderRadius: 8 }} />
            <Typography variant="caption" sx={{ color: '#64748B', mt: 0.8 }}>
              UPI ID: <strong style={{ color: '#0F172A' }}>{upiId}</strong> ({formatMoney(totalPricePaise)})
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, height: 38, px: 2 }}>
          {t('common.cancel')}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={loading || maxQty <= 0}
          onClick={handleSale}
          startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 2, px: 2.5, height: 38, fontWeight: 800 }}
        >
          {loading ? t('common.loading') : `Record Sale (${formatMoney(totalPricePaise)})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
