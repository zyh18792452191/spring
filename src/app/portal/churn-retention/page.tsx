'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import WorkOrderPanel from '@/components/WorkOrderPanel';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import BusinessOpportunityTab, { CategoryDataItem } from '../traffic-operations/components/BusinessOpportunityTab';
import RegionAssaultTab from '../traffic-operations/components/RegionAssaultTab';
import { OverviewTab } from './components/OverviewTab';
import { IndicatorTreeContent } from './components/IndicatorTreeContent';

// 离网维系商机分类数据
const churnRetentionCategoryData: CategoryDataItem[] = [
  { name: '欠费预警客户', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '沉默使用客户', parent: '风险预警类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '携转高风险客户', parent: '风险预警类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '合约临期客户', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

function ChurnRetentionPageContent() {
  // 检测是否从策略调度页面或工单返回
  const [isFromStrategy, setIsFromStrategy] = useState(false);
  const [isFromWorkOrder, setIsFromWorkOrder] = useState(false);
  const [fromInsightOverview, setFromInsightOverview] = useState(false);

  // 检测来源页面
  const searchParams = useSearchParams();

  // 一级Tab状态：indicator（指标&客群驱动）、business（商机驱动）、region（区域攻坚）
  // 使用初始化函数直接从URL参数读取，避免闪Tab
  const [mainTab, setMainTab] = useState<string>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business') return 'business';
    if (tab === 'region') return 'region';
    return 'indicator';
  });
  // 二级Tab状态：overview、all-churn、mid-high-churn、global-churn
  const [subTab, setSubTab] = useState<string>('overview');

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-02');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }>({ cityCode: '', districtCode: '', gridCode: '', isProvince: true });
  const [regionDisplay, setRegionDisplay] = useState<string>('新疆维吾尔自治区全疆');
  const [isEditMode, setIsEditMode] = useState(false);

  // 响应URL参数变化
  useEffect(() => {
    const fromStrategy = searchParams.get('fromStrategy') === 'true';
    const fromWorkOrder = searchParams.get('fromWorkOrder') === 'true';
    setIsFromStrategy(fromStrategy);
    setIsFromWorkOrder(fromWorkOrder);
    setFromInsightOverview(searchParams.get('from') === 'insight-overview');

    // 读取 tab 参数（响应后续URL变化）
    const tab = searchParams.get('tab');
    if (tab === 'business') {
      setMainTab('business');
    } else if (tab === 'region') {
      setMainTab('region');
    } else if ((fromStrategy || fromWorkOrder) && typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const hashTab = hash.split('?')[0];
      if (hashTab === 'overview' || hashTab === 'all-churn' || hashTab === 'mid-high-churn' || hashTab === 'global-churn') {
        setSubTab(hashTab);
        console.log('[churn-retention] Initial subTab from hash:', hashTab);
      }
    }
  }, [searchParams]);

  // 监听 URL hash 变化
  useEffect(() => {
    if (!isFromStrategy && !isFromWorkOrder) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const hashTab = hash.split('?')[0];
      if (hashTab === 'overview' || hashTab === 'all-churn' || hashTab === 'mid-high-churn' || hashTab === 'global-churn') {
        setSubTab(hashTab);
        console.log('[churn-retention] Hash changed to:', hashTab);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isFromStrategy, isFromWorkOrder]);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleJumpToTree = (indicatorName: string) => {
    if (indicatorName === '当月全量离网客户数') {
      setSubTab('all-churn');
    } else if (indicatorName === '当月拍照中高端离网客户数') {
      setSubTab('mid-high-churn');
    } else if (indicatorName === '当月拍照全球通离网客户数') {
      setSubTab('global-churn');
    }
  };

  // 一级Tab切换时重置二级Tab
  const handleMainTabChange = (value: string) => {
    setMainTab(value);
    if (value === 'indicator') {
      setSubTab('overview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 + 一级Tab胶囊 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[#0085D0]">
          <span>市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span>存量运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">离网维系</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMainTabChange('indicator')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'indicator'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            指标洞察
          </button>
          <button
            onClick={() => handleMainTabChange('region')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'region'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            区域攻坚
          </button>
          <button
            onClick={() => handleMainTabChange('business')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'business'
                ? 'bg-[#0085D0] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            商机驱动
          </button>
        </div>
      </div>

      {/* 指标洞察 - 二级Tab Card + 筛选器 */}
      {mainTab === 'indicator' && (
        <Card className="mx-6 mb-4 p-3">
          <div className="flex items-center justify-between">
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList className="h-8 bg-transparent p-0 gap-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  指标概览
                </TabsTrigger>
                <TabsTrigger value="all-churn" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  当月全量离网客户数
                </TabsTrigger>
                <TabsTrigger value="mid-high-churn" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  当月拍照中高端离网客户数
                </TabsTrigger>
                <TabsTrigger value="global-churn" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  当月拍照全球通离网客户数
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3">
              <a
                href="/portal/capability/insight/tree-templates"
                className="text-sm text-[#0085D0] hover:underline cursor-pointer"
              >
                指标树模板
              </a>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:border-[#0085D0] focus:outline-none min-w-[130px]"
              />
              <XinjiangRegionSelector
                value={selectedRegion}
                onChange={(cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => {
                  setSelectedRegion({ cityCode, districtCode, gridCode, isProvince });
                  if (isProvince) {
                    setRegionDisplay('新疆维吾尔自治区全疆');
                  } else {
                    setRegionDisplay(gridCode ? `${cityName}/${districtName}/${gridName}` : districtCode ? `${cityName}/${districtName}` : cityName);
                  }
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 内容区域 - 使用CSS隐藏保持状态 */}
      <div className="p-4">
        <div className={mainTab === 'indicator' ? '' : 'hidden'}>
          {subTab === 'overview' && (
            <OverviewTab isEditMode={isEditMode} onJumpToTree={handleJumpToTree} />
          )}
          {subTab === 'all-churn' && (
            <IndicatorTreeContent
              indicatorName="当月全量离网客户数"
              selectedMonth={selectedMonth}
              currentTab="all-churn"
              selectedRegion={selectedRegion}
            />
          )}
          {subTab === 'mid-high-churn' && (
            <IndicatorTreeContent
              indicatorName="当月拍照中高端离网客户数"
              selectedMonth={selectedMonth}
              currentTab="mid-high-churn"
              selectedRegion={selectedRegion}
            />
          )}
          {subTab === 'global-churn' && (
            <IndicatorTreeContent
              indicatorName="当月拍照全球通离网客户数"
              selectedMonth={selectedMonth}
              currentTab="global-churn"
              selectedRegion={selectedRegion}
            />
          )}
        </div>

        <div className={mainTab === 'business' ? '' : 'hidden'}>
          <BusinessOpportunityTab regionDisplay={regionDisplay} categoryData={churnRetentionCategoryData} />
        </div>

        <div className={mainTab === 'region' ? '' : 'hidden'}>
          <RegionAssaultTab 
            regionDisplay={regionDisplay} 
            areaTitle="高离网率小区"
            recommendedTitle="离网攻坚小区推荐"
            hideTabs={true}
            familyMetrics={[
              { label: '离网规模压降', value: '1,250', unit: '户', subLabel: '渗透率', subValue: '67%', trend: 'up', trendValue: '+0.3pp' },
              { label: '离网规模', value: '2.35', unit: '%', subLabel: '环比', subValue: '0.15%', trend: 'down', trendValue: '-0.1pp' },
              { label: '离网损失', value: '368', unit: '万', subLabel: '环比', subValue: '12.5万', trend: 'up', trendValue: '+3.5%' },
              { label: '离网客户挽回量', value: '18.6', unit: '%', subLabel: '挽回率', subValue: '35.2%', trend: 'up', trendValue: '+1.2pp' }
            ]}
            areaTypes={[
              { label: '高离网率低占小区', value: '186个' },
              { label: '竞对策反热点区域', value: '142个' },
              { label: '高风险客户聚集区域', value: '98个' },
              { label: '投诉高发区域', value: '65个' },
              { label: '低融合率区域', value: '65个' }
            ]}
            operationPanelConfig={{
              title: '离网客户作业',
              filterTitle: '离网客户筛选',
              tagOptions: [
                { label: '携出高风险客户', value: '1,250户' },
                { label: '沉默使用客户', value: '890户' },
                { label: '合约临期客户', value: '568户' },
                { label: '欠费预警客户', value: '234户' }
              ]
            }}
            communityTypes={['高离网率低占小区', '竞对策发热点区域', '高风险客户聚集区域', '投诉高发区域', '低融合率区域']}
            scenario="churn-retention"
          />
        </div>
      </div>
      
      {/* 工单面板 */}
      <Suspense fallback={null}>
        <WorkOrderPanel scenario="churn" />
      </Suspense>
    </div>
  );
}

export default function ChurnRetentionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <ChurnRetentionPageContent />
    </Suspense>
  );
}
