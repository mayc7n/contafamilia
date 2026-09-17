import * as SQLite from 'expo-sqlite';
import { FamilyData, SyncOperation } from '../domain/types';
import { seedFamilyData } from './seed-data';
import { createSyncQueue, QueueStorage } from './sync-queue';

const databasePromise = SQLite.openDatabaseAsync('conta-familia.db');

async function getDatabase() {
  const database = await databasePromise;
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_operations (
      id TEXT PRIMARY KEY NOT NULL,
      client_operation_id TEXT UNIQUE NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return database;
}

export async function loadFamilyData(): Promise<FamilyData> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_state WHERE key = ?',
    'family_data',
  );
  if (!row) {
    await saveFamilyData(seedFamilyData);
    return seedFamilyData;
  }
  return JSON.parse(row.value) as FamilyData;
}

export async function saveFamilyData(data: FamilyData): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)',
    'family_data',
    JSON.stringify(data),
  );
}

const sqliteQueueStorage: QueueStorage = {
  async load() {
    const database = await getDatabase();
    const rows = await database.getAllAsync<{
      id: string;
      client_operation_id: string;
      entity: SyncOperation['entity'];
      entity_id: string;
      action: SyncOperation['action'];
      payload_json: string;
      created_at: string;
    }>('SELECT * FROM sync_operations ORDER BY created_at ASC');
    return rows.map((row) => ({
      id: row.id,
      clientOperationId: row.client_operation_id,
      entity: row.entity,
      entityId: row.entity_id,
      action: row.action,
      payloadJson: row.payload_json,
      createdAt: row.created_at,
    }));
  },

  async save(operations) {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM sync_operations');
    for (const operation of operations) {
      await database.runAsync(
        `INSERT INTO sync_operations
          (id, client_operation_id, entity, entity_id, action, payload_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        operation.id,
        operation.clientOperationId,
        operation.entity,
        operation.entityId,
        operation.action,
        operation.payloadJson,
        operation.createdAt,
      );
    }
  },
};

export const syncQueue = createSyncQueue(sqliteQueueStorage);

export async function clearFamilyData(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM app_state WHERE key = ?', 'family_data');
  await database.runAsync('DELETE FROM sync_operations');
}
