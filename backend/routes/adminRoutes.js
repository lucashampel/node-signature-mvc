import express from 'express';
import { clearAllData } from '../services/cleanupService.js';
import { createUser } from '../services/authService.js';

const router = express.Router();
//Test only
router.delete('/clear-all', (req, res) => {
  try {
    clearAllData();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao limpar base e arquivos.' });
  }
});

router.post('/create-user', async(req,res) => {
const { email, password, role = 'user' } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role inválido. Use "user" ou "admin".' });
  }

  try {
    const user = await createUser({ email, password, role });
    return res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    // probably unique constraint on email
    return res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

export default router;