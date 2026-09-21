'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';

const indicatorTreeBaseStructure: IndicatorCardData = {
  id: 'root',
  name: '当月全量离网客户数',
  value: '45.6万',
  yoy: -1.2,
  yoyUnit: '',
  label: '主指标',
  level: 0,
  status: 'normal',
  isExpanded: true,
  children: [
    {
      id: '1-1',
      name: '离网方式',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        {
          id: '1-1-1',
          name: '离网客户主动销号占比',
          value: '63.8%',
          yoy: -2.5,
          yoyUnit: 'pp',
          level: 3,
          status: 'danger',
          parentId: '1-1',
          children: [
            { id: '1-1-1-1', name: '主动销号离网规模', value: '43.2万', yoy: 2.4, yoyUnit: '', level: 4, status: 'normal', parentId: '1-1-1' },
            { id: '1-1-1-2', name: '主动销号离网率', value: '2.12%', yoy: 6.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-1' }
          ]
        },
        {
          id: '1-1-2',
          name: '离网客户欠费销号占比',
          value: '68.1%',
          yoy: -3.2,
          yoyUnit: 'pp',
          level: 3,
          status: 'danger',
          parentId: '1-1',
          children: [
            { id: '1-1-2-1', name: '欠费销号离网规模', value: '48.9万', yoy: -8.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-2' },
            { id: '1-1-2-2', name: '欠费销号离网率', value: '7.93%', yoy: -6.9, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-2' }
          ]
        },
        {
          id: '1-1-3',
          name: '离网客户携出占比',
          label: '问题指标',
          value: '87.6%',
          yoy: -4.8,
          yoyUnit: 'pp',
          level: 3,
          status: 'danger',
          parentId: '1-1',
          children: [
            { id: '1-1-3-1', name: '携出离网规模', value: '9.8万', yoy: -8.3, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-3' },
            { id: '1-1-3-2', name: '携出离网率', value: '2.76%', yoy: -8.9, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-3' }
          ]
        },
        {
          id: '1-1-4',
          name: '离网客户冷冻期占比',
          label: '问题指标',
          value: '28.6%',
          yoy: -5.6,
          yoyUnit: 'pp',
          level: 3,
          status: 'danger',
          parentId: '1-1',
          children: [
            { id: '1-1-4-1', name: '冷冻期离网规模', value: '47.7万', yoy: 1.3, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-4' },
            { id: '1-1-4-2', name: '冷冻期离网率', value: '1.15%', yoy: -9.5, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-1-4' }
          ]
        }
      ]
    },
    {
      id: '1-2',
      name: '物理属性-年龄分布',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-2-1', name: '离网客户年龄[0,18)岁占比', value: '14.7%', yoy: '-8.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-1-1', name: '年龄[0,18)岁离网规模', value: '14.7万', yoy: '-8.5', yoyUnit: '', level: 4, status: 'normal', parentId: '1-2-1', children: [{ id: '1-2-1-1-1', name: '年轻群体潜在离网风险客户', value: '14.7万', yoy: '-8.5', yoyUnit: '', level: 5, status: 'normal', parentId: '1-2-1-1' }] }, { id: '1-2-1-2', name: '年龄[0,18)岁离网率', value: '14.7%', yoy: '-8.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-1' }] },
        { id: '1-2-2', name: '离网客户年龄[18,25)岁占比', value: '16.0%', yoy: '7.7', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-2-1', name: '年龄[18,25)岁离网规模', value: '16.0万', yoy: '7.7', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-2' }, { id: '1-2-2-2', name: '年龄[18,25)岁离网率', value: '16.0%', yoy: '7.7', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-2' }] },
        { id: '1-2-3', name: '离网客户年龄[25,30)岁占比', value: '27.6%', yoy: '-0.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-3-1', name: '年龄[25,30)岁离网规模', value: '27.6万', yoy: '-0.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-3' }, { id: '1-2-3-2', name: '年龄[25,30)岁离网率', value: '27.6%', yoy: '-0.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-3' }] },
        { id: '1-2-4', name: '离网客户年龄[30,50)岁占比', value: '26.5%', yoy: '1.4', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-4-1', name: '年龄[30,50)岁离网规模', value: '26.5万', yoy: '1.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-4' }, { id: '1-2-4-2', name: '年龄[30,50)岁离网率', value: '26.5%', yoy: '1.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-4' }] },
        { id: '1-2-5', name: '离网客户年龄[50,70)岁占比', value: '10.4%', yoy: '9.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-5-1', name: '年龄[50,70)岁离网规模', value: '10.4万', yoy: '9.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-5' }, { id: '1-2-5-2', name: '年龄[50,70)岁离网率', value: '10.4%', yoy: '9.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-5' }] },
        { id: '1-2-6', name: '离网客户年龄70岁及以上占比', value: '30.0%', yoy: '-6.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-2', children: [{ id: '1-2-6-1', name: '年龄70岁及以上离网规模', value: '30.0万', yoy: '-6.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-6', children: [{ id: '1-2-6-1-1', name: '老年群体潜在离网风险客户', value: '30.0万', yoy: '-6.9', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-2-6-1' }] }, { id: '1-2-6-2', name: '年龄70岁及以上离网率', value: '30.0%', yoy: '-6.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-2-6' }] }
      ]
    },
    {
      id: '1-3',
      name: '物理属性-网龄分布',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-3-1', name: '离网客户网龄1年以内占比', value: '21.1%', yoy: '3.1', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-3', children: [{ id: '1-3-1-1', name: '网龄1年以内离网规模', value: '21.1万', yoy: '3.1', yoyUnit: '', level: 4, status: 'normal', parentId: '1-3-1', children: [{ id: '1-3-1-1-1', name: '低网龄潜在离网风险客户', value: '21.1万', yoy: '3.1', yoyUnit: '', level: 5, status: 'normal', parentId: '1-3-1-1' }] }, { id: '1-3-1-2', name: '网龄1年以内离网率', value: '21.1%', yoy: '3.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-1' }] },
        { id: '1-3-2', name: '离网客户网龄1-3年占比', value: '33.1%', yoy: '-4.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-3', children: [{ id: '1-3-2-1', name: '网龄1-3年离网规模', value: '33.1万', yoy: '-4.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-2' }, { id: '1-3-2-2', name: '网龄1-3年离网率', value: '33.1%', yoy: '-4.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-2' }] },
        { id: '1-3-3', name: '离网客户网龄3-5年占比', value: '13.8%', yoy: '9.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-3', children: [{ id: '1-3-3-1', name: '网龄3-5年离网规模', value: '13.8万', yoy: '9.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-3' }, { id: '1-3-3-2', name: '网龄3-5年离网率', value: '13.8%', yoy: '9.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-3' }] },
        { id: '1-3-4', name: '离网客户网龄5年以上占比', value: '19.0%', yoy: '-2.8', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-3', children: [{ id: '1-3-4-1', name: '网龄5年以上离网规模', value: '19.0万', yoy: '-2.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-4', children: [{ id: '1-3-4-1-1', name: '高网龄潜在离网风险客户', value: '19.0万', yoy: '-2.8', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-3-4-1' }] }, { id: '1-3-4-2', name: '网龄5年以上离网率', value: '19.0%', yoy: '-2.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-3-4' }] }
      ]
    },
    {
      id: '1-4',
      name: '物理属性-性别分布',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-4-1', name: '离网客户男性占比', value: '15.1%', yoy: '-0.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-4', children: [{ id: '1-4-1-1', name: '男性离网规模', value: '15.1万', yoy: '-0.5', yoyUnit: '', level: 4, status: 'normal', parentId: '1-4-1' }, { id: '1-4-1-2', name: '男性离网率', value: '15.1%', yoy: '-0.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-4-1' }] },
        { id: '1-4-2', name: '离网客户女性占比', value: '23.0%', yoy: '-5.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-4', children: [{ id: '1-4-2-1', name: '女性离网规模', value: '23.0万', yoy: '-5.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-4-2' }, { id: '1-4-2-2', name: '女性离网率', value: '23.0%', yoy: '-5.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-4-2' }] }
      ]
    },
    {
      id: '1-5',
      name: '物理属性-成员属性',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-5-1', name: '离网客户战客成员占比', value: '9.8%', yoy: '-9.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-5', children: [{ id: '1-5-1-1', name: '战客成员离网规模', value: '9.8万', yoy: '-9.6', yoyUnit: '', level: 4, status: 'normal', parentId: '1-5-1' }, { id: '1-5-1-2', name: '战客成员离网率', value: '9.8%', yoy: '-9.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-5-1' }] },
        { id: '1-5-2', name: '离网客户非战客成员占比', value: '10.6%', yoy: '-6.8', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-5', children: [{ id: '1-5-2-1', name: '非战客成员离网规模', value: '10.6万', yoy: '-6.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-5-2' }, { id: '1-5-2-2', name: '非战客成员离网率', value: '10.6%', yoy: '-6.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-5-2' }] }
      ]
    },
    {
      id: '1-6',
      name: '物理属性-品牌分布',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-6-1', name: '离网客户全球通占比', value: '29.7%', yoy: '-4.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-6', children: [{ id: '1-6-1-1', name: '全球通离网规模', value: '29.7万', yoy: '-4.3', yoyUnit: '', level: 4, status: 'normal', parentId: '1-6-1' }, { id: '1-6-1-2', name: '全球通离网率', value: '29.7%', yoy: '-4.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-6-1' }] },
        { id: '1-6-2', name: '离网客户动感地带占比', value: '24.5%', yoy: '-5.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-6', children: [{ id: '1-6-2-1', name: '动感地带离网规模', value: '24.5万', yoy: '-5.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-6-2' }, { id: '1-6-2-2', name: '动感地带离网率', value: '24.5%', yoy: '-5.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-6-2' }] },
        { id: '1-6-3', name: '离网客户神州行占比', value: '21.3%', yoy: '-6.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-6', children: [{ id: '1-6-3-1', name: '神州行离网规模', value: '21.3万', yoy: '-6.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-6-3' }, { id: '1-6-3-2', name: '神州行离网率', value: '21.3%', yoy: '-6.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-6-3' }] }
      ]
    },
    {
      id: '1-7',
      name: '物理属性-入网渠道分布',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-7-1', name: '离网客户入网渠道线上渠道占比', value: '25.0%', yoy: '3.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-7', children: [{ id: '1-7-1-1', name: '入网渠道线上渠道离网规模', value: '25.0万', yoy: '3.9', yoyUnit: '', level: 4, status: 'normal', parentId: '1-7-1' }, { id: '1-7-1-2', name: '入网渠道线上渠道离网率', value: '25.0%', yoy: '3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-7-1' }] },
        { id: '1-7-2', name: '离网客户入网渠道线下渠道占比', value: '12.5%', yoy: '8.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-7', children: [{ id: '1-7-2-1', name: '入网渠道线下渠道离网规模', value: '12.5万', yoy: '8.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-7-2' }, { id: '1-7-2-2', name: '入网渠道线下渠道离网率', value: '12.5%', yoy: '8.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-7-2' }] }
      ]
    },
    {
      id: '1-8',
      name: '资费属性-套餐档次分层（T-3月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-8-1', name: '离网客户套餐档次8元及以下占比', value: '28.9%', yoy: '5.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-1-1', name: '套餐档次8元及以下离网规模', value: '28.9万', yoy: '5.5', yoyUnit: '', level: 4, status: 'normal', parentId: '1-8-1', children: [{ id: '1-8-1-1-1', name: '低套餐档位潜在离网风险客户', value: '28.9万', yoy: '5.5', yoyUnit: '', level: 5, status: 'normal', parentId: '1-8-1-1' }] }, { id: '1-8-1-2', name: '套餐档次8元及以下离网率', value: '28.9%', yoy: '5.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-1' }] },
        { id: '1-8-2', name: '离网客户套餐档次[30,50)元占比', value: '25.8%', yoy: 2.4, yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-2-1', name: '套餐档次[30,50)元离网规模', value: '25.8万', yoy: 2.4, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-2' }, { id: '1-8-2-2', name: '套餐档次[30,50)元离网率', value: '25.8%', yoy: 2.4, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-2' }] },
        { id: '1-8-3', name: '离网客户套餐档次[50,80)元占比', value: '18.2%', yoy: '9.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-3-1', name: '套餐档次[50,80)元离网规模', value: '18.2万', yoy: '9.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-3' }, { id: '1-8-3-2', name: '套餐档次[50,80)元离网率', value: '18.2%', yoy: '9.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-3' }] },
        { id: '1-8-4', name: '离网客户套餐档次[80,120)元占比', value: '6.3%', yoy: '-3.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-4-1', name: '套餐档次[80,120)元离网规模', value: '6.3万', yoy: '-3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-4', children: [{ id: '1-8-4-1-1', name: '中高套餐档位潜在离网风险客户', value: '6.3万', yoy: '-3.9', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-8-4-1' }] }, { id: '1-8-4-2', name: '套餐档次[80,120)元离网率', value: '6.3%', yoy: '-3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-4' }] },
        { id: '1-8-5', name: '离网客户套餐档次[120,180)元占比', value: '13.7%', yoy: '-0.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-5-1', name: '套餐档次[120,180)元离网规模', value: '13.7万', yoy: '-0.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-5' }, { id: '1-8-5-2', name: '套餐档次[120,180)元离网率', value: '13.7%', yoy: '-0.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-5' }] },
        { id: '1-8-6', name: '离网客户套餐档次180元及以上占比', value: '27.3%', yoy: '-7.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-8', children: [{ id: '1-8-6-1', name: '套餐档次180元及以上离网规模', value: '27.3万', yoy: '-7.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-6', children: [{ id: '1-8-6-1-1', name: '高套餐档位潜在离网风险客户', value: '27.3万', yoy: '-7.6', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-8-6-1' }] }, { id: '1-8-6-2', name: '套餐档次180元及以上离网率', value: '27.3%', yoy: '-7.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-8-6' }] }
      ]
    },
    {
      id: '1-9',
      name: '资费属性-流量饱和度（T-3月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-9-1', name: '离网客户流量饱和度0占比', value: '32.4%', yoy: '-8.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-9', children: [{ id: '1-9-1-1', name: '流量饱和度0离网规模', value: '32.4万', yoy: '-8.9', yoyUnit: '', level: 4, status: 'normal', parentId: '1-9-1' }, { id: '1-9-1-2', name: '流量饱和度0离网率', value: '32.4%', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-1' }] },
        { id: '1-9-2', name: '离网客户流量饱和度(0,50]占比', value: '19.1%', yoy: '-7.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-9', children: [{ id: '1-9-2-1', name: '流量饱和度(0,50]离网规模', value: '19.1万', yoy: '-7.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-2' }, { id: '1-9-2-2', name: '流量饱和度(0,50]离网率', value: '19.1%', yoy: '-7.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-2' }] },
        { id: '1-9-3', name: '离网客户流量饱和度(50,100]占比', value: '13.9%', yoy: '-5.4', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-9', children: [{ id: '1-9-3-1', name: '流量饱和度(50,100]离网规模', value: '13.9万', yoy: '-5.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-3' }, { id: '1-9-3-2', name: '流量饱和度(50,100]离网率', value: '13.9%', yoy: '-5.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-3' }] },
        { id: '1-9-4', name: '离网客户流量饱和度100以上占比', value: '31.8%', yoy: '-6.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-9', children: [{ id: '1-9-4-1', name: '流量饱和度100以上离网规模', value: '31.8万', yoy: '-6.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-4' }, { id: '1-9-4-2', name: '流量饱和度100以上离网率', value: '31.8%', yoy: '-6.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-9-4' }] }
      ]
    },
    {
      id: '1-10',
      name: '资费属性-超套额度（T-3月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-10-1', name: '离网客户超套(0,5]元占比', value: '13.8%', yoy: '-8.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-10', children: [{ id: '1-10-1-1', name: '超套(0,5]元离网规模', value: '13.8万', yoy: '-8.6', yoyUnit: '', level: 4, status: 'normal', parentId: '1-10-1' }, { id: '1-10-1-2', name: '超套(0,5]元离网率', value: '13.8%', yoy: '-8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-10-1' }] },
        { id: '1-10-2', name: '离网客户超套(5,10]元占比', value: '28.7%', yoy: '-9.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-10', children: [{ id: '1-10-2-1', name: '超套(5,10]元离网规模', value: '28.7万', yoy: '-9.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-10-2' }, { id: '1-10-2-2', name: '超套(5,10]元离网率', value: '28.7%', yoy: '-9.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-10-2' }] },
        { id: '1-10-3', name: '离网客户超套10元以上占比', value: '20.1%', yoy: '-5.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-10', children: [{ id: '1-10-3-1', name: '超套10元以上离网规模', value: '20.1万', yoy: '-5.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-10-3' }, { id: '1-10-3-2', name: '超套10元以上离网率', value: '20.1%', yoy: '-5.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-10-3' }] }
      ]
    },
    {
      id: '1-11',
      name: '资费属性-低业务使用',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-11-1', name: '离网客户流量语音双低饱和占比', value: '16.0%', yoy: '-5.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-11', children: [{ id: '1-11-1-1', name: '流量语音双低（套内饱和度<=20%)离网规模', value: '16.0万', yoy: '-5.2', yoyUnit: '', level: 4, status: 'normal', parentId: '1-11-1', children: [{ id: '1-11-1-1-1', name: '持续流量语音双低客户', value: '16.0万', yoy: '-5.2', yoyUnit: '', level: 5, status: 'normal', parentId: '1-11-1-1' }] }, { id: '1-11-1-2', name: '流量语音双低（套内饱和度<=20%)离网率', value: '16.0%', yoy: '-5.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-11-1' }] },
        { id: '1-11-2', name: '离网客户流量语音双降占比', value: '29.4%', yoy: '-8.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-11', children: [{ id: '1-11-2-1', name: '流量语音双降离网规模', value: '29.4万', yoy: '-8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-11-2', children: [{ id: '1-11-2-1-1', name: '流量语音双降客户', value: '29.4万', yoy: '-8.6', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-11-2-1' }] }, { id: '1-11-2-2', name: '流量语音双降离网率', value: '29.4%', yoy: '-8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-11-2' }] }
      ]
    },
    {
      id: '1-12',
      name: '资费属性-套餐升降档',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-12-1', name: '离网客户近三月降档占比', value: '16.4%', yoy: '-7.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-12', children: [{ id: '1-12-1-1', name: 'T-3月降档离网规模', value: '16.4万', yoy: '-7.0', yoyUnit: '', level: 4, status: 'normal', parentId: '1-12-1' }, { id: '1-12-1-2', name: 'T-3月降档离网率', value: '16.4%', yoy: '-7.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-12-1' }] },
        { id: '1-12-2', name: '离网客户近三月升档占比', value: '23.9%', yoy: '-3.7', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-12', children: [{ id: '1-12-2-1', name: 'T-3月升档离网规模', value: '23.9万', yoy: '-3.7', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-12-2' }, { id: '1-12-2-2', name: 'T-3月升档离网率', value: '23.9%', yoy: '-3.7', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-12-2' }] }
      ]
    },
    {
      id: '1-13',
      name: '业务属性-宽移融合',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-13-1', name: '离网客户宽带沉默占比', value: '20.4%', yoy: '-1.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-13', children: [{ id: '1-13-1-1', name: '宽带沉默离网规模', value: '20.4万', yoy: '-1.0', yoyUnit: '', level: 4, status: 'normal', parentId: '1-13-1', children: [{ id: '1-13-1-1-1', name: '宽带沉默客户', value: '20.4万', yoy: '-1.0', yoyUnit: '', level: 5, status: 'normal', parentId: '1-13-1-1' }] }, { id: '1-13-1-2', name: '宽带沉默离网率', value: '20.4%', yoy: '-1.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-13-1' }] },
        { id: '1-13-2', name: '离网客户宽带非千兆占比', value: '24.7%', yoy: '-3.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-13', children: [{ id: '1-13-2-1', name: '宽带非千兆离网规模', value: '24.7万', yoy: '-3.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-13-2', children: [{ id: '1-13-2-1-1', name: '宽带非千兆潜在离网风险客户', value: '24.7万', yoy: '-3.3', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-13-2-1' }] }, { id: '1-13-2-2', name: '宽带非千兆离网率', value: '24.7%', yoy: '-3.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-13-2' }] },
        { id: '1-13-3', name: '离网客户无宽带占比', value: '20.5%', yoy: '0.4', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-13', children: [{ id: '1-13-3-1', name: '无宽带离网规模', value: '20.5万', yoy: '0.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-13-3', children: [{ id: '1-13-3-1-1', name: '无宽带潜在离网风险客户', value: '20.5万', yoy: '0.4', yoyUnit: 'pp', level: 5, status: 'normal', parentId: '1-13-3-1' }] }, { id: '1-13-3-2', name: '无宽带离网率', value: '20.5%', yoy: '0.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-13-3' }] }
      ]
    },
    {
      id: '1-14',
      name: '资费属性-ARPU分层（T-6月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-14-1', name: '离网客户ARPU[0,30)占比', value: '18.2%', yoy: '-1.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-14', children: [{ id: '1-14-1-1', name: 'ARPU[0,30)离网规模', value: '18.2万', yoy: '-1.3', yoyUnit: '', level: 4, status: 'normal', parentId: '1-14-1' }, { id: '1-14-1-2', name: 'ARPU[0,30)离网率', value: '18.2%', yoy: '-1.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-1' }] },
        { id: '1-14-2', name: '离网客户ARPU[30,50)占比', value: '6.0%', yoy: '-3.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-14', children: [{ id: '1-14-2-1', name: 'ARPU[30,50)离网规模', value: '6.0万', yoy: '-3.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-2' }, { id: '1-14-2-2', name: 'ARPU[30,50)离网率', value: '6.0%', yoy: '-3.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-2' }] },
        { id: '1-14-3', name: '离网客户ARPU[50,80)占比', value: '14.4%', yoy: '-0.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-14', children: [{ id: '1-14-3-1', name: 'ARPU[50,80)离网规模', value: '14.4万', yoy: '-0.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-3' }, { id: '1-14-3-2', name: 'ARPU[50,80)离网率', value: '14.4%', yoy: '-0.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-3' }] },
        { id: '1-14-4', name: '离网客户ARPU[80,120)占比', value: '31.7%', yoy: '-1.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-14', children: [{ id: '1-14-4-1', name: 'ARPU[80,120)离网规模', value: '31.7万', yoy: '-1.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-4' }, { id: '1-14-4-2', name: 'ARPU[80,120)离网率', value: '31.7%', yoy: '-1.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-4' }] },
        { id: '1-14-5', name: '离网客户ARPU120元及以上占比', value: '15.3%', yoy: '-8.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-14', children: [{ id: '1-14-5-1', name: 'ARPU120元及以上离网规模', value: '15.3万', yoy: '-8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-5' }, { id: '1-14-5-2', name: 'ARPU120元及以上离网率', value: '15.3%', yoy: '-8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-14-5' }] }
      ]
    },
    {
      id: '1-15',
      name: '资费属性-DOU分层（T-6月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-15-1', name: '离网客户DOU[0,1)占比', value: '30.5%', yoy: '9.0', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-15', children: [{ id: '1-15-1-1', name: 'DOU[0,1)离网规模', value: '30.5万', yoy: '9.0', yoyUnit: '', level: 4, status: 'normal', parentId: '1-15-1' }, { id: '1-15-1-2', name: 'DOU[0,1)离网率', value: '30.5%', yoy: '9.0', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-1' }] },
        { id: '1-15-2', name: '离网客户DOU[1,5)占比', value: '21.6%', yoy: '9.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-15', children: [{ id: '1-15-2-1', name: 'DOU[1,5)离网规模', value: '21.6万', yoy: '9.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-2' }, { id: '1-15-2-2', name: 'DOU[1,5)离网率', value: '21.6%', yoy: '9.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-2' }] },
        { id: '1-15-3', name: '离网客户DOU[5,10)占比', value: '28.4%', yoy: '3.1', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-15', children: [{ id: '1-15-3-1', name: 'DOU[5,10)离网规模', value: '28.4万', yoy: '3.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-3' }, { id: '1-15-3-2', name: 'DOU[5,10)离网率', value: '28.4%', yoy: '3.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-3' }] },
        { id: '1-15-4', name: '离网客户DOU10G及以上占比', value: '18.2%', yoy: '-7.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-15', children: [{ id: '1-15-4-1', name: 'DOU10G及以上离网规模', value: '18.2万', yoy: '-7.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-4' }, { id: '1-15-4-2', name: 'DOU10G及以上离网率', value: '18.2%', yoy: '-7.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-15-4' }] }
      ]
    },
    {
      id: '1-16',
      name: '资费属性-MOU分层（T-6月）',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-16-1', name: '离网客户MOU[0,50)占比', value: '14.1%', yoy: '3.1', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-16', children: [{ id: '1-16-1-1', name: 'MOU[0,50)离网规模', value: '14.1万', yoy: '3.1', yoyUnit: '', level: 4, status: 'normal', parentId: '1-16-1' }, { id: '1-16-1-2', name: 'MOU[0,50)离网率', value: '14.1%', yoy: '3.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-1' }] },
        { id: '1-16-2', name: '离网客户MOU[50,200)占比', value: '9.0%', yoy: '-0.8', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-16', children: [{ id: '1-16-2-1', name: 'MOU[50,200)离网规模', value: '9.0万', yoy: '-0.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-2' }, { id: '1-16-2-2', name: 'MOU[50,200)离网率', value: '9.0%', yoy: '-0.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-2' }] },
        { id: '1-16-3', name: '离网客户MOU[200,500)占比', value: '5.1%', yoy: '-8.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-16', children: [{ id: '1-16-3-1', name: 'MOU[200,500)离网规模', value: '5.1万', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-3' }, { id: '1-16-3-2', name: 'MOU[200,500)离网率', value: '5.1%', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-3' }] },
        { id: '1-16-4', name: '离网客户MOU500及以上占比', value: '6.7%', yoy: '-0.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-16', children: [{ id: '1-16-4-1', name: 'MOU500及以上离网规模', value: '6.7万', yoy: '-0.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-4' }, { id: '1-16-4-2', name: 'MOU500及以上离网率', value: '6.7%', yoy: '-0.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-16-4' }] }
      ]
    },
    {
      id: '1-17',
      name: '业务属性-合约融合',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-17-1', name: '离网客户合约期未到期占比', value: '8.2%', yoy: '-8.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-17', children: [{ id: '1-17-1-1', name: '合约期未到期离网规模', value: '8.2万', yoy: '-8.9', yoyUnit: '', level: 4, status: 'normal', parentId: '1-17-1' }, { id: '1-17-1-2', name: '合约期未到期离网率', value: '8.2%', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-17-1' }] },
        { id: '1-17-2', name: '离网客户合约期已到期占比', value: '27.6%', yoy: '-0.8', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-17', children: [{ id: '1-17-2-1', name: '合约期已到期离网规模', value: '27.6万', yoy: '-0.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-17-2' }, { id: '1-17-2-2', name: '合约期已到期离网率', value: '27.6%', yoy: '-0.8', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-17-2' }] },
        { id: '1-17-3', name: '离网客户无合约占比', value: '29.9%', yoy: '-0.4', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-17', children: [{ id: '1-17-3-1', name: '无合约离网规模', value: '29.9万', yoy: '-0.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-17-3' }, { id: '1-17-3-2', name: '无合约离网率', value: '29.9%', yoy: '-0.4', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-17-3' }] }
      ]
    },
    {
      id: '1-18',
      name: '业务属性-两网融合',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-18-1', name: '离网客户仅移动占比', value: '12.0%', yoy: 6.2, yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-18', children: [{ id: '1-18-1-1', name: '仅移动离网规模', value: '12.0万', yoy: 6.2, yoyUnit: '', level: 4, status: 'normal', parentId: '1-18-1' }, { id: '1-18-1-2', name: '仅移动离网率', value: '12.0%', yoy: 6.2, yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-18-1' }] },
        { id: '1-18-2', name: '离网客户仅宽带占比', value: '14.7%', yoy: '3.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-18', children: [{ id: '1-18-2-1', name: '仅宽带离网规模', value: '14.7万', yoy: '3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-18-2' }, { id: '1-18-2-2', name: '仅宽带离网率', value: '14.7%', yoy: '3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-18-2' }] },
        { id: '1-18-3', name: '离网客户融合套餐占比', value: '18.3%', yoy: '7.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-18', children: [{ id: '1-18-3-1', name: '融合套餐离网规模', value: '18.3万', yoy: '7.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-18-3' }, { id: '1-18-3-2', name: '融合套餐离网率', value: '18.3%', yoy: '7.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-18-3' }] }
      ]
    },
    {
      id: '1-19',
      name: '业务属性-代付共享',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-19-1', name: '离网客户主卡被代付共享占比', value: '7.8%', yoy: '-3.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-19', children: [{ id: '1-19-1-1', name: '主卡被代付共享离网规模', value: '7.8万', yoy: '-3.9', yoyUnit: '', level: 4, status: 'normal', parentId: '1-19-1' }, { id: '1-19-1-2', name: '主卡被代付共享离网率', value: '7.8%', yoy: '-3.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-19-1' }] },
        { id: '1-19-2', name: '离网客户副卡被代付共享占比', value: '13.6%', yoy: '-5.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-19', children: [{ id: '1-19-2-1', name: '副卡被代付共享离网规模', value: '13.6万', yoy: '-5.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-19-2' }, { id: '1-19-2-2', name: '副卡被代付共享离网率', value: '13.6%', yoy: '-5.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-19-2' }] },
        { id: '1-19-3', name: '离网客户无代付共享占比', value: '22.1%', yoy: '8.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-19', children: [{ id: '1-19-3-1', name: '无代付共享离网规模', value: '22.1万', yoy: '8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-19-3' }, { id: '1-19-3-2', name: '无代付共享离网率', value: '22.1%', yoy: '8.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-19-3' }] }
      ]
    },
    {
      id: '1-20',
      name: '卡槽属性',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-20-1', name: '离网客户单卡槽占比', value: '22.9%', yoy: '-1.3', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-20', children: [{ id: '1-20-1-1', name: '单卡槽离网规模', value: '22.9万', yoy: '-1.3', yoyUnit: '', level: 4, status: 'normal', parentId: '1-20-1' }, { id: '1-20-1-2', name: '单卡槽离网率', value: '22.9%', yoy: '-1.3', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-20-1' }] },
        { id: '1-20-2', name: '离网客户双卡槽占比', value: '25.4%', yoy: '-2.1', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-20', children: [{ id: '1-20-2-1', name: '双卡槽离网规模', value: '25.4万', yoy: '-2.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-20-2' }, { id: '1-20-2-2', name: '双卡槽离网率', value: '25.4%', yoy: '-2.1', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-20-2' }] }
      ]
    },
    {
      id: '1-21',
      name: '客户流向及价值影响',
      label: '分类节点',
      level: 2,
      status: 'warning',
      isExpanded: true,
      parentId: 'root',
      children: [
        { id: '1-21-1', name: '身份证在网客户占比', value: '7.9%', yoy: '5.6', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-21', children: [{ id: '1-21-1-1', name: '身份证在网客户规模', value: '7.9万', yoy: '5.6', yoyUnit: '', level: 4, status: 'normal', parentId: '1-21-1' }, { id: '1-21-1-2', name: '身份证在网客户率', value: '7.9%', yoy: '5.6', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-1' }] },
        { id: '1-21-2', name: '部分号码在网客户占比', value: '30.3%', yoy: '-6.2', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-21', children: [{ id: '1-21-2-1', name: '部分号码在网客户规模', value: '30.3万', yoy: '-6.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-2' }, { id: '1-21-2-2', name: '部分号码在网客户率', value: '30.3%', yoy: '-6.2', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-2' }, { id: '1-21-2-3', name: '部分号码在网未影响收入的客户规模', value: '30.3万', yoy: '-6.2', yoyUnit: '', level: 4, status: 'normal', parentId: '1-21-2' }, { id: '1-21-2-4', name: '部分号码在网影响收入<=20%的客户规模', value: '30.3万', yoy: '-6.2', yoyUnit: '', level: 4, status: 'normal', parentId: '1-21-2' }, { id: '1-21-2-5', name: '部分号码在网影响收入(20%,50]的客户规模', value: '30.3万', yoy: '-6.2', yoyUnit: '', level: 4, status: 'normal', parentId: '1-21-2' }, { id: '1-21-2-6', name: '部分号码在网影响收入>50%的客户规模', value: '30.3万', yoy: '-6.2', yoyUnit: '', level: 4, status: 'normal', parentId: '1-21-2' }] },
        { id: '1-21-3', name: '在网客户异主我副占比', value: '5.7%', yoy: '-8.9', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-21', children: [{ id: '1-21-3-1', name: '异主我副在网规模', value: '5.7万', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-3' }, { id: '1-21-3-2', name: '异主我副在网率', value: '5.7%', yoy: '-8.9', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-3' }] },
        { id: '1-21-4', name: '在网客户我主异副占比', value: '13.6%', yoy: '-2.5', yoyUnit: 'pp', level: 3, status: 'danger', parentId: '1-21', children: [{ id: '1-21-4-1', name: '我主异副在网规模', value: '13.6万', yoy: '-2.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-4' }, { id: '1-21-4-2', name: '我主异副在网率', value: '13.6%', yoy: '-2.5', yoyUnit: 'pp', level: 4, status: 'normal', parentId: '1-21-4' }] }
      ]
    }
  ]
};

// 根据图片识别结果更新的整体指标数据
function getInitialIndicatorTreeData(indicatorName: string): IndicatorCardData[] {
  // 根据指标名称返回不同的根节点，但子节点结构相同（基于Excel数据）
  const tree = JSON.parse(JSON.stringify(indicatorTreeBaseStructure)) as IndicatorCardData;
  tree.name = indicatorName;
  return [tree];
}

// 分析面板数据
const analysisData = {
  indicatorName: '拍照中高端客户价值保有率',
  analysisReasons: [
    '降档客户拦截较好；异网主卡虽有所改善，但我号异宽规模仍走高',
    '主套升档规模发展较好，拉动泛升档规模环比提升；零融合客户有所改善，可继续保持，做好融合套餐推广',
    '泛升档客户规模增加，受限于单客户提值下滑，整体增收价值虽有增长但后劲不足'
  ],
  regionData: [
    { name: '巴州', value: 98.5 },

    { name: '克拉玛依', value: 95.6 },

    { name: '昌吉', value: 94.8 }
  ],

  trendData: [
    { month: '202505', value: 96.2 },
    { month: '202506', value: 96.4 },
    { month: '202507', value: 96.6 },
    { month: '202508', value: 96.7 },
    { month: '202509', value: 96.8 },
    { month: '202510', value: 96.99 }
  ],
  topRegions: ['巴州', '克拉玛依', '昌吉'],
  bottomRegions: [],
};

// 根据节点生成动态分析数据
const generateAnalysisData = (nodeId: string, treeData: IndicatorCardData[]) => {
  // 查找节点
  const findNode = (nodes: IndicatorCardData[]): IndicatorCardData | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const node = findNode(treeData);
  if (!node) return analysisData; // 返回默认数据

  // 根据节点状态生成分析原因
  const generateReasons = () => {
    const baseReasons = [
      `${node.name}表现${node.status === 'danger' ? '较差' : node.status === 'positive' ? '良好' : '正常'}，需要${node.status === 'danger' ? '重点关注' : node.status === 'positive' ? '继续保持' : '持续监控'}`,
      `相关区域表现${node.yoy && node.yoy.toString().startsWith('-') ? '有所下滑' : '稳步提升'}，建议采取针对性措施`,
      `从时间维度来看，该指标近期趋势${node.status === 'danger' ? '呈下降趋势' : '保持稳定'}，需密切跟踪`
    ];
    return baseReasons;
  };

  // 生成区域数据（模拟数据）
  const generateRegionData = () => {
    const regions = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
    const baseValue = node.status === 'danger' ? 90 : node.status === 'positive' ? 98 : 95;
    return regions.map(region => ({
      name: region,
      value: baseValue + Math.random() * 10
    })).slice(0, 6);
  };

  // 生成时间趋势数据（模拟数据）
  const generateTrendData = () => {
    const months = ['202505', '202506', '202507', '202508', '202509', '202510'];
    const baseValue = node.status === 'danger' ? 90 : node.status === 'positive' ? 98 : 95;
    const trend = node.status === 'danger' ? -2 : node.status === 'positive' ? 2 : 0;
    return months.map((month, index) => ({
      month,
      value: baseValue + trend * index + Math.random() * 2
    }));
  };

  const regionData = generateRegionData();
  regionData.sort((a, b) => b.value - a.value);

  return {
    indicatorName: node.name,
    analysisReasons: generateReasons(),
    regionData,
    topRegions: regionData.slice(0, 3).map(r => r.name),
    bottomRegions: regionData.slice(-3).map(r => r.name),
    trendData: generateTrendData()
  };
};
export function IndicatorTreeContent({ indicatorName, selectedMonth, currentTab, selectedRegion, regionDisplay }: { 
  indicatorName: string; 
  selectedMonth?: string; 
  currentTab?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
  regionDisplay?: string;
}) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root'); // 默认选中根节点
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>('2025-01');
  const finalSelectedMonth = selectedMonth !== undefined ? selectedMonth : internalSelectedMonth;
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>(getInitialIndicatorTreeData(indicatorName));

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  // 根据选中的指标生成动态分析数据
  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator, indicatorTreeData)
    : analysisData;

  // 根据指标名称生成 pageId
  const getPageId = () => {
    if (indicatorName === '当月全量离网客户数') {
      return 'portal.churn.all-churn';
    } else if (indicatorName === '当月拍照中高端离网客户数') {
      return 'portal.churn.mid-high-churn';
    } else if (indicatorName === '当月拍照全球通离网客户数') {
      return 'portal.churn.global-churn';
    }
    return 'portal.churn.all-churn';
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      {/* 主内容区：左侧指标树 + 右侧分析面板 */}
      <div className="flex gap-4">
        {/* 左侧指标树 - 占60%，固定高度600px */}
        <div className="w-[60%] h-[600px] border rounded-lg overflow-auto relative">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <h3 className="text-sm font-semibold text-gray-700">指标树</h3>
            <div className="flex items-center gap-3">
              {/* 显示当前选择的月份 */}
              <span className="text-sm text-gray-600">{finalSelectedMonth}</span>
            </div>
          </div>

          {/* 悬浮工具栏 - 透明背景，右上角 */}
          <div className="absolute top-16 right-4 z-10 flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
              <Bell className="h-4 w-4 mr-2" />
              预警列表(12)
            </Button>
            <select className="border rounded px-3 py-2 text-sm bg-white/90 backdrop-blur-sm shadow-sm">
              <option>全部展开</option>
              <option>全部折叠</option>
              <option>仅展开预警节点</option>
            </select>
          </div>

          {/* 指标树内容 */}
          <div className="h-full pt-20 px-4">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={handleCardClick}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 - 占40% */}
        <div className="w-[40%] overflow-hidden">
          {/* 上部分：分析面板 - 固定高度600px */}
          <div className="h-[600px] mb-4">
            <AnalysisPanel
              indicatorName={indicatorName}
              selectedIndicator={selectedIndicator}
              indicatorTreeData={indicatorTreeData}
              analysisReasons={dynamicAnalysisData.analysisReasons}
              regionData={dynamicAnalysisData.regionData}
              topRegions={dynamicAnalysisData.topRegions}
              bottomRegions={dynamicAnalysisData.bottomRegions}
              trendData={dynamicAnalysisData.trendData}
              currentTab={currentTab}
              from="churn-retention"
              businessScenario="离网维系"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </div>

          {/* 下部分：数据洞察报告 */}
          <div className="border border-gray-200 rounded-lg">
            <DataInsightReports
              pageId={getPageId()}
              maxDisplay={3}
              showViewAll={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

