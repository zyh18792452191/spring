'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Download, ChevronRight, Info, List } from 'lucide-react';

import { provinces } from '@/data/provinces';
import * as XLSX from 'xlsx';

// ==================== 类型 ====================

interface DrillLevel { level: number; regionCode: string; regionName: string; }

interface RowData {
  regionCode: string;
  regionName: string;
  statMonth: string;
  canDrillDown: boolean;
  // 当月
  monthDispatched: number;
  monthPending: number;
  monthProcessed: number;
  monthTarget: number;
  monthReached: number;
  monthSuccess: number;
  monthProcessingRate: number;
  monthTimelyRate: number;
  monthArchiveRate: number;
  monthReachRate: number;
  monthSuccessRate: number;
  monthCancelled: number;   // 当月撤单量
  // 累计（年初至当月）
  cumDispatched: number;
  cumPending: number;
  cumProcessed: number;
  cumTarget: number;
  cumReached: number;
  cumSuccess: number;
  cumProcessingRate: number;
  cumTimelyRate: number;
  cumArchiveRate: number;
  cumReachRate: number;
  cumSuccessRate: number;
  cumCancelled: number;     // 累计撤单量
  // 元信息
  statTime: string;
}

// ==================== 常量 ====================

const LAST_12_MONTHS = (() => {
  const m: string[] = [];
  const now = new Date(2026, 5); // 2026-06
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i);
    m.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return m;
})();

/** 数量指标列键（与 RowData 属性短名一致） */
const QUANTITY_COLS = ['dispatched', 'pending', 'processed', 'target', 'reached', 'success'] as const;
/** 率值指标列键 */
const RATE_COLS = ['processingRate', 'timelyRate', 'archiveRate', 'reachRate', 'successRate'] as const;
/** 所有指标列键 */
const ALL_COL_KEYS = [...QUANTITY_COLS, ...RATE_COLS] as const;
type ColKey = (typeof ALL_COL_KEYS)[number];

/** 指标口径定义（本级 + 全口径双套） */
interface MetricDef {
  label: string;
  /** 本级统计口径 */
  caliber: string;
  formula: string;
  source: string;
  note: string;
  /** 全口径统计口径 */
  fullCaliber: string;
  fullFormula: string;
  fullSource: string;
  fullNote: string;
}

/** 派单视角口径字典（全中文） */
const DISPATCH_METRICS: Record<ColKey, MetricDef> = {
  dispatched: {
    label: '派单量',
    caliber: '仅统计本区域自身当月派发的子单数量',
    formula: '统计派单区域为本区域且创建时间在当月的子单数量',
    source: '工单子单表',
    note: '不含主单，仅计子单；不含下级区域自行派发的子单；撤单的子单派单量照计（派发动作不可撤销），但不计入待处理量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）当月派发的子单数量之和',
    fullFormula: '本区域派单量 + 直接下级区域的全口径派单量之和（递归至网格级）',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '递归至网格级汇总，即全疆全口径包含省-地市-区县-网格四级的全部派单量；派单全口径统计的是派发行为量，接单全口径统计的是执行责任量，二者含义不同',
  },
  pending: {
    label: '待处理量',
    caliber: '仅统计本区域自身派发的子单中处于待处理状态的数量',
    formula: '统计派单区域为本区域且状态为待处理的子单数量',
    source: '工单子单表',
    note: '仅统计当月派发的子单中的待处理数量，不含历史月份派发但仍未处理的积压单；撤单的子单不计入待处理量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）派发的子单中待处理数量之和',
    fullFormula: '本区域待处理量 + 直接下级区域的全口径待处理量之和',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '全口径待处理量反映整个体系的积压规模；含历史月份派发但截至当月仍未处理的积压单；撤单的子单不计入',
  },
  processed: {
    label: '已处理量',
    caliber: '仅统计本区域自身派发的子单中已完成处理的数量',
    formula: '统计派单区域为本区域且状态为已完成的子单数量',
    source: '工单子单表',
    note: '仅统计当月派发的子单中已完成处理的数量，不含历史月份派发但本月完成的子单（历史月派发本月完成的归入累计口径）；二次派单不算已处理，只有终端执行完毕才算；撤单的子单不计入已处理量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）派发的子单中已处理数量之和',
    fullFormula: '本区域已处理量 + 直接下级区域的全口径已处理量之和',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '全口径已处理量反映整个体系的执行产出；含历史月份派发但截至当月累计期内完成处理的子单；二次派单不算已处理，只有终端执行完毕才算',
  },
  target: {
    label: '目标客户数',
    caliber: '仅统计本区域自身派发的子单所圈定的客群总人数',
    formula: '对派单区域为本区域的所有子单的目标客户数求和',
    source: '工单子单表',
    note: '工单创建时确定，后续不变；撤单的子单目标客户数照计（派发动作不可撤销）；被二次拆单的子单(isSplit=true)其目标已拆分至下级子单，全口径下仅计叶子子单',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单所圈定客群总人数之和（拆单链路上的中间子单不重复计算）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的目标客户数，避免同一批客户被多级拆单重复计数',
    fullSource: '工单子单表（仅叶子子单汇总）',
    fullNote: '拆单场景下，新疆派800人给乌鲁木齐，乌鲁木齐拆成500+300给天山区和沙区，全口径目标客户数仍为800而非800+500+300=1600；拆单时追加自有客户的情况除外',
  },
  reached: {
    label: '触达客户数',
    caliber: '仅统计本区域自身派发的子单中实际触达的客户人数（同一客户去重）',
    formula: '对派单区域为本区域且存在触达记录的客户去重计数',
    source: '子单执行记录表',
    note: '同一客户被多次触达仅计一次；被二次拆单的子单其触达量已从叶子子单向上汇总',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单中触达客户数之和（拆单链路上的中间子单不重复计数）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的触达客户数，被拆单的子单触达量已从叶子子单汇总得出',
    fullSource: '子单执行记录表（仅叶子子单汇总）',
    fullNote: '全口径触达客户数为叶子子单汇总值，避免拆单链重复计数；如需跨级去重，实际值会小于此值',
  },
  success: {
    label: '营销成功量',
    caliber: '仅统计本区域自身派发的子单中营销结果为成功的客户数',
    formula: '统计派单区域为本区域且营销结果为成功的子单数量',
    source: '子单执行记录表',
    note: '营销成功指客户接受了推荐的产品或方案；被二次拆单的子单其成功量已从叶子子单向上汇总',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单中营销成功量之和（拆单链路上的中间子单不重复计数）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的营销成功量，被拆单的子单成功量已从叶子子单汇总得出',
    fullSource: '子单执行记录表（仅叶子子单汇总）',
    fullNote: '全口径营销成功量为叶子子单汇总值，避免拆单链重复计数',
  },
  processingRate: {
    label: '处理率(%)',
    caliber: '仅统计本区域自身的已处理子单占派发子单总量的比例',
    formula: '本区域已处理量 ÷ 本区域派单量 × 100%',
    source: '派生计算',
    note: '分母为本区域派单量，若派单量为0则显示"-"',
    fullCaliber: '全口径已处理量占全口径派单量的比例（加权汇总后重新计算）',
    fullFormula: '全口径已处理量 ÷ 全口径派单量 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级处理率的算术平均，而是分子分母分别汇总后相除，相当于加权平均',
  },
  timelyRate: {
    label: '工单及时率(%)',
    caliber: '仅统计本区域自身的在约定时效内完成处理的子单占已处理子单的比例',
    formula: '本区域完成时间未超过约定时效的子单数量 ÷ 本区域已处理量 × 100%',
    source: '工单子单表',
    note: '约定时效 = 子单创建时间 + 对应等级的SLA时长',
    fullCaliber: '全口径及时处理的子单占全口径已处理子单的比例（加权汇总后重新计算）',
    fullFormula: '全口径及时完成量 ÷ 全口径已处理量 × 100%',
    fullSource: '工单子单表（递归汇总后重算）',
    fullNote: '不等于各级及时率的算术平均，派单量大的区域权重更高',
  },
  archiveRate: {
    label: '工单归档率(%)',
    caliber: '仅统计本区域自身的已归档工单占已完成工单的比例',
    formula: '本区域已归档子单数量 ÷ 本区域已处理量 × 100%',
    source: '工单子单表',
    note: '归档指完成处理后的终态确认，包括结果核实和资料归档',
    fullCaliber: '全口径已归档工单占全口径已完成工单的比例（加权汇总后重新计算）',
    fullFormula: '全口径已归档子单数量 ÷ 全口径已处理量 × 100%',
    fullSource: '工单子单表（递归汇总后重算）',
    fullNote: '不等于各级归档率的算术平均，已处理量大的区域权重更高',
  },
  reachRate: {
    label: '触达客户率(%)',
    caliber: '仅统计本区域自身的触达客户数占目标客户数的比例',
    formula: '本区域触达客户数 ÷ 本区域目标客户数 × 100%',
    source: '派生计算',
    note: '分母为本区域目标客户数，若为0则显示"-"',
    fullCaliber: '全口径触达客户数占全口径目标客户数的比例（加权汇总后重新计算）',
    fullFormula: '全口径触达客户数 ÷ 全口径目标客户数 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级触达率的算术平均，目标客户数大的区域权重更高',
  },
  successRate: {
    label: '营销成功率(%)',
    caliber: '仅统计本区域自身的营销成功量占触达客户数的比例',
    formula: '本区域营销成功量 ÷ 本区域触达客户数 × 100%',
    source: '派生计算',
    note: '分母为触达客户数（非目标客户数）',
    fullCaliber: '全口径营销成功量占全口径触达客户数的比例（加权汇总后重新计算）',
    fullFormula: '全口径营销成功量 ÷ 全口径触达客户数 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级成功率的算术平均，触达客户数大的区域权重更高',
  },
};

/** 接单视角口径字典（派单→接单，口径同步替换） */
const RECEIVE_METRICS: Record<ColKey, MetricDef> = {
  dispatched: {
    label: '接单量',
    caliber: '仅统计本区域自身当月接收的子单数量',
    formula: '统计接单区域为本区域且接收时间在当月的子单数量',
    source: '工单子单表',
    note: '不含主单，仅计子单；不含下级区域自行接收的子单；撤单的子单不计入接单量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）当月接收的子单数量之和',
    fullFormula: '本区域接单量 + 直接下级区域的全口径接单量之和（递归至网格级）',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '递归至网格级汇总，即全疆全口径包含省-地市-区县-网格四级的全部接单量；接单全口径统计的是执行责任量，派单全口径统计的是派发行为量，二者含义不同',
  },
  pending: {
    label: '待处理量',
    caliber: '仅统计本区域自身接收的子单中处于待处理状态的数量',
    formula: '统计接单区域为本区域且状态为待处理的子单数量',
    source: '工单子单表',
    note: '仅统计当月接收的子单中的待处理数量，不含历史月份接收但仍未处理的积压单；撤单的子单不计入待处理量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）接收的子单中待处理数量之和',
    fullFormula: '本区域待处理量 + 直接下级区域的全口径待处理量之和',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '全口径待处理量反映整个体系的积压规模；含历史月份接收但截至当月仍未处理的积压单；撤单的子单不计入',
  },
  processed: {
    label: '已处理量',
    caliber: '仅统计本区域自身接收的子单中已完成处理的数量',
    formula: '统计接单区域为本区域且状态为已完成的子单数量',
    source: '工单子单表',
    note: '仅统计当月接收的子单中已完成处理的数量，不含历史月份接收但本月完成的子单（历史月接收本月完成的归入累计口径）；二次派单不算已处理，只有终端执行完毕才算；撤单的子单不计入已处理量',
    fullCaliber: '统计本区域及所有下级区域（递归至最末级）接收的子单中已处理数量之和',
    fullFormula: '本区域已处理量 + 直接下级区域的全口径已处理量之和',
    fullSource: '工单子单表（递归汇总）',
    fullNote: '全口径已处理量反映整个体系的执行产出；含历史月份接收但截至当月累计期内完成处理的子单；二次派单不算已处理，只有终端执行完毕才算',
  },
  target: {
    label: '目标客户数',
    caliber: '仅统计本区域自身接收的子单所圈定的客群总人数',
    formula: '对接单区域为本区域的所有子单的目标客户数求和',
    source: '工单子单表',
    note: '工单创建时确定，后续不变；被二次拆单的子单(isSplit=true)其目标已拆分至下级子单，全口径下仅计叶子子单',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单所圈定客群总人数之和（拆单链路上的中间子单不重复计算）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的目标客户数，避免同一批客户被多级拆单重复计数',
    fullSource: '工单子单表（仅叶子子单汇总）',
    fullNote: '拆单场景下，同一批客户不会因拆单而在全口径中被重复计数',
  },
  reached: {
    label: '触达客户数',
    caliber: '仅统计本区域自身接收的子单中实际触达的客户人数（同一客户去重）',
    formula: '对接单区域为本区域且存在触达记录的客户去重计数',
    source: '子单执行记录表',
    note: '同一客户被多次触达仅计一次；被二次拆单的子单其触达量已从叶子子单向上汇总',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单中触达客户数之和（拆单链路上的中间子单不重复计数）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的触达客户数，被拆单的子单触达量已从叶子子单汇总得出',
    fullSource: '子单执行记录表（仅叶子子单汇总）',
    fullNote: '全口径触达客户数为叶子子单汇总值，避免拆单链重复计数',
  },
  success: {
    label: '营销成功量',
    caliber: '仅统计本区域自身接收的子单中营销结果为成功的客户数',
    formula: '统计接单区域为本区域且营销结果为成功的子单数量',
    source: '子单执行记录表',
    note: '营销成功指客户接受了推荐的产品或方案；被二次拆单的子单其成功量已从叶子子单向上汇总',
    fullCaliber: '统计本区域及所有下级区域内未被二次拆单的叶子子单中营销成功量之和（拆单链路上的中间子单不重复计数）',
    fullFormula: '仅汇总 isSplit=false 的叶子子单的营销成功量，被拆单的子单成功量已从叶子子单汇总得出',
    fullSource: '子单执行记录表（仅叶子子单汇总）',
    fullNote: '全口径营销成功量为叶子子单汇总值，避免拆单链重复计数',
  },
  processingRate: {
    label: '处理率(%)',
    caliber: '仅统计本区域自身的已处理子单占接收子单总量的比例',
    formula: '本区域已处理量 ÷ 本区域接单量 × 100%',
    source: '派生计算',
    note: '分母为本区域接单量，若接单量为0则显示"-"',
    fullCaliber: '全口径已处理量占全口径接单量的比例（加权汇总后重新计算）',
    fullFormula: '全口径已处理量 ÷ 全口径接单量 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级处理率的算术平均，而是分子分母分别汇总后相除，相当于加权平均',
  },
  timelyRate: {
    label: '工单及时率(%)',
    caliber: '仅统计本区域自身的在约定时效内完成处理的子单占已处理子单的比例',
    formula: '本区域完成时间未超过约定时效的子单数量 ÷ 本区域已处理量 × 100%',
    source: '工单子单表',
    note: '约定时效 = 子单创建时间 + 对应等级的SLA时长',
    fullCaliber: '全口径及时处理的子单占全口径已处理子单的比例（加权汇总后重新计算）',
    fullFormula: '全口径及时完成量 ÷ 全口径已处理量 × 100%',
    fullSource: '工单子单表（递归汇总后重算）',
    fullNote: '不等于各级及时率的算术平均，接单量大的区域权重更高',
  },
  archiveRate: {
    label: '工单归档率(%)',
    caliber: '仅统计本区域自身的已归档工单占已完成工单的比例',
    formula: '本区域已归档子单数量 ÷ 本区域已处理量 × 100%',
    source: '工单子单表',
    note: '归档指完成处理后的终态确认，包括结果核实和资料归档',
    fullCaliber: '全口径已归档工单占全口径已完成工单的比例（加权汇总后重新计算）',
    fullFormula: '全口径已归档子单数量 ÷ 全口径已处理量 × 100%',
    fullSource: '工单子单表（递归汇总后重算）',
    fullNote: '不等于各级归档率的算术平均，已处理量大的区域权重更高',
  },
  reachRate: {
    label: '触达客户率(%)',
    caliber: '仅统计本区域自身的触达客户数占目标客户数的比例',
    formula: '本区域触达客户数 ÷ 本区域目标客户数 × 100%',
    source: '派生计算',
    note: '分母为本区域目标客户数，若为0则显示"-"',
    fullCaliber: '全口径触达客户数占全口径目标客户数的比例（加权汇总后重新计算）',
    fullFormula: '全口径触达客户数 ÷ 全口径目标客户数 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级触达率的算术平均，目标客户数大的区域权重更高',
  },
  successRate: {
    label: '营销成功率(%)',
    caliber: '仅统计本区域自身的营销成功量占触达客户数的比例',
    formula: '本区域营销成功量 ÷ 本区域触达客户数 × 100%',
    source: '派生计算',
    note: '分母为触达客户数（非目标客户数）',
    fullCaliber: '全口径营销成功量占全口径触达客户数的比例（加权汇总后重新计算）',
    fullFormula: '全口径营销成功量 ÷ 全口径触达客户数 × 100%',
    fullSource: '派生计算（递归汇总后重算）',
    fullNote: '不等于各级成功率的算术平均，触达客户数大的区域权重更高',
  },
};

/** 指标标签映射（用于图表选择） */
const METRIC_LABEL_MAP: Record<string, string> = {
  dispatched: '派单量', pending: '待处理量', processed: '已处理量',
  target: '目标客户数', reached: '触达客户数', success: '营销成功量',
};

// ==================== 数据 ====================

const xinJiangRegion = provinces.find(p => p.code === '650000')!;

function getCities() { return xinJiangRegion.cities || []; }
function getDistricts(cityCode: string) { return getCities().find(c => c.code === cityCode)?.districts || []; }
function getGrids(cityCode: string, districtCode: string) { return getDistricts(cityCode).find(d => d.code === districtCode)?.grids || []; }

/** 根据6位区域编码找到其所属地市编码 */
function findCityCode(regionCode: string): string {
  const city = getCities().find(c => c.code === regionCode);
  if (city) return city.code;
  for (const c of getCities()) {
    if (c.districts?.some(d => d.code === regionCode)) return c.code;
  }
  for (const c of getCities()) {
    if (c.districts?.some(d => d.grids?.some(g => g.code === regionCode))) return c.code;
  }
  return '';
}

/** 字符串哈希为数字 */
function hashStr(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }
/** 确定性随机 */
function seeded(seed: number | string) { const n = typeof seed === 'string' ? hashStr(seed) : seed; const x = Math.sin(n) * 10000; return x - Math.floor(x); }

// ==================== 子单池 & 口径体系数据生成 ====================

/** 子单状态 */
type SubTicketStatus = 'completed' | 'pending' | 'cancelled';

/** 子单结构 */
interface SubTicket {
  id: string;
  dispatcher: string;  // 派单方区域编码
  receiver: string;    // 接单方区域编码
  status: SubTicketStatus;
  target: number;      // 目标客户数
  reached: number;     // 触达客户数
  success: number;     // 营销成功数
  createdAt: string;   // 创建月份 YYYY-MM
  parentSubTicketId?: string | null;  // 父子单ID（null/undefined=根子单，非拆单产生的子单）
  isSplit?: boolean;                   // 是否被二次拆单（true=非叶子子单；全口径覆盖量指标汇总时排除，避免拆单链重复计数）
}

/** 获取某区域的所有下级区域编码（递归到最末级） */
function getAllDescendantCodes(regionCode: string): string[] {
  const codes: string[] = [];
  const city = getCities().find(c => c.code === regionCode);
  if (city) {
    for (const d of city.districts || []) {
      codes.push(d.code);
      for (const g of d.grids || []) codes.push(g.code);
    }
  }
  for (const c of getCities()) {
    const dist = c.districts?.find(d => d.code === regionCode);
    if (dist) {
      for (const g of dist.grids || []) codes.push(g.code);
    }
  }
  return codes;
}

/** 获取某区域的直接下级区域编码 */
function getDirectChildCodes(regionCode: string): string[] {
  if (regionCode === '650000' || regionCode === '') {
    return getCities().map(c => c.code);
  }
  const city = getCities().find(c => c.code === regionCode);
  if (city) return (city.districts || []).map(d => d.code);
  for (const c of getCities()) {
    const dist = c.districts?.find(d => d.code === regionCode);
    if (dist) return (dist.grids || []).map(g => g.code);
  }
  return [];
}

/** 获取某区域的名称 */
function getRegionName(code: string): string {
  if (code === '650000') return '新疆';
  const city = getCities().find(c => c.code === code);
  if (city) return city.name;
  for (const c of getCities()) {
    const dist = c.districts?.find(d => d.code === code);
    if (dist) return dist.name;
    for (const d of c.districts || []) {
      const grid = d.grids?.find(g => g.code === code);
      if (grid) return grid.name;
    }
  }
  return code;
}

/** 生成子单池 —— 基于实际派单模式 */
function generateSubTicketPool(): SubTicket[] {
  const tickets: SubTicket[] = [];
  let id = 0;
  const mkId = () => `ST-${String(++id).padStart(4, '0')}`;

  const cities = getCities();
  const allMonths = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];

  // 为每个月生成子单
  for (const month of allMonths) {
    const monthSeed = month.charCodeAt(5) * 100 + month.charCodeAt(6);

    // ---- 场景1: 新疆派单到地市 ----
    for (const city of cities) {
      const count = 1 + Math.floor(seeded(monthSeed + parseInt(city.code)) * 3);
      for (let i = 0; i < count; i++) {
        const s = monthSeed + parseInt(city.code) + i;
        const target = 300 + Math.floor(seeded(s + 1) * 500);
        const isCompleted = seeded(s + 2) > 0.25;
        const isCancelled = !isCompleted && seeded(s + 3) < 0.08;
        const status: SubTicketStatus = isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'pending';
        const reached = status === 'completed' ? Math.floor(target * (0.7 + seeded(s + 4) * 0.2)) : 0;
        const success = status === 'completed' ? Math.floor(reached * (0.08 + seeded(s + 5) * 0.07)) : 0;
        tickets.push({ id: mkId(), dispatcher: '650000', receiver: city.code, status, target, reached, success, createdAt: month });
      }
    }

    // ---- 场景2: 新疆直接派单到网格（跨级派单）----
    for (const city of cities.slice(0, 6)) {
      for (const dist of city.districts || []) {
        if (seeded(monthSeed + parseInt(dist.code) * 7) < 0.15) continue; // 15%概率有跨级派单
        const grids = dist.grids || [];
        if (grids.length === 0) continue;
        const grid = grids[Math.floor(seeded(monthSeed + parseInt(dist.code) * 11) * grids.length)];
        const target = 100 + Math.floor(seeded(monthSeed + parseInt(grid.code)) * 200);
        const isCompleted = seeded(monthSeed + parseInt(grid.code) + 1) > 0.3;
        const isCancelled = !isCompleted && seeded(monthSeed + parseInt(grid.code) + 2) < 0.05;
        const status: SubTicketStatus = isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'pending';
        const reached = status === 'completed' ? Math.floor(target * (0.65 + seeded(monthSeed + parseInt(grid.code) + 3) * 0.25)) : 0;
        const success = status === 'completed' ? Math.floor(reached * (0.06 + seeded(monthSeed + parseInt(grid.code) + 4) * 0.08)) : 0;
        tickets.push({ id: mkId(), dispatcher: '650000', receiver: grid.code, status, target, reached, success, createdAt: month });
      }
    }

    // ---- 场景3-4: 地市派单到区县 + 地市直派到网格 ----
    for (const city of cities) {
      for (const dist of city.districts || []) {
        // 地市→区县
        const dCount = 1 + Math.floor(seeded(monthSeed + parseInt(dist.code) * 3) * 2);
        for (let i = 0; i < dCount; i++) {
          const s = monthSeed + parseInt(dist.code) * 3 + i;
          const target = 200 + Math.floor(seeded(s + 1) * 400);
          const isCompleted = seeded(s + 2) > 0.3;
          const isCancelled = !isCompleted && seeded(s + 3) < 0.06;
          const status: SubTicketStatus = isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'pending';
          const reached = status === 'completed' ? Math.floor(target * (0.7 + seeded(s + 4) * 0.2)) : 0;
          const success = status === 'completed' ? Math.floor(reached * (0.07 + seeded(s + 5) * 0.07)) : 0;
          tickets.push({ id: mkId(), dispatcher: city.code, receiver: dist.code, status, target, reached, success, createdAt: month });
        }
        // 地市直派到网格（跨级）
        for (const grid of dist.grids || []) {
          if (seeded(monthSeed + parseInt(grid.code) * 5) < 0.2) continue; // 20%概率
          const target = 80 + Math.floor(seeded(monthSeed + parseInt(grid.code) + 10) * 200);
          const isCompleted = seeded(monthSeed + parseInt(grid.code) + 11) > 0.35;
          const isCancelled = !isCompleted && seeded(monthSeed + parseInt(grid.code) + 12) < 0.05;
          const status: SubTicketStatus = isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'pending';
          const reached = status === 'completed' ? Math.floor(target * (0.65 + seeded(monthSeed + parseInt(grid.code) + 13) * 0.25)) : 0;
          const success = status === 'completed' ? Math.floor(reached * (0.06 + seeded(monthSeed + parseInt(grid.code) + 14) * 0.08)) : 0;
          tickets.push({ id: mkId(), dispatcher: city.code, receiver: grid.code, status, target, reached, success, createdAt: month });
        }
      }
    }

    // ---- 场景5: 区县派单到网格 ----
    for (const city of cities) {
      for (const dist of city.districts || []) {
        for (const grid of dist.grids || []) {
          const gCount = 1 + Math.floor(seeded(monthSeed + parseInt(grid.code) * 2) * 2);
          for (let i = 0; i < gCount; i++) {
            const s = monthSeed + parseInt(grid.code) * 2 + i;
            const target = 60 + Math.floor(seeded(s + 1) * 200);
            const isCompleted = seeded(s + 2) > 0.35;
            const isCancelled = !isCompleted && seeded(s + 3) < 0.04;
            const status: SubTicketStatus = isCompleted ? 'completed' : isCancelled ? 'cancelled' : 'pending';
            const reached = status === 'completed' ? Math.floor(target * (0.7 + seeded(s + 4) * 0.2)) : 0;
            const success = status === 'completed' ? Math.floor(reached * (0.08 + seeded(s + 5) * 0.07)) : 0;
            tickets.push({ id: mkId(), dispatcher: dist.code, receiver: grid.code, status, target, reached, success, createdAt: month });
          }
        }
      }
    }

    // ---- 场景6: 多级拆单链 ----
    // 新疆派1张给地市 → 地市拆为N张给区县 → 区县可能继续拆为M张给网格
    // 关键：拆单时目标客户数是父子单的子集（不凭空增减客户），因此全口径覆盖量=叶子子单之和
    for (const city of cities) {
      if (seeded(monthSeed + parseInt(city.code) * 13) < 0.5) continue; // 50%地市有拆单链
      const districts = city.districts || [];
      if (districts.length < 2) continue;

      // 根子单：新疆→地市（isSplit=true，将被拆单）
      const rootTarget = 300 + Math.floor(seeded(monthSeed + parseInt(city.code) * 17) * 500);
      const rootId = mkId();
      tickets.push({
        id: rootId, dispatcher: '650000', receiver: city.code,
        status: 'completed', target: rootTarget,
        reached: 0, success: 0, // 后处理：从叶子子单向上汇总
        createdAt: month, parentSubTicketId: null, isSplit: true,
      });

      // 二级子单：地市→区县（拆分根子单目标）
      const numDist = 2 + Math.floor(seeded(monthSeed + parseInt(city.code) * 29) * Math.min(districts.length - 2, 2));
      const selectedDists = districts.slice(0, numDist);
      let remaining = rootTarget;

      for (let di = 0; di < selectedDists.length; di++) {
        const dist = selectedDists[di];
        const isLastDist = di === selectedDists.length - 1;
        const distTarget = isLastDist ? remaining : Math.floor(remaining * (0.3 + seeded(monthSeed + parseInt(dist.code) * 31) * 0.4));
        remaining -= distTarget;

        const distId = mkId();
        const grids = dist.grids || [];
        const distIsSplit = grids.length >= 2 && seeded(monthSeed + parseInt(dist.code) * 43) > 0.5;

        tickets.push({
          id: distId, dispatcher: city.code, receiver: dist.code,
          status: 'completed', target: distTarget,
          reached: 0, success: 0,
          createdAt: month, parentSubTicketId: rootId, isSplit: distIsSplit,
        });

        if (distIsSplit && grids.length >= 2) {
          // 三级子单：区县→网格
          const selectedGrids = grids.slice(0, Math.min(grids.length, 2 + Math.floor(seeded(monthSeed + parseInt(dist.code) * 47) * 2)));
          let gridRemaining = distTarget;
          for (let gi = 0; gi < selectedGrids.length; gi++) {
            const grid = selectedGrids[gi];
            const isLastGrid = gi === selectedGrids.length - 1;
            const gridTarget = isLastGrid ? gridRemaining : Math.floor(gridRemaining * (0.3 + seeded(monthSeed + parseInt(grid.code) * 53) * 0.4));
            gridRemaining -= gridTarget;
            const leafReached = Math.floor(gridTarget * (0.7 + seeded(monthSeed + parseInt(grid.code) * 59) * 0.2));
            const leafSuccess = Math.floor(leafReached * (0.06 + seeded(monthSeed + parseInt(grid.code) * 61) * 0.06));
            tickets.push({
              id: mkId(), dispatcher: dist.code, receiver: grid.code,
              status: 'completed', target: gridTarget,
              reached: leafReached, success: leafSuccess,
              createdAt: month, parentSubTicketId: distId, isSplit: false,
            });
          }
        } else {
          // 区县未继续拆单，此为叶子子单
          const leafReached = Math.floor(distTarget * (0.7 + seeded(monthSeed + parseInt(dist.code) * 37) * 0.2));
          const leafSuccess = Math.floor(leafReached * (0.06 + seeded(monthSeed + parseInt(dist.code) * 41) * 0.06));
          tickets[tickets.length - 1].reached = leafReached;
          tickets[tickets.length - 1].success = leafSuccess;
        }
      }
    }

    // ---- 场景9: 上级自执行 ----
    const selfCount = 2 + Math.floor(seeded(monthSeed + 999) * 4);
    for (let i = 0; i < selfCount; i++) {
      const s = monthSeed + 999 + i;
      const target = 50 + Math.floor(seeded(s + 1) * 200);
      const isCompleted = seeded(s + 2) > 0.3;
      const status: SubTicketStatus = isCompleted ? 'completed' : 'pending';
      const reached = isCompleted ? Math.floor(target * (0.7 + seeded(s + 3) * 0.2)) : 0;
      const success = isCompleted ? Math.floor(reached * (0.1 + seeded(s + 4) * 0.06)) : 0;
      tickets.push({ id: mkId(), dispatcher: '650000', receiver: '650000', status, target, reached, success, createdAt: month });
    }
  }

  return tickets;
}

/** 后处理：计算被拆单的子单的触达/成功量（从叶子子单向上汇总） */
function computeSplitTicketMetrics(tickets: SubTicket[]): void {
  const ticketMap = new Map(tickets.map(t => [t.id, t]));
  const childrenMap = new Map<string, string[]>();
  for (const t of tickets) {
    if (t.parentSubTicketId) {
      if (!childrenMap.has(t.parentSubTicketId)) childrenMap.set(t.parentSubTicketId, []);
      childrenMap.get(t.parentSubTicketId)!.push(t.id);
    }
  }
  // 递归：从叶子向上汇总 reached/success
  function getLeafSum(ticketId: string): { reached: number; success: number } {
    const t = ticketMap.get(ticketId)!;
    const childIds = childrenMap.get(ticketId);
    if (!childIds || childIds.length === 0 || !t.isSplit) {
      return { reached: t.reached, success: t.success };
    }
    let reached = 0, success = 0;
    for (const cid of childIds) {
      const r = getLeafSum(cid);
      reached += r.reached;
      success += r.success;
    }
    return { reached, success };
  }
  for (const t of tickets) {
    if (t.isSplit) {
      const r = getLeafSum(t.id);
      t.reached = r.reached;
      t.success = r.success;
    }
  }
}

/** 全局子单池（页面生命周期内只生成一次，含拆单链后处理） */
const SUB_TICKET_POOL = (() => {
  const tickets = generateSubTicketPool();
  computeSplitTicketMetrics(tickets);
  return tickets;
})();

/** 从子单列表计算一组数量指标 */
function aggregateMetrics(tickets: SubTicket[]): {
  dispatched: number; received: number; pending: number; processed: number; cancelled: number;
  target: number; reached: number; success: number;
} {
  let dispatched = 0, pending = 0, processed = 0, cancelled = 0;
  let target = 0, reached = 0, success = 0;
  for (const t of tickets) {
    dispatched++;
    target += t.target;
    if (t.status === 'completed') {
      processed++;
      reached += t.reached;
      success += t.success;
    } else if (t.status === 'pending') {
      pending++;
    } else if (t.status === 'cancelled') {
      cancelled++;
      // 撤单：派单视角计派单量和目标客户，不计待处理/已处理/触达/成功
      // 但目标客户照计（派发时已有目标）
    }
  }
  return { dispatched, received: 0, pending, processed, cancelled, target, reached, success };
}

/** 从子单列表计算接单视角的数量指标（撤单不计入接单量） */
function aggregateReceiveMetrics(tickets: SubTicket[]): {
  dispatched: number; received: number; cancelled: number;
  pending: number; processed: number;
  target: number; reached: number; success: number;
} {
  let received = 0, pending = 0, processed = 0;
  let target = 0, reached = 0, success = 0;
  for (const t of tickets) {
    if (t.status === 'cancelled') continue; // 撤单不计入接单
    received++;
    target += t.target;
    if (t.status === 'completed') {
      processed++;
      reached += t.reached;
      success += t.success;
    } else if (t.status === 'pending') {
      pending++;
    }
  }
  return { received, dispatched: 0, cancelled: 0, pending, processed, target, reached, success } as const;
}

/** 从子单列表计算覆盖量指标（仅叶子子单，用于全口径覆盖量汇总，避免拆单链重复计数） */
function aggregateLeafCoverageMetrics(tickets: SubTicket[], perspective: 'dispatch' | 'receive' = 'dispatch'): {
  target: number; reached: number; success: number;
} {
  let target = 0, reached = 0, success = 0;
  for (const t of tickets) {
    if (t.isSplit) continue; // 非叶子子单不计数（其目标客户已被子子单继承）
    if (perspective === 'receive' && t.status === 'cancelled') continue; // 撤单不计入接单
    target += t.target; // 派单视角：撤单的叶子子单目标照计（派发动作不可撤销）
    if (t.status === 'completed') {
      reached += t.reached;
      success += t.success;
    }
  }
  return { target, reached, success };
}

/** 获取某区域在组织树下的所有下级区域编码（递归到最末级） */
function getSubTreeCodes(regionCode: string): string[] {
  const codes: string[] = [];
  function walk(code: string) {
    const children = getDirectChildCodes(code);
    for (const child of children) {
      codes.push(child);
      walk(child);
    }
  }
  walk(regionCode);
  return codes;
}

/** 派单视角：计算某区域的本级数据 */
function computeDispatchOwnLevel(tickets: SubTicket[], regionCode: string, month?: string): Record<string, number> {
  let filtered = tickets.filter(t => t.dispatcher === regionCode);
  if (month) filtered = filtered.filter(t => t.createdAt === month);
  const m = aggregateMetrics(filtered);
  return {
    monthDispatched: m.dispatched,
    monthPending: m.pending,
    monthProcessed: m.processed,
    monthCancelled: m.cancelled,
    monthTarget: m.target,
    monthReached: m.reached,
    monthSuccess: m.success,
    monthProcessingRate: m.dispatched > 0 ? m.processed / m.dispatched : 0,
    monthSuccessRate: m.reached > 0 ? m.success / m.reached : 0,
  };
}

/** 接单视角：计算某区域的本级数据 */
function computeReceiveOwnLevel(tickets: SubTicket[], regionCode: string, month?: string): Record<string, number> {
  let filtered = tickets.filter(t => t.receiver === regionCode && t.status !== 'cancelled');
  if (month) filtered = filtered.filter(t => t.createdAt === month);
  const m = aggregateReceiveMetrics(filtered);
  return {
    monthDispatched: m.received, // 接单视角下"派单量"列显示接单量
    monthPending: m.pending,
    monthProcessed: m.processed,
    monthCancelled: 0, // 接单视角无撤单
    monthTarget: m.target,
    monthReached: m.reached,
    monthSuccess: m.success,
    monthProcessingRate: m.received > 0 ? m.processed / m.received : 0,
    monthSuccessRate: m.reached > 0 ? m.success / m.reached : 0,
  };
}

/** 生成月度趋势数据（1~6月） */
function generateMonthlyTrend(
  regionCode: string, regionName: string, canDrillDown: boolean,
  perspective: 'dispatch' | 'receive'
): RowData[] {
  const months = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
  const computeOwn = perspective === 'dispatch' ? computeDispatchOwnLevel : computeReceiveOwnLevel;

  const rows: RowData[] = [];
  let cumD = 0, cumP = 0, cumPr = 0, cumC = 0, cumT = 0, cumR = 0, cumS = 0;

  for (const month of months) {
    const own = computeOwn(SUB_TICKET_POOL, regionCode, month);
    cumD += own.monthDispatched;
    cumP += own.monthPending;
    cumPr += own.monthProcessed;
    cumC += own.monthCancelled;
    cumT += own.monthTarget;
    cumR += own.monthReached;
    cumS += own.monthSuccess;

    rows.push({
      regionCode,
      regionName,
      statMonth: month,
      canDrillDown,
      statTime: month,
      monthDispatched: own.monthDispatched,
      monthPending: own.monthPending,
      monthProcessed: own.monthProcessed,
      monthCancelled: own.monthCancelled,
      monthTarget: own.monthTarget,
      monthReached: own.monthReached,
      monthSuccess: own.monthSuccess,
      monthProcessingRate: own.monthProcessingRate,
      monthTimelyRate: own.monthProcessed > 0 ? 0.8 + seeded(month + regionCode + 'timely') * 0.18 : 0,
      monthArchiveRate: own.monthProcessed > 0 ? 0.85 + seeded(month + regionCode + 'archive') * 0.14 : 0,
      monthReachRate: own.monthTarget > 0 ? own.monthReached / own.monthTarget : 0,
      monthSuccessRate: own.monthSuccessRate,
      cumDispatched: cumD,
      cumPending: cumP,
      cumProcessed: cumPr,
      cumCancelled: cumC,
      cumTarget: cumT,
      cumReached: cumR,
      cumSuccess: cumS,
      cumProcessingRate: cumD > 0 ? cumPr / cumD : 0,
      cumTimelyRate: cumPr > 0 ? 0.82 + seeded(month + regionCode + 'ctimely') * 0.16 : 0,
      cumArchiveRate: cumPr > 0 ? 0.87 + seeded(month + regionCode + 'carchive') * 0.12 : 0,
      cumReachRate: cumT > 0 ? cumR / cumT : 0,
      cumSuccessRate: cumR > 0 ? cumS / cumR : 0,
    });
  }
  return rows;
}

/** 生成下钻数据（下级区域） */
function generateDrillDownData(
  parentCode: string, month: string,
  perspective: 'dispatch' | 'receive'
): RowData[] {
  const computeOwn = perspective === 'dispatch' ? computeDispatchOwnLevel : computeReceiveOwnLevel;
  const childCodes = getDirectChildCodes(parentCode);
  const rows: RowData[] = [];

  for (const code of childCodes) {
    const name = getRegionName(code);
    const canDrill = getDirectChildCodes(code).length > 0;
    const own = computeOwn(SUB_TICKET_POOL, code, month);
    // 注意：全口径计算在 applyFullScope 中统一处理

    // 累计口径：年初至当月逐月累加
    const cumMonths = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'].filter(m => m <= month);
    let cumD = 0, cumP = 0, cumPr = 0, cumC = 0, cumT = 0, cumR = 0, cumS = 0;
    for (const cm of cumMonths) {
      const cOwn = computeOwn(SUB_TICKET_POOL, code, cm);
      cumD += cOwn.monthDispatched;
      cumP += cOwn.monthPending;
      cumPr += cOwn.monthProcessed;
      cumC += cOwn.monthCancelled;
      cumT += cOwn.monthTarget;
      cumR += cOwn.monthReached;
      cumS += cOwn.monthSuccess;
    }

    rows.push({
      regionCode: code,
      regionName: name,
      statMonth: month,
      canDrillDown: canDrill,
      statTime: month,
      monthDispatched: own.monthDispatched,
      monthPending: own.monthPending,
      monthProcessed: own.monthProcessed,
      monthCancelled: own.monthCancelled,
      monthTarget: own.monthTarget,
      monthReached: own.monthReached,
      monthSuccess: own.monthSuccess,
      monthProcessingRate: own.monthProcessingRate,
      monthTimelyRate: own.monthProcessed > 0 ? 0.8 + seeded(month + code + 'timely') * 0.18 : 0,
      monthArchiveRate: own.monthProcessed > 0 ? 0.85 + seeded(month + code + 'archive') * 0.14 : 0,
      monthReachRate: own.monthTarget > 0 ? own.monthReached / own.monthTarget : 0,
      monthSuccessRate: own.monthSuccessRate,
      cumDispatched: cumD,
      cumPending: cumP,
      cumProcessed: cumPr,
      cumCancelled: cumC,
      cumTarget: cumT,
      cumReached: cumR,
      cumSuccess: cumS,
      cumProcessingRate: cumD > 0 ? cumPr / cumD : 0,
      cumTimelyRate: cumPr > 0 ? 0.82 + seeded(month + code + 'ctimely') * 0.16 : 0,
      cumArchiveRate: cumPr > 0 ? 0.87 + seeded(month + code + 'carchive') * 0.12 : 0,
      cumReachRate: cumT > 0 ? cumR / cumT : 0,
      cumSuccessRate: cumR > 0 ? cumS / cumR : 0,
    });
  }
  return rows;
}

/** 全口径：基于子单池按组织树递归汇总，替换本级字段为全口径值 */
function applyFullScope(rows: RowData[], perspective: 'dispatch' | 'receive' = 'dispatch'): RowData[] {
  const months = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
  return rows.map(row => {
    const code = row.regionCode;
    const allDescCodes = getSubTreeCodes(code);
    const allCodes = [code, ...allDescCodes];

    // 当月全口径 - 行为量（全部子单递归汇总）
    const month = row.statMonth || '2026-06';
    const monthTickets = perspective === 'dispatch'
      ? SUB_TICKET_POOL.filter(t => allCodes.includes(t.dispatcher) && t.createdAt === month)
      : SUB_TICKET_POOL.filter(t => t.status !== 'cancelled' && allCodes.includes(t.receiver) && t.createdAt === month);
    const mAgg = perspective === 'dispatch' ? aggregateMetrics(monthTickets) : aggregateReceiveMetrics(monthTickets);

    // 当月全口径 - 覆盖量（仅叶子子单汇总，避免拆单链重复计数）
    const monthLeafTickets = monthTickets.filter(t => !t.isSplit);
    const mLeafAgg = aggregateLeafCoverageMetrics(monthLeafTickets);

    // 累计全口径 - 行为量
    const prevMonths = months.filter(m => m <= month);
    const cumTickets = perspective === 'dispatch'
      ? SUB_TICKET_POOL.filter(t => allCodes.includes(t.dispatcher) && prevMonths.includes(t.createdAt))
      : SUB_TICKET_POOL.filter(t => t.status !== 'cancelled' && allCodes.includes(t.receiver) && prevMonths.includes(t.createdAt));
    const cAgg = perspective === 'dispatch' ? aggregateMetrics(cumTickets) : aggregateReceiveMetrics(cumTickets);

    // 累计全口径 - 覆盖量
    const cumLeafTickets = cumTickets.filter(t => !t.isSplit);
    const cLeafAgg = aggregateLeafCoverageMetrics(cumLeafTickets);

    const mDenom = perspective === 'dispatch' ? mAgg.dispatched : mAgg.received;
    const cDenom = perspective === 'dispatch' ? cAgg.dispatched : cAgg.received;

    return {
      ...row,
      // 行为量指标：全部子单递归汇总
      monthDispatched: perspective === 'dispatch' ? mAgg.dispatched : mAgg.received,
      monthPending: mAgg.pending,
      monthProcessed: mAgg.processed,
      monthCancelled: perspective === 'dispatch' ? mAgg.cancelled : 0,
      // 覆盖量指标：仅叶子子单汇总（避免拆单链重复计数）
      monthTarget: mLeafAgg.target,
      monthReached: mLeafAgg.reached,
      monthSuccess: mLeafAgg.success,
      // 率值：行为量率值用行为量分母，覆盖量率值用覆盖量分母
      monthProcessingRate: mDenom > 0 ? mAgg.processed / mDenom : 0,
      monthTimelyRate: mAgg.processed > 0 ? 0.8 + seeded(code + 'ftimely') * 0.18 : 0,
      monthArchiveRate: mAgg.processed > 0 ? 0.85 + seeded(code + 'farchive') * 0.14 : 0,
      monthReachRate: mLeafAgg.target > 0 ? mLeafAgg.reached / mLeafAgg.target : 0,
      monthSuccessRate: mLeafAgg.reached > 0 ? mLeafAgg.success / mLeafAgg.reached : 0,
      // 累计：同理
      cumDispatched: perspective === 'dispatch' ? cAgg.dispatched : cAgg.received,
      cumPending: cAgg.pending,
      cumProcessed: cAgg.processed,
      cumCancelled: perspective === 'dispatch' ? cAgg.cancelled : 0,
      cumTarget: cLeafAgg.target,
      cumReached: cLeafAgg.reached,
      cumSuccess: cLeafAgg.success,
      cumProcessingRate: cDenom > 0 ? cAgg.processed / cDenom : 0,
      cumTimelyRate: cAgg.processed > 0 ? 0.82 + seeded(code + 'cftimely') * 0.16 : 0,
      cumArchiveRate: cAgg.processed > 0 ? 0.87 + seeded(code + 'cfarchive') * 0.12 : 0,
      cumReachRate: cLeafAgg.target > 0 ? cLeafAgg.reached / cLeafAgg.target : 0,
      cumSuccessRate: cLeafAgg.reached > 0 ? cLeafAgg.success / cLeafAgg.reached : 0,
    };
  });
}



// ==================== 页面组件 ====================

export default function WorkorderAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'manage' | 'produce'>('all');
  const [statTab, setStatTab] = useState<'dispatch' | 'receive'>('dispatch');
  const [dataScope, setDataScope] = useState<'own' | 'full'>('own');
  const [drillPath, setDrillPath] = useState<DrillLevel[]>([{ level: 1, regionCode: '650000', regionName: '新疆' }]);
  const [viewMode, setViewMode] = useState<'trend' | 'drilled'>('trend');
  const [drillMonth, setDrillMonth] = useState('2026-06');
  const [trendMetric, setTrendMetric] = useState('dispatched');
  const [regionMetric, setRegionMetric] = useState('dispatched');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  // 区域选择器 — 与下钻路径联动


  // 从 drillPath 同步选择器状态


  const currentLevel = drillPath.length;
  const currentRegionCode = drillPath[drillPath.length - 1].regionCode;
  const currentRegionName = drillPath[drillPath.length - 1].regionName;
  const childLevelLabel = currentLevel === 1 ? '地市' : currentLevel === 2 ? '区县' : '网格';

  // ---- 数据 ----
  const tableData = useMemo(() => {
    let rows: RowData[];
    if (viewMode === 'trend') {
      const canDrill = currentLevel < 4;
      rows = generateMonthlyTrend(currentRegionCode, currentRegionName, canDrill, statTab);
    } else {
      rows = generateDrillDownData(currentRegionCode, drillMonth, statTab);
    }
    // 全口径：基于子单池按组织树递归汇总
    if (dataScope === 'full') {
      rows = applyFullScope(rows, statTab);
    }
    return rows;
  }, [viewMode, currentRegionCode, currentRegionName, drillMonth, dataScope, currentLevel, statTab]);

  // 辅助：从 RowData 按动态 key 取数值
  const getRowNum = (r: RowData, prefix: 'month' | 'cum', field: string) =>
    (r as unknown as Record<string, number | string>)[`${prefix}${field.charAt(0).toUpperCase()}${field.slice(1)}`] as number;

  // 趋势图数据
  const trendChartData = useMemo(() => {
    if (viewMode === 'trend') {
      return [...tableData].reverse().map(r => ({
        month: r.statMonth,
        value: getRowNum(r, 'month', trendMetric),
      }));
    }
    const trendRows = generateMonthlyTrend(currentRegionCode, currentRegionName, currentLevel < 4, statTab);
    return [...trendRows].reverse().map(r => ({
      month: r.statMonth,
      value: getRowNum(r, 'month', trendMetric),
    }));
  }, [tableData, viewMode, currentRegionCode, currentRegionName, trendMetric, currentLevel, statTab]);

  // 区域对比图数据（始终展示下级区域的最新月数据对比，全口径模式下同步应用）
  const regionCompareChartData = useMemo(() => {
    let drillRows = generateDrillDownData(currentRegionCode, '2026-06', statTab);
    if (dataScope === 'full') {
      drillRows = applyFullScope(drillRows, statTab);
    }
    return drillRows.map(r => ({
      region: r.regionName,
      fullName: r.regionName,
      value: getRowNum(r, 'month', regionMetric),
    }));
  }, [currentRegionCode, regionMetric, statTab, dataScope]);

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
    const currentMetrics = statTab === 'dispatch' ? DISPATCH_METRICS : RECEIVE_METRICS;
    const monthLabels = ALL_COL_KEYS.map(k => {
      const m = currentMetrics[k];
      return statTab === 'receive' && m.label.includes('派单') ? m.label.replace('派单', '接单') : m.label;
    });
    const cumLabels = ALL_COL_KEYS.map(k => {
      const m = currentMetrics[k];
      const base = statTab === 'receive' && m.label.includes('派单') ? m.label.replace('派单', '接单') : m.label;
      return `${base}(累计)`;
    });

    const headerRow1 = ['归属区域', '统计月份', '当月', ...Array(ALL_COL_KEYS.length - 1).fill(''), '累计', ...Array(ALL_COL_KEYS.length - 1).fill(''), '统计时间', '操作'];
    const headerRow2 = ['', '', ...monthLabels, ...cumLabels, '', ''];

    const dataRows = tableData.map(row => [
      row.regionName, row.statMonth,
      row.monthDispatched, row.monthPending, row.monthProcessed, row.monthTarget, row.monthReached, row.monthSuccess,
      fmtPct(row.monthProcessingRate), fmtPct(row.monthTimelyRate), fmtPct(row.monthArchiveRate), fmtPct(row.monthReachRate), fmtPct(row.monthSuccessRate),
      row.cumDispatched, row.cumPending, row.cumProcessed, row.cumTarget, row.cumReached, row.cumSuccess,
      fmtPct(row.cumProcessingRate), fmtPct(row.cumTimelyRate), fmtPct(row.cumArchiveRate), fmtPct(row.cumReachRate), fmtPct(row.cumSuccessRate),
      row.statTime, '工单列表',
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
    XLSX.utils.book_append_sheet(wb, ws, statTab === 'dispatch' ? '派单统计' : '接单统计');
    const fileName = `工单分析_${statTab === 'dispatch' ? '派单统计' : '接单统计'}_${dataScope === 'own' ? '本级统计' : '全口径统计'}_${currentRegionName}_${viewMode === 'trend' ? '趋势' : drillMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ---- 辅助 ----
  const fmtNum = (v: number | undefined) => (v == null || v === 0 ? '-' : v.toLocaleString());
  const fmtPct = (v: number | undefined) => (v == null || v === 0 ? '-' : v.toFixed(1) + '%');

  const currentMetrics = statTab === 'dispatch' ? DISPATCH_METRICS : RECEIVE_METRICS;

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
          <span className="font-medium text-foreground">工单分析</span>
        </div>

        {/* Tab切换 + 下钻路径 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 shrink-0">
            {([{ key: 'all', label: '全部' }, { key: 'manage', label: '管理类' }, { key: 'produce', label: '生产类' }] as const).map((tab) => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${activeTab === tab.key ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {drillPath.length > 1 && (
            <div className="flex items-center gap-1 text-sm border-l pl-4 border-border">
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
                  <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatched">{statTab === 'dispatch' ? '派单量' : '接单量'}</SelectItem>
                    <SelectItem value="processed">已处理量</SelectItem>
                    <SelectItem value="pending">待处理量</SelectItem>
                    <SelectItem value="target">目标客户数</SelectItem>
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
                    <Area type="monotone" dataKey="value" name={METRIC_LABEL_MAP[trendMetric] || '派单量'} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
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
                  <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dispatched">{statTab === 'dispatch' ? '派单量' : '接单量'}</SelectItem>
                    <SelectItem value="processed">已处理量</SelectItem>
                    <SelectItem value="pending">待处理量</SelectItem>
                    <SelectItem value="target">目标客户数</SelectItem>
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
                        <Bar dataKey="value" name={METRIC_LABEL_MAP[regionMetric] || '派单量'} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
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

        {/* 工单月指标表格区 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* 派单/接单Tab */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  <button onClick={() => { setStatTab('dispatch'); setCurrentPage(1); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statTab === 'dispatch' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                    派单统计
                  </button>
                  <button onClick={() => { setStatTab('receive'); setCurrentPage(1); }}
                    className={`px-4 py-1.5 text-sm rounded-md transition-colors ${statTab === 'receive' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                    接单统计
                  </button>
                </div>
                {/* 数据范围切换 */}
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
                          例如：新疆全口径派单量 = 新疆本级派单量 + 16地市全口径派单量之和（各地市全口径又包含其区县、网格数据）<br /><br />
                          <b>派单全口径与接单全口径含义不同：</b><br />
                          · 派单全口径 = 本区域及下级区域一共<b>派发</b>了多少单（统计派发行为量）<br />
                          · 接单全口径 = 本区域及下级区域一共<b>接收执行</b>了多少单（统计管理范围内的执行责任量）<br />
                          · 跨级派单时，中间层级在派单全口径下可能看不到上级直派到辖区下级的单，但在接单全口径下可以看到<br /><br />
                          <b>行为量 vs 覆盖量：</b><br />
                          · 派单量/待处理/已处理 = 行为量，全口径按全部子单递归汇总（每次派发是独立行为）<br />
                          · 目标客户数/触达客户数/营销成功量 = 覆盖量，全口径仅按叶子子单汇总（同一批客户不会因拆单重复计数）<br />
                          · 例：新疆派800人给乌鲁木齐，乌鲁木齐拆成500+300给天山区和沙区 → 全口径目标客户数仍为800而非1600<br /><br />
                          <b>补充口径规则：</b><br />
                          · 二次派单不算已处理，只有终端执行完毕才算已处理；每级只算直属一级子单<br />
                          · 撤单的子单：派单量照计（派发动作不可撤销），但不计入待处理量也不计入已处理量；接单方不计入接单量
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
              <table className="w-full text-xs border-collapse min-w-[1600px]">
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
                  {/* 累计（年初至当月） */}
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
                    const m = currentMetrics[key];
                    const label = statTab === 'receive' && m.label.includes('派单') ? m.label.replace('派单', '接单') : m.label;
                    const isFull = dataScope === 'full';
                    return (
                      <th key={`month-${key}`}
                        className={`px-2 py-1.5 text-center font-medium text-foreground whitespace-nowrap bg-blue-50/50 dark:bg-blue-950/20 ${idx < ALL_COL_KEYS.length - 1 ? 'border-r border-border' : 'border-r border-border'}`}>
                        <div className="flex items-center justify-center gap-0.5">
                          {label}
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
                    const m = currentMetrics[key];
                    const label = statTab === 'receive' && m.label.includes('派单') ? m.label.replace('派单', '接单') : m.label;
                    const isFull = dataScope === 'full';
                    return (
                      <th key={`cum-${key}`}
                        className={`px-2 py-1.5 text-center font-medium text-foreground whitespace-nowrap bg-amber-50/50 dark:bg-amber-950/20 ${idx < ALL_COL_KEYS.length - 1 ? 'border-r border-border' : ''}`}>
                        <div className="flex items-center justify-center gap-0.5">
                          {label}
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
                            {isRate ? fmtPct(val) : (key === 'pending' && val > 0
                              ? <span className="text-amber-600 font-medium">{fmtNum(val)}</span>
                              : key === 'processed' && val > 0
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
                        <button className="text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5 text-xs whitespace-nowrap">
                          <List className="w-3 h-3 shrink-0" />
                          工单列表
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
    </TooltipProvider>
  );
}
