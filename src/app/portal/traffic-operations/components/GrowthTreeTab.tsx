'use client';

import React from 'react';
import { trafficGrowthTree } from '@/data/trafficIndicatorTrees';
import TrafficIndicatorTreeContent from './TrafficIndicatorTreeContent';

interface GrowthTreeTabProps {
  regionDisplay: string;
  selectedMonth?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
}

export default function GrowthTreeTab({ regionDisplay, selectedMonth, selectedRegion }: GrowthTreeTabProps) {
  return (
    <TrafficIndicatorTreeContent
      indicatorName="当月流量同比增幅到达值"
      selectedMonth={selectedMonth}
      currentTab="growth-tree"
      selectedRegion={selectedRegion}
      regionDisplay={regionDisplay}
    />
  );
}
