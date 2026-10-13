'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, Package, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ActivityType, ACTIVITY_TYPE_LIST } from '@/lib/strategy-activity';

const SCENE_LIBRARY: Record<ActivityType, string[]> = {
  IOP普通营销: ['提值', '保有', '全球通', '风险客户'],
  剧本营销: ['提值', '保有', '风险客户', '离网挽留'],
  多波次营销: ['提值', '保有', '全球通', '流量经营', '融合经营'],
  网格通: ['提值', '保有', '流量经营', '融合经营'],
};

// 网格通配置：网格选项 / 渠道 / 剧本示例
const GRID_OPTIONS = [
  '乌鲁木齐-天山区第一网格',
  '乌鲁木齐-沙依巴克区第二网格',
  '乌鲁木齐-新市区第三网格',
  '昌吉-昌吉市核心网格',
  '克拉玛依-克拉玛依区网格',
];

const GRID_CHANNELS = ['短信', '弹窗', '公众号', '视频彩铃'];

const SCRIPT_EXAMPLES = [
  { name: '中高端客户流量提升剧本', type: '多波次流程', scene: '中高端客户运营', actCount: 3, status: '草稿' },
  { name: '离网高危客户关怀挽留剧本', type: '批量策划', scene: '离网维系', actCount: 2, status: '草稿' },
  { name: '宽带到期续费提醒剧本', type: '多波次流程', scene: '家庭融合运营', actCount: 4, status: '草稿' },
];

const WAVE_EXAMPLES = [
  { wave: '第 1 波', time: '活动第 1-3 天', channel: '短信 + 外呼', script: '权益告知', group: '高价值未升档客户' },
  { wave: '第 2 波', time: '活动第 4-7 天', channel: '企业微信 + 掌厅', script: '限时升档礼包', group: '第 1 波未响应客户' },
  { wave: '第 3 波', time: '活动第 8-10 天', channel: '外呼 + 公众号', script: '关怀回访', group: '待确认客户' },
];

const CHANNELS = ['短信', '外呼', '企业微信', '掌厅', '公众号'];
const PRODUCTS = ['5G 升档包 30 元/月', '5G 畅享包 50 元/月', '宽带续费年包', '家庭融合套餐', '国际漫游流量包', '专属权益包'];
const METRICS = ['5G套餐渗透率', '宽带续费率', '离网率', '融合套餐渗透率', 'ARPU', '办理量', '留存率'];
const OBSERVATION_PERIODS = ['活动结束后 15 天', '活动结束后 30 天', '活动结束后 45 天', '活动结束后 60 天'];
const EXCLUDE_TAGS = ['当月已圈选客户', '近1月办理后返销/取消业务客户', '已投诉黑名单客户', '在途工单客户'];

// 话术分段预览（分段 + 高亮）
const SCRIPT_PREVIEW: Record<string, { text: string; highlight?: boolean }[]> = {
  权益告知话术: [
    { text: '【尊敬的用户】' },
    { text: '您当前套餐可免费升级至 5G 畅享，', highlight: true },
    { text: '升级后每月多 30GB 流量。' },
    { text: '回复"1"立即办理，', highlight: true },
    { text: '活动限时 3 天。' },
  ],
  限时升档礼包话术: [
    { text: '【限时福利】' },
    { text: '本月升档 5G 套餐，', highlight: true },
    { text: '赠首月流量翻倍 + 20 元话费。' },
    { text: '点此立即办理 >>', highlight: true },
  ],
  续费提醒话术: [
    { text: '【续费提醒】' },
    { text: '您的宽带即将到期，', highlight: true },
    { text: '现在续费立减 60 元。' },
    { text: '回复"续费"办理。' },
  ],
};

function ActivityConfigInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conclusion = searchParams.get('conclusion') || 'DG-20260828-001';
  const strategyId = searchParams.get('strategy') || 'STR-2026-0301';

  const [type, setType] = useState<ActivityType>('多波次营销');
  const [scene, setScene] = useState('提值');
  const [activityName, setActivityName] = useState('乌鲁木齐 5G 套餐渗透率升档攻坚活动');
  const [targetGroup, setTargetGroup] = useState('乌鲁木齐中低端 5G 终端已具备未升档客户');
  const [targetScale, setTargetScale] = useState('48620');
  const [excludeTags, setExcludeTags] = useState<string[]>(['近1月办理后返销/取消业务客户']);
  const [channels, setChannels] = useState<string[]>(['短信', '外呼']);
  const [script, setScript] = useState('权益告知话术');
  const [products, setProducts] = useState<string[]>(['5G 升档包 30 元/月']);
  const [priority, setPriority] = useState('高');
  const [deadline, setDeadline] = useState('2026-09-15');
  const [evalEnabled, setEvalEnabled] = useState(true);
  const [observationPeriod, setObservationPeriod] = useState('活动结束后 30 天');
  const [metrics, setMetrics] = useState<string[]>(['5G套餐渗透率', '办理量', 'ARPU']);
  const [targetValue, setTargetValue] = useState('渗透率 ≥ 70%');
  const [compareIntervention, setCompareIntervention] = useState(true);
  const [feedbackOptions, setFeedbackOptions] = useState<string[]>(['不办理原因', '数据异常问题']);
  const [smsSent, setSmsSent] = useState(false);
  const [generated, setGenerated] = useState(false);

  // 剧本营销 Tab 状态
  const [scriptName, setScriptName] = useState('中高端客户流量提升剧本');
  const [scriptType, setScriptType] = useState('多波次流程');
  const [scriptActCount, setScriptActCount] = useState('3');
  const [scriptSubmitted, setScriptSubmitted] = useState(false);

  // 多波次营销 Tab 状态
  const [waves, setWaves] = useState(WAVE_EXAMPLES);

  // 网格通 Tab 状态
  const [gridName, setGridName] = useState('乌鲁木齐流量升档网格通活动');
  const [gridDesc, setGridDesc] = useState('面向网格内流量饱和度偏低的客户，推送流量升档权益与办理入口');
  const [grids, setGrids] = useState<string[]>(['乌鲁木齐-天山区第一网格', '乌鲁木齐-新市区第三网格']);
  const [gridStartDate, setGridStartDate] = useState('2026-09-01');
  const [gridEndDate, setGridEndDate] = useState('2026-09-30');
  const [gridChannels, setGridChannels] = useState<string[]>(['短信', '弹窗']);
  const [gridTemplateTitle, setGridTemplateTitle] = useState('您的专属流量升档权益已到账');
  const [gridTemplateContent, setGridTemplateContent] = useState('尊敬的客户，您当前流量已使用较多，现可享流量升档权益，点击办理入口立即办理，活动截止 2026-09-30。');
  const [gridSubmitted, setGridSubmitted] = useState(false);

  const toggleGrid = (value: string, checked: boolean) => {
    setGrids((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)));
  };
  const toggleGridChannel = (value: string) => {
    setGridChannels((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const activeScriptSegments = SCRIPT_PREVIEW[script] ?? [];

  const currentSceneList = SCENE_LIBRARY[type];
  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">活动配置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            统一配置 IOP 普通营销 / 剧本营销 / 多波次营销活动，生成带全局活动 ID 的活动实例并移交调度中心。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4" />
          关联诊断：{conclusion} · 关联策略：{strategyId}
        </div>
      </div>

      <Tabs value={type} onValueChange={(v) => { setType(v as ActivityType); setScene(SCENE_LIBRARY[v as ActivityType][0]); }}>
        <TabsList>
          {ACTIVITY_TYPE_LIST.map((t) => (
            <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="IOP普通营销" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">基础信息</CardTitle>
                <CardDescription>活动名称与业务场景</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>活动名称</Label>
                  <Input value={activityName} onChange={(e) => setActivityName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>营销场景（场景库联动）</Label>
                  <Select value={scene} onValueChange={setScene}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentSceneList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>优先级</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="高">高</SelectItem>
                      <SelectItem value="中">中</SelectItem>
                      <SelectItem value="低">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>要求完成时间</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">目标客群</CardTitle>
                <CardDescription>客群标签字段 + 排除逻辑</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>目标客群</Label>
                  <Select value={targetGroup} onValueChange={setTargetGroup}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="乌鲁木齐中低端 5G 终端已具备未升档客户">乌鲁木齐中低端 5G 终端已具备未升档客户</SelectItem>
                      <SelectItem value="克拉玛依到期前 15 天未续费客户">克拉玛依到期前 15 天未续费客户</SelectItem>
                      <SelectItem value="乌鲁木齐异网流量激增高价值客户">乌鲁木齐异网流量激增高价值客户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>客群规模（户）</Label>
                    <Input value={targetScale} onChange={(e) => setTargetScale(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" className="mt-6" onClick={() => router.push('/workspace/business-opportunity/customer')}>
                    <Users className="mr-1 h-3.5 w-3.5" /> 查看客群
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    排除标签（"非"逻辑）
                    <span className="text-xs text-muted-foreground">满足目标客群且不满足以下标签</span>
                  </Label>
                  <div className="space-y-1.5">
                    {EXCLUDE_TAGS.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={excludeTags.includes(tag)} onCheckedChange={() => toggle(excludeTags, setExcludeTags, tag)} />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  标签口径：目标客群与 BOSS 侧口径一致，定期校验；如有问题可
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">反馈</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">触达配置</CardTitle>
                <CardDescription>渠道 / 话术 / 产品</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>触达渠道</Label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((c) => (
                      <Badge key={c} variant={channels.includes(c) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(channels, setChannels, c)}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>营销话术（话术模板）</Label>
                  <Select value={script} onValueChange={setScript}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="权益告知话术">权益告知话术</SelectItem>
                      <SelectItem value="限时升档礼包话术">限时升档礼包话术</SelectItem>
                      <SelectItem value="续费提醒话术">续费提醒话术</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>推荐产品</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.map((p) => (
                      <Badge key={p} variant={products.includes(p) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(products, setProducts, p)}>
                        <Package className="mr-1 h-3 w-3" />{p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 后评估配置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">后评估配置（效果评估体系）</CardTitle>
              <CardDescription>自定义观察周期与业务指标，支持干预/未干预客群对比</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={evalEnabled} onCheckedChange={setEvalEnabled} />
                <Label>开启后评估</Label>
              </div>
              {evalEnabled && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>观察周期（自定义）</Label>
                    <Select value={observationPeriod} onValueChange={setObservationPeriod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OBSERVATION_PERIODS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>业务指标（自定义）</Label>
                    <div className="flex flex-wrap gap-2">
                      {METRICS.map((m) => (
                        <Badge key={m} variant={metrics.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(metrics, setMetrics, m)}>
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>目标值</Label>
                    <Input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox checked={compareIntervention} onCheckedChange={(v) => setCompareIntervention(v === true)} />
                <Label className="text-sm">开启干预 / 未干预客群对比</Label>
              </div>
            </CardContent>
          </Card>

          {/* 触点反馈与效果口径 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">触点反馈与效果口径</CardTitle>
              <CardDescription>承接 IOP 触点活动配置优化建议</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>触点反馈结构化选项</Label>
                <div className="flex flex-wrap gap-2">
                  {['不办理原因', '数据异常问题'].map((o) => (
                    <Badge key={o} variant={feedbackOptions.includes(o) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(feedbackOptions, setFeedbackOptions, o)}>
                      {o}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>效果统计口径说明</Label>
                <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  统计口径统一为「按客群 / 按接触 / 按成功办理渠道」三类，办理成功以成功办理渠道数据为准；报表页将注明口径说明。
                </p>
              </div>
              <div className="space-y-2">
                <Label>话术分段预览</Label>
                <div className="rounded-md border border-border bg-card p-3 text-sm leading-relaxed">
                  {activeScriptSegments.map((seg, i) => (
                    <span key={i} className={seg.highlight ? 'font-semibold text-primary' : 'text-foreground'}>
                      {seg.text}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 多策略并行管控 · 冲突约束校验（阶段三预留） */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">冲突约束校验</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">通过</span>
                <span className="text-muted-foreground">频次控制：同客群 7 日内触达 ≤ 3 次，当前 2 次</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">通过</span>
                <span className="text-muted-foreground">防打扰：避开 22:00-08:00 触达时段</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">提示</span>
                <span className="text-muted-foreground">优先级抢占：本活动优先级「高」，将覆盖同客群低优先级在途活动</span>
              </div>
              <div className="text-xs text-muted-foreground">统一要素库：产品 / 话术 / 渠道均由要素库统一管理，口径唯一，禁止自建冗余要素。</div>
            </CardContent>
          </Card>

          {/* 底部操作栏 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">
              快捷优化路径：当前版本 <span className="font-medium text-foreground">v1</span>
              <Button variant="link" size="sm" className="h-auto p-0 px-1 text-primary">查看修改日志</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSmsSent(true)}>
                短信测试
              </Button>
              {smsSent && <span className="text-xs text-emerald-600">已发送测试短信至默认配置人账号</span>}
              {generated ? (
                <>
                  <span className="text-xs text-emerald-600">活动实例 ACT-2026-0828-001 已生成</span>
                  <Button size="sm" onClick={() => router.push(`/workspace/strategy/approval?activity=ACT-2026-0828-001&name=${encodeURIComponent(activityName)}`)}>
                    提交审批
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setGenerated(true)}>
                  生成活动实例
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 剧本营销 */}
        <TabsContent value="剧本营销" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">剧本编排</CardTitle>
              <CardDescription>配置剧本营销活动，支持多波次流程与批量策划</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>剧本名称</Label>
                  <Input value={scriptName} onChange={(e) => setScriptName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>剧本类型</Label>
                  <Select value={scriptType} onValueChange={setScriptType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="多波次流程">多波次流程</SelectItem>
                      <SelectItem value="批量策划">批量策划</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>幕数</Label>
                  <Input value={scriptActCount} onChange={(e) => setScriptActCount(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>已有剧本（迁入剧本营销）</Label>
                <div className="rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-3 py-2 font-medium">剧本名称</th>
                        <th className="px-3 py-2 font-medium">剧本类型</th>
                        <th className="px-3 py-2 font-medium">业务场景</th>
                        <th className="px-3 py-2 font-medium">幕数</th>
                        <th className="px-3 py-2 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCRIPT_EXAMPLES.map((s) => (
                        <tr key={s.name} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-foreground">{s.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{s.type}</td>
                          <td className="px-3 py-2 text-muted-foreground">{s.scene}</td>
                          <td className="px-3 py-2 text-muted-foreground">{s.actCount}</td>
                          <td className="px-3 py-2"><Badge variant="outline">{s.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end">
                {scriptSubmitted ? (
                  <span className="text-xs text-emerald-600">剧本「{scriptName}」已生成并进入活动配置</span>
                ) : (
                  <Button size="sm" onClick={() => setScriptSubmitted(true)}>生成剧本</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 多波次营销 */}
        <TabsContent value="多波次营销" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">波次计划</CardTitle>
              <CardDescription>配置多波次营销节奏与触点排布，分波次触达不同客群</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">波次</th>
                      <th className="px-3 py-2 font-medium">时间窗口</th>
                      <th className="px-3 py-2 font-medium">触达渠道</th>
                      <th className="px-3 py-2 font-medium">话术</th>
                      <th className="px-3 py-2 font-medium">目标客群</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waves.map((w) => (
                      <tr key={w.wave} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-medium text-foreground">{w.wave}</td>
                        <td className="px-3 py-2 text-muted-foreground">{w.time}</td>
                        <td className="px-3 py-2 text-muted-foreground">{w.channel}</td>
                        <td className="px-3 py-2 text-muted-foreground">{w.script}</td>
                        <td className="px-3 py-2 text-muted-foreground">{w.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                多波次营销按「第 1 波 → 未响应 → 第 2 波 → 待确认 → 第 3 波」节奏推进，各波次客群随上波响应结果动态圈定。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 网格通 */}
        <TabsContent value="网格通" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">网格通活动配置</CardTitle>
              <CardDescription>面向网格一线配置网格通活动：设定网格范围、周期、渠道与内容模板，提交后自动下发</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>活动名称</Label>
                  <Input value={gridName} onChange={(e) => setGridName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>活动说明</Label>
                  <Input value={gridDesc} onChange={(e) => setGridDesc(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>网格范围（已选 {grids.length} 个）</Label>
                <div className="flex flex-wrap gap-2">
                  {GRID_OPTIONS.map((g) => (
                    <label key={g} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${grids.includes(g) ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/40'}`}>
                      <Checkbox checked={grids.includes(g)} onCheckedChange={(checked) => toggleGrid(g, checked === true)} />
                      <span className="text-foreground">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>开始时间</Label>
                  <Input type="date" value={gridStartDate} onChange={(e) => setGridStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>结束时间</Label>
                  <Input type="date" value={gridEndDate} onChange={(e) => setGridEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>触达渠道</Label>
                <div className="flex flex-wrap gap-2">
                  {GRID_CHANNELS.map((c) => (
                    <Badge key={c} variant={gridChannels.includes(c) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleGridChannel(c)}>
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>内容模板</Label>
                <Input value={gridTemplateTitle} onChange={(e) => setGridTemplateTitle(e.target.value)} />
                <Textarea rows={3} value={gridTemplateContent} onChange={(e) => setGridTemplateContent(e.target.value)} />
              </div>
              <div className="flex justify-end">
                {gridSubmitted ? (
                  <span className="text-xs text-emerald-600">网格通活动「{gridName}」已提交审批</span>
                ) : (
                  <Button size="sm" onClick={() => setGridSubmitted(true)}>提交网格通审批</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ActivityConfigPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <ActivityConfigInner />
    </Suspense>
  );
}
