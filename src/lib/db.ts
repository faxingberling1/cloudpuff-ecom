import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:AltuphPyCDuwcvCqARjsxrftCzQSpmgi@iriguchi.proxy.rlwy.net:37578/railway';

// Single shared pool instance for Next.js
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  pool = global._pgPool;
}

export { pool };

export interface SavedPaymentMethodRow {
  id: string;
  user_id: string;
  brand: string;
  cardholder_name: string | null;
  last4: string;
  exp: string;
  is_default: boolean;
  icon: string;
  card_nickname: string | null;
  created_at?: string;
  updated_at?: string;
}

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    // Create saved_payment_methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_payment_methods (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL DEFAULT 'user_arsalan',
        brand VARCHAR(64) NOT NULL,
        cardholder_name VARCHAR(128),
        last4 VARCHAR(32) NOT NULL,
        exp VARCHAR(16) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        icon VARCHAR(16) NOT NULL DEFAULT '💳',
        card_nickname VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create email_verification_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'signup',
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sanctuary_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sanctuary_users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        favorite_buddy VARCHAR(64) DEFAULT 'Matcha Dino',
        role VARCHAR(32) NOT NULL DEFAULT 'user',
        verified BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial records exist for user_arsalan
    const check = await client.query(
      `SELECT COUNT(*) FROM saved_payment_methods WHERE user_id = 'user_arsalan';`
    );
    const count = parseInt(check.rows[0].count, 10);

    if (count === 0) {
      // Seed matching the user's exact screenshot
      await client.query(`
        INSERT INTO saved_payment_methods (id, user_id, brand, cardholder_name, last4, exp, is_default, icon, card_nickname)
        VALUES
          ('card-1', 'user_arsalan', 'CloudPay / Apple Pay', 'Arsalan Abbas', 'Apple Wallet', 'Synced', FALSE, 'applepay', 'CloudPay / Apple Pay'),
          ('card-2', 'user_arsalan', 'Visa Snuggle Card', 'Arsalan Abbas', '4242', '08/29', TRUE, 'visa', 'Visa Snuggle Card'),
          ('card-3', 'user_arsalan', 'Mastercard Fluff', 'Arsalan Abbas', '8819', '12/27', FALSE, 'mastercard', 'Mastercard Fluff')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    isInitialized = true;
  } finally {
    client.release();
  }
}

export async function saveVerificationCode(email: string, code: string, purpose = 'signup') {
  await initDb();
  // 15-minute expiration
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const result = await pool.query(
    `INSERT INTO email_verification_codes (email, code, purpose, expires_at, verified)
     VALUES ($1, $2, $3, $4, FALSE)
     RETURNING id, email, code, expires_at, created_at;`,
    [email.toLowerCase().trim(), code, purpose, expiresAt]
  );
  return result.rows[0];
}

export async function verifyCodeInDb(email: string, code: string, purpose = 'signup'): Promise<boolean> {
  await initDb();
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  const res = await pool.query(
    `SELECT id, expires_at FROM email_verification_codes
     WHERE email = $1 AND code = $2 AND purpose = $3 AND verified = FALSE AND expires_at > CURRENT_TIMESTAMP
     ORDER BY created_at DESC
     LIMIT 1;`,
    [cleanEmail, cleanCode, purpose]
  );

  if (res.rows.length === 0) {
    return false;
  }

  const recordId = res.rows[0].id;
  await pool.query(
    `UPDATE email_verification_codes SET verified = TRUE WHERE id = $1;`,
    [recordId]
  );
  return true;
}

export async function registerUserInDb(params: {
  name: string;
  email: string;
  password?: string;
  favoriteBuddy?: string;
}) {
  await initDb();
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanEmail = params.email.toLowerCase().trim();

  const res = await pool.query(
    `INSERT INTO sanctuary_users (id, name, email, password_hash, favorite_buddy, verified)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     ON CONFLICT (email) DO UPDATE 
     SET name = EXCLUDED.name, favorite_buddy = EXCLUDED.favorite_buddy, verified = TRUE
     RETURNING id, name, email, favorite_buddy, role, created_at;`,
    [id, params.name.trim(), cleanEmail, params.password || 'demo_hash', params.favoriteBuddy || 'Matcha Dino']
  );
  return res.rows[0];
}

