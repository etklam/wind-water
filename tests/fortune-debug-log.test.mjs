import test from 'node:test'
import assert from 'node:assert/strict'
import { createServerFortuneLogger, isFortuneDebugEnabled, sanitizeDebugPayload } from '../server/utils/fortune/debug-log.js'

test('isFortuneDebugEnabled accepts common true values', () => {
  assert.equal(isFortuneDebugEnabled({ DEBUG_FORTUNE: 'true' }), true)
  assert.equal(isFortuneDebugEnabled({ DEBUG_FORTUNE: '1' }), true)
  assert.equal(isFortuneDebugEnabled({ NUXT_PUBLIC_DEBUG_FORTUNE: 'on' }), true)
  assert.equal(isFortuneDebugEnabled({ DEBUG_FORTUNE: 'false' }), false)
})

test('sanitizeDebugPayload redacts sensitive fields', () => {
  const sanitized = sanitizeDebugPayload({
    apiKey: 'secret-key',
    openaiApiKey: 'secret-key',
    password: 'pw',
    token: 'abc',
    databaseUrl: 'mysql://user:pass@localhost/db',
    safe: 'ok',
    nested: {
      authorization: 'Bearer token',
      value: 1
    }
  })

  assert.equal(sanitized.apiKey, '[redacted]')
  assert.equal(sanitized.openaiApiKey, '[redacted]')
  assert.equal(sanitized.password, '[redacted]')
  assert.equal(sanitized.token, '[redacted]')
  assert.equal(sanitized.databaseUrl, '[redacted]')
  assert.equal(sanitized.nested.authorization, '[redacted]')
  assert.equal(sanitized.safe, 'ok')
  assert.equal(sanitized.nested.value, 1)
})

test('createServerFortuneLogger writes only when enabled', () => {
  const entries = []
  const logger = createServerFortuneLogger({
    scope: 'test',
    enabled: true,
    sink: (entry) => entries.push(entry)
  })
  const noop = createServerFortuneLogger({
    scope: 'test',
    enabled: false,
    sink: (entry) => entries.push(entry)
  })

  logger('event', { ok: 1 })
  noop('event2', { ok: 2 })

  assert.equal(entries.length, 1)
  assert.equal(entries[0].scope, 'test')
  assert.equal(entries[0].event, 'event')
  assert.equal(entries[0].data.ok, 1)
})
