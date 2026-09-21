'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Download, FileSpreadsheet, FileText, BarChart3, BrainCircuit, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FileCategory = 'all' | 'report' | 'insight' | 'ai-insight';
type ScopeFilter = 'all' | 'mine' | 'team';

interface DownloadFile {
  id: string;
  name: string;
  category: 'report' | 'insight' | 'ai-insight';
  fileType: string;
  createdAt: string;
  scope: 'mine' | 'team';
  businessScenario?: string;
  generationType?: 'report' | 'spreadsheet' | 'dashboard' | 'summary';
  visibility?: 'self' | 'region';
}

// 模拟数据
const mockFiles: DownloadFile[] = [
  { id: '1', name: '洞察总览20260702215120.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-02 21:51:20', scope: 'mine', businessScenario: '流量运营' },
  { id: '2', name: '统一营销进度20260625211809.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-06-25 21:18:09', scope: 'team', businessScenario: '中高端客户运营' },
  { id: '3', name: 'ARPU分析报告20260701102530.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-07-01 10:25:30', scope: 'mine', businessScenario: '流量运营' },
  { id: '4', name: '流量运营日报20260703083000.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-03 08:30:00', scope: 'mine', businessScenario: '流量运营' },
  { id: '5', name: '离网预警分析20260630154212.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-06-30 15:42:12', scope: 'team', businessScenario: '离网维系' },
  { id: '6', name: '中高端客户画像20260702143556.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-02 14:35:56', scope: 'mine', businessScenario: '中高端客户运营' },
  { id: '7', name: '家庭融合运营周报20260628090000.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-06-28 09:00:00', scope: 'team', businessScenario: '家庭融合运营' },
  { id: '8', name: '区域份额对比分析20260701162045.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-07-01 16:20:45', scope: 'mine', businessScenario: '流量运营' },
  { id: '9', name: '增量发展月度报告20260701000000.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-01 00:00:00', scope: 'team', businessScenario: '增量运营' },
  { id: '10', name: '国际业务收入分析20260629091522.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-06-29 09:15:22', scope: 'mine', businessScenario: '国际业务运营' },
  { id: '11', name: '网格绩效排名20260703100800.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-03 10:08:00', scope: 'mine', businessScenario: '流量运营' },
  { id: '12', name: '竞品动态监测20260702111530.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-07-02 11:15:30', scope: 'team', businessScenario: '流量运营' },
  // AI洞察分析文件
  { id: '13', name: '乌鲁木齐ARPU下降归因分析.docx', category: 'ai-insight', fileType: 'docx', createdAt: '2026-07-03 15:30:22', scope: 'mine', businessScenario: '流量运营', generationType: 'report', visibility: 'self' },
  { id: '14', name: '中高端客户流失预警摘要.txt', category: 'ai-insight', fileType: 'txt', createdAt: '2026-07-03 14:18:05', scope: 'mine', businessScenario: '离网维系', generationType: 'summary', visibility: 'self' },
  { id: '15', name: '全疆流量运营数据报表.xlsx', category: 'ai-insight', fileType: 'xlsx', createdAt: '2026-07-03 11:42:33', scope: 'mine', businessScenario: '流量运营', generationType: 'spreadsheet', visibility: 'self' },
  { id: '16', name: '家庭融合业务洞察报告.docx', category: 'ai-insight', fileType: 'docx', createdAt: '2026-07-02 17:55:10', scope: 'team', businessScenario: '家庭融合运营', generationType: 'report', visibility: 'region' },
  { id: '17', name: '增量发展潜力看板数据.pdf', category: 'ai-insight', fileType: 'pdf', createdAt: '2026-07-02 16:20:48', scope: 'mine', businessScenario: '增量运营', generationType: 'dashboard', visibility: 'self' },
  { id: '18', name: '国际业务运营月度摘要.txt', category: 'ai-insight', fileType: 'txt', createdAt: '2026-07-02 10:33:15', scope: 'team', businessScenario: '国际业务运营', generationType: 'summary', visibility: 'region' },
  { id: '19', name: '昌吉流量异常归因报告.docx', category: 'ai-insight', fileType: 'docx', createdAt: '2026-07-01 20:05:38', scope: 'mine', businessScenario: '流量运营', generationType: 'report', visibility: 'self' },
  { id: '20', name: '离网客户挽留效果分析.xlsx', category: 'ai-insight', fileType: 'xlsx', createdAt: '2026-07-01 14:22:55', scope: 'mine', businessScenario: '离网维系', generationType: 'spreadsheet', visibility: 'self' },
  // 更多报表和洞察报告
  { id: '21', name: '渠道效能分析20260702093000.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-02 09:30:00', scope: 'team', businessScenario: '流量运营' },
  { id: '22', name: '5G套餐转化漏斗分析.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-07-02 08:45:12', scope: 'mine', businessScenario: '增量运营' },
  { id: '23', name: '客户生命周期价值报告20260701.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-01 16:30:00', scope: 'mine', businessScenario: '中高端客户运营' },
  { id: '24', name: '宽带续费率趋势分析.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-07-01 11:20:08', scope: 'team', businessScenario: '家庭融合运营' },
  { id: '25', name: '全业务量收日报20260703060000.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-07-03 06:00:00', scope: 'team', businessScenario: '流量运营' },
  { id: '26', name: '携号转网流失分析20260630102200.pdf', category: 'insight', fileType: 'pdf', createdAt: '2026-06-30 10:22:00', scope: 'mine', businessScenario: '离网维系' },
  { id: '27', name: '阿克苏区域攻坚成效报告.docx', category: 'ai-insight', fileType: 'docx', createdAt: '2026-06-30 09:15:30', scope: 'mine', businessScenario: '流量运营', generationType: 'report', visibility: 'self' },
  { id: '28', name: '套餐升级潜力看板.pdf', category: 'ai-insight', fileType: 'pdf', createdAt: '2026-06-29 15:48:22', scope: 'team', businessScenario: '增量运营', generationType: 'dashboard', visibility: 'region' },
  { id: '29', name: '客服工单关联分析20260628.xlsx', category: 'report', fileType: 'xlsx', createdAt: '2026-06-28 14:00:00', scope: 'mine', businessScenario: '流量运营' },
];

const businessScenarios = [
  '所有业务场景',
  '流量运营',
  '中高端客户运营',
  '离网维系',
  '家庭融合运营',
  '国际业务运营',
  '增量运营',
];

const generationTypeLabels: Record<string, string> = {
  report: '洞察报告',
  spreadsheet: '数据报表',
  dashboard: '数据看板',
  summary: '数据摘要',
};

function getFileIcon(category: DownloadFile['category'], fileType: string) {
  if (category === 'ai-insight') {
    return <BrainCircuit className="h-8 w-8 text-primary" />;
  }
  if (fileType === 'xlsx' || fileType === 'csv') {
    return <FileSpreadsheet className="h-8 w-8 text-emerald-600" />;
  }
  if (fileType === 'pdf') {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <BarChart3 className="h-8 w-8 text-blue-500" />;
}

function getCategoryIcon(category: FileCategory) {
  switch (category) {
    case 'report': return <FileSpreadsheet className="h-4 w-4" />;
    case 'insight': return <FileText className="h-4 w-4" />;
    case 'ai-insight': return <BrainCircuit className="h-4 w-4" />;
    default: return null;
  }
}

function DownloadZonePage() {
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [scenarioFilter, setScenarioFilter] = useState('所有业务场景');
  const [startDate, setStartDate] = useState('');

  // URL参数?tab=ai-insight 定位到AI洞察分析Tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'ai-insight') {
      setActiveCategory('ai-insight');
    }
  }, [searchParams]);
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 读取AI洞察助手归档的真实产出物
  const allFiles = useMemo(() => {
    const files = [...mockFiles];
    try {
      const archivedRaw = localStorage.getItem('ai-insight-archived-outputs');
      if (archivedRaw) {
        const archived = JSON.parse(archivedRaw) as Array<{
          id: string;
          name: string;
          type: 'report' | 'spreadsheet' | 'dashboard' | 'summary';
          visibility: 'self' | 'region';
          businessScenario: string;
          archivedAt: string;
        }>;
        const fileTypeMap: Record<string, string> = {
          report: 'docx',
          spreadsheet: 'xlsx',
          dashboard: 'pdf',
          summary: 'txt',
        };
        const archivedFiles: DownloadFile[] = archived.map(item => ({
          id: `archived-${item.id}`,
          name: item.name,
          category: 'ai-insight' as const,
          fileType: fileTypeMap[item.type] || 'docx',
          createdAt: item.archivedAt,
          scope: (item.visibility === 'region' ? 'team' : 'mine') as 'mine' | 'team',
          businessScenario: item.businessScenario,
          generationType: item.type,
          visibility: item.visibility,
        }));
        files.push(...archivedFiles);
      }
    } catch {
      // ignore parse errors
    }
    return files;
  }, []);

  // 筛选逻辑
  const filteredFiles = useMemo(() => {
    let result = [...allFiles];

    // Tab分类筛选
    if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory);
    }

    // 搜索
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(kw));
    }

    // 业务场景筛选
    if (scenarioFilter !== '所有业务场景') {
      result = result.filter(f => f.businessScenario === scenarioFilter);
    }

    // 时间范围
    if (startDate) {
      result = result.filter(f => f.createdAt >= startDate);
    }
    if (endDate) {
      result = result.filter(f => f.createdAt <= endDate + ' 23:59:59');
    }

    // 范围筛选
    if (scopeFilter !== 'all') {
      result = result.filter(f => f.scope === scopeFilter);
    }

    return result;
  }, [activeCategory, searchText, scenarioFilter, startDate, endDate, scopeFilter]);

  // 分类计数
  const categoryCounts = useMemo(() => ({
    all: mockFiles.length,
    report: mockFiles.filter(f => f.category === 'report').length,
    insight: mockFiles.filter(f => f.category === 'insight').length,
    'ai-insight': mockFiles.filter(f => f.category === 'ai-insight').length,
  }), []);

  // 分页
  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownload = (file: DownloadFile) => {
    // 实际项目中调用下载接口
    alert(`开始下载: ${file.name}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const tabs: { key: FileCategory; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: categoryCounts.all },
    { key: 'report', label: '报表', count: categoryCounts.report },
    { key: 'insight', label: '数据洞察报告', count: categoryCounts.insight },
    { key: 'ai-insight', label: 'AI洞察分析', count: categoryCounts['ai-insight'] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* 面包屑 */}
        <div className="mb-4 text-sm text-muted-foreground">
          <span>能力中心</span>
          <span className="mx-2">&gt;</span>
          <span>下载中心</span>
          <span className="mx-2">&gt;</span>
          <span className="text-foreground">下载专区</span>
        </div>

        {/* 搜索栏 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="请输入搜索内容"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setCurrentPage(1)}>搜索</Button>
        </div>

        {/* 筛选条件行 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={scenarioFilter} onValueChange={v => { setScenarioFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {businessScenarios.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-[150px]"
              placeholder="开始时间"
            />
            <span className="text-muted-foreground">~</span>
            <Input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-[150px]"
              placeholder="结束时间"
            />
          </div>
        </div>

        {/* Tab + 右侧范围筛选 */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveCategory(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {getCategoryIcon(tab.key)}
                {tab.label}
                <span className="text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-md border bg-muted/30 p-0.5">
            {([
              { key: 'mine' as ScopeFilter, label: '我生成的' },
              { key: 'team' as ScopeFilter, label: '团队' },
              { key: 'all' as ScopeFilter, label: '全部' },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => { setScopeFilter(s.key); setCurrentPage(1); }}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  scopeFilter === s.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 文件卡片网格 */}
        {paginatedFiles.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-muted-foreground">
            暂无符合条件的文件
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginatedFiles.map(file => (
              <div
                key={file.id}
                className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* 文件图标 + 名称 */}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    {getFileIcon(file.category, file.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                      {file.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                </div>

                {/* 标签行 */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {file.category === 'ai-insight' && file.generationType && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {generationTypeLabels[file.generationType]}
                    </Badge>
                  )}
                  {file.category === 'ai-insight' && file.visibility && (
                    <Badge variant={file.visibility === 'region' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                      {file.visibility === 'region' ? '本区域' : '仅自己'}
                    </Badge>
                  )}
                  {file.businessScenario && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {file.businessScenario}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                    {file.fileType}
                  </Badge>
                </div>

                {/* 创建时间 + 下载按钮 */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>创建于{file.createdAt}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    下载
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            共{filteredFiles.length}项数据
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{pageSize}条/页</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              上一页
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadZonePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>}>
      <DownloadZonePage />
    </Suspense>
  );
}
