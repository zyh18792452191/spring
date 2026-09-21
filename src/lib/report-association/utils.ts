import { PageMetadata, ReportAssociation, MatchResult, AssociationType, PageType } from './types'
import { PageIdBuilder } from './types'

// 为字符串类型添加类型断言
const asPageType = (type: string): PageType => type as PageType

// 页面管理工具
export const PageManager = {
  // 获取页面元数据（从数据库或本地数据）
  async getPageMetadata(pageId: string): Promise<PageMetadata | null> {
    try {
      const response = await fetch('/api/association/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      })
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('获取页面元数据失败:', error)
      return null
    }
  },

  // 获取所有页面列表
  async getAllPages(filters?: {
    module?: string
    scenario?: string
    pageType?: PageType
    isTreePage?: boolean
  }): Promise<PageMetadata[]> {
    // 静态数据 - 市场运营平台层级结构
    const staticPages: PageMetadata[] = [
      // === 场景：首页 ===
      {
        pageId: 'home',
        pageName: '首页',
        pageType: asPageType('portal'),
        moduleId: 'portal',
        moduleName: '门户',
        scenarioId: 'home',
        scenarioName: '首页',
        isTreePage: false,
      },

      // === 场景：市场数智运营 ===
      {
        pageId: 'operation-overview',
        pageName: '运营总览',
        pageType: asPageType('overview'),
        moduleId: 'market',
        moduleName: '市场运营',
        scenarioId: 'market-intel',
        scenarioName: '市场数智运营',
        isTreePage: true,
        children: [
          {
            pageId: 'market-operation-overview',
            pageName: '市场运营总览',
            pageType: asPageType('section'),
            moduleId: 'market',
            moduleName: '市场运营',
            scenarioId: 'market-intel',
            scenarioName: '市场数智运营',
            isTreePage: false,
          },
        ],
      },
      {
        pageId: 'customer-operation',
        pageName: '客户运营',
        pageType: asPageType('overview'),
        moduleId: 'market',
        moduleName: '市场运营',
        scenarioId: 'market-intel',
        scenarioName: '市场数智运营',
        isTreePage: true,
        children: [
          {
            pageId: 'existing-customer',
            pageName: '存量运营',
            pageType: asPageType('section'),
            moduleId: 'market',
            moduleName: '市场运营',
            scenarioId: 'market-intel',
            scenarioName: '市场数智运营',
            isTreePage: true,
            children: [
              {
                pageId: 'high-end-customer',
                pageName: '中高端客户运营',
                pageType: asPageType('section'),
                moduleId: 'market',
                moduleName: '市场运营',
                scenarioId: 'market-intel',
                scenarioName: '市场数智运营',
                isTreePage: true,
                children: [
                  {
                    pageId: 'high-end-overview',
                    pageName: '中高端客户运营概览',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: true,
                    children: [
                      {
                        pageId: 'overall-metrics',
                        pageName: '整体指标',
                        pageType: asPageType('section'),
                        moduleId: 'market',
                        moduleName: '市场运营',
                        scenarioId: 'market-intel',
                        scenarioName: '市场数智运营',
                        isTreePage: false,
                      },
                      {
                        pageId: 'value-enhancement',
                        pageName: '价值提升',
                        pageType: asPageType('section'),
                        moduleId: 'market',
                        moduleName: '市场运营',
                        scenarioId: 'market-intel',
                        scenarioName: '市场数智运营',
                        isTreePage: true,
                        children: [
                          {
                            pageId: 'positive-value-increase',
                            pageName: '正向提值',
                            pageType: asPageType('component'),
                            moduleId: 'market',
                            moduleName: '市场运营',
                            scenarioId: 'market-intel',
                            scenarioName: '市场数智运营',
                            isTreePage: false,
                          },
                          {
                            pageId: 'reverse-loss-control',
                            pageName: '逆向控损',
                            pageType: asPageType('component'),
                            moduleId: 'market',
                            moduleName: '市场运营',
                            scenarioId: 'market-intel',
                            scenarioName: '市场数智运营',
                            isTreePage: false,
                          },
                        ],
                      },
                      {
                        pageId: 'scale-development',
                        pageName: '规模发展',
                        pageType: asPageType('section'),
                        moduleId: 'market',
                        moduleName: '市场运营',
                        scenarioId: 'market-intel',
                        scenarioName: '市场数智运营',
                        isTreePage: false,
                      },
                      {
                        pageId: 'convergence-strengthening',
                        pageName: '融合加固',
                        pageType: asPageType('section'),
                        moduleId: 'market',
                        moduleName: '市场运营',
                        scenarioId: 'market-intel',
                        scenarioName: '市场数智运营',
                        isTreePage: false,
                      },
                      {
                        pageId: 'customer-group-management',
                        pageName: '客群看管',
                        pageType: asPageType('section'),
                        moduleId: 'market',
                        moduleName: '市场运营',
                        scenarioId: 'market-intel',
                        scenarioName: '市场数智运营',
                        isTreePage: false,
                      },
                    ],
                  },
                  {
                    pageId: 'high-end-scale-retention',
                    pageName: '拍照中高端客户规模保有率',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'high-end-value-retention',
                    pageName: '拍照中高端客户价值保有率',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'high-end-decline-ratio',
                    pageName: '中高端一降到底占比',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'strategy-matching-highend',
                    pageName: '策略匹配',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'dispatch-highend',
                    pageName: '调度派发',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                ],
              },
              {
                pageId: 'churn-management',
                pageName: '离网维系',
                pageType: asPageType('section'),
                moduleId: 'market',
                moduleName: '市场运营',
                scenarioId: 'market-intel',
                scenarioName: '市场数智运营',
                isTreePage: true,
                children: [
                  {
                    pageId: 'monthly-all-churn',
                    pageName: '当月全量客户离网客户数',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'monthly-high-end-churn',
                    pageName: '当月拍照中高端客户离网客户数',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'monthly-global-churn',
                    pageName: '当月拍照全球通客户离网客户数',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'strategy-matching-churn',
                    pageName: '策略匹配',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                  {
                    pageId: 'dispatch-churn',
                    pageName: '调度派发',
                    pageType: asPageType('section'),
                    moduleId: 'market',
                    moduleName: '市场运营',
                    scenarioId: 'market-intel',
                    scenarioName: '市场数智运营',
                    isTreePage: false,
                  },
                ],
              },
            ],
          },
        ],
      },

      // === 场景：我的工作台 ===
      {
        pageId: 'workspace-home',
        pageName: '工作台首页',
        pageType: asPageType('workspace'),
        moduleId: 'workspace',
        moduleName: '工作台',
        scenarioId: 'workspace',
        scenarioName: '我的工作台',
        isTreePage: false,
      },
    ]

    // 应用过滤
    let filteredPages = staticPages

    if (filters?.module) {
      filteredPages = filteredPages.filter(p => p.moduleId === filters.module)
    }

    if (filters?.scenario) {
      filteredPages = filteredPages.filter(p => p.scenarioId === filters.scenario)
    }

    if (filters?.pageType) {
      filteredPages = filteredPages.filter(p => p.pageType === filters.pageType)
    }

    if (filters?.isTreePage !== undefined) {
      filteredPages = filteredPages.filter(p => p.isTreePage === filters.isTreePage)
    }

    return filteredPages
  },

  // 注册新页面（用于动态创建的指标树页面）
  async registerPage(metadata: PageMetadata): Promise<boolean> {
    try {
      const response = await fetch('/api/association/pages/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      })
      return response.ok
    } catch (error) {
      console.error('注册页面失败:', error)
      return false
    }
  },
}

// 报告关联管理工具
export const AssociationManager = {
  // 获取模板关联配置
  async getTemplateAssociations(templateId: number): Promise<ReportAssociation[]> {
    try {
      const response = await fetch(`/api/association/template/${templateId}`, {
        method: 'GET',
      })
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('获取模板关联失败:', error)
      return []
    }
  },

  // 保存模板关联配置
  async saveTemplateAssociations(
    templateId: number,
    associations: ReportAssociation[]
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/association/template/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ associations }),
      })
      return response.ok
    } catch (error) {
      console.error('保存模板关联失败:', error)
      return false
    }
  },

  // 获取报告关联配置
  async getReportAssociations(reportId: number): Promise<ReportAssociation[]> {
    try {
      const response = await fetch(`/api/association/report/${reportId}`, {
        method: 'GET',
      })
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('获取报告关联失败:', error)
      return []
    }
  },

  // 保存报告关联配置
  async saveReportAssociations(
    reportId: number,
    associations: ReportAssociation[]
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/association/report/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ associations }),
      })
      return response.ok
    } catch (error) {
      console.error('保存报告关联失败:', error)
      return false
    }
  },

  // 从模板继承关联到报告
  async inheritFromTemplate(
    templateId: number,
    reportId: number
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/association/inherit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, reportId }),
      })
      return response.ok
    } catch (error) {
      console.error('继承模板关联失败:', error)
      return false
    }
  },

  // 获取页面对应的报告列表
  async getPageReports(pageId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/association/page/${pageId}/reports`, {
        method: 'GET',
      })
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('获取页面报告失败:', error)
      return []
    }
  },
}

// 智能匹配算法
export const Matcher = {
  // 检查精确匹配
  checkPreciseMatch(pageId: string, targetPageId: string): boolean {
    return pageId === targetPageId
  },

  // 检查场景匹配
  checkScenarioMatch(pageScenarioId: string, targetScenarioId: string): boolean {
    return pageScenarioId === targetScenarioId
  },

  // 检查模块匹配
  checkModuleMatch(pageModuleId: string, targetModuleId: string): boolean {
    return pageModuleId === targetModuleId
  },

  // 检查标签匹配
  checkTagMatch(pageTags: string[], targetTags: string[]): { score: number } {
    if (!pageTags || !targetTags) return { score: 0 }
    
    let matchCount = 0
    targetTags.forEach(tag => {
      if (pageTags.includes(tag)) matchCount++
    })
    
    const score = Math.round((matchCount / targetTags.length) * 100)
    return { score }
  },

  // 综合匹配算法
  async matchReportsToPage(pageId: string, reportId: number): Promise<MatchResult> {
    const page = await PageManager.getPageMetadata(pageId)
    if (!page) {
      return { type: 'none', score: 0, reason: '页面不存在' }
    }

    const associations = await AssociationManager.getReportAssociations(reportId)
    
    // 1. 精确匹配（优先级最高）
    const preciseMatch = associations.find(
      a => a.associationType === 'page' && a.pageId === pageId
    )
    if (preciseMatch) {
      return { type: 'precise', score: 100, reason: '精确匹配到页面' }
    }

    // 2. 场景匹配
    if (page.scenarioId) {
      const scenarioMatch = associations.find(
        a => a.associationType === 'scenario' && a.targetId === page.scenarioId
      )
      if (scenarioMatch) {
        return { type: 'scenario', score: 80, reason: '场景匹配' }
      }
    }

    // 3. 模块匹配
    const moduleMatch = associations.find(
      a => a.associationType === 'module' && a.targetId === page.moduleId
    )
    if (moduleMatch) {
      return { type: 'module', score: 60, reason: '模块匹配' }
    }

    // 4. 标签匹配
    const pageTags = page.metadata?.tags || []
    const tagAssociations = associations.filter(a => a.associationType === 'tag')
    if (tagAssociations.length > 0) {
      for (const tagAssoc of tagAssociations) {
        const targetTags = tagAssoc.targetId?.split(',') || []
        const { score } = this.checkTagMatch(pageTags, targetTags)
        if (score > 0) {
          return { type: 'tag', score, reason: `标签匹配 (${score}%)` }
        }
      }
    }

    return { type: 'none', score: 0, reason: '未找到匹配' }
  },

  // 批量匹配页面报告
  async getMatchedReportsForPage(pageId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/associations/pages/${pageId}/reports`, {
        method: 'GET',
      })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('获取匹配报告失败:', error)
      return []
    }
  },

  // 匹配页面到关联配置
  matchPage(pageId: string, associations: ReportAssociation[]): ReportAssociation[] {
    const matched: ReportAssociation[] = []

    for (const association of associations) {
      let score = 0
      let matchReason = ''

      switch (association.associationType) {
        case 'page':
          if (association.pageId === pageId) {
            score = 100
            matchReason = '精确匹配'
          }
          break

        case 'scenario':
          if (pageId.includes(association.targetId || '')) {
            score = 80
            matchReason = '场景匹配'
          }
          break

        case 'module':
          if (pageId.startsWith(association.targetId || '')) {
            score = 60
            matchReason = '模块匹配'
          }
          break

        case 'tag':
          // 标签匹配（简化版，实际应该从页面元数据获取标签）
          score = 40
          matchReason = '标签匹配'
          break
      }

      if (score > 0) {
        matched.push({
          ...association,
          score,
          matchReason,
        } as ReportAssociation & { score: number; matchReason: string })
      }
    }

    // 按分数排序
    return matched.sort((a, b) => (b.score || 0) - (a.score || 0))
  },
}

// 关联配置验证器
export const AssociationValidator = {
  // 验证关联配置
  validateAssociation(association: ReportAssociation): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!association.associationType) {
      errors.push('关联类型不能为空')
    }

    if (association.associationType === 'page' && !association.pageId) {
      errors.push('精确关联必须指定页面ID')
    }

    if (association.associationType === 'scenario' && !association.targetId) {
      errors.push('场景关联必须指定场景ID')
    }

    if (association.associationType === 'module' && !association.targetId) {
      errors.push('模块关联必须指定模块ID')
    }

    if (association.associationType === 'tag' && !association.targetId) {
      errors.push('标签关联必须指定标签')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  // 验证关联配置列表
  validateAssociations(associations: ReportAssociation[]): { valid: boolean; errors: string[] } {
    const allErrors: string[] = []

    associations.forEach((association, index) => {
      const { valid, errors } = this.validateAssociation(association)
      if (!valid) {
        allErrors.push(`关联 ${index + 1}: ${errors.join(', ')}`)
      }
    })

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    }
  },
}
