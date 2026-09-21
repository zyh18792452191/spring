/**
 * 区域数据适配层
 * 根据选中的区域过滤/转换数据
 */

import { getRegionByCode, isNational, provinces, Province, City } from './provinces';

// 重新导出常用函数
export { isNational, getRegionByCode, provinces };

/**
 * 根据区域调整数值（基于发展系数）
 * @param baseValue 全疆基准值
 * @param regionCode 区域编码
 * @param isRate 是否为比率型指标（比率型不乘系数，而是加减微调）
 */
export const adjustValueByRegion = (
  baseValue: number,
  regionCode: string,
  isRate: boolean = false
): number => {
  if (isNational(regionCode)) {
    return baseValue;
  }
  
  const region = getRegionByCode(regionCode);
  if (!region) {
    return baseValue;
  }
  
  if (isRate) {
    // 比率型指标：根据发展系数微调（±5%以内）
    const adjustment = (region.developmentFactor - 1) * 5;
    return Math.max(0, Math.min(100, baseValue + adjustment));
  } else {
    // 数值型指标：根据发展系数缩放
    return Math.round(baseValue * region.developmentFactor * 100) / 100;
  }
};

/**
 * 格式化数值为带单位字符串
 */
export const formatValue = (value: number, unit: string = ''): string => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿' + unit;
  } else if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万' + unit;
  }
  return value.toFixed(1) + unit;
};

/**
 * 根据区域调整同比值
 * @param baseYoy 全疆同比
 * @param regionCode 区域编码
 */
export const adjustYoyByRegion = (
  baseYoy: number,
  regionCode: string
): number => {
  if (isNational(regionCode)) {
    return baseYoy;
  }
  
  const region = getRegionByCode(regionCode);
  if (!region) {
    return baseYoy;
  }
  
  // 根据发展系数调整同比（发展好的地区增长更快）
  const adjustment = (region.developmentFactor - 1) * 3;
  return Math.round((baseYoy + adjustment) * 10) / 10;
};

/**
 * 获取区域维度的数据（用于指标分析面板）
 * @param regionCode 选中的区域编码
 * @param baseValue 基准值
 * @returns 区域分布数据
 */
export const getRegionDimensionData = (
  regionCode: string,
  baseValue: number
): Array<{ name: string; value: number }> => {
  if (isNational(regionCode)) {
    // 全疆：返回16地市分公司数据
    return provinces.map(province => ({
      name: province.shortName,
      value: Math.round(baseValue * province.developmentFactor * 100) / 100
    }));
  }
  
  const region = getRegionByCode(regionCode) as Province;
  if (!region || !region.cities || region.cities.length === 0) {
    return [];
  }
  
  // 自治区级：返回下属地市数据
  return region.cities.map(city => ({
    name: city.name.replace('市', '').replace('区', '').replace('县', ''),
    value: Math.round(baseValue * city.developmentFactor * 100) / 100
  }));
};

/**
 * 获取TOP N区域
 */
export const getTopRegions = (
  regionCode: string,
  baseValue: number,
  topN: number = 5
): string[] => {
  const data = getRegionDimensionData(regionCode, baseValue);
  const sorted = [...data].sort((a, b) => b.value - a.value);
  return sorted.slice(0, topN).map(d => d.name);
};

/**
 * 获取BOTTOM N区域
 */
export const getBottomRegions = (
  regionCode: string,
  baseValue: number,
  bottomN: number = 5
): string[] => {
  const data = getRegionDimensionData(regionCode, baseValue);
  const sorted = [...data].sort((a, b) => a.value - b.value);
  return sorted.slice(0, bottomN).map(d => d.name);
};

/**
 * 根据区域调整指标卡片数据
 */
export const adjustMetricCardByRegion = <T extends { value: string; yoy: string; chartData?: Array<{ month: string; value?: number; change?: number }> }>(
  card: T,
  regionCode: string,
  isRate: boolean = false
): T => {
  if (isNational(regionCode)) {
    return card;
  }
  
  const region = getRegionByCode(regionCode);
  if (!region) {
    return card;
  }
  
  // 解析原始数值
  const parseValue = (val: string): number => {
    const match = val.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  const parseYoy = (yoy: string): number => {
    const match = yoy.match(/[+-]?[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  const originalValue = parseValue(card.value);
  const originalYoy = parseYoy(card.yoy);
  
  // 调整数值
  const adjustedValue = adjustValueByRegion(originalValue, regionCode, isRate);
  const adjustedYoy = adjustYoyByRegion(originalYoy, regionCode);
  
  // 格式化
  const unit = card.value.replace(/[\d.]+/, '').trim();
  const yoySign = adjustedYoy >= 0 ? '+' : '';
  
  return {
    ...card,
    value: formatValue(adjustedValue, unit).replace('万', unit.includes('万') ? '' : '万'),
    yoy: `${yoySign}${adjustedYoy}`,
    chartData: card.chartData?.map(item => ({
      ...item,
      value: item.value ? adjustValueByRegion(item.value, regionCode, isRate) : undefined,
      change: item.change ? adjustYoyByRegion(item.change, regionCode) : undefined
    }))
  };
};

/**
 * 获取区域名称
 */
export const getRegionDisplayName = (regionCode: string): string => {
  if (isNational(regionCode)) {
    return '全疆';
  }
  const region = getRegionByCode(regionCode);
  return region?.name || '全疆';
};

/**
 * 获取区域的下属区域类型名称
 */
export const getSubRegionTypeName = (regionCode: string): string => {
  if (isNational(regionCode)) {
    return '地市';
  }
  
  // 直辖市
  const municipalities = ['110000', '120000', '310000', '500000'];
  if (municipalities.includes(regionCode)) {
    return '区县';
  }
  
  return '地市';
};
