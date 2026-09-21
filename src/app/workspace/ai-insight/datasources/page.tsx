'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Search,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Trash2,
  Link2,
  Calendar,
  HardDrive,
  Table2,
  X,
  FileUp,
  LayoutGrid,
  List,
  Database,
  ChevronDown,
  ChevronRight,
  Server,
  Plus,
  CheckCircle2,
  ArrowRight,
  Shield,
  Info,
  FileText,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

type QualityStatus = 'verified' | 'pending' | 'error';
type SemanticType = 'id' | 'time' | 'amount' | 'enum' | 'percent' | 'region' | 'mobile' | 'email' | 'code' | 'other';

interface FieldProfile {
  name: string;
  dataType: 'string' | 'integer' | 'float' | 'datetime' | 'boolean';
  semanticType: SemanticType;
  semanticLabel: string;
  nonNullRate: number;
  uniqueCount: number;
  min?: number; max?: number; mean?: number; median?: number; std?: number;
  topValues?: { value: string; count: number; pct: number }[];
  timeRange?: { start: string; end: string; granularity: string };
  corrected?: boolean;
  // 兼容字段：详情弹窗使用
  type?: string;
  nullRate?: string;
  sampleValue?: string;
}

interface QualityDimension {
  name: string; key: string; score: number; detail: string;
}

interface DataSource {
  id: string;
  name: string;
  uploadTime: string;
  uploader: string;
  dataTimeRange: string;
  linkedReports: { name: string; status: '进行中' | '已归档' }[];
  quality: QualityStatus;
  qualityScore: number;
  size: string;
  rows: number;
  columns: number;
  fileType: string;
  columnPreview: { name: string; type: string; caliber?: string }[];
  checkResults: { item: string; status: 'pass' | 'warn' | 'fail'; detail: string }[];
  /* G1: 探查画像 */
  profiled: boolean;
  qualityDimensions: QualityDimension[];
  fieldProfiles: FieldProfile[];
  sampleRows: Record<string, string>[];
}

const qualityConfig: Record<QualityStatus, { label: string; className: string; icon: React.ReactNode }> = {
  verified: { label: '已校验', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: '待校验', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="w-3 h-3" /> },
  error: { label: '异常', className: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle className="w-3 h-3" /> },
};

const checkStatusConfig = {
  pass: { className: 'text-emerald-600', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  warn: { className: 'text-amber-600', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  fail: { className: 'text-red-600', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const semanticConfig: Record<SemanticType, { label: string; color: string }> = {
  id: { label: 'ID', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  time: { label: '时间', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  amount: { label: '金额', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  enum: { label: '枚举', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  percent: { label: '百分比', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  region: { label: '地域', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  mobile: { label: '手机号', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  email: { label: '邮箱', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  code: { label: '编码', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  other: { label: '其他', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const mockDataSources: DataSource[] = [
  { id: 'ds1', name: '6月经分数据.xlsx', uploadTime: '06-27 10:30', uploader: '张三', dataTimeRange: '2026.05-06', linkedReports: [{ name: '6月经营分析报告', status: '进行中' }, { name: '流量运营专项分析', status: '已归档' }], quality: 'verified', qualityScore: 95, size: '12.3MB', rows: 1256, columns: 24, columnPreview: [{ name: '移动ARPU', type: '数值(元)', caliber: '月均ARPU' }, { name: '出账用户数', type: '整数', caliber: '当月出账' }, { name: 'DOU', type: '数值(GB)', caliber: '月均DOU' }, { name: '地市', type: '文本' }, { name: '月份', type: '日期' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'pass', detail: '无空行空列，日期连续' }, { item: '逻辑校验', status: 'pass', detail: '数值均在合理范围' }], fileType: 'xlsx',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 96, detail: '缺失率1.2%，主要在DOU字段' },
      { name: '唯一性', key: 'uniqueness', score: 98, detail: '重复行0.3%，主键唯一' },
      { name: '一致性', key: 'consistency', score: 94, detail: '2条记录数据类型不一致' },
      { name: '合法性', key: 'validity', score: 97, detail: '1条ARPU为负值' },
      { name: '时效性', key: 'timeliness', score: 90, detail: '数据更新至3天前' },
    ],
    fieldProfiles: [
      { name: '月份', dataType: 'datetime', semanticType: 'time', semanticLabel: '统计月份', nonNullRate: 1.0, uniqueCount: 2, timeRange: { start: '2026-05', end: '2026-06', granularity: '月' } },
      { name: '地市', dataType: 'string', semanticType: 'region', semanticLabel: '地市分公司', nonNullRate: 1.0, uniqueCount: 16, topValues: [{ value: '乌鲁木齐', count: 85, pct: 6.8 }, { value: '克拉玛依', count: 82, pct: 6.5 }, { value: '昌吉', count: 80, pct: 6.4 }] },
      { name: '出账用户数', dataType: 'integer', semanticType: 'other', semanticLabel: '当月出账用户', nonNullRate: 1.0, uniqueCount: 32, min: 1200, max: 89000, mean: 15600, median: 12400, std: 18200 },
      { name: '移动ARPU', dataType: 'float', semanticType: 'amount', semanticLabel: '月均ARPU(元)', nonNullRate: 0.992, uniqueCount: 245, min: 18.5, max: 286.3, mean: 52.8, median: 45.2, std: 32.6 },
      { name: 'DOU', dataType: 'float', semanticType: 'amount', semanticLabel: '月均DOU(GB)', nonNullRate: 0.988, uniqueCount: 312, min: 0.2, max: 58.6, mean: 12.3, median: 9.8, std: 8.7 },
      { name: '5G用户数', dataType: 'integer', semanticType: 'other', semanticLabel: '5G用户数', nonNullRate: 1.0, uniqueCount: 28, min: 350, max: 42000, mean: 7800, median: 5200, std: 9600 },
      { name: '5G渗透率', dataType: 'float', semanticType: 'percent', semanticLabel: '5G渗透率(%)', nonNullRate: 1.0, uniqueCount: 32, min: 8.2, max: 62.5, mean: 32.1, median: 29.8, std: 12.4 },
      { name: '宽带用户数', dataType: 'integer', semanticType: 'other', semanticLabel: '宽带用户数', nonNullRate: 0.998, uniqueCount: 30, min: 800, max: 35000, mean: 6200, median: 4100, std: 7800 },
      { name: '套餐名称', dataType: 'string', semanticType: 'enum', semanticLabel: '套餐分类', nonNullRate: 0.995, uniqueCount: 8, topValues: [{ value: '全球通128', count: 320, pct: 25.5 }, { value: '动感地带58', count: 280, pct: 22.3 }, { value: '神州行38', count: 210, pct: 16.7 }] },
      { name: '渠道', dataType: 'string', semanticType: 'enum', semanticLabel: '办理渠道', nonNullRate: 1.0, uniqueCount: 5, topValues: [{ value: '营业厅', count: 520, pct: 41.4 }, { value: '线上', count: 380, pct: 30.3 }, { value: '网格经理', count: 210, pct: 16.7 }] },
    ],
    sampleRows: [
      { 月份: '2026-06', 地市: '乌鲁木齐', 出账用户数: '89,000', 移动ARPU: '52.8', DOU: '12.3', '5G用户数:': '42,000', '5G渗透率': '47.2', 宽带用户数: '35,000', 套餐名称: '全球通128', 渠道: '营业厅' },
      { 月份: '2026-06', 地市: '克拉玛依', 出账用户数: '45,200', 移动ARPU: '58.6', DOU: '15.1', '5G用户数': '22,300', '5G渗透率': '49.3', 宽带用户数: '18,500', 套餐名称: '全球通158', 渠道: '线上' },
      { 月份: '2026-05', 地市: '乌鲁木齐', 出账用户数: '88,500', 移动ARPU: '51.2', DOU: '11.8', '5G用户数': '40,100', '5G渗透率': '45.3', 宽带用户数: '34,800', 套餐名称: '动感地带58', 渠道: '网格经理' },
    ],
  },
  { id: 'ds8', name: '4月经分数据.xlsx', uploadTime: '04-28 10:00', uploader: '张三', dataTimeRange: '2026.03-04', linkedReports: [{ name: '4月经营分析报告', status: '已归档' }], quality: 'verified', qualityScore: 92, size: '11.9MB', rows: 1180, columns: 24, columnPreview: [{ name: '移动ARPU', type: '数值(元)', caliber: '月均ARPU' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'pass', detail: '通过' }, { item: '逻辑校验', status: 'pass', detail: '通过' }], fileType: 'xlsx',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 94, detail: '缺失率2.1%' },
      { name: '唯一性', key: 'uniqueness', score: 96, detail: '重复行0.5%' },
      { name: '一致性', key: 'consistency', score: 95, detail: '数据类型一致' },
      { name: '合法性', key: 'validity', score: 93, detail: '3条异常值' },
      { name: '时效性', key: 'timeliness', score: 82, detail: '数据更新至2个月前' },
    ],
    fieldProfiles: [
      { name: '月份', dataType: 'datetime', semanticType: 'time', semanticLabel: '统计月份', nonNullRate: 1.0, uniqueCount: 2, timeRange: { start: '2026-03', end: '2026-04', granularity: '月' } },
      { name: '地市', dataType: 'string', semanticType: 'region', semanticLabel: '地市分公司', nonNullRate: 1.0, uniqueCount: 16, topValues: [{ value: '乌鲁木齐', count: 80, pct: 6.8 }, { value: '克拉玛依', count: 76, pct: 6.4 }] },
      { name: '移动ARPU', dataType: 'float', semanticType: 'amount', semanticLabel: '月均ARPU(元)', nonNullRate: 0.979, uniqueCount: 198, min: 20.1, max: 275.6, mean: 50.2, median: 43.8, std: 30.5 },
    ],
    sampleRows: [
      { 月份: '2026-04', 地市: '乌鲁木齐', 移动ARPU: '50.2', DOU: '11.5', '5G渗透率': '42.1' },
    ],
  },
  { id: 'ds2', name: '5月CRM导出.csv', uploadTime: '05-29 14:20', uploader: '李四', dataTimeRange: '2026.04-05', linkedReports: [{ name: '5月经营分析报告', status: '已归档' }], quality: 'verified', qualityScore: 88, size: '8.7MB', rows: 980, columns: 18, columnPreview: [{ name: '客户类型', type: '文本' }, { name: '套餐名称', type: '文本' }, { name: '月租费', type: '数值(元)', caliber: '当月月租' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'pass', detail: '通过' }, { item: '逻辑校验', status: 'pass', detail: '通过' }], fileType: 'csv',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 90, detail: '缺失率3.5%' },
      { name: '唯一性', key: 'uniqueness', score: 92, detail: '重复行1.2%' },
      { name: '一致性', key: 'consistency', score: 88, detail: '5条记录格式不一致' },
      { name: '合法性', key: 'validity', score: 91, detail: '4条异常值' },
      { name: '时效性', key: 'timeliness', score: 79, detail: '数据更新至1个月前' },
    ],
    fieldProfiles: [
      { name: '客户ID', dataType: 'string', semanticType: 'id', semanticLabel: '客户唯一标识', nonNullRate: 1.0, uniqueCount: 980 },
      { name: '客户类型', dataType: 'string', semanticType: 'enum', semanticLabel: '客户分类', nonNullRate: 1.0, uniqueCount: 4, topValues: [{ value: '个人', count: 620, pct: 63.3 }, { value: '家庭', count: 230, pct: 23.5 }, { value: '集团', count: 130, pct: 13.3 }] },
      { name: '手机号', dataType: 'string', semanticType: 'mobile', semanticLabel: '联系电话', nonNullRate: 0.985, uniqueCount: 965 },
      { name: '套餐名称', dataType: 'string', semanticType: 'enum', semanticLabel: '套餐分类', nonNullRate: 1.0, uniqueCount: 8, topValues: [{ value: '全球通128', count: 260, pct: 26.5 }, { value: '动感地带58', count: 220, pct: 22.4 }] },
      { name: '月租费', dataType: 'float', semanticType: 'amount', semanticLabel: '月租费(元)', nonNullRate: 0.965, uniqueCount: 8, min: 18, max: 298, mean: 68.5, median: 58, std: 45.2 },
    ],
    sampleRows: [
      { 客户ID: 'C202605001', 客户类型: '个人', 手机号: '139****1234', 套餐名称: '全球通128', 月租费: '128.00' },
    ],
  },
  { id: 'ds6', name: '宽带用户数据.csv', uploadTime: '06-15 09:30', uploader: '李四', dataTimeRange: '2026.01-06', linkedReports: [{ name: '宽带业务分析报告', status: '已归档' }], quality: 'verified', qualityScore: 90, size: '22.1MB', rows: 8900, columns: 15, columnPreview: [{ name: '宽带类型', type: '文本' }, { name: '带宽', type: '数值(Mbps)' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'pass', detail: '通过' }, { item: '逻辑校验', status: 'pass', detail: '通过' }], fileType: 'csv',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 92, detail: '缺失率2.8%' },
      { name: '唯一性', key: 'uniqueness', score: 89, detail: '重复行2.1%' },
      { name: '一致性', key: 'consistency', score: 93, detail: '数据类型一致' },
      { name: '合法性', key: 'validity', score: 95, detail: '2条异常值' },
      { name: '时效性', key: 'timeliness', score: 81, detail: '数据更新至15天前' },
    ],
    fieldProfiles: [
      { name: '用户ID', dataType: 'string', semanticType: 'id', semanticLabel: '用户唯一标识', nonNullRate: 1.0, uniqueCount: 8900 },
      { name: '宽带类型', dataType: 'string', semanticType: 'enum', semanticLabel: '宽带分类', nonNullRate: 1.0, uniqueCount: 3, topValues: [{ value: '家庭宽带', count: 6200, pct: 69.7 }, { value: '企业宽带', count: 1800, pct: 20.2 }, { value: '校园宽带', count: 900, pct: 10.1 }] },
      { name: '带宽', dataType: 'float', semanticType: 'amount', semanticLabel: '带宽(Mbps)', nonNullRate: 0.972, uniqueCount: 6, min: 50, max: 1000, mean: 210, median: 200, std: 145 },
      { name: '地市', dataType: 'string', semanticType: 'region', semanticLabel: '地市', nonNullRate: 1.0, uniqueCount: 16 },
    ],
    sampleRows: [
      { 用户ID: 'B202601001', 宽带类型: '家庭宽带', 带宽: '200', 地市: '乌鲁木齐' },
    ],
  },
  { id: 'ds7', name: '客户满意度调查.xlsx', uploadTime: '06-10 14:45', uploader: '赵六', dataTimeRange: '2026.Q1', linkedReports: [], quality: 'pending', qualityScore: 72, size: '4.5MB', rows: 320, columns: 22, columnPreview: [{ name: '满意度评分', type: '数值', caliber: '1-10分' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'warn', detail: '15行评分缺失' }, { item: '逻辑校验', status: 'pass', detail: '通过' }], fileType: 'csv',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 68, detail: '缺失率8.2%，评分字段缺失严重' },
      { name: '唯一性', key: 'uniqueness', score: 95, detail: '无重复行' },
      { name: '一致性', key: 'consistency', score: 72, detail: '12条评分格式不一致' },
      { name: '合法性', key: 'validity', score: 65, detail: '8条评分超出1-10范围' },
      { name: '时效性', key: 'timeliness', score: 60, detail: '数据更新至3个月前' },
    ],
    fieldProfiles: [
      { name: '调查ID', dataType: 'string', semanticType: 'id', semanticLabel: '调查记录标识', nonNullRate: 1.0, uniqueCount: 320 },
      { name: '满意度评分', dataType: 'float', semanticType: 'other', semanticLabel: '满意度评分(1-10)', nonNullRate: 0.918, uniqueCount: 18, min: 1, max: 15, mean: 7.2, median: 7.5, std: 1.8 },
      { name: '调查渠道', dataType: 'string', semanticType: 'enum', semanticLabel: '调查渠道', nonNullRate: 1.0, uniqueCount: 3, topValues: [{ value: '电话', count: 180, pct: 56.3 }, { value: '线上', count: 95, pct: 29.7 }, { value: '线下', count: 45, pct: 14.1 }] },
    ],
    sampleRows: [
      { 调查ID: 'S202601001', 满意度评分: '8.5', 调查渠道: '电话' },
    ],
  },
  { id: 'ds3', name: '套餐迁转明细.xlsx', uploadTime: '06-25 09:15', uploader: '王五', dataTimeRange: '2026.06', linkedReports: [], quality: 'pending', qualityScore: 65, size: '5.2MB', rows: 4300, columns: 12, columnPreview: [{ name: '迁转前套餐', type: '文本' }, { name: '迁转后套餐', type: '文本' }, { name: '迁转日期', type: '日期' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'warn', detail: '3行缺失迁转后套餐，占比0.07%' }, { item: '逻辑校验', status: 'warn', detail: '15条记录迁转日期为未来日期' }], fileType: 'xlsx',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 75, detail: '缺失率5.3%' },
      { name: '唯一性', key: 'uniqueness', score: 88, detail: '重复行3.2%' },
      { name: '一致性', key: 'consistency', score: 70, detail: '套餐名称格式不统一' },
      { name: '合法性', key: 'validity', score: 62, detail: '15条未来日期记录' },
      { name: '时效性', key: 'timeliness', score: 30, detail: '包含未来日期数据' },
    ],
    fieldProfiles: [
      { name: '用户ID', dataType: 'string', semanticType: 'id', semanticLabel: '用户标识', nonNullRate: 1.0, uniqueCount: 4280 },
      { name: '迁转前套餐', dataType: 'string', semanticType: 'enum', semanticLabel: '迁出套餐', nonNullRate: 1.0, uniqueCount: 12, topValues: [{ value: '动感地带58', count: 1200, pct: 27.9 }, { value: '神州行38', count: 890, pct: 20.7 }] },
      { name: '迁转后套餐', dataType: 'string', semanticType: 'enum', semanticLabel: '迁入套餐', nonNullRate: 0.9993, uniqueCount: 8, topValues: [{ value: '全球通128', count: 1800, pct: 41.9 }, { value: '全球通88', count: 950, pct: 22.1 }] },
      { name: '迁转日期', dataType: 'datetime', semanticType: 'time', semanticLabel: '迁转时间', nonNullRate: 1.0, uniqueCount: 30, timeRange: { start: '2026-06-01', end: '2026-07-15', granularity: '日' } },
      { name: '月租差', dataType: 'float', semanticType: 'amount', semanticLabel: '月租变化(元)', nonNullRate: 0.9993, uniqueCount: 28, min: -20, max: 260, mean: 45.2, median: 30, std: 52.8 },
    ],
    sampleRows: [
      { 用户ID: 'U202606001', 迁转前套餐: '动感地带58', 迁转后套餐: '全球通128', 迁转日期: '2026-06-05', 月租差: '70.00' },
    ],
  },
  { id: 'ds5', name: '地市流量明细.xlsx', uploadTime: '06-22 11:00', uploader: '张三', dataTimeRange: '2026.06', linkedReports: [{ name: '流量运营专项分析', status: '进行中' }], quality: 'verified', qualityScore: 97, size: '15.8MB', rows: 512, columns: 30, columnPreview: [{ name: '地市', type: '文本' }, { name: '4G流量', type: '数值(GB)', caliber: '月均4G DOU' }, { name: '5G流量', type: '数值(GB)', caliber: '月均5G DOU' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'pass', detail: '通过' }, { item: '逻辑校验', status: 'pass', detail: '通过' }], fileType: 'xlsx',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 99, detail: '缺失率0.2%' },
      { name: '唯一性', key: 'uniqueness', score: 97, detail: '无重复行' },
      { name: '一致性', key: 'consistency', score: 98, detail: '数据类型完全一致' },
      { name: '合法性', key: 'validity', score: 99, detail: '无异常值' },
      { name: '时效性', key: 'timeliness', score: 92, detail: '数据更新至8天前' },
    ],
    fieldProfiles: [
      { name: '地市', dataType: 'string', semanticType: 'region', semanticLabel: '地市', nonNullRate: 1.0, uniqueCount: 16 },
      { name: '4G流量', dataType: 'float', semanticType: 'amount', semanticLabel: '4G DOU(GB)', nonNullRate: 1.0, uniqueCount: 128, min: 0.5, max: 28.3, mean: 8.2, median: 7.5, std: 4.6 },
      { name: '5G流量', dataType: 'float', semanticType: 'amount', semanticLabel: '5G DOU(GB)', nonNullRate: 0.998, uniqueCount: 156, min: 0.1, max: 42.8, mean: 15.6, median: 13.2, std: 8.9 },
      { name: '月份', dataType: 'datetime', semanticType: 'time', semanticLabel: '统计月份', nonNullRate: 1.0, uniqueCount: 1, timeRange: { start: '2026-06', end: '2026-06', granularity: '月' } },
    ],
    sampleRows: [
      { 地市: '乌鲁木齐', '4G流量': '8.2', '5G流量': '15.6', 月份: '2026-06' },
    ],
  },
  { id: 'ds4', name: '竞品数据.xlsx', uploadTime: '06-20 16:00', uploader: '赵六', dataTimeRange: '2026.Q2', linkedReports: [], quality: 'error', qualityScore: 38, size: '3.1MB', rows: 48, columns: 8, columnPreview: [{ name: '运营商', type: '文本' }, { name: '市场份额', type: '百分比' }], checkResults: [{ item: '格式校验', status: 'pass', detail: '通过' }, { item: '完整性校验', status: 'fail', detail: '4月数据完全缺失' }, { item: '逻辑校验', status: 'fail', detail: '市场份额存在超过100%的数值' }], fileType: 'xlsx',
    profiled: true,
    qualityDimensions: [
      { name: '完整性', key: 'completeness', score: 32, detail: '4月数据完全缺失，缺失率25%' },
      { name: '唯一性', key: 'uniqueness', score: 95, detail: '无重复行' },
      { name: '一致性', key: 'consistency', score: 45, detail: '市场份额字段格式混乱' },
      { name: '合法性', key: 'validity', score: 28, detail: '5条市场份额>100%' },
      { name: '时效性', key: 'timeliness', score: 50, detail: '数据更新至10天前' },
    ],
    fieldProfiles: [
      { name: '运营商', dataType: 'string', semanticType: 'enum', semanticLabel: '运营商', nonNullRate: 1.0, uniqueCount: 3, topValues: [{ value: '中国移动', count: 16, pct: 33.3 }, { value: '中国电信', count: 16, pct: 33.3 }, { value: '中国联通', count: 16, pct: 33.3 }] },
      { name: '市场份额', dataType: 'float', semanticType: 'percent', semanticLabel: '市场份额(%)', nonNullRate: 0.75, uniqueCount: 12, min: 5.2, max: 128.5, mean: 33.3, median: 32.1, std: 22.5 },
      { name: '月份', dataType: 'datetime', semanticType: 'time', semanticLabel: '统计月份', nonNullRate: 0.75, uniqueCount: 3, timeRange: { start: '2026-05', end: '2026-06', granularity: '月' } },
    ],
    sampleRows: [
      { 运营商: '中国移动', 市场份额: '52.3%', 月份: '2026-06' },
      { 运营商: '中国电信', 市场份额: '128.5%', 月份: '2026-05' },
    ],
  },
];

/* ─── 数据库连接模拟数据 ─── */
interface DatabaseConnection {
  id: string;
  name: string;
  type: 'MySQL' | 'PostgreSQL' | 'Oracle' | 'ClickHouse' | 'DuckDB';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'failed' | 'untested';
  tableCount: number;
  lastTested: string;
  tables: Array<{
    name: string;
    rows: number;
    columns: number;
    lastUpdated: string;
    fields: Array<{ name: string; type: string; sample: string }>;
    sampleRows: Array<Record<string, string>>;
  }>;
}

const mockDatabaseConnections: DatabaseConnection[] = [
  {
    id: 'db1', name: '大数据平台', type: 'ClickHouse', host: '10.129.**.**', port: 8123, database: 'market_analytics', username: 'ai_readonly', status: 'connected', tableCount: 3, lastTested: '06-30 08:00',
    tables: [
      { name: 'dws_market_monthly', rows: 12580, columns: 15, lastUpdated: '2026-06-30', fields: [{ name: 'month', type: 'String', sample: '2026-06' }, { name: 'region_code', type: 'String', sample: '650100' }, { name: 'arpu', type: 'Float64', sample: '58.6' }], sampleRows: [{ month: '2026-06', region_code: '650100', arpu: '58.6', fiveg_rate: '45.2%' }] },
      { name: 'dws_user_portrait', rows: 2850000, columns: 22, lastUpdated: '2026-06-29', fields: [{ name: 'user_id', type: 'String', sample: 'U65010001' }, { name: 'brand', type: 'String', sample: '全球通' }], sampleRows: [{ user_id: 'U65010001', brand: '全球通', arpu: '128.5' }] },
      { name: 'dws_traffic_daily', rows: 186400, columns: 18, lastUpdated: '2026-06-30', fields: [{ name: 'date', type: 'Date', sample: '2026-06-30' }, { name: 'grid_code', type: 'String', sample: 'G650101' }], sampleRows: [{ date: '2026-06-30', grid_code: 'G650101', dou: '12.8' }] },
    ],
  },
  {
    id: 'db2', name: '经分系统', type: 'Oracle', host: '10.129.**.**', port: 1521, database: 'bisys', username: 'rpt_readonly', status: 'connected', tableCount: 2, lastTested: '06-29 17:30',
    tables: [
      { name: 'RPT_BUSINESS_OVERVIEW', rows: 3840, columns: 25, lastUpdated: '2026-06-28', fields: [{ name: 'STAT_MONTH', type: 'VARCHAR2', sample: '202606' }, { name: 'CITY_CODE', type: 'VARCHAR2', sample: '01' }], sampleRows: [{ STAT_MONTH: '202606', CITY_CODE: '01', TOTAL_REVENUE: '1258032' }] },
      { name: 'RPT_CHURN_ANALYSIS', rows: 6800, columns: 18, lastUpdated: '2026-06-28', fields: [{ name: 'STAT_MONTH', type: 'VARCHAR2', sample: '202606' }, { name: 'CHURN_TYPE', type: 'VARCHAR2', sample: 'silent' }], sampleRows: [{ STAT_MONTH: '202606', CHURN_TYPE: 'silent', CHURN_COUNT: '235' }] },
    ],
  },
];

/* ─── 上传弹窗 ─── */
function UploadDialog({ onClose, onUpload }: { onClose: () => void; onUpload: (name: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[480px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium">上传数据源</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0].name); }}
          >
            <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium">{selectedFile}</p>
                <p className="text-xs text-muted-foreground mt-1">点击"确认上传"提交</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">将文件拖拽到此处，或</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelectedFile('示例数据.xlsx')}>选择文件</Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">支持 .xlsx、.csv 格式，单文件不超过50MB</p>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={() => { if (selectedFile) { onUpload(selectedFile); } else { onUpload('未命名文件.xlsx'); } }} disabled={!selectedFile}>确认上传</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── 删除确认弹窗 ─── */
function DeleteDialog({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[400px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />确认删除</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5">
          <p className="text-sm">确定要删除数据源 <strong>{name}</strong> 吗？</p>
          <p className="text-xs text-muted-foreground mt-2">删除后，已关联此数据源的报告可能无法正常展示数据。</p>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>确认删除</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'warning'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); });
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <div className={`fixed top-4 right-4 z-[60] ${bg} text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{message}
    </div>
  );
}

export default function DataSourcesPage() {
  const router = useRouter();
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DataSource | null>(null);
  const [revalidating, setRevalidating] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'platform' | 'database'>('upload');
  const [dbForm, setDbForm] = useState({ name: '', type: 'MySQL' as DatabaseConnection['type'], host: '', port: '3306', database: '', username: '', password: '' });

  const getQualityScore = (source: DataSource, key: string, fallback: number) =>
    source.qualityDimensions?.find(d => d.key === key)?.score ?? fallback;

  const generateSampleData = (ds: DataSource) => {
    const fields = ds.fieldProfiles ?? [];
    const rows = [];
    for (let i = 0; i < 20; i++) {
      const row: Record<string, string | number> = {};
      fields.forEach((f) => {
        if (f.dataType === 'integer' || f.dataType === 'float') {
          const min = f.min ?? 0;
          const max = f.max ?? 1000;
          const val = Math.round((min + Math.random() * (max - min)) * 100) / 100;
          row[f.name] = i === 5 && Math.random() > 0.7 ? val * 10 : val;
        } else if (f.dataType === 'datetime') {
          const months = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12'];
          row[f.name] = months[i % 12] + `-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        } else if (f.semanticType === 'region') {
          const cities = ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'];
          row[f.name] = cities[Math.floor(Math.random() * 16)];
        } else if (f.semanticType === 'enum') {
          const topVals = f.topValues ?? [];
          row[f.name] = topVals.length > 0 ? topVals[Math.floor(Math.random() * Math.min(topVals.length, 4))].value : `选项${(i % 5) + 1}`;
        } else {
          row[f.name] = `${f.name}_${String(i + 1).padStart(4, '0')}`;
        }
      });
      rows.push(row);
    }
    return rows;
  };

  const [dbTestResult, setDbTestResult] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [selectedDbConn, setSelectedDbConn] = useState<DatabaseConnection | null>(null);
  const [selectedDbTable, setSelectedDbTable] = useState<DatabaseConnection['tables'][0] | null>(null);
  const [showDbDialog, setShowDbDialog] = useState(false);
  const [showDbTablesDialog, setShowDbTablesDialog] = useState(false);
  const [showDbPreviewDialog, setShowDbPreviewDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const [viewMode, setViewMode] = useState<'group' | 'list'>('group');

  const filteredSources = dataSources.filter(ds => {
    const matchQuality = qualityFilter === 'all' || ds.quality === qualityFilter;
    const matchType = typeFilter === 'all' || ds.fileType === typeFilter;
    const matchSearch = !searchQuery || ds.name.includes(searchQuery);
    return matchQuality && matchType && matchSearch;
  });

  const groupedSources = useMemo(() => {
    const groups: Record<string, DataSource[]> = {};
    filteredSources.forEach(ds => {
      const g = ds.fileType.toUpperCase();
      if (!groups[g]) groups[g] = [];
      groups[g].push(ds);
    });
    return Object.entries(groups);
  }, [filteredSources]);

  const handleUpload = (name: string) => {
    setShowUploadDialog(false);
    setToast({ msg: `${name} 上传成功，正在自动校验...`, type: 'success' });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setDataSources(dataSources.filter(ds => ds.id !== deleteTarget.id));
      if (selectedSource?.id === deleteTarget.id) setSelectedSource(null);
      setToast({ msg: `数据源"${deleteTarget.name}"已删除`, type: 'warning' });
    }
    setDeleteTarget(null);
  };

  const handleRevalidate = (ds: DataSource) => {
    setRevalidating(ds.id);
    setTimeout(() => {
      setDataSources(dataSources.map(d => d.id === ds.id ? { ...d, quality: 'verified' as QualityStatus, qualityScore: 95, checkResults: d.checkResults.map(c => ({ ...c, status: 'pass' as const, detail: '通过' })) } : d));
      setRevalidating(null);
      setToast({ msg: `${ds.name} 重新校验完成，全部通过`, type: 'success' });
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 页头 */}
      <div className="px-6 py-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">数据源管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">管理上传数据源的生命周期与质量校验，浏览平台可用数据</p>
          </div>
          <Button className="gap-1.5" onClick={() => setShowUploadDialog(true)}><Upload className="w-4 h-4" />上传数据</Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 py-3 border-b shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Database className="w-4 h-4 text-primary" /></div>
            <div><div className="text-lg font-semibold">{dataSources.length}</div><div className="text-xs text-muted-foreground">数据源总数</div></div>
          </div>
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
            <div><div className="text-lg font-semibold">{dataSources.filter(d => d.quality === 'verified').length}</div><div className="text-xs text-muted-foreground">已校验</div></div>
          </div>
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
            <div><div className="text-lg font-semibold">{dataSources.filter(d => d.quality === 'pending').length}</div><div className="text-xs text-muted-foreground">待校验</div></div>
          </div>
          <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center"><XCircle className="w-4 h-4 text-red-500" /></div>
            <div><div className="text-lg font-semibold">{dataSources.filter(d => d.quality === 'error').length}</div><div className="text-xs text-muted-foreground">异常</div></div>
          </div>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="px-6 py-3 border-b flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">状态:</span>
          <Select value={qualityFilter} onValueChange={setQualityFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="verified">已校验</SelectItem>
              <SelectItem value="pending">待校验</SelectItem>
              <SelectItem value="error">异常</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">文件类型:</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索数据源名称..." className="pl-8 h-8 text-sm" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">共 {filteredSources.length} 条</span>
        <div className="border rounded-md flex">
          <Button variant={viewMode === 'group' ? 'secondary' : 'ghost'} size="sm" className="h-7 w-7 p-0 rounded-r-none" onClick={() => setViewMode('group')}><LayoutGrid className="w-3.5 h-3.5" /></Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 w-7 p-0 rounded-l-none" onClick={() => setViewMode('list')}><List className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {/* 列表区 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {viewMode === 'group' ? (
          /* ── 分组卡片视图 ── */
          <div className="space-y-5">
            {groupedSources.map(([groupName, sources]) => {
              const avgScore = Math.round(sources.reduce((s, d) => s + d.qualityScore, 0) / sources.length);
              const scoreColor = avgScore >= 85 ? 'text-emerald-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600';
              const scoreBg = avgScore >= 85 ? 'bg-emerald-50' : avgScore >= 60 ? 'bg-amber-50' : 'bg-red-50';
              return (
                <div key={groupName} className="border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{groupName}</span>
                    <span className="text-xs text-muted-foreground">{sources.length}个数据源</span>
                    <div className={`ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full ${scoreBg}`}>
                      <span className={`text-xs font-bold ${scoreColor}`}>{avgScore}</span>
                      <span className="text-xs text-muted-foreground">质量分</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4">
                    {sources.map(ds => {
                      const qc = qualityConfig[ds.quality];
                      const dsScoreColor = ds.qualityScore >= 85 ? 'text-emerald-600' : ds.qualityScore >= 60 ? 'text-amber-600' : 'text-red-600';
                      const dsScoreRing = ds.qualityScore >= 85 ? '#10b981' : ds.qualityScore >= 60 ? '#f59e0b' : '#ef4444';
                      return (
                        <div key={ds.id} className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer transition-colors group" onClick={() => setSelectedSource(ds)}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{ds.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{ds.uploader} · {ds.uploadTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* 质量评分环形指示器 */}
                              <div className="relative w-8 h-8" title={`质量评分: ${ds.qualityScore}`}>
                                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                  <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="3" />
                                  <circle cx="16" cy="16" r="13" fill="none" stroke={dsScoreRing} strokeWidth="3" strokeDasharray={`${(ds.qualityScore / 100) * 81.68} 81.68`} strokeLinecap="round" />
                                </svg>
                                <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${dsScoreColor}`}>{ds.qualityScore}</span>
                              </div>
                              <Badge variant="outline" className={`${qc.className} text-xs gap-0.5`}>{qc.icon}{qc.label}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{ds.dataTimeRange}</span>
                            <span>{ds.size}</span>
                            <span>{ds.rows.toLocaleString()}行</span>
                            {ds.linkedReports.length > 0 && <span className="text-primary">关联{ds.linkedReports.length}份报告</span>}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={e => { e.stopPropagation(); setSelectedSource(ds); }}><Eye className="w-3 h-3" />详情</Button>
                            {(ds.quality === 'pending' || ds.quality === 'error') && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={e => { e.stopPropagation(); handleRevalidate(ds); }} disabled={revalidating === ds.id}>
                                <RefreshCw className={`w-3 h-3 ${revalidating === ds.id ? 'animate-spin' : ''}`} />{revalidating === ds.id ? '校验中' : '校验'}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); setDeleteTarget(ds); }}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── 列表视图 ── */
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">数据源名称</TableHead>
                <TableHead className="w-16">质量分</TableHead>
                <TableHead className="w-24">上传时间</TableHead>
                <TableHead className="w-16">上传人</TableHead>
                <TableHead className="w-28">数据时间范围</TableHead>
                <TableHead className="w-20">关联报告</TableHead>
                <TableHead className="w-20">质量状态</TableHead>
                <TableHead className="w-20">类型</TableHead>
                <TableHead className="w-[140px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map(ds => {
                const qc = qualityConfig[ds.quality];
                const dsScoreColor = ds.qualityScore >= 85 ? 'text-emerald-600' : ds.qualityScore >= 60 ? 'text-amber-600' : 'text-red-600';
                return (
                  <TableRow key={ds.id} className="group cursor-pointer" onClick={() => setSelectedSource(ds)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4 text-emerald-500" />{ds.name}</div>
                    </TableCell>
                    <TableCell><span className={`font-bold text-sm ${dsScoreColor}`}>{ds.qualityScore}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ds.uploadTime}</TableCell>
                    <TableCell className="text-sm">{ds.uploader}</TableCell>
                    <TableCell className="text-sm">{ds.dataTimeRange}</TableCell>
                    <TableCell className="text-sm">
                      {ds.linkedReports.length > 0 ? <span className="text-primary">{ds.linkedReports.length}</span> : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`${qc.className} text-xs gap-1`}>{qc.icon}{qc.label}</Badge></TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{ds.fileType?.toUpperCase()}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); setSelectedSource(ds); }}>
                          <Eye className="w-3 h-3" />详情
                        </Button>
                        {(ds.quality === 'pending' || ds.quality === 'error') && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={e => { e.stopPropagation(); handleRevalidate(ds); }} disabled={revalidating === ds.id}>
                            <RefreshCw className={`w-3 h-3 ${revalidating === ds.id ? 'animate-spin' : ''}`} />{revalidating === ds.id ? '校验中' : '校验'}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); setDeleteTarget(ds); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 分页 */}
      <div className="px-6 py-3 border-t flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground">显示 1-{filteredSources.length} / 共 {filteredSources.length} 条</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>上一页</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs w-7 bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">下一页</Button>
        </div>
      </div>

      {/* 数据源详情弹窗 */}
      <Dialog open={!!selectedSource} onOpenChange={(open) => { if (!open) setSelectedSource(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {selectedSource?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedSource && (
            <div className="space-y-6 mt-4">
              {/* 基础信息 */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1"><Info className="w-4 h-4" />基础信息</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">文件名</p>
                    <p className="text-sm font-medium">{selectedSource.name}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">文件类型</p>
                    <p className="text-sm font-medium">{selectedSource.fileType}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">大小</p>
                    <p className="text-sm font-medium">{selectedSource.size}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">行数</p>
                    <p className="text-sm font-medium">{selectedSource.rows?.toLocaleString() ?? '—'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">上传时间</p>
                    <p className="text-sm font-medium">{selectedSource.uploadTime}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">上传人</p>
                    <p className="text-sm font-medium">{selectedSource.uploader || '—'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">状态</p>
                    <Badge variant={selectedSource.quality === 'verified' ? 'default' : 'secondary'} className="text-xs">
                      {selectedSource.quality === 'verified' ? '已校验' : selectedSource.quality === 'pending' ? '待校验' : '异常'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 字段列表 */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1"><Table2 className="w-4 h-4" />字段列表</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">字段名</th>
                        <th className="text-left px-3 py-2 font-medium">字段类型</th>
                        <th className="text-left px-3 py-2 font-medium">非空率</th>
                        <th className="text-left px-3 py-2 font-medium">示例值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSource.fieldProfiles?.map((field, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2 font-medium">{field.name}</td>
                          <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{field.dataType}</Badge></td>
                          <td className="px-3 py-2">{field.nonNullRate != null ? `${(field.nonNullRate * 100).toFixed(1)}%` : '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{field.sampleValue ?? '—'}</td>
                        </tr>
                      )) || (
                        <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">暂无字段信息</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 数据预览 */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1"><HardDrive className="w-4 h-4" />数据预览（前5行）</h4>
                <div className="border rounded-md overflow-x-auto">
                  {selectedSource.sampleRows && selectedSource.sampleRows.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          {selectedSource.fieldProfiles?.slice(0, 8).map((field, idx) => (
                            <th key={idx} className="text-left px-3 py-2 font-medium whitespace-nowrap">{field.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSource.sampleRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-t">
                            {selectedSource.fieldProfiles?.slice(0, 8).map((field, fidx) => (
                              <td key={fidx} className="px-3 py-2 whitespace-nowrap text-muted-foreground">{row[field.name] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无样本数据</p>
                  )}
                </div>
              </div>

              {/* 使用记录 */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1"><Tag className="w-4 h-4" />引用记录</h4>
                {selectedSource.linkedReports.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSource.linkedReports.map((ref, idx) => (
                      <div key={idx} className="flex items-center justify-between border rounded-md px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{ref.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs h-5 px-1.5 ${ref.status === '已归档' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {ref.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂未被任何报告或模板引用</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 上传数据源弹窗 */}
      {showUploadDialog && (
        <UploadDialog
          onClose={() => setShowUploadDialog(false)}
          onUpload={(name) => handleUpload(name)}
        />
      )}

      </div>
  );
}
