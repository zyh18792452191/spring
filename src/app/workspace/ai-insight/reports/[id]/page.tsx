'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Archive, RotateCcw, FileText, CheckCircle, AlertTriangle, MessageSquare, Pencil, Trash2, Clock, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { sharedReports, type ReportStatus } from '../../shared-template-data';

/* ─── Mock Data ─── */
interface ReportParagraph {
  id: string;
  title: string;
  content: string;
  chartType?: 'line' | 'bar' | 'pie' | 'none';
  chartTitle?: string;
  editContent?: string;
}

const mockParagraphs: ReportParagraph[] = [
  { id: 'p1', title: '一、整体经营概况', content: '2026年6月，全疆实现营业收入XX亿元，环比增长X.X%，同比增长X.X%。其中移动收入占比XX%，固定收入占比XX%。用户规模持续扩大，总用户数达到XXXX万户，净增XX万户。ARPU值XX元，环比下降X.X%，主要受低价值套餐用户占比提升影响。MOU值XX分钟，DOU值XXGB，流量收入占比持续提升至XX%。', chartType: 'line', chartTitle: '收入趋势图' },
  { id: 'p2', title: '二、收入分析', content: '收入结构分析：移动收入XX亿元（占比XX%），固定收入XX亿元（占比XX%），其他收入XX亿元（占比XX%）。收入变动主要驱动因素：①5G套餐用户渗透率提升，户均收入结构性提升XX元；②政企收入保持两位数增长，同比增长XX%；③漫游收入受资费调整影响，同比下降XX%。', chartType: 'bar', chartTitle: '收入构成对比' },
  { id: 'p3', title: '三、客户发展分析', content: '新增客户：6月新增入网客户XX万户，其中5G套餐客户XX万户（占比XX%）。存量经营：存量客户保有率XX%，较上月提升X个百分点。离网率XX%，控制在年度目标范围内。客户结构：中高端客户占比XX%，较年初提升X个百分点；低价值客户占比XX%，需持续关注价值提升。', chartType: 'pie', chartTitle: '客户结构分布' },
  { id: 'p4', title: '四、流量运营分析', content: '流量规模：全疆DOU达到XXGB/户/月，同比增长XX%。5G用户DOU达到XXGB，是4G用户的X.X倍。流量收入：流量收入XX亿元，占移动收入比重XX%。视频类应用流量占比XX%，社交类XX%，游戏类XX%。流量经营策略成效：不限量套餐用户DOU XXGB，套内流量使用率XX%。', chartType: 'none' },
  { id: 'p5', title: '五、重点业务与建议', content: '重点业务进展：①宽带业务：新增宽带用户XX万户，融合渗透率XX%；②政企专线：新增XX条，收入XX万元；③国际业务：国际漫游收入XX万元，同比增长XX%。运营建议：①持续推动5G套餐迁转，目标渗透率提升至XX%；②加强低价值用户经营，通过精准营销提升ARPU；③加大政企市场拓展力度，重点突破教育、医疗行业。', chartType: 'none' },
];

/* ─── Export Dialog ─── */
function ExportDialog({ onClose, onExport }: { onClose: () => void; onExport: (format: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b"><h3 className="text-lg font-semibold">导出报告</h3></div>
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

/* ─── Archive Confirm Dialog ─── */
function ArchiveDialog({ onClose, onArchive }: { onClose: () => void; onArchive: (archive: boolean) => void }) {
  const [archiveChecked, setArchiveChecked] = useState(true);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b"><h3 className="text-lg font-semibold">确认归档</h3></div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">归档后，此分析成果将出现在报告中心，供后续查看和引用。</p>
          <p className="text-sm">您也可以仅导出文件，暂不归档。</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={archiveChecked} onChange={e => setArchiveChecked(e.target.checked)} className="rounded" />
            同时归档
          </label>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={() => onArchive(archiveChecked)}>
            <Archive className="w-4 h-4 mr-1" />确认归档
          </Button>
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

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const report = sharedReports.find(r => r.id === reportId);

  const statusDisplay: Record<ReportStatus, { label: string; className: string }> = {
    draft: { label: '修改中', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    final: { label: '已定稿', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: '已归档', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  };

  const [isArchived, setIsArchived] = useState(report?.status === 'archived');
  const [paragraphs, setParagraphs] = useState<ReportParagraph[]>(mockParagraphs);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' } | null>(null);
  const [editDialogPara, setEditDialogPara] = useState<ReportParagraph | null>(null);

  // ── 归档操作 ──
  const handleArchive = (archive: boolean) => {
    setShowArchiveDialog(false);
    if (archive) {
      setIsArchived(true);
      setToast({ msg: '归档成功，已添加到报告中心', type: 'success' });
    } else {
      setToast({ msg: '仅导出，未归档', type: 'success' });
    }
  };

  // ── 重新打开 ──
  const handleReopen = () => {
    setIsArchived(false);
    setToast({ msg: '已重新打开，可继续修改', type: 'success' });
  };

  // ── 段落编辑 ──
  const handleStartEdit = (id: string) => {
    const para = paragraphs.find(p => p.id === id);
    if (para) {
      setEditDialogPara({ ...para, editContent: para.content });
    }
  };

  const handleDialogSaveEdit = (id: string) => {
    if (!editDialogPara) return;
    setParagraphs(paragraphs.map(p => p.id === id ? { ...p, content: editDialogPara.editContent || p.content } : p));
    setEditDialogPara(null);
    setToast({ msg: '段落修改已保存', type: 'success' });
  };

  const handleDeleteParagraph = (id: string) => {
    setParagraphs(paragraphs.filter(p => p.id !== id));
    setToast({ msg: '段落已删除', type: 'warning' });
  };

  // ── 导出 ──
  const handleExport = (format: string) => {
    setShowExportDialog(false);
    setToast({ msg: `报告正在导出为${format === 'word' ? 'Word' : 'PDF'}格式...`, type: 'success' });
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 顶部栏 */}
      <div className="px-6 py-3 border-b shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workspace/ai-insight/reports">
            <Button variant="ghost" size="sm" className="h-8 gap-1"><ArrowLeft className="w-4 h-4" />返回列表</Button>
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-base font-semibold">{report?.title ?? '报告详情'}</h1>
          {report && (
            <Badge variant="outline" className={`${statusDisplay[isArchived ? 'archived' : report.status].className} text-xs gap-1`}>
              <CircleAlert className="w-3 h-3" />{statusDisplay[isArchived ? 'archived' : report.status].label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isArchived ? (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleReopen}>
                <RotateCcw className="w-4 h-4" />重新打开
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowExportDialog(true)}>
                <Download className="w-4 h-4" />导出
              </Button>
            </>
          ) : (
            <>
              <Link href={`/workspace/ai-insight?mode=followup&reportId=${params.id}&title=${encodeURIComponent(report?.title ?? '')}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <MessageSquare className="w-4 h-4" />继续追问
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowExportDialog(true)}>
                <Download className="w-4 h-4" />导出
              </Button>
              <Button size="sm" className="gap-1" onClick={() => setShowArchiveDialog(true)}>
                <Archive className="w-4 h-4" />归档
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 报告预览区 */}
        <div className="w-full overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-6">
            {/* 报告标题 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">2026年6月经营分析报告</h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>报告周期：2026年6月</span>
                <span>关联模板：月度经营分析报告 v2.1</span>
                <span>生成时间：06-29 09:15</span>
              </div>
              {isArchived && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-800">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  已归档：此报告已归档到报告中心。如需修改，可点击"重新打开"继续编辑。
                </div>
              )}
            </div>

            {/* 段落列表 */}
            <div className="space-y-4">
              {paragraphs.map(para => (
                <div key={para.id} className="border rounded-lg overflow-hidden">
                  {/* 段落标题栏 */}
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                    <span className="text-sm font-semibold">{para.title}</span>
                    {!isArchived && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-700 hover:text-blue-800" onClick={() => handleStartEdit(para.id)}>
                          <Pencil className="w-3 h-3" />编辑
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => handleDeleteParagraph(para.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* 段落内容 */}
                  <div className="px-4 py-3">
                    <p className="text-sm leading-relaxed">{para.content}</p>
                    {para.chartType && para.chartType !== 'none' && (
                      <div className="mt-3 border border-dashed border-muted-foreground/30 rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {para.chartType === 'line' && (
                            <svg width="120" height="40" viewBox="0 0 120 40" className="opacity-40">
                              <polyline points="0,35 20,28 40,30 60,15 80,18 100,8 120,12" fill="none" stroke="currentColor" strokeWidth="2" />
                              <circle cx="60" cy="15" r="3" fill="currentColor" />
                            </svg>
                          )}
                          {para.chartType === 'bar' && (
                            <svg width="120" height="40" viewBox="0 0 120 40" className="opacity-40">
                              <rect x="5" y="20" width="14" height="20" rx="2" fill="currentColor" opacity="0.6" />
                              <rect x="25" y="10" width="14" height="30" rx="2" fill="currentColor" opacity="0.8" />
                              <rect x="45" y="25" width="14" height="15" rx="2" fill="currentColor" opacity="0.5" />
                              <rect x="65" y="5" width="14" height="35" rx="2" fill="currentColor" opacity="0.9" />
                              <rect x="85" y="18" width="14" height="22" rx="2" fill="currentColor" opacity="0.7" />
                              <rect x="105" y="28" width="14" height="12" rx="2" fill="currentColor" opacity="0.4" />
                            </svg>
                          )}
                          {para.chartType === 'pie' && (
                            <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-40">
                              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.3" />
                              <path d="M20,4 A16,16 0 0,1 36,20 L20,20 Z" fill="currentColor" opacity="0.6" />
                              <path d="M36,20 A16,16 0 0,1 20,36 L20,20 Z" fill="currentColor" opacity="0.4" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{para.chartTitle || (para.chartType === 'line' ? '趋势图' : para.chartType === 'bar' ? '柱状图' : '饼图')}</span>
                        <span className="text-[10px] text-muted-foreground/60">图表区域 · 数据渲染时自动生成</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} onExport={handleExport} />}
      {showArchiveDialog && <ArchiveDialog onClose={() => setShowArchiveDialog(false)} onArchive={handleArchive} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* 编辑段落弹窗 */}
      {editDialogPara && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">编辑段落 - {editDialogPara.title}</h3>
            <Textarea
              value={editDialogPara.editContent ?? editDialogPara.content}
              onChange={e => setEditDialogPara({ ...editDialogPara, editContent: e.target.value })}
              className="min-h-[200px] text-sm"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditDialogPara(null)}>取消</Button>
              <Button onClick={() => { handleDialogSaveEdit(editDialogPara.id); }}>保存修改</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
