'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip } from 'lucide-react';

// ==================== 任务详情数据 ====================

interface TaskDetail {
  id: string;
  name: string;
  issueTime: string;
  relatedTask: string;
  status: string;
  type: string;
  level: string;
  initiator: string;
  content: string;
  rejectReason?: string;
}

const taskDetailMap: Record<string, TaskDetail> = {
  'SUP-2026-0801': { id: 'SUP-2026-0801', name: '乌鲁木齐5G流量提升督办', issueTime: '2026-08-05 09:30:00', relatedTask: 'IND-2026-0801', status: '待执行', type: '指标督办', level: '重要', initiator: '新疆运营人员', content: '针对乌鲁木齐当月DOU未达标问题，请跟进执行情况并反馈回执。' },
  'SUP-2026-0809': { id: 'SUP-2026-0809', name: '和田热线商机转化督办', issueTime: '2026-07-22 14:30:00', relatedTask: 'COD-2026-0809', status: '待执行', type: '商机督办', level: '普通', initiator: '新疆运营人员', content: '和田热线商机转化率连续3天低于15%，请跟进提升。' },
  'SUP-2026-0806': { id: 'SUP-2026-0806', name: '吐鲁番区域攻坚督办', issueTime: '2026-07-30 11:20:00', relatedTask: 'RAS-2026-0806', status: '已驳回', type: '区域攻坚督办', level: '紧急', initiator: '新疆市场部领导', content: '吐鲁番高昌区流量份额下降，请执行区域攻坚并反馈。', rejectReason: '反馈内容不完整，缺少具体执行数据与客户触达明细，请补充后重新提交。' },
  'SUP-2026-0807': { id: 'SUP-2026-0807', name: '昌吉异动客户营销督办', issueTime: '2026-07-28 15:45:00', relatedTask: 'ALR-2026-0807', status: '已驳回', type: '预警督办', level: '普通', initiator: '新疆运营人员', content: '昌吉异动客户共42名，请触发精准营销并反馈结果。', rejectReason: '未提供营销方案的执行效果数据，请补充转化率与客户反馈信息。' },
};

// ==================== 基本信息字段配置 ====================

const baseInfoFields = [
  { label: '督办名称', key: 'name' },
  { label: '下发时间', key: 'issueTime' },
  { label: '督办任务状态', key: 'status' },
  { label: '督办类型', key: 'type' },
  { label: '发起人', key: 'initiator' },
];

export default function SubmitSupervisionPage() {
  return <Suspense><SubmitSupervisionContent /></Suspense>;
}

function SubmitSupervisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || 'SUP-2026-0801';
  const fromRejected = searchParams.get('from') === 'rejected';
  const fromPath = searchParams.get('fromPath');

  const task = taskDetailMap[taskId] || taskDetailMap['SUP-2026-0801'];

  // 回执表单状态
  const [completed, setCompleted] = useState<'是' | '否' | ''>('');
  const [feedback, setFeedback] = useState('');

  const handleBack = () => {
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/my-supervision');
    }
  };

  const handleSubmit = () => {
    if (!completed) { toast.error('请选择是否已完成'); return; }
    if (!feedback.trim()) { toast.error('请填写反馈内容'); return; }
    toast.success('提交成功', { description: '督办任务回执已提交' });
    if (fromPath) {
      router.push(decodeURIComponent(fromPath));
    } else {
      router.push('/workspace/dispatch/my-supervision');
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
        <span className="text-sm font-medium">提交督办任务</span>
      </div>

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* 区块1：督办任务结果回执 */}
        <Card className="p-5">
          <h2 className="text-base font-semibold mb-4">督办任务结果回执</h2>
          <div className="space-y-4">
            {/* 是否已完成 */}
            <div className="flex items-start gap-3">
              <span className="text-sm text-muted-foreground w-28 shrink-0 pt-1.5"><span className="text-red-500 mr-0.5">*</span>是否已完成</span>
              <div className="flex items-center gap-6 pt-1.5">
                {(['是', '否'] as const).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="completed" checked={completed === v} onChange={() => setCompleted(v)} className="h-4 w-4 accent-primary" />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* 反馈内容 */}
            <div className="flex items-start gap-3">
              <span className="text-sm text-muted-foreground w-28 shrink-0 pt-1.5"><span className="text-red-500 mr-0.5">*</span>反馈内容</span>
              <div className="flex-1">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value.slice(0, 300))}
                  placeholder="请输入反馈内容"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="text-right text-xs text-muted-foreground mt-1">{feedback.length}/300</div>
              </div>
            </div>
            {/* 底部按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleBack}>取消</Button>
              <Button onClick={handleSubmit}>提交督办回执</Button>
            </div>
          </div>
        </Card>

        {/* 已驳回场景：展示驳回原因 */}
        {fromRejected && task.rejectReason && (
          <Card className="p-5 border-red-200 bg-red-50/30">
            <h2 className="text-base font-semibold mb-3 text-red-700">驳回原因</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{task.rejectReason}</p>
          </Card>
        )}

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
    </div>
  );
}
