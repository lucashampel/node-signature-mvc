//const pdfController = require('../controllers/pdfController');

import express from 'express';
const router = express.Router();

// Suas rotas de PDF aqui
router.post('/processar-pdf', (req, res) => {
  // Lógica para processar PDF
  res.json({ message: 'PDF processado com sucesso' });
});

router.get('/download-pdf/:id', (req, res) => {
  // Lógica para download de PDF
  const { id } = req.params;
  res.download(`./pdfs/${id}.pdf`);
});

export default router;