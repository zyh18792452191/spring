'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Legend } from 'recharts';

// 颜色常量 - 三级分类
const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

// 默认商机分类数据（流量运营）
const DEFAULT_CATEGORY_DATA = [
  { name: '流量达量预警', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '特定内容高频访问', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '地板价套餐查询', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '零流量使用预警', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

// 分类数据项接口
interface CategoryDataItem {
  name: string;
  parent: string;
  count: number;
  executionRate: number;
  conversionRate: number;
}

interface LeaderTabProps {
  categoryData?: CategoryDataItem[];
}

export default function LeaderTab({ categoryData }: LeaderTabProps) {
  // 使用传入的分类数据或默认数据
  const categories = categoryData && categoryData.length > 0 ? categoryData : DEFAULT_CATEGORY_DATA;
  
  // 商机趋势数据
  const trendData = [
    { month: '2024-01', opportunities: 680, executionRate: 72.3, conversionRate: 32.5 },
    { month: '2024-02', opportunities: 750, executionRate: 74.1, conversionRate: 33.8 },
    { month: '2024-03', opportunities: 820, executionRate: 76.5, conversionRate: 35.2 },
    { month: '2024-04', opportunities: 890, executionRate: 78.2, conversionRate: 36.5 },
    { month: '2024-05', opportunities: 950, executionRate: 80.1, conversionRate: 37.8 },
    { month: '2024-06', opportunities: 1020, executionRate: 82.5, conversionRate: 38.6 },
  ];

  // 区域排名数据
  const regionRankData = [
    { name: '乌鲁木齐', value: 1856, conversionRate: 42.5 },
    { name: '克拉玛依', value: 1620, conversionRate: 41.2 },
    { name: '吐鲁番', value: 980, conversionRate: 39.8 },
    { name: '哈密', value: 820, conversionRate: 38.5 },
    { name: '巴州', value: 760, conversionRate: 37.2 },
    { name: '阿克苏', value: 680, conversionRate: 36.1 },
    { name: '博州', value: 620, conversionRate: 35.0 },
    { name: '喀什', value: 550, conversionRate: 34.2 },
    { name: '昌吉', value: 480, conversionRate: 33.5 },
    { name: '和田', value: 420, conversionRate: 32.1 },
    { name: '伊犁', value: 380, conversionRate: 31.0 },
    { name: '塔城', value: 320, conversionRate: 29.8 },
    { name: '阿勒泰', value: 290, conversionRate: 28.5 },
    { name: '克州', value: 378, conversionRate: 30.2 },
  ].sort((a, b) => b.value - a.value);

  // 下级区域关键指标
  const regionDetailData = [
    { name: '乌鲁木齐', total: 1856, monthlyTotal: 285, monthlyExecutionRate: 85.2, monthlyConversionRate: 42.5, monthlyOverdue: 8 },
    { name: '克拉玛依', total: 1620, monthlyTotal: 252, monthlyExecutionRate: 83.8, monthlyConversionRate: 41.2, monthlyOverdue: 7 },
    { name: '吐鲁番', total: 980, monthlyTotal: 156, monthlyExecutionRate: 81.5, monthlyConversionRate: 39.8, monthlyOverdue: 5 },
    { name: '哈密', total: 820, monthlyTotal: 128, monthlyExecutionRate: 79.2, monthlyConversionRate: 38.5, monthlyOverdue: 4 },
    { name: '巴州', total: 760, monthlyTotal: 118, monthlyExecutionRate: 78.0, monthlyConversionRate: 37.2, monthlyOverdue: 4 },
    { name: '阿克苏', total: 680, monthlyTotal: 105, monthlyExecutionRate: 76.5, monthlyConversionRate: 36.1, monthlyOverdue: 3 },
    { name: '博州', total: 620, monthlyTotal: 96, monthlyExecutionRate: 75.0, monthlyConversionRate: 35.0, monthlyOverdue: 3 },
    { name: '喀什', total: 550, monthlyTotal: 85, monthlyExecutionRate: 73.8, monthlyConversionRate: 34.2, monthlyOverdue: 2 },
    { name: '昌吉', total: 480, monthlyTotal: 74, monthlyExecutionRate: 72.5, monthlyConversionRate: 33.5, monthlyOverdue: 2 },
    { name: '和田', total: 420, monthlyTotal: 65, monthlyExecutionRate: 71.0, monthlyConversionRate: 32.1, monthlyOverdue: 2 },
    { name: '伊犁', total: 380, monthlyTotal: 59, monthlyExecutionRate: 69.8, monthlyConversionRate: 31.0, monthlyOverdue: 2 },
    { name: '塔城', total: 320, monthlyTotal: 50, monthlyExecutionRate: 68.5, monthlyConversionRate: 29.8, monthlyOverdue: 1 },
    { name: '阿勒泰', total: 290, monthlyTotal: 45, monthlyExecutionRate: 67.2, monthlyConversionRate: 28.5, monthlyOverdue: 1 },
    { name: '克州', total: 378, monthlyTotal: 58, monthlyExecutionRate: 68.0, monthlyConversionRate: 30.2, monthlyOverdue: 2 },
  ];

  // 预警概览 - 双域预警
  const warningTypeData = [
    { type: '待调度商机积压', code: 'PENDING_OVERFLOW', count: 5, level: '重要', levelColor: 'bg-orange-500', domain: '执行域' },
    { type: '商机执行逾期', code: 'OVERTIME', count: 3, level: '紧急', levelColor: 'bg-red-500', domain: '执行域' },
    { type: '商机转化率过低', code: 'LOW_CONVERSION', count: 2, level: '重要', levelColor: 'bg-orange-500', domain: '执行域' },
    { type: '清洗规则剔除率突增', code: 'CLEAN_RATE_SURGE', count: 4, level: '一般', levelColor: 'bg-yellow-500', domain: '预测域' },
    { type: '商机源采集异常', code: 'SOURCE_ABNORMAL', count: 6, level: '紧急', levelColor: 'bg-red-500', domain: '预测域' },
    { type: '预测模型准确率下降', code: 'MODEL_ACCURACY_DROP', count: 2, level: '重要', levelColor: 'bg-orange-500', domain: '预测域' },
  ];

  // 预测健康度 - 采集→清洗→入模→预测各环节通过率
  const predictionHealthData = [
    { stage: '采集', count: 12458, rate: 100 },
    { stage: '清洗后', count: 10820, rate: 86.8 },
    { stage: '入模', count: 9560, rate: 88.4 },
    { stage: '预测产出', count: 8562, rate: 89.6 },
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

      {/* 第二行：商机趋势 + 分类占比 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机趋势</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[25, 50]} unit="%" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="opportunities" name="商机量" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={24} />
              <Line yAxisId="right" type="monotone" dataKey="executionRate" name="调度完成率(%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="转化率(%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机分类占比</h3>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-[140px]">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="count">
                    {categories.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              {categories.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-1.5 rounded bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index] }} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                    <span className={item.conversionRate >= 40 ? 'text-emerald-600' : item.conversionRate >= 35 ? 'text-amber-600' : 'text-red-600'}>
                      {item.conversionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 预测健康度漏斗 - 隐藏 */}
      {false && (
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">预测健康度（原料→产出）</h3>
        </Card>
      )}

      {/* 区域商机量排名 - 隐藏 */}
      {false && (
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">区域商机量排名</h3>
        </Card>
      )}

      {/* 第四行：下级区域关键指标 */}
      <Card className="p-5">
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

      {/* 第五行：双域预警概览 */}
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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{w.level}</p>
                  <span className={`text-[10px] px-1 py-0.5 rounded ${w.domain === '预测域' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{w.domain}</span>
                </div>
              </div>
              <p className="text-xl font-bold flex-shrink-0">{w.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
