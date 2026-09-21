'use client';

import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp,
  List, Check, MapPin,
  Pentagon, Circle, Pen, Trash2, X
} from 'lucide-react';


// 模拟小区列表数据
const communityListData = [
  { id: 'C1001', name: '解放路小区', type: 'highDemandLowPenetration', address: '新疆维吾尔自治区乌鲁木齐天山区解放路街道解放路小区', householdCount: 152, penetration: 32.5, share: 28.3 },
  { id: 'C1002', name: '大巴扎小区', type: 'high5GLowMigration', address: '新疆维吾尔自治区乌鲁木齐沙依巴克区大巴扎街道大巴扎小区', householdCount: 118, penetration: 45.2, share: 35.7 },
  { id: 'C1003', name: '黄河小区', type: 'competitorPromotion', address: '新疆维吾尔自治区乌鲁木齐新市区北京路黄河小区', householdCount: 196, penetration: 28.9, share: 22.1 },
  { id: 'C1004', name: '开发区花园', type: 'universityPotential', address: '新疆维吾尔自治区乌鲁木齐水磨沟区开发区中心开发区花园', householdCount: 245, penetration: 38.7, share: 30.5 },
  { id: 'C1005', name: '南湖小区', type: 'highDemandLowPenetration', address: '新疆维吾尔自治区乌鲁木齐头屯河区南湖街道南湖小区', householdCount: 103, penetration: 52.3, share: 40.2 },
];

interface OperationPanelProps {
  visible: boolean;
  onToggleVisible: () => void;
  onShowCommunityPortrait: (community: typeof communityListData[0]) => void;
  circleSelectionCompleted: boolean;
  activeDrawTool: 'polygon' | 'circle' | 'rectangle' | null;
  onStartDrawing: (mode: 'polygon' | 'circle' | 'rectangle') => void;
  onCompleteDrawing: () => void;
  onDeleteLastOverlay: () => void;
  onClearAllOverlays: () => void;
  drawnOverlaysCount: number;
  onDispatch?: () => void;
}

export default function OperationPanel({
  visible,
  onToggleVisible,
  onShowCommunityPortrait,
  circleSelectionCompleted,
  activeDrawTool,
  onStartDrawing,
  onCompleteDrawing,
  onDeleteLastOverlay,
  onClearAllOverlays,
  drawnOverlaysCount,
  onDispatch,
}: OperationPanelProps) {
  const [operationPanelVisible, setOperationPanelVisible] = useState(true);
  const [communityListVisible, setCommunityListVisible] = useState(true);

  // 筛选状态
  const [sections, setSections] = useState({
    preciseFilter: true,
    customFilter: true,
    customerTag: true,
  });

  const [logicOperator, setLogicOperator] = useState<'and' | 'or'>('and');
  const [preciseFilters, setPreciseFilters] = useState<string[]>([]);
  const [communityTagLogic, setCommunityTagLogic] = useState<'and' | 'or' | 'none'>('and');

  // AOI条件筛选
  const [trafficPenetrationOperator, setTrafficPenetrationOperator] = useState('>');
  const [trafficPenetrationValue, setTrafficPenetrationValue] = useState('');
  const [minShare, setMinShare] = useState('');
  const [maxShare, setMaxShare] = useState('');
  const [minDou, setMinDou] = useState('');
  const [maxDou, setMaxDou] = useState('');
  const [min5gUsers, setMin5gUsers] = useState('');
  const [max5gUsers, setMax5gUsers] = useState('');
  const [minDataQuotaUsers, setMinDataQuotaUsers] = useState('');
  const [maxDataQuotaUsers, setMaxDataQuotaUsers] = useState('');
  const [trafficUserOperator, setTrafficUserOperator] = useState('>');
  const [trafficUserValue, setTrafficUserValue] = useState('');
  const [minNewUsers, setMinNewUsers] = useState('');
  const [maxNewUsers, setMaxNewUsers] = useState('');

  // 客户标签
  const [customerType, setCustomerType] = useState<'trafficUser' | 'highDou'>('trafficUser');
  const [customerLogic, setCustomerLogic] = useState<'and' | 'or' | 'none'>('and');
  const [userDistribution, setUserDistribution] = useState<string[]>([]);
  const [globalPass, setGlobalPass] = useState('no');
  const [globalPassLevel, setGlobalPassLevel] = useState<string[]>([]);
  const [cloudBroadband, setCloudBroadband] = useState('');
  const [hasFttr, setHasFttr] = useState('');
  const [hasIptv, setHasIptv] = useState('');
  const [broadbandSpeed, setBroadbandSpeed] = useState<string[]>([]);
  const [expiryMonth, setExpiryMonth] = useState<string[]>([]);
  const [touchInfoTags, setTouchInfoTags] = useState<string[]>([]);

  // 小区列表
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSection = (section: keyof typeof sections) => {
    setSections({ ...sections, [section]: !sections[section] });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCommunities(communityListData.map(c => c.id));
    } else {
      setSelectedCommunities([]);
    }
  };

  const handleCommunitySelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCommunities([...selectedCommunities, id]);
    } else {
      setSelectedCommunities(selectedCommunities.filter(cid => cid !== id));
    }
  };

  const resetFilters = () => {
    setPreciseFilters([]);
    setTrafficPenetrationValue('');
    setMinShare(''); setMaxShare('');
    setMinDou(''); setMaxDou('');
    setMin5gUsers(''); setMax5gUsers('');
    setMinDataQuotaUsers(''); setMaxDataQuotaUsers('');
    setTrafficUserValue('');
    setMinNewUsers(''); setMaxNewUsers('');
    setCustomerType('trafficUser');
    setUserDistribution([]);
    setGlobalPass('no');
    setGlobalPassLevel([]);
    setCloudBroadband('');
    setHasFttr(''); setHasIptv('');
    setBroadbandSpeed([]);
    setExpiryMonth([]);
    setTouchInfoTags([]);
  };

  if (!visible) return null;

  return (
    <div className="absolute top-0 right-[16px] z-[11] w-[350px] h-full bg-[rgba(255,255,255,0.95)] border border-[#E8E8E8] rounded-[16px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
    }}>
      {/* 运营作业面板 */}
      <div className={`flex flex-col shrink-0 ${operationPanelVisible ? 'max-h-[50%]' : ''} overflow-hidden transition-all duration-300 border-b border-[#E8E8E8]`}>
        {/* 面板头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E8] bg-gradient-to-r from-blue-50 to-white shrink-0">
          <h3 className="text-[14px] font-semibold text-[#666666] flex items-center gap-2">
            <List className="w-4 h-4 text-[#1677FF]" /> 运营作业
          </h3>
          <button
            onClick={() => setOperationPanelVisible(!operationPanelVisible)}
            className="px-3 py-1 text-xs rounded bg-[#f0f0f0] hover:bg-[#E8E8E8] text-[#666666] cursor-pointer transition-all"
          >
            {operationPanelVisible ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* 面板内容 - 内部滚动 */}
        {operationPanelVisible && (
          <div className="flex-1 overflow-y-auto min-h-0" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
          }}>
            {/* 精准作战区域筛选 */}
            <div className="px-4 pt-3">
              <div className="text-[14px] font-semibold text-[#666666] mb-2 pl-2" style={{ borderLeft: '3px solid #1677FF', paddingLeft: '8px' }}>精准作战区域筛选</div>
            </div>

            {/* 标签筛选 */}
            <div className="px-4 py-2">
              <div className="bg-[rgba(0,0,0,0.02)] rounded-[8px] p-3 border border-[rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleSection('preciseFilter')}>
                  <span className="text-[14px] font-semibold text-[#666666]">标签</span>
                  <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${sections.preciseFilter ? '' : '-rotate-90'}`} />
                </div>
                {sections.preciseFilter && (
                  <>
                    <div className="flex justify-end mb-2">
                      <div className="flex gap-1 border border-[#E8E8E8] rounded overflow-hidden">
                        <button
                          onClick={() => setLogicOperator('and')}
                          className={`px-3 py-1 text-xs cursor-pointer ${logicOperator === 'and' ? 'bg-[#1677FF] text-white' : 'bg-white text-[#333333]'}`}
                        >且</button>
                        <button
                          onClick={() => setLogicOperator('or')}
                          className={`px-3 py-1 text-xs cursor-pointer ${logicOperator === 'or' ? 'bg-[#1677FF] text-white' : 'bg-white text-[#333333]'}`}
                        >或</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {[
                        { key: 'highDemandLowPenetration', label: '高流量需求低渗透' },
                        { key: 'high5GLowMigration', label: '5G终端高占比低迁转' },
                        { key: 'competitorPromotion', label: '竞对流量促销热点' },
                        { key: 'universityPotential', label: '高校流量潜力' },
                      ].map(item => (
                        <span
                          key={item.key}
                          onClick={() => {
                            if (preciseFilters.includes(item.key)) setPreciseFilters(preciseFilters.filter(f => f !== item.key));
                            else setPreciseFilters([...preciseFilters, item.key]);
                          }}
                          className={`px-[8px] py-[4px] border rounded-[4px] text-[12px] cursor-pointer transition-all ${
                            preciseFilters.includes(item.key)
                              ? 'bg-[#1677FF] border-[#1677FF] text-white'
                              : 'bg-white border-[#E8E8E8] text-[#333333] hover:border-[#1677FF]'
                          }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AOI区域圈选 */}
            <div className="px-4 pt-3">
              <div className="text-[14px] font-semibold text-[#666666] mb-2 pl-2" style={{ borderLeft: '3px solid #1677FF', paddingLeft: '8px' }}>AOI区域圈选</div>
            </div>

            <div className="px-4 py-2">
              <div className="bg-[rgba(0,0,0,0.02)] rounded-[8px] p-3 border border-[rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('customFilter')}>
                  <span className="text-[14px] font-semibold text-[#666666]">圈选工具</span>
                  <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${sections.customFilter ? '' : '-rotate-90'}`} />
                </div>
                {sections.customFilter && (
                  <div className="space-y-3">
                    {/* 绘制工具按钮组 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartDrawing('polygon')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                          activeDrawTool === 'polygon'
                            ? 'bg-[#1677FF] text-white shadow-[0_2px_4px_rgba(22,119,255,0.3)]'
                            : 'bg-white border border-[#E8E8E8] text-[#333333] hover:border-[#1677FF] hover:text-[#1677FF]'
                        }`}
                      >
                        <Pentagon className="w-3.5 h-3.5" />
                        多边形
                      </button>
                      <button
                        onClick={() => onStartDrawing('circle')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                          activeDrawTool === 'circle'
                            ? 'bg-[#1677FF] text-white shadow-[0_2px_4px_rgba(22,119,255,0.3)]'
                            : 'bg-white border border-[#E8E8E8] text-[#333333] hover:border-[#1677FF] hover:text-[#1677FF]'
                        }`}
                      >
                        <Circle className="w-3.5 h-3.5" />
                        圆形
                      </button>
                      <button
                        onClick={() => onStartDrawing('rectangle')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                          activeDrawTool === 'rectangle'
                            ? 'bg-[#1677FF] text-white shadow-[0_2px_4px_rgba(22,119,255,0.3)]'
                            : 'bg-white border border-[#E8E8E8] text-[#333333] hover:border-[#1677FF] hover:text-[#1677FF]'
                        }`}
                      >
                        <Pen className="w-3.5 h-3.5" />
                        矩形
                      </button>
                    </div>

                    {/* 绘制操作按钮 */}
                    {activeDrawTool && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={onCompleteDrawing}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[12px] font-medium bg-[#52C41A] text-white hover:opacity-90 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> 完成
                        </button>
                        <button
                          onClick={onDeleteLastOverlay}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[12px] font-medium bg-[rgba(245,158,11,0.1)] text-[#D97706] hover:opacity-80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 撤销
                        </button>
                        <button
                          onClick={onClearAllOverlays}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[12px] font-medium bg-[rgba(255,77,79,0.1)] text-[#FF4D4F] hover:opacity-80 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> 清空
                        </button>
                      </div>
                    )}

                    {/* 已圈选区域提示 */}
                    {drawnOverlaysCount > 0 && !activeDrawTool && (
                      <div className="bg-[#E5F0FF] rounded-[6px] px-3 py-2 flex items-center justify-between">
                        <span className="text-[12px] text-[#1677FF]">已圈选 {drawnOverlaysCount} 个区域</span>
                        <button
                          onClick={onClearAllOverlays}
                          className="text-[12px] text-[#999999] hover:text-[#FF4D4F] cursor-pointer transition-colors"
                        >
                          清除全部
                        </button>
                      </div>
                    )}

                    {/* 使用提示 */}
                    {!activeDrawTool && drawnOverlaysCount === 0 && (
                      <div className="text-[12px] text-[#999999] leading-[1.6]">
                        点击上方工具按钮，在地图上绘制区域进行圈选。支持多边形、圆形和矩形三种绘制方式。
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 客户标签筛选 */}
            <div className="px-4 pt-2">
              <div className="text-[14px] font-semibold text-[#666666] mb-2 pl-2" style={{ borderLeft: '3px solid #1677FF', paddingLeft: '8px' }}>客户标签筛选</div>
            </div>

            <div className="px-4 py-2">
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-3 border border-blue-50">
                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => toggleSection('customerTag')}>
                  <span className="text-sm font-bold text-gray-700">客户标签</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sections.customerTag ? '' : '-rotate-90'}`} />
                </div>
                {sections.customerTag && (
                  <div className="space-y-3">
                    {/* 客户类型 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">客户类型：</span>
                      <div className="flex gap-1 border border-gray-200 rounded overflow-hidden">
                        <button
                          onClick={() => setCustomerType('trafficUser')}
                          className={`px-3 py-1 text-xs ${customerType === 'trafficUser' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                        >流量客户</button>
                        <button
                          onClick={() => setCustomerType('highDou')}
                          className={`px-3 py-1 text-xs ${customerType === 'highDou' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                        >高DOU客户</button>
                      </div>
                    </div>
                    {/* 逻辑条件 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">逻辑条件：</span>
                      <div className="flex gap-1 border border-gray-200 rounded overflow-hidden">
                        {(['and', 'or', 'none'] as const).map(op => (
                          <button
                            key={op}
                            onClick={() => setCustomerLogic(op)}
                            className={`px-3 py-1 text-xs ${customerLogic === op ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                          >{op === 'and' ? '且' : op === 'or' ? '或' : '非'}</button>
                        ))}
                      </div>
                    </div>

                    {/* 流量客户模式 */}
                    {customerType === 'trafficUser' && (
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-gray-600 pl-2 border-l-3 border-blue-400 bg-blue-50/50 py-1">基础信息</div>
                        {/* 年龄分布 */}
                        <div>
                          <span className="text-xs text-gray-500 mb-1 block">年龄分布：</span>
                          <div className="space-y-1">
                            {[
                              { key: 'young', label: '青年（18-35岁）' },
                              { key: 'middle', label: '中年（36-60岁）' },
                              { key: 'elderly', label: '老年（60岁以上）' },
                            ].map(item => (
                              <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={userDistribution.includes(item.key)}
                                  onChange={(e) => {
                                    if (e.target.checked) setUserDistribution([...userDistribution, item.key]);
                                    else setUserDistribution(userDistribution.filter(d => d !== item.key));
                                  }}
                                  className="rounded"
                                />
                                {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* 是否全球通 */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">是否全球通客户：</span>
                          <div className="flex gap-1">
                            <label className="flex items-center gap-1 text-xs text-gray-600"><input type="radio" name="globalPass" value="yes" checked={globalPass === 'yes'} onChange={() => setGlobalPass('yes')} className="mr-0.5" />是</label>
                            <label className="flex items-center gap-1 text-xs text-gray-600"><input type="radio" name="globalPass" value="no" checked={globalPass === 'no'} onChange={() => setGlobalPass('no')} className="mr-0.5" />否</label>
                          </div>
                        </div>
                        {globalPass === 'yes' && (
                          <div>
                            <span className="text-xs text-gray-500 mb-1 block">全球通等级：</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { key: 'diamond', label: '钻卡' },
                                { key: 'gold', label: '金卡' },
                                { key: 'silver', label: '银卡' },
                                { key: 'normal', label: '普通' },
                              ].map(item => (
                                <label key={item.key} className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={globalPassLevel.includes(item.key)}
                                    onChange={(e) => {
                                      if (e.target.checked) setGlobalPassLevel([...globalPassLevel, item.key]);
                                      else setGlobalPassLevel(globalPassLevel.filter(l => l !== item.key));
                                    }}
                                    className="rounded"
                                  />
                                  {item.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* 客户标签组 */}
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          {[
                            { label: '达量预警用户', key: 'dataQuotaWarning' },
                            { label: '地板价高流量', key: 'lowPriceHighTraffic' },
                            { label: '5G终端未迁转', key: 'fiveGNotMigrated' },
                            { label: '流量包用户', key: 'dataPackageUser' },
                            { label: '大流量用户', key: 'highTrafficUser' },
                            { label: '竞对促销敏感', key: 'competitorSensitive' },
                            { label: '5G套餐用户', key: 'fiveGPlanUser' },
                            { label: '流量加油包到期', key: 'dataAddonExpiring' },
                            { label: '套餐升档到期', key: 'upgradeExpiring' },
                            { label: '合约到期续约', key: 'contractExpiring' },
                          ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{item.label}：</span>
                              <div className="flex gap-1">
                                <label className="flex items-center gap-0.5 text-xs text-gray-600"><input type="radio" name={item.key} value="yes" className="mr-0.5" />是</label>
                                <label className="flex items-center gap-0.5 text-xs text-gray-600"><input type="radio" name={item.key} value="no" className="mr-0.5" />否</label>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* 触达信息 */}
                        <div className="text-xs font-semibold text-gray-600 pl-2 border-l-3 border-blue-400 bg-blue-50/50 py-1">触达信息</div>
                        <div className="space-y-1">
                          {[
                            { key: 'sensitive_customer', label: '剔除全息打标敏感客户' },
                            { key: 'protected_customer', label: '剔除免打扰重保客户' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={touchInfoTags.includes(item.key)} onChange={(e) => { if (e.target.checked) setTouchInfoTags([...touchInfoTags, item.key]); else setTouchInfoTags(touchInfoTags.filter(t => t !== item.key)); }} className="rounded" />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 高DOU客户模式 */}
                    {customerType === 'highDou' && (
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-gray-600 pl-2 border-l-3 border-blue-400 bg-blue-50/50 py-1">基础信息</div>
                        <div>
                          <span className="text-xs text-gray-500 mb-1 block">DOU区间：</span>
                          <div className="space-y-1">
                            {[
                              { key: 'lowDou', label: '低DOU（10GB以下）' },
                              { key: 'midDou', label: '中DOU（10-30GB）' },
                              { key: 'highDou', label: '高DOU（30GB以上）' },
                            ].map(item => (
                              <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={broadbandSpeed.includes(item.key)} onChange={(e) => { if (e.target.checked) setBroadbandSpeed([...broadbandSpeed, item.key]); else setBroadbandSpeed(broadbandSpeed.filter(s => s !== item.key)); }} className="rounded" />
                                {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        {[
                          { label: '5G套餐用户', state: hasFttr, setter: setHasFttr },
                          { label: '流量包合约用户', state: hasIptv, setter: setHasIptv },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{item.label}：</span>
                            <div className="flex gap-1">
                              <label className="flex items-center gap-0.5 text-xs text-gray-600"><input type="radio" name={item.label} value="yes" className="mr-0.5" />是</label>
                              <label className="flex items-center gap-0.5 text-xs text-gray-600"><input type="radio" name={item.label} value="no" className="mr-0.5" />否</label>
                            </div>
                          </div>
                        ))}
                        <div>
                          <span className="text-xs text-gray-500 mb-1 block">流量包合约到期：</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { key: 'current', label: '当月' },
                              { key: 'next', label: '下月' },
                              { key: 'nextNext', label: '下下月' },
                              { key: 'twoMonthsLater', label: '3个月及以上' },
                            ].map(item => (
                              <label key={item.key} className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={expiryMonth.includes(item.key)} onChange={(e) => { if (e.target.checked) setExpiryMonth([...expiryMonth, item.key]); else setExpiryMonth(expiryMonth.filter(m => m !== item.key)); }} className="rounded" />
                                {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 mb-1 block">流量使用特征：</span>
                          <div className="space-y-1">
                            {[
                              { key: 'noRouter', label: '达量降速用户' },
                              { key: 'oldRouter', label: '频繁订购加油包' },
                              { key: 'signalDeadZone', label: '夜间高流量' },
                              { key: 'frequentLag', label: '视频流量占比高' },
                            ].map(item => (
                              <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                <input type="checkbox" className="rounded" />
                                {item.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        {/* 触达信息 */}
                        <div className="text-xs font-semibold text-gray-600 pl-2 border-l-3 border-blue-400 bg-blue-50/50 py-1">触达信息</div>
                        <div className="space-y-1">
                          {[
                            { key: 'block_request', label: '主动要求屏蔽客户' },
                            { key: 'sensitive_complaint', label: '敏感投诉客户' },
                            { key: 'group_company', label: '集团公司客户' },
                            { key: 'beijing_company', label: '乌鲁木齐分公司客户' },
                            { key: 'important', label: '重要客户' },
                            { key: 'service_guarantee', label: '重要服务保障客户' },
                            { key: 'closed', label: '销号客户' },
                            { key: 'suspended', label: '停机客户' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                              <input type="checkbox" className="rounded" />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 底部按钮 */}
        {operationPanelVisible && (
          <div className="px-4 py-3 border-t border-[#E8E8E8] bg-white flex justify-end gap-2 shrink-0">
            <button onClick={resetFilters} className="px-[16px] py-[6px] border border-[#E8E8E8] rounded-[4px] text-[14px] text-[#666666] cursor-pointer bg-white hover:border-[#1677FF] hover:text-[#1677FF] transition-all">
              重置
            </button>
            <button className="px-[16px] py-[6px] bg-[#1677FF] text-white rounded-[4px] text-[14px] cursor-pointer border-[#1677FF] hover:bg-[#4096FF] transition-all">
              查询
            </button>
          </div>
        )}
      </div>

      {/* 已选小区列表面板 */}
      <div className={`flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-300`}>
        {/* 面板头部 */}
        <div className="px-4 py-3 bg-[rgba(0,0,0,0.02)] border-b border-[#E8E8E8] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-semibold text-[#666666] flex items-center gap-2">
              <List className="w-4 h-4 text-[#1677FF]" /> 小区列表
            </h3>
            <button
              onClick={() => setCommunityListVisible(!communityListVisible)}
              className="px-3 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100 text-gray-500"
            >
              {communityListVisible ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex gap-3">
            <span className="text-xs bg-blue-50 px-2 py-0.5 rounded text-blue-600">小区总数：{communityListData.length}</span>
            <span className="text-xs bg-green-50 px-2 py-0.5 rounded text-green-600">任务客户总数：30</span>
          </div>
          {circleSelectionCompleted && (
            <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
              <div><span className="text-gray-500">流量渗透率：</span><span className="font-semibold text-gray-700">42%</span></div>
              <div><span className="text-gray-500">流量客户份额：</span><span className="font-semibold text-gray-700">45%</span></div>
              <div><span className="text-gray-500">月均DOU：</span><span className="font-semibold text-gray-700">18.6GB</span></div>
            </div>
          )}
        </div>

        {/* 小区列表 - 内部滚动 */}
        {communityListVisible && (
          <div className="flex-1 overflow-y-auto min-h-0" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.2) rgba(0,0,0,0.05)',
          }}>
            <div className="px-4 py-2 space-y-2">
              {communityListData.map(community => (
                <div
                  key={community.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50/30 hover:border-blue-200 hover:translate-x-1 transition-all cursor-pointer"
                  onClick={() => onShowCommunityPortrait(community)}
                >
                  <input
                    type="checkbox"
                    checked={selectedCommunities.includes(community.id)}
                    onChange={(e) => { e.stopPropagation(); handleCommunitySelect(community.id, e.target.checked); }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600 truncate">{community.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">任务客户：{community.householdCount}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">{community.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="px-4 py-3 bg-white border-t border-[#E8E8E8] flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-xs text-[#666666] cursor-pointer">
              <input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded" />
              全选
            </label>
            <span className="text-xs text-[#666666]">已选小区：{selectedCommunities.length} 个</span>
          </div>
          <div className="flex gap-2">
            {circleSelectionCompleted && (
              <button className="px-3 py-1.5 border border-[#E8E8E8] rounded-[4px] text-xs text-[#666666] bg-white hover:border-[#1677FF] hover:text-[#1677FF] transition-all cursor-pointer">
                保存图层
              </button>
            )}
            <button
              onClick={() => selectedCommunities.length > 0 && onDispatch?.()}
              className={`px-[16px] py-[6px] rounded-[4px] text-[14px] font-medium transition-all cursor-pointer ${
                selectedCommunities.length > 0
                  ? 'bg-[#1677FF] text-white border-none hover:bg-[#4096FF]'
                  : 'bg-gray-100 text-[#999] cursor-not-allowed border-none'
              }`}
              disabled={selectedCommunities.length === 0}
            >
              派单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
