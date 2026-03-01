const NAYIN_GUIDE_ITEMS = [
  { id: 'hai-zhong-jin', name: '海中金', element: 'metal', summary: '象徵潛藏之金，重在積累與時機。' },
  { id: 'lu-zhong-huo', name: '炉中火', element: 'fire', summary: '如爐火需得木助，重在持續燃燒與培養。' },
  { id: 'da-lin-mu', name: '大林木', element: 'wood', summary: '如林木成勢，講求根基、擴展與耐性。' },
  { id: 'lu-pang-tu', name: '路旁土', element: 'earth', summary: '道路之土，重在承載、規則與秩序。' },
  { id: 'jian-feng-jin', name: '剑锋金', element: 'metal', summary: '鋒刃之金，強調決斷、效率與執行。' },
  { id: 'shan-tou-huo', name: '山头火', element: 'fire', summary: '山頂之火，外放明顯，重在表現與照耀。' },
  { id: 'jian-xia-shui', name: '涧下水', element: 'water', summary: '溪澗之水，靈活細流，重在適應與滲透。' },
  { id: 'cheng-tou-tu', name: '城头土', element: 'earth', summary: '城牆之土，偏向防護、穩定與責任。' },
  { id: 'bai-la-jin', name: '白蜡金', element: 'metal', summary: '需鍛煉成器，重在打磨與成熟。' },
  { id: 'yang-liu-mu', name: '杨柳木', element: 'wood', summary: '柔木善應變，重在彈性與調和。' },
  { id: 'quan-zhong-shui', name: '泉中水', element: 'water', summary: '泉源之水，內斂穩定，重在長期供給。' },
  { id: 'wu-shang-tu', name: '屋上土', element: 'earth', summary: '屋頂之土，講求保護與結構完整。' },
  { id: 'pi-li-huo', name: '霹雳火', element: 'fire', summary: '雷霆之火，爆發力強，重在快速突破。' },
  { id: 'song-bai-mu', name: '松柏木', element: 'wood', summary: '常青堅韌，重在定力與長線發展。' },
  { id: 'chang-liu-shui', name: '长流水', element: 'water', summary: '江河長流，重在連續性與整合能力。' },
  { id: 'sha-zhong-jin', name: '砂中金', element: 'metal', summary: '藏於砂礫之金，需篩選與提煉。' },
  { id: 'shan-xia-huo', name: '山下火', element: 'fire', summary: '山下之火，溫熱持續，重在累積影響。' },
  { id: 'ping-di-mu', name: '平地木', element: 'wood', summary: '平地之木，務實生長，重在環境經營。' },
  { id: 'bi-shang-tu', name: '壁上土', element: 'earth', summary: '牆壁之土，重邊界與防護能力。' },
  { id: 'jin-bo-jin', name: '金箔金', element: 'metal', summary: '薄金需依附成形，重在精緻與配合。' },
  { id: 'fu-deng-huo', name: '覆灯火', element: 'fire', summary: '燈火重穩定照明，重在細緻與持守。' },
  { id: 'tian-he-shui', name: '天河水', element: 'water', summary: '天河之水，格局較大，重在視野與循環。' },
  { id: 'da-yi-tu', name: '大驿土', element: 'earth', summary: '驛站之土，重中轉協調與承接任務。' },
  { id: 'chai-chuan-jin', name: '钗钏金', element: 'metal', summary: '飾器之金，重在品質、審美與細節。' },
  { id: 'sang-zhe-mu', name: '桑柘木', element: 'wood', summary: '桑柘務實有用，重在供應與支持。' },
  { id: 'da-xi-shui', name: '大溪水', element: 'water', summary: '溪流壯大，重在推進與資源流動。' },
  { id: 'sha-zhong-tu', name: '沙中土', element: 'earth', summary: '沙土需聚合，重在整合與固化成果。' },
  { id: 'tian-shang-huo', name: '天上火', element: 'fire', summary: '天火高照，重在理想、啟發與引領。' },
  { id: 'shi-liu-mu', name: '石榴木', element: 'wood', summary: '木實並重，重在產出與成果轉化。' },
  { id: 'da-hai-shui', name: '大海水', element: 'water', summary: '海納百川，重在包容、格局與調度。' }
]

const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water']
const itemByName = new Map(NAYIN_GUIDE_ITEMS.map((item) => [item.name, item]))

function getNayinGuideByName(name) {
  return itemByName.get(name) || null
}

function groupNayinGuideByElement() {
  return elementOrder.map((element) => ({
    element,
    items: NAYIN_GUIDE_ITEMS.filter((item) => item.element === element)
  }))
}

export {
  NAYIN_GUIDE_ITEMS,
  getNayinGuideByName,
  groupNayinGuideByElement
}
