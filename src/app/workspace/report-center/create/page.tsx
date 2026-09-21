'use client';

import React, { useState, useMemo, useCallback, Suspense, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Plus, Trash2, Info, Save, ChevronDown, ChevronRight, Search,
  FolderPlus, ChevronLeft, ChevronRight as ChevronRightIcon, Edit3, Check, X, Layers
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { REPORT_CATEGORIES } from '../data/categoryData';
import { INDICATOR_DEFINITIONS, INDICATOR_CATEGORY_TREE, getIndicatorsByCategory } from '../data/indicatorData';
import { REPORT_TEMPLATES } from '../data/templateData';
import { getReportById } from '../data/mockReportData';
import { ColumnConfigNode, RegionMode, RegionDimension, REGION_LEVEL_LABELS, REGION_DIMENSION_OPTIONS, FilterConfig } from '../data/types';
import { getLeafColumns, buildRegionColumns, buildFullColumnConfig, formatCellValue, getAlignClass } from '../data/reportRunData';
import FilterConditionEditor from '../components/FilterConditionEditor';

// ==================== 辅助函数 ====================

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function buildDefaultColumns(): ColumnConfigNode[] {
  // 区域列和操作列由 buildFullColumnConfig 自动追加，这里只放指标/分组列
  return [];
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

interface ColumnRenderDef {
  id: string;
  title: string;
  tooltip?: string;
  rowSpan: number;
  colSpan: number;
  depth: number;
  fixed?: 'left' | 'right';
  isLeaf: boolean;
  type: string;
  required?: boolean;
  parentId?: string;
  indexInParent?: number;
}

function buildHeaderMatrix(nodes: ColumnConfigNode[], maxDepth: number): ColumnRenderDef[][] {
  const rows: ColumnRenderDef[][] = Array.from({ length: maxDepth }, () => []);
  function walk(node: ColumnConfigNode, depth: number, parentId?: string, indexInParent?: number): number {
    if (!node.children || node.children.length === 0) {
      rows[depth].push({
        id: node.id, title: node.title, tooltip: node.tooltip,
        rowSpan: maxDepth - depth, colSpan: 1, depth,
        fixed: node.fixed, isLeaf: true, type: node.type,
        required: node.required, parentId, indexInParent,
      });
      return 1;
    }
    let span = 0;
    node.children.forEach((child, i) => {
      span += walk(child, depth + 1, node.id, i);
    });
    rows[depth].push({
      id: node.id, title: node.title, rowSpan: 1, colSpan: span, depth,
      fixed: node.fixed, isLeaf: false, type: node.type,
      required: node.required, parentId, indexInParent,
    });
    return span;
  }
  nodes.forEach((node, i) => walk(node, 0, undefined, i));
  return rows;
}

// 在树中查找节点及其父节点
function findNodeInTree(
  nodes: ColumnConfigNode[], nodeId: string, parent: ColumnConfigNode | null = null
): { node: ColumnConfigNode; parent: ColumnConfigNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) return { node: nodes[i], parent, index: i };
    if (nodes[i].children) {
      const found = findNodeInTree(nodes[i].children!, nodeId, nodes[i]);
      if (found) return found;
    }
  }
  return null;
}

// 在树中更新节点
function updateNodeInTree(
  nodes: ColumnConfigNode[], nodeId: string, updater: (node: ColumnConfigNode) => ColumnConfigNode
): ColumnConfigNode[] {
  return nodes.map(n => {
    if (n.id === nodeId) return updater(n);
    if (n.children) return { ...n, children: updateNodeInTree(n.children, nodeId, updater) };
    return n;
  });
}

// 在树中删除节点
function removeFromTree(nodes: ColumnConfigNode[], nodeId: string): ColumnConfigNode[] {
  return nodes
    .filter(n => n.id !== nodeId)
    .map(n => n.children ? { ...n, children: removeFromTree(n.children, nodeId) } : n)
    .filter(n => !(n.type === 'group' && (!n.children || n.children.length === 0)));
}

// 在指定父节点下插入子节点
function insertChildToTree(
  nodes: ColumnConfigNode[], parentId: string | null, child: ColumnConfigNode, position?: number
): ColumnConfigNode[] {
  if (parentId === null) {
    // 插入到顶层
    if (position !== undefined) {
      const newNodes = [...nodes];
      newNodes.splice(position, 0, child);
      return newNodes;
    }
    return [...nodes, child];
  }
  return nodes.map(n => {
    if (n.id === parentId && n.children) {
      const newChildren = [...n.children];
      if (position !== undefined) {
        newChildren.splice(position, 0, child);
      } else {
        newChildren.push(child);
      }
      return { ...n, children: newChildren };
    }
    if (n.children) return { ...n, children: insertChildToTree(n.children, parentId, child, position) };
    return n;
  });
}

// 左移/右移节点
function moveNodeInTree(nodes: ColumnConfigNode[], nodeId: string, direction: 'left' | 'right'): ColumnConfigNode[] {
  const result = findNodeInTree(nodes, nodeId);
  if (!result) return nodes;
  const { parent, index } = result;
  const siblings = parent ? parent.children! : nodes;
  const newIdx = direction === 'left' ? index - 1 : index + 1;
  if (newIdx < 0 || newIdx >= siblings.length) return nodes;
  // 不允许和固定列交换
  if (siblings[newIdx].fixed || siblings[index].fixed) return nodes;
  const newSiblings = [...siblings];
  [newSiblings[index], newSiblings[newIdx]] = [newSiblings[newIdx], newSiblings[index]];
  if (parent) {
    return updateNodeInTree(nodes, parent.id, p => ({ ...p, children: newSiblings }));
  }
  return newSiblings;
}

// ==================== 交互式表头网格组件 ====================

interface InteractiveHeaderGridProps {
  columnConfig: ColumnConfigNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onMove: (id: string, direction: 'left' | 'right') => void;
}

function InteractiveHeaderGrid({
  columnConfig, selectedId, onSelect, onRemove, onRename, onMove
}: InteractiveHeaderGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const maxDepth = getMaxColDepth(columnConfig, 1);
  const matrix = buildHeaderMatrix(columnConfig, maxDepth);

  if (columnConfig.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
        <div className="text-center">
          <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p>从右侧指标库点击添加指标，或选择模板快速开始</p>
          <p className="text-xs mt-1 text-muted-foreground/60">区域列和操作列将自动生成，只需配置指标列</p>
        </div>
      </div>
    );
  }

  const handleDoubleClick = (cell: ColumnRenderDef) => {
    if (cell.required || cell.type === 'region' || cell.type === 'action') return;
    setEditingId(cell.id);
    setEditText(cell.title);
  };

  const handleEditConfirm = () => {
    if (editingId && editText.trim()) {
      onRename(editingId, editText.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditConfirm();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="overflow-auto border border-border rounded-lg">
      <table className="w-full text-xs border-collapse min-w-max">
        <thead>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell) => {
                const isSelected = selectedId === cell.id;
                const isEditing = editingId === cell.id;
                const canEdit = !cell.required && cell.type !== 'region' && cell.type !== 'action';

                return (
                  <th
                    key={`${cell.id}-${ri}`}
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    onClick={() => onSelect(cell.id)}
                    onDoubleClick={() => handleDoubleClick(cell)}
                    className={`border border-border px-2 py-1.5 text-center font-medium whitespace-nowrap relative cursor-pointer transition-colors ${
                      cell.fixed === 'left' || cell.fixed === 'right'
                        ? 'bg-muted'
                        : isSelected
                          ? 'bg-primary/10 ring-2 ring-primary ring-inset'
                          : 'bg-muted/60 hover:bg-muted/80'
                    } ${
                      cell.required ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {isEditing ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={handleEditConfirm}
                          className="w-24 h-5 px-1 text-xs bg-background border border-primary rounded text-center focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className={isSelected ? 'text-primary font-semibold' : ''}>{cell.title}</span>
                        {cell.isLeaf && cell.tooltip && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">{cell.tooltip}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {/* 类型标签 */}
                        {cell.type === 'group' && !cell.isLeaf && (
                          <span className="text-[9px] px-1 py-0.5 bg-primary/10 text-primary rounded ml-1">分组</span>
                        )}
                        {cell.type === 'region' && (
                          <span className="text-[9px] px-1 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded ml-1">自动</span>
                        )}
                        {cell.type === 'action' && (
                          <span className="text-[9px] px-1 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded ml-1">自动</span>
                        )}
                      </span>
                    )}
                    {/* 选中态操作按钮 */}
                    {isSelected && !isEditing && !cell.required && (
                      <div className="absolute -top-0 -right-0 flex items-center gap-0.5">
                        {canEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDoubleClick(cell); }}
                            className="p-0.5 bg-primary text-primary-foreground rounded-bl rounded-tr hover:bg-primary/80"
                            title="重命名"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(cell.id); }}
                          className="p-0.5 bg-destructive text-destructive-foreground rounded-bl rounded-tr hover:bg-destructive/80"
                          title="删除"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    {isSelected && !isEditing && !cell.required && cell.type !== 'region' && cell.type !== 'action' && (
                      <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onMove(cell.id, 'left'); }}
                          className="p-0.5 bg-muted text-muted-foreground rounded-t hover:bg-muted/80 border border-border"
                          title="左移"
                        >
                          <ChevronLeft className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onMove(cell.id, 'right'); }}
                          className="p-0.5 bg-muted text-muted-foreground rounded-t hover:bg-muted/80 border border-border"
                          title="右移"
                        >
                          <ChevronRightIcon className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          <tr>
            {getLeafColumns(columnConfig).map(col => (
              <td key={col.id} className="border border-border px-2 py-1 text-center text-muted-foreground/50 text-xs">
                {col.type === 'region' ? '区域' : col.type === 'action' ? '操作' : '...'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ==================== 指标选择面板 ====================

interface IndicatorPanelProps {
  selectedIds: Set<string>;
  onAddIndicator: (indicatorCode: string) => void;
  targetGroupName: string | null;
}

function IndicatorPanel({ selectedIds, onAddIndicator, targetGroupName }: IndicatorPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['01', '02']));
  const [search, setSearch] = useState('');

  const filteredTree = useMemo(() => {
    if (!search.trim()) return INDICATOR_CATEGORY_TREE;
    const lower = search.toLowerCase();
    const result = INDICATOR_CATEGORY_TREE.map(cat => {
      const matchingIndicators = getIndicatorsByCategory(cat.id).filter(
        i => i.indicatorName.toLowerCase().includes(lower) || i.indicatorCode.toLowerCase().includes(lower)
      );
      return { ...cat, _matches: matchingIndicators.length };
    }).filter(c => c._matches > 0);
    return result;
  }, [search]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="font-medium text-sm mb-1">指标库</h3>
        {targetGroupName ? (
          <p className="text-[11px] text-primary mb-2">
            点击指标将添加到「{targetGroupName}」下
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground mb-2">
            选中表头分组后，指标添加到该分组下
          </p>
        )}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索指标..."
            className="w-full h-8 pl-7 pr-3 bg-background border border-input rounded text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredTree.map(cat => {
          const isExpanded = expanded.has(cat.id) || !!search.trim();
          const indicators = search.trim()
            ? getIndicatorsByCategory(cat.id).filter(
                i => i.indicatorName.toLowerCase().includes(search.toLowerCase()) || i.indicatorCode.toLowerCase().includes(search.toLowerCase())
              )
            : getIndicatorsByCategory(cat.id);

          return (
            <div key={cat.id} className="border-b border-border">
              <button
                onClick={() => toggleExpand(cat.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-xs font-medium text-foreground">{cat.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{cat.count}</span>
              </button>
              {isExpanded && (
                <div className="pb-1">
                  {indicators.map(ind => {
                    const isSelected = selectedIds.has(ind.indicatorCode);
                    return (
                      <div
                        key={ind.indicatorCode}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/30 cursor-pointer group"
                        onClick={() => !isSelected && onAddIndicator(ind.indicatorCode)}
                      >
                        <span className={`text-xs ${isSelected ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {ind.indicatorName}
                        </span>
                        {ind.isGroupHeader && (
                          <span className="text-[10px] px-1 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                            时效模板
                          </span>
                        )}
                        {isSelected ? (
                          <span className="ml-auto text-[10px] text-green-600">已添加</span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 主页面 ====================

export default function ReportCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96 text-muted-foreground">加载中...</div>}>
      <ReportCreateContent />
    </Suspense>
  );
}

function ReportCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const viewId = searchParams.get('view');
  const templateId = searchParams.get('template');
  const isViewMode = !!viewId;
  const existingReport = (editId || viewId) ? getReportById(editId || viewId || '') : null;

  // 基础信息
  const [reportName, setReportName] = useState(existingReport?.reportName || '');
  const [reportDesc, setReportDesc] = useState(existingReport?.reportDesc || '');
  const [categoryId, setCategoryId] = useState(existingReport?.categoryId || '');
  const [statPeriod, setStatPeriod] = useState<'day' | 'week' | 'month'>(existingReport?.statPeriod || 'day');
  const [regionMode, setRegionMode] = useState<RegionMode>(existingReport?.regionMode || 'drill');
  const [regionDimensions, setRegionDimensions] = useState<RegionDimension[]>(
    existingReport?.regionDimensions || ['city', 'district', 'grid']
  );

  // 列配置（不含区域列和操作列，只含指标列）
  const getInitialColumnConfig = useCallback(() => {
    if (existingReport?.columnConfig) return existingReport.columnConfig;
    if (templateId) {
      const template = REPORT_TEMPLATES.find(t => t.templateId === templateId);
      if (template) {
        setRegionMode(template.regionMode);
        setRegionDimensions([...template.regionDimensions]);
        return deepClone(template.columnConfig);
      }
    }
    return buildDefaultColumns();
  }, [existingReport, templateId]);

  const [columnConfig, setColumnConfig] = useState<ColumnConfigNode[]>(getInitialColumnConfig);

  // 筛选条件配置
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);

  // 完整列配置（含动态区域列）—— 用于表头预览
  const fullColumnConfigForPreview = useMemo(() => {
    return buildFullColumnConfig(regionMode, regionDimensions, columnConfig);
  }, [regionMode, regionDimensions, columnConfig]);

  // 当前选中的表头单元格ID
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  // 新建分组对话框
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null);
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  // 已选指标编码集合
  const selectedIndicatorCodes = useMemo(() => {
    const codes = new Set<string>();
    function walk(nodes: ColumnConfigNode[]) {
      for (const n of nodes) {
        if (n.indicatorCode) codes.add(n.indicatorCode);
        if (n.children) walk(n.children);
      }
    }
    // 只从数据列中收集（不含区域列和操作列）
    walk(columnConfig.filter(n => n.type !== 'region'));
    return codes;
  }, [columnConfig]);

  // 获取当前选中的分组名称（用于指标面板提示）
  const targetGroupName = useMemo(() => {
    if (!selectedCellId) return null;
    const result = findNodeInTree(fullColumnConfigForPreview, selectedCellId);
    if (!result) return null;
    if (result.node.type === 'group') return result.node.title;
    if (result.parent?.type === 'group') return result.parent.title;
    return null;
  }, [selectedCellId, fullColumnConfigForPreview]);

  // 获取选中节点所在的父分组ID（用于添加子列）
  const getTargetParentId = useCallback((): string | null => {
    if (!selectedCellId) return null;
    const result = findNodeInTree(fullColumnConfigForPreview, selectedCellId);
    if (!result) return null;
    // 如果选中的是分组，添加到该分组下
    if (result.node.type === 'group') return selectedCellId;
    // 如果选中的是指标，添加到其父分组下
    if (result.parent?.type === 'group') return result.parent.id;
    return null;
  }, [selectedCellId, fullColumnConfigForPreview]);

  // 添加指标
  const handleAddIndicator = useCallback((indicatorCode: string) => {
    const ind = INDICATOR_DEFINITIONS.find(i => i.indicatorCode === indicatorCode);
    if (!ind) return;

    // 时效模板类型：自动展开子指标
    if (ind.isGroupHeader && ind.timeBucketType) {
      const bucketIndicators = INDICATOR_DEFINITIONS.filter(
        i => i.parentGroupId === ind.indicatorCode.replace('T', '0') || (i.timeBucketType === ind.timeBucketType && !i.isGroupHeader && i.categoryId === ind.categoryId)
      );
      const children: ColumnConfigNode[] = bucketIndicators.map(bi => ({
        id: bi.indicatorCode,
        type: 'indicator' as const,
        title: bi.indicatorName,
        indicatorCode: bi.indicatorCode,
        tooltip: bi.caliber,
        rowSpan: 1,
      }));
      const groupNode: ColumnConfigNode = {
        id: `time_${ind.timeBucketType}_${Date.now()}`,
        type: 'group',
        title: ind.indicatorName,
        children,
      };

      const targetParent = getTargetParentId();
      if (targetParent) {
        setColumnConfig(prev => insertChildToTree(prev, targetParent, groupNode));
      } else {
        setColumnConfig(prev => insertChildToTree(prev, null, groupNode));
      }
      return;
    }

    // 普通指标
    const newNode: ColumnConfigNode = {
      id: ind.indicatorCode + (Date.now() > 0 ? '' : ''),
      type: 'indicator',
      title: ind.indicatorName,
      indicatorCode: ind.indicatorCode,
      tooltip: ind.caliber,
      rowSpan: 1,
    };
    // 确保ID唯一
    newNode.id = ind.indicatorCode + '_' + Date.now();

    const targetParent = getTargetParentId();
    if (targetParent) {
      setColumnConfig(prev => insertChildToTree(prev, targetParent, newNode));
    } else {
      setColumnConfig(prev => insertChildToTree(prev, null, newNode));
    }
  }, [getTargetParentId]);

  // 删除列（只删除数据列，区域列和操作列不可删）
  const handleRemoveColumn = useCallback((nodeId: string) => {
    // 检查是否是区域列或操作列，如果是则不允许删除
    const nodeInFull = findNodeInTree(fullColumnConfigForPreview, nodeId);
    if (nodeInFull && (nodeInFull.node.type === 'region' || nodeInFull.node.type === 'action')) return;
    setColumnConfig(prev => removeFromTree(prev, nodeId));
    if (selectedCellId === nodeId) setSelectedCellId(null);
  }, [selectedCellId, fullColumnConfigForPreview]);

  // 重命名（只对数据列有效）
  const handleRename = useCallback((nodeId: string, newTitle: string) => {
    const nodeInFull = findNodeInTree(fullColumnConfigForPreview, nodeId);
    if (nodeInFull && (nodeInFull.node.type === 'region' || nodeInFull.node.type === 'action')) return;
    setColumnConfig(prev => updateNodeInTree(prev, nodeId, n => ({ ...n, title: newTitle })));
  }, [fullColumnConfigForPreview]);

  // 左移/右移（只对数据列有效）
  const handleMove = useCallback((nodeId: string, direction: 'left' | 'right') => {
    const nodeInFull = findNodeInTree(fullColumnConfigForPreview, nodeId);
    if (nodeInFull && (nodeInFull.node.type === 'region' || nodeInFull.node.type === 'action')) return;
    setColumnConfig(prev => moveNodeInTree(prev, nodeId, direction));
  }, [fullColumnConfigForPreview]);

  // 新建分组
  const handleNewGroup = useCallback((parentId: string | null) => {
    setNewGroupParentId(parentId);
    setNewGroupName('');
    setShowNewGroupDialog(true);
  }, []);

  const confirmNewGroup = useCallback(() => {
    if (!newGroupName.trim()) return;
    const groupNode: ColumnConfigNode = {
      id: `group_${Date.now()}`,
      type: 'group',
      title: newGroupName.trim(),
      children: [],
    };
    if (newGroupParentId) {
      setColumnConfig(prev => insertChildToTree(prev, newGroupParentId, groupNode));
      // 自动选中新分组，方便继续操作
      setSelectedCellId(groupNode.id);
    } else {
      setColumnConfig(prev => insertChildToTree(prev, null, groupNode));
      setSelectedCellId(groupNode.id);
    }
    setShowNewGroupDialog(false);
    setNewGroupName('');
  }, [newGroupName, newGroupParentId]);

  // 选择模板
  const handleSelectTemplate = useCallback((templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.templateId === templateId);
    if (template) {
      setColumnConfig(deepClone(template.columnConfig));
      setRegionMode(template.regionMode);
      setRegionDimensions([...template.regionDimensions]);
      if (template.filterConfig) setFilterConfig([...template.filterConfig]);
      if (template.categoryId && !categoryId) setCategoryId(template.categoryId);
      setSelectedCellId(null);
    }
  }, [categoryId]);

  // 保存
  const handleSave = useCallback(() => {
    // TODO: 调用后端API保存
    router.push('/workspace/report-center/custom-reports');
  }, [router]);

  const leafCount = useMemo(() => {
    const allLeaves = getLeafColumns(fullColumnConfigForPreview);
    return allLeaves.filter(c => c.type !== 'region' && c.type !== 'action').length;
  }, [fullColumnConfigForPreview]);

  // 获取当前选中的节点的描述信息
  const selectedNodeInfo = useMemo(() => {
    if (!selectedCellId) return null;
    const result = findNodeInTree(fullColumnConfigForPreview, selectedCellId);
    if (!result) return null;
    const { node, parent, index } = result;
    const childCount = node.children?.length || 0;
    return { node, parent, index, childCount };
  }, [selectedCellId, fullColumnConfigForPreview]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/workspace/report-center/custom-reports')} className={`p-1 hover:bg-muted rounded ${isViewMode ? 'pointer-events-auto' : ''}`}>
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{isViewMode ? '报表配置详情' : editId ? '编辑报表' : '新建报表'}</h1>
          <div className="flex-1" />
          {!isViewMode && (
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" /> 保存
          </button>
          )}
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden ${isViewMode ? 'pointer-events-none' : ''}`}>
        {/* 左侧：基本信息 + 表头搭建 */}
        <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
          {/* 基本信息 - 可折叠 */}
          <details open className={`mb-4 ${isViewMode ? 'pointer-events-auto' : ''}`}>
            <summary className="text-sm font-medium text-foreground cursor-pointer select-none mb-3 flex items-center gap-2">
              基本信息
              <span className="text-xs text-muted-foreground font-normal">（点击展开/收起）</span>
            </summary>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">报表名称 *</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="输入报表名称"
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">报表分类 *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">请选择分类</option>
                  {REPORT_CATEGORIES.filter(c => c.status === 'active').map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">统计周期</label>
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setStatPeriod(p)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        statPeriod === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {p === 'day' ? '日' : p === 'week' ? '周' : '月'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">区域模式</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRegionMode('drill')}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        regionMode === 'drill' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      单列下钻
                    </button>
                    <button
                      onClick={() => setRegionMode('flat')}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        regionMode === 'flat' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      多列展开
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {regionMode === 'drill'
                      ? '单列下钻：表头只有1个"区域"列，点击区域名称可逐级下钻（全疆→地州→区县→网格）'
                      : '多列展开：表头显示多个区域列（地州/区县/网格等），每行展示完整区域层级路径'}
                  </p>
                  {/* 多列展开模式：选择展示维度 */}
                  {regionMode === 'flat' && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">展示到：</span>
                      {REGION_DIMENSION_OPTIONS.map(dim => (
                        <button
                          key={dim}
                          onClick={() => {
                            const idx = regionDimensions.indexOf(dim);
                            if (idx >= 0) {
                              // 取消选中：同时取消其下级
                              const newDims = regionDimensions.filter(d => d !== dim && REGION_DIMENSION_OPTIONS.indexOf(d) < REGION_DIMENSION_OPTIONS.indexOf(dim) + 1 || d !== dim && REGION_DIMENSION_OPTIONS.indexOf(d) <= REGION_DIMENSION_OPTIONS.indexOf(dim));
                              // 实际：保留dim之前的所有维度
                              const dimIdx = REGION_DIMENSION_OPTIONS.indexOf(dim);
                              setRegionDimensions(REGION_DIMENSION_OPTIONS.slice(0, dimIdx));
                            } else {
                              // 选中：同时选中其前面所有维度
                              const dimIdx = REGION_DIMENSION_OPTIONS.indexOf(dim);
                              setRegionDimensions(REGION_DIMENSION_OPTIONS.slice(0, dimIdx + 1));
                            }
                          }}
                          className={`px-2 py-1 text-[10px] rounded transition-colors ${
                            regionDimensions.includes(dim)
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted'
                          }`}
                        >
                          {REGION_LEVEL_LABELS[dim]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">报表描述</label>
                <input
                  type="text"
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="简要描述报表用途"
                  className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </details>

          {/* 模板快速选择 */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-foreground mb-2">快速开始</h2>
            <div className="flex gap-2 flex-wrap">
              {REPORT_TEMPLATES.map(t => (
                <button
                  key={t.templateId}
                  onClick={() => handleSelectTemplate(t.templateId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-input rounded-md text-xs hover:bg-muted transition-colors"
                >
                  {t.templateName}
                </button>
              ))}
            </div>
          </div>

          {/* 筛选条件配置 */}
          <div className="mb-3">
            <FilterConditionEditor
              filterConfig={filterConfig}
              onChange={setFilterConfig}
            />
          </div>

          {/* 表头搭建 - 核心区域 */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
                表头搭建
                <span className="text-xs text-muted-foreground font-normal">共 {leafCount} 列</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* 新建分组 - 一级 */}
                <button
                  onClick={() => handleNewGroup(null)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-input rounded-md text-xs hover:bg-muted transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  新建分组
                </button>
                {/* 选中分组时：添加子分组 */}
                {selectedNodeInfo && selectedNodeInfo.node.type === 'group' && (
                  <button
                    onClick={() => handleNewGroup(selectedCellId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-primary text-primary rounded-md text-xs hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    在「{selectedNodeInfo.node.title}」下添加子分组
                  </button>
                )}
                {selectedCellId && (
                  <button
                    onClick={() => setSelectedCellId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    取消选中
                  </button>
                )}
              </div>
            </div>

            {/* 操作提示 */}
            <div className="mb-2 text-[11px] text-muted-foreground space-y-0.5">
              <span>单击选中单元格 → 右侧点击指标添加到该分组；双击分组名可重命名；选中后显示移动和删除按钮</span>
            </div>

            {/* 交互式表头网格 */}
            <div className="flex-1 min-h-0">
              <InteractiveHeaderGrid
                columnConfig={fullColumnConfigForPreview}
                selectedId={selectedCellId}
                onSelect={setSelectedCellId}
                onRemove={handleRemoveColumn}
                onRename={handleRename}
                onMove={handleMove}
              />
            </div>

            {/* 选中信息栏 */}
            {selectedNodeInfo && (
              <div className="mt-2 px-3 py-2 bg-muted/40 rounded-md text-xs text-muted-foreground flex items-center gap-4">
                <span>当前选中：<strong className="text-foreground">{selectedNodeInfo.node.title}</strong></span>
                <span>类型：{selectedNodeInfo.node.type === 'group' ? '分组' : selectedNodeInfo.node.type === 'indicator' ? '指标' : selectedNodeInfo.node.type === 'region' ? '区域' : '操作'}</span>
                {selectedNodeInfo.node.type === 'group' && <span>子列数：{selectedNodeInfo.childCount}</span>}
                {selectedNodeInfo.node.tooltip && <span>口径：{selectedNodeInfo.node.tooltip}</span>}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：指标选择面板 */}
        <div className="w-72 border-l border-border flex-shrink-0">
          <IndicatorPanel
            selectedIds={selectedIndicatorCodes}
            onAddIndicator={handleAddIndicator}
            targetGroupName={targetGroupName}
          />
        </div>
      </div>

      {/* 新建分组对话框 */}
      {showNewGroupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewGroupDialog(false)}>
          <div className="bg-card border border-border rounded-lg shadow-lg p-5 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {newGroupParentId ? '添加子分组' : '新建一级分组'}
            </h3>
            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-1">分组名称</label>
              <input
                ref={newGroupInputRef}
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmNewGroup()}
                placeholder="输入分组名称，如：在线执行"
                className="w-full h-9 px-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewGroupDialog(false)}
                className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmNewGroup}
                disabled={!newGroupName.trim()}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
