'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import {
  RefreshCw,
  TrendingUp,
  Target,
  Activity,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WorkOrderTypeTreeSelect from '@/components/WorkOrderTypeTreeSelect';
import { useMounted } from '@/hooks/useMounted';

// 中国移动品牌色
const COLORS = ['#0085D0', '#60B3E2', '#C0E1F3', '#10B981', '#EF4444'];

// 模拟数据 - 新疆16地市分公司数据
const provincesData = [
  { name: '乌鲁木齐', total: 234, inProgress: 45, timeout: 8, completionRate: 88 },
  { name: '克拉玛依', total: 312, inProgress: 67, timeout: 12, completionRate: 85 },
  { name: '吐鲁番', total: 456, inProgress: 98, timeout: 18, completionRate: 82 },
  { name: '哈密', total: 378, inProgress: 76, timeout: 15, completionRate: 84 },
  { name: '昌吉', total: 345, inProgress: 72, timeout: 13, completionRate: 86 },
  { name: '博州', total: 298, inProgress: 58, timeout: 10, completionRate: 87 },
  { name: '巴州', total: 267, inProgress: 52, timeout: 9, completionRate: 88 },
  { name: '阿克苏', total: 234, inProgress: 45, timeout: 8, completionRate: 89 },
  { name: '克州', total: 289, inProgress: 56, timeout: 11, completionRate: 86 },
  { name: '喀什', total: 256, inProgress: 48, timeout: 9, completionRate: 87 },
  { name: '和田', total: 223, inProgress: 42, timeout: 7, completionRate: 88 },
  { name: '伊犁', total: 245, inProgress: 46, timeout: 8, completionRate: 87 },
  { name: '塔城', total: 212, inProgress: 40, timeout: 7, completionRate: 89 },
  { name: '阿勒泰', total: 198, inProgress: 38, timeout: 6, completionRate: 89 },
  { name: '石河子', total: 187, inProgress: 35, timeout: 6, completionRate: 90 },
  { name: '阿克苏', total: 201, inProgress: 38, timeout: 7, completionRate: 89 },
  { name: '阿克苏', total: 156, inProgress: 30, timeout: 5, completionRate: 90 },
  { name: '昌吉', total: 178, inProgress: 34, timeout: 6, completionRate: 89 },
  { name: '阿勒泰', total: 167, inProgress: 32, timeout: 6, completionRate: 90 },
  { name: '巴州', total: 145, inProgress: 28, timeout: 5, completionRate: 91 },
  { name: '博州', total: 134, inProgress: 25, timeout: 5, completionRate: 91 },
  { name: '伊犁', total: 123, inProgress: 23, timeout: 4, completionRate: 92 },
  { name: '和田', total: 112, inProgress: 21, timeout: 4, completionRate: 92 },
  { name: '奎屯', total: 98, inProgress: 19, timeout: 3, completionRate: 93 },
];

// 全疆Top5指标数据
const nationalMetricsTop5 = [
  {
    name: '5G套包升档率',
    currentValue: '28.5%',
    improvement: '+2.1%',
    activityCount: 8,
    totalOrders: 150000,
    trendData: [
      { month: '8月', value: 26.4 },
      { month: '9月', value: 27.0 },
      { month: '10月', value: 27.5 },
      { month: '11月', value: 27.8 },
      { month: '12月', value: 28.0 },
      { month: '1月', value: 28.5 },
    ],
    activities: [
      { id: 'a1', name: '5G优惠套餐推广活动', orderCount: 50000, date: '2025-01', status: '进行中', products: [{ name: '5G 128G套餐', count: 20000 }, { name: '5G 256G套餐', count: 18000 }, { name: '5G 512G套餐', count: 12000 }] },
      { id: 'a2', name: '5G终端补贴活动', orderCount: 40000, date: '2025-01', status: '进行中', products: [{ name: '华为Mate 60', count: 15000 }, { name: 'iPhone 15', count: 15000 }, { name: '小米14', count: 10000 }] },
      { id: 'a3', name: '企业5G专网推广', orderCount: 35000, date: '2024-12', status: '已完成', products: [{ name: '企业5G专网基础版', count: 20000 }, { name: '企业5G专网高级版', count: 15000 }] },
      { id: 'a4', name: '5G家庭宽带推广', orderCount: 25000, date: '2024-12', status: '已完成', products: [{ name: '5G家庭宽带300M', count: 15000 }, { name: '5G家庭宽带1000M', count: 10000 }] },
      { id: 'a5', name: '5G校园推广活动', orderCount: 20000, date: '2024-11', status: '已完成', products: [{ name: '校园5G套餐', count: 12000 }, { name: '5G 128G套餐', count: 8000 }] },
      { id: 'a6', name: '', orderCount: 5000, date: '', status: '已完成', products: [{ name: '5G 128G套餐', count: 5000 }] },
      { id: 'a7', name: '5G商务套餐推广', orderCount: 10000, date: '2024-09', status: '已完成', products: [{ name: '商务5G套餐', count: 8000 }, { name: '5G会议卡', count: 2000 }] },
      { id: 'a8', name: '', orderCount: 10000, date: '', status: '已完成', products: [{ name: '老人5G套餐', count: 10000 }] },
    ],
  },
  {
    name: '家庭宽带续费率',
    currentValue: '72.5%',
    improvement: '+1.8%',
    activityCount: 4,
    totalOrders: 120000,
    trendData: [
      { month: '8月', value: 70.7 },
      { month: '9月', value: 71.0 },
      { month: '10月', value: 71.5 },
      { month: '11月', value: 70.5 },
      { month: '12月', value: 71.2 },
      { month: '1月', value: 72.5 },
    ],
    activities: [
      { id: 'a9', name: '千兆宽带提速活动', orderCount: 45000, date: '2025-01', status: '进行中', products: [{ name: '千兆光纤1000M', count: 25000 }, { name: 'FTTR全屋光网', count: 20000 }] },
      { id: 'a10', name: '智能家居套餐推广', orderCount: 35000, date: '2025-01', status: '进行中', products: [{ name: '智能家居基础版', count: 20000 }, { name: '智能家居高级版', count: 15000 }] },
      { id: 'a11', name: '', orderCount: 25000, date: '', status: '已完成', products: [{ name: '企业专线100M', count: 15000 }, { name: '企业专线500M', count: 10000 }] },
      { id: 'a12', name: '', orderCount: 15000, date: '', status: '已完成', products: [{ name: '云宽带基础版', count: 10000 }, { name: '云宽带企业版', count: 5000 }] },
    ],
  },
  {
    name: 'ARPU规模',
    currentValue: '58.2元',
    improvement: '+1.2%',
    activityCount: 5,
    totalOrders: 80000,
    trendData: [
      { month: '8月', value: 56.5 },
      { month: '9月', value: 57.0 },
      { month: '10月', value: 57.5 },
      { month: '11月', value: 57.8 },
      { month: '12月', value: 58.0 },
      { month: '1月', value: 58.2 },
    ],
    activities: [
      { id: 'a13', name: '企业云服务推广', orderCount: 30000, date: '2025-01', status: '进行中', products: [{ name: '云主机', count: 12000 }, { name: '云存储', count: 10000 }, { name: '云数据库', count: 8000 }] },
      { id: 'a14', name: '', orderCount: 25000, date: '', status: '进行中', products: [{ name: '机柜租赁', count: 15000 }, { name: '带宽租赁', count: 10000 }] },
      { id: 'a15', name: '', orderCount: 15000, date: '', status: '已完成', products: [{ name: '企业办公系统', count: 10000 }, { name: 'ERP系统', count: 5000 }] },
      { id: 'a16', name: '物联网服务推广', orderCount: 10000, date: '2024-12', status: '已完成', products: [{ name: 'NB-IoT卡', count: 6000 }, { name: '5G模组', count: 4000 }] },
    ],
  },
  {
    name: '流量包渗透率',
    currentValue: '45.3%',
    improvement: '+0.8%',
    activityCount: 4,
    totalOrders: 60000,
    trendData: [
      { month: '8月', value: 44.5 },
      { month: '9月', value: 44.7 },
      { month: '10月', value: 44.9 },
      { month: '11月', value: 44.8 },
      { month: '12月', value: 45.0 },
      { month: '1月', value: 45.3 },
    ],
    activities: [
      { id: 'a17', name: '大流量套餐推广', orderCount: 25000, date: '2025-01', status: '进行中', products: [{ name: '50G流量包', count: 10000 }, { name: '100G流量包', count: 8000 }, { name: '200G流量包', count: 7000 }] },
      { id: 'a18', name: '周末流量包优惠', orderCount: 20000, date: '2025-01', status: '进行中', products: [{ name: '周末10G流量包', count: 12000 }, { name: '周末20G流量包', count: 8000 }] },
      { id: 'a19', name: '', orderCount: 15000, date: '', status: '已完成', products: [{ name: '夜间10G流量包', count: 10000 }, { name: '夜间30G流量包', count: 5000 }] },
    ],
  },
  {
    name: '全球通保有率',
    currentValue: '96.8%',
    improvement: '+0.2%',
    activityCount: 3,
    totalOrders: 40000,
    trendData: [
      { month: '8月', value: 96.5 },
      { month: '9月', value: 96.6 },
      { month: '10月', value: 96.5 },
      { month: '11月', value: 96.7 },
      { month: '12月', value: 96.6 },
      { month: '1月', value: 96.8 },
    ],
    activities: [
      { id: 'a20', name: '全球通老用户回馈', orderCount: 20000, date: '2025-01', status: '进行中', products: [{ name: '全球通128套餐', count: 12000 }, { name: '全球通198套餐', count: 8000 }] },
      { id: 'a21', name: '全球通套餐升级', orderCount: 15000, date: '2024-12', status: '已完成', products: [{ name: '全球通298套餐', count: 10000 }, { name: '全球通598套餐', count: 5000 }] },
      { id: 'a22', name: '', orderCount: 5000, date: '', status: '已完成', products: [{ name: '全球通积分兑换', count: 3000 }, { name: '全球通会员权益', count: 2000 }] },
    ],
  },
];

// 全国Bottom5指标数据
const nationalMetricsBottom5 = [
  {
    name: 'ARPU值提升',
    currentValue: '42.5元',
    improvement: '-1.2%',
    activityCount: 5,
    totalOrders: 35000,
    trendData: [
      { month: '8月', value: 43.7 },
      { month: '9月', value: 43.5 },
      { month: '10月', value: 43.2 },
      { month: '11月', value: 43.0 },
      { month: '12月', value: 42.8 },
      { month: '1月', value: 42.5 },
    ],
    activities: [
      { id: 'b1', name: '高价值客户维系活动', orderCount: 12000, date: '2025-01', status: '进行中', products: [{ name: '高端套餐', count: 8000 }, { name: '企业套餐', count: 4000 }] },
      { id: 'b2', name: '增值服务推广', orderCount: 8000, date: '2025-01', status: '进行中', products: [{ name: '视频会员', count: 4000 }, { name: '音乐会员', count: 2500 }, { name: '阅读会员', count: 1500 }] },
      { id: 'b3', name: '', orderCount: 7000, date: '', status: '已完成', products: [{ name: '38元套餐升级', count: 4000 }, { name: '58元套餐升级', count: 3000 }] },
      { id: 'b4', name: '国际漫游推广', orderCount: 5000, date: '2024-12', status: '已完成', products: [{ name: '国际漫游流量包', count: 3000 }, { name: '国际漫游日包', count: 2000 }] },
      { id: 'b5', name: '视频会员推广', orderCount: 3000, date: '2024-11', status: '已完成', products: [{ name: '腾讯视频会员', count: 2000 }, { name: '爱奇艺会员', count: 1000 }] },
    ],
  },
  {
    name: 'DOU增长率',
    currentValue: '3.2%',
    improvement: '-0.8%',
    activityCount: 4,
    totalOrders: 28000,
    trendData: [
      { month: '8月', value: 4.0 },
      { month: '9月', value: 3.8 },
      { month: '10月', value: 3.6 },
      { month: '11月', value: 3.4 },
      { month: '12月', value: 3.3 },
      { month: '1月', value: 3.2 },
    ],
    activities: [
      { id: 'b6', name: '视频APP定向流量包', orderCount: 10000, date: '2025-01', status: '进行中', products: [{ name: '抖音定向包', count: 4000 }, { name: '快手定向包', count: 3500 }, { name: 'B站定向包', count: 2500 }] },
      { id: 'b7', name: '短视频流量活动', orderCount: 8000, date: '2025-01', status: '进行中', products: [{ name: '周末短视频流量包', count: 5000 }, { name: '夜间短视频流量包', count: 3000 }] },
      { id: 'b8', name: '', orderCount: 6000, date: '', status: '已完成', products: [{ name: '王者荣耀流量包', count: 4000 }, { name: '和平精英流量包', count: 2000 }] },
      { id: 'b9', name: '音乐流量包推广', orderCount: 4000, date: '2024-12', status: '已完成', products: [{ name: '网易云音乐流量包', count: 2500 }, { name: 'QQ音乐流量包', count: 1500 }] },
    ],
  },
  {
    name: '5G渗透率',
    currentValue: '34.5%',
    improvement: '-0.5%',
    activityCount: 6,
    totalOrders: 45000,
    trendData: [
      { month: '8月', value: 35.0 },
      { month: '9月', value: 34.8 },
      { month: '10月', value: 34.7 },
      { month: '11月', value: 34.6 },
      { month: '12月', value: 34.5 },
      { month: '1月', value: 34.5 },
    ],
    activities: [
      { id: 'b10', name: '5G终端补贴活动', orderCount: 15000, date: '2025-01', status: '进行中', products: [{ name: '5G手机补贴', count: 10000 }, { name: '5G模组补贴', count: 5000 }] },
      { id: 'b11', name: '', orderCount: 10000, date: '', status: '进行中', products: [{ name: '5G体验卡', count: 7000 }, { name: '5G试用流量', count: 3000 }] },
      { id: 'b12', name: '5G企业专线推广', orderCount: 8000, date: '2024-12', status: '已完成', products: [{ name: '5G企业专线', count: 5000 }, { name: '5G专网', count: 3000 }] },
      { id: 'b13', name: '', orderCount: 7000, date: '', status: '已完成', products: [{ name: '5G云桌面', count: 4500 }, { name: '5G云主机', count: 2500 }] },
      { id: 'b14', name: '5G智能家居套餐', orderCount: 3000, date: '2024-11', status: '已完成', products: [{ name: '5G智能家居入门版', count: 2000 }, { name: '5G智能家居高级版', count: 1000 }] },
      { id: 'b15', name: '5G视频彩铃推广', orderCount: 2000, date: '2024-11', status: '已完成', products: [{ name: '5G视频彩铃月包', count: 1500 }, { name: '5G视频彩铃季包', count: 500 }] },
    ],
  },
  {
    name: '云业务渗透率',
    currentValue: '8.9%',
    improvement: '-0.3%',
    activityCount: 3,
    totalOrders: 20000,
    trendData: [
      { month: '8月', value: 9.2 },
      { month: '9月', value: 9.1 },
      { month: '10月', value: 9.1 },
      { month: '11月', value: 9.0 },
      { month: '12月', value: 9.0 },
      { month: '1月', value: 8.9 },
    ],
    activities: [
      { id: 'b16', name: '企业云盘推广', orderCount: 8000, date: '2025-01', status: '进行中', products: [{ name: '企业云盘100G', count: 5000 }, { name: '企业云盘500G', count: 3000 }] },
      { id: 'b17', name: '', orderCount: 7000, date: '', status: '已完成', products: [{ name: '云会议', count: 4000 }, { name: '云文档', count: 3000 }] },
      { id: 'b18', name: '云存储服务推广', orderCount: 5000, date: '2024-12', status: '已完成', products: [{ name: '对象存储', count: 3000 }, { name: '文件存储', count: 2000 }] },
    ],
  },
  {
    name: '增值业务渗透率',
    currentValue: '12.4%',
    improvement: '-0.1%',
    activityCount: 4,
    totalOrders: 18000,
    trendData: [
      { month: '8月', value: 12.5 },
      { month: '9月', value: 12.5 },
      { month: '10月', value: 12.4 },
      { month: '11月', value: 12.4 },
      { month: '12月', value: 12.4 },
      { month: '1月', value: 12.4 },
    ],
    activities: [
      { id: 'b19', name: '彩铃包月推广', orderCount: 6000, date: '2025-01', status: '进行中', products: [{ name: '彩铃5元包', count: 4000 }, { name: '彩铃10元包', count: 2000 }] },
      { id: 'b20', name: '', orderCount: 5000, date: '2024-12', status: '已完成', products: [{ name: '来电显示月包', count: 3500 }, { name: '来电显示年包', count: 1500 }] },
      { id: 'b21', name: '', orderCount: 4000, date: '2024-12', status: '已完成', products: [{ name: '漏话提醒3元包', count: 3000 }, { name: '漏话提醒5元包', count: 1000 }] },
      { id: 'b22', name: '呼叫转移推广', orderCount: 3000, date: '2024-11', status: '已完成', products: [{ name: '呼叫转移月包', count: 3000 }] },
    ],
  },
];

// 各指标在16地市分公司的详细数据
const metricProvincesData: Record<string, {
  province: string; improvement: string; improvementValue: number; currentValue: number; activityCount: number; totalOrders: number;
}[]> = {
  '5G套包升档率': [
    { province: '乌鲁木齐', improvement: '+2.0%', improvementValue: 2.0, currentValue: 43.2, activityCount: 5, totalOrders: 5063 },
    { province: '克拉玛依', improvement: '+1.9%', improvementValue: 1.9, currentValue: 43.4, activityCount: 5, totalOrders: 4728 },
    { province: '吐鲁番', improvement: '+1.8%', improvementValue: 1.8, currentValue: 43.5, activityCount: 5, totalOrders: 4506 },
    { province: '哈密', improvement: '+1.7%', improvementValue: 1.7, currentValue: 43.6, activityCount: 5, totalOrders: 4489 },
    { province: '昌吉', improvement: '+1.6%', improvementValue: 1.6, currentValue: 43.8, activityCount: 5, totalOrders: 4170 },
    { province: '博州', improvement: '+2.0%', improvementValue: 2.0, currentValue: 44.0, activityCount: 4, totalOrders: 3962 },
    { province: '巴州', improvement: '+1.9%', improvementValue: 1.9, currentValue: 44.1, activityCount: 4, totalOrders: 3757 },
    { province: '阿克苏', improvement: '+1.8%', improvementValue: 1.8, currentValue: 44.2, activityCount: 4, totalOrders: 3535 },
    { province: '克州', improvement: '+1.7%', improvementValue: 1.7, currentValue: 44.4, activityCount: 4, totalOrders: 3488 },
    { province: '喀什', improvement: '+1.6%', improvementValue: 1.6, currentValue: 44.5, activityCount: 4, totalOrders: 3126 },
    { province: '和田', improvement: '+2.0%', improvementValue: 2.0, currentValue: 44.7, activityCount: 3, totalOrders: 3073 },
    { province: '伊犁', improvement: '+1.9%', improvementValue: 1.9, currentValue: 44.9, activityCount: 3, totalOrders: 2889 },
    { province: '塔城', improvement: '+1.8%', improvementValue: 1.8, currentValue: 45.0, activityCount: 3, totalOrders: 2639 },
    { province: '阿勒泰', improvement: '+1.7%', improvementValue: 1.7, currentValue: 45.1, activityCount: 3, totalOrders: 2322 },
    { province: '石河子', improvement: '+1.6%', improvementValue: 1.6, currentValue: 45.3, activityCount: 3, totalOrders: 2251 },
    { province: '阿克苏', improvement: '+2.0%', improvementValue: 2.0, currentValue: 45.5, activityCount: 2, totalOrders: 2008 },
    { province: '阿克苏', improvement: '+1.9%', improvementValue: 1.9, currentValue: 45.6, activityCount: 2, totalOrders: 1708 },
    { province: '昌吉', improvement: '+1.8%', improvementValue: 1.8, currentValue: 45.8, activityCount: 2, totalOrders: 1507 },
    { province: '阿勒泰', improvement: '+1.7%', improvementValue: 1.7, currentValue: 45.9, activityCount: 2, totalOrders: 1323 },
    { province: '巴州', improvement: '+1.6%', improvementValue: 1.6, currentValue: 46.0, activityCount: 2, totalOrders: 1155 },
    { province: '博州', improvement: '+2.0%', improvementValue: 2.0, currentValue: 46.2, activityCount: 1, totalOrders: 959 },
    { province: '伊犁', improvement: '+1.9%', improvementValue: 1.9, currentValue: 46.4, activityCount: 1, totalOrders: 829 },
    { province: '和田', improvement: '+1.8%', improvementValue: 1.8, currentValue: 46.5, activityCount: 1, totalOrders: 654 },
    { province: '奎屯', improvement: '+1.7%', improvementValue: 1.7, currentValue: 46.6, activityCount: 1, totalOrders: 306 },
  ],
  '家庭宽带续费率': [
    { province: '乌鲁木齐', improvement: '+1.4%', improvementValue: 1.4, currentValue: 76.2, activityCount: 5, totalOrders: 6043 },
    { province: '克拉玛依', improvement: '+1.4%', improvementValue: 1.4, currentValue: 76.3, activityCount: 5, totalOrders: 5750 },
    { province: '吐鲁番', improvement: '+1.2%', improvementValue: 1.2, currentValue: 76.5, activityCount: 5, totalOrders: 5683 },
    { province: '哈密', improvement: '+1.1%', improvementValue: 1.1, currentValue: 76.7, activityCount: 5, totalOrders: 5466 },
    { province: '昌吉', improvement: '+1.1%', improvementValue: 1.1, currentValue: 76.8, activityCount: 5, totalOrders: 5279 },
    { province: '博州', improvement: '+1.4%', improvementValue: 1.4, currentValue: 77.0, activityCount: 4, totalOrders: 5039 },
    { province: '巴州', improvement: '+1.3%', improvementValue: 1.3, currentValue: 77.1, activityCount: 4, totalOrders: 4807 },
    { province: '阿克苏', improvement: '+1.2%', improvementValue: 1.2, currentValue: 77.2, activityCount: 4, totalOrders: 4556 },
    { province: '克州', improvement: '+1.1%', improvementValue: 1.1, currentValue: 77.4, activityCount: 4, totalOrders: 4414 },
    { province: '喀什', improvement: '+1.0%', improvementValue: 1.0, currentValue: 77.5, activityCount: 4, totalOrders: 4250 },
    { province: '和田', improvement: '+1.4%', improvementValue: 1.4, currentValue: 77.7, activityCount: 3, totalOrders: 3971 },
    { province: '伊犁', improvement: '+1.3%', improvementValue: 1.3, currentValue: 77.8, activityCount: 3, totalOrders: 3701 },
    { province: '塔城', improvement: '+1.2%', improvementValue: 1.2, currentValue: 78.0, activityCount: 3, totalOrders: 3694 },
    { province: '阿勒泰', improvement: '+1.1%', improvementValue: 1.1, currentValue: 78.2, activityCount: 3, totalOrders: 3340 },
    { province: '石河子', improvement: '+1.0%', improvementValue: 1.0, currentValue: 78.3, activityCount: 3, totalOrders: 3278 },
    { province: '阿克苏', improvement: '+1.4%', improvementValue: 1.4, currentValue: 78.5, activityCount: 2, totalOrders: 3008 },
    { province: '阿克苏', improvement: '+1.3%', improvementValue: 1.3, currentValue: 78.6, activityCount: 2, totalOrders: 2787 },
    { province: '昌吉', improvement: '+1.2%', improvementValue: 1.2, currentValue: 78.8, activityCount: 2, totalOrders: 2571 },
    { province: '阿勒泰', improvement: '+1.1%', improvementValue: 1.1, currentValue: 78.9, activityCount: 2, totalOrders: 2339 },
    { province: '巴州', improvement: '+1.0%', improvementValue: 1.0, currentValue: 79.0, activityCount: 2, totalOrders: 2155 },
    { province: '博州', improvement: '+1.5%', improvementValue: 1.5, currentValue: 79.2, activityCount: 1, totalOrders: 2095 },
    { province: '伊犁', improvement: '+1.4%', improvementValue: 1.4, currentValue: 79.3, activityCount: 1, totalOrders: 1786 },
    { province: '和田', improvement: '+1.2%', improvementValue: 1.2, currentValue: 79.5, activityCount: 1, totalOrders: 1526 },
    { province: '奎屯', improvement: '+1.1%', improvementValue: 1.1, currentValue: 79.7, activityCount: 1, totalOrders: 1323 },
  ],
  'ARPU规模': [
    { province: '乌鲁木齐', improvement: '+1.7%', improvementValue: 1.7, currentValue: 50.2, activityCount: 5, totalOrders: 6997 },
    { province: '克拉玛依', improvement: '+1.6%', improvementValue: 1.6, currentValue: 50.4, activityCount: 5, totalOrders: 6724 },
    { province: '吐鲁番', improvement: '+1.5%', improvementValue: 1.5, currentValue: 50.5, activityCount: 5, totalOrders: 6591 },
    { province: '哈密', improvement: '+1.4%', improvementValue: 1.4, currentValue: 50.6, activityCount: 5, totalOrders: 6388 },
    { province: '昌吉', improvement: '+1.8%', improvementValue: 1.8, currentValue: 50.8, activityCount: 5, totalOrders: 6254 },
    { province: '博州', improvement: '+1.7%', improvementValue: 1.7, currentValue: 51.0, activityCount: 4, totalOrders: 5967 },
    { province: '巴州', improvement: '+1.6%', improvementValue: 1.6, currentValue: 51.1, activityCount: 4, totalOrders: 5711 },
    { province: '阿克苏', improvement: '+1.5%', improvementValue: 1.5, currentValue: 51.2, activityCount: 4, totalOrders: 5686 },
    { province: '克州', improvement: '+1.4%', improvementValue: 1.4, currentValue: 51.4, activityCount: 4, totalOrders: 5417 },
    { province: '喀什', improvement: '+1.8%', improvementValue: 1.8, currentValue: 51.5, activityCount: 4, totalOrders: 5237 },
    { province: '和田', improvement: '+1.7%', improvementValue: 1.7, currentValue: 51.7, activityCount: 3, totalOrders: 4931 },
    { province: '伊犁', improvement: '+1.6%', improvementValue: 1.6, currentValue: 51.9, activityCount: 3, totalOrders: 4796 },
    { province: '塔城', improvement: '+1.5%', improvementValue: 1.5, currentValue: 52.0, activityCount: 3, totalOrders: 4520 },
    { province: '阿勒泰', improvement: '+1.4%', improvementValue: 1.4, currentValue: 52.1, activityCount: 3, totalOrders: 4441 },
    { province: '石河子', improvement: '+1.8%', improvementValue: 1.8, currentValue: 52.3, activityCount: 3, totalOrders: 4175 },
    { province: '阿克苏', improvement: '+1.7%', improvementValue: 1.7, currentValue: 52.5, activityCount: 2, totalOrders: 4060 },
    { province: '阿克苏', improvement: '+1.6%', improvementValue: 1.6, currentValue: 52.6, activityCount: 2, totalOrders: 3858 },
    { province: '昌吉', improvement: '+1.5%', improvementValue: 1.5, currentValue: 52.8, activityCount: 2, totalOrders: 3592 },
    { province: '阿勒泰', improvement: '+1.4%', improvementValue: 1.4, currentValue: 52.9, activityCount: 2, totalOrders: 3447 },
    { province: '巴州', improvement: '+1.8%', improvementValue: 1.8, currentValue: 53.0, activityCount: 2, totalOrders: 3149 },
    { province: '博州', improvement: '+1.7%', improvementValue: 1.7, currentValue: 53.2, activityCount: 1, totalOrders: 3080 },
    { province: '伊犁', improvement: '+1.6%', improvementValue: 1.6, currentValue: 53.4, activityCount: 1, totalOrders: 2717 },
    { province: '和田', improvement: '+1.5%', improvementValue: 1.5, currentValue: 53.5, activityCount: 1, totalOrders: 2511 },
    { province: '奎屯', improvement: '+1.4%', improvementValue: 1.4, currentValue: 53.6, activityCount: 1, totalOrders: 2469 },
  ],
  '流量包渗透率': [
    { province: '乌鲁木齐', improvement: '+0.7%', improvementValue: 0.7, currentValue: 61.2, activityCount: 5, totalOrders: 4958 },
    { province: '克拉玛依', improvement: '+0.6%', improvementValue: 0.6, currentValue: 61.4, activityCount: 5, totalOrders: 4897 },
    { province: '吐鲁番', improvement: '+0.5%', improvementValue: 0.5, currentValue: 61.5, activityCount: 5, totalOrders: 4574 },
    { province: '哈密', improvement: '+0.3%', improvementValue: 0.3, currentValue: 61.6, activityCount: 5, totalOrders: 4320 },
    { province: '昌吉', improvement: '+0.8%', improvementValue: 0.8, currentValue: 61.8, activityCount: 5, totalOrders: 4159 },
    { province: '博州', improvement: '+0.7%', improvementValue: 0.7, currentValue: 62.0, activityCount: 4, totalOrders: 3925 },
    { province: '巴州', improvement: '+0.5%', improvementValue: 0.5, currentValue: 62.1, activityCount: 4, totalOrders: 3797 },
    { province: '阿克苏', improvement: '+0.4%', improvementValue: 0.4, currentValue: 62.2, activityCount: 4, totalOrders: 3571 },
    { province: '克州', improvement: '+0.3%', improvementValue: 0.3, currentValue: 62.4, activityCount: 4, totalOrders: 3416 },
    { province: '喀什', improvement: '+0.8%', improvementValue: 0.8, currentValue: 62.5, activityCount: 4, totalOrders: 3262 },
    { province: '和田', improvement: '+0.7%', improvementValue: 0.7, currentValue: 62.7, activityCount: 3, totalOrders: 2993 },
    { province: '伊犁', improvement: '+0.6%', improvementValue: 0.6, currentValue: 62.9, activityCount: 3, totalOrders: 2741 },
    { province: '塔城', improvement: '+0.4%', improvementValue: 0.4, currentValue: 63.0, activityCount: 3, totalOrders: 2594 },
    { province: '阿勒泰', improvement: '+0.3%', improvementValue: 0.3, currentValue: 63.1, activityCount: 3, totalOrders: 2390 },
    { province: '石河子', improvement: '+0.7%', improvementValue: 0.7, currentValue: 63.3, activityCount: 3, totalOrders: 2153 },
    { province: '阿克苏', improvement: '+0.7%', improvementValue: 0.7, currentValue: 63.5, activityCount: 2, totalOrders: 2071 },
    { province: '阿克苏', improvement: '+0.6%', improvementValue: 0.6, currentValue: 63.6, activityCount: 2, totalOrders: 1768 },
    { province: '昌吉', improvement: '+0.4%', improvementValue: 0.4, currentValue: 63.8, activityCount: 2, totalOrders: 1679 },
    { province: '阿勒泰', improvement: '+0.3%', improvementValue: 0.3, currentValue: 63.9, activityCount: 2, totalOrders: 1474 },
    { province: '巴州', improvement: '+0.7%', improvementValue: 0.7, currentValue: 64.0, activityCount: 2, totalOrders: 1265 },
    { province: '博州', improvement: '+0.7%', improvementValue: 0.7, currentValue: 64.2, activityCount: 1, totalOrders: 918 },
    { province: '伊犁', improvement: '+0.6%', improvementValue: 0.6, currentValue: 64.3, activityCount: 1, totalOrders: 855 },
    { province: '和田', improvement: '+0.4%', improvementValue: 0.4, currentValue: 64.5, activityCount: 1, totalOrders: 662 },
    { province: '奎屯', improvement: '+0.3%', improvementValue: 0.3, currentValue: 64.7, activityCount: 1, totalOrders: 343 },
  ],
  '全球通保有率': [
    { province: '乌鲁木齐', improvement: '+0.0%', improvementValue: 0.0, currentValue: 93.2, activityCount: 5, totalOrders: 3036 },
    { province: '克拉玛依', improvement: '-0.1%', improvementValue: -0.1, currentValue: 93.3, activityCount: 5, totalOrders: 2886 },
    { province: '吐鲁番', improvement: '-0.2%', improvementValue: -0.2, currentValue: 93.5, activityCount: 5, totalOrders: 2562 },
    { province: '哈密', improvement: '+0.2%', improvementValue: 0.2, currentValue: 93.7, activityCount: 5, totalOrders: 2341 },
    { province: '昌吉', improvement: '+0.1%', improvementValue: 0.1, currentValue: 93.8, activityCount: 5, totalOrders: 2218 },
    { province: '博州', improvement: '+0.1%', improvementValue: 0.1, currentValue: 94.0, activityCount: 4, totalOrders: 1997 },
    { province: '巴州', improvement: '-0.1%', improvementValue: -0.1, currentValue: 94.1, activityCount: 4, totalOrders: 1769 },
    { province: '阿克苏', improvement: '-0.2%', improvementValue: -0.2, currentValue: 94.2, activityCount: 4, totalOrders: 1663 },
    { province: '克州', improvement: '+0.2%', improvementValue: 0.2, currentValue: 94.4, activityCount: 4, totalOrders: 1476 },
    { province: '喀什', improvement: '+0.1%', improvementValue: 0.1, currentValue: 94.5, activityCount: 4, totalOrders: 1242 },
    { province: '和田', improvement: '+0.1%', improvementValue: 0.1, currentValue: 94.7, activityCount: 3, totalOrders: 956 },
    { province: '伊犁', improvement: '-0.1%', improvementValue: -0.1, currentValue: 94.8, activityCount: 3, totalOrders: 875 },
    { province: '塔城', improvement: '-0.2%', improvementValue: -0.2, currentValue: 95.0, activityCount: 3, totalOrders: 583 },
    { province: '阿勒泰', improvement: '+0.2%', improvementValue: 0.2, currentValue: 95.2, activityCount: 3, totalOrders: 496 },
    { province: '石河子', improvement: '+0.1%', improvementValue: 0.1, currentValue: 95.3, activityCount: 3, totalOrders: 298 },
    { province: '阿克苏', improvement: '+0.1%', improvementValue: 0.1, currentValue: 95.5, activityCount: 2, totalOrders: -86 },
    { province: '阿克苏', improvement: '-0.1%', improvementValue: -0.1, currentValue: 95.6, activityCount: 2, totalOrders: -242 },
    { province: '昌吉', improvement: '-0.2%', improvementValue: -0.2, currentValue: 95.8, activityCount: 2, totalOrders: -492 },
    { province: '阿勒泰', improvement: '+0.2%', improvementValue: 0.2, currentValue: 95.9, activityCount: 2, totalOrders: -620 },
    { province: '巴州', improvement: '+0.1%', improvementValue: 0.1, currentValue: 96.0, activityCount: 2, totalOrders: -798 },
    { province: '博州', improvement: '+0.0%', improvementValue: 0.0, currentValue: 96.2, activityCount: 1, totalOrders: -1032 },
    { province: '伊犁', improvement: '-0.1%', improvementValue: -0.1, currentValue: 96.3, activityCount: 1, totalOrders: -1284 },
    { province: '和田', improvement: '-0.2%', improvementValue: -0.2, currentValue: 96.5, activityCount: 1, totalOrders: -1446 },
    { province: '奎屯', improvement: '+0.2%', improvementValue: 0.2, currentValue: 96.7, activityCount: 1, totalOrders: -1555 },
  ],
  'ARPU值提升': [
    { province: '乌鲁木齐', improvement: '+1.8%', improvementValue: 1.8, currentValue: 40.2, activityCount: 5, totalOrders: 8083 },
    { province: '克拉玛依', improvement: '+1.9%', improvementValue: 1.9, currentValue: 40.4, activityCount: 5, totalOrders: 7780 },
    { province: '吐鲁番', improvement: '+1.9%', improvementValue: 1.9, currentValue: 40.5, activityCount: 5, totalOrders: 7554 },
    { province: '哈密', improvement: '+1.6%', improvementValue: 1.6, currentValue: 40.6, activityCount: 5, totalOrders: 7467 },
    { province: '昌吉', improvement: '+1.6%', improvementValue: 1.6, currentValue: 40.8, activityCount: 5, totalOrders: 7227 },
    { province: '博州', improvement: '+1.8%', improvementValue: 1.8, currentValue: 41.0, activityCount: 4, totalOrders: 7001 },
    { province: '巴州', improvement: '+1.9%', improvementValue: 1.9, currentValue: 41.1, activityCount: 4, totalOrders: 6864 },
    { province: '阿克苏', improvement: '+2.0%', improvementValue: 2.0, currentValue: 41.2, activityCount: 4, totalOrders: 6617 },
    { province: '克州', improvement: '+1.6%', improvementValue: 1.6, currentValue: 41.4, activityCount: 4, totalOrders: 6336 },
    { province: '喀什', improvement: '+1.6%', improvementValue: 1.6, currentValue: 41.5, activityCount: 4, totalOrders: 6167 },
    { province: '和田', improvement: '+1.8%', improvementValue: 1.8, currentValue: 41.7, activityCount: 3, totalOrders: 5935 },
    { province: '伊犁', improvement: '+1.9%', improvementValue: 1.9, currentValue: 41.9, activityCount: 3, totalOrders: 5763 },
    { province: '塔城', improvement: '+2.0%', improvementValue: 2.0, currentValue: 42.0, activityCount: 3, totalOrders: 5690 },
    { province: '阿勒泰', improvement: '+1.6%', improvementValue: 1.6, currentValue: 42.1, activityCount: 3, totalOrders: 5443 },
    { province: '石河子', improvement: '+1.7%', improvementValue: 1.7, currentValue: 42.3, activityCount: 3, totalOrders: 5237 },
    { province: '阿克苏', improvement: '+1.8%', improvementValue: 1.8, currentValue: 42.5, activityCount: 2, totalOrders: 4967 },
    { province: '阿克苏', improvement: '+1.9%', improvementValue: 1.9, currentValue: 42.6, activityCount: 2, totalOrders: 4891 },
    { province: '昌吉', improvement: '+2.0%', improvementValue: 2.0, currentValue: 42.8, activityCount: 2, totalOrders: 4649 },
    { province: '阿勒泰', improvement: '+1.5%', improvementValue: 1.5, currentValue: 42.9, activityCount: 2, totalOrders: 4409 },
    { province: '巴州', improvement: '+1.7%', improvementValue: 1.7, currentValue: 43.0, activityCount: 2, totalOrders: 4249 },
    { province: '博州', improvement: '+1.8%', improvementValue: 1.8, currentValue: 43.2, activityCount: 1, totalOrders: 4002 },
    { province: '伊犁', improvement: '+1.9%', improvementValue: 1.9, currentValue: 43.4, activityCount: 1, totalOrders: 3792 },
    { province: '和田', improvement: '+2.0%', improvementValue: 2.0, currentValue: 43.5, activityCount: 1, totalOrders: 3556 },
    { province: '奎屯', improvement: '+1.6%', improvementValue: 1.6, currentValue: 43.6, activityCount: 1, totalOrders: 3335 },
  ],
  'DOU增长率': [
    { province: '乌鲁木齐', improvement: '+1.2%', improvementValue: 1.2, currentValue: 1.2, activityCount: 5, totalOrders: 7030 },
    { province: '克拉玛依', improvement: '+1.3%', improvementValue: 1.3, currentValue: 1.4, activityCount: 5, totalOrders: 6826 },
    { province: '吐鲁番', improvement: '+0.9%', improvementValue: 0.9, currentValue: 1.5, activityCount: 5, totalOrders: 6523 },
    { province: '哈密', improvement: '+1.0%', improvementValue: 1.0, currentValue: 1.7, activityCount: 5, totalOrders: 6493 },
    { province: '昌吉', improvement: '+1.1%', improvementValue: 1.1, currentValue: 1.8, activityCount: 5, totalOrders: 6112 },
    { province: '博州', improvement: '+1.2%', improvementValue: 1.2, currentValue: 1.9, activityCount: 4, totalOrders: 5928 },
    { province: '巴州', improvement: '+1.3%', improvementValue: 1.3, currentValue: 2.1, activityCount: 4, totalOrders: 5739 },
    { province: '阿克苏', improvement: '+0.9%', improvementValue: 0.9, currentValue: 2.2, activityCount: 4, totalOrders: 5660 },
    { province: '克州', improvement: '+1.0%', improvementValue: 1.0, currentValue: 2.4, activityCount: 4, totalOrders: 5340 },
    { province: '喀什', improvement: '+1.1%', improvementValue: 1.1, currentValue: 2.5, activityCount: 4, totalOrders: 5274 },
    { province: '和田', improvement: '+1.2%', improvementValue: 1.2, currentValue: 2.7, activityCount: 3, totalOrders: 5008 },
    { province: '伊犁', improvement: '+1.3%', improvementValue: 1.3, currentValue: 2.9, activityCount: 3, totalOrders: 4852 },
    { province: '塔城', improvement: '+0.9%', improvementValue: 0.9, currentValue: 3.0, activityCount: 3, totalOrders: 4516 },
    { province: '阿勒泰', improvement: '+1.0%', improvementValue: 1.0, currentValue: 3.1, activityCount: 3, totalOrders: 4398 },
    { province: '石河子', improvement: '+1.1%', improvementValue: 1.1, currentValue: 3.3, activityCount: 3, totalOrders: 4197 },
    { province: '阿克苏', improvement: '+1.2%', improvementValue: 1.2, currentValue: 3.5, activityCount: 2, totalOrders: 4052 },
    { province: '阿克苏', improvement: '+1.3%', improvementValue: 1.3, currentValue: 3.6, activityCount: 2, totalOrders: 3819 },
    { province: '昌吉', improvement: '+0.9%', improvementValue: 0.9, currentValue: 3.8, activityCount: 2, totalOrders: 3635 },
    { province: '阿勒泰', improvement: '+1.0%', improvementValue: 1.0, currentValue: 3.9, activityCount: 2, totalOrders: 3364 },
    { province: '巴州', improvement: '+1.1%', improvementValue: 1.1, currentValue: 4.0, activityCount: 2, totalOrders: 3241 },
    { province: '博州', improvement: '+1.2%', improvementValue: 1.2, currentValue: 4.2, activityCount: 1, totalOrders: 2902 },
    { province: '伊犁', improvement: '+1.3%', improvementValue: 1.3, currentValue: 4.3, activityCount: 1, totalOrders: 2874 },
    { province: '和田', improvement: '+0.9%', improvementValue: 0.9, currentValue: 4.5, activityCount: 1, totalOrders: 2684 },
    { province: '奎屯', improvement: '+1.0%', improvementValue: 1.0, currentValue: 4.7, activityCount: 1, totalOrders: 2329 },
  ],
  '5G渗透率': [
    { province: '乌鲁木齐', improvement: '+2.1%', improvementValue: 2.1, currentValue: 53.2, activityCount: 5, totalOrders: 8074 },
    { province: '克拉玛依', improvement: '+2.0%', improvementValue: 2.0, currentValue: 53.4, activityCount: 5, totalOrders: 7837 },
    { province: '吐鲁番', improvement: '+2.5%', improvementValue: 2.5, currentValue: 53.5, activityCount: 5, totalOrders: 7692 },
    { province: '哈密', improvement: '+2.3%', improvementValue: 2.3, currentValue: 53.6, activityCount: 5, totalOrders: 7368 },
    { province: '昌吉', improvement: '+2.2%', improvementValue: 2.2, currentValue: 53.8, activityCount: 5, totalOrders: 7296 },
    { province: '博州', improvement: '+2.1%', improvementValue: 2.1, currentValue: 54.0, activityCount: 4, totalOrders: 7064 },
    { province: '巴州', improvement: '+2.0%', improvementValue: 2.0, currentValue: 54.1, activityCount: 4, totalOrders: 6787 },
    { province: '阿克苏', improvement: '+2.5%', improvementValue: 2.5, currentValue: 54.2, activityCount: 4, totalOrders: 6528 },
    { province: '克州', improvement: '+2.3%', improvementValue: 2.3, currentValue: 54.4, activityCount: 4, totalOrders: 6375 },
    { province: '喀什', improvement: '+2.2%', improvementValue: 2.2, currentValue: 54.5, activityCount: 4, totalOrders: 6211 },
    { province: '和田', improvement: '+2.1%', improvementValue: 2.1, currentValue: 54.7, activityCount: 3, totalOrders: 5940 },
    { province: '伊犁', improvement: '+2.0%', improvementValue: 2.0, currentValue: 54.9, activityCount: 3, totalOrders: 5816 },
    { province: '塔城', improvement: '+2.4%', improvementValue: 2.4, currentValue: 55.0, activityCount: 3, totalOrders: 5500 },
    { province: '阿勒泰', improvement: '+2.3%', improvementValue: 2.3, currentValue: 55.1, activityCount: 3, totalOrders: 5484 },
    { province: '石河子', improvement: '+2.2%', improvementValue: 2.2, currentValue: 55.3, activityCount: 3, totalOrders: 5284 },
    { province: '阿克苏', improvement: '+2.1%', improvementValue: 2.1, currentValue: 55.5, activityCount: 2, totalOrders: 4967 },
    { province: '阿克苏', improvement: '+2.0%', improvementValue: 2.0, currentValue: 55.6, activityCount: 2, totalOrders: 4828 },
    { province: '昌吉', improvement: '+2.4%', improvementValue: 2.4, currentValue: 55.8, activityCount: 2, totalOrders: 4695 },
    { province: '阿勒泰', improvement: '+2.4%', improvementValue: 2.4, currentValue: 55.9, activityCount: 2, totalOrders: 4345 },
    { province: '巴州', improvement: '+2.2%', improvementValue: 2.2, currentValue: 56.0, activityCount: 2, totalOrders: 4229 },
    { province: '博州', improvement: '+2.1%', improvementValue: 2.1, currentValue: 56.2, activityCount: 1, totalOrders: 3927 },
    { province: '伊犁', improvement: '+2.0%', improvementValue: 2.0, currentValue: 56.4, activityCount: 1, totalOrders: 3860 },
    { province: '和田', improvement: '+2.4%', improvementValue: 2.4, currentValue: 56.5, activityCount: 1, totalOrders: 3576 },
    { province: '奎屯', improvement: '+2.3%', improvementValue: 2.3, currentValue: 56.6, activityCount: 1, totalOrders: 3463 },
  ],
  '云业务渗透率': [
    { province: '乌鲁木齐', improvement: '+0.8%', improvementValue: 0.8, currentValue: 33.2, activityCount: 5, totalOrders: 4029 },
    { province: '克拉玛依', improvement: '+1.2%', improvementValue: 1.2, currentValue: 33.4, activityCount: 5, totalOrders: 3855 },
    { province: '吐鲁番', improvement: '+1.1%', improvementValue: 1.1, currentValue: 33.5, activityCount: 5, totalOrders: 3550 },
    { province: '哈密', improvement: '+1.0%', improvementValue: 1.0, currentValue: 33.6, activityCount: 5, totalOrders: 3339 },
    { province: '昌吉', improvement: '+0.9%', improvementValue: 0.9, currentValue: 33.8, activityCount: 5, totalOrders: 3195 },
    { province: '博州', improvement: '+0.8%', improvementValue: 0.8, currentValue: 34.0, activityCount: 4, totalOrders: 3095 },
    { province: '巴州', improvement: '+1.2%', improvementValue: 1.2, currentValue: 34.1, activityCount: 4, totalOrders: 2741 },
    { province: '阿克苏', improvement: '+1.1%', improvementValue: 1.1, currentValue: 34.2, activityCount: 4, totalOrders: 2638 },
    { province: '克州', improvement: '+1.0%', improvementValue: 1.0, currentValue: 34.4, activityCount: 4, totalOrders: 2499 },
    { province: '喀什', improvement: '+0.9%', improvementValue: 0.9, currentValue: 34.5, activityCount: 4, totalOrders: 2235 },
    { province: '和田', improvement: '+0.8%', improvementValue: 0.8, currentValue: 34.7, activityCount: 3, totalOrders: 1900 },
    { province: '伊犁', improvement: '+1.2%', improvementValue: 1.2, currentValue: 34.9, activityCount: 3, totalOrders: 1853 },
    { province: '塔城', improvement: '+1.1%', improvementValue: 1.1, currentValue: 35.0, activityCount: 3, totalOrders: 1582 },
    { province: '阿勒泰', improvement: '+1.0%', improvementValue: 1.0, currentValue: 35.1, activityCount: 3, totalOrders: 1425 },
    { province: '石河子', improvement: '+0.9%', improvementValue: 0.9, currentValue: 35.3, activityCount: 3, totalOrders: 1104 },
    { province: '阿克苏', improvement: '+0.8%', improvementValue: 0.8, currentValue: 35.5, activityCount: 2, totalOrders: 928 },
    { province: '阿克苏', improvement: '+1.2%', improvementValue: 1.2, currentValue: 35.6, activityCount: 2, totalOrders: 792 },
    { province: '昌吉', improvement: '+1.1%', improvementValue: 1.1, currentValue: 35.8, activityCount: 2, totalOrders: 578 },
    { province: '阿勒泰', improvement: '+1.0%', improvementValue: 1.0, currentValue: 35.9, activityCount: 2, totalOrders: 361 },
    { province: '巴州', improvement: '+0.9%', improvementValue: 0.9, currentValue: 36.0, activityCount: 2, totalOrders: 114 },
    { province: '博州', improvement: '+0.8%', improvementValue: 0.8, currentValue: 36.2, activityCount: 1, totalOrders: -39 },
    { province: '伊犁', improvement: '+1.2%', improvementValue: 1.2, currentValue: 36.4, activityCount: 1, totalOrders: -155 },
    { province: '和田', improvement: '+1.1%', improvementValue: 1.1, currentValue: 36.5, activityCount: 1, totalOrders: -480 },
    { province: '奎屯', improvement: '+1.0%', improvementValue: 1.0, currentValue: 36.6, activityCount: 1, totalOrders: -679 },
  ],
  '增值业务渗透率': [
    { province: '乌鲁木齐', improvement: '+0.4%', improvementValue: 0.4, currentValue: 46.2, activityCount: 5, totalOrders: 5587 },
    { province: '克拉玛依', improvement: '+0.8%', improvementValue: 0.8, currentValue: 46.4, activityCount: 5, totalOrders: 5324 },
    { province: '吐鲁番', improvement: '+0.7%', improvementValue: 0.7, currentValue: 46.5, activityCount: 5, totalOrders: 5017 },
    { province: '哈密', improvement: '+0.6%', improvementValue: 0.6, currentValue: 46.6, activityCount: 5, totalOrders: 4994 },
    { province: '昌吉', improvement: '+0.4%', improvementValue: 0.4, currentValue: 46.8, activityCount: 5, totalOrders: 4736 },
    { province: '博州', improvement: '+0.4%', improvementValue: 0.4, currentValue: 47.0, activityCount: 4, totalOrders: 4596 },
    { province: '巴州', improvement: '+0.8%', improvementValue: 0.8, currentValue: 47.1, activityCount: 4, totalOrders: 4232 },
    { province: '阿克苏', improvement: '+0.6%', improvementValue: 0.6, currentValue: 47.2, activityCount: 4, totalOrders: 4032 },
    { province: '克州', improvement: '+0.6%', improvementValue: 0.6, currentValue: 47.4, activityCount: 4, totalOrders: 3968 },
    { province: '喀什', improvement: '+0.4%', improvementValue: 0.4, currentValue: 47.5, activityCount: 4, totalOrders: 3721 },
    { province: '和田', improvement: '+0.4%', improvementValue: 0.4, currentValue: 47.7, activityCount: 3, totalOrders: 3540 },
    { province: '伊犁', improvement: '+0.8%', improvementValue: 0.8, currentValue: 47.9, activityCount: 3, totalOrders: 3242 },
    { province: '塔城', improvement: '+0.6%', improvementValue: 0.6, currentValue: 48.0, activityCount: 3, totalOrders: 3067 },
    { province: '阿勒泰', improvement: '+0.6%', improvementValue: 0.6, currentValue: 48.1, activityCount: 3, totalOrders: 2935 },
    { province: '石河子', improvement: '+0.4%', improvementValue: 0.4, currentValue: 48.3, activityCount: 3, totalOrders: 2755 },
    { province: '阿克苏', improvement: '+0.4%', improvementValue: 0.4, currentValue: 48.5, activityCount: 2, totalOrders: 2508 },
    { province: '阿克苏', improvement: '+0.7%', improvementValue: 0.7, currentValue: 48.6, activityCount: 2, totalOrders: 2254 },
    { province: '昌吉', improvement: '+0.6%', improvementValue: 0.6, currentValue: 48.8, activityCount: 2, totalOrders: 2138 },
    { province: '阿勒泰', improvement: '+0.6%', improvementValue: 0.6, currentValue: 48.9, activityCount: 2, totalOrders: 1993 },
    { province: '巴州', improvement: '+0.4%', improvementValue: 0.4, currentValue: 49.0, activityCount: 2, totalOrders: 1786 },
    { province: '博州', improvement: '+0.3%', improvementValue: 0.3, currentValue: 49.2, activityCount: 1, totalOrders: 1576 },
    { province: '伊犁', improvement: '+0.7%', improvementValue: 0.7, currentValue: 49.4, activityCount: 1, totalOrders: 1251 },
    { province: '和田', improvement: '+0.6%', improvementValue: 0.6, currentValue: 49.5, activityCount: 1, totalOrders: 1182 },
    { province: '奎屯', improvement: '+0.5%', improvementValue: 0.5, currentValue: 49.6, activityCount: 1, totalOrders: 879 },
  ],
};

// 分地市指标数据映射
const provinceMetricsMap: Record<string, { top5: any[]; bottom5: any[] }> = {
  '乌鲁木齐': {
    top5: [
      {
        name: '家庭宽带续费率',
        currentValue: '76.2%',
        improvement: '+2.3%',
        activityCount: 4,
        totalOrders: 11000,
        trendData: [
          { month: '8月', value: 73.8 },
          { month: '9月', value: 74.2 },
          { month: '10月', value: 74.8 },
          { month: '11月', value: 75.3 },
          { month: '12月', value: 75.8 },
          { month: '1月', value: 76.2 },
        ],
        activities: [
          { id: 'wlmq1', name: '乌鲁木齐千兆宽带提速', orderCount: 5000, date: '2025-01', status: '进行中', products: [{ name: '千兆光纤1000M', count: 3000 }, { name: 'FTTR全屋光网', count: 2000 }] },
          { id: 'wlmq2', name: '乌鲁木齐智能家居套餐', orderCount: 4000, date: '2025-01', status: '进行中', products: [{ name: '智能家居基础版', count: 2500 }, { name: '智能家居高级版', count: 1500 }] },
          { id: 'wlmq3', name: '乌鲁木齐企业专线升级', orderCount: 3000, date: '2024-12', status: '已完成', products: [{ name: '企业专线100M', count: 2000 }, { name: '企业专线500M', count: 1000 }] },
        ],
      },
      {
        name: 'ARPU规模',
        currentValue: '61.8元',
        improvement: '+1.6%',
        activityCount: 3,
        totalOrders: 7500,
        trendData: [
          { month: '8月', value: 59.8 },
          { month: '9月', value: 60.3 },
          { month: '10月', value: 60.8 },
          { month: '11月', value: 61.2 },
          { month: '12月', value: 61.5 },
          { month: '1月', value: 61.8 },
        ],
        activities: [
          { id: 'wlmq4', name: '乌鲁木齐企业云服务', orderCount: 4000, date: '2025-01', status: '进行中', products: [{ name: '云主机', count: 2000 }, { name: '云存储', count: 1200 }, { name: '云数据库', count: 800 }] },
          { id: 'wlmq5', name: '乌鲁木齐数据中心推广', orderCount: 3000, date: '2025-01', status: '进行中', products: [{ name: '机柜租赁', count: 2000 }, { name: '带宽租赁', count: 1000 }] },
          { id: 'wlmq6', name: '乌鲁木齐企业信息化', orderCount: 1000, date: '2024-12', status: '已完成', products: [{ name: '企业办公系统', count: 700 }, { name: 'ERP系统', count: 300 }] },
        ],
      },
    ],
    bottom5: [
      {
        name: 'DOU增长率',
        currentValue: '2.9%',
        improvement: '-0.8%',
        activityCount: 2,
        totalOrders: 2400,
        trendData: [
          { month: '8月', value: 3.6 },
          { month: '9月', value: 3.4 },
          { month: '10月', value: 3.2 },
          { month: '11月', value: 3.1 },
          { month: '12月', value: 3.0 },
          { month: '1月', value: 2.9 },
        ],
        activities: [
          { id: 'wlmq7', name: '乌鲁木齐视频流量包', orderCount: 1500, date: '2025-01', status: '进行中', products: [{ name: '抖音定向包', count: 700 }, { name: '快手定向包', count: 500 }, { name: 'B站定向包', count: 300 }] },
          { id: 'wlmq8', name: '乌鲁木齐游戏流量包', orderCount: 1000, date: '2024-12', status: '已完成', products: [{ name: '王者荣耀流量包', count: 600 }, { name: '和平精英流量包', count: 400 }] },
        ],
      },
    ],
  },
  '克拉玛依': {
    top5: [
      {
        name: '5G套包升档率',
        currentValue: '31.2%',
        improvement: '+2.6%',
        activityCount: 6,
        totalOrders: 24000,
        trendData: [
          { month: '8月', value: 28.5 },
          { month: '9月', value: 29.2 },
          { month: '10月', value: 29.8 },
          { month: '11月', value: 30.4 },
          { month: '12月', value: 30.8 },
          { month: '1月', value: 31.2 },
        ],
        activities: [
          { id: 'klym1', name: '克拉玛依5G优惠套餐', orderCount: 10000, date: '2025-01', status: '进行中', products: [{ name: '5G 128G套餐', count: 6000 }, { name: '5G 256G套餐', count: 4000 }] },
          { id: 'klym2', name: '克拉玛依5G终端补贴', orderCount: 8000, date: '2025-01', status: '进行中', products: [{ name: '华为Mate 60', count: 3500 }, { name: 'iPhone 15', count: 3000 }, { name: '小米14', count: 1500 }] },
          { id: 'klym3', name: '克拉玛依企业5G专网', orderCount: 7000, date: '2024-12', status: '已完成', products: [{ name: '企业5G专网基础版', count: 4500 }, { name: '企业5G专网高级版', count: 2500 }] },
        ],
      },
    ],
    bottom5: [
      {
        name: '5G渗透率',
        currentValue: '33.5%',
        improvement: '-0.5%',
        activityCount: 4,
        totalOrders: 7800,
        trendData: [
          { month: '8月', value: 33.8 },
          { month: '9月', value: 33.7 },
          { month: '10月', value: 33.6 },
          { month: '11月', value: 33.5 },
          { month: '12月', value: 33.5 },
          { month: '1月', value: 33.5 },
        ],
        activities: [
          { id: 'klym4', name: '克拉玛依5G终端补贴', orderCount: 3000, date: '2025-01', status: '进行中', products: [{ name: '5G手机补贴', count: 2000 }, { name: '5G模组补贴', count: 1000 }] },
          { id: 'klym5', name: '克拉玛依5G体验活动', orderCount: 2500, date: '2025-01', status: '进行中', products: [{ name: '5G体验卡', count: 1800 }, { name: '5G试用流量', count: 700 }] },
          { id: 'klym6', name: '克拉玛依5G企业专线', orderCount: 1500, date: '2024-12', status: '已完成', products: [{ name: '5G企业专线', count: 1000 }, { name: '5G专网', count: 500 }] },
          { id: 'klym7', name: '克拉玛依5G云服务', orderCount: 1000, date: '2024-12', status: '已完成', products: [{ name: '5G云桌面', count: 700 }, { name: '5G云主机', count: 300 }] },
        ],
      },
    ],
  },
};

// 改善幅度条状图组件 - 组内相对对比，最大值对应满格
function ImprovementBar({ improvement, maxImprovement }: { improvement: string; maxImprovement: number }) {
  const isPositive = improvement.startsWith('+');
  const value = parseFloat(improvement.replace(/[+%]/g, ''));
  const absValue = Math.abs(value);

  // 计算条状图宽度：组内最大值对应100%宽度，最小保证5%
  const barWidth = maxImprovement > 0 
    ? Math.max((absValue / maxImprovement) * 100, 5) 
    : 5;

  return (
    <div className="w-20 h-8 flex items-center">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

// 微型趋势图组件
function MiniTrendChart({ data, isPositive }: { data: any[], isPositive: boolean }) {
  const color = isPositive ? '#10B981' : '#EF4444';

  // 计算环比
  const dataWithGrowth = data.map((item, index) => {
    if (index === 0) return { ...item, growth: 0 };
    const prevValue = data[index - 1].value;
    const growth = prevValue > 0 ? ((item.value - prevValue) / prevValue * 100) : 0;
    return { ...item, growth };
  });

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dataWithGrowth}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-white p-2 shadow-lg text-xs">
                    <p className="font-medium text-gray-900 mb-1">{data.month}</p>
                    <p className="text-gray-600">指标值：<span className="font-medium">{data.value}</span></p>
                    <p className="text-gray-600">
                      环比：
                      <span className={`font-medium ml-1 ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={{ fill: color, r: 1.5 }}
            activeDot={{ r: 2.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DispatchTrackingNew() {
  const mounted = useMounted();
  const [filters, setFilters] = useState({
    scenario: 'all', // 业务场景
    workOrderType: 'all', // 工单类型（合并业务类型和工单类型）
    createTimeType: 'all', // 创建时间维度：all-历史所有, day-按日, month-按月
    createTimeValue: '', // 创建时间值：按日为具体日期，按月为月份
  });

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // 弹窗和分页状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 每页显示的产品数量

  // 当前选中的指标（用于展示16地市分公司图表）
  const [activeMetric, setActiveMetric] = useState<any>(null);

  const nationalTotal = provincesData.reduce((sum, p) => sum + p.total, 0);
  const nationalInProgress = provincesData.reduce((sum, p) => sum + p.inProgress, 0);
  const nationalTimeout = provincesData.reduce((sum, p) => sum + p.timeout, 0);
  const nationalCompletionRate = Math.round(
    provincesData.reduce((sum, p) => sum + p.completionRate, 0) / provincesData.length
  );

  const displayTotal = selectedProvince
    ? provincesData.find(p => p.name === selectedProvince)?.total || 0
    : nationalTotal;
  const displayInProgress = selectedProvince
    ? provincesData.find(p => p.name === selectedProvince)?.inProgress || 0
    : nationalInProgress;
  const displayTimeout = selectedProvince
    ? provincesData.find(p => p.name === selectedProvince)?.timeout || 0
    : nationalTimeout;
  const displayCompletionRate = selectedProvince
    ? provincesData.find(p => p.name === selectedProvince)?.completionRate || 0
    : nationalCompletionRate;

  // 获取当前显示的数据（支持分省）
  const currentTop5 = selectedProvince && provinceMetricsMap[selectedProvince]
    ? provinceMetricsMap[selectedProvince].top5
    : nationalMetricsTop5;
  const currentBottom5 = selectedProvince && provinceMetricsMap[selectedProvince]
    ? provinceMetricsMap[selectedProvince].bottom5
    : nationalMetricsBottom5;

  const isPositiveImprovement = (improvement: string) => improvement.startsWith('+');

  // 判断指标值是否为百分比类型
  const isPercentageMetric = (currentValue: string) => currentValue.includes('%');

  // 获取改善幅度的单位
  const getImprovementUnit = (currentValue: string) => {
    return isPercentageMetric(currentValue) ? 'pp' : '%';
  };

  // 判断是否显示效果跟踪（只有生产类、管理类才显示）
  const shouldShowEffectTracking = () => {
    if (!filters.workOrderType || filters.workOrderType === 'all') {
      return true; // 全部类型时显示
    }
    const category = filters.workOrderType.split('/')[0];
    return category === '生产类' || category === '管理类';
  };

  // 将活动数据转换为扁平化的表格数据（按活动分组）
  const convertActivitiesToTableData = (activities: any[], metricTotalOrders: number) => {
    const tableData: any[] = [];

    // 先统计所有非活动产品的总数（用于合并）
    let totalNonActivityProducts = 0;
    let totalNonActivityOrders = 0;

    // 先遍历一遍，计算每个活动的总订购量
    const activityOrdersMap: Record<string, number> = {};

    activities.forEach((activity: any) => {
      const hasActivityName = activity.name && activity.name.trim() !== '';

      if (activity.products && activity.products.length > 0) {
        const totalOrders = activity.products.reduce((sum: number, p: any) => sum + p.count, 0);

        if (hasActivityName) {
          activityOrdersMap[activity.id] = totalOrders;
        } else {
          totalNonActivityOrders += totalOrders;
        }
      }
    });

    // 设置非活动的总订购量
    activityOrdersMap['non-activity'] = totalNonActivityOrders;

    // 按活动分组展示
    activities.forEach((activity: any) => {
      const hasActivityName = activity.name && activity.name.trim() !== '';

      if (hasActivityName && activity.products && activity.products.length > 0) {
        // 有活动名称的活动：每个产品一行，活动信息合并
        activity.products.forEach((product: any) => {
          tableData.push({
            productName: product.name,
            productOrderCount: product.count,
            percentage: ((product.count / metricTotalOrders) * 100).toFixed(2),
            activityName: activity.name,
            startDate: activity.date ? `${activity.date}-01` : '',
            endDate: activity.date ? `${activity.date}-28` : '',
            activityId: activity.id,
            productCount: activity.products.length, // 该活动的产品数量，用于合并
            isNonActivity: false,
            activityTotalOrders: activityOrdersMap[activity.id], // 该活动的总订购量
          });
        });
      } else if (!hasActivityName && activity.products && activity.products.length > 0) {
        // 无活动名称的活动：每个产品一行，活动名称标注为"（非活动）"
        totalNonActivityProducts += activity.products.length;
        activity.products.forEach((product: any) => {
          tableData.push({
            productName: product.name,
            productOrderCount: product.count,
            percentage: ((product.count / metricTotalOrders) * 100).toFixed(2),
            activityName: '（非活动）',
            startDate: '-',
            endDate: '-',
            activityId: 'non-activity', // 统一的非活动ID，用于合并
            productCount: totalNonActivityProducts, // 这里先设为累积数量，后面统一修正
            isNonActivity: true,
            activityTotalOrders: activityOrdersMap['non-activity'], // 非活动的总订购量
          });
        });
      }
    });

    // 修正所有非活动产品的 productCount 为总数
    const nonActivityItems = tableData.filter(item => item.isNonActivity);
    nonActivityItems.forEach(item => {
      item.productCount = totalNonActivityProducts;
    });

    return tableData;
  };

  const openDialog = (metric: any) => {
    setSelectedMetric(metric);
    setCurrentPage(1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMetric(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 计算分页数据（基于产品级别）
  const tableData = selectedMetric?.activities
    ? convertActivitiesToTableData(selectedMetric.activities, selectedMetric.totalOrders)
    : [];
  const totalProducts = tableData.length;
  const totalPages = Math.ceil(totalProducts / pageSize);

  // 按活动分组排序：确保第一页同时展示有活动和非活动产品
  const sortedTableData = useMemo(() => {
    // 分组：有活动的产品和非活动产品
    const hasActivityProducts = tableData.filter(item => !item.isNonActivity);
    const nonActivityProducts = tableData.filter(item => item.isNonActivity);

    // 按活动分组后，每个活动内部按产品订购量降序排序
    const activityMap: Record<string, any[]> = {};
    hasActivityProducts.forEach(item => {
      if (!activityMap[item.activityId]) {
        activityMap[item.activityId] = [];
      }
      activityMap[item.activityId].push(item);
    });

    // 每个活动内部按订购量降序排序
    Object.keys(activityMap).forEach(activityId => {
      activityMap[activityId].sort((a, b) => b.productOrderCount - a.productOrderCount);
    });

    // 合并所有有活动产品（按活动顺序）
    const sortedHasActivity: any[] = [];
    Object.values(activityMap).forEach(products => {
      sortedHasActivity.push(...products);
    });

    // 非活动产品按订购量降序排序
    const sortedNonActivity = [...nonActivityProducts].sort((a, b) => b.productOrderCount - a.productOrderCount);

    // 混合排列策略：第一页同时展示有活动和非活动产品
    const mixedData: any[] = [];
    let firstPageNonActivityCount = 0;
    let firstPageHasActivityCount = pageSize;

    // 如果两者都存在，第一页80%有活动，20%非活动（确保至少各有一个）
    if (sortedHasActivity.length > 0 && sortedNonActivity.length > 0) {
      firstPageNonActivityCount = Math.max(1, Math.min(Math.floor(pageSize * 0.2), sortedNonActivity.length));
      firstPageHasActivityCount = pageSize - firstPageNonActivityCount;

      // 第一页数据
      const firstPageHasActivity = sortedHasActivity.slice(0, firstPageHasActivityCount);
      const firstPageNonActivity = sortedNonActivity.slice(0, firstPageNonActivityCount);

      // 剩余数据
      const remainingHasActivity = sortedHasActivity.slice(firstPageHasActivityCount);
      const remainingNonActivity = sortedNonActivity.slice(firstPageNonActivityCount);

      // 组装：第一页 = 有活动 + 非活动；后续 = 剩余有活动 + 剩余非活动
      mixedData.push(...firstPageHasActivity, ...firstPageNonActivity, ...remainingHasActivity, ...remainingNonActivity);
    } else if (sortedHasActivity.length > 0) {
      // 只有有活动产品
      mixedData.push(...sortedHasActivity);
    } else {
      // 只有非活动产品
      mixedData.push(...sortedNonActivity);
    }

    return mixedData;
  }, [tableData, pageSize]);

  // 获取当前页的产品数据
  const paginatedTableData = sortedTableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 计算当前页涉及的活动的合并单元格信息（按活动分组）
  const calculateCellSpans = (data: any[]) => {
    const activitySpans: Record<string, { rowspan: number; firstRowIndex: number }> = {};

    // 先统计当前页每个 activityId 的产品数量
    const activityCountMap: Record<string, number> = {};
    data.forEach((row) => {
      if (!activityCountMap[row.activityId]) {
        activityCountMap[row.activityId] = 0;
      }
      activityCountMap[row.activityId]++;
    });

    data.forEach((row, index) => {
      // 只对每个活动的第一行计算合并单元格
      if (!activitySpans[row.activityId]) {
        // 使用当前页该活动的产品数量
        activitySpans[row.activityId] = {
          rowspan: activityCountMap[row.activityId],
          firstRowIndex: index,
        };
      }
    });

    return activitySpans;
  };

  const activitySpans = calculateCellSpans(paginatedTableData);

  const handleBackToNational = () => {
    setSelectedProvince(null);
  };

  // 初始化默认选中第一个Top5指标
  useEffect(() => {
    if (!activeMetric && nationalMetricsTop5.length > 0) {
      setActiveMetric(nationalMetricsTop5[0]);
    }
  }, []);

  if (!mounted) return null;
  return (
    <div className="space-y-2">
      {/* 顶部筛选器 */}
      <div className="rounded-lg border bg-white shadow-sm p-2">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">业务场景：</span>
            <Select
              value={filters.scenario}
              onValueChange={(value) => setFilters({ ...filters, scenario: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="churn-retention">离网维系</SelectItem>
                <SelectItem value="mid-high-customer">中高端客户运营</SelectItem>
                <SelectItem value="usage-operation">用量运营</SelectItem>
                <SelectItem value="convergence">融合运营</SelectItem>
                <SelectItem value="international">国际业务运营</SelectItem>
                <SelectItem value="segment-market">细分市场运营</SelectItem>
                <SelectItem value="family">家庭运营</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">工单类型：</span>
            <WorkOrderTypeTreeSelect
              value={filters.workOrderType}
              onChange={(value) => setFilters({ ...filters, workOrderType: value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">创建时间：</span>
            <div className="flex gap-4 items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="createTimeType"
                  value="all"
                  checked={filters.createTimeType === 'all'}
                  onChange={(e) => setFilters({ ...filters, createTimeType: e.target.value, createTimeValue: '' })}
                  className="cursor-pointer"
                />
                <span className="text-sm">历史所有</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="createTimeType"
                  value="day"
                  checked={filters.createTimeType === 'day'}
                  onChange={(e) => setFilters({ ...filters, createTimeType: e.target.value, createTimeValue: '' })}
                  className="cursor-pointer"
                />
                <span className="text-sm">按日</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="createTimeType"
                  value="month"
                  checked={filters.createTimeType === 'month'}
                  onChange={(e) => setFilters({ ...filters, createTimeType: e.target.value, createTimeValue: '' })}
                  className="cursor-pointer"
                />
                <span className="text-sm">按月</span>
              </label>
              {filters.createTimeType === 'day' && (
                <input
                  type="date"
                  value={filters.createTimeValue || selectedDate}
                  onChange={(e) => setFilters({ ...filters, createTimeValue: e.target.value })}
                  className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-[#0085D0] focus:outline-none"
                />
              )}
              {filters.createTimeType === 'month' && (
                <input
                  type="month"
                  value={filters.createTimeValue || selectedMonth}
                  onChange={(e) => setFilters({ ...filters, createTimeValue: e.target.value })}
                  className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-[#0085D0] focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* 整体态势 - 保持原样 */}
      <div className="rounded-lg border bg-white shadow-sm p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: '#0085D0' }} />
            整体态势
          </h3>
          {selectedProvince && (
            <Button variant="ghost" size="sm" onClick={handleBackToNational} className="h-6 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              返回全疆
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div
            className={`rounded-lg p-2 border-2 cursor-pointer transition-all ${
              selectedProvince === null ? 'border-[#0085D0] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={handleBackToNational}
          >
            <p className="text-xs text-gray-500 mb-1">全区总工单量</p>
            <p className="text-2xl font-bold text-gray-900">{nationalTotal}</p>
          </div>
          <div
            className={`rounded-lg p-2 border-2 cursor-pointer transition-all ${
              selectedProvince === null ? 'border-[#0085D0] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={handleBackToNational}
          >
            <p className="text-xs text-gray-500 mb-1">全区在途</p>
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{nationalInProgress}</p>
          </div>
          <div
            className={`rounded-lg p-2 border-2 cursor-pointer transition-all ${
              selectedProvince === null ? 'border-[#0085D0] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={handleBackToNational}
          >
            <p className="text-xs text-gray-500 mb-1">全区超时</p>
            <p className="text-2xl font-bold text-red-600">{nationalTimeout}</p>
          </div>
          <div
            className={`rounded-lg p-2 border-2 cursor-pointer transition-all ${
              selectedProvince === null ? 'border-[#0085D0] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={handleBackToNational}
          >
            <p className="text-xs text-gray-500 mb-1">全区完成率</p>
            <p className="text-2xl font-bold text-green-600">{nationalCompletionRate}%</p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-600">
            当前展示：<span className="font-medium text-gray-900">
              {selectedProvince ? selectedProvince : '全国'}
            </span>
            {' '} - 总工单量：<span className="font-medium text-gray-900">{displayTotal}</span>
            {' '} | 在途：<span className="font-medium" style={{ color: '#F59E0B' }}>{displayInProgress}</span>
            {' '} | 超时：<span className="font-medium text-red-600">{displayTimeout}</span>
            {' '} | 完成率：<span className="font-medium text-green-600">{displayCompletionRate}%</span>
          </p>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provincesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">{data.name}</p>
                        <p className="text-xs text-gray-600">总工单量：{data.total}</p>
                        <p className="text-xs text-gray-600">在途：<span style={{ color: '#F59E0B' }}>{data.inProgress}</span></p>
                        <p className="text-xs text-gray-600">超时：<span className="text-red-600">{data.timeout}</span></p>
                        <p className="text-xs text-gray-600">完成率：<span className="text-green-600">{data.completionRate}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="total" name="总工单量" fill="#0085D0" onClick={(data) => setSelectedProvince(data.name)} />
              <Bar dataKey="inProgress" name="在途" fill="#F59E0B" />
              <Bar dataKey="timeout" name="超时" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 效果跟踪 - 列表形式（仅生产类、管理类显示） */}
      {shouldShowEffectTracking() && (
      <div className="rounded-lg border bg-white shadow-sm p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: '#0085D0' }} />
            效果跟踪
          </h3>
          <div className="flex items-center gap-2">
            {!selectedProvince ? (
              <Select value="全国" onValueChange={(value) => value !== '全国' && setSelectedProvince(value)}>
                <SelectTrigger className="w-[120px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全国">全国</SelectItem>
                  {provincesData.map(p => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">当前区域：<span className="font-medium text-gray-900">{selectedProvince}</span></span>
                <Button variant="ghost" size="sm" onClick={handleBackToNational} className="h-6 text-xs px-2">
                  返回全疆
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 双列布局 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top5 列表 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
              <span className="text-sm font-semibold text-gray-700">Top 5 改善</span>
              <span className="text-xs text-gray-400">条形长度表示相对改善幅度</span>
            </div>
            {/* 计算组内最大改善幅度 */}
            {(() => {
              const maxImprovement = currentTop5.length > 0 
                ? Math.max(...currentTop5.map(m => Math.abs(parseFloat(m.improvement.replace(/[+%]/g, '')))))
                : 0;
              return (
            <div className="space-y-1 bg-white rounded-lg">
              {currentTop5.map((metric, index) => {
                const isPositive = isPositiveImprovement(metric.improvement);
                const isActive = activeMetric?.name === metric.name;

                return (
                  <div
                    key={`top5-${index}`}
                    className={`hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-[#0085D0]' : ''}`}
                    onClick={() => setActiveMetric(metric)}
                  >
                    {/* 主行 */}
                    <div className="flex items-center py-3 px-2 gap-2 cursor-pointer">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <div className={`text-sm font-medium truncate ${isActive ? 'text-[#0085D0]' : 'text-gray-900'}`} title={metric.name}>{metric.name}</div>
                      </div>
                      <div className="flex-1">
                        {/* 改善幅度条状图 */}
                        <div className="flex items-center">
                          <ImprovementBar improvement={metric.improvement} maxImprovement={maxImprovement} />
                        </div>
                      </div>
                      {/* 当前值和改善幅度 */}
                      <div className="flex-shrink-0 min-w-[140px]">
                        <div className="text-lg font-bold text-gray-900">{metric.currentValue}</div>
                        <div className="text-xs text-gray-600">
                          改善幅度：<span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{metric.improvement.replace('%', '')}{getImprovementUnit(metric.currentValue)}</span>
                        </div>
                      </div>
                      {/* 活动数量和业务订购量上下结构 */}
                      <div className="flex-shrink-0 min-w-[80px]">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                          <Activity className="h-3 w-3" style={{ color: '#0085D0' }} />
                          <span>{metric.activityCount}个</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <ShoppingCart className="h-3 w-3" style={{ color: '#0085D0' }} />
                          <span>{(metric.totalOrders / 10000).toFixed(1)}万</span>
                        </div>
                      </div>
                      {/* 趋势图 */}
                      <div className="flex items-center">
                        <MiniTrendChart data={metric.trendData} isPositive={isPositive} />
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-gray-400 flex-shrink-0 hover:text-[#0085D0]"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDialog(metric);
                        }}
                      />
                    </div>

                  </div>
                );
              })}
              {currentTop5.length === 0 && (
                <div className="text-xs text-gray-400 py-4 text-center">
                  {selectedProvince ? `${selectedProvince}暂无Top5指标数据` : '暂无数据'}
                </div>
              )}
            </div>
              );
            })()}
          </div>

          {/* Bottom5 列表 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-sm font-semibold text-gray-700">Bottom 5 改善</span>
              <span className="text-xs text-gray-400">条形长度表示相对改善幅度</span>
            </div>
            {/* 计算组内最大改善幅度 */}
            {(() => {
              const maxImprovement = currentBottom5.length > 0 
                ? Math.max(...currentBottom5.map(m => Math.abs(parseFloat(m.improvement.replace(/[+%]/g, '')))))
                : 0;
              return (
            <div className="space-y-1 bg-white rounded-lg">
              {currentBottom5.map((metric, index) => {
                const isPositive = isPositiveImprovement(metric.improvement);
                const isActive = activeMetric?.name === metric.name;

                return (
                  <div
                    key={`bottom5-${index}`}
                    className={`hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-[#0085D0]' : ''}`}
                    onClick={() => setActiveMetric(metric)}
                  >
                    {/* 主行 */}
                    <div className="flex items-center py-3 px-2 gap-2 cursor-pointer">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#EF4444' }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <div className={`text-sm font-medium truncate ${isActive ? 'text-[#0085D0]' : 'text-gray-900'}`} title={metric.name}>{metric.name}</div>
                      </div>
                      <div className="flex-1">
                        {/* 改善幅度条状图 */}
                        <div className="flex items-center">
                          <ImprovementBar improvement={metric.improvement} maxImprovement={maxImprovement} />
                        </div>
                      </div>
                      {/* 当前值和改善幅度 */}
                      <div className="flex-shrink-0 min-w-[140px]">
                        <div className="text-lg font-bold text-gray-900">{metric.currentValue}</div>
                        <div className="text-xs text-gray-600">
                          改善幅度：<span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{metric.improvement.replace('%', '')}{getImprovementUnit(metric.currentValue)}</span>
                        </div>
                      </div>
                      {/* 活动数量和业务订购量上下结构 */}
                      <div className="flex-shrink-0 min-w-[80px]">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                          <Activity className="h-3 w-3" style={{ color: '#0085D0' }} />
                          <span>{metric.activityCount}个</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <ShoppingCart className="h-3 w-3" style={{ color: '#0085D0' }} />
                          <span>{(metric.totalOrders / 10000).toFixed(1)}万</span>
                        </div>
                      </div>
                      {/* 趋势图 */}
                      <div className="flex items-center">
                        <MiniTrendChart data={metric.trendData} isPositive={isPositive} />
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-gray-400 flex-shrink-0 hover:text-[#0085D0]"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDialog(metric);
                        }}
                      />
                    </div>

                  </div>
                );
              })}
              {currentBottom5.length === 0 && (
                <div className="text-xs text-gray-400 py-4 text-center">
                  {selectedProvince ? `${selectedProvince}暂无Bottom5指标数据` : '暂无数据'}
                </div>
              )}
            </div>
              );
            })()}
          </div>
        </div>

        {/* 16地市分公司图表展示 */}
        {activeMetric && !selectedProvince && (
          <div className="mt-4 space-y-4">
            {/* 标题 */}
            <div className="flex items-center gap-2 px-2">
              <MapPin className="h-4 w-4" style={{ color: '#0085D0' }} />
              <span className="text-sm font-semibold text-gray-900">
                {activeMetric.name} - 16地市分公司改善情况
              </span>
            </div>

            {/* 组合图表：柱状图（业务订购量）+ 曲线图（改善幅度） */}
            <div className="rounded-lg border bg-white shadow-sm p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                16地市分公司业务订购量与改善幅度
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={metricProvincesData[activeMetric.name] || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="province"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis yAxisId="bar" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="line" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      content={(props: any) => {
                        const { active, payload, label } = props;
                        if (!active || !payload || payload.length === 0) return null;
                        const data = payload[0].payload;

                        // 根据当前指标的currentValue格式决定单位
                        const metricValueUnit = activeMetric.currentValue.includes('元') ? '元' : '%';
                        const metricValueDisplay = activeMetric.currentValue.includes('元')
                          ? `${data.currentValue.toFixed(1)}元`
                          : `${data.currentValue}%`;

                        // 根据指标值类型决定改善幅度单位
                        const improvementUnit = getImprovementUnit(activeMetric.currentValue);

                        return (
                          <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0085D0' }}>
                              {label}
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ color: '#666' }}>当前指标值：</span>
                              <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{metricValueDisplay}</span>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ color: '#666' }}>改善幅度（环比）：</span>
                              <span style={{
                                fontWeight: 'bold',
                                marginLeft: '8px',
                                color: data.improvementValue >= 0 ? '#10B981' : '#EF4444'
                              }}>
                                {data.improvement.replace('%', '')}{improvementUnit}
                              </span>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ color: '#666' }}>活动数：</span>
                              <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{data.activityCount}个</span>
                            </div>
                            <div>
                              <span style={{ color: '#666' }}>业务订购量：</span>
                              <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{(data.totalOrders / 10000).toFixed(2)}万</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="bar" dataKey="totalOrders" name="业务订购量" fill="#0085D0" />
                    <Line yAxisId="line" dataKey="improvementValue" name="改善幅度" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981', strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 效果详情弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-hidden"
          style={{ width: '1200px', maxWidth: '1200px' }}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{selectedMetric?.name} - 效果详情</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-full overflow-hidden">
            {/* 指标概览 */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4 flex-shrink-0">
              <div>
                <div className="text-xs text-gray-500">当前值</div>
                <div className="text-lg font-bold text-gray-900">{selectedMetric?.currentValue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">改善幅度</div>
                <div className={`text-lg font-bold ${isPositiveImprovement(selectedMetric?.improvement || '') ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedMetric?.improvement.replace('%', '')}{getImprovementUnit(selectedMetric?.currentValue || '')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">活动数</div>
                <div className="text-lg font-bold text-gray-900">{selectedMetric?.activityCount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">总订购量</div>
                <div className="text-lg font-bold text-gray-900">
                  {selectedMetric && ((selectedMetric.totalOrders / 10000).toFixed(1))}万
                </div>
              </div>
            </div>

            {/* 活动列表 - 统一表格形式，不再需要合并单元格 */}
            <div className="flex-1 overflow-y-auto pr-2">
              <table className="w-full border-collapse min-w-[1150px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-xs text-gray-700 border-b-2 border-gray-200">
                    <th className="text-left px-3 py-2 bg-gray-50 font-semibold w-[180px]">产品名称</th>
                    <th className="text-right px-3 py-2 bg-gray-50 font-semibold w-[120px]">产品订购量</th>
                    <th className="text-right px-3 py-2 bg-gray-50 font-semibold w-[80px]">占比</th>
                    <th className="text-right px-3 py-2 bg-gray-50 font-semibold w-[120px]">产品订购量（合计）</th>
                    <th className="text-center px-3 py-2 bg-gray-50 font-semibold w-[180px]">活动名称</th>
                    <th className="text-center px-3 py-2 bg-gray-50 font-semibold w-[110px]">活动开始时间</th>
                    <th className="text-center px-3 py-2 bg-gray-50 font-semibold w-[110px]">活动结束时间</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paginatedTableData.map((row: any, index: number) => {
                    const span = activitySpans[row.activityId];
                    const showSpannedCell = span && span.firstRowIndex === index;

                    return (
                      <tr key={`${row.activityId}-${index}`} className="border-b hover:bg-gray-50">
                        {/* 产品名称 */}
                        <td className="px-3 py-2 text-gray-900 border-r">{row.productName}</td>

                        {/* 产品订购量 */}
                        <td className="px-3 py-2 text-right text-gray-900 border-r">{(row.productOrderCount / 10000).toFixed(1)}万</td>

                        {/* 占比 */}
                        <td className="px-3 py-2 text-right text-gray-600 border-r">{row.percentage}%</td>

                        {/* 产品订购量（合计） - 合并单元格 */}
                        {showSpannedCell ? (
                          <td
                            className={`px-3 py-2 ${row.isNonActivity ? 'text-gray-400' : 'text-gray-900'} border-r text-right`}
                            rowSpan={span?.rowspan}
                          >
                            {(row.activityTotalOrders / 10000).toFixed(1)}万
                          </td>
                        ) : null}

                        {/* 活动名称 - 合并单元格 */}
                        {showSpannedCell ? (
                          <td
                            className={`px-3 py-2 ${row.isNonActivity ? 'text-gray-400' : 'text-gray-900'} border-r text-center`}
                            rowSpan={span?.rowspan}
                          >
                            {row.activityName}
                          </td>
                        ) : null}

                        {/* 活动开始时间 - 合并单元格 */}
                        {showSpannedCell ? (
                          <td
                            className={`px-3 py-2 ${row.isNonActivity ? 'text-gray-400' : 'text-gray-600'} border-r text-center`}
                            rowSpan={span?.rowspan}
                          >
                            {row.startDate}
                          </td>
                        ) : null}

                        {/* 活动结束时间 - 合并单元格 */}
                        {showSpannedCell ? (
                          <td
                            className={`px-3 py-2 ${row.isNonActivity ? 'text-gray-400' : 'text-gray-600'} text-center`}
                            rowSpan={span?.rowspan}
                          >
                            {row.endDate}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                  {paginatedTableData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 产品分页 */}
            <div className="flex items-center justify-between pt-4 border-t mt-4 flex-shrink-0">
              <div className="text-sm text-gray-500">
                共 {totalProducts} 个产品，第 {currentPage} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        backgroundColor: currentPage === pageNum ? '#0085D0' : undefined,
                        borderColor: currentPage === pageNum ? '#0085D0' : undefined,
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
