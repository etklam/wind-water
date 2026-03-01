const NAYIN_GUIDE_ITEMS = [
  { id: 'hai-zhong-jin', name: { 'zh-Hant': '海中金', 'zh-Hans': '海中金' }, element: 'metal', summary: { 'zh-Hant': '象徵潛藏之金，重在積累與時機。', 'zh-Hans': '象征潜藏之金，重在积累与时机。' } },
  { id: 'lu-zhong-huo', name: { 'zh-Hant': '爐中火', 'zh-Hans': '炉中火' }, element: 'fire', summary: { 'zh-Hant': '如爐火需得木助，重在持續燃燒與培養。', 'zh-Hans': '如炉火需得木助，重在持续燃烧与培养。' } },
  { id: 'da-lin-mu', name: { 'zh-Hant': '大林木', 'zh-Hans': '大林木' }, element: 'wood', summary: { 'zh-Hant': '如林木成勢，講求根基、擴展與耐性。', 'zh-Hans': '如林木成势，讲求根基、扩展与耐性。' } },
  { id: 'lu-pang-tu', name: { 'zh-Hant': '路旁土', 'zh-Hans': '路旁土' }, element: 'earth', summary: { 'zh-Hant': '道路之土，重在承載、規則與秩序。', 'zh-Hans': '道路之土，重在承载、规则与秩序。' } },
  { id: 'jian-feng-jin', name: { 'zh-Hant': '劍鋒金', 'zh-Hans': '剑锋金' }, element: 'metal', summary: { 'zh-Hant': '鋒刃之金，強調決斷、效率與執行。', 'zh-Hans': '锋刃之金，强调决断、效率与执行。' } },
  { id: 'shan-tou-huo', name: { 'zh-Hant': '山頭火', 'zh-Hans': '山头火' }, element: 'fire', summary: { 'zh-Hant': '山頂之火，外放明顯，重在表現與照耀。', 'zh-Hans': '山顶之火，外放明显，重在表现与照耀。' } },
  { id: 'jian-xia-shui', name: { 'zh-Hant': '澗下水', 'zh-Hans': '涧下水' }, element: 'water', summary: { 'zh-Hant': '溪澗之水，靈活細流，重在適應與滲透。', 'zh-Hans': '溪涧之水，灵活细流，重在适应与渗透。' } },
  { id: 'cheng-tou-tu', name: { 'zh-Hant': '城頭土', 'zh-Hans': '城头土' }, element: 'earth', summary: { 'zh-Hant': '城牆之土，偏向防護、穩定與責任。', 'zh-Hans': '城墙之土，偏向防护、稳定与责任。' } },
  { id: 'bai-la-jin', name: { 'zh-Hant': '白蠟金', 'zh-Hans': '白蜡金' }, element: 'metal', summary: { 'zh-Hant': '需鍛煉成器，重在打磨與成熟。', 'zh-Hans': '需锻炼成器，重在打磨与成熟。' } },
  { id: 'yang-liu-mu', name: { 'zh-Hant': '楊柳木', 'zh-Hans': '杨柳木' }, element: 'wood', summary: { 'zh-Hant': '柔木善應變，重在彈性與調和。', 'zh-Hans': '柔木善应变，重在弹性与调和。' } },
  { id: 'quan-zhong-shui', name: { 'zh-Hant': '泉中水', 'zh-Hans': '泉中水' }, element: 'water', summary: { 'zh-Hant': '泉源之水，內斂穩定，重在長期供給。', 'zh-Hans': '泉源之水，内敛稳定，重在长期供给。' } },
  { id: 'wu-shang-tu', name: { 'zh-Hant': '屋上土', 'zh-Hans': '屋上土' }, element: 'earth', summary: { 'zh-Hant': '屋頂之土，講求保護與結構完整。', 'zh-Hans': '屋顶之土，讲求保护与结构完整。' } },
  { id: 'pi-li-huo', name: { 'zh-Hant': '霹靂火', 'zh-Hans': '霹雳火' }, element: 'fire', summary: { 'zh-Hant': '雷霆之火，爆發力強，重在快速突破。', 'zh-Hans': '雷霆之火，爆发力强，重在快速突破。' } },
  { id: 'song-bai-mu', name: { 'zh-Hant': '松柏木', 'zh-Hans': '松柏木' }, element: 'wood', summary: { 'zh-Hant': '常青堅韌，重在定力與長線發展。', 'zh-Hans': '常青坚韧，重在定力与长线发展。' } },
  { id: 'chang-liu-shui', name: { 'zh-Hant': '長流水', 'zh-Hans': '长流水' }, element: 'water', summary: { 'zh-Hant': '江河長流，重在連續性與整合能力。', 'zh-Hans': '江河长流，重在连续性与整合能力。' } },
  { id: 'sha-zhong-jin', name: { 'zh-Hant': '砂中金', 'zh-Hans': '砂中金' }, element: 'metal', summary: { 'zh-Hant': '藏於砂礫之金，需篩選與提煉。', 'zh-Hans': '藏于砂砾之金，需筛选与提炼。' } },
  { id: 'shan-xia-huo', name: { 'zh-Hant': '山下火', 'zh-Hans': '山下火' }, element: 'fire', summary: { 'zh-Hant': '山下之火，溫熱持續，重在累積影響。', 'zh-Hans': '山下之火，温热持续，重在累积影响。' } },
  { id: 'ping-di-mu', name: { 'zh-Hant': '平地木', 'zh-Hans': '平地木' }, element: 'wood', summary: { 'zh-Hant': '平地之木，務實生長，重在環境經營。', 'zh-Hans': '平地之木，务实生长，重在环境经营。' } },
  { id: 'bi-shang-tu', name: { 'zh-Hant': '壁上土', 'zh-Hans': '壁上土' }, element: 'earth', summary: { 'zh-Hant': '牆壁之土，重邊界與防護能力。', 'zh-Hans': '墙壁之土，重边界与防护能力。' } },
  { id: 'jin-bo-jin', name: { 'zh-Hant': '金箔金', 'zh-Hans': '金箔金' }, element: 'metal', summary: { 'zh-Hant': '薄金需依附成形，重在精緻與配合。', 'zh-Hans': '薄金需依附成形，重在精致与配合。' } },
  { id: 'fu-deng-huo', name: { 'zh-Hant': '覆燈火', 'zh-Hans': '覆灯火' }, element: 'fire', summary: { 'zh-Hant': '燈火重穩定照明，重在細緻與持守。', 'zh-Hans': '灯火重稳定照明，重在细致与持守。' } },
  { id: 'tian-he-shui', name: { 'zh-Hant': '天河水', 'zh-Hans': '天河水' }, element: 'water', summary: { 'zh-Hant': '天河之水，格局較大，重在視野與循環。', 'zh-Hans': '天河之水，格局较大，重在视野与循环。' } },
  { id: 'da-yi-tu', name: { 'zh-Hant': '大驛土', 'zh-Hans': '大驿土' }, element: 'earth', summary: { 'zh-Hant': '驛站之土，重中轉協調與承接任務。', 'zh-Hans': '驿站之土，重中转协调与承接任务。' } },
  { id: 'chai-chuan-jin', name: { 'zh-Hant': '釵釧金', 'zh-Hans': '钗钏金' }, element: 'metal', summary: { 'zh-Hant': '飾器之金，重在品質、審美與細節。', 'zh-Hans': '饰器之金，重在品质、审美与细节。' } },
  { id: 'sang-zhe-mu', name: { 'zh-Hant': '桑柘木', 'zh-Hans': '桑柘木' }, element: 'wood', summary: { 'zh-Hant': '桑柘務實有用，重在供應與支持。', 'zh-Hans': '桑柘务实有用，重在供应与支持。' } },
  { id: 'da-xi-shui', name: { 'zh-Hant': '大溪水', 'zh-Hans': '大溪水' }, element: 'water', summary: { 'zh-Hant': '溪流壯大，重在推進與資源流動。', 'zh-Hans': '溪流壮大，重在推进与资源流动。' } },
  { id: 'sha-zhong-tu', name: { 'zh-Hant': '沙中土', 'zh-Hans': '沙中土' }, element: 'earth', summary: { 'zh-Hant': '沙土需聚合，重在整合與固化成果。', 'zh-Hans': '沙土需聚合，重在整合与固化成果。' } },
  { id: 'tian-shang-huo', name: { 'zh-Hant': '天上火', 'zh-Hans': '天上火' }, element: 'fire', summary: { 'zh-Hant': '天火高照，重在理想、啟發與引領。', 'zh-Hans': '天火高照，重在理想、启发与引领。' } },
  { id: 'shi-liu-mu', name: { 'zh-Hant': '石榴木', 'zh-Hans': '石榴木' }, element: 'wood', summary: { 'zh-Hant': '木實並重，重在產出與成果轉化。', 'zh-Hans': '木实并重，重在产出与成果转化。' } },
  { id: 'da-hai-shui', name: { 'zh-Hant': '大海水', 'zh-Hans': '大海水' }, element: 'water', summary: { 'zh-Hant': '海納百川，重在包容、格局與調度。', 'zh-Hans': '海纳百川，重在包容、格局与调度。' } }
]

const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water']
const itemByName = new Map(
  NAYIN_GUIDE_ITEMS.flatMap((item) => ([
    [item.name['zh-Hant'], item],
    [item.name['zh-Hans'], item]
  ]))
)

function localizeItem(item, locale = 'zh-Hant') {
  return {
    id: item.id,
    element: item.element,
    name: item.name[locale] || item.name['zh-Hant'],
    summary: item.summary[locale] || item.summary['zh-Hant']
  }
}

function getNayinGuideByName(name) {
  return itemByName.get(name) || null
}

function groupNayinGuideByElement(locale = 'zh-Hant') {
  return elementOrder.map((element) => ({
    element,
    items: NAYIN_GUIDE_ITEMS
      .filter((item) => item.element === element)
      .map((item) => localizeItem(item, locale))
  }))
}

export {
  NAYIN_GUIDE_ITEMS,
  getNayinGuideByName,
  groupNayinGuideByElement
}
