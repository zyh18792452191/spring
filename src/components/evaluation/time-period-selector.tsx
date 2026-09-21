'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TimePeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const timePeriods = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: '180d', label: '近半年' },
  { value: '365d', label: '近1年' },
];

export function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue placeholder="选择周期" />
      </SelectTrigger>
      <SelectContent>
        {timePeriods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
