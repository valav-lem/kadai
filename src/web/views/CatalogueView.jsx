import React, { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function CatalogueView({
  items,
  currentStaff,
  onOpenAddItem,
  onAdjustStock,
  onRequestOwnerAuth,
}) {
  const { t, formatMoney } = useI18n();

  const [activeTab, setActiveTab] = useState('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlab, setSelectedSlab] = useState('all');

  const isOwner = currentStaff?.role === 'owner';

  const handleAddItemClick = () => {
    if (isOwner) {
      onOpenAddItem();
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onOpenAddItem(), t('catalogue.addItem'));
    } else {
      onOpenAddItem();
    }
  };

  const handleStockAdjustClick = (itemId, delta) => {
    if (isOwner) {
      onAdjustStock(itemId, delta);
    } else if (onRequestOwnerAuth) {
      onRequestOwnerAuth(() => onAdjustStock(itemId, delta), 'Stock Adjustment');
    } else {
      onAdjustStock(itemId, delta);
    }
  };

  const filteredItems = items.filter((item) => {
    if (item.kind !== activeTab) return false;
    if (selectedSlab !== 'all' && String(item.gst_slab) !== String(selectedSlab)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(term);
      const matchDesc = item.description?.toLowerCase().includes(term);
      const matchHsn = item.hsn?.toLowerCase().includes(term);
      const matchSac = item.sac?.toLowerCase().includes(term);
      if (!matchName && !matchDesc && !matchHsn && !matchSac) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Search Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className={`nav-btn ${activeTab === 'service' ? 'active' : ''}`}
            onClick={() => setActiveTab('service')}
          >
            ✂️ {t('catalogue.tab.services')}
          </button>
          <button
            className={`nav-btn ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            🧴 {t('catalogue.tab.products')}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '500px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={t('catalogue.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={selectedSlab}
            onChange={(e) => setSelectedSlab(e.target.value)}
          >
            <option value="all">{t('catalogue.allSlabs')}</option>
            <option value="0">0% GST</option>
            <option value="5">5% GST</option>
            <option value="12">12% GST</option>
            <option value="18">18% GST</option>
            <option value="28">28% GST</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isOwner && (
            <span className="role-lock-badge" title={t('auth.ownerOnly')}>
              🔒 {t('auth.ownerOnly')}
            </span>
          )}
          <button className="btn btn-primary" onClick={handleAddItemClick}>
            {!isOwner ? '🔒 ' : ''}{t('catalogue.addItem')}
          </button>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('catalogue.name')}</th>
              <th>{activeTab === 'product' ? t('catalogue.hsn') : t('catalogue.sac')}</th>
              <th>{t('catalogue.slab')}</th>
              <th>{t('catalogue.price')}</th>
              <th>{activeTab === 'product' ? t('catalogue.stock') : t('catalogue.duration')}</th>
              <th>Online</th>
              {activeTab === 'product' && <th>Adjust Stock</th>}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  No items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = activeTab === 'product' && item.stock_qty <= item.reorder_point;
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="b2b-badge">
                        {activeTab === 'product' ? item.hsn : item.sac}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge confirmed">{item.gst_slab}%</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '18px' }}>
                      {formatMoney(item.price_paise)}
                    </td>
                    <td>
                      {activeTab === 'service' ? (
                        <span>{item.duration_min} {t('common.mins')}</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '18px' }}>{item.stock_qty}</span>
                          {isLowStock && (
                            <span className="low-stock-alert-badge">
                              ⚠️ Low (Min {item.reorder_point})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {item.bookable_online ? '🌐 Yes' : '—'}
                    </td>
                    {activeTab === 'product' && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStockAdjustClick(item.id, -1)}
                            disabled={item.stock_qty <= 0}
                            title={!isOwner ? `${t('auth.ownerOnly')} (-1)` : 'Decrement stock'}
                          >
                            {!isOwner ? '🔒 ' : ''}-1
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStockAdjustClick(item.id, 1)}
                            title={!isOwner ? `${t('auth.ownerOnly')} (+1)` : 'Increment stock'}
                          >
                            {!isOwner ? '🔒 ' : ''}+1
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStockAdjustClick(item.id, 10)}
                            title={!isOwner ? `${t('auth.ownerOnly')} (+10)` : 'Add batch of 10'}
                          >
                            {!isOwner ? '🔒 ' : ''}+10
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
