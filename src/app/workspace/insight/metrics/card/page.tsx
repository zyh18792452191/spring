'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, RotateCcw, Search, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import ChartThumbnail from '@/components/ChartThumbnail';
import CardPreviewDialog from '@/components/CardPreviewDialog';
import IndicatorCardSettingsDialog from '@/components/IndicatorCardSettingsDialog';

// 饼图指标配置类型
interface PieIndicator {
  name: string;  // 指标名称
  color: string; // 指标颜色
}

// 指标卡数据类型
interface IndicatorCard {
  id: number;
  cardName: string;
  cardTitle?: string; // 卡片标题（如"物理属性 - 年龄分布"）
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
  // 基础配置
  priority?: number; // 优先级
  // 数据配置
  indicatorType?: '日指标' | '月指标'; // 指标类型（固有属性）
  dataPeriod?: string; // 数据周期（可选，纯文本卡片和流向卡无需此字段）
  // 基础指标配置（新增市场整体增量卡）
  basicIndicator?: string; // 基础指标名称
  basicValue?: string; // 基础指标值
  momValue?: string; // 环比值
  momUnit?: string; // 环比单位
  // 整体离网指标卡配置
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
  // 客户特征分析卡配置
  analysisType?: string;
  dimensions?: DimensionConfig[];
  // 客群看管卡/补充指标卡配置
  mainIndicator?: string;
  compareType?: '环比' | '同比';
  // 下钻配置
  enableDrillDown?: boolean; // 是否支持下钻
  // 着色配置
  enableColoring?: boolean; // 是否启用着色
  indicatorDirection?: '正向' | '负向'; // 指标方向
  // 中高端客户运营配置
  subModule?: string; // 子模块
  yoyUnit?: '%' | '万' | '个' | 'pp'; // 同比单位
  isRateIndicator?: boolean; // 是否比率类指标
  valueDirection?: '正向' | '逆向'; // 数值方向
  flowType?: '流入' | '流出' | '汇总'; // 流向类型
  flowColor?: string; // 流向颜色
  cumulativeIndicator?: string; // 累计值指标
  cumulativeUnit?: string; // 累计值单位
  momIndicator?: string; // 环比指标
  yoyIndicator?: string; // 同比指标
  relatedRateName?: string; // 关联率值名称
  relatedRateIndicator?: string; // 关联率值指标
  relatedRateUnit?: string; // 关联率值单位
  // 流向变化汇总卡配置（6根柱子）
  initialIndicatorName?: string; // 期初指标名称
  initialIndicator?: string; // 期初指标
  inflowIndicator1Name?: string; // 流入指标1名称
  inflowIndicator1?: string; // 流入指标1
  inflowIndicator2Name?: string; // 流入指标2名称
  inflowIndicator2?: string; // 流入指标2
  outflowIndicator1Name?: string; // 流出指标1名称
  outflowIndicator1?: string; // 流出指标1
  outflowIndicator2Name?: string; // 流出指标2名称
  outflowIndicator2?: string; // 流出指标2
  finalIndicatorName?: string; // 期末指标名称
  finalIndicator?: string; // 期末指标
  showNetChange?: boolean; // 显示净变化
  flowChangeBars?: FlowChangeBar[]; // 流向变化柱子列表（新版动态配置）
  // 目标完成配置（国际运营整体指标卡）
  targetRateIndicator?: string; // 目标完成率指标（如 "目标完成率"）
  targetGapIndicator?: string; // 目标差距指标（如 "目标差距"）
  // 国际运营 - 目标与方向分析卡配置
  targetIndicator?: string; // TOP10方向指标（销量/收入）
  targetUnit?: string; // TOP10方向单位（万/亿）
  // 新增市场 - 面积趋势卡配置
  areaIndicator?: string; // 面积图指标
  areaLegend?: string; // 面积图图例
  // 新增市场 - 饼图分析卡配置（新版：动态指标列表）
  pieIndicators?: PieIndicator[]; // 饼图指标列表（name + color）
  // 旧版饼图配置（保留兼容）
  pieIndicator1?: string; // 饼图指标1
  pieValue1?: string; // 饼图指标1值
  pieColor1?: string; // 饼图指标1颜色
  pieIndicator2?: string; // 饼图指标2
  pieValue2?: string; // 饼图指标2值
  pieColor2?: string; // 饼图指标2颜色
  showChannelRank?: boolean; // 是否显示渠道排名
  channelRankIndicators?: string[]; // 渠道排名指标列表
  pieLegendTitle?: string; // 饼图图例标题
  // 国际运营 - 目标与方向分析卡配置
  chartBarIndicator?: string; // 图表柱指标
  chartBarLegend?: string; // 图表柱图例
  // 国际运营 - 收入分析卡配置
  chartLineIndicator?: string; // 图表线指标
  chartLine2Indicator?: string; // 图表第二条线指标
}

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

// 离网维系概览页指标卡数据
const mockData: IndicatorCard[] = [
  // ========== 整体离网指标（4个）==========
  {
    id: 1,
    cardName: '当月全量离网客户数',
    templateName: '增强版',
    templateType: '整体指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '当月全量离网客户数',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '整体离网指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '当月全量离网客户数',
    barLegend: '离网规模（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    line2Indicator: '同比变化',
    line2Legend: '同比（%）',
    enableAlarm: true,
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 2,
    cardName: '当月拍照中高端离网客户数',
    templateName: '增强版',
    templateType: '整体指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF9500',
    size: '1:1',
    indicatorGroupName: '当月拍照中高端离网客户数',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '整体离网指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '当月拍照中高端离网客户数',
    barLegend: '离网规模（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    line2Indicator: '同比变化',
    line2Legend: '同比（%）',
    enableAlarm: true,
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 3,
    cardName: '当月拍照全球通离网客户数',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF0000',
    size: '1:1',
    indicatorGroupName: '当月拍照全球通离网客户数',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '整体离网指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '当月拍照全球通离网客户数',
    barLegend: '离网规模（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    enableAlarm: true,
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 4,
    cardName: '离网率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '全量客户离网率',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '整体离网指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '全量客户离网率',
    barLegend: '离网率（%）',
    lineIndicator: '累计月均离网率',
    lineLegend: '累计月均（%）',
    enableAlarm: false,
    enableDispatch: false,
    enableIndicatorTree: false
  },
  // ========== 离网客户特征分析（4个）==========
  {
    id: 5,
    cardName: '年龄分布',
    cardTitle: '物理属性 - 年龄分布',
    templateName: '年龄分布',
    templateType: '客户特征分析卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '离网客户年龄分布',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '离网客户特征分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '离网规模',
    barLegend: '离网规模（万）',
    lineIndicator: '离网率',
    lineLegend: '离网率（%）',
    analysisType: '年龄分布',
    dimensions: [
      { label: '0-18岁', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '18-25岁', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '25-30岁', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '30-50岁', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '50-70岁', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '70岁及以上', barIndicator: '离网规模', lineIndicator: '离网率' }
    ]
  },
  {
    id: 6,
    cardName: 'ARPU分层',
    cardTitle: '资费属性 - ARPU分层',
    templateName: 'ARPU分层',
    templateType: '客户特征分析卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '离网客户ARPU分层',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '离网客户特征分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '离网规模',
    barLegend: '离网规模（万）',
    lineIndicator: '离网率',
    lineLegend: '离网率（%）',
    analysisType: 'ARPU分层',
    dimensions: [
      { label: '50元以下', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '50-100元', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '100-150元', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '150-200元', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '200元以上', barIndicator: '离网规模', lineIndicator: '离网率' }
    ]
  },
  {
    id: 7,
    cardName: '带宽分段',
    cardTitle: '业务属性 - 带宽分段',
    templateName: '带宽分段',
    templateType: '客户特征分析卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '离网客户带宽分段',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '离网客户特征分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '离网规模',
    barLegend: '离网规模（万）',
    lineIndicator: '离网率',
    lineLegend: '离网率（%）',
    analysisType: '带宽分段',
    dimensions: [
      { label: '无宽带', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '50M以下', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '50-100M', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '100-200M', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '200M以上', barIndicator: '离网规模', lineIndicator: '离网率' }
    ]
  },
  {
    id: 8,
    cardName: '卡槽状态',
    cardTitle: '卡槽属性 - 卡槽状态',
    templateName: '卡槽状态',
    templateType: '客户特征分析卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '离网客户卡槽状态',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: false,
    indicatorTopic: '离网客户特征分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '离网规模',
    barLegend: '离网规模（万）',
    lineIndicator: '离网率',
    lineLegend: '离网率（%）',
    analysisType: '卡槽状态',
    dimensions: [
      { label: '单卡槽', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '双卡槽-主卡', barIndicator: '离网规模', lineIndicator: '离网率' },
      { label: '双卡槽-副卡', barIndicator: '离网规模', lineIndicator: '离网率' }
    ]
  },
  // ========== 客群看管 - 重点客群看管（6个）==========
  {
    id: 9,
    cardName: '宽带沉默客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '宽带沉默客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:30:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '宽带沉默客户规模',
    lineIndicator: '规模环比',
    line2Indicator: '规模同比'
  },
  {
    id: 10,
    cardName: '无宽带潜在离网风险客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '无宽带潜在离网风险客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:25:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '无宽带潜在离网风险客户规模',
    lineIndicator: '规模环比',
    line2Indicator: '规模同比'
  },
  {
    id: 11,
    cardName: '合约3个月内到期客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '合约3个月内到期客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:20:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '合约3个月内到期客户规模',
    lineIndicator: '规模环比',
    line2Indicator: '规模同比'
  },
  {
    id: 12,
    cardName: '欠费停机超过6个月客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '欠费停机超过6个月客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:15:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '欠费停机超过6个月客户规模',
    lineIndicator: '规模环比'
  },
  {
    id: 13,
    cardName: '高额停机超过6个月客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '高额停机超过6个月客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:10:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '高额停机超过6个月客户规模',
    lineIndicator: '规模环比',
    line2Indicator: '规模同比'
  },
  {
    id: 14,
    cardName: '预销号超过6个月客户',
    templateName: '基础版',
    templateType: '客群看管卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '预销号超过6个月客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-重点客群看管',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:05:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '预销号超过6个月客户规模',
    lineIndicator: '规模环比'
  },
  // ========== 客群看管 - 补充指标（3个）==========
  {
    id: 15,
    cardName: '身份证离网客户数',
    templateName: '基础版',
    templateType: '补充指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '身份证离网客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-补充指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:30:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '身份证离网客户数',
    lineIndicator: '客户数环比',
    line2Indicator: '客户数同比'
  },
  {
    id: 16,
    cardName: '部分号码离网客户数',
    templateName: '基础版',
    templateType: '补充指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '部分号码离网客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-补充指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:25:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '部分号码离网客户数',
    lineIndicator: '客户数环比'
  },
  {
    id: 17,
    cardName: '重入网客户数',
    templateName: '基础版',
    templateType: '补充指标卡',
    usageScenario: '离网维系概览页',
    cardIcon: 'none',
    chartType: 'none',
    size: '1:1',
    indicatorGroupName: '重入网客户规模',
    businessScenario: '公众市场/存量运营/离网维系',
    isCustomerGroup: true,
    indicatorTopic: '客群看管-补充指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:20:00',
    status: true,
    indicatorType: '月指标',
    mainIndicator: '重入网客户数',
    lineIndicator: '客户数环比',
    line2Indicator: '客户数同比'
  },
  // ========== 中高端客户运营 - 整体指标卡（9个）==========
  {
    id: 18,
    cardName: '中高端客户规模',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '中高端客户规模',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '中高端客户规模',
    barLegend: '规模（亿）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 19,
    cardName: '中高端客户规模累计净增',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '中高端客户规模累计净增',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '中高端客户规模累计净增',
    barLegend: '净增（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 20,
    cardName: '拍照中高端综合保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照中高端综合保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照中高端综合保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 21,
    cardName: '拍照中高端规模保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照中高端规模保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照中高端规模保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 22,
    cardName: '拍照中高端价值保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照中高端价值保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:10:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照中高端价值保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 23,
    cardName: '拍照全球通综合保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通综合保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:05:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通综合保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 24,
    cardName: '拍照全球通规模保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通规模保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:00:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通规模保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  {
    id: 25,
    cardName: '拍照全球通价值保有率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通价值保有率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:55:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通价值保有率',
    barLegend: '保有率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDispatch: true,
    enableDrillDown: true
  },
  // ========== 中高端客户运营 - 价值提升卡（4个）==========
  {
    id: 27,
    cardName: '拍照全球通正向提值客户数',
    templateName: '正向提值版',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '价值提升-正向提值',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '正向提值',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:45:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通正向提值客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    valueDirection: '正向',
    enableDispatch: true
  },
  {
    id: 28,
    cardName: '拍照全球通泛升档客户数',
    templateName: '正向提值版',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '价值提升-正向提值',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '正向提值',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:40:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通泛升档客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    valueDirection: '正向',
    enableDispatch: true
  },
  {
    id: 29,
    cardName: '拍照全球通泛消费下降客户数',
    templateName: '逆向控损版',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF6B35',
    size: '1:1',
    indicatorGroupName: '价值提升-逆向控损',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '逆向控损',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:35:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通泛消费下降客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    valueDirection: '逆向',
    enableDispatch: true
  },
  {
    id: 30,
    cardName: '拍照全球通降档客户数',
    templateName: '逆向控损版',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF6B35',
    size: '1:1',
    indicatorGroupName: '价值提升-逆向控损',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '逆向控损',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通降档客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    valueDirection: '逆向',
    enableDispatch: true
  },
  // ========== 中高端客户运营 - 规模发展卡（5个）==========
  {
    id: 31,
    cardName: '中高端客户流入',
    templateName: '流入指标版',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'flow',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '规模发展-流入',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    subModule: '流入',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:25:00',
    status: true,
    indicatorType: '月指标',
    flowType: '流入',
    flowColor: '#00B050',
    cumulativeIndicator: '累计流入数',
    cumulativeUnit: '万',
    momIndicator: '流入环比',
    enableDispatch: true
  },
  {
    id: 32,
    cardName: '中高端客户流出',
    templateName: '流出指标版',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'flow',
    chartColor: '#FF0000',
    size: '1:1',
    indicatorGroupName: '规模发展-流出',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    subModule: '流出',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:20:00',
    status: true,
    indicatorType: '月指标',
    flowType: '流出',
    flowColor: '#FF0000',
    momIndicator: '流出环比',
    relatedRateName: '流失率',
    relatedRateIndicator: '中高端客户流失率',
    relatedRateUnit: '%',
    enableDispatch: true
  },
  {
    id: 33,
    cardName: '中高端客户流向',
    templateName: '流向变化版',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'flow',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '规模发展-净增',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    subModule: '净增',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:15:00',
    status: true,
    indicatorType: '月指标',
    flowType: '汇总',
    flowColor: '#0066CC',
    initialIndicatorName: '25年12月中高端客户',
    initialIndicator: '期初中高端客户规模',
    inflowIndicator1Name: '新入网流入',
    inflowIndicator1: '新入网流入中高端客户数',
    inflowIndicator2Name: '升级转入',
    inflowIndicator2: '升级转入中高端客户数',
    outflowIndicator1Name: '离网流失',
    outflowIndicator1: '中高端客户流失数',
    outflowIndicator2Name: '降档转出',
    outflowIndicator2: '降档转出中高端客户数',
    finalIndicatorName: '26年2月中高端客户',
    finalIndicator: '期末中高端客户规模',
    showNetChange: true,
    enableDispatch: true,
    // 新版动态柱子配置（与旧字段兼容）
    flowChangeBars: [
      { name: '25年12月中高端客户', type: 'start', indicator: '期初中高端客户规模', color: '#3B82F6' },
      { name: '新入网流入', type: 'inflow', indicator: '新入网流入中高端客户数', color: '#10B981' },
      { name: '升级转入', type: 'inflow', indicator: '升级转入中高端客户数', color: '#10B981' },
      { name: '离网流失', type: 'outflow', indicator: '中高端客户流失数', color: '#EF4444' },
      { name: '降档转出', type: 'outflow', indicator: '降档转出中高端客户数', color: '#EF4444' },
      { name: '26年2月中高端客户', type: 'end', indicator: '期末中高端客户规模', color: '#3B82F6' }
    ]
  },
  {
    id: 34,
    cardName: '中高端客户流入率',
    templateName: '流入指标版',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'bar',
    chartType: 'bar',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '规模发展-流入率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    subModule: '流入率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:10:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '中高端客户流入率',
    barLegend: '流入率（%）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    enableDispatch: true
  },
  // ========== 中高端客户运营 - 融合加固卡（5个）==========
  {
    id: 35,
    cardName: '拍照全球通有效融合率',
    templateName: '基础版',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '融合加固-有效融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    subModule: '有效融合率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:05:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通有效融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    enableDispatch: true
  },
  {
    id: 36,
    cardName: '拍照全球通合约率',
    templateName: '基础版',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '融合加固-合约率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    subModule: '合约率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:00:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通合约率',
    barLegend: '合约率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    enableDispatch: true
  },
  {
    id: 37,
    cardName: '拍照全球通固移融合率',
    templateName: '基础版',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '融合加固-固移融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    subModule: '固移融合率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:55:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通固移融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    enableDispatch: true
  },
  {
    id: 38,
    cardName: '拍照全球通基座融合率',
    templateName: '基础版',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '融合加固-基座融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    subModule: '基座融合率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:50:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通基座融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    enableDispatch: true
  },
  {
    id: 39,
    cardName: '拍照全球通成员融合率',
    templateName: '基础版',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '融合加固-成员融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    subModule: '成员融合率',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:45:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通成员融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    isRateIndicator: true,
    yoyUnit: 'pp',
    valueDirection: '正向',
    enableDispatch: true
  },
  // ========== 新增市场 - 整体增量卡（4个）==========
  {
    id: 40,
    cardName: '新增客户规模',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#3B82F6',
    size: '1:1',
    indicatorGroupName: '整体增量指标',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '整体增量',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 基础配置
    basicIndicator: '新增客户规模',
    basicValue: '125.6万户',
    momIndicator: '环比变化',
    momValue: '+5.2',
    momUnit: '%',
    // 图表配置
    barIndicator: '新增客户规模',
    barLegend: '新增客户（万户）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    // 功能配置
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 41,
    cardName: '一级新增放号量',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#3B82F6',
    size: '1:1',
    indicatorGroupName: '整体增量指标',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '整体增量',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 基础配置
    basicIndicator: '一级新增放号量',
    basicValue: '36.5万户',
    momIndicator: '环比变化',
    momValue: '+3.8',
    momUnit: '%',
    // 图表配置
    barIndicator: '一级新增放号量',
    barLegend: '放号量（万户）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    // 功能配置
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 42,
    cardName: '省级新增放号量',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#3B82F6',
    size: '1:1',
    indicatorGroupName: '整体增量指标',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '整体增量',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 基础配置
    basicIndicator: '省级新增放号量',
    basicValue: '1021.4万户',
    momIndicator: '环比变化',
    momValue: '+6.5',
    momUnit: '%',
    // 图表配置
    barIndicator: '省级新增放号量',
    barLegend: '放号量（万户）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    // 功能配置
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 43,
    cardName: 'T+6留存率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#10B981',
    size: '1:1',
    indicatorGroupName: '整体增量指标',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '整体增量',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 基础配置
    basicIndicator: 'T+6留存率',
    basicValue: '68.5%',
    momIndicator: '环比变化',
    momValue: '+1.2',
    momUnit: 'pp',
    isRateIndicator: true,
    // 图表配置
    barIndicator: 'T+6留存率',
    barLegend: '留存率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    // 功能配置
    enableDispatch: false,
    enableIndicatorTree: false
  },
  // ========== 新增市场 - 质量分析卡（4个）==========
  {
    id: 44,
    cardName: '重入网占比分析',
    templateName: '柱线追踪版',
    templateType: '质量分析卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#3B82F6',
    size: '1:1',
    indicatorGroupName: '新增客户质量分析',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '质量分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 只有图表配置，无基础配置
    barIndicator: '重入网占比',
    barLegend: '重入网占比（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）'
  },
  {
    id: 45,
    cardName: '新增次月ARPU分析',
    templateName: '双轴追踪版',
    templateType: '质量分析卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#8B5CF6',
    size: '1:1',
    indicatorGroupName: '新增客户质量分析',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '质量分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 只有图表配置，无基础配置
    barIndicator: 'T+1月ARPU',
    barLegend: 'T+1月ARPU（元）',
    lineIndicator: '50元以下占比',
    lineLegend: '50元以下占比（%）'
  },
  {
    id: 46,
    cardName: '留存率分析',
    templateName: '面积趋势版',
    templateType: '质量分析卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'area',
    chartType: 'area',
    chartColor: '#10B981',
    size: '1:1',
    indicatorGroupName: '新增客户质量分析',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '质量分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 只有1个指标配置
    areaIndicator: 'T+6留存率',
    areaLegend: 'T+6留存率（%）'
  },
  {
    id: 47,
    cardName: '渠道效能分析',
    templateName: '饼图分析版',
    templateType: '质量分析卡',
    usageScenario: '新增市场概览页',
    cardIcon: 'pie',
    chartType: 'pie',
    chartColor: '#3B82F6',
    size: '1:1',
    indicatorGroupName: '新增客户质量分析',
    businessScenario: '公众市场/新增市场',
    isCustomerGroup: false,
    indicatorTopic: '质量分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 饼图指标配置（只配置名称和颜色，值从数据库查询）
    pieIndicators: [
      { name: '省级渠道', color: '#3B82F6' },
      { name: '一级渠道', color: '#10B981' }
    ],
    // 渠道类型排名
    showChannelRank: true,
    channelRankIndicators: ['新增客户规模', '有效新增占比']
  },
  // ========== 国际运营 - 整体指标卡（4个）==========
  {
    id: 48,
    cardName: '出访客户（含0）',
    templateName: '增强版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '国际运营整体指标',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '出访客户（含0）',
    yoyIndicator: '同比变化',
    momIndicator: '环比变化',
    barIndicator: '出访客户（含0）',
    barLegend: '出访客户（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）',
    enableDispatch: true,
    enableIndicatorTree: true,
    targetRateIndicator: '目标完成率',
    targetGapIndicator: '目标差距'
  },
  {
    id: 49,
    cardName: '销量',
    templateName: '增强版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '国际运营整体指标',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '销量',
    yoyIndicator: '同比变化',
    momIndicator: '环比变化',
    barIndicator: '国漫产品订购量',
    barLegend: '订购量（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）',
    enableDispatch: true,
    enableIndicatorTree: true,
    targetRateIndicator: '销量目标完成率',
    targetGapIndicator: '销量目标差距'
  },
  {
    id: 50,
    cardName: '收入',
    templateName: '增强版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '国际运营整体指标',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '收入',
    yoyIndicator: '同比变化',
    momIndicator: '环比变化',
    barIndicator: '出访客户收入-折后',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）',
    enableDispatch: true,
    enableIndicatorTree: true
  },
  {
    id: 51,
    cardName: '客户订购渗透率',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '国际运营整体指标',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-整体指标',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 10:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '客户订购渗透率',
    yoyIndicator: '同比变化',
    barIndicator: '客户订购渗透率',
    barLegend: '渗透率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）',
    enableDispatch: true,
    enableIndicatorTree: false
  },
  // ========== 国际运营 - 出访规模卡（4个）==========
  {
    id: 52,
    cardName: '出访人天',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0085D0',
    size: '1:1',
    indicatorGroupName: '出访规模',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '出访人天',
    yoyIndicator: '同比变化',
    barIndicator: '出访人天',
    barLegend: '人天（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  {
    id: 53,
    cardName: '出访人次',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00A3E0',
    size: '1:1',
    indicatorGroupName: '出访规模',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '出访人次',
    yoyIndicator: '同比变化',
    barIndicator: '出访人次',
    barLegend: '人次（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  {
    id: 54,
    cardName: '分方向出访总次数',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '出访规模',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '分方向出访总次数',
    yoyIndicator: '同比变化',
    barIndicator: '分方向出访总次数',
    barLegend: '万人次',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  {
    id: 55,
    cardName: '出访客户含0话单占比',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF6B6B',
    size: '1:1',
    indicatorGroupName: '出访规模',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '出访客户含0话单占比',
    yoyIndicator: '同比变化',
    barIndicator: '出访客户含0话单占比',
    barLegend: '占比（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  // ========== 国际运营 - 使用订购卡（4个）==========
  {
    id: 56,
    cardName: '客户订购渗透率-自有渠道',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '使用订购',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:10:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '客户订购渗透率-自有渠道',
    yoyIndicator: '同比变化',
    barIndicator: '客户订购渗透率-自有渠道',
    barLegend: '渗透率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  {
    id: 57,
    cardName: '客户订购渗透率-合作渠道',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '使用订购',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:05:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '客户订购渗透率-合作渠道',
    yoyIndicator: '同比变化',
    barIndicator: '客户订购渗透率-合作渠道',
    barLegend: '渗透率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  {
    id: 58,
    cardName: '国漫产品订购客户数占比',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF6B6B',
    size: '1:1',
    indicatorGroupName: '使用订购',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:00:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '国漫产品订购客户数占比',
    yoyIndicator: '同比变化',
    barIndicator: '国漫产品订购客户数占比',
    barLegend: '占比（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  {
    id: 59,
    cardName: '国漫产品使用客户数占比',
    templateName: '基础版',
    templateType: '迷你指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FFA500',
    size: '1:1',
    indicatorGroupName: '使用订购',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:55:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    basicIndicator: '国漫产品使用客户数占比',
    yoyIndicator: '同比变化',
    barIndicator: '国漫产品使用客户数占比',
    barLegend: '占比（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  // ========== 国际运营 - 出访行为趋势卡（3个）==========
  {
    id: 60,
    cardName: 'DOU趋势',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '出访行为趋势',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:50:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: 'DOU（MB/人天）',
    barLegend: 'DOU（MB/人天）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  {
    id: 61,
    cardName: 'MOU趋势',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '出访行为趋势',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:45:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: 'MOU（Min/人天）',
    barLegend: 'MOU（Min/人天）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  {
    id: 62,
    cardName: 'ARPU趋势',
    templateName: '基础版',
    templateType: '整体指标卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '出访行为趋势',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:40:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: 'ARPU（元/人）',
    barLegend: 'ARPU（元/人）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 分省情况卡（1个）==========
  {
    id: 63,
    cardName: '客户订购渗透率-分省情况',
    templateName: '基础版',
    templateType: '分省分布卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '2:1',
    indicatorGroupName: '分省情况',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-出访客户分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:35:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '渗透率',
    barLegend: '渗透率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  // ========== 国际运营 - 渠道占比卡（1个）==========
  {
    id: 64,
    cardName: '渠道占比',
    templateName: '基础版',
    templateType: '饼图分析卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'pie',
    chartType: 'pie',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '渠道分布',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    // 饼图指标配置（只配置名称和颜色，值从数据库查询）
    pieIndicators: [
      { name: '自有渠道', color: '#0066CC' },
      { name: '合作渠道', color: '#00B050' }
    ]
  },
  // ========== 国际运营 - 自有渠道明细卡（1个）==========
  {
    id: 65,
    cardName: '自有渠道明细（万）',
    templateName: '横向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '渠道分布',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:31:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '订购量',
    barLegend: '订购量（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 合作渠道明细卡（1个）==========
  {
    id: 66,
    cardName: '合作渠道明细（万）',
    templateName: '横向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '渠道分布',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:32:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '订购量',
    barLegend: '订购量（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 产品类型分布卡（1个）==========
  {
    id: 67,
    cardName: '产品类型分布（万）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '产品类型分布',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:25:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '订购量',
    barLegend: '订购量（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 产品明细卡（1个）==========
  {
    id: 68,
    cardName: '产品明细（万）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '2:1',
    indicatorGroupName: '产品类型分布',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:26:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '大包多天订购量',
    barLegend: '订购量（万）',
    lineIndicator: '漫游99订购量',
    lineLegend: '订购量（万）'
  },
  // ========== 国际运营 - 销量分省目标卡（1个）==========
  {
    id: 69,
    cardName: '销量-分省目标达成',
    templateName: '目标版',
    templateType: '分省分布卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '2:1',
    indicatorGroupName: '目标与方向分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:20:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '销量目标达成率',
    barLegend: '达成率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  // ========== 国际运营 - 收入分省目标卡（1个）==========
  {
    id: 70,
    cardName: '收入-分省目标达成',
    templateName: '目标版',
    templateType: '分省分布卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '2:1',
    indicatorGroupName: '目标与方向分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:15:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '收入目标达成率',
    barLegend: '达成率（%）',
    lineIndicator: '同比变化',
    lineLegend: '同比（pp）'
  },
  // ========== 国际运营 - 销量TOP10方向卡（1个）==========
  {
    id: 71,
    cardName: '销量TOP10方向（万）',
    templateName: 'TOP10版',
    templateType: '排名分析卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '目标与方向分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-产品分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:21:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '销量',
    barLegend: '销量（万）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 收入TOP10方向卡（1个）==========
  {
    id: 72,
    cardName: '收入TOP10方向（亿）',
    templateName: 'TOP10版',
    templateType: '排名分析卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:16:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '收入',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 收入结构趋势卡（1个）==========
  {
    id: 73,
    cardName: '收入结构趋势（亿）',
    templateName: '多线趋势版',
    templateType: '收入结构趋势卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'line',
    chartType: 'line',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:10:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    chartLineIndicator: '标准资费',
    chartLine2Indicator: '国漫包收入'
  },
  // ========== 国际运营 - 产品类型收入卡（1个）==========
  {
    id: 74,
    cardName: '产品类型收入分布（亿）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:05:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '收入',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 标准资费收入卡（1个）==========
  {
    id: 75,
    cardName: '标准资费收入分布（亿）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:06:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '标准资费收入',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 大包多天收入卡（1个）==========
  {
    id: 76,
    cardName: '大包多天收入明细（亿）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:07:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '大包多天收入',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  },
  // ========== 国际运营 - 漫游99收入卡（1个）==========
  {
    id: 77,
    cardName: '漫游99收入明细（亿）',
    templateName: '纵向柱线版',
    templateType: '柱线指标组卡',
    usageScenario: '国际运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '收入分析',
    businessScenario: '公众市场/国际运营',
    isCustomerGroup: false,
    indicatorTopic: '国际运营-收入分析',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:08:00',
    status: true,
    indicatorType: '月指标',
    barIndicator: '漫游99收入',
    barLegend: '收入（亿）',
    lineIndicator: '同比变化',
    lineLegend: '同比（%）'
  }
];

// 筛选项配置 - 模板类型收敛为通用卡片模板
const templateTypeOptions = [
  '请选择',
  // 通用模板类型
  '整体指标卡',
  '迷你指标卡',
  '柱线指标组卡',
  '分省分布卡',
  '排名分析卡',
  '饼图分析卡',
  // 业务专用卡片
  '客户特征分析卡',
  '客群看管卡',
  '补充指标卡',
  '价值提升卡',
  '规模发展卡',
  '融合加固卡',
  '质量分析卡',
  '收入结构趋势卡',
];
const usageScenarioOptions = ['请选择', '离网维系概览页', '中高端客户运营概览页', '新增市场概览页', '国际运营概览页'];
const indicatorTopicOptions = [
  '请选择',
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
const analysisTypeOptions = ['请选择', '年龄分布', 'ARPU分层', '带宽分段', '卡槽状态', '自定义'];
// 客群指标选项（是否客群）
const customerIndicatorOptions = ['请选择', '是', '否'];
// 业务场景选项
const businessScenarioOptions = ['请选择', '公众市场/存量运营/离网维系', '公众市场/存量运营/中高端维系', '公众市场/新增市场'];

export default function IndicatorCardsPage() {
  const router = useRouter();
  
  // 筛选状态
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [filterCustomerIndicator, setFilterCustomerIndicator] = useState('请选择');
  const [filterBusinessScenario, setFilterBusinessScenario] = useState('请选择');
  const [filterIndicatorTopic, setFilterIndicatorTopic] = useState('请选择');
  const [filterIndicatorGroupName, setFilterIndicatorGroupName] = useState('');
  const [filterTemplateType, setFilterTemplateType] = useState('请选择');
  const [filterUsageScenario, setFilterUsageScenario] = useState('请选择');
  const [filterTemplateName, setFilterTemplateName] = useState('');
  const [filterCardName, setFilterCardName] = useState('');
  
  // 预览弹窗状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<IndicatorCard | null>(null);
  
  // 设置弹窗状态
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsCard, setSettingsCard] = useState<IndicatorCard | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = mockData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // 筛选数据
  const filteredData = mockData.filter(item => {
    // 客群指标（是否客群）
    if (filterCustomerIndicator === '是' && !item.isCustomerGroup) return false;
    if (filterCustomerIndicator === '否' && item.isCustomerGroup) return false;
    if (filterBusinessScenario !== '请选择' && item.businessScenario !== filterBusinessScenario) return false;
    if (filterIndicatorTopic !== '请选择' && item.indicatorTopic !== filterIndicatorTopic) return false;
    if (filterIndicatorGroupName && !item.indicatorGroupName.includes(filterIndicatorGroupName)) return false;
    if (filterTemplateType !== '请选择' && item.templateType !== filterTemplateType) return false;
    if (filterUsageScenario !== '请选择' && item.usageScenario !== filterUsageScenario) return false;
    if (filterTemplateName && !item.templateName.includes(filterTemplateName)) return false;
    if (filterCardName && !item.cardName.includes(filterCardName)) return false;
    return true;
  });
  
  // 分页数据
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // 重置筛选
  const handleReset = () => {
    setFilterCustomerIndicator('请选择');
    setFilterBusinessScenario('请选择');
    setFilterIndicatorTopic('请选择');
    setFilterIndicatorGroupName('');
    setFilterTemplateType('请选择');
    setFilterUsageScenario('请选择');
    setFilterTemplateName('');
    setFilterCardName('');
    setCurrentPage(1);
  };
  
  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
  };
  
  // 切换状态
  const handleToggleStatus = (id: number) => {
    console.log('切换状态:', id);
  };
  
  // 设置
  const handleSettings = (id: number) => {
    const card = mockData.find(item => item.id === id);
    if (card) {
      setSettingsCard(card);
      setSettingsOpen(true);
    }
  };
  
  // 预览指标卡
  const handlePreview = (card: IndicatorCard) => {
    setPreviewCard(card);
    setPreviewOpen(true);
  };
  
  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // 获取模板类型标签颜色
  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      // 通用模板类型
      case '整体指标卡':
        return 'bg-blue-100 text-blue-700';
      case '迷你指标卡':
        return 'bg-cyan-100 text-cyan-700';
      case '柱线指标组卡':
        return 'bg-indigo-100 text-indigo-700';
      case '分省分布卡':
        return 'bg-teal-100 text-teal-700';
      case '排名分析卡':
        return 'bg-amber-100 text-amber-700';
      case '饼图分析卡':
        return 'bg-rose-100 text-rose-700';
      // 业务专用卡片
      case '客户特征分析卡':
        return 'bg-green-100 text-green-700';
      case '客群看管卡':
        return 'bg-orange-100 text-orange-700';
      case '补充指标卡':
        return 'bg-purple-100 text-purple-700';
      case '价值提升卡':
        return 'bg-emerald-100 text-emerald-700';
      case '规模发展卡':
        return 'bg-lime-100 text-lime-700';
      case '融合加固卡':
        return 'bg-violet-100 text-violet-700';
      case '质量分析卡':
        return 'bg-pink-100 text-pink-700';
      case '收入结构趋势卡':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">指标卡列表</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setFilterCollapsed(!filterCollapsed)}
          >
            {filterCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                展开
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                收起
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </Button>
          <Button size="sm" onClick={handleSearch}>
            <Search className="w-4 h-4 mr-1" />
            搜索
          </Button>
        </div>
      </div>
      
      {/* 筛选区域 */}
      {!filterCollapsed && (
        <Card className="p-4 mb-4">
          <div className="space-y-3">
            {/* 第一行 */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">客群指标</span>
                <Select value={filterCustomerIndicator} onValueChange={setFilterCustomerIndicator}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerIndicatorOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">业务场景</span>
                <Select value={filterBusinessScenario} onValueChange={setFilterBusinessScenario}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessScenarioOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">指标专题</span>
                <Select value={filterIndicatorTopic} onValueChange={setFilterIndicatorTopic}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicatorTopicOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">指标组名称</span>
                <Input
                  placeholder="请输入"
                  value={filterIndicatorGroupName}
                  onChange={(e) => setFilterIndicatorGroupName(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            
            {/* 第二行 */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">模板类型</span>
                <Select value={filterTemplateType} onValueChange={setFilterTemplateType}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">使用场景</span>
                <Select value={filterUsageScenario} onValueChange={setFilterUsageScenario}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {usageScenarioOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">模板名称</span>
                <Input
                  placeholder="请输入"
                  value={filterTemplateName}
                  onChange={(e) => setFilterTemplateName(e.target.value)}
                  className="w-40"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">指标卡名称</span>
                <Input
                  placeholder="请输入"
                  value={filterCardName}
                  onChange={(e) => setFilterCardName(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* 表格区域 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12">序号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标卡名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标卡模板名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">模板类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">使用场景</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">卡片图标</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-16">尺寸</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标组名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">业务场景</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-16">是否客群</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标专题</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">创建部门</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">创建人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">创建时间</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-20">状态</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-20 sticky right-0 bg-gray-50 z-10">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium">{item.cardName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.templateType === item.templateName 
                      ? item.templateName 
                      : `${item.templateType} - ${item.templateName}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTemplateTypeColor(item.templateType)}`}>
                      {item.templateType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.usageScenario}</td>
                  <td className="px-4 py-3 flex justify-center">
                    {item.chartType !== 'none' ? (
                      <button
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(item)}
                        title="点击预览"
                      >
                        <ChartThumbnail type={item.chartType as 'line' | 'bar' | 'pie' | 'barline' | 'area'} color={item.chartColor} />
                      </button>
                    ) : (
                      <button
                        className="cursor-pointer hover:bg-gray-100 transition-colors px-3 py-1 rounded border border-gray-200"
                        onClick={() => handlePreview(item)}
                        title="点击预览数值卡片"
                      >
                        <span className="text-xs text-gray-500">数值卡片</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.size}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={item.indicatorGroupName}>
                    {item.indicatorGroupName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={item.businessScenario}>
                    {item.businessScenario}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${item.isCustomerGroup ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.isCustomerGroup ? '是' : '否'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.indicatorTopic}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.createDept}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.creator}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.createTime}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={item.status}
                        onCheckedChange={() => handleToggleStatus(item.id)}
                      />
                      <span className="text-xs text-gray-600">{item.status ? '启用' : '禁用'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center sticky right-0 bg-white z-10">
                    <button
                      className="text-blue-500 text-sm hover:text-blue-600 hover:underline whitespace-nowrap"
                      onClick={() => handleSettings(item.id)}
                    >
                      设置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* 分页 */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          共 <span className="font-semibold">{totalItems}</span> 项数据
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={String(pageSize)} onValueChange={(value) => {
            setPageSize(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-3" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'cursor-default'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
            
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
              className="w-16 h-8"
            />
            <span className="text-sm text-gray-600">页</span>
          </div>
        </div>
      </div>
      
      {/* 指标卡预览弹窗 */}
      {previewCard && (
        <CardPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          card={previewCard}
        />
      )}
      
      {/* 指标卡设置弹窗 */}
      {settingsCard && (
        <IndicatorCardSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          card={settingsCard}
          onSave={(settings) => {
            console.log('保存设置:', settings);
            // TODO: 调用API保存设置
          }}
        />
      )}
    </div>
  );
}
