'use client';

import { useState, useEffect, ReactNode } from 'react';

interface DynamicChartProps {
  children: ReactNode;
  /** Height of the placeholder while loading, default 200px */
  height?: number;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * Wrapper component that delays rendering its children until after client mount.
 * This prevents recharts hydration mismatches where SSR and client generate
 * different clipPath IDs (e.g., recharts1-clip vs recharts2-clip).
 *
 * Usage:
 *   <DynamicChart>
 *     <PieChart>...</PieChart>
 *   </DynamicChart>
 */
export function DynamicChart({ children, height = 200, className }: DynamicChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center ${className || ''}`}
        style={{ height }}
      >
        <div className="text-muted-foreground text-sm animate-pulse">加载图表中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
