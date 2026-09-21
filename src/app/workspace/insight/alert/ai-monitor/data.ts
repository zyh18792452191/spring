'use client';

/**
 * AI指标监控预警 - 数据与类型定义
 * ------------------------------------------------------------------
 * 数据来源说明（原型阶段模拟，后续对接 AI 预警引擎/指标中台）：
 * - 业务场景树：集团统一场景树（全国/公众市场两级 + 二级场景域 + 三级业务场景）
 * - 预警粒度/范围：新疆移动运营体系（省份=新疆；地市=16 个地市分公司，
 *   区县/网格为其下辖行政区/网格，网格含 AI 预警演示网格）
 * - 指标字典：大数据平台指标字典按名称搜索
 * - 判定条件/准确率/误报：AI 预警模型输出（当前原型为静态示例）
 */

// ==================== 类型定义 ====================

/** 预警粒度 */
export type AlertGranularity = '省份' | '地市' | '区县' | '网格';

/** 列表展示形式：不汇总 / 按指标汇总 / 按区域汇总 */
export type ViewMode = 'none' | 'indicator' | 'region';

/** 是否误判：待确认 / 未误判 / 误判 */
export type MisjudgeStatus = 'pending' | 'no' | 'yes';

/** 是否执行指标预警：已执行未预警 / 已执行已预警 */
export type ExecStatus = 'noAlert' | 'alerted';

/** 列表规则行 */
export interface AiMonitorRule {
  id: string;
  /** 指标名称 */
  indicator: string;
  /** 业务场景三级路径（如 ['公众市场','流量运营','流量运营']） */
  scene: string[];
  /** 预警粒度 */
  granularity: AlertGranularity;
  /** 预警范围（如 阿克达拉网格） */
  scope: string;
  /** 当前判定条件（AI 生成） */
  condition: string;
  /** 准确率（%），尚未产生预警时为空 */
  accuracy: number | null;
  /** 误报次数 */
  falseCount: number;
  /** 总预警次数 */
  totalCount: number;
  /** 启用状态 */
  enabled: boolean;
}

/** 详情页预警情况（按指标账期） */
export interface AlertPeriodRecord {
  id: string;
  /** 指标账期（YYYY-MM） */
  period: string;
  /** 指标数值 */
  value: string;
  /** 更新时间 */
  updatedAt: string;
  /** 判定条件 */
  condition: string;
  /** 判定条件说明 */
  conditionDesc: string;
  /** 是否执行指标预警 */
  execStatus: ExecStatus;
  /** 预警说明 */
  alertDesc: string;
  /** 是否误判 */
  misjudge: MisjudgeStatus;
  /** 确认人（已确认记录展示） */
  confirmUser?: string;
  /** 确认时间（已确认记录展示） */
  confirmTime?: string;
}

// ==================== 业务场景树 ====================

export interface SceneNode {
  name: string;
  children?: SceneNode[];
}

/** 业务场景三级结构树（新增/筛选复用） */
export const BUSINESS_SCENE_TREE: SceneNode[] = [
  {
    name: '全国',
    children: [
      {
        name: '华南',
        children: [{ name: '5G升级场景' }, { name: '客户维系场景' }],
      },
      {
        name: '华东',
        children: [{ name: '宽带续约场景' }],
      },
      {
        name: '西南',
        children: [{ name: '携出预警场景' }],
      },
    ],
  },
  {
    name: '公众市场',
    children: [
      {
        name: '流量运营',
        children: [{ name: '流量运营' }],
      },
      {
        name: '存量运营',
        children: [{ name: '中高端运营' }, { name: '离网维系' }, { name: '家庭运营' }],
      },
      {
        name: '细分市场',
        children: [{ name: '国际运营' }],
      },
    ],
  },
];

/** 展开树得到全部叶子场景路径（如 ['公众市场','流量运营','流量运营']） */
export function collectLeafScenes(nodes: SceneNode[] = BUSINESS_SCENE_TREE, prefix: string[] = []): string[][] {
  const result: string[][] = [];
  for (const node of nodes) {
    const path = [...prefix, node.name];
    if (node.children && node.children.length > 0) {
      result.push(...collectLeafScenes(node.children, path));
    } else {
      result.push(path);
    }
  }
  return result;
}

/** 叶子场景路径 → 展示文案（/ 分隔） */
export function formatScenePath(path: string[]): string {
  return path.join('/');
}

// ==================== 预警粒度与范围联动 ====================

export const GRANULARITY_OPTIONS: AlertGranularity[] = ['省份', '地市', '区县', '网格'];

/**
 * 预警范围候选（与粒度联动）
 * 省份 → 新疆维吾尔自治区；地市 → 16 个地市分公司；
 * 区县/网格 → 新疆运营体系下辖行政区/网格（含演示网格）
 */
export const SCOPE_OPTIONS: Record<AlertGranularity, string[]> = {
  省份: ['新疆维吾尔自治区'],
  地市: [
    '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏',
    '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子',
  ],
  区县: [
    '天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区', '米东区',
    '乌鲁木齐县', '克拉玛依区', '独山子区', '伊宁市', '伊宁县', '霍城县', '昭苏县',
    '库尔勒市', '焉耆县', '阿克苏市', '温宿县', '喀什市', '莎车县', '和田市',
    '墨玉县', '昌吉市', '呼图壁县', '博乐市', '精河县',
  ],
  网格: [
    '阿克达拉网格', '夏塔网格', '天山路街道网格', '北京路街道网格', '新华南路街道网格',
    '解放南路街道网格', '友好南路街道网格', '长江路街道网格', '和田街街道网格', '扬子江路街道网格',
  ],
};

// ==================== 指标字典（名称搜索） ====================

export interface IndicatorOption {
  value: string;
  label: string;
}

/** 大数据平台指标字典（预警可配置对象，按名称搜索） */
export const INDICATOR_OPTIONS: IndicatorOption[] = [
  { value: 'IND-001', label: '当月拍照客户价值保有率' },
  { value: 'IND-002', label: '月通信服务收入环比' },
  { value: 'IND-003', label: '当月DOU' },
  { value: 'IND-004', label: '移动数据流量收入' },
  { value: 'IND-005', label: '5G登网用户数' },
  { value: 'IND-006', label: '5G套餐渗透率' },
  { value: 'IND-007', label: '全球通保有率' },
  { value: 'IND-008', label: '中高端客户离网率' },
  { value: 'IND-009', label: '宽带续约成功率' },
  { value: 'IND-010', label: '携转预警客户数' },
  { value: 'IND-011', label: '流量套餐使用饱和度' },
  { value: 'IND-012', label: '新增5G套餐客户数' },
  { value: 'IND-013', label: '家庭宽带净增用户' },
  { value: 'IND-014', label: 'ARPU值' },
  { value: 'IND-015', label: '4G流量占比' },
  { value: 'IND-016', label: '电子渠道办理量占比' },
  { value: 'IND-017', label: '月活跃用户数(MAU)' },
  { value: 'IND-018', label: '家庭融合渗透率' },
  { value: 'IND-019', label: '国际漫游收入' },
  { value: 'IND-020', label: '携出用户挽回率' },
];

export function findIndicatorLabel(value: string): string {
  return INDICATOR_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

// ==================== 列表规则（初始数据） ====================

export const INITIAL_RULES: AiMonitorRule[] = [
  {
    id: 'rule-001',
    indicator: '当月拍照客户价值保有率',
    scene: ['公众市场', '流量运营', '流量运营'],
    granularity: '网格',
    scope: '阿克达拉网格',
    condition: '环比降幅超过10%时预警',
    accuracy: 86.7,
    falseCount: 2,
    totalCount: 15,
    enabled: true,
  },
  {
    id: 'rule-002',
    indicator: '月通信服务收入环比',
    scene: ['公众市场', '存量运营', '中高端运营'],
    granularity: '地市',
    scope: '乌鲁木齐',
    condition: '环比降幅超过1.5%时预警',
    accuracy: 92.3,
    falseCount: 0,
    totalCount: 8,
    enabled: true,
  },
  {
    id: 'rule-003',
    indicator: '全球通保有率',
    scene: ['公众市场', '存量运营', '离网维系'],
    granularity: '地市',
    scope: '喀什',
    condition: '保有率低于92%时预警',
    accuracy: 88.9,
    falseCount: 1,
    totalCount: 9,
    enabled: true,
  },
  {
    id: 'rule-004',
    indicator: '宽带续约成功率',
    scene: ['全国', '华东', '宽带续约场景'],
    granularity: '区县',
    scope: '天山区',
    condition: '续约成功率低于65%时预警',
    accuracy: 91.2,
    falseCount: 0,
    totalCount: 5,
    enabled: true,
  },
  {
    id: 'rule-005',
    indicator: '5G登网用户数',
    scene: ['全国', '华南', '5G升级场景'],
    granularity: '省份',
    scope: '新疆维吾尔自治区',
    condition: '登网用户数环比降幅超过8%时预警',
    accuracy: 80.0,
    falseCount: 3,
    totalCount: 12,
    enabled: false,
  },
  {
    id: 'rule-006',
    indicator: '当月DOU',
    scene: ['公众市场', '流量运营', '流量运营'],
    granularity: '网格',
    scope: '夏塔网格',
    condition: 'DOU环比降幅超过15%时预警',
    accuracy: 84.5,
    falseCount: 1,
    totalCount: 6,
    enabled: true,
  },
];

// ==================== 详情页预警情况明细（按指标账期） ====================

/** 由规则生成明细时复用的基础账期序列（2026-08 至 2025-10，共 11 期，验证分页） */
export const PERIOD_RECORDS: AlertPeriodRecord[] = [
  {
    id: 'rec-2026-08',
    period: '2026-08',
    value: '3.1400000000%',
    updatedAt: '2026-08-04 12:12:01',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 基于近6期环比趋势建模，判定本期较上期下滑明显，建议核对数据口径后确认是否执行预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期未超阈值，未触发预警',
    misjudge: 'pending',
  },
  {
    id: 'rec-2026-07',
    period: '2026-07',
    value: '3.0528000000%',
    updatedAt: '2026-07-06 09:30:45',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 识别到本期环比降幅 11.2%，超过 10% 阈值，触发预警',
    execStatus: 'alerted',
    alertDesc: '已触发预警并推送至运营人员跟进',
    misjudge: 'no',
    confirmUser: '张明',
    confirmTime: '2026-07-06 15:20:00',
  },
  {
    id: 'rec-2026-06',
    period: '2026-06',
    value: '3.0900000000%',
    updatedAt: '2026-06-05 10:05:12',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比下滑，触发预警（后经核查为账期口径调整导致）',
    execStatus: 'alerted',
    alertDesc: '已触发预警；经核查属口径调整误报',
    misjudge: 'yes',
    confirmUser: '李芳',
    confirmTime: '2026-06-06 11:00:00',
  },
  {
    id: 'rec-2026-05',
    period: '2026-05',
    value: '3.2100000000%',
    updatedAt: '2026-05-06 08:50:33',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期数值平稳，未触发预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期平稳，未触发预警',
    misjudge: 'no',
    confirmUser: '张明',
    confirmTime: '2026-05-07 09:15:00',
  },
  {
    id: 'rec-2026-04',
    period: '2026-04',
    value: '3.1800000000%',
    updatedAt: '2026-04-08 14:22:18',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 6.3%，低于阈值，未触发预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期小幅回落，未触发预警',
    misjudge: 'no',
    confirmUser: '李芳',
    confirmTime: '2026-04-09 10:30:00',
  },
  {
    id: 'rec-2026-03',
    period: '2026-03',
    value: '3.2400000000%',
    updatedAt: '2026-03-05 16:40:27',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 12.8%，超过阈值，触发预警',
    execStatus: 'alerted',
    alertDesc: '已触发预警并推送至运营人员跟进',
    misjudge: 'no',
    confirmUser: '王强',
    confirmTime: '2026-03-06 09:00:00',
  },
  {
    id: 'rec-2026-02',
    period: '2026-02',
    value: '3.1100000000%',
    updatedAt: '2026-02-05 11:08:52',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 9.1%，低于阈值，未触发预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期回落，未触发预警',
    misjudge: 'no',
    confirmUser: '张明',
    confirmTime: '2026-02-06 14:00:00',
  },
  {
    id: 'rec-2026-01',
    period: '2026-01',
    value: '3.3000000000%',
    updatedAt: '2026-01-07 09:12:40',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 14.5%，超过阈值，触发预警',
    execStatus: 'alerted',
    alertDesc: '已触发预警并推送至运营人员跟进',
    misjudge: 'no',
    confirmUser: '王强',
    confirmTime: '2026-01-08 10:20:00',
  },
  {
    id: 'rec-2025-12',
    period: '2025-12',
    value: '3.3500000000%',
    updatedAt: '2025-12-05 15:33:21',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期数值回升，未触发预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期回升，未触发预警',
    misjudge: 'no',
    confirmUser: '李芳',
    confirmTime: '2025-12-06 09:30:00',
  },
  {
    id: 'rec-2025-11',
    period: '2025-11',
    value: '3.2200000000%',
    updatedAt: '2025-11-06 10:18:09',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 7.2%，低于阈值，未触发预警',
    execStatus: 'noAlert',
    alertDesc: '本期数值较上期回落，未触发预警',
    misjudge: 'no',
    confirmUser: '张明',
    confirmTime: '2025-11-07 11:00:00',
  },
  {
    id: 'rec-2025-10',
    period: '2025-10',
    value: '3.2800000000%',
    updatedAt: '2025-10-08 13:45:57',
    condition: '环比降幅超过10%时预警',
    conditionDesc: 'AI 判定本期环比降幅 11.6%，超过阈值，触发预警（后经核查为数据回刷）',
    execStatus: 'alerted',
    alertDesc: '已触发预警；经核查属数据回刷误报',
    misjudge: 'yes',
    confirmUser: '李芳',
    confirmTime: '2025-10-09 15:00:00',
  },
];


// ==================== 详情页明细（按规则参数化生成） ====================

/** 由指标名推导展示单位（原型简化：率/占比→%，客户数→万户，DOU→GB，收入→元） */
export function unitOfIndicator(indicator: string): string {
  if (/5G登网用户数|客户数|新增|净增|MAU/.test(indicator)) return '万户';
  if (/当月DOU/.test(indicator)) return 'GB';
  if (/收入|ARPU/.test(indicator)) return '元';
  return '%';
}

/** 解析判定条件中的阈值数字（如 "环比降幅超过10%时预警" → 10），无则用默认阈值 */
function thresholdOf(condition: string): number {
  const m = condition.match(/([\d.]+)%/);
  return m ? Number(m[1]) : 10;
}

/** 简易确定性伪随机（同规则+同账期结果稳定，便于演示数据可复现） */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 100000;
  }
  const x = Math.sin(h * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * 按预警规则生成 11 期（2026-08 至 2025-10）预警情况明细：
 * - 最新一期固定触发预警且待人工确认（演示"确认预警"流程）
 * - 倒数第二期未误判、倒数第三期误判（演示"查看"已确认记录）
 * - 其余账期按阈值命中与否生成"已执行已预警/已执行未预警"
 */
export function buildDetailRows(rule: Pick<AiMonitorRule, 'id' | 'indicator' | 'scope' | 'condition'>): AlertPeriodRecord[] {
  const threshold = thresholdOf(rule.condition);
  const rows: AlertPeriodRecord[] = [];
  const months = ['2026-08', '2026-07', '2026-06', '2026-05', '2026-04', '2026-03', '2026-02', '2026-01', '2025-12', '2025-11', '2025-10'];
  const times = ['09:30:45', '10:12:03', '08:50:33', '14:22:18', '16:40:27', '11:08:52', '09:12:40', '15:33:21', '10:18:09', '13:45:57'];
  const confirmers = ['张明', '李芳', '王强'];

  months.forEach((period, i) => {
    const base = 3.1 + seededRandom(`${rule.id}-${period}-base`) * 0.9; // 3.1 ~ 4.0
    const drop = 3 + seededRandom(`${rule.id}-${period}-drop`) * 14; // 3% ~ 17% 环比降幅
    const alerted = drop >= threshold;
    const updatedAt = `${period}-0${(i % 3) + 2} ${times[i % times.length]}`;

    let execStatus: ExecStatus;
    let misjudge: MisjudgeStatus;
    let confirmUser: string | undefined;
    let confirmTime: string | undefined;
    let alertDesc: string;

    if (i === 0) {
      // 最新一期：触发预警，待人工确认
      execStatus = 'alerted';
      misjudge = 'pending';
      alertDesc = `「${rule.indicator}」在「${rule.scope}」触发预警，待运营人员确认是否误判`;
    } else if (i === 1) {
      execStatus = 'alerted';
      misjudge = 'no';
      confirmUser = confirmers[0];
      confirmTime = `${period}-0${(i % 3) + 2} 15:20:00`;
      alertDesc = '已触发预警；经人工核查为真实波动，判定未误判';
    } else if (i === 2) {
      execStatus = 'alerted';
      misjudge = 'yes';
      confirmUser = confirmers[1];
      confirmTime = `${period}-0${(i % 3) + 2} 11:00:00`;
      alertDesc = '已触发预警；经核查属账期口径调整导致，判定为误判';
    } else {
      execStatus = alerted ? 'alerted' : 'noAlert';
      misjudge = alerted ? 'no' : 'no';
      if (alerted) {
        confirmUser = confirmers[i % confirmers.length];
        confirmTime = `${period}-0${(i % 3) + 2} 09:30:00`;
      }
      alertDesc = alerted
        ? '已触发预警并推送至运营人员跟进'
        : '本期数值未满足判定条件，未执行指标预警';
    }

    rows.push({
      id: `rec-${rule.id}-${period}`,
      period,
      value: base.toFixed(10),
      updatedAt,
      condition: rule.condition,
      conditionDesc: `AI 对「${rule.indicator}」在「${rule.scope}」范围内监测，本期环比降幅 ${drop.toFixed(1)}%（阈值 ${threshold}%），${
        alerted ? '满足判定条件触发预警' : '未满足判定条件，不触发预警'
      }`,
      execStatus,
      alertDesc,
      misjudge,
      confirmUser,
      confirmTime,
    });
  });

  return rows;
}
