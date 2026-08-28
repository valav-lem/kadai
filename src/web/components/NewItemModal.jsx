import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function NewItemModal({ isOpen, onClose, onCreated }) {
  const { t } = useI18n();

  const [kind, setKind] = useState('service');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hsn, setHsn] = useState('');
  const [sac, setSac] = useState('');
  const [gstSlab, setGstSlab] = useState('18');
  const [priceRupees, setPriceRupees] = useState('');
  const [durationMin, setDurationMin] = useState('30');
  const [stockQty, setStockQty] = useState('10');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [bookableOnline, setBookableOnline] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const pricePaise = Math.round(parseFloat(priceRupees) * 100);
      if (isNaN(pricePaise) || pricePaise <= 0) {
        throw new Error('Please enter a valid price');
      }

      const payload = {
        kind,
        name,
        description,
        gst_slab: parseFloat(gstSlab),
        price_paise: pricePaise,
        bookable_online: bookableOnline,
      };

      if (kind === 'product') {
        payload.hsn = hsn;
        payload.stock_qty = parseInt(stockQty, 10) || 0;
        payload.reorder_point = parseInt(reorderPoint, 10) || 0;
      } else {
        payload.sac = sac;
        payload.duration_min = parseInt(durationMin, 10) || 30;
      }

      await onCreated(payload);
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
          <h2 className="modal-title">📦 {t('catalogue.addItem')}</h2>
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
            <label className="form-label">Type / வகை</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className={`tap-option-btn ${kind === 'service' ? 'selected' : ''}`}
                onClick={() => setKind('service')}
              >
                ✂️ {t('catalogue.tab.services')}
              </button>
              <button
                type="button"
                className={`tap-option-btn ${kind === 'product' ? 'selected' : ''}`}
                onClick={() => setKind('product')}
              >
                🧴 {t('catalogue.tab.products')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('catalogue.name')}</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Haircut & Styling · முடி திருத்தம்"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('catalogue.description')}</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {kind === 'product' ? (
              <div className="form-group">
                <label className="form-label">{t('catalogue.hsn')} Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  placeholder="e.g. 33051010"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">{t('catalogue.sac')} Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={sac}
                  onChange={(e) => setSac(e.target.value)}
                  placeholder="e.g. 999721"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('catalogue.slab')}</label>
              <select
                className="form-select"
                value={gstSlab}
                onChange={(e) => setGstSlab(e.target.value)}
              >
                <option value="0">0% (Nil Rated)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard)</option>
                <option value="28">28% GST</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">{t('catalogue.price')}</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="250.00"
              />
            </div>

            {kind === 'service' ? (
              <div className="form-group">
                <label className="form-label">{t('catalogue.duration')}</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="30"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">{t('catalogue.stock')}</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                />
              </div>
            )}
          </div>

          {kind === 'product' && (
            <div className="form-group">
              <label className="form-label">{t('catalogue.reorderPoint')}</label>
              <input
                type="number"
                className="form-input"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
              />
            </div>
          )}

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
