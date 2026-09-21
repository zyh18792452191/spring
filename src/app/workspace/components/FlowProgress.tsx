'use client';

/**
 * 执行进度漏斗 - 统一组件
 * 
 * 不区分IOP/网格通，统一漏斗：目标客户 → 触达客户 → 接触客户 → 营销成功客户
 * 
 * 数据来源对照：
 * | 漏斗节点       | IOP来源(6.1.3)     | 网格通来源(6.2.3)          |
 * |--------------|--------------------|---------------------------|
 * | 目标客户数    | targetCount        | totalCustomerCount        |
 * | 触达客户数    | reachCount         | calledCount               |
 * | 接触客户数    | successReachCount  | contactedCount            |
 * | 营销成功客户数| convertCount       | successCount              |
 * 
 * 调用方负责字段映射，传入统一字段名
 */

export interface FlowProgressData {
  targetCount: number;        // 目标客户数
  reachedCount: number;       // 触达客户数（IOP=reachCount, 网格通=calledCount）
  contactedCount: number;     // 接触客户数（IOP=successReachCount, 网格通=contactedCount）
  successCount: number;       // 营销成功客户数（IOP=convertCount, 网格通=successCount）
  reachRate: string;          // 触达率 = 触达客户数/目标客户数
  successRate: string;        // 成功率 = 营销成功客户数/接触客户数
}

interface FlowProgressProps {
  data: FlowProgressData;
}

export function FlowProgress({ data }: FlowProgressProps) {
  const { targetCount, reachedCount, contactedCount, successCount, reachRate, successRate } = data;

  const successPct = targetCount > 0 ? (successCount / targetCount) * 100 : 0;
  const contactedOnlyPct = targetCount > 0 ? (contactedCount / targetCount) * 100 - successPct : 0;
  const reachedOnlyPct = targetCount > 0 ? (reachedCount / targetCount) * 100 - contactedOnlyPct - successPct : 0;
  const notReachedPct = targetCount > 0 ? Math.max(0, 100 - reachedOnlyPct - contactedOnlyPct - successPct) : 100;

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">目标客户</p>
          <p className="text-lg font-bold">{targetCount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">触达客户</p>
          <p className="text-lg font-bold text-blue-600">{reachedCount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">接触客户</p>
          <p className="text-lg font-bold text-cyan-600">{contactedCount.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">营销成功</p>
          <p className="text-lg font-bold text-green-600">{successCount.toLocaleString()}</p>
        </div>
      </div>
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
          <div className="bg-green-500" style={{ width: `${successPct}%` }} title="营销成功" />
          <div className="bg-cyan-400" style={{ width: `${contactedOnlyPct}%` }} title="接触客户" />
          <div className="bg-blue-400" style={{ width: `${reachedOnlyPct}%` }} title="触达客户" />
          <div className="bg-gray-300" style={{ width: `${notReachedPct}%` }} title="未触达" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">成功率: {successRate}</span>
          <span className="text-xs text-gray-400">触达率: {reachRate}</span>
        </div>
      </div>
    </>
  );
}
