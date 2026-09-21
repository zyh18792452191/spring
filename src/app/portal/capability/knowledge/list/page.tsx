'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, RotateCcw, Plus, Eye, Pencil, Trash2, LayoutGrid, List, X, Clock, History } from 'lucide-react';
import { toast } from 'sonner';

// ===== 类型定义 =====
type ContentType = 'CASE' | 'SCRIPT' | 'MANUAL' | 'SCENARIO';
type KnowledgeStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'OFFLINE';

interface KnowledgeItem {
  knowledgeId: string;
  title: string;
  contentType: ContentType;
  scenarioCodes: number[];
  caseResult?: 'SUCCESS' | 'FAIL';
  summary: string;
  tags: string[];
  status: KnowledgeStatus;
  creator: string;
  createTime: string;
  updateTime: string;
  viewCount: number;
}

// ===== 常量 =====
const CONTENT_TYPE_MAP: Record<ContentType, { label: string; color: string }> = {
  CASE: { label: '策略案例', color: 'bg-blue-100 text-blue-700' },
  SCRIPT: { label: '营销话术', color: 'bg-purple-100 text-purple-700' },
  MANUAL: { label: '操作手册', color: 'bg-amber-100 text-amber-700' },
  SCENARIO: { label: '场景知识', color: 'bg-teal-100 text-teal-700' },
};

const STATUS_MAP: Record<KnowledgeStatus, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  PENDING: { label: '待审核', color: 'bg-orange-100 text-orange-700' },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已驳回', color: 'bg-red-100 text-red-700' },
  OFFLINE: { label: '已下线', color: 'bg-gray-100 text-gray-500' },
};

const SCENARIOS = [
  { code: 1, name: '携转挽留' },
  { code: 2, name: '携出授权码' },
  { code: 3, name: '宽带存量关怀' },
  { code: 4, name: '全球通离网' },
  { code: 5, name: '全球通投诉' },
  { code: 6, name: '热线商机' },
  { code: 7, name: '异动修复' },
  { code: 8, name: '离网原因追溯' },
  { code: 9, name: '停机赢回' },
];

// ===== 模拟数据 =====
const MOCK_DATA: KnowledgeItem[] = [
  {
    knowledgeId: 'KN001',
    title: '携转挽留策略案例——乌鲁木齐成功挽留高价值客户',
    contentType: 'CASE',
    scenarioCodes: [1],
    caseResult: 'SUCCESS',
    summary: '针对乌鲁木齐地区携转意向高价值客户，通过精准画像分析识别挽留窗口期，结合差异化话术和专属优惠方案，成功挽留率提升至68%。',
    tags: ['最佳实践', '携转挽留'],
    status: 'PUBLISHED',
    creator: '李明',
    createTime: '2026-07-15 10:30:00',
    updateTime: '2026-08-01 14:20:00',
    viewCount: 156,
  },
  {
    knowledgeId: 'KN002',
    title: '全球通离网挽留标准话术（2026版）',
    contentType: 'SCRIPT',
    scenarioCodes: [4],
    summary: '全球通离网客户挽留标准化沟通话术，包含开场白、需求挖掘、方案推荐、异议处理和结束语5个环节，适用于外呼和新入网场景。',
    tags: ['话术模板', '全球通离网'],
    status: 'PUBLISHED',
    creator: '王芳',
    createTime: '2026-06-20 09:00:00',
    updateTime: '2026-07-28 16:45:00',
    viewCount: 243,
  },
  {
    knowledgeId: 'KN003',
    title: '精益平台预警场景配置操作手册',
    contentType: 'MANUAL',
    scenarioCodes: [1, 3, 5, 7],
    summary: '精益平台预警场景的配置操作指南，涵盖预警规则创建、阈值设置、触发条件配置和通知渠道选择，适用于运营人员日常配置。',
    tags: ['流程规范', '新手必读'],
    status: 'PENDING',
    creator: '张伟',
    createTime: '2026-08-05 11:00:00',
    updateTime: '2026-08-05 11:00:00',
    viewCount: 0,
  },
  {
    knowledgeId: 'KN004',
    title: '宽带离网判断逻辑与存量关怀策略',
    contentType: 'SCENARIO',
    scenarioCodes: [3],
    summary: '宽带离网判断的业务规则与逻辑说明，包含离网倾向评分模型、关怀触发时机、关怀频次和关怀话术匹配规则。',
    tags: ['最佳实践'],
    status: 'DRAFT',
    creator: '赵敏',
    createTime: '2026-08-10 15:30:00',
    updateTime: '2026-08-10 15:30:00',
    viewCount: 0,
  },
  {
    knowledgeId: 'KN005',
    title: '热线商机引导话术与派单规则',
    contentType: 'SCRIPT',
    scenarioCodes: [6],
    summary: '热线渠道商机识别与引导话术，包含商机类型判断、意向确认、信息采集和派单流程，适用于客服人员。',
    tags: ['话术模板', '热线商机'],
    status: 'REJECTED',
    creator: '陈刚',
    createTime: '2026-07-25 14:00:00',
    updateTime: '2026-08-08 09:30:00',
    viewCount: 12,
  },
  {
    knowledgeId: 'KN006',
    title: '异动客户修复策略案例——ARPU下降客群修复',
    contentType: 'CASE',
    scenarioCodes: [5, 7],
    caseResult: 'FAIL',
    summary: '针对ARPU下降30%以上的客群，通过消费行为分析识别下降原因，设计增值业务推荐方案，但执行效果未达预期，修复率仅12%。',
    tags: ['失败教训', '异动修复'],
    status: 'PUBLISHED',
    creator: '刘洋',
    createTime: '2026-06-10 08:30:00',
    updateTime: '2026-07-20 10:15:00',
    viewCount: 89,
  },
  {
    knowledgeId: 'KN007',
    title: '网格通操作手册（一线人员版）',
    contentType: 'MANUAL',
    scenarioCodes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    summary: '网格通APP操作指南，涵盖商机抢单、工单处理、客户信息查看、执行反馈和绩效查看等功能，适用于网格一线人员。',
    tags: ['新手必读', '流程规范'],
    status: 'PUBLISHED',
    creator: '李明',
    createTime: '2026-05-20 10:00:00',
    updateTime: '2026-08-01 09:00:00',
    viewCount: 567,
  },
  {
    knowledgeId: 'KN008',
    title: '停机赢回话术与客户分级策略',
    contentType: 'SCRIPT',
    scenarioCodes: [8],
    summary: '停机客户赢回标准化话术和客户分级规则，按客户价值分为A/B/C三级，针对不同级别设计差异化挽留方案。',
    tags: ['话术模板', '停机赢回'],
    status: 'OFFLINE',
    creator: '王芳',
    createTime: '2026-04-15 14:30:00',
    updateTime: '2026-07-30 11:20:00',
    viewCount: 78,
  },
  {
    knowledgeId: 'KN009',
    title: '投诉安抚话术与升级规则',
    contentType: 'SCRIPT',
    scenarioCodes: [4, 5],
    summary: '全球通投诉客户安抚话术，包含情绪安抚、问题定位、解决方案和升级规则，适用于投诉处理场景。',
    tags: ['话术模板', '高频问题'],
    status: 'DRAFT',
    creator: '赵敏',
    createTime: '2026-08-12 09:00:00',
    updateTime: '2026-08-12 09:00:00',
    viewCount: 0,
  },
  {
    knowledgeId: 'KN010',
    title: '全球通离网原因追溯流程与问卷话术',
    contentType: 'SCENARIO',
    scenarioCodes: [7, 4],
    summary: '全球通客户离网原因追溯的标准流程和调查问卷话术，包含追访时机、问卷设计、数据采集和原因分类规则。',
    tags: ['流程规范'],
    status: 'PENDING',
    creator: '张伟',
    createTime: '2026-08-11 16:00:00',
    updateTime: '2026-08-11 16:00:00',
    viewCount: 0,
  },
];

export default function KnowledgeListPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [contentType, setContentType] = useState<string>('all');
  const [scenario, setScenario] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeItem | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const pageSize = 20;

  // 筛选逻辑
  const filteredList = useMemo(() => {
    return MOCK_DATA.filter(item => {
      if (keyword) {
        const kw = keyword.toLowerCase();
        const match = item.title.toLowerCase().includes(kw) ||
          item.summary.toLowerCase().includes(kw);
        if (!match) return false;
      }
      if (contentType !== 'all' && item.contentType !== contentType) return false;
      if (scenario !== 'all' && !item.scenarioCodes.includes(Number(scenario))) return false;
      if (status !== 'all' && item.status !== status) return false;
      return true;
    });
  }, [keyword, contentType, scenario, status]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const pageData = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h !== keyword.trim());
        return [keyword.trim(), ...filtered].slice(0, 5);
      });
    }
    setCurrentPage(1);
    setShowHistory(false);
  };

  const handleReset = () => {
    setKeyword('');
    setContentType('all');
    setScenario('all');
    setStatus('all');
    setCurrentPage(1);
  };

  const handleDelete = (item: KnowledgeItem) => {
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      toast.success(`知识「${deleteTarget.title}」已删除`);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const canEdit = (item: KnowledgeItem) => {
    return item.status === 'DRAFT' || item.status === 'REJECTED' || item.status === 'OFFLINE';
  };

  const canDelete = (item: KnowledgeItem) => {
    return item.status === 'DRAFT' || item.status === 'REJECTED' || item.status === 'OFFLINE';
  };

  const canSubmitAudit = (item: KnowledgeItem) => {
    return item.status === 'DRAFT' || item.status === 'REJECTED';
  };

  const getScenarioNames = (codes: number[]) => {
    return codes.map(c => SCENARIOS.find(s => s.code === c)?.name || `场景${c}`).join('、');
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-4">
        {/* 搜索筛选栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Input
                  placeholder="输入关键词搜索标题、摘要"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onFocus={() => keyword.trim() === '' && searchHistory.length > 0 && setShowHistory(true)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="pr-8"
                />
                {keyword && (
                  <X className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => { setKeyword(''); setShowHistory(false); }} />
                )}
                {showHistory && searchHistory.length > 0 && !keyword && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                    <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-1 border-b">
                      <History className="h-3 w-3" /> 搜索历史
                    </div>
                    {searchHistory.map((h, i) => (
                      <div key={i} className="px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-center gap-2" onClick={() => { setKeyword(h); setShowHistory(false); handleSearch(); }}>
                        <Clock className="h-3 w-3 text-muted-foreground" />{h}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select value={contentType} onValueChange={v => { setContentType(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="内容类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="CASE">策略案例</SelectItem>
                  <SelectItem value="SCRIPT">营销话术</SelectItem>
                  <SelectItem value="MANUAL">操作手册</SelectItem>
                  <SelectItem value="SCENARIO">场景知识</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scenario} onValueChange={v => { setScenario(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="关联场景" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部场景</SelectItem>
                  {SCENARIOS.map(s => (
                    <SelectItem key={s.code} value={String(s.code)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={v => { setStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="PENDING">待审核</SelectItem>
                  <SelectItem value="PUBLISHED">已发布</SelectItem>
                  <SelectItem value="REJECTED">已驳回</SelectItem>
                  <SelectItem value="OFFLINE">已下线</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} size="sm"><Search className="h-4 w-4 mr-1" />搜索</Button>
              <Button variant="outline" onClick={handleReset} size="sm"><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
            </div>
          </CardContent>
        </Card>

        {/* 操作栏 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">共 {filteredList.length} 条知识</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/portal/capability/knowledge/edit')} size="sm">
              <Plus className="h-4 w-4 mr-1" />新建知识
            </Button>
            <div className="flex border rounded-md">
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="rounded-r-none" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="sm" className="rounded-l-none" onClick={() => setViewMode('card')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 列表视图 */}
        {viewMode === 'list' ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">知识标题</TableHead>
                  <TableHead className="w-[10%]">内容类型</TableHead>
                  <TableHead className="w-[10%]">关联场景</TableHead>
                  <TableHead className="w-[8%]">状态</TableHead>
                  <TableHead className="w-[8%]">创建人</TableHead>
                  <TableHead className="w-[12%]">更新时间</TableHead>
                  <TableHead className="w-[12%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : pageData.map(item => (
                  <TableRow key={item.knowledgeId}>
                    <TableCell>
                      <button
                        className="text-sm text-primary hover:underline text-left"
                        onClick={() => router.push(`/portal/capability/knowledge/detail?id=${item.knowledgeId}`)}
                      >
                        {item.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={CONTENT_TYPE_MAP[item.contentType].color}>
                        {CONTENT_TYPE_MAP[item.contentType].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">{getScenarioNames(item.scenarioCodes)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {getScenarioNames(item.scenarioCodes)}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_MAP[item.status].color}>
                        {STATUS_MAP[item.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{item.creator}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.updateTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => router.push(`/portal/capability/knowledge/detail?id=${item.knowledgeId}`)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>查看</TooltipContent>
                        </Tooltip>
                        {canEdit(item) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => router.push(`/portal/capability/knowledge/edit?id=${item.knowledgeId}`)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>编辑</TooltipContent>
                          </Tooltip>
                        )}
                        {canSubmitAudit(item) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-orange-600 hover:text-orange-700" onClick={() => toast.success('已提交审核')}>
                                提交
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>提交审核</TooltipContent>
                          </Tooltip>
                        )}
                        {canDelete(item) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          /* 卡片视图 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageData.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">暂无数据</div>
            ) : pageData.map(item => (
              <Card key={item.knowledgeId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/portal/capability/knowledge/detail?id=${item.knowledgeId}`)}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-tight line-clamp-2">{item.title}</h3>
                    <Badge variant="outline" className={STATUS_MAP[item.status].color + ' shrink-0'}>
                      {STATUS_MAP[item.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={CONTENT_TYPE_MAP[item.contentType].color}>
                      {CONTENT_TYPE_MAP[item.contentType].label}
                    </Badge>
                    {item.caseResult && (
                      <Badge variant="outline" className={item.caseResult === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                        {item.caseResult === 'SUCCESS' ? '成功' : '失败'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.creator} · {item.updateTime.slice(0, 10)}</span>
                    <span>{item.viewCount} 次浏览</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {filteredList.length > pageSize && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {filteredList.length} 条，第 {currentPage}/{totalPages} 页
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" className="w-8" onClick={() => setCurrentPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                确定要删除知识「{deleteTarget?.title}」吗？删除后将无法恢复。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
              <Button variant="destructive" onClick={confirmDelete}>确认删除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
