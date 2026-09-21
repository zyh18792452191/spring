'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { IndicatorModule } from '@/app/data/home/types';

interface IndicatorSelectDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开/关闭回调 */
  onOpenChange: (open: boolean) => void;
  /** 允许的指标模块ID列表（其他模块不显示） */
  allowedModuleIds: string[];
  /** 全量指标模块数据 */
  indicatorModules: IndicatorModule[];
  /** 当前已选指标ID列表 */
  selectedIds: string[];
  /** 确认选择回调 */
  onConfirm: (ids: string[]) => void;
}

const PAGE_SIZE = 10;

export default function IndicatorSelectDialog({
  open,
  onOpenChange,
  allowedModuleIds,
  indicatorModules,
  selectedIds,
  onConfirm,
}: IndicatorSelectDialogProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedIds);
  const [currentPage, setCurrentPage] = useState(1);

  // 打开时同步已选状态
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelectedIds([...selectedIds]);
      setSearchKeyword('');
      setCurrentPage(1);
    }
    onOpenChange(isOpen);
  };

  // 只显示允许的模块中的指标，展平为一维列表
  const allAllowedIndicators = useMemo(() => {
    const result: Array<{ id: string; name: string; availableTimeMode: string; moduleName: string }> = [];
    indicatorModules
      .filter(m => allowedModuleIds.includes(m.id))
      .forEach(module => {
        module.indicators.forEach(ind => {
          result.push({
            id: ind.id,
            name: ind.name,
            availableTimeMode: ind.availableTimeMode,
            moduleName: module.name,
          });
        });
      });
    return result;
  }, [indicatorModules, allowedModuleIds]);

  // 根据搜索过滤
  const filteredIndicators = useMemo(() => {
    if (!searchKeyword.trim()) return allAllowedIndicators;
    const kw = searchKeyword.trim().toLowerCase();
    return allAllowedIndicators.filter(ind =>
      ind.name.toLowerCase().includes(kw) || ind.id.toLowerCase().includes(kw)
    );
  }, [allAllowedIndicators, searchKeyword]);

  // 总页数
  const totalPages = Math.max(1, Math.ceil(filteredIndicators.length / PAGE_SIZE));

  // 当前页数据
  const pagedIndicators = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredIndicators.slice(start, start + PAGE_SIZE);
  }, [filteredIndicators, currentPage]);

  // 翻页时校正页码
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // 单个指标选择
  const handleIndicatorToggle = (indicatorId: string) => {
    setTempSelectedIds(prev => {
      if (prev.includes(indicatorId)) {
        return prev.filter(id => id !== indicatorId);
      }
      return [...prev, indicatorId];
    });
  };

  // 已选指标详情（用于右侧表格展示）
  const selectedIndicators = useMemo(() => {
    return tempSelectedIds
      .map(id => allAllowedIndicators.find(ind => ind.id === id))
      .filter(Boolean) as Array<{ id: string; name: string; availableTimeMode: string; moduleName: string }>;
  }, [tempSelectedIds, allAllowedIndicators]);

  // 移除已选指标
  const handleRemoveSelected = (indicatorId: string) => {
    setTempSelectedIds(prev => prev.filter(id => id !== indicatorId));
  };

  // 获取指标的时间模式标签
  const getTimeModeLabel = (timeMode: string): string => {
    switch (timeMode) {
      case 'daily': return '日度';
      case 'monthly': return '月度';
      case 'both': return '日/月';
      default: return timeMode;
    }
  };

  // 生成页码数组
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[1000px] h-[800px] flex flex-col p-0 z-[9999]" disableMaxWidth>
        {/* 头部 */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-semibold">选择指标</DialogTitle>
        </DialogHeader>

        {/* 主体：左右分栏 */}
        <div className="flex-1 overflow-hidden flex gap-4 px-6 py-4" style={{ minHeight: '380px' }}>
          {/* 左侧：可选列表 */}
          <div className="flex-1 flex flex-col border rounded-md">
            {/* 左侧顶部：数量+搜索 */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
              <span className="text-xs text-muted-foreground">可选列表: {filteredIndicators.length}</span>
              <div className="relative w-44">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="请输入名称"
                  value={searchKeyword}
                  onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>

            {/* 左侧列表 */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              {pagedIndicators.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  {searchKeyword ? '未找到匹配的指标' : '当前场景无可用指标'}
                </div>
              )}
              {pagedIndicators.map(indicator => {
                const isSelected = tempSelectedIds.includes(indicator.id);
                return (
                  <label
                    key={indicator.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                      isSelected ? 'bg-primary/8' : 'hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleIndicatorToggle(indicator.id)}
                      className="w-3.5 h-3.5 rounded cursor-pointer accent-primary"
                    />
                    <span className={`flex-1 truncate ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {indicator.name}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* 左侧底部分页 */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
              <span className="text-xs text-muted-foreground">共{filteredIndicators.length}条</span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {getPageNumbers().map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={p}
                      className={`min-w-[24px] h-6 rounded text-xs font-medium transition-colors ${
                        p === currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="p-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：已选指标 */}
          <div className="flex-1 flex flex-col border rounded-md">
            {/* 右侧顶部 */}
            <div className="flex items-center px-3 py-2 border-b bg-muted/20">
              <span className="text-xs text-muted-foreground">已选指标: {selectedIndicators.length}</span>
            </div>

            {/* 右侧表格 */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-[55%]">名称</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-[20%]">类型</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground w-[25%]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedIndicators.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                        暂未选择指标
                      </td>
                    </tr>
                  )}
                  {selectedIndicators.map(indicator => (
                    <tr key={indicator.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs truncate max-w-[160px]" title={indicator.name}>
                        {indicator.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {getTimeModeLabel(indicator.availableTimeMode)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleRemoveSelected(indicator.id)}
                          title="移除"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <DialogFooter className="px-6 py-3 border-t shrink-0 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            已选 <span className="font-semibold text-primary">{tempSelectedIds.length}</span> 个指标
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
            <Button size="sm" onClick={() => { onConfirm(tempSelectedIds); onOpenChange(false); }}>
              <Check className="h-4 w-4 mr-1" />
              确定
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
