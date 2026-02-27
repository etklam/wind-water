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

const MAP = new Map(JIAZI.map((gz, index) => {
  const [name, element] = NAYIN_PAIRS[Math.floor(index / 2)]
  return [gz, { name, element }]
}))

export function getNayinByGanzhi(ganzhi) {
  return MAP.get(ganzhi) ?? null
}

export function elementCount(pillars) {
  const totals = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const gz of pillars) {
    if (!gz) continue
    const hit = getNayinByGanzhi(gz)
    if (hit) totals[hit.element] += 1
  }
  return totals
}

export { STEMS, BRANCHES, JIAZI }
