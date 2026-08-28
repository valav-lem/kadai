import { query } from '../../db/index.js';

export async function getCustomers({ search, limit = 50 } = {}) {
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(c.name) LIKE $${paramIdx} OR 
      c.mobile LIKE $${paramIdx} OR 
      LOWER(COALESCE(c.gstin, '')) LIKE $${paramIdx}
    )`);
    params.push(term);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);

  const sql = `
    SELECT 
      c.id, 
      c.name, 
      c.mobile, 
      c.gstin, 
      c.created_at,
      COUNT(b.id)::int AS visit_count,
      COALESCE(SUM(ci.price_paise), 0)::bigint AS lifetime_paise
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id AND b.status = 'completed'
    LEFT JOIN catalogue_items ci ON b.item_id = ci.id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.id DESC
    LIMIT $${paramIdx};
  `;

  const res = await query(sql, params);
  return res.rows;
}

export async function getCustomerById(id) {
  const customerSql = `
    SELECT 
      c.id, 
      c.name, 
      c.mobile, 
      c.gstin, 
      c.created_at,
      COUNT(b.id)::int AS visit_count,
      COALESCE(SUM(ci.price_paise), 0)::bigint AS lifetime_paise
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id AND b.status = 'completed'
    LEFT JOIN catalogue_items ci ON b.item_id = ci.id
    WHERE c.id = $1
    GROUP BY c.id;
  `;
  const res = await query(customerSql, [id]);
  const customer = res.rows[0];
  if (!customer) return null;

  // Fetch recent bookings
  const bookingsRes = await query(`
    SELECT b.id, b.slot, b.status, b.source, b.notes, b.created_at,
           ci.name AS item_name, ci.price_paise, ci.duration_min,
           s.name AS staff_name, s.colour AS staff_colour
    FROM bookings b
    JOIN catalogue_items ci ON b.item_id = ci.id
    JOIN staff s ON b.staff_id = s.id
    WHERE b.customer_id = $1
    ORDER BY lower(b.slot) DESC
    LIMIT 20;
  `, [id]);

  customer.recent_bookings = bookingsRes.rows;
  return customer;
}

export async function createCustomer({ name, mobile, gstin = null }) {
  if (!name || !name.trim()) {
    throw new Error('Customer name is required');
  }
  if (!mobile || !mobile.trim()) {
    throw new Error('Customer mobile number is required');
  }

  // Clean mobile
  const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
  if (cleanMobile.length < 10) {
    throw new Error('Mobile number must be at least 10 digits');
  }

  // Clean GSTIN if provided
  let cleanGstin = gstin ? gstin.trim().toUpperCase() : null;
  if (cleanGstin) {
    // Basic GSTIN validation: 15 characters, starts with 2 digits state code
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
      throw new Error('Invalid GSTIN format. Expected 15-character alphanumeric GSTIN');
    }
  }

  try {
    const res = await query(`
      INSERT INTO customers (name, mobile, gstin)
      VALUES ($1, $2, $3)
      RETURNING id, name, mobile, gstin, created_at;
    `, [name.trim(), cleanMobile, cleanGstin]);
    return res.rows[0];
  } catch (err) {
    if (err.code === '23505') { // unique_violation on mobile
      throw new Error('A customer with this mobile number already exists');
    }
    throw err;
  }
}

export async function findOrCreateCustomerByMobile({ name, mobile, gstin = null }) {
  const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
  const existing = await query('SELECT id, name, mobile, gstin FROM customers WHERE mobile = $1', [cleanMobile]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }
  return createCustomer({ name, mobile: cleanMobile, gstin });
}
