import { runGrayZoneArbitration } from './matchArbitration';
import { ruleMatch, ruleMatchWithPool } from './matchingAgent';
import { MATCHING_CARDS } from './mockData';
import type { DispatchTicket, MatchingBasis, StaffCandidate } from './types';

async function finalizeMatch(
  ticket: DispatchTicket,
  basis: ReturnType<typeof ruleMatch>
): Promise<MatchingBasis> {
  if (basis.territory_result === 'pool_empty_fallback') {
    return {
      ...basis,
      llm_reason: null,
      judge_pass: null,
      fallback_applied: false,
      confirm_required: false,
      human_decision: '未到confirm环节',
      override_reason: null,
      final_assignee: `[${basis.fallback_action}]`,
    };
  }

  if (basis.territory_result === 'single_owner') {
    const only = basis.candidate_scores[0].staff_id;
    return {
      ...basis,
      llm_reason: null,
      judge_pass: null,
      fallback_applied: false,
      confirm_required: false,
      human_decision: '未到confirm环节',
      override_reason: null,
      final_assignee: only,
    };
  }

  if (!basis.gray_zone_triggered) {
    const top = basis.candidate_scores[0].staff_id;
    return {
      ...basis,
      llm_reason: null,
      judge_pass: null,
      fallback_applied: false,
      confirm_required: false,
      human_decision: '未到confirm环节',
      override_reason: null,
      final_assignee: top,
    };
  }

  const epsilon = MATCHING_CARDS[ticket.scenario_id].gray_zone_epsilon;
  const arbResult = await runGrayZoneArbitration(ticket, basis.candidate_scores, epsilon);

  if (arbResult.fallback_applied) {
    const top = basis.candidate_scores[0].staff_id;
    return {
      ...basis,
      decision_type: 'rule_direct',
      llm_reason: arbResult.llm_reason,
      judge_pass: arbResult.judge_pass,
      fallback_applied: true,
      fallback_issue: arbResult.issue,
      confirm_required: false,
      human_decision: '未到confirm环节',
      override_reason: null,
      final_assignee: top,
    };
  }

  return {
    ...basis,
    llm_reason: arbResult.llm_reason,
    judge_pass: true,
    fallback_applied: false,
    confirm_required: false,
    human_decision: '未到confirm环节',
    override_reason: null,
    final_assignee: arbResult.selected_staff_id,
  };
}

export async function matchTicket(ticket: DispatchTicket): Promise<MatchingBasis> {
  return finalizeMatch(ticket, ruleMatch(ticket));
}

export async function matchTicketWithPool(
  ticket: DispatchTicket,
  staffPool: StaffCandidate[]
): Promise<MatchingBasis> {
  return finalizeMatch(ticket, ruleMatchWithPool(ticket, staffPool));
}
