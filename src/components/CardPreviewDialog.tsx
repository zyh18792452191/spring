'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Info, AlertTriangle } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

// 维度配置类型
interface DimensionConfig {
  label: string;
  barIndicator: string;
  lineIndicator: string;
}

// 饼图指标配置类型
interface PieIndicator {
  name: string;  // 指标名称
  color: string; // 指标颜色
}

// 指标卡数据类型
interface IndicatorCard {
  id: number;
  cardName: string;
  cardTitle?: string;
  templateName: string;
  templateType: string;
  usageScenario: string;
  cardIcon: string;
  chartType: 'line' | 'bar' | 'pie' | 'barline' | 'area' | 'none' | 'flow';
  chartColor?: string; // 可选，纯文本卡片无需此字段
  size: string;
  indicatorGroupName: string;
  businessScenario: string;
  isCustomerGroup: boolean;
  indicatorTopic: string;
  createDept: string;
  creator: string;
  createTime: string;
  status: boolean;
  indicatorType?: '日指标' | '月指标';
  dataPeriod?: string; // 可选，纯文本卡片和流向卡无需此字段
  barIndicator?: string;
  barLegend?: string;
  lineIndicator?: string;
  lineLegend?: string;
  line2Indicator?: string;
  line2Legend?: string;
  enableAlarm?: boolean;
  enableDispatch?: boolean;
  enableIndicatorTree?: boolean;
  analysisType?: string;
  dimensions?: DimensionConfig[];
  mainIndicator?: string;
  indicatorUnit?: string;
  compareType?: '环比' | '同比';
  // 中高端客户运营配置
  yoyUnit?: '%' | '万' | '个' | 'pp';
  isRateIndicator?: boolean;
  businessScope?: string;
  flowType?: '流入' | '流出' | '汇总';
  flowColor?: string;
  cumulativeIndicator?: string;
  cumulativeUnit?: string;
  momIndicator?: string;
  relatedRateName?: string;
  relatedRateIndicator?: string;
  relatedRateUnit?: string;
  subModule?: string;
  valueDirection?: '正向' | '逆向';
  // 流向变化汇总卡字段（6根柱子）
  initialIndicatorName?: string;
  initialIndicator?: string;
  inflowIndicator1Name?: string;
  inflowIndicator1?: string;
  inflowIndicator2Name?: string;
  inflowIndicator2?: string;
  outflowIndicator1Name?: string;
  outflowIndicator1?: string;
  outflowIndicator2Name?: string;
  outflowIndicator2?: string;
  finalIndicatorName?: string;
  finalIndicator?: string;
  showNetChange?: boolean;
  // 饼图指标配置
  pieIndicators?: PieIndicator[];
  // 渠道排名配置（新增市场 - 渠道效能分析卡）
  showChannelRank?: boolean;
  channelRankIndicators?: string[];
}

interface CardPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: IndicatorCard;
}

// 生成维度数据（用于客户特征分析卡）
const generateDimensionData = (dimensions: DimensionConfig[]) => {
  if (!dimensions || dimensions.length === 0) {
    return [
      { label: '维度1', scale: 6.5, rate: 2.1 },
      { label: '维度2', scale: 8.2, rate: 2.8 },
      { label: '维度3', scale: 14.2, rate: 3.5 },
      { label: '维度4', scale: 13.8, rate: 3.1 },
      { label: '维度5', scale: 5.4, rate: 2.4 }
    ];
  }
  
  // 根据维度生成模拟数据
  return dimensions.map((dim, index) => ({
    label: dim.label || `维度${index + 1}`,
    scale: Math.round((5 + Math.random() * 15) * 10) / 10,  // 离网规模
    rate: Math.round((1.5 + Math.random() * 3) * 10) / 10   // 离网率
  }));
};

// 生成月度趋势数据（用于整体离网指标卡）
const generateMonthTrendData = (color: string) => [
  { month: '2月', value: 2.8, trend: 0.8 },
  { month: '3月', value: 3.2, trend: 1.2 },
  { month: '4月', value: 3.5, trend: 0.9 },
  { month: '5月', value: 3.9, trend: 1.1 },
  { month: '6月', value: 4.2, trend: 0.8 },
  { month: '7月', value: 4.5, trend: 0.7 }
];

const generateLineData = () => [
  { month: '2月', value: 97.2 },
  { month: '3月', value: 97.5 },
  { month: '4月', value: 97.8 },
  { month: '5月', value: 98.1 },
  { month: '6月', value: 98.4 },
  { month: '7月', value: 98.8 }
];

const generateBarData = () => [
  { month: '2月', value: 1280 },
  { month: '3月', value: 1350 },
  { month: '4月', value: 1420 },
  { month: '5月', value: 1380 },
  { month: '6月', value: 1450 },
  { month: '7月', value: 1520 }
];

const generateAreaData = () => [
  { month: '2月', value: 8500 },
  { month: '3月', value: 9200 },
  { month: '4月', value: 9800 },
  { month: '5月', value: 10500 },
  { month: '6月', value: 11200 },
  { month: '7月', value: 12000 }
];

// 生成客群看管卡趋势版数据
const generateSegmentTrendData = () => [
  { month: '2月', huanbi: 2.1, tongbi: 3.5 },
  { month: '3月', huanbi: 2.8, tongbi: 4.2 },
  { month: '4月', huanbi: 3.5, tongbi: 3.8 },
  { month: '5月', huanbi: 3.1, tongbi: 4.5 },
  { month: '6月', huanbi: 2.4, tongbi: 3.2 },
  { month: '7月', huanbi: 2.3, tongbi: 4.1 }
];

const generatePieData = (color: string) => [
  { name: '分类1', value: 45, color: color },
  { name: '分类2', value: 35, color: `${color}CC` },
  { name: '分类3', value: 15, color: `${color}99` },
  { name: '其他', value: 5, color: `${color}66` }
];

// 自定义 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-600 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.name}:</span>
            <span className="font-semibold text-gray-900">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CardPreviewDialog({
  open,
  onOpenChange,
  card
}: CardPreviewDialogProps) {
  const mounted = useMounted();
  const { 
    cardName, 
    cardTitle,
    chartType, 
    chartColor = '#0066CC', // 默认颜色
    templateType,
    templateName,
    barLegend,
    lineLegend,
    line2Legend,
    lineIndicator,
    line2Indicator,
    dimensions,
    yoyUnit,
    isRateIndicator
  } = card;
  
  // 显示名称
  const displayName = cardTitle || cardName;
  
  // 判断是否是客户特征分析卡
  const isFeatureAnalysis = templateType === '离网维系 - 客户特征分析卡' || templateType === '客户特征分析卡';
  
  // 判断是否是柱线指标组卡
  const isBarLineGroupCard = templateType === '柱线指标组卡';
  
  // 判断是否是客群看管卡/补充指标卡
  const isSegmentCard = templateType === '离网维系 - 客群看管卡' || templateType === '离网维系 - 补充指标卡' || templateType === '客群看管卡' || templateType === '补充指标卡';
  
  // 判断是否是趋势版（有折线图）
  const isTrendVersion = templateName?.includes('趋势版');
  
  // 判断是否是中高端客户运营概览页的卡片
  // 兼容两种格式：带业务前缀（如"中高端客户运营 - 整体指标卡"）和不带前缀（如"整体指标卡"）
  const isMidHighOverall = templateType === '中高端客户运营 - 整体指标卡' || templateType === '整体指标卡';
  const isMidHighValue = templateType === '中高端客户运营 - 价值提升卡' || templateType === '价值提升卡';
  const isMidHighScale = templateType === '中高端客户运营 - 规模发展卡' || templateType === '规模发展卡';
  const isMidHighFusion = templateType === '中高端客户运营 - 融合加固卡' || templateType === '融合加固卡';
  
  // 获取图例名称
  const barLabel = barLegend || '离网规模（万）';
  const lineLabel = lineLegend || '离网率（%）';

  // 中高端客户运营 - 模拟数据生成（使用固定种子确保一致性）
  const generateMidHighChartData = () => {
    const months = ['2月', '3月', '4月', '5月', '6月', '7月'];
    if (isRateIndicator) {
      // 比率类指标，Y轴从90%开始
      return months.map(month => ({
        month,
        value: 95 + Math.random() * 5,
        change: +(Math.random() * 2 - 0.5).toFixed(1)
      }));
    } else {
      // 数值类指标
      return months.map(month => ({
        month,
        value: 100 + Math.random() * 200,
        change: +(Math.random() * 10 - 2).toFixed(1)
      }));
    }
  };

  // 中高端客户运营 - 模拟指标值（使用合理的模拟值）
  const getMidHighIndicatorValue = () => {
    if (isRateIndicator) {
      // 融合加固卡指标值范围：40%-75%
      if (isMidHighFusion) {
        return (40 + Math.random() * 35).toFixed(1) + '%';
      }
      return (95 + Math.random() * 5).toFixed(1) + '%';
    }
  if (!mounted) return null;
    return (100 + Math.random() * 200).toFixed(1) + '万';
  };

  // 中高端客户运营 - 模拟环比值（格式：+3.8pp 或 -1.2%）
  const getMidHighChangeValue = () => {
    const change = (Math.random() * 4 - 1).toFixed(1);
    const unit = card.yoyUnit || (isRateIndicator ? 'pp' : '%');
    // 确保格式正确：正数带+号，负数保持-号
    return change.startsWith('-') ? change + unit : '+' + change + unit;
  };

  const renderChart = () => {
    // ========== 中高端客户运营概览页卡片 ==========
    
    // 中高端整体指标卡 - 与概览页样式一致
    if (isMidHighOverall) {
      const chartData = generateMidHighChartData();
      const yoyUnit = card.yoyUnit || (isRateIndicator ? 'pp' : '%');
      
      return (
        <div className="space-y-3">
          {/* 指标头部信息 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                <h4 className="text-sm text-gray-600">{displayName}</h4>
                {card.businessScope && (
                  <div className="relative group cursor-pointer">
                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                    <div className="absolute left-0 top-6 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                        {card.businessScope}
                      </div>
                    </div>
                  </div>
                )}
                {card.enableDispatch && (
                  <span className="text-xs text-[#0066CC] cursor-pointer hover:underline ml-1">去调度</span>
                )}
                {card.enableIndicatorTree && (
                  <span className="text-xs text-[#0066CC] cursor-pointer hover:underline ml-1">指标树分析</span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-2xl font-bold text-gray-900">{getMidHighIndicatorValue()}</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">环比</span>
                  <span className="text-xs font-medium text-green-600">{getMidHighChangeValue()}</span>
                </div>
              </div>
            </div>
            {card.enableAlarm && (
              <AlertTriangle className="h-4 w-4 text-orange-500 cursor-pointer" />
            )}
          </div>
          
          {/* 图表区域 */}
          <div className="border-t pt-2">
            {/* 图例 */}
            <div className="mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1E90FF' }}></div>
                  <span className="text-xs text-gray-500">指标值</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
                  <span className="text-xs text-gray-500">环比（{yoyUnit}）</span>
                </div>
              </div>
            </div>
            
            {/* 柱线图 */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={isRateIndicator ? [90, 100] : ['auto', 'auto']}
                  />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const nameMap: Record<string, string> = {
                        'value': '指标值',
                        'change': `环比（${yoyUnit}）`
                      };
                      return [typeof value === 'number' ? value.toFixed(1) : value, nameMap[name] || name];
                    }}
                  />
                  <Bar yAxisId="left" dataKey="value" fill="#1E90FF" name="指标值" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="change" stroke="#FF6B6B" strokeWidth={2} name={`环比（${yoyUnit}）`} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }
    
    // 中高端价值提升卡 - 与概览页样式一致
    if (isMidHighValue) {
      const chartData = generateMidHighChartData();
      const direction = card.valueDirection || card.subModule || '正向';
      const subModuleTitle = direction === '正向' ? '正向提值' : '逆向控损';
      
      return (
        <div className="space-y-3">
          {/* 子模块标题 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-semibold text-gray-700">{subModuleTitle}</div>
          </div>
          
          {/* 指标头部信息 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 font-medium">{displayName}</span>
            {card.businessScope && (
              <div className="relative group">
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 max-w-xs">
                  {card.businessScope}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-xl font-bold text-gray-900">{getMidHighIndicatorValue()}</div>
            <span className="text-xs text-green-600">{getMidHighChangeValue()}</span>
          </div>
          
          {/* 图表区域 */}
          <div className="border-t pt-2">
            <div className="mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1E90FF' }}></div>
                  <span className="text-xs text-gray-500">指标值</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
                  <span className="text-xs text-gray-500">环比（%）</span>
                </div>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="value" fill="#1E90FF" name="指标值" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="change" stroke="#FF6B6B" strokeWidth={2} name="环比（%）" dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }
    
    // 中高端规模发展卡 - 与概览页样式一致
    if (isMidHighScale) {
      const flowType = card.flowType || '流入';
      const flowColor = card.flowColor || (flowType === '流入' ? '#00B050' : flowType === '流出' ? '#FF4444' : '#0066CC');
      
      // 流入/流出指标卡 - 纯文本卡片
      if (flowType === '流入' || flowType === '流出') {
        return (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <div 
                className="w-1 h-12 rounded-full flex-shrink-0" 
                style={{ backgroundColor: flowColor }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs text-gray-600 truncate">{displayName}</span>
                  {card.businessScope && (
                    <div className="relative group flex-shrink-0">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="absolute left-0 top-5 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-64">
                        <div><strong>{flowType === '流出' ? '累计流出：' : '累计流入：'}</strong>{card.businessScope}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-900">{(Math.random() * 1000).toFixed(1)}万</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      环比 <span style={{ color: flowColor }}>{(Math.random() * 20 - 5).toFixed(1)}%</span>
                    </div>
                  </div>
                  {flowType === '流出' && card.relatedRateName && (
                    <div className="flex-1 border-l border-gray-200 pl-2">
                      <div className="text-lg font-bold text-gray-900">{(Math.random() * 5).toFixed(2)}%</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{card.relatedRateName}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // 汇总卡 - 柱状图
      if (flowType === '汇总') {
        const flowChartData = [
          { name: '期初', value: 42654, color: '#0066CC' },
          { name: '流入1', value: 496, color: '#00B050' },
          { name: '流入2', value: 3105, color: '#00B050' },
          { name: '流出1', value: 412, color: '#FF4444' },
          { name: '流出2', value: 4005, color: '#FF8C00' },
          { name: '期末', value: 41838, color: '#0066CC' },
        ];
        
        return (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">中高端客户流向变化</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowChartData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {flowChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: '#0066CC' }}></div>
                <span>期初/期末</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: '#00B050' }}></div>
                <span>流入</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: '#FF4444' }}></div>
                <span>流出（流失）</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: '#FF8C00' }}></div>
                <span>流出（降档）</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">净增：</span>
              <span className="text-lg font-bold text-red-600">-816万</span>
            </div>
          </div>
        );
      }
    }
    
    // 中高端融合加固卡 - 与概览页样式一致
    if (isMidHighFusion) {
      const chartData = generateMidHighChartData();
      const yoyUnit = card.yoyUnit || 'pp';
      
      return (
        <div className="space-y-3">
          {/* 指标头部信息 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 font-medium">{displayName}</span>
            {card.businessScope && (
              <div className="relative group">
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 max-w-xs">
                  {card.businessScope}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-xl font-bold text-gray-900">{getMidHighIndicatorValue()}</div>
            <span className="text-xs text-green-600">{getMidHighChangeValue()}</span>
          </div>
          
          {/* 图表区域 */}
          <div className="border-t pt-2">
            <div className="mb-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#1E90FF' }}></div>
                  <span className="text-[10px] text-gray-500">指标值</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-0.5 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
                  <span className="text-[10px] text-gray-500">环比（{yoyUnit}）</span>
                </div>
              </div>
            </div>
            <div className="h-14">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="value" fill="#1E90FF" name="指标值" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="change" stroke="#FF6B6B" strokeWidth={1.5} name={`环比（${yoyUnit}）`} dot={{ r: 1.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }
    
    // ========== 离网维系卡片 ==========
    
    // 客群看管卡/补充指标卡 - 趋势版（带折线图）
    if (isSegmentCard && isTrendVersion) {
      return (
        <div className="space-y-4">
          {/* 数值展示区 */}
          <div className="flex items-end gap-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">{card.mainIndicator || '主指标'}</div>
              <div className="text-2xl font-bold text-gray-900">12,458</div>
            </div>
          </div>
          
          {/* 折线图 */}
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={generateSegmentTrendData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={24}
                iconType="circle"
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
              {/* 环比折线 */}
              <Line
                type="monotone"
                dataKey="huanbi"
                name={lineLegend || "环比（%）"}
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, strokeWidth: 2, r: 3 }}
              />
              {/* 同比折线（如果配置了） */}
              {line2Indicator && (
                <Line
                  type="monotone"
                  dataKey="tongbi"
                  name={line2Legend || "同比（%）"}
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    // 如果是客户特征分析卡，使用维度数据
    if (isFeatureAnalysis && chartType === 'barline') {
      const dimensionData = generateDimensionData(dimensions || []);
      
      return (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dimensionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10 }} 
              stroke="#9CA3AF"
              axisLine={{ stroke: '#E5E7EB' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11 }} 
              stroke="#9CA3AF"
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }} 
              stroke="#9CA3AF"
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
            />
            <Bar 
              yAxisId="left"
              dataKey="scale" 
              name={barLabel}
              fill={chartColor} 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rate"
              name={lineLabel}
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
    
    // 其他类型的图表
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={generateLineData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                name="值"
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={generateBarData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="值"
                fill={chartColor} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        // 使用配置的饼图指标生成预览数据
        const pieIndicators = card.pieIndicators || [];
        const pieData = pieIndicators.length > 0 
          ? pieIndicators.map((indicator: any, index: number) => ({
              name: indicator.name || `分类${index + 1}`,
              value: 25 + Math.random() * 50, // 模拟数据
              color: indicator.color || chartColor,
              yoy: Math.random() * 30 - 5 // 模拟同比增长
            }))
          : generatePieData(chartColor);
        
        // 渠道排名数据（用于新增市场 - 渠道效能分析卡）
        const showChannelRank = card.showChannelRank;
        const channelRankIndicators = card.channelRankIndicators || [];
        const channelRankData = [
          { name: '实体渠道', value: 63.3, color: '#3B82F6' },
          { name: '直销渠道', value: 19.2, color: '#10B981' },
          { name: '线上渠道', value: 15.1, color: '#F59E0B' },
          { name: '泛渠道', value: 1.4, color: '#8B5CF6' },
          { name: '政企渠道', value: 0.9, color: '#EC4899' }
        ];
        
        return (
          <div className="space-y-3">
            {/* 饼图与渠道排名并排区域（如果配置了showChannelRank） */}
            {showChannelRank ? (
              <div className="flex items-center h-36">
                {/* 左侧：环形图 */}
                <div className="w-1/2 h-full flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* 环形图图例 */}
                  <div className="absolute bottom-2 left-1/4 flex gap-3 text-xs">
                    {pieData.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 右侧：渠道类型排名 */}
                <div className="w-1/2 pl-2">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">渠道类型排名</h5>
                  <div className="space-y-1.5">
                    {channelRankData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 默认饼图布局 */
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* 底部明细数据区域 */}
            {pieIndicators.length > 0 && !showChannelRank && (
              <div className="space-y-2 pt-2 border-t">
                {pieData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{(10 + Math.random() * 30).toFixed(1)}万</span>
                      <span className={item.yoy >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                        {item.yoy >= 0 ? '+' : ''}{item.yoy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'barline':
        // 柱线指标组卡：显示维度的柱线图（不是时间趋势）
        if (isBarLineGroupCard) {
          const barLineGroupData = [
            { name: 'A类', value: 12.5, change: 2.3 },
            { name: 'B类', value: 18.2, change: -1.5 },
            { name: 'C类', value: 9.8, change: 3.2 },
            { name: 'D类', value: 15.3, change: 1.8 },
            { name: 'E类', value: 11.7, change: 0.9 }
          ];
          return (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={barLineGroupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  stroke="#9CA3AF"
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11 }} 
                  stroke="#9CA3AF"
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }} 
                  stroke="#9CA3AF"
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="value" 
                  name={barLabel}
                  fill={chartColor} 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="change"
                  name={lineLabel}
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          );
        }
        // 整体指标卡使用月度趋势数据
        const barLineData = generateMonthTrendData(chartColor);
        return (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={barLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
              <Bar 
                dataKey="value" 
                name="值"
                fill={chartColor} 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="trend"
                name="同比"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={generateAreaData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="#9CA3AF"
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="值"
                stroke={chartColor}
                fill={`${chartColor}33`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'none':
        // 客群看管卡/补充指标卡的基础版 - 数值卡片样式
        return (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* 顶部标题区域 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-base font-medium text-gray-800">{card.cardName || '指标名称'}</span>
                <button className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 数据区域 */}
            <div className="px-4 py-4">
              {/* 标签 */}
              <div className="text-xs text-gray-400 mb-2">{card.mainIndicator || '客户规模(户)'}</div>
              
              {/* 数值与环比 */}
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-gray-900">856.3万</div>
                
                {/* 环比 - 配了就显示 */}
                {lineIndicator && (
                  <div className="flex items-center gap-1 pb-1">
                    <span className="text-xs text-gray-500">环比</span>
                    <span className="text-sm font-semibold text-green-600">2.1%</span>
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* 同比 - 配了就显示 */}
              {line2Indicator && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-gray-500">同比</span>
                  <span className="text-sm font-semibold text-blue-600">+4.1%</span>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return <div className="text-center text-gray-400 py-20">暂无图表</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>指标卡预览（{displayName}）</DialogTitle>
        </DialogHeader>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            {/* 指标名称 */}
            <div className="text-base font-semibold text-gray-900 mb-3">
              {displayName}
            </div>
            
            {/* 图例说明（客户特征分析卡） */}
            {isFeatureAnalysis && (
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColor }}></div>
                  <span>{barLabel}</span>
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                  <span>{lineLabel}</span>
                </span>
              </div>
            )}
            
            {/* 图表区域 */}
            {renderChart()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
