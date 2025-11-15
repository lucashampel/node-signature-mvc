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
import { authenticate, requireRole, requireLoginPage } from './middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

app.use(session({
  store: new SQLiteStore({ db: 'database.db', dir: '../' }),
  secret: process.env.SESSION_SECRET || 'secret-session', //Change later
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // JS can’t read cookies
    sameSite: 'lax',       // good default for same-origin
    secure: false,          // set true behind HTTPS/proxy in prod
    maxAge: 1000 * 60 * 60 * 24 // 24h 
  }
}));


// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json({limit:"3mb"}));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Rotas para páginas
app.get('/assinar-pdf',requireLoginPage, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/assinar-pdf/assinar-pdf.html'));
});

app.get('/gerar-pdfs-assinados', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gerar-pdfs-assinados/gerar-pdfs-assinados.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/home',requireLoginPage, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


ensureAdminUser().catch(err => {
  console.error('Error seeding admin user:', err);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login/login.html'));
});
// Rotas da API
app.use('/api',authenticate, requireLoginPage, pdfRoutes);
app.use('/api',authenticate,requireLoginPage, cadastroRoutes);
app.use('/auth',authRoutes);
app.use('/api/admin',authenticate,requireLoginPage,requireRole('admin'), adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
