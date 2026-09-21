'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Trash2, Upload, Download, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { businessScenarios } from '@/lib/business-scenarios';
import TagAssociationDialog from '@/components/TagAssociationDialog';
import IndicatorAssociationDialog from '@/components/IndicatorAssociationDialog';

// 客群数据类型
interface SegmentData {
  id: number;
  code: string;
  name: string;
  businessScenario: string;
  businessDefinition: string;
  technicalDefinition: string;
  effectiveDate: string;
  expiryDate: string;
  relatedTags: string[];
  relatedIndicators: string[];
  status: '生效' | '失效';
}

// 模拟数据
const mockData: SegmentData[] = [
  {
    id: 1,
    code: 'test-0311-01',
    name: '客群测试',
    businessScenario: '公众市场 / 客户运营 / 离网维系',
    businessDefinition: '用于测试客群功能的测试数据',
    technicalDefinition: 'test_segment_flag = 1',
    effectiveDate: '2026-03-03',
    expiryDate: '2026-03-31',
    relatedTags: ['夜间高流量用户', '饱和度分档'],
    relatedIndicators: ['test-0303客户群指标'],
    status: '生效',
  },
  {
    id: 2,
    code: 'SEG_CHURN_011',
    name: '低饱和客户',
    businessScenario: '公众市场 / 客户运营 / 离网维系',
    businessDefinition: '流量使用饱和度低于30%的客户群体',
    technicalDefinition: 'saturation_rate < 0.3',
    effectiveDate: '2025-01-15',
    expiryDate: '2099-01-14',
    relatedTags: ['饱和度分档'],
    relatedIndicators: ['离网率', '保有率'],
    status: '生效',
  },
  {
    id: 3,
    code: 'SEG_HIGH_VALUE_001',
    name: '高价值客户',
    businessScenario: '公众市场 / 客户运营 / 中高端',
    businessDefinition: 'ARPU值大于200元的客户群体',
    technicalDefinition: 'arpu > 200',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['高ARPU用户', '长期在网'],
    relatedIndicators: ['ARPU值', '收入贡献'],
    status: '生效',
  },
  {
    id: 4,
    code: 'SEG_NEW_001',
    name: '新入网客户',
    businessScenario: '公众市场 / 市场运营 / 新入网',
    businessDefinition: '近30天内新入网的客户',
    technicalDefinition: 'days_since_activation <= 30',
    effectiveDate: '2025-02-01',
    expiryDate: '2025-12-31',
    relatedTags: [],
    relatedIndicators: ['新增客户规模'],
    status: '失效',
  },
  {
    id: 5,
    code: 'SEG_ROAMING_001',
    name: '漫游客户',
    businessScenario: '公众市场 / 国际运营 / 漫游业务',
    businessDefinition: '有国际漫游使用记录的客户',
    technicalDefinition: 'roaming_flag = 1',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['国际漫游'],
    relatedIndicators: ['漫游收入'],
    status: '生效',
  },
  {
    id: 6,
    code: 'SEG_5G_001',
    name: '5G套餐客户',
    businessScenario: '公众市场 / 产品运营 / 数据产品',
    businessDefinition: '已办理5G套餐的客户群体',
    technicalDefinition: 'package_type = "5G"',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['5G用户'],
    relatedIndicators: ['5G渗透率', '流量使用'],
    status: '生效',
  },
  {
    id: 7,
    code: 'SEG_CHURN_RISK_001',
    name: '流失风险客户',
    businessScenario: '公众市场 / 客户运营 / 中高端流失预警',
    businessDefinition: '近3个月消费下降超过30%的客户',
    technicalDefinition: 'arpu_decline_rate > 0.3',
    effectiveDate: '2025-03-01',
    expiryDate: '2025-12-31',
    relatedTags: ['流失预警'],
    relatedIndicators: ['流失率', '预警数量'],
    status: '生效',
  },
  {
    id: 8,
    code: 'SEG_FAMILY_001',
    name: '家庭客户',
    businessScenario: '家庭市场 / 宽带业务',
    businessDefinition: '办理了家庭宽带业务的客户',
    technicalDefinition: 'has_broadband = 1',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['家庭宽带'],
    relatedIndicators: ['宽带用户数'],
    status: '生效',
  },
  {
    id: 9,
    code: 'SEG_YOUTH_001',
    name: '青年客户',
    businessScenario: '公众市场 / 细分市场运营 / 青年市场',
    businessDefinition: '年龄在18-35岁的客户群体',
    technicalDefinition: 'age >= 18 AND age <= 35',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['青年市场'],
    relatedIndicators: ['青年客户规模'],
    status: '生效',
  },
  {
    id: 10,
    code: 'SEG_SILVER_001',
    name: '银发客户',
    businessScenario: '公众市场 / 细分市场运营 / 银发市场',
    businessDefinition: '年龄在60岁以上的客户群体',
    technicalDefinition: 'age >= 60',
    effectiveDate: '2025-01-01',
    expiryDate: '2099-12-31',
    relatedTags: ['银发市场'],
    relatedIndicators: ['银发客户规模'],
    status: '失效',
  },
];

// 业务场景选项（扁平化）
const getFlattenedScenarios = () => {
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

// 状态选项
const statusOptions = ['全部', '生效', '失效'];

export default function SegmentManagementPage() {
  const router = useRouter();
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems] = useState(16);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // 筛选条件
  const [filterScenario, setFilterScenario] = useState('全部');
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterEffectiveStart, setFilterEffectiveStart] = useState('');
  const [filterEffectiveEnd, setFilterEffectiveEnd] = useState('');
  const [filterExpiryStart, setFilterExpiryStart] = useState('');
  const [filterExpiryEnd, setFilterExpiryEnd] = useState('');

  // 弹窗状态
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);

  const totalPages = Math.ceil(totalItems / pageSize);
  const scenarioOptions = getFlattenedScenarios();

  // 过滤数据
  const filteredData = mockData.filter(item => {
    if (filterScenario !== '全部' && item.businessScenario !== filterScenario) return false;
    if (filterStatus !== '全部' && item.status !== filterStatus) return false;
    if (filterName && !item.name.includes(filterName)) return false;
    if (filterCode && !item.code.includes(filterCode)) return false;
    if (filterEffectiveStart && item.effectiveDate < filterEffectiveStart) return false;
    if (filterEffectiveEnd && item.effectiveDate > filterEffectiveEnd) return false;
    if (filterExpiryStart && item.expiryDate < filterExpiryStart) return false;
    if (filterExpiryEnd && item.expiryDate > filterExpiryEnd) return false;
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
    setFilterScenario('全部');
    setFilterName('');
    setFilterCode('');
    setFilterStatus('全部');
    setFilterEffectiveStart('');
    setFilterEffectiveEnd('');
    setFilterExpiryStart('');
    setFilterExpiryEnd('');
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除该客群吗？')) {
      console.log('删除客群:', id);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: '生效' | '失效') => {
    const newStatus = currentStatus === '生效' ? '失效' : '生效';
    console.log(`将客群 ${id} 状态从 ${currentStatus} 切换为 ${newStatus}`);
  };

  const handleBatchDelete = () => {
    if (selectedRowIds.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedRowIds.length} 个客群吗？`)) {
      console.log('批量删除:', selectedRowIds);
      setSelectedRowIds([]);
    }
  };

  const handleOpenTagDialog = (id: number) => {
    setCurrentSegmentId(id);
    setTagDialogOpen(true);
  };

  const handleOpenIndicatorDialog = (id: number) => {
    setCurrentSegmentId(id);
    setIndicatorDialogOpen(true);
  };

  const isAllSelected = selectedRowIds.length === filteredData.length && filteredData.length > 0;
  const isSomeSelected = selectedRowIds.length > 0 && selectedRowIds.length < filteredData.length;

  return (
    <div className="p-6">
      {/* 顶部筛选区 */}
      <Card className="p-4 mb-4 bg-blue-50 border-blue-100">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={filterScenario} onValueChange={setFilterScenario}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="业务场景" />
            </SelectTrigger>
            <SelectContent>
              {scenarioOptions.slice(0, 20).map((scenario) => (
                <SelectItem key={scenario} value={scenario}>{scenario}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="输入客群名称"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-40 bg-white"
          />

          <Input
            placeholder="输入客群编码"
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="w-40 bg-white"
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              {isFilterExpanded ? '收起' : '展开'}
              {isFilterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <Button variant="outline" size="sm" onClick={handleReset} className="bg-white">
              <RefreshCw className="w-4 h-4 mr-1" />
              重置
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1" />
              搜索
            </Button>
          </div>
        </div>

        {/* 展开的筛选条件 */}
        {isFilterExpanded && (
          <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">生效日期：</span>
              <Input
                type="date"
                value={filterEffectiveStart}
                onChange={(e) => setFilterEffectiveStart(e.target.value)}
                className="w-36 bg-white"
              />
              <span className="text-gray-400">至</span>
              <Input
                type="date"
                value={filterEffectiveEnd}
                onChange={(e) => setFilterEffectiveEnd(e.target.value)}
                className="w-36 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">失效日期：</span>
              <Input
                type="date"
                value={filterExpiryStart}
                onChange={(e) => setFilterExpiryStart(e.target.value)}
                className="w-36 bg-white"
              />
              <span className="text-gray-400">至</span>
              <Input
                type="date"
                value={filterExpiryEnd}
                onChange={(e) => setFilterExpiryEnd(e.target.value)}
                className="w-36 bg-white"
              />
            </div>
          </div>
        )}
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
            onClick={() => router.push('/workspace/insight/tags/segment/new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            新增
          </Button>
          <Button variant="outline" size="sm" disabled={selectedRowIds.length === 0} onClick={handleBatchDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            批量删除
          </Button>
          <Button variant="outline" size="sm">
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
          <table className="w-full min-w-[1400px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-12 sticky left-0 bg-gray-50 z-20">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[120px]">客群编码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[120px]">客群名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[180px]">业务场景</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[150px]">业务口径</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[150px]">技术口径</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[100px]">生效日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[100px]">失效日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[140px]">关联标签</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[140px]">关联指标</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap min-w-[80px]">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap sticky right-0 bg-gray-50 z-20 min-w-[200px] shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">操作</th>
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
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" title={item.businessScenario}>
                    <div className="max-w-[170px] truncate">{item.businessScenario}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" title={item.businessDefinition}>
                    <div className="max-w-[140px] truncate">{item.businessDefinition}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap" title={item.technicalDefinition}>
                    <div className="max-w-[140px] truncate">{item.technicalDefinition}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.effectiveDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.expiryDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[130px]">
                      {item.relatedTags.length > 0 ? (
                        <>
                          {item.relatedTags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                          {item.relatedTags.length > 2 && (
                            <span className="text-xs text-gray-400">+{item.relatedTags.length - 2}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[130px]">
                      {item.relatedIndicators.length > 0 ? (
                        <>
                          {item.relatedIndicators.slice(0, 2).map((indicator, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-50 text-green-600 whitespace-nowrap">
                              {indicator}
                            </span>
                          ))}
                          {item.relatedIndicators.length > 2 && (
                            <span className="text-xs text-gray-400">+{item.relatedIndicators.length - 2}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                      item.status === '生效'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 whitespace-nowrap flex-wrap">
                      <button
                        className={`text-sm hover:underline ${
                          item.status === '生效' ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600'
                        }`}
                        onClick={() => handleToggleStatus(item.id, item.status)}
                      >
                        {item.status === '生效' ? '失效' : '生效'}
                      </button>
                      <button
                        className="text-red-500 text-sm hover:text-red-600 hover:underline"
                        onClick={() => handleDelete(item.id)}
                      >
                        删除
                      </button>
                      <button
                        className="text-blue-500 text-sm hover:text-blue-600 hover:underline"
                        onClick={() => router.push(`/workspace/insight/tags/segment/${item.id}/edit`)}
                      >
                        编辑
                      </button>
                      <button
                        className="text-blue-500 text-sm hover:text-blue-600 hover:underline"
                        onClick={() => router.push(`/workspace/insight/tags/segment/${item.id}`)}
                      >
                        详情
                      </button>
                      <button
                        className="text-purple-500 text-sm hover:text-purple-600 hover:underline"
                        onClick={() => handleOpenTagDialog(item.id)}
                      >
                        标签关联
                      </button>
                      <button
                        className="text-teal-500 text-sm hover:text-teal-600 hover:underline"
                        onClick={() => handleOpenIndicatorDialog(item.id)}
                      >
                        指标关联
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

      {/* 标签关联弹窗 */}
      <TagAssociationDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        segmentId={currentSegmentId}
        onSave={(selectedTags) => {
          console.log('保存标签关联:', currentSegmentId, selectedTags);
          setTagDialogOpen(false);
        }}
      />

      {/* 指标关联弹窗 */}
      <IndicatorAssociationDialog
        open={indicatorDialogOpen}
        onOpenChange={setIndicatorDialogOpen}
        segmentId={currentSegmentId}
        onSave={(selectedIndicators) => {
          console.log('保存指标关联:', currentSegmentId, selectedIndicators);
          setIndicatorDialogOpen(false);
        }}
      />
    </div>
  );
}
