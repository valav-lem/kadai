import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function NewCustomerModal({ isOpen, onClose, onCreated }) {
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('Customer name is required');
      if (!mobile.trim()) throw new Error('Mobile number is required');

      await onCreated({
        name: name.trim(),
        mobile: mobile.trim(),
        gstin: gstin.trim() || null,
      });

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">👤 {t('customers.add')}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--status-cancelled-bg)',
            color: 'var(--status-cancelled)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('customers.name')}</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kannan Traders · கண்ணன் டிரேடர்ஸ்"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('customers.mobile')}</label>
            <input
              type="tel"
              required
              className="form-input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9840123456"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('customers.gstin')} (Optional for B2B)</label>
            <input
              type="text"
              className="form-input"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="33AAAAA0000A1Z5"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : `💾 ${t('common.save')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
