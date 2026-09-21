'use client';

import { useState, useEffect } from 'react';
import { sharedTemplates, type SharedTemplate, type TemplateSection } from '../shared-template-data';
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit3,
  Trash2,
  Upload,
  ChevronRight,
  Layers,
  BarChart3,
  Type,
  PenLine,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  PlusCircle,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

type Template = SharedTemplate;

const mockTemplates: Template[] = [...sharedTemplates];
const paragraphTypeConfig = {
  fixed: { label: '固定文字', icon: <Type className="w-3.5 h-3.5" />, className: 'text-blue-600 bg-blue-50' },
  data: { label: '数据填充', icon: <BarChart3 className="w-3.5 h-3.5" />, className: 'text-emerald-600 bg-emerald-50' },
  narrative: { label: '动态叙述', icon: <PenLine className="w-3.5 h-3.5" />, className: 'text-purple-600 bg-purple-50' },
  chart: { label: '图表', icon: <Layers className="w-3.5 h-3.5" />, className: 'text-amber-600 bg-amber-50' },
};

function SectionTree({ sections, depth = 0 }: { sections: TemplateSection[]; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l pl-3' : ''}>
      {sections.map(section => (
        <div key={section.id} className="mb-2">
          <div className="flex items-center gap-1.5 py-1">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{section.title}</span>
          </div>
          {section.paragraphs.length > 0 && (
            <div className="ml-5 space-y-1">
              {section.paragraphs.map((p, i) => {
                const tc = paragraphTypeConfig[p.type];
                return (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <Badge variant="outline" className={`${tc.className} text-xs gap-1 h-5 px-1.5 border-0`}>
                      {tc.icon}{tc.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{p.label}</span>
                    {p.description && (
                      <span className="text-xs text-muted-foreground/60">({p.description})</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {section.children && <SectionTree sections={section.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
}

/* ─── 删除确认弹窗 ─── */
function DeleteConfirmDialog({ templateName, onClose, onConfirm }: { templateName: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[400px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />确认删除</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5">
          <p className="text-sm">确定要删除模板 <strong>{templateName}</strong> 吗？</p>
          <p className="text-xs text-muted-foreground mt-2">删除后，已使用该模板生成的报告不受影响，但后续无法再使用此模板创建新报告。</p>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>确认删除</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'warning'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); });
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <div className={`fixed top-4 right-4 z-[60] ${bg} text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{message}
    </div>
  );
}

export default function TemplatesPage() {
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [tagSearch, setTagSearch] = useState<string>('');
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' } | null>(null);

  const allTags = Array.from(new Set(templates.flatMap(t => t.tags)));

  const filteredTemplates = templates.filter(t => {
    const matchTag = tagFilter === 'all' || t.tags.includes(tagFilter);
    const matchSearch = !searchQuery || t.name.includes(searchQuery) || t.tags.some(tag => tag.includes(searchQuery));
    return matchTag && matchSearch;
  });

  const handleDelete = () => {
    if (deleteTarget) {
      setTemplates(templates.filter(t => t.id !== deleteTarget.id));
      setToast({ msg: `模板"${deleteTarget.name}"已删除`, type: 'warning' });
      if (selectedTemplate?.id === deleteTarget.id) setSelectedTemplate(null);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 页头 */}
      <div className="px-6 py-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">模板管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">管理报告模板的创建、提取、编辑和使用</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/workspace/ai-insight/templates/ai-create">
              <Button className="gap-1.5"><Sparkles className="w-4 h-4" />AI对话创建模板</Button>
            </Link>
            <Link href="/workspace/ai-insight/templates/extract">
              <Button variant="outline" className="gap-1.5"><Upload className="w-4 h-4" />从历史报告提取</Button>
            </Link>
            <Link href="/workspace/ai-insight/templates/edit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              手动新建模板
            </Link>
          </div>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="px-6 py-3 border-b flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">标签:</span>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input value={tagSearch} onChange={e => { setTagSearch(e.target.value); setShowTagDropdown(true); }} onFocus={() => setShowTagDropdown(true)} placeholder="搜索标签..." className="pl-7 h-8 text-sm w-40" />
            {showTagDropdown && tagSearch && (
              <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-40 overflow-auto w-40">
                {allTags.filter(t => t.includes(tagSearch) && t !== tagFilter).map(tag => (
                  <button key={tag} className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent" onClick={() => { setTagFilter(tag); setTagSearch(''); setShowTagDropdown(false); }}>{tag}</button>
                ))}
                {allTags.filter(t => t.includes(tagSearch) && t !== tagFilter).length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">无匹配标签</div>}
              </div>
            )}
          </div>
          {tagFilter !== 'all' && <Badge variant="secondary" className="text-xs h-5 gap-1">{tagFilter}<X className="w-3 h-3 cursor-pointer" onClick={() => setTagFilter('all')} /></Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">来源:</span>
          <Select>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="全部来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="ai">AI创建</SelectItem>
              <SelectItem value="extract">历史报告提取</SelectItem>
              <SelectItem value="create">手动创建</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">搜索:</span>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="模板名称..." className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">共 {filteredTemplates.length} 个模板</span>
      </div>

      {/* 卡片列表区 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedTemplate(template)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                </div>
                <Badge variant="outline" className="text-xs h-5">{template.version}</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between"><span>标签</span><span className="text-foreground">{template.tags.join('、')}</span></div>
                <div className="flex items-center justify-between"><span>关联报告</span><span className="text-foreground">{template.reportCount}份</span></div>
                <div className="flex items-center justify-between"><span>创建时间</span><span>{template.createdAt}</span></div>
                <div className="flex items-center justify-between"><span>来源</span><Badge variant="secondary" className="text-xs h-5">{template.source === 'ai' ? 'AI创建' : template.source === 'extract' ? '历史报告提取' : '手动创建'}</Badge></div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center gap-1.5">
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={e => { e.stopPropagation(); setSelectedTemplate(template); }}>
                  <Eye className="w-3 h-3 mr-0.5" />详情
                </Button>
                <Link href="/workspace/ai-insight/templates/edit" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 text-xs"><Edit3 className="w-3 h-3" /></Button>
                </Link>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-600" onClick={e => { e.stopPropagation(); setDeleteTarget(template); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 模板详情弹窗 */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedTemplate?.name} {selectedTemplate?.version}
              <Badge variant="secondary" className="text-xs ml-2">{selectedTemplate?.source === 'ai' ? 'AI创建' : selectedTemplate?.source === 'extract' ? '历史报告提取' : '手动创建'}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-muted/50 rounded px-3 py-2"><div className="text-xs text-muted-foreground">标签</div><div className="font-medium">{selectedTemplate.tags.join('、')}</div></div>
                <div className="bg-muted/50 rounded px-3 py-2"><div className="text-xs text-muted-foreground">关联报告</div><div className="font-medium">{selectedTemplate.reportCount}份</div></div>
                <div className="bg-muted/50 rounded px-3 py-2"><div className="text-xs text-muted-foreground">创建时间</div><div className="font-medium">{selectedTemplate.createdAt}</div></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">章节结构</h3>
                <div className="border rounded-lg p-3"><SectionTree sections={selectedTemplate.sections} /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Link href="/workspace/ai-insight/templates/edit" onClick={() => setSelectedTemplate(null)}>
                  <Button variant="outline" className="gap-1.5"><Edit3 className="w-4 h-4" />编辑模板</Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      {deleteTarget && <DeleteConfirmDialog templateName={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
}
