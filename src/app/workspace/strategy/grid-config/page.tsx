'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Info, Send, Smartphone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const GRID_OPTIONS = [
  '乌鲁木齐-天山区第一网格',
  '乌鲁木齐-沙依巴克区第二网格',
  '乌鲁木齐-新市区第三网格',
  '昌吉-昌吉市核心网格',
  '克拉玛依-克拉玛依区网格',
];

const CHANNELS = [
  { value: '短信', desc: '通过短信通道触达客户，适用于权益提醒与活动告知' },
  { value: '弹窗', desc: '在网格通客户端首页弹窗展示，适用于限时活动与任务提醒' },
  { value: '公众号', desc: '通过微信公众号推送图文素材，适用于内容型活动' },
  { value: '视频彩铃', desc: '设置视频彩铃内容，适用于品牌与权益宣传' },
];

const STEPS = ['基本信息', '渠道配置', '内容模板', '审批提交'];

export default function GridConfigPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [hint, setHint] = useState('');

  // Step 1
  const [activityName, setActivityName] = useState('乌鲁木齐流量升档网格通活动');
  const [activityDesc, setActivityDesc] = useState('面向网格内流量饱和度偏低的客户，推送流量升档权益与办理入口');
  const [grids, setGrids] = useState<string[]>(['乌鲁木齐-天山区第一网格', '乌鲁木齐-新市区第三网格']);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');

  // Step 2
  const [channels, setChannels] = useState<string[]>(['短信', '弹窗']);

  // Step 3
  const [templateTitle, setTemplateTitle] = useState('您的专属流量升档权益已到账');
  const [templateContent, setTemplateContent] = useState(
    '尊敬的${客户姓名}，您当前流量已使用${流量饱和度}，现可享${权益名称}，点击${办理链接}立即办理，活动截止${活动结束时间}。',
  );

  // Step 4
  const [approver, setApprover] = useState('张运营');

  const canNext = useMemo(() => {
    if (step === 0) return activityName.trim() !== '' && grids.length > 0 && startDate !== '' && endDate !== '';
    if (step === 1) return channels.length > 0;
    if (step === 2) return templateTitle.trim() !== '' && templateContent.trim() !== '';
    return true;
  }, [step, activityName, grids, startDate, endDate, channels, templateTitle, templateContent]);

  const toggleGrid = (value: string, checked: boolean) => {
    setGrids((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)));
  };

  const toggleChannel = (value: string, checked: boolean) => {
    setChannels((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setHint('活动配置已提交网格通活动审批流程，审批通过后自动下发至所选网格执行');
  };

  const handleReset = () => {
    setSubmitted(false);
    setStep(0);
    setHint('');
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">网格通活动配置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            面向网格一线配置网格通活动：设定网格范围与活动周期、选择触达渠道、配置内容模板后提交审批，审批通过自动下发。
          </p>
        </div>
        {submitted && (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">已提交审批</Badge>
        )}
      </div>

      {hint && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          {hint}
        </div>
      )}

      {/* 步骤条 */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                index < step
                  ? 'bg-primary text-primary-foreground'
                  : index === step
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <span className={`text-sm ${index === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {index < STEPS.length - 1 && <div className="mx-2 h-px w-10 bg-border" />}
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-base font-medium text-foreground">活动配置已提交审批</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            活动「{activityName}」已提交网格通活动审批流程，审批通过后自动下发至 {grids.length} 个网格执行。
          </p>
          <div className="mx-auto mt-5 max-w-xl space-y-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
            <div>触达渠道：{channels.join('、') || '—'}</div>
            <div>活动周期：{startDate} ~ {endDate}</div>
            <div>内容标题：{templateTitle}</div>
          </div>
          <Button className="mt-5" variant="outline" onClick={handleReset}>
            重新配置
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-5">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  活动名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={activityName}
                  onChange={(event) => setActivityName(event.target.value)}
                  placeholder="请输入活动名称"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">活动说明</Label>
                <Textarea
                  rows={3}
                  value={activityDesc}
                  onChange={(event) => setActivityDesc(event.target.value)}
                  placeholder="请输入活动说明与目标"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  网格范围 <span className="text-destructive">*</span>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">已选 {grids.length} 个网格</span>
                </Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {GRID_OPTIONS.map((grid) => (
                    <label
                      key={grid}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        grids.includes(grid) ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <Checkbox
                        checked={grids.includes(grid)}
                        onCheckedChange={(checked) => toggleGrid(grid, checked === true)}
                      />
                      <span className="text-foreground">{grid}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">
                    开始时间 <span className="text-destructive">*</span>
                  </Label>
                  <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">
                    结束时间 <span className="text-destructive">*</span>
                  </Label>
                  <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                选择网格通触达渠道，可多选；渠道将按所选内容模板自动适配素材形态。
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {CHANNELS.map((channel) => (
                  <label
                    key={channel.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors ${
                      channels.includes(channel.value)
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={channels.includes(channel.value)}
                      onCheckedChange={(checked) => toggleChannel(channel.value, checked === true)}
                    />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        {channel.value}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{channel.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  内容标题 <span className="text-destructive">*</span>
                </Label>
                <Input value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  内容正文 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  rows={5}
                  value={templateContent}
                  onChange={(event) => setTemplateContent(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  支持变量：{'{客户姓名}'}、{'{流量饱和度}'}、{'{权益名称}'}、{'{办理链接}'}、{'{活动结束时间}'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-4">
                <div className="text-xs font-medium text-muted-foreground">网格通预览</div>
                <div className="mt-2 rounded-md border border-border bg-card px-4 py-3">
                  <div className="text-sm font-medium text-foreground">{templateTitle || '（未填写标题）'}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {templateContent || '（未填写正文）'}
                  </p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  发送渠道：{channels.join('、') || '未选择渠道'}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">请确认活动配置信息，提交后将进入网格通活动审批流程。</p>
              <div className="divide-y divide-border rounded-md border border-border">
                {[
                  { label: '活动名称', value: activityName },
                  { label: '活动说明', value: activityDesc || '—' },
                  { label: '网格范围', value: `${grids.length} 个网格（${grids.join('、')}）` },
                  { label: '活动周期', value: `${startDate} ~ ${endDate}` },
                  { label: '触达渠道', value: channels.join('、') || '—' },
                  { label: '内容标题', value: templateTitle },
                ].map((row) => (
                  <div key={row.label} className="flex gap-4 px-4 py-2.5 text-sm">
                    <span className="w-24 shrink-0 text-muted-foreground">{row.label}</span>
                    <span className="text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 md:w-72">
                <Label className="text-sm">审批人</Label>
                <Select value={approver} onValueChange={setApprover}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择审批人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="张运营">张运营（地市运营主管）</SelectItem>
                    <SelectItem value="李经理">李经理（市场部经理）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {!submitted && (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一步
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep((prev) => prev + 1)}>
              下一步
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Send className="mr-1 h-4 w-4" />
              提交审批
            </Button>
          )}
        </div>
      )}
    </div>
  );
}