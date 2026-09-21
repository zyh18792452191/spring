'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';
import { RegionEfficiency } from '@/lib/evaluation-data';
import { getRegionData, RegionTimeData, TimePeriod } from '@/lib/multi-period-data';

export type SortType =
  | 'overall'
  | 'quantity'
  | 'quality'
  | 'structure'
  | 'effect';

// 16地市分公司名称映射表
const PROVINCE_NAME_MAP: { [key: string]: string } = {
  '乌鲁木齐': '乌鲁木齐',
  '克拉玛依': '克拉玛依',
  '吐鲁番': '吐鲁番',
  '哈密': '哈密',
  '昌吉': '昌吉',
  '博州': '博州',
  '巴州': '巴州',
  '阿克苏': '阿克苏',
  '克州': '克州',
  '喀什': '喀什',
  '和田': '和田',
  '伊犁': '伊犁',
  '塔城': '塔城',
  '阿勒泰': '阿勒泰',
  '奎屯': '奎屯',
  '石河子': '石河子',
};

// 16地市分公司中心点坐标 [经度, 纬度]
const PROVINCE_CENTER_COORDS: { [key: string]: [number, number] } = {
  '乌鲁木齐': [87.6177, 43.7928],
  '克拉玛依': [84.8739, 45.5959],
  '吐鲁番': [89.184, 42.9476],
  '哈密': [93.5132, 42.8332],
  '昌吉': [87.3082, 44.0145],
  '博州': [82.0749, 44.9053],
  '巴州': [86.1509, 41.7689],
  '阿克苏': [80.2651, 41.1677],
  '克州': [76.1678, 39.7147],
  '喀什': [75.9898, 39.4677],
  '和田': [79.9253, 37.1107],
  '伊犁': [81.3179, 43.9228],
  '塔城': [82.9869, 46.7485],
  '阿勒泰': [88.1396, 47.8484],
  '奎屯': [84.9022, 44.4265],
  '石河子': [86.0411, 44.3059],
};

// 省份顶部坐标 [经度, 纬度] - 从各省的GeoJSON数据中动态计算得出
// 这些坐标是从省份区域的边界多边形中提取的最高纬度点，不是整个地图的顶点
const PROVINCE_TOP_COORDS: { [key: string]: [number, number] } = {};

// 从GeoJSON Feature中提取省份区域的顶点坐标（最高纬度点）
// ⚠️ 重要：这里提取的是单个省份区域边界多边形中的最高纬度点，不是整个地图的顶点
const extractTopCoordFromFeature = (feature: any): [number, number] | null => {
  if (!feature || !feature.geometry) {
    console.log('[extractTopCoord] ❌ Feature 或 geometry 为空');
    return null;
  }

  // 确认这是单个省份的 Feature
  const provinceName = feature.properties?.name;
  console.log('[extractTopCoord] 正在处理省份:', provinceName);

  const geometry = feature.geometry;
  let allCoords: number[][] = [];

  // 提取该省份区域的所有坐标点
  // ⚠️ 注意：这里只提取当前省份的坐标，不包含其他省份或整个地图的坐标
  const extractCoords = (coords: any): void => {
    if (Array.isArray(coords)) {
      coords.forEach((coord: any) => {
        if (Array.isArray(coord) && typeof coord[0] === 'number') {
          // [经度, 纬度]
          allCoords.push(coord);
        } else if (typeof coord === 'object' && coord !== null) {
          extractCoords(coord);
        }
      });
    }
  };

  extractCoords(geometry.coordinates);

  console.log('[extractTopCoord] 从', provinceName, '省提取到的坐标点数量:', allCoords.length);

  if (allCoords.length === 0) {
    console.log('[extractTopCoord] ❌ 未找到坐标点');
    return null;
  }

  // 找到纬度最高的点（顶点）
  // ⚠️ 这是该省份边界多边形中纬度最高的点，不是整个地图的顶点
  const topCoord = allCoords.reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  });

  console.log('[extractTopCoord] ✅ 找到', provinceName, '省最高纬度点:', topCoord, '纬度:', topCoord[1]);
  console.log('[extractTopCoord] ⚠️ 重要：此坐标是', provinceName, '省边界多边形中的最高纬度点，不是整个地图的顶点');
  console.log('[extractTopCoord] 前5个坐标点示例:', allCoords.slice(0, 5));
  console.log('[extractTopCoord] 后5个坐标点示例:', allCoords.slice(-5));

  return topCoord as [number, number];
};

// 反向映射：地图名称 -> 数据名称
const MAP_TO_DATA_MAP: { [key: string]: string } = {};
for (const [dataName, mapName] of Object.entries(PROVINCE_NAME_MAP)) {
  MAP_TO_DATA_MAP[mapName] = dataName;
}

// 判断是否需要显示百分号 - 五维健康度都不需要显示百分号
const shouldShowPercentage = (sortType: SortType): boolean => {
  return false; // 五维健康度都是得分，不显示百分号
};

interface ChinaMapProps {
  regionEfficiency: RegionEfficiency[];
  onRegionClick: (region: RegionEfficiency) => void;
  getValue: (region: RegionEfficiency, type: SortType) => number;
  sortType: SortType;
  top5?: RegionEfficiency[];
  bottom5?: RegionEfficiency[];
  sortedRegions?: RegionEfficiency[];
  getRankBadge?: (rank: number, isTop: boolean) => React.ReactNode;
  getChangeIcon?: (rank: number, isTop: boolean) => React.ReactNode;
  title?: string; // 地图标题
  selectedMetric?: {  // 选中的维度/指标信息
    dimensionKey: string | null;
    metricName: string | null;
    dimensionName: string | null;
  };
  healthDimensions?: any[]; // 五维健康度数据
  timePeriod?: TimePeriod; // 时间周期
  selectedZoneProvinces?: string[]; // 当前选中的专区包含的省份代码列表
}

export interface ChinaMapRef {
  showTooltip: (regionName: string) => void;
  hideTooltip: () => void;
}

export const ChinaMap = forwardRef<ChinaMapRef, ChinaMapProps>((props: ChinaMapProps, ref: React.Ref<ChinaMapRef>) => {
  const {
    regionEfficiency,
    onRegionClick,
    getValue,
    sortType,
    top5 = [],
    bottom5 = [],
    sortedRegions = [],
    getRankBadge = () => null,
    getChangeIcon = () => null,
    title = '全疆运营成效分布地图', // 默认标题
    selectedMetric,
    healthDimensions,
    timePeriod = 'lastMonth',
    selectedZoneProvinces = [],
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 准备数据 - 转换为地图需要的格式，并根据得分设置颜色
    // 获取得分范围
    const scores = regionEfficiency.map(r => getValue(r, sortType));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreRange = maxScore - minScore;

    // 颜色插值函数：得分越高颜色越深，得分越低颜色越浅
    const getBlueColor = (score: number): string => {
      if (scoreRange === 0) return '#60a5fa'; // 如果所有分数相同，返回中间色

      // 归一化分数 (0-1)
      const normalized = (score - minScore) / scoreRange;

      // 浅蓝色 (HSL: 215, 90%, 75%) -> 深蓝色 (HSL: 220, 90%, 35%)
      // 得分越高（normalized 越大），颜色越深（lightness 越小）
      const lightness = 75 - normalized * 40; // 75% -> 35%
      const saturation = 90;
      const hue = 220 - normalized * 5; // 220 -> 215 (微调色相)

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const data = regionEfficiency.map((region) => {
      // 使用映射表获取地图中的完整省份名称
      const mapName = PROVINCE_NAME_MAP[region.name] || region.name;

      // 判断是否属于当前选中的专区
      const isInSelectedZone = selectedZoneProvinces.includes(region.code);

      // 根据得分计算蓝色渐变
      const score = getValue(region, sortType);
      let areaColor = getBlueColor(score);

      // 如果属于当前选中的专区，使用更亮的颜色
      if (isInSelectedZone) {
        areaColor = areaColor.replace(/90%/, '95%'); // 提高饱和度，使颜色更亮
      }

      return {
        name: mapName, // 使用地图GeoJSON中的完整名称
        value: score,
        originalData: region,
        dataName: region.name, // 保存数据中的原始名称
        itemStyle: {
          areaColor, // 设置区域颜色
          borderColor: isInSelectedZone ? '#3b82f6' : '#d1d5db', // 专区的省份使用蓝色边框
          borderWidth: isInSelectedZone ? 2 : 1, // 专区的省份边框更粗
        },
        emphasis: {
          itemStyle: {
            areaColor: areaColor, // 高亮时保持相同的背景色
            borderColor: '#3b82f6', // 边框变为蓝色
            borderWidth: 3, // 高亮时边框更粗
          },
          label: {
            show: true,
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 'bold',
          },
        },
      };
    });

    console.log('[ChinaMap] 地图数据准备完成，总省份数量:', data.length);
    console.log('[ChinaMap] 得分范围:', { min: minScore, max: maxScore });
    console.log('[ChinaMap] 专区省份数量:', selectedZoneProvinces.length);
    console.log('[ChinaMap] 数据示例:', data.slice(0, 3).map(d => ({ name: d.name, dataName: d.dataName, value: d.value, areaColor: d.itemStyle?.areaColor })));

    // 判断是否显示百分号
    const showPercentage = shouldShowPercentage(sortType);
    const unit = showPercentage ? '%' : '';

    // 维度名称映射
    const dimensionNameMap: { [key: string]: string } = {
      overall: '综合得分',
      quantity: '量',
      quality: '质',
      structure: '构',
      effect: '效',
    };

    // 获取指标值映射（从 getRegionData 获取）
    const getRegionMetricValues = (regionCode: string) => {
      // 这里暂时返回空对象，实际应该从 getRegionData 获取
      return {};
    };

    // 配置选项
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [12, 15],
        position: function (point: any, params: any, dom: any, rect: any, size: any) {
          // 获取当前省份名称
          const regionName = params.name;

          console.log('[ChinaMap] Tooltip position - 当前省份:', regionName);
          console.log('[ChinaMap] Tooltip position - ECharts 原始 point:', point);

          // 判断是否是需要特殊处理的省份（如胡杨河省）
          if (PROVINCE_TOP_COORDS[regionName]) {
            // 返回省份区域的顶点坐标（从GeoJSON中提取的最高纬度点）
            const topCoords = PROVINCE_TOP_COORDS[regionName];
            console.log('[ChinaMap] ✅ 使用省份区域顶点坐标:', topCoords);
            console.log('[ChinaMap] ⚠️ 此坐标来自 PROVINCE_TOP_COORDS（从省份GeoJSON提取）');
            return topCoords;
          }

          // 默认行为，让 ECharts 自动定位
          return point;
        },
        textStyle: {
          color: '#374151',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const item = data.find(d => d.name === params.name);
          if (!item || !item.originalData) return '';
          
          const region = item.originalData;
          
          // 生成 tooltip 内容：省份名称 + 综合评分 + 四维得分
          let tooltipHtml = `<div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">${region.name}</div>`;
          
          // 显示综合评分
          tooltipHtml += `
            <div style="margin-bottom: 6px;">
              <span style="color: #6b7280;">综合评分:</span>
              <span style="font-weight: bold; color: #3b82f6; margin-left: 8px;">${region.overallHealth.toFixed(1)}</span>
            </div>
          `;
          
          // 显示四维得分
          const dimensions = [
            { key: 'quantity', name: '量', value: region.quantity },
            { key: 'quality', name: '质', value: region.quality },
            { key: 'structure', name: '构', value: region.structure },
            { key: 'effect', name: '效', value: region.effect },
          ];
          
          dimensions.forEach(dim => {
            tooltipHtml += `
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span style="color: #6b7280;">${dim.name}:</span>
                <span style="font-weight: 500;">${dim.value.toFixed(1)}</span>
              </div>
            `;
          });
          
          return tooltipHtml;
        },
      },
      series: [
        {
          name: '运营成效',
          type: 'map' as any,
          map: 'china',
          roam: false,
          zoom: 1.5,
          center: [104, 35],
          data: data,
          label: {
            show: true,
            fontSize: 10,
            color: '#6b7280',
          },
          itemStyle: {
            borderColor: '#d1d5db',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              show: true,
              color: '#1f2937',
              fontSize: 11,
              fontWeight: 'bold',
            },
            itemStyle: {
              borderColor: '#3b82f6',
              borderWidth: 2,
            },
          },
        },
      ],
    };

    // 加载中国地图数据
    const loadChinaMap = async () => {
      try {
        const response = await fetch('/api/china-map');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const mapData = await response.json();
        
        // 检查是否有错误
        if (mapData.error) {
          throw new Error(mapData.error);
        }
        
        // 检查是否是有效的 GeoJSON
        if (mapData && (mapData.type === 'FeatureCollection' || mapData.type === 'Feature')) {
          // 注册地图
          echarts.registerMap('china', mapData);

          // 动态计算边缘省份的顶点坐标（从省份区域的GeoJSON数据中提取，而非整个地图）
          if (mapData.type === 'FeatureCollection' && mapData.features) {
            console.log('[ChinaMap] GeoJSON features 数量:', mapData.features.length);
            console.log('[ChinaMap] 所有省份名称:', mapData.features.map((f: any) => f.properties?.name).join(', '));

            // 计算胡杨河省的顶点坐标 - 从胡杨河省区域的GeoJSON Feature中提取最高纬度点
            // ⚠️ 重要：这是从胡杨河省的边界多边形中提取的顶点，不是整个地图的顶点
            const hainanFeature = mapData.features.find((f: any) => f.properties?.name === '胡杨河市' || f.properties?.name === '胡杨河市');
            console.log('[ChinaMap] 找到的胡杨河省 Feature:', hainanFeature ? '是' : '否');

            if (hainanFeature) {
              console.log('[ChinaMap] 胡杨河省 Feature properties:', hainanFeature.properties);
              console.log('[ChinaMap] 胡杨河省 geometry type:', hainanFeature.geometry?.type);
              console.log('[ChinaMap] 胡杨河省 geometry coordinates 类型:', Array.isArray(hainanFeature.geometry?.coordinates) ? 'Array' : typeof hainanFeature.geometry?.coordinates);

              const topCoord = extractTopCoordFromFeature(hainanFeature);
              if (topCoord) {
                PROVINCE_TOP_COORDS['胡杨河市'] = topCoord;
                console.log('[ChinaMap] ✅ 胡杨河省区域顶点坐标已从GeoJSON提取:', topCoord);
                console.log('[ChinaMap] ⚠️ 重要说明：此坐标是胡杨河省边界多边形中的最高纬度点，不是整个地图的顶点');
                console.log('[ChinaMap] 对比 - 胡杨河省中心坐标:', PROVINCE_CENTER_COORDS['胡杨河市']);
                console.log('[ChinaMap] 对比 - 整个地图顶点:', '地图中心 [104, 35]');
              } else {
                console.log('[ChinaMap] ❌ 警告：未能从胡杨河省 Feature 中提取顶点坐标');
              }
            } else {
              console.log('[ChinaMap] ❌ 警告：未找到胡杨河省 Feature');
            }
          }

          // 验证：设置完地图后确认坐标
          console.log('[ChinaMap] 验证 - PROVINCE_TOP_COORDS 当前值:', PROVINCE_TOP_COORDS);
          if (PROVINCE_TOP_COORDS['胡杨河市']) {
            console.log('[ChinaMap] ✅ 验证通过：胡杨河省区域顶点坐标已正确设置:', PROVINCE_TOP_COORDS['胡杨河市']);
          }

          // 设置配置
          console.log('[ChinaMap] 设置 option，数据长度:', data.length);
          console.log('[ChinaMap] 数据项列表:', data.map(d => ({ name: d.name, value: d.value })));
          chartInstance.current!.setOption(option, true);
          console.log('[ChinaMap] option 设置完成');

          // 点击事件
          chartInstance.current!.off('click');
          chartInstance.current!.on('click', (params: any) => {
            const item = data.find(d => d.name === params.name);
            if (item && item.originalData) {
              onRegionClick(item.originalData);
            }
          });
        } else {
          throw new Error('无效的地图数据格式');
        }
      } catch (error) {
        console.error('加载地图数据失败:', error);
        // 显示错误提示
        if (chartInstance.current) {
          chartInstance.current.setOption({
            title: {
              text: '地图数据加载失败',
              subtext: '请检查网络连接或稍后重试',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#ef4444',
              },
            },
          });
        }
      }
    };

    loadChinaMap();

    // 响应式
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [regionEfficiency, getValue, sortType, onRegionClick]);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 min-h-[500px] flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
          {title}
        </h3>
        <div ref={chartRef} className="flex-1 w-full min-h-[450px]" />
      </div>
    </div>
  );

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    showTooltip: (regionName: string) => {
      if (!chartInstance.current) {
        console.warn('[ChinaMap] 图表实例未初始化');
        return;
      }

      // 将省份名称映射到地图名称
      const mapName = PROVINCE_NAME_MAP[regionName] || regionName;
      const mapNameNormalized = mapName === '胡杨河市' ? '胡杨河市' : mapName;

      console.log('[ChinaMap] 显示悬浮框:', { regionName, mapName, mapNameNormalized });

      // 先取消所有高亮
      chartInstance.current.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
      });

      // 高亮当前省份
      chartInstance.current.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: mapNameNormalized,
      });

      // 显示tooltip
      // 如果是胡杨河省，使用顶点坐标（从省份GeoJSON提取）
      if (mapNameNormalized === '胡杨河市' && PROVINCE_TOP_COORDS['胡杨河市']) {
        console.log('[ChinaMap] 胡杨河省使用顶点坐标:', PROVINCE_TOP_COORDS['胡杨河市']);
        chartInstance.current.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: mapNameNormalized,
          position: PROVINCE_TOP_COORDS['胡杨河市'], // 使用省份区域的顶点坐标
        });
      } else {
        // 其他省份使用默认位置
        chartInstance.current.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: mapNameNormalized,
        });
      }
    },
    hideTooltip: () => {
      if (!chartInstance.current) {
        console.warn('[ChinaMap] 图表实例未初始化');
        return;
      }

      console.log('[ChinaMap] 隐藏悬浮框');

      // 隐藏tooltip
      chartInstance.current.dispatchAction({
        type: 'hideTip',
      });

      // 取消所有高亮
      chartInstance.current.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
      });
    },
  }));
});
