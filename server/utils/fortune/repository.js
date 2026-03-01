import mysql from 'mysql2/promise'

let pool

function getPool(config) {
  if (!pool) {
    pool = mysql.createPool({
      host: config.host,
      port: Number(config.port || 3306),
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

export function createFortuneRepository(config) {
  const db = getPool(config)
  let ensureTablePromise

  async function ensureTable() {
    if (!ensureTablePromise) {
      ensureTablePromise = db.execute(
        `CREATE TABLE IF NOT EXISTS fortune_cache (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          cache_key VARCHAR(191) NOT NULL,
          mode VARCHAR(16) NOT NULL,
          year INT NULL,
          gender VARCHAR(16) NOT NULL DEFAULT '',
          focus_area VARCHAR(128) NOT NULL DEFAULT '',
          request_payload JSON NULL,
          response_text LONGTEXT NOT NULL,
          model VARCHAR(128) NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY ux_fortune_cache_scope (cache_key, mode, year, gender, focus_area)
        )`
      )
    }
    await ensureTablePromise
    await db.execute('ALTER TABLE fortune_cache ADD COLUMN IF NOT EXISTS year INT NULL AFTER mode')
    await db.execute('ALTER TABLE fortune_cache ADD COLUMN IF NOT EXISTS gender VARCHAR(16) NOT NULL DEFAULT \'\' AFTER mode')
    await db.execute('ALTER TABLE fortune_cache ADD COLUMN IF NOT EXISTS focus_area VARCHAR(128) NOT NULL DEFAULT \'\' AFTER gender')
    await db.execute('ALTER TABLE fortune_cache DROP INDEX IF EXISTS ux_fortune_cache_key')
    await db.execute('ALTER TABLE fortune_cache ADD UNIQUE INDEX IF NOT EXISTS ux_fortune_cache_scope (cache_key, mode, year, gender, focus_area)')
  }

  return {
    async findByCacheKey(cacheKey, scope = {}) {
      await ensureTable()
      const mode = scope.mode || 'year'
      const year = Number.isFinite(scope.year) ? Number(scope.year) : null
      const gender = scope.gender || ''
      const focusArea = scope.focusArea || ''
      const [rows] = await db.execute(
        `SELECT cache_key, mode, response_text, model
         FROM fortune_cache
         WHERE cache_key = ?
           AND mode = ?
           AND gender = ?
           AND focus_area = ?
           AND ((? IS NULL AND year IS NULL) OR year = ?)
         LIMIT 1`,
        [cacheKey, mode, gender, focusArea, year, year]
      )

      if (!Array.isArray(rows) || rows.length === 0) {
        return null
      }

      const row = rows[0]
      return {
        cacheKey: row.cache_key,
        mode: row.mode,
        responseText: row.response_text,
        model: row.model
      }
    },

    async saveCache(payload) {
      await ensureTable()
      await db.execute(
        `INSERT INTO fortune_cache
        (cache_key, mode, year, gender, focus_area, request_payload, response_text, model, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          year = VALUES(year),
          gender = VALUES(gender),
          focus_area = VALUES(focus_area),
          request_payload = VALUES(request_payload),
          response_text = VALUES(response_text),
          model = VALUES(model),
          updated_at = NOW()`,
        [
          payload.cacheKey,
          payload.mode,
          Number.isFinite(payload.year) ? Number(payload.year) : null,
          payload.gender || '',
          payload.focusArea || '',
          JSON.stringify(payload.requestPayload || {}),
          payload.responseText,
          payload.model
        ]
      )
    }
  }
}
