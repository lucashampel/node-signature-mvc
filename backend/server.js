import express from 'express';

import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import helmet from 'helmet';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfRoutes from './routes/pdfRoutes.js';
import cadastroRoutes from './routes/cadastroRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';

import { UPLOADS_DIR } from './config/storage.js';

import { ensureAdminUser } from './services/authService.js';
import { authenticate, requireRole } from './middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json({limit:"3mb"}));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use(session({
  store: new SQLiteStore({ db: 'database.db', dir: '../' }),
  secret: process.env.SESSION_SECRET || 'secret-session', //Change later
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // JS can’t read cookies
    sameSite: 'lax',       // good default for same-origin
    secure: false          // set true behind HTTPS/proxy in prod
  }
}));

// Rotas da API
app.use('/api',authenticate, pdfRoutes);
app.use('/api',authenticate, cadastroRoutes);
app.use('/auth',authRoutes);
app.use('/api/admin',requireRole('admin'), adminRoutes);

// Rotas para páginas
app.get('/assinar-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/assinar-pdf/assinar-pdf.html'));
});

app.get('/gerar-pdfs-assinados', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gerar-pdfs-assinados/gerar-pdfs-assinados.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

ensureAdminUser().catch(err => {
  console.error('Error seeding admin user:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
