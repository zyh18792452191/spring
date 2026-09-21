'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildDispatchTicket,
  scenarioFromBusinessName,
  scenarioFromDispatchKind,
} from '@/lib/dispatch-agent/buildDispatchTicket';
import {
  buildMatchStreamIntroLines,
  buildMatchStreamPostLines,
  buildMatchStreamPreLines,
} from '@/lib/dispatch-agent/buildMatchStreamLines';
import { formatMatchReason } from '@/lib/dispatch-agent/formatMatchReason';
import { SKILL_VOCAB } from '@/lib/dispatch-agent/mockData';
import {
  provincePersonnelToStaffPool,
  resolvePersonnelByStaffId,
  type ProvincePersonnelLike,
} from '@/lib/dispatch-agent/personnelAdapter';
import type { MatchingBasis } from '@/lib/dispatch-agent/types';

export interface MatchRegionItem {
  regionId: string | number;
  regionName: string;
  personnel: ProvincePersonnelLike[];
  note?: string;
}

export interface RegionMatchResult {
  assignee: ProvincePersonnelLike | null;
  reason: string;
  basis: MatchingBasis | null;
  ready: boolean;
}

const LINE_DELAY_MS = 85;
const REGION_GAP_MS = 180;

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export function usePersonnelMatchBatchStream(options: {
  regions: MatchRegionItem[];
  title: string;
  urgencyLevel?: string;
  indicatorLabel?: string;
  dispatchKind?: 'indicator' | 'customer-group' | 'strategy';
  businessScenario?: string;
  enabled?: boolean;
}) {
  const {
    regions,
    title,
    urgencyLevel,
    indicatorLabel = '全球通携出规模-pp',
    dispatchKind = 'indicator',
    businessScenario,
    enabled = true,
  } = options;

  const sceneName = businessScenario || '中高端客户保有';
  const sceneLabel =
    dispatchKind === 'strategy'
      ? `${sceneName}（策略调度）`
      : dispatchKind === 'customer-group'
        ? `${sceneName}（客群调度）`
        : `${sceneName}（指标调度）`;

  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done'>('idle');
  const [results, setResults] = useState<Record<string | number, RegionMatchResult>>({});

  const abortRef = useRef<AbortController | null>(null);
  const regionsRef = useRef(regions);
  regionsRef.current = regions;

  const regionsKey = regions
    .map((r) => `${r.regionId}:${r.regionName}:${r.personnel.length}:${r.note ?? ''}`)
    .join('|');

  const streamLinesOneByOne = useCallback(
    async (lines: string[], signal: AbortSignal) => {
      for (const line of lines) {
        await sleep(LINE_DELAY_MS, signal);
        setStreamLines((prev) => [...prev, line]);
      }
    },
    []
  );

  const runBatch = useCallback(async () => {
    const batchRegions = regionsRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamLines([]);
    setStatus('streaming');
    setResults({});

    if (!enabled || batchRegions.length === 0) {
      setStatus('idle');
      return;
    }

    const nextResults: Record<string | number, RegionMatchResult> = {};

    try {
      await streamLinesOneByOne(
        buildMatchStreamIntroLines(batchRegions.length, urgencyLevel, sceneLabel),
        controller.signal
      );

      for (let i = 0; i < batchRegions.length; i++) {
        const region = batchRegions[i];
        const scenarioId = businessScenario
          ? scenarioFromBusinessName(businessScenario)
          : scenarioFromDispatchKind(dispatchKind);
        const ticket = buildDispatchTicket({
          scenarioId,
          title,
          territoryKey: region.regionName,
          note: region.note,
          urgencyLevel,
          requiredSkillTags: SKILL_VOCAB[scenarioId],
          ticketId: `${dispatchKind}-${region.regionId}`,
        });

        const preLines = buildMatchStreamPreLines(
          {
            index: i + 1,
            total: batchRegions.length,
            regionName: region.regionName,
            indicatorLabel,
            urgencyLevel,
            personnelCount: region.personnel.length,
          },
          ticket
        );
        await streamLinesOneByOne(preLines, controller.signal);

        const staffPool = provincePersonnelToStaffPool(region.personnel);
        const res = await fetch('/api/dispatch-agent/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket, staff_pool: staffPool }),
          signal: controller.signal,
        });
        const json = await res.json();

        if (!json.success) {
          await streamLinesOneByOne([`  ✗ 匹配失败：${region.regionName}`, '—'], controller.signal);
          nextResults[region.regionId] = { assignee: null, reason: '', basis: null, ready: true };
          continue;
        }

        const basis = json.data as MatchingBasis;
        const assignee = resolvePersonnelByStaffId(basis.final_assignee, region.personnel);
        const reason = formatMatchReason(basis);
        nextResults[region.regionId] = { assignee, reason, basis, ready: true };

        const postLines = buildMatchStreamPostLines(
          {
            index: i + 1,
            total: batchRegions.length,
            regionName: region.regionName,
            indicatorLabel,
            urgencyLevel,
            personnelCount: region.personnel.length,
          },
          basis,
          assignee
        );
        await streamLinesOneByOne(postLines, controller.signal);
        setResults({ ...nextResults });

        await sleep(REGION_GAP_MS, controller.signal);
      }

      const summaryLines = batchRegions.map((region) => {
        const assignee = nextResults[region.regionId]?.assignee;
        const name = assignee?.name ?? '待分配';
        return `  · 派发区域：${region.regionName} · ${name}`;
      });
      await streamLinesOneByOne(summaryLines, controller.signal);

      setResults(nextResults);
      setStatus('done');
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.error('人员匹配流式分析失败:', e);
      setStatus('done');
    }
  }, [dispatchKind, enabled, indicatorLabel, sceneLabel, streamLinesOneByOne, title, urgencyLevel, businessScenario]);

  const runBatchRef = useRef(runBatch);
  runBatchRef.current = runBatch;

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      setStatus('idle');
      return;
    }
    runBatchRef.current();
    return () => abortRef.current?.abort();
  }, [enabled, title, urgencyLevel, regionsKey, dispatchKind, indicatorLabel, businessScenario]);

  return {
    streamLines,
    isStreaming: status === 'streaming',
    isDone: status === 'done',
    results,
  };
}
