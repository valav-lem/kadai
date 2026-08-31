import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function CustomersView({
  customers,
  onOpenAddCustomer,
  onBookForCustomer,
}) {
  const { t, formatMoney } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.gstin?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, maxWidth: '450px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={t('customers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={onOpenAddCustomer}>
          {t('customers.add')}
        </button>
      </div>

      {/* Customers Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('customers.name')}</th>
              <th>{t('customers.mobile')}</th>
              <th>{t('customers.gstin')}</th>
              <th>{t('customers.visits')}</th>
              <th>{t('customers.spent')}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  {t('customers.noCustomers')}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{customer.name}</span>
                      {customer.gstin && (
                        <span className="b2b-badge">{t('customers.b2bBadge')}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    +91 {customer.mobile}
                  </td>
                  <td>
                    {customer.gstin ? (
                      <code style={{ background: 'var(--color-surface)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                        {customer.gstin}
                      </code>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{customer.visit_count || 0}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-terracotta)', fontSize: '18px' }}>
                    {formatMoney(customer.lifetime_paise || 0)}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onBookForCustomer(customer)}
                    >
                      ⚡ {t('booking.new')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
