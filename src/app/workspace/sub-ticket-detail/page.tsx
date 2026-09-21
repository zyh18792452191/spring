'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, User, FileText, BarChart3, Target, AlertCircle, Crosshair, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTabs } from '@/contexts/TabsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { FlowExecutionDetail } from '@/app/workspace/components/FlowExecutionDetail';
import ExecutionStats from '@/app/workspace/components/ExecutionStats';
import { resolveDispatchSystem, type DispatchSystem } from '@/lib/dispatch-system';

// 工单类型
type WorkOrderType = 'indicator' | 'strategy' | 'customer-group' | 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault' | 'retention-task';

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
  'customer-opportunity-dispatch': { label: '客户商机调度', color: 'bg-green-100 text-green-700' },
  'group-opportunity-dispatch': { label: '客群商机调度', color: 'bg-teal-100 text-teal-700' },
  'region-assault': { label: '区域攻坚调度', color: 'bg-red-100 text-red-700' },
  'retention-task': { label: '保有任务调度', color: 'bg-amber-100 text-amber-700' }
};

// 根据工单类型获取子单数据
const getSubTicketDataByType = (type: WorkOrderType, paramId: string, paramTitle: string, businessScenario: string = '') => {
  // 基础信息（三种类型通用）
  const baseData = {
    subTicketId: paramId || '000465098449015914497-001',
    ticketId: paramId ? paramId.replace(/-[^-]*$/, '') : '000465098449015914497',
    subTicketTitle: paramTitle || '昌吉-一降到底指标执行',
    ticketType: typeConfig[type].label,
    businessType: type === 'indicator' ? '管理类/指标调度' : 
                  type === 'strategy' ? '生产类/策略调度' : 
                  type === 'customer-group' ? '生产类/客群调度' :
                  type === 'customer-opportunity-dispatch' ? '商机类/客户商机调度' : 
                  type === 'group-opportunity-dispatch' ? '商机类/客群商机调度' : '生产类/保有任务调度',
    businessScenario: businessScenario || '离网维系',
    region: '昌吉',
    requiredCompleteTime: '2025-12-31 00:00:00',
    submitter: '集团市场运营人员',
    submitTime: '2025-12-16 18:15:10',
    sourceSystem: '市场运营平台',
    phone: '192****1113',
    executionCustomer: '991*********1113',
    description: '-',

    // 预警信息列表
    alertList: [] as Array<{ indicator: string; level: string; value: string }>,

    // 节点信息
    executor: '昌吉运营专员',
    department: '昌吉分公司市场部',
    status: '处理中',
    processResult: '-',
    timeoutStatus: '正常',
    createTime: '2025-12-16 18:20:00',
    completeTime: '-',
    updateTime: '2025-12-17 09:30:15',

    // 执行统计
    executionStats: {
      targetName: '昌吉网格-客户调度',
      targetScale: '5,700',
      completedCount: '3,214',
      completionRate: '56.4%',
    },

    // 流转信息（省内流转）
    transferInfo: [
      { step: '环节1', handler: '受理人', action: '-', startTime: '2025-12-16 18:20:00', endTime: '2025-12-16 18:20:00', duration: '00分钟01秒', result: '-' },
      { step: '环节2', handler: '昌吉运营专员', action: '-', startTime: '2025-12-16 18:20:00', endTime: '-', duration: '-', result: '-' },
    ],
  };

  // 指标调度子单
  if (type === 'indicator') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '昌吉-一降到底指标执行',
      // 调度内容：账期选择
      accountPeriod: {
        dayIndicator: '2025-12-15',
        monthIndicator: '2025-11'
      },
      // 调度指标列表（含账期、环比、同比、位置路径，无目标值）
      dispatchIndicators: [
        { 
          id: 1,
          name: '一降到底规模', 
          period: '月',
          accountPeriod: '2025-11',
          value: '12,580户',
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
          mom: '+3.2%',
          momTrend: 'up' as const,
          yoy: '+1.8%',
          yoyTrend: 'up' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 离网预警客户数量（指标树）'
        },
      ],
      // 派发系统
      dispatchSystem: 'platform',
    };
  }

  // 策略调度子单
  if (type === 'strategy') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '昌吉-异网主卡客户策略执行',
      // 调度内容：策略列表（仅本省相关）
      strategyList: [
        { id: 1, indicator: '一降到底规模', riskGroup: '异网主卡客户', strategy: '对异网主卡有流量客群，基于前期客户消费值，推进对应套餐或包，并进行折扣迎回' },
        { id: 2, indicator: '一降到底规模', riskGroup: '零融合客户', strategy: '针对零融合客户，推广融合套餐，提供家庭宽带、IPTV等增值服务' },
        { id: 3, indicator: '离网率', riskGroup: '高价值客户', strategy: '对高价值离网倾向客户，提供专属优惠套餐进行挽留' },
      ],
      // 关联指标列表（去重后，含账期、环比、同比、位置路径，无目标值）
      dispatchIndicators: [
        { 
          id: 1,
          name: '一降到底规模', 
          period: '月',
          accountPeriod: '2025-11',
          value: '12,580户',
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
          mom: '+0.15pp',
          momTrend: 'up' as const,
          yoy: '-0.3pp',
          yoyTrend: 'down' as const,
          locationPath: '市场数智运营 > 存量运营 > 离网维系 > 离网率（指标树）'
        },
      ],
      // 预警信息
      alertList: [
        { indicator: '离网预警客户数量', level: '二级预警', value: '8,500户' },
      ],
      // 客户清单信息
      customerListInfo: {
        fileName: '异网主卡客户_昌吉_20251215.xlsx',
        filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\策略调度\\异网主卡客户迎回策略执行\\',
      },
      executionStats: {
        targetName: '策略匹配客群',
        targetScale: '4,410',
        completedCount: '2,079',
        completionRate: '47.1%',
      },
      // IOP执行结果分布
      executionResultDistribution: {
        success: 2079,
        failed: 856,
        timeout: 445,
      },
      // 派发系统
      dispatchSystem: 'IOP',
      // IOP不返回客户级明细，只有聚合统计（ExecutionStats已展示）
      executionDetailList: [],
    };
  }

  // 客群调度子单
  if (type === 'customer-group') {
  return {
    ...baseData,
    subTicketTitle: paramTitle || '昌吉-异网主卡客群维系执行',
    // 调度内容：客群信息
    customerGroup: {
      name: '异网主卡客户',
      scale: '85.2万',
      tagFilters: [
        { name: '是否转低消保号', value: '是' },
        { name: '异网宽带用户', value: '是' },
        { name: '当月流量', value: '1-5GB' },
      ],
    },
    // 调度指标列表（含账期、环比、同比、位置路径，无目标值）
    dispatchIndicators: [
      { 
        id: 1,
        name: '当月全量离网客户数', 
        period: '月',
        accountPeriod: '2025-11',
        value: '13,200户',
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
        mom: '+0.5pp',
        momTrend: 'up' as const,
        yoy: '-1.2pp',
        yoyTrend: 'down' as const,
        locationPath: '市场数智运营 > 存量运营 > 离网维系 > 欠费销号离网率（指标树）'
      },
    ],
    // 客户清单信息
    customerListInfo: {
      fileName: '异网主卡客户_昌吉_20251215.xlsx',
      filePath: '\\\\文件服务器\\调度中心\\客户清单\\2025年12月\\客群调度\\高价值离网客群维系调度\\',
    },
    executionStats: {
      targetName: '异网主卡客户',
      targetScale: '4,200',
      completedCount: '1,800',
      completionRate: '42.9%',
    },
    // IOP执行结果分布
    executionResultDistribution: {
      success: 1800,
      failed: 620,
      timeout: 380,
    },
    // 派发系统：客群调度派至网格通，有客户级执行记录
    dispatchSystem: 'wanggetong',
    // 客群调度走网格通，有客户级执行明细
    executionDetailList: [
      { id: 1, executionCustomer: '991*********8801', isCall: '是', callResult: '呼通', callDuration: '3分25秒', registeredStatus: '成功', executor: '昌吉运营专员', executionTime: '2025-12-17 09:00', executionStatus: '已完成', executionResult: '成功' },
      { id: 2, executionCustomer: '991*********7712', isCall: '是', callResult: '呼通', callDuration: '1分48秒', registeredStatus: '用户犹豫', executor: '昌吉运营专员', executionTime: '2025-12-17 09:30', executionStatus: '已完成', executionResult: '用户犹豫' },
      { id: 3, executionCustomer: '991*********6623', isCall: '是', callResult: '呼通', callDuration: '5分12秒', registeredStatus: '成功', executor: '昌吉运营专员', executionTime: '2025-12-17 10:00', executionStatus: '已完成', executionResult: '成功' },
      { id: 4, executionCustomer: '991*********5534', isCall: '是', callResult: '未呼通', callDuration: '-', registeredStatus: '未呼通', executor: '昌吉运营专员', executionTime: '2025-12-17 14:00', executionStatus: '已完成', executionResult: '未呼通' },
      { id: 5, executionCustomer: '991*********4445', isCall: '是', callResult: '呼通', callDuration: '0分45秒', registeredStatus: '用户拒绝', executor: '昌吉运营专员', executionTime: '2025-12-17 14:30', executionStatus: '已完成', executionResult: '用户拒绝' },
      { id: 6, executionCustomer: '991*********3356', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
      { id: 7, executionCustomer: '991*********2267', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
    ],
    // 登记状态分布（网格通6.2.2 registeredStatus汇总）
    registeredStatusDistribution: {
      success: 856,
      notReached: 620,
      hesitating: 445,
      rejected: 380,
    },
    // 流转信息（网格通）
    transferInfo: [
      { step: '环节1', handler: '调度中心', action: '派发至网格', startTime: '2025-12-16 18:20:05', endTime: '2025-12-16 18:20:10', duration: '00分钟05秒', result: '已派发' },
      { step: '环节2', handler: '昌吉运营专员', action: '接收工单', startTime: '2025-12-16 18:20:10', endTime: '2025-12-16 18:20:15', duration: '00分钟05秒', result: '已接收' },
      { step: '环节3', handler: '昌吉运营专员', action: '客群维系执行', startTime: '2025-12-17 09:00:00', endTime: '-', duration: '-', result: '-' },
    ],
  };
  }

  // 客户商机调度子单（按网格拆单，每条子工单对应一个网格，包含该网格下所有客户）
  if (type === 'customer-opportunity-dispatch') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '5G终端低迁移客户调度-天山区南塔网格',
      businessType: '商机类/客户商机调度',
      region: '乌鲁木齐 > 天山区 > 南塔网格',
      executor: '张三（南塔网格）',
      department: '乌鲁木齐分公司天山区营销中心',
      // 关联商机信息
      relatedOpportunity: {
        id: 'COD-0002',
        type: '客户商机调度',
        category: '5G终端低迁移客户调度-第2期',
        source: '流量运营',
      },
      // 商机来源统计（本网格下）
      opportunitySourceStats: [
        { type: '5G终端低迁移', count: 12 },
        { type: '流量达量预警', count: 4 },
        { type: '套餐升级机会', count: 2 },
      ],
      // 子单网格信息
      gridName: '南塔网格',
      gridExecutor: '张三',
      customerCount: 18,
      completionRate: '67%',
      // 执行明细（客户商机调度走网格通，基于6.2.2字段）
      executionDetailList: [
        { id: 1, executionCustomer: '991*********3222', isCall: '是', callResult: '呼通', callDuration: '2分15秒', registeredStatus: '成功', executor: '张三', executionTime: '2025-12-17 10:30', executionStatus: '已完成', executionResult: '成功' },
        { id: 2, executionCustomer: '991*********4518', isCall: '是', callResult: '呼通', callDuration: '3分40秒', registeredStatus: '成功', executor: '张三', executionTime: '2025-12-17 11:00', executionStatus: '已完成', executionResult: '成功' },
        { id: 3, executionCustomer: '991*********7834', isCall: '是', callResult: '呼通', callDuration: '1分20秒', registeredStatus: '用户犹豫', executor: '张三', executionTime: '2025-12-17 09:00', executionStatus: '已完成', executionResult: '用户犹豫' },
        { id: 4, executionCustomer: '991*********7834', isCall: '是', callResult: '未呼通', callDuration: '-', registeredStatus: '未呼通', executor: '张三', executionTime: '2025-12-18 09:30', executionStatus: '已完成', executionResult: '未呼通' },
        { id: 5, executionCustomer: '991*********1256', isCall: '是', callResult: '呼通', callDuration: '0分55秒', registeredStatus: '用户拒绝', executor: '张三', executionTime: '2025-12-17 15:00', executionStatus: '已完成', executionResult: '用户拒绝' },
        { id: 6, executionCustomer: '991*********9043', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 7, executionCustomer: '991*********5672', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 8, executionCustomer: '991*********3401', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
      ],
      // 执行统计
      executionStats: {
        targetName: '5G终端低迁移客户调度-南塔网格',
        targetScale: '18',
        completedCount: '5',
        completionRate: '27.8%',
      },
      // 登记状态分布（网格通6.2.2 registeredStatus汇总）
      registeredStatusDistribution: {
        success: 3,
        notReached: 4,
        hesitating: 2,
        rejected: 2,
      },
      // 派发系统
      dispatchSystem: 'wanggetong',
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '调度中心', action: '派发至网格', startTime: '2025-12-16 10:00:05', endTime: '2025-12-16 10:00:10', duration: '00分钟05秒', result: '已派发' },
        { step: '环节2', handler: '张三（南塔网格）', action: '接收工单', startTime: '2025-12-16 10:00:10', endTime: '2025-12-16 10:00:15', duration: '00分钟05秒', result: '已接收' },
        { step: '环节3', handler: '张三（南塔网格）', action: '客户触达执行', startTime: '2025-12-17 10:30:00', endTime: '-', duration: '-', result: '-' },
      ],
    };
  }

  // 客群商机调度子单（按网格拆单，每条子工单对应一个网格）
  if (type === 'group-opportunity-dispatch') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '高价值离网客群维系-沙依巴克区友好路网格',
      businessType: '商机类/客群商机调度',
      region: '乌鲁木齐 > 沙依巴克区 > 友好路网格',
      executor: '王五（友好路网格）',
      department: '乌鲁木齐分公司沙依巴克区营销中心',
      // 子单网格信息
      gridName: '友好路网格',
      gridExecutor: '王五',
      customerCount: 480,
      completionRate: '75%',
      // 关联商机信息
      relatedOpportunity: {
        id: 'GRP-0001',
        type: '客群商机',
        category: '风险预警类 > 高价值离网预警',
        source: '离网维系',
      },
      // 客群信息
      customerGroup: {
        name: '高价值离网倾向客群-友好路网格',
        scale: '480',
        tagFilters: [
          { name: '是否转低消保号', value: '是' },
          { name: '异网宽带用户', value: '否' },
          { name: '月均消费', value: '100元以上' },
        ],
      },
      // 执行策略
      executionStrategy: '外呼维系 + 线下拜访',
      // 执行明细（客群商机调度走网格通，基于6.2.2字段）
      executionDetailList: [
        { id: 1, executionCustomer: '991*********3210', isCall: '是', callResult: '呼通', callDuration: '4分10秒', registeredStatus: '用户犹豫', executor: '王五', executionTime: '2025-12-17 10:00', executionStatus: '已完成', executionResult: '用户犹豫' },
        { id: 2, executionCustomer: '991*********3210', isCall: '是', callResult: '呼通', callDuration: '6分30秒', registeredStatus: '成功', executor: '王五', executionTime: '2025-12-20 10:00', executionStatus: '已完成', executionResult: '成功' },
        { id: 3, executionCustomer: '991*********6543', isCall: '是', callResult: '呼通', callDuration: '2分45秒', registeredStatus: '成功', executor: '王五', executionTime: '2025-12-17 14:30', executionStatus: '已完成', executionResult: '成功' },
        { id: 4, executionCustomer: '991*********9876', isCall: '是', callResult: '未呼通', callDuration: '-', registeredStatus: '未呼通', executor: '王五', executionTime: '2025-12-18 09:15', executionStatus: '已完成', executionResult: '未呼通' },
        { id: 5, executionCustomer: '991*********9876', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 6, executionCustomer: '991*********2468', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 7, executionCustomer: '991*********1357', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
      ],
      // 效果评估
      executionStats: {
        targetName: '高价值离网倾向客群-友好路网格',
        targetScale: '480',
        completedCount: '360',
        completionRate: '75.0%',
      },
      // 登记状态分布（网格通6.2.2 registeredStatus汇总）
      registeredStatusDistribution: {
        success: 105,
        notReached: 180,
        hesitating: 95,
        rejected: 100,
      },
      // 派发系统
      dispatchSystem: 'wanggetong',
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '调度中心', action: '派发至网格', startTime: '2025-12-16 10:00:05', endTime: '2025-12-16 10:00:10', duration: '00分钟05秒', result: '已派发' },
        { step: '环节2', handler: '王五（友好路网格）', action: '接收工单', startTime: '2025-12-16 10:00:10', endTime: '2025-12-16 10:00:15', duration: '00分钟05秒', result: '已接收' },
        { step: '环节3', handler: '王五（友好路网格）', action: '客群维系执行', startTime: '2025-12-17 10:00:00', endTime: '-', duration: '-', result: '-' },
      ],
    };
  }

  // 区域攻坚调度子单（按网格拆单，每条子工单对应一个网格的AOI区域）
  if (type === 'region-assault') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '天山区流量攻坚-大巴扎网格',
      businessType: '生产类/区域攻坚调度',
      region: '乌鲁木齐 > 天山区 > 大巴扎网格',
      executor: '赵六（大巴扎网格）',
      department: '乌鲁木齐分公司天山区营销中心',
      // 子单网格信息
      gridName: '大巴扎网格',
      gridExecutor: '赵六',
      customerCount: 980,
      completionRate: '42%',
      // 关联攻坚信息
      relatedOpportunity: {
        id: 'RAS-0001',
        type: '区域攻坚',
        category: '流量攻坚',
        source: '区域攻坚',
      },
      // 攻坚区域信息
      assaultRegion: {
        name: '天山区5个AOI',
        aoiCount: 3,
        communityCount: 2,
        targetCustomers: 980,
      },
      // 执行策略
      executionStrategy: '流量套餐升档 + 竞对抢夺',
      // 执行明细（统一列表，区域攻坚基于网格通6.2.2字段）
      executionDetailList: [
        { id: 1, executionCustomer: '991*********8801', typeLabel: '', recommendedProduct: '', isCall: '是', callResult: '呼通', callDuration: '3分25秒', registeredStatus: '成功', executor: '赵六', executionTime: '2025-12-17 09:00', executionStatus: '已完成', executionResult: '成功' },
        { id: 2, executionCustomer: '991*********7712', typeLabel: '', recommendedProduct: '', isCall: '是', callResult: '呼通', callDuration: '1分48秒', registeredStatus: '用户犹豫', executor: '赵六', executionTime: '2025-12-17 09:30', executionStatus: '已完成', executionResult: '用户犹豫' },
        { id: 3, executionCustomer: '991*********6623', typeLabel: '', recommendedProduct: '', isCall: '是', callResult: '呼通', callDuration: '5分12秒', registeredStatus: '成功', executor: '赵六', executionTime: '2025-12-17 10:00', executionStatus: '已完成', executionResult: '成功' },
        { id: 4, executionCustomer: '991*********5534', typeLabel: '', recommendedProduct: '', isCall: '是', callResult: '未呼通', callDuration: '-', registeredStatus: '未呼通', executor: '赵六', executionTime: '2025-12-17 14:00', executionStatus: '已完成', executionResult: '未呼通' },
        { id: 5, executionCustomer: '991*********4445', typeLabel: '', recommendedProduct: '', isCall: '是', callResult: '呼通', callDuration: '0分45秒', registeredStatus: '用户拒绝', executor: '赵六', executionTime: '2025-12-17 14:30', executionStatus: '已完成', executionResult: '用户拒绝' },
        { id: 6, executionCustomer: '991*********3356', typeLabel: '', recommendedProduct: '', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 7, executionCustomer: '991*********2267', typeLabel: '', recommendedProduct: '', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
        { id: 8, executionCustomer: '991*********1178', typeLabel: '', recommendedProduct: '', isCall: '否', callResult: '-', callDuration: '-', registeredStatus: '-', executor: '-', executionTime: '-', executionStatus: '待执行', executionResult: '-' },
      ],
      // 执行统计
      executionStats: {
        targetName: '大巴扎网格-流量攻坚',
        targetScale: '980',
        completedCount: '413',
        completionRate: '42.1%',
      },
      // 登记状态分布（网格通6.2.2 registeredStatus汇总）
      registeredStatusDistribution: {
        success: 187,
        notReached: 365,
        hesitating: 156,
        rejected: 272,
      },
      // 派发系统
      dispatchSystem: 'wanggetong',
      // 流转信息
      transferInfo: [
        { step: '环节1', handler: '调度中心', action: '派发至网格', startTime: '2025-12-16 11:00:05', endTime: '2025-12-16 11:00:10', duration: '00分钟05秒', result: '已派发' },
        { step: '环节2', handler: '赵六（大巴扎网格）', action: '接收工单', startTime: '2025-12-16 11:00:10', endTime: '2025-12-16 11:00:15', duration: '00分钟05秒', result: '已接收' },
        { step: '环节3', handler: '赵六（大巴扎网格）', action: '攻坚执行中', startTime: '2025-12-17 09:00:00', endTime: '-', duration: '-', result: '-' },
      ],
    };
  }

  // 保有任务调度子单（按地市拆单，IOP执行，无客户级明细）
  if (type === 'retention-task') {
    return {
      ...baseData,
      subTicketTitle: paramTitle || '乌鲁木齐-携转预警保有维系',
      businessType: '生产类/保有任务调度',
      region: '乌鲁木齐',
      phone: '',  // 客群级，无客户号码
      executionCustomer: '',  // 客群级，无客户号码
      executor: '乌鲁木齐分公司-张三',
      department: '乌鲁木齐分公司市场部',
      // 客群信息
      customerGroupInfo: {
        name: '携转预警高价值客群',
        groupId: 'CG-2026-00712',
        customerScale: '12,350',
        filterCondition: 'ARPU>80 且 携转倾向=高 且 在网时长>12月',
      },
      // 执行统计（客群级）
      executionStats: {
        targetName: '携转预警高价值客群-乌鲁木齐',
        targetScale: '3,280',
        completedCount: '2,156',
        completionRate: '65.7%',
      },
      // IOP执行结果分布（IOP只返回聚合统计，无客户级明细）
      iopResultDistribution: {
        success: 1856,
        failed: 213,
        timeout: 87,
      },
      // 客户清单文件
      customerFile: {
        fileName: '携转预警客群_乌鲁木齐_20260712.xlsx',
        filePath: '/files/retention/CG-2026-00712-001.xlsx',
      },
      // 派发系统
      dispatchSystem: 'iop',
      // IOP无客户级执行明细
      executionDetailList: [],
      // 流转信息（4节点：派发→接收→IOP处理→效果回传）
      transferInfo: [
        { step: '环节1', handler: '调度中心', action: '派发至地市分公司', startTime: '2026-07-12 09:16:00', endTime: '2026-07-12 09:16:05', duration: '00分钟05秒', result: '已派发' },
        { step: '环节2', handler: '乌鲁木齐分公司-张三', action: '接收工单', startTime: '2026-07-12 09:20:00', endTime: '2026-07-12 09:20:10', duration: '00分钟10秒', result: '已接收' },
        { step: '环节3', handler: 'IOP平台', action: '外部系统处理', startTime: '2026-07-12 09:21:00', endTime: '2026-07-12 14:00:00', duration: '4时39分', result: '处理完成' },
        { step: '环节4', handler: 'IOP平台接口', action: '回传效果数据', startTime: '2026-07-12 14:00:00', endTime: '2026-07-12 14:01:05', duration: '01分钟05秒', result: '回传成功' },
      ],
    };
  }

  return baseData;
}

// 将mock执行明细数据映射为FlowExecutionDetail组件所需的格式（仅网格通有客户级明细）
function mapExecutionDetailData(rawData: any[]): any[] {
  return rawData.map(item => ({
    customerName: item.executionCustomer || '-',
    phone: item.executionCustomer || '-',
    isCall: item.isCall || '-',
    callResult: item.callResult || '-',
    callDuration: item.callDuration || '-',
    registeredStatus: item.registeredStatus || '-',
    executionTime: item.executionTime || '-',
  }));
}

function SubTicketDetailContent() {
  const searchParams = useSearchParams();
  
  // 从URL参数读取子单信息
  const paramId = searchParams.get('id') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramType = (searchParams.get('type') as WorkOrderType) || 'indicator';
  const fromPage = searchParams.get('from') || '';
  const mode = (searchParams.get('mode') as 'view' | 'process') || 'view';
  const fromPath = searchParams.get('fromPath') || '';

  // 计算调度分类: customer=客户商机调度, group=客群商机调度, assault=区域攻坚调度, retention=保有任务调度
  const dispatchType = paramType === 'customer-opportunity-dispatch' ? 'customer' 
    : paramType === 'group-opportunity-dispatch' ? 'group' 
    : paramType === 'region-assault' ? 'assault' 
    : paramType === 'retention-task' ? 'retention' : '';

  // dispatchSystem计算移至subTicketData声明之后

  const router = useRouter();
  const { removeTab, tabs, activeTab } = useTabs();

  // 根据来源页面计算业务场景
  const currentBusinessScenario = fromPage && fromPage.startsWith('business-') 
    ? (businessScenarioMap[fromPage] || '离网维系') 
    : '离网维系';

  // 根据类型获取子单数据
  const subTicketData = useMemo(() => {
    return getSubTicketDataByType(paramType, paramId, paramTitle, currentBusinessScenario);
  }, [paramType, paramId, paramTitle, currentBusinessScenario]);

  // 根据 dispatchSystem 判断派发系统类型
  const rawDispatchSystem = (subTicketData as any)?.dispatchSystem;
  const dispatchSystemLabel = rawDispatchSystem === 'wanggetong' ? '网格通' 
    : rawDispatchSystem === 'iop' ? 'IOP' : undefined;
  const dispatchSystem: DispatchSystem = resolveDispatchSystem(
    paramType, 
    dispatchSystemLabel
  );

  const handleBack = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab && activeTab) {
      removeTab(activeTab);
    }
    // 优先使用fromPath，否则回退到工单详情页
    if (fromPath) {
      router.push(fromPath);
    } else {
      router.push('/workspace/ticket-detail');
    }
  };

  const handleSubmit = () => {
    // TODO: 提交处理逻辑，校验+确认+提交
    alert('提交成功！工单将流转到下一环节。');
    handleBack();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 顶部标题栏 */}
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">子单详情</h1>
            <p className="text-sm text-gray-500 mt-1">子单编号：{subTicketData.subTicketId}</p>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">基本信息</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">子单编号</p>
            <p className="text-sm font-medium">{subTicketData.subTicketId || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">主工单编号</p>
            <p className="text-sm font-medium">{subTicketData.ticketId || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">子单标题</p>
            <p className="text-sm font-medium">{subTicketData.subTicketTitle || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">工单类型</p>
            <p className="text-sm font-medium">{subTicketData.ticketType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">业务类型</p>
            <p className="text-sm font-medium">{subTicketData.businessType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">业务场景</p>
            <p className="text-sm font-medium">{subTicketData.businessScenario}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">所属区域</p>
            <p className="text-sm font-medium">{subTicketData.region}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">要求完成时间</p>
            <p className="text-sm font-medium">{subTicketData.requiredCompleteTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">提出人</p>
            <p className="text-sm font-medium">{subTicketData.submitter}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">提交时间</p>
            <p className="text-sm font-medium">{subTicketData.submitTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">来源系统</p>
            <p className="text-sm font-medium">{subTicketData.sourceSystem}</p>
          </div>
          {paramType === 'customer-opportunity-dispatch' && (
            <div>
              <p className="text-sm text-gray-500 mb-1">执行客户</p>
              <p className="text-sm font-medium font-mono">{subTicketData.executionCustomer || '-'}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 调度内容 - 根据类型显示不同内容 */}
      {paramType === 'indicator' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">调度内容</h2>
          </div>
          
          {/* 账期选择 */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">账期选择</p>
            <div className="flex items-center gap-6 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">日指标账期</p>
                <p className="text-sm font-medium">{(subTicketData as any).accountPeriod?.dayIndicator}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">月指标账期</p>
                <p className="text-sm font-medium">{(subTicketData as any).accountPeriod?.monthIndicator}</p>
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
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subTicketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
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
        </Card>
      )}

      {paramType === 'strategy' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">调度内容</h2>
          </div>
          
          {/* 策略列表（本省相关） */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">策略列表（本地州相关）</h3>
          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">序号</TableHead>
                  <TableHead className="w-32">关联指标</TableHead>
                  <TableHead className="w-28">风险客群</TableHead>
                  <TableHead>策略描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subTicketData as any).strategyList?.map((strategy: any) => (
                  <TableRow key={strategy.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{strategy.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{strategy.indicator}</TableCell>
                    <TableCell>{strategy.riskGroup}</TableCell>
                    <TableCell className="max-w-xs">{strategy.strategy}</TableCell>
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
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subTicketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
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
          
          {/* 客户清单信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">客户清单信息</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">客户清单文件名</p>
                <p className="text-sm font-medium">{(subTicketData as any).customerListInfo?.fileName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">文件路径</p>
                <p className="text-sm font-medium font-mono break-all">{(subTicketData as any).customerListInfo?.filePath}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ 说明：客户清单包含敏感信息，通过独立安全通道下发。请按上述路径在指定位置获取文件。
          </p>
        </Card>
      )}

      {paramType === 'customer-group' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold">调度内容</h2>
          </div>
          
          {/* 客群信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">客群信息</h3>
          <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">客群名称</p>
              <p className="text-sm font-medium">{(subTicketData as any).customerGroup?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">客群规模</p>
              <p className="text-sm font-medium">{(subTicketData as any).customerGroup?.scale}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">圈选标签</p>
              <p className="text-sm font-medium">
                {(subTicketData as any).customerGroup?.tagFilters?.map((tag: any) => `${tag.name}(${tag.value})`).join('、')}
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
                  <TableHead className="w-20 text-right">环比</TableHead>
                  <TableHead className="w-20 text-right">同比</TableHead>
                  <TableHead>位置路径</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subTicketData as any).dispatchIndicators?.map((indicator: any, index: number) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{indicator.name}</TableCell>
                    <TableCell className="text-center">{indicator.period}</TableCell>
                    <TableCell className="text-center">{indicator.accountPeriod}</TableCell>
                    <TableCell className="text-right">{indicator.value}</TableCell>
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
          
          {/* 客户清单信息 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">客户清单信息</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">客户清单文件名</p>
                <p className="text-sm font-medium">{(subTicketData as any).customerListInfo?.fileName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">文件路径</p>
                <p className="text-sm font-medium font-mono break-all">{(subTicketData as any).customerListInfo?.filePath}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ 说明：客户清单包含敏感信息，通过独立安全通道下发。请按上述路径在指定位置获取文件。
          </p>
        </Card>
      )}

      {/* 商机调度/区域攻坚子单 - 统一区块，客户商机调度 + 客群商机调度 + 区域攻坚调度共享 */}
      {(paramType === 'customer-opportunity-dispatch' || paramType === 'group-opportunity-dispatch' || paramType === 'region-assault') && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {paramType === 'customer-opportunity-dispatch' ? (
              <Target className="h-5 w-5 text-green-600" />
            ) : paramType === 'group-opportunity-dispatch' ? (
              <FileText className="h-5 w-5 text-teal-600" />
            ) : (
              <Crosshair className="h-5 w-5 text-red-600" />
            )}
            <h2 className="text-lg font-semibold">子单调度内容</h2>
          </div>

          {/* 子单执行信息 - 统一组件 */}
          <h3 className="text-sm font-semibold text-gray-700 mb-3">子单信息</h3>
          <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">所属网格</p>
              <p className="text-sm font-medium">{(subTicketData as any).gridName || (subTicketData as any).region?.split('>').pop()?.trim() || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">网格执行人</p>
              <p className="text-sm font-medium">{(subTicketData as any).gridExecutor || (subTicketData as any).executor?.replace(/（.*?）/, '') || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">客户数量</p>
              <p className="text-sm font-medium">{(subTicketData as any).customerCount || (subTicketData as any).customerGroup?.scale || 0}户</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">完成率</p>
              <p className="text-sm font-medium">{(subTicketData as any).completionRate || '—'}</p>
            </div>
          </div>

          {/* 关联商机信息 - 条件渲染 */}
          {paramType === 'customer-opportunity-dispatch' && (subTicketData as any).opportunitySourceStats && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">商机来源统计（本网格下）</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {((subTicketData as any).opportunitySourceStats || []).map((stat: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.type}</span>
                    <span className="text-sm font-semibold">{stat.count}户</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {paramType === 'group-opportunity-dispatch' && (subTicketData as any).customerGroup && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">客群信息</h3>
              <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">客群名称</p>
                  <p className="text-sm font-medium">{(subTicketData as any).customerGroup?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">客群规模</p>
                  <p className="text-sm font-medium">{(subTicketData as any).customerGroup?.scale}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">圈选标签</p>
                  <p className="text-sm font-medium">
                    {(subTicketData as any).customerGroup?.tagFilters?.map((tag: any) => `${tag.name}(${tag.value})`).join('、')}
                  </p>
                </div>
              </div>
              {(subTicketData as any).executionStrategy && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">执行策略</p>
                  <p className="text-sm font-medium">{(subTicketData as any).executionStrategy}</p>
                </div>
              )}
            </>
          )}

          {paramType === 'region-assault' && (subTicketData as any).assaultRegion && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">攻坚区域信息</h3>
              <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">圈选区域</p>
                  <p className="text-sm font-medium">{(subTicketData as any).assaultRegion?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">AOI数量</p>
                  <p className="text-sm font-medium">{(subTicketData as any).assaultRegion?.aoiCount}个</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">覆盖小区</p>
                  <p className="text-sm font-medium">{(subTicketData as any).assaultRegion?.communityCount}个</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">目标客户</p>
                  <p className="text-sm font-medium">{(subTicketData as any).assaultRegion?.targetCustomers}户</p>
                </div>
              </div>
              {(subTicketData as any).executionStrategy && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">攻坚策略</p>
                  <p className="text-sm font-medium">{(subTicketData as any).executionStrategy}</p>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* 扩展信息 - 预警信息列表（商机调度类型无预警） */}
      {!['customer-opportunity-dispatch', 'group-opportunity-dispatch', 'region-assault'].includes(paramType) && (
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold">扩展信息</h2>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-700 mb-3">预警信息</h3>
        {(subTicketData as any).alertList && (subTicketData as any).alertList.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>预警指标</TableHead>
                  <TableHead>预警等级</TableHead>
                  <TableHead>预警值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subTicketData as any).alertList?.map((alert: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{alert.indicator}</TableCell>
                    <TableCell>{alert.level}</TableCell>
                    <TableCell>{alert.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">暂无预警信息</p>
        )}
      </Card>
      )}

      {/* 执行统计 + 执行记录（仅生产类调度显示） */}
      {paramType !== 'indicator' && (
        <>
          {/* 执行统计 */}
          <ExecutionStats
            data={{
              targetCustomerCount: parseInt(String((subTicketData as any).executionStats?.targetScale?.replace(/,/g, '') || '0')) || 0,
              reachedCustomerCount: (subTicketData as any).executionStats?.reachedCount || parseInt(String((subTicketData as any).executionStats?.targetScale?.replace(/,/g, '') || '0')) || 0,
              successCustomerCount: (subTicketData as any).executionStats?.successCount || 0,
              reachRate: (subTicketData as any).executionStats?.reachRate || 0,
              marketingSuccessRate: (subTicketData as any).executionStats?.successRate || 0,
            }}
          />

          {/* 保有任务调度：IOP执行结果分布（IOP只返回聚合统计，无客户级明细） */}
          {paramType === 'retention-task' && (subTicketData as any).iopResultDistribution && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold">IOP执行结果分布</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{(subTicketData as any).iopResultDistribution.success}</div>
                  <div className="text-sm text-gray-500 mt-1">成功数</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{(subTicketData as any).iopResultDistribution.failed}</div>
                  <div className="text-sm text-gray-500 mt-1">失败数</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{(subTicketData as any).iopResultDistribution.timeout}</div>
                  <div className="text-sm text-gray-500 mt-1">超时数</div>
                </div>
              </div>
            </Card>
          )}

          {/* 执行记录（客户级执行明细，仅网格通有明细） */}
          {paramType !== 'retention-task' && (subTicketData as any).executionDetailList && (subTicketData as any).executionDetailList.length > 0 && (
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold">执行记录</h2>
              </div>
              <FlowExecutionDetail
                data={mapExecutionDetailData((subTicketData as any).executionDetailList || [])}
              />
            </Card>
          )}
        </>
      )}

      {/* 节点信息 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">节点信息</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">执行人</p>
            <p className="text-sm font-medium">{subTicketData.executor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">所属部门</p>
            <p className="text-sm font-medium">{subTicketData.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">子单状态</p>
            <Badge variant="secondary" className="text-xs">{subTicketData.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">处理结果</p>
            <p className="text-sm font-medium">{subTicketData.processResult}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">超时状态</p>
            <Badge variant="outline" className="text-xs">{subTicketData.timeoutStatus}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">创建时间</p>
            <p className="text-sm font-medium">{subTicketData.createTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">完成时间</p>
            <p className="text-sm font-medium">{subTicketData.completeTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">更新时间</p>
            <p className="text-sm font-medium">{subTicketData.updateTime}</p>
          </div>
        </div>
      </Card>

      {/* 流转信息 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">流转信息</h2>
        </div>
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
            {subTicketData.transferInfo.map((info: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{info.step}</Badge>
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
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-center gap-4">
        {mode === 'process' && (
          <Button variant="default" className="w-32" onClick={handleSubmit}>
            提交
          </Button>
        )}
        <Button variant="outline" className="w-32" onClick={handleBack}>
          关闭
        </Button>
      </div>

      {/* 为底部按钮留出空间 */}
      <div className="h-20"></div>
    </div>
  );
}

export default function SubTicketDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SubTicketDetailContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
