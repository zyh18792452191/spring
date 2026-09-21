'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, PlayCircle, RotateCcw, Send, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DISPATCHED_ORDERS, type DispatchedOrder } from '../data';

function getStatusStyle(status: string) {
  if (status === '已完成') return 'bg-primary/10 text-primary hover:bg-primary/10';
  if (status === '执行中') return 'bg-muted text-foreground hover:bg-muted';
  if (status === '待执行') return 'bg-secondary text-secondary-foreground hover:bg-secondary';
  return 'bg-destructive/10 text-destructive hover:bg-destructive/10';
}

export default function StrategyCollabDispatchPage() {
  const [orders, setOrders] = useState<DispatchedOrder[]>(DISPATCHED_ORDERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hint, setHint] = useState('');

  const stats = {
    total: orders.length,
    running: orders.filter((item) => item.status === '执行中').length,
    done: orders.filter((item) => item.status === '已完成').length,
    abnormal: orders.filter((item) => item.abnormal).length,
  };

  const handleCancel = () => {
    if (selectedIds.length === 0) {
      setHint('请先勾选需要撤销的工单（仅"待执行/执行中"状态可撤销）');
      return;
    }
    const cancellable = orders.filter((item) => selectedIds.includes(item.id) && item.status !== '已完成');
    if (cancellable.length === 0) {
      setHint('所选工单均为已完成状态，无法撤销');
      return;
    }
    setOrders((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) && item.status !== '已完成'
          ? { ...item, status: '已终止', abnormal: '策略方主动撤销' }
          : item,
      ),
    );
    setHint(`已撤销 ${cancellable.length} 张工单，并同步通知调度中心执行方停止触达`);
    setSelectedIds([]);
  };

  const handleResend = (order: DispatchedOrder) => {
    const newId = `WO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(
      new Date().getDate(),
    ).padStart(2, '0')}-${String(orders.length + 1).padStart(4, '0')}`;
    const newOrder: DispatchedOrder = {
      ...order,
      id: newId,
      dispatchedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      playedCount: 0,
      status: '待执行',
      progress: 0,
      abnormal: null,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setHint(`已基于工单 ${order.id} 补发新工单 ${newId}，沿用原策略、客群与派发渠道`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">与调度中心协作</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看策略下发后由调度中心承接的派发工单，实时同步执行状态与异常提醒，支持撤销与补发。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel}>
            <RotateCcw className="w-4 h-4" />
            撤销工单
          </Button>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: '已派发工单', value: stats.total, icon: Send, desc: '策略下发后由调度中心承接' },
          { label: '执行中', value: stats.running, icon: PlayCircle, desc: '正在触达执行' },
          { label: '已完成', value: stats.done, icon: CheckCircle2, desc: '已触达完毕并回流结果' },
          { label: '待办与异常提醒', value: stats.abnormal, icon: AlertTriangle, desc: '进度异常/超时未启动' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{card.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{card.desc}</div>
            </div>
          );
        })}
      </div>

      {hint && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Users className="w-4 h-4 text-muted-foreground" />
          {hint}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={orders.length > 0 && orders.every((item) => selectedIds.includes(item.id))}
                  onCheckedChange={(checked) =>
                    setSelectedIds(checked === true ? orders.map((item) => item.id) : [])
                  }
                  aria-label="全选"
                />
              </TableHead>
              <TableHead className="min-w-[170px]">工单编号</TableHead>
              <TableHead className="min-w-[160px]">策略名称</TableHead>
              <TableHead className="min-w-[100px]">工单类型</TableHead>
              <TableHead className="min-w-[100px]">派发渠道</TableHead>
              <TableHead className="min-w-[140px]">派发时间</TableHead>
              <TableHead className="min-w-[100px]">目标客户数</TableHead>
              <TableHead className="min-w-[90px]">已执行</TableHead>
              <TableHead className="min-w-[90px]">状态</TableHead>
              <TableHead className="min-w-[140px]">执行进度</TableHead>
              <TableHead className="min-w-[160px]">异常提醒</TableHead>
              <TableHead className="min-w-[90px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((item) => (
              <TableRow key={item.id} className={selectedIds.includes(item.id) ? 'bg-muted/40' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      setSelectedIds((prev) =>
                        checked === true ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                      )
                    }
                    aria-label={`选择 ${item.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{item.strategyName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.workOrderType}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.channel}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.dispatchedAt}</TableCell>
                <TableCell className="text-sm text-foreground">{item.targetCount.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-foreground">{item.playedCount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusStyle(item.status)}>{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-[80px] overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.abnormal ? (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {item.abnormal}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto gap-1 p-0 text-primary"
                    onClick={() => handleResend(item)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    补发
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}