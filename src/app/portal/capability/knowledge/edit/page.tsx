'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Send, X, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  { value: 'CASE', label: '策略案例' },
  { value: 'SCRIPT', label: '营销话术' },
  { value: 'MANUAL', label: '操作手册' },
  { value: 'SCENARIO', label: '场景知识' },
];

const SCENARIOS = [
  { code: 1, name: '携转挽留' },
  { code: 2, name: '携出授权码' },
  { code: 3, name: '宽带存量关怀' },
  { code: 4, name: '全球通离网' },
  { code: 5, name: '全球通投诉' },
  { code: 6, name: '热线商机' },
  { code: 7, name: '异动修复' },
  { code: 8, name: '离网原因追溯' },
  { code: 9, name: '停机赢回' },
];

const PRESET_TAGS = ['最佳实践', '高频问题', '新手必读', '失败教训', '话术模板', '流程规范'];

function KnowledgeEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!searchParams.get('id');

  const [form, setForm] = useState({
    title: '',
    contentType: '' as string,
    scenarioCodes: [] as number[],
    caseResult: '' as string,
    tags: [] as string[],
    customTag: '',
    summary: '',
    content: '',
    attachments: [] as { name: string; size: string }[],
  });


  const updateForm = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleScenario = (code: number) => {
    setForm(prev => ({
      ...prev,
      scenarioCodes: prev.scenarioCodes.includes(code)
        ? prev.scenarioCodes.filter(c => c !== code)
        : [...prev.scenarioCodes, code],
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !form.tags.includes(tag.trim())) {
      updateForm('tags', [...form.tags, tag.trim()]);
    }
    updateForm('customTag', '');
  };

  const removeTag = (tag: string) => {
    updateForm('tags', form.tags.filter(t => t !== tag));
  };

  const handleFileUpload = () => {
    const newFile = { name: `附件_${form.attachments.length + 1}.pdf`, size: '2.3MB' };
    updateForm('attachments', [...form.attachments, newFile]);
    toast.success('文件上传成功');
  };

  const handleSaveDraft = () => {
    if (!form.title.trim()) {
      toast.error('请填写知识标题');
      return;
    }
    toast.success('草稿保存成功');
    router.push('/portal/capability/knowledge/list');
  };

  const handleSubmitAudit = () => {
    if (!form.title.trim()) { toast.error('请填写知识标题'); return; }
    if (!form.contentType) { toast.error('请选择内容类型'); return; }
    if (form.scenarioCodes.length === 0) { toast.error('请选择关联场景'); return; }
    if (!form.summary.trim()) { toast.error('请填写摘要'); return; }
    if (!form.content.trim()) { toast.error('请填写正文内容'); return; }
    toast.success('已提交审核');
    router.push('/portal/capability/knowledge/list');
  };

  const contentTypeLabel = CONTENT_TYPES.find(t => t.value === form.contentType)?.label || '';
  const scenarioNames = form.scenarioCodes.map(c => SCENARIOS.find(s => s.code === c)?.name).filter(Boolean);

  return (
    <div className="p-6 space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/portal/capability/knowledge/list')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <h1 className="text-lg font-semibold">{isEdit ? '编辑知识' : '新建知识'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-1" />保存草稿
          </Button>
          <Button size="sm" onClick={handleSubmitAudit}>
            <Send className="h-4 w-4 mr-1" />提交审核
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 左侧表单区 */}
        <div className="space-y-4 flex-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 知识标题 */}
              <div className="space-y-1.5">
                <Label className="text-sm"><span className="text-destructive">*</span> 知识标题</Label>
                <Input
                  placeholder="请输入知识标题（限50字）"
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  maxLength={50}
                />
                <div className="text-xs text-right text-muted-foreground">{form.title.length}/50</div>
              </div>

              {/* 内容类型 */}
              <div className="space-y-1.5">
                <Label className="text-sm"><span className="text-destructive">*</span> 内容类型</Label>
                <Select value={form.contentType} onValueChange={v => updateForm('contentType', v)}>
                  <SelectTrigger><SelectValue placeholder="请选择内容类型" /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 关联场景 */}
              <div className="space-y-1.5">
                <Label className="text-sm"><span className="text-destructive">*</span> 关联场景</Label>
                <div className="flex flex-wrap gap-2">
                  {SCENARIOS.map(s => (
                    <Button
                      key={s.code}
                      variant={form.scenarioCodes.includes(s.code) ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => toggleScenario(s.code)}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 案例结果（仅策略案例） */}
              {form.contentType === 'CASE' && (
                <div className="space-y-1.5">
                  <Label className="text-sm">案例结果</Label>
                  <Select value={form.caseResult} onValueChange={v => updateForm('caseResult', v)}>
                    <SelectTrigger><SelectValue placeholder="请选择案例结果" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUCCESS">成功</SelectItem>
                      <SelectItem value="FAIL">失败</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 知识标签 */}
              <div className="space-y-1.5">
                <Label className="text-sm">知识标签</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_TAGS.map(tag => (
                    <Button
                      key={tag}
                      variant={form.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => form.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入自定义标签"
                    value={form.customTag}
                    onChange={e => updateForm('customTag', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && form.customTag.trim() && addTag(form.customTag)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => addTag(form.customTag)} disabled={!form.customTag.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 摘要 */}
              <div className="space-y-1.5">
                <Label className="text-sm"><span className="text-destructive">*</span> 摘要</Label>
                <Textarea
                  placeholder="请输入知识摘要（限200字）"
                  value={form.summary}
                  onChange={e => updateForm('summary', e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <div className="text-xs text-right text-muted-foreground">{form.summary.length}/200</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">正文内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm"><span className="text-destructive">*</span> 正文</Label>
                {/* 简化的富文本工具栏 */}
                <div className="border rounded-t-md p-1.5 flex gap-1 bg-muted/30">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold" title="加粗">B</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 italic" title="斜体">I</Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="无序列表">列表</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="表格">表格</Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="插入图片">图片</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="代码块">代码</Button>
                </div>
                <Textarea
                  placeholder="请输入正文内容，支持富文本格式"
                  value={form.content}
                  onChange={e => updateForm('content', e.target.value)}
                  rows={12}
                  className="rounded-t-none border-t-0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">附件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={handleFileUpload}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">点击上传附件</p>
                  <p className="text-xs text-muted-foreground mt-1">支持PDF、Word、图片格式，单文件限10MB</p>
                </div>
                {form.attachments.length > 0 && (
                  <div className="space-y-2">
                    {form.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span>{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{file.size}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => updateForm('attachments', form.attachments.filter((_, j) => j !== i))}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function KnowledgeEditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="text-muted-foreground">加载中...</span></div>}>
      <KnowledgeEditPageContent />
    </Suspense>
  );
}
