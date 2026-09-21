'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CITY_LIST, DISTRICT_MAP, GRID_MAP, type RegionInfo } from '../data';

export interface FilterValues {
  executionMode: string;
  orderTimeStart: string;
  orderTimeEnd: string;
  executionTimeStart: string;
  executionTimeEnd: string;
  /** 地州编码，'all' = 全疆 */
  regionCity: string;
  /** 区县编码，'all' = 全部区县 */
  regionDistrict: string;
  /** 网格编码，'all' = 全部网格 */
  regionGrid: string;
}

interface FilterBarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onQuery: () => void;
  onReset: () => void;
}

const EXECUTION_MODES = [
  { value: 'online_subcontract', label: '在线+分包看管模式' },
  { value: 'online', label: '在线模式' },
  { value: 'subcontract', label: '分包看管模式' },
];

export default function FilterBar({ filters, onChange, onQuery, onReset }: FilterBarProps) {
  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  // 区县列表：根据地州联动
  const districtOptions = useMemo<RegionInfo[]>(() => {
    if (filters.regionCity === 'all') return [];
    return DISTRICT_MAP[filters.regionCity] || [];
  }, [filters.regionCity]);

  // 网格列表：根据区县联动
  const gridOptions = useMemo<RegionInfo[]>(() => {
    if (filters.regionDistrict === 'all') return [];
    return GRID_MAP[filters.regionDistrict] || [];
  }, [filters.regionDistrict]);

  // 地州变化时：重置区县和网格
  const handleCityChange = (value: string) => {
    onChange({
      ...filters,
      regionCity: value,
      regionDistrict: 'all',
      regionGrid: 'all',
    });
  };

  // 区县变化时：重置网格
  const handleDistrictChange = (value: string) => {
    onChange({
      ...filters,
      regionDistrict: value,
      regionGrid: 'all',
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* 执行模式 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">执行模式</label>
          <select
            value={filters.executionMode}
            onChange={(e) => update('executionMode', e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {EXECUTION_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* 工单下发时间 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">工单下发时间</label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.orderTimeStart}
              onChange={(e) => update('orderTimeStart', e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <input
              type="date"
              value={filters.orderTimeEnd}
              onChange={(e) => update('orderTimeEnd', e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* 执行时间 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">执行时间</label>
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={filters.executionTimeStart}
              onChange={(e) => update('executionTimeStart', e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="开始时间"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <input
              type="date"
              value={filters.executionTimeEnd}
              onChange={(e) => update('executionTimeEnd', e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="结束时间"
            />
          </div>
        </div>

        {/* 查询区域 - 地州 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">查询区域</label>
          <div className="flex items-center gap-1">
            <select
              value={filters.regionCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">全疆</option>
              {CITY_LIST.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>

            {/* 区县 - 仅选了地市后可用 */}
            <select
              value={filters.regionDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={filters.regionCity === 'all'}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">全部区县</option>
              {districtOptions.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>

            {/* 网格 - 仅选了区县后可用 */}
            <select
              value={filters.regionGrid}
              onChange={(e) => update('regionGrid', e.target.value)}
              disabled={filters.regionDistrict === 'all'}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">全部网格</option>
              {gridOptions.map((g) => (
                <option key={g.code} value={g.code}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="h-8 text-xs">
            重置
          </Button>
          <Button size="sm" onClick={onQuery} className="h-8 text-xs">
            查询
          </Button>
        </div>
      </div>
    </div>
  );
}
