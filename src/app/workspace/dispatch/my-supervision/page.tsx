'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== 类型定义 ====================

type SupervisionStatus = '待执行' | '待评分' | '已完成' | '已驳回' | '已下线';

interface SupervisionTask {
  id: string;
  name: string;
  type: string;
  supervisor: string;
  issueTime: string;
  status: SupervisionStatus;
  initiator: string;
  level: string;
  content: string;
  relatedTask: string;
  hasOrder: boolean;
}

// ==================== 状态配置 ====================

const statusConfig: Record<SupervisionStatus, { label: string; color: string }> = {
  '待执行': { label: '待执行', color: 'bg-blue-100 text-blue-700' },
  '待评分': { label: '待评分', color: 'bg-orange-100 text-orange-700' },
  '已完成': { label: '已完成', color: 'bg-green-100 text-green-700' },
  '已驳回': { label: '已驳回', color: 'bg-red-100 text-red-700' },
  '已下线': { label: '已下线', color: 'bg-gray-100 text-gray-500' },
};

const supervisionTypes = ['指标督办', '策略督办', '客群督办', '商机督办', '区域攻坚督办', '预警督办'];
const statusOptions: SupervisionStatus[] = ['待执行', '待评分', '已完成', '已驳回', '已下线'];

// ==================== 模拟数据 ====================

const mockTasks: SupervisionTask[] = [
  { id: 'SUP-2026-0801', name: '乌鲁木齐5G流量提升督办', type: '指标督办', supervisor: '李主管', issueTime: '2026-08-05 09:30:00', status: '待执行', initiator: '新疆运营人员', level: '重要', content: '针对乌鲁木齐当月DOU未达标问题，请跟进执行情况并反馈回执。', relatedTask: 'IND-2026-0801', hasOrder: true },
  { id: 'SUP-2026-0802', name: '喀什全球通保有率督办', type: '指标督办', supervisor: '李主管', issueTime: '2026-08-04 14:00:00', status: '待评分', initiator: '新疆市场部领导', level: '紧急', content: '喀什全球通保有率低于92%，请跟进维系策略执行效果。', relatedTask: 'IND-2026-0802', hasOrder: true },
  { id: 'SUP-2026-0803', name: '阿克苏中高端客户离网督办', type: '策略督办', supervisor: '王经理', issueTime: '2026-08-03 10:15:00', status: '待评分', initiator: '新疆运营人员', level: '重要', content: '阿克苏中高端客户离网率超2%，请执行维系策略并反馈。', relatedTask: 'STR-2026-0803', hasOrder: true },
  { id: 'SUP-2026-0804', name: '塔城宽带续费督办', type: '客群督办', supervisor: '王经理', issueTime: '2026-08-02 16:30:00', status: '已完成', initiator: '新疆市场部领导', level: '普通', content: '塔城宽带续费概率偏低，请跟进续费提醒执行情况。', relatedTask: 'CG-2026-0804', hasOrder: false },
  { id: 'SUP-2026-0805', name: '伊犁携转挽留督办', type: '商机督办', supervisor: '孙主管', issueTime: '2026-08-01 09:00:00', status: '已完成', initiator: '新疆运营人员', level: '重要', content: '伊犁携转意愿评分较高的客户，请执行挽留动作。', relatedTask: 'COD-2026-0805', hasOrder: true },
  { id: 'SUP-2026-0806', name: '吐鲁番区域攻坚督办', type: '区域攻坚督办', supervisor: '孙主管', issueTime: '2026-07-30 11:20:00', status: '已驳回', initiator: '新疆市场部领导', level: '紧急', content: '吐鲁番高昌区流量份额下降，请执行区域攻坚并反馈。', relatedTask: 'RAS-2026-0806', hasOrder: true },
  { id: 'SUP-2026-0807', name: '昌吉异动客户营销督办', type: '预警督办', supervisor: '陈组长', issueTime: '2026-07-28 15:45:00', status: '已驳回', initiator: '新疆运营人员', level: '普通', content: '昌吉异动客户共42名，请触发精准营销并反馈结果。', relatedTask: 'ALR-2026-0807', hasOrder: true },
  { id: 'SUP-2026-0808', name: '巴州投诉工单处理督办', type: '预警督办', supervisor: '陈组长', issueTime: '2026-07-25 10:00:00', status: '已下线', initiator: '新疆市场部领导', level: '重要', content: '巴州投诉工单量环比增长45%，请跟进处理进度。', relatedTask: 'ALR-2026-0808', hasOrder: false },
  { id: 'SUP-2026-0809', name: '和田热线商机转化督办', type: '商机督办', supervisor: '李主管', issueTime: '2026-07-22 14:30:00', status: '待执行', initiator: '新疆运营人员', level: '普通', content: '和田热线商机转化率连续3天低于15%，请跟进提升。', relatedTask: 'COD-2026-0809', hasOrder: false },
  { id: 'SUP-2026-0810', name: '石河子存量客户保有督办', type: '策略督办', supervisor: '王经理', issueTime: '2026-07-20 09:45:00', status: '待评分', initiator: '新疆市场部领导', level: '重要', content: '石河子存量客户保有任务执行情况，请反馈回执。', relatedTask: 'STR-2026-0810', hasOrder: true },
  { id: 'SUP-2026-0811', name: '克拉玛依流量增收督办', type: '指标督办', supervisor: '孙主管', issueTime: '2026-07-18 16:00:00', status: '已完成', initiator: '新疆运营人员', level: '紧急', content: '克拉玛依移动数据流量收入未达标，请执行提升方案。', relatedTask: 'IND-2026-0811', hasOrder: true },
  { id: 'SUP-2026-0812', name: '博州全球通离网追溯督办', type: '预警督办', supervisor: '陈组长', issueTime: '2026-07-15 11:30:00', status: '已下线', initiator: '新疆市场部领导', level: '普通', content: '博州全球通客户离网追溯任务，请跟进执行。', relatedTask: 'ALR-2026-0812', hasOrder: false },
];

export default function MySupervisionPage() {
  return <Suspense><MySupervisionContent /></Suspense>;
}

function MySupervisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 筛选状态
  const [searchName, setSearchName] = useState('');
  const [searchInitiator, setSearchInitiator] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选数据
  const filteredData = useMemo(() => {
    return mockTasks.filter(t => {
      if (searchName && !t.name.includes(searchName)) return false;
      if (searchInitiator && !t.initiator.includes(searchInitiator)) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (startTime && t.issueTime < startTime) return false;
      if (endTime && t.issueTime > endTime + ' 23:59:59') return false;
      return true;
    });
  }, [searchName, searchInitiator, typeFilter, statusFilter, startTime, endTime]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageData = filteredData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleReset = () => {
    setSearchName('');
    setSearchInitiator('');
    setTypeFilter('all');
    setStatusFilter('all');
    setStartTime('');
    setEndTime('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  // 查看按钮：待执行跳转提交页，其余跳转详情页
  const handleView = (task: SupervisionTask) => {
    if (task.status === '待执行') {
      router.push(`/workspace/dispatch/my-supervision/submit?id=${task.id}`);
    } else {
      router.push(`/workspace/dispatch/my-supervision/detail?id=${task.id}`);
    }
  };

  // 提交按钮：已驳回跳转提交页
  const handleSubmit = (task: SupervisionTask) => {
    router.push(`/workspace/dispatch/my-supervision/submit?id=${task.id}&from=rejected`);
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
          <div className="flex items-center gap-1 ml-2 text-sm text-muted-foreground">
            前往
            <Input className="w-12 h-8 text-center text-sm" value={safeCurrentPage} onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= totalPages) setCurrentPage(v); }} />
            页
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 页面标题 */}
      <div className="px-6 py-3 border-b bg-background">
        <h1 className="text-base font-semibold text-gray-900">我的督办任务</h1>
      </div>

      {/* 筛选查询区 */}
      <div className="px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">督办名称:</span>
            <Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-40 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">下发时间:</span>
            <Input type="date" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-36 h-8 text-sm" />
            <span className="text-muted-foreground">-</span>
            <Input type="date" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-36 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">发起人:</span>
            <Input placeholder="请输入" value={searchInitiator} onChange={(e) => setSearchInitiator(e.target.value)} className="w-32 h-8 text-sm" />
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
            <span className="text-sm text-foreground whitespace-nowrap">状态:</span>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
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
                <TableHead className="w-64">督办名称</TableHead>
                <TableHead className="w-28">督办类型</TableHead>
                <TableHead className="w-24">督办人</TableHead>
                <TableHead className="w-36">下发时间</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-28">发起人</TableHead>
                <TableHead className="w-28 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">暂无数据</TableCell>
                </TableRow>
              ) : (
                pageData.map((task, idx) => (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    <TableCell className="text-center text-sm text-muted-foreground">{(safeCurrentPage - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{task.name}</TableCell>
                    <TableCell className="text-sm">{task.type}</TableCell>
                    <TableCell className="text-sm">{task.supervisor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.issueTime}</TableCell>
                    <TableCell>
                      <span className={cn('text-xs px-2 py-0.5 rounded', statusConfig[task.status].color)}>
                        {statusConfig[task.status].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{task.initiator}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-primary text-sm hover:underline" onClick={() => handleView(task)}>查看</button>
                        {task.status === '已驳回' && (
                          <button className="text-primary text-sm hover:underline" onClick={() => handleSubmit(task)}>提交</button>
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
    </div>
  );
}
