'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from '@/components/ui/pagination';

// 区域调度统计接口
interface RegionDispatchStats {
  region: string;
  totalOrders: number; // 总工单数
  inProgressOrders: number; // 在途工单数
  completedOrders: number; // 已完成工单数
  timeoutOrders: number; // 超时工单数
  averageDuration: string; // 平均处理时长
  completionRate: string; // 完成率
}

// 中国移动品牌色
const COLORS = {
  primary: '#0085D0',
  secondary: '#60B3E2',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#6B7280',
};

export default function DispatchTrackingProvinceStats() {
  const router = useRouter();
  const [provinceStats, setProvinceStats] = useState<RegionDispatchStats[]>([]);
  const [loading, setLoading] = useState(true);

  // 点击跳转到工单综合查询页
  const handleStatClick = (province: string, status: string) => {
    // status: total/progressing/completed/timeout
    let statusFilter = '';
    if (status === 'total') {
      statusFilter = ''; // 不筛选状态，显示全部
    } else if (status === 'progressing') {
      statusFilter = 'processing';
    } else if (status === 'completed') {
      statusFilter = 'completed';
    } else if (status === 'timeout') {
      statusFilter = 'timeout';
    }

    const params = new URLSearchParams();
    params.set('from', 'overview');
    params.set('tab', 'build_area');
    params.set('province', province);
    if (statusFilter) {
      params.set('status', statusFilter);
    }

    router.push(`/portal/capability/dispatch/work-order-comprehensive?${params.toString()}`);
  };

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 加载地州调度统计数据
  useEffect(() => {
    loadProvinceDispatchStats();
  }, []);

  const loadProvinceDispatchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dispatch/tracking/province-stats');
      const result = await response.json();

      if (result.success && result.data) {
        setProvinceStats(result.data);
      } else {
        // 使用模拟数据 - 16地市分公司数据
        const mockStats: RegionDispatchStats[] = [
          { region: '乌鲁木齐', totalOrders: 45, inProgressOrders: 8, completedOrders: 22, timeoutOrders: 3, averageDuration: '2.5小时', completionRate: '88.9%' },
          { region: '克拉玛依', totalOrders: 52, inProgressOrders: 10, completedOrders: 24, timeoutOrders: 3, averageDuration: '2.8小时', completionRate: '86.5%' },
          { region: '吐鲁番', totalOrders: 35, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.4小时', completionRate: '90.5%' },
          { region: '哈密', totalOrders: 42, inProgressOrders: 7, completedOrders: 22, timeoutOrders: 2, averageDuration: '2.4小时', completionRate: '90.5%' },
          { region: '昌吉', totalOrders: 38, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.6小时', completionRate: '89.5%' },
          { region: '博州', totalOrders: 28, inProgressOrders: 4, completedOrders: 16, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '91.4%' },
          { region: '巴州', totalOrders: 32, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '90.6%' },
          { region: '阿克苏', totalOrders: 30, inProgressOrders: 5, completedOrders: 16, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '91.4%' },
          { region: '克州', totalOrders: 22, inProgressOrders: 4, completedOrders: 12, timeoutOrders: 1, averageDuration: '2.3小时', completionRate: '85.7%' },
          { region: '喀什', totalOrders: 36, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.5小时', completionRate: '88.9%' },
          { region: '和田', totalOrders: 26, inProgressOrders: 4, completedOrders: 14, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '89.5%' },
          { region: '伊犁', totalOrders: 40, inProgressOrders: 7, completedOrders: 22, timeoutOrders: 2, averageDuration: '2.6小时', completionRate: '87.5%' },
          { region: '塔城', totalOrders: 24, inProgressOrders: 4, completedOrders: 13, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '89.4%' },
          { region: '阿勒泰', totalOrders: 20, inProgressOrders: 3, completedOrders: 11, timeoutOrders: 1, averageDuration: '2.0小时', completionRate: '87.2%' },
          { region: '奎屯', totalOrders: 33, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 2, averageDuration: '2.3小时', completionRate: '88.6%' },
          { region: '石河子', totalOrders: 30, inProgressOrders: 5, completedOrders: 17, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '89.0%' },
        ];
        setProvinceStats(mockStats);
      }
    } catch (error) {
      console.error('加载区域调度统计失败:', error);
      // 使用模拟数据
      const mockStats: RegionDispatchStats[] = [
          { region: '乌鲁木齐', totalOrders: 45, inProgressOrders: 8, completedOrders: 22, timeoutOrders: 3, averageDuration: '2.5小时', completionRate: '88.9%' },
          { region: '克拉玛依', totalOrders: 52, inProgressOrders: 10, completedOrders: 24, timeoutOrders: 3, averageDuration: '2.8小时', completionRate: '86.5%' },
          { region: '吐鲁番', totalOrders: 35, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.4小时', completionRate: '90.5%' },
          { region: '哈密', totalOrders: 42, inProgressOrders: 7, completedOrders: 22, timeoutOrders: 2, averageDuration: '2.4小时', completionRate: '90.5%' },
          { region: '昌吉', totalOrders: 38, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.6小时', completionRate: '89.5%' },
          { region: '博州', totalOrders: 28, inProgressOrders: 4, completedOrders: 16, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '91.4%' },
          { region: '巴州', totalOrders: 32, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '90.6%' },
          { region: '阿克苏', totalOrders: 30, inProgressOrders: 5, completedOrders: 16, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '91.4%' },
          { region: '克州', totalOrders: 22, inProgressOrders: 4, completedOrders: 12, timeoutOrders: 1, averageDuration: '2.3小时', completionRate: '85.7%' },
          { region: '喀什', totalOrders: 36, inProgressOrders: 6, completedOrders: 20, timeoutOrders: 2, averageDuration: '2.5小时', completionRate: '88.9%' },
          { region: '和田', totalOrders: 26, inProgressOrders: 4, completedOrders: 14, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '89.5%' },
          { region: '伊犁', totalOrders: 40, inProgressOrders: 7, completedOrders: 22, timeoutOrders: 2, averageDuration: '2.6小时', completionRate: '87.5%' },
          { region: '塔城', totalOrders: 24, inProgressOrders: 4, completedOrders: 13, timeoutOrders: 1, averageDuration: '2.1小时', completionRate: '89.4%' },
          { region: '阿勒泰', totalOrders: 20, inProgressOrders: 3, completedOrders: 11, timeoutOrders: 1, averageDuration: '2.0小时', completionRate: '87.2%' },
          { region: '奎屯', totalOrders: 33, inProgressOrders: 5, completedOrders: 18, timeoutOrders: 2, averageDuration: '2.3小时', completionRate: '88.6%' },
          { region: '石河子', totalOrders: 30, inProgressOrders: 5, completedOrders: 17, timeoutOrders: 1, averageDuration: '2.2小时', completionRate: '89.0%' },
        ];
      setProvinceStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  // 计算分页数据
  const totalPages = Math.ceil(provinceStats.length / pageSize);
  const paginatedData = provinceStats.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* 区域调度统计表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">区域</TableHead>
                <TableHead className="text-center font-semibold">总工单数</TableHead>
                <TableHead className="text-center font-semibold text-blue-700">在途</TableHead>
                <TableHead className="text-center font-semibold text-green-700">已完成</TableHead>
                <TableHead className="text-center font-semibold text-red-700">超时</TableHead>
                <TableHead className="text-center font-semibold">平均处理时长</TableHead>
                <TableHead className="text-center font-semibold">完成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((stat) => (
                <TableRow key={stat.region} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{stat.region}</TableCell>
                  <TableCell 
                    className="text-center font-semibold cursor-pointer hover:text-blue-600 hover:underline" 
                    onClick={() => handleStatClick(stat.region, 'total')}
                  >
                    {stat.totalOrders}
                  </TableCell>
                  <TableCell 
                    className="text-center text-blue-700 font-medium cursor-pointer hover:text-blue-900 hover:underline" 
                    onClick={() => handleStatClick(stat.region, 'progressing')}
                  >
                    {stat.inProgressOrders}
                  </TableCell>
                  <TableCell 
                    className="text-center text-green-700 font-medium cursor-pointer hover:text-green-900 hover:underline" 
                    onClick={() => handleStatClick(stat.region, 'completed')}
                  >
                    {stat.completedOrders}
                  </TableCell>
                  <TableCell 
                    className="text-center text-red-700 font-medium cursor-pointer hover:text-red-900 hover:underline" 
                    onClick={() => handleStatClick(stat.region, 'timeout')}
                  >
                    {stat.timeoutOrders}
                  </TableCell>
                  <TableCell className="text-center text-gray-600">{stat.averageDuration}</TableCell>
                  <TableCell className="text-center font-semibold">{stat.completionRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {provinceStats.length > pageSize && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
