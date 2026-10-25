import type { DatabaseCore } from './db-core';

export class InventoryOperationsMigration {
  static async apply(db: DatabaseCore): Promise<void> {
    await db.run(`
      CREATE TABLE IF NOT EXISTS inventory_operations (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        reference TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        status TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        created_by TEXT NOT NULL,
        approved_by TEXT,
        facility_id TEXT,
        destination_facility_id TEXT,
        product_id TEXT,
        sku TEXT,
        quantity REAL,
        reason TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (tenant_id, idempotency_key),
        UNIQUE (tenant_id, reference)
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS inventory_count_lines (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        operation_id TEXT NOT NULL,
        stock_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        snapshot_quantity REAL NOT NULL,
        counted_quantity REAL,
        line_status TEXT NOT NULL DEFAULT 'PENDING',
        count_round INTEGER NOT NULL DEFAULT 1,
        counted_by TEXT,
        last_idempotency_key TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (operation_id, stock_id),
        FOREIGN KEY (operation_id) REFERENCES inventory_operations(id) ON DELETE CASCADE,
        FOREIGN KEY (stock_id) REFERENCES logistics_stock(id)
      )
    `);

    const countLineColumns = await db.all<{ name: string }>('PRAGMA table_info(inventory_count_lines)');
    if (!countLineColumns.some((column) => column.name === 'last_idempotency_key')) {
      await db.run('ALTER TABLE inventory_count_lines ADD COLUMN last_idempotency_key TEXT');
    }

    await db.run('CREATE INDEX IF NOT EXISTS idx_inventory_operations_tenant_created ON inventory_operations (tenant_id, created_at DESC)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_inventory_operations_tenant_type_status ON inventory_operations (tenant_id, operation_type, status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_inventory_count_lines_operation_status ON inventory_count_lines (operation_id, line_status)');
  }
}
