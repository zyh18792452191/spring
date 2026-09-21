'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface MonthPickerProps {
  value?: string; // 格式: "YYYY-MM"
  onChange?: (value: string) => void;
  className?: string;
}

export default function MonthPicker({ value = '2025-10', onChange, className = '' }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(parseInt(value.split('-')[0]));
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearChange = (delta: number) => {
    setCurrentYear(currentYear + delta);
  };

  const handleMonthSelect = (month: number) => {
    const newValue = `${currentYear}-${month.toString().padStart(2, '0')}`;
    onChange?.(newValue);
    setIsOpen(false);
  };

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const [year, month] = value.split('-').map(Number);
  const isCurrentYear = currentYear === year;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 选择器按钮 */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 font-normal min-w-[120px] justify-between"
      >
        <span>{year}年{month}月</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-4 w-64">
          {/* 年份选择 */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="font-semibold text-base">{currentYear}年</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>

          {/* 月份网格 */}
          <div className="grid grid-cols-4 gap-2">
            {months.map((label, index) => {
              const monthNum = index + 1;
              const isSelected = currentYear === year && monthNum === month;
              return (
                <Button
                  key={monthNum}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMonthSelect(monthNum)}
                  className="h-9 font-normal"
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
