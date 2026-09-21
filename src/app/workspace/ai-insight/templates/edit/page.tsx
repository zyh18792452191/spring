'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Save, Eye, Plus, Trash2, ChevronDown, ChevronRight,
  GripVertical, FileText, Sparkles, Settings, X, ChevronUp, CornerDownRight,
} from 'lucide-react';

/* ─── 类型 ─── */
interface Paragraph {
  id: string;
  title: string;
  description: string;
}

interface Section {
  id: string;
  title: string;
  expanded: boolean;
  paragraphs: Paragraph[];
  children?: Section[];
}

let nextId = 100;
const genId = () => `s_${nextId++}`;
const genParaId = () => `p_${nextId++}`;

const emptySection = (): Section => ({ id: genId(), title: '', expanded: true, paragraphs: [], children: [] });
const emptyParagraph = (): Paragraph => ({ id: genParaId(), title: '', description: '' });

/* ─── 模拟AI生成大纲 ─── */
const aiOutline: Section[] = [
  { id: 'ai1', title: '一、整体经营概况', expanded: true, paragraphs: [
    { id: 'aip1', title: '章节概述', description: '概述本月经营总体表现，核心KPI达成情况' },
    { id: 'aip2', title: '核心指标概览', description: '移动ARPU/用户数/DOU/收入等核心指标数据展示与同比环比分析' },
  ], children: [
    { id: 'ai1-1', title: '1.1 移动业务指标', expanded: true, paragraphs: [
      { id: 'aip3', title: '5G业务指标', description: '5G用户数、5G DOU、5G渗透率' },
      { id: 'aip4', title: '4G业务指标', description: '4G用户数、4G DOU、4G流量占比' },
    ], children: [] },
    { id: 'ai1-2', title: '1.2 固网业务指标', expanded: false, paragraphs: [
      { id: 'aip5', title: '宽带业务指标', description: '宽带用户数、宽带ARPU、宽带渗透率' },
    ], children: [] },
  ] },
  { id: 'ai2', title: '二、重点业务分析', expanded: false, paragraphs: [], children: [
    { id: 'ai2-1', title: '2.1 流量运营', expanded: false, paragraphs: [
      { id: 'aip6', title: 'DOU趋势分析', description: '整体DOU及分地市DOU趋势' },
      { id: 'aip7', title: '5G流量占比', description: '5G流量在总流量中的占比及变化' },
    ], children: [] },
    { id: 'ai2-2', title: '2.2 客户发展', expanded: false, paragraphs: [
      { id: 'aip8', title: '新增客户分析', description: '新增客户结构及渠道贡献' },
    ], children: [
      { id: 'ai2-2-1', title: '2.2.1 新增客户渠道分析', expanded: false, paragraphs: [
        { id: 'aip9', title: '线上渠道贡献', description: 'APP/微信/线上商城新增占比' },
        { id: 'aip10', title: '线下渠道贡献', description: '营业厅/网格新增占比' },
      ], children: [] },
    ] },
  ] },
  { id: 'ai3', title: '三、区域对比', expanded: false, paragraphs: [
    { id: 'aip11', title: '地市排名与对比', description: '16地市核心指标排名与差异分析' },
  ], children: [] },
  { id: 'ai4', title: '四、策略建议', expanded: false, paragraphs: [
    { id: 'aip12', title: '策略建议与风险提示', description: '基于分析的策略建议与风险提示' },
  ], children: [] },
];

/* ─── 预览弹窗 ─── */
function PreviewDialog({ sections, templateName, onClose }: { sections: Section[]; templateName: string; onClose: () => void }) {
  const renderSection = (s: Section, depth: number = 0) => (
    <div key={s.id} className={`${depth > 0 ? 'ml-4 mt-2' : 'mt-2 first:mt-0'}`}>
      <div className={`px-3 py-1.5 text-sm font-semibold rounded-t-md ${depth === 0 ? 'bg-muted/40' : depth === 1 ? 'bg-muted/25' : 'bg-muted/15'}`}>{s.title || '未命名章节'}</div>
      <div className="px-3 py-2 space-y-1.5 border border-t-0 rounded-b-md">
        {s.paragraphs.map(p => (
          <div key={p.id} className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <span className="text-sm font-medium">{p.title || '未命名段落'}</span>
              {p.description && <span className="text-xs text-muted-foreground ml-1">({p.description})</span>}
            </div>
          </div>
        ))}
        {s.children?.map(child => renderSection(child, depth + 1))}
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-xl w-[640px] max-h-[80vh] border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h3 className="font-semibold text-sm">模板预览：{templateName || '未命名模板'}</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {sections.map(s => renderSection(s, 0))}
        </div>
      </div>
    </div>
  );
}

/* ─── 递归章节编辑器 ─── */
function SectionEditor({
  section,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
  onAddParagraph,
  onDeleteParagraph,
  onUpdateParagraph,
  onMoveUp,
  onMoveDown,
}: {
  section: Section;
  depth: number;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddParagraph: (sectionId: string) => void;
  onDeleteParagraph: (sectionId: string, paraId: string) => void;
  onUpdateParagraph: (sectionId: string, paraId: string, field: 'title' | 'description', value: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [addingPara, setAddingPara] = useState(false);
  const [newParaTitle, setNewParaTitle] = useState('');
  const indent = depth * 20;
  const depthBg = depth === 0 ? 'bg-muted/30' : depth === 1 ? 'bg-muted/15' : 'bg-muted/8';

  return (
    <div style={{ marginLeft: indent }} className="mt-2 first:mt-0">
      <div className={`border rounded-lg overflow-hidden`}>
        {/* 章节标题行 */}
        <div className={`flex items-center gap-1.5 px-3 py-2 ${depthBg} cursor-pointer`}
          onClick={() => onUpdate(section.id, section.title)}>

          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab shrink-0" />

          <button onClick={(e) => { e.stopPropagation(); onUpdate(section.id, section.title); }}
            className="shrink-0" >
            {section.expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <Input
            value={section.title}
            onChange={e => onUpdate(section.id, e.target.value)}
            className="h-6 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 flex-1 min-w-0"
            placeholder="章节标题"
            onClick={e => e.stopPropagation()}
          />

          <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
            {section.children?.length || 0}子 {section.paragraphs.length}段
          </Badge>

          <div className="flex items-center gap-0.5 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
            <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground" onClick={() => onMoveUp(section.id)} title="上移">
              <ChevronUp className="w-3 h-3" />
            </button>
            <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground" onClick={() => onMoveDown(section.id)} title="下移">
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground" onClick={() => onAddChild(section.id)} title="添加子章节">
              <CornerDownRight className="w-3 h-3" />
            </button>
            <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-100 text-red-400 hover:text-red-600" onClick={() => onDelete(section.id)} title="删除章节">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 展开内容 */}
        {section.expanded && (
          <div className="px-3 py-2.5 space-y-2">
            {/* 段落列表 */}
            {section.paragraphs.map(para => (
              <div key={para.id} className="flex items-start gap-2 p-2 border rounded-md bg-background">
                <FileText className="w-3.5 h-3.5 mt-1.5 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-1 min-w-0">
                  <Input value={para.title} onChange={e => onUpdateParagraph(section.id, para.id, 'title', e.target.value)} className="h-6 text-sm border-0 p-0 focus-visible:ring-0" placeholder="段落标题" />
                  <Input value={para.description} onChange={e => onUpdateParagraph(section.id, para.id, 'description', e.target.value)} placeholder="这个段落要分析什么" className="h-5 text-xs border-0 p-0 focus-visible:ring-0 text-muted-foreground" />
                </div>
                <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600 shrink-0 mt-0.5" onClick={() => onDeleteParagraph(section.id, para.id)}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* 添加段落 */}
            {addingPara ? (
              <div className="flex items-center gap-2 p-2 border border-dashed rounded-md bg-muted/10">
                <Input value={newParaTitle} onChange={e => setNewParaTitle(e.target.value)} placeholder="段落标题" className="h-6 text-xs flex-1" onKeyDown={e => {
                  if (e.key === 'Enter' && newParaTitle.trim()) {
                    onAddParagraph(section.id);
                    setNewParaTitle('');
                    setAddingPara(false);
                  }
                }} />
                <Button size="sm" className="h-6 text-xs" onClick={() => {
                  if (newParaTitle.trim()) {
                    onAddParagraph(section.id);
                    setNewParaTitle('');
                    setAddingPara(false);
                  }
                }}>添加</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setAddingPara(false); setNewParaTitle(''); }}>取消</Button>
              </div>
            ) : (
              <button className="flex items-center gap-1 w-full p-1.5 border border-dashed rounded-md text-xs text-muted-foreground hover:bg-muted/10" onClick={() => setAddingPara(true)}>
                <Plus className="w-3 h-3" />添加段落
              </button>
            )}

            {/* 子章节递归渲染 */}
            {section.children?.map(child => (
              <SectionEditor
                key={child.id}
                section={child}
                depth={depth + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onAddParagraph={onAddParagraph}
                onDeleteParagraph={onDeleteParagraph}
                onUpdateParagraph={onUpdateParagraph}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            ))}

            {/* 添加子章节快捷按钮 */}
            <button className="flex items-center gap-1 w-full p-1.5 border border-dashed rounded-md text-xs text-muted-foreground hover:bg-muted/10" onClick={() => onAddChild(section.id)}>
              <CornerDownRight className="w-3 h-3" />添加子章节
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 主页面 ─── */
export default function TemplateEditPage() {
  const [templateName, setTemplateName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sections, setSections] = useState<Section[]>([emptySection()]);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── 递归查找 & 更新工具 ──
  const findAndUpdate = useCallback((list: Section[], id: string, updater: (s: Section) => Section): Section[] => {
    return list.map(s => {
      if (s.id === id) return updater(s);
      if (s.children?.length) return { ...s, children: findAndUpdate(s.children, id, updater) };
      return s;
    });
  }, []);

  const findAndDelete = useCallback((list: Section[], id: string): Section[] => {
    return list.filter(s => s.id !== id).map(s => {
      if (s.children?.length) return { ...s, children: findAndDelete(s.children, id) };
      return s;
    });
  }, []);

  const findAndAddChild = useCallback((list: Section[], parentId: string, child: Section): Section[] => {
    return list.map(s => {
      if (s.id === parentId) return { ...s, children: [...(s.children || []), child], expanded: true };
      if (s.children?.length) return { ...s, children: findAndAddChild(s.children, parentId, child) };
      return s;
    });
  }, []);

  const findAndAddParagraph = useCallback((list: Section[], sectionId: string, para: Paragraph): Section[] => {
    return list.map(s => {
      if (s.id === sectionId) return { ...s, paragraphs: [...s.paragraphs, para] };
      if (s.children?.length) return { ...s, children: findAndAddParagraph(s.children, sectionId, para) };
      return s;
    });
  }, []);

  const findAndDeleteParagraph = useCallback((list: Section[], sectionId: string, paraId: string): Section[] => {
    return list.map(s => {
      if (s.id === sectionId) return { ...s, paragraphs: s.paragraphs.filter(p => p.id !== paraId) };
      if (s.children?.length) return { ...s, children: findAndDeleteParagraph(s.children, sectionId, paraId) };
      return s;
    });
  }, []);

  const findAndUpdateParagraph = useCallback((list: Section[], sectionId: string, paraId: string, field: 'title' | 'description', value: string): Section[] => {
    return list.map(s => {
      if (s.id === sectionId) return { ...s, paragraphs: s.paragraphs.map(p => p.id === paraId ? { ...p, [field]: value } : p) };
      if (s.children?.length) return { ...s, children: findAndUpdateParagraph(s.children, sectionId, paraId, field, value) };
      return s;
    });
  }, []);

  // 移动章节：在同一层级内上移/下移
  const findAndMove = useCallback((list: Section[], id: string, direction: 'up' | 'down'): Section[] => {
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return list;
      const newList = [...list];
      [newList[idx], newList[targetIdx]] = [newList[targetIdx], newList[idx]];
      return newList;
    }
    return list.map(s => {
      if (s.children?.length) return { ...s, children: findAndMove(s.children, id, direction) };
      return s;
    });
  }, []);

  // ── 操作回调 ──
  const handleUpdateTitle = (id: string, title: string) => {
    setSections(prev => findAndUpdate(prev, id, s => ({ ...s, title })));
  };

  const handleToggleExpand = (id: string) => {
    setSections(prev => findAndUpdate(prev, id, s => ({ ...s, expanded: !s.expanded })));
  };

  const handleDelete = (id: string) => {
    setSections(prev => findAndDelete(prev, id));
  };

  const handleAddChild = (parentId: string) => {
    const child = emptySection();
    setSections(prev => findAndAddChild(prev, parentId, child));
  };

  const handleAddParagraph = (sectionId: string) => {
    const para = emptyParagraph();
    setSections(prev => findAndAddParagraph(prev, sectionId, para));
  };

  const handleDeleteParagraph = (sectionId: string, paraId: string) => {
    setSections(prev => findAndDeleteParagraph(prev, sectionId, paraId));
  };

  const handleUpdateParagraph = (sectionId: string, paraId: string, field: 'title' | 'description', value: string) => {
    setSections(prev => findAndUpdateParagraph(prev, sectionId, paraId, field, value));
  };

  const handleMoveUp = (id: string) => {
    setSections(prev => findAndMove(prev, id, 'up'));
  };

  const handleMoveDown = (id: string) => {
    setSections(prev => findAndMove(prev, id, 'down'));
  };

  const handleSave = () => {
    setToast('模板已保存');
  };

  // 计算统计
  const countAll = (list: Section[]): { sections: number; paragraphs: number; maxDepth: number } => {
    let s = list.length, p = 0, d = 0;
    for (const item of list) {
      p += item.paragraphs.length;
      if (item.children?.length) {
        const sub = countAll(item.children);
        s += sub.sections;
        p += sub.paragraphs;
        d = Math.max(d, sub.maxDepth + 1);
      }
    }
    return { sections: s, paragraphs: p, maxDepth: d };
  };
  const stats = countAll(sections);

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 顶部栏 */}
      <div className="px-6 py-3 border-b shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workspace/ai-insight/templates">
            <Button variant="ghost" size="sm" className="h-8 gap-1"><ArrowLeft className="w-4 h-4" />返回</Button>
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-base font-semibold">编辑模板</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4" />预览
          </Button>
          <Link href="/workspace/ai-insight/templates">
            <Button variant="outline" size="sm">取消</Button>
          </Link>
          <Button size="sm" className="gap-1" onClick={handleSave}>
            <Save className="w-4 h-4" />保存
          </Button>
        </div>
      </div>

      {/* 主体 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* 基本信息 */}
          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Settings className="w-4 h-4" />基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">模板名称</label>
                <Input value={templateName} onChange={e => setTemplateName(e.target.value)} className="h-8 text-sm" placeholder="输入模板名称" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">标签</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="输入标签后回车"
                    className="h-7 text-xs flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!tags.includes(tagInput.trim())) {
                          setTags([...tags, tagInput.trim()]);
                        }
                        setTagInput('');
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 章节结构 */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              章节结构
              <span className="text-xs font-normal text-muted-foreground ml-2">
                {stats.sections}个章节 · {stats.paragraphs}个段落 · {stats.maxDepth + 1}级深度
              </span>
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" disabled={generatingOutline} onClick={() => {
                setGeneratingOutline(true);
                setTimeout(() => {
                  setSections(aiOutline.map(s => ({ ...s, expanded: true })));
                  setGeneratingOutline(false);
                }, 1500);
              }}>
                <Sparkles className="w-3 h-3" />{generatingOutline ? '生成中...' : 'AI生成大纲'}
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setSections(prev => [...prev, emptySection()])}>
                <Plus className="w-3 h-3" />添加一级章节
              </Button>
            </div>
          </div>

          <div className="space-y-0">
            {sections.map(section => (
              <SectionEditor
                key={section.id}
                section={section}
                depth={0}
                onUpdate={handleUpdateTitle}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onAddParagraph={handleAddParagraph}
                onDeleteParagraph={handleDeleteParagraph}
                onUpdateParagraph={handleUpdateParagraph}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
            {sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                暂无章节，点击"添加一级章节"或"AI生成大纲"开始
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      {showPreview && <PreviewDialog sections={sections} templateName={templateName} onClose={() => setShowPreview(false)} />}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2">
          {toast}
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
