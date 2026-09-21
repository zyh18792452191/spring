'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMounted } from '@/hooks/useMounted';

// 16地市分公司列表（按规模大致排序）
const PROVINCES = [
  '乌鲁木齐', '克拉玛依', '喀什', '伊犁', '昌吉', '阿克苏', '巴州', '哈密', '石河子', '奎屯',
  '吐鲁番', '塔城', '和田', '博州', '阿勒泰', '克州'
];

// 省份指标数据类型
export interface ProvinceMetricData {
  province: string;
  value: number;
  change: number;
  trend: {
    month: string;
    value: number;
    change: number;
  }[];
}

// 生成省份数据的辅助函数
export function generateProvinceData(
  baseValue: number,
  changeType: 'percent' | 'pp',
  isRate: boolean = false
): ProvinceMetricData[] {
  return PROVINCES.map((province, index) => {
    // 根据省份序号生成不同的值，模拟真实分布
    const factor = 1 - (index * 0.03) + (Math.random() * 0.1 - 0.05);
    const provinceValue = isRate 
      ? Math.min(99.9, Math.max(85, baseValue * factor))
      : baseValue * factor;
    
    // 同比/环比变化
    const changeValue = changeType === 'pp' 
      ? (Math.random() * 4 - 1).toFixed(1) as unknown as number
      : (Math.random() * 20 - 5).toFixed(1) as unknown as number;
    
    // 近6个月趋势
    const trend = [];
    let trendValue = provinceValue;
    for (let i = 0; i < 6; i++) {
      const monthChange = changeType === 'pp'
        ? (Math.random() * 2 - 0.5)
        : (Math.random() * 10 - 3);
      trendValue = isRate
        ? Math.min(99.9, Math.max(85, trendValue + (Math.random() * 1 - 0.3)))
        : trendValue * (1 + (Math.random() * 0.1 - 0.05));
      
      trend.push({
        month: ['2月', '3月', '4月', '5月', '6月', '7月'][i],
        value: Number(trendValue.toFixed(2)),
        change: Number(monthChange.toFixed(1))
      });
    }
    
    return {
      province,
      value: Number(provinceValue.toFixed(2)),
      change: Number(changeValue),
      trend
    };
  }).sort((a, b) => b.value - a.value); // 按值降序排列
}

interface ProvinceDetailDialogProps {
  open: boolean;
  onClose: () => void;
  indicatorName: string;
  provinceData: ProvinceMetricData[];
  changeLabel: string; // '环比' 或 '同比'
  changeUnit: string;  // '%' 或 'pp'
  isRate?: boolean;    // 是否是比率类指标
}

export default function ProvinceDetailDialog({
  open,
  onClose,
  indicatorName,
  provinceData,
  changeLabel,
  changeUnit,
  isRate = false
}: ProvinceDetailDialogProps) {
  const mounted = useMounted();
  const [selectedProvince, setSelectedProvince] = useState<ProvinceMetricData | null>(null);
  
  useEffect(() => {
    if (open && provinceData.length > 0) {
      setSelectedProvince(provinceData[0]); // 默认选中第一个（最大值）
    }
  }, [open, provinceData]);
  
  if (!open) return null;
  
  const handleBarClick = (data: ProvinceMetricData) => {
    setSelectedProvince(data);
  };

  
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-[1200px] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{indicatorName}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* 内容区 */}
        <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
          {/* 16地市分公司分布柱线图 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">16地市分公司分布</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#1E90FF]"></div>
                  <span>指标值</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-0.5 rounded bg-[#FF6B6B]"></div>
                  <span>{changeLabel}</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={provinceData} barCategoryGap="10%">
                  <XAxis 
                    dataKey="province" 
                    tick={{ fontSize: 9 }} 
                    axisLine={false} 
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                    domain={isRate ? [85, 100] : ['auto', 'auto']}
                    tickFormatter={(value) => isRate ? `${value}%` : value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}${changeUnit}`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'value') {
                        return [isRate ? `${value}%` : value.toLocaleString(), '指标值'];
                      }
                      return [`${value > 0 ? '+' : ''}${value}${changeUnit}`, changeLabel];
                    }}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="value" 
                    fill="#1E90FF" 
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                    onClick={(data) => handleBarClick(data)}
                    className="cursor-pointer"
                  >
                    {provinceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedProvince?.province === entry.province ? '#0066CC' : '#1E90FF'}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="change" 
                    stroke="#FF6B6B" 
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: '#FF6B6B' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">点击柱子可查看该地州趋势</div>
          </div>
          
          {/* 选中地州趋势图 */}
          {selectedProvince && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {selectedProvince.province} - 近6个月趋势
              </h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={selectedProvince.trend}>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false}
                      domain={isRate ? [85, 100] : ['auto', 'auto']}
                      tickFormatter={(value) => isRate ? `${value}%` : value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}${changeUnit}`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'value') {
                          return [isRate ? `${value}%` : value.toLocaleString(), '指标值'];
                        }
                        return [`${value > 0 ? '+' : ''}${value}${changeUnit}`, changeLabel];
                      }}
                      contentStyle={{ borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="value" 
                      fill="#1E90FF" 
                      radius={[2, 2, 0, 0]}
                      barSize={30}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="change" 
                      stroke="#FF6B6B" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#FF6B6B' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
