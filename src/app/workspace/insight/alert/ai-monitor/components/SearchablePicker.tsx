'use client';

import { useRef, useState, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PickerOption {
  value: string;
  label: string;
}

interface SearchablePickerProps {
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** 是否显示"未选择"占位（必填场景传 false，表示必须选择一项） */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 通用可搜索单选下拉（区别于带"全部"的筛选版 SearchableSelect）：
 * 用于新增弹窗中的指标选择、预警范围选择，点击外部关闭、支持关键字过滤
 */
export function SearchablePicker({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = keyword.trim()
    ? options.filter((o) => o.label.includes(keyword.trim()))
    : options;

  const selected = options.find((o) => o.value === value);

  const toggle = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
      setKeyword('');
    }
  };

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setKeyword('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={toggle}
        className={cn('w-full justify-between font-normal h-9', !selected && 'text-gray-400')}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </Button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {/* 搜索框 */}
          <div className="relative p-2 border-b border-gray-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索名称"
              className="w-full h-8 pl-8 pr-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-[#0085D0]"
            />
          </div>
          {/* 选项列表 */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">未找到匹配项</div>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => pick(o.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-blue-50',
                      active && 'bg-blue-50 text-[#0085D0] font-medium hover:bg-blue-50'
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && <Check className="w-3.5 h-3.5 shrink-0 text-[#0085D0]" />}
                  </button>
                );
              })
            )}
          </div>
          <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">
            共 {filtered.length} 项
          </div>
        </div>
      )}
    </div>
  );
}
