'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sharedTemplates, sharedReports, type ReportStatus, type Report } from '../shared-template-data';
import {
  Plus,
  Search,
  FileText,
  Edit3,
  Download,
  Archive,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  X,
  FileUp,
  Upload,
  Filter,
  Layers,
  CalendarDays,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Settings,
  MessageSquarePlus,
  Trash2,
  Tag,
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
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

const statusConfig: Record<ReportStatus, { label: string; className: string; icon: React.ReactNode }> = {
  draft: { label: '修改中', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  final: { label: '已定稿', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  archived: { label: '已归档', className: 'bg-gray-50 text-gray-500 border-gray-200', icon: <Archive className="w-3 h-3" /> },
};

const mockReports: Report[] = [...sharedReports];

/* ─── 模板数据（引用共享数据） ─── */
const templateCategories = ['全部', ...new Set(sharedTemplates.flatMap(t => t.tags))];

const templates = sharedTemplates.map(t => ({
  id: t.id,
  name: t.name,
  version: t.version,
  tags: t.tags,
  chapters: t.chapters,
  usageCount: t.reportCount,
  lastUsed: t.createdAt,
}));

/* ─── 导出弹窗 ─── */
function ExportDialog({ onClose, onExport }: { onClose: () => void; onExport: (format: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[420px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium">导出报告</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">选择导出格式：</p>
          <button onClick={() => onExport('word')} className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <FileText className="w-5 h-5 text-blue-600" />
            <div><div className="text-sm font-medium">Word文档</div><div className="text-xs text-muted-foreground">完整报告，含图表</div></div>
          </button>
          <button onClick={() => onExport('pdf')} className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors text-left">
            <FileText className="w-5 h-5 text-red-600" />
            <div><div className="text-sm font-medium">PDF文档</div><div className="text-xs text-muted-foreground">排版固定的只读版本</div></div>
          </button>
        </div>
        <div className="px-5 py-3 border-t flex justify-end"><Button variant="outline" size="sm" onClick={onClose}>取消</Button></div>
      </div>
    </div>
  );
}

/* ─── 确认弹窗 ─── */
function ConfirmDialog({ title, message, onClose, onConfirm }: { title: string; message: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[380px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium">{title}</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5"><p className="text-sm">{message}</p></div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={onConfirm}>确认</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── 从模板创建弹窗（改造版：搜索+分类+摘要+分步） ─── */
function TemplateCreateDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (name: string, info: { title: string; period: string; region: string }) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportPeriod, setReportPeriod] = useState('2026年6月');
  const [reportRegion, setReportRegion] = useState('全疆');

  const filteredTemplates = templates.filter(t => {
    const matchCategory = activeCategory === '全部' || t.tags.includes(activeCategory);
    const matchSearch = !searchQuery || t.name.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const handleSelectTemplate = (t: typeof templates[0]) => {
    setSelectedTemplate(t);
    setReportTitle(t.name.replace(/ v[\d.]+$/, '') + ' - ' + reportPeriod);
  };

  const handleNext = () => {
    if (selectedTemplate) setStep(2);
  };

  const handleCreate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate.name, { title: reportTitle, period: reportPeriod, region: reportRegion });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[680px] border max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h3 className="font-medium">{step === 1 ? '选择报告模板' : '填写报告信息'}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        {/* 步骤条 */}
        <div className="px-5 py-2 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className={`flex items-center gap-1 ${step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-current">1</span>
              选择模板
            </span>
            <span className="text-muted-foreground">—</span>
            <span className={`flex items-center gap-1 ${step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-current">2</span>
              填写信息
            </span>
          </div>
        </div>

        {/* 第1步：选择模板 */}
        {step === 1 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 搜索+分类 */}
            <div className="px-5 py-3 border-b space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索模板名称..." className="pl-8 h-8 text-sm" />
              </div>
              <div className="flex items-center gap-1.5">
                {templateCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-2.5 py-1 rounded text-xs transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 模板列表 + 摘要 */}
            <div className="flex-1 overflow-y-auto flex min-h-0">
              {/* 左：模板列表 */}
              <div className="w-[280px] border-r overflow-y-auto p-3 space-y-2 shrink-0">
                {filteredTemplates.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">未找到匹配的模板</div>
                )}
                {filteredTemplates.map(t => (
                  <button key={t.id} onClick={() => handleSelectTemplate(t)} className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${selectedTemplate?.id === t.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">{t.tags[0]}</Badge>
                      <span className="text-[10px] text-muted-foreground">{t.version}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 右：模板摘要 */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">{selectedTemplate.name} {selectedTemplate.version}</h4>
                      <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1.5">{selectedTemplate.tags[0]}</Badge>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">章节结构</div>
                      <div className="space-y-1">
                        {selectedTemplate.chapters.map((ch, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px]">{i + 1}</span>
                            {ch}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">数据需求</div>
                      <div className="text-sm text-muted-foreground">使用此模板生成报告时，系统将自动匹配平台指标数据。如需上传外部数据，可在报告生成过程中补充。</div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1.5">使用情况</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>已生成 {selectedTemplate.usageCount} 份报告</span>
                        <span>最近使用 {selectedTemplate.lastUsed}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Layers className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">请从左侧选择一个模板查看详情</p>
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-3 border-t flex justify-end gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
              <Button size="sm" disabled={!selectedTemplate} onClick={handleNext} className="gap-1">
                下一步 <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* 第2步：填写报告信息 */}
        {step === 2 && selectedTemplate && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-medium">{selectedTemplate.name} {selectedTemplate.version}</div>
                <div className="text-xs text-muted-foreground">{selectedTemplate.tags.join('、')} · {selectedTemplate.chapters.length}个章节</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">报告标题 <span className="text-red-500">*</span></label>
                <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="输入报告标题" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />报告周期 <span className="text-red-500">*</span></label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026年6月">月度 · 2026年6月</SelectItem>
                      <SelectItem value="2026年5月">月度 · 2026年5月</SelectItem>
                      <SelectItem value="2026年Q2">季度 · 2026年Q2</SelectItem>
                      <SelectItem value="2026年H1">半年 · 2026年H1</SelectItem>
                      <SelectItem value="2026年Q3">季度 · 2026年Q3</SelectItem>
                      <SelectItem value="2026年">年度 · 2026年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />区域范围</label>
                  <Select value={reportRegion} onValueChange={setReportRegion}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全疆">全疆</SelectItem>
                      <SelectItem value="乌鲁木齐">乌鲁木齐</SelectItem>
                      <SelectItem value="克拉玛依">克拉玛依</SelectItem>
                      <SelectItem value="昌吉">昌吉</SelectItem>
                      <SelectItem value="伊犁">伊犁</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 第2步底部按钮 */}
        {step === 2 && (
          <div className="px-5 py-3 border-t flex justify-end gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>上一步</Button>
            <Button size="sm" disabled={!reportTitle.trim()} onClick={handleCreate} className="gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 创建报告
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 上传数据创建弹窗 ─── */
function UploadDataCreateDialog({ onClose, onUpload }: { onClose: () => void; onUpload: (fileName: string) => void }) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadedFile('6月经分数据.xlsx');
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadedFile('6月经分数据.xlsx');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[480px] border">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-medium">上传数据创建报告</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">上传数据文件，AI将自动识别数据内容并推荐合适的分析模板。</p>

          {/* 上传区域 */}
          {!uploadedFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={handleFileSelect}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}`}
            >
              {uploading ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">正在上传...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
                  <p className="text-xs text-muted-foreground mt-1">支持 CSV、XLSX、XLS 格式</p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-3 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">{uploadedFile}</span>
                <span className="text-xs text-emerald-600">上传成功</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">文件已上传，将在报告生成过程中自动解析字段和数据</div>
            </div>
          )}

          {/* 数据时间范围 */}
          {uploadedFile && (
            <div>
              <label className="text-sm font-medium mb-1 block">数据时间范围</label>
              <Select defaultValue="2026-06">
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-06">月度 · 2026年6月</SelectItem>
                  <SelectItem value="2026-05">月度 · 2026年5月</SelectItem>
                  <SelectItem value="2026-Q2">季度 · 2026年Q2</SelectItem>
                  <SelectItem value="2026-H1">半年 · 2026年H1</SelectItem>
                  <SelectItem value="2026">年度 · 2026年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" disabled={!uploadedFile} onClick={() => uploadedFile && onUpload(uploadedFile)} className="gap-1">
            开始分析 <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast提示 ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); });
  return (
    <div className="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right">
      <CheckCircle className="w-4 h-4" />{message}
    </div>
  );
}

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<{ cityCode: string; cityName: string; gridCode: string; gridName: string }>({ cityCode: '650000', cityName: '全疆', gridCode: '', gridName: '' });
  // 操作员层级：province=省级(全疆可选)，city=地市级(仅本地市+区县+网格)，district=区县级(仅本区县+网格)，grid=网格级(仅本网格)
  const operatorLevel = 'province' as const; // TODO: 从登录态/权限系统获取
  const operatorCityCode = ''; // 地市级操作员的地市code，如'650100'(乌鲁木齐)
  // 根据操作员层级计算maxLevel和allowedCityCode
  const regionMaxLevel = operatorLevel === 'province' ? 'grid' as const : operatorLevel === 'city' ? 'grid' as const : operatorLevel === 'district' ? 'grid' as const : 'district' as const;
  const regionAllowedCity = operatorLevel !== 'province' && operatorCityCode ? operatorCityCode : undefined;
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportReportId, setExportReportId] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveReportId, setArchiveReportId] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = reportTypeFilter === 'all' || (r.period && r.period.includes(reportTypeFilter === 'daily' ? '日' : reportTypeFilter === 'weekly' ? '周' : reportTypeFilter === 'monthly' ? '月' : reportTypeFilter === 'quarterly' ? 'Q' : reportTypeFilter === 'yearly' ? '年' : ''));
    const matchSearch = !searchQuery || r.title.includes(searchQuery) || r.templateName.includes(searchQuery);
    const matchTag = !tagFilter || (r.templateName && r.templateName.includes(tagFilter));
    return matchStatus && matchType && matchSearch && matchTag;
  });

  const handleExport = (format: string) => {
    setShowExportDialog(false);
    const report = reports.find(r => r.id === exportReportId);
    setToastMsg(`${report?.title || '报告'} 已开始导出（${format === 'word' ? 'Word' : 'PDF'}格式）`);
  };

  const handleArchive = () => {
    if (archiveReportId) {
      setReports(reports.map(r => r.id === archiveReportId ? { ...r, status: 'archived' as ReportStatus } : r));
      setToastMsg('报告已归档');
    }
    setShowArchiveDialog(false);
  };

  const router = useRouter();

  const handleTemplateSelect = (name: string, info: { title: string; period: string; region: string }) => {
    setShowTemplateDialog(false);
    // 跳转到AI洞察助手，携带模板上下文参数
    const params = new URLSearchParams({
      mode: 'template',
      templateName: name,
      title: info.title,
      period: info.period,
      region: info.region,
    });
    router.push(`/workspace/ai-insight?${params.toString()}`);
  };

  const handleUploadCreate = (fileName: string) => {
    setShowUploadDialog(false);
    // 跳转到AI洞察助手，携带上传数据上下文参数
    const params = new URLSearchParams({
      mode: 'upload',
      fileName: fileName,
    });
    router.push(`/workspace/ai-insight?${params.toString()}`);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 页头 */}
      <div className="px-6 py-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">报告中心</h1>
            <p className="text-sm text-muted-foreground mt-0.5">管理所有AI洞察报告的生命周期</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/workspace/ai-insight">
              <Button className="gap-1.5"><Plus className="w-4 h-4" />新建报告</Button>
            </Link>
            <Button variant="outline" className="gap-1.5" onClick={() => setShowTemplateDialog(true)}>
              <FileText className="w-4 h-4" />从模板创建
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => setShowUploadDialog(true)}>
              <FileUp className="w-4 h-4" />上传数据创建
            </Button>
            <Link href="/workspace/insight/report/management/create">
              <Button variant="outline" className="gap-1.5">
                <Settings className="w-4 h-4" />常规报告配置
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="px-6 py-3 border-b flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">状态</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="draft">修改中</SelectItem>
              <SelectItem value="final">已归档</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">报告类型</span>
          <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
            <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="daily">日报</SelectItem>
              <SelectItem value="weekly">周报</SelectItem>
              <SelectItem value="monthly">月报</SelectItem>
              <SelectItem value="quarterly">季报</SelectItem>
              <SelectItem value="yearly">年报</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">报告周期</span>
          <Select value={reportTypeFilter === 'all' ? 'monthly' : reportTypeFilter} onValueChange={v => { setReportTypeFilter(v); setPeriodFilter(''); }}>
            <SelectTrigger className="w-16 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">日报</SelectItem>
              <SelectItem value="weekly">周报</SelectItem>
              <SelectItem value="monthly">月报</SelectItem>
              <SelectItem value="quarterly">季报</SelectItem>
              <SelectItem value="yearly">年报</SelectItem>
            </SelectContent>
          </Select>
          {reportTypeFilter === 'daily' && (
            <Input type="date" className="h-8 text-sm w-36" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} />
          )}
          {reportTypeFilter === 'weekly' && (
            <Input type="week" className="h-8 text-sm w-36" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} />
          )}
          {reportTypeFilter === 'monthly' && (
            <Input type="month" className="h-8 text-sm w-36" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} />
          )}
          {reportTypeFilter === 'quarterly' && (
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="选择季度" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => 2025 - i).flatMap(y =>
                  ['Q1', 'Q2', 'Q3', 'Q4'].map(q => <SelectItem key={`${y}-${q}`} value={`${y}-${q}`}>{y}年${q}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          )}
          {reportTypeFilter === 'yearly' && (
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="选择年份" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => 2025 - i).map(y => <SelectItem key={y} value={String(y)}>{y}年</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">区域</span>
          <XinjiangRegionSelector
            value={{ cityCode: regionFilter.cityCode, gridCode: regionFilter.gridCode }}
            onChange={(cityCode: string, cityName: string, gridCode: string, gridName: string) => setRegionFilter({ cityCode, cityName, gridCode, gridName })}
            maxLevel={regionMaxLevel}
            allowedCityCode={regionAllowedCity}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">模板标签</span>
          <div className="relative w-36">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={tagFilter} onChange={e => setTagFilter(e.target.value)} placeholder="搜索标签..." className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索报告标题..." className="pl-8 h-8 text-sm" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">共 {filteredReports.length} 条</span>
      </div>

      {/* 列表区 */}
      <div className="flex-1 overflow-auto px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">报告标题</TableHead>
              <TableHead className="w-20">状态</TableHead>
              <TableHead className="w-[180px]">模板标签</TableHead>
              <TableHead className="w-28">报告周期</TableHead>
              <TableHead className="w-28">创建时间</TableHead>
              <TableHead className="w-28">最后编辑</TableHead>
              <TableHead className="w-16">创建人</TableHead>
              <TableHead className="w-[140px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map(report => {
              const sc = statusConfig[report.status];
              return (
                <TableRow key={report.id} className="group">
                  <TableCell className="font-medium">
                    <Link href={`/workspace/ai-insight/reports/${report.id}`} className="hover:text-primary flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />{report.title}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={`${sc.className} text-xs gap-1`}>{sc.icon}{sc.label}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{report.templateName || '—'}</TableCell>
                  <TableCell className="text-sm">{report.period}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{report.createdAt}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{report.updatedAt}</TableCell>
                  <TableCell className="text-sm">{report.creator}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {report.status === 'draft' && (
                        <>
                          <Link href={`/workspace/ai-insight?mode=edit&reportId=${report.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Edit3 className="w-3 h-3" />继续对话</Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setArchiveReportId(report.id); setShowArchiveDialog(true); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {report.status === 'final' && (
                        <>
                          <Link href={`/workspace/ai-insight?mode=followup&reportId=${report.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Edit3 className="w-3 h-3" />重新打开</Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setExportReportId(report.id); setShowExportDialog(true); }}>
                            <Download className="w-3 h-3" />导出
                          </Button>
                        </>
                      )}
                      {report.status === 'archived' && (
                        <Link href={`/workspace/ai-insight/reports/${report.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" />查看</Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className="px-6 py-3 border-t flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground">显示 1-{filteredReports.length} / 共 {filteredReports.length} 条</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>上一页</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs w-7 bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs w-7">2</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs w-7">3</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">下一页</Button>
        </div>
      </div>

      {/* 弹窗们 */}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} onExport={handleExport} />}
      {showArchiveDialog && <ConfirmDialog title="确认归档" message={`确定要将此报告归档吗？归档后可随时"重新打开"继续修改。`} onClose={() => setShowArchiveDialog(false)} onConfirm={handleArchive} />}
      {showTemplateDialog && <TemplateCreateDialog onClose={() => setShowTemplateDialog(false)} onSelect={handleTemplateSelect} />}
      {showUploadDialog && <UploadDataCreateDialog onClose={() => setShowUploadDialog(false)} onUpload={handleUploadCreate} />}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
