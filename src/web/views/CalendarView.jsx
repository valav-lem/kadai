import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function CalendarView({
  bookings,
  staffList,
  onOpenQuickBook,
  onOpenPayment,
  onStatusChange,
}) {
  const { t, formatMoney, formatTime } = useI18n();

  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate 7 days for current week offset
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7); // Monday start
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

  return (
    <div className="calendar-view-container">
      {/* Calendar Control Bar */}
      <div className="calendar-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((w) => w - 1)}>
            ◀ Prev Week
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)}>
            {t('common.today')}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Next Week ▶
          </button>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginLeft: '8px' }}>
            {days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Staff Filter Pills */}
        <div className="calendar-staff-filters">
          <button
            className={`staff-filter-pill ${selectedStaffId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStaffId('all')}
          >
            {t('common.allStaff')}
          </button>
          {staffList.map((st) => (
            <button
              key={st.id}
              className={`staff-filter-pill ${String(selectedStaffId) === String(st.id) ? 'active' : ''}`}
              onClick={() => setSelectedStaffId(st.id)}
            >
              <span className="staff-dot" style={{ backgroundColor: st.colour }} />
              {st.name}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => onOpenQuickBook()}>
          + {t('booking.new')}
        </button>
      </div>

      {/* Week Time Grid */}
      <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
        <div className="calendar-week-grid">
          {/* Top Left Empty Cell */}
          <div className="time-gutter-slot">Time</div>

          {/* 7 Day Column Headers */}
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <div key={i} className={`grid-day-header ${isToday ? 'today' : ''}`}>
                <div>{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div style={{ fontSize: '18px', marginTop: '2px' }}>{d.getDate()}</div>
              </div>
            );
          })}

          {/* Time Slots */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="time-gutter-slot">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>

              {days.map((d, dayIdx) => {
                const slotBookings = getBookingsForSlot(d, hour);
                const slotIso = new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate(),
                  hour,
                  0,
                  0
                ).toISOString().slice(0, 16);

                return (
                  <div
                    key={dayIdx}
                    className="grid-cell"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        onOpenQuickBook(slotIso);
                      }
                    }}
                  >
                    {slotBookings.map((b) => (
                      <div
                        key={b.id}
                        className="booking-card-item"
                        style={{ borderLeftColor: b.staff_colour || 'var(--color-terracotta)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (b.status === 'arrived') {
                            onOpenPayment(b);
                          } else if (b.status === 'confirmed') {
                            onStatusChange(b.id, 'arrived');
                          }
                        }}
                      >
                        <div className="booking-card-header">
                          <span>{b.customer_name}</span>
                          <span className={`status-badge ${b.status}`} style={{ fontSize: '10px' }}>
                            {t(`booking.status.${b.status}`)}
                          </span>
                        </div>
                        <div className="booking-card-body">
                          <div>{b.item_name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span>{formatTime(b.start_time)}</span>
                            <span style={{ fontWeight: 600 }}>{formatMoney(b.price_paise)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
