'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== 类型定义 ====================

type SupervisionStatus = '待执行' | '待确认' | '已完成' | '已驳回' | '已下线';
type SupervisionType = '预警工单督办' | '保有任务督办' | '其他督办任务';

interface SupervisionRecord {
  id: string;
  name: string;
  type: SupervisionType;
  org: string;
  supervisor: string;
  createTime: string;
  status: SupervisionStatus;
  handler: string;
  startTime: string;
  endTime: string;
  progress: string;
  content: string;
}

// ==================== 常量配置 ====================

const statusConfig: Record<SupervisionStatus, { label: string; color: string }> = {
  '待执行': { label: '待执行', color: 'bg-blue-100 text-blue-700' },
  '待确认': { label: '待确认', color: 'bg-orange-100 text-orange-700' },
  '已完成': { label: '已完成', color: 'bg-green-100 text-green-700' },
  '已驳回': { label: '已驳回', color: 'bg-red-100 text-red-700' },
  '已下线': { label: '已下线', color: 'bg-gray-100 text-gray-500' },
};

const supervisionTypes: SupervisionType[] = ['预警工单督办', '保有任务督办', '其他督办任务'];
const statusOptions: SupervisionStatus[] = ['待执行', '待确认', '已完成', '已驳回', '已下线'];

const orgOptions = [
  '区公司', '塔城分公司', '哈密分公司', '和田分公司', '阿勒泰分公司', '克州分公司',
  '博州分公司', '克拉玛依分公司', '乌鲁木齐市分公司', '奎屯分公司', '石河子分公司',
  '昌吉分公司', '吐鲁番分公司', '巴州分公司', '阿克苏分公司', '喀什分公司', '伊犁分公司',
];

// ==================== 模拟数据 ====================

const mockData: SupervisionRecord[] = [
  { id: 'SUPV-2026-001', name: '乌鲁木齐5G流量提升督办', type: '保有任务督办', org: '乌鲁木齐市分公司', supervisor: '李主管', createTime: '2026-08-05 09:30:00', status: '待执行', handler: '乌鲁木齐运营人员', startTime: '2026-08-05', endTime: '2026-08-15', progress: '0%', content: '针对乌鲁木齐当月DOU未达标问题，督办执行流量提升方案。' },
  { id: 'SUPV-2026-002', name: '喀什全球通保有率督办', type: '保有任务督办', org: '喀什分公司', supervisor: '李主管', createTime: '2026-08-04 14:00:00', status: '待确认', handler: '喀什运营人员', startTime: '2026-08-04', endTime: '2026-08-12', progress: '80%', content: '喀什全球通保有率低于92%，督办维系策略执行效果。' },
  { id: 'SUPV-2026-003', name: '阿克苏中高端客户离网督办', type: '预警工单督办', org: '阿克苏分公司', supervisor: '王经理', createTime: '2026-08-03 10:15:00', status: '待确认', handler: '阿克苏运营人员', startTime: '2026-08-03', endTime: '2026-08-10', progress: '100%', content: '阿克苏中高端客户离网率超2%，督办维系策略执行。' },
  { id: 'SUPV-2026-004', name: '塔城宽带续费督办', type: '保有任务督办', org: '塔城分公司', supervisor: '王经理', createTime: '2026-08-02 16:30:00', status: '已完成', handler: '塔城运营人员', startTime: '2026-08-02', endTime: '2026-08-08', progress: '100%', content: '塔城宽带续费概率偏低，督办续费提醒执行情况。' },
  { id: 'SUPV-2026-005', name: '伊犁携转挽留督办', type: '预警工单督办', org: '伊犁分公司', supervisor: '孙主管', createTime: '2026-08-01 09:00:00', status: '已完成', handler: '伊犁运营人员', startTime: '2026-08-01', endTime: '2026-08-06', progress: '100%', content: '伊犁携转意愿评分较高的客户，督办挽留动作执行。' },
  { id: 'SUPV-2026-006', name: '吐鲁番区域攻坚督办', type: '其他督办任务', org: '吐鲁番分公司', supervisor: '孙主管', createTime: '2026-07-30 11:20:00', status: '已驳回', handler: '吐鲁番运营人员', startTime: '2026-07-30', endTime: '2026-08-08', progress: '60%', content: '吐鲁番高昌区流量份额下降，督办区域攻坚执行。' },
  { id: 'SUPV-2026-007', name: '昌吉异动客户营销督办', type: '预警工单督办', org: '昌吉分公司', supervisor: '陈组长', createTime: '2026-07-28 15:45:00', status: '已驳回', handler: '昌吉运营人员', startTime: '2026-07-28', endTime: '2026-08-05', progress: '50%', content: '昌吉异动客户共42名，督办精准营销执行结果。' },
  { id: 'SUPV-2026-008', name: '巴州投诉工单处理督办', type: '预警工单督办', org: '巴州分公司', supervisor: '陈组长', createTime: '2026-07-25 10:00:00', status: '已下线', handler: '巴州运营人员', startTime: '2026-07-25', endTime: '2026-08-01', progress: '30%', content: '巴州投诉工单量环比增长45%，督办处理进度。' },
  { id: 'SUPV-2026-009', name: '和田热线商机转化督办', type: '保有任务督办', org: '和田分公司', supervisor: '李主管', createTime: '2026-07-22 14:30:00', status: '待执行', handler: '和田运营人员', startTime: '2026-07-22', endTime: '2026-07-30', progress: '0%', content: '和田热线商机转化率连续3天低于15%，督办提升。' },
  { id: 'SUPV-2026-010', name: '石河子存量客户保有督办', type: '保有任务督办', org: '石河子分公司', supervisor: '王经理', createTime: '2026-07-20 09:45:00', status: '待确认', handler: '石河子运营人员', startTime: '2026-07-20', endTime: '2026-07-28', progress: '90%', content: '石河子存量客户保有任务执行情况督办。' },
  { id: 'SUPV-2026-011', name: '克拉玛依流量增收督办', type: '保有任务督办', org: '克拉玛依分公司', supervisor: '孙主管', createTime: '2026-07-18 16:00:00', status: '已完成', handler: '克拉玛依运营人员', startTime: '2026-07-18', endTime: '2026-07-25', progress: '100%', content: '克拉玛依移动数据流量收入未达标，督办提升方案。' },
  { id: 'SUPV-2026-012', name: '博州全球通离网追溯督办', type: '预警工单督办', org: '博州分公司', supervisor: '陈组长', createTime: '2026-07-15 11:30:00', status: '已下线', handler: '博州运营人员', startTime: '2026-07-15', endTime: '2026-07-22', progress: '20%', content: '博州全球通客户离网追溯任务督办。' },
];

export default function SupervisionPage() {
  return <Suspense><SupervisionContent /></Suspense>;
}

function SupervisionContent() {
  const router = useRouter();

  // 筛选状态
  const [searchName, setSearchName] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [searchHandler, setSearchHandler] = useState('');
  const [searchSupervisor, setSearchSupervisor] = useState('');

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 下线弹窗
  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false);
  const [offlineTarget, setOfflineTarget] = useState<SupervisionRecord | null>(null);

  // 删除弹窗
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupervisionRecord | null>(null);

  // 筛选数据
  const filteredData = useMemo(() => {
    return mockData.filter(t => {
      if (searchName && !t.name.includes(searchName)) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (orgFilter !== 'all' && t.org !== orgFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchHandler && !t.handler.includes(searchHandler)) return false;
      if (searchSupervisor && !t.supervisor.includes(searchSupervisor)) return false;
      if (startTime && t.createTime < startTime) return false;
      if (endTime && t.createTime > endTime + ' 23:59:59') return false;
      return true;
    });
  }, [searchName, typeFilter, orgFilter, statusFilter, startTime, endTime, searchHandler, searchSupervisor]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageData = filteredData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleReset = () => {
    setSearchName(''); setTypeFilter('all'); setOrgFilter('all'); setStatusFilter('all');
    setStartTime(''); setEndTime(''); setSearchHandler(''); setSearchSupervisor('');
    setCurrentPage(1);
  };

  const handleSearch = () => setCurrentPage(1);

  const handleView = (record: SupervisionRecord) => {
    router.push(`/workspace/dispatch/supervision/detail?id=${record.id}`);
  };

  const handleApprove = (record: SupervisionRecord) => {
    router.push(`/workspace/dispatch/supervision/approve?id=${record.id}`);
  };

  const handleOffline = (record: SupervisionRecord) => {
    setOfflineTarget(record);
    setOfflineDialogOpen(true);
  };

  const confirmOffline = () => {
    toast.success('下线成功', { description: `督办任务「${offlineTarget?.name}」已下线` });
    setOfflineDialogOpen(false);
    setOfflineTarget(null);
  };

  const handleDelete = (record: SupervisionRecord) => {
    setDeleteTarget(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast.success('删除成功', { description: `督办任务「${deleteTarget?.name}」已删除` });
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // 分页器
  const renderPagination = () => {
    const total = filteredData.length;
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
        <div className="text-sm text-muted-foreground">共 {total} 条</div>
        <div className="flex items-center gap-1">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[80px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
            ) : (
              <Button key={p} variant={p === safeCurrentPage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-sm" onClick={() => setCurrentPage(p)}>{p}</Button>
            )
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage(safeCurrentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="px-6 py-3 border-b bg-background">
        <h1 className="text-base font-semibold text-gray-900">督办管理</h1>
      </div>

      {/* 筛选查询区 */}
      <div className="px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">督办事项:</span>
            <Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-36 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">督办类型:</span>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {supervisionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">所属组织:</span>
            <Select value={orgFilter} onValueChange={(v) => { setOrgFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {orgOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">状态:</span>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">创建时间:</span>
            <Input type="date" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-36 h-8 text-sm" />
            <span className="text-muted-foreground">-</span>
            <Input type="date" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-36 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">承办人:</span>
            <Input placeholder="请输入" value={searchHandler} onChange={(e) => setSearchHandler(e.target.value)} className="w-28 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">督办人:</span>
            <Input placeholder="请输入" value={searchSupervisor} onChange={(e) => setSearchSupervisor(e.target.value)} className="w-28 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" className="h-8" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />重置
            </Button>
            <Button size="sm" className="h-8" onClick={handleSearch}>
              <Search className="w-3.5 h-3.5 mr-1" />查询
            </Button>
          </div>
        </div>
      </div>

      {/* 表格区 */}
      <div className="flex-1 overflow-auto px-6 py-3">
        <Card className="overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-14 text-center">序号</TableHead>
                <TableHead className="w-56">督办事项</TableHead>
                <TableHead className="w-28">督办类型</TableHead>
                <TableHead className="w-32">承办部门</TableHead>
                <TableHead className="w-24">督办人</TableHead>
                <TableHead className="w-36">创建时间</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-32 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">暂无数据</TableCell>
                </TableRow>
              ) : (
                pageData.map((record, idx) => (
                  <TableRow key={record.id} className="hover:bg-muted/30">
                    <TableCell className="text-center text-sm text-muted-foreground">{(safeCurrentPage - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="text-sm font-medium truncate" title={record.name}>{record.name}</TableCell>
                    <TableCell className="text-sm">{record.type}</TableCell>
                    <TableCell className="text-sm">{record.org}</TableCell>
                    <TableCell className="text-sm">{record.supervisor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.createTime}</TableCell>
                    <TableCell>
                      <span className={cn('text-xs px-2 py-0.5 rounded', statusConfig[record.status].color)}>
                        {statusConfig[record.status].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-primary text-sm hover:underline" onClick={() => handleView(record)}>查看</button>
                        {record.status === '待确认' && (
                          <button className="text-primary text-sm hover:underline" onClick={() => handleApprove(record)}>审批</button>
                        )}
                        {(record.status === '待执行' || record.status === '已驳回') && (
                          <button className="text-red-500 text-sm hover:underline" onClick={() => handleOffline(record)}>下线</button>
                        )}
                        {record.status === '已下线' && (
                          <button className="text-red-500 text-sm hover:underline" onClick={() => handleDelete(record)}>删除</button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {renderPagination()}
        </Card>
      </div>

      {/* 督办下线弹窗 */}
      <Dialog open={offlineDialogOpen} onOpenChange={setOfflineDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>督办下线</DialogTitle>
            <DialogDescription>
              督办任务下线后将不再执行，是否继续下线该督办任务？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOfflineDialogOpen(false)}>取消</Button>
            <Button onClick={confirmOffline}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 督办删除弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>删除督办</DialogTitle>
            <DialogDescription>
              确认删除该督办任务吗？删除后将无法恢复，是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
