import express from 'express';
import { clearAllData } from '../services/dbService.js';
import { createUser } from '../services/authService.js';
import {ListUsers} from '../services/userService.js';
import { ListCadastros } from '../services/cadastroService.js';

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

router.get('/users', (req, res) => {
  const { from, to } = req.query;

  try {
    const users = ListUsers({ from, to });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/cadastros', (req, res) => {
  const { from, to, export: exportType } = req.query;

  try {
    const users = ListCadastros({ from, to });
    
    if (exportType === 'csv') {
      const csv = convertCadastrosToCSV(users);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cadastros.csv"');
      return res.send(csv);
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cadastros' });
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

function convertCadastrosToCSV(cadastros) {
  const header = "nome,cpf,birthDate,created_at";

  if (!cadastros?.length) return header + "\n";

  const rows = cadastros.map(c => {
    let data = {};

    try {
      data = typeof c.dados === "string" ? JSON.parse(c.dados) : (c.dados || {});
    } catch (err) {
      data = {};
    }

    return [
      c.nome ?? "",
      data.cpf ?? "",
      data.birthDate ?? "",
      c.created_at ?? ""
    ].join(",");
  });

  return [header, ...rows].join("\n");
}


export default router;