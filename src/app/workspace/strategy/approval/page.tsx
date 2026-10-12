'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Eye, ShieldCheck, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalRecord {
  id: string;
  activityId: string;
  activityName: string;
  scenario: string;
  submitter: string;
  submitTime: string;
  priority: '高' | '中' | '低';
  status: '待审批' | '已通过' | '已驳回';
  approver?: string;
  approveTime?: string;
  comment?: string;
}

const RECORDS: ApprovalRecord[] = [
  { id: 'APR-001', activityId: 'ACT-2026-0828-001', activityName: '乌鲁木齐 5G 套餐渗透率升档攻坚活动', scenario: '流量运营', submitter: '张耀辉', submitTime: '2026-08-28 11:30', priority: '高', status: '待审批' },
  { id: 'APR-002', activityId: 'ACT-2026-0827-002', activityName: '克拉玛依宽带续费保有专项活动', scenario: '家庭融合运营', submitter: '王芳', submitTime: '2026-08-27 11:20', priority: '中', status: '待审批' },
  { id: 'APR-003', activityId: 'ACT-2026-0826-003', activityName: '高价值客户离网挽留权益活动', scenario: '离网维系', submitter: '赵敏', submitTime: '2026-08-26 18:40', priority: '高', status: '已通过', approver: '李经理', approveTime: '2026-08-26 19:00', comment: '同意，优先保障高价值客户' },
  { id: 'APR-004', activityId: 'ACT-2026-0820-004', activityName: '家庭宽带融合升档专项活动', scenario: '家庭融合运营', submitter: '陈晨', submitTime: '2026-08-20 10:00', priority: '中', status: '已通过', approver: '李经理', approveTime: '2026-08-20 10:30' },
  { id: 'APR-005', activityId: 'ACT-2026-0819-006', activityName: '国际漫游流量包推广活动', scenario: '国际业务运营', submitter: '张耀辉', submitTime: '2026-08-19 16:00', priority: '低', status: '已驳回', approver: '李经理', approveTime: '2026-08-19 17:00', comment: '客群规模偏小，建议合并到下一期活动' },
];

const STATUS_STYLE: Record<ApprovalRecord['status'], string> = {
  待审批: 'bg-amber-100 text-amber-700',
  已通过: 'bg-emerald-100 text-emerald-700',
  已驳回: 'bg-destructive/10 text-destructive',
};

function ApprovalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('activity') || '';
  const [records, setRecords] = useState<ApprovalRecord[]>(RECORDS);
  const [rejectTarget, setRejectTarget] = useState<ApprovalRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pending = records.filter((r) => r.status === '待审批');
  const mine = records.filter((r) => r.submitter === '张耀辉');
  const done = records.filter((r) => r.status !== '待审批');

  const handleApprove = (item: ApprovalRecord) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? { ...r, status: '已通过', approver: '李经理', approveTime: new Date().toLocaleString('zh-CN', { hour12: false }) }
          : r,
      ),
    );
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === rejectTarget.id
          ? { ...r, status: '已驳回', approver: '李经理', approveTime: new Date().toLocaleString('zh-CN', { hour12: false }), comment: rejectReason }
          : r,
      ),
    );
    setRejectTarget(null);
    setRejectReason('');
  };

  const renderTable = (list: ApprovalRecord[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">活动 ID</TableHead>
          <TableHead className="min-w-[220px]">活动名称</TableHead>
          <TableHead className="min-w-[120px]">业务场景</TableHead>
          <TableHead className="min-w-[90px]">提交人</TableHead>
          <TableHead className="min-w-[150px]">提交时间</TableHead>
          <TableHead className="min-w-[70px]">优先级</TableHead>
          <TableHead className="min-w-[90px]">状态</TableHead>
          <TableHead className="min-w-[200px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">暂无记录</TableCell>
          </TableRow>
        ) : (
          list.map((item) => (
            <TableRow key={item.id} className={item.activityId === highlightId ? 'bg-primary/5' : ''}>
              <TableCell className="text-sm font-medium text-foreground">{item.activityId}</TableCell>
              <TableCell className="text-sm text-foreground">{item.activityName}</TableCell>
              <TableCell><Badge variant="secondary">{item.scenario}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.submitter}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.submitTime}</TableCell>
              <TableCell className="text-sm text-foreground">{item.priority}</TableCell>
              <TableCell><Badge className={STATUS_STYLE[item.status]}>{item.status}</Badge></TableCell>
              <TableCell>
                {item.status === '待审批' ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleApprove(item)}>
                      <Check className="mr-1 h-3.5 w-3.5" /> 通过
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectTarget(item); setRejectReason(''); }}>
                      <X className="mr-1 h-3.5 w-3.5" /> 驳回
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/workspace/strategy/activity-track?activity=${item.activityId}`)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> 查看
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">策略审批</h1>
        <p className="mt-1 text-sm text-muted-foreground">集中处理活动实例审批事务，审批记录可审计。</p>
      </div>

      <Tabs defaultValue="待我审批">
        <TabsList>
          <TabsTrigger value="待我审批">待我审批（{pending.length}）</TabsTrigger>
          <TabsTrigger value="我发起的">我发起的（{mine.length}）</TabsTrigger>
          <TabsTrigger value="已审批">已审批（{done.length}）</TabsTrigger>
        </TabsList>
        <TabsContent value="待我审批" className="mt-4 rounded-lg border border-border bg-card">
          {renderTable(pending)}
        </TabsContent>
        <TabsContent value="我发起的" className="mt-4 rounded-lg border border-border bg-card">
          {renderTable(mine)}
        </TabsContent>
        <TabsContent value="已审批" className="mt-4 rounded-lg border border-border bg-card">
          {renderTable(done)}
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        审批记录要求：通过/驳回均记录审批人、审批时间、审批意见，形成可审计轨迹。
      </div>

      {/* 驳回弹窗 */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>驳回活动</DialogTitle>
            <DialogDescription>
              {rejectTarget?.activityName}（{rejectTarget?.activityId}）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>驳回意见</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="请输入驳回意见" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>取消</Button>
            <Button onClick={confirmReject}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <ApprovalInner />
    </Suspense>
  );
}
