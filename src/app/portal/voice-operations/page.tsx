'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Expand, Minimize, Network, GitBranch, AlertCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Settings, Edit2, X, Phone } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area } from 'recharts';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';
import WorkOrderPanel from '@/components/WorkOrderPanel';
import { useMounted } from '@/hooks/useMounted';

// 类型定义
interface MetricData {
  id: number;
  name: string;
  value: string;
  yoy: string;
  yoyUnit?: string;
  yoyLabel?: string;
  status: 'normal' | 'warning' | 'danger';
  color: string;
  chartType: 'line' | 'barline';
  chartData: Array<{ month: string; value?: number; revenue?: number; rate?: number; yoy?: number }>;
  businessScope?: string;
  hasEntrances?: boolean;
  canJumpToTree?: boolean; // 是否可以跳转到指标树（只有根节点指标才能跳转）
  indicatorName?: string;
  targetRate?: string;
  targetGap?: string;
}

// 自定义 Tooltip 组件
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPieChart = payload.length === 1 && payload[0].payload && payload[0].payload.name;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        {label && !isPieChart && <p className="text-xs text-gray-600 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => {
          const keyMap: Record<string, { name: string; unit: string }> = {
            'value': { name: '当月值', unit: '' },
            'rate': { name: '环比', unit: '%' },
            'yoy': { name: '环比', unit: '%' },
            'revenue': { name: '收入', unit: '亿' },
          };
          
          const keyInfo = keyMap[entry.dataKey] || { name: entry.dataKey, unit: '' };
          
          if (isPieChart && entry.payload && entry.payload.name) {
            const yoyText = entry.payload.yoy !== undefined ? ` (同比${entry.payload.yoy > 0 ? '+' : ''}${entry.payload.yoy}%)` : '';
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold text-gray-900">
                  {entry.payload.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{entry.payload.unit || ''}{yoyText}
                </span>
              </div>
            );
          }
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{keyInfo.name}:</span>
              <span className="font-semibold text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
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

// 饼图颜色
const PIE_COLORS = ['#0066CC', '#00B050', '#FF9500', '#FF6B6B', '#9B59B6', '#3498DB'];

// ==================== 语音运营指标树数据 ====================
const voiceIndicatorTree: IndicatorCardData = {
  id: 'root',
  name: '语音运营',
  value: '85.6亿分钟',
  yoy: -5.2,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'warning',
  isExpanded: true,
  children: [
    {
      id: '1',
      name: '传统语音经营',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        {
          id: '1-1',
          name: '语音通话量',
          value: '85.6亿分钟',
          yoy: -5.2,
          yoyUnit: '',
          level: 3,
          status: 'warning',
          parentId: '1',
          children: [
            { id: '1-1-1', name: '移网总语音通话分钟数', value: '85.6亿分钟', yoy: -5.2, yoyUnit: '', level: 4, status: 'warning', parentId: '1-1' },
            { id: '1-1-2', name: '5G客户语音通话分钟数', value: '25.8亿分钟', yoy: 12.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-1' },
            { id: '1-1-3', name: '4G客户语音通话分钟数', value: '45.2亿分钟', yoy: -8.5, yoyUnit: '', level: 4, status: 'warning', parentId: '1-1' },
            { id: '1-1-4', name: '2/3G存量客户语音通话分钟数', value: '14.6亿分钟', yoy: -25.5, yoyUnit: '', level: 4, status: 'danger', parentId: '1-1' },
            { id: '1-1-5', name: '本地通话分钟数及占比', value: '35.2亿分钟/41.1%', yoy: -8.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1' },
            { id: '1-1-6', name: '长途通话分钟数及占比', value: '42.5亿分钟/49.6%', yoy: -3.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1' },
            { id: '1-1-7', name: '漫游通话分钟数及占比', value: '7.9亿分钟/9.2%', yoy: -12.5, yoyUnit: 'pp', level: 4, status: 'warning', parentId: '1-1' },
          ]
        },
        {
          id: '1-2',
          name: '语音套餐收入',
          value: '12.5亿',
          yoy: -8.5,
          yoyUnit: '',
          level: 3,
          status: 'warning',
          parentId: '1',
          children: [
            { id: '1-2-1', name: '基础语音套餐收入（按档位分）', value: '8.5亿', yoy: -12.5, yoyUnit: '', level: 4, status: 'warning', parentId: '1-2' },
            { id: '1-2-2', name: '语音分钟数叠加包收入', value: '2.8亿', yoy: 5.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2' },
            { id: '1-2-3', name: '家庭共享语音包收入', value: '0.8亿', yoy: 8.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2' },
            { id: '1-2-4', name: '政企统付语音套餐收入', value: '0.4亿', yoy: 12.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-2' },
          ]
        },
        {
          id: '1-3',
          name: '语音消费指标',
          value: '8.5元/人',
          yoy: -2.5,
          yoyUnit: '',
          level: 3,
          status: 'warning',
          parentId: '1',
          children: [
            { id: '1-3-1', name: '语音ARPU（整体客户）', value: '8.5元/人', yoy: -2.5, yoyUnit: '', level: 4, status: 'warning', parentId: '1-3' },
            { id: '1-3-2', name: '银发客户语音ARPU', value: '15.2元/人', yoy: 3.5, yoyUnit: '', level: 4, status: 'normal', parentId: '1-3' },
            { id: '1-3-3', name: '高价值客户语音ARPU', value: '18.5元/人', yoy: -1.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-3' },
            { id: '1-3-4', name: '校园客户语音ARPU', value: '5.2元/人', yoy: -8.5, yoyUnit: '', level: 4, status: 'warning', parentId: '1-3' },
            { id: '1-3-5', name: '农村客户语音ARPU', value: '6.8元/人', yoy: -5.2, yoyUnit: '', level: 4, status: 'warning', parentId: '1-3' },
          ]
        },
        {
          id: '1-4',
          name: '语音通话渗透率',
          value: '45.2%',
          yoy: -3.5,
          yoyUnit: 'pp',
          level: 3,
          status: 'warning',
          parentId: '1',
          children: [
            { id: '1-4-1', name: '客户月均语音通话渗透率', value: '45.2%', yoy: -3.5, yoyUnit: 'pp', level: 4, status: 'warning', parentId: '1-4' },
            { id: '1-4-2', name: '银发客户语音通话渗透率', value: '85.5%', yoy: 1.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-4' },
            { id: '1-4-3', name: '低活跃客户语音通话渗透率', value: '15.2%', yoy: -8.5, yoyUnit: 'pp', level: 4, status: 'danger', parentId: '1-4' },
          ]
        },
      ]
    },
    {
      id: '2',
      name: '语音增值服务',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root',
      children: [
        {
          id: '2-1',
          name: 'AI语音服务',
          value: '1,256万次',
          yoy: 45.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '2',
          children: [
            { id: '2-1-1', name: 'AI语音助手交互次数', value: '856万次', yoy: 52.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-1' },
            { id: '2-1-2', name: 'AI语音转文字使用量', value: '325万次', yoy: 38.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-1' },
            { id: '2-1-3', name: '智能语音导航使用次数', value: '75万次', yoy: 25.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-1' },
          ]
        },
        {
          id: '2-2',
          name: '特色语音服务',
          value: '2.5亿',
          yoy: 12.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '2',
          children: [
            { id: '2-2-1', name: '彩印业务订购数及收入', value: '1.2亿', yoy: 8.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-2' },
            { id: '2-2-2', name: '语音留言业务订购数及收入', value: '0.8亿', yoy: 15.2, yoyUnit: '', level: 4, status: 'normal', parentId: '2-2' },
            { id: '2-2-3', name: '多方通话业务使用量及收入', value: '0.5亿', yoy: 22.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-2' },
          ]
        },
        {
          id: '2-3',
          name: '语音+内容融合',
          value: '1,525万次',
          yoy: 28.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '2',
          children: [
            { id: '2-3-1', name: '语音点播内容使用量', value: '1,025万次', yoy: 32.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-3' },
            { id: '2-3-2', name: '语音伴听会员收入', value: '0.5亿', yoy: 25.5, yoyUnit: '', level: 4, status: 'normal', parentId: '2-3' },
          ]
        },
        {
          id: '2-4',
          name: '语音权益融合',
          value: '65.2%',
          yoy: 8.5,
          yoyUnit: 'pp',
          level: 3,
          status: 'normal',
          parentId: '2',
          children: [
            { id: '2-4-1', name: '语音套餐捆绑权益核销率', value: '65.2%', yoy: 8.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '2-4' },
            { id: '2-4-2', name: '高价值客户语音权益定制率', value: '42.5%', yoy: 12.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '2-4' },
          ]
        },
      ]
    },
    {
      id: '3',
      name: '语音安全与权益',
      label: '分类节点',
      level: 2,
      status: 'normal',
      isExpanded: true,
      parentId: 'root',
      children: [
        {
          id: '3-1',
          name: '反诈语音服务',
          value: '856万次',
          yoy: 35.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3',
          children: [
            { id: '3-1-1', name: '反诈语音识别拦截次数', value: '525万次', yoy: 45.2, yoyUnit: '', level: 4, status: 'normal', parentId: '3-1' },
            { id: '3-1-2', name: '疑似诈骗通话提醒次数', value: '285万次', yoy: 28.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-1' },
            { id: '3-1-3', name: '客户反诈语音功能开通率', value: '42.5%', yoy: 15.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '3-1' },
          ]
        },
        {
          id: '3-2',
          name: '亲情守护服务',
          value: '256万户',
          yoy: 18.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3',
          children: [
            { id: '3-2-1', name: '亲情语音定位呼叫次数', value: '125万次', yoy: 22.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2' },
            { id: '3-2-2', name: '银发客户亲情语音绑定数', value: '185万户', yoy: 25.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-2' },
            { id: '3-2-3', name: '儿童客户语音防骚扰开通率', value: '32.5%', yoy: 12.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '3-2' },
          ]
        },
        {
          id: '3-3',
          name: '语音防骚扰服务',
          value: '1,525万次',
          yoy: 32.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3',
          children: [
            { id: '3-3-1', name: '垃圾语音通话拦截次数', value: '1,025万次', yoy: 35.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-3' },
            { id: '3-3-2', name: '客户语音防骚扰功能开通率', value: '58.5%', yoy: 12.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '3-3' },
          ]
        },
        {
          id: '3-4',
          name: '隐私保护服务',
          value: '125万户',
          yoy: 22.5,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '3',
          children: [
            { id: '3-4-1', name: '语音小号业务订购数及收入', value: '125万户/0.8亿', yoy: 22.5, yoyUnit: '', level: 4, status: 'normal', parentId: '3-4' },
          ]
        },
      ]
    },
    {
      id: '4',
      name: '语音客群运营',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        {
          id: '4-1',
          name: '核心客群语音表现',
          value: '需关注',
          yoy: 0,
          yoyUnit: '',
          level: 3,
          status: 'warning',
          parentId: '4',
          children: [
            { id: '4-1-1', name: '银发客户语音活跃度', value: '85.5%', yoy: 2.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-1' },
            { id: '4-1-2', name: '高价值客户语音留存率', value: '92.5%', yoy: -1.5, yoyUnit: 'pp', level: 4, status: 'warning', parentId: '4-1' },
            { id: '4-1-3', name: '政企客户语音使用粘性', value: '78.5%', yoy: 3.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-1' },
            { id: '4-1-4', name: '校园客户语音互动频次', value: '5.2次/月', yoy: -8.5, yoyUnit: '', level: 4, status: 'warning', parentId: '4-1' },
          ]
        },
        {
          id: '4-2',
          name: '风险客群语音表现',
          value: '需关注',
          yoy: 0,
          yoyUnit: '',
          level: 3,
          status: 'warning',
          parentId: '4',
          children: [
            { id: '4-2-1', name: '低语音使用高流量客户数及占比', value: '356万/1.5%', yoy: 8.5, yoyUnit: 'pp', level: 4, status: 'warning', parentId: '4-2' },
            { id: '4-2-2', name: '语音业务沉默客户数及占比（30天）', value: '525万/2.2%', yoy: 5.2, yoyUnit: 'pp', level: 4, status: 'warning', parentId: '4-2' },
            { id: '4-2-3', name: '竞对语音套餐迁移倾向客户数', value: '185万', yoy: 12.5, yoyUnit: '', level: 4, status: 'danger', parentId: '4-2' },
          ]
        },
        {
          id: '4-3',
          name: '客群语音转化',
          value: '待提升',
          yoy: 0,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '4',
          children: [
            { id: '4-3-1', name: '语音套餐升档办理率', value: '5.2%', yoy: 1.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-3' },
            { id: '4-3-2', name: '沉默客户语音唤醒成功率', value: '12.5%', yoy: 2.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-3' },
            { id: '4-3-3', name: '非语音客户语音套餐订购率', value: '3.5%', yoy: 0.8, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-3' },
          ]
        },
        {
          id: '4-4',
          name: '线上触点语音运营',
          value: '正常',
          yoy: 0,
          yoyUnit: '',
          level: 3,
          status: 'normal',
          parentId: '4',
          children: [
            { id: '4-4-1', name: 'APP语音套餐办理量', value: '25.6万笔', yoy: 15.5, yoyUnit: '', level: 4, status: 'normal', parentId: '4-4' },
            { id: '4-4-2', name: '短信语音包订购响应率', value: '8.5%', yoy: 2.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-4' },
            { id: '4-4-3', name: '营业厅语音业务办理量', value: '12.5万笔', yoy: -5.2, yoyUnit: '', level: 4, status: 'warning', parentId: '4-4' },
            { id: '4-4-4', name: '客户经理语音套餐推荐转化率', value: '15.2%', yoy: 3.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-4' },
            { id: '4-4-5', name: '政企客户经理语音解决方案签约率', value: '22.5%', yoy: 5.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '4-4' },
          ]
        },
      ]
    },
  ]
};

// 概览Tab整体指标数据（这些指标不是指标树根节点，不展示指标树分析按钮，但展示去调度按钮）
const overallVoiceMetrics: MetricData[] = [
  {
    id: 1,
    name: '语音通话量',
    value: '85.6亿分钟',
    yoy: '-5.2',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '92.5',
    targetGap: '-5.5',
    status: 'warning',
    color: '#0066CC',
    chartType: 'barline',
    businessScope: '统计移网总语音通话分钟数，包括5G/4G/2G客户',
    hasEntrances: true,
    canJumpToTree: false,
    indicatorName: '语音通话量',
    chartData: [
      { month: '2月', value: 92.5, yoy: -3.5 },
      { month: '3月', value: 90.2, yoy: -4.2 },
      { month: '4月', value: 88.5, yoy: -4.8 },
      { month: '5月', value: 87.2, yoy: -5.0 },
      { month: '6月', value: 86.5, yoy: -5.2 },
      { month: '7月', value: 85.6, yoy: -5.2 }
    ]
  },
  {
    id: 2,
    name: '语音收入',
    value: '15.8亿',
    yoy: '-6.5',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '88.5',
    targetGap: '-8.5',
    status: 'warning',
    color: '#FF9500',
    chartType: 'barline',
    businessScope: '包含语音套餐收入、增值服务收入、安全服务收入',
    hasEntrances: true,
    canJumpToTree: false,
    indicatorName: '语音收入',
    chartData: [
      { month: '2月', value: 17.2, yoy: -4.5 },
      { month: '3月', value: 16.8, yoy: -5.2 },
      { month: '4月', value: 16.5, yoy: -5.8 },
      { month: '5月', value: 16.2, yoy: -6.0 },
      { month: '6月', value: 15.9, yoy: -6.2 },
      { month: '7月', value: 15.8, yoy: -6.5 }
    ]
  },
  {
    id: 3,
    name: '语音ARPU',
    value: '8.5元/人',
    yoy: '-2.5',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '90.2',
    targetGap: '-6.8',
    status: 'warning',
    color: '#FF6B6B',
    chartType: 'barline',
    businessScope: '整体客户月均语音消费水平',
    hasEntrances: true,
    canJumpToTree: false,
    indicatorName: '语音ARPU',
    chartData: [
      { month: '2月', value: 9.2, yoy: -1.5 },
      { month: '3月', value: 9.0, yoy: -1.8 },
      { month: '4月', value: 8.8, yoy: -2.0 },
      { month: '5月', value: 8.7, yoy: -2.2 },
      { month: '6月', value: 8.6, yoy: -2.4 },
      { month: '7月', value: 8.5, yoy: -2.5 }
    ]
  },
  {
    id: 4,
    name: 'AI语音服务使用量',
    value: '1,256万次',
    yoy: '+45.5',
    yoyUnit: '',
    yoyLabel: '同比',
    targetRate: '125.5',
    targetGap: '+15.5',
    status: 'normal',
    color: '#00B050',
    chartType: 'barline',
    businessScope: 'AI语音助手交互、语音转文字、智能语音导航等AI服务使用量',
    hasEntrances: true,
    canJumpToTree: false,
    indicatorName: 'AI语音服务',
    chartData: [
      { month: '2月', value: 825, yoy: 35.5 },
      { month: '3月', value: 925, yoy: 38.2 },
      { month: '4月', value: 1025, yoy: 40.5 },
      { month: '5月', value: 1115, yoy: 42.8 },
      { month: '6月', value: 1185, yoy: 44.2 },
      { month: '7月', value: 1256, yoy: 45.5 }
    ]
  }
];

// 语音收入结构数据
const revenueStructureData = [
  { name: '语音套餐收入', value: 12.5, yoy: -8.5 },
  { name: 'AI语音服务', value: 1.2, yoy: 45.5 },
  { name: '特色语音服务', value: 1.5, yoy: 12.5 },
  { name: '安全服务', value: 0.6, yoy: 28.5 },
];

// 通话量趋势数据
const callTrendData = [
  { month: '2月', total: 92.5, '5g': 22.5, '4g': 48.2 },
  { month: '3月', total: 90.2, '5g': 23.8, '4g': 46.5 },
  { month: '4月', total: 88.5, '5g': 24.8, '4g': 45.8 },
  { month: '5月', total: 87.2, '5g': 25.5, '4g': 45.2 },
  { month: '6月', total: 86.5, '5g': 25.8, '4g': 44.8 },
  { month: '7月', total: 85.6, '5g': 25.8, '4g': 45.2 },
];

// 分省语音目标达成数据 - 31省
const provinceTargetData = [
  { province: '吐鲁番', rate: 98.5, gap: -1.5, achieved: false },
  { province: '哈密', rate: 95.2, gap: -4.8, achieved: false },
  { province: '昌吉', rate: 92.5, gap: -7.5, achieved: false },
  { province: '博州', rate: 90.2, gap: -9.8, achieved: false },
  { province: '巴州', rate: 88.5, gap: -11.5, achieved: false },
  { province: '克州', rate: 86.2, gap: -13.8, achieved: false },
  { province: '喀什', rate: 85.5, gap: -14.5, achieved: false },
  { province: '伊犁', rate: 82.8, gap: -17.2, achieved: false },
  { province: '阿克苏', rate: 80.5, gap: -19.5, achieved: false },
  { province: '和田', rate: 78.2, gap: -21.8, achieved: false },
  { province: '塔城', rate: 75.5, gap: -24.5, achieved: false },
  { province: '乌鲁木齐', rate: 105.2, gap: 5.2, achieved: true },
  { province: '克拉玛依', rate: 102.8, gap: 2.8, achieved: true },
  { province: '阿勒泰', rate: 72.5, gap: -27.5, achieved: false },

  { province: '昌吉', rate: 66.2, gap: -33.8, achieved: false },
  { province: '石河子', rate: 65.5, gap: -34.5, achieved: false },

  { province: '乌鲁木齐', rate: 58.2, gap: -41.8, achieved: false },

  { province: '克拉玛依', rate: 55.5, gap: -44.5, achieved: false },

  { province: '昌吉', rate: 45.5, gap: -54.5, achieved: false },

  { province: '哈密', rate: 42.5, gap: -57.5, achieved: false },
  { province: '吐鲁番', rate: 40.2, gap: -59.8, achieved: false },
  { province: '博州', rate: 38.5, gap: -61.5, achieved: false },
];

// 核心客群语音表现数据
const coreCustomerData = [
  { name: '银发客户', arpu: 15.2, penetration: 85.5, retention: 88.5 },
  { name: '高价值客户', arpu: 18.5, penetration: 72.5, retention: 92.5 },
  { name: '政企客户', arpu: 12.5, penetration: 65.2, retention: 85.5 },
  { name: '校园客户', arpu: 5.2, penetration: 35.5, retention: 78.5 },
];

// 指标卡片组件
const MetricCard = ({ metric, onJumpToTree }: { metric: MetricData; onJumpToTree?: (indicatorName: string) => void }) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow relative">
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
            {/* 去调度按钮 - 始终展示 */}
            {metric.hasEntrances && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                  onClick={() => {
                    const url = `/workspace/strategy/dispatch?indicatorName=${encodeURIComponent(metric.indicatorName || '')}&from=voice-operations`;
                    window.location.href = url;
                  }}
                >
                  去调度
                </button>
              </>
            )}
            {/* 指标树分析按钮 - 仅当是根节点时展示 */}
            {metric.canJumpToTree && (
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
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            {metric.yoy !== '-' && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{metric.yoyLabel || '同比'}</span>
                <span className={`text-xs font-medium ${parseFloat(metric.yoy) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.yoy}{metric.yoyUnit || ''}
                </span>
              </div>
            )}
          </div>
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
              <Bar yAxisId="left" dataKey="value" fill={metric.color} radius={[3, 3, 0, 0]} barSize={12} />
              <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

// 概览Tab内容
function OverviewTab({ onJumpToTree }: { onJumpToTree?: (indicatorName: string) => void }) {
  const achievedCount = provinceTargetData.filter(p => p.achieved).length;
  const notAchievedCount = provinceTargetData.length - achievedCount;

  return (
    <div className="space-y-6">
      {/* 整体语音指标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          整体语音指标
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {overallVoiceMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} onJumpToTree={onJumpToTree} />
          ))}
        </div>
      </div>

      {/* 语音客户特征分析 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          语音客户特征分析
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">语音收入结构（亿）</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueStructureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {revenueStructureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">通话量趋势（亿分钟）</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={callTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="总通话量" stroke="#0066CC" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="5g" name="5G客户" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="4g" name="4G客户" stroke="#FF9500" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 语音目标达成情况 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          语音目标达成情况
        </h3>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">分省语音目标达成情况</h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">已达成：<span className="font-semibold text-green-600">{achievedCount}省</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">未达成：<span className="font-semibold text-red-600">{notAchievedCount}省</span></span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={provinceTargetData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="province" 
                  tick={{ fontSize: 9 }} 
                  interval={0}
                  axisLine={false}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 120]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[-70, 20]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="rate" name="完成率%" fill="#0066CC" barSize={12} radius={[4, 4, 0, 0]}>
                  {provinceTargetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.achieved ? '#00B050' : '#FF6B6B'} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="gap" name="差距pp" stroke="#FF9500" strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 核心客群语音表现 */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">核心客群语音表现</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coreCustomerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="arpu" name="ARPU(元)" fill="#0066CC" barSize={16} radius={[4, 4, 0, 0]} />
              <Bar dataKey="penetration" name="渗透率%" fill="#00B050" barSize={16} radius={[4, 4, 0, 0]} />
              <Bar dataKey="retention" name="留存率%" fill="#FF9500" barSize={16} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// 指标树内容组件
function IndicatorTreeContent({ indicatorName, selectedMonth }: { indicatorName: string; selectedMonth?: string }) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root');
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>([voiceIndicatorTree]);

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  // 分析数据
  const analysisData = {
    analysisReasons: [
      '语音通话量同比下降5.2%，主要受OTT应用冲击',
      'AI语音服务增长强劲，同比增长45.5%，成为新增长点',
      '银发客户语音活跃度保持85.5%，是核心稳定客群',
    ],
    regionData: [
      { name: '吐鲁番', value: 8.5 },
      { name: '哈密', value: 7.2 },
      { name: '昌吉', value: 6.8 },
      { name: '博州', value: 5.5 },
      { name: '巴州', value: 4.8 },
    ],
    topRegions: [
      '乌鲁木齐 105.2% +5.2pp',
      '克拉玛依 102.8% +2.8pp',
      '吐鲁番 98.5% -1.5pp',
    ],
    suggestions: [
      '针对银发客户推出专属语音套餐',
      '加强AI语音服务推广，挖掘新增长点',
      '优化语音套餐结构，提升ARPU',
    ]
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        {/* 左侧指标树 */}
        <div className="w-[60%] h-[600px] border rounded-lg overflow-auto relative bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-700">指标树</h3>
            <span className="text-sm text-gray-600">{selectedMonth || '2025-01'}</span>
          </div>
          
          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(8)
            </Button>
          </div>

          <div className="p-4">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={handleCardClick}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 */}
        <div className="w-[40%] flex flex-col gap-4">
          <AnalysisPanel
            indicatorName={indicatorName}
            analysisReasons={analysisData.analysisReasons}
            regionData={analysisData.regionData}
            topRegions={analysisData.topRegions}
            bottomRegions={['吐鲁番 40.2%', '哈密 42.5%', '昌吉 38.5%']}
            trendData={[
              { month: '2月', value: 92.5 },
              { month: '3月', value: 90.2 },
              { month: '4月', value: 88.5 },
              { month: '5月', value: 87.2 },
              { month: '6月', value: 86.5 },
              { month: '7月', value: 85.6 },
            ]}
            businessScenario="语音运营"
          />
          
          <DataInsightReports
            pageId="portal.voice-operations.tree"
          />
        </div>
      </div>
    </div>
  );
}

// 主页面组件
function VoiceOperationsPageContent() {
  // 语音运营页面的有效Tab值
  const validTabs = ['overview', 'voice-tree'];
  
  // 检测是否从工单返回
  const [isFromWorkOrder, setIsFromWorkOrder] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [isEditMode, setIsEditMode] = useState(false);

  // 检测是否从工单返回，并设置初始标签页
  const navSearchParams = useSearchParams();
  useEffect(() => {
    const fromWorkOrder = navSearchParams.get('fromWorkOrder') === 'true';
    setIsFromWorkOrder(fromWorkOrder);

    // 从工单返回时读取 hash
    if (fromWorkOrder && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      // 处理hash中可能包含的查询参数（如 #voice-tree?workOrderPanel=open）
      const hashTab = hash.split('?')[0];
      if (validTabs.includes(hashTab)) {
        setActiveTab(hashTab);
        console.log('[voice-operations] Initial tab from hash:', hashTab);
      }
    }
  }, [navSearchParams]);

  // 监听 URL hash 变化（从工单返回时响应）
  useEffect(() => {
    if (!isFromWorkOrder) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      // 处理hash中可能包含的查询参数
      const hashTab = hash.split('?')[0];
      if (validTabs.includes(hashTab)) {
        setActiveTab(hashTab);
        console.log('[voice-operations] Hash changed to:', hashTab);
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
    setActiveTab('voice-tree');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b">
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/portal/market/overview" className="hover:text-[#0066CC]">市场数智运营</Link>
          <span>/</span>
          <Link href="/portal/customer/retention" className="hover:text-[#0066CC]">存量运营</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">语音运营</span>
        </div>
      </div>

      {/* 顶部工具栏 */}
      <Card className="m-4 mb-0">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 左侧标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="h-9 bg-transparent p-0 gap-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                概览
              </TabsTrigger>
              <TabsTrigger value="voice-tree" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-8 px-4 rounded">
                全量语音运营客户
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 右侧工具按钮 */}
          <div className="flex items-center gap-3 ml-4">
            <Button variant="outline" size="sm">
              指标树模板
            </Button>

            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-[#0085D0] focus:outline-none min-w-[140px]"
            />

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
            <OverviewTab onJumpToTree={handleJumpToTree} />
          </TabsContent>

          <TabsContent value="voice-tree">
            <IndicatorTreeContent
              indicatorName="语音运营"
              selectedMonth={selectedMonth}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 工单面板 */}
      <Suspense fallback={null}>
        <WorkOrderPanel scenario="voice" />
      </Suspense>
    </div>
  );
}

export default function VoiceOperationsPage() {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <VoiceOperationsPageContent />
    </Suspense>
  );
}
