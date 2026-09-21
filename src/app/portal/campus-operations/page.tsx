'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import CampusOverviewTab from './components/CampusOverviewTab';
import BusinessOpportunityTab, { CategoryDataItem } from '../traffic-operations/components/BusinessOpportunityTab';

// 校园运营商机分类数据
const campusCategoryData: CategoryDataItem[] = [
  { name: '新生入网', parent: '价值提升类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '校园套餐升级', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '校园宽带办理', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '离网预警客户', parent: '风险预警类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

function CampusOperationsContent() {
  const searchParams = useSearchParams();
  
  // 一级Tab状态：indicator（指标&客群驱动）、business（商机驱动）
  const [mainTab, setMainTab] = useState<string>(() => {
    const tab = searchParams.get('tab');
    return tab === 'business' ? 'business' : 'indicator';
  });
  // 二级Tab状态（仅在指标&客群驱动模式下使用）：overview
  const [subTab, setSubTab] = useState<string>('overview');
  
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-03');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }>({ cityCode: '', districtCode: '', gridCode: '', isProvince: true });
  const [regionDisplay, setRegionDisplay] = useState<string>('新疆维吾尔自治区全疆');

  // 监听 URL 参数变化
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business') {
      setMainTab('business');
    } else {
      setMainTab('indicator');
      setSubTab('overview');
    }
  }, [searchParams]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleRegionChange = useCallback((cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => {
    setSelectedRegion({ cityCode, districtCode, gridCode, isProvince });
    if (isProvince) {
      setRegionDisplay('新疆维吾尔自治区全疆');
    } else {
      setRegionDisplay(gridCode ? `${cityName}/${districtName}/${gridName}` : districtCode ? `${cityName}/${districtName}` : cityName);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="mb-2 px-6 pt-4 text-sm text-gray-600 flex items-center gap-4">
        <nav className="flex items-center gap-2">
          <span className="hover:text-[#0085D0] cursor-pointer">
            市场数智运营
          </span>
          <span>/</span>
          <span className="hover:text-[#0085D0] cursor-pointer">
            细分市场
          </span>
          <span>/</span>
          <span className={mainTab ? 'hover:text-[#0085D0] cursor-pointer' : 'font-medium text-gray-900'}>
            校园运营
          </span>
          {/* 四级面包屑：根据tab参数显示 */}
          {mainTab && (
            <>
              <span>/</span>
              <span className="font-medium text-gray-900">
                {mainTab === 'indicator' ? '指标&客群驱动' : mainTab === 'business' ? '商机驱动' : ''}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 指标&客群驱动模式 - 带二级Tab */}
        {mainTab === 'indicator' && (
          <>
            {/* 二级Tab：指标概览 + 筛选器 */}
            <Card className="mb-4 p-3">
              <div className="flex items-center justify-between">
                <Tabs value={subTab} onValueChange={setSubTab}>
                  <TabsList className="h-8 bg-transparent p-0 gap-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                      指标概览
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* 右侧筛选器 */}
                <div className="flex items-center gap-3">
                  {/* 日期筛选 */}
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:border-[#0085D0] focus:outline-none min-w-[130px]"
                  />

                  {/* 区域筛选 */}
                  <XinjiangRegionSelector
                    value={selectedRegion}
                    onChange={handleRegionChange}
                  />
                </div>
              </div>
            </Card>

            {/* 二级Tab内容 */}
            {subTab === 'overview' && (
              <CampusOverviewTab regionDisplay={regionDisplay} />
            )}
          </>
        )}

        {/* 商机驱动模式 - 直接显示内容 */}
        {mainTab === 'business' && (
          <BusinessOpportunityTab
            regionDisplay={regionDisplay}
            categoryData={campusCategoryData}
          />
        )}
      </div>
    </div>
  );
}

// 包装组件，使用Suspense
export default function CampusOperationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <CampusOperationsContent />
    </Suspense>
  );
}
