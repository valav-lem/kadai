import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  useTheme,
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function CalendarView({
  bookings = [],
  staffList = [],
  onOpenQuickBook,
  onOpenPayment,
  onOpenReschedule,
  onStatusChange,
}) {
  const { t, formatMoney, formatTime } = useI18n();
  const theme = useTheme();

  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate 7 days for current week offset (Monday = 0, Sunday = 6)
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const filteredBookings = bookings.filter((b) => {
    if (selectedStaffId !== 'all' && String(b.staff_id) !== String(selectedStaffId)) {
      return false;
    }
    return true;
  });

  const getBookingsForSlot = (dayDate, hour) => {
    const slotStart = new Date(dayDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(dayDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return filteredBookings.filter((b) => {
      const bStart = new Date(b.start_time);
      return bStart >= slotStart && bStart < slotEnd;
    });
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatSlotIso = (d, hour) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Page Title Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          width: '100%',
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
            {t('nav.calendar')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Appointment calendar & counter scheduling
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => onOpenQuickBook(null, selectedStaffId !== 'all' ? selectedStaffId : null)}
          startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ fontWeight: 800, borderRadius: 2, px: 2.5, height: 38, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          {t('booking.new')}
        </Button>
      </Box>

      {/* Calendar Control Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          border: '1px solid #E2E8F0',
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Week Date Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              backgroundColor: '#F8FAFC',
              p: '2px',
              borderRadius: 2,
              border: '1px solid #E2E8F0',
            }}
          >
            <Button
              size="small"
              onClick={() => setWeekOffset((w) => w - 1)}
              sx={{ px: 1, minWidth: 32, height: 30, color: '#64748B', borderRadius: 1.5 }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </Button>

            <Button
              size="small"
              onClick={() => setWeekOffset(0)}
              sx={{
                px: 1.4,
                height: 30,
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: 1.5,
                backgroundColor: weekOffset === 0 ? '#FFFFFF' : 'transparent',
                color: weekOffset === 0 ? '#EA580C' : '#64748B',
                boxShadow: weekOffset === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t('common.today')}
            </Button>

            <Button
              size="small"
              onClick={() => setWeekOffset((w) => w + 1)}
              sx={{ px: 1, minWidth: 32, height: 30, color: '#64748B', borderRadius: 1.5 }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#0F172A',
              whiteSpace: 'nowrap',
            }}
          >
            {days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
        </Box>

        {/* Staff Filter Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, overflowX: 'auto', py: 0.5, maxWidth: '100%', minWidth: 0 }}>
          <Chip
            label={t('common.allStaff')}
            clickable
            onClick={() => setSelectedStaffId('all')}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              height: 30,
              borderRadius: 1.8,
              backgroundColor: selectedStaffId === 'all' ? '#0F172A' : '#F8FAFC',
              color: selectedStaffId === 'all' ? '#FFFFFF' : '#475569',
              border: selectedStaffId === 'all' ? '1px solid #0F172A' : '1px solid #E2E8F0',
              '&:hover': {
                backgroundColor: selectedStaffId === 'all' ? '#1E293B' : '#F1F5F9',
              },
            }}
          />

          {staffList.map((st) => {
            const isSelected = String(selectedStaffId) === String(st.id);
            return (
              <Chip
                key={st.id}
                avatar={
                  <Box
                    sx={{
                      width: '9px !important',
                      height: '9px !important',
                      borderRadius: '50%',
                      backgroundColor: `${st.colour} !important`,
                      ml: '5px !important',
                    }}
                  />
                }
                label={st.name}
                clickable
                onClick={() => setSelectedStaffId(st.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  height: 30,
                  borderRadius: 1.8,
                  backgroundColor: isSelected ? '#FFF7ED' : '#F8FAFC',
                  color: isSelected ? '#EA580C' : '#475569',
                  border: isSelected ? '1px solid #EA580C' : '1px solid #E2E8F0',
                  '&:hover': {
                    backgroundColor: isSelected ? '#FFF7ED' : '#F1F5F9',
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* 7-Day Week Calendar Time Grid (Contained Horizontal Scrolling on Mobile) */}
      <Card sx={{ p: 0, overflowX: 'auto', borderRadius: 3, border: '1px solid #E2E8F0', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, minmax(160px, 1fr))',
            minWidth: 960,
            gap: '1px',
            backgroundColor: '#E2E8F0',
          }}
        >
          {/* Top Left Header Cell */}
          <Box
            sx={{
              backgroundColor: '#F8FAFC',
              p: 1.2,
              fontWeight: 700,
              fontSize: '0.72rem',
              color: '#64748B',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Time
          </Box>

          {/* 7 Day Column Headers */}
          {days.map((d, i) => {
            const isCurrentToday = isSameDay(d, today);
            return (
              <Box
                key={i}
                sx={{
                  backgroundColor: isCurrentToday ? '#FFF7ED' : '#F8FAFC',
                  p: 1,
                  textAlign: 'center',
                  borderBottom: isCurrentToday ? '2px solid #EA580C' : 'none',
                }}
              >
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: isCurrentToday ? '#EA580C' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: isCurrentToday ? '#EA580C' : '#0F172A',
                    mt: 0.1,
                  }}
                >
                  {d.getDate()}
                </Typography>
              </Box>
            );
          })}

          {/* Grid Rows for Each Hour */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time Gutter Column */}
              <Box
                sx={{
                  backgroundColor: '#FAFAFA',
                  p: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  color: '#64748B',
                  whiteSpace: 'nowrap',
                }}
              >
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </Box>

              {/* 7 Day Cells */}
              {days.map((d, dayIdx) => {
                const slotBookings = getBookingsForSlot(d, hour);
                const slotIso = formatSlotIso(d, hour);
                const isCurrentToday = isSameDay(d, today);

                return (
                  <Box
                    key={dayIdx}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        onOpenQuickBook(slotIso, selectedStaffId !== 'all' ? selectedStaffId : null);
                      }
                    }}
                    sx={{
                      backgroundColor: isCurrentToday ? '#FFFAF5' : '#FFFFFF',
                      p: 0.8,
                      minHeight: 100,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,
                      transition: 'background-color 0.12s ease',
                      '&:hover': {
                        backgroundColor: '#F8FAFC',
                      },
                    }}
                  >
                    {slotBookings.map((b) => (
                      <Paper
                        key={b.id}
                        elevation={0}
                        sx={{
                          p: 1,
                          borderRadius: 1.8,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderLeft: `4px solid ${b.staff_colour || '#EA580C'}`,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
                          },
                        }}
                      >
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.customer_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                            <Chip
                              label={t(`booking.status.${b.status}`)}
                              size="small"
                              sx={{
                                height: 17,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                borderRadius: 0.8,
                                backgroundColor:
                                  b.status === 'completed'
                                    ? '#F0FDF4'
                                    : b.status === 'arrived'
                                    ? '#F0FDFA'
                                    : b.status === 'confirmed'
                                    ? '#EFF6FF'
                                    : '#FFFBEB',
                                color:
                                  b.status === 'completed'
                                    ? '#16A34A'
                                    : b.status === 'arrived'
                                    ? '#0D9488'
                                    : b.status === 'confirmed'
                                    ? '#2563EB'
                                    : '#D97706',
                              }}
                            />
                            {b.status !== 'completed' && b.status !== 'cancelled' && onOpenReschedule && (
                              <Tooltip title="Reschedule / Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenReschedule(b);
                                  }}
                                  sx={{ p: 0.2, color: '#94A3B8' }}
                                >
                                  <EditRoundedIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>

                        {/* Body */}
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.item_name}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.4 }}>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                            {formatTime(b.start_time)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#EA580C' }}>
                            {formatMoney(b.price_paise)}
                          </Typography>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ mt: 0.6 }}>
                          {b.status === 'confirmed' && (
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={<WavingHandRoundedIcon sx={{ fontSize: 12 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(b.id, 'arrived');
                              }}
                              sx={{
                                py: 0.2,
                                fontSize: '0.72rem',
                                height: 24,
                                minHeight: 24,
                                borderRadius: 1.2,
                                color: '#0D9488',
                                borderColor: '#99F6E4',
                                '&:hover': {
                                  backgroundColor: '#F0FDFA',
                                  borderColor: '#0D9488',
                                },
                              }}
                            >
                              {t('booking.action.markArrived')}
                            </Button>
                          )}

                          {b.status === 'arrived' && (
                            <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<PaymentsRoundedIcon sx={{ fontSize: 12 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenPayment(b);
                              }}
                              sx={{
                                py: 0.2,
                                fontSize: '0.72rem',
                                height: 24,
                                minHeight: 24,
                                borderRadius: 1.2,
                              }}
                            >
                              {t('booking.action.collectPayment')}
                            </Button>
                          )}

                          {b.status === 'completed' && b.payment_mode && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
                              <CheckCircleRoundedIcon sx={{ fontSize: 12, color: '#16A34A' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A' }}>
                                Paid ({b.payment_mode.toUpperCase()})
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
