'use client';

import type { IndicatorModule, MainIndicator, TimeMode } from '@/app/data/home/types';
import { IndicatorCard } from './IndicatorCard';

interface IndicatorModuleSectionProps {
  module: IndicatorModule;
  timeMode: TimeMode;
  onIndicatorClick: (indicator: MainIndicator) => void;
}

export function IndicatorModuleSection({
  module,
  timeMode,
  onIndicatorClick,
}: IndicatorModuleSectionProps) {
  return (
    <div className="mb-6">
      {/* 模块标题 */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-base font-semibold text-foreground">{module.name}</h2>
        <span className="text-xs text-muted-foreground">
          {module.indicators.length}个指标
        </span>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid grid-cols-4 gap-3">
        {module.indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            timeMode={timeMode}
            onClick={() => onIndicatorClick(indicator)}
          />
        ))}
      </div>
    </div>
  );
}
