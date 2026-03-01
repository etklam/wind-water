import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFortuneRequestPayload } from '../app/utils/fortune-request.js'

test('buildFortuneRequestPayload builds life mode payload', () => {
  const payload = buildFortuneRequestPayload({
    totals: { wood: 1, fire: 2, earth: 0, metal: 1, water: 0 },
    gender: 'male',
    fortuneType: 'life',
    focusAreas: ['overall', 'career']
  })

  assert.equal(payload.metadata.mode, 'life')
  assert.equal(payload.metadata.year, undefined)
  assert.equal(payload.metadata.gender, 'male')
  assert.equal(payload.metadata.five_elements.fire, 2)
  assert.deepEqual(payload.metadata.focus_areas, ['overall', 'career'])
  assert.match(payload.messages[0].content, /綜合、事業/)
})

test('buildFortuneRequestPayload builds year mode payload with fixed 2026', () => {
  const payload = buildFortuneRequestPayload({
    totals: { wood: 0, fire: 1, earth: 1, metal: 1, water: 1 },
    gender: 'female',
    fortuneType: 'year',
    focusAreas: ['overall', 'love', 'health']
  })

  assert.equal(payload.metadata.mode, 'year')
  assert.equal(payload.metadata.year, 2026)
  assert.equal(payload.metadata.gender, 'female')
  assert.deepEqual(payload.metadata.five_elements, {
    wood: 0, fire: 1, earth: 1, metal: 1, water: 1
  })
  assert.deepEqual(payload.metadata.focus_areas, ['overall', 'love', 'health'])
  assert.match(payload.messages[0].content, /綜合、愛情、身體/)
})
