import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const DADOS_TABLE = "dados";
export const PDFDADOS_TABLE = "pdfdados";
export const USERS_TABLE = "users";
export const LOGIN_ATTEMPTS_TABLE = 'login_attempts';

// Conectar ao SQLite (cria o arquivo database.db se não existir)
const db = new sqlite3(path.join(currentDir, '../../database.db'));

// Criar tabelas
CreateDadosTable(DADOS_TABLE).run();
CreateDadosTable(PDFDADOS_TABLE).run();
CreateUsersTable();
export default db;

function CreateDadosTable(name) {
  return db.prepare(`
  CREATE TABLE IF NOT EXISTS ${name} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    dados TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
}

function CreateUsersTable() {
  db.prepare(`
  CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,                  -- null if OAuth-only
  role TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  created_at TEXT NOT NULL
);`).run();
  db.prepare(`
CREATE TABLE IF NOT EXISTS ${LOGIN_ATTEMPTS_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  success INTEGER NOT NULL,            -- 0/1
  created_at TEXT NOT NULL
);
`).run();
}