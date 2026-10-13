// 话术库：来源于活动执行结果的沉淀，按运营场景分类

export interface SpeechItem {
  id: string;
  scenario: string; // 运营场景
  title: string; // 话术标题
  content: string; // 话术内容
  channel: string; // 适用渠道
  product: string; // 关联产品/方案
  conversionRate: string; // 历史转化率
  source: string; // 沉淀来源（活动名称）
  updatedAt: string; // 更新时间
}

// 运营场景分类（与平台业务场景一致）
export const SPEECH_SCENARIOS = [
  '流量运营',
  '中高端客户运营',
  '离网维系',
  '家庭融合运营',
  '国际业务运营',
  '增量运营',
] as const;

export type SpeechScenario = (typeof SPEECH_SCENARIOS)[number];

// 话术库数据（从活动执行结果沉淀，按运营场景分类）
export const SPEECH_LIBRARY: SpeechItem[] = [
  // 流量运营
  {
    id: 'SP-001',
    scenario: '流量运营',
    title: '升档流量包推荐',
    content: '尊敬的客户，您本月流量使用已接近套餐上限，现在升级至 XX 元档可享 XXGB 大流量 + 视频会员，本月办理额外赠送 XXGB 体验流量，是否为您办理？',
    channel: '短信 / 外呼',
    product: '5G 流量升档包',
    conversionRate: '23.5%',
    source: '乌鲁木齐存量客户升档专项活动',
    updatedAt: '2026-08-20',
  },
  {
    id: 'SP-002',
    scenario: '流量运营',
    title: '流量加餐包提醒',
    content: '您好，检测到您本月流量即将用尽，现有 XX 元加餐包可享 XXGB 流量，当月有效，点击即可快速办理，避免超出产生额外费用。',
    channel: '短信 / 掌厅',
    product: '流量加餐包',
    conversionRate: '18.2%',
    source: '流量达量预警营销活动',
    updatedAt: '2026-08-18',
  },
  // 中高端客户运营
  {
    id: 'SP-003',
    scenario: '中高端客户运营',
    title: '全球通权益升级',
    content: '尊敬的全球通客户，为感谢您长期支持，现可免费升级至全球通 XX 档，享机场贵宾厅、专属客服、话费积分加倍等权益，是否为您升级？',
    channel: '外呼 / 企业微信',
    product: '全球通套餐',
    conversionRate: '31.8%',
    source: '中高端客户权益升级专项',
    updatedAt: '2026-08-15',
  },
  {
    id: 'SP-004',
    scenario: '中高端客户运营',
    title: '家庭共享套餐推荐',
    content: '您好，您的套餐可升级为家庭共享套餐，一张主卡 + 三张副卡共享流量与通话，全家消费更划算，是否为您介绍详情？',
    channel: '外呼',
    product: '家庭共享套餐',
    conversionRate: '27.6%',
    source: '中高端客户家庭融合活动',
    updatedAt: '2026-08-12',
  },
  // 离网维系
  {
    id: 'SP-005',
    scenario: '离网维系',
    title: '离网挽留关怀',
    content: '尊敬的客户，注意到您近期有携号转网意向，我们特别为您准备了专属挽留权益：月费减免 + 流量赠送，真诚希望能继续为您服务。',
    channel: '外呼',
    product: '挽留权益包',
    conversionRate: '42.3%',
    source: '高价值客户离网挽留专项',
    updatedAt: '2026-08-10',
  },
  {
    id: 'SP-006',
    scenario: '离网维系',
    title: '到期续约提醒',
    content: '您好，您的合约即将到期，现在续约可享 XX 元月费直降 + XXGB 流量加赠，锁定优惠更划算，是否为您办理续约？',
    channel: '短信 / 外呼',
    product: '合约续约套餐',
    conversionRate: '35.1%',
    source: '合约到期续约专项活动',
    updatedAt: '2026-08-08',
  },
  // 家庭融合运营
  {
    id: 'SP-007',
    scenario: '家庭融合运营',
    title: '家庭宽带融合',
    content: '您好，您家的宽带可升级为千兆融合套餐，手机 + 宽带 + 电视三合一，月费更省，现在办理还送智能组网服务，是否为您安排？',
    channel: '外呼 / 企业微信',
    product: '千兆融合套餐',
    conversionRate: '29.4%',
    source: '家庭宽带融合升档专项',
    updatedAt: '2026-08-06',
  },
  {
    id: 'SP-008',
    scenario: '家庭融合运营',
    title: '宽带到期续费',
    content: '尊敬的客户，您家宽带即将到期，现在续费可享 XX 折优惠 + 免费提速至 XX M，续费即享，是否为您办理？',
    channel: '短信 / 外呼',
    product: '宽带续费套餐',
    conversionRate: '33.7%',
    source: '宽带到期续费提醒活动',
    updatedAt: '2026-08-04',
  },
  // 国际业务运营
  {
    id: 'SP-009',
    scenario: '国际业务运营',
    title: '国际漫游推荐',
    content: '您好，检测到您近期有出境需求，现可开通国际漫游包，XX 元/天畅享多国流量，落地即用，是否为您开通？',
    channel: '短信 / 掌厅',
    product: '国际漫游包',
    conversionRate: '21.9%',
    source: '出境用户国际漫游专项',
    updatedAt: '2026-08-02',
  },
  {
    id: 'SP-010',
    scenario: '国际业务运营',
    title: '国际长途优惠',
    content: '尊敬的客户，您经常拨打国际长途，现在办理国际长途优惠包可享低至 XX 元/分钟，是否为您介绍？',
    channel: '外呼',
    product: '国际长途优惠包',
    conversionRate: '17.3%',
    source: '国际长途优惠推广活动',
    updatedAt: '2026-07-30',
  },
  // 增量运营
  {
    id: 'SP-011',
    scenario: '增量运营',
    title: '新入网客户权益',
    content: '欢迎入网！现在办理 XX 套餐可享首月 XX 元优惠 + 视频会员 3 个月 + XXGB 流量，限时福利，是否为您办理？',
    channel: '短信 / 外呼',
    product: '新入网套餐',
    conversionRate: '25.6%',
    source: '新入网客户权益专项',
    updatedAt: '2026-07-28',
  },
  {
    id: 'SP-012',
    scenario: '增量运营',
    title: '副卡加装推荐',
    content: '您好，您的主卡可加装副卡，家人共享套餐流量与通话，副卡月费低至 XX 元，是否为您办理？',
    channel: '短信 / 掌厅',
    product: '副卡加装',
    conversionRate: '19.8%',
    source: '存量客户副卡加装活动',
    updatedAt: '2026-07-26',
  },
];

// AI 推荐话术模板（按场景生成，原型阶段基于规则 + 模板模拟）
export const AI_SPEECH_TEMPLATES: Record<string, string[]> = {
  流量运营: [
    '您好，本月您已使用 XXGB 流量，推荐升级至 XX 元大流量套餐，享 XXGB 高速流量 + 视频会员，本月办理加赠 XXGB，是否为您办理？',
    '检测到您流量需求持续增长，现有 XX 元档套餐可享 XXGB，性价比更高，一键升级即可生效，需要为您办理吗？',
  ],
  中高端客户运营: [
    '尊敬的全球通客户，为回馈您，现可免费升级权益，享专属客服、机场贵宾厅、积分加倍，是否为您升级？',
    '您好，推荐您升级家庭共享套餐，全家共享流量通话更划算，是否为您介绍详情？',
  ],
  离网维系: [
    '尊敬的客户，我们为您准备了专属挽留权益：月费减免 + 流量赠送，真诚希望继续为您服务。',
    '您好，您的合约即将到期，现在续约可享月费直降 + 流量加赠，是否为您办理？',
  ],
  家庭融合运营: [
    '您好，您家宽带可升级千兆融合套餐，手机宽带电视三合一更省钱，现在办理送智能组网，是否为您安排？',
    '尊敬的客户，宽带到期续费可享折扣 + 免费提速，续费即享，是否为您办理？',
  ],
  国际业务运营: [
    '您好，检测到您有出境需求，可开通国际漫游包，XX 元/天畅享多国流量，是否为您开通？',
    '您常拨打国际长途，办理国际长途优惠包可享低至 XX 元/分钟，是否为您介绍？',
  ],
  增量运营: [
    '欢迎入网！办理 XX 套餐享首月优惠 + 视频会员 + XXGB 流量，是否为您办理？',
    '您好，您的主卡可加装副卡，家人共享套餐更划算，是否为您办理？',
  ],
};
