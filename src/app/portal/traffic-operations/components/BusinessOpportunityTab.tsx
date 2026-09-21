'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderTab from './LeaderTab';
import OperatorTab from './OperatorTab';
import GridManagerTab from './GridManagerTab';

// 商机分类数据类型
export interface CategoryDataItem {
  name: string;
  parent: string;
  count: number;
  executionRate: number;
  conversionRate: number;
}

// role参数映射：1=宏观决策, 2=运营管理(默认), 3=网格执行
const ROLE_MAP: Record<string, string> = { '1': 'leader', '2': 'operator', '3': 'grid-manager' };
const DEFAULT_ROLE = 'operator';

export interface BusinessOpportunityTabProps {
  regionDisplay: string;
  categoryData?: CategoryDataItem[];
}

export default function BusinessOpportunityTab({ regionDisplay, categoryData }: BusinessOpportunityTabProps) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const activeRole = (roleParam && ROLE_MAP[roleParam]) || DEFAULT_ROLE;

  // 根据角色渲染对应页面
  const renderRolePage = () => {
    switch (activeRole) {
      case 'leader':
        return <LeaderTab categoryData={categoryData} />;
      case 'grid-manager':
        return <GridManagerTab categoryData={categoryData} />;
      case 'operator':
      default:
        return <OperatorTab categoryData={categoryData} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-2">
        <span className="text-xs text-muted-foreground">{regionDisplay}</span>
      </div>
      {renderRolePage()}
    </div>
  );
}
