const allowedFocusAreas = new Set(['overall', 'career', 'love', 'health'])
const focusAreaLabels = {
  overall: '綜合',
  career: '事業',
  love: '愛情',
  health: '身體'
}

export function buildFortuneRequestPayload({ totals, gender, fortuneType, focusAreas = [] }) {
  const mode = fortuneType === 'life' ? 'life' : 'year'
  const metadata = {
    mode,
    gender: gender || ''
  }

  if (mode === 'year') {
    metadata.year = 2026
  }

  metadata.five_elements = {
    wood: Number(totals?.wood || 0),
    fire: Number(totals?.fire || 0),
    earth: Number(totals?.earth || 0),
    metal: Number(totals?.metal || 0),
    water: Number(totals?.water || 0)
  }
  metadata.focus_areas = (Array.isArray(focusAreas) ? focusAreas : [])
    .filter((item) => allowedFocusAreas.has(item))
  const focusText = (metadata.focus_areas.length > 0 ? metadata.focus_areas : ['overall'])
    .map((item) => focusAreaLabels[item] || item)
    .join('、')
  const instruction = mode === 'life' ? '請依模板做一生運程分析' : '請依模板做今年運程分析'

  return {
    model: '',
    messages: [
      { role: 'user', content: `${instruction}，重點請聚焦：${focusText}` }
    ],
    metadata
  }
}
