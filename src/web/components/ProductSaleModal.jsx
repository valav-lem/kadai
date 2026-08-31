import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '../lib/i18n.jsx';

export default function ProductSaleModal({
  isOpen,
  onClose,
  product,
  customers = [],
  shopConfig,
  onSaleComplete,
}) {
  const { t, formatMoney } = useI18n();
  const canvasRef = useRef(null);

  const [qty, setQty] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('walkin');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxQty = product?.stock_qty || 0;
  const totalPricePaise = (product?.price_paise || 0) * qty;
  const totalRupees = (totalPricePaise / 100).toFixed(2);
  const upiId = shopConfig?.upi_id || 'annachikadai@okhdfcbank';
  const shopName = shopConfig?.legal_name || 'Kadai Shop';

  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${totalRupees}&tn=Product_Sale_${product?.name || 'Retail'}&cu=INR`;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setSelectedCustomerId('walkin');
      setPaymentMode('cash');
      setError(null);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen && canvasRef.current && paymentMode === 'upi') {
      QRCode.toCanvas(canvasRef.current, upiPayload, {
        width: 180,
        margin: 2,
        color: {
          dark: '#27211C',
          light: '#FFFFFF',
        },
      }).catch((err) => console.error('QR error:', err));
    }
  }, [isOpen, paymentMode, upiPayload]);

  if (!isOpen || !product) return null;

  const handleSale = async () => {
    if (qty <= 0 || qty > maxQty) {
      setError(`Quantity must be between 1 and available stock (${maxQty})`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSaleComplete({
        productId: product.id,
        productName: product.name,
        qty,
        totalPaise: totalPricePaise,
        paymentMode,
        customerId: selectedCustomerId !== 'walkin' ? selectedCustomerId : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record product sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🧴 {t('catalogue.productSaleTitle')}</h2>
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

        <div style={{ padding: '14px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{product.name}</div>
            <span className="b2b-badge">{product.hsn || 'HSN: 3305'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            <span>Unit Price: <strong>{formatMoney(product.price_paise)}</strong></span>
            <span>Available Stock: <strong style={{ color: maxQty < 5 ? 'var(--color-terracotta)' : 'inherit' }}>{maxQty} units</strong></span>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="form-group">
          <label className="form-label">{t('catalogue.saleQuantity')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '48px', height: '44px', fontSize: '20px' }}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
            >
              -
            </button>
            <input
              type="number"
              className="form-input"
              style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, width: '80px' }}
              value={qty}
              min="1"
              max={maxQty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setQty(Math.min(maxQty, Math.max(1, val)));
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '48px', height: '44px', fontSize: '20px' }}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
            >
              +
            </button>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Total Amount</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-terracotta)', fontFamily: 'var(--font-heading)' }}>
                {formatMoney(totalPricePaise)}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Selector */}
        <div className="form-group">
          <label className="form-label">{t('booking.selectCustomer')}</label>
          <select
            className="form-select"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="walkin">👤 Walk-in Retail Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mobile}) {c.gstin ? `[B2B: ${c.gstin}]` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Mode Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('payment.mode')}</label>
          <div className="payment-modes-grid" style={{ marginTop: '6px' }}>
            <button
              type="button"
              className={`tap-option-btn ${paymentMode === 'cash' ? 'selected' : ''}`}
              onClick={() => setPaymentMode('cash')}
            >
              💵 {t('payment.cash')}
            </button>
            <button
              type="button"
              className={`tap-option-btn ${paymentMode === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMode('upi')}
            >
              📱 {t('payment.upiQr')}
            </button>
            <button
              type="button"
              className={`tap-option-btn ${paymentMode === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMode('card')}
            >
              💳 {t('payment.card')}
            </button>
          </div>
        </div>

        {/* Dynamic UPI QR */}
        {paymentMode === 'upi' && (
          <div className="qr-container" style={{ padding: '12px', margin: '12px 0 0' }}>
            <canvas ref={canvasRef} style={{ width: '180px', height: '180px' }} />
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              UPI: <strong>{upiId}</strong> ({formatMoney(totalPricePaise)})
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-sage"
            disabled={loading || maxQty <= 0}
            onClick={handleSale}
          >
            {loading ? t('common.loading') : `✅ Record Sale (${formatMoney(totalPricePaise)})`}
          </button>
        </div>
      </div>
    </div>
  );
}
