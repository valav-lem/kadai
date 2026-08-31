import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function Header({
  activeTab,
  setActiveTab,
  staffList = [],
  currentStaff,
  setCurrentStaff,
  isOnline,
  offlineCount,
  onOpenQuickBook,
}) {
  const { t, locale, setLocale } = useI18n();
  const theme = useTheme();
  
  // Desktop navigation items only on wide screens (>= 1280px)
  const isDesktopNav = useMediaQuery('(min-width:1280px)');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} /> },
    { id: 'calendar', label: t('nav.calendar'), icon: <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} /> },
    { id: 'catalogue', label: t('nav.catalogue'), icon: <Inventory2RoundedIcon sx={{ fontSize: 18 }} /> },
    { id: 'customers', label: t('nav.customers'), icon: <PeopleAltRoundedIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        color: '#0F172A',
        width: '100%',
        maxWidth: '100vw',
        zIndex: theme.zIndex.drawer + 1,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2, md: 3 },
          minHeight: { xs: 56, md: 62 },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {/* Left: Brand Lockup & Hamburger / Close Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, minWidth: 0, flexShrink: 0 }}>
          {!isDesktopNav && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label={mobileDrawerOpen ? "close menu" : "open menu"}
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              sx={{
                p: 0.6,
                color: mobileDrawerOpen ? '#EA580C' : '#0F172A',
                backgroundColor: mobileDrawerOpen ? '#FFF7ED' : 'transparent',
                borderRadius: 1.8,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                },
              }}
            >
              {mobileDrawerOpen ? (
                <CloseRoundedIcon sx={{ fontSize: 24 }} />
              ) : (
                <MenuRoundedIcon sx={{ fontSize: 24 }} />
              )}
            </IconButton>
          )}

          <Box
            component="a"
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              textDecoration: 'none',
              color: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.8,
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
              }}
            >
              <StorefrontRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                  whiteSpace: 'nowrap',
                }}
              >
                Kadai
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: '#EA580C',
                  whiteSpace: 'nowrap',
                }}
              >
                · கடை
              </Typography>
            </Box>

            <Chip
              label="M1"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 800,
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                border: '1px solid #FFEDD5',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            />
          </Box>
        </Box>

        {/* Center: Desktop Navigation Tabs (Visible on >= 1280px) */}
        {isDesktopNav && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: '#F8FAFC',
              p: '3px',
              borderRadius: 2.2,
              border: '1px solid #E2E8F0',
              flexShrink: 0,
            }}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  startIcon={item.icon}
                  sx={{
                    borderRadius: 1.8,
                    px: 1.4,
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: isActive ? '#EA580C' : '#64748B',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                    '&:hover': {
                      backgroundColor: isActive ? '#FFFFFF' : '#F1F5F9',
                      color: isActive ? '#EA580C' : '#0F172A',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Right: Quick Walk-in Button, Staff Selector, Online Badge & Language */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.6, sm: 1 },
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {/* Quick Walk-in Button in Header Only */}
          <Tooltip title={t('booking.quickWalkIn')}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onOpenQuickBook}
              startIcon={<BoltRoundedIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />}
              sx={{
                fontWeight: 800,
                fontSize: '0.8rem',
                px: { xs: 1, sm: 1.5 },
                minWidth: { xs: 34, sm: 'auto' },
                height: 34,
                borderRadius: 1.8,
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': {
                  mr: { xs: 0, sm: 0.8 },
                  ml: { xs: 0, sm: -0.4 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('booking.quickWalkIn')}
              </Box>
            </Button>
          </Tooltip>

          {/* Active Staff Selector (Bounded width) */}
          {staffList && staffList.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 1.8,
                p: '2px 4px',
                border: '1px solid #E2E8F0',
                height: 34,
                maxWidth: { xs: 95, sm: 125, md: 145 },
                overflow: 'hidden',
              }}
            >
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: currentStaff?.colour || '#EA580C',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  mr: 0.4,
                  flexShrink: 0,
                }}
              >
                {currentStaff?.name ? currentStaff.name.charAt(0) : 'S'}
              </Avatar>
              <Select
                value={currentStaff?.id || ''}
                onChange={(e) => {
                  const found = staffList.find((s) => String(s.id) === String(e.target.value));
                  if (found) setCurrentStaff(found);
                }}
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  maxWidth: '100%',
                  '& .MuiSelect-select': {
                    py: 0.1,
                    pr: '14px !important',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: staff.colour, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {staff.name} ({staff.role})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* Compact Network Status Badge (Icon with live indicator) */}
          <Tooltip title={isOnline ? 'Online — Real-time cloud sync active' : `Offline — ${offlineCount} booking(s) pending sync`}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 1.8,
                backgroundColor: isOnline ? '#F0FDF4' : '#FFFBEB',
                border: isOnline ? '1px solid #DCFCE7' : '1px solid #FEF3C7',
                color: isOnline ? '#16A34A' : '#D97706',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isOnline ? (
                <WifiRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <WifiOffRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </Box>
          </Tooltip>

          {/* Bilingual Language Switcher */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setLocale(locale === 'ta' ? 'en' : 'ta')}
            startIcon={<TranslateRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 1.8,
              height: 34,
              px: { xs: 0.8, sm: 1.2 },
              fontSize: '0.78rem',
              fontWeight: 700,
              borderColor: '#E2E8F0',
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              '&:hover': {
                borderColor: '#EA580C',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
              },
            }}
          >
            {locale === 'ta' ? 'English' : 'தமிழ்'}
          </Button>
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            p: 2.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFFFFF',
              }}
            >
              <StorefrontRoundedIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
              Kadai · கடை
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMobileDrawerOpen(false)}
            size="small"
            sx={{
              p: 0.6,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              '&:hover': {
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                borderColor: '#EA580C',
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileDrawerOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                    color: isActive ? '#EA580C' : '#0F172A',
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: isActive ? '#FFF7ED' : '#F8FAFC',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#EA580C' : '#64748B', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.92rem' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chip
            icon={isOnline ? <WifiRoundedIcon sx={{ fontSize: '14px !important' }} /> : <WifiOffRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label={isOnline ? t('common.online') : `${t('common.offline')} (${offlineCount})`}
            size="small"
            sx={{
              backgroundColor: isOnline ? '#F0FDF4' : '#FFFBEB',
              color: isOnline ? '#16A34A' : '#D97706',
              fontWeight: 700,
            }}
          />
        </Box>
      </Drawer>
    </AppBar>
  );
}
