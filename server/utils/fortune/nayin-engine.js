const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const NAYIN_PAIRS = [
  ['海中金', 'metal'], ['炉中火', 'fire'], ['大林木', 'wood'], ['路旁土', 'earth'], ['剑锋金', 'metal'],
  ['山头火', 'fire'], ['涧下水', 'water'], ['城头土', 'earth'], ['白蜡金', 'metal'], ['杨柳木', 'wood'],
  ['泉中水', 'water'], ['屋上土', 'earth'], ['霹雳火', 'fire'], ['松柏木', 'wood'], ['长流水', 'water'],
  ['砂中金', 'metal'], ['山下火', 'fire'], ['平地木', 'wood'], ['壁上土', 'earth'], ['金箔金', 'metal'],
  ['覆灯火', 'fire'], ['天河水', 'water'], ['大驿土', 'earth'], ['钗钏金', 'metal'], ['桑柘木', 'wood'],
  ['大溪水', 'water'], ['沙中土', 'earth'], ['天上火', 'fire'], ['石榴木', 'wood'], ['大海水', 'water']
]

const JIAZI = Array.from({ length: 60 }, (_, i) => `${STEMS[i % 10]}${BRANCHES[i % 12]}`)
const NAYIN_MAP = new Map(JIAZI.map((gz, index) => {
  const [name, element] = NAYIN_PAIRS[Math.floor(index / 2)]
  return [gz, { name, element }]
}))

function mod(n, m) {
  return ((n % m) + m) % m
}

function parseInputParts(input) {
  const [year, month, day] = input.date.split('-').map(Number)
  const [hour, minute] = (input.time || '12:00').split(':').map(Number)
  return { year, month, day, hour, minute }
}

function getMonthIndexTraditional(month, day) {
  const boundaries = [
    [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
    [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6]
  ]

  for (let i = 0; i < boundaries.length; i += 1) {
    const [m, d] = boundaries[i]
    if (month > m || (month === m && day >= d)) {
      return i
    }
  }

  return 11
}

function yearGanzhi(year, month, day, mode) {
  let calcYear = year
  if (mode === 'traditional') {
    if (month < 2 || (month === 2 && day < 4)) calcYear -= 1
  }
  const index = mod(calcYear - 1984, 60)
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`
}

function monthGanzhi(yearStemIndex, month, day, mode) {
  const monthIndex = mode === 'traditional'
    ? getMonthIndexTraditional(month, day)
    : mod(month - 2, 12)
  const branchIndex = mod(2 + monthIndex, 12)
  const firstMonthStem = mod((yearStemIndex % 5) * 2 + 2, 10)
  const stemIndex = mod(firstMonthStem + monthIndex, 10)
  return `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`
}

function dayGanzhi(year, month, day) {
  const baseUtc = Date.UTC(1984, 1, 2)
  const targetUtc = Date.UTC(year, month - 1, day)
  const diff = Math.floor((targetUtc - baseUtc) / 86400000)
  const index = mod(diff, 60)
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`
}

function hourGanzhi(dayStem, hour, hasTime) {
  if (!hasTime) return null
  const hourBranchIndex = hour === 23 ? 0 : mod(Math.floor((hour + 1) / 2), 12)
  const dayStemIndex = STEMS.indexOf(dayStem)
  const ziStem = mod((dayStemIndex % 5) * 2, 10)
  const stemIndex = mod(ziStem + hourBranchIndex, 10)
  return `${STEMS[stemIndex]}${BRANCHES[hourBranchIndex]}`
}

function calculatePillars(input) {
  const { year, month, day, hour } = parseInputParts(input)
  let calcYear = year
  let calcMonth = month
  let calcDay = day

  if (input.mode === 'traditional' && input.time && hour >= 23) {
    const shifted = new Date(Date.UTC(year, month - 1, day))
    shifted.setUTCDate(shifted.getUTCDate() + 1)
    calcYear = shifted.getUTCFullYear()
    calcMonth = shifted.getUTCMonth() + 1
    calcDay = shifted.getUTCDate()
  }

  const ygz = yearGanzhi(calcYear, calcMonth, calcDay, input.mode)
  const yStemIdx = STEMS.indexOf(ygz[0])
  const mgz = monthGanzhi(yStemIdx, calcMonth, calcDay, input.mode)
  const dgz = dayGanzhi(calcYear, calcMonth, calcDay)
  const hgz = hourGanzhi(dgz[0], hour, Boolean(input.time))

  return {
    year: ygz,
    month: mgz,
    day: dgz,
    hour: hgz,
    meta: {
      mode: input.mode,
      timezone: input.timezone,
      rule: input.mode === 'traditional' ? 'solar-term-and-zi-hour' : 'local-midnight'
    }
  }
}

function getNayinByGanzhi(ganzhi) {
  return NAYIN_MAP.get(ganzhi) ?? null
}

function elementCount(pillars) {
  const totals = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const gz of pillars) {
    if (!gz) continue
    const hit = getNayinByGanzhi(gz)
    if (hit) totals[hit.element] += 1
  }
  return totals
}

export function computeNayinProfile(input) {
  const pillars = calculatePillars(input)
  const keys = ['year', 'month', 'day', 'hour']
  const pillarResult = {}

  for (const key of keys) {
    const ganzhi = pillars[key]
    const data = ganzhi ? getNayinByGanzhi(ganzhi) : null
    pillarResult[key] = {
      ganzhi,
      nayin: data?.name || '-',
      element: data?.element || '-'
    }
  }

  return {
    pillars: pillarResult,
    totals: elementCount(keys.map((key) => pillars[key])),
    meta: pillars.meta
  }
}
