import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function RescheduleModal({
  isOpen,
  onClose,
  booking,
  staffList,
  services = [],
  onReschedule,
}) {
  const { t, formatMoney } = useI18n();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setError(null);
      setSelectedStaffId(booking.staff_id || '');
      setSelectedItemId(booking.item_id || '');
      setNotes(booking.notes || '');

      if (booking.start_time) {
        const d = new Date(booking.start_time);
        const pad = (n) => String(n).padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setStartTime(localIso);
      }
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!startTime) {
        throw new Error('Please select a valid time slot');
      }

      const updatePayload = {
        staff_id: selectedStaffId ? parseInt(selectedStaffId, 10) : booking.staff_id,
        item_id: selectedItemId ? parseInt(selectedItemId, 10) : booking.item_id,
        start_time: new Date(startTime).toISOString(),
        notes: notes.trim() || null,
      };

      await onReschedule(booking.id, updatePayload);
      onClose();
    } catch (err) {
      setError(err.message || t('booking.error.doubleBooked'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📅 {t('booking.rescheduleTitle')}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--status-cancelled-bg)',
              color: 'var(--status-cancelled)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{booking.customer_name}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '2px' }}>
            📞 {booking.customer_mobile} • Current: {booking.item_name} ({formatMoney(booking.price_paise)})
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('booking.selectService')}</label>
          <select
            className="form-select"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_min} {t('common.mins')} • {formatMoney(s.price_paise)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('booking.selectStaff')}</label>
          <select
            className="form-select"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('booking.selectSlot')}</label>
          <input
            type="datetime-local"
            className="form-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('customers.notes')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="Special requests or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? t('common.loading') : `💾 ${t('common.save')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
