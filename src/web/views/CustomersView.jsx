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
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useI18n } from '../lib/i18n.jsx';

const DEFAULT_CUST_WIDTHS = {
  name: 240,
  mobile: 150,
  gstin: 180,
  visits: 110,
  spent: 140,
  actions: 140,
};

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

  // Interactive Resizable Column Widths
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('kadai_customer_col_widths');
      return saved ? { ...DEFAULT_CUST_WIDTHS, ...JSON.parse(saved) } : DEFAULT_CUST_WIDTHS;
    } catch {
      return DEFAULT_CUST_WIDTHS;
    }
  });

  const [resizingCol, setResizingCol] = useState(null);

  const isOwner = currentStaff?.role === 'owner';

  const handleMouseDownResize = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colKey);

    const startX = e.clientX;
    const startWidth = colWidths[colKey] || DEFAULT_CUST_WIDTHS[colKey];

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const minW = colKey === 'actions' ? 100 : 70;
      const newWidth = Math.max(minW, startWidth + deltaX);

      setColWidths((prev) => {
        const next = { ...prev, [colKey]: newWidth };
        try {
          localStorage.setItem('kadai_customer_col_widths', JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const onMouseUp = () => {
      setResizingCol(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const resetColumnWidths = () => {
    setColWidths(DEFAULT_CUST_WIDTHS);
    try {
      localStorage.removeItem('kadai_customer_col_widths');
    } catch {}
  };

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

  const renderResizeHandle = (colKey, colName) => (
    <Tooltip title={`Drag right border to resize "${colName}" column`} placement="top" arrow>
      <Box
        onMouseDown={(e) => handleMouseDownResize(e, colKey)}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 10,
          cursor: 'col-resize',
          userSelect: 'none',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover::after, &:active::after': {
            backgroundColor: '#EA580C',
            width: '3px',
            height: '100%',
          },
          '&::after': {
            content: '""',
            display: 'block',
            width: '1.5px',
            height: '50%',
            backgroundColor: resizingCol === colKey ? '#EA580C' : '#CBD5E1',
            borderRadius: '1px',
            transition: 'all 0.15s ease',
          },
        }}
      />
    </Tooltip>
  );

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
            {t('customers.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Directory, client history, GSTIN profiles & visit tracking • Hover for details • Drag header borders to resize
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Tooltip title="Reset all columns to default width" arrow>
            <IconButton
              size="small"
              onClick={resetColumnWidths}
              sx={{ border: '1px solid #E2E8F0', borderRadius: 2, p: 0.8, color: '#64748B' }}
            >
              <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCustomerClick}
            startIcon={<PersonAddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              px: 2.2,
              height: 38,
              flex: { xs: 1, sm: 'initial' },
            }}
          >
            {t('customers.addCustomer')}
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
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
          gap: 2,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
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
          sx={{ maxWidth: 420 }}
        />

        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.84rem' }}>
          Showing <strong>{filtered.length}</strong> customer(s)
        </Typography>
      </Paper>

      {/* Customers Table with Resizable Headers & Hover Titles */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ tableLayout: 'fixed', minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: colWidths.name, minWidth: colWidths.name, position: 'relative' }}>
                  <span>{t('customers.name')}</span>
                  {renderResizeHandle('name', t('customers.name'))}
                </TableCell>
                
                <TableCell sx={{ width: colWidths.mobile, minWidth: colWidths.mobile, position: 'relative' }}>
                  <span>{t('customers.mobile')}</span>
                  {renderResizeHandle('mobile', t('customers.mobile'))}
                </TableCell>

                <TableCell sx={{ width: colWidths.gstin, minWidth: colWidths.gstin, position: 'relative' }}>
                  <span>{t('customers.gstin')}</span>
                  {renderResizeHandle('gstin', t('customers.gstin'))}
                </TableCell>

                <TableCell align="center" sx={{ width: colWidths.visits, minWidth: colWidths.visits, position: 'relative' }}>
                  <span>{t('customers.visits')}</span>
                  {renderResizeHandle('visits', t('customers.visits'))}
                </TableCell>

                <TableCell align="right" sx={{ width: colWidths.spent, minWidth: colWidths.spent, position: 'relative' }}>
                  <span>{t('customers.spent')}</span>
                  {renderResizeHandle('spent', t('customers.spent'))}
                </TableCell>

                <TableCell align="right" sx={{ width: colWidths.actions, minWidth: colWidths.actions, position: 'relative' }}>
                  <span>Actions</span>
                </TableCell>
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
                  <TableRow key={customer.id} hover>
                    {/* Name with Hover Title */}
                    <TableCell sx={{ width: colWidths.name, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Tooltip title={`Customer Name: ${customer.name}${customer.gstin ? ` (Registered Business: ${customer.gstin})` : ''}`} placement="top-start" arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'default' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      </Tooltip>
                    </TableCell>

                    {/* Mobile with Hover Title */}
                    <TableCell sx={{ width: colWidths.mobile, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Tooltip title={`Primary contact number: +91 ${customer.mobile}`} placement="top" arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#475569', fontSize: '0.84rem', cursor: 'default' }}>
                          <PhoneRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>+91 {customer.mobile}</span>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    {/* GSTIN with Hover Title */}
                    <TableCell sx={{ width: colWidths.gstin, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {customer.gstin ? (
                        <Tooltip title={`15-digit GST Identification Number: ${customer.gstin}`} placement="top" arrow>
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
                              cursor: 'help',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Individual / Retail Customer (No GSTIN provided)" placement="top" arrow>
                          <Typography sx={{ color: '#94A3B8', cursor: 'help' }}>—</Typography>
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Visits with Hover Title */}
                    <TableCell align="center" sx={{ width: colWidths.visits, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Tooltip title={`Total completed appointments and store visits: ${customer.visit_count || 0}`} placement="top" arrow>
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
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Spent with Hover Title */}
                    <TableCell align="right" sx={{ width: colWidths.spent, fontWeight: 800, fontSize: '1rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Tooltip title={`Cumulative lifetime spend: ${formatMoney(customer.lifetime_paise || 0)}`} placement="top" arrow>
                        <span>{formatMoney(customer.lifetime_paise || 0)}</span>
                      </Tooltip>
                    </TableCell>

                    {/* Actions with Hover Title */}
                    <TableCell align="right" sx={{ width: colWidths.actions, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={isOwner ? `Edit details for ${customer.name}` : "Owner PIN required to edit customer details"} placement="top" arrow>
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

                        <Tooltip title={`Book a new service or product for ${customer.name}`} placement="top" arrow>
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
                        </Tooltip>
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
