'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft, CheckCircle, ChevronRight, ChevronDown, FileText, X,
  Upload, Eye, Layers, BarChart3, Type, PenLine, Search, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

type Step = 1 | 2 | 3;

/* ─── 类型 ─── */
interface Paragraph { id: string; title: string; description: string; }
interface Section { id: string; title: string; paragraphs: Paragraph[]; children?: Section[]; }
interface HistoryReport {
  id: string; title: string; type: string; tags: string[];
  sectionCount: number; period: string; createdAt: string;
  sections: Section[];
}

/* ─── 标签体系 ─── */
const tagOptions = ['流量运营', '中高端客户运营', '离网维系', '家庭融合运营', '国际业务运营', '增量运营', 'ARPU分析', '5G渗透', '区域对标', '收入分析', '客户发展'];

/* ─── 模拟历史报告 ─── */
const mockReports: HistoryReport[] = Array.from({ length: 25 }, (_, i) => ({
  id: `r-${i + 1}`,
  title: i < 8
    ? `${['月度经营分析', '流量运营专项', '离网维系专项', '5G渗透分析', 'ARPU归因分析', '区域对标分析', '客户发展月报', '收入预测报告'][i]}报告${String(202606 - Math.floor(i / 2)).slice(0, 6)}`
    : `分析报告${202600 + Math.ceil((i + 1) / 2)}${String(((i % 12) + 1).toString().padStart(2, '0'))}`,
  type: ['report', 'report', 'report', 'report', 'report', 'dashboard', 'report', 'spreadsheet'][i % 8],
  tags: [tagOptions[i % tagOptions.length], tagOptions[(i + 3) % tagOptions.length]],
  sectionCount: 3 + (i % 5),
  period: `2026-${String(((i % 12) + 1)).padStart(2, '0')}`,
  createdAt: `2026-${String(((i % 12) + 1)).padStart(2, '0')}-${String(10 + (i % 20)).padStart(2, '0')} ${10 + (i % 12)}:00`,
  sections: generateMockSections(i),
}));

function generateMockSections(seed: number): Section[] {
  const prefixes = ['一', '二', '三', '四', '五'];
  const topics = ['整体经营概况', '重点业务分析', '区域对比', '策略建议', '风险提示'];
  const subTopics = ['趋势分析', '归因分析', '排名对比', '同比环比', '结构分析'];
  const count = 2 + (seed % 4);
  return prefixes.slice(0, count).map((prefix, idx) => ({
    id: `rs-${seed}-${idx}`,
    title: `${prefix}、${topics[(idx + seed) % topics.length]}`,
    paragraphs: [
      { id: `rp-${seed}-${idx}-0`, title: `${topics[(idx + seed) % topics.length]}概述`, description: `对${topics[(idx + seed) % topics.length]}的总体描述与分析框架` },
      { id: `rp-${seed}-${idx}-1`, title: subTopics[(idx + seed) % subTopics.length], description: `针对${subTopics[(idx + seed) % subTopics.length]}的详细分析` },
    ],
    children: idx === 0 ? [
      {
        id: `rs-${seed}-${idx}-sub1`,
        title: `${prefix}.1 ${subTopics[(idx + seed + 1) % subTopics.length]}`,
        paragraphs: [{ id: `rp-${seed}-${idx}-sub1-0`, title: '指标概览', description: '关键指标数据展示' }],
        children: [],
      },
      {
        id: `rs-${seed}-${idx}-sub2`,
        title: `${prefix}.2 ${subTopics[(idx + seed + 2) % subTopics.length]}`,
        paragraphs: [{ id: `rp-${seed}-${idx}-sub2-0`, title: '深度分析', description: '指标深度归因分析' }],
        children: [],
      },
    ] : [],
  }));
}

const PAGE_SIZE = 8;

/* ─── 预览弹窗 ─── */
function SectionPreview({ sections }: { sections: Section[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    const collect = (list: Section[]) => list.forEach(s => { ids.add(s.id); if (s.children?.length) collect(s.children); });
    collect(sections);
    return ids;
  });

  const toggle = (id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const renderTree = (list: Section[], depth: number = 0) => (
    <div className={depth > 0 ? 'ml-4 border-l-2 border-muted pl-2' : ''}>
      {list.map(s => (
        <div key={s.id} className="mt-1">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm ${depth === 0 ? 'font-semibold' : 'font-medium'} hover:bg-muted/50 cursor-pointer`}
            onClick={() => toggle(s.id)}>
            {s.children?.length ? (expandedIds.has(s.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />) : <span className="w-3" />}
            <span>{s.title}</span>
            {s.children?.length ? <Badge variant="outline" className="text-[10px] h-3.5 px-1 ml-1">{s.children.length}子</Badge> : null}
            <Badge variant="outline" className="text-[10px] h-3.5 px-1">{s.paragraphs.length}段</Badge>
          </div>
          {expandedIds.has(s.id) && (
            <div className="ml-2">
              {s.paragraphs.map(p => (
                <div key={p.id} className="flex items-start gap-1.5 px-2 py-0.5 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{p.title}{p.description ? ` - ${p.description}` : ''}</span>
                </div>
              ))}
              {s.children?.length ? renderTree(s.children, depth + 1) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return <div className="max-h-[400px] overflow-y-auto">{renderTree(sections)}</div>;
}

/* ─── 主页面 ─── */
export default function TemplateExtractPage() {
  const [step, setStep] = useState<Step>(1);
  const [searchText, setSearchText] = useState('');
  const [tagFilter, setTagFilter] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<HistoryReport | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // 筛选 & 分页
  const filtered = useMemo(() => {
    let list = mockReports;
    if (tagFilter !== '全部') list = list.filter(r => r.tags.includes(tagFilter));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.period.includes(q));
    }
    return list;
  }, [searchText, tagFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSelectReport = (report: HistoryReport) => {
    setSelectedReport(report);
    setTemplateName(report.title.replace(/报告\d+$/, '模板'));
    setStep(2);
  };

  const handleSave = () => {
    setStep(3);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    report: <FileText className="w-4 h-4" />,
    dashboard: <BarChart3 className="w-4 h-4" />,
    spreadsheet: <Layers className="w-4 h-4" />,
    summary: <Type className="w-4 h-4" />,
  };
  const typeLabels: Record<string, string> = { report: '报告', dashboard: '看板', spreadsheet: '报表', summary: '摘要' };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 顶部栏 */}
      <div className="px-6 py-3 border-b shrink-0 flex items-center gap-3">
        <Link href="/workspace/ai-insight/templates">
          <Button variant="ghost" size="sm" className="h-8 gap-1"><ArrowLeft className="w-4 h-4" />返回</Button>
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-base font-semibold">从历史报告提取模板</h1>
        {/* 步骤指示器 */}
        <div className="flex items-center gap-2 ml-auto text-xs">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > s ? <CheckCircle className="w-3 h-3" /> : s}
              </div>
              <span className={step >= s ? 'text-foreground' : 'text-muted-foreground'}>
                {['选择报告', '确认模板', '完成'][s - 1]}
              </span>
              {s < 3 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {/* 主体 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* ── Step 1: 选择历史报告 ── */}
          {step === 1 && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }} placeholder="搜索报告名称或账期" className="pl-9 h-8 text-sm" />
                </div>
                <Select value={tagFilter} onValueChange={v => { setTagFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">所有标签</SelectItem>
                    {tagOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground mb-3">共 {filtered.length} 份报告</div>

              <div className="space-y-2">
                {paged.map(report => (
                  <div key={report.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition ${selectedReport?.id === report.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleSelectReport(report)}>
                    <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
                      {typeIcons[report.type] || <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{report.title}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{typeLabels[report.type] || report.type}</Badge>
                        {report.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px] h-4 px-1">{t}</Badge>)}
                        <span>·</span>
                        <span>{report.sectionCount}个章节</span>
                        <span>·</span>
                        <span>{report.period}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{report.createdAt}</div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">{filtered.length} 条 / {PAGE_SIZE}条每页</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(p => (
                      <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" className="h-7 w-7 text-xs p-0" onClick={() => setCurrentPage(p)}>{p}</Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: 确认模板信息 ── */}
          {step === 2 && selectedReport && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="p-4 border rounded-lg">
                <h2 className="text-sm font-semibold mb-3">基本信息</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">模板名称</label>
                    <Input value={templateName} onChange={e => setTemplateName(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">标签</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs gap-1">
                          {tag}<X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                        </Badge>
                      ))}
                    </div>
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="输入标签后回车" className="h-7 text-xs"
                      onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]); setTagInput(''); } }} />
                  </div>
                </div>
              </div>

              {/* 章节结构预览 */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">章节结构</h2>
                  <span className="text-xs text-muted-foreground">来源于：{selectedReport.title}</span>
                </div>
                <SectionPreview sections={selectedReport.sections} />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>上一步</Button>
                <Button size="sm" className="gap-1" onClick={handleSave}><CheckCircle className="w-4 h-4" />保存模板</Button>
              </div>
            </div>
          )}

          {/* ── Step 3: 完成 ── */}
          {step === 3 && (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">模板提取成功</h2>
              <p className="text-sm text-muted-foreground mb-6">模板「{templateName}」已保存到模板库</p>
              <div className="flex justify-center gap-3">
                <Link href="/workspace/ai-insight/templates">
                  <Button variant="outline" size="sm">返回模板管理</Button>
                </Link>
                <Link href="/workspace/ai-insight">
                  <Button size="sm">前往AI洞察助手</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2">
          {toast}<button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
