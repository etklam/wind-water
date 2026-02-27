import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePillars } from '../app/utils/pillars.js'

test('returns four pillars in gregorian mode', () => {
  const r = calculatePillars({ date: '1990-06-15', time: '12:30', timezone: 'Asia/Taipei', mode: 'gregorian' })
  assert.equal(r.year.length, 2)
  assert.equal(r.month.length, 2)
  assert.equal(r.day.length, 2)
  assert.equal(r.hour.length, 2)
})

test('traditional mode shifts day after 23:00', () => {
  const before = calculatePillars({ date: '1990-06-15', time: '22:59', timezone: 'Asia/Taipei', mode: 'traditional' })
  const after = calculatePillars({ date: '1990-06-15', time: '23:01', timezone: 'Asia/Taipei', mode: 'traditional' })
  assert.notEqual(before.day, after.day)
})
