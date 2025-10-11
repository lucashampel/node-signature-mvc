const sqlite3 = require('better-sqlite3');
const path = require('path');

// Conectar ao SQLite (cria o arquivo database.db se não existir)
const db = new sqlite3(path.join(__dirname, '../../database.db'));

// Criar tabela 'dados' se não existir
const createTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS dados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    dados TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
createTable.run();

module.exports = db;