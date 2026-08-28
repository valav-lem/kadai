import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function OwnerPinModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = null,
  ownerPin = '1234',
}) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsShaking(false);
      setTimeout(() => {
        if (containerRef.current) containerRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === ownerPin) {
      onSuccess();
      onClose();
    } else {
      setError(t('auth.pinIncorrect'));
      setIsShaking(true);
      setTimeout(() => {
        setPin('');
        setIsShaking(false);
      }, 600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-content ${isShaking ? 'shake-animation' : ''}`}
        style={{ maxWidth: '420px', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={containerRef}
      >
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 {t('auth.ownerPinTitle')}
          </h2>
          <button
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', right: 0 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', marginBottom: '16px' }}>
          {actionTitle ? `${actionTitle} — ` : ''}{t('auth.enterPin')}
        </p>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--status-cancelled-bg)',
              color: 'var(--status-cancelled)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* PIN Dot Indicators */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            margin: '20px 0 28px',
          }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '3px solid var(--color-terracotta)',
                backgroundColor: pin.length > idx ? 'var(--color-terracotta)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Numeric Keypad for Counter Ergonomics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            maxWidth: '300px',
            margin: '0 auto 16px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="btn btn-secondary"
              style={{
                fontSize: '22px',
                fontWeight: 700,
                minHeight: '56px',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '15px', fontWeight: 600, minHeight: '56px' }}
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            key="0"
            type="button"
            className="btn btn-secondary"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              minHeight: '56px',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '20px', fontWeight: 700, minHeight: '56px' }}
            onClick={handleBackspace}
          >
            ⌫
          </button>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          {t('auth.ownerOnly')} (Default PIN: 1234)
        </div>
      </div>
    </div>
  );
}
