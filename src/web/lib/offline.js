const DB_NAME = 'kadai_offline_db';
const DB_VERSION = 1;
const STORE_BOOKINGS = 'offline_bookings';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_BOOKINGS)) {
        db.createObjectStore(STORE_BOOKINGS, { keyPath: 'temp_id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineBooking(booking) {
  const db = await openDB();
  const temp_id = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    ...booking,
    temp_id,
    queued_at: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKINGS, 'readwrite');
    const store = tx.objectStore(STORE_BOOKINGS);
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineBookings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKINGS, 'readonly');
    const store = tx.objectStore(STORE_BOOKINGS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeOfflineBooking(temp_id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKINGS, 'readwrite');
    const store = tx.objectStore(STORE_BOOKINGS);
    const req = store.delete(temp_id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function syncOfflineQueue(onBookingSynced) {
  const queued = await getOfflineBookings();
  if (queued.length === 0) return { synced: 0, conflicts: [] };

  let synced = 0;
  const conflicts = [];

  for (const item of queued) {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        await removeOfflineBooking(item.temp_id);
        synced++;
        if (onBookingSynced) onBookingSynced(item);
      } else {
        const data = await res.json();
        if (res.status === 409) {
          conflicts.push({ item, error: data.error });
        }
      }
    } catch (err) {
      console.warn('Network error during offline sync, will retry later:', err);
      break;
    }
  }

  return { synced, conflicts };
}
