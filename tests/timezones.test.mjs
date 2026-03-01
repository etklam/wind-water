import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTimezoneOptions, resolveDefaultTimezone } from '../app/utils/timezones.js'

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

test('resolveDefaultTimezone prefers Hong Kong when offset is UTC+8', () => {
  const resolved = resolveDefaultTimezone({
    detectedTimezone: 'Asia/Taipei',
    offsetMinutes: -480
  })
  assert.equal(resolved, 'Asia/Hong_Kong')
})

test('resolveDefaultTimezone keeps detected timezone when not UTC+8', () => {
  const resolved = resolveDefaultTimezone({
    detectedTimezone: 'America/Los_Angeles',
    offsetMinutes: 480
  })
  assert.equal(resolved, 'America/Los_Angeles')
})
