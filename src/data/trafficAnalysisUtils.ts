// 流量运营分析工具：指标树初始化 + 动态分析数据生成
// 供 traffic-operations 页面与 stock-view 运营弹窗复用
import { IndicatorCardData } from '@/components/IndicatorTree';
import { indicatorTreesMap } from '@/data/trafficIndicatorTrees';

// 分析面板数据
export const analysisData = {
  indicatorName: '拍照中高端客户价值保有率',
  analysisReasons: [
    '降档客户拦截较好；异网主卡虽有所改善，但我号异宽规模仍走高',
    '主套升档规模发展较好，拉动泛升档规模环比提升；零融合客户有所改善，可继续保持，做好融合套餐推广',
    '泛升档客户规模增加，受限于单客户提值下滑，整体增收价值虽有增长但后劲不足'
  ],
  regionData: [
    { name: '乌鲁木齐', value: 98.5 },
    { name: '克拉玛依', value: 98.2 },
    { name: '吐鲁番', value: 97.9 },
    { name: '哈密', value: 95.6 },
    { name: '昌吉', value: 95.2 },
    { name: '巴州', value: 94.8 }
  ],
  topRegions: ['河南', '天津', '广西'],
  bottomRegions: ['上海', '吉林', '新疆'],
  trendData: [
    { month: '202505', value: 96.2 },
    { month: '202506', value: 96.4 },
    { month: '202507', value: 96.6 },
    { month: '202508', value: 96.7 },
    { month: '202509', value: 96.8 },
    { month: '202510', value: 96.99 }
  ]
};

// 根据节点生成动态分析数据
export const generateAnalysisData = (nodeId: string, treeData: IndicatorCardData[]) => {
  // 查找节点
  const findNode = (nodes: IndicatorCardData[]): IndicatorCardData | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const node = findNode(treeData);
  if (!node) return analysisData; // 返回默认数据

  // 根据节点状态生成分析原因
  const generateReasons = () => {
    const baseReasons = [
      `${node.name}表现${node.status === 'danger' ? '较差' : node.status === 'positive' ? '良好' : '正常'}，需要${node.status === 'danger' ? '重点关注' : node.status === 'positive' ? '继续保持' : '持续监控'}`,
      `相关区域表现${node.yoy && node.yoy.toString().startsWith('-') ? '有所下滑' : '稳步提升'}，建议采取针对性措施`,
      `从时间维度来看，该指标近期趋势${node.status === 'danger' ? '呈下降趋势' : '保持稳定'}，需密切跟踪`
    ];
    return baseReasons;
  };

  // 生成区域数据（模拟数据）
  const generateRegionData = () => {
    const regions = ['河南', '天津', '广西', '上海', '吉林', '新疆', '广东', '北京', '江苏', '浙江'];
    const baseValue = node.status === 'danger' ? 90 : node.status === 'positive' ? 98 : 95;
    return regions.map(region => ({
      name: region,
      value: baseValue + Math.random() * 10
    })).slice(0, 6);
  };

  // 生成时间趋势数据（模拟数据）
  const generateTrendData = () => {
    const months = ['202505', '202506', '202507', '202508', '202509', '202510'];
    const baseValue = node.status === 'danger' ? 90 : node.status === 'positive' ? 98 : 95;
    const trend = node.status === 'danger' ? -2 : node.status === 'positive' ? 2 : 0;
    return months.map((month, index) => ({
      month,
      value: baseValue + trend * index + Math.random() * 2
    }));
  };

  const regionData = generateRegionData();
  regionData.sort((a, b) => b.value - a.value);

  return {
    indicatorName: node.name,
    analysisReasons: generateReasons(),
    regionData,
    topRegions: regionData.slice(0, 3).map(r => r.name),
    bottomRegions: regionData.slice(-3).map(r => r.name),
    trendData: generateTrendData()
  };
};

// 指标树数据
export function getInitialIndicatorTreeData(indicatorName: string): IndicatorCardData[] {
  // 从指标树映射中获取对应的指标树
  const tree = indicatorTreesMap[indicatorName];
  if (!tree) {
    console.warn(`未找到指标树: ${indicatorName}，使用默认指标树`);
    return [indicatorTreesMap['当月流量增幅']];
  }
  return [JSON.parse(JSON.stringify(tree)) as IndicatorCardData];
}
