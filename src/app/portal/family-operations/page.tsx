'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { IndicatorConfigDialog, IndicatorConfigData } from '@/components/IndicatorConfigDialog';
import { BroadbandValueConfigDialog, BroadbandValueConfigData } from '@/components/BroadbandValueConfigDialog';
import { BroadbandActiveConfigDialog, BroadbandActiveConfigData } from '@/components/BroadbandActiveConfigDialog';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import BusinessOpportunityTab, { CategoryDataItem } from '../traffic-operations/components/BusinessOpportunityTab';
import RegionAssaultTab from '../traffic-operations/components/RegionAssaultTab';
import { OverviewTab } from './components/OverviewTab';
import { IndicatorTreeContent } from './components/IndicatorTreeContent';

// 家庭运营商机分类数据（5个分类）
const familyOperationsCategoryData: CategoryDataItem[] = [
  { name: '新装宽带', parent: '价值提升类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '智能设备接入', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '单转融潜客', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '合约临期客户', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
  { name: '家庭网络质差', parent: '风险预警类', count: 1856, executionRate: 68.5, conversionRate: 32.8 },
];

// 家庭运营重点指标卡片数据
const familyMetricsData = [
  { label: '家宽到达量', value: '125.6', unit: '万户', subLabel: '渗透率', subValue: '67%', trend: 'up' as const, trendValue: '+0.3pp' },
  { label: '用户活跃量', value: '89.3', unit: '万户', subLabel: '活跃率', subValue: '71.1%', trend: 'up' as const, trendValue: '+0.5pp' },
  { label: '千兆家宽保有量', value: '45.8', unit: '万户', subLabel: '渗透率', subValue: '36.5%', trend: 'up' as const, trendValue: '+1.2pp' },
  { label: '全球通家宽拍照客户', value: '68.2', unit: '万户', subLabel: '渗透率', subValue: '54.3%', trend: 'up' as const, trendValue: '+0.8pp' },
];

// 家庭运营区域类型统计数据（5个卡片）
const familyAreaTypes = [
  { label: '低渗透小区', value: '186个' },
  { label: '竞对高占小区', value: '142个' },
  { label: '新建小区', value: '98个' },
  { label: '老旧小区改造升级', value: '65个' },
  { label: '银发小区家庭关怀', value: '42个' },
];

function FamilyOperationsPageContent() {
  // 检测是否从洞察总览页面进入
  const [fromInsightOverview, setFromInsightOverview] = useState<boolean>(false);

  // 检测来源页面
  const searchParams = useSearchParams();

  // 一级Tab状态
  // 使用初始化函数直接从URL参数读取，避免闪Tab
  const [mainTab, setMainTab] = useState<string>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'business') return 'business';
    if (tab === 'region') return 'region';
    return 'indicator';
  });
  // 二级Tab状态
  const [subTab, setSubTab] = useState<string>('overview');

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-02');
  const [isEditMode, setIsEditMode] = useState(false);
  const [regionDisplay, setRegionDisplay] = useState<string>('新疆维吾尔自治区全疆');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }>({ cityCode: '', districtCode: '', gridCode: '', isProvince: true });

  // 配置弹窗状态
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configIndex, setConfigIndex] = useState<number | null>(null);
  const [configInitialData, setConfigInitialData] = useState<Partial<IndicatorConfigData> | undefined>(undefined);

  // 千兆升档配置弹窗状态
  const [gigaUpgradeConfigDialogOpen, setGigaUpgradeConfigDialogOpen] = useState(false);
  const [gigaUpgradeConfigInitialData, setGigaUpgradeConfigInitialData] = useState<Partial<IndicatorConfigData> | undefined>(undefined);

  // 宽带价值配置弹窗状态
  const [broadbandValueConfigDialogOpen, setBroadbandValueConfigDialogOpen] = useState(false);
  const [broadbandValueConfigInitialData, setBroadbandValueConfigInitialData] = useState<Partial<BroadbandValueConfigData> | undefined>(undefined);

  // 家宽活跃情况配置弹窗状态
  const [broadbandActiveConfigDialogOpen, setBroadbandActiveConfigDialogOpen] = useState(false);
  const [broadbandActiveConfigInitialData, setBroadbandActiveConfigInitialData] = useState<Partial<BroadbandActiveConfigData> | undefined>(undefined);

  // 响应URL参数变化
  useEffect(() => {
    setFromInsightOverview(searchParams.get('from') === 'insight-overview');

    // 读取 tab 参数（响应后续URL变化）
    const tab = searchParams.get('tab');
    if (tab === 'business') {
      setMainTab('business');
    } else if (tab === 'region') {
      setMainTab('region');
    } else {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'all-churn' || hash === 'broadband-mobile-fusion') {
        setSubTab(hash);
      }
    }
  }, [searchParams]);

  // 监听 URL hash 变化
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'all-churn' || hash === 'broadband-mobile-fusion') {
        setSubTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 处理配置弹窗
  const handleOpenConfig = (index: number, initialData?: Partial<{
    indicatorCardName: string;
  }>) => {
    setConfigIndex(index);
    setConfigInitialData(initialData);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = (data: IndicatorConfigData) => {
    console.log('保存配置:', data, '索引:', configIndex);
    setConfigDialogOpen(false);
    setConfigIndex(null);
  };

  const handlePreviewConfig = (data: IndicatorConfigData) => {
    console.log('预览配置:', data, '索引:', configIndex);
  };

  const handleCloseConfig = () => {
    setConfigDialogOpen(false);
    setConfigIndex(null);
  };

  // 处理千兆升档配置弹窗
  const handleOpenGigaUpgradeConfig = (initialData?: Partial<IndicatorConfigData>) => {
    setGigaUpgradeConfigInitialData(initialData);
    setGigaUpgradeConfigDialogOpen(true);
  };

  const handleSaveGigaUpgradeConfig = (data: IndicatorConfigData) => {
    console.log('保存千兆升档配置:', data);
    setGigaUpgradeConfigDialogOpen(false);
  };

  const handlePreviewGigaUpgradeConfig = (data: IndicatorConfigData) => {
    console.log('预览千兆升档配置:', data);
  };

  const handleCloseGigaUpgradeConfig = () => {
    setGigaUpgradeConfigDialogOpen(false);
  };

  // 处理宽带价值配置弹窗
  const handleOpenBroadbandValueConfig = (initialData?: Partial<BroadbandValueConfigData>) => {
    setBroadbandValueConfigInitialData(initialData);
    setBroadbandValueConfigDialogOpen(true);
  };

  const handleSaveBroadbandValueConfig = (data: BroadbandValueConfigData) => {
    console.log('保存宽带价值配置:', data);
    setBroadbandValueConfigDialogOpen(false);
  };

  const handlePreviewBroadbandValueConfig = (data: BroadbandValueConfigData) => {
    console.log('预览宽带价值配置:', data);
  };

  const handleCloseBroadbandValueConfig = () => {
    setBroadbandValueConfigDialogOpen(false);
  };

  // 处理家宽活跃情况配置弹窗
  const handleOpenBroadbandActiveConfig = (initialData?: Partial<BroadbandActiveConfigData>) => {
    setBroadbandActiveConfigInitialData(initialData);
    setBroadbandActiveConfigDialogOpen(true);
  };

  const handleSaveBroadbandActiveConfig = (data: BroadbandActiveConfigData) => {
    console.log('保存家宽活跃情况配置:', data);
    setBroadbandActiveConfigDialogOpen(false);
  };

  const handlePreviewBroadbandActiveConfig = (data: BroadbandActiveConfigData) => {
    console.log('预览家宽活跃情况配置:', data);
  };

  const handleCloseBroadbandActiveConfig = () => {
    setBroadbandActiveConfigDialogOpen(false);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleJumpToTree = (indicatorName: string) => {
    if (indicatorName === '家宽到达量') {
      setSubTab('all-churn');
    } else if (indicatorName === '移宽融合率') {
      setSubTab('broadband-mobile-fusion');
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
      {/* 面包屑导航 */}
      {/* 面包屑导航 + 一级Tab胶囊 */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[#0085D0]">
          <span>市场运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span>存量运营</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 font-medium">家庭运营</span>
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
                  家宽到达量
                </TabsTrigger>
                <TabsTrigger value="broadband-mobile-fusion" className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white h-7 px-3 rounded text-sm">
                  移宽融合率
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
                onChange={(cityCode, cityName, districtCode, districtName, gridCode, gridName, isProvince) => {
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
            <OverviewTab isEditMode={isEditMode} onJumpToTree={handleJumpToTree} onOpenConfig={handleOpenConfig} onOpenGigaUpgradeConfig={handleOpenGigaUpgradeConfig} onOpenBroadbandValueConfig={handleOpenBroadbandValueConfig} onOpenBroadbandActiveConfig={handleOpenBroadbandActiveConfig} />
          )}
          {subTab === 'all-churn' && (
            <IndicatorTreeContent indicatorName="家宽到达量" selectedMonth={selectedMonth} />
          )}
          {subTab === 'broadband-mobile-fusion' && (
            <IndicatorTreeContent indicatorName="移宽融合率" selectedMonth={selectedMonth} />
          )}
        </div>

        <div className={mainTab === 'business' ? '' : 'hidden'}>
          <BusinessOpportunityTab regionDisplay={regionDisplay} categoryData={familyOperationsCategoryData} />
        </div>

        <div className={mainTab === 'region' ? '' : 'hidden'}>
          <RegionAssaultTab regionDisplay={regionDisplay} hideTabs={true} familyMetrics={familyMetricsData} areaTypes={familyAreaTypes} recommendedTitle="家庭运营攻坚小区推荐" communityTypes={['低渗透小区', '竞对高占小区', '新建小区', '老旧小区改造升级', '银发小区家庭关怀']} operationPanelConfig={{
            title: '家庭运营作业',
            filterTitle: '家庭客户筛选',
            tagOptions: [
              { label: '高流量低融合', value: '1,250户' },
              { label: '宽带新增潜客', value: '890户' },
              { label: '家庭组网需求', value: '568户' },
              { label: '智能设备新增', value: '234户' }
            ]
          }} scenario="family" />
        </div>
      </div>

      {/* 配置弹窗 */}
      <IndicatorConfigDialog
        open={configDialogOpen}
        onOpenChange={handleCloseConfig}
        onSave={handleSaveConfig}
        onPreview={handlePreviewConfig}
        initialData={configInitialData}
      />

      {/* 千兆升档配置弹窗 */}
      <IndicatorConfigDialog
        open={gigaUpgradeConfigDialogOpen}
        onOpenChange={handleCloseGigaUpgradeConfig}
        onSave={handleSaveGigaUpgradeConfig}
        onPreview={handlePreviewGigaUpgradeConfig}
        initialData={gigaUpgradeConfigInitialData}
        options={{ fixLeftAxisToBar: true }}
      />

      {/* 宽带价值配置弹窗 */}
      <BroadbandValueConfigDialog
        open={broadbandValueConfigDialogOpen}
        onOpenChange={handleCloseBroadbandValueConfig}
        onSave={handleSaveBroadbandValueConfig}
        onPreview={handlePreviewBroadbandValueConfig}
        initialData={broadbandValueConfigInitialData}
      />

      {/* 家宽活跃情况配置弹窗 */}
      <BroadbandActiveConfigDialog
        open={broadbandActiveConfigDialogOpen}
        onOpenChange={handleCloseBroadbandActiveConfig}
        onSave={handleSaveBroadbandActiveConfig}
        onPreview={handlePreviewBroadbandActiveConfig}
        initialData={broadbandActiveConfigInitialData}
      />
    </div>
  );
}
export default function FamilyOperationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <FamilyOperationsPageContent />
    </Suspense>
  );
}
