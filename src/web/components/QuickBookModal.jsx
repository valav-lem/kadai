import React, { useState, useEffect } from 'react';
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
  initialStaffId = null,
}) {
  const { t, formatMoney } = useI18n();

  const [step, setStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(currentStaff || staffList[0]);
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setStep(1);
      setCustomerSearch('');
      setSelectedCustomer(null);
      setNewCustName('');
      setNewCustMobile('');
      setSelectedService(services[0] || null);

      if (initialStaffId) {
        const matchingStaff = staffList.find((s) => String(s.id) === String(initialStaffId));
        if (matchingStaff) setSelectedStaff(matchingStaff);
        else setSelectedStaff(currentStaff || staffList[0]);
      } else {
        setSelectedStaff(currentStaff || staffList[0]);
      }

      if (initialSlot) {
        setStartTime(initialSlot);
      } else {
        const now = new Date();
        const minutes = Math.ceil(now.getMinutes() / 15) * 15;
        now.setMinutes(minutes, 0, 0);
        // Format to YYYY-MM-DDTHH:MM in local time
        const pad = (n) => String(n).padStart(2, '0');
        const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        setStartTime(localIso);
      }
    }
  }, [isOpen, initialSlot, initialStaffId, currentStaff, services, staffList]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const term = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.mobile.includes(term);
  });

  const handleCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!selectedService) {
        throw new Error('Please select a service');
      }
      if (!selectedStaff) {
        throw new Error('Please select a staff member');
      }
      if (!startTime) {
        throw new Error('Please select a time slot');
      }

      const payload = {
        item_id: selectedService.id,
        staff_id: selectedStaff.id,
        start_time: new Date(startTime).toISOString(),
        source: 'counter',
        status: 'confirmed',
      };

      if (selectedCustomer) {
        payload.customer_id = selectedCustomer.id;
      } else if (newCustName.trim() && newCustMobile.trim()) {
        payload.customer_name = newCustName.trim();
        payload.customer_mobile = newCustMobile.trim();
      } else {
        throw new Error('Please select an existing customer or enter new customer details');
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

        {/* STEP 1: Select or Enter Customer */}
        <div className="flow-step-box">
          <div className="flow-step-title">{t('booking.selectCustomer')}</div>

          {selectedCustomer ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--color-terracotta)',
              }}
            >
              <div>
                <strong style={{ fontSize: '16px' }}>{selectedCustomer.name}</strong>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  📞 {selectedCustomer.mobile}
                </span>
                {selectedCustomer.gstin && (
                  <span className="b2b-badge" style={{ marginLeft: '8px' }}>
                    GST: {selectedCustomer.gstin}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕ Change
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder={`🔍 Search ${customers.length} customers by name or mobile...`}
                className="form-input"
                style={{ marginBottom: '10px' }}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />

              <div className="tap-options-grid" style={{ marginBottom: '12px', maxHeight: '160px', overflowY: 'auto' }}>
                {filteredCustomers.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="tap-option-btn"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={`+ New ${t('customers.name')}`}
                  className="form-input"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder={`+ New 10-digit ${t('customers.mobile')}`}
                  className="form-input"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                />
              </div>
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
