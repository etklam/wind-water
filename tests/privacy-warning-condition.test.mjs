import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('privacy warning is shown when unknown hour is false', () => {
  const source = readFileSync(new URL('../app/components/NayinHome.vue', import.meta.url), 'utf8')
  assert.match(source, /const showChartPrivacyWarning = computed\(\(\) => \(!unknownHour\.value\)\)/)
})
