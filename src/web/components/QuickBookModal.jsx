import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function QuickBookModal({
  isOpen,
  onClose,
  customers,
  services,
  staffList,
  currentStaff,
  onBookingCreated,
  initialSlot = null,
}) {
  const { t, formatMoney } = useI18n();

  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(currentStaff || staffList[0]);
  const [startTime, setStartTime] = useState(() => {
    if (initialSlot) return initialSlot;
    const now = new Date();
    // Round to nearest 15 mins
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        item_id: selectedService.id,
        staff_id: selectedStaff.id,
        start_time: new Date(startTime).toISOString(),
        source: 'counter',
        status: 'confirmed',
      };

      if (selectedCustomer) {
        payload.customer_id = selectedCustomer.id;
      } else if (newCustName && newCustMobile) {
        payload.customer_name = newCustName;
        payload.customer_mobile = newCustMobile;
      } else {
        throw new Error('Please select or enter customer details');
      }

      await onBookingCreated(payload);
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
          <h2 className="modal-title">⚡ {t('booking.quickWalkIn')}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--status-cancelled-bg)',
            color: 'var(--status-cancelled)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Select or Enter Customer */}
        <div className="flow-step-box">
          <div className="flow-step-title">{t('booking.selectCustomer')}</div>
          <div className="tap-options-grid" style={{ marginBottom: '12px' }}>
            {customers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`tap-option-btn ${selectedCustomer?.id === c.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCustomer(c);
                  setNewCustName('');
                  setNewCustMobile('');
                  setStep(2);
                }}
              >
                <span>{c.name}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{c.mobile}</span>
              </button>
            ))}
          </div>

          {!selectedCustomer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder={t('customers.name')}
                className="form-input"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
              />
              <input
                type="tel"
                placeholder={t('customers.mobile')}
                className="form-input"
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* STEP 2: Select Service */}
        <div className="flow-step-box">
          <div className="flow-step-title">{t('booking.selectService')}</div>
          <div className="tap-options-grid">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`tap-option-btn ${selectedService?.id === s.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedService(s);
                  setStep(3);
                }}
              >
                <span>{s.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                  {formatMoney(s.price_paise)} • {s.duration_min} {t('common.mins')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Staff & Slot */}
        <div className="flow-step-box">
          <div className="flow-step-title">{t('booking.selectStaff')}</div>
          <div className="tap-options-grid" style={{ marginBottom: '12px' }}>
            {staffList.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`tap-option-btn ${selectedStaff?.id === st.id ? 'selected' : ''}`}
                onClick={() => setSelectedStaff(st)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="staff-dot" style={{ backgroundColor: st.colour }} />
                  {st.name}
                </span>
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('booking.selectSlot')}</label>
            <input
              type="datetime-local"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        {/* STEP 4: Confirm Booking */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !selectedService || (!selectedCustomer && (!newCustName || !newCustMobile))}
            onClick={handleCreate}
          >
            {loading ? t('common.loading') : `⚡ ${t('booking.confirmAndSave')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
