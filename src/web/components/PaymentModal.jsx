import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useI18n } from '../lib/i18n.jsx';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  shopConfig,
  onComplete,
}) {
  const { t, formatMoney } = useI18n();
  const canvasRef = useRef(null);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [isRecording, setIsRecording] = useState(false);

  const amountPaise = booking?.price_paise || 0;
  const amountRupees = (amountPaise / 100).toFixed(2);
  const upiId = shopConfig?.upi_id || 'annachikadai@okhdfcbank';
  const shopName = shopConfig?.legal_name || 'Kadai Shop';

  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amountRupees}&tn=Booking_${booking?.id || 'Bill'}&cu=INR`;

  useEffect(() => {
    if (isOpen && canvasRef.current && paymentMode === 'upi') {
      QRCode.toCanvas(canvasRef.current, upiPayload, {
        width: 220,
        margin: 2,
        color: {
          dark: '#27211C',
          light: '#FFFFFF',
        },
      }).catch((err) => console.error('QR rendering error:', err));
    }
  }, [isOpen, paymentMode, upiPayload]);

  if (!isOpen || !booking) return null;

  const handleRecordPayment = async () => {
    setIsRecording(true);
    try {
      await onComplete(booking.id, paymentMode);
      onClose();
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💳 {t('payment.title')}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {booking.customer_name} • {booking.item_name}
          </div>
          <div style={{ fontSize: 'var(--font-size-metric)', fontFamily: 'var(--font-heading)', color: 'var(--color-terracotta)', marginTop: '6px' }}>
            {formatMoney(amountPaise)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {t('catalogue.slab')}: {booking.gst_slab}% GST included
          </div>
        </div>

        {/* Mode Selector */}
        <div className="payment-modes-grid">
          <button
            type="button"
            className={`tap-option-btn ${paymentMode === 'upi' ? 'selected' : ''}`}
            onClick={() => setPaymentMode('upi')}
          >
            📱 {t('payment.upiQr')}
          </button>
          <button
            type="button"
            className={`tap-option-btn ${paymentMode === 'cash' ? 'selected' : ''}`}
            onClick={() => setPaymentMode('cash')}
          >
            💵 {t('payment.cash')}
          </button>
          <button
            type="button"
            className={`tap-option-btn ${paymentMode === 'card' ? 'selected' : ''}`}
            onClick={() => setPaymentMode('card')}
          >
            💳 {t('payment.card')}
          </button>
        </div>

        {/* Dynamic UPI QR Display */}
        {paymentMode === 'upi' && (
          <div className="qr-container">
            <canvas ref={canvasRef} className="qr-canvas" />
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '8px' }}>
              {t('payment.upiInstructions')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              UPI ID: <strong>{upiId}</strong>
            </div>
          </div>
        )}

        {paymentMode === 'cash' && (
          <div style={{
            background: 'var(--status-completed-bg)',
            color: 'var(--status-completed)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            margin: '20px 0',
            fontWeight: 700,
          }}>
            💵 Collect cash of {formatMoney(amountPaise)} at the counter.
          </div>
        )}

        {paymentMode === 'card' && (
          <div style={{
            background: 'var(--color-surface)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            margin: '20px 0',
            fontWeight: 600,
          }}>
            💳 Swipe on counter POS terminal for {formatMoney(amountPaise)}.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
          <button
            type="button"
            className="btn btn-sage"
            disabled={isRecording}
            onClick={handleRecordPayment}
          >
            {isRecording ? t('common.loading') : `✅ ${t('payment.paid')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
