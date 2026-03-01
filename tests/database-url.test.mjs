import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDatabaseUrl } from '../server/utils/fortune/repository.js'

test('parseDatabaseUrl parses mysql url into connection options', () => {
  const parsed = parseDatabaseUrl('mysql://user:pass@srv-captain--mysql-db:3306/wind_water')
  assert.equal(parsed.host, 'srv-captain--mysql-db')
  assert.equal(parsed.port, 3306)
  assert.equal(parsed.user, 'user')
  assert.equal(parsed.password, 'pass')
  assert.equal(parsed.database, 'wind_water')
})

test('parseDatabaseUrl decodes credentials and uses default port', () => {
  const parsed = parseDatabaseUrl('mysql://db%40user:p%40ss%3Aword@srv-captain--mysql-db/wind_water')
  assert.equal(parsed.host, 'srv-captain--mysql-db')
  assert.equal(parsed.port, 3306)
  assert.equal(parsed.user, 'db@user')
  assert.equal(parsed.password, 'p@ss:word')
  assert.equal(parsed.database, 'wind_water')
})
