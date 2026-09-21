import type { DispatchTicket, ScenarioId } from './types';

export interface DispatchMatchContext {
  scenarioId: ScenarioId;
  title: string;
  territoryKey: string;
  urgencyLevel?: string;
  note?: string;
  requiredSkillTags?: string[];
  ticketId?: string;
}

/** 业务场景中文名 → 场景ID（本项目四大业务模块） */
export function scenarioFromBusinessName(
  businessScenario?: string | null
): ScenarioId {
  const name = businessScenario ?? '';
  if (name.includes('流量')) return 'traffic_ops';
  if (name.includes('离网') || name.includes('维系')) return 'churn_retention';
  if (name.includes('家庭')) return 'home_convergence';
  if (name.includes('中高端') || name.includes('全球通')) return 'high_value_retention';
  if (name.includes('国际')) return 'international';
  return 'high_value_retention';
}

/** 场景 → 工单客户等级取值（与 mockData.CUSTOMER_TIER_MAPPING 对齐） */
export function customerTierFromScenario(scenarioId: ScenarioId): string {
  switch (scenarioId) {
    case 'traffic_ops':
      return '高ARPU(≥150元)';
    case 'churn_retention':
      return '离网高风险';
    case 'home_convergence':
      return '家庭高ARPU(≥300元)';
    case 'high_value_retention':
      return '全球通金卡';
    case 'international':
      return '高消费出境客户';
    default:
      return '全球通金卡';
  }
}

export function buildDispatchTicket(ctx: DispatchMatchContext): DispatchTicket {
  const urgency =
    ctx.urgencyLevel === '紧急' ? 0.95 : ctx.urgencyLevel === '重要' ? 0.75 : 0.55;

  return {
    ticket_id: ctx.ticketId ?? `dispatch-${ctx.territoryKey}-${Date.now()}`,
    scenario_id: ctx.scenarioId,
    opportunity_value_score: 0.7,
    customer_tier_value: customerTierFromScenario(ctx.scenarioId),
    urgency_score: urgency,
    override_hit_field: null,
    wait_minutes: 30,
    territory_key: ctx.territoryKey,
    required_skill_tags: ctx.requiredSkillTags ?? [],
    note: ctx.note || ctx.title,
  };
}

export function scenarioFromDispatchKind(
  kind: 'indicator' | 'customer-group' | 'strategy'
): ScenarioId {
  if (kind === 'indicator') return 'high_value_retention';
  if (kind === 'customer-group') return 'high_value_retention';
  return 'high_value_retention';
}
