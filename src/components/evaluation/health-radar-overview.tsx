'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, AlertCircle, XCircle, Settings, Plus } from 'lucide-react';
import { regionEfficiency, RegionEfficiency } from '@/lib/evaluation-data';
import { ChinaMap, ChinaMapRef } from './china-map';
import DimensionCard from './dimension-card';
import {
  TimePeriod,
  timePeriodLabels,
  getRegionData,
  getAllRegionsData,
  RegionTimeData
} from '@/lib/multi-period-data';
import { TimePeriodSelector } from './time-period-selector';

// 运营专区数据
interface OperationZone {
  name: string;
  provinces: string[]; // 包含的地市代码
  score: number; // 综合评估得分
}

const operationZones: OperationZone[] = [
  {
    name: '中高端客户运营',
    provinces: ['WLMQ', 'KLYM', 'CJ', 'YL', 'SHZ', 'AKS', 'HM'],
    score: 92.5
  },
  {
    name: '国际业务运营',
    provinces: ['WLMQ', 'KLYM', 'CJ', 'SHZ', 'YL', 'BYGL', 'TLF'],
    score: 88.3
  },
  {
    name: '离网维系',
    provinces: ['WLMQ', 'KLYM', 'YL', 'CJ', 'AKS', 'SHZ', 'BYGL'],
    score: 91.2
  },
  {
    name: '用量运营',
    provinces: ['WLMQ', 'KLYM', 'CJ', 'YL', 'SHZ', 'TC', 'HM'],
    score: 89.6
  },
  {
    name: '融合运营',
    provinces: ['WLMQ', 'KLYM', 'CJ', 'SHZ', 'YL', 'AKS', 'BYGL'],
    score: 90.8
  },
  {
    name: '细分市场运营',
    provinces: ['WLMQ', 'KLYM', 'SHZ', 'YL', 'CJ', 'AKS', 'HM'],
    score: 87.5
  },
  {
    name: '家庭运营',
    provinces: ['WLMQ', 'KLYM', 'CJ', 'SHZ', 'YL', 'BYGL', 'TC'],
    score: 91.0
  },
];

// 专区指标配置
interface ZoneMetric {
  name: string;
  unit: string;
  currentValue: number;
  monthOverMonth: number;
  yearOverYear: number;
  trendData: number[];
}

interface ZoneDimensionMetrics {
  quantity: ZoneMetric[];
  quality: ZoneMetric[];
  structure: ZoneMetric[];
  effect: ZoneMetric[];
}

interface ZoneMetricsConfig {
  [zoneName: string]: ZoneDimensionMetrics;
}

// 各专区的量质构效指标配置
const zoneMetricsConfig: ZoneMetricsConfig = {
  // 中高端客户运营 - 保持原有指标不变
  '中高端客户运营': {
    quantity: [
      {
        name: '累计流量增幅',
        unit: '%',
        currentValue: 9.17,
        monthOverMonth: 0.38,
        yearOverYear: 2.15,
        trendData: [7.5, 7.8, 8.2, 8.5, 8.9, 9.17],
      },
      {
        name: '中高端客户规模净增目标完成率',
        unit: '%',
        currentValue: 227.80,
        monthOverMonth: 12.5,
        yearOverYear: 25.3,
        trendData: [180, 195, 205, 215, 220, 227.8],
      },
      {
        name: '客户到达份额',
        unit: '%',
        currentValue: 55.70,
        monthOverMonth: 1.2,
        yearOverYear: 3.8,
        trendData: [52, 53, 54, 54.5, 55, 55.7],
      },
    ],
    quality: [
      {
        name: '累计月均离网率',
        unit: '%',
        currentValue: 2.15,
        monthOverMonth: -0.15,
        yearOverYear: -0.38,
        trendData: [2.8, 2.7, 2.65, 2.55, 2.3, 2.15],
      },
      {
        name: '拍照中高端客户综合保有率',
        unit: '%',
        currentValue: 92.8,
        monthOverMonth: 0.3,
        yearOverYear: 1.5,
        trendData: [90, 90.5, 91, 91.5, 92, 92.8],
      },
      {
        name: '拍照全球通客户综合保有率',
        unit: '%',
        currentValue: 95.2,
        monthOverMonth: 0.2,
        yearOverYear: 1.2,
        trendData: [93, 93.5, 94, 94.5, 95, 95.2],
      },
    ],
    structure: [
      {
        name: '泛升档增幅',
        unit: '%',
        currentValue: 8.5,
        monthOverMonth: 0.8,
        yearOverYear: 3.2,
        trendData: [5, 5.8, 6.5, 7.2, 7.8, 8.5],
      },
      {
        name: '有效融合渗透率',
        unit: '%',
        currentValue: 68.3,
        monthOverMonth: 1.2,
        yearOverYear: 6.5,
        trendData: [55, 58, 60, 62, 65, 68.3],
      },
      {
        name: '中高端客户占比',
        unit: '%',
        currentValue: 52.6,
        monthOverMonth: 0.5,
        yearOverYear: 2.8,
        trendData: [48, 49, 49.5, 50.5, 51.5, 52.6],
      },
    ],
    effect: [
      {
        name: 'ARPU提升',
        unit: '%',
        currentValue: 5.8,
        monthOverMonth: 0.6,
        yearOverYear: 3.2,
        trendData: [3.5, 4.0, 4.5, 5.0, 5.5, 5.8],
      },
      {
        name: '新增净增比',
        unit: '倍',
        currentValue: 1.25,
        monthOverMonth: 0.05,
        yearOverYear: 0.18,
        trendData: [1.05, 1.08, 1.12, 1.15, 1.20, 1.25],
      },
    ],
  },
  // 国际业务运营
  '国际业务运营': {
    quantity: [
      {
        name: '国际漫游用户数',
        unit: '万户',
        currentValue: 1250.5,
        monthOverMonth: 2.8,
        yearOverYear: 15.2,
        trendData: [1080, 1120, 1155, 1190, 1220, 1250.5],
      },
      {
        name: '国际业务收入',
        unit: '亿元',
        currentValue: 45.2,
        monthOverMonth: 3.2,
        yearOverYear: 18.5,
        trendData: [38, 40, 41.5, 43, 44.2, 45.2],
      },
      {
        name: '5G国际漫游渗透率',
        unit: '%',
        currentValue: 68.5,
        monthOverMonth: 2.5,
        yearOverYear: 22.8,
        trendData: [55, 58, 61, 64, 66.5, 68.5],
      },
    ],
    quality: [
      {
        name: '国际漫游投诉率',
        unit: '%',
        currentValue: 0.85,
        monthOverMonth: -0.12,
        yearOverYear: -0.45,
        trendData: [1.3, 1.2, 1.1, 1.0, 0.9, 0.85],
      },
      {
        name: '国际业务客户满意度',
        unit: '%',
        currentValue: 94.5,
        monthOverMonth: 0.8,
        yearOverYear: 3.5,
        trendData: [90, 91, 92, 93, 94, 94.5],
      },
      {
        name: '国际漫游接通率',
        unit: '%',
        currentValue: 98.8,
        monthOverMonth: 0.15,
        yearOverYear: 1.2,
        trendData: [97.5, 97.8, 98.1, 98.3, 98.6, 98.8],
      },
    ],
    structure: [
      {
        name: '高端国际用户占比',
        unit: '%',
        currentValue: 42.8,
        monthOverMonth: 1.2,
        yearOverYear: 8.5,
        trendData: [38, 39, 40, 41, 42, 42.8],
      },
      {
        name: '国际套餐渗透率',
        unit: '%',
        currentValue: 75.6,
        monthOverMonth: 1.8,
        yearOverYear: 12.2,
        trendData: [67, 69, 71, 73, 74.5, 75.6],
      },
      {
        name: '国际+国内融合用户占比',
        unit: '%',
        currentValue: 35.2,
        monthOverMonth: 2.5,
        yearOverYear: 15.8,
        trendData: [30, 31.5, 32.5, 33.5, 34.5, 35.2],
      },
    ],
    effect: [
      {
        name: '国际业务ARPU',
        unit: '元',
        currentValue: 38.5,
        monthOverMonth: 1.2,
        yearOverYear: 8.5,
        trendData: [35, 35.8, 36.5, 37.2, 38, 38.5],
      },
      {
        name: '国际漫游出账率',
        unit: '%',
        currentValue: 62.5,
        monthOverMonth: 1.5,
        yearOverYear: 10.8,
        trendData: [56, 58, 59.5, 61, 61.8, 62.5],
      },
    ],
  },
  // 离网维系
  '离网维系': {
    quantity: [
      {
        name: '维系用户数',
        unit: '万户',
        currentValue: 3520.8,
        monthOverMonth: -1.2,
        yearOverYear: 5.5,
        trendData: [3350, 3400, 3420, 3460, 3490, 3520.8],
      },
      {
        name: '维系触达数',
        unit: '万次',
        currentValue: 8560.5,
        monthOverMonth: 5.8,
        yearOverYear: 25.2,
        trendData: [6800, 7200, 7600, 8000, 8350, 8560.5],
      },
      {
        name: '维系成功率',
        unit: '%',
        currentValue: 78.5,
        monthOverMonth: 2.2,
        yearOverYear: 12.5,
        trendData: [69, 72, 74, 76, 77.5, 78.5],
      },
    ],
    quality: [
      {
        name: '离网率',
        unit: '%',
        currentValue: 1.85,
        monthOverMonth: -0.28,
        yearOverYear: -0.65,
        trendData: [2.5, 2.4, 2.2, 2.1, 1.95, 1.85],
      },
      {
        name: '离网挽回率',
        unit: '%',
        currentValue: 35.2,
        monthOverMonth: 3.5,
        yearOverYear: 18.8,
        trendData: [29, 30.5, 32, 33.5, 34.5, 35.2],
      },
      {
        name: '维系客户满意度',
        unit: '%',
        currentValue: 89.5,
        monthOverMonth: 1.2,
        yearOverYear: 5.8,
        trendData: [84, 85.5, 86.5, 88, 88.8, 89.5],
      },
    ],
    structure: [
      {
        name: '中高端客户维系占比',
        unit: '%',
        currentValue: 68.5,
        monthOverMonth: 0.8,
        yearOverYear: 6.2,
        trendData: [64, 65.5, 66.5, 67.2, 68, 68.5],
      },
      {
        name: '维系触达覆盖率',
        unit: '%',
        currentValue: 95.2,
        monthOverMonth: 1.5,
        yearOverYear: 8.5,
        trendData: [87, 89, 91, 93, 94.5, 95.2],
      },
      {
        name: '精准维系占比',
        unit: '%',
        currentValue: 72.8,
        monthOverMonth: 2.5,
        yearOverYear: 15.2,
        trendData: [63, 66, 68, 70, 71.5, 72.8],
      },
    ],
    effect: [
      {
        name: '维系ARPU提升',
        unit: '%',
        currentValue: 3.5,
        monthOverMonth: 0.5,
        yearOverYear: 2.2,
        trendData: [2.8, 3.0, 3.1, 3.2, 3.4, 3.5],
      },
      {
        name: '维系留存率',
        unit: '%',
        currentValue: 92.5,
        monthOverMonth: 1.8,
        yearOverYear: 8.5,
        trendData: [85, 87, 88.5, 90, 91.5, 92.5],
      },
    ],
  },
  // 用量运营
  '用量运营': {
    quantity: [
      {
        name: 'DOU（人均流量）',
        unit: 'GB',
        currentValue: 28.5,
        monthOverMonth: 3.2,
        yearOverYear: 18.5,
        trendData: [24, 25, 26, 27, 28, 28.5],
      },
      {
        name: '5G渗透率',
        unit: '%',
        currentValue: 58.8,
        monthOverMonth: 2.5,
        yearOverYear: 25.8,
        trendData: [46, 50, 53, 55.5, 57.5, 58.8],
      },
      {
        name: '流量收入',
        unit: '亿元',
        currentValue: 285.5,
        monthOverMonth: 2.8,
        yearOverYear: 12.5,
        trendData: [253, 265, 272, 278, 282, 285.5],
      },
    ],
    quality: [
      {
        name: '流量投诉率',
        unit: '%',
        currentValue: 0.65,
        monthOverMonth: -0.08,
        yearOverYear: -0.32,
        trendData: [0.97, 0.9, 0.85, 0.78, 0.7, 0.65],
      },
      {
        name: '网络满意度',
        unit: '%',
        currentValue: 91.2,
        monthOverMonth: 0.8,
        yearOverYear: 4.5,
        trendData: [87, 88, 89, 90, 90.8, 91.2],
      },
      {
        name: '流量利用率',
        unit: '%',
        currentValue: 85.5,
        monthOverMonth: 1.2,
        yearOverYear: 6.8,
        trendData: [80, 81.5, 83, 84, 85, 85.5],
      },
    ],
    structure: [
      {
        name: '高清视频流量占比',
        unit: '%',
        currentValue: 45.8,
        monthOverMonth: 2.5,
        yearOverYear: 15.2,
        trendData: [39, 41, 42.5, 44, 45, 45.8],
      },
      {
        name: '流量套餐渗透率',
        unit: '%',
        currentValue: 82.5,
        monthOverMonth: 1.8,
        yearOverYear: 10.5,
        trendData: [74, 77, 79, 80.5, 81.8, 82.5],
      },
      {
        name: '5G流量占比',
        unit: '%',
        currentValue: 55.2,
        monthOverMonth: 3.5,
        yearOverYear: 28.5,
        trendData: [42, 46, 49, 52, 54, 55.2],
      },
    ],
    effect: [
      {
        name: '流量ARPU',
        unit: '元',
        currentValue: 25.8,
        monthOverMonth: 0.8,
        yearOverYear: 5.2,
        trendData: [24, 24.5, 25, 25.3, 25.6, 25.8],
      },
      {
        name: '流量转化率',
        unit: '%',
        currentValue: 68.5,
        monthOverMonth: 1.5,
        yearOverYear: 9.8,
        trendData: [62, 64, 65.5, 66.5, 67.5, 68.5],
      },
    ],
  },
  // 融合运营
  '融合运营': {
    quantity: [
      {
        name: '融合用户数',
        unit: '万户',
        currentValue: 2850.5,
        monthOverMonth: 2.5,
        yearOverYear: 15.8,
        trendData: [2450, 2550, 2650, 2720, 2790, 2850.5],
      },
      {
        name: '融合收入',
        unit: '亿元',
        currentValue: 158.2,
        monthOverMonth: 3.8,
        yearOverYear: 20.5,
        trendData: [131, 138, 143, 149, 153, 158.2],
      },
      {
        name: '融合渗透率',
        unit: '%',
        currentValue: 52.8,
        monthOverMonth: 1.8,
        yearOverYear: 12.5,
        trendData: [46, 48, 49.5, 51, 52, 52.8],
      },
    ],
    quality: [
      {
        name: '融合用户离网率',
        unit: '%',
        currentValue: 0.95,
        monthOverMonth: -0.12,
        yearOverYear: -0.38,
        trendData: [1.33, 1.25, 1.18, 1.1, 1.02, 0.95],
      },
      {
        name: '融合满意度',
        unit: '%',
        currentValue: 93.5,
        monthOverMonth: 0.8,
        yearOverYear: 5.2,
        trendData: [88, 90, 91, 92, 93, 93.5],
      },
      {
        name: '融合业务开通及时率',
        unit: '%',
        currentValue: 96.8,
        monthOverMonth: 0.5,
        yearOverYear: 3.5,
        trendData: [93, 94.5, 95, 95.8, 96.3, 96.8],
      },
    ],
    structure: [
      {
        name: '宽带+手机融合占比',
        unit: '%',
        currentValue: 65.5,
        monthOverMonth: 2.2,
        yearOverYear: 15.8,
        trendData: [56, 59, 61, 63, 64.5, 65.5],
      },
      {
        name: '三融合用户占比',
        unit: '%',
        currentValue: 28.5,
        monthOverMonth: 3.5,
        yearOverYear: 22.5,
        trendData: [23, 24.5, 25.8, 27, 27.8, 28.5],
      },
      {
        name: '融合套餐渗透率',
        unit: '%',
        currentValue: 78.5,
        monthOverMonth: 1.5,
        yearOverYear: 11.2,
        trendData: [70, 73, 75, 76.5, 77.5, 78.5],
      },
    ],
    effect: [
      {
        name: '融合ARPU',
        unit: '元',
        currentValue: 55.5,
        monthOverMonth: 1.8,
        yearOverYear: 12.5,
        trendData: [49, 50.5, 52, 53.5, 54.5, 55.5],
      },
      {
        name: '融合业务留存率',
        unit: '%',
        currentValue: 95.2,
        monthOverMonth: 0.8,
        yearOverYear: 5.5,
        trendData: [90, 91.5, 93, 94, 94.8, 95.2],
      },
    ],
  },
  // 细分市场运营
  '细分市场运营': {
    quantity: [
      {
        name: '细分市场用户数',
        unit: '万户',
        currentValue: 1850.8,
        monthOverMonth: 3.5,
        yearOverYear: 22.5,
        trendData: [1500, 1600, 1680, 1750, 1810, 1850.8],
      },
      {
        name: '细分市场收入',
        unit: '亿元',
        currentValue: 92.5,
        monthOverMonth: 4.2,
        yearOverYear: 25.8,
        trendData: [73, 78, 82, 86, 89, 92.5],
      },
      {
        name: '细分市场覆盖率',
        unit: '%',
        currentValue: 68.5,
        monthOverMonth: 2.8,
        yearOverYear: 18.5,
        trendData: [57, 60, 63, 65.5, 67, 68.5],
      },
    ],
    quality: [
      {
        name: '细分市场满意度',
        unit: '%',
        currentValue: 89.8,
        monthOverMonth: 1.2,
        yearOverYear: 6.8,
        trendData: [84, 86, 87, 88.5, 89.2, 89.8],
      },
      {
        name: '细分市场响应率',
        unit: '%',
        currentValue: 75.5,
        monthOverMonth: 3.5,
        yearOverYear: 18.5,
        trendData: [63, 67, 70, 72.5, 74, 75.5],
      },
      {
        name: '细分市场精准度',
        unit: '%',
        currentValue: 82.5,
        monthOverMonth: 2.5,
        yearOverYear: 15.2,
        trendData: [71, 75, 78, 80, 81.5, 82.5],
      },
    ],
    structure: [
      {
        name: '银发市场占比',
        unit: '%',
        currentValue: 28.5,
        monthOverMonth: 1.8,
        yearOverYear: 12.5,
        trendData: [25, 26, 26.8, 27.5, 28, 28.5],
      },
      {
        name: '青少年市场占比',
        unit: '%',
        currentValue: 22.8,
        monthOverMonth: 2.5,
        yearOverYear: 15.8,
        trendData: [19, 20.5, 21.5, 22, 22.5, 22.8],
      },
      {
        name: '小微企业市场占比',
        unit: '%',
        currentValue: 18.5,
        monthOverMonth: 3.2,
        yearOverYear: 18.5,
        trendData: [15.5, 16.5, 17.2, 17.8, 18.2, 18.5],
      },
    ],
    effect: [
      {
        name: '细分市场ARPU',
        unit: '元',
        currentValue: 50.2,
        monthOverMonth: 2.2,
        yearOverYear: 15.8,
        trendData: [43, 45, 47, 48.5, 49.5, 50.2],
      },
      {
        name: '细分市场转化率',
        unit: '%',
        currentValue: 68.8,
        monthOverMonth: 2.8,
        yearOverYear: 18.5,
        trendData: [58, 62, 64, 66, 67.5, 68.8],
      },
    ],
  },
  // 家庭运营
  '家庭运营': {
    quantity: [
      {
        name: '家庭用户数',
        unit: '万户',
        currentValue: 3250.5,
        monthOverMonth: 2.2,
        yearOverYear: 14.5,
        trendData: [2830, 2940, 3040, 3120, 3190, 3250.5],
      },
      {
        name: '家庭收入',
        unit: '亿元',
        currentValue: 185.5,
        monthOverMonth: 3.5,
        yearOverYear: 18.8,
        trendData: [155, 165, 173, 179, 182, 185.5],
      },
      {
        name: '家庭宽带渗透率',
        unit: '%',
        currentValue: 88.5,
        monthOverMonth: 1.5,
        yearOverYear: 9.5,
        trendData: [80, 83, 85, 86.5, 87.8, 88.5],
      },
    ],
    quality: [
      {
        name: '家庭客户满意度',
        unit: '%',
        currentValue: 92.5,
        monthOverMonth: 0.8,
        yearOverYear: 5.2,
        trendData: [87, 89, 90, 91, 92, 92.5],
      },
      {
        name: '家庭业务投诉率',
        unit: '%',
        currentValue: 0.55,
        monthOverMonth: -0.08,
        yearOverYear: -0.28,
        trendData: [0.83, 0.75, 0.68, 0.62, 0.58, 0.55],
      },
      {
        name: '家庭装维及时率',
        unit: '%',
        currentValue: 98.2,
        monthOverMonth: 0.5,
        yearOverYear: 2.8,
        trendData: [95, 96, 96.8, 97.2, 97.8, 98.2],
      },
    ],
    structure: [
      {
        name: '智慧家庭渗透率',
        unit: '%',
        currentValue: 45.8,
        monthOverMonth: 3.5,
        yearOverYear: 22.5,
        trendData: [37, 40, 42, 44, 45, 45.8],
      },
      {
        name: '智能家居用户占比',
        unit: '%',
        currentValue: 28.5,
        monthOverMonth: 4.2,
        yearOverYear: 25.8,
        trendData: [22, 24, 25.5, 27, 27.8, 28.5],
      },
      {
        name: '家庭娱乐业务占比',
        unit: '%',
        currentValue: 35.2,
        monthOverMonth: 2.8,
        yearOverYear: 18.5,
        trendData: [29, 31, 32.5, 33.8, 34.5, 35.2],
      },
    ],
    effect: [
      {
        name: '家庭ARPU',
        unit: '元',
        currentValue: 57.2,
        monthOverMonth: 1.5,
        yearOverYear: 10.5,
        trendData: [51, 53, 54.5, 55.8, 56.5, 57.2],
      },
      {
        name: '家庭业务留存率',
        unit: '%',
        currentValue: 94.5,
        monthOverMonth: 0.8,
        yearOverYear: 5.8,
        trendData: [89, 90.8, 92, 93, 94, 94.5],
      },
    ],
  },
};

// 指标库 - 所有可用的指标
interface MetricLibraryItem {
  name: string;
  unit: string;
  dimension: string; // 所属维度 key
  description: string;
  defaultWeight: number;
}

const metricLibrary: MetricLibraryItem[] = [
  // 核心业务维度
  { name: '离网率', unit: '%', dimension: 'business', description: '客户流失率', defaultWeight: 25 },
  { name: '5G渗透率', unit: '%', dimension: 'business', description: '5G用户占比', defaultWeight: 25 },
  { name: '中高端客户规模保有率', unit: '%', dimension: 'business', description: '中高端客户数量保持率', defaultWeight: 25 },
  { name: '中高端客户价值保有率', unit: '%', dimension: 'business', description: '中高端客户ARPU保持率', defaultWeight: 25 },
  { name: '客户规模增长率', unit: '%', dimension: 'business', description: '客户数量增长速度', defaultWeight: 25 },
  { name: '业务收入增长率', unit: '%', dimension: 'business', description: '业务收入增长速度', defaultWeight: 25 },
  { name: 'ARPU值', unit: '元', dimension: 'business', description: '每用户平均收入', defaultWeight: 25 },
  { name: '新增客户数', unit: '万户', dimension: 'business', description: '新增客户数量', defaultWeight: 25 },

  // 流程执行维度
  { name: '工单完成率', unit: '%', dimension: 'process', description: '工单按时完成比例', defaultWeight: 33 },
  { name: '超时率', unit: '%', dimension: 'process', description: '工单超时比例', defaultWeight: 34 },
  { name: '平均处理时长', unit: '小时', dimension: 'process', description: '工单平均处理时间', defaultWeight: 33 },
  { name: '工单满意度', unit: '%', dimension: 'process', description: '客户对工单处理的满意度', defaultWeight: 33 },
  { name: '一次解决率', unit: '%', dimension: 'process', description: '工单一次性解决比例', defaultWeight: 34 },
  { name: '工单响应时间', unit: '分钟', dimension: 'process', description: '工单平均响应时间', defaultWeight: 33 },

  // 策略模型维度
  { name: '策略执行率', unit: '%', dimension: 'strategy', description: '策略执行完成比例', defaultWeight: 33 },
  { name: '策略转化率', unit: '%', dimension: 'strategy', description: '策略触达后转化比例', defaultWeight: 34 },
  { name: 'AI策略占比', unit: '%', dimension: 'strategy', description: 'AI驱动的策略占比', defaultWeight: 33 },
  { name: '策略覆盖度', unit: '%', dimension: 'strategy', description: '策略覆盖客户范围', defaultWeight: 33 },
  { name: '策略准确率', unit: '%', dimension: 'strategy', description: '策略预测准确性', defaultWeight: 34 },
  { name: '策略收益', unit: '万元', dimension: 'strategy', description: '策略带来的收益', defaultWeight: 33 },

  // 客户价值维度
  { name: '离网率', unit: '%', dimension: 'customer', description: '客户流失率', defaultWeight: 33 },
  { name: '融合率', unit: '%', dimension: 'customer', description: '客户业务融合比例', defaultWeight: 34 },
  { name: '客户满意度', unit: '%', dimension: 'customer', description: '客户满意度评分', defaultWeight: 33 },
  { name: 'NPS评分', unit: '分', dimension: 'customer', description: '净推荐值', defaultWeight: 33 },
  { name: '投诉率', unit: '%', dimension: 'customer', description: '客户投诉比例', defaultWeight: 34 },
  { name: '复购率', unit: '%', dimension: 'customer', description: '客户复购比例', defaultWeight: 33 },

  // 执行质量维度
  { name: '投诉工单解决率', unit: '%', dimension: 'resource', description: '投诉工单成功解决比例', defaultWeight: 50 },
  { name: '重复投诉率', unit: '%', dimension: 'resource', description: '客户重复投诉比例', defaultWeight: 50 },
  { name: '投诉处理及时率', unit: '%', dimension: 'resource', description: '投诉工单按时处理比例', defaultWeight: 50 },
  { name: '投诉满意度', unit: '%', dimension: 'resource', description: '客户对投诉处理的满意度', defaultWeight: 50 },
  { name: '投诉处理时长', unit: '小时', dimension: 'resource', description: '投诉工单平均处理时间', defaultWeight: 50 },
  { name: '投诉一次解决率', unit: '%', dimension: 'resource', description: '投诉工单一次性解决比例', defaultWeight: 50 },
];

// 区域代码映射
const regionCodeMap: Record<string, string> = {
  'national': 'ALL',
  'wulumuqi': 'WLMQ',
  'kelamayi': 'KLYM',
  'tulufan': 'TLF',
  'hami': 'HM',
  'changji': 'CJ',
  'boertala': 'BETL',
  'bayinguoleng': 'BYGL',
  'akesu': 'AKS',
  'kezhou': 'KZ',
  'kashi': 'KS',
  'hetian': 'HT',
  'yili': 'YL',
  'tacheng': 'TC',
  'aletai': 'ALT',
  'shihezi': 'SHZ',
  'alaer': 'ALE',
  'tumushuke': 'TMSK',
  'wujiaqu': 'WJQ',
  'beitun': 'BT',
  'tiemenguan': 'TMG',
  'shuanghe': 'SHH',
  'kekedala': 'KKDL',
  'kunyu': 'KY',
  'huyanghe': 'HYH',
};

// 确定性随机数生成器
let healthDataSeed = 1;
function seededRandom() {
  const x = Math.sin(healthDataSeed++) * 10000;
  return x - Math.floor(x);
}

// 从多时间周期数据生成健康度数据
const generateHealthDataFromRegionData = (regionData: RegionTimeData): HealthDimension[] => {
  const { metricValues, metricScores, dimensionScores } = regionData;
  
  // 重置种子，确保一致性
  healthDataSeed = regionData.regionCode.length * 100;
  
  return [
    {
      key: 'quantity',
      name: '量',
      score: dimensionScores.quantity,
      weight: 25,
      metrics: [
        { name: '客户规模', value: (9000 + seededRandom() * 1000).toFixed(0), unit: '万户', score: dimensionScores.quantity, weight: 33, enabled: true },
        { name: '5G用户数', value: (6000 + seededRandom() * 500).toFixed(0), unit: '万户', score: dimensionScores.quantity, weight: 34, enabled: true },
        { name: 'ARPU值', value: (85 + seededRandom() * 10).toFixed(1), unit: '元', score: dimensionScores.quantity, weight: 33, enabled: true },
      ],
    },
    {
      key: 'quality',
      name: '质',
      score: dimensionScores.quality,
      weight: 25,
      metrics: [
        { name: '离网率', value: (3 - dimensionScores.quality * 0.02).toFixed(1), unit: '%', score: metricScores.quality, weight: 50, enabled: true },
        { name: '投诉率', value: (5 - dimensionScores.quality * 0.03).toFixed(1), unit: '%', score: metricScores.quality, weight: 50, enabled: true },
      ],
    },
    {
      key: 'structure',
      name: '构',
      score: dimensionScores.structure,
      weight: 25,
      metrics: [
        { name: '中高端占比', value: (65 + seededRandom() * 10).toFixed(1), unit: '%', score: dimensionScores.structure, weight: 50, enabled: true },
        { name: '融合率', value: (50 + dimensionScores.structure * 0.2).toFixed(1), unit: '%', score: dimensionScores.structure, weight: 50, enabled: true },
      ],
    },
    {
      key: 'effect',
      name: '效',
      score: dimensionScores.effect,
      weight: 25,
      metrics: [
        { name: '客户满意度', value: (85 + dimensionScores.effect * 0.05).toFixed(1), unit: '%', score: metricScores.customer, weight: 50, enabled: true },
        { name: '工单完成率', value: metricValues.workOrderCompletionRate.toFixed(1), unit: '%', score: metricScores.quality, weight: 50, enabled: true },
      ],
    },
  ];
};

// 五维健康度数据接口
interface DimensionMetric {
  name: string;
  value: string;
  unit?: string;
  score: number;
  weight: number; // 指标权重，0-100
  enabled: boolean; // 指标是否启用
}

interface HealthDimension {
  key: string;
  name: string;
  score: number;
  metrics: DimensionMetric[];
  weight: number; // 权重，0-100，默认20（五维平分）
}

// 地域筛选器选项 - 新疆移动16地市分公司
const regionFilterOptions = [
  { value: 'national', label: '全疆' },
  { value: 'wulumuqi', label: '乌鲁木齐' },
  { value: 'kelamayi', label: '克拉玛依' },
  { value: 'tulufan', label: '吐鲁番' },
  { value: 'hami', label: '哈密' },
  { value: 'changji', label: '昌吉' },
  { value: 'bozhou', label: '博州' },
  { value: 'bazhou', label: '巴州' },
  { value: 'akesu', label: '阿克苏' },
  { value: 'kezhou', label: '克州' },
  { value: 'kashi', label: '喀什' },
  { value: 'hetian', label: '和田' },
  { value: 'yili', label: '伊犁' },
  { value: 'tacheng', label: '塔城' },
  { value: 'aletai', label: '阿勒泰' },
  { value: 'kuitun', label: '奎屯' },
  { value: 'shihezi', label: '石河子' },
];

// 选中的指标类型
export type SelectedMetricType = {
  dimensionKey: string | null;  // 维度key，如 'business'
  metricName: string | null;    // 指标名称，如 '客户规模'
  dimensionName: string | null; // 维度名称，如 '核心业务'
};

// 排序类型 - 直接使用四维维度的key
export type SortType =
  | 'overall'    // 综合得分
  | 'quantity'   // 量
  | 'quality'    // 质
  | 'structure'  // 构
  | 'effect';    // 效

export function HealthRadarOverview() {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [selectedMetricName, setSelectedMetricName] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimePeriod>('lastMonth');
  const [selectedRegion, setSelectedRegion] = useState('national');
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetricType>({
    dimensionKey: null,
    metricName: null,
    dimensionName: null,
  });
  const [sortType, setSortType] = useState<SortType>('overall');
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [dimensionWeights, setDimensionWeights] = useState<Record<string, number>>({
    quantity: 25,
    quality: 25,
    structure: 25,
    effect: 25,
  });

  // 指标权重状态
  const [showMetricSettingsDialog, setShowMetricSettingsDialog] = useState(false);
  const [metricWeights, setMetricWeights] = useState<Record<string, Record<string, { weight: number; enabled: boolean }>>>({
    quantity: {
      '客户规模': { weight: 33, enabled: true },
      '5G用户数': { weight: 34, enabled: true },
      'ARPU值': { weight: 33, enabled: true },
    },
    quality: {
      '离网率': { weight: 50, enabled: true },
      '投诉率': { weight: 50, enabled: true },
    },
    structure: {
      '中高端占比': { weight: 50, enabled: true },
      '融合率': { weight: 50, enabled: true },
    },
    effect: {
      '客户满意度': { weight: 50, enabled: true },
      '工单完成率': { weight: 50, enabled: true },
    },
  });

  // 指标选择对话框状态
  const [showMetricSelectorDialog, setShowMetricSelectorDialog] = useState(false);
  const [selectedMetricsToAdd, setSelectedMetricsToAdd] = useState<string[]>([]);
  
  // 运营模块tab状态
  const [selectedModule, setSelectedModule] = useState('中高端客户运营');
  
  // 选中的运营专区
  const [selectedZone, setSelectedZone] = useState(operationZones[0]);
  
  // 地图组件引用
  const mapRef = useRef<ChinaMapRef>(null);

  // 根据时间和区域获取健康度数据
  const getHealthData = useCallback((time: TimePeriod, region: string): HealthDimension[] => {
    const regionCode = regionCodeMap[region] || 'ALL';
    const regionData = getRegionData(regionCode, time);
    
    if (regionData) {
      return generateHealthDataFromRegionData(regionData);
    }
    
    // 默认返回全国上月数据
    const defaultData = getRegionData('ALL', 'lastMonth');
    return defaultData ? generateHealthDataFromRegionData(defaultData) : [];
  }, []);

  // 动态获取健康度数据
  const healthDimensions = getHealthData(selectedTime, selectedRegion);

  // 根据指标权重和启用状态计算维度得分
  const calculateDimensionScore = (dimension: HealthDimension): number => {
    const metricConfigs = metricWeights[dimension.key];
    if (!metricConfigs) return dimension.score;

    const enabledMetrics = dimension.metrics.filter(m => metricConfigs[m.name]?.enabled);
    if (enabledMetrics.length === 0) return 0;

    const totalMetricWeight = enabledMetrics.reduce((sum, m) => sum + (metricConfigs[m.name]?.weight || 0), 0);
    if (totalMetricWeight === 0) return enabledMetrics.reduce((sum, m) => sum + m.score, 0) / enabledMetrics.length;

    const weightedScore = enabledMetrics.reduce((sum, m) => {
      const weight = metricConfigs[m.name]?.weight || 0;
      return sum + (m.score * weight);
    }, 0);

    return weightedScore / totalMetricWeight;
  };

  // 计算综合得分（使用加权平均）
  const totalWeight = Object.values(dimensionWeights).reduce((sum, w) => sum + w, 0);
  const weightedScore = healthDimensions.reduce((sum, d) => {
    const weight = dimensionWeights[d.key] || 20;
    const dimensionScore = calculateDimensionScore(d);
    return sum + (dimensionScore * weight);
  }, 0);
  const overallScore = totalWeight > 0 ? (weightedScore / totalWeight).toFixed(1) : '0.0';

  // 根据选中的指标映射到排序类型
  const getSortTypeFromMetric = (metric: SelectedMetricType): SortType => {
    // 直接使用维度的key作为排序类型
    if (!metric.dimensionKey) return 'overall';
    return metric.dimensionKey as SortType;
  };

  // 当选中的指标变化时，更新排序类型
  useEffect(() => {
    if (selectedMetric && selectedMetric.dimensionKey) {
      const newSortType = getSortTypeFromMetric(selectedMetric);
      setSortType(newSortType);
    }
  }, [selectedMetric]);

  // 获取得分颜色
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // 获取红黄绿灯图标
  const getStatusIcon = (score: number) => {
    if (score >= 85) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (score >= 75) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  // 获取状态背景色
  const getStatusBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    if (score >= 75) return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  };

  // 处理权重变化
  const handleWeightChange = (dimensionKey: string, value: number[]) => {
    setDimensionWeights(prev => ({
      ...prev,
      [dimensionKey]: value[0],
    }));
  };

  // 重置权重为默认值
  const handleResetWeights = () => {
    setDimensionWeights({
      business: 20,
      process: 20,
      strategy: 20,
      customer: 20,
      resource: 20,
    });
  };

  // 处理指标权重变化
  const handleMetricWeightChange = (dimensionKey: string, metricName: string, weight: number) => {
    setMetricWeights(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        [metricName]: {
          ...prev[dimensionKey][metricName],
          weight,
        },
      },
    }));
  };

  // 处理指标启用/禁用
  const handleMetricToggle = (dimensionKey: string, metricName: string) => {
    setMetricWeights(prev => ({
      ...prev,
      [dimensionKey]: {
        ...prev[dimensionKey],
        [metricName]: {
          ...prev[dimensionKey][metricName],
          enabled: !prev[dimensionKey][metricName].enabled,
        },
      },
    }));
  };

  // 重置指标权重为默认值
  const handleResetMetricWeights = () => {
    setMetricWeights({
      business: {
        '离网率': { weight: 25, enabled: true },
        '5G渗透率': { weight: 25, enabled: true },
        '中高端客户规模保有率': { weight: 25, enabled: true },
        '中高端客户价值保有率': { weight: 25, enabled: true },
      },
      process: {
        '工单完成率': { weight: 33, enabled: true },
        '超时率': { weight: 34, enabled: true },
        '平均处理时长': { weight: 33, enabled: true },
      },
      strategy: {
        '策略执行率': { weight: 33, enabled: true },
        '策略转化率': { weight: 34, enabled: true },
        'AI策略占比': { weight: 33, enabled: true },
      },
      customer: {
        '离网率': { weight: 33, enabled: true },
        '融合率': { weight: 34, enabled: true },
        '客户满意度': { weight: 33, enabled: true },
      },
      resource: {
        '投诉工单解决率': { weight: 50, enabled: true },
        '重复投诉率': { weight: 50, enabled: true },
      },
    });
  };

  // 处理指标选择
  const handleMetricSelectToggle = (metricName: string) => {
    setSelectedMetricsToAdd(prev =>
      prev.includes(metricName)
        ? prev.filter(m => m !== metricName)
        : [...prev, metricName]
    );
  };

  // 确认添加选中的指标
  const handleAddMetrics = () => {
    if (!selectedDimension) return;

    setMetricWeights(prev => {
      const newMetrics = { ...prev[selectedDimension] };
      selectedMetricsToAdd.forEach(metricName => {
        const metricItem = metricLibrary.find(m => m.name === metricName);
        if (metricItem && !newMetrics[metricName]) {
          newMetrics[metricName] = {
            weight: metricItem.defaultWeight,
            enabled: true,
          };
        }
      });

      return {
        ...prev,
        [selectedDimension]: newMetrics,
      };
    });

    setSelectedMetricsToAdd([]);
    setShowMetricSelectorDialog(false);
  };

  // 获取当前维度下可添加的指标（排除已添加的）
  const getAvailableMetrics = (dimensionKey: string): MetricLibraryItem[] => {
    const currentMetrics = Object.keys(metricWeights[dimensionKey] || {});
    return metricLibrary.filter(
      m => m.dimension === dimensionKey && !currentMetrics.includes(m.name)
    );
  };

  // 处理维度点击
  const handleDimensionClick = (dimension: HealthDimension) => {
    if (selectedDimension === dimension.key) {
      // 取消选中：重置所有状态
      setSelectedDimension(null);
      setSelectedMetricName(null);
      setSelectedMetric({
        dimensionKey: null,
        metricName: null,
        dimensionName: null,
      });
      setSortType('overall');
    } else {
      // 选中新维度
      setSelectedDimension(dimension.key);
      setSelectedMetricName(null);
      setSelectedMetric({
        dimensionKey: dimension.key,
        metricName: null,
        dimensionName: dimension.name,
      });
      setSortType(dimension.key as SortType);
    }
  };

  // 处理指标点击
  const handleMetricClick = (dimension: HealthDimension, metric: DimensionMetric) => {
    setSelectedMetricName(metric.name);
    setSelectedMetric({
      dimensionKey: dimension.key,
      metricName: metric.name,
      dimensionName: dimension.name,
    });
  };

  // 地图相关逻辑
  const sortTypeMap: { [key: string]: string } = {
    overall: '综合得分',
    business: '核心业务',
    process: '流程执行',
    strategy: '策略模型',
    customer: '客户价值',
    resource: '执行质量',
  };

  // 从多时间周期数据动态计算regionEfficiency的值
  const calculateRegionEfficiency = (): RegionEfficiency[] => {
    const allRegionsData = getAllRegionsData(selectedTime);

    return regionEfficiency.map(region => {
      // 找到对应区域的数据（跳过第一个，因为第一个是全疆数据）
      const regionData = allRegionsData.find(r => r.regionCode === region.code);

      if (regionData) {
        // 为该区域生成健康度数据
        const regionHealthData = generateHealthDataFromRegionData(regionData);

        // 计算各维度的得分（考虑指标权重）
        const calculateRegionDimensionScore = (dimension: HealthDimension): number => {
          const metricConfigs = metricWeights[dimension.key];
          if (!metricConfigs) return dimension.score;

          const enabledMetrics = dimension.metrics.filter(m => metricConfigs[m.name]?.enabled);
          if (enabledMetrics.length === 0) return 0;

          const totalMetricWeight = enabledMetrics.reduce((sum, m) => sum + (metricConfigs[m.name]?.weight || 0), 0);
          if (totalMetricWeight === 0) return enabledMetrics.reduce((sum, m) => sum + m.score, 0) / enabledMetrics.length;

          const weightedScore = enabledMetrics.reduce((sum, m) => {
            const weight = metricConfigs[m.name]?.weight || 0;
            return sum + (m.score * weight);
          }, 0);

          return weightedScore / totalMetricWeight;
        };

        const quantityScore = calculateRegionDimensionScore(regionHealthData.find(d => d.key === 'quantity')!);
        const qualityScore = calculateRegionDimensionScore(regionHealthData.find(d => d.key === 'quality')!);
        const structureScore = calculateRegionDimensionScore(regionHealthData.find(d => d.key === 'structure')!);
        const effectScore = calculateRegionDimensionScore(regionHealthData.find(d => d.key === 'effect')!);

        // 使用加权平均计算综合得分
        const overallScore = (
          quantityScore * (dimensionWeights.quantity / 100) +
          qualityScore * (dimensionWeights.quality / 100) +
          structureScore * (dimensionWeights.structure / 100) +
          effectScore * (dimensionWeights.effect / 100)
        );

        return {
          ...region,
          score: overallScore,
          overall: overallScore,
          quantity: quantityScore,
          quality: qualityScore,
          structure: structureScore,
          effect: effectScore,
          // 更新RegionEfficiency接口字段
          overallHealth: overallScore,
        };
      }

      // 如果找不到数据，返回原始数据
      return region;
    });
  };

  // 动态计算的regionEfficiency数据
  const dynamicRegionEfficiency = calculateRegionEfficiency();
  
  // 根据选中的运营专区过滤区域数据
  const filteredRegionEfficiency = selectedZone
    ? dynamicRegionEfficiency.filter(region => selectedZone.provinces.includes(region.code))
    : dynamicRegionEfficiency;

  // 根据排序类型获取值
  const getValue = (region: RegionEfficiency, type: SortType): number => {
    // 新字段名直接使用维度key
    if (type === 'overall') return region.overallHealth || 0;
    if (type === 'quantity') return region.quantity || 0;
    if (type === 'quality') return region.quality || 0;
    if (type === 'structure') return region.structure || 0;
    if (type === 'effect') return region.effect || 0;
    return region[type];
  };

  // 获取排序后的数据
  const sortedRegions = [...dynamicRegionEfficiency].sort((a, b) => {
    return getValue(b, sortType) - getValue(a, sortType);
  });

  // TOP5
  const top5 = sortedRegions.slice(0, 5);
  // 末5
  const bottom5 = sortedRegions.slice(-5).reverse();

  // 调试日志
  console.log('[HealthRadar] 当前的 sortType:', sortType);
  console.log('[HealthRadar] 前5名:', top5.map(r => ({ name: r.name, value: getValue(r, sortType) })));
  console.log('[HealthRadar] 后5名:', bottom5.map(r => ({ name: r.name, value: getValue(r, sortType) })));

  // 获取排名样式
  const getRankBadge = (rank: number, isTop: boolean) => {
    if (isTop) {
      // 排名 1-5 统一使用绿色主题
      if (rank >= 1 && rank <= 5) {
        return <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{rank}</div>;
      }
      return <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
    return <div className="w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold">{rank}</div>;
  };

  // 获取变化图标
  const getChangeIcon = (rank: number, isTop: boolean) => {
    if (rank <= 3) return null;
    return isTop ? null : null;
  };

  // 处理省份点击
  const handleProvinceClick = (region: RegionEfficiency) => {
    console.log('点击省份:', region.name);
  };

  // 获取地图标题 - 根据选中的维度/指标动态显示
  const getMapTitle = () => {
    // 如果选中了具体指标，显示指标名称
    if (selectedMetric.metricName) {
      return `全国${selectedMetric.metricName}分布地图`;
    }
    
    // 如果选中了维度，显示维度名称
    if (selectedMetric.dimensionName) {
      return `全国${selectedMetric.dimensionName}分布地图`;
    }
    
    // 默认标题
    return '全国运营健康度分布地图';
  };

  // 处理时间周期切换
  const handleTimePeriodChange = (period: TimePeriod) => {
    setSelectedTime(period);
    // 重置选中状态，避免显示错误的数据
    setSelectedDimension(null);
    setSelectedMetricName(null);
    setSelectedMetric({
      dimensionKey: null,
      metricName: null,
      dimensionName: null,
    });
    setSortType('overall');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">运营健康度</CardTitle>
          </div>
          <Link href="/evaluation-center/health-config">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Settings className="w-4 h-4 mr-1" />
              设置
            </Button>
          </Link>
        </div>
      </CardHeader>
      {/* 运营模块tab导航 */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-900">
        <div className="flex gap-6 overflow-x-auto">
          {operationZones.map((zone) => (
            <button
              key={zone.name}
              onClick={() => {
                setSelectedModule(zone.name);
                setSelectedZone(zone);
              }}
              className={`py-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedModule === zone.name
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {zone.name}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  zone.score >= 80 ? 'bg-green-100 text-green-700' :
                  zone.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {zone.score.toFixed(1)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <CardContent>
        <div className="flex flex-col gap-4">

          {/* 展开的指标详情 - 横向滚动 */}
          {selectedDimension && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {healthDimensions.find(d => d.key === selectedDimension)?.name} - 核心指标
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {healthDimensions.find(d => d.key === selectedDimension)?.metrics.length} 项指标
                  </Badge>
                </div>
                <Dialog open={showMetricSettingsDialog} onOpenChange={setShowMetricSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <Settings className="w-3.5 h-3.5 mr-1" />
                      指标设置
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>指标设置 - {healthDimensions.find(d => d.key === selectedDimension)?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {healthDimensions.find(d => d.key === selectedDimension)?.metrics.map((metric, index) => {
                        const metricConfig = metricWeights[selectedDimension!]?.[metric.name];
                        if (!metricConfig) return null;

                        return (
                          <div key={index} className={`p-4 border rounded-lg ${!metricConfig.enabled ? 'opacity-50 bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={metricConfig.enabled}
                                  onCheckedChange={() => handleMetricToggle(selectedDimension!, metric.name)}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                                <Label className="text-sm font-medium">{metric.name}</Label>
                              </div>
                              <Badge variant={metricConfig.enabled ? "default" : "secondary"} className="text-xs">
                                {metricConfig.enabled ? '已启用' : '已禁用'}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-500 dark:text-gray-400">权重</Label>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {metricConfig.weight}%
                                </span>
                              </div>
                              <Slider
                                value={[metricConfig.weight]}
                                onValueChange={(value) => handleMetricWeightChange(selectedDimension!, metric.name, value[0])}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full"
                                disabled={!metricConfig.enabled}
                              />
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">总权重</span>
                          <span className={`text-sm font-bold ${
                            Object.values(metricWeights[selectedDimension!] || {}).reduce((sum, m) => sum + (m.enabled ? m.weight : 0), 0) === 100
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {Object.values(metricWeights[selectedDimension!] || {}).reduce((sum, m) => sum + (m.enabled ? m.weight : 0), 0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Object.values(metricWeights[selectedDimension!] || {}).reduce((sum, m) => sum + (m.enabled ? m.weight : 0), 0) === 100
                            ? '权重设置正确'
                            : '注意：已启用指标的总权重建议为100%'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMetricSelectorDialog(true)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          新增指标
                        </Button>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetMetricWeights}
                          >
                            重置为默认
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowMetricSettingsDialog(false)}
                          >
                            确定
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>

                  {/* 指标选择对话框 */}
                  <Dialog open={showMetricSelectorDialog} onOpenChange={setShowMetricSelectorDialog}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>新增指标 - {healthDimensions.find(d => d.key === selectedDimension)?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {getAvailableMetrics(selectedDimension!).length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            没有可添加的指标
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {getAvailableMetrics(selectedDimension!).map((metric, index) => (
                              <div
                                key={index}
                                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedMetricsToAdd.includes(metric.name)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                                onClick={() => handleMetricSelectToggle(metric.name)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                      selectedMetricsToAdd.includes(metric.name)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                      {selectedMetricsToAdd.includes(metric.name) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {metric.name}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                    {metric.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    默认权重 {metric.defaultWeight}%
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {metric.unit}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              已选择 {selectedMetricsToAdd.length} 个指标
                            </span>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMetricsToAdd([]);
                                  setShowMetricSelectorDialog(false);
                                }}
                              >
                                取消
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleAddMetrics}
                                disabled={selectedMetricsToAdd.length === 0}
                              >
                                添加 ({selectedMetricsToAdd.length})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Dialog>
              </div>
              {/* 横向滚动容器 */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {healthDimensions.find(d => d.key === selectedDimension)?.metrics.map((metric, index) => {
                  const metricConfig = metricWeights[selectedDimension!]?.[metric.name];
                  return (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-48 p-3 bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-colors ${
                        selectedMetricName === metric.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      } ${!metricConfig?.enabled ? 'opacity-50' : ''}`}
                      onClick={(e) => {
                        if (metricConfig?.enabled) {
                          e.stopPropagation();
                          handleMetricClick(healthDimensions.find(d => d.key === selectedDimension)!, metric);
                        }
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {metric.name}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">得分:</span>
                        <span className={`text-xs font-semibold ${getScoreColor(metric.score)}`}>{metric.score}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          权重 {metricConfig?.weight}%
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {metric.value}
                          {metric.unit && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">{metric.unit}</span>}
                        </div>
                      </div>
                      {!metricConfig?.enabled && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 区域效能热力图 - 仅在全国模式下显示 */}
          {selectedRegion === 'national' && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
              {/* 左侧：地图 */}
              <div className="lg:col-span-2 h-full">
                <ChinaMap
                  ref={mapRef}
                  regionEfficiency={dynamicRegionEfficiency}
                  onRegionClick={handleProvinceClick}
                  getValue={getValue}
                  sortType={sortType}
                  top5={top5}
                  bottom5={bottom5}
                  sortedRegions={sortedRegions}
                  getRankBadge={getRankBadge}
                  getChangeIcon={getChangeIcon}
                  title={selectedZone ? `${selectedZone.name} - 地州综合评分分布` : '全疆运营健康度分布地图'}
                  selectedMetric={selectedMetric}
                  healthDimensions={healthDimensions}
                  timePeriod={selectedTime}
                  selectedZoneProvinces={selectedZone.provinces}
                />
              </div>

              {/* 右侧：量质构效卡片 */}
              <div className="lg:col-span-1 overflow-y-auto space-y-4">
                <DimensionCard
                  title="量"
                  color="#3b82f6"
                  metrics={zoneMetricsConfig[selectedZone.name]?.quantity || []}
                />
                <DimensionCard
                  title="质"
                  color="#10b981"
                  metrics={zoneMetricsConfig[selectedZone.name]?.quality || []}
                />
                <DimensionCard
                  title="构"
                  color="#f59e0b"
                  metrics={zoneMetricsConfig[selectedZone.name]?.structure || []}
                />
                <DimensionCard
                  title="效"
                  color="#8b5cf6"
                  metrics={zoneMetricsConfig[selectedZone.name]?.effect || []}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 运营健康度组件 - 支持时间和区域筛选联动
