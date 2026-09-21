// 移植自 AI Demo/demo_ranking_matching.py 的 compute_skill_match_score / score_pool / rule_match
// （Agent 2：人员匹配Agent，责任田定界+池内打分+灰色地带判断部分，纯规则）
import { MATCHING_CARDS, STAFF_POOL } from './mockData';
import type { CandidateScore, DispatchTicket, MatchingCard, RuleMatchResult, StaffCandidate } from './types';

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function computeSkillMatchScore(staff: StaffCandidate, requiredTags: string[]): number {
  if (requiredTags.length === 0) return 1.0;
  const overlap = staff.skill_tags.filter((tag) => requiredTags.includes(tag)).length;
  return round3(overlap / requiredTags.length);
}

export function scorePool(
  ticket: DispatchTicket,
  pool: StaffCandidate[],
  card: MatchingCard
): CandidateScore[] {
  const required = ticket.required_skill_tags;
  const scored: CandidateScore[] = pool.map((s) => {
    const skillScore = computeSkillMatchScore(s, required);
    const combined = round4(card.skill_weight * skillScore + card.performance_weight * s.performance_score);
    return {
      staff_id: s.staff_id,
      skill_match_score: skillScore,
      performance_score: s.performance_score,
      combined_score: combined,
      remark: s.remark,
    };
  });
  scored.sort((a, b) => b.combined_score - a.combined_score);
  return scored;
}

// 责任田定界 + 池内打分 + 灰色地带判断（运转逻辑步骤2-4，对应文档2.5）
export function ruleMatch(ticket: DispatchTicket): RuleMatchResult {
  const card = MATCHING_CARDS[ticket.scenario_id];
  const territoryKey = ticket.territory_key;
  const pool = STAFF_POOL[ticket.scenario_id]?.[territoryKey] ?? [];

  if (pool.length === 0) {
    return {
      territory_result: 'pool_empty_fallback',
      candidate_scores: [],
      decision_type: null,
      gray_zone_triggered: false,
      score_gap: null,
      fallback_action: card.fallback_when_empty,
    };
  }

  if (pool.length === 1) {
    const scored = scorePool(ticket, pool, card);
    return {
      territory_result: 'single_owner',
      candidate_scores: scored,
      decision_type: 'single_owner_direct',
      gray_zone_triggered: false,
      score_gap: null,
      fallback_action: null,
    };
  }

  const scored = scorePool(ticket, pool, card);
  const gap = round4(scored[0].combined_score - scored[1].combined_score);
  const gray = gap < card.gray_zone_epsilon;
  return {
    territory_result: 'pool_found',
    candidate_scores: scored,
    decision_type: gray ? 'llm_arbitration' : 'rule_direct',
    gray_zone_triggered: gray,
    score_gap: gap,
    fallback_action: null,
  };
}

function ruleMatchFromPool(
  ticket: DispatchTicket,
  pool: StaffCandidate[],
  card: MatchingCard
): RuleMatchResult {
  if (pool.length === 0) {
    return {
      territory_result: 'pool_empty_fallback',
      candidate_scores: [],
      decision_type: null,
      gray_zone_triggered: false,
      score_gap: null,
      fallback_action: card.fallback_when_empty,
    };
  }

  if (pool.length === 1) {
    const scored = scorePool(ticket, pool, card);
    return {
      territory_result: 'single_owner',
      candidate_scores: scored,
      decision_type: 'single_owner_direct',
      gray_zone_triggered: false,
      score_gap: null,
      fallback_action: null,
    };
  }

  const scored = scorePool(ticket, pool, card);
  const gap = round4(scored[0].combined_score - scored[1].combined_score);
  const gray = gap < card.gray_zone_epsilon;
  return {
    territory_result: 'pool_found',
    candidate_scores: scored,
    decision_type: gray ? 'llm_arbitration' : 'rule_direct',
    gray_zone_triggered: gray,
    score_gap: gap,
    fallback_action: null,
  };
}

/** 使用外部传入的人员池（调度选人场景） */
export function ruleMatchWithPool(
  ticket: DispatchTicket,
  pool: StaffCandidate[]
): RuleMatchResult {
  const card = MATCHING_CARDS[ticket.scenario_id];
  return ruleMatchFromPool(ticket, pool, card);
}
