import { query } from '../../db/index.js';
import { getCatalogueItemById } from '../catalogue/catalogue.service.js';
import { findOrCreateCustomerByMobile } from '../customers/customers.service.js';

export async function getBookings({ start, end, staffId, status } = {}) {
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (start && end) {
    conditions.push(`slot && tstzrange($${paramIdx++}, $${paramIdx++}, '[)')`);
    params.push(new Date(start).toISOString(), new Date(end).toISOString());
  } else if (start) {
    conditions.push(`lower(slot) >= $${paramIdx++}`);
    params.push(new Date(start).toISOString());
  }

  if (staffId) {
    conditions.push(`b.staff_id = $${paramIdx++}`);
    params.push(staffId);
  }

  if (status) {
    conditions.push(`b.status = $${paramIdx++}`);
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT 
      b.id,
      b.customer_id,
      b.item_id,
      b.staff_id,
      lower(b.slot) AS start_time,
      upper(b.slot) AS end_time,
      b.status,
      b.source,
      b.notes,
      b.created_at,
      c.name AS customer_name,
      c.mobile AS customer_mobile,
      c.gstin AS customer_gstin,
      ci.name AS item_name,
      ci.price_paise,
      ci.duration_min,
      ci.sac AS item_sac,
      ci.gst_slab,
      s.name AS staff_name,
      s.colour AS staff_colour
    FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    JOIN catalogue_items ci ON b.item_id = ci.id
    JOIN staff s ON b.staff_id = s.id
    ${whereClause}
    ORDER BY lower(b.slot) ASC;
  `;

  const res = await query(sql, params);
  return res.rows;
}

export async function getBookingById(id) {
  const sql = `
    SELECT 
      b.id,
      b.customer_id,
      b.item_id,
      b.staff_id,
      lower(b.slot) AS start_time,
      upper(b.slot) AS end_time,
      b.status,
      b.source,
      b.notes,
      b.created_at,
      c.name AS customer_name,
      c.mobile AS customer_mobile,
      c.gstin AS customer_gstin,
      ci.name AS item_name,
      ci.price_paise,
      ci.duration_min,
      ci.sac AS item_sac,
      ci.gst_slab,
      s.name AS staff_name,
      s.colour AS staff_colour
    FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    JOIN catalogue_items ci ON b.item_id = ci.id
    JOIN staff s ON b.staff_id = s.id
    WHERE b.id = $1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

export async function createBooking(data) {
  let {
    customer_id,
    customer_name,
    customer_mobile,
    item_id,
    staff_id,
    start_time,
    end_time,
    status = 'confirmed',
    source = 'counter',
    notes = null,
  } = data;

  // Auto create/find customer if mobile is passed
  if (!customer_id && customer_mobile && customer_name) {
    const customer = await findOrCreateCustomerByMobile({
      name: customer_name,
      mobile: customer_mobile,
    });
    customer_id = customer.id;
  }

  if (!customer_id) {
    throw new Error('Customer is required for booking');
  }
  if (!item_id) {
    throw new Error('Catalogue item (service) is required');
  }
  if (!staff_id) {
    throw new Error('Staff member is required');
  }
  if (!start_time) {
    throw new Error('Start time is required');
  }

  // Calculate end_time from service duration if missing
  const startDate = new Date(start_time);
  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid start_time format');
  }

  let endDate;
  if (end_time) {
    endDate = new Date(end_time);
  } else {
    const item = await getCatalogueItemById(item_id);
    if (!item) {
      throw new Error('Catalogue item not found');
    }
    const durationMin = item.duration_min || 30;
    endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
  }

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  try {
    const res = await query(`
      INSERT INTO bookings (
        customer_id, item_id, staff_id, slot, status, source, notes
      ) VALUES (
        $1, $2, $3, tstzrange($4, $5, '[)'), $6, $7, $8
      )
      RETURNING id, customer_id, item_id, staff_id,
                lower(slot) AS start_time, upper(slot) AS end_time,
                status, source, notes, created_at;
    `, [customer_id, item_id, staff_id, startIso, endIso, status, source, notes]);

    return getBookingById(res.rows[0].id);
  } catch (err) {
    if (err.code === '23P01') { // PostgreSQL exclusion_violation
      const error = new Error('That slot is already taken for this staff member.');
      error.code = 'DOUBLE_BOOKED';
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function updateBookingStatus(id, newStatus) {
  const validStatuses = ['pending', 'confirmed', 'arrived', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Must be one of ${validStatuses.join(', ')}`);
  }

  try {
    const res = await query(`
      UPDATE bookings
      SET status = $2
      WHERE id = $1
      RETURNING id;
    `, [id, newStatus]);

    if (res.rows.length === 0) return null;
    return getBookingById(id);
  } catch (err) {
    if (err.code === '23P01') {
      const error = new Error('Cannot restore slot because staff member has another booking.');
      error.code = 'DOUBLE_BOOKED';
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const [todayBookingsRes, lowStockRes, activeStaffRes] = await Promise.all([
    query(`
      SELECT 
        COUNT(*)::int AS total_today,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::int AS confirmed_count,
        COUNT(CASE WHEN status = 'arrived' THEN 1 END)::int AS arrived_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_count
      FROM bookings
      WHERE slot && tstzrange($1, $2, '[)')
    `, [todayStart, todayEnd]),
    query(`
      SELECT COUNT(*)::int AS low_stock_count
      FROM catalogue_items
      WHERE kind = 'product' AND stock_qty <= reorder_point AND active = true;
    `),
    query(`
      SELECT COUNT(*)::int AS staff_count
      FROM staff
      WHERE active = true;
    `),
  ]);

  return {
    today: todayBookingsRes.rows[0],
    low_stock_count: lowStockRes.rows[0].low_stock_count,
    active_staff_count: activeStaffRes.rows[0].staff_count,
  };
}
