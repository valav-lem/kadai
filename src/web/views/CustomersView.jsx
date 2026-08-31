import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function CustomersView({
  customers = [],
  currentStaff,
  onOpenAddCustomer,
  onOpenEditCustomer,
  onBookForCustomer,
  onRequestOwnerAuth,
}) {
  const { t, formatMoney } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  const isOwner = currentStaff?.role === 'owner';

  const handleAddCustomerClick = () => {
    onOpenAddCustomer();
  };

  const handleEditCustomerClick = (customer) => {
    if (isOwner) {
      onOpenEditCustomer(customer);
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onOpenEditCustomer(customer), `Edit ${customer.name}`);
    } else {
      onOpenEditCustomer(customer);
    }
  };

  const filtered = customers.filter((c) => {
    if (!c) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.mobile && String(c.mobile).includes(term)) ||
      (c.gstin && String(c.gstin).toLowerCase().includes(term))
    );
  });

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
            {t('nav.customers')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Customer directory, loyalty & B2B GST master
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCustomerClick}
          startIcon={<PersonAddRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ fontWeight: 800, borderRadius: 2, px: 2.2, height: 38, alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          {t('customers.add')}
        </Button>
      </Box>

      {/* Top Bar Card */}
      <Paper
        elevation={0}
        sx={{
          p: 1.8,
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
        <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: 450 }, minWidth: { xs: '100%', sm: 260 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('customers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.84rem' }}>
          Total Customers: <strong style={{ color: '#0F172A' }}>{customers.length}</strong>
        </Typography>
      </Paper>

      {/* Customers Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('customers.name')}</TableCell>
                <TableCell>{t('customers.mobile')}</TableCell>
                <TableCell>{t('customers.gstin')}</TableCell>
                <TableCell align="center">{t('customers.visits')}</TableCell>
                <TableCell align="right">{t('customers.spent')}</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#64748B' }}>
                    {t('customers.noCustomers')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                          {customer.name}
                        </Typography>
                        {customer.gstin && (
                          <Chip
                            label={t('customers.b2bBadge')}
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

                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <PhoneRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <span>+91 {customer.mobile}</span>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {customer.gstin ? (
                        <Chip
                          label={customer.gstin}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#94A3B8' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        label={`${customer.visit_count || 0} visits`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 22,
                          backgroundColor: '#F0FDFA',
                          color: '#0D9488',
                          border: '1px solid #CCFBF1',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                      {formatMoney(customer.lifetime_paise || 0)}
                    </TableCell>

                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={isOwner ? "Edit customer name, mobile & GSTIN" : "Owner PIN required to edit"}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditCustomerClick(customer)}
                            sx={{
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              p: 0.6,
                              '&:hover': {
                                backgroundColor: '#FFF7ED',
                                color: '#EA580C',
                                borderColor: '#EA580C',
                              },
                            }}
                          >
                            {!isOwner ? <LockRoundedIcon sx={{ fontSize: 14 }} /> : <EditRoundedIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>

                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => onBookForCustomer(customer)}
                          startIcon={<BoltRoundedIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            py: 0.3,
                            px: 1.4,
                            borderRadius: 1.8,
                            height: 28,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}
                        >
                          {t('booking.new')}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
