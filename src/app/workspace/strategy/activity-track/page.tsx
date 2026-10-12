'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ActivityInstance,
  ACTIVITY_INSTANCES,
  ACTIVITY_STATUS_STYLE,
  TimelineNode,
  TimelineNodeStatus,
} from '@/lib/strategy-activity';

const CENTER_ORDER = ['洞察中心', '策略中心', '调度中心', '评估中心'] as const;

const NODE_STATUS_STYLE: Record<TimelineNodeStatus, { icon: typeof CheckCircle2; cls: string }> = {
  完成: { icon: CheckCircle2, cls: 'text-emerald-600' },
  进行中: { icon: Clock, cls: 'text-blue-600' },
  阻塞: { icon: AlertTriangle, cls: 'text-destructive' },
  未开始: { icon: Clock, cls: 'text-muted-foreground' },
};

function ActivityTrackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('activity') || ACTIVITY_INSTANCES[0].id;

  const [activityId, setActivityId] = useState(initialId);
  const [keyword, setKeyword] = useState('');

  const activity = useMemo(
    () => ACTIVITY_INSTANCES.find((a) => a.id === activityId) ?? ACTIVITY_INSTANCES[0],
    [activityId],
  );

  const filteredTimeline = activity.timeline.filter(
    (n) => !keyword.trim() || n.nodeName.includes(keyword.trim()) || n.output.includes(keyword.trim()),
  );

  const renderNode = (node: TimelineNode) => {
    const meta = NODE_STATUS_STYLE[node.status];
    const Icon = meta.icon;
    return (
      <div key={node.nodeName} className="flex gap-3 border-l-2 border-border pl-4 pb-4 last:pb-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${meta.cls}`} />
            <span className="text-sm font-medium text-foreground">{node.nodeName}</span>
            <Badge variant={node.status === '完成' ? 'default' : node.status === '进行中' ? 'secondary' : 'outline'}>
              {node.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{node.output}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{node.time}</span>
            <span>责任人：{node.owner}</span>
            {node.link && (
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => router.push(node.link!)}>
                查看详情
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">活动全链路追踪</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          以全局活动 ID 为主线，跨洞察 / 策略 / 调度 / 评估四中心追踪活动全貌与节点状态。
        </p>
      </div>

      {/* 顶部筛选 */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Select value={activityId} onValueChange={setActivityId}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="选择活动实例" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_INSTANCES.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.id} · {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="搜索节点名 / 产出物" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* 左侧时间轴 */}
        <div className="lg:col-span-3 space-y-4">
          {CENTER_ORDER.map((center) => {
            const nodes = filteredTimeline.filter((n) => n.center === center);
            if (nodes.length === 0) return null;
            return (
              <Card key={center}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{center}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">{nodes.map(renderNode)}</CardContent>
              </Card>
            );
          })}
          {/* 沉淀阶段（策略中心） */}
          {filteredTimeline.filter((n) => n.nodeName === 'AI 复盘').length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">策略中心 · 沉淀</CardTitle>
              </CardHeader>
              <CardContent>{filteredTimeline.filter((n) => n.nodeName === 'AI 复盘').map(renderNode)}</CardContent>
            </Card>
          )}
        </div>

        {/* 右侧活动关键信息 */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">活动实例信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">活动 ID</div>
              <div className="font-medium text-foreground">{activity.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">活动名称</div>
              <div className="text-foreground">{activity.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">当前状态</div>
              <Badge className={ACTIVITY_STATUS_STYLE[activity.status]}>{activity.status}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">业务场景</div>
              <div className="text-foreground">{activity.scenario}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">目标客群</div>
              <div className="text-foreground">{activity.targetGroup.name}（{activity.targetGroup.scale} 户）</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">触达渠道</div>
              <div className="flex flex-wrap gap-1">{activity.channels.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">推荐产品</div>
              <div className="flex flex-wrap gap-1">{activity.products.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">后评估</div>
              <div className="text-muted-foreground">
                {activity.evaluationConfig.enabled
                  ? `${activity.evaluationConfig.observationPeriod} · ${activity.evaluationConfig.metrics.join('/')} · 目标 ${activity.evaluationConfig.targetValue}`
                  : '未开启'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">负责人 / 时限</div>
              <div className="text-muted-foreground">{activity.owner} · {activity.deadline}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ActivityTrackPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <ActivityTrackInner />
    </Suspense>
  );
}
