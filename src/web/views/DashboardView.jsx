import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function DashboardView({
  stats,
  todayBookings,
  lowStockItems,
  onOpenQuickBook,
  onStatusChange,
  onOpenPayment,
  setActiveTab,
}) {
  const { t, formatMoney, formatTime } = useI18n();

  const metrics = [
    {
      title: t('dashboard.todayAppointments'),
      value: stats?.today?.total_today ?? todayBookings.length,
      subtitle: `${stats?.today?.completed_count || 0} completed • ${stats?.today?.arrived_count || 0} in progress`,
      icon: <EventAvailableRoundedIcon sx={{ fontSize: 22, color: '#EA580C' }} />,
      bg: '#FFF7ED',
      border: '#FFEDD5',
    },
    {
      title: t('dashboard.pendingArrivals'),
      value: (stats?.today?.confirmed_count || 0) + (stats?.today?.pending_count || 0),
      subtitle: 'Ready for counter check-in',
      icon: <HourglassTopRoundedIcon sx={{ fontSize: 22, color: '#2563EB' }} />,
      bg: '#EFF6FF',
      border: '#DBEAFE',
    },
    {
      title: t('dashboard.lowStockItems'),
      value: stats?.low_stock_count ?? lowStockItems.length,
      subtitle: lowStockItems.length > 0 ? 'Reorder needed immediately' : 'All stock levels healthy',
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 22, color: lowStockItems.length > 0 ? '#DC2626' : '#D97706' }} />,
      bg: lowStockItems.length > 0 ? '#FEF2F2' : '#FFFBEB',
      border: lowStockItems.length > 0 ? '#FEE2E2' : '#FEF3C7',
      isAlert: lowStockItems.length > 0,
    },
    {
      title: t('dashboard.activeStaff'),
      value: stats?.active_staff_count || 3,
      subtitle: 'Active on the counter calendar',
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 22, color: '#0D9488' }} />,
      bg: '#F0FDFA',
      border: '#CCFBF1',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Page Title & Action Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
              {t('nav.dashboard')}
            </Typography>
            <Chip
              label="Real-time"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                border: '1px solid #DCFCE7',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Real-time counter overview & daily operations
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => onOpenQuickBook()}
          startIcon={<BoltRoundedIcon />}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            height: 38,
            display: { xs: 'flex', sm: 'none' },
            width: '100%',
          }}
        >
          {t('dashboard.newWalkIn')}
        </Button>
      </Box>

      {/* Top KPI Metrics Row */}
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid container spacing={2.5} sx={{ width: '100%', m: 0 }}>
          {metrics.map((m, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx} sx={{ p: '10px !important' }}>
              <Card
                sx={{
                  height: '100%',
                  p: 2.5,
                  border: m.isAlert ? '1px solid #FECACA' : '1px solid #E2E8F0',
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748B' }}>
                    {m.title}
                  </Typography>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: m.bg,
                      border: `1px solid ${m.border}`,
                    }}
                  >
                    {m.icon}
                  </Avatar>
                </Box>

                <Typography
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: m.isAlert ? '#DC2626' : '#0F172A',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    mb: 0.8,
                  }}
                >
                  {m.value}
                </Typography>

                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
                  {m.subtitle}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* High-Impact Hero Quick Action Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          color: '#FFFFFF',
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 4px 16px -2px rgba(234, 88, 12, 0.25)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ maxWidth: 650 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              letterSpacing: '-0.02em',
              mb: 0.4,
            }}
          >
            {t('dashboard.quickAction')}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '0.9rem', lineHeight: 1.45 }}>
            Walk-in customer standing at the counter? Book in 4 taps with zero paper diary.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="medium"
          onClick={() => onOpenQuickBook()}
          startIcon={<BoltRoundedIcon sx={{ fontSize: 19, color: '#EA580C' }} />}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#EA580C',
            fontWeight: 800,
            fontSize: '0.88rem',
            px: 2.5,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#FFF7ED',
              transform: 'scale(1.02)',
            },
          }}
        >
          {t('dashboard.newWalkIn')}
        </Button>
      </Paper>

      {/* Main Content Grid: Today's Appointments & Low Stock */}
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
          {/* Left Column: Today's Appointments */}
          <Grid item xs={12} lg={8} sx={{ p: '12px !important' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, width: '100%', boxSizing: 'border-box' }}>
              <Box
                sx={{
                  p: 2.2,
                  pb: 1.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventAvailableRoundedIcon sx={{ color: '#EA580C', fontSize: 22 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                    {t('dashboard.todayAppointments')}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setActiveTab('calendar')}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 1.5, height: 32, fontSize: '0.78rem' }}
                >
                  {t('nav.calendar')}
                </Button>
              </Box>

              {todayBookings.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center', color: '#64748B', my: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('booking.noBookings')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ flex: 1, width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Staff</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayBookings.map((b) => {
                        const isConfirmed = b.status === 'confirmed';
                        const isArrived = b.status === 'arrived';
                        const isCompleted = b.status === 'completed';

                        return (
                          <TableRow key={b.id}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                              {formatTime(b.start_time)}
                            </TableCell>

                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                                  {b.customer_name}
                                </Typography>
                                {b.customer_gstin && (
                                  <Chip
                                    label="B2B"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      backgroundColor: '#EFF6FF',
                                      color: '#2563EB',
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>

                            <TableCell sx={{ fontWeight: 500, color: '#475569', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                              {b.item_name}
                            </TableCell>

                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: b.staff_colour || '#EA580C',
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#0F172A' }}>
                                  {b.staff_name}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell align="center">
                              <Chip
                                label={t(`booking.status.${b.status}`)}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.74rem',
                                  height: 24,
                                  borderRadius: 1.5,
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
                            </TableCell>

                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {isConfirmed && (
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  startIcon={<WavingHandRoundedIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => onStatusChange(b.id, 'arrived')}
                                  sx={{ py: 0.4, px: 1.4, fontSize: '0.78rem', borderRadius: 1.8, height: 30 }}
                                >
                                  {t('booking.tapToArrive')}
                                </Button>
                              )}

                              {isArrived && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<PaymentsRoundedIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => onOpenPayment(b)}
                                  sx={{ py: 0.4, px: 1.4, fontSize: '0.78rem', borderRadius: 1.8, height: 30 }}
                                >
                                  {t('payment.title')}
                                </Button>
                              )}

                              {isCompleted && (
                                <Chip
                                  icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#16A34A !important' }} />}
                                  label={`Paid ${formatMoney(b.price_paise)}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: '#F0FDF4',
                                    color: '#16A34A',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    height: 24,
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>

          {/* Right Column: Low Stock Alerts */}
          <Grid item xs={12} lg={4} sx={{ p: '12px !important' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, width: '100%', boxSizing: 'border-box' }}>
              <Box
                sx={{
                  p: 2.2,
                  pb: 1.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningAmberRoundedIcon sx={{ color: '#D97706', fontSize: 22 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                    {t('catalogue.lowStock')}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setActiveTab('catalogue')}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 1.5, height: 32, fontSize: '0.78rem' }}
                >
                  {t('nav.catalogue')}
                </Button>
              </Box>

              <Box sx={{ p: 2.2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {lowStockItems.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: '#F0FDF4',
                      borderRadius: 2,
                      border: '1px solid #DCFCE7',
                      my: 'auto',
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 30, color: '#16A34A', mb: 0.6 }} />
                    <Typography sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.88rem' }}>
                      All inventory items well-stocked!
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.2}>
                    {lowStockItems.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.4,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2,
                          border: '1px solid #FEE2E2',
                          borderLeft: '4px solid #DC2626',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.2 }}>
                            HSN: {item.hsn} • {formatMoney(item.price_paise)}
                          </Typography>
                        </Box>

                        <Chip
                          label={`${item.stock_qty} left`}
                          size="small"
                          sx={{
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            height: 22,
                            border: '1px solid #FEE2E2',
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
