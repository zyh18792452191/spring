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

// 指标卡数据类型
interface IndicatorCard {
  id: number;
  cardName: string;
  cardTitle?: string; // 卡片标题（如"物理属性 - 年龄分布"）
  templateName: string;
  templateType: string;
  usageScenario: string;
  cardIcon: string;
  chartType: 'line' | 'bar' | 'pie' | 'barline' | 'area' | 'none' | 'flow'; // 新增flow类型
  chartColor?: string; // 可选，纯文本卡片无需此字段
  size: string;
  indicatorGroupName: string;
  businessScenario: string;
  isCustomerGroup: boolean;
  indicatorTopic: string;
  subModule?: string; // 子模块（价值提升-正向提值/逆向控损）
  createDept: string;
  creator: string;
  createTime: string;
  status: boolean;
  // 基础配置
  priority?: number; // 优先级
  // 数据配置
  indicatorType?: '日指标' | '月指标'; // 指标类型（固有属性）
  dataPeriod?: string; // 数据周期（可选，纯文本卡片和流向卡无需此字段）
  // 整体指标卡配置
  barIndicator?: string;
  barLegend?: string;
  lineIndicator?: string;
  lineLegend?: string;
  line2Indicator?: string;
  line2Legend?: string;
  yoyUnit?: '%' | 'pp'; // 环比单位
  isRateIndicator?: boolean; // 是否比率类指标
  // 价值提升卡配置
  valueDirection?: '正向' | '逆向'; // 价值方向
  // 规模发展卡配置
  flowType?: '流入' | '流出' | '汇总'; // 流向类型
  flowColor?: string; // 流向颜色
  cumulativeIndicator?: string; // 累计值指标
  cumulativeUnit?: string; // 累计值单位
  momIndicator?: string; // 环比指标
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
  showNetChange?: boolean; // 显示净增
  // 功能配置
  enableAlarm?: boolean;
  enableDispatch?: boolean;
  enableIndicatorTree?: boolean;
  enableDrillDown?: boolean; // 是否支持下钻
  // 业务口径
  businessScope?: string;
}

// 中高端客户运营概览页指标卡数据
const mockData: IndicatorCard[] = [
  // ========== 整体指标（8个）==========
  {
    id: 1,
    cardName: '中高端客户规模',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '月均ARPU≥50元且不限量套餐的客户数'
  },
  {
    id: 2,
    cardName: '中高端客户规模累计净增',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '截至当月中高端客户到达数-去年12月中高端客户到达数'
  },
  {
    id: 3,
    cardName: '拍照中高端综合保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '拍照中高端客户规模保有率×50%+拍照中高端客户价值保有率×50%'
  },
  {
    id: 4,
    cardName: '拍照中高端规模保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '拍照中高端客户在当期末仍在网的客户/拍照中高端客户数×100%'
  },
  {
    id: 5,
    cardName: '拍照中高端价值保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '拍照中高端客户当月月均折后出账收入/上月月均折后出账收入×100%'
  },
  {
    id: 6,
    cardName: '拍照全球通综合保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableDrillDown: true,
    businessScope: '拍照全球通客户规模保有率×50%+拍照全球通客户价值保有率×50%'
  },
  {
    id: 7,
    cardName: '拍照全球通规模保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableIndicatorTree: true,
    enableAlarm: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户在当期末仍在网的客户/拍照全球通客户数×100%'
  },
  {
    id: 8,
    cardName: '拍照全球通价值保有率',
    templateName: '柱线追踪卡-基础版',
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
    enableIndicatorTree: true,
    enableAlarm: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户当月月均折后出账收入/上月月均折后出账收入×100%'
  },
  // ========== 价值提升 - 正向提值（2个）==========
  {
    id: 9,
    cardName: '拍照全球通正向提值客户数',
    templateName: '正向提值卡',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '拍照全球通正向提值客户数',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '正向提值',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通正向提值客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    valueDirection: '正向',
    enableDrillDown: true,
    businessScope: '拍照全球通客户中，当月ARPU较上月提升的客户数量'
  },
  {
    id: 10,
    cardName: '拍照全球通泛升档客户数',
    templateName: '正向提值卡',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '拍照全球通泛升档客户数',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '正向提值',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通泛升档客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    valueDirection: '正向',
    enableDrillDown: true,
    businessScope: '拍照全球通客户中，套餐档次提升的客户数量（含主套升档、叠加态升档、低消升档）'
  },
  // ========== 价值提升 - 逆向控损（2个）==========
  {
    id: 11,
    cardName: '拍照全球通泛消费下降客户数',
    templateName: '逆向控损卡',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF4444',
    size: '1:1',
    indicatorGroupName: '拍照全球通泛消费下降客户数',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '逆向控损',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通泛消费下降客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    valueDirection: '逆向',
    enableDrillDown: true,
    businessScope: '拍照全球通客户中，当月消费较上月下降的客户数量'
  },
  {
    id: 12,
    cardName: '拍照全球通降档客户数',
    templateName: '逆向控损卡',
    templateType: '价值提升卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#FF8C00',
    size: '1:1',
    indicatorGroupName: '拍照全球通降档客户数',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '价值提升',
    subModule: '逆向控损',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 09:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通降档客户数',
    barLegend: '客户数（万）',
    lineIndicator: '环比变化',
    lineLegend: '环比（%）',
    yoyUnit: '%',
    isRateIndicator: false,
    valueDirection: '逆向',
    enableDrillDown: true,
    businessScope: '拍照全球通客户中，套餐档次降低的客户数量'
  },
  // ========== 规模发展 - 流入指标（2个）==========
  {
    id: 13,
    cardName: '新入网中高端',
    templateName: '流入指标卡',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'none',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '新入网中高端',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '当月',
    flowType: '流入',
    flowColor: '#00B050',
    cumulativeIndicator: '新入网中高端累计',
    cumulativeUnit: '万',
    momIndicator: '新入网中高端环比',
    enableDrillDown: true,
    businessScope: '当年新入网且为中高端客户的数量'
  },
  {
    id: 14,
    cardName: '非中高端变为中高端',
    templateName: '流入指标卡',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'none',
    chartColor: '#00B050',
    size: '1:1',
    indicatorGroupName: '非中高端变为中高端',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '当月',
    flowType: '流入',
    flowColor: '#00B050',
    cumulativeIndicator: '非中高端变为中高端累计',
    cumulativeUnit: '万',
    momIndicator: '非中高端变为中高端环比',
    enableDrillDown: true,
    businessScope: '当年从非中高端客户转变为中高端客户的数量'
  },
  // ========== 规模发展 - 流出指标（2个）==========
  {
    id: 15,
    cardName: '存量中高端客户流失',
    templateName: '流出指标卡',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'none',
    chartColor: '#FF4444',
    size: '1:1',
    indicatorGroupName: '存量中高端客户流失',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '当月',
    flowType: '流出',
    flowColor: '#FF4444',
    cumulativeIndicator: '存量中高端客户流失累计',
    cumulativeUnit: '万',
    momIndicator: '存量中高端客户流失环比',
    relatedRateName: '存量中高端客户流失率',
    relatedRateIndicator: '存量中高端客户流失率',
    relatedRateUnit: '%',
    enableDrillDown: true,
    businessScope: '当年存量中高端客户流失的数量累计'
  },
  {
    id: 16,
    cardName: '存量中高端客户降档为非中高端',
    templateName: '流出指标卡',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'flow',
    chartType: 'none',
    chartColor: '#FF8C00',
    size: '1:1',
    indicatorGroupName: '存量中高端客户降档为非中高端',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '当月',
    flowType: '流出',
    flowColor: '#FF8C00',
    cumulativeIndicator: '存量中高端客户降档累计',
    cumulativeUnit: '万',
    momIndicator: '存量中高端客户降档环比',
    relatedRateName: '存量中高端客户降档流出率',
    relatedRateIndicator: '存量中高端客户降档流出率',
    relatedRateUnit: '%',
    enableDrillDown: true,
    businessScope: '当年存量中高端客户降档为非中高端客户的数量累计'
  },
  // ========== 规模发展 - 流向变化汇总卡（1个）==========
  {
    id: 17,
    cardName: '中高端客户流向',
    templateName: '流向变化汇总卡',
    templateType: '规模发展卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'bar',
    chartType: 'bar',
    chartColor: '#0066CC',
    size: '2:1',
    indicatorGroupName: '中高端客户流向变化',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '规模发展',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 08:10:00',
    status: true,
    indicatorType: '月指标',
    flowType: '汇总',
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
    businessScope: '中高端客户流入流出流向变化汇总展示'
  },
  // ========== 融合加固（5个）==========
  {
    id: 18,
    cardName: '拍照全球通有效融合率',
    templateName: '融合率追踪卡',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通有效融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:30:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通有效融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户中至少使用一种融合产品的占比'
  },
  {
    id: 19,
    cardName: '拍照全球通合约率',
    templateName: '融合率追踪卡',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通合约率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:25:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通合约率',
    barLegend: '合约率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户中有合约约束的占比'
  },
  {
    id: 20,
    cardName: '拍照全球通固移融合率',
    templateName: '融合率追踪卡',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通固移融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:20:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通固移融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户中固移融合（宽带+手机）的占比'
  },
  {
    id: 21,
    cardName: '拍照全球通基座融合率',
    templateName: '融合率追踪卡',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通基座融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:15:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通基座融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户中使用基座融合产品（如宽带）的占比'
  },
  {
    id: 22,
    cardName: '拍照全球通成员融合率',
    templateName: '融合率追踪卡',
    templateType: '融合加固卡',
    usageScenario: '中高端客户运营概览页',
    cardIcon: 'barline',
    chartType: 'barline',
    chartColor: '#0066CC',
    size: '1:1',
    indicatorGroupName: '拍照全球通成员融合率',
    businessScenario: '公众市场/存量运营/中高端客户运营',
    isCustomerGroup: false,
    indicatorTopic: '融合加固',
    createDept: '集团根组织',
    creator: '超级管理员',
    createTime: '2025-01-15 07:10:00',
    status: true,
    indicatorType: '月指标',
    dataPeriod: '6个月',
    barIndicator: '拍照全球通成员融合率',
    barLegend: '融合率（%）',
    lineIndicator: '环比变化',
    lineLegend: '环比（pp）',
    yoyUnit: 'pp',
    isRateIndicator: true,
    enableDrillDown: true,
    businessScope: '拍照全球通客户中使用成员融合产品的占比'
  }
];

// 筛选项配置
const templateTypeOptions = [
  '请选择',
  '整体指标卡',
  '价值提升卡',
  '规模发展卡',
  '融合加固卡'
];
const usageScenarioOptions = ['请选择', '离网维系概览页', '中高端客户运营概览页', '新增市场概览页'];
const indicatorTopicOptions = [
  '请选择',
  '整体指标',
  '价值提升',
  '规模发展',
  '融合加固'
];
const subModuleOptions = ['请选择', '正向提值', '逆向控损'];
const flowTypeOptions = ['请选择', '流入', '流出', '汇总'];
const businessScenarioOptions = ['请选择', '公众市场/存量运营/中高端客户运营', '公众市场/存量运营/离网维系', '公众市场/新增市场'];

// 模板类型与指标卡模板的映射
const templateNameMap: Record<string, string[]> = {
  '中高端客户运营 - 整体指标卡': ['柱线追踪卡-基础版', '柱线追踪卡-增强版'],
  '中高端客户运营 - 价值提升卡': ['正向提值卡', '逆向控损卡'],
  '中高端客户运营 - 规模发展卡': ['流入指标卡', '流出指标卡', '流向变化汇总卡'],
  '中高端客户运营 - 融合加固卡': ['融合率追踪卡'],
};

export default function MidHighEndIndicatorCardsPage() {
  const router = useRouter();
  
  // 筛选状态
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [filterIndicatorTopic, setFilterIndicatorTopic] = useState('请选择');
  const [filterSubModule, setFilterSubModule] = useState('请选择');
  const [filterFlowType, setFilterFlowType] = useState('请选择');
  const [filterIndicatorGroupName, setFilterIndicatorGroupName] = useState('');
  const [filterTemplateType, setFilterTemplateType] = useState('请选择');
  const [filterUsageScenario, setFilterUsageScenario] = useState('中高端客户运营概览页');
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
    if (filterIndicatorTopic !== '请选择' && item.indicatorTopic !== filterIndicatorTopic) return false;
    if (filterSubModule !== '请选择' && item.subModule !== filterSubModule) return false;
    if (filterFlowType !== '请选择' && item.flowType !== filterFlowType) return false;
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
    setFilterIndicatorTopic('请选择');
    setFilterSubModule('请选择');
    setFilterFlowType('请选择');
    setFilterIndicatorGroupName('');
    setFilterTemplateType('请选择');
    setFilterUsageScenario('中高端客户运营概览页');
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
      case '整体指标卡':
        return 'bg-blue-100 text-blue-700';
      case '价值提升卡':
        return 'bg-green-100 text-green-700';
      case '规模发展卡':
        return 'bg-orange-100 text-orange-700';
      case '融合加固卡':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // 获取流向类型颜色
  const getFlowTypeColor = (flowType?: string) => {
    switch (flowType) {
      case '流入':
        return 'bg-green-100 text-green-700';
      case '流出':
        return 'bg-red-100 text-red-700';
      case '汇总':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">指标卡列表 - 中高端客户运营概览页</h1>
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
                <span className="text-sm text-gray-600 whitespace-nowrap">子模块</span>
                <Select value={filterSubModule} onValueChange={setFilterSubModule}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {subModuleOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === '请选择' ? '请选择' : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">流向类型</span>
                <Select value={filterFlowType} onValueChange={setFilterFlowType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {flowTypeOptions.map((option) => (
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
                  <SelectTrigger className="w-48">
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
                  <SelectTrigger className="w-44">
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
          <table className="w-full min-w-[1800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12">序号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标卡名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标卡模板名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">模板类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">使用场景</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-24">卡片图标</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标专题</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">子模块</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">流向类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标组名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">指标类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">数据周期</th>
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
                    {item.chartType === 'barline' ? (
                      <button
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(item)}
                        title="点击预览"
                      >
                        <ChartThumbnail type="barline" color={item.chartColor} />
                      </button>
                    ) : item.chartType === 'bar' ? (
                      <button
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(item)}
                        title="点击预览"
                      >
                        <ChartThumbnail type="bar" color={item.chartColor} />
                      </button>
                    ) : item.flowType ? (
                      <button
                        className="cursor-pointer hover:bg-gray-100 transition-colors px-3 py-1 rounded border border-gray-200"
                        onClick={() => handlePreview(item)}
                        title="点击预览流向卡片"
                      >
                        <span className="text-xs text-gray-500">
                          {item.flowType === '流入' ? '流入卡片' : 
                           item.flowType === '流出' ? '流出卡片' : '流向汇总'}
                        </span>
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
                  <td className="px-4 py-3 text-sm text-gray-600">{item.indicatorTopic}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.subModule || '-'}</td>
                  <td className="px-4 py-3">
                    {item.flowType ? (
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded ${getFlowTypeColor(item.flowType)}`}>
                        {item.flowType}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={item.indicatorGroupName}>
                    {item.indicatorGroupName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.indicatorType || '月指标'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.dataPeriod || '-'}</td>
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
          共 <span className="font-semibold">{filteredData.length}</span> 项数据
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
