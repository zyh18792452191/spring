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

// 中高端客户运营商机分类数据
const midHighCategoryData: CategoryDataItem[] = [
  { name: '携转查询客户', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '合约临期客户', parent: '生命周期类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '套餐降档客户', parent: '风险预警类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '投诉升级客户', parent: '风险预警类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

// 中高端客户运营区域类型
const midHighAreaTypes = [
  { label: '高价值低占小区', value: '186个' },
  { label: '5G终端高占比低迁转区域', value: '142个' },
  { label: '高风险客户聚集区域', value: '98个' },
  { label: '投诉高发区域', value: '65个' },
  { label: '低融合率区域', value: '52个' },
];

// 中高端重点指标
const midHighFamilyMetrics: { label: string; value: string; unit: string; subLabel: string; subValue: string; trend: 'up' | 'down'; trendValue: string }[] = [
  {
    label: '中高端客户规模',
    value: '1,250',
    unit: '户',
    subLabel: '渗透率',
    subValue: '67%',
    trend: 'up',
    trendValue: '+0.3pp',
  },
  {
    label: '中高端携出规模',
    value: '20',
    unit: '户',
    subLabel: '渗透率',
    subValue: '0.15%',
    trend: 'down',
    trendValue: '-0.1pp',
  },
  {
    label: '中高端保有规模',
    value: '36',
    unit: '万户',
    subLabel: '渗透率',
    subValue: '46.9%',
    trend: 'up',
    trendValue: '+3.5%',
  },
  {
    label: '拍照中高端（全球通）客户规模',
    value: '18.6',
    unit: '万户',
    subLabel: '渗透率',
    subValue: '35.2%',
    trend: 'up',
    trendValue: '+1.2pp',
  },
];

function MidHighCustomerOperationsPageContent() {
  // 检测是否从策略调度页面或工单返回
  const [isFromStrategy, setIsFromStrategy] = useState(false);
  const [isFromWorkOrder, setIsFromWorkOrder] = useState(false);

  const searchParams = useSearchParams();

  // 一级Tab状态：indicator（指标&客群驱动）、business（商机驱动）、region（区域攻坚）
  // 使用初始化函数直接从URL参数读取，避免闪Tab
  const [mainTab, setMainTab] = useState<string>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business') return 'business';
    if (tab === 'region') return 'region';
    return 'indicator';
  });
  // 二级Tab状态（仅在指标&客群驱动模式下使用）：overview、value-retention、scale-retention
  const [subTab, setSubTab] = useState<string>('overview');

  const [selectedMonth, setSelectedMonth] = useState<string>('2025-10');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean }>({ isProvince: true });
  const [regionDisplay, setRegionDisplay] = useState<string>('新疆维吾尔自治区全疆');
  const [isEditMode, setIsEditMode] = useState(false);

  // 检测是否从策略调度页面或工单返回，并响应URL参数变化
  useEffect(() => {
    const fromStrategy = searchParams.get('fromStrategy') === 'true';
    const fromWorkOrder = searchParams.get('fromWorkOrder') === 'true';
    setIsFromStrategy(fromStrategy);
    setIsFromWorkOrder(fromWorkOrder);

    // 读取 tab 参数（响应后续URL变化）
    const tab = searchParams.get('tab');
    if (tab === 'business') {
      setMainTab('business');
    } else if (tab === 'region') {
      setMainTab('region');
    } else if ((fromStrategy || fromWorkOrder) && typeof window !== 'undefined') {
      // 从策略调度或工单返回时读取 hash
      const hash = window.location.hash.replace('#', '');
      const hashTab = hash.split('?')[0];
      if (hashTab === 'overview' || hashTab === 'all-churn' || hashTab === 'mid-high-churn' || hashTab === 'global-churn') {
        setSubTab(hashTab);
        console.log('[mid-high-customer-operations] Initial subTab from hash:', hashTab);
      }
    }
  }, [searchParams]);

  // 监听 URL hash 变化（从策略调度或工单返回时响应）
  useEffect(() => {
    if (!isFromStrategy && !isFromWorkOrder) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const hashTab = hash.split('?')[0];
      if (hashTab === 'overview' || hashTab === 'all-churn' || hashTab === 'mid-high-churn' || hashTab === 'global-churn') {
        setSubTab(hashTab);
        console.log('[mid-high-customer-operations] Hash changed to:', hashTab);
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
    if (indicatorName === '拍照中高端客户规模保有率') {
      setSubTab('scale-retention');
    } else if (indicatorName === '拍照中高端客户价值保有率') {
      setSubTab('value-retention');
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
    <div className="min-h-screen bg-[#F5F9FC]">
      {/* 面包屑导航 + 一级Tab胶囊 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[#2563FF]">
          <span>市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span>存量运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">中高端运营</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMainTabChange('indicator')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'indicator'
                ? 'bg-[#2563FF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            指标洞察
          </button>
          <button
            onClick={() => handleMainTabChange('region')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'region'
                ? 'bg-[#2563FF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            区域攻坚
          </button>
          <button
            onClick={() => handleMainTabChange('business')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mainTab === 'business'
                ? 'bg-[#2563FF] text-white'
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
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#2563FF] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  指标概览
                </TabsTrigger>
                <TabsTrigger value="value-retention" className="data-[state=active]:bg-[#2563FF] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  拍照中高端客户价值保有率
                </TabsTrigger>
                <TabsTrigger value="scale-retention" className="data-[state=active]:bg-[#2563FF] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  中高端客户规模保有率
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3">
              <a
                href="/portal/capability/insight/tree-templates"
                className="text-sm text-[#2563FF] hover:underline cursor-pointer"
              >
                指标树模板
              </a>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-[#2563FF] focus:outline-none min-w-[130px]"
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
          {subTab === 'value-retention' && (
            <IndicatorTreeContent
              indicatorName="拍照中高端客户价值保有率"
              selectedMonth={selectedMonth}
              currentTab="value-retention"
              selectedRegion={{ cityCode: selectedRegion?.cityCode || '', gridCode: selectedRegion?.gridCode || '' }}
            />
          )}
          {subTab === 'scale-retention' && (
            <IndicatorTreeContent
              indicatorName="拍照中高端客户规模保有率"
              selectedMonth={selectedMonth}
              currentTab="scale-retention"
              selectedRegion={{ cityCode: selectedRegion?.cityCode || '', gridCode: selectedRegion?.gridCode || '' }}
            />
          )}
        </div>

        <div className={mainTab === 'business' ? '' : 'hidden'}>
          <BusinessOpportunityTab regionDisplay={regionDisplay} categoryData={midHighCategoryData} />
        </div>

        <div className={mainTab === 'region' ? '' : 'hidden'}>
          <RegionAssaultTab regionDisplay={regionDisplay} areaTitle="中高端攻坚区域" areaTypes={midHighAreaTypes} hideTabs={true} familyMetrics={midHighFamilyMetrics} familyMetricsTitle="中高端重点指标" scenario="mid-high" />
        </div>
      </div>
      
      {/* 工单面板 */}
      <Suspense fallback={null}>
        <WorkOrderPanel scenario="mid-high" />
      </Suspense>
    </div>
  );
}

export default function MidHighCustomerOperationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <MidHighCustomerOperationsPageContent />
    </Suspense>
  );
}
