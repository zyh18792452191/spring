'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Check, ChevronRight, Download, Info, List } from 'lucide-react';
import * as XLSX from 'xlsx';
import { provinces } from '@/data/provinces';

const xinjiangRegion = provinces.find(p => p.code === '650000')!;

// ==================== 常量 & 类型 ====================

type TicketType = 'IND' | 'STR' | 'CG-OP' | 'COD' | 'GOD' | 'RAS';
type SubStatus = 'pending' | 'completed' | 'cancelled';

/** 子单数据（策略分析的原子数据单元） */
interface StrategySubTicket {
  subTicketId: string;
  parentTicketId: string;         // 所属主工单ID
  ticketType: TicketType;
  strategyId: string;
  strategySource: 'AI推荐' | '人工创建';
  dispatcher: string;              // 派单方区域编码
  receiver: string;                // 接单方区域编码
  status: SubStatus;
  isSplit: boolean;                // 是否被二次拆单（true=中间子单，false=叶子子单）
  targetCustomerCount: number;
  reachedCustomerCount: number;
  marketingSuccessCount: number;
  scenarioIds: string[];
  warningIndicatorIds: string[];
  problemSubIndicatorIds: string[];
  groupIds: string[];
  createdAt: string;               // '2026-06' 格式
}

/** 表格行数据 */
interface RowData {
  regionCode: string;
  regionName: string;
  statMonth: string;
  canDrillDown: boolean;
  statTime: string;
  // 当月指标
  monthDispatched: number;      // 策略派发数量（主工单计数）
  monthCompleted: number;       // 已完成数量（主工单计数）
  monthCompletionRate: number;  // 完成率
  monthTarget: number;          // 目标客户量（叶子子单汇总）
  monthReached: number;         // 触达客户数（叶子子单汇总）
  monthSuccess: number;         // 营销成功量（叶子子单汇总）
  monthReachRate: number;       // 触达率
  monthSuccessRate: number;     // 成功率
  monthAiRecommend: number;     // AI推荐策略数
  monthAiAdoptionRate: number;  // AI推荐采纳率
  monthScenarioCount: number;   // 业务场景数量
  monthWarningCount: number;    // 预警指标数量
  monthProblemCount: number;    // 问题子指标数量
  monthGroupCount: number;      // 潜在客群数量
  // 累计指标
  cumDispatched: number;
  cumCompleted: number;
  cumCompletionRate: number;
  cumTarget: number;
  cumReached: number;
  cumSuccess: number;
  cumReachRate: number;
  cumSuccessRate: number;
  cumAiRecommend: number;
  cumAiAdoptionRate: number;
  cumScenarioCount: number;
  cumWarningCount: number;
  cumProblemCount: number;
  cumGroupCount: number;
}

interface DrillLevel {
  level: number;
  regionCode: string;
  regionName: string;
}

// ==================== 指标元数据 ====================

const ALL_COL_KEYS = [
  'dispatched', 'completed', 'completionRate',
  'target', 'reached', 'success', 'reachRate', 'successRate',
  'aiRecommend', 'aiAdoptionRate',
  'scenarioCount', 'warningCount', 'problemCount', 'groupCount',
] as const;

const RATE_COLS = ['completionRate', 'reachRate', 'successRate', 'aiAdoptionRate'] as const;

interface MetricMeta {
  label: string;
  caliber: string; fullCaliber: string;
  formula: string; fullFormula: string;
  source: string; fullSource: string;
  note: string; fullNote: string;
}

const STRATEGY_METRICS: Record<string, MetricMeta> = {
  dispatched: {
    label: '策略派发数量', caliber: '本区域作为派单方发出的、关联了策略的主工单数', fullCaliber: '本区域及所有下级区域作为派单方发出的、关联了策略的主工单数（递归汇总）',
    formula: '主工单数，条件：派单方=当前区域 且 已关联策略 且 工单类型≠指标调度', fullFormula: '本级策略派发数量 + 各直接下级全口径策略派发数量之和',
    source: '工单主表，筛选已关联策略且非指标调度的工单', fullSource: '工单主表，按组织树递归汇总',
    note: '行为量指标，按主工单计数，1次策略派发决策=1条主工单，不按子单计数', fullNote: '行为量指标，全口径按主工单递归汇总，不是子单汇总',
  },
  completed: {
    label: '已完成数量', caliber: '所有子单均已执行完成的主工单数', fullCaliber: '本区域及下级区域所有子单均已执行完成的主工单数（递归汇总）',
    formula: '主工单数，条件：工单状态=已完成', fullFormula: '本级已完成数量 + 各直接下级全口径已完成数量之和',
    source: '工单主表工单状态字段', fullSource: '工单主表，按组织树递归汇总',
    note: '主工单的所有子单均完成才算已完成', fullNote: '行为量指标，全口径按主工单递归汇总',
  },
  completionRate: {
    label: '完成率', caliber: '已完成主工单占策略派发数量的比例', fullCaliber: '全口径已完成主工单占全口径策略派发数量的比例',
    formula: '已完成数量 ÷ 策略派发数量 × 100%', fullFormula: '全口径已完成数量 ÷ 全口径策略派发数量 × 100%',
    source: '派生指标，由已完成数量和策略派发数量计算', fullSource: '全口径分子分母同口径计算',
    note: '策略派发数量 − 已完成数量 = 执行中数量', fullNote: '分子分母必须同口径，不可跨口径',
  },
  target: {
    label: '目标客户量', caliber: '策略工单覆盖的目标客户总量', fullCaliber: '本区域及下级组织树下所有叶子子单的目标客户量之和（不重复计数）',
    formula: '目标客户量之和，条件：子单未被二次拆分（即叶子子单）', fullFormula: '组织树下所有叶子子单（未被二次拆分的子单）的目标客户量之和',
    source: '工单子单表目标客户量字段', fullSource: '叶子子单汇总，被二次拆分的中间子单不参与',
    note: '覆盖量指标，仅汇总未被二次拆分的叶子子单，避免拆单链重复计数', fullNote: '被二次拆分的中间子单跳过，避免拆单链重复计数',
  },
  reached: {
    label: '触达客户数', caliber: '策略工单实际触达的客户数', fullCaliber: '本区域及下级组织树下所有叶子子单的触达客户数之和',
    formula: '触达客户数之和，条件：子单未被二次拆分 且 工单状态=已完成', fullFormula: '组织树下所有叶子子单（未被二次拆分的子单）的触达客户数之和',
    source: '工单子单表触达客户数字段', fullSource: '叶子子单汇总',
    note: '仅统计已完成子单的触达数据', fullNote: '被二次拆分的中间子单跳过',
  },
  success: {
    label: '营销成功量', caliber: '策略工单最终营销成功的客户数', fullCaliber: '本区域及下级组织树下所有叶子子单的营销成功量之和',
    formula: '营销成功量之和，条件：子单未被二次拆分 且 工单状态=已完成', fullFormula: '组织树下所有叶子子单（未被二次拆分的子单）的营销成功量之和',
    source: '工单子单表营销成功量字段', fullSource: '叶子子单汇总',
    note: '仅统计已完成子单的营销结果', fullNote: '被二次拆分的中间子单跳过',
  },
  reachRate: {
    label: '触达率', caliber: '触达客户数占目标客户量的比例', fullCaliber: '全口径触达客户数占全口径目标客户量的比例',
    formula: '触达客户数 ÷ 目标客户量 × 100%', fullFormula: '全口径触达客户数 ÷ 全口径目标客户量 × 100%',
    source: '派生指标，由触达客户数和目标客户量计算', fullSource: '全口径分子分母同口径计算',
    note: '目标客户量=0时显示—', fullNote: '分子分母必须同口径',
  },
  successRate: {
    label: '成功率', caliber: '营销成功量占触达客户数的比例', fullCaliber: '全口径营销成功量占全口径触达客户数的比例',
    formula: '营销成功量 ÷ 触达客户数 × 100%', fullFormula: '全口径营销成功量 ÷ 全口径触达客户数 × 100%',
    source: '派生指标，由营销成功量和触达客户数计算', fullSource: '全口径分子分母同口径计算',
    note: '触达客户数=0时显示—', fullNote: '分子分母必须同口径',
  },
  aiRecommend: {
    label: 'AI推荐策略数', caliber: '派发的主工单中策略来源为AI推荐的数量', fullCaliber: '本区域及下级派发的主工单中策略来源为AI推荐的数量（递归汇总）',
    formula: '主工单数，条件：策略来源=AI推荐', fullFormula: '本级AI推荐策略数 + 各直接下级全口径AI推荐策略数之和',
    source: '策略表策略来源字段', fullSource: '按组织树递归汇总',
    note: '行为量指标，按主工单计数', fullNote: '全口径按主工单递归汇总',
  },
  aiAdoptionRate: {
    label: 'AI推荐采纳率', caliber: 'AI推荐策略中已全部完成的比例', fullCaliber: '全口径AI推荐策略中已全部完成的比例',
    formula: 'AI推荐已完成数 ÷ AI推荐策略数 × 100%', fullFormula: '全口径AI推荐已完成数 ÷ 全口径AI推荐策略数 × 100%',
    source: '派生指标，由AI推荐已完成数和AI推荐策略数计算', fullSource: '全口径分子分母同口径计算',
    note: 'AI推荐策略数=0时显示—', fullNote: '分子分母必须同口径',
  },
  scenarioCount: {
    label: '业务场景数量', caliber: '策略工单命中的业务场景去重计数', fullCaliber: '本区域及下级策略工单命中的业务场景去重并集计数',
    formula: '不同业务场景的去重计数', fullFormula: '各区域去重场景数的并集再去重',
    source: '策略中心→关联关系管理→场景表', fullSource: '全口径取各区域场景并集再去重',
    note: '去重计数指标，不是简单相加', fullNote: '不是简单相加，取并集后去重',
  },
  warningCount: {
    label: '预警指标数量', caliber: '策略工单关联的预警指标去重计数', fullCaliber: '本区域及下级预警指标去重并集计数',
    formula: '不同预警指标的去重计数，条件：预警已触发', fullFormula: '各区域去重预警指标数的并集再去重',
    source: '指标中心→预警规则', fullSource: '全口径取各区域并集再去重',
    note: '去重计数指标，不是简单相加', fullNote: '不是简单相加，取并集后去重',
  },
  problemCount: {
    label: '问题子指标数量', caliber: '策略工单关联的问题子指标去重计数', fullCaliber: '本区域及下级问题子指标去重并集计数',
    formula: '不同问题子指标的去重计数，条件：诊断标签=已验证', fullFormula: '各区域去重问题子指标数的并集再去重',
    source: '指标中心→指标诊断', fullSource: '全口径取各区域并集再去重',
    note: '去重计数指标，不是简单相加', fullNote: '不是简单相加，取并集后去重',
  },
  groupCount: {
    label: '潜在客群数量', caliber: '策略工单涉及的潜在客群去重计数', fullCaliber: '本区域及下级潜在客群去重并集计数',
    formula: '不同潜在客群的去重计数', fullFormula: '各区域去重客群数的并集再去重',
    source: '客群分析→客群圈选', fullSource: '全口径取各区域并集再去重',
    note: '去重计数指标，不是简单相加', fullNote: '不是简单相加，取并集后去重',
  },
};

const METRIC_LABEL_MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(STRATEGY_METRICS)) {
  METRIC_LABEL_MAP[k] = v.label;
}

// ==================== 区域工具函数 ====================

function getRegionName(code: string): string {
  if (code === '650000') return '新疆';
  for (const city of xinjiangRegion.cities) {
    if (city.code === code) return city.name;
    for (const d of city.districts ?? []) {
      if (d.code === code) return d.name;
      for (const g of d.grids ?? []) {
        if (g.code === code) return g.name;
      }
    }
  }
  return code;
}

function getDirectChildCodes(parentCode: string): string[] {
  if (parentCode === '650000') return xinjiangRegion.cities.map(c => c.code);
  for (const city of xinjiangRegion.cities) {
    if (city.code === parentCode) return (city.districts ?? []).map(d => d.code);
    for (const d of city.districts ?? []) {
      if (d.code === parentCode) return (d.grids ?? []).map(g => g.code);
    }
  }
  return [];
}

function getSubTreeCodes(code: string): string[] {
  const direct = getDirectChildCodes(code);
  const result: string[] = [];
  for (const c of direct) {
    result.push(c);
    result.push(...getSubTreeCodes(c));
  }
  return result;
}

// ==================== 子单池（全区域全月份数据生成） ====================

/** 伪随机种子：确定性波动 */
function seeded(seed: number): number {
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return (Math.abs(h) % 10000) / 10000;
}

/** 可用策略ID池 */
const STRATEGY_IDS = ['S1001','S1002','S1003','S1004','S1005','S1006','S1007','S1008','S1009','S1010'];
const STRATEGY_SOURCES: ('AI推荐' | '人工创建')[] = ['AI推荐', '人工创建'];
const SCENARIO_IDS = ['SC01','SC02','SC03','SC04','SC05','SC06','SC07','SC08','SC09','SC10'];
const WARNING_IDS = ['WI01','WI02','WI03','WI04','WI05','WI06','WI07','WI08','WI09','WI10'];
const PROBLEM_IDS = ['PI01','PI02','PI03','PI04','PI05','PI06'];
const GROUP_IDS = ['G01','G02','G03','G04','G05','G06','G07','G08','G09','G10'];

/** 确定性选取N个元素 */
function pickN<T>(arr: T[], seed: number, n: number): T[] {
  const result: T[] = [];
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < Math.min(n, shuffled.length); i++) {
    result.push(shuffled[i]);
  }
  return result;
}

/**
 * 生成全区域全月份策略子单池
 * 
 * 生成规则：
 * 1. 新疆省公司 → 16地市：每月每地市1~3条子单
 * 2. 地市 → 区县：每月每区县0~2条子单
 * 3. 区县 → 网格：每月每网格0~1条子单
 * 4. 新疆跨级直派网格：少量
 * 5. 多级拆单链：部分地市有
 * 6. 1~5月业务量递增（因子0.65→0.94），6月为基准
 * 
 * 所有数据基于 developmentFactor 缩放，确保发达地区数值大、欠发达地区数值小
 */
function generateStrategySubTicketPool(): StrategySubTicket[] {
  const tickets: StrategySubTicket[] = [];
  let subId = 0;
  const mkSubId = () => `SS-${String(++subId).padStart(4, '0')}`;
  let parentId = 0;
  const mkParentId = () => `W-${String(++parentId).padStart(3, '0')}`;

  const cities = xinjiangRegion.cities;
  const allMonths = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
  const growthFactor: Record<string, number> = {
    '2026-01': 0.65, '2026-02': 0.72, '2026-03': 0.80, '2026-04': 0.88, '2026-05': 0.94, '2026-06': 1.0,
  };

  for (const month of allMonths) {
    const monthIdx = parseInt(month.split('-')[1], 10);
    const factor = growthFactor[month];
    const monthSeed = monthIdx * 1000;

    // ---- 场景1: 新疆省公司派策略工单到16地市 ----
    for (const city of cities) {
      const df = city.developmentFactor || 1.0;
      // 每地市每月1~3条子单（基于发展因子和月份）
      const count = Math.max(1, Math.round(df * (1 + Math.floor(seeded(monthSeed + parseInt(city.code) * 7) * 2)) * factor));
      const parentTicketId = mkParentId();
      const strategyId = STRATEGY_IDS[Math.floor(seeded(monthSeed + parseInt(city.code)) * STRATEGY_IDS.length)];
      const strategySource = STRATEGY_SOURCES[seeded(monthSeed + parseInt(city.code) * 3) > 0.45 ? 0 : 1];
      const ticketType: TicketType = seeded(monthSeed + parseInt(city.code) * 5) > 0.7 ? 'CG-OP' : 'STR';

      // 是否有拆单链
      const hasSplit = seeded(monthSeed + parseInt(city.code) * 11) > 0.55 && (city.districts ?? []).length >= 2;
      const districts = city.districts ?? [];

      if (hasSplit && districts.length >= 2) {
        // 拆单：先给地市一张isSplit=true的中间子单
        const totalTarget = Math.round((300 + Math.floor(seeded(monthSeed + parseInt(city.code) * 13) * 700)) * df * factor);
        tickets.push({
          subTicketId: mkSubId(), parentTicketId, ticketType, strategyId, strategySource,
          dispatcher: '650000', receiver: city.code, status: 'completed', isSplit: true,
          targetCustomerCount: totalTarget, reachedCustomerCount: Math.round(totalTarget * (0.78 + seeded(monthSeed + parseInt(city.code) * 17) * 0.12)),
          marketingSuccessCount: Math.round(totalTarget * (0.08 + seeded(monthSeed + parseInt(city.code) * 19) * 0.05)),
          scenarioIds: pickN(SCENARIO_IDS, monthSeed + parseInt(city.code), 2 + Math.floor(seeded(monthSeed + parseInt(city.code) * 23) * 3)),
          warningIndicatorIds: pickN(WARNING_IDS, monthSeed + parseInt(city.code) + 1, 1 + Math.floor(seeded(monthSeed + parseInt(city.code) * 29) * 2)),
          problemSubIndicatorIds: pickN(PROBLEM_IDS, monthSeed + parseInt(city.code) + 2, 1 + Math.floor(seeded(monthSeed + parseInt(city.code) * 31) * 2)),
          groupIds: pickN(GROUP_IDS, monthSeed + parseInt(city.code) + 3, 1 + Math.floor(seeded(monthSeed + parseInt(city.code) * 37) * 2)),
          createdAt: month,
        });
        // 拆给2~3个区县（叶子子单）
        const splitCount = Math.min(districts.length, 2 + Math.floor(seeded(monthSeed + parseInt(city.code) * 41) * 2));
        let remaining = totalTarget;
        for (let i = 0; i < splitCount; i++) {
          const dist = districts[i];
          const isLast = i === splitCount - 1;
          const distTarget = isLast ? remaining : Math.round(remaining * (0.3 + seeded(monthSeed + parseInt(dist.code) * 43) * 0.4));
          remaining -= distTarget;
          const distReached = Math.round(distTarget * (0.82 + seeded(monthSeed + parseInt(dist.code) * 47) * 0.12));
          const distSuccess = Math.round(distReached * (0.08 + seeded(monthSeed + parseInt(dist.code) * 53) * 0.06));
          // 历史月份全部完成，6月可能pending
          const isCompleted = monthIdx < 6 || seeded(monthSeed + parseInt(dist.code) * 59) > 0.2;
          tickets.push({
            subTicketId: mkSubId(), parentTicketId, ticketType, strategyId, strategySource,
            dispatcher: city.code, receiver: dist.code, status: isCompleted ? 'completed' : 'pending',
            isSplit: false, targetCustomerCount: distTarget, reachedCustomerCount: isCompleted ? distReached : 0,
            marketingSuccessCount: isCompleted ? distSuccess : 0,
            scenarioIds: pickN(SCENARIO_IDS, monthSeed + parseInt(dist.code), 1 + Math.floor(seeded(monthSeed + parseInt(dist.code) * 61) * 2)),
            warningIndicatorIds: pickN(WARNING_IDS, monthSeed + parseInt(dist.code) + 1, 1 + Math.floor(seeded(monthSeed + parseInt(dist.code) * 67) * 2)),
            problemSubIndicatorIds: pickN(PROBLEM_IDS, monthSeed + parseInt(dist.code) + 2, 1),
            groupIds: pickN(GROUP_IDS, monthSeed + parseInt(dist.code) + 3, 1 + Math.floor(seeded(monthSeed + parseInt(dist.code) * 71) * 2)),
            createdAt: month,
          });
        }
      } else {
        // 直派（不拆单）
        for (let i = 0; i < count; i++) {
          const s = monthSeed + parseInt(city.code) * 7 + i;
          const target = Math.round((200 + Math.floor(seeded(s + 1) * 600)) * df * factor);
          const isCompleted = monthIdx < 6 || seeded(s + 2) > 0.15;
          const reached = isCompleted ? Math.round(target * (0.8 + seeded(s + 3) * 0.15)) : 0;
          const success = isCompleted ? Math.round(reached * (0.08 + seeded(s + 4) * 0.06)) : 0;
          tickets.push({
            subTicketId: mkSubId(), parentTicketId: i === 0 ? parentTicketId : mkParentId(),
            ticketType, strategyId: STRATEGY_IDS[Math.floor(seeded(s + 5) * STRATEGY_IDS.length)],
            strategySource: STRATEGY_SOURCES[seeded(s + 6) > 0.45 ? 0 : 1],
            dispatcher: '650000', receiver: city.code,
            status: isCompleted ? 'completed' : 'pending', isSplit: false,
            targetCustomerCount: target, reachedCustomerCount: reached, marketingSuccessCount: success,
            scenarioIds: pickN(SCENARIO_IDS, s + 7, 1 + Math.floor(seeded(s + 8) * 3)),
            warningIndicatorIds: pickN(WARNING_IDS, s + 9, 1 + Math.floor(seeded(s + 10) * 2)),
            problemSubIndicatorIds: pickN(PROBLEM_IDS, s + 11, 1 + Math.floor(seeded(s + 12) * 2)),
            groupIds: pickN(GROUP_IDS, s + 13, 1 + Math.floor(seeded(s + 14) * 2)),
            createdAt: month,
          });
        }
      }
    }

    // ---- 场景2: 地市派策略工单到区县 ----
    for (const city of cities) {
      const df = city.developmentFactor || 1.0;
      for (const dist of city.districts ?? []) {
        const dCount = Math.max(0, Math.round(df * (seeded(monthSeed + parseInt(dist.code) * 3) > 0.4 ? 1 : 0)));
        for (let i = 0; i < dCount; i++) {
          const s = monthSeed + parseInt(dist.code) * 3 + i;
          const target = Math.round((150 + Math.floor(seeded(s + 1) * 400)) * df * factor);
          const isCompleted = monthIdx < 6 || seeded(s + 2) > 0.2;
          const reached = isCompleted ? Math.round(target * (0.75 + seeded(s + 3) * 0.18)) : 0;
          const success = isCompleted ? Math.round(reached * (0.07 + seeded(s + 4) * 0.07)) : 0;
          tickets.push({
            subTicketId: mkSubId(), parentTicketId: mkParentId(),
            ticketType: seeded(s + 5) > 0.6 ? 'CG-OP' : 'STR',
            strategyId: STRATEGY_IDS[Math.floor(seeded(s + 6) * STRATEGY_IDS.length)],
            strategySource: STRATEGY_SOURCES[seeded(s + 7) > 0.5 ? 0 : 1],
            dispatcher: city.code, receiver: dist.code,
            status: isCompleted ? 'completed' : 'pending', isSplit: false,
            targetCustomerCount: target, reachedCustomerCount: reached, marketingSuccessCount: success,
            scenarioIds: pickN(SCENARIO_IDS, s + 8, 1 + Math.floor(seeded(s + 9) * 2)),
            warningIndicatorIds: pickN(WARNING_IDS, s + 10, 1 + Math.floor(seeded(s + 11) * 2)),
            problemSubIndicatorIds: pickN(PROBLEM_IDS, s + 12, 1),
            groupIds: pickN(GROUP_IDS, s + 13, 1 + Math.floor(seeded(s + 14) * 2)),
            createdAt: month,
          });
        }
      }
    }

    // ---- 场景3: 区县派策略工单到网格 ----
    for (const city of cities) {
      const df = city.developmentFactor || 1.0;
      for (const dist of city.districts ?? []) {
        for (const grid of dist.grids ?? []) {
          if (seeded(monthSeed + parseInt(grid.code) * 2) > 0.35) continue; // 35%概率
          const target = Math.round((60 + Math.floor(seeded(monthSeed + parseInt(grid.code) + 1) * 200)) * df * factor);
          const isCompleted = monthIdx < 6 || seeded(monthSeed + parseInt(grid.code) + 2) > 0.25;
          const reached = isCompleted ? Math.round(target * (0.7 + seeded(monthSeed + parseInt(grid.code) + 3) * 0.2)) : 0;
          const success = isCompleted ? Math.round(reached * (0.08 + seeded(monthSeed + parseInt(grid.code) + 4) * 0.07)) : 0;
          tickets.push({
            subTicketId: mkSubId(), parentTicketId: mkParentId(),
            ticketType: 'STR',
            strategyId: STRATEGY_IDS[Math.floor(seeded(monthSeed + parseInt(grid.code) + 5) * STRATEGY_IDS.length)],
            strategySource: STRATEGY_SOURCES[seeded(monthSeed + parseInt(grid.code) + 6) > 0.5 ? 0 : 1],
            dispatcher: dist.code, receiver: grid.code,
            status: isCompleted ? 'completed' : 'pending', isSplit: false,
            targetCustomerCount: target, reachedCustomerCount: reached, marketingSuccessCount: success,
            scenarioIds: pickN(SCENARIO_IDS, monthSeed + parseInt(grid.code) + 7, 1),
            warningIndicatorIds: pickN(WARNING_IDS, monthSeed + parseInt(grid.code) + 8, 1),
            problemSubIndicatorIds: pickN(PROBLEM_IDS, monthSeed + parseInt(grid.code) + 9, 1),
            groupIds: pickN(GROUP_IDS, monthSeed + parseInt(grid.code) + 10, 1),
            createdAt: month,
          });
        }
      }
    }

    // ---- 场景4: 新疆跨级直派网格（少量） ----
    for (const city of cities.slice(0, 5)) {
      for (const dist of city.districts ?? []) {
        if (seeded(monthSeed + parseInt(dist.code) * 7) > 0.2) continue;
        const grids = dist.grids ?? [];
        if (grids.length === 0) continue;
        const grid = grids[Math.floor(seeded(monthSeed + parseInt(dist.code) * 11) * grids.length)];
        const target = Math.round((100 + Math.floor(seeded(monthSeed + parseInt(grid.code)) * 200)) * factor);
        const isCompleted = monthIdx < 6 || seeded(monthSeed + parseInt(grid.code) + 1) > 0.3;
        const reached = isCompleted ? Math.round(target * (0.65 + seeded(monthSeed + parseInt(grid.code) + 3) * 0.25)) : 0;
        const success = isCompleted ? Math.round(reached * (0.06 + seeded(monthSeed + parseInt(grid.code) + 4) * 0.08)) : 0;
        tickets.push({
          subTicketId: mkSubId(), parentTicketId: mkParentId(),
          ticketType: 'RAS',
          strategyId: STRATEGY_IDS[Math.floor(seeded(monthSeed + parseInt(grid.code) + 5) * STRATEGY_IDS.length)],
          strategySource: 'AI推荐',
          dispatcher: '650000', receiver: grid.code,
          status: isCompleted ? 'completed' : 'pending', isSplit: false,
          targetCustomerCount: target, reachedCustomerCount: reached, marketingSuccessCount: success,
          scenarioIds: pickN(SCENARIO_IDS, monthSeed + parseInt(grid.code) + 7, 1),
          warningIndicatorIds: pickN(WARNING_IDS, monthSeed + parseInt(grid.code) + 8, 1),
          problemSubIndicatorIds: [],
          groupIds: pickN(GROUP_IDS, monthSeed + parseInt(grid.code) + 10, 1),
          createdAt: month,
        });
      }
    }

    // ---- 场景5: 省公司自执行 ----
    if (seeded(monthSeed + 999) > 0.3) {
      const target = Math.round((120 + Math.floor(seeded(monthSeed + 1001) * 200)) * factor);
      tickets.push({
        subTicketId: mkSubId(), parentTicketId: mkParentId(),
        ticketType: 'STR',
        strategyId: STRATEGY_IDS[Math.floor(seeded(monthSeed + 1003) * STRATEGY_IDS.length)],
        strategySource: '人工创建',
        dispatcher: '650000', receiver: '650000',
        status: 'completed', isSplit: false,
        targetCustomerCount: target, reachedCustomerCount: Math.round(target * (0.8 + seeded(monthSeed + 1005) * 0.12)),
        marketingSuccessCount: Math.round(target * (0.09 + seeded(monthSeed + 1007) * 0.05)),
        scenarioIds: pickN(SCENARIO_IDS, monthSeed + 1009, 1),
        warningIndicatorIds: pickN(WARNING_IDS, monthSeed + 1011, 1),
        problemSubIndicatorIds: pickN(PROBLEM_IDS, monthSeed + 1013, 1),
        groupIds: pickN(GROUP_IDS, monthSeed + 1015, 1),
        createdAt: month,
      });
    }
  }

  return tickets;
}

/** 完整子单池 */
const SUB_TICKET_POOL: StrategySubTicket[] = generateStrategySubTicketPool();

// ==================== 口径计算函数 ====================

/** 过滤策略关联子单：strategyId非空且ticketType非IND */
function filterStrategyTickets(tickets: StrategySubTicket[]): StrategySubTicket[] {
  return tickets.filter(t => t.strategyId !== '' && t.ticketType !== 'IND');
}

/** 提取主工单去重列表 */
function getUniqueParentTickets(tickets: StrategySubTicket[]): string[] {
  return [...new Set(tickets.map(t => t.parentTicketId))];
}

/** 本级统计：派发视角 */
function computeDispatchOwnLevel(tickets: StrategySubTicket[], regionCode: string, month: string) {
  const filtered = filterStrategyTickets(tickets);
  const regionTickets = filtered.filter(t => t.dispatcher === regionCode && t.createdAt === month);

  // 行为量：按主工单计数
  const parentIds = getUniqueParentTickets(regionTickets);
  const monthDispatched = parentIds.length;
  // 已完成：主工单的所有子单都completed才算
  let monthCompleted = 0;
  for (const pid of parentIds) {
    const subOfParent = regionTickets.filter(t => t.parentTicketId === pid);
    const allCompleted = subOfParent.every(s => s.status === 'completed');
    if (allCompleted) monthCompleted++;
  }
  const monthCompletionRate = monthDispatched > 0 ? monthCompleted / monthDispatched : 0;

  // 覆盖量：叶子子单汇总
  const leaves = regionTickets.filter(t => !t.isSplit);
  const monthTarget = leaves.reduce((s, t) => s + t.targetCustomerCount, 0);
  const monthReached = leaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.reachedCustomerCount, 0);
  const monthSuccess = leaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.marketingSuccessCount, 0);
  const monthReachRate = monthTarget > 0 ? monthReached / monthTarget : 0;
  const monthSuccessRate = monthReached > 0 ? monthSuccess / monthReached : 0;

  // AI推荐
  const aiParentIds = getUniqueParentTickets(regionTickets.filter(t => t.strategySource === 'AI推荐'));
  const monthAiRecommend = aiParentIds.length;
  let aiCompleted = 0;
  for (const pid of aiParentIds) {
    const subOfParent = regionTickets.filter(t => t.parentTicketId === pid);
    if (subOfParent.every(s => s.status === 'completed')) aiCompleted++;
  }
  const monthAiAdoptionRate = monthAiRecommend > 0 ? aiCompleted / monthAiRecommend : 0;

  // 去重计数指标
  const monthScenarioCount = new Set(regionTickets.flatMap(t => t.scenarioIds)).size;
  const monthWarningCount = new Set(regionTickets.flatMap(t => t.warningIndicatorIds)).size;
  const monthProblemCount = new Set(regionTickets.flatMap(t => t.problemSubIndicatorIds)).size;
  const monthGroupCount = new Set(regionTickets.flatMap(t => t.groupIds)).size;

  return { monthDispatched, monthCompleted, monthCompletionRate, monthTarget, monthReached, monthSuccess, monthReachRate, monthSuccessRate, monthAiRecommend, monthAiAdoptionRate, monthScenarioCount, monthWarningCount, monthProblemCount, monthGroupCount };
}

/** 全口径：基于子单池按组织树递归汇总 */
function applyFullScope(rows: RowData[], tickets: StrategySubTicket[]): RowData[] {
  const filtered = filterStrategyTickets(tickets);
  const months = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];

  return rows.map(row => {
    const code = row.regionCode;
    const allDescCodes = getSubTreeCodes(code);
    const allCodes = [code, ...allDescCodes];
    const month = row.statMonth || '2026-06';

    // 当月全口径 - 所有子单
    const monthTickets = filtered.filter(t => allCodes.includes(t.dispatcher) && t.createdAt === month);

    // 行为量：主工单计数
    const monthParentIds = getUniqueParentTickets(monthTickets);
    const mDispatched = monthParentIds.length;
    let mCompleted = 0;
    for (const pid of monthParentIds) {
      const subOfParent = monthTickets.filter(t => t.parentTicketId === pid);
      if (subOfParent.every(s => s.status === 'completed')) mCompleted++;
    }

    // 覆盖量：叶子子单汇总
    const monthLeaves = monthTickets.filter(t => !t.isSplit);
    const mTarget = monthLeaves.reduce((s, t) => s + t.targetCustomerCount, 0);
    const mReached = monthLeaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.reachedCustomerCount, 0);
    const mSuccess = monthLeaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.marketingSuccessCount, 0);

    // AI推荐
    const mAiParentIds = getUniqueParentTickets(monthTickets.filter(t => t.strategySource === 'AI推荐'));
    const mAiRecommend = mAiParentIds.length;
    let mAiCompleted = 0;
    for (const pid of mAiParentIds) {
      const subOfParent = monthTickets.filter(t => t.parentTicketId === pid);
      if (subOfParent.every(s => s.status === 'completed')) mAiCompleted++;
    }

    // 去重计数：并集去重
    const mScenarioCount = new Set(monthTickets.flatMap(t => t.scenarioIds)).size;
    const mWarningCount = new Set(monthTickets.flatMap(t => t.warningIndicatorIds)).size;
    const mProblemCount = new Set(monthTickets.flatMap(t => t.problemSubIndicatorIds)).size;
    const mGroupCount = new Set(monthTickets.flatMap(t => t.groupIds)).size;

    // 累计全口径
    const prevMonths = months.filter(m => m <= month);
    const cumTickets = filtered.filter(t => allCodes.includes(t.dispatcher) && prevMonths.includes(t.createdAt));
    const cumParentIds = getUniqueParentTickets(cumTickets);
    const cDispatched = cumParentIds.length;
    let cCompleted = 0;
    for (const pid of cumParentIds) {
      const subOfParent = cumTickets.filter(t => t.parentTicketId === pid);
      if (subOfParent.every(s => s.status === 'completed')) cCompleted++;
    }
    const cumLeaves = cumTickets.filter(t => !t.isSplit);
    const cTarget = cumLeaves.reduce((s, t) => s + t.targetCustomerCount, 0);
    const cReached = cumLeaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.reachedCustomerCount, 0);
    const cSuccess = cumLeaves.filter(t => t.status === 'completed').reduce((s, t) => s + t.marketingSuccessCount, 0);
    const cAiParentIds = getUniqueParentTickets(cumTickets.filter(t => t.strategySource === 'AI推荐'));
    const cAiRecommend = cAiParentIds.length;
    let cAiCompleted = 0;
    for (const pid of cAiParentIds) {
      const subOfParent = cumTickets.filter(t => t.parentTicketId === pid);
      if (subOfParent.every(s => s.status === 'completed')) cAiCompleted++;
    }
    const cScenarioCount = new Set(cumTickets.flatMap(t => t.scenarioIds)).size;
    const cWarningCount = new Set(cumTickets.flatMap(t => t.warningIndicatorIds)).size;
    const cProblemCount = new Set(cumTickets.flatMap(t => t.problemSubIndicatorIds)).size;
    const cGroupCount = new Set(cumTickets.flatMap(t => t.groupIds)).size;

    return {
      ...row,
      monthDispatched: mDispatched,
      monthCompleted: mCompleted,
      monthCompletionRate: mDispatched > 0 ? mCompleted / mDispatched : 0,
      monthTarget: mTarget,
      monthReached: mReached,
      monthSuccess: mSuccess,
      monthReachRate: mTarget > 0 ? mReached / mTarget : 0,
      monthSuccessRate: mReached > 0 ? mSuccess / mReached : 0,
      monthAiRecommend: mAiRecommend,
      monthAiAdoptionRate: mAiRecommend > 0 ? mAiCompleted / mAiRecommend : 0,
      monthScenarioCount: mScenarioCount,
      monthWarningCount: mWarningCount,
      monthProblemCount: mProblemCount,
      monthGroupCount: mGroupCount,
      cumDispatched: cDispatched,
      cumCompleted: cCompleted,
      cumCompletionRate: cDispatched > 0 ? cCompleted / cDispatched : 0,
      cumTarget: cTarget,
      cumReached: cReached,
      cumSuccess: cSuccess,
      cumReachRate: cTarget > 0 ? cReached / cTarget : 0,
      cumSuccessRate: cReached > 0 ? cSuccess / cReached : 0,
      cumAiRecommend: cAiRecommend,
      cumAiAdoptionRate: cAiRecommend > 0 ? cAiCompleted / cAiRecommend : 0,
      cumScenarioCount: cScenarioCount,
      cumWarningCount: cWarningCount,
      cumProblemCount: cProblemCount,
      cumGroupCount: cGroupCount,
    };
  });
}

/** 生成月度趋势数据（6行月份） */
function generateMonthlyTrend(regionCode: string, regionName: string, canDrill: boolean): RowData[] {
  const months = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
  const rows: RowData[] = [];

  for (const month of months) {
    const own = computeDispatchOwnLevel(SUB_TICKET_POOL, regionCode, month);

    // 累计：年初至当月逐月累加
    const cumMonths = months.filter(m => m <= month);
    let cD = 0, cC = 0, cT = 0, cR = 0, cS = 0, cAi = 0;
    let cScenarioIds: string[] = [], cWarningIds: string[] = [], cProblemIds: string[] = [], cGroupIds: string[] = [];
    for (const cm of cumMonths) {
      const cOwn = computeDispatchOwnLevel(SUB_TICKET_POOL, regionCode, cm);
      cD += cOwn.monthDispatched;
      cC += cOwn.monthCompleted;
      cT += cOwn.monthTarget;
      cR += cOwn.monthReached;
      cS += cOwn.monthSuccess;
      cAi += cOwn.monthAiRecommend;
    }

    rows.push({
      regionCode,
      regionName,
      statMonth: month,
      canDrillDown: canDrill, // 趋势模式下归属区域可点击下钻
      statTime: `${month}-20 12:00:00`,
      ...own,
      cumDispatched: cD,
      cumCompleted: cC,
      cumCompletionRate: cD > 0 ? cC / cD : 0,
      cumTarget: cT,
      cumReached: cR,
      cumSuccess: cS,
      cumReachRate: cT > 0 ? cR / cT : 0,
      cumSuccessRate: cR > 0 ? cS / cR : 0,
      cumAiRecommend: cAi,
      cumAiAdoptionRate: cAi > 0 ? Math.min(1, cC / cD) : 0,
      cumScenarioCount: new Set(cScenarioIds).size + own.monthScenarioCount,
      cumWarningCount: new Set(cWarningIds).size + own.monthWarningCount,
      cumProblemCount: new Set(cProblemIds).size + own.monthProblemCount,
      cumGroupCount: new Set(cGroupIds).size + own.monthGroupCount,
    });
  }
  return rows;
}

/** 生成下钻数据（下级区域） */
function generateDrillDownData(parentCode: string, month: string): RowData[] {
  const childCodes = getDirectChildCodes(parentCode);
  const rows: RowData[] = [];

  for (const code of childCodes) {
    const name = getRegionName(code);
    const canDrill = getDirectChildCodes(code).length > 0;
    const own = computeDispatchOwnLevel(SUB_TICKET_POOL, code, month);

    // 累计
    const cumMonths = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'].filter(m => m <= month);
    let cD = 0, cC = 0, cT = 0, cR = 0, cS = 0, cAi = 0;
    for (const cm of cumMonths) {
      const cOwn = computeDispatchOwnLevel(SUB_TICKET_POOL, code, cm);
      cD += cOwn.monthDispatched;
      cC += cOwn.monthCompleted;
      cT += cOwn.monthTarget;
      cR += cOwn.monthReached;
      cS += cOwn.monthSuccess;
      cAi += cOwn.monthAiRecommend;
    }

    rows.push({
      regionCode: code,
      regionName: name,
      statMonth: month,
      canDrillDown: canDrill,
      statTime: `${month}-20 12:00:00`,
      ...own,
      cumDispatched: cD,
      cumCompleted: cC,
      cumCompletionRate: cD > 0 ? cC / cD : 0,
      cumTarget: cT,
      cumReached: cR,
      cumSuccess: cS,
      cumReachRate: cT > 0 ? cR / cT : 0,
      cumSuccessRate: cR > 0 ? cS / cR : 0,
      cumAiRecommend: cAi,
      cumAiAdoptionRate: cAi > 0 ? Math.min(1, cC / Math.max(1, cD)) : 0,
      cumScenarioCount: own.monthScenarioCount,
      cumWarningCount: own.monthWarningCount,
      cumProblemCount: own.monthProblemCount,
      cumGroupCount: own.monthGroupCount,
    });
  }
  return rows;
}

// ==================== 页面组件 ====================

export default function StrategyAnalysisPage() {
  const [dataScope, setDataScope] = useState<'own' | 'full'>('own');
  const [drillPath, setDrillPath] = useState<DrillLevel[]>([{ level: 1, regionCode: '650000', regionName: '新疆' }]);
  const [viewMode, setViewMode] = useState<'trend' | 'drilled'>('trend');
  const [drillMonth, setDrillMonth] = useState('2026-06');
  const [trendMetric, setTrendMetric] = useState('dispatched');
  const [regionMetric, setRegionMetric] = useState('dispatched');
  const [currentPage, setCurrentPage] = useState(1);
  const [execRecordRow, setExecRecordRow] = useState<RowData | null>(null);
  const pageSize = 20;

  const currentLevel = drillPath.length;
  const currentRegionCode = drillPath[drillPath.length - 1].regionCode;
  const currentRegionName = drillPath[drillPath.length - 1].regionName;
  const childLevelLabel = currentLevel === 1 ? '地市' : currentLevel === 2 ? '区县' : '网格';

  // ---- 数据 ----
  const tableData = useMemo(() => {
    let rows: RowData[];
    if (viewMode === 'trend') {
      rows = generateMonthlyTrend(currentRegionCode, currentRegionName, currentLevel < 4);
    } else {
      rows = generateDrillDownData(currentRegionCode, drillMonth);
    }
    if (dataScope === 'full') {
      rows = applyFullScope(rows, SUB_TICKET_POOL);
    }
    return rows;
  }, [viewMode, currentRegionCode, currentRegionName, drillMonth, dataScope, currentLevel]);

  // 辅助：从 RowData 按动态 key 取数值
  const getRowNum = (r: RowData, prefix: 'month' | 'cum', field: string) =>
    (r as unknown as Record<string, number | string>)[`${prefix}${field.charAt(0).toUpperCase()}${field.slice(1)}`] as number;

  // 趋势图数据（X轴从左到右：1月→6月）
  const trendChartData = useMemo(() => {
    if (viewMode === 'trend') {
      return tableData.map(r => ({
        month: r.statMonth,
        value: getRowNum(r, 'month', trendMetric),
      }));
    }
    const trendRows = generateMonthlyTrend(currentRegionCode, currentRegionName, currentLevel < 4);
    return trendRows.map(r => ({
      month: r.statMonth,
      value: getRowNum(r, 'month', trendMetric),
    }));
  }, [tableData, viewMode, currentRegionCode, currentRegionName, trendMetric, currentLevel]);

  // 区域对比图数据
  const regionCompareChartData = useMemo(() => {
    let drillRows = generateDrillDownData(currentRegionCode, '2026-06');
    if (dataScope === 'full') {
      drillRows = applyFullScope(drillRows, SUB_TICKET_POOL);
    }
    return drillRows.map(r => ({
      region: r.regionName,
      fullName: r.regionName,
      value: getRowNum(r, 'month', regionMetric),
    }));
  }, [currentRegionCode, regionMetric, dataScope]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));
  const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ---- 下钻 ----
  const drillDown = (regionCode: string, regionName: string, month: string) => {
    const newLevel = currentLevel + 1;
    if (newLevel > 4) return;
    const newPath = [...drillPath, { level: newLevel, regionCode, regionName }];
    setDrillPath(newPath);
    setDrillMonth(month);
    setViewMode('drilled');
    setCurrentPage(1);
  };

  const drillUp = (targetLevel: number) => {
    const newPath = drillPath.slice(0, targetLevel);
    setDrillPath(newPath);
    if (targetLevel < currentLevel) {
      setViewMode('trend');
    }
    setCurrentPage(1);
  };

  // ---- 导出 ----
  const handleExport = () => {
    const monthLabels = ALL_COL_KEYS.map(k => STRATEGY_METRICS[k].label);
    const cumLabels = ALL_COL_KEYS.map(k => `${STRATEGY_METRICS[k].label}(累计)`);

    const headerRow1 = ['归属区域', '统计月份', '当月', ...Array(ALL_COL_KEYS.length - 1).fill(''), '累计', ...Array(ALL_COL_KEYS.length - 1).fill(''), '统计时间', '操作'];
    const headerRow2 = ['', '', ...monthLabels, ...cumLabels, '', ''];

    const dataRows = tableData.map(row => [
      row.regionName, row.statMonth,
      row.monthDispatched, row.monthCompleted, (row.monthCompletionRate * 100).toFixed(1) + '%',
      row.monthTarget, row.monthReached, row.monthSuccess,
      (row.monthReachRate * 100).toFixed(1) + '%', (row.monthSuccessRate * 100).toFixed(1) + '%',
      row.monthAiRecommend, (row.monthAiAdoptionRate * 100).toFixed(1) + '%',
      row.monthScenarioCount, row.monthWarningCount, row.monthProblemCount, row.monthGroupCount,
      row.cumDispatched, row.cumCompleted, (row.cumCompletionRate * 100).toFixed(1) + '%',
      row.cumTarget, row.cumReached, row.cumSuccess,
      (row.cumReachRate * 100).toFixed(1) + '%', (row.cumSuccessRate * 100).toFixed(1) + '%',
      row.cumAiRecommend, (row.cumAiAdoptionRate * 100).toFixed(1) + '%',
      row.cumScenarioCount, row.cumWarningCount, row.cumProblemCount, row.cumGroupCount,
      row.statTime, '执行记录',
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...dataRows]);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 2 + ALL_COL_KEYS.length - 1 } },
      { s: { r: 0, c: 2 + ALL_COL_KEYS.length }, e: { r: 0, c: 2 + ALL_COL_KEYS.length * 2 - 1 } },
      { s: { r: 0, c: 2 + ALL_COL_KEYS.length * 2 }, e: { r: 1, c: 2 + ALL_COL_KEYS.length * 2 } },
      { s: { r: 0, c: 2 + ALL_COL_KEYS.length * 2 + 1 }, e: { r: 1, c: 2 + ALL_COL_KEYS.length * 2 + 1 } },
    ];
    ws['!cols'] = headerRow2.map(() => ({ wch: 12 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '策略派发统计');
    const fileName = `策略分析_派发统计_${dataScope === 'own' ? '本级统计' : '全口径统计'}_${currentRegionName}_${viewMode === 'trend' ? '趋势' : drillMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ---- 辅助 ----
  const fmtNum = (v: number | undefined) => (v == null || v === 0 ? '-' : v.toLocaleString());
  const fmtPct = (v: number | undefined) => (v == null || v === 0 ? '-' : (v * 100).toFixed(1) + '%');

  /** 获取行数据的当月/累计指标值 */
  const getCellValue = (row: RowData, colKey: string, scope: 'month' | 'cum'): number => {
    const prefix = scope === 'month' ? 'month' : 'cum';
    const key = `${prefix}${colKey.charAt(0).toUpperCase()}${colKey.slice(1)}` as keyof RowData;
    return (row[key] as number) ?? 0;
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* 导航面包屑 */}
        <div className="flex items-center gap-1 text-sm">
          <a href="/portal/capability/dispatch/overview" className="text-primary hover:underline">能力中心</a>
          <span className="text-muted-foreground">/</span>
          <a href="/portal/capability/evaluation/strategy" className="text-primary hover:underline">评估中心</a>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">策略分析</span>
        </div>

        {/* 下钻路径 */}
        <div className="flex items-center gap-4">
          {drillPath.length > 1 && (
            <div className="flex items-center gap-1 text-sm">
              {drillPath.map((d, idx) => {
                if (idx > 0 && d.regionCode === drillPath[idx - 1].regionCode) return null;
                const isLast = idx === drillPath.length - 1;
                const isClickable = !isLast || viewMode === 'drilled';
                return (
                  <span key={`${d.level}-${d.regionCode}`} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-muted-foreground">&gt;</span>}
                    {isClickable ? (
                      <button onClick={() => drillUp(d.level)} className="text-primary hover:underline cursor-pointer">{d.regionName}</button>
                    ) : (
                      <span className="font-medium text-foreground">{d.regionName}</span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* 内容区 */}
        <div className="space-y-6">

        {/* 双栏图表区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左：时间变化趋势 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">时间变化趋势</CardTitle>
                <Select value={trendMetric} onValueChange={setTrendMetric}>
                  <SelectTrigger className="w-[150px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatched">策略派发数量</SelectItem>
                    <SelectItem value="completed">已完成数量</SelectItem>
                    <SelectItem value="target">目标客户量</SelectItem>
                    <SelectItem value="reached">触达客户数</SelectItem>
                    <SelectItem value="success">营销成功量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="value" name={METRIC_LABEL_MAP[trendMetric] || '策略派发数量'} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 右：区域对比（纵向柱状图） */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">区域对比</CardTitle>
                <Select value={regionMetric} onValueChange={setRegionMetric}>
                  <SelectTrigger className="w-[150px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatched">策略派发数量</SelectItem>
                    <SelectItem value="completed">已完成数量</SelectItem>
                    <SelectItem value="target">目标客户量</SelectItem>
                    <SelectItem value="reached">触达客户数</SelectItem>
                    <SelectItem value="success">营销成功量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {currentLevel < 4 && regionCompareChartData.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="h-[260px]" style={{ minWidth: Math.max(400, regionCompareChartData.length * 60) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionCompareChartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="region" tick={{ fontSize: 10 }} interval={0} height={70} angle={-45} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(val: number, _name: string, props: { payload?: { fullName?: string } }) => [val, props.payload?.fullName || '']} />
                        <Bar dataKey="value" name={METRIC_LABEL_MAP[regionMetric] || '策略派发数量'} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : currentLevel === 4 ? (
                <div className="h-[260px] flex flex-col items-center justify-center text-muted-foreground">
                  <Info className="w-10 h-10 mb-2 opacity-30" />
                  <span className="text-sm">当前为最细粒度区域，无下级对比数据</span>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">暂无下级区域数据</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 策略月指标表格区 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* 范围切换 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">数据范围：</span>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
                    <button onClick={() => { setDataScope('own'); setCurrentPage(1); }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${dataScope === 'own' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                      本级统计
                    </button>
                    <button onClick={() => { setDataScope('full'); setCurrentPage(1); }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${dataScope === 'full' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                      全口径统计
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 inline ml-0.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs text-xs">
                          全口径统计 = 本区域 + 所有下级区域（递归至最末级）的汇总数据。<br />
                          例如：新疆全口径策略派发数量 = 新疆本级策略派发数量 + 16地市全口径策略派发数量之和<br /><br />
                          <b>行为量 vs 覆盖量：</b><br />
                          · 策略派发数量/已完成数量 = 行为量，全口径按主工单递归汇总（每次策略派发决策是独立行为）<br />
                          · 目标客户量/触达客户数/营销成功量 = 覆盖量，全口径仅按叶子子单汇总（isSplit=false，避免拆单重复计数）<br />
                          · 例：新疆派1000人给乌鲁木齐，乌鲁木齐拆成600+400给天山区和沙区 → 全口径目标客户量仍为1000而非2000
                        </TooltipContent>
                      </Tooltip>
                    </button>
                  </div>
                </div>
                {/* 视图模式提示 */}
                <span className="text-xs text-muted-foreground">
                  {viewMode === 'trend'
                    ? `当前：${currentRegionName}月度趋势（点击归属区域下钻）`
                    : `当前：${currentRegionName}${childLevelLabel}${drillMonth}数据（点击归属区域继续下钻）`
                  }
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleExport} className="h-7 text-xs gap-1">
                  <Download className="w-3.5 h-3.5" /> 导出
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[1800px]">
              <thead>
                {/* 第一行表头：一级分组 */}
                <tr className="bg-muted border-b border-border">
                  <th className="px-2 py-2 text-center font-medium text-foreground border-r border-border whitespace-nowrap bg-muted"
                    style={{ minWidth: 100, position: 'sticky', left: 0, zIndex: 10, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}
                    rowSpan={2}>
                    归属区域
                  </th>
                  <th className="px-2 py-2 text-center font-medium text-foreground border-r border-border whitespace-nowrap bg-muted"
                    style={{ minWidth: 90, position: 'sticky', left: 100, zIndex: 10 }}
                    rowSpan={2}>
                    统计月份
                  </th>
                  {/* 当月 */}
                  <th className="px-2 py-2 text-center font-medium text-foreground border-r border-border whitespace-nowrap bg-blue-50/50 dark:bg-blue-950/20"
                    colSpan={ALL_COL_KEYS.length}>
                    当 月
                  </th>
                  {/* 累计 */}
                  <th className="px-2 py-2 text-center font-medium text-foreground border-r border-border whitespace-nowrap bg-amber-50/50 dark:bg-amber-950/20"
                    colSpan={ALL_COL_KEYS.length}>
                    累 计
                  </th>
                  <th className="px-2 py-2 text-center font-medium text-foreground border-r border-border whitespace-nowrap"
                    style={{ minWidth: 120 }}
                    rowSpan={2}>
                    统计时间
                  </th>
                  <th className="px-2 py-2 text-center font-medium text-foreground whitespace-nowrap bg-muted"
                    style={{ minWidth: 70, position: 'sticky', right: 0, zIndex: 10, boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)' }}
                    rowSpan={2}>
                    操作
                  </th>
                </tr>
                {/* 第二行表头：具体指标列 */}
                <tr className="bg-muted border-b border-border">
                  {/* 当月指标 */}
                  {ALL_COL_KEYS.map((key, idx) => {
                    const m = STRATEGY_METRICS[key];
                    const isFull = dataScope === 'full';
                    return (
                      <th key={`month-${key}`}
                        className={`px-2 py-1.5 text-center font-medium text-foreground whitespace-nowrap bg-blue-50/50 dark:bg-blue-950/20 ${idx < ALL_COL_KEYS.length - 1 ? 'border-r border-border' : 'border-r border-border'}`}>
                        <div className="flex items-center justify-center gap-0.5">
                          {m.label}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <div className="space-y-1">
                                <p><b>口径：</b>{isFull ? m.fullCaliber : m.caliber}</p>
                                <p><b>公式：</b>{isFull ? m.fullFormula : m.formula}</p>
                                <p><b>来源：</b>{isFull ? m.fullSource : m.source}</p>
                                <p><b>注意：</b>{isFull ? m.fullNote : m.note}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                    );
                  })}
                  {/* 累计指标 */}
                  {ALL_COL_KEYS.map((key, idx) => {
                    const m = STRATEGY_METRICS[key];
                    const isFull = dataScope === 'full';
                    return (
                      <th key={`cum-${key}`}
                        className={`px-2 py-1.5 text-center font-medium text-foreground whitespace-nowrap bg-amber-50/50 dark:bg-amber-950/20 ${idx < ALL_COL_KEYS.length - 1 ? 'border-r border-border' : ''}`}>
                        <div className="flex items-center justify-center gap-0.5">
                          {m.label}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <div className="space-y-1">
                                <p><b>口径：</b>{isFull ? m.fullCaliber : m.caliber}（年初至当月累计值）</p>
                                <p><b>公式：</b>{isFull ? m.fullFormula : m.formula}，按年1月至当月逐月累加</p>
                                <p><b>来源：</b>{isFull ? m.fullSource : m.source}</p>
                                <p><b>注意：</b>{isFull ? m.fullNote : m.note}；跨年自动清零重新累计</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => {
                  const evenRow = idx % 2 === 0;
                  const stickyCls = evenRow ? 'bg-background' : 'bg-muted';

                  return (
                    <tr key={`${row.regionCode}-${row.statMonth}`} className={`border-b border-border hover:bg-muted/30 ${evenRow ? '' : 'bg-muted/10'}`}>
                      {/* 归属区域 */}
                      <td className={`px-2 py-2 text-center whitespace-nowrap font-medium ${stickyCls}`}
                        style={{ position: 'sticky', left: 0, zIndex: 5, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                        {row.canDrillDown ? (
                          <button onClick={() => drillDown(row.regionCode, row.regionName, row.statMonth)}
                            className="text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5">
                            {row.regionName}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span>{row.regionName}</span>
                        )}
                      </td>
                      {/* 统计月份 */}
                      <td className={`px-2 py-2 text-center whitespace-nowrap ${stickyCls}`}
                        style={{ position: 'sticky', left: 100, zIndex: 5 }}>
                        {row.statMonth}
                      </td>
                      {/* 当月指标 */}
                      {ALL_COL_KEYS.map((key) => {
                        const val = getCellValue(row, key, 'month');
                        const isRate = (RATE_COLS as readonly string[]).includes(key);
                        return (
                          <td key={`month-${key}`} className="px-2 py-2 text-center">
                            {isRate ? fmtPct(val) : (key === 'dispatched' && val > 0
                              ? <span className="text-primary font-medium">{fmtNum(val)}</span>
                              : key === 'completed' && val > 0
                                ? <span className="text-green-600 font-medium">{fmtNum(val)}</span>
                                : fmtNum(val)
                            )}
                          </td>
                        );
                      })}
                      {/* 累计指标 */}
                      {ALL_COL_KEYS.map((key) => {
                        const val = getCellValue(row, key, 'cum');
                        const isRate = (RATE_COLS as readonly string[]).includes(key);
                        return (
                          <td key={`cum-${key}`} className="px-2 py-2 text-center">
                            {isRate ? fmtPct(val) : fmtNum(val)}
                          </td>
                        );
                      })}
                      {/* 统计时间 */}
                      <td className="px-2 py-2 text-center whitespace-nowrap">{row.statTime}</td>
                      {/* 操作 */}
                      <td className={`px-2 py-2 text-center ${stickyCls}`}
                        style={{ position: 'sticky', right: 0, zIndex: 5, whiteSpace: 'nowrap', boxShadow: '-2px 0 4px -2px rgba(0,0,0,0.1)' }}>
                        <button
                          className="text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5 text-xs whitespace-nowrap"
                          onClick={() => setExecRecordRow(row)}
                        >
                          <List className="w-3 h-3 shrink-0" />
                          执行记录
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">共 {tableData.length} 条，第 {currentPage}/{totalPages} 页</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)} className="h-7 text-xs">上一页</Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="h-7 text-xs">下一页</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* 执行记录弹窗 */}
      <Dialog open={!!execRecordRow} onOpenChange={(open) => !open && setExecRecordRow(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>执行记录 - {execRecordRow?.regionName}（{execRecordRow?.statMonth}）</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-sm">
            <div>
              <div className="font-medium mb-3">触达转化漏斗</div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">目标客户量</span>
                    <span className="font-medium">{(execRecordRow?.monthTarget ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">触达客户数</span>
                    <span className="font-medium">{(execRecordRow?.monthReached ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${((execRecordRow?.monthReached ?? 0) / Math.max(execRecordRow?.monthTarget ?? 0, 1)) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">营销成功量</span>
                    <span className="font-medium">{(execRecordRow?.monthSuccess ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${((execRecordRow?.monthSuccess ?? 0) / Math.max(execRecordRow?.monthReached ?? 0, 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-3">执行节点状态</div>
              <div className="flex items-center gap-2">
                {['派发', '接单', '执行', '完成'].map((node, i) => (
                  <div key={node} className="flex items-center gap-2">
                    {i > 0 && <div className="w-8 h-px bg-border" />}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs mt-1 text-muted-foreground">{node}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">完成率</div>
                <div className="text-lg font-semibold mt-1">{((execRecordRow?.monthCompletionRate ?? 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">触达率</div>
                <div className="text-lg font-semibold mt-1">{((execRecordRow?.monthReachRate ?? 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <div className="text-xs text-muted-foreground">成功率</div>
                <div className="text-lg font-semibold mt-1">{((execRecordRow?.monthSuccessRate ?? 0) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
