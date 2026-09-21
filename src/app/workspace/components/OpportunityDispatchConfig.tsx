'use client';

import { DispatchSystem } from '@/lib/dispatch-system';
import type { EvaluationIndicator } from '@/lib/evaluation-indicator';

/**
 * 调度配置组件
 * 
 * 核心修正：
 * - IOP："派发系统: IOP" + "IOP处理人"
 * - 网格通："派发系统: 网格通" + "执行角色"（地市集运/网格经理）
 * - platform："派发系统: 市场运营平台" + "指派对象"
 * - 非商机调度类型展示评估指标信息
 */

interface OpportunityDispatchConfigProps {
  data: Record<string, any>;
  ticketType: string;
  dispatchSystem: DispatchSystem;
  evaluationIndicator?: EvaluationIndicator;
}

function EvaluationIndicatorDisplay({ indicator }: { indicator: EvaluationIndicator }) {
  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <p className="text-xs text-gray-500 mb-2">评估指标</p>
      <div className="grid grid-cols-5 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">指标名称</p>
          <p className="text-sm font-medium">{indicator.indicatorName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">基期值</p>
          <p className="text-sm font-medium">{indicator.baseValue}{indicator.unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">目标值</p>
          <p className="text-sm font-medium">{indicator.targetValue}{indicator.unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">改善方向</p>
          <p className="text-sm font-medium">{indicator.direction === 'up' ? '↑ 提升' : '↓ 降低'}</p>
        </div>
        {indicator.currentValue != null && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">当前值</p>
            <p className="text-sm font-medium">{indicator.currentValue}{indicator.unit}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OpportunityDispatchConfig({ data, ticketType, dispatchSystem, evaluationIndicator }: OpportunityDispatchConfigProps) {
  if (!data) return <p className="text-sm text-muted-foreground py-2">暂无数据</p>;

  // 网格通类调度配置
  if (dispatchSystem === 'wanggetong') {
    if (ticketType === 'customer-opportunity-dispatch') {
      return (
        <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">派发系统</p>
            <p className="text-sm font-medium">网格通</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行角色</p>
            <p className="text-sm font-medium">{data.executionRole || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行区域</p>
            <p className="text-sm font-medium">{data.region || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">拆单规则</p>
            <p className="text-sm font-medium">
              {data.executionRole === '地市集运' ? '按区县拆单' : data.executionRole === '网格经理' ? '按网格拆单' : (data.splitRule || '—')}
            </p>
          </div>
        </div>
      );
    }

    if (ticketType === 'group-opportunity-dispatch') {
      return (
        <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 mb-1">派发系统</p>
            <p className="text-sm font-medium">网格通</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行角色</p>
            <p className="text-sm font-medium">{data.executionRole || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">调度方式</p>
            <p className="text-sm font-medium">{data.dispatchMethod || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">拆单规则</p>
            <p className="text-sm font-medium">{data.splitRule || '—'}</p>
          </div>
        </div>
      );
    }

    if (ticketType === 'region-assault') {
      return (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">派发系统</p>
              <p className="text-sm font-medium">网格通</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">执行角色</p>
              <p className="text-sm font-medium">{data.executionRole || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">执行区域</p>
              <p className="text-sm font-medium">{data.region || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">拆单规则</p>
              <p className="text-sm font-medium">{data.splitRule || '—'}</p>
            </div>
          </div>
          {data.touchStrategy && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500 mb-1">触客策略</p>
              <div className="text-sm font-medium whitespace-pre-line bg-white p-3 rounded border border-gray-100 leading-relaxed">{data.touchStrategy}</div>
            </div>
          )}
          {evaluationIndicator && <EvaluationIndicatorDisplay indicator={evaluationIndicator} />}
        </div>
      );
    }

    // 策略调度/客群调度走网格通
    return (
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">派发系统</p>
            <p className="text-sm font-medium">网格通</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行角色</p>
            <p className="text-sm font-medium">{data.executionRole || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行区域</p>
            <p className="text-sm font-medium">{data.region || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">拆单规则</p>
            <p className="text-sm font-medium">{data.splitRule || '—'}</p>
          </div>
        </div>
        {evaluationIndicator && <EvaluationIndicatorDisplay indicator={evaluationIndicator} />}
      </div>
    );
  }

  // IOP类调度配置（策略调度/客群调度走IOP时）
  if (dispatchSystem === 'IOP') {
    return (
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">派发系统</p>
            <p className="text-sm font-medium">IOP</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">IOP处理人</p>
            <p className="text-sm font-medium">{data.iopHandler || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">执行区域</p>
            <p className="text-sm font-medium">{data.region || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">拆单规则</p>
            <p className="text-sm font-medium">{data.splitRule || '—'}</p>
          </div>
        </div>
        {evaluationIndicator && <EvaluationIndicatorDisplay indicator={evaluationIndicator} />}
      </div>
    );
  }

  // platform类型（指标调度）
  return (
    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">派发系统</p>
          <p className="text-sm font-medium">市场运营平台</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">指派对象</p>
          <p className="text-sm font-medium">{data.assignee || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">分析要求</p>
          <p className="text-sm font-medium">{data.analysisRequirement || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">截止时间</p>
          <p className="text-sm font-medium">{data.deadline || '—'}</p>
        </div>
      </div>
      {evaluationIndicator && <EvaluationIndicatorDisplay indicator={evaluationIndicator} />}
    </div>
  );
}
