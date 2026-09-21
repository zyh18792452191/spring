'use client';

import { DispatchSystem } from '@/lib/dispatch-system';

interface OpportunityRelatedInfoProps {
  data: Record<string, any>;
  ticketType: string;
  dispatchSystem: DispatchSystem;
}

export function OpportunityRelatedInfo({ data, ticketType, dispatchSystem }: OpportunityRelatedInfoProps) {
  if (!data) return <p className="text-sm text-muted-foreground py-2">暂无数据</p>;

  if (ticketType === 'customer-opportunity-dispatch') {
    return (
      <div className="grid grid-cols-5 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">关联批次编号</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{data.id || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">商机类型</p>
          <p className="text-sm font-medium">{data.type || '客户商机（批量）'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">执行场景</p>
          <p className="text-sm font-medium">{data.scenario || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">勾选客户数</p>
          <p className="text-sm font-semibold text-orange-600">{data.selectedCount || 0}个</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">涉及网格数</p>
          <p className="text-sm font-semibold text-blue-600">{data.gridCoverageCount || 0}个</p>
        </div>
      </div>
    );
  }

  if (ticketType === 'group-opportunity-dispatch') {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">关联客群编号</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{data.id || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">客群名称</p>
          <p className="text-sm font-medium">{data.groupName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">执行场景</p>
          <p className="text-sm font-medium">{data.scenario || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">目标客群规模</p>
          <p className="text-sm font-medium">{data.groupScale || '—'}</p>
        </div>
      </div>
    );
  }

  if (ticketType === 'region-assault') {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">圈选区域</p>
          <p className="text-sm font-medium">{data.selectedArea || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">覆盖小区</p>
          <p className="text-sm font-semibold text-blue-600">{data.communityCount || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">目标客户</p>
          <p className="text-sm font-semibold text-orange-600">{data.targetCustomerCount || '—'}</p>
        </div>
      </div>
    );
  }

  // 策略调度/客群调度（IOP或网格通，按dispatchSystem区分）
  if (ticketType === 'strategy') {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">策略编号</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{data.strategyId || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">策略名称</p>
          <p className="text-sm font-medium">{data.strategyName || '—'}</p>
        </div>
        {dispatchSystem === 'IOP' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">推荐产品</p>
            <p className="text-sm font-medium">{data.recommendedProduct || '—'}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 mb-1">关联指标</p>
          <p className="text-sm font-medium">{data.indicator || '—'}</p>
        </div>
      </div>
    );
  }

  if (ticketType === 'customer-group') {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">客群编号</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">{data.groupId || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">客群名称</p>
          <p className="text-sm font-medium">{data.groupName || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">客群规模</p>
          <p className="text-sm font-semibold text-orange-600">{data.groupScale || '—'}</p>
        </div>
        {dispatchSystem === 'IOP' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">推荐产品</p>
            <p className="text-sm font-medium">{data.recommendedProduct || '—'}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
