// 评估中心概览页面的模拟数据

export interface RegionEfficiency {
  name: string;
  code: string;
  score: number;
  // 四维健康度
  overallHealth: number; // 运营健康度（总体）
  quantity: number; // 量（规模）
  quality: number; // 质（质量）
  structure: number; // 构（结构）
  effect: number; // 效（效果）
  // 保留原有字段以兼容
  taskCompletionRate: number;
  conversionRate: number;
  responseScore: number;
  qualityScore: number;
  level: 'excellent' | 'good' | 'average' | 'improvement';
}

export interface Alert {
  id: string;
  type: 'metric' | 'efficiency' | 'quality' | 'load' | 'strategy' | 'workorder' | 'customer' | 'resource';
  severity: 'high' | 'medium' | 'low';
  title: string; // 预警标题
  description: string; // 预警内容
  region: string; // 问题区域（支持多个省，用逗号分隔）
  dimension: string; // 预警所属维度
  value: number;
  threshold: number;
  unit?: string; // 单位
  createTime: string;
  status: 'pending' | 'processing' | 'resolved';
}

export interface TopRank {
  rank: number;
  name: string;
  value: number;
  change: number;
  reason: string;
}

export interface MetricTrend {
  date: string;
  conversionRate: number;
  avgProcessTime: number;
  customerValueRetention: number;
  strategyResponseRate: number;
}

// 运营概览数据接口
export interface OperationOverviewMetric {
  name: string;
  value: number | string;
  unit?: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  trendData: number[]; // 趋势图数据（最近6个月）
}

export interface OperationOverview {
  workOrder: {
    title: string;
    metrics: OperationOverviewMetric[];
  };
  strategy: {
    title: string;
    metrics: OperationOverviewMetric[];
  };
}

// 运营概览数据
export const operationOverview: OperationOverview = {
  workOrder: {
    title: '工单',
    metrics: [
      {
        name: '工单派单量',
        value: 12856,
        unit: '单',
        change: 8.5,
        trend: 'up',
        trendData: [11200, 11500, 11800, 12100, 12300, 12856] },
      {
        name: '工单完成率',
        value: 96.8,
        unit: '%',
        change: 2.3,
        trend: 'up',
        trendData: [92.5, 93.8, 94.2, 95.0, 95.5, 96.8] },
      {
        name: '工单超时率',
        value: 3.2,
        unit: '%',
        change: -0.8,
        trend: 'down',
        trendData: [4.5, 4.2, 4.0, 3.8, 3.5, 3.2] },
    ] },
  strategy: {
    title: '策略',
    metrics: [
      {
        name: '策略发布数',
        value: 245,
        unit: '个',
        change: 12.5,
        trend: 'up',
        trendData: [180, 195, 210, 220, 230, 245] },
      {
        name: 'AI策略占比',
        value: 78.6,
        unit: '%',
        change: 5.2,
        trend: 'up',
        trendData: [68.0, 70.5, 72.0, 74.5, 76.0, 78.6] },
      {
        name: '策略执行率',
        value: 89.5,
        unit: '%',
        change: 3.8,
        trend: 'up',
        trendData: [82.0, 84.5, 85.8, 87.0, 88.2, 89.5] },
    ] } };

// 新疆16地市分公司效能数据
export const regionEfficiency: RegionEfficiency[] = [
  {
    name: '乌鲁木齐',
    code: 'WLMQ',
    score: 94.2,
    overallHealth: 94.2,
    quantity: 93.5,
    quality: 92.8,
    structure: 95.0,
    effect: 94.5,
    taskCompletionRate: 98.2,
    conversionRate: 96.2,
    responseScore: 97.2,
    qualityScore: 95.2,
    level: 'excellent' },
  {
    name: '克拉玛依',
    code: 'KLYM',
    score: 93.8,
    overallHealth: 93.8,
    quantity: 93.1,
    quality: 92.4,
    structure: 94.6,
    effect: 94.1,
    taskCompletionRate: 97.8,
    conversionRate: 95.8,
    responseScore: 96.8,
    qualityScore: 94.8,
    level: 'excellent' },
  {
    name: '吐鲁番',
    code: 'TLF',
    score: 88.5,
    overallHealth: 88.5,
    quantity: 87.8,
    quality: 87.1,
    structure: 89.3,
    effect: 88.8,
    taskCompletionRate: 92.5,
    conversionRate: 90.5,
    responseScore: 91.5,
    qualityScore: 89.5,
    level: 'good' },
  {
    name: '哈密',
    code: 'HM',
    score: 87.2,
    overallHealth: 87.2,
    quantity: 86.5,
    quality: 85.8,
    structure: 88.0,
    effect: 87.5,
    taskCompletionRate: 91.2,
    conversionRate: 89.2,
    responseScore: 90.2,
    qualityScore: 88.2,
    level: 'good' },
  {
    name: '昌吉',
    code: 'CJ',
    score: 89.6,
    overallHealth: 89.6,
    quantity: 88.9,
    quality: 88.2,
    structure: 90.4,
    effect: 89.9,
    taskCompletionRate: 93.6,
    conversionRate: 91.6,
    responseScore: 92.6,
    qualityScore: 90.6,
    level: 'good' },
  {
    name: '博州',
    code: 'BETL',
    score: 85.3,
    overallHealth: 85.3,
    quantity: 84.6,
    quality: 83.9,
    structure: 86.1,
    effect: 85.6,
    taskCompletionRate: 89.3,
    conversionRate: 87.3,
    responseScore: 88.3,
    qualityScore: 86.3,
    level: 'good' },
  {
    name: '巴州',
    code: 'BYGL',
    score: 86.8,
    overallHealth: 86.8,
    quantity: 86.1,
    quality: 85.4,
    structure: 87.6,
    effect: 87.1,
    taskCompletionRate: 90.8,
    conversionRate: 88.8,
    responseScore: 89.8,
    qualityScore: 87.8,
    level: 'good' },
  {
    name: '阿克苏',
    code: 'AKS',
    score: 84.5,
    overallHealth: 84.5,
    quantity: 83.8,
    quality: 83.1,
    structure: 85.3,
    effect: 84.8,
    taskCompletionRate: 88.5,
    conversionRate: 86.5,
    responseScore: 87.5,
    qualityScore: 85.5,
    level: 'average' },
  {
    name: '克州',
    code: 'KZ',
    score: 82.3,
    overallHealth: 82.3,
    quantity: 81.6,
    quality: 80.9,
    structure: 83.1,
    effect: 82.6,
    taskCompletionRate: 86.3,
    conversionRate: 84.3,
    responseScore: 85.3,
    qualityScore: 83.3,
    level: 'average' },
  {
    name: '喀什',
    code: 'KS',
    score: 83.6,
    overallHealth: 83.6,
    quantity: 82.9,
    quality: 82.2,
    structure: 84.4,
    effect: 83.9,
    taskCompletionRate: 87.6,
    conversionRate: 85.6,
    responseScore: 86.6,
    qualityScore: 84.6,
    level: 'average' },
  {
    name: '和田',
    code: 'HT',
    score: 81.2,
    overallHealth: 81.2,
    quantity: 80.5,
    quality: 79.8,
    structure: 82.0,
    effect: 81.5,
    taskCompletionRate: 85.2,
    conversionRate: 83.2,
    responseScore: 84.2,
    qualityScore: 82.2,
    level: 'average' },
  {
    name: '伊犁',
    code: 'YL',
    score: 88.9,
    overallHealth: 88.9,
    quantity: 88.2,
    quality: 87.5,
    structure: 89.7,
    effect: 89.2,
    taskCompletionRate: 92.9,
    conversionRate: 90.9,
    responseScore: 91.9,
    qualityScore: 89.9,
    level: 'good' },
  {
    name: '塔城',
    code: 'TC',
    score: 86.1,
    overallHealth: 86.1,
    quantity: 85.4,
    quality: 84.7,
    structure: 86.9,
    effect: 86.4,
    taskCompletionRate: 90.1,
    conversionRate: 88.1,
    responseScore: 89.1,
    qualityScore: 87.1,
    level: 'good' },
  {
    name: '阿勒泰',
    code: 'ALT',
    score: 84.7,
    overallHealth: 84.7,
    quantity: 84.0,
    quality: 83.3,
    structure: 85.5,
    effect: 85.0,
    taskCompletionRate: 88.7,
    conversionRate: 86.7,
    responseScore: 87.7,
    qualityScore: 85.7,
    level: 'average' },
  {
    name: '石河子',
    code: 'SHZ',
    score: 90.5,
    overallHealth: 90.5,
    quantity: 89.8,
    quality: 89.1,
    structure: 91.3,
    effect: 90.8,
    taskCompletionRate: 94.5,
    conversionRate: 92.5,
    responseScore: 93.5,
    qualityScore: 91.5,
    level: 'excellent' },
];

export const topChannelResponse: TopRank[] = [
  { rank: 1, name: 'APP渠道', value: 95.2, change: 4.5, reason: '系统稳定性提升' },
  { rank: 2, name: '微信渠道', value: 92.8, change: 3.2, reason: '优化响应机制' },
  { rank: 3, name: '电话渠道', value: 88.5, change: 2.1, reason: '人员配置优化' },
  { rank: 4, name: '线下网点', value: 82.3, change: 1.5, reason: '服务流程改进' },
  { rank: 5, name: '短信渠道', value: 78.6, change: 0.8, reason: '自动化程度提高' },
];

export const topGridEfficiency: TopRank[] = [
  { rank: 1, name: '乌鲁木齐-天山区', value: 94.5, change: 6.2, reason: '网格化管理优化' },
  { rank: 2, name: '克拉玛依-克拉玛依区', value: 93.8, change: 4.8, reason: '团队能力提升' },
  { rank: 3, name: '深圳市-南山区', value: 92.2, change: 3.5, reason: '数字化转型推进' },
  { rank: 4, name: '广州市-天河区', value: 91.7, change: 2.9, reason: '绩效考核改进' },
  { rank: 5, name: '杭州市-西湖区', value: 90.3, change: 2.1, reason: '协同效率提升' },
];

// 待改进榜数据
export const bottomStrategyConversion: TopRank[] = [
  { rank: 31, name: '昌吉自治区', value: 53.2, change: -5.8, reason: '策略执行不到位' },
  { rank: 30, name: '吐鲁番', value: 55.6, change: -7.5, reason: '团队培训缺乏' },
];

export const bottomTimeoutRate: TopRank[] = [
  { rank: 31, name: '昌吉自治区', value: 18.5, change: 3.2, reason: '处理效率低' },
  { rank: 30, name: '吐鲁番', value: 16.2, change: 2.8, reason: '资源紧张' },
];

export const bottomCustomerSatisfaction: TopRank[] = [
  { rank: 31, name: '昌吉自治区', value: 49.5, change: -3.5, reason: '服务质量待提升' },
  { rank: 30, name: '吐鲁番', value: 52.8, change: -2.1, reason: '问题响应慢' },
];

// 关键指标趋势数据（近30天）
export const metricTrends: MetricTrend[] = [
  { date: '01-11', conversionRate: 78.5, avgProcessTime: 4.2, customerValueRetention: 88.3, strategyResponseRate: 85.6 },
  { date: '01-12', conversionRate: 79.2, avgProcessTime: 4.0, customerValueRetention: 88.7, strategyResponseRate: 86.1 },
  { date: '01-13', conversionRate: 80.1, avgProcessTime: 3.8, customerValueRetention: 89.2, strategyResponseRate: 86.8 },
  { date: '01-14', conversionRate: 79.8, avgProcessTime: 3.9, customerValueRetention: 89.0, strategyResponseRate: 86.5 },
  { date: '01-15', conversionRate: 81.2, avgProcessTime: 3.7, customerValueRetention: 89.5, strategyResponseRate: 87.2 },
  { date: '01-16', conversionRate: 80.9, avgProcessTime: 3.8, customerValueRetention: 89.3, strategyResponseRate: 86.9 },
  { date: '01-17', conversionRate: 82.3, avgProcessTime: 3.6, customerValueRetention: 89.8, strategyResponseRate: 87.6 },
  { date: '01-18', conversionRate: 81.8, avgProcessTime: 3.7, customerValueRetention: 89.6, strategyResponseRate: 87.3 },
  { date: '01-19', conversionRate: 83.5, avgProcessTime: 3.5, customerValueRetention: 90.2, strategyResponseRate: 88.1 },
  { date: '01-20', conversionRate: 82.9, avgProcessTime: 3.6, customerValueRetention: 90.0, strategyResponseRate: 87.8 },
  { date: '01-21', conversionRate: 84.2, avgProcessTime: 3.4, customerValueRetention: 90.5, strategyResponseRate: 88.5 },
  { date: '01-22', conversionRate: 83.8, avgProcessTime: 3.5, customerValueRetention: 90.3, strategyResponseRate: 88.2 },
  { date: '01-23', conversionRate: 85.1, avgProcessTime: 3.3, customerValueRetention: 90.8, strategyResponseRate: 88.9 },
  { date: '01-24', conversionRate: 84.7, avgProcessTime: 3.4, customerValueRetention: 90.6, strategyResponseRate: 88.6 },
  { date: '01-25', conversionRate: 85.8, avgProcessTime: 3.2, customerValueRetention: 91.1, strategyResponseRate: 89.2 },
  { date: '01-26', conversionRate: 85.3, avgProcessTime: 3.3, customerValueRetention: 90.9, strategyResponseRate: 88.9 },
  { date: '01-27', conversionRate: 86.2, avgProcessTime: 3.1, customerValueRetention: 91.4, strategyResponseRate: 89.5 },
  { date: '01-28', conversionRate: 85.9, avgProcessTime: 3.2, customerValueRetention: 91.2, strategyResponseRate: 89.2 },
  { date: '01-29', conversionRate: 86.8, avgProcessTime: 3.0, customerValueRetention: 91.7, strategyResponseRate: 89.8 },
  { date: '01-30', conversionRate: 86.5, avgProcessTime: 3.1, customerValueRetention: 91.5, strategyResponseRate: 89.5 },
  { date: '01-31', conversionRate: 87.3, avgProcessTime: 2.9, customerValueRetention: 91.9, strategyResponseRate: 90.1 },
  { date: '02-01', conversionRate: 87.0, avgProcessTime: 3.0, customerValueRetention: 91.7, strategyResponseRate: 89.8 },
  { date: '02-02', conversionRate: 88.2, avgProcessTime: 2.8, customerValueRetention: 92.2, strategyResponseRate: 90.5 },
  { date: '02-03', conversionRate: 87.8, avgProcessTime: 2.9, customerValueRetention: 92.0, strategyResponseRate: 90.2 },
  { date: '02-04', conversionRate: 88.6, avgProcessTime: 2.7, customerValueRetention: 92.4, strategyResponseRate: 90.8 },
  { date: '02-05', conversionRate: 88.3, avgProcessTime: 2.8, customerValueRetention: 92.2, strategyResponseRate: 90.5 },
  { date: '02-06', conversionRate: 89.2, avgProcessTime: 2.6, customerValueRetention: 92.7, strategyResponseRate: 91.2 },
  { date: '02-07', conversionRate: 88.9, avgProcessTime: 2.7, customerValueRetention: 92.5, strategyResponseRate: 90.9 },
  { date: '02-08', conversionRate: 89.8, avgProcessTime: 2.5, customerValueRetention: 92.9, strategyResponseRate: 91.6 },
  { date: '02-09', conversionRate: 89.5, avgProcessTime: 2.6, customerValueRetention: 92.7, strategyResponseRate: 91.3 },
];

// ==================== 新增：运营健康度相关数据 ====================

// 运营健康度核心指标卡片
export interface OperationHealthMetric {
  name: string;
  value: number | string;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export const operationHealthMetrics: OperationHealthMetric[] = [
  {
    name: '策略平均触达率',
    value: 92.3,
    unit: '%',
    change: 2.1,
    trend: 'up' },
  {
    name: '策略平均成功率',
    value: 78.6,
    unit: '%',
    change: 4.5,
    trend: 'up' },
  {
    name: '工单闭环率',
    value: 95.2,
    unit: '%',
    change: 1.8,
    trend: 'up' },
  {
    name: 'AI推荐策略占比',
    value: 45.8,
    unit: '%',
    change: 8.2,
    trend: 'up' },
];

// 核心指标趋势数据（近6个月）
export interface MonthlyTrend {
  month: string;
  taskCompletionRate: number;
  reachRate: number;
  successRate: number;
  closureRate: number;
  aiRatio: number;
}

export const monthlyTrends: MonthlyTrend[] = [
  { month: '9月', taskCompletionRate: 82.3, reachRate: 88.5, successRate: 72.1, closureRate: 92.5, aiRatio: 35.2 },
  { month: '10月', taskCompletionRate: 83.5, reachRate: 89.2, successRate: 73.8, closureRate: 93.1, aiRatio: 37.8 },
  { month: '11月', taskCompletionRate: 84.8, reachRate: 90.1, successRate: 75.2, closureRate: 93.8, aiRatio: 40.1 },
  { month: '12月', taskCompletionRate: 85.9, reachRate: 90.8, successRate: 76.5, closureRate: 94.2, aiRatio: 42.3 },
  { month: '1月', taskCompletionRate: 86.7, reachRate: 91.5, successRate: 77.8, closureRate: 94.8, aiRatio: 44.2 },
  { month: '2月', taskCompletionRate: 87.5, reachRate: 92.3, successRate: 78.6, closureRate: 95.2, aiRatio: 45.8 },
];

// 异常预警数据
export interface HealthAlert {
  id: string;
  type: 'metric' | 'efficiency' | 'region';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  region?: string;
  metricName: string;
  currentValue: number;
  targetValue: number;
  diffValue: number;
  createTime: string;
  status: 'pending' | 'processing' | 'resolved';
}

export const healthAlerts: HealthAlert[] = [
  {
    id: 'HA-001',
    type: 'metric',
    severity: 'high',
    title: '策略成功率低于阈值',
    description: '昌吉自治区策略成功率78.2%，低于目标值80%',
    region: '昌吉自治区',
    metricName: '策略成功率',
    currentValue: 78.2,
    targetValue: 80,
    diffValue: -1.8,
    createTime: '2024-02-09 14:30',
    status: 'pending' },
  {
    id: 'HA-002',
    type: 'efficiency',
    severity: 'high',
    title: '任务完成率异常下降',
    description: '吐鲁番省任务完成率76.5%，较上月下降5.2%',
    region: '吐鲁番',
    metricName: '任务完成率',
    currentValue: 76.5,
    targetValue: 85,
    diffValue: -8.5,
    createTime: '2024-02-09 12:15',
    status: 'pending' },
  {
    id: 'HA-004',
    type: 'metric',
    severity: 'medium',
    title: 'AI推荐策略占比不足',
    description: '哈密回族自治区AI推荐策略占比38.5%，低于全国平均水平',
    region: '哈密回族自治区',
    metricName: 'AI推荐策略占比',
    currentValue: 38.5,
    targetValue: 50,
    diffValue: -11.5,
    createTime: '2024-02-09 09:20',
    status: 'pending' },
];

// ==================== 新增：核心运营模式成效数据 ====================

export interface OperationMode {
  id: string;
  name: string;
  icon: string;
  taskCount: number;
  reachRate: number;
  successRate: number;
  conversionRate: number;
  trend: 'up' | 'down';
  change: number;
}

export const operationModes: OperationMode[] = [
  {
    id: 'customer-driven',
    name: '客群驱动运营',
    icon: '👥',
    taskCount: 12850,
    reachRate: 93.5,
    successRate: 81.2,
    conversionRate: 76.8,
    trend: 'up',
    change: 5.8 },
  {
    id: 'opportunity-triggered',
    name: '商机触发营销',
    icon: '🎯',
    taskCount: 8530,
    reachRate: 88.2,
    successRate: 72.5,
    conversionRate: 68.3,
    trend: 'up',
    change: 3.2 },
  {
    id: 'regional-assault',
    name: '区域攻坚作战',
    icon: '🏔️',
    taskCount: 5680,
    reachRate: 82.8,
    successRate: 68.9,
    conversionRate: 62.5,
    trend: 'down',
    change: -1.5 },
];

// ==================== 新增：待跟进事项数据 ====================

export interface PendingTask {
  id: string;
  type: 'evaluation' | 'exception';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  count: number;
  dueDate: string;
  region?: string;
  status: 'pending' | 'processing' | 'overdue';
}

export const pendingTasks: PendingTask[] = [
  {
    id: 'PT-001',
    type: 'evaluation',
    title: '待评估策略',
    description: '需完成效果复核的运营策略',
    priority: 'high',
    count: 15,
    dueDate: '2024-02-12',
    status: 'pending' },
  {
    id: 'PT-002',
    type: 'evaluation',
    title: '待评估工单',
    description: '需完成效果复核的工单任务',
    priority: 'medium',
    count: 28,
    dueDate: '2024-02-15',
    status: 'pending' },
  {
    id: 'PT-003',
    type: 'exception',
    title: '连续2个月未达标省侧',
    description: '需介入优化的低成效运营事项',
    priority: 'high',
    count: 3,
    dueDate: '2024-02-10',
    status: 'overdue' },
  {
    id: 'PT-004',
    type: 'exception',
    title: '异常策略需优化',
    description: '策略执行异常，需优化调整',
    priority: 'medium',
    count: 8,
    dueDate: '2024-02-18',
    status: 'pending' },
];
// 预警数据
export const alerts: Alert[] = [
  // 一、核心业务类预警 - 保留一条最核心的
  {
    id: 'ALERT-004',
    type: 'metric',
    severity: 'high',
    title: '中高端客户保有率跌破红线',
    description: '中高端客户保有率低于目标值',
    region: '乌鲁木齐',
    dimension: '核心业务',
    value: 89.5,
    threshold: 90.0,
    unit: '%',
    createTime: '2024-02-28 09:20:10',
    status: 'pending' },
  // 二、流程执行类预警 - 保留一条最核心的
  {
    id: 'ALERT-005',
    type: 'workorder',
    severity: 'high',
    title: '工单超时率过高',
    description: '超时工单占比超过阈值',
    region: '克州省, 石河子',
    dimension: '流程执行',
    value: 11.5,
    threshold: 10.0,
    unit: '%',
    createTime: '2024-02-28 08:40:50',
    status: 'processing' },
  // 三、策略模型类预警 - 保留一条最核心的
  {
    id: 'ALERT-009',
    type: 'strategy',
    severity: 'medium',
    title: '策略执行率低',
    description: '已发布策略未按计划执行',
    region: '乌鲁木齐, 昌吉',
    dimension: '策略模型',
    value: 75.3,
    threshold: 80.0,
    unit: '%',
    createTime: '2024-02-28 11:15:40',
    status: 'pending' },
  // 四、客户价值类预警 - 保留一条最核心的
  {
    id: 'ALERT-013',
    type: 'customer',
    severity: 'high',
    title: '离网率突增',
    description: '客户离网率超过正常波动范围',
    region: '伊犁省, 喀什省',
    dimension: '客户价值',
    value: 2.8,
    threshold: 2.5,
    unit: '%',
    createTime: '2024-02-28 09:35:50',
    status: 'pending' },
];

// 策略评估数据
export interface StrategyPromotionActivity {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  coverageRate: number;
  conversionRate: number;
  targetUsers: number;
  reachedUsers: number;
  status: 'ongoing' | 'completed' | 'planned';
}

export interface StrategyChannelDistribution {
  channel: string;
  count: number;
  percentage: number;
  avgCompletionTime: number;
}

export const strategyPromotionActivities: StrategyPromotionActivity[] = [
  {
    id: '1',
    name: '5G套餐推广活动',
    type: '5G业务',
    startTime: '2024-02-01',
    endTime: '2024-02-28',
    coverageRate: 85.6,
    conversionRate: 12.3,
    targetUsers: 500000,
    reachedUsers: 428000,
    status: 'ongoing' },
  {
    id: '2',
    name: '家庭宽带升级活动',
    type: '宽带业务',
    startTime: '2024-01-15',
    endTime: '2024-02-15',
    coverageRate: 78.2,
    conversionRate: 8.5,
    targetUsers: 300000,
    reachedUsers: 234600,
    status: 'ongoing' },
  {
    id: '3',
    name: '流量包营销活动',
    type: '增值业务',
    startTime: '2024-01-01',
    endTime: '2024-01-31',
    coverageRate: 92.5,
    conversionRate: 15.8,
    targetUsers: 800000,
    reachedUsers: 740000,
    status: 'completed' },
];

export const strategyChannelDistribution: StrategyChannelDistribution[] = [
  { channel: '短信', count: 124500, percentage: 35.2, avgCompletionTime: 2.5 },
  { channel: 'APP推送', count: 98500, percentage: 27.9, avgCompletionTime: 1.2 },
  { channel: '电话营销', count: 76200, percentage: 21.5, avgCompletionTime: 5.8 },
  { channel: '微信公众号', count: 35400, percentage: 10.0, avgCompletionTime: 3.2 },
  { channel: '营业厅', count: 18900, percentage: 5.4, avgCompletionTime: 8.5 },
];

// 工单处理效能数据
export interface WorkOrderEfficiency {
  category: string;
  totalCount: number;
  completedCount: number;
  avgProcessTime: number;
  timeoutRate: number;
  satisfaction: number;
}

export const workOrderEfficiency: WorkOrderEfficiency[] = [
  {
    category: '故障处理',
    totalCount: 3456,
    completedCount: 3328,
    avgProcessTime: 4.2,
    timeoutRate: 3.7,
    satisfaction: 95.2 },
  {
    category: '业务咨询',
    totalCount: 5820,
    completedCount: 5678,
    avgProcessTime: 1.5,
    timeoutRate: 2.4,
    satisfaction: 97.8 },
  {
    category: '投诉处理',
    totalCount: 890,
    completedCount: 856,
    avgProcessTime: 6.8,
    timeoutRate: 3.8,
    satisfaction: 92.5 },
  {
    category: '业务办理',
    totalCount: 2690,
    completedCount: 2594,
    avgProcessTime: 2.8,
    timeoutRate: 3.6,
    satisfaction: 96.5 },
];

// 五维健康度数据
export interface HealthDimension {
  name: string;
  key: string;
  score: number;
  maxScore: number;
  subMetrics: {
    name: string;
    value: number;
    weight: number;
  }[];
}

export interface HealthRadarData {
  period: string; // 'current' | 'previous'
  dimensions: {
    business: number; // 核心业务指标健康度
    process: number; // 运营流程与执行健康度
    strategy: number; // 策略与模型有效性健康度
    customer: number; // 客户价值与风险健康度
    resource: number; // 资源与渠道效能健康度
  };
}

// 指标健康度（量、质、构、效）
export const businessHealthMetrics: HealthDimension = {
  name: '指标健康度',
  key: 'business',
  score: 87.5,
  maxScore: 100,
  subMetrics: [
    {
      name: '质（离网率）',
      value: 85,
      weight: 0.25 },
    {
      name: '构（5G渗透率）',
      value: 88,
      weight: 0.25 },
    {
      name: '中高端客户规模保有率',
      value: 90,
      weight: 0.25 },
    {
      name: '中高端客户价值保有率',
      value: 87,
      weight: 0.25 },
  ] };

// 执行敏捷度
export const processHealthMetrics: HealthDimension = {
  name: '执行敏捷度',
  key: 'process',
  score: 82.3,
  maxScore: 100,
  subMetrics: [
    {
      name: '工单响应时长',
      value: 85,
      weight: 0.3 },
    {
      name: '一次性办结率',
      value: 80,
      weight: 0.25 },
    {
      name: '策略触达率',
      value: 82,
      weight: 0.25 },
    {
      name: '闭环反馈质量',
      value: 82,
      weight: 0.2 },
  ] };

// 策略有效性
export const strategyHealthMetrics: HealthDimension = {
  name: '策略有效性',
  key: 'strategy',
  score: 79.8,
  maxScore: 100,
  subMetrics: [
    {
      name: '模型精准度',
      value: 78,
      weight: 0.3 },
    {
      name: '策略效果归因',
      value: 80,
      weight: 0.3 },
    {
      name: '知识库价值',
      value: 82,
      weight: 0.2 },
    {
      name: '策略复用率',
      value: 79,
      weight: 0.2 },
  ] };

// 客户价值与满意度
export const customerHealthMetrics: HealthDimension = {
  name: '客户价值与满意度',
  key: 'customer',
  score: 84.6,
  maxScore: 100,
  subMetrics: [
    {
      name: '长期价值追踪',
      value: 85,
      weight: 0.35 },
    {
      name: '风险状态监控',
      value: 84,
      weight: 0.35 },
    {
      name: '客户感知与口碑',
      value: 84.5,
      weight: 0.3 },
  ] };

// 渠道与人员效能
export const resourceHealthMetrics: HealthDimension = {
  name: '渠道与人员效能',
  key: 'resource',
  score: 81.2,
  maxScore: 100,
  subMetrics: [
    {
      name: '渠道效能',
      value: 82,
      weight: 0.5 },
    {
      name: '人员效能',
      value: 80,
      weight: 0.5 },
  ] };

// 本期五维健康度数据
export const currentHealthData: HealthRadarData = {
  period: 'current',
  dimensions: {
    business: businessHealthMetrics.score,
    process: processHealthMetrics.score,
    strategy: strategyHealthMetrics.score,
    customer: customerHealthMetrics.score,
    resource: resourceHealthMetrics.score } };

// 上期五维健康度数据
export const previousHealthData: HealthRadarData = {
  period: 'previous',
  dimensions: {
    business: 85.2,
    process: 79.8,
    strategy: 76.5,
    customer: 82.3,
    resource: 78.9 } };

// 所有维度数据（用于详情展示）
export const allHealthDimensions: HealthDimension[] = [
  businessHealthMetrics,
  processHealthMetrics,
  strategyHealthMetrics,
  customerHealthMetrics,
  resourceHealthMetrics,
];

// 工单评估 - 近6个月趋势数据
export const workOrderTrendData = {
  months: ['7月', '8月', '9月', '10月', '11月', '12月'],
  workOrderCount: [10200, 10800, 11200, 11800, 12200, 12856],
  completionRate: [93.5, 94.2, 94.8, 95.5, 96.2, 96.8],
  timeoutRate: [4.5, 4.2, 4.0, 3.8, 3.5, 3.2] };

// 策略评估 - 近6个月趋势数据
export const strategyTrendData = {
  months: ['7月', '8月', '9月', '10月', '11月', '12月'],
  strategyCount: [5200, 5600, 5900, 6200, 6400, 6610],
  executionRate: [88.5, 89.8, 90.5, 91.2, 92.5, 93.5],
  aiRatio: [32.5, 34.8, 36.5, 38.2, 40.5, 42.3] };

// ==================== 工单改善情况模块 ====================

// 工单类型
export type WorkOrderType = 'indicator' | 'strategy' | 'group' | 'customer' | 'other';

// 工单改善等级
export type ImprovementGrade = 'excellent' | 'average' | 'needImprovement';

// 时间筛选类型
export type ImprovementTimePeriod = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'lastMonth' | 'last30days' | 'custom';

// 场景类型（用于中间显示）
export type ScenarioType = 'traffic' | 'churn' | 'family' | 'incremental' | 'premium' | 'international';

// 工单改善情况概览数据
export interface WorkOrderImprovementOverview {
  averageImprovementRate: number;
  averageImprovementRateChange: number;
  averageImprovementRateTrend: number[]; // 近6个月趋势
  averageImprovementRateChangeTrend: number[]; // 近6个月环比趋势
  typeImprovementRates: {
    type: ScenarioType;
    typeName: string;
    rate: number;
    rateChange: number; // 环比值
    rateChangeTrend: number[]; // 环比趋势（近6个月）
    grade: ImprovementGrade;
    trend: number[]; // 近6个月趋势
  }[];
  gradeDistribution: {
    grade: ImprovementGrade;
    gradeName: string;
    count: number;
    percentage: number;
    trend: number[]; // 近6个月趋势
  }[];
  // 各场景执行情况
  scenarioExecutionStatus: {
    scenario: ScenarioType;
    scenarioName: string;
    averageImprovementRate: number; // 平均改善率
    rateChange: number; // 环比
    totalWorkOrders: number; // 工单总量
    totalMetrics: number; // 工单关联指标数
    growthMetricRate: number; // 增长指标占比
  }[];
}

// 工单改善详情
export interface WorkOrderImprovementDetail {
  id: string;
  name: string;
  strategyName?: string;
  effectScore: number;
  grade: ImprovementGrade;
  improvementMetricSummary: {
    metricName: string;
    changeRate: number;
    isPositive: boolean;
    targetAchievementRate: number; // 目标达成率
    previousValue?: number; // 原值
    currentValue?: number; // 当前值
    targetValue?: number; // 目标值
    unit?: string; // 指标单位
  }[];
  hasStrategy: boolean;
  workOrderType: WorkOrderType;
  workOrderTypeName: string;
  province: string;
  executionDate: string;
  trackingEndDate?: string;
  trackingRemainingDays?: number;
  attributionSummary?: string;
  optimizationReason?: string;
  handlingSuggestion?: string;
  // 重点工单专用字段
  businessType?: '生产类' | '管理类';
  dispatchType?: '指标调度' | '客群调度' | '策略调度' | '客户商机调度' | '客群商机调度' | '区域攻坚调度'; // 调度类型
  scenario?: '流量运营' | '离网维系' | '家庭运营' | '增量运营' | '中高端客户运营' | '国际业务运营';
  issueTime?: string;
  requiredCompletionTime?: string;
  metrics?: {
    metricName: string;
    previousValue: number;
    currentValue: number;
  }[];
  regions?: string[]; // 覆盖区域列表
  importanceLevel?: '公司领导调度' | '公司部门调度'; // 重要级别
}

// 工单改善情况数据（模拟）
export const workOrderImprovementOverview: WorkOrderImprovementOverview = {
  averageImprovementRate: 68.8,
  averageImprovementRateChange: 3.5,
  averageImprovementRateTrend: [62.3, 64.1, 65.8, 66.5, 67.8, 68.8],
  averageImprovementRateChangeTrend: [1.23, 1.5, 2.3, 1.8, 2.5, 2.1],
  typeImprovementRates: [
    {
      type: 'traffic',
      typeName: '流量运营',
      rate: 81.2,
      rateChange: 5.7,
      rateChangeTrend: [3.5, 4.2, 4.8, 5.1, 5.4, 5.7],
      grade: 'excellent',
      trend: [75.5, 77.2, 78.5, 79.2, 80.5, 81.2]
    },
    {
      type: 'churn',
      typeName: '离网维系',
      rate: 65.8,
      rateChange: 2.1,
      rateChangeTrend: [1.2, 1.5, 1.6, 1.8, 2.0, 2.1],
      grade: 'average',
      trend: [61.2, 62.5, 63.8, 64.2, 65.0, 65.8]
    },
    {
      type: 'family',
      typeName: '家庭运营',
      rate: 70.1,
      rateChange: 4.9,
      rateChangeTrend: [2.8, 3.5, 4.0, 4.4, 4.7, 4.9],
      grade: 'average',
      trend: [65.2, 66.5, 67.5, 68.2, 69.5, 70.1]
    },
    {
      type: 'incremental',
      typeName: '增量运营',
      rate: 67.9,
      rateChange: 4.2,
      rateChangeTrend: [2.5, 3.0, 3.5, 3.8, 4.0, 4.2],
      grade: 'average',
      trend: [62.8, 64.2, 65.5, 66.2, 67.1, 67.9]
    },
    {
      type: 'premium',
      typeName: '中高端客户运营',
      rate: 72.3,
      rateChange: 3.8,
      rateChangeTrend: [2.1, 2.5, 2.8, 3.2, 3.5, 3.8],
      grade: 'average',
      trend: [68.5, 69.2, 70.1, 70.8, 71.5, 72.3]
    },
    {
      type: 'international',
      typeName: '国际业务运营',
      rate: 58.4,
      rateChange: 1.5,
      rateChangeTrend: [0.8, 1.0, 1.2, 1.3, 1.4, 1.5],
      grade: 'needImprovement',
      trend: [54.2, 55.5, 56.8, 57.2, 57.9, 58.4]
    },
  ],
  gradeDistribution: [
    { grade: 'excellent', gradeName: '优秀', count: 2356, percentage: 28, trend: [25, 26, 27, 27, 28, 28] },
    { grade: 'average', gradeName: '一般', count: 4891, percentage: 58, trend: [56, 57, 57, 58, 58, 58] },
    { grade: 'needImprovement', gradeName: '待优化', count: 1180, percentage: 14, trend: [19, 17, 16, 15, 14, 14] },
  ],
  scenarioExecutionStatus: [
    {
      scenario: 'traffic',
      scenarioName: '流量运营',
      averageImprovementRate: 76.5,
      rateChange: 5.2,
      totalWorkOrders: 2156,
      totalMetrics: 3480,
      growthMetricRate: 68.2
    },
    {
      scenario: 'churn',
      scenarioName: '离网维系',
      averageImprovementRate: 65.8,
      rateChange: 2.1,
      totalWorkOrders: 1245,
      totalMetrics: 1892,
      growthMetricRate: 58.6
    },
    {
      scenario: 'family',
      scenarioName: '家庭运营',
      averageImprovementRate: 70.1,
      rateChange: 4.9,
      totalWorkOrders: 1192,
      totalMetrics: 2012,
      growthMetricRate: 63.4
    },
    {
      scenario: 'incremental',
      scenarioName: '增量运营',
      averageImprovementRate: 72.8,
      rateChange: 6.3,
      totalWorkOrders: 980,
      totalMetrics: 1520,
      growthMetricRate: 65.1
    },
    {
      scenario: 'premium',
      scenarioName: '中高端客户运营',
      averageImprovementRate: 72.3,
      rateChange: 3.8,
      totalWorkOrders: 1523,
      totalMetrics: 2456,
      growthMetricRate: 65.8
    },
    {
      scenario: 'international',
      scenarioName: '国际业务运营',
      averageImprovementRate: 58.4,
      rateChange: 1.5,
      totalWorkOrders: 892,
      totalMetrics: 1234,
      growthMetricRate: 52.3
    },
  ]
};

// 优秀工单TOP列表（模拟）- 按达成率倒序排序
export const excellentWorkOrders: WorkOrderImprovementDetail[] = [
  {
    id: 'WO-2025-001',
    name: '携转净增目标冲刺',
    strategyName: '携转挽留与策反策略',
    effectScore: 95,
    grade: 'excellent',
    improvementMetricSummary: [
      { metricName: '携转净增', changeRate: 18.5, isPositive: true, targetAchievementRate: 95, previousValue: 0.8, currentValue: 1.5, targetValue: 1.6, unit: '万' },
    ],
    hasStrategy: true,
    workOrderType: 'strategy',
    workOrderTypeName: '策略调度',
    province: '全疆', regions: ['全疆'],
    executionDate: '2025-02-15',
    trackingEndDate: '2025-05-15',
    businessType: '生产类',
    dispatchType: '策略调度',
    scenario: '增量运营' },
  {
    id: 'WO-2025-002',
    name: '5G流量占比提升攻坚',
    strategyName: '5G流量迁移策略',
    effectScore: 92,
    grade: 'excellent',
    improvementMetricSummary: [
      { metricName: '5G数据流量', changeRate: 22.1, isPositive: true, targetAchievementRate: 92, previousValue: 180, currentValue: 228, targetValue: 250, unit: '亿MB' },
    ],
    hasStrategy: true,
    workOrderType: 'strategy',
    workOrderTypeName: '策略调度',
    province: '全疆', regions: ['全疆'],
    executionDate: '2025-02-05',
    trackingEndDate: '2025-04-05',
    businessType: '生产类',
    dispatchType: '策略调度',
    scenario: '流量运营' },
  {
    id: 'WO-2025-003',
    name: '国际漫游收入提升',
    strategyName: '国际漫游推广策略',
    effectScore: 90,
    grade: 'excellent',
    improvementMetricSummary: [
      { metricName: '国际漫游收入', changeRate: 25.3, isPositive: true, targetAchievementRate: 90, previousValue: 120, currentValue: 155, targetValue: 172, unit: '万元' },
    ],
    hasStrategy: true,
    workOrderType: 'customer',
    workOrderTypeName: '客户商机调度',
    province: '伊犁', regions: ['伊犁','喀什'],
    executionDate: '2025-02-10',
    trackingEndDate: '2025-04-10',
    businessType: '生产类',
    dispatchType: '客户商机调度',
    scenario: '国际业务运营' },
  {
    id: 'WO-2025-004',
    name: '全球通品牌占比提升',
    strategyName: '全球通品牌经营策略',
    effectScore: 88,
    grade: 'excellent',
    improvementMetricSummary: [
      { metricName: '中高端保有率', changeRate: 3.2, isPositive: true, targetAchievementRate: 88, previousValue: 89.5, currentValue: 92.3, targetValue: 95, unit: '%' },
    ],
    hasStrategy: true,
    workOrderType: 'strategy',
    workOrderTypeName: '策略调度',
    province: '乌鲁木齐', regions: ['乌鲁木齐'],
    executionDate: '2025-02-08',
    trackingEndDate: '2025-05-08',
    businessType: '生产类',
    dispatchType: '策略调度',
    scenario: '中高端客户运营' },
  {
    id: 'WO-2025-005',
    name: '全家WiFi渗透率推进',
    strategyName: '全家WiFi推广策略',
    effectScore: 85,
    grade: 'excellent',
    improvementMetricSummary: [
      { metricName: '融合率', changeRate: 8.5, isPositive: true, targetAchievementRate: 85, previousValue: 38, currentValue: 44, targetValue: 50, unit: '%' },
    ],
    hasStrategy: true,
    workOrderType: 'group',
    workOrderTypeName: '客群调度',
    province: '昌吉', regions: ['昌吉'],
    executionDate: '2025-02-03',
    trackingEndDate: '2025-05-03',
    businessType: '生产类',
    dispatchType: '客群调度',
    scenario: '家庭运营' },
];

// 待优化工单列表（模拟）- 按达成率正序排序
export const needImprovementWorkOrders: WorkOrderImprovementDetail[] = [
  {
    id: 'WO-2025-010',
    name: '中高端渗透率提升',
    strategyName: '中高端客户经营策略',
    effectScore: 25,
    grade: 'needImprovement',
    improvementMetricSummary: [
      { metricName: '中高端ARPU', changeRate: -2.5, isPositive: false, targetAchievementRate: 25, previousValue: 142, currentValue: 135, targetValue: 150, unit: '元' },
    ],
    hasStrategy: true,
    workOrderType: 'strategy',
    workOrderTypeName: '策略调度',
    province: '塔城', regions: ['塔城'],
    executionDate: '2025-02-28',
    trackingRemainingDays: 50,
    businessType: '生产类',
    dispatchType: '策略调度',
    scenario: '中高端客户运营' },
  {
    id: 'WO-2025-009',
    name: '新入网ARPU提升',
    strategyName: '新入网价值提升策略',
    province: '阿勒泰', regions: ['阿勒泰'],
    effectScore: 33,
    grade: 'needImprovement',
    improvementMetricSummary: [
      { metricName: '新入网ARPU', changeRate: -4.2, isPositive: false, targetAchievementRate: 33, previousValue: 56, currentValue: 48, targetValue: 65, unit: '元' },
    ],
    hasStrategy: true,
    workOrderType: 'indicator',
    workOrderTypeName: '指标调度',
    executionDate: '2025-02-25',
    trackingRemainingDays: 55,
    businessType: '管理类',
    dispatchType: '指标调度',
    scenario: '增量运营' },
  {
    id: 'WO-2025-007',
    name: '超套客户治理',
    strategyName: '超套治理策略',
    effectScore: 38,
    grade: 'needImprovement',
    improvementMetricSummary: [
      { metricName: '是否流量超套客户', changeRate: 5.8, isPositive: false, targetAchievementRate: 38, previousValue: 42, currentValue: 48, targetValue: 30, unit: '万' },
    ],
    hasStrategy: false,
    workOrderType: 'indicator',
    workOrderTypeName: '指标调度',
    province: '和田', regions: ['和田'],
    executionDate: '2025-02-18',
    trackingRemainingDays: 45,
    businessType: '管理类',
    dispatchType: '指标调度',
    scenario: '流量运营' },
  {
    id: 'WO-2025-006',
    name: '宽带提速完成率提升',
    strategyName: '宽带提速策略',
    effectScore: 30,
    grade: 'needImprovement',
    improvementMetricSummary: [
      { metricName: '宽带提速完成率', changeRate: -8.2, isPositive: false, targetAchievementRate: 30, previousValue: 52, currentValue: 42, targetValue: 75, unit: '%' },
    ],
    hasStrategy: true,
    workOrderType: 'group',
    workOrderTypeName: '客群调度',
    province: '吐鲁番', regions: ['吐鲁番'],
    executionDate: '2025-02-20',
    trackingRemainingDays: 58,
    businessType: '生产类',
    dispatchType: '客群调度',
    scenario: '家庭运营' },
  {
    id: 'WO-2025-008',
    name: '高价值客户离网预警干预',
    strategyName: '精准维系策略',
    province: '克拉玛依', regions: ['克拉玛依'],
    effectScore: 28,
    grade: 'needImprovement',
    improvementMetricSummary: [
      { metricName: '离网率', changeRate: 1.8, isPositive: false, targetAchievementRate: 28, previousValue: 2.5, currentValue: 2.8, targetValue: 1.8, unit: '%' },
    ],
    hasStrategy: true,
    workOrderType: 'strategy',
    workOrderTypeName: '策略调度',
    executionDate: '2025-02-22',
    trackingRemainingDays: 62,
    businessType: '生产类',
    dispatchType: '策略调度',
    scenario: '离网维系' },
];

// 重点关注工单数据
export const focusWorkOrders: WorkOrderImprovementDetail[] = [
  {
    id: 'FW001', name: '全疆流量增幅提升专项', strategyName: '流量规模提升策略',
    effectScore: 78, grade: 'average', hasStrategy: true, workOrderType: 'indicator', workOrderTypeName: '指标调度',
    province: '全疆', regions: ['全疆'], executionDate: '2026-05-01', trackingEndDate: '2026-05-31', trackingRemainingDays: 15,
    businessType: '生产类', dispatchType: '指标调度', scenario: '流量运营',
    importanceLevel: '公司领导调度', issueTime: '2026-05-01 09:30', requiredCompletionTime: '2026-05-31 18:00',
    improvementMetricSummary: [
      { metricName: '流量增幅', changeRate: 15.2, isPositive: true, targetAchievementRate: 75, previousValue: 6.2, currentValue: 8.5, targetValue: 10, unit: '%' },
      { metricName: '当月日均流量', changeRate: 8.8, isPositive: true, targetAchievementRate: 82, previousValue: 520, currentValue: 568, targetValue: 600, unit: '亿MB' },
    ] },
  {
    id: 'FW002', name: '5G流量占比提升攻坚', strategyName: '5G流量迁移策略',
    effectScore: 85, grade: 'excellent', hasStrategy: true, workOrderType: 'strategy', workOrderTypeName: '策略调度',
    province: '全疆', regions: ['全疆'], executionDate: '2026-05-02', trackingEndDate: '2026-05-31', trackingRemainingDays: 14,
    businessType: '生产类', dispatchType: '策略调度', scenario: '流量运营',
    importanceLevel: '公司领导调度', issueTime: '2026-05-02 14:20', requiredCompletionTime: '2026-05-31 18:00',
    improvementMetricSummary: [
      { metricName: '5G数据流量', changeRate: 22.1, isPositive: true, targetAchievementRate: 88, previousValue: 180, currentValue: 228, targetValue: 260, unit: '亿MB' },
      { metricName: '当月套餐饱和度', changeRate: 5.3, isPositive: true, targetAchievementRate: 72, previousValue: 68, currentValue: 73, targetValue: 80, unit: '%' },
    ] },
  {
    id: 'FW003', name: '高价值客户离网预警干预', strategyName: '精准维系策略',
    effectScore: 62, grade: 'average', hasStrategy: true, workOrderType: 'strategy', workOrderTypeName: '策略调度',
    province: '全疆', regions: ['乌鲁木齐','克拉玛依'], executionDate: '2026-05-01', trackingEndDate: '2026-05-20', trackingRemainingDays: 8,
    businessType: '管理类', dispatchType: '策略调度', scenario: '离网维系',
    importanceLevel: '公司部门调度', issueTime: '2026-05-01 10:00', requiredCompletionTime: '2026-05-20 18:00',
    improvementMetricSummary: [
      { metricName: '离网率', changeRate: -3.2, isPositive: true, targetAchievementRate: 65, previousValue: 2.8, currentValue: 2.4, targetValue: 1.8, unit: '%' },
      { metricName: '保有率', changeRate: 1.5, isPositive: true, targetAchievementRate: 70, previousValue: 91.2, currentValue: 92.1, targetValue: 95, unit: '%' },
    ] },
  {
    id: 'FW004', name: '融合业务渗透率提升', strategyName: '全家融合推广策略',
    effectScore: 55, grade: 'average', hasStrategy: true, workOrderType: 'group', workOrderTypeName: '客群调度',
    province: '全疆', regions: ['昌吉','伊犁','巴州'], executionDate: '2026-04-30', trackingEndDate: '2026-05-15', trackingRemainingDays: 3,
    businessType: '生产类', dispatchType: '客群调度', scenario: '家庭运营',
    importanceLevel: '公司部门调度', issueTime: '2026-04-30 08:45', requiredCompletionTime: '2026-05-15 18:00',
    improvementMetricSummary: [
      { metricName: '融合率', changeRate: 6.7, isPositive: true, targetAchievementRate: 55, previousValue: 38, currentValue: 42, targetValue: 50, unit: '%' },
      { metricName: '家庭ARPU', changeRate: 3.2, isPositive: true, targetAchievementRate: 48, previousValue: 86, currentValue: 91, targetValue: 100, unit: '元' },
    ] },
  {
    id: 'FW005', name: '新入网客户量质双提升', strategyName: '新入网价值提升策略',
    effectScore: 88, grade: 'excellent', hasStrategy: true, workOrderType: 'indicator', workOrderTypeName: '指标调度',
    province: '全疆', regions: ['全疆'], executionDate: '2026-04-28', trackingEndDate: '2026-05-31', trackingRemainingDays: 15,
    businessType: '生产类', dispatchType: '指标调度', scenario: '增量运营',
    importanceLevel: '公司领导调度', issueTime: '2026-04-28 11:30', requiredCompletionTime: '2026-05-31 18:00',
    improvementMetricSummary: [
      { metricName: '新入网客户数', changeRate: 18.5, isPositive: true, targetAchievementRate: 92, previousValue: 8.2, currentValue: 10.8, targetValue: 12, unit: '万' },
      { metricName: '新入网ARPU', changeRate: 8.3, isPositive: true, targetAchievementRate: 78, previousValue: 52, currentValue: 58, targetValue: 65, unit: '元' },
    ] },
  {
    id: 'FW006', name: '中高端客户保有与价值提升', strategyName: '中高端价值经营策略',
    effectScore: 72, grade: 'average', hasStrategy: true, workOrderType: 'strategy', workOrderTypeName: '策略调度',
    province: '全疆', regions: ['乌鲁木齐','昌吉'], executionDate: '2026-05-03', trackingEndDate: '2026-05-25', trackingRemainingDays: 10,
    businessType: '生产类', dispatchType: '策略调度', scenario: '中高端客户运营',
    importanceLevel: '公司领导调度', issueTime: '2026-05-03 16:00', requiredCompletionTime: '2026-05-25 18:00',
    improvementMetricSummary: [
      { metricName: '中高端保有率', changeRate: 2.1, isPositive: true, targetAchievementRate: 72, previousValue: 88.5, currentValue: 90.2, targetValue: 95, unit: '%' },
      { metricName: '中高端ARPU', changeRate: 5.8, isPositive: true, targetAchievementRate: 68, previousValue: 128, currentValue: 138, targetValue: 150, unit: '元' },
    ] },
  {
    id: 'FW007', name: '国际漫游收入提升', strategyName: '国际漫游推广策略',
    effectScore: 90, grade: 'excellent', hasStrategy: true, workOrderType: 'customer', workOrderTypeName: '客户商机调度',
    province: '全疆', regions: ['伊犁','喀什','阿克苏'], executionDate: '2026-05-01', trackingEndDate: '2026-05-20', trackingRemainingDays: 8,
    businessType: '生产类', dispatchType: '客户商机调度', scenario: '国际业务运营',
    importanceLevel: '公司部门调度', issueTime: '2026-05-01 09:00', requiredCompletionTime: '2026-05-20 18:00',
    improvementMetricSummary: [
      { metricName: '国际漫游收入', changeRate: 25.3, isPositive: true, targetAchievementRate: 90, previousValue: 120, currentValue: 155, targetValue: 170, unit: '万元' },
      { metricName: '国际出访客户数', changeRate: 12.5, isPositive: true, targetAchievementRate: 85, previousValue: 3.2, currentValue: 4.1, targetValue: 5, unit: '万' },
    ] },
  {
    id: 'FW008', name: '超套客户治理与饱和度提升', strategyName: '超套治理策略',
    effectScore: 45, grade: 'needImprovement', hasStrategy: true, workOrderType: 'indicator', workOrderTypeName: '指标调度',
    province: '全疆', regions: ['全疆'], executionDate: '2026-05-02', trackingEndDate: '2026-05-31', trackingRemainingDays: 14,
    businessType: '管理类', dispatchType: '指标调度', scenario: '流量运营',
    importanceLevel: '公司部门调度', issueTime: '2026-05-02 13:15', requiredCompletionTime: '2026-05-31 18:00',
    improvementMetricSummary: [
      { metricName: '是否流量超套客户', changeRate: -8.5, isPositive: true, targetAchievementRate: 45, previousValue: 52, currentValue: 45, targetValue: 30, unit: '万' },
      { metricName: '整体饱和度(套+包)', changeRate: 3.2, isPositive: true, targetAchievementRate: 52, previousValue: 72, currentValue: 75, targetValue: 82, unit: '%' },
    ] },
  {
    id: 'FW009', name: '沉默客户激活与维系', strategyName: '',
    effectScore: 0, grade: 'needImprovement', hasStrategy: false, workOrderType: 'strategy', workOrderTypeName: '策略调度',
    province: '阿克苏', regions: ['阿克苏'], executionDate: '2026-05-03', trackingEndDate: '2026-05-15', trackingRemainingDays: 3,
    businessType: '管理类', dispatchType: '策略调度', scenario: '离网维系',
    importanceLevel: '公司部门调度', issueTime: '2026-05-03 10:30', requiredCompletionTime: '2026-05-15 18:00',
    improvementMetricSummary: [
      { metricName: '预警准确率', changeRate: 0, isPositive: false, targetAchievementRate: 0, unit: '%' },
    ] },
  {
    id: 'FW010', name: '23类客户三扩三融推进', strategyName: '三扩三融策略',
    effectScore: 68, grade: 'average', hasStrategy: true, workOrderType: 'indicator', workOrderTypeName: '指标调度',
    province: '全疆', regions: ['全疆'], executionDate: '2026-05-03', trackingEndDate: '2026-05-31', trackingRemainingDays: 15,
    businessType: '生产类', dispatchType: '指标调度', scenario: '流量运营',
    importanceLevel: '公司领导调度', issueTime: '2026-05-03 08:00', requiredCompletionTime: '2026-05-31 18:00',
    improvementMetricSummary: [
      { metricName: '23类客户三扩三融率', changeRate: 5.2, isPositive: true, targetAchievementRate: 68, previousValue: 22, currentValue: 28, targetValue: 35, unit: '%' },
      { metricName: '流量份额', changeRate: 2.8, isPositive: true, targetAchievementRate: 72, previousValue: 31.5, currentValue: 33.2, targetValue: 36, unit: '%' },
    ] },
];

// ==================== 策略评估摘要数据 ====================

// 策略评估核心KPI卡片
export interface StrategyKPI {
  label: string;        // 卡片标题
  value: number;        // 当前值
  unit: string;         // 单位
  change: number;       // 较上月变化（pp或绝对值）
  changeUnit: 'pp' | 'absolute'; // 变化单位
  trend: 'up' | 'down' | 'stable';
  description: string;  // 业务说明
  formula: string;      // 统计公式
}

// 策略执行月度趋势
export interface StrategyMonthlyTrend {
  month: string;         // 月份标签，如 "2025-12"
  dispatched: number;    // 策略派发数量
  completed: number;     // 已完成数量
  successRate: number;   // 成功率(%)
}

// 策略效果分布档位
export type StrategyEffectLevel = 'high' | 'medium' | 'low' | 'ineffective';

export interface StrategyEffectDistribution {
  level: StrategyEffectLevel;
  label: string;        // 高效策略/有效策略/低效策略/无效策略
  count: number;        // 策略数量
  percentage: number;   // 占比(%)
  color: string;        // 图表颜色
}

// 区域策略效果排名
export interface RegionStrategyRank {
  rank: number;
  name: string;         // 地市名
  successRate: number;  // 成功率(%)
  dispatchCount: number; // 派发数量
  change: number;       // 较上月变化(pp)
}

// 需关注策略
export interface AttentionStrategy {
  id: string;
  scenario: string;     // 业务场景
  name: string;         // 策略名称
  issue: string;        // 问题描述
  suggestion: string;   // 建议动作
  metric: string;       // 关键指标名
  metricValue: string;  // 关键指标值
}

// 策略评估摘要数据
export interface StrategyEvaluationSummaryData {
  kpis: StrategyKPI[];
  monthlyTrend: StrategyMonthlyTrend[];
  effectDistribution: StrategyEffectDistribution[];
  topRegions: RegionStrategyRank[];
  bottomRegions: RegionStrategyRank[];
  attentionStrategies: AttentionStrategy[];
}

// 策略评估摘要模拟数据（全疆维度）
export const strategyEvaluationSummary: StrategyEvaluationSummaryData = {
  kpis: [
    { label: '策略派发量', value: 12, unit: '笔', change: 3, changeUnit: 'absolute', trend: 'up',
      description: '统计周期内通过策略中心派发的策略总笔数',
      formula: 'COUNT(策略派发记录 WHERE 派发时间∈账期)' },
    { label: '已完成率', value: 66.7, unit: '%', change: 5.0, changeUnit: 'pp', trend: 'up',
      description: '已完成策略占已到期策略的比例，未到期策略不计入分母',
      formula: '已完成数 ÷ 已到期数 × 100%' },
    { label: '平均触达率', value: 44.7, unit: '%', change: 1.2, changeUnit: 'pp', trend: 'up',
      description: '所有已执行策略的客户触达率加权平均',
      formula: 'Σ(策略触达客户数) ÷ Σ(策略目标客户数) × 100%' },
    { label: '平均成功率', value: 8.0, unit: '%', change: 0.4, changeUnit: 'pp', trend: 'up',
      description: '所有已执行策略的客户成功转化率加权平均',
      formula: 'Σ(策略成功转化数) ÷ Σ(策略触达客户数) × 100%' },
    { label: 'AI推荐采纳率', value: 76.5, unit: '%', change: 2.3, changeUnit: 'pp', trend: 'up',
      description: 'AI推荐策略中被采纳执行的比例',
      formula: 'AI推荐且已采纳策略数 ÷ AI推荐策略总数 × 100%' },
  ],
  monthlyTrend: [
    { month: '2025-12', dispatched: 8, completed: 5, successRate: 7.2 },
    { month: '2026-01', dispatched: 10, completed: 7, successRate: 7.6 },
    { month: '2026-02', dispatched: 9, completed: 6, successRate: 7.8 },
    { month: '2026-03', dispatched: 11, completed: 8, successRate: 8.0 },
    { month: '2026-04', dispatched: 15, completed: 12, successRate: 8.2 },
    { month: '2026-05', dispatched: 12, completed: 8, successRate: 8.0 },
  ],
  effectDistribution: [
    { level: 'high', label: '高效策略', count: 18, percentage: 15, color: '#16a34a' },
    { level: 'medium', label: '有效策略', count: 54, percentage: 45, color: '#2563eb' },
    { level: 'low', label: '低效策略', count: 36, percentage: 30, color: '#f59e0b' },
    { level: 'ineffective', label: '无效策略', count: 12, percentage: 10, color: '#dc2626' },
  ],
  topRegions: [
    { rank: 1, name: '石河子', successRate: 12.3, dispatchCount: 2, change: 1.5 },
    { rank: 2, name: '奎屯', successRate: 11.8, dispatchCount: 1, change: 2.1 },
    { rank: 3, name: '克拉玛依', successRate: 10.5, dispatchCount: 3, change: 0.8 },
    { rank: 4, name: '乌鲁木齐', successRate: 9.7, dispatchCount: 4, change: 1.2 },
    { rank: 5, name: '昌吉', successRate: 9.2, dispatchCount: 2, change: -0.3 },
  ],
  bottomRegions: [
    { rank: 1, name: '和田', successRate: 2.1, dispatchCount: 1, change: -1.5 },
    { rank: 2, name: '喀什', successRate: 3.2, dispatchCount: 2, change: -0.8 },
    { rank: 3, name: '克州', successRate: 3.8, dispatchCount: 1, change: 0.2 },
    { rank: 4, name: '阿克苏', successRate: 4.1, dispatchCount: 2, change: -0.5 },
    { rank: 5, name: '吐鲁番', successRate: 4.5, dispatchCount: 1, change: 0.3 },
  ],
  attentionStrategies: [
    {
      id: 'AS001',
      scenario: '离网维系',
      name: '沉默用户激活关怀',
      issue: '成功率仅1.2%，远低于均值8.0%',
      suggestion: '建议调整营销话术，增加5G消息渠道',
      metric: '成功率',
      metricValue: '1.2%',
    },
    {
      id: 'AS002',
      scenario: '流量运营',
      name: '视频APP高流量推荐定向包',
      issue: '触达率仅15.3%，短信渠道到达率低',
      suggestion: '建议切换为APP Push+企微双渠道触达',
      metric: '触达率',
      metricValue: '15.3%',
    },
    {
      id: 'AS003',
      scenario: '中高端',
      name: '全球通尊享升级',
      issue: 'AI推荐采纳率仅32%，策略匹配度不足',
      suggestion: '建议优化推荐模型特征，增加消费行为标签',
      metric: 'AI采纳率',
      metricValue: '32%',
    },
  ],
};

// 16地市策略评估摘要数据（按区域筛选时使用）
export const regionStrategySummaryMap: Record<string, StrategyEvaluationSummaryData> = {
  '乌鲁木齐': {
    kpis: [
      { label: '策略派发量', value: 4, unit: '笔', change: 1, changeUnit: 'absolute', trend: 'up',
        description: '统计周期内通过策略中心派发的策略总笔数', formula: 'COUNT(策略派发记录 WHERE 派发时间∈账期)' },
      { label: '已完成率', value: 75.0, unit: '%', change: 8.0, changeUnit: 'pp', trend: 'up',
        description: '已完成策略占已到期策略的比例，未到期策略不计入分母', formula: '已完成数 ÷ 已到期数 × 100%' },
      { label: '平均触达率', value: 47.8, unit: '%', change: 2.1, changeUnit: 'pp', trend: 'up',
        description: '所有已执行策略的客户触达率加权平均', formula: 'Σ(策略触达客户数) ÷ Σ(策略目标客户数) × 100%' },
      { label: '平均成功率', value: 9.7, unit: '%', change: 1.2, changeUnit: 'pp', trend: 'up',
        description: '所有已执行策略的客户成功转化率加权平均', formula: 'Σ(策略成功转化数) ÷ Σ(策略触达客户数) × 100%' },
      { label: 'AI推荐采纳率', value: 80.2, unit: '%', change: 3.5, changeUnit: 'pp', trend: 'up',
        description: 'AI推荐策略中被采纳执行的比例', formula: 'AI推荐且已采纳策略数 ÷ AI推荐策略总数 × 100%' },
    ],
    monthlyTrend: [
      { month: '2025-12', dispatched: 2, completed: 1, successRate: 8.1 },
      { month: '2026-01', dispatched: 3, completed: 2, successRate: 8.5 },
      { month: '2026-02', dispatched: 2, completed: 1, successRate: 8.3 },
      { month: '2026-03', dispatched: 3, completed: 2, successRate: 9.0 },
      { month: '2026-04', dispatched: 4, completed: 3, successRate: 9.5 },
      { month: '2026-05', dispatched: 4, completed: 3, successRate: 9.7 },
    ],
    effectDistribution: [
      { level: 'high', label: '高效策略', count: 3, percentage: 25, color: '#16a34a' },
      { level: 'medium', label: '有效策略', count: 5, percentage: 42, color: '#2563eb' },
      { level: 'low', label: '低效策略', count: 3, percentage: 25, color: '#f59e0b' },
      { level: 'ineffective', label: '无效策略', count: 1, percentage: 8, color: '#dc2626' },
    ],
    topRegions: [],
    bottomRegions: [],
    attentionStrategies: [
      {
        id: 'AS-UMQ001',
        scenario: '流量运营',
        name: '视频APP高流量推荐定向包',
        issue: '触达率仅15.3%，短信渠道到达率低',
        suggestion: '建议切换为APP Push+企微双渠道触达',
        metric: '触达率',
        metricValue: '15.3%',
      },
    ],
  },
  '克拉玛依': {
    kpis: [
      { label: '策略派发量', value: 3, unit: '笔', change: 0, changeUnit: 'absolute', trend: 'stable',
        description: '统计周期内通过策略中心派发的策略总笔数', formula: 'COUNT(策略派发记录 WHERE 派发时间∈账期)' },
      { label: '已完成率', value: 80.0, unit: '%', change: 6.0, changeUnit: 'pp', trend: 'up',
        description: '已完成策略占已到期策略的比例，未到期策略不计入分母', formula: '已完成数 ÷ 已到期数 × 100%' },
      { label: '平均触达率', value: 52.3, unit: '%', change: 3.5, changeUnit: 'pp', trend: 'up',
        description: '所有已执行策略的客户触达率加权平均', formula: 'Σ(策略触达客户数) ÷ Σ(策略目标客户数) × 100%' },
      { label: '平均成功率', value: 10.5, unit: '%', change: 1.5, changeUnit: 'pp', trend: 'up',
        description: '所有已执行策略的客户成功转化率加权平均', formula: 'Σ(策略成功转化数) ÷ Σ(策略触达客户数) × 100%' },
      { label: 'AI推荐采纳率', value: 82.1, unit: '%', change: 2.0, changeUnit: 'pp', trend: 'up',
        description: 'AI推荐策略中被采纳执行的比例', formula: 'AI推荐且已采纳策略数 ÷ AI推荐策略总数 × 100%' },
    ],
    monthlyTrend: [
      { month: '2025-12', dispatched: 2, completed: 1, successRate: 8.5 },
      { month: '2026-01', dispatched: 2, completed: 2, successRate: 9.0 },
      { month: '2026-02', dispatched: 3, completed: 2, successRate: 9.2 },
      { month: '2026-03', dispatched: 3, completed: 2, successRate: 9.8 },
      { month: '2026-04', dispatched: 4, completed: 3, successRate: 10.2 },
      { month: '2026-05', dispatched: 3, completed: 2, successRate: 10.5 },
    ],
    effectDistribution: [
      { level: 'high', label: '高效策略', count: 2, percentage: 33, color: '#16a34a' },
      { level: 'medium', label: '有效策略', count: 3, percentage: 50, color: '#2563eb' },
      { level: 'low', label: '低效策略', count: 1, percentage: 17, color: '#f59e0b' },
      { level: 'ineffective', label: '无效策略', count: 0, percentage: 0, color: '#dc2626' },
    ],
    topRegions: [],
    bottomRegions: [],
    attentionStrategies: [],
  },
};

// ==================== 调度执行评估模块 ====================

// 调度类型（筛选器用）
export type DispatchFilterType = 'all' | '策略调度' | '客群调度' | '客户商机调度' | '客群商机调度' | '区域攻坚调度';

// 派发系统筛选
export type DispatchSystemFilter = 'all' | 'IOP' | '网格通';

// 管理类调度执行评估 - 指标调度KPI
export interface ManagementDispatchKPI {
  workOrderCompletionRate: number;  // 工单完成率(%)
  metricAchievementRate: number;    // 指标达成率(%)
  avgAnalysisCycle: number;         // 平均分析周期(天)
  conclusionAdoptionRate: number;   // 分析结论采纳率(%)
}

// IOP执行KPI
export interface IopExecutionKPI {
  totalDispatches: number;      // 本月IOP调度量(单)
  avgReachRate: number;         // 平均触达率(%)
  avgConversionRate: number;    // 平均转化率(%)
  avgExecutionCycle: number;    // 平均执行周期(天)
}

// 网格通执行KPI
export interface WanggetongExecutionKPI {
  totalDispatches: number;      // 本月网格通调度量(单)
  avgCallThroughRate: number;   // 平均呼通率(%)
  avgMarketingSuccessRate: number; // 平均营销成功率(%)
  avgExecutionCycle: number;    // 平均执行周期(天)
}

// 全局调度KPI
export interface GlobalDispatchKPI {
  totalDispatches: number;      // 本月调度总量(单)
  completionRate: number;       // 整体执行完成率(%)
  avgExecutionCycle: number;    // 平均执行周期(天)
}

// 渠道触达数据
export interface ChannelReachData {
  channel: string;    // 渠道名称
  reachCount: number; // 触达量
  conversionCount: number; // 转化量
  conversionRate: number;  // 转化率(%)
}

// 登记状态分布数据
export interface RegistrationStatusData {
  success: number;    // 成功
  notReached: number; // 未呼通
  hesitating: number; // 用户犹豫
  rejected: number;   // 用户拒绝
}

// 月度趋势数据
export interface DispatchMonthlyTrend {
  month: string;
  iopReachRate?: number;          // IOP触达率
  iopConversionRate?: number;     // IOP转化率
  wanggetongCallThroughRate?: number;   // 网格通呼通率
  wanggetongMarketingSuccessRate?: number; // 网格通营销成功率
}

// 区域排名数据
export interface RegionDispatchRank {
  rank: number;
  name: string;
  value: number;      // 核心指标值(%)
  dispatchCount: number; // 调度量
  change: number;     // 较上月变化(pp)
}

// 待关注工单
export interface AttentionDispatchOrder {
  id: string;
  type: string;            // 调度类型
  dispatchSystem: string;  // 派发系统
  region: string;          // 区域
  issue: string;           // 问题描述
  metric: string;          // 关键指标
  metricValue: string;     // 指标值
}

// 调度执行评估完整数据
export interface DispatchExecutionEvaluationData {
  managementKPI: ManagementDispatchKPI;
  iopKPI: IopExecutionKPI;
  wanggetongKPI: WanggetongExecutionKPI;
  globalKPI: GlobalDispatchKPI;
  channelDistribution: ChannelReachData[];
  registrationStatusDistribution: RegistrationStatusData;
  monthlyTrends: DispatchMonthlyTrend[];
  iopRegionRanks: RegionDispatchRank[];
  wanggetongRegionRanks: RegionDispatchRank[];
  attentionOrders: AttentionDispatchOrder[];
}

// 调度区域评估模拟数据
export const regionalEvaluationData = {
  summary: {
    totalEvaluated: 48,
    achievedCount: 31,
    avgImprovementRate: 4.7,
    notAchievedCount: 17,
  },
  evaluationList: [
    { id: 'IND-2026-0023', title: 'DOU同比下降分析调度', dispatchType: '指标调度', region: '乌鲁木齐', indicatorName: 'DOU同比增长率', unit: '%', baseValue: 8.2, targetValue: 12.0, currentValue: 10.5, improvement: 2.3, achievementRate: 60.5, status: 'not_achieved' as const },
    { id: 'STR-2026-0015', title: '5G套餐渗透率提升策略', dispatchType: '策略调度', region: '克拉玛依', indicatorName: '5G渗透率', unit: '%', baseValue: 32.5, targetValue: 38.0, currentValue: 38.2, improvement: 5.7, achievementRate: 103.6, status: 'achieved' as const },
    { id: 'CG-OP-2026-0008', title: '高价值客群ARPU提升', dispatchType: '客群调度', region: '石河子', indicatorName: 'ARPU', unit: '元', baseValue: 156, targetValue: 168, currentValue: 163, improvement: 7, achievementRate: 58.3, status: 'not_achieved' as const },
    { id: 'RAS-2026-0012', title: '天山区宽带渗透率攻坚', dispatchType: '区域攻坚调度', region: '乌鲁木齐-天山区', indicatorName: '宽带渗透率', unit: '%', baseValue: 45.2, targetValue: 52.0, currentValue: 53.1, improvement: 7.9, achievementRate: 116.2, status: 'achieved' as const },
    { id: 'IND-2026-0025', title: '5G登网率异动调度', dispatchType: '指标调度', region: '昌吉', indicatorName: '5G登网率', unit: '%', baseValue: 28.5, targetValue: 33.0, currentValue: 33.8, improvement: 5.3, achievementRate: 117.8, status: 'achieved' as const },
    { id: 'STR-2026-0018', title: '高清客户转化策略', dispatchType: '策略调度', region: '伊犁', indicatorName: '高清转化率', unit: '%', baseValue: 18.6, targetValue: 22.0, currentValue: 20.3, improvement: 1.7, achievementRate: 50.0, status: 'not_achieved' as const },
    { id: 'RAS-2026-0014', title: '沙依巴克区流量攻坚', dispatchType: '区域攻坚调度', region: '乌鲁木齐-沙依巴克区', indicatorName: 'DOU同比增长率', unit: '%', baseValue: 6.8, targetValue: 10.0, currentValue: 11.2, improvement: 4.4, achievementRate: 137.5, status: 'achieved' as const },
    { id: 'CG-OP-2026-0011', title: '离网预警客群维系', dispatchType: '客群调度', region: '喀什', indicatorName: '离网率', unit: '%', baseValue: 3.8, targetValue: 2.5, currentValue: 2.9, improvement: -0.9, achievementRate: 69.2, status: 'not_achieved' as const },
    { id: 'IND-2026-0028', title: '宽带新增趋势分析', dispatchType: '指标调度', region: '阿克苏', indicatorName: '宽带新增数', unit: '户', baseValue: 856, targetValue: 1000, currentValue: 1023, improvement: 167, achievementRate: 116.4, status: 'achieved' as const },
    { id: 'RAS-2026-0016', title: '新市区5G覆盖攻坚', dispatchType: '区域攻坚调度', region: '乌鲁木齐-新市区', indicatorName: '5G渗透率', unit: '%', baseValue: 28.3, targetValue: 35.0, currentValue: 35.6, improvement: 7.3, achievementRate: 108.9, status: 'achieved' as const },
  ],
  regionImprovement: [
    { region: '克拉玛依', improvementRate: 6.8, achieved: true },
    { region: '石河子', improvementRate: 5.9, achieved: true },
    { region: '乌鲁木齐', improvementRate: 5.2, achieved: true },
    { region: '昌吉', improvementRate: 4.5, achieved: true },
    { region: '伊犁', improvementRate: 3.8, achieved: false },
    { region: '阿克苏', improvementRate: 3.2, achieved: true },
    { region: '巴州', improvementRate: 2.9, achieved: false },
    { region: '哈密', improvementRate: 2.5, achieved: false },
    { region: '吐鲁番', improvementRate: 2.1, achieved: false },
    { region: '塔城', improvementRate: 1.8, achieved: false },
    { region: '博州', improvementRate: 1.5, achieved: false },
    { region: '喀什', improvementRate: 1.2, achieved: false },
    { region: '奎屯', improvementRate: 0.8, achieved: false },
    { region: '和田', improvementRate: 0.5, achieved: false },
    { region: '克州', improvementRate: -0.3, achieved: false },
    { region: '阿勒泰', improvementRate: -1.2, achieved: false },
  ],
};
