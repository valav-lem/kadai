import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load .env
const envPath = resolve(rootDir, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL || 'postgres://kadai:kadai@localhost:5432/kadai';

async function seed() {
  console.log(`🌱 Seeding database: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    // Check if staff already exist
    const staffCheck = await client.query('SELECT count(*) FROM staff');
    if (parseInt(staffCheck.rows[0].count, 10) > 0) {
      console.log('ℹ️ Database already contains data. Skipping seed.');
      return;
    }

    console.log('👥 Inserting staff...');
    const staffRes = await client.query(`
      INSERT INTO staff (name, role, colour, locale, active) VALUES
      ('Asha · ஆஷா', 'owner', '#C85A32', 'ta', true),
      ('Ravi · ரவி', 'staff', '#5B7C6E', 'ta', true),
      ('Meera · மீரா', 'staff', '#3B6E8C', 'en', true),
      ('Senthil · செந்தில்', 'accountant', '#8C6D3B', 'ta', true)
      RETURNING id, name, role;
    `);

    const ashaId = staffRes.rows[0].id;
    const raviId = staffRes.rows[1].id;
    const meeraId = staffRes.rows[2].id;

    console.log('📦 Inserting catalogue items (Products & Services)...');
    const catRes = await client.query(`
      INSERT INTO catalogue_items (kind, name, description, hsn, sac, gst_slab, price_paise, duration_min, stock_qty, reorder_point, bookable_online, active) VALUES
      ('service', 'Haircut & Styling · முடி திருத்தம்', 'Classic cut, wash and style', null, '999721', 18.00, 25000, 30, null, null, true, true),
      ('service', 'Herbal Facial · மூலிகை முகப்பொலிவு', 'Deep cleansing natural herbal facial', null, '999722', 18.00, 60000, 60, null, null, true, true),
      ('service', 'Head Massage · தலை மசாஜ்', 'Traditional warm oil massage', null, '999729', 18.00, 35000, 45, null, null, true, true),
      ('service', 'Beard Grooming · தாடி அழகுபடுத்தல்', 'Beard trim, shape and hot towel', null, '999721', 18.00, 15000, 20, null, null, true, true),
      ('service', 'Express Styling · விரைவு அலங்காரம்', 'Quick blow-dry and styling', null, '999721', 18.00, 18000, 25, null, null, true, true),
      
      ('product', 'Herbal Hair Oil 200ml · மூலிகை தலைமுடி எண்ணெய்', 'Pure sesame oil with 18 herbs', '33059011', null, 18.00, 18000, null, 45, 10, false, true),
      ('product', 'Organic Shampoo 250ml · இயற்கை ஷாம்பு', 'Sulphate-free shikakai shampoo', '33051010', null, 18.00, 24000, null, 6, 12, false, true),
      ('product', 'Sandalwood Pack 100g · சந்தன முகப்பூச்சு', 'Pure Mysore sandalwood powder', '33049910', null, 18.00, 15000, null, 25, 5, false, true),
      ('product', 'Aloe Vera Gel 150g · கற்றாழை ஜெல்', '100% pure organic soothing gel', '33049990', null, 12.00, 12000, null, 4, 10, false, true),
      ('product', 'Neem Comb · வேப்ப மர சீப்பு', 'Handcrafted medicinal neem wood comb', '96151100', null, 12.00, 8000, null, 30, 10, false, true)
      RETURNING id, name, kind;
    `);

    const haircutId = catRes.rows[0].id;
    const facialId = catRes.rows[1].id;
    const headMassageId = catRes.rows[2].id;

    console.log('👤 Inserting customers (Regular & B2B)...');
    const custRes = await client.query(`
      INSERT INTO customers (name, mobile, gstin) VALUES
      ('Murugan · முருகன்', '9840123456', null),
      ('Kannan Traders · கண்ணன் டிரேடர்ஸ்', '9443198765', '33AABCK1234F1Z1'),
      ('Priya Devi · பிரியா தேவி', '9789012345', null),
      ('Anbarasan · அன்பரசன்', '9884054321', null),
      ('Selvi · செல்வி', '9677011223', null)
      RETURNING id, name;
    `);

    const muruganId = custRes.rows[0].id;
    const priyaId = custRes.rows[2].id;
    const anbarasanId = custRes.rows[3].id;

    console.log('📅 Inserting sample bookings for today...');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const slot1Start = new Date(`${todayStr}T10:00:00+05:30`).toISOString();
    const slot1End = new Date(`${todayStr}T10:30:00+05:30`).toISOString();

    const slot2Start = new Date(`${todayStr}T11:00:00+05:30`).toISOString();
    const slot2End = new Date(`${todayStr}T12:00:00+05:30`).toISOString();

    const slot3Start = new Date(`${todayStr}T14:30:00+05:30`).toISOString();
    const slot3End = new Date(`${todayStr}T15:15:00+05:30`).toISOString();

    await client.query(`
      INSERT INTO bookings (customer_id, item_id, staff_id, slot, status, source, notes) VALUES
      ($1, $2, $3, tstzrange($4, $5, '[)'), 'confirmed', 'counter', 'First visit'),
      ($6, $7, $8, tstzrange($9, $10, '[)'), 'arrived', 'counter', 'Prefers herbal mask'),
      ($11, $12, $13, tstzrange($14, $15, '[)'), 'pending', 'online', 'Booked via /book')
    `, [
      muruganId, haircutId, ashaId, slot1Start, slot1End,
      priyaId, facialId, raviId, slot2Start, slot2End,
      anbarasanId, headMassageId, meeraId, slot3Start, slot3End,
    ]);

    console.log('✨ Seed completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seed();
