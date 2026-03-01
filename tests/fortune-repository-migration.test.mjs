import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureFortuneCacheSchema } from '../server/utils/fortune/repository.js'

test('ensureFortuneCacheSchema uses compatibility-safe alters', async () => {
  const executed = []
  const db = {
    async execute(sql, params = []) {
      executed.push({ sql, params })
      if (sql.includes('FROM information_schema.COLUMNS')) {
        const column = params[2]
        return [[column === 'year' ? { c: 1 } : { c: 0 }]]
      }
      if (sql.includes('FROM information_schema.STATISTICS')) {
        const index = params[2]
        return [[index === 'ux_fortune_cache_key' ? { c: 1 } : { c: 0 }]]
      }
      return [[]]
    }
  }

  await ensureFortuneCacheSchema(db, 'test_db')

  const allSql = executed.map((x) => x.sql).join('\n')
  assert.equal(allSql.includes('IF NOT EXISTS'), false)
  assert.equal(allSql.includes('DROP INDEX IF EXISTS'), false)
  assert.equal(
    executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache ADD COLUMN `gender`')),
    true
  )
  assert.equal(
    executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache ADD COLUMN `mbti`')),
    true
  )
  assert.equal(
    executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache ADD COLUMN `focus_area`')),
    true
  )
  assert.equal(
    executed.some((x) => x.sql.includes('ux_fortune_cache_scope (cache_key, mode, year, gender, mbti, focus_area)')),
    true
  )
  assert.equal(
    executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache DROP INDEX ux_fortune_cache_key')),
    true
  )
  assert.equal(
    executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache ADD COLUMN `year`')),
    false
  )
})
