'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { MainIndicator, SubIndicator, RegionIndicatorRow, SubIndicatorValue, BreadcrumbNode, AvailableTimeMode } from '@/app/data/home/types';
import { regionTree, findRegionNode, findRegionPath, generateRegionIndicatorRows } from '@/app/data/home/regionDrillData';

/** 根据当前维度获取指标展示值 */
function getVal(ind: { value: number; dailyValue?: number }, timeMode: string): number {
  if (timeMode === 'daily' && ind.dailyValue !== undefined) return ind.dailyValue;
  return ind.value;
}

/** 根据当前维度获取较月同期值 */
function getChg(ind: { changeValue?: string; dailyChangeValue?: string }, timeMode: string): string | undefined {
  if (timeMode === 'daily' && ind.dailyChangeValue !== undefined) return ind.dailyChangeValue;
  return ind.changeValue;
}

interface IndicatorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicator: MainIndicator | null;
  currentTimeMode: 'daily' | 'monthly';
  currentDate: Date;
}

export default function IndicatorDetailDialog({
  open,
  onOpenChange,
  indicator,
  currentTimeMode,
  currentDate,
}: IndicatorDetailDialogProps) {
  const [drillRegionCode, setDrillRegionCode] = useState<string>('650000');
  const [dialogTimeMode, setDialogTimeMode] = useState<'daily' | 'monthly'>(currentTimeMode);
  const [dialogDate, setDialogDate] = useState<Date>(currentDate);

  // 弹窗打开时初始化时间和区域状态
  useEffect(() => {
    if (open && indicator) {
      setDrillRegionCode('650000');
      if (indicator.availableTimeMode === 'daily') {
        setDialogTimeMode('daily');
      } else if (indicator.availableTimeMode === 'monthly') {
        setDialogTimeMode('monthly');
      } else {
        setDialogTimeMode(currentTimeMode);
      }
      setDialogDate(currentDate);
    }
  }, [open, indicator, currentTimeMode, currentDate]);

  const drillRegion = drillRegionCode ? findRegionNode(regionTree, drillRegionCode) : null;
  const breadcrumb = drillRegion ? findRegionPath(regionTree, drillRegionCode) : [];

  // 生成区域下钻数据
  const regionRows: RegionIndicatorRow[] = drillRegion && indicator
    ? generateRegionIndicatorRows(
        indicator.id,
        drillRegion,
        typeof getVal(indicator, currentTimeMode) === 'number' ? getVal(indicator, currentTimeMode) : 0,
        indicator.unit,
        getChg(indicator, currentTimeMode),
        indicator.subIndicators.map(s => ({
          name: s.name,
          unit: s.unit,
          value: typeof getVal(s, currentTimeMode) === 'number' ? getVal(s, currentTimeMode) : 0,
          hasChange: !!getChg(s, currentTimeMode),
          changeValue: s.changeValue,
        }))
      )
    : [];

  // 格式化数值
  const fmt = (val: string | number, unit: string): string => {
    if (typeof val === 'string') return val;
    if (unit === '%' || unit === 'pp') return `${val.toFixed(2)}${unit}`;
    if (unit === '万户' || unit === '万元') return `${val.toFixed(2)}${unit}`;
    if (unit === '户') return val >= 10000 ? `${(val / 10000).toFixed(2)}万户` : `${val.toLocaleString()}户`;
    if (unit === 'GB') return `${val.toFixed(2)}GB`;
    return `${val}${unit}`;
  };

  // 环比颜色
  const getChangeColor = (direction?: string, isPositive?: boolean): string => {
    if (!direction || direction === 'flat') return 'text-muted-foreground';
    return isPositive ? 'text-emerald-600' : 'text-red-500';
  };

  // 环比箭头
  const getChangeIcon = (direction?: string): string => {
    if (!direction || direction === 'flat') return '→';
    if (direction === 'up') return '↑';
    return '↓';
  };

  // 格式化日期/月份显示
  const formatDateDisplay = useCallback((): string => {
    const d = dialogDate;
    if (dialogTimeMode === 'daily') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  }, [dialogDate, dialogTimeMode]);

  // 日期前后翻页
  const navigateDate = (delta: number) => {
    setDialogDate(prev => {
      const d = new Date(prev);
      if (dialogTimeMode === 'daily') {
        d.setDate(d.getDate() + delta);
      } else {
        d.setMonth(d.getMonth() + delta);
      }
      return d;
    });
  };

  // 判断区域是否可下钻
  const canDrillDown = (regionCode: string): boolean => {
    const node = findRegionNode(regionTree, regionCode);
    return !!(node && node.children && node.children.length > 0);
  };

  // 点击区域下钻
  const handleRegionClick = (regionCode: string) => {
    if (canDrillDown(regionCode)) {
      setDrillRegionCode(regionCode);
    }
  };

  // 面包屑点击回溯
  const handleBreadcrumbClick = (node: BreadcrumbNode) => {
    setDrillRegionCode(node.code);
  };

  if (!indicator) return null;

  const hasSubIndicators = indicator.subIndicators.length > 0;

  // 判断指标在弹窗内是否可切换日/月
  const canSwitchTimeMode = indicator.availableTimeMode === 'both';
  const effectiveTimeMode = indicator.availableTimeMode === 'both'
    ? dialogTimeMode
    : (indicator.availableTimeMode === 'daily' ? 'daily' : 'monthly');

  // 构建表格列定义：值+环比配对
  // 列结构：地域 | 主指标值 | 主指标环比 | [子指标1值 | 子指标1环比(如有)] | [子指标2值 | 子指标2环比(如有)] | ...
  interface ColumnDef {
    key: string;
    header: string;
    type: 'region' | 'main-value' | 'main-change' | 'sub-value' | 'sub-change';
    subIndex?: number;
    width?: string;
  }

  const columns: ColumnDef[] = [
    { key: 'region', header: '地域', type: 'region' },
    { key: 'main-val', header: indicator.name, type: 'main-value' },
  ];
  // 主指标较月同期列：只有日累计型(both)指标才有，且子指标中没有"较上月同期"/"环比上月"时才显示
  // （如果子指标中已有"较上月同期"/"环比上月"，则它作为独立子指标列展示，不需要再为主指标单独加一列）
  const hasMoMSubIndicator = indicator.subIndicators.some(s =>
    s.name === '较上月同期' || s.name === '环比上月'
  );
  if (indicator.changeValue && !hasMoMSubIndicator) {
    columns.push({ key: 'main-chg', header: '较上月同期', type: 'main-change', width: 'w-24' });
  }

  indicator.subIndicators.forEach((sub, idx) => {
    columns.push({ key: `sub-val-${idx}`, header: sub.name, type: 'sub-value', subIndex: idx });
    if (sub.changeValue) {
      columns.push({ key: `sub-chg-${idx}`, header: '较上月同期', type: 'sub-change', subIndex: idx, width: 'w-24' });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1000px] max-h-[90vh] flex flex-col p-0">
        {/* 标题区 */}
        <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
          <DialogTitle className="text-lg font-semibold">{indicator.name}</DialogTitle>
        </DialogHeader>

        {/* 时间切换 + 面包屑 */}
        <div className="px-6 pb-3 flex items-center justify-between border-b shrink-0">
          {/* 面包屑 */}
          <div className="flex items-center gap-1 text-sm">
            {breadcrumb.map((node, idx) => (
              <span key={node.code} className="flex items-center">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                {idx < breadcrumb.length - 1 ? (
                  <button
                    onClick={() => handleBreadcrumbClick(node)}
                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    {node.name}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{node.name}</span>
                )}
              </span>
            ))}
          </div>

          {/* 时间切换 */}
          <div className="flex items-center gap-2">
            {canSwitchTimeMode && (
              <div className="flex items-center bg-muted rounded-md p-0.5">
                <button
                  onClick={() => setDialogTimeMode('daily')}
                  className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                    effectiveTimeMode === 'daily'
                      ? 'bg-white text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  日
                </button>
                <button
                  onClick={() => setDialogTimeMode('monthly')}
                  className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                    effectiveTimeMode === 'monthly'
                      ? 'bg-white text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  月
                </button>
              </div>
            )}
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-sm font-medium min-w-[110px] text-center">{formatDateDisplay()}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateDate(1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* 子指标卡片区（flex-wrap换行） */}
          {hasSubIndicators && (
            <div className="flex flex-wrap gap-3 mt-4 mb-4">
              {indicator.subIndicators.map(sub => (
                <div
                  key={sub.id}
                  className="bg-blue-50 rounded-lg px-4 py-3 min-w-[160px] flex-1"
                >
                  <div className="text-xs text-muted-foreground mb-1">{sub.name}</div>
                  <div className="text-base font-semibold text-foreground">
                    {fmt(getVal(sub, currentTimeMode), sub.unit)}
                  </div>
                  {getChg(sub, currentTimeMode) && (
                    <div className={`text-xs mt-1 ${getChangeColor(sub.changeDirection, sub.isPositive)}`}>
                      较上月同期: {getChg(sub, currentTimeMode)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 区域×指标交叉表格 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    {columns.map(col => (
                      <th
                        key={col.key}
                        className={`${
                          col.type === 'region'
                            ? 'sticky left-0 z-20 bg-muted/50 border-r'
                            : 'text-right'
                        } px-3 py-2 font-medium text-muted-foreground whitespace-nowrap ${col.width || ''}`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regionRows.map((row, rowIdx) => {
                    const isClickable = canDrillDown(row.regionCode);
                    const isCurrentRegion = row.regionCode === drillRegionCode;
                    const rowBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-muted/20';

                    return (
                      <tr key={row.regionCode} className={rowBg}>
                        {columns.map(col => {
                          // 地域列
                          if (col.type === 'region') {
                            return (
                              <td key={col.key} className={`sticky left-0 z-10 px-3 py-2 whitespace-nowrap border-r ${rowBg}`}>
                                {isClickable && !isCurrentRegion ? (
                                  <button
                                    onClick={() => handleRegionClick(row.regionCode)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-0.5"
                                  >
                                    {row.regionName}
                                    <ChevronDown className="w-3 h-3 text-blue-400 rotate-[-90deg]" />
                                  </button>
                                ) : (
                                  <span className="font-medium">{row.regionName}</span>
                                )}
                              </td>
                            );
                          }

                          // 主指标值列
                          if (col.type === 'main-value') {
                            return (
                              <td key={col.key} className="text-right px-3 py-2 font-medium">
                                {row.mainValue}
                              </td>
                            );
                          }

                          // 主指标较上月同期列
                          if (col.type === 'main-change') {
                            return (
                              <td key={col.key} className={`text-right px-3 py-2 text-xs ${getChangeColor(row.mainChangeDirection, row.mainIsPositive)}`}>
                                {row.mainChange && row.mainChange !== '0.00%' ? row.mainChange : '-'}
                              </td>
                            );
                          }

                          // 子指标值列
                          if (col.type === 'sub-value' && col.subIndex !== undefined) {
                            const sv = row.subValues[col.subIndex];
                            return (
                              <td key={col.key} className="text-right px-3 py-2">
                                {sv ? sv.value : '-'}
                              </td>
                            );
                          }

                          // 子指标较上月同期列
                          if (col.type === 'sub-change' && col.subIndex !== undefined) {
                            const sv = row.subValues[col.subIndex];
                            return (
                              <td key={col.key} className={`text-right px-3 py-2 text-xs ${getChangeColor(sv?.direction, sv?.isPositive)}`}>
                                {sv?.change ? sv.change : '-'}
                              </td>
                            );
                          }

                          return <td key={col.key}>-</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
