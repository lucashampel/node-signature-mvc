import db, {DADOS_TABLE} from "../config/db.js";

export function ListCadastros(filters) {
  const { from, to } = filters;
  return FindByDateRange({ from, to });
}

function FindByDateRange({ from, to }) {
  let query = `SELECT * FROM ${DADOS_TABLE}`;
  const params = [];

  if (from && to) {
    query += " WHERE created_at BETWEEN ? AND ?";
    params.push(from, to);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export default ListCadastros;