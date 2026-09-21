'use client';

import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import type { TimeMode } from '@/app/data/home/types';

interface HomePageToolbarProps {
  timeMode: TimeMode;
  onTimeModeChange: (mode: TimeMode) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  cityCode: string;
  cityName: string;
  gridCode: string;
  gridName: string;
  onRegionChange: (cityCode: string, cityName: string, gridCode: string, gridName: string) => void;
}

export function HomePageToolbar({
  timeMode,
  onTimeModeChange,
  selectedDate,
  onDateChange,
  cityCode,
  cityName,
  gridCode,
  gridName,
  onRegionChange,
}: HomePageToolbarProps) {
  const handlePrevDate = () => {
    if (timeMode === 'monthly') {
      const [year, month] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 2, 1);
      onDateChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      onDateChange(d.toISOString().slice(0, 10));
    }
  };

  const handleNextDate = () => {
    if (timeMode === 'monthly') {
      const [year, month] = selectedDate.split('-').map(Number);
      const d = new Date(year, month, 1);
      onDateChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      onDateChange(d.toISOString().slice(0, 10));
    }
  };

  const displayDate = timeMode === 'monthly'
    ? selectedDate.replace('-', '年') + '月'
    : selectedDate;

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border">
      {/* 区域选择器 */}
      <div className="w-64">
        <XinjiangRegionSelector
          value={{ cityCode, gridCode }}
          onChange={onRegionChange}
        />
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-border" />

      {/* 日/月切换 */}
      <div className="flex items-center bg-muted rounded-md p-0.5">
        <button
          onClick={() => onTimeModeChange('monthly')}
          className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
            timeMode === 'monthly'
              ? 'bg-background text-foreground shadow-sm font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          月
        </button>
        <button
          onClick={() => onTimeModeChange('daily')}
          className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
            timeMode === 'daily'
              ? 'bg-background text-foreground shadow-sm font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          日
        </button>
      </div>

      {/* 日期选择器 */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevDate}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={timeMode === 'monthly' ? '上一月' : '上一日'}
        >
          ◀
        </button>
        <span className="text-sm font-medium min-w-[100px] text-center">{displayDate}</span>
        <button
          onClick={handleNextDate}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={timeMode === 'monthly' ? '下一月' : '下一日'}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
