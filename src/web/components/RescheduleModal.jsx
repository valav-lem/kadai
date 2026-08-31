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
  Paper,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SlotPicker from './SlotPicker.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function RescheduleModal({
  isOpen,
  onClose,
  booking,
  staffList,
  services = [],
  onReschedule,
}) {
  const { t, formatMoney } = useI18n();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setError(null);
      setSelectedStaffId(booking.staff_id || '');
      setSelectedItemId(booking.item_id || '');
      setNotes(booking.notes || '');

      if (booking.start_time) {
        const d = new Date(booking.start_time);
        const pad = (n) => String(n).padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setStartTime(localIso);
      }
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const selectedService = services.find((s) => String(s.id) === String(selectedItemId));

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!startTime) {
        throw new Error('Please select a valid time slot');
      }

      const updatePayload = {
        staff_id: selectedStaffId ? parseInt(selectedStaffId, 10) : booking.staff_id,
        item_id: selectedItemId ? parseInt(selectedItemId, 10) : booking.item_id,
        start_time: new Date(startTime).toISOString(),
        notes: notes.trim() || null,
      };

      await onReschedule(booking.id, updatePayload);
      onClose();
    } catch (err) {
      setError(err.message || t('booking.error.doubleBooked'));
    } finally {
      setLoading(false);
    }
  };

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
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditCalendarRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.025em' }}>
            {t('booking.rescheduleTitle')}
          </Typography>
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

        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
            {booking.customer_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3, fontSize: '0.84rem' }}>
            📞 +91 {booking.customer_mobile} • Current: <strong style={{ color: '#0F172A' }}>{booking.item_name}</strong> ({formatMoney(booking.price_paise)})
          </Typography>
        </Paper>

        <FormControl fullWidth size="small">
          <InputLabel>{t('booking.selectService')}</InputLabel>
          <Select
            value={selectedItemId}
            label={t('booking.selectService')}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} ({s.duration_min} {t('common.mins')} • {formatMoney(s.price_paise)})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>{t('booking.selectStaff')}</InputLabel>
          <Select
            value={selectedStaffId}
            label={t('booking.selectStaff')}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: st.colour }} />
                  <span>{st.name} ({st.role})</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Stylish Modern SlotPicker */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <SlotPicker
            value={startTime}
            onChange={setStartTime}
            durationMin={selectedService?.duration_min || booking.duration_min || 30}
          />
        </Paper>

        <TextField
          fullWidth
          size="small"
          label={t('customers.notes')}
          placeholder="Special requests or instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, height: 38, px: 2 }}>
          {t('common.cancel')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={handleSave}
          startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 2, px: 2.8, height: 38, fontWeight: 800 }}
        >
          {loading ? t('common.loading') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
