'use client';

import React from 'react';
import { trafficScaleTree } from '@/data/trafficIndicatorTrees';
import TrafficIndicatorTreeContent from './TrafficIndicatorTreeContent';

interface ScaleTreeTabProps {
  regionDisplay: string;
  selectedMonth?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
}

export default function ScaleTreeTab({ regionDisplay, selectedMonth, selectedRegion }: ScaleTreeTabProps) {
  return (
    <TrafficIndicatorTreeContent
      indicatorName="当月日均流量"
      selectedMonth={selectedMonth}
      currentTab="scale-tree"
      selectedRegion={selectedRegion}
      regionDisplay={regionDisplay}
    />
  );
}
