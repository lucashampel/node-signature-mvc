const db = require('../config/db');

// Função para salvar dados
const save = (nome, dados) => {
  const stmt = db.prepare('INSERT INTO dados (nome, dados) VALUES (?, ?)');
  const result = stmt.run(nome, dados);
  return result;
};

// Função para buscar todos os dados (opcional, para testes)
const findAll = () => {
  const stmt = db.prepare('SELECT * FROM dados');
  return stmt.all();
};

module.exports = {
  save,
  findAll,
};