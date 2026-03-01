import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('unknown hour defaults to true in home form', () => {
  const source = readFileSync(new URL('../app/components/NayinHome.vue', import.meta.url), 'utf8')
  assert.match(source, /const unknownHour = ref\(true\)/)
})
