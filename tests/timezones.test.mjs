import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTimezoneOptions } from '../app/utils/timezones.js'

test('common timezones use Chinese labels', () => {
  const sample = buildTimezoneOptions('Asia/Taipei').find((item) => item.value === 'Asia/Taipei')
  assert.ok(sample)
  assert.match(sample.label, /台北|臺北/)
})

test('buildTimezoneOptions keeps user timezone as default option when missing', () => {
  const list = buildTimezoneOptions('Atlantic/Reykjavik')
  assert.equal(list[0].value, 'Atlantic/Reykjavik')
  assert.match(list[0].label, /目前時區/)
})

test('buildTimezoneOptions uses simplified Chinese labels for zh-Hans locale', () => {
  const list = buildTimezoneOptions('Atlantic/Reykjavik', 'zh-Hans')
  const taipei = list.find((item) => item.value === 'Asia/Taipei')
  assert.ok(taipei)
  assert.match(taipei.label, /台北|臺北/)
  assert.match(list[0].label, /当前时区/)
})
