'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Zap, CheckCircle2, Clock, Target, ChevronRight, Timer, ShoppingCart } from 'lucide-react';

export default function GridStaffTab() {
  // 个人绩效指标
  const personalKpi = [
    { title: '今日处理', value: '12', unit: '条', trend: '+3', trendUp: true, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: '本月累计', value: '186', unit: '条', trend: '+8.2%', trendUp: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: '个人转化率', value: '48.6', unit: '%', trend: '+1.5pp', trendUp: true, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: '平均响应时长', value: '15', unit: '分钟', trend: '-2min', trendUp: false, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // 抢单池 - 仅单客户商机
  const grabPool = [
    { id: 'SJ202407010001', category: '流量达量预警', source: 'CRM系统', executionCustomer: '991*********1001', rating: '高', remainTime: '1.5h', region: '乌鲁木齐天山区南塔网格' },
    { id: 'SJ202407010002', category: '特定内容高频访问', source: '营销活动平台', executionCustomer: '991*********1002', rating: '中', remainTime: '3.2h', region: '克拉玛依沙依巴克区红庙子网格' },
    { id: 'SJ202407010003', category: '地板价套餐查询', source: '外呼系统', executionCustomer: '991*********1003', rating: '高', remainTime: '0.8h', region: '吐鲁番天山区南塔网格' },
    { id: 'SJ202407010004', category: '零流量使用预警', source: '线上渠道', executionCustomer: '991*********1004', rating: '低', remainTime: '5.0h', region: '乌鲁木齐沙依巴克区友好路网格' },
    { id: 'SJ202407010005', category: '流量达量预警', source: '线下营业厅', executionCustomer: '991*********1005', rating: '高', remainTime: '2.1h', region: '克拉玛依新市区喀什东路网格' },
    { id: 'SJ202407010006', category: '特定内容高频访问', source: 'CRM系统', executionCustomer: '991*********1006', rating: '中', remainTime: '4.5h', region: '哈密新市区北京路网格' },
  ];

  // 我的商机 - 待处理的商机工单
  const myWorkOrders = [
    {
      id: 'SJ202406300001',
      category: '流量达量预警',
      executionCustomer: '991*********1007',
      rating: '高',
      status: '待处理',
      assignedAt: '2024-06-30 10:30',
      deadline: '2024-07-01 10:30',
      region: '乌鲁木齐天山区南塔网格',
      remainingHours: 8,
    },
    {
      id: 'SJ202406300002',
      category: '特定内容高频访问',
      executionCustomer: '991*********1008',
      rating: '中',
      status: '处理中',
      assignedAt: '2024-06-30 09:15',
      deadline: '2024-07-01 09:15',
      region: '克拉玛依沙依巴克区红庙子网格',
      remainingHours: 6,
    },
    {
      id: 'SJ202406290003',
      category: '地板价套餐查询',
      executionCustomer: '991*********1009',
      rating: '低',
      status: '待处理',
      assignedAt: '2024-06-29 16:00',
      deadline: '2024-06-30 16:00',
      region: '吐鲁番天山区南塔网格',
      remainingHours: -2,
    },
    {
      id: 'SJ202406290004',
      category: '零流量使用预警',
      executionCustomer: '991*********1010',
      rating: '高',
      status: '处理中',
      assignedAt: '2024-06-29 14:30',
      deadline: '2024-06-30 14:30',
      region: '乌鲁木齐沙依巴克区友好路网格',
      remainingHours: -4,
    },
    {
      id: 'SJ202406280005',
      category: '流量达量预警',
      executionCustomer: '991*********1011',
      rating: '高',
      status: '待处理',
      assignedAt: '2024-06-28 11:00',
      deadline: '2024-06-29 11:00',
      region: '巴州水磨沟区建设路网格',
      remainingHours: -26,
    },
  ];

  // 今日待办
  const todayTodos = [
    { id: 1, content: '处理 SJ202406300001 - 张某某流量达量预警商机', priority: '紧急', deadline: '14:00' },
    { id: 2, content: '跟进 SJ202406300002 - 郑某某特定内容高频访问商机', priority: '重要', deadline: '16:00' },
    { id: 3, content: '回访 SJ202406290003 - 王某某地板价套餐查询（已逾期）', priority: '紧急', deadline: '17:00' },
    { id: 4, content: '提交本周商机处理周报', priority: '一般', deadline: '18:00' },
  ];

  const ratingStyle: Record<string, string> = {
    '高': 'bg-red-100 text-red-600',
    '中': 'bg-amber-100 text-amber-600',
    '低': 'bg-emerald-100 text-emerald-600',
  };

  const priorityStyle: Record<string, string> = {
    '紧急': 'bg-red-100 text-red-700',
    '重要': 'bg-amber-100 text-amber-700',
    '一般': 'bg-blue-100 text-blue-700',
  };

  const workOrderStatusStyle: Record<string, string> = {
    '待处理': 'bg-amber-100 text-amber-700',
    '处理中': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* 个人绩效指标卡片 */}
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

      {/* 抢单池 - 仅单客户商机 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-500" />
            抢单池
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">单客户商机 {grabPool.length} 条</Badge>
            <span className="text-xs text-red-500 flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {grabPool.filter(o => parseFloat(o.remainTime) < 2).length} 条即将过期
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商机ID</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>区域</TableHead>
              <TableHead>评级</TableHead>
              <TableHead className="text-right">剩余时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grabPool.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                <TableCell>{opp.category}</TableCell>
                <TableCell className="text-muted-foreground">{opp.source}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm font-mono">{opp.executionCustomer}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{opp.region}</TableCell>
                <TableCell>
                  <Badge className={ratingStyle[opp.rating]} variant="secondary">{opp.rating}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`flex items-center justify-end gap-1 ${parseFloat(opp.remainTime) < 2 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    <Timer className="h-3 w-3" />
                    {opp.remainTime}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                    <Zap className="h-3 w-3 mr-1" />抢单
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 我的商机 - 待处理工单 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">我的商机</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              待处理 <Badge variant="secondary" className="ml-1">{myWorkOrders.filter(o => o.status === '待处理').length}</Badge>
            </span>
            <span className="text-muted-foreground">
              处理中 <Badge variant="secondary" className="ml-1">{myWorkOrders.filter(o => o.status === '处理中').length}</Badge>
            </span>
            <span className="text-red-500">
              已逾期 <Badge variant="destructive" className="ml-1">{myWorkOrders.filter(o => o.remainingHours < 0).length}</Badge>
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商机ID</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>区域</TableHead>
              <TableHead>评级</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>分配时间</TableHead>
              <TableHead className="text-right">剩余/逾期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myWorkOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>{order.category}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm font-mono">{order.executionCustomer}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.region}</TableCell>
                <TableCell>
                  <Badge className={ratingStyle[order.rating]} variant="secondary">{order.rating}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={workOrderStatusStyle[order.status]} variant="secondary">{order.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.assignedAt}</TableCell>
                <TableCell className="text-right">
                  {order.remainingHours >= 0 ? (
                    <span className="text-muted-foreground">{order.remainingHours}h</span>
                  ) : (
                    <span className="text-red-600 font-medium">逾期 {Math.abs(order.remainingHours)}h</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {order.status === '待处理' && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-800">
                        开始处理
                      </Button>
                    )}
                    {order.status === '处理中' && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 hover:text-emerald-800">
                        记录结果
                      </Button>
                    )}
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
