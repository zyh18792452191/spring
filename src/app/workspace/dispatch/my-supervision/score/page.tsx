'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

// ==================== 类型定义 ====================

interface ScoreTask {
  id: string;
  name: string;
  issueTime: string;
  relatedTask: string;
  status: string;
  type: string;
  level: string;
  initiator: string;
  content: string;
  receiptTime: string;
  isCompleted: string;
  remark: string;
}

// 评分等级
const SCORE_OPTIONS = ['非常满意', '满意', '一般', '不满意', '非常不满意'];

// ==================== 模拟数据 ====================

const scoreTaskMap: Record<string, ScoreTask> = {
  'SUP-2026-0901': {
    id: 'SUP-2026-0901', name: '乌鲁木齐5G流量提升督办', issueTime: '2026-08-05 09:30:00', relatedTask: 'IND-2026-0901',
    status: '待评分', type: '指标督办', level: '重要', initiator: '李主管',
    content: '乌鲁木齐当月DOU未达标，请跟进执行情况并反馈回执。',
    receiptTime: '2026-08-10 11:00:00', isCompleted: '是', remark: '已执行流量提升策略，触达客户210户，DOU环比提升8.5%。',
  },
  'SUP-2026-0902': {
    id: 'SUP-2026-0902', name: '喀什全球通保有率督办', issueTime: '2026-08-04 14:00:00', relatedTask: 'IND-2026-0902',
    status: '待评分', type: '指标督办', level: '紧急', initiator: '李主管',
    content: '喀什全球通保有率低于92%，请跟进维系策略执行效果。',
    receiptTime: '2026-08-04 14:00:00', isCompleted: '是', remark: '已执行全球通客户维系策略，触达客户156户，预计保有率提升至93.5%。',
  },
  'SUP-2026-0903': {
    id: 'SUP-2026-0903', name: '石河子存量客户保有督办', issueTime: '2026-07-20 09:45:00', relatedTask: 'STR-2026-0903',
    status: '待评分', type: '策略督办', level: '重要', initiator: '王经理',
    content: '石河子存量客户保有任务执行情况，请反馈回执。',
    receiptTime: '2026-07-25 11:00:00', isCompleted: '是', remark: '已完成存量客户保有任务，触达客户320户，保有率达95.2%。',
  },
  'SUP-2026-0904': {
    id: 'SUP-2026-0904', name: '昌吉异动客户营销督办', issueTime: '2026-07-28 15:45:00', relatedTask: 'ALR-2026-0904',
    status: '待评分', type: '预警督办', level: '普通', initiator: '陈组长',
    content: '昌吉异动客户共42名，请触发精准营销并反馈结果。',
    receiptTime: '2026-07-30 15:00:00', isCompleted: '是', remark: '已触发精准营销，触达42户，转化12户。',
  },
};

// ==================== 基本信息字段配置 ====================

const baseInfoFields = [
  { label: '督办名称', key: 'name' },
  { label: '下发时间', key: 'issueTime' },
  { label: '督办任务状态', key: 'status' },
  { label: '督办类型', key: 'type' },
  { label: '发起人', key: 'initiator' },
];

export default function ScoreSupervisionPage() {
  return <Suspense><ScoreSupervisionContent /></Suspense>;
}

function ScoreSupervisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || 'SUP-2026-0901';
  const fromPath = searchParams.get('fromPath');

  const task = scoreTaskMap[taskId] || scoreTaskMap['SUP-2026-0901'];

  const [score, setScore] = useState('');
  const [remark, setRemark] = useState('');

  const handleBack = () => {
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/my-supervision');
    }
  };

  const handleSubmit = () => {
    if (!score) {
      toast.error('请选择评分');
      return;
    }
    toast.success(`「${task.name}」评分提交成功`);
    handleBack();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* 顶部面包屑 */}
      <div className="px-6 py-3 border-b bg-background flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回上一页
        </Button>
        <span className="text-muted-foreground">|</span>
        <span className="text-sm font-medium">督办评分</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：督办任务处理结果（含评分） */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务处理结果</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">回执时间</p>
              <p className="text-sm font-medium">{task.receiptTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">是否已完成</p>
              <p className="text-sm font-medium">{task.isCompleted}</p>
            </div>
            <div className="col-span-1">
              <p className="text-sm text-muted-foreground mb-1">回执备注</p>
              <p className="text-sm font-medium">{task.remark}</p>
            </div>
          </div>

          {/* 评分（替代关联工单） */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">评分</p>
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  <span className="text-red-500 mr-0.5">*</span>评分等级
                </Label>
                <Select value={score} onValueChange={setScore}>
                  <SelectTrigger className="w-64 h-9 text-sm">
                    <SelectValue placeholder="请选择评分" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {SCORE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">评分备注</Label>
                <Textarea
                  placeholder="请输入评分备注（限200字）"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="max-w-2xl"
                />
                <div className="text-xs text-right text-muted-foreground max-w-2xl">{remark.length}/200</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 区块2：基本信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {baseInfoFields.map(f => (
              <div key={f.key}>
                <p className="text-sm text-muted-foreground mb-1">{f.label}</p>
                <p className="text-sm font-medium">{(task as any)[f.key] || '—'}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 区块3：督办信息 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办信息</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">督办内容</p>
              <div className="text-sm bg-muted/30 rounded-md p-3 min-h-[60px]">{task.content}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">附件</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <span>暂无附件</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 py-3 border-t bg-background flex justify-center gap-3">
        <Button onClick={handleSubmit}>提交评分</Button>
        <Button variant="outline" onClick={handleBack}>返回</Button>
      </div>
    </div>
  );
}
