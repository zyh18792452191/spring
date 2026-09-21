'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DispatchMatchContext, MatchingBasis } from '@/lib/dispatch-agent';
import {
  buildDispatchTicket,
  formatMatchReason,
  provincePersonnelToStaffPool,
  resolvePersonnelByStaffId,
  type ProvincePersonnelLike,
} from '@/lib/dispatch-agent';

export interface PersonnelMatchResult {
  assignee: ProvincePersonnelLike | null;
  reason: string;
  basis: MatchingBasis | null;
  loading: boolean;
}

export function usePersonnelMatch(
  ctx: DispatchMatchContext | null,
  personnel: ProvincePersonnelLike[],
  enabled = true
) {
  const [result, setResult] = useState<PersonnelMatchResult>({
    assignee: null,
    reason: '',
    basis: null,
    loading: false,
  });

  const fetchMatch = useCallback(async () => {
    if (!enabled || !ctx || personnel.length === 0) {
      setResult({ assignee: null, reason: '', basis: null, loading: false });
      return null;
    }

    setResult((prev) => ({ ...prev, loading: true }));
    try {
      const ticket = buildDispatchTicket(ctx);
      const staffPool = provincePersonnelToStaffPool(personnel);
      const res = await fetch('/api/dispatch-agent/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, staff_pool: staffPool }),
      });
      const json = await res.json();
      if (!json.success) {
        setResult({ assignee: null, reason: '', basis: null, loading: false });
        return null;
      }

      const basis = json.data as MatchingBasis;
      const assignee = resolvePersonnelByStaffId(basis.final_assignee, personnel);
      const reason = formatMatchReason(basis);
      const next = { assignee, reason, basis, loading: false };
      setResult(next);
      return next;
    } catch (e) {
      console.error('人员匹配Agent失败:', e);
      setResult({ assignee: null, reason: '', basis: null, loading: false });
      return null;
    }
  }, [ctx, enabled, personnel]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { ...result, refreshMatch: fetchMatch };
}
