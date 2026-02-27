import test from 'node:test'
import assert from 'node:assert/strict'
import { elementCount, getNayinByGanzhi } from '../app/utils/nayin.js'

test('甲子 maps to 海中金 and metal', () => {
  const r = getNayinByGanzhi('甲子')
  assert.equal(r.name, '海中金')
  assert.equal(r.element, 'metal')
})

test('elementCount totals pillars', () => {
  const result = elementCount(['甲子', '乙丑', '丙寅', '丁卯'])
  assert.equal(result.metal, 2)
  assert.equal(result.fire, 2)
})
