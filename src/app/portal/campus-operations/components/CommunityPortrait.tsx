'use client';

import React from 'react';
import { X, Users, Wifi, Activity, TrendingUp, Smartphone } from 'lucide-react';

interface CommunityData {
  id: string;
  name: string;
  type: string;
  address: string;
  householdCount: number;
  penetration: number;
  share: number;
}

interface CommunityPortraitProps {
  visible: boolean;
  community: CommunityData | null;
  onClose: () => void;
}

// SVG 仪表盘组件
function GaugeChart({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const percentage = Math.min(value / max, 1);
  const angle = percentage * 180;
  const radius = 50;
  const cx = 60;
  const cy = 55;

  const startAngle = Math.PI;
  const endAngle = Math.PI + (angle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  const largeArcFlag = angle > 180 ? 1 : 0;

  const bgEndAngle = Math.PI + Math.PI;
  const bx2 = cx + radius * Math.cos(bgEndAngle);
  const by2 = cy + radius * Math.sin(bgEndAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${bx2} ${by2}`} fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
        {percentage > 0 && (
          <path d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 5} textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{value}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9CA3AF" fontSize="9">{label}</text>
      </svg>
    </div>
  );
}

// SVG 柱状图组件
function BarChart({ data, color }: { data: { label: string; value: number; max: number }[]; color: string }) {
  const barWidth = 28;
  const gap = 8;
  const chartHeight = 80;
  const maxValue = Math.max(...data.map(d => d.max));

  return (
    <svg width={data.length * (barWidth + gap) + 20} height={chartHeight + 30} viewBox={`0 0 ${data.length * (barWidth + gap) + 20} ${chartHeight + 30}`}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = 10 + i * (barWidth + gap);
        const y = chartHeight - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="2" opacity={0.8} />
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fill="#6B7280" fontSize="8">{item.value}%</text>
            <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fill="#9CA3AF" fontSize="8">{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CommunityPortrait({ visible, community, onClose }: CommunityPortraitProps) {
  if (!visible || !community) return null;

  // 小区类型映射
  const typeLabelMap: Record<string, string> = {
    highDemandLowPenetration: '高流量需求低渗透',
    high5GLowMigration: '5G终端低迁转',
    competitorPromotion: '竞对流量促销热点',
    universityPotential: '高校流量潜力',
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div
        className="bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] w-[80%] max-w-[1000px] max-h-[80vh] flex flex-col overflow-hidden"
        style={{ margin: '5% auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center mb-[20px] pb-[16px] border-b border-[rgba(0,0,0,0.1)] px-[24px] pt-[24px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgba(59,130,246,0.1)] rounded-[8px] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#1677FF]" />
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-[#333333]">{community.name}</h3>
              <p className="text-[14px] text-[#666666] mt-[4px]">{community.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[24px] font-bold text-[#666666] cursor-pointer transition-colors hover:text-[#333333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-[24px] pb-[24px] space-y-[20px]">
          {/* 基础统计 */}
          <div className="flex mb-[30px] p-[20px] bg-[#f8fafc] rounded-[8px] border border-[#E8E8E8]">
            <div className="flex-1 text-center mx-[10px]">
              <div className="text-[14px] text-[#666666] mb-[5px]">流量渗透率</div>
              <div className="text-[24px] font-semibold text-[#1677FF]">{community.penetration}%</div>
            </div>
            <div className="flex-1 text-center mx-[10px]">
              <div className="text-[14px] text-[#666666] mb-[5px]">流量客户份额</div>
              <div className="text-[24px] font-semibold text-[#52C41A]">{community.share}%</div>
            </div>
            <div className="flex-1 text-center mx-[10px]">
              <div className="text-[14px] text-[#666666] mb-[5px]">流量客户数</div>
              <div className="text-[24px] font-semibold text-[#F59E0B]">{community.householdCount}</div>
            </div>
          </div>

          {/* 流量客户画像 */}
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.05)]">
            <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.05)] bg-[#f8fafc]">
              <h4 className="text-[16px] font-semibold text-[#333333] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#1677FF]" /> 流量客户画像
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">流量客户数</div>
                  <div className="text-lg font-bold text-gray-800">1,286</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">月均DOU</div>
                  <div className="text-lg font-bold text-green-600">32.5GB</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">达量降速占比</div>
                  <div className="text-lg font-bold text-orange-600">18.3%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 5G套餐占比仪表盘 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">5G套餐占比</div>
                  <GaugeChart value={45} max={100} color="#1677FF" label="5G套餐占比" />
                  <div className="flex justify-center gap-3 mt-1 text-xs text-gray-500">
                    <span>5G用户: 579</span>
                    <span>4G用户: 707</span>
                  </div>
                </div>
                {/* DOU分布柱状图 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">DOU分布</div>
                  <BarChart
                    data={[
                      { label: '0-10G', value: 22, max: 50 },
                      { label: '10-30G', value: 35, max: 50 },
                      { label: '30-50G', value: 25, max: 50 },
                      { label: '50-100G', value: 12, max: 50 },
                      { label: '>100G', value: 6, max: 50 },
                    ]}
                    color="#1677FF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 流量套餐画像 */}
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.05)]">
            <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.05)] bg-[#f8fafc]">
              <h4 className="text-[16px] font-semibold text-[#333333] flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#52C41A]" /> 流量套餐画像
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">流量包用户</div>
                  <div className="text-lg font-bold text-gray-800">423</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">合约到期用户</div>
                  <div className="text-lg font-bold text-blue-600">86</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">地板价套餐用户</div>
                  <div className="text-lg font-bold text-purple-600">156</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 流量包合约到期占比 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">流量包合约到期占比</div>
                  <GaugeChart value={28} max={100} color="#52C41A" label="合约到期占比" />
                  <div className="flex justify-center gap-3 mt-1 text-xs text-gray-500">
                    <span>当月到期: 52户</span>
                    <span>下月到期: 34户</span>
                  </div>
                </div>
                {/* 套餐类型分布柱状图 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">套餐类型分布</div>
                  <BarChart
                    data={[
                      { label: '低档', value: 25, max: 50 },
                      { label: '中档', value: 38, max: 50 },
                      { label: '高档', value: 22, max: 50 },
                      { label: '地板价', value: 15, max: 50 },
                    ]}
                    color="#52C41A"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 流量行为画像 */}
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.05)]">
            <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.05)] bg-[#f8fafc]">
              <h4 className="text-[16px] font-semibold text-[#333333] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8B5CF6]" /> 流量行为画像
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 达量降速用户占比 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">达量降速用户占比</div>
                  <GaugeChart value={18} max={100} color="#8B5CF6" label="达量降速占比" />
                  <div className="flex justify-center gap-3 mt-1 text-xs text-gray-500">
                    <span>降速用户: 236户</span>
                    <span>正常用户: 1,050户</span>
                  </div>
                </div>
                {/* 高频应用偏好 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">高频应用偏好</div>
                  <BarChart
                    data={[
                      { label: '短视频', value: 48, max: 60 },
                      { label: '社交', value: 32, max: 60 },
                      { label: '游戏', value: 25, max: 60 },
                      { label: '直播', value: 18, max: 60 },
                      { label: '其他', value: 12, max: 60 },
                    ]}
                    color="#8B5CF6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex justify-end items-center pt-[16px] border-t border-[rgba(0,0,0,0.1)] gap-[12px]">
            <button onClick={onClose} className="px-[20px] py-[10px] border border-[#d9d9d9] rounded-[4px] text-[14px] text-[#666666] bg-white cursor-pointer hover:border-[#1677FF] hover:text-[#1677FF] transition-all">
              关闭
            </button>
            <button className="px-[20px] py-[10px] bg-[#1677FF] text-white rounded-[4px] text-[14px] cursor-pointer border-none hover:bg-[#40a9ff] transition-all flex items-center gap-2">
              <Activity className="w-4 h-4" /> 发起营销
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
