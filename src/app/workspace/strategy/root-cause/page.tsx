'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 一级分类 → 二级分类
const categoryTree: Record<string, string[]> = {
  '网络与质量因素': ['网络覆盖不足', '网络质量下降', '网络容量不足'],
  '价格与竞争因素': ['竞品资费优势', '本网资费偏高', '优惠活动到期'],
  '产品与套餐因素': ['套餐流量容量不足', '套餐内容不匹配', '5G终端与套餐不匹配'],
  '服务与体验因素': ['服务响应不及时', '触点体验不佳', '投诉处理不满意'],
  '市场与政策因素': ['携转政策影响', '行业竞争加剧', '季节性波动'],
  '客户生命周期因素': ['合约到期未续约', '新手适应期问题', '沉默客户唤醒失败'],
};

// 业务场景选项
const businessScenarios = [
  '流量运营', '离网维系', '家庭运营', '中高端客户运营', '增量运营', '校园运营', '国际业务运营',
];

const sourceLabels: Record<string, { label: string; color: string }> = {
  expert: { label: '专家经验', color: 'bg-primary/10 text-primary' },
  ai_generated: { label: 'AI生成', color: 'bg-ai/10 text-ai' },
};

interface RootCause {
  id: string;
  name: string;
  source: string;
  category1: string;
  category2: string;
  businessScenarios: string[];
  relatedIndicators: number;
  relatedGroups: number;
  confidence: number | null;
  referenceRate: number | null;
  matchRate: number | null;
  status: string;
  createdAt: string;
  validFrom: string;
  validUntil: string;
}

// 计算有效期状态
function getValidityStatus(item: RootCause): '有效' | '即将过期' | '已过期' | '未上架' {
  if (item.status === '下架' && !item.validFrom) return '未上架';
  const now = new Date();
  const until = new Date(item.validUntil);
  const diffDays = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return '已过期';
  if (diffDays <= 30) return '即将过期';
  return '有效';
}

const validityStatusConfig: Record<string, { color: string; bgColor: string }> = {
  '有效': { color: 'text-green-700', bgColor: 'bg-green-50' },
  '即将过期': { color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  '已过期': { color: 'text-red-700', bgColor: 'bg-red-50' },
  '未上架': { color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

const mockData: RootCause[] = [
  {
    id: 'RC-001', name: '竞品资费低于本网同档位', source: 'expert', category1: '价格与竞争因素', category2: '竞品资费优势',
    businessScenarios: ['离网维系', '中高端客户运营'], relatedIndicators: 3, relatedGroups: 2,
    confidence: 0.535, referenceRate: 0.10, matchRate: 0.60, status: '上架', createdAt: '2026-03-15',
    validFrom: '2026-03-15', validUntil: '2026-09-15',
  },
  {
    id: 'RC-002', name: '优惠活动到期未延续', source: 'expert', category1: '价格与竞争因素', category2: '优惠活动到期',
    businessScenarios: ['离网维系'], relatedIndicators: 2, relatedGroups: 1,
    confidence: 0.498, referenceRate: 0.08, matchRate: 0.55, status: '上架', createdAt: '2026-04-12',
    validFrom: '2026-04-12', validUntil: '2026-10-12',
  },
  {
    id: 'RC-003', name: '套餐流量容量不足', source: 'ai_generated', category1: '产品与套餐因素', category2: '套餐流量容量不足',
    businessScenarios: ['流量运营'], relatedIndicators: 2, relatedGroups: 2,
    confidence: 0.468, referenceRate: 0.12, matchRate: 0.58, status: '上架', createdAt: '2026-03-20',
    validFrom: '2026-03-20', validUntil: '2026-06-10',
  },
  {
    id: 'RC-004', name: '合约到期未续约', source: 'expert', category1: '客户生命周期因素', category2: '合约到期未续约',
    businessScenarios: ['离网维系', '家庭运营'], relatedIndicators: 2, relatedGroups: 2,
    confidence: 0.518, referenceRate: 0.15, matchRate: 0.62, status: '上架', createdAt: '2026-03-18',
    validFrom: '2026-03-18', validUntil: '2026-09-18',
  },
  {
    id: 'RC-005', name: '5G终端与套餐不匹配', source: 'ai_generated', category1: '产品与套餐因素', category2: '5G终端与套餐不匹配',
    businessScenarios: ['流量运营', '增量运营'], relatedIndicators: 1, relatedGroups: 1,
    confidence: null, referenceRate: null, matchRate: null, status: '上架', createdAt: '2026-04-22',
    validFrom: '2026-04-22', validUntil: '2026-10-22',
  },
  {
    id: 'RC-006', name: '网络覆盖质量下降', source: 'expert', category1: '网络与质量因素', category2: '网络质量下降',
    businessScenarios: ['家庭运营', '增量运营'], relatedIndicators: 2, relatedGroups: 1,
    confidence: 0.488, referenceRate: 0.06, matchRate: 0.52, status: '上架', createdAt: '2026-04-05',
    validFrom: '2026-04-05', validUntil: '2026-06-15',
  },
  {
    id: 'RC-007', name: '触点体验不佳', source: 'ai_generated', category1: '服务与体验因素', category2: '触点体验不佳',
    businessScenarios: ['离网维系'], relatedIndicators: 1, relatedGroups: 1,
    confidence: null, referenceRate: null, matchRate: null, status: '下架', createdAt: '2026-05-10',
    validFrom: '2026-05-10', validUntil: '2026-11-10',
  },
  {
    id: 'RC-008', name: '携转政策降低客户转换成本', source: 'expert', category1: '市场与政策因素', category2: '携转政策影响',
    businessScenarios: ['离网维系', '增量运营'], relatedIndicators: 2, relatedGroups: 2,
    confidence: 0.558, referenceRate: 0.18, matchRate: 0.65, status: '上架', createdAt: '2026-03-28',
    validFrom: '2026-03-28', validUntil: '2026-09-28',
  },
  {
    id: 'RC-009', name: '宽带速率不达预期', source: 'expert', category1: '网络与质量因素', category2: '网络质量下降',
    businessScenarios: ['家庭运营'], relatedIndicators: 1, relatedGroups: 1,
    confidence: 0.478, referenceRate: 0.09, matchRate: 0.50, status: '上架', createdAt: '2026-04-18',
    validFrom: '2026-04-18', validUntil: '2026-10-18',
  },
];

export default function RootCauseListPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filterCategory1, setFilterCategory1] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScenario, setFilterScenario] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [importResult, setImportResult] = useState<{ success: number; fail: number; errors: { row: number; reason: string }[] }>({ success: 0, fail: 0, errors: [] });
  const [publishTarget, setPublishTarget] = useState<{ id: string; name: string; action: '上架' | '下架' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [filterValidity, setFilterValidity] = useState('all');
  const [data, setData] = useState(mockData);

  const filteredData = useMemo(() => data.filter((item) => {
    if (searchText && !item.name.includes(searchText)) return false;
    if (filterCategory1 !== 'all' && item.category1 !== filterCategory1) return false;
    if (filterSource !== 'all' && item.source !== filterSource) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterScenario !== 'all' && !item.businessScenarios.includes(filterScenario)) return false;
    if (filterValidity !== 'all') {
      const vs = getValidityStatus(item);
      if (filterValidity !== vs) return false;
    }
    return true;
  }), [searchText, filterCategory1, filterSource, filterStatus, filterScenario, filterValidity, data]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 筛选条件变化时重置到第1页
  const handleSearchChange = (v: string) => { setSearchText(v); setCurrentPage(1); };
  const handleCategoryChange = (v: string) => { setFilterCategory1(v); setCurrentPage(1); };
  const handleSourceChange = (v: string) => { setFilterSource(v); setCurrentPage(1); };
  const handleStatusChange = (v: string) => { setFilterStatus(v); setCurrentPage(1); };
  const handleScenarioChange = (v: string) => { setFilterScenario(v); setCurrentPage(1); };

  const handleImport = () => {
    setImportStep('upload');
    setImportOpen(true);
  };

  const handleFileUpload = () => {
    // Mock: simulate file parsing and validation
    setImportResult({
      success: 12,
      fail: 3,
      errors: [
        { row: 3, reason: '根因名称与已有记录重复：竞品资费低于本网同档位' },
        { row: 7, reason: '一级分类不存在：市场竞争类（有效值：风险预警类/价值提升类/生命周期类/产品与套餐因素/网络与质量因素/服务与体验因素/市场与政策因素）' },
        { row: 11, reason: '关联指标不存在：流量达标客户数' },
      ],
    });
    setImportStep('preview');
  };

  const handleImportConfirm = () => {
    setImportStep('done');
  };

  const handleDownloadTemplate = () => {
    // 使用 xlsx 库生成双Sheet的Excel模板
    const XLSX = require('xlsx');
    const importData = [
      ['根因名称','根因描述','一级分类','二级分类','来源','关联指标','关联客群'],
      ['说明行(导入时跳过)','来源可选值=专家经验/AI生成；关联指标格式=指标名;变化方向;运算符;值，多条件用;分隔，多条用|分隔，变化方向=up/down，运算符=>=/>/<=/</==/!=/none；关联客群多条用|分隔','','','','',''],
      ['示例根因','示例描述，说明根因的业务含义','价格与竞争因素','竞品资费优势','专家经验','降档客户数;up;>=;3;<;10|ARPU值;down;>=;5;none;','价格敏感无合约客户|到期30天内未续约客户'],
      ['套餐流量容量不足','客户月均流量超过套餐包含流量的80%，频繁触发达量降速','产品与套餐因素','套餐流量容量不足','AI生成','DOU;up;>=;0.8;none;|达量降速次数;up;>=;2;none;','高流量低资费客户|达量降频客户'],
      ['合约到期未续约','客户合约到期后30天内未续约，流失风险升高','客户生命周期因素','合约到期未续约','专家经验','合约到期天数;down;>=;0;<=;30|续约率;down;>=;0;none;','到期30天内未续约客户'],
      ['ARPU持续下降','客户ARPU连续3个月环比下降，收入贡献持续走低','价格与竞争因素','本网资费偏高','AI生成','ARPU值;down;>=;5;none;|ARPU环比;down;>=;0;none;','中高端ARPU下降客户|价值流失客户'],
    ];
    const categoryData: string[][] = [['一级分类','二级分类']];
    for (const [k, vs] of Object.entries(categoryTree)) {
      for (const v of vs) categoryData.push([k, v]);
    }
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(importData);
    const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
    ws1['!cols'] = [{wch:20},{wch:40},{wch:18},{wch:18},{wch:12},{wch:50},{wch:40}];
    ws2['!cols'] = [{wch:20},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws1, '导入数据');
    XLSX.utils.book_append_sheet(wb, ws2, '分类枚举值');
    XLSX.writeFile(wb, '根因导入模板.xlsx');
  };

  const handlePublishToggle = () => {
    if (!publishTarget) return;
    setData((prev) => prev.map((item) =>
      item.id === publishTarget.id
        ? {
            ...item,
            status: publishTarget.action === '上架' ? '上架' : '下架',
            ...(publishTarget.action === '上架' && !item.validFrom
              ? { validFrom: new Date().toISOString().slice(0, 10), validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }
              : {}),
          }
        : item
    ));
    setPublishTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleBatchDelete = () => {
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setBatchDeleteOpen(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? pagedData.map((item) => item.id) : []);
  };

  const total = data.length;
  const aiCount = data.filter((d) => d.source === 'ai_generated').length;
  const withConfidence = data.filter((d) => d.confidence !== null).length;
  const publishedCount = data.filter((d) => d.status === '上架').length;
  const expiringCount = data.filter((d) => d.status === '上架' && getValidityStatus(d) === '即将过期').length;

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">根因库管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理指标异常根因知识库，支持关联指标与置信度配置</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setBatchDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              批量删除（{selectedIds.length}）
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleImport}>
            <Upload className="w-4 h-4" />
            导入
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => router.push('/workspace/strategy/root-cause/edit')}>
            <Plus className="w-4 h-4" />
            新增根因
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">根因总数</div>
          <div className="text-2xl font-semibold mt-1">{total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">AI生成占比</div>
          <div className="text-2xl font-semibold mt-1">{Math.round((aiCount / total) * 100)}%<span className="text-sm font-normal text-gray-400 ml-1">({aiCount}条)</span></div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">有运行数据</div>
          <div className="text-2xl font-semibold mt-1">{withConfidence}<span className="text-sm font-normal text-gray-400 ml-1">/{total}</span></div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">上架数量</div>
          <div className="text-2xl font-semibold mt-1">{publishedCount}<span className="text-sm font-normal text-gray-400 ml-1">/{total}</span></div>
        </div>
        <div className={`border rounded-lg p-4 ${expiringCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
          <div className={`text-sm ${expiringCount > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>即将过期</div>
          <div className={`text-2xl font-semibold mt-1 ${expiringCount > 0 ? 'text-yellow-700' : ''}`}>{expiringCount}<span className="text-sm font-normal text-gray-400 ml-1">30天内到期</span></div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="w-full h-8 pl-8 text-sm" placeholder="搜索根因名称" value={searchText} onChange={(e) => handleSearchChange(e.target.value)} />
          </div>
          <Select value={filterCategory1} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue placeholder="一级分类" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {Object.keys(categoryTree).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterScenario} onValueChange={handleScenarioChange}>
            <SelectTrigger className="w-[150px] h-8 text-sm"><SelectValue placeholder="业务场景" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部场景</SelectItem>
              {businessScenarios.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="expert">专家经验</SelectItem>
              <SelectItem value="ai_generated">AI生成</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[100px] h-8 text-sm"><SelectValue placeholder="状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="上架">上架</SelectItem>
              <SelectItem value="下架">下架</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterValidity} onValueChange={(v) => { setFilterValidity(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="有效期" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部有效期</SelectItem>
              <SelectItem value="有效">有效</SelectItem>
              <SelectItem value="即将过期">即将过期</SelectItem>
              <SelectItem value="已过期">已过期</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={pagedData.length > 0 && pagedData.every((item) => selectedIds.includes(item.id))}
                    onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead className="min-w-[60px]">ID</TableHead>
                <TableHead className="min-w-[180px]">根因名称</TableHead>
                <TableHead className="min-w-[80px]">来源</TableHead>
                <TableHead className="min-w-[120px]">一级分类</TableHead>
                <TableHead className="min-w-[120px]">二级分类</TableHead>
                <TableHead className="min-w-[130px]">业务场景</TableHead>

                <TableHead className="min-w-[80px]">关联指标</TableHead>
                <TableHead className="min-w-[80px]">关联客群</TableHead>

                <TableHead className="min-w-[130px]">置信度</TableHead>

                <TableHead className="min-w-[60px]">状态</TableHead>
                <TableHead className="min-w-[140px]">有效期</TableHead>
                <TableHead className="min-w-[100px] sticky right-0 bg-white">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedData.map((item) => (
                <TableRow key={item.id} className={selectedIds.includes(item.id) ? 'bg-muted/40' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((prev) =>
                          checked === true ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                        )
                      }
                      aria-label={`选择 ${item.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{item.id}</TableCell>
                  <TableCell className="font-medium text-sm">{item.name}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs px-1.5 py-0 ${sourceLabels[item.source]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {sourceLabels[item.source]?.label || item.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.category1}</TableCell>
                  <TableCell className="text-sm text-gray-600">{item.category2}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.businessScenarios.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs px-1.5 py-0 bg-primary/5">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-center">{item.relatedIndicators}</TableCell>
                  <TableCell className="text-sm text-center">{item.relatedGroups}</TableCell>
                  <TableCell>
                    {item.confidence !== null ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${(item.confidence || 0) >= 0.60 ? 'bg-green-500' : (item.confidence || 0) >= 0.30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.round((item.confidence || 0) * 100)}%` }} />
                              </div>
                              <span className="text-xs text-gray-600">{item.confidence !== null ? item.confidence.toFixed(3) : '-'}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px]">
                            <p className="text-xs">置信度 = 匹配率×0.60 + 引用率×0.25 + 来源权重×0.15</p>
                            <p className="text-xs mt-1">来源权重：专家经验=1.0，AI生成=0.75</p>
                            <p className="text-xs mt-1">当前：匹配率 {item.matchRate !== null ? Math.round(item.matchRate * 100) + '%' : '-'} · 引用率 {item.referenceRate !== null ? Math.round(item.referenceRate * 100) + '%' : '-'} · 来源 {item.source}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-gray-400">暂无数据</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={item.status === '上架' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">{item.validFrom} ~ {item.validUntil}</div>
                      {item.status === '上架' && (() => {
                        const vs = getValidityStatus(item);
                        const cfg = validityStatusConfig[vs];
                        return <Badge className={`text-xs px-1.5 py-0 ${cfg.bgColor} ${cfg.color} border-0`}>{vs}</Badge>;
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white">
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/workspace/strategy/root-cause/${item.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>查看详情</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/workspace/strategy/root-cause/edit?id=${item.id}`)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>编辑</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPublishTarget({ id: item.id, name: item.name, action: item.status === '上架' ? '下架' : '上架' })}>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{item.status === '上架' ? '下架' : '上架'}</TooltipContent>
                        </Tooltip>
                        {item.status === '下架' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget({ id: item.id, name: item.name })}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* 分页控件 */}
        <div className="flex items-center justify-between px-2 py-3 border-t">
          <span className="text-sm text-muted-foreground">共 {filteredData.length} 条</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3">第 {currentPage} / {totalPages} 页</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* 导入弹窗 */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>导入根因</DialogTitle>
            <DialogDescription>下载模板填写后上传，系统自动校验数据</DialogDescription>
          </DialogHeader>

          {importStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">点击或拖拽文件至此处上传</p>
                <p className="text-xs text-gray-400">支持 .xlsx 格式，单次最多500条</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">模板为Excel双Sheet格式，Sheet1=导入数据（含4条示例），Sheet2=分类枚举值</span>
                <Button variant="link" size="sm" className="gap-1 px-0" onClick={handleDownloadTemplate}>
                  <Upload className="w-3.5 h-3.5" />
                  下载导入模板
                </Button>
              </div>
            </div>
          )}

          {importStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-green-700">{importResult.success}</div>
                  <div className="text-xs text-green-600 mt-1">校验通过</div>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-red-700">{importResult.fail}</div>
                  <div className="text-xs text-red-600 mt-1">校验失败</div>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">失败原因：</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="text-xs bg-red-50 border border-red-100 rounded px-3 py-2 flex items-start gap-2">
                        <span className="text-red-500 font-medium shrink-0">第{err.row}行</span>
                        <span className="text-red-600">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">确认导入仅保存校验通过的条目，失败条目需修正后重新导入</p>
            </div>
          )}

          {importStep === 'done' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-700">导入完成</p>
              <p className="text-xs text-gray-500 mt-1">成功导入 {importResult.success} 条根因</p>
            </div>
          )}

          <DialogFooter>
            {importStep === 'upload' && (
              <>
                <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
                <Button onClick={handleFileUpload}>上传并校验</Button>
              </>
            )}
            {importStep === 'preview' && (
              <>
                <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
                <Button onClick={handleImportConfirm}>确认导入（{importResult.success}条）</Button>
              </>
            )}
            {importStep === 'done' && (
              <Button onClick={() => setImportOpen(false)}>完成</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 上架/下架确认弹窗 */}
      <AlertDialog open={!!publishTarget} onOpenChange={(open) => !open && setPublishTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认{publishTarget?.action}</AlertDialogTitle>
            <AlertDialogDescription>
              {publishTarget?.action === '上架'
                ? `确定要将根因"${publishTarget?.name}"上架吗？上架后该根因将参与模型推荐，可被调度单引用。`
                : `确定要将根因"${publishTarget?.name}"下架吗？下架后该根因将不参与模型推荐，不可被新调度单引用。已引用该根因的调度单不受影响。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishToggle}>确认{publishTarget?.action}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除根因"{deleteTarget?.name}"吗？删除后该记录将从列表中移除，关联的历史调度单将保留快照数据。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认弹窗 */}
      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              已选中 {selectedIds.length} 条根因，删除后这些记录将从列表中移除，关联的历史调度单将保留快照数据。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBatchDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
