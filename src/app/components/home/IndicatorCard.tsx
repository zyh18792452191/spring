'use client';

import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import type { MainIndicator, TimeMode } from '@/app/data/home/types';

interface IndicatorCardProps {
  indicator: MainIndicator;
  timeMode: TimeMode;
  onClick: () => void;
}

export function IndicatorCard({ indicator, timeMode, onClick }: IndicatorCardProps) {
  // 判断指标在当前日/月模式下是否可用
  const isAvailable =
    indicator.availableTimeMode === 'both' ||
    indicator.availableTimeMode === timeMode;

  // 不可用时直接不渲染（由调用方过滤，此处为兜底）
  if (!isAvailable) {
    return null;
  }

  const hasSubIndicators = indicator.subIndicators.length > 0;
  const isClickable = hasSubIndicators;

  // 格式化主指标值
  const formatMainValue = (val: number | string, unit: string): string => {
    if (typeof val === 'string') return val;
    if (unit === '%') return val.toFixed(2) + '%';
    if (unit === '户') {
      if (Math.abs(val) >= 10000) return (val / 10000).toFixed(2) + '万户';
      return val.toLocaleString() + '户';
    }
    if (unit === '万户') return val.toFixed(2) + '万户';
    if (unit === '万元') return val.toFixed(2) + '万元';
    if (unit === 'GB') return val.toFixed(2) + 'GB';
    if (unit === 'pp') return val.toFixed(2) + 'pp';
    return val.toFixed(2) + (unit ? unit : '');
  };

  // 变化方向图标和颜色
  const getChangeIndicator = (dir: 'up' | 'down' | 'flat', isPositive: boolean) => {
    const color = isPositive ? 'text-emerald-600' : 'text-red-500';
    if (dir === 'up') return <TrendingUp className={`w-3 h-3 ${color}`} />;
    if (dir === 'down') return <TrendingDown className={`w-3 h-3 ${color}`} />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  // 无子指标卡片（全球通保有、中高端运营）
  if (indicator.cardDisplayMode === 'simple' && !hasSubIndicators) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="text-xs text-muted-foreground mb-2 truncate">{indicator.name}</div>
        <div className={`text-2xl font-bold ${
          indicator.isPositive ? 'text-foreground' : 'text-red-500'
        }`}>
          {formatMainValue(indicator.value, indicator.unit)}
        </div>
        {indicator.changeDirection !== 'flat' && (
          <div className="flex items-center gap-1 mt-2">
            {getChangeIndicator(indicator.changeDirection ?? 'flat', indicator.isPositive ?? false)}
            <span className={`text-xs ${
              indicator.isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}>
              较上月 {indicator.changeDirection === 'up' ? '+' : ''}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 关键指标类卡片（辅助数据内嵌）
  if (indicator.cardDisplayMode === 'key') {
    return (
      <div
        className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
          isClickable ? 'cursor-pointer' : ''
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        <div className="text-xs text-muted-foreground mb-2 truncate">{indicator.name}</div>
        <div className={`text-2xl font-bold ${
          indicator.isPositive ? 'text-foreground' : 'text-red-500'
        }`}>
          {formatMainValue(indicator.value, indicator.unit)}
        </div>
        {/* 展示前2个子指标/辅助数据 */}
        <div className="mt-3 space-y-1">
          {indicator.subIndicators.slice(0, 2).map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{sub.name}</span>
              <div className="flex items-center gap-1">
                <span className={
                  sub.isPositive ? 'text-emerald-600' : 'text-red-500'
                }>{sub.changeValue}</span>
                {getChangeIndicator(sub.changeDirection || 'flat', sub.isPositive ?? false)}
              </div>
            </div>
          ))}
        </div>
        {/* 可点击提示 */}
        {hasSubIndicators && (
          <div className="flex items-center justify-end mt-2 text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    );
  }

  // 重点指标类卡片（子指标名值列表）
  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="text-xs text-muted-foreground mb-2 truncate">{indicator.name}</div>
      <div className={`text-2xl font-bold ${
        indicator.isPositive ? 'text-foreground' : 'text-red-500'
      }`}>
        {formatMainValue(indicator.value, indicator.unit)}
      </div>
      {/* 子指标名值列表 */}
      {hasSubIndicators && (
        <div className="mt-3 space-y-1">
          {indicator.subIndicators.slice(0, 3).map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{sub.name}</span>
              <span className="text-foreground font-medium">
                {sub.unit === '%' ? (typeof sub.value === 'number' ? sub.value.toFixed(2) + '%' : sub.value) :
                 sub.unit === '户' ? (typeof sub.value === 'number' ? sub.value.toLocaleString() : sub.value) :
                 sub.unit === '万户' ? (typeof sub.value === 'number' ? sub.value.toFixed(2) + '万' : sub.value) :
                 sub.unit === '万元' ? (typeof sub.value === 'number' ? sub.value.toFixed(2) + '万' : sub.value) :
                 String(sub.value)}
              </span>
            </div>
          ))}
          {indicator.subIndicators.length > 3 && (
            <div className="text-xs text-primary text-right">
              +{indicator.subIndicators.length - 3}项
            </div>
          )}
        </div>
      )}
      {/* 可点击提示 */}
      {hasSubIndicators && (
        <div className="flex items-center justify-end mt-2 text-muted-foreground">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
