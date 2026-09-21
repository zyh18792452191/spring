'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Zap, CheckCircle2, Clock, Target, ChevronRight, Timer, Users } from 'lucide-react';
import type { CategoryDataItem } from './BusinessOpportunityTab';

// 默认商机分类数据（流量运营）
const DEFAULT_CATEGORY_DATA: CategoryDataItem[] = [
  { name: '流量达量预警', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '特定内容高频访问', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '地板价套餐查询', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '零流量使用预警', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

interface GridStaffTabProps {
  categoryData?: CategoryDataItem[];
}

export default function GridStaffTab({ categoryData }: GridStaffTabProps) {
  const categories = categoryData && categoryData.length > 0 ? categoryData : DEFAULT_CATEGORY_DATA;
  const categoryNames = categories.map(c => c.name);

  // 个人执行指标 - 商机维度
  const personalKpi = [
    { title: '今日执行商机', value: '5', unit: '个', trend: '+1', trendUp: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: '本月累计完成', value: '42', unit: '个', trend: '+8.2%', trendUp: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: '商机转化率', value: '46.8', unit: '%', trend: '+1.5pp', trendUp: true, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: '平均响应时长', value: '15', unit: '分钟', trend: '-2min', trendUp: false, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // 待执行商机任务（使用动态分类名称）
  const pendingGroupTasks = [
    { id: 'KQ202407010001', category: categoryNames[0] || '流量达量预警', groupName: '高流量低套餐商机A', groupSize: 128, strategy: '套餐升级推荐', assignedAt: '2024-07-01 08:30', deadline: '2024-07-02 08:30', remainingHours: 24, sourceCount: 86 },
    { id: 'KQ202407010002', category: categoryNames[1] || '特定内容高频访问', groupName: '高频访问商机B', groupSize: 64, strategy: '内容推荐转化', assignedAt: '2024-07-01 09:15', deadline: '2024-07-02 09:15', remainingHours: 23, sourceCount: 42 },
    { id: 'KQ202407010003', category: categoryNames[2] || '地板价套餐查询', groupName: '低价套餐查询商机C', groupSize: 215, strategy: '价值提升方案', assignedAt: '2024-07-01 07:00', deadline: '2024-07-01 19:00', remainingHours: 8, sourceCount: 156 },
    { id: 'KQ202407010004', category: categoryNames[3] || '零流量使用预警', groupName: '沉默商机激活D', groupSize: 96, strategy: '激活唤醒策略', assignedAt: '2024-07-01 10:00', deadline: '2024-07-02 10:00', remainingHours: 24, sourceCount: 68 },
  ];

  // 执行中商机任务
  const executingGroupTasks = [
    { id: 'KQ202406300001', category: categoryNames[0] || '流量达量预警', groupName: '流量超限商机E', groupSize: 172, strategy: '流量包推荐', startedAt: '2024-06-30 10:30', deadline: '2024-07-01 10:30', remainingHours: -2, progress: 68, sourceCount: 120 },
    { id: 'KQ202406300002', category: categoryNames[1] || '特定内容高频访问', groupName: '高频访问商机F', groupSize: 88, strategy: '定向推荐方案', startedAt: '2024-06-30 14:00', deadline: '2024-07-01 14:00', remainingHours: 2, progress: 82, sourceCount: 55 },
    { id: 'KQ202406290003', category: categoryNames[2] || '地板价套餐查询', groupName: '低价查询商机G', groupSize: 145, strategy: '价值提升方案', startedAt: '2024-06-29 16:00', deadline: '2024-06-30 16:00', remainingHours: -14, progress: 45, sourceCount: 98 },
  ];

  // 今日待办（商机维度）
  const todayTodos = [
    { id: 1, content: `执行商机「流量超限商机E」- 流量包推荐策略，进度68%`, priority: '紧急', deadline: '14:00' },
    { id: 2, content: `启动商机「高流量低套餐商机A」- 套餐升级推荐`, priority: '重要', deadline: '16:00' },
    { id: 3, content: `完成商机「高频访问商机F」- 定向推荐方案，进度82%`, priority: '紧急', deadline: '17:00' },
    { id: 4, content: '提交本周商机执行周报', priority: '一般', deadline: '18:00' },
  ];

  const priorityStyle: Record<string, string> = {
    '紧急': 'bg-red-100 text-red-700',
    '重要': 'bg-amber-100 text-amber-700',
    '一般': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* 个人执行指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {personalKpi.map((kpi) => (
          <Card key={kpi.title} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 待执行商机任务 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            待执行商机任务
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">商机 {pendingGroupTasks.length} 个</Badge>
            <span className="text-xs text-red-500 flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {pendingGroupTasks.filter(o => o.remainingHours < 10).length} 个即将到期
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商机ID</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>商机名称</TableHead>
              <TableHead className="text-right">商机规模</TableHead>
              <TableHead className="text-right">来源客户数</TableHead>
              <TableHead>执行策略</TableHead>
              <TableHead>分配时间</TableHead>
              <TableHead className="text-right">剩余时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingGroupTasks.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                <TableCell>{opp.category}</TableCell>
                <TableCell>
                  <span className="font-medium text-sm">{opp.groupName}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-blue-600">{opp.groupSize}人</span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{opp.sourceCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{opp.strategy}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{opp.assignedAt}</TableCell>
                <TableCell className="text-right">
                  <span className={`flex items-center justify-end gap-1 ${opp.remainingHours < 10 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    <Timer className="h-3 w-3" />
                    {opp.remainingHours}h
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                    <Zap className="h-3 w-3 mr-1" />开始执行
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 执行中商机任务 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            执行中商机
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              执行中 <Badge variant="secondary" className="ml-1">{executingGroupTasks.length}</Badge>
            </span>
            <span className="text-red-500">
              已逾期 <Badge variant="destructive" className="ml-1">{executingGroupTasks.filter(o => o.remainingHours < 0).length}</Badge>
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商机ID</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>商机名称</TableHead>
              <TableHead className="text-right">商机规模</TableHead>
              <TableHead>执行策略</TableHead>
              <TableHead className="text-right">执行进度</TableHead>
              <TableHead>截止时间</TableHead>
              <TableHead className="text-right">剩余/逾期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executingGroupTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-xs">{task.id}</TableCell>
                <TableCell>{task.category}</TableCell>
                <TableCell>
                  <span className="font-medium text-sm">{task.groupName}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-blue-600">{task.groupSize}人</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{task.strategy}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${task.progress >= 80 ? 'bg-emerald-500' : task.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{task.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{task.deadline}</TableCell>
                <TableCell className="text-right">
                  {task.remainingHours >= 0 ? (
                    <span className="text-muted-foreground">{task.remainingHours}h</span>
                  ) : (
                    <span className="text-red-600 font-medium">逾期 {Math.abs(task.remainingHours)}h</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:text-emerald-800">
                      记录结果
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-foreground">
                      <ChevronRight className="h-3 w-3 mr-0.5" />详情
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 今日待办 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">今日待办</h3>
          <Badge variant="outline" className="text-xs">{todayTodos.length} 项</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {todayTodos.map((todo) => (
            <div key={todo.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{todo.content}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className={priorityStyle[todo.priority]} variant="secondary">{todo.priority}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{todo.deadline}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
