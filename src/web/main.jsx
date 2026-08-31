import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline, Box, Container, Alert, Button } from '@mui/material';
import { kadaiTheme } from './styles/theme.js';
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
import RescheduleModal from './components/RescheduleModal.jsx';
import ProductSaleModal from './components/ProductSaleModal.jsx';

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
  const [offlineConflicts, setOfflineConflicts] = useState([]);

  // Modals
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [quickBookSlot, setQuickBookSlot] = useState(null);
  const [quickBookStaffId, setQuickBookStaffId] = useState(null);
  const [quickBookCustomer, setQuickBookCustomer] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  
  // Item Modal (Add & Edit)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Customer Modal (Add & Edit)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);
  const [isProductSaleOpen, setIsProductSaleOpen] = useState(false);
  const [selectedProductForSale, setSelectedProductForSale] = useState(null);
  const [isOwnerPinOpen, setIsOwnerPinOpen] = useState(false);
  const [pinActionTitle, setPinActionTitle] = useState('');
  const [pinSuccessCallback, setPinSuccessCallback] = useState(null);

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
      const res = await syncOfflineQueue(() => {
        loadData();
      });
      if (res?.conflicts?.length > 0) {
        setOfflineConflicts(res.conflicts);
      }
      const off = await getOfflineBookings();
      setOfflineCount(off.length);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      if (navigator.onLine) {
        const res = await syncOfflineQueue(() => loadData());
        if (res?.conflicts?.length > 0) {
          setOfflineConflicts(res.conflicts);
        }
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

  const handlePaymentComplete = async (bookingId, mode, amountPaise) => {
    await api.updateBookingStatus(bookingId, 'completed', {
      payment_mode: mode,
      paid_amount_paise: amountPaise,
    });
    await loadData();
  };

  const handleReschedule = async (bookingId, payload) => {
    await api.updateBooking(bookingId, payload);
    await loadData();
  };

  const handleSaveItem = async (itemPayload, itemId) => {
    if (itemId) {
      await api.updateCatalogueItem(itemId, itemPayload);
    } else {
      await api.createCatalogueItem(itemPayload);
    }
    await loadData();
  };

  const handleAdjustStock = async (itemId, delta) => {
    await api.adjustProductStock(itemId, delta);
    await loadData();
  };

  const handleDeleteItem = async (itemId) => {
    await api.deleteCatalogueItem(itemId);
    await loadData();
  };

  const handleProductSale = async ({ productId, qty }) => {
    await api.adjustProductStock(productId, -qty);
    await loadData();
  };

  const handleSaveCustomer = async (custPayload, custId) => {
    if (custId) {
      await api.updateCustomer(custId, custPayload);
    } else {
      await api.createCustomer(custPayload);
    }
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

  // Indian Standard Time local date evaluation for Today view
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayIstStr = istFormatter.format(new Date());

  const todayBookings = bookings.filter((b) => {
    if (!b.start_time) return false;
    const bDate = istFormatter.format(new Date(b.start_time));
    return bDate === todayIstStr;
  });

  const lowStockItems = catalogueItems.filter((i) => i.kind === 'product' && i.stock_qty <= i.reorder_point);
  const servicesOnly = catalogueItems.filter((i) => i.kind === 'service');

  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        staffList={staffList}
        currentStaff={currentStaff}
        setCurrentStaff={setCurrentStaff}
        isOnline={isOnline}
        offlineCount={offlineCount}
        onOpenQuickBook={() => {
          setQuickBookCustomer(null);
          setQuickBookSlot(null);
          setQuickBookStaffId(null);
          setIsQuickBookOpen(true);
        }}
      />

      {/* Offline Sync Conflict Alert Banner */}
      {offlineConflicts.length > 0 && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => setOfflineConflicts([])}>
              Dismiss
            </Button>
          }
          sx={{
            borderRadius: 0,
            py: 1,
            px: 3,
            fontWeight: 700,
          }}
        >
          Offline Sync Conflict: {offlineConflicts.length} offline booking(s) could not be automatically synced due to duplicate time slots. Please review and re-assign.
        </Alert>
      )}

      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 3.5 }, px: { xs: 2, sm: 3, md: 4 }, flex: 1, width: '100%', maxWidth: '1440px !important', boxSizing: 'border-box', minWidth: 0 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            todayBookings={todayBookings}
            lowStockItems={lowStockItems}
            onOpenQuickBook={(slot, staffId) => {
              setQuickBookCustomer(null);
              setQuickBookSlot(slot || null);
              setQuickBookStaffId(staffId || null);
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
            onOpenQuickBook={(slot, staffId) => {
              setQuickBookCustomer(null);
              setQuickBookSlot(slot || null);
              setQuickBookStaffId(staffId || null);
              setIsQuickBookOpen(true);
            }}
            onOpenPayment={(b) => {
              setSelectedBookingForPayment(b);
              setIsPaymentOpen(true);
            }}
            onOpenReschedule={(b) => {
              setSelectedBookingForReschedule(b);
              setIsRescheduleOpen(true);
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'catalogue' && (
          <CatalogueView
            items={catalogueItems}
            currentStaff={currentStaff}
            onOpenAddItem={() => {
              setItemToEdit(null);
              setIsItemModalOpen(true);
            }}
            onOpenEditItem={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onAdjustStock={handleAdjustStock}
            onOpenProductSale={(prod) => {
              setSelectedProductForSale(prod);
              setIsProductSaleOpen(true);
            }}
            onRequestOwnerAuth={handleRequestOwnerAuth}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={customers}
            currentStaff={currentStaff}
            onOpenAddCustomer={() => {
              setCustomerToEdit(null);
              setIsCustomerModalOpen(true);
            }}
            onOpenEditCustomer={(cust) => {
              setCustomerToEdit(cust);
              setIsCustomerModalOpen(true);
            }}
            onBookForCustomer={(cust) => {
              setQuickBookCustomer(cust);
              setQuickBookSlot(null);
              setQuickBookStaffId(null);
              setIsQuickBookOpen(true);
            }}
            onRequestOwnerAuth={handleRequestOwnerAuth}
          />
        )}
      </Container>

      {/* 4-Tap Quick Booking Modal */}
      <QuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => {
          setIsQuickBookOpen(false);
          setQuickBookSlot(null);
          setQuickBookStaffId(null);
          setQuickBookCustomer(null);
        }}
        customers={customers}
        services={servicesOnly}
        staffList={staffList}
        currentStaff={currentStaff}
        initialSlot={quickBookSlot}
        initialStaffId={quickBookStaffId}
        initialCustomer={quickBookCustomer}
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

      {/* Booking Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedBookingForReschedule(null);
        }}
        booking={selectedBookingForReschedule}
        staffList={staffList}
        services={servicesOnly}
        onReschedule={handleReschedule}
      />

      {/* Catalogue Item Modal (Add & Edit) */}
      <NewItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
        onSave={handleSaveItem}
      />

      {/* Quick Product Sale Modal */}
      <ProductSaleModal
        isOpen={isProductSaleOpen}
        onClose={() => {
          setIsProductSaleOpen(false);
          setSelectedProductForSale(null);
        }}
        product={selectedProductForSale}
        customers={customers}
        shopConfig={shopConfig}
        onSaleComplete={handleProductSale}
      />

      {/* Customer Modal (Add & Edit) */}
      <NewCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
        onSave={handleSaveCustomer}
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
    </Box>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ThemeProvider theme={kadaiTheme}>
      <CssBaseline />
      <I18nProvider>
        <KadaiApp />
      </I18nProvider>
    </ThemeProvider>
  );
}
