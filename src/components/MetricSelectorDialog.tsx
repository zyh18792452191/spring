'use client';

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Metric {
  id: number;
  code: string;
  name: string;
  type: string;
  isCustomerMetric: string;
  businessScenario: string;
  granularity: string;
  status: string;
}

interface MetricSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  filterType?: '同比' | '环比' | '全部'; // 过滤指标类型
  excludeIds?: number[]; // 排除的指标ID（如当前指标）
  onSelect: (metric: Metric) => void;
}

// 模拟指标数据
const mockMetrics: Metric[] = [
  { id: 101, code: 'ACTIVITY_PV_YOY', name: '活动PV同比（日）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 102, code: 'ACTIVITY_UV_YOY', name: '活动UV同比（日）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 103, code: 'SDJH_CYKHGM_YOY', name: '参与客户规模同比（日）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 104, code: 'SDJH_DYLWGM_YOY', name: '当月离网规模同比（日）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 105, code: 'ACTIVITY_PV_MOM', name: '活动PV环比（日）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 106, code: 'ACTIVITY_UV_MOM', name: '活动UV环比（日）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 107, code: 'SDJH_CYKHGM_MOM', name: '参与客户规模环比（日）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 108, code: 'SDJH_DYLWGM_MOM_DAY', name: '当月离网规模环比（日）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 109, code: 'ACTIVITY_PV_DAY', name: '活动PV（日）', type: '值', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 110, code: 'ACTIVITY_UV_DAY', name: '活动UV（日）', type: '值', isCustomerMetric: '否', businessScenario: '公众市场/客户运营/统一营销进度', granularity: '地州', status: '已生效' },
  { id: 111, code: 'ORDER_COUNT_YOY', name: '订单量同比（日）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/订单管理', granularity: '地州', status: '已生效' },
  { id: 112, code: 'ORDER_COUNT_MOM', name: '订单量环比（日）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/订单管理', granularity: '地州', status: '已生效' },
  { id: 113, code: 'REVENUE_YOY', name: '收入同比（月）', type: '同比', isCustomerMetric: '否', businessScenario: '公众市场/收入管理', granularity: '地州', status: '已生效' },
  { id: 114, code: 'REVENUE_MOM', name: '收入环比（月）', type: '环比', isCustomerMetric: '否', businessScenario: '公众市场/收入管理', granularity: '地州', status: '已生效' },
  { id: 115, code: 'USER_COUNT_YOY', name: '用户数同比（日）', type: '同比', isCustomerMetric: '是', businessScenario: '公众市场/客户运营', granularity: '地市', status: '已生效' },
  { id: 116, code: 'USER_COUNT_MOM', name: '用户数环比（日）', type: '环比', isCustomerMetric: '是', businessScenario: '公众市场/客户运营', granularity: '地市', status: '已生效' },
  { id: 117, code: 'ARPU_YOY', name: 'ARPU同比（月）', type: '同比', isCustomerMetric: '是', businessScenario: '公众市场/价值运营', granularity: '地州', status: '已生效' },
  { id: 118, code: 'ARPU_MOM', name: 'ARPU环比（月）', type: '环比', isCustomerMetric: '是', businessScenario: '公众市场/价值运营', granularity: '地州', status: '已生效' },
  { id: 119, code: 'CHURN_RATE_YOY', name: '流失率同比（月）', type: '同比', isCustomerMetric: '是', businessScenario: '公众市场/客户运营', granularity: '地州', status: '已生效' },
  { id: 120, code: 'CHURN_RATE_MOM', name: '流失率环比（月）', type: '环比', isCustomerMetric: '是', businessScenario: '公众市场/客户运营', granularity: '地州', status: '已生效' },
];

export default function MetricSelectorDialog({
  open,
  onOpenChange,
  title = '选择指标',
  filterType = '全部',
  excludeIds = [],
  onSelect,
}: MetricSelectorDialogProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterScenario, setFilterScenario] = useState<string>('全部');
  const [filterCustomerMetric, setFilterCustomerMetric] = useState<string>('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  // 获取所有业务场景（去重）
  const businessScenarios = useMemo(() => {
    const scenarios = new Set<string>();
    mockMetrics.forEach(m => scenarios.add(m.businessScenario));
    return ['全部', ...Array.from(scenarios)];
  }, []);

  // 过滤后的指标列表
  const filteredMetrics = useMemo(() => {
    let result = mockMetrics.filter(m => !excludeIds.includes(m.id));
    
    // 按类型过滤
    if (filterType !== '全部') {
      result = result.filter(m => m.type === filterType);
    }
    
    // 按搜索关键词过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(m => 
        m.code.toLowerCase().includes(keyword) || 
        m.name.toLowerCase().includes(keyword)
      );
    }
    
    // 按业务场景过滤
    if (filterScenario !== '全部') {
      result = result.filter(m => m.businessScenario === filterScenario);
    }
    
    // 按客群指标过滤
    if (filterCustomerMetric !== '全部') {
      result = result.filter(m => m.isCustomerMetric === filterCustomerMetric);
    }
    
    return result;
  }, [filterType, excludeIds, searchKeyword, filterScenario, filterCustomerMetric]);

  // 分页数据
  const totalPages = Math.ceil(filteredMetrics.length / pageSize);
  const paginatedMetrics = filteredMetrics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置筛选
  const handleReset = () => {
    setSearchKeyword('');
    setFilterScenario('全部');
    setFilterCustomerMetric('全部');
    setCurrentPage(1);
    setSelectedMetric(null);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedMetric) {
      onSelect(selectedMetric);
      onOpenChange(false);
      // 重置状态
      handleReset();
    }
  };

  // 关闭弹窗时重置
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* 筛选区域 */}
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* 搜索框 */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索指标编码或名称"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              {/* 业务场景筛选 */}
              <Select value={filterScenario} onValueChange={(v) => { setFilterScenario(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="业务场景" />
                </SelectTrigger>
                <SelectContent>
                  {businessScenarios.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 客群指标筛选 */}
              <Select value={filterCustomerMetric} onValueChange={(v) => { setFilterCustomerMetric(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="客群指标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  <SelectItem value="是">是</SelectItem>
                  <SelectItem value="否">否</SelectItem>
                </SelectContent>
              </Select>

              {/* 重置按钮 */}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-1" />
                重置
              </Button>
            </div>

            {/* 显示筛选结果数量 */}
            <div className="mt-2 text-sm text-gray-500">
              共找到 <span className="font-semibold text-blue-600">{filteredMetrics.length}</span> 个指标
            </div>
          </Card>

          {/* 表格区域 */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12">选择</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[160px]">指标编码</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[180px]">指标名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">类型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[200px]">业务场景</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">客群指标</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        暂无匹配的指标
                      </td>
                    </tr>
                  ) : (
                    paginatedMetrics.map((metric) => (
                      <tr
                        key={metric.id}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedMetric?.id === metric.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedMetric(metric)}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedMetric?.id === metric.id}
                            onCheckedChange={() => setSelectedMetric(metric)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{metric.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{metric.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                            metric.type === '同比' ? 'bg-orange-100 text-orange-700' :
                            metric.type === '环比' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {metric.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{metric.businessScenario}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{metric.isCustomerMetric}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            {metric.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">每页显示</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  <ArrowUp className="w-4 h-4 -rotate-90" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ArrowUp className="w-4 h-4 rotate-[-90deg]" />
                </button>

                <span className="text-sm text-gray-600 px-2">
                  第 {currentPage} / {totalPages || 1} 页
                </span>

                <button
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                >
                  <ArrowUp className="w-4 h-4 rotate-90" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  <ArrowDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleConfirm}
            disabled={!selectedMetric}
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
