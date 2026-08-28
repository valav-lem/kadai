import { query } from '../../db/index.js';

export async function getAllStaff() {
  const res = await query(`
    SELECT id, name, role, colour, locale, active
    FROM staff
    ORDER BY id ASC;
  `);
  return res.rows;
}

export async function getStaffById(id) {
  const res = await query(`
    SELECT id, name, role, colour, locale, active
    FROM staff
    WHERE id = $1;
  `, [id]);
  return res.rows[0] || null;
}

export async function updateStaff(id, { colour, locale, active }) {
  const updates = [];
  const params = [id];
  let paramIdx = 2;

  if (colour !== undefined) {
    updates.push(`colour = $${paramIdx++}`);
    params.push(colour);
  }
  if (locale !== undefined) {
    updates.push(`locale = $${paramIdx++}`);
    params.push(locale);
  }
  if (active !== undefined) {
    updates.push(`active = $${paramIdx++}`);
    params.push(active);
  }

  if (updates.length === 0) {
    return getStaffById(id);
  }

  const res = await query(`
    UPDATE staff
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, name, role, colour, locale, active;
  `, params);

  return res.rows[0] || null;
}
