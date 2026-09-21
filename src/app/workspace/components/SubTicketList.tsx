'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * 子单列表 - 统一组件
 * 
 * 不区分IOP/网格通，统一列定义：
 * 子单编号 | 执行状态 | 地州 | 区县 | 网格 | 目标客户数 | 执行人 | 完成率 | 操作
 * 
 * 删除了原IOP的"渠道"列（渠道是活动级概念，不是子单级）
 * 删除了原IOP的"触达客户数/转化数"和网格通的"呼通数/营销成功数"（这些是执行进度数据）
 */

export interface SubTicketItem {
  id: number;
  subOrderId: string;          // 子单编号
  executionStatus: string;     // 执行状态：待接收/执行中/已完成/已逾期
  region?: string;             // 区域（地州>区县>网格）
  city?: string;               // 地州
  district?: string;           // 区县
  grid?: string;               // 网格
  targetCount?: number;        // 目标客户数（派发时确定）
  executor: string;            // 执行人
  completionRate?: string;     // 完成率
  receiptStatus?: string;      // 回单状态
  status: string;              // 状态（兼容字段）
}

interface SubTicketListProps {
  data: SubTicketItem[];
  /** 是否显示区域列（商机调度类显示地州/区县/网格，三大调度只显示地州） */
  showRegionDetail?: boolean;
  /** 是否显示目标客户数列 */
  showTargetCount?: boolean;
  /** 是否显示完成率列 */
  showCompletionRate?: boolean;
  onGoToSubTicketDetail: (id: number) => void;
}

// 执行状态样式
const getExecutionStatusBadge = (status: string) => {
  if (status === '已完成') return <Badge variant="default" className="text-xs bg-green-600">{status}</Badge>;
  if (status === '执行中') return <Badge variant="default" className="text-xs bg-blue-500">{status}</Badge>;
  if (status === '已逾期') return <Badge variant="default" className="text-xs bg-red-500">{status}</Badge>;
  return <Badge variant="secondary" className="text-xs">{status}</Badge>; // 待接收/待执行
};

export function SubTicketList({ 
  data, 
  showRegionDetail = true, 
  showTargetCount = true, 
  showCompletionRate = true,
  onGoToSubTicketDetail 
}: SubTicketListProps) {
  return (
    <div className="overflow-x-auto mb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">序号</TableHead>
            <TableHead>子单编号</TableHead>
            <TableHead>执行状态</TableHead>
            {showRegionDetail ? (
              <>
                <TableHead>地州</TableHead>
                <TableHead>区县</TableHead>
                <TableHead>网格</TableHead>
              </>
            ) : (
              <TableHead>地州</TableHead>
            )}
            {showTargetCount && (
              <TableHead className="text-center">目标客户数</TableHead>
            )}
            <TableHead>执行人</TableHead>
            {showCompletionRate && (
              <TableHead className="text-center">完成率</TableHead>
            )}
            <TableHead className="text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((sub, index) => (
            <TableRow key={sub.id || index}>
              <TableCell className="text-center">
                <Badge variant="outline" className="text-xs">{index + 1}</Badge>
              </TableCell>
              <TableCell className="font-medium text-blue-600">{sub.subOrderId}</TableCell>
              <TableCell>{getExecutionStatusBadge(sub.executionStatus)}</TableCell>
              {showRegionDetail ? (
                <>
                  <TableCell>{sub.city || '-'}</TableCell>
                  <TableCell>{sub.district || '-'}</TableCell>
                  <TableCell>{sub.grid || '-'}</TableCell>
                </>
              ) : (
                <TableCell>{sub.city || sub.region || '-'}</TableCell>
              )}
              {showTargetCount && (
                <TableCell className="text-center">{sub.targetCount?.toLocaleString() ?? '-'}</TableCell>
              )}
              <TableCell>{sub.executor}</TableCell>
              {showCompletionRate && (
                <TableCell className="text-center">{sub.completionRate ?? '-'}</TableCell>
              )}
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" onClick={() => onGoToSubTicketDetail(sub.id)} className="text-blue-600 hover:underline text-sm">
                  查看
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
