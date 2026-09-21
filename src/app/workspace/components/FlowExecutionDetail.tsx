'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * 客户级执行记录（网格通6.2.2逐条触客结果回传）
 * 
 * IOP只返回聚合统计（目标客户数/触达客户数/营销成功客户数/触达率/营销成功率），
 * 不返回客户级明细，因此执行记录表只有网格通数据。
 */

// 网格通执行明细行（基于网格通6.2.2逐条触客结果回传）
interface WanggetongExecutionRow {
  customerName: string;     // 客户姓名 (6.2.2 customerName)
  phone: string;            // 手机号 (6.2.2 phone)
  isCall: string;           // 是否呼叫 (6.2.2 isCall) - 是/否
  callResult: string;       // 呼叫结果 (6.2.2 callStat) - 呼通/未呼通
  callDuration: string;     // 通话时长 (6.2.2 callDuration) - 秒
  registeredStatus: string; // 登记状态 (6.2.2 registeredStatus) - 成功/未呼通/用户犹豫/用户拒绝
  executionTime: string;    // 执行时间 (6.2.2 execTime)
}

// 网格通登记状态颜色映射
const registeredStatusColorMap: Record<string, string> = {
  '成功': 'bg-green-100 text-green-700',
  '未呼通': 'bg-gray-100 text-gray-700',
  '用户犹豫': 'bg-yellow-100 text-yellow-700',
  '用户拒绝': 'bg-red-100 text-red-700',
};

interface FlowExecutionDetailProps {
  data: WanggetongExecutionRow[];
}

export function FlowExecutionDetail({ data }: FlowExecutionDetailProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无执行记录
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">序号</TableHead>
            <TableHead>客户姓名</TableHead>
            <TableHead>手机号</TableHead>
            <TableHead>是否呼叫</TableHead>
            <TableHead>呼叫结果</TableHead>
            <TableHead>通话时长</TableHead>
            <TableHead>登记状态</TableHead>
            <TableHead>执行时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-center">{idx + 1}</TableCell>
              <TableCell>{row.customerName}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>
                <Badge variant="outline" className={row.isCall === '是' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}>
                  {row.isCall}
                </Badge>
              </TableCell>
              <TableCell>{row.callResult || '-'}</TableCell>
              <TableCell>{row.callDuration || '-'}</TableCell>
              <TableCell>
                {row.registeredStatus && row.registeredStatus !== '-' ? (
                  <Badge variant="outline" className={registeredStatusColorMap[row.registeredStatus] || 'bg-gray-100 text-gray-700'}>
                    {row.registeredStatus}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell>{row.executionTime || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
