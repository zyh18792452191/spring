'use client';

/**
 * 效果评估 - 统一组件
 * 
 * 不区分IOP/网格通，统一指标：触达率 + 成功率 + 平均执行周期
 * 
 * 计算公式对照：
 * | 指标         | 公式                  | IOP数据来源(6.1.3)              | 网格通数据来源(6.2.3)              |
 * |-------------|----------------------|--------------------------------|----------------------------------|
 * | 触达率       | 触达客户数/目标客户数  | reachCount/targetCount         | calledCount/totalCustomerCount   |
 * | 成功率       | 营销成功/接触客户数    | convertCount/successReachCount | successCount/contactedCount      |
 * | 平均执行周期 | 已完成子单平均执行天数 | 平台计算                       | 平台计算                          |
 * 
 * 调用方负责计算并传入统一指标值
 */

export interface EffectEvaluationData {
  reachRate: string;            // 触达率
  successRate: string;          // 成功率
  avgExecutionCycle: string;    // 平均执行周期
}

interface EffectEvaluationProps {
  data: EffectEvaluationData;
}

export function EffectEvaluation({ data }: EffectEvaluationProps) {
  const { reachRate, successRate, avgExecutionCycle } = data;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">触达率</p>
        <p className="text-2xl font-bold text-blue-600">{reachRate}</p>
        <p className="text-xs text-gray-400 mt-1">触达客户数 / 目标客户数</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">成功率</p>
        <p className="text-2xl font-bold text-green-600">{successRate}</p>
        <p className="text-xs text-gray-400 mt-1">营销成功客户数 / 接触客户数</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500 mb-1">平均执行周期</p>
        <p className="text-2xl font-bold text-orange-600">{avgExecutionCycle}</p>
        <p className="text-xs text-gray-400 mt-1">从派发到执行完成</p>
      </div>
    </div>
  );
}
