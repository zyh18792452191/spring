/**
 * 页面文字配置文件
 * 所有页面显示的文字都在这里统一管理，方便快速修改
 * 修改后刷新页面即可生效
 */

export const textConfig = {
  // ==================== 页面标题和导航 ====================
  nav: {
    breadcrumbHome: '首页',
    breadcrumbCurrent: '工作台',
    pageTitle: '市场运营平台',
  },

  // ==================== 离网维系页面 ====================
  churnRetention: {
    // 标签页
    tabs: {
      overview: '概览',
      allChurn: '当月全量客户离网客户数',
      midHighChurn: '当月拍照中高端客户离网客户数',
      globalChurn: '当月拍照全球通客户离网客户数',
    },

    // 工具栏
    toolbar: {
      editMode: '编辑模式',
      editing: '编辑中',
      indicatorTreeTemplate: '指标树模板',
      date: '2025-10',
    },

    // 工具按钮
    tools: {
      warningList: '预警列表',
      expandAll: '全部展开',
      collapseAll: '全部折叠',
      expandWarningOnly: '仅展开预警节点',
      indicatorScheduling: '指标调度',
      strategyScheduling: '策略调度',
    },

    // 分析面板
    analysisPanel: {
      title: '指标分析',
      regionDimension: '区域维度',
      timeDimension: '时间维度（近6个月）',
      topThree: '前三',
      bottomThree: '后三',
      analysisReasons: '分析原因',
      currentValue: '当前值：',
    },

    // 整体指标
    overallMetrics: {
      sectionTitle: '整体指标',
      metrics: [
        {
          name: '中高端客户规模(月)',
          chartTitle: '客户规模趋势（2-7月）',
        },
        {
          name: '拍照中高端综合保有率',
          chartTitle: '保有率趋势（2-7月）',
        },
        {
          name: '拍照中高端价值保有率',
          chartTitle: '收入（亿元）+价值保有率（%）',
        },
        {
          name: '拍照中高端规模保有率',
          chartTitle: '客户规模（亿）+规模保有率（%）',
        },
      ],
    },

    // 价值提升
    valueEnhancement: {
      leftColumn: '正向提值',
      rightColumn: '逆向控损',
      items: {
        levelUp: '升档增收',
        packageUpgrade: '主套升档',
        downgrade: '降档减收',
        downgradeToBottom: '一降到底',
      },
    },

    // 规模发展
    scaleDevelopment: {
      leftColumn: '新入网中高端',
      rightColumn: '净增中高端',
    },

    // 指标树默认名称
    indicatorTreeDefaultName: '当月拍照中高端客户离网客户数',

    // 默认分析数据
    defaultAnalysis: {
      indicatorName: '拍照中高端客户价值保有率',
    },
  },
};

export default textConfig;
