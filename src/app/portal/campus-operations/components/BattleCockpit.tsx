'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  Building2, Wifi, Info,
  Users, Target,
  ChevronLeft, ChevronRight, MapPin, ChevronDown
} from 'lucide-react';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { useMounted } from '@/hooks/useMounted';

// 作战沙盘数据
const overviewDataByPeriod: Record<string, {
  outreach: string; community: string; insert: string; insertCommunity: string;
  holographicTask: string; dispatchCommunity: string; dispatchCount: string; dispatchRate: string;
}> = {
  current: {
    outreach: '321次', community: '21个', insert: '36次', insertCommunity: '12个',
    holographicTask: '28个', dispatchCommunity: '15个', dispatchCount: '156次', dispatchRate: '87.5%'
  },
  last: {
    outreach: '285次', community: '18个', insert: '42次', insertCommunity: '15个',
    holographicTask: '23个', dispatchCommunity: '12个', dispatchCount: '132次', dispatchRate: '82.3%'
  },
  year: {
    outreach: '3,856次', community: '156个', insert: '412次', insertCommunity: '89个',
    holographicTask: '312个', dispatchCommunity: '98个', dispatchCount: '1,892次', dispatchRate: '91.2%'
  }
};

// 流量攻坚小区推荐数据
const recommendedCommunities = [
  { id: 1, name: '解放路小区', type: '高流量需求低渗透', info: '流量需求：85GB\n流量渗透：28%' },
  { id: 2, name: '大巴扎小区', type: '5G终端高占比低迁转', info: '5G终端占比：72%\n5G迁转率：15%' },
  { id: 3, name: '黄河小区', type: '竞对流量促销热点', info: '竞对促销密度：8次/月\n客户流失率：12%' },
  { id: 4, name: '开发区花园', type: '高校流量潜力', info: '在校生：2.3万人\n月均DOU：45GB' },
  { id: 5, name: '南湖小区', type: '高流量需求低渗透', info: '流量需求：92GB\n流量渗透：22%' },
  { id: 6, name: '友好北路小区', type: '5G终端高占比低迁转', info: '5G终端占比：68%\n5G迁转率：18%' },
];

const expandedCommunities = [
  { id: 7, name: '北站小区', type: '竞对流量促销热点', info: '竞对促销密度：6次/月\n客户流失率：9%' },
  { id: 8, name: '浑河花园', type: '高校流量潜力', info: '在校生：1.8万人\n月均DOU：52GB' },
  { id: 9, name: '大东小区', type: '高流量需求低渗透', info: '流量需求：78GB\n流量渗透：31%' },
  { id: 10, name: '于洪新城', type: '5G终端高占比低迁转', info: '5G终端占比：65%\n5G迁转率：20%' },
];


interface BattleCockpitProps {
  visible: boolean;
  onToggleVisible: () => void;
  regionDisplay: string;
  onDispatch?: () => void;
  // 区域选择相关
  regionValue?: { cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean };
  onRegionChange?: (cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => void;
}

export default function BattleCockpit({ 
  visible, 
  onToggleVisible, 
  regionDisplay, 
  onDispatch,
  regionValue,
  onRegionChange,
}: BattleCockpitProps) {
  const mounted = useMounted();
  const [timePeriod, setTimePeriod] = useState<'current' | 'last' | 'year'>('current');
  const [expanded, setExpanded] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const currentData = overviewDataByPeriod[timePeriod];

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
          {/* 流量重点指标 */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
            <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
              流量重点指标
            </h3>
            <div className="grid grid-cols-2 gap-[12px]">
              <div className="bg-[#E5F0FF] rounded-[8px] p-[12px]">
                <div className="text-[12px] text-[#666666] mb-[4px]">流量用户到达</div>
                <div className="text-[24px] font-bold text-[#333333]">12,800<span className="text-[12px] text-[#666666] ml-[4px]">户</span></div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[12px] text-[#666666]">渗透率</span>
                  <span className="text-[16px] font-bold text-[#F59E0B]">42%</span>
                  <span className="text-[11px] text-[#52C41A]">↑ +1.5pp</span>
                </div>
              </div>
              <div className="bg-[#E5F0FF] rounded-[8px] p-[12px]">
                <div className="text-[12px] text-[#666666] mb-[4px]">5G用户</div>
                <div className="text-[24px] font-bold text-[#333333]">8,600<span className="text-[12px] text-[#666666] ml-[4px]">户</span></div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[12px] text-[#666666]">渗透率</span>
                  <span className="text-[16px] font-bold text-[#5E6AD2]">67%</span>
                  <span className="text-[11px] text-[#52C41A]">↑ +2.3pp</span>
                </div>
              </div>
              <div className="bg-[#E5F0FF] rounded-[8px] p-[12px]">
                <div className="text-[12px] text-[#666666] mb-[4px]">月均DOU</div>
                <div className="text-[24px] font-bold text-[#333333]">18.6<span className="text-[12px] text-[#666666] ml-[4px]">GB</span></div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[12px] text-[#666666]">环比</span>
                  <span className="text-[16px] font-bold text-[#52C41A]">+8.2%</span>
                  <span className="text-[11px] text-[#52C41A]">↑ +1.8GB</span>
                </div>
              </div>
              <div className="bg-[#E5F0FF] rounded-[8px] p-[12px]">
                <div className="text-[12px] text-[#666666] mb-[4px]">市公司DOU均值</div>
                <div className="text-[24px] font-bold text-[#333333]">20.2<span className="text-[12px] text-[#666666] ml-[4px]">GB</span></div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <span className="text-[12px] text-[#666666]">差距</span>
                  <span className="text-[16px] font-bold text-[#FF4D4F]">-1.6GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 流量攻坚区域各类型分布 */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
            <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
              流量攻坚区域（5,000个）
            </h3>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                { label: '高流量需求低渗透', value: '186个', color: '#FF4D4F' },
                { label: '5G终端高占比低迁转', value: '142个', color: '#FA8C16' },
                { label: '竞对流量促销热点', value: '98个', color: '#722ED1' },
                { label: '高校流量潜力区域', value: '65个', color: '#1677FF' },
              ].map((item, i) => (
                <div key={i} className="bg-[#F5F7FA] rounded-[8px] p-[12px] flex items-center justify-between">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[12px] text-[#666666]">{item.label}</span>
                  </div>
                  <span className="text-[16px] font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

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

            {/* 流量攻坚 */}
            <div className="rounded-[8px] p-[12px] mb-[10px]" style={{ background: '#E5F0FF' }}>
              <div className="text-[12px] font-medium text-[#1677FF] mb-[8px]">流量攻坚</div>
              <div className="grid grid-cols-2 gap-[8px]">
                {[
                  { label: '流量攻坚活动', value: currentData.outreach },
                  { label: '攻坚小区', value: currentData.community },
                  { label: '流量提升任务', value: currentData.insert },
                  { label: '提升小区', value: currentData.insertCommunity },
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-[4px] p-[8px] flex justify-between items-center">
                    <span className="text-[11px] text-[#666666]">{item.label}</span>
                    <span className="text-[14px] font-semibold text-[#1677FF]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 流量派单 */}
            <div className="rounded-[8px] p-[12px]" style={{ background: '#EDF9F2' }}>
              <div className="text-[12px] font-medium text-[#52C41A] mb-[8px]">流量派单</div>
              <div className="grid grid-cols-2 gap-[8px]">
                {[
                  { label: '流量派单任务', value: currentData.holographicTask },
                  { label: '派单小区', value: currentData.dispatchCommunity },
                  { label: '派单次数', value: currentData.dispatchCount },
                  { label: '派单完成率', value: currentData.dispatchRate },
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-[4px] p-[8px] flex justify-between items-center">
                    <span className="text-[11px] text-[#666666]">{item.label}</span>
                    <span className="text-[14px] font-semibold text-[#52C41A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 流量攻坚小区推荐 */}
          <div className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
            <h3 className="text-[16px] font-semibold text-[#333333] mb-[12px] flex items-center gap-[8px]" style={{ borderLeft: '4px solid #1677FF', paddingLeft: '8px' }}>
              流量攻坚小区推荐
            </h3>

            {/* 标题行 */}
            <div className="flex items-center justify-between mb-[12px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-[14px] font-medium text-[#333333]">高流量需求低渗透区域</span>
                <span className="text-[12px] font-medium text-[#1677FF] bg-[rgba(22,119,255,0.1)] px-[8px] py-[2px] rounded-[12px]">20个</span>
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
                    <th className="text-left px-[8px] py-[8px] bg-[rgba(0,0,0,0.02)] font-semibold text-[#666666] border-b border-[#E8E8E8]">小区类型</th>
                    <th className="w-[25%] text-center px-[8px] py-[8px] bg-[rgba(0,0,0,0.02)] font-semibold text-[#666666] border-b border-[#E8E8E8]">其他信息</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedCommunities.map(community => (
                    <tr key={community.id} className="hover:bg-[rgba(22,119,255,0.02)] transition-colors">
                      <td className="text-center px-[4px] py-[8px] border-b border-[#E8E8E8]">
                        <input type="checkbox" checked={selectedCommunities.includes(community.id)} onChange={(e) => handleCommunitySelect(community.id, e.target.checked)} className="w-[14px] h-[14px] cursor-pointer" />
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8] text-[#333333]">{community.name}</td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        <span className={`text-[10px] px-[6px] py-[2px] rounded-full ${
                          community.type === '高流量需求低渗透' ? 'bg-red-50 text-[#FF4D4F]' :
                          community.type === '5G终端高占比低迁转' ? 'bg-orange-50 text-orange-600' :
                          community.type === '竞对流量促销热点' ? 'bg-purple-50 text-purple-600' :
                          'bg-[rgba(22,119,255,0.08)] text-[#1677FF]'
                        }`}>
                          {community.type}
                        </span>
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8] text-[#999999] whitespace-pre-line text-[10px]">{community.info}</td>
                    </tr>
                  ))}
                  {expanded && expandedCommunities.map(community => (
                    <tr key={community.id} className="hover:bg-[rgba(22,119,255,0.02)] transition-colors">
                      <td className="text-center px-[4px] py-[8px] border-b border-[#E8E8E8]">
                        <input type="checkbox" checked={selectedCommunities.includes(community.id)} onChange={(e) => handleCommunitySelect(community.id, e.target.checked)} className="w-[14px] h-[14px] cursor-pointer" />
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8] text-[#333333]">{community.name}</td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8]">
                        <span className={`text-[10px] px-[6px] py-[2px] rounded-full ${
                          community.type === '高流量需求低渗透' ? 'bg-red-50 text-[#FF4D4F]' :
                          community.type === '5G终端高占比低迁转' ? 'bg-orange-50 text-orange-600' :
                          community.type === '竞对流量促销热点' ? 'bg-purple-50 text-purple-600' :
                          'bg-[rgba(22,119,255,0.08)] text-[#1677FF]'
                        }`}>
                          {community.type}
                        </span>
                      </td>
                      <td className="px-[8px] py-[8px] border-b border-[#E8E8E8] text-[#999999] whitespace-pre-line text-[10px]">{community.info}</td>
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
