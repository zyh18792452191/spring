/**
 * 业务场景数据
 * 用于模板管理、场景管理、页面管理等模块
 */

export interface BusinessScenarioItem {
  id: string;
  name: string;
  children?: BusinessScenarioItem[];
}

/**
 * 业务场景数据（三级结构）
 * 用于模板管理的业务场景筛选条件
 */
export const businessScenarios: BusinessScenarioItem[] = [
  {
    id: 'public_market',
    name: '公众市场',
    children: [
      {
        id: 'market_operation',
        name: '市场运营',
        children: [
          { id: 'market_operation', name: '市场运营' },
          { id: 'new_subscriptions', name: '新入网' },
          { id: 'group_customers', name: '集团成员客户' },
        ],
      },
      {
        id: 'customer_operation',
        name: '客户运营',
        children: [
          { id: 'customer_operation', name: '客户运营' },
          { id: 'mid_high_end', name: '中高端' },
          { id: 'new_subscriptions', name: '新入网' },
          { id: 'group_customers', name: '集团成员客户' },
          { id: 'global', name: '全球通' },
          { id: 'mid_high_end_warning', name: '中高端流失预警' },
          { id: 'churn_retention', name: '离网维系' },
        ],
      },
      {
        id: 'product_operation',
        name: '产品运营',
        children: [
          { id: 'product_operation', name: '产品运营' },
          { id: 'data_products', name: '数据产品' },
          { id: 'content_products', name: '内容产品' },
        ],
      },
      {
        id: 'channel_operation',
        name: '渠道运营',
        children: [
          { id: 'channel_operation', name: '渠道运营' },
          { id: 'online_channel', name: '线上渠道' },
          { id: 'offline_channel', name: '线下渠道' },
        ],
      },
      {
        id: 'international_operation',
        name: '国际运营',
        children: [
          { id: 'international_operation', name: '国际运营' },
          { id: 'roaming', name: '漫游业务' },
          { id: 'international', name: '国际业务' },
        ],
      },
      {
        id: 'segment_market',
        name: '细分市场运营',
        children: [
          { id: 'segment_market', name: '细分市场运营' },
          { id: 'youth', name: '青年市场' },
          { id: 'silver', name: '银发市场' },
        ],
      },
    ],
  },
  {
    id: 'enterprise_market',
    name: '政企市场',
  },
  {
    id: 'home_market',
    name: '家庭市场',
    children: [
      {
        id: 'broadband',
        name: '宽带业务',
        children: [
          { id: 'broadband', name: '宽带业务' },
          { id: 'fiber', name: '光纤宽带' },
          { id: 'business_broadband', name: '企业宽带' },
        ],
      },
      {
        id: 'smart_home',
        name: '智慧家庭',
        children: [
          { id: 'smart_home', name: '智慧家庭' },
          { id: 'iot', name: '物联网' },
        ],
      },
    ],
  },
  {
    id: 'new_business',
    name: '新兴业务',
    children: [
      {
        id: 'digital_services',
        name: '数字服务',
        children: [
          { id: 'digital_services', name: '数字服务' },
          { id: 'cloud_service', name: '云服务' },
        ],
      },
      {
        id: 'content_service',
        name: '内容服务',
        children: [
          { id: 'content_service', name: '内容服务' },
          { id: 'video_service', name: '视频服务' },
        ],
      },
    ],
  },
];

/**
 * 将业务场景树扁平化为选项列表（用于 Select 组件）
 * @param nodes 业务场景树节点
 * @param prefix 父级路径前缀
 * @returns 扁平化的选项列表
 */
export function flattenBusinessScenarios(
  nodes: BusinessScenarioItem[],
  prefix = ''
): Array<{ id: string; name: string; path: string }> {
  const result: Array<{ id: string; name: string; path: string }> = [];

  nodes.forEach((node) => {
    const path = prefix ? `${prefix} / ${node.name}` : node.name;
    result.push({
      id: node.id,
      name: node.name,
      path,
    });

    if (node.children && node.children.length > 0) {
      result.push(...flattenBusinessScenarios(node.children, path));
    }
  });

  return result;
}
