import test from 'node:test'
import assert from 'node:assert/strict'
import {
  NAYIN_GUIDE_ITEMS,
  getNayinGuideByName,
  groupNayinGuideByElement
} from '../app/utils/nayin-guide.js'

test('guide lookup resolves known nayin by name', () => {
  const item = getNayinGuideByName('海中金')
  assert.ok(item)
  assert.equal(item.id, 'hai-zhong-jin')
  assert.equal(item.element, 'metal')
})

test('guide items include 30 nayin entries', () => {
  assert.equal(NAYIN_GUIDE_ITEMS.length, 30)
})

test('guide groups include five elements and full coverage', () => {
  const groups = groupNayinGuideByElement()
  assert.deepEqual(groups.map((group) => group.element), ['wood', 'fire', 'earth', 'metal', 'water'])
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  assert.equal(total, 30)
})
