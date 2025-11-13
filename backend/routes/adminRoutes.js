import express from 'express';
import { clearAllData } from '../services/cleanupService.js';

const router = express.Router();
//Test only
router.delete('/clear-all', (_req, res) => {
  try {
    clearAllData();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao limpar base e arquivos.' });
  }
});

export default router;