'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

// 省份数据接口
interface ProvinceData {
  name: string;
  value: number;
  growthRate: number;
  revenue?: string;
  customers?: string;
}

interface ChinaMapProps {
  data: ProvinceData[];
  onProvinceClick?: (province: string) => void;
  selectedProvince?: string;
}

export default function ChinaMap({ data, onProvinceClick, selectedProvince }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 加载中国地图数据
  useEffect(() => {
    const loadChinaMap = async () => {
      try {
        // 从本地加载地图数据
        const response = await fetch('/maps/china.json');
        const geoJson = await response.json();

        // 注册中国地图
        echarts.registerMap('china', geoJson);
        setMapLoaded(true);
      } catch (error) {
        console.error('加载中国地图数据失败:', error);
      }
    };

    loadChinaMap();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current || !mapLoaded) return;

    // 如果已存在实例，先销毁
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // 创建新实例
    chartInstance.current = echarts.init(chartRef.current);

    // 配置选项
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 13,
        },
        formatter: (params: any) => {
          if (!params.data) return '';
          const provinceData = params.data as ProvinceData;
          return `
            <div class="font-bold mb-1">${provinceData.name}</div>
            <div>收入规模：${provinceData.revenue || '-'}</div>
            <div>客户规模：${provinceData.customers || '-'}</div>
            <div>增长率：${provinceData.growthRate > 0 ? '+' : ''}${provinceData.growthRate}%</div>
          `;
        },
      },
      visualMap: {
        min: -5,
        max: 5,
        left: 'left',
        bottom: 'bottom',
        text: ['高增长', '低增长'],
        calculable: true,
        inRange: {
          color: ['#FF4D4F', '#FFF7E6', '#52C41A'],
        },
      },
      series: [
        {
          name: '全国分布',
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          label: {
            show: true,
            fontSize: 10,
            color: '#333',
          },
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontSize: 11,
            },
            itemStyle: {
              areaColor: '#0085D0',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
          select: {
            itemStyle: {
              areaColor: '#0066A0',
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              color: '#fff',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          data: data,
        },
      ],
    };

    chartInstance.current.setOption(option);

    // 点击事件
    chartInstance.current.on('click', (params: any) => {
      if (params.name && onProvinceClick) {
        onProvinceClick(params.name);
      }
    });

    // 窗口大小变化时自适应
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [mapLoaded, data, onProvinceClick]);

  // 更新选中状态
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.dispatchAction({
        type: 'mapSelect',
        name: selectedProvince,
      });
    }
  }, [selectedProvince]);

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
          <p className="text-gray-500 text-sm mt-2">加载地图中...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="w-full h-[500px]" />
  );
}
