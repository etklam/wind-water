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
  assert.match(text, /目標字數：大約2000字/)
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
  assert.match(text, /目標字數：大約2000字/)
  assert.match(text, /月份節奏表/)
  assert.match(text, /季度行動計畫/)
  assert.match(text, /命格詩/)
  assert.match(text, /詩意白話註解/)
})

test('buildFortunePrompt includes mbti only when provided', () => {
  const withMbti = buildFortunePrompt({
    mode: 'year',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'male',
    mbti: 'INTJ',
    focusAreas: ['career'],
    userMessages: []
  })
  const withoutMbti = buildFortunePrompt({
    mode: 'year',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'male',
    focusAreas: ['career'],
    userMessages: []
  })

  const withText = withMbti.map((m) => m.content).join('\n')
  const withoutText = withoutMbti.map((m) => m.content).join('\n')
  assert.match(withText, /MBTI=INTJ/)
  assert.equal(/MBTI=/.test(withoutText), false)
})

test('buildFortunePrompt includes mbti destiny impact section only when mbti provided', () => {
  const withMbti = buildFortunePrompt({
    mode: 'life',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'female',
    mbti: 'INFJ',
    focusAreas: ['love'],
    userMessages: []
  })
  const withoutMbti = buildFortunePrompt({
    mode: 'life',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'female',
    focusAreas: ['love'],
    userMessages: []
  })

  const withText = withMbti.map((m) => m.content).join('\n')
  const withoutText = withoutMbti.map((m) => m.content).join('\n')
  assert.match(withText, /MBTI對命格影響/)
  assert.equal(/MBTI對命格影響/.test(withoutText), false)
})
