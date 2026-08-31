import { createTheme } from '@mui/material/styles';

export const kadaiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#EA580C', // Vibrant Refined Terracotta / Orange
      dark: '#C2410C',
      light: '#FFF7ED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0D9488', // Teal / Sage
      dark: '#0F766E',
      light: '#F0FDFA',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#2563EB', // Sapphire
      dark: '#1D4ED8',
      light: '#EFF6FF',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706', // Amber
      dark: '#B45309',
      light: '#FFFBEB',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A', // Emerald
      dark: '#15803D',
      light: '#F0FDF4',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626', // Crimson
      dark: '#B91C1C',
      light: '#FEF2F2',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Modern Crisp Canvas (Slate 50)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#64748B', // Slate 500
      disabled: '#94A3B8', // Slate 400
    },
    divider: '#E2E8F0', // Slate 200
    action: {
      hover: 'rgba(234, 88, 12, 0.04)',
      selected: 'rgba(234, 88, 12, 0.08)',
      focus: 'rgba(234, 88, 12, 0.12)',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    h1: {
      fontSize: '2.25rem',
      fontWeight: 800,
      color: '#0F172A',
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#0F172A',
      letterSpacing: '-0.025em',
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.4rem',
      fontWeight: 700,
      color: '#0F172A',
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 700,
      color: '#0F172A',
      letterSpacing: '-0.015em',
      lineHeight: 1.35,
    },
    h5: {
      fontSize: '1.05rem',
      fontWeight: 700,
      color: '#0F172A',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '0.95rem',
      fontWeight: 700,
      color: '#0F172A',
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 600,
      color: '#64748B',
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#64748B',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.45,
      color: '#64748B',
    },
    button: {
      fontWeight: 700,
      fontSize: '0.9rem',
      letterSpacing: '0.005em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.09), 0 8px 10px -6px rgba(0, 0, 0, 0.09)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
    ...Array(18).fill('0 25px 50px -12px rgba(0, 0, 0, 0.18)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          overflowX: 'hidden',
          scrollbarColor: '#CBD5E1 #F8FAFC',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F8FAFC',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#CBD5E1',
            borderRadius: '9999px',
            '&:hover': {
              backgroundColor: '#94A3B8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          minHeight: 40,
          padding: '8px 18px',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:focus-visible': {
            outline: '2px solid #EA580C',
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          backgroundColor: '#EA580C',
          '&:hover': {
            backgroundColor: '#C2410C',
          },
        },
        containedSecondary: {
          backgroundColor: '#0D9488',
          '&:hover': {
            backgroundColor: '#0F766E',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#E2E8F0',
          color: '#0F172A',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderWidth: '1px',
            borderColor: '#EA580C',
            backgroundColor: '#FFF7ED',
            color: '#EA580C',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF',
          padding: 6,
          margin: 16,
          maxHeight: 'calc(100vh - 32px)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          borderTop: '1px solid #F1F5F9',
          gap: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          fontSize: '0.8rem',
          height: 28,
        },
        filled: {
          border: '1px solid transparent',
        },
        outlined: {
          borderWidth: '1px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          fontSize: '0.95rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E2E8F0',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#EA580C',
            borderWidth: '1.5px',
          },
        },
        input: {
          padding: '10px 14px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.9rem',
          color: '#64748B',
          '&.Mui-focused': {
            color: '#EA580C',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: 10,
          padding: '10px 14px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8FAFC',
          '& .MuiTableCell-head': {
            fontWeight: 800,
            fontSize: '0.75rem',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
            verticalAlign: 'middle',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#F1F5F9',
          padding: '14px 16px',
          fontSize: '0.92rem',
          color: '#0F172A',
          verticalAlign: 'middle',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.12s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC !important',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          fontSize: '0.8rem',
          fontWeight: 600,
          borderRadius: 6,
          padding: '5px 10px',
        },
        arrow: {
          color: '#0F172A',
        },
      },
    },
  },
});
