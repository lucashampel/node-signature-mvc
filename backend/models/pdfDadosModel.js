import db, {PDFDADOS_TABLE} from '../config/db.js';

// Função para salvar dados
export const save = (nome, dados) => {
  const stmt = db.prepare(`INSERT INTO ${PDFDADOS_TABLE} (nome, dados) VALUES (?, ?)`);
  const result = stmt.run(nome, JSON.stringify(dados));
  return result;
};

// Função para buscar todos os dados (opcional, para testes)
export const findAll = () => {
  const stmt = db.prepare(`SELECT * FROM ${PDFDADOS_TABLE}`);
  return stmt.all();
};

export default {save,findAll}