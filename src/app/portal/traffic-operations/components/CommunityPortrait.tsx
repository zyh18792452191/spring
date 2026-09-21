'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Home, Wifi, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// 小区基本信息数据结构
export interface CellInfo {
  id: string;
  name: string;
  type: string;
  address: string;
  householdCount: number;
  penetration: number;
  share: number;
  cellCode: string;
  cellType: string;
  cityName: string;
  districtName: string;
  networkName: string;
  longitude: number;
  latitude: number;
  userCount: number;
  totalPorts: number;
  unusedPorts: number;
  portUsageRate: number;
  isKeyCell: boolean;
  dataDate: string;
  info?: string;
}

// 小区类型中文映射
const CELL_TYPE_MAP: Record<string, string> = {
  lowSaturation: '流量低饱和小区',
  zeroLowTraffic: '流量零低小区',
  overageHighFreq: '流量超套高发小区',
  competitorHighRisk: '异网高风险小区',
  highValueLowShare: '高价值低占小区',
  highRiskGathering: '高风险客户聚集',
  lowPenetration: '低渗透小区',
  competitorHighShare: '竞对高占小区',
  newCommunity: '新建小区',
  default: '一般小区',
};

interface CommunityPortraitProps {
  visible: boolean;
  community: CellInfo | null;
  onClose: () => void;
  scenario?: string;
}

export default function CommunityPortrait({ visible, community, onClose }: CommunityPortraitProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !community) return null;

  const cellTypeLabel = CELL_TYPE_MAP[community.type] || community.type || '一般小区';

  // 解析info字段中的特征标签列表
  const parseTagsFromInfo = (info: string | undefined): string[] => {
    if (!info) return [cellTypeLabel];
    const match = info.match(/特征标签[：:]\s*(.+)/);
    if (match && match[1]) {
      return match[1].split(/[、,，]/).map(t => t.trim()).filter(Boolean);
    }
    return [cellTypeLabel];
  };
  const tagList = parseTagsFromInfo(community.info);

  // 信息项组件
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start py-2.5 border-b border-gray-50 last:border-b-0">
      <span className="text-[13px] text-gray-500 w-[100px] shrink-0">{label}</span>
      <span className="text-[13px] text-gray-800 font-medium flex-1">{value}</span>
    </div>
  );

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        overlayClassName="z-[10000] bg-black/50 backdrop-blur-[5px]"
        className="z-[10001] w-[620px] max-h-[80vh] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-0 gap-0 border-0 bg-white overflow-hidden flex flex-col"
        showCloseButton={false}
        disableMaxWidth
      >
        <DialogTitle className="sr-only">小区画像 - {community.name}</DialogTitle>

        {/* 头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgba(59,130,246,0.1)] rounded-[8px] flex items-center justify-center">
              <Home className="w-4 h-4 text-[#1677FF]" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#333333]">{community.name}</h3>
              <p className="text-[13px] text-[#999999] mt-[2px]">{community.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* 基本信息 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#1677FF]" />
              <h4 className="text-[15px] font-semibold text-[#333333]">基本信息</h4>
            </div>
            <div className="bg-[#f8fafc] rounded-[10px] border border-[#f0f0f0] px-4 py-1">
              <InfoItem label="数据日期" value={community.dataDate} />
              <InfoItem label="小区编码" value={<span className="font-mono text-[13px]">{community.cellCode}</span>} />
              <InfoItem label="小区名称" value={community.name} />
              <InfoItem label="小区类型" value={
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#e6f7ff] text-[#1677FF] border border-[#91d5ff]">
                  {community.cellType}
                </span>
              } />
              <InfoItem label="地市名称" value={community.cityName} />
              <InfoItem label="区县名称" value={community.districtName} />
              <InfoItem label="网络名称" value={community.networkName} />
              <InfoItem label="小区地址" value={community.address} />
            </div>
          </div>

          {/* 位置信息 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#52C41A]" />
              <h4 className="text-[15px] font-semibold text-[#333333]">位置信息</h4>
            </div>
            <div className="bg-[#f8fafc] rounded-[10px] border border-[#f0f0f0] px-4 py-1">
              <InfoItem label="小区经度" value={<span className="font-mono text-[13px]">{community.longitude}</span>} />
              <InfoItem label="小区纬度" value={<span className="font-mono text-[13px]">{community.latitude}</span>} />
            </div>
          </div>

          {/* 规模与端口 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-4 h-4 text-[#F59E0B]" />
              <h4 className="text-[15px] font-semibold text-[#333333]">规模与端口</h4>
            </div>
            <div className="bg-[#f8fafc] rounded-[10px] border border-[#f0f0f0] px-4 py-1">
              <InfoItem label="小区住户" value={<span>{(community.householdCount ?? 0).toLocaleString()} 户</span>} />
              <InfoItem label="小区用户数" value={<span>{(community.userCount ?? 0).toLocaleString()} 户</span>} />
              <InfoItem label="总端口数" value={<span>{(community.totalPorts ?? 0).toLocaleString()}</span>} />
              <InfoItem label="未使用端口数" value={<span>{(community.unusedPorts ?? 0).toLocaleString()}</span>} />
              <InfoItem label="端口使用率" value={
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(community.portUsageRate ?? 0, 100)}%`,
                        backgroundColor: (community.portUsageRate ?? 0) >= 80 ? '#FF4D4F' : (community.portUsageRate ?? 0) >= 60 ? '#F59E0B' : '#52C41A',
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-medium">{community.portUsageRate ?? 0}%</span>
                </div>
              } />
              <InfoItem label="是否重点小区" value={
                community.isKeyCell ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-[#fff7e6] text-[#FA8C16] border border-[#ffd591]">是</span>
                ) : (
                  <span className="text-[13px] text-gray-400">否</span>
                )
              } />
            </div>
          </div>

          {/* 小区分类标签 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#8B5CF6]" />
              <h4 className="text-[15px] font-semibold text-[#333333]">分类标签</h4>
            </div>
            <div className="bg-[#f8fafc] rounded-[10px] border border-[#f0f0f0] px-4 py-3 flex flex-wrap gap-2">
              {tagList.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[13px] font-medium bg-[#f0f5ff] text-[#1677FF] border border-[#adc6ff]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[#d9d9d9] rounded-[6px] text-[14px] text-[#666666] bg-white cursor-pointer hover:border-[#1677FF] hover:text-[#1677FF] transition-all"
          >
            关闭
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
