import bcrypt from 'bcrypt';
import db, {USERS_TABLE} from '../config/db.js';

export async function createUser({ email, password, role='user' }) {
  const hash = password ? await bcrypt.hash(password, 12) : null;
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO ${USERS_TABLE} (email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?)`);
  stmt.run(email, hash, role, now);
}

export async function verifyPassword(email, password) {
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  if (!user || !user.password_hash) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function findUserById(id) {
  return db.prepare(`SELECT id, email, role FROM ${USERS_TABLE} WHERE id = ?`).get(id);
}

export async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  const existing = db
    .prepare(`SELECT id FROM ${USERS_TABLE} WHERE email = ? AND role = 'admin'`)
    .get(adminEmail);

  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO ${USERS_TABLE} (email, password_hash, role, created_at)
    VALUES (?, ?, 'admin', ?)
  `).run(adminEmail, hash, now);

  console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
}

export function findOrCreateOAuthUser({ email }) {
  const existing = db.prepare(`SELECT id, email, role FROM ${USERS_TABLE} WHERE email = ?`).get(email);
  if (existing) return existing;
  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO ${USERS_TABLE} (email, role, created_at) VALUES (?, 'user', ?)
  `).run(email, now);
  return { id: Number(info.lastInsertRowid), email, role: 'user' };
}