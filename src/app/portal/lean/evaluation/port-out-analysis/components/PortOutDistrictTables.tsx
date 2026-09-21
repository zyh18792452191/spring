'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ALL_COLUMNS,
  PortOutRecord,
  BreadcrumbNode,
  CITY_LIST,
  getChildRows,
  getParentSummaryRow,
} from '../data';
import GroupedHeaderTable from './GroupedHeaderTable';

interface PortOutDistrictTablesProps {
  cityRows: PortOutRecord[];
  districtRows: PortOutRecord[];
  gridRows: PortOutRecord[];
  onDownloadDetail: (record: PortOutRecord) => void;
  selectedCityCode?: string;
  onCityChange?: (cityCode: string) => void;
}

/** 按区县统计区：面包屑+原地替换下钻 */
export default function PortOutDistrictTables({
  cityRows,
  districtRows,
  gridRows,
  onDownloadDetail,
  selectedCityCode,
  onCityChange,
}: PortOutDistrictTablesProps) {
  // 下钻路径状态
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbNode[]>([
    { code: '650000', name: '全疆', level: 'province' },
  ]);

  // 当前层级
  const currentLevel = breadcrumbPath[breadcrumbPath.length - 1].level;

  // 计算当前表格数据
  const currentData = useMemo(() => {
    const currentNode = breadcrumbPath[breadcrumbPath.length - 1];

    if (currentNode.level === 'province') {
      // 省级：显示全疆汇总 + 16地市
      return cityRows;
    }

    if (currentNode.level === 'city') {
      // 地市级：显示该地市汇总 + 其下区县
      const cityRow = cityRows.find((r) => r.regionCode === currentNode.code);
      const childDistricts = getChildRows(currentNode.code, 'city', districtRows, gridRows);
      if (cityRow) {
        return [cityRow, ...childDistricts];
      }
      return childDistricts;
    }

    if (currentNode.level === 'district') {
      // 区县级：显示该区县汇总 + 其下网格
      const districtRow = districtRows.find((r) => r.regionCode === currentNode.code);
      const childGrids = getChildRows(currentNode.code, 'district', districtRows, gridRows);
      if (districtRow) {
        return [districtRow, ...childGrids];
      }
      return childGrids;
    }

    return [];
  }, [breadcrumbPath, cityRows, districtRows, gridRows]);

  // 当前下钻层级（用于判断是否可继续下钻）
  const drillLevel = useMemo(() => {
    if (currentLevel === 'province') return 'city';
    if (currentLevel === 'city') return 'district';
    return 'grid';
  }, [currentLevel]);

  // 下钻操作
  const handleDrillDown = useCallback(
    (record: PortOutRecord) => {
      const regionLevel = record.regionLevel as string;
      let nextLevel: BreadcrumbNode['level'];

      if (currentLevel === 'province') {
        nextLevel = 'city';
      } else if (currentLevel === 'city') {
        nextLevel = 'district';
      } else {
        return; // 网格级不能再下钻
      }

      // 查找地市名称
      let drillName = record.regionName as string;
      if (nextLevel === 'city') {
        const city = CITY_LIST.find((c) => c.code === record.regionCode);
        if (city) drillName = city.name;
      }

      setBreadcrumbPath((prev) => [
        ...prev,
        { code: record.regionCode as string, name: drillName, level: nextLevel },
      ]);

      // 联动筛选区的地市选择器
      if (nextLevel === 'city' && onCityChange) {
        onCityChange(record.regionCode as string);
      }
    },
    [currentLevel, onCityChange]
  );

  // 面包屑点击返回
  const handleBreadcrumbClick = useCallback(
    (code: string, levelIndex: number) => {
      setBreadcrumbPath((prev) => prev.slice(0, levelIndex + 1));

      // 联动筛选区
      if (levelIndex === 0 && onCityChange) {
        onCityChange('');
      } else if (levelIndex >= 1 && onCityChange) {
        const targetNode = breadcrumbPath[levelIndex];
        if (targetNode?.level === 'city') {
          onCityChange(targetNode.code);
        }
      }
    },
    [breadcrumbPath, onCityChange]
  );

  // 下载明细
  const handleDownloadDetail = useCallback(
    (record: PortOutRecord) => {
      onDownloadDetail(record);
    },
    [onDownloadDetail]
  );

  // 面包屑显示用的路径
  const displayBreadcrumb = useMemo(() => {
    return breadcrumbPath.map((node) => ({ code: node.code, name: node.name }));
  }, [breadcrumbPath]);

  // 层级描述
  const levelLabel = useMemo(() => {
    if (currentLevel === 'province') return '地州级';
    if (currentLevel === 'city') return '区县级';
    return '网格级';
  }, [currentLevel]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">按区县统计</h3>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">
            {levelLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          点击「下钻」查看下一级区域数据，点击面包屑可返回任意层级
        </span>
      </div>
      <GroupedHeaderTable
        columns={ALL_COLUMNS}
        data={currentData}
        showActionColumn={true}
        drillLevel={drillLevel}
        firstRowIsSummary={true}
        onDrillDown={handleDrillDown}
        onDownloadDetail={handleDownloadDetail}
        breadcrumbPath={displayBreadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
      />
    </div>
  );
}
