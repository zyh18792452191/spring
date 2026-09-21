'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';

// 模拟指标树基础结构
const indicatorTreeBaseStructure: IndicatorCardData = {
  id: 'root',
  name: '中高端客户保有率',
  value: '98.12%',
  yoy: 3.51,
  yoyUnit: '%',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '1-1',
      name: '新疆维吾尔自治区',
      value: '98.5%',
      yoy: 2.1,
      yoyUnit: '%',
      label: '省级',
      level: 1,
      status: 'normal',
      isExpanded: false,
      parentId: 'root',
      children: []
    },
    {
      id: '1-2',
      name: '乌鲁木齐',
      value: '97.8%',
      yoy: 1.5,
      yoyUnit: '%',
      label: '市级',
      level: 1,
      status: 'normal',
      isExpanded: false,
      parentId: 'root',
      children: []
    },
    {
      id: '1-3',
      name: '克拉玛依',
      value: '99.1%',
      yoy: 4.2,
      yoyUnit: '%',
      label: '市级',
      level: 1,
      status: 'normal',
      isExpanded: false,
      parentId: 'root',
      children: []
    }
  ]
};

function getInitialIndicatorTreeData(indicatorName: string): IndicatorCardData[] {
  const tree = JSON.parse(JSON.stringify(indicatorTreeBaseStructure)) as IndicatorCardData;
  tree.name = indicatorName;
  return [tree];
}

// 分析面板数据
const analysisData = {
  indicatorName: '中高端客户保有率',
  analysisReasons: [
    '中高端客户保有率稳步提升，主套升档规模发展较好',
    '异网主卡虽有所改善，但我号异宽规模仍走高，需重点关注',
    '泛升档客户规模增加，但单客户提值下滑，整体增收后劲不足'
  ],
  regionData: [
    { name: '克拉玛依', value: 99.1 },
    { name: '乌鲁木齐', value: 98.5 },
    { name: '吐鲁番', value: 97.2 },
    { name: '哈密', value: 96.8 },
    { name: '阿克苏市', value: 96.2 },
    { name: '喀什市', value: 95.3 }
  ],
  topRegions: ['克拉玛依', '乌鲁木齐', '吐鲁番'],
  bottomRegions: ['哈密', '阿克苏市', '喀什市'],
  trendData: [
    { month: '202507', value: 96.2 },
    { month: '202508', value: 96.8 },
    { month: '202509', value: 97.2 },
    { month: '202510', value: 97.5 },
    { month: '202511', value: 97.8 },
    { month: '202512', value: 98.12 }
  ]
};

// 根据节点生成动态分析数据
const generateAnalysisData = (nodeId: string, treeData: IndicatorCardData[]) => {
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
  if (!node) return analysisData;

  const generateReasons = () => {
    const baseReasons = [
      `${node.name}表现${node.status === 'danger' ? '较差' : node.status === 'positive' ? '良好' : '正常'}，需要${node.status === 'danger' ? '重点关注' : node.status === 'positive' ? '继续保持' : '持续监控'}`,
      `相关区域表现${node.yoy && node.yoy.toString().startsWith('-') ? '有所下滑' : '稳步提升'}，建议采取针对性措施`,
      `从时间维度来看，该指标近期趋势${node.status === 'danger' ? '呈下降趋势' : '保持稳定'}，需密切跟踪`
    ];
    return baseReasons;
  };

  const generateRegionData = () => {
    const regions = ['克拉玛依', '乌鲁木齐', '吐鲁番', '哈密', '阿克苏市', '喀什市', '博州市', '巴州市'];
    const baseValue = node.status === 'danger' ? 90 : node.status === 'positive' ? 98 : 95;
    return regions.map(region => ({
      name: region,
      value: baseValue + Math.random() * 10
    })).slice(0, 6);
  };

  const generateTrendData = () => {
    const months = ['202507', '202508', '202509', '202510', '202511', '202512'];
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

export function IndicatorTreeContent({ indicatorName, selectedMonth, currentTab, selectedRegion }: { 
  indicatorName: string; 
  selectedMonth?: string; 
  currentTab?: string;
  selectedRegion?: { cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean };
}) {
  console.log('[IndicatorTreeContent] Rendered with indicatorName:', indicatorName, 'currentTab:', currentTab);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>('1');
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('2025-01');
  const finalSelectedMonth = selectedMonth !== undefined ? selectedMonth : internalSelectedMonth;
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>(getInitialIndicatorTreeData(indicatorName));

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  // 根据选中的指标生成动态分析数据
  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator, indicatorTreeData)
    : analysisData;

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
              {/* 显示当前选择的月份 */}
              <span className="text-sm text-gray-600">{finalSelectedMonth}</span>
            </div>
          </div>

          {/* 悬浮工具栏 - 透明背景，右上角 */}
          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(12)
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
            />
          </div>
        </div>

        {/* 右侧分析面板 - 占40%，固定高度600px */}
        <div className="w-[40%] h-[600px] overflow-hidden">
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
            from="mid-high-customer-operations"
            businessScenario="中高端客户运营"
            selectedRegion={{ cityCode: selectedRegion?.cityCode || '', districtCode: selectedRegion?.districtCode || '', gridCode: selectedRegion?.gridCode || '' }}
          />
        </div>
      </div>
    </div>
  );
}

