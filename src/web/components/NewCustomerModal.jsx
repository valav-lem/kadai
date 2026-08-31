import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function NewCustomerModal({ isOpen, onClose, onSave, customerToEdit = null }) {
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (customerToEdit) {
        setName(customerToEdit.name || '');
        setMobile(customerToEdit.mobile || '');
        setGstin(customerToEdit.gstin || '');
      } else {
        setName('');
        setMobile('');
        setGstin('');
      }
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('Customer name is required');
      if (!mobile.trim()) throw new Error('Mobile number is required');

      await onSave({
        name: name.trim(),
        mobile: mobile.trim(),
        gstin: gstin.trim() || null,
      }, customerToEdit ? customerToEdit.id : null);

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(customerToEdit);

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
          {isEditing ? (
            <EditRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          ) : (
            <PersonAddRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          )}
          <span>{isEditing ? `Edit ${customerToEdit.name}` : t('customers.add')}</span>
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

          <TextField
            fullWidth
            size="small"
            required
            label={t('customers.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kannan Traders · கண்ணன் டிரேடர்ஸ்"
          />

          <TextField
            fullWidth
            size="small"
            required
            type="tel"
            label={t('customers.mobile')}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="9840123456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                  <span style={{ marginLeft: 4, fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>+91</span>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            label={`${t('customers.gstin')} (Optional for B2B)`}
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="33AAAAA0000A1Z5"
            helperText="Provide 15-character GSTIN for B2B tax invoice generation"
          />
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
