'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  Building2, Wifi, Info,
  Users, Target,
  ChevronLeft, ChevronRight, MapPin, ChevronDown
} from 'lucide-react';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMounted } from '@/hooks/useMounted';

// 类型定义
interface AreaTypeItem {
  label: string;
  value: string;
}

interface FamilyMetricItem {
  label: string;
  value: string;
  unit: string;
  subLabel: string;
  subValue: string;
  trend: 'up' | 'down';
  trendValue: string;
}

// 场景类型
type ScenarioType = 'traffic' | 'mid-high' | 'churn-retention' | 'family';

// 作战沙盘卡片数据结构
interface SandtableViewItem {
  label: string;
  value: string;
}

interface SandtableViewCard {
  title: string;
  color: string; // 标题颜色
  bgColor: string; // 背景色
  items: SandtableViewItem[];
}

// 各场景作战沙盘数据
const SCENARIO_SANDBOX_DATA: Record<ScenarioType, Record<string, {
  card: SandtableViewCard;
}>> = {
  traffic: {
    current: {
      card: {
        title: '流量派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '流量派单任务', value: '28个' },
          { label: '派单小区', value: '15个' },
          { label: '派单次数', value: '156次' },
          { label: '派单完成率', value: '87.5%' },
        ],
      },
    },
    last: {
      card: {
        title: '流量派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '流量派单任务', value: '23个' },
          { label: '派单小区', value: '12个' },
          { label: '派单次数', value: '132次' },
          { label: '派单完成率', value: '82.3%' },
        ],
      },
    },
    year: {
      card: {
        title: '流量派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '流量派单任务', value: '312个' },
          { label: '派单小区', value: '98个' },
          { label: '派单次数', value: '1,892次' },
          { label: '派单完成率', value: '91.2%' },
        ],
      },
    },
  },
  'mid-high': {
    current: {
      card: {
        title: '中高端维系派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '维系派单任务', value: '32个' },
          { label: '派单小区', value: '16个' },
          { label: '派单次数', value: '178次' },
          { label: '维系完成率', value: '85.6%' },
        ],
      },
    },
    last: {
      card: {
        title: '中高端维系派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '维系派单任务', value: '27个' },
          { label: '派单小区', value: '13个' },
          { label: '派单次数', value: '148次' },
          { label: '维系完成率', value: '79.8%' },
        ],
      },
    },
    year: {
      card: {
        title: '中高端维系派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '维系派单任务', value: '298个' },
          { label: '派单小区', value: '108个' },
          { label: '派单次数', value: '2,156次' },
          { label: '维系完成率', value: '90.3%' },
        ],
      },
    },
  },
  'churn-retention': {
    current: {
      card: {
        title: '离网挽留派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '挽留派单任务', value: '35个' },
          { label: '派单小区', value: '18个' },
          { label: '派单次数', value: '168次' },
          { label: '挽留成功率', value: '82.4%' },
        ],
      },
    },
    last: {
      card: {
        title: '离网挽留派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '挽留派单任务', value: '29个' },
          { label: '派单小区', value: '15个' },
          { label: '派单次数', value: '142次' },
          { label: '挽留成功率', value: '76.5%' },
        ],
      },
    },
    year: {
      card: {
        title: '离网挽留派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '挽留派单任务', value: '326个' },
          { label: '派单小区', value: '112个' },
          { label: '派单次数', value: '1,985次' },
          { label: '挽留成功率', value: '88.7%' },
        ],
      },
    },
  },
  family: {
    current: {
      card: {
        title: '家庭运营派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '运营派单任务', value: '30个' },
          { label: '派单小区', value: '14个' },
          { label: '派单次数', value: '145次' },
          { label: '运营完成率', value: '86.2%' },
        ],
      },
    },
    last: {
      card: {
        title: '家庭运营派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '运营派单任务', value: '25个' },
          { label: '派单小区', value: '11个' },
          { label: '派单次数', value: '118次' },
          { label: '运营完成率', value: '80.5%' },
        ],
      },
    },
    year: {
      card: {
        title: '家庭运营派单', color: '#52C41A', bgColor: '#EDF9F2',
        items: [
          { label: '运营派单任务', value: '342个' },
          { label: '派单小区', value: '125个' },
          { label: '派单次数', value: '2,068次' },
          { label: '运营完成率', value: '91.5%' },
        ],
      },
    },
  },
};

// 流量场景小区标签类型
interface TrafficCommunityItem {
  id: number;
  name: string;
  type: string; // 保留兼容，流量场景下为"N维覆盖"
  info: string; // 特征标签说明
  tags: {
    isLowSaturation: boolean;     // 是否流量低饱和小区
    isZeroLowTraffic: boolean;    // 是否流量零低小区
    isOverageHighFreq: boolean;   // 是否流量超套高发小区
    isCompetitorHighRisk: boolean; // 是否异网高风险小区
  };
}

// 通用小区项类型
type CommunityItem = { id: number; name: string; type: string; info: string };

// 各场景攻坚小区推荐数据
const SCENARIO_COMMUNITIES: Record<ScenarioType, {
  recommended: CommunityItem[];
  expanded: CommunityItem[];
  sectionTitle: string;
  sectionSubtitle: string;
  sectionCount: string;
}> = {
  traffic: {
    sectionTitle: '流量攻坚小区推荐',
    sectionSubtitle: '流量低饱和/零低/超套/异网高风险区域',
    sectionCount: '20个',
    recommended: [
      { id: 1, name: '大巴扎小区', type: '流量零低', info: '特征标签：流量零低、流量超套高发、异网高风险', tags: { isLowSaturation: false, isZeroLowTraffic: true, isOverageHighFreq: true, isCompetitorHighRisk: true } } as unknown as CommunityItem,
      { id: 2, name: '南湖小区', type: '流量低饱和', info: '特征标签：流量低饱和、流量零低、流量超套高发', tags: { isLowSaturation: true, isZeroLowTraffic: true, isOverageHighFreq: true, isCompetitorHighRisk: false } } as unknown as CommunityItem,
      { id: 3, name: '北站小区', type: '流量超套高发', info: '特征标签：流量超套高发、异网高风险', tags: { isLowSaturation: false, isZeroLowTraffic: false, isOverageHighFreq: true, isCompetitorHighRisk: true } } as unknown as CommunityItem,
      { id: 4, name: '黄河小区', type: '流量低饱和', info: '特征标签：流量低饱和、异网高风险', tags: { isLowSaturation: true, isZeroLowTraffic: false, isOverageHighFreq: false, isCompetitorHighRisk: true } } as unknown as CommunityItem,
      { id: 5, name: '解放路小区', type: '流量低饱和', info: '特征标签：流量低饱和、流量超套高发', tags: { isLowSaturation: true, isZeroLowTraffic: false, isOverageHighFreq: true, isCompetitorHighRisk: false } } as unknown as CommunityItem,
      { id: 6, name: '大东小区', type: '流量零低', info: '特征标签：流量零低、流量超套高发', tags: { isLowSaturation: false, isZeroLowTraffic: true, isOverageHighFreq: true, isCompetitorHighRisk: false } } as unknown as CommunityItem,
    ],
    expanded: [
      { id: 7, name: '开发区花园', type: '异网高风险', info: '特征标签：异网高风险', tags: { isLowSaturation: false, isZeroLowTraffic: false, isOverageHighFreq: false, isCompetitorHighRisk: true } } as unknown as CommunityItem,
      { id: 8, name: '于洪新城', type: '异网高风险', info: '特征标签：异网高风险', tags: { isLowSaturation: false, isZeroLowTraffic: false, isOverageHighFreq: false, isCompetitorHighRisk: true } } as unknown as CommunityItem,
      { id: 9, name: '银川路小区', type: '流量低饱和', info: '特征标签：流量低饱和', tags: { isLowSaturation: true, isZeroLowTraffic: false, isOverageHighFreq: false, isCompetitorHighRisk: false } } as unknown as CommunityItem,
      { id: 10, name: '友好北路小区', type: '流量零低', info: '特征标签：流量零低', tags: { isLowSaturation: false, isZeroLowTraffic: true, isOverageHighFreq: false, isCompetitorHighRisk: false } } as unknown as CommunityItem,
    ],
  },
  'mid-high': {
    sectionTitle: '中高端攻坚小区推荐',
    sectionSubtitle: '高价值低占小区',
    sectionCount: '18个',
    recommended: [
      { id: 1, name: '解放路小区', type: '高价值低占小区', info: '中高端占比：15%\n渗透率：28%' },
      { id: 2, name: '大巴扎小区', type: '5G终端低迁转', info: '5G终端占比：72%\n迁转率：15%' },
      { id: 3, name: '黄河小区', type: '高风险客户聚集', info: '携转风险客户：126户\n投诉率：8.5%' },
      { id: 4, name: '开发区花园', type: '投诉高发区域', info: '月均投诉：23件\n投诉解决率：62%' },
      { id: 5, name: '南湖小区', type: '高价值低占小区', info: '中高端占比：18%\n渗透率：22%' },
      { id: 6, name: '友好北路小区', type: '低融合率区域', info: '融合率：32%\n单卡客户：856户' },
    ],
    expanded: [
      { id: 7, name: '北站小区', type: '高风险客户聚集', info: '携转风险客户：98户\n投诉率：6.2%' },
      { id: 8, name: '银川路小区', type: '投诉高发区域', info: '月均投诉：18件\n投诉解决率：58%' },
      { id: 9, name: '大东小区', type: '高价值低占小区', info: '中高端占比：12%\n渗透率：31%' },
      { id: 10, name: '于洪新城', type: '5G终端低迁转', info: '5G终端占比：65%\n迁转率：20%' },
    ],
  },
  'churn-retention': {
    sectionTitle: '离网攻坚小区推荐',
    sectionSubtitle: '高离网率低占小区',
    sectionCount: '16个',
    recommended: [
      { id: 1, name: '解放路小区', type: '高离网率低占小区', info: '离网率：12.5%\n渗透率：28%' },
      { id: 2, name: '大巴扎小区', type: '竞对策反热点', info: '竞对策反密度：8次/月\n客户流失率：15%' },
      { id: 3, name: '黄河小区', type: '高风险客户聚集', info: '沉默客户：236户\n欠费率：18%' },
      { id: 4, name: '开发区花园', type: '投诉高发区域', info: '月均投诉：28件\n投诉解决率：55%' },
      { id: 5, name: '南湖小区', type: '高离网率低占小区', info: '离网率：9.8%\n渗透率：22%' },
      { id: 6, name: '友好北路小区', type: '低融合率区域', info: '融合率：28%\n单卡客户：756户' },
    ],
    expanded: [
      { id: 7, name: '北站小区', type: '竞对策反热点', info: '竞对策反密度：6次/月\n客户流失率：11%' },
      { id: 8, name: '银川路小区', type: '高风险客户聚集', info: '沉默客户：185户\n欠费率：14%' },
      { id: 9, name: '大东小区', type: '高离网率低占小区', info: '离网率：8.6%\n渗透率：31%' },
      { id: 10, name: '于洪新城', type: '低融合率区域', info: '融合率：35%\n单卡客户：612户' },
    ],
  },
  family: {
    sectionTitle: '家庭运营攻坚小区推荐',
    sectionSubtitle: '低渗透小区',
    sectionCount: '22个',
    recommended: [
      { id: 1, name: '解放路小区', type: '低渗透小区', info: '家宽渗透率：28%\n住户数：152户' },
      { id: 2, name: '大巴扎小区', type: '竞对高占小区', info: '竞对宽带份额：62%\n本网份额：25%' },
      { id: 3, name: '黄河小区', type: '新建小区', info: '住户数：380户\n入住率：75%' },
      { id: 4, name: '开发区花园', type: '老旧小区改造升级', info: '住户数：265户\n家宽设备老化率：45%' },
      { id: 5, name: '南湖小区', type: '银发小区家庭关怀', info: '老年住户占比：42%\n智能设备渗透：15%' },
      { id: 6, name: '友好北路小区', type: '低渗透小区', info: '家宽渗透率：32%\n住户数：128户' },
    ],
    expanded: [
      { id: 7, name: '北站小区', type: '竞对高占小区', info: '竞对宽带份额：58%\n本网份额：28%' },
      { id: 8, name: '银川路小区', type: '新建小区', info: '住户数：295户\n入住率：68%' },
      { id: 9, name: '大东小区', type: '老旧小区改造升级', info: '住户数：198户\n家宽设备老化率：38%' },
      { id: 10, name: '于洪新城', type: '银发小区家庭关怀', info: '老年住户占比：35%\n智能设备渗透：18%' },
    ],
  },
};

// 默认重点指标（流量运营核心指标，与指标概览核心指标对齐：流量增幅、流量份额、累计通信服务收入、当月≥1GB上网客户）
const DEFAULT_FAMILY_METRICS: FamilyMetricItem[] = [
  { label: '流量增幅', value: '8.5', unit: '%', subLabel: '累计', subValue: '7.8%', trend: 'up', trendValue: '+0.3pp' },
  { label: '流量份额', value: '14.2', unit: '%', subLabel: '差值', subValue: '+0.4%', trend: 'up', trendValue: '+0.4pp' },
  { label: '累计通信服务收入', value: '285.6', unit: '亿元', subLabel: '同比', subValue: '+5.2%', trend: 'up', trendValue: '+5.2%' },
  { label: '当月≥1GB上网客户', value: '7.85', unit: '亿户', subLabel: '同比', subValue: '+3.2%', trend: 'up', trendValue: '+3.2%' },
];

// 默认区域类型（流量运营，作为后备）
const DEFAULT_AREA_TYPES: AreaTypeItem[] = [
  { label: '流量低饱和小区', value: '186个' },
  { label: '流量零低小区', value: '142个' },
  { label: '流量超套高发小区', value: '98个' },
  { label: '异网高风险小区', value: '65个' },
];


interface BattleCockpitProps {
  visible: boolean;
  onToggleVisible: () => void;
  regionDisplay: string;
  onDispatch?: () => void;
  areaTitle?: string;
  areaTypes?: AreaTypeItem[];
  hideTabs?: boolean;
  familyMetrics?: FamilyMetricItem[];
  familyMetricsTitle?: string;
  scenario?: ScenarioType;  // 业务场景
  recommendedTitle?: string; // 推荐小区标题（外部传入覆盖）
  // 区域选择相关
  regionValue?: { cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean };
  onRegionChange?: (cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => void;
  // 小区名称点击回调（传完整小区数据）
  onCommunityClick?: (community: { id: number; name: string; type: string; info: string }) => void;
}

export default function BattleCockpit({ 
  visible, 
  onToggleVisible, 
  regionDisplay, 
  onDispatch,
  areaTitle,
  areaTypes,
  hideTabs,
  familyMetrics,
  familyMetricsTitle,
  scenario = 'traffic',
  recommendedTitle,
  regionValue,
  onRegionChange,
  onCommunityClick,
}: BattleCockpitProps) {
  const mounted = useMounted();
  const [timePeriod, setTimePeriod] = useState<'current' | 'last' | 'year'>('current');
  const [expanded, setExpanded] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // 使用传入的数据或默认值
  const sandboxData = SCENARIO_SANDBOX_DATA[scenario];
  const currentSandbox = sandboxData[timePeriod];
  const communityData = SCENARIO_COMMUNITIES[scenario];
  const recommendedCommunities = communityData.recommended;
  const expandedCommunities = communityData.expanded;
  const metrics = familyMetrics && familyMetrics.length > 0 ? familyMetrics : DEFAULT_FAMILY_METRICS;
  const types = areaTypes && areaTypes.length > 0 ? areaTypes : DEFAULT_AREA_TYPES;
  const metricsTitle = familyMetricsTitle || '重点指标';
  const title = areaTitle || '攻坚区域';
  const communitySectionTitle = recommendedTitle || communityData.sectionTitle;
  const [metricsPage, setMetricsPage] = useState(0);
  const metricsPerPage = 4;
  const metricsTotalPages = Math.ceil(metrics.length / metricsPerPage);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = [...recommendedCommunities, ...expandedCommunities].map(c => c.id);
      setSelectedCommunities(allIds);
    } else {
      setSelectedCommunities([]);
    }
  };

  const handleCommunitySelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedCommunities([...selectedCommunities, id]);
    } else {
      setSelectedCommunities(selectedCommunities.filter(cid => cid !== id));
    }
  };

  // 流量场景：获取小区的特征标签列表
  const getTrafficTags = (community: CommunityItem): { label: string; color: string }[] => {
    const tags = (community as unknown as TrafficCommunityItem).tags;
    if (!tags) return [];
    const result: { label: string; color: string }[] = [];
    if (tags.isLowSaturation) result.push({ label: '流量低饱和', color: 'bg-red-50 text-[#FF4D4F]' });
    if (tags.isZeroLowTraffic) result.push({ label: '流量零低', color: 'bg-orange-50 text-orange-600' });
    if (tags.isOverageHighFreq) result.push({ label: '超套高发', color: 'bg-purple-50 text-purple-600' });
    if (tags.isCompetitorHighRisk) result.push({ label: '异网高风险', color: 'bg-yellow-50 text-yellow-700' });
    return result;
  };

  // 获取小区类型标签颜色
  const getCommunityTypeColor = (type: string): string => {
    // 流量运营类型
    if (type.includes('低饱和') || type.includes('流量需求') || type.includes('低渗透')) return 'bg-red-50 text-[#FF4D4F]';
    if (type.includes('零低') || type.includes('5G终端') || type.includes('低迁转')) return 'bg-orange-50 text-orange-600';
    if (type.includes('超套') || type.includes('竞对') || type.includes('高风险') || type.includes('竞对策反')) return 'bg-purple-50 text-purple-600';
    if (type.includes('异网') || type.includes('高校') || type.includes('投诉高发') || type.includes('新建')) return 'bg-yellow-50 text-yellow-700';
    if (type.includes('低融合') || type.includes('老旧') || type.includes('银发') || type.includes('高价值低占') || type.includes('高风险客户')) return 'bg-green-50 text-green-600';
    return 'bg-[rgba(22,119,255,0.08)] text-[#1677FF]';
  };

  if (!visible) {

  if (!mounted) return null;
    return (
      <button
        onClick={onToggleVisible}
        className="absolute left-0 z-20 w-[24px] h-[64px] bg-white rounded-r-[8px] shadow-[2px_0_6px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-[#f8fafc] transition-all border border-l-0 border-[#E8E8E8]"
        style={{ top: 'calc(50% + 28px)' }}
        title="打开指挥舱"
      >
        <ChevronRight className="w-4 h-4 text-[#666666]" />
      </button>
    );
  }

  return (
    <div className="absolute left-0 top-0 bottom-0 z-20 w-[450px] border-r border-[#E8E8E8] bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] flex flex-col overflow-hidden shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
      {/* 顶部导航栏 */}
      <div className="h-[64px] px-[20px] flex items-center justify-between border-b border-[#E8E8E8] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#333333]">作战指挥驾驶舱</h1>
          <p className="text-[12px] text-[#999999] mt-[2px]">{regionDisplay}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleVisible} className="w-[32px] h-[32px] bg-[#f0f0f0] border-none rounded-[6px] flex items-center justify-center text-[#666666] cursor-pointer transition-all hover:bg-[#E8E8E8] hover:scale-110" title="关闭面板">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 区域筛选器 */}
      {onRegionChange && (
        <div className="px-[20px] py-[12px] border-b border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="flex items-center gap-[8px] mb-[8px]">
            <MapPin className="w-4 h-4 text-[#1677FF]" />
            <span className="text-[14px] text-[#666666]">区域筛选</span>
          </div>
          <XinjiangRegionSelector
            value={regionValue || { cityCode: '', districtCode: '', gridCode: '' }}
            onChange={onRegionChange}
          />
        </div>
      )}

      {/* 内容区域 - 自定义滚动条 */}
      <div className="battle-scrollbar flex-1 overflow-y-auto p-[20px]">
        <div className="space-y-[20px]">
          {/* 重点指标 */}
          {metrics.length > 0 && (
            <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
              <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
                {metricsTitle}
                <span className="text-[11px] font-normal text-[#999999] ml-auto">数据截止：{new Date(Date.now() - 86400000).toISOString().slice(0,10)}</span>
              </h3>
              <div className="grid grid-cols-2 gap-[12px]">
                {metrics.slice(metricsPage * metricsPerPage, (metricsPage + 1) * metricsPerPage).map((metric, i) => (
                  <div key={i} className="bg-[#E5F0FF] rounded-[8px] p-[12px]">
                    <div className="text-[12px] text-[#666666] mb-[4px]">{metric.label}</div>
                    <div className="text-[24px] font-bold text-[#333333]">{metric.value}<span className="text-[12px] text-[#666666] ml-[4px]">{metric.unit}</span></div>
                    <div className="flex items-center gap-[8px] mt-[4px]">
                      <span className="text-[12px] text-[#666666]">{metric.subLabel}</span>
                      <span className="text-[16px] font-bold text-[#F59E0B]">{metric.subValue}</span>
                      <span className="text-[11px] text-[#52C41A]">{metric.trend === 'up' ? '↑' : '↓'} {metric.trendValue}</span>
                    </div>
                  </div>
                ))}
              </div>
              {metricsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-[6px] mt-[10px]">
                  {Array.from({ length: metricsTotalPages }).map((_, p) => (
                    <button
                      key={p}
                      onClick={() => setMetricsPage(p)}
                      className={`w-[8px] h-[8px] rounded-full transition-all ${p === metricsPage ? 'bg-[#1677FF] w-[16px]' : 'bg-[#D9D9D9]'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 攻坚区域各类型分布 */}
          {types.length > 0 && (
            <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
              <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
                {title}
              </h3>
              <div className="grid grid-cols-2 gap-[12px]">
                {types.map((item, i) => {
                  const colors = ['#FF4D4F', '#FA8C16', '#722ED1', '#1677FF', '#52C41A', '#F59E0B'];
                  const color = colors[i % colors.length];
                  return (
                    <div key={i} className="bg-[#F5F7FA] rounded-[8px] p-[12px] flex items-center justify-between">
                      <div className="flex items-center gap-[6px]">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="text-[12px] text-[#666666]">{item.label}</span>
                      </div>
                      <span className="text-[16px] font-semibold" style={{ color }}>{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 作战沙盘 */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-[12px]">
              <h3 className="text-[16px] font-semibold text-[#333333] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
                作战沙盘
              </h3>
              <div className="flex bg-[rgba(0,0,0,0.02)] rounded-[4px] p-[2px] gap-[2px]">
                {[
                  { key: 'current' as const, label: '当月' },
                  { key: 'last' as const, label: '上月' },
                  { key: 'year' as const, label: '年累计' },
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => setTimePeriod(period.key)}
                    className={`px-[10px] py-[4px] text-[12px] font-medium rounded-[4px] cursor-pointer transition-all ${
                      timePeriod === period.key
                        ? 'bg-[#1677FF] text-white border-none'
                        : 'bg-transparent text-[#666666] border-none hover:text-[#1677FF]'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 派单卡片 */}
            <div className="rounded-[8px] p-[12px]" style={{ background: currentSandbox.card.bgColor }}>
              <div className="text-[12px] font-medium mb-[8px]" style={{ color: currentSandbox.card.color }}>{currentSandbox.card.title}</div>
              <div className="grid grid-cols-2 gap-[8px]">
                {currentSandbox.card.items.map((item, index) => (
                  <div key={index} className="bg-white rounded-[4px] p-[8px] flex justify-between items-center">
                    <span className="text-[11px] text-[#666666]">{item.label}</span>
                    <span className="text-[14px] font-semibold" style={{ color: currentSandbox.card.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 攻坚小区推荐 */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
            <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
              {communitySectionTitle}
              {scenario === 'traffic' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-[#999999] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[420px] text-[12px] leading-[20px] p-4 bg-white border border-[#e5e7eb] shadow-lg text-[#333333]">
                      <div className="font-medium mb-2">推荐小区筛选规则</div>
                      <div className="text-[#666666] mb-2">满足以下任一标签阈值的小区，按综合优先级排序取推荐数量：</div>
                      <div className="space-y-1.5 text-[#666666]">
                        <div><span className="text-[#333333] font-medium">异网高风险小区</span>：异网主卡客户数/小区内客户数 ≥ 25%<span className="text-[#999999] ml-1">（权重4）</span></div>
                        <div><span className="text-[#333333] font-medium">流量超套高发小区</span>：流量超套客户数/小区内客户数 ≥ 20%<span className="text-[#999999] ml-1">（权重3）</span></div>
                        <div><span className="text-[#333333] font-medium">流量低饱和小区</span>：低饱和客户数/小区内客户数 ≥ 20%<span className="text-[#999999] ml-1">（权重2）</span></div>
                        <div><span className="text-[#333333] font-medium">流量零低小区</span>：零低流量客户数/小区内客户数 ≥ 30%<span className="text-[#999999] ml-1">（权重1）</span></div>
                      </div>
                      <div className="border-t border-[#e5e7eb] my-2" />
                      <div className="font-medium mb-2">排名计算公式</div>
                      <div className="text-[#666666] space-y-1">
                        <div><span className="text-[#333333] font-medium">第一排序键（降序）</span>：覆盖维度 = Σ(标签i = 是 ? 1 : 0)，i ∈ &#123;低饱和, 零低, 超套高发, 异网高风险&#125;</div>
                        <div><span className="text-[#333333] font-medium">第二排序键（降序）</span>：权重得分 = Σ(标签i = 是 ? 权重i : 0)，权重：异网高风险(4) &gt; 超套高发(3) &gt; 低饱和(2) &gt; 零低(1)</div>
                        <div><span className="text-[#333333] font-medium">第三排序键（升序）</span>：小区名称拼音</div>
                      </div>
                      <div className="border-t border-[#e5e7eb] my-2" />
                      <div className="font-medium mb-1.5">举例</div>
                      <div className="text-[#666666] space-y-1">
                        <div>大巴扎小区：低饱和(是)+超套(是)+异网(是) → 覆盖维度3，权重得分9</div>
                        <div>南湖小区：低饱和(是)+零低(是)+超套(是) → 覆盖维度3，权重得分6</div>
                        <div>北站小区：超套(是)+异网(是) → 覆盖维度2，权重得分7</div>
                        <div className="text-[#999999] mt-1">排名：大巴扎(3,9) &gt; 南湖(3,6) &gt; 北站(2,7)</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>

            {/* 标题行 */}
            <div className="flex items-center justify-between mb-[12px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-[14px] font-medium text-[#333333]">{communityData.sectionSubtitle}</span>
                <span className="text-[12px] font-medium text-[#1677FF] bg-[rgba(22,119,255,0.1)] px-[8px] py-[2px] rounded-[12px]">{communityData.sectionCount}</span>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[#999999] hover:text-[#1677FF] transition-all"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* 表格 */}
            <div className="mb-[12px] w-full overflow-x-hidden">
              <table className="w-full border-collapse text-[12px]" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th className="w-[32px] text-center px-[4px] py-[8px] bg-[rgba(0,0,0,0.02)] font-semibold text-[#666666] border-b border-[#E8E8E8]">
                      <input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} className="w-[14px] h-[14px] cursor-pointer" />
                    </th>
                    <th className="w-[30%] text-left px-[8px] py-[8px] bg-[rgba(0,0,0,0.02)] font-semibold text-[#666666] border-b border-[#E8E8E8]">小区名称</th>
                    <th className="text-left px-[8px] py-[8px] bg-[rgba(0,0,0,0.02)] font-semibold text-[#666666] border-b border-[#E8E8E8]">{scenario === 'traffic' ? '特征标签' : '小区类型'}</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedCommunities.map(community => (
                    <tr key={community.id} className="hover:bg-[rgba(22,119,255,0.02)] transition-colors">
                      <td className="text-center px-[4px] py-[8px] border-b border-[#E8E8E8]">
                        <input type="checkbox" checked={selectedCommunities.includes(community.id)} onChange={(e) => handleCommunitySelect(community.id, e.target.checked)} className="w-[14px] h-[14px] cursor-pointer" />
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        <span 
                          className="text-[#1677FF] cursor-pointer hover:underline" 
                          onClick={(e) => { e.stopPropagation(); onCommunityClick?.(community); }}
                        >
                          {community.name}
                        </span>
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        {scenario === 'traffic' ? (
                          <div className="flex flex-wrap gap-1">
                            {getTrafficTags(community).map((tag, idx) => (
                              <span key={idx} className={`text-[10px] px-[6px] py-[2px] rounded-full ${tag.color}`}>{tag.label}</span>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-[10px] px-[6px] py-[2px] rounded-full ${getCommunityTypeColor(community.type)}`}>
                            {community.type}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {expanded && expandedCommunities.map(community => (
                    <tr key={community.id} className="hover:bg-[rgba(22,119,255,0.02)] transition-colors">
                      <td className="text-center px-[4px] py-[8px] border-b border-[#E8E8E8]">
                        <input type="checkbox" checked={selectedCommunities.includes(community.id)} onChange={(e) => handleCommunitySelect(community.id, e.target.checked)} className="w-[14px] h-[14px] cursor-pointer" />
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        <span 
                          className="text-[#1677FF] cursor-pointer hover:underline" 
                          onClick={(e) => { e.stopPropagation(); onCommunityClick?.(community); }}
                        >
                          {community.name}
                        </span>
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        {scenario === 'traffic' ? (
                          <div className="flex flex-wrap gap-1">
                            {getTrafficTags(community).map((tag, idx) => (
                              <span key={idx} className={`text-[10px] px-[6px] py-[2px] rounded-full ${tag.color}`}>{tag.label}</span>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-[10px] px-[6px] py-[2px] rounded-full ${getCommunityTypeColor(community.type)}`}>
                            {community.type}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 底部操作 */}
            <div className="flex justify-end gap-[12px] pt-[12px] border-t border-[#E8E8E8]">
              <button onClick={onDispatch} className="px-[16px] py-[8px] bg-[#1677FF] text-white border-none rounded-[6px] text-[14px] font-medium cursor-pointer transition-all hover:bg-[#4096FF] hover:-translate-y-px flex items-center gap-[6px]">
                一键派单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
