'use client';

import { useState, Suspense, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Clock, User, FileText, AlertCircle, CheckCircle, Tag, Target, Users, UserCog, MapPin, BarChart3, PieChart, Crosshair, Info, Settings, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTabs } from '@/contexts/TabsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { OpportunityRelatedInfo } from '@/app/workspace/components/OpportunityRelatedInfo';
import { OpportunityDispatchConfig } from '@/app/workspace/components/OpportunityDispatchConfig';
import ExecutionStats from '@/app/workspace/components/ExecutionStats';
import { SubTicketList } from '@/app/workspace/components/SubTicketList';
import { resolveDispatchSystem, type DispatchSystem, isApprovalType } from '@/lib/dispatch-system';

// 可折叠模块组件
function CollapsibleSection({ title, icon, moduleKey, collapsed, onToggle, children }: {
  title: string;
  icon: React.ReactNode;
  moduleKey: string;
  collapsed: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => onToggle(moduleKey)}>
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        {collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />}
      </div>
      {!collapsed && children}
    </>
  );
}

// 便捷包装：可折叠Card模块
function CollapsibleCard({ title, icon, moduleKey, collapsed, onToggle, className, children }: {
  title: string;
  icon: React.ReactNode;
  moduleKey: string;
  collapsed: boolean;
  onToggle: (key: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className || 'p-6 mb-6'}>
      <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => onToggle(moduleKey)}>
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        {collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />}
      </div>
      {!collapsed && children}
    </Card>
  );
}

// 工单类型
type WorkOrderType = 'indicator' | 'strategy' | 'customer-group' | 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault' | 'alert-dispatch' | 'retention-task' | 'alert-approval';

// 业务场景映射
const businessScenarioMap: Record<string, string> = {
  'business-churn': '离网维系',
  'business-mid-high': '中高端客户运营',
  'business-international': '国际业务',
  'business-traffic': '流量运营',
  'business-voice': '语音业务',
};

// 类型标签配置
const typeConfig = {
  indicator: { label: '指标调度', color: 'bg-purple-100 text-purple-700' },
  strategy: { label: '策略调度', color: 'bg-orange-100 text-orange-700' },
  'customer-group': { label: '客群调度', color: 'bg-cyan-100 text-cyan-700' },
  'customer-opportunity-dispatch': { label: '客户商机调度', color: 'bg-violet-100 text-violet-700' },
  'group-opportunity-dispatch': { label: '客群商机调度', color: 'bg-teal-100 text-teal-700' },
  'region-assault': { label: '区域攻坚调度', color: 'bg-rose-100 text-rose-700' },
  'alert-dispatch': { label: '预警调度', color: 'bg-amber-100 text-amber-700' },
  'retention-task': { label: '保有任务调度', color: 'bg-emerald-100 text-emerald-700' },
  'alert-approval': { label: '预警规则审批', color: 'bg-amber-100 text-amber-700' },
};

// 三种类型的工单数据模板
const getWorkOrderDataByType = (type: WorkOrderType, paramId: string, paramTitle: string, paramStatus: string, businessScenario: string = '') => {
  // 基础数据（三种类型通用）
  const baseData = {
    ticketId: paramId || 'IND-2024-0001',
    ticketTitle: paramTitle || typeConfig[type].label + '工单',
    businessType: type === 'indicator' ? '管理类/指标调度' : 
                  type === 'strategy' ? '生产类/策略调度' : 
                  type === 'customer-group' ? '生产类/客群调度' :
                  type === 'customer-opportunity-dispatch' ? '生产类/客户商机调度' :
                  type === 'group-opportunity-dispatch' ? '生产类/客群商机调度' :
                  type === 'region-assault' ? '生产类/区域攻坚调度' :
                  type === 'alert-dispatch' ? '生产类/预警调度' :
                  type === 'retention-task' ? '生产类/保有任务调度' :
                  type === 'alert-approval' ? '管理类/预警规则审批' :
                  '生产类/其他调度',
    businessScenario: businessScenario || '离网维系',
    ticketType: typeConfig[type].label,
    requiredCompleteTime: '2025-12-31 00:00:00',
    requirement: '请各地州按照指标目标值执行相关运营动作，确保指标达成。',
    importanceLevel: '公司部门调度',
    submitter: '集团市场运营人员',
    submitTime: '2025-12-16 18:15:10',
    sourceSystem: '市场运营平台',
    
    // 扩展信息（三种类型通用）
    enablePostEvaluation: true,
    postEvaluationPeriod: type === 'indicator' 
      ? '日指标：每2周评估；月指标：每3月评估'
      : '每3月评估',
    dispatchSystemLabel: '本平台',
    dispatchRegions: ['昌吉', '喀什', '吐鲁番', '哈密', '博州'],
    // 预警信息（部分工单有预警）
    alertIndicator: '-',
    alertLevel: '-',
    alertValue: '-',
    
    // 状态（兼容中英文：completed/已完成/approved/已审批 都视为完成态）
    status: paramStatus || 'pending',
    get isCompleted() { return ['completed', '已完成', 'approved', '已审批'].includes(this.status); },
  };
  
  // 根据类型返回不同的数据
  if (type === 'indicator') {
    return {
      ...baseData,
      ticketTitle: paramTitle || '一降到底改善指标调度-第1期',
      requirement: '请各地州按照指标目标值执行相关运营动作，确保指标达成目标。',
      // 派发系统
      dispatchSystem: 'platform' as DispatchSystem,
      // 指标调度专属
      accountPeriod: {
        dayIndicator: '2025-12-15',
        monthIndicator: '2025-11'
      },
      // 调度指标列表（含账期、环比、同比、位置路径）
      dispatchIndicators: [
        { 
          id: 1,
          name: '一降到底规模', 
          period: '月',
          accountPeriod: '2025-11',
          value: '12,580户', 
          targetValue: '11,800户',
          mom: '-2.5%',
          momTrend: 'down' as const,
          yoy: '-5.2%',
          yoyTrend: 'down' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 概览'
        },
        { 
          id: 2,
          name: '离网预警客户数量', 
          period: '月',
          accountPeriod: '2025-11',
          value: '8,500户', 
          targetValue: '7,500户',
          mom: '+3.2%',
          momTrend: 'up' as const,
          yoy: '+1.8%',
          yoyTrend: 'up' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 离网预警客户数量（指标树）'
        },
      ],
      // 跟踪周期数据
      trackingData: {
        columns: [
          { key: 'indicatorName', label: '指标名称' },
          { key: 'initialValue', label: '工单派发时指标值' },
          { key: 'targetValue', label: '目标值' },
          { key: '2025-12', label: '2025-12<br>指标值/达成率' },
          { key: '2026-01', label: '2026-01<br>指标值/达成率' },
          { key: '2026-02', label: '2026-02<br>指标值/达成率' },
          { key: '2026-03', label: '2026-03<br>指标值/达成率' },
          { key: '2026-04', label: '2026-04<br>指标值/达成率' },
          { key: '2026-05', label: '2026-05<br>指标值/达成率' },
        ],
        rows: [
          {
            indicatorName: '一降到底规模(户)',
            initialValue: '12,580',
            targetValue: '11,800',
            '2025-12': { value: '12,580', rate: '0%' },
            '2026-01': { value: '12,450', rate: '16.7%' },
            '2026-02': { value: '12,300', rate: '35.9%' },
            '2026-03': { value: '12,150', rate: '55.1%' },
            '2026-04': { value: '12,000', rate: '74.4%' },
            '2026-05': { value: '11,850', rate: '93.6%' },
          },
          {
            indicatorName: '离网预警客户数量(户)',
            initialValue: '8,500',
            targetValue: '7,500',
            '2025-12': { value: '8,500', rate: '0%' },
            '2026-01': { value: '8,320', rate: '18%' },
            '2026-02': { value: '8,150', rate: '35%' },
            '2026-03': { value: '7,980', rate: '52%' },
            '2026-04': { value: '7,820', rate: '68%' },
            '2026-05': { value: '7,660', rate: '84%' },
          },
          {
            indicatorName: '工单达成率',
            initialValue: '—',
            targetValue: '—',
            '2025-12': { value: null, rate: '0%' },
            '2026-01': { value: null, rate: '17.4%' },
            '2026-02': { value: null, rate: '35.5%' },
            '2026-03': { value: null, rate: '53.6%' },
            '2026-04': { value: null, rate: '71.2%' },
            '2026-05': { value: null, rate: '88.8%' },
          },
        ],
      },
      // 子单列表
      subTicketList: [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: '待接收', city: '昌吉', district: '昌吉市', grid: '延安路网格', targetCount: 350, executor: '昌吉运营专员', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: '执行中', city: '喀什', district: '喀什市', grid: '艾提尕尔网格', targetCount: 420, executor: '喀什运营专员', completionRate: '45%', receiptStatus: '未回单', status: '执行中' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: '已完成', city: '吐鲁番', district: '高昌区', grid: '新城路网格', targetCount: 280, executor: '吐鲁番运营专员', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
      ],
      // 评估指标
      evaluationIndicator: {
        indicatorId: 'key-chn-yoy',
        indicatorName: '当月CHN收入同比增幅',
        unit: '%',
        direction: 'up' as const,
        baseValue: -2.78,
        targetValue: -1.50,
        currentValue: -1.85,
      },
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '受理人', action: '-', startTime: '2025-12-16 18:15:10', endTime: '2025-12-16 18:15:10', duration: '00分钟01秒', result: '-' },
        { step: '环节2', handler: '运营人员创建活动', action: '-', startTime: '2025-12-16 18:15:10', endTime: '-', duration: '-', result: '-' },
      ],
    };
  }
  
  if (type === 'strategy') {
    return {
      ...baseData,
      ticketTitle: paramTitle || '异网主卡客户迎回策略执行',
      requirement: '请各地州按照策略描述执行相关运营动作，确保策略效果达成。',
      // 派发系统（策略调度支持IOP/网格通二选一）
      dispatchSystem: 'IOP' as DispatchSystem, // 本示例走IOP
      dispatchSystemLabel: 'IOP',
      executionRole: '-',
      // 预警信息
      alertIndicator: '离网预警客户数量',
      alertLevel: '二级预警',
      alertValue: '8,500户',
      // 策略列表
      strategyList: [
        { id: 1, indicator: '一降到底规模', riskGroup: '异网主卡客户', tags: '高流量、低话费', strategy: '对异网主卡有流量客群，基于前期客户消费值，推进对应套餐或包，并进行折扣迎回', dispatchRegion: '昌吉、喀什、吐鲁番' },
        { id: 2, indicator: '一降到底规模', riskGroup: '零融合客户', tags: '低融合度', strategy: '针对零融合客户，推广融合套餐，提供家庭宽带、IPTV等增值服务', dispatchRegion: '昌吉、喀什、吐鲁番' },
        { id: 3, indicator: '离网率', riskGroup: '高价值客户', tags: '高价值、离网倾向', strategy: '对高价值离网倾向客户，提供专属优惠套餐进行挽留', dispatchRegion: '吐鲁番、哈密' },
      ],
      // 关联指标列表（去重后，含账期、环比、同比、位置路径）
      dispatchIndicators: [
        { 
          id: 1,
          name: '一降到底规模', 
          period: '月',
          accountPeriod: '2025-11',
          value: '12,580户', 
          targetValue: '11,800户',
          mom: '-2.5%',
          momTrend: 'down' as const,
          yoy: '-5.2%',
          yoyTrend: 'down' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 概览'
        },
        { 
          id: 2,
          name: '离网率', 
          period: '月',
          accountPeriod: '2025-11',
          value: '2.35%', 
          targetValue: '2.20%',
          mom: '+0.15pp',
          momTrend: 'up' as const,
          yoy: '-0.3pp',
          yoyTrend: 'down' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 离网率（指标树）'
        },
      ],
      // 跟踪周期数据
      trackingData: {
        columns: [
          { key: 'indicatorName', label: '指标名称' },
          { key: 'initialValue', label: '工单派发时指标值' },
          { key: 'targetValue', label: '目标值' },
          { key: '2025-12', label: '2025-12<br>指标值/达成率' },
          { key: '2026-01', label: '2026-01<br>指标值/达成率' },
          { key: '2026-02', label: '2026-02<br>指标值/达成率' },
          { key: '2026-03', label: '2026-03<br>指标值/达成率' },
          { key: '2026-04', label: '2026-04<br>指标值/达成率' },
          { key: '2026-05', label: '2026-05<br>指标值/达成率' },
        ],
        rows: [
          {
            indicatorName: '一降到底规模(户)',
            initialValue: '12,580',
            targetValue: '11,800',
            '2025-12': { value: '12,580', rate: '0%' },
            '2026-01': { value: '12,450', rate: '16.7%' },
            '2026-02': { value: '12,300', rate: '35.9%' },
            '2026-03': { value: '12,150', rate: '55.1%' },
            '2026-04': { value: '12,000', rate: '74.4%' },
            '2026-05': { value: '11,850', rate: '93.6%' },
          },
          {
            indicatorName: '离网预警客户数量(户)',
            initialValue: '8,500',
            targetValue: '7,500',
            '2025-12': { value: '8,500', rate: '0%' },
            '2026-01': { value: '8,320', rate: '18%' },
            '2026-02': { value: '8,150', rate: '35%' },
            '2026-03': { value: '7,980', rate: '52%' },
            '2026-04': { value: '7,820', rate: '68%' },
            '2026-05': { value: '7,660', rate: '84%' },
          },
          {
            indicatorName: '工单达成率',
            initialValue: '—',
            targetValue: '—',
            '2025-12': { value: null, rate: '0%' },
            '2026-01': { value: null, rate: '17.4%' },
            '2026-02': { value: null, rate: '35.5%' },
            '2026-03': { value: null, rate: '53.6%' },
            '2026-04': { value: null, rate: '71.2%' },
            '2026-05': { value: null, rate: '88.8%' },
          },
        ],
      },
      // 子单列表
      subTicketList: [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: '执行中', city: '昌吉', district: '昌吉市', grid: '延安路网格', targetCount: 2100, executor: '昌吉运营专员', completionRate: '55%', receiptStatus: '未回单', status: '执行中' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: '执行中', city: '喀什', district: '喀什市', grid: '艾提尕尔网格', targetCount: 2800, executor: '喀什运营专员', completionRate: '38%', receiptStatus: '未回单', status: '执行中' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: '已完成', city: '吐鲁番', district: '高昌区', grid: '新城路网格', targetCount: 1800, executor: '吐鲁番运营专员', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
        { id: 4, subOrderId: `${paramId}-004`, executionStatus: '待接收', city: '昌吉', district: '昌吉市', grid: '建国路网格', targetCount: 1500, executor: '昌吉运营专员', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
      ],
      // 客户清单分发信息
      customerListDistribution: [
        { id: 1, region: '昌吉', fileName: '异网主卡客户_昌吉_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\策略调度\\异网主卡客户迎回策略执行\\' },
        { id: 2, region: '喀什', fileName: '异网主卡客户_喀什_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\策略调度\\异网主卡客户迎回策略执行\\' },
        { id: 3, region: '吐鲁番', fileName: '异网主卡客户_吐鲁番_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\策略调度\\异网主卡客户迎回策略执行\\' },
        { id: 4, region: '哈密', fileName: '异网主卡客户_哈密_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\策略调度\\异网主卡客户迎回策略执行\\' },
      ],
      // IOP执行数据（当dispatchSystem='IOP'时）
      iopExecution: {
        activityId: 'IOP-ACT-20251216001',
        activityName: '异网主卡客户迎回策略',
        activityStatus: '执行中',
        activityCreateTime: '2025-12-16 18:30:00',
        targetCount: 8500,
        reachedCount: 5200,
        successReachedCount: 3800,
        convertedCount: 960,
        channelDistribution: [
          { channel: '短信', reachedCount: 3200, convertedCount: 380, conversionRate: '11.9%' },
          { channel: '外呼', reachedCount: 1500, convertedCount: 420, conversionRate: '28.0%' },
          { channel: '5G消息', reachedCount: 350, convertedCount: 98, conversionRate: '28.0%' },
          { channel: '企微', reachedCount: 150, convertedCount: 62, conversionRate: '41.3%' },
        ],
        strategyDetails: [
          { strategyId: 'IOP-STR-001', strategyName: '异网主卡客户折扣迎回', channel: '短信+外呼', reachedCount: 3200, convertedCount: 580, conversionRate: '18.1%' },
          { strategyId: 'IOP-STR-002', strategyName: '零融合客户融合推广', channel: '5G消息+企微', reachedCount: 2000, convertedCount: 380, conversionRate: '19.0%' },
        ],
      },
      // 执行进度（统一字段名，调用方完成映射）
      executionProgress: {
        targetCount: 8500,
        reachedCount: 5200,       // IOP: reachCount → 触达客户数
        contactedCount: 3800,     // IOP: successReachCount → 接触客户数
        successCount: 960,        // IOP: convertCount → 营销成功客户数
      },
      // 效果评估（统一指标）
      effectEvaluation: {
        reachRate: '61.2%',       // 触达率 = 触达客户数/目标客户数
        successRate: '25.3%',     // 成功率 = 营销成功客户数/接触客户数
        avgExecutionCycle: '3.2天',
      },
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '受理人', action: '-', startTime: '2025-12-16 18:15:10', endTime: '2025-12-16 18:15:10', duration: '00分钟01秒', result: '-' },
        { step: '环节2', handler: '运营人员创建活动', action: '-', startTime: '2025-12-16 18:15:10', endTime: '-', duration: '-', result: '-' },
      ],
    };
  }

  // 客户商机调度工单
  if (type === 'customer-opportunity-dispatch') {
    return {
      ...baseData,
      ticketTitle: paramTitle || '5G终端低迁移客户调度-第2期',
      requirement: '请按照商机评级和推荐产品执行客户触达，确保客户转化效果达成。',
      // 派发系统
      dispatchSystem: 'wanggetong' as DispatchSystem,
      dispatchSystemLabel: '网格通',
      executionRole: '地市集运/网格经理',
      // 关联商机信息（区域攻坚特色）
      // 商机调度工单覆盖通用字段
      importanceLevel: '-',
      dispatchRegions: ['乌鲁木齐'],
      enablePostEvaluation: false,
      postEvaluationPeriod: '-',
      // 关联商机信息（批量派单汇总）
      relatedOpportunity: {
        id: 'BATCH-2025-0042',
        type: '客户商机（批量）',
        category: '多类型',
        rating: '混合',
        scenario: '流量运营',
        selectedCount: 45,
        kind: 'customer' as const,
        gridCoverageCount: 3,
      },
      // 调度信息
      dispatchInfo: {
        channel: '调度中心',
        scenario: '流量运营',
        executor: '调度中心统一调度',
        executionStrategy: '外呼推荐 + 短信触达 + 线下拜访',
        targetCustomerCount: 45,
        gridCoverageCount: 3,
        subTicketCount: 3,
        executionArea: '乌鲁木齐 > 天山区',
        kind: 'customer' as const,
      },
      // 商机来源统计
      opportunitySourceStats: [
        { type: '5G终端低迁移', count: 20, color: '#3b82f6' },
        { type: '流量达量预警', count: 13, color: '#f97316' },
        { type: '套餐升级机会', count: 7, color: '#10b981' },
        { type: '零流量使用预警', count: 5, color: '#ef4444' },
      ],
      sourceStatsKind: 'customer' as const,
      opportunityRatingStats: [
        { rating: 'A级', count: 12 },
        { rating: 'B级', count: 22 },
        { rating: 'C级', count: 11 },
      ],
      // 执行进度（统一字段名）
      executionProgress: {
        targetCount: 45,
        reachedCount: 38,       // 网格通: calledCount → 触达客户数
        contactedCount: 28,     // 网格通: contactedCount → 接触客户数
        successCount: 8,        // 网格通: marketingSuccessCount → 营销成功客户数
      },
      // 子单列表（按网格拆分）
      subTicketList: [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: '执行中', city: '乌鲁木齐', district: '天山区', grid: '南塔网格', targetCount: 520, executor: '张三（南塔网格）', completionRate: '67%', receiptStatus: '已回单', status: '执行中' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: '执行中', city: '乌鲁木齐', district: '天山区', grid: '北门网格', targetCount: 480, executor: '王五（北门网格）', completionRate: '53%', receiptStatus: '未回单', status: '执行中' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: '待接收', city: '乌鲁木齐', district: '天山区', grid: '幸福路网格', targetCount: 360, executor: '赵六（幸福路网格）', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
      ],
      // 效果评估（网格通指标）
      effectEvaluation: {
        reachRate: '73.7%',        // 呼通率 = contactedCount/calledCount
        conversionRate: '28.6%',   // 营销成功率 = marketingSuccessCount/contactedCount
        avgExecutionCycle: '4.5分钟',
      },
      // 登记状态分布（基于网格通6.2.2 registeredStatus字段汇总）
      registeredStatusDistribution: [
        { status: '成功', statusCode: 0, count: 8, percentage: '17.8%', color: 'bg-green-500' },
        { status: '未呼通', statusCode: 1, count: 10, percentage: '22.2%', color: 'bg-gray-400' },
        { status: '用户犹豫', statusCode: 2, count: 14, percentage: '31.1%', color: 'bg-yellow-400' },
        { status: '用户拒绝', statusCode: 3, count: 13, percentage: '28.9%', color: 'bg-red-400' },
      ],
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '运营人员派发', action: '批量勾选45个客户商机 → 派发至调度中心', startTime: '2025-12-16 10:00:00', endTime: '2025-12-16 10:00:05', duration: '00分钟05秒', result: '派发成功' },
        { step: '环节2', handler: '调度中心接收', action: '生成调度工单，按3个网格拆分3个子单', startTime: '2025-12-16 10:00:05', endTime: '2025-12-16 10:00:15', duration: '00分钟10秒', result: '已拆单' },
        { step: '环节3', handler: '南塔网格-张三', action: '接收子单（18个客户）', startTime: '2025-12-16 10:05:00', endTime: '2025-12-16 10:05:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: '北门网格-王五', action: '接收子单（15个客户）', startTime: '2025-12-16 10:08:00', endTime: '2025-12-16 10:08:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: '幸福路网格-赵六', action: '等待接收子单（12个客户）', startTime: '-', endTime: '-', duration: '-', result: '待接收' },
      ],
    };
  }

  // 客群商机调度工单
  if (type === 'group-opportunity-dispatch') {
    return {
      ...baseData,
      ticketTitle: paramTitle || '高价值离网客群维系调度',
      requirement: '请按照客群特征和执行策略开展维系动作，确保客群维系效果达成。',
      // 派发系统
      dispatchSystem: 'wanggetong' as DispatchSystem,
      // 商机调度工单覆盖通用字段
      importanceLevel: '-',
      dispatchSystemLabel: '网格通',
      dispatchRegions: ['乌鲁木齐'],
      enablePostEvaluation: false,
      postEvaluationPeriod: '-',
      executionRole: '地市集运/网格经理',
      // 关联商机信息
      relatedOpportunity: {
        id: 'GRP-0001',
        type: '客群商机',
        category: '风险预警类 > 离网预警 > 高价值离网',
        rating: 'A级',
        scenario: '离网维系',
        kind: 'group' as const,
        groupName: '高价值离网客群',
        groupScale: '3,560',
      },
      // 调度信息
      dispatchInfo: {
        channel: '调度中心',
        scenario: '离网维系',
        executor: '调度中心统一调度',
        executionStrategy: '外呼维系 + 线下拜访',
        targetGroupScale: '3,560',
        gridCoverageCount: 8,
        subTicketCount: 8,
        subTicketCompletedCount: 5,
        kind: 'group' as const,
        dispatchMode: '调度中心直达网格',
      },
      // 客群标签特征分布
      opportunitySourceStats: [
        { type: '是否转低消保号', count: 2050, color: '#ef4444' },
        { type: '异网宽带用户', count: 1230, color: '#f97316' },
        { type: '月均消费>100元', count: 980, color: '#3b82f6' },
        { type: '近3月流量下降', count: 680, color: '#10b981' },
      ],
      sourceStatsKind: 'group' as const,
      // 执行进度（统一字段名）
      executionProgress: {
        targetCount: 3560,
        reachedCount: 2800,     // 网格通: calledCount → 触达客户数
        contactedCount: 2180,   // 网格通: contactedCount → 接触客户数
        successCount: 296,      // 网格通: marketingSuccessCount → 营销成功客户数
      },
      // 子单列表（按网格拆分，统一结构）
      subTicketList: [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: '已完成', city: '乌鲁木齐', district: '天山区', grid: '南塔网格', targetCount: 520, executor: '张三（南塔网格）', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: '执行中', city: '乌鲁木齐', district: '沙依巴克区', grid: '友好路网格', targetCount: 480, executor: '王五（友好路网格）', completionRate: '75%', receiptStatus: '未回单', status: '执行中' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: '执行中', city: '乌鲁木齐', district: '新市区', grid: '北京路网格', targetCount: 450, executor: '赵六（北京路网格）', completionRate: '60%', receiptStatus: '未回单', status: '执行中' },
        { id: 4, subOrderId: `${paramId}-004`, executionStatus: '待接收', city: '乌鲁木齐', district: '水磨沟区', grid: '喀什东路网格', targetCount: 390, executor: '钱七（喀什东路网格）', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
        { id: 5, subOrderId: `${paramId}-005`, executionStatus: '已完成', city: '乌鲁木齐', district: '头屯河区', grid: '建设路网格', targetCount: 410, executor: '孙八（建设路网格）', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
        { id: 6, subOrderId: `${paramId}-006`, executionStatus: '执行中', city: '乌鲁木齐', district: '达坂城区', grid: '达坂城网格', targetCount: 350, executor: '周九（达坂城网格）', completionRate: '45%', receiptStatus: '未回单', status: '执行中' },
        { id: 7, subOrderId: `${paramId}-007`, executionStatus: '已完成', city: '乌鲁木齐', district: '米东区', grid: '米东网格', targetCount: 560, executor: '吴十（米东网格）', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
        { id: 8, subOrderId: `${paramId}-008`, executionStatus: '执行中', city: '乌鲁木齐', district: '乌鲁木齐县', grid: '乌鲁木齐县网格', targetCount: 400, executor: '郑十一（乌鲁木齐县网格）', completionRate: '30%', receiptStatus: '未回单', status: '执行中' },
      ],
      // 客户清单分发信息（按网格分发）
      customerListDistribution: [
        { id: 1, region: '南塔网格', fileName: '离网客群_南塔网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 2, region: '友好路网格', fileName: '离网客群_友好路网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 3, region: '北京路网格', fileName: '离网客群_北京路网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 4, region: '喀什东路网格', fileName: '离网客群_喀什东路网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 5, region: '建设路网格', fileName: '离网客群_建设路网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 6, region: '达坂城网格', fileName: '离网客群_达坂城网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 7, region: '米东网格', fileName: '离网客群_米东网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
        { id: 8, region: '乌鲁木齐县网格', fileName: '离网客群_乌鲁木齐县网格_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群商机调度\\高价值离网客群维系调度\\' },
      ],
      // 效果评估（网格通指标）
      effectEvaluation: {
        reachRate: '77.9%',        // 呼通率 = contactedCount/calledCount
        conversionRate: '13.6%',   // 营销成功率 = marketingSuccessCount/contactedCount
        avgExecutionCycle: '2.8天',
      },
      // 登记状态分布（基于网格通6.2.2 registeredStatus字段汇总）
      registeredStatusDistribution: [
        { status: '成功', statusCode: 0, count: 296, percentage: '8.3%', color: 'bg-green-500' },
        { status: '未呼通', statusCode: 1, count: 620, percentage: '17.4%', color: 'bg-gray-400' },
        { status: '用户犹豫', statusCode: 2, count: 880, percentage: '24.7%', color: 'bg-yellow-400' },
        { status: '用户拒绝', statusCode: 3, count: 1764, percentage: '49.6%', color: 'bg-red-400' },
      ],
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '运营人员派发', action: '派发至调度中心', startTime: '2025-12-16 14:00:00', endTime: '2025-12-16 14:00:05', duration: '00分钟05秒', result: '派发成功' },
        { step: '环节2', handler: '调度中心接收', action: '生成调度工单并拆分8个子单', startTime: '2025-12-16 14:00:05', endTime: '2025-12-16 14:00:15', duration: '00分钟10秒', result: '已拆单' },
        { step: '环节3', handler: '南塔网格-张三', action: '接收子单（520个客户）', startTime: '2025-12-16 14:20:00', endTime: '2025-12-16 14:20:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: '建设路网格-孙八', action: '接收子单（410个客户）', startTime: '2025-12-16 14:25:00', endTime: '2025-12-16 14:25:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: '米东网格-吴十', action: '接收子单（560个客户）', startTime: '2025-12-16 14:30:00', endTime: '2025-12-16 14:30:10', duration: '00分钟10秒', result: '已接收' },
      ],
      // 评估指标
      evaluationIndicator: {
        indicatorId: 'key-5g-penetration',
        indicatorName: '5G渗透率',
        unit: '%',
        direction: 'up' as const,
        baseValue: 32.5,
        targetValue: 38.0,
        currentValue: 35.8,
      },
    };
  }

  // 客群调度
  if (type === 'customer-group') {
  return {
    ...baseData,
    ticketTitle: paramTitle || '高价值离网客群维系调度',
    requirement: '请各地州按照客群特征执行相关运营动作，确保客群维系效果达成。',
    // 派发系统（客群调度派至网格通）
    dispatchSystem: 'wanggetong' as DispatchSystem,
    dispatchSystemLabel: '网格通',
    executionRole: '-',
    // 客群调度专属
    customerGroup: {
      name: '异网主卡客户',
      scale: '1320.4万',
      tagFilters: [
        { name: '是否转低消保号', value: '是', ratio: '57.58%' },
        { name: '异网宽带用户', value: '是', ratio: '65.06%' },
        { name: '当月流量', value: '1-5GB', ratio: '29.94%' },
      ],
    },
    // 调度指标列表（含账期、环比、同比、位置路径）
    dispatchIndicators: [
      { 
        id: 1,
        name: '当月全量离网客户数', 
        period: '月',
        accountPeriod: '2025-11',
        value: '13,200户', 
        targetValue: '12,000户',
        mom: '+1.5%',
        momTrend: 'up' as const,
        yoy: '-2.3%',
        yoyTrend: 'down' as const,
        locationPath: '市场数智运营 > 存量运营 > 离网维系 > 概览'
      },
      { 
        id: 2,
        name: '欠费销号离网率', 
        period: '月',
        accountPeriod: '2025-11',
        value: '7.93%', 
        targetValue: '7.50%',
        mom: '+0.5pp',
        momTrend: 'up' as const,
        yoy: '-1.2pp',
        yoyTrend: 'down' as const,
        locationPath: '市场数智运营 > 存量运营 > 离网维系 > 欠费销号离网率（指标树）'
      },
    ],
    // 跟踪周期数据（跟踪根指标）
    trackingData: {
      columns: [
        { key: 'indicatorName', label: '指标名称' },
        { key: 'initialValue', label: '工单派发时指标值' },
        { key: 'targetValue', label: '目标值' },
        { key: '2025-12', label: '2025-12<br>指标值/达成率' },
        { key: '2026-01', label: '2026-01<br>指标值/达成率' },
        { key: '2026-02', label: '2026-02<br>指标值/达成率' },
        { key: '2026-03', label: '2026-03<br>指标值/达成率' },
        { key: '2026-04', label: '2026-04<br>指标值/达成率' },
        { key: '2026-05', label: '2026-05<br>指标值/达成率' },
      ],
      rows: [
        {
          indicatorName: '当月全量离网客户数(户)',
          initialValue: '13,200',
          targetValue: '12,000',
          '2025-12': { value: '13,200', rate: '0%' },
          '2026-01': { value: '12,950', rate: '20.8%' },
          '2026-02': { value: '12,700', rate: '41.7%' },
          '2026-03': { value: '12,480', rate: '60.0%' },
          '2026-04': { value: '12,280', rate: '76.7%' },
          '2026-05': { value: '12,100', rate: '91.7%' },
        },
        {
          indicatorName: '工单达成率',
          initialValue: '—',
          targetValue: '—',
          '2025-12': { value: null, rate: '0%' },
          '2026-01': { value: null, rate: '20.8%' },
          '2026-02': { value: null, rate: '41.7%' },
          '2026-03': { value: null, rate: '60.0%' },
          '2026-04': { value: null, rate: '76.7%' },
          '2026-05': { value: null, rate: '91.7%' },
        },
      ],
    },
    // 子单列表
    subTicketList: [
      { id: 1, subOrderId: `${paramId}-001`, executionStatus: '执行中', city: '昌吉', district: '昌吉市', grid: '延安路网格', targetCount: 3200, executor: '昌吉运营专员', completionRate: '52%', receiptStatus: '未回单', status: '执行中' },
      { id: 2, subOrderId: `${paramId}-002`, executionStatus: '待接收', city: '哈密', district: '伊州区', grid: '前进路网格', targetCount: 2800, executor: '哈密运营专员', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
      { id: 3, subOrderId: `${paramId}-003`, executionStatus: '已完成', city: '吐鲁番', district: '高昌区', grid: '新城路网格', targetCount: 2100, executor: '吐鲁番运营专员', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
      { id: 4, subOrderId: `${paramId}-004`, executionStatus: '待接收', city: '博州', district: '博乐市', grid: '青得里网格', targetCount: 1800, executor: '博州运营专员', completionRate: '-', receiptStatus: '未回单', status: '待接收' },
    ],
    // 客户清单分发信息
    customerListDistribution: [
      { id: 1, region: '昌吉', fileName: '异网主卡客户_昌吉_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群调度\\高价值离网客群维系调度\\' },
      { id: 2, region: '哈密', fileName: '异网主卡客户_哈密_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群调度\\高价值离网客群维系调度\\' },
      { id: 3, region: '吐鲁番', fileName: '异网主卡客户_吐鲁番_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群调度\\高价值离网客群维系调度\\' },
      { id: 4, region: '博州', fileName: '异网主卡客户_博州_20251215.xlsx', filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群调度\\高价值离网客群维系调度\\' },
    ],
    // IOP执行数据（当dispatchSystem='IOP'时）
    iopExecution: {
      activityId: 'IOP-ACT-20251216002',
      activityName: '异网主卡客群维系策略',
      activityStatus: '执行中',
      activityCreateTime: '2025-12-16 18:25:00',
      targetCount: 13204,
      reachedCount: 8900,
      successReachedCount: 6500,
      convertedCount: 1560,
      channelDistribution: [
        { channel: '短信', reachedCount: 5800, convertedCount: 680, conversionRate: '11.7%' },
        { channel: '外呼', reachedCount: 2400, convertedCount: 620, conversionRate: '25.8%' },
        { channel: '5G消息', reachedCount: 500, convertedCount: 180, conversionRate: '36.0%' },
        { channel: '企微', reachedCount: 200, convertedCount: 80, conversionRate: '40.0%' },
      ],
      strategyDetails: [
        { strategyId: 'IOP-STR-003', strategyName: '异网主卡客群折扣维系', channel: '短信+外呼', reachedCount: 5800, convertedCount: 920, conversionRate: '15.9%' },
        { strategyId: 'IOP-STR-004', strategyName: '转低消保号客户挽留', channel: '5G消息+企微', reachedCount: 3100, convertedCount: 640, conversionRate: '20.6%' },
      ],
    },
    // 执行进度（统一字段名，调用方完成映射）
    executionProgress: {
      targetCount: 13204,
      reachedCount: 8900,       // IOP: reachCount → 触达客户数
      contactedCount: 6500,     // IOP: successReachCount → 接触客户数
      successCount: 1560,       // IOP: convertCount → 营销成功客户数
    },
    // 效果评估（统一指标）
    effectEvaluation: {
      reachRate: '67.4%',       // 触达率 = 触达客户数/目标客户数
      successRate: '24.0%',     // 成功率 = 营销成功客户数/接触客户数
      avgExecutionCycle: '3.5天',
    },
    // 流转信息
    transferInfo: [
      { step: '环节1', handler: '受理人', action: '-', startTime: '2025-12-16 18:15:10', endTime: '2025-12-16 18:15:10', duration: '00分钟01秒', result: '-' },
      { step: '环节2', handler: '运营人员创建活动', action: '-', startTime: '2025-12-16 18:15:10', endTime: '-', duration: '-', result: '-' },
    ],
    // 评估指标
    evaluationIndicator: {
      indicatorId: 'key-churn-rate',
      indicatorName: '欠费销号离网率',
      unit: '%',
      direction: 'down' as const,
      baseValue: 1.24,
      targetValue: 0.95,
      currentValue: 1.02,
    },
  };
  } // end customer-group

  // 区域攻坚调度
  if (type === 'region-assault') {
    return {
      ...baseData,
      ticketTitle: paramTitle || '天山区流量攻坚调度-第1期',
      businessType: '生产类/区域攻坚调度',
      requirement: '请各网格按圈选区域执行流量套餐升档及竞对抢夺攻坚动作，确保区域客户价值提升。',
      // 后评估周期（日度指标30天，月度指标3个月）
      postEvaluationPeriod: '日度指标：30天评估；月度指标：3个月评估',
      // 派发系统
      dispatchSystem: 'wanggetong' as DispatchSystem,
      dispatchSystemLabel: '网格通',
      executionRole: '网格经理',
      relatedOpportunity: {
        selectedArea: '天山区5个AOI',
        communityCount: '5个',
        targetCustomerCount: '2,750户',
      },
      // 调度配置
      dispatchInfo: {
        channel: '网格通',
        region: '天山区',
        executionRole: '网格经理',
        splitRule: '按网格拆单',
        touchStrategy: '【触客策略-流量攻坚】\n目标客群特征：流量低饱和小区、流量超套高发小区；日间常驻客户、流量高频客户。\n覆盖小区5个，覆盖客户约2,750户。\n触达渠道：短信先行触达 → 外呼跟进确认 → 线下走访促成。\n推荐产品：大流量套餐（月租+30元档）、流量加油包（10元5GB）、5G升级包。\n短信话术：尊敬的客户，您当前套餐流量使用已接近上限，升级大流量套餐每月仅需XX元，即可享受XXGB高速流量，点击链接立即办理 → [办理链接]\n外呼话术：您好，我是中国移动客户经理XX，注意到您近期流量使用较多，现有大流量套餐升级活动，每月仅需增加XX元即可获得XXGB流量，是否为您详细介绍？\n执行要点：① 重点强调流量超出后的资费差异，引导升级套餐；② 超套高发小区客户优先推荐大流量套餐；③ 异网高风险小区客户侧重移动网络优势和服务体验。',
      },
      // 攻坚目标统计（已在前端用小区标签/客户标签分布替代，此处保留数据用于兼容）
      opportunitySourceStats: {
        byType: [
          { type: '流量低饱和小区', count: 1260, color: '#f59e0b' },
          { type: '流量零低小区', count: 890, color: '#10b981' },
          { type: '流量超套高发小区', count: 580, color: '#ef4444' },
          { type: '异网高风险小区', count: 720, color: '#8b5cf6' },
        ],
        byValue: [
          { type: '高价值客户', count: 1200, color: '#ef4444' },
          { type: '中价值客户', count: 1050, color: '#f97316' },
          { type: '低价值客户', count: 500, color: '#a3a3a3' },
        ],
      },
      // 执行进度（统一字段名）
      executionProgress: {
        targetCount: 2750,
        reachedCount: 1800,     // 网格通: calledCount → 触达客户数
        contactedCount: 1050,   // 网格通: contactedCount → 接触客户数
        successCount: 420,      // 网格通: marketingSuccessCount → 营销成功客户数
      },
      // 子单列表（3个网格）
      subTicketList: [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: '已完成', city: '乌鲁木齐', district: '天山区', grid: '大巴扎网格', targetCount: 980, executor: '阿里木（大巴扎）', completionRate: '100%', receiptStatus: '已回单', status: '已完成' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: '执行中', city: '乌鲁木齐', district: '天山区', grid: '南塔网格', targetCount: 870, executor: '张三（南塔）', completionRate: '68%', receiptStatus: '未回单', status: '执行中' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: '执行中', city: '乌鲁木齐', district: '天山区', grid: '新华路网格', targetCount: 900, executor: '李四（新华路）', completionRate: '35%', receiptStatus: '未回单', status: '执行中' },
      ],
      // 效果评估（统一指标）
      effectEvaluation: {
        reachRate: '65.5%',       // 触达率 = 触达客户数/目标客户数
        successRate: '40.0%',     // 成功率 = 营销成功客户数/接触客户数
        avgExecutionCycle: '2.3天',
      },
      // 登记状态分布（基于网格通6.2.2 registeredStatus字段汇总）
      registeredStatusDistribution: [
        { status: '成功', statusCode: 0, count: 420, percentage: '15.3%', color: 'bg-green-500' },
        { status: '未呼通', statusCode: 1, count: 750, percentage: '27.3%', color: 'bg-gray-400' },
        { status: '用户犹豫', statusCode: 2, count: 630, percentage: '22.9%', color: 'bg-yellow-400' },
        { status: '用户拒绝', statusCode: 3, count: 950, percentage: '34.5%', color: 'bg-red-400' },
      ],
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '区域攻坚中心', action: '圈选天山区5个AOI', startTime: '2025-12-15 09:00:00', endTime: '2025-12-15 09:05:00', duration: '00分钟05秒', result: '圈选完成' },
        { step: '环节2', handler: '调度中心', action: '生成攻坚工单并拆分3个子单', startTime: '2025-12-15 09:05:00', endTime: '2025-12-15 09:05:15', duration: '00分钟15秒', result: '已拆单' },
        { step: '环节3', handler: '大巴扎网格-阿里木', action: '接收子单（980户）', startTime: '2025-12-15 09:30:00', endTime: '2025-12-15 09:30:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: '南塔网格-张三', action: '接收子单（870户）', startTime: '2025-12-15 09:35:00', endTime: '2025-12-15 09:35:10', duration: '00分钟10秒', result: '已接收' },
      ],
      // 评估指标
      evaluationIndicator: {
        indicatorId: 'key-broadband-penetration',
        indicatorName: '宽带渗透率',
        unit: '%',
        direction: 'up' as const,
        baseValue: 45.2,
        targetValue: 52.0,
        currentValue: 49.8,
      },
      // 跟踪周期数据（区域攻坚有评估指标，需要跟踪达成情况）
      trackingData: {
        columns: [
          { key: 'indicatorName', label: '指标名称' },
          { key: 'initialValue', label: '工单派发时指标值' },
          { key: 'targetValue', label: '目标值' },
          { key: '2025-12', label: '2025-12<br>指标值/达成率' },
          { key: '2026-01', label: '2026-01<br>指标值/达成率' },
          { key: '2026-02', label: '2026-02<br>指标值/达成率' },
          { key: '2026-03', label: '2026-03<br>指标值/达成率' },
        ],
        rows: [
          {
            indicatorName: '宽带渗透率(%)',
            initialValue: '45.2',
            targetValue: '52.0',
            '2025-12': { value: '49.8', rate: '66.7%' },
            '2026-01': { value: '50.5', rate: '76.5%' },
            '2026-02': { value: '51.2', rate: '86.8%' },
            '2026-03': { value: '51.8', rate: '95.6%' },
          },
        ],
      },
    };
  }

  // 预警调度
  if (type === 'alert-dispatch') {
    const execMode = '分包看管执行';
    return {
      ...baseData,
      ticketTitle: paramTitle || '携转预警-客户触达工单',
      businessType: '生产类/预警调度',
      requirement: '预警规则触发，系统自动生成客户触达工单，由网格通执行客户维系。',
      dispatchSystem: 'wanggetong' as DispatchSystem,
      dispatchSystemLabel: '网格通',
      importanceLevel: '-',
      dispatchRegions: ['乌鲁木齐', '昌吉', '喀什'],
      enablePostEvaluation: false,
      submitter: '系统自动',
      submitTime: '2026-07-11 09:00:05',
      sourceSystem: '预警规则引擎',
      // 预警调度扩展信息
      alertTypeInfo: '任务类',
      businessTypeInfo: '携转预警',
      executionModeInfo: execMode,
      executionRoleInfo: '10088坐席',
      customerName: '张三',
      customerPhone: '138****5678',
      alertRegion: '乌鲁木齐/天山区/南塔网格',
      // 关联预警规则
      relatedAlertRule: {
        ruleName: '存量客户携转预警规则',
        ruleId: 'ALR-20260701-001',
        ruleStatus: '已生效',
      },
      // 执行记录（一个客户一条工单，只有该客户本人的触达记录）
      executionRecords: [
        { customerName: '张三', phone: '13800123456', called: '是', callResult: '接通', duration: '3分12秒', registerStatus: '已登记', execTime: '2026-07-11 10:05:00' },
      ],
      // 流转信息（根据工单状态动态）
      transferInfo: baseData.isCompleted
        ? [
            { step: '系统生成', handler: '预警规则引擎', action: '规则触发自动生成', startTime: '2026-07-11 09:00:00', endTime: '2026-07-11 09:00:05', duration: '00分钟05秒', result: '已生成' },
            { step: '分发执行', handler: '10088坐席', action: '分包看管执行', startTime: '2026-07-11 09:05:00', endTime: '2026-07-11 10:20:00', duration: '75分钟00秒', result: '已完成' },
          ]
        : [
            { step: '系统生成', handler: '预警规则引擎', action: '规则触发自动生成', startTime: '2026-07-11 09:00:00', endTime: '2026-07-11 09:00:05', duration: '00分钟05秒', result: '已生成' },
            { step: '分发执行', handler: '10088坐席', action: '分包看管执行', startTime: '2026-07-11 09:05:00', endTime: '-', duration: '-', result: '执行中' },
          ],
    };
  }

  // 保有任务调度
  if (type === 'retention-task') {
    const isComp = baseData.isCompleted;
    const btOpts = ['携转预警', '宽带离网预警', '全球通离网预警', '投诉工单预警', '热线商机预警', '异动客户预警', '全球通客户离网追溯', '全球通客户停机赢回预警', '全球通停机客户赢回-铁通预警'];
    const selBt = btOpts[Math.abs((paramId || '0').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % btOpts.length];
    const emOpts = ['区公司执行', '地市执行'];
    const selEm = emOpts[Math.abs((paramId || '0').split('').reduce((a, c) => a + c.charCodeAt(0) * 7, 0)) % emOpts.length];
    return {
      ...baseData,
      ticketTitle: paramTitle || `${selBt}-保有维系调度`,
      businessType: '生产类/保有任务调度',
      requirement: '请按照业务类型和执行模式执行保有维系动作，IOP平台执行维系动作后以文件接口方式回传效果数据。',
      postEvaluationPeriod: '-',
      dispatchSystem: 'iop' as DispatchSystem,
      dispatchSystemLabel: 'IOP平台',
      executionRole: selEm === '区公司执行' ? '区公司运营经理' : '地市分公司执行人',
      importanceLevel: '-',
      dispatchRegions: selEm === '区公司执行' ? ['新疆区公司'] : ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'],
      enablePostEvaluation: false,
      alertIndicator: '-',
      alertLevel: '-',
      alertValue: '-',
      relatedOpportunity: {
        id: 'RET-GRP-202607-001',
        type: '保有客群',
        category: '保有维系',
        rating: '高风险',
        scenario: '存量运营',
        selectedCount: 5600,
        kind: 'customer' as const,
        gridCoverageCount: 16,
      },
      dispatchInfo: {
        channel: 'IOP平台',
        scenario: '存量运营',
        executor: 'IOP平台',
        splitRule: selEm === '区公司执行' ? '不拆单' : '按地市拆单',
      },
      subTicketList: selEm === '区公司执行' ? [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: isComp ? '已完成' : 'IOP处理中', city: '新疆区公司', district: '-', grid: '-', targetCount: 5600, executor: '区公司运营经理', completionRate: isComp ? '100%' : '68%', receiptStatus: isComp ? '已回传' : '处理中', status: isComp ? '已完成' : 'IOP处理中' },
      ] : [
        { id: 1, subOrderId: `${paramId}-001`, executionStatus: isComp ? '已完成' : 'IOP处理中', city: '乌鲁木齐', district: '-', grid: '-', targetCount: 820, executor: '乌鲁木齐分公司-张三', completionRate: isComp ? '100%' : '72%', receiptStatus: isComp ? '已回传' : '处理中', status: isComp ? '已完成' : 'IOP处理中' },
        { id: 2, subOrderId: `${paramId}-002`, executionStatus: isComp ? '已完成' : '待接收', city: '克拉玛依', district: '-', grid: '-', targetCount: 480, executor: '克拉玛依分公司-李四', completionRate: isComp ? '100%' : '-', receiptStatus: isComp ? '已回传' : '未回传', status: isComp ? '已完成' : '待接收' },
        { id: 3, subOrderId: `${paramId}-003`, executionStatus: isComp ? '已完成' : 'IOP处理中', city: '昌吉', district: '-', grid: '-', targetCount: 650, executor: '昌吉分公司-王五', completionRate: isComp ? '100%' : '55%', receiptStatus: isComp ? '已回传' : '处理中', status: isComp ? '已完成' : 'IOP处理中' },
        { id: 4, subOrderId: `${paramId}-004`, executionStatus: isComp ? '已完成' : 'IOP处理中', city: '喀什', district: '-', grid: '-', targetCount: 520, executor: '喀什分公司-赵六', completionRate: isComp ? '100%' : '41%', receiptStatus: isComp ? '已回传' : '处理中', status: isComp ? '已完成' : 'IOP处理中' },
        { id: 5, subOrderId: `${paramId}-005`, executionStatus: isComp ? '已完成' : '待接收', city: '阿克苏', district: '-', grid: '-', targetCount: 390, executor: '阿克苏分公司-孙七', completionRate: isComp ? '100%' : '-', receiptStatus: isComp ? '已回传' : '未回传', status: isComp ? '已完成' : '待接收' },
      ],
      executionProgress: {
        targetCount: 5600,
        reachedCount: isComp ? 5600 : 3400,
        contactedCount: isComp ? 5600 : 2200,
        successCount: isComp ? 4872 : 780,
      },
      effectEvaluation: {
        reachRate: isComp ? '100.0%' : '60.7%',
        successRate: isComp ? '87.0%' : '35.5%',
        avgExecutionCycle: '4.2天',
      },
      transferInfo: [
        { step: '提交', handler: '运营人员', action: '发起保有任务调度', startTime: '2026-07-12 08:30:00', endTime: '2026-07-12 08:30:15', duration: '00分钟15秒', result: '已发起' },
        { step: '三级经理审批', handler: '新疆区公司三级经理', action: isComp ? '审批通过' : '审批中', startTime: '2026-07-12 08:45:00', endTime: isComp ? '2026-07-12 09:15:00' : '-', duration: isComp ? '30分钟00秒' : '-', result: isComp ? '审批通过' : '-' },
        { step: '接收', handler: selEm === '区公司执行' ? '区公司运营经理' : '乌鲁木齐分公司-张三', action: isComp ? '接收' : '-', startTime: isComp ? '2026-07-12 09:20:00' : '-', endTime: isComp ? '2026-07-12 09:20:05' : '-', duration: isComp ? '00分钟05秒' : '-', result: isComp ? '已接收' : '-' },
        { step: 'IOP处理', handler: 'IOP平台', action: isComp ? '外部系统处理' : '-', startTime: isComp ? '2026-07-12 09:21:00' : '-', endTime: isComp ? '2026-07-12 14:00:00' : '-', duration: isComp ? '4时39分' : '-', result: isComp ? '处理完成' : '-' },
        { step: '效果回传', handler: 'IOP平台接口', action: isComp ? '回传效果数据' : '-', startTime: isComp ? '2026-07-12 14:00:00' : '-', endTime: isComp ? '2026-07-12 14:01:00' : '-', duration: isComp ? '00分钟01秒' : '-', result: isComp ? '回传成功' : '-' },
        { step: '结束', handler: '系统', action: isComp ? '工单关闭' : '-', startTime: isComp ? '2026-07-12 14:01:00' : '-', endTime: isComp ? '2026-07-12 14:01:00' : '-', duration: isComp ? '00分钟00秒' : '-', result: isComp ? '已关闭' : '-' },
      ],
      evaluationIndicator: {
        indicatorId: 'key-retention-rate',
        indicatorName: '客户保有率',
        unit: '%',
        direction: 'up' as const,
        baseValue: 94.5,
        targetValue: 96.0,
        currentValue: isComp ? 95.8 : 95.2,
      },
    };
  }

  // 默认返回基础数据（客群调度等未独立定义的类型）
  // 预警规则审批工单
  if (type === 'alert-approval') {
    const approvalStatus = baseData.isCompleted ? 'completed' : 'processing';
    const approvalRemark = baseData.isCompleted ? '审批通过' : '';
    return {
      ...baseData,
      ticketTitle: paramTitle || '存量客户携转预警规则审批',
      businessType: '管理类/预警规则审批',
      dispatchSystem: 'platform' as const,
      flowNodes: [
        { name: '提交审批', status: 'completed' as const, handler: '新疆运营人员', time: '2026-06-28 09:30:00', remark: '提交预警规则审批' },
        { name: '三级经理审批', status: approvalStatus as 'completed' | 'processing', handler: '新疆区公司三级经理', time: baseData.isCompleted ? '2026-06-28 14:00:00' : '', remark: approvalRemark },
      ],
      basicInfo: [
        { label: '工单编码', value: baseData.ticketId },
        { label: '工单标题', value: baseData.ticketTitle },
        { label: '调度类型', value: '预警规则审批' },
        { label: '预警名称', value: '存量客户携转预警规则' },
        { label: '预警类型', value: '任务类' },
        { label: '预警级别', value: '高' },
        { label: '业务专题', value: '离网预警' },
        { label: '业务类型', value: '携转预警' },
        { label: '客户类型', value: '全球通客户' },
        { label: '执行模式', value: '在线执行' },
        { label: '执行角色', value: '10088、网格经理' },
        { label: '归属区域', value: '新疆' },
        { label: '规则状态', value: baseData.isCompleted ? '已生效' : '审批中' },
        { label: '发起人', value: '新疆运营人员' },
        { label: '发起时间', value: '2026-06-28 09:30:00' },
      ],
      subTickets: [],
      executionProgress: null,
      effectEvaluation: null,
      evaluationIndicator: null,
      transferInfo: [
        { step: '提交', handler: '100128130', action: '提交', startTime: '2026-07-07 16:23:44', endTime: '2026-07-07 16:23:44', duration: '00分钟01秒', result: '已提交' },
        { step: '三级经理审批', handler: '100128131', action: baseData.isCompleted ? '审批通过' : '审批中', startTime: '2026-07-07 16:23:46', endTime: baseData.isCompleted ? '2026-07-07 16:26:54' : '-', duration: baseData.isCompleted ? '03分钟08秒' : '-', result: baseData.isCompleted ? '审批通过' : '-' },
      ],
    };
  }

  // 默认返回基础数据（含通用流转信息）
  return {
    ...baseData,
    transferInfo: [
      { step: '环节1', handler: '100128130', action: '提交', startTime: '2026-07-01 09:00:00', endTime: '2026-07-01 09:00:00', duration: '00分钟01秒', result: '已提交' },
      { step: '环节2', handler: '100128131', action: baseData.isCompleted ? '审批通过' : '审批中', startTime: '2026-07-01 09:05:00', endTime: baseData.isCompleted ? '2026-07-01 14:30:00' : '-', duration: baseData.isCompleted ? '05小时25分钟00秒' : '-', result: baseData.isCompleted ? '审批通过' : '-' },
    ],
  };
};

function TicketDetailContent() {
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('from');
  
  // 访问模式：view=查看（只读），process=处理（可编辑+提交）
  const mode = searchParams.get('mode') || 'view';
  // 来源页面路径（优先级高于fromPage映射）
  const fromPath = searchParams.get('fromPath') || '';
  
  // 从URL参数读取工单信息
  const paramId = searchParams.get('id') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramStatus = searchParams.get('status') || '';
  const paramType: WorkOrderType = (searchParams.get('type') as WorkOrderType) || 'indicator';
  const paramStep = searchParams.get('step') || '';
  const paramBusinessType = searchParams.get('businessType') || '';
  
  // 业务Tab和工单面板状态
  const businessTab = searchParams.get('businessTab') || '';
  const workOrderTab = searchParams.get('workOrderTab') || '';

  // 审批弹窗状态
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveOpinion, setApproveOpinion] = useState<'agree' | 'disagree'>('agree');
  const [approveComment, setApproveComment] = useState('');
  const [approveRemark, setApproveRemark] = useState('');
  const [nextNodeHandler, setNextNodeHandler] = useState('');

  // 保有任务调度可选的下一节点处理人
  const retentionNextHandlers = [
    '区公司运营经理',
    '乌鲁木齐分公司-张三', '克拉玛依分公司-李四', '吐鲁番分公司-王五', '哈密分公司-赵六',
    '昌吉分公司-钱七', '博州分公司-孙八', '巴州分公司-周九', '阿克苏分公司-吴十',
    '克州分公司-郑一', '喀什分公司-冯二', '和田分公司-陈三', '伊犁分公司-褚四',
    '塔城分公司-卫五', '阿勒泰分公司-蒋六', '奎屯分公司-沈七', '石河子分公司-韩八',
  ];

  // 处理弹窗状态（执行类工单，如指标调度）
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processResult, setProcessResult] = useState<'completed' | 'cannot_process' | 'reassign'>('completed');
  const [processRemark, setProcessRemark] = useState('');
  // 保有任务调度：接收/转派/拒绝/IOP Tab
  const [retentionAccepted, setRetentionAccepted] = useState(false);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  // 模块折叠状态（默认全部展开）
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const toggleModule = (key: string) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  // 系统预置常用审批意见（不可删除）
  const DEFAULT_OPINIONS = ['同意', '已阅，同意执行', '情况属实，同意', '不同意，请补充材料', '不同意，建议调整方案'];
  // 常用审批意见（预置 + 用户自建）
  const [customOpinions, setCustomOpinions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approvalOpinions');
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_OPINIONS;
  });
  const [opinionManageOpen, setOpinionManageOpen] = useState(false);
  const [editingOpinion, setEditingOpinion] = useState('');

  // 保存常用意见到localStorage
  const saveOpinions = (opinions: string[]) => {
    setCustomOpinions(opinions);
    localStorage.setItem('approvalOpinions', JSON.stringify(opinions));
  };

  // 获取下一节点信息
  const getNextNodeInfo = (): { handler: string; method: string } => {
    switch (paramType) {
      case 'indicator':
        return { handler: '张明（塔城：地州公司 - 运营人员）', method: '人工处理' };
      case 'strategy':
        return { handler: '李芳（IOP平台）', method: '系统自动执行' };
      case 'customer-group':
        return { handler: '王磊（IOP平台）', method: '系统自动执行' };
      case 'group-opportunity-dispatch':
        return { handler: '赵敏（IOP平台）', method: '系统自动执行' };
      case 'customer-opportunity-dispatch':
        return { handler: '网格经理（网格通）', method: '系统自动分发' };
      case 'region-assault':
        return { handler: '网格经理（网格通）', method: '系统自动分发' };
      case 'alert-dispatch':
        return { handler: '网格经理（网格通）', method: '系统自动分发' };
      case 'retention-task':
        return { handler: 'IOP平台', method: '外部系统处理' };
      case 'alert-approval':
        return { handler: '新疆区公司三级经理', method: '人工处理' };
      default:
        return { handler: '-', method: '-' };
    }
  };
  const nextNodeInfo = getNextNodeInfo();

  const { addTab, removeTab, activeTab, tabs, setActiveTab } = useTabs();

  // from 参数到路径的映射
  const fromPathMap: Record<string, string> = {
    'overview': '/portal/capability/dispatch/overview',
    'work-order-list': '/portal/capability/dispatch/work-order-list',
    'work-order-comprehensive': '/portal/capability/dispatch/work-order-comprehensive',
    'business-international': '/portal/customer/international/metrics',
    'business-mid-high': '/portal/mid-high-customer-operations',
    'business-churn': '/portal/churn-retention',
    'business-traffic': '/portal/traffic-operations',
    'business-voice': '/portal/voice-operations',
  };

  // 判断是否从调度总览页或业务页面进入
  const isFromDispatchOverview = fromPage === 'overview' || 
                                   fromPage === 'work-order-list' || 
                                   fromPage === 'work-order-comprehensive' ||
                                   fromPage?.startsWith('business-');

  // 根据派发系统确定展示逻辑（dispatchSystem计算移至ticketData声明之后）

  // 根据来源页面计算业务场景
  const currentBusinessScenario = fromPage && fromPage.startsWith('business-') 
    ? (businessScenarioMap[fromPage] || '离网维系') 
    : '离网维系';

  // 根据类型获取工单数据
  const ticketData = useMemo(() => {
    const data = getWorkOrderDataByType(paramType, paramId, paramTitle, paramStatus, currentBusinessScenario) as Record<string, any>;
    // URL中step参数覆盖currentStep（从列表传过来的当前环节）
    if (paramStep) {
      data.currentStep = paramStep;
    }
    // 剧本营销：当step包含"剧本营销"时，修改派发系统为剧本营销
    if (paramStep?.includes('剧本营销') && (paramType === 'strategy' || paramType === 'customer-group')) {
      data.dispatchSystem = 'script-marketing';
      data.dispatchSystemLabel = '剧本营销';
    }
    return data;
  }, [paramType, paramId, paramTitle, paramStatus, currentBusinessScenario, paramStep]);

  // 根据派发系统确定展示逻辑
  const dispatchSystemRaw = (ticketData as any)?.dispatchSystem;
  const dispatchSystemSelectedSystem = dispatchSystemRaw === 'wanggetong' ? '网格通' : dispatchSystemRaw === 'script-marketing' ? '剧本营销' : undefined;
  const dispatchSystem = resolveDispatchSystem(paramType, dispatchSystemSelectedSystem);
  const isPlatform = dispatchSystem === 'platform';
  const isWanggetong = dispatchSystem === 'wanggetong';
  // 商机调度类（不含区域攻坚，区域攻坚有评估指标需要跟踪周期）
  const isOpportunityDispatch = paramType === 'customer-opportunity-dispatch' || paramType === 'group-opportunity-dispatch';
  // 三大调度类+区域攻坚（使用独立Table组件，有跟踪周期数据）
  const isAlertApproval = paramType === 'alert-approval';
  const isAlertDispatch = paramType === 'alert-dispatch';
  const isThreeMajorDispatch = !isOpportunityDispatch && !isAlertApproval && !isAlertDispatch;
  // 工单是否为完成态（兼容中英文）
  const isTicketCompleted = ['completed', '已完成', 'approved', '已审批'].includes(ticketData.status);
  // 判断是否为审批类工单（需要审批弹窗）vs 执行类工单（需要处理弹窗）
  const isApprovalWorkOrder = isAlertApproval || isApprovalType(paramType, ticketData.currentStep);

  // 跟踪周期配置
  const trackingPeriod = 6;
  const dispatchMonth = '2025-12';
  const evaluationPeriodStart = '2025-12';
  const evaluationPeriodEnd = '2026-05';

  const router = useRouter();

  const goToSubTicketDetail = (id: number) => {
    const subTickets = (ticketData as Record<string, unknown>)?.subTicketList as Array<{ id: number; subTicketId?: string; subOrderId?: string; subTicketTitle?: string; region?: string }> | undefined;
    const subTicket = subTickets?.find((st: { id: number }) => st.id === id);
    const title = subTicket ? (subTicket.subTicketTitle || (subTicket.region ? subTicket.region + ' 子单详情' : '子单详情')) : '子单详情';
    const subId = subTicket?.subOrderId || subTicket?.subTicketId || '';

    const currentPath = `/workspace/ticket-detail?id=${paramId}&type=${paramType}${fromPath ? '&fromPath=' + encodeURIComponent(fromPath) : ''}${mode ? '&mode=' + mode : ''}${fromPage ? '&fromPage=' + fromPage : ''}`;
    const subDetailPath = `/workspace/sub-ticket-detail?id=${subId}&type=${paramType}&title=${encodeURIComponent(title)}&fromPath=${encodeURIComponent(currentPath)}&mode=${mode || 'view'}${fromPage ? '&fromPage=' + fromPage : ''}`;

    addTab({
      id: subDetailPath,
      title: `子单详情`,
      path: subDetailPath
    });

    setActiveTab(subDetailPath);
    
    // 传递工单类型参数、来源页面参数、来源路径和模式
    router.push(subDetailPath);
  };

  const handleBack = () => {
    // 清理当前tab（如果存在于tab系统中）
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab && activeTab) {
      removeTab(activeTab);
    }
    // 优先使用fromPath直接路径
    if (fromPath) {
      router.push(fromPath);
      return;
    }
    if (isFromDispatchOverview && fromPage) {
      if (fromPathMap[fromPage]) {
        let returnUrl = fromPathMap[fromPage];
        
        if (fromPage.startsWith('business-')) {
          const params = new URLSearchParams();
          params.set('fromWorkOrder', 'true');
          params.set('workOrderPanel', 'open');
          if (workOrderTab) params.set('workOrderTab', workOrderTab);
          if (paramId) params.set('workOrderId', paramId);
          
          if (businessTab) {
            returnUrl = `${returnUrl}#${businessTab}?${params.toString()}`;
          } else {
            returnUrl = `${returnUrl}?${params.toString()}`;
          }
        }
        
        router.push(returnUrl);
      } else {
        router.push('/workspace');
      }
    } else {
      router.push('/workspace');
    }
  };

  // 隐藏左侧导航和多标签栏
  useEffect(() => {
    if (isFromDispatchOverview) {
      const aside = document.querySelector('aside');
      if (aside) (aside as HTMLElement).style.display = 'none';
      const tabBar = document.querySelector('[class*="TabsBar"]');
      if (tabBar) (tabBar as HTMLElement).style.display = 'none';
    }
    return () => {
      const aside = document.querySelector('aside');
      if (aside) (aside as HTMLElement).style.display = '';
      const tabBar = document.querySelector('[class*="TabsBar"]');
      if (tabBar) (tabBar as HTMLElement).style.display = '';
    };
  }, [isFromDispatchOverview]);

  const showBackButton = isFromDispatchOverview;

  return (
    <div className={isFromDispatchOverview ? "bg-gray-50 min-h-screen p-6 pt-[64px]" : "flex-1 overflow-y-auto"}>
      {/* 顶部标题栏 */}
      <div className="flex items-center mb-6">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 mr-3" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">工单详情</h1>
            <p className="text-sm text-gray-500">工单编号：{ticketData.ticketId}</p>
          </div>

        </div>
      </div>

      {/* 工单详情主体 */}
      {(
      <>
      {/* 基本信息 - 预警规则审批：只保留工单通用字段 */}
      {isAlertApproval && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">基本信息</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">工单编号</p>
              <p className="text-sm font-medium">{ticketData.ticketId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单标题</p>
              <p className="text-sm font-medium">{ticketData.ticketTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单类型</p>
              <p className="text-sm font-medium">管理类/预警规则审批</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单状态</p>
              <p className="text-sm font-medium">{ticketData.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">重要级别</p>
              <p className="text-sm font-medium">{ticketData.importanceLevel || '普通'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">发起人</p>
              <p className="text-sm font-medium">新疆运营人员</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">发起时间</p>
              <p className="text-sm font-medium">2026-06-28 09:30:00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">当前环节</p>
              <p className="text-sm font-medium">{isTicketCompleted ? '审批通过' : '三级经理审批'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 剧本营销配置提示 */}
      {dispatchSystem === 'script-marketing' && ticketData.currentStep === '剧本营销配置' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">剧本营销配置待办</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">请点击下方"发起剧本营销"按钮，进入IOP剧本营销页面完成剧本配置并提交执行。上游客群信息将自动带入剧本营销页面。</p>
            </div>
          </div>
        </div>
      )}

      {/* 基本信息 - 预警调度：只保留工单通用字段 */}
      {isAlertDispatch && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">基本信息</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">工单编号</p>
              <p className="text-sm font-medium">{ticketData.ticketId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单标题</p>
              <p className="text-sm font-medium">{ticketData.ticketTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单类型</p>
              <p className="text-sm font-medium">生产类/预警调度</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单状态</p>
              <p className="text-sm font-medium">{ticketData.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">重要级别</p>
              <p className="text-sm font-medium">{ticketData.importanceLevel || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">发起人</p>
              <p className="text-sm font-medium">{(ticketData as any).submitter || '系统自动'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">发起时间</p>
              <p className="text-sm font-medium">{(ticketData as any).submitTime || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">当前环节</p>
              <p className="text-sm font-medium">{isTicketCompleted ? '已结束' :
                (ticketData as any).executionModeInfo === '在线执行' ? '在线处理' :
                (ticketData as any).executionModeInfo === '分包看管执行' ? '10088处理' :
                (ticketData as any).executionModeInfo === '在线+分包看管执行' ? '网格经理处理' :
                '地市集运处理'
              }</p>
            </div>
          </div>
        </Card>
      )}

      {/* 扩展信息 - 预警调度特有字段 */}
      {isAlertDispatch && (
        <CollapsibleCard title="扩展信息" icon={<AlertCircle className="h-5 w-5 text-orange-600" />} moduleKey="ext-alert-dispatch" collapsed={collapsedModules.has('ext-alert-dispatch')} onToggle={toggleModule}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">预警类型</p>
              <p className="text-sm font-medium">{(ticketData as any).alertTypeInfo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">业务类型</p>
              <p className="text-sm font-medium">{(ticketData as any).businessTypeInfo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">执行模式</p>
              <p className="text-sm font-medium">{(ticketData as any).executionModeInfo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">执行角色</p>
              <p className="text-sm font-medium">{(ticketData as any).executionRoleInfo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">客户姓名</p>
              <p className="text-sm font-medium">{(ticketData as any).customerName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">客户号码</p>
              <p className="text-sm font-medium">{(ticketData as any).customerPhone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">归属区域</p>
              <p className="text-sm font-medium">{(ticketData as any).alertRegion || '-'}</p>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 执行记录 - 预警调度客户触达明细 */}
      {isAlertDispatch && (
        <CollapsibleCard title="执行记录" icon={<BarChart3 className="h-5 w-5 text-green-600" />} moduleKey="execution-records" collapsed={collapsedModules.has('execution-records')} onToggle={toggleModule}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-20">客户姓名</TableHead>
                  <TableHead className="text-center w-32">手机号</TableHead>
                  <TableHead className="text-center w-20">是否呼叫</TableHead>
                  <TableHead className="text-center w-24">呼叫结果</TableHead>
                  <TableHead className="text-center w-24">通话时长</TableHead>
                  <TableHead className="text-center w-24">登记状态</TableHead>
                  <TableHead className="text-center w-40">执行时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((ticketData as any).executionRecords || []).map((record: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-center">{record.customerName}</TableCell>
                    <TableCell className="text-sm text-center font-mono">{record.phone}</TableCell>
                    <TableCell className="text-sm text-center">{record.called}</TableCell>
                    <TableCell className="text-sm text-center">{record.callResult}</TableCell>
                    <TableCell className="text-sm text-center">{record.duration}</TableCell>
                    <TableCell className="text-sm text-center">
                      <Badge variant={record.registerStatus === '已登记' ? 'default' : 'secondary'} className="text-xs">{record.registerStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-center text-gray-500">{record.execTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleCard>
      )}

      {/* 关联预警规则 - 预警调度 */}
      {isAlertDispatch && (
        <CollapsibleCard title="关联预警规则" icon={<Crosshair className="h-5 w-5 text-blue-600" />} moduleKey="related-alert-rule" collapsed={collapsedModules.has('related-alert-rule')} onToggle={toggleModule}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">规则名称</p>
              <p className="text-sm font-medium text-primary cursor-pointer hover:underline">{(ticketData as any).relatedAlertRule?.ruleName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">规则编号</p>
              <p className="text-sm font-medium">{(ticketData as any).relatedAlertRule?.ruleId || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">规则状态</p>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{(ticketData as any).relatedAlertRule?.ruleStatus || '-'}</Badge>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 扩展信息 - 预警规则审批特有字段 */}
      {isAlertApproval && (
        <CollapsibleCard title="扩展信息" icon={<AlertCircle className="h-5 w-5 text-orange-600" />} moduleKey="ext-alert-approval" collapsed={collapsedModules.has('ext-alert-approval')} onToggle={toggleModule}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">预警名称</p>
              <p className="text-sm font-medium">存量客户携转预警规则</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">预警类型</p>
              <p className="text-sm font-medium">任务类</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">预警级别</p>
              <p className="text-sm font-medium">高</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">业务专题</p>
              <p className="text-sm font-medium">存量运营</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">业务类型</p>
              <p className="text-sm font-medium">携转预警</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">客户类型</p>
              <p className="text-sm font-medium">全球通客户</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">执行模式</p>
              <p className="text-sm font-medium">在线执行</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">执行角色</p>
              <p className="text-sm font-medium">10088、网格经理</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">归属区域</p>
              <p className="text-sm font-medium">新疆</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">规则状态</p>
              <p className="text-sm font-medium">{isTicketCompleted ? '已生效' : '审批中'}</p>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 基本信息 - 非预警规则审批且非预警调度 */}
      {!isAlertApproval && !isAlertDispatch && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">基本信息</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">工单编号</p>
              <p className="text-sm font-medium">{ticketData.ticketId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工单标题</p>
              <p className="text-sm font-medium">{ticketData.ticketTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">业务类型</p>
              <p className="text-sm font-medium">{ticketData.businessType}</p>
            </div>
            {paramType !== 'retention-task' && <div>
              <p className="text-sm text-gray-500 mb-1">业务场景</p>
              <p className="text-sm font-medium">{ticketData.businessScenario}</p>
            </div>}
            {isThreeMajorDispatch && (
            <div>
              <p className="text-sm text-gray-500 mb-1">重要级别</p>
              <p className="text-sm font-medium">{ticketData.importanceLevel}</p>
            </div>
            )}
            {isOpportunityDispatch && (
            <div>
              <p className="text-sm text-gray-500 mb-1">商机评级</p>
              <p className="text-sm font-medium">{(ticketData as any).relatedOpportunity?.rating || '-'}</p>
            </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">要求完成时间</p>
              <p className="text-sm font-medium">{ticketData.requiredCompleteTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">派发系统</p>
              <p className="text-sm font-medium">{(ticketData as any).dispatchSystemLabel || (dispatchSystem === 'platform' ? '本平台' : dispatchSystem === 'IOP' ? 'IOP' : dispatchSystem === 'script-marketing' ? '剧本营销' : '网格通')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">提交人</p>
              <p className="text-sm font-medium">{ticketData.submitter}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">提交时间</p>
              <p className="text-sm font-medium">{ticketData.submitTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">来源系统</p>
              <p className="text-sm font-medium">{ticketData.sourceSystem}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 mb-1">要求</p>
              <p className="text-sm font-medium">{ticketData.requirement}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 扩展信息 - 非预警规则审批且非预警调度 */}
      {!isAlertApproval && !isAlertDispatch && (
      <CollapsibleCard title="扩展信息" icon={<AlertCircle className="h-5 w-5 text-orange-600" />} moduleKey="ext-info" collapsed={collapsedModules.has('ext-info')} onToggle={toggleModule}>
        <div className="grid grid-cols-3 gap-4">
            {/* 是否开启后评估 - 非商机调度类型且非保有任务调度展示 */}
            {!isOpportunityDispatch && paramType !== 'retention-task' && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">是否开启后评估</p>
                  <p className="text-sm font-medium">{ticketData.enablePostEvaluation ? '是' : '否'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">后评估周期</p>
                  <p className="text-sm font-medium">{ticketData.postEvaluationPeriod}</p>
                </div>
              </>
            )}
            {/* 执行角色 - 仅网格通派发展示 */}
            {dispatchSystem === 'wanggetong' && (
              <div>
                <p className="text-sm text-gray-500 mb-1">执行角色</p>
                <p className="text-sm font-medium">{(ticketData as any).executionRole || '地市集运/网格经理'}</p>
              </div>
            )}
            {/* 评估指标 - 非商机调度且非保有任务调度展示 */}
            {isThreeMajorDispatch && paramType !== 'retention-task' && (ticketData as any).evaluationIndicator && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">评估指标</p>
                  <p className="text-sm font-medium">{(ticketData as any).evaluationIndicator.indicatorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">基期值</p>
                  <p className="text-sm font-medium">{(ticketData as any).evaluationIndicator.baseValue}{(ticketData as any).evaluationIndicator.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">目标值</p>
                  <p className="text-sm font-medium">{(ticketData as any).evaluationIndicator.targetValue}{(ticketData as any).evaluationIndicator.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">改善方向</p>
                  <p className="text-sm font-medium">{(ticketData as any).evaluationIndicator.direction === 'up' ? '↑ 提升' : '↓ 降低'}</p>
                </div>
                {(ticketData as any).evaluationIndicator.currentValue != null && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">当前值</p>
                    <p className="text-sm font-medium">{(ticketData as any).evaluationIndicator.currentValue}{(ticketData as any).evaluationIndicator.unit}</p>
                  </div>
                )}
              </>
            )}
            {/* 保有任务调度独占字段 */}
            {paramType === 'retention-task' && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">业务专题</p>
                  <p className="text-sm font-medium">存量运营</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">业务类型</p>
                  <p className="text-sm font-medium">{ticketData.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">工单执行模式</p>
                  <p className="text-sm font-medium">{(ticketData as any).executionMode || '区公司执行'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">客群名称</p>
                  <p className="text-sm font-medium">{(ticketData as any).customerGroupName || '高价值携转预警客群'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">客群编码</p>
                  <p className="text-sm font-medium">{(ticketData as any).customerGroupCode || 'CG202607001'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">客群规模</p>
                  <p className="text-sm font-medium">{(ticketData as any).customerGroupSize || '12,586'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">备注信息</p>
                  <p className="text-sm font-medium">{(ticketData as any).remark || '-'}</p>
                </div>
              </>
            )}
            <div className="col-span-3">
              <p className="text-sm text-gray-500 mb-1">派发区域</p>
              {isOpportunityDispatch ? (
                <p className="text-sm font-medium">{(ticketData as any).dispatchInfo?.executionArea || ticketData.dispatchRegions.join('、')}</p>
              ) : paramType === 'retention-task' ? (
                <p className="text-sm font-medium">{ticketData.dispatchRegions.join('、')}（{(ticketData as any).executionMode === '地市执行' ? `共${ticketData.dispatchRegions.length}个地市` : '区公司统一执行'}）</p>
              ) : (
                <p className="text-sm font-medium">{ticketData.dispatchRegions.join('、')}（共{ticketData.dispatchRegions.length}个地州）</p>
              )}
            </div>
            {/* 预警指标/等级/值 - 非保有任务调度展示 */}
            {paramType !== 'retention-task' && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">预警指标</p>
                  <p className="text-sm font-medium">{(ticketData as any).alertIndicator || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">预警等级</p>
                  <p className="text-sm font-medium">{(ticketData as any).alertLevel || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">预警值</p>
                  <p className="text-sm font-medium">{(ticketData as any).alertValue || '-'}</p>
                </div>
              </>
            )}
          </div>
      </CollapsibleCard>
      )}


      {/* 调度内容 - 根据类型显示不同内容 */}
      {!isAlertApproval && paramType === 'indicator' && (
        <CollapsibleCard title="调度内容" icon={<Target className="h-5 w-5 text-purple-600" />} moduleKey="dispatch-content" collapsed={collapsedModules.has('dispatch-content')} onToggle={toggleModule}>
          
          {/* 账期选择 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">日指标账期</p>
                <p className="text-sm font-medium">{(ticketData as any).accountPeriod?.dayIndicator}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">月指标账期</p>
                <p className="text-sm font-medium">{(ticketData as any).accountPeriod?.monthIndicator}</p>
              </div>
            </div>
          </div>
          
          {/* 调度指标列表 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">调度指标列表</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-36">指标名称</TableHead>
                  <TableHead className="w-20 text-center">统计周期</TableHead>
                  <TableHead className="w-24 text-center">账期</TableHead>
                  <TableHead className="w-24 text-right">指标值</TableHead>
                  <TableHead className="w-24 text-right">目标值</TableHead>
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
                    <TableCell className="text-right">{indicator.targetValue}</TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.momTrend === 'up' ? 'text-green-600' : indicator.momTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.momTrend === 'up' ? '↑ ' : indicator.momTrend === 'down' ? '↓ ' : ''}{indicator.mom}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.yoyTrend === 'up' ? 'text-green-600' : indicator.yoyTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.yoyTrend === 'up' ? '↑ ' : indicator.yoyTrend === 'down' ? '↓ ' : ''}{indicator.yoy}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{indicator.locationPath}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 说明：位置路径用于指引指标在市场运营平台菜单中的具体位置，请按菜单层级找到对应指标。
          </p>
        </CollapsibleCard>
      )}

      {paramType === 'strategy' && (
        <CollapsibleCard title="调度内容" icon={<User className="h-5 w-5 text-orange-600" />} moduleKey="dispatch-content" collapsed={collapsedModules.has('dispatch-content')} onToggle={toggleModule}>
          
          {/* 策略列表 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">策略列表</h3>
          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-32">关联指标</TableHead>
                  <TableHead className="w-28">风险客群</TableHead>
                  <TableHead>策略描述</TableHead>
                  <TableHead className="w-28">派发区域</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).strategyList?.map((strategy: any) => (
                  <TableRow key={strategy.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{strategy.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{strategy.indicator}</TableCell>
                    <TableCell>{strategy.riskGroup}</TableCell>
                    <TableCell className="max-w-xs">{strategy.strategy}</TableCell>
                    <TableCell>{strategy.dispatchRegion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* 关联指标列表（去重后） */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">关联指标列表（去重后）</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-36">指标名称</TableHead>
                  <TableHead className="w-20 text-center">统计周期</TableHead>
                  <TableHead className="w-24 text-center">账期</TableHead>
                  <TableHead className="w-24 text-right">指标值</TableHead>
                  <TableHead className="w-24 text-right">目标值</TableHead>
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
                    <TableCell className="text-right">{indicator.targetValue}</TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.momTrend === 'up' ? 'text-green-600' : indicator.momTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.momTrend === 'up' ? '↑ ' : indicator.momTrend === 'down' ? '↓ ' : ''}{indicator.mom}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.yoyTrend === 'up' ? 'text-green-600' : indicator.yoyTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.yoyTrend === 'up' ? '↑ ' : indicator.yoyTrend === 'down' ? '↓ ' : ''}{indicator.yoy}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{indicator.locationPath}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 说明：位置路径用于指引指标在市场运营平台菜单中的具体位置，请按菜单层级找到对应指标。
          </p>
          
          {/* 客户清单分发信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">客户清单分发信息</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-24">地州</TableHead>
                  <TableHead className="w-64">客户清单文件名</TableHead>
                  <TableHead>文件路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).customerListDistribution?.map((item: any, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell>{item.province}</TableCell>
                    <TableCell className="font-medium">{item.fileName}</TableCell>
                    <TableCell className="text-sm text-gray-600 font-mono">{item.filePath}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ 说明：客户清单包含敏感信息，通过独立安全通道下发。请各省接收人按上述路径在指定位置获取文件。
          </p>
        </CollapsibleCard>
      )}

      {paramType === 'customer-group' && (
        <CollapsibleCard title="调度内容" icon={<Users className="h-5 w-5 text-cyan-600" />} moduleKey="dispatch-content" collapsed={collapsedModules.has('dispatch-content')} onToggle={toggleModule}>
          
          {/* 客群信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">客群信息</h3>
          <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">客群名称</p>
              <p className="text-sm font-medium">{(ticketData as any).customerGroup?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">客群规模</p>
              <p className="text-sm font-medium">{(ticketData as any).customerGroup?.scale}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">圈选标签</p>
              <p className="text-sm font-medium">
                {(ticketData as any).customerGroup?.tagFilters?.map((tag: any) => `${tag.name}(${tag.value})`).join('、')}
              </p>
            </div>
          </div>
          
          {/* 调度指标列表 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">调度指标列表</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-40">指标名称</TableHead>
                  <TableHead className="w-20 text-center">统计周期</TableHead>
                  <TableHead className="w-24 text-center">账期</TableHead>
                  <TableHead className="w-24 text-right">指标值</TableHead>
                  <TableHead className="w-24 text-right">目标值</TableHead>
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
                    <TableCell className="text-right">{indicator.targetValue}</TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.momTrend === 'up' ? 'text-green-600' : indicator.momTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.momTrend === 'up' ? '↑ ' : indicator.momTrend === 'down' ? '↓ ' : ''}{indicator.mom}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={indicator.yoyTrend === 'up' ? 'text-green-600' : indicator.yoyTrend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                        {indicator.yoyTrend === 'up' ? '↑ ' : indicator.yoyTrend === 'down' ? '↓ ' : ''}{indicator.yoy}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{indicator.locationPath}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 说明：位置路径用于指引指标在市场运营平台菜单中的具体位置，请按菜单层级找到对应指标。
          </p>
          
          {/* 客户清单分发信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">客户清单分发信息</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-24">地州</TableHead>
                  <TableHead className="w-64">客户清单文件名</TableHead>
                  <TableHead>文件路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ticketData as any).customerListDistribution?.map((item: any, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell>{item.province}</TableCell>
                    <TableCell className="font-medium">{item.fileName}</TableCell>
                    <TableCell className="text-sm text-gray-600 font-mono">{item.filePath}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ 说明：客户清单包含敏感信息，通过独立安全通道下发。请各省接收人按上述路径在指定位置获取文件。
          </p>
        </CollapsibleCard>
      )}

      {/* 网格通类调度 - 共享执行组件：商机调度 + 区域攻坚调度 */}
      {(isOpportunityDispatch || paramType === 'region-assault') && dispatchSystem === 'wanggetong' && (
        <CollapsibleCard title="调度内容" icon={
          paramType === 'customer-opportunity-dispatch' ? (
            <UserCog className="h-5 w-5 text-purple-600" />
          ) : paramType === 'region-assault' ? (
            <Crosshair className="h-5 w-5 text-rose-600" />
          ) : (
            <Users className="h-5 w-5 text-teal-600" />
          )
        } moduleKey="dispatch-content" collapsed={collapsedModules.has('dispatch-content')} onToggle={toggleModule}>
          <Badge variant="outline" className="text-xs mb-4">网格通执行</Badge>

          {/* 关联商机信息 - 统一组件（客群调度在调度内容中已展示，不再重复） */}
          {paramType !== 'group-opportunity-dispatch' && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {paramType === 'customer-opportunity-dispatch' ? '关联商机信息' : paramType === 'region-assault' ? '攻坚区域信息' : '关联客群商机信息'}
              </h3>
              <OpportunityRelatedInfo data={(ticketData as Record<string, any>)?.relatedOpportunity || (ticketData as Record<string, any>)?.relatedOpportunityInfo} dispatchSystem="wanggetong" ticketType={paramType as 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault' | 'strategy' | 'customer-group'} />
            </>
          )}

          {/* 调度配置 - 统一组件（仅区域攻坚调度显示） */}
          {paramType === 'region-assault' && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">调度配置</h3>
              <OpportunityDispatchConfig data={(ticketData as Record<string, any>)?.dispatchInfo || (ticketData as Record<string, any>)?.dispatchConfig} dispatchSystem="wanggetong" ticketType={paramType as 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault' | 'strategy' | 'customer-group'} evaluationIndicator={(ticketData as any).evaluationIndicator} />
            </>
          )}

          {/* 来源/特征统计 - 条件渲染 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {paramType === 'customer-opportunity-dispatch' ? '商机来源统计' : paramType === 'region-assault' ? '目标客户统计' : '客群标签特征分布'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {paramType === 'customer-opportunity-dispatch' ? (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">按商机类型分布</p>
                  <div className="space-y-2">
                    {((ticketData as any).opportunitySourceStats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stat.color }} />
                        <span className="text-xs text-gray-600 w-28">{stat.type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(stat.count / 45 * 100)}%`, backgroundColor: stat.color }} />
                        </div>
                        <span className="text-xs font-medium">{stat.count}户</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">按商机评级分布</p>
                  <div className="space-y-2">
                    {((ticketData as any).opportunityRatingStats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Badge variant={stat.rating === 'A级' ? 'default' : stat.rating === 'B级' ? 'secondary' : 'outline'} className="text-xs w-12 justify-center">{stat.rating}</Badge>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${stat.rating === 'A级' ? 'bg-red-500' : stat.rating === 'B级' ? 'bg-yellow-500' : 'bg-blue-400'}`} style={{ width: `${(stat.count / 45 * 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium">{stat.count}户</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : paramType === 'region-assault' ? (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-gray-500">按小区标签分布</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-white text-gray-700 border border-gray-200 shadow-lg text-xs">
                        统计已圈选小区中，各标签覆盖的客户数。同一客户可能被多个标签覆盖，各标签客户数之和≥目标客户总数。数据来源：大数据平台按小区+标签聚合统计。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: '流量低饱和小区', count: 1260, color: '#f59e0b' },
                      { label: '流量零低小区', count: 890, color: '#10b981' },
                      { label: '流量超套高发小区', count: 580, color: '#ef4444' },
                      { label: '异网高风险小区', count: 720, color: '#8b5cf6' },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stat.color }} />
                        <span className="text-xs text-gray-600 w-28">{stat.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(stat.count / 1260 * 100)}%`, backgroundColor: stat.color }} />
                        </div>
                        <span className="text-xs font-medium">{stat.count}户</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-xs text-gray-500">按客户标签分布</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-white text-gray-700 border border-gray-200 shadow-lg text-xs">
                        统计已圈选小区的目标客户中，各客户标签覆盖的客户数。同一客户可能命中多个标签，各标签客户数之和≥目标客户总数。数据来源：大数据平台布尔标签。
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: '13-18岁零低流量', count: 210, color: '#3b82f6' },
                      { label: '19-30岁零低流量', count: 380, color: '#3b82f6' },
                      { label: '31-50岁零低流量', count: 560, color: '#3b82f6' },
                      { label: '13-18岁低饱和', count: 150, color: '#06b6d4' },
                      { label: '19-30岁低饱和', count: 320, color: '#06b6d4' },
                      { label: '流量超套收入', count: 480, color: '#f97316' },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stat.color }} />
                        <span className="text-xs text-gray-600 w-28">{stat.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(stat.count / 560 * 100)}%`, backgroundColor: stat.color }} />
                        </div>
                        <span className="text-xs font-medium">{stat.count}户</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : paramType === 'group-opportunity-dispatch' ? (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">按策略类型分布</p>
                  <div className="space-y-2">
                    {((ticketData as any).strategyList || []).map((strategy: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-orange-400" />
                        <span className="text-xs text-gray-600 w-28">{strategy.indicator}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-orange-400" style={{ width: '70%' }} />
                        </div>
                        <span className="text-xs font-medium">{strategy.riskGroup}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">覆盖客群规模</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">目标客群规模</span>
                      <span className="text-sm font-semibold text-blue-600">{(ticketData as any).dispatchInfo?.targetGroupScale || '2,850'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">覆盖网格数</span>
                      <span className="text-sm font-semibold">{(ticketData as any).dispatchInfo?.gridCoverageCount || 6}个</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">子单数量</span>
                      <span className="text-sm font-semibold">{(ticketData as any).dispatchInfo?.subTicketCount || 6}个</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">按客群标签分布</p>
                  <div className="space-y-2">
                    {((ticketData as any).opportunitySourceStats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stat.color }} />
                        <span className="text-xs text-gray-600 w-32">{stat.type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(stat.count / 3560 * 100)}%`, backgroundColor: stat.color }} />
                        </div>
                        <span className="text-xs font-medium">{stat.count}户</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">客群规模概览</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">目标客群规模</span>
                      <span className="text-sm font-semibold text-blue-600">{(ticketData as any).dispatchInfo?.targetGroupScale || '3,560'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">覆盖网格数</span>
                      <span className="text-sm font-semibold">{(ticketData as any).dispatchInfo?.gridCoverageCount || 8}个</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">子单数量</span>
                      <span className="text-sm font-semibold">{(ticketData as any).dispatchInfo?.subTicketCount || 8}个</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 执行统计 */}
          <ExecutionStats
            data={{
              targetCustomerCount: (ticketData as any).executionProgress?.targetCount || 0,
              reachedCustomerCount: (ticketData as any).executionProgress?.calledCount || (ticketData as any).executionProgress?.reachedCount || 0,
              successCustomerCount: (ticketData as any).executionProgress?.marketingSuccessCount || (ticketData as any).executionProgress?.successCount || 0,
              reachRate: typeof (ticketData as any).effectEvaluation?.reachRate === 'string' ? parseFloat((ticketData as any).effectEvaluation?.reachRate) || 0 : (ticketData as any).effectEvaluation?.reachRate || 0,
              marketingSuccessRate: typeof (ticketData as any).effectEvaluation?.successRate === 'string' ? parseFloat((ticketData as any).effectEvaluation?.successRate) || 0 : (ticketData as any).effectEvaluation?.successRate || 0,
            }}
          />

          {/* 子单列表 - 统一列定义 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">
            子单列表
            {paramType === 'group-opportunity-dispatch' && (
              <span className="text-xs text-gray-400 font-normal ml-2">调度中心将客群按客户所属网格拆分，直达对应网格执行人员</span>
            )}
            {paramType === 'region-assault' && (
              <span className="text-xs text-gray-400 font-normal ml-2">按AOI所属网格拆分子单，各网格认领执行</span>
            )}
          </h3>
          <SubTicketList
            data={((ticketData as any).subTicketList || []).map((sub: any) => ({
              id: sub.id,
              subOrderId: sub.subOrderId || '',
              executionStatus: sub.executionStatus || sub.status || '',
              city: sub.city || '',
              district: sub.district || '',
              grid: sub.grid || '',
              targetCount: sub.targetCount || sub.customerCount,
              executor: sub.executor || '',
              completionRate: sub.completionRate,
              status: sub.status,
            }))}
            onGoToSubTicketDetail={goToSubTicketDetail}
          />
        </CollapsibleCard>
      )}

      {/* 执行结果统计 - 策略调度(派至IOP，无客户级执行记录) + 客群调度(派至网格通，有客户级执行记录) */}
      {(paramType === 'strategy' || paramType === 'customer-group') && (
        <CollapsibleCard title="执行结果统计" icon={
          paramType === 'strategy' ? (
            <User className="h-5 w-5 text-orange-600" />
          ) : (
            <Users className="h-5 w-5 text-cyan-600" />
          )
        } moduleKey="execution-stats" collapsed={collapsedModules.has('execution-stats')} onToggle={toggleModule}>
          <Badge variant="outline" className="text-xs mb-4">{paramType === 'strategy' ? 'IOP执行' : '网格通执行'}</Badge>

          {/* 执行统计 */}
          <ExecutionStats
            data={{
              targetCustomerCount: (ticketData as any).executionProgress?.targetCount || 0,
              reachedCustomerCount: (ticketData as any).executionProgress?.reachedCount || 0,
              successCustomerCount: (ticketData as any).executionProgress?.successCount || 0,
              reachRate: typeof (ticketData as any).effectEvaluation?.reachRate === 'string' ? parseFloat((ticketData as any).effectEvaluation?.reachRate) || 0 : (ticketData as any).effectEvaluation?.reachRate || 0,
              marketingSuccessRate: typeof (ticketData as any).effectEvaluation?.successRate === 'string' ? parseFloat((ticketData as any).effectEvaluation?.successRate) || 0 : (ticketData as any).effectEvaluation?.successRate || 0,
            }}
          />

          {/* 子单列表 - 统一列定义 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">子单列表</h3>
          <SubTicketList
            data={((ticketData as any).subTicketList || []).map((sub: any) => ({
              id: sub.id,
              subOrderId: sub.subOrderId || '',
              executionStatus: sub.executionStatus || sub.status || '',
              city: sub.city || '',
              district: sub.district || '',
              grid: sub.grid || '',
              targetCount: sub.targetCount || sub.customerCount,
              executor: sub.executor || '',
              completionRate: sub.completionRate,
              status: sub.status,
            }))}
            onGoToSubTicketDetail={goToSubTicketDetail}
          />
        </CollapsibleCard>
      )}



      {/* 跟踪周期数据 - 三大调度+区域攻坚显示，商机调度不显示 */}
      {!isOpportunityDispatch && ((ticketData as any)?.trackingData) && (
      <CollapsibleCard title="跟踪周期数据" icon={<Clock className="h-5 w-5 text-green-600" />} moduleKey="tracking-data" collapsed={collapsedModules.has('tracking-data')} onToggle={toggleModule}>

        {/* 跟踪周期配置说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-blue-600 mb-1">派发月份</p>
              <p className="text-sm font-semibold text-blue-900">{dispatchMonth}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 mb-1">后评估周期</p>
              <p className="text-sm font-semibold text-blue-900">{(ticketData as any).postEvaluationPeriod || `${evaluationPeriodStart} ~ ${evaluationPeriodEnd}，共${trackingPeriod}个月`}</p>
            </div>
          </div>
        </div>

        {/* 达成情况表格 */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {((ticketData as Record<string, unknown>).trackingData as any)?.columns.map((column: any) => (
                  <TableHead
                    key={column.key}
                    className={column.key === 'indicatorName' ? 'text-left' : 'text-center'}
                    dangerouslySetInnerHTML={{ __html: column.label }}
                  />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {((ticketData as Record<string, unknown>).trackingData as any)?.rows.map((row: any, rowIndex: number) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.indicatorName}</TableCell>
                  <TableCell className="text-center">{row.initialValue}</TableCell>
                  <TableCell className="text-center">{row.targetValue}</TableCell>
                  {((ticketData as Record<string, unknown>).trackingData as any)?.columns.slice(3).map((column: any) => {
                    const cellData = row[column.key] as { value: string | null; rate: string } | undefined;
                    return (
                      <TableCell key={column.key} className="text-center">
                        {cellData && cellData.value !== null ? (
                          <>
                            {cellData.value}
                            <br />
                            <span className="text-sm text-blue-600">{cellData.rate}</span>
                          </>
                        ) : (
                          <span className="text-sm text-blue-600">{cellData?.rate || '-'}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleCard>
      )}

      {/* 子单列表 - 仅指标调度（其他调度类型的子单列表已在各自Card中渲染） */}
      {paramType === 'indicator' && (
        <CollapsibleCard title="子单列表" icon={<FileText className="h-5 w-5 text-blue-600" />} moduleKey="sub-ticket-list" collapsed={collapsedModules.has('sub-ticket-list')} onToggle={toggleModule}>
          <SubTicketList
            data={((ticketData as any).subTicketList || []).map((sub: any) => ({
              id: sub.id,
              subOrderId: sub.subOrderId || '',
              executionStatus: sub.executionStatus || sub.status || '',
              city: sub.city || '',
              district: sub.district || '',
              grid: sub.grid || '',
              targetCount: sub.targetCount || sub.customerCount,
              executor: sub.executor || '',
              completionRate: sub.completionRate,
              status: sub.status,
            }))}
            showRegionDetail={true}
            showTargetCount={true}
            showCompletionRate={true}
            onGoToSubTicketDetail={goToSubTicketDetail}
          />
        </CollapsibleCard>
      )}

      {/* 子单列表 - 仅指标调度

      {/* 节点信息 */}

      {/* 影响面预估已移除 - 审批场景下无法实时预匹配全量客户数据，落不了地 */}

      {/* 预警规则编排 - 仅预警规则审批类型显示 */}
      {isAlertApproval && (
        <CollapsibleCard title="预警规则编排" icon={<AlertCircle className="h-5 w-5 text-amber-600" />} moduleKey="alert-rule" collapsed={collapsedModules.has('alert-rule')} onToggle={toggleModule}>
          <div className="space-y-4">
            {/* AND交集条件组 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">AND 交集</Badge>
                <span className="text-sm text-gray-500">满足以下全部条件</span>
              </div>
              <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">条件1：</span>
                  <span className="font-medium">客户月均ARPU &ge; 128元</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">条件2：</span>
                  <span className="font-medium">在网时长 &ge; 12个月</span>
                </div>
              </div>
            </div>
            {/* OR并集条件组 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">OR 并集</Badge>
                <span className="text-sm text-gray-500">满足以下任一条件</span>
              </div>
              <div className="pl-4 border-l-2 border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">条件3：</span>
                  <span className="font-medium">携转查询次数 &ge; 3次/月</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">条件4：</span>
                  <span className="font-medium">合约到期天数 &le; 30天</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">条件5：</span>
                  <span className="font-medium">竞品优惠感知标记 = 存在</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
              <span>更新周期：日度</span>
              <span>|</span>
              <span>规则生效时间：2026-07-01</span>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 执行配置 - 仅预警规则审批类型显示 */}
      {isAlertApproval && (
        <CollapsibleCard title="执行配置" icon={<Settings className="h-5 w-5 text-gray-600" />} moduleKey="exec-config" collapsed={collapsedModules.has('exec-config')} onToggle={toggleModule}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">执行模式</p>
                <p className="text-sm font-medium">在线执行</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">执行角色</p>
                <p className="text-sm font-medium">10088、网格经理</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">工单执行预览</p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">地市</TableHead>
                      <TableHead className="text-center">执行模式</TableHead>
                      <TableHead className="text-center">执行角色</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'].map((city) => (
                      <TableRow key={city}>
                        <TableCell className="text-center text-sm">{city}</TableCell>
                        <TableCell className="text-center text-sm">在线执行</TableCell>
                        <TableCell className="text-center text-sm">10088、网格经理</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* 关联预警调度单 - 仅预警规则审批类型显示 */}
      {isAlertApproval && (
        <CollapsibleCard title="关联预警调度单" icon={<Crosshair className="h-5 w-5 text-blue-600" />} moduleKey="related-alert-dispatch" collapsed={collapsedModules.has('related-alert-dispatch')} onToggle={toggleModule}>
          {isTicketCompleted ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">该预警规则审批通过后，已生成以下预警调度工单：</p>
              <div className="space-y-2">
                {[
                  { id: '5357500000001', title: '携转预警-客户触达工单', status: '执行中', createTime: '2026-07-01 09:00:05' },
                  { id: '5357500000002', title: '携转预警-客户触达工单', status: '执行中', createTime: '2026-07-02 09:00:05' },
                  { id: '5357500000003', title: '携转预警-客户触达工单', status: '已完成', createTime: '2026-07-03 09:00:05' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-mono text-primary cursor-pointer hover:underline" onClick={() => {
                      router.push(`/workspace/dispatch/query?type=预警调度&searchId=${item.id}`);
                    }}>{item.id}</span>
                    <span className="text-sm">{item.title}</span>
                    <Badge variant={item.status === '已完成' ? 'default' : 'secondary'} className="text-xs">{item.status}</Badge>
                    <span className="text-xs text-gray-500 ml-auto">{item.createTime}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => {
                  router.push('/workspace/dispatch/query?type=预警调度');
                }}>
                  查看全部关联预警调度单（3条）
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>规则尚未生效，暂无关联预警调度单</span>
            </div>
          )}
        </CollapsibleCard>
      )}
      {/* 节点信息 - 保有任务调度不显示（流转信息已包含节点信息） */}
      {paramType !== 'retention-task' && (
      <CollapsibleCard title="节点信息" icon={<User className="h-5 w-5 text-blue-600" />} moduleKey="node-info" collapsed={collapsedModules.has('node-info')} onToggle={toggleModule}>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">当前节点</p>
            <p className="text-sm font-medium">
              {isTicketCompleted ? '已结束'
                : isAlertApproval ? '新疆区公司三级经理审批'
                : isAlertDispatch ? ((ticketData as any).executionModeInfo === '在线执行' ? '在线处理' : (ticketData as any).executionModeInfo === '分包看管执行' ? '10088处理' : (ticketData as any).executionModeInfo === '在线+分包看管执行' ? '网格经理处理' : '地市集运处理')
                : ticketData.currentStep || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">处理人</p>
            <p className="text-sm font-medium">
              {isTicketCompleted ? '-'
                : isAlertApproval ? '新疆区公司三级经理'
                : isAlertDispatch ? ((ticketData as any).executionRoleInfo || '网格通')
                : ticketData.handler || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">处理动作</p>
            <p className="text-sm font-medium">
              {isTicketCompleted ? '-'
                : isAlertApproval ? '待审批'
                : isAlertDispatch ? '执行中'
                : '待处理'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">到达时间</p>
            <p className="text-sm font-medium">{ticketData.createdAt || '-'}</p>
          </div>
        </div>
      </CollapsibleCard>
      )}

      {/* 关联保有活动信息 - 仅保有任务调度类型显示 */}
      {paramType === 'retention-task' && (
        <CollapsibleCard title="关联保有活动信息" icon={<FileText className="h-5 w-5 text-emerald-600" />} moduleKey="retention-activities" collapsed={collapsedModules.has('retention-activities')} onToggle={toggleModule}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">序号</TableHead>
                <TableHead>活动名称</TableHead>
                <TableHead>活动ID</TableHead>
                <TableHead>执行周期</TableHead>
                <TableHead>执行渠道</TableHead>
                <TableHead>运营位</TableHead>
                <TableHead>当前状态</TableHead>
                <TableHead>创建人</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-20 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: '全球通保有促活活动', id: 'IOP-2026-0701', cycle: '2026-07-01~2026-07-31', channel: '短信+外呼', position: '5G套餐推荐', status: '执行中', creator: '张建国', time: '2026-06-28 10:30' },
                { name: '宽带到期维系活动', id: 'IOP-2026-0702', cycle: '2026-07-01~2026-09-30', channel: '外呼+营业厅', position: '宽带续约', status: '待执行', creator: '李明', time: '2026-06-30 14:20' },
                { name: '异网携转赢回活动', id: 'IOP-2026-0703', cycle: '2026-07-15~2026-08-15', channel: '短信+APP推送', position: '携转挽留', status: '已完成', creator: '王强', time: '2026-07-01 09:15' },
              ].map((activity, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{activity.id}</TableCell>
                  <TableCell className="text-xs">{activity.cycle}</TableCell>
                  <TableCell>{activity.channel}</TableCell>
                  <TableCell>{activity.position}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === '执行中' ? 'default' : activity.status === '已完成' ? 'secondary' : 'outline'} className="text-xs">
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.creator}</TableCell>
                  <TableCell className="text-xs">{activity.time}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => {
                          const iopPath = `/workspace/iop-activity-detail?activityId=${activity.id}&ticketId=${ticketData.ticketId}`;
                          addTab({ id: iopPath, title: 'IOP活动详情', path: iopPath });
                          router.push(iopPath);
                        }}>
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CollapsibleCard>
      )}

      {/* 流转信息 */}
      <CollapsibleCard title="流转信息" icon={<FileText className="h-5 w-5 text-blue-600" />} moduleKey="transfer-info" collapsed={collapsedModules.has('transfer-info')} onToggle={toggleModule}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>环节</TableHead>
              <TableHead>处理人</TableHead>
              <TableHead>处理动作</TableHead>
              <TableHead>开始处理时间</TableHead>
              <TableHead>结束处理时间</TableHead>
              <TableHead className="w-32">处理时长</TableHead>
              <TableHead>处理结果</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(ticketData.transferInfo ?? []).map((info: any, index: number) => {
              const transferList = ticketData.transferInfo ?? [];
              const isFirstInStep = index === 0 || transferList[index - 1]?.step !== info.step;
              const isLastInStep = index === transferList.length - 1 || transferList[index + 1]?.step !== info.step;
              const stepCount = transferList.filter((t: any) => t.step === info.step).length;
              return (
                <TableRow key={index} className={isFirstInStep && index > 0 ? 'border-t-2 border-t-muted/40' : ''}>
                  <TableCell className={isFirstInStep ? 'align-top' : 'align-middle'}>
                    {isFirstInStep && (
                      <Badge variant="outline" className="text-xs">{info.step}{stepCount > 1 ? ` (${stepCount}方)` : ''}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{info.handler}</TableCell>
                  <TableCell>{info.action}</TableCell>
                  <TableCell>{info.startTime}</TableCell>
                  <TableCell>{info.endTime}</TableCell>
                  <TableCell className="text-sm">{info.duration}</TableCell>
                  <TableCell>
                    {info.result !== '-' && (
                      <Badge variant="secondary" className="text-xs">{info.result}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleCard>
      </>
      )}

      {/* 审批弹窗 */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>处理提示</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 处理意见 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                处理意见 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="approveOpinion"
                    checked={approveOpinion === 'agree'}
                    onChange={() => setApproveOpinion('agree')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">同意</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="approveOpinion"
                    checked={approveOpinion === 'disagree'}
                    onChange={() => setApproveOpinion('disagree')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">不同意</span>
                </label>
              </div>
            </div>

            {/* 审批意见 - 常用意见 + 输入 */}
            <div>
              <label className="text-sm font-medium mb-2 block">审批意见</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {customOpinions.map((op, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs py-1 px-2"
                      onClick={() => setApproveComment(op)}
                    >
                      {op}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors text-xs py-1 px-2 text-muted-foreground"
                    onClick={() => setOpinionManageOpen(true)}
                  >
                    管理 ✎
                  </Badge>
                </div>
                <input
                  type="text"
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="请输入审批意见"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* 备注 */}
            <div>
              <label className="text-sm font-medium mb-2 block">备注</label>
              <textarea
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="请输入备注"
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* 流转信息：下一节点处理人 */}
            <div className="border-t pt-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">流转信息</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">下一节点处理人</span>
                {paramType === 'retention-task' ? (
                  <Select value={nextNodeHandler} onValueChange={setNextNodeHandler}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="请选择下一节点处理人" />
                    </SelectTrigger>
                    <SelectContent>
                      {retentionNextHandlers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">{nextNodeInfo.handler}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">处理方式</span>
                <span>{nextNodeInfo.method}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setApproveDialogOpen(false);
                alert(`${approveOpinion === 'agree' ? '审批通过' : '审批驳回'}：${approveComment || '无意见'}`);
                handleBack();
              }}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 常用意见管理弹窗 */}
      <Dialog open={opinionManageOpen} onOpenChange={setOpinionManageOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>管理常用审批意见</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {customOpinions.map((op, idx) => {
              const isDefault = DEFAULT_OPINIONS.includes(op);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{op}</span>
                  {isDefault ? (
                    <span className="text-xs text-muted-foreground px-1">系统预置</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                      onClick={() => saveOpinions(customOpinions.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              );
            })}
            <div className="border-t pt-3 flex gap-2">
              <input
                type="text"
                value={editingOpinion}
                onChange={(e) => setEditingOpinion(e.target.value)}
                placeholder="输入新意见"
                className="flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingOpinion.trim()) {
                    saveOpinions([...customOpinions, editingOpinion.trim()]);
                    setEditingOpinion('');
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (editingOpinion.trim()) {
                    saveOpinions([...customOpinions, editingOpinion.trim()]);
                    setEditingOpinion('');
                  }
                }}
              >
                添加
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpinionManageOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 处理弹窗（执行类工单，如指标调度） */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>处理工单</DialogTitle>
            <DialogDescription>请填写处理结果</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">处理结果 <span className="text-destructive">*</span></label>
              <Select value={processResult} onValueChange={(v) => setProcessResult(v as 'completed' | 'cannot_process' | 'reassign')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">处理完成</SelectItem>
                  <SelectItem value="cannot_process">无法处理</SelectItem>
                  <SelectItem value="reassign">转派</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {processResult === 'cannot_process' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">无法处理原因 <span className="text-destructive">*</span></label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择原因" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_error">数据异常</SelectItem>
                    <SelectItem value="customer_not_found">客户无法联系</SelectItem>
                    <SelectItem value="policy_conflict">政策冲突</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {processResult === 'reassign' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">转派对象 <span className="text-destructive">*</span></label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择转派对象" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid_manager">网格经理</SelectItem>
                    <SelectItem value="grid_staff">网格人员</SelectItem>
                    <SelectItem value="city_operator">地市运营人员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">处理备注</label>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="请输入处理备注..."
                value={processRemark}
                onChange={(e) => setProcessRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              取消
            </Button>
            <Button variant="default" onClick={() => {
              setProcessDialogOpen(false);
              toast.success('工单处理完成');
            }}>
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 转派弹窗（保有任务调度） */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>转派工单</DialogTitle>
            <DialogDescription>选择转派目标人员，工单将转给该人员接收处理</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={transferTarget} onValueChange={setTransferTarget}>
              <SelectTrigger>
                <SelectValue placeholder="请选择转派目标人" />
              </SelectTrigger>
              <SelectContent>
                {retentionNextHandlers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>取消</Button>
            <Button variant="default" disabled={!transferTarget} onClick={() => {
              setTransferDialogOpen(false);
              toast.success(`已转派给：${transferTarget}`);
              handleBack();
            }}>确认转派</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 拒绝弹窗（保有任务调度） */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>拒绝工单</DialogTitle>
            <DialogDescription>请输入拒绝原因，工单将退回</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <textarea
              className="w-full border rounded-md p-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="请输入拒绝原因"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>取消</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => {
              setRejectDialogOpen(false);
              toast.success('已拒绝工单');
              handleBack();
            }}>确认拒绝</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* 底部操作按钮 - 根据mode参数动态展示 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-center gap-4 z-10">
        {mode === 'process' && paramType === 'retention-task' && isApprovalWorkOrder && (
          <Button variant="default" className="w-32" onClick={() => setApproveDialogOpen(true)}>
            提交审批
          </Button>
        )}
        {mode === 'process' && paramType === 'retention-task' && !isApprovalWorkOrder && !retentionAccepted && (
          <>
            <Button variant="default" className="w-32" onClick={() => { setRetentionAccepted(true); toast.success('已接收工单'); }}>
              接收
            </Button>
            <Button variant="outline" className="w-32" onClick={() => setTransferDialogOpen(true)}>
              转派
            </Button>
            <Button variant="outline" className="w-32 text-destructive border-destructive hover:bg-destructive/10" onClick={() => setRejectDialogOpen(true)}>
              拒绝
            </Button>
          </>
        )}
        {mode === 'process' && paramType === 'retention-task' && !isApprovalWorkOrder && retentionAccepted && (
          <Button variant="default" className="w-32" onClick={() => {
            const iopPath = `/workspace/iop-strategy-config?ticketId=${ticketData.ticketId}`;
            addTab({ id: iopPath, title: 'IOP策略配置', path: iopPath });
            router.push(iopPath);
          }}>
            策略配置
          </Button>
        )}
        {mode === 'process' && paramType !== 'retention-task' && !((paramType === 'strategy' || paramType === 'customer-group') && dispatchSystem === 'script-marketing') && (
          <Button
            variant="default"
            className="w-32"
            onClick={() => isApprovalWorkOrder ? setApproveDialogOpen(true) : setProcessDialogOpen(true)}
          >
            提交
          </Button>
        )}
        {/* 剧本营销待办：发起剧本营销按钮 */}
        {mode === 'process' && (paramType === 'strategy' || paramType === 'customer-group') && dispatchSystem === 'script-marketing' && (
          <Button
            variant="default"
            className="w-32"
            onClick={() => {
              const sourceType = paramType === 'strategy' ? 'strategy-dispatch' : 'customer-group-dispatch';
              const customerGroupName = (ticketData as any)?.customerGroupName || (ticketData as any)?.customerGroup?.name || '高价值携转预警客群';
              const scriptPath = `/workspace/script-marketing?mode=sidebar&sourceType=${sourceType}&workOrderId=${ticketData.ticketId}&prefillCustomerGroup=${encodeURIComponent(customerGroupName)}`;
              addTab({ id: scriptPath, title: '新建剧本营销', path: scriptPath });
              router.push(scriptPath);
            }}
          >
            发起剧本营销
          </Button>
        )}
        <Button variant="outline" className="w-32" onClick={handleBack}>
          返回
        </Button>
      </div>

      {/* 为底部按钮留出空间 */}
      <div className="h-20"></div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TicketDetailContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
