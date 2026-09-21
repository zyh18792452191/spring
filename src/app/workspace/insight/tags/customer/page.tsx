'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Trash2, Upload, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import ImportTagDialog from '@/components/ImportTagDialog';

// 模拟数据
const mockData = [
  {
    id: 1,
    code: 'u_three',
    name: '近三月降档情况',
    tagType: '固定标签',
    group: '通信行为',
    businessDefinition: '近三月降档情况',
    technicalDefinition: '近三月降档情况',
    valueType: '枚举',
    values: '3:T-3月降档\n2:T-2月降档\n1:T-1月降档',
  },
  {
    id: 2,
    code: 'u_t3',
    name: '是否合约T-3月内到期',
    tagType: '固定标签',
    group: '通信行为',
    businessDefinition: '是否合约T-3月内到期',
    technicalDefinition: '是否合约T-3月内到期',
    valueType: '枚举',
    values: '1:是\n0:否',
  },
  {
    id: 3,
    code: 'u_sex',
    name: '性别',
    tagType: '固定标签',
    group: '通信行为',
    businessDefinition: '性别',
    technicalDefinition: '性别',
    valueType: '枚举',
    values: '1:男\n2:女',
  },
  {
    id: 4,
    code: '测试标签',
    name: '测试',
    tagType: '固定标签',
    group: '投诉行为',
    businessDefinition: '1',
    technicalDefinition: '1',
    valueType: '区间',
    values: '1:1',
  },
  {
    id: 5,
    code: 'percentage',
    name: '测试百分比',
    tagType: '固定标签',
    group: '投诉行为',
    businessDefinition: '11',
    technicalDefinition: '11',
    valueType: '--',
    values: '测试0:000',
  },
  {
    id: 6,
    code: 'test_wt_001',
    name: '测试枚举',
    tagType: '固定标签',
    group: '通信行为',
    businessDefinition: '111111',
    technicalDefinition: '111111',
    valueType: '枚举',
    values: '1:1',
  },
  {
    id: 7,
    code: '0303testbiaoqian',
    name: '测试布尔',
    tagType: '自定义标签',
    group: '投诉行为',
    businessDefinition: '0303testbiaoqian',
    technicalDefinition: '0303testbiaoqian',
    valueType: '--',
    values: '1:是\n0:否',
  },
  {
    id: 8,
    code: 't_prod_down_flag',
    name: '测试数值',
    tagType: '自定义标签',
    group: '潜力属性',
    businessDefinition: '月预警异动用户-套餐降档',
    technicalDefinition: '月预警异动用户-套餐降档',
    valueType: '--',
    values: '--',
  },
  {
    id: 9,
    code: 'bh_level',
    name: '测试区间',
    tagType: '固定标签',
    group: '通信行为',
    businessDefinition: '饱和度分档',
    technicalDefinition: '饱和度分档',
    valueType: '区间',
    values: '--',
  },
  {
    id: 10,
    code: 'current_arpu',
    name: '用户ARPU值',
    tagType: '固定标签',
    group: '消费行为',
    businessDefinition: '用户ARPU值',
    technicalDefinition: '用户ARPU值',
    valueType: '区间',
    values: '0:<50元\n1:50-100元\n2:100-150元\n3:150-200元\n4:200元以上',
  },
];

// 标签分组选项
const tagGroups = ['全部', '通信行为', '投诉行为', '潜力属性', '消费行为'];

// 标签类型选项
const tagTypes = ['全部', '固定标签', '自定义标签'];

export default function CustomerTagManagementPage() {
  const router = useRouter();
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems] = useState(54);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // 筛选条件
  const [filterGroup, setFilterGroup] = useState('全部');
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterType, setFilterType] = useState('全部');

  const totalPages = Math.ceil(totalItems / pageSize);

  // 过滤数据
  const filteredData = mockData.filter(item => {
    if (filterGroup !== '全部' && item.group !== filterGroup) return false;
    if (filterType !== '全部' && item.tagType !== filterType) return false;
    if (filterName && !item.name.includes(filterName)) return false;
    if (filterCode && !item.code.includes(filterCode)) return false;
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredData.map(item => item.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(prev => [...prev, id]);
    } else {
      setSelectedRowIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleReset = () => {
    setFilterGroup('全部');
    setFilterName('');
    setFilterCode('');
    setFilterType('全部');
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    // TODO: 实现删除逻辑
    console.log('删除标签:', id);
  };

  const isAllSelected = selectedRowIds.length === filteredData.length && filteredData.length > 0;
  const isSomeSelected = selectedRowIds.length > 0 && selectedRowIds.length < filteredData.length;

  // 渲染标签取值（换行显示）
  const renderTagValues = (values: string) => {
    if (values === '--') return <span className="text-gray-400">--</span>;
    const lines = values.split('\n');
    return (
      <div className="text-xs text-gray-600">
        {lines.map((line, index) => (
          <div key={index} className="whitespace-nowrap">{line}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* 顶部筛选区 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="标签分组" />
            </SelectTrigger>
            <SelectContent>
              {tagGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="标签名称"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-40"
          />

          <Input
            placeholder="标签编码"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="w-40"
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="标签类型" />
            </SelectTrigger>
            <SelectContent>
              {tagTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-1" />
              重置
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1" />
              搜索
            </Button>
          </div>
        </div>
      </Card>

      {/* 操作按钮区 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          已选择 <span className="text-blue-600 font-semibold">{selectedRowIds.length}</span> 项
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
            onClick={() => router.push('/workspace/insight/tags/customer/new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            新增
          </Button>
          <Button variant="outline" size="sm" disabled={selectedRowIds.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" />
            批量删除
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-1" />
            批量导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      {/* 表格区域 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12 sticky left-0 bg-gray-50 z-20">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[140px]">标签编码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[140px]">标签名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[90px]">标签类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[90px]">标签分组</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[160px]">业务口径</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[160px]">技术口径</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[100px]">标签取值类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[200px]">标签取值</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap sticky right-0 bg-gray-50 z-20 min-w-[120px] shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                    <Checkbox
                      checked={selectedRowIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                      className="border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono whitespace-nowrap">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                      item.tagType === '固定标签' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.tagType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.group}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" title={item.businessDefinition}>
                    <div className="max-w-[150px] truncate">{item.businessDefinition}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" title={item.technicalDefinition}>
                    <div className="max-w-[150px] truncate">{item.technicalDefinition}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                      item.valueType === '枚举' 
                        ? 'bg-orange-100 text-orange-700' 
                        : item.valueType === '区间'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.valueType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {renderTagValues(item.values)}
                  </td>
                  <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <button 
                        className="text-red-500 text-sm hover:text-red-600 hover:underline"
                        onClick={() => handleDelete(item.id)}
                      >
                        删除
                      </button>
                      <button 
                        className="text-blue-500 text-sm hover:text-blue-600 hover:underline"
                        onClick={() => router.push(`/workspace/insight/tags/customer/${item.id}/edit`)}
                      >
                        编辑
                      </button>
                      <button 
                        className="text-blue-500 text-sm hover:text-blue-600 hover:underline"
                        onClick={() => router.push(`/workspace/insight/tags/customer/${item.id}`)}
                      >
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 底部分页 */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          共 <span className="font-semibold">{totalItems}</span> 项数据
        </div>

        <div className="flex items-center gap-4">
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
              onClick={() => setCurrentPage(1)}
            >
              <ArrowUp className="w-4 h-4 -rotate-90" />
            </button>
            
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 6) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
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
              onClick={() => setCurrentPage(totalPages)}
            >
              <ArrowDown className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
              className="w-16 h-8"
            />
            <span className="text-sm text-gray-600">页</span>
          </div>
        </div>
      </div>

      {/* 批量导入弹窗 */}
      <ImportTagDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen}
        onImport={(result) => {
          // TODO: 刷新列表数据
          console.log('导入完成:', result);
        }}
      />
    </div>
  );
}
