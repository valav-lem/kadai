import React from 'react';
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

  return (
    <div>
      {/* Metric Cards Row */}
      <div className="dashboard-metrics-grid">
        <div className="card metric-card">
          <span className="metric-label">{t('dashboard.todayAppointments')}</span>
          <span className="metric-value">{stats?.today?.total_today || todayBookings.length}</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {stats?.today?.completed_count || 0} completed • {stats?.today?.arrived_count || 0} in progress
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-label">{t('dashboard.pendingArrivals')}</span>
          <span className="metric-value" style={{ color: 'var(--color-slate)' }}>
            {(stats?.today?.confirmed_count || 0) + (stats?.today?.pending_count || 0)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Ready for counter check-in
          </span>
        </div>

        <div className={`card metric-card ${lowStockItems.length > 0 ? 'alert' : ''}`}>
          <span className="metric-label">{t('dashboard.lowStockItems')}</span>
          <span className="metric-value">
            {stats?.low_stock_count || lowStockItems.length}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {lowStockItems.length > 0 ? 'Reorder needed immediately' : 'All stock levels healthy'}
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-label">{t('dashboard.activeStaff')}</span>
          <span className="metric-value" style={{ color: 'var(--color-sage)' }}>
            {stats?.active_staff_count || 3}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Active on the counter calendar
          </span>
        </div>
      </div>

      {/* Action Banner */}
      <div style={{
        background: 'var(--color-terracotta)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: 'var(--font-size-xl)' }}>
            {t('dashboard.quickAction')}
          </h2>
          <p style={{ opacity: 0.9, marginTop: '4px', fontSize: 'var(--font-size-base)' }}>
            Walk-in customer standing at the counter? Book in 4 taps with zero paper diary.
          </p>
        </div>
        <button
          className="btn"
          style={{ background: '#ffffff', color: 'var(--color-terracotta)', fontWeight: 700, fontSize: '18px' }}
          onClick={onOpenQuickBook}
        >
          ⚡ {t('dashboard.newWalkIn')}
        </button>
      </div>

      {/* Today's Bookings Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>📅 {t('dashboard.todayAppointments')}</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('calendar')}>
              {t('nav.calendar')} →
            </button>
          </div>

          {todayBookings.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {t('booking.noBookings')}
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{formatTime(b.start_time)}</td>
                      <td>
                        <strong>{b.customer_name}</strong>
                        {b.customer_gstin && <span className="b2b-badge" style={{ marginLeft: '6px' }}>B2B</span>}
                      </td>
                      <td>{b.item_name}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="staff-dot" style={{ backgroundColor: b.staff_colour }} />
                          {b.staff_name}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${b.status}`}>{t(`booking.status.${b.status}`)}</span>
                      </td>
                      <td>
                        {b.status === 'confirmed' && (
                          <button
                            className="btn btn-sage btn-sm"
                            onClick={() => onStatusChange(b.id, 'arrived')}
                          >
                            👋 {t('booking.tapToArrive')}
                          </button>
                        )}
                        {b.status === 'arrived' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenPayment(b)}
                          >
                            💳 {t('payment.title')}
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <span style={{ color: 'var(--status-completed)', fontWeight: 700 }}>
                            ✓ Paid ({formatMoney(b.price_paise)})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>⚠️ {t('catalogue.lowStock')}</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('catalogue')}>
              {t('nav.catalogue')} →
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--status-completed)', fontWeight: 600 }}>
              ✓ All inventory items well-stocked!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--color-surface)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--color-terracotta)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      HSN: {item.hsn} • {formatMoney(item.price_paise)}
                    </div>
                  </div>
                  <div className="low-stock-alert-badge">
                    {item.stock_qty} left (Min {item.reorder_point})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
