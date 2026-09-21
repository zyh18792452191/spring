'use client';

import { useState } from 'react';
import { sharedTemplates, type SharedTemplate, type TemplateSection } from '../../shared-template-data';
import {
  Plus,
  Sparkles,
  Send,
  RotateCcw,
  Save,
  GripVertical,
  FolderPlus,
  Trash2,
  ArrowLeft,
  X,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type Template = SharedTemplate;

/* ─── Toast ─── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'warning'; onClose: () => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <div className={`fixed top-4 right-4 z-[60] ${bg} text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
      <button className="ml-2 hover:opacity-80" onClick={() => { setVisible(false); onClose(); }}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const allTags = ['流量运营', '5G', 'DOU', 'ARPU', '收入', '价值提升', '离网', '维系', '保有率', '中高端', '家庭融合', '增量运营', '专项分析', '综合分析'];

export default function AICreateTemplatePage() {
  const router = useRouter();
  const [aiDialogMessages, setAiDialogMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '您好！我是AI模板助手，帮您快速创建报告模板。\n\n请描述您想创建的模板，例如：\n• "月度流量运营分析报告，包含流量概览、DOU分析、5G渗透、区域对比、策略建议"\n• "中高端客户保有分析报告，含保有率、离网归因、维系效果"\n\n我会根据您的描述自动生成模板章节结构，您确认后即可保存。' },
  ]);
  const [aiDialogInput, setAiDialogInput] = useState('');
  const [aiGeneratedSections, setAiGeneratedSections] = useState<TemplateSection[]>([]);
  const [aiDialogTags, setAiDialogTags] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' } | null>(null);
  const [saved, setSaved] = useState(false);

  // 递归计数所有章节
  const countAllSections = (secs: TemplateSection[]): number => {
    let count = 0;
    for (const s of secs) {
      count += 1;
      if (s.children) count += countAllSections(s.children);
    }
    return count;
  };

  // 递归更新章节树
  const updateSectionTree = (secs: TemplateSection[], sectionId: string, updater: (s: TemplateSection) => TemplateSection): TemplateSection[] => {
    return secs.map(s => {
      if (s.id === sectionId) return updater(s);
      if (s.children) return { ...s, children: updateSectionTree(s.children, sectionId, updater) };
      return s;
    });
  };

  // 递归删除章节
  const removeSectionFromTree = (secs: TemplateSection[], sectionId: string): TemplateSection[] => {
    return secs.filter(s => s.id !== sectionId).map(s => {
      if (s.children) return { ...s, children: removeSectionFromTree(s.children, sectionId) };
      return s;
    });
  };

  // 递归添加子章节
  const addChildToSection = (secs: TemplateSection[], parentId: string): TemplateSection[] => {
    return secs.map(s => {
      if (s.id === parentId) {
        const newChild: TemplateSection = { id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: '新子章节', paragraphs: [] };
        return { ...s, children: [...(s.children || []), newChild] };
      }
      if (s.children) return { ...s, children: addChildToSection(s.children, parentId) };
      return s;
    });
  };

  // AI对话生成模板
  const generateTemplateFromInput = (input: string) => {
    const lower = input.toLowerCase();
    let sections: TemplateSection[] = [];
    let genName = '';
    let tags: string[] = [];

    if (lower.includes('流量') || lower.includes('dou') || lower.includes('5g')) {
      genName = '流量运营分析报告模板';
      tags = ['流量运营', '5G', 'DOU'];
      sections = [
        { id: crypto.randomUUID(), title: '流量运营总览', paragraphs: [{ type: 'narrative', label: '全疆及地市流量核心指标概览' }], children: [
          { id: crypto.randomUUID(), title: 'DOU趋势分析', paragraphs: [{ type: 'narrative', label: '月度DOU变化趋势及环比分析' }], children: [
            { id: crypto.randomUUID(), title: '5G DOU贡献', paragraphs: [{ type: 'narrative', label: '5G流量占DOU比重及变化' }], children: [] },
            { id: crypto.randomUUID(), title: '4G DOU变化', paragraphs: [{ type: 'narrative', label: '4G流量变化及分流趋势' }], children: [] },
          ] },
          { id: crypto.randomUUID(), title: '流量收入分析', paragraphs: [{ type: 'narrative', label: '流量收入与ARPU关系' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '地市流量对比', paragraphs: [{ type: 'narrative', label: '16地市流量指标排名与差异' }], children: [
          { id: crypto.randomUUID(), title: 'DOU排名', paragraphs: [{ type: 'narrative', label: '地市DOU降序排名及标杆差距' }], children: [] },
          { id: crypto.randomUUID(), title: '5G渗透率', paragraphs: [{ type: 'narrative', label: '地市5G用户渗透率对比' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '策略建议', paragraphs: [{ type: 'narrative', label: '基于分析结果的流量提升策略' }], children: [] },
      ];
    } else if (lower.includes('arpu') || lower.includes('收入') || lower.includes('价值')) {
      genName = '客户价值分析报告模板';
      tags = ['ARPU', '收入', '价值提升'];
      sections = [
        { id: crypto.randomUUID(), title: 'ARPU总览', paragraphs: [{ type: 'narrative', label: '全疆及地市ARPU核心指标' }], children: [
          { id: crypto.randomUUID(), title: '整体ARPU趋势', paragraphs: [{ type: 'narrative', label: '月度ARPU变化及环比' }], children: [] },
          { id: crypto.randomUUID(), title: '分客群ARPU', paragraphs: [{ type: 'narrative', label: '中高端/大众/基础客群ARPU对比' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '收入结构分析', paragraphs: [{ type: 'narrative', label: '收入来源及变动归因' }], children: [
          { id: crypto.randomUUID(), title: '流量收入占比', paragraphs: [{ type: 'narrative', label: '流量/语音/增值业务收入结构' }], children: [] },
          { id: crypto.randomUUID(), title: '增量收入贡献', paragraphs: [{ type: 'narrative', label: '新入网/存量/回归用户收入贡献' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '价值提升策略', paragraphs: [{ type: 'narrative', label: 'ARPU提升路径与策略建议' }], children: [] },
      ];
    } else if (lower.includes('离网') || lower.includes('维系') || lower.includes('保有')) {
      genName = '离网维系分析报告模板';
      tags = ['离网', '维系', '保有率'];
      sections = [
        { id: crypto.randomUUID(), title: '离网态势总览', paragraphs: [{ type: 'narrative', label: '全疆离网率及趋势' }], children: [
          { id: crypto.randomUUID(), title: '离网率趋势', paragraphs: [{ type: 'narrative', label: '月度离网率变化及预警' }], children: [] },
          { id: crypto.randomUUID(), title: '离网客群画像', paragraphs: [{ type: 'narrative', label: '离网客户特征标签分布' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '维系效果评估', paragraphs: [{ type: 'narrative', label: '维系策略执行率与转化率' }], children: [
          { id: crypto.randomUUID(), title: '维系触达率', paragraphs: [{ type: 'narrative', label: '各渠道维系触达成功率' }], children: [] },
          { id: crypto.randomUUID(), title: '维系转化率', paragraphs: [{ type: 'narrative', label: '触达→留存的转化漏斗' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '策略优化建议', paragraphs: [{ type: 'narrative', label: '基于归因的维系策略优化方向' }], children: [] },
      ];
    } else {
      genName = '综合经营分析报告模板';
      tags = ['综合分析'];
      sections = [
        { id: crypto.randomUUID(), title: '经营概况', paragraphs: [{ type: 'narrative', label: '核心经营指标概览' }], children: [
          { id: crypto.randomUUID(), title: '关键指标总览', paragraphs: [{ type: 'narrative', label: '收入/用户/流量/ARPU核心指标' }], children: [] },
          { id: crypto.randomUUID(), title: '趋势分析', paragraphs: [{ type: 'narrative', label: '月度同比环比趋势' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '业务分析', paragraphs: [{ type: 'narrative', label: '重点业务深度分析' }], children: [
          { id: crypto.randomUUID(), title: '流量业务', paragraphs: [{ type: 'narrative', label: '流量运营关键指标分析' }], children: [] },
          { id: crypto.randomUUID(), title: '客户发展', paragraphs: [{ type: 'narrative', label: '新增/离网/保有指标分析' }], children: [] },
        ] },
        { id: crypto.randomUUID(), title: '区域对比', paragraphs: [{ type: 'narrative', label: '地市间指标排名与差异' }], children: [] },
        { id: crypto.randomUUID(), title: '策略建议', paragraphs: [{ type: 'narrative', label: '基于归因分析的策略建议' }], children: [] },
      ];
    }

    setTemplateName(genName);
    setAiGeneratedSections(sections);
    setAiDialogTags(tags);
    setAiDialogMessages(prev => [...prev, {
      role: 'ai' as const,
      content: `已为您生成「${genName}」，共${countAllSections(sections)}个章节，含多级结构。您可以在右侧编辑章节、添加子章节，确认后保存。`
    }]);
  };

  const handleSend = () => {
    if (!aiDialogInput.trim()) return;
    const userInput = aiDialogInput;
    setAiDialogMessages(prev => [...prev, { role: 'user' as const, content: userInput }]);
    setAiDialogInput('');
    generateTemplateFromInput(userInput);
  };

  const handleSave = () => {
    const name = templateName || '新模板';
    // 保存到 localStorage 供模板管理页面读取
    const savedTemplates = JSON.parse(localStorage.getItem('ai-created-templates') || '[]');
    const newTemplate: Template = {
      id: `t${Date.now()}`,
      name,
      tags: aiDialogTags.length > 0 ? aiDialogTags : ['专项分析'],
      version: 'v1.0',
      reportCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      source: 'ai',
      chapters: (function flattenTitles(secs: TemplateSection[]): string[] {
        return secs.flatMap(s => [s.title, ...(s.children ? flattenTitles(s.children) : [])]);
      })(aiGeneratedSections),
      sections: aiGeneratedSections,
    };
    savedTemplates.push(newTemplate);
    localStorage.setItem('ai-created-templates', JSON.stringify(savedTemplates));
    setSaved(true);
    setToast({ msg: `模板"${name}"已保存`, type: 'success' });
  };

  const handleReset = () => {
    setAiGeneratedSections([]);
    setTemplateName('');
    setAiDialogTags([]);
    setAiDialogMessages(prev => [...prev, { role: 'ai', content: '请告诉我您想如何调整？或描述一个新的模板需求。' }]);
  };

  // 递归渲染章节卡片
  const renderSections = (secs: TemplateSection[], depth: number = 0): React.ReactNode => {
    return secs.map((sec) => (
      <div key={sec.id} style={{ marginLeft: depth * 20 }}>
        <div className={`rounded-lg border p-3 ${depth === 0 ? 'bg-card' : depth === 1 ? 'bg-muted/30' : 'bg-muted/15'}`}>
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab flex-shrink-0" />
            <input
              className="flex-1 text-sm font-medium bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 py-0.5"
              value={sec.title}
              onChange={e => setAiGeneratedSections(prev => updateSectionTree(prev, sec.id, s => ({ ...s, title: e.target.value })))}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="添加子章节" onClick={() => setAiGeneratedSections(prev => addChildToSection(prev, sec.id))}>
                <FolderPlus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="删除章节" onClick={() => setAiGeneratedSections(prev => removeSectionFromTree(prev, sec.id))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {sec.paragraphs && sec.paragraphs.length > 0 && (
            <div className="mt-2 ml-7 flex flex-wrap gap-1">
              {sec.paragraphs.map((p, pi) => (
                <span key={pi} className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{p.label}</span>
              ))}
            </div>
          )}
        </div>
        {sec.children && sec.children.length > 0 && (
          <div className="mt-1.5 space-y-1.5">
            {renderSections(sec.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 页头 */}
      <div className="px-6 py-3 border-b shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push('/workspace/ai-insight/templates')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI对话创建模板
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">通过对话描述需求，AI自动生成模板章节结构</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiGeneratedSections.length > 0 && !saved && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5" />重新生成
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave}>
                <Save className="w-3.5 h-3.5" />保存为模板
              </Button>
            </>
          )}
          {saved && (
            <Button size="sm" className="gap-1.5" onClick={() => router.push('/workspace/ai-insight/templates')}>
              <CheckCircle className="w-3.5 h-3.5" />返回模板列表
            </Button>
          )}
        </div>
      </div>

      {/* 主体：左侧对话 + 右侧编辑 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧对话区 */}
        <div className="w-2/5 border-r flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {aiDialogMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap rounded-xl px-3 py-2 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                }`}>
                  {msg.role === 'ai' && (
                    <span className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" />AI模板助手
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          {/* 输入区 */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <textarea
                value={aiDialogInput}
                onChange={e => setAiDialogInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="描述您想创建的模板，例如：月度流量运营分析报告..."
                className="flex-1 text-sm p-2.5 border rounded-lg bg-background resize-none focus:ring-1 focus:ring-primary/30"
                rows={3}
                disabled={saved}
              />
              <Button size="sm" className="h-9 w-9 p-0 shrink-0" onClick={handleSend} disabled={saved || !aiDialogInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧编辑区 */}
        <div className="flex-1 flex flex-col">
          {aiGeneratedSections.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 模板元信息 */}
              <div className="border rounded-lg p-4 bg-card space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-16 flex-shrink-0">模板名称</span>
                  <input
                    className="flex-1 text-sm border rounded px-2.5 py-1.5 bg-transparent focus:ring-1 focus:ring-primary/30"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm text-muted-foreground w-16 flex-shrink-0 mt-1.5">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          aiDialogTags.includes(tag)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                        onClick={() => setAiDialogTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 章节编辑 */}
              <div className="border rounded-lg p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-muted-foreground">
                    模板章节结构（共{countAllSections(aiGeneratedSections)}个章节）
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => {
                    const newSection: TemplateSection = { id: `s-${Date.now()}`, title: '新章节', paragraphs: [] };
                    setAiGeneratedSections(prev => [...prev, newSection]);
                  }}>
                    <Plus className="w-3.5 h-3.5" />添加一级章节
                  </Button>
                </div>
                <div className="space-y-2">
                  {renderSections(aiGeneratedSections)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm">在左侧描述模板需求后</p>
                <p className="text-sm">AI将在此处生成可编辑的章节结构</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
