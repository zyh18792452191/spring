'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface MetricData {
  name: string;
  currentValue: number;
  unit: string;
  monthOverMonth: number;
  yearOverYear?: number;
  trendData: number[]; // 6个月的数据（7月-12月）
}

interface DimensionCardProps {
  title: string;
  metrics: MetricData[];
  color?: string; // 主色调
}

const DimensionCard: React.FC<DimensionCardProps> = ({ title, metrics, color = '#3b82f6' }) => {
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chartInstances = useRef<echarts.ECharts[]>([]);

  useEffect(() => {
    // 初始化所有图表
    metrics.forEach((metric, index) => {
      const chartRef = chartRefs.current[index];
      if (!chartRef) return;

      if (!chartInstances.current[index]) {
        chartInstances.current[index] = echarts.init(chartRef);
      }

      const option: echarts.EChartsOption = {
        grid: {
          top: 30,
          left: 0,
          right: 0,
          bottom: 20,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: ['7月', '8月', '9月', '10月', '11月', '12月'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#6b7280',
            fontSize: 10,
          },
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        series: [
          {
            data: metric.trendData,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: color,
              width: 2,
            },
            itemStyle: {
              color: color,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${color}40` },
                { offset: 1, color: `${color}05` },
              ]),
            },
          },
        ],
      };

      chartInstances.current[index].setOption(option);
    });

    // 响应式处理
    const handleResize = () => {
      chartInstances.current.forEach((chart) => {
        if (chart) {
          chart.resize();
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [metrics, color]);

  const setChartRef = (index: number) => (el: HTMLDivElement | null) => {
    chartRefs.current[index] = el;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 顶部装饰条和标题 */}
      <div className="relative h-10 flex items-center px-4 bg-gradient-to-r from-blue-600/10 to-transparent">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent" />
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm ml-3">{title}</h3>
      </div>

      {/* 指标列表 */}
      <div className="p-4 space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            {/* 指标名称 - 独立一行 */}
            <div className="text-xs text-gray-500 dark:text-gray-400">{metric.name}</div>
            
            {/* 趋势图和数值 - 左右排布 */}
            <div className="flex gap-4">
              {/* 左侧：趋势图 */}
              <div className="flex-[2]">
                <div
                  ref={setChartRef(index)}
                  className="h-24 w-full"
                />
              </div>

              {/* 右侧：核心数值 */}
              <div className="w-24 flex flex-col justify-center space-y-1">
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  {metric.unit === '%' 
                    ? `${metric.currentValue.toFixed(2)}%`
                    : `${metric.currentValue.toLocaleString()} ${metric.unit}`
                  }
                </div>
                <div className={`text-xs flex items-center ${metric.monthOverMonth >= 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  <span className="mr-1">
                    {metric.monthOverMonth >= 0 ? '↑' : '↓'}
                  </span>
                  <span>环比 {Math.abs(metric.monthOverMonth).toFixed(2)} pp</span>
                </div>
                <div className={`text-xs flex items-center ${(metric.yearOverYear ?? 0) >= 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  <span className="mr-1">
                    {(metric.yearOverYear ?? 0) >= 0 ? '↑' : '↓'}
                  </span>
                  <span>同比 {(metric.yearOverYear ?? 0).toFixed(2)} pp</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DimensionCard;
