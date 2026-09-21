'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface RootCauseDetail {
  id: string;
  name: string;
  source: string;
  category1: string;
  category2: string;
  description: string;
  businessScenarios: string[];
  status: string;
  confidence: number | null;
  referenceRate: number | null;
  matchRate: number | null;
  createdAt: string;
  relatedIndicators: {
    indicatorId: string; indicatorName: string; direction: string;
    lowerOperator: string; lowerValue: string; lowerUnit: string;
    upperOperator: string; upperValue: string; upperUnit: string;
    strength: number;
  }[];
  relatedGroups: {
    groupId: string; groupName: string; groupScale: string; strength: number;
  }[];
  dispatchRecords: {
    id: string; name: string; date: string; status: string;
  }[];
}

const mockDetail: RootCauseDetail = {
  id: 'RC-001',
  name: '竞品资费低于本网同档位',
  source: 'expert',
  category1: '价格与竞争因素',
  category2: '竞品资费优势',
  description: '当本网同档位资费高于竞品时，价格敏感客户倾向于降档或携转。该根因是降档客户数上升的主要原因之一，常见于竞品推出更优惠的同档套餐或降价促销期间。',
  businessScenarios: ['离网维系', '中高端客户运营'],
  status: '上架',
  confidence: 0.535,
  referenceRate: 0.10,
  matchRate: 0.60,
  createdAt: '2026-03-15',
  relatedIndicators: [
    { indicatorId: 'IND-001', indicatorName: '降档客户数', direction: 'up', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', strength: 3 },
    { indicatorId: 'IND-002', indicatorName: '携转查询量', direction: 'up', lowerOperator: '>=', lowerValue: '30', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 3 },
    { indicatorId: 'IND-003', indicatorName: 'ARPU值', direction: 'down', lowerOperator: '>', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 2 },
  ],
  relatedGroups: [
    { groupId: 'CG-001', groupName: '价格敏感无合约客户', groupScale: '12.8万', strength: 3 },
    { groupId: 'CG-002', groupName: '到期30天内未续约客户', groupScale: '8.5万', strength: 2 },
  ],
  dispatchRecords: [
    { id: 'COD-20260501-001', name: '5月降档客户维系调度', date: '2026-05-01', status: '进行中' },
    { id: 'COD-20260415-002', name: '竞品降价应急调度', date: '2026-04-15', status: '已完成' },
    { id: 'COD-20260320-003', name: 'Q1携转挽留调度', date: '2026-03-20', status: '已完成' },
  ],
};

function formatThreshold(ri: RootCauseDetail['relatedIndicators'][0]) {
  const parts: string[] = [];
  if (ri.lowerOperator !== 'none' && ri.lowerValue) {
    parts.push(`${ri.lowerOperator}${ri.lowerValue}${ri.lowerUnit}`);
  }
  if (ri.upperOperator !== 'none' && ri.upperValue) {
    parts.push(`${ri.upperOperator}${ri.upperValue}${ri.upperUnit}`);
  }
  return parts.length > 0 ? parts.join(' 且 ') : '不限';
}

const strengthLabels: Record<number, { label: string; color: string }> = {
  1: { label: '1级（弱）', color: 'bg-gray-100 text-gray-600' },
  2: { label: '2级（中）', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: '3级（强）', color: 'bg-red-100 text-red-700' },
};

export default function RootCauseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [detail, setDetail] = useState<RootCauseDetail>(mockDetail);
  const [matchRateMeaningExpanded, setMatchRateMeaningExpanded] = useState(false);

  const handlePublishToggle = () => {
    setDetail(prev => ({
      ...prev,
      status: prev.status === '上架' ? '下架' : '上架'
    }));
  };

  const statusColorMap: Record<string, string> = {
    '进行中': 'bg-blue-100 text-blue-700',
    '已完成': 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/strategy/root-cause')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回列表
          </Button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold">根因详情</h1>
          <Badge variant="outline" className="font-mono text-xs">{detail.id}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant={detail.status === '上架' ? 'destructive' : 'default'} className="gap-1.5">
                {detail.status === '上架' ? '下架' : '上架'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认{detail.status === '上架' ? '下架' : '上架'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {detail.status === '上架'
                    ? `下架后该根因将不再参与模型推荐，但已产生的调度单不受影响。确定要下架「${detail.name}」吗？`
                    : `上架后该根因将参与模型推荐。确定要上架「${detail.name}」吗？`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublishToggle}>确认</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" className="gap-1.5" onClick={() => router.push(`/workspace/strategy/root-cause/edit?id=${detail.id}`)}>
            <Pencil className="w-3.5 h-3.5" />
            编辑
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基础信息</TabsTrigger>
          <TabsTrigger value="indicator">关联指标</TabsTrigger>
          <TabsTrigger value="group">关联客群</TabsTrigger>
          <TabsTrigger value="confidence">运行数据</TabsTrigger>
          <TabsTrigger value="records">使用记录</TabsTrigger>
        </TabsList>

        {/* Tab1：基础信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader><CardTitle className="text-base">基础信息</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div><span className="text-sm text-gray-500">根因名称</span><div className="font-medium mt-1">{detail.name}</div></div>
                <div><span className="text-sm text-gray-500">来源</span><div className="mt-1"><Badge className={sourceLabels[detail.source]?.color}>{sourceLabels[detail.source]?.label}</Badge></div></div>
                <div><span className="text-sm text-gray-500">一级分类</span><div className="mt-1">{detail.category1}</div></div>
                <div><span className="text-sm text-gray-500">二级分类</span><div className="mt-1">{detail.category2}</div></div>
                <div><span className="text-sm text-gray-500">业务场景</span><div className="mt-1 flex gap-1 flex-wrap">{detail.businessScenarios.map((s) => <Badge key={s} variant="outline" className="bg-primary/5 text-xs">{s}</Badge>)}</div></div>
                <div><span className="text-sm text-gray-500">状态</span><div className="mt-1"><Badge variant={detail.status === '上架' ? 'default' : 'secondary'}>{detail.status}</Badge></div></div>
                <div><span className="text-sm text-gray-500">创建时间</span><div className="mt-1">{detail.createdAt}</div></div>

              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">描述</span>
                <div className="mt-1 text-sm leading-relaxed">{detail.description}</div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab2：关联指标 */}
        <TabsContent value="indicator">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">关联指标</CardTitle>
                <span className="text-xs text-gray-400">共 {detail.relatedIndicators.length} 个</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.relatedIndicators.map((ri) => (
                <div key={ri.indicatorId} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{ri.indicatorId}</Badge>
                    <span className="font-medium text-sm">{ri.indicatorName}</span>
                    <Badge variant="outline" className={`text-xs ${ri.direction === 'up' ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}>
                      {ri.direction === 'up' ? '↑ 上升' : '↓ 下降'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">适用阈值范围：</span>
                      <span className="font-mono">{formatThreshold(ri)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">关联强度：</span>
                      <Badge className={strengthLabels[ri.strength]?.color}>{strengthLabels[ri.strength]?.label}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab3：关联客群 */}
        <TabsContent value="group">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">关联客群</CardTitle>
                <span className="text-xs text-gray-400">共 {detail.relatedGroups.length} 个</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.relatedGroups.map((rg) => (
                <div key={rg.groupId} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">{rg.groupId}</Badge>
                    <span className="font-medium text-sm">{rg.groupName}</span>
                    <span className="text-xs text-gray-400">规模: {rg.groupScale}</span>
                  </div>
                  <Badge className={strengthLabels[rg.strength]?.color}>{strengthLabels[rg.strength]?.label}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab4：运行数据 */}
        <TabsContent value="confidence">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">运行数据</CardTitle>
                <Badge variant="secondary" className="text-xs">只读 · 由执行数据自动回写</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.confidence !== null ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">引用率</div>
                      <div className="text-2xl font-semibold">10%</div>
                      <div className="text-xs text-gray-400 mt-1">调度单引用 10次 / 推荐 100次</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">匹配率</div>
                      <div className="text-2xl font-semibold">66.7%</div>
                      <div className="text-xs text-gray-400 mt-1">关联指标匹配率（近3个月100次推荐）</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">置信度</div>
                      <div className="text-2xl font-semibold">0.575</div>
                      <div className="text-xs text-gray-400 mt-1">匹配率×0.60 + 引用率×0.25 + 来源权重×0.15</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="text-xs font-medium text-gray-600 mb-2">引用率</div>
                    <div className="flex justify-between"><span className="text-gray-500">计算公式</span><span>引用率 = 调度单引用次数 / 模型推荐次数</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">模型推荐次数</span><span>100 次（从根因库模型推荐该根因的次数（能够用于调度的问题指标原因））</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">调度单引用次数</span><span className="text-blue-600 font-medium">10 次（运营人员选中并创建调度单的次数）</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">统计周期</span><span>近3个月（滚动窗口）</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">数据来源</span><span>分母：指标监测引擎推荐统计；分子：调度统计</span></div>

                    <div className="border-t pt-2 mt-2 text-xs font-medium text-gray-600">匹配率</div>
                    <div className="flex justify-between"><span className="text-gray-500">计算公式</span><span>匹配率 = 所有推荐的匹配值求平均（每次匹配值 = 匹配指标数 / 总关联指标数）</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">匹配规则</span><span>每次推荐时，逐一判断所有关联指标是否匹配（见下方条件），匹配的指标数占总关联指标数的比例即为该次匹配值，所有推荐的匹配值求平均即为匹配率</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">单指标匹配条件</span><span>①方向一致：实际环比方向与配置的异常方向一致 ②幅度在区间：change_min ≤ 实际环比幅度 ≤ change_max</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">取值口径</span><span>该指标在推荐区域、推荐时点的环比变化幅度，由指标底座提供</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">举例（3个关联指标）</span><span>第1次推荐匹配2/3，第2次匹配3/3，第3次匹配1/3 → 匹配率=(2/3+3/3+1/3)/3=66.7%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">统计周期</span><span>近3个月滚动窗口</span></div>

                    {/* 匹配率的业务含义 */}
                    <div className="border-t pt-2 mt-2">
                      <div
                        className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => setMatchRateMeaningExpanded(!matchRateMeaningExpanded)}
                      >
                        {matchRateMeaningExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        匹配率的业务含义
                      </div>
                      {!matchRateMeaningExpanded && (
                        <p className="text-xs text-gray-500 mt-1 pl-5">根因关联多个指标是在声明"如果我是真因，这些异常应该同时出现"，匹配率度量声明的吻合程度</p>
                      )}
                      {matchRateMeaningExpanded && (
                        <div className="mt-2 pl-5 space-y-3 text-xs text-gray-600">
                          <div className="border-l-2 border-blue-300 pl-3 py-1">
                            <p className="font-medium text-gray-700">核心逻辑</p>
                            <p className="mt-1">根因关联多个指标，是在声明"如果我是真因，这些异常应该同时出现"。匹配率检查的就是这个声明与实际情况的吻合程度，吻合度越高，该根因越可能是真因。</p>
                          </div>
                          <div className="border-l-2 border-amber-300 pl-3 py-1">
                            <p className="font-medium text-gray-700">为什么需要检查非触发指标？</p>
                            <p className="mt-1">同一异常可能触发多条候选根因，仅凭触发指标区分不了谁是真因。但每条根因预言的关联异常不同——如果某条根因是真正原因，它预言的其他异常也应该出现；如果没出现，说明这个根因可能不是真因。</p>
                          </div>
                          <div className="border-l-2 border-green-300 pl-3 py-1">
                            <p className="font-medium text-gray-700">举例（以当前根因为例）</p>
                            <div className="mt-1.5 space-y-1.5">
                              <p><span className="text-gray-500">因果主张：</span>{detail.description.split('。')[0]}</p>
                              <p><span className="text-gray-500">预言的异常：</span>{detail.relatedIndicators.map(ri => `${ri.indicatorName}${ri.direction === 'up' ? '↑' : '↓'}`).join('、')}</p>
                              <p><span className="text-green-600">3个指标异常方向和幅度都吻合 → 匹配率高 → 该根因很可能是真因</span></p>
                              <p><span className="text-amber-600">部分指标不吻合（如{detail.relatedIndicators.length > 1 ? detail.relatedIndicators[1].indicatorName : '某指标'}没涨） → 匹配率低 → 客户在降档但没查携转，竞品可能不是驱动因素</span></p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-2 mt-2 text-xs font-medium text-gray-600">置信度</div>
                    <div className="flex justify-between"><span className="text-gray-500">计算公式</span><span>置信度 = 匹配率×0.60 + 引用率×0.25 + 来源权重×0.15</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">当前计算</span><span>0.667×0.60 + 0.10×0.25 + 1.0×0.15 = 0.575</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">统计周期</span><span>近3个月滚动窗口（随匹配率和引用率）</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">来源权重</span><span>专家经验=1.0、AI生成=0.75（当前：专家经验→1.0）</span></div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>引用率度量运营人员是否选用该根因，匹配率度量关联指标配置对实际异常模式的覆盖程度。两者共同决定置信度：匹配率是主因子（60%），引用率是辅因子（25%），来源权重占15%（专家经验比AI生成更可靠）。统计周期：近3个月滚动窗口。匹配率按每次模型推荐中匹配指标数占总关联指标数的比例取均值，避免关联指标多时匹配率天然偏低。</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无运行数据</p>
                  <p className="text-xs mt-1">该根因尚未被模型推荐，运行数据将在首次模型推荐后开始计算</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab5：使用记录 */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">使用记录（调度单引用）</CardTitle>
                <span className="text-xs text-gray-400">共 {detail.dispatchRecords.length} 条</span>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="text-left py-2 font-medium">调度单</th>
                    <th className="text-left py-2 font-medium">日期</th>
                    <th className="text-center py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.dispatchRecords.map((r) => {
                    const statusColors: Record<string, string> = {
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
                        <td className="py-2.5 text-gray-500">{r.date}</td>
                        <td className="py-2.5 text-center">
                          <Badge className={`text-xs px-1.5 py-0 ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
