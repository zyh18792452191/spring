'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const operatorLabel: Record<string, string> = {
  'none': '不限',
  '>': '>',
  '>=': '≥',
  '<': '<',
  '<=': '≤',
  '=': '=',
};

interface Relation {
  id: string;
  leftId: string;
  leftName: string;
  leftCategory?: string;
  direction: string;
  lowerOperator: string;
  lowerValue: string;
  lowerUnit: string;
  upperOperator: string;
  upperValue: string;
  upperUnit: string;
  rightId: string;
  rightName: string;
  rightCategory?: string;
  strength: number;
  source: string;
}

function formatThreshold(r: Relation): string {
  const parts: string[] = [];
  if (r.lowerOperator !== 'none' && r.lowerValue) {
    parts.push(`${operatorLabel[r.lowerOperator]}${r.lowerValue}${r.lowerUnit}`);
  }
  if (r.upperOperator !== 'none' && r.upperValue) {
    parts.push(`${operatorLabel[r.upperOperator]}${r.upperValue}${r.upperUnit}`);
  }
  return parts.length > 0 ? parts.join(' 且 ') : '不限';
}

const indicatorRootCauseRelations: Relation[] = [
  { id: 'IR-001', leftId: 'IND-001', leftName: '降档客户数', direction: 'up', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'IR-002', leftId: 'IND-001', leftName: '降档客户数', direction: 'up', lowerOperator: '>=', lowerValue: '1', lowerUnit: '%', upperOperator: '<', upperValue: '3', upperUnit: '%', rightId: 'RC-002', rightName: '季节性波动/正常波动', rightCategory: '市场与政策因素', strength: 1, source: '根因库' },
  { id: 'IR-003', leftId: 'IND-001', leftName: '降档客户数', direction: 'up', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-003', rightName: '重大竞品事件/系统性问题', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'IR-004', leftId: 'IND-002', leftName: 'ARPU值', direction: 'down', lowerOperator: '>', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-004', rightName: '套餐流量容量不足', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'IR-005', leftId: 'IND-003', leftName: '携转查询量', direction: 'up', lowerOperator: '>=', lowerValue: '30', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'IR-006', leftId: 'IND-004', leftName: '流量满意度', direction: 'down', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-006', rightName: '网络覆盖不足', rightCategory: '网络与服务因素', strength: 3, source: '根因库' },
  { id: 'IR-007', leftId: 'IND-002', leftName: 'ARPU值', direction: 'down', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 2, source: '根因库' },
  { id: 'IR-008', leftId: 'IND-005', leftName: '到期续约率', direction: 'down', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-007', rightName: '续约触点不足', rightCategory: '触点与渠道因素', strength: 2, source: '根因库' },
  { id: 'IR-009', leftId: 'IND-006', leftName: '新入网客户数', direction: 'down', lowerOperator: '>=', lowerValue: '15', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-009', rightName: '渠道触达效率低', rightCategory: '触点与渠道因素', strength: 2, source: '根因库' },
  { id: 'IR-010', leftId: 'IND-007', leftName: '宽带渗透率', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-010', rightName: '宽带产品竞争力不足', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'IR-011', leftId: 'IND-008', leftName: '流量DOU', direction: 'up', lowerOperator: '>=', lowerValue: '20', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-004', rightName: '套餐流量容量不足', rightCategory: '产品与套餐因素', strength: 3, source: '根因库' },
  { id: 'IR-012', leftId: 'IND-009', leftName: '超套客户占比', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-004', rightName: '套餐流量容量不足', rightCategory: '产品与套餐因素', strength: 3, source: '根因库' },
  { id: 'IR-013', leftId: 'IND-010', leftName: 'VoLTE渗透率', direction: 'down', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-011', rightName: '终端不支持/用户未开通', rightCategory: '终端与适配因素', strength: 1, source: '根因库' },
  { id: 'IR-014', leftId: 'IND-003', leftName: '携转查询量', direction: 'up', lowerOperator: '>=', lowerValue: '50', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-003', rightName: '重大竞品事件/系统性问题', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'IR-015', leftId: 'IND-011', leftName: '套餐适配率', direction: 'down', lowerOperator: '>=', lowerValue: '8', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-008', rightName: '产品功能与需求不匹配', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'IR-016', leftId: 'IND-002', leftName: 'ARPU值', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '5', upperUnit: '%', rightId: 'RC-002', rightName: '季节性波动/正常波动', rightCategory: '市场与政策因素', strength: 1, source: '根因库' },
  { id: 'IR-017', leftId: 'IND-012', leftName: '客户满意度', direction: 'down', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-012', rightName: '服务质量下降', rightCategory: '网络与服务因素', strength: 3, source: '根因库' },
  { id: 'IR-018', leftId: 'IND-013', leftName: '家庭客户离网率', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'RC-010', rightName: '宽带产品竞争力不足', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
];

const groupRootCauseRelations: Relation[] = [
  { id: 'GR-001', leftId: 'CG-001', leftName: '高流量低资费客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-004', rightName: '套餐流量容量不足', rightCategory: '产品与套餐因素', strength: 3, source: '根因库' },
  { id: 'GR-002', leftId: 'CG-002', leftName: '无合约客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 2, source: '根因库' },
  { id: 'GR-003', leftId: 'CG-003', leftName: '老年低消费客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-008', rightName: '产品功能与需求不匹配', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'GR-004', leftId: 'CG-005', leftName: '频繁查询套餐客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'GR-005', leftId: 'CG-006', leftName: '超套高流量客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-004', rightName: '套餐流量容量不足', rightCategory: '产品与套餐因素', strength: 3, source: '根因库' },
  { id: 'GR-006', leftId: 'CG-007', leftName: '宽带到期客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-010', rightName: '宽带产品竞争力不足', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'GR-007', leftId: 'CG-008', leftName: '5G终端4G套餐客户', leftCategory: '终端特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-011', rightName: '终端不支持/用户未开通', rightCategory: '终端与适配因素', strength: 2, source: '根因库' },
  { id: 'GR-008', leftId: 'CG-009', leftName: '携转倾向客户', leftCategory: '风险预警客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 3, source: '根因库' },
  { id: 'GR-009', leftId: 'CG-002', leftName: '无合约客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-003', rightName: '重大竞品事件/系统性问题', rightCategory: '价格与竞争因素', strength: 1, source: '根因库' },
  { id: 'GR-010', leftId: 'CG-010', leftName: '沉默客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-007', rightName: '续约触点不足', rightCategory: '触点与渠道因素', strength: 2, source: '根因库' },
  { id: 'GR-011', leftId: 'CG-001', leftName: '高流量低资费客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-008', rightName: '产品功能与需求不匹配', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'GR-012', leftId: 'CG-011', leftName: '低价值高投诉客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-012', rightName: '服务质量下降', rightCategory: '网络与服务因素', strength: 3, source: '根因库' },
  { id: 'GR-013', leftId: 'CG-012', leftName: '融合套餐客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-010', rightName: '宽带产品竞争力不足', rightCategory: '产品与套餐因素', strength: 1, source: '根因库' },
  { id: 'GR-014', leftId: 'CG-013', leftName: '新入网3月内客户', leftCategory: '生命周期客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-009', rightName: '渠道触达效率低', rightCategory: '触点与渠道因素', strength: 2, source: '根因库' },
  { id: 'GR-015', leftId: 'CG-014', leftName: '高ARPU低流量客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-008', rightName: '产品功能与需求不匹配', rightCategory: '产品与套餐因素', strength: 2, source: '根因库' },
  { id: 'GR-016', leftId: 'CG-015', leftName: '校园客户', leftCategory: '行业特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'RC-001', rightName: '竞品资费低于本网同档位', rightCategory: '价格与竞争因素', strength: 2, source: '根因库' },
];

const indicatorStrategyRelations: Relation[] = [
  { id: 'IS-001', leftId: 'IND-001', leftName: '降档客户数', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: '<', upperValue: '10', upperUnit: '%', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'IS-002', leftId: 'IND-002', leftName: 'ARPU值', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 2, source: '策略库' },
  { id: 'IS-003', leftId: 'IND-005', leftName: '到期续约率', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-003', rightName: '到期续约挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'IS-004', leftId: 'IND-003', leftName: '携转查询量', direction: 'down', lowerOperator: '>=', lowerValue: '20', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'IS-005', leftId: 'IND-008', leftName: '流量DOU', direction: 'up', lowerOperator: '>=', lowerValue: '20', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'IS-006', leftId: 'IND-009', leftName: '超套客户占比', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-006', rightName: '流量包推荐', rightCategory: '流量运营类', strength: 3, source: '策略库' },
  { id: 'IS-007', leftId: 'IND-007', leftName: '宽带渗透率', direction: 'up', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-007', rightName: '宽带融合推荐', rightCategory: '融合拓展类', strength: 2, source: '策略库' },
  { id: 'IS-008', leftId: 'IND-006', leftName: '新入网客户数', direction: 'up', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 2, source: '策略库' },
  { id: 'IS-009', leftId: 'IND-001', leftName: '降档客户数', direction: 'down', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'IS-010', leftId: 'IND-010', leftName: 'VoLTE渗透率', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 2, source: '策略库' },
  { id: 'IS-011', leftId: 'IND-012', leftName: '客户满意度', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-008', rightName: '客户关怀回访', rightCategory: '服务提升类', strength: 2, source: '策略库' },
  { id: 'IS-012', leftId: 'IND-013', leftName: '家庭客户离网率', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-007', rightName: '宽带融合推荐', rightCategory: '融合拓展类', strength: 2, source: '策略库' },
  { id: 'IS-013', leftId: 'IND-002', leftName: 'ARPU值', direction: 'up', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 3, source: '策略库' },
  { id: 'IS-014', leftId: 'IND-011', leftName: '套餐适配率', direction: 'up', lowerOperator: '>=', lowerValue: '5', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 2, source: '策略库' },
  { id: 'IS-015', leftId: 'IND-005', leftName: '到期续约率', direction: 'down', lowerOperator: '>=', lowerValue: '10', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'IS-016', leftId: 'IND-004', leftName: '流量满意度', direction: 'down', lowerOperator: '>=', lowerValue: '3', lowerUnit: '%', upperOperator: 'none', upperValue: '', upperUnit: '%', rightId: 'STR-006', rightName: '流量包推荐', rightCategory: '流量运营类', strength: 2, source: '策略库' },
];

const groupStrategyRelations: Relation[] = [
  { id: 'GS-001', leftId: 'CG-001', leftName: '高流量低资费客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'GS-002', leftId: 'CG-004', leftName: '5G终端持有4G套餐客户', leftCategory: '终端特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 3, source: '策略库' },
  { id: 'GS-003', leftId: 'CG-002', leftName: '无合约客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 2, source: '策略库' },
  { id: 'GS-004', leftId: 'CG-005', leftName: '频繁查询套餐客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'GS-005', leftId: 'CG-006', leftName: '超套高流量客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-006', rightName: '流量包推荐', rightCategory: '流量运营类', strength: 3, source: '策略库' },
  { id: 'GS-006', leftId: 'CG-007', leftName: '宽带到期客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-007', rightName: '宽带融合推荐', rightCategory: '融合拓展类', strength: 2, source: '策略库' },
  { id: 'GS-007', leftId: 'CG-009', leftName: '携转倾向客户', leftCategory: '风险预警客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'GS-008', leftId: 'CG-003', leftName: '老年低消费客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-008', rightName: '客户关怀回访', rightCategory: '服务提升类', strength: 2, source: '策略库' },
  { id: 'GS-009', leftId: 'CG-008', leftName: '5G终端4G套餐客户', leftCategory: '终端特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 3, source: '策略库' },
  { id: 'GS-010', leftId: 'CG-010', leftName: '沉默客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 2, source: '策略库' },
  { id: 'GS-011', leftId: 'CG-011', leftName: '低价值高投诉客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-008', rightName: '客户关怀回访', rightCategory: '服务提升类', strength: 3, source: '策略库' },
  { id: 'GS-012', leftId: 'CG-012', leftName: '融合套餐客户', leftCategory: '合约状态客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-007', rightName: '宽带融合推荐', rightCategory: '融合拓展类', strength: 1, source: '策略库' },
  { id: 'GS-013', leftId: 'CG-013', leftName: '新入网3月内客户', leftCategory: '生命周期客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 2, source: '策略库' },
  { id: 'GS-014', leftId: 'CG-014', leftName: '高ARPU低流量客户', leftCategory: '价值分层客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 2, source: '策略库' },
  { id: 'GS-015', leftId: 'CG-001', leftName: '高流量低资费客户', leftCategory: '行为特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-006', rightName: '流量包推荐', rightCategory: '流量运营类', strength: 2, source: '策略库' },
  { id: 'GS-016', leftId: 'CG-015', leftName: '校园客户', leftCategory: '行业特征客群', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 2, source: '策略库' },
];

const rootCauseStrategyRelations: Relation[] = [
  { id: 'RS-001', leftId: 'RC-001', leftName: '竞品资费低于本网同档位', leftCategory: '价格与竞争因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'RS-002', leftId: 'RC-001', leftName: '竞品资费低于本网同档位', leftCategory: '价格与竞争因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'RS-003', leftId: 'RC-004', leftName: '套餐流量容量不足', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'RS-004', leftId: 'RC-004', leftName: '套餐流量容量不足', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-006', rightName: '流量包推荐', rightCategory: '流量运营类', strength: 2, source: '策略库' },
  { id: 'RS-005', leftId: 'RC-003', leftName: '重大竞品事件/系统性问题', leftCategory: '价格与竞争因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-005', rightName: '携转预警挽留', rightCategory: '维系挽留类', strength: 3, source: '策略库' },
  { id: 'RS-006', leftId: 'RC-006', leftName: '网络覆盖不足', leftCategory: '网络与服务因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 3, source: '策略库' },
  { id: 'RS-007', leftId: 'RC-007', leftName: '续约触点不足', leftCategory: '触点与渠道因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-003', rightName: '到期续约挽留', rightCategory: '维系挽留类', strength: 2, source: '策略库' },
  { id: 'RS-008', leftId: 'RC-008', leftName: '产品功能与需求不匹配', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 2, source: '策略库' },
  { id: 'RS-009', leftId: 'RC-009', leftName: '渠道触达效率低', leftCategory: '触点与渠道因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 2, source: '策略库' },
  { id: 'RS-010', leftId: 'RC-010', leftName: '宽带产品竞争力不足', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-007', rightName: '宽带融合推荐', rightCategory: '融合拓展类', strength: 2, source: '策略库' },
  { id: 'RS-011', leftId: 'RC-011', leftName: '终端不支持/用户未开通', leftCategory: '终端与适配因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-004', rightName: '5G体验优化', rightCategory: '体验提升类', strength: 2, source: '策略库' },
  { id: 'RS-012', leftId: 'RC-001', leftName: '竞品资费低于本网同档位', leftCategory: '价格与竞争因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 3, source: '策略库' },
  { id: 'RS-013', leftId: 'RC-012', leftName: '服务质量下降', leftCategory: '网络与服务因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-008', rightName: '客户关怀回访', rightCategory: '服务提升类', strength: 3, source: '策略库' },
  { id: 'RS-014', leftId: 'RC-004', leftName: '套餐流量容量不足', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-002', rightName: '增值业务推荐', rightCategory: '价值提升类', strength: 2, source: '策略库' },
  { id: 'RS-015', leftId: 'RC-008', leftName: '产品功能与需求不匹配', leftCategory: '产品与套餐因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-001', rightName: '套餐升迁推荐（高流量低资费档位）', rightCategory: '套餐优化类', strength: 2, source: '策略库' },
  { id: 'RS-016', leftId: 'RC-002', leftName: '季节性波动/正常波动', leftCategory: '市场与政策因素', direction: '', lowerOperator: 'none', lowerValue: '', lowerUnit: '', upperOperator: 'none', upperValue: '', upperUnit: '', rightId: 'STR-003', rightName: '到期续约挽留', rightCategory: '维系挽留类', strength: 1, source: '策略库' },
];

const tabConfigs = [
  { value: 'indicator-rootcause', label: '指标 ↔ 根因', description: '来源于根因库的关联指标配置（只读）', data: indicatorRootCauseRelations, hasThreshold: true },
  { value: 'group-rootcause', label: '客群 ↔ 根因', description: '来源于根因库的关联客群配置（只读）', data: groupRootCauseRelations, hasThreshold: false },
  { value: 'indicator-strategy', label: '指标 ↔ 策略', description: '来源于策略库的关联指标配置（只读）', data: indicatorStrategyRelations, hasThreshold: true },
  { value: 'group-strategy', label: '客群 ↔ 策略', description: '来源于策略库的关联客群配置（只读）', data: groupStrategyRelations, hasThreshold: false },
  { value: 'rootcause-strategy', label: '根因 ↔ 策略', description: '来源于策略库的关联根因配置（只读）', data: rootCauseStrategyRelations, hasThreshold: false },
];

const PAGE_SIZE = 15;

export default function RelationManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('indicator-rootcause');
  const [searchText, setSearchText] = useState('');
  const [strengthFilter, setStrengthFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const currentConfig = tabConfigs.find((t) => t.value === activeTab);

  // Filter data based on search and strength filter
  const filteredData = useMemo(() => {
    if (!currentConfig) return [];
    return currentConfig.data.filter((r) => {
      const matchesSearch = !searchText ||
        r.leftName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.rightName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.leftId.toLowerCase().includes(searchText.toLowerCase()) ||
        r.rightId.toLowerCase().includes(searchText.toLowerCase());
      const matchesStrength = strengthFilter === 'all' || r.strength === Number(strengthFilter);
      return matchesSearch && matchesStrength;
    });
  }, [currentConfig, searchText, strengthFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when tab/filter changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchText('');
    setStrengthFilter('all');
  };

  const getEditUrl = (tab: string, rightId: string) => {
    if (tab === 'indicator-rootcause' || tab === 'group-rootcause') {
      return `/workspace/strategy/root-cause/edit?id=${rightId}`;
    }
    return `/workspace/strategy/library/edit?id=${rightId}`;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">关联关系管理</h1>
          <p className="text-sm text-gray-500 mt-1">全局视角查看各类关联关系，编辑操作请前往根因库或策略库</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              {tabConfigs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabConfigs.map((config) => (
              <TabsContent key={config.value} value={config.value} className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{config.description}</span>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        placeholder="搜索实体名称或ID..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                        className="pl-7 h-8 w-56 text-xs"
                      />
                    </div>
                    <Select value={strengthFilter} onValueChange={(v) => { setStrengthFilter(v); setCurrentPage(1); }}>
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue placeholder="关联强度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部强度</SelectItem>
                        <SelectItem value="1">1级-弱</SelectItem>
                        <SelectItem value="2">2级-中</SelectItem>
                        <SelectItem value="3">3级-强</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-400">共 {filteredData.length} 条</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>左端实体</TableHead>
                      <TableHead>方向</TableHead>
                      {config.hasThreshold && <TableHead>适用阈值范围</TableHead>}
                      <TableHead>右端实体</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead className="w-20">强度</TableHead>
                      <TableHead className="w-24">数据来源</TableHead>
                      <TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? paginatedData.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-xs">{r.leftId}</Badge>
                            <span className="text-sm">{r.leftName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {r.direction === 'up' && <Badge variant="secondary" className="text-xs gap-1"><ArrowUpRight className="w-3 h-3" />上升</Badge>}
                          {r.direction === 'down' && <Badge variant="secondary" className="text-xs gap-1"><ArrowDownRight className="w-3 h-3" />下降</Badge>}
                          {!r.direction && <span className="text-xs text-gray-400">—</span>}
                        </TableCell>
                        {config.hasThreshold && (
                          <TableCell>
                            <span className="text-sm font-medium">{formatThreshold(r)}</span>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-xs">{r.rightId}</Badge>
                            <span className="text-sm">{r.rightName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{r.rightCategory || r.leftCategory || '—'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{r.strength}级</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{r.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => router.push(getEditUrl(config.value, r.rightId))}
                          >
                            <ExternalLink className="w-3 h-3" />
                            编辑
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={config.hasThreshold ? 9 : 8} className="text-center text-gray-400 py-8">
                          暂无匹配数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      第 {currentPage} / {totalPages} 页，共 {filteredData.length} 条
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === currentPage ? 'default' : 'outline'}
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
