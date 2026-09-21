import type { MatchingBasis } from './types';

export interface MatchMethodTag {
  label: string;
  tone: 'blue' | 'orange' | 'gray' | 'purple';
}

/** 展示全部匹配路径标签（责任田 + 决策 + 灰色地带等） */
export function formatMatchMethodTags(basis: MatchingBasis | null): MatchMethodTag[] {
  if (!basis) return [];

  const tags: MatchMethodTag[] = [];

  if (basis.territory_result === 'pool_empty_fallback') {
    tags.push({ label: '责任田为空', tone: 'orange' });
    if (basis.fallback_action === 'escalate_to_upper_grid') {
      tags.push({ label: '升级至上级网格', tone: 'orange' });
    } else if (basis.fallback_action === 'route_to_online_channel') {
      tags.push({ label: '转在线渠道', tone: 'orange' });
    } else if (basis.fallback_action === 'no_owner_required') {
      tags.push({ label: '无需指定负责人', tone: 'gray' });
    }
  } else if (basis.territory_result === 'single_owner') {
    tags.push({ label: '唯一负责人', tone: 'purple' });
  } else if (basis.territory_result === 'pool_found') {
    tags.push({ label: '责任田匹配', tone: 'blue' });
  }

  if (basis.decision_type === 'single_owner_direct') {
    tags.push({ label: '唯一负责人直配', tone: 'purple' });
  } else if (basis.decision_type === 'rule_direct') {
    tags.push({ label: '规则直配', tone: 'blue' });
  } else if (basis.decision_type === 'llm_arbitration') {
    tags.push({ label: 'AI 灰色地带裁决', tone: 'purple' });
  }

  if (basis.gray_zone_triggered) {
    tags.push({ label: '灰色地带', tone: 'orange' });
  }
  if (basis.fallback_applied) {
    tags.push({ label: '裁决降级兜底', tone: 'orange' });
  }
  if (basis.llm_reason && basis.judge_pass) {
    tags.push({ label: 'AI 裁决通过', tone: 'purple' });
  }

  return tags;
}

export function formatMatchReason(basis: MatchingBasis): string {
  if (basis.llm_reason) {
    return basis.llm_reason;
  }

  if (basis.territory_result === 'pool_empty_fallback') {
    return `责任田暂无可用人员，建议升级处理（${basis.fallback_action ?? '待分配'}）`;
  }

  if (basis.territory_result === 'single_owner') {
    const top = basis.candidate_scores[0];
    return top
      ? `责任田唯一负责人，技能匹配 ${top.skill_match_score}，历史效能 ${top.performance_score}`
      : '责任田唯一负责人';
  }

  const top = basis.candidate_scores[0];
  if (!top) {
    return '暂无匹配候选人员';
  }

  if (basis.gray_zone_triggered) {
    return `候选分差 ${basis.score_gap ?? '-'}，AI 推荐 ${top.staff_id}（综合分 ${top.combined_score}）`;
  }

  return `规则直配：${top.staff_id}，技能匹配 ${top.skill_match_score}，历史效能 ${top.performance_score}，综合分 ${top.combined_score}`;
}
