import { saveOfflineBooking } from './offline.js';

export async function fetchShopConfig() {
  try {
    const res = await fetch('/api/shop');
    if (!res.ok) throw new Error('Failed to fetch shop config');
    const data = await res.json();
    return data.shop;
  } catch (err) {
    return {
      legal_name: 'Annachi Kadai Co · அண்ணாச்சி கடை',
      gstin: '33AAAAA0000A1Z5',
      upi_id: 'annachikadai@okhdfcbank',
      address: '12, Bazaar Street, Virudhunagar, Tamil Nadu',
      default_locale: 'ta',
    };
  }
}

export async function fetchStaff() {
  const res = await fetch('/api/staff');
  if (!res.ok) throw new Error('Failed to fetch staff');
  const data = await res.json();
  return data.staff || [];
}

export async function fetchCatalogue({ kind, search, lowStockOnly } = {}) {
  const params = new URLSearchParams();
  if (kind) params.append('kind', kind);
  if (search) params.append('search', search);
  if (lowStockOnly) params.append('lowStockOnly', 'true');

  const res = await fetch(`/api/catalogue?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch catalogue items');
  const data = await res.json();
  return data.items || [];
}

export async function createCatalogueItem(item) {
  const res = await fetch('/api/catalogue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create item');
  return data.item;
}

export async function updateCatalogueItem(id, item) {
  const res = await fetch(`/api/catalogue/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update item');
  return data.item;
}

export async function adjustProductStock(id, delta) {
  const res = await fetch(`/api/catalogue/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to adjust stock');
  return data.item;
}

export async function fetchCustomers({ search } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const res = await fetch(`/api/customers?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  const data = await res.json();
  return data.customers || [];
}

export async function createCustomer(customer) {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create customer');
  return data.customer;
}

export async function updateCustomer(id, customer) {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update customer');
  return data.customer;
}

export async function fetchBookings({ start, end, staffId, status } = {}) {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (staffId) params.append('staffId', staffId);
  if (status) params.append('status', status);

  const res = await fetch(`/api/bookings?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  const data = await res.json();
  return data.bookings || [];
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch('/api/bookings/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return {
      today: { total_today: 0, pending_count: 0, confirmed_count: 0, arrived_count: 0, completed_count: 0 },
      low_stock_count: 0,
      active_staff_count: 0,
    };
  }
}

export async function createBooking(bookingData) {
  if (!navigator.onLine) {
    const queued = await saveOfflineBooking(bookingData);
    return { booking: queued, isOffline: true };
  }

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to create booking');
      err.code = data.code;
      err.statusCode = res.status;
      throw err;
    }
    return { booking: data.booking, isOffline: false };
  } catch (err) {
    if (err.statusCode === 409 || err.code === 'DOUBLE_BOOKED') {
      throw err;
    }
    // If it's a network error, queue offline
    console.warn('Network failed, queuing booking offline:', err);
    const queued = await saveOfflineBooking(bookingData);
    return { booking: queued, isOffline: true };
  }
}

export async function updateBookingStatus(id, status, paymentDetails = {}) {
  const res = await fetch(`/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      payment_mode: paymentDetails.payment_mode,
      paid_amount_paise: paymentDetails.paid_amount_paise,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to update status');
    err.code = data.code;
    throw err;
  }
  return data.booking;
}

export async function updateBooking(id, bookingData) {
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to update booking');
    err.code = data.code;
    err.statusCode = res.status;
    throw err;
  }
  return data.booking;
}
