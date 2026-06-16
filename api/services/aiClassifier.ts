export interface ClassificationResult {
  category: string
  severity: 'general' | 'urgent' | 'critical'
  confidence: number
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '路灯': ['路灯', '灯不亮', '照明', '黑灯'],
  '电梯': ['电梯', '升降机', '困人', '电梯故障'],
  '水管': ['水管', '漏水', '渗水', '停水', '管道'],
  '路面': ['路面', '坑洼', '地砖', '道路', '塌陷'],
  '消防设施': ['消防', '灭火器', '消防栓', '烟雾报警器'],
  '门禁': ['门禁', '门锁', '对讲', '刷卡'],
  '绿化': ['绿化', '树木', '草坪', '花坛'],
}

const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ['爆裂', '困人', '漏电', '着火', '坍塌', '严重', '危险'],
  urgent: ['坏了', '故障', '漏水', '不停', '异响'],
  general: ['不亮', '脏了', '破损', '松动'],
}

/**
 * 基于关键词与描述文本进行问题分类和严重度评估。
 * Demo 阶段用规则引擎模拟 AI，后续可替换为真实模型。
 */
export function classifyRepairIssue(description: string): ClassificationResult {
  const lowerDesc = description.toLowerCase()

  let matchedCategory = '其他'
  let maxScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((sum, keyword) => {
      return lowerDesc.includes(keyword) ? sum + 1 : sum
    }, 0)
    if (score > maxScore) {
      maxScore = score
      matchedCategory = category
    }
  }

  let severity: 'general' | 'urgent' | 'critical' = 'general'
  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      severity = level as 'general' | 'urgent' | 'critical'
      break
    }
  }

  const confidence = Math.min(0.5 + maxScore * 0.15, 0.95)

  return {
    category: matchedCategory,
    severity,
    confidence,
  }
}
