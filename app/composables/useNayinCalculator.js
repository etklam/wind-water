import { calculatePillars } from '../utils/pillars.js'
import { elementCount, getNayinByGanzhi } from '../utils/nayin.js'

export function computeNayinResult(input) {
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

  const totals = elementCount(keys.map((key) => pillars[key]))

  return { pillars: pillarResult, totals, meta: pillars.meta }
}
