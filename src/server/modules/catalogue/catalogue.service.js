import { query } from '../../db/index.js';

const VALID_GST_SLABS = [0, 5, 12, 18, 28];

export async function getCatalogueItems({ kind, search, lowStockOnly } = {}) {
  const conditions = ['active = true'];
  const params = [];
  let paramIdx = 1;

  if (kind && (kind === 'product' || kind === 'service')) {
    conditions.push(`kind = $${paramIdx++}`);
    params.push(kind);
  }

  if (lowStockOnly) {
    conditions.push(`kind = 'product' AND stock_qty <= reorder_point`);
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(name) LIKE $${paramIdx} OR 
      LOWER(COALESCE(description, '')) LIKE $${paramIdx} OR 
      LOWER(COALESCE(hsn, '')) LIKE $${paramIdx} OR 
      LOWER(COALESCE(sac, '')) LIKE $${paramIdx}
    )`);
    params.push(term);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT id, kind, name, description, hsn, sac, gst_slab, price_paise, 
           duration_min, stock_qty, reorder_point, bookable_online, active
    FROM catalogue_items
    ${whereClause}
    ORDER BY kind DESC, name ASC;
  `;

  const res = await query(sql, params);
  return res.rows;
}

export async function getCatalogueItemById(id) {
  const res = await query(`
    SELECT id, kind, name, description, hsn, sac, gst_slab, price_paise, 
           duration_min, stock_qty, reorder_point, bookable_online, active
    FROM catalogue_items
    WHERE id = $1;
  `, [id]);
  return res.rows[0] || null;
}

export async function createCatalogueItem(data) {
  const {
    kind,
    name,
    description = null,
    hsn = null,
    sac = null,
    gst_slab,
    price_paise,
    duration_min = null,
    stock_qty = null,
    reorder_point = null,
    bookable_online = false,
  } = data;

  if (!kind || !['product', 'service'].includes(kind)) {
    throw new Error('Item kind must be "product" or "service"');
  }

  if (!name || !name.trim()) {
    throw new Error('Item name is required');
  }

  const slabNum = Number(gst_slab);
  if (!VALID_GST_SLABS.includes(slabNum)) {
    throw new Error(`Invalid GST slab: ${gst_slab}. Must be one of 0, 5, 12, 18, 28`);
  }

  if (price_paise === undefined || price_paise < 0) {
    throw new Error('Price in paise must be a positive integer');
  }

  if (kind === 'product') {
    if (!hsn || !hsn.trim()) {
      throw new Error('Product must have an HSN code');
    }
  } else if (kind === 'service') {
    if (!sac || !sac.trim()) {
      throw new Error('Service must have a SAC code');
    }
    if (!duration_min || duration_min <= 0) {
      throw new Error('Service must have a positive duration in minutes');
    }
  }

  const res = await query(`
    INSERT INTO catalogue_items (
      kind, name, description, hsn, sac, gst_slab, price_paise,
      duration_min, stock_qty, reorder_point, bookable_online, active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
    RETURNING id, kind, name, description, hsn, sac, gst_slab, price_paise,
              duration_min, stock_qty, reorder_point, bookable_online, active;
  `, [
    kind,
    name.trim(),
    description ? description.trim() : null,
    kind === 'product' ? hsn.trim() : null,
    kind === 'service' ? sac.trim() : null,
    slabNum,
    price_paise,
    kind === 'service' ? duration_min : null,
    kind === 'product' ? (stock_qty || 0) : null,
    kind === 'product' ? (reorder_point || 0) : null,
    Boolean(bookable_online),
  ]);

  return res.rows[0];
}

export async function updateCatalogueItem(id, data) {
  const existing = await getCatalogueItemById(id);
  if (!existing) return null;

  const updates = [];
  const params = [id];
  let paramIdx = 2;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIdx++}`);
    params.push(data.name.trim());
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    params.push(data.description ? data.description.trim() : null);
  }
  if (data.hsn !== undefined && existing.kind === 'product') {
    updates.push(`hsn = $${paramIdx++}`);
    params.push(data.hsn.trim());
  }
  if (data.sac !== undefined && existing.kind === 'service') {
    updates.push(`sac = $${paramIdx++}`);
    params.push(data.sac.trim());
  }
  if (data.gst_slab !== undefined) {
    const slabNum = Number(data.gst_slab);
    if (!VALID_GST_SLABS.includes(slabNum)) {
      throw new Error(`Invalid GST slab: ${data.gst_slab}`);
    }
    updates.push(`gst_slab = $${paramIdx++}`);
    params.push(slabNum);
  }
  if (data.price_paise !== undefined) {
    updates.push(`price_paise = $${paramIdx++}`);
    params.push(data.price_paise);
  }
  if (data.duration_min !== undefined && existing.kind === 'service') {
    updates.push(`duration_min = $${paramIdx++}`);
    params.push(data.duration_min);
  }
  if (data.stock_qty !== undefined && existing.kind === 'product') {
    updates.push(`stock_qty = $${paramIdx++}`);
    params.push(data.stock_qty);
  }
  if (data.reorder_point !== undefined && existing.kind === 'product') {
    updates.push(`reorder_point = $${paramIdx++}`);
    params.push(data.reorder_point);
  }
  if (data.bookable_online !== undefined) {
    updates.push(`bookable_online = $${paramIdx++}`);
    params.push(Boolean(data.bookable_online));
  }
  if (data.active !== undefined) {
    updates.push(`active = $${paramIdx++}`);
    params.push(Boolean(data.active));
  }

  if (updates.length === 0) return existing;

  const res = await query(`
    UPDATE catalogue_items
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, kind, name, description, hsn, sac, gst_slab, price_paise,
              duration_min, stock_qty, reorder_point, bookable_online, active;
  `, params);

  return res.rows[0];
}

export async function adjustStock(id, delta) {
  const res = await query(`
    UPDATE catalogue_items
    SET stock_qty = GREATEST(0, stock_qty + $2)
    WHERE id = $1 AND kind = 'product'
    RETURNING id, name, stock_qty, reorder_point;
  `, [id, delta]);
  return res.rows[0] || null;
}
