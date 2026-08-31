import React, { createContext, useContext, useState, useEffect } from 'react';
import enCatalog from '../../../locales/en.json';
import taCatalog from '../../../locales/ta.json';

const I18nContext = createContext(null);

export const catalogs = {
  en: enCatalog,
  ta: taCatalog,
};

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('kadai_locale') || 'ta';
  });

  const setLocale = (newLocale) => {
    if (newLocale === 'ta' || newLocale === 'en') {
      setLocaleState(newLocale);
      localStorage.setItem('kadai_locale', newLocale);
      document.documentElement.lang = newLocale;
      if (newLocale === 'ta') {
        document.body.classList.add('lang-ta');
      } else {
        document.body.classList.remove('lang-ta');
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    if (locale === 'ta') {
      document.body.classList.add('lang-ta');
    } else {
      document.body.classList.remove('lang-ta');
    }
  }, [locale]);

  const t = (key, fallback = '') => {
    const activeCatalog = catalogs[locale] || catalogs.ta;
    return activeCatalog[key] || catalogs.en[key] || fallback || key;
  };

  // Indian currency formatter: ₹1,23,456
  const formatMoney = (paise) => {
    if (paise === null || paise === undefined) return '₹0';
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    }).format(rupees);
  };

  // Format date in Indian context
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time (e.g. 10:30 AM)
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatMoney, formatDate, formatTime }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
