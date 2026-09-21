'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Database, Eye, TrendingUp, CheckCircle, Clock, XCircle, Send, MapPin, BarChart3, AlertTriangle, Calendar, Settings, X, Plus, Package, ArrowUpDown, Upload, Download, Paperclip, FolderOpen, User } from "lucide-react";
import { toast } from 'sonner';
import ProductSelector, { ProductItem as Product } from '@/components/ProductSelector';
import OpportunityFilterPanel from '../components/OpportunityFilterPanel';

// 商机分类数据
const categoryOptions = {
  level1: [
    { value: 'C001', label: '风险预警类' },
    { value: 'C004', label: '价值提升类' },
    { value: 'C005', label: '生命周期类' },
  ],
  level2: {
    'C001': [{ value: 'C001-001', label: '流量预警' }],
    'C004': [{ value: 'C004-001', label: '流量经营' }],
    'C005': [{ value: 'C005-002', label: '沉默流失预警' }],
  },
  level3: {
    'C001-001': [{ value: 'C001-001-001', label: '流量达量预警' }],
    'C004-001': [{ value: 'C004-001-001', label: '特定内容高频访问' }, { value: 'C004-001-002', label: '地板价套餐查询高流量套餐' }],
    'C005-002': [{ value: 'C005-002-001', label: '零流量使用预警' }],
  },
};

const sourceOptions = [
  { value: 'CRM系统', label: 'CRM系统' },
  { value: '营销活动平台', label: '营销活动平台' },
  { value: '外呼系统', label: '外呼系统' },
  { value: '线上渠道', label: '线上渠道' },
  { value: '线下营业厅', label: '线下营业厅' },
  { value: '代理商系统', label: '代理商系统' },
  { value: '微信小程序', label: '微信小程序' },
  { value: '企业微信', label: '企业微信' },
];

const businessTypeOptions = [
  { value: '流量达量预警-全球通客户-CRM系统', label: '流量达量预警-全球通客户-CRM系统' },
  { value: '特定内容高频访问-全球通客户-营销活动平台', label: '特定内容高频访问-全球通客户-营销活动平台' },
  { value: '高价值套餐推荐-中高端客户-外呼系统', label: '高价值套餐推荐-中高端客户-外呼系统' },
  { value: '家庭融合推荐-中高端客户-外呼系统', label: '家庭融合推荐-中高端客户-外呼系统' },
  { value: '合约到期提醒-潜力客户-线下营业厅', label: '合约到期提醒-潜力客户-线下营业厅' },
];

const regionOptions = [
  { value: '乌鲁木齐', label: '乌鲁木齐' },
  { value: '克拉玛依', label: '克拉玛依' },
  { value: '吐鲁番', label: '吐鲁番' },
  { value: '哈密', label: '哈密' },
  { value: '昌吉', label: '昌吉' },
  { value: '巴州', label: '巴州' },
  { value: '阿克苏', label: '阿克苏' },
  { value: '喀什', label: '喀什' },
];

// 商机业务类型ID映射
const businessTypeIdMap: Record<string, string> = {
  '流量达量预警-全球通客户-CRM系统': 'BT001',
  '特定内容高频访问-全球通客户-营销活动平台': 'BT002',
  '高价值套餐推荐-中高端客户-外呼系统': 'BT003',
  '家庭融合推荐-中高端客户-外呼系统': 'BT004',
  '合约到期提醒-潜力客户-线下营业厅': 'BT005',
};

// 推荐产品选项
const productOptions = [
  { value: '5G畅享套餐199元', label: '5G畅享套餐199元' },
  { value: '5G畅享套餐129元', label: '5G畅享套餐129元' },
  { value: '视频流量月包30元', label: '视频流量月包30元' },
  { value: '流量加油包20GB', label: '流量加油包20GB' },
  { value: '智慧家庭套餐239元', label: '智慧家庭套餐239元' },
  { value: '流量体验包5GB', label: '流量体验包5GB' },
];

// 商机评级
const RATING_LEVELS = {
  HIGH: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
  MEDIUM: { label: '中', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  LOW: { label: '低', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

// 状态枚举
const STATUS = {
  PENDING_DISPATCH: { label: '待派单', color: 'bg-slate-100 text-slate-600' },
  RATING_ADJUSTING: { label: '调级中', color: 'bg-amber-100 text-amber-600' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-600' },
};

// 有效期状态
function getValidityStatus(validHours: number, status: string): { label: string; color: string } {
  if (status === 'COMPLETED') return { label: '已结束', color: 'text-muted-foreground' };
  if (validHours <= 6) return { label: '即将过期', color: 'text-red-500' };
  if (validHours <= 24) return { label: '正常', color: 'text-amber-500' };
  return { label: '正常', color: 'text-green-500' };
}

// 计算有效期至日期
function getValidUntil(collectTime: string, validHours: number): string {
  try {
    const base = new Date(collectTime.replace(' ', 'T'));
    const expiry = new Date(base.getTime() + validHours * 3600000);
    return `${expiry.getMonth() + 1}/${expiry.getDate()} ${String(expiry.getHours()).padStart(2, '0')}:${String(expiry.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '-';
  }
}

const PAGE_SIZE = 20;

interface CustomerOpportunity {
  id: string;
  businessTypeId: string;
  businessTypeName: string;
  category: string;
  businessScenario: string;
  source: string;
  rating: 'HIGH' | 'MEDIUM' | 'LOW';
  executionCustomer: string;
  region: string;
  status: keyof typeof STATUS;
  collectTime: string;
  collectCycle?: string; // 采集周期：渠道获取商机的频率（每日/每月/每小时/实时）
  validHours: number;
  assignedTo?: string;
  assignTime?: string;
  recommendedProducts?: Product[];
  recommendedReason?: string;
  executionRecords: ExecutionRecord[];
  conversionResult?: 'SUCCESS' | 'FAILED' | 'PENDING';
  conversionDetail?: {
    product?: string;
    amount?: number;
    reason?: string;
    time?: string;
  };
}

interface ExecutionRecord {
  time: string;
  action: string;
  operator: string;
  result: string;
}

// 模拟数据
const customerOpportunityData: CustomerOpportunity[] = [
  { 
    id: 'SJ202401150001', 
    businessTypeId: 'BT001',
    businessTypeName: '流量达量预警-全球通客户-CRM系统',
    category: '风险预警类/流量预警/流量达量预警', 
    businessScenario: '流量运营',
    source: 'CRM系统', 
    rating: 'HIGH',
    executionCustomer: '991*********1001', 
    region: '乌鲁木齐天山区南塔网格',
    status: 'COMPLETED',
    collectTime: '2024-01-15 10:30',
    collectCycle: '每日',
    validHours: 48,
    assignedTo: '李经理',
    assignTime: '2024-01-15 11:00',
    recommendedProducts: [{ id: 'p101', code: 'p101', name: '5G畅享套餐199元', category: '套餐产品', price: 199, description: '5G大流量套餐' }],
    recommendedReason: '客户当前套餐月费89元，月均流量使用超套餐200%，套餐外资费较高，推荐升级至更高档位套餐以降低整体通信成本。',
    conversionResult: 'SUCCESS',
    conversionDetail: { product: '5G畅享套餐199元', amount: 199, time: '2024-01-16 15:30' },
    executionRecords: [
      { time: '2024-01-15 10:30', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-15 11:00', action: '派单', operator: '系统', result: '派单至李经理' },
      { time: '2024-01-16 14:00', action: '外呼联系', operator: '李经理', result: '客户有意向' },
      { time: '2024-01-16 15:30', action: '办理套餐', operator: '李经理', result: '成功办理5G畅享套餐199元' },
    ],
  },
  { 
    id: 'SJ202401150002', 
    businessTypeId: 'BT002',
    businessTypeName: '特定内容高频访问-全球通客户-营销活动平台',
    category: '价值提升类/流量经营/特定内容高频访问', 
    businessScenario: '流量运营',
    source: '营销活动平台', 
    rating: 'MEDIUM',
    executionCustomer: '991*********1002', 
    region: '克拉玛依沙依巴克区红庙子网格',
    status: 'COMPLETED',
    collectTime: '2024-01-15 10:25',
    collectCycle: '每小时',
    validHours: 72,
    assignedTo: '王专员',
    assignTime: '2024-01-15 12:00',
    recommendedProducts: [{ id: 'p201', code: 'p201', name: '视频流量月包30元', category: '流量产品', price: 30, description: '视频定向流量包' }],
    recommendedReason: '客户近30天高频访问视频类应用（日均3.5小时），月均视频流量消耗约15GB，推荐定向流量包满足视频需求。',
    conversionResult: 'PENDING',
    executionRecords: [
      { time: '2024-01-15 10:25', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-15 12:00', action: '派单', operator: '系统', result: '派单至王专员' },
      { time: '2024-01-16 10:00', action: '外呼联系', operator: '王专员', result: '客户考虑中' },
    ],
  },
  { 
    id: 'SJ202401150003', 
    businessTypeId: 'BT001',
    businessTypeName: '流量达量预警-全球通客户-CRM系统',
    category: '风险预警类/流量预警/流量达量预警', 
    businessScenario: '流量运营',
    source: '线上渠道', 
    rating: 'HIGH',
    executionCustomer: '991*********1003', 
    region: '吐鲁番天山区南塔网格',
    status: 'COMPLETED',
    collectTime: '2024-01-15 10:15',
    collectCycle: '实时',
    validHours: 24,
    recommendedProducts: [{ id: 'p202', code: 'p202', name: '流量加油包20GB', category: '流量产品', price: 30, description: '20GB通用流量加油包' }],
    recommendedReason: '客户套餐内流量已使用95%，剩余5天将产生套外资费，推荐提前购买流量包避免额外支出。',
    executionRecords: [
      { time: '2024-01-15 10:15', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-15 14:00', action: '派单', operator: '运营人员', result: '派单成功' },
    ],
  },
  { 
    id: 'SJ202401150004', 
    businessTypeId: 'BT003',
    businessTypeName: '高价值套餐推荐-中高端客户-外呼系统',
    category: '价值提升类/流量经营/地板价套餐查询高流量套餐', 
    businessScenario: '中高端保有',
    source: '线下营业厅', 
    rating: 'LOW',
    executionCustomer: '991*********1004', 
    region: '乌鲁木齐沙依巴克区友好路网格',
    status: 'COMPLETED',
    collectTime: '2024-01-15 10:10',
    validHours: 72,
    assignedTo: '孙客服',
    assignTime: '2024-01-15 11:30',
    recommendedProducts: [{ id: 'p303', code: 'p303', name: '智慧家庭套餐239元', category: '套餐产品', price: 239, description: '智慧家庭套餐含宽带和IPTV' }],
    recommendedReason: '客户多次查询低价套餐但实际使用量较大，存在套餐不匹配情况，推荐融合套餐提升性价比。',
    conversionResult: 'FAILED',
    conversionDetail: { reason: '客户拒绝，表示当前套餐满足需求', time: '2024-01-16 09:30' },
    executionRecords: [
      { time: '2024-01-15 10:10', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-15 11:30', action: '派单', operator: '系统', result: '派单至孙客服' },
      { time: '2024-01-16 09:30', action: '外呼联系', operator: '孙客服', result: '客户拒绝，当前套餐满足需求' },
    ],
  },
  { 
    id: 'SJ202401140005', 
    businessTypeId: 'BT005',
    businessTypeName: '合约到期提醒-潜力客户-线下营业厅',
    category: '生命周期类/沉默流失预警/零流量使用预警', 
    businessScenario: '家庭运营',
    source: '微信小程序', 
    rating: 'LOW',
    executionCustomer: '991*********1005', 
    region: '克拉玛依新市区喀什东路网格',
    status: 'PENDING_DISPATCH',
    collectTime: '2024-01-14 17:50',
    collectCycle: '实时',
    validHours: 96,
    recommendedProducts: [{ id: 'p104', code: 'p104', name: '流量体验包5GB', category: '流量产品', price: 10, description: '5GB流量体验包当月有效' }],
    recommendedReason: '客户连续30天零流量使用，存在流失风险，推荐免费体验包激活使用习惯，提升客户粘性。',
    executionRecords: [
      { time: '2024-01-14 17:50', action: '商机采集', operator: '系统', result: '采集成功' },
    ],
  },
  {
    id: 'SJ202401140007',
    businessTypeId: 'BT002',
    businessTypeName: '特定内容高频访问-全球通客户-经分系统',
    category: '风险预警类/内容偏好/特定内容高频访问',
    businessScenario: '流量运营',
    source: '经分系统',
    rating: 'MEDIUM',
    executionCustomer: '991*********1007',
    region: '乌鲁木齐天山区人民路网格',
    status: 'RATING_ADJUSTING',
    collectTime: '2024-01-14 16:20',
    collectCycle: '每日',
    validHours: 48,
    recommendedProducts: [{ id: 'p101', code: 'p101', name: '视频会员包月套餐', category: '内容产品', price: 15, description: '含主流视频平台会员月卡' }],
    recommendedReason: '客户近期高频访问视频类内容，推荐视频会员包提升客户体验。',
    executionRecords: [
      { time: '2024-01-14 16:20', action: '商机采集', operator: '系统', result: '采集成功' },
    ],
  },
  { 
    id: 'SJ202401140006', 
    businessTypeId: 'BT001',
    businessTypeName: '流量达量预警-全球通客户-CRM系统',
    category: '风险预警类/流量预警/流量达量预警', 
    businessScenario: '流量运营',
    source: '企业微信', 
    rating: 'HIGH',
    executionCustomer: '991*********1006', 
    region: '哈密新市区北京路网格',
    status: 'COMPLETED',
    collectTime: '2024-01-14 17:30',
    validHours: 24,
    assignedTo: '周专员',
    assignTime: '2024-01-15 09:00',
    recommendedProducts: [{ id: 'p105', code: 'p105', name: '流量加油包10GB', category: '流量产品', price: 20, description: '10GB流量加油包当月有效' }],
    recommendedReason: '客户流量使用接近套餐上限，剩余3天资费风险高，推荐购买流量包避免套外费用。',
    conversionResult: 'SUCCESS',
    conversionDetail: { product: '流量加油包10GB', amount: 30, time: '2024-01-15 16:00' },
    executionRecords: [
      { time: '2024-01-14 17:30', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-15 09:00', action: '派单', operator: '系统', result: '派单至周专员' },
      { time: '2024-01-15 15:30', action: '外呼联系', operator: '周专员', result: '客户同意办理' },
      { time: '2024-01-15 16:00', action: '办理业务', operator: '周专员', result: '成功办理流量加油包10GB' },
    ],
  },
  { 
    id: 'SJ202401130007', 
    businessTypeId: 'BT002',
    businessTypeName: '特定内容高频访问-全球通客户-营销活动平台',
    category: '价值提升类/流量经营/特定内容高频访问', 
    businessScenario: '流量运营',
    source: 'CRM系统', 
    rating: 'MEDIUM',
    executionCustomer: '991*********1007', 
    region: '巴州水磨沟区建设路网格',
    status: 'COMPLETED',
    collectTime: '2024-01-13 16:00',
    collectCycle: '每日',
    validHours: 72,
    assignedTo: '吴经理',
    assignTime: '2024-01-14 10:00',
    recommendedProducts: [{ id: 'p301', code: 'p301', name: '音乐流量包10元/月', category: '流量产品', price: 10, description: '音乐定向流量包' }],
    recommendedReason: '客户高频使用音乐类APP，月均音乐流量消耗约8GB，推荐定向流量包满足音乐需求。',
    conversionResult: 'FAILED',
    conversionDetail: { reason: '客户已办理携号转网', time: '2024-01-14 14:00' },
    executionRecords: [
      { time: '2024-01-13 16:00', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-14 10:00', action: '派单', operator: '系统', result: '派单至吴经理' },
      { time: '2024-01-14 14:00', action: '外呼联系', operator: '吴经理', result: '客户已携号转网' },
    ],
  },
  { 
    id: 'SJ202401130008', 
    businessTypeId: 'BT005',
    businessTypeName: '合约到期提醒-潜力客户-线下营业厅',
    category: '生命周期类/沉默流失预警/零流量使用预警', 
    businessScenario: '家庭运营',
    source: '营销活动平台', 
    rating: 'LOW',
    executionCustomer: '991*********1008', 
    region: '阿克苏达坂城区建丰网格',
    status: 'COMPLETED',
    collectTime: '2024-01-13 15:30',
    validHours: 120,
    assignedTo: '郑专员',
    assignTime: '2024-01-14 09:00',
    recommendedProducts: [{ id: 'p403', code: 'p403', name: '话费充值优惠活动', category: '权益产品', price: 0, description: '充100送20' }],
    recommendedReason: '客户连续20天无通信行为，账户余额充足但无使用，推荐充值优惠活动激活使用。',
    conversionResult: 'PENDING',
    executionRecords: [
      { time: '2024-01-13 15:30', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-14 09:00', action: '派单', operator: '系统', result: '派单至郑专员' },
      { time: '2024-01-15 11:00', action: '外呼联系', operator: '郑专员', result: '客户表示考虑' },
      { time: '2024-01-16 10:00', action: '二次跟进', operator: '郑专员', result: '客户意向不明' },
    ],
  },
  { 
    id: 'SJ202401120009', 
    businessTypeId: 'BT001',
    businessTypeName: '流量达量预警-全球通客户-CRM系统',
    category: '风险预警类/流量预警/流量达量预警', 
    businessScenario: '流量运营',
    source: 'CRM系统', 
    rating: 'HIGH',
    executionCustomer: '991*********1009', 
    region: '乌鲁木齐头屯河区兴工网格',
    status: 'PENDING_DISPATCH',
    collectTime: '2024-01-12 14:20',
    validHours: 48,
    recommendedProducts: [{ id: 'p102', code: 'p102', name: '5G畅享套餐129元', category: '套餐产品', price: 129, description: '5G中档流量套餐' }],
    recommendedReason: '客户当前套餐月费59元，月均流量使用超套餐150%，推荐升级至更高档位套餐。',
    executionRecords: [
      { time: '2024-01-12 14:20', action: '商机采集', operator: '系统', result: '采集成功' },
    ],
  },
  { 
    id: 'SJ202401120010', 
    businessTypeId: 'BT004',
    businessTypeName: '家庭融合推荐-中高端客户-外呼系统',
    category: '价值提升类/流量经营/地板价套餐查询高流量套餐', 
    businessScenario: '离网维系',
    source: '外呼系统', 
    rating: 'MEDIUM',
    executionCustomer: '991*********1010', 
    region: '克拉玛依水磨沟区中山公园网格',
    status: 'COMPLETED',
    collectTime: '2024-01-12 11:05',
    collectCycle: '每日',
    validHours: 72,
    recommendedProducts: [{ id: 'p201', code: 'p201', name: '智慧家庭套餐199元', category: '套餐产品', price: 199, description: '含宽带+电视+手机融合套餐' }],
    recommendedReason: '客户多次查询低价套餐但有宽带需求，推荐融合套餐包含宽带服务，性价比更高。',
    executionRecords: [
      { time: '2024-01-12 11:05', action: '商机采集', operator: '系统', result: '采集成功' },
      { time: '2024-01-12 14:00', action: '派单', operator: '运营人员', result: '派单成功' },
    ],
  },
];

export default function CustomerOpportunityPage() {
  const router = useRouter();
  // 调级弹窗状态
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<CustomerOpportunity | null>(null);
  const [adjustForm, setAdjustForm] = useState<{ newRating: string; reason: string; approver: string; attachments: string[] }>({ newRating: '', reason: '', approver: '', attachments: [] });

  // 批量调级弹窗状态
  const [batchAdjustDialogOpen, setBatchAdjustDialogOpen] = useState(false);
  const [batchAdjustForm, setBatchAdjustForm] = useState<{ newRating: string; reason: string; approver: string; attachments: string[] }>({ newRating: '', reason: '', approver: '', attachments: [] });

  // 审批人选择弹窗状态
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [approverSearch, setApproverSearch] = useState('');
  const [tempApprover, setTempApprover] = useState('');
  // 审批人弹窗服务于哪个表单：single=单条调级，batch=批量调级，dispatch=单条派单
  const [approverTarget, setApproverTarget] = useState<'single' | 'batch' | 'dispatch'>('single');

  const approverList = [
    { id: 'li_manager', name: '李主管', dept: '新疆市场部' },
    { id: 'zhao_director', name: '赵部长', dept: '新疆运维部' },
    { id: 'wang_manager', name: '王经理', dept: '乌鲁木齐分公司' },
    { id: 'sun_supervisor', name: '孙主管', dept: '昌吉分公司' },
    { id: 'chen_leader', name: '陈组长', dept: '伊犁分公司' },
  ];

  // 商机列表状态（支持新增/导入后刷新）
  const [opportunityData, setOpportunityData] = useState(customerOpportunityData);

  // 新增商机弹窗状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');
  const [addForm, setAddForm] = useState({
    businessTypeName: '', businessTypeId: '', name: '', categoryL1: '', categoryL2: '',
    categoryL3: '', source: '', rating: '', description: '', customerName: '', phone: '',
    region: '', recommendedProduct: '', recommendedReason: '',
  });

  // 批量导入状态（集成在新增商机弹窗内）
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState<{ businessType: string; name: string; rating: string; customerName: string; phone: string; source: string; valid: boolean; reason?: string }[]>([]);

  // 下载导入模板（CSV）
  const handleDownloadTemplate = () => {
    const headers = ['商机业务类型', '商机名称', '一级分类', '二级分类', '三级分类', '商机源', '评级(高/中/低)', '商机描述', '客户姓名', '联系电话', '区域', '推荐产品', '推荐理由'];
    const example = ['流量达量预警-全球通客户-CRM系统', '流量达量预警-张三', '风险预警类', '流量预警', '流量达量预警', 'CRM系统', '高', '客户流量超套餐200%', '张三', '13900000001', '乌鲁木齐天山区南塔网格', '5G畅享套餐199元', '客户流量使用超标推荐升级'];
    const csv = '\uFEFF' + headers.join(',') + '\n' + example.join(',') + '\n\n# 说明：客户姓名为选填，其余字段必填；评级填写 高/中/低';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '客户商机导入模板.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('模板已下载');
  };

  // 上传文件后模拟解析
  const handleImportFile = (file: File) => {
    setImportFileName(file.name);
    // 模拟解析5条数据，其中1条失败（缺商机名称）
    const mockParsed = [
      { businessType: '流量达量预警-全球通客户-CRM系统', name: '流量达量预警-客户088', rating: '高', customerName: '客户088', phone: '13900000088', source: 'CRM系统', valid: true },
      { businessType: '特定内容高频访问-全球通客户-营销活动平台', name: '视频高频-客户092', rating: '中', customerName: '客户092', phone: '13900000092', source: '营销活动平台', valid: true },
      { businessType: '高价值套餐推荐-中高端客户-外呼系统', name: '', rating: '高', customerName: '客户077', phone: '13900000077', source: '外呼系统', valid: false, reason: '商机名称为空' },
      { businessType: '合约到期提醒-潜力客户-线下营业厅', name: '合约到期-客户065', rating: '低', customerName: '客户065', phone: '13900000065', source: '线下营业厅', valid: true },
      { businessType: '流量达量预警-全球通客户-CRM系统', name: '流量达量预警-客户051', rating: '中', customerName: '', phone: '13900000051', source: 'CRM系统', valid: true },
    ];
    setImportRows(mockParsed);
  };

  const handleConfirmImport = () => {
    const validRows = importRows.filter(r => r.valid);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const collectTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const maxNum = opportunityData.reduce((max, item) => {
      const m = item.id.match(/(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const newItems: CustomerOpportunity[] = validRows.map((r, idx) => ({
      id: `SJ${String(now.getFullYear())}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(maxNum + idx + 1).padStart(4, '0')}`,
      businessTypeId: 'BT001',
      businessTypeName: r.businessType,
      category: '风险预警类/流量预警/流量达量预警',
      businessScenario: '流量运营',
      source: r.source,
      rating: (r.rating === '高' ? 'HIGH' : r.rating === '中' ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
      executionCustomer: r.phone,
      region: '乌鲁木齐天山区南塔网格',
      status: 'PENDING_DISPATCH',
      collectTime,
      collectCycle: '每日',
      validHours: 48,
      recommendedProducts: [],
      executionRecords: [{ time: collectTime, action: '商机采集', operator: '系统', result: '批量导入' }],
    }));
    customerOpportunityData.push(...newItems);
    setOpportunityData([...opportunityData, ...newItems]);
    toast.success('批量导入成功', { description: `成功导入 ${validRows.length} 条商机，失败 ${importRows.length - validRows.length} 条` });
    setAddDialogOpen(false);
    setImportRows([]); setImportFileName('');
  };

  // 标签筛选
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [filterValidity, setFilterValidity] = useState<string>('');
  
  // 下拉筛选
  const [searchId, setSearchId] = useState("");
  const [searchCategoryL1, setSearchCategoryL1] = useState<string>("");
  const [searchCategoryL2, setSearchCategoryL2] = useState<string>("");
  const [searchCategoryL3, setSearchCategoryL3] = useState<string>("");
  const [searchSource, setSearchSource] = useState<string>("");
  const [searchBusinessType, setSearchBusinessType] = useState<string>("");
  const [searchRegion, setSearchRegion] = useState<string>("");

  // 分页
  const [currentPage, setCurrentPage] = useState(1);

  // 弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CustomerOpportunity | null>(null);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState<CustomerOpportunity | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDispatchDialogOpen, setBatchDispatchDialogOpen] = useState(false);
  const [dispatchSystem, setDispatchSystem] = useState<'网格通' | '在线'>('网格通');
  const [executionRole, setExecutionRole] = useState<string>('');
  const [dispatchApprover, setDispatchApprover] = useState<string>('');
  const [dispatchScenario, setDispatchScenario] = useState<string>('');
  const [dispatchDesc, setDispatchDesc] = useState<string>('');
  const [singleProductSelectorOpen, setSingleProductSelectorOpen] = useState(false);
  const [singleDispatchProducts, setSingleDispatchProducts] = useState<Product[]>([]);
  const [batchProductSelectorOpen, setBatchProductSelectorOpen] = useState(false);
  const [batchDispatchProducts, setBatchDispatchProducts] = useState<Product[]>([]);

  const level2Options = searchCategoryL1 ? categoryOptions.level2[searchCategoryL1 as keyof typeof categoryOptions.level2] || [] : [];
  const level3Options = searchCategoryL2 ? categoryOptions.level3[searchCategoryL2 as keyof typeof categoryOptions.level3] || [] : [];

  const handleLevel1Change = (value: string) => { setSearchCategoryL1(value); setSearchCategoryL2(""); setSearchCategoryL3(""); };
  const handleLevel2Change = (value: string) => { setSearchCategoryL2(value); setSearchCategoryL3(""); };
  const handleReset = () => { 
    setSearchId(""); setSearchCategoryL1(""); setSearchCategoryL2(""); setSearchCategoryL3(""); 
    setSearchSource(""); setSearchBusinessType(""); setSearchRegion("");
    setFilterStatus(''); setFilterRating(''); setFilterValidity('');
  };

  const filteredData = opportunityData.filter(item => {
    const matchId = !searchId || item.id.includes(searchId);
    const matchCategory = !searchCategoryL3 || item.category.includes(level3Options.find(c => c.value === searchCategoryL3)?.label || '');
    const matchSource = !searchSource || item.source.includes(searchSource);
    const matchRating = !filterRating || item.rating === filterRating;
    const matchBusinessType = !searchBusinessType || item.businessTypeName === searchBusinessType;
    const matchStatus = !filterStatus || item.status === filterStatus;
    const matchRegion = !searchRegion || item.region.includes(searchRegion);
    // 有效期筛选
    let matchValidity = true;
    if (filterValidity === 'expiring') matchValidity = item.validHours <= 6 && item.status !== 'COMPLETED';
    else if (filterValidity === 'normal') matchValidity = item.validHours > 6 && item.status !== 'COMPLETED';
    else if (filterValidity === 'expired') matchValidity = item.status === 'COMPLETED';
    return matchId && matchCategory && matchSource && matchRating && matchBusinessType && matchStatus && matchValidity && matchRegion;
  });

  // 评级优先级映射
  const ratingOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  // 状态优先级：待派单最优先
  const statusOrder: Record<string, number> = { PENDING_DISPATCH: 1, RATING_ADJUSTING: 2, COMPLETED: 3 };

  // 排序后的数据：先按状态优先级（待派单优先），再按评级降序
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      if (statusDiff !== 0) return statusDiff;
      return (ratingOrder[b.rating] || 0) - (ratingOrder[a.rating] || 0);
    });
  }, [filteredData]);

  // 状态数量统计
  const statusCounts = useMemo(() => ({
    PENDING_DISPATCH: opportunityData.filter(d => d.status === 'PENDING_DISPATCH').length,
    RATING_ADJUSTING: opportunityData.filter(d => d.status === 'RATING_ADJUSTING').length,
    COMPLETED: opportunityData.filter(d => d.status === 'COMPLETED').length,
  }), [opportunityData]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleDispatch = (item: CustomerOpportunity) => {
    setSelectedForAction(item);
    setSingleDispatchProducts(item.recommendedProducts || []);
    setDispatchSystem('网格通');
    setExecutionRole('');
    setDispatchApprover('');
    setDispatchScenario('');
    setDispatchDesc('');
    setDispatchDialogOpen(true);
  };
  const handleViewDetail = (item: CustomerOpportunity) => {
    setSelectedOpportunity(item);
    setDetailDialogOpen(true);
  };
  const handleOpenRatingAdjust = (item: CustomerOpportunity) => {
    setAdjustTarget(item);
    setAdjustForm({ newRating: '', reason: '', approver: '', attachments: [] });
    setAdjustDialogOpen(true);
  };
  const handleSubmitAdjust = () => {
    if (!adjustForm.newRating || !adjustForm.reason || !adjustForm.approver) { return; }
    setAdjustDialogOpen(false);
    setAdjustTarget(null);
  };

  const handleOpenAddDialog = () => {
    setAddForm({ businessTypeName: '', businessTypeId: '', name: '', categoryL1: '', categoryL2: '', categoryL3: '', source: '', rating: '', description: '', customerName: '', phone: '', region: '', recommendedProduct: '', recommendedReason: '' });
    setAddMode('single');
    setImportRows([]); setImportFileName('');
    setAddDialogOpen(true);
  };
  const handleBusinessTypeChange = (value: string) => {
    setAddForm(prev => ({ ...prev, businessTypeName: value, businessTypeId: businessTypeIdMap[value] || '' }));
  };
  const handleAddLevel1Change = (value: string) => {
    setAddForm(prev => ({ ...prev, categoryL1: value, categoryL2: '', categoryL3: '' }));
  };
  const handleAddLevel2Change = (value: string) => {
    setAddForm(prev => ({ ...prev, categoryL2: value, categoryL3: '' }));
  };
  const handleSubmitAdd = () => {
    if (!addForm.businessTypeName) { toast.error('请选择商机业务类型'); return; }
    if (!addForm.name.trim()) { toast.error('请输入商机名称'); return; }
    if (!addForm.rating) { toast.error('请选择商机评级'); return; }
    if (!addForm.phone.trim()) { toast.error('请输入联系电话'); return; }
    if (!addForm.region) { toast.error('请选择区域信息'); return; }
    toast.success('新增商机成功');
    setAddDialogOpen(false);
  };

  const dispatchableItems = filteredData.filter(item => item.status === 'PENDING_DISPATCH');
  const selectedDispatchableIds = selectedIds.filter(id => dispatchableItems.some(item => item.id === id));

  const handleSelectAll = () => {
    if (selectedDispatchableIds.length === dispatchableItems.length) setSelectedIds([]);
    else setSelectedIds(dispatchableItems.map(item => item.id));
  };
  const handleToggleSelect = (id: string) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

  const confirmBatchDispatch = () => {
    if (!executionRole) { toast.error('请选择执行角色'); return; }
    toast.success('批量派单成功', { description: `已将 ${selectedDispatchableIds.length} 个客户商机派发至${dispatchSystem}` });
    setBatchDispatchDialogOpen(false); setSelectedIds([]);
  };

  // 切换派发系统时重置执行角色
  const handleDispatchSystemChange = (system: '网格通' | '在线') => {
    setDispatchSystem(system);
    if (system === '在线') {
      setExecutionRole('10086');
    } else {
      // 切换回网格通时清空执行角色，需用户手动选择
      setExecutionRole('');
    }
  };

  // 可调级商机：待派单状态可发起调级（调级中为独立状态，不在可派单范围内）
  const adjustableItems = dispatchableItems;
  const selectedAdjustableIds = selectedIds.filter(id => adjustableItems.some(item => item.id === id));
  const selectedAdjustableItems = adjustableItems.filter(item => selectedAdjustableIds.includes(item.id));
  // 被排除的"调级中"条数
  const excludedAdjustCount = selectedDispatchableIds.length - selectedAdjustableIds.length;

  const handleOpenBatchAdjust = () => {
    if (selectedAdjustableIds.length === 0) { toast.error('所选商机均不可调级，请勾选待派单商机'); return; }
    setBatchAdjustForm({ newRating: '', reason: '', approver: '', attachments: [] });
    setBatchAdjustDialogOpen(true);
  };
  const handleSubmitBatchAdjust = () => {
    if (!batchAdjustForm.newRating) { toast.error('请选择新评级'); return; }
    if (!batchAdjustForm.reason.trim()) { toast.error('请输入调级原因'); return; }
    if (!batchAdjustForm.approver) { toast.error('请选择审批人'); return; }
    toast.success('批量调级申请已提交', { description: `已对 ${selectedAdjustableIds.length} 个客户商机提交调级申请` });
    setBatchAdjustDialogOpen(false); setSelectedIds([]);
  };

  const confirmDispatch = () => {
    if (!dispatchScenario) { toast.error('请选择运营场景'); return; }
    if (!executionRole) { toast.error('请选择执行角色'); return; }
    if (!dispatchApprover) { toast.error('请选择审批人'); return; }
    setDispatchDialogOpen(false); setSelectedForAction(null);
  };

  // 脱敏函数


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">客户商机</h1>
          <p className="text-sm text-muted-foreground mt-1">单客户商机管理，支持派单、调级等操作</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8" onClick={handleOpenAddDialog}>
            <Plus className="w-4 h-4 mr-1" />新增商机
          </Button>
        </div>
      </div>

      {/* 筛选面板 */}
      <Card className="p-4 mb-4">
        <OpportunityFilterPanel
          tagFilters={[
            { key: 'status', label: '状态', options: Object.entries(STATUS).map(([k, v]) => ({ value: k, label: v.label, count: statusCounts[k as keyof typeof statusCounts] })) },
            { key: 'rating', label: '评级', options: Object.entries(RATING_LEVELS).map(([k, v]) => ({ value: k, label: v.label })) },
            { key: 'validity', label: '有效期', options: [
              { value: 'expiring', label: '即将过期' },
              { value: 'normal', label: '正常' },
              { value: 'expired', label: '已结束' },
            ]},
          ]}
          tagValues={{ status: filterStatus, rating: filterRating, validity: filterValidity }}
          onTagChange={(key, value) => {
            if (key === 'status') { setFilterStatus(value); setCurrentPage(1); }
            else if (key === 'rating') { setFilterRating(value); setCurrentPage(1); }
            else if (key === 'validity') { setFilterValidity(value); setCurrentPage(1); }
          }}
          idSearchValue={searchId}
          onIdSearchChange={(v) => { setSearchId(v); setCurrentPage(1); }}
          selectFilters={[
            { key: 'businessType', label: '业务类型', options: businessTypeOptions, placeholder: '全部类型' },
            { key: 'source', label: '商机源', options: sourceOptions, placeholder: '全部来源' },
            { key: 'region', label: '区域', options: regionOptions, placeholder: '全部区域' },
          ]}
          selectValues={{ businessType: searchBusinessType, source: searchSource, region: searchRegion }}
          onSelectChange={(key, value) => {
            if (key === 'businessType') { setSearchBusinessType(value); setCurrentPage(1); }
            else if (key === 'source') { setSearchSource(value); setCurrentPage(1); }
            else if (key === 'region') { setSearchRegion(value); setCurrentPage(1); }
          }}
          cascadeFilters={[{
            key: 'category',
            levels: [
              { key: 'categoryL1', label: '一级分类', placeholder: '请选择', options: categoryOptions.level1 },
              { key: 'categoryL2', label: '二级分类', placeholder: '请选择', options: level2Options, parentKey: 'categoryL1' },
              { key: 'categoryL3', label: '三级分类', placeholder: '请选择', options: level3Options, parentKey: 'categoryL2' },
            ],
          }]}
          cascadeValues={{ categoryL1: searchCategoryL1, categoryL2: searchCategoryL2, categoryL3: searchCategoryL3 }}
          onCascadeChange={(key, value) => {
            if (key === 'categoryL1') handleLevel1Change(value);
            else if (key === 'categoryL2') handleLevel2Change(value);
            else if (key === 'categoryL3') { setSearchCategoryL3(value); setCurrentPage(1); }
          }}
          onReset={handleReset}
          totalCount={filteredData.length}
          totalLabel="客户商机"
        />
      </Card>

      {/* 批量操作栏 */}
      {selectedDispatchableIds.length > 0 && (
        <div className="mb-3 flex items-center gap-3 px-4 py-2.5 bg-primary/5 rounded-lg border border-primary/10">
          <span className="text-sm text-muted-foreground">
            已选 <span className="font-medium text-primary">{selectedDispatchableIds.length}</span> 条商机
          </span>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => { setDispatchSystem('网格通'); setExecutionRole(''); setBatchDispatchDialogOpen(true); }}>
            <Send className="w-3.5 h-3.5 mr-1" />批量派单
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            disabled={selectedAdjustableIds.length === 0}
            title={selectedAdjustableIds.length === 0 ? '所选商机均不可调级' : '批量调级'}
            onClick={handleOpenBatchAdjust}
          >
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />批量调级
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>取消选择</Button>
        </div>
      )}

      <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[3%]">
                  <Checkbox
                    checked={dispatchableItems.length > 0 && selectedDispatchableIds.length === dispatchableItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[8%]">商机ID</TableHead>
                <TableHead className="w-[10%]">商机业务类型</TableHead>
                <TableHead className="w-[9%]">商机分类</TableHead>
                <TableHead className="w-[6%]">商机源</TableHead>
                <TableHead className="w-[5%]">评级</TableHead>
                <TableHead className="w-[9%]">推荐产品</TableHead>
                <TableHead className="w-[7%]">最新采集时间</TableHead>
                <TableHead className="w-[6%]">采集周期</TableHead>
                <TableHead className="w-[5%]">状态</TableHead>
                <TableHead className="w-[7%] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => {
                  const validity = getValidityStatus(item.validHours, item.status);
                  const validUntil = getValidUntil(item.collectTime, item.validHours);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.status === 'PENDING_DISPATCH' ? (
                          <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => handleToggleSelect(item.id)} />
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium text-primary">{item.id}</TableCell>
                      <TableCell className="text-sm text-foreground">{item.businessTypeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.source}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${RATING_LEVELS[item.rating].color} font-medium`}>
                          {RATING_LEVELS[item.rating].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.recommendedProducts && item.recommendedProducts.length > 0 ? (
                          <span className="text-sm text-foreground">{item.recommendedProducts.map(p => p.name).join('、')}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{item.collectTime.split(' ')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {item.collectCycle || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS[item.status].color} font-normal`}>
                          {STATUS[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.status === 'PENDING_DISPATCH' && (
                            <>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-primary hover:text-primary border-primary/20 hover:bg-primary/5" onClick={() => handleDispatch(item)}>
                                <Send className="w-3.5 h-3.5 mr-1" />派单
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => handleOpenRatingAdjust(item)}>
                                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />调级
                              </Button>
                            </>
                          )}
                          {item.status === 'RATING_ADJUSTING' && (
                            <Button variant="outline" size="sm" className="h-7 px-2 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => router.push(`/workspace/business-opportunity/rating-adjustment?code=${encodeURIComponent(item.id)}`)}>
                              <ArrowUpDown className="w-3.5 h-3.5 mr-1" />调级中
                            </Button>
                          )}
                          {item.status === 'COMPLETED' && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground" onClick={() => handleViewDetail(item)}>
                              <Eye className="w-3.5 h-3.5 mr-1" />详情
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">
                第 {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredData.length)} 条，共 {filteredData.length} 条
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
              </div>
            </div>
          )}
        </Card>

      {/* 派单确认弹窗 */}
      <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>派单确认</DialogTitle>
            <DialogDescription>确认将此商机派发至{dispatchSystem}</DialogDescription>
          </DialogHeader>
          {selectedForAction && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Database className="w-4 h-4" />商机基本信息</h4>
                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                  <div><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedForAction.id}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">商机评级</div><Badge variant="outline" className={`${RATING_LEVELS[selectedForAction.rating].color} font-medium`}>{RATING_LEVELS[selectedForAction.rating].label}</Badge></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">商机分类</div><div className="text-sm">{selectedForAction.category}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">执行客户</div><div className="text-sm font-medium font-mono">{selectedForAction.executionCustomer}</div></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">区域信息</div><div className="text-sm">{selectedForAction.region}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">采集时间</div><div className="text-sm">{selectedForAction.collectTime}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">采集周期</div><div className="text-sm">{selectedForAction.collectCycle || '-'}</div></div>
                </div>
              </div>
              {selectedForAction.recommendedReason && (
                <div className="text-xs text-muted-foreground">推荐原因：{selectedForAction.recommendedReason}</div>
              )}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="w-4 h-4" />派单配置</h4>
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>运营场景</span>
                    <Select value={dispatchScenario} onValueChange={setDispatchScenario}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="请选择运营场景" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="流量运营">流量运营</SelectItem>
                        <SelectItem value="中高端运营">中高端运营</SelectItem>
                        <SelectItem value="离网维系">离网维系</SelectItem>
                        <SelectItem value="家庭运营">家庭运营</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-20 shrink-0">工单类型</span>
                    <Select value="商机调度" disabled>
                      <SelectTrigger className="flex-1 bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="商机调度">商机调度</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>工单标题</span><Input className="flex-1" placeholder="请输入工单标题" defaultValue={selectedForAction.category.split('/').pop() || ''} /></div>
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-muted-foreground w-20 shrink-0 mt-2">工单描述</span>
                    <Textarea className="flex-1 min-h-[80px]" placeholder="请输入工单描述（选填）" value={dispatchDesc} onChange={(e) => setDispatchDesc(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0">要求完成时间</span><Input type="datetime-local" className="flex-1" /></div>
                  <div className="space-y-2"><span className="text-sm text-muted-foreground">推荐产品</span>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {singleDispatchProducts.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/5 rounded text-xs">
                          {p.name} <span className="text-muted-foreground">¥{p.price}</span>
                          <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSingleDispatchProducts(prev => prev.filter(pp => pp.id !== p.id))} />
                        </span>
                      ))}
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSingleProductSelectorOpen(true)}>+ 选择推荐产品</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>派发系统</span>
                    <div className="flex-1 flex gap-3">
                      {(['网格通', '在线'] as const).map(sys => (
                        <label key={sys} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${dispatchSystem === sys ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                          <input type="radio" name="dispatchSystem" checked={dispatchSystem === sys} onChange={() => handleDispatchSystemChange(sys)} className="accent-primary" />
                          <span className="text-sm">{sys}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>执行角色</span>
                    <div className="flex-1 flex gap-3">
                      {dispatchSystem === '网格通' ? (
                        ['地市集运', '网格经理'].map(role => (
                          <label key={role} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${executionRole === role ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                            <input type="radio" name="executionRole" checked={executionRole === role} onChange={() => setExecutionRole(role)} className="accent-primary" />
                            <span className="text-sm">{role}</span>
                          </label>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary bg-primary/5 text-primary">
                          <input type="radio" checked readOnly className="accent-primary" />
                          <span className="text-sm">10086</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>审批人</span>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start"
                      onClick={() => { setApproverTarget('dispatch'); setTempApprover(dispatchApprover); setApproverSearch(''); setApproverDialogOpen(true); }}
                    >
                      {dispatchApprover
                        ? (() => { const p = approverList.find(a => a.id === dispatchApprover); return p ? `${p.name}（${p.dept}）` : dispatchApprover; })()
                        : <span className="text-muted-foreground flex items-center"><Plus className="w-4 h-4 mr-1" />选择审批人</span>}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100"><div className="text-sm text-amber-700">派单后商机将进入{dispatchSystem}执行流程，审批通过后分配至{executionRole || '对应角色'}处理。</div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchDialogOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={confirmDispatch}>确认派单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量派单弹窗 */}
      <Dialog open={batchDispatchDialogOpen} onOpenChange={setBatchDispatchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量派单确认</DialogTitle>
            <DialogDescription>确认将选中的 {selectedDispatchableIds.length} 个客户商机批量派发至{dispatchSystem}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Settings className="w-4 h-4" />调度配置</h4>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>派发系统</span>
                  <div className="flex-1 flex gap-3">
                    {(['网格通', '在线'] as const).map(sys => (
                      <label key={sys} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${dispatchSystem === sys ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                        <input type="radio" name="batchDispatchSystem" checked={dispatchSystem === sys} onChange={() => handleDispatchSystemChange(sys)} className="accent-primary" />
                        <span className="text-sm">{sys}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>执行角色</span>
                  <div className="flex-1 flex gap-3">
                    {dispatchSystem === '网格通' ? (
                      ['地市集运', '网格经理'].map(role => (
                        <label key={role} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${executionRole === role ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                          <input type="radio" name="batchExecutionRole" checked={executionRole === role} onChange={() => setExecutionRole(role)} className="accent-primary" />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary bg-primary/5 text-primary">
                        <input type="radio" checked readOnly className="accent-primary" />
                        <span className="text-sm">10086</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4" />商机汇总</h4>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                <div><div className="text-xs text-muted-foreground mb-1">选中商机数</div><div className="font-medium text-primary">{selectedDispatchableIds.length} 个</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">涉及网格数</div><div className="font-medium text-primary">{new Set(selectedDispatchableIds.map(id => filteredData.find(d => d.id === id)?.region).filter(Boolean)).size} 个</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">评级分布</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedDispatchableIds.reduce((acc: Record<string, number>, id) => {
                      const item = filteredData.find(d => d.id === id);
                      if (item) { const r = RATING_LEVELS[item.rating]?.label || item.rating; acc[r] = (acc[r] || 0) + 1; }
                      return acc;
                    }, {})).map(([r, c]) => <Badge key={r} variant="outline" className="text-xs">{r}({c})</Badge>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><MapPin className="w-4 h-4" />区域预览</h4>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="space-y-2">
                  {Object.entries(selectedDispatchableIds.reduce((acc: Record<string, number>, id) => {
                    const item = filteredData.find(d => d.id === id);
                    if (item) { const grid = item.region.split(/区|县/).pop()?.replace(/网格$/, '') || item.region; const key = grid.includes('网格') ? grid : grid + '网格'; acc[key] = (acc[key] || 0) + 1; }
                    return acc;
                  }, {})).map(([grid, count]) => (
                    <div key={grid} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{grid}</span><span className="text-primary font-medium">{count} 个客户</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20 text-sm text-primary">
                  预计拆 {new Set(selectedDispatchableIds.map(id => filteredData.find(d => d.id === id)?.region).filter(Boolean)).size} 个子单（按网格拆分）
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Package className="w-4 h-4" />推荐产品</h4>
              <div className="p-3 bg-muted/30 rounded-lg border">
                {batchDispatchProducts.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {batchDispatchProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-1 px-2 py-1 bg-primary/5 rounded border border-primary/10">
                        <span className="text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground">¥{p.price}{p.category === '流量产品' ? '/份' : '/月'}</span>
                        <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setBatchDispatchProducts(prev => prev.filter(pp => pp.id !== p.id))} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂未选择推荐产品</p>
                )}
                <Button variant="outline" size="sm" onClick={() => setBatchProductSelectorOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" />选择推荐产品
                </Button>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-sm text-amber-700">批量派单后，{dispatchSystem}将按网格自动拆分 {selectedDispatchableIds.length} 个商机的子工单，并分配至对应{executionRole || '角色'}处理。</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDispatchDialogOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={confirmBatchDispatch}>确认派单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 - 客户信息脱敏展示 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" />商机详情</DialogTitle>
            <DialogDescription>查看商机的详细信息与执行情况</DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="execution">执行轨迹</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedOpportunity.id}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机评级</div><Badge variant="outline" className={`${RATING_LEVELS[selectedOpportunity.rating].color} font-medium`}>{RATING_LEVELS[selectedOpportunity.rating].label}</Badge></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机分类</div><div className="text-sm">{selectedOpportunity.category}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">商机源</div><div className="text-sm">{selectedOpportunity.source}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">运营场景</div><div className="text-sm text-primary">{selectedOpportunity.businessScenario}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">采集周期</div><div className="text-sm">{selectedOpportunity.collectCycle || '-'}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">执行客户</div><div className="text-sm font-medium font-mono">{selectedOpportunity.executionCustomer}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg col-span-2"><div className="text-xs text-muted-foreground mb-1">区域信息</div><div className="text-sm">{selectedOpportunity.region}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">采集时间</div><div className="text-sm">{selectedOpportunity.collectTime}</div></div>
                    <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">状态</div><Badge className={`${STATUS[selectedOpportunity.status].color} font-normal`}>{STATUS[selectedOpportunity.status].label}</Badge></div>
                    {selectedOpportunity.recommendedProducts && selectedOpportunity.recommendedProducts.length > 0 && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10"><div className="text-xs text-primary mb-1">推荐产品</div><div className="text-sm font-medium">{selectedOpportunity.recommendedProducts.map(p => p.name).join('、')}</div></div>
                    )}
                    {selectedOpportunity.assignedTo && (
                      <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">处理人</div><div className="text-sm font-medium">{selectedOpportunity.assignedTo}</div></div>
                    )}
                    {selectedOpportunity.assignTime && (
                      <div className="p-3 bg-muted/50 rounded-lg"><div className="text-xs text-muted-foreground mb-1">派单时间</div><div className="text-sm">{selectedOpportunity.assignTime}</div></div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="execution" className="space-y-4 pt-4">
                  {selectedOpportunity.conversionResult && (
                    <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">转化结果：</span>
                        {selectedOpportunity.conversionResult === 'SUCCESS' ? <Badge className="bg-green-100 text-green-600 font-normal">转化成功</Badge> :
                         selectedOpportunity.conversionResult === 'FAILED' ? <Badge className="bg-red-100 text-red-600 font-normal">转化失败</Badge> :
                         <Badge className="bg-blue-100 text-blue-600 font-normal">处理中</Badge>}
                      </div>
                    </div>
                  )}
                  {selectedOpportunity.conversionDetail && selectedOpportunity.conversionResult === 'SUCCESS' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-medium text-green-700">转化成功</span></div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-muted-foreground">办理产品：</span><span className="font-medium ml-2">{selectedOpportunity.conversionDetail.product}</span></div>
                        <div><span className="text-muted-foreground">月费金额：</span><span className="font-medium ml-2 text-green-600">¥{selectedOpportunity.conversionDetail.amount}</span></div>
                      </div>
                    </div>
                  )}
                  {selectedOpportunity.conversionDetail && selectedOpportunity.conversionResult === 'FAILED' && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-2"><XCircle className="w-5 h-5 text-red-500" /><span className="font-medium text-red-700">转化失败</span></div>
                      <div className="text-sm"><span className="text-muted-foreground">失败原因：</span><span className="ml-2">{selectedOpportunity.conversionDetail.reason}</span></div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />执行轨迹</h4>
                    <div className="relative pl-6 border-l-2 border-border space-y-4">
                      {selectedOpportunity.executionRecords.map((record, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-card border-2 border-primary/40" />
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{record.action}</span><span className="text-xs text-muted-foreground">{record.time}</span></div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>操作人：{record.operator}</span><span>结果：{record.result}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailDialogOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 推荐产品选择弹窗 - 单个派单 */}
      <ProductSelector
        open={singleProductSelectorOpen}
        onOpenChange={setSingleProductSelectorOpen}
        onConfirm={(products) => setSingleDispatchProducts(products)}
        selectedIds={singleDispatchProducts.map(p => p.id)}
      />

      {/* 推荐产品选择弹窗 - 批量派单 */}
      <ProductSelector
        open={batchProductSelectorOpen}
        onOpenChange={setBatchProductSelectorOpen}
        onConfirm={(products) => setBatchDispatchProducts(products)}
        selectedIds={batchDispatchProducts.map(p => p.id)}
      />

      {/* 调级弹窗 */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-amber-500" />
              商机调级申请
            </DialogTitle>
            <DialogDescription>填写调级信息，提交后进入审批流程</DialogDescription>
          </DialogHeader>
          {adjustTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">商机编码</div>
                  <div className="text-sm font-medium text-primary">{adjustTarget.id}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">商机名称</div>
                  <div className="text-sm font-medium">{adjustTarget.businessTypeId}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">当前评级</div>
                  <Badge variant="outline" className={`${RATING_LEVELS[adjustTarget.rating].color} font-medium`}>
                    {RATING_LEVELS[adjustTarget.rating].label}
                  </Badge>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">当前状态</div>
                  <Badge className={`${STATUS[adjustTarget.status].color} font-normal`}>{STATUS[adjustTarget.status].label}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">新评级 <span className="text-red-500">*</span></label>
                <Select value={adjustForm.newRating} onValueChange={(v) => setAdjustForm({ ...adjustForm, newRating: v })}>
                  <SelectTrigger><SelectValue placeholder="请选择新评级" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">高</SelectItem>
                    <SelectItem value="MEDIUM">中</SelectItem>
                    <SelectItem value="LOW">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">调级原因 <span className="text-red-500">*</span></label>
                <Textarea
                  placeholder="请输入调级原因（200字以内）"
                  maxLength={200}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="min-h-[80px]"
                />
                <div className="text-xs text-muted-foreground text-right">{adjustForm.reason.length}/200</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">附件上传</label>
                  <div className="border border-dashed rounded-md p-3 space-y-2">
                    <label className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                      <Upload className="h-4 w-4" />
                      点击上传附件
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const fileNames = Array.from(e.target.files).map(f => f.name);
                            setAdjustForm({ ...adjustForm, attachments: [...adjustForm.attachments, ...fileNames] });
                          }
                        }}
                      />
                    </label>
                    {adjustForm.attachments.length > 0 && (
                      <div className="space-y-1">
                        {adjustForm.attachments.map((fileName, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                            <span className="truncate flex-1">{fileName}</span>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-600 ml-2"
                              onClick={() => setAdjustForm({ ...adjustForm, attachments: adjustForm.attachments.filter((_, i) => i !== idx) })}
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">支持PDF、图片等格式</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">审批人 <span className="text-red-500">*</span></label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => { setApproverTarget('single'); setTempApprover(adjustForm.approver); setApproverSearch(''); setApproverDialogOpen(true); }}
                  >
                    {adjustForm.approver
                      ? (() => { const p = approverList.find(a => a.id === adjustForm.approver); return p ? `${p.name}（${p.dept}）` : adjustForm.approver; })()
                      : <span className="text-muted-foreground flex items-center"><Plus className="w-4 h-4 mr-1" />选择审批人</span>}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>取消</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSubmitAdjust}>提交调级申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量调级弹窗 */}
      <Dialog open={batchAdjustDialogOpen} onOpenChange={setBatchAdjustDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-amber-500" />
              批量调级申请
            </DialogTitle>
            <DialogDescription>
              确认对选中的 {selectedAdjustableIds.length} 个客户商机批量调级，提交后进入审批流程
              {excludedAdjustCount > 0 && <span className="text-amber-600">（已自动排除 {excludedAdjustCount} 条调级中的商机）</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* 商机汇总 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4" />商机汇总</h4>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">待调级商机数</div>
                  <div className="font-medium text-primary">{selectedAdjustableIds.length} 个</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">当前评级分布</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedAdjustableItems.reduce((acc: Record<string, number>, item) => {
                      const r = RATING_LEVELS[item.rating]?.label || item.rating;
                      acc[r] = (acc[r] || 0) + 1;
                      return acc;
                    }, {})).map(([r, c]) => (
                      <Badge key={r} variant="outline" className="text-xs">{r}({c})</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {/* 选中商机列表 */}
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {selectedAdjustableItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 border-b last:border-b-0 text-sm">
                    <span className="font-medium text-primary shrink-0">{item.id}</span>
                    <span className="text-muted-foreground truncate flex-1">{item.businessTypeName}</span>
                    <Badge variant="outline" className={`${RATING_LEVELS[item.rating].color} font-medium shrink-0`}>
                      {RATING_LEVELS[item.rating].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 调级配置 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><ArrowUpDown className="w-4 h-4" />调级配置</h4>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">新评级 <span className="text-red-500">*</span></label>
                  <Select value={batchAdjustForm.newRating} onValueChange={(v) => setBatchAdjustForm({ ...batchAdjustForm, newRating: v })}>
                    <SelectTrigger><SelectValue placeholder="请选择新评级（应用到全部所选商机）" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">高</SelectItem>
                      <SelectItem value="MEDIUM">中</SelectItem>
                      <SelectItem value="LOW">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">调级原因 <span className="text-red-500">*</span></label>
                  <Textarea
                    placeholder="请输入调级原因（200字以内）"
                    maxLength={200}
                    value={batchAdjustForm.reason}
                    onChange={(e) => setBatchAdjustForm({ ...batchAdjustForm, reason: e.target.value })}
                    className="min-h-[80px]"
                  />
                  <div className="text-xs text-muted-foreground text-right">{batchAdjustForm.reason.length}/200</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">附件上传</label>
                    <div className="border border-dashed rounded-md p-3 space-y-2">
                      <label className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                        <Upload className="h-4 w-4" />
                        点击上传附件
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const fileNames = Array.from(e.target.files).map(f => f.name);
                              setBatchAdjustForm({ ...batchAdjustForm, attachments: [...batchAdjustForm.attachments, ...fileNames] });
                            }
                          }}
                        />
                      </label>
                      {batchAdjustForm.attachments.length > 0 && (
                        <div className="space-y-1">
                          {batchAdjustForm.attachments.map((fileName, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                              <span className="truncate flex-1">{fileName}</span>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-600 ml-2"
                                onClick={() => setBatchAdjustForm({ ...batchAdjustForm, attachments: batchAdjustForm.attachments.filter((_, i) => i !== idx) })}
                              >
                                删除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">支持PDF、图片等格式</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">审批人 <span className="text-red-500">*</span></label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => { setApproverTarget('batch'); setTempApprover(batchAdjustForm.approver); setApproverSearch(''); setApproverDialogOpen(true); }}
                    >
                      {batchAdjustForm.approver
                        ? (() => { const p = approverList.find(a => a.id === batchAdjustForm.approver); return p ? `${p.name}（${p.dept}）` : batchAdjustForm.approver; })()
                        : <span className="text-muted-foreground flex items-center"><Plus className="w-4 h-4 mr-1" />选择审批人</span>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-sm text-amber-700">提交后，{selectedAdjustableIds.length} 个商机将统一调整为新评级，并进入审批流程。审批期间这些商机暂不可派单。</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchAdjustDialogOpen(false)}>取消</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSubmitBatchAdjust}>提交批量调级申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审批人选择弹窗 */}
      <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择审批人</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 min-h-[280px]">
            {/* 左侧组织架构 */}
            <div className="w-1/3 border-r border-border pr-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <FolderOpen className="h-4 w-4" />组织架构
              </div>
              <div className="space-y-1">
                <div className="rounded-md bg-primary/5 px-3 py-2 text-sm font-medium text-foreground cursor-pointer">
                  中国移动通信集团新疆有限公司
                </div>
              </div>
            </div>
            {/* 右侧人员列表 */}
            <div className="flex-1">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入人员名称"
                  value={approverSearch}
                  onChange={(e) => setApproverSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-1 max-h-[220px] overflow-y-auto">
                {approverList
                  .filter(p => !approverSearch || p.name.includes(approverSearch) || p.dept.includes(approverSearch))
                  .map(p => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors ${tempApprover === p.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                    >
                      <input
                        type="radio"
                        name="approver"
                        checked={tempApprover === p.id}
                        onChange={() => setTempApprover(p.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.dept}</div>
                      </div>
                    </label>
                  ))}
                {approverList.filter(p => !approverSearch || p.name.includes(approverSearch) || p.dept.includes(approverSearch)).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">未找到匹配的人员</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproverDialogOpen(false)}>取消</Button>
            <Button onClick={() => {
              if (approverTarget === 'batch') setBatchAdjustForm({ ...batchAdjustForm, approver: tempApprover });
              else if (approverTarget === 'dispatch') setDispatchApprover(tempApprover);
              else setAdjustForm({ ...adjustForm, approver: tempApprover });
              setApproverDialogOpen(false);
            }}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增商机弹窗 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增商机</DialogTitle>
            <DialogDescription>填写商机信息，创建新的客户商机</DialogDescription>
          </DialogHeader>
          {/* 模式切换：单条录入 / 批量导入 */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg w-fit">
            <button
              onClick={() => setAddMode('single')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${addMode === 'single' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >单条录入</button>
            <button
              onClick={() => { setAddMode('batch'); setImportRows([]); setImportFileName(''); }}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${addMode === 'batch' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            ><Upload className="w-3.5 h-3.5" />批量导入</button>
          </div>
          {addMode === 'single' && (
          <div className="space-y-5">
            {/* 商机业务信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">商机业务信息</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机业务类型名称 <span className="text-red-500">*</span></label>
                  <Select value={addForm.businessTypeName} onValueChange={handleBusinessTypeChange}>
                    <SelectTrigger><SelectValue placeholder="请选择商机业务类型" /></SelectTrigger>
                    <SelectContent>
                      {businessTypeOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机业务类型ID</label>
                  <Input value={addForm.businessTypeId} readOnly placeholder="选择类型后自动填充" className="bg-muted/50" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机名称 <span className="text-red-500">*</span></label>
                  <Input placeholder="请输入商机名称" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">一级分类</label>
                  <Select value={addForm.categoryL1} onValueChange={handleAddLevel1Change}>
                    <SelectTrigger><SelectValue placeholder="请选择一级分类" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.level1.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">二级分类</label>
                  <Select value={addForm.categoryL2} onValueChange={handleAddLevel2Change} disabled={!addForm.categoryL1}>
                    <SelectTrigger><SelectValue placeholder="请选择二级分类" /></SelectTrigger>
                    <SelectContent>
                      {(addForm.categoryL1 ? categoryOptions.level2[addForm.categoryL1 as keyof typeof categoryOptions.level2] || [] : []).map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">三级分类</label>
                  <Select value={addForm.categoryL3} onValueChange={(v) => setAddForm({ ...addForm, categoryL3: v })} disabled={!addForm.categoryL2}>
                    <SelectTrigger><SelectValue placeholder="请选择三级分类" /></SelectTrigger>
                    <SelectContent>
                      {(addForm.categoryL2 ? categoryOptions.level3[addForm.categoryL2 as keyof typeof categoryOptions.level3] || [] : []).map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机源</label>
                  <Select value={addForm.source} onValueChange={(v) => setAddForm({ ...addForm, source: v })}>
                    <SelectTrigger><SelectValue placeholder="请选择商机源" /></SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机评级 <span className="text-red-500">*</span></label>
                  <Select value={addForm.rating} onValueChange={(v) => setAddForm({ ...addForm, rating: v })}>
                    <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">高</SelectItem>
                      <SelectItem value="MEDIUM">中</SelectItem>
                      <SelectItem value="LOW">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">商机描述</label>
                  <Textarea placeholder="请输入商机描述" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className="resize-none" rows={3} />
                </div>
              </div>
            </div>

            {/* 客户信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">客户信息</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">客户姓名</label>
                  <Input placeholder="请输入客户姓名（选填）" value={addForm.customerName} onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">联系电话 <span className="text-red-500">*</span></label>
                  <Input placeholder="请输入手机号" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">区域信息 <span className="text-red-500">*</span></label>
                  <Select value={addForm.region} onValueChange={(v) => setAddForm({ ...addForm, region: v })}>
                    <SelectTrigger><SelectValue placeholder="请选择区域" /></SelectTrigger>
                    <SelectContent>
                      {regionOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 推荐信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">推荐信息</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">推荐产品</label>
                  <Select value={addForm.recommendedProduct} onValueChange={(v) => setAddForm({ ...addForm, recommendedProduct: v })}>
                    <SelectTrigger><SelectValue placeholder="请选择推荐产品" /></SelectTrigger>
                    <SelectContent>
                      {productOptions.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">推荐理由</label>
                  <Textarea placeholder="请输入推荐理由" value={addForm.recommendedReason} onChange={(e) => setAddForm({ ...addForm, recommendedReason: e.target.value })} className="resize-none" rows={3} />
                </div>
              </div>
            </div>
          </div>
          )}
          {addMode === 'batch' && (
          <div className="space-y-5">
            {/* 步骤1：下载模板 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium"><span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>下载导入模板</div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-3.5 h-3.5 mr-1" />下载导入模板
                </Button>
                <span className="text-xs text-muted-foreground">CSV 格式，含字段表头与示例行；客户姓名为选填，其余字段必填</span>
              </div>
            </div>
            {/* 步骤2：上传文件 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium"><span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>上传文件</div>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{importFileName ? `已上传：${importFileName}` : '点击选择或拖拽文件到此处'}</span>
                <span className="text-xs text-muted-foreground">支持 .xlsx / .xls / .csv，单次 ≤ 1000 条</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }}
                />
              </label>
            </div>
            {/* 步骤3：导入预览 */}
            {importRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium"><span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>导入预览</div>
                  <div className="text-xs text-muted-foreground">
                    共 {importRows.length} 条，<span className="text-green-600 font-medium">成功 {importRows.filter(r => r.valid).length}</span> 条，<span className="text-red-600 font-medium">失败 {importRows.filter(r => !r.valid).length}</span> 条
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[10%]">状态</TableHead>
                        <TableHead className="w-[25%]">业务类型</TableHead>
                        <TableHead className="w-[22%]">商机名称</TableHead>
                        <TableHead className="w-[8%]">评级</TableHead>
                        <TableHead className="w-[15%]">客户姓名</TableHead>
                        <TableHead className="w-[15%]">联系电话</TableHead>
                        <TableHead className="w-[5%]">原因</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.valid ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}</TableCell>
                          <TableCell className="text-sm">{row.businessType}</TableCell>
                          <TableCell className="text-sm">{row.name || <span className="text-red-500">（空）</span>}</TableCell>
                          <TableCell className="text-sm">{row.rating}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.customerName || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">{row.phone}</TableCell>
                          <TableCell className="text-xs text-red-500">{row.reason || ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>返回</Button>
            {addMode === 'single' ? (
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmitAdd}>确定</Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90" disabled={importRows.filter(r => r.valid).length === 0} onClick={handleConfirmImport}>
                确认导入（{importRows.filter(r => r.valid).length} 条）
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
