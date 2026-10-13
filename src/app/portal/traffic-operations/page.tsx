'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Expand, Minimize, Network, GitBranch, AlertCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Settings, Edit2, X, Lightbulb, Activity, Target, ChevronRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area, LabelList, Label, ReferenceLine } from 'recharts';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';
import { textConfig } from '@/config/textConfig';
import { getInitialIndicatorTreeData, generateAnalysisData, analysisData } from '@/data/trafficAnalysisUtils';
import IndicatorDispatchDialog from '@/components/IndicatorDispatchDialog';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import BusinessOpportunityTab from './components/BusinessOpportunityTab';
import RegionAssaultTab from './components/RegionAssaultTab';
import StrategyDispatchDialog from '@/components/strategy/StrategyDispatchDialog';

// 类型定义
interface MetricData {
  id: number;
  name: string;
  value: string;
  yoy: string;
  yoyUnit?: string;
  yoyLabel?: string; // 同比或环比
  status: 'normal' | 'warning' | 'danger';
  color: string;
  chartType: 'line' | 'barline';
  chartData: Array<{ month: string; value?: number; revenue?: number; retainRate?: number; scale?: number }>;
  businessScope?: string; // 业务口径说明
  hasEntrances?: boolean; // 是否有入口（去调度、指标树分析、告警）
}

interface SegmentData {
  segment: string;
  scale: number;
  yoy: string;
  status: 'normal' | 'warning';
  businessScope: string;
}

// 自定义 Tooltip 组件 - 优先使用图表的name属性，否则使用keyMap映射
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 判断是否是饼图（通过 payload 中是否有 name 字段）
    const isPieChart = payload.length === 1 && payload[0].payload && payload[0].payload.name;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        {label && !isPieChart && <p className="text-xs text-gray-600 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => {
          // 优先使用图表组件的name属性，否则使用keyMap映射
          const keyMap: Record<string, { name: string; unit: string }> = {
            'value': { name: '规模', unit: '' },
            'rate': { name: '环比', unit: '%' },
            'yoy': { name: '同比', unit: '%' },
            'qoq': { name: '环比', unit: '%' },
            'mom': { name: '环比', unit: '%' },
            'yoyRate': { name: '同比', unit: '%' },
            'monthlyAvg': { name: '环比', unit: '%' },
            'age': { name: '年龄', unit: '岁' },
            'arpu': { name: 'ARPU', unit: '元' },
            'scale': { name: '本月扩容规模', unit: '户' },
            'name': { name: '名称', unit: '' },
            'progressGap': { name: '完成率偏差', unit: 'pp' }
          };
          
          // 优先使用图表组件的name属性
          const displayName = entry.name || keyMap[entry.dataKey]?.name || entry.dataKey;
          let unit = entry.name ? (entry.dataKey === 'yoy' || entry.dataKey === 'qoq' || entry.dataKey === 'mom' || entry.dataKey === 'yoyRate' ? '%' : '') : (keyMap[entry.dataKey]?.unit || '');
          
          // 特殊处理：如果数据本身带有单位信息，使用数据的单位
          if (entry.payload && entry.payload.unit) {
            unit = entry.payload.unit;
          }
          
          // 特殊处理：rate 字段总是使用 %
          if (entry.dataKey === 'rate') {
            unit = '%';
          }
          
          // 特殊处理：progressGap 字段显示整数
          if (entry.dataKey === 'progressGap') {
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700">{displayName}:</span>
                <span className="font-semibold text-gray-900">
                  {entry.value > 0 ? '+' : ''}{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{unit}
                </span>
              </div>
            );
          }
          
          // 饼图特殊处理：直接显示分类名称
          if (isPieChart && entry.payload && entry.payload.name) {
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-semibold text-gray-900">
                  {entry.payload.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{unit}
                </span>
              </div>
            );
          }
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{displayName}:</span>
              <span className="font-semibold text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// 根据图片识别结果更新的整体指标数据
const overallMetrics: MetricData[] = [
  {
    id: 1,
    name: '当月日均流量(亿MB)',
    value: '3.68万',
    yoy: '+0.32',
    yoyUnit: '',
    yoyLabel: '环比',
    status: 'normal',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '月均ARPU≥50元且不限量套餐的客户数',
    chartData: [
      { month: '202510', value: 3.52 },
      { month: '202511', value: 3.56 },
      { month: '202512', value: 3.58 },
      { month: '202601', value: 3.61 },
      { month: '202602', value: 3.65 },
      { month: '202603', value: 3.68 }
    ]
  },
  {
    id: 2,
    name: '拍照中高端综合保有率',
    value: '98.8%',
    yoy: '+1.2',
    yoyUnit: 'pp',
    yoyLabel: '环比',
    status: 'normal',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '拍照中高端客户中，保持中高端属性的客户占比',
    chartData: [
      { month: '202510', value: 97.5 },
      { month: '202511', value: 97.8 },
      { month: '202512', value: 98.1 },
      { month: '202601', value: 98.3 },
      { month: '202602', value: 98.6 },
      { month: '202603', value: 98.8 }
    ]
  },
  {
    id: 3,
    name: '拍照中高端价值保有率',
    value: '97.5%',
    yoy: '+0.5',
    yoyUnit: 'pp',
    status: 'normal',
    color: '#0066CC',
    chartType: 'barline',
    businessScope: '拍照中高端客户中，本月收入≥上月收入的客户占比',
    hasEntrances: true,
    chartData: [
      { month: '202510', revenue: 2, retainRate: 99 },
      { month: '202511', revenue: 4, retainRate: 98.5 },
      { month: '202512', revenue: 1, retainRate: 97.5 },
      { month: '202601', revenue: 4, retainRate: 99 },
      { month: '202602', revenue: 5, retainRate: 98.5 },
      { month: '202603', revenue: 4, retainRate: 97.5 }
    ]
  },
  {
    id: 4,
    name: '拍照中高端规模保有率',
    value: '97.5%',
    yoy: '-1.0',
    yoyUnit: '',
    status: 'normal',
    color: '#0066CC',
    chartType: 'barline',
    businessScope: '拍照中高端客户中，本月仍为中高端的客户占比',
    chartData: [
      { month: '202510', scale: 1, retainRate: 99.5 },
      { month: '202511', scale: 2, retainRate: 99 },
      { month: '202512', scale: 3, retainRate: 98.5 },
      { month: '202601', scale: 4, retainRate: 98 },
      { month: '202602', scale: 5, retainRate: 98.5 },
      { month: '202603', scale: 7, retainRate: 97.5 }
    ]
  }
];

// 价值提升数据
const valueEnhancementData = {
  // 正向提值
  positive: {
    // 升档增收（左侧）
    upgrade: {
      // 上方：当年累计泛升档
      cumulativeUpgrade: {
        name: '当年累计泛升档',
        value: '2000万',
        businessScope: '当年所有中高端客户套餐档次提升产生的收入累计总和'
      },
      // 下方：月升档趋势
      monthlyTrend: {
        name: '月升档趋势',
        businessScope: '每月中高端客户套餐档次提升产生的收入',
        chartData: [
          { month: '202510', value: 350, rate: 2.5 },
          { month: '202511', value: 380, rate: 3.1 },
          { month: '202512', value: 365, rate: -1.2 },
          { month: '202601', value: 395, rate: 3.5 },
          { month: '202602', value: 410, rate: 2.8 },
          { month: '202603', value: 400, rate: -1.0 }
        ]
      }
    },
    // 主套升档（右侧上方）
    mainPackage: {
      monthly: {
        name: '当月主套升档',
        value: '816万',
        yoy: '+1.1%',
        businessScope: '当月主套餐档次提升的客户数量'
      },
      cumulative: {
        name: '当年累计主套升档',
        value: '1245万',
        yoy: '+1.1%',
        businessScope: '当年主套餐档次提升的客户数量累计'
      }
    },
    // 叠加态升档（右侧下方）
    superposition: {
      monthly: {
        name: '当月叠加态升档',
        value: '916万',
        yoy: '+1.1%',
        businessScope: '当月叠加态套餐档次提升的客户数量'
      },
      cumulative: {
        name: '当年叠加态升档',
        value: '1088万',
        yoy: '+1.1%',
        businessScope: '当年叠加态套餐档次提升的客户数量累计'
      }
    }
  },
  // 逆向控损
  reverse: {
    // 降档损收（左侧）
    downgradeLoss: {
      // 上方：当年累计主套降档
      cumulativeDowngrade: {
        name: '当年累计主套降档',
        value: '6000万',
        businessScope: '当年所有中高端客户主套餐档次降低产生的收入减少累计总和'
      },
      // 下方：月降档趋势
      monthlyTrend: {
        name: '月降档趋势',
        businessScope: '每月中高端客户主套餐档次降低产生的收入减少',
        chartData: [
          { month: '202510', value: 980, rate: -0.8 },
          { month: '202511', value: 1000, rate: 1.2 },
          { month: '202512', value: 1020, rate: 1.0 },
          { month: '202601', value: 1015, rate: -0.3 },
          { month: '202602', value: 1030, rate: 0.5 },
          { month: '202603', value: 1025, rate: -0.2 }
        ]
      }
    },
    // 降档客户ARPU流向（右侧）
    arpuFlow: {
      name: '降档客户ARPU流向',
      flowData: [
        { from: '200以上', to: '50以下', value: 320 },
        { from: '200以上', to: '50-99', value: 280 },
        { from: '200以上', to: '70-79', value: 150 },
        { from: '160-200', to: '50以下', value: 240 },
        { from: '160-200', to: '50-99', value: 200 },
        { from: '160-200', to: '70-79', value: 120 },
        { from: '120-160', to: '50以下', value: 180 },
        { from: '120-160', to: '50-99', value: 160 },
        { from: '120-160', to: '70-79', value: 100 },
        { from: '80-100', to: '50以下', value: 120 },
        { from: '80-100', to: '50-99', value: 140 },
        { from: '80-100', to: '70-79', value: 80 }
      ],
      leftRanges: ['200以上', '160-200', '120-160', '80-100'],
      rightRanges: ['50-99', '70-79', '50以下']
    }
  }
};

// 规模发展数据
const scaleDevelopmentData = {
  // 促新增
  promoteNew: {
    // 新入网（左侧）
    newEntry: {
      // 上方：累计新入网中高端
      cumulative: {
        name: '累计新入网中高端',
        value: '2000万',
        businessScope: '当年新入网且为中高端客户的数量累计'
      },
      // 下方：月新增入网中高端客户规模
      monthly: {
        name: '月新增入网中高端客户规模',
        businessScope: '每月新入网且为中高端客户的数量',
        chartData: [
          { month: '202510', value: 320 },
          { month: '202511', value: 350 },
          { month: '202512', value: 370 },
          { month: '202601', value: 385 },
          { month: '202602', value: 395 },
          { month: '202603', value: 380 }
        ]
      }
    },
    // 价值跃迁（右侧）
    valueJump: {
      // 上方：非中高端客户变为中高端
      cumulative: {
        name: '非中高端客户变为中高端',
        value: '1800万',
        businessScope: '当年从非中高端客户转变为中高端客户的数量累计'
      },
      // 下方：非中高端客户变为中高端
      monthly: {
        name: '非中高端客户变为中高端',
        businessScope: '每月从非中高端客户转变为中高端客户的数量',
        chartData: [
          { month: '202510', value: 280 },
          { month: '202511', value: 310 },
          { month: '202512', value: 330 },
          { month: '202601', value: 345 },
          { month: '202602', value: 355 },
          { month: '202603', value: 340 }
        ]
      }
    }
  },
  // 防流失
  preventLoss: {
    // 离网流失（左侧）
    churn: {
      // 上方两个指标小卡片
      cumulativeLoss: {
        name: '存量中高端客户累计流失',
        value: '2219.27万',
        businessScope: '当年存量中高端客户流失的数量累计'
      },
      lossRate: {
        name: '存量中高端客户流失率',
        value: '5.23%',
        businessScope: '流失客户数量/存量中高端客户总数×100%'
      },
      // 下方：离网趋势
      trend: {
        name: '离网趋势',
        businessScope: '每月中高端客户流失数量的变化趋势',
        chartData: [
          { month: '202510', value: 365 },
          { month: '202511', value: 380 },
          { month: '202512', value: 370 },
          { month: '202601', value: 375 },
          { month: '202602', value: 360 },
          { month: '202603', value: 369 }
        ]
      }
    },
    // 降档流出（右侧）
    downgradeOutflow: {
      // 上方两个指标小卡片
      cumulativeDowngrade: {
        name: '存量中高端客户降档变为非中高端',
        value: '2219.27万',
        businessScope: '当年存量中高端客户降档为非中高端客户的数量累计'
      },
      downgradeRate: {
        name: '存量中高端降档流失率',
        value: '5.23%',
        businessScope: '降档为非中高端客户数量/存量中高端客户总数×100%'
      },
      // 下方：降档趋势
      trend: {
        name: '降档趋势',
        businessScope: '每月中高端客户降档为非中高端客户数量的变化趋势',
        chartData: [
          { month: '202510', value: 365 },
          { month: '202511', value: 380 },
          { month: '202512', value: 370 },
          { month: '202601', value: 375 },
          { month: '202602', value: 360 },
          { month: '202603', value: 369 }
        ]
      }
    }
  }
};

// 融合加固数据
const integrationData = {
  valid: {
    name: '有效融合趋势',
    businessScope: '中高端客户中至少使用一种融合产品的占比',
    chartData: [
      { month: '202510', value: 68.5 },
      { month: '202511', value: 69.2 },
      { month: '202512', value: 70.1 },
      { month: '202601', value: 70.8 },
      { month: '202602', value: 71.5 },
      { month: '202603', value: 72.3 }
    ]
  },
  base: {
    name: '基座融合趋势',
    businessScope: '中高端客户中使用基座融合产品（如宽带）的占比',
    chartData: [
      { month: '202510', value: 45.2 },
      { month: '202511', value: 46.1 },
      { month: '202512', value: 46.8 },
      { month: '202601', value: 47.5 },
      { month: '202602', value: 48.2 },
      { month: '202603', value: 49.0 }
    ]
  },
  member: {
    name: '成员融合趋势',
    businessScope: '中高端客户中使用成员融合产品的占比',
    chartData: [
      { month: '202510', value: 38.5 },
      { month: '202511', value: 39.2 },
      { month: '202512', value: 40.0 },
      { month: '202601', value: 40.8 },
      { month: '202602', value: 41.5 },
      { month: '202603', value: 42.3 }
    ]
  },
  newEntry: {
    name: '新入网融合趋势',
    businessScope: '新入网中高端客户中使用融合产品的占比',
    chartData: [
      { month: '202510', value: 52.3 },
      { month: '202511', value: 53.1 },
      { month: '202512', value: 53.9 },
      { month: '202601', value: 54.8 },
      { month: '202602', value: 55.5 },
      { month: '202603', value: 56.2 }
    ]
  }
};

// 客群看管数据（根据图片识别更新）
const segmentData: SegmentData[] = [
  { segment: '我号异宽客户', scale: 9557.44, yoy: '+1.2%', status: 'normal', businessScope: '使用移动号码但使用异网宽带的客户' },
  { segment: '长期低饱和度客户', scale: 6052.73, yoy: '+1.2%', status: 'normal', businessScope: 'ARPU长期低于套餐价值50%的客户' },
  { segment: '异网主卡客户', scale: 1320.4, yoy: '+1.2%', status: 'normal', businessScope: '主卡为异网号码的客户' },
  { segment: '宽带到期未续约客户', scale: 480.2, yoy: '+1.2%', status: 'normal', businessScope: '宽带合约到期且未续约的客户' },
  { segment: '零融合客户', scale: 3646.28, yoy: '+1.2%', status: 'normal', businessScope: '仅有移动业务，无融合产品的客户' },
  { segment: '潜在降档客户', scale: 4238.25, yoy: '+1.2%', status: 'normal', businessScope: '使用行为出现降档特征，有降档风险的客户' }
];

// 指标树与动态分析数据：已提取至 @/data/trafficAnalysisUtils 共享模块

// 概览Tab内容（流量运营专用）
function OverviewTab({ isEditMode, onJumpToTree }: { isEditMode?: boolean; onJumpToTree: (indicatorName: string) => void }) {
  // 去调度弹窗状态
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [currentIndicatorName, setCurrentIndicatorName] = useState('');

  // 指标说明配置
  const indicatorDescriptions: Record<string, string> = {
    '当月上网流量增幅': '当月上网流量同比增幅，反映流量增长速度与市场竞争力',
    '累计上网流量增幅': '年初至当月累计上网流量同比增幅，反映整体流量增长趋势',
    '累计流量份额': '本省流量占全网流量的比例，反映市场份额',
    '累计通服流量收入': '当年截至当月的累计通信服务收入，反映整体收入规模与增长趋势',
    '出账客户数': '当月有出账记录的客户总数，反映客户规模基础',
    '上网客户数': '当月有上网行为的客户数，反映活跃客户规模',
    '流量收入': '当月流量相关收入，反映流量变现能力',
    '流量单价': '单位流量的平均收入，反映流量定价水平',
    '当月DOU': '当月户均流量（Data of Usage），反映客户流量消费水平',
    '整体饱和度': '套餐内流量使用比例，反映套餐匹配度',
    '当月月均流量': '当月总流量的日均值，反映整体流量规模',
    '超高流量占比（DOU≥300GB）': '高流量客户占比，反映流量消费结构',
    '23类客户三扩三融率': '23类客群三扩三融已运营客户规模 / 拍照25年12月客户规模',
    '超套规模': '套餐超额使用流量的客户规模',
    '地板价规模': '使用最低资费套餐的客户规模',
    '超高流量': '月流量超过特定阈值的客户规模',
    '全球通': '全球通品牌客户规模',
    '拆弹计划': '针对高风险客户群的挽留计划完成率',
    '行业增幅': '全行业流量同比增长率',
    'YD增幅': '移动公司流量同比增长率',
    'DX增幅': '电信公司流量同比增长率',
    'LT增幅': '联通公司流量同比增长率',
    '流量来源占比': '不同来源渠道对流量增长的贡献度分布',
  };

  // 打开去调度弹窗
  const handleOpenDispatch = (indicatorName: string) => {
    setCurrentIndicatorName(indicatorName);
    setDispatchDialogOpen(true);
  };

  // 核心指标趋势数据
  const coreMetricsTrendData = [
    { month: '202602', target: 6.0, actual: 7.5, gap: 1.5, actualYoy: 0.3, gapYoy: 0.1, dailyTraffic: 18.6, dailyTrafficYoy: 1.8, customers: 2186, customersYoy: 0.3, onlineCustomers: 1856, onlineCustomersYoy: 0.8, revenue: 10.8, revenueYoy: 2.5, unitPrice: 4.9, unitPriceYoy: -0.8 },
    { month: '202603', target: 6.0, actual: 7.2, gap: 1.2, actualYoy: -0.2, gapYoy: -0.2, dailyTraffic: 18.2, dailyTrafficYoy: -1.6, customers: 2188, customersYoy: 0.1, onlineCustomers: 1842, onlineCustomersYoy: -0.3, revenue: 10.6, revenueYoy: -1.6, unitPrice: 5.0, unitPriceYoy: 0.2 },
    { month: '202612', target: 6.0, actual: 7.8, gap: 1.8, actualYoy: 0.8, gapYoy: 0.5, dailyTraffic: 19.1, dailyTrafficYoy: 5.6, customers: 2196, customersYoy: 0.3, onlineCustomers: 1868, onlineCustomersYoy: 1.0, revenue: 11.0, revenueYoy: 5.0, unitPrice: 4.7, unitPriceYoy: -5.9 },
    { month: '202601', target: 6.0, actual: 7.4, gap: 1.4, actualYoy: -0.5, gapYoy: -0.2, dailyTraffic: 18.4, dailyTrafficYoy: -2.6, customers: 2192, customersYoy: -0.1, onlineCustomers: 1850, onlineCustomersYoy: -0.5, revenue: 10.7, revenueYoy: -2.4, unitPrice: 4.8, unitPriceYoy: 2.1 },
    { month: '202606', target: 6.0, actual: 7.9, gap: 1.9, actualYoy: 0.7, gapYoy: 0.4, dailyTraffic: 19.5, dailyTrafficYoy: 4.6, customers: 2208, customersYoy: 0.4, onlineCustomers: 1880, onlineCustomersYoy: 1.1, revenue: 11.3, revenueYoy: 4.9, unitPrice: 4.6, unitPriceYoy: -4.1 },
    { month: '202607', target: 6.0, actual: 7.8, gap: 1.8, actualYoy: -0.1, gapYoy: -0.1, dailyTraffic: 19.3, dailyTrafficYoy: -0.8, customers: 2202, customersYoy: -0.1, onlineCustomers: 1876, onlineCustomersYoy: -0.2, revenue: 11.2, revenueYoy: -0.8, unitPrice: 4.7, unitPriceYoy: 2.1 }
  ];

  // 流量来源渠道数据
  const trafficSourceChannelData = [
    { name: '视频', value: 42 },
    { name: '社交', value: 23 },
    { name: '游戏', value: 12 },
    { name: '音乐', value: 8 },
    { name: '浏览', value: 15 }
  ];

  // 流量运营核心指标数据 - 基于Excel数据和电信行业最佳实践
  // 主题1：流量规模核心指标
  const trafficScaleMetrics = [
    {
      id: 1,
      name: '当月日均流量',
      value: '18.6',
      unit: '亿MB',
      yoy: '+2.3',
      yoyUnit: '%',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '当月日均流量规模，反映整体流量消费水平',
      hasEntrances: true,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 16.2 },
        { month: '202511', value: 16.8 },
        { month: '202512', value: 17.2 },
        { month: '202601', value: 17.5 },
        { month: '202602', value: 18.1 },
        { month: '202603', value: 18.6 }
      ]
    },
    {
      id: 2,
      name: '出账>0客户数',
      value: '2,186',
      unit: '万',
      yoy: '+1.2',
      yoyUnit: '%',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '当月出账收入>0的客户规模',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 2120 },
        { month: '202511', value: 2135 },
        { month: '202512', value: 2152 },
        { month: '202601', value: 2165 },
        { month: '202602', value: 2175 },
        { month: '202603', value: 2186 }
      ]
    },
    {
      id: 3,
      name: '上网客户数',
      value: '1,856',
      unit: '万',
      yoy: '+1.8',
      yoyUnit: '%',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'line' as const,
      businessScope: '当月产生流量使用的客户数',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 1780 },
        { month: '202511', value: 1795 },
        { month: '202512', value: 1810 },
        { month: '202601', value: 1825 },
        { month: '202602', value: 1840 },
        { month: '202603', value: 1856 }
      ]
    },
    {
      id: 4,
      name: '当月DOU',
      value: '16.8',
      unit: 'GB',
      yoy: '+0.3',
      yoyUnit: 'GB',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'barline' as const,
      businessScope: '户均月流量使用量，反映用户活跃度',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 14.5, yoy: 2.8 },
        { month: '202511', value: 14.8, yoy: 2.1 },
        { month: '202512', value: 14.9, yoy: 0.7 },
        { month: '202601', value: 15.0, yoy: 0.7 },
        { month: '202602', value: 15.1, yoy: 0.7 },
        { month: '202603', value: 15.2, yoy: 0.7 }
      ]
    },
    {
      id: 5,
      name: '整体饱和度',
      value: '76.8',
      unit: '%',
      yoy: '+2.3',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF9500',
      chartType: 'line' as const,
      businessScope: '套内流量使用率，>100%超套，<50%低饱和',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 74.2 },
        { month: '202511', value: 75.8 },
        { month: '202512', value: 76.5 },
        { month: '202601', value: 77.2 },
        { month: '202602', value: 77.8 },
        { month: '202603', value: 78.5 }
      ]
    },
    {
      id: 6,
      name: '超高流量客户占比',
      value: '10.8',
      unit: '%',
      yoy: '+0.8',
      yoyUnit: '%',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '高流量客户占比，反映高价值客户规模',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 10.2 },
        { month: '202511', value: 10.8 },
        { month: '202512', value: 11.2 },
        { month: '202601', value: 11.6 },
        { month: '202602', value: 12.0 },
        { month: '202603', value: 12.3 }
      ]
    }
  ];

  // 主题2：流量增长质量分析
  const trafficGrowthMetrics = [
    {
      id: 1,
      name: '当月流量同比增幅到达值',
      value: '8.5',
      unit: '%',
      yoy: '+0.3',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'line' as const,
      businessScope: '当月流量同比增幅，反映流量增长趋势',
      hasEntrances: true,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: 7.8 },
        { month: '202511', value: 8.0 },
        { month: '202512', value: 8.2 },
        { month: '202601', value: 8.3 },
        { month: '202602', value: 8.4 },
        { month: '202603', value: 8.5 }
      ]
    },
    {
      id: 2,
      name: '累计流量同比增幅到达值',
      value: '7.8',
      unit: '%',
      yoy: '+0.2',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '累计流量同比增幅，反映长期增长趋势',
      hasEntrances: false,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: 7.2 },
        { month: '202511', value: 7.4 },
        { month: '202512', value: 7.5 },
        { month: '202601', value: 7.6 },
        { month: '202602', value: 7.7 },
        { month: '202603', value: 7.8 }
      ]
    },
    {
      id: 3,
      name: '新入网贡献',
      value: '2.1',
      unit: '%',
      yoy: '+0.5',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '新入网客户对流量增长的贡献度',
      hasEntrances: false,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: 1.5 },
        { month: '202511', value: 1.7 },
        { month: '202512', value: 1.8 },
        { month: '202601', value: 1.9 },
        { month: '202602', value: 2.0 },
        { month: '202603', value: 2.1 }
      ]
    },
    {
      id: 4,
      name: '沉默激活贡献',
      value: '1.5',
      unit: '%',
      yoy: '+0.3',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'line' as const,
      businessScope: '沉默激活客户对流量增长的贡献度',
      hasEntrances: false,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: 1.1 },
        { month: '202511', value: 1.2 },
        { month: '202512', value: 1.3 },
        { month: '202601', value: 1.4 },
        { month: '202602', value: 1.4 },
        { month: '202603', value: 1.5 }
      ]
    },
    {
      id: 5,
      name: '存量激发贡献',
      value: '5.2',
      unit: '%',
      yoy: '+1.2',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '存量客户激发对流量增长的贡献度',
      hasEntrances: false,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: 4.2 },
        { month: '202511', value: 4.5 },
        { month: '202512', value: 4.7 },
        { month: '202601', value: 4.9 },
        { month: '202602', value: 5.0 },
        { month: '202603', value: 5.2 }
      ]
    },
    {
      id: 6,
      name: '上网流失损失',
      value: '-0.3',
      unit: '%',
      yoy: '+0.1',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF9500',
      chartType: 'line' as const,
      businessScope: '上网流失客户对流量增长的影响',
      hasEntrances: false,
      indicatorName: '当月流量同比增幅到达值',
      chartData: [
        { month: '202510', value: -0.5 },
        { month: '202511', value: -0.4 },
        { month: '202512', value: -0.4 },
        { month: '202601', value: -0.3 },
        { month: '202602', value: -0.3 },
        { month: '202603', value: -0.3 }
      ]
    }
  ];

  // 主题3：流量市场竞争格局
  const trafficCompetitionMetrics = [
    {
      id: 1,
      name: '当月流量份额',
      value: '55.2',
      unit: '%',
      yoy: '+0.3',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '中国移动流量市场份额',
      hasEntrances: true,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 54.2 },
        { month: '202511', value: 54.5 },
        { month: '202512', value: 54.8 },
        { month: '202601', value: 55.0 },
        { month: '202602', value: 55.1 },
        { month: '202603', value: 55.2 }
      ]
    },
    {
      id: 2,
      name: '当月流量份额客户份额',
      value: '52.8',
      unit: '%',
      yoy: '+0.2',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'line' as const,
      businessScope: '中国移动客户市场份额',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 52.2 },
        { month: '202511', value: 52.4 },
        { month: '202512', value: 52.5 },
        { month: '202601', value: 52.6 },
        { month: '202602', value: 52.7 },
        { month: '202603', value: 52.8 }
      ]
    },
    {
      id: 3,
      name: '当月流量增幅移动',
      value: '8.5',
      unit: '%',
      yoy: '+0.3',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '中国移动流量增幅',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 7.8 },
        { month: '202511', value: 8.0 },
        { month: '202512', value: 8.2 },
        { month: '202601', value: 8.3 },
        { month: '202602', value: 8.4 },
        { month: '202603', value: 8.5 }
      ]
    },
    {
      id: 4,
      name: '当月流量增幅DX',
      value: '7.2',
      unit: '%',
      yoy: '+0.2',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#FF9500',
      chartType: 'line' as const,
      businessScope: '电信流量增幅',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 6.6 },
        { month: '202511', value: 6.8 },
        { month: '202512', value: 7.0 },
        { month: '202601', value: 7.1 },
        { month: '202602', value: 7.2 },
        { month: '202603', value: 7.2 }
      ]
    },
    {
      id: 5,
      name: '当月流量增幅LT',
      value: '6.8',
      unit: '%',
      yoy: '+0.1',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'line' as const,
      businessScope: '联通流量增幅',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 6.4 },
        { month: '202511', value: 6.5 },
        { month: '202512', value: 6.6 },
        { month: '202601', value: 6.7 },
        { month: '202602', value: 6.8 },
        { month: '202603', value: 6.8 }
      ]
    },
    {
      id: 6,
      name: '当月流量增幅行业',
      value: '7.5',
      unit: '%',
      yoy: '+0.2',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '行业平均流量增幅',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 7.0 },
        { month: '202511', value: 7.1 },
        { month: '202512', value: 7.2 },
        { month: '202601', value: 7.3 },
        { month: '202602', value: 7.4 },
        { month: '202603', value: 7.5 }
      ]
    }
  ];

  // 主题4：流量价值转化指标
  const trafficValueMetrics = [
    {
      id: 1,
      name: '累计手机上网收入',
      value: '125.6',
      unit: '亿元',
      yoy: '+5.8',
      yoyUnit: '%',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#00B050',
      chartType: 'barline' as const,
      businessScope: '累计手机上网收入规模',
      hasEntrances: false,
      indicatorName: '当月日均流量',
      chartData: [
        { month: '202510', value: 118.2, yoy: 5.2 },
        { month: '202511', value: 120.5, yoy: 5.5 },
        { month: '202512', value: 122.1, yoy: 5.6 },
        { month: '202601', value: 123.5, yoy: 5.7 },
        { month: '202602', value: 124.6, yoy: 5.8 },
        { month: '202603', value: 125.6, yoy: 5.8 }
      ]
    },
    {
      id: 2,
      name: '累计流量单价',
      value: '3.2',
      unit: '元/GB',
      yoy: '-0.5',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF9500',
      chartType: 'line' as const,
      businessScope: '流量单价，反映流量价值',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 3.5 },
        { month: '202511', value: 3.4 },
        { month: '202512', value: 3.3 },
        { month: '202601', value: 3.3 },
        { month: '202602', value: 3.2 },
        { month: '202603', value: 3.2 }
      ]
    },
    {
      id: 3,
      name: '超套规模',
      value: '125.3',
      unit: '万',
      yoy: '-0.3',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF0000',
      chartType: 'line' as const,
      businessScope: '超套客户规模，需重点管控',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 132.5 },
        { month: '202511', value: 130.2 },
        { month: '202512', value: 128.6 },
        { month: '202601', value: 127.2 },
        { month: '202602', value: 126.1 },
        { month: '202603', value: 125.3 }
      ]
    },
    {
      id: 4,
      name: '地板价规模',
      value: '89.6',
      unit: '万',
      yoy: '-0.2',
      yoyUnit: 'pp',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF9500',
      chartType: 'line' as const,
      businessScope: '地板价客户规模，需提升价值',
      hasEntrances: false,
      indicatorName: '当月流量份额',
      chartData: [
        { month: '202510', value: 95.2 },
        { month: '202511', value: 93.5 },
        { month: '202512', value: 91.8 },
        { month: '202601', value: 90.6 },
        { month: '202602', value: 90.1 },
        { month: '202603', value: 89.6 }
      ]
    }
  ];

  // 增长来源分析数据（饼图）
  const growthSourceData = {
    name: '流量增幅来源分析',
    businessScope: '流量增长来源构成分析',
    chartData: [
      { name: '新入网贡献', value: 2.1, color: '#0066CC' },
      { name: '沉默激活贡献', value: 1.5, color: '#00B050' },
      { name: '存量激发贡献', value: 5.2, color: '#FF9500' },
      { name: '上网流失损失', value: -0.3, color: '#FF0000' }
    ]
  };

  // 竞争对手份额对比数据
  const competitorShareData = {
    name: '流量市场份额对比',
    businessScope: '三大运营商流量市场份额对比',
    chartData: [
      { name: '移动', value: 55.2, color: '#0066CC' },
      { name: '电信', value: 25.8, color: '#FF9500' },
      { name: '联通', value: 19.0, color: '#00B050' }
    ]
  };

  // 竞争对手增幅对比数据
  const competitorGrowthData = {
    name: '流量增幅对比',
    businessScope: '三大运营商流量增幅对比',
    chartData: [
      { month: '202602', mobile: 7.8, dx: 6.6, lt: 6.4 },
      { month: '202603', mobile: 8.0, dx: 6.8, lt: 6.5 },
      { month: '202612', mobile: 8.2, dx: 7.0, lt: 6.6 },
      { month: '202601', mobile: 8.3, dx: 7.1, lt: 6.7 },
      { month: '202606', mobile: 8.4, dx: 7.2, lt: 6.8 },
      { month: '202607', mobile: 8.5, dx: 7.2, lt: 6.8 }
    ]
  };

  // 策略客群规模数据

  // DOU分层分布数据
  const douDistributionData = {
    name: 'DOU分层分布',
    businessScope: '按月均流量使用量分层的客户分布，用于识别低饱和和高价值客户',
    chartData: [
      { level: '0-1GB', scale: 1256.8, rate: 14.7, yoy: -2.3 },
      { level: '1-5GB', scale: 835.6, rate: 25.1, yoy: 1.5 },
      { level: '5-10GB', scale: 2568.4, rate: 30.0, yoy: 2.8 },
      { level: '10-20GB', scale: 1823.6, rate: 21.3, yoy: 1.2 },
      { level: '20GB+', scale: 766.0, rate: 8.9, yoy: 3.5 }
    ]
  };

  // 饱和度分布数据
  const saturationDistributionData = {
    name: '流量饱和度分布',
    businessScope: '按套内流量使用率分层的客户分布，识别升档机会和降档风险',
    chartData: [
      { level: '0%(未使用)', scale: 856.2, rate: 10.0, yoy: -1.5 },
      { level: '0-50%(低饱和)', scale: 1542.8, rate: 18.0, yoy: -2.1 },
      { level: '50-80%(正常)', scale: 3422.4, rate: 40.0, yoy: 1.8 },
      { level: '80-100%(高饱和)', scale: 1712.0, rate: 20.0, yoy: 2.5 },
      { level: '>100%(超套)', scale: 1026.6, rate: 12.0, yoy: -0.7 }
    ]
  };

  // ARPU分层与流量消费数据
  const arpuTrafficData = {
    name: 'ARPU分层与流量消费',
    businessScope: '不同ARPU层级客户的流量消费特征，用于价值提升策略制定',
    chartData: [
      { arpu: '29元以下', scale: 1256.8, dou: 8.2, saturation: 92.5 },
      { arpu: '29-59元', scale: 835.6, dou: 12.5, saturation: 85.2 },
      { arpu: '59-99元', scale: 2568.4, dou: 18.3, saturation: 78.5 },
      { arpu: '99-159元', scale: 1712.0, dou: 25.6, saturation: 72.3 },
      { arpu: '159元以上', scale: 877.6, dou: 35.2, saturation: 65.8 }
    ]
  };

  // 流量流向分布数据
  const trafficFlowData = {
    name: '流量流向分布',
    businessScope: '流量使用的地域分布，省内/省际/国际流量占比',
    chartData: [
      { name: '省内流量', value: 68.5, color: '#0066CC' },
      { name: '省际流量', value: 28.2, color: '#00B050' },
      { name: '国际/港澳台', value: 3.3, color: '#FF9500' }
    ]
  };

  // 策略客群规模数据
  const strategySegmentData = [
    { segment: '流量地板价客户', scale: 1256.8, yoy: '+2.1%', status: 'warning' as const, businessScope: '套餐资费为最低档的流量客户，有激活提升空间', color: '#FF9500' },
    { segment: '流量低饱和客户', scale: 1542.8, yoy: '-1.5%', status: 'normal' as const, businessScope: '流量使用率<50%的客户，需唤醒流量使用习惯', color: '#00B050' },
    { segment: '流量三扩策略客户', scale: 2356.8, yoy: '+3.8%', status: 'normal' as const, businessScope: '符合三扩条件的潜力客户，可进行升档/增值/融合营销', color: '#0066CC' },
    { segment: '流量超套客户', scale: 1026.6, yoy: '+1.2%', status: 'danger' as const, businessScope: '流量使用超套餐客户，需及时进行升档或超套管控', color: '#FF0000' },
    { segment: '5G流量客户', scale: 3856.2, yoy: '+8.5%', status: 'normal' as const, businessScope: '使用5G网络的流量客户，DOU和ARPU均较高', color: '#0066CC' },
    { segment: '流量敏感客户', scale: 685.4, yoy: '-2.8%', status: 'warning' as const, businessScope: '对流量资费敏感的客户群体，需精准营销', color: '#FF9500' }
  ];

  // 策略运营效果数据
  const strategyEffectData = {
    threeExpand: {
      name: '三扩转化效果',
      chartData: [
        { month: '202602', upgrade: 125.6, valueAdd: 89.2, fusion: 56.8 },
        { month: '202603', upgrade: 138.2, valueAdd: 95.6, fusion: 62.4 },
        { month: '202612', upgrade: 142.5, valueAdd: 98.8, fusion: 68.2 },
        { month: '202605', upgrade: 156.8, valueAdd: 102.4, fusion: 72.5 },
        { month: '202606', upgrade: 162.4, valueAdd: 108.6, fusion: 78.6 },
        { month: '202607', upgrade: 168.5, valueAdd: 112.8, fusion: 82.4 }
      ]
    },
    overageControl: {
      name: '超套管控效果',
      chartData: [
        { month: '202602', overageUsers: 1125.6, controlRate: 35.2 },
        { month: '202603', overageUsers: 1098.2, controlRate: 38.5 },
        { month: '202612', overageUsers: 1056.8, controlRate: 42.1 },
        { month: '202605', overageUsers: 1035.4, controlRate: 45.8 },
        { month: '202606', overageUsers: 1012.6, controlRate: 48.2 },
        { month: '202607', overageUsers: 1026.6, controlRate: 50.5 }
      ]
    }
  };

  // 渠道触达效果数据
  const channelEffectData = {
    name: '全渠道触达效果',
    chartData: [
      { channel: 'APP推送', reach: 2568.5, response: 18.5, conversion: 8.2 },
      { channel: '短信', reach: 3856.2, response: 12.3, conversion: 5.6 },
      { channel: '外呼', reach: 1256.8, response: 25.8, conversion: 12.5 },
      { channel: '营业厅', reach: 856.4, response: 35.2, conversion: 18.6 },
      { channel: '企业微信', reach: 1526.8, response: 22.4, conversion: 10.2 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 第一排：核心指标区 - 2×2布局 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          核心指标
        </h3>
        <div className="grid grid-cols-4 gap-3 bg-gradient-to-br from-blue-50/50 to-white p-4 rounded-lg border border-blue-100/50">
          {/* 卡片1：流量增幅 */}
          <Card className="p-2.5 hover:shadow-md transition-shadow relative">
            <div className="absolute top-2 right-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mb-1.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-800">流量增幅</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    当月上网流量同比增幅，反映流量增长速度与市场竞争力
                  </div>
                </div>
                <button
                  className="text-[10px] text-[#0066CC] cursor-pointer hover:underline flex-shrink-0"
                  onClick={() => handleOpenDispatch('流量增幅')}
                >
                  去调度
                </button>
              </div>
            </div>
            {/* 指标数据区 - 1行2列布局（月目标/进度/年目标/进度已隐藏） */}
            <div className="grid grid-cols-2 gap-x-0.5 gap-y-1 mb-2 text-[10px]">
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">当月</span>
                <span className="text-sm font-bold text-gray-900">8.5<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              {/* 隐藏：月目标/月进度/年目标/年进度（指标清单中已移除） */}
              {/* <div className="flex items-center gap-0.5">
                <span className="text-gray-500">月目标</span>
                <span className="text-sm font-bold text-gray-900">15<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">月进度</span>
                <span className="text-sm font-bold text-red-600">↓-6.5pp</span>
              </div> */}
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">累计</span>
                <span className="text-sm font-bold text-gray-900">7.8<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              {/* 隐藏：年目标/年进度（指标清单中已移除） */}
              {/* <div className="flex items-center gap-0.5">
                <span className="text-gray-500">年目标</span>
                <span className="text-sm font-bold text-gray-900">15<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">年进度</span>
                <span className="text-sm font-bold text-red-600">↓-7.2pp</span>
              </div> */}
            </div>
            {/* 图表区 - 双柱(当月增幅+年累计增幅) + 折线(环比) */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', monthly: 7.2, cumulative: 7.0, mom: 0.5 },
                  { month: '202511', monthly: 7.8, cumulative: 7.2, mom: -0.3 },
                  { month: '202512', monthly: 7.5, cumulative: 7.4, mom: 0.8 },
                  { month: '202601', monthly: 8.3, cumulative: 7.5, mom: -0.5 },
                  { month: '202602', monthly: 8.0, cumulative: 7.6, mom: 0.4 },
                  { month: '202603', monthly: 8.5, cumulative: 7.8, mom: 0.3 }
                ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} domain={[0, 10]} unit="%" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[-1, 1]} unit="%" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                            <p className="font-medium text-gray-700 mb-1">{label}</p>
                            <p className="text-[#0066CC]">当月增幅: {(payload[0]?.value as number)?.toFixed(1)}%</p>
                            <p className="text-[#4A90D9]">年累计增幅: {(payload[1]?.value as number)?.toFixed(1)}%</p>
                            <p className="text-[#FF9500]">环比: {(payload[2]?.value as number)?.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="monthly" fill="#0066CC" radius={[2, 2, 0, 0]} name="当月增幅" barSize={10}>
                    <LabelList dataKey="monthly" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 7, fill: '#0066CC' }} />
                  </Bar>
                  <Bar yAxisId="left" dataKey="cumulative" fill="#4A90D9" radius={[2, 2, 0, 0]} name="年累计增幅" barSize={10}>
                    <LabelList dataKey="cumulative" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 7, fill: '#4A90D9' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="mom" stroke="#FF9500" strokeWidth={2} dot={{ r: 3, fill: '#FF9500' }} name="环比" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

          </Card>

          {/* 卡片2：流量份额 */}
          <Card className="p-2.5 hover:shadow-md transition-shadow relative">
            <div className="absolute top-2 right-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mb-1.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-800">流量份额</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    本省流量占全网流量的比例及份额变化，反映市场竞争力
                  </div>
                </div>
                <button
                  className="text-[10px] text-[#0066CC] cursor-pointer hover:underline flex-shrink-0"
                  onClick={() => handleOpenDispatch('流量份额')}
                >
                  去调度
                </button>
              </div>
            </div>
            {/* 指标数据区 - 流量份额3指标：月流量份额、累计流量份额、月流量份额差值 */}
            <div className="grid grid-cols-3 gap-x-0.5 gap-y-1 mb-2 text-[10px]">
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">当月</span>
                <span className="text-sm font-bold text-gray-900">58.3<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">累计</span>
                <span className="text-sm font-bold text-gray-900">57.8<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">差值</span>
                <span className="text-sm font-bold text-green-600">↑+0.4<span className="text-[9px] font-normal text-gray-500">%</span></span>
              </div>
            </div>
            {/* 图表区 - 双柱(月流量份额+累计流量份额) + 折线(环比) */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', monthly: 57.6, cumulative: 57.1, qoq: 0.3 },
                  { month: '202511', monthly: 57.9, cumulative: 57.3, qoq: 0.2 },
                  { month: '202512', monthly: 58.0, cumulative: 57.5, qoq: 0.1 },
                  { month: '202601', monthly: 57.8, cumulative: 57.4, qoq: -0.2 },
                  { month: '202602', monthly: 58.1, cumulative: 57.6, qoq: 0.3 },
                  { month: '202603', monthly: 58.3, cumulative: 57.8, qoq: 0.2 }
                ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} domain={[55, 60]} unit="%" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[-1, 1]} unit="%" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                            <p className="font-medium text-gray-700 mb-1">{label}</p>
                            <p className="text-[#0066CC]">月流量份额: {(payload[0]?.value as number)?.toFixed(1)}%</p>
                            <p className="text-[#69B3FF]">累计流量份额: {(payload[1]?.value as number)?.toFixed(1)}%</p>
                            <p className="text-[#FF9500]">环比: {(payload[2]?.value as number)?.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="monthly" fill="#0066CC" radius={[2, 2, 0, 0]} name="月流量份额" barSize={8}>
                    <LabelList dataKey="monthly" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 8, fill: '#0066CC' }} />
                  </Bar>
                  <Bar yAxisId="left" dataKey="cumulative" fill="#69B3FF" radius={[2, 2, 0, 0]} name="累计流量份额" barSize={8}>
                    <LabelList dataKey="cumulative" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 8, fill: '#69B3FF' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#FF9500" strokeWidth={2} dot={{ r: 3, fill: '#FF9500' }} name="环比" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 卡片3：手机上网业务量 */}
          <Card className="p-2.5 hover:shadow-md transition-shadow relative">
            <div className="absolute top-2 right-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="mb-1.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-800">手机上网业务量</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    手机上网流量绝对值，反映实际业务规模
                  </div>
                </div>
                <button
                  className="text-[10px] text-[#0066CC] cursor-pointer hover:underline flex-shrink-0"
                  onClick={() => handleOpenDispatch('手机上网业务量')}
                >
                  去调度
                </button>
              </div>
            </div>
            {/* 指标数据区 - 手机上网业务量2指标：当月流量绝对值、累计流量绝对值 */}
            <div className="grid grid-cols-2 gap-x-0.5 gap-y-1 mb-2 text-[10px]">
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">当月</span>
                <span className="text-sm font-bold text-gray-900">568.2<span className="text-[9px] font-normal text-gray-500">亿MB</span></span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-gray-500">累计</span>
                <span className="text-sm font-bold text-gray-900">1,562.8<span className="text-[9px] font-normal text-gray-500">亿MB</span></span>
              </div>
            </div>
            {/* 图表区 - 单柱(当月绝对值,左轴) + 折线(累计绝对值,左轴) + 折线(环比,右轴%) */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', monthly: 520.6, qoq: 2.3 },
                  { month: '202511', monthly: 535.2, qoq: 2.8 },
                  { month: '202512', monthly: 548.1, qoq: 2.4 },
                  { month: '202601', monthly: 530.5, qoq: -3.2 },
                  { month: '202602', monthly: 542.8, qoq: 2.3 },
                  { month: '202603', monthly: 568.2, qoq: 4.7 }
                ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[0, 650]} unit="亿" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[-5, 8]} unit="%" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                            <p className="font-medium text-gray-700 mb-1">{label}</p>
                            <p className="text-[#0066CC]">当月: {(payload[0]?.value as number)?.toFixed(1)}亿MB</p>
                            <p className="text-[#4CAF50]">环比: {(payload[1]?.value as number)?.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="monthly" fill="#0066CC" radius={[2, 2, 0, 0]} name="当月绝对值" barSize={16}>
                    <LabelList dataKey="monthly" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 8, fill: '#0066CC' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3, fill: '#4CAF50' }} name="环比" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 卡片4：累计通信服务收入 */}
          <Card className="p-2.5 hover:shadow-md transition-shadow">
            <div className="mb-1.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-800">累计通信服务收入</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    当年截至当月的累计通信服务收入，反映整体收入规模与增长趋势
                  </div>
                </div>
              </div>
            </div>
            {/* 指标数据区 - 分行展示：第一行值，第二行同比/环比 */}
            <div className="mb-2 text-[10px]">
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <span className="text-gray-500">当月</span>
                  <span className="text-base font-bold text-gray-900 ml-1">17.86<span className="text-[10px] font-normal text-gray-500">亿元</span></span>
                </div>
                <div>
                  <span className="text-gray-500">累计</span>
                  <span className="text-base font-bold text-gray-900 ml-1">285.6<span className="text-[10px] font-normal text-gray-500">亿元</span></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-gray-500">同比</span>
                  <span className="text-sm font-bold text-green-600 ml-1">↑+5.2%</span>
                </div>
                <div>
                  <span className="text-gray-500">环比</span>
                  <span className="text-sm font-bold text-green-600 ml-1">↑+2.3%</span>
                </div>
              </div>
            </div>
            {/* 图表区 - 柱状图(累计收入) + 折线图(累计同比) + 折线图(环比) */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', cumulative: 38.5, yoyRate: 4.2, qoq: 4.8 },
                  { month: '202511', cumulative: 45.8, yoyRate: 4.5, qoq: 5.4 },
                  { month: '202512', cumulative: 52.2, yoyRate: 4.8, qoq: 4.4 },
                  { month: '202601', cumulative: 58.6, yoyRate: 5.0, qoq: 4.6 },
                  { month: '202602', cumulative: 65.5, yoyRate: 5.1, qoq: 5.9 },
                  { month: '202603', cumulative: 65.0, yoyRate: 5.2, qoq: 5.2 }
                ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} domain={[0, 80]} unit="亿" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[0, 8]} unit="%" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                            <p className="font-medium text-gray-700 mb-1">{label}</p>
                            <p className="text-[#0066CC]">累计收入: {(payload[0]?.value as number)?.toFixed(1)}亿</p>
                            <p className="text-[#FF9500]">累计同比: {(payload[1]?.value as number)?.toFixed(1)}%</p>
                            <p className="text-[#4CAF50]">环比: {(payload[2]?.value as number)?.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="cumulative" fill="#0066CC" radius={[2, 2, 0, 0]} name="累计收入" barSize={16}>
                    <LabelList dataKey="cumulative" position="top" formatter={(v: number) => `${v.toFixed(0)}亿`} style={{ fontSize: 8, fill: '#0066CC' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoyRate" stroke="#FF9500" strokeWidth={2} dot={{ r: 3, fill: '#FF9500' }} name="累计同比" />
                  <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3, fill: '#4CAF50' }} name="环比" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>


        </div>
      </div>

      {/* 第二排：二级指标 - 6个子类，每类2个指标，每行2个子类，共3行 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          二级指标
        </h3>
        
        {/* 第一行：流量规模类 + 流量价值类 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 流量规模类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">流量规模</h4>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {/* 当日流量规模 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">当日流量规模</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      当日全网流量总规模
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5 mb-0.5">
                    <span className="text-lg font-bold text-gray-900">1.25</span>
                    <span className="text-[10px] text-gray-500">亿GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+8.5%</span>
                    <span className="text-green-600">↑ 环比+2.3%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 1.08, yoy: 6.2, qoq: 1.5 },
                      { month: '202511', value: 1.15, yoy: 7.1, qoq: -2.8 },
                      { month: '202512', value: 1.02, yoy: 8.5, qoq: 3.2 },
                      { month: '202601', value: 1.22, yoy: 7.8, qoq: -1.5 },
                      { month: '202602', value: 1.18, yoy: 9.2, qoq: 2.8 },
                      { month: '202603', value: 1.25, yoy: 8.5, qoq: 2.3 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[0.95, 1.35]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[-5, 12]} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#0066CC" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 6, fill: '#0066CC' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 当月日均流量 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">当月日均流量</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      当月每日平均流量规模
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">1.18</span>
                    <span className="text-[10px] text-gray-500">亿GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+6.2%</span>
                    <span className="text-green-600">↑ 环比+1.8%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 1.02, yoy: 5.1 },
                      { month: '202511', value: 1.08, yoy: 5.8 },
                      { month: '202512', value: 1.05, yoy: 6.5 },
                      { month: '202601', value: 1.12, yoy: 5.9 },
                      { month: '202602', value: 1.15, yoy: 7.2 },
                      { month: '202603', value: 1.18, yoy: 6.2 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[0.95, 1.25]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[3, 9]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#0066CC" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 6, fill: '#0066CC' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* 流量价值类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">流量价值</h4>
            </div>
            <div className="p-2 grid grid-cols-1 gap-2">
              {/* 隐藏：累计移动流量收入（指标清单中已移除） */}
              <Card className="p-2.5 hover:shadow-md transition-shadow" style={{ display: 'none' }}>
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">累计移动流量收入</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      年度累计移动流量业务收入
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">256.8</span>
                    <span className="text-[10px] text-gray-500">亿</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+4.5%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 68.5, yoy: 3.2 },
                      { month: '202511', value: 108.2, yoy: 3.8 },
                      { month: '202512', value: 148.5, yoy: 4.1 },
                      { month: '202601', value: 189.8, yoy: 4.3 },
                      { month: '202602', value: 230.5, yoy: 4.4 },
                      { month: '202603', value: 256.8, yoy: 4.5 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[50, 280]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[2, 6]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 6, fill: '#10b981' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 累计流量单价 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">累计流量单价</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      年度累计流量单价（元/GB）
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">4.2</span>
                    <span className="text-[10px] text-gray-500">元/GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-red-600">↓ 同比-3.8%</span>
                    <span className="text-red-600">↓ 环比-0.5%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 4.5, yoy: -2.1 },
                      { month: '202511', value: 4.4, yoy: -2.5 },
                      { month: '202512', value: 4.3, yoy: -2.9 },
                      { month: '202601', value: 4.3, yoy: -3.2 },
                      { month: '202602', value: 4.2, yoy: -3.5 },
                      { month: '202603', value: 4.2, yoy: -3.8 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[4.0, 4.8]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[-5, 0]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#f59e0b" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: 6, fill: '#f59e0b' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#ef4444" strokeWidth={1} dot={{ r: 1.5 }} name="同比">
                        <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 5, fill: '#ef4444' }} />
                      </Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 第二行：客户规模类 + 流量用量类 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 客户规模类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">客户规模</h4>
            </div>
            <div className="p-2 grid grid-cols-1 gap-2">
              {/* 隐藏：当月出账客户（指标清单中已移除） */}
              {/* <Card className="p-2.5 hover:shadow-md transition-shadow">
                ...当月出账客户...
              </Card> */}

              {/* 当月上网客户 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">当月上网客户</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      当月有上网行为的客户数
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">5256</span>
                    <span className="text-[10px] text-gray-500">万</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+3.8%</span>
                    <span className="text-green-600">↑ 环比+1.2%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 1810, yoy: 3.2 },
                      { month: '202511', value: 5185, yoy: 2.8 },
                      { month: '202512', value: 5235, yoy: 3.5 },
                      { month: '202601', value: 5210, yoy: 3.1 },
                      { month: '202602', value: 5265, yoy: 4.0 },
                      { month: '202603', value: 5256, yoy: 3.8 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[5150, 5300]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[2, 5]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 6, fill: '#8b5cf6' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* 流量用量类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">流量用量</h4>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {/* 当月DOU */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">当月DOU</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      当月户均流量（Data of Usage）
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">15.2</span>
                    <span className="text-[10px] text-gray-500">GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+2.8%</span>
                    <span className="text-green-600">↑ 环比+0.7%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 14.5, yoy: 2.2 },
                      { month: '202511', value: 15.2, yoy: 2.5 },
                      { month: '202512', value: 14.8, yoy: 2.6 },
                      { month: '202601', value: 15.5, yoy: 2.7 },
                      { month: '202602', value: 15.1, yoy: 2.6 },
                      { month: '202603', value: 15.2, yoy: 2.8 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[14, 16]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[1.5, 3.5]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: 6, fill: '#06b6d4' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 累计DOU */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">累计DOU</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      年度累计户均流量
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">12.8</span>
                    <span className="text-[10px] text-gray-500">GB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+3.2%</span>
                    <span className="text-green-600">↑ 环比+0.3%</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 10.5, yoy: 2.8 },
                      { month: '202511', value: 11.2, yoy: 2.9 },
                      { month: '202512', value: 11.8, yoy: 3.0 },
                      { month: '202601', value: 10.7, yoy: 3.1 },
                      { month: '202602', value: 12.5, yoy: 3.1 },
                      { month: '202603', value: 12.8, yoy: 3.2 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[10, 14]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[2, 4]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: 6, fill: '#06b6d4' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 第三行：饱和度类 + 质量类 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 饱和度类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">饱和度</h4>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {/* 当月整体饱和度（套+包） */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">整体饱和度(套+包)</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      套餐+叠加包的整体使用饱和度
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">78.5</span>
                    <span className="text-[10px] text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+3.2pp</span>
                    <span className="text-green-600">↑ 环比+0.7pp</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 74.2, yoy: 2.5 },
                      { month: '202511', value: 76.1, yoy: 2.8 },
                      { month: '202512', value: 77.0, yoy: 3.0 },
                      { month: '202601', value: 77.5, yoy: 3.1 },
                      { month: '202602', value: 78.0, yoy: 3.0 },
                      { month: '202603', value: 78.5, yoy: 3.2 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[72, 82]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[2, 4]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#f97316" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 6, fill: '#f97316' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 当月套餐饱和度 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">当月套餐饱和度</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      仅套餐的使用饱和度（不含叠加包）
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">65.2</span>
                    <span className="text-[10px] text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+2.1pp</span>
                    <span className="text-green-600">↑ 环比+0.5pp</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 61.8, yoy: 1.6 },
                      { month: '202511', value: 63.2, yoy: 1.8 },
                      { month: '202512', value: 64.0, yoy: 1.9 },
                      { month: '202601', value: 64.5, yoy: 2.0 },
                      { month: '202602', value: 65.0, yoy: 2.0 },
                      { month: '202603', value: 65.2, yoy: 2.1 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[60, 68]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[1, 3]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#f97316" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 6, fill: '#f97316' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* 质量类 */}
          <div className="rounded-lg overflow-hidden">
            <div className="px-3 py-0.5 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-800">质量</h4>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {/* 300GB以上客户占比 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">300GB以上客户占比</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      月流量超过300GB的客户占比
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">12.3</span>
                    <span className="text-[10px] text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+2.1pp</span>
                    <span className="text-green-600">↑ 环比+0.2pp</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 10.2, yoy: 1.5 },
                      { month: '202511', value: 10.9, yoy: 1.7 },
                      { month: '202512', value: 11.3, yoy: 1.8 },
                      { month: '202601', value: 11.8, yoy: 1.9 },
                      { month: '202602', value: 12.1, yoy: 2.0 },
                      { month: '202603', value: 12.3, yoy: 2.1 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[9, 14]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[1, 3]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#f43f5e" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 6, fill: '#f43f5e' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 300GB以上流量占比 */}
              <Card className="p-2.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-xs font-bold text-gray-700">300GB以上流量占比</h5>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                      月流量超过300GB客户产生的流量占总流量比例
                    </div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-bold text-gray-900">35.6</span>
                    <span className="text-[10px] text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-green-600">↑ 同比+3.5pp</span>
                    <span className="text-green-600">↑ 环比+0.8pp</span>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { month: '202510', value: 30.2, yoy: 2.5 },
                      { month: '202511', value: 31.8, yoy: 2.8 },
                      { month: '202512', value: 32.5, yoy: 3.0 },
                      { month: '202601', value: 33.2, yoy: 3.2 },
                      { month: '202602', value: 34.5, yoy: 3.3 },
                      { month: '202603', value: 35.6, yoy: 3.5 }
                    ]} margin={{ top: 10, right: 3, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[28, 38]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 6 }} axisLine={false} tickLine={false} width={20} domain={[2, 4]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" fill="#f43f5e" radius={[2, 2, 0, 0]} name="规模" barSize={10}>
                        <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 6, fill: '#f43f5e' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={1} dot={{ r: 1.5 }} name="同比" />
                      <Line yAxisId="right" type="monotone" dataKey="qoq" stroke="#4CAF50" strokeWidth={1} dot={{ r: 1.5 }} name="环比" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 第四排：流量来源分析 - 饼图+五角卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          流量来源分析
        </h3>
        <Card className="p-5 bg-gradient-to-br from-slate-50/80 to-white">
          {/* 来源数据定义 */}
          {(() => {
            const sourceData = [
              {
                name: '存量激发',
                color: '#0066CC',
                contribution: '520万GB',
                yoy: '+3.2%',
                mom: '+1.5%',
                yoyPositive: true,
                momPositive: true,
                businessScope: '存量客户激发产生的流量贡献',
                valueLabel: '当月流量贡献值',
                monthlyData: [
                  { month: '202510', value: 420, yoy: 3.2, mom: 1.2 },
                  { month: '202511', value: 450, yoy: 2.8, mom: 2.8 },
                  { month: '202512', value: 480, yoy: 3.5, mom: 3.5 },
                  { month: '202601', value: 495, yoy: 2.6, mom: 2.6 },
                  { month: '202602', value: 508, yoy: 3.0, mom: 3.0 },
                  { month: '202603', value: 520, yoy: 3.2, mom: 3.2 }
                ]
              },
              {
                name: '新入网',
                color: '#00B050',
                contribution: '210万GB',
                yoy: '+5.8%',
                mom: '+2.3%',
                yoyPositive: true,
                momPositive: true,
                businessScope: '新入网客户产生的流量贡献',
                valueLabel: '当月流量贡献值',
                monthlyData: [
                  { month: '202510', value: 120, yoy: 5.2, mom: 5.2 },
                  { month: '202511', value: 145, yoy: 4.8, mom: 4.8 },
                  { month: '202512', value: 165, yoy: 6.2, mom: 6.2 },
                  { month: '202601', value: 180, yoy: 5.5, mom: 5.5 },
                  { month: '202602', value: 195, yoy: 6.0, mom: 6.0 },
                  { month: '202603', value: 210, yoy: 5.8, mom: 5.8 }
                ]
              },
              {
                name: '沉默激活',
                color: '#FF9500',
                contribution: '150万GB',
                yoy: '+2.1%',
                mom: '+0.8%',
                yoyPositive: true,
                momPositive: true,
                businessScope: '沉默客户激活后产生的流量贡献',
                valueLabel: '当月流量贡献值',
                monthlyData: [
                  { month: '202510', value: 110, yoy: 1.8, mom: 1.8 },
                  { month: '202511', value: 125, yoy: 1.5, mom: 1.5 },
                  { month: '202512', value: 135, yoy: 2.5, mom: 2.5 },
                  { month: '202601', value: 140, yoy: 1.9, mom: 1.9 },
                  { month: '202602', value: 145, yoy: 2.2, mom: 2.2 },
                  { month: '202603', value: 150, yoy: 2.1, mom: 2.1 }
                ]
              },
              {
                name: '流失损失（离网）',
                color: '#FF3B30',
                contribution: '20万GB',
                yoy: '-0.5%',
                mom: '-0.3%',
                yoyPositive: true,
                momPositive: true,
                isNegativeIndicator: true,
                businessScope: '离网客户造成的流量损失',
                valueLabel: '当月流量损失值',
                monthlyData: [
                  { month: '202510', value: 15, yoy: -0.6, mom: -0.6 },
                  { month: '202511', value: 16, yoy: -0.4, mom: -0.4 },
                  { month: '202512', value: 17, yoy: -0.8, mom: -0.8 },
                  { month: '202601', value: 18, yoy: -0.5, mom: -0.5 },
                  { month: '202602', value: 19, yoy: -0.3, mom: -0.3 },
                  { month: '202603', value: 20, yoy: -0.5, mom: -0.5 }
                ]
              },
              {
                name: '流失损失（沉默）',
                color: '#E91E63',
                contribution: '10万GB',
                yoy: '-0.3%',
                mom: '-0.2%',
                yoyPositive: true,
                momPositive: true,
                isNegativeIndicator: true,
                businessScope: '沉默客户造成的流量损失',
                valueLabel: '当月流量损失值',
                monthlyData: [
                  { month: '202510', value: 6, yoy: -0.2, mom: -0.2 },
                  { month: '202511', value: 7, yoy: -0.3, mom: -0.3 },
                  { month: '202512', value: 8, yoy: -0.4, mom: -0.4 },
                  { month: '202601', value: 8, yoy: -0.2, mom: -0.2 },
                  { month: '202602', value: 9, yoy: -0.3, mom: -0.3 },
                  { month: '202603', value: 10, yoy: -0.3, mom: -0.3 }
                ]
              }
            ];

            // 来源卡片组件 - 左右布局
            const SourceCard = ({ source, fixedHeight = false, cardHeight = 108 }: { source: typeof sourceData[0]; fixedHeight?: boolean; cardHeight?: number }) => {
              // 判断颜色：正向指标增长标绿，负向指标（流失损失）负值标绿
              const getColorClass = (value: string, isNegativeIndicator?: boolean) => {
                const isPositive = value.startsWith('+');
                if (isNegativeIndicator) {
                  // 负向指标：负值标绿，正值标红
                  return !isPositive ? 'text-emerald-500' : 'text-red-500';
                } else {
                  // 正向指标：增长标绿，下降标红
                  return isPositive ? 'text-emerald-500' : 'text-red-500';
                }
              };

              return (
              <div className={`bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${fixedHeight ? '' : ''}`} style={fixedHeight ? { height: `${cardHeight}px` } : {}}>
                <div className={`flex flex-col h-full`}>
                  {/* 顶部：名称和数据 */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }}></div>
                      <h4 className="text-xs font-semibold text-gray-700">{source.name}</h4>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          {source.businessScope}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold" style={{ color: source.color }}>{source.contribution}</p>
                      <div className="flex gap-2 text-[9px]">
                        <span className={getColorClass(source.yoy, source.isNegativeIndicator)}>
                          同比{source.yoy.startsWith('+') ? '↑' : source.yoy.startsWith('-') ? '↓' : ''}{source.yoy}
                        </span>
                        <span className={getColorClass(source.mom, source.isNegativeIndicator)}>
                          环比{source.mom.startsWith('+') ? '↑' : source.mom.startsWith('-') ? '↓' : ''}{source.mom}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 中间：图表 */}
                  <div className="flex-1 min-h-[60px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={source.monthlyData} margin={{ top: 8, right: 2, left: 0, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" hide domain={[0, 'dataMax']} />
                        <YAxis yAxisId="right" orientation="right" hide domain={['dataMin', 'dataMax']} />
                        <Tooltip 
                          contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 4 }}
                          formatter={(value: number, name: string) => [name === 'value' ? `${value}万GB` : `${value > 0 ? '+' : ''}${value}%`, name === 'value' ? source.valueLabel : '同比']}
                        />
                        <Bar yAxisId="left" dataKey="value" fill={source.color} radius={[2, 2, 0, 0]} barSize={8}>
                          <LabelList dataKey="value" position="top" formatter={(v: number) => v.toFixed(0)} style={{ fontSize: 5, fill: source.color }} />
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#10b981" strokeWidth={1} dot={{ r: 1.5, fill: '#10b981' }}>
                          <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} style={{ fontSize: 5, fill: '#10b981', fontWeight: 500 }} />
                        </Line>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* 底部：环比值 */}
                  <div className="flex items-center text-[6px] text-gray-500 mt-0.5">
                    <span className="text-gray-400 text-[5px] mr-0.5 shrink-0">环比</span>
                    <div className="flex items-center justify-around flex-1">
                      {source.monthlyData.map((item, idx) => (
                        <span key={idx} className={item.mom > 0 ? 'text-green-500' : item.mom < 0 ? 'text-red-500' : 'text-gray-400'}>
                          {item.mom > 0 ? '↑' : item.mom < 0 ? '↓' : ''}{item.mom > 0 ? '+' : ''}{item.mom.toFixed(1)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            };

            return (
              <div className="relative">
                {/* 主体布局：左右卡片 + 中间饼图 + 下3卡片 */}
                <div className="relative" style={{ minHeight: '420px' }}>
                  {/* 上排：存量激发(左) + 饼图(中) + 新入网(右) */}
                  <div className="flex gap-2 mb-4">
                    {/* 左侧：存量激发 */}
                    <div className="w-1/3">
                      <SourceCard source={sourceData[0]} fixedHeight cardHeight={160} />
                    </div>
                    
                    {/* 中央条形图 */}
                    <div className="flex-1 flex items-center justify-center px-2">
                      <div className="w-full max-w-[380px]">
                        {/* 标题 */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <h5 className="text-sm font-bold text-gray-800">当月流量来源分析</h5>
                            <div className="relative group">
                              <Info className="w-3 h-3 text-gray-400 cursor-help" />
                              <div className="absolute left-0 top-4 w-40 bg-gray-800 text-white text-[9px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                各来源当月贡献值
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* 横向条形图 */}
                        <div className="h-[160px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={[
                                { name: '存量激发', value: 5.2, fill: '#0066CC' },
                                { name: '新入网', value: 2.1, fill: '#00B050' },
                                { name: '沉默激活', value: 1.5, fill: '#FF9500' },
                                { name: '流失损失(离网)', value: -0.2, fill: '#FF3B30' },
                                { name: '流失损失(沉默)', value: -0.1, fill: '#E91E63' }
                              ]}
                              margin={{ top: 5, right: 35, left: 70, bottom: 5 }}
                            >
                              <XAxis type="number" domain={[-2, 6]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                              <Tooltip 
                                formatter={(value: number) => [`${value}%`, '贡献值']}
                                contentStyle={{ fontSize: 10, borderRadius: 6 }}
                              />
                              <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={18}>
                                <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 9, fill: '#374151' }} />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    
                    {/* 右侧：新入网 */}
                    <div className="w-1/3">
                      <SourceCard source={sourceData[1]} fixedHeight cardHeight={160} />
                    </div>
                  </div>
                  
                  {/* 下排：沉默激活、流失损失（离网）、流失损失（沉默） */}
                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <SourceCard source={sourceData[2]} fixedHeight cardHeight={160} />
                    </div>
                    <div className="w-1/3">
                      <SourceCard source={sourceData[3]} fixedHeight cardHeight={160} />
                    </div>
                    <div className="w-1/3">
                      <SourceCard source={sourceData[4]} fixedHeight cardHeight={160} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* 第五排：三扩三融两提升进度 - 1行5列 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          近期重点工作
          <span className="text-xs text-gray-400 font-normal ml-2">
            柱状图：月度规模趋势
          </span>
        </h3>
        <div className="bg-gradient-to-br from-teal-50/30 to-white p-4 rounded-lg border border-teal-100/50">
          {/* 23类客户三扩三融率 */}
          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">23类客户三扩三融率</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-56 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    23类客群三扩三融已运营客户规模 / 拍照25年12月客户规模
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mb-2">
              <div>
                <span className="text-[10px] text-gray-400">23类客户三扩三融率</span>
                <p className="text-sm font-bold text-gray-900">26.8%</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">23类客户三扩三融当月运营规模</span>
                <p className="text-sm font-bold text-[#0066CC]">3,215.6万户</p>
              </div>
            </div>
            {/* 月度趋势图 - 纯柱状图 */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { month: '202504', scale: 2612.3 },
                  { month: '202505', scale: 2658.7 },
                  { month: '202506', scale: 2701.4 },
                  { month: '202507', scale: 2745.8 },
                  { month: '202508', scale: 2789.2 },
                  { month: '202509', scale: 2823.6 },
                  { month: '202510', scale: 2856.2 },
                  { month: '202511', scale: 2934.5 },
                  { month: '202512', scale: 3012.8 },
                  { month: '202601', scale: 3089.3 },
                  { month: '202602', scale: 3156.7 },
                  { month: '202603', scale: 3215.6 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tickFormatter={(v: number) => `${(v/1000).toFixed(1)}k`} tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={25} domain={[2500, 3300]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="scale" fill="#0066CC" radius={[2, 2, 0, 0]} name="当月运营规模" maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 隐藏：超套规模卡片 */}
          {false && (
          <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">超套规模</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-[10px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    超套客户累计扩容规模 / 当月超套客户扩容规模
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mb-2">
              <div>
                <span className="text-[10px] text-gray-400">超套客户累计扩容规模</span>
                <p className="text-sm font-bold text-orange-600">125.3万户</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">当月超套客户扩容规模</span>
                <p className="text-sm font-bold text-[#0066CC]">1.2万户</p>
              </div>
            </div>
            {/* 月度趋势图 - 纯柱状图 */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { month: '202510', scale: 112.5 },
                  { month: '202511', scale: 118.2 },
                  { month: '202512', scale: 122.8 },
                  { month: '202601', scale: 121.6 },
                  { month: '202602', scale: 124.1 },
                  { month: '202603', scale: 125.3 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={25} domain={[108, 128]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="scale" fill="#FF9500" radius={[2, 2, 0, 0]} name="超套客户扩容规模">
                    <LabelList dataKey="scale" position="top" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: 7, fill: '#FF9500' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          )}
        </div>
      </div>
      {/* 隐藏：竞争格局（指标清单中已移除） */}
      {false && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          竞争格局
        </h3>
        <div className="grid grid-cols-4 gap-3 bg-gradient-to-br from-indigo-50/30 to-white p-4 rounded-lg border border-indigo-100/50">
          {/* 行业增幅 */}
          <Card className="p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">行业增幅</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {indicatorDescriptions['行业增幅']}
                  </div>
                </div>
              </div>
              <button
                className="text-xs text-[#0066CC] cursor-pointer hover:underline flex-shrink-0 hidden"
                onClick={() => handleOpenDispatch('行业增幅')}
              >
                去调度
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold text-gray-900">7.5</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">↑ 较去年同期增幅+0.5pp</span>
                <span className="text-xs text-green-600">↑ 较上月增幅+0.1pp</span>
              </div>
            </div>
            {/* 月度趋势图 */}
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', value: 7.0, mom: 0.2, yoy: 0.2 },
                  { month: '202511', value: 7.2, mom: 0.2, yoy: 0.2 },
                  { month: '202512', value: 7.3, mom: 0.1, yoy: 0.1 },
                  { month: '202601', value: 7.4, mom: 0.1, yoy: 0.1 },
                  { month: '202602', value: 7.4, mom: 0.0, yoy: 0.0 },
                  { month: '202603', value: 7.5, mom: 0.1, yoy: 0.1 }
                ]}>
                  <XAxis dataKey="month" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[6.5, 8]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[0, 0.3]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" fill="#6B7280" radius={[1, 1, 0, 0]} name="增幅">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 5, fill: '#6B7280', fontWeight: 500 }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#00B050" strokeWidth={1.5} dot={{ r: 2 }} name="较去年同期增幅">
                    <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}pp`} style={{ fontSize: 5, fill: '#00B050', fontWeight: 500 }} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* 底部环比值 */}
            <div className="flex justify-around text-[6px] text-gray-500 mt-0.5 items-center">
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-gray-400 w-6 text-center">0.0pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
            </div>
          </Card>

          {/* YD增幅 */}
          <Card className="p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">YD增幅</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {indicatorDescriptions['YD增幅']}
                  </div>
                </div>
              </div>
              <button
                className="text-xs text-[#0066CC] cursor-pointer hover:underline flex-shrink-0 hidden"
                onClick={() => handleOpenDispatch('YD增幅')}
              >
                去调度
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold text-[#0066CC]">8.5</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">↑ 较去年同期增幅+0.7pp</span>
                <span className="text-xs text-green-600">↑ 较上月增幅+0.1pp</span>
              </div>
            </div>
            {/* 月度趋势图 */}
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', value: 7.8, mom: 0.2, yoy: 0.2 },
                  { month: '202511', value: 8.0, mom: 0.2, yoy: 0.2 },
                  { month: '202512', value: 8.2, mom: 0.2, yoy: 0.2 },
                  { month: '202601', value: 8.3, mom: 0.1, yoy: 0.1 },
                  { month: '202602', value: 8.4, mom: 0.1, yoy: 0.1 },
                  { month: '202603', value: 8.5, mom: 0.1, yoy: 0.1 }
                ]}>
                  <XAxis dataKey="month" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[7.5, 9]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[0, 0.3]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" fill="#0066CC" radius={[1, 1, 0, 0]} name="增幅">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 5, fill: '#0066CC', fontWeight: 500 }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#00B050" strokeWidth={1.5} dot={{ r: 2 }} name="较去年同期增幅">
                    <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}pp`} style={{ fontSize: 5, fill: '#00B050', fontWeight: 500 }} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* 底部环比值 */}
            <div className="flex justify-around text-[6px] text-gray-500 mt-0.5 items-center">
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
            </div>
          </Card>

          {/* DX增幅 */}
          <Card className="p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">DX增幅</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {indicatorDescriptions['DX增幅']}
                  </div>
                </div>
              </div>
              <button
                className="text-xs text-[#0066CC] cursor-pointer hover:underline flex-shrink-0 hidden"
                onClick={() => handleOpenDispatch('DX增幅')}
              >
                去调度
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold text-[#FF9500]">7.2</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">↑ 较去年同期增幅+0.6pp</span>
                <span className="text-xs text-green-600">↑ 较上月增幅+0.1pp</span>
              </div>
            </div>
            {/* 月度趋势图 */}
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', value: 6.6, mom: 0.2, yoy: 0.2 },
                  { month: '202511', value: 6.8, mom: 0.2, yoy: 0.2 },
                  { month: '202512', value: 7.0, mom: 0.2, yoy: 0.2 },
                  { month: '202601', value: 7.1, mom: 0.1, yoy: 0.1 },
                  { month: '202602', value: 7.2, mom: 0.1, yoy: 0.1 },
                  { month: '202603', value: 7.2, mom: 0.0, yoy: 0.0 }
                ]}>
                  <XAxis dataKey="month" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[6, 7.5]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[0, 0.3]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" fill="#FF9500" radius={[1, 1, 0, 0]} name="增幅">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 5, fill: '#FF9500', fontWeight: 500 }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#00B050" strokeWidth={1.5} dot={{ r: 2 }} name="较去年同期增幅">
                    <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}pp`} style={{ fontSize: 5, fill: '#00B050', fontWeight: 500 }} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* 底部环比值 */}
            <div className="flex justify-around text-[6px] text-gray-500 mt-0.5 items-center">
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.2pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-gray-400 w-6 text-center">0.0pp</span>
            </div>
          </Card>

          {/* LT增幅 */}
          <Card className="p-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-bold text-gray-700">LT增幅</h4>
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-5 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {indicatorDescriptions['LT增幅']}
                  </div>
                </div>
              </div>
              <button
                className="text-xs text-[#0066CC] cursor-pointer hover:underline flex-shrink-0 hidden"
                onClick={() => handleOpenDispatch('LT增幅')}
              >
                去调度
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold text-[#00B050]">6.8</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">↑ 较去年同期增幅+0.4pp</span>
                <span className="text-xs text-green-600">↑ 较上月增幅+0.1pp</span>
              </div>
            </div>
            {/* 月度趋势图 */}
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { month: '202510', value: 6.4, mom: 0.1, yoy: 0.1 },
                  { month: '202511', value: 6.5, mom: 0.1, yoy: 0.1 },
                  { month: '202512', value: 6.6, mom: 0.1, yoy: 0.1 },
                  { month: '202601', value: 6.7, mom: 0.1, yoy: 0.1 },
                  { month: '202602', value: 6.8, mom: 0.1, yoy: 0.1 },
                  { month: '202603', value: 6.8, mom: 0.0, yoy: 0.0 }
                ]}>
                  <XAxis dataKey="month" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[6, 7]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 7 }} axisLine={false} tickLine={false} width={20} domain={[0, 0.2]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" fill="#00B050" radius={[1, 1, 0, 0]} name="增幅">
                    <LabelList dataKey="value" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 5, fill: '#00B050', fontWeight: 500 }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#00B050" strokeWidth={1.5} dot={{ r: 2 }} name="较去年同期增幅">
                    <LabelList dataKey="yoy" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}pp`} style={{ fontSize: 5, fill: '#00B050', fontWeight: 500 }} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* 底部环比值 */}
            <div className="flex justify-around text-[6px] text-gray-500 mt-0.5 items-center">
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-green-500 w-6 text-center">↑+0.1pp</span>
              <span className="text-gray-400 w-6 text-center">0.0pp</span>
            </div>
          </Card>
        </div>
      </div>
      )}

      {/* 去调度弹窗 */}
      <IndicatorDispatchDialog
        open={dispatchDialogOpen}
        onClose={() => setDispatchDialogOpen(false)}
        indicatorName={currentIndicatorName}
        scenario="usage-operation"
      />
    </div>
  );
}

// 指标树内容组件
function IndicatorTreeContent({ indicatorName, selectedMonth, currentTab }: { indicatorName: string; selectedMonth?: string; currentTab?: string }) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root'); // 默认选中根节点
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('2025-01');
  const finalSelectedMonth = selectedMonth !== undefined ? selectedMonth : internalSelectedMonth;
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>(getInitialIndicatorTreeData(indicatorName));
  const [strategyDispatchOpen, setStrategyDispatchOpen] = useState(false);

  // 仅「当月流量增幅」场景启用策略制定弹窗，其余场景保持原有跳转
  const isTrafficIncrease = indicatorName === '当月流量增幅';

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  // 根据选中的指标生成动态分析数据
  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator, indicatorTreeData)
    : analysisData;

  // 根据指标名称生成 pageId
  const getPageId = () => {
    if (indicatorName === '全量流量运营客户') {
      return 'portal.traffic.all-traffic';
    } else if (indicatorName === '流量地板价客户') {
      return 'portal.traffic.floor-price';
    } else if (indicatorName === '流量低饱和客户') {
      return 'portal.traffic.low-saturation';
    }
    return 'portal.traffic.all-traffic';
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      {/* 主内容区：左侧指标树 + 右侧分析面板 */}
      <div className="flex gap-4">
        {/* 左侧指标树 - 占60%，固定高度600px */}
        <div className="w-[60%] h-[600px] border rounded-lg overflow-auto relative">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <h3 className="text-sm font-semibold text-gray-700">指标树</h3>
            <div className="flex items-center gap-3">
              {/* 显示当前选择的月份 */}
              <span className="text-sm text-gray-600">{finalSelectedMonth}</span>
            </div>
          </div>

          {/* 悬浮工具栏 - 透明背景，右上角 */}
          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(12)
            </Button>
            <select className="border rounded px-3 py-2 text-sm bg-white/90 backdrop-blur-sm shadow-sm">
              <option>全部展开</option>
              <option>全部折叠</option>
              <option>仅展开预警节点</option>
            </select>
          </div>

          {/* 指标树内容 */}
          <div className="h-full pt-20 px-4">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={handleCardClick}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 - 占40% */}
        <div className="w-[40%] overflow-hidden">
          {/* 上部分：分析面板 - 固定高度600px */}
          <div className="h-[600px] mb-4">
            <AnalysisPanel
              indicatorName={indicatorName}
              selectedIndicator={selectedIndicator}
              indicatorTreeData={indicatorTreeData}
              analysisReasons={dynamicAnalysisData.analysisReasons}
              regionData={dynamicAnalysisData.regionData}
              topRegions={dynamicAnalysisData.topRegions}
              bottomRegions={dynamicAnalysisData.bottomRegions}
              trendData={dynamicAnalysisData.trendData}
              currentTab={currentTab}
              from="churn-retention"
              businessScenario="流量运营"
              onStrategyDispatch={isTrafficIncrease ? () => setStrategyDispatchOpen(true) : undefined}
              enableStrategyMaking={isTrafficIncrease}
            />
          </div>

          {/* 下部分：数据洞察报告 */}
          <div className="border border-gray-200 rounded-lg">
            <DataInsightReports
              pageId={getPageId()}
              maxDisplay={3}
              showViewAll={true}
            />
          </div>
        </div>
      </div>

      {isTrafficIncrease && (
        <StrategyDispatchDialog
          open={strategyDispatchOpen}
          onOpenChange={setStrategyDispatchOpen}
          indicatorName={indicatorName}
          scenario="流量运营"
        />
      )}
    </div>
  );
}

export default function TrafficOperationsPage() {
  // 区域筛选
  const [regionValue, setRegionValue] = useState<{ cityCode?: string; districtCode?: string; gridCode?: string }>({});
  const [regionLabel, setRegionLabel] = useState('全疆');

  // 检测是否从策略调度页面返回
  const [isFromStrategy, setIsFromStrategy] = useState(false);
  const [fromInsightOverview, setFromInsightOverview] = useState(false);

  // 检测来源页面
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromStrategy = searchParams.get('fromStrategy') === 'true';
    setIsFromStrategy(fromStrategy);
    setFromInsightOverview(searchParams.get('from') === 'insight-overview');

    // 处理URL tab参数，支持从菜单跳转
    const tabParam = searchParams.get('tab');
    if (tabParam === 'business') {
      setActiveTab('business-opportunity');
    } else if (tabParam === 'region') {
      setActiveTab('region-assault');
    } else if (tabParam === 'indicator') {
      setActiveTab('overview');
    }

    // 只在从策略调度返回时才读取 hash
    if (fromStrategy && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'overview' || hash === 'scale-tree' || hash === 'growth-tree' || hash === 'competition-tree') {
        setActiveTab(hash);
        console.log('[traffic-operations] Initial tab from hash:', hash);
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-03');
  const [isEditMode, setIsEditMode] = useState(false);

  // 处理URL tab参数，支持从菜单跳转
  const handleTabFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'business') {
      setActiveTab('business-opportunity');
    } else if (tabParam === 'region') {
      setActiveTab('region-assault');
    } else if (tabParam === 'indicator') {
      setActiveTab('overview');
    }
  }, []);

  // 监听 URL 变化（支持菜单跳转 + popstate）
  useEffect(() => {
    handleTabFromUrl();
    const handlePopState = () => handleTabFromUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleTabFromUrl]);

  // 监听 next.js 路由变化（点击菜单Link时触发）
  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleTabFromUrl();
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleTabFromUrl();
    };
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [handleTabFromUrl]);

  // 监听 URL hash 变化
  useEffect(() => {
    if (!isFromStrategy) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'overview' || hash === 'scale-tree' || hash === 'growth-tree' || hash === 'competition-tree') {
        setActiveTab(hash);
        console.log('[traffic-operations] Hash changed to:', hash);
      }
    };

    // 初始检查
    handleHashChange();

    // 监听 hash 变化
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isFromStrategy]);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleJumpToTree = (indicatorName: string) => {
    // 根据指标名称跳转到对应的Tab页
    if (indicatorName === '当月流量增幅') {
      setActiveTab('growth-tree');
    }
  };

  // 一级Tab状态：insight（指标洞察）、opportunity（商机驱动）、assault（区域攻坚）
  const [mainTab, setMainTab] = useState<string>(() => {
    if (activeTab === 'business-opportunity') return 'opportunity';
    if (activeTab === 'region-assault') return 'assault';
    return 'insight';
  });

  // 同步activeTab与mainTab
  const handleMainTabChange = (value: string) => {
    setMainTab(value);
    if (value === 'insight') {
      setActiveTab('overview');
    } else if (value === 'opportunity') {
      setActiveTab('business-opportunity');
    } else if (value === 'assault') {
      setActiveTab('region-assault');
    }
  };

  // 监听activeTab变化反向同步mainTab
  useEffect(() => {
    if (activeTab === 'business-opportunity') setMainTab('opportunity');
    else if (activeTab === 'region-assault') setMainTab('assault');
    else setMainTab('insight');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 + 一级Tab胶囊 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[#0085D0]">
          <span>市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span>存量运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">流量运营</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMainTabChange('insight')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'insight'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            指标洞察
          </button>
          <button
            onClick={() => handleMainTabChange('assault')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'assault'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            区域攻坚
          </button>
          <button
            onClick={() => handleMainTabChange('opportunity')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'opportunity'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            商机驱动
          </button>
        </div>
      </div>

      {/* 指标洞察 - 二级Tab Card + 筛选器 */}
      {mainTab === 'insight' && (
        <Card className="mx-6 mb-4 p-3">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 bg-transparent p-0 gap-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  指标概览
                </TabsTrigger>
                <TabsTrigger value="growth-tree" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  当月流量增幅
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3">
              <a
                href="/portal/capability/insight/tree-templates"
                className="text-sm text-[#0085D0] hover:underline cursor-pointer"
              >
                指标树模板
              </a>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:border-[#0085D0] focus:outline-none min-w-[130px]"
              />
              <XinjiangRegionSelector
                value={regionValue}
                onChange={(cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string) => {
                  setRegionValue({ cityCode, districtCode, gridCode });
                  const label = gridName || districtName || cityName || '全疆';
                  setRegionLabel(label);
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 内容区域 - 使用CSS隐藏保持状态 */}
      <div className="p-4">
        <div className={mainTab === 'insight' ? '' : 'hidden'}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview">
              <OverviewTab isEditMode={isEditMode} onJumpToTree={handleJumpToTree} />
            </TabsContent>

            <TabsContent value="growth-tree">
              <IndicatorTreeContent
                indicatorName="当月流量增幅"
                selectedMonth={selectedMonth}
                currentTab="growth-tree"
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className={mainTab === 'opportunity' ? '' : 'hidden'}>
          <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>}>
            <BusinessOpportunityTab regionDisplay={regionLabel} />
          </Suspense>
        </div>

        <div className={mainTab === 'assault' ? '' : 'hidden'}>
          <RegionAssaultTab selectedRegion={{ cityCode: regionValue.cityCode || '', districtCode: regionValue.districtCode || '', gridCode: regionValue.gridCode || '', isProvince: !regionValue.cityCode }} regionDisplay={regionLabel} scenario="traffic" />
        </div>
      </div>
    </div>
  );
}
