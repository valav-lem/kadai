import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  FormControl,
  IconButton,
  Tooltip,
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import SanitizerRoundedIcon from '@mui/icons-material/SanitizerRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function CatalogueView({
  items = [],
  currentStaff,
  onOpenAddItem,
  onOpenEditItem,
  onAdjustStock,
  onOpenProductSale,
  onRequestOwnerAuth,
}) {
  const { t, formatMoney } = useI18n();

  const [activeTab, setActiveTab] = useState('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlab, setSelectedSlab] = useState('all');

  const isOwner = currentStaff?.role === 'owner';

  const handleAddItemClick = () => {
    if (isOwner) {
      onOpenAddItem();
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onOpenAddItem(), t('catalogue.addItem'));
    } else {
      onOpenAddItem();
    }
  };

  const handleEditItemClick = (item) => {
    if (isOwner) {
      onOpenEditItem(item);
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onOpenEditItem(item), `Edit ${item.name}`);
    } else {
      onOpenEditItem(item);
    }
  };

  const handleStockAdjustClick = (itemId, delta) => {
    if (isOwner) {
      onAdjustStock(itemId, delta);
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onAdjustStock(itemId, delta), 'Stock Adjustment');
    } else {
      onAdjustStock(itemId, delta);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!item) return false;
    if (item.kind !== activeTab) return false;
    if (selectedSlab !== 'all') {
      const itemSlab = parseFloat(item.gst_slab || 0);
      const targetSlab = parseFloat(selectedSlab);
      if (Math.abs(itemSlab - targetSlab) > 0.01) return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = item.name ? item.name.toLowerCase().includes(term) : false;
      const matchDesc = item.description ? item.description.toLowerCase().includes(term) : false;
      const matchHsn = item.hsn ? String(item.hsn).toLowerCase().includes(term) : false;
      const matchSac = item.sac ? String(item.sac).toLowerCase().includes(term) : false;
      if (!matchName && !matchDesc && !matchHsn && !matchSac) return false;
    }
    return true;
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
            {t('nav.catalogue')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Services, retail products & inventory management
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          {!isOwner && (
            <Chip
              icon={<LockRoundedIcon sx={{ fontSize: '13px !important', color: '#64748B !important' }} />}
              label={t('auth.ownerOnly')}
              size="small"
              sx={{
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                fontWeight: 700,
                fontSize: '0.74rem',
                border: '1px dashed #CBD5E1',
              }}
            />
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddItemClick}
            startIcon={!isOwner ? <LockRoundedIcon sx={{ fontSize: 15 }} /> : <AddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              px: 2.2,
              height: 38,
              flex: { xs: 1, sm: 'initial' },
            }}
          >
            {t('catalogue.addItem')}
          </Button>
        </Box>
      </Box>

      {/* Top Filter Bar */}
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
        {/* Kind Switcher Tabs */}
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
            onClick={() => setActiveTab('service')}
            startIcon={<ContentCutRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1.8,
              px: 2,
              py: 0.6,
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeTab === 'service' ? '#EA580C' : '#64748B',
              backgroundColor: activeTab === 'service' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'service' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
              '&:hover': {
                backgroundColor: activeTab === 'service' ? '#FFFFFF' : '#F1F5F9',
              },
            }}
          >
            {t('catalogue.tab.services')}
          </Button>

          <Button
            onClick={() => setActiveTab('product')}
            startIcon={<SanitizerRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1.8,
              px: 2,
              py: 0.6,
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeTab === 'product' ? '#EA580C' : '#64748B',
              backgroundColor: activeTab === 'product' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'product' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
              '&:hover': {
                backgroundColor: activeTab === 'product' ? '#FFFFFF' : '#F1F5F9',
              },
            }}
          >
            {t('catalogue.tab.products')}
          </Button>
        </Box>

        {/* Search Input & GST Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1, maxWidth: { xs: '100%', md: 480 }, minWidth: { xs: '100%', sm: 260 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('catalogue.searchPlaceholder')}
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

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={selectedSlab}
              onChange={(e) => setSelectedSlab(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.84rem', fontWeight: 600 }}
            >
              <MenuItem value="all">{t('catalogue.allSlabs')}</MenuItem>
              <MenuItem value="0">0% GST</MenuItem>
              <MenuItem value="5">5% GST</MenuItem>
              <MenuItem value="12">12% GST</MenuItem>
              <MenuItem value="18">18% GST</MenuItem>
              <MenuItem value="28">28% GST</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Catalogue Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>{activeTab === 'product' ? 'HSN' : 'SAC'}</TableCell>
                <TableCell>GST Slab</TableCell>
                <TableCell align="right">Price (₹)</TableCell>
                <TableCell>{activeTab === 'product' ? 'In Stock' : 'Duration (Mins)'}</TableCell>
                <TableCell align="center">Online</TableCell>
                {activeTab === 'product' && <TableCell align="center">Quick Sale</TableCell>}
                {activeTab === 'product' && <TableCell align="right">Adjust Stock</TableCell>}
                <TableCell align="center">Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={activeTab === 'product' ? 9 : 7}
                    sx={{ textAlign: 'center', py: 5, color: '#64748B' }}
                  >
                    No catalogue items found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = activeTab === 'product' && item.stock_qty <= item.reorder_point;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.2 }}>
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={activeTab === 'product' ? `HSN: ${item.hsn}` : `SAC: ${item.sac}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={`${parseFloat(item.gst_slab || 0).toFixed(2)}% GST`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                          }}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', whiteSpace: 'nowrap' }}>
                        {formatMoney(item.price_paise)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {activeTab === 'service' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#475569', fontWeight: 600, fontSize: '0.84rem' }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                            <span>{item.duration_min} mins</span>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Typography
                              onClick={() => handleEditItemClick(item)}
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                color: '#0F172A',
                                cursor: 'pointer',
                                textDecoration: 'underline dotted #94A3B8',
                                '&:hover': { color: '#EA580C' },
                              }}
                              title="Click to edit stock count directly"
                            >
                              {item.stock_qty}
                            </Typography>
                            {isLowStock && (
                              <Chip
                                icon={<WarningAmberRoundedIcon sx={{ fontSize: '12px !important', color: '#DC2626 !important' }} />}
                                label={`Low (Min ${item.reorder_point})`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FEE2E2',
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        {item.bookable_online ? (
                          <Chip
                            icon={<LanguageRoundedIcon sx={{ fontSize: '12px !important', color: '#0D9488 !important' }} />}
                            label="Online"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#F0FDFA',
                              color: '#0D9488',
                              border: '1px solid #CCFBF1',
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: '#94A3B8' }}>—</Typography>
                        )}
                      </TableCell>

                      {activeTab === 'product' && (
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            disabled={item.stock_qty <= 0}
                            onClick={() => onOpenProductSale && onOpenProductSale(item)}
                            startIcon={<BoltRoundedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              py: 0.3,
                              px: 1.4,
                              fontSize: '0.78rem',
                              borderRadius: 1.8,
                              height: 28,
                            }}
                          >
                            {t('catalogue.sellProduct')}
                          </Button>
                        </TableCell>
                      )}

                      {activeTab === 'product' && (
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 1.8 }}>
                            <Button
                              onClick={() => handleStockAdjustClick(item.id, -1)}
                              disabled={item.stock_qty <= 0}
                              sx={{ fontWeight: 700, px: 1, height: 28, fontSize: '0.75rem', borderColor: '#E2E8F0' }}
                            >
                              {!isOwner ? '🔒 -1' : '-1'}
                            </Button>
                            <Button
                              onClick={() => handleStockAdjustClick(item.id, 1)}
                              sx={{ fontWeight: 700, px: 1, height: 28, fontSize: '0.75rem', borderColor: '#E2E8F0' }}
                            >
                              {!isOwner ? '🔒 +1' : '+1'}
                            </Button>
                            <Button
                              onClick={() => handleStockAdjustClick(item.id, 10)}
                              sx={{ fontWeight: 700, px: 1, height: 28, fontSize: '0.75rem', borderColor: '#E2E8F0' }}
                            >
                              {!isOwner ? '🔒 +10' : '+10'}
                            </Button>
                          </ButtonGroup>
                        </TableCell>
                      )}

                      {/* Edit Button Column */}
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title={isOwner ? "Edit details, price, GST & stock" : "Owner PIN required to edit"}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditItemClick(item)}
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
