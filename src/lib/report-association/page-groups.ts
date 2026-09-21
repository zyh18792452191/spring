import { PageGroup, PageGroupItem, PageType, ScenarioConfigs, PageIdBuilder, ScenarioConfig } from './types';

// 模拟的页面数据 - 市场运营平台层级结构
export const MOCK_PAGES: PageGroupItem[] = [
  // === 场景：首页 ===
  {
    pageId: 'home',
    pageName: '首页',
    pageType: PageType.DASHBOARD,
    pagePath: '/',
  },

  // === 场景：市场数智运营 - 运营总览 ===
  {
    pageId: 'operation-overview',
    pageName: '运营总览',
    pageType: PageType.OVERVIEW,
    pagePath: '/operation/overview',
  },
  {
    pageId: 'market-operation-overview',
    pageName: '市场运营总览',
    pageType: PageType.OVERVIEW,
    pagePath: '/operation/market-overview',
  },

  // === 场景：市场数智运营 - 客户运营 ===
  {
    pageId: 'customer-operation',
    pageName: '客户运营',
    pageType: PageType.OVERVIEW,
    pagePath: '/operation/customer',
  },

  // 客户运营 - 存量运营 - 中高端客户运营
  {
    pageId: 'high-end-overview',
    pageName: '中高端客户运营概览',
    pageType: PageType.OVERVIEW,
    pagePath: '/operation/customer/high-end/overview',
  },
  {
    pageId: 'overall-metrics',
    pageName: '整体指标',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/overall-metrics',
  },
  {
    pageId: 'value-enhancement',
    pageName: '价值提升',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/value-enhancement',
  },
  {
    pageId: 'positive-value-increase',
    pageName: '正向提值',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/positive-value',
  },
  {
    pageId: 'reverse-loss-control',
    pageName: '逆向控损',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/reverse-loss',
  },
  {
    pageId: 'scale-development',
    pageName: '规模发展',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/scale-development',
  },
  {
    pageId: 'convergence-strengthening',
    pageName: '融合加固',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/convergence-strengthening',
  },
  {
    pageId: 'customer-group-management',
    pageName: '客群看管',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/customer-group',
  },
  {
    pageId: 'high-end-scale-retention',
    pageName: '拍照中高端客户规模保有率',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/scale-retention',
  },
  {
    pageId: 'high-end-value-retention',
    pageName: '拍照中高端客户价值保有率',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/value-retention',
  },
  {
    pageId: 'high-end-decline-ratio',
    pageName: '中高端一降到底占比',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/decline-ratio',
  },
  {
    pageId: 'strategy-matching-highend',
    pageName: '策略匹配',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/strategy-matching',
  },
  {
    pageId: 'dispatch-highend',
    pageName: '调度派发',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/high-end/dispatch',
  },

  // 客户运营 - 存量运营 - 离网维系
  {
    pageId: 'monthly-all-churn',
    pageName: '当月全量客户离网客户数',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/churn/monthly-all',
  },
  {
    pageId: 'monthly-high-end-churn',
    pageName: '当月拍照中高端客户离网客户数',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/churn/monthly-high-end',
  },
  {
    pageId: 'monthly-global-churn',
    pageName: '当月拍照全球通客户离网客户数',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/churn/monthly-global',
  },
  {
    pageId: 'strategy-matching-churn',
    pageName: '策略匹配',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/churn/strategy-matching',
  },
  {
    pageId: 'dispatch-churn',
    pageName: '调度派发',
    pageType: PageType.DASHBOARD,
    pagePath: '/operation/customer/churn/dispatch',
  },

  // === 场景：我的工作台 ===
  {
    pageId: 'workspace-home',
    pageName: '工作台首页',
    pageType: PageType.DASHBOARD,
    pagePath: '/workspace',
  },
];

// 页面分组工具类
export class PageGroupBuilder {
  /**
   * 将页面列表按照场景分组
   * @param pages 页面列表
   * @param scenarios 场景配置列表
   * @returns 按场景分组的页面列表
   */
  static buildByScenario(
    pages: PageGroupItem[],
    scenarios: ScenarioConfig[] = ScenarioConfigs
  ): PageGroup[] {
    const groups: PageGroup[] = [];

    // 定义页面到场景的映射关系
    const pageToScenarioMap: Record<string, string> = {
      // 首页场景
      'home': 'home',

      // 市场数智运营场景
      'operation-overview': 'market-intel',
      'market-operation-overview': 'market-intel',
      'customer-operation': 'market-intel',
      'high-end-overview': 'market-intel',
      'overall-metrics': 'market-intel',
      'value-enhancement': 'market-intel',
      'positive-value-increase': 'market-intel',
      'reverse-loss-control': 'market-intel',
      'scale-development': 'market-intel',
      'convergence-strengthening': 'market-intel',
      'customer-group-management': 'market-intel',
      'high-end-scale-retention': 'market-intel',
      'high-end-value-retention': 'market-intel',
      'high-end-decline-ratio': 'market-intel',
      'strategy-matching-highend': 'market-intel',
      'dispatch-highend': 'market-intel',
      'monthly-all-churn': 'market-intel',
      'monthly-high-end-churn': 'market-intel',
      'monthly-global-churn': 'market-intel',
      'strategy-matching-churn': 'market-intel',
      'dispatch-churn': 'market-intel',

      // 我的工作台场景
      'workspace-home': 'workspace',
    };

    // 按场景顺序创建分组
    scenarios.forEach(scenario => {
      // 过滤出属于该场景的页面
      const scenarioPages = pages.filter(page => {
        return pageToScenarioMap[page.pageId] === scenario.id;
      });

      if (scenarioPages.length > 0) {
        groups.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          moduleName: scenario.moduleName,
          pages: scenarioPages,
        });
      }
    });

    return groups;
  }

  /**
   * 根据场景ID获取页面列表
   * @param scenarioId 场景ID
   * @param pages 页面列表
   * @returns 该场景的页面列表
   */
  static getPagesByScenario(scenarioId: string, pages: PageGroupItem[]): PageGroupItem[] {
    const pageToScenarioMap: Record<string, string> = {
      // 首页场景
      'home': 'home',

      // 市场数智运营场景
      'operation-overview': 'market-intel',
      'market-operation-overview': 'market-intel',
      'customer-operation': 'market-intel',
      'high-end-overview': 'market-intel',
      'overall-metrics': 'market-intel',
      'value-enhancement': 'market-intel',
      'positive-value-increase': 'market-intel',
      'reverse-loss-control': 'market-intel',
      'scale-development': 'market-intel',
      'convergence-strengthening': 'market-intel',
      'customer-group-management': 'market-intel',
      'high-end-scale-retention': 'market-intel',
      'high-end-value-retention': 'market-intel',
      'high-end-decline-ratio': 'market-intel',
      'strategy-matching-highend': 'market-intel',
      'dispatch-highend': 'market-intel',
      'monthly-all-churn': 'market-intel',
      'monthly-high-end-churn': 'market-intel',
      'monthly-global-churn': 'market-intel',
      'strategy-matching-churn': 'market-intel',
      'dispatch-churn': 'market-intel',

      // 我的工作台场景
      'workspace-home': 'workspace',
    };

    return pages.filter(page => {
      return pageToScenarioMap[page.pageId] === scenarioId;
    });
  }

  /**
   * 根据业务场景关键词自动关联页面
   * @param scenarioId 业务场景ID
   * @param pages 所有页面
   * @returns 自动关联的页面ID列表
   */
  static getAutoAssociatedPages(scenarioId: string, pages: PageGroupItem[]): string[] {
    // 获取该场景下的所有页面
    const scenarioPages = this.getPagesByScenario(scenarioId, pages);

    // 优先关联概览页和仪表板
    return scenarioPages
      .filter(page => page.pageType === PageType.OVERVIEW || page.pageType === PageType.DASHBOARD)
      .map(page => page.pageId);
  }

  /**
   * 根据业务场景ID获取场景配置
   * @param scenarioId 场景ID
   * @returns 场景配置
   */
  static getScenarioConfig(scenarioId: string): ScenarioConfig | undefined {
    return ScenarioConfigs.find(scenario => scenario.id === scenarioId);
  }
}

// 导出默认的页面分组
export const DefaultPageGroups = PageGroupBuilder.buildByScenario(MOCK_PAGES);
