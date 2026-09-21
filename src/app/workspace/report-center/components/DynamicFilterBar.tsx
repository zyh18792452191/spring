'use client';

import { useState, useMemo } from 'react';
import { FilterConfig } from '../data/types';
import { CITY_LIST, DISTRICT_MAP, GRID_MAP } from '../data/regionData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export interface FilterValues {
  [key: string]: string | string[] | { from?: Date; to?: Date } | undefined;
}

interface DynamicFilterBarProps {
  filterConfig: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onSearch: () => void;
}

/** 区域级联选择器 */
function RegionCascader({
  value,
  onChange,
}: {
  value: { city?: string; district?: string; grid?: string };
  onChange: (val: { city: string; cityName: string; district: string; districtName: string; grid: string; gridName: string }) => void;
}) {
  const [cityCode, setCityCode] = useState(value.city || '');
  const [districtCode, setDistrictCode] = useState(value.district || '');
  const [gridCode, setGridCode] = useState(value.grid || '');

  const districts = useMemo(() => {
    if (!cityCode) return [];
    return DISTRICT_MAP[cityCode] || [];
  }, [cityCode]);

  const grids = useMemo(() => {
    if (!districtCode) return [];
    return GRID_MAP[districtCode] || [];
  }, [districtCode]);

  const handleCityChange = (code: string) => {
    setCityCode(code);
    setDistrictCode('');
    setGridCode('');
    const city = CITY_LIST.find(c => c.code === code);
    onChange({ city: code, cityName: city?.name || '', district: '', districtName: '', grid: '', gridName: '' });
  };

  const handleDistrictChange = (code: string) => {
    setDistrictCode(code);
    setGridCode('');
    const dist = districts.find(d => d.code === code);
    onChange({ city: cityCode, cityName: '', district: code, districtName: dist?.name || '', grid: '', gridName: '' });
  };

  const handleGridChange = (code: string) => {
    setGridCode(code);
    const grid = grids.find(g => g.code === code);
    onChange({ city: cityCode, cityName: '', district: districtCode, districtName: '', grid: code, gridName: grid?.name || '' });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={cityCode} onValueChange={handleCityChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="地州" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全疆</SelectItem>
          {CITY_LIST.map(city => (
            <SelectItem key={city.code} value={city.code}>{city.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {cityCode && cityCode !== 'all' && districts.length > 0 && (
        <Select value={districtCode} onValueChange={handleDistrictChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="区县" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部区县</SelectItem>
            {districts.map(d => (
              <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {districtCode && districtCode !== 'all' && grids.length > 0 && (
        <Select value={gridCode} onValueChange={handleGridChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="网格" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部网格</SelectItem>
            {grids.map(g => (
              <SelectItem key={g.code} value={g.code}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/** 日期范围选择器 */
function DateRangePicker({
  value,
  onChange,
}: {
  value: { from?: Date; to?: Date };
  onChange: (val: { from?: Date; to?: Date }) => void;
}) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('h-8 text-xs justify-start text-left font-normal w-[130px]', !value.from && 'text-muted-foreground')}>
            {value.from ? format(value.from, 'yyyy-MM-dd', { locale: zhCN }) : '开始日期'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value.from} onSelect={(d) => { onChange({ ...value, from: d || undefined }); setFromOpen(false); }} initialFocus />
        </PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground">~</span>
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('h-8 text-xs justify-start text-left font-normal w-[130px]', !value.to && 'text-muted-foreground')}>
            {value.to ? format(value.to, 'yyyy-MM-dd', { locale: zhCN }) : '结束日期'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value.to} onSelect={(d) => { onChange({ ...value, to: d || undefined }); setToOpen(false); }} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** 单个日期选择器 */
function DatePicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (val: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-8 text-xs justify-start text-left font-normal w-[130px]', !value && 'text-muted-foreground')}>
          {value ? format(value, 'yyyy-MM-dd', { locale: zhCN }) : '选择日期'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={(d) => { onChange(d || undefined); setOpen(false); }} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

export default function DynamicFilterBar({ filterConfig, values, onChange, onSearch }: DynamicFilterBarProps) {
  if (!filterConfig || filterConfig.length === 0) return null;

  // 按 order 排序
  const sortedConfig = [...filterConfig].sort((a, b) => a.order - b.order);

  const handleValueChange = (id: string, val: unknown) => {
    onChange({ ...values, [id]: val } as FilterValues);
  };

  const handleReset = () => {
    const resetValues: FilterValues = {};
    for (const fc of filterConfig) {
      if (fc.type === 'cascader') {
        resetValues[fc.id] = undefined;
      } else if (fc.type === 'dateRange') {
        resetValues[fc.id] = undefined;
      } else if (fc.type === 'date') {
        resetValues[fc.id] = undefined;
      } else {
        resetValues[fc.id] = fc.defaultValue || '';
      }
    }
    onChange(resetValues);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-4 space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {sortedConfig.map((fc) => {
          const currentValue = values[fc.id];

          return (
            <div key={fc.id} className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">
                {fc.label}
                {fc.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {fc.type === 'select' && (
                <Select
                  value={currentValue as string || fc.defaultValue || ''}
                  onValueChange={(v) => handleValueChange(fc.id, v)}
                >
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder={`请选择${fc.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {fc.staticOptions?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {fc.type === 'multiSelect' && (
                <Input
                  className="w-[160px] h-8 text-xs"
                  placeholder={`多选${fc.label}`}
                  value={Array.isArray(currentValue) ? currentValue.join(',') : (currentValue as string || '')}
                  onChange={(e) => handleValueChange(fc.id, e.target.value.split(',').filter(Boolean))}
                />
              )}

              {fc.type === 'text' && (
                <Input
                  className="w-[160px] h-8 text-xs"
                  placeholder={`请输入${fc.label}`}
                  value={(currentValue as string) || ''}
                  onChange={(e) => handleValueChange(fc.id, e.target.value)}
                />
              )}

              {fc.type === 'dateRange' && (
                <DateRangePicker
                  value={(currentValue as { from?: Date; to?: Date }) || {}}
                  onChange={(v) => handleValueChange(fc.id, v)}
                />
              )}

              {fc.type === 'date' && (
                <DatePicker
                  value={currentValue as Date | undefined}
                  onChange={(v) => handleValueChange(fc.id, v)}
                />
              )}

              {fc.type === 'cascader' && fc.cascaderSource === 'region' && (
                <RegionCascader
                  value={(currentValue as { city?: string; district?: string; grid?: string }) || {}}
                  onChange={(v) => handleValueChange(fc.id, v)}
                />
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            重置
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={onSearch}>
            <Search className="h-3 w-3 mr-1" />
            查询
          </Button>
        </div>
      </div>
    </div>
  );
}
