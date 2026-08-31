import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Fade,
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { useI18n } from '../lib/i18n.jsx';

export default function SlotPicker({ value, onChange, durationMin = 30 }) {
  const { t, formatTime } = useI18n();

  // Parse initial date & time from value
  const parseInitial = () => {
    let dateObj = new Date();
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }
    return dateObj;
  };

  const initial = parseInitial();
  const [selectedDate, setSelectedDate] = useState(new Date(initial.getFullYear(), initial.getMonth(), initial.getDate()));
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(false);

  const [selectedHour, setSelectedHour] = useState(initial.getHours() >= 8 && initial.getHours() <= 20 ? initial.getHours() : 10);
  const [selectedMinute, setSelectedMinute] = useState(initial.getMinutes() < 30 ? 0 : 30);
  const [timePeriodTab, setTimePeriodTab] = useState(initial.getHours() < 12 ? 'morning' : initial.getHours() < 16 ? 'afternoon' : 'evening');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Next 7 days for quick ribbon
  const quickDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Sync to parent ISO string
  const emitChange = (d, h, m) => {
    const combined = new Date(d);
    combined.setHours(h, m, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(h)}:${pad(m)}`;
    onChange(localIso);
  };

  const handleSelectDate = (d) => {
    setSelectedDate(d);
    setCalendarViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    emitChange(d, selectedHour, selectedMinute);
  };

  const handleSelectSlot = (h, m) => {
    setSelectedHour(h);
    setSelectedMinute(m);
    emitChange(selectedDate, h, m);
  };

  // Mini Calendar Generation
  const curYear = calendarViewMonth.getFullYear();
  const curMonth = calendarViewMonth.getMonth();

  const firstDayOfMonth = new Date(curYear, curMonth, 1).getDay(); // 0 = Sun
  const daysInCurMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(curYear, curMonth, 0).getDate();

  const calendarGrid = [];
  // Previous month filler days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarGrid.push({
      date: new Date(curYear, curMonth - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInCurMonth; d++) {
    calendarGrid.push({
      date: new Date(curYear, curMonth, d),
      isCurrentMonth: true,
    });
  }
  // Next month filler days to complete grid (up to 35 or 42)
  const remainingCells = (7 - (calendarGrid.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calendarGrid.push({
      date: new Date(curYear, curMonth + 1, d),
      isCurrentMonth: false,
    });
  }

  const prevMonth = () => {
    setCalendarViewMonth(new Date(curYear, curMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarViewMonth(new Date(curYear, curMonth + 1, 1));
  };

  const morningSlots = [
    { h: 8, m: 0, label: '08:00 AM' },
    { h: 8, m: 30, label: '08:30 AM' },
    { h: 9, m: 0, label: '09:00 AM' },
    { h: 9, m: 30, label: '09:30 AM' },
    { h: 10, m: 0, label: '10:00 AM' },
    { h: 10, m: 30, label: '10:30 AM' },
    { h: 11, m: 0, label: '11:00 AM' },
    { h: 11, m: 30, label: '11:30 AM' },
  ];

  const afternoonSlots = [
    { h: 12, m: 0, label: '12:00 PM' },
    { h: 12, m: 30, label: '12:30 PM' },
    { h: 13, m: 0, label: '01:00 PM' },
    { h: 13, m: 30, label: '01:30 PM' },
    { h: 14, m: 0, label: '02:00 PM' },
    { h: 14, m: 30, label: '02:30 PM' },
    { h: 15, m: 0, label: '03:00 PM' },
    { h: 15, m: 30, label: '03:30 PM' },
  ];

  const eveningSlots = [
    { h: 16, m: 0, label: '04:00 PM' },
    { h: 16, m: 30, label: '04:30 PM' },
    { h: 17, m: 0, label: '05:00 PM' },
    { h: 17, m: 30, label: '05:30 PM' },
    { h: 18, m: 0, label: '06:00 PM' },
    { h: 18, m: 30, label: '06:30 PM' },
    { h: 19, m: 0, label: '07:00 PM' },
    { h: 19, m: 30, label: '07:30 PM' },
    { h: 20, m: 0, label: '08:00 PM' },
  ];

  const currentSlots =
    timePeriodTab === 'morning'
      ? morningSlots
      : timePeriodTab === 'afternoon'
      ? afternoonSlots
      : eveningSlots;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, width: '100%' }}>
      {/* 1. Date Header with Ribbon + Mini Calendar Toggle */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 17, color: '#EA580C' }} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
              Select Date / தேதி
            </Typography>
          </Box>

          <Button
            size="small"
            variant={showCalendar ? 'contained' : 'outlined'}
            color={showCalendar ? 'primary' : 'inherit'}
            onClick={() => setShowCalendar((prev) => !prev)}
            startIcon={<EventRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{
              height: 28,
              fontSize: '0.74rem',
              fontWeight: 700,
              borderRadius: 1.8,
              px: 1.2,
              borderColor: '#CBD5E1',
              backgroundColor: showCalendar ? '#EA580C' : '#FFFFFF',
              color: showCalendar ? '#FFFFFF' : '#475569',
              '&:hover': {
                backgroundColor: showCalendar ? '#C2410C' : '#F8FAFC',
              },
            }}
          >
            {showCalendar ? 'Quick View' : 'Custom Calendar'}
          </Button>
        </Box>

        {/* Expandable Custom Mini Calendar */}
        <Collapse in={showCalendar} unmountOnExit>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1.5,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #EA580C',
              borderRadius: 3,
              boxShadow: '0 4px 16px -2px rgba(234, 88, 12, 0.15)',
            }}
          >
            {/* Month / Year Navigator */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <IconButton
                size="small"
                onClick={prevMonth}
                sx={{ p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.5, color: '#64748B' }}
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                {calendarViewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Typography>

              <IconButton
                size="small"
                onClick={nextMonth}
                sx={{ p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.5, color: '#64748B' }}
              >
                <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Weekday Names */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', mb: 0.8 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName, idx) => (
                <Typography key={idx} sx={{ fontSize: '0.7rem', fontWeight: 800, color: idx === 0 || idx === 6 ? '#EA580C' : '#94A3B8' }}>
                  {dayName}
                </Typography>
              ))}
            </Box>

            {/* Day Cells Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {calendarGrid.map((item, idx) => {
                const isSelected = isSameDay(item.date, selectedDate);
                const isCurrentToday = isSameDay(item.date, today);

                return (
                  <Button
                    key={idx}
                    onClick={() => handleSelectDate(item.date)}
                    sx={{
                      minWidth: 0,
                      height: 32,
                      p: 0,
                      fontSize: '0.78rem',
                      fontWeight: isSelected || isCurrentToday ? 800 : item.isCurrentMonth ? 600 : 400,
                      borderRadius: 1.8,
                      border: isSelected ? '1px solid #EA580C' : isCurrentToday ? '1px solid #FFEDD5' : '1px solid transparent',
                      backgroundColor: isSelected
                        ? '#EA580C'
                        : isCurrentToday
                        ? '#FFF7ED'
                        : 'transparent',
                      color: isSelected
                        ? '#FFFFFF'
                        : isCurrentToday
                        ? '#EA580C'
                        : item.isCurrentMonth
                        ? '#0F172A'
                        : '#CBD5E1',
                      boxShadow: isSelected ? '0 2px 6px rgba(234, 88, 12, 0.35)' : 'none',
                      transition: 'all 0.12s ease',
                      '&:hover': {
                        backgroundColor: isSelected ? '#C2410C' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                      },
                    }}
                  >
                    {item.date.getDate()}
                  </Button>
                );
              })}
            </Box>

            {/* Calendar Quick Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1, borderTop: '1px solid #F1F5F9' }}>
              <Button
                size="small"
                startIcon={<TodayRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleSelectDate(new Date())}
                sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#EA580C' }}
              >
                Today
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => setShowCalendar(false)}
                sx={{ fontSize: '0.74rem', fontWeight: 800, borderRadius: 1.5, height: 26, px: 1.5 }}
              >
                Confirm Date
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {/* 7-Day Quick Ribbon (Always available or when calendar is collapsed) */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.8,
            overflowX: 'auto',
            pb: 0.8,
            pt: 0.2,
            px: 0.2,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {quickDays.map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);

            return (
              <Button
                key={i}
                onClick={() => handleSelectDate(d)}
                sx={{
                  flex: '0 0 auto',
                  minWidth: 64,
                  py: 0.6,
                  px: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 2,
                  border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#EA580C' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#0F172A',
                  boxShadow: isSelected ? '0 3px 8px rgba(234, 88, 12, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: isSelected ? '#C2410C' : '#FFF7ED',
                    borderColor: '#EA580C',
                  },
                }}
              >
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>
                  {i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2, my: 0.2 }}>
                  {d.getDate()}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                  {d.toLocaleDateString(undefined, { month: 'short' })}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* 2. Stylish Time Slot Picker (Morning / Afternoon / Evening) */}
      <Box sx={{ mt: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#EA580C' }} />
            <span>Select Time Slot / நேரம்</span>
          </Typography>
          
          {durationMin > 0 && (
            <Chip
              label={`${durationMin} mins slot`}
              size="small"
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#2563EB' }}
            />
          )}
        </Box>

        {/* Period Tabs */}
        <Box
          sx={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: 2,
            p: '2px',
            mb: 1.2,
          }}
        >
          {[
            { id: 'morning', label: 'Morning (8-12)', icon: <WbSunnyRoundedIcon sx={{ fontSize: 14 }} /> },
            { id: 'afternoon', label: 'Afternoon (12-4)', icon: <WbTwilightRoundedIcon sx={{ fontSize: 14 }} /> },
            { id: 'evening', label: 'Evening (4-8)', icon: <NightlightRoundIcon sx={{ fontSize: 14 }} /> },
          ].map((tab) => {
            const isActive = timePeriodTab === tab.id;
            return (
              <Button
                key={tab.id}
                fullWidth
                size="small"
                onClick={() => setTimePeriodTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  py: 0.6,
                  borderRadius: 1.8,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: isActive ? '#EA580C' : '#64748B',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  '&:hover': {
                    backgroundColor: isActive ? '#FFFFFF' : '#E2E8F0',
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {/* Tactile Slot Chips */}
        <Grid container spacing={1}>
          {currentSlots.map((slot, idx) => {
            const isSelected = selectedHour === slot.h && selectedMinute === slot.m;
            return (
              <Grid item xs={3} sm={3} key={idx}>
                <Button
                  fullWidth
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={isSelected ? 'primary' : 'inherit'}
                  onClick={() => handleSelectSlot(slot.h, slot.m)}
                  sx={{
                    py: 0.8,
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    height: 36,
                    borderColor: isSelected ? '#EA580C' : '#E2E8F0',
                    backgroundColor: isSelected ? '#EA580C' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    boxShadow: isSelected ? '0 2px 6px rgba(234, 88, 12, 0.3)' : 'none',
                    '&:hover': {
                      backgroundColor: isSelected ? '#C2410C' : '#FFF7ED',
                      borderColor: '#EA580C',
                    },
                  }}
                >
                  {slot.label}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Selected Slot Summary Badge */}
      <Box
        sx={{
          p: 1.2,
          px: 1.6,
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <CheckCircleRoundedIcon sx={{ color: '#EA580C', fontSize: 18 }} />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#C2410C' }}>
            Confirmed Time Slot:
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#EA580C' }}>
          {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
          {selectedHour > 12 ? `${selectedHour - 12}:${String(selectedMinute).padStart(2, '0')} PM` : selectedHour === 12 ? `12:${String(selectedMinute).padStart(2, '0')} PM` : `${selectedHour}:${String(selectedMinute).padStart(2, '0')} AM`}
        </Typography>
      </Box>
    </Box>
  );
}
