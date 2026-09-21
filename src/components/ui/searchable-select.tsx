'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allOptionLabel: string;
  allOptionValue: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  allOptionLabel,
  allOptionValue,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(o => o.value === value) || 
    (value === allOptionValue ? { value: allOptionValue, label: allOptionLabel } : null);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 触发按钮 */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? (
            <span>
              {selectedOption.label}
              {selectedOption.count !== undefined && ` (${selectedOption.count}人)`}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        {value !== allOptionValue && (
          <X
            className="h-4 w-4 ml-2 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange(allOptionValue);
            }}
          />
        )}
        <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
      </Button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
          {/* 搜索框 */}
          <div className="sticky top-0 bg-white border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* 选项列表 */}
          <div className="py-1">
            {/* 全部选项 */}
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between',
                value === allOptionValue && 'bg-blue-50'
              )}
              onClick={() => {
                onChange(allOptionValue);
                setIsOpen(false);
              }}
            >
              <span>{allOptionLabel}</span>
              {value === allOptionValue && <Check className="h-4 w-4 text-blue-600" />}
            </button>

            {/* 过滤后的选项 */}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                未找到匹配的选项
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between',
                    value === option.value && 'bg-blue-50'
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  <span className="text-gray-400 text-xs ml-2">{option.count}人</span>
                  {value === option.value && <Check className="h-4 w-4 text-blue-600 ml-2" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
