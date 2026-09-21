'use client';

import React, { useState, useMemo, useCallback } from 'react';
import FilterBar, { type FilterValues } from './components/FilterBar';
import PortOutTable from './components/PortOutTable';
import { generateAllMockData, type PortOutRecord } from './data';

export default function PortOutAnalysisPage() {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [filters, setFilters] = useState<FilterValues>({
    executionMode: 'online_subcontract',
    orderTimeStart: monthStart,
    orderTimeEnd: monthEnd,
    executionTimeStart: '',
    executionTimeEnd: '',
    regionCity: 'all',
    regionDistrict: 'all',
    regionGrid: 'all',
  });

  const allData = useMemo(() => generateAllMockData(), []);

  // 地市级数据始终使用全量（筛选联动由 PortOutTable 内部处理）
  const filteredCityRows = useMemo(() => {
    return allData.cityRows;
  }, [allData]);

  const handleQuery = useCallback(() => {
    // 后续对接API
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      executionMode: 'online_subcontract',
      orderTimeStart: monthStart,
      orderTimeEnd: monthEnd,
      executionTimeStart: '',
      executionTimeEnd: '',
      regionCity: 'all',
      regionDistrict: 'all',
      regionGrid: 'all',
    });
  }, [monthStart, monthEnd]);

  const handleDownloadDetail = useCallback((record: PortOutRecord) => {
    // 后续对接导出API
    console.log('下载明细:', record.regionName, record.regionCode);
  }, []);

  // 级联区域选择器变更 → 联动面包屑
  const handleRegionChange = useCallback((cityCode: string, districtCode: string, gridCode: string) => {
    setFilters((prev) => ({
      ...prev,
      regionCity: cityCode,
      regionDistrict: districtCode,
      regionGrid: gridCode,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">携转预警情况分析</h1>
        <p className="text-xs text-muted-foreground mt-1">
          携号转网预警工单全流程执行统计，覆盖在线渠道、网格经理、10088、政企客户经理、装维人员5类执行角色
        </p>
      </div>

      {/* 筛选区 */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onQuery={handleQuery}
        onReset={handleReset}
      />

      {/* 单表：面包屑下钻 */}
      <div className="mt-4">
        <PortOutTable
          cityRows={filteredCityRows}
          districtRows={allData.districtRows}
          gridRows={allData.gridRows}
          onDownloadDetail={handleDownloadDetail}
          selectedCityCode={filters.regionCity}
          selectedDistrictCode={filters.regionDistrict}
          selectedGridCode={filters.regionGrid}
          onRegionChange={handleRegionChange}
        />
      </div>
    </div>
  );
}
