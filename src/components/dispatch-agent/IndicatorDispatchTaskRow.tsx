'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatMatchMethodTags } from '@/lib/dispatch-agent/formatMatchReason';
import DispatchAssigneeCell from '@/components/dispatch-agent/DispatchAssigneeCell';
import {
  scenarioFromDispatchKind,
  type DispatchMatchContext,
} from '@/lib/dispatch-agent/buildDispatchTicket';
import type { ProvincePersonnelLike } from '@/lib/dispatch-agent/personnelAdapter';
import { usePersonnelMatch } from '@/hooks/usePersonnelMatch';
import type { RegionMatchResult } from '@/hooks/usePersonnelMatchBatchStream';

interface IndicatorDispatchTaskRowProps {
  index: number;
  region: { id: string | number; name: string };
  personnel: ProvincePersonnelLike[];
  requirement: string;
  title: string;
  urgencyLevel?: string;
  enabled: boolean;
  useBatchMatch?: boolean;
  matchResult?: RegionMatchResult | null;
  matchStreaming?: boolean;
  assigneeOverride?: { id: string; name: string; department: string } | null;
  isManualAssignee?: boolean;
  onChangeAssignee?: () => void;
  onRequirementChange: (value: string) => void;
  onSuggest?: (
    regionId: string | number,
    person: { id: string; name: string; department: string }
  ) => void;
}

export default function IndicatorDispatchTaskRow({
  index,
  region,
  personnel,
  requirement,
  title,
  urgencyLevel,
  enabled,
  useBatchMatch = false,
  matchResult,
  matchStreaming = false,
  assigneeOverride,
  isManualAssignee = false,
  onChangeAssignee,
  onRequirementChange,
  onSuggest,
}: IndicatorDispatchTaskRowProps) {
  const useExternalMatch = useBatchMatch;

  const ctx: DispatchMatchContext | null = useMemo(() => {
    if (!enabled || useExternalMatch) return null;
    return {
      scenarioId: scenarioFromDispatchKind('indicator'),
      title,
      territoryKey: region.name,
      note: requirement,
      urgencyLevel,
      ticketId: `indicator-${region.id}`,
    };
  }, [enabled, region.id, region.name, requirement, title, urgencyLevel, useExternalMatch]);

  const internalMatch = usePersonnelMatch(ctx, personnel, enabled && !useExternalMatch);

  const matchedAssignee = useExternalMatch ? matchResult?.assignee ?? null : internalMatch.assignee;
  const assignee = assigneeOverride ?? matchedAssignee;
  const reason = useExternalMatch ? matchResult?.reason ?? '' : internalMatch.reason;
  const basis = useExternalMatch ? matchResult?.basis ?? null : internalMatch.basis;
  const loading = useExternalMatch
    ? matchStreaming && !matchResult?.ready
    : internalMatch.loading;

  const methodTags = isManualAssignee ? [{ label: '手动指定' }] : formatMatchMethodTags(basis);
  const topScore = basis?.candidate_scores?.[0]?.combined_score;
  const score = isManualAssignee
    ? null
    : topScore ??
      basis?.candidate_scores?.find((c) => c.staff_id === basis.final_assignee)?.combined_score ??
      null;

  const lastSuggestedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!matchedAssignee || !enabled || !onSuggest || loading || isManualAssignee) return;
    if (lastSuggestedIdRef.current === matchedAssignee.id) return;
    lastSuggestedIdRef.current = matchedAssignee.id;
    onSuggest(region.id, {
      id: matchedAssignee.id,
      name: matchedAssignee.name,
      department: matchedAssignee.department,
    });
  }, [enabled, isManualAssignee, loading, matchedAssignee, onSuggest, region.id]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
      <td className="px-3 py-2 text-sm text-gray-900">{region.name}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm text-gray-900">全球通携出规模-pp</div>
            <div className="text-xs text-red-500">环比-0.01%</div>
          </div>
          <ChevronDown className="h-4 w-4 cursor-pointer text-gray-400" />
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-900">
        <DispatchAssigneeCell
          assignee={assignee}
          loading={loading}
          onChangeAssignee={onChangeAssignee}
        />
      </td>
      <td className="px-3 py-2 text-xs text-gray-700">
        {loading ? '—' : methodTags.map((t) => t.label).join('、') || '—'}
      </td>
      <td className="px-3 py-2 text-sm text-gray-900">
        {loading ? '—' : score != null ? score.toFixed(4) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-600">
        {loading ? '—' : isManualAssignee ? '—' : reason || '—'}
      </td>
      <td className="px-3 py-2">
        <Textarea
          placeholder="请输入备注"
          value={requirement}
          onChange={(e) => onRequirementChange(e.target.value)}
          className="min-h-[60px] text-sm"
        />
      </td>
    </tr>
  );
}
