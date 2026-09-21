'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertPeriodRecord, buildDetailRows, formatScenePath, INITIAL_RULES, MisjudgeStatus, unitOfIndicator } from '../data';
import { ConfirmAlertDialog } from '../components/ConfirmAlertDialog';
import { ViewAlertDialog } from '../components/ViewAlertDialog';

/** 数值列展示：数字 + 指标单位 */
function valueText(record: AlertPeriodRecord, unit: string): string {
  const num = Number(record.value);
  if (Number.isNaN(num)) return record.value;
  if (unit === '%') return `${record.value}%`;
  if (unit === '元') return `¥${num.toFixed(2)}`;
  return `${num.toFixed(2)}${unit}`;
}

function nowText(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 是否误判 状态徽标（未触发预警的账期无需判断） */
function MisjudgeBadge({ record }: { record: AlertPeriodRecord }) {
  if (record.execStatus === 'noAlert') {
    return <span className="text-gray-400">—</span>;
  }
  if (record.misjudge === 'pending') {
    return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs whitespace-nowrap px-1.5">待确认</Badge>;
  }
  if (record.misjudge === 'yes') {
    return <Badge className="bg-red-50 text-red-600 border-red-100 text-xs whitespace-nowrap px-1.5">误判</Badge>;
  }
  return <Badge className="bg-green-50 text-green-600 border-green-100 text-xs whitespace-nowrap px-1.5">未误判</Badge>;
}

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';

  const rule = useMemo(() => INITIAL_RULES.find((r) => r.id === id), [id]);
  const [records, setRecords] = useState<AlertPeriodRecord[]>(() => (rule ? buildDetailRows(rule) : []));

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const pageRows = records.slice((page - 1) * pageSize, page * pageSize);

  // 弹窗
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<AlertPeriodRecord | null>(null);

  if (!rule) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 mb-4">未找到该预警规则，可能已被删除</p>
        <Button
          className="bg-[#0085D0] hover:bg-[#006BB0] text-white"
          onClick={() => router.push('/workspace/insight/alert/ai-monitor')}
        >
          返回预警列表
        </Button>
      </div>
    );
  }

  const unit = unitOfIndicator(rule.indicator);

  const openConfirm = (record: AlertPeriodRecord) => {
    setActiveRecord(record);
    setConfirmOpen(true);
  };

  const openView = (record: AlertPeriodRecord) => {
    setActiveRecord(record);
    setViewOpen(true);
  };

  const handleConfirm = (record: AlertPeriodRecord, misjudge: Exclude<MisjudgeStatus, 'pending'>) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, misjudge, confirmUser: '当前操作人', confirmTime: nowText() }
          : r
      )
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-gray-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">AI指标监控预警信息</h1>
      </div>

      {/* 指标基础信息 */}
      <Card className="shadow-none border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[#0085D0]" />
            <span className="text-sm font-medium text-gray-900">指标基础信息</span>
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-5">
            <div>
              <p className="text-xs text-gray-500">指标名称</p>
              <p className="text-sm text-gray-900 mt-1">{rule.indicator}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">业务场景</p>
              <p className="text-sm text-gray-900 mt-1">{rule.scene[rule.scene.length - 1]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">预警粒度</p>
              <p className="text-sm text-gray-900 mt-1">{rule.granularity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">预警范围</p>
              <p className="text-sm text-gray-900 mt-1">{rule.scope}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">业务场景路径</p>
              <p className="text-sm text-gray-900 mt-1">{formatScenePath(rule.scene)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">准确率</p>
              <p className="text-sm text-gray-900 mt-1">
                {rule.accuracy === null ? '—' : `${rule.accuracy}%`}
              </p>
            </div>
            <div className="col-span-3">
              <p className="text-xs text-gray-500">当前判定条件</p>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
                {rule.condition}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">误报次数</p>
              <p className="text-sm text-gray-900 mt-1">{rule.falseCount} 次</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">总预警次数</p>
              <p className="text-sm text-gray-900 mt-1">{rule.totalCount} 次</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">状态</p>
              <p className="mt-1">
                {rule.enabled ? (
                  <Badge className="bg-green-50 text-green-600 border-green-100">启用中</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200">已停用</Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预警情况 */}
      <Card className="shadow-none border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">预警情况</span>
              <span className="text-xs text-gray-400">按指标账期记录 AI 判定与人工确认结果</span>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="text-gray-600 w-[8%]">指标账期</TableHead>
                  <TableHead className="text-gray-600 w-[9%]">指标数值</TableHead>
                  <TableHead className="text-gray-600 w-[11%]">更新时间</TableHead>
                  <TableHead className="text-gray-600 w-[14%]">判定条件</TableHead>
                  <TableHead className="text-gray-600 w-[23%]">判定条件说明</TableHead>
                  <TableHead className="text-gray-600 w-[10%]">是否执行指标预警</TableHead>
                  <TableHead className="text-gray-600 w-[13%]">预警说明</TableHead>
                  <TableHead className="text-gray-600 w-[6%]">是否误判</TableHead>
                  <TableHead className="text-gray-600 w-[6%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{record.period}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{valueText(record, unit)}</TableCell>
                    <TableCell className="text-gray-600">{record.updatedAt}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1.5">
                        <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs shrink-0 mt-0.5">
                          AI
                        </Badge>
                        <span className="text-xs text-gray-600 leading-snug break-words min-w-0">{record.condition}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 leading-relaxed break-words whitespace-normal">
                      {record.conditionDesc}
                    </TableCell>
                    <TableCell>
                      {record.execStatus === 'alerted' ? (
                        <Badge className="bg-red-50 text-red-600 border-red-100">已执行已预警</Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-600 border-green-100">已执行未预警</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 leading-relaxed break-words whitespace-normal">
                      {record.alertDesc}
                    </TableCell>
                    <TableCell>
                      <MisjudgeBadge record={record} />
                    </TableCell>
                    <TableCell>
                      {record.execStatus === 'noAlert' ? (
                        <span className="text-gray-300">—</span>
                      ) : record.misjudge === 'pending' ? (
                        <Button
                          className="h-7 px-2.5 text-xs bg-[#0085D0] hover:bg-[#006BB0] text-white shrink-0"
                          onClick={() => openConfirm(record)}
                        >
                          确认
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="h-7 px-2 text-xs text-[#0085D0] hover:bg-[#0085D0]/5"
                          onClick={() => openView(record)}
                        >
                          查看
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-gray-400">
                      暂无预警记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              共 {records.length} 条数据
              <div className="flex items-center gap-1 ml-3">
                <Label className="text-xs text-gray-500">每页</Label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-7 w-[70px] text-xs">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">条</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-7 w-7 p-0"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="h-7 w-7 p-0"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 确认预警弹窗 */}
      <ConfirmAlertDialog
        open={confirmOpen}
        record={activeRecord}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
      />
      {/* 查看预警弹窗 */}
      <ViewAlertDialog open={viewOpen} record={activeRecord} onOpenChange={setViewOpen} />
    </div>
  );
}

export default function AiMonitorDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">加载中...</div>}>
      <DetailContent />
    </Suspense>
  );
}
