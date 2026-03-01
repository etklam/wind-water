import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFortunePrompt } from '../server/utils/fortune/prompt.js'

test('buildFortunePrompt includes life template sections', () => {
  const messages = buildFortunePrompt({
    mode: 'life',
    year: 2026,
    profile: { totals: { wood: 1, fire: 0, earth: 2, metal: 1, water: 0 } },
    userMessages: []
  })

  const text = messages.map((m) => m.content).join('\n')
  assert.match(text, /先完成「五行盤點」/)
  assert.match(text, /一生運程/)
  assert.match(text, /0-15、16-25、26-35/)
  assert.match(text, /目標字數：900-1200字/)
  assert.match(text, /每一階段行動清單/)
  assert.match(text, /關鍵關係與貴人\/小人圖譜/)
  assert.match(text, /命格詩/)
  assert.match(text, /詩意白話註解/)
})

test('buildFortunePrompt includes year template and selected year', () => {
  const messages = buildFortunePrompt({
    mode: 'year',
    year: 2028,
    profile: { totals: { wood: 0, fire: 1, earth: 1, metal: 1, water: 1 } },
    userMessages: []
  })

  const text = messages.map((m) => m.content).join('\n')
  assert.match(text, /今年運程/)
  assert.match(text, /今年：2028/)
  assert.match(text, /四季（春夏秋冬）/)
  assert.match(text, /目標字數：900-1200字/)
  assert.match(text, /月份節奏表/)
  assert.match(text, /季度行動計畫/)
  assert.match(text, /命格詩/)
  assert.match(text, /詩意白話註解/)
})
