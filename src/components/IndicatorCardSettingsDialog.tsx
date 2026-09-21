'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2 } from 'lucide-react';

// 维度配置类型
interface DimensionConfig {
  label: string;
  barIndicator: string;
  lineIndicator: string;
}

// 流向变化柱子配置
interface FlowChangeBar {
  name: string;           // 柱子名称
  type: 'start' | 'inflow' | 'outflow' | 'end';  // 柱子类型
  indicator: string;      // 关联指标
  color?: string;         // 自定义颜色
}

// 柱线指标组配置（柱和线一一对应）
interface BarLineIndicatorGroup {
  barIndicator: string;   // 柱状图指标
  barLegend?: string;     // 柱状图图例
  lineIndicator: string;  // 折线图指标（同比/环比）
  lineLegend?: string;    // 折线图图例
}

// 饼图指标配置（支持动态添加）
// 注意：指标值和环比值从数据库自动查询，无需配置
interface PieIndicator {
  name: string;           // 指标名称（下拉选择）
  color?: string;         // 颜色
}

// 指标卡数据类型
interface IndicatorCard {
  id: number;
  cardName: string;
  cardTitle?: string;
  templateName: string;
  templateType: string;
  usageScenario: string;
  indicatorGroupName: string;
  indicatorTopic: string;
  indicatorType?: '日指标' | '月指标';
  dataPeriod?: string;
  priority?: number;
  // 基础指标配置（新增市场整体增量卡）
  basicIndicator?: string;
  basicValue?: string;
  momValue?: string;
  momUnit?: string;
  barIndicator?: string;
  barLegend?: string;
  lineIndicator?: string;
  lineLegend?: string;
  line2Indicator?: string;
  line2Legend?: string;
  line3Indicator?: string;
  line3Legend?: string;
  enableAlarm?: boolean;
  enableDispatch?: boolean;
  enableIndicatorTree?: boolean;
  analysisType?: string;
  dimensions?: DimensionConfig[];
  mainIndicator?: string;
  compareType?: '环比' | '同比';
  enableDrillDown?: boolean;
  enableColoring?: boolean;
  indicatorDirection?: '正向' | '负向';
  // 中高端客户运营字段
  subModule?: string;
  yoyUnit?: '%' | '万' | '个' | 'pp';
  isRateIndicator?: boolean;
  valueDirection?: '正向' | '逆向';
  flowType?: '流入' | '流出' | '汇总';
  flowColor?: string;
  cumulativeIndicator?: string;
  cumulativeUnit?: string;
  momIndicator?: string;
  relatedRateName?: string;
  relatedRateIndicator?: string;
  relatedRateUnit?: string;
  // 流向变化汇总卡字段
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
  // 目标完成配置（国际运营整体指标卡）
  targetRateIndicator?: string;   // 目标完成率指标（如 "目标完成率"）
  targetGapIndicator?: string;    // 目标差距指标（如 "目标差距"）
  
  // 目标与方向分析卡专用
  targetIndicator?: string;       // TOP10方向指标（销量/收入）
  targetUnit?: string;            // TOP10方向单位（万/亿）
  // 新增市场 - 面积趋势卡配置
  areaIndicator?: string;
  areaLegend?: string;
  // 新增市场 - 饼图分析卡配置（改为动态添加）
  pieIndicators?: PieIndicator[]; // 饼图指标列表（动态添加）
  showChannelRank?: boolean;      // 是否显示渠道排名
  channelRankIndicators?: string[]; // 渠道排名指标列表
  
  // ========== 国际运营 - 多指标配置 ==========
  multiBarIndicators?: string[];  // 多柱状图指标列表（用于收入分析等需要动态添加指标的卡片）
  multiBarLegends?: string[];     // 多柱状图图例列表
  
  // ========== 国际运营 - 柱线指标组配置 ==========
  barLineGroups?: BarLineIndicatorGroup[];  // 柱线指标组（柱和线一一对应）
  
  // ========== 产品明细版专用配置 ==========
  subCard1BarIndicator?: string;    // 子卡片1柱状图指标（大包多天）
  subCard1BarLegend?: string;       // 子卡片1柱状图图例
  subCard2BarIndicator?: string;    // 子卡片2柱状图指标（漫游99）
  subCard2BarLegend?: string;       // 子卡片2柱状图图例
  
  // ========== 收入结构趋势卡配置 ==========
  multiLineIndicators?: { indicator: string; legend: string }[];  // 多折线指标列表
  
  // ========== 分省目标达成卡配置 ==========
  achievedIndicatorName?: string;  // 已达成指标名称
  unachievedIndicatorName?: string; // 未达成指标名称
  achievedCount?: string;           // 已达成数量
  unachievedCount?: string;         // 未达成数量
}

// 表单数据类型
interface IndicatorCardSettings {
  // ========== 基础信息 ==========
  cardName: string;
  cardTitle: string;
  indicatorGroupName: string;
  usageScenario: string;
  indicatorTopic: string;
  priority: number;
  templateType: string;
  templateName: string;
  dataPeriod: string;
  chartType?: 'line' | 'bar' | 'pie' | 'barline' | 'area' | 'none' | 'flow'; // 图表类型
  
  // ========== 离网维系配置 ==========
  // 整体离网指标卡配置
  barIndicator: string;
  barLegend: string;
  lineIndicator: string;
  lineLegend: string;
  line2Indicator?: string;
  line2Legend?: string;
  line3Indicator?: string;
  line3Legend?: string;
  enableAlarm: boolean;
  enableDispatch: boolean;
  enableIndicatorTree: boolean;
  
  // 客户特征分析卡配置
  analysisType: string;
  dimensions: DimensionConfig[];
  
  // 客群看管卡/补充指标卡配置
  mainIndicator: string;
  compareType: '环比' | '同比';
  
  // 交互配置
  enableDrillDown: boolean;
  enableColoring: boolean;
  indicatorDirection: '正向' | '负向';
  
  // ========== 中高端客户运营配置 ==========
  // 上方展示指标
  basicIndicator?: string;        // 基础指标（上方当前值）
  momIndicator?: string;          // 环比指标（上方环比值）
  yoyIndicator?: string;          // 同比指标（上方同比值，增强版）
  
  // 下方图表指标
  chartBarIndicator?: string;     // 柱状图指标
  chartBarLegend?: string;        // 柱状图图例
  chartLineIndicator?: string;    // 折线图指标
  chartLineLegend?: string;       // 折线图图例
  chartLine2Indicator?: string;   // 折线图2指标（增强版）
  chartLine2Legend?: string;      // 折线图2图例（增强版）
  chartLine3Indicator?: string;   // 折线图3指标（完整版）
  chartLine3Legend?: string;      // 折线图3图例（完整版）
  
  // 价值提升卡专用
  subModule?: string;             // 子模块（正向提值/逆向控损）
  
  // 规模发展卡 - 流入指标卡专用
  cumulativeIndicator?: string;   // 累计指标
  cumulativeUnit?: string;        // 累计单位
  
  // 规模发展卡 - 流出指标卡专用
  relatedRateName?: string;       // 关联比率名称
  relatedRateIndicator?: string;  // 关联比率指标
  relatedRateUnit?: string;       // 关联比率单位
  
  // 规模发展卡 - 流向变化汇总卡专用
  initialIndicator?: string;      // 期初指标
  initialIndicatorName?: string;  // 期初指标名称
  inflowIndicator1Name?: string;  // 流入指标1名称
  inflowIndicator1?: string;      // 流入指标1
  inflowIndicator2Name?: string;  // 流入指标2名称
  inflowIndicator2?: string;      // 流入指标2
  outflowIndicator1Name?: string; // 流出指标1名称
  outflowIndicator1?: string;     // 流出指标1
  outflowIndicator2Name?: string; // 流出指标2名称
  outflowIndicator2?: string;     // 流出指标2
  finalIndicator?: string;        // 期末指标
  finalIndicatorName?: string;    // 期末指标名称
  showNetChange?: boolean;        // 是否展示净增
  flowChangeBars?: FlowChangeBar[]; // 流向变化柱子列表（新版动态配置）
  
  // 其他配置
  isRateIndicator?: boolean;      // 是否为比率型指标
  flowType?: string;              // 流向类型（流入/流出/汇总）
  
  // 目标完成配置（国际运营整体指标卡）
  targetRateIndicator?: string;   // 目标完成率指标（如 "目标完成率"）
  targetGapIndicator?: string;    // 目标差距指标（如 "目标差距"）
  
  // 目标与方向分析卡专用
  targetIndicator?: string;       // TOP10方向指标（销量/收入）
  targetUnit?: string;            // TOP10方向单位（万/亿）
  
  // ========== 新增市场配置 ==========
  // 整体增量卡专用
  basicValue?: string;            // 基础指标值
  momValue?: string;              // 环比值
  momUnit?: string;               // 环比单位（%/pp）
  
  // 面积趋势卡专用
  areaIndicator?: string;         // 面积图指标
  areaLegend?: string;            // 面积图图例
  
  // 饼图分析卡专用（改为动态添加）
  pieIndicators?: PieIndicator[]; // 饼图指标列表（动态添加，只需配置指标名称和颜色，值从数据库查询）
  showChannelRank?: boolean;      // 是否显示渠道排名
  channelRankIndicators?: string[]; // 渠道排名指标列表
  
  // ========== 国际运营 - 多指标配置 ==========
  multiBarIndicators?: string[];  // 多柱状图指标列表（用于收入分析等需要动态添加指标的卡片）
  multiBarLegends?: string[];     // 多柱状图图例列表
  
  // ========== 国际运营 - 柱线指标组配置 ==========
  barLineGroups?: BarLineIndicatorGroup[];  // 柱线指标组（柱和线一一对应）
  
  // ========== 产品明细版专用配置 ==========
  subCard1BarIndicator?: string;    // 子卡片1柱状图指标（大包多天）
  subCard1BarLegend?: string;       // 子卡片1柱状图图例
  subCard2BarIndicator?: string;    // 子卡片2柱状图指标（漫游99）
  subCard2BarLegend?: string;       // 子卡片2柱状图图例
  
  // ========== 收入结构趋势卡配置 ==========
  multiLineIndicators?: { indicator: string; legend: string }[];  // 多折线指标列表
  
  // ========== 分省目标达成卡配置 ==========
  achievedIndicatorName?: string;  // 已达成指标名称
  unachievedIndicatorName?: string; // 未达成指标名称
  achievedCount?: string;           // 已达成数量
  unachievedCount?: string;         // 未达成数量
}

interface IndicatorCardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: IndicatorCard;
  onSave?: (settings: IndicatorCardSettings) => void;
}

// 下拉选项配置
const usageScenarioOptions = [
  '离网维系概览页',
  '中高端客户运营概览页',
  '新增市场概览页',
  '国际运营概览页'
];

// ========== 模板类型收敛设计 ==========
// 将原有29种模板类型收敛为8种通用卡片模板
// 使用场景（usageScenario）与模板类型分离，指标选项根据使用场景动态加载

const templateTypeOptions = [
  // 通用模板类型
  '整体指标卡',           // 合并：离网维系-整体离网指标卡、中高端-整体指标卡、国际运营-整体指标卡、新增市场-整体增量卡
  '迷你指标卡',           // 合并：出访规模卡、使用订购卡
  '柱线指标组卡',         // 合并：自有渠道明细、合作渠道明细、产品类型分布、产品明细、产品类型收入、标准资费收入、大包多天收入、漫游99收入
  '分省分布卡',           // 合并：分省情况卡、销量分省目标卡、收入分省目标卡、分省目标达成卡
  '排名分析卡',           // 合并：销量TOP10方向卡、收入TOP10方向卡
  '饼图分析卡',           // 渠道占比卡
  // 业务专用卡片（保持独立）
  '客户特征分析卡',       // 多维度特征分析
  '客群看管卡',           // 客群看管专用
  '补充指标卡',           // 补充指标专用
  '价值提升卡',           // 中高端价值提升专用
  '规模发展卡',           // 中高端规模发展专用（流入/流出/流向变化）
  '融合加固卡',           // 中高端融合加固专用
  '质量分析卡',           // 新增市场质量分析专用
  '收入结构趋势卡',       // 国际运营收入结构专用
  '出访行为趋势卡',       // 国际运营DOU/MOU/ARPU趋势专用
];

// 指标卡模板配置（模板类型 -> 模板列表）
interface TemplateConfig {
  name: string;        // 模板名称
  description: string; // 模板说明
  lines: number;       // 折线数量
}

const templateOptionsMap: Record<string, TemplateConfig[]> = {
  // ========== 通用模板 ==========
  '整体指标卡': [
    { name: '基础版', description: '柱状图+环比折线', lines: 1 },
    { name: '增强版', description: '柱状图+环比+同比折线', lines: 2 },
    { name: '完整版', description: '柱状图+环比+同比+目标折线', lines: 3 }],
  '迷你指标卡': [
    { name: '基础版', description: '指标值+趋势图', lines: 1 }],
  '柱线指标组卡': [
    { name: '横向柱线版', description: '横向柱线图，适用于渠道明细', lines: 0 },
    { name: '纵向柱线版', description: '纵向柱线图，适用于产品分布', lines: 0 },
    { name: '产品明细版', description: '大包多天+漫游99双柱状图', lines: 0 }],
  '分省分布卡': [
    { name: '基础版', description: '16地市分公司柱线图分布', lines: 1 },
    { name: '目标版', description: '分省目标达成展示', lines: 1 }],
  '排名分析卡': [
    { name: 'TOP10版', description: 'TOP10排名展示', lines: 1 }],
  '饼图分析卡': [
    { name: '基础版', description: '饼图占比分析', lines: 0 }],
  // ========== 业务专用模板 ==========
  '客户特征分析卡': [
    { name: '年龄分布', description: '年龄段维度分析', lines: 1 },
    { name: 'ARPU分层', description: 'ARPU维度分析', lines: 1 },
    { name: '带宽分段', description: '带宽维度分析', lines: 1 },
    { name: '卡槽状态', description: '卡槽状态维度分析', lines: 1 },
    { name: '自定义维度', description: '自定义维度分析', lines: 1 }],
  '客群看管卡': [
    { name: '基础版', description: '数值+环比', lines: 0 },
    { name: '趋势版', description: '数值+趋势图', lines: 1 }],
  '补充指标卡': [
    { name: '基础版', description: '数值+环比', lines: 0 },
    { name: '趋势版', description: '数值+趋势图', lines: 1 }],
  '价值提升卡': [
    { name: '正向提值版', description: '正向提值指标展示', lines: 1 },
    { name: '逆向控损版', description: '逆向控损指标展示', lines: 1 }],
  '规模发展卡': [
    { name: '流入指标版', description: '流入类型指标', lines: 0 },
    { name: '流出指标版', description: '流出类型指标（含率值）', lines: 0 },
    { name: '流向变化版', description: '流向变化汇总图', lines: 0 }],
  '融合加固卡': [
    { name: '基础版', description: '融合率指标追踪', lines: 1 }],
  '质量分析卡': [
    { name: '柱线追踪版', description: '柱状图+环比折线', lines: 1 },
    { name: '双轴追踪版', description: '双Y轴（ARPU + 占比）', lines: 1 },
    { name: '面积趋势版', description: '面积图趋势展示', lines: 0 },
    { name: '饼图分析版', description: '饼图+渠道排名', lines: 0 }],
  '收入结构趋势卡': [
    { name: '多线趋势版', description: '多线趋势图', lines: 0 }],
  '出访行为趋势卡': [
    { name: '基础版', description: 'DOU/MOU/ARPU趋势展示', lines: 0 }],
};

// ========== 使用场景到指标选项的映射 ==========

// 根据使用场景获取整体指标卡的柱指标选项
const getBarIndicatorOptions = (usageScenario: string): string[] => {
  switch (usageScenario) {
    case '离网维系概览页':
      return ['当月全量离网客户数', '当月拍照中高端离网客户数', '当月拍照全球通离网客户数', '全量客户离网率', '拍照中高端离网率', '拍照全球通离网率'];
    case '中高端客户运营概览页':
      return ['高价值客户数', '中高端客户数', 'ARPU', '客户保有率', '价值保有率'];
    case '新增市场概览页':
      return ['新增客户数', '新增收入', '新客户ARPU', '新客户留存率'];
    case '国际运营概览页':
      return ['出访客户数', '漫游收入', '国际业务收入', '出访人次', '订购量', '激活量'];
    default:
      return [];
  }
};

// 根据使用场景获取整体指标卡的环比指标选项
const getMomIndicatorOptions = (usageScenario: string): string[] => {
  switch (usageScenario) {
    case '离网维系概览页':
      return ['离网规模环比', '离网率环比', '离网客户数环比', '中高端离网规模环比', '中高端离网率环比'];
    case '中高端客户运营概览页':
      return ['高价值客户数环比', '中高端客户数环比', 'ARPU环比', '客户保有率环比'];
    case '新增市场概览页':
      return ['新增客户数环比', '新增收入环比', '新客户ARPU环比'];
    case '国际运营概览页':
      return ['出访客户数环比', '漫游收入环比', '订购量环比'];
    default:
      return ['环比变化', '环比增长率'];
  }
};

// 根据使用场景获取整体指标卡的同比指标选项
const getYoyIndicatorOptions = (usageScenario: string): string[] => {
  switch (usageScenario) {
    case '离网维系概览页':
      return ['离网规模同比', '离网率同比', '离网客户数同比', '中高端离网规模同比', '中高端离网率同比'];
    case '中高端客户运营概览页':
      return ['高价值客户数同比', '中高端客户数同比', 'ARPU同比', '客户保有率同比'];
    case '新增市场概览页':
      return ['新增客户数同比', '新增收入同比', '新客户ARPU同比'];
    case '国际运营概览页':
      return ['出访客户数同比', '漫游收入同比', '订购量同比', '激活量同比'];
    default:
      return ['同比变化', '同比增长率'];
  }
};

// 根据使用场景获取柱线指标组卡的柱指标选项
const getBarLineGroupBarOptions = (usageScenario: string, templateName?: string): string[] => {
  // 国际运营场景下的具体指标选项
  if (usageScenario === '国际运营概览页') {
    // 根据模板名称返回不同的指标选项
    if (templateName?.includes('渠道')) {
      return ['订购量', '激活量'];
    }
    if (templateName?.includes('产品类型')) {
      return ['大包多天', '漫游99流量语音包', '大湾区港澳包', '国漫流量月包', '国漫语音月包', '国漫流量加油包'];
    }
    if (templateName?.includes('产品明细') || templateName === '纵向柱线版') {
      return ['订购量', '激活量'];
    }
    // 收入相关
    if (templateName?.includes('收入') || templateName === '纵向柱线版') {
      return ['大包多天收入', '漫游99收入', '标准资费收入', '其他收入'];
    }
    return ['订购量', '激活量', '收入'];
  }
  return ['订购量', '激活量', '收入'];
};

// 根据使用场景获取柱线指标组卡的线指标选项
const getBarLineGroupLineOptions = (usageScenario: string): string[] => {
  return ['同比变化', '环比变化'];
};

// 根据模板类型获取指标卡模板列表
const getTemplateOptions = (templateType: string): TemplateConfig[] => {
  return templateOptionsMap[templateType] || [];
};

const indicatorTopicOptions = [
  '整体离网指标',
  '离网客户特征分析',
  '客群看管-重点客群看管',
  '客群看管-补充指标',
  // 中高端客户运营指标专题
  '整体指标',
  '价值提升',
  '规模发展',
  '融合加固',
  // 新增市场指标专题
  '整体增量',
  '质量分析',
  // 国际运营指标专题
  '国际运营-整体指标',
  '国际运营-出访客户分析',
  '国际运营-产品分析',
  '国际运营-收入分析'
];

const analysisTypeOptions = [
  '年龄分布',
  'ARPU分层',
  '带宽分段',
  '卡槽状态',
  '自定义'
];

// 日指标数据周期选项
const dailyPeriodOptions = ['7天', '15天', '30天', '60天'];
// 月指标数据周期选项
const monthlyPeriodOptions = ['当月', '3个月', '6个月', '12个月'];

// ========== 指标选项配置（兼容旧配置，逐步迁移到动态加载） ==========

// 整体离网指标卡的柱状图指标选项（兼容旧配置）
const barIndicatorOptionsForOverall = [
  '当月全量离网客户数',
  '当月拍照中高端离网客户数',
  '当月拍照全球通离网客户数',
  '全量客户离网率',
  '拍照中高端离网率',
  '拍照全球通离网率'
];

// 整体离网指标卡的折线图1指标选项（环比类）
const line1IndicatorOptionsForOverall = [
  '离网规模环比',
  '离网率环比',
  '离网客户数环比',
  '中高端离网规模环比',
  '中高端离网率环比'
];

// 整体离网指标卡的折线图2指标选项（同比类）
const line2IndicatorOptionsForOverall = [
  '离网规模同比',
  '离网率同比',
  '离网客户数同比',
  '中高端离网规模同比',
  '中高端离网率同比'
];

// 整体离网指标卡的折线图3指标选项（目标类）
const line3IndicatorOptionsForOverall = [
  '离网规模目标',
  '离网率目标',
  '离网客户数目标',
  '中高端离网规模目标',
  '中高端离网率目标'
];

// 客群看管卡/补充指标卡的环比指标选项
const segmentLine1IndicatorOptions = [
  '规模环比',
  '客户数环比',
  '占比环比',
  '规模变化率环比',
  '客户数变化率环比'
];

// 客群看管卡/补充指标卡的同比指标选项
const segmentLine2IndicatorOptions = [
  '规模同比',
  '客户数同比',
  '占比同比',
  '规模变化率同比',
  '客户数变化率同比'
];

// ========== 中高端客户运营指标选项配置 ==========

// 中高端整体指标卡 - 主指标选项（柱状图，与概览页一致）
const barIndicatorOptionsForMidHigh = [
  '中高端客户规模',
  '中高端客户规模累计净增',
  '拍照中高端综合保有率',
  '拍照中高端规模保有率',
  '拍照中高端价值保有率',
  '拍照全球通综合保有率',
  '拍照全球通规模保有率',
  '拍照全球通价值保有率'
];

// 中高端整体指标卡 - 环比指标选项（折线图）
const momIndicatorOptionsForMidHigh = [
  '中高端客户规模环比',
  '中高端客户规模累计净增环比',
  '拍照中高端综合保有率环比',
  '拍照中高端规模保有率环比',
  '拍照中高端价值保有率环比',
  '拍照全球通综合保有率环比',
  '拍照全球通规模保有率环比',
  '拍照全球通价值保有率环比'
];

// 中高端整体指标卡 - 同比指标选项（折线图2）
const yoyIndicatorOptionsForMidHigh = [
  '中高端客户规模同比',
  '中高端客户规模累计净增同比',
  '拍照中高端综合保有率同比',
  '拍照中高端规模保有率同比',
  '拍照中高端价值保有率同比',
  '拍照全球通综合保有率同比',
  '拍照全球通规模保有率同比',
  '拍照全球通价值保有率同比'
];

// 中高端价值提升卡 - 子模块选项
const subModuleOptionsForValue = [
  '正向提值',
  '逆向控损'
];

// 中高端价值提升卡 - 正向提值指标选项（与概览页一致）
const positiveValueIndicatorOptions = [
  '拍照全球通正向提值客户数',
  '拍照全球通泛升档客户数'
];

// 中高端价值提升卡 - 逆向控损指标选项（与概览页一致）
const negativeValueIndicatorOptions = [
  '拍照全球通泛消费下降客户数',
  '拍照全球通降档客户数'
];

// 中高端规模发展卡 - 流入指标选项
const inflowIndicatorOptions = [
  '新入网中高端',
  '非中高端变为中高端'
];

// 中高端规模发展卡 - 累计流入指标选项
const cumulativeInflowIndicatorOptions = [
  '累计流入中高端客户数',
  '累计新入网中高端客户数'
];

// 中高端规模发展卡 - 流出指标选项
const outflowIndicatorOptions = [
  '存量中高端客户流失',
  '存量中高端客户降档为非中高端'
];

// 中高端规模发展卡 - 流失率指标选项
const churnRateIndicatorOptions = [
  '中高端客户流失率',
  '存量中高端客户流失率'
];

// 中高端规模发展卡 - 净增指标选项
const netChangeIndicatorOptions = [
  '中高端客户净增量',
  '中高端客户净增率'
];

// 中高端规模发展卡 - 期初期末指标选项
const periodIndicatorOptions = [
  '中高端客户期初数',
  '中高端客户期末数'
];

// 中高端融合加固卡 - 子模块选项
const subModuleOptionsForFusion = [
  '融合率',
  '宽带渗透',
  '家庭产品',
  'ARPU提升'
];

// 中高端融合加固卡 - 指标选项（与概览页一致）
const fusionIndicatorOptions = [
  '拍照全球通有效融合率',
  '拍照全球通合约率',
  '拍照全球通固移融合率',
  '拍照全球通基座融合率',
  '拍照全球通成员融合率'
];

// ========== 国际运营指标选项配置 ==========

// 国际运营 - 整体指标卡选项
const internationalOverallIndicatorOptions = [
  '出访客户（含0）',
  '销量',
  '收入',
  '客户订购渗透率'
];

// 国际运营 - 整体指标同比选项
const internationalYoyOptions = [
  '同比变化',
  '同比增长率',
  '同比增幅'
];

// 国际运营 - 目标完成率指标选项
const targetRateIndicatorOptions = [
  '目标完成率',
  '销量目标完成率',
  '收入目标完成率',
  '客户渗透率目标完成率'
];

// 国际运营 - 目标差距指标选项
const targetGapIndicatorOptions = [
  '目标差距',
  '销量目标差距',
  '收入目标差距',
  '客户渗透率目标差距'
];

// 国际运营 - 出访规模指标选项
const outboundScaleIndicatorOptions = [
  '出访人天',
  '出访人次',
  '分方向出访总次数',
  '出访客户含0话单占比'
];

// 国际运营 - 使用订购指标选项
const usageOrderIndicatorOptions = [
  '客户订购渗透率-自有渠道',
  '客户订购渗透率-合作渠道',
  '国漫产品订购客户数占比',
  '国漫产品使用客户数占比'
];

// 国际运营 - 出访行为指标选项
const outboundBehaviorIndicatorOptions = [
  'DOU（MB/人天）',
  'MOU（Min/人天）',
  'ARPU（元/人）'
];

// 国际运营 - 渠道分布指标选项
const channelDistributionIndicatorOptions = [
  '自有渠道',
  '合作渠道',
  '微信公众号',
  '短信',
  '微信钱包',
  '京东国际'
];

// 国际运营 - 产品类型指标选项
const productTypeIndicatorOptions = [
  '大包多天',
  '漫游99流量语音包',
  '大湾区港澳包',
  '国漫流量月包',
  '国漫语音月包',
  '国漫流量加油包'
];

// 国际运营 - 收入结构指标选项
const revenueStructureIndicatorOptions = [
  '标准资费',
  '国漫包收入',
  '数据客户端',
  '传统语音客户端',
  'VOLTE语音客户端'
];

// 国际运营 - 方向指标选项
const directionIndicatorOptions = [
  '香港',
  '澳门',
  '日本',
  '韩国',
  '泰国',
  '新加坡',
  '马来西亚',
  '美国',
  '越南',
  '台湾'
];

// ========== 离网维系指标选项配置 ==========

// 流向类型选项
const flowTypeOptions = ['流入', '流出', '汇总'];

// 客户特征分析卡的柱状图指标选项
const barIndicatorOptionsForFeature = [
  '离网规模',
  '离网客户数',
  '客户规模'
];

// 客户特征分析卡的折线图指标选项
const lineIndicatorOptionsForFeature = [
  '离网率',
  '离网占比',
  '保有率'
];

// 客群看管卡的主指标选项
const mainIndicatorOptionsForSegment = [
  '宽带沉默客户规模',
  '无宽带潜在离网风险客户规模',
  '合约3个月内到期客户规模',
  '欠费停机超过6个月客户规模',
  '高额停机超过6个月客户规模',
  '预销号超过6个月客户规模',
  '身份证离网客户数',
  '部分号码离网客户数',
  '重入网客户数'
];

// 指标单位选项
const indicatorUnitOptions = ['万', '个', '%', '元'];

// 维度标签选项（根据分析类型）
const dimensionLabelOptions: Record<string, string[]> = {
  '年龄分布': ['0-18岁', '18-25岁', '25-30岁', '30-50岁', '50-70岁', '70岁及以上'],
  'ARPU分层': ['50元以下', '50-100元', '100-150元', '150-200元', '200元以上'],
  '带宽分段': ['无宽带', '50M以下', '50-100M', '100-200M', '200M以上'],
  '卡槽状态': ['单卡槽', '双卡槽-主卡', '双卡槽-副卡'],
  '自定义': []
};

// 维度柱状图指标选项
const dimensionBarIndicatorOptions = [
  '离网规模',
  '离网客户数',
  '客户规模'
];

// 维度折线图指标选项
const dimensionLineIndicatorOptions = [
  '离网率',
  '离网占比',
  '保有率'
];

// 根据分析类型生成默认维度
const getDefaultDimensions = (analysisType: string): DimensionConfig[] => {
  const labels = dimensionLabelOptions[analysisType] || [];
  return labels.map(label => ({
    label,
    barIndicator: `${label}离网规模`,
    lineIndicator: `${label}离网率`
  }));
};

export default function IndicatorCardSettingsDialog({
  open,
  onOpenChange,
  card,
  onSave
}: IndicatorCardSettingsDialogProps) {
  // 表单状态
  const [formData, setFormData] = useState<IndicatorCardSettings>({
    cardName: card.cardName || '',
    cardTitle: card.cardTitle || '',
    indicatorGroupName: card.indicatorGroupName || '',
    usageScenario: card.usageScenario || '离网维系概览页',
    indicatorTopic: card.indicatorTopic || '整体离网指标',
    priority: card.priority || 1,
    templateType: card.templateType || '整体指标卡',
    templateName: card.templateName || '',
    dataPeriod: card.dataPeriod || '6个月',
    chartType: (card as any).chartType,
    barIndicator: card.barIndicator || '',
    barLegend: card.barLegend || '',
    lineIndicator: card.lineIndicator || '',
    lineLegend: card.lineLegend || '',
    line2Indicator: card.line2Indicator || '',
    line2Legend: card.line2Legend || '',
    line3Indicator: card.line3Indicator || '',
    line3Legend: card.line3Legend || '',
    enableAlarm: card.enableAlarm ?? false,
    enableDispatch: card.enableDispatch ?? false,
    enableIndicatorTree: card.enableIndicatorTree ?? false,
    analysisType: card.analysisType || '',
    dimensions: card.dimensions || [],
    mainIndicator: card.mainIndicator || '',
    compareType: card.compareType || '环比',
    enableDrillDown: card.enableDrillDown ?? false,
    enableColoring: card.enableColoring ?? false,
    indicatorDirection: card.indicatorDirection || '负向',
    // 中高端客户运营字段
    isRateIndicator: (card as any).isRateIndicator ?? false,
    subModule: (card as any).subModule || '',
    flowType: (card as any).flowType || '',
    // 流入指标卡
    cumulativeIndicator: (card as any).cumulativeIndicator || '',
    cumulativeUnit: (card as any).cumulativeUnit || '',
    // 流出指标卡
    relatedRateName: (card as any).relatedRateName || '',
    relatedRateIndicator: (card as any).relatedRateIndicator || '',
    relatedRateUnit: (card as any).relatedRateUnit || '',
    // 流向变化汇总卡
    initialIndicatorName: (card as any).initialIndicatorName || '',
    initialIndicator: (card as any).initialIndicator || '',
    inflowIndicator1Name: (card as any).inflowIndicator1Name || '',
    inflowIndicator1: (card as any).inflowIndicator1 || '',
    inflowIndicator2Name: (card as any).inflowIndicator2Name || '',
    inflowIndicator2: (card as any).inflowIndicator2 || '',
    outflowIndicator1Name: (card as any).outflowIndicator1Name || '',
    outflowIndicator1: (card as any).outflowIndicator1 || '',
    outflowIndicator2Name: (card as any).outflowIndicator2Name || '',
    outflowIndicator2: (card as any).outflowIndicator2 || '',
    finalIndicatorName: (card as any).finalIndicatorName || '',
    finalIndicator: (card as any).finalIndicator || '',
    showNetChange: (card as any).showNetChange ?? true,
    // 目标完成配置
    targetRateIndicator: (card as any).targetRateIndicator || '',
    targetGapIndicator: (card as any).targetGapIndicator || '',
    // ========== 新增缺失字段初始化 ==========
    // 上方展示指标（整体指标卡等）
    basicIndicator: (card as any).basicIndicator || '',
    momIndicator: (card as any).momIndicator || '',
    yoyIndicator: (card as any).yoyIndicator || '',
    // 下方图表指标
    chartBarIndicator: (card as any).chartBarIndicator || '',
    chartBarLegend: (card as any).chartBarLegend || '',
    chartLineIndicator: (card as any).chartLineIndicator || '',
    chartLineLegend: (card as any).chartLineLegend || '',
    chartLine2Indicator: (card as any).chartLine2Indicator || '',
    chartLine2Legend: (card as any).chartLine2Legend || '',
    chartLine3Indicator: (card as any).chartLine3Indicator || '',
    chartLine3Legend: (card as any).chartLine3Legend || '',
    // 流向变化柱子列表
    flowChangeBars: (card as any).flowChangeBars || [],
    // TOP10方向指标
    targetIndicator: (card as any).targetIndicator || '',
    targetUnit: (card as any).targetUnit || '',
    // 新增市场 - 整体增量卡
    basicValue: (card as any).basicValue || '',
    momValue: (card as any).momValue || '',
    momUnit: (card as any).momUnit || '',
    // 面积趋势卡
    areaIndicator: (card as any).areaIndicator || '',
    areaLegend: (card as any).areaLegend || '',
    // 饼图分析卡（改为动态添加）
    pieIndicators: (card as any).pieIndicators || [],
    showChannelRank: (card as any).showChannelRank ?? false,
    channelRankIndicators: (card as any).channelRankIndicators || [],
    // 国际运营 - 多指标配置
    multiBarIndicators: (card as any).multiBarIndicators || [],
    multiBarLegends: (card as any).multiBarLegends || [],
    // 柱线指标组
    barLineGroups: (card as any).barLineGroups || [],
    // 产品明细版
    subCard1BarIndicator: (card as any).subCard1BarIndicator || '',
    subCard1BarLegend: (card as any).subCard1BarLegend || '',
    subCard2BarIndicator: (card as any).subCard2BarIndicator || '',
    subCard2BarLegend: (card as any).subCard2BarLegend || '',
    // 收入结构趋势卡
    multiLineIndicators: (card as any).multiLineIndicators || [],
    // 分省目标达成卡
    achievedIndicatorName: (card as any).achievedIndicatorName || '',
    unachievedIndicatorName: (card as any).unachievedIndicatorName || '',
    achievedCount: (card as any).achievedCount || '',
    unachievedCount: (card as any).unachievedCount || ''
  });

  // 当卡片数据变化时更新表单
  useEffect(() => {
    setFormData({
      cardName: card.cardName || '',
      cardTitle: card.cardTitle || '',
      indicatorGroupName: card.indicatorGroupName || '',
      usageScenario: card.usageScenario || '离网维系概览页',
      indicatorTopic: card.indicatorTopic || '整体离网指标',
      priority: card.priority || 1,
      templateType: card.templateType || '整体指标卡',
      templateName: card.templateName || '',
      dataPeriod: card.dataPeriod || '6个月',
      barIndicator: card.barIndicator || '',
      barLegend: card.barLegend || '',
      lineIndicator: card.lineIndicator || '',
      lineLegend: card.lineLegend || '',
      line2Indicator: card.line2Indicator || '',
      line2Legend: card.line2Legend || '',
      line3Indicator: card.line3Indicator || '',
      line3Legend: card.line3Legend || '',
      enableAlarm: card.enableAlarm ?? false,
      enableDispatch: card.enableDispatch ?? false,
      enableIndicatorTree: card.enableIndicatorTree ?? false,
      analysisType: card.analysisType || '',
      dimensions: card.dimensions || [],
      mainIndicator: card.mainIndicator || '',
      compareType: card.compareType || '环比',
      enableDrillDown: card.enableDrillDown ?? false,
      enableColoring: card.enableColoring ?? false,
      indicatorDirection: card.indicatorDirection || '负向',
      // 中高端客户运营字段
      isRateIndicator: (card as any).isRateIndicator ?? false,
      subModule: (card as any).subModule || '',
      flowType: (card as any).flowType || '',
      // 流入指标卡
      cumulativeIndicator: (card as any).cumulativeIndicator || '',
      cumulativeUnit: (card as any).cumulativeUnit || '',
      // 流出指标卡
      relatedRateName: (card as any).relatedRateName || '',
      relatedRateIndicator: (card as any).relatedRateIndicator || '',
      relatedRateUnit: (card as any).relatedRateUnit || '',
      // 流向变化汇总卡
      initialIndicatorName: (card as any).initialIndicatorName || '',
      initialIndicator: (card as any).initialIndicator || '',
      inflowIndicator1Name: (card as any).inflowIndicator1Name || '',
      inflowIndicator1: (card as any).inflowIndicator1 || '',
      inflowIndicator2Name: (card as any).inflowIndicator2Name || '',
      inflowIndicator2: (card as any).inflowIndicator2 || '',
      outflowIndicator1Name: (card as any).outflowIndicator1Name || '',
      outflowIndicator1: (card as any).outflowIndicator1 || '',
      outflowIndicator2Name: (card as any).outflowIndicator2Name || '',
      outflowIndicator2: (card as any).outflowIndicator2 || '',
      finalIndicatorName: (card as any).finalIndicatorName || '',
      finalIndicator: (card as any).finalIndicator || '',
      showNetChange: (card as any).showNetChange ?? true,
      // 目标完成配置
      targetRateIndicator: (card as any).targetRateIndicator || '',
      targetGapIndicator: (card as any).targetGapIndicator || '',
      // ========== 新增缺失字段初始化 ==========
      // 上方展示指标（整体指标卡等）
      basicIndicator: (card as any).basicIndicator || '',
      momIndicator: (card as any).momIndicator || '',
      yoyIndicator: (card as any).yoyIndicator || '',
      // 下方图表指标
      chartBarIndicator: (card as any).chartBarIndicator || '',
      chartBarLegend: (card as any).chartBarLegend || '',
      chartLineIndicator: (card as any).chartLineIndicator || '',
      chartLineLegend: (card as any).chartLineLegend || '',
      chartLine2Indicator: (card as any).chartLine2Indicator || '',
      chartLine2Legend: (card as any).chartLine2Legend || '',
      chartLine3Indicator: (card as any).chartLine3Indicator || '',
      chartLine3Legend: (card as any).chartLine3Legend || '',
      // 流向变化柱子列表
      flowChangeBars: (card as any).flowChangeBars || [],
      // TOP10方向指标
      targetIndicator: (card as any).targetIndicator || '',
      targetUnit: (card as any).targetUnit || '',
      // 新增市场 - 整体增量卡
      basicValue: (card as any).basicValue || '',
      momValue: (card as any).momValue || '',
      momUnit: (card as any).momUnit || '',
      // 面积趋势卡
      areaIndicator: (card as any).areaIndicator || '',
      areaLegend: (card as any).areaLegend || '',
      // 饼图分析卡（改为动态添加）
      pieIndicators: (card as any).pieIndicators || [],
      showChannelRank: (card as any).showChannelRank ?? false,
      channelRankIndicators: (card as any).channelRankIndicators || [],
      // 国际运营 - 多指标配置
      multiBarIndicators: (card as any).multiBarIndicators || [],
      multiBarLegends: (card as any).multiBarLegends || [],
      // 柱线指标组
      barLineGroups: (card as any).barLineGroups || [],
      // 产品明细版
      subCard1BarIndicator: (card as any).subCard1BarIndicator || '',
      subCard1BarLegend: (card as any).subCard1BarLegend || '',
      subCard2BarIndicator: (card as any).subCard2BarIndicator || '',
      subCard2BarLegend: (card as any).subCard2BarLegend || '',
      // 收入结构趋势卡
      multiLineIndicators: (card as any).multiLineIndicators || [],
      // 分省目标达成卡
      achievedIndicatorName: (card as any).achievedIndicatorName || '',
      unachievedIndicatorName: (card as any).unachievedIndicatorName || '',
      achievedCount: (card as any).achievedCount || '',
      unachievedCount: (card as any).unachievedCount || ''
    });
  }, [card]);

  // 获取当前数据周期选项（根据指标类型）
  const getPeriodOptions = () => {
    return card.indicatorType === '日指标' ? dailyPeriodOptions : monthlyPeriodOptions;
  };

  // 当分析类型变化时，更新默认维度
  useEffect(() => {
    if (formData.templateType === '客户特征分析卡' && formData.analysisType && formData.analysisType !== '自定义') {
      const defaultDims = getDefaultDimensions(formData.analysisType);
      if (defaultDims.length > 0) {
        setFormData(prev => ({ ...prev, dimensions: defaultDims }));
      }
    }
  }, [formData.analysisType, formData.templateType]);

  // 字段变更
  const handleFieldChange = (field: keyof IndicatorCardSettings, value: string | number | boolean | string[] | FlowChangeBar[] | BarLineIndicatorGroup[] | PieIndicator[] | { indicator: string; legend: string }[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 添加维度
  const handleAddDimension = () => {
    setFormData(prev => ({
      ...prev,
      dimensions: [...prev.dimensions, { label: '', barIndicator: '', lineIndicator: '' }]
    }));
  };

  // 删除维度
  const handleRemoveDimension = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter((_, i) => i !== index)
    }));
  };

  // 更新维度
  const handleUpdateDimension = (index: number, field: keyof DimensionConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: prev.dimensions.map((dim, i) => 
        i === index ? { ...dim, [field]: value } : dim
      )
    }));
  };

  // 添加排名指标
  const handleAddRankIndicator = () => {
    const currentIndicators = formData.channelRankIndicators || [];
    handleFieldChange('channelRankIndicators', [...currentIndicators, '']);
  };

  // 删除排名指标
  const handleRemoveRankIndicator = (index: number) => {
    const currentIndicators = formData.channelRankIndicators || [];
    handleFieldChange('channelRankIndicators', currentIndicators.filter((_, i) => i !== index));
  };

  // 更新排名指标
  const handleUpdateRankIndicator = (index: number, value: string) => {
    const currentIndicators = formData.channelRankIndicators || [];
    const newIndicators = [...currentIndicators];
    newIndicators[index] = value;
    handleFieldChange('channelRankIndicators', newIndicators);
  };

  // ========== 国际运营多指标管理 ==========
  // 添加柱状图指标
  const handleAddBarIndicator = () => {
    const currentIndicators = formData.multiBarIndicators || [];
    const currentLegends = formData.multiBarLegends || [];
    handleFieldChange('multiBarIndicators', [...currentIndicators, '']);
    handleFieldChange('multiBarLegends', [...currentLegends, '']);
  };

  // 删除柱状图指标
  const handleRemoveBarIndicator = (index: number) => {
    const currentIndicators = formData.multiBarIndicators || [];
    const currentLegends = formData.multiBarLegends || [];
    handleFieldChange('multiBarIndicators', currentIndicators.filter((_, i) => i !== index));
    handleFieldChange('multiBarLegends', currentLegends.filter((_, i) => i !== index));
  };

  // 更新柱状图指标
  const handleUpdateBarIndicator = (index: number, field: 'indicator' | 'legend', value: string) => {
    if (field === 'indicator') {
      const currentIndicators = formData.multiBarIndicators || [];
      const newIndicators = [...currentIndicators];
      newIndicators[index] = value;
      handleFieldChange('multiBarIndicators', newIndicators);
    } else {
      const currentLegends = formData.multiBarLegends || [];
      const newLegends = [...currentLegends];
      newLegends[index] = value;
      handleFieldChange('multiBarLegends', newLegends);
    }
  };

  // ========== 饼图指标管理 ==========
  // 添加饼图指标
  const handleAddPieIndicator = () => {
    const currentIndicators = formData.pieIndicators || [];
    handleFieldChange('pieIndicators', [...currentIndicators, { name: '', color: '#3B82F6' }]);
  };

  // 删除饼图指标
  const handleRemovePieIndicator = (index: number) => {
    const currentIndicators = formData.pieIndicators || [];
    handleFieldChange('pieIndicators', currentIndicators.filter((_, i) => i !== index));
  };

  // 更新饼图指标
  const handleUpdatePieIndicator = (index: number, field: 'name' | 'color', value: string) => {
    const currentIndicators = formData.pieIndicators || [];
    const newIndicators = [...currentIndicators];
    newIndicators[index] = { ...newIndicators[index], [field]: value };
    handleFieldChange('pieIndicators', newIndicators);
  };

  // ========== 柱线指标组管理（柱和线一一对应） ==========
  // 添加柱线指标组
  const handleAddBarLineGroup = () => {
    const currentGroups = formData.barLineGroups || [];
    const newGroup: BarLineIndicatorGroup = {
      barIndicator: '',
      barLegend: '',
      lineIndicator: '',
      lineLegend: ''
    };
    handleFieldChange('barLineGroups', [...currentGroups, newGroup]);
  };

  // 删除柱线指标组
  const handleRemoveBarLineGroup = (index: number) => {
    const currentGroups = formData.barLineGroups || [];
    handleFieldChange('barLineGroups', currentGroups.filter((_, i) => i !== index));
  };

  // 更新柱线指标组
  const handleUpdateBarLineGroup = (index: number, field: keyof BarLineIndicatorGroup, value: string) => {
    const currentGroups = formData.barLineGroups || [];
    const newGroups = [...currentGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    handleFieldChange('barLineGroups', newGroups);
  };

  // ========== 流向变化柱子管理 ==========
  // 添加流向变化柱子
  const handleAddFlowChangeBar = () => {
    const currentBars = formData.flowChangeBars || [];
    const newBar: FlowChangeBar = { 
      name: '', 
      type: 'inflow', 
      indicator: '',
      color: ''
    };
    handleFieldChange('flowChangeBars', [...currentBars, newBar]);
  };

  // 删除流向变化柱子
  const handleRemoveFlowChangeBar = (index: number) => {
    const currentBars: FlowChangeBar[] = formData.flowChangeBars || [];
    handleFieldChange('flowChangeBars', currentBars.filter((_, i) => i !== index));
  };

  // 更新流向变化柱子
  const handleUpdateFlowChangeBar = (index: number, field: keyof FlowChangeBar, value: string) => {
    const currentBars: FlowChangeBar[] = formData.flowChangeBars || [];
    const newBars: FlowChangeBar[] = [...currentBars];
    newBars[index] = { ...newBars[index], [field]: value };
    
    // 根据类型自动设置颜色
    if (field === 'type') {
      const colorMap: Record<string, string> = {
        'start': '#3B82F6',   // 蓝色
        'inflow': '#10B981',  // 绿色
        'outflow': '#EF4444', // 红色
        'end': '#3B82F6'      // 蓝色
      };
      newBars[index].color = colorMap[value] || '';
    }
    
    handleFieldChange('flowChangeBars', newBars);
  };

  // 获取流向变化柱子的指标选项（根据类型筛选）
  const getFlowChangeIndicatorOptions = (type: string) => {
    const startEndIndicators = [
      '期初中高端客户规模',
      '期末中高端客户规模',
      '中高端客户期初数',
      '中高端客户期末数',
      '期初客户数',
      '期末客户数'
    ];
    const inflowIndicators = [
      '新入网流入中高端客户数',
      '升级转入中高端客户数',
      '回流中高端客户数',
      '携号转入中高端客户数',
      '其他流入中高端客户数',
      '新入网客户数',
      '携号转入客户数'
    ];
    const outflowIndicators = [
      '中高端客户流失数',
      '降档转出中高端客户数',
      '携号转出中高端客户数',
      '其他流出中高端客户数',
      '离网客户数',
      '携号转出客户数'
    ];
    
    if (type === 'start' || type === 'end') return startEndIndicators;
    if (type === 'inflow') return inflowIndicators;
    if (type === 'outflow') return outflowIndicators;
    return [...startEndIndicators, ...inflowIndicators, ...outflowIndicators];
  };

  // 获取当前分析类型的维度标签选项
  const getDimensionLabelOptions = () => {
    if (formData.analysisType === '自定义') {
      return ['自定义维度1', '自定义维度2', '自定义维度3'];
    }
    return dimensionLabelOptions[formData.analysisType] || [];
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    console.log('保存指标卡设置:', formData);
    onSave?.(formData);
    onOpenChange(false);
  };

  // 渲染整体指标卡配置（通用配置，根据使用场景动态加载指标选项）
  const renderOverallMetricConfig = () => {
    // 获取当前模板的折线数量
    const currentTemplate = getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName);
    const lineCount = currentTemplate?.lines || 1;
    const isEnhanced = lineCount >= 2;
    
    // 根据使用场景动态获取指标选项
    const barOptions = getBarIndicatorOptions(formData.usageScenario);
    const momOptions = getMomIndicatorOptions(formData.usageScenario);
    const yoyOptions = getYoyIndicatorOptions(formData.usageScenario);
    
    // 国际运营场景的特殊配置
    const isInternational = formData.usageScenario === '国际运营概览页';
    
    // DOU/MOU/ARPU趋势卡不需要上方展示指标（判断条件：卡片名称包含"趋势"或指标组名称包含"出访行为趋势"）
    const isTrendCard = formData.cardName?.includes('趋势') || formData.indicatorGroupName?.includes('出访行为趋势');
    
    return (
      <div className="space-y-4">
        {/* 入口配置 - 仅离网维系场景显示 */}
        {formData.usageScenario === '离网维系概览页' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableAlarm"
                checked={formData.enableAlarm}
                onCheckedChange={(checked) => handleFieldChange('enableAlarm', checked as boolean)}
              />
              <label htmlFor="enableAlarm" className="text-sm text-gray-600 cursor-pointer">
                启用告警入口
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableDispatch"
                checked={formData.enableDispatch}
                onCheckedChange={(checked) => handleFieldChange('enableDispatch', checked as boolean)}
              />
              <label htmlFor="enableDispatch" className="text-sm text-gray-600 cursor-pointer">
                启用调度入口
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableIndicatorTree"
                checked={formData.enableIndicatorTree}
                onCheckedChange={(checked) => handleFieldChange('enableIndicatorTree', checked as boolean)}
              />
              <label htmlFor="enableIndicatorTree" className="text-sm text-gray-600 cursor-pointer">
                启用指标树入口
              </label>
            </div>
          </div>
        )}
        
        {/* 上方展示指标配置 - DOU/MOU/ARPU趋势卡不需要 */}
        {!isTrendCard && (
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {barOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 国际运营场景优先显示同比，其他场景显示环比 */}
            {isInternational ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 同比指标
                </div>
                <Select 
                  value={formData.yoyIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择同比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {yoyOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">环比指标</div>
                <Select 
                  value={formData.momIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('momIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择环比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {momOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isEnhanced && isInternational && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">环比指标</div>
                <Select 
                  value={formData.momIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('momIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择环比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {momOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isEnhanced && !isInternational && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">同比指标</div>
                <Select 
                  value={formData.yoyIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择同比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {yoyOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* 国际运营场景的目标完成配置 */}
          {isInternational && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">目标完成率指标</div>
                <Select 
                  value={formData.targetRateIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('targetRateIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择目标完成率指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="目标完成率">目标完成率</SelectItem>
                    <SelectItem value="月度目标完成率">月度目标完成率</SelectItem>
                    <SelectItem value="年度目标完成率">年度目标完成率</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">目标差距指标</div>
                <Select 
                  value={formData.targetGapIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('targetGapIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择目标差距指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="目标差距">目标差距</SelectItem>
                    <SelectItem value="月度目标差距">月度目标差距</SelectItem>
                    <SelectItem value="年度目标差距">年度目标差距</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        )}

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标（图例非必填，不填则不展示）</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.barIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {barOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || formData.barLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：规模（万）"
              />
            </div>
          </div>
          
          {/* 折线图1配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图1（{isInternational ? '同比' : '环比'}）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {(isInternational ? yoyOptions : momOptions).map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder={isInternational ? "如：同比（%）" : "如：环比（%）"}
              />
            </div>
          </div>
          
          {/* 折线图2配置 - 增强版和完整版显示 */}
          {lineCount >= 2 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">折线图2（{isInternational ? '环比' : '同比'}）</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">
                  <span className="text-red-500">*</span> 指标
                </label>
                <Select 
                  value={formData.chartLine2Indicator || formData.line2Indicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartLine2Indicator', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择折线图2指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isInternational ? momOptions : yoyOptions).map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
                <Input
                  value={formData.chartLine2Legend || formData.line2Legend || ''}
                  onChange={(e) => handleFieldChange('chartLine2Legend', e.target.value)}
                  className="flex-1"
                  placeholder={isInternational ? "如：环比（%）" : "如：同比（%）"}
                />
              </div>
            </div>
          )}
          
          {/* 折线图3配置（目标）- 完整版显示 */}
          {lineCount >= 3 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">折线图3（目标）</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">
                  <span className="text-red-500">*</span> 指标
                </label>
                <Select 
                  value={formData.chartLine3Indicator || formData.line3Indicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartLine3Indicator', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择折线图3指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="目标值">目标值</SelectItem>
                    <SelectItem value="月度目标">月度目标</SelectItem>
                    <SelectItem value="年度目标">年度目标</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
                <Input
                  value={formData.chartLine3Legend || formData.line3Legend || ''}
                  onChange={(e) => handleFieldChange('chartLine3Legend', e.target.value)}
                  className="flex-1"
                  placeholder="如：目标值"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染迷你指标卡配置（国际运营出访规模、使用订购）
  const renderMiniMetricConfig = () => {
    const barOptions = getBarIndicatorOptions(formData.usageScenario);
    const momOptions = getMomIndicatorOptions(formData.usageScenario);
    const yoyOptions = getYoyIndicatorOptions(formData.usageScenario);
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          迷你指标卡：展示指标值和迷你趋势图（图例非必填，不填则不展示）
        </div>
        
        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {barOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">同比指标</div>
              <Select 
                value={formData.yoyIndicator || ''} 
                onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择同比指标" />
                </SelectTrigger>
                <SelectContent>
                  {yoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方迷你趋势图指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {barOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || formData.barLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：规模（万），不填则不展示"
              />
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（同比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {yoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：同比（%），不填则不展示"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染柱线指标组卡配置（通用配置）
  const renderBarLineGroupConfig = () => {
    const barOptions = getBarLineGroupBarOptions(formData.usageScenario, formData.templateName);
    const lineOptions = getBarLineGroupLineOptions(formData.usageScenario);
    
    // 产品明细版专用配置
    if (formData.templateName === '产品明细版') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            产品明细卡：展示大包多天、漫游99两个子卡片的柱状图（图例非必填，不填则不展示）
          </div>
          
          {/* 子卡片1：大包多天 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">子卡片1：大包多天</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 柱状图指标
                </div>
                <Select 
                  value={formData.subCard1BarIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('subCard1BarIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择柱状图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="大包多天订购量">大包多天订购量</SelectItem>
                    <SelectItem value="大包多天收入">大包多天收入</SelectItem>
                    <SelectItem value="大包多天激活量">大包多天激活量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">柱状图图例</div>
                <Input
                  value={formData.subCard1BarLegend || ''}
                  onChange={(e) => handleFieldChange('subCard1BarLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：订购量（万）"
                />
              </div>
            </div>
          </div>
          
          {/* 子卡片2：漫游99 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">子卡片2：漫游99</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 柱状图指标
                </div>
                <Select 
                  value={formData.subCard2BarIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('subCard2BarIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择柱状图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="漫游99订购量">漫游99订购量</SelectItem>
                    <SelectItem value="漫游99收入">漫游99收入</SelectItem>
                    <SelectItem value="漫游99激活量">漫游99激活量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">柱状图图例</div>
                <Input
                  value={formData.subCard2BarLegend || ''}
                  onChange={(e) => handleFieldChange('subCard2BarLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：订购量（万）"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          柱线指标组卡：每个指标组包含柱指标和对应的线指标，柱和线一一对应（图例非必填，不填则不展示）
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：订购量（万）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 渲染分省分布卡配置（通用配置）
  const renderProvinceDistributionConfig = () => {
    const barOptions = getBarIndicatorOptions(formData.usageScenario);
    const momOptions = getMomIndicatorOptions(formData.usageScenario);
    const yoyOptions = getYoyIndicatorOptions(formData.usageScenario);
    
    // 判断是否为目标版模板
    const isTargetVersion = formData.templateName === '目标版';
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          {isTargetVersion 
            ? '分省分布卡（目标版）：展示分省目标达成情况，已达成/未达成展示在图表上方'
            : '分地市分布卡：展示16地市分公司的指标分布（柱状图+两条折线：环比、同比），图例非必填，不填则不展示'}
        </div>
        
        {/* 已达成/未达成配置 - 仅目标版显示，放在图表上方 */}
        {isTargetVersion && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-700">达成情况展示配置（图表上方）</div>
            <div className="text-xs text-gray-500 mb-2">说明：已达成数量和未达成数量无需配置，直接使用已达成指标和未达成指标的数据</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 已达成指标
                </div>
                <Select 
                  value={formData.achievedIndicatorName || ''} 
                  onValueChange={(value) => handleFieldChange('achievedIndicatorName', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择已达成指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {barOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 未达成指标
                </div>
                <Select 
                  value={formData.unachievedIndicatorName || ''} 
                  onValueChange={(value) => handleFieldChange('unachievedIndicatorName', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择未达成指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {barOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">图表指标配置</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图（16地市分公司分布）</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 柱状图指标
                </div>
                <Select 
                  value={formData.chartBarIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择柱状图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {barOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">柱状图图例</div>
                <Input
                  value={formData.chartBarLegend || ''}
                  onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：规模（万）"
                />
              </div>
            </div>
          </div>
          
          {/* 折线图1配置（环比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图1（环比，可选）</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图1指标</div>
                <Select 
                  value={formData.chartLineIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择折线图1指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {momOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图1图例</div>
                <Input
                  value={formData.chartLineLegend || ''}
                  onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：环比（%）"
                />
              </div>
            </div>
          </div>
          
          {/* 折线图2配置（同比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图2（同比，可选）</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图2指标</div>
                <Select 
                  value={formData.chartLine2Indicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartLine2Indicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择折线图2指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {yoyOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图2图例</div>
                <Input
                  value={formData.chartLine2Legend || ''}
                  onChange={(e) => handleFieldChange('chartLine2Legend', e.target.value)}
                  className="w-full"
                  placeholder="如：同比（%）"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染排名分析卡配置（通用配置）
  const renderRankingAnalysisConfig = () => {
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          排名分析卡：展示TOP10方向排名，支持多指标动态添加（图例非必填，不填则不展示）
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">柱状图指标（可添加多个）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarIndicator} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标
            </Button>
          </div>
          {(formData.multiBarIndicators || []).length > 0 && (
            <div className="space-y-2">
              {(formData.multiBarIndicators || []).map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select 
                    value={indicator} 
                    onValueChange={(value) => handleUpdateBarIndicator(index, 'indicator', value)}
                  >
                    <SelectTrigger className="h-8 text-sm flex-1">
                      <SelectValue placeholder="请选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="销量">销量</SelectItem>
                      <SelectItem value="收入">收入</SelectItem>
                      <SelectItem value="订购量">订购量</SelectItem>
                      <SelectItem value="激活量">激活量</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={(formData.multiBarLegends || [])[index] || ''}
                    onChange={(e) => handleUpdateBarIndicator(index, 'legend', e.target.value)}
                    className="h-8 w-24"
                    placeholder="图例"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBarIndicator(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {(formData.multiBarIndicators || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标，请点击上方按钮添加</div>
          )}
        </div>
        
        {/* 环比折线配置 - 非必填 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">环比折线（可选）</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">环比指标</div>
              <Select 
                value={formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('lineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="环比变化">环比变化</SelectItem>
                  <SelectItem value="环比增长率">环比增长率</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">图例</div>
              <Input
                value={formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                className="w-full"
                placeholder="如：环比（%）"
              />
            </div>
          </div>
        </div>
        
        {/* 同比折线配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">同比折线</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">同比指标</div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="同比变化">同比变化</SelectItem>
                  <SelectItem value="同比增长率">同比增长率</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">图例</div>
              <Input
                value={formData.chartLineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="w-full"
                placeholder="如：同比（%）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染饼图分析卡配置
  const renderPieAnalysisConfig = () => {
    // 饼图指标选项
    const pieIndicatorOptions = ['自有渠道', '合作渠道', '线上渠道', '线下渠道', '直销渠道', '代理渠道', '省级渠道', '一级渠道'];
    
    // 明细列表指标选项
    const detailIndicatorOptions = ['新增客户规模', '有效新增占比', '渠道占比', '环比变化', '同比变化', '完成率'];
    
    // 默认颜色列表
    const defaultColors = ['#0066CC', '#00B050', '#FF6600', '#9933FF', '#FF3366', '#00CCCC'];
    
    // 获取当前饼图指标列表
    const currentPieIndicators = formData.pieIndicators || [];
    
    // 获取当前明细列表指标
    const currentDetailIndicators = formData.channelRankIndicators || [];
    
    // 添加饼图指标
    const handleAddPieIndicator = () => {
      const newIndicators = [...currentPieIndicators, { 
        name: '', 
        value: '', 
        color: defaultColors[currentPieIndicators.length % defaultColors.length],
        mom: ''
      }];
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    // 更新饼图指标
    const handleUpdatePieIndicator = (index: number, field: keyof PieIndicator, value: string) => {
      const newIndicators = [...currentPieIndicators];
      newIndicators[index] = { ...newIndicators[index], [field]: value };
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    // 删除饼图指标
    const handleRemovePieIndicator = (index: number) => {
      const newIndicators = currentPieIndicators.filter((_, i) => i !== index);
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    // 添加明细列表指标
    const handleAddDetailIndicator = () => {
      const newIndicators = [...currentDetailIndicators, ''];
      handleFieldChange('channelRankIndicators', newIndicators);
    };
    
    // 更新明细列表指标
    const handleUpdateDetailIndicator = (index: number, value: string) => {
      const newIndicators = [...currentDetailIndicators];
      newIndicators[index] = value;
      handleFieldChange('channelRankIndicators', newIndicators);
    };
    
    // 删除明细列表指标
    const handleRemoveDetailIndicator = (index: number) => {
      const newIndicators = currentDetailIndicators.filter((_, i) => i !== index);
      handleFieldChange('channelRankIndicators', newIndicators);
    };
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          饼图分析卡：展示渠道占比分布，支持配置饼图指标和明细列表指标（指标值从数据库自动查询）
        </div>
        
        {/* 饼图指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">饼图指标配置（可添加多个）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddPieIndicator}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加指标
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            * 指标名称选择后，指标值将从数据库自动查询，无需手动配置
          </div>
          
          {currentPieIndicators.length > 0 && (
            <div className="space-y-3">
              {currentPieIndicators.map((indicator, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePieIndicator(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="text-red-500">*</span> 指标名称
                      </div>
                      <Select 
                        value={indicator.name || ''} 
                        onValueChange={(value) => handleUpdatePieIndicator(index, 'name', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择指标" />
                        </SelectTrigger>
                        <SelectContent>
                          {pieIndicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">颜色</div>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={indicator.color || defaultColors[index % defaultColors.length]}
                          onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={indicator.color || ''}
                          onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                          className="flex-1"
                          placeholder="#0066CC"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {currentPieIndicators.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无指标配置，请点击上方按钮添加
            </div>
          )}
        </div>
        
        {/* 明细列表配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">明细列表配置</div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showChannelRank || false}
                  onChange={(e) => handleFieldChange('showChannelRank', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">显示明细列表</span>
              </label>
            </div>
          </div>
          
          {formData.showChannelRank && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">明细列表指标（可添加多个）</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddDetailIndicator}
                  className="h-7"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  添加指标
                </Button>
              </div>
              
              {currentDetailIndicators.length > 0 && (
                <div className="space-y-2">
                  {currentDetailIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12">指标 {index + 1}</span>
                      <Select 
                        value={indicator || ''} 
                        onValueChange={(value) => handleUpdateDetailIndicator(index, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="请选择指标" />
                        </SelectTrigger>
                        <SelectContent>
                          {detailIndicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDetailIndicator(index)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {currentDetailIndicators.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">
                  暂无明细指标配置，请点击上方按钮添加
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // 渲染价值提升卡配置
  const renderValueUpgradeConfig = () => {
    // 根据子模块选择对应的指标选项
    const indicatorOptions = formData.subModule === '正向提值' 
      ? ['拍照全球通正向提值客户数', '拍照全球通泛升档客户数']
      : ['拍照全球通泛消费下降客户数', '拍照全球通降档客户数'];
    const momOptions = formData.subModule === '正向提值'
      ? ['拍照全球通正向提值客户数环比', '拍照全球通泛升档客户数环比']
      : ['拍照全球通泛消费下降客户数环比', '拍照全球通降档客户数环比'];
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          价值提升卡：展示正向提值或逆向控损指标（图例非必填，不填则不展示）
        </div>
        
        {/* 子模块选择 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">子模块</div>
          <Select 
            value={formData.subModule || ''} 
            onValueChange={(value) => handleFieldChange('subModule', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择子模块" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="正向提值">正向提值</SelectItem>
              <SelectItem value="逆向控损">逆向控损</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">环比指标</div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.barIndicator || formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('barIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.barLegend || ''}
                onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                className="flex-1"
                placeholder="如：客户数（万）"
              />
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.lineIndicator || formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('lineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（%）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染规模发展卡配置
  const renderScaleDevelopmentConfig = () => {
    const isInflow = formData.templateName?.includes('流入');
    const isOutflow = formData.templateName?.includes('流出');
    const isNetChange = formData.templateName?.includes('流向变化');
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          规模发展卡：展示流入、流出或流向变化指标
        </div>
        {isInflow && renderInflowConfig()}
        {isOutflow && renderOutflowConfig()}
        {isNetChange && renderNetChangeConfig()}
      </div>
    );
  };

  // 渲染融合加固卡配置
  const renderFusionConfig = () => {
    // 融合加固卡指标选项
    const indicatorOptions = [
      '拍照全球通有效融合率',
      '拍照全球通合约率',
      '拍照全球通固移融合率',
      '拍照全球通基座融合率',
      '拍照全球通成员融合率'
    ];
    const momOptions = ['环比变化'];
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          融合加固卡：展示融合率指标追踪（图例非必填，不填则不展示）
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">环比指标</div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.barIndicator || formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('barIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.barLegend || ''}
                onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                className="flex-1"
                placeholder="如：融合率（%）"
              />
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.lineIndicator || formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('lineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（pp）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染质量分析卡配置
  const renderQualityAnalysisConfig = () => {
    // 质量分析卡指标选项
    const qualityIndicatorOptions = [
      '重入网占比',
      'T+1月ARPU',
      '50元以下占比',
      'T+6留存率'
    ];
    // 饼图渠道层级选项
    const channelLevelOptions = ['省级渠道', '一级渠道', '二级渠道', '三级渠道', '社会渠道', '电商渠道'];
    const momIndicatorOptions = ['环比变化', '环比增长', '环比变化率'];
    
    // 根据模板名称显示不同的配置
    if (formData.templateName === '柱线追踪版') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            质量分析卡（柱线追踪版）：柱状图+环比折线（图例非必填，不填则不展示）
          </div>
          {/* 下方图表指标 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">下方图表指标</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 柱状图指标
                </div>
                <Select 
                  value={formData.barIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('barIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择柱状图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">柱状图图例</div>
                <Input
                  value={formData.barLegend || ''}
                  onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：重入网占比（%）"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 折线图指标
                </div>
                <Select 
                  value={formData.lineIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('lineIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择折线图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {momIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图图例</div>
                <Input
                  value={formData.lineLegend || ''}
                  onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：环比（pp）"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (formData.templateName === '双轴追踪版') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            质量分析卡（双轴追踪版）：双Y轴（ARPU + 占比）（图例非必填，不填则不展示）
          </div>
          {/* 下方图表指标 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">下方图表指标</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 柱状图指标（主Y轴）
                </div>
                <Select 
                  value={formData.barIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('barIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择柱状图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">柱状图图例</div>
                <Input
                  value={formData.barLegend || ''}
                  onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：T+1月ARPU（元）"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 折线图指标（次Y轴）
                </div>
                <Select 
                  value={formData.lineIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('lineIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择折线图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">折线图图例</div>
                <Input
                  value={formData.lineLegend || ''}
                  onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：50元以下占比（%）"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (formData.templateName === '面积趋势版') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            质量分析卡（面积趋势版）：面积图趋势展示（图例非必填，不填则不展示）
          </div>
          {/* 下方图表指标 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">下方图表指标</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> 面积图指标
                </div>
                <Select 
                  value={formData.areaIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('areaIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择面积图指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">面积图图例</div>
                <Input
                  value={formData.areaLegend || ''}
                  onChange={(e) => handleFieldChange('areaLegend', e.target.value)}
                  className="w-full"
                  placeholder="如：T+6留存率（%）"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (formData.templateName === '饼图分析版') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            质量分析卡（饼图分析版）：饼图+渠道排名
          </div>
          {/* 饼图配置 - 动态添加 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">饼图指标配置</div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddPieIndicator}
                className="h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                添加指标
              </Button>
            </div>
            {(formData.pieIndicators || []).length > 0 ? (
              <div className="space-y-3">
                {(formData.pieIndicators || []).map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          <span className="text-red-500">*</span> 指标名称
                        </div>
                        <Select 
                          value={indicator.name || ''} 
                          onValueChange={(value) => handleUpdatePieIndicator(index, 'name', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="请选择指标" />
                          </SelectTrigger>
                          <SelectContent>
                            {channelLevelOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">指标颜色</div>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={indicator.color || '#3B82F6'}
                            onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border"
                          />
                          <Input
                            value={indicator.color || '#3B82F6'}
                            onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                            className="flex-1 h-8 text-sm"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePieIndicator(index)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 border-2 border-dashed rounded">
                暂无饼图指标，请点击上方按钮添加
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              * 指标值将从数据库自动获取，无需手动配置
            </div>
          </div>
          
          {/* 排名配置 */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">排名配置</div>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="showChannelRank"
                checked={formData.showChannelRank ?? false}
                onCheckedChange={(checked) => handleFieldChange('showChannelRank', checked as boolean)}
              />
              <label htmlFor="showChannelRank" className="text-sm text-gray-700 cursor-pointer">
                显示渠道类型排名
              </label>
            </div>
            {formData.showChannelRank && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">排名指标</div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddRankIndicator}
                    className="h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加指标
                  </Button>
                </div>
                {(formData.channelRankIndicators || []).length > 0 && (
                  <div className="space-y-2">
                    {(formData.channelRankIndicators || []).map((indicator, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select 
                          value={indicator} 
                          onValueChange={(value) => handleUpdateRankIndicator(index, value)}
                        >
                          <SelectTrigger className="h-8 text-sm flex-1">
                            <SelectValue placeholder="请选择指标" />
                          </SelectTrigger>
                          <SelectContent>
                            {['新增客户规模', '新增放号量', '有效新增占比', '渠道转化率', 'T+6留存率', '次月ARPU', '重入网占比'].map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRankIndicator(index)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {(formData.channelRankIndicators || []).length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    暂无排名指标，请点击上方按钮添加
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // 默认返回基础配置
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          质量分析卡：展示新客户质量分析指标
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">指标配置</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">主指标</div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择主指标" />
                </SelectTrigger>
                <SelectContent>
                  {qualityIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染出访行为趋势卡配置（DOU/MOU/ARPU趋势专用）
  const renderVisitBehaviorTrendConfig = () => {
    // 出访行为趋势指标选项
    const trendIndicatorOptions = [
      'DOU（MB/人天）',
      'MOU（Min/人天）',
      'ARPU（元/人）'
    ];
    const yoyOptions = ['同比变化', '同比增长率'];
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          出访行为趋势卡：展示DOU/MOU/ARPU趋势（无上方指标，仅下方图表，无图例展示）
        </div>
        
        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.barIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {trendIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（同比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {yoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染收入结构趋势卡配置
  const renderRevenueTrendConfig = () => {
    // 收入结构趋势卡指标选项
    const lineIndicatorOptions = [
      '标准资费收入',
      '国漫包收入',
      '流量包收入',
      '语音包收入',
      '漫游收入',
      '国际业务收入'
    ];
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          收入结构趋势卡：展示多线趋势图（支持动态添加多条折线，图例非必填，不填则不展示）
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">折线指标配置（可添加多条）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                const currentLines = formData.multiLineIndicators || [];
                handleFieldChange('multiLineIndicators', [...currentLines, { indicator: '', legend: '' }]);
              }}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加折线
            </Button>
          </div>
          
          {/* 折线配置列表 */}
          {(formData.multiLineIndicators || []).length > 0 && (
            <div className="space-y-3">
              {(formData.multiLineIndicators || []).map((line: { indicator: string; legend: string }, index: number) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">折线 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentLines = formData.multiLineIndicators || [];
                        handleFieldChange('multiLineIndicators', currentLines.filter((_: unknown, i: number) => i !== index));
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">折线指标</div>
                      <Select 
                        value={line.indicator || ''} 
                        onValueChange={(value) => {
                          const currentLines = formData.multiLineIndicators || [];
                          const newLines = [...currentLines];
                          newLines[index] = { ...newLines[index], indicator: value };
                          handleFieldChange('multiLineIndicators', newLines);
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择折线指标" />
                        </SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">折线图例</div>
                      <Input
                        value={line.legend || ''}
                        onChange={(e) => {
                          const currentLines = formData.multiLineIndicators || [];
                          const newLines = [...currentLines];
                          newLines[index] = { ...newLines[index], legend: e.target.value };
                          handleFieldChange('multiLineIndicators', newLines);
                        }}
                        className="h-8 text-sm"
                        placeholder="如：收入（亿）"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(formData.multiLineIndicators || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无折线配置，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染客户特征分析卡配置
  const renderFeatureAnalysisConfig = () => (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 w-20 shrink-0">
          <span className="text-red-500">*</span> 标题
        </label>
        <Input
          value={formData.cardTitle}
          onChange={(e) => handleFieldChange('cardTitle', e.target.value)}
          className="flex-1"
          placeholder="如：物理属性 - 年龄分布"
        />
      </div>
      
      {/* 分析类型 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 w-20 shrink-0">
          <span className="text-red-500">*</span> 分析类型
        </label>
        <Select 
          value={formData.analysisType} 
          onValueChange={(value) => handleFieldChange('analysisType', value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="请选择分析类型" />
          </SelectTrigger>
          <SelectContent>
            {analysisTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 上方展示指标配置 */}
      <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-700">上方展示指标</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">基础指标（当前值）</div>
            <Select 
              value={formData.basicIndicator || ''} 
              onValueChange={(value) => handleFieldChange('basicIndicator', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择基础指标" />
              </SelectTrigger>
              <SelectContent>
                {barIndicatorOptionsForOverall.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">环比指标</div>
            <Select 
              value={formData.momIndicator || ''} 
              onValueChange={(value) => handleFieldChange('momIndicator', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择环比指标" />
              </SelectTrigger>
              <SelectContent>
                {line1IndicatorOptionsForOverall.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 下方图表指标配置 */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700">下方图表指标</div>
        
        {/* 图例配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-20 shrink-0">柱状图图例</label>
            <Select 
              value={formData.chartBarLegend || formData.barLegend || ''} 
              onValueChange={(value) => handleFieldChange('chartBarLegend', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="离网规模（万）">离网规模（万）</SelectItem>
                <SelectItem value="离网客户数（万）">离网客户数（万）</SelectItem>
                <SelectItem value="客户规模（万）">客户规模（万）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-20 shrink-0">折线图图例</label>
            <Select 
              value={formData.chartLineLegend || formData.lineLegend || ''} 
              onValueChange={(value) => handleFieldChange('chartLineLegend', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="离网率（%）">离网率（%）</SelectItem>
                <SelectItem value="离网占比（%）">离网占比（%）</SelectItem>
                <SelectItem value="保有率（%）">保有率（%）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 维度配置 */}
        <div className="border rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">维度配置</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddDimension}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加维度
            </Button>
          </div>
          
          {formData.dimensions.length > 0 && (
            <div className="space-y-2">
              {/* 表头 */}
              <div className="grid grid-cols-[1fr_1.5fr_1.5fr_40px] gap-2 text-xs text-gray-500 px-1">
                <div><span className="text-red-500">*</span> 维度标签</div>
                <div><span className="text-red-500">*</span> 柱状图指标</div>
                <div><span className="text-red-500">*</span> 折线图指标</div>
                <div></div>
              </div>
              
              {/* 维度列表 */}
              {formData.dimensions.map((dim, index) => (
                <div key={index} className="grid grid-cols-[1fr_1.5fr_1.5fr_40px] gap-2 items-center">
                  <Select 
                    value={dim.label} 
                    onValueChange={(value) => handleUpdateDimension(index, 'label', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="选择标签" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDimensionLabelOptions().map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dim.barIndicator} 
                    onValueChange={(value) => handleUpdateDimension(index, 'barIndicator', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {dimensionBarIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dim.lineIndicator} 
                    onValueChange={(value) => handleUpdateDimension(index, 'lineIndicator', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {dimensionLineIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDimension(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {formData.dimensions.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">
              请选择分析类型或添加自定义维度
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染客群看管卡/补充指标卡配置
  const renderSegmentConfig = () => {
    // 获取当前模板（基础版无图表，趋势版有折线图）
    const currentTemplate = getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName);
    const hasChart = currentTemplate && currentTemplate.lines > 0;
    
    return (
    <div className="space-y-4">
      {/* 卡片标题 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 w-20 shrink-0">卡片标题</label>
        <Input
          value={formData.cardTitle}
          onChange={(e) => handleFieldChange('cardTitle', e.target.value)}
          className="flex-1"
          placeholder="如：宽带沉默客户规模（万）"
        />
      </div>

      {/* 上方展示指标配置 */}
      <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-700">上方展示指标</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">基础指标（当前值）</div>
            <Select 
              value={formData.basicIndicator || formData.mainIndicator || ''} 
              onValueChange={(value) => handleFieldChange('basicIndicator', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择基础指标" />
              </SelectTrigger>
              <SelectContent>
                {mainIndicatorOptionsForSegment.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">环比指标</div>
            <Select 
              value={formData.momIndicator || ''} 
              onValueChange={(value) => handleFieldChange('momIndicator', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择环比指标" />
              </SelectTrigger>
              <SelectContent>
                {segmentLine1IndicatorOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">同比指标</div>
            <Select 
              value={formData.yoyIndicator || ''} 
              onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择同比指标（可选）" />
              </SelectTrigger>
              <SelectContent>
                {segmentLine2IndicatorOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* 下方图表指标配置 - 只有趋势版才有 */}
      {hasChart && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标（折线图）</div>
          
          {/* 折线图配置（环比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图1（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {segmentLine1IndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（%）"
              />
            </div>
          </div>
          
          {/* 折线图配置（同比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图2（同比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">指标</label>
              <Select 
                value={formData.chartLine2Indicator || formData.line2Indicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLine2Indicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图2指标（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {segmentLine2IndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLine2Legend || formData.line2Legend || ''}
                onChange={(e) => handleFieldChange('chartLine2Legend', e.target.value)}
                className="flex-1"
                placeholder="如：同比（%）"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  // 中高端客户运营模板配置
  const renderHighValueConfig = () => {
    // 根据模板类型渲染不同的配置
    switch (formData.templateType) {
      case '整体指标卡':
        return renderMidHighOverallConfig();
      case '价值提升卡':
        return renderMidHighValueConfig();
      case '规模发展卡':
        return renderMidHighScaleConfig();
      case '融合加固卡':
        return renderMidHighFusionConfig();
      default:
        return null;
    }
  };

  // 新增市场模板配置
  const renderNewMarketConfig = () => {
    // 整体增量指标选项
    const overallIndicatorOptions = [
      '新增客户规模',
      '一级新增放号量',
      '省级新增放号量',
      'T+6留存率'
    ];
    
    // 质量分析指标选项
    const qualityIndicatorOptions = [
      '重入网占比',
      'T+1月ARPU',
      '50元以下占比',
      'T+6留存率'
    ];
    
    // 环比指标选项
    const momIndicatorOptions = [
      '环比变化',
      '环比增长',
      '环比变化率'
    ];
    
    // 饼图渠道层级选项
    const channelLevelOptions = ['省级渠道', '一级渠道', '二级渠道', '三级渠道', '社会渠道', '电商渠道'];
    
    // 根据模板类型和使用场景渲染不同的配置
    switch (formData.templateType) {
      case '整体指标卡':
        // 仅当使用场景为新增市场概览页时才渲染此配置
        if (formData.usageScenario !== '新增市场概览页') {
          return null;
        }
        return (
          <div className="space-y-4">
            {/* 上方展示指标 */}
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-700">上方展示指标</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> 基础指标
                  </div>
                  <Select 
                    value={formData.basicIndicator || ''} 
                    onValueChange={(value) => handleFieldChange('basicIndicator', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择基础指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {overallIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">基础指标值</div>
                  <Input
                    value={formData.basicValue || ''}
                    onChange={(e) => handleFieldChange('basicValue', e.target.value)}
                    className="w-full"
                    placeholder="如：125.6万户"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">环比指标</div>
                  <Select 
                    value={formData.momIndicator || ''} 
                    onValueChange={(value) => handleFieldChange('momIndicator', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {momIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">环比值</div>
                  <Input
                    value={formData.momValue || ''}
                    onChange={(e) => handleFieldChange('momValue', e.target.value)}
                    className="w-full"
                    placeholder="如：+5.2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">环比单位</div>
                  <Select 
                    value={formData.momUnit || ''} 
                    onValueChange={(value) => handleFieldChange('momUnit', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="pp">pp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* 下方图表指标 */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">下方图表指标</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> 柱状图指标
                  </div>
                  <Select 
                    value={formData.barIndicator || ''} 
                    onValueChange={(value) => handleFieldChange('barIndicator', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择柱状图指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {overallIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">柱状图图例</div>
                  <Input
                    value={formData.barLegend || ''}
                    onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                    className="w-full"
                    placeholder="如：新增客户（万户）"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="text-red-500">*</span> 折线图指标
                  </div>
                  <Select 
                    value={formData.lineIndicator || ''} 
                    onValueChange={(value) => handleFieldChange('lineIndicator', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择折线图指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {momIndicatorOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">折线图图例</div>
                  <Input
                    value={formData.lineLegend || ''}
                    onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                    className="w-full"
                    placeholder="如：环比（%）"
                  />
                </div>
              </div>
            </div>
            
            {/* 功能配置 */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">功能配置</div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enableDispatch-new"
                    checked={formData.enableDispatch ?? false}
                    onCheckedChange={(checked) => handleFieldChange('enableDispatch', checked as boolean)}
                  />
                  <label htmlFor="enableDispatch-new" className="text-sm text-gray-700 cursor-pointer">
                    支持调度
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enableIndicatorTree-new"
                    checked={formData.enableIndicatorTree ?? false}
                    onCheckedChange={(checked) => handleFieldChange('enableIndicatorTree', checked as boolean)}
                  />
                  <label htmlFor="enableIndicatorTree-new" className="text-sm text-gray-700 cursor-pointer">
                    支持指标树
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case '质量分析卡':
        // 仅当使用场景为新增市场概览页时才渲染此配置
        if (formData.usageScenario !== '新增市场概览页') {
          return null;
        }
        // 根据模板名称显示不同的配置
        if (formData.templateName === '柱线追踪版') {
          return (
            <div className="space-y-4">
              {/* 下方图表指标 */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">下方图表指标</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> 柱状图指标
                    </div>
                    <Select 
                      value={formData.barIndicator || ''} 
                      onValueChange={(value) => handleFieldChange('barIndicator', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择柱状图指标" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">柱状图图例</div>
                    <Input
                      value={formData.barLegend || ''}
                      onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                      className="w-full"
                      placeholder="如：重入网占比（%）"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> 折线图指标
                    </div>
                    <Select 
                      value={formData.lineIndicator || ''} 
                      onValueChange={(value) => handleFieldChange('lineIndicator', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择折线图指标" />
                      </SelectTrigger>
                      <SelectContent>
                        {momIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">折线图图例</div>
                    <Input
                      value={formData.lineLegend || ''}
                      onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                      className="w-full"
                      placeholder="如：环比（pp）"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        if (formData.templateName === '双轴追踪卡') {
          return (
            <div className="space-y-4">
              {/* 下方图表指标 */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">下方图表指标</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> 柱状图指标（主）
                    </div>
                    <Select 
                      value={formData.barIndicator || ''} 
                      onValueChange={(value) => handleFieldChange('barIndicator', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择柱状图指标" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">柱状图图例</div>
                    <Input
                      value={formData.barLegend || ''}
                      onChange={(e) => handleFieldChange('barLegend', e.target.value)}
                      className="w-full"
                      placeholder="如：T+1月ARPU（元）"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> 折线图指标（次）
                    </div>
                    <Select 
                      value={formData.lineIndicator || ''} 
                      onValueChange={(value) => handleFieldChange('lineIndicator', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择折线图指标" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">折线图图例</div>
                    <Input
                      value={formData.lineLegend || ''}
                      onChange={(e) => handleFieldChange('lineLegend', e.target.value)}
                      className="w-full"
                      placeholder="如：50元以下占比（%）"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        if (formData.templateName === '面积趋势卡') {
          return (
            <div className="space-y-4">
              {/* 下方图表指标 */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">下方图表指标</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> 面积图指标
                    </div>
                    <Select 
                      value={formData.areaIndicator || ''} 
                      onValueChange={(value) => handleFieldChange('areaIndicator', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="请选择面积图指标" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">面积图图例</div>
                    <Input
                      value={formData.areaLegend || ''}
                      onChange={(e) => handleFieldChange('areaLegend', e.target.value)}
                      className="w-full"
                      placeholder="如：T+6留存率（%）"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        if (formData.templateName === '饼图分析卡') {
          return (
            <div className="space-y-4">
              {/* 饼图指标配置 - 动态添加 */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">饼图指标配置</div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddPieIndicator}
                    className="h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    添加指标
                  </Button>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  * 指标名称选择后，指标值将从数据库自动查询
                </div>
                {(formData.pieIndicators || []).length > 0 ? (
                  <div className="space-y-3">
                    {(formData.pieIndicators || []).map((indicator, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">
                              <span className="text-red-500">*</span> 指标名称
                            </div>
                            <Select 
                              value={indicator.name || ''} 
                              onValueChange={(value) => handleUpdatePieIndicator(index, 'name', value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="请选择渠道层级" />
                              </SelectTrigger>
                              <SelectContent>
                                {channelLevelOptions.map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">指标颜色</div>
                            <div className="flex gap-1">
                              <input
                                type="color"
                                value={indicator.color || '#3B82F6'}
                                onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border"
                              />
                              <Input
                                value={indicator.color || '#3B82F6'}
                                onChange={(e) => handleUpdatePieIndicator(index, 'color', e.target.value)}
                                className="flex-1 h-8 text-sm"
                                placeholder="#3B82F6"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePieIndicator(index)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-4 border-2 border-dashed rounded">
                    暂无饼图指标，请点击上方按钮添加
                  </div>
                )}
              </div>
              
              {/* 排名配置 */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">排名配置</div>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="showChannelRank"
                    checked={formData.showChannelRank ?? false}
                    onCheckedChange={(checked) => handleFieldChange('showChannelRank', checked as boolean)}
                  />
                  <label htmlFor="showChannelRank" className="text-sm text-gray-700 cursor-pointer">
                    显示渠道类型排名
                  </label>
                </div>
                {formData.showChannelRank && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">排名指标</div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddRankIndicator}
                        className="h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        添加指标
                      </Button>
                    </div>
                    {(formData.channelRankIndicators || []).length > 0 && (
                      <div className="space-y-2">
                        {(formData.channelRankIndicators || []).map((indicator, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Select 
                              value={indicator} 
                              onValueChange={(value) => handleUpdateRankIndicator(index, value)}
                            >
                              <SelectTrigger className="h-8 text-sm flex-1">
                                <SelectValue placeholder="请选择指标" />
                              </SelectTrigger>
                              <SelectContent>
                                {['新增客户规模', '新增放号量', '有效新增占比', '渠道转化率', 'T+6留存率', '次月ARPU', '重入网占比'].map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRankIndicator(index)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {(formData.channelRankIndicators || []).length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-2">
                        暂无排名指标，请点击上方按钮添加
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">请先选择模板名称</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // 国际运营模板配置
  const renderInternationalConfig = () => {
    switch (formData.templateType) {
      // 时间趋势类（需要数据周期）
      case '国际运营 - 整体指标卡':
        return renderInternationalOverallConfig();
      case '国际运营 - 出访规模卡':
        return renderInternationalOutboundScaleConfig();
      case '国际运营 - 使用订购卡':
        return renderInternationalUsageOrderConfig();
      case '国际运营 - 出访行为趋势卡':
        return renderInternationalBehaviorConfig();
      case '国际运营 - 收入结构趋势卡':
        return renderInternationalRevenueTrendConfig();
      // 分布/排名类（不需要数据周期）
      case '国际运营 - 分省情况卡':
        return renderInternationalProvinceConfig();
      case '国际运营 - 渠道占比卡':
        return renderInternationalChannelPieConfig();
      case '国际运营 - 自有渠道明细卡':
        return renderInternationalSelfChannelConfig();
      case '国际运营 - 合作渠道明细卡':
        return renderInternationalPartnerChannelConfig();
      case '国际运营 - 产品类型分布卡':
        return renderInternationalProductTypeConfig();
      case '国际运营 - 产品明细卡':
        return renderInternationalProductDetailConfig();
      case '国际运营 - 销量分省目标卡':
        return renderInternationalSalesTargetConfig();
      case '国际运营 - 收入分省目标卡':
        return renderInternationalRevenueTargetConfig();
      case '国际运营 - 销量TOP10方向卡':
        return renderInternationalSalesTop10Config();
      case '国际运营 - 收入TOP10方向卡':
        return renderInternationalRevenueTop10Config();
      case '国际运营 - 产品类型收入卡':
        return renderInternationalProductRevenueConfig();
      case '国际运营 - 标准资费收入卡':
        return renderInternationalStandardRevenueConfig();
      case '国际运营 - 大包多天收入卡':
        return renderInternationalBigPackageRevenueConfig();
      case '国际运营 - 漫游99收入卡':
        return renderInternationalRoaming99RevenueConfig();
      case '国际运营 - 分省目标达成情况卡':
        return renderInternationalProvinceTargetAchievementConfig();
      default:
        return null;
    }
  };

  // 国际运营 - 整体指标卡配置
  const renderInternationalOverallConfig = () => {
    const currentTemplate = getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName);
    const isEnhanced = currentTemplate?.lines && currentTemplate.lines >= 2;
    
    return (
      <div className="space-y-4">
        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalOverallIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.yoyIndicator || ''} 
                onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择同比指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEnhanced && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">环比指标</div>
                <Select 
                  value={formData.momIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('momIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择环比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="环比变化">环比变化</SelectItem>
                    <SelectItem value="环比增长率">环比增长率</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {/* 目标完成配置（领先/落后展示） */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">目标完成率指标</div>
              <Select 
                value={formData.targetRateIndicator || ''} 
                onValueChange={(value) => handleFieldChange('targetRateIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择目标完成率指标" />
                </SelectTrigger>
                <SelectContent>
                  {targetRateIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">目标差距指标</div>
              <Select 
                value={formData.targetGapIndicator || ''} 
                onValueChange={(value) => handleFieldChange('targetGapIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择目标差距指标" />
                </SelectTrigger>
                <SelectContent>
                  {targetGapIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.barIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalOverallIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || formData.barLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：出访客户（万）"
              />
            </div>
          </div>
          
          {/* 折线图配置（同比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（同比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：同比（%）"
              />
            </div>
          </div>
        </div>

        {/* 入口配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">入口配置</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableDispatch-intl"
                checked={formData.enableDispatch ?? false}
                onCheckedChange={(checked) => handleFieldChange('enableDispatch', checked as boolean)}
              />
              <label htmlFor="enableDispatch-intl" className="text-sm text-gray-700 cursor-pointer">
                支持调度
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableIndicatorTree-intl"
                checked={formData.enableIndicatorTree ?? false}
                onCheckedChange={(checked) => handleFieldChange('enableIndicatorTree', checked as boolean)}
              />
              <label htmlFor="enableIndicatorTree-intl" className="text-sm text-gray-700 cursor-pointer">
                支持指标树
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 出访规模卡配置（迷你指标卡）
  const renderInternationalOutboundScaleConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          迷你指标卡：上方展示指标值+同比，下方展示趋势图
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {outboundScaleIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.yoyIndicator || ''} 
                onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择同比指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 柱状图指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {outboundScaleIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">折线图指标</div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 使用订购卡配置（迷你指标卡）
  const renderInternationalUsageOrderConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          迷你指标卡：上方展示指标值+同比，下方展示趋势图
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {usageOrderIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.yoyIndicator || ''} 
                onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择同比指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 柱状图指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {usageOrderIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">折线图指标</div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 出访行为趋势卡配置
  const renderInternationalBehaviorConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          柱线图：展示DOU/MOU/ARPU的趋势变化（柱=值，线=同比）
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 柱状图指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {outboundBehaviorIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">柱状图图例</div>
              <Input
                value={formData.chartBarLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="w-full"
                placeholder="如：DOU（MB/人天）"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 折线图指标
              </div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">折线图图例</div>
              <Input
                value={formData.chartLineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="w-full"
                placeholder="如：同比（%）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 分省情况卡配置
  const renderInternationalProvinceConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          分省柱线图：展示16地市分公司的柱状图（主指标）和折线图（同比）
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 主指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择主指标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="客户订购渗透率">客户订购渗透率</SelectItem>
                  <SelectItem value="目标达成率">目标达成率</SelectItem>
                  <SelectItem value="ARPU">ARPU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择同比指标" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">柱状图图例</div>
              <Input
                value={formData.chartBarLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="w-full"
                placeholder="如：渗透率（%）"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">折线图图例</div>
              <Input
                value={formData.chartLineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="w-full"
                placeholder="如：同比（pp）"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 渠道占比卡配置（饼图卡）
  const renderInternationalChannelPieConfig = () => {
    // 默认颜色列表
    const defaultColors = ['#0066CC', '#00B050', '#FF6600', '#9933FF', '#FF3366', '#00CCCC'];
    
    // 获取当前饼图指标列表
    const currentPieIndicators = formData.pieIndicators || [];
    
    // 添加饼图指标
    const handleAddPieIndicatorLocal = () => {
      const newIndicators = [...currentPieIndicators, { 
        name: '', 
        color: defaultColors[currentPieIndicators.length % defaultColors.length]
      }];
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    // 更新饼图指标
    const handleUpdatePieIndicatorLocal = (index: number, field: string, value: string) => {
      const newIndicators = [...currentPieIndicators];
      newIndicators[index] = { ...newIndicators[index], [field]: value };
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    // 删除饼图指标
    const handleRemovePieIndicatorLocal = (index: number) => {
      const newIndicators = currentPieIndicators.filter((_, i) => i !== index);
      handleFieldChange('pieIndicators', newIndicators);
    };
    
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          渠道占比饼图：展示渠道分布占比（支持动态添加多个指标，指标值从数据库获取）
        </div>

        {/* 饼图配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-700">饼图指标配置（可添加多个）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddPieIndicatorLocal}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加指标
            </Button>
          </div>
          
          {currentPieIndicators.length > 0 && (
            <div className="space-y-2">
              {currentPieIndicators.map((indicator: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <div className="flex-1">
                    <Select 
                      value={indicator.name || ''} 
                      onValueChange={(value) => handleUpdatePieIndicatorLocal(index, 'name', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="请选择渠道" />
                      </SelectTrigger>
                      <SelectContent>
                        {channelDistributionIndicatorOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <input
                    type="color"
                    value={indicator.color || defaultColors[index % defaultColors.length]}
                    onChange={(e) => handleUpdatePieIndicatorLocal(index, 'color', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePieIndicatorLocal(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {currentPieIndicators.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无指标配置，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 自有渠道明细卡配置（柱线指标组）
  const renderInternationalSelfChannelConfig = () => {
    const barIndicatorOptions = ['订购量', '激活量'];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          自有渠道明细：每个指标组包含柱指标和对应的线指标，柱和线一一对应（横向柱线图）
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：订购量（万）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 合作渠道明细卡配置（柱线指标组）
  const renderInternationalPartnerChannelConfig = () => {
    const barIndicatorOptions = ['订购量', '激活量'];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          合作渠道明细：每个指标组包含柱指标和对应的线指标，柱和线一一对应（横向柱线图）
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：订购量（万）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 产品类型分布卡配置（柱线指标组）
  const renderInternationalProductTypeConfig = () => {
    const barIndicatorOptions = productTypeIndicatorOptions;
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          产品类型分布：每个指标组包含柱指标和对应的线指标，柱和线一一对应
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：订购量（万）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 产品明细卡配置（柱线指标组）
  const renderInternationalProductDetailConfig = () => {
    const barIndicatorOptions = ['订购量', '激活量'];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          产品明细：展示大包多天和漫游99产品系列的订购量分布，每个指标组包含柱指标和对应的线指标
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：订购量（万）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 销量分省目标卡配置
  const renderInternationalSalesTargetConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          销量分省目标达成：展示16地市分公司的销量目标达成率（柱=达成率，线=同比）
        </div>

        {/* 图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 柱状图指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="销量目标达成率">销量目标达成率</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 收入分省目标卡配置
  const renderInternationalRevenueTargetConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          收入分省目标达成：展示16地市分公司的收入目标达成率（柱=达成率，线=同比）
        </div>

        {/* 图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 柱状图指标
              </div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="收入目标达成率">收入目标达成率</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 同比指标
              </div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {internationalYoyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 销量TOP10方向卡配置（多指标动态添加）
  const renderInternationalSalesTop10Config = () => {
    const indicatorOptions = [
      '销量',
      '订购量',
      '激活量'
    ];
    const compareOptions = [
      '同比',
      '环比'
    ];

    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          销量TOP10方向：展示销量排名前10的方向，每个方向可配置基础指标+同比/环比（横向柱线图）
        </div>

        {/* 多指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标配置（可添加多个）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddBarIndicator}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加指标
            </Button>
          </div>
          
          {(formData.multiBarIndicators || []).length > 0 && (
            <div className="space-y-2">
              {(formData.multiBarIndicators || []).map((indicator, index) => (
                <div key={index} className="p-2 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">指标 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBarIndicator(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">基础指标</div>
                      <Select 
                        value={indicator} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'indicator', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">对比类型</div>
                      <Select 
                        value={(formData.multiBarLegends || [])[index] || ''} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'legend', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {compareOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">单位</div>
                      <Select 
                        value={(formData.multiBarLegends || [])[index] || ''} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'legend', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="万">万</SelectItem>
                          <SelectItem value="亿">亿</SelectItem>
                          <SelectItem value="%">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(formData.multiBarIndicators || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无指标，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 收入TOP10方向卡配置（多指标动态添加）
  const renderInternationalRevenueTop10Config = () => {
    const indicatorOptions = [
      '收入',
      'ARPU',
      '订购收入'
    ];
    const compareOptions = [
      '同比',
      '环比'
    ];

    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          收入TOP10方向：展示收入排名前10的方向，每个方向可配置基础指标+同比/环比（横向柱线图）
        </div>

        {/* 多指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标配置（可添加多个）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddBarIndicator}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加指标
            </Button>
          </div>
          
          {(formData.multiBarIndicators || []).length > 0 && (
            <div className="space-y-2">
              {(formData.multiBarIndicators || []).map((indicator, index) => (
                <div key={index} className="p-2 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">指标 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBarIndicator(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">基础指标</div>
                      <Select 
                        value={indicator} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'indicator', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">对比类型</div>
                      <Select 
                        value={(formData.multiBarLegends || [])[index] || ''} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'legend', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          {compareOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">单位</div>
                      <Select 
                        value={(formData.multiBarLegends || [])[index] || ''} 
                        onValueChange={(value) => handleUpdateBarIndicator(index, 'legend', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="万">万</SelectItem>
                          <SelectItem value="亿">亿</SelectItem>
                          <SelectItem value="%">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(formData.multiBarIndicators || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无指标，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 分省目标达成情况卡配置（多指标动态添加）
  const renderInternationalProvinceTargetAchievementConfig = () => {
    const indicatorOptions = [
      '已达成地州数',
      '未达成地州数',
      '达成率',
      '同比变化'
    ];
    const provinceOptions = [
      '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '克州', 
      '乌鲁木齐', '克拉玛依', '喀什', '伊犁', '昌吉', '阿克苏', '哈密', '巴州',
      '石河子', '乌鲁木齐', '克拉玛依', '昌吉', '哈密', '吐鲁番', '博州'
    ];

    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          分省目标达成情况：展示16地市分公司的目标达成情况，包含已达成/未达成地州数、各地州达成率和同比
        </div>

        {/* 汇总指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">汇总指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">已达成地州数指标</div>
              <Select 
                value={formData.chartBarIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="已达成地州数">已达成地州数</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">未达成地州数指标</div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未达成地州数">未达成地州数</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 分省指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">分省指标配置（可添加多个）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddBarIndicator}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加地州
            </Button>
          </div>
          
          {(formData.multiBarIndicators || []).length > 0 && (
            <div className="space-y-2">
              {(formData.multiBarIndicators || []).map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Select 
                    value={indicator} 
                    onValueChange={(value) => handleUpdateBarIndicator(index, 'indicator', value)}
                  >
                    <SelectTrigger className="h-8 text-sm flex-1">
                      <SelectValue placeholder="选择地州" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinceOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Select 
                      value={(formData.multiBarLegends || [])[index]?.split('|')[0] || ''} 
                      onValueChange={(value) => {
                        const current = (formData.multiBarLegends || [])[index] || '|';
                        const parts = current.split('|');
                        handleUpdateBarIndicator(index, 'legend', `${value}|${parts[1] || ''}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-20 text-sm">
                        <SelectValue placeholder="达成率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="达成率">达成率</SelectItem>
                        <SelectItem value="同比">同比</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBarIndicator(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {(formData.multiBarIndicators || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无地州配置，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 收入结构趋势卡配置
  const renderInternationalRevenueTrendConfig = () => {
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          收入结构趋势：展示标准资费和国漫包收入的时间趋势（折线图）
        </div>

        {/* 图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">图表指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 折线1指标
              </div>
              <Select 
                value={formData.chartLineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="标准资费">标准资费</SelectItem>
                  <SelectItem value="国漫包收入">国漫包收入</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 折线2指标
              </div>
              <Select 
                value={formData.chartLine2Indicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLine2Indicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="标准资费">标准资费</SelectItem>
                  <SelectItem value="国漫包收入">国漫包收入</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 国际运营 - 产品类型收入卡配置（柱线指标组）
  const renderInternationalProductRevenueConfig = () => {
    const barIndicatorOptions = [
      '大包多天收入',
      '漫游99收入',
      '标准资费收入',
      '其他收入'
    ];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          产品类型收入分布：每个指标组包含柱指标和对应的线指标，柱和线一一对应
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：收入（亿）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 标准资费收入卡配置（柱线指标组）
  const renderInternationalStandardRevenueConfig = () => {
    const barIndicatorOptions = [
      '数据客户端收入',
      '传统语音客户端收入',
      'VOLTE语音客户端收入',
      '传统短信收入',
      '其他标准资费收入'
    ];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          标准资费收入分布：每个指标组包含柱指标和对应的线指标，柱和线一一对应
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：收入（亿）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 大包多天收入卡配置（柱线指标组）
  const renderInternationalBigPackageRevenueConfig = () => {
    const barIndicatorOptions = [
      '3天包收入',
      '5天包收入',
      '7天包收入',
      '10天包收入',
      '15天包收入',
      '30天包收入'
    ];
    const lineIndicatorOptions = ['同比变化', '环比变化'];

    return (
      <div className="space-y-4">
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          大包多天收入明细：每个指标组包含柱指标和对应的线指标，柱和线一一对应
        </div>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBarLineGroup} className="h-7">
              <Plus className="w-3 h-3 mr-1" />添加指标组
            </Button>
          </div>
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarLineGroup(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select value={group.barIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择柱指标" /></SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input value={group.barLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)} className="h-8 text-sm" placeholder="如：收入（亿）" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select value={group.lineIndicator} onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="选择线指标" /></SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input value={group.lineLegend || ''} onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)} className="h-8 text-sm" placeholder="如：同比（%）" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">暂无指标组，请点击上方按钮添加</div>
          )}
        </div>
      </div>
    );
  };

  // 国际运营 - 漫游99收入卡配置（柱线指标组，柱和线一一对应）
  const renderInternationalRoaming99RevenueConfig = () => {
    const barIndicatorOptions = [
      '流量包收入',
      '语音包收入',
      '流量语音包收入'
    ];
    const lineIndicatorOptions = [
      '同比变化',
      '环比变化'
    ];

    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          漫游99收入明细：每个指标组包含柱指标和对应的线指标（同比/环比），柱和线一一对应
        </div>

        {/* 柱线指标组配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">指标组配置（柱+线）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddBarLineGroup}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加指标组
            </Button>
          </div>
          
          {(formData.barLineGroups || []).length > 0 && (
            <div className="space-y-3">
              {(formData.barLineGroups || []).map((group, index) => (
                <div key={index} className="p-3 bg-white rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">指标组 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBarLineGroup(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* 柱指标 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱指标</div>
                      <Select 
                        value={group.barIndicator} 
                        onValueChange={(value) => handleUpdateBarLineGroup(index, 'barIndicator', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择柱指标" />
                        </SelectTrigger>
                        <SelectContent>
                          {barIndicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">柱图例</div>
                      <Input
                        value={group.barLegend || ''}
                        onChange={(e) => handleUpdateBarLineGroup(index, 'barLegend', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="如：收入（亿）"
                      />
                    </div>
                  </div>
                  {/* 线指标 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线指标（对比）</div>
                      <Select 
                        value={group.lineIndicator} 
                        onValueChange={(value) => handleUpdateBarLineGroup(index, 'lineIndicator', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="选择线指标" />
                        </SelectTrigger>
                        <SelectContent>
                          {lineIndicatorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">线图例</div>
                      <Input
                        value={group.lineLegend || ''}
                        onChange={(e) => handleUpdateBarLineGroup(index, 'lineLegend', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="如：同比（%）"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(formData.barLineGroups || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              暂无指标组，请点击上方按钮添加
            </div>
          )}
        </div>
      </div>
    );
  };

  // 中高端整体指标卡配置
  const renderMidHighOverallConfig = () => {
    const currentTemplate = getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName);
    const isEnhanced = currentTemplate?.lines && currentTemplate.lines >= 2;
    
    return (
      <div className="space-y-4">
        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">基础指标（当前值）</div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {barIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">环比指标</div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEnhanced && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">同比指标</div>
                <Select 
                  value={formData.yoyIndicator || ''} 
                  onValueChange={(value) => handleFieldChange('yoyIndicator', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择同比指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {yoyIndicatorOptionsForMidHigh.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.barIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {barIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || formData.barLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：规模（亿）、保有率（%）"
              />
            </div>
          </div>
          
          {/* 折线图1配置（环比） */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {momIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（%）"
              />
            </div>
          </div>
          
          {/* 折线图2配置（同比）- 增强版显示 */}
          {isEnhanced && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">折线图2（同比）</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">
                  <span className="text-red-500">*</span> 指标
                </label>
                <Select 
                  value={formData.chartLine2Indicator || ''} 
                  onValueChange={(value) => handleFieldChange('chartLine2Indicator', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择折线图2指标" />
                  </SelectTrigger>
                  <SelectContent>
                    {yoyIndicatorOptionsForMidHigh.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
                <Input
                  value={formData.chartLine2Legend || ''}
                  onChange={(e) => handleFieldChange('chartLine2Legend', e.target.value)}
                  className="flex-1"
                  placeholder="如：同比（%）"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 中高端价值提升卡配置
  const renderMidHighValueConfig = () => {
    // 根据子模块选择对应的指标选项
    const indicatorOptions = formData.subModule === '正向提值' 
      ? positiveValueIndicatorOptions 
      : negativeValueIndicatorOptions;
    const momOptions = formData.subModule === '正向提值'
      ? ['拍照全球通正向提值客户数环比', '拍照全球通泛升档客户数环比']
      : ['拍照全球通泛消费下降客户数环比', '拍照全球通降档客户数环比'];
    
    return (
      <div className="space-y-4">
        {/* 子模块选择 */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20 shrink-0">
            <span className="text-red-500">*</span> 子模块
          </label>
          <Select 
            value={formData.subModule || ''} 
            onValueChange={(value) => handleFieldChange('subModule', value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="请选择子模块" />
            </SelectTrigger>
            <SelectContent>
              {subModuleOptionsForValue.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">基础指标（当前值）</div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">环比指标</div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：客户数（万）、金额（万元）"
              />
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {momOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（%）"
              />
            </div>
          </div>
        </div>

        {/* 交互配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">交互配置</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDrillDown ?? false}
                onChange={(e) => handleFieldChange('enableDrillDown', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">支持下钻</span>
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            开启后，用户可点击指标卡下钻查看详情数据
          </div>
        </div>
      </div>
    );
  };

  // 中高端规模发展卡配置
  const renderMidHighScaleConfig = () => {
    // 根据模板名称渲染不同配置
    switch (formData.templateName) {
      case '流入指标版':
        return renderInflowConfig();
      case '流出指标版':
        return renderOutflowConfig();
      case '流向变化版':
        return renderNetChangeConfig();
      default:
        return null;
    }
  };

  // 流入指标卡配置（纯文本卡片，无图表）
  const renderInflowConfig = () => {
    return (
      <div className="space-y-4">
        {/* 流向标识 */}
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-sm font-medium text-green-700">流入类型（绿色）- 纯文本卡片</span>
        </div>

        {/* 展示内容说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          展示结构：左侧（指标值 + 环比）+ 右侧（累计值）
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {inflowIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 环比指标
              </div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 累计指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">累计指标配置（右侧展示）</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">累计指标</div>
              <Select 
                value={formData.cumulativeIndicator || ''} 
                onValueChange={(value) => handleFieldChange('cumulativeIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择累计指标" />
                </SelectTrigger>
                <SelectContent>
                  {cumulativeInflowIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">累计单位</div>
              <Select 
                value={formData.cumulativeUnit || ''} 
                onValueChange={(value) => handleFieldChange('cumulativeUnit', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择单位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="万">万</SelectItem>
                  <SelectItem value="亿">亿</SelectItem>
                  <SelectItem value="个">个</SelectItem>
                  <SelectItem value="户">户</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 交互配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">交互配置</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDrillDown ?? false}
                onChange={(e) => handleFieldChange('enableDrillDown', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">支持下钻</span>
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            开启后，用户可点击指标卡下钻查看详情数据
          </div>
        </div>
      </div>
    );
  };

  // 流出指标卡配置（纯文本卡片，无图表）
  const renderOutflowConfig = () => {
    return (
      <div className="space-y-4">
        {/* 流向标识 */}
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-sm font-medium text-red-700">流出类型（红色）- 纯文本卡片</span>
        </div>

        {/* 展示内容说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          展示结构：左侧（指标值 + 环比）+ 右侧（关联比率名称 + 比率值）
        </div>

        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {outflowIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 环比指标
              </div>
              <Select 
                value={formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {momIndicatorOptionsForMidHigh.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 关联比率配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">关联比率配置（右侧展示）</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">比率名称</div>
              <Input
                value={formData.relatedRateName || ''}
                onChange={(e) => handleFieldChange('relatedRateName', e.target.value)}
                className="w-full"
                placeholder="如：流失率"
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">比率指标</div>
              <Select 
                value={formData.relatedRateIndicator || ''} 
                onValueChange={(value) => handleFieldChange('relatedRateIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择比率指标" />
                </SelectTrigger>
                <SelectContent>
                  {churnRateIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 交互配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">交互配置</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDrillDown ?? false}
                onChange={(e) => handleFieldChange('enableDrillDown', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">支持下钻</span>
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            开启后，用户可点击指标卡下钻查看详情数据
          </div>
        </div>
      </div>
    );
  };

  // 流向变化汇总卡配置（动态柱子配置）
  const renderNetChangeConfig = () => {
    const currentBars = formData.flowChangeBars || [];
    const hasStart = currentBars.some(bar => bar.type === 'start');
    const hasEnd = currentBars.some(bar => bar.type === 'end');
    
    return (
      <div className="space-y-4">
        {/* 说明 */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          瀑布图配置：可自由添加柱子，名称和类型自定义。起点(蓝)→流入(绿)→流出(红)→终点(蓝)
        </div>

        {/* 下方图表指标（流向变化） */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">下方图表指标（流向变化）</div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddFlowChangeBar}
              className="h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加柱子
            </Button>
          </div>
          
          {currentBars.length > 0 && (
            <div className="space-y-2">
              {/* 表头 */}
              <div className="grid grid-cols-[1fr_100px_1fr_50px_40px] gap-2 text-xs text-gray-500 px-1">
                <div><span className="text-red-500">*</span> 柱子名称</div>
                <div><span className="text-red-500">*</span> 类型</div>
                <div><span className="text-red-500">*</span> 关联指标</div>
                <div>颜色</div>
                <div></div>
              </div>
              
              {/* 柱子列表 */}
              {currentBars.map((bar, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_1fr_50px_40px] gap-2 items-center">
                  {/* 柱子名称 */}
                  <Input
                    value={bar.name}
                    onChange={(e) => handleUpdateFlowChangeBar(index, 'name', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="如：期初、新入网流入"
                  />
                  
                  {/* 类型 */}
                  <Select 
                    value={bar.type} 
                    onValueChange={(value) => handleUpdateFlowChangeBar(index, 'type', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start" disabled={hasStart && bar.type !== 'start'}>起点</SelectItem>
                      <SelectItem value="inflow">流入</SelectItem>
                      <SelectItem value="outflow">流出</SelectItem>
                      <SelectItem value="end" disabled={hasEnd && bar.type !== 'end'}>终点</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* 关联指标 */}
                  <Select 
                    value={bar.indicator} 
                    onValueChange={(value) => handleUpdateFlowChangeBar(index, 'indicator', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFlowChangeIndicatorOptions(bar.type).map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 颜色预览 */}
                  <div 
                    className="h-8 w-10 rounded border"
                    style={{ backgroundColor: bar.color || '#E5E7EB' }}
                    title={bar.color || '自动'}
                  />
                  
                  {/* 删除按钮 */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFlowChangeBar(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {currentBars.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-4">
              暂无柱子配置，请点击上方按钮添加
            </div>
          )}
        </div>

        {/* 净增显示开关 */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Checkbox
            id="showNetChange"
            checked={formData.showNetChange ?? true}
            onCheckedChange={(checked) => handleFieldChange('showNetChange', checked as boolean)}
          />
          <label htmlFor="showNetChange" className="text-sm text-gray-700 cursor-pointer">
            显示净增量（终点 - 起点）
          </label>
        </div>

        {/* 交互配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">交互配置</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDrillDown ?? false}
                onChange={(e) => handleFieldChange('enableDrillDown', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">支持下钻</span>
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            开启后，用户可点击指标卡下钻查看详情数据
          </div>
        </div>
      </div>
    );
  };

  // 中高端融合加固卡配置（无子模块，基础指标 + 图表指标配置）
  const renderMidHighFusionConfig = () => {
    // 融合加固卡专用指标选项
    const fusionIndicatorOptions = [
      '拍照全球通有效融合率',
      '拍照全球通合约率',
      '拍照全球通固移融合率',
      '拍照全球通基座融合率',
      '拍照全球通成员融合率'
    ];
    
    // 融合加固卡环比指标选项（环比单位为pp）
    const fusionMomOptions = [
      '拍照全球通有效融合率环比',
      '拍照全球通合约率环比',
      '拍照全球通固移融合率环比',
      '拍照全球通基座融合率环比',
      '拍照全球通成员融合率环比'
    ];
    
    return (
      <div className="space-y-4">
        {/* 上方展示指标配置 */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-700">上方展示指标</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 基础指标（当前值）
              </div>
              <Select 
                value={formData.basicIndicator || formData.barIndicator || ''} 
                onValueChange={(value) => handleFieldChange('basicIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择基础指标" />
                </SelectTrigger>
                <SelectContent>
                  {fusionIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 环比指标
              </div>
              <Select 
                value={formData.momIndicator || formData.lineIndicator || ''} 
                onValueChange={(value) => handleFieldChange('momIndicator', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择环比指标" />
                </SelectTrigger>
                <SelectContent>
                  {fusionMomOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 下方图表指标配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">下方图表指标</div>
          
          {/* 柱状图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">柱状图</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartBarIndicator || formData.barIndicator || formData.basicIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartBarIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择柱状图指标" />
                </SelectTrigger>
                <SelectContent>
                  {fusionIndicatorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartBarLegend || formData.barLegend || ''}
                onChange={(e) => handleFieldChange('chartBarLegend', e.target.value)}
                className="flex-1"
                placeholder="如：融合率（%）"
              />
            </div>
          </div>
          
          {/* 折线图配置 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">折线图（环比）</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">
                <span className="text-red-500">*</span> 指标
              </label>
              <Select 
                value={formData.chartLineIndicator || formData.lineIndicator || formData.momIndicator || ''} 
                onValueChange={(value) => handleFieldChange('chartLineIndicator', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择折线图指标" />
                </SelectTrigger>
                <SelectContent>
                  {fusionMomOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16 shrink-0">图例</label>
              <Input
                value={formData.chartLineLegend || formData.lineLegend || ''}
                onChange={(e) => handleFieldChange('chartLineLegend', e.target.value)}
                className="flex-1"
                placeholder="如：环比（pp）"
              />
            </div>
          </div>
        </div>

        {/* 交互配置 */}
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">交互配置</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableDrillDown ?? false}
                onChange={(e) => handleFieldChange('enableDrillDown', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">支持下钻</span>
            </label>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            开启后，用户可点击指标卡下钻查看详情数据
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>指标卡属性设置</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* 基础信息 */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded"></div>
              基础信息
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {/* 指标卡名称 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">
                  <span className="text-red-500">*</span> 指标卡名称
                </label>
                <Input
                  value={formData.cardName}
                  onChange={(e) => handleFieldChange('cardName', e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {/* 指标组名称 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">指标组名称</label>
                <Input
                  value={formData.indicatorGroupName}
                  onChange={(e) => handleFieldChange('indicatorGroupName', e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {/* 使用场景 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">使用场景</label>
                <Select 
                  value={formData.usageScenario} 
                  onValueChange={(value) => handleFieldChange('usageScenario', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {usageScenarioOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 优先级 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">优先级</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 1)}
                  className="flex-1"
                  min={1}
                />
              </div>
              
              {/* 指标专题 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">指标专题</label>
                <Select 
                  value={formData.indicatorTopic} 
                  onValueChange={(value) => handleFieldChange('indicatorTopic', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicatorTopicOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 指标类型（只读展示） */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-20 shrink-0">指标类型</label>
                <div className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {card.indicatorType || '月指标'}
                </div>
              </div>
            </div>
          </div>
          
          {/* 模板配置 */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-600 rounded"></div>
              模板配置
            </div>
            
            {/* 模板类型选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-20 shrink-0">
                <span className="text-red-500">*</span> 模板类型
              </label>
              <Select 
                value={formData.templateType} 
                onValueChange={(value) => {
                  // 切换模板类型时，重置指标卡模板
                  const templates = getTemplateOptions(value);
                  const defaultTemplate = templates[0]?.name || '';
                  setFormData(prev => ({ 
                    ...prev, 
                    templateType: value,
                    templateName: defaultTemplate
                  }));
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 指标卡模板选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-20 shrink-0">
                <span className="text-red-500">*</span> 指标卡模板
              </label>
              <Select 
                value={formData.templateName} 
                onValueChange={(value) => handleFieldChange('templateName', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="请选择指标卡模板" />
                </SelectTrigger>
                <SelectContent>
                  {getTemplateOptions(formData.templateType).map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                      <span className="text-gray-400 ml-2">({option.description})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 模板说明 */}
            {formData.templateName && (
              <div className="text-xs text-gray-500 ml-[88px]">
                {getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName)?.description}
              </div>
            )}
            
            {/* 根据模板类型显示不同配置 */}
            <div className="bg-gray-50 rounded-lg p-4">
              {/* 整体指标卡 - 通用配置，根据使用场景动态加载指标选项 */}
              {formData.templateType === '整体指标卡' && renderOverallMetricConfig()}
              {/* 迷你指标卡 */}
              {formData.templateType === '迷你指标卡' && renderMiniMetricConfig()}
              {/* 柱线指标组卡 */}
              {formData.templateType === '柱线指标组卡' && renderBarLineGroupConfig()}
              {/* 分省分布卡 */}
              {formData.templateType === '分省分布卡' && renderProvinceDistributionConfig()}
              {/* 排名分析卡 */}
              {formData.templateType === '排名分析卡' && renderRankingAnalysisConfig()}
              {/* 饼图分析卡 */}
              {formData.templateType === '饼图分析卡' && renderPieAnalysisConfig()}
              {/* 业务专用卡片 */}
              {formData.templateType === '客户特征分析卡' && renderFeatureAnalysisConfig()}
              {(formData.templateType === '客群看管卡' || formData.templateType === '补充指标卡') && renderSegmentConfig()}
              {formData.templateType === '价值提升卡' && renderValueUpgradeConfig()}
              {formData.templateType === '规模发展卡' && renderScaleDevelopmentConfig()}
              {formData.templateType === '融合加固卡' && renderFusionConfig()}
              {formData.templateType === '质量分析卡' && renderQualityAnalysisConfig()}
              {formData.templateType === '收入结构趋势卡' && renderRevenueTrendConfig()}
              {/* 出访行为趋势卡 */}
              {formData.templateType === '出访行为趋势卡' && renderVisitBehaviorTrendConfig()}
            </div>
          </div>
          
          {/* 数据配置 - 只有有图表的模板才需要显示 */}
          {(() => {
            const currentTemplate = getTemplateOptions(formData.templateType).find(t => t.name === formData.templateName);
            // 纯文本卡片不需要数据周期
            const isTextOnlyCard = formData.templateName?.includes('流入指标') 
              || formData.templateName?.includes('流出指标') 
              || formData.templateName?.includes('流向变化');
            
            // 需要数据周期的卡片类型（时间趋势类）
            const trendCardTypes = ['整体指标卡', '迷你指标卡', '收入结构趋势卡'];
            // 分布/排名类卡片不需要数据周期
            const distributionCardTypes = ['柱线指标组卡', '分省分布卡', '排名分析卡', '饼图分析卡'];
            
            const needsDataPeriod = !isTextOnlyCard && (
              trendCardTypes.includes(formData.templateType)
              || formData.templateType === '客户特征分析卡'
              || formData.templateType === '价值提升卡'
              || formData.templateType === '融合加固卡'
              || formData.templateType === '质量分析卡'
              || (currentTemplate && currentTemplate.lines > 0)
            );
            
            return needsDataPeriod && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-600 rounded"></div>
                  数据配置
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-20 shrink-0">
                    <span className="text-red-500">*</span> 数据周期
                  </label>
                  <Select 
                    value={formData.dataPeriod} 
                    onValueChange={(value) => handleFieldChange('dataPeriod', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPeriodOptions().map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-400 ml-2">
                    {card.indicatorType === '日指标' ? '日指标可选：7/15/30/60天' : '月指标可选：当月/3/6/12个月'}
                  </span>
                </div>
              </div>
            );
          })()}
          
          {/* 交互配置 */}
          {/* 规模发展卡的子模板已有内置交互配置，这里不再重复显示 */}
          {!['流入指标版', '流出指标版', '流向变化版'].includes(formData.templateName || '') && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-600 rounded"></div>
                交互配置
              </div>
              
              {/* 下钻配置 - 通用配置，所有卡片都显示 */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enableDrillDown"
                    checked={formData.enableDrillDown ?? false}
                    onCheckedChange={(checked) => handleFieldChange('enableDrillDown', checked as boolean)}
                  />
                  <label htmlFor="enableDrillDown" className="text-sm text-gray-700 cursor-pointer">
                    支持下钻（点击查看详情数据）
                  </label>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  开启后，用户可点击指标卡下钻查看详情
                </div>
              </div>
            
            {/* 着色配置 - 只有有柱状图的模板才显示 */}
            {/* 离网维系：整体指标卡、客户特征分析卡有柱状图；客群看管卡/补充指标卡无柱状图 */}
            {/* 中高端客户运营：流入指标版、流出指标版、流向变化版是纯文本卡片，无柱状图 */}
            {(() => {
              // 纯文本卡片无柱状图，不需要着色配置
              const isTextOnlyCard = formData.templateName === '流入指标版' 
                || formData.templateName === '流出指标版' 
                || formData.templateName === '流向变化版';
              // 饼图卡片无柱状图
              const isPieCard = formData.chartType === 'pie' || formData.templateName === '饼图分析版';
              // 新的模板类型判断：整体指标卡、客户特征分析卡、柱线指标组卡等有柱状图
              const hasBarChart = !isTextOnlyCard && !isPieCard && (
                formData.templateType === '整体指标卡' || 
                formData.templateType === '客户特征分析卡' ||
                formData.templateType === '柱线指标组卡' ||
                formData.templateType === '分省分布卡' ||
                formData.templateType === '排名分析卡' ||
                formData.templateType === '价值提升卡' ||
                formData.templateType === '融合加固卡' ||
                formData.templateType === '质量分析卡' ||
                formData.templateType === '收入结构趋势卡'
              );
              return hasBarChart;
            })() && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="enableColoring"
                    checked={formData.enableColoring}
                    onCheckedChange={(checked) => handleFieldChange('enableColoring', checked as boolean)}
                  />
                  <label htmlFor="enableColoring" className="text-sm text-gray-700 cursor-pointer">
                    启用柱状图着色
                  </label>
                </div>
                
                {formData.enableColoring && (
                  <div className="pl-6 space-y-2">
                    <div className="text-sm text-gray-600 mb-2">指标方向</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="indicatorDirection"
                          checked={formData.indicatorDirection === '正向'}
                          onChange={() => handleFieldChange('indicatorDirection', '正向')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">正向指标（数值越大越好）</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="indicatorDirection"
                          checked={formData.indicatorDirection === '负向'}
                          onChange={() => handleFieldChange('indicatorDirection', '负向')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">负向指标（数值越小越好）</span>
                      </label>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formData.indicatorDirection === '正向' 
                        ? '正向指标：正增长显示绿色，负增长显示红色'
                        : '负向指标：正增长显示红色，负增长显示绿色'}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
