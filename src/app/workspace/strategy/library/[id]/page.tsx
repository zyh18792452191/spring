'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const sourceLabels: Record<string, { label: string; color: string }> = {
  expert: { label: '专家经验', color: 'bg-blue-100 text-blue-700' },
  ai_generated: { label: 'AI生成', color: 'bg-orange-100 text-orange-700' },
};

const mockDetail = {
  id: 'STR-001',
  name: '套餐升迁推荐（高流量低资费档位）',
  source: 'expert',
  category1: '套餐优化类',
  category2: '套餐升迁',
  description: '针对流量超套或DOU持续增长的客户，推荐更高流量档位套餐，提升ARPU的同时改善客户体验',
  businessScenarios: ['流量运营', '中高端客户运营'],
  status: '上架',
  createdAt: '2025-01-15',
  updatedAt: '2025-03-20',
  confidence: 0.329,
  referenceRate: 0.35,
  relatedRootCauses: [
    { rootCauseId: 'RC-001', rootCauseName: '套餐流量容量不足', rootCauseCategory: '产品与套餐因素', strength: 3 },
    { rootCauseId: 'RC-005', rootCauseName: '客户套餐与使用习惯不匹配', rootCauseCategory: '客户行为因素', strength: 2 },
  ],
  relatedIndicators: [
    { indicatorId: 'IND-001', indicatorName: '降档客户数', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', strength: 3 },
    { indicatorId: 'IND-002', indicatorName: 'ARPU值', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 2 },
  ],
  relatedGroups: [
    { groupId: 'CG-001', groupName: '高流量低资费客户', groupScale: '15.6万', strength: 3 },
    { groupId: 'CG-002', groupName: '流量超套客户', groupScale: '8.2万', strength: 2 },
  ],
  products: [
    { productCode: 'PROD-5G-199', productName: '5G畅享199套餐', productDescription: '含60GB流量+1000分钟通话，适合中高端客户' },
    { productCode: 'PROD-5G-129', productName: '5G畅享129套餐', productDescription: '含30GB流量+500分钟通话，适合流量增长型客户' },
  ],
  scripts: [
    { name: '通用升迁话术', channel: '外呼', content: '您好，注意到您近期流量使用较多，推荐您升级至XX套餐，流量更充足，使用更安心...' },
    { name: '青年版话术', channel: '短信', content: '嗨，流量不够用了吧？升级XX套餐，追剧打游戏再也不用担心流量不够...' },
  ],
  channels: [
    { channel: '外呼', priority: 1, timeSlot: '09:00-20:00' },
    { channel: '短信', priority: 2, timeSlot: '10:00-18:00' },
    { channel: 'APP弹窗', priority: 3, timeSlot: '全天' },
  ],
  statisticsPeriod: '3个月',
  dispatchCount: 3,
  latestConversion: '4.8%',
  weightedConversion: '4.2%',
  dispatchRecords: [
    { id: 'COD-2026-001', name: '高流量低资费客户套餐升迁调度', date: '2026-04-10', status: '已完成', reachCount: 1250, successCount: 58, conversionRate: '4.6%' },
    { id: 'COD-2026-003', name: '5G用户流量经营专项调度', date: '2026-03-25', status: '已完成', reachCount: 860, successCount: 38, conversionRate: '4.4%' },
    { id: 'STR-2026-007', name: '中高端客户ARPU提升策略调度', date: '2026-03-10', status: '进行中', reachCount: null, successCount: null, conversionRate: null },
  ],
};

const operatorLabel: Record<string, string> = {
  'none': '不限',
  '>': '>',
  '>=': '≥',
  '<': '<',
  '<=': '≤',
  '=': '=',
};

function formatThreshold(ri: typeof mockDetail.relatedIndicators[0]): string {
  const parts: string[] = [];
  if (ri.lowerOperator !== 'none' && ri.lowerValue) {
    parts.push(`${operatorLabel[ri.lowerOperator]}${ri.lowerValue}${ri.lowerUnit}`);
  }
  if (ri.upperOperator !== 'none' && ri.upperValue) {
    parts.push(`${operatorLabel[ri.upperOperator]}${ri.upperValue}${ri.upperUnit}`);
  }
  if (parts.length === 0) return '不限';
  return parts.join(' 且 ');
}

const strengthLabels: Record<number, { label: string; color: string }> = {
  3: { label: '强', color: 'text-red-600' },
  2: { label: '中', color: 'text-yellow-600' },
  1: { label: '弱', color: 'text-gray-500' },
};

export default function StrategyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [detail, setDetail] = useState(mockDetail);
  const d = detail;

  const handlePublishToggle = () => {
    setDetail(prev => ({
      ...prev,
      status: prev.status === '上架' ? '下架' : '上架'
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/strategy/library')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回列表
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{d.name}</h1>
              <Badge variant="outline" className="font-mono text-xs">{d.id}</Badge>
              <Badge className={`text-xs px-1.5 py-0 ml-1 ${sourceLabels[d.source]?.color}`}>{sourceLabels[d.source]?.label}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{d.category1} / {d.category2}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={d.status === '上架' ? 'default' : 'secondary'}>{d.status}</Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant={d.status === '上架' ? 'destructive' : 'default'}>
                {d.status === '上架' ? '下架' : '上架'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认{d.status === '上架' ? '下架' : '上架'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {d.status === '上架'
                    ? `下架后该策略将不再参与系统推荐，但已产生的调度单不受影响。确定要下架「${d.name}」吗？`
                    : `上架后该策略将参与系统推荐。确定要上架「${d.name}」吗？`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublishToggle}>确认</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" className="gap-1.5" onClick={() => router.push(`/workspace/strategy/library/edit?id=${id}`)}>
            <Pencil className="w-3.5 h-3.5" /> 编辑
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="basic" className="text-xs">基础信息</TabsTrigger>
          <TabsTrigger value="related" className="text-xs">关联配置</TabsTrigger>
          <TabsTrigger value="product" className="text-xs">产品/方案</TabsTrigger>
          <TabsTrigger value="channel" className="text-xs">渠道适配</TabsTrigger>
          <TabsTrigger value="script" className="text-xs">营销话术</TabsTrigger>
          <TabsTrigger value="runtime" className="text-xs">运行数据</TabsTrigger>
          <TabsTrigger value="records" className="text-xs">使用记录</TabsTrigger>
        </TabsList>

        {/* Tab1：基础信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader><CardTitle className="text-base">基础信息</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">策略ID：</span>{d.id}</div>
                <div><span className="text-muted-foreground">来源：</span><Badge className={`text-xs px-1.5 py-0 ml-1 ${sourceLabels[d.source]?.color}`}>{sourceLabels[d.source]?.label}</Badge></div>
                <div><span className="text-muted-foreground">一级分类：</span>{d.category1}</div>
                <div><span className="text-muted-foreground">二级分类：</span>{d.category2}</div>
                <div><span className="text-muted-foreground">状态：</span>{d.status}</div>
                <div><span className="text-muted-foreground">创建时间：</span>{d.createdAt}</div>
              </div>
              <div className="text-sm mt-4"><span className="text-muted-foreground">策略描述：</span>{d.description}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {d.businessScenarios.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab2：关联配置 */}
        <TabsContent value="related">
          <Card>
            <CardHeader><CardTitle className="text-base">关联配置</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* 关联根因 */}
              <div>
                <div className="text-sm font-medium mb-2">关联根因（{d.relatedRootCauses.length}个）</div>
                <div className="space-y-2">
                  {d.relatedRootCauses.map(rc => (
                    <div key={rc.rootCauseId} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">{rc.rootCauseId}</Badge>
                        <span className="text-sm">{rc.rootCauseName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{rc.rootCauseCategory}</span>
                        <span className={strengthLabels[rc.strength]?.color}>{strengthLabels[rc.strength]?.label}关联</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* 关联指标 */}
              <div>
                <div className="text-sm font-medium mb-2">关联指标（{d.relatedIndicators.length}个）</div>
                <div className="space-y-2">
                  {d.relatedIndicators.map(ri => (
                    <div key={ri.indicatorId} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">{ri.indicatorId}</Badge>
                        <span className="text-sm">{ri.indicatorName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">期望方向：{ri.direction === 'up' ? '↑上升' : '↓下降'}</span>
                        <span>阈值：{formatThreshold(ri)}</span>
                        <span className={strengthLabels[ri.strength]?.color}>{strengthLabels[ri.strength]?.label}关联</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* 关联客群 */}
              <div>
                <div className="text-sm font-medium mb-2">关联客群（{d.relatedGroups.length}个）</div>
                <div className="space-y-2">
                  {d.relatedGroups.map(g => (
                    <div key={g.groupId} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">{g.groupId}</Badge>
                        <span className="text-sm">{g.groupName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">规模：{g.groupScale}</span>
                        <span className={strengthLabels[g.strength]?.color}>{strengthLabels[g.strength]?.label}关联</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab3：产品/方案 */}
        <TabsContent value="product">
          <Card>
            <CardHeader><CardTitle className="text-base">推荐产品/方案</CardTitle></CardHeader>
            <CardContent>
              {d.products.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无推荐产品</div>
              ) : (
                <div className="space-y-2">
                  {d.products.map(p => (
                    <div key={p.productCode} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.productName}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0 font-mono">{p.productCode}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{p.productDescription}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab4：渠道适配 */}
        <TabsContent value="channel">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">渠道适配</CardTitle>
                <Badge variant="secondary" className="text-xs">渠道优先级用于调度执行时的渠道选择顺序</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {d.channels.map((ch, i) => (
                  <div key={i} className="flex items-center gap-4 border rounded-lg p-3">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 font-semibold">P{ch.priority}</Badge>
                    <span className="text-sm font-medium">{ch.channel}</span>
                    <span className="text-sm text-muted-foreground">触达时段：{ch.timeSlot}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

{/* Tab5：营销话术 */}
        <TabsContent value="script">
          <Card>
            <CardHeader><CardTitle className="text-base">营销话术</CardTitle></CardHeader>
            <CardContent>
              {d.scripts.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无营销话术</div>
              ) : (
                <div className="space-y-2">
                  {d.scripts.map((s, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0">{s.channel}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{s.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab6：运行数据 */}
        <TabsContent value="runtime">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">运行数据</CardTitle>
                <Badge variant="secondary" className="text-xs">只读 · 由执行数据自动回写</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {d.confidence !== null ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">引用率</div>
                      <div className="text-2xl font-semibold">35%</div>
                      <div className="text-xs text-gray-400 mt-1">调度单引用 35次 / 推荐 100次（近3个月）</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">转化率（加权）</div>
                      <div className="text-2xl font-semibold">{d.weightedConversion}</div>
                      <div className="text-xs text-gray-400 mt-1">基于3个已执行完成的调度单计算 · 按触达成功客户数加权</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">置信度</div>
                      <div className="text-2xl font-semibold">0.329</div>
                      <div className="text-xs text-gray-400 mt-1">转化率×0.70 + 引用率×0.15 + 来源权重×0.15</div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="text-xs font-medium text-muted-foreground">引用率</div>
                    <div className="flex justify-between"><span className="text-muted-foreground">计算公式</span><span>引用率 = 调度单引用次数 / 推荐次数</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">推荐次数</span><span>100 次（从策略库推荐该策略的次数（能够用于调度的策略））</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">调度单引用次数</span><span className="text-blue-600 font-medium">35 次（运营人员选中并创建调度单的次数）</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">统计周期</span><span>近3个月（滚动窗口）</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">数据来源</span><span>分母：指标监测引擎推荐统计；分子：调度统计</span></div>

                    <div className="border-t pt-2 mt-2 text-xs font-medium text-muted-foreground">转化率（加权）</div>
                    <div className="flex justify-between"><span className="text-muted-foreground">单调度单转化率</span><span>业务办理成功客户数 / 触达成功客户数</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">加权公式</span><span>加权转化率 = Σ(调度单转化率×触达成功客户数) / Σ(触达成功客户数)</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">业务办理成功客户数</span><span>完成业务办理（订购/续约/升档/激活等）的客户数</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">触达成功客户数</span><span>渠道执行后成功触达的客户数，由调度执行系统统计</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">当前加权平均转化率</span><span className="font-medium">{d.weightedConversion}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">已完成调度单</span><span className="font-medium">{d.dispatchCount} 个（共35个引用，其中{d.dispatchCount}个已完成）</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">统计周期</span><span>近3个月（滚动窗口）</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">口径说明</span><span>仅统计已完成且有触达结果的调度单，进行中的不纳入计算</span></div>

                    <div className="border-t pt-2 mt-2 text-xs font-medium text-muted-foreground">置信度</div>
                    <div className="flex justify-between"><span className="text-muted-foreground">计算公式</span><span>置信度 = 转化率×0.70 + 引用率×0.15 + 来源权重×0.15</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">当前计算</span><span>0.042×0.70 + 0.35×0.15 + 1.0×0.15 = 0.329</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">来源权重</span><span>专家经验=1.0、AI生成=0.75（当前：专家经验→1.0）</span></div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>引用率度量运营人员是否选用该策略，转化率度量策略执行后的业务效果。两者共同决定置信度：转化率是主因子（70%），引用率是辅因子（15%），来源权重占15%（专家经验比AI生成更可靠）。统计周期：近3个月滚动窗口。转化率仅基于已完成且有触达结果的调度单计算，引用率统计所有调度单（含进行中和已完成）。不同类型策略转化率量级不同，列表页按策略类型筛选后排序即可。</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无运行数据</p>
                  <p className="text-xs mt-1">该策略尚未被系统推荐，运行数据将在首次推荐后开始计算</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab7：使用记录 */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">使用记录（调度单引用）</CardTitle>
                <span className="text-xs text-muted-foreground">共 {d.dispatchRecords.length} 条</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>展示该策略被调度单引用的执行效果。触达客户数和业务办理成功客户数仅对已完成调度单展示，转化率=业务办理成功客户数/触达客户数，与运行数据Tab加权转化率的单条口径一致。</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-2 font-medium">调度单</th>
                    <th className="text-left py-2 font-medium">日期</th>
                    <th className="text-center py-2 font-medium">状态</th>
                    <th className="text-right py-2 font-medium">触达客户数</th>
                    <th className="text-right py-2 font-medium">业务办理成功客户数</th>
                    <th className="text-right py-2 font-medium">转化率</th>
                  </tr>
                </thead>
                <tbody>
                  {d.dispatchRecords.map((r) => {
                    const statusColorMap: Record<string, string> = {
                      '进行中': 'bg-blue-100 text-blue-700',
                      '已完成': 'bg-green-100 text-green-700',
                    };
                    return (
                      <tr key={r.id} className="border-b last:border-b-0">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{r.id}</Badge>
                            <span className="text-sm">{r.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{r.date}</td>
                        <td className="py-2.5 text-center">
                          <Badge className={`text-xs px-1.5 py-0 ${statusColorMap[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</Badge>
                        </td>
                        <td className="py-2.5 text-right font-mono">{r.reachCount !== null ? r.reachCount.toLocaleString() : <span className="text-muted-foreground">-</span>}</td>
                        <td className="py-2.5 text-right font-mono">{r.successCount !== null ? r.successCount.toLocaleString() : <span className="text-muted-foreground">-</span>}</td>
                        <td className="py-2.5 text-right">
                          {r.conversionRate !== null ? (
                            <span className="text-green-600 font-medium">{r.conversionRate}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-xs text-muted-foreground mt-2">
                数据来源：触达客户数由调度执行系统统计；业务办理成功客户数由业务办理系统回传
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
