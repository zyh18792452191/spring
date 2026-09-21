'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
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

const strategyCategoryTree: Record<string, string[]> = {
  '套餐优化类': ['套餐升迁', '套餐降档挽留', '套餐适配'],
  '流量运营类': ['流量提醒', '流量包推荐', '流量满意度提升'],
  '价值提升类': ['增值业务推荐', '权益包推荐', '融合业务推荐'],
  '维系挽留类': ['到期续约', '携转预警挽留', '沉默客户唤醒'],
  '体验提升类': ['5G体验优化', '网络质量改善', '服务体验优化'],
  '新客拓展类': ['新入网引导', '第二卡槽争夺', '家庭客户拓展'],
};

const sourceLabels: Record<string, { label: string; color: string }> = {
  expert: { label: '专家经验', color: 'bg-primary/10 text-primary' },
  ai_generated: { label: 'AI生成', color: 'bg-ai/10 text-ai' },
};

interface Strategy {
  id: string;
  name: string;
  source: string;
  category1: string;
  category2: string;
  productCount: number;
  scriptCount: number;
  channels: string[];
  actualConversion: number | null;
  confidence: number | null;
  referenceRate: number | null;
  relatedIndicators: number;
  relatedGroups: number;
  relatedRootCauses: number;
  businessScenarios: string[];
  status: string;
  createdAt: string;
  validFrom: string;
  validUntil: string;
  // 详情用
  description: string;
  products: { name: string; code: string; description: string }[];
  scripts: { name: string; channel: string; content: string }[];
}

// 计算有效期状态
function getValidityStatus(item: Strategy): '有效' | '即将过期' | '已过期' | '未上架' {
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

const mockData: Strategy[] = [
  {
    id: 'STR-001', name: '套餐升迁推荐（高流量低资费档位）', source: 'expert',
    category1: '套餐优化类', category2: '套餐升迁',
    productCount: 2, scriptCount: 3, channels: ['外呼', '短信', 'APP弹窗'],
    actualConversion: 12.8, confidence: 0.329, referenceRate: 0.35,
    relatedIndicators: 2, relatedGroups: 2, relatedRootCauses: 1,
    businessScenarios: ['流量运营', '中高端客户运营'],
    status: '上架', createdAt: '2026-03-10',
    validFrom: '2026-03-10', validUntil: '2026-09-10',
    description: '针对流量超套或DOU持续增长的客户，推荐更高流量档位套餐，提升ARPU的同时改善客户体验',

    products: [
      { name: '5G畅享199套餐', code: 'PROD-5G-199', description: '含60GB流量+1000分钟通话，适合中高端客户' },
      { name: '5G畅享129套餐', code: 'PROD-5G-129', description: '含30GB流量+500分钟通话，适合流量增长型客户' },
    ],
    scripts: [
      { name: '外呼-通用升迁话术', channel: '外呼', content: '您好，注意到您近期流量使用较多，推荐您升级至XX套餐，流量更充足...' },
      { name: '短信-升迁提醒', channel: '短信', content: '嗨，流量不够用了吧？升级XX套餐，追剧打游戏再也不用担心...' },
      { name: 'APP弹窗-升迁推荐', channel: 'APP弹窗', content: '您现在的套餐流量不太够用了，给您推荐一个更合适的套餐...' },
    ],
  },
  {
    id: 'STR-002', name: '携转预警挽留（定向优惠+情感维系）', source: 'expert',
    category1: '维系挽留类', category2: '携转预警挽留',
    productCount: 1, scriptCount: 2, channels: ['外呼', '营业厅'],
    actualConversion: 18.5, confidence: 0.443, referenceRate: 0.42,
    relatedIndicators: 2, relatedGroups: 1, relatedRootCauses: 1,
    businessScenarios: ['离网维系', '中高端客户运营'],
    status: '上架', createdAt: '2026-01-15',
    validFrom: '2026-01-15', validUntil: '2026-06-05',
    description: '针对有携转倾向的客户，通过定向优惠和情感维系进行挽留',

    products: [
      { name: '专属挽留优惠包', code: 'PROD-RET-01', description: '定向优惠6个月，含流量加倍+话费减免' },
    ],
    scripts: [
      { name: '外呼-情感维系话术', channel: '外呼', content: '感谢您一直以来对我们服务的信赖，我们特别为您准备了一份专属优惠...' },
      { name: '短信-定向优惠话术', channel: '短信', content: '我们了解到您可能有更换运营商的考虑，其实我们有一份特别优惠...' },
    ],
  },
  {
    id: 'STR-003', name: '到期续约挽留（优惠续约方案）', source: 'expert',
    category1: '维系挽留类', category2: '到期续约',
    productCount: 2, scriptCount: 2, channels: ['短信', '外呼', 'APP弹窗'],
    actualConversion: 22.3, confidence: 0.511, referenceRate: 0.28,
    relatedIndicators: 1, relatedGroups: 2, relatedRootCauses: 1,
    businessScenarios: ['离网维系', '中高端客户运营'],
    status: '上架', createdAt: '2026-03-18',
    validFrom: '2026-03-18', validUntil: '2026-09-18',
    description: '针对合约即将到期的客户，提前推送优惠续约方案，提高续约率',

    products: [
      { name: '续约优惠套餐A', code: 'PROD-REN-A', description: '续约1年享9折，续约2年享8折' },
      { name: '续约优惠套餐B', code: 'PROD-REN-B', description: '续约赠送3个月免费流量包' },
    ],
    scripts: [
      { name: '外呼-续约提醒话术', channel: '外呼', content: '您好，您的合约即将到期，续约可享受专属优惠...' },
      { name: '短信-续约推荐话术', channel: '短信', content: '您的优惠即将到期，现在续约更划算...' },
    ],
  },
  {
    id: 'STR-004', name: '5G体验优化（终端换机补贴）', source: 'ai_generated',
    category1: '体验提升类', category2: '5G体验优化',
    productCount: 1, scriptCount: 1, channels: ['短信', 'APP弹窗'],
    actualConversion: null, confidence: null, referenceRate: null,
    relatedIndicators: 1, relatedGroups: 1, relatedRootCauses: 1,
    businessScenarios: ['流量运营', '增量运营'],
    status: '上架', createdAt: '2026-04-22',
    validFrom: '2026-04-22', validUntil: '2026-10-22',
    description: '针对持有5G终端但使用4G套餐的客户，推荐5G套餐+换机补贴方案',

    products: [
      { name: '5G升级礼包', code: 'PROD-5G-UP', description: '5G套餐+购机补贴500元' },
    ],
    scripts: [
      { name: '外呼-5G升级话术', channel: '外呼', content: '您好，您使用的是5G手机但套餐还是4G的，升级5G套餐体验更流畅...' },
    ],
  },
  {
    id: 'STR-005', name: '流量超套提醒与推荐', source: 'ai_generated',
    category1: '流量运营类', category2: '流量提醒',
    productCount: 1, scriptCount: 1, channels: ['短信', 'APP弹窗'],
    actualConversion: 9.5, confidence: 0.276, referenceRate: 0.20,
    relatedIndicators: 1, relatedGroups: 1, relatedRootCauses: 1,
    businessScenarios: ['流量运营'],
    status: '上架', createdAt: '2026-03-25',
    validFrom: '2026-03-25', validUntil: '2026-06-15',
    description: '流量使用达80%时主动提醒并推荐加餐包或升级套餐',

    products: [
      { name: '10GB流量加餐包', code: 'PROD-TF-10', description: '当月有效10GB流量包，10元/份' },
    ],
    scripts: [
      { name: '短信-超套提醒话术', channel: '短信', content: '您本月流量已使用80%，推荐加购流量包或升级套餐...' },
    ],
  },
  {
    id: 'STR-006', name: '沉默客户唤醒（定向优惠激活）', source: 'ai_generated',
    category1: '维系挽留类', category2: '沉默客户唤醒',
    productCount: 1, scriptCount: 0, channels: ['短信'],
    actualConversion: null, confidence: null, referenceRate: null,
    relatedIndicators: 0, relatedGroups: 1, relatedRootCauses: 0,
    businessScenarios: ['离网维系'],
    status: '下架', createdAt: '2026-05-10',
    validFrom: '2026-05-10', validUntil: '2026-11-10',
    description: '针对长期沉默客户，通过定向优惠激活使用',

    products: [
      { name: '唤醒专属优惠', code: 'PROD-WAKE-01', description: '3个月免费体验包' },
    ],
    scripts: [],
  },
];

export default function StrategyListPage() {
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

  const handleImport = () => {
    setImportStep('upload');
    setImportOpen(true);
  };

  const handleFileUpload = () => {
    setImportResult({
      success: 8,
      fail: 2,
      errors: [
        { row: 4, reason: '策略名称与已有记录重复：竞品降价应急响应策略' },
        { row: 9, reason: '关联根因不存在：网络质量下降导致投诉增加' },
      ],
    });
    setImportStep('preview');
  };

  const handleImportConfirm = () => {
    setImportStep('done');
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
    const currentPageIds = data.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => item.id);
    setSelectedIds(checked ? currentPageIds : []);
  };

  const handleDownloadTemplate = () => {
    // 使用 xlsx 库生成双Sheet的Excel模板
    const XLSX = require('xlsx');
    const importData = [
      ['策略名称','策略描述','一级分类','二级分类','业务场景','来源','关联根因','推荐产品','营销话术','适用渠道'],
      ['说明行(导入时跳过)','来源可选值=专家经验/AI生成；业务场景/关联根因/推荐产品/适用渠道多值用|分隔；营销话术格式=话术名称|渠道|话术内容，多条用||分隔；一级分类需匹配系统预置值，二级分类需与一级分类对应','','','','','','','',''],
      ['套餐升迁推荐（高流量低资费档位）','针对流量超套或DOU持续增长的客户，推荐更高流量档位套餐','套餐优化类','套餐升迁','流量运营|中高端客户运营','专家经验','套餐流量容量不足|客户套餐与使用习惯不匹配','5G畅享199套餐|5G畅享129套餐','通用升迁话术|外呼|您好，注意到您近期流量使用较多…||青年版话术|短信|嗨，流量不够用了吧…','外呼|短信|APP弹窗'],
      ['达量降速关怀挽留','针对达量降速客户，赠送临时流量包并推荐不限速套餐','体验提升类','5G体验优化','流量运营','AI生成','流量超套后降速体验差','9.9元3GB提速包|5G不限速159套餐','降速关怀话术|外呼|您好，您的流量已达套餐上限，为您临时提速…||短信关怀|短信|您的流量已用完，点击领3GB提速包','外呼|短信|APP弹窗'],
      ['到期续约赠送挽留','合约到期客户赠送话费或流量，引导续约并绑定更长期合约','维系挽留类','到期续约','离网维系|中高端客户运营','专家经验','合约到期未续约|转网意向增强','续约送120话费(12月)|续约送20GB流量包','续约挽留话术|外呼|您好，感谢您的信任，续约可享专属话费赠送…||营业厅话术|营业厅|续约享特惠，详询10086','外呼|营业厅|企微'],
      ['ARPU提升推荐（中高端保有价值）','针对ARPU持续下降的中高端客户，推荐更高价值套餐或增值业务','价值提升类','增值业务推荐','中高端客户运营','AI生成','ARPU持续下降|客户价值流失','全球通尊享288套餐|云盘会员包|视频彩铃包','价值提升话术|外呼|您好，为您推荐尊享套餐，享更多权益…||企微推送|企微|专属升级优惠，限时开放','外呼|企微|APP弹窗'],
    ];
    const categoryData: string[][] = [['一级分类','二级分类']];
    for (const [k, vs] of Object.entries(strategyCategoryTree)) {
      for (const v of vs) categoryData.push([k, v]);
    }
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(importData);
    const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
    ws1['!cols'] = [{wch:28},{wch:40},{wch:14},{wch:14},{wch:24},{wch:12},{wch:30},{wch:30},{wch:60},{wch:24}];
    ws2['!cols'] = [{wch:18},{wch:18}];
    XLSX.utils.book_append_sheet(wb, ws1, '导入数据');
    XLSX.utils.book_append_sheet(wb, ws2, '分类枚举值');
    XLSX.writeFile(wb, '策略导入模板.xlsx');
  };

  const filteredData = data.filter((item) => {
    if (searchText && !item.name.includes(searchText) && !item.category1.includes(searchText) && !item.category2.includes(searchText)) return false;
    if (filterCategory1 !== 'all' && item.category1 !== filterCategory1) return false;
    if (filterSource !== 'all' && item.source !== filterSource) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterScenario !== 'all' && !item.businessScenarios.includes(filterScenario)) return false;
    if (filterValidity !== 'all') {
      const vs = getValidityStatus(item);
      if (filterValidity !== vs) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const total = data.length;
  const aiCount = data.filter((d) => d.source === 'ai_generated').length;
  const avgConversion = data.filter((d) => d.actualConversion !== null).reduce((sum, d) => sum + (d.actualConversion || 0), 0) / data.filter((d) => d.actualConversion !== null).length;
  const publishedCount = data.filter((d) => d.status === '上架').length;
  const expiringCount = data.filter((d) => d.status === '上架' && getValidityStatus(d) === '即将过期').length;

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">策略库管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理运营策略知识库，含6层完整结构</p>
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
          <Button size="sm" className="gap-1.5" onClick={() => router.push('/workspace/strategy/library/edit')}>
            <Plus className="w-4 h-4" />
            新增策略
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">策略总数</div>
          <div className="text-2xl font-semibold mt-1">{total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">AI生成占比</div>
          <div className="text-2xl font-semibold mt-1">{Math.round((aiCount / total) * 100)}%<span className="text-sm font-normal text-gray-400 ml-1">({aiCount}条)</span></div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">平均转化率</div>
          <div className="text-2xl font-semibold mt-1">{avgConversion.toFixed(1)}%</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">上架数量</div>
          <div className="text-2xl font-semibold mt-1">{publishedCount}<span className="text-sm font-normal text-gray-400 ml-1">/{total}</span></div>
        </div>
        <div className="bg-white border rounded-lg p-4 border-amber-200 bg-amber-50">
          <div className="text-sm text-amber-600">即将过期</div>
          <div className="text-2xl font-semibold mt-1 text-amber-600">{expiringCount}<span className="text-sm font-normal text-amber-400 ml-1">30天内到期</span></div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="w-full h-8 pl-8 text-sm" placeholder="搜索策略名称、分类" value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} />
          </div>
          <Select value={filterCategory1} onValueChange={(v) => { setFilterCategory1(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue placeholder="一级分类" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {Object.keys(strategyCategoryTree).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={(v) => { setFilterSource(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="expert">专家经验</SelectItem>
              <SelectItem value="ai_generated">AI生成</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[100px] h-8 text-sm"><SelectValue placeholder="状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="上架">上架</SelectItem>
              
              <SelectItem value="下架">下架</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterScenario} onValueChange={(v) => { setFilterScenario(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue placeholder="业务场景" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部场景</SelectItem>
              <SelectItem value="流量运营">流量运营</SelectItem>
              <SelectItem value="离网维系">离网维系</SelectItem>
              <SelectItem value="家庭运营">家庭运营</SelectItem>
              <SelectItem value="中高端客户运营">中高端客户运营</SelectItem>
              <SelectItem value="增量运营">增量运营</SelectItem>
              <SelectItem value="校园运营">校园运营</SelectItem>
              <SelectItem value="国际业务运营">国际业务运营</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterValidity} onValueChange={(v) => { setFilterValidity(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="有效期状态" /></SelectTrigger>
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
                    checked={
                      data.slice((currentPage - 1) * pageSize, currentPage * pageSize).length > 0 &&
                      data
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .every((item) => selectedIds.includes(item.id))
                    }
                    onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead className="min-w-[60px]">ID</TableHead>
                <TableHead className="min-w-[220px]">策略名称</TableHead>
                <TableHead className="min-w-[80px]">来源</TableHead>
                <TableHead className="min-w-[100px]">分类</TableHead>
                <TableHead className="min-w-[60px]">产品数</TableHead>
                <TableHead className="min-w-[60px]">话术数</TableHead>
                <TableHead className="min-w-[130px]">渠道</TableHead>
                <TableHead className="min-w-[80px]">实际转化率</TableHead>
                <TableHead className="min-w-[120px]">置信度</TableHead>
                <TableHead className="min-w-[120px]">业务场景</TableHead>
                <TableHead className="min-w-[70px]">关联根因</TableHead>
                <TableHead className="min-w-[70px]">关联指标</TableHead>
                <TableHead className="min-w-[70px]">关联客群</TableHead>
                <TableHead className="min-w-[60px]">状态</TableHead>
                <TableHead className="min-w-[160px]">有效期</TableHead>
                <TableHead className="min-w-[100px] sticky right-0 bg-white">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
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
                  <TableCell className="text-sm text-center">{item.productCount}</TableCell>
                  <TableCell className="text-sm text-center">{item.scriptCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.channels.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-xs px-1 py-0">{ch}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-center">{item.actualConversion !== null ? `${item.actualConversion}%` : '-'}</TableCell>
                  <TableCell>
                    {item.confidence !== null ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.confidence >= 0.60 ? 'bg-green-500' : item.confidence >= 0.30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.round(item.confidence * 100)}%` }} />
                              </div>
                              <span className="text-xs">{item.confidence.toFixed(3)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px]">
                            <p className="text-xs">置信度 = 转化率×0.70 + 引用率×0.15 + 来源权重×0.15</p>
                            <p className="text-xs mt-1">来源权重：专家经验=1.0，AI生成=0.75</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs text-gray-400">暂无数据</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.businessScenarios.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs px-1.5 py-0">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-center">{item.relatedRootCauses}</TableCell>
                  <TableCell className="text-sm text-center">{item.relatedIndicators}</TableCell>
                  <TableCell className="text-sm text-center">{item.relatedGroups}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === '上架' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.validFrom && item.validUntil ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">{item.validFrom} ~ {item.validUntil}</span>
                        <Badge className={`text-xs px-1.5 py-0 ${
                          item.status !== '上架' ? 'bg-gray-100 text-gray-400' :
                          getValidityStatus(item) === '有效' ? 'bg-green-100 text-green-700' :
                          getValidityStatus(item) === '即将过期' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status !== '上架' ? '-' : getValidityStatus(item)}
                        </Badge>
                      </div>
                    ) : <span className="text-xs text-gray-400">-</span>}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-white">
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/workspace/strategy/library/${item.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>详情</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/workspace/strategy/library/edit?id=${item.id}`)}>
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
            <span className="text-sm text-muted-foreground">第 {currentPage} / {Math.max(1, Math.ceil(filteredData.length / pageSize))} 页</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage >= Math.ceil(filteredData.length / pageSize)} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
          </div>
        </div>
      </div>
      {/* 导入弹窗 */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>导入策略</DialogTitle>
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
              <p className="text-xs text-gray-500 mt-1">成功导入 {importResult.success} 条策略</p>
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
                ? `确定要将策略"${publishTarget?.name}"上架吗？上架后该策略将参与系统推荐，可被调度单引用。`
                : `确定要将策略"${publishTarget?.name}"下架吗？下架后该策略将不参与系统推荐，不可被新调度单引用。已引用该策略的调度单不受影响。`}
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
              确定要删除策略"{deleteTarget?.name}"吗？删除后该记录将从列表中移除，关联的历史调度单将保留快照数据。此操作不可撤销。
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
              已选中 {selectedIds.length} 条策略，删除后记录将从列表中移除，关联的历史调度单将保留快照数据。此操作不可撤销。
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

