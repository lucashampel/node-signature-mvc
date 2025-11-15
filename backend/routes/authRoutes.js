import express from 'express';
import rateLimit from 'express-rate-limit';
import { __dirname } from '../server.js';
import { verifyPassword, findUserById } from '../services/authService.js';
import db from '../config/db.js';
import path from 'path';
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10,                 // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const user = await verifyPassword(email, password);

  db.prepare(`INSERT INTO login_attempts (email, ip, success, created_at) VALUES (?, ?, ?, ?)`)
    .run(email, String(ip), user ? 1 : 0, new Date().toISOString());

  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  req.session.user = { id: user.id, email: user.email, role: user.role };
  return res.json({ ok: true, user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

router.get('/me', (req, res) => {
  if (!req.session?.user) return res.status(200).json({ user: null });
  const fresh = findUserById(req.session.user.id);
  res.json({ user: fresh || null });
});

export default router;