import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Button,
  Typography,
  Alert,
  IconButton,
  Grid,
  Avatar,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function OwnerPinModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = null,
  ownerPin = '1234',
}) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsShaking(false);
      setTimeout(() => {
        if (containerRef.current) containerRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === ownerPin) {
      onSuccess();
      onClose();
    } else {
      setError(t('auth.pinIncorrect'));
      setIsShaking(true);
      setTimeout(() => {
        setPin('');
        setIsShaking(false);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 2, sm: 2.5 },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        },
      }}
    >
      {/* Top Close Button */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          color: '#94A3B8',
          '&:hover': { color: '#0F172A', backgroundColor: '#F1F5F9' },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          outline: 'none',
        }}
        tabIndex={0}
        ref={containerRef}
        onKeyDown={handleKeyDown}
      >
        {/* Centered Lock Avatar Icon */}
        <Avatar
          sx={{
            width: 56,
            height: 56,
            mb: 2,
            backgroundColor: '#FFF7ED',
            color: '#EA580C',
            border: '1px solid #FFEDD5',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
          }}
        >
          <LockRoundedIcon sx={{ fontSize: 28 }} />
        </Avatar>

        {/* Centered Title & Subtitle */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.35rem',
            color: '#0F172A',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            width: '100%',
            mb: 0.5,
          }}
        >
          {t('auth.ownerPinTitle')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontWeight: 500,
            textAlign: 'center',
            width: '100%',
            mb: 2,
            px: 2,
          }}
        >
          {actionTitle ? `${actionTitle} — ` : ''}{t('auth.enterPin')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontWeight: 700, borderRadius: 2, py: 0.5, width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Centered 4-Dot Passcode Indicators */}
        <Box
          className={isShaking ? 'shake-animation' : ''}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            my: 2,
          }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <Box
              key={idx}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid #CBD5E1',
                backgroundColor: pin.length > idx ? '#EA580C' : 'transparent',
                borderColor: pin.length > idx ? '#EA580C' : '#CBD5E1',
                transform: pin.length > idx ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: pin.length > idx ? '0 0 8px rgba(234, 88, 12, 0.4)' : 'none',
              }}
            />
          ))}
        </Box>

        {/* Centered Tactile Keypad */}
        <Grid container spacing={1.5} sx={{ maxWidth: 280, mx: 'auto', mb: 2.5 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <Grid item xs={4} key={digit}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDigit(digit)}
                sx={{
                  height: 58,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  borderColor: '#E2E8F0',
                  color: '#0F172A',
                  backgroundColor: '#F8FAFC',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: '#FFF7ED',
                    borderColor: '#EA580C',
                    color: '#EA580C',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                  },
                  '&:active': {
                    transform: 'scale(0.96)',
                  },
                }}
              >
                {digit}
              </Button>
            </Grid>
          ))}

          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClear}
              sx={{
                height: 58,
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 3,
                borderColor: '#E2E8F0',
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              Clear
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleDigit('0')}
              sx={{
                height: 58,
                fontSize: '1.4rem',
                fontWeight: 700,
                borderRadius: 3,
                borderColor: '#E2E8F0',
                color: '#0F172A',
                backgroundColor: '#F8FAFC',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: '#FFF7ED',
                  borderColor: '#EA580C',
                  color: '#EA580C',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'scale(0.96)',
                },
              }}
            >
              0
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBackspace}
              sx={{
                height: 58,
                borderRadius: 3,
                borderColor: '#E2E8F0',
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                },
              }}
            >
              <BackspaceRoundedIcon sx={{ fontSize: 22 }} />
            </Button>
          </Grid>
        </Grid>

        {/* Centered Footer Badge */}
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.6,
            fontWeight: 600,
            fontSize: '0.78rem',
          }}
        >
          <ShieldRoundedIcon sx={{ fontSize: 15, color: '#EA580C' }} />
          <span>{t('auth.ownerOnly')} (Default PIN: 1234)</span>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
