// 照搬 AI Demo/mock_data_ranking_matching.py 的数据，字段取值与原文件保持一致。
// 分发给其他人验证Agent方案时，只改这个文件里的数据，不需要改动 rankingAgent.ts / matchingAgent.ts。
import type {
  DispatchTicket,
  MatchingCard,
  RankingCard,
  ScenarioId,
  StaffCandidate,
} from './types';

export const CUSTOMER_TIER_MAPPING: Record<ScenarioId, Record<string, number>> = {
  traffic_ops: { '高ARPU(≥150元)': 1.0, '中ARPU(80-150元)': 0.6, '低ARPU(<80元)': 0.3 },
  churn_retention: { 离网高风险: 1.0, 离网中风险: 0.6, 离网低风险: 0.3 },
  home_convergence: {
    '家庭高ARPU(≥300元)': 1.0,
    '家庭中ARPU(150-300元)': 0.6,
    '家庭低ARPU(<150元)': 0.3,
  },
  high_value_retention: {
    全球通钻石卡: 1.0,
    全球通白金卡: 0.8,
    全球通金卡: 0.6,
    全球通银卡: 0.4,
    全球通普通卡: 0.2,
  },
  international: { 高消费出境客户: 1.0, 中消费出境客户: 0.6, 低消费出境客户: 0.3 },
};

export const SKILL_VOCAB: Record<ScenarioId, string[]> = {
  traffic_ops: ['讲解', '外呼', '装维'],
  churn_retention: ['挽留话术', '合约续约', '价格谈判'],
  home_convergence: ['融合套餐讲解', '智家产品安装', '装维随销'],
  high_value_retention: ['一对一服务', '高端权益讲解', '投诉处理'],
  international: ['多语言服务', '国际漫游讲解', '紧急支援'],
};

export const RANKING_CARDS: Record<ScenarioId, RankingCard> = {
  traffic_ops: {
    scenario_name: '流量运营',
    dimension_weights: { opportunity_value: 0.4, customer_tier: 0.5, urgency: 0.1 },
    urgent_override_rules: [],
    sla_escalation: { threshold_minutes: 5, action: '升级提醒责任人' },
  },
  churn_retention: {
    scenario_name: '离网维系',
    dimension_weights: { opportunity_value: 0.15, customer_tier: 0.25, urgency: 0.6 },
    urgent_override_rules: [
      {
        condition_field: '携转风险等级',
        condition_value: '高',
        description: '携转高风险客户直接置顶，不参与权重计算',
      },
    ],
    sla_escalation: { threshold_minutes: 1440, action: '插队置顶' },
  },
  home_convergence: {
    scenario_name: '家庭融合运营',
    dimension_weights: { opportunity_value: 0.35, customer_tier: 0.45, urgency: 0.2 },
    urgent_override_rules: [],
    sla_escalation: { threshold_minutes: 10, action: '升级提醒责任人' },
  },
  high_value_retention: {
    scenario_name: '中高端保有',
    dimension_weights: { opportunity_value: 0.25, customer_tier: 0.55, urgency: 0.2 },
    urgent_override_rules: [
      { condition_field: '携转查询', condition_value: '是', description: '携转查询客户直接置顶' },
    ],
    sla_escalation: { threshold_minutes: 1440, action: '插队置顶' },
  },
  international: {
    scenario_name: '国际市场',
    dimension_weights: { opportunity_value: 0.25, customer_tier: 0.15, urgency: 0.6 },
    urgent_override_rules: [
      {
        condition_field: '出境触发',
        condition_value: '是',
        description: '出境触发客户直接置顶，要求秒级响应',
      },
    ],
    sla_escalation: { threshold_minutes: 1, action: '插队置顶' },
  },
};

export const MATCHING_CARDS: Record<ScenarioId, MatchingCard> = {
  traffic_ops: {
    territory_type: 'grid',
    fallback_when_empty: 'escalate_to_upper_grid',
    skill_weight: 0.3,
    performance_weight: 0.7,
    gray_zone_epsilon: 0.05,
  },
  churn_retention: {
    territory_type: 'grid',
    fallback_when_empty: 'escalate_to_upper_grid',
    skill_weight: 0.45,
    performance_weight: 0.55,
    gray_zone_epsilon: 0.15,
  },
  home_convergence: {
    territory_type: 'grid',
    fallback_when_empty: 'escalate_to_upper_grid',
    skill_weight: 0.3,
    performance_weight: 0.7,
    gray_zone_epsilon: 0.05,
  },
  high_value_retention: {
    territory_type: 'customer_owner',
    fallback_when_empty: 'escalate_to_upper_grid',
    skill_weight: 0.45,
    performance_weight: 0.55,
    gray_zone_epsilon: 0.2,
  },
  international: {
    territory_type: 'service_point',
    fallback_when_empty: 'route_to_online_channel',
    skill_weight: 0.4,
    performance_weight: 0.6,
    gray_zone_epsilon: 0.1,
  },
};

// scenario_id -> territory_key -> 候选人列表
export const STAFF_POOL: Record<ScenarioId, Record<string, StaffCandidate[]>> = {
  traffic_ops: {
    网格A: [
      {
        staff_id: '张敏',
        skill_tags: ['讲解', '外呼'],
        performance_score: 0.82,
        remark: '沟通能力强，外呼转化率长期排名网格前列，客户反馈良好。',
      },
      {
        staff_id: '刘洋',
        skill_tags: ['装维', '讲解'],
        performance_score: 0.8,
        remark: '现场装维经验丰富，讲解流量套餐时擅长结合实际使用场景举例说明。',
      },
    ],
    网格B: [
      {
        staff_id: '王芳',
        skill_tags: ['外呼'],
        performance_score: 0.75,
        remark: '外呼节奏稳定，是网格B唯一固定坐席。',
      },
    ],
  },
  churn_retention: {
    网格C: [
      {
        staff_id: '陈丽',
        skill_tags: ['挽留话术', '合约续约'],
        performance_score: 0.88,
        remark: '挽留话术经验丰富，近三个月携转挽回率全网格最高。',
      },
      {
        staff_id: '高鹏',
        skill_tags: ['合约续约'],
        performance_score: 0.6,
        remark: '合约续约办理熟练，挽留话术经验较少，多为流程性沟通。',
      },
    ],
    网格D: [], // 故意留空，演示责任田池为空走fallback
  },
  home_convergence: {
    网格E: [
      {
        staff_id: '孙婷',
        skill_tags: ['融合套餐讲解', '智家产品安装'],
        performance_score: 0.78,
        remark: '融合套餐讲解条理清晰，安装类业务客户满意度高。',
      },
      {
        staff_id: '周伟',
        skill_tags: ['装维随销', '融合套餐讲解'],
        performance_score: 0.79,
        remark: '装维随销经验丰富，融合套餐讲解能力与孙婷接近，近期表现稳定。',
      },
    ],
  },
  high_value_retention: {
    'customer_owner:陈总': [
      {
        staff_id: '赵敏',
        skill_tags: ['一对一服务', '高端权益讲解'],
        performance_score: 0.9,
        remark: '陈总专属客户经理，长期一对一服务，客户关系稳固。',
      },
    ],
    'customer_owner:陈总_backup': [
      {
        staff_id: '主管A',
        skill_tags: ['一对一服务', '高端权益讲解'],
        performance_score: 0.7,
        remark: '可代理专属客户经理职责，对高端权益讲解较为熟练。',
      },
      {
        staff_id: '主管B',
        skill_tags: ['一对一服务', '投诉处理'],
        performance_score: 0.75,
        remark: '擅长投诉处理，近期协助过多起专属客户经理请假期间的代理服务。',
      },
    ],
  },
  international: {
    机场柜台: [
      {
        staff_id: 'Lina',
        skill_tags: ['多语言服务', '国际漫游讲解'],
        performance_score: 0.85,
        remark: '多语言服务能力突出，国际漫游讲解经验丰富，出境高峰期主力坐席。',
      },
      {
        staff_id: '刘亮',
        skill_tags: ['国际漫游讲解'],
        performance_score: 0.65,
        remark: '国际漫游讲解熟练，多语言能力一般，主要支援普通话客户。',
      },
    ],
    留学生公寓: [], // 故意留空，演示责任田常年退化为线上渠道fallback
  },
};

// 10条工单覆盖五条业务线及机制设计的每条关键分支：
//   强制插队命中            T03 / T07 / T08
//   SLA熔断命中（非插队）   T10
//   责任田=唯一责任人直派    T02 / T06
//   责任田池为空走fallback   T04 / T08
//   规则直派（打分差距明显） T03 / T09
//   灰色地带触发LLM裁决      T01 / T05 / T07
export const TICKETS: DispatchTicket[] = [
  {
    ticket_id: 'T01',
    scenario_id: 'traffic_ops',
    opportunity_value_score: 0.7,
    customer_tier_value: '中ARPU(80-150元)',
    urgency_score: 0.2,
    override_hit_field: null,
    wait_minutes: 2,
    territory_key: '网格A',
    required_skill_tags: ['讲解'],
    note: '灰色地带触发LLM裁决（张敏/刘洋综合分接近）',
  },
  {
    ticket_id: 'T02',
    scenario_id: 'traffic_ops',
    opportunity_value_score: 0.5,
    customer_tier_value: '低ARPU(<80元)',
    urgency_score: 0.15,
    override_hit_field: null,
    wait_minutes: 1,
    territory_key: '网格B',
    required_skill_tags: ['外呼'],
    note: '责任田唯一责任人直派',
  },
  {
    ticket_id: 'T03',
    scenario_id: 'churn_retention',
    opportunity_value_score: 0.6,
    customer_tier_value: '离网高风险',
    urgency_score: 0.95,
    override_hit_field: '携转风险等级',
    wait_minutes: 5,
    territory_key: '网格C',
    required_skill_tags: ['挽留话术', '合约续约'],
    note: '强制插队命中 + 规则直派（陈丽优势明显）',
  },
  {
    ticket_id: 'T04',
    scenario_id: 'churn_retention',
    opportunity_value_score: 0.4,
    customer_tier_value: '离网中风险',
    urgency_score: 0.5,
    override_hit_field: null,
    wait_minutes: 30,
    territory_key: '网格D',
    required_skill_tags: ['挽留话术'],
    note: '责任田池为空，走fallback升级到上级网格',
  },
  {
    ticket_id: 'T05',
    scenario_id: 'home_convergence',
    opportunity_value_score: 0.65,
    customer_tier_value: '家庭中ARPU(150-300元)',
    urgency_score: 0.3,
    override_hit_field: null,
    wait_minutes: 3,
    territory_key: '网格E',
    required_skill_tags: ['融合套餐讲解'],
    note: '灰色地带触发LLM裁决（孙婷/周伟综合分接近）',
  },
  {
    ticket_id: 'T06',
    scenario_id: 'high_value_retention',
    opportunity_value_score: 0.8,
    customer_tier_value: '全球通钻石卡',
    urgency_score: 0.4,
    override_hit_field: null,
    wait_minutes: 10,
    territory_key: 'customer_owner:陈总',
    required_skill_tags: ['一对一服务'],
    note: '一对一专属客户经理唯一直派',
  },
  {
    ticket_id: 'T07',
    scenario_id: 'high_value_retention',
    opportunity_value_score: 0.75,
    customer_tier_value: '全球通白金卡',
    urgency_score: 0.85,
    override_hit_field: '携转查询',
    wait_minutes: 20,
    territory_key: 'customer_owner:陈总_backup',
    required_skill_tags: ['一对一服务'],
    note: '强制插队命中 + 专属客户经理请假兜底场景触发LLM裁决',
  },
  {
    ticket_id: 'T08',
    scenario_id: 'international',
    opportunity_value_score: 0.9,
    customer_tier_value: '高消费出境客户',
    urgency_score: 0.98,
    override_hit_field: '出境触发',
    wait_minutes: 0,
    territory_key: '留学生公寓',
    required_skill_tags: ['多语言服务'],
    note: '出境触发强制插队 + 责任田池为空走线上渠道fallback',
  },
  {
    ticket_id: 'T09',
    scenario_id: 'international',
    opportunity_value_score: 0.55,
    customer_tier_value: '中消费出境客户',
    urgency_score: 0.5,
    override_hit_field: null,
    wait_minutes: 1,
    territory_key: '机场柜台',
    required_skill_tags: ['多语言服务', '国际漫游讲解'],
    note: '规则直派（Lina优势明显）',
  },
  {
    ticket_id: 'T10',
    scenario_id: 'traffic_ops',
    opportunity_value_score: 0.3,
    customer_tier_value: '低ARPU(<80元)',
    urgency_score: 0.25,
    override_hit_field: null,
    wait_minutes: 8,
    territory_key: '网格B',
    required_skill_tags: ['外呼'],
    note: '未命中强制插队，但等待超过SLA熔断阈值（5分钟）',
  },
];
