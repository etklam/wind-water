import mysql from 'mysql2/promise'
import { createServerFortuneLogger } from './debug-log.js'

let pool
const log = createServerFortuneLogger({ scope: 'repository.fortune-cache' })

export function parseDatabaseUrl(databaseUrl) {
  const url = new URL(String(databaseUrl || ''))
  if (!/^mysql:$/i.test(url.protocol)) {
    throw new Error('Unsupported DATABASE_URL protocol. Expected mysql://')
  }

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || ''),
    database: decodeURIComponent((url.pathname || '').replace(/^\/+/, ''))
  }
}

function getPool(config) {
  if (!pool) {
    const options = config.databaseUrl ? parseDatabaseUrl(config.databaseUrl) : {
      host: config.host,
      port: Number(config.port || 3306),
      user: config.user,
      password: config.password,
      database: config.database
    }

    pool = mysql.createPool({
      ...options,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

async function columnExists(db, database, table, column) {
  if (database) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS c
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [database, table, column]
    )
    return Number(rows?.[0]?.c || 0) > 0
  }

  const [rows] = await db.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  )
  return Number(rows?.[0]?.c || 0) > 0
}

async function indexExists(db, database, table, indexName) {
  if (database) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS c
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = ?
         AND INDEX_NAME = ?`,
      [database, table, indexName]
    )
    return Number(rows?.[0]?.c || 0) > 0
  }

  const [rows] = await db.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [table, indexName]
  )
  return Number(rows?.[0]?.c || 0) > 0
}

export async function ensureFortuneCacheSchema(db, database) {
  if (!(await columnExists(db, database, 'fortune_cache', 'year'))) {
    log('schema.alter.add-column', { column: 'year' })
    await db.execute('ALTER TABLE fortune_cache ADD COLUMN `year` INT NULL AFTER `mode`')
  }
  if (!(await columnExists(db, database, 'fortune_cache', 'gender'))) {
    log('schema.alter.add-column', { column: 'gender' })
    await db.execute("ALTER TABLE fortune_cache ADD COLUMN `gender` VARCHAR(16) NOT NULL DEFAULT '' AFTER `mode`")
  }
  if (!(await columnExists(db, database, 'fortune_cache', 'focus_area'))) {
    log('schema.alter.add-column', { column: 'focus_area' })
    await db.execute("ALTER TABLE fortune_cache ADD COLUMN `focus_area` VARCHAR(128) NOT NULL DEFAULT '' AFTER `gender`")
  }
  if (await indexExists(db, database, 'fortune_cache', 'ux_fortune_cache_key')) {
    log('schema.alter.drop-index', { index: 'ux_fortune_cache_key' })
    await db.execute('ALTER TABLE fortune_cache DROP INDEX ux_fortune_cache_key')
  }
  if (!(await indexExists(db, database, 'fortune_cache', 'ux_fortune_cache_scope'))) {
    log('schema.alter.add-index', { index: 'ux_fortune_cache_scope' })
    await db.execute(
      'ALTER TABLE fortune_cache ADD UNIQUE INDEX ux_fortune_cache_scope (cache_key, mode, year, gender, focus_area)'
    )
  }
}

export function createFortuneRepository(config) {
  const db = getPool(config)
  let ensureTablePromise

  async function ensureTable() {
    if (!ensureTablePromise) {
      log('table.ensure.start')
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
    log('table.ensure.created-or-exists')
    await ensureFortuneCacheSchema(db, config.database)
    log('table.ensure.schema-checked')
  }

  return {
    async findByCacheKey(cacheKey, scope = {}) {
      await ensureTable()
      const mode = scope.mode || 'year'
      const year = Number.isFinite(scope.year) ? Number(scope.year) : null
      const gender = scope.gender || ''
      const focusArea = scope.focusArea || ''
      log('cache.find.start', {
        cacheKey,
        mode,
        year,
        hasGender: Boolean(gender),
        hasFocusArea: Boolean(focusArea)
      })
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
        log('cache.find.miss', { cacheKey })
        return null
      }

      const row = rows[0]
      log('cache.find.hit', { cacheKey, model: row.model || '' })
      return {
        cacheKey: row.cache_key,
        mode: row.mode,
        responseText: row.response_text,
        model: row.model
      }
    },

    async saveCache(payload) {
      await ensureTable()
      log('cache.save.start', {
        cacheKey: payload.cacheKey,
        mode: payload.mode,
        year: Number.isFinite(payload.year) ? Number(payload.year) : null,
        hasGender: Boolean(payload.gender),
        hasFocusArea: Boolean(payload.focusArea)
      })
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
      log('cache.save.done', { cacheKey: payload.cacheKey })
    }
  }
}
