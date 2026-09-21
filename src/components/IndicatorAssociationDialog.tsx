'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { businessScenarios } from '@/lib/business-scenarios';

// 指标数据类型
interface IndicatorData {
  id: number;
  code: string;
  name: string;
  businessScenario: string;
  type: string;
  minGranularity: string;
  responsibleDept: string;
}

// 模拟指标数据
const mockIndicatorData: IndicatorData[] = [
  { id: 1, code: 'KM6096_YOY', name: '流量饱和度同比', businessScenario: '公众市场 / 客户运营 / 全球通', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 2, code: 'KM6097_YOY', name: '上月全球通宽带客户保有率', businessScenario: '公众市场 / 客户运营 / 全球通', type: '同比', minGranularity: '网格', responsibleDept: '新疆移动-超管' },
  { id: 3, code: 'KM6098_YOY', name: '全球通客户价值保有率', businessScenario: '公众市场 / 客户运营 / 全球通', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 4, code: 'KM6099_YOY', name: '全球通客户规模保有率', businessScenario: '公众市场 / 客户运营 / 全球通', type: '同比', minGranularity: '网格', responsibleDept: '新疆移动-超管' },
  { id: 5, code: 'KM6100_YOY', name: '离网率', businessScenario: '公众市场 / 客户运营 / 离网维系', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 6, code: 'KM6101_YOY', name: '保有率', businessScenario: '公众市场 / 客户运营 / 离网维系', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 7, code: 'KM6102_YOY', name: 'ARPU值', businessScenario: '公众市场 / 客户运营 / 中高端', type: '同比', minGranularity: '网格', responsibleDept: '新疆移动-超管' },
  { id: 8, code: 'KM6103_YOY', name: '收入贡献', businessScenario: '公众市场 / 客户运营 / 中高端', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 9, code: 'KM6104_YOY', name: '新增客户规模', businessScenario: '公众市场 / 市场运营 / 新入网', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 10, code: 'KM6105_YOY', name: '漫游收入', businessScenario: '公众市场 / 国际运营 / 漫游业务', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 11, code: 'KM6106_YOY', name: '5G渗透率', businessScenario: '公众市场 / 产品运营 / 数据产品', type: '同比', minGranularity: '网格', responsibleDept: '新疆移动-超管' },
  { id: 12, code: 'KM6107_YOY', name: '流量使用', businessScenario: '公众市场 / 产品运营 / 数据产品', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 13, code: 'KM6108_YOY', name: 'test-0303客户群指标', businessScenario: '公众市场 / 客户运营 / 离网维系', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 14, code: 'KM6109_YOY', name: '流失率', businessScenario: '公众市场 / 客户运营 / 中高端流失预警', type: '同比', minGranularity: '地市', responsibleDept: '新疆移动-超管' },
  { id: 15, code: 'KM6110_YOY', name: '预警数量', businessScenario: '公众市场 / 客户运营 / 中高端流失预警', type: '同比', minGranularity: '网格', responsibleDept: '新疆移动-超管' },
];

// 业务场景选项
const getScenarioOptions = () => {
  const result: string[] = ['全部'];
  businessScenarios.forEach(level1 => {
    if (level1.children) {
      level1.children.forEach(level2 => {
        if (level2.children) {
          level2.children.forEach(level3 => {
            result.push(`${level1.name} / ${level2.name} / ${level3.name}`);
          });
        } else {
          result.push(`${level1.name} / ${level2.name}`);
        }
      });
    } else {
      result.push(level1.name);
    }
  });
  return result;
};

interface IndicatorAssociationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentId: number | null;
  onSave: (selectedIndicators: string[]) => void;
}

export default function IndicatorAssociationDialog({
  open,
  onOpenChange,
  segmentId,
  onSave,
}: IndicatorAssociationDialogProps) {
  const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 378; // 模拟总数

  // 筛选条件
  const [filterScenario, setFilterScenario] = useState('全部');
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');

  const scenarioOptions = getScenarioOptions();

  // 加载已关联的指标
  useEffect(() => {
    if (open && segmentId) {
      // 模拟加载已关联指标
      const mockRelatedIndicators = segmentId === 1 ? [13] : [5, 6]; // 假设的数据
      setSelectedIndicatorIds(mockRelatedIndicators);
    }
  }, [open, segmentId]);

  // 过滤数据
  const filteredData = mockIndicatorData.filter(item => {
    if (filterScenario !== '全部' && item.businessScenario !== filterScenario) return false;
    if (filterName && !item.name.includes(filterName)) return false;
    if (filterCode && !item.code.includes(filterCode)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndicatorIds(filteredData.map(item => item.id));
    } else {
      setSelectedIndicatorIds([]);
    }
  };

  const handleSelectIndicator = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIndicatorIds(prev => [...prev, id]);
    } else {
      setSelectedIndicatorIds(prev => prev.filter(indId => indId !== id));
    }
  };

  const handleReset = () => {
    setFilterScenario('全部');
    setFilterName('');
    setFilterCode('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleConfirm = () => {
    const selectedIndicatorNames = mockIndicatorData
      .filter(ind => selectedIndicatorIds.includes(ind.id))
      .map(ind => ind.name);
    onSave(selectedIndicatorNames);
  };

  const isAllSelected = selectedIndicatorIds.length === filteredData.length && filteredData.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[85vh] overflow-hidden flex flex-col w-[1100px]" 
        disableMaxWidth={true}
      >
        <DialogHeader>
          <DialogTitle>指标选择</DialogTitle>
        </DialogHeader>

        {/* 筛选区 */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filterScenario} onValueChange={setFilterScenario}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="业务场景" />
              </SelectTrigger>
              <SelectContent>
                {scenarioOptions.slice(0, 15).map((scenario) => (
                  <SelectItem key={scenario} value={scenario}>{scenario}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="指标名称"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-40 bg-white"
            />

            <Input
              placeholder="指标编码"
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="w-40 bg-white"
            />

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-1" />
                重置
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-1" />
                查询
              </Button>
            </div>
          </div>
        </div>

        {/* 表格区 */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[120px]">指标编码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[150px]">指标名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[180px]">业务场景</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[80px]">指标类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[100px]">指标最小粒度</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[140px]">指标责任部门-责任人</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIndicatorIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectIndicator(item.id, !!checked)}
                      className="border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900" title={item.name}>
                    <div className="max-w-[140px] truncate">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600" title={item.businessScenario}>
                    <div className="max-w-[170px] truncate">{item.businessScenario}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.minGranularity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.responsibleDept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页区 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            共 <span className="font-semibold">{totalItems}</span> 项数据，
            已选择 <span className="text-blue-600 font-semibold">{selectedIndicatorIds.length}</span> 项
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirm}>
            <Check className="w-4 h-4 mr-1" />
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
