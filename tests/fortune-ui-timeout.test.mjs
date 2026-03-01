import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('fortune API call has abort timeout guard', () => {
  const source = readFileSync(new URL('../app/components/NayinHome.vue', import.meta.url), 'utf8')
  assert.match(source, /const FORTUNE_REQUEST_TIMEOUT_MS = \d+/)
  assert.match(source, /const controller = new AbortController\(\)/)
  assert.match(source, /setTimeout\(\(\) => controller\.abort\(\), FORTUNE_REQUEST_TIMEOUT_MS\)/)
  assert.match(source, /signal: controller\.signal/)
  assert.match(source, /clearTimeout\(requestTimer\)/)
})
