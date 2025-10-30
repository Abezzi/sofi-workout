import { drizzle } from 'drizzle-orm/expo-sqlite';
import { type SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'db.db';
export const expoDb = SQLite.openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});
export const db = drizzle(expoDb, { schema });
export type DBTransaction = SQLiteTransaction<any, any, any, any>;
export type DBExecutor = typeof db | DBTransaction;
