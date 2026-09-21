'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';

interface SegmentData {
  segment: string;
  scale: number | string;
  yoy: string;
  status: 'normal' | 'warning' | 'danger';
  businessScope: string;
}

const indicatorTreeBaseStructure: IndicatorCardData = {
  "id": "root",
  "name": "家宽到达量",
  "value": "74.5万户",
  "yoy": 11.9,
  "yoyUnit": "%",
  "label": "主指标",
  "level": 0,
  "status": "normal",
  "isExpanded": true,
  "children": [
    {
      "id": "1-1",
      "name": "带宽结构",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "1-1-1",
          "name": "100M以下家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-1-1",
              "name": "100M以下家宽到达量",
              "value": "39.48万",
              "yoy": -2.1,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-1",
              "children": []
            },
            {
              "id": "1-1-1-2",
              "name": "100M以下家宽月新增",
              "value": "0.52万",
              "yoy": -5.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-1",
              "children": []
            },
            {
              "id": "1-1-1-3",
              "name": "100M以下家宽月净增",
              "value": "-0.18万",
              "yoy": -12.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "warning",
              "parentId": "1-1-1",
              "children": []
            },
            {
              "id": "1-1-1-4",
              "name": "100M以下家宽月离网",
              "value": "0.70万",
              "yoy": 8.7,
              "yoyUnit": "%",
              "label": "问题指标",
              "level": 3,
              "status": "warning",
              "parentId": "1-1-1",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-2",
          "name": "[100,200)M家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-2-1",
              "name": "[100,200)M家宽到达量",
              "value": "16.32万",
              "yoy": 1.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-2",
              "children": []
            },
            {
              "id": "1-1-2-2",
              "name": "[100,200)M家宽月新增量",
              "value": "0.28万",
              "yoy": -3.2,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-2",
              "children": []
            },
            {
              "id": "1-1-2-3",
              "name": "[100,200)M家宽月净增量",
              "value": "0.12万",
              "yoy": 5.4,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-2",
              "children": []
            },
            {
              "id": "1-1-2-4",
              "name": "[100,200)M家宽月离网",
              "value": "0.16万",
              "yoy": -2.8,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-2",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-3",
          "name": "[200,300)M家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-3-1",
              "name": "[200,300)M家宽到达量",
              "value": "8.65万",
              "yoy": 4.2,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-3",
              "children": []
            },
            {
              "id": "1-1-3-2",
              "name": "[200,300)M家宽月新增",
              "value": "0.21万",
              "yoy": 6.8,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-3",
              "children": []
            },
            {
              "id": "1-1-3-3",
              "name": "[200,300)M家宽月净增",
              "value": "0.15万",
              "yoy": 8.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-3",
              "children": []
            },
            {
              "id": "1-1-3-4",
              "name": "[200,300)M家宽月离网",
              "value": "0.06万",
              "yoy": -4.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-3",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-4",
          "name": "[300,500)M家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-4-1",
              "name": "[300,500)M家宽到达量",
              "value": "5.42万",
              "yoy": 7.8,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-4",
              "children": []
            },
            {
              "id": "1-1-4-2",
              "name": "[300,500)M家宽月新增",
              "value": "0.18万",
              "yoy": 12.4,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-4",
              "children": []
            },
            {
              "id": "1-1-4-3",
              "name": "[300,500)M家宽月净增",
              "value": "0.14万",
              "yoy": 15.2,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-4",
              "children": []
            },
            {
              "id": "1-1-4-4",
              "name": "[300,500)M家宽月离网",
              "value": "0.04万",
              "yoy": -6.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-4",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-5",
          "name": "[500,1000)M家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-5-1",
              "name": "[500,1000)M家宽到达量",
              "value": "3.28万",
              "yoy": 10.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-5",
              "children": []
            },
            {
              "id": "1-1-5-2",
              "name": "[500,1000)M家宽月新增",
              "value": "0.12万",
              "yoy": 18.7,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-5",
              "children": []
            },
            {
              "id": "1-1-5-3",
              "name": "[500,1000)M家宽月净增",
              "value": "0.09万",
              "yoy": 22.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-5",
              "children": []
            },
            {
              "id": "1-1-5-4",
              "name": "[500,1000)M家宽月离网",
              "value": "0.03万",
              "yoy": -8.6,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-5",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-6",
          "name": "1000M以上家宽到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-6-1",
              "name": "1000M以上家宽到达量",
              "value": "1.35万",
              "yoy": 28.7,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-6",
              "children": []
            },
            {
              "id": "1-1-6-2",
              "name": "1000M以上家宽月新增",
              "value": "0.08万",
              "yoy": 35.4,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-6",
              "children": []
            },
            {
              "id": "1-1-6-3",
              "name": "1000M以上家宽月净增",
              "value": "0.06万",
              "yoy": 42.1,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-6",
              "children": []
            },
            {
              "id": "1-1-6-4",
              "name": "1000M以上家宽月离网",
              "value": "0.02万",
              "yoy": -5.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-6",
              "children": []
            }
          ]
        },
        {
          "id": "1-1-7",
          "name": "2000M及以上宽带到达量占比",
          "label": "子指标",
          "level": 2,
          "children": [
            {
              "id": "1-1-7-1",
              "name": "2000M及以上宽带到达量",
              "value": "0.45万",
              "yoy": 52.8,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-7",
              "children": []
            },
            {
              "id": "1-1-7-2",
              "name": "2000M及以上宽带月新增",
              "value": "0.03万",
              "yoy": 68.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-7",
              "children": []
            },
            {
              "id": "1-1-7-3",
              "name": "2000M及以上宽带月净增",
              "value": "0.02万",
              "yoy": 75.2,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-7",
              "children": []
            },
            {
              "id": "1-1-7-4",
              "name": "2000M及以上宽带月离网",
              "value": "0.01万",
              "yoy": -12.4,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-1-7",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "1-2",
      "name": "业务类型",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "1-2-1",
          "name": "裸宽到达量占比",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "1-2",
          "children": [
            {
              "id": "1-2-1-1",
              "name": "裸宽到达量",
              "value": "18.2万",
              "yoy": -5.3,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "warning",
              "parentId": "1-2-1",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "1-3",
      "name": "活跃程度",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "1-3-1",
          "name": "到达宽带活跃量",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "1-3",
          "children": [
            {
              "id": "1-3-1-1",
              "name": "当月使用状态用户活跃量",
              "value": "65.2万",
              "yoy": 12.5,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-1",
              "children": []
            },
            {
              "id": "1-3-1-2",
              "name": "当月停机状态用户活跃量",
              "value": "9.3万",
              "yoy": 8.7,
              "yoyUnit": "%",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-1",
              "children": []
            }
          ]
        },
        {
          "id": "1-3-2",
          "name": "家宽活跃率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "1-3",
          "children": [
            {
              "id": "1-3-2-1",
              "name": "100M以下家宽活跃率",
              "value": "82.5%",
              "yoy": 2.1,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            },
            {
              "id": "1-3-2-2",
              "name": "[100,200)M家宽活跃率",
              "value": "85.3%",
              "yoy": 1.8,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            },
            {
              "id": "1-3-2-3",
              "name": "[200,300)M家宽活跃率",
              "value": "87.2%",
              "yoy": 1.5,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            },
            {
              "id": "1-3-2-4",
              "name": "[300,500)M家宽活跃率",
              "value": "89.5%",
              "yoy": 2.3,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            },
            {
              "id": "1-3-2-5",
              "name": "[500,1000)M家宽活跃率",
              "value": "91.8%",
              "yoy": 2.8,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            },
            {
              "id": "1-3-2-6",
              "name": "千兆家宽活跃率",
              "value": "93.5%",
              "yoy": 3.2,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "1-3-2",
              "children": []
            }
          ]
        }
      ]
    }
  ]
};

// 规模发展数据
const broadbandMobileFusionStructure: IndicatorCardData = {
  "id": "root",
  "name": "移宽融合率",
  "value": "45.2%",
  "yoy": 3.5,
  "yoyUnit": "pp",
  "label": "主指标",
  "level": 0,
  "status": "normal",
  "isExpanded": true,
  "children": [
    {
      "id": "2-1",
      "name": "融合主体",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "2-1-1",
          "name": "宽移融合率（个人）",
          "label": "子指标",
          "level": 2,
          "value": "42.8%",
          "yoy": 2.8,
          "yoyUnit": "pp",
          "status": "warning",
          "isExpanded": true,
          "parentId": "2-1",
          "children": [
            {
              "id": "2-1-1-1",
              "name": "宽移融合率(个人)-千兆宽带",
              "value": "58.3%",
              "yoy": 5.2,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-2",
              "name": "全球通宽移融合率（个人）",
              "value": "52.6%",
              "yoy": 4.1,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-3",
              "name": "全球通钻石卡宽移融合率（个人）",
              "value": "65.8%",
              "yoy": 3.9,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-4",
              "name": "全球通白金卡宽移融合率（个人）",
              "value": "58.2%",
              "yoy": 4.5,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-5",
              "name": "全球通金卡宽移融合率（个人）",
              "value": "51.4%",
              "yoy": 3.8,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-6",
              "name": "全球通银卡宽移融合率（个人）",
              "value": "46.3%",
              "yoy": 2.9,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-1",
              "children": []
            },
            {
              "id": "2-1-1-7",
              "name": "全球通普通卡宽移融合率（个人）",
              "value": "38.7%",
              "yoy": 2.1,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "danger",
              "parentId": "2-1-1",
              "children": []
            }
          ]
        },
        {
          "id": "2-1-2",
          "name": "宽移融合率（家庭）",
          "label": "子指标",
          "level": 2,
          "value": "47.6%",
          "yoy": 4.2,
          "yoyUnit": "pp",
          "status": "warning",
          "isExpanded": true,
          "parentId": "2-1",
          "children": [
            {
              "id": "2-1-2-1",
              "name": "宽移融合率(家庭)-千兆宽带",
              "value": "62.5%",
              "yoy": 5.8,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-2",
              "name": "全球通宽移融合率（家庭）",
              "value": "55.3%",
              "yoy": 4.6,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-3",
              "name": "全球通钻石卡宽移融合率（家庭）",
              "value": "68.9%",
              "yoy": 4.3,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-4",
              "name": "全球通白金卡宽移融合率（家庭）",
              "value": "61.2%",
              "yoy": 5.1,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-5",
              "name": "全球通金卡宽移融合率（家庭）",
              "value": "54.7%",
              "yoy": 4.4,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-6",
              "name": "全球通银卡宽移融合率（家庭）",
              "value": "49.8%",
              "yoy": 3.6,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "2-1-2",
              "children": []
            },
            {
              "id": "2-1-2-7",
              "name": "全球通普通卡宽移融合率（家庭）",
              "value": "41.2%",
              "yoy": 2.8,
              "yoyUnit": "pp",
              "label": "明细",
              "level": 3,
              "status": "danger",
              "parentId": "2-1-2",
              "children": []
            }
          ]
        }
      ]
    }
  ]
};

// 家宽拍照客户保有率指标树结构
const photoFamilyBroadbandRetentionStructure: IndicatorCardData = {
  "id": "root",
  "name": "拍照家宽客户规模保有率",
  "value": "85.6%",
  "yoy": 2.3,
  "yoyUnit": "pp",
  "label": "主指标",
  "level": 0,
  "status": "normal",
  "isExpanded": true,
  "children": [
    {
      "id": "3-1",
      "name": "存量",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "3-1-1",
          "name": "千兆存量保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-1",
          "children": [
            {
              "id": "3-1-1-1",
              "name": "千兆家宽月提速量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            },
            {
              "id": "3-1-1-2",
              "name": "千兆家宽月新增量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            },
            {
              "id": "3-1-1-3",
              "name": "千兆家宽月拆机量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            },
            {
              "id": "3-1-1-4",
              "name": "千兆家宽月降速量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            },
            {
              "id": "3-1-1-5",
              "name": "千兆家宽月流失量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            },
            {
              "id": "3-1-1-6",
              "name": "千兆家宽月净增量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-1-1",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "3-2",
      "name": "品牌属性",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "3-2-1",
          "name": "全球通家宽拍照客户规模保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-2",
          "children": [
            {
              "id": "3-2-1-1",
              "name": "全球通用户家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-2-1",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "3-3",
      "name": "带宽档位",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "3-3-1",
          "name": "1000M家宽拍照客户规模保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-3",
          "children": [
            {
              "id": "3-3-1-1",
              "name": "1000M以上家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-1",
              "children": []
            }
          ]
        },
        {
          "id": "3-3-2",
          "name": "500M家宽拍照客户规模保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-3",
          "children": [
            {
              "id": "3-3-2-1",
              "name": "[500, 1000)M家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-2",
              "children": []
            }
          ]
        },
        {
          "id": "3-3-3",
          "name": "300M家宽拍照客户规模保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-3",
          "children": [
            {
              "id": "3-3-3-1",
              "name": "[300, 500)M家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-3",
              "children": []
            }
          ]
        },
        {
          "id": "3-3-4",
          "name": "300M以下家宽拍照客户规模保有率",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-3",
          "children": [
            {
              "id": "3-3-4-1",
              "name": "100M以下家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-4",
              "children": []
            },
            {
              "id": "3-3-4-2",
              "name": "[100, 200)M家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-4",
              "children": []
            },
            {
              "id": "3-3-4-3",
              "name": "[200, 300)M家宽月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-3-4",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "3-4",
      "name": "业务类型",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "3-4-1",
          "name": "融合家宽拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "status": "normal",
          "parentId": "3-4",
          "children": []
        },
        {
          "id": "3-4-2",
          "name": "裸宽拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-4",
          "children": [
            {
              "id": "3-4-2-1",
              "name": "当月裸宽离网量",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-4-2",
              "children": []
            }
          ]
        },
        {
          "id": "3-4-3",
          "name": "二宽拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "status": "normal",
          "parentId": "3-4",
          "children": []
        }
      ]
    },
    {
      "id": "3-5",
      "name": "市场区域",
      "label": "分类节点",
      "level": 1,
      "status": "normal",
      "isExpanded": true,
      "parentId": "root",
      "children": [
        {
          "id": "3-5-1",
          "name": "校园宽带拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "isExpanded": true,
          "parentId": "3-5",
          "children": [
            {
              "id": "3-5-1-1",
              "name": "校园宽带月离网",
              "label": "明细",
              "level": 3,
              "status": "normal",
              "parentId": "3-5-1",
              "children": []
            }
          ]
        },
        {
          "id": "3-5-2",
          "name": "城市家宽拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "status": "normal",
          "parentId": "3-5",
          "children": []
        },
        {
          "id": "3-5-3",
          "name": "农村家宽拍照客户规模保有",
          "label": "子指标",
          "level": 2,
          "status": "normal",
          "parentId": "3-5",
          "children": []
        }
      ]
    }
  ]
};

// 客群看管数据（根据图片识别更新）
const segmentData: SegmentData[] = [
  { segment: '我号异宽客户', scale: 9557.44, yoy: '+1.2%', status: 'normal', businessScope: '使用移动号码但使用异网宽带的客户' },
  { segment: '低带宽客户', scale: 6052.73, yoy: '+1.2%', status: 'normal', businessScope: '带宽小于100M的客户' },
  { segment: '宽带潜在离网客户', scale: 1320.4, yoy: '+1.2%', status: 'normal', businessScope: '有离网风险的宽带客户' },
  { segment: '宽带到期未续约客户', scale: 480.2, yoy: '+1.2%', status: 'normal', businessScope: '宽带合约到期且未续约的客户' },
  { segment: '单宽带客户（未融合）', scale: 3646.28, yoy: '+1.2%', status: 'normal', businessScope: '仅有宽带业务，无融合产品的客户' },
  { segment: '潜在降档客户', scale: 4238.25, yoy: '+1.2%', status: 'normal', businessScope: '使用行为出现降档特征，有降档风险的客户' }
];

// 指标树数据
function getInitialIndicatorTreeData(indicatorName: string): IndicatorCardData[] {
  // 根据指标名称返回不同的指标树结构
  if (indicatorName === '移宽融合率') {
    const tree = JSON.parse(JSON.stringify(broadbandMobileFusionStructure)) as IndicatorCardData;
    return [tree];
  }
  if (indicatorName === '家宽拍照客户保有率') {
    const tree = JSON.parse(JSON.stringify(photoFamilyBroadbandRetentionStructure)) as IndicatorCardData;
    return [tree];
  }
  // 默认使用家宽到达量的指标树结构
  const tree = JSON.parse(JSON.stringify(indicatorTreeBaseStructure)) as IndicatorCardData;
  tree.name = indicatorName;
  return [tree];
}

// 分析面板数据
const analysisData = {
  indicatorName: '家宽到达量',
  analysisReasons: [
    '家宽规模稳步增长，千兆用户占比持续提升',
    '宽带升级推广成效显著，高带宽用户发展较好',
    '融合业务渗透率提升，带动家宽用户整体价值提升'
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

// 概览Tab内容（类似中高端概览页的结构）
export function IndicatorTreeContent({ indicatorName, selectedMonth }: { indicatorName: string; selectedMonth?: string }) {
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
    if (indicatorName === '家宽到达量') {
      return 'portal.churn.all-churn';
    }
    if (indicatorName === '移宽融合率') {
      return 'portal.churn.broadband-mobile-fusion';
    }
    if (indicatorName === '家宽拍照客户保有率') {
      return 'portal.churn.photo-family-broadband-retention';
    }
    return 'portal.churn.all-churn';
  };

  return (
    <div className="bg-gray-50 p-4 flex flex-col gap-4">
      {/* 主内容区：左侧指标树 + 右侧分析面板 */}
      <div className="flex gap-4">
        {/* 左侧指标树 - 占60%，固定高度1200px */}
        <div className="w-[60%] h-[1200px] border rounded-lg overflow-auto relative">
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
        <div className="w-[40%] h-[1200px] overflow-hidden">
          {/* 分析面板 - 与左侧指标树高度一致 */}
          <div className="h-full">
            <AnalysisPanel
              indicatorName={indicatorName}
              selectedIndicator={selectedIndicator}
              indicatorTreeData={indicatorTreeData}
              analysisReasons={dynamicAnalysisData.analysisReasons}
              regionData={dynamicAnalysisData.regionData}
              topRegions={dynamicAnalysisData.topRegions}
              bottomRegions={dynamicAnalysisData.bottomRegions}
              trendData={dynamicAnalysisData.trendData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

