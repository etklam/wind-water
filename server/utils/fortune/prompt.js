const STAGE_ONE_TEMPLATE = `
你是一位精通納音五行、八字命理的老師傅，請用「娛樂占卜」風格為我解讀，但要有條理、不要太空泛。

請先完成「五行盤點」：
1) 先排出四柱（年/月/日/時），若資料不足請明確標示不確定處。
2) 以納音五行為主，統計木火土金水強弱（0-100 或 強/中/弱）。
3) 判斷日主傾向、五行失衡點、喜用神方向（用神/忌神可簡化解釋）。
4) 先給一句「命盤總評」（40字內），再展開分析。
5) 用詞保留神祕感，但每段都要有實際建議。

輸出格式：
- 命盤總評：
- 四柱與納音：
- 五行強弱：
- 喜忌與用神：
- 立即可做的3件事：
`.trim()

function stageTwoTemplate(mode, year) {
  if (mode === 'life') {
    return `
延續上一輪的五行結果，現在請你做「一生運程」總覽（娛樂占卜風格）。

篇幅與風格：
1) 目標字數：大約1000字；寧可具體，不要空泛口號。
2) 保留玄學語感，但每段都要落到「原因 + 建議 + 時機」。
3) 禁止只列結論，必須交代與五行喜忌的連動邏輯。

分析要求：
1) 先用 80-120 字交代「一生主線」與核心課題。
2) 以 10 年為一段，切成：0-15、16-25、26-35、36-45、46-55、56+。
3) 每段至少 90 字，並固定包含：整體運勢（高/中/低）、事業/財運/感情/健康、1個機會、1個風險、1個行動建議。
4) 指出最容易起飛與最容易卡關的階段，各給 2 個具體觸發條件與對應化解法。
5) 補一段「關鍵關係與貴人/小人圖譜」：描述容易出現支持與消耗的人際模式，並給相處策略。
6) 補一段「每一階段行動清單」：每個年齡段各 2 件可執行行動。
7) 新增「命格詩」一首：形式自由，不限句數，但要緊扣此命格的五行喜忌、性別與重點領域，不可寫成通用雞湯。
8) 詩後補一行「詩意白話註解」，翻成具體提醒。
9) 最後給「一生關鍵提醒5條」，每條都要可立即執行。

輸出格式：
- 一生主線：
- 分階段運程：
- 高峰期與轉折點：
- 關鍵關係與貴人/小人圖譜：
- 每一階段行動清單：
- 命格詩：
- 詩意白話註解：
- 風險預警：
- 一生關鍵提醒5條：
`.trim()
  }

  return `
延續上一輪的五行結果，現在請你做「今年運程」詳批（娛樂占卜風格）。
今年：${year || new Date().getFullYear()}

篇幅與風格：
1) 避免流水帳，重點要有節奏與先後順序。
2) 每個重點都要同時回答：為什麼、何時做、怎麼做。
3) 保留娛樂占卜語氣，但建議必須可落地。

分析要求：
1) 先給年度總評（80-120字），含今年主題與關鍵風險。
2) 分四季（春夏秋冬）解讀：事業、財運（正財/偏財）、感情、健康；每季至少 120 字。
3) 增加「月份節奏表」：列出 12 個月中至少 4 個旺月、4 個保守月，並標註每月焦點。
4) 增加「季度行動計畫」：Q1-Q4 各給 2 個優先行動與 1 個避免事項。
5) 提供：宜做3件事、忌做3件事、開運建議（顏色/方位/作息/人際策略）。
6) 新增「命格詩」一首：形式自由，不限句數，但要呼應今年主題、五行喜忌、性別與重點領域，避免泛用語句。
7) 詩後補一行「詩意白話註解」，翻成今年可執行提醒。
8) 若資料不足，請給保守版與進取版兩種情境預測，並說明觸發條件。

輸出格式：
- 年度總評：
- 四季運勢：
- 月份節奏表：
- 旺月與保守月：
- 季度行動計畫：
- 命格詩：
- 詩意白話註解：
- 宜做3件事：
- 忌做3件事：
- 開運建議：
`.trim()
}

export function buildFortunePrompt({ mode, year, profile, gender, mbti, focusAreas, userMessages }) {
  const profileText = JSON.stringify(profile, null, 2)
  const genderText = (() => {
    if (gender === 'male') return '男'
    if (gender === 'female') return '女'
    return '未提供'
  })()
  const focusMap = {
    overall: '綜合',
    career: '事業',
    love: '愛情',
    health: '健康'
  }
  const focusText = Array.isArray(focusAreas) && focusAreas.length > 0
    ? focusAreas.map((item) => focusMap[item] || item).join('、')
    : '綜合'
  const mbtiText = mbti ? `；MBTI=${mbti}` : ''
  const baseMessages = [
    { role: 'system', content: '你是納音五行命理助手，務必用繁體中文回答。' },
    { role: 'system', content: STAGE_ONE_TEMPLATE },
    { role: 'system', content: stageTwoTemplate(mode, year) },
    { role: 'system', content: `使用者條件：性別=${genderText}；重點領域=${focusText}${mbtiText}。請在輸出中優先回應這些重點。` },
    { role: 'user', content: `以下是命盤摘要（納音/五行）：\n${profileText}` }
  ]

  if (!Array.isArray(userMessages) || userMessages.length === 0) {
    return baseMessages
  }

  const sanitized = userMessages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content
    }))

  return [...baseMessages, ...sanitized]
}
