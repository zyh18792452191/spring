'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Film, Plus, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';

/** 活动状态 */
type ActivityStatus = '草稿' | '审批中' | '执行中' | '已完成';

/** 活动类型 */
type ActivityType = '多波次流程' | '批量策划多个活动';

interface ScriptActivity {
  id: string;
  name: string;
  type: ActivityType;
  scenario: string;
  actCount: number;
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
}

/** 模拟数据 */
const MOCK_ACTIVITIES: ScriptActivity[] = [
  { id: 'SM-2026-001', name: '全球通携转预警多波次维系', type: '多波次流程', scenario: '离网维系', actCount: 3, status: '执行中', createdAt: '2026-06-15', updatedAt: '2026-06-20' },
  { id: 'SM-2026-002', name: '4G升5G批量营销活动', type: '批量策划多个活动', scenario: '流量运营', actCount: 5, status: '审批中', createdAt: '2026-06-18', updatedAt: '2026-06-18' },
  { id: 'SM-2026-003', name: '中高端客户流量提升剧本', type: '多波次流程', scenario: '中高端客户运营', actCount: 2, status: '草稿', createdAt: '2026-06-20', updatedAt: '2026-06-20' },
  { id: 'SM-2026-004', name: '家庭融合宽带推广', type: '批量策划多个活动', scenario: '家庭融合运营', actCount: 3, status: '已完成', createdAt: '2026-05-10', updatedAt: '2026-06-01' },
];

const STATUS_COLORS: Record<ActivityStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  '草稿': 'secondary',
  '审批中': 'outline',
  '执行中': 'default',
  '已完成': 'secondary',
};

export default function ScriptMarketingManagePage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | '全部'>('全部');

  const filteredActivities = MOCK_ACTIVITIES.filter(a => {
    if (statusFilter !== '全部' && a.status !== statusFilter) return false;
    if (searchKeyword && !a.name.includes(searchKeyword) && !a.id.includes(searchKeyword)) return false;
    return true;
  });

  const handleCreate = () => {
    router.push('/workspace/script-marketing');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">剧本营销</h1>
            <p className="text-sm text-muted-foreground">管理IOP剧本营销活动，支持多波次流程和批量策划两种类型</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-1" />新建剧本营销
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索活动名称/编号"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              {(['全部', '草稿', '审批中', '执行中', '已完成'] as const).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活动列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>活动编号</TableHead>
                <TableHead>活动名称</TableHead>
                <TableHead>剧本类型</TableHead>
                <TableHead>业务场景</TableHead>
                <TableHead>幕数/活动数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    暂无剧本营销活动
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono text-sm">{activity.id}</TableCell>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                    </TableCell>
                    <TableCell>{activity.scenario}</TableCell>
                    <TableCell className="text-center">{activity.actCount}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[activity.status]}>{activity.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{activity.createdAt}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{activity.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />查看
                        </Button>
                        {activity.status === '草稿' && (
                          <Button variant="ghost" size="sm">编辑</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
