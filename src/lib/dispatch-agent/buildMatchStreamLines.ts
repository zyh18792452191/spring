import { MATCHING_CARDS } from './mockData';
import { formatMatchReason } from './formatMatchReason';
import type { DispatchTicket, MatchingBasis } from './types';
import type { ProvincePersonnelLike } from './personnelAdapter';

export interface MatchStreamContext {
  index: number;
  total: number;
  regionName: string;
  indicatorLabel: string;
  urgencyLevel?: string;
  personnelCount: number;
}

export function buildMatchStreamIntroLines(
  total: number,
  urgencyLevel?: string,
  sceneLabel = '中高端客户保有（指标调度）'
): string[] {
  return [
    '▶ 人员匹配 Agent 启动',
    `  待匹配任务 ${total} 条 · 紧急程度「${urgencyLevel ?? '重要'}」`,
    `  加载场景规则卡：${sceneLabel}`,
    `  匹配维度：责任田定界 → 池内打分 → 灰色地带判断 → 最终指派`,
    '—',
  ];
}

export function buildMatchStreamPreLines(ctx: MatchStreamContext, ticket: DispatchTicket): string[] {
  const card = MATCHING_CARDS[ticket.scenario_id];
  return [
    `[${ctx.index}/${ctx.total}] 解析任务：${ctx.regionName} · ${ctx.indicatorLabel}`,
    `  └ 工单 ID：${ticket.ticket_id}`,
    `  └ 紧急程度映射 urgency_score=${ticket.urgency_score}`,
    `  └ 责任田 key：${ticket.territory_key}`,
    `  └ 加载人员池：${ctx.personnelCount} 人`,
    `  └ 规则权重：技能 ${card.skill_weight} + 历史效能 ${card.performance_weight}，灰色地带阈值 ε=${card.gray_zone_epsilon}`,
  ];
}

export function buildMatchStreamPostLines(
  ctx: MatchStreamContext,
  basis: MatchingBasis,
  assignee: ProvincePersonnelLike | null
): string[] {
  const lines: string[] = [];

  if (basis.territory_result === 'pool_empty_fallback') {
    lines.push(`  └ 责任田定界：人员池为空 → 触发兜底「${basis.fallback_action}」`);
  } else if (basis.territory_result === 'single_owner') {
    lines.push('  └ 责任田定界：唯一负责人 → 跳过池内竞争');
    lines.push('  └ 决策路径：唯一负责人直配');
  } else if (basis.territory_result === 'pool_found') {
    lines.push(`  └ 责任田定界：池内 ${basis.candidate_scores.length} 人参与打分`);
    if (basis.candidate_scores.length >= 2) {
      const top = basis.candidate_scores[0];
      const second = basis.candidate_scores[1];
      lines.push(
        `  └ Top1 ${top.staff_id} 综合分 ${top.combined_score} vs Top2 ${second.staff_id} ${second.combined_score}，分差 ${basis.score_gap}`
      );
    }
    if (basis.gray_zone_triggered) {
      lines.push('  └ 灰色地带：分差低于阈值 → 进入 AI 裁决');
      if (basis.llm_reason) {
        lines.push(`  └ AI 裁决：${basis.llm_reason}`);
      }
      if (basis.fallback_applied) {
        lines.push('  └ 裁决降级：回退规则直配 Top1');
      }
    } else {
      lines.push('  └ 决策路径：规则直配（Top1 显著领先）');
    }
  }

  if (basis.candidate_scores[0]) {
    const top = basis.candidate_scores[0];
    lines.push(
      `  └ 得分明细：技能匹配 ${top.skill_match_score} · 历史效能 ${top.performance_score} · 综合 ${top.combined_score}`
    );
  }

  if (assignee) {
    lines.push(`  ✓ 推荐执行人：${assignee.name}（${assignee.department}）`);
  } else if (basis.final_assignee) {
    lines.push(`  ✓ 系统指派：${basis.final_assignee}`);
  }

  lines.push(`  └ 匹配原因：${formatMatchReason(basis)}`);
  lines.push('—');
  return lines;
}

export function getPrimaryMatchMethodLabel(basis: MatchingBasis): string {
  if (basis.territory_result === 'pool_empty_fallback') {
    if (basis.fallback_action === 'escalate_to_upper_grid') return '升级至上级网格';
    if (basis.fallback_action === 'route_to_online_channel') return '转在线渠道';
    return '责任田为空';
  }
  if (basis.decision_type === 'single_owner_direct') return '唯一负责人直配';
  if (basis.decision_type === 'llm_arbitration') {
    if (basis.fallback_applied) return '裁决降级兜底';
    return 'AI 灰色地带裁决';
  }
  if (basis.decision_type === 'rule_direct') return '规则直配';
  return '责任田匹配';
}
