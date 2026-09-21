'use client';

import { useState } from 'react';
import { Bell, Expand, Minimize, Network, GitBranch, AlertCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Settings, Edit2, X, ArrowRight, Tv, Wifi, Shield, Radio, Cloud, Heart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/card';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import DataInsightReports from '@/components/DataInsightReports';
import { IndicatorConfigDialog, IndicatorConfigData } from '@/components/IndicatorConfigDialog';
import { BroadbandValueConfigDialog, BroadbandValueConfigData } from '@/components/BroadbandValueConfigDialog';
import { BroadbandActiveConfigDialog, BroadbandActiveConfigData } from '@/components/BroadbandActiveConfigDialog';
import { textConfig } from '@/config/textConfig';

export function OverviewTab({ isEditMode, onJumpToTree, onOpenConfig, onOpenGigaUpgradeConfig, onOpenBroadbandValueConfig, onOpenBroadbandActiveConfig }: {
  isEditMode?: boolean;
  onJumpToTree: (indicatorName: string) => void;
  onOpenConfig?: (index: number, initialData?: Partial<{
    indicatorCardName: string;
  }>) => void;
  onOpenGigaUpgradeConfig?: (initialData?: Partial<IndicatorConfigData>) => void;
  onOpenBroadbandValueConfig?: (initialData?: Partial<BroadbandValueConfigData>) => void;
  onOpenBroadbandActiveConfig?: (initialData?: Partial<BroadbandActiveConfigData>) => void;
}) {
  const mounted = useMounted();
  // 整体规模指标数据
  const overallScaleMetrics = [
    {
      id: 1,
      name: '家宽到达量',
      value: '74.5万户',
      yoy: 11.9,
      yoyUnit: '%',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'barline' as const,
      businessScope: '统计当月家庭客户的数量',
      hasEntrances: true,
      indicatorName: '家庭宽带用户规模',
      chartData: [
        { month: '2月', value: 68.3, yoy: 2.5 },
        { month: '3月', value: 70.2, yoy: 2.8 },
        { month: '4月', value: 71.8, yoy: 2.3 },
        { month: '5月', value: 72.5, yoy: 1.0 },
        { month: '6月', value: 73.2, yoy: 1.0 },
        { month: '7月', value: 74.5, yoy: 1.8 }
      ]
    },
    {
      id: 2,
      name: '家宽活跃率',
      value: '87.5%',
      yoy: 9.8,
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '统计当月家宽用户的活跃率',
      hasEntrances: false,
      indicatorName: '家庭宽带客户活跃率',
      chartData: [
        { month: '2月', value: 80.2 },
        { month: '3月', value: 82.5 },
        { month: '4月', value: 83.8 },
        { month: '5月', value: 85.1 },
        { month: '6月', value: 86.3 },
        { month: '7月', value: 87.5 }
      ]
    },
    {
      id: 3,
      name: '家宽月离网率',
      value: '63.6%',
      yoy: -4.1,
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'danger' as const,
      color: '#DC2626',
      chartType: 'line' as const,
      businessScope: '统计当月家宽用户的月均离网率',
      hasEntrances: false,
      indicatorName: '家庭宽带月均离网率',
      chartData: [
        { month: '2月', value: 68.2 },
        { month: '3月', value: 67.8 },
        { month: '4月', value: 66.5 },
        { month: '5月', value: 65.3 },
        { month: '6月', value: 64.5 },
        { month: '7月', value: 63.6 }
      ]
    },
    {
      id: 4,
      name: '家宽拍照客户保有率',
      value: '94.8%',
      yoy: -0.8,
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'line' as const,
      businessScope: '家宽拍照客户的保有率',
      hasEntrances: false,
      indicatorName: '家庭宽带拍照客户保有率',
      chartData: [
        { month: '2月', value: 95.8 },
        { month: '3月', value: 95.6 },
        { month: '4月', value: 95.4 },
        { month: '5月', value: 95.2 },
        { month: '6月', value: 95.0 },
        { month: '7月', value: 94.8 }
      ]
    }
  ];

  // 价值结构数据
  const valueStructureData = {
    // 带宽结构
    broadbandStructure: {
      fusionBroadband: {
        name: '融宽规模',
        value: '56.3万户',
        yoy: '15.8%',
        businessScope: '融合宽带用户规模'
      },
      nakedBroadband: {
        name: '裸宽规模',
        value: '18.2万户',
        yoy: '-5.3%',
        businessScope: '裸宽带用户规模'
      },
      bandwidthDistribution: {
        name: '各带宽占比',
        businessScope: '不同带宽等级的用户分布',
        data: [
          { name: '100M以下家宽', value: 53.0, arrival: 39.48, yoy: -2.1 },
          { name: '[100,200)M家宽', value: 18.5, arrival: 13.78, yoy: 1.2 },
          { name: '[200,300)M家宽', value: 12.3, arrival: 9.16, yoy: 0.8 },
          { name: '[300,500)M家宽', value: 8.7, arrival: 6.48, yoy: -0.5 },
          { name: '[500,1000)M家宽', value: 5.2, arrival: 3.87, yoy: 0.3 },
          { name: '1000M以上家宽', value: 2.3, arrival: 1.71, yoy: 0.6 }
        ]
      }
    },
    // 家宽发展
    broadbandDevelopment: [
      {
        name: '有线宽带',
        type: 'normal',
        arrivalValue: '101.0',
        arrivalYoy: '8.5%',
        newAddValue: '4.6',
        newAddYoy: '2.8%',
        netIncrementValue: '3.9',
        netIncrementYoy: '3.2%',
        churnValue: '0.7',
        churnYoy: '-1.4%',
        businessScope: '有线宽带用户累计到达量',
        trendData: [
          { month: '2月', arrival: 82.3, newAdd: 4.2, netIncrement: 3.5, churn: 0.7 },
          { month: '3月', arrival: 85.8, newAdd: 4.5, netIncrement: 3.5, churn: 1.0 },
          { month: '4月', arrival: 89.4, newAdd: 4.3, netIncrement: 3.6, churn: 0.7 },
          { month: '5月', arrival: 93.4, newAdd: 4.7, netIncrement: 4.0, churn: 0.7 },
          { month: '6月', arrival: 97.1, newAdd: 4.4, netIncrement: 3.7, churn: 0.7 },
          { month: '7月', arrival: 101.0, newAdd: 4.6, netIncrement: 3.9, churn: 0.7 }
        ]
      },
      {
        name: '有线千兆',
        type: 'giga',
        arrivalValue: '61.5',
        arrivalYoy: '15.8%',
        newAddValue: '3.8',
        newAddYoy: '6.5%',
        netIncrementValue: '3.2',
        netIncrementYoy: '7.4%',
        churnValue: '0.6',
        churnYoy: '-2.5%',
        businessScope: '有线千兆宽带用户累计到达量',
        trendData: [
          { month: '2月', arrival: 44.5, newAdd: 3.2, netIncrement: 2.7, churn: 0.5 },
          { month: '3月', arrival: 47.7, newAdd: 3.5, netIncrement: 3.2, churn: 0.3 },
          { month: '4月', arrival: 51.2, newAdd: 3.4, netIncrement: 3.5, churn: -0.1 },
          { month: '5月', arrival: 54.8, newAdd: 3.7, netIncrement: 3.6, churn: 0.1 },
          { month: '6月', arrival: 58.3, newAdd: 3.6, netIncrement: 3.5, churn: 0.1 },
          { month: '7月', arrival: 61.5, newAdd: 3.8, netIncrement: 3.2, churn: 0.6 }
        ]
      },
      {
        name: '家宽',
        type: 'normal',
        arrivalValue: '85.8',
        arrivalYoy: '11.9%',
        newAddValue: '4.3',
        newAddYoy: '3.5%',
        netIncrementValue: '3.7',
        netIncrementYoy: '4.1%',
        churnValue: '0.6',
        churnYoy: '-1.6%',
        businessScope: '家庭宽带用户累计到达量',
        trendData: [
          { month: '2月', arrival: 68.3, newAdd: 3.8, netIncrement: 3.2, churn: 0.6 },
          { month: '3月', arrival: 71.8, newAdd: 4.1, netIncrement: 3.5, churn: 0.6 },
          { month: '4月', arrival: 75.1, newAdd: 3.9, netIncrement: 3.3, churn: 0.6 },
          { month: '5月', arrival: 78.7, newAdd: 4.2, netIncrement: 3.6, churn: 0.6 },
          { month: '6月', arrival: 82.1, newAdd: 4.0, netIncrement: 3.4, churn: 0.6 },
          { month: '7月', arrival: 85.8, newAdd: 4.3, netIncrement: 3.7, churn: 0.6 }
        ]
      },
      {
        name: '千兆家宽',
        type: 'giga',
        arrivalValue: '52.7',
        arrivalYoy: '12.5%',
        newAddValue: '3.3',
        newAddYoy: '5.2%',
        netIncrementValue: '2.9',
        netIncrementYoy: '6.1%',
        churnValue: '0.4',
        churnYoy: '-2.2%',
        businessScope: '千兆家宽用户累计到达量',
        trendData: [
          { month: '2月', arrival: 39.2, newAdd: 2.8, netIncrement: 2.4, churn: 0.4 },
          { month: '3月', arrival: 41.9, newAdd: 3.1, netIncrement: 2.7, churn: 0.4 },
          { month: '4月', arrival: 44.4, newAdd: 2.9, netIncrement: 2.5, churn: 0.4 },
          { month: '5月', arrival: 47.2, newAdd: 3.2, netIncrement: 2.8, churn: 0.4 },
          { month: '6月', arrival: 49.8, newAdd: 3.0, netIncrement: 2.6, churn: 0.4 },
          { month: '7月', arrival: 52.7, newAdd: 3.3, netIncrement: 2.9, churn: 0.4 }
        ]
      }
    ],
    // 价值与健康
    valueAndHealth: {
      // 价值提升
      valueEnhancement: {
        name: '宽带价值（客户整体出账ARPU）',
        businessScope: '各带宽档位客户整体出账ARPU近6个月趋势',
        chartData: [
          { month: '2月', arpuBelow300M: 56.5, arpu300M: 93.2, arpu500M: 125.8, arpu1000M: 182.3 },
          { month: '3月', arpuBelow300M: 56.8, arpu300M: 93.8, arpu500M: 126.5, arpu1000M: 183.5 },
          { month: '4月', arpuBelow300M: 57.2, arpu300M: 94.5, arpu500M: 127.2, arpu1000M: 184.2 },
          { month: '5月', arpuBelow300M: 57.5, arpu300M: 95.0, arpu500M: 127.8, arpu1000M: 184.8 },
          { month: '6月', arpuBelow300M: 57.8, arpu300M: 95.5, arpu500M: 128.2, arpu1000M: 185.2 },
          { month: '7月', arpuBelow300M: 58.2, arpu300M: 95.8, arpu500M: 128.5, arpu1000M: 185.6 }
        ]
      },
      // 活跃度
      activity: {
        name: '家宽活跃情况',
        businessScope: '活跃趋势',
        trendData: [
          { month: '2月', arrival: 72.1, active: 63.8, activityRate: 88.5 },
          { month: '3月', arrival: 73.2, active: 65.3, activityRate: 89.2 },
          { month: '4月', arrival: 73.8, active: 66.3, activityRate: 89.8 },
          { month: '5月', arrival: 74.2, active: 67.0, activityRate: 90.3 },
          { month: '6月', arrival: 74.5, active: 67.6, activityRate: 90.8 },
          { month: '7月', arrival: 74.5, active: 67.9, activityRate: 91.2 }
        ],
        monthlyDetail: {
          '2月': [
            { name: '100M以下', arrival: 28.5, activity: 25.1, rate: 88.2 },
            { name: '[100,200)M', arrival: 9.8, activity: 8.7, rate: 89.0 },
            { name: '[200,300)M', arrival: 6.8, activity: 6.1, rate: 89.8 },
            { name: '[300,500)M', arrival: 4.9, activity: 4.4, rate: 90.1 },
            { name: '[500,1000)M', arrival: 2.8, activity: 2.6, rate: 91.3 },
            { name: '1000M以上', arrival: 1.2, activity: 1.1, rate: 92.5 }
          ],
          '3月': [
            { name: '100M以下', arrival: 30.8, activity: 27.4, rate: 88.8 },
            { name: '[100,200)M', arrival: 10.9, activity: 9.8, rate: 89.5 },
            { name: '[200,300)M', arrival: 7.4, activity: 6.7, rate: 90.3 },
            { name: '[300,500)M', arrival: 5.3, activity: 4.8, rate: 90.5 },
            { name: '[500,1000)M', arrival: 3.1, activity: 2.8, rate: 91.8 },
            { name: '1000M以上', arrival: 1.4, activity: 1.3, rate: 92.8 }
          ],
          '4月': [
            { name: '100M以下', arrival: 33.2, activity: 29.6, rate: 89.2 },
            { name: '[100,200)M', arrival: 12.0, activity: 10.8, rate: 90.0 },
            { name: '[200,300)M', arrival: 8.1, activity: 7.4, rate: 90.8 },
            { name: '[300,500)M', arrival: 5.8, activity: 5.3, rate: 90.9 },
            { name: '[500,1000)M', arrival: 3.5, activity: 3.2, rate: 92.2 },
            { name: '1000M以上', arrival: 1.6, activity: 1.5, rate: 93.2 }
          ],
          '5月': [
            { name: '100M以下', arrival: 35.5, activity: 31.9, rate: 89.8 },
            { name: '[100,200)M', arrival: 13.1, activity: 11.9, rate: 90.5 },
            { name: '[200,300)M', arrival: 8.9, activity: 8.1, rate: 91.3 },
            { name: '[300,500)M', arrival: 6.4, activity: 5.8, rate: 91.3 },
            { name: '[500,1000)M', arrival: 3.8, activity: 3.5, rate: 92.6 },
            { name: '1000M以上', arrival: 1.8, activity: 1.7, rate: 93.8 }
          ],
          '6月': [
            { name: '100M以下', arrival: 37.6, activity: 33.9, rate: 90.3 },
            { name: '[100,200)M', arrival: 14.2, activity: 12.9, rate: 91.0 },
            { name: '[200,300)M', arrival: 9.6, activity: 8.8, rate: 91.8 },
            { name: '[300,500)M', arrival: 6.9, activity: 6.3, rate: 91.8 },
            { name: '[500,1000)M', arrival: 4.2, activity: 3.9, rate: 92.9 },
            { name: '1000M以上', arrival: 2.0, activity: 1.9, rate: 94.1 }
          ],
          '7月': [
            { name: '100M以下', arrival: 39.5, activity: 36.0, rate: 90.8 },
            { name: '[100,200)M', arrival: 15.3, activity: 14.0, rate: 91.5 },
            { name: '[200,300)M', arrival: 10.4, activity: 9.6, rate: 92.2 },
            { name: '[300,500)M', arrival: 7.5, activity: 6.9, rate: 92.3 },
            { name: '[500,1000)M', arrival: 4.6, activity: 4.3, rate: 93.2 },
            { name: '1000M以上', arrival: 2.3, activity: 2.2, rate: 94.5 }
          ]
        }
      },
      // 升档趋势
      upgradeTrend: {
        // 千兆升档
        gigaUpgrade: {
          name: '千兆升档',
          businessScope: '千兆升档用户数与整体业务ARPU月均提升值趋势',
          newUsers: 3.9, // 新增用户数（万户）
          avgArpuIncrease: 23.5, // 整体业务ARPU月均提升值（元）
          prevSixMonthsArpu: 45.2, // 前6个月ARPU均值（元）
          nextThreeMonthsArpu: 52.8, // 后三个月ARPU均值（元）
          chartData: [
            { month: '2月', newCardBroadband: 0.5, existingCardAddBroadband: 0.8, existingBroadbandUpgrade: 0.8, arpuIncrease: 15.2 },
            { month: '3月', newCardBroadband: 0.6, existingCardAddBroadband: 0.9, existingBroadbandUpgrade: 0.9, arpuIncrease: 16.8 },
            { month: '4月', newCardBroadband: 0.7, existingCardAddBroadband: 1.0, existingBroadbandUpgrade: 1.1, arpuIncrease: 18.5 },
            { month: '5月', newCardBroadband: 0.8, existingCardAddBroadband: 1.1, existingBroadbandUpgrade: 1.3, arpuIncrease: 20.1 },
            { month: '6月', newCardBroadband: 0.9, existingCardAddBroadband: 1.2, existingBroadbandUpgrade: 1.4, arpuIncrease: 21.8 },
            { month: '7月', newCardBroadband: 1.0, existingCardAddBroadband: 1.3, existingBroadbandUpgrade: 1.6, arpuIncrease: 23.5 }
          ]
        },
        // 升档500M
        upgrade500M: {
          name: '升档500M',
          businessScope: '升档500M用户数与整体业务ARPU月均提升值趋势',
          newUsers: 5.2, // 新增用户数（万户）
          avgArpuIncrease: 12.2, // 整体业务ARPU月均提升值（元）
          prevSixMonthsArpu: 42.5, // 前6个月ARPU均值（元）
          nextThreeMonthsArpu: 48.6, // 后三个月ARPU均值（元）
          chartData: [
            { month: '2月', newCardBroadband: 0.8, existingCardAddBroadband: 1.2, existingBroadbandUpgrade: 1.5, arpuIncrease: 8.5 },
            { month: '3月', newCardBroadband: 0.9, existingCardAddBroadband: 1.3, existingBroadbandUpgrade: 1.6, arpuIncrease: 9.2 },
            { month: '4月', newCardBroadband: 1.0, existingCardAddBroadband: 1.4, existingBroadbandUpgrade: 1.8, arpuIncrease: 10.1 },
            { month: '5月', newCardBroadband: 1.1, existingCardAddBroadband: 1.5, existingBroadbandUpgrade: 1.9, arpuIncrease: 10.8 },
            { month: '6月', newCardBroadband: 1.2, existingCardAddBroadband: 1.6, existingBroadbandUpgrade: 2.0, arpuIncrease: 11.5 },
            { month: '7月', newCardBroadband: 1.3, existingCardAddBroadband: 1.7, existingBroadbandUpgrade: 2.2, arpuIncrease: 12.2 }
          ]
        },
        // 升档300M
        upgrade300M: {
          name: '升档300M',
          businessScope: '升档300M用户数与整体业务ARPU月均提升值趋势',
          newUsers: 6.0, // 新增用户数（万户）
          avgArpuIncrease: 8.2, // 整体业务ARPU月均提升值（元）
          prevSixMonthsArpu: 38.8, // 前6个月ARPU均值（元）
          nextThreeMonthsArpu: 42.5, // 后三个月ARPU均值（元）
          chartData: [
            { month: '2月', newCardBroadband: 1.0, existingCardAddBroadband: 1.5, existingBroadbandUpgrade: 1.7, arpuIncrease: 5.8 },
            { month: '3月', newCardBroadband: 1.1, existingCardAddBroadband: 1.6, existingBroadbandUpgrade: 1.8, arpuIncrease: 6.2 },
            { month: '4月', newCardBroadband: 1.2, existingCardAddBroadband: 1.7, existingBroadbandUpgrade: 2.0, arpuIncrease: 6.8 },
            { month: '5月', newCardBroadband: 1.3, existingCardAddBroadband: 1.8, existingBroadbandUpgrade: 2.2, arpuIncrease: 7.2 },
            { month: '6月', newCardBroadband: 1.4, existingCardAddBroadband: 1.9, existingBroadbandUpgrade: 2.3, arpuIncrease: 7.8 },
            { month: '7月', newCardBroadband: 1.5, existingCardAddBroadband: 2.0, existingBroadbandUpgrade: 2.5, arpuIncrease: 8.2 }
          ]
        },
        // 加装宽带
        addBroadband: {
          name: '加装宽带',
          businessScope: '加装宽带用户数与整体业务ARPU月均提升值趋势',
          newUsers: 3.5, // 新增用户数（万户）
          avgArpuIncrease: 35.2, // 整体业务ARPU月均提升值（元）
          prevSixMonthsArpu: 52.6, // 前6个月ARPU均值（元）
          nextThreeMonthsArpu: 68.5, // 后三个月ARPU均值（元）
          chartData: [
            { month: '2月', newCardBroadband: 0.4, existingCardAddBroadband: 0.7, existingBroadbandUpgrade: 0.7, arpuIncrease: 25.5 },
            { month: '3月', newCardBroadband: 0.5, existingCardAddBroadband: 0.8, existingBroadbandUpgrade: 0.8, arpuIncrease: 27.2 },
            { month: '4月', newCardBroadband: 0.6, existingCardAddBroadband: 0.9, existingBroadbandUpgrade: 1.0, arpuIncrease: 29.8 },
            { month: '5月', newCardBroadband: 0.7, existingCardAddBroadband: 1.0, existingBroadbandUpgrade: 1.1, arpuIncrease: 31.5 },
            { month: '6月', newCardBroadband: 0.8, existingCardAddBroadband: 1.1, existingBroadbandUpgrade: 1.3, arpuIncrease: 33.8 },
            { month: '7月', newCardBroadband: 0.9, existingCardAddBroadband: 1.2, existingBroadbandUpgrade: 1.4, arpuIncrease: 35.2 }
          ]
        }
      }
    }
  };

  // 宽移融合数据
  const broadbandMobileFusionData = {
    name: '宽移融合',
    indicators: [
      {
        id: 'bmf-1',
        name: '移宽融合率',
        value: '78.5%',
        yoy: 3.2,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '移动号码与宽带绑定的用户占比'
      },
      {
        id: 'bmf-2',
        name: '移宽融合率-千兆宽带',
        value: '85.3%',
        yoy: 4.5,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '千兆宽带中与移动号码绑定的用户占比'
      },
      {
        id: 'bmf-3',
        name: '宽移融合率（个人）',
        value: '72.8%',
        yoy: 2.8,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '个人宽带用户中与移动号码绑定的占比'
      },
      {
        id: 'bmf-4',
        name: '宽移融合率(个人)-千兆宽带',
        value: '81.2%',
        yoy: 3.9,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '个人千兆宽带中与移动号码绑定的占比'
      },
      {
        id: 'bmf-5',
        name: '宽移融合率（家庭）',
        value: '88.6%',
        yoy: 5.1,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '家庭宽带用户中与移动号码绑定的占比'
      },
      {
        id: 'bmf-6',
        name: '宽移融合率(家庭)-千兆宽带',
        value: '92.3%',
        yoy: 6.2,
        yoyUnit: 'pp',
        status: 'normal' as const,
        businessScope: '家庭千兆宽带中与移动号码绑定的占比'
      }
    ]
  };

  // 活跃度选中月份状态
  const [selectedActivityMonth, setSelectedActivityMonth] = useState<string>('7月');

  // 客户属性数据
  const customerAttributeData = {
    // 物理属性（左侧）
    physical: {
      ageDistribution: {
        name: '家宽客户年龄分布',
        businessScope: '不同年龄段家宽客户的离网数量分布',
        chartData: [
          { age: '18-25岁', value: 8.2 },
          { age: '26-35岁', value: 12.5 },
          { age: '36-45岁', value: 11.8 },
          { age: '46-55岁', value: 9.3 },
          { age: '56岁以上', value: 3.8 }
        ]
      },
      genderDistribution: {
        name: '家宽客户性别分布',
        businessScope: '家宽客户按身份证号区分男女的离网数量分布',
        chartData: [
          { name: '男', gender: '男', value: 24.5 },
          { name: '女', gender: '女', value: 21.1 }
        ]
      }
    },
    // 资费属性（右侧）
    tariff: {
      arpuDistribution: {
        name: '家宽客户ARPU分布',
        businessScope: '家宽客户按月均宽带消费金额划分区间的离网数量分布',
        chartData: [
          { arpu: '50以下', value: 15.2 },
          { arpu: '50-99', value: 18.5 },
          { arpu: '100-149', value: 7.8 },
          { arpu: '150-199', value: 3.2 },
          { arpu: '200以上', value: 0.9 }
        ]
      },
      tariffLevel: {
        name: '家宽客户资费档次',
        businessScope: '家宽客户按月均消费划分：低档ARPU<50元；中档50元≤ARPU<100元；高档ARPU≥100元',
        chartData: [
          { name: '低档', level: '低档', value: 28.5, definition: 'ARPU < 50元' },
          { name: '中档', level: '中档', value: 12.3, definition: '50元 ≤ ARPU < 100元' },
          { name: '高档', level: '高档', value: 4.8, definition: 'ARPU ≥ 100元' }
        ]
      }
    }
  };


  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* 整体指标 - 1行4列 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          整体指标
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {overallScaleMetrics.map((metric) => (
            <Card key={metric.id} className="p-4 hover:shadow-lg transition-shadow relative">
              {/* 告警图标 */}
              {metric.hasEntrances && (
                <AlertTriangle className="absolute top-2 right-2 h-4 w-4 text-orange-500 cursor-pointer" />
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <h4 className="text-sm text-gray-600">{metric.name}</h4>
                    <div className="relative group cursor-pointer">
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                      <div className="absolute left-0 top-6 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-nowrap">
                          {metric.businessScope}
                        </div>
                      </div>
                    </div>
                    {/* 去调度、指标树分析入口 */}
                    {metric.hasEntrances && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                          onClick={() => console.log('去调度', metric.indicatorName)}
                        >
                          去调度
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                          onClick={() => onJumpToTree(metric.indicatorName)}
                        >
                          指标树分析
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    {metric.yoy !== undefined && metric.yoy !== null && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">{metric.yoyLabel || '同比'}</span>
                        <span className="text-xs font-medium text-green-600">
                          {metric.yoy}{metric.yoyUnit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 图表区域 */}
              <div className="border-t pt-2">
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    {metric.chartType === 'barline' ? (
                      <ComposedChart data={metric.chartData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-2 rounded-lg shadow-lg border">
                                  <div className="text-sm font-semibold text-gray-900">{data.month}</div>
                                  {payload.map((entry: any, index: number) => {
                                    const cleanName = entry.name.replace(/\(.*\)/, '');
                                    if (cleanName === '家宽到达量') {
                                      return (
                                        <div key={index} className="text-xs flex items-center gap-1">
                                          <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }}></div>
                                          <span className="text-gray-600">家宽到达量：{entry.value}万户</span>
                                        </div>
                                      );
                                    } else if (cleanName === '环比') {
                                      return (
                                        <div key={index} className="text-xs flex items-center gap-1">
                                          <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }}></div>
                                          <span className="text-gray-600">环比：{entry.value}%</span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar yAxisId="left" dataKey="value" fill={metric.color} opacity={0.6} barSize={12} name="家宽到达量(户)" />
                        <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#FF9500" strokeWidth={2} dot={{ r: 2 }} name="环比(%)" />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </ComposedChart>
                    ) : (
                      <LineChart data={metric.chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 规模发展 - 千兆发展 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          规模发展
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {valueStructureData.broadbandDevelopment.map((item, index) => {
            const isGiga = item.type === 'giga';
            const newAddLabel = isGiga ? '月新装量' : '月新增量';
            const netIncrementLabel = '月净增量';
            const churnLabel = isGiga ? '月拆机量' : '月离网量';
            return (
                <Card key={index} className="p-3 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-700 font-medium truncate flex-1">{item.name}</span>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 ml-1 hover:bg-gray-100"
                      onClick={() => onOpenConfig?.(index, {
                        indicatorCardName: item.name,
                      })}
                    >
                      <Settings className="h-3 w-3 text-gray-500" />
                    </Button> */}
                    {/* <div className="relative group flex-shrink-0 ml-1">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 max-w-xs">
                        {item.businessScope}
                        <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                      </div>
                    </div> */}
                  </div>
                  {/* 四个指标横向显示 */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {/* 到达量 */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <span className="text-xs text-gray-600">到达量</span>
                        {/* <div className="relative group">
                          <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                            <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                              累计到达量
                            </div>
                          </div>
                        </div> */}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.arrivalValue}<span className="text-xs ml-0.5">万户</span></div>
                      <div className={`text-xs ${item.arrivalYoy.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        环比 {item.arrivalYoy}
                      </div>
                    </div>
                    {/* 月新增量/月新装量 */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <span className="text-xs text-gray-600">{newAddLabel}</span>
                        {/* <div className="relative group">
                          <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                            <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                              {isGiga ? '月新装机量' : '月新增装机量'}
                            </div>
                          </div>
                        </div> */}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.newAddValue}<span className="text-xs ml-0.5">万户</span></div>
                      <div className={`text-xs ${item.newAddYoy.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        环比 {item.newAddYoy}
                      </div>
                    </div>
                    {/* 月净增量 */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <span className="text-xs text-gray-600">{netIncrementLabel}</span>
                        {/* <div className="relative group">
                          <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                            <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                              月净增量
                            </div>
                          </div>
                        </div> */}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.netIncrementValue}<span className="text-xs ml-0.5">万户</span></div>
                      <div className={`text-xs ${item.netIncrementYoy.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        环比 {item.netIncrementYoy}
                      </div>
                    </div>
                    {/* 月离网量/月拆机量 */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <span className="text-xs text-gray-600">{churnLabel}</span>
                        {/* <div className="relative group">
                          <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                            <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                              {isGiga ? '月拆机量' : '月离网量'}
                            </div>
                          </div>
                        </div> */}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{item.churnValue}<span className="text-xs ml-0.5">万户</span></div>
                      <div className={`text-xs ${item.churnYoy.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        环比 {item.churnYoy}
                      </div>
                    </div>
                  </div>
                  {/* 趋势图 - 双坐标轴 */}
                  <div className="flex-1 min-h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={item.trendData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                        {/* 左侧Y轴 - 到达量 */}
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        {/* 右侧Y轴 - 其他指标 */}
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 8 }} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 rounded-lg shadow-lg border">
                                  <div className="text-xs font-semibold text-gray-900 mb-2">{payload[0].payload.month}</div>
                                  {payload.map((entry: any, index: number) => (
                                    <div key={index} className="text-xs flex items-center gap-1">
                                      <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }}></div>
                                      <span className="text-gray-600">{entry.name.replace(/\(.*\)/, '')}: </span>
                                      <span className="font-semibold">{entry.value}万户</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* 到达量 - 柱状图（左侧Y轴） */}
                        <Bar yAxisId="left" dataKey="arrival" fill="#0066CC" name="到达量(户)" barSize={12} />
                        {/* 其他指标 - 折线图（右侧Y轴） */}
                        <Line yAxisId="right" type="monotone" dataKey="newAdd" stroke="#00B050" strokeWidth={2} name={`${newAddLabel}(户)`} dot={{ r: 2 }} />
                        <Line yAxisId="right" type="monotone" dataKey="netIncrement" stroke="#FF9500" strokeWidth={2} name={`${netIncrementLabel}(户)`} dot={{ r: 2 }} />
                        <Line yAxisId="right" type="monotone" dataKey="churn" stroke="#FF0066" strokeWidth={2} name={`${churnLabel}(户)`} dot={{ r: 2 }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              );
            })}
            </div>

        {/* 升档趋势图表 */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {/* 千兆升档 */}
            <Card className="p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 font-medium">{valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.name}</span>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 ml-1 hover:bg-gray-100"
                  onClick={() => onOpenGigaUpgradeConfig?.({
                    indicatorCardName: valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.name,
                  })}
                >
                  <Settings className="h-3 w-3 text-gray-500" />
                </Button> */}
              </div>
              {/* 数值显示区域 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">整体新增用户数</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          新增升档用户总数
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.newUsers}万户</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">ARPU月均提升值</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          整体业务ARPU月均提升值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">+{valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.avgArpuIncrease}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装前6月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装前6月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.prevSixMonthsArpu}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装后3月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装后3月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.nextThreeMonthsArpu}元</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={valueStructureData.valueAndHealth.upgradeTrend.gigaUpgrade.chartData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded-lg shadow-lg border">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{data.month}</div>
                              <div className="text-xs text-[#3B82F6]">新号卡办理宽带：{data.newCardBroadband}万户</div>
                              <div className="text-xs text-[#10B981]">存量号卡加装宽带：{data.existingCardAddBroadband}万户</div>
                              <div className="text-xs text-[#F59E0B]">存量宽带提速：{data.existingBroadbandUpgrade}万户</div>
                              <div className="text-xs text-[#EF4444]">ARPU月均提升：{data.arpuIncrease}元</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar yAxisId="left" dataKey="newCardBroadband" stackId="a" fill="#3B82F6" name="新号卡办理宽带(户)" barSize={12} />
                    <Bar yAxisId="left" dataKey="existingCardAddBroadband" stackId="a" fill="#10B981" name="存量号卡加装宽带(户)" />
                    <Bar yAxisId="left" dataKey="existingBroadbandUpgrade" stackId="a" fill="#F59E0B" name="存量宽带提速(户)" />
                    <Line yAxisId="right" type="monotone" dataKey="arpuIncrease" stroke="#EF4444" strokeWidth={2} dot={{ r: 2, fill: '#EF4444' }} name="ARPU提升(元)" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 升档500M */}
            <Card className="p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 font-medium">{valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.name}</span>
                {/* <div className="relative group">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute right-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-nowrap">
                      {valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.businessScope}
                    </div>
                  </div>
                </div> */}
              </div>
              {/* 数值显示区域 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">整体新增用户数</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          新增升档用户总数
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.newUsers}万户</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">ARPU月均提升值</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          整体业务ARPU月均提升值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">+{valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.avgArpuIncrease}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装前6月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装前6月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.prevSixMonthsArpu}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装后3月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装后3月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.nextThreeMonthsArpu}元</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={valueStructureData.valueAndHealth.upgradeTrend.upgrade500M.chartData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded-lg shadow-lg border">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{data.month}</div>
                              <div className="text-xs text-[#3B82F6]">新号卡办理宽带：{data.newCardBroadband}万户</div>
                              <div className="text-xs text-[#10B981]">存量号卡加装宽带：{data.existingCardAddBroadband}万户</div>
                              <div className="text-xs text-[#F59E0B]">存量宽带提速：{data.existingBroadbandUpgrade}万户</div>
                              <div className="text-xs text-[#EF4444]">ARPU月均提升：{data.arpuIncrease}元</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar yAxisId="left" dataKey="newCardBroadband" stackId="a" fill="#3B82F6" name="新号卡办理宽带(户)" barSize={12} />
                    <Bar yAxisId="left" dataKey="existingCardAddBroadband" stackId="a" fill="#10B981" name="存量号卡加装宽带(户)" />
                    <Bar yAxisId="left" dataKey="existingBroadbandUpgrade" stackId="a" fill="#F59E0B" name="存量宽带提速(户)" />
                    <Line yAxisId="right" type="monotone" dataKey="arpuIncrease" stroke="#EF4444" strokeWidth={2} dot={{ r: 2, fill: '#EF4444' }} name="ARPU提升(元)" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 升档300M */}
            <Card className="p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 font-medium">{valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.name}</span>
                {/* <div className="relative group">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute right-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-nowrap">
                      {valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.businessScope}
                    </div>
                  </div>
                </div> */}
              </div>
              {/* 数值显示区域 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">整体新增用户数</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          新增升档用户总数
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.newUsers}万户</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">ARPU月均提升值</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          整体业务ARPU月均提升值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">+{valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.avgArpuIncrease}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装前6月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装前6月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.prevSixMonthsArpu}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装后3月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装后3月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.nextThreeMonthsArpu}元</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={valueStructureData.valueAndHealth.upgradeTrend.upgrade300M.chartData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded-lg shadow-lg border">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{data.month}</div>
                              <div className="text-xs text-[#3B82F6]">新号卡办理宽带：{data.newCardBroadband}万户</div>
                              <div className="text-xs text-[#10B981]">存量号卡加装宽带：{data.existingCardAddBroadband}万户</div>
                              <div className="text-xs text-[#F59E0B]">存量宽带提速：{data.existingBroadbandUpgrade}万户</div>
                              <div className="text-xs text-[#EF4444]">ARPU月均提升：{data.arpuIncrease}元</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar yAxisId="left" dataKey="newCardBroadband" stackId="a" fill="#3B82F6" name="新号卡办理宽带(户)" barSize={12} />
                    <Bar yAxisId="left" dataKey="existingCardAddBroadband" stackId="a" fill="#10B981" name="存量号卡加装宽带(户)" />
                    <Bar yAxisId="left" dataKey="existingBroadbandUpgrade" stackId="a" fill="#F59E0B" name="存量宽带提速(户)" />
                    <Line yAxisId="right" type="monotone" dataKey="arpuIncrease" stroke="#EF4444" strokeWidth={2} dot={{ r: 2, fill: '#EF4444' }} name="ARPU提升(元)" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 加装宽带 */}
            <Card className="p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-700 font-medium">{valueStructureData.valueAndHealth.upgradeTrend.addBroadband.name}</span>
                {/* <div className="relative group">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute right-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-nowrap">
                      {valueStructureData.valueAndHealth.upgradeTrend.addBroadband.businessScope}
                    </div>
                  </div>
                </div> */}
              </div>
              {/* 数值显示区域 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">整体新增用户数</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          新增升档用户总数
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.addBroadband.newUsers}万户</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">ARPU月均提升值</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          整体业务ARPU月均提升值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">+{valueStructureData.valueAndHealth.upgradeTrend.addBroadband.avgArpuIncrease}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装前6月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装前6月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.addBroadband.prevSixMonthsArpu}元</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] text-gray-500">加装后3月ARPU</span>
                    {/* <div className="relative group">
                      <Info className="h-2.5 w-2.5 text-gray-400 cursor-help" />
                      <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                          加装后3月ARPU均值
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{valueStructureData.valueAndHealth.upgradeTrend.addBroadband.nextThreeMonthsArpu}元</span>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={valueStructureData.valueAndHealth.upgradeTrend.addBroadband.chartData} margin={{ left: 0, right: 0, top: 2, bottom: 2 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} label={{ value: '万户', angle: -90, position: 'insideLeft', fontSize: 8 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded-lg shadow-lg border">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{data.month}</div>
                              <div className="text-xs text-[#3B82F6]">新号卡办理宽带：{data.newCardBroadband}万户</div>
                              <div className="text-xs text-[#10B981]">存量号卡加装宽带：{data.existingCardAddBroadband}万户</div>
                              <div className="text-xs text-[#F59E0B]">存量宽带提速：{data.existingBroadbandUpgrade}万户</div>
                              <div className="text-xs text-[#EF4444]">ARPU月均提升：{data.arpuIncrease}元</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar yAxisId="left" dataKey="newCardBroadband" stackId="a" fill="#3B82F6" name="新号卡办理宽带(户)" barSize={12} />
                    <Bar yAxisId="left" dataKey="existingCardAddBroadband" stackId="a" fill="#10B981" name="存量号卡加装宽带(户)" />
                    <Bar yAxisId="left" dataKey="existingBroadbandUpgrade" stackId="a" fill="#F59E0B" name="存量宽带提速(户)" />
                    <Line yAxisId="right" type="monotone" dataKey="arpuIncrease" stroke="#EF4444" strokeWidth={2} dot={{ r: 2, fill: '#EF4444' }} name="ARPU提升(元)" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
      </div>

      {/* 价值与健康 - 2个区域 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          价值与健康
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 价值提升 - 占1列 */}
          <Card className="p-4 hover:shadow-lg transition-shadow lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-base font-semibold text-gray-900">{valueStructureData.valueAndHealth.valueEnhancement.name}</div>
              {/* <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 hover:bg-gray-100"
                onClick={() => onOpenBroadbandValueConfig?.({
                  indicatorCardName: valueStructureData.valueAndHealth.valueEnhancement.name,
                })}
              >
                <Settings className="h-3 w-3 text-gray-500" />
              </Button> */}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={valueStructureData.valueAndHealth.valueEnhancement.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded-lg shadow-lg border">
                            <div className="text-sm font-semibold text-gray-900 mb-2">{payload[0].payload.month}</div>
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="text-xs flex items-center gap-1">
                                <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-gray-600">{entry.name.replace(/\(.*\)/, '')}: </span>
                                <span className="font-semibold">{entry.value}元</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="arpuBelow300M" stroke="#0066CC" strokeWidth={2} dot={{ r: 3, fill: '#0066CC' }} name="300M以下(元)" />
                  <Line type="monotone" dataKey="arpu300M" stroke="#00B050" strokeWidth={2} dot={{ r: 3, fill: '#00B050' }} name="300M(元)" />
                  <Line type="monotone" dataKey="arpu500M" stroke="#FF9500" strokeWidth={2} dot={{ r: 3, fill: '#FF9500' }} name="500M(元)" />
                  <Line type="monotone" dataKey="arpu1000M" stroke="#FF0066" strokeWidth={2} dot={{ r: 3, fill: '#FF0066' }} name="1000M(元)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 活跃度 - 占2列，左右分布 */}
          <Card className="p-4 hover:shadow-lg transition-shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-base font-semibold text-gray-900">{valueStructureData.valueAndHealth.activity.name}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左侧：趋势图 */}
              <div>
                <div className="text-xs text-gray-500 mb-2">活跃趋势</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={valueStructureData.valueAndHealth.activity.trendData}
                      margin={{ left: 0, right: 0, top: 2, bottom: 2 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const arrivalData = payload.find((p: any) => p.name.includes('到达量'));
                            const activeData = payload.find((p: any) => p.name.includes('活跃量'));
                            const rateData = payload.find((p: any) => p.name.includes('活跃率'));
                            return (
                              <div className="bg-white p-2 rounded-lg shadow-lg border">
                                <div className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</div>
                                {arrivalData && (
                                  <div className="text-xs text-gray-600">
                                    家宽到达量：{arrivalData.value}万户
                                  </div>
                                )}
                                {activeData && (
                                  <div className="text-xs text-blue-600">
                                    家宽活跃量：{activeData.value}万户
                                  </div>
                                )}
                                {rateData && (
                                  <div className="text-xs text-green-600">
                                    家宽活跃率：{rateData.value}%
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar yAxisId="left" dataKey="arrival" fill="#0066CC" opacity={0.6} name="到达量(户)" barSize={20} />
                      <Bar yAxisId="left" dataKey="active" fill="#FF9500" opacity={0.6} name="活跃量(户)" barSize={20} />
                      <Line yAxisId="right" type="monotone" dataKey="activityRate" stroke="#00B050" strokeWidth={2} dot={{ r: 3, fill: '#00B050' }} name="活跃率(%)" />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* 右侧：饼图 */}
              <div>
                <div className="text-xs text-gray-500 mb-2">到达量分布</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(valueStructureData.valueAndHealth.activity.monthlyDetail as any)[selectedActivityMonth]}
                        cx="45%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="arrival"
                      >
                        <Cell fill="#0066CC" />
                        <Cell fill="#00B050" />
                        <Cell fill="#FF9500" />
                        <Cell fill="#FF0066" />
                        <Cell fill="#9B59B6" />
                        <Cell fill="#3498DB" />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 rounded-lg shadow-lg border">
                                <div className="text-sm font-semibold text-gray-900">{data.name}</div>
                                <div className="text-xs text-gray-600">到达量：{data.arrival}万户</div>
                                <div className="text-xs text-blue-600">活跃量：{data.activity}万户</div>
                                <div className="text-xs text-green-600">活跃率：{data.rate}%</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 宽移融合 - 6个指标卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          {broadbandMobileFusionData.name}
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {broadbandMobileFusionData.indicators.map((indicator) => (
            <Card key={indicator.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-1 mb-2">
                <div className="text-sm text-gray-600 truncate flex-1" title={indicator.name}>
                  {indicator.name}
                </div>
                <div className="relative group flex-shrink-0">
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                  <div className="absolute right-0 top-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-gray-800 text-white text-[10px] p-1.5 rounded shadow-lg max-w-xs whitespace-nowrap">
                      {indicator.businessScope}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {indicator.value}
              </div>
              <div className={`flex items-center text-xs ${indicator.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {indicator.yoy >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                <span>
                  {indicator.yoy >= 0 ? '+' : ''}{indicator.yoy}{indicator.yoyUnit}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 指标树内容组件
