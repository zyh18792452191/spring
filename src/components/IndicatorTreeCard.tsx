'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronRight, Info } from 'lucide-react';

export interface IndicatorCardData {
  id: string;
  name: string;
  value?: string | number;
  yoy?: string | number;
  yoyUnit?: string;
  unit?: string;
  yoyLabel?: string;
  label?: string; // 主指标、分类节点、问题指标
  level: number;
  parentId?: string | null;
  children?: IndicatorCardData[];
  status?: 'normal' | 'warning' | 'danger' | 'positive';
  isExpanded?: boolean;
}

interface IndicatorTreeCardProps {
  data: IndicatorCardData;
  onClick?: (id: string) => void;
  onToggle?: (id: string) => void;
  selectedId?: string; // 当前选中的节点ID
}

const IndicatorTreeCard: React.FC<IndicatorTreeCardProps> = ({ data, onClick, onToggle, selectedId }) => {
  const hasChildren = data.children && data.children.length > 0;
  const isCategory = data.label === '分类节点';

  // 判断是否被选中
  const isSelected = selectedId === data.id;

  // 判断是否是客群
  const isCustomerGroup = data.name.includes('潜在离网') || data.name.includes('客群');

  // 根据节点类型获取卡片尺寸
  const getCardSize = () => {
    if (isCategory) {
      return 'w-[160px] h-[70px]';
    }
    return 'w-[180px] h-[110px]';
  };

  // 获取指标名称字体大小
  const getNameFontSize = () => {
    if (isCategory) {
      return 'text-sm font-semibold';
    }
    if (data.level <= 2) {
      return 'text-sm font-semibold';
    }
    return 'text-xs font-medium';
  };

  // 获取指标值字体大小
  const getValueFontSize = () => {
    if (data.level <= 1) {
      return 'text-2xl';
    } else if (data.level <= 2) {
      return 'text-xl';
    } else if (data.level <= 3) {
      return 'text-lg';
    }
    return 'text-base';
  };

  // 根据层级获取背景色
  const getBgColor = () => {
    if (isSelected) return 'bg-[#DBEAFE] border-[#3B82F6] border-2'; // 选中状态：浅蓝色背景 + 蓝色边框
    if (isCustomerGroup) return 'bg-[#F0F9FF] border-[#60A5FA] border-2';
    if (data.level === 0) return 'bg-[#F8FAFC] border-[#3B82F6] border-2';
    if (data.value === undefined || data.value === null || data.value === '-') return 'bg-[#F3F4F6]';
    return 'bg-[#FFFFFF]';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-[#3B82F6] border-2'; // 选中状态
    if (isCustomerGroup) return 'border-[#60A5FA] border-2';
    if (data.level === 0) return 'border-[#3B82F6] border-2';
    if (data.label === '问题指标') return 'border-[#F56C6C]';
    return 'border-[#E5E7EB]';
  };

  const getStatusColor = () => {
    if (data.label === '主指标') return 'bg-[#3B82F6]';
    if (data.status === 'danger') return 'bg-[#F56C6C]';
    if (data.status === 'warning') return 'bg-[#E6A23C]';
    if (data.status === 'positive') return 'bg-[#67C23A]';
    return 'bg-[#67C23A]';
  };

  // 获取环比数值（处理字符串和数字类型）
  const getYoyValue = () => {
    if (!data.yoy || data.yoy === '-' || data.yoy === '-%') return null;
    if (typeof data.yoy === 'string') {
      // 移除百分号，转换为数字
      const numValue = parseFloat(data.yoy.replace('%', ''));
      if (isNaN(numValue)) return null;
      return numValue;
    }
    if (typeof data.yoy === 'number') {
      return data.yoy;
    }
    return null;
  };

  const getYoyColor = () => {
    const yoyValue = getYoyValue();
    if (yoyValue === null) return 'text-[#909399]';
    return yoyValue > 0 ? 'text-[#67C23A]' : 'text-[#F56C6C]';
  };

  const getYoyIcon = () => {
    const yoyValue = getYoyValue();
    if (yoyValue === null) return null;
    return yoyValue > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const valueFontSizeClass = getValueFontSize();

  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        // 分类节点不可点击
        if (!isCategory) {
          onClick?.(data.id);
        }
      }}
    >
      {/* 卡片 */}
      <div
        className={`
          relative px-4 py-3 rounded-lg shadow-sm flex flex-col items-center justify-center
          ${getBgColor()} ${getBorderColor()} ${getCardSize()}
          ${!isCategory ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        `}
      >
        {/* 问题指标标签 */}
        {data.label === '问题指标' && !isCategory && (
          <div className="absolute -top-2 -right-2 bg-[#F56C6C] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>问题</span>
          </div>
        )}

        {/* 客群标签 */}
        {isCustomerGroup && !isCategory && data.label !== '问题指标' && (
          <div className="absolute -top-2 -right-2 bg-[#60A5FA] text-white text-xs px-1.5 py-0.5 rounded">
            客群
          </div>
        )}

        {/* 主指标标签 - 只有非客群、非分类节点才显示 */}
        {data.label === '主指标' && !isCategory && !isCustomerGroup && (
          <div className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-xs px-1.5 py-0.5 rounded">
            主指标
          </div>
        )}

        {/* 子指标标签 - level 3 */}
        {!isCategory && data.level === 3 && data.label !== '问题指标' && !isCustomerGroup && data.label !== '主指标' && (
          <div className="absolute -top-2 -right-2 bg-[#10B981] text-white text-xs px-1.5 py-0.5 rounded">
            子指标
          </div>
        )}

        {/* 明细指标标签 - level >= 4 */}
        {!isCategory && data.level >= 4 && data.label !== '问题指标' && !isCustomerGroup && data.label !== '主指标' && (
          <div className="absolute -top-2 -right-2 bg-[#8B5CF6] text-white text-xs px-1.5 py-0.5 rounded">
            明细
          </div>
        )}

        {/* 分类节点标签 */}
        {data.label === '分类节点' && (
          <div className="absolute -top-2 -right-2 bg-[#6B7280] text-white text-xs px-1.5 py-0.5 rounded">
            分类
          </div>
        )}

        {/* 指标名称 - 始终显示 */}
        <div className={`
          leading-tight text-gray-900 text-center truncate w-full
          ${getNameFontSize()}
          ${isCategory ? 'mb-0' : 'mb-2'}
        `} title={data.name}>
          {data.name}
        </div>

        {/* 业务口径说明入口 - 仅非分类节点显示 */}
        {!isCategory && (
          <button
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors z-10"
            title="业务口径说明"
            onClick={(e) => {
              e.stopPropagation();
              // 触发业务口径说明弹窗
              console.log('业务口径说明:', data.name);
            }}
          >
            <Info className="w-3 h-3 text-gray-500 hover:text-blue-600" />
          </button>
        )}

        {/* 指标值和环比 - 仅非分类节点显示 */}
        {!isCategory && data.value !== undefined && data.value !== null && data.value !== '-' && (
          <div className="flex items-center justify-center gap-1 text-xs">
            {/* 指标值（已包含单位，如"3.7万"、"78.5%"） */}
            <div className={`
              font-bold text-gray-900
              ${valueFontSizeClass}
            `}>
              {data.value}
            </div>

            {/* 环比数据 */}
            {(() => {
              const yoyValue = getYoyValue();
              if (yoyValue === null) return null;

              return (
                <div className={`flex items-center gap-0.5 ${getYoyColor()}`}>
                  {/* 环比数值（带百分号） */}
                  <span className="font-medium">
                    {yoyValue > 0 ? '+' : ''}{yoyValue}{data.yoyUnit || '%'}
                  </span>
                  {/* 箭头图标 */}
                  {getYoyIcon()}
                </div>
              );
            })()}
          </div>
        )}

        {/* 展开折叠按钮 - 右侧边缘 */}
        {hasChildren && (
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
            }}
            onMouseMove={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(data.id);
            }}
            className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all z-50 cursor-pointer"
            title={data.isExpanded ? "收起" : "展开"}
          >
            {data.isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="sr-only">{data.isExpanded ? "收起" : "展开"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default IndicatorTreeCard;
