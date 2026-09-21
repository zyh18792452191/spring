'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { maskPhone } from '@/lib/mask';
import { useTabs } from '@/contexts/TabsContext';
import { getDispatchTypeByLabel } from '@/lib/dispatch-system';
import { generateSharedWorkOrders, SCRIPT_MARKETING_PENDING_ORDERS } from '@/lib/shared-work-orders';
import {
  Search,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Play,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ==================== 类型定义 ====================

type TabKey = 'initiated' | 'todo' | 'todoMonth' | 'toClaim' | 'done' | 'reassigned';

interface TabItem {
  key: TabKey;
  label: string;
  count?: number;
  color?: string; // 数量标签背景色
}

type WorkOrderStatus = 'processing' | 'completed';
type FlowStatus = 'inProgress' | 'completed';
type TimeoutStatus = 'normal' | 'timeout';
type ProcessResult = 'success' | 'failure' | null;

interface WorkOrder {
  id: string;
  title: string;
  type: string;
  alertType?: string; // 预警类型（仅预警调度工单有值）
  businessScene?: string; // 业务类型（仅保有任务工单有值）
  executionMode?: string; // 执行模式（仅保有任务工单有值）
  description: string;
  orderStatus: WorkOrderStatus;
  flowStatus: FlowStatus;
  timeoutStatus: TimeoutStatus;
  processResult: ProcessResult;
  customerPhone: string;
  currentStep: string;
  currentHandler: string;
  city: string;
  district: string;
  grid: string;
  updateTime: string;
  creator: string;
  createTime: string;
}

// ==================== 新疆区域数据 ====================

const xingjiangCities = [
  { name: '乌鲁木齐', districts: ['天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区', '米东区', '乌鲁木齐县'] },
  { name: '克拉玛依', districts: ['独山子区', '克拉玛依区', '白碱滩区', '乌尔禾区'] },
  { name: '吐鲁番', districts: ['高昌区', '鄯善县', '托克逊县'] },
  { name: '哈密', districts: ['伊州区', '巴里坤县', '伊吾县'] },
  { name: '昌吉', districts: ['昌吉市', '阜康市', '呼图壁县', '玛纳斯县', '奇台县', '吉木萨尔县', '木垒县'] },
  { name: '博州', districts: ['博乐市', '阿拉山口市', '精河县', '温泉县'] },
  { name: '巴州', districts: ['库尔勒市', '轮台县', '尉犁县', '若羌县', '且末县', '焉耆县', '和静县', '和硕县', '博湖县'] },
  { name: '阿克苏', districts: ['阿克苏市', '库车市', '温宿县', '沙雅县', '新和县', '拜城县', '乌什县', '阿瓦提县', '柯坪县'] },
  { name: '克州', districts: ['阿图什市', '阿克陶县', '阿合奇县', '乌恰县'] },
  { name: '喀什', districts: ['喀什市', '疏附县', '疏勒县', '英吉沙县', '泽普县', '莎车县', '叶城县', '麦盖提县', '岳普湖县', '伽师县', '巴楚县', '塔什库尔干县'] },
  { name: '和田', districts: ['和田市', '和田县', '墨玉县', '皮山县', '洛浦县', '策勒县', '于田县', '民丰县'] },
  { name: '伊犁', districts: ['伊宁市', '奎屯市', '霍尔果斯市', '伊宁县', '察布查尔县', '霍城县', '巩留县', '新源县', '昭苏县', '特克斯县', '尼勒克县'] },
  { name: '塔城', districts: ['塔城市', '乌苏市', '额敏县', '沙湾市', '托里县', '裕民县', '和布克赛尔县'] },
  { name: '阿勒泰', districts: ['阿勒泰市', '布尔津县', '富蕴县', '福海县', '哈巴河县', '青河县', '吉木乃县'] },
  { name: '奎屯', districts: ['奎屯市区', '开干齐乡'] },
  { name: '石河子', districts: ['新城街道', '向阳街道', '红山街道', '老街街道', '东城街道', '北泉镇', '石河子镇'] },
];

const gridNames = [
  '南塔网格', '红庙子网格', '友好路网格', '喀什东路网格',
  '北京路网格', '建设路网格', '新华路网格', '解放路网格',
  '天山路网格', '胜利路网格', '团结路网格', '幸福路网格',
];

// ==================== 工单类型（两级分类） ====================

const workOrderCategoryMap: Record<string, string[]> = {
  '管理类': ['指标调度', '预警规则审批', '督办调度'],
  '生产类': ['策略调度', '客群调度', '商机调度', '区域攻坚调度', '预警调度', '保有任务调度'],
};

const workOrderCategories = Object.keys(workOrderCategoryMap);

const allWorkOrderTypes = Object.values(workOrderCategoryMap).flat();

// 根据二级类型反查一级分类
function getCategoryByType(type: string): string {
  for (const [cat, types] of Object.entries(workOrderCategoryMap)) {
    if (types.includes(type)) return cat;
  }
  return '';
}

// ==================== 模拟数据生成 ====================

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function generateWorkOrders(): Record<TabKey, WorkOrder[]> {
  const now = new Date('2026-06-29T14:00:00');

  // 待办工单 - 27条（全量）/ 152条（一个月）
  const todoOrders: WorkOrder[] = [];
  const todoTemplates = [
    // 保有任务 + 预警规则审批（排最前，方便查看）
    // 预警调度不在工单处理中出现：规则审批通过后系统自动生成→直接分发网格通执行→只在工单查询中可查
    // ===== 待审批（审批环节） =====
    { title: '携转预警-乌鲁木齐', type: '保有任务调度', desc: '高离网风险客群保有维系任务，需审批后执行。', step: '三级经理审批', handler: '新疆区公司三级经理', businessScene: '携转预警', executionMode: '区公司执行' },
    { title: '宽带离网预警-哈密', type: '保有任务调度', desc: '高价值离网预警客群保有任务，需审批后执行。', step: '三级经理审批', handler: '新疆区公司三级经理', businessScene: '宽带离网预警', executionMode: '地市执行' },
    { title: '携转预警规则-全球通客户', type: '预警规则审批', desc: '携转预警规则提交审批，规则生效后将自动触发预警调度。', step: '三级经理审批', handler: '新疆区公司三级经理', alertType: '任务类', businessScene: '携转预警', executionMode: '在线执行' },
    { title: '宽带离网预警规则-全量客户', type: '预警规则审批', desc: '宽带离网预警规则提交审批，审批通过后规则即生效。', step: '三级经理审批', handler: '新疆区公司三级经理', alertType: '任务类', businessScene: '宽带离网预警', executionMode: '分包看管执行' },
    { title: '5G数据流量(MB)未达标', type: '策略调度', desc: '202605月新疆5G数据流量(MB)达2.31亿GB, 环比下降0.02%, 请各网格参照相应策略。', step: '区公司领导审批', handler: '新疆市场部领导', executionMode: 'IOP平台执行' },
    { title: '5G数据流量(MB)未达标', type: '指标调度', desc: '2026年05月新疆5G数据流量(MB)达236737775175.00MB, 环比下降0.02%, 请如下网格参照相应策略对客户进行触达。', step: '指标下发执行', handler: '塔城数据管理员' },
    { title: '当月DOU未达标', type: '客群调度', desc: null, step: '区公司领导审批', handler: '新疆市场部领导', executionMode: 'IOP平台执行' },
    { title: '区域攻坚测试wk005', type: '区域攻坚调度', desc: '【检查策略】暂无匹配策略, 建议提醒营销筛选条件后重试。', step: '区公司领导审批', handler: '新疆运营人员', executionMode: '网格通分发' },
    { title: '区域攻坚测试wk003', type: '区域攻坚调度', desc: '【检查策略】暂无匹配策略, 建议提醒营销筛选条件后重试。', step: '区公司领导审批', handler: '新疆运营人员', executionMode: '网格通分发' },
    { title: '高价值客户保有商机', type: '客户商机调度', desc: '批量勾选高价值客户派单执行。', step: '区公司领导审批', handler: '新疆市场部领导', executionMode: '网格通分发' },
    { title: '4G升5G客群商机', type: '客群商机调度', desc: '圈选4G升5G潜在客群派单执行。', step: '区公司领导审批', handler: '新疆市场部领导', executionMode: '网格通分发' },
    // ===== 待处理（执行环节） =====
    { title: '全球通离网预警-全疆', type: '保有任务调度', desc: '审批通过，待接收执行。', step: '待接收', handler: '乌鲁木齐分公司-张三', businessScene: '全球通离网预警', executionMode: '地市执行' },
    { title: '异动客户预警-喀什', type: '保有任务调度', desc: '审批通过，IOP平台处理中。', step: 'IOP处理', handler: '喀什分公司-李四', businessScene: '异动客户预警', executionMode: '地市执行' },
    { title: '投诉工单预警-吐鲁番', type: '保有任务调度', desc: '审批通过，IOP效果已回传。', step: 'IOP处理', handler: '吐鲁番分公司-王五', businessScene: '投诉工单预警', executionMode: '区公司执行' },
    { title: '累计本地数据流量(MB)未达标', type: '策略调度', desc: '审批通过，IOP平台执行中。', step: 'IOP平台执行', handler: '新疆运营人员', executionMode: 'IOP平台执行' },
    { title: '编辑名称测试0627', type: '指标调度', desc: '审批通过，指标下发执行中。', step: '指标下发执行', handler: '塔城数据管理员', executionMode: '人工处理' },
    { title: '当月DOU未达标', type: '客群调度', desc: null, step: '生成营销群组', handler: null, executionMode: 'IOP平台执行' },
    { title: '当月流量增幅未达标', type: '策略调度', desc: '审批通过，网格通分发中。', step: '网格通分发', handler: '新疆运营人员', executionMode: '网格通分发' },
    { title: '区域攻坚测试wk002', type: '区域攻坚调度', desc: '审批通过，区域攻坚执行中。', step: '网格通分发', handler: '乌鲁木齐运营人员', executionMode: '网格通分发' },
    { title: '区域攻坚测试wk001', type: '区域攻坚调度', desc: '审批通过，区域攻坚执行中。', step: '网格通分发', handler: '克拉玛依运营人员', executionMode: '网格通分发' },
    // ===== 剧本营销待办（审批通过后生成的待办，需发起人在IOP完成配置） =====
    { title: '全球通客户规模保有率未达标-剧本营销', type: '策略调度', desc: '审批通过，需发起剧本营销配置。', step: '剧本营销配置', handler: '新疆运营人员', executionMode: '剧本营销' },
    { title: '当月低频高额超套客户占比未达标-剧本营销', type: '策略调度', desc: '审批通过，需发起剧本营销配置。', step: '剧本营销配置', handler: '新疆运营人员', executionMode: '剧本营销' },
    { title: '高价值离网客群维系调度-剧本营销', type: '客群调度', desc: '审批通过，需发起剧本营销配置。', step: '剧本营销配置', handler: '新疆运营人员', executionMode: '剧本营销' },
  ];

  // 生成全量27条待办
  for (let i = 0; i < 27; i++) {
    const tpl = todoTemplates[i % todoTemplates.length];
    const cityIdx = i % xingjiangCities.length;
    const city = xingjiangCities[cityIdx];
    const districtIdx = i % city.districts.length;
    const district = city.districts[districtIdx];
    const grid = gridNames[i % gridNames.length];
    const dayOffset = i;
    const updateDate = new Date(now.getTime() - dayOffset * 3600000);
    const createDate = new Date(updateDate.getTime() - Math.floor(seededRandom(i * 7) * 3600000));

    todoOrders.push({
      id: String(530000000000000000 + i * 123456789),
      title: tpl.title,
      type: tpl.type,
      alertType: (tpl as { alertType?: string }).alertType,
      businessScene: (tpl as { businessScene?: string }).businessScene,
      executionMode: (tpl as { executionMode?: string }).executionMode,
      description: tpl.desc || '--',
      orderStatus: 'processing',
      flowStatus: 'inProgress',
      timeoutStatus: 'normal',
      processResult: null,
      customerPhone: (tpl.type === '客户商机调度' || tpl.type === '预警调度') ? (i % 3 === 0 ? `138${String(10000000 + i * 1111).slice(0, 8)}` : `139${String(80000000 + i * 5678).slice(0, 8)}`) : '--',
      currentStep: tpl.step,
      currentHandler: tpl.handler || '--',
      city: tpl.type === '预警规则审批' ? '新疆' : city.name,
      district: tpl.type === '预警规则审批' ? '' : district,
      grid: tpl.type === '预警规则审批' ? '' : grid,
      updateTime: formatDate(updateDate),
      creator: '新疆运营人员',
      createTime: formatDate(createDate),
    });
  }

  // 扩展到152条（模拟一个月数据）
  const todoMonthOrders = [...todoOrders];
  for (let i = 27; i < 152; i++) {
    const tpl = todoTemplates[i % todoTemplates.length];
    const cityIdx = i % xingjiangCities.length;
    const city = xingjiangCities[cityIdx];
    const districtIdx = (i * 3) % city.districts.length;
    const district = city.districts[districtIdx];
    const grid = gridNames[(i * 2) % gridNames.length];
    const dayOffset = i;
    const updateDate = new Date(now.getTime() - dayOffset * 86400000);
    const createDate = new Date(updateDate.getTime() - Math.floor(seededRandom(i * 13) * 7200000));

    todoMonthOrders.push({
      id: String(550000000000000000 + i * 987654321),
      title: tpl.title,
      type: tpl.type,
      description: tpl.desc || '--',
      orderStatus: 'processing',
      flowStatus: 'inProgress',
      timeoutStatus: seededRandom(i * 17) > 0.85 ? 'timeout' : 'normal',
      processResult: null,
      customerPhone: (tpl.type === '客户商机调度' || tpl.type === '预警调度') ? (i % 5 === 0 ? `139${String(20000000 + i * 2222).slice(0, 8)}` : `138${String(90000000 + i * 3333).slice(0, 8)}`) : '--',
      currentStep: tpl.step,
      currentHandler: tpl.handler || '新疆运营人员',
      city: tpl.type === '预警规则审批' ? '新疆' : city.name,
      district: tpl.type === '预警规则审批' ? '' : district,
      grid: tpl.type === '预警规则审批' ? '' : grid,
      updateTime: formatDate(updateDate),
      creator: '新疆运营人员',
      createTime: formatDate(createDate),
      alertType: (tpl as { alertType?: string }).alertType,
      businessScene: (tpl as { businessScene?: string }).businessScene,
      executionMode: (tpl as { executionMode?: string }).executionMode,
    });
  }

  // 已办工单 - 4条
  const doneTemplates = [
    // 保有任务 + 预警规则审批（审批在本系统，已审批完成）
    { title: '携转预警-克拉玛依', type: '保有任务调度', desc: '低ARPU高潜力客群保有维系已完成。', step: 'IOP效果回传', result: 'success' as ProcessResult, businessScene: '携转预警', executionMode: '地市执行' },
    { title: '宽带离网预警-阿克苏', type: '保有任务调度', desc: '离网预警客群保有维系已完成。', step: 'IOP效果回传', result: 'success' as ProcessResult, businessScene: '宽带离网预警', executionMode: '区公司执行' },
    { title: '全球通离网预警-博州', type: '保有任务调度', desc: '套餐降档风险客群挽回执行失败。', step: 'IOP效果回传', result: 'failure' as ProcessResult, businessScene: '全球通离网预警', executionMode: '地市执行' },
    { title: '全球通离网预警规则', type: '预警规则审批', desc: '全球通离网预警规则审批已通过，规则已生效。', step: '审批通过', result: 'success' as ProcessResult, alertType: '任务类', businessScene: '全球通离网预警', executionMode: '分包看管执行' },
    // 其他调度类型
    { title: '累计本地数据流量(MB)未达标', type: '策略调度', desc: '新疆累计本地数据流量(MB)达2.67亿GB, 环比下降0.02%, 请各网格参照相应策略对客户进行触达。', step: '生成营销群组', result: 'failure' as ProcessResult },
    { title: '11111', type: '区域攻坚调度', desc: '111111', step: '生成营销群组', result: 'failure' as ProcessResult },
    { title: '累计本地数据流量(MB)未达标', type: '策略调度', desc: '202605月新疆累计本地数据流量(MB)达2.67亿GB, 环比下降0.02%, 请各网格参照相应策略。', step: '网格端/KPI调度', result: null },
    { title: '移动数据流量收入未达标', type: '策略调度', desc: '202605月新疆移动数据流量收入达3.83亿元, 环比上升0.01%, 请各网格参照相应策略对客户进行触达。', step: '网格端/KPI调度', result: null },
  ];
  const doneOrders: WorkOrder[] = doneTemplates.map((tpl, i) => {
    const cityIdx = i % xingjiangCities.length;
    const city = xingjiangCities[cityIdx];
    const districtIdx = i % city.districts.length;
    const district = city.districts[districtIdx];
    const dayOffset = 4 + i * 3;
    const updateDate = new Date(now.getTime() - dayOffset * 86400000);
    const createDate = new Date(updateDate.getTime() - 3600000 - Math.floor(seededRandom(i * 31) * 7200000));

    return {
      id: String(530000000000000000 + (i + 10) * 123456789),
      title: tpl.title,
      type: tpl.type,
      alertType: (tpl as { alertType?: string }).alertType,
      businessScene: (tpl as { businessScene?: string }).businessScene,
      executionMode: (tpl as { executionMode?: string }).executionMode,
      description: tpl.desc,
      orderStatus: tpl.result === 'failure' ? 'processing' : 'completed',
      flowStatus: tpl.result === 'failure' ? 'inProgress' : 'completed',
      timeoutStatus: 'normal',
      processResult: tpl.result,
      customerPhone: (tpl.type === '客户商机调度' || tpl.type === '预警调度') ? `138${String(30000000 + i * 4444).slice(0, 8)}` : '--',
      currentStep: tpl.step,
      currentHandler: '--',
      city: tpl.type === '预警规则审批' ? '新疆' : city.name,
      district: tpl.type === '预警规则审批' ? '' : district,
      grid: tpl.type === '预警规则审批' ? '' : gridNames[(i * 3) % gridNames.length],
      updateTime: formatDate(updateDate),
      creator: '新疆运营人员',
      createTime: formatDate(createDate),
    };
  });

  // 我发起的 - 12条（含3条预警规则审批工单，预警调度是系统自动生成不在此列出）
  const initiatedOrders: WorkOrder[] = [];
  const initiatedTemplates = [
    // 保有任务 + 预警规则审批（排最前）
    { title: '携转预警-乌鲁木齐', type: '保有任务调度', desc: '高离网风险客群保有维系...', businessScene: '携转预警', executionMode: '地市执行' },
    { title: '携转预警规则审批', type: '预警规则审批', desc: '规则WRN20260701001提交审批，待三级经理审批。', alertType: '携转预警' },
    { title: '宽带离网预警规则审批', type: '预警规则审批', desc: '规则WRN20260701003审批已通过，规则已生效。', alertType: '宽带离网预警' },
    { title: '全球通离网预警规则审批', type: '预警规则审批', desc: '规则WRN20260701005审批已驳回，需修改后重新提交。', alertType: '全球通离网预警' },
    // 其他调度类型
    { title: '5G数据流量(MB)未达标', type: '指标调度', desc: '202605月新疆5G数据流量(MB)达236737775175.00MB, 环比下降0.02%...' },
    { title: '当月DOU未达标', type: '客群调度', desc: null },
    { title: '累计本地数据流量(MB)未达标', type: '策略调度', desc: '202605月新疆累计本地数据流量(MB)达2.67亿GB...' },
    { title: '当月流量增幅未达标', type: '策略调度', desc: '202605月新疆当月流量增幅达0.05%, 环比下降39pp...' },
    { title: '移动数据流量收入未达标', type: '策略调度', desc: '202605月新疆移动数据流量收入达3.83亿元, 环比上升0.01%...' },
    { title: '区域攻坚测试wk006', type: '区域攻坚调度', desc: '【检查策略】暂无匹配策略...' },
  ];
  for (let i = 0; i < 12; i++) {
    const tpl = initiatedTemplates[i % initiatedTemplates.length];
    const cityIdx = (i * 2) % xingjiangCities.length;
    const city = xingjiangCities[cityIdx];
    const districtIdx = i % city.districts.length;
    const district = city.districts[districtIdx];
    const dayOffset = i + 1;
    const createDate = new Date(now.getTime() - dayOffset * 86400000);
    const isAlertApproval = tpl.type === '预警规则审批';
    const statuses: WorkOrderStatus[] = ['processing', 'completed', 'processing'];
    const flowStatuses: FlowStatus[] = ['inProgress', 'completed', 'inProgress'];
    const timeouts: TimeoutStatus[] = ['normal', 'normal', 'timeout'];

    // 预警规则审批工单的特殊状态
    let orderStatus: WorkOrderStatus = statuses[i % 3];
    let flowStatus: FlowStatus = flowStatuses[i % 3];
    let currentStep = i % 3 === 1 ? '网格端/KPI调度' : '三级经理审批';
    let currentHandler = i % 3 === 1 ? '--' : '新疆区公司三级经理';
    let processResult: ProcessResult | null = null;
    if (isAlertApproval) {
      if (tpl.title.includes('已通过')) {
        orderStatus = 'completed';
        flowStatus = 'completed';
        currentStep = '审批通过';
        currentHandler = '新疆区公司三级经理';
        processResult = 'success';
      } else if (tpl.title.includes('已驳回')) {
        orderStatus = 'completed';
        flowStatus = 'completed';
        currentStep = '审批驳回';
        currentHandler = '新疆区公司三级经理';
        processResult = 'failure';
      } else {
        orderStatus = 'processing';
        flowStatus = 'inProgress';
        currentStep = '三级经理审批';
        currentHandler = '新疆区公司三级经理';
      }
    }

    initiatedOrders.push({
      id: String(540000000000000000 + i * 876543210),
      title: tpl.title,
      type: tpl.type,
      alertType: (tpl as { alertType?: string }).alertType,
      businessScene: (tpl as { businessScene?: string }).businessScene,
      executionMode: (tpl as { executionMode?: string }).executionMode,
      description: tpl.desc || '--',
      orderStatus,
      flowStatus,
      timeoutStatus: timeouts[i % 3],
      processResult,
      customerPhone: (tpl.type === '客户商机调度' || tpl.type === '预警调度') ? `138${String(20000000 + i * 7777).slice(0, 8)}` : '--',
      currentStep,
      currentHandler,
      city: isAlertApproval ? '新疆' : city.name,
      district: isAlertApproval ? '' : district,
      grid: isAlertApproval ? '' : gridNames[(i * 4) % gridNames.length],
      updateTime: formatDate(new Date(createDate.getTime() + 3600000)),
      creator: '新疆运营人员',
      createTime: formatDate(createDate),
    });
  }

  return {
    initiated: initiatedOrders,
    todo: todoOrders,
    todoMonth: todoMonthOrders,
    toClaim: [],
    done: doneOrders,
    reassigned: [],
  };
}

function isApprovalType(type: string, currentStep?: string): boolean {
  return type === '预警规则审批' || 
    (currentStep?.includes('审批') ?? false) || 
    (currentStep?.includes('领导') ?? false);
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ==================== 数据实例 ====================

// 共享类型→中文标签映射
const sharedTypeLabelMap: Record<string, string> = {
  'indicator': '指标调度',
  'strategy': '策略调度',
  'customer-group': '客群调度',
  'customer-opportunity-dispatch': '客户商机调度',
  'group-opportunity-dispatch': '客群商机调度',
  'region-assault': '区域攻坚调度',
  'alert-dispatch': '预警调度',
  'retention-task': '保有任务调度',
  'alert-approval': '预警规则审批',
};

// 将工作台首页待办数据转换为工单处理页WorkOrder格式
function convertSharedWorkOrdersToProcessFormat(): WorkOrder[] {
  const sharedOrders = generateSharedWorkOrders(80, 'pending');
  const allOrders = [...sharedOrders, ...SCRIPT_MARKETING_PENDING_ORDERS];
  return allOrders.map((order, i): WorkOrder => {
    const cityIdx = i % xingjiangCities.length;
    const city = xingjiangCities[cityIdx];
    const districtIdx = (i * 3) % city.districts.length;
    const district = city.districts[districtIdx];
    const grid = gridNames[(i * 2) % gridNames.length];
    const isScriptMarketing = order.id.startsWith('STR-SM-') || order.id.startsWith('GRP-SM-');
    const steps = isScriptMarketing ? ['剧本营销配置'] :
                  order.type === 'retention-task' ? ['待接收', 'IOP处理'] : 
                  ['网格长执行', 'CRM维系推送', '网格人员抢单', '在线执行'];
    const typeLabel = sharedTypeLabelMap[order.type] || order.type;
    return {
      id: order.id,
      title: isScriptMarketing ? order.title : `${typeLabel}-${city.name}${district}`,
      type: typeLabel,
      description: isScriptMarketing ? '审批通过，需发起剧本营销配置。' : typeLabel,
      orderStatus: 'processing' as const,
      flowStatus: 'inProgress' as const,
      timeoutStatus: (i % 7 === 0 ? 'timeout' : 'normal') as WorkOrder['timeoutStatus'],
      processResult: null,
      customerPhone: '--',
      currentStep: isScriptMarketing ? '剧本营销配置' : steps[i % steps.length],
      currentHandler: isScriptMarketing ? '新疆运营人员' : 
                     order.type === 'retention-task' ? (i % 2 === 0 ? '区公司经理' : '地市经理') : 
                     (i % 3 === 0 ? '网格经理' : '运营人员'),
      city: city.name,
      district,
      grid,
      updateTime: order.createTime,
      creator: '运营人员',
      createTime: order.createTime,
      alertType: order.type === 'alert-dispatch' ? '携转预警' : undefined,
      businessScene: isScriptMarketing ? undefined :
                    order.type === 'alert-dispatch' ? '携转预警' : 
                    order.type === 'retention-task' ? ['携转预警', '宽带离网', '全球通离网', '低值降档', '套餐到期', '异网高优', '零流量沉默', '高频停机', '欠费预警'][i % 9] : undefined,
      executionMode: isScriptMarketing ? '剧本营销' :
                    order.type === 'retention-task' ? (i % 2 === 0 ? '区公司执行' : '地市执行') : undefined,
    };
  });
}

const sharedProcessingOrders = convertSharedWorkOrdersToProcessFormat();

// ==================== 督办调度 mock 数据 ====================

// 待处理子Tab：督办调度回执待提交（点击处理 → 我的督办任务-待执行查看页=submit）
const supervisionProcessingOrders: WorkOrder[] = [
  {
    id: 'SUP-2026-0801',
    title: '乌鲁木齐5G流量提升督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务待执行回执。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待回执',
    currentHandler: '乌鲁木齐运营人员',
    city: '乌鲁木齐',
    district: '',
    grid: '',
    updateTime: '2026-08-05 09:30:00',
    creator: '李主管',
    createTime: '2026-08-05 09:30:00',
  },
  {
    id: 'SUP-2026-0809',
    title: '和田热线商机转化督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务待执行回执。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待回执',
    currentHandler: '和田运营人员',
    city: '和田',
    district: '',
    grid: '',
    updateTime: '2026-07-22 14:30:00',
    creator: '李主管',
    createTime: '2026-07-22 14:30:00',
  },
  {
    id: 'SUP-2026-0813',
    title: '阿克苏中高端客户离网督办',
    type: '督办调度',
    businessScene: '预警工单督办',
    description: '督办任务待执行回执。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待回执',
    currentHandler: '阿克苏运营人员',
    city: '阿克苏',
    district: '',
    grid: '',
    updateTime: '2026-08-08 10:00:00',
    creator: '王经理',
    createTime: '2026-08-06 10:00:00',
  },
  {
    id: 'SUP-2026-0814',
    title: '吐鲁番区域攻坚督办',
    type: '督办调度',
    businessScene: '其他督办任务',
    description: '督办任务待执行回执。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待回执',
    currentHandler: '吐鲁番运营人员',
    city: '吐鲁番',
    district: '',
    grid: '',
    updateTime: '2026-08-07 15:00:00',
    creator: '孙主管',
    createTime: '2026-08-05 15:00:00',
  },
];

// 待处理子Tab：督办任务提交人视角 - 回执已提交待评分（点击处理 → 我的督办任务-待评分查看页=score评分版）
// 状态流转沿用：流程进行中 + 超时状态（正常/已超时），与督办调度既有数据一致
const supervisionScoringOrders: WorkOrder[] = [
  {
    id: 'SUP-2026-0901',
    title: '乌鲁木齐5G流量提升督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务执行回执已提交，待提交人评分。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待评分',
    currentHandler: '新疆市场部领导',
    city: '乌鲁木齐',
    district: '',
    grid: '',
    updateTime: '2026-08-10 11:00:00',
    creator: '李主管',
    createTime: '2026-08-05 09:30:00',
  },
  {
    id: 'SUP-2026-0902',
    title: '喀什全球通保有率督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务执行回执已提交，待提交人评分。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'timeout',
    processResult: null,
    customerPhone: '--',
    currentStep: '待评分',
    currentHandler: '新疆市场部领导',
    city: '喀什',
    district: '',
    grid: '',
    updateTime: '2026-08-04 14:00:00',
    creator: '李主管',
    createTime: '2026-08-04 14:00:00',
  },
  {
    id: 'SUP-2026-0903',
    title: '石河子存量客户保有督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务执行回执已提交，待提交人评分。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'normal',
    processResult: null,
    customerPhone: '--',
    currentStep: '待评分',
    currentHandler: '新疆运营人员',
    city: '石河子',
    district: '',
    grid: '',
    updateTime: '2026-07-25 11:00:00',
    creator: '王经理',
    createTime: '2026-07-20 09:45:00',
  },
  {
    id: 'SUP-2026-0904',
    title: '昌吉异动客户营销督办',
    type: '督办调度',
    businessScene: '其他督办任务',
    description: '督办任务执行回执已提交，待提交人评分。',
    orderStatus: 'processing',
    flowStatus: 'inProgress',
    timeoutStatus: 'timeout',
    processResult: null,
    customerPhone: '--',
    currentStep: '待评分',
    currentHandler: '新疆运营人员',
    city: '昌吉',
    district: '',
    grid: '',
    updateTime: '2026-07-30 15:00:00',
    creator: '陈组长',
    createTime: '2026-07-28 15:45:00',
  },
];

const allData = generateWorkOrders();

// ==================== Tab配置 ====================

const tabs: TabItem[] = [
  { key: 'initiated', label: '我发起的' },
  { key: 'todo', label: '待办', count: 30, color: 'bg-blue-500' },
  { key: 'toClaim', label: '待领', count: 0, color: 'bg-orange-500' },
  { key: 'done', label: '已办' },
  { key: 'reassigned', label: '已转派', color: 'bg-red-500' },
];

// ==================== 状态标签组件 ====================

function StatusBadge({ type, value }: { type: 'order' | 'flow' | 'timeout' | 'result'; value: string }) {
  const config: Record<string, { className: string }> = {
    '待评分': { className: 'bg-orange-500 text-white hover:bg-orange-500' },
    '处理中': { className: 'bg-blue-500 text-white hover:bg-blue-500' },
    '已完成': { className: 'bg-muted text-muted-foreground hover:bg-muted' },
    '进行中': { className: 'bg-blue-500 text-white hover:bg-blue-500' },
    '正常': { className: 'bg-green-500 text-white hover:bg-green-500' },
    '已超时': { className: 'bg-red-500 text-white hover:bg-red-500' },
    '失败': { className: 'bg-muted text-muted-foreground hover:bg-muted' },
    '成功': { className: 'bg-green-500 text-white hover:bg-green-500' },
  };

  const c = config[value] || { className: 'bg-muted text-muted-foreground hover:bg-muted' };
  return <Badge className={cn('text-xs px-2 py-0.5 rounded font-normal', c.className)}>{value}</Badge>;
}

// ==================== 主页面组件 ====================

function DispatchProcessContent() {
  const router = useRouter();
  const { addTab } = useTabs();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam && ['initiated', 'todo', 'toClaim', 'done', 'reassigned'].includes(tabParam) ? tabParam : 'todo');
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<string>('all');
  const [defaultRange, setDefaultRange] = useState<'month' | 'all'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);

  // 合并localStorage提交的工单到模拟数据
  const [mergedData, setMergedData] = useState<Record<TabKey, WorkOrder[]>>(() => {
    const base = generateWorkOrders();
    try {
      const stored = localStorage.getItem('pendingWorkOrders');
      if (stored) {
        const pendingOrders: WorkOrder[] = JSON.parse(stored);
        // 去重：按id判断
        const existingIds = new Set(base.todo.map(o => o.id));
        const newOrders = pendingOrders.filter(o => !existingIds.has(o.id)).map(o => ({
          ...o,
          currentStep: o.currentStep || (o.type === '预警规则审批' || o.type === '保有任务调度' ? '三级经理审批' : '区公司领导审批'),
          currentHandler: o.currentHandler || (o.type === '预警规则审批' || o.type === '保有任务调度' ? '新疆区公司三级经理' : '新疆市场部领导'),
          alertType: o.alertType || (o.type === '预警规则审批' ? '任务类' : ''),
          businessScene: o.businessScene || (o.type === '预警规则审批' ? '携转预警' : o.type === '保有任务调度' ? '携转预警' : ''),
          executionMode: o.executionMode || (o.type === '预警规则审批' ? '在线执行' : o.type === '保有任务调度' ? '地市执行' : ''),
        }));
        if (newOrders.length > 0) {
          base.todo = [...newOrders, ...base.todo];
          base.todoMonth = [...newOrders, ...base.todoMonth];
          base.initiated = [...newOrders, ...base.initiated];
        }
      }
    } catch { /* ignore */ }
    return base;
  });

  // 监听localStorage变化（其他页面写入时触发）
  useEffect(() => {
    const handleStorage = () => {
      const base = generateWorkOrders();
      try {
        const stored = localStorage.getItem('pendingWorkOrders');
        if (stored) {
          const pendingOrders: WorkOrder[] = JSON.parse(stored);
          const existingIds = new Set(base.todo.map(o => o.id));
          const newOrders = pendingOrders.filter(o => !existingIds.has(o.id)).map(o => ({
            ...o,
            currentStep: o.currentStep || (o.type === '预警规则审批' || o.type === '保有任务调度' ? '三级经理审批' : '区公司领导审批'),
            currentHandler: o.currentHandler || (o.type === '预警规则审批' || o.type === '保有任务调度' ? '新疆区公司三级经理' : '新疆市场部领导'),
            alertType: o.alertType || (o.type === '预警规则审批' ? '任务类' : ''),
            businessScene: o.businessScene || (o.type === '预警规则审批' ? '携转预警' : o.type === '保有任务调度' ? '携转预警' : ''),
            executionMode: o.executionMode || (o.type === '预警规则审批' ? '在线执行' : o.type === '保有任务调度' ? '地市执行' : ''),
          }));
          if (newOrders.length > 0) {
            base.todo = [...newOrders, ...base.todo];
            base.todoMonth = [...newOrders, ...base.todoMonth];
            base.initiated = [...newOrders, ...base.initiated];
          }
        }
      } catch { /* ignore */ }
      setMergedData(base);
    };
    window.addEventListener('storage', handleStorage);
    // 页面获得焦点时也刷新（同一标签页不触发storage事件）
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  // 工单类型多选切换
  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // 高级搜索弹窗
  const [advancedOpen, setAdvancedOpen] = useState(false);
  // 工单条件
  const [advOrderStatus, setAdvOrderStatus] = useState<string>('all');
  const [advFlowStatus, setAdvFlowStatus] = useState<string>('all');
  const [advTimeout, setAdvTimeout] = useState<string>('all');
  // 业务条件
  const [advResult, setAdvResult] = useState<string>('all');
  const [advCustomerNo, setAdvCustomerNo] = useState('');
  // 附加条件
  const [advCurrentStep, setAdvCurrentStep] = useState('');
  const [advGrid, setAdvGrid] = useState('');
  const [advUpdateTimeStart, setAdvUpdateTimeStart] = useState('');
  const [advUpdateTimeEnd, setAdvUpdateTimeEnd] = useState('');
  const [advCreator, setAdvCreator] = useState('');
  const [advCreateTimeStart, setAdvCreateTimeStart] = useState('');
  const [advCreateTimeEnd, setAdvCreateTimeEnd] = useState('');
  // 建单侧
  const [advCreateCity, setAdvCreateCity] = useState<string>('all');
  const [advCreateDistrict, setAdvCreateDistrict] = useState<string>('all');
  const [advCreateGrid, setAdvCreateGrid] = useState<string>('all');
  // 接单侧
  const [advReceiveCity, setAdvReceiveCity] = useState<string>('all');
  const [advReceiveDistrict, setAdvReceiveDistrict] = useState<string>('all');
  const [advReceiveGrid, setAdvReceiveGrid] = useState<string>('all');
  // 流程
  const [advProcessName, setAdvProcessName] = useState<string>('all');
  const [advStepName, setAdvStepName] = useState<string>('all');
  // 待办子Tab
  const [todoSubTab, setTodoSubTab] = useState<'processing' | 'approval'>('processing');
  // 折叠状态
  const [collapseOrder, setCollapseOrder] = useState(false);
  const [collapseBiz, setCollapseBiz] = useState(false);
  const [collapseExtra, setCollapseExtra] = useState(false);

  // 建单侧区县联动
  const createDistrictOptions = useMemo(() => {
    if (advCreateCity === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advCreateCity);
    return city ? city.districts : [];
  }, [advCreateCity]);

  const createGridOptions = useMemo(() => {
    if (advCreateCity === 'all' || advCreateDistrict === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advCreateCity);
    if (!city) return [];
    return advCreateDistrict !== 'all' ? [] : []; // 无网格级数据
  }, [advCreateCity, advCreateDistrict]);

  // 接单侧区县联动
  const receiveDistrictOptions = useMemo(() => {
    if (advReceiveCity === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advReceiveCity);
    return city ? city.districts : [];
  }, [advReceiveCity]);

  const receiveGridOptions = useMemo(() => {
    if (advReceiveCity === 'all' || advReceiveDistrict === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advReceiveCity);
    if (!city) return [];
    return []; // 无网格级数据
  }, [advReceiveCity, advReceiveDistrict]);

  // 获取当前Tab的数据
  const currentData = useMemo(() => {
    let data: WorkOrder[] = [];
    switch (activeTab) {
      case 'initiated':
        data = mergedData.initiated;
        break;
      case 'todo':
        data = defaultRange === 'month' ? mergedData.todoMonth as WorkOrder[] : mergedData.todo;
        // 按待办子Tab分类：待审批=预警规则审批+审批环节的工单，待处理=其余
        if (todoSubTab === 'approval') {
          data = data.filter(o => 
            o.type === '预警规则审批' || 
            o.currentStep?.includes('审批') ||
            o.currentStep?.includes('领导')
          );
          // 追加督办调度记录：待审批 = 回执待评分
          data = [...supervisionScoringOrders, ...data];
        } else {
          // 待处理：使用工作台首页的待办数据源 + 督办调度待处理记录（仅回执待提交）
          data = [...supervisionProcessingOrders, ...sharedProcessingOrders];
        }
        break;
      case 'toClaim':
        data = mergedData.toClaim;
        break;
      case 'done':
        data = mergedData.done;
        break;
      case 'reassigned':
        data = mergedData.reassigned;
        break;
    }

    // 筛选
    if (searchId) {
      data = data.filter(o => o.id.includes(searchId));
    }
    if (searchTitle) {
      data = data.filter(o => o.title.includes(searchTitle));
    }
    if (selectedTypes.length > 0) {
      data = data.filter(o => selectedTypes.includes(o.type));
    }
    if (searchTimeout !== 'all') {
      if (searchTimeout === 'yes') {
        data = data.filter(o => o.timeoutStatus === 'timeout');
      } else {
        data = data.filter(o => o.timeoutStatus === 'normal');
      }
    }

    // 高级搜索弹窗条件
    if (advOrderStatus !== 'all') {
      data = data.filter(o => o.orderStatus === advOrderStatus);
    }
    if (advFlowStatus !== 'all') {
      data = data.filter(o => o.flowStatus === advFlowStatus);
    }
    if (advTimeout !== 'all') {
      if (advTimeout === 'timeout') {
        data = data.filter(o => o.timeoutStatus === 'timeout');
      } else {
        data = data.filter(o => o.timeoutStatus === 'normal');
      }
    }
    if (advResult !== 'all') {
      data = data.filter(o => o.processResult === advResult);
    }
    if (advCustomerNo) {
      data = data.filter(o => o.customerPhone && o.customerPhone.includes(advCustomerNo));
    }
    if (advCurrentStep) {
      data = data.filter(o => o.currentStep && o.currentStep.includes(advCurrentStep));
    }
    if (advGrid) {
      data = data.filter(o => o.grid && o.grid.includes(advGrid));
    }
    if (advCreator) {
      data = data.filter(o => o.creator.includes(advCreator));
    }
    if (advCreateCity !== 'all') {
      data = data.filter(o => o.city === advCreateCity);
    }
    if (advCreateDistrict !== 'all') {
      data = data.filter(o => o.district === advCreateDistrict);
    }
    if (advCreateGrid !== 'all') {
      data = data.filter(o => o.grid === advCreateGrid);
    }
    if (advReceiveCity !== 'all') {
      data = data.filter(o => o.city === advReceiveCity);
    }
    if (advReceiveDistrict !== 'all') {
      data = data.filter(o => o.district === advReceiveDistrict);
    }
    if (advReceiveGrid !== 'all') {
      data = data.filter(o => o.grid === advReceiveGrid);
    }

    return data;
  }, [activeTab, todoSubTab, defaultRange, mergedData, sharedProcessingOrders, supervisionProcessingOrders, supervisionScoringOrders,
      searchId, searchTitle, selectedTypes, searchTimeout,
      advOrderStatus, advFlowStatus, advTimeout, advResult, advCustomerNo,
      advCurrentStep, advGrid, advCreator, advCreateCity, advCreateDistrict,
      advCreateGrid, advReceiveCity, advReceiveDistrict, advReceiveGrid]);

  const totalPages = Math.max(1, Math.ceil(currentData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageData = currentData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleReset = () => {
    setSearchId('');
    setSearchTitle('');
    setSelectedTypes([]);
    setSearchTimeout('all');
    setDefaultRange('month');
    resetAdvanced();
    setCurrentPage(1);
  };

  const resetAdvanced = () => {
    setAdvOrderStatus('all');
    setAdvFlowStatus('all');
    setAdvTimeout('all');
    setAdvResult('all');
    setAdvCustomerNo('');
    setAdvCurrentStep('');
    setAdvGrid('');
    setAdvUpdateTimeStart('');
    setAdvUpdateTimeEnd('');
    setAdvCreator('');
    setAdvCreateTimeStart('');
    setAdvCreateTimeEnd('');
    setAdvCreateCity('all');
    setAdvCreateDistrict('all');
    setAdvCreateGrid('all');
    setAdvReceiveCity('all');
    setAdvReceiveDistrict('all');
    setAdvReceiveGrid('all');
    setAdvProcessName('all');
    setAdvStepName('all');
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetail = (orderId: string, orderType: string, orderStatus?: string) => {
    const tab = activeTab;
    const type = getDispatchTypeByLabel(orderType);
    const fromPath = encodeURIComponent(`/workspace/dispatch/process?tab=${tab}`);
    const statusParam = orderStatus ? `&status=${orderStatus}` : '';
    const path = `/workspace/ticket-detail?id=${orderId}&type=${type}&mode=view&fromPath=${fromPath}${statusParam}`;
    addTab({ id: path, title: '工单详情', path });
    router.push(path);
  };

  const handleProcess = (orderId: string, orderType: string, currentStep?: string) => {
    const tab = activeTab;
    const fromPath = encodeURIComponent(`/workspace/dispatch/process?tab=${tab}`);

    // 督办调度：根据流程状态与子Tab路由到督办页面
    if (orderType === '督办调度') {
      if (currentStep === '待评分') {
        // 回执已提交待评分（位于待审批tab）→ 我的督办任务-待评分查看页（评分版）
        const path = `/workspace/dispatch/my-supervision/score?id=${orderId}&fromPath=${fromPath}`;
        addTab({ id: path, title: '督办评分', path });
        router.push(path);
      } else if (todoSubTab === 'processing') {
        // 待回执（待处理tab）→ 我的督办任务-待执行查看页（回执提交页）
        const path = `/workspace/dispatch/my-supervision/submit?id=${orderId}&fromPath=${fromPath}`;
        addTab({ id: path, title: '督办回执', path });
        router.push(path);
      } else {
        // 待审批（待审批tab）→ 督办管理-待确认审批页
        const path = `/workspace/dispatch/supervision/approve?id=${orderId}&fromPath=${fromPath}`;
        addTab({ id: path, title: '督办审批', path });
        router.push(path);
      }
      return;
    }

    const type = getDispatchTypeByLabel(orderType);
    const stepParam = currentStep ? `&step=${encodeURIComponent(currentStep)}` : '';
    const path = `/workspace/ticket-detail?id=${orderId}&type=${type}&mode=process&fromPath=${fromPath}${stepParam}`;
    addTab({ id: path, title: '工单处理', path });
    router.push(path);
  };

  const getStatusText = (order: WorkOrder) => {
    if (order.currentStep === '待评分') return '待评分';
    if (order.orderStatus === 'processing') return '处理中';
    return '已完成';
  };

  const getFlowStatusText = (order: WorkOrder) => {
    if (order.flowStatus === 'inProgress') return '进行中';
    return '已完成';
  };

  const getTimeoutText = (order: WorkOrder) => {
    if (order.timeoutStatus === 'timeout') return '已超时';
    return '正常';
  };

  // 渲染操作按钮
  const renderActions = (order: WorkOrder) => {
    if (activeTab === 'todo') {
      return (
        <button
          onClick={() => handleProcess(order.id, order.type, order.currentStep)}
          className="text-primary hover:underline text-sm font-medium"
        >
          处理
        </button>
      );
    }
    if (activeTab === 'initiated') {
      return (
        <div className="flex items-center gap-2">
          <button className="text-primary hover:underline text-sm">撤单</button>
          <button
            onClick={() => handleViewDetail(order.id, order.type, order.orderStatus)}
            className="text-primary hover:underline text-sm"
          >
            详情
          </button>
        </div>
      );
    }
    if (activeTab === 'done' || activeTab === 'reassigned') {
      return (
        <button
          onClick={() => handleViewDetail(order.id, order.type, order.orderStatus)}
          className="text-primary hover:underline text-sm"
        >
          详情
        </button>
      );
    }
    if (activeTab === 'toClaim') {
      return (
        <div className="flex items-center gap-2">
          <button className="text-primary hover:underline text-sm">领取</button>
          <button
            onClick={() => handleViewDetail(order.id, order.type, order.orderStatus)}
            className="text-primary hover:underline text-sm"
          >
            详情
          </button>
        </div>
      );
    }
    return null;
  };

  // 分页器
  const renderPagination = () => {
    const total = currentData.length;
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-between px-2 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          共 {total} 条
        </div>
        <div className="flex items-center gap-1">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[80px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(safeCurrentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
            ) : (
              <Button
                key={p}
                variant={p === safeCurrentPage ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-sm"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(safeCurrentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 ml-2 text-sm text-muted-foreground">
            前往
            <Input
              className="w-12 h-8 text-center text-sm"
              value={safeCurrentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 1 && v <= totalPages) {
                  setCurrentPage(v);
                }
              }}
            />
            页
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab 标签区 */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-2 border-b bg-background">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm rounded-t-md transition-colors',
              activeTab === tab.key
                ? 'bg-background text-foreground border border-b-transparent font-medium -mb-px'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full text-white',
                  activeTab === tab.key ? 'bg-primary' : (tab.color || 'bg-muted-foreground')
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 待办子Tab：待处理/待审批 */}
      {activeTab === 'todo' && (
        <div className="flex items-center gap-2 px-6 pt-2 pb-1 bg-background">
          <button
            onClick={() => setTodoSubTab('processing')}
            className={cn(
              'px-3 py-1 rounded-md text-sm transition-colors',
              todoSubTab === 'processing'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            待处理
            <span suppressHydrationWarning className={cn(
              'ml-1 text-xs px-1 py-0.5 rounded-full',
              todoSubTab === 'processing' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {sharedProcessingOrders.length + supervisionProcessingOrders.length}
            </span>
          </button>
          <button
            onClick={() => setTodoSubTab('approval')}
            className={cn(
              'px-3 py-1 rounded-md text-sm transition-colors',
              todoSubTab === 'approval'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            待审批
            <span suppressHydrationWarning className={cn(
              'ml-1 text-xs px-1 py-0.5 rounded-full',
              todoSubTab === 'approval' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {(defaultRange === 'month' ? mergedData.todoMonth : mergedData.todo).filter(o => isApprovalType(o.type, o.currentStep)).length + supervisionScoringOrders.length}
            </span>
          </button>
        </div>
      )}

      {/* 筛选查询区 */}
      <div className="px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单编号:</span>
            <Input
              placeholder="请输入"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单标题:</span>
            <Input
              placeholder="请输入"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单类型:</span>
            <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-52 justify-between text-sm font-normal">
                  {selectedTypes.length === 0
                    ? '请选择'
                    : selectedTypes.length === 1
                      ? selectedTypes[0]
                      : `已选${selectedTypes.length}项`}
                  <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2">
                  {/* 全选/清空 */}
                  <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                      setSelectedTypes([...allWorkOrderTypes]);
                    }}>全选</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                      setSelectedTypes([]);
                    }}>清空</Button>
                  </div>
                  {/* 管理类 */}
                  <div className="mb-1">
                    <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const mgmtTypes = workOrderCategoryMap['管理类'];
                        const allSelected = mgmtTypes.every(t => selectedTypes.includes(t));
                        if (allSelected) {
                          setSelectedTypes(prev => prev.filter(t => !mgmtTypes.includes(t)));
                        } else {
                          setSelectedTypes(prev => [...new Set([...prev, ...mgmtTypes])]);
                        }
                      }}>
                      <Checkbox
                        checked={workOrderCategoryMap['管理类'].every(t => selectedTypes.includes(t))}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-sm font-medium">管理类</span>
                    </div>
                    <div className="ml-5">
                      {workOrderCategoryMap['管理类'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleType(t); }}>
                          <Checkbox checked={selectedTypes.includes(t)} className="h-3.5 w-3.5" />
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 生产类 */}
                  <div>
                    <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const prodTypes = workOrderCategoryMap['生产类'];
                        const allSelected = prodTypes.every(t2 => selectedTypes.includes(t2));
                        if (allSelected) {
                          setSelectedTypes(prev => prev.filter(t2 => !prodTypes.includes(t2)));
                        } else {
                          setSelectedTypes(prev => [...new Set([...prev, ...prodTypes])]);
                        }
                      }}>
                      <Checkbox
                        checked={workOrderCategoryMap['生产类'].every(t => selectedTypes.includes(t))}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-sm font-medium">生产类</span>
                    </div>
                    <div className="ml-5">
                      {workOrderCategoryMap['生产类'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleType(t); }}>
                          <Checkbox checked={selectedTypes.includes(t)} className="h-3.5 w-3.5" />
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">超时状态:</span>
            <Select value={searchTimeout} onValueChange={setSearchTimeout}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="yes">已超时</SelectItem>
                <SelectItem value="no">正常</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 默认查询范围 */}
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                checked={defaultRange === 'month'}
                onChange={() => { setDefaultRange('month'); setCurrentPage(1); }}
                className="accent-primary"
              />
              <span className="text-muted-foreground">默认查询一个月</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                checked={defaultRange === 'all'}
                onChange={() => { setDefaultRange('all'); setCurrentPage(1); }}
                className="accent-primary"
              />
              <span className="text-muted-foreground">默认查询全部数据</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-primary text-sm hover:underline flex items-center gap-1"
            >
              高级搜索
              {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <Button variant="outline" size="sm" className="h-8" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              重置
            </Button>
            <Button size="sm" className="h-8" onClick={() => setCurrentPage(1)}>
              <Search className="h-3.5 w-3.5 mr-1" />
              查询
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1" />
              异步导出
            </Button>
          </div>
        </div>

        {/* 高级搜索面板（内嵌，无遮罩） */}
        {advancedOpen && (
          <div className="bg-card border border-border rounded-md shadow-sm p-4 space-y-3">
            {/* 工单条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">工单条件</span>
                <button onClick={() => setCollapseOrder(!collapseOrder)} className="text-primary text-xs flex items-center gap-1">
                  {collapseOrder ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseOrder && 'rotate-180')} />
                </button>
              </div>
              {!collapseOrder && (
                <div className="grid grid-cols-3 gap-4 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">工单状态:</span>
                    <Select value={advOrderStatus} onValueChange={setAdvOrderStatus}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择工单状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="processing">处理中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">流程状态:</span>
                    <Select value={advFlowStatus} onValueChange={setAdvFlowStatus}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择流程状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="inProgress">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">超时状态:</span>
                    <Select value={advTimeout} onValueChange={setAdvTimeout}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择超时状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="timeout">已超时</SelectItem>
                        <SelectItem value="normal">正常</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* 业务条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">业务条件</span>
                <button onClick={() => setCollapseBiz(!collapseBiz)} className="text-primary text-xs flex items-center gap-1">
                  {collapseBiz ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseBiz && 'rotate-180')} />
                </button>
              </div>
              {!collapseBiz && (
                <div className="grid grid-cols-3 gap-4 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">处理结果:</span>
                    <Select value={advResult} onValueChange={setAdvResult}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择处理结果" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                        <SelectItem value="failed">失败</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">客户号码:</span>
                    <Input placeholder="请输入客户号码" value={advCustomerNo} onChange={(e) => setAdvCustomerNo(e.target.value)} className="flex-1 h-8 text-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* 附加条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">附加条件</span>
                <button onClick={() => setCollapseExtra(!collapseExtra)} className="text-primary text-xs flex items-center gap-1">
                  {collapseExtra ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseExtra && 'rotate-180')} />
                </button>
              </div>
              {!collapseExtra && (
                <div className="space-y-3 px-4 py-3">
                  {/* 第1行 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">当前环节:</span>
                      <Input placeholder="请输入当前环节" value={advCurrentStep} onChange={(e) => setAdvCurrentStep(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">网格:</span>
                      <Input placeholder="请输入网格" value={advGrid} onChange={(e) => setAdvGrid(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">更新时间:</span>
                      <div className="flex items-center gap-1 flex-1">
                        <Input type="date" value={advUpdateTimeStart} onChange={(e) => setAdvUpdateTimeStart(e.target.value)} className="flex-1 h-8 text-sm" />
                        <span className="text-xs text-muted-foreground">至</span>
                        <Input type="date" value={advUpdateTimeEnd} onChange={(e) => setAdvUpdateTimeEnd(e.target.value)} className="flex-1 h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                  {/* 第2行 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">提单人:</span>
                      <Input placeholder="请输入提单人" value={advCreator} onChange={(e) => setAdvCreator(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">提单时间:</span>
                      <div className="flex items-center gap-1 flex-1">
                        <Input type="date" value={advCreateTimeStart} onChange={(e) => setAdvCreateTimeStart(e.target.value)} className="flex-1 h-8 text-sm" />
                        <span className="text-xs text-muted-foreground">至</span>
                        <Input type="date" value={advCreateTimeEnd} onChange={(e) => setAdvCreateTimeEnd(e.target.value)} className="flex-1 h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单地市:</span>
                      <Select value={advCreateCity} onValueChange={(v) => { setAdvCreateCity(v); setAdvCreateDistrict('all'); setAdvCreateGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单地市" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {xingjiangCities.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* 第3行 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单区县:</span>
                      <Select value={advCreateDistrict} onValueChange={(v) => { setAdvCreateDistrict(v); setAdvCreateGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单区县" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {createDistrictOptions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单网格:</span>
                      <Select value={advCreateGrid} onValueChange={setAdvCreateGrid}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单网格" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {createGridOptions.map((g: string) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单地市:</span>
                      <Select value={advReceiveCity} onValueChange={(v) => { setAdvReceiveCity(v); setAdvReceiveDistrict('all'); setAdvReceiveGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单地市" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {xingjiangCities.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* 第4行 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单区县:</span>
                      <Select value={advReceiveDistrict} onValueChange={(v) => { setAdvReceiveDistrict(v); setAdvReceiveGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单区县" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {receiveDistrictOptions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单网格:</span>
                      <Select value={advReceiveGrid} onValueChange={setAdvReceiveGrid}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单网格" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {receiveGridOptions.map((g: string) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">流程名称:</span>
                      <Select value={advProcessName} onValueChange={setAdvProcessName}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择流程名称" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="指标调度流程">指标调度流程</SelectItem>
                          <SelectItem value="策略调度流程">策略调度流程</SelectItem>
                          <SelectItem value="客群调度流程">客群调度流程</SelectItem>
                          <SelectItem value="商机调度流程">商机调度流程</SelectItem>
                          <SelectItem value="区域攻坚调度流程">区域攻坚调度流程</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* 第5行 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">环节名称:</span>
                      <Select value={advStepName} onValueChange={setAdvStepName}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择环节名称" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="区公司领导审批">区公司领导审批</SelectItem>
                          <SelectItem value="区领导审批">区领导审批</SelectItem>
                          <SelectItem value="生成营销群组">生成营销群组</SelectItem>
                          <SelectItem value="网格端/KPI调度">网格端/KPI调度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 表格区 */}
      <div className="flex-1 overflow-auto px-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium w-48">工单编码</TableHead>
              <TableHead className="text-xs font-medium w-44">工单标题</TableHead>
              <TableHead className="text-xs font-medium w-36">工单类型</TableHead>
              {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableHead className="text-xs font-medium w-28">预警类型</TableHead>}
              {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableHead className="text-xs font-medium w-24">业务类型</TableHead>}
              {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableHead className="text-xs font-medium w-24">执行模式</TableHead>}
              <TableHead className="text-xs font-medium min-w-[200px]">工单描述</TableHead>
              <TableHead className="text-xs font-medium w-20">工单状态</TableHead>
              <TableHead className="text-xs font-medium w-20">流程状态</TableHead>
              <TableHead className="text-xs font-medium w-20">超时状态</TableHead>
              <TableHead className="text-xs font-medium w-20">处理结果</TableHead>
              <TableHead className="text-xs font-medium w-32">客户号码</TableHead>
              <TableHead className="text-xs font-medium w-32">当前环节</TableHead>
              <TableHead className="text-xs font-medium w-28">当前处理人</TableHead>
              <TableHead className="text-xs font-medium w-20">地市</TableHead>
              <TableHead className="text-xs font-medium w-20">区县</TableHead>
              <TableHead className="text-xs font-medium w-24">网格</TableHead>
              <TableHead className="text-xs font-medium w-40">更新时间</TableHead>
              <TableHead className="text-xs font-medium w-24">提单人</TableHead>
              <TableHead className="text-xs font-medium w-40">提单时间</TableHead>
              <TableHead className="text-xs font-medium w-28 sticky right-0 bg-muted/50">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={21} className="h-32 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-mono text-primary">{order.id}</TableCell>
                  <TableCell className="text-xs">{order.title}</TableCell>
                  <TableCell className="text-xs">{getCategoryByType(order.type)}/{order.type}</TableCell>
                  {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableCell className="text-xs">{order.alertType || '--'}</TableCell>}
                  {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableCell className="text-xs">{order.businessScene || '--'}</TableCell>}
                  {!(activeTab === 'todo' && todoSubTab === 'processing') && <TableCell className="text-xs">{order.executionMode || '--'}</TableCell>}
                  <TableCell className="text-xs max-w-[200px] truncate" title={order.description}>
                    {order.description}
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="order" value={getStatusText(order)} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="flow" value={getFlowStatusText(order)} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="timeout" value={getTimeoutText(order)} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.processResult ? (
                      <StatusBadge type="result" value={order.processResult === 'failure' ? '失败' : '成功'} />
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{maskPhone(order.customerPhone)}</TableCell>
                  <TableCell className="text-xs">{order.currentStep}</TableCell>
                  <TableCell className="text-xs">{order.currentHandler}</TableCell>
                  <TableCell className="text-xs">{order.city}</TableCell>
                  <TableCell className="text-xs">{order.district}</TableCell>
                  <TableCell className="text-xs">{order.grid}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.updateTime}</TableCell>
                  <TableCell className="text-xs">{order.creator}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.createTime}</TableCell>
                  <TableCell className="text-xs sticky right-0 bg-background">
                    {renderActions(order)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页区 */}
      {renderPagination()}
    </div>
  );
}

export default function DispatchProcessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>}>
      <DispatchProcessContent />
    </Suspense>
  );
}
