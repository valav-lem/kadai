import React from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function Header({
  activeTab,
  setActiveTab,
  staffList,
  currentStaff,
  setCurrentStaff,
  isOnline,
  offlineCount,
  onOpenQuickBook,
}) {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="app-header">
      <div className="brand-section">
        <a href="#dashboard" onClick={() => setActiveTab('dashboard')} className="brand-title">
          <span>Kadai · கடை</span>
          <span className="brand-badge">M1</span>
        </a>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 {t('nav.dashboard')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 {t('nav.calendar')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'catalogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogue')}
        >
          📦 {t('nav.catalogue')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 {t('nav.customers')}
        </button>
      </nav>

      <div className="header-controls">
        <button className="btn btn-primary btn-sm" onClick={onOpenQuickBook}>
          ⚡ {t('booking.quickWalkIn')}
        </button>

        {/* Staff Selector */}
        {staffList && staffList.length > 0 && (
          <div className="staff-selector">
            <span
              className="staff-dot"
              style={{ backgroundColor: currentStaff?.colour || '#C85A32' }}
            />
            <select
              className="staff-select-input"
              value={currentStaff?.id || ''}
              onChange={(e) => {
                const found = staffList.find((s) => String(s.id) === e.target.value);
                if (found) setCurrentStaff(found);
              }}
            >
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Network Status */}
        <div className={`network-badge ${isOnline ? 'online' : 'offline'}`}>
          <span>{isOnline ? '🟢' : '🟠'}</span>
          <span>{isOnline ? t('common.online') : `${t('common.offline')} (${offlineCount})`}</span>
        </div>

        {/* Language Switcher */}
        <button
          className="lang-toggle-btn"
          onClick={() => setLocale(locale === 'ta' ? 'en' : 'ta')}
          title="Switch Language / மொழியை மாற்றவும்"
        >
          {locale === 'ta' ? 'English' : 'தமிழ்'}
        </button>
      </div>
    </header>
  );
}
