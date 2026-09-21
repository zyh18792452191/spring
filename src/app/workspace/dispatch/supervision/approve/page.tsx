'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip } from 'lucide-react';

// ==================== 类型定义 ====================

interface Supervisor {
  org: string;
  name: string;
}

interface FlowNode {
  node: string;
  result: string;
  processTime: string;
}

interface ReceiptInfo {
  isCompleted: string;
  remark: string;
  relatedTask: string;
}

interface ApproveDetail {
  id: string;
  // 回执信息（只读）
  receipt: ReceiptInfo;
  // 基本信息
  name: string;
  type: string;
  relatedTask: string;
  // 督办信息
  supervisors: Supervisor[];
  content: string;
  // 流程跟踪
  flowNodes: FlowNode[];
}

// ==================== 模拟数据（仅待确认状态） ====================

const approveMap: Record<string, ApproveDetail> = {
  'SUPV-2026-002': {
    id: 'SUPV-2026-002',
    receipt: {
      isCompleted: '是',
      remark: '已执行全球通客户维系策略，触达客户156户，预计保有率提升至93.5%。',
      relatedTask: '保有任务-喀什全球通保有率提升',
    },
    name: '喀什全球通保有率督办',
    type: '保有任务督办',
    relatedTask: '保有任务-喀什全球通保有率提升',
    supervisors: [{ org: '喀什分公司', name: '李主管' }],
    content: '喀什全球通保有率低于92%，督办维系策略执行效果。要求执行专属权益推送和客户经理跟进。',
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-04 15:00:00' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-06 10:30:00' },
    ],
  },
  'SUPV-2026-003': {
    id: 'SUPV-2026-003',
    receipt: {
      isCompleted: '是',
      remark: '已对离网风险客户执行专属维系方案，触达89户，挽留成功23户。',
      relatedTask: '预警工单-阿克苏中高端客户离网',
    },
    name: '阿克苏中高端客户离网督办',
    type: '预警工单督办',
    relatedTask: '预警工单-阿克苏中高端客户离网',
    supervisors: [{ org: '阿克苏分公司', name: '王经理' }],
    content: '阿克苏中高端客户离网率超2%，督办维系策略执行。要求对离网风险客户执行专属维系方案。',
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-08-03 11:00:00' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-08-05 16:00:00' },
    ],
  },
  'SUPV-2026-010': {
    id: 'SUPV-2026-010',
    receipt: {
      isCompleted: '是',
      remark: '已完成存量客户保有任务，触达客户320户，保有率达95.2%。',
      relatedTask: '保有任务-石河子存量客户保有',
    },
    name: '石河子存量客户保有督办',
    type: '保有任务督办',
    relatedTask: '保有任务-石河子存量客户保有',
    supervisors: [{ org: '石河子分公司', name: '王经理' }],
    content: '石河子存量客户保有任务执行情况督办。要求完成存量客户套餐续约提醒。',
    flowNodes: [
      { node: '是否已读', result: '是', processTime: '2026-07-20 10:30:00' },
      { node: '是否回执处理结果', result: '是', processTime: '2026-07-25 11:00:00' },
    ],
  },
};

export default function ApprovePage() {
  return <Suspense><ApproveContent /></Suspense>;
}

function ApproveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || 'SUPV-2026-002';
  const detail = approveMap[taskId] || approveMap['SUPV-2026-002'];
  const fromPath = searchParams.get('fromPath');

  const [confirmComplete, setConfirmComplete] = useState<'是' | '否' | ''>('');
  const [reason, setReason] = useState('');

  const handleBack = () => {
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/supervision');
    }
  };

  const handleConfirm = () => {
    if (!confirmComplete) { toast.error('请选择是否确认完成'); return; }
    const action = confirmComplete === '是' ? '审批通过' : '已驳回';
    toast.success(action, { description: `督办任务「${detail.name}」${action}` });
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/supervision');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部面包屑 */}
      <div className="px-6 py-3 border-b bg-background flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回上一页
        </Button>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm font-medium">流程跟踪</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：督办任务回执审批 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务回执审批</h2>
          {/* 审批表单 */}
          <div className="space-y-4">
            {/* 是否确认完成 */}
            <div className="flex items-start gap-3">
              <span className="text-sm w-44 shrink-0 pt-1.5">
                <span className="text-red-500 mr-0.5">*</span>是否确认完成：
              </span>
              <div className="flex items-center gap-6 pt-1.5">
                {(['是', '否'] as const).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="confirmComplete"
                      checked={confirmComplete === v}
                      onChange={() => setConfirmComplete(v)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* 请输入原因 */}
            <div className="flex items-start gap-3 w-1/2">
              <span className="text-sm w-44 shrink-0 pt-1.5">请输入原因：</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入原因"
                className="flex-1 min-h-[100px] px-3 py-2 border rounded-md text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* 回执信息 */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4 ml-8">回执信息</p>
            <div className="space-y-4">
              {/* 是否已完成（只读） */}
              <div className="flex items-start gap-3">
                <span className="text-sm w-44 shrink-0 pt-1.5">
                  <span className="text-red-500 mr-0.5">*</span>是否已完成：
                </span>
                <div className="flex items-center gap-6 pt-1.5">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={detail.receipt.isCompleted === '是'}
                      disabled
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm">是</span>
                  </label>
                  {detail.receipt.isCompleted !== '否' ? null : (
                    <label className="flex items-center gap-2">
                      <input type="radio" checked disabled className="h-4 w-4 accent-primary" />
                      <span className="text-sm">否</span>
                    </label>
                  )}
                </div>
              </div>
              {/* 备注（只读） */}
              <div className="flex items-start gap-3">
                <span className="text-sm w-44 shrink-0 pt-1.5">备注：</span>
                <p className="text-sm pt-1.5">{detail.receipt.remark || '—'}</p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={handleBack}>取消</Button>
            <Button onClick={handleConfirm}>确认</Button>
          </div>
        </Card>

        {/* 区块2：基本信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">督办名称</p>
              <p className="text-sm font-medium">{detail.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">督办类型</p>
              <p className="text-sm font-medium">{detail.type}</p>
            </div>
          </div>
        </Card>

        {/* 区块3：督办信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办信息</h2>
          <div className="space-y-4">
            {/* 督办人员 */}
            <div>
              <p className="text-sm text-muted-foreground mb-2 w-44">督办人员：</p>
              <div className="w-2/5">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-center">组织</TableHead>
                      <TableHead className="text-center">督办人</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.supervisors.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm text-center">{s.org}</TableCell>
                        <TableCell className="text-sm text-center">{s.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* 督办内容 */}
            <div className="flex items-start gap-3">
              <span className="text-sm w-44 shrink-0 pt-1.5">督办内容：</span>
              <div className="flex-1 text-sm bg-muted/30 rounded-md p-3 min-h-[40px]">{detail.content || '—'}</div>
            </div>
            {/* 附件 */}
            <div className="flex items-start gap-3">
              <span className="text-sm w-44 shrink-0 pt-1.5">附件：</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1.5">
                <Paperclip className="w-4 h-4" />
                <span>暂无附件</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 区块4：督办任务流程跟踪 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务流程跟踪</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">节点</TableHead>
                <TableHead className="text-center">结果值</TableHead>
                <TableHead className="text-center">处理时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.flowNodes.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">暂无数据</TableCell></TableRow>
              ) : (
                detail.flowNodes.map((n, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-center">{n.node}</TableCell>
                    <TableCell className="text-sm text-center">{n.result}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{n.processTime || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
