import test from 'node:test'
import assert from 'node:assert/strict'
import { elementCount, getNayinByGanzhi } from '../app/utils/nayin.js'
import { elementCompass, elementOrder } from '../app/utils/elements.js'
import { nineGridElements } from '../app/utils/nine-grid.js'

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

test('five element order remains canonical', () => {
  assert.deepEqual(elementOrder, ['wood', 'fire', 'earth', 'metal', 'water'])
})

test('five elements map to expected compass directions', () => {
  assert.equal(elementCompass.wood, 'east')
  assert.equal(elementCompass.fire, 'south')
  assert.equal(elementCompass.earth, 'center')
  assert.equal(elementCompass.metal, 'west')
  assert.equal(elementCompass.water, 'north')
})

test('nine-grid element mapping follows approved layout', () => {
  assert.equal(nineGridElements.north, 'water')
  assert.equal(nineGridElements.west, 'wood')
  assert.equal(nineGridElements.center, 'earth')
  assert.equal(nineGridElements.east, 'metal')
  assert.equal(nineGridElements.south, 'fire')
})
