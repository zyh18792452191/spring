'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUp, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CITIES,
  CITY_WATCH_DATA,
  GRID_DISPATCH_STAT,
  CUSTOMER_TYPE_OPTIONS,
  CustomerType,
} from '../data';
import { USER_WATCH_TREE, GRID_DISPATCH_TREE, getLevelData, WatchNode } from '../drillViewData';
import SectionCard from './SectionCard';

// 进度环（参照原型 el-progress-circle，#3471ff）
function ProgressRing({ value, size = 120 }: { value: number; size?: number }) {
  const r = Math.round(size * 0.42);
  const stroke = Math.round(size * 0.095);
  const c = 2 * Math.PI * r;
  const offset = c - (c * value) / 100;
  const center = size / 2;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={r} stroke="#ebeef5" strokeWidth={stroke} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke="#3471ff"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className={cn('absolute font-semibold text-gray-800', size >= 100 ? 'text-lg' : 'text-sm')}>{value}%</span>
    </div>
  );
}

interface ChartDatum {
  name: string;
  value: number;
}

// 全疆层：横向蓝色条形图（参照原型 视图.png）
function HorizontalBlueChart({ data, name, onBarClick }: { data: ChartDatum[]; name: string; onBarClick: (n: string) => void }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#999' }} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#666' }} />
        <Tooltip cursor={{ fill: 'rgba(52,113,255,0.06)' }} />
        <Bar
          dataKey="value"
          name={name}
          fill="#3471ff"
          barSize={10}
          radius={[0, 4, 4, 0]}
          onClick={(entry: { name?: string }) => entry?.name && onBarClick(entry.name)}
          cursor="pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// 当前层级标签（原型：全疆 / 哈密 / 哈密 伊吾）
function levelLabel(path: string[]) {
  return path.length > 0 ? path.join(' ') : '全疆';
}

// Tab1 全量用户看管视图
export default function UserWatchView() {
  const [cityFilter, setCityFilter] = useState('ALL');
  const [customerType, setCustomerType] = useState<CustomerType>('ALL');
  // 下钻路径：全量用户归属关系（地州→区县→网格）
  const [watchPath, setWatchPath] = useState<string[]>([]);
  // 下钻路径：物理网格分派情况（地州→区县）
  const [dispatchPath, setDispatchPath] = useState<string[]>([]);

  const handleQuery = () => setWatchPath(cityFilter === 'ALL' ? [] : [cityFilter]);
  const handleReset = () => {
    setCityFilter('ALL');
    setCustomerType('ALL');
    setWatchPath([]);
    setDispatchPath([]);
  };

  const isGlobal = customerType === 'GLOBAL';
  const totalCustomers = CITY_WATCH_DATA.reduce((s, i) => s + (isGlobal ? i.globalCount : i.customerCount), 0);
  const valueOf = (n: WatchNode) => (isGlobal ? n.globalCount : n.customerCount);

  // ===== 全量用户归属关系（日）下钻层级 =====
  const watchLevel = getLevelData(USER_WATCH_TREE, watchPath);
  const watchValue = watchPath.length > 0 && watchLevel.node ? valueOf(watchLevel.node) : totalCustomers;
  const watchChartData: ChartDatum[] = (watchPath.length > 0 ? watchLevel.data : USER_WATCH_TREE).map((n) => ({
    name: n.name,
    value: valueOf(n),
  }));
  const watchDrill = (name: string) => {
    // 仅当该节点存在子级时继续下钻
    const target = watchLevel.data.find((d) => d.name === name);
    if (target?.children?.length) setWatchPath([...watchPath, name]);
  };

  // ===== 物理网格分派情况（日）下钻层级 =====
  const dispatchLevel = getLevelData(GRID_DISPATCH_TREE, dispatchPath);
  const dispatchCurrent = dispatchPath.length > 0 ? dispatchLevel.node : null;
  const dispatchStat = dispatchCurrent
    ? {
        dispatchedGrids: dispatchCurrent.dispatchedGrids,
        undispatchedGrids: dispatchCurrent.undispatchedGrids,
        dispatchRate:
          dispatchCurrent.dispatchedGrids + dispatchCurrent.undispatchedGrids > 0
            ? Math.round((dispatchCurrent.dispatchedGrids / (dispatchCurrent.dispatchedGrids + dispatchCurrent.undispatchedGrids)) * 100)
            : 0,
      }
    : GRID_DISPATCH_STAT;
  const dispatchChartData: ChartDatum[] = (dispatchPath.length > 0 ? dispatchLevel.data : GRID_DISPATCH_TREE).map((n) => ({
    name: n.name,
    value: n.dispatchedGrids,
  }));
  const dispatchDrill = (name: string) => {
    const target = dispatchLevel.data.find((d) => d.name === name);
    if (target?.children?.length) setDispatchPath([...dispatchPath, name]);
  };

  return (
    <div className="space-y-4">
      {/* 筛选区 */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 h-9 px-3 bg-[#3471ff]/10 rounded-md">
              <span className="text-sm text-gray-600 whitespace-nowrap">当前选择</span>
              <span className="text-sm font-medium text-[#3471ff]">
                {watchPath.length > 0 ? watchPath[watchPath.length - 1] : '全疆'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                <span className="text-red-500 mr-0.5">*</span>地市选择
              </label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="ALL">全疆</SelectItem>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">客户类型</label>
              <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={cn(
                      'px-3 h-8 rounded text-sm font-medium transition-colors',
                      customerType === opt.value ? 'bg-white text-[#3471ff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                    onClick={() => setCustomerType(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />重置
              </Button>
              <Button size="sm" className="bg-[#3471ff] hover:bg-[#3471ff]/90" onClick={handleQuery}>
                <Search className="w-4 h-4 mr-1" />查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 全量用户归属关系（日） */}
      <SectionCard
        title="全量用户归属关系（日）"
        action={
          watchPath.length > 0 ? (
            <Button variant="ghost" size="sm" className="text-[#3471ff] h-7" onClick={() => setWatchPath(watchPath.slice(0, -1))}>
              <ArrowUp className="w-4 h-4 mr-1" />返回上层
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-48 shrink-0">
            <div className="text-sm text-gray-500">{levelLabel(watchPath)} 看管客户数</div>
            <div className="text-3xl font-bold text-[#3471ff] mt-2">{watchValue.toLocaleString()}</div>
            {watchPath.length > 0 && watchLevel.node && (
              <div className="mt-4 space-y-1 text-sm text-gray-500">
                <div>看管全球通客户数：<span className="text-gray-900 font-medium">{watchLevel.node.globalCount}</span></div>
              </div>
            )}
            <div className="mt-3 text-xs text-gray-400">{isGlobal ? '统计口径：全球通客户' : '统计口径：全量客户'}</div>
          </div>
          <div className="w-full lg:flex-1 h-[250px] min-h-[250px]">
            <HorizontalBlueChart data={watchChartData} name={isGlobal ? '看管全球通客户数' : '看管客户数'} onBarClick={watchDrill} />
            <div className="text-center text-xs text-gray-400 -mt-2">
              {watchPath.length === 0
                ? '点击柱条可下钻查看对应地州（提示：16个地州柱条均可点击下钻）'
                : watchPath.length >= 2
                  ? '当前为最细粒度（网格级），点击右上角"返回上层"可逐级返回'
                  : '点击柱条可继续下钻查看对应区县/网格'}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 物理网格分派情况（日） */}
      <SectionCard
        title="物理网格分派情况 （日）"
        action={
          dispatchPath.length > 0 ? (
            <Button variant="ghost" size="sm" className="text-[#3471ff] h-7" onClick={() => setDispatchPath(dispatchPath.slice(0, -1))}>
              <ArrowUp className="w-4 h-4 mr-1" />返回上层
            </Button>
          ) : undefined
        }
      >
        {/* 统计项网格（参照原型 el-row 3列卡片） */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg px-5 py-4">
            <div className="text-sm text-gray-500">{levelLabel(dispatchPath)} 分派网格数</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{dispatchStat.dispatchedGrids.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-5 py-4">
            <div className="text-sm text-gray-500">{levelLabel(dispatchPath)} 未分配网格数</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{dispatchStat.undispatchedGrids.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">{levelLabel(dispatchPath)} 网格分派率</div>
              <div className="text-2xl font-bold text-[#3471ff] mt-1">{dispatchStat.dispatchRate}%</div>
            </div>
            <ProgressRing value={dispatchStat.dispatchRate} size={64} />
          </div>
        </div>

        {/* 分派网格数分布图（参照原型 charts 区域） */}
        <div className="mt-4 h-[250px] min-h-[250px]">
          <HorizontalBlueChart data={dispatchChartData} name="已分派物理网格数" onBarClick={dispatchDrill} />
          <div className="text-center text-xs text-gray-400 -mt-2">
            {dispatchPath.length === 0
              ? '点击柱条可下钻查看对应地州区县分布'
              : '按区县已分派物理网格数分布，点击右上角"返回上层"可返回'}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
