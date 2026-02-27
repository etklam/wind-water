import { STEMS, BRANCHES } from './nayin.js'

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
  // 1984-02-02 is used as 甲子 baseline in this calculator.
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

export function calculatePillars(input) {
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
