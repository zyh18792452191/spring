'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Inbox, MoreHorizontal, Search, Send, Sparkles, UserPlus, X } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';

type DiagnoseStatus = '待处理' | '已受理' | '已拒收' | '已转派' | '已忽略' | '已制定';

interface AcceptRecord {
  operator: string;
  time: string;
  conclusion: string;
}

interface DiagnosticConclusion {
  id: string;
  indicatorName: string;
  scenario: string;
  currentValue: string;
  baseValue: string;
  targetValue: string;
  achievementRate: number;
  abnormalReason: string;
  suggestedStrategyCount: number;
  receivedAt: string;
  receiveChannel: string;
  status: DiagnoseStatus;
  acceptRecord?: AcceptRecord;
}

const DIAGNOSTIC_CONCLUSIONS: DiagnosticConclusion[] = [
  { id: 'DG-20260828-001', indicatorName: '5G套餐渗透率', scenario: '流量运营', currentValue: '62.4%', baseValue: '68.1%', targetValue: '70.0%', achievementRate: 89.1, abnormalReason: '中低端客户5G终端已具备但套餐未升档，存量升档触点缺失', suggestedStrategyCount: 3, receivedAt: '2026-08-28 09:10', receiveChannel: '指标树诊断结论', status: '待处理' },
  { id: 'DG-20260828-002', indicatorName: '宽带续费率', scenario: '家庭融合运营', currentValue: '81.2%', baseValue: '86.5%', targetValue: '88.0%', achievementRate: 92.3, abnormalReason: '到期前15天触达覆盖率不足，竞品低价宽带分流', suggestedStrategyCount: 2, receivedAt: '2026-08-28 09:12', receiveChannel: '指标树诊断结论', status: '待处理' },
  { id: 'DG-20260828-003', indicatorName: '中高端客户保有率', scenario: '中高端客户运营', currentValue: '94.6%', baseValue: '95.8%', targetValue: '96.5%', achievementRate: 98.0, abnormalReason: '部分客户权益感知弱，专属服务触点未覆盖', suggestedStrategyCount: 2, receivedAt: '2026-08-28 09:15', receiveChannel: 'AI 指标诊断', status: '待处理' },
  { id: 'DG-20260827-006', indicatorName: '流量饱和度', scenario: '流量运营', currentValue: '73.5%', baseValue: '69.8%', targetValue: '80.0%', achievementRate: 91.9, abnormalReason: '大流量包客户升级路径不清晰，触达话术未突出流量权益', suggestedStrategyCount: 4, receivedAt: '2026-08-27 18:40', receiveChannel: '指标树诊断结论', status: '已制定' },
  { id: 'DG-20260827-008', indicatorName: '离网率', scenario: '离网维系', currentValue: '1.32%', baseValue: '1.05%', targetValue: '1.10%', achievementRate: 83.3, abnormalReason: '高价值客户异网流量激增，缺少离网预警干预策略', suggestedStrategyCount: 3, receivedAt: '2026-08-27 17:05', receiveChannel: 'AI 指标诊断', status: '已制定' },
  { id: 'DG-20260826-004', indicatorName: '融合套餐渗透率', scenario: '家庭融合运营', currentValue: '58.7%', baseValue: '61.4%', targetValue: '65.0%', achievementRate: 90.3, abnormalReason: '单卡客户融合路径未打通，家庭组网权益未有效宣传', suggestedStrategyCount: 2, receivedAt: '2026-08-26 15:22', receiveChannel: '指标树诊断结论', status: '待处理' },
];

// 洞察中心 / AI 指标监控预警推送的待接收结论（手动接收入口模拟数据）
const INSIGHT_PUSH_ITEMS: DiagnosticConclusion[] = [
  { id: 'DG-20260828-021', indicatorName: '客户流失预警', scenario: '离网维系', currentValue: '预警中', baseValue: '1.05%', targetValue: '1.10%', achievementRate: 83.3, abnormalReason: 'AI指标监控预警触发：高价值客户异网活跃度连续3期上升', suggestedStrategyCount: 4, receivedAt: '2026-08-28 10:30', receiveChannel: 'AI 指标监控预警', status: '待处理' },
  { id: 'DG-20260828-022', indicatorName: '套餐降档预警', scenario: '中高端客户运营', currentValue: '预警中', baseValue: '94.6%', targetValue: '95.0%', achievementRate: 91.2, abnormalReason: 'AI指标监控预警触发：中高端客户套餐降档率环比上升2.1pp', suggestedStrategyCount: 2, receivedAt: '2026-08-28 10:32', receiveChannel: 'AI 指标监控预警', status: '待处理' },
  { id: 'DG-20260828-023', indicatorName: '流量超套预警', scenario: '流量运营', currentValue: '预警中', baseValue: '73.5%', targetValue: '80.0%', achievementRate: 90.8, abnormalReason: 'AI指标监控预警触发：低饱和套餐客户流量超套率异常抬升', suggestedStrategyCount: 3, receivedAt: '2026-08-28 10:35', receiveChannel: 'AI 指标监控预警', status: '待处理' },
];

const SCENARIOS = ['流量运营', '中高端客户运营', '离网维系', '家庭融合运营', '国际业务运营', '增量运营'];

const STATUS_STYLE: Record<DiagnoseStatus, string> = {
  待处理: 'bg-destructive/10 text-destructive hover:bg-destructive/10',
  已受理: 'bg-primary/10 text-primary hover:bg-primary/10',
  已拒收: 'bg-muted text-muted-foreground hover:bg-muted',
  已转派: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  已忽略: 'bg-muted text-muted-foreground hover:bg-muted',
  已制定: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
};

function StatusBadge({ status }: { status: DiagnosticConclusion['status'] }) {
  return <Badge className={STATUS_STYLE[status]}>{status}</Badge>;
}

const RECEIVERS = ['张耀辉', '王芳', '赵敏', '陈晨', '李经理'];

export default function ReceiveDiagnosisPage() {
  const router = useRouter();
  const [data, setData] = useState<DiagnosticConclusion[]>(DIAGNOSTIC_CONCLUSIONS);
  const [keyword, setKeyword] = useState('');
  const [scenario, setScenario] = useState('全部');
  const [channel, setChannel] = useState('全部');
  const [range, setRange] = useState('近7天');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ mode: '拒收' | '转派' | '忽略'; item: DiagnosticConclusion } | null>(null);
  const [reason, setReason] = useState('');
  const [receiver, setReceiver] = useState('');
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receiveSelected, setReceiveSelected] = useState<string[]>([]);
  const PAGE_SIZE = 15;

  // 受理动作：承接（进入定策）
  const handleAccept = (item: DiagnosticConclusion) => {
    setData((prev) =>
      prev.map((d) =>
        d.id === item.id
          ? {
              ...d,
              status: '已受理',
              acceptRecord: {
                operator: '张耀辉',
                time: new Date().toLocaleString('zh-CN', { hour12: false }),
                conclusion: '承接，进入定策',
              },
            }
          : d,
      ),
    );
    router.push(
      `/workspace/strategy/matching?indicator=${encodeURIComponent(item.indicatorName)}&conclusion=${encodeURIComponent(item.id)}`,
    );
  };

  // 受理动作：拒收 / 转派 / 忽略（打开弹窗填写）
  const openDialog = (mode: '拒收' | '转派' | '忽略', item: DiagnosticConclusion) => {
    setReason('');
    setReceiver('');
    setDialog({ mode, item });
  };

  const confirmDialog = () => {
    if (!dialog) return;
    const conclusionMap: Record<string, string> = {
      拒收: reason ? `拒收：${reason}` : '拒收',
      转派: receiver ? `转派给 ${receiver}${reason ? `（${reason}）` : ''}` : '转派',
      忽略: reason ? `忽略：${reason}` : '忽略',
    };
    const statusMap: Record<string, DiagnoseStatus> = {
      拒收: '已拒收',
      转派: '已转派',
      忽略: '已忽略',
    };
    setData((prev) =>
      prev.map((d) =>
        d.id === dialog.item.id
          ? {
              ...d,
              status: statusMap[dialog.mode],
              acceptRecord: {
                operator: '张耀辉',
                time: new Date().toLocaleString('zh-CN', { hour12: false }),
                conclusion: conclusionMap[dialog.mode],
              },
            }
          : d,
      ),
    );
    setDialog(null);
  };

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchKeyword = !keyword.trim() || item.indicatorName.includes(keyword.trim());
      const matchScenario = scenario === '全部' || item.scenario === scenario;
      const matchChannel = channel === '全部' || item.receiveChannel === channel;
      return matchKeyword && matchScenario && matchChannel;
    });
  }, [data, keyword, scenario, channel]);

  const pagedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleGoFormulate = (item: DiagnosticConclusion) => {
    router.push(
      `/workspace/strategy/matching?indicator=${encodeURIComponent(item.indicatorName)}&conclusion=${encodeURIComponent(item.id)}`,
    );
  };

  const handleBatchFormulate = () => {
    const indicatorNames = data
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => item.indicatorName)
      .join(',');
    router.push(`/workspace/strategy/matching?indicator=${encodeURIComponent(indicatorNames)}&conclusion=batch`);
  };

  const allSelected = pagedData.length > 0 && pagedData.every((item) => selectedIds.includes(item.id));

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">接收诊断</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            接收指标树诊断与 AI 指标诊断的结论，按结论制定并派发策略，形成"诊断—定策—派发"联动。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setReceiveSelected([]); setShowReceiveDialog(true); }}>
            <Inbox className="w-4 h-4" />
            手动接收
          </Button>
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-2">
            <div className="text-xs text-muted-foreground">
              待处理结论 <span className="ml-1 text-base font-semibold text-foreground">{data.filter((item) => item.status === '待处理').length}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              已制定 <span className="ml-1 text-base font-semibold text-foreground">{data.filter((item) => item.status === '已制定').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索指标名称"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={scenario}
          onValueChange={(value) => {
            setScenario(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="业务场景" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部业务场景</SelectItem>
            {SCENARIOS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={channel}
          onValueChange={(value) => {
            setChannel(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="接收方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部接收方式</SelectItem>
            <SelectItem value="指标树诊断结论">指标树诊断结论</SelectItem>
            <SelectItem value="AI 指标诊断">AI 指标诊断</SelectItem>
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="近7天">近 7 天</SelectItem>
            <SelectItem value="近30天">近 30 天</SelectItem>
            <SelectItem value="本季度">本季度</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <Button size="sm" className="gap-1.5" onClick={handleBatchFormulate}>
            <Sparkles className="w-4 h-4" />
            批量制定策略（{selectedIds.length}）
          </Button>
        )}
      </div>

      {/* 结论列表 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Inbox className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">诊断结论</h2>
          <span className="text-xs text-muted-foreground">
            数据来源：指标树诊断 / AI 指标诊断结论推送 · 时间范围 {range} · 共 {filtered.length} 条
          </span>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    setSelectedIds(checked === true ? pagedData.map((item) => item.id).filter((id) => !selectedIds.includes(id)).concat(selectedIds) : [])
                  }
                  aria-label="全选"
                />
              </TableHead>
              <TableHead className="min-w-[150px]">指标名称</TableHead>
              <TableHead className="min-w-[130px]">业务场景</TableHead>
              <TableHead className="min-w-[90px]">当前值</TableHead>
              <TableHead className="min-w-[90px]">基期值</TableHead>
              <TableHead className="min-w-[90px]">目标值</TableHead>
              <TableHead className="min-w-[90px]">达成率</TableHead>
              <TableHead className="min-w-[280px]">异常原因</TableHead>
              <TableHead className="min-w-[100px]">建议策略数</TableHead>
              <TableHead className="min-w-[150px]">接收时间</TableHead>
              <TableHead className="min-w-[90px]">状态</TableHead>
              <TableHead className="min-w-[90px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                  暂无诊断结论
                </TableCell>
              </TableRow>
            ) : (
              pagedData.map((item) => (
                <TableRow key={item.id} className={selectedIds.includes(item.id) ? 'bg-muted/40' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((prev) =>
                          checked === true ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                        )
                      }
                      aria-label={`选择 ${item.indicatorName}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{item.indicatorName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.scenario}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{item.currentValue}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.baseValue}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.targetValue}</TableCell>
                  <TableCell
                    className={`text-sm ${item.achievementRate < 95 ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {item.achievementRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.abnormalReason}</TableCell>
                  <TableCell className="text-sm text-foreground">{item.suggestedStrategyCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.receivedAt}
                    <div className="text-xs">{item.receiveChannel}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    {item.status === '待处理' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            受理
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAccept(item)}>
                            <Check className="mr-2 h-4 w-4" /> 承接（进入定策）
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('拒收', item)}>
                            <X className="mr-2 h-4 w-4" /> 拒收
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('转派', item)}>
                            <Send className="mr-2 h-4 w-4" /> 转派
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog('忽略', item)}>
                            <MoreHorizontal className="mr-2 h-4 w-4" /> 忽略
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : item.status === '已受理' ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => handleGoFormulate(item)}
                      >
                        去制定
                      </Button>
                    ) : item.status === '已制定' ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-muted-foreground"
                        onClick={() => handleGoFormulate(item)}
                      >
                        查看
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {item.acceptRecord?.conclusion ?? '已处理'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            共 {filtered.length} 条 · 第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </section>

      {/* 受理弹窗（拒收/转派/忽略） */}
      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{dialog?.mode}诊断结论</DialogTitle>
            <DialogDescription>
              诊断结论：{dialog?.item.indicatorName}（{dialog?.item.id}）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {dialog?.mode === '转派' && (
              <div className="space-y-2">
                <Label>转派接收方</Label>
                <Select value={receiver} onValueChange={setReceiver}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择接收方" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECEIVERS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>
                {dialog?.mode === '转派'
                  ? '转派说明（可选）'
                  : dialog?.mode === '拒收'
                    ? '拒收理由'
                    : '忽略说明（可选）'}
              </Label>
              <Textarea
                placeholder={
                  dialog?.mode === '转派'
                    ? '请输入转派说明'
                    : dialog?.mode === '拒收'
                      ? '请输入拒收理由'
                      : '请输入忽略说明'
                }
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              取消
            </Button>
            <Button onClick={confirmDialog}>确认{dialog?.mode}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 手动接收洞察诊断弹窗 */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>接收洞察诊断</DialogTitle>
            <DialogDescription>
              洞察中心与 AI 指标监控预警推送的诊断结论，勾选后接收进入待处理列表。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {INSIGHT_PUSH_ITEMS.map((item) => (
              <label key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                <Checkbox
                  checked={receiveSelected.includes(item.id)}
                  onCheckedChange={(checked) => {
                    setReceiveSelected((prev) =>
                      checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                    );
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.indicatorName}</span>
                    <Badge variant="secondary">{item.scenario}</Badge>
                    <Badge className="bg-primary/10 text-primary">{item.receiveChannel}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.abnormalReason}</p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>取消</Button>
            <Button
              disabled={receiveSelected.length === 0}
              onClick={() => {
                const picked = INSIGHT_PUSH_ITEMS.filter((item) => receiveSelected.includes(item.id));
                setData((prev) => [...picked, ...prev]);
                setShowReceiveDialog(false);
                setReceiveSelected([]);
              }}
            >
              接收所选（{receiveSelected.length}）
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}