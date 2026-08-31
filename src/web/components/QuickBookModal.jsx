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
  Chip,
  Alert,
  IconButton,
  Grid,
  Paper,
  InputAdornment,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SlotPicker from './SlotPicker.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function QuickBookModal({
  isOpen,
  onClose,
  customers = [],
  services = [],
  staffList = [],
  currentStaff,
  initialSlot = null,
  initialStaffId = null,
  initialCustomer = null,
  onBookingCreated,
}) {
  const { t, formatMoney } = useI18n();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSelectedCustomer(initialCustomer || null);
      setCustomerSearch('');
      setNewCustName('');
      setNewCustMobile('');
      setNewCustGstin('');
      setNotes('');

      // Auto-select first service if available
      if (services.length > 0) {
        setSelectedService(services[0]);
      } else {
        setSelectedService(null);
      }

      // Auto-select staff
      if (initialStaffId) {
        const found = staffList.find((s) => String(s.id) === String(initialStaffId));
        setSelectedStaff(found || staffList[0] || currentStaff || null);
      } else {
        setSelectedStaff(currentStaff || staffList[0] || null);
      }

      // Initial slot or now
      if (initialSlot) {
        setStartTime(initialSlot);
      } else {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes() < 30 ? 0 : 30)}`;
        setStartTime(localIso);
      }
    }
  }, [isOpen, initialSlot, initialStaffId, services, staffList, currentStaff]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter((c) => {
    if (!c) return false;
    if (!customerSearch.trim()) return true;
    const term = customerSearch.toLowerCase().trim();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.mobile && String(c.mobile).includes(term)) ||
      (c.gstin && String(c.gstin).toLowerCase().includes(term))
    );
  });

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!selectedService) {
        throw new Error('Please select a service');
      }
      if (!selectedStaff) {
        throw new Error('Please select a staff member');
      }
      if (!startTime) {
        throw new Error('Please select a valid time slot');
      }

      let customerId = selectedCustomer ? selectedCustomer.id : null;
      let customerPayload = null;

      if (!customerId) {
        if (!newCustName.trim()) throw new Error('Customer name is required');
        if (!newCustMobile.trim()) throw new Error('Customer mobile number is required');

        customerPayload = {
          name: newCustName.trim(),
          mobile: newCustMobile.trim(),
          gstin: newCustGstin.trim() || null,
        };
      }

      const bookingPayload = {
        customerId,
        customer: customerPayload,
        itemId: selectedService.id,
        staffId: selectedStaff.id,
        startTime: new Date(startTime).toISOString(),
        notes: notes.trim() || null,
      };

      await onBookingCreated(bookingPayload);
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
          <BoltRoundedIcon sx={{ color: '#EA580C', fontSize: 24 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.025em' }}>
            {t('booking.quickWalkIn')}
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

        {/* STEP 1: Select or Enter Customer */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label="Step 1"
              size="small"
              sx={{ backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: 800, height: 22, fontSize: '0.72rem' }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              {t('booking.selectCustomer')}
            </Typography>
          </Box>

          {selectedCustomer ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                border: '1.5px solid #EA580C',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                  {selectedCustomer.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                  📞 +91 {selectedCustomer.mobile} {selectedCustomer.gstin ? `• GST: ${selectedCustomer.gstin}` : ''}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSelectedCustomer(null)}
                sx={{ borderRadius: 2, fontWeight: 700, px: 1.8, height: 32, fontSize: '0.8rem' }}
              >
                Change
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder={`Search ${customers.length} customers by name or mobile...`}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              {filteredCustomers.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, maxHeight: 110, overflowY: 'auto', mb: 1.5 }}>
                  {filteredCustomers.slice(0, 6).map((c) => (
                    <Chip
                      key={c.id}
                      label={`${c.name} (${c.mobile})`}
                      clickable
                      onClick={() => {
                        setSelectedCustomer(c);
                        setNewCustName('');
                        setNewCustMobile('');
                      }}
                      sx={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        '&:hover': {
                          backgroundColor: '#FFF7ED',
                          borderColor: '#EA580C',
                          color: '#EA580C',
                        },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Quick Walk-in New Customer Inputs */}
              <Box sx={{ pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mb: 1, display: 'block' }}>
                  Or enter new customer details:
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t('customers.name')}
                      placeholder="e.g. Ramesh"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="tel"
                      label={t('customers.mobile')}
                      placeholder="9840123456"
                      value={newCustMobile}
                      onChange={(e) => setNewCustMobile(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Paper>

        {/* STEP 2: Select Service */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label="Step 2"
              size="small"
              sx={{ backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: 800, height: 22, fontSize: '0.72rem' }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              {t('booking.selectService')}
            </Typography>
          </Box>

          <Grid container spacing={1.2}>
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <Grid item xs={6} key={s.id}>
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedService(s)}
                    sx={{
                      p: 1.4,
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.15)' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#EA580C',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.2 }}>
                        {s.name}
                      </Typography>
                      {isSelected && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#EA580C' }} />}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography sx={{ fontWeight: 800, color: '#EA580C', fontSize: '0.95rem' }}>
                        {formatMoney(s.price_paise)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.78rem' }}>
                        {s.duration_min} {t('common.mins')}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* STEP 3: Staff & Stylish Slot Picker */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip
              label="Step 3"
              size="small"
              sx={{ backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: 800, height: 22, fontSize: '0.72rem' }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              {t('booking.selectStaff')} & {t('booking.selectSlot')}
            </Typography>
          </Box>

          {/* Staff Filter Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {staffList.map((st) => {
              const isSelected = selectedStaff?.id === st.id;
              return (
                <Chip
                  key={st.id}
                  avatar={
                    <Box
                      sx={{
                        width: '10px !important',
                        height: '10px !important',
                        borderRadius: '50%',
                        backgroundColor: `${st.colour} !important`,
                        ml: '6px !important',
                      }}
                    />
                  }
                  label={st.name}
                  clickable
                  onClick={() => setSelectedStaff(st)}
                  sx={{
                    fontWeight: 700,
                    height: 32,
                    fontSize: '0.82rem',
                    borderRadius: 2,
                    backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                    color: isSelected ? '#EA580C' : '#0F172A',
                    border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                    '&:hover': {
                      backgroundColor: '#FFF7ED',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Stylish Modern SlotPicker */}
          <SlotPicker
            value={startTime}
            onChange={setStartTime}
            durationMin={selectedService?.duration_min || 30}
          />
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, height: 38, px: 2 }}>
          {t('common.cancel')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={loading || !selectedService || (!selectedCustomer && (!newCustName || !newCustMobile))}
          onClick={handleCreate}
          startIcon={<BoltRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 2, px: 2.8, height: 38, fontWeight: 800 }}
        >
          {loading ? t('common.loading') : `⚡ ${t('booking.confirmAndSave')}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
