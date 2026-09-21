'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  X,
  Info,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndicatorSelector, { type IndicatorItem } from '@/components/IndicatorSelector';
import CustomerGroupSelector, { type CustomerGroupItem } from '@/components/CustomerGroupSelector';

// 一级分类 → 二级分类
const categoryTree: Record<string, string[]> = {
  '网络与质量因素': ['网络覆盖不足', '网络质量下降', '网络容量不足'],
  '价格与竞争因素': ['竞品资费优势', '本网资费偏高', '优惠活动到期'],
  '产品与套餐因素': ['套餐流量容量不足', '套餐内容不匹配', '5G终端与套餐不匹配'],
  '服务与体验因素': ['服务响应不及时', '触点体验不佳', '投诉处理不满意'],
  '市场与政策因素': ['携转政策影响', '行业竞争加剧', '季节性波动'],
  '客户生命周期因素': ['合约到期未续约', '新手适应期问题', '沉默客户唤醒失败'],
};

// 业务场景选项
const businessScenarios = [
  '流量运营', '离网维系', '家庭运营', '中高端客户运营', '增量运营', '校园运营', '国际业务运营',
];

// 初始标签字典
// 关联指标 - 数值比较运算符
const numericOperatorOptions = [
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
];

// 关联指标 - 单位选项
const unitOptions = ['%', '个', '元', 'GB', 'MB', '分钟', '户'];



interface RelatedIndicator {
  id: string;
  indicatorId: string;
  indicatorName: string;
  direction: 'up' | 'down';
  lowerOperator: string;
  lowerValue: string;
  lowerUnit: string;
  upperOperator: string;
  upperValue: string;
  upperUnit: string;
  strength: number;
}

interface RelatedGroup {
  id: string;
  groupId: string;
  groupName: string;
  groupScale: string;
  strength: number;
}

export default function RootCauseEditPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">加载中...</div>}>
      <RootCauseEditPage />
    </Suspense>
  );
}

function RootCauseEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  // 基础信息
  const [name, setName] = useState('');
  const [source, setSource] = useState('expert');
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [status, setStatus] = useState('下架');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // 关联指标
  const [relatedIndicators, setRelatedIndicators] = useState<RelatedIndicator[]>([]);
  const [indicatorSelectorOpen, setIndicatorSelectorOpen] = useState(false);

  // 关联客群
  const [relatedGroups, setRelatedGroups] = useState<RelatedGroup[]>([]);
  const [groupSelectorOpen, setGroupSelectorOpen] = useState(false);

  // 编辑时加载mock数据
  useEffect(() => {
    if (isEdit && editId) {
      // mock data loading
      setName('竞品资费低于本网同档位');
      setSource('expert');
      setCategory1('价格与竞争因素');
      setCategory2('竞品资费优势');
      setDescription('当本网同档位资费高于竞品时，价格敏感客户倾向于降档或携转。该根因是降档客户数上升的主要原因之一。');
      setSelectedScenarios(['离网维系', '中高端客户运营']);
      setStatus('上架');
      setValidFrom('2026-04-15');
      setValidUntil('2026-10-15');
      setRelatedIndicators([
        { id: 'ri1', indicatorId: 'IND-001', indicatorName: '降档客户数', direction: 'up', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', strength: 3 },
        { id: 'ri2', indicatorId: 'IND-002', indicatorName: '携转查询量', direction: 'up', lowerOperator: '>=', lowerValue: '30', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 3 },
        { id: 'ri3', indicatorId: 'IND-003', indicatorName: 'ARPU值', direction: 'down', lowerOperator: '>', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', strength: 2 },
      ]);
      setRelatedGroups([
        { id: 'rg1', groupId: 'CG-001', groupName: '价格敏感无合约客户', groupScale: '12.8万', strength: 3 },
        { id: 'rg2', groupId: 'CG-002', groupName: '到期30天内未续约客户', groupScale: '8.5万', strength: 2 },
      ]);
    }
  }, [isEdit, editId]);

  const addIndicators = (indicators: IndicatorItem[]) => {
    const newItems = indicators.map((indicator) => ({
      id: `ri${Date.now()}_${indicator.id}`, indicatorId: indicator.id, indicatorName: indicator.name,
      direction: 'up' as const, lowerOperator: '>=', lowerValue: '', lowerUnit: '%', upperOperator: '<', upperValue: '', upperUnit: '%', strength: 2,
    }));
    setRelatedIndicators([...relatedIndicators, ...newItems]);
  };

  const removeIndicator = (id: string) => {
    setRelatedIndicators(relatedIndicators.filter((ri) => ri.id !== id));
  };

  const updateIndicator = (id: string, field: keyof RelatedIndicator, value: string | number) => {
    setRelatedIndicators(relatedIndicators.map((ri) => (ri.id === id ? { ...ri, [field]: value } : ri)));
  };

  const addGroups = (groups: CustomerGroupItem[]) => {
    const newItems = groups.map((group) => ({
      id: `rg${Date.now()}_${group.id}`, groupId: group.id, groupName: group.name, groupScale: '-', strength: 2,
    }));
    setRelatedGroups([...relatedGroups, ...newItems]);
  };

  const removeGroup = (id: string) => {
    setRelatedGroups(relatedGroups.filter((rg) => rg.id !== id));
  };

  const updateGroup = (id: string, field: keyof RelatedGroup, value: string | number) => {
    setRelatedGroups(relatedGroups.map((rg) => (rg.id === id ? { ...rg, [field]: value } : rg)));
  };

  const toggleScenario = (scenario: string) => {
    setSelectedScenarios((prev) => prev.includes(scenario) ? prev.filter((s) => s !== scenario) : [...prev, scenario]);
  };

  const formatThreshold = (ri: RelatedIndicator) => {
    const parts: string[] = [];
    if (ri.lowerOperator !== 'none' && ri.lowerValue) {
      parts.push(`${ri.lowerOperator}${ri.lowerValue}${ri.lowerUnit}`);
    }
    if (ri.upperOperator !== 'none' && ri.upperValue) {
      parts.push(`${ri.upperOperator}${ri.upperValue}${ri.upperUnit}`);
    }
    return parts.length > 0 ? parts.join(' 且 ') : '不限';
  };

  const handleSave = () => {
    // AI生成的根因被人工编辑保存后，来源自动变更为"专家经验"
    // 实际开发中需要记录修改历史
    alert('保存成功！（Mock）');
    router.push('/workspace/strategy/root-cause');
  };

  const handlePublish = () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('根因名称不能为空');
    if (!description.trim()) errors.push('根因描述不能为空');
    if (relatedIndicators.length === 0) errors.push('至少关联1个指标');
    if (errors.length > 0) {
      alert('上架条件不满足：\n' + errors.join('\n'));
      return;
    }
    setStatus('上架');
    alert('上架成功！（Mock）');
    router.push('/workspace/strategy/root-cause');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/strategy/root-cause')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回列表
        </Button>
        <div className="h-4 w-px bg-gray-300" />
        <h1 className="text-lg font-semibold">{isEdit ? '编辑根因' : '新增根因'}</h1>
        {isEdit && (
          <Badge variant={status === '上架' ? 'default' : 'secondary'}>{status}</Badge>
        )}
        {isEdit && source === 'ai_generated' && (
          <Badge className="bg-orange-100 text-orange-700 text-xs">AI生成（编辑保存后来源将变更为专家经验）</Badge>
        )}
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基础信息</TabsTrigger>
          <TabsTrigger value="indicator">关联指标</TabsTrigger>
          <TabsTrigger value="group">关联客群</TabsTrigger>
        </TabsList>

        {/* Tab1：基础信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader><CardTitle className="text-base">基础信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>根因名称 <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入根因名称" />
                </div>
                <div className="space-y-2">
                  <Label>来源</Label>
                  <Input value={isEdit && source === 'ai_generated' ? 'AI生成' : '专家经验'} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400">
                    {isEdit && source === 'ai_generated' ? 'AI生成的根因编辑保存后来源将自动变更为"专家经验"' : '人工新增的根因来源固定为"专家经验"，AI自动创建的根因来源自动标记为"AI生成"'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>一级分类 <span className="text-red-500">*</span></Label>
                  <Select value={category1} onValueChange={(v) => { setCategory1(v); setCategory2(''); }}>
                    <SelectTrigger><SelectValue placeholder="选择一级分类" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(categoryTree).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>二级分类 <span className="text-red-500">*</span></Label>
                  <Select value={category2} onValueChange={setCategory2} disabled={!category1}>
                    <SelectTrigger><SelectValue placeholder="选择二级分类" /></SelectTrigger>
                    <SelectContent>
                      {category1 && categoryTree[category1]?.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>业务场景 <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 flex-wrap">
                  {businessScenarios.map((s) => (
                    <Button key={s} variant={selectedScenarios.includes(s) ? 'default' : 'outline'} size="sm" onClick={() => toggleScenario(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入根因描述" rows={3} />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>状态</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="下架">下架</SelectItem>
                      <SelectItem value="上架">上架</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
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
              {isEdit && editId && (
                <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">运行数据（只读，由系统自动回写）</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">引用率</div>
                      <div className="text-lg font-semibold">10%</div>
                      <div className="text-xs text-muted-foreground mt-1">= 调度单引用次数 / 模型推荐次数</div>
                      <div className="text-xs text-muted-foreground">= 10 / 100</div>
                      <div className="text-xs text-blue-500 mt-1">数据来源：portal-srv推荐引擎 + dispatch-srv调度统计</div>
                      <div className="text-xs text-blue-500">统计周期：近3个月滚动窗口</div>
                    </div>
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">匹配率</div>
                      <div className="text-lg font-semibold">66.7%</div>
                      <div className="text-xs text-muted-foreground mt-1">= 所有推荐的匹配值求平均</div>
                      <div className="text-xs text-muted-foreground">每次匹配值 = 匹配指标数/总关联指标数</div>
                      <div className="text-xs text-blue-500 mt-1">匹配条件：①方向一致 ②change_min ≤ 实际环比 ≤ change_max</div>
                      <div className="text-xs text-blue-500">统计周期：近3个月滚动窗口</div>
                    </div>
                    <div className="border rounded-md p-3 bg-background">
                      <div className="text-xs text-muted-foreground mb-1">置信度</div>
                      <div className="text-lg font-semibold">0.575</div>
                      <div className="text-xs text-muted-foreground mt-1">= 匹配率×0.60 + 引用率×0.25 + 来源权重×0.15</div>
                      <div className="text-xs text-muted-foreground">= 0.667×0.60 + 0.10×0.25 + 1.0×0.15</div>
                      <div className="text-xs text-blue-500 mt-1">来源权重：专家经验=1.0，AI生成=0.75</div>
                      <div className="text-xs text-blue-500">当前来源：专家经验 → 权重1.0 | 统计周期：近3个月</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab2：关联指标 */}
        <TabsContent value="indicator">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">关联指标</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIndicatorSelectorOpen(true)} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> 选择指标
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Info className="w-3.5 h-3.5" />
                关联强度用于AI推荐排序，初期由专家设定（1-3级），后期由AI根据执行数据自动调整
              </div>
              {relatedIndicators.length === 0 && (
                <div className="text-center text-gray-400 py-8 border rounded-lg border-dashed">
                  暂无关联指标，点击上方"选择指标"按钮添加
                </div>
              )}
              {relatedIndicators.map((ri) => (
                <div key={ri.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{ri.indicatorId}</Badge>
                      <span className="font-medium text-sm">{ri.indicatorName}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeIndicator(ri.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">影响方向</Label>
                      <Select value={ri.direction} onValueChange={(v) => updateIndicator(ri.id, 'direction', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">↑ 上升</SelectItem>
                          <SelectItem value="down">↓ 下降</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">下限运算符</Label>
                      <Select value={ri.lowerOperator} onValueChange={(v) => updateIndicator(ri.id, 'lowerOperator', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {numericOperatorOptions.map((op) => (<SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">下限值</Label>
                      <Input className="h-8 text-sm" type="number" value={ri.lowerValue} onChange={(e) => updateIndicator(ri.id, 'lowerValue', e.target.value)} placeholder="数值" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">下限单位</Label>
                      <Select value={ri.lowerUnit} onValueChange={(v) => updateIndicator(ri.id, 'lowerUnit', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">关联强度</Label>
                      <Select value={String(ri.strength)} onValueChange={(v) => updateIndicator(ri.id, 'strength', Number(v))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1级（弱）</SelectItem>
                          <SelectItem value="2">2级（中）</SelectItem>
                          <SelectItem value="3">3级（强）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">上限运算符</Label>
                      <Select value={ri.upperOperator} onValueChange={(v) => updateIndicator(ri.id, 'upperOperator', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {numericOperatorOptions.map((op) => (<SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">上限值</Label>
                      <Input className="h-8 text-sm" type="number" value={ri.upperValue} onChange={(e) => updateIndicator(ri.id, 'upperValue', e.target.value)} placeholder="数值" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">上限单位</Label>
                      <Select value={ri.upperUnit} onValueChange={(v) => updateIndicator(ri.id, 'upperUnit', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">适用阈值范围：{formatThreshold(ri)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab3：关联客群 */}
        <TabsContent value="group">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">关联客群</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setGroupSelectorOpen(true)} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> 选择客群
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Info className="w-3.5 h-3.5" />
                关联强度用于AI推荐排序，初期由专家设定（1-3级），后期由AI根据执行数据自动调整
              </div>
              {relatedGroups.length === 0 && (
                <div className="text-center text-gray-400 py-8 border rounded-lg border-dashed">
                  暂无关联客群，点击上方"选择客群"按钮添加
                </div>
              )}
              {relatedGroups.map((rg) => (
                <div key={rg.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">{rg.groupId}</Badge>
                    <span className="font-medium text-sm">{rg.groupName}</span>
                    <span className="text-xs text-gray-400">规模: {rg.groupScale}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">关联强度</span>
                      <Select value={String(rg.strength)} onValueChange={(v) => updateGroup(rg.id, 'strength', Number(v))}>
                        <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1级（弱）</SelectItem>
                          <SelectItem value="2">2级（中）</SelectItem>
                          <SelectItem value="3">3级（强）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeGroup(rg.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部按钮 */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push('/workspace/strategy/root-cause')}>取消</Button>
        <Button onClick={handleSave}>保存</Button>
      </div>

      {/* 指标选择弹窗 */}
      <IndicatorSelector
        open={indicatorSelectorOpen}
        onOpenChange={setIndicatorSelectorOpen}
        onConfirm={addIndicators}
        selectedIds={relatedIndicators.map((ri) => ri.indicatorId)}
      />

      {/* 客群选择弹窗 */}
      <CustomerGroupSelector
        open={groupSelectorOpen}
        onOpenChange={setGroupSelectorOpen}
        onConfirm={addGroups}
        selectedIds={relatedGroups.map((rg) => rg.groupId)}
      />
    </div>
  );
}
