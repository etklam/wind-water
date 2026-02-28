import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTimezoneOptions, COMMON_TIMEZONES } from '../app/utils/timezones.js'

test('common timezones use Chinese labels', () => {
  const sample = COMMON_TIMEZONES.find((item) => item.value === 'Asia/Taipei')
  assert.ok(sample)
  assert.match(sample.label, /台北|臺北/)
})

test('buildTimezoneOptions keeps user timezone as default option when missing', () => {
  const list = buildTimezoneOptions('Atlantic/Reykjavik')
  assert.equal(list[0].value, 'Atlantic/Reykjavik')
  assert.match(list[0].label, /目前時區/)
})
