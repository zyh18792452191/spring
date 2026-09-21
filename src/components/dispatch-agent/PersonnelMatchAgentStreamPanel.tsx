'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  usePersonnelMatchBatchStream,
  type MatchRegionItem,
} from '@/hooks/usePersonnelMatchBatchStream';
import type { RegionMatchResult } from '@/hooks/usePersonnelMatchBatchStream';

interface PersonnelMatchAgentStreamPanelProps {
  regions: MatchRegionItem[];
  title: string;
  urgencyLevel?: string;
  indicatorLabel?: string;
  dispatchKind?: 'indicator' | 'customer-group' | 'strategy';
  businessScenario?: string;
  enabled?: boolean;
  onResultsChange?: (results: Record<string | number, RegionMatchResult>) => void;
  onStreamingChange?: (streaming: boolean) => void;
}

function getStreamLineClass(line: string) {
  if (line.startsWith('✓')) return 'text-sm font-medium text-emerald-600';
  if (line.startsWith('  ✗')) return 'text-sm text-red-600';
  if (line.startsWith('[')) return 'text-sm font-medium text-[#2563EB]';
  if (line.startsWith('▶')) return 'text-sm font-medium text-gray-900';
  if (line.startsWith('  · 派发区域：')) return 'text-sm text-gray-900';
  if (line.startsWith('  ·')) return 'text-xs text-gray-600';
  if (line === '—') return 'my-1 border-b border-gray-200';
  if (line.startsWith('  └')) return 'text-xs leading-relaxed text-gray-600';
  return 'text-xs leading-relaxed text-gray-600';
}

export default function PersonnelMatchAgentStreamPanel({
  regions,
  title,
  urgencyLevel,
  indicatorLabel,
  dispatchKind = 'indicator',
  businessScenario,
  enabled = true,
  onResultsChange,
  onStreamingChange,
}: PersonnelMatchAgentStreamPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const { streamLines, isStreaming, isDone, results } = usePersonnelMatchBatchStream({
    regions,
    title,
    urgencyLevel,
    indicatorLabel,
    dispatchKind,
    businessScenario,
    enabled,
  });

  // 用 ref 保存最新回调，避免父组件回调引用漂移触发 effect 无限循环
  const onResultsChangeRef = useRef(onResultsChange);
  onResultsChangeRef.current = onResultsChange;
  const onStreamingChangeRef = useRef(onStreamingChange);
  onStreamingChangeRef.current = onStreamingChange;

  const regionSummaries = useMemo(
    () =>
      regions.map((region) => ({
        regionName: region.regionName,
        assigneeName: results[region.regionId]?.assignee?.name ?? '待分配',
      })),
    [regions, results]
  );

  useEffect(() => {
    onResultsChangeRef.current?.(results);
  }, [results]);

  useEffect(() => {
    onStreamingChangeRef.current?.(isStreaming);
  }, [isStreaming]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [streamLines]);

  if (!enabled || regions.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
        <Sparkles className="h-5 w-5 text-[#2563EB]" />
        <h3 className="text-base font-semibold text-gray-900">人员匹配Agent</h3>
        <Badge variant="secondary" className="text-xs">
          共 {regions.length} 个任务
        </Badge>
        {isStreaming && (
          <Badge variant="secondary" className="ml-auto gap-1 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            分析中
          </Badge>
        )}
        {isDone && !isStreaming && (
          <Badge className="ml-auto bg-blue-100 text-xs text-blue-700 hover:bg-blue-100">
            分析完成
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div
          ref={logRef}
          className="max-h-52 overflow-y-auto rounded-lg border bg-gray-50 px-4 py-3"
        >
          {streamLines.length === 0 && isStreaming && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
              正在启动人员匹配 Agent…
            </div>
          )}
          {streamLines.map((line, i) =>
            line === '—' ? (
              <div key={`${i}-sep`} className={getStreamLineClass(line)} />
            ) : (
              <div key={`${i}-${line}`} className={cn('py-0.5', getStreamLineClass(line))}>
                {line}
              </div>
            )
          )}
          {isStreaming && streamLines.length > 0 && (
            <span className="mt-1 inline-block h-3.5 w-0.5 animate-pulse bg-[#2563EB]" />
          )}
        </div>

        {isDone && regionSummaries.length > 0 && (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
            <div className="space-y-1.5">
              {regionSummaries.map((item) => (
                <div key={item.regionName} className="text-sm text-gray-900">
                  <span className="text-gray-500">派发区域：</span>
                  <span className="font-medium">{item.regionName}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-medium text-[#2563EB]">{item.assigneeName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { RegionMatchResult };
