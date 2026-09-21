'use client';

import { useSearchParams } from 'next/navigation';
import LeaderTab from './LeaderTab';
import OperatorTab from './OperatorTab';
import GridManagerTab from './GridManagerTab';

// role参数映射：1=宏观决策, 2=运营管理(默认), 3=网格执行
const ROLE_MAP: Record<string, string> = { '1': 'leader', '2': 'operator', '3': 'grid-manager' };
const DEFAULT_ROLE = 'operator';

interface BusinessOpportunityTabProps {
  regionDisplay: string;
}

export default function BusinessOpportunityTab({ regionDisplay }: BusinessOpportunityTabProps) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const activeRole = (roleParam && ROLE_MAP[roleParam]) || DEFAULT_ROLE;

  // 根据角色渲染对应页面
  const renderRolePage = () => {
    switch (activeRole) {
      case 'leader':
        return <LeaderTab />;
      case 'grid-manager':
        return <GridManagerTab />;
      case 'operator':
      default:
        return <OperatorTab />;
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
