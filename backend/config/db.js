import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const DADOS_TABLE = "dados";
export const PDFDADOS_TABLE = "pdfdados";

// Conectar ao SQLite (cria o arquivo database.db se não existir)
const db = new sqlite3(path.join(currentDir, '../../database.db'));

// Criar tabelas
CreateTable(DADOS_TABLE).run();
CreateTable(PDFDADOS_TABLE).run();

export default db;

function CreateTable(name){
  return db.prepare(`
  CREATE TABLE IF NOT EXISTS ${name} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    dados TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
}