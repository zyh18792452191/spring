'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ColumnDef,
  HeaderCell,
  PortOutRecord,
  getLeafColumns,
  getMaxDepth,
  buildHeaderRows,
} from '../data';

// ==================== 组件接口 ====================

interface GroupedHeaderTableProps {
  columns: ColumnDef[];
  data: PortOutRecord[];
  /** 是否显示操作列（下钻+下载明细） */
  showActionColumn?: boolean;
  /** 当前下钻层级 */
  drillLevel?: 'city' | 'district' | 'grid';
  /** 下钻回调 */
  onDrillDown?: (record: PortOutRecord) => void;
  /** 下载明细回调 */
  onDownloadDetail?: (record: PortOutRecord) => void;
  /** 首行是否为汇总行（汇总行不下钻） */
  firstRowIsSummary?: boolean;
  /** 面包屑路径 */
  breadcrumbPath?: Array<{ code: string; name: string }>;
  /** 面包屑点击回调 */
  onBreadcrumbClick?: (code: string, level: number) => void;
}

// ==================== 主组件 ====================

export default function GroupedHeaderTable({
  columns,
  data,
  showActionColumn = false,
  drillLevel = 'city',
  onDrillDown,
  onDownloadDetail,
  firstRowIsSummary = false,
  breadcrumbPath,
  onBreadcrumbClick,
}: GroupedHeaderTableProps) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // 计算表头行和叶节点列
  const { headerRows, leafColumns, maxDepth } = useMemo(() => {
    const depth = getMaxDepth(columns);
    const rows = buildHeaderRows(columns, depth);
    const leaves = getLeafColumns(columns);
    return { headerRows: rows, leafColumns: leaves, maxDepth: depth };
  }, [columns]);

  // 计算操作列的left偏移（所有非操作列的宽度之和，用于sticky right时定位）
  const actionColIndex = leafColumns.findIndex((l) => l.id === '_action');
  const regionColIndex = leafColumns.findIndex((l) => l.id === 'regionName');

  // 判断是否可以下钻（非末级）
  const canDrillDown = drillLevel !== 'grid';

  // 判断某行是否可以下钻（汇总行不能下钻）
  const isRowDrillable = useCallback(
    (index: number) => {
      if (!canDrillDown) return false;
      if (firstRowIsSummary && index === 0) return false;
      return true;
    },
    [canDrillDown, firstRowIsSummary]
  );

  // 判断表头单元格是否属于首列（regionName）
  const isRegionHeader = useCallback(
    (cell: HeaderCell) => cell.id === 'regionName',
    []
  );

  // 判断表头单元格是否属于末列（操作列）
  const isActionHeader = useCallback(
    (cell: HeaderCell) => cell.id === '_action',
    []
  );

  return (
    <div className="w-full">
      {/* 面包屑导航 */}
      {breadcrumbPath && breadcrumbPath.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-2 bg-muted/30 rounded-t-lg border border-border border-b-0 text-sm">
          {breadcrumbPath.map((node, idx) => (
            <React.Fragment key={node.code}>
              {idx > 0 && <span className="text-muted-foreground mx-1">&gt;</span>}
              {idx < breadcrumbPath.length - 1 ? (
                <button
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => onBreadcrumbClick?.(node.code, idx)}
                >
                  {node.name}
                </button>
              ) : (
                <span className="font-medium text-foreground">{node.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 表格容器 */}
      <div className="overflow-auto border border-border rounded-b-lg" style={{ maxHeight: '70vh' }}>
        <table className="w-full border-collapse text-xs whitespace-nowrap">
          {/* 表头 */}
          <thead className="sticky top-0 z-20">
            {headerRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="bg-muted/60">
                {row.map((cell: HeaderCell, cellIdx: number) => {
                  const isRegion = isRegionHeader(cell);
                  const isAction = isActionHeader(cell);

                  return (
                    <th
                      key={`${rowIdx}-${cellIdx}`}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      className={`px-2 py-1.5 text-center font-medium text-foreground border-b border-r border-border ${
                        isRegion
                          ? 'sticky left-0 z-30 bg-muted/80'
                          : isAction
                          ? 'sticky right-0 z-30 bg-muted/80'
                          : 'bg-muted/60'
                      }`}
                      style={{ minWidth: cell.colSpan === 1 && cell.rowSpan === maxDepth ? 60 : undefined }}
                      onMouseEnter={() => cell.id && setHoveredCol(cell.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {cell.title}
                      {cell.tooltip && cell.colSpan === 1 && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="inline ml-0.5 w-3 h-3 text-muted-foreground/60 cursor-help align-middle" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              {cell.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* 数据行 */}
          <tbody>
            {data.map((record, rowIdx) => {
              const isSummary = firstRowIsSummary && rowIdx === 0;
              const drillable = isRowDrillable(rowIdx);
              return (
                <tr
                  key={record.regionCode as string}
                  className={`${isSummary ? 'bg-primary/5 font-semibold' : 'bg-background'} hover:bg-muted/30 transition-colors border-b border-border`}
                >
                  {leafColumns.map((leaf) => {
                    const colId = leaf.id;
                    if (!colId) return null;

                    // 操作列：sticky right
                    if (colId === '_action') {
                      if (!showActionColumn) return <td key={colId} className="px-2 py-1.5 border-r border-border sticky right-0 z-10 bg-inherit" />;
                      return (
                        <td
                          key={colId}
                          className={`px-2 py-1.5 border-l border-r border-border text-center sticky right-0 z-10 ${
                            isSummary ? 'bg-primary/5' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {drillable && (
                              <button
                                className="text-primary hover:underline cursor-pointer text-xs"
                                onClick={() => onDrillDown?.(record)}
                              >
                                下钻
                              </button>
                            )}
                            <button
                              className="text-primary hover:underline cursor-pointer text-xs"
                              onClick={() => onDownloadDetail?.(record)}
                            >
                              下载明细
                            </button>
                          </div>
                        </td>
                      );
                    }

                    // 地州列：sticky left（可下钻行蓝色可点击）
                    if (colId === 'regionName') {
                      return (
                        <td
                          key={colId}
                          className={`px-2 py-1.5 text-left border-r border-border sticky left-0 z-10 ${
                            isSummary ? 'bg-primary/5' : 'bg-background'
                          }`}
                        >
                          {drillable ? (
                            <span
                              className="cursor-pointer hover:underline font-medium"
                              style={{ color: 'var(--link)' }}
                              onClick={() => onDrillDown?.(record)}
                            >
                              {record[colId] as string}
                            </span>
                          ) : (
                            <span className={isSummary ? 'font-semibold' : ''}>
                              {record[colId] as string}
                            </span>
                          )}
                        </td>
                      );
                    }

                    // 数值列
                    const value = record[colId];
                    const numValue = Number(value) || 0;
                    const isHighlighted = hoveredCol === colId;

                    return (
                      <td
                        key={colId}
                        className={`px-2 py-1.5 text-right border-r border-border tabular-nums ${
                          isHighlighted ? 'bg-primary/5' : ''
                        } ${numValue === 0 ? 'text-muted-foreground' : ''}`}
                      >
                        {numValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
