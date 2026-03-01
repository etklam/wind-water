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
  assert.equal(item.name['zh-Hans'], '海中金')
})

test('guide lookup supports both zh-Hant and zh-Hans names', () => {
  const hant = getNayinGuideByName('爐中火')
  const hans = getNayinGuideByName('炉中火')
  assert.ok(hant)
  assert.ok(hans)
  assert.equal(hant.id, hans.id)
})

test('guide items include 30 nayin entries', () => {
  assert.equal(NAYIN_GUIDE_ITEMS.length, 30)
})

test('guide groups include five elements and full coverage', () => {
  const groups = groupNayinGuideByElement('zh-Hant')
  assert.deepEqual(groups.map((group) => group.element), ['wood', 'fire', 'earth', 'metal', 'water'])
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  assert.equal(total, 30)
})

test('guide groups localize names by locale', () => {
  const hantGroups = groupNayinGuideByElement('zh-Hant')
  const hansGroups = groupNayinGuideByElement('zh-Hans')

  const hantFire = hantGroups.find((group) => group.element === 'fire').items[0]
  const hansFire = hansGroups.find((group) => group.element === 'fire').items[0]

  assert.equal(hantFire.name, '爐中火')
  assert.equal(hansFire.name, '炉中火')
})
