import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfRoutes from './routes/pdfRoutes.js';
import cadastroRoutes from './routes/cadastroRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { UPLOADS_DIR } from './config/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({limit:"3mb"}));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));
// Rotas da API
app.use('/api', pdfRoutes);
app.use('/api', cadastroRoutes);
app.use('/api/admin', adminRoutes);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
