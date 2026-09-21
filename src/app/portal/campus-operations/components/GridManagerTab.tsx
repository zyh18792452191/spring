'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Send, Eye, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';


export default function GridManagerTab() {
  // 商机状态分布（单客户商机）
  const statusDistribution = [
    { name: '待派发', value: 86, color: '#94a3b8' },
    { name: '待抢单', value: 124, color: '#f59e0b' },
    { name: '处理中', value: 286, color: '#3b82f6' },
    { name: '已转化', value: 218, color: '#10b981' },
    { name: '已失败', value: 42, color: '#ef4444' },
    { name: '已逾期', value: 18, color: '#8b5cf6' },
    { name: '已回收', value: 82, color: '#6b7280' },
  ];

  // 人员绩效排名
  const personnelPerformance = [
    { name: '王明', handleCount: 68, conversionRate: 52.3, avgResponseMin: 12, pending: 8, processing: 15, overtime: 1 },
    { name: '李娜', handleCount: 62, conversionRate: 48.5, avgResponseMin: 15, pending: 5, processing: 12, overtime: 2 },
    { name: '张伟', handleCount: 55, conversionRate: 45.2, avgResponseMin: 18, pending: 10, processing: 18, overtime: 3 },
    { name: '赵敏', handleCount: 51, conversionRate: 43.8, avgResponseMin: 20, pending: 6, processing: 14, overtime: 1 },
    { name: '陈静', handleCount: 48, conversionRate: 41.5, avgResponseMin: 22, pending: 12, processing: 20, overtime: 4 },
    { name: '刘洋', handleCount: 45, conversionRate: 38.9, avgResponseMin: 25, pending: 9, processing: 16, overtime: 5 },
    { name: '杨磊', handleCount: 42, conversionRate: 36.2, avgResponseMin: 28, pending: 7, processing: 11, overtime: 2 },
    { name: '周芳', handleCount: 38, conversionRate: 33.5, avgResponseMin: 32, pending: 11, processing: 22, overtime: 6 },
  ];

  // 网格商机趋势
  const trendData = [
    { day: '6/25', processed: 32, newAdded: 28 },
    { day: '6/26', processed: 38, newAdded: 35 },
    { day: '6/27', processed: 42, newAdded: 31 },
    { day: '6/28', processed: 35, newAdded: 40 },
    { day: '6/29', processed: 45, newAdded: 38 },
    { day: '6/30', processed: 48, newAdded: 42 },
    { day: '7/01', processed: 52, newAdded: 45 },
  ];

  // 抢单池状态
  const grabPoolStats = {
    todayAvailable: 42,
    pendingGrab: 18,
    grabbed: 156,
    expiringSoon: 7,
    recycled: 23,
  };

  // 逾期商机列表
  const overdueList = [
    { id: 'SJ202406010005', category: '流量达量预警', executionCustomer: '991*********1001', overdueHours: 6.5, assignedTo: '张伟' },
    { id: 'SJ202405310007', category: '地板价套餐查询', executionCustomer: '991*********1002', overdueHours: 4.2, assignedTo: '陈静' },
    { id: 'SJ202405310008', category: '零流量使用预警', executionCustomer: '991*********1003', overdueHours: 8.1, assignedTo: '刘洋' },
    { id: 'SJ202405300003', category: '特定内容高频访问', executionCustomer: '991*********1004', overdueHours: 12.3, assignedTo: '杨磊' },
    { id: 'SJ202405300001', category: '流量达量预警', executionCustomer: '991*********1005', overdueHours: 5.8, assignedTo: '周芳' },
  ];

  return (
    <div className="space-y-4">
      {/* 商机整体情况 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">整体情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机总量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">12,458</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机执行率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">82.5</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机转化率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">38.6</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">逾期商机量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">156</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 本月商机情况 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">本月情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月商机量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">1,020</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.2%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月执行率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">85.3</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3.1pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月转化率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">40.2</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+1.8pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月逾期量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">12</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-2.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 第二行：状态分布 + 商机趋势 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 商机状态分布 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机状态分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
              >
                {statusDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusDistribution[index].color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {statusDistribution.map((item) => {
              const total = statusDistribution.reduce((s, d) => s + d.value, 0);
              return (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                  <span className="text-muted-foreground">({((item.value / total) * 100).toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 网格商机趋势 */}
        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-medium mb-4">近7日商机趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="processed" name="已处理" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="newAdded" name="新增" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 第三行：人员绩效 + 抢单池状态 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 人员绩效排名 */}
        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-medium mb-4">人员绩效排名</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">排名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead className="text-right">处理量</TableHead>
                <TableHead className="text-right">转化率</TableHead>
                <TableHead className="text-right">平均响应</TableHead>
                <TableHead className="text-right">待处理</TableHead>
                <TableHead className="text-right">处理中</TableHead>
                <TableHead className="text-right">超时</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnelPerformance.map((person, index) => (
                <TableRow key={person.name}>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                      index < 3 ? 'bg-blue-100 text-blue-700' : 'text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell className="text-right">{person.handleCount}</TableCell>
                  <TableCell className="text-right">
                    <span className={person.conversionRate >= 45 ? 'text-emerald-600' : person.conversionRate >= 38 ? 'text-amber-600' : 'text-red-600'}>
                      {person.conversionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{person.avgResponseMin}min</TableCell>
                  <TableCell className="text-right">
                    <span className={person.pending >= 10 ? 'text-red-600 font-medium' : ''}>{person.pending}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-blue-600">{person.processing}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={person.overtime > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>{person.overtime}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* 抢单池状态 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">抢单池状态</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-xs text-blue-600 mb-1">今日可抢单量</div>
              <div className="text-2xl font-bold text-blue-700">{grabPoolStats.todayAvailable}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-xs text-amber-600 mb-1">待抢单量</div>
                <div className="text-lg font-bold text-amber-700">{grabPoolStats.pendingGrab}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-xs text-emerald-600 mb-1">已抢单量</div>
                <div className="text-lg font-bold text-emerald-700">{grabPoolStats.grabbed}</div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">即将逾期量</span>
                </div>
                <div className="text-lg font-bold text-red-700">{grabPoolStats.expiringSoon}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="text-xs text-muted-foreground mb-1">已回收量</div>
                <div className="text-lg font-bold">{grabPoolStats.recycled}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 第四行：逾期商机列表 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            逾期商机
          </h3>
          <Badge variant="destructive" className="text-xs">{overdueList.length} 条逾期</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商机ID</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>执行客户</TableHead>
              <TableHead className="text-right">逾期时长</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueList.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                <TableCell>{opp.category}</TableCell>
                <TableCell className="font-mono">{opp.executionCustomer}</TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600 font-medium">{opp.overdueHours}h</span>
                </TableCell>
                <TableCell>{opp.assignedTo}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-800">
                      <Send className="h-3 w-3 mr-1" />催办
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-foreground">
                      <Eye className="h-3 w-3 mr-1" />查看
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
