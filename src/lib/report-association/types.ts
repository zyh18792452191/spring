// 页面标识规范定义

export enum PageType {
  OVERVIEW = 'overview', // 概览页
  TREE = 'tree', // 指标树页面
  DASHBOARD = 'dashboard', // 仪表板
  REPORT = 'report', // 报告页
  PORTAL = 'portal', // 门户
  WORKSPACE = 'workspace', // 工作台
  SECTION = 'section', // 区域
  COMPONENT = 'component', // 组件
}

export enum ModuleId {
  MARKET = 'market', // 市场运营
  CUSTOMER = 'customer', // 客户运营
  PRODUCT = 'product', // 产品运营
  PORTAL = 'portal', // 门户
}

export enum ScenarioId {
  MARKET = 'market', // 市场运营
  CHURN = 'churn', // 离网维系
  MID_HIGH_END = 'mid_high_end', // 中高端客户运营
  CHURN_WARNING = 'churn_warning', // 中高端流失预警
  NEW_SUBSCRIPTIONS = 'new_subscriptions', // 新入网
  GROUP_CUSTOMERS = 'group_customers', // 集团成员客户
}

export enum AssociationType {
  PAGE = 'page', // 精确关联到页面
  SCENARIO = 'scenario', // 关联到业务场景
  MODULE = 'module', // 关联到业务模块
  TAG = 'tag', // 智能标签匹配
}

// 页面ID格式：{module}.{scenario}.{page_type}.{unique_id}
export interface PageIdFormat {
  module: string
  scenario?: string
  type: PageType
  uniqueId?: string
}

// 页面元数据
export interface PageMetadata {
  pageId: string
  pageName: string
  pageType: PageType
  moduleId: string
  scenarioId?: string
  scenarioName?: string
  moduleName?: string
  pagePath?: string
  isTreePage?: boolean
  treeConfigId?: string
  metadata?: Record<string, any>
  children?: PageMetadata[] // 支持树形结构的子节点
}

// 报告关联配置
export interface ReportAssociation {
  id?: number
  templateId?: number
  reportId?: number
  associationType: AssociationType
  targetId?: string
  pageId?: string
  sectionId?: string // 区域ID
  componentId?: string // 组件ID
  isDefault?: boolean
  isOverridden?: boolean
  displayPriority?: number
  createdBy?: string
  // 为了兼容，添加这些字段
  type?: AssociationType
  targetType?: string
  priority?: number
  createdAt?: Date | string
  // 匹配分数（用于排序）
  score?: number
  matchReason?: string
}

// 报告关联配置（模板配置）
export interface ReportAssociationConfig {
  associations: ReportAssociation[]
}

// 智能匹配结果
export interface MatchResult {
  type: 'precise' | 'scenario' | 'module' | 'tag' | 'none'
  score: number
  reason?: string
}

// 页面标识生成器
export class PageIdBuilder {
  static build(params: PageIdFormat): string {
    const parts = [params.module]
    if (params.scenario) {
      parts.push(params.scenario)
    }
    parts.push(params.type)
    if (params.uniqueId) {
      parts.push(params.uniqueId)
    }
    return parts.join('.')
  }

  static parse(pageId: string): PageIdFormat {
    const parts = pageId.split('.')
    return {
      module: parts[0],
      scenario: parts[1] || undefined,
      type: parts[2] as PageType,
      uniqueId: parts[3] || undefined,
    }
  }

  // 生成概览页ID
  static overview(module: string, scenario?: string): string {
    return this.build({
      module,
      scenario,
      type: PageType.OVERVIEW,
    })
  }

  // 生成指标树页ID
  static tree(module: string, scenario: string, treeConfigId: string): string {
    return this.build({
      module,
      scenario,
      type: PageType.TREE,
      uniqueId: treeConfigId,
    })
  }

  // 生成仪表板ID
  static dashboard(module: string, scenario?: string, name?: string): string {
    return this.build({
      module,
      scenario,
      type: PageType.DASHBOARD,
      uniqueId: name,
    })
  }
}

// 预定义的页面ID常量
export const PageIds = {
  // 门户
  PORTAL_HOME: PageIdBuilder.dashboard('portal'),

  // 市场运营模块
  MARKET_OVERVIEW: PageIdBuilder.overview('market', 'market'),
  CHURN_OVERVIEW: PageIdBuilder.overview('market', 'churn'),
  CHURN_TREE_DEFAULT: PageIdBuilder.tree('market', 'churn', 'default'),
  MID_HIGH_END_OVERVIEW: PageIdBuilder.overview('market', 'mid_high_end'),
  MID_HIGH_END_TREE_DEFAULT: PageIdBuilder.tree('market', 'mid_high_end', 'default'),

  // 其他场景可以继续添加
}

// 场景配置
export interface ScenarioConfig {
  id: string
  name: string
  moduleId: string
  moduleName: string
  order: number
}

// 页面分组项（用于层级选择）
export interface PageGroupItem {
  pageId: string
  pageName: string
  pageType: PageType
  pagePath: string
}

// 页面分组（场景分组）
export interface PageGroup {
  scenarioId: string
  scenarioName: string
  moduleName: string
  pages: PageGroupItem[]
}

// 预定义的场景配置
export const ScenarioConfigs: ScenarioConfig[] = [
  {
    id: 'home',
    name: '首页',
    moduleId: 'portal',
    moduleName: '门户',
    order: 1,
  },
  {
    id: 'market-intel',
    name: '市场数智运营',
    moduleId: 'market',
    moduleName: '市场运营',
    order: 2,
  },
  {
    id: 'workspace',
    name: '我的工作台',
    moduleId: 'workspace',
    moduleName: '工作台',
    order: 3,
  },
]
