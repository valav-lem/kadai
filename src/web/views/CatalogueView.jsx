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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import SanitizerRoundedIcon from '@mui/icons-material/SanitizerRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useI18n } from '../lib/i18n.jsx';

const DEFAULT_COL_WIDTHS = {
  name: 240,
  code: 110,
  slab: 115,
  price: 115,
  metric: 135,
  online: 90,
  sale: 115,
  stock: 160,
  actions: 95,
};

export default function CatalogueView({
  items = [],
  currentStaff,
  onOpenAddItem,
  onOpenEditItem,
  onDeleteItem,
  onAdjustStock,
  onOpenProductSale,
  onRequestOwnerAuth,
}) {
  const { t, formatMoney } = useI18n();

  const [activeTab, setActiveTab] = useState('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlab, setSelectedSlab] = useState('all');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive Resizable Column Widths State
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('kadai_catalogue_col_widths');
      return saved ? { ...DEFAULT_COL_WIDTHS, ...JSON.parse(saved) } : DEFAULT_COL_WIDTHS;
    } catch {
      return DEFAULT_COL_WIDTHS;
    }
  });

  const [resizingCol, setResizingCol] = useState(null);

  const isOwner = currentStaff?.role === 'owner';

  // Drag-to-resize column width handler
  const handleMouseDownResize = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(colKey);

    const startX = e.clientX;
    const startWidth = colWidths[colKey] || DEFAULT_COL_WIDTHS[colKey];

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const minW = colKey === 'actions' ? 80 : 70;
      const newWidth = Math.max(minW, startWidth + deltaX);

      setColWidths((prev) => {
        const next = { ...prev, [colKey]: newWidth };
        try {
          localStorage.setItem('kadai_catalogue_col_widths', JSON.stringify(next));
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
    setColWidths(DEFAULT_COL_WIDTHS);
    try {
      localStorage.removeItem('kadai_catalogue_col_widths');
    } catch {}
  };

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

  const handleDeleteItemClick = (item) => {
    if (isOwner) {
      setItemToDelete(item);
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => setItemToDelete(item), `Delete ${item.name}`);
    } else {
      setItemToDelete(item);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !onDeleteItem) return;
    setIsDeleting(true);
    try {
      await onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
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

  // Reusable resize divider on table headers with tooltip
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
            {t('nav.catalogue')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
            Services, retail products & inventory management • Hover over items for details • Drag header borders to resize
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

          {!isOwner && (
            <Tooltip title="Owner authorization PIN required for adding, editing, or deleting items" arrow>
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
                  cursor: 'help',
                }}
              />
            </Tooltip>
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

      {/* Catalogue Table with UI Column Width Adjustments & Hover Tooltips */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ tableLayout: 'fixed', minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {/* 1. Item Name */}
                <TableCell sx={{ width: colWidths.name, minWidth: colWidths.name, position: 'relative' }}>
                  <span>Item Name</span>
                  {renderResizeHandle('name', 'Item Name')}
                </TableCell>

                {/* 2. Code (HSN / SAC) */}
                <TableCell sx={{ width: colWidths.code, minWidth: colWidths.code, position: 'relative' }}>
                  <span>{activeTab === 'product' ? 'HSN' : 'SAC'}</span>
                  {renderResizeHandle('code', activeTab === 'product' ? 'HSN' : 'SAC')}
                </TableCell>

                {/* 3. GST Slab */}
                <TableCell sx={{ width: colWidths.slab, minWidth: colWidths.slab, position: 'relative' }}>
                  <span>GST Slab</span>
                  {renderResizeHandle('slab', 'GST Slab')}
                </TableCell>

                {/* 4. Price */}
                <TableCell align="right" sx={{ width: colWidths.price, minWidth: colWidths.price, position: 'relative' }}>
                  <span>Price (₹)</span>
                  {renderResizeHandle('price', 'Price')}
                </TableCell>

                {/* 5. Duration / Stock */}
                <TableCell sx={{ width: colWidths.metric, minWidth: colWidths.metric, position: 'relative' }}>
                  <span>{activeTab === 'product' ? 'In Stock' : 'Duration (Mins)'}</span>
                  {renderResizeHandle('metric', activeTab === 'product' ? 'In Stock' : 'Duration')}
                </TableCell>

                {/* 6. Online */}
                <TableCell align="center" sx={{ width: colWidths.online, minWidth: colWidths.online, position: 'relative' }}>
                  <span>Online</span>
                  {renderResizeHandle('online', 'Online')}
                </TableCell>

                {/* 7. Quick Sale (Product Only) */}
                {activeTab === 'product' && (
                  <TableCell align="center" sx={{ width: colWidths.sale, minWidth: colWidths.sale, position: 'relative' }}>
                    <span>Quick Sale</span>
                    {renderResizeHandle('sale', 'Quick Sale')}
                  </TableCell>
                )}

                {/* 8. Adjust Stock (Product Only) */}
                {activeTab === 'product' && (
                  <TableCell align="right" sx={{ width: colWidths.stock, minWidth: colWidths.stock, position: 'relative' }}>
                    <span>Adjust Stock</span>
                    {renderResizeHandle('stock', 'Adjust Stock')}
                  </TableCell>
                )}

                {/* 9. Actions (Edit & Delete) */}
                <TableCell align="center" sx={{ width: colWidths.actions, minWidth: colWidths.actions, position: 'relative' }}>
                  <span>Actions</span>
                </TableCell>
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
                  const itemTooltip = `${item.name}${item.description ? ` — ${item.description}` : ''}`;

                  return (
                    <TableRow key={item.id} hover>
                      {/* Name with Hover Title */}
                      <TableCell sx={{ width: colWidths.name, overflow: 'hidden' }}>
                        <Tooltip title={itemTooltip} placement="top-start" arrow>
                          <Box sx={{ cursor: 'default' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name}
                            </Typography>
                            {item.description && (
                              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Code with Hover Title */}
                      <TableCell sx={{ width: colWidths.code, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <Tooltip
                          title={activeTab === 'product' ? `HSN Code: ${item.hsn} (Harmonized System of Nomenclature)` : `SAC Code: ${item.sac} (Services Accounting Code)`}
                          placement="top"
                          arrow
                        >
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
                              cursor: 'help',
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* GST Slab with Hover Title */}
                      <TableCell sx={{ width: colWidths.slab, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <Tooltip title={`GST Tax Rate applied: ${parseFloat(item.gst_slab || 0).toFixed(2)}%`} placement="top" arrow>
                          <Chip
                            label={`${parseFloat(item.gst_slab || 0).toFixed(2)}% GST`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 22,
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              cursor: 'help',
                            }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Price with Hover Title */}
                      <TableCell align="right" sx={{ width: colWidths.price, fontWeight: 800, fontSize: '1rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <Tooltip title={`Selling price: ${formatMoney(item.price_paise)} (Inclusive of GST)`} placement="top" arrow>
                          <span>{formatMoney(item.price_paise)}</span>
                        </Tooltip>
                      </TableCell>

                      {/* Duration / Stock with Hover Title */}
                      <TableCell sx={{ width: colWidths.metric, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {activeTab === 'service' ? (
                          <Tooltip title={`Service duration: ${item.duration_min} minutes`} placement="top" arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#475569', fontWeight: 600, fontSize: '0.84rem', cursor: 'default' }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                              <span>{item.duration_min} mins</span>
                            </Box>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`Stock on hand: ${item.stock_qty} units (Reorder threshold: ${item.reorder_point} units). Click number to edit directly.`}
                            placement="top"
                            arrow
                          >
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
                              >
                                {item.stock_qty}
                              </Typography>
                              {isLowStock && (
                                <Chip
                                  icon={<WarningAmberRoundedIcon sx={{ fontSize: '12px !important', color: '#DC2626 !important' }} />}
                                  label={`Low (${item.reorder_point})`}
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
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Online with Hover Title */}
                      <TableCell align="center" sx={{ width: colWidths.online, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {item.bookable_online ? (
                          <Tooltip title="This item is enabled for online bookings and walk-in scheduling" placement="top" arrow>
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
                                cursor: 'help',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="In-store / Offline only (not bookable online)" placement="top" arrow>
                            <Typography sx={{ color: '#94A3B8', cursor: 'help' }}>—</Typography>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Quick Sale with Hover Title */}
                      {activeTab === 'product' && (
                        <TableCell align="center" sx={{ width: colWidths.sale, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          <Tooltip title={item.stock_qty > 0 ? `Sell 1 or more units of ${item.name} at counter` : 'Out of stock — cannot sell'} placement="top" arrow>
                            <span>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                disabled={item.stock_qty <= 0}
                                onClick={() => onOpenProductSale && onOpenProductSale(item)}
                                startIcon={<BoltRoundedIcon sx={{ fontSize: 14 }} />}
                                sx={{
                                  py: 0.3,
                                  px: 1.2,
                                  fontSize: '0.76rem',
                                  borderRadius: 1.8,
                                  height: 28,
                                }}
                              >
                                {t('catalogue.sellProduct')}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}

                      {/* Adjust Stock with Hover Title */}
                      {activeTab === 'product' && (
                        <TableCell align="right" sx={{ width: colWidths.stock, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          <Tooltip title={isOwner ? "Quickly adjust stock on hand (+1, -1, +10)" : "Owner PIN required to adjust stock"} placement="top" arrow>
                            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 1.8 }}>
                              <Button
                                onClick={() => handleStockAdjustClick(item.id, -1)}
                                disabled={item.stock_qty <= 0}
                                sx={{ fontWeight: 700, px: 0.8, height: 28, fontSize: '0.74rem', borderColor: '#E2E8F0' }}
                              >
                                {!isOwner ? '🔒 -1' : '-1'}
                              </Button>
                              <Button
                                onClick={() => handleStockAdjustClick(item.id, 1)}
                                sx={{ fontWeight: 700, px: 0.8, height: 28, fontSize: '0.74rem', borderColor: '#E2E8F0' }}
                              >
                                {!isOwner ? '🔒 +1' : '+1'}
                              </Button>
                              <Button
                                onClick={() => handleStockAdjustClick(item.id, 10)}
                                sx={{ fontWeight: 700, px: 0.8, height: 28, fontSize: '0.74rem', borderColor: '#E2E8F0' }}
                              >
                                {!isOwner ? '🔒 +10' : '+10'}
                              </Button>
                            </ButtonGroup>
                          </Tooltip>
                        </TableCell>
                      )}

                      {/* Actions: Edit & Delete Buttons with Hover Titles */}
                      <TableCell align="center" sx={{ width: colWidths.actions, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}>
                          <Tooltip title={isOwner ? `Edit ${item.name}` : "Owner PIN required to edit"} placement="top" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditItemClick(item)}
                              sx={{
                                color: '#64748B',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                p: 0.5,
                                '&:hover': {
                                  backgroundColor: '#FFF7ED',
                                  color: '#EA580C',
                                  borderColor: '#EA580C',
                                },
                              }}
                            >
                              {!isOwner ? <LockRoundedIcon sx={{ fontSize: 13 }} /> : <EditRoundedIcon sx={{ fontSize: 15 }} />}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={isOwner ? `Delete ${item.name}` : "Owner PIN required to delete"} placement="top" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItemClick(item)}
                              sx={{
                                color: '#94A3B8',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                p: 0.5,
                                '&:hover': {
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  borderColor: '#FEE2E2',
                                },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
          Delete {itemToDelete?.kind === 'product' ? 'Product' : 'Service'}?
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ color: '#0F172A', fontWeight: 600, mb: 1 }}>
            Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            This item will be deactivated and removed from active booking catalogues and product sales. Historical invoices and records will remain safely preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setItemToDelete(null)}
            disabled={isDeleting}
            sx={{ borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2, fontWeight: 800 }}
          >
            {isDeleting ? t('common.loading') : 'Delete Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
