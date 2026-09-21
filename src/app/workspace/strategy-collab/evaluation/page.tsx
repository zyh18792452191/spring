'use client';

import { useState } from 'react';
import { Activity, BellPlus, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
  ALERT_SUBSCRIPTIONS,
  EVALUATION_SUMMARIES,
  HEALTH_ALERTS,
  type AlertSubscription,
  type HealthLevel,
} from '../data';

const HEALTH_LABEL: Record<HealthLevel, string> = { green: '健康', yellow: '关注', red: '告警' };

function HealthBlock({ health }: { health: HealthLevel }) {
  const style =
    health === 'green'
      ? 'bg-primary/10 text-primary'
      : health === 'yellow'
        ? 'bg-secondary text-secondary-foreground'
        : 'bg-destructive/10 text-destructive';
  return <Badge className={`${style} hover:${style.split(' ')[0]}`}>{HEALTH_LABEL[health]}</Badge>;
}

function HealthDot({ health }: { health: HealthLevel }) {
  const color = health === 'green' ? 'bg-primary' : health === 'yellow' ? 'bg-secondary-foreground/50' : 'bg-destructive';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function StrategyCollabEvaluationPage() {
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>(ALERT_SUBSCRIPTIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [newChannel, setNewChannel] = useState('站内消息');

  const handleOpenDialog = (strategyId?: string, strategyName?: string) => {
    setNewStrategy(strategyId ? `${strategyId}|${strategyName ?? ''}` : '');
    setNewThreshold('');
    setNewChannel('站内消息');
    setDialogOpen(true);
  };

  const handleAddSubscription = () => {
    if (!newStrategy || !newThreshold.trim()) return;
    const [strategyId, strategyName] = newStrategy.split('|');
    setSubscriptions((prev) => [
      {
        id: `SUB-${String(prev.length + 1).padStart(3, '0')}`,
        strategyId,
        strategyName: strategyName || strategyId,
        threshold: newThreshold,
        channel: newChannel,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        enabled: true,
      },
      ...prev,
    ]);
    setDialogOpen(false);
  };

  const handleToggleSubscription = (id: string, enabled: boolean) => {
    setSubscriptions((prev) => prev.map((item) => (item.id === id ? { ...item, enabled } : item)));
  };

  const handleRemoveSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">与评估中心协作</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            接收评估中心的策略评估摘要与健康度告警，订阅告警条件，评估结果回流策略沉淀形成闭环。
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => handleOpenDialog()}>
          <BellPlus className="w-4 h-4" />
          订阅告警
        </Button>
      </div>

      {/* 策略评估摘要 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">策略评估摘要</h2>
          <span className="text-xs text-muted-foreground">数据来源：评估中心策略评估任务（触达→办理→达成）</span>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">策略ID</TableHead>
              <TableHead className="min-w-[160px]">策略名称</TableHead>
              <TableHead className="min-w-[120px]">派发时间</TableHead>
              <TableHead className="min-w-[90px]">触达率</TableHead>
              <TableHead className="min-w-[90px]">办理率</TableHead>
              <TableHead className="min-w-[90px]">达成率</TableHead>
              <TableHead className="min-w-[110px]">改善幅度</TableHead>
              <TableHead className="min-w-[90px]">健康度</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EVALUATION_SUMMARIES.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.strategyId}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{item.strategyName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.dispatchTime}</TableCell>
                <TableCell className="text-sm text-foreground">{item.reachRate}%</TableCell>
                <TableCell className="text-sm text-foreground">{item.dealRate}%</TableCell>
                <TableCell className="text-sm text-foreground">{item.achievementRate}%</TableCell>
                <TableCell
                  className={`text-sm ${item.improvement.startsWith('-') ? 'text-destructive' : 'text-primary'}`}
                >
                  {item.improvement}
                </TableCell>
                <TableCell>
                  <HealthBlock health={item.health} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 健康度告警 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">健康度告警</h2>
          <span className="text-xs text-muted-foreground">
            评估中心按"触达率/办理率/达成率"阈值生成，可订阅后推送至策略中心
          </span>
        </div>
        {HEALTH_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <HealthDot health={alert.level} />
                <span className="text-sm font-medium text-foreground">{alert.strategyName}</span>
                <Badge variant="secondary">{alert.metric}</Badge>
                <span className="font-mono text-xs text-muted-foreground">{alert.strategyId}</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <div className="text-xs text-muted-foreground">告警时间：{alert.time}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => handleOpenDialog(alert.strategyId, alert.strategyName)}
            >
              订阅该告警
            </Button>
          </div>
        ))}
      </section>

      {/* 订阅告警列表 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <BellPlus className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">我的告警订阅</h2>
          <span className="text-xs text-muted-foreground">共 {subscriptions.length} 条</span>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">策略ID</TableHead>
              <TableHead className="min-w-[160px]">策略名称</TableHead>
              <TableHead className="min-w-[150px]">触发阈值</TableHead>
              <TableHead className="min-w-[150px]">通知渠道</TableHead>
              <TableHead className="min-w-[140px]">订阅时间</TableHead>
              <TableHead className="min-w-[80px]">启用</TableHead>
              <TableHead className="min-w-[90px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  暂无订阅，点击右上角"订阅告警"新增
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.strategyId}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{item.strategyName}</TableCell>
                  <TableCell className="text-sm text-foreground">{item.threshold}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.channel}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.createdAt}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={item.enabled}
                      onCheckedChange={(checked) => handleToggleSubscription(item.id, checked === true)}
                      aria-label="启用订阅"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-destructive"
                      onClick={() => handleRemoveSubscription(item.id)}
                    >
                      取消订阅
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* 新增订阅弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>订阅策略健康度告警</DialogTitle>
            <DialogDescription>订阅后，评估中心触发对应阈值告警时将自动推送通知。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>策略</Label>
              <Select value={newStrategy} onValueChange={setNewStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择策略" />
                </SelectTrigger>
                <SelectContent>
                  {EVALUATION_SUMMARIES.map((item) => (
                    <SelectItem key={item.strategyId} value={`${item.strategyId}|${item.strategyName}`}>
                      {item.strategyName}（{item.strategyId}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>触发阈值</Label>
              <Input
                placeholder="如：办理率 < 8%"
                value={newThreshold}
                onChange={(event) => setNewThreshold(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>通知渠道</Label>
              <Select value={newChannel} onValueChange={setNewChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="站内消息">站内消息</SelectItem>
                  <SelectItem value="站内消息 + 邮件">站内消息 + 邮件</SelectItem>
                  <SelectItem value="站内消息 + 短信">站内消息 + 短信</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddSubscription} disabled={!newStrategy || !newThreshold.trim()}>
              确认订阅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}