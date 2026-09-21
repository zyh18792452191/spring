'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Legend } from 'recharts';

// 颜色常量 - 三级分类
const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default function LeaderTab() {
  // 商机趋势数据
  const trendData = [
    { month: '2024-01', opportunities: 1850, executionRate: 72.3, conversionRate: 38.5 },
    { month: '2024-02', opportunities: 1920, executionRate: 74.1, conversionRate: 39.2 },
    { month: '2024-03', opportunities: 2010, executionRate: 75.8, conversionRate: 40.1 },
    { month: '2024-04', opportunities: 2150, executionRate: 76.2, conversionRate: 41.5 },
    { month: '2024-05', opportunities: 2230, executionRate: 77.1, conversionRate: 42.0 },
    { month: '2024-06', opportunities: 2298, executionRate: 76.5, conversionRate: 42.3 },
  ];

  // 区域排名数据
  const regionRankData = [
    { name: '乌鲁木齐', value: 2456, conversionRate: 44.2 },
    { name: '克拉玛依', value: 2103, conversionRate: 43.1 },
    { name: '吐鲁番', value: 1256, conversionRate: 41.5 },
    { name: '哈密', value: 1023, conversionRate: 40.2 },
    { name: '巴州', value: 985, conversionRate: 39.8 },
    { name: '阿克苏', value: 892, conversionRate: 38.5 },
    { name: '博州', value: 845, conversionRate: 37.2 },
    { name: '喀什', value: 768, conversionRate: 36.8 },
    { name: '昌吉', value: 654, conversionRate: 35.5 },
    { name: '和田', value: 589, conversionRate: 34.2 },
    { name: '伊犁', value: 523, conversionRate: 33.1 },
    { name: '塔城', value: 456, conversionRate: 31.8 },
    { name: '阿勒泰', value: 412, conversionRate: 30.5 },
    { name: '克州', value: 502, conversionRate: 32.4 },
  ].sort((a, b) => b.value - a.value);

  // 商机分类占比 - 三级分类
  const categoryData = [
    { name: '流量达量预警', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
    { name: '特定内容高频访问', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
    { name: '地板价套餐查询', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
    { name: '零流量使用预警', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
  ];

  // 下级区域关键指标
  const regionDetailData = [
    { name: '乌鲁木齐', total: 2456, monthlyTotal: 378, monthlyExecutionRate: 78.5, monthlyConversionRate: 44.2, monthlyOverdue: 9 },
    { name: '克拉玛依', total: 2103, monthlyTotal: 325, monthlyExecutionRate: 77.2, monthlyConversionRate: 43.1, monthlyOverdue: 8 },
    { name: '吐鲁番', total: 1256, monthlyTotal: 198, monthlyExecutionRate: 75.8, monthlyConversionRate: 41.5, monthlyOverdue: 6 },
    { name: '哈密', total: 1023, monthlyTotal: 158, monthlyExecutionRate: 74.1, monthlyConversionRate: 40.2, monthlyOverdue: 5 },
    { name: '巴州', total: 985, monthlyTotal: 152, monthlyExecutionRate: 73.5, monthlyConversionRate: 39.8, monthlyOverdue: 5 },
    { name: '阿克苏', total: 892, monthlyTotal: 138, monthlyExecutionRate: 72.8, monthlyConversionRate: 38.5, monthlyOverdue: 4 },
    { name: '博州', total: 845, monthlyTotal: 130, monthlyExecutionRate: 71.2, monthlyConversionRate: 37.2, monthlyOverdue: 4 },
    { name: '喀什', total: 768, monthlyTotal: 118, monthlyExecutionRate: 70.5, monthlyConversionRate: 36.8, monthlyOverdue: 3 },
    { name: '昌吉', total: 654, monthlyTotal: 101, monthlyExecutionRate: 69.8, monthlyConversionRate: 35.5, monthlyOverdue: 3 },
    { name: '和田', total: 589, monthlyTotal: 91, monthlyExecutionRate: 68.2, monthlyConversionRate: 34.2, monthlyOverdue: 2 },
    { name: '伊犁', total: 523, monthlyTotal: 80, monthlyExecutionRate: 67.5, monthlyConversionRate: 33.1, monthlyOverdue: 2 },
    { name: '塔城', total: 456, monthlyTotal: 70, monthlyExecutionRate: 66.8, monthlyConversionRate: 31.8, monthlyOverdue: 2 },
    { name: '阿勒泰', total: 412, monthlyTotal: 63, monthlyExecutionRate: 65.2, monthlyConversionRate: 30.5, monthlyOverdue: 2 },
    { name: '克州', total: 502, monthlyTotal: 77, monthlyExecutionRate: 66.1, monthlyConversionRate: 32.4, monthlyOverdue: 2 },
  ];

  // 预警概览 - 按预警类型归类
  const warningTypeData = [
    { type: '待处理商机积压', code: 'PENDING_OVERFLOW', count: 5, level: '重要', levelColor: 'bg-orange-500' },
    { type: '商机逾期', code: 'OVERTIME', count: 3, level: '紧急', levelColor: 'bg-red-500' },
    { type: '商机类型转化率过低', code: 'LOW_CONVERSION', count: 2, level: '重要', levelColor: 'bg-orange-500' },
    { type: '清洗规则剔除率突增', code: 'CLEAN_RATE_SURGE', count: 4, level: '一般', levelColor: 'bg-yellow-500' },
    { type: '商机源采集异常', code: 'SOURCE_ABNORMAL', count: 6, level: '紧急', levelColor: 'bg-red-500' },
    { type: '抢单池回收率过高', code: 'GRAB_RECYCLE_HIGH', count: 3, level: '一般', levelColor: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-3">
      {/* 商机整体情况 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">整体情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机总量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">8,320</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机执行率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">78.5</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机转化率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">35.2</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">逾期商机量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">98</span>
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
                  <span className="text-xl font-bold text-foreground">680</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5.6%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月执行率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">80.1</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+2.4pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月转化率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">36.8</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+1.2pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月逾期量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">8</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-1.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 第二行：趋势图 + 分类占比 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 商机趋势 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机趋势</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[30, 50]} unit="%" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="opportunities" name="商机量" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={24} />
              <Line yAxisId="right" type="monotone" dataKey="executionRate" name="执行率(%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="转化率(%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* 商机分类占比 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机分类占比</h3>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-[180px]">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="count"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 pt-1">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index] }} />
                    <div>
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground block">{item.parent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">商机量 </span>
                      <span className="font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">执行率 </span>
                      <span className={`font-semibold ${item.executionRate >= 75 ? 'text-emerald-600' : item.executionRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {item.executionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">转化率 </span>
                      <span className={`font-semibold ${item.conversionRate >= 40 ? 'text-emerald-600' : item.conversionRate >= 35 ? 'text-amber-600' : 'text-red-600'}`}>
                        {item.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 第三行：区域排名 + 区域指标表格 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 区域分布排名 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">区域商机量排名</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={regionRankData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={(value: number) => [value, '商机量']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14}>
                {regionRankData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 下级区域关键指标 */}
        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-medium mb-4">下级区域关键指标</h3>
          <div className="border rounded-md">
            <div className="max-h-[320px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">排名</TableHead>
                    <TableHead className="w-24">区域</TableHead>
                    <TableHead className="text-right w-24">商机总量</TableHead>
                    <TableHead className="text-right w-28">本月商机总量</TableHead>
                    <TableHead className="text-right w-28">本月商机执行率</TableHead>
                    <TableHead className="text-right w-28">本月商机转化率</TableHead>
                    <TableHead className="text-right w-28">本月逾期商机量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionDetailData.map((row, index) => (
                    <TableRow key={row.name}>
                      <TableCell className="text-center w-12">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                          index < 3 ? 'bg-blue-100 text-blue-700' : 'text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium w-24">{row.name}</TableCell>
                      <TableCell className="text-right w-24">{row.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right w-28">{row.monthlyTotal.toLocaleString()}</TableCell>
                      <TableCell className="text-right w-28">{row.monthlyExecutionRate}%</TableCell>
                      <TableCell className="text-right w-28">{row.monthlyConversionRate}%</TableCell>
                      <TableCell className="text-right w-28">{row.monthlyOverdue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>

      {/* 第四行：预警概览 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">预警概览</h3>
          <Badge variant="outline" className="text-xs">共 {warningTypeData.reduce((sum, w) => sum + w.count, 0)} 条活跃预警</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {warningTypeData.map((w) => (
            <div key={w.code} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${w.levelColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.type}</p>
                <p className="text-xs text-muted-foreground">{w.level}</p>
              </div>
              <p className="text-xl font-bold flex-shrink-0">{w.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
