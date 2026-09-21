'use client';

import React, { useCallback } from 'react';
import { ALL_COLUMNS, PortOutRecord } from '../data';
import GroupedHeaderTable from './GroupedHeaderTable';

interface PortOutSummaryTablesProps {
  cityRows: PortOutRecord[];
  onDownloadDetail: (record: PortOutRecord) => void;
}

/** 统计概览区：单张完整大表，全疆+16地市 */
export default function PortOutSummaryTables({ cityRows, onDownloadDetail }: PortOutSummaryTablesProps) {
  const handleDownloadDetail = useCallback(
    (record: PortOutRecord) => {
      onDownloadDetail(record);
    },
    [onDownloadDetail]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">统计概览</h3>
        <span className="text-xs text-muted-foreground">
          展示全疆及16个地市分公司数据，点击「下载明细」可导出
        </span>
      </div>
      <GroupedHeaderTable
        columns={ALL_COLUMNS}
        data={cityRows}
        showActionColumn={true}
        drillLevel="city"
        firstRowIsSummary={true}
        onDownloadDetail={handleDownloadDetail}
      />
    </div>
  );
}
