import * as SQLite from 'expo-sqlite';
import { type Patch, type PatchFormData, type PatchJson } from '../types/patch';

// Database row model matching SQLite snake_case schema
type PatchDbRow = {
  id: number;
  song_name: string;
  artist: string;
  patch_level: number | null;
  comp_type: string | null;
  comp_prm: number | null;
  drive_type: string | null;
  drive_gain: number | null;
  eq_low: number | null;
  eq_mid: number | null;
  eq_high: number | null;
  znr_type: string | null;
  znr_prm: number | null;
  mod_type: string | null;
  mod_prm1: number | null;
  mod_rate: number | null;
  delay_type: string | null;
  delay_prm1: number | null;
  delay_time: number | null;
  reverb_type: string | null;
  reverb_prm1: number | null;
  reverb_decay: number | null;
  created_at: string;
  updated_at: string;
};

// Maps SQLite database row format (snake_case) to TypeScript model (camelCase)
const mapRowToPatch = (row: PatchDbRow): Patch => ({
  id: row.id,
  songName: row.song_name,
  artist: row.artist,
  patchLevel: row.patch_level,
  compType: row.comp_type,
  compPrm: row.comp_prm,
  driveType: row.drive_type,
  driveGain: row.drive_gain,
  eqLow: row.eq_low,
  eqMid: row.eq_mid,
  eqHigh: row.eq_high,
  znrType: row.znr_type,
  znrPrm: row.znr_prm,
  modType: row.mod_type,
  modPrm1: row.mod_prm1,
  modRate: row.mod_rate,
  delayType: row.delay_type,
  delayPrm1: row.delay_prm1,
  delayTime: row.delay_time,
  reverbType: row.reverb_type,
  reverbPrm1: row.reverb_prm1,
  reverbDecay: row.reverb_decay,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Implements local CRUD interactions on patches table using a cached database connection
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('patches.db').then(async (db) => {
      await db.execAsync('PRAGMA busy_timeout = 5000;');
      return db;
    });
  }
  return dbPromise;
};

export const patchesService = {
  // Fetch all patches, allowing filtering on song name or artist and sorting preferences
  async getAll(
    filter?: string,
    orderBy: 'song_name' | 'artist' | 'created_at' = 'song_name'
  ): Promise<Patch[]> {
    const db = await getDb();
    let query = 'SELECT * FROM patches';
    const params: string[] = [];

    if (filter) {
      query += ' WHERE song_name LIKE ? OR artist LIKE ?';
      params.push(`%${filter}%`, `%${filter}%`);
    }

    // Protect against SQL injection on the ORDER BY clause
    const allowedOrderBy = ['song_name', 'artist', 'created_at'];
    const validOrderBy = allowedOrderBy.includes(orderBy)
      ? orderBy
      : 'song_name';
    const orderDirection = validOrderBy === 'created_at' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${validOrderBy} ${orderDirection}`;

    const rows = await db.getAllAsync<PatchDbRow>(query, params);
    return rows.map(mapRowToPatch);
  },

  // Fetch a single patch profile by unique identifier
  async getById(id: number): Promise<Patch> {
    const db = await getDb();
    const row = await db.getFirstAsync<PatchDbRow>(
      'SELECT * FROM patches WHERE id = ?;',
      [id]
    );
    if (!row) {
      throw new Error(`Patch with ID ${id} not found`);
    }
    return mapRowToPatch(row);
  },

  // Persists a newly designed patch to SQLite
  async create(data: PatchFormData): Promise<number> {
    const db = await getDb();
    const result = await db.runAsync(
      `INSERT INTO patches (
        song_name, artist, patch_level,
        comp_type, comp_prm,
        drive_type, drive_gain,
        eq_low, eq_mid, eq_high,
        znr_type, znr_prm,
        mod_type, mod_prm1, mod_rate,
        delay_type, delay_prm1, delay_time,
        reverb_type, reverb_prm1, reverb_decay
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.songName,
        data.artist,
        data.patchLevel,
        data.compType,
        data.compPrm,
        data.driveType,
        data.driveGain,
        data.eqLow,
        data.eqMid,
        data.eqHigh,
        data.znrType,
        data.znrPrm,
        data.modType,
        data.modPrm1,
        data.modRate,
        data.delayType,
        data.delayPrm1,
        data.delayTime,
        data.reverbType,
        data.reverbPrm1,
        data.reverbDecay,
      ]
    );
    return result.lastInsertRowId;
  },

  // Updates parameters of an existing patch based on ID
  async update(id: number, data: PatchFormData): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE patches SET
        song_name = ?,
        artist = ?,
        patch_level = ?,
        comp_type = ?,
        comp_prm = ?,
        drive_type = ?,
        drive_gain = ?,
        eq_low = ?,
        eq_mid = ?,
        eq_high = ?,
        znr_type = ?,
        znr_prm = ?,
        mod_type = ?,
        mod_prm1 = ?,
        mod_rate = ?,
        delay_type = ?,
        delay_prm1 = ?,
        delay_time = ?,
        reverb_type = ?,
        reverb_prm1 = ?,
        reverb_decay = ?,
        updated_at = datetime('now')
      WHERE id = ?;`,
      [
        data.songName,
        data.artist,
        data.patchLevel,
        data.compType,
        data.compPrm,
        data.driveType,
        data.driveGain,
        data.eqLow,
        data.eqMid,
        data.eqHigh,
        data.znrType,
        data.znrPrm,
        data.modType,
        data.modPrm1,
        data.modRate,
        data.delayType,
        data.delayPrm1,
        data.delayTime,
        data.reverbType,
        data.reverbPrm1,
        data.reverbDecay,
        id,
      ]
    );
  },

  // Deletes a patch from database permanently
  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM patches WHERE id = ?;', [id]);
  },

  // Export all patches in the snake_case JSON format
  async exportAll(): Promise<PatchJson[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<PatchDbRow>('SELECT * FROM patches ORDER BY song_name ASC;');
    return rows.map((row) => ({
      song_name: row.song_name,
      artist: row.artist,
      patch_level: row.patch_level,
      comp_type: row.comp_type,
      comp_prm: row.comp_prm,
      drive_type: row.drive_type,
      drive_gain: row.drive_gain,
      eq_low: row.eq_low,
      eq_mid: row.eq_mid,
      eq_high: row.eq_high,
      znr_type: row.znr_type,
      znr_prm: row.znr_prm,
      mod_type: row.mod_type,
      mod_prm1: row.mod_prm1,
      mod_rate: row.mod_rate,
      delay_type: row.delay_type,
      delay_prm1: row.delay_prm1,
      delay_time: row.delay_time,
      reverb_type: row.reverb_type,
      reverb_prm1: row.reverb_prm1,
      reverb_decay: row.reverb_decay,
    }));
  },

  // Import an array of patches in the snake_case JSON format
  async importPatches(patchesList: PatchJson[]): Promise<number> {
    const db = await getDb();
    let importedCount = 0;
    
    // Perform insertions inside a transaction for performance and data integrity
    await db.withTransactionAsync(async () => {
      for (const item of patchesList) {
        // Validation of basic mandatory fields
        if (!item.song_name || !item.artist) {
          continue;
        }
        
        await db.runAsync(
          `INSERT INTO patches (
            song_name, artist, patch_level,
            comp_type, comp_prm,
            drive_type, drive_gain,
            eq_low, eq_mid, eq_high,
            znr_type, znr_prm,
            mod_type, mod_prm1, mod_rate,
            delay_type, delay_prm1, delay_time,
            reverb_type, reverb_prm1, reverb_decay
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.song_name,
            item.artist,
            item.patch_level ?? null,
            item.comp_type ?? null,
            item.comp_prm ?? null,
            item.drive_type ?? null,
            item.drive_gain ?? null,
            item.eq_low ?? null,
            item.eq_mid ?? null,
            item.eq_high ?? null,
            item.znr_type ?? null,
            item.znr_prm ?? null,
            item.mod_type ?? null,
            item.mod_prm1 ?? null,
            item.mod_rate ?? null,
            item.delay_type ?? null,
            item.delay_prm1 ?? null,
            item.delay_time ?? null,
            item.reverb_type ?? null,
            item.reverb_prm1 ?? null,
            item.reverb_decay ?? null,
          ]
        );
        importedCount++;
      }
    });
    
    return importedCount;
  },
};
