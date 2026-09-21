'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 标签配置数据类型（包含选中后的配置）
interface TagConfig {
  valueTypes: string[];
  tagValues: string[];
  isAnalysisFeature: string[];
}

// 标签数据类型
interface TagData {
  id: number;
  code: string;
  name: string;
  group: string;
  type: string;
  businessDefinition: string;
  valueType: string; // 标签取值类型
}

// 标签取值选项（模拟数据）
const tagValueOptions: Record<string, string[]> = {
  'u_three': ['是', '否'],
  'u_t3': ['是', '否'],
  'u_sex': ['男', '女', '未知'],
  'bh_level': ['高', '中', '低'],
  'current_arpu': ['0-50', '50-100', '100-200', '200以上'],
  'night_traffic': ['是', '否'],
  'roaming_flag': ['是', '否'],
  '5g_user': ['是', '否'],
  'youth': ['是', '否'],
  'silver': ['是', '否'],
};

// 分析特征选项
const analysisFeatureOptions = ['是', '否'];

// 模拟标签数据
const mockTagData: TagData[] = [
  { id: 1, code: 'u_three', name: '近三月降档情况', group: '通信行为', type: '固定标签', businessDefinition: '近三月降档情况', valueType: '枚举' },
  { id: 2, code: 'u_t3', name: '是否合约T-3月内到期', group: '通信行为', type: '固定标签', businessDefinition: '是否合约T-3月内到期', valueType: '枚举' },
  { id: 3, code: 'u_sex', name: '性别', group: '通信行为', type: '固定标签', businessDefinition: '性别', valueType: '枚举' },
  { id: 4, code: 'bh_level', name: '饱和度分档', group: '通信行为', type: '固定标签', businessDefinition: '饱和度分档', valueType: '枚举' },
  { id: 5, code: 'current_arpu', name: '用户ARPU值', group: '消费行为', type: '固定标签', businessDefinition: '用户ARPU值', valueType: '枚举' },
  { id: 6, code: 'night_traffic', name: '夜间高流量用户', group: '通信行为', type: '自定义标签', businessDefinition: '夜间流量使用占比超过50%的用户', valueType: '枚举' },
  { id: 7, code: 'roaming_flag', name: '国际漫游', group: '通信行为', type: '固定标签', businessDefinition: '有国际漫游使用记录', valueType: '枚举' },
  { id: 8, code: '5g_user', name: '5G用户', group: '通信行为', type: '固定标签', businessDefinition: '已办理5G套餐', valueType: '枚举' },
  { id: 9, code: 'youth', name: '青年市场', group: '细分市场', type: '自定义标签', businessDefinition: '年龄在18-35岁', valueType: '枚举' },
  { id: 10, code: 'silver', name: '银发市场', group: '细分市场', type: '自定义标签', businessDefinition: '年龄在60岁以上', valueType: '枚举' },
];

interface TagAssociationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentId: number | null;
  onSave: (selectedTags: string[]) => void;
}

export default function TagAssociationDialog({
  open,
  onOpenChange,
  segmentId,
  onSave,
}: TagAssociationDialogProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = mockTagData.length;

  // 标签配置数据（存储每个选中标签的配置）
  const [tagConfigs, setTagConfigs] = useState<Record<number, TagConfig>>({});

  // 筛选条件
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');

  // 加载已关联的标签
  useEffect(() => {
    if (open) {
      // 初始化所有标签的配置
      const initialConfigs: Record<number, TagConfig> = {};
      mockTagData.forEach(tag => {
        initialConfigs[tag.id] = {
          valueTypes: [],
          tagValues: [],
          isAnalysisFeature: [],
        };
      });
      setTagConfigs(initialConfigs);
      
      if (segmentId) {
        // 模拟加载已关联标签
        const mockRelatedTags = segmentId === 1 ? [4, 6] : [4]; // 假设的数据
        setSelectedTagIds(mockRelatedTags);
      } else {
        setSelectedTagIds([]);
      }
    }
  }, [open, segmentId]);

  // 过滤数据
  const filteredData = mockTagData.filter(item => {
    if (filterName && !item.name.includes(filterName)) return false;
    if (filterCode && !item.code.includes(filterCode)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTagIds(filteredData.map(item => item.id));
    } else {
      setSelectedTagIds([]);
    }
  };

  const handleSelectTag = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, id]);
    } else {
      setSelectedTagIds(prev => prev.filter(tagId => tagId !== id));
    }
  };

  // 更新标签配置
  const updateTagConfig = (tagId: number, field: keyof TagConfig, values: string[]) => {
    setTagConfigs(prev => ({
      ...prev,
      [tagId]: {
        ...prev[tagId],
        [field]: values,
      },
    }));
  };

  const handleReset = () => {
    setFilterName('');
    setFilterCode('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleConfirm = () => {
    const selectedTagNames = mockTagData
      .filter(tag => selectedTagIds.includes(tag.id))
      .map(tag => tag.name);
    onSave(selectedTagNames);
  };

  const isAllSelected = selectedTagIds.length === filteredData.length && filteredData.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[85vh] overflow-hidden flex flex-col w-[1100px]" 
        disableMaxWidth={true}
      >
        <DialogHeader>
          <DialogTitle>标签选择</DialogTitle>
        </DialogHeader>

        {/* 筛选区 */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="标签名称"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-40 bg-white"
            />

            <Input
              placeholder="标签编码"
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
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-300"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">标签编码</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">标签名称</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">业务口径</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">标签取值类型</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">标签取值</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">是否作为分析特征</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selectedTagIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectTag(item.id, !!checked)}
                      className="border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-mono">{item.code}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-600" title={item.businessDefinition}>
                    <div className="max-w-[150px] truncate">{item.businessDefinition}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{item.valueType}</td>
                  <td className="px-3 py-2">
                    <Select
                      value={tagConfigs[item.id]?.tagValues[0] || ''}
                      onValueChange={(value) => updateTagConfig(item.id, 'tagValues', [value])}
                    >
                      <SelectTrigger className="h-8 bg-gray-100 border-0 text-xs">
                        <SelectValue placeholder="请选择(多选)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tagValueOptions[item.code] || []).map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={tagConfigs[item.id]?.isAnalysisFeature[0] || ''}
                      onValueChange={(value) => updateTagConfig(item.id, 'isAnalysisFeature', [value])}
                    >
                      <SelectTrigger className="h-8 bg-gray-100 border-0 text-xs">
                        <SelectValue placeholder="请选择(多选)" />
                      </SelectTrigger>
                      <SelectContent>
                        {analysisFeatureOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页区 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            共 <span className="font-semibold">{filteredData.length}</span> 项数据，
            已选择 <span className="text-blue-600 font-semibold">{selectedTagIds.length}</span> 项
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
