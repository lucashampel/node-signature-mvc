const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));

// Importar rotas
const pdfRoutes = require('./backend/routes/pdfRoutes');
app.use('/api', pdfRoutes);

// Rota para página de assinatura
app.get('/assinar-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/assinar-pdf/assinar-pdf.html'));
});

// Rota para gerar pdfs assinados
app.get('/gerar-pdfs-assinados', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/gerar-pdfs-assinados/gerar-pdfs-assinados.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));