'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ALL_COLUMNS,
  PortOutRecord,
  BreadcrumbNode,
  CITY_LIST,
  DISTRICT_MAP,
  getChildRows,
  getParentSummaryRow,
} from '../data';
import GroupedHeaderTable from './GroupedHeaderTable';

interface PortOutTableProps {
  cityRows: PortOutRecord[];
  districtRows: PortOutRecord[];
  gridRows: PortOutRecord[];
  onDownloadDetail: (record: PortOutRecord) => void;
  /** 筛选区的地州编码 */
  selectedCityCode?: string;
  /** 筛选区的区县编码 */
  selectedDistrictCode?: string;
  /** 筛选区的网格编码 */
  selectedGridCode?: string;
  /** 筛选区变更回调 */
  onRegionChange?: (cityCode: string, districtCode: string, gridCode: string) => void;
}

/** 携转预警分析单表：面包屑+原地替换下钻 + 级联筛选联动 */
export default function PortOutTable({
  cityRows,
  districtRows,
  gridRows,
  onDownloadDetail,
  selectedCityCode,
  selectedDistrictCode,
  selectedGridCode,
  onRegionChange,
}: PortOutTableProps) {
  // 下钻路径：初始为全疆
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbNode[]>([
    { code: '650000', name: '全疆', level: 'province' },
  ]);

  // 当前所在层级
  const currentLevel = breadcrumbPath[breadcrumbPath.length - 1].level;

  // 根据面包屑计算当前表格数据
  const currentData = useMemo(() => {
    const currentNode = breadcrumbPath[breadcrumbPath.length - 1];

    if (currentNode.level === 'province') {
      // 全疆：显示全疆汇总 + 16地市
      return cityRows;
    }

    if (currentNode.level === 'city') {
      // 地市级：显示该地市汇总 + 其下区县
      const cityRow = cityRows.find((r) => r.regionCode === currentNode.code);
      const childDistricts = getChildRows(currentNode.code, 'city', districtRows, gridRows);
      return cityRow ? [cityRow, ...childDistricts] : childDistricts;
    }

    if (currentNode.level === 'district') {
      // 区县级：显示该区县汇总 + 其下网格
      const districtRow = districtRows.find((r) => r.regionCode === currentNode.code);
      const childGrids = getChildRows(currentNode.code, 'district', districtRows, gridRows);
      return districtRow ? [districtRow, ...childGrids] : childGrids;
    }

    // 网格级：只显示该网格自身
    if (currentNode.level === 'grid') {
      const gridRow = gridRows.find((r) => r.regionCode === currentNode.code);
      return gridRow ? [gridRow] : [];
    }

    return [];
  }, [breadcrumbPath, cityRows, districtRows, gridRows]);

  // 当前可下钻层级
  const drillLevel = useMemo(() => {
    if (currentLevel === 'province') return 'city';
    if (currentLevel === 'city') return 'district';
    if (currentLevel === 'district') return 'grid';
    return 'grid'; // grid 级不再下钻
  }, [currentLevel]);

  // 下钻操作
  const handleDrillDown = useCallback(
    (record: PortOutRecord) => {
      let nextLevel: BreadcrumbNode['level'];
      let parentCode: string = record.regionCode as string;

      if (currentLevel === 'province') {
        nextLevel = 'city';
      } else if (currentLevel === 'city') {
        nextLevel = 'district';
      } else if (currentLevel === 'district') {
        nextLevel = 'grid';
      } else {
        return; // 网格级不能再下钻
      }

      const drillName = record.regionName as string;

      setBreadcrumbPath((prev) => [
        ...prev,
        { code: parentCode, name: drillName, level: nextLevel },
      ]);

      // 联动筛选区：下钻后同步更新级联选择器
      if (nextLevel === 'city') {
        onRegionChange?.(parentCode, 'all', 'all');
      } else if (nextLevel === 'district') {
        // 保持当前地州，设置区县
        onRegionChange?.(breadcrumbPath[breadcrumbPath.length - 1].code, parentCode, 'all');
      } else if (nextLevel === 'grid') {
        // 保持地州和区县，设置网格
        const cityNode = breadcrumbPath.find((n) => n.level === 'city');
        const districtNode = breadcrumbPath.find((n) => n.level === 'district');
        onRegionChange?.(cityNode?.code || 'all', districtNode?.code || 'all', parentCode);
      }
    },
    [currentLevel, breadcrumbPath, onRegionChange]
  );

  // 面包屑点击返回
  const handleBreadcrumbClick = useCallback(
    (code: string, levelIndex: number) => {
      setBreadcrumbPath((prev) => prev.slice(0, levelIndex + 1));

      // 联动筛选区
      if (levelIndex === 0) {
        // 回到全疆
        onRegionChange?.('all', 'all', 'all');
      } else {
        // 回到某层级
        const targetPath = breadcrumbPath.slice(0, levelIndex + 1);
        const cityNode = targetPath.find((n) => n.level === 'city');
        const districtNode = targetPath.find((n) => n.level === 'district');
        onRegionChange?.(
          cityNode?.code || 'all',
          districtNode?.code || 'all',
          'all'
        );
      }
    },
    [breadcrumbPath, onRegionChange]
  );

  // 筛选区变更联动面包屑（反向：筛选区选择 → 更新面包屑）
  useEffect(() => {
    if (!selectedCityCode) return;

    // 只在筛选区主动变更时联动（避免双向循环）
    const currentCityNode = breadcrumbPath.find((n) => n.level === 'city');
    const currentDistrictNode = breadcrumbPath.find((n) => n.level === 'district');
    const currentGridNode = breadcrumbPath.find((n) => n.level === 'grid');

    // 判断是否与当前面包屑一致，一致则不更新（避免循环）
    if (selectedCityCode === 'all') {
      // 选了全疆，回到省层级
      if (currentLevel === 'province') return;
      setBreadcrumbPath([{ code: '650000', name: '全疆', level: 'province' }]);
      return;
    }

    // 选了地市
    const cityInfo = CITY_LIST.find((c) => c.code === selectedCityCode);
    if (!cityInfo) return;

    const newPath: BreadcrumbNode[] = [
      { code: '650000', name: '全疆', level: 'province' },
      { code: cityInfo.code, name: cityInfo.name, level: 'city' },
    ];

    // 选了区县
    if (selectedDistrictCode && selectedDistrictCode !== 'all') {
      const districts = DISTRICT_MAP[selectedCityCode] || [];
      const districtInfo = districts.find((d) => d.code === selectedDistrictCode);
      if (districtInfo) {
        newPath.push({ code: districtInfo.code, name: districtInfo.name, level: 'district' });

        // 选了网格
        if (selectedGridCode && selectedGridCode !== 'all') {
          const grids = DISTRICT_MAP[selectedDistrictCode] ? [] : [];
          // 从 GRID_MAP 找
          const gridInfo = gridRows.find((g) => g.regionCode === selectedGridCode);
          if (gridInfo) {
            newPath.push({ code: gridInfo.regionCode as string, name: gridInfo.regionName as string, level: 'grid' });
          }
        }
      }
    }

    // 检查是否与当前路径相同，避免无限循环
    const isSame = newPath.length === breadcrumbPath.length &&
      newPath.every((n, i) => n.code === breadcrumbPath[i].code);
    if (isSame) return;

    setBreadcrumbPath(newPath);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityCode, selectedDistrictCode, selectedGridCode]);

  // 下载明细
  const handleDownloadDetail = useCallback(
    (record: PortOutRecord) => {
      onDownloadDetail(record);
    },
    [onDownloadDetail]
  );

  // 面包屑显示路径
  const displayBreadcrumb = useMemo(
    () => breadcrumbPath.map((node) => ({ code: node.code, name: node.name })),
    [breadcrumbPath]
  );

  // 层级标签
  const levelLabel = useMemo(() => {
    if (currentLevel === 'province') return '地州级';
    if (currentLevel === 'city') return '区县级';
    if (currentLevel === 'district') return '网格级';
    return '网格级';
  }, [currentLevel]);

  // 当前数据条数
  const dataCount = currentData.length;

  return (
    <div className="space-y-3">
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">携转预警执行统计</h3>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">
            {levelLabel}
          </span>
          <span className="text-xs text-muted-foreground">共 {dataCount} 条</span>
        </div>
        <span className="text-xs text-muted-foreground">
          点击「下钻」查看下一级区域，点击面包屑可返回任意层级
        </span>
      </div>

      {/* 表格（含面包屑） */}
      <GroupedHeaderTable
        columns={ALL_COLUMNS}
        data={currentData}
        showActionColumn={true}
        drillLevel={drillLevel}
        firstRowIsSummary={currentLevel !== 'grid'}
        onDrillDown={handleDrillDown}
        onDownloadDetail={handleDownloadDetail}
        breadcrumbPath={displayBreadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
      />
    </div>
  );
}
