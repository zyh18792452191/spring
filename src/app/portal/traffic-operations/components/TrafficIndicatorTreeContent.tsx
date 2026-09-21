'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';
import { indicatorTreesMap } from '@/data/trafficIndicatorTrees';

// 默认分析数据
const defaultAnalysisData = {
  indicatorName: '当月流量增幅',
  analysisReasons: [
    '当月流量增幅环比提升0.3个百分点，整体流量增长保持稳定态势',
    '5G数据流量同比增长28.5%，成为流量增长的主要驱动力',
    '超套客户规模持续扩大，套餐饱和度仍有提升空间，需加强流量扩容运营'
  ],
  regionData: [
    { name: '乌鲁木齐', value: 9.2 },
    { name: '克拉玛依', value: 8.8 },
    { name: '昌吉', value: 8.5 },
    { name: '巴州', value: 8.1 },
    { name: '伊犁', value: 7.8 },
    { name: '阿克苏', value: 7.5 },
  ],
  topRegions: ['乌鲁木齐', '克拉玛依', '昌吉'],
  bottomRegions: ['巴州', '伊犁', '阿克苏'],
  trendData: [
    { month: '202510', value: 7.8 },
    { month: '202511', value: 8.1 },
    { month: '202512', value: 8.3 },
    { month: '202601', value: 8.0 },
    { month: '202602', value: 8.2 },
    { month: '202603', value: 8.5 },
  ]
};

// 根据指标名称获取初始数据
function getInitialIndicatorTreeData(indicatorName: string): IndicatorCardData[] {
  const tree = indicatorTreesMap[indicatorName];
  if (tree) {
    return [JSON.parse(JSON.stringify(tree))];
  }
  // 默认返回当月流量增幅树
  const defaultTree = indicatorTreesMap['当月流量增幅'];
  return [JSON.parse(JSON.stringify(defaultTree))];
}

// 根据选中节点生成动态分析数据
function generateAnalysisData(nodeId: string, treeData: IndicatorCardData[]) {
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
  if (!node) return defaultAnalysisData;

  const generateReasons = () => {
    const statusText = node.status === 'danger' ? '较差' : node.status === 'positive' ? '良好' : '正常';
    const actionText = node.status === 'danger' ? '重点关注' : node.status === 'positive' ? '继续保持' : '持续监控';
    const trendText = node.yoy !== undefined && Number(node.yoy) > 0 ? '上升' : node.yoy !== undefined && Number(node.yoy) < 0 ? '下降' : '持平';
    return [
      `${node.name}表现${statusText}，需要${actionText}`,
      `该指标同比${trendText}${node.yoy ? Math.abs(Number(node.yoy)).toFixed(1) : ''}${node.yoyUnit || '%'}，建议采取针对性措施`,
      `从时间维度来看，该指标近期趋势${node.status === 'danger' ? '呈下降趋势' : '保持稳定'}，需密切跟踪`
    ];
  };

  const generateRegionData = () => {
    const regions = ['乌鲁木齐', '克拉玛依', '昌吉', '巴州', '伊犁', '阿克苏', '吐鲁番', '哈密', '喀什', '石河子'];
    const baseValue = node.status === 'danger' ? 5 : node.status === 'positive' ? 10 : 8;
    return regions.map(region => ({
      name: region,
      value: baseValue + Math.random() * 5
    })).slice(0, 6);
  };

  const generateTrendData = () => {
    const months = ['202510', '202511', '202512', '202601', '202602', '202603'];
    const baseValue = node.status === 'danger' ? 5 : node.status === 'positive' ? 10 : 8;
    const trend = node.status === 'danger' ? -0.5 : node.status === 'positive' ? 0.5 : 0;
    return months.map((month, index) => ({
      month,
      value: baseValue + trend * index + Math.random() * 1
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
}

interface TrafficIndicatorTreeContentProps {
  indicatorName: string;
  selectedMonth?: string;
  currentTab?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
  regionDisplay?: string;
}

export default function TrafficIndicatorTreeContent({
  indicatorName,
  selectedMonth,
  currentTab,
  selectedRegion,
  regionDisplay,
}: TrafficIndicatorTreeContentProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root');
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('2026-03');
  const finalSelectedMonth = selectedMonth !== undefined ? selectedMonth : internalSelectedMonth;
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>(getInitialIndicatorTreeData(indicatorName));

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator, indicatorTreeData)
    : defaultAnalysisData;

  const getPageId = () => {
    if (indicatorName === '当月流量增幅') {
      return 'portal.traffic.growth';
    }
    return 'portal.traffic.growth';
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      {/* 主内容区：左侧指标树 + 右侧分析面板 */}
      <div className="flex gap-4">
        {/* 左侧指标树 - 占60%，固定高度600px */}
        <div className="w-[60%] h-[600px] border rounded-lg overflow-auto relative">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <h3 className="text-sm font-semibold text-gray-700">指标树</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{finalSelectedMonth}</span>
            </div>
          </div>

          {/* 悬浮工具栏 - 透明背景，右上角 */}
          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(5)
            </Button>
            <select className="border rounded px-3 py-2 text-sm bg-white/90 backdrop-blur-sm shadow-sm">
              <option>全部展开</option>
              <option>全部折叠</option>
              <option>仅展开预警节点</option>
            </select>
          </div>

          {/* 指标树内容 */}
          <div className="h-full pt-20 px-4">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={handleCardClick}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 - 占40% */}
        <div className="w-[40%] overflow-hidden">
          {/* 上部分：分析面板 - 固定高度600px */}
          <div className="h-[600px] mb-4">
            <AnalysisPanel
              indicatorName={indicatorName}
              selectedIndicator={selectedIndicator}
              indicatorTreeData={indicatorTreeData}
              analysisReasons={dynamicAnalysisData.analysisReasons}
              regionData={dynamicAnalysisData.regionData}
              topRegions={dynamicAnalysisData.topRegions}
              bottomRegions={dynamicAnalysisData.bottomRegions}
              trendData={dynamicAnalysisData.trendData}
              currentTab={currentTab}
              from="traffic-operations"
              businessScenario="流量运营"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </div>

          {/* 下部分：数据洞察报告 */}
          <div className="border border-gray-200 rounded-lg">
            <DataInsightReports
              pageId={getPageId()}
              maxDisplay={3}
              showViewAll={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
