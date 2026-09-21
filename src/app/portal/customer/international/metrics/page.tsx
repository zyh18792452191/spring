'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Expand, Minimize, Network, GitBranch, AlertCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Settings, Edit2, X, ChevronRight, ChevronDown, BarChart3, Users, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area, RadialBarChart, RadialBar, LabelList } from 'recharts';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';
import WorkOrderPanel from '@/components/WorkOrderPanel';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { textConfig } from '@/config/textConfig';

// 类型定义
interface MetricData {
  id: number;
  name: string;
  indicatorName?: string;
  value: string;
  yoy: string;
  yoyUnit?: string;
  yoyLabel?: string;
  targetRate?: string;
  targetGap?: string;
  status: 'normal' | 'warning' | 'danger';
  color: string;
  chartType: 'line' | 'barline';
  chartData: Array<{ month: string; value?: number; revenue?: number; retainRate?: number; scale?: number; rate?: number; yoy?: number }>;
  businessScope?: string;
  hasEntrances?: boolean;
  hasTreeAnalysis?: boolean;
}

// ==================== 指标树数据 ====================

// 指标树1: 国漫产品订购量
const internationalProductOrderTree: IndicatorCardData = {
  id: 'root-1',
  name: '国漫产品订购量',
  value: '125.6万',
  yoy: 8.5,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '1-1',
      name: '目标达成情况',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-1',
      children: [
        {
          id: '1-1-1',
          name: '目标完成率',
          value: '92.5%',
          yoy: 3.2,
          yoyUnit: 'pp',
          level: 3,
          status: 'normal',
          parentId: '1-1',
          children: []
        }
      ]
    },
    {
      id: '1-2',
      name: '业务情况',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-1',
      children: [
        {
          id: '1-2-1',
          name: '国漫包订购量',
          value: '85.3万',
          yoy: 12.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '1-2',
          children: [
            { id: '1-2-1-1', name: '大包多天', value: '45.2万', yoy: 15.3, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] },
            { id: '1-2-1-2', name: '漫游99流量语音包', value: '18.5万', yoy: 10.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] },
            { id: '1-2-1-3', name: '大湾区港澳包', value: '12.8万', yoy: 22.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] },
            { id: '1-2-1-4', name: '国漫流量月包', value: '5.2万', yoy: 8.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] },
            { id: '1-2-1-5', name: '国漫语音月包', value: '2.1万', yoy: 5.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] },
            { id: '1-2-1-6', name: '国漫流量加油包', value: '1.5万', yoy: 3.8, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [] }
          ]
        },
        {
          id: '1-2-2',
          name: '主套餐含国漫产品激活量',
          value: '28.5万',
          yoy: 12.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '1-2',
          children: [
            { id: '1-2-4-1', name: '5G智享套餐', value: '15.2万', yoy: 15.8, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-4' },
            { id: '1-2-4-2', name: '全球通无限尊享计划', value: '8.5万', yoy: 10.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-4' },
            { id: '1-2-4-3', name: '全球通5GA尊享套餐', value: '4.8万', yoy: 18.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-4' }
          ]
        }
      ]
    }
  ]
};

// 指标树2: 全球通专属国漫礼包激活量
const globalTravelGiftTree: IndicatorCardData = {
  id: 'root-2',
  name: '全球通专属国漫礼包激活量',
  value: '45.8万',
  yoy: 15.2,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '2-1',
      name: '流量月包激活量',
      value: '28.5万',
      yoy: 18.5,
      yoyUnit: '',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-2',
      children: []
    },
    {
      id: '2-2',
      name: '流量语音月包激活量',
      value: '17.3万',
      yoy: 12.8,
      yoyUnit: '',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-2',
      children: []
    }
  ]
};

// 指标树3: 出访客户收入-折后
const outboundRevenueTree: IndicatorCardData = {
  id: 'root-3',
  name: '出访客户收入-折后',
  value: '8.56亿',
  yoy: 5.8,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '3-1',
      name: '目标达成情况',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-3',
      children: [
        {
          id: '3-1-1',
          name: '目标完成率',
          value: '88.5%',
          yoy: 2.5,
          yoyUnit: 'pp',
          level: 3,
          status: 'normal',
          parentId: '3-1',
          children: []
        }
      ]
    },
    {
      id: '3-2',
      name: '业务情况',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-3',
      children: [
        {
          id: '3-2-1',
          name: '标准资费',
          value: '3.25亿',
          yoy: 8.2,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3-2',
          children: [
            { id: '3-2-1-1', name: '数据客户端', value: '1.85亿', yoy: 12.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-1' },
            { id: '3-2-1-2', name: '传统语音客户端', value: '0.65亿', yoy: -5.2, yoyUnit: '', level: 4, status: 'warning', parentId: '3-2-1' },
            { id: '3-2-1-3', name: 'VOLTE语音客户端', value: '0.52亿', yoy: 18.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-1' },
            { id: '3-2-1-4', name: '传统短信客户端', value: '0.23亿', yoy: -8.5, yoyUnit: '', level: 4, status: 'warning', parentId: '3-2-1' }
          ]
        },
        {
          id: '3-2-2',
          name: '国漫包收入',
          value: '5.31亿',
          yoy: 15.2,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3-2',
          children: [
            { id: '3-2-2-1', name: '大包多天', value: '2.85亿', yoy: 18.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-2', children: [] },
            { id: '3-2-2-2', name: '漫游99流量语音包', value: '1.25亿', yoy: 12.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-2', children: [] },
            { id: '3-2-2-3', name: '大湾区港澳包', value: '0.85亿', yoy: 25.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-2', children: [] },
            { id: '3-2-2-4', name: '国漫流量月包', value: '0.28亿', yoy: 8.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-2', children: [] },
            { id: '3-2-2-5', name: '国漫语音月包', value: '0.08亿', yoy: 5.2, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2-2', children: [] }
          ]
        }
      ]
    }
  ]
};

// 指标树4: 出访客户（含0）
const outboundCustomerTree: IndicatorCardData = {
  id: 'root-4',
  name: '出访客户（含0）',
  value: '856.2万',
  yoy: 12.5,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '4-1',
      name: '出访规模',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-4',
      children: [
        { id: '4-1-1', name: '出访客户含0话单占比', value: '68.5%', yoy: 5.2, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-1', children: [] },
        { id: '4-1-2', name: '出访人天（人天）', value: '1,256.8万', yoy: 15.8, yoyUnit: '', level: 3, status: 'normal', parentId: '4-1', children: [] },
        { id: '4-1-3', name: '出访人次（人次）', value: '1,856.5万', yoy: 18.2, yoyUnit: '', level: 3, status: 'normal', parentId: '4-1', children: [] },
        { id: '4-1-4', name: '分方向出访总次数（人次）', value: '2,156.3万', yoy: 12.5, yoyUnit: '', level: 3, status: 'normal', parentId: '4-1', children: [] }
      ]
    },
    {
      id: '4-2',
      name: '出访行为',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-4',
      children: [
        { id: '4-2-1', name: 'DOU（MB/人天）', value: '125.6', yoy: 22.5, yoyUnit: '', level: 3, status: 'normal', parentId: '4-2', children: [] },
        { id: '4-2-2', name: 'MOU（Min/人天）', value: '8.5', yoy: -5.2, yoyUnit: '', level: 3, status: 'warning', parentId: '4-2', children: [] },
        { id: '4-2-3', name: '月出访ARPU（元/人）', value: '156.8', yoy: 8.5, yoyUnit: '', level: 3, status: 'normal', parentId: '4-2', children: [] }
      ]
    },
    {
      id: '4-3',
      name: '网络开通',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-4',
      children: [
        { id: '4-3-1', name: '国漫功能开通率-出访', value: '85.2%', yoy: 3.5, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-3', children: [] },
        { id: '4-3-2', name: '国漫功能开通率-出账', value: '78.5%', yoy: 2.8, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-3', children: [
          { id: '4-3-2-1', name: '目标完成率', value: '92.5%', yoy: 1.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-3-2', children: [] }
        ] }
      ]
    },
    {
      id: '4-4',
      name: '使用订购',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-4',
      children: [
        { id: '4-4-1', name: '客户订购渗透率', value: '35.8%', yoy: 5.2, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-4', children: [
          { id: '4-4-1-1', name: '自有渠道订购渗透率', value: '28.5%', yoy: 6.8, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-4-1' }
        ] },
        { id: '4-4-2', name: '国漫产品订购客户数占比', value: '42.5%', yoy: 8.5, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-4', children: [] },
        { id: '4-4-3', name: '国漫产品使用客户数占比', value: '38.2%', yoy: 6.5, yoyUnit: 'pp', level: 3, status: 'normal', parentId: '4-4', children: [] }
      ]
    }
  ]
};

// 指标树5: 来访客户
const inboundCustomerTree: IndicatorCardData = {
  id: 'root-5',
  name: '来访客户',
  value: '456.8万',
  yoy: 8.5,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '5-1',
      name: '来访规模',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-5',
      children: [
        { id: '5-1-1', name: '来访客户数', value: '456.8万', yoy: 8.5, yoyUnit: '', level: 3, status: 'normal', parentId: '5-1', children: [] }
      ]
    },
    {
      id: '5-2',
      name: '来访行为',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-5',
      children: [
        { id: '5-2-1', name: '来访DOU（MB/人天）', value: '256.8', yoy: 18.5, yoyUnit: '', level: 3, status: 'normal', parentId: '5-2', children: [] },
        { id: '5-2-2', name: '来访MOU（Min/人）', value: '125.6', yoy: 5.2, yoyUnit: '', level: 3, status: 'normal', parentId: '5-2', children: [] }
      ]
    }
  ]
};

// 指标树6: 来访客户收入
const inboundRevenueTree: IndicatorCardData = {
  id: 'root-6',
  name: '来访客户收入',
  value: '5.68亿',
  yoy: 15.2,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '6-1',
      name: '业务情况',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root-6',
      children: [
        { id: '6-1-1', name: '来访总收入', value: '5.68亿', yoy: 15.2, yoyUnit: '', level: 3, status: 'normal', parentId: '6-1', children: [] },
        { id: '6-1-2', name: '数据收入(元)', value: '3.25亿', yoy: 22.5, yoyUnit: '', level: 3, status: 'normal', parentId: '6-1', children: [] },
        { id: '6-1-3', name: '语音收入（元）', value: '1.85亿', yoy: 5.8, yoyUnit: '', level: 3, status: 'normal', parentId: '6-1', children: [] },
        { id: '6-1-4', name: '短信收入(元）', value: '0.58亿', yoy: 8.2, yoyUnit: '', level: 3, status: 'normal', parentId: '6-1', children: [] }
      ]
    }
  ]
};

// ==================== 概览页数据 ====================

// 整体指标数据 - 按出访、销量、收入、开通率顺序
const overallMetrics: MetricData[] = [
  {
    id: 1,
    name: '出访客户（含0）',
    indicatorName: '出访客户（含0）',
    value: '856.2万',
    yoy: '+12.5',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '95.2',
    targetGap: '+2.8',
    status: 'normal',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '出访客户总数（含0话单客户）',
    hasEntrances: true,
    hasTreeAnalysis: true,
    chartData: [
      { month: '2月', value: 758.5, yoy: 10.2 },
      { month: '3月', value: 725.2, yoy: -5.5 },
      { month: '4月', value: 802.5, yoy: 2.2 },
      { month: '5月', value: 785.8, yoy: -3.2 },
      { month: '6月', value: 842.5, yoy: 2.0 },
      { month: '7月', value: 826.2, yoy: -1.8 }
    ]
  },
  {
    id: 2,
    name: '销量',
    indicatorName: '国漫产品订购量',
    value: '125.6万',
    yoy: '+8.5',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '92.5',
    targetGap: '-3.5',
    status: 'warning',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '国际漫游产品的总订购数量',
    hasEntrances: true,
    hasTreeAnalysis: true,
    chartData: [
      { month: '2月', value: 112.5, yoy: 6.2 },
      { month: '3月', value: 105.8, yoy: -4.5 },
      { month: '4月', value: 118.2, yoy: 2.1 },
      { month: '5月', value: 111.5, yoy: -2.8 },
      { month: '6月', value: 123.8, yoy: 1.9 },
      { month: '7月', value: 118.6, yoy: -1.2 }
    ]
  },
  {
    id: 3,
    name: '收入',
    indicatorName: '出访客户收入-折后',
    value: '8.56亿',
    yoy: '+5.8',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '88.5',
    targetGap: '-5.2',
    status: 'warning',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '出访客户产生的收入（折后）',
    hasEntrances: true,
    hasTreeAnalysis: true,
    chartData: [
      { month: '2月', value: 7.85, yoy: 3.5 },
      { month: '3月', value: 8.12, yoy: 3.4 },
      { month: '4月', value: 8.25, yoy: 1.6 },
      { month: '5月', value: 8.38, yoy: 1.6 },
      { month: '6月', value: 8.45, yoy: 0.8 },
      { month: '7月', value: 8.26, yoy: -2.1 }
    ]
  },
  {
    id: 4,
    name: '客户订购渗透率',
    indicatorName: '客户订购渗透率',
    value: '35.8%',
    yoy: '+5.2',
    yoyUnit: 'pp',
    yoyLabel: '同比',
    status: 'normal',
    color: '#0066CC',
    chartType: 'line',
    businessScope: '客户订购渗透率（订购客户/出访客户）',
    hasEntrances: true,
    hasTreeAnalysis: false,
    chartData: [
      { month: '2月', value: 30.5, yoy: 4.2 },
      { month: '3月', value: 28.8, yoy: -2.5 },
      { month: '4月', value: 33.2, yoy: 5.0 },
      { month: '5月', value: 31.5, yoy: -1.8 },
      { month: '6月', value: 35.2, yoy: 5.0 },
      { month: '7月', value: 33.8, yoy: -1.2 }
    ]
  }
];

// 国漫产品订购量分析 - 产品类型分布数据
const productTypeData = [
  { name: '大包多天', value: 45.2, yoy: 15.3 },
  { name: '漫游99流量语音包', value: 18.5, yoy: 10.2 },
  { name: '大湾区港澳包', value: 12.8, yoy: 22.5 },
  { name: '国漫流量月包', value: 5.2, yoy: 8.5 },
  { name: '国漫语音月包', value: 2.1, yoy: 5.2 },
  { name: '国漫流量加油包', value: 1.5, yoy: 3.8 }
];

// 国漫产品订购量分析 - 渠道分布数据（仅自有渠道和合作渠道）
const channelDistributionData = [
  { name: '自有渠道', value: 32.5, yoy: 15.8 },
  { name: '合作渠道', value: 7.8, yoy: 18.5 }
];

// 国漫产品订购量分析 - 自有渠道明细
const selfChannelDetailData = [
  { name: '微信公众号', value: 8.5, yoy: 25.3 },
  { name: '短信', value: 5.2, yoy: 12.3 },
  { name: '集团统一接口平台', value: 4.5, yoy: 15.6 },
  { name: '国漫热线', value: 3.8, yoy: 18.5 },
  { name: '无忧行', value: 3.2, yoy: 22.5 },
  { name: '省订购平台', value: 2.8, yoy: 12.8 },
  { name: '积分商城', value: 2.1, yoy: 10.2 },
  { name: '国漫网站', value: 1.8, yoy: 8.5 },
  { name: '无忧行-H5', value: 0.6, yoy: 18.3 },
  { name: '中移国际', value: 0.5, yoy: 15.2 }
];

// 国漫产品订购量分析 - 合作渠道明细
const partnerChannelDetailData = [
  { name: '微信钱包', value: 2.5, yoy: 28.6 },
  { name: '京东国际', value: 1.8, yoy: 15.3 },
  { name: '飞猪-境外超市', value: 1.2, yoy: 22.5 },
  { name: '去哪儿', value: 1.0, yoy: 12.8 },
  { name: 'CTRIP', value: 0.8, yoy: 10.5 },
  { name: '其他渠道', value: 0.5, yoy: 8.2 }
];

// 出访客户收入分析 - 收入结构数据
const revenueStructureData = [
  { name: '国漫包收入', value: 5.31, yoy: 15.2 },
  { name: '标准资费', value: 3.25, yoy: 8.2 }
];

// 出访客户收入分析 - 标准资费明细
const standardRevenueDetailData = [
  { name: '数据客户端', value: 1.85, yoy: 12.5 },
  { name: '传统语音客户端', value: 0.65, yoy: -5.2 },
  { name: 'VOLTE语音客户端', value: 0.52, yoy: 18.5 },
  { name: '传统短信客户端', value: 0.23, yoy: -8.5 }
];

// 出访客户分析 - 出访规模趋势数据
const outboundScaleTrendData = [
  { month: '2月', customers: 758.5, personDays: 1085.2, trips: 1562.8, directionTrips: 1820.5, zeroBillRate: 65.2, personDaysYoy: 12.5, tripsYoy: 15.2, directionTripsYoy: 10.5, zeroBillRateYoy: 2.5 },
  { month: '3月', customers: 785.2, personDays: 1128.5, trips: 1652.3, directionTrips: 1895.8, zeroBillRate: 66.5, personDaysYoy: 13.8, tripsYoy: 16.5, directionTripsYoy: 11.2, zeroBillRateYoy: 3.0 },
  { month: '4月', customers: 802.5, personDays: 1165.8, trips: 1725.6, directionTrips: 1980.2, zeroBillRate: 67.2, personDaysYoy: 14.2, tripsYoy: 17.2, directionTripsYoy: 11.8, zeroBillRateYoy: 3.5 },
  { month: '5月', customers: 825.8, personDays: 1202.5, trips: 1789.2, directionTrips: 2052.5, zeroBillRate: 67.8, personDaysYoy: 14.8, tripsYoy: 17.8, directionTripsYoy: 12.0, zeroBillRateYoy: 4.0 },
  { month: '6月', customers: 842.5, personDays: 1235.8, trips: 1825.8, directionTrips: 2110.8, zeroBillRate: 68.2, personDaysYoy: 15.2, tripsYoy: 18.0, directionTripsYoy: 12.2, zeroBillRateYoy: 4.5 },
  { month: '7月', customers: 856.2, personDays: 1256.8, trips: 1856.5, directionTrips: 2156.3, zeroBillRate: 68.5, personDaysYoy: 15.8, tripsYoy: 18.2, directionTripsYoy: 12.5, zeroBillRateYoy: 5.2 }
];

// 出访客户分析 - 出访行为趋势数据
const outboundBehaviorTrendData = [
  { month: '2月', dou: 98.5, mou: 9.2, arpu: 142.5 },
  { month: '3月', dou: 105.2, mou: 9.0, arpu: 148.2 },
  { month: '4月', dou: 112.8, mou: 8.8, arpu: 152.5 },
  { month: '5月', dou: 118.5, mou: 8.6, arpu: 155.8 },
  { month: '6月', dou: 122.5, mou: 8.5, arpu: 156.2 },
  { month: '7月', dou: 125.6, mou: 8.5, arpu: 156.8 }
];

// 使用订购 - 渗透率数据
const penetrationData = [
  { name: '自有渠道', value: 28.5, yoy: 6.8 },
  { name: '合作渠道', value: 7.3, yoy: 2.5 }
];

// 使用订购 - 趋势数据
const usageOrderTrendData = [
  { month: '2月', selfChannel: 25.2, partnerChannel: 5.8, orderCustomerRate: 38.5, useCustomerRate: 34.2, selfChannelYoy: 5.2, partnerChannelYoy: 2.0, orderCustomerRateYoy: 6.5, useCustomerRateYoy: 5.5 },
  { month: '3月', selfChannel: 26.5, partnerChannel: 6.2, orderCustomerRate: 39.8, useCustomerRate: 35.5, selfChannelYoy: 5.8, partnerChannelYoy: 2.2, orderCustomerRateYoy: 7.0, useCustomerRateYoy: 6.0 },
  { month: '4月', selfChannel: 27.2, partnerChannel: 6.8, orderCustomerRate: 40.5, useCustomerRate: 36.2, selfChannelYoy: 6.2, partnerChannelYoy: 2.5, orderCustomerRateYoy: 7.5, useCustomerRateYoy: 6.2 },
  { month: '5月', selfChannel: 27.8, partnerChannel: 7.0, orderCustomerRate: 41.2, useCustomerRate: 37.0, selfChannelYoy: 6.5, partnerChannelYoy: 2.3, orderCustomerRateYoy: 7.8, useCustomerRateYoy: 6.5 },
  { month: '6月', selfChannel: 28.2, partnerChannel: 7.2, orderCustomerRate: 42.0, useCustomerRate: 37.8, selfChannelYoy: 6.8, partnerChannelYoy: 2.4, orderCustomerRateYoy: 8.2, useCustomerRateYoy: 6.8 },
  { month: '7月', selfChannel: 28.5, partnerChannel: 7.3, orderCustomerRate: 42.5, useCustomerRate: 38.2, selfChannelYoy: 6.8, partnerChannelYoy: 2.5, orderCustomerRateYoy: 8.5, useCustomerRateYoy: 6.5 }
];

// ==================== 新增数据：分区情况 ====================

// 客户订购渗透率分区数据 - 全疆16地市（柱线图：柱=渗透率，线=同比）按渗透率降序排列
const penetrationRegionData = [
  { region: '乌鲁木齐', penetrationRate: 38.5, yoy: 5.2 },
  { region: '克拉玛依', penetrationRate: 36.2, yoy: 4.5 },
  { region: '石河子', penetrationRate: 34.8, yoy: 3.8 },
  { region: '昌吉', penetrationRate: 33.5, yoy: 3.2 },
  { region: '伊犁', penetrationRate: 31.2, yoy: 2.5 },
  { region: '奎屯', penetrationRate: 30.8, yoy: 1.8 },
  { region: '哈密', penetrationRate: 29.5, yoy: 1.2 },
  { region: '吐鲁番', penetrationRate: 28.2, yoy: 0.5 },
  { region: '塔城', penetrationRate: 27.5, yoy: -0.2 },
  { region: '博州', penetrationRate: 26.8, yoy: -0.8 },
  { region: '巴州', penetrationRate: 25.2, yoy: -1.5 },
  { region: '阿克苏', penetrationRate: 24.5, yoy: -2.2 },
  { region: '阿勒泰', penetrationRate: 23.8, yoy: -3.5 },
  { region: '喀什', penetrationRate: 22.5, yoy: -5.0 },
  { region: '克州', penetrationRate: 21.2, yoy: -6.5 },
  { region: '和田', penetrationRate: 20.5, yoy: -8.0 },
];

// 乌鲁木齐下各区县渗透率数据
const penetrationUrumqiData = [
  { region: '天山区', penetrationRate: 42.5, yoy: 6.2 },
  { region: '沙依巴克区', penetrationRate: 40.2, yoy: 5.5 },
  { region: '新市区', penetrationRate: 39.8, yoy: 4.8 },
  { region: '水磨沟区', penetrationRate: 37.5, yoy: 3.5 },
  { region: '头屯河区', penetrationRate: 35.2, yoy: 2.8 },
  { region: '达坂城区', penetrationRate: 28.5, yoy: -1.2 },
  { region: '米东区', penetrationRate: 32.8, yoy: 1.5 },
  { region: '乌鲁木齐县', penetrationRate: 25.2, yoy: -3.5 },
];

// 销量分区目标达成数据 - 全疆16地市（柱线图：柱=达成率，线=同比pp）按达成率降序排列
const salesRegionTargetData = [
  { region: '乌鲁木齐', rate: 95.2, yoy: 4.5, achieved: true },
  { region: '克拉玛依', rate: 93.8, yoy: 3.8, achieved: true },
  { region: '石河子', rate: 91.5, yoy: 3.2, achieved: true },
  { region: '昌吉', rate: 89.2, yoy: 2.5, achieved: false },
  { region: '伊犁', rate: 87.5, yoy: 1.2, achieved: false },
  { region: '奎屯', rate: 85.8, yoy: -0.5, achieved: false },
  { region: '哈密', rate: 84.2, yoy: -1.8, achieved: false },
  { region: '吐鲁番', rate: 82.5, yoy: -3.2, achieved: false },
  { region: '塔城', rate: 80.8, yoy: -4.5, achieved: false },
  { region: '博州', rate: 79.2, yoy: -5.8, achieved: false },
  { region: '巴州', rate: 77.5, yoy: -7.2, achieved: false },
  { region: '阿克苏', rate: 75.8, yoy: -8.5, achieved: false },
  { region: '阿勒泰', rate: 74.2, yoy: -9.8, achieved: false },
  { region: '喀什', rate: 72.5, yoy: -11.2, achieved: false },
  { region: '克州', rate: 70.8, yoy: -12.5, achieved: false },
  { region: '和田', rate: 69.2, yoy: -13.8, achieved: false },
];

// 乌鲁木齐下各区县销量目标达成数据
const salesUrumqiTargetData = [
  { region: '天山区', rate: 98.2, yoy: 5.5, achieved: true },
  { region: '沙依巴克区', rate: 96.5, yoy: 4.8, achieved: true },
  { region: '新市区', rate: 94.8, yoy: 3.5, achieved: true },
  { region: '水磨沟区', rate: 92.5, yoy: 2.8, achieved: true },
  { region: '头屯河区', rate: 88.5, yoy: -0.5, achieved: false },
  { region: '米东区', rate: 85.2, yoy: -2.8, achieved: false },
  { region: '达坂城区', rate: 78.5, yoy: -5.5, achieved: false },
  { region: '乌鲁木齐县', rate: 75.2, yoy: -8.2, achieved: false },
];

// 收入分区目标达成数据 - 全疆16地市（柱线图：柱=达成率，线=同比pp）按达成率降序排列
const revenueRegionTargetData = [
  { region: '乌鲁木齐', rate: 92.5, yoy: 3.8, achieved: true },
  { region: '克拉玛依', rate: 90.2, yoy: 3.2, achieved: true },
  { region: '石河子', rate: 88.5, yoy: 2.5, achieved: false },
  { region: '昌吉', rate: 86.2, yoy: 1.8, achieved: false },
  { region: '伊犁', rate: 84.5, yoy: 0.5, achieved: false },
  { region: '奎屯', rate: 82.8, yoy: -0.8, achieved: false },
  { region: '哈密', rate: 81.2, yoy: -2.2, achieved: false },
  { region: '吐鲁番', rate: 79.5, yoy: -3.5, achieved: false },
  { region: '塔城', rate: 77.8, yoy: -4.8, achieved: false },
  { region: '博州', rate: 76.2, yoy: -5.5, achieved: false },
  { region: '巴州', rate: 74.5, yoy: -6.8, achieved: false },
  { region: '阿克苏', rate: 72.8, yoy: -8.2, achieved: false },
  { region: '阿勒泰', rate: 71.2, yoy: -9.5, achieved: false },
  { region: '喀什', rate: 69.5, yoy: -10.8, achieved: false },
  { region: '克州', rate: 68.2, yoy: -12.2, achieved: false },
  { region: '和田', rate: 66.5, yoy: -13.5, achieved: false },
];

// 乌鲁木齐下各区县收入目标达成数据
const revenueUrumqiTargetData = [
  { region: '天山区', rate: 95.8, yoy: 4.5, achieved: true },
  { region: '沙依巴克区', rate: 93.2, yoy: 3.8, achieved: true },
  { region: '新市区', rate: 91.5, yoy: 2.5, achieved: true },
  { region: '水磨沟区', rate: 89.2, yoy: 1.2, achieved: false },
  { region: '头屯河区', rate: 85.5, yoy: -1.5, achieved: false },
  { region: '米东区', rate: 82.8, yoy: -3.2, achieved: false },
  { region: '达坂城区', rate: 76.5, yoy: -6.5, achieved: false },
  { region: '乌鲁木齐县', rate: 73.2, yoy: -8.8, achieved: false },
];

// 销量TOP10方向
const salesTop10Directions = [
  { direction: '香港', value: 28.5, yoy: 15.2 },
  { direction: '澳门', value: 22.8, yoy: 12.5 },
  { direction: '日本', value: 18.5, yoy: 22.8 },
  { direction: '韩国', value: 15.2, yoy: 18.5 },
  { direction: '泰国', value: 12.8, yoy: 25.5 },
  { direction: '新加坡', value: 10.5, yoy: 16.2 },
  { direction: '马来西亚', value: 8.2, yoy: 14.8 },
  { direction: '美国', value: 6.5, yoy: 8.5 },
  { direction: '越南', value: 5.8, yoy: 32.5 },
  { direction: '台湾', value: 4.2, yoy: 10.2 },
];

// 收入TOP10方向
const revenueTop10Directions = [
  { direction: '香港', value: 1.85, yoy: 12.5 },
  { direction: '日本', value: 1.52, yoy: 18.8 },
  { direction: '澳门', value: 1.28, yoy: 10.2 },
  { direction: '韩国', value: 0.98, yoy: 15.5 },
  { direction: '泰国', value: 0.85, yoy: 22.5 },
  { direction: '美国', value: 0.72, yoy: 6.8 },
  { direction: '新加坡', value: 0.58, yoy: 14.2 },
  { direction: '马来西亚', value: 0.45, yoy: 12.5 },
  { direction: '越南', value: 0.38, yoy: 28.5 },
  { direction: '台湾', value: 0.32, yoy: 8.2 },
];

// 大包多天产品明细
const bigPackageDetailData = [
  { product: '3天包', value: 15.2, yoy: 18.5 },
  { product: '5天包', value: 12.8, yoy: 15.2 },
  { product: '7天包', value: 10.5, yoy: 22.5 },
  { product: '10天包', value: 6.7, yoy: 12.8 },
];

// 漫游99产品明细
const roaming99DetailData = [
  { product: '漫游99流量包', value: 8.5, yoy: 15.2 },
  { product: '漫游99语音包', value: 5.2, yoy: 8.5 },
  { product: '漫游99流量语音包', value: 4.8, yoy: 12.5 },
];

// 产品类型收入分布（5类国漫包产品，不含标准资费）
const productTypeRevenueData = [
  { type: '大包多天', value: 2.85, yoy: 18.5 },
  { type: '漫游99系列', value: 1.25, yoy: 12.5 },
  { type: '大湾区港澳包', value: 0.85, yoy: 25.5 },
  { type: '国漫流量月包', value: 0.28, yoy: 8.5 },
  { type: '国漫语音月包', value: 0.08, yoy: 5.2 },
];

// 收入结构趋势（按月）- 近6个月（用于折线图）
const revenueStructureTrendData = [
  { month: '7月', standard: 3.25, package: 5.31 },
  { month: '8月', standard: 3.35, package: 5.42 },
  { month: '9月', standard: 3.42, package: 5.55 },
  { month: '10月', standard: 3.48, package: 5.68 },
  { month: '11月', standard: 3.52, package: 5.78 },
  { month: '12月', standard: 3.58, package: 5.88 },
];

// 出访行为趋势 - DOU按月（柱线图：柱=数值，线=同比）
const douTrendData = [
  { month: '2月', value: 98.5, yoy: 18.5 },
  { month: '3月', value: 95.2, yoy: -3.2 },
  { month: '4月', value: 112.8, yoy: 20.5 },
  { month: '5月', value: 108.5, yoy: -5.8 },
  { month: '6月', value: 122.5, yoy: 22.0 },
  { month: '7月', value: 118.6, yoy: -2.5 },
];

// 出访行为趋势 - MOU按月（柱线图：柱=数值，线=同比）
const mouTrendData = [
  { month: '2月', value: 9.2, yoy: -3.5 },
  { month: '3月', value: 9.0, yoy: -4.2 },
  { month: '4月', value: 8.8, yoy: -4.8 },
  { month: '5月', value: 8.6, yoy: -5.0 },
  { month: '6月', value: 8.5, yoy: -5.1 },
  { month: '7月', value: 8.5, yoy: -5.2 },
];

// 出访行为趋势 - ARPU按月（柱线图：柱=数值，线=同比）
const arpuTrendData = [
  { month: '2月', value: 142.5, yoy: 5.8 },
  { month: '3月', value: 138.2, yoy: -2.5 },
  { month: '4月', value: 152.5, yoy: 7.2 },
  { month: '5月', value: 148.8, yoy: -3.8 },
  { month: '6月', value: 156.2, yoy: 8.2 },
  { month: '7月', value: 151.8, yoy: -1.5 },
];

// 饼图颜色
const PIE_COLORS = ['#0066CC', '#0085D0', '#00A3E0', '#00C4E0', '#40D5E0', '#80E5E0', '#B0F0F0'];
const PIE_COLORS_WARM = ['#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2'];

// 自定义Tooltip组件
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPieChart = payload.length === 1 && payload[0].payload && payload[0].payload.name;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        {label && !isPieChart && <p className="text-xs text-gray-600 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => {
          const keyMap: Record<string, { name: string; unit: string }> = {
            'value': { name: '当月值', unit: '' },
            'rate': { name: '达成率', unit: '%' },
            'yoy': { name: '同比', unit: 'pp' },
            'gap': { name: '差距', unit: 'pp' },
            'customers': { name: '出访客户数', unit: '万' },
            'personDays': { name: '出访人天', unit: '万' },
            'trips': { name: '出访人次', unit: '万' },
            'dou': { name: 'DOU', unit: 'MB/人天' },
            'mou': { name: 'MOU', unit: 'Min/人天' },
            'arpu': { name: 'ARPU', unit: '元/人' },
            'standard': { name: '标准资费收入', unit: '亿' },
            'package': { name: '国漫包收入', unit: '亿' },
            'standardRate': { name: '标准资费收入占比', unit: '%' },
            'packageRate': { name: '国漫包收入占比', unit: '%' },
            'selfChannel': { name: '自有渠道渗透率', unit: '%' },
            'partnerChannel': { name: '合作渠道渗透率', unit: '%' },
            'orderCustomerRate': { name: '订购客户数占比', unit: '%' },
            'useCustomerRate': { name: '使用客户数占比', unit: '%' },
            'penetrationRate': { name: '渗透率', unit: '%' },
          };
          
          const keyInfo = keyMap[entry.dataKey] || { name: entry.dataKey, unit: '' };
          
          if (isPieChart && entry.payload && entry.payload.name) {
            const yoyText = entry.payload.yoy !== undefined ? ` (同比${entry.payload.yoy > 0 ? '+' : ''}${entry.payload.yoy}%)` : '';
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold text-gray-900">
                  {entry.payload.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{entry.payload.unit || '万'}{yoyText}
                </span>
              </div>
            );
          }
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{keyInfo.name}:</span>
              <span className="font-semibold text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                {keyInfo.unit}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// 环形进度图组件
const CircularProgressChart = ({ value, yoy, yoyUnit, size = 120, strokeWidth = 10 }: {
  value: number;
  yoy: number;
  yoyUnit?: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#0066CC"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
        <span className={`text-xs font-medium ${yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {yoy >= 0 ? '+' : ''}{yoy}{yoyUnit || 'pp'} 同比
        </span>
      </div>
    </div>
  );
};

// 指标卡片组件（带迷你趋势）
const MetricCardWithTrend = ({ title, value, yoy, yoyUnit, unit, trendData, dataKey, yoyKey, color = '#0066CC' }: {
  title: string;
  value: string;
  yoy: number;
  yoyUnit?: string;
  unit?: string;
  trendData?: any[];
  dataKey?: string;
  yoyKey?: string;
  color?: string;
}) => {
  // 获取每个数据点的 yoy 值
  const getYoyValue = (entry: any) => {
    if (yoyKey && entry[yoyKey] !== undefined) {
      return entry[yoyKey];
    }
    return entry.yoy ?? 0;
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{value}</span>
              {unit && <span className="text-sm text-gray-500">{unit}</span>}
            </div>
            <span className={`text-xs font-medium ${yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoy >= 0 ? '+' : ''}{yoy}{yoyUnit || '%'} 同比
            </span>
          </div>
        </div>
        {trendData && dataKey && (
          <div className="w-full h-20">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={25} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={25} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const yoyVal = getYoyValue(data);
                      return (
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                          <div>{data.month}: {data[dataKey]?.toFixed(1)}{title.includes('占比') ? '%' : unit || '万'}</div>
                          <div>同比: {yoyVal >= 0 ? '+' : ''}{yoyVal}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar yAxisId="left" dataKey={dataKey} barSize={12} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getYoyValue(entry) >= 0 ? '#00B050' : '#E74C3C'} />
                      ))}
                      <LabelList dataKey={dataKey} position="top" style={{ fontSize: 10, fill: '#666' }} />
                    </Bar>
                <Line yAxisId="right" type="monotone" dataKey={yoyKey || 'yoy'} stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};

// 进度条组件
const ProgressBar = ({ label, value, yoy, yoyUnit, color = '#0066CC' }: {
  label: string;
  value: number;
  yoy: number;
  yoyUnit?: string;
  color?: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 w-40 shrink-0">{label}</span>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex items-center gap-2 w-24 justify-end">
        <span className="text-sm font-semibold text-gray-900">{value}%</span>
        <span className={`text-xs ${yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {yoy >= 0 ? '+' : ''}{yoy}{yoyUnit || 'pp'}
        </span>
      </div>
    </div>
  );
};

// 当月/累计切换组件
const PeriodSwitcher = ({ value, onChange }: { value: 'monthly' | 'yearly'; onChange: (v: 'monthly' | 'yearly') => void }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => onChange('monthly')}
      className={`px-3 py-1 text-xs rounded-md transition-colors ${value === 'monthly' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      当月
    </button>
    <button
      onClick={() => onChange('yearly')}
      className={`px-3 py-1 text-xs rounded-md transition-colors ${value === 'yearly' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      累计
    </button>
  </div>
);

// ==================== 概览Tab组件 ====================
function OverviewTab({ isEditMode, onJumpToTree, selectedRegion }: { isEditMode?: boolean; onJumpToTree?: (indicatorName: string) => void; selectedRegion?: { cityCode?: string; cityName?: string; districtCode?: string; gridCode?: string; gridName?: string; isProvince?: boolean } }) {
  const [metrics, setMetrics] = useState(overallMetrics);
  
  // 当月/累计切换状态
  const [overallPeriod, setOverallPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [outboundScalePeriod, setOutboundScalePeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [usageOrderPeriod, setUsageOrderPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [behaviorPeriod, setBehaviorPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [penetrationProvincePeriod, setPenetrationProvincePeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [channelPeriod, setChannelPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [productTypePeriod, setProductTypePeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [salesTop10Period, setSalesTop10Period] = useState<'monthly' | 'yearly'>('monthly');
  const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'yearly'>('monthly');

  // 根据区域选择器筛选图表数据
  const getFilteredRegionData = <T extends { region: string }>(data: T[]): T[] => {
    if (!selectedRegion?.cityCode || selectedRegion.cityCode === '650000') {
      return data; // 全疆：展示所有区域
    }
    // 选择地市：展示该地市下的子区域（模拟数据：取前几个并用地市名+序号）
    const cityName = selectedRegion.cityName || '乌鲁木齐';
    return data.slice(0, 6).map((item, i) => ({
      ...item,
      region: `${cityName}区${i + 1}`
    }));
  };

  const filteredPenetrationRegionData = useMemo(() => getFilteredRegionData(penetrationRegionData), [selectedRegion, penetrationRegionData]);
  const filteredSalesRegionTargetData = useMemo(() => getFilteredRegionData(salesRegionTargetData), [selectedRegion, salesRegionTargetData]);
  const filteredRevenueRegionTargetData = useMemo(() => getFilteredRegionData(revenueRegionTargetData), [selectedRegion, revenueRegionTargetData]);

  return (
    <div className="space-y-6">
      {/* 整体指标 - 1行4列 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          整体指标
          <PeriodSwitcher value={overallPeriod} onChange={setOverallPeriod} />
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id} className="p-4 hover:shadow-lg transition-shadow relative">
              {metric.hasEntrances && (
                <AlertTriangle className="absolute top-2 right-2 h-4 w-4 text-orange-500 cursor-pointer" />
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <h4 className="text-sm text-gray-600">{metric.name}</h4>
                    <div className="relative group cursor-pointer">
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                      <div className="absolute left-0 top-6 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-normal">
                          {metric.businessScope}
                        </div>
                      </div>
                    </div>
                    {(metric.hasEntrances || metric.hasTreeAnalysis) && (
                      <>
                        {metric.hasEntrances && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                              onClick={() => {
                                const url = `/workspace/strategy/dispatch?indicatorName=${encodeURIComponent(metric.indicatorName || '')}&from=international`;
                                window.location.href = url;
                              }}
                            >
                              去调度
                            </button>
                          </>
                        )}
                        {metric.hasTreeAnalysis && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                              onClick={() => onJumpToTree?.(metric.indicatorName || '')}
                            >
                              指标树分析
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    {metric.yoy !== '-' && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">{metric.yoyLabel || '同比'}</span>
                        <span className="text-xs font-medium text-green-600">
                          {metric.yoy}{metric.yoyUnit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 目标完成率和落后/领先pp */}
                  {metric.targetRate && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">目标完成率: <span className="font-semibold text-gray-700">{metric.targetRate}%</span></span>
                      <span className={`font-medium ${metric.targetGap && parseFloat(metric.targetGap) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.targetGap && (parseFloat(metric.targetGap) >= 0 ? '领先' : '落后')} {metric.targetGap}pp
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={metric.chartData}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="value" radius={[3, 3, 0, 0]}>
                        {metric.chartData?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ==================== 出访客户分析 ==================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          出访客户分析
        </h3>
        
        {/* 出访规模与使用订购 - 各占50%，各有外层Card框 */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 出访规模 - 左侧 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">出访规模</h4>
                <PeriodSwitcher value={outboundScalePeriod} onChange={setOutboundScalePeriod} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCardWithTrend 
                  title="出访人天"
                  value="1,256.8"
                  yoy={15.8}
                  unit="万"
                  trendData={outboundScaleTrendData}
                  dataKey="personDays"
                  yoyKey="personDaysYoy"
                  color="#0085D0"
                />
                <MetricCardWithTrend 
                  title="出访人次"
                  value="1,856.5"
                  yoy={18.2}
                  unit="万"
                  trendData={outboundScaleTrendData}
                  dataKey="trips"
                  yoyKey="tripsYoy"
                  color="#00A3E0"
                />
                <MetricCardWithTrend 
                  title="分方向出访总次数"
                  value="2,156.3"
                  yoy={12.5}
                  unit="万人次"
                  trendData={outboundScaleTrendData}
                  dataKey="directionTrips"
                  yoyKey="directionTripsYoy"
                  color="#00B050"
                />
                <MetricCardWithTrend 
                  title="出访客户含0话单占比"
                  value="68.5%"
                  yoy={5.2}
                  yoyUnit="pp"
                  trendData={outboundScaleTrendData}
                  dataKey="zeroBillRate"
                  yoyKey="zeroBillRateYoy"
                  color="#FF6B6B"
                />
              </div>
            </Card>
            {/* 使用订购 - 右侧 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">使用订购</h4>
                <PeriodSwitcher value={usageOrderPeriod} onChange={setUsageOrderPeriod} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCardWithTrend 
                  title="客户订购渗透率-自有渠道"
                  value="28.5%"
                  yoy={6.8}
                  yoyUnit="pp"
                  trendData={usageOrderTrendData}
                  dataKey="selfChannel"
                  yoyKey="selfChannelYoy"
                  color="#0066CC"
                />
                <MetricCardWithTrend 
                  title="国漫产品订购客户数占比"
                  value="42.5%"
                  yoy={8.5}
                  yoyUnit="pp"
                  trendData={usageOrderTrendData}
                  dataKey="orderCustomerRate"
                  yoyKey="orderCustomerRateYoy"
                  color="#FF6B6B"
                />
                <MetricCardWithTrend 
                  title="国漫产品使用客户数占比"
                  value="38.2%"
                  yoy={6.5}
                  yoyUnit="pp"
                  trendData={usageOrderTrendData}
                  dataKey="useCustomerRate"
                  yoyKey="useCustomerRateYoy"
                  color="#FFA500"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* 出访行为趋势 - 柱线组合图 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">出访行为趋势</h4>
            <PeriodSwitcher value={behaviorPeriod} onChange={setBehaviorPeriod} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* DOU柱线图 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">DOU（MB/人天）</h5>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={douTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]} name="DOU">
                        {douTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} name="同比" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
            {/* MOU柱线图 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">MOU（Min/人天）</h5>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mouTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]} name="MOU">
                        {mouTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} name="同比" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
            {/* ARPU柱线图 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">ARPU（元/人）</h5>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={arpuTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]} name="ARPU">
                        {arpuTrendData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} name="同比" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* 客户订购渗透率 - 分区情况 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">客户订购渗透率 - 分区情况</h4>
            <PeriodSwitcher value={penetrationProvincePeriod} onChange={setPenetrationProvincePeriod} />
          </div>
          <Card className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredPenetrationRegionData}>
                  <XAxis dataKey="region" tick={{ fontSize: 9 }} interval={0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 50]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="penetrationRate" barSize={12} radius={[4, 4, 0, 0]} name="渗透率">
                        {filteredPenetrationRegionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="penetrationRate" position="top" style={{ fontSize: 10, fill: '#666' }} formatter={(val: number) => val.toFixed(2) + '%'} />
                      </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} name="同比" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0066CC]"></span>渗透率(%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span>同比(pp)</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== 产品分析 ==================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          产品分析
        </h3>

        {/* 产品类型分布 - 单独区域 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">产品类型分布</h4>
            <PeriodSwitcher value={productTypePeriod} onChange={setProductTypePeriod} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* 左侧：产品类型分布 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">产品类型分布（万）</h5>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={productTypeData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]}>
                        {productTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
            {/* 右侧：产品明细 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">产品明细（万）</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">大包多天</h6>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={bigPackageDetailData}>
                        <XAxis dataKey="product" tick={{ fontSize: 9 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="value" barSize={16} radius={[4, 4, 0, 0]}>
                          {bigPackageDetailData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                          ))}
                          <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">漫游99</h6>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={roaming99DetailData}>
                        <XAxis dataKey="product" tick={{ fontSize: 9 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="value" barSize={16} radius={[4, 4, 0, 0]}>
                          {roaming99DetailData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                          ))}
                          <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 目标与方向分析 - 分区目标达成情况 + 销量TOP10方向 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">目标与方向分析</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* 左侧：分区目标达成情况 */}
            <Card className="p-4">
              <h5 className="text-xs text-gray-500 mb-2">分区目标达成情况</h5>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-600">已达成：<span className="font-semibold text-green-600">7省</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-xs text-gray-600">未达成：<span className="font-semibold text-red-600">24省</span></span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredSalesRegionTargetData}>
                    <XAxis dataKey="region" tick={{ fontSize: 8 }} interval={0} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="rate" barSize={10} radius={[4, 4, 0, 0]}>
                        {filteredSalesRegionTargetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.achieved ? '#00B050' : '#FF6B6B'} />
                        ))}
                        <LabelList dataKey="rate" position="top" style={{ fontSize: 10, fill: '#666' }} formatter={(val: number) => val.toFixed(2) + '%'} />
                      </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-1 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500"></span>达成率(%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span>同比</span>
              </div>
            </Card>
            {/* 右侧：销量TOP10方向 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs text-gray-500">销量TOP10方向（万）</h5>
                <PeriodSwitcher value={salesTop10Period} onChange={setSalesTop10Period} />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salesTop10Directions} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="direction" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" barSize={14} radius={[0, 4, 4, 0]}>
                        {salesTop10Directions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                        ))}
                        <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#666' }} />
                      </Bar>
                    <Line type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ==================== 收入分析 ==================== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          收入分析
          <PeriodSwitcher value={revenuePeriod} onChange={setRevenuePeriod} />
        </h3>

        {/* 收入结构趋势 + 产品类型收入分布 + 标准资费明细 - 一行三列 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 收入结构趋势 */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">收入结构趋势（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueStructureTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="standard" name="标准资费" stroke="#0066CC" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="package" name="国漫包" stroke="#00B050" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {/* 产品类型收入分布（5类国漫包产品） */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">产品类型收入分布（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productTypeRevenueData}>
                  <XAxis dataKey="type" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]}>
                    {productTypeRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {/* 标准资费明细 */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">标准资费收入分布（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={standardRevenueDetailData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" barSize={20} radius={[4, 4, 0, 0]}>
                    {standardRevenueDetailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 收入TOP10方向 + 大包多天 + 漫游99 - 一行三列 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 收入TOP10方向 */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">收入TOP10方向（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueTop10Directions} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="direction" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                    {revenueTop10Directions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                    ))}
                    <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#666' }} />
                  </Bar>
                  <Line type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {/* 大包多天 */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">大包多天收入明细（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { product: '3天包', value: 0.85, yoy: 18.5 },
                  { product: '5天包', value: 0.72, yoy: 15.2 },
                  { product: '7天包', value: 0.68, yoy: 22.5 },
                  { product: '10天包', value: 0.60, yoy: 12.8 },
                ]}>
                  <XAxis dataKey="product" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" barSize={24} radius={[4, 4, 0, 0]}>
                    {[
                      { product: '3天包', value: 0.85, yoy: 18.5 },
                      { product: '5天包', value: 0.72, yoy: 15.2 },
                      { product: '7天包', value: 0.68, yoy: 22.5 },
                      { product: '10天包', value: 0.60, yoy: 12.8 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {/* 漫游99 */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">漫游99收入明细（亿）</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={[
                  { product: '漫游99流量包', value: 0.52, yoy: 15.2 },
                  { product: '漫游99语音包', value: 0.38, yoy: 8.5 },
                  { product: '漫游99流量语音包', value: 0.35, yoy: 12.5 },
                ]}>
                  <XAxis dataKey="product" tick={{ fontSize: 8 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="value" barSize={28} radius={[4, 4, 0, 0]}>
                    {[
                      { product: '漫游99流量包', value: 0.52, yoy: 15.2 },
                      { product: '漫游99语音包', value: 0.38, yoy: 8.5 },
                      { product: '漫游99流量语音包', value: 0.35, yoy: 12.5 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.yoy >= 0 ? '#00B050' : '#E74C3C'} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#666' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={1.5} dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 分区目标达成情况 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">分区目标达成情况</h4>
          <Card className="p-4">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">已达成：<span className="font-semibold text-green-600">5省</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">未达成：<span className="font-semibold text-red-600">26省</span></span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredRevenueRegionTargetData}>
                  <XAxis dataKey="region" tick={{ fontSize: 9 }} interval={0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="rate" barSize={12} radius={[4, 4, 0, 0]}>
                        {filteredRevenueRegionTargetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.achieved ? '#00B050' : '#FF6B6B'} />
                        ))}
                        <LabelList dataKey="rate" position="top" style={{ fontSize: 10, fill: '#666' }} formatter={(val: number) => val.toFixed(2) + '%'} />
                      </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FFA500" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span>达成率(%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span>同比</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== 指标树内容组件 ====================
const generateAnalysisData = (selectedIndicator: string) => {
  return {
    analysisReasons: [
      '本月出访客户数量较上月有所增长，主要受到出境旅游旺季影响',
      '国漫产品订购量持续增长，大包多天产品受到客户欢迎',
      '传统语音收入持续下降，客户更倾向于使用数据流量产品',
    ],
    regionData: [
      { name: '广东', value: 125.6 },
      { name: '北京', value: 98.5 },
      { name: '上海', value: 85.2 },
      { name: '江苏', value: 72.8 },
      { name: '浙江', value: 68.5 },
    ],
    topRegions: [
      '广东 125.6万 +15.2%',
      '北京 98.5万 +12.8%',
      '上海 85.2万 +10.5%',
    ],
    bottomRegions: [
      '西藏 2.5万 -5.2%',
      '青海 3.8万 -2.8%',
      '宁夏 4.2万 -1.5%',
    ],
    trendData: [
      { month: '2月', value: 112.5 },
      { month: '3月', value: 115.8 },
      { month: '4月', value: 118.2 },
      { month: '5月', value: 121.5 },
      { month: '6月', value: 123.8 },
      { month: '7月', value: 125.6 },
    ],
  };
};

function IndicatorTreeContent({ treeData, indicatorName, selectedMonth, currentTab, selectedRegion }: { 
  treeData: IndicatorCardData; 
  indicatorName: string;
  selectedMonth?: string;
  currentTab?: string;
  selectedRegion?: { cityCode?: string; cityName?: string; districtCode?: string; gridCode?: string; gridName?: string; isProvince?: boolean } | string;
}) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root');
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('2025-07');
  const finalSelectedMonth = selectedMonth !== undefined ? selectedMonth : internalSelectedMonth;
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>([treeData]);

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator)
    : generateAnalysisData('root');

  const getPageId = () => {
    if (indicatorName === '国漫产品订购量') {
      return 'portal.international.product-order';
    } else if (indicatorName === '全球通专属国漫礼包激活量') {
      return 'portal.international.gift-activation';
    } else if (indicatorName === '出访客户收入-折后') {
      return 'portal.international.outbound-revenue';
    } else if (indicatorName === '出访客户（含0）') {
      return 'portal.international.outbound-customer';
    } else if (indicatorName === '来访客户') {
      return 'portal.international.inbound-customer';
    } else if (indicatorName === '来访客户收入') {
      return 'portal.international.inbound-revenue';
    }
    return 'portal.international.product-order';
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        {/* 左侧指标树 */}
        <div className="w-[60%] h-[600px] border rounded-lg overflow-auto relative">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <h3 className="text-sm font-semibold text-gray-700">指标树</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{finalSelectedMonth}</span>
            </div>
          </div>

          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(8)
            </Button>
            <select className="border rounded px-3 py-2 text-sm bg-white/90 backdrop-blur-sm shadow-sm">
              <option>全部展开</option>
              <option>全部折叠</option>
              <option>仅展开预警节点</option>
            </select>
          </div>

          <div className="h-full pt-20 px-4">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={handleCardClick}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 */}
        <div className="w-[40%] overflow-hidden">
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
              from="international"
              businessScenario="国际业务运营"
              selectedRegion={{ cityCode: (typeof selectedRegion === 'object' ? selectedRegion?.cityCode : '') || '', districtCode: (typeof selectedRegion === 'object' ? selectedRegion?.districtCode : '') || '', gridCode: (typeof selectedRegion === 'object' ? selectedRegion?.gridCode : '') || '', isProvince: typeof selectedRegion === 'object' ? selectedRegion?.isProvince : undefined }}
            />
          </div>

          <div className="border border-gray-200 rounded-lg">
            <DataInsightReports
              pageId={getPageId()}
              maxDisplay={3}
              showViewAll={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面组件 ====================
export default function InternationalMetricsPage() {
  // 国际业务运营页面的有效Tab值
  const validTabs = ['overview', 'product-order', 'gift-activation', 'outbound-revenue', 'outbound-customer', 'inbound-customer', 'inbound-revenue'];
  
  // 检测是否从工单返回
  const [isFromWorkOrder, setIsFromWorkOrder] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode?: string; cityName?: string; districtCode?: string; gridCode?: string; isProvince?: boolean }>({ isProvince: true }); // 默认全疆
  const [regionDisplay, setRegionDisplay] = useState('新疆维吾尔自治区全疆');

  const [isEditMode, setIsEditMode] = useState(false);

  // 检测是否从工单返回，并设置初始标签页
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromWorkOrder = searchParams.get('fromWorkOrder') === 'true';
    const restorationMode = searchParams.get('mode'); // draft | rejected
    const orderId = searchParams.get('orderId');
    const draftId = searchParams.get('draftId');
    const orderType = searchParams.get('orderType');
    const dispatchTypeName = searchParams.get('dispatchTypeName');
    const currentStep = searchParams.get('currentStep');

    setIsFromWorkOrder(fromWorkOrder);

    // 处理草稿续接或驳回修改
    if (restorationMode && (orderId || draftId)) {
      const targetOrderType = orderType || dispatchTypeName;

      console.log('[国际运营] 处理草稿续接/驳回:', {
        restorationMode,
        orderId,
        draftId,
        targetOrderType,
        currentStep
      });

      // 根据调度类型提示用户
      if (targetOrderType === 'strategy' || dispatchTypeName === '策略调度') {
        alert(`续接策略调度草稿/驳回: 当前步骤${currentStep || 1}/2`);
      } else if (targetOrderType === 'customer-group' || dispatchTypeName === '客群调度') {
        alert(`续接客群调度草稿/驳回: 当前步骤${currentStep || 1}/3`);
      } else {
        alert(`续接指标调度草稿/驳回: 当前步骤${currentStep || 1}/2`);
      }
    }

    // 从工单返回时读取 hash
    if (fromWorkOrder && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      // 处理hash中可能包含的查询参数（如 #product-order?workOrderPanel=open）
      const hashTab = hash.split('?')[0];
      if (validTabs.includes(hashTab)) {
        setActiveTab(hashTab);
        console.log('[international-metrics] Initial tab from hash:', hashTab);
      }
    }
  }, []);

  // 监听 URL hash 变化（从工单返回时响应）
  useEffect(() => {
    if (!isFromWorkOrder) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      // 处理hash中可能包含的查询参数
      const hashTab = hash.split('?')[0];
      if (validTabs.includes(hashTab)) {
        setActiveTab(hashTab);
        console.log('[international-metrics] Hash changed to:', hashTab);
      }
    };

    // 初始检查
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isFromWorkOrder]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleJumpToTree = (indicatorName: string) => {
    if (indicatorName === '国漫产品订购量') {
      setActiveTab('product-order');
    } else if (indicatorName === '全球通专属国漫礼包激活量') {
      setActiveTab('gift-activation');
    } else if (indicatorName === '出访客户收入-折后') {
      setActiveTab('outbound-revenue');
    } else if (indicatorName === '出访客户（含0）') {
      setActiveTab('outbound-customer');
    } else if (indicatorName === '来访客户') {
      setActiveTab('inbound-customer');
    } else if (indicatorName === '来访客户收入') {
      setActiveTab('inbound-revenue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 + 一级Tab胶囊 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-[#0085D0]">市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[#0085D0]">细分市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">国际运营</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#0085D0] text-white"
          >
            指标洞察
          </button>
        </div>
      </div>

      {/* 指标洞察 - 二级Tab Card + 筛选器 */}
      <Card className="m-4 mb-0 p-4">
        <div className="flex items-center justify-between">
          {/* 左侧标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="h-9 bg-transparent p-0 gap-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                概览
              </TabsTrigger>
              <TabsTrigger value="product-order" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                国漫产品订购量
              </TabsTrigger>
              <TabsTrigger value="gift-activation" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                全球通专属国漫礼包激活量
              </TabsTrigger>
              <TabsTrigger value="outbound-revenue" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                出访客户收入-折后
              </TabsTrigger>
              <TabsTrigger value="outbound-customer" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                出访客户（含0）
              </TabsTrigger>
              <TabsTrigger value="inbound-customer" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                来访客户
              </TabsTrigger>
              <TabsTrigger value="inbound-revenue" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                来访客户收入
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 右侧工具按钮 */}
          <div className="flex items-center gap-3 ml-4">
            <Button variant="outline" size="sm">
              {textConfig.churnRetention.toolbar.indicatorTreeTemplate}
            </Button>

            {/* 月份选择器 */}
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-[#0085D0] focus:outline-none min-w-[140px]"
            />

            {/* 区域选择器 */}
            <XinjiangRegionSelector
              value={{ cityCode: selectedRegion.cityCode }}
              onChange={(cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => setSelectedRegion({ cityCode: cityCode || undefined, cityName: cityName || undefined, districtCode: districtCode || undefined, gridCode: gridCode || undefined, isProvince: !!isProvince })}
            />

            {/* 设置按钮 */}
            <button
              onClick={handleToggleEditMode}
              className={`p-2 rounded-lg transition-colors ${isEditMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
              title={isEditMode ? '退出编辑模式' : '进入编辑模式'}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 内容区域 */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview">
            <OverviewTab isEditMode={isEditMode} onJumpToTree={handleJumpToTree} selectedRegion={selectedRegion} />
          </TabsContent>

          <TabsContent value="product-order">
            <IndicatorTreeContent
              treeData={internationalProductOrderTree}
              indicatorName="国漫产品订购量"
              selectedMonth={selectedMonth}
              currentTab="product-order"
              selectedRegion={selectedRegion}
            />
          </TabsContent>

          <TabsContent value="gift-activation">
            <IndicatorTreeContent
              treeData={globalTravelGiftTree}
              indicatorName="全球通专属国漫礼包激活量"
              selectedMonth={selectedMonth}
              currentTab="gift-activation"
              selectedRegion={selectedRegion}
            />
          </TabsContent>

          <TabsContent value="outbound-revenue">
            <IndicatorTreeContent
              treeData={outboundRevenueTree}
              indicatorName="出访客户收入-折后"
              selectedMonth={selectedMonth}
              currentTab="outbound-revenue"
              selectedRegion={selectedRegion}
            />
          </TabsContent>

          <TabsContent value="outbound-customer">
            <IndicatorTreeContent
              treeData={outboundCustomerTree}
              indicatorName="出访客户（含0）"
              selectedMonth={selectedMonth}
              currentTab="outbound-customer"
              selectedRegion={selectedRegion}
            />
          </TabsContent>

          <TabsContent value="inbound-customer">
            <IndicatorTreeContent
              treeData={inboundCustomerTree}
              indicatorName="来访客户"
              selectedMonth={selectedMonth}
              currentTab="inbound-customer"
              selectedRegion={selectedRegion}
            />
          </TabsContent>

          <TabsContent value="inbound-revenue">
            <IndicatorTreeContent
              treeData={inboundRevenueTree}
              indicatorName="来访客户收入"
              selectedMonth={selectedMonth}
              currentTab="inbound-revenue"
              selectedRegion={selectedRegion}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 工单面板 */}
      <Suspense fallback={null}>
        <WorkOrderPanel scenario="international" />
      </Suspense>
    </div>
  );
}
