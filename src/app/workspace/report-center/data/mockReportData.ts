// ==================== 模拟报表数据 ====================
import { ReportConfig, UserFavorite } from './types';
import { REPORT_TEMPLATES } from './templateData';

// ---------- 模拟报表列表 ----------
export const MOCK_REPORTS: ReportConfig[] = [
  {
    reportId: 'RPT001',
    reportName: '携转预警执行分析日报',
    reportDesc: '号码携转预警场景的全渠道执行分析，覆盖在线执行、网格经理执行、地市集运执行',
    categoryId: 'CAT01',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'day',
    genPeriodType: 'repeat',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: REPORT_TEMPLATES[0].columnConfig,
    filterConfig: REPORT_TEMPLATES[0].filterConfig,
    templateId: 'T01',
    status: 'published',
    createdBy: '张明',
    createdAt: '2025-01-15',
    updatedAt: '2025-06-10',
  },
  {
    reportId: 'RPT002',
    reportName: '全球通离网预警执行分析月报',
    reportDesc: '全球通品牌客户离网预警场景的执行分析，覆盖在线执行、10088外呼、网格经理三大渠道',
    categoryId: 'CAT03',
    dataStartDate: '2025-01-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'month',
    genPeriodType: 'repeat',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: REPORT_TEMPLATES[2].columnConfig,
    filterConfig: REPORT_TEMPLATES[2].filterConfig,
    templateId: 'T03',
    status: 'published',
    createdBy: '李芳',
    createdAt: '2025-02-01',
    updatedAt: '2025-06-01',
  },
  {
    reportId: 'RPT003',
    reportName: '投诉工单执行分析日报',
    reportDesc: '投诉工单场景的专项执行分析，按工单类型、投诉类型、执行结果细分维度展开',
    categoryId: 'CAT04',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'day',
    genPeriodType: 'repeat',
    regionMode: 'flat',
    regionDimensions: ['city', 'district', 'grid'],
    columnConfig: REPORT_TEMPLATES[3].columnConfig,
    filterConfig: REPORT_TEMPLATES[3].filterConfig,
    templateId: 'T04',
    status: 'published',
    createdBy: '王刚',
    createdAt: '2025-03-10',
    updatedAt: '2025-06-12',
  },
  {
    reportId: 'RPT004',
    reportName: '宽带预警执行分析周报',
    reportDesc: '宽带业务预警场景的执行分析，以装维人员执行为核心',
    categoryId: 'CAT02',
    dataStartDate: '2025-05-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'week',
    genPeriodType: 'repeat',
    regionMode: 'flat',
    regionDimensions: ['city', 'district', 'grid'],
    columnConfig: REPORT_TEMPLATES[1].columnConfig,
    filterConfig: REPORT_TEMPLATES[1].filterConfig,
    templateId: 'T02',
    status: 'published',
    createdBy: '赵敏',
    createdAt: '2025-04-01',
    updatedAt: '2025-06-08',
  },
  {
    reportId: 'RPT005',
    reportName: '商机预警执行分析日报',
    reportDesc: '商机预警场景的执行分析，关注商机转化与执行效率',
    categoryId: 'CAT05',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'day',
    genPeriodType: 'repeat',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: REPORT_TEMPLATES[4].columnConfig,
    filterConfig: REPORT_TEMPLATES[4].filterConfig,
    templateId: 'T05',
    status: 'published',
    createdBy: '陈亮',
    createdAt: '2025-05-01',
    updatedAt: '2025-06-11',
  },
  {
    reportId: 'RPT006',
    reportName: '消费异动预警执行分析',
    reportDesc: '消费异动预警场景的执行分析，关注ARPU异动客户维系效果',
    categoryId: 'CAT06',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'day',
    genPeriodType: 'once',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district'],
    columnConfig: REPORT_TEMPLATES[5].columnConfig,
    filterConfig: REPORT_TEMPLATES[5].filterConfig,
    templateId: 'T06',
    status: 'published',
    createdBy: '刘静',
    createdAt: '2025-05-20',
    updatedAt: '2025-06-05',
  },
  {
    reportId: 'RPT007',
    reportName: '套餐到期预警执行分析',
    reportDesc: '套餐到期预警场景的执行分析，关注续约转化率',
    categoryId: 'CAT06',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'month',
    genPeriodType: 'repeat',
    regionMode: 'flat',
    regionDimensions: ['city', 'district'],
    columnConfig: REPORT_TEMPLATES[7].columnConfig,
    filterConfig: REPORT_TEMPLATES[7].filterConfig,
    templateId: 'T08',
    status: 'draft',
    createdBy: '周磊',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-12',
  },
  {
    reportId: 'RPT008',
    reportName: '综合预警执行分析月报',
    reportDesc: '全场景汇总的综合预警执行分析，覆盖所有预警类型和执行渠道',
    categoryId: 'CAT99',
    dataStartDate: '2025-01-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'month',
    genPeriodType: 'repeat',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district'],
    columnConfig: REPORT_TEMPLATES[8].columnConfig,
    filterConfig: REPORT_TEMPLATES[8].filterConfig,
    templateId: 'T09',
    status: 'published',
    createdBy: '张明',
    createdAt: '2025-02-15',
    updatedAt: '2025-06-01',
  },
  {
    reportId: 'RPT009',
    reportName: '流量异动预警执行分析',
    reportDesc: '流量异动预警场景的执行分析，关注流量突降/突增客户维系效果',
    categoryId: 'CAT06',
    dataStartDate: '2025-06-01',
    dataEndDate: '2025-06-30',
    statPeriod: 'day',
    genPeriodType: 'once',
    regionMode: 'flat',
    regionDimensions: ['city', 'district'],
    columnConfig: REPORT_TEMPLATES[6].columnConfig,
    filterConfig: REPORT_TEMPLATES[6].filterConfig,
    templateId: 'T07',
    status: 'disabled',
    createdBy: '吴婷',
    createdAt: '2025-04-10',
    updatedAt: '2025-05-30',
  },
];

// ---------- 模拟收藏数据 ----------
export const MOCK_FAVORITES: UserFavorite[] = [
  { userId: 'current', reportId: 'RPT001', createdAt: '2025-06-01' },
  { userId: 'current', reportId: 'RPT003', createdAt: '2025-06-05' },
  { userId: 'current', reportId: 'RPT005', createdAt: '2025-06-10' },
];

// ---------- 模拟访问时间 ----------
export const MOCK_ACCESS_TIMES: Record<string, string> = {
  RPT001: '2025-06-12 14:30',
  RPT002: '2025-06-11 09:15',
  RPT003: '2025-06-12 16:45',
  RPT004: '2025-06-10 11:20',
  RPT005: '2025-06-12 10:00',
  RPT006: '2025-06-09 15:30',
  RPT007: '-',
  RPT008: '2025-06-08 08:45',
  RPT009: '2025-05-30 17:00',
};

// ---------- 报表状态配置 ----------
export const REPORT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:     { label: '草稿',   color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  published: { label: '已发布', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  disabled:  { label: '已停用', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

// ---------- 统计周期配置 ----------
export const STAT_PERIOD_MAP: Record<string, string> = {
  day: '日',
  week: '周',
  month: '月',
};

/** 获取报表配置 */
export function getReportById(id: string): ReportConfig | undefined {
  return MOCK_REPORTS.find(r => r.reportId === id);
}

/** 判断是否收藏 */
export function isFavorite(reportId: string): boolean {
  return MOCK_FAVORITES.some(f => f.userId === 'current' && f.reportId === reportId);
}

/** 统计报表数据列数（不含区域列和操作列，用于显示） */
export function countLeafColumns(nodes: { children?: unknown[]; type?: string }[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'region' || node.type === 'action') continue;
    if (node.children && (node.children as unknown[]).length > 0) {
      count += countLeafColumns(node.children as { children?: unknown[]; type?: string }[]);
    } else {
      count++;
    }
  }
  return count;
}

/** 将报表另存为模板（模拟，返回新模板对象） */
export function saveReportAsTemplate(params: {
  reportId: string;
  templateName: string;
  templateDesc: string;
  categoryId: string;
  includeRegionConfig: boolean;
}): import('./types').ReportTemplate {
  const report = getReportById(params.reportId);
  if (!report) throw new Error('报表不存在');

  const newId = `U${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString().slice(0, 10);

  return {
    templateId: newId,
    templateName: params.templateName,
    templateDesc: params.templateDesc,
    categoryId: params.categoryId,
    source: 'user',
    sourceReportId: params.reportId,
    regionMode: params.includeRegionConfig ? report.regionMode : 'drill',
    regionDimensions: params.includeRegionConfig ? report.regionDimensions : ['province', 'city', 'district', 'grid'],
    columnConfig: JSON.parse(JSON.stringify(report.columnConfig)),
    usageCount: 0,
    createdBy: '当前用户',
    createdAt: now,
    filterConfig: JSON.parse(JSON.stringify(report.filterConfig || [])),
    updatedAt: now,
  };
}
