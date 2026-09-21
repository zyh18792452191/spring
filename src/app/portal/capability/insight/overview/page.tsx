'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronRight, ChevronDown, FileText, BarChart3, TrendingUp, TrendingDown, Users, Phone, Database, Zap, ArrowRight, ChevronUp, ChevronDown as ChevronDownIcon, Plus, Edit, ExternalLink, Edit2, AlertTriangle, X, AlertCircle, Download, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerHeader, DrawerTitle as DrawerTitleComp, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import IndicatorDispatchDialog from '@/components/IndicatorDispatchDialog';
import AlertRuleDrawerContent from '@/components/AlertRuleDrawerContent';
import MetricExportDialog, { ExportParams } from '@/components/MetricExportDialog';
import { useMounted } from '@/hooks/useMounted';

interface MetricTreeNode {
  id: string;
  name: string;
  code: string;
  value?: string;
  period?: string; // 统计周期（日、月）
  previousValue?: string; // 前期值（用于计算环比）
  format?: string; // 指标格式（数值、百分比）
  direction?: string; // 指标方向（正向指标、负向指标）
  unit?: string; // 指标单位
  children?: MetricTreeNode[];
  alerts?: AlertInfo[]; // 预警信息
}

interface MetricTreeCard {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  scenario: string;
  metricsCount: number;
  region: string; // 归属区域
  metrics: MetricTreeNode[];
  creator?: string; // 创建者
  createdBy?: string; // 创建者ID
  alerts?: AlertInfo[]; // 预警信息
  period?: string; // 根节点指标统计周期（日、月）
  latestPeriod?: string; // 根节点指标最新数据账期
}

// 指标数据模型
interface Metric {
  id: string;
  name: string;
  code: string;
  businessDefinition: string; // 业务口径
  granularity: string; // 指标粒度（省、地市、区县、网格）
  period: string; // 统计周期（日、月）
  source: string; // 指标来源（一经系统）
  format: string; // 指标格式（数值、百分比、枚举）
  type: string; // 指标类型（值、同比、环比、占比、增量）
  unit: string; // 指标单位
  value: string; // 指标值
  scenario: string; // 所属业务场景
  direction?: string; // 指标方向（正向指标、负向指标）
  previousValue?: string; // 前期值（用于计算环比）
  alerts?: AlertInfo[]; // 预警信息（已触发的预警）
  alertRules?: AlertRule[]; // 预警规则（已配置的规则）
  latestPeriod?: string; // 最新数据账期（如 '2025-03-20' 或 '2025-03'）
}

// 预警规则模型
interface AlertRule {
  id: string;
  ruleName: string; // 规则名称
  metricName: string; // 指标名称
  condition: string; // 触发条件
  level: string; // 预警等级
  status: string; // 状态（启用、停用）
}

// 预警信息模型
interface AlertInfo {
  id: string;
  metricName: string; // 预警指标名称
  content: string; // 预警内容
  level: string; // 预警等级（红色、橙色、黄色、蓝色）
}

// 计算环比或同比的值和颜色
function calculateChange(
  currentValue: string,
  previousValue: string | undefined,
  format: string,
  direction: string | undefined
): { value: string; color: string; icon: 'up' | 'down' } {
  if (!previousValue) {
    return { value: '-', color: 'text-gray-500', icon: 'up' };
  }

  const currentNum = parseFloat(currentValue);
  const previousNum = parseFloat(previousValue);

  if (isNaN(currentNum) || isNaN(previousNum) || previousNum === 0) {
    return { value: '-', color: 'text-gray-500', icon: 'up' };
  }

  let changeValue: number;
  let unit: string;

  if (format === '百分比') {
    // 百分比类型：现值-前值，单位pp
    changeValue = currentNum - previousNum;
    unit = 'pp';
  } else {
    // 数值类型：(现值-前值)/前值，单位%
    changeValue = ((currentNum - previousNum) / previousNum) * 100;
    unit = '%';
  }

  const isPositive = changeValue > 0;
  const isNegative = changeValue < 0;
  const displayValue = isPositive ? `+${changeValue.toFixed(1)}${unit}` : `${changeValue.toFixed(1)}${unit}`;

  // 颜色判断：正向指标正值绿负值红，负向指标正值红负值绿
  // 如果没有设置direction，默认按正向指标处理
  let color: string;
  if (direction === '负向指标') {
    color = isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-500';
  } else {
    // 正向指标
    color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
  }

  return {
    value: displayValue,
    color,
    icon: isPositive ? 'up' : 'down'
  };
}

interface BusinessScenario {
  id: string;
  name: string;
  icon: React.ElementType;
  metricsCount: number;
}

interface Region {
  id: string;
  name: string;
}

function InsightOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScenario, setActiveScenario] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all'); // 归属区域筛选
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showGroupDialog, setShowGroupDialog] = useState(false); // 指标组选择弹窗
  const [selectedGroupId, setSelectedGroupId] = useState(''); // 选中的指标组
  const [viewMode, setViewMode] = useState<'tree' | 'metric'>('tree'); // 视图模式：指标树视图 / 指标视图
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; alerts: AlertInfo[]; title?: string; sourceType?: 'metric-tree' | 'metric' }>({
    open: false,
    alerts: [],
    title: '',
    sourceType: 'metric',
  }); // 预警弹窗
  const [alertRulesDialog, setAlertRulesDialog] = useState<{ open: boolean; rules: AlertRule[]; metricName: string; metricId: string }>({
    open: false,
    rules: [],
    metricName: '',
    metricId: '',
  }); // 预警规则列表弹窗
  const [metricAnalysisDialog, setMetricAnalysisDialog] = useState<{ open: boolean; metric: Metric | null }>({
    open: false,
    metric: null,
  }); // 指标分析弹窗
  const [dispatchDrawerOpen, setDispatchDrawerOpen] = useState(false); // 指标调度抽屉
  const [dispatchIndicators, setDispatchIndicators] = useState<Array<{id: string, name: string, period: string, scenario?: string}>>([]); // 选中的指标（用于指标调度）
  const [scenarioWarningDialog, setScenarioWarningDialog] = useState(false); // 业务场景警告弹窗
  const [alertRuleDrawerOpen, setAlertRuleDrawerOpen] = useState(false); // 预警规则抽屉
  const [alertRuleMode, setAlertRuleMode] = useState<'view' | 'edit' | 'create'>('view'); // 预警规则抽屉模式
  const [selectedAlertRule, setSelectedAlertRule] = useState<AlertRule | null>(null); // 选中的预警规则
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set()); // 选中的指标卡片（用于下载导出）
  const [exportDialogOpen, setExportDialogOpen] = useState(false); // 导出弹窗状态
  
  // 指标树详情弹窗
  const [metricTreeDetailDialog, setMetricTreeDetailDialog] = useState<{
    open: boolean;
    card: MetricTreeCard | null;
    selectedPeriod: string; // 选中的账期（日期或月份）
    periodType: 'day' | 'month'; // 账期类型
  }>({
    open: false,
    card: null,
    selectedPeriod: '',
    periodType: 'month',
  });
  
  // 指标视图账期筛选状态（静态默认值，与指标数据的 latestPeriod 匹配）
  const [dayPeriodFilter, setDayPeriodFilter] = useState('2025-03-21'); // 日账期筛选，默认昨天
  const [monthPeriodFilter, setMonthPeriodFilter] = useState('2025-03'); // 月账期筛选，默认上个月
  
  // 指标分析弹窗的账期筛选
  const [analysisPeriodType, setAnalysisPeriodType] = useState<'day' | 'month'>('day'); // 账期类型：日/月
  const [analysisDate, setAnalysisDate] = useState(''); // 选中的日期
  
  // 计算T-1日期或T-1月份
  const getTMinus1Date = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };
  
  const getTMinus1Month = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // 当指标分析弹窗打开时，初始化账期筛选
  useEffect(() => {
    if (metricAnalysisDialog.open && metricAnalysisDialog.metric) {
      // 根据指标的统计周期默认设置账期类型
      const metric = metricAnalysisDialog.metric;
      if (metric.period === '月') {
        setAnalysisPeriodType('month');
        setAnalysisDate(getTMinus1Month());
      } else {
        setAnalysisPeriodType('day');
        setAnalysisDate(getTMinus1Date());
      }
    }
  }, [metricAnalysisDialog.open, metricAnalysisDialog.metric]);
  
  // 处理指标卡片点击，跳转到指标详情页
  const handleMetricCardClick = (metricId: string) => {
    console.log('点击指标卡片，metricId:', metricId);
    router.push(`/portal/capability/insight/metric/${metricId}?from=metric&view=metric`);
  };

  // 处理指标卡片勾选/取消勾选
  const handleMetricSelect = (metricId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metricId)) {
        newSet.delete(metricId);
      } else {
        newSet.add(metricId);
      }
      return newSet;
    });
  };

  // 下载选中的指标 - 打开导出弹窗
  const handleDownloadSelectedMetrics = () => {
    if (selectedMetrics.size === 0) {
      alert('请先勾选需要下载的指标');
      return;
    }
    setExportDialogOpen(true);
  };

  // 发起指标调度 - 打开调度弹窗
  const handleDispatchSelectedMetrics = () => {
    if (selectedMetrics.size === 0) {
      alert('请先勾选需要调度的指标');
      return;
    }

    // 业务场景校验
    const selectedMetricsData = metrics.filter(m => selectedMetrics.has(m.id));
    const scenarios = [...new Set(selectedMetricsData.map(m => m.scenario))];

    if (scenarios.length > 1) {
      // 显示警告对话框
      setScenarioWarningDialog(true);
      return;
    }

    // 获取选中的指标数据
    const selectedIndicators = selectedMetricsData
      .map(m => ({
        id: m.id,
        name: m.name,
        period: m.period,
        scenario: m.scenario,
      }));
    setDispatchIndicators(selectedIndicators);
    setDispatchDrawerOpen(true);
  };

  // 处理导出确认
  const handleExportConfirm = (params: ExportParams) => {
    const selectedMetricsData = metrics.filter(m => selectedMetrics.has(m.id));
    console.log('导出参数:', params);
    console.log('选中的指标:', selectedMetricsData);
    // TODO: 实现实际的下载逻辑
    // 根据 params 导出数据
    const reportCount = (params.dayPeriod ? 1 : 0) + (params.monthPeriod ? 1 : 0);
    alert(`导出信息：\n日报表：${params.dayPeriod || '无'}\n月报表：${params.monthPeriod || '无'}\n共导出 ${reportCount} 份报表`);
  };

  const pageSize = 12; // 每页显示12个卡片

  // 从 URL 参数读取视图模式
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'metric' || viewParam === 'tree') {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // 滚动到指定的指标卡片
  useEffect(() => {
    const scrollToParam = searchParams.get('scrollTo');
    if (scrollToParam) {
      // 延迟滚动，确保DOM已渲染
      setTimeout(() => {
        const element = document.getElementById(`metric-${scrollToParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // 添加高亮效果
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
          }, 2000);
        }
      }, 300);
    }
  }, [searchParams]);

  // 指标组数据
  const metricGroups = [
    { id: 'group-1', name: '中高端客户运营指标组', description: '包含中高端客户的消费、使用行为等核心运营指标' },
    { id: 'group-2', name: '离网维系指标组', description: '包含客户离网预警、维系效果评估等指标' },
    { id: 'group-3', name: '用量运营指标组', description: '包含流量使用、语音使用等用量相关指标' },
    { id: 'group-4', name: '融合运营指标组', description: '包含融合套餐办理、融合渗透等指标' },
  ];

  // 当前登录用户
  const currentUser = 'admin';

  // 指标视图分页
  const [metricCurrentPage, setMetricCurrentPage] = useState(1);
  const metricPageSize = 12; // 每页显示12个指标卡片

  // 获取当前页的指标
  const getCurrentPageMetrics = () => {
    const filteredMetrics = getFilteredMetrics();
    const startIndex = (metricCurrentPage - 1) * metricPageSize;
    return filteredMetrics.slice(startIndex, startIndex + metricPageSize);
  };

  // 计算指标视图总页数
  const getMetricTotalPages = () => {
    const filteredMetrics = getFilteredMetrics();
    return Math.ceil(filteredMetrics.length / metricPageSize);
  };

  // 归属区域数据 - 全部（默认）+ 全疆（自治区）+ 16个地市分公司
  const regions: Region[] = [
    { id: 'all', name: '全部' },
    { id: 'group', name: '全疆' },
    { id: 'urumqi', name: '乌鲁木齐' },
    { id: 'karamay', name: '克拉玛依' },
    { id: 'turpan', name: '吐鲁番' },
    { id: 'hami', name: '哈密' },
    { id: 'changji', name: '昌吉' },
    { id: 'bortala', name: '博州' },
    { id: 'bayingolin', name: '巴州' },
    { id: 'aksu', name: '阿克苏' },
    { id: 'kizilsu', name: '克州' },
    { id: 'kashgar', name: '喀什' },
    { id: 'hotan', name: '和田' },
    { id: 'ili', name: '伊犁' },
    { id: 'tacheng', name: '塔城' },
    { id: 'altay', name: '阿勒泰' },
    { id: 'shihezi', name: '石河子' },

  ];

  // 业务场景数据
  const scenarios: BusinessScenario[] = [
    { id: 'mid-high-customer', name: '中高端客户运营', icon: TrendingUp, metricsCount: 2 },
    { id: 'international', name: '国际业务运营', icon: Phone, metricsCount: 2 },
    { id: 'churn-retention', name: '离网维系', icon: Users, metricsCount: 3 },
    { id: 'usage-operation', name: '用量运营', icon: Database, metricsCount: 4 },
    { id: 'convergence', name: '融合运营', icon: Zap, metricsCount: 2 },
    { id: 'segment-market', name: '细分市场运营', icon: FileText, metricsCount: 2 },
  ];

  // 计算每个场景的指标数量（用于指标视图）
  const getScenarioMetricsCount = (scenarioId: string): number => {
    return metrics.filter(metric => metric.scenario === scenarioId).length;
  };

  // 指标数据 - 包含所有必填字段
  const metrics: Metric[] = [
    {
      id: 'm001',
      name: '当月全量离网客户数',
      code: 'CHURN_COUNT',
      businessDefinition: '统计周期内全部离网客户数量',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '125,680',
      scenario: 'churn-retention',
      direction: '负向指标',
      previousValue: '147,500',
      latestPeriod: '2025-03',
      alerts: [
        {
          id: 'alert-1',
          metricName: '当月全量离网客户数',
          content: '本月离网客户数较上月增长15%，超过预警阈值',
          level: '红色',
        },
      ],
    },
    {
      id: 'm002',
      name: '离网率',
      code: 'CHURN_RATE',
      businessDefinition: '离网客户数占客户总数比例',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '2.35%',
      scenario: 'churn-retention',
      direction: '负向指标',
      previousValue: '2.45',
      latestPeriod: '2025-03',
    },
    {
      id: 'm003',
      name: 'ARPU',
      code: 'ARPU',
      businessDefinition: '每用户平均收入',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '元',
      value: '68.5',
      scenario: 'mid-high-customer',
      latestPeriod: '2025-03',
    },
    {
      id: 'm004',
      name: 'DOU',
      code: 'DOU',
      businessDefinition: '每用户平均流量',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: 'GB',
      value: '12.5',
      scenario: 'usage-operation',
      latestPeriod: '2025-03',
      alerts: [
        {
          id: 'alert-2',
          metricName: 'DOU',
          content: 'DOU环比下降8%，低于正常水平',
          level: '橙色',
        },
      ],
    },
    {
      id: 'm005',
      name: 'MOU',
      code: 'MOU',
      businessDefinition: '每用户平均通话时长',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '分钟',
      value: '285.6',
      scenario: 'usage-operation',
      latestPeriod: '2025-03',
    },
    {
      id: 'm006',
      name: '宽带渗透率',
      code: 'BB_PENETRATION',
      businessDefinition: '宽带用户占移动用户比例',
      granularity: '区县',
      period: '月',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '78.5%',
      scenario: 'convergence',
      latestPeriod: '2025-03',
    },
    {
      id: 'm007',
      name: '5G用户数',
      code: 'G5_USERS',
      businessDefinition: '5G网络用户数量',
      granularity: '省',
      period: '日',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '8,560,000',
      scenario: 'usage-operation',
      latestPeriod: '2025-03-21',
    },
    {
      id: 'm008',
      name: '5G渗透率',
      code: 'G5_PENETRATION',
      businessDefinition: '5G用户占总用户比例',
      granularity: '地市',
      period: '日',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '42.3%',
      latestPeriod: '2025-03-21',
      scenario: 'usage-operation',
      alerts: [
        {
          id: 'alert-3',
          metricName: '5G渗透率',
          content: '5G渗透率未达目标值（45%），需加强推广',
          level: '黄色',
        },
      ],
      alertRules: [
        {
          id: 'rule-1',
          ruleName: '5G渗透率低于45%预警',
          metricName: '5G渗透率',
          condition: '5G渗透率 < 45%',
          level: '黄色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm009',
      name: '离网客户数',
      code: 'CHURN_CUSTOMER_COUNT',
      businessDefinition: '统计周期内离网客户总数',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '2,580',
      scenario: 'churn-retention',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-2',
          ruleName: '离网客户数超过预警阈值',
          metricName: '离网客户数',
          condition: '离网客户数 > 3000',
          level: '红色',
          status: '启用',
        },
        {
          id: 'rule-3',
          ruleName: '离网客户数环比增长预警',
          metricName: '离网客户数',
          condition: '环比增长率 > 10%',
          level: '橙色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm010',
      name: '客户满意度',
      code: 'CUSTOMER_SATISFACTION',
      businessDefinition: '客户满意度评分',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '分',
      value: '92.5',
      scenario: 'churn-retention',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-4',
          ruleName: '客户满意度低于90分预警',
          metricName: '客户满意度',
          condition: '客户满意度 < 90',
          level: '橙色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm011',
      name: '月均流量',
      code: 'AVG_DATA_USAGE',
      businessDefinition: '用户月均使用流量',
      granularity: '地州',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: 'GB',
      value: '15.6',
      scenario: 'usage-operation',
      latestPeriod: '2025-03',
      // 无预警规则
    },
    {
      id: 'm012',
      name: '新增客户数',
      code: 'NEW_CUSTOMER_COUNT',
      businessDefinition: '统计周期内新增客户总数',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '8,560',
      scenario: 'mid-high-customer',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-5',
          ruleName: '新增客户数低于目标预警',
          metricName: '新增客户数',
          condition: '新增客户数 < 8000',
          level: '黄色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm013',
      name: '活跃客户数',
      code: 'ACTIVE_CUSTOMER_COUNT',
      businessDefinition: '统计周期内活跃客户总数',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '1,256,890',
      scenario: 'mid-high-customer',
      latestPeriod: '2025-03',
    },
    {
      id: 'm014',
      name: '在网时长',
      code: 'ONLINE_DURATION',
      businessDefinition: '客户平均在网时长',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '月',
      value: '36.5',
      scenario: 'mid-high-customer',
      latestPeriod: '2025-03',
    },
    {
      id: 'm015',
      name: '国际漫游收入',
      code: 'INTL_ROAMING_REVENUE',
      businessDefinition: '国际漫游业务收入',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '万元',
      value: '2,560',
      scenario: 'international',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-6',
          ruleName: '国际漫游收入低于预警阈值',
          metricName: '国际漫游收入',
          condition: '国际漫游收入 < 2000',
          level: '黄色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm016',
      name: '国际通话时长',
      code: 'INTL_CALL_DURATION',
      businessDefinition: '国际业务通话总时长',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '分钟',
      value: '856,920',
      scenario: 'international',
      latestPeriod: '2025-03',
    },
    {
      id: 'm017',
      name: '融合渗透率',
      code: 'CONVERGENCE_PENETRATION',
      businessDefinition: '融合业务客户渗透率',
      granularity: '区县',
      period: '月',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '35.6%',
      scenario: 'convergence',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-7',
          ruleName: '融合渗透率低于目标预警',
          metricName: '融合渗透率',
          condition: '融合渗透率 < 30%',
          level: '橙色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm018',
      name: '宽带用户数',
      code: 'BB_USER_COUNT',
      businessDefinition: '宽带业务用户总数',
      granularity: '省',
      period: '日',
      source: '一经系统',
      format: '数值',
      type: '值',
      unit: '户',
      value: '3,560,890',
      scenario: 'convergence',
      latestPeriod: '2025-03-21',
    },
    {
      id: 'm019',
      name: '年轻客群占比',
      code: 'YOUTH_CUSTOMER_RATIO',
      businessDefinition: '年轻客户群体占比',
      granularity: '省',
      period: '月',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '28.5%',
      scenario: 'segment-market',
      latestPeriod: '2025-03',
      alertRules: [
        {
          id: 'rule-8',
          ruleName: '年轻客群占比下降预警',
          metricName: '年轻客群占比',
          condition: '环比下降 > 5%',
          level: '蓝色',
          status: '启用',
        },
      ],
    },
    {
      id: 'm020',
      name: '银发客群占比',
      code: 'SENIOR_CUSTOMER_RATIO',
      businessDefinition: '银发客户群体占比',
      granularity: '地市',
      period: '月',
      source: '一经系统',
      format: '百分比',
      type: '占比',
      unit: '%',
      value: '15.8%',
      scenario: 'segment-market',
      latestPeriod: '2025-03',
    },
  ];

  // 指标树卡片数据 - 扩展到15个卡片以展示分页
  const metricTreeCards: MetricTreeCard[] = [
    {
      id: 'tree-1',
      title: '拍照中高端价值保有率指标树',
      description: '中高端客户价值保有率相关指标体系',
      thumbnail: '/assets/d227bca360d25fdf56645df3d67e115c.png',
      scenario: 'mid-high-customer',
      region: 'group',
      metricsCount: 5,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        {
          id: 'm1-1',
          name: '拍照中高端价值保有率',
          code: 'MH_VAL_RET_RATE',
          value: '85.6%',
          children: [
            { id: 'm1-1-1', name: '集团中高端价值保有率', code: 'MH_VAL_RET_RATE_GRP', value: '87.2%' },
            { id: 'm1-1-2', name: '拍照中高端价值保有率', code: 'MH_VAL_RET_RATE_CAM', value: '85.6%' },
          ]
        },
        { id: 'm1-2', name: '拍照中高端规模保有率', code: 'MH_SIZE_RET_RATE', value: '92.3%' },
        { id: 'm1-3', name: '当月拍照中高端离网客户数', code: 'MH_CHURN_CAM_MONTH', value: '12,580' },
        { id: 'm1-4', name: '拍照中高端存量规模', code: 'MH_STOCK_SIZE', value: '1,245,680' },
        { id: 'm1-5', name: '中高端客户ARPU', code: 'MH_ARPU', value: '126.5元' },
      ]
    },
    {
      id: 'tree-2',
      title: '当月全量离网客户数指标树',
      description: '全量客户离网情况统计指标',
      thumbnail: '/assets/3947d19f5f8345cf025f8e1e89331091.png',
      scenario: 'churn-retention',
      region: 'group',
      metricsCount: 4,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      creator: 'admin', // 当前用户创建
      alerts: [
        {
          id: 'tree-alert-1',
          metricName: '当月全量离网客户数',
          content: '当月全量离网客户数较上月增长15%，超过预警阈值（8%）',
          level: '红色',
        },
        {
          id: 'tree-alert-2',
          metricName: '离网率',
          content: '离网率环比上升0.3个百分点，需关注',
          level: '橙色',
        },
      ],
      metrics: [
        {
          id: 'm2-1',
          name: '当月全量离网客户数',
          code: 'TOTAL_CHURN_MONTH',
          value: '45,230',
          alerts: [
            {
              id: 'tree-alert-1',
              metricName: '当月全量离网客户数',
              content: '当月全量离网客户数较上月增长15%，超过预警阈值（8%）',
              level: '红色',
            },
          ],
        },
        {
          id: 'm2-2',
          name: '离网率',
          code: 'CHURN_RATE',
          value: '2.8%',
          alerts: [
            {
              id: 'tree-alert-2',
              metricName: '离网率',
              content: '离网率环比上升0.3个百分点，需关注',
              level: '橙色',
            },
          ],
        },
        { id: 'm2-3', name: '预警客户数', code: 'WARNING_COUNT', value: '125,680' },
        { id: 'm2-4', name: '预警客户覆盖率', code: 'WARNING_COVERAGE_RATE', value: '85.6%' },
      ]
    },
    {
      id: 'tree-3',
      title: '超套客户规模指标树',
      description: '流量超套客户相关指标',
      thumbnail: '',
      scenario: 'usage-operation',
      region: 'group',
      metricsCount: 4,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      alerts: [
        {
          id: 'tree-alert-3',
          metricName: '超套客户规模',
          content: '超套客户规模较上月增长20%，超过预警阈值（15%）',
          level: '黄色',
        },
      ],
      metrics: [
        {
          id: 'm3-1',
          name: '超套客户规模',
          code: 'OVER_PLAN_SIZE',
          value: '85,690',
          alerts: [
            {
              id: 'tree-alert-3',
              metricName: '超套客户规模',
              content: '超套客户规模较上月增长20%，超过预警阈值（15%）',
              level: '黄色',
            },
          ],
        },
        { id: 'm3-2', name: '超套客户占比', code: 'OVER_PLAN_RATIO', value: '15.6%' },
        { id: 'm3-3', name: '人均超套流量', code: 'AVG_OVER_USAGE', value: '3.2GB' },
        { id: 'm3-4', name: '超套增收金额', code: 'OVER_PLAN_REVENUE', value: '2,560万元' },
      ]
    },
    {
      id: 'tree-4',
      title: '宽移融合率指标树',
      description: '宽带移动融合业务指标',
      thumbnail: '',
      scenario: 'convergence',
      region: 'shandong',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm4-1', name: '宽移融合率', code: 'BROADBAND_MOBILE_CONV', value: '45.8%' },
        { id: 'm4-2', name: '融合客户规模', code: 'CONVERGENCE_SIZE', value: '2,456,890' },
        { id: 'm4-3', name: '三网融合渗透率', code: 'TRIPLE_PLAY_RATE', value: '28.5%' },
      ]
    },
    {
      id: 'tree-5',
      title: '国际漫游客户指标树',
      description: '国际业务运营相关指标',
      thumbnail: '',
      scenario: 'international',
      region: 'group',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm5-1', name: '国际漫游客户数', code: 'INTL_ROAM_COUNT', value: '156,890' },
        { id: 'm5-2', name: '国际流量使用量', code: 'INTL_DATA_USAGE', value: '2,456GB' },
        { id: 'm5-3', name: '国际业务收入', code: 'INTL_REVENUE', value: '8,560万元' },
      ]
    },
    {
      id: 'tree-6',
      title: '细分市场客群指标树',
      description: '不同客群细分市场运营指标',
      thumbnail: '',
      scenario: 'segment-market',
      region: 'guangdong',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      alerts: [
        {
          id: 'tree-alert-4',
          metricName: '年轻客群规模',
          content: '年轻客群规模环比下降5%，需关注客群流失',
          level: '蓝色',
        },
      ],
      metrics: [
        {
          id: 'm6-1',
          name: '年轻客群规模',
          code: 'YOUTH_SIZE',
          value: '3,256,890',
          alerts: [
            {
              id: 'tree-alert-4',
              metricName: '年轻客群规模',
              content: '年轻客群规模环比下降5%，需关注客群流失',
              level: '蓝色',
            },
          ],
        },
        { id: 'm6-2', name: '银发客群规模', code: 'ELDER_SIZE', value: '1,856,420' },
        { id: 'm6-3', name: '企业客群规模', code: 'ENTERPRISE_SIZE', value: '2,456,890' },
      ]
    },
    {
      id: 'tree-7',
      title: '家庭宽带业务指标树',
      description: '家庭宽带业务发展指标',
      thumbnail: '',
      scenario: 'convergence',
      region: 'jiangsu',
      metricsCount: 4,
      period: '日', // 根节点指标统计周期
      latestPeriod: '2025-03-21', // 根节点指标最新数据账期
      metrics: [
        { id: 'm7-1', name: '家庭宽带用户数', code: 'HOME_BB_USERS', value: '5,678,900' },
        { id: 'm7-2', name: '宽带渗透率', code: 'BB_PENETRATION', value: '78.5%' },
        { id: 'm7-3', name: '千兆用户占比', code: 'GIGABIT_RATIO', value: '35.6%' },
        { id: 'm7-4', name: '宽带ARPU', code: 'BB_ARPU', value: '68.5元' },
      ]
    },
    {
      id: 'tree-8',
      title: '5G用户发展指标树',
      description: '5G用户发展和渗透指标',
      thumbnail: '',
      scenario: 'usage-operation',
      region: 'zhejiang',
      metricsCount: 4,
      period: '日', // 根节点指标统计周期
      latestPeriod: '2025-03-21', // 根节点指标最新数据账期
      metrics: [
        { id: 'm8-1', name: '5G用户数', code: 'G5_USERS', value: '8,560,000' },
        { id: 'm8-2', name: '5G渗透率', code: 'G5_PENETRATION', value: '42.3%' },
        { id: 'm8-3', name: '5G流量占比', code: 'G5_FLOW_RATIO', value: '68.5%' },
        { id: 'm8-4', name: '5G用户ARPU', code: 'G5_ARPU', value: '89.2元' },
      ]
    },
    {
      id: 'tree-9',
      title: '政企客户指标树',
      description: '政企客户业务发展指标',
      thumbnail: '',
      scenario: 'segment-market',
      region: 'beijing',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm9-1', name: '政企客户规模', code: 'ENT_SCALE', value: '456,000' },
        { id: 'm9-2', name: '政企客户收入', code: 'ENT_REVENUE', value: '12.5亿' },
        { id: 'm9-3', name: '政企客户ARPU', code: 'ENT_ARPU', value: '274元' },
      ]
    },
    {
      id: 'tree-10',
      title: '渠道运营指标树',
      description: '渠道建设和运营效率指标',
      thumbnail: '/assets/3947d19f5f8345cf025f8e1e89331091.png',
      scenario: 'churn-retention',
      region: 'sichuan',
      metricsCount: 4,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm10-1', name: '自有渠道数', code: 'OWN_CHANNELS', value: '3,500' },
        { id: 'm10-2', name: '社会渠道数', code: 'SOCIAL_CHANNELS', value: '8,900' },
        { id: 'm10-3', name: '渠道覆盖率', code: 'CHANNEL_COVERAGE', value: '95.6%' },
        { id: 'm10-4', name: '单渠道产出', code: 'CHANNEL_OUTPUT', value: '15.6万' },
      ]
    },
    {
      id: 'tree-11',
      title: '客户满意度指标树',
      description: '客户满意度和服务质量指标',
      thumbnail: '/assets/3947d19f5f8345cf025f8e1e89331091.png',
      scenario: 'churn-retention',
      region: 'shanghai',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm11-1', name: '整体满意度', code: 'SATISFACTION', value: '92.5分' },
        { id: 'm11-2', name: '投诉处理及时率', code: 'COMPLAINT_RATE', value: '98.6%' },
        { id: 'm11-3', name: 'NPS值', code: 'NPS_VALUE', value: '45.6' },
      ]
    },
    {
      id: 'tree-12',
      title: '增值业务指标树',
      description: '增值业务发展和收入指标',
      thumbnail: '',
      scenario: 'usage-operation',
      region: 'guangdong',
      metricsCount: 4,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm12-1', name: '增值业务收入', code: 'VAS_REVENUE', value: '35.6亿' },
        { id: 'm12-2', name: '增值业务渗透率', code: 'VAS_PENETRATION', value: '56.8%' },
        { id: 'm12-3', name: '云业务用户数', code: 'CLOUD_USERS', value: '1,256,000' },
        { id: 'm12-4', name: '物联网连接数', code: 'IOT_CONNECTIONS', value: '8,560,000' },
      ]
    },
    {
      id: 'tree-13',
      title: '国际业务收入指标树',
      description: '国际业务收入和客户发展指标',
      thumbnail: '',
      scenario: 'international',
      region: 'guangdong',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm13-1', name: '国际业务总收入', code: 'INTL_REVENUE', value: '125.6亿' },
        { id: 'm13-2', name: '国际漫游收入', code: 'INTL_ROAM_REV', value: '45.6亿' },
        { id: 'm13-3', name: '国际业务用户数', code: 'INTL_USERS', value: '890,000' },
      ]
    },
    {
      id: 'tree-14',
      title: '存量客户运营指标树',
      description: '存量客户价值提升指标',
      thumbnail: '/assets/d227bca360d25fdf56645df3d67e115c.png',
      scenario: 'mid-high-customer',
      region: 'henan',
      metricsCount: 4,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm14-1', name: '存量客户规模', code: 'STOCK_SIZE', value: '25,600,000' },
        { id: 'm14-2', name: '存量客户ARPU', code: 'STOCK_ARPU', value: '78.5元' },
        { id: 'm14-3', name: '增值业务渗透率', code: 'VAS_PEN', value: '42.3%' },
        { id: 'm14-4', name: '融合渗透率', code: 'CONV_PEN', value: '38.6%' },
      ]
    },
    {
      id: 'tree-15',
      title: '新业务拓展指标树',
      description: '新兴业务发展指标',
      thumbnail: '',
      scenario: 'usage-operation',
      region: 'zhejiang',
      metricsCount: 3,
      period: '月', // 根节点指标统计周期
      latestPeriod: '2025-03', // 根节点指标最新数据账期
      metrics: [
        { id: 'm15-1', name: '数字收入占比', code: 'DIGITAL_REV_RATIO', value: '28.5%' },
        { id: 'm15-2', name: '云服务收入', code: 'CLOUD_REVENUE', value: '15.6亿' },
        { id: 'm15-3', name: 'AI应用用户数', code: 'AI_USERS', value: '560,000' },
      ]
    },
  ];

  // 获取当前展示的指标树卡片（筛选后）
  const getFilteredCards = () => {
    let filtered = metricTreeCards;

    // 按归属区域筛选
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(card => card.region === selectedRegion);
    }

    // 按业务场景筛选
    if (activeScenario !== 'all') {
      filtered = filtered.filter(card => card.scenario === activeScenario);
    }

    // 按账期筛选（仅指标树视图）
    if (viewMode === 'tree') {
      filtered = filtered.filter(card => {
        if (card.period === '日') {
          // 日指标树：匹配日账期
          return card.latestPeriod === dayPeriodFilter;
        } else if (card.period === '月') {
          // 月指标树：匹配月账期
          return card.latestPeriod === monthPeriodFilter;
        }
        return true;
      });
    }

    return filtered;
  };

  // 获取当前展示的指标（筛选后）
  const getFilteredMetrics = () => {
    let filtered = metrics;

    // 按业务场景筛选
    if (activeScenario !== 'all') {
      filtered = filtered.filter(metric => metric.scenario === activeScenario);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        metric =>
          metric.name.toLowerCase().includes(query) ||
          metric.code.toLowerCase().includes(query) ||
          metric.businessDefinition.toLowerCase().includes(query)
      );
    }

    // 按账期筛选（仅指标视图）
    if (viewMode === 'metric') {
      filtered = filtered.filter(metric => {
        if (metric.period === '日') {
          // 日指标：匹配日账期
          return metric.latestPeriod === dayPeriodFilter;
        } else if (metric.period === '月') {
          // 月指标：匹配月账期
          return metric.latestPeriod === monthPeriodFilter;
        }
        return true;
      });
    }

    return filtered;
  };

  // 获取当前页的卡片
  const getCurrentPageCards = () => {
    const filteredCards = getFilteredCards();
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCards.slice(startIndex, startIndex + pageSize);
  };

  // 计算总页数
  const getTotalPages = () => {
    const filteredCards = getFilteredCards();
    return Math.ceil(filteredCards.length / pageSize);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // 切换场景时重置到第一页
  const handleScenarioChange = (scenario: string) => {
    setActiveScenario(scenario);
    setCurrentPage(1);
  };

  // 切换归属区域时重置到第一页
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setCurrentPage(1);
  };

  // 递归获取所有指标节点（平铺）
  const flattenMetricNodes = (nodes: MetricTreeNode[]): MetricTreeNode[] => {
    const flattened: MetricTreeNode[] = [];
    const traverse = (node: MetricTreeNode) => {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child));
      }
    };
    nodes.forEach(node => traverse(node));
    return flattened;
  };

  // 渲染指标节点（平铺列表）
  const renderMetricNodes = (nodes: MetricTreeNode[]) => {
    const flattenedNodes = flattenMetricNodes(nodes);

    
    return (
      <div className="space-y-1">
        {flattenedNodes.map((node) => {
          const isChurnMetric = node.name === '当月全量离网客户数';
          const hasAlerts = node.alerts && node.alerts.length > 0;

          return (
            <div
              key={node.id}
              className={`flex items-center gap-1.5 py-1 px-1 hover:bg-gray-50 rounded transition-colors ${
                isChurnMetric ? 'hover:bg-blue-50 cursor-pointer' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡到卡片点击事件
                if (isChurnMetric) {
                  router.push('/portal/capability/insight/metric/m001?from=tree&view=tree');
                }
              }}
            >
              <FileText className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium truncate leading-tight ${isChurnMetric ? 'text-blue-600 hover:underline' : 'text-gray-900'}`}>
                  {node.name}
                </p>
                <p className="text-[8px] text-gray-500 leading-tight">{node.code}</p>
              </div>
              {node.value && (
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                    {node.value}
                  </Badge>
                </div>
              )}
              {hasAlerts && (
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAlertDialog({
                      open: true,
                      alerts: node.alerts!,
                      title: node.name,
                      sourceType: 'metric-tree',
                    });
                  }}
                >
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getScenarioName = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario?.name || scenarioId;
  };

  // 当场景改变时，重置当前页
  const totalPages = getTotalPages();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 面包屑导航 */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>能力中心</span>
          <span>/</span>
          <span>洞察中心</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">洞察总览</span>
        </div>
      </div>

      {/* 页面标题 */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">洞察总览</h1>
        <p className="text-sm text-gray-500 mt-1">
          {viewMode === 'tree' ? '全量场景指标树集合' : '全量场景指标集合'}
        </p>
      </div>

      {/* 搜索和筛选栏 */}
      <Card className="p-3 mb-5">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={viewMode === 'tree' ? "搜索指标树名称、指标..." : "搜索指标名称、编码..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* 筛选按钮 */}
          <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
            <Filter className="h-4 w-4" />
            筛选
          </Button>

          {/* 归属区域筛选 */}
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="归属区域" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 账期筛选 - 指标树视图和指标视图都显示 */}
          <>
            {/* 日账期筛选 */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 whitespace-nowrap">日账期</Label>
              <Input
                type="date"
                value={dayPeriodFilter}
                onChange={(e) => setDayPeriodFilter(e.target.value)}
                className="w-[140px] h-9 text-sm"
              />
            </div>
            {/* 月账期筛选 */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 whitespace-nowrap">月账期</Label>
              <Input
                type="month"
                value={monthPeriodFilter}
                onChange={(e) => setMonthPeriodFilter(e.target.value)}
                className="w-[120px] h-9 text-sm"
              />
            </div>
          </>

          {/* 统计信息 */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>业务场景: <strong>{scenarios.length}</strong></span>
            </div>
            {viewMode === 'tree' ? (
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>指标树总数: <strong>{getFilteredCards().length}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>指标总数: <strong>{getFilteredMetrics().length}</strong></span>
              </div>
            )}
          </div>

          {/* 创建按钮 - 根据视图模式显示 */}
          {viewMode === 'tree' ? (
            <Button
              onClick={() => setShowGroupDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 gap-2 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              创建指标树
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/portal/capability/insight/create-metric')}
                className="bg-blue-500 hover:bg-blue-600 gap-2 h-9 text-sm"
              >
                <Plus className="h-4 w-4" />
                创建指标
              </Button>
              <Button
                onClick={handleDownloadSelectedMetrics}
                variant="outline"
                className="gap-2 h-9 text-sm"
                disabled={selectedMetrics.size === 0}
              >
                <Download className="h-4 w-4" />
                下载 ({selectedMetrics.size})
              </Button>
              <Button
                onClick={handleDispatchSelectedMetrics}
                variant="outline"
                className="gap-2 h-9 text-sm"
                disabled={selectedMetrics.size === 0}
              >
                <Zap className="h-4 w-4" />
                发起指标调度 ({selectedMetrics.size})
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 视图切换按钮 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm font-medium text-gray-700">视图模式：</span>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'tree' ? 'bg-blue-500 hover:bg-blue-600 h-8' : 'h-8'}
            onClick={() => setViewMode('tree')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            指标树视图
          </Button>
          <Button
            variant={viewMode === 'metric' ? 'default' : 'outline'}
            size="sm"
            className={viewMode === 'metric' ? 'bg-blue-500 hover:bg-blue-600 h-8' : 'h-8'}
            onClick={() => setViewMode('metric')}
          >
            <Database className="h-4 w-4 mr-1" />
            指标视图
          </Button>
        </div>
      </div>

      {/* 业务场景分类标签 */}
      <Tabs value={activeScenario} onValueChange={handleScenarioChange} className="mb-5">
        <TabsList className="bg-white border h-auto p-1">
          <TabsTrigger value="all" className="gap-2 h-8 text-sm">
            <Database className="h-4 w-4" />
            全部
            <Badge variant="secondary" className="text-[10px] ml-1 h-4 px-1.5">
              {viewMode === 'tree' ? getFilteredCards().length : getFilteredMetrics().length}
            </Badge>
          </TabsTrigger>
          {scenarios.map(scenario => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="gap-2 h-8 text-sm">
              <scenario.icon className="h-4 w-4" />
              {scenario.name}
              <Badge variant="secondary" className="text-[10px] ml-1 h-4 px-1.5">
                {viewMode === 'tree' ? scenario.metricsCount : getScenarioMetricsCount(scenario.id)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 指标树卡片网格 - 4列布局 */}
      {viewMode === 'tree' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getCurrentPageCards().map(card => {
          const isChurnTree = card.id === 'tree-2'; // 当月全量离网客户数指标树
          return (
            <Card
              key={card.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${isChurnTree ? 'cursor-pointer group' : 'cursor-pointer group'}`}
              onClick={() => {
                if (isChurnTree) {
                  router.push(`/portal/capability/insight/edit-metric-tree/${card.id}`);
                }
              }}
            >
              {/* 缩略图区域 - 适当提高高度 */}
              <div className="relative h-36 bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors overflow-hidden">
                {card.thumbnail ? (
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-1.5" />
                      <p className="text-[10px] text-gray-500">指标树</p>
                    </div>
                  </div>
                )}
                <Badge className="absolute top-2 left-2 bg-white text-gray-900 text-[10px] px-2 py-0.5 h-5.5">
                  {getScenarioName(card.scenario)}
                </Badge>
                <Badge className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 h-5.5">
                  {card.metricsCount}个指标
                </Badge>
              </div>

              <CardHeader className="py-2 px-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 text-xs leading-tight">{card.title}</h3>
                    {/* 预警图标 */}
                    {card.alerts && card.alerts.length > 0 && (
                      <div
                        className="flex-shrink-0 cursor-pointer mt-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlertDialog({
                            open: true,
                            alerts: card.alerts!,
                            title: card.title,
                            sourceType: 'metric-tree',
                          });
                        }}
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* 编辑按钮 - 仅当前用户创建的离网相关卡片显示 */}
                    {card.creator === currentUser && card.scenario === 'churn-retention' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[9px] gap-0.5 h-6 px-1.5 text-gray-600 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/portal/capability/insight/edit-metric-tree/${card.id}`);
                        }}
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] gap-0.5 h-6 px-1.5 group-hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isChurnTree) {
                          router.push('/portal/churn-retention?from=insight-overview#all-churn');
                        } else if (card.title.includes('离网')) {
                          router.push('/workspace/retention/churn');
                        } else {
                          // TODO: 实现其他卡片的详情跳转
                        }
                      }}
                    >
                      查看详情
                      <ArrowRight className="h-2 w-2" />
                    </Button>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 line-clamp-2 mt-1 leading-tight">{card.description}</p>
              </CardHeader>

              {/* 指标预览区域 - 查看指标按钮 */}
              <div className="px-3 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[9px] gap-0.5 text-blue-600 hover:text-blue-700 h-6 px-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 打开指标详情弹窗
                    // 根据指标树标题判断默认账期类型
                    const hasDayMetric = card.title.includes('日') || card.metrics.some(m => m.period === '日');
                    const periodType = hasDayMetric ? 'day' : 'month';
                    const defaultPeriod = hasDayMetric ? getTMinus1Date() : getTMinus1Month();
                    setMetricTreeDetailDialog({
                      open: true,
                      card: card,
                      selectedPeriod: defaultPeriod,
                      periodType: periodType,
                    });
                  }}
                >
                  <BarChart3 className="h-2 w-2" />
                  查看指标({card.metrics.length})
                </Button>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      {/* 分页组件 */}
      {viewMode === 'tree' && totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer w-7 h-7 text-xs"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 空状态 */}
      {getFilteredCards().length === 0 && viewMode === 'tree' && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无指标树数据</p>
        </div>
      )}

      {/* 指标视图 */}
      {viewMode === 'metric' && (
        <div>
          {/* 指标卡片网格 - 4列布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getCurrentPageMetrics().map((metric) => {
              const hasAlerts = metric.alerts && metric.alerts.length > 0;
              return (
                <Card 
                  key={metric.id} 
                  id={`metric-${metric.id}`}
                  className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => handleMetricCardClick(metric.id)}
                >
                  {/* 顶部区域 */}
                  <div className="relative h-20 bg-gradient-to-br from-green-50 to-blue-50 group-hover:from-green-100 group-hover:to-blue-100 transition-colors p-2">
                    {/* 勾选框 */}
                    <div 
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => handleMetricSelect(metric.id, e)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                        selectedMetrics.has(metric.id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-white border-gray-300 hover:border-blue-500'
                      }`}>
                        {selectedMetrics.has(metric.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-between pr-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 text-xs line-clamp-1">{metric.name}</h3>
                          {hasAlerts && (
                            <div
                              className="flex-shrink-0 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAlertDialog({
                                  open: true,
                                  alerts: metric.alerts!,
                                  title: metric.name,
                                  sourceType: 'metric',
                                });
                              }}
                            >
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[8px] px-1 py-0 h-4 bg-white/80"
                      >
                        {metric.scenario === 'churn-retention' && '离网维系'}
                        {metric.scenario === 'mid-high-customer' && '中高端'}
                        {metric.scenario === 'usage-operation' && '用量运营'}
                        {metric.scenario === 'convergence' && '融合运营'}
                        {metric.scenario === 'international' && '国际业务'}
                        {metric.scenario === 'segment-market' && '细分市场'}
                      </Badge>
                    </div>
                    <div className="mt-1.5">
                      <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">环比</span>
                          <span className="text-xs font-medium text-green-600">+2.3%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">同比</span>
                          <span className="text-xs font-medium text-green-600">+5.1%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 内容区域 */}
                  <CardHeader className="py-1.5 px-2.5 pb-0">
                    <p className="text-[9px] text-gray-600 line-clamp-2 leading-tight">
                      {metric.businessDefinition}
                    </p>
                  </CardHeader>

                  <CardContent className="py-1.5 px-2.5">
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-500">编码</span>
                        <span className="text-gray-700">{metric.code}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-500">粒度</span>
                        <span className="text-gray-700">{metric.granularity}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-500">周期</span>
                        <span className="text-gray-700">{metric.period}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-500">类型</span>
                        <span className="text-gray-700">{metric.type}</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* 底部操作区 */}
                  <CardFooter className="py-1.5 px-2.5 pt-0">
                    <div className="w-full flex items-center justify-between">
                      {metric.alertRules && metric.alertRules.length > 0 ? (
                        <button
                          className="text-[9px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlertRulesDialog({
                              open: true,
                              rules: metric.alertRules!,
                              metricName: metric.name,
                              metricId: metric.id,
                            });
                          }}
                        >
                          <Database className="h-2.5 w-2.5" />
                          <span>查看预警规则 ({metric.alertRules.length})</span>
                        </button>
                      ) : (
                        <button
                          className="text-[9px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/portal/capability/insight/create-alert-rule?metricName=${encodeURIComponent(metric.name)}&metricId=${metric.id}`
                            );
                          }}
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>新增预警规则</span>
                        </button>
                      )}
                      <span className="text-gray-300">|</span>
                      <button
                        className="text-[9px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMetricAnalysisDialog({
                            open: true,
                            metric: metric,
                          });
                        }}
                      >
                        <BarChart3 className="h-2.5 w-2.5" />
                        <span>指标分析</span>
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* 空状态 */}
          {getFilteredMetrics().length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无指标数据</p>
            </div>
          )}

          {/* 分页组件 */}
          {getMetricTotalPages() > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setMetricCurrentPage(prev => Math.max(1, prev - 1))}
                      className={metricCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: getMetricTotalPages() }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setMetricCurrentPage(page)}
                        isActive={metricCurrentPage === page}
                        className="cursor-pointer w-7 h-7 text-xs"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setMetricCurrentPage(prev => Math.min(getMetricTotalPages(), prev + 1))}
                      className={metricCurrentPage === getMetricTotalPages() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* 预警弹窗 */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) => {
          // 如果Drawer打开且试图关闭Dialog，阻止操作
          if (dispatchDrawerOpen && !open) {
            return;
          }
          setAlertDialog({ ...alertDialog, open });
        }}
        modal={false}
      >
        {alertDialog.open && !dispatchDrawerOpen && (
          <div
            className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm"
            onClick={() => setAlertDialog({ ...alertDialog, open: false })}
          />
        )}
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {alertDialog.alerts.length > 1 ? '预警列表' : '预警详情'}
            </DialogTitle>
            <DialogDescription>
              {alertDialog.title && `${alertDialog.sourceType === 'metric-tree' ? '指标树' : '指标'}：${alertDialog.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {alertDialog.alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  index > 0 ? 'mt-3' : ''
                } ${
                  alert.level === '红色'
                    ? 'bg-red-50 border-red-200'
                    : alert.level === '橙色'
                    ? 'bg-orange-50 border-orange-200'
                    : alert.level === '黄色'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      alert.level === '红色'
                        ? 'text-red-600'
                        : alert.level === '橙色'
                        ? 'text-orange-600'
                        : alert.level === '黄色'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{alert.metricName}</span>
                      <Badge
                        className={`text-xs ${
                          alert.level === '红色'
                            ? 'bg-red-100 text-red-700'
                            : alert.level === '橙色'
                            ? 'bg-orange-100 text-orange-700'
                            : alert.level === '黄色'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {alert.level}预警
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{alert.content}</p>
                    <Button
                      onClick={() => {
                        setDispatchDrawerOpen(true);
                      }}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-xs"
                      size="sm"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      发起指标调度
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预警规则列表弹窗 */}
      <Dialog
        open={alertRulesDialog.open}
        onOpenChange={(open) => {
          // 如果Drawer打开且试图关闭Dialog，阻止操作
          if (alertRuleDrawerOpen && !open) {
            return;
          }
          setAlertRulesDialog({ ...alertRulesDialog, open });
        }}
        modal={false}
      >
        {alertRulesDialog.open && !alertRuleDrawerOpen && (
          <div
            className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm"
            onClick={() => setAlertRulesDialog({ ...alertRulesDialog, open: false })}
          />
        )}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              预警规则列表
            </DialogTitle>
            <DialogDescription>
              指标：{alertRulesDialog.metricName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-lg overflow-hidden">
              {alertRulesDialog.rules.length > 0 ? (
                <div className="divide-y">
                  {alertRulesDialog.rules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{rule.ruleName}</h4>
                          <Badge
                            className={`text-xs ${
                              rule.level === '红色'
                                ? 'bg-red-100 text-red-700'
                                : rule.level === '橙色'
                                ? 'bg-orange-100 text-orange-700'
                                : rule.level === '黄色'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {rule.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">触发条件：{rule.condition}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setSelectedAlertRule(rule);
                            setAlertRuleMode('view');
                            setAlertRuleDrawerOpen(true);
                          }}
                        >
                          查看详情
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setSelectedAlertRule(rule);
                            setAlertRuleMode('edit');
                            setAlertRuleDrawerOpen(true);
                          }}
                        >
                          修改
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无预警规则</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAlertRule(null);
                setAlertRuleMode('create');
                setAlertRuleDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              新增预警规则
            </Button>
            <Button
              onClick={() => setAlertRulesDialog({ ...alertRulesDialog, open: false })}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 指标分析弹窗 */}
      <Dialog
        open={metricAnalysisDialog.open}
        onOpenChange={(open) => {
          // 如果Drawer打开且试图关闭Dialog，阻止操作
          if (dispatchDrawerOpen && !open) {
            return;
          }
          setMetricAnalysisDialog({ ...metricAnalysisDialog, open });
        }}
        modal={false}
      >
        {metricAnalysisDialog.open && !dispatchDrawerOpen && (
          <div
            className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm"
            onClick={() => setMetricAnalysisDialog({ ...metricAnalysisDialog, open: false })}
          />
        )}
        <DialogContent
          className="!max-w-[1400px] w-full"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              指标分析
            </DialogTitle>
            <DialogDescription>
              指标：{metricAnalysisDialog.metric?.name}
            </DialogDescription>
          </DialogHeader>

          {/* 账期筛选行 */}
          {metricAnalysisDialog.metric && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">账期：</Label>
                <Select
                  value={analysisPeriodType}
                  onValueChange={(value: 'day' | 'month') => {
                    setAnalysisPeriodType(value);
                    // 切换时重置日期
                    if (value === 'month') {
                      setAnalysisDate(getTMinus1Month());
                    } else {
                      setAnalysisDate(getTMinus1Date());
                    }
                  }}
                  disabled
                >
                  <SelectTrigger className="w-[100px] h-9" disabled>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">日</SelectItem>
                    <SelectItem value="month">月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                {analysisPeriodType === 'day' ? (
                  <Input
                    type="date"
                    value={analysisDate}
                    onChange={(e) => setAnalysisDate(e.target.value)}
                    className="w-[180px] h-9"
                  />
                ) : (
                  <Input
                    type="month"
                    value={analysisDate}
                    onChange={(e) => setAnalysisDate(e.target.value)}
                    className="w-[180px] h-9"
                  />
                )}
              </div>
            </div>
          )}

          {metricAnalysisDialog.metric && (
            <div className="space-y-4 w-full">
              {/* 指标值、环比和同比展示行 */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">当前指标值</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metricAnalysisDialog.metric.value}{metricAnalysisDialog.metric.unit !== '%' && ` ${metricAnalysisDialog.metric.unit}`}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-300"></div>
                  {(() => {
                    const { value: yoyValue, color: yoyColor, icon: yoyIcon } = calculateChange(
                      metricAnalysisDialog.metric.value,
                      metricAnalysisDialog.metric.previousValue,
                      metricAnalysisDialog.metric.format,
                      metricAnalysisDialog.metric.direction
                    );
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">环比</div>
                        <div className="flex items-center gap-2">
                          {yoyIcon === 'up' ? (
                            <TrendingUp className={`h-5 w-5 ${yoyColor}`} />
                          ) : (
                            <TrendingDown className={`h-5 w-5 ${yoyColor}`} />
                          )}
                          <span className={`text-lg font-semibold ${yoyColor}`}>{yoyValue}</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="h-10 w-px bg-gray-300"></div>
                  {(() => {
                    // 同比暂时使用模拟数据，后续可以从API获取
                    const { value: yoyValue, color: yoyColor, icon: yoyIcon } = calculateChange(
                      metricAnalysisDialog.metric.value,
                      metricAnalysisDialog.metric.previousValue,
                      metricAnalysisDialog.metric.format,
                      metricAnalysisDialog.metric.direction
                    );
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">同比</div>
                        <div className="flex items-center gap-2">
                          {yoyIcon === 'up' ? (
                            <TrendingUp className={`h-5 w-5 ${yoyColor}`} />
                          ) : (
                            <TrendingDown className={`h-5 w-5 ${yoyColor}`} />
                          )}
                          <span className={`text-lg font-semibold ${yoyColor}`}>{yoyValue}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="text-xs text-gray-500">
                  统计周期：{metricAnalysisDialog.metric.period}
                </div>
              </div>

              {/* 判断是否应该显示区域维度 */}
              {(() => {
                const metric = metricAnalysisDialog.metric;

                // 判断逻辑：
                // 1. 如果选的是全国或集团，总是显示区域维度（地州数据）
                // 2. 如果选的是具体地州：
                //    - 如果指标粒度是'地州'，不显示区域维度（因为只能看这个地州的单一值）
                //    - 如果指标粒度是'地市'、'区县'或'网格'，显示区域维度（可以看该地州下的地市/区县/网格数据）
                const shouldShowRegionDimension = selectedRegion === 'all' || selectedRegion === 'group' ||
                  (selectedRegion !== 'all' && selectedRegion !== 'group' &&
                    metric.granularity &&
                    metric.granularity !== '省' && // 排除粒度为'省'的情况
                    metric.granularity !== '地州' && // 排除粒度为'地州'的情况
                    (metric.granularity.includes('地市') ||
                     metric.granularity.includes('区县') ||
                     metric.granularity.includes('网格')));

                // 获取区域维度的标题
                const regionTitle = selectedRegion === 'all' || selectedRegion === 'group'
                  ? '区域维度'
                  : `${regions.find(r => r.id === selectedRegion)?.name || selectedRegion}-地市维度`;

                // 根据选择的区域和粒度生成区域维度数据
                const generateRegionData = () => {
                  if (selectedRegion === 'all' || selectedRegion === 'group') {
                    // 全疆视角：显示16地市分公司数据
                    return [
                      { name: '乌鲁木齐', 指标值: 95.8, 环比: 2.3, 同比: 5.1 },
                      { name: '克拉玛依', 指标值: 98.2, 环比: 1.8, 同比: 4.7 },
                      { name: '吐鲁番', 指标值: 96.8, 环比: 2.1, 同比: 5.3 },
                      { name: '哈密', 指标值: 94.5, 环比: 1.5, 同比: 4.2 },
                      { name: '昌吉', 指标值: 93.8, 环比: 1.2, 同比: 3.8 },
                      { name: '博州', 指标值: 95.2, 环比: 1.9, 同比: 4.5 },
                      { name: '巴州', 指标值: 95.2, 环比: 2.0, 同比: 4.8 },
                      { name: '阿克苏', 指标值: 92.8, 环比: 1.1, 同比: 3.5 },
                      { name: '克州', 指标值: 95.6, 环比: 2.2, 同比: 4.9 },
                      { name: '喀什', 指标值: 97.5, 环比: 2.4, 同比: 5.5 },
                      { name: '和田', 指标值: 97.2, 环比: 2.5, 同比: 5.6 },
                      { name: '伊犁', 指标值: 96.3, 环比: 2.0, 同比: 4.9 },
                      { name: '塔城', 指标值: 96.8, 环比: 2.2, 同比: 5.2 },
                      { name: '阿勒泰', 指标值: 95.5, 环比: 1.7, 同比: 4.3 },
                      { name: '石河子', 指标值: 97.8, 环比: 2.6, 同比: 5.7 },

                    ];
                  } else {
                    // 地市视角：显示该地市下的区县数据
                    const selectedRegionName = regions.find(r => r.id === selectedRegion)?.name || selectedRegion;
                    const cities: Record<string, string[]> = {
                      'urumqi': ['天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区'],
                      'karamay': ['独山子区', '克拉玛依区', '白碱滩区', '乌尔禾区'],
                      'turpan': ['高昌区', '鄯善县', '托克逊县'],
                      'hami': ['伊州区', '巴里坤县', '伊吾县'],
                    };
                    const regionCities = cities[selectedRegion as keyof typeof cities] || ['区域A', '区域B', '区域C', '区域D', '区域E', '区域F'];

                    return regionCities.map((city, index) => ({
                      name: city,
                      指标值: (85 + Math.random() * 15).toFixed(1)
                    }));
                  }
                };

                // 生成前三后三数据
                const regionData = generateRegionData();
                const top3 = regionData.slice(0, 3);
                const bottom3 = regionData.slice(-3);

                return shouldShowRegionDimension ? (
                  /* 区域维度和时间维度并排显示 */
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {/* 区域维度 */}
                    <div className="border border-gray-200 rounded-lg p-4 min-w-0 overflow-hidden">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">{regionTitle}</h3>

                      {/* 柱状图 - 支持横向滚动 */}
                      <div className="overflow-x-auto min-w-0 w-full max-w-full">
                        <div className="h-[250px]" style={{ width: selectedRegion === 'all' || selectedRegion === 'group' ? '1550px' : '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData}>
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                interval={0}
                              />
                              <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 11, fill: '#6B7280' }}
                                />
                                <Tooltip
                                  formatter={(value: any, name: string) => {
                                    if (name === '指标值') {
                                      const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                      return [numValue.toFixed(2), name];
                                    }
                                    return [value, name];
                                  }}
                                  labelFormatter={(label: string) => {
                                    const item = regionData.find(d => d.name === label);
                                    if (!item) return label;
                                    const metricValue = typeof item.指标值 === 'string' ? parseFloat(item.指标值) : item.指标值;
                                    const momValue = '环比' in item ? item.环比 : 0;
                                    const yoyValue = '同比' in item ? item.同比 : 0;
                                    return `${label} - 指标值：${metricValue.toFixed(2)}，环比：+${momValue.toFixed(1)}%，同比：+${yoyValue.toFixed(1)}%`;
                                  }}
                                  contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                                <Bar dataKey="指标值" fill="#60B3E2" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                    {/* 时间维度 */}
                    <div className="border border-gray-200 rounded-lg p-4 min-w-0 overflow-hidden">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">时间维度（近6个月）</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { month: '202505', 指标值: 96.2 },
                        { month: '202506', 指标值: 96.4 },
                        { month: '202507', 指标值: 96.6 },
                        { month: '202508', 指标值: 96.7 },
                        { month: '202509', 指标值: 96.8 },
                        { month: '202510', 指标值: 96.99 }
                      ]}>
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="指标值"
                          stroke="#0085D0"
                          fill="#0085D0"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
                ) : (
                  /* 只显示时间维度（当选的是地州但指标无地市粒度数据时） */
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">时间维度（近6个月）</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { month: '202505', 指标值: 96.2 },
                          { month: '202506', 指标值: 96.4 },
                          { month: '202507', 指标值: 96.6 },
                          { month: '202508', 指标值: 96.7 },
                          { month: '202509', 指标值: 96.8 },
                          { month: '202510', 指标值: 96.99 }
                        ]}>
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="指标值"
                            stroke="#0085D0"
                            fill="#0085D0"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setDispatchDrawerOpen(true);
              }}
            >
              <Zap className="h-4 w-4 mr-1" />
              发起指标调度
            </Button>
            <Button
              variant="outline"
              onClick={() => setMetricAnalysisDialog({ ...metricAnalysisDialog, open: false })}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 指标调度抽屉 - 独立于Dialog */}
      <Drawer
        open={dispatchDrawerOpen}
        onOpenChange={setDispatchDrawerOpen}
        side="right"
        showCloseButton={true}
      >
        <DrawerHeader>
          <DrawerTitleComp>指标调度</DrawerTitleComp>
        </DrawerHeader>
        <DrawerContent>
          <IndicatorDispatchDialog
            open={dispatchDrawerOpen}
            onClose={() => setDispatchDrawerOpen(false)}
            indicators={dispatchIndicators.length > 0 ? dispatchIndicators : metricAnalysisDialog.metric ? [{id: metricAnalysisDialog.metric.id, name: metricAnalysisDialog.metric.name, period: metricAnalysisDialog.metric.period, scenario: metricAnalysisDialog.metric.scenario}] : undefined}
            containerMode={true}
            source="overview"
            scenario={dispatchIndicators.length > 0 ? dispatchIndicators[0]?.scenario : metricAnalysisDialog.metric?.scenario}
          />
        </DrawerContent>
      </Drawer>

      {/* 业务场景警告弹窗 */}
      <Dialog open={scenarioWarningDialog} onOpenChange={setScenarioWarningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-gray-900">提示</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">请选择同一个业务场景下的指标进行调度</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setScenarioWarningDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预警规则抽屉 - 独立于Dialog */}
      <Drawer
        open={alertRuleDrawerOpen}
        onOpenChange={setAlertRuleDrawerOpen}
        side="right"
        showCloseButton={true}
      >
        <DrawerHeader>
          <DrawerTitleComp>
            {alertRuleMode === 'view' ? '查看预警规则' : alertRuleMode === 'edit' ? '修改预警规则' : '新增预警规则'}
          </DrawerTitleComp>
        </DrawerHeader>
        <DrawerContent>
          <AlertRuleDrawerContent
            open={alertRuleDrawerOpen}
            onClose={() => setAlertRuleDrawerOpen(false)}
            metricName={alertRulesDialog.metricName}
            metricId={alertRulesDialog.metricId}
            mode={alertRuleMode}
            setMode={setAlertRuleMode}
            rule={selectedAlertRule}
            containerMode={true}
          />
        </DrawerContent>
      </Drawer>

      {/* 指标组选择弹窗 */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择指标组</DialogTitle>
            <DialogDescription>
              选择要创建的指标树所属的指标组
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedGroupId} onValueChange={setSelectedGroupId}>
              {metricGroups.map(group => (
                <div key={group.id} className="flex items-start space-x-3 py-2">
                  <RadioGroupItem value={group.id} id={group.id} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={group.id} className="font-medium cursor-pointer">
                      {group.name}
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGroupDialog(false);
                setSelectedGroupId('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                // 跳转到创建指标树页面，传递指标组ID
                router.push(`/portal/capability/insight/create-metric-tree?groupId=${selectedGroupId}`);
                setShowGroupDialog(false);
              }}
              disabled={!selectedGroupId}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 指标导出弹窗 */}
      <MetricExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        selectedMetrics={metrics.filter(m => selectedMetrics.has(m.id))}
        onExport={handleExportConfirm}
      />

      {/* 指标树详情弹窗 */}
      <Dialog
        open={metricTreeDetailDialog.open}
        onOpenChange={(open) => {
          setMetricTreeDetailDialog(prev => ({ ...prev, open }));
        }}
      >
        <DialogContent className="max-w-[800px] w-[800px] max-h-[80vh] overflow-hidden flex flex-col" disableMaxWidth>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {metricTreeDetailDialog.card?.title || '指标详情'}
            </DialogTitle>
            <DialogDescription>
              {metricTreeDetailDialog.card?.description || ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* 账期选择 */}
            <div className="flex items-center gap-4 px-1">
              <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">账期选择：</Label>
              {metricTreeDetailDialog.periodType === 'day' ? (
                <Input
                  type="date"
                  value={metricTreeDetailDialog.selectedPeriod}
                  onChange={(e) => {
                    setMetricTreeDetailDialog(prev => ({
                      ...prev,
                      selectedPeriod: e.target.value,
                    }));
                  }}
                  className="w-48"
                />
              ) : (
                <Input
                  type="month"
                  value={metricTreeDetailDialog.selectedPeriod}
                  onChange={(e) => {
                    setMetricTreeDetailDialog(prev => ({
                      ...prev,
                      selectedPeriod: e.target.value,
                    }));
                  }}
                  className="w-40"
                />
              )}
              <span className="text-xs text-gray-500">
                {metricTreeDetailDialog.periodType === 'day' ? '日指标账期' : '月指标账期'}
              </span>
            </div>

            {/* 指标列表 */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-12">序号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">指标编码</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">数值</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 w-20">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {metricTreeDetailDialog.card?.metrics && flattenMetricNodes(metricTreeDetailDialog.card.metrics).map((node, index) => {
                    const hasAlert = node.alerts && node.alerts.length > 0;
                    return (
                      <tr key={node.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{node.name}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{node.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{node.value || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          {hasAlert ? (
                            <div
                              className="inline-flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setAlertDialog({
                                  open: true,
                                  alerts: node.alerts!,
                                  title: node.name,
                                  sourceType: 'metric-tree',
                                });
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          ) : (
                            <Check className="h-4 w-4 text-green-500 inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMetricTreeDetailDialog(prev => ({ ...prev, open: false }))}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InsightOverviewPageWrapper() {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InsightOverviewPage />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
