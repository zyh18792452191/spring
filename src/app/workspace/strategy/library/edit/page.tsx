'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import IndicatorSelector, { type IndicatorItem } from '@/components/IndicatorSelector';
import CustomerGroupSelector, { type CustomerGroupItem } from '@/components/CustomerGroupSelector';
import RootCauseSelector, { type RootCauseItem } from '@/components/RootCauseSelector';
import ProductSelector, { type ProductItem } from '@/components/ProductSelector';

const strategyCategoryTree: Record<string, string[]> = {
  '套餐优化类': ['套餐升迁', '套餐降档挽留', '套餐适配'],
  '流量运营类': ['流量提醒', '流量包推荐', '流量满意度提升'],
  '价值提升类': ['增值业务推荐', '权益包推荐', '融合业务推荐'],
  '维系挽留类': ['到期续约', '携转预警挽留', '沉默客户唤醒'],
  '体验提升类': ['5G体验优化', '网络质量改善', '服务体验优化'],
  '新客拓展类': ['新入网引导', '第二卡槽争夺', '家庭客户拓展'],
};

const businessScenarios = ['流量运营', '离网维系', '家庭运营', '中高端客户运营', '增量运营', '校园运营', '国际业务运营'];

const channelOptions = ['外呼', '短信', 'APP弹窗', '营业厅', '微信', '装维触点', '线上渠道'];

const operatorOptions = [
  { value: 'none', label: '不限' },
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
];

const unitOptions = ['%', '万', '个', '次', '元', '户'];

interface RelatedIndicator {
  indicatorId: string; indicatorName: string; direction: string;
  lowerOperator: string; lowerValue: string; lowerUnit: string;
  upperOperator: string; upperValue: string; upperUnit: string;
  strength: number;
}

interface RelatedGroup { groupId: string; groupName: string; groupScale: string | number; strength: number; }
interface RelatedRootCause { rootCauseId: string; rootCauseName: string; rootCauseCategory: string; strength: number; }
interface Product { productId: string; productCode: string; productName: string; productDescription: string; }
interface Script { name: string; channel: string; content: string; }
interface Channel { channel: string; priority: number; timeSlot: string; }

// Mock data for editing
const mockEditData = {
  id: 'STR-001',
  name: '套餐升迁推荐（高流量低资费档位）',
  source: 'expert',
  category1: '套餐优化类',
  category2: '套餐升迁',
  description: '针对流量超套或DOU持续增长的客户，推荐更高流量档位套餐，提升ARPU的同时改善客户体验',
  businessScenarios: ['流量运营', '中高端客户运营'],
  status: '上架',
  relatedRootCauses: [
    { rootCauseId: 'RC-001', rootCauseName: '套餐流量容量不足', rootCauseCategory: '产品与套餐因素', strength: 3 },
  ] as RelatedRootCause[],
  relatedIndicators: [
    { indicatorId: 'IND-001', indicatorName: '降档客户数', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', strength: 3 },
    { indicatorId: 'IND-002', indicatorName: 'ARPU值', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 2 },
  ] as RelatedIndicator[],
  relatedGroups: [
    { groupId: 'CG-001', groupName: '高流量低资费客户', groupScale: '15.6万', strength: 3 },
    { groupId: 'CG-002', groupName: '流量超套客户', groupScale: '8.2万', strength: 2 },
  ] as RelatedGroup[],
  products: [
    { productId: 'p1', productCode: 'PROD-5G-199', productName: '5G畅享199套餐', productDescription: '含60GB流量+1000分钟通话，适合中高端客户' },
    { productId: 'p2', productCode: 'PROD-5G-129', productName: '5G畅享129套餐', productDescription: '含30GB流量+500分钟通话，适合流量增长型客户' },
  ] as Product[],
  scripts: [
    { name: '通用升迁话术', channel: '外呼', content: '您好，注意到您近期流量使用较多，推荐您升级至XX套餐，流量更充足，使用更安心...' },
    { name: '青年版话术', channel: '短信', content: '嗨，流量不够用了吧？升级XX套餐，追剧打游戏再也不用担心流量不够...' },
  ] as Script[],
  channels: [
    { channel: '外呼', priority: 1, timeSlot: '09:00-20:00' },
    { channel: '短信', priority: 2, timeSlot: '10:00-18:00' },
    { channel: 'APP弹窗', priority: 3, timeSlot: '全天' },
  ] as Channel[],
};

export default function StrategyEditPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">加载中...</div>}>
      <StrategyEditPage />
    </Suspense>
  );
}

function StrategyEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isNew = !editId;

  // Layer 1: Basic Info
  const [name, setName] = useState('');
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const [description, setDescription] = useState('');

  const [businessScenariosValue, setBusinessScenariosValue] = useState<string[]>([]);
  const [status, setStatus] = useState('下架');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Layer 1.5: Related Config
  const [relatedRootCauses, setRelatedRootCauses] = useState<RelatedRootCause[]>([]);
  const [relatedIndicators, setRelatedIndicators] = useState<RelatedIndicator[]>([]);
  const [relatedGroups, setRelatedGroups] = useState<RelatedGroup[]>([]);
  const [indicatorSelectorOpen, setIndicatorSelectorOpen] = useState(false);
  const [groupSelectorOpen, setGroupSelectorOpen] = useState(false);
  const [rootCauseSelectorOpen, setRootCauseSelectorOpen] = useState(false);

  // Layer 2: Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);

  // Layer 3: Scripts
  const [scripts, setScripts] = useState<Script[]>([]);

  // Layer 4: Channels
  const [channels, setChannels] = useState<Channel[]>([]);




  // Selector state for indicator threshold editing
  const [editingIndicatorIdx, setEditingIndicatorIdx] = useState<number | null>(null);

  useEffect(() => {
    if (editId) {
      const d = mockEditData;
      setName(d.name);
      setCategory1(d.category1);
      setCategory2(d.category2);
      setDescription(d.description);
      setBusinessScenariosValue(d.businessScenarios);
      setStatus(d.status);
      setValidFrom('2026-04-18');
      setValidUntil('2026-10-18');
      setRelatedRootCauses(d.relatedRootCauses);
      setRelatedIndicators(d.relatedIndicators);
      setRelatedGroups(d.relatedGroups);
      setProducts(d.products);
      setScripts(d.scripts);
      setChannels(d.channels);

    }
  }, [editId]);

  const handleSave = () => {
    router.push('/workspace/strategy/library');
  };

  const handlePublish = () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('策略名称不能为空');
    if (!description.trim()) errors.push('策略描述不能为空');
    if (relatedRootCauses.length === 0) errors.push('至少关联1个根因');
    if (products.length === 0) errors.push('至少配置1个推荐产品');
    if (errors.length > 0) {
      alert('上架条件不满足：\n' + errors.join('\n'));
      return;
    }
    setStatus('上架');
    alert('上架成功！（Mock）');
    router.push('/workspace/strategy/library');
  };

  const handleUnpublish = () => {
    setStatus('下架');
    alert('已下架（Mock）');
  };

  const toggleBusinessScenario = (scenario: string) => {
    setBusinessScenariosValue((prev) =>
      prev.includes(scenario) ? prev.filter((s) => s !== scenario) : [...prev, scenario]
    );
  };

  const updateIndicatorThreshold = (idx: number, field: string, value: string) => {
    setRelatedIndicators((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
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
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-lg font-semibold">{isNew ? '新增策略' : '编辑策略'}</h1>
          {!isNew && <Badge variant="outline" className="font-mono text-xs">{editId}</Badge>}
          {!isNew && <Badge variant={status === '上架' ? 'default' : 'secondary'}>{status}</Badge>}
        </div>
        <div className="flex gap-2">
          {!isNew && status === '下架' && (
            <Button size="sm" onClick={handlePublish}>上架</Button>
          )}
          {!isNew && status === '上架' && (
            <Button variant="outline" size="sm" onClick={handleUnpublish}>下架</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/workspace/strategy/library')}>取消</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}><Save className="w-3.5 h-3.5" />保存</Button>
        </div>
      </div>

      <Tabs defaultValue="layer1" className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="layer1" className="text-xs">基础信息</TabsTrigger>
          <TabsTrigger value="layer1_5" className="text-xs">关联配置</TabsTrigger>
          <TabsTrigger value="layer2" className="text-xs">产品/方案</TabsTrigger>
          <TabsTrigger value="layer3" className="text-xs">渠道适配</TabsTrigger>
          <TabsTrigger value="layer4" className="text-xs">营销话术</TabsTrigger>
        </TabsList>

        {/* Layer 1: Basic Info */}
        <TabsContent value="layer1">
          <Card>
            <CardHeader><CardTitle className="text-base">基础信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>策略名称 <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入策略名称" />
                </div>
                <div className="space-y-1.5">
                  <Label>来源</Label>
                  <Input value={isNew ? '专家经验' : (mockEditData.source === 'expert' ? '专家经验' : 'AI生成')} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400">来源由系统自动标记，不可手动修改</p>
                </div>
                <div className="space-y-1.5">
                  <Label>一级分类 <span className="text-red-500">*</span></Label>
                  <Select value={category1} onValueChange={(v) => { setCategory1(v); setCategory2(''); }}>
                    <SelectTrigger><SelectValue placeholder="选择一级分类" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(strategyCategoryTree).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>二级分类 <span className="text-red-500">*</span></Label>
                  <Select value={category2} onValueChange={setCategory2} disabled={!category1}>
                    <SelectTrigger><SelectValue placeholder="选择二级分类" /></SelectTrigger>
                    <SelectContent>
                      {category1 && strategyCategoryTree[category1]?.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>策略描述 <span className="text-red-500">*</span></Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述策略的目标、适用场景和预期效果" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>业务场景 <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 flex-wrap">
                  {businessScenarios.map((s) => (
                    <Badge
                      key={s}
                      variant={businessScenariosValue.includes(s) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleBusinessScenario(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>状态</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="下架">下架</SelectItem>
                      <SelectItem value="上架">上架</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>有效期</Label>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={validFrom} disabled className="bg-gray-50 flex-1" />
                    <span className="text-gray-400 text-sm">~</span>
                    <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="flex-1" min={validFrom} />
                  </div>
                  <p className="text-xs text-gray-400">
                    生效日期为上架日期自动填充，失效日期最长不超过生效日期+12个月
                  </p>
                </div>
              </div>
              {!isNew && (
                <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">运行数据（只读，由系统自动回写）</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">引用率 · 近3个月</div>
                      <div className="text-lg font-semibold">35%</div>
                      <div className="text-xs text-muted-foreground mt-1">= 调度单引用次数 / 推荐次数</div>
                      <div className="text-xs text-muted-foreground">= 35 / 100</div>
                    </div>
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">转化率（加权）· 近3个月</div>
                      <div className="text-lg font-semibold">4.2%</div>
                      <div className="text-xs text-muted-foreground mt-1">业务办理成功客户数 / 触达成功客户数</div>
                      <div className="text-xs text-muted-foreground">已完成调度单：3个（共35个引用，其中3个已完成）</div>
                      <div className="text-xs text-muted-foreground">加权 = Σ(转化率×触达成功客户数)/Σ(触达成功客户数)</div>
                    </div>
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">置信度 · 近3个月</div>
                      <div className="text-lg font-semibold">0.329</div>
                      <div className="text-xs text-muted-foreground mt-1">= 转化率×0.70 + 引用率×0.15 + 来源权重×0.15</div>
                      <div className="text-xs text-muted-foreground">= 0.042×0.70 + 0.35×0.15 + 1.0×0.15</div>
                      <div className="text-xs text-blue-500 mt-1">来源权重：专家经验=1.0，AI生成=0.75 · 当前：专家经验→1.0</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layer 1.5: Related Config */}
        <TabsContent value="layer1_5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">关联配置</CardTitle>
                <span className="text-xs text-gray-400">策略通过关联根因、指标、客群建立推理链路</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Related Root Causes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">关联根因</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setRootCauseSelectorOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" />选择根因
                  </Button>
                </div>
                {relatedRootCauses.length === 0 ? (
                  <div className="text-sm text-gray-400 border rounded-lg p-4 text-center">暂未关联根因，点击上方按钮选择</div>
                ) : (
                  <div className="space-y-2">
                    {relatedRootCauses.map((rc, idx) => (
                      <div key={rc.rootCauseId} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{rc.rootCauseId}</Badge>
                          <span className="text-sm font-medium">{rc.rootCauseName}</span>
                          <Badge variant="outline" className="text-xs">{rc.rootCauseCategory}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={String(rc.strength)} onValueChange={(v) => {
                            setRelatedRootCauses((prev) => { const u = [...prev]; u[idx] = { ...u[idx], strength: Number(v) }; return u; });
                          }}>
                            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1级（弱）</SelectItem>
                              <SelectItem value="2">2级（中）</SelectItem>
                              <SelectItem value="3">3级（强）</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRelatedRootCauses((prev) => prev.filter((_, i) => i !== idx))}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Related Indicators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">关联指标</Label>
                    <span className="text-xs text-gray-400">含适用阈值范围，用于AI精准匹配</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIndicatorSelectorOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" />选择指标
                  </Button>
                </div>
                {relatedIndicators.length === 0 ? (
                  <div className="text-sm text-gray-400 border rounded-lg p-4 text-center">暂未关联指标，点击上方按钮选择</div>
                ) : (
                  <div className="space-y-3">
                    {relatedIndicators.map((ri, idx) => (
                      <div key={ri.indicatorId} className="border rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{ri.indicatorId}</Badge>
                            <span className="text-sm font-medium">{ri.indicatorName}</span>
                            <Select value={ri.direction} onValueChange={(v) => updateIndicatorThreshold(idx, 'direction', v)}>
                              <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">↑ 上升</SelectItem>
                                <SelectItem value="down">↓ 下降</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRelatedIndicators((prev) => prev.filter((_, i) => i !== idx))}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20 shrink-0">适用阈值范围</span>
                          <div className="flex items-center gap-1.5">
                            <Select value={ri.lowerOperator} onValueChange={(v) => updateIndicatorThreshold(idx, 'lowerOperator', v)}>
                              <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {operatorOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                              </SelectContent>
                            </Select>
                            <Input value={ri.lowerValue} onChange={(e) => updateIndicatorThreshold(idx, 'lowerValue', e.target.value)} className="w-16 h-7 text-xs" placeholder="数值" />
                            <Select value={ri.lowerUnit} onValueChange={(v) => updateIndicatorThreshold(idx, 'lowerUnit', v)}>
                              <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {unitOptions.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="text-xs text-gray-400">且</span>
                          <div className="flex items-center gap-1.5">
                            <Select value={ri.upperOperator} onValueChange={(v) => updateIndicatorThreshold(idx, 'upperOperator', v)}>
                              <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {operatorOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                              </SelectContent>
                            </Select>
                            <Input value={ri.upperValue} onChange={(e) => updateIndicatorThreshold(idx, 'upperValue', e.target.value)} className="w-16 h-7 text-xs" placeholder="数值" />
                            <Select value={ri.upperUnit} onValueChange={(v) => updateIndicatorThreshold(idx, 'upperUnit', v)}>
                              <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {unitOptions.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20 shrink-0">关联强度</span>
                          <Select value={String(ri.strength)} onValueChange={(v) => updateIndicatorThreshold(idx, 'strength', v)}>
                            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1级（弱）</SelectItem>
                              <SelectItem value="2">2级（中）</SelectItem>
                              <SelectItem value="3">3级（强）</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-gray-400">用于AI推荐排序，初期人工设定，后期AI调整</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Related Groups */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">关联客群</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setGroupSelectorOpen(true)}>
                    <Plus className="w-3 h-3 mr-1" />选择客群
                  </Button>
                </div>
                {relatedGroups.length === 0 ? (
                  <div className="text-sm text-gray-400 border rounded-lg p-4 text-center">暂未关联客群，点击上方按钮选择</div>
                ) : (
                  <div className="space-y-2">
                    {relatedGroups.map((rg, idx) => (
                      <div key={rg.groupId} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{rg.groupId}</Badge>
                          <span className="text-sm font-medium">{rg.groupName}</span>
                          <span className="text-xs text-gray-400">规模: {rg.groupScale}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={String(rg.strength)} onValueChange={(v) => {
                            setRelatedGroups((prev) => { const u = [...prev]; u[idx] = { ...u[idx], strength: Number(v) }; return u; });
                          }}>
                            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1级（弱）</SelectItem>
                              <SelectItem value="2">2级（中）</SelectItem>
                              <SelectItem value="3">3级（强）</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRelatedGroups((prev) => prev.filter((_, i) => i !== idx))}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layer 2: Products */}
        <TabsContent value="layer2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">推荐产品/方案</CardTitle>
                <span className="text-xs text-gray-400">从产品目录中选择，自动回填产品编码和名称</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setProductSelectorOpen(true)}>
                <Plus className="w-3 h-3 mr-1" />从产品目录选择
              </Button>
              {products.length === 0 ? (
                <div className="text-sm text-gray-400 border rounded-lg p-4 text-center">暂无推荐产品，点击上方按钮从产品目录选择</div>
              ) : (
                <div className="space-y-2">
                  {products.map((p, idx) => (
                    <div key={p.productId} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{p.productCode}</Badge>
                          <span className="text-sm font-medium">{p.productName}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setProducts((prev) => prev.filter((_, i) => i !== idx))}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input value={p.productDescription} onChange={(e) => {
                        setProducts((prev) => { const u = [...prev]; u[idx] = { ...u[idx], productDescription: e.target.value }; return u; });
                      }} className="text-sm h-8" placeholder="产品描述（从产品目录自动回填，可修改）" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layer 3: Channels */}
        <TabsContent value="layer3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">渠道适配</CardTitle>
                <span className="text-xs text-gray-400">优先级用于调度执行时的渠道选择顺序和资源分配，P1为最高优先级</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                setChannels((prev) => [...prev, { channel: '', priority: prev.length + 1, timeSlot: '' }]);
              }}>
                <Plus className="w-3 h-3" />添加渠道
              </Button>
              {channels.map((ch, idx) => (
                <div key={idx} className="flex items-center gap-3 border rounded-lg p-3">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 shrink-0">P{ch.priority}</Badge>
                  <Select value={ch.channel} onValueChange={(v) => {
                    setChannels((prev) => { const u = [...prev]; u[idx] = { ...u[idx], channel: v }; return u; });
                  }}>
                    <SelectTrigger className="w-28 h-7 text-xs"><SelectValue placeholder="选择渠道" /></SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Input value={ch.timeSlot} onChange={(e) => {
                    setChannels((prev) => { const u = [...prev]; u[idx] = { ...u[idx], timeSlot: e.target.value }; return u; });
                  }} className="w-32 h-7 text-xs" placeholder="时段（如09:00-20:00）" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setChannels((prev) => prev.filter((_, i) => i !== idx))}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

{/* Layer 4: Scripts */}
        <TabsContent value="layer4">
          <Card>
            <CardHeader><CardTitle className="text-base">营销话术</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                setScripts((prev) => [...prev, { name: '', channel: '外呼', content: '' }]);
              }}>
                <Plus className="w-3 h-3" />添加话术
              </Button>
              {scripts.map((s, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={s.name} onChange={(e) => {
                        setScripts((prev) => { const u = [...prev]; u[idx] = { ...u[idx], name: e.target.value }; return u; });
                      }} className="h-7 text-sm w-40" placeholder="话术名称" />
                      <Select value={s.channel} onValueChange={(val: string) => {
                        setScripts((prev) => { const u = [...prev]; u[idx] = { ...u[idx], channel: val }; return u; });
                      }}>
                        <SelectTrigger className="h-7 text-sm w-28"><SelectValue placeholder="适用渠道" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="外呼">外呼</SelectItem>
                          <SelectItem value="短信">短信</SelectItem>
                          <SelectItem value="APP弹窗">APP弹窗</SelectItem>
                          <SelectItem value="微信">微信</SelectItem>
                          <SelectItem value="营业厅">营业厅</SelectItem>
                          <SelectItem value="手网">手网</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-gray-400">支持{'{变量}'}模板，执行时自动替换</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScripts((prev) => prev.filter((_, i) => i !== idx))}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Textarea value={s.content} onChange={(e) => {
                    setScripts((prev) => { const u = [...prev]; u[idx] = { ...u[idx], content: e.target.value }; return u; });
                  }} placeholder="话术内容" rows={3} className="text-sm" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Selectors */}
      <IndicatorSelector
        open={indicatorSelectorOpen}
        onOpenChange={setIndicatorSelectorOpen}
        onConfirm={(indicators: IndicatorItem[]) => {
          setRelatedIndicators((prev) => [
            ...prev,
            ...indicators.map((ind: IndicatorItem) => ({
              indicatorId: ind.id,
              indicatorName: ind.name,
              direction: 'up',
              lowerOperator: 'none',
              lowerValue: '',
              lowerUnit: '%',
              upperOperator: 'none',
              upperValue: '',
              upperUnit: '%',
              strength: 2,
            })),
          ]);
          setIndicatorSelectorOpen(false);
        }}
        selectedIds={relatedIndicators.map((ri) => ri.indicatorId)}
      />
      <CustomerGroupSelector
        open={groupSelectorOpen}
        onOpenChange={setGroupSelectorOpen}
        onConfirm={(groups: CustomerGroupItem[]) => {
          setRelatedGroups((prev) => [
            ...prev,
            ...groups.map((g: CustomerGroupItem) => ({
              groupId: g.id,
              groupName: g.name,
              groupScale: '-',
              strength: 2,
            })),
          ]);
          setGroupSelectorOpen(false);
        }}
        selectedIds={relatedGroups.map((rg) => rg.groupId)}
      />
      <RootCauseSelector
        open={rootCauseSelectorOpen}
        onOpenChange={setRootCauseSelectorOpen}
        onConfirm={(rootCauses: RootCauseItem[]) => {
          setRelatedRootCauses((prev) => [
            ...prev,
            ...rootCauses.map((rc: RootCauseItem) => ({
              rootCauseId: rc.id,
              rootCauseName: rc.name,
              rootCauseCategory: rc.category,
              strength: 2,
            })),
          ]);
          setRootCauseSelectorOpen(false);
        }}
        selectedIds={relatedRootCauses.map((rc) => rc.rootCauseId)}
      />
      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        onConfirm={(prods: ProductItem[]) => {
          setProducts((prev) => [
            ...prev,
            ...prods.map((p: ProductItem) => ({
              productId: p.id,
              productCode: p.code,
              productName: p.name,
              productDescription: p.description,
            })),
          ]);
          setProductSelectorOpen(false);
        }}
        selectedIds={products.map((p) => p.productId)}
      />
    </div>
  );
}
