'use client';

import { useEffect, useRef } from 'react';
import { formatMatchMethodTags } from '@/lib/dispatch-agent/formatMatchReason';
import DispatchAssigneeCell from '@/components/dispatch-agent/DispatchAssigneeCell';
import type { RegionMatchResult } from '@/hooks/usePersonnelMatchBatchStream';

export interface StrategyWorkOrder {
  id: number;
  province: string;
  subIndicator: string;
  riskCustomerGroup: string;
  strategy: string;
  recipient?: string;
}

interface StrategyDispatchTaskRowProps {
  index: number;
  order: StrategyWorkOrder;
  matchResult?: RegionMatchResult | null;
  matchStreaming?: boolean;
  assigneeOverride?: { id: string; name: string; department: string } | null;
  isManualAssignee?: boolean;
  onChangeAssignee?: () => void;
  onSuggest?: (
    orderId: number,
    person: { id: string; name: string; department: string }
  ) => void;
}

export default function StrategyDispatchTaskRow({
  index,
  order,
  matchResult,
  matchStreaming = false,
  assigneeOverride,
  isManualAssignee = false,
  onChangeAssignee,
  onSuggest,
}: StrategyDispatchTaskRowProps) {
  const matchedAssignee = matchResult?.assignee ?? null;
  const assignee = assigneeOverride ?? matchedAssignee;
  const reason = matchResult?.reason ?? '';
  const basis = matchResult?.basis ?? null;
  const loading = matchStreaming && !matchResult?.ready;

  const methodTags = isManualAssignee ? [{ label: '手动指定' }] : formatMatchMethodTags(basis);
  const topScore = basis?.candidate_scores?.[0]?.combined_score;
  const score = isManualAssignee
    ? null
    : topScore ??
      basis?.candidate_scores?.find((c) => c.staff_id === basis?.final_assignee)?.combined_score ??
      null;

  const lastSuggestedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!matchedAssignee || !onSuggest || loading || isManualAssignee) return;
    if (lastSuggestedIdRef.current === matchedAssignee.id) return;
    lastSuggestedIdRef.current = matchedAssignee.id;
    onSuggest(order.id, {
      id: matchedAssignee.id,
      name: matchedAssignee.name,
      department: matchedAssignee.department,
    });
  }, [isManualAssignee, loading, matchedAssignee, onSuggest, order.id]);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{order.subIndicator}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{order.riskCustomerGroup}</td>
      <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-900" title={order.strategy}>
        {order.strategy}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{order.province}</td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        <DispatchAssigneeCell
          assignee={assignee}
          loading={loading}
          inline
          onChangeAssignee={onChangeAssignee}
        />
      </td>
      <td className="px-4 py-3 text-xs text-gray-700">
        {loading ? '—' : methodTags.map((t) => t.label).join('、') || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {loading ? '—' : score != null ? score.toFixed(4) : '—'}
      </td>
      <td className="min-w-[320px] px-4 py-3 text-xs leading-relaxed text-gray-600">
        {loading ? '—' : isManualAssignee ? '—' : reason || '—'}
      </td>
    </tr>
  );
}
