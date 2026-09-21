'use client';

import React from 'react';
import { trafficCompetitionTree } from '@/data/trafficIndicatorTrees';
import TrafficIndicatorTreeContent from './TrafficIndicatorTreeContent';

interface CompetitionTreeTabProps {
  regionDisplay: string;
  selectedMonth?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
}

export default function CompetitionTreeTab({ regionDisplay, selectedMonth, selectedRegion }: CompetitionTreeTabProps) {
  return (
    <TrafficIndicatorTreeContent
      indicatorName="当月流量份额"
      selectedMonth={selectedMonth}
      currentTab="competition-tree"
      selectedRegion={selectedRegion}
      regionDisplay={regionDisplay}
    />
  );
}
