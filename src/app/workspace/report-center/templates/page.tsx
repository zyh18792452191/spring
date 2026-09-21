'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Plus, Info, Search, X, Pencil, Trash2, Users, Monitor } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { REPORT_TEMPLATES, addTemplate } from '../data/templateData';
import { REPORT_CATEGORIES, getCategoryById, CATEGORY_COLOR_MAP } from '../data/categoryData';
import { countLeafColumns } from '../data/mockReportData';
import { ColumnConfigNode, TemplateSource } from '../data/types';
import { getLeafColumns } from '../data/reportRunData';

// ==================== 表头预览(简化版) ====================

interface SimpleHeaderPreviewProps {
  columnConfig: ColumnConfigNode[];
}

function SimpleHeaderPreview({ columnConfig }: SimpleHeaderPreviewProps) {
  const maxDepth = getMaxColDepth(columnConfig, 1);
  const matrix = buildHeaderMatrix(columnConfig, maxDepth);

  return (
    <div className="overflow-auto border border-border rounded-lg max-h-[400px]">
      <table className="w-full text-[11px] border-collapse min-w-max">
        <thead>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell) => (
                <th
                  key={`${cell.id}-${ri}`}
                  rowSpan={cell.rowSpan}
                  colSpan={cell.colSpan}
                  className="border border-border px-1.5 py-1 text-center font-medium text-muted-foreground bg-muted/60 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-0.5">
                    {cell.title}
                    {cell.isLeaf && cell.tooltip && (
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-2.5 h-2.5 text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">{cell.tooltip}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <tr>
            {getLeafColumns(columnConfig).map(col => (
              <td key={col.id} className="border border-border px-1.5 py-0.5 text-center text-muted-foreground/30">
                {col.type === 'region' ? '区域' : col.type === 'action' ? '操作' : '...'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getMaxColDepth(nodes: ColumnConfigNode[], d = 1): number {
  let max = d;
  for (const n of nodes) {
    if (n.children && n.children.length > 0) max = Math.max(max, getMaxColDepth(n.children, d + 1));
  }
  return max;
}

interface ColumnRenderDef {
  id: string; title: string; tooltip?: string; rowSpan: number; colSpan: number; depth: number;
  fixed?: 'left' | 'right'; isLeaf: boolean;
}

function buildHeaderMatrix(nodes: ColumnConfigNode[], maxDepth: number): ColumnRenderDef[][] {
  const rows: ColumnRenderDef[][] = Array.from({ length: maxDepth }, () => []);
  function walk(node: ColumnConfigNode, depth: number): number {
    if (!node.children || node.children.length === 0) {
      rows[depth].push({ id: node.id, title: node.title, tooltip: node.tooltip, rowSpan: maxDepth - depth, colSpan: 1, depth, fixed: node.fixed, isLeaf: true });
      return 1;
    }
    let span = 0;
    for (const child of node.children) span += walk(child, depth + 1);
    rows[depth].push({ id: node.id, title: node.title, rowSpan: 1, colSpan: span, depth, fixed: node.fixed, isLeaf: false });
    return span;
  }
  for (const node of nodes) walk(node, 0);
  return rows;
}

// ==================== 来源筛选标签 ====================

type SourceFilter = 'all' | 'system' | 'user';

const SOURCE_FILTER_OPTIONS: { value: SourceFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: '全部', icon: null },
  { value: 'system', label: '系统预置', icon: <Monitor className="w-3.5 h-3.5" /> },
  { value: 'user', label: '用户创建', icon: <Users className="w-3.5 h-3.5" /> },
];

// ==================== 主页面 ====================

export default function TemplateManagePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState(REPORT_TEMPLATES);

  const filteredTemplates = useMemo(() => {
    let result = templates;
    // 来源筛选
    if (sourceFilter === 'system') {
      result = result.filter(t => t.source === 'system');
    } else if (sourceFilter === 'user') {
      result = result.filter(t => t.source === 'user');
    }
    // 关键字搜索
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(t =>
        t.templateName.toLowerCase().includes(lower) ||
        t.templateDesc.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [templates, search, sourceFilter]);

  // 统计
  const systemCount = templates.filter(t => t.source === 'system').length;
  const userCount = templates.filter(t => t.source === 'user').length;

  const previewTemplate = previewTemplateId
    ? templates.find(t => t.templateId === previewTemplateId)
    : null;

  // 删除用户模板
  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.templateId === templateId);
    if (!template) return;
    if (template.source === 'system') return; // 系统模板不可删除
    if (template.usageCount > 0) {
      alert(`该模板已被 ${template.usageCount} 个报表引用，无法删除。请先删除关联的报表。`);
      return;
    }
    if (confirm('确定删除该模板？删除后不可恢复。')) {
      setTemplates(prev => prev.filter(t => t.templateId !== templateId));
    }
  };

  // 编辑用户模板（跳转到组装器，带模板ID参数）
  const handleEditTemplate = (templateId: string) => {
    router.push(`/workspace/report-center/create?editTemplate=${templateId}`);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="mb-3">
          <h1 className="text-xl font-semibold text-foreground">模板管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">预设报表模板，快速创建报表</p>
        </div>

        <div className="flex items-center gap-4">
          {/* 来源筛选 */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {SOURCE_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSourceFilter(opt.value)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sourceFilter === opt.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.icon}
                {opt.label}
                {opt.value === 'system' && (
                  <span className="ml-0.5 text-muted-foreground">({systemCount})</span>
                )}
                {opt.value === 'user' && (
                  <span className="ml-0.5 text-muted-foreground">({userCount})</span>
                )}
              </button>
            ))}
          </div>

          {/* 搜索 */}
          <div className="relative max-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模板名称..."
              className="w-full h-9 pl-9 pr-3 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            {sourceFilter === 'user' ? '暂无用户创建的模板，可通过报表"另存为模板"创建' : '没有匹配的模板'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => {
              const category = getCategoryById(template.categoryId);
              const colorMap = category ? CATEGORY_COLOR_MAP[category.color] : CATEGORY_COLOR_MAP.gray;
              const colCount = countLeafColumns(template.columnConfig);
              const isSystem = template.source === 'system';

              return (
                <div key={template.templateId} className="border border-border rounded-lg bg-card p-4 hover:shadow-md transition-shadow">
                  {/* 顶部分类 + 来源标签 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
                        {category?.categoryName || '其他'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                        isSystem
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {isSystem ? '系统预置' : '用户创建'}
                      </span>
                    </div>
                    {/* 用户模板显示创建人 */}
                    {!isSystem && template.createdBy && (
                      <span className="text-xs text-muted-foreground">{template.createdBy}</span>
                    )}
                  </div>

                  {/* 模板名称 + 描述 */}
                  <h3 className="text-sm font-medium text-foreground mb-1">{template.templateName}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.templateDesc}</p>

                  {/* 统计 */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>{colCount} 列</span>
                    <span>覆盖 {template.regionDimensions.length} 级区域</span>
                    <span>引用 {template.usageCount} 次</span>
                  </div>

                  {/* 操作 */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => setPreviewTemplateId(template.templateId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-input rounded-md text-xs hover:bg-muted transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> 预览
                    </button>
                    <button
                      onClick={() => router.push(`/workspace/report-center/create?template=${template.templateId}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> 基于此创建
                    </button>
                    {/* 用户模板支持编辑和删除 */}
                    {!isSystem && (
                      <>
                        <button
                          onClick={() => handleEditTemplate(template.templateId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-input rounded-md text-xs hover:bg-muted transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> 编辑
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.templateId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-md text-xs hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 预览弹窗 */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPreviewTemplateId(null)} />
          <div className="relative w-[90vw] max-w-[1200px] max-h-[80vh] bg-popover border border-border rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{previewTemplate.templateName}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                    previewTemplate.source === 'system'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}>
                    {previewTemplate.source === 'system' ? '系统预置' : '用户创建'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{previewTemplate.templateDesc}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>{countLeafColumns(previewTemplate.columnConfig)} 列</span>
                  <span>{previewTemplate.source === 'user' ? `创建人: ${previewTemplate.createdBy || '未知'}` : '创建人: 系统'}</span>
                  <span>引用 {previewTemplate.usageCount} 次</span>
                </div>
              </div>
              <button onClick={() => setPreviewTemplateId(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SimpleHeaderPreview columnConfig={previewTemplate.columnConfig} />
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-4 py-2 border border-input rounded-md text-sm hover:bg-muted transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setPreviewTemplateId(null);
                  router.push(`/workspace/report-center/create?template=${previewTemplate.templateId}`);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                基于此创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
