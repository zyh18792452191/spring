'use client';

import { Card } from '@/components/ui/card';

export interface ExecutionStatsData {
  targetCustomerCount: number;   // 目标客户数
  reachedCustomerCount: number;  // 触达客户数
  successCustomerCount: number;  // 营销成功客户数
  reachRate: number;             // 触达率(%)
  marketingSuccessRate: number;  // 营销成功率(%)
}

interface ExecutionStatsProps {
  data: ExecutionStatsData;
}

export default function ExecutionStats({ data }: ExecutionStatsProps) {
  const stats = [
    { label: '目标客户数', value: data.targetCustomerCount.toLocaleString(), unit: '人' },
    { label: '触达客户数', value: data.reachedCustomerCount.toLocaleString(), unit: '人' },
    { label: '营销成功客户数', value: data.successCustomerCount.toLocaleString(), unit: '人' },
    { label: '触达率', value: data.reachRate.toFixed(1), unit: '%' },
    { label: '营销成功率', value: data.marketingSuccessRate.toFixed(1), unit: '%' },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">执行统计</h3>
      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-semibold text-foreground">
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">{stat.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
