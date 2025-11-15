import db, { DADOS_TABLE,PDFDADOS_TABLE } from '../config/db.js';
import { urlToFilename, deleteStored } from '../config/storage.js';

function dropTable(table) {
  const stmt = db.prepare(`DROP TABLE IF EXISTS ${table}`);
  stmt.run();
}

function clearTableWithFiles(table) {
  const rows = db.prepare(`SELECT dados FROM ${table}`).all();

  // delete files best-effort
  for (const r of rows) {
    try {
      const payload = JSON.parse(r.dados || '{}');
      const filename = urlToFilename(payload.imageUrl);
      if (filename) deleteStored(filename);
    } catch { /* ignore malformed JSON */ }
  }

  // transactional wipe + reset id
  const tx = db.transaction((t) => {
    db.prepare(`DELETE FROM ${t}`).run();
    // needed because schema uses AUTOINCREMENT
    db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(t);
  });
  tx(table);
}

export function clearAllData() {
  const txAll = db.transaction(() => {
    dropTable(DADOS_TABLE);
    dropTable(PDFDADOS_TABLE);
   
  });
  txAll();
  db.prepare('VACUUM').run();
}