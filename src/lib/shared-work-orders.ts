/**
 * 共享工单数据模块
 * 工作台首页和工单处理页共用
 */

export type SharedWorkOrderType = 'indicator' | 'strategy' | 'customer-group' | 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault' | 'alert-dispatch' | 'retention-task' | 'alert-approval';

export interface SharedWorkOrder {
  id: string;
  title: string;
  type: SharedWorkOrderType;
  businessType: string;
  status: string;
  createTime: string;
  statusText: string;
  area: string;
  currentStep?: string;
  executionMode?: string;
}

// 调度类型的工单模板
const workOrderTemplates: Record<SharedWorkOrderType, { titles: string[]; businessType: string; prefix: string; label: string }> = {
  indicator: {
    titles: ['一降到底改善指标调度', '中高端客户保有率指标调度', '拍照中高端升档增收指标调度', '5G套包升档指标调度', '全球通保有率改善指标调度', '客户流失预警指标调度', '离网客户价值保有率指标调度'],
    businessType: '管理类/指标调度',
    prefix: 'IND',
    label: '指标调度'
  },
  strategy: {
    titles: ['异网主卡客户迎回策略执行', '零融合客户融合推广策略', '高价值客户维系策略执行', '离网预警客户挽留策略', '中高端客户升档策略执行'],
    businessType: '生产类/策略调度',
    prefix: 'STR',
    label: '策略调度'
  },
  'customer-group': {
    titles: ['高价值离网客群维系调度', '异网主卡客群营销调度', '低流量客群激活调度', '零融合客群转化调度', '中高端客群保有调度'],
    businessType: '生产类/客群调度',
    prefix: 'GRP',
    label: '客群调度'
  },
  'customer-opportunity-dispatch': {
    titles: ['流量达量预警客户调度', '5G终端低迁转客户调度', '高DOU低套餐客户调度', '地板价高流量客户调度', '离网预警客户调度', '中高端携转风险客户调度'],
    businessType: '生产类/客户商机调度',
    prefix: 'COD',
    label: '客户商机调度'
  },
  'group-opportunity-dispatch': {
    titles: ['高价值离网客群调度', '5G终端低迁转客群调度', '流量达量预警客群调度', '中高端携转风险客群调度', '零融合客群调度', '家庭宽带潜客群调度'],
    businessType: '生产类/客群商机调度',
    prefix: 'GOD',
    label: '客群商机调度'
  },
  'region-assault': {
    titles: ['天山区流量攻坚调度', '沙依巴克区5G迁转攻坚调度'],
    businessType: '生产类/区域攻坚调度',
    prefix: 'RAS',
    label: '区域攻坚调度'
  },
  'alert-dispatch': {
    titles: ['携转预警调度', '宽带离网预警调度', '全球通离网预警调度', '异动客户预警调度'],
    businessType: '生产类/预警调度',
    prefix: 'WRN',
    label: '预警调度'
  },
  'retention-task': {
    titles: ['保有维系任务调度', '降档挽回任务调度', '离网预警保有任务调度'],
    businessType: '生产类/保有任务调度',
    prefix: 'RET',
    label: '保有任务调度'
  },
  'alert-approval': {
    titles: ['携转预警规则审批', '宽带离网预警规则审批', '全球通离网预警规则审批'],
    businessType: '生产类/预警规则审批',
    prefix: 'WRA',
    label: '预警规则审批'
  }
};

/** 本系统执行的调度类型（指标调度在本系统处理，保有任务在IOP处理，剧本营销需发起人在待办中配置） */
export const LOCAL_EXECUTION_TYPES: SharedWorkOrderType[] = ['indicator', 'retention-task'];

/** 剧本营销待办工单——策略调度/客群调度选"剧本营销"派发后，审批通过给发起人生成的待办 */
export const SCRIPT_MARKETING_PENDING_ORDERS: SharedWorkOrder[] = [
  {
    id: 'STR-SM-0001',
    title: '全球通客户规模保有率未达标-剧本营销',
    type: 'strategy',
    businessType: '生产类/策略调度',
    status: 'pending',
    createTime: '2024-06-15 09:30',
    statusText: '进行中',
    area: '3个客群 · 12,500户',
    currentStep: '剧本营销配置',
    executionMode: '剧本营销',
  },
  {
    id: 'STR-SM-0002',
    title: '当月低频高额超套客户占比未达标-剧本营销',
    type: 'strategy',
    businessType: '生产类/策略调度',
    status: 'pending',
    createTime: '2024-06-14 14:20',
    statusText: '进行中',
    area: '2个客群 · 8,300户',
    currentStep: '剧本营销配置',
    executionMode: '剧本营销',
  },
  {
    id: 'GRP-SM-0001',
    title: '高价值离网客群维系调度-剧本营销',
    type: 'customer-group',
    businessType: '生产类/客群调度',
    status: 'pending',
    createTime: '2024-06-15 10:45',
    statusText: '进行中',
    area: '5个标签 · 3个区域 · 6,200户',
    currentStep: '剧本营销配置',
    executionMode: '剧本营销',
  },
];

/** 需要本系统审批的调度类型 */
export const LOCAL_APPROVAL_TYPES: SharedWorkOrderType[] = ['retention-task', 'alert-approval'];

/** 生成模拟工单数据 */
export function generateSharedWorkOrders(count: number, type: 'initiated' | 'pending' | 'completed'): SharedWorkOrder[] {
  const workOrders: SharedWorkOrder[] = [];
  // 待处理只生成本系统执行的类型（指标调度），我发起的/已完成生成全部6种
  const types: SharedWorkOrderType[] = type === 'pending'
    ? LOCAL_EXECUTION_TYPES
    : ['indicator', 'strategy', 'customer-group', 'customer-opportunity-dispatch', 'group-opportunity-dispatch', 'region-assault'];

  const statusList = type === 'initiated' ? ['timeout', 'pending', 'completed'] :
                    type === 'pending' ? ['pending'] :
                    ['completed'];

  const statusTextList = type === 'initiated' ? ['已超时', '进行中', '已完成'] :
                       type === 'pending' ? ['进行中'] :
                       ['已完成'];

  for (let i = 0; i < count; i++) {
    const statusIndex = type === 'initiated' ? i % 3 : 0;
    const orderType = types[i % types.length];
    const template = workOrderTemplates[orderType];
    const titleIndex = Math.floor(i / types.length) % template.titles.length;
    const month = 1 + Math.floor(i / 30);
    const day = (i % 30) + 1;
    const sequenceNum = Math.floor(i / types.length) + 1;

    let area = '';
    if (orderType === 'customer-opportunity-dispatch') {
      const customerCount = 15 + (i % 6) * 5;
      const gridCount = 1 + (i % 4);
      area = `${customerCount}个客户 · ${gridCount}个网格`;
    } else if (orderType === 'group-opportunity-dispatch') {
      area = `${2 + (i % 5)}个网格`;
    } else if (orderType === 'region-assault') {
      const communityCount = 3 + (i % 4);
      const customerCount = 1500 + (i % 5) * 500;
      area = `${communityCount}个小区 · ${customerCount}户`;
    } else if (orderType === 'alert-dispatch') {
      area = `${800 + (i % 5) * 200}户`;
    } else if (orderType === 'retention-task') {
      area = `${500 + (i % 4) * 150}户`;
    } else if (orderType === 'alert-approval') {
      area = '新疆';
    }

    workOrders.push({
      id: `${template.prefix}-${String(sequenceNum).padStart(4, '0')}`,
      title: `${template.titles[titleIndex]}-${type === 'initiated' ? '第' + sequenceNum + '期' : sequenceNum}`,
      type: orderType,
      businessType: template.businessType,
      status: statusList[statusIndex],
      createTime: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      statusText: statusTextList[statusIndex],
      area: area,
    });
  }

  return workOrders;
}

/** 工作台首页待办工单（99条，6种调度类型循环分配） */
export const myPendingWorkOrders = generateSharedWorkOrders(99, 'pending');
/** 工作台首页我发起的工单 */
export const myInitiatedWorkOrders = generateSharedWorkOrders(464, 'initiated');
/** 工作台首页已完成的工单 */
export const myCompletedWorkOrders = generateSharedWorkOrders(40, 'completed');
