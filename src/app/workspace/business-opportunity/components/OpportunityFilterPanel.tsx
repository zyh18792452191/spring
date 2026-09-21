'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

// 标签筛选项（支持数量展示）
export interface TagFilterOption {
  value: string;
  label: string;
  count?: number; // 该选项对应的数据量
}

export interface TagFilterGroup {
  key: string;
  label: string;
  options: TagFilterOption[];
}

// 下拉筛选项
export interface SelectFilterItem {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

// 级联筛选项
export interface CascadeFilterItem {
  key: string;
  levels: {
    key: string;
    label: string;
    placeholder: string;
    options: { value: string; label: string }[];
    parentKey?: string;
  }[];
}

interface OpportunityFilterPanelProps {
  // 标签筛选组
  tagFilters?: TagFilterGroup[];
  // 当前标签筛选值
  tagValues?: Record<string, string>;
  onTagChange?: (key: string, value: string) => void;
  // 下拉筛选
  selectFilters?: SelectFilterItem[];
  selectValues?: Record<string, string>;
  onSelectChange?: (key: string, value: string) => void;
  // ID 搜索
  idSearchValue?: string;
  onIdSearchChange?: (value: string) => void;
  idSearchPlaceholder?: string;
  // 级联筛选
  cascadeFilters?: CascadeFilterItem[];
  cascadeValues?: Record<string, string>;
  onCascadeChange?: (key: string, value: string) => void;
  // 重置
  onReset?: () => void;
  // 统计
  totalCount?: number;
  totalLabel?: string;
}

export default function OpportunityFilterPanel({
  tagFilters = [],
  tagValues = {},
  onTagChange,
  selectFilters = [],
  selectValues = {},
  onSelectChange,
  idSearchValue = '',
  onIdSearchChange,
  idSearchPlaceholder = '请输入商机ID',
  cascadeFilters = [],
  cascadeValues = {},
  onCascadeChange,
  onReset,
  totalCount,
  totalLabel = '商机',
}: OpportunityFilterPanelProps) {
  return (
    <div className="space-y-3">
      {/* 标签筛选组 */}
      {tagFilters.map(group => (
        <div key={group.key} className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground w-16 shrink-0">{group.label}：</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 全部按钮 */}
            <Badge
              variant={!tagValues[group.key] ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1 text-xs transition-colors ${
                !tagValues[group.key]
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onTagChange?.(group.key, '')}
            >
              全部{group.options.length > 0 && group.options[0].count !== undefined
                ? `(${group.options.reduce((sum, o) => sum + (o.count || 0), 0)})`
                : ''}
            </Badge>
            {group.options.map(opt => (
              <Badge
                key={opt.value}
                variant={tagValues[group.key] === opt.value ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1 text-xs transition-colors ${
                  tagValues[group.key] === opt.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onTagChange?.(group.key, tagValues[group.key] === opt.value ? '' : opt.value)}
              >
                {opt.label}{opt.count !== undefined ? `(${opt.count})` : ''}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {/* 下拉 + 输入筛选行 */}
      {(selectFilters.length > 0 || onIdSearchChange || cascadeFilters.length > 0) && (
        <div className="grid grid-cols-4 gap-3">
          {/* ID 搜索 */}
          {onIdSearchChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-16 shrink-0">商机ID：</span>
              <Input
                placeholder={idSearchPlaceholder}
                value={idSearchValue}
                onChange={(e) => onIdSearchChange(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
            </div>
          )}

          {/* 级联筛选 */}
          {cascadeFilters.map(cascade =>
            cascade.levels.map(level => (
              <div key={level.key} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16 shrink-0">{level.label}：</span>
                <Select
                  value={cascadeValues[level.key] || ''}
                  onValueChange={(v) => onCascadeChange?.(level.key, v)}
                >
                  <SelectTrigger className="flex-1 h-8 text-sm">
                    <SelectValue placeholder={level.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {level.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}

          {/* 下拉筛选 */}
          {selectFilters.map(filter => (
            <div key={filter.key} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-16 shrink-0">{filter.label}：</span>
              <Select
                value={selectValues[filter.key] || ''}
                onValueChange={(v) => onSelectChange?.(filter.key, v)}
              >
                <SelectTrigger className="flex-1 h-8 text-sm">
                  <SelectValue placeholder={filter.placeholder || '请选择'} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onReset} className="h-8">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />重置
            </Button>
          </div>
        </div>
      )}

      {/* 统计 */}
      {totalCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          共 <span className="font-medium text-foreground">{totalCount}</span> 条{totalLabel}
        </div>
      )}
    </div>
  );
}
