'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info, ChevronRight, ArrowLeft, Settings2, Download, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getReportById } from '../../data/mockReportData';
import { getCategoryById, CATEGORY_COLOR_MAP } from '../../data/categoryData';
import { REPORT_STATUS_MAP } from '../../data/mockReportData';
import { ColumnConfigNode, DrillPathNode, RegionMode, RegionDimension, ReportConfig } from '../../data/types';
import { getLeafColumns as getLeaves, generateReportData, RegionLevel, buildFullColumnConfig } from '../../data/reportRunData';
import { CITY_LIST, DISTRICT_MAP } from '../../data/regionData';
import SaveAsTemplateDialog from '../../components/SaveAsTemplateDialog';
import DynamicFilterBar, { FilterValues } from '../../components/DynamicFilterBar';
import { FilterConfig } from '../../data/types';
import { formatCellValue } from '../../data/reportRunData';

// ==================== 通用合并表头表格 ====================

interface ColumnRenderDef {
  id: string;
  title: string;
  tooltip?: string;
  rowSpan: number;
  colSpan: number;
  depth: number;
  fixed?: 'left' | 'right';
  isLeaf: boolean;
}

function buildHeaderMatrix(nodes: ColumnConfigNode[], maxDepth: number): ColumnRenderDef[][] {
  const rows: ColumnRenderDef[][] = Array.from({ length: maxDepth }, () => []);

  function walk(node: ColumnConfigNode, depth: number): number {
    if (!node.children || node.children.length === 0) {
      rows[depth].push({
        id: node.id,
        title: node.title,
        tooltip: node.tooltip,
        rowSpan: maxDepth - depth,
        colSpan: 1,
        depth,
        fixed: node.fixed,
        isLeaf: true,
      });
      return 1;
    }
    let span = 0;
    for (const child of node.children) {
      span += walk(child, depth + 1);
    }
    rows[depth].push({
      id: node.id,
      title: node.title,
      rowSpan: 1,
      colSpan: span,
      depth,
      fixed: node.fixed,
      isLeaf: false,
    });
    return span;
  }

  for (const node of nodes) {
    walk(node, 0);
  }
  return rows;
}

function getMaxColDepth(nodes: ColumnConfigNode[], d = 1): number {
  let max = d;
  for (const n of nodes) {
    if (n.children && n.children.length > 0) {
      max = Math.max(max, getMaxColDepth(n.children, d + 1));
    }
  }
  return max;
}

// ==================== 列配置抽屉 ====================

interface ColumnConfigDrawerProps {
  columnConfig: ColumnConfigNode[];
  visibleIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}

function ColumnConfigDrawer({ columnConfig, visibleIds, onToggle, onSelectAll, onDeselectAll, onReset, open, onClose }: ColumnConfigDrawerProps) {
  if (!open) return null;

  const leafCols = getLeaves(columnConfig);
  const dataCols = leafCols.filter(c => c.type !== 'region' && c.type !== 'action');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-80 bg-popover border-l border-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-medium text-sm">列配置</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><RotateCcw className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <button onClick={onSelectAll} className="text-xs text-primary hover:underline">全选</button>
          <span className="text-xs text-muted-foreground">|</span>
          <button onClick={onDeselectAll} className="text-xs text-primary hover:underline">全不选</button>
          <span className="text-xs text-muted-foreground">|</span>
          <button onClick={onReset} className="text-xs text-primary hover:underline">重置</button>
        </div>
        <div className="flex-1 overflow-auto px-4 py-2">
          {dataCols.map(col => (
            <label key={col.id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 px-1 rounded">
              <input
                type="checkbox"
                checked={visibleIds.has(col.id)}
                onChange={() => onToggle(col.id)}
                className="rounded border-input"
              />
              <span className="text-foreground">{col.title}</span>
              {col.tooltip && <Info className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />}
            </label>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          已选 {visibleIds.size} / {dataCols.length} 列
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ====================

export default function ReportRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const report = getReportById(reportId);

  const regionMode: RegionMode = report?.regionMode || 'drill';
  const regionDimensions: RegionDimension[] = report?.regionDimensions || ['city'];

  // 构建完整列配置（区域列 + 指标列 + 操作列）
  const fullColumnConfig = useMemo(() => {
    if (!report) return [];
    return buildFullColumnConfig(regionMode, regionDimensions, report.columnConfig);
  }, [report, regionMode, regionDimensions]);

  // 下钻状态（仅drill模式使用）
  const [drillPath, setDrillPath] = useState<DrillPathNode[]>([
    { code: '650000', name: '全疆', level: 'province' },
  ]);

  // 列可见性
  const [columnDrawerOpen, setColumnDrawerOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const allLeafCols = useMemo(() => getLeaves(fullColumnConfig), [fullColumnConfig]);
  const dataLeafCols = useMemo(() => allLeafCols.filter(c => c.type !== 'region' && c.type !== 'action'), [allLeafCols]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set(dataLeafCols.map(c => c.id)));

  const currentLevel = drillPath[drillPath.length - 1]?.level || 'province';
  const currentCode = drillPath[drillPath.length - 1]?.code || '650000';

  // 生成数据
  const { rows } = useMemo(() => {
    if (!report) return { rows: [] };
    return generateReportData(
      fullColumnConfig,
      currentLevel as RegionLevel,
      currentCode,
      regionMode,
      regionDimensions,
    );
  }, [report, fullColumnConfig, currentLevel, currentCode, regionMode, regionDimensions]);

  // 过滤后的列配置
  const filteredColumnConfig = useMemo(() => {
    if (!report) return [];
    return filterColumnsByVisibility(fullColumnConfig, visibleIds);
  }, [report, fullColumnConfig, visibleIds]);

  // 构建表头
  const { headerMatrix, leafCols } = useMemo(() => {
    if (filteredColumnConfig.length === 0) return { headerMatrix: [], leafCols: [] };
    const maxDepth = getMaxColDepth(filteredColumnConfig);
    const matrix = buildHeaderMatrix(filteredColumnConfig, maxDepth);
    const leaves = getLeaves(filteredColumnConfig);
    return { headerMatrix: matrix, leafCols: leaves };
  }, [filteredColumnConfig]);

  // 数据格式化
  const formatCellValue = useCallback((val: string | number, col: { dataFormat?: string; decimalPlaces?: number; useThousandSeparator?: boolean; type?: string }) => {
    if (val === null || val === undefined || val === '') return '-';
    if (col.type === 'region' || col.type === 'action') return String(val);
    
    const fmt = col.dataFormat || 'number';
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    const decimals = col.decimalPlaces ?? 2;
    const useThousand = col.useThousandSeparator ?? true;

    if (isNaN(num)) return String(val);

    switch (fmt) {
      case 'percent':
        return (num * 100).toFixed(decimals) + '%';
      case 'permille':
        return (num * 1000).toFixed(decimals) + '‰';
      case 'text':
        return String(val);
      case 'number':
      default: {
        const formatted = num.toFixed(decimals);
        if (useThousand) {
          const parts = formatted.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return parts.join('.');
        }
        return formatted;
      }
    }
  }, []);

  // 筛选条件变化
  const handleFilterChange = useCallback((filterId: string, value: string | string[]) => {
    // 当前模拟数据不做过滤，预留参数接口
    console.log('Filter changed:', filterId, value);
  }, []);

  // 下钻（仅drill模式）
  const handleDrillDown = useCallback((row: Record<string, string | number>) => {
    if (regionMode !== 'drill') return;
    const regionCol = leafCols.find(c => c.type === 'region');
    if (!regionCol) return;
    const code = String(row[`${regionCol.id}_code`] || '');
    const name = String(row[regionCol.id] || '');

    let nextLevel: 'city' | 'district' | 'grid' | null = null;
    if (currentLevel === 'province') nextLevel = 'city';
    else if (currentLevel === 'city') nextLevel = 'district';
    else if (currentLevel === 'district') nextLevel = 'grid';
    if (!nextLevel) return;

    setDrillPath(prev => [...prev, { code, name, level: nextLevel }]);
  }, [currentLevel, leafCols, regionMode]);

  // 面包屑点击（仅drill模式）
  const handleBreadcrumbClick = useCallback((index: number) => {
    setDrillPath(prev => prev.slice(0, index + 1));
  }, []);

  // 列可见性操作
  const toggleColumn = useCallback((id: string) => {
    setVisibleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const selectAll = useCallback(() => setVisibleIds(new Set(dataLeafCols.map(c => c.id))), [dataLeafCols]);
  const deselectAll = useCallback(() => setVisibleIds(new Set()), []);
  const resetColumns = useCallback(() => setVisibleIds(new Set(dataLeafCols.map(c => c.id))), [dataLeafCols]);

  if (!report) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">报表不存在</p>
      </div>
    );
  }

  const category = getCategoryById(report.categoryId);
  const colorMap = category ? CATEGORY_COLOR_MAP[category.color] : CATEGORY_COLOR_MAP.gray;
  const statusInfo = REPORT_STATUS_MAP[report.status];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-border px-6 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/workspace/report-center/report-run')} className="p-1 hover:bg-muted rounded">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{report.reportName}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
                {category?.categoryName}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {/* 区域模式标签 */}
              <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground border border-border">
                {regionMode === 'drill' ? '单列下钻' : '多列展开'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{report.reportDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setColumnDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-muted transition-colors"
            >
              <Settings2 className="w-4 h-4" /> 列配置
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-muted transition-colors"
              title="导出Excel"
            >
              <Download className="w-4 h-4" /> 导出
            </button>
            <button
              onClick={() => setSaveAsTemplateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-muted transition-colors"
              title="另存为模板"
            >
              <Save className="w-4 h-4" /> 另存为模板
            </button>
          </div>
        </div>

        {/* 动态筛选栏 */}
        {report.filterConfig && report.filterConfig.length > 0 && (
          <DynamicFilterBar
            filterConfig={report.filterConfig}
            values={filterValues}
            onChange={(v: FilterValues) => setFilterValues(v)}
            onSearch={() => {}}
          />
        )}

        {/* 面包屑（仅drill模式） */}
        {regionMode === 'drill' && (
          <div className="flex items-center gap-1 text-sm">
            {drillPath.map((node, i) => (
              <React.Fragment key={node.code}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                {i < drillPath.length - 1 ? (
                  <button
                    onClick={() => handleBreadcrumbClick(i)}
                    className="text-primary hover:underline"
                  >
                    {node.name}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{node.name}</span>
                )}
              </React.Fragment>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">（点击区域名称可下钻查看下级数据）</span>
          </div>
        )}

        {/* 多列展开模式提示 */}
        {regionMode === 'flat' && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">区域维度：</span>
            {regionDimensions.map((dim, i) => (
              <React.Fragment key={dim}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-foreground">{({ city: '地州', district: '区县', grid: '网格', microgrid: '微格' } as Record<string, string>)[dim]}</span>
              </React.Fragment>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">（每行展示完整区域层级路径）</span>
          </div>
        )}
      </div>

      {/* 表格区域 */}
      <div className="flex-1 overflow-auto">
        {headerMatrix.length > 0 && rows.length > 0 ? (
          <table className="w-full text-xs border-collapse min-w-max">
            <thead className="sticky top-0 z-10">
              {headerMatrix.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell) => {
                    const isFixedLeft = cell.fixed === 'left';
                    const isFixedRight = cell.fixed === 'right';
                    let stickyStyle: React.CSSProperties = {};
                    if (isFixedLeft) {
                      stickyStyle = { position: 'sticky', left: 0, zIndex: 11 };
                    } else if (isFixedRight) {
                      stickyStyle = { position: 'sticky', right: 0, zIndex: 11 };
                    }
                    return (
                      <th
                        key={`${cell.id}-${ri}`}
                        rowSpan={cell.rowSpan}
                        colSpan={cell.colSpan}
                        className={`border border-border px-2 py-2 text-center font-medium text-muted-foreground bg-muted/60 whitespace-nowrap ${
                          isFixedLeft || isFixedRight ? 'bg-muted' : ''
                        }`}
                        style={stickyStyle}
                      >
                        <span className="inline-flex items-center gap-1">
                          {cell.title}
                          {cell.isLeaf && cell.tooltip && (
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                  {cell.tooltip}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const isSummary = ri === 0;
                return (
                  <tr key={ri} className={`${isSummary ? 'bg-muted/30 font-medium' : 'hover:bg-muted/20'} transition-colors`}>
                    {leafCols.map((col) => {
                      const val = row[col.id];
                      const isRegion = col.type === 'region';
                      const isAction = col.type === 'action';

                      // drill模式：区域列可下钻（首行汇总除外、最底层除外）
                      // flat模式：区域列不可下钻
                      const canDrill = regionMode === 'drill' && isRegion && !isSummary && currentLevel !== 'grid';

                      const isFixedLeft = col.fixed === 'left';
                      const isFixedRight = col.fixed === 'right';
                      let stickyStyle: React.CSSProperties = {};
                      if (isFixedLeft) {
                        stickyStyle = { position: 'sticky', left: 0, zIndex: 5 };
                      } else if (isFixedRight) {
                        stickyStyle = { position: 'sticky', right: 0, zIndex: 5 };
                      }

                      return (
                        <td
                          key={col.id}
                          className={`border border-border px-2 py-1.5 whitespace-nowrap ${
                            isFixedLeft || isFixedRight ? 'bg-card' : ''
                          } ${isSummary && (isFixedLeft || isFixedRight) ? 'bg-muted/30' : ''} ${
                            isAction ? 'text-center' : isRegion ? 'text-left' : 'text-right'
                          }`}
                          style={stickyStyle}
                        >
                          {canDrill ? (
                            <button
                              onClick={() => handleDrillDown(row)}
                              className="hover:underline cursor-pointer"
                              style={{ color: 'var(--link)' }}
                            >
                              {formatCellValue(val, col)}
                            </button>
                          ) : isAction ? (
                            <button className="text-primary hover:underline text-xs">详情</button>
                          ) : (
                            <span>{formatCellValue(val, col)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            暂无数据
          </div>
        )}
      </div>

      {/* 列配置抽屉 */}
      <ColumnConfigDrawer
        columnConfig={fullColumnConfig}
        visibleIds={visibleIds}
        onToggle={toggleColumn}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onReset={resetColumns}
        open={columnDrawerOpen}
        onClose={() => setColumnDrawerOpen(false)}
      />

      <SaveAsTemplateDialog
        open={saveAsTemplateOpen}
        onOpenChange={setSaveAsTemplateOpen}
        report={report}
      />
    </div>
  );
}

// ==================== 列可见性过滤 ====================

function filterColumnsByVisibility(nodes: ColumnConfigNode[], visibleIds: Set<string>): ColumnConfigNode[] {
  const result: ColumnConfigNode[] = [];
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      if (node.type === 'region' || node.type === 'action' || visibleIds.has(node.id)) {
        result.push(node);
      }
    } else {
      const filteredChildren = filterColumnsByVisibility(node.children, visibleIds);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    }
  }
  return result;
}
