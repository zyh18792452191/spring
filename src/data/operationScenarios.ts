// 运营场景指标树数据（stock-view 运营弹窗使用）
// 数据来源说明：
// - 流量运营：完全复用 trafficIndicatorTrees.ts 中的 indicatorTreesMap
// - 中高端/离网/家庭/国际运营：指标清单与各运营页面 Tab 指标一致，指标树为原型演示模拟数据（复用流量树结构改名）
import { IndicatorCardData } from '@/components/IndicatorTree';
import { indicatorTreesMap } from '@/data/trafficIndicatorTrees';

export interface OperationIndicator {
  name: string; // 指标名（Tab 显示）
  tree: IndicatorCardData; // 指标树
}

export interface OperationScenario {
  scenario: string; // 场景名（对应顶部运营菜单）
  indicators: OperationIndicator[];
}

// 基于流量树结构生成模拟指标树（原型演示用）
function createScenarioTree(name: string, id: string): IndicatorCardData {
  const base = indicatorTreesMap['当月流量增幅'];
  const tree = JSON.parse(JSON.stringify(base)) as IndicatorCardData;
  tree.id = id;
  tree.name = name;
  return tree;
}

// ===== 流量运营（复用现有指标树数据） =====
const trafficIndicators: OperationIndicator[] = [
  { name: '当月流量增幅', tree: indicatorTreesMap['当月流量增幅'] },
  { name: '当月流量同比增幅到达值', tree: indicatorTreesMap['当月流量同比增幅到达值'] },
  { name: '当月流量份额', tree: indicatorTreesMap['当月流量份额'] },
  { name: '规模指标', tree: indicatorTreesMap['规模指标'] },
  { name: '当月日均流量', tree: indicatorTreesMap['当月日均流量'] },
];

// ===== 中高端运营 =====
const midHighIndicators: OperationIndicator[] = [
  { name: '拍照中高端客户价值保有率', tree: createScenarioTree('拍照中高端客户价值保有率', 'mid-high-value') },
  { name: '中高端客户规模保有率', tree: createScenarioTree('中高端客户规模保有率', 'mid-high-scale') },
];

// ===== 离网维系 =====
const churnIndicators: OperationIndicator[] = [
  { name: '当月全量离网客户数', tree: createScenarioTree('当月全量离网客户数', 'churn-all') },
  { name: '当月拍照中高端离网客户数', tree: createScenarioTree('当月拍照中高端离网客户数', 'churn-mid-high') },
  { name: '当月拍照全球通离网客户数', tree: createScenarioTree('当月拍照全球通离网客户数', 'churn-global') },
];

// ===== 家庭运营 =====
const familyIndicators: OperationIndicator[] = [
  { name: '家宽到达量', tree: createScenarioTree('家宽到达量', 'family-broadband') },
  { name: '移宽融合率', tree: createScenarioTree('移宽融合率', 'family-fusion') },
];

// ===== 国际运营 =====
const internationalIndicators: OperationIndicator[] = [
  { name: '国漫产品订购量', tree: createScenarioTree('国漫产品订购量', 'intl-product-order') },
  { name: '全球通专属国漫礼包激活量', tree: createScenarioTree('全球通专属国漫礼包激活量', 'intl-gift-activation') },
  { name: '出访客户收入-折后', tree: createScenarioTree('出访客户收入-折后', 'intl-outbound-revenue') },
  { name: '出访客户（含0）', tree: createScenarioTree('出访客户（含0）', 'intl-outbound-customer') },
  { name: '来访客户', tree: createScenarioTree('来访客户', 'intl-inbound-customer') },
  { name: '来访客户收入', tree: createScenarioTree('来访客户收入', 'intl-inbound-revenue') },
];

// 场景清单（顺序与 stock-view 顶部运营菜单一致）
export const operationScenarios: OperationScenario[] = [
  { scenario: '流量运营', indicators: trafficIndicators },
  { scenario: '中高端运营', indicators: midHighIndicators },
  { scenario: '离网维系', indicators: churnIndicators },
  { scenario: '家庭运营', indicators: familyIndicators },
  { scenario: '国际运营', indicators: internationalIndicators },
];

// 按场景名获取指标清单（默认返回流量运营）
export function getScenarioIndicators(scenario: string): OperationIndicator[] {
  const found = operationScenarios.find(s => s.scenario === scenario);
  return found ? found.indicators : trafficIndicators;
}
