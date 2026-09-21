'use client';

import React from 'react';
import { useMounted } from '@/hooks/useMounted';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

interface ChartThumbnailProps {
  type: 'line' | 'bar' | 'pie' | 'barline' | 'area';
  color?: string;
  size?: number;
}

// 生成模拟数据
const generateLineData = () => [
  { value: 30 },
  { value: 45 },
  { value: 28 },
  { value: 50 },
  { value: 35 },
  { value: 55 }
];

const generateBarData = () => [
  { value: 40 },
  { value: 65 },
  { value: 45 },
  { value: 70 },
  { value: 55 }
];

const generatePieData = (color: string) => [
  { value: 35, color: color },
  { value: 25, color: `${color}99` },
  { value: 20, color: `${color}66` },
  { value: 20, color: `${color}33` }
];

const generateAreaData = () => [
  { value: 20 },
  { value: 35 },
  { value: 28 },
  { value: 45 },
  { value: 38 },
  { value: 52 }
];

const generateBarLineData = () => [
  { bar: 40, line: 35 },
  { bar: 55, line: 45 },
  { bar: 45, line: 50 },
  { bar: 60, line: 55 },
  { bar: 50, line: 48 }
];

export default function ChartThumbnail({ type, color = '#3B82F6', size = 40 }: ChartThumbnailProps) {
  const mounted = useMounted();
  if (!mounted) return null;

  const chartStyle = {
    width: size,
    height: size
  };

  switch (type) {
    case 'line':
      return (
        <div style={chartStyle} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generateLineData()}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
      
    case 'bar':
      return (
        <div style={chartStyle} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={generateBarData()}>
              <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
      
    case 'pie':
      return (
        <div style={chartStyle} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={generatePieData(color)}
                dataKey="value"
                innerRadius={size * 0.15}
                outerRadius={size * 0.4}
                paddingAngle={1}
              >
                {generatePieData(color).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
      
    case 'barline':
      return (
        <div style={chartStyle} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={generateBarLineData()}>
              <Bar dataKey="bar" fill={color} radius={[2, 2, 0, 0]} barSize={size * 0.15} />
              <Line
                type="monotone"
                dataKey="line"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      );
      
    case 'area':
      return (
        <div style={chartStyle} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateAreaData()}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`${color}33`}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
      
    default:
      return (
        <div style={chartStyle} className="flex items-center justify-center text-gray-400">
          <span className="text-xs">N/A</span>
        </div>
      );
  }
}
