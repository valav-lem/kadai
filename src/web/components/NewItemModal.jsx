import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Alert,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import SanitizerRoundedIcon from '@mui/icons-material/SanitizerRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function NewItemModal({ isOpen, onClose, onSave, itemToEdit = null }) {
  const { t } = useI18n();

  const [kind, setKind] = useState('service');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hsn, setHsn] = useState('');
  const [sac, setSac] = useState('');
  const [gstSlab, setGstSlab] = useState('18');
  const [priceRupees, setPriceRupees] = useState('');
  const [durationMin, setDurationMin] = useState('30');
  const [stockQty, setStockQty] = useState('10');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [bookableOnline, setBookableOnline] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (itemToEdit) {
        setKind(itemToEdit.kind || 'service');
        setName(itemToEdit.name || '');
        setDescription(itemToEdit.description || '');
        setHsn(itemToEdit.hsn || '');
        setSac(itemToEdit.sac || '');
        setGstSlab(String(parseInt(itemToEdit.gst_slab, 10) || 18));
        setPriceRupees(itemToEdit.price_paise ? (itemToEdit.price_paise / 100).toFixed(2) : '');
        setDurationMin(String(itemToEdit.duration_min || 30));
        setStockQty(String(itemToEdit.stock_qty != null ? itemToEdit.stock_qty : 10));
        setReorderPoint(String(itemToEdit.reorder_point != null ? itemToEdit.reorder_point : 5));
        setBookableOnline(itemToEdit.bookable_online !== false);
      } else {
        setKind('service');
        setName('');
        setDescription('');
        setHsn('');
        setSac('');
        setGstSlab('18');
        setPriceRupees('');
        setDurationMin('30');
        setStockQty('10');
        setReorderPoint('5');
        setBookableOnline(true);
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const pricePaise = Math.round(parseFloat(priceRupees) * 100);
      if (isNaN(pricePaise) || pricePaise < 0) {
        throw new Error('Please enter a valid price');
      }

      const payload = {
        kind,
        name: name.trim(),
        description: description ? description.trim() : null,
        gst_slab: parseFloat(gstSlab),
        price_paise: pricePaise,
        bookable_online: bookableOnline,
      };

      if (kind === 'product') {
        payload.hsn = hsn.trim();
        payload.stock_qty = parseInt(stockQty, 10) || 0;
        payload.reorder_point = parseInt(reorderPoint, 10) || 0;
      } else {
        payload.sac = sac.trim();
        payload.duration_min = parseInt(durationMin, 10) || 30;
      }

      await onSave(payload, itemToEdit ? itemToEdit.id : null);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(itemToEdit);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditing ? (
            <EditRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          ) : (
            <Inventory2RoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          )}
          <span>{isEditing ? `Edit ${itemToEdit.name}` : t('catalogue.addItem')}</span>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ fontWeight: 700, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Type Switcher (only when creating new item) */}
          {!isEditing ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B', mb: 1, fontSize: '0.84rem' }}>
                Type / வகை
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={kind === 'service' ? 'contained' : 'outlined'}
                    color={kind === 'service' ? 'primary' : 'inherit'}
                    startIcon={<ContentCutRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setKind('service')}
                    sx={{ py: 1, fontWeight: 700, borderRadius: 2, height: 40 }}
                  >
                    {t('catalogue.tab.services')}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={kind === 'product' ? 'contained' : 'outlined'}
                    color={kind === 'product' ? 'primary' : 'inherit'}
                    startIcon={<SanitizerRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setKind('product')}
                    sx={{ py: 1, fontWeight: 700, borderRadius: 2, height: 40 }}
                  >
                    {t('catalogue.tab.products')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B' }}>
                Category:
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', fontSize: '0.86rem' }}>
                {kind}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            required
            label={t('catalogue.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Haircut & Styling · முடி திருத்தம்"
          />

          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label={t('catalogue.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              {kind === 'product' ? (
                <TextField
                  fullWidth
                  size="small"
                  required
                  label={`${t('catalogue.hsn')} Code`}
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  placeholder="e.g. 33051010"
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  required
                  label={`${t('catalogue.sac')} Code`}
                  value={sac}
                  onChange={(e) => setSac(e.target.value)}
                  placeholder="e.g. 999721"
                />
              )}
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('catalogue.slab')}</InputLabel>
                <Select
                  value={gstSlab}
                  label={t('catalogue.slab')}
                  onChange={(e) => setGstSlab(e.target.value)}
                >
                  <MenuItem value="0">0% (Nil Rated)</MenuItem>
                  <MenuItem value="5">5% GST</MenuItem>
                  <MenuItem value="12">12% GST</MenuItem>
                  <MenuItem value="18">18% GST (Standard)</MenuItem>
                  <MenuItem value="28">28% GST</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ step: '0.01' }}
                label={t('catalogue.price')}
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="250.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={6}>
              {kind === 'service' ? (
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="number"
                  label={t('catalogue.duration')}
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="30"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('common.mins')}</InputAdornment>,
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="number"
                  label={t('catalogue.stock')}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  helperText="Owner stock count override"
                />
              )}
            </Grid>
          </Grid>

          {kind === 'product' && (
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t('catalogue.reorderPoint')}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              helperText="Alert threshold for low-stock warning"
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, height: 38, px: 2 }}>
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{ borderRadius: 2, px: 2.8, height: 38, fontWeight: 800 }}
          >
            {loading ? t('common.loading') : isEditing ? 'Save Changes' : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
