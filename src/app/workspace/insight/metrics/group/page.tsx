'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, RotateCcw, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// 模拟数据
const metricGroups = [
  {
    id: 1,
    name: '中高端客户保有率指标组',
    businessScenario: '客户保有',
    granularity: '地州',
    relatedMetricsCount: 5,
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
  },
  {
    id: 2,
    name: '客户流失预警指标组',
    businessScenario: '风险监控',
    granularity: '地州',
    relatedMetricsCount: 8,
    creator: '李四',
    createTime: '2024-01-14 15:20:00',
  },
  {
    id: 3,
    name: 'ARPU提升指标组',
    businessScenario: '价值提升',
    granularity: '地市',
    relatedMetricsCount: 3,
    creator: '王五',
    createTime: '2024-01-13 09:45:00',
  },
  {
    id: 4,
    name: '5G流量运营指标组',
    businessScenario: '流量运营',
    granularity: '地市',
    relatedMetricsCount: 6,
    creator: '赵六',
    createTime: '2024-01-12 14:10:00',
  },
  {
    id: 5,
    name: '融合业务指标组',
    businessScenario: '融合营销',
    granularity: '地州',
    relatedMetricsCount: 4,
    creator: '孙七',
    createTime: '2024-01-11 11:25:00',
  },
  {
    id: 6,
    name: '终端运营指标组',
    businessScenario: '终端运营',
    granularity: '地市',
    relatedMetricsCount: 7,
    creator: '周八',
    createTime: '2024-01-10 16:50:00',
  },
  {
    id: 7,
    name: '渠道效能指标组',
    businessScenario: '渠道运营',
    granularity: '地市',
    relatedMetricsCount: 5,
    creator: '吴九',
    createTime: '2024-01-09 08:15:00',
  },
  {
    id: 8,
    name: '客户满意度指标组',
    businessScenario: '服务质量',
    granularity: '地州',
    relatedMetricsCount: 4,
    creator: '郑十',
    createTime: '2024-01-08 13:40:00',
  },
  {
    id: 9,
    name: '新增客户指标组',
    businessScenario: '客户增长',
    granularity: '地市',
    relatedMetricsCount: 6,
    creator: '钱十一',
    createTime: '2024-01-07 10:55:00',
  },
  {
    id: 10,
    name: '存量客户价值指标组',
    businessScenario: '价值运营',
    granularity: '地州',
    relatedMetricsCount: 5,
    creator: '孙十二',
    createTime: '2024-01-06 15:30:00',
  },
];

const businessScenarios = ['客户保有', '风险监控', '价值提升', '流量运营', '融合营销', '终端运营', '渠道运营', '服务质量', '客户增长', '价值运营'];
const granularities = ['地州', '地市', '区县'];
const statisticalCycles = ['日', '周', '月', '季', '年'];
const customerMetrics = ['全部', '中高端客户', '存量客户', '新增客户', '潜在客户'];

export default function MetricGroupPage() {
  const [filters, setFilters] = useState({
    customerMetric: '',
    businessScenario: '',
    granularity: '',
    statisticalCycle: '',
    relatedMetricName: '',
    groupName: '',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof metricGroups[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      customerMetric: '',
      businessScenario: '',
      granularity: '',
      statisticalCycle: '',
      relatedMetricName: '',
      groupName: '',
    });
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    // 实际项目中这里会调用API进行查询
  };

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleEdit = (group: typeof metricGroups[0]) => {
    setSelectedGroup(group);
    setShowEditDialog(true);
  };

  const handleDetail = (group: typeof metricGroups[0]) => {
    setSelectedGroup(group);
    setShowDetailDialog(true);
  };

  const handleDelete = (group: typeof metricGroups[0]) => {
    if (confirm(`确定要删除指标组"${group.name}"吗？`)) {
      // 实际项目中这里会调用API进行删除
      alert('删除成功');
    }
  };

  // 模拟分页数据
  const getPaginatedData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return metricGroups.slice(start, end);
  };

  const totalPages = Math.ceil(metricGroups.length / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">指标组管理</h1>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          {/* 客群指标 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              客群指标
            </label>
            <select
              value={filters.customerMetric}
              onChange={(e) => handleFilterChange('customerMetric', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {customerMetrics.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 业务场景 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              业务场景
            </label>
            <select
              value={filters.businessScenario}
              onChange={(e) => handleFilterChange('businessScenario', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {businessScenarios.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 指标最小粒度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              指标最小粒度
            </label>
            <select
              value={filters.granularity}
              onChange={(e) => handleFilterChange('granularity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {granularities.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 统计周期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              统计周期
            </label>
            <select
              value={filters.statisticalCycle}
              onChange={(e) => handleFilterChange('statisticalCycle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {statisticalCycles.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 关联指标名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              关联指标名称
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.relatedMetricName}
                onChange={(e) => handleFilterChange('relatedMetricName', e.target.value)}
                placeholder="请输入"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 指标组名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              指标组名称
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.groupName}
                onChange={(e) => handleFilterChange('groupName', e.target.value)}
                placeholder="请输入"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标组名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  业务场景
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标最小粒度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联指标数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPaginatedData().map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {group.businessScenario}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {group.granularity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {group.relatedMetricsCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {group.creator}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {group.createTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDetail(group)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        修改
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页区域 */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">共 {metricGroups.length} 项数据</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500">条/页</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-700">前往</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                placeholder="页码"
              />
              <button className="px-2 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
                跳转
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 添加指标组弹窗 */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">添加指标组</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标组名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入指标组名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    业务场景 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {businessScenarios.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标最小粒度 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {granularities.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    统计周期 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {statisticalCycles.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    rows={4}
                    placeholder="请输入描述"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('添加成功');
                  setShowAddDialog(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑指标组弹窗 */}
      {showEditDialog && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">修改指标组</h3>
              <button
                onClick={() => setShowEditDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标组名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedGroup.name}
                    placeholder="请输入指标组名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    业务场景 <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue={selectedGroup.businessScenario}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {businessScenarios.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标最小粒度 <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue={selectedGroup.granularity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {granularities.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    统计周期 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {statisticalCycles.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    rows={4}
                    placeholder="请输入描述"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('修改成功');
                  setShowEditDialog(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailDialog && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">指标组详情</h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    指标组名称
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    业务场景
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.businessScenario}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    指标最小粒度
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.granularity}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    关联指标数量
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.relatedMetricsCount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    创建人
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.creator}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    创建时间
                  </label>
                  <div className="text-sm text-gray-900">{selectedGroup.createTime}</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">关联指标</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 text-center">
                    该指标组包含 {selectedGroup.relatedMetricsCount} 个关联指标
                  </div>
                  {/* 这里可以展示关联指标列表 */}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
