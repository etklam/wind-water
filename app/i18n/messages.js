export const messages = {
  'zh-Hant': {
    app: { title: '納音五行計算' },
    form: {
      step1Title: '第一步：輸入資料',
      birthDate: '出生日期',
      birthTime: '出生時間',
      timezone: '時區',
      unknownHour: '未知時辰（僅算年/月/日）',
      mode: {
        title: '排盤模式',
        gregorian: '公曆直排',
        traditional: '傳統規則（節氣/子初）',
        traditionalHelp: '傳統規則說明：以節氣切換月份，並以子初（23:00）作為換日界線。'
      },
      submit: '開始計算'
    },
    fortune: {
      title: '第二步：AI 算命',
      hint: '請先完成五行計算，再選擇性別與運程類型。',
      gender: '性別',
      genderPlaceholder: '請選擇',
      genderRequired: '請先選擇性別',
      genders: { unknown: '未填', male: '男', female: '女' },
      typeTitle: '運程類型',
      types: { year2026: '2026 運程', life: '一生運程' },
      focusTitle: '分析重點',
      focuses: { overall: '綜合', career: '事業', love: '愛情', health: '身體' },
      submit: 'AI 算命',
      loading: '計算中...',
      resultTitle: 'AI 算命結果',
      copy: '複製結果',
      copied: '已複製',
      copyFailed: '複製失敗，請手動複製',
      needFiveElements: '請先完成第一步五行計算',
      requestFailed: '算命請求失敗，請稍後再試',
      emptyResult: 'AI 未返回內容，請重試'
    },
    result: {
      title: '計算結果',
      pillars: { year: '年柱', month: '月柱', day: '日柱', hour: '時柱' },
      ganzhi: '干支',
      nayin: '納音',
      element: '五行',
      totals: '五行統計',
      rule: '規則'
    },
    bagua: {
      title: '八卦五行盤',
      center: '太極中樞',
      highlight: '旺行',
      trigrams: {
        qian: '乾',
        dui: '兌',
        li: '離',
        zhen: '震',
        xun: '巽',
        kan: '坎',
        gen: '艮',
        kun: '坤'
      },
      directions: {
        north: '北',
        northeast: '東北',
        east: '東',
        southeast: '東南',
        south: '南',
        southwest: '西南',
        west: '西',
        northwest: '西北'
      }
    },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    warnings: {
      chartPrivacy: '隱私提醒：你已填入出生時間，請勿公開分享完整命盤與個資。'
    },
    errors: { requiredDate: '請輸入日期', requiredTimezone: '請選擇時區' },
    rules: { 'local-midnight': '本地 00:00 換日', 'solar-term-and-zi-hour': '節氣換月、子初換日（23:00）' }
  },
  'zh-Hans': {
    app: { title: '纳音五行计算' },
    form: {
      step1Title: '第一步：输入资料',
      birthDate: '出生日期',
      birthTime: '出生时间',
      timezone: '时区',
      unknownHour: '未知时辰（仅算年/月/日）',
      mode: {
        title: '排盘模式',
        gregorian: '公历直排',
        traditional: '传统规则（节气/子初）',
        traditionalHelp: '传统规则说明：以节气切换月份，并以子初（23:00）作为换日界线。'
      },
      submit: '开始计算'
    },
    fortune: {
      title: '第二步：AI 算命',
      hint: '请先完成五行计算，再选择性别与运程类型。',
      gender: '性别',
      genderPlaceholder: '请选择',
      genderRequired: '请先选择性别',
      genders: { unknown: '未填', male: '男', female: '女' },
      typeTitle: '运程类型',
      types: { year2026: '2026 运程', life: '一生运程' },
      focusTitle: '分析重点',
      focuses: { overall: '综合', career: '事业', love: '爱情', health: '身体' },
      submit: 'AI 算命',
      loading: '計算中...',
      resultTitle: 'AI 算命结果',
      copy: '复制结果',
      copied: '已复制',
      copyFailed: '复制失败，请手动复制',
      needFiveElements: '请先完成第一步五行计算',
      requestFailed: '算命请求失败，请稍后再试',
      emptyResult: 'AI 未返回内容，请重试'
    },
    result: {
      title: '计算结果',
      pillars: { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' },
      ganzhi: '干支',
      nayin: '纳音',
      element: '五行',
      totals: '五行统计',
      rule: '规则'
    },
    bagua: {
      title: '八卦五行盘',
      center: '太极中枢',
      highlight: '旺行',
      trigrams: {
        qian: '乾',
        dui: '兑',
        li: '离',
        zhen: '震',
        xun: '巽',
        kan: '坎',
        gen: '艮',
        kun: '坤'
      },
      directions: {
        north: '北',
        northeast: '东北',
        east: '东',
        southeast: '东南',
        south: '南',
        southwest: '西南',
        west: '西',
        northwest: '西北'
      }
    },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    warnings: {
      chartPrivacy: '隐私提醒：你已填入出生时间，请勿公开分享完整命盘与个人信息。'
    },
    errors: { requiredDate: '请输入日期', requiredTimezone: '请选择时区' },
    rules: { 'local-midnight': '本地 00:00 换日', 'solar-term-and-zi-hour': '节气换月、子初换日（23:00）' }
  }
}
