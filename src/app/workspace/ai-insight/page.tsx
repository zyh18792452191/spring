'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllConversations, getConversation, saveConversation, getCurrentConversationId, setCurrentConversationId, deleteConversation, archiveConversation, reopenConversation, renameConversation, createConversation, addArchivedOutput, type ConversationState, type ConversationMessage } from './lib/conversation-storage';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles, Send, FileText, Download, Plus, LayoutTemplate, FileUp,
  ChevronRight, Clock, CheckCircle, Edit3, Trash2, RotateCcw, PenLine,
  Activity, Search, TrendingUp, Users, Shield, Target, BarChart3,
  Home, Zap, Upload, X, ChevronDown, ChevronUp, FolderOpen, Loader2, Info, Database, GitBranch,
  MessageSquare, FileCheck, ListChecks, Eye, CheckCheck, MessageSquarePlus, GripVertical, PlusCircle, Square, MapPin, Crosshair, FileInput, Archive,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, FileSpreadsheet, LayoutDashboard,
  Copy, LayoutGrid, BookOpen, Bookmark, ExternalLink, Calendar, Lock
} from 'lucide-react';
import Link from 'next/link';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import ConversationList from './components/ConversationList';

/* ────────── 类型定义 ────────── */
type ChatRole = 'user' | 'system' | 'assistant';
type ChatState = '需求收集' | '数据准备' | '大纲确认' | '产出物生成' | '追问深化' | '已归档';
type ReportStatus = 'pending' | 'confirmed' | 'edited' | 'deleted';
type PageView = 'start' | 'report';

import { sharedReports } from './shared-template-data';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  component?: 'matchTable' | 'findingCard' | 'outlinePreview' | 'dataButtons' | 'dataUpload' | 'welcomeSuggestions' | 'suggestions' | 'templateSelect';
  componentData?: Record<string, unknown>;
}

type ChartType = 'bar' | 'line' | 'pie' | 'composed' | 'stacked-bar';

interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

interface ChartConfig {
  chartType: ChartType;
  data: ChartDataItem[];
  bars?: { key: string; color: string; name: string }[];
  lines?: { key: string; color: string; name: string }[];
  areas?: { key: string; color: string; name: string }[];
  pies?: { key: string; colors: string[]; name: string }[];
  height?: number;
}

/* ────────── 分析引擎算法类型 ────────── */
type AlgorithmType = 'descriptive' | 'time_trend' | 'group_comparison' | 'anomaly_detection';
interface AlgorithmSource {
  type: AlgorithmType;
  name: string;
  description: string;
}

const algorithmTypeConfig: Record<AlgorithmType, { label: string; color: string; icon: React.ReactNode }> = {
  descriptive: { label: '描述统计', color: 'bg-blue-100 text-blue-700', icon: <BarChart3 className="w-3 h-3" /> },
  time_trend: { label: '时间趋势', color: 'bg-emerald-100 text-emerald-700', icon: <TrendingUp className="w-3 h-3" /> },
  group_comparison: { label: '分组对比', color: 'bg-violet-100 text-violet-700', icon: <Users className="w-3 h-3" /> },
  anomaly_detection: { label: '异常检测', color: 'bg-amber-100 text-amber-700', icon: <Zap className="w-3 h-3" /> },
};

interface ReportSection {
  id: string;
  title: string;
  paragraphs: ({ id: string; content: string; type: 'text' | 'data'; status: ReportStatus; algorithmSource?: AlgorithmSource } | { id: string; content: string; type: 'chart'; chartConfig: ChartConfig; status: ReportStatus; algorithmSource?: AlgorithmSource })[];
}

interface TemplateItem {
  id: string;
  name: string;
  version: string;
  scene: string;
  tags: string[];
  reports: number;
  chapters: string[];
  dataNeeds: string;
}

/* ────────── 状态步骤配置 ────────── */
// 生成类型与导出格式映射
type GenerationType = 'report' | 'spreadsheet' | 'dashboard' | 'summary';
const exportFormatMap: Record<GenerationType, { label: string; value: string }[]> = {
  report: [
    { label: 'Word', value: 'word' },
    { label: 'PDF', value: 'pdf' },
  ],
  spreadsheet: [
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
  ],
  dashboard: [
    { label: '在线链接', value: 'online' },
    { label: 'PDF截图', value: 'pdf-screenshot' },
  ],
  summary: [
    { label: '文本', value: 'text' },
    { label: 'PDF', value: 'pdf' },
  ],
};

const stateSteps: { label: ChatState; icon: React.ReactNode }[] = [
  { label: '需求收集', icon: <Plus className="w-3.5 h-3.5" /> },
  { label: '数据准备', icon: <FileText className="w-3.5 h-3.5" /> },
  { label: '大纲确认', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
  { label: '产出物生成', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { label: '追问深化', icon: <Search className="w-3.5 h-3.5" /> },
];

/* ────────── 快捷洞察场景已删除，统一走AI洞察助手数据源选择入口 ────────── */

/* ────────── 模板数据 ────────── */
const templateList: TemplateItem[] = [
  { id: 't1', name: '月度经营分析报告', version: 'v2.1', scene: '月度经营分析', tags: ['月度', '经营分析'], reports: 8, chapters: ['整体经营概况', '重点指标分析', '归因分析', '区域对比', '策略建议'], dataNeeds: '需要8个核心指标，均可从平台获取' },
  { id: 't2', name: '专项分析报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '通用'], reports: 3, chapters: ['专项指标概览', '深度归因', '客群画像', '策略推荐'], dataNeeds: '需要4-6个专项指标，部分需上传' },
  { id: 't3', name: '季度回顾报告', version: 'v1.3', scene: '季度回顾', tags: ['季度', '经营分析'], reports: 2, chapters: ['季度总览', '趋势对比', '关键变化', '下季展望'], dataNeeds: '需要季度环比指标，平台获取' },
  { id: 't4', name: '流量运营专项分析', version: 'v1.2', scene: '专项分析', tags: ['专项', '流量运营'], reports: 5, chapters: ['流量指标概览', 'DOU归因', '5G渗透分析', '区域差异', '策略建议'], dataNeeds: '需要流量相关6个指标，平台获取' },
  { id: 't5', name: '宽带业务分析', version: 'v1.0', scene: '专项分析', tags: ['专项', '家庭运营'], reports: 1, chapters: ['宽带新增分析', '智家渗透', '融合转化', '竞品对比'], dataNeeds: '需要宽带指标4个，部分需上传' },
  { id: 't6', name: '风险预警报告', version: 'v1.1', scene: '风险预警', tags: ['风险预警', '通用'], reports: 4, chapters: ['预警概览', '风险归因', '影响评估', '处置建议'], dataNeeds: '需要预警相关指标，系统自动获取' },
  { id: 't7', name: '中高端客户保有报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '中高端客户运营'], reports: 2, chapters: ['保有率概览', '离网归因', '维系效果', '策略优化'], dataNeeds: '需要保有相关5个指标，平台获取' },
  { id: 't8', name: '区域攻坚复盘报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '区域攻坚'], reports: 1, chapters: ['攻坚目标达成', '工单执行分析', '小区画像', '经验总结'], dataNeeds: '需要攻坚指标，工单系统获取' },
  { id: 't9', name: '增量发展月度报告', version: 'v1.2', scene: '月度经营分析', tags: ['月度', '增量运营'], reports: 6, chapters: ['增量概览', '新入网分析', '携号转网', '渠道效果', '策略建议'], dataNeeds: '需要增量指标5个，平台获取' },
  { id: 't10', name: '家庭业务发展报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '家庭运营'], reports: 2, chapters: ['家庭用户概览', '融合套餐分析', '智家业务', '发展建议'], dataNeeds: '需要家庭业务指标4个，部分需上传' },
  { id: 't11', name: '收入波动归因报告', version: 'v1.1', scene: '专项分析', tags: ['专项', '收入分析'], reports: 3, chapters: ['收入概览', '波动归因', '收入结构', '提升策略'], dataNeeds: '需要收入相关6个指标，平台获取' },
  { id: 't12', name: '渠道效能分析报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '渠道分析'], reports: 1, chapters: ['渠道概览', '线上线下对比', '转化分析', '优化建议'], dataNeeds: '需要渠道指标4个，CRM系统获取' },
  { id: 't13', name: '季度经营回顾报告', version: 'v2.0', scene: '季度回顾', tags: ['季度', '经营分析'], reports: 4, chapters: ['季度经营总览', '核心指标趋势', '重点工程进展', '下季度规划'], dataNeeds: '需要季度汇总指标，平台获取' },
  { id: 't14', name: '5G发展专项报告', version: 'v1.3', scene: '专项分析', tags: ['专项', '5G'], reports: 5, chapters: ['5G用户发展', '5G流量分析', '5G终端分析', '5G网络质量', '发展建议'], dataNeeds: '需要5G相关指标7个，平台获取' },
  { id: 't15', name: '客户满意度分析报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '客户体验'], reports: 1, chapters: ['满意度概览', '投诉分析', '服务短板', '提升建议'], dataNeeds: '需要满意度指标3个，调查系统获取' },
  { id: 't16', name: '离网预警专项报告', version: 'v1.2', scene: '风险预警', tags: ['风险预警', '离网维系'], reports: 3, chapters: ['离网趋势', '高危客群识别', '预警规则效果', '维系建议'], dataNeeds: '需要离网相关指标5个，平台获取' },
  { id: 't17', name: '上半年经营回顾报告', version: 'v1.0', scene: '季度回顾', tags: ['半年度', '经营分析'], reports: 1, chapters: ['上半年总览', 'KPI达成', '重点事项', '下半年规划'], dataNeeds: '需要半年度汇总指标，平台获取' },
  { id: 't18', name: '套餐结构优化报告', version: 'v1.0', scene: '专项分析', tags: ['专项', '产品分析'], reports: 2, chapters: ['套餐分布', '低效套餐识别', '优化方案', '预期效果'], dataNeeds: '需要套餐指标4个，计费系统获取' },
  { id: 't19', name: '年度经营总结报告', version: 'v2.0', scene: '季度回顾', tags: ['年度', '经营分析'], reports: 1, chapters: ['年度经营总览', '核心指标达成', '重点工作回顾', '来年展望'], dataNeeds: '需要年度汇总指标，平台获取' },
  { id: 't20', name: '携号转网专项分析', version: 'v1.1', scene: '风险预警', tags: ['风险预警', '竞品分析'], reports: 2, chapters: ['携转概览', '净流入分析', '竞品对比', '挽留策略'], dataNeeds: '需要携转指标4个，信通院数据获取' },
];

/* ────────── 场景专属对话模板（AI对话引导，展示数据来源+用户选择权） ────────── */
function getScenarioMessages(scenarioTitle: string): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    {
      id: 'ms1', role: 'system' as ChatRole, content:
        `已为您启动【${scenarioTitle}】分析。\n\n根据场景特征，推荐以下报告大纲：\n\n1. 整体概览\n2. 核心指标分析\n3. 归因诊断\n4. 趋势预测\n5. 策略建议\n\n请确认大纲，或告诉我需要调整的内容。`,
      timestamp: now,
      component: 'outlinePreview' as const,
      componentData: { options: ['确认大纲，开始生成', '调整大纲结构', 'AI自动生成框架'] },
    },
  ];
}

/* ────────── 模板专属对话 ────────── */
function getTemplateMessages(templateName: string): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const template = templateList.find(t => t.name === templateName);
  const chapters = template ? template.chapters : ['整体概览', '指标分析', '归因分析', '策略建议'];
  return [
    { id: 'mt1', role: 'system' as ChatRole, content: `已加载"${templateName}"模板。\n\n模板定义的报告大纲如下：\n\n${chapters.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n请确认大纲，或告诉我需要调整的内容。`, timestamp: now, component: 'outlinePreview' as const, componentData: { options: ['确认大纲，开始生成', '调整大纲结构', '增加章节'] } },
  ];
}

/* ────────── 上传数据后对话 ────────── */
function getUploadDataMessages(fileName: string): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    { id: 'mu1', role: 'system' as ChatRole, content: `已上传文件"${fileName}"，数据自动识别完成。\n\n根据数据特征，推荐以下报告大纲：\n\n1. 数据概览\n2. 核心指标趋势分析\n3. 区域对比分析\n4. 异常检测与归因\n5. 策略建议\n\n请确认大纲，或告诉我需要调整的内容。`, timestamp: now, component: 'outlinePreview' as const, componentData: { options: ['确认大纲，开始生成', '调整大纲结构', 'AI自动生成框架'] } },
  ];
}

/* ────────── 空白需求收集对话（AI主动引导）────────── */
function getBlankMessages(): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    { id: 'mb1', role: 'system' as ChatRole, content: '您好！我是AI洞察助手，可以帮您生成分析报告、数据报表、数据看板或数据摘要。\n\n请告诉我您想分析什么，或直接点击下方入口快速开始：', timestamp: now, component: 'welcomeSuggestions' as const },
  ];
}

function getDataSourceMessages(sourceInfo: string): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    { id: 'ds1', role: 'system' as ChatRole, content: `已加载数据源：${sourceInfo}\n\n根据数据源特征，推荐以下报告大纲：\n\n1. 数据概览\n2. 核心指标分析\n3. 趋势与异常检测\n4. 策略建议\n\n请确认大纲，或告诉我需要调整的内容。`, timestamp: now, component: 'outlinePreview' as const, componentData: { options: ['确认大纲，开始生成', '调整大纲结构', 'AI自动生成框架'] } },
  ];
}

function getKnowledgeMessages(insightTitle: string): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const t2 = new Date(); t2.setMilliseconds(t2.getMilliseconds() + 800); const t2s = t2.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    { id: 'kn1', role: 'system' as ChatRole, content: `已引用洞察：**${insightTitle}**\n\n洞察摘要：该洞察基于大数据平台指标数据，通过因果推理引擎识别出关键业务异动模式，已完成置信度验证。\n\n📋 **洞察信息**\n• 洞察类型：指标异动归因\n• 验证状态：已验证\n• 数据来源：大数据平台指标数据\n• 关联指标：详见下方推荐大纲\n• 适用口径：新疆移动全省+16地市`, timestamp: now },
    { id: 'kn2', role: 'system' as ChatRole, content: '基于此洞察，我已为您推荐以下报告大纲，请确认后开始生成报告：', timestamp: t2s, component: 'outlinePreview' as const, componentData: { options: ['确认大纲，开始生成', '调整大纲结构', 'AI自动生成框架'] } },
  ];
}

function getImportReportMessages(): ChatMessage[] {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return [
    { id: 'imp1', role: 'assistant' as ChatRole, content: `您好！您选择了"导入报告"模式。\n\n我将帮您用历史报告的结构 + 新数据生成新报告。流程分三步：\n\n📌 第一步：上传旧报告 → 解析章节结构\n📌 第二步：确认/调整结构\n📌 第三步：提供新数据 → 生成报告\n\n现在开始第一步，请上传您的旧报告文件：`, timestamp: now },
    { id: 'imp2', role: 'assistant' as ChatRole, content: '', timestamp: now, component: 'dataUpload' as const, componentData: { title: '上传旧报告文件', description: '支持 .docx / .pdf 格式，系统将自动解析章节结构作为新报告模板', accept: '.docx,.pdf' } },
  ];
}

/* ────────── 模拟报告数据 ────────── */
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const mockReportSections: ReportSection[] = [
  {
    id: 's1', title: '一、整体经营概况',
    paragraphs: [
      { id: 'p1', content: '2026年6月，全疆出账用户数1,256万户，环比增长1.8%；移动ARPU 56.8元，环比下降3.2%；DOU 15.6GB，环比增长4.1%；总收入71.3亿元，环比下降1.5%。', type: 'text', status: 'pending', algorithmSource: { type: 'descriptive', name: '描述统计', description: '计算当月核心指标的环比变化率与绝对值' } },
      { id: 'p1-chart1', content: '核心指标环比变化', type: 'chart', chartConfig: {
        chartType: 'bar', height: 260,
        data: [
          { name: '出账用户(万户)', 当月: 1256, 上月: 1234 },
          { name: 'ARPU(元)', 当月: 56.8, 上月: 58.7 },
          { name: 'DOU(GB)', 当月: 15.6, 上月: 15.0 },
          { name: '总收入(亿元)', 当月: 71.3, 上月: 72.4 },
        ],
        bars: [{ key: '当月', color: '#3b82f6', name: '当月' }, { key: '上月', color: '#94a3b8', name: '上月' }],
      }, status: 'pending', algorithmSource: { type: 'group_comparison', name: '分组对比', description: '当月vs上月核心指标对比分析' } },
      { id: 'p2', content: '核心指标趋势：用户规模持续增长但收入下降，"增量不增收"特征明显。ARPU环比降幅超过近6个月均值（-1.8%），需重点关注。', type: 'text', status: 'pending', algorithmSource: { type: 'time_trend', name: '时间趋势', description: '近6个月ARPU趋势分析与环比均值对比' } },
      { id: 'p2-chart1', content: '近6个月ARPU趋势', type: 'chart', chartConfig: {
        chartType: 'line', height: 220,
        data: [
          { name: '1月', ARPU: 60.2 }, { name: '2月', ARPU: 59.8 }, { name: '3月', ARPU: 59.5 },
          { name: '4月', ARPU: 58.9 }, { name: '5月', ARPU: 58.7 }, { name: '6月', ARPU: 56.8 },
        ],
        lines: [{ key: 'ARPU', color: '#3b82f6', name: 'ARPU(元)' }],
      }, status: 'pending', algorithmSource: { type: 'time_trend', name: '时间趋势', description: '6个月ARPU折线趋势图' } },
    ],
  },
  {
    id: 's2', title: '二、重点指标分析',
    paragraphs: [
      { id: 'p3', content: 'ARPU异动分析：56.8元（环比-3.2%），降幅主要来自低价值套餐用户占比上升（+2.3pp），贡献度62%。5G用户ARPU（68.2元）仍高于4G用户（48.5元），但5G新增用户ARPU仅28-35元，拉低整体水平。', type: 'text', status: 'pending', algorithmSource: { type: 'anomaly_detection', name: '异常检测', description: 'ARPU环比降幅超出6个月均值1.4个标准差，触发异常告警' } },
      { id: 'p3-chart1', content: 'ARPU结构对比', type: 'chart', chartConfig: {
        chartType: 'bar', height: 240,
        data: [
          { name: '5G用户', ARPU: 68.2 }, { name: '4G用户', ARPU: 48.5 },
          { name: '5G新增用户', ARPU: 31.5 }, { name: '整体', ARPU: 56.8 },
        ],
        bars: [{ key: 'ARPU', color: '#3b82f6', name: 'ARPU(元)' }],
      }, status: 'pending', algorithmSource: { type: 'group_comparison', name: '分组对比', description: '5G/4G/新增用户ARPU分组对比' } },
      { id: 'p4', content: 'DOU增长分析：15.6GB（环比+4.1%），增长主要由5G用户驱动。5G用户DOU（22.3GB）是4G用户（9.8GB）的2.3倍，5G渗透率提升带动整体DOU上升。', type: 'text', status: 'pending', algorithmSource: { type: 'descriptive', name: '描述统计', description: 'DOU环比变化率及5G/4G分组统计' } },
      { id: 'p4-chart1', content: 'DOU月度趋势（5G vs 4G）', type: 'chart', chartConfig: {
        chartType: 'composed', height: 260,
        data: [
          { name: '1月', '5G_DOU': 20.1, '4G_DOU': 9.2, 整体DOU: 13.8 },
          { name: '2月', '5G_DOU': 20.8, '4G_DOU': 9.4, 整体DOU: 14.1 },
          { name: '3月', '5G_DOU': 21.2, '4G_DOU': 9.5, 整体DOU: 14.5 },
          { name: '4月', '5G_DOU': 21.7, '4G_DOU': 9.6, 整体DOU: 14.9 },
          { name: '5月', '5G_DOU': 22.0, '4G_DOU': 9.7, 整体DOU: 15.0 },
          { name: '6月', '5G_DOU': 22.3, '4G_DOU': 9.8, 整体DOU: 15.6 },
        ],
        bars: [{ key: '5G_DOU', color: '#3b82f6', name: '5G DOU(GB)' }, { key: '4G_DOU', color: '#94a3b8', name: '4G DOU(GB)' }],
        lines: [{ key: '整体DOU', color: '#ef4444', name: '整体DOU(GB)' }],
      }, status: 'pending', algorithmSource: { type: 'time_trend', name: '时间趋势', description: '5G/4G DOU 6个月趋势叠加对比' } },
    ],
  },
  {
    id: 's3', title: '三、归因分析',
    paragraphs: [
      { id: 'p5', content: 'ARPU下降归因（五层归因体系）：\n\n• 分解归因（L1）：低价值套餐用户占比+2.3pp，贡献度62%\n• 对比归因（L2）：与上月相比，新增用户ARPU下降12.5%\n• 区域归因（L3）：乌鲁木齐、喀什降幅最大（-5.1%、-8.7%）\n• 客群归因（L4）：5G基础套餐新入网用户占新增62%，ARPU仅28-35元\n• 因果推断（L5）：5G基础套餐推广策略→低价值用户占比上升→ARPU下降（置信度：高）', type: 'text', status: 'pending', algorithmSource: { type: 'anomaly_detection', name: '异常检测', description: 'ARPU环比-3.2%触发异常，执行五层归因体系下钻分析' } },
      { id: 'p5-chart1', content: 'ARPU下降归因贡献度', type: 'chart', chartConfig: {
        chartType: 'bar', height: 220,
        data: [
          { name: '低价值套餐占比上升', 贡献度: 62 },
          { name: '新增用户ARPU下降', 贡献度: 18 },
          { name: '存量用户降档', 贡献度: 12 },
          { name: '其他因素', 贡献度: 8 },
        ],
        bars: [{ key: '贡献度', color: '#f59e0b', name: '贡献度(%)' }],
      }, status: 'pending', algorithmSource: { type: 'group_comparison', name: '分组对比', description: '归因因素贡献度分解排序' } },
    ],
  },
  {
    id: 's4', title: '四、区域对比',
    paragraphs: [
      { id: 'p6', content: '全疆16地市ARPU排名：克拉玛依72.3元（+0.5%）、乌鲁木齐62.3元（-5.1%）、石河子59.1元（-1.2%）。降幅最大的3个地市：喀什（-8.7%）、乌鲁木齐（-5.1%）、和田（-4.3%），建议重点关注。', type: 'text', status: 'pending', algorithmSource: { type: 'group_comparison', name: '分组对比', description: '16地市ARPU排名与环比变化对比' } },
      { id: 'p6-chart1', content: '各地市ARPU及环比变化', type: 'chart', chartConfig: {
        chartType: 'composed', height: 300,
        data: [
          { name: '克拉玛依', ARPU: 72.3, 环比: 0.5 }, { name: '乌鲁木齐', ARPU: 62.3, 环比: -5.1 },
          { name: '石河子', ARPU: 59.1, 环比: -1.2 }, { name: '昌吉', ARPU: 58.6, 环比: -2.3 },
          { name: '伊犁', ARPU: 56.2, 环比: -0.8 }, { name: '塔城', ARPU: 54.8, 环比: -1.5 },
          { name: '哈密', ARPU: 53.1, 环比: -0.3 }, { name: '博州', ARPU: 51.7, 环比: -2.8 },
          { name: '巴州', ARPU: 50.3, 环比: -1.9 }, { name: '阿克苏', ARPU: 49.6, 环比: -3.2 },
          { name: '吐鲁番', ARPU: 48.2, 环比: -0.6 }, { name: '阿勒泰', ARPU: 47.5, 环比: -1.1 },
          { name: '奎屯', ARPU: 46.8, 环比: -2.4 }, { name: '和田', ARPU: 44.1, 环比: -4.3 },
          { name: '克州', ARPU: 42.3, 环比: -1.7 }, { name: '喀什', ARPU: 40.6, 环比: -8.7 },
        ],
        bars: [{ key: 'ARPU', color: '#3b82f6', name: 'ARPU(元)' }],
        lines: [{ key: '环比', color: '#ef4444', name: '环比(%)' }],
      }, status: 'pending', algorithmSource: { type: 'group_comparison', name: '分组对比', description: '16地市ARPU与环比双维度对比排序' } },
      { id: 'p6-chart2', content: '地市收入占比', type: 'chart', chartConfig: {
        chartType: 'pie', height: 280,
        data: [
          { name: '乌鲁木齐', value: 22.5 }, { name: '克拉玛依', value: 12.3 }, { name: '喀什', value: 8.7 },
          { name: '伊犁', value: 8.2 }, { name: '昌吉', value: 7.8 }, { name: '阿克苏', value: 7.1 },
          { name: '巴州', value: 6.5 }, { name: '其他', value: 26.9 },
        ],
        pies: [{ key: 'value', colors: CHART_COLORS, name: '收入占比(%)' }],
      }, status: 'pending', algorithmSource: { type: 'descriptive', name: '描述统计', description: '各地市收入占比分布' } },
    ],
  },
  {
    id: 's5', title: '五、策略建议',
    paragraphs: [
      { id: 'p7', content: '1. 调整5G基础套餐定价策略，39元档考虑提升至49元并增加流量包\n2. 针对乌鲁木齐、喀什开展ARPU专项提升攻坚\n3. 推动低价值用户向中高端套餐迁转，目标迁转率提升5pp\n4. 加强存量用户价值经营，推出DOU达量加速包', type: 'text', status: 'pending', algorithmSource: { type: 'descriptive', name: '描述统计', description: '基于归因分析结论综合推演策略建议' } },
      { id: 'p7-chart1', content: '策略预期效果', type: 'chart', chartConfig: {
        chartType: 'stacked-bar', height: 220,
        data: [
          { name: '套餐提价', '直接增收': 1.2, 'ARPU提升': 0.8 },
          { name: '区域攻坚', '直接增收': 0.9, 'ARPU提升': 0.6 },
          { name: '套餐迁转', '直接增收': 0.7, 'ARPU提升': 1.1 },
          { name: 'DOU加速包', '直接增收': 0.5, 'ARPU提升': 0.3 },
        ],
        bars: [{ key: '直接增收', color: '#3b82f6', name: '直接增收(亿元)' }, { key: 'ARPU提升', color: '#10b981', name: 'ARPU提升(元)' }],
      }, status: 'pending', algorithmSource: { type: 'descriptive', name: '描述统计', description: '策略效果预估叠加对比' } },
    ],
  },
];

/* ────────── 子组件：匹配表格 ────────── */
function MatchTable({ data, onBatchConfirm, onModify }: { data: { items: { name: string; source: string; confidence: 'high' | 'medium' | 'low' }[] }; onBatchConfirm: () => void; onModify: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden text-sm">
      <table className="w-full">
        <thead><tr className="bg-muted/50"><th className="px-3 py-1.5 text-left text-xs">指标</th><th className="px-3 py-1.5 text-left text-xs">数据来源</th><th className="px-3 py-1.5 text-left text-xs">置信度</th></tr></thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-t"><td className="px-3 py-1.5">{item.name}</td><td className="px-3 py-1.5 text-xs text-muted-foreground">{item.source}</td>
              <td className="px-3 py-1.5"><Badge variant="outline" className={`text-xs h-5 ${item.confidence === 'high' ? 'bg-emerald-50 text-emerald-700' : item.confidence === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{item.confidence === 'high' ? '高' : item.confidence === 'medium' ? '中' : '低'}</Badge></td></tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 border-t flex gap-2">
        <Button size="sm" className="h-6 text-xs" onClick={onBatchConfirm}>批量确认高置信度</Button>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={onModify}>逐条修改</Button>
      </div>
    </div>
  );
}

/* ────────── 子组件：关键发现卡 ────────── */
function FindingCard({ data, onEmbed, showEmbed = true, typeLabel = '报告' }: { data: { conclusion: string; confidence: 'high' | 'medium' | 'low'; details: string[] }; onEmbed: () => void; showEmbed?: boolean; typeLabel?: string }) {
  const [embedded, setEmbedded] = useState(false);
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2"><Badge variant="outline" className={`text-xs h-5 ${data.confidence === 'high' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>置信度：{data.confidence === 'high' ? '高' : data.confidence === 'medium' ? '中' : '低'}</Badge><span className="text-sm font-medium">{data.conclusion}</span></div>
      <ul className="text-xs text-muted-foreground space-y-0.5 mb-2">{data.details.map((d, i) => <li key={i}>• {d}</li>)}</ul>
      <div className="flex gap-2">
        {showEmbed && !embedded && <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => { onEmbed(); setEmbedded(true); }}>嵌入{typeLabel}</Button>}
        {embedded && <Badge className="h-6 text-xs bg-emerald-50 text-emerald-700">已嵌入{typeLabel}</Badge>}
      </div>
    </div>
  );
}

/* ────────── 子组件：状态标签（归档制：简化为内容/已编辑/已删除） ────────── */
function StatusBadge({ status }: { status: ReportStatus }) {
  const map = {
    pending: { label: '内容', cls: 'bg-muted text-muted-foreground border-border' },
    confirmed: { label: '内容', cls: 'bg-muted text-muted-foreground border-border' },
    edited: { label: '已编辑', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    deleted: { label: '已删除', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  };
  const m = map[status] || map.pending;
  return <Badge variant="outline" className={`text-xs h-5 px-1.5 ${m.cls}`}>{m.label}</Badge>;
}

/* ────────── 子组件：导出弹窗（按生成类型过滤格式） ────────── */
function ExportDialog({ onClose, onExport, generationType }: { onClose: () => void; onExport: (format: string) => void; generationType: GenerationType }) {
  const allFormats = [
    { key: 'word', label: '报告（Word）', desc: '.docx格式，完整分析报告，可编辑', icon: <FileText className="w-4 h-4" />, types: ['report'] },
    { key: 'pdf', label: '报告（PDF）', desc: '.pdf格式，正式归档用途', icon: <FileText className="w-4 h-4" />, types: ['report', 'summary'] },
    { key: 'excel', label: 'Excel数据表格', desc: '.xlsx格式，指标明细数据，可二次计算', icon: <Database className="w-4 h-4" />, types: ['spreadsheet'] },
    { key: 'csv', label: 'CSV文件', desc: '.csv格式，通用数据格式，兼容性强', icon: <Database className="w-4 h-4" />, types: ['spreadsheet'] },
    { key: 'text', label: '文本文件', desc: '核心发现与结论，精简版文本', icon: <FileCheck className="w-4 h-4" />, types: ['summary'] },
    { key: 'dashboard-link', label: '在线看板链接', desc: '在线交互看板，可分享链接', icon: <Activity className="w-4 h-4" />, types: ['dashboard'] },
    { key: 'dashboard-pdf', label: '看板PDF截图', desc: '看板页面PDF截图，适合汇报', icon: <Activity className="w-4 h-4" />, types: ['dashboard'] },
  ];
  const filteredFormats = allFormats.filter(f => f.types.includes(generationType));
  const typeNames: Record<GenerationType, string> = { report: '洞察报告', spreadsheet: '数据报表', dashboard: '数据看板', summary: '数据摘要' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[420px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b"><h3 className="font-medium">导出为 — {typeNames[generationType]}</h3><Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button></div>
        <div className="p-5 space-y-3">
          {filteredFormats.map(f => (
            <button key={f.key} onClick={() => onExport(f.key)} className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors text-left">
              <div className="shrink-0 text-primary">{f.icon}</div>
              <div><div className="text-sm font-medium">{f.label}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
            </button>
          ))}
        </div>
        <div className="px-5 py-3 border-t flex justify-end"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
      </div>
    </div>
  );
}

/* ────────── 子组件：上传数据弹窗 ────────── */
function UploadDataDialog({ onClose, onUpload }: { onClose: () => void; onUpload: (fileName: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('2026-06');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[520px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium">上传数据创建报告</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : uploadedFile ? 'border-emerald-400 bg-emerald-50' : 'border-muted-foreground/25 hover:border-primary/50'}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div>
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-medium">{uploadedFile}</div>
                <div className="text-xs text-muted-foreground mt-1">文件已选择，点击下方"开始分析"继续</div>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <div className="text-sm font-medium">拖拽文件到此处，或点击选择</div>
                <div className="text-xs text-muted-foreground mt-1">支持 CSV、XLSX、XLS 格式</div>
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" id="file-upload" onChange={handleFileSelect} />
                <Button variant="outline" size="sm" className="mt-3" onClick={() => document.getElementById('file-upload')?.click()}>选择文件</Button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">数据时间范围</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2026年6月">2026年6月</SelectItem>
                <SelectItem value="2026年5月">2026年5月</SelectItem>
                <SelectItem value="2026年Q2">2026年Q2</SelectItem>
                <SelectItem value="2026年H1">2026年H1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 inline mr-1" />
            上传后，AI将自动识别数据内容，推荐合适的报告模板，或自动生成分析框架。
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" disabled={!uploadedFile} onClick={() => uploadedFile && onUpload(uploadedFile)}>开始分析</Button>
        </div>
      </div>
    </div>
  );
}

/* ────────── 子组件：模板选择弹窗 ────────── */
type ProcessStepStatus = 'completed' | 'running' | 'waiting';
type ProcessStep = { label: string; status: ProcessStepStatus; logs: string[]; algorithms: { type: AlgorithmType; name: string; status: ProcessStepStatus; detail: string }[] };

function TemplateSelectDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (template: TemplateItem) => void }) {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reportTitle, setReportTitle] = useState('');
  const [reportPeriod, setReportPeriod] = useState('2026年6月');
  const [periodType, setPeriodType] = useState<'月度' | '季度' | '半年' | '年度'>('月度');
  const [reportRegion, setReportRegion] = useState('全疆');
  const [regionValue, setRegionValue] = useState<{ cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean }>({ isProvince: true });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const allTags = Array.from(new Set(templateList.flatMap(t => t.tags)));
  const categories = ['全部', ...allTags];

  const filteredTemplates = templateList.filter(t => {
    const matchSearch = !searchText || t.name.includes(searchText) || t.tags.some(tag => tag.includes(searchText));
    const matchCategory = activeCategory === '全部' || t.tags.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchText, activeCategory]);

  useEffect(() => {
    if (selectedTemplate && !reportTitle) {
      setReportTitle(selectedTemplate.name + ' - ' + reportPeriod);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl border flex flex-col" style={{ width: step === 1 ? 560 : 480, maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">从模板创建报告</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</span>
              <span>选择模板</span>
              <ChevronRight className="w-3 h-3" />
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</span>
              <span>填写信息</span>
              <ChevronRight className="w-3 h-3" />
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</span>
              <span>确认创建</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        {step === 1 && (
          <>
            <div className="px-5 py-3 border-b space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="搜索模板名称或场景..." className="pl-9 h-9 text-sm" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">没有找到匹配的模板</div>
              ) : (
                paginatedTemplates.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t)} className={`w-full flex items-start justify-between px-4 py-3 border rounded-lg transition-colors text-left ${selectedTemplate?.id === t.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        <Badge variant="outline" className="text-xs h-5 px-1.5">{t.version}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.tags.join(' · ')} · 已生成{t.reports}份报告</div>
                      {selectedTemplate?.id === t.id && (
                        <div className="mt-2 pt-2 border-t space-y-1.5">
                          <div className="text-xs"><span className="font-medium">章节结构：</span>{t.chapters.join(' → ')}</div>
                          <div className="text-xs"><span className="font-medium">数据需求：</span>{t.dataNeeds}</div>
                        </div>
                      )}
                    </div>
                    {selectedTemplate?.id === t.id ? (
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>
            {filteredTemplates.length > pageSize && (
              <div className="px-5 py-2 border-t flex items-center justify-between shrink-0 text-xs text-muted-foreground">
                <span>共{filteredTemplates.length}个模板，当前显示{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredTemplates.length)}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
                  <span className="px-2">{currentPage}/{totalPages}</span>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
                </div>
              </div>
            )}
            <div className="px-5 py-3 border-t flex justify-end gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
              <Button size="sm" disabled={!selectedTemplate} onClick={() => setStep(2)}>下一步</Button>
            </div>
          </>
        )}

        {step === 2 && selectedTemplate && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <span className="font-medium">已选模板：</span>{selectedTemplate.name} {selectedTemplate.version}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">报告标题 <span className="text-red-500">*</span></label>
                <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="输入报告标题" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">周期类型</label>
                  <Select value={periodType} onValueChange={(v) => {
                    const t = v as '月度' | '季度' | '半年' | '年度';
                    setPeriodType(t);
                    if (t === '月度') setReportPeriod('2026年6月');
                    else if (t === '季度') setReportPeriod('2026年Q2');
                    else if (t === '半年') setReportPeriod('2026年H1');
                    else setReportPeriod('2026年');
                  }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="月度">月度</SelectItem>
                      <SelectItem value="季度">季度</SelectItem>
                      <SelectItem value="半年">半年</SelectItem>
                      <SelectItem value="年度">年度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{periodType}选择</label>
                  {periodType === '月度' && (
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026年6月">2026年6月</SelectItem>
                        <SelectItem value="2026年5月">2026年5月</SelectItem>
                        <SelectItem value="2026年4月">2026年4月</SelectItem>
                        <SelectItem value="2026年3月">2026年3月</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {periodType === '季度' && (
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026年Q2">2026年Q2</SelectItem>
                        <SelectItem value="2026年Q1">2026年Q1</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {periodType === '半年' && (
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026年H1">2026年H1</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {periodType === '年度' && (
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026年">2026年</SelectItem>
                        <SelectItem value="2025年">2025年</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">区域范围</label>
                <XinjiangRegionSelector
                  value={regionValue}
                  onChange={(_cityCode, cityName, _districtCode, _districtName, _gridCode, gridName, isProvince) => {
                    setRegionValue({ cityCode: _cityCode, districtCode: _districtCode, gridCode: _gridCode, isProvince });
                    setReportRegion(isProvince ? '全疆' : gridName || cityName);
                  }}
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-between shrink-0">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>上一步</Button>
              <Button size="sm" disabled={!reportTitle.trim()} onClick={() => setStep(3)}>下一步</Button>
            </div>
          </>
        )}

        {step === 3 && selectedTemplate && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">报告信息确认</h4>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-muted-foreground">报告标题：</span>{reportTitle}</div>
                  <div><span className="text-muted-foreground">使用模板：</span>{selectedTemplate.name} {selectedTemplate.version}</div>
                  <div><span className="text-muted-foreground">报告周期：</span>{reportPeriod}</div>
                  <div><span className="text-muted-foreground">区域范围：</span>{reportRegion}</div>
                  <div><span className="text-muted-foreground">章节结构：</span>{selectedTemplate.chapters.join('、')}</div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 inline mr-1" />
                创建后将进入报告生成流程，AI将按模板结构自动采集指标数据并生成分析报告。
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-between shrink-0">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>上一步</Button>
              <Button size="sm" onClick={() => onSelect(selectedTemplate)}>确认创建</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────── 子组件：图表渲染 ────────── */
function ChartRenderer({ config }: { config: ChartConfig }) {
  const chartContent = (() => {
    if (config.chartType === 'bar') {
      return (
        <BarChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <RechartsTooltip contentStyle={{ fontSize: 12 }} />
          {config.bars?.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      );
    }
    if (config.chartType === 'line') {
      return (
        <LineChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <RechartsTooltip contentStyle={{ fontSize: 12 }} />
          {config.lines?.map((line) => (
            <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      );
    }
    if (config.chartType === 'pie') {
      return (
        <PieChart>
          <Pie data={config.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} fontSize={11}>
            {config.data.map((_: ChartDataItem, i: number) => (
              <Cell key={i} fill={config.pies?.[0]?.colors?.[i] || CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip contentStyle={{ fontSize: 12 }} />
        </PieChart>
      );
    }
    if (config.chartType === 'composed') {
      return (
        <ComposedChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <RechartsTooltip contentStyle={{ fontSize: 12 }} />
          {config.bars?.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[2, 2, 0, 0]} />
          ))}
          {config.lines?.map((line) => (
            <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </ComposedChart>
      );
    }
    if (config.chartType === 'stacked-bar') {
      return (
        <BarChart data={config.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <RechartsTooltip contentStyle={{ fontSize: 12 }} />
          {config.bars?.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} stackId="a" />
          ))}
        </BarChart>
      );
    }
    return <BarChart data={config.data}><Bar dataKey="value" /></BarChart>;
  })();

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartContent}
    </ResponsiveContainer>
  );
}

/* ────────── 初始欢迎页面 ────────── */
function StartPage({ onStartFromScratch, onStartFromTemplate, onStartFromUpload, onStartFromImport, onOpenReport }: {
  onStartFromScratch: () => void;
  onStartFromTemplate: () => void;
  onStartFromUpload: () => void;
  onStartFromImport: () => void;
  onOpenReport: (reportId: string, mode: 'edit' | 'followup', step?: string) => void;
}) {
  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      <div className="border-b px-6 py-3 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-semibold">AI洞察助手</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto px-6 py-8">
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">智能洞察</span>
                </div>
                <h2 className="text-xl font-semibold mb-1">您好，我是AI洞察助手</h2>
                <p className="text-muted-foreground text-sm">我可以帮您生成洞察报告、分析指标异动、执行多维度归因分析。选择下方入口快速开始，或在对话中描述您的需求。</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium">创建报告</h3></div>
            <div className="grid grid-cols-4 gap-4">
              <button onClick={onStartFromScratch} className="group border rounded-xl p-5 text-left hover:border-primary hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-100"><Plus className="w-5 h-5" /></div>
                <div className="font-medium text-sm mb-1">新建报告</div>
                <div className="text-xs text-muted-foreground">从零开始，对话中描述需求，AI为您生成报告</div>
              </button>
              <button onClick={onStartFromTemplate} className="group border rounded-xl p-5 text-left hover:border-primary hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-100"><LayoutTemplate className="w-5 h-5" /></div>
                <div className="font-medium text-sm mb-1">从模板创建</div>
                <div className="text-xs text-muted-foreground">选择已有模板，快速配置生成报告</div>
              </button>
              <button onClick={onStartFromUpload} className="group border rounded-xl p-5 text-left hover:border-primary hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-100"><FileUp className="w-5 h-5" /></div>
                <div className="font-medium text-sm mb-1">从上传数据创建</div>
                <div className="text-xs text-muted-foreground">上传Excel/CSV文件，AI自动识别并生成报告</div>
              </button>
              <button onClick={onStartFromImport} className="group border rounded-xl p-5 text-left hover:border-primary hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-100"><FileInput className="w-5 h-5" /></div>
                <div className="font-medium text-sm mb-1">导入报告</div>
                <div className="text-xs text-muted-foreground">上传历史报告Word/PDF，复用结构用新数据生成</div>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">最近报告</h3>
              <Link href="/workspace/ai-insight/reports" className="text-xs text-primary hover:underline">查看全部</Link>
            </div>
            <div className="space-y-2">
              {[
                { title: '6月经营分析报告', status: 'draft' as const, statusLabel: '草稿', time: '06-28 14:30', id: 'r1' },
                { title: '5月经营分析报告', status: 'final' as const, statusLabel: '已定稿', time: '05-30 16:20', id: 'r2' },
                { title: '5G渗透率专项分析', status: 'draft' as const, statusLabel: '修改中', time: '06-25 10:15', id: 'r3' },
              ].map((r) => {
                const mode = r.status === 'final' ? 'followup' as const : 'edit' as const;
                const step = undefined;
                return (
                  <button key={r.id} onClick={() => onOpenReport(r.id, mode, step)} className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{r.title}</span>
                      <Badge variant="outline" className={`text-xs h-5 px-1.5 ${r.status === 'draft' ? 'bg-amber-50 text-amber-700' : r.status === 'final' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{r.statusLabel}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{r.time}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-center text-muted-foreground/60 mt-1.5">内容由AI生成，仅供参考</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── 大纲数据 ────────── */
const outlineData = [
  { chapter: '一', title: '核心指标概览', editable: true, sections: ['关键指标完成情况', '同比环比变化', '核心指标趋势'] },
  { chapter: '二', title: '分解归因分析', editable: true, sections: ['收入波动归因', '流量增长归因', '客户变动归因'] },
  { chapter: '三', title: '区域对比分析', editable: true, sections: ['各地市指标对比', '区域排名变化', '区域差异归因'] },
  { chapter: '四', title: '客群分析', editable: true, sections: ['目标客群画像', '客群行为特征', '客群价值分层'] },
  { chapter: '五', title: '策略建议', editable: true, sections: ['短期行动建议', '中长期优化方向', '预期效果评估'] },
];

/* ────────── 数据源弹窗内部组件（搜索+筛选+分页） ────────── */

const BUSINESS_SCENARIOS = ['全部', '流量运营', '中高端客户运营', '离网维系', '家庭融合运营', '国际业务运营', '增量运营'];

function DialogSearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || '搜索...'} className="pl-8 h-8 text-sm" />
      {value && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => onChange('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
    </div>
  );
}

function DialogPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-xs text-muted-foreground">第 {page}/{totalPages} 页</span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>下一页</Button>
      </div>
    </div>
  );
}

function ScenarioFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {BUSINESS_SCENARIOS.map(s => (
        <button key={s} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${value === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`} onClick={() => onChange(s)}>{s}</button>
      ))}
    </div>
  );
}

// ── 数据集弹窗 ──
function DatasetDialogInner({ dataSourceCategory, addSystemMessage, setSelectedDataSources, setDataSourceCategory, onClose }: {
  dataSourceCategory: string | null; addSystemMessage: (msg: string) => void; setSelectedDataSources: React.Dispatch<React.SetStateAction<{ type: string; name: string; detail?: string }[]>>; setDataSourceCategory: React.Dispatch<React.SetStateAction<string | null>>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('全部');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const allDatasets = [
    { name: '经营分析数据集', files: 9, size: '2.23 MB', date: '2026-06-30', scenario: '流量运营' },
    { name: '客户分析数据集', files: 4, size: '1.8 MB', date: '2026-06-28', scenario: '中高端客户运营' },
    { name: '结算汇集维度分析', files: 4, size: '2.04 MB', date: '2026-06-30', scenario: '流量运营' },
    { name: '市场竞品数据集', files: 3, size: '1.2 MB', date: '2026-06-25', scenario: '流量运营' },
    { name: '离网预警数据集', files: 7, size: '3.1 MB', date: '2026-06-20', scenario: '离网维系' },
    { name: '家庭融合运营数据集', files: 5, size: '1.9 MB', date: '2026-06-18', scenario: '家庭融合运营' },
    { name: '国际业务数据集', files: 3, size: '0.8 MB', date: '2026-06-15', scenario: '国际业务运营' },
    { name: '增量市场数据集', files: 6, size: '2.5 MB', date: '2026-06-12', scenario: '增量运营' },
    { name: '中高端客户画像数据集', files: 8, size: '4.2 MB', date: '2026-06-10', scenario: '中高端客户运营' },
    { name: '5G用户分析数据集', files: 5, size: '2.1 MB', date: '2026-06-08', scenario: '流量运营' },
  ];
  const filtered = allDatasets.filter(d => (scenario === '全部' || d.scenario === scenario) && (!search || d.name.includes(search)));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="space-y-2 mb-2">
        <DialogSearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="搜索数据集名称..." />
        <ScenarioFilter value={scenario} onChange={v => { setScenario(v); setPage(1); }} />
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {paged.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">无匹配数据集</p>}
        {paged.map(ds => (
          <Card key={ds.name} className={`cursor-pointer hover:border-primary/50 transition-colors ${dataSourceCategory && dataSourceCategory !== 'dataset' ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => { if (dataSourceCategory && dataSourceCategory !== 'dataset') { addSystemMessage(`当前已选择其他类别数据源，无法混选数据集。如需更换请先移除已选数据源。`); return; } setSelectedDataSources(prev => [...prev, { type: 'dataset', name: ds.name, detail: `${ds.files}个文件` }]); setDataSourceCategory('dataset'); onClose(); addSystemMessage(`已选择数据集"${ds.name}"（${ds.files}个文件，${ds.size}）。您可以继续选择同数据集内其他文件，或点击"确认数据"按钮进入下一步。`); }}>
            <CardContent className="p-3 flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1"><div className="text-sm font-medium">{ds.name}</div><div className="text-xs text-muted-foreground">{ds.files}个文件 · {ds.size} · {ds.date}</div></div>
              <Badge variant="outline" className="text-[10px] h-4">{ds.scenario}</Badge>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
      <DialogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <div className="border-t pt-3 mt-2">
        <div className="text-xs text-muted-foreground mb-2">或上传新文件</div>
        <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors text-sm text-muted-foreground ${dataSourceCategory && dataSourceCategory !== 'dataset' ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" /><span>点击上传 Excel/CSV 文件（≤10MB）</span>
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (dataSourceCategory && dataSourceCategory !== 'dataset') { addSystemMessage('当前已选择其他类别数据源，无法混选数据集文件。'); e.target.value = ''; return; } if (file.size > 10 * 1024 * 1024) { addSystemMessage('文件超过10MB限制。'); e.target.value = ''; return; } const ext = file.name.split('.').pop()?.toLowerCase(); if (!['xlsx', 'xls', 'csv'].includes(ext || '')) { addSystemMessage('仅支持Excel/CSV格式。'); e.target.value = ''; return; } const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`; setSelectedDataSources(prev => [...prev, { type: 'dataset', name: `用户上传-${file.name}`, detail: sizeStr }]); setDataSourceCategory('dataset'); onClose(); addSystemMessage(`已上传文件"${file.name}"（${sizeStr}），已归入数据源管理。`); e.target.value = ''; }} />
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
    </>
  );
}

// ── 平台指标弹窗 ──
function IndicatorDialogInner({ dataSourceCategory, addSystemMessage, setSelectedDataSources, setDataSourceCategory, onClose }: {
  dataSourceCategory: string | null; addSystemMessage: (msg: string) => void; setSelectedDataSources: React.Dispatch<React.SetStateAction<{ type: string; name: string; detail?: string }[]>>; setDataSourceCategory: React.Dispatch<React.SetStateAction<string | null>>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('全部');
  const allModules = [
    { module: '大市场关键指标', scenario: '流量运营', indicators: ['主营业务收入', 'ARPU', 'MOU', 'DOU', '累计出账用户数', '本月新增用户数', '5G渗透率', '收入同比增长率'] },
    { module: '流量运营指标', scenario: '流量运营', indicators: ['流量收入', '户均流量(DOU)', '流量达量率', '不限量套餐用户占比', '4G流量占比', '5G流量占比'] },
    { module: '中高端运营指标', scenario: '中高端客户运营', indicators: ['全球通保有率', '中高端客户保有率', '中高端ARPU', '中高端离网率', '全球通净增用户数', '中高端客户满意度'] },
    { module: '离网维系指标', scenario: '离网维系', indicators: ['离网率', '维系成功率', '预警准确率', '维系覆盖率', '主动离网占比', '被动离网占比'] },
    { module: '家庭融合运营指标', scenario: '家庭融合运营', indicators: ['家庭客户数', '融合套餐渗透率', '宽带ARPU', '家庭增值业务收入', '家庭成员绑定率'] },
    { module: '国际业务指标', scenario: '国际业务运营', indicators: ['国际漫游收入', '出境漫游用户数', '国际来话接通率', '跨境流量收入', '国际业务ARPU'] },
    { module: '增量运营指标', scenario: '增量运营', indicators: ['新增用户数', '新增用户ARPU', '渠道获客成本', '新用户3月留存率', '携号转网净增'] },
  ];
  const filtered = allModules.filter(m => (scenario === '全部' || m.scenario === scenario) && (!search || m.indicators.some(i => i.includes(search)) || m.module.includes(search)));
  const [checkedIndicators, setCheckedIndicators] = useState<Set<string>>(new Set());
  const toggleCheck = (ind: string) => {
    setCheckedIndicators(prev => { const next = new Set(prev); if (next.has(ind)) next.delete(ind); else next.add(ind); return next; });
  };
  return (
    <>
      <div className="space-y-2 mb-2">
        <DialogSearchBar value={search} onChange={setSearch} placeholder="搜索指标名称..." />
        <ScenarioFilter value={scenario} onChange={v => { setScenario(v); setCheckedIndicators(new Set()); }} />
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">无匹配指标</p>}
        {filtered.map(mod => (
          <div key={mod.module}>
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5 bg-muted/30 sticky top-0 flex items-center gap-2">{mod.module}<Badge variant="outline" className="text-[10px] h-4">{mod.scenario}</Badge></div>
            {mod.indicators.filter(ind => !search || ind.includes(search)).map(ind => (
              <label key={ind} className={`flex items-center gap-2 px-2 py-1.5 hover:bg-muted/30 cursor-pointer rounded text-sm ${dataSourceCategory && dataSourceCategory !== 'indicator' ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="checkbox" className="rounded" checked={checkedIndicators.has(ind)} onChange={() => { if (dataSourceCategory && dataSourceCategory !== 'indicator') { addSystemMessage('当前已选择其他类别数据源，无法混选指标。'); return; } toggleCheck(ind); }} />
                {ind}
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">已选 {checkedIndicators.size} 个指标</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" disabled={checkedIndicators.size === 0} onClick={() => { setDataSourceCategory('indicator'); setSelectedDataSources(prev => [...prev, ...Array.from(checkedIndicators).map(ind => ({ type: 'indicator' as string, name: ind }))]); onClose(); addSystemMessage(`已选择${checkedIndicators.size}个平台指标。您可以继续选择其他指标，或点击"确认数据"按钮进入下一步。`); }}>确定</Button>
        </div>
      </div>
    </>
  );
}

// ── 指标树弹窗 ──
function TreeDialogInner({ dataSourceCategory, addSystemMessage, setSelectedDataSources, setDataSourceCategory, onClose }: {
  dataSourceCategory: string | null; addSystemMessage: (msg: string) => void; setSelectedDataSources: React.Dispatch<React.SetStateAction<{ type: string; name: string; detail?: string }[]>>; setDataSourceCategory: React.Dispatch<React.SetStateAction<string | null>>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('全部');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const allTrees = [
    { name: '流量运营指标树', count: 8, scenario: '流量运营', desc: '涵盖流量收入、DOU、达量率等8个核心指标', date: '2026-06-28' },
    { name: '中高端运营指标树', count: 4, scenario: '中高端客户运营', desc: '涵盖全球通保有率、中高端ARPU等4个指标', date: '2026-06-25' },
    { name: '大市场关键指标树', count: 10, scenario: '流量运营', desc: '涵盖收入、用户数、ARPU等10个关键指标', date: '2026-06-22' },
    { name: '离网维系指标树', count: 6, scenario: '离网维系', desc: '涵盖离网率、维系率等6个指标', date: '2026-06-20' },
    { name: '家庭融合指标树', count: 5, scenario: '家庭融合运营', desc: '涵盖融合渗透率、宽带ARPU等5个指标', date: '2026-06-18' },
    { name: '国际业务指标树', count: 4, scenario: '国际业务运营', desc: '涵盖漫游收入、出境用户数等4个指标', date: '2026-06-15' },
    { name: '增量运营指标树', count: 5, scenario: '增量运营', desc: '涵盖新增用户、获客成本等5个指标', date: '2026-06-12' },
    { name: '收入归因指标树', count: 7, scenario: '流量运营', desc: '涵盖收入分解、归因路径等7个指标', date: '2026-06-10' },
  ];
  const filtered = allTrees.filter(t => (scenario === '全部' || t.scenario === scenario) && (!search || t.name.includes(search) || t.desc.includes(search)));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="space-y-2 mb-2">
        <DialogSearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="搜索指标树名称..." />
        <ScenarioFilter value={scenario} onChange={v => { setScenario(v); setPage(1); }} />
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {paged.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">无匹配指标树</p>}
        {paged.map(tree => (
          <Card key={tree.name} className={`cursor-pointer hover:border-primary/50 transition-colors ${dataSourceCategory && dataSourceCategory !== 'tree' ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => { if (dataSourceCategory && dataSourceCategory !== 'tree') { addSystemMessage('当前已选择其他类别数据源，无法混选指标树。'); return; } setSelectedDataSources(prev => [...prev, { type: 'tree', name: tree.name, detail: `${tree.count}个指标` }]); setDataSourceCategory('tree'); onClose(); addSystemMessage(`已选择指标树"${tree.name}"，包含${tree.count}个核心指标。您可以继续选择其他指标树，或点击"确认数据"按钮进入下一步。`); }}>
            <CardContent className="p-3 flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-purple-600 shrink-0" />
              <div className="flex-1"><div className="text-sm font-medium">{tree.name}</div><div className="text-xs text-muted-foreground">{tree.desc} · {tree.date}</div></div>
              <Badge variant="outline" className="text-[10px] h-4">{tree.scenario}</Badge>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
      <DialogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
    </>
  );
}

// ── 客群弹窗 ──
function GroupDialogInner({ dataSourceCategory, addSystemMessage, setSelectedDataSources, setDataSourceCategory, onClose }: {
  dataSourceCategory: string | null; addSystemMessage: (msg: string) => void; setSelectedDataSources: React.Dispatch<React.SetStateAction<{ type: string; name: string; detail?: string }[]>>; setDataSourceCategory: React.Dispatch<React.SetStateAction<string | null>>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('全部');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const allGroups = [
    { name: '高价值流量客群', size: '12.3万', tags: ['DOU>10GB', 'ARPU>128元'], source: '模型预测', scenario: '流量运营' },
    { name: '中高端流失风险客群', size: '8.7万', tags: ['离网概率>60%', '在网>24月'], source: '模型预测', scenario: '中高端客户运营' },
    { name: '5G换机潜力客群', size: '15.2万', tags: ['终端>24月', '流量增长'], source: '标签筛选', scenario: '流量运营' },
    { name: '家庭宽带到期客群', size: '6.8万', tags: ['宽带到期<3月', '融合用户'], source: '规则圈选', scenario: '家庭融合运营' },
    { name: '国际漫游高价值客群', size: '2.1万', tags: ['年漫游>3次', 'ARPU>200'], source: '标签筛选', scenario: '国际业务运营' },
    { name: '增量携号转网客群', size: '4.5万', tags: ['携入用户', '首月活跃'], source: '规则圈选', scenario: '增量运营' },
    { name: '离网预警高风险客群', size: '9.3万', tags: ['连续降档', '投诉>2次'], source: '模型预测', scenario: '离网维系' },
    { name: '中高端价值提升客群', size: '7.2万', tags: ['ARPU 80-128', '流量增长'], source: '标签筛选', scenario: '中高端客户运营' },
    { name: '融合套餐潜力客群', size: '11.5万', tags: ['单卡用户', '有宽带需求'], source: '模型预测', scenario: '家庭融合运营' },
  ];
  const filtered = allGroups.filter(g => (scenario === '全部' || g.scenario === scenario) && (!search || g.name.includes(search) || g.tags.some(t => t.includes(search))));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="space-y-2 mb-2">
        <DialogSearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="搜索客群名称或标签..." />
        <ScenarioFilter value={scenario} onChange={v => { setScenario(v); setPage(1); }} />
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {paged.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">无匹配客群</p>}
        {paged.map(g => (
          <Card key={g.name} className={`cursor-pointer hover:border-primary/50 transition-colors ${dataSourceCategory && dataSourceCategory !== 'group' ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => { if (dataSourceCategory && dataSourceCategory !== 'group') { addSystemMessage('当前已选择其他类别数据源，无法混选客群。'); return; } setSelectedDataSources(prev => [...prev, { type: 'group', name: g.name, detail: `${g.size}人` }]); setDataSourceCategory('group'); onClose(); addSystemMessage(`已选择客群"${g.name}"（${g.size}人），来源：${g.source}。您可以继续选择其他客群，或点击"确认数据"按钮进入下一步。`); }}>
            <CardContent className="p-3 flex items-center gap-3">
              <Users className="w-5 h-5 text-pink-600 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="text-xs text-muted-foreground">{g.size}人 · {g.source}</div>
                <div className="flex gap-1 mt-1">{g.tags.map(t => <Badge key={t} variant="outline" className="text-[10px] h-4">{t}</Badge>)}</div>
              </div>
              <Badge variant="outline" className="text-[10px] h-4 shrink-0">{g.scenario}</Badge>
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
      <DialogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
    </>
  );
}

// ── 报表弹窗 ──
function ReportDialogInner({ dataSourceCategory, addSystemMessage, setSelectedDataSources, setDataSourceCategory, onClose }: {
  dataSourceCategory: string | null; addSystemMessage: (msg: string) => void; setSelectedDataSources: React.Dispatch<React.SetStateAction<{ type: string; name: string; detail?: string }[]>>; setDataSourceCategory: React.Dispatch<React.SetStateAction<string | null>>; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scenario, setScenario] = useState('全部');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const allReports = [
    { name: '流量运营日报', scenario: '流量运营', periodType: '日报', updateTime: '2026-07-14', indicatorCount: 42 },
    { name: 'ARPU月度分析表', scenario: '流量运营', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 28 },
    { name: 'DOU变化归因分析表', scenario: '流量运营', periodType: '月报', updateTime: '2026-07-02', indicatorCount: 35 },
    { name: '5G用户发展月报', scenario: '流量运营', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 31 },
    { name: '中高端客户保有月报', scenario: '中高端客户运营', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 26 },
    { name: '全球通品牌运营季报', scenario: '中高端客户运营', periodType: '季报', updateTime: '2026-06-30', indicatorCount: 38 },
    { name: '离网预警与维系效果周报', scenario: '离网维系', periodType: '周报', updateTime: '2026-07-12', indicatorCount: 22 },
    { name: '离网归因分析月报', scenario: '离网维系', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 30 },
    { name: '家庭融合运营月报', scenario: '家庭融合运营', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 24 },
    { name: '家庭宽带发展季报', scenario: '家庭融合运营', periodType: '季报', updateTime: '2026-06-30', indicatorCount: 20 },
    { name: '国际业务季度分析表', scenario: '国际业务运营', periodType: '季报', updateTime: '2026-06-30', indicatorCount: 18 },
    { name: '增量市场运营日报', scenario: '增量运营', periodType: '日报', updateTime: '2026-07-14', indicatorCount: 33 },
    { name: '收入波动归因月报', scenario: '流量运营', periodType: '月报', updateTime: '2026-07-01', indicatorCount: 27 },
    { name: '区域攻坚作战周报', scenario: '流量运营', periodType: '周报', updateTime: '2026-07-12', indicatorCount: 19 },
    { name: '客户满意度季报', scenario: '中高端客户运营', periodType: '季报', updateTime: '2026-06-30', indicatorCount: 15 },
  ];
  const filtered = allReports.filter(r => (scenario === '全部' || r.scenario === scenario) && (!search || r.name.includes(search)));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="space-y-2 mb-2">
        <DialogSearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="搜索报表名称..." />
        <ScenarioFilter value={scenario} onChange={v => { setScenario(v); setPage(1); }} />
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {paged.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">无匹配报表</p>}
        {paged.map(r => (
          <Card key={r.name} className={`cursor-pointer hover:border-primary/50 transition-colors ${dataSourceCategory && dataSourceCategory !== 'report' ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => { if (dataSourceCategory && dataSourceCategory !== 'report') { addSystemMessage('当前已选择其他类别数据源，无法混选报表。如需更换请先移除已选数据源。'); return; } setSelectedDataSources(prev => [...prev, { type: 'report', name: r.name, detail: `${r.periodType} · ${r.indicatorCount}个指标` }]); setDataSourceCategory('report'); onClose(); addSystemMessage(`已选择报表"${r.name}"（${r.periodType}，${r.indicatorCount}个指标）。系统将基于此报表数据进行进一步分析。您可以继续选择其他报表，或点击"确认数据"按钮进入下一步。`); }}>
            <CardContent className="p-3 flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1"><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.periodType} · {r.indicatorCount}个指标 · 更新于{r.updateTime}</div></div>
              <Badge variant="outline" className="text-[10px] h-4">{r.scenario}</Badge>
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
      <DialogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <div className="flex justify-end gap-2 mt-3"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
    </>
  );
}

// ── 模板库选择弹窗 ──
function TemplateLibDialogInner({ onConfirm, onCancel }: { onConfirm: (tpl: { id: string; title: string; sections: number; chapters: string[]; category: string }) => void; onCancel: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');

  // 系统预设模板
  const systemTemplates = [
    { id: 'tl1', title: '月度经营分析报告模板', category: '经营分析', sections: 5, updateTime: '2026-06-15', chapters: ['整体经营概况', '收入分解归因', '区域对比分析', '客群结构分析', '策略建议'] },
    { id: 'tl2', title: '流量运营专项报告模板', category: '流量运营', sections: 4, updateTime: '2026-06-10', chapters: ['流量总览', 'DOU变化归因', '区域流量对比', '提升策略'] },
    { id: 'tl3', title: '客户保有分析报告模板', category: '客户运营', sections: 6, updateTime: '2026-05-28', chapters: ['保有总览', '离网归因', '区域保有对比', '客群保有差异', '维系效果评估', '保有提升策略'] },
    { id: 'tl4', title: '收入归因分析报告模板', category: '收入分析', sections: 5, updateTime: '2026-05-20', chapters: ['收入总览', 'ARPU变化归因', '区域收入对比', '产品收入结构', '增收建议'] },
    { id: 'tl5', title: '区域攻坚作战报告模板', category: '区域运营', sections: 4, updateTime: '2026-05-15', chapters: ['攻坚目标概览', '区域竞争态势', '关键小区分析', '攻坚行动建议'] },
  ];

  // 从 localStorage 加载用户保存的模板
  const [userTemplates, setUserTemplates] = useState<Array<{ id: string; name: string; category: string; chapters: string[]; sections: number; updatedAt: string; isUserCreated: boolean }>>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ai-insight-user-templates') || '[]');
      setUserTemplates(saved);
    } catch { /* ignore */ }
  }, []);

  // 合并模板列表
  const allTemplates = [
    ...systemTemplates.map(t => ({ ...t, isUserCreated: false })),
    ...userTemplates.map(t => ({ id: t.id, title: t.name, category: t.category || '用户自定义', sections: t.sections, updateTime: t.updatedAt, chapters: t.chapters, isUserCreated: true })),
  ];

  const categories = ['全部', ...new Set(allTemplates.map(t => t.category))];

  const filtered = allTemplates.filter(t => {
    const matchSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === '全部' || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="搜索模板名称..." className="pl-8 h-8 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={filterCategory === cat ? 'default' : 'outline'} className="h-6 text-xs px-2" onClick={() => setFilterCategory(cat)}>{cat}</Button>
        ))}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">暂无匹配的模板</p>
        ) : filtered.map(tpl => (
          <div key={tpl.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => onConfirm({ id: tpl.id, title: tpl.title, sections: tpl.sections, chapters: tpl.chapters, category: tpl.category })}>
            {tpl.isUserCreated ? <Bookmark className="w-5 h-5 text-primary shrink-0" /> : <BookOpen className="w-5 h-5 text-primary shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{tpl.title}</p>
                {tpl.isUserCreated && <Badge variant="outline" className="text-[10px] h-4 px-1">自定义</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{tpl.category} · {tpl.sections}个章节 · 更新于{tpl.updateTime}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
      </div>
    </div>
  );
}

/* ────────── 报告编辑页面（AI原生：左对话+右预览）────────── */
function ReportEditPage({ initialScenario, initialMode, followupState, activeConversationId, onToggleLeftPanel, leftPanelOpen }: { initialScenario?: string | null; initialMode?: 'blank' | 'template' | 'scenario' | 'upload' | 'datasource' | 'knowledge' | 'followup' | 'edit' | 'import'; followupState?: { reportTitle: string; reportSections: ReportSection[]; reportStatus?: string; currentStep?: string }; activeConversationId?: string; onToggleLeftPanel?: () => void; leftPanelOpen?: boolean }) {
  const router = useRouter();
  const mode = initialMode || (initialScenario ? 'scenario' : 'blank');
  const [importStep, setImportStep] = useState<'upload-report' | 'confirm-structure' | 'upload-data'>('upload-report');

  const getInitialMessages = (): ChatMessage[] => {
    if (mode === 'edit' && followupState) {
      const stepLabel = followupState.currentStep || '产出物生成';
      return [
        { id: `msg-${Date.now()}`, role: 'assistant', content: `您好！您正在继续编辑报告「${followupState.reportTitle}」。\n\n当前步骤：${stepLabel}\n\n请描述您想修改或补充的内容，或直接进行下一步操作。`, timestamp: new Date().toLocaleTimeString() },
      ];
    }
    if (mode === 'blank' && initialScenario) {
      // 从报告详情页"继续追问"跳转，已携带上下文
      return [
        { id: `msg-${Date.now()}`, role: 'assistant', content: `您好！您正在对已有报告进行追问深化。${initialScenario}\n\n请描述您想深入了解的方向，例如：\n• 某个指标的变化趋势\n• 特定区域的表现差异\n• 策略效果的归因分析`, timestamp: new Date().toLocaleTimeString() },
      ];
    }
    if (mode === 'scenario' && initialScenario) return getScenarioMessages(initialScenario);
    if (mode === 'template' && initialScenario) return getTemplateMessages(initialScenario);
    if (mode === 'upload' && initialScenario) return getUploadDataMessages(initialScenario);
    if (mode === 'datasource' && initialScenario) return getDataSourceMessages(initialScenario);
    if (mode === 'knowledge' && initialScenario) return getKnowledgeMessages(initialScenario);
    if (mode === 'import') return getImportReportMessages();
    return getBlankMessages();
  };

  const getInitialStep = (): ChatState => {
    if (mode === 'followup') return '追问深化';
    if (mode === 'edit') {
      // 审核定稿步骤已移除，所有状态直接进入追问深化
      return '追问深化';
    }
    if (mode === 'import') return '需求收集';
    if (mode === 'template') return '大纲确认';
    if (mode === 'scenario') return '大纲确认';
    if (mode === 'upload') return '大纲确认';
    if (mode === 'datasource') return '大纲确认';
    if (mode === 'knowledge') return '大纲确认';
    return '需求收集';
  };

  const getReportTitle = (): string => {
    if ((mode === 'edit' || mode === 'followup') && followupState?.reportTitle) return followupState.reportTitle;
    if (mode === 'scenario' && initialScenario) return `${initialScenario} - ${new Date().toISOString().slice(0, 7).replace('-', '年')}月`;
    if (mode === 'template' && initialScenario) return initialScenario;
    if (mode === 'upload' && initialScenario) return `数据上传分析 - ${initialScenario}`;
    if (mode === 'datasource' && initialScenario) return `数据源分析报告 - ${initialScenario}`;
    if (mode === 'knowledge' && initialScenario) return `洞察深化报告 - ${initialScenario}`;
    if (mode === 'import') return `导入报告分析 - ${new Date().toISOString().slice(0, 7).replace('-', '年')}月`;
    return '新对话';
  };

  const getInitialReportStatus = (): 'draft' | 'final' | 'archived' => {
    if (followupState?.reportStatus) {
      const s = followupState.reportStatus;
      if (s === 'draft' || s === 'final') return s;
      if (s === 'review') return 'draft'; // 旧review状态映射为draft(修改中)
    }
    return 'draft';
  };

  const [currentStep, setCurrentStep] = useState<ChatState>(getInitialStep());
  const [reportStatus, setReportStatus] = useState<'draft' | 'final' | 'archived'>(getInitialReportStatus());
  const [generationType, setGenerationType] = useState<GenerationType>('report');
  // 已完成步骤集合：用于步骤条的完成状态判断，导入模式下"大纲确认"在"数据准备"之前完成
  const getInitialCompletedSteps = (): Set<ChatState> => {
    const s = new Set<ChatState>();
    if (mode === 'followup') { s.add('需求收集'); s.add('数据准备'); s.add('大纲确认'); s.add('产出物生成'); }
    if (mode === 'edit') {
      const status = followupState?.reportStatus;
      if (status === 'review') { s.add('需求收集'); s.add('数据准备'); s.add('大纲确认'); s.add('产出物生成'); s.add('追问深化'); }
      if (status === 'final') { s.add('需求收集'); s.add('数据准备'); s.add('大纲确认'); s.add('产出物生成'); s.add('追问深化'); }
      if (status === 'draft') { s.add('需求收集'); s.add('数据准备'); s.add('大纲确认'); s.add('产出物生成'); }
    }
    if (mode === 'template' || mode === 'scenario' || mode === 'upload' || mode === 'datasource' || mode === 'knowledge') { s.add('需求收集'); s.add('数据准备'); }
    return s;
  };
  const [completedSteps, setCompletedSteps] = useState<Set<ChatState>>(getInitialCompletedSteps);

  // 标准流程顺序：需求收集→数据准备→大纲确认→产出物生成→追问深化
  const advanceStep = (target: ChatState) => {
    setCurrentStep(target);
    // 标准顺序中，目标步骤之前的步骤全部标记为已完成
    const standardOrder: ChatState[] = ['需求收集', '数据准备', '大纲确认', '产出物生成', '追问深化'];
    const targetIdx = standardOrder.indexOf(target);
    if (targetIdx > 0) {
      const stepsToComplete = standardOrder.slice(0, targetIdx);
      setCompletedSteps(prev => {
        const next = new Set(prev);
        stepsToComplete.forEach(s => next.add(s));
        return next;
      });
    }
  };
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { label: '数据采集', status: 'waiting', logs: [], algorithms: [] },
    { label: '数据校验', status: 'waiting', logs: [], algorithms: [] },
    { label: '分析引擎', status: 'waiting', logs: [], algorithms: [] },
    { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveVisibility, setArchiveVisibility] = useState<'private' | 'region'>('private');
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [reportSections, setReportSections] = useState<ReportSection[]>([]);
  const [showFinalizedMsg, setShowFinalizedMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 对话持久化 - 保存对话状态（防抖500ms）
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConvIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeConversationId) return;
    // 防抖：500ms内多次变更只执行最后一次
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // 标题取首条用户消息前20字
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : '新对话';
      const state = {
        id: activeConversationId,
        title,
        messages: messages as unknown as import('@/app/workspace/ai-insight/lib/conversation-storage').ConversationMessage[],
        currentStep: currentStep as string,
        reportStatus: reportStatus as string,
        reportSections: reportSections as unknown as Record<string, unknown>[],
        outputFormat: undefined as string | undefined,
        generationType: generationType as string,
        selectedDataSources: selectedDataSources as { type: string; name: string; detail?: string }[],
        templateConfirmed: templateConfirmed as boolean,
        accountPeriodType: accountPeriodType as 'daily' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual',
        accountPeriodValue: accountPeriodValue as { year: number; month: number; quarter?: number; semiAnnual?: number },
        createdAt: (activeConversationId ? getConversation(activeConversationId)?.createdAt : undefined) ?? Date.now(),
        updatedAt: Date.now(),
        visibility: archiveVisibility as 'private' | 'region',
      };
      saveConversation(state);
      // 通知ConversationList刷新
      window.dispatchEvent(new CustomEvent('conversations-updated'));
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [activeConversationId, messages, currentStep, reportStatus, reportSections]);

  // 对话持久化 - 切换对话时恢复状态
  useEffect(() => {
    if (!activeConversationId) return;
    // 仅在对话ID真正变化时恢复（避免初始化闪烁）
    if (prevConvIdRef.current === activeConversationId) return;
    prevConvIdRef.current = activeConversationId;
    const saved = getConversation(activeConversationId);
    if (saved && saved.messages && saved.messages.length > 0) {
      setMessages(saved.messages as unknown as typeof messages);
      setCurrentStep(saved.currentStep as typeof currentStep);
      setReportStatus(saved.reportStatus as typeof reportStatus);
      setReportSections(saved.reportSections as unknown as typeof reportSections);
      if (saved.generationType) setGenerationType(saved.generationType as GenerationType);
      if (saved.selectedDataSources) setSelectedDataSources(saved.selectedDataSources);
      if (saved.templateConfirmed !== undefined) setTemplateConfirmed(saved.templateConfirmed);
      if (saved.accountPeriodType) setAccountPeriodType(saved.accountPeriodType);
      if (saved.accountPeriodValue) setAccountPeriodValue(saved.accountPeriodValue);
      // 恢复dataConfirmed：如果步骤已过数据准备阶段，则视为已确认
      const stepsAfterDataPrep = ['大纲确认', '产出物生成', '追问深化', '已归档'];
      setDataConfirmed(stepsAfterDataPrep.includes(saved.currentStep || ''));
      setReportTitle(saved.title || '新对话');
    } else {
      // 新对话或空对话：重置所有内部状态
      setMessages(getBlankMessages());
      setCurrentStep('需求收集');
      setReportStatus('draft');
      setReportSections([]);
      setSelectedDataSources([]);
      setTemplateConfirmed(false);
      setDataConfirmed(false);
      setRequirementInfo({ topic: '', period: '', region: '', focus: [] });
      setDataSourceCategory(null);
      setGenerationType('report');
      setAccountPeriodType('monthly');
      const now = new Date();
      setAccountPeriodValue({ year: now.getFullYear(), month: now.getMonth() + 1 });
    }
    // 重置标题为新对话
    setReportTitle('新对话');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // 数据准备：已选数据源
  const [selectedDataSources, setSelectedDataSources] = useState<{ type: string; name: string; detail?: string }[]>([]);
  const [templateConfirmed, setTemplateConfirmed] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false); // 数据确认后置灰数据源按钮
  // 账期选择
  const [accountPeriodType, setAccountPeriodType] = useState<'daily' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual'>('monthly');
  const [accountPeriodValue, setAccountPeriodValue] = useState<{ year: number; month: number; day?: number; quarter?: number; semiAnnual?: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [templateLibOpen, setTemplateLibOpen] = useState(false); // 模板库选择弹窗
  const [dataSourceCategory, setDataSourceCategory] = useState<string | null>(null); // 'indicator'|'tree'|'group'|'dataset'|'report', 选定后互斥
  const fileInputRef = useRef<HTMLInputElement>(null);
  // AI生成中状态
  const [isGenerating, setIsGenerating] = useState(false);
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // 5个弹窗控制
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDatasetDialog, setShowDatasetDialog] = useState(false);
  const [showIndicatorDialog, setShowIndicatorDialog] = useState(false);
  const [showTreeDialog, setShowTreeDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [outlineEditing, setOutlineEditing] = useState(false);

  // 需求收集：已确认需求信息
  const [requirementInfo, setRequirementInfo] = useState<{ topic: string; period: string; region: string; focus: string[] }>({ topic: '', period: '', region: '', focus: [] });

  // followup/edit模式初始化：加载报告内容并根据状态定位步骤
  useEffect(() => {
    if (!followupState) return;
    const sections = followupState.reportSections || [];
    setReportSections(sections);
    const rawStatus = (followupState.reportStatus || 'draft') as string;
    // 旧状态映射：review → draft, final → archived
    const mappedStatus = rawStatus === 'review' ? 'draft' : rawStatus === 'final' ? 'archived' : rawStatus;
    setReportStatus(mappedStatus as 'draft' | 'archived');
    // 防御：如果reportSections为空，不能进入追问深化（右侧会空白）
    // 降级到产出物生成步骤重新生成
    const hasContent = sections.length > 0 && sections.some(s => s.paragraphs && s.paragraphs.length > 0);
    if (mode === 'followup') {
      // 已定稿报告继续追问：步骤=追问深化，状态=final（追问完成后变review）
      if (hasContent) {
        setCurrentStep('追问深化');
      } else {
        setCurrentStep('产出物生成');
        setReportStatus('draft');
      }
      setMessages(prev => [...prev, {
        id: `m${Date.now()}`,
        role: 'system' as const,
        content: hasContent
          ? `已加载报告「${followupState.reportTitle}」的已定稿内容，您可以在基础上继续追问深化。\n追问生成的新内容将嵌入报告，需重新审核。`
          : `报告「${followupState.reportTitle}」的内容尚未生成，将重新进入报告生成步骤。`,
      } as ChatMessage]);
    } else if (mode === 'edit') {
      if (!hasContent) {
        // 内容为空，降级到报告生成步骤
        setCurrentStep('产出物生成');
        setReportStatus('draft');
        setMessages(prev => [...prev, {
          id: `m${Date.now()}`,
          role: 'system' as const,
          content: `报告「${followupState.reportTitle}」的内容尚未生成，将重新进入报告生成步骤。`,
        } as ChatMessage]);
        return;
      }
      // 根据报告状态定位到对应步骤
      const stepByStatus: Record<string, ChatState> = {
        draft: '追问深化',   // 草稿有内容，跳到追问深化（可继续编辑）
        review: '追问深化',  // 原审核定稿已移除，review映射为追问深化
        final: '追问深化',   // 已定稿，进入追问深化
      };
      const targetStep = stepByStatus[status] || '追问深化';
      setCurrentStep(targetStep);
      const statusLabel: Record<string, string> = { draft: '草稿', review: '待审核', final: '已定稿' };
      setMessages(prev => [...prev, {
        id: `m${Date.now()}`,
        role: 'system' as const,
        content: `已加载报告「${followupState.reportTitle}」（${statusLabel[status] || '草稿'}），当前步骤：${targetStep}。\n请描述您想修改或补充的内容，或直接进行下一步操作。`,
      } as ChatMessage]);
    }
  }, [mode, followupState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentStepIndex = stateSteps.findIndex(s => s.label === currentStep);
  const [reportTitle, setReportTitle] = useState(getReportTitle());
  // 当mode/scenario变化时同步标题
  useEffect(() => {
    const newTitle = getReportTitle();
    if (newTitle !== reportTitle) setReportTitle(newTitle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialScenario, followupState?.reportTitle]);

  // 当步骤推进到大纲确认或产出物生成时自动展开右侧面板
  useEffect(() => {
    if (currentStep === '大纲确认' || currentStep === '产出物生成' || currentStep === '追问深化') {
      setShowRightPanel(true);
    }
  }, [currentStep]);

  // 当选择了数据源时自动展开右侧面板（数据准备阶段）
  useEffect(() => {
    if (currentStep === '数据准备' && selectedDataSources.length > 0) {
      setShowRightPanel(true);
    }
  }, [selectedDataSources, currentStep]);

  const addSystemMessage = (content: string, component?: ChatMessage['component'], componentData?: Record<string, unknown>) => {
    const reply: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'system',
      content,
      component,
      componentData,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, reply]);
  };

  // 停止AI生成：清除所有待执行的定时器
  const stopGenerating = () => {
    pendingTimersRef.current.forEach(t => clearTimeout(t));
    pendingTimersRef.current = [];
    setIsGenerating(false);
  };

  // 延迟执行AI回复（可追踪、可取消）
  const scheduleReply = (fn: () => void, delay: number) => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      fn();
      // 从pending列表移除已执行的timer
      pendingTimersRef.current = pendingTimersRef.current.filter(t => t !== timer);
      // 如果没有更多pending timer，解除生成状态
      if (pendingTimersRef.current.length === 0) {
        setIsGenerating(false);
      }
    }, delay);
    pendingTimersRef.current.push(timer);
  };

  const handleSend = (overrideText?: string) => {
    if (isGenerating) return; // AI生成中不允许发送
    const text = overrideText || inputValue.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    const sentText = text;
    setInputValue('');

    // 自动更新标题：新对话状态下，用户首条消息作为标题
    if (reportTitle === '新对话' && text.length > 0) {
      const autoTitle = text.length > 20 ? text.slice(0, 20) + '…' : text;
      setReportTitle(autoTitle);
    }

    // ── 检测"换模板"意图：重置模板确认状态，重新展示模板选择入口 ──
    if (generationType === 'report' && templateConfirmed && (sentText.includes('换模板') || sentText.includes('重新选择模板') || sentText.includes('模板上传错了') || sentText.includes('换一个模板') || sentText.includes('重新上传模板'))) {
      setTemplateConfirmed(false);
      scheduleReply(() => {
        addSystemMessage('好的，已重置模板选择。请重新选择或上传报告模板：', 'templateSelect');
      }, 500);
      return;
    }

    // ── 导入报告模式：三步向导 ──
    // 导入模式步骤流转：需求收集(上传旧报告) → 大纲确认(确认解析结构) → 数据准备(提供新数据) → 报告生成
    // 与标准流程不同：大纲确认在数据准备之前，因为先从旧报告解析出结构再填新数据
    if (mode === 'import') {
      if (importStep === 'upload-report') {
        // 第一步：上传旧报告
        if (sentText.includes('上传') || sentText.includes('已上传') || sentText.includes('报告文件')) {
          setImportStep('confirm-structure');
          setCompletedSteps(prev => new Set([...prev, '需求收集']));
          setCurrentStep('大纲确认');
          scheduleReply(() => {
            addSystemMessage('已解析报告大纲，识别到以下章节：\n\n1. 整体概况\n2. 流量运营分析\n3. ARPU与收入分析\n4. 区域对比\n5. 总结与建议\n\n请确认解析出的大纲是否正确：', 'outlinePreview', {
              title: '报告大纲解析结果',
              sections: ['整体概况', '流量运营分析', 'ARPU与收入分析', '区域对比', '总结与建议'],
              options: [
                { label: '确认大纲，继续', action: 'confirmImportStructure' },
                { label: '调整大纲', action: 'adjustImportStructure' },
                { label: '重新上传报告', action: 'reuploadReport' },
              ],
            });
          }, 1200);
        } else {
          scheduleReply(() => {
            addSystemMessage('请先上传您的旧报告文件（Word或PDF格式），我将解析其结构作为新报告的模板。', 'dataUpload', {
              title: '上传旧报告文件',
              description: '支持 .docx / .pdf 格式',
              accept: '.docx,.pdf',
            });
          }, 500);
        }
        return;
      }
      if (importStep === 'confirm-structure') {
        // 第二步：确认/调整大纲
        if (sentText.includes('确认') || sentText.includes('继续')) {
          setImportStep('upload-data');
          setCompletedSteps(prev => new Set([...prev, '大纲确认']));
          setCurrentStep('数据准备');
          scheduleReply(() => {
            addSystemMessage('大纲已确认！现在请提供新的数据文件，我将用新数据填充报告模板。\n\n您可以选择：', 'dataUpload', {
              title: '提供新数据',
              options: [
                { label: '上传新数据文件', description: '上传 Excel/CSV 格式的最新数据', action: 'uploadNewData' },
                { label: '使用平台指标数据', description: '自动从大数据平台拉取最新指标数据', action: 'usePlatformData' },
                { label: '选择已有数据源', description: '从已配置的数据源中选择', action: 'selectExistingSource' },
              ],
            });
          }, 800);
        } else if (sentText.includes('调整') || sentText.includes('修改')) {
          scheduleReply(() => {
            addSystemMessage('请告诉我需要调整的具体内容，例如：\n• "第二章拆分为流量和DOU两个章节"\n• "增加竞品对比章节"\n• "删除第五章"\n\n我将根据您的意见调整大纲。');
          }, 500);
        } else if (sentText.includes('重新上传') || sentText.includes('重新上传报告')) {
          setImportStep('upload-report');
          setCompletedSteps(prev => { const s = new Set(prev); s.delete('需求收集'); return s; });
          setCurrentStep('需求收集');
          scheduleReply(() => {
            addSystemMessage('好的，请重新上传报告文件。', 'dataUpload', {
              title: '上传旧报告文件',
              description: '支持 .docx / .pdf 格式',
              accept: '.docx,.pdf',
            });
          }, 500);
        } else {
          scheduleReply(() => {
            addSystemMessage('请确认解析出的报告大纲是否正确，或告诉我需要调整的地方。');
          }, 500);
        }
        return;
      }
      if (importStep === 'upload-data') {
        // 第三步：提供新数据后生成报告
        if (sentText.includes('平台') || sentText.includes('上传数据') || sentText.includes('已上传') || sentText.includes('数据源') || sentText.includes('开始生成')) {
          setCompletedSteps(prev => new Set([...prev, '数据准备']));
          setCurrentStep('产出物生成');
                    setProcessSteps([
            { label: '模板解析', status: 'completed', logs: ['旧报告模板结构已解析'], algorithms: [] },
            { label: '数据加载', status: 'running', logs: ['正在加载新数据...'], algorithms: [] },
            { label: '内容生成', status: 'waiting', logs: [], algorithms: [] },
            { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
          ]);
          scheduleReply(() => {
            setProcessSteps(prev => [prev[0], { ...prev[1], status: 'completed', logs: ['新数据加载完成，共42个指标×16地市'] }, { ...prev[2], status: 'running', logs: ['正在按模板结构生成分析内容...'] }, prev[3]]);
            scheduleReply(() => {
              setProcessSteps(prev => [prev[0], prev[1], { ...prev[2], status: 'completed', logs: ['分析内容生成完毕'] }, { ...prev[3], status: 'running', logs: ['正在构建报告...'] }]);
              scheduleReply(() => {
                setProcessSteps(prev => [prev[0], prev[1], prev[2], { ...prev[3], status: 'completed', logs: ['报告构建完毕'] }]);
                setCurrentStep('追问深化');
                                setReportSections(mockReportSections);
                addSystemMessage('报告已按旧模板结构+新数据生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
              }, 4000);
            }, 4000);
          }, 2000);
        } else {
          scheduleReply(() => {
            addSystemMessage('请选择数据来源：上传新数据文件、使用平台指标数据、或选择已有数据源。选择后我将开始生成报告。');
          }, 500);
        }
        return;
      }
    }

    // 需求收集阶段：跳过模板选择，直接开始（必须在"基于模板生成"判断之前，否则"跳过模板"文本包含"模板"会被误匹配）
    if (currentStep === '需求收集' && (sentText.includes('跳过') || sentText.includes('直接开始') || sentText.includes('不用模板') || sentText.includes('不要模板'))) {
      setTemplateConfirmed(true); // 标记模板步骤已处理（跳过也算），避免后续重复显示模板入口
      scheduleReply(() => {
        addSystemMessage('好的，不使用模板，直接开始数据分析。接下来请选择数据源：', 'dataButtons', {});
        advanceStep('数据准备');
      }, 500);
      return;
    }

    // 需求收集阶段：基于模板生成
    if (currentStep === '需求收集' && (sentText.includes('模板') || sentText.includes('历史报告'))) {
      setGenerationType('report');
      scheduleReply(() => {
        addSystemMessage('好的，基于模板生成新报告。请先提供报告模板：\n\n方式一：从模板库中选择已归档的报告\n方式二：上传本地的报告文件（Word/PDF）', 'templateSelect', { suggestions: ['从模板库选择', '上传报告模板'] });
      }, 500);
      return;
    }

    // 需求收集阶段：用户描述需求后推进
    if (currentStep === '需求收集') {
      // 解析用户需求
      const topic = sentText;
      let period = '本月';
      let region = '全疆';
      const focus: string[] = [];
      if (sentText.includes('6月') || sentText.includes('本月')) period = '2026年6月';
      if (sentText.includes('上月') || sentText.includes('5月')) period = '2026年5月';
      if (sentText.includes('乌鲁木齐')) region = '乌鲁木齐';
      if (sentText.includes('克拉玛依')) region = '克拉玛依';
      if (sentText.includes('收入') || sentText.includes('ARPU')) focus.push('收入波动');
      if (sentText.includes('流量') || sentText.includes('DOU')) focus.push('流量增长');
      if (sentText.includes('离网')) focus.push('离网预警');
      if (sentText.includes('保有')) focus.push('客户保有');
      // 根据用户输入推断生成类型（用局部变量避免异步状态问题）
      let inferredType: GenerationType = generationType;
      if (sentText.includes('报表') || sentText.includes('Excel') || sentText.includes('表格')) { setGenerationType('spreadsheet'); inferredType = 'spreadsheet'; }
      else if (sentText.includes('看板') || sentText.includes('Dashboard')) { setGenerationType('dashboard'); inferredType = 'dashboard'; }
      else if (sentText.includes('摘要') || sentText.includes('要点')) { setGenerationType('summary'); inferredType = 'summary'; }
      else if (sentText.includes('报告') || sentText.includes('分析')) { setGenerationType('report'); inferredType = 'report'; }
      setRequirementInfo({ topic, period, region, focus });

      const typeLabel = inferredType === 'spreadsheet' ? '报表' : inferredType === 'dashboard' ? '看板' : inferredType === 'summary' ? '摘要' : '报告';

      scheduleReply(() => {
        addSystemMessage(`我理解您的需求：\n• 分析主题：${topic}\n• 时间范围：${period}\n• 区域范围：${region}${focus.length > 0 ? `\n• 关注重点：${focus.join('、')}` : ''}`, undefined, {});
        // 报告类型：先引导选择模板（可选），再进入数据准备
        if (inferredType === 'report') {
          scheduleReply(() => {
            addSystemMessage('您可以选择报告模板来快速生成报告，也可以跳过此步骤直接开始：', 'templateSelect', {});
          }, 600);
        } else {
          // 非报告类型：直接进入数据准备
          scheduleReply(() => {
            addSystemMessage('接下来需要准备分析数据。您可以从以下数据源中选择：', 'dataButtons', {});
            advanceStep('数据准备');
          }, 600);
        }
      }, 800);
      return;
    }

    // 数据准备阶段
    if (currentStep === '数据准备') {
      // 数据准备阶段：用户确认数据
      if (sentText.includes('确认') || sentText.includes('下一步') || sentText.includes('开始')) {
      scheduleReply(() => {
        if (generationType === 'report') {
          addSystemMessage('数据准备完成，正在生成报告大纲...');
          advanceStep('大纲确认');
          scheduleReply(() => {
            addSystemMessage('大纲已生成，请在右侧预览区查看。您可以：\n• 直接说"确认大纲"开始生成报告\n• 说"调整大纲"并提出修改意见\n• 说"重新生成"让AI重新规划大纲');
          }, 1000);
        } else if (generationType === 'spreadsheet') {
          addSystemMessage('数据已确认！正在配置数据报表...\n\n📊 报表配置中：\n• 自动识别指标与维度\n• 生成数据透视表\n• 计算同比/环比');
          advanceStep('产出物生成');
          setReportStatus('final');
          scheduleReply(() => {
            setCurrentStep('追问深化');
            addSystemMessage('数据报表已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
          }, 2000);
        } else if (generationType === 'dashboard') {
          addSystemMessage('数据已确认！正在构建数据看板...\n\n📈 看板配置中：\n• 布局：4宫格\n• 图表：趋势图+对比柱图+占比饼图+指标卡\n• 数据刷新：日更');
          advanceStep('产出物生成');
          setReportStatus('final');
          scheduleReply(() => {
            setCurrentStep('追问深化');
            addSystemMessage('数据看板已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
          }, 2000);
        } else if (generationType === 'summary') {
          addSystemMessage('数据已确认！正在提取关键发现...\n\n📝 摘要生成中：\n• 提取关键发现\n• 识别异常指标\n• 生成行动建议');
          advanceStep('产出物生成');
          setReportStatus('final');
          scheduleReply(() => {
            setCurrentStep('追问深化');
            addSystemMessage('数据摘要已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
          }, 2000);
        } else {
          addSystemMessage('数据准备完成，正在生成报告大纲...');
          advanceStep('大纲确认');
        }
      }, 600);
      return;
    }
      // 数据准备阶段兜底：用户提问、咨询等非确认输入
      const _dpTypeLabel = generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告';
      if (sentText.includes('怎么选') || sentText.includes('怎么操作') || sentText.includes('如何选') || sentText.includes('不知道') || sentText.includes('帮助') || sentText.includes('指引') || sentText.includes('选什么') || sentText.includes('推荐')) {
        scheduleReply(() => {
          addSystemMessage(`好的，我来为您说明数据源选择的操作方式：\n\n1. 选择数据集：从已管理的数据集中选择\n2. 平台指标：从大数据平台指标体系中勾选\n3. 指标树：从指标树管理模块选择\n4. 选择客群：从客群分析模块选择目标客群\n5. 选择报表：从已有报表中选择\n\n您可以根据分析需求选择一个或多个数据源，选好后点击"确认数据"即可。`, 'dataButtons');
        }, 300);
      } else if (sentText.includes('换数据') || sentText.includes('重新选') || sentText.includes('不要这个') || sentText.includes('加指标') || sentText.includes('加一个') || sentText.includes('补充')) {
        setDataConfirmed(false);
        scheduleReply(() => {
          addSystemMessage(`好的，您可以重新选择或补充数据源，之前的选择可以保留或替换。`, 'dataButtons');
        }, 300);
      } else {
        scheduleReply(() => {
          addSystemMessage(`当前正在准备${_dpTypeLabel}所需的数据源。您可以：\n\n• 点击下方数据源按钮选择数据\n• 描述您想分析的数据维度，我来为您推荐\n• 选好数据后说"确认数据"开始生成`, 'dataButtons');
        }, 300);
      }
      return;
    }

    // 大纲确认阶段
    if (currentStep === '大纲确认') {
      if (sentText.includes('确认') || sentText.includes('开始生成') || sentText.includes('开始') || sentText.includes('没问题') || sentText.includes('可以')) {
        scheduleReply(() => {
          addSystemMessage('大纲已确认，开始生成报告...');
          advanceStep('产出物生成');
                    setProcessSteps([
            { label: '数据采集', status: 'completed', logs: mode === 'blank' ? ['已获取12个核心指标数据'] : mode === 'template' ? ['已从模板定义获取数据源', '采集平台指标数据：42项指标', '采集中高端客户标签数据', '采集16地市分公司数据', '数据采集完成'] : mode === 'scenario' ? ['已从场景定义获取关联指标', '采集平台指标数据', '采集客群标签数据', '数据采集完成'] : ['已读取上传数据文件', '识别数据字段：7个', '数据采集完成'], algorithms: [] },
            { label: '数据校验', status: 'running', logs: ['校验数据完整性...'], algorithms: [] },
            { label: '分析引擎', status: 'waiting', logs: [], algorithms: [] },
            { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
          ]);
          // 模拟推进：数据校验完成 → 分析引擎执行
          scheduleReply(() => {
            setProcessSteps(prev => [
              prev[0],
              { ...prev[1], status: 'completed', logs: ['数据完整性校验通过', '口径一致性校验通过'] },
              { ...prev[2], status: 'running', logs: ['正在执行分析引擎...'], algorithms: [
                { type: 'descriptive', name: '描述统计', status: 'running', detail: '计算核心指标环比...' },
                { type: 'time_trend', name: '时间趋势', status: 'waiting', detail: '等待执行' },
                { type: 'group_comparison', name: '分组对比', status: 'waiting', detail: '等待执行' },
                { type: 'anomaly_detection', name: '异常检测', status: 'waiting', detail: '等待执行' },
              ] },
              prev[3],
            ]);
          }, 3000);
          scheduleReply(() => {
            setProcessSteps(prev => [
              prev[0], prev[1],
              { ...prev[2], status: 'completed', logs: ['4类算法执行完毕'], algorithms: [
                { type: 'descriptive', name: '描述统计', status: 'completed', detail: '12个指标环比计算完毕' },
                { type: 'time_trend', name: '时间趋势', status: 'completed', detail: '趋势拟合完成' },
                { type: 'group_comparison', name: '分组对比', status: 'completed', detail: '地市分组对比完成' },
                { type: 'anomaly_detection', name: '异常检测', status: 'completed', detail: '检测到2个异常信号' },
              ] },
              { ...prev[3], status: 'running', logs: ['正在构建报告...'] },
            ]);
          }, 4500);
          scheduleReply(() => {
            setProcessSteps(prev => [prev[0], prev[1], prev[2], { ...prev[3], status: 'completed', logs: ['报告构建完毕，已标注算法来源'] }]);
            advanceStep('追问深化');
                        setReportSections(mockReportSections);
            addSystemMessage('报告已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。', 'findingCard', {
              conclusion: '分析引擎执行完毕，已识别关键发现',
              confidence: 'high',
              details: ['描述统计：12个核心指标环比计算完成', '时间趋势：关键指标趋势拟合完成', '分组对比：16地市分公司对比分析完成', '异常检测：检测到2个异常信号需关注'],
            });
          }, 6000);
        }, 600);
        return;
      }
      // 大纲调整意图识别
      if (sentText.includes('加') && (sentText.includes('章节') || sentText.includes('部分') || sentText.includes('内容'))) {
        scheduleReply(() => {
          addSystemMessage('好的，已在大纲中追加新章节。更新后的大纲请在右侧预览区查看。\n\n您可以继续调整，或回复"确认"开始生成报告。');
          setReportSections(prev => [...prev, { id: `section-new-${Date.now()}`, title: '新增分析章节', paragraphs: [] }]);
        }, 800);
        return;
      }
      if (sentText.includes('删') || sentText.includes('不要') || sentText.includes('去掉')) {
        scheduleReply(() => {
          addSystemMessage('好的，已从大纲中移除对应章节。更新后的大纲请在右侧预览区查看。\n\n您可以继续调整，或回复"确认"开始生成报告。');
        }, 800);
        return;
      }
      if (sentText.includes('换') && (sentText.includes('顺序') || sentText.includes('位置') || sentText.includes('前') || sentText.includes('后'))) {
        scheduleReply(() => {
          addSystemMessage('好的，已调整章节顺序。更新后的大纲请在右侧预览区查看。\n\n您可以继续调整，或回复"确认"开始生成报告。');
        }, 800);
        return;
      }
      if (sentText.includes('改') || sentText.includes('调整') || sentText.includes('修改') || sentText.includes('重新生成')) {
        scheduleReply(() => {
          addSystemMessage('好的，请告诉我您希望如何调整大纲，例如：\n\n• "加一个竞品分析章节"——追加新章节\n• "删除归因分析章节"——移除某章节\n• "第三章和第四章换个顺序"——调整顺序\n• "把标题改为XX"——修改章节标题\n\n调整完毕后回复"确认"即可开始生成报告。');
        }, 800);
        return;
      }
      // 大纲确认阶段的兜底：引导用户调整或确认
      scheduleReply(() => {
        addSystemMessage('当前处于大纲确认阶段。您可以：\n\n• 告诉我如何调整大纲（如"加一个章节""换个顺序"）\n• 回复"确认"开始生成报告\n\n请问您想如何操作？');
      }, 500);
      return;
    }

    // ── 产出物生成阶段：只提示等待 ──
    if (currentStep === '产出物生成') {
      const generatingLabel = generationType === 'report' ? '报告' : generationType === 'spreadsheet' ? '数据报表' : generationType === 'dashboard' ? '数据看板' : '数据摘要';
      scheduleReply(() => {
        addSystemMessage(`${generatingLabel}正在生成中，请稍候。生成完毕后可以继续追问深化。`);
      }, 300);
      return;
    }

    // ── 追问深化阶段：自由对话，执行分析 ──
    if (currentStep === '追问深化') {
    scheduleReply(() => {
      if (sentText.includes('归因') || sentText.includes('为什么') || sentText.includes('原因')) {
        addSystemMessage('正在执行归因分析...');
        scheduleReply(() => {
          addSystemMessage('归因分析完成：', 'findingCard', {
            conclusion: '深度归因：5G基础套餐拉新导致低价值用户占比结构性上升',
            confidence: 'medium',
            details: ['5G基础套餐（39元档）新增用户占新增用户62%', '这部分用户ARPU为28-35元，低于存量平均', '来源：客群归因（L4）', '建议：调整5G基础套餐定价策略'],
          });
        }, 1000);
      } else if (sentText.includes('排名') || sentText.includes('地市')) {
        addSystemMessage('全疆16地市ARPU排名如下：\n\n①克拉玛依 72.3元（环比+0.5%）\n②乌鲁木齐 62.3元（环比-5.1%）\n③石河子 59.1元（环比-1.2%）\n④昌吉 57.8元（环比-2.8%）\n⑤伊犁 55.6元（环比-3.1%）\n...\n⑯喀什 48.2元（环比-8.7%）\n\n降幅最大的3个地市：喀什、乌鲁木齐、和田，建议重点关注。');
      } else if (sentText.includes('对比') || sentText.includes('上月')) {
        addSystemMessage('与上月对比分析：\n\n• ARPU：56.8元 vs 上月58.7元，下降3.2%\n• DOU：15.6GB vs 上月15.0GB，增长4.1%\n• 用户数：1,256万 vs 上月1,234万，增长1.8%\n• 收入：71.3亿 vs 上月72.4亿，下降1.5%\n\n核心变化：用户增长但收入下降，说明新增用户ARPU显著低于存量用户。');
      } else if (sentText.includes('重新选') || sentText.includes('重新选择') || sentText.includes('换数据') || sentText.includes('换指标') || sentText.includes('从头来') || sentText.includes('换模板') || sentText.includes('回到需求') || sentText.includes('重来') || sentText.includes('重新来') || sentText.includes('重选')) {
        // 追问深化阶段的回退请求：礼貌拒绝并引导新建对话
        addSystemMessage('当前分析已基于所选数据完成生成。如需更换数据源或模板，建议新建一个对话重新开始。\n\n在当前对话中，您可以继续对已有分析进行追问深化，例如：\n• "加一个占比分析"\n• "展开归因分析"\n• "导出报告"');
      } else if (sentText.includes('导出')) {
        setShowExportDialog(true);
        addSystemMessage('已为您打开导出弹窗，请选择导出格式。');
      } else {
        addSystemMessage('收到您的消息，正在分析中...');
        scheduleReply(() => {
          // 根据当前报告上下文生成关联分析
          const typeLabel = generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告';
          addSystemMessage('分析完成：', 'findingCard', {
            conclusion: `基于当前${typeLabel}数据，对"${sentText.slice(0, 30)}${sentText.length > 30 ? '...' : ''}"的追问分析`,
            confidence: 'medium',
            details: generationType === 'spreadsheet' ? [
              `基于${typeLabel}已有指标数据进行交叉计算`,
              '新增占比列将基于现有数据列计算得出',
              '计算结果将自动更新到报表中',
              '如需调整计算口径，可继续追问',
            ] : generationType === 'dashboard' ? [
              `基于${typeLabel}已有图表数据进行下钻分析`,
              '新增占比指标将自动配置对应图表',
              '图表布局将自动调整适配',
              '如需调整展示方式，可继续追问',
            ] : generationType === 'summary' ? [
              `基于${typeLabel}已有内容进行补充分析`,
              '新增占比分析将插入到摘要对应位置',
              '关键数据点将标注计算口径',
              '如需深入分析，可继续追问',
            ] : [
              `基于${typeLabel}已有指标数据进行交叉分析`,
              '关联指标环比变化与趋势特征',
              '结合区域/客群维度进行细分对比',
              `如需更深入分析，可继续追问或点击右侧${typeLabel}段落定位分析`,
            ],
          });
        }, 1500);
      }
    }, 800);
    } else if (currentStep === '已归档') {
      // 已归档阶段：不允许对话
      scheduleReply(() => {
        addSystemMessage('当前对话已归档，无法继续对话。请点击"重新打开"恢复对话，或新建一个对话。');
      }, 300);
    }
  };

  const handleQuickCommand = (text: string) => {
    setInputValue(text);
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);

    scheduleReply(() => {
      // ── 软对话意图识别 ──
      // 数据准备阶段：检测数据更换意图
      if (currentStep === '数据准备' && dataConfirmed) {
        if (text.includes('换数据') || text.includes('换个数据源') || text.includes('重新选择数据') || text.includes('不要这个数据') || text.includes('换指标') || text.includes('数据选错了')) {
          setDataConfirmed(false);
          addSystemMessage('好的，已重新开放数据源选择。您可以重新选择数据源，选择后请再次点击"确认数据"。');
          return;
        }
        if (text.includes('加一个') || text.includes('加上') || text.includes('增加指标') || text.includes('补充数据') || text.includes('加个占比')) {
          setDataConfirmed(false);
          addSystemMessage('好的，已重新开放数据源选择，您可以通过下方按钮补充指标或数据源。补充后请再次点击"确认数据"。', 'dataButtons');
          return;
        }
      }
      // 数据准备阶段（未确认）：用户说"加一个占比"等数据补充需求
      if (currentStep === '数据准备' && !dataConfirmed) {
        if (text.includes('加一个') || text.includes('加上') || text.includes('增加指标') || text.includes('补充') || text.includes('占比')) {
          addSystemMessage('好的，我会在分析中加入相关指标。请在下方选择对应的数据源，或告诉我具体需要哪些指标。', 'dataButtons');
          return;
        }
      }
      // 需求收集阶段：跑题输入的重定向
      if (currentStep === '需求收集') {
        if (text.includes('查工单') || text.includes('工单') || text.includes('订单') || text.includes('缴费')) {
          addSystemMessage('当前我们在准备分析需求，工单/订单/缴费查询可以在运营页面进行。\n\n请问您想分析什么内容？例如：\n• "分析乌鲁木齐6月ARPU下降原因"\n• "生成流量运营月度报告"');
          return;
        }
      }

      // V8-P1-2: 数据准备阶段的产出物分支路由
      if (currentStep === '数据准备') {
        if (text.includes('生成报告') || text.includes('写报告') || text.includes('生成分析报告')) {
          addSystemMessage('好的，我将为您生成分析报告。先为您规划报告大纲...');
          setCurrentStep('大纲确认');
          setTimeout(() => {
            addSystemMessage('报告大纲已生成，请在右侧预览区查看。您可以：\n• 点击"确认大纲"开始生成报告\n• 在对话中提出修改意见');
          }, 1000);
          return;
        }
        if (text.includes('Excel') || text.includes('数据表格') || text.includes('导出Excel')) {
          handleExport('excel');
          return;
        }
        if (text.includes('摘要') || text.includes('关键发现')) {
          handleExport('summary');
          return;
        }
        if (text.includes('图表') || text.includes('图表包')) {
          handleExport('chart-pack');
          return;
        }
        if (text.includes('看板') || text.includes('数据看板')) {
          handleExport('dashboard');
          return;
        }
      }
      // 通用快捷指令
      if (text.includes('导出')) {
        setShowExportDialog(true);
        addSystemMessage('已为您打开导出弹窗，请选择导出格式。');
      } else if (text.includes('归因') || text.includes('深入')) {
        addSystemMessage('正在执行更深层归因分析...');
        scheduleReply(() => {
          addSystemMessage('深度归因结果：', 'findingCard', {
            conclusion: '5G基础套餐拉新策略导致低价值用户占比上升',
            confidence: 'medium',
            details: ['5G基础套餐新入网用户占新增62%', '新入网用户ARPU仅28-35元', '来源：客群归因（分析引擎-分组对比算法）'],
          });
        }, 1000);
      } else if (text.includes('排名')) {
        addSystemMessage('全疆16地市ARPU排名：①克拉玛依 72.3元 ②乌鲁木齐 62.3元 ③石河子 59.1元 ... ⑯喀什 48.2元。降幅最大：喀什-8.7%、乌鲁木齐-5.1%。');
      } else if (text.includes('对比')) {
        addSystemMessage('与上月对比：ARPU 56.8→58.7元（-3.2%），DOU 15.6→15.0GB（+4.1%），用户数+1.8%，收入-1.5%。核心变化：用户增但收入降，新增用户ARPU低于存量。');
      } else if (text.includes('重点分析')) {
        addSystemMessage('重点关注ARPU异动归因：', 'findingCard', {
          conclusion: 'ARPU下降主因：低价值套餐用户占比上升',
          confidence: 'high',
          details: ['低价值套餐用户占比+2.3pp', '贡献度：62%', '来源：分解归因（分析引擎-描述统计算法）'],
        });
      }
    }, 600);
  };

  // 处理文件上传选择
  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      addSystemMessage('不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件。');
      return;
    }
    if (dataSourceCategory && dataSourceCategory !== 'dataset') {
      const _cl: Record<string, string> = { indicator: '指标', tree: '指标树', group: '客群', dataset: '数据集', report: '报表' };
      addSystemMessage(`当前已选择${_cl[dataSourceCategory]}类数据源，无法混选上传文件。如需更换请先移除已选数据源。`);
      return;
    }
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    setSelectedDataSources(prev => [...prev, { type: 'upload', name: file.name, detail: `${sizeMB} MB` }]);
    setDataSourceCategory('dataset');
    setShowUploadDialog(false);
    addSystemMessage(`已上传文件"${file.name}"（${sizeMB} MB），正在解析数据结构...`);
    // 模拟解析过程
    scheduleReply(() => {
      const rowCount = Math.floor(Math.random() * 30000) + 1000;
      const colCount = Math.floor(Math.random() * 20) + 5;
      addSystemMessage(`文件解析完成：识别到${colCount}个字段、${rowCount.toLocaleString()}行数据。您可以继续上传其他文件，或点击"确认数据"按钮进入下一步。`);
      // 更新数据源详情
      setSelectedDataSources(prev => prev.map(ds => ds.name === file.name ? { ...ds, detail: `${rowCount.toLocaleString()}行×${colCount}列` } : ds));
    }, 1500);
  };

  // 数据准备快捷按钮处理
  const handleDataButton = (type: string) => {
    // 上传报告模板：特殊处理，不走数据源互斥
    if (type === 'uploadReport') {
      setTemplateConfirmed(true);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.docx,.doc,.pdf';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['docx', 'doc', 'pdf'].includes(ext || '')) {
          addSystemMessage('仅支持 Word（.docx/.doc）和 PDF 格式的报告文件。');
          return;
        }
        const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        setGenerationType('report');
        scheduleReply(() => {
          addSystemMessage(`已接收报告模板"${file.name}"（${sizeStr}），正在提取章节结构...\n\n已提取模板结构：\n• 第1章：总体概况与核心指标\n• 第2章：分项分析与区域对比\n• 第3章：趋势研判与归因分析\n• 第4章：策略建议与行动计划\n\n接下来请提供新数据：\n• 选择已有数据集（点击"选择数据集"按钮）\n• 上传本地数据文件（在数据集弹窗中点击"上传新文件"）`, 'dataButtons', {});
          setReportSections([
            { id: 'upload-1', title: '总体概况与核心指标', paragraphs: [] },
            { id: 'upload-2', title: '分项分析与区域对比', paragraphs: [] },
            { id: 'upload-3', title: '趋势研判与归因分析', paragraphs: [] },
            { id: 'upload-4', title: '策略建议与行动计划', paragraphs: [] },
          ]);
          advanceStep('数据准备');
        }, 1000);
      };
      input.click();
      return;
    }
    // 数据源类别互斥：已选某类别后，其他类别不可选
    if (dataSourceCategory && dataSourceCategory !== type && dataSourceCategory !== 'dataset') {
      const categoryLabels: Record<string, string> = { indicator: '指标', tree: '指标树', group: '客群', dataset: '数据集', report: '报表' };
      addSystemMessage(`当前已选择${categoryLabels[dataSourceCategory]}类数据源，如需切换请先清空已选数据源。`);
      return;
    }
    if (type === 'upload' || type === 'dataset') setShowDatasetDialog(true);
    else if (type === 'indicator') setShowIndicatorDialog(true);
    else if (type === 'tree') setShowTreeDialog(true);
    else if (type === 'group') setShowGroupDialog(true);
    else if (type === 'report') setShowReportDialog(true);
  };

  const handleParagraphClick = (paragraphId: string, sectionTitle: string, content: string) => {
    setActiveParagraphId(paragraphId);
    const contextMsg: ChatMessage = {
        id: `m${Date.now()}`,
        role: 'user',
        content: `关于"${sectionTitle}"中的这段内容，请进一步分析：${content.slice(0, 50)}...`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, contextMsg]);
      setTimeout(() => {
        addSystemMessage('正在分析该段落相关数据...');
        scheduleReply(() => { const _tl = generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告'; addSystemMessage(`分析完成：该段结论基于分解归因（L1），数据来源可靠。归因结果已自动嵌入${_tl}。`); }, 800);
      }, 600);
  };

  const handleContinueQuestion = () => {
    setCurrentStep('追问深化');
    addSystemMessage('请输入您的问题，我可以继续深入分析。您也可以点击右侧报告中的某段文字，我会针对该段内容进行分析。');
  };

  const handleConfirmParagraph = (sectionId: string, paragraphId: string) => {
    setReportSections(prev => prev.map(s => s.id === sectionId ? { ...s, paragraphs: s.paragraphs.map(p => p.id === paragraphId ? { ...p, status: 'confirmed' as ReportStatus } : p) } : s));
    addSystemMessage('段落已确认为"已确认"状态。');
  };

  const handleEditParagraph = (sectionId: string, paragraphId: string) => {
    const section = reportSections.find(s => s.id === sectionId);
    const para = section?.paragraphs.find(p => p.id === paragraphId);
    if (para) { setEditingParagraphId(paragraphId); setEditingContent(para.content); }
  };

  const handleSaveEdit = (sectionId: string, paragraphId: string) => {
    setReportSections(prev => prev.map(s => s.id === sectionId ? { ...s, paragraphs: s.paragraphs.map(p => p.id === paragraphId ? { ...p, content: editingContent, status: 'edited' as ReportStatus } : p) } : s));
    setEditingParagraphId(null);
    setEditingContent('');
    addSystemMessage('段落已修改，标记为"人工编辑"状态。');
  };

  const handleDeleteParagraph = (sectionId: string, paragraphId: string) => {
    setReportSections(prev => prev.map(s => s.id === sectionId ? { ...s, paragraphs: s.paragraphs.map(p => p.id === paragraphId ? { ...p, status: 'deleted' as ReportStatus } : p) } : s));
    addSystemMessage('段落已删除。如需恢复，点击"恢复"按钮。');
  };

  const handleRestoreParagraph = (sectionId: string, paragraphId: string) => {
    setReportSections(prev => prev.map(s => s.id === sectionId ? { ...s, paragraphs: s.paragraphs.map(p => p.id === paragraphId ? { ...p, status: 'pending' as ReportStatus } : p) } : s));
    addSystemMessage('段落已恢复。');
  };

  // V8-P0-2: 归档操作，替代原审核定稿
  const handleArchive = () => {
    setArchiveVisibility('private');
    setShowArchiveConfirm(true);
  };

  const confirmArchive = () => {
    const currentVisibility = archiveVisibility;
    setReportStatus('archived');
    setShowArchiveConfirm(false);
    // 写入归档产出物公共存储
    const fileTypeMap: Record<string, string> = { report: 'docx', spreadsheet: 'xlsx', dashboard: 'pdf', summary: 'txt' };
    addArchivedOutput({
      id: `archived-${Date.now()}`,
      conversationId: activeConversationId || '',
      name: reportTitle || '未命名产出物',
      generationType: generationType as 'report' | 'spreadsheet' | 'dashboard' | 'summary',
      visibility: currentVisibility,
      businessScenario: selectedDataSources.length > 0 ? selectedDataSources[0].detail || selectedDataSources[0].name : undefined,
      fileType: fileTypeMap[generationType] || 'docx',
      archivedAt: Date.now(),
    });
    // 立即持久化visibility到对话状态
    if (activeConversationId) {
      const conv = getConversation(activeConversationId);
      if (conv) {
        saveConversation({ ...conv, reportStatus: 'archived', visibility: currentVisibility, archivedAt: Date.now(), updatedAt: Date.now() });
      }
    }
    addSystemMessage(`已归档！可见性：${currentVisibility === 'private' ? '仅自己' : '本区域'}。您可随时通过"重新打开"继续修改，或直接导出。`);
    // 重置归档可见性为默认值
    setArchiveVisibility('private');
  };

  // V8-P0-2: 重新打开已归档的对话
  const handleReopenFromArchive = () => {
    setReportStatus('draft');
    addSystemMessage('已重新打开，您可以继续修改或追问。修改完成后需重新归档。');
  };

  const handleSaveAsTemplate = () => {
    const templateName = reportTitle || '未命名报告模板';
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName,
      category: '用户自定义',
      chapters: reportSections.map(s => s.title),
      scenario: '',
      sections: reportSections.length,
      updatedAt: new Date().toISOString().slice(0, 10),
      isUserCreated: true,
    };
    // 保存到 localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('ai-insight-user-templates') || '[]');
      existing.push(newTemplate);
      localStorage.setItem('ai-insight-user-templates', JSON.stringify(existing));
    } catch { /* ignore */ }
    addSystemMessage(`已将报告结构保存为模板"${templateName}"。\n\n模板包含${reportSections.length}个章节：\n${reportSections.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}\n\n下次创建报告时可在"从模板库选择"中选择该模板，快速复用。`);
  };

  const handleExport = (format: string) => {
    setShowExportDialog(false);
    const fileName = `${reportTitle}_${new Date().toISOString().slice(0, 10)}`;

    // 导出格式与生成类型映射验证
    const reportFormats = ['word', 'pdf'];
    const excelFormats = ['excel', 'csv'];
    const dashboardFormats = ['dashboard-link', 'dashboard-pdf'];
    const summaryFormats = ['text', 'pdf'];

    if (generationType === 'report' && !reportFormats.includes(format)) {
      addSystemMessage(`⚠️ 洞察报告仅支持导出为 Word 或 PDF 格式。`);
      return;
    }
    if (generationType === 'spreadsheet' && !excelFormats.includes(format)) {
      addSystemMessage(`⚠️ 数据报表仅支持导出为 Excel 或 CSV 格式。`);
      return;
    }
    if (generationType === 'dashboard' && !dashboardFormats.includes(format)) {
      addSystemMessage(`⚠️ 数据看板仅支持导出为在线链接或 PDF 截图格式。`);
      return;
    }
    if (generationType === 'summary' && !summaryFormats.includes(format)) {
      addSystemMessage(`⚠️ 数据摘要仅支持导出为文本或 PDF 格式。`);
      return;
    }

    const formatNames: Record<string, string> = {
      'word': 'Word文档', 'pdf': 'PDF文档',
      'excel': 'Excel数据表格', 'csv': 'CSV文件',
      'dashboard-link': '在线看板链接', 'dashboard-pdf': '看板PDF截图',
      'text': '文本文件',
    };
    const formatName = formatNames[format] || format;
    addSystemMessage(`⏳ ${formatName}已开始导出，完成后将自动下载。\n\n文件名：${fileName}`);
  };
  const handleEmbedFinding = (findingData?: { conclusion: string; confidence: string; details: string[] }) => {
    const data = findingData || { conclusion: '关键发现', confidence: 'medium', details: [] };
    const typeLabel = generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告';

    if (generationType === 'spreadsheet') {
      // 报表类型：追加占比列到数据表中
      addSystemMessage(`✅ 分析结果已更新到${typeLabel}中，新增"占比"列已自动计算并填充，可在右侧${typeLabel}预览中查看。`);
    } else if (generationType === 'dashboard') {
      // 看板类型：新增占比图表
      addSystemMessage(`✅ 分析结果已更新到${typeLabel}中，新增占比图表已自动配置，可在右侧${typeLabel}预览中查看。`);
    } else if (generationType === 'summary') {
      // 摘要类型：追加到摘要中
      addSystemMessage(`✅ 关键发现已嵌入${typeLabel}中，可在右侧${typeLabel}预览中查看。`);
    } else {
      // 报告类型：嵌入到归因分析章节
      setReportSections(prev => {
        const existing = prev.find(s => s.title.includes('归因'));
        if (existing) {
          return prev.map(s => s.title.includes('归因') ? {
            ...s,
            paragraphs: [...s.paragraphs, { id: `p-embed-${Date.now()}`, content: `${data.conclusion}\n\n${data.details.join('\n')}`, type: 'text' as const, status: 'confirmed' as ReportStatus }]
          } : s);
        } else {
          return [...prev, {
            id: `s-attr-${Date.now()}`, title: '归因分析', paragraphs: [{
              id: `p-attr-${Date.now()}`, content: `${data.conclusion}\n\n${data.details.join("\n")}`, type: "text" as const, status: "confirmed" as ReportStatus
            }]
          }];
        }
      });
      if (reportStatus === 'archived') {
        setReportStatus('draft');
        addSystemMessage(`关键发现已嵌入${typeLabel}"归因分析"章节。由于新增了内容，${typeLabel}状态已变更为"进行中"，修改完成后请重新归档。`);
      } else {
        addSystemMessage(`关键发现已嵌入${typeLabel}"归因分析"章节，可在右侧${typeLabel}预览中查看。`);
      }
    }
  };
  const canFinalize = reportSections.length > 0;

  // V8-Fix: 快捷指令按步骤+生成类型动态显示
  const hasUserInput = messages.some(m => m.role === 'user');
  const hasSelectedData = selectedDataSources.length > 0;
  // 导出格式映射：根据generationType动态生成
  const exportFormats: Record<string, { label: string; value: string }[]> = {
    report: [{ label: 'Word', value: 'word' }, { label: 'PDF', value: 'pdf' }],
    spreadsheet: [{ label: 'Excel', value: 'excel' }, { label: 'CSV', value: 'csv' }],
    dashboard: [{ label: '在线链接', value: 'link' }, { label: 'PDF截图', value: 'pdf' }],
    summary: [{ label: '文本', value: 'txt' }, { label: 'PDF', value: 'pdf' }],
  };
  const currentExportFormats = exportFormats[generationType] || exportFormats.report;

  const quickCommands = reportStatus === 'archived'
    ? [
        { label: '重新打开', action: 'reopen' as const, icon: <RotateCcw className="w-3 h-3" /> },
        { label: '导出为▼', action: 'exportAs' as const, icon: <Download className="w-3 h-3" /> },
        ...(generationType === 'report' ? [{ label: '保存为模板', action: 'saveAsTemplate' as const, icon: <Bookmark className="w-3 h-3" /> }] : []),
        { label: '前往下载', action: 'goToDownload' as const, icon: <ExternalLink className="w-3 h-3" /> },
      ]
    : currentStep === '需求收集'
    ? [
        // 需求收集阶段无快捷按钮，用户发送消息后AI自动推进到数据准备
      ]
    : currentStep === '数据准备'
    ? [
        ...(hasSelectedData ? [{ label: '确认数据', action: 'confirmData' as const, icon: <CheckCircle className="w-3 h-3" /> }] : []),
      ]
    : currentStep === '大纲确认'
    ? [
        { label: '确认大纲', action: 'confirmOutline' as const, icon: <CheckCircle className="w-3 h-3" /> },
      ]
    : currentStep === '产出物生成'
    ? [
        // 产出物生成中，不显示任何快捷按钮
      ]
    : currentStep === '追问深化'
    ? [
        { label: '导出为▼', action: 'exportAs' as const, icon: <Download className="w-3 h-3" /> },
        ...(generationType === 'report' ? [{ label: '保存为模板', action: 'saveAsTemplate' as const, icon: <Bookmark className="w-3 h-3" /> }] : []),
        { label: '归档', action: 'archive' as const, icon: <Archive className="w-3 h-3" /> },
      ]
    : [];

  // MatchTable 回调：确认匹配结果
  const handleBatchConfirm = () => {
    addSystemMessage('匹配结果已确认，继续推进分析...');
  };

  // MatchTable 回调：修改匹配结果
  const handleModify = () => {
    addSystemMessage('请告诉我需要调整哪些匹配项？');
  };

  const handleQuickButtonClick = (cmd: { label: string; action: string }) => {
    const action = cmd.action;
    // 重新打开
    if (action === 'reopen') {
      handleReopenFromArchive();
      return;
    }
    // 前往下载中心
    if (action === 'goToDownload') {
      router.push('/portal/capability/download/zone?tab=ai-insight');
      return;
    }
    // 确认数据 - 根据生成类型决定下一步
    if (action === 'confirmData') {
      setDataConfirmed(true); // 数据确认后置灰数据源按钮
      if (generationType === 'report') {
        addSystemMessage('数据已确认！正在根据您的需求生成报告大纲...');
        setCurrentStep('大纲确认');
      } else if (generationType === 'spreadsheet') {
        addSystemMessage('数据已确认！正在配置数据报表...\n\n📊 报表配置中：\n• 自动识别指标与维度\n• 生成数据透视表\n• 计算同比/环比\n\n请稍候...');
        setCurrentStep('产出物生成');
        setTimeout(() => {
          setCurrentStep('追问深化');
          addSystemMessage('数据报表已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
        }, 4000);
      } else if (generationType === 'dashboard') {
        addSystemMessage('数据已确认！正在配置数据看板...\n\n📈 看板配置中：\n• 布局：4宫格\n• 图表：趋势图+对比柱图+占比饼图+指标卡\n• 数据刷新：日更\n\n请稍候...');
        setCurrentStep('产出物生成');
        setTimeout(() => {
          setCurrentStep('追问深化');
          addSystemMessage('数据看板已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
        }, 4000);
      } else if (generationType === 'summary') {
        addSystemMessage('数据已确认！正在生成数据摘要...\n\n📝 摘要生成中：\n• 提取关键发现\n• 识别异常指标\n• 生成行动建议\n\n请稍候...');
        setCurrentStep('产出物生成');
        setTimeout(() => {
          setCurrentStep('追问深化');
          addSystemMessage('数据摘要已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。');
        }, 4000);
      } else {
        addSystemMessage('数据已确认！请告诉我您希望的输出形式：\n\n• 说"生成报告" → 先生成大纲，再生成完整报告\n• 说"导出Excel" → 直接导出数据表格\n• 说"生成摘要" → 输出关键发现摘要\n• 说"生成看板" → 创建在线数据看板');
        setCurrentStep('大纲确认');
      }
      return;
    }
    // 导出为▼已改为DropdownMenu，此处不再需要处理
    // 大纲操作：确认大纲 - 统一走右侧面板的分析引擎流程
    if (action === 'confirmOutline') {
      addSystemMessage('大纲已确认，开始生成报告...');
      setCurrentStep('产出物生成');
            setProcessSteps([
        { label: '数据采集', status: 'completed', logs: mode === 'blank' ? ['已获取12个核心指标数据'] : mode === 'template' ? ['已从模板定义获取数据源', '采集平台指标数据：42项指标', '采集中高端客户标签数据', '采集16地市分公司数据', '数据采集完成'] : mode === 'scenario' ? ['已从场景定义获取关联指标', '采集平台指标数据', '采集客群标签数据', '数据采集完成'] : ['已读取上传数据文件', '识别数据字段：7个', '数据采集完成'], algorithms: [] },
        { label: '数据校验', status: 'running', logs: ['校验数据完整性...'], algorithms: [] },
        { label: '分析引擎', status: 'waiting', logs: [], algorithms: [] },
        { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
      ]);
      setTimeout(() => {
        setProcessSteps(prev => [
          prev[0],
          { ...prev[1], status: 'completed', logs: ['数据完整性校验通过', '口径一致性校验通过'] },
          { ...prev[2], status: 'running', logs: ['正在执行分析引擎...'], algorithms: [
            { type: 'descriptive' as AlgorithmType, name: '描述统计', status: 'running' as const, detail: '计算核心指标环比...' },
            { type: 'time_trend' as AlgorithmType, name: '时间趋势', status: 'waiting' as const, detail: '等待执行' },
            { type: 'group_comparison' as AlgorithmType, name: '分组对比', status: 'waiting' as const, detail: '等待执行' },
            { type: 'anomaly_detection' as AlgorithmType, name: '异常检测', status: 'waiting' as const, detail: '等待执行' },
          ] },
          prev[3],
        ]);
      }, 2000);
      setTimeout(() => {
        setProcessSteps(prev => [
          prev[0],
          prev[1],
          { ...prev[2], status: 'completed', logs: ['分析引擎执行完成'], algorithms: [
            { type: 'descriptive' as AlgorithmType, name: '描述统计', status: 'completed' as const, detail: '已完成' },
            { type: 'time_trend' as AlgorithmType, name: '时间趋势', status: 'completed' as const, detail: '已完成' },
            { type: 'group_comparison' as AlgorithmType, name: '分组对比', status: 'completed' as const, detail: '已完成' },
            { type: 'anomaly_detection' as AlgorithmType, name: '异常检测', status: 'completed' as const, detail: '已完成' },
          ] },
          { ...prev[3], status: 'running', logs: ['正在构建报告...'], algorithms: [] },
        ]);
      }, 4000);
      setTimeout(() => {
        setProcessSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'completed' as const } : s));
        setReportSections(mockReportSections);
        setCurrentStep('追问深化');
        setReportStatus('draft');
                const _typeLabel = generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告';
                const _exportHint = generationType === 'spreadsheet' ? 'Excel或CSV' : generationType === 'dashboard' ? '在线链接或PDF截图' : generationType === 'summary' ? '文本或PDF' : 'Word或PDF';
                addSystemMessage(`${_typeLabel}生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。\n\n💡 您也可以通过"导出为▼"将分析结果导出为${_exportHint}。`);
      }, 6000);
      return;
    }
    // 保存为模板
    if (action === 'saveAsTemplate') {
      handleSaveAsTemplate();
      return;
    }
    // 归档
    if (action === 'archive') {
      handleArchive();
      return;
    }
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 顶部状态栏 */}
      <div className="border-b px-4 py-2.5 flex items-center justify-between bg-background shrink-0">
        <div className="flex items-center gap-3">
          <div>
            {editingTitle ? (
              <input
                className="text-sm font-semibold bg-transparent border-b border-primary outline-none px-1 py-0"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={() => { setReportTitle(titleInput || reportTitle); setEditingTitle(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { setReportTitle(titleInput || reportTitle); setEditingTitle(false); } }}
                autoFocus
              />
            ) : (
              <h1 className="text-sm font-semibold cursor-pointer hover:text-primary/80 group flex items-center gap-1" onClick={() => { setTitleInput(reportTitle); setEditingTitle(true); }}>
                {reportTitle}
                <PenLine className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h1>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-xs h-5 px-1.5 ${reportStatus === 'archived' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                <Clock className="w-3 h-3 mr-0.5" />{reportStatus === 'archived' ? '已归档' : '进行中'}
              </Badge>
              {mode === 'template' && initialScenario && (
                <span className="text-xs text-muted-foreground">模板：{initialScenario}</span>
              )}
              {mode === 'scenario' && initialScenario && (
                <span className="text-xs text-muted-foreground">场景：{initialScenario}</span>
              )}
              {mode === 'upload' && initialScenario && (
                <span className="text-xs text-muted-foreground">数据源：{initialScenario}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* V8-P0-2: 审核定稿已删除，简化为归档+导出 */}
          {reportStatus === 'archived' ? (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleReopenFromArchive}>重新打开</Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowExportDialog(true)}><Download className="w-3.5 h-3.5" />导出</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleArchive} disabled={reportSections.length === 0}><Archive className="w-3.5 h-3.5" />归档</Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowExportDialog(true)} disabled={reportSections.length === 0}><Download className="w-3.5 h-3.5" />导出</Button>
            </>
          )}
        </div>
      </div>

      {/* 流程步骤条（仅进度指示，不可点击） + 审核模式退出按钮 */}
      {/* V8-P0-1: 步骤导航条已隐藏，内部步骤逻辑保留 */}

      {/* 主内容区：左对话 + 右预览 */}
      <div className="flex-1 flex overflow-hidden">

        {/* ===== 左栏：对话区 ===== */}
        <div className={`${showRightPanel ? 'w-[40%]' : 'flex-1'} border-r flex flex-col bg-background`}>
          <div className="px-4 py-2.5 border-b flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">对话 · {currentStep}</span>
            <Badge variant="secondary" className="text-xs h-5 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />在线</Badge>

          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">


            {/* 快捷能力入口卡片 - 仅在对话初期显示 */}
            {messages.length <= 2 && currentStep === '需求收集' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { icon: <FileText className="w-4 h-4" />, label: '洞察报告', desc: 'AI生成深度分析报告', color: 'text-blue-600 bg-blue-50', prompt: '帮我生成一份洞察报告', genType: 'report' as GenerationType },
                  { icon: <FileSpreadsheet className="w-4 h-4" />, label: '数据报表', desc: 'Excel格式数据报表', color: 'text-emerald-600 bg-emerald-50', prompt: '帮我生成一份数据报表', genType: 'spreadsheet' as GenerationType },
                  { icon: <LayoutDashboard className="w-4 h-4" />, label: '数据看板', desc: '在线可视化看板', color: 'text-violet-600 bg-violet-50', prompt: '帮我配置一个数据看板', genType: 'dashboard' as GenerationType },
                  { icon: <FileCheck className="w-4 h-4" />, label: '数据摘要', desc: '关键发现快速摘要', color: 'text-amber-600 bg-amber-50', prompt: '帮我生成一份数据摘要', genType: 'summary' as GenerationType },
                ].map((item) => (
                  <button key={item.label} className="flex items-center gap-2.5 p-3 rounded-lg border hover:border-primary/40 hover:bg-muted/50 transition-colors text-left" onClick={() => { setGenerationType(item.genType); handleSend(item.prompt); }}>
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>{item.icon}</div>
                    <div><div className="text-sm font-medium">{item.label}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
                  </button>
                ))}
              </div>
            )}

            {messages.map(msg => {
              // templateSelect消息：仅在需求收集阶段+报告类型时显示，跳过模板后整条消息隐藏
              if (msg.component === 'templateSelect' && !(generationType === 'report' && currentStep === '需求收集')) {
                return null;
              }
              return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2' : 'bg-muted rounded-xl rounded-tl-sm px-3 py-2'}`}>
                  {msg.role === 'system' && (
                    <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /><span className="text-xs font-medium">AI洞察助手</span></div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.component === 'matchTable' && msg.componentData && (
                    <div className="mt-2"><MatchTable data={msg.componentData as { items: { name: string; source: string; confidence: 'high' | 'medium' | 'low' }[] }} onBatchConfirm={handleBatchConfirm} onModify={handleModify} /></div>
                  )}
                  {msg.component === 'findingCard' && msg.componentData && (
                    <div className="mt-2"><FindingCard data={msg.componentData as { conclusion: string; confidence: 'high' | 'medium' | 'low'; details: string[] }} onEmbed={() => handleEmbedFinding(msg.componentData as { conclusion: string; confidence: string; details: string[] })} showEmbed={['产出物生成','追问深化'].includes(currentStep)} typeLabel={generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : generationType === 'summary' ? '摘要' : '报告'} /></div>
                  )}
                  {msg.component === 'outlinePreview' && msg.componentData && (() => {
                    type StringOrObject = string | { label: string; action: string; description?: string };
                    const rawOptions = (msg.componentData as { options: StringOrObject[] }).options;
                    const normalizeOption = (opt: StringOrObject): { label: string; action: string } => {
                      if (typeof opt === 'string') return { label: opt, action: '' };
                      return { label: opt.label, action: opt.action || '' };
                    };
                    return (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rawOptions.map((rawOpt, i) => {
                          const { label, action } = normalizeOption(rawOpt);
                          return (
                            <Button key={i} size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                              if (action === 'confirmImportStructure') {
                                handleSend('确认结构，继续');
                              } else if (action === 'adjustImportStructure') {
                                handleSend('调整结构');
                              } else if (action === 'reuploadReport') {
                                handleSend('重新上传报告');
                              } else if (label === '保存为模板') {
                                handleSaveAsTemplate();
                              } else if (label === '提取洞察到知识库') {
                                const sectionCount = reportSections.length;
                                const keyFindings = reportSections
                                  .filter(s => s.paragraphs && s.paragraphs.length > 0)
                                  .map(s => `${s.title}：${s.paragraphs![0].content.substring(0, 40)}...`)
                                  .join('\n');
                                addSystemMessage(`✅ 已完成洞察提取！从报告的${sectionCount}个章节中自动沉淀了关键洞察：\n\n${keyFindings || '暂无核心洞察'}\n\n可在「洞察知识库」中查看和管理这些洞察记录。`);
                              } else if (label.includes('自选模板')) {
                                setShowTemplateDialog(true);
                              } else if (label.includes('模板')) {
                                const templateName = label.replace('使用', '').replace('模板', '');
                                const template = templateList.find(t => t.name.includes(templateName));
                                addSystemMessage(template
                                  ? `已选择"${template.name}"模板，包含${template.chapters.length}个章节：${template.chapters.join('、')}。\n\n已根据模板重新生成报告大纲，请确认后开始分析。`
                                  : `已选择模板，请确认大纲后开始分析。`);
                              } else if (label === '确认大纲，开始生成' || label === '确认大纲') {
                                advanceStep('产出物生成');
                                                                setProcessSteps([
                                  { label: '数据采集', status: 'completed', logs: ['采集平台指标数据', '数据采集完成'], algorithms: [] },
                                  { label: '数据校验', status: 'running', logs: ['校验数据完整性...'], algorithms: [] },
                                  { label: '分析引擎', status: 'waiting', logs: [], algorithms: [] },
                                  { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
                                ]);
                                addSystemMessage('大纲已确认，开始生成报告...');
                                setTimeout(() => {
                                  setProcessSteps(prev => [prev[0], { ...prev[1], status: 'completed', logs: ['数据完整性校验通过'] }, { ...prev[2], status: 'running', logs: ['正在执行分析引擎...'] }, prev[3]]);
                                }, 2000);
                                setTimeout(() => {
                                  setProcessSteps(prev => [prev[0], prev[1], { ...prev[2], status: 'completed', logs: ['分析引擎执行完毕'] }, { ...prev[3], status: 'running', logs: ['正在构建报告...'] }]);
                                }, 4000);
                                setTimeout(() => {
                                  setProcessSteps(prev => [prev[0], prev[1], prev[2], { ...prev[3], status: 'completed', logs: ['报告构建完毕'] }]);
                                  advanceStep('追问深化');
                                                                    setReportSections(mockReportSections);
                                  addSystemMessage('报告已生成完毕！您可以在右侧预览区查看。', 'findingCard', {
                                    conclusion: '分析引擎执行完毕，已识别关键发现',
                                    confidence: 'high',
                                    details: ['描述统计：核心指标环比计算完成', '时间趋势：关键指标趋势拟合完成', '分组对比：地市分公司对比分析完成', '异常检测：检测到2个异常信号'],
                                  });
                                }, 6000);
                              } else if (label === '调整大纲结构' || label === '调整大纲') {
                                setOutlineEditing(true);
                                addSystemMessage('已进入大纲编辑模式，您可以在右侧直接调整章节结构和标题。');
                              } else if (label === '增加章节') {
                                setOutlineEditing(true);
                                addSystemMessage('已进入大纲编辑模式，点击右侧"添加新章节"或"添加小节"来增加章节。');
                              } else {
                                addSystemMessage('已启动AI自动框架生成，正在分析数据结构并规划章节...\n\nAI已自动生成最优分析框架，请确认大纲后开始分析。');
                              }
                            }}>{label}</Button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {msg.component === 'welcomeSuggestions' && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        { label: '分析6月流量运营情况', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        { label: '收入波动归因分析', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                        { label: '中高端客户保有分析', icon: <Users className="w-3.5 h-3.5" /> },
                      ].map(btn => (
                        <Button key={btn.label} size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleSend(btn.label)}>
                          {btn.icon}{btn.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  {msg.component === 'dataButtons' && (
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {[
                        { key: 'dataset', label: '选择数据集', icon: <Database className="w-3.5 h-3.5" /> },
                        { key: 'indicator', label: '平台指标', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        { key: 'tree', label: '指标树', icon: <GitBranch className="w-3.5 h-3.5" /> },
                        { key: 'group', label: '选择客群', icon: <Users className="w-3.5 h-3.5" /> },
                        { key: 'report', label: '选择报表', icon: <FileText className="w-3.5 h-3.5" /> },
                        { key: 'uploadReport', label: '上传报告模板', icon: <FileUp className="w-3.5 h-3.5" />, reportOnly: true },
                      ].filter(btn => btn.key !== 'uploadReport' || (generationType === 'report' && !templateConfirmed)).map(btn => {
                        // 按钮置灰逻辑：数据确认后/产出物生成/追问深化/已归档阶段置灰数据源按钮
                        const isDataBtn = btn.key !== 'uploadReport';
                        const isDisabled = isDataBtn && (dataConfirmed || currentStep === '产出物生成' || currentStep === '追问深化' || currentStep === '已归档');
                        return (
                        <Button key={btn.key} size="sm" variant="outline" className="h-8 text-xs gap-1.5 justify-start" disabled={isDisabled} onClick={() => !isDisabled && handleDataButton(btn.key)}>
                          {btn.icon}{btn.label}
                        </Button>
                      )})}
                    </div>
                  )}
                  {msg.component === 'dataUpload' && msg.componentData && (() => {
                    const ud = msg.componentData as { title?: string; description?: string; accept?: string };
                    return (
                      <div className="mt-3 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = ud.accept || '.docx,.pdf,.xlsx,.csv';
                        input.onchange = () => {
                          const file = input.files?.[0];
                          if (file) {
                            handleSend(`已上传文件：${file.name}`);
                          }
                        };
                        input.click();
                      }}>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">{ud.title || '点击上传文件'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ud.description || '支持 .docx / .pdf / .xlsx / .csv 格式'}</p>
                      </div>
                    );
                  })()}
                  {msg.component === 'templateSelect' && generationType === 'report' && currentStep === '需求收集' && (() => {
                    const sharedReports = [
                      { id: 'r1', title: '流量运营专项分析', period: '2026年Q1', version: 'v1.0' },
                      { id: 'r2', title: '收入波动归因分析', period: '2026年5月', version: 'v2.1' },
                      { id: 'r3', title: '中高端客户保有分析', period: '2026年Q2', version: 'v1.3' },
                    ];
                    return (
                      <div className="mt-3 space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">已归档报告（点击选择）</p>
                          {sharedReports.map((r) => (
                            <div key={r.id} className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setTemplateConfirmed(true);
                              addSystemMessage(`已选择模板："${r.title}"（${r.period}，${r.version}）。正在提取章节结构...`);
                              scheduleReply(() => {
                                const sectionNames = ['整体经营概况', '分解归因分析', '区域对比分析', '客群分析', '策略建议'];
                                addSystemMessage(`模板解析完成！识别到以下章节：\n\n${sectionNames.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n接下来请选择数据源，我将基于此模板和新数据生成报告。`, 'dataButtons');
                                setReportSections(sectionNames.map((s, i) => ({ id: `tpl-${i + 1}`, title: s, paragraphs: [] })));
                                advanceStep('数据准备');
                              }, 1500);
                            }}>
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{r.title}</p>
                                <p className="text-xs text-muted-foreground">{r.period} · {r.version}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-muted px-2 text-muted-foreground">或</span></div>
                        </div>
                        <Button variant="outline" className="w-full h-10 gap-2" onClick={() => setTemplateLibOpen(true)}>
                          <BookOpen className="w-4 h-4" />
                          从模板库选择
                        </Button>
                        <Button variant="outline" className="w-full h-10 gap-2" onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.docx,.pdf';
                          input.onchange = () => {
                            setTemplateConfirmed(true);
                            addSystemMessage('报告文件已上传，正在解析章节结构...');
                            scheduleReply(() => {
                              addSystemMessage('报告解析完成！识别到以下结构：\n\n1. 整体经营概况\n2. 分解归因分析\n3. 区域对比分析\n4. 客群分析\n5. 策略建议\n\n识别到6个关键指标：ARPU、DOU、出账用户数、5G渗透率、收入、流量。\n\n请确认解析结果，然后上传或选择新数据，我将按相同结构生成新报告。', 'dataButtons', { suggestions: ['确认结构，上传新数据'] });
                              setReportSections([
                                { id: 'tpl-1', title: '整体经营概况', paragraphs: [] },
                                { id: 'tpl-2', title: '分解归因分析', paragraphs: [] },
                                { id: 'tpl-3', title: '区域对比分析', paragraphs: [] },
                                { id: 'tpl-4', title: '客群分析', paragraphs: [] },
                                { id: 'tpl-5', title: '策略建议', paragraphs: [] },
                              ]);
                              advanceStep('数据准备');
                            }, 2000);
                          };
                          input.click();
                        }}>
                          <FileUp className="w-4 h-4" />
                          上传报告模板（Word/PDF）
                        </Button>
                        <Button variant="ghost" className="w-full h-10 gap-2 text-muted-foreground" onClick={() => handleSend('跳过模板选择，直接开始')}>
                          不使用模板，直接开始
                        </Button>
                      </div>
                    );
                  })()}
                  {msg.component === 'suggestions' && (msg.componentData?.suggestions as string[] | undefined)?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {((msg.componentData?.suggestions as string[]) || []).map((s: string, i: number) => {
                        const isUploadReport = s.includes('上传报告');
                        return (
                          <Button key={i} size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => {
                            if (isUploadReport) {
                              // 触发报告文件上传
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.docx,.pdf';
                              input.onchange = () => {
                                addSystemMessage('报告文件已上传，正在解析章节结构和关键指标...\n\n解析中，请稍候...');
                                scheduleReply(() => {
                                  addSystemMessage('报告解析完成！识别到以下结构：\n\n1. 整体经营概况\n2. 分解归因分析\n3. 区域对比分析\n4. 客群分析\n5. 策略建议\n\n识别到6个关键指标：ARPU、DOU、出账用户数、5G渗透率、收入、流量。\n\n请确认解析结果，然后上传或选择新数据，我将按相同结构生成新报告。', 'outlinePreview', { options: ['确认结构，上传新数据', '调整结构', '重新解析'] });
                                }, 2000);
                              };
                              input.click();
                            } else if (s.includes('上传新数据')) {
                              handleDataButton('upload');
                            } else {
                              handleSend(s);
                            }
                          }}>
                            {isUploadReport ? <FileInput className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                            {s}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  <div className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.timestamp}</div>
                </div>
              </div>
            );
            })}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">AI正在思考中...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 快捷指令 */}
          <div className="px-4 py-1.5 border-t bg-muted/20 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs text-muted-foreground shrink-0">快捷：</span>
              {quickCommands.map(cmd => (
                cmd.action === 'exportAs' ? (
                  <DropdownMenu key={cmd.label}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 text-xs gap-1 shrink-0 px-2">
                        {cmd.icon}{cmd.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[160px]">
                      {currentExportFormats.map(fmt => (
                        <DropdownMenuItem key={fmt.value} onClick={() => handleExport(fmt.value)}>
                          {fmt.value === 'word' || fmt.value === 'pdf' ? <FileText className="w-3.5 h-3.5 mr-2" /> :
                           fmt.value === 'excel' || fmt.value === 'csv' ? <Database className="w-3.5 h-3.5 mr-2" /> :
                           fmt.value === 'link' ? <Activity className="w-3.5 h-3.5 mr-2" /> :
                           <FileCheck className="w-3.5 h-3.5 mr-2" />}
                          {fmt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button key={cmd.label} variant="outline" size="sm" className="h-6 text-xs gap-1 shrink-0 px-2" onClick={() => handleQuickButtonClick(cmd)}>
                    {cmd.icon}{cmd.label}
                  </Button>
                )
              ))}

            </div>
          </div>

          {/* 输入区 */}
          <div className="px-4 py-3 border-t shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={reportStatus === 'archived' ? '已归档，点击"重新打开"继续编辑' : isGenerating ? 'AI正在生成中，请等待...' : currentStep === '需求收集' ? '描述您的数据分析需求，如：分析乌鲁木齐6月ARPU下降原因' : '输入消息，追问或调整...（Shift+Enter换行）'}
                  disabled={isGenerating || reportStatus === 'archived'}
                  className="w-full text-sm leading-relaxed p-2 border rounded-lg bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                  style={{ minHeight: '72px', maxHeight: '144px' }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 144) + 'px';
                  }}
                />
              </div>
              <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => handleSend()} disabled={isGenerating}><Send className="w-4 h-4" /></Button>
              {isGenerating && (
                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 shrink-0" onClick={stopGenerating} title="停止生成"><Square className="w-3.5 h-3.5" /></Button>
              )}
            </div>
            <p className="text-[11px] text-center text-muted-foreground/60 mt-1.5">内容由AI生成，仅供参考</p>
          </div>
        </div>

        {/* ===== 右栏：动态预览区（可折叠）===== */}
        {showRightPanel ? (
        <div className="w-[60%] overflow-y-auto bg-muted/10 border-l">
          <div className="px-3 py-2 border-b flex items-center justify-between shrink-0 sticky top-0 bg-muted/10 z-10">
            <span className="text-xs font-medium text-muted-foreground">预览</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowRightPanel(false)} title="收起预览"><PanelRightClose className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="p-6 max-w-4xl mx-auto">

            {/* ── 需求收集：引导文案 ── */}
            {currentStep === '需求收集' && (
              <div className="border rounded-xl p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground">在左侧对话中描述您的分析需求</div>
                <div className="text-xs text-muted-foreground mt-1">AI将自动理解并整理您的需求</div>
              </div>
            )}

            {/* ── 数据准备：已选数据源 ── */}
            {currentStep === '数据准备' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-semibold">已选数据源</h2>
                  {selectedDataSources.length > 0 && (
                    <Badge variant="secondary" className="text-xs">{selectedDataSources.length}项</Badge>
                  )}
                </div>

                {/* 账期选择器 - 数据集类不需要选账期 */}
                {dataSourceCategory !== 'dataset' && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="text-xs font-medium text-muted-foreground">分析账期</div>
                  </div>
                  <div className="flex gap-1.5">
                    {(['daily', 'monthly', 'quarterly', 'semi-annual', 'annual'] as const).map(t => (
                      <button
                        key={t}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors ${accountPeriodType === t ? 'bg-primary text-primary-foreground' : 'bg-background border hover:border-primary/50'}`}
                        onClick={() => setAccountPeriodType(t)}
                      >
                        {t === 'daily' ? '日度' : t === 'monthly' ? '月度' : t === 'quarterly' ? '季度' : t === 'semi-annual' ? '半年' : '年度'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {accountPeriodType === 'daily' && (
                      <>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.year}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, year: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                          ))}
                        </select>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.month}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, month: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}月</option>
                          ))}
                        </select>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.day ?? new Date().getDate()}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, day: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}日</option>
                          ))}
                        </select>
                      </>
                    )}
                    {accountPeriodType === 'monthly' && (
                      <>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.year}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, year: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                          ))}
                        </select>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.month}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, month: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}月</option>
                          ))}
                        </select>
                      </>
                    )}
                    {accountPeriodType === 'quarterly' && (
                      <>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.year}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, year: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                          ))}
                        </select>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.quarter ?? Math.ceil((accountPeriodValue.month || 1) / 3)}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, quarter: Number(e.target.value) }))}
                        >
                          <option value={1}>Q1</option>
                          <option value={2}>Q2</option>
                          <option value={3}>Q3</option>
                          <option value={4}>Q4</option>
                        </select>
                      </>
                    )}
                    {accountPeriodType === 'semi-annual' && (
                      <>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.year}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, year: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                          ))}
                        </select>
                        <select
                          className="text-xs border rounded-md px-2 py-1 bg-background"
                          value={accountPeriodValue.semiAnnual ?? (accountPeriodValue.month || 1) <= 6 ? 1 : 2}
                          onChange={e => setAccountPeriodValue(prev => ({ ...prev, semiAnnual: Number(e.target.value) }))}
                        >
                          <option value={1}>上半年</option>
                          <option value={2}>下半年</option>
                        </select>
                      </>
                    )}
                    {accountPeriodType === 'annual' && (
                      <select
                        className="text-xs border rounded-md px-2 py-1 bg-background"
                        value={accountPeriodValue.year}
                        onChange={e => setAccountPeriodValue(prev => ({ ...prev, year: Number(e.target.value) }))}
                      >
                        {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}年</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                )}
                {selectedDataSources.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDataSources.map((ds, idx) => (
                      <div key={idx} className="flex items-center gap-3 border rounded-lg p-3 bg-background group">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          {ds.type === 'upload' ? <Upload className="w-4 h-4 text-primary" /> :
                           ds.type === 'dataset' ? <Database className="w-4 h-4 text-primary" /> :
                           ds.type === 'indicator' ? <BarChart3 className="w-4 h-4 text-primary" /> :
                           ds.type === 'tree' ? <GitBranch className="w-4 h-4 text-primary" /> :
                           ds.type === 'report' ? <FileSpreadsheet className="w-4 h-4 text-primary" /> :
                           <Users className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{ds.name}</div>
                          {ds.detail && <div className="text-xs text-muted-foreground">{ds.detail}</div>}
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {ds.type === 'upload' ? '上传文件' :
                           ds.type === 'dataset' ? '数据集' :
                           ds.type === 'indicator' ? '平台指标' :
                           ds.type === 'tree' ? '指标树' :
                           ds.type === 'report' ? '报表' : '客群'}
                        </Badge>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                          title="移除"
                          onClick={() => {
                            setSelectedDataSources(prev => prev.filter((_, i) => i !== idx));
                            if (selectedDataSources.length <= 1) {
                              setDataSourceCategory(null);
                              setDataConfirmed(false);
                            }
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                        onClick={() => {
                          setSelectedDataSources([]);
                          setDataSourceCategory(null);
                          setDataConfirmed(false);
                        }}
                      >
                        <Trash2 className="w-3 h-3" /> 清空全部
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-xl p-8 text-center">
                    <Database className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <div className="text-sm text-muted-foreground">请在对话中选择数据源</div>
                    <div className="text-xs text-muted-foreground mt-1">点击快捷按钮上传文件或选择平台指标</div>
                  </div>
                )}
                {selectedDataSources.length > 0 && (
                  <>
                    {/* 数据概要 */}
                    <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">数据概要</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs"><span className="text-muted-foreground">数据源数量：</span>{selectedDataSources.length}项</div>
                        <div className="text-xs"><span className="text-muted-foreground">数据源类别：</span>{selectedDataSources.some(ds => ds.type === 'dataset') ? '数据集' : selectedDataSources.some(ds => ds.type === 'indicator') ? '平台指标' : selectedDataSources.some(ds => ds.type === 'tree') ? '指标树' : selectedDataSources.some(ds => ds.type === 'report') ? '报表' : selectedDataSources.some(ds => ds.type === 'group') ? '客群' : '上传文件'}</div>
                        {dataSourceCategory === 'dataset' ? (
                          <div className="text-xs"><span className="text-muted-foreground">数据集自带账期：</span>{selectedDataSources[0]?.detail || '上传数据中'}</div>
                        ) : (
                          <div className="text-xs"><span className="text-muted-foreground">分析账期：</span>{accountPeriodType === 'daily' ? `${accountPeriodValue.year}年${accountPeriodValue.month}月${accountPeriodValue.day ?? new Date().getDate()}日` : accountPeriodType === 'monthly' ? `${accountPeriodValue.year}年${accountPeriodValue.month}月` : accountPeriodType === 'quarterly' ? `${accountPeriodValue.year}年Q${accountPeriodValue.quarter ?? Math.ceil((accountPeriodValue.month || 1) / 3)}` : accountPeriodType === 'semi-annual' ? `${accountPeriodValue.year}年${(accountPeriodValue.semiAnnual ?? ((accountPeriodValue.month || 1) <= 6 ? 1 : 2)) === 1 ? '上半年' : '下半年'}` : `${accountPeriodValue.year}年`}</div>
                        )}
                        {selectedDataSources.some(ds => ds.type === 'indicator') && (
                          <div className="text-xs"><span className="text-muted-foreground">覆盖指标：</span>{selectedDataSources.filter(ds => ds.type === 'indicator').length}个</div>
                        )}
                        {selectedDataSources.some(ds => ds.type === 'report') && (
                          <div className="text-xs"><span className="text-muted-foreground">已选报表：</span>{selectedDataSources.filter(ds => ds.type === 'report').length}份</div>
                        )}
                        {selectedDataSources.some(ds => ds.type === 'dataset') && (
                          <div className="text-xs"><span className="text-muted-foreground">数据集文件：</span>{selectedDataSources.filter(ds => ds.type === 'dataset').reduce((sum, ds) => sum + (ds.detail?.includes('文件') ? parseInt(ds.detail) || 0 : 0), 0)}个</div>
                        )}
                      </div>
                    </div>
                    {/* 确认数据按钮 */}
                    <div className="flex justify-end">
                      <Button size="sm" className="gap-1.5" onClick={() => handleQuickButtonClick({ label: '确认数据', action: 'confirmData' })}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        确认数据，进入下一步
                      </Button>
                    </div>
                  </>
                )}
                  </div>
                )}

                {/* ── 大纲确认：大纲预览 ── */}
            {currentStep === '大纲确认' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold">报告大纲</h2>
                    {outlineEditing && <Badge variant="secondary" className="text-xs">编辑中</Badge>}
                  </div>
                  <div className="flex gap-2">
                    {outlineEditing ? (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOutlineEditing(false)}>取消</Button>
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setOutlineEditing(false); addSystemMessage('大纲修改已保存。'); }}><CheckCircle className="w-3.5 h-3.5" />保存修改</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setOutlineEditing(true)}><PenLine className="w-3 h-3" />调整大纲</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addSystemMessage('大纲已重新生成，请查看新的章节结构。')}>重新生成</Button>
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => {
                      addSystemMessage('大纲已确认，开始生成报告...');
                      setCurrentStep('产出物生成');
                                            setProcessSteps([
                        { label: '数据采集', status: 'completed', logs: mode === 'blank' ? ['已获取12个核心指标数据'] : mode === 'template' ? ['已从模板定义获取数据源', '采集平台指标数据：42项指标', '采集中高端客户标签数据', '采集16地市分公司数据', '数据采集完成'] : mode === 'scenario' ? ['已从场景定义获取关联指标', '采集平台指标数据', '采集客群标签数据', '数据采集完成'] : ['已读取上传数据文件', '识别数据字段：7个', '数据采集完成'], algorithms: [] },
                        { label: '数据校验', status: 'running', logs: ['校验数据完整性...'], algorithms: [] },
                        { label: '分析引擎', status: 'waiting', logs: [], algorithms: [] },
                        { label: '报告构建', status: 'waiting', logs: [], algorithms: [] },
                      ]);
                      setTimeout(() => {
                        setProcessSteps(prev => [
                          prev[0],
                          { ...prev[1], status: 'completed', logs: ['数据完整性校验通过', '口径一致性校验通过'] },
                          { ...prev[2], status: 'running', logs: ['正在执行分析引擎...'], algorithms: [
                            { type: 'descriptive' as AlgorithmType, name: '描述统计', status: 'running' as const, detail: '计算核心指标环比...' },
                            { type: 'time_trend' as AlgorithmType, name: '时间趋势', status: 'waiting' as const, detail: '等待执行' },
                            { type: 'group_comparison' as AlgorithmType, name: '分组对比', status: 'waiting' as const, detail: '等待执行' },
                            { type: 'anomaly_detection' as AlgorithmType, name: '异常检测', status: 'waiting' as const, detail: '等待执行' },
                          ] },
                          prev[3],
                        ]);
                      }, 2000);
                      setTimeout(() => {
                        setProcessSteps(prev => [
                          prev[0], prev[1],
                          { ...prev[2], status: 'completed', logs: ['4类算法执行完毕'], algorithms: [
                            { type: 'descriptive' as AlgorithmType, name: '描述统计', status: 'completed' as const, detail: '12个指标环比计算完毕' },
                            { type: 'time_trend' as AlgorithmType, name: '时间趋势', status: 'completed' as const, detail: '趋势拟合完成' },
                            { type: 'group_comparison' as AlgorithmType, name: '分组对比', status: 'completed' as const, detail: '地市分组对比完成' },
                            { type: 'anomaly_detection' as AlgorithmType, name: '异常检测', status: 'completed' as const, detail: '检测到2个异常信号' },
                          ] },
                          { ...prev[3], status: 'running', logs: ['正在构建报告...'] },
                        ]);
                      }, 4000);
                      setTimeout(() => {
                        setProcessSteps(prev => [prev[0], prev[1], prev[2], { ...prev[3], status: 'completed', logs: ['报告构建完毕，已标注算法来源'] }]);
                        setCurrentStep('追问深化');
                                                setReportSections(mockReportSections);
                        addSystemMessage('报告已生成完毕！您可以在右侧预览区查看，也可以继续追问或点击归档。', 'findingCard', {
                          conclusion: '分析引擎执行完毕，已识别关键发现',
                          confidence: 'high',
                          details: ['描述统计：12个核心指标环比计算完成', '时间趋势：关键指标趋势拟合完成', '分组对比：16地市分公司对比分析完成', '异常检测：检测到2个异常信号需关注'],
                        });
                      }, 6000);
                    }}><CheckCircle className="w-3.5 h-3.5" />确认大纲，开始生成</Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  {outlineData.map((chapter, ci) => (
                    <div key={ci} className={ci > 0 ? 'border-t' : ''}>
                      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{chapter.chapter}</span>
                        {outlineEditing ? (
                          <input className="text-sm font-medium bg-transparent border-b border-primary/50 outline-none flex-1" defaultValue={chapter.title} />
                        ) : (
                          <span className="text-sm font-medium">{chapter.title}</span>
                        )}
                        {outlineEditing && (
                          <div className="flex gap-1 ml-auto">
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={ci === 0}><ChevronUp className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={ci === outlineData.length - 1}><ChevronDown className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        )}
                      </div>
                      {chapter.sections.map((sec, si) => (
                        <div key={si} className="flex items-center gap-2 px-4 py-2 pl-10 border-t border-dashed">
                          <span className="text-xs text-muted-foreground">{chapter.chapter}.{si + 1}</span>
                          {outlineEditing ? (
                            <input className="text-sm bg-transparent border-b border-dashed outline-none flex-1" defaultValue={sec} />
                          ) : (
                            <span className="text-sm">{sec}</span>
                          )}
                          {outlineEditing && (
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                          )}
                        </div>
                      ))}
                      {outlineEditing && (
                        <div className="px-4 py-2 pl-10 border-t border-dashed">
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary gap-1"><Plus className="w-3 h-3" />添加小节</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {outlineEditing && (
                    <div className="border-t px-4 py-3 bg-muted/20">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" />添加新章节</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 产出物生成：进度展示 ── */}
            {currentStep === '产出物生成' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <h2 className="text-base font-semibold">正在生成{generationType === 'report' ? '报告' : generationType === 'spreadsheet' ? '报表' : generationType === 'dashboard' ? '看板' : '摘要'}...</h2>
                </div>
                <div className="border rounded-xl p-6 text-center">
                  <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                  <div className="text-sm font-medium mb-1">AI正在{generationType === 'report' ? '撰写分析报告' : generationType === 'spreadsheet' ? '配置数据报表' : generationType === 'dashboard' ? '构建数据看板' : '提取关键发现'}</div>
                  <div className="text-xs text-muted-foreground mb-4">
                    {generationType === 'report' ? '正在执行分析引擎算法并生成分析结论' : generationType === 'spreadsheet' ? '正在计算指标并生成数据表格' : generationType === 'dashboard' ? '正在配置图表布局和数据绑定' : '正在分析数据并提取核心要点'}...
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto text-left">
                    {[
                      { label: '解析数据源', done: true },
                      { label: generationType === 'dashboard' ? '配置图表组件' : generationType === 'spreadsheet' ? '计算指标数据' : generationType === 'report' ? '生成分析结论' : '提取关键发现', done: false },
                      { label: '渲染产出物', done: false },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {step.done ? (
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        )}
                        <span className={step.done ? 'text-muted-foreground' : 'text-foreground font-medium'}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 追问深化：产出物预览 ── */}
            {currentStep === '追问深化' && (
            <>
            {/* 报告类型预览 */}
            {(generationType === 'report' || (!generationType && reportSections.length > 0)) && reportSections.length > 0 && (
                <div className="space-y-6">
                  {reportSections.map(section => (
                  <div key={section.id} className="mb-6">
                    <h2 className="text-base font-semibold mb-3">{section.title}</h2>
                    <div className="space-y-3">
                      {section.paragraphs.map(para => (
                        <div
                          key={para.id}
                          className={`group relative pl-3 border-l-2 transition-colors rounded-r ${
                            activeParagraphId === para.id ? 'border-l-primary bg-primary/5'
                              : para.status === 'edited' ? 'border-l-blue-400 hover:bg-muted/50'
                              : 'border-l-muted-foreground/30 hover:bg-muted/50'
                          } cursor-pointer`}
                          onClick={() => handleParagraphClick(para.id, section.title, para.content)}
                        >
                          {editingParagraphId === para.id ? (
                            <div className="py-1">
                              <textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} className="w-full text-sm leading-relaxed p-2 border rounded bg-background min-h-[60px]" onClick={e => e.stopPropagation()} />
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); handleSaveEdit(section.id, para.id); }}>保存</Button>
                                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); setEditingParagraphId(null); }}>取消</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className={`flex-1 min-w-0 ${para.status === 'deleted' ? 'line-through opacity-60' : ''}`}>
                                {para.type === 'chart' && para.chartConfig && para.status !== 'deleted' ? (
                                  <div className="my-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium">{para.content}</p>
                                      {para.algorithmSource && (
                                        <TooltipProvider><Tooltip><TooltipTrigger asChild><span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${algorithmTypeConfig[para.algorithmSource.type].color}`}>
                                          {algorithmTypeConfig[para.algorithmSource.type].icon}{para.algorithmSource.name}
                                        </span></TooltipTrigger><TooltipContent side="top" className="text-xs max-w-xs"><p className="font-medium">{para.algorithmSource.name}</p><p className="text-muted-foreground">{para.algorithmSource.description}</p></TooltipContent></Tooltip></TooltipProvider>
                                      )}
                                    </div>
                                    <div className="bg-background rounded-lg border p-3" style={{ height: para.chartConfig.height || 240 }}>
                                      <ChartRenderer config={para.chartConfig} />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <p className={`text-sm leading-relaxed py-1 ${para.type === 'data' ? 'font-mono text-xs bg-muted/30 rounded px-2 py-1.5' : ''}`}>
                                      {para.status === 'deleted' ? '(已删除)' : para.content}
                                    </p>
                                    {para.algorithmSource && para.status !== 'deleted' && (
                                      <TooltipProvider><Tooltip><TooltipTrigger asChild><span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium mt-1 ${algorithmTypeConfig[para.algorithmSource.type].color}`}>
                                        {algorithmTypeConfig[para.algorithmSource.type].icon}{para.algorithmSource.name}
                                      </span></TooltipTrigger><TooltipContent side="top" className="text-xs max-w-xs"><p className="font-medium">{para.algorithmSource.name}</p><p className="text-muted-foreground">{para.algorithmSource.description}</p></TooltipContent></Tooltip></TooltipProvider>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 pt-1 flex items-center gap-1">
                                <StatusBadge status={para.status} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-8 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-medium">图例：</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" />内容</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />已编辑</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />已删除</span>
                </div>
                </div>
            )}

            {/* 非报告类型预览：数据报表 */}
            {generationType === 'spreadsheet' && (
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">数据报表预览</span>
                    <span className="text-xs text-muted-foreground ml-auto">[模拟预览]</span>
                  </div>
                  <div className="p-3">
                    <div className="border rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/40">
                            <th className="px-2 py-1.5 text-left font-medium border-r">区域</th>
                            <th className="px-2 py-1.5 text-right font-medium border-r">ARPU(元)</th>
                            <th className="px-2 py-1.5 text-right font-medium border-r">环比</th>
                            <th className="px-2 py-1.5 text-right font-medium">同比</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['乌鲁木齐', '克拉玛依', '昌吉', '伊犁', '喀什'].map((city, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                              <td className="px-2 py-1.5 border-r">{city}</td>
                              <td className="px-2 py-1.5 text-right border-r">--</td>
                              <td className="px-2 py-1.5 text-right border-r">--%</td>
                              <td className="px-2 py-1.5 text-right">--%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground text-center">数据将在导出时填充</div>
                  </div>
                </div>
              </div>
            )}

            {/* 非报告类型预览：数据看板 */}
            {generationType === 'dashboard' && (
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">数据看板预览</span>
                    <span className="text-xs text-muted-foreground ml-auto">[模拟预览]</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['ARPU', 'MOU', 'DOU'].map(kpi => (
                        <div key={kpi} className="border rounded-lg p-3 text-center bg-muted/20">
                          <div className="text-xs text-muted-foreground">{kpi}</div>
                          <div className="text-lg font-bold mt-1">--</div>
                          <div className="text-[10px] text-muted-foreground">环比 --%</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border rounded-lg p-4 bg-muted/10 flex items-center justify-center h-32">
                        <div className="text-xs text-muted-foreground">趋势折线图</div>
                      </div>
                      <div className="border rounded-lg p-4 bg-muted/10 flex items-center justify-center h-32">
                        <div className="text-xs text-muted-foreground">区域对比柱状图</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 非报告类型预览：数据摘要 */}
            {generationType === 'summary' && (
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">数据摘要预览</span>
                    <span className="text-xs text-muted-foreground ml-auto">[模拟预览]</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-sm font-medium">关键发现</div>
                    <ul className="space-y-2">
                      {['发现1：待分析生成', '发现2：待分析生成', '发现3：待分析生成'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">{i + 1}</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        </div>
        ) : (
        <div className="w-10 border-l flex flex-col items-center pt-2 shrink-0 bg-background">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowRightPanel(true)} title="展开预览"><PanelRightOpen className="w-4 h-4" /></Button>
        </div>
        )}
      </div>

      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} onExport={handleExport} generationType={generationType} />}

      {/* 归档确认对话框（含可见性设置） */}
      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>归档设置</DialogTitle>
            <DialogDescription>归档后可随时通过"重新打开"继续修改，归档不会删除任何数据。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-2">可见性</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setArchiveVisibility('private')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${archiveVisibility === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">仅自己</span>
                  <span className="text-xs text-muted-foreground">只有自己可查看</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveVisibility('region')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${archiveVisibility === 'region' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">本区域</span>
                  <span className="text-xs text-muted-foreground">区域内人员可查看</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowArchiveConfirm(false)}>取消</Button>
            <Button size="sm" onClick={confirmArchive}><Archive className="w-3.5 h-3.5 mr-1" />确认归档</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 数据源弹窗选择器 ===== */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>上传数据文件</DialogTitle><DialogDescription>支持 Excel（xlsx/xls）和 CSV 格式</DialogDescription></DialogHeader>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files.length > 0) handleFileSelected(files[0]);
            }}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
            <p className="text-xs text-muted-foreground mt-1">支持 .xlsx .xls .csv</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); e.target.value = ''; }} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>取消</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 数据集弹窗 ── */}
      <Dialog open={showDatasetDialog} onOpenChange={setShowDatasetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>选择数据集</DialogTitle><DialogDescription>从已管理的数据集中选择</DialogDescription></DialogHeader>
          <DatasetDialogInner dataSourceCategory={dataSourceCategory} addSystemMessage={addSystemMessage} setSelectedDataSources={setSelectedDataSources} setDataSourceCategory={setDataSourceCategory} onClose={() => setShowDatasetDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* ── 平台指标弹窗 ── */}
      <Dialog open={showIndicatorDialog} onOpenChange={setShowIndicatorDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>选择平台指标</DialogTitle><DialogDescription>从大数据平台指标体系中勾选</DialogDescription></DialogHeader>
          <IndicatorDialogInner dataSourceCategory={dataSourceCategory} addSystemMessage={addSystemMessage} setSelectedDataSources={setSelectedDataSources} setDataSourceCategory={setDataSourceCategory} onClose={() => setShowIndicatorDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* ── 指标树弹窗 ── */}
      <Dialog open={showTreeDialog} onOpenChange={setShowTreeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>选择指标树</DialogTitle><DialogDescription>从指标树管理模块选择已配置的指标树</DialogDescription></DialogHeader>
          <TreeDialogInner dataSourceCategory={dataSourceCategory} addSystemMessage={addSystemMessage} setSelectedDataSources={setSelectedDataSources} setDataSourceCategory={setDataSourceCategory} onClose={() => setShowTreeDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* ── 客群弹窗 ── */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>选择客群</DialogTitle><DialogDescription>从客群分析模块选择目标客群</DialogDescription></DialogHeader>
          <GroupDialogInner dataSourceCategory={dataSourceCategory} addSystemMessage={addSystemMessage} setSelectedDataSources={setSelectedDataSources} setDataSourceCategory={setDataSourceCategory} onClose={() => setShowGroupDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* ── 报表弹窗 ── */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>选择报表</DialogTitle><DialogDescription>从已有报表中选择，用于进一步数据分析与内容生成</DialogDescription></DialogHeader>
          <ReportDialogInner dataSourceCategory={dataSourceCategory} addSystemMessage={addSystemMessage} setSelectedDataSources={setSelectedDataSources} setDataSourceCategory={setDataSourceCategory} onClose={() => setShowReportDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* 模板库选择弹窗 */}
      <Dialog open={templateLibOpen} onOpenChange={setTemplateLibOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>从模板库选择</DialogTitle>
            <DialogDescription>从模板管理模块中选择已配置的报告模板，或选择您保存的历史模板</DialogDescription>
          </DialogHeader>
          <TemplateLibDialogInner
            onConfirm={(tpl) => {
              setTemplateLibOpen(false);
              setTemplateConfirmed(true);
              addSystemMessage(`已选择模板："${tpl.title}"（${tpl.sections}个章节）。正在提取章节结构...`);
              scheduleReply(() => {
                const sectionNames = tpl.chapters || ['整体经营概况', '分解归因分析', '区域对比分析', '客群分析', '策略建议'].slice(0, tpl.sections);
                addSystemMessage(`模板解析完成！识别到以下章节：\n\n${sectionNames.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n接下来请选择数据源，我将基于此模板和新数据生成报告。`, 'dataButtons');
                setReportSections(sectionNames.map((s: string, i: number) => ({ id: `tpl-${tpl.id}-${i + 1}`, title: s, paragraphs: [] })));
                advanceStep('数据准备');
              }, 1500);
            }}
            onCancel={() => setTemplateLibOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────── 主页面（路由入口，支持URL参数跳转）────────── */
export default function AIInsightPage() {
  const [view, setPageView] = useState<PageView>('report');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [scenarioContext, setScenarioContext] = useState<string | null>(null);
  const [reportMode, setReportMode] = useState<'blank' | 'template' | 'scenario' | 'upload' | 'datasource' | 'knowledge' | 'followup' | 'edit' | 'import'>('blank');
  const [importStep, setImportStep] = useState<'upload-report' | 'confirm-structure' | 'provide-data'>('upload-report');
  const [followupState, setFollowupState] = useState<{ reportTitle: string; reportSections: ReportSection[]; reportStatus?: string; currentStep?: string } | undefined>(undefined);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // 初始化：默认新对话页面，不自动恢复上次对话（用户可通过左侧对话列表选择历史对话）
  // 如有URL参数则按参数处理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conversationId');
    if (convId) {
      setActiveConversationId(convId);
    }
    // 无URL参数时保持null=新对话
  }, []);

  // 读取URL参数，支持从报告中心/模板管理等外部页面跳转携带上下文
  const [urlParamsHandled, setUrlParamsHandled] = useState(false);
  useEffect(() => {
    if (urlParamsHandled) return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'template') {
      const templateName = params.get('templateName');
      if (templateName) {
        setScenarioContext(templateName);
        setReportMode('template');
        setPageView('report');
        setUrlParamsHandled(true);
      }
    } else if (mode === 'upload') {
      const fileName = params.get('fileName');
      if (fileName) {
        setScenarioContext(fileName);
        setReportMode('upload');
        setPageView('report');
        setUrlParamsHandled(true);
      }
    } else if (mode === 'scenario') {
      const scenarioTitle = params.get('scenarioTitle');
      if (scenarioTitle) {
        setScenarioContext(scenarioTitle);
        setReportMode('scenario');
        setPageView('report');
        setUrlParamsHandled(true);
      }
    } else if (mode === 'datasource') {
      const dsName = params.get('name');
      if (dsName) {
        const rows = params.get('rows') || '';
        const cols = params.get('cols') || '';
        setScenarioContext(`基于数据源"${dsName}"（${rows}行×${cols}列）进行分析`);
        setReportMode('datasource');
        setPageView('report');
        setUrlParamsHandled(true);
      }
    } else if (mode === 'knowledge') {
      const insightId = params.get('insightId');
      const insightTitle = params.get('insightTitle');
      if (insightId) {
        setScenarioContext(insightTitle ? `基于知识库洞察「${decodeURIComponent(insightTitle)}」进行分析` : '基于知识库洞察进行分析');
        setReportMode('knowledge');
        setPageView('report');
        setUrlParamsHandled(true);
      }
    } else if (mode === 'edit' || mode === 'followup') {
      const reportId = params.get('reportId');
      if (reportId) {
        const report = sharedReports.find((r: { id: string }) => r.id === reportId);
        const title = report?.title || params.get('title') || `报告 ${reportId}`;
        // 将shared格式ReportSection转为page格式（确保paragraphs存在）
        const sections = (report?.sections || []).map((s: { id: string; title: string; content: string; status: string; paragraphs?: { id: string; content: string; type: string; status: string; algorithmSource?: string }[] }) => ({
          id: s.id,
          title: s.title,
          paragraphs: [{ id: `${s.id}-p1`, content: s.content || s.title, type: 'text' as const, status: 'confirmed' as const }],
          status: (s.status === 'removed' ? 'deleted' : s.status) as 'pending' | 'confirmed' | 'edited' | 'deleted',
        }));
        const status = report?.status || 'draft';
        setScenarioContext(title);
        setReportMode(mode === 'followup' ? 'followup' : 'edit');
        setPageView('report');
        // 根据报告状态推断当前步骤
        const stepByStatus: Record<string, string> = {
          draft: '追问深化',
          review: '追问深化',
          final: '追问深化',
          archived: '追问深化',
        };
        setFollowupState({
          reportTitle: title,
          reportSections: sections,
          reportStatus: status,
          currentStep: stepByStatus[status] || '追问深化',
        });
        setUrlParamsHandled(true);
      }
    }
  }, [urlParamsHandled]);



  return (
    <div className="flex h-screen bg-background">
      {/* 左侧历史对话列表 - 可折叠，默认收起 */}
      {showLeftPanel ? (
        <div className="w-[260px] border-r flex flex-col shrink-0 bg-background">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">历史对话</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowLeftPanel(false)}><PanelLeftClose className="w-3.5 h-3.5" /></Button>
          </div>
          <ConversationList
            activeId={activeConversationId ?? undefined}
            onSelect={(id) => {
              setCurrentConversationId(id);
              setActiveConversationId(id);
            }}
            onNew={() => {
              const conv = createConversation('新对话');
              setCurrentConversationId(conv.id);
              setActiveConversationId(conv.id);
              setScenarioContext(null);
              setFollowupState(undefined);
              setReportMode('blank');
            }}
            onArchive={(id) => {
              archiveConversation(id);
              if (activeConversationId === id) {
                setCurrentConversationId('');
                setActiveConversationId(null);
              }
            }}
            onReopen={(id) => {
              reopenConversation(id);
            }}
            onDelete={(id) => {
              deleteConversation(id);
              if (activeConversationId === id) {
                setCurrentConversationId('');
                setActiveConversationId(null);
              }
            }}
          />
        </div>
      ) : (
        <div className="w-10 border-r flex flex-col items-center pt-2 shrink-0 bg-background">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowLeftPanel(true)} title="展开历史对话"><PanelLeftOpen className="w-4 h-4" /></Button>
        </div>
      )}
      {/* 主区域：报告编辑页 */}
      <div className="flex-1 flex flex-col min-w-0">
        <ReportEditPage initialScenario={scenarioContext} initialMode={reportMode} followupState={followupState} activeConversationId={activeConversationId ?? undefined} onToggleLeftPanel={() => setShowLeftPanel(v => !v)} leftPanelOpen={showLeftPanel} />
      </div>
    </div>
  );
}
