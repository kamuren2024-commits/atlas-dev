import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('data/salience_atlas.db');
const dbAll = promisify(db.all.bind(db));
const dbGet = promisify(db.get.bind(db));

async function inspect() {
  try {
    const tables = await dbAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    
    console.log('=== TABLES ===');
    tables.forEach(t => console.log(t.name));
    
    console.log('\n=== SCHEMAS ===');
    for (const t of tables) {
      const cols = await dbAll(`PRAGMA table_info(${t.name})`);
      console.log(`\n--- ${t.name} ---`);
      cols.forEach(c => {
        console.log(`  ${c.name}: ${c.type} (notnull=${c.notnull}, pk=${c.pk})`);
      });
    }
    
    console.log('\n=== ROW COUNTS ===');
    let totalRows = 0;
    for (const t of tables) {
      const row = await dbGet(`SELECT COUNT(*) as cnt FROM ${t.name}`);
      console.log(`${t.name}: ${row.cnt}`);
      totalRows += row.cnt;
    }
    console.log(`TOTAL ROWS: ${totalRows}`);
    
    db.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
