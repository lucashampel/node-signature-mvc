import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfRoutes from './routes/pdfRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api', pdfRoutes);

// Rotas para páginas
app.get('/assinar-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/assinar-pdf.html'));
});

app.get('/gerar-pdfs-assinados', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gerar-pdfs-assinados.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));