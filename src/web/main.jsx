import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider, useI18n } from './lib/i18n.jsx';
import Header from './components/Header.jsx';
import DashboardView from './views/DashboardView.jsx';
import CalendarView from './views/CalendarView.jsx';
import CatalogueView from './views/CatalogueView.jsx';
import CustomersView from './views/CustomersView.jsx';
import QuickBookModal from './components/QuickBookModal.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import NewItemModal from './components/NewItemModal.jsx';
import NewCustomerModal from './components/NewCustomerModal.jsx';
import OwnerPinModal from './components/OwnerPinModal.jsx';

import * as api from './lib/api.js';
import { syncOfflineQueue, getOfflineBookings } from './lib/offline.js';

function KadaiApp() {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopConfig, setShopConfig] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [catalogueItems, setCatalogueItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);

  // Modals
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isOwnerPinOpen, setIsOwnerPinOpen] = useState(false);
  const [pinActionTitle, setPinActionTitle] = useState('');
  const [pinSuccessCallback, setPinSuccessCallback] = useState(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [quickBookSlot, setQuickBookSlot] = useState(null);

  // Load initial shop & staff
  const loadShopAndStaff = async () => {
    try {
      const [shop, staff] = await Promise.all([
        api.fetchShopConfig(),
        api.fetchStaff().catch(() => [
          { id: 1, name: 'Asha · ஆஷா', role: 'owner', colour: '#C85A32', locale: 'ta', active: true },
          { id: 2, name: 'Ravi · ரவி', role: 'staff', colour: '#5B7C6E', locale: 'ta', active: true },
          { id: 3, name: 'Meera · மீரா', role: 'staff', colour: '#3B6E8C', locale: 'en', active: true },
        ]),
      ]);
      setShopConfig(shop);
      setStaffList(staff);
      if (staff.length > 0 && !currentStaff) {
        setCurrentStaff(staff[0]);
      }
    } catch (err) {
      console.error('Failed to load shop/staff:', err);
    }
  };

  const loadData = async () => {
    try {
      const [bList, cList, custs, st] = await Promise.all([
        api.fetchBookings().catch(() => []),
        api.fetchCatalogue().catch(() => []),
        api.fetchCustomers().catch(() => []),
        api.fetchDashboardStats().catch(() => null),
      ]);
      setBookings(bList);
      setCatalogueItems(cList);
      setCustomers(custs);
      setStats(st);

      const offline = await getOfflineBookings();
      setOfflineCount(offline.length);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadShopAndStaff();
    loadData();

    const handleOnline = async () => {
      setIsOnline(true);
      await syncOfflineQueue(() => {
        loadData();
      });
      const off = await getOfflineBookings();
      setOfflineCount(off.length);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (navigator.onLine) {
        await syncOfflineQueue(() => loadData());
        const off = await getOfflineBookings();
        setOfflineCount(off.length);
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleBookingCreated = async (payload) => {
    const result = await api.createBooking(payload);
    await loadData();
    return result;
  };

  const handleStatusChange = async (id, newStatus) => {
    await api.updateBookingStatus(id, newStatus);
    await loadData();
  };

  const handlePaymentComplete = async (bookingId, mode) => {
    await api.updateBookingStatus(bookingId, 'completed');
    await loadData();
  };

  const handleAddItem = async (itemPayload) => {
    await api.createCatalogueItem(itemPayload);
    await loadData();
  };

  const handleAdjustStock = async (itemId, delta) => {
    await api.adjustProductStock(itemId, delta);
    await loadData();
  };

  const handleAddCustomer = async (custPayload) => {
    await api.createCustomer(custPayload);
    await loadData();
  };

  const handleRequestOwnerAuth = (callback, actionTitle) => {
    if (currentStaff?.role === 'owner') {
      callback();
    } else {
      setPinActionTitle(actionTitle || '');
      setPinSuccessCallback(() => callback);
      setIsOwnerPinOpen(true);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.start_time?.startsWith(todayStr));
  const lowStockItems = catalogueItems.filter((i) => i.kind === 'product' && i.stock_qty <= i.reorder_point);
  const servicesOnly = catalogueItems.filter((i) => i.kind === 'service');

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staffList={staffList}
        currentStaff={currentStaff}
        setCurrentStaff={setCurrentStaff}
        isOnline={isOnline}
        offlineCount={offlineCount}
        onOpenQuickBook={() => {
          setQuickBookSlot(null);
          setIsQuickBookOpen(true);
        }}
      />

      <main className="main-surface">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            todayBookings={todayBookings}
            lowStockItems={lowStockItems}
            onOpenQuickBook={() => {
              setQuickBookSlot(null);
              setIsQuickBookOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onOpenPayment={(b) => {
              setSelectedBookingForPayment(b);
              setIsPaymentOpen(true);
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            bookings={bookings}
            staffList={staffList}
            onOpenQuickBook={(slot) => {
              setQuickBookSlot(slot || null);
              setIsQuickBookOpen(true);
            }}
            onOpenPayment={(b) => {
              setSelectedBookingForPayment(b);
              setIsPaymentOpen(true);
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'catalogue' && (
          <CatalogueView
            items={catalogueItems}
            currentStaff={currentStaff}
            onOpenAddItem={() => setIsAddItemOpen(true)}
            onAdjustStock={handleAdjustStock}
            onRequestOwnerAuth={handleRequestOwnerAuth}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            onBookForCustomer={(cust) => {
              setIsQuickBookOpen(true);
            }}
          />
        )}
      </main>

      {/* 4-Tap Quick Booking Modal */}
      <QuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => setIsQuickBookOpen(false)}
        customers={customers}
        services={servicesOnly}
        staffList={staffList}
        currentStaff={currentStaff}
        initialSlot={quickBookSlot}
        onBookingCreated={handleBookingCreated}
      />

      {/* Payment Collection & Dynamic UPI QR Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedBookingForPayment(null);
        }}
        booking={selectedBookingForPayment}
        shopConfig={shopConfig}
        onComplete={handlePaymentComplete}
      />

      {/* Add Catalogue Item Modal */}
      <NewItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onCreated={handleAddItem}
      />

      {/* Add Customer Modal */}
      <NewCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCreated={handleAddCustomer}
      />

      {/* Owner PIN Authorization Modal */}
      <OwnerPinModal
        isOpen={isOwnerPinOpen}
        onClose={() => {
          setIsOwnerPinOpen(false);
          setPinSuccessCallback(null);
        }}
        onSuccess={() => {
          if (pinSuccessCallback) {
            pinSuccessCallback();
          }
        }}
        actionTitle={pinActionTitle}
      />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <I18nProvider>
      <KadaiApp />
    </I18nProvider>
  );
}
