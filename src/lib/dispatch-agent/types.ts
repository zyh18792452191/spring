// 对应《参考2.AI调度方案-工单排序与人员匹配(总分版).md》2.6节输出结构

export type ScenarioId =
  | 'traffic_ops'
  | 'churn_retention'
  | 'home_convergence'
  | 'high_value_retention'
  | 'international';

export interface UrgentOverrideRule {
  condition_field: string;
  condition_value: string;
  description: string;
}

export interface SlaEscalation {
  threshold_minutes: number;
  action: '插队置顶' | '上调一级' | '升级提醒责任人';
}

export interface RankingCard {
  scenario_name: string;
  dimension_weights: {
    opportunity_value: number;
    customer_tier: number;
    urgency: number;
  };
  urgent_override_rules: UrgentOverrideRule[];
  sla_escalation: SlaEscalation;
}

export type TerritoryType = 'grid' | 'customer_owner' | 'service_point';

export type FallbackWhenEmpty =
  | 'escalate_to_upper_grid'
  | 'route_to_online_channel'
  | 'no_owner_required';

export interface MatchingCard {
  territory_type: TerritoryType;
  fallback_when_empty: FallbackWhenEmpty;
  skill_weight: number;
  performance_weight: number;
  gray_zone_epsilon: number;
}

export interface StaffCandidate {
  staff_id: string;
  skill_tags: string[];
  performance_score: number;
  remark: string; // 评语原文，灰色地带LLM裁决要引用
}

export interface DispatchTicket {
  ticket_id: string;
  scenario_id: ScenarioId;
  opportunity_value_score: number;
  customer_tier_value: string;
  urgency_score: number;
  override_hit_field: string | null;
  wait_minutes: number;
  territory_key: string;
  required_skill_tags: string[];
  note: string;
}

export interface RankingBasis {
  opportunity_value_score: number;
  customer_tier_score: number;
  urgency_score: number;
  final_priority_score: number;
  urgent_override_hit: boolean;
  override_reason: string | null;
  sla_action: string | null;
}

export interface RankedTicket extends DispatchTicket {
  ranking_basis: RankingBasis;
}

export interface CandidateScore {
  staff_id: string;
  skill_match_score: number;
  performance_score: number;
  combined_score: number;
  remark: string;
}

export type TerritoryResult = 'pool_found' | 'pool_empty_fallback' | 'single_owner';

export type DecisionType = 'rule_direct' | 'single_owner_direct' | 'llm_arbitration' | null;

export interface RuleMatchResult {
  territory_result: TerritoryResult;
  candidate_scores: CandidateScore[];
  decision_type: DecisionType;
  gray_zone_triggered: boolean;
  score_gap: number | null;
  fallback_action: FallbackWhenEmpty | null;
}

export type HumanDecision = '未到confirm环节' | '已采纳' | '已改派' | '升级处理';

export interface MatchingBasis extends RuleMatchResult {
  llm_reason: string | null;
  judge_pass: boolean | null;
  fallback_applied: boolean;
  fallback_issue?: string;
  confirm_required: boolean;
  human_decision: HumanDecision;
  override_reason: string | null;
  final_assignee: string | null;
}

export interface ArbitrationResult {
  llm_reason: string | null;
  judge_pass: boolean | null;
  fallback_applied: boolean;
  issue: string;
  selected_staff_id: string | null;
}
