'use client';

import { useState } from 'react';
import {
  Search, Plus, RotateCcw, ChevronLeft, ChevronRight,
  Eye, Edit2, Copy, Trash2, Upload, Download, Filter,
  CheckCircle2, Clock, AlertCircle, User, UserPlus, Building2
} from 'lucide-react';

// 模拟数据
const metricGuardians = [
  {
    id: 1,
    metricCode: 'M202401001',
    metricName: '中高端客户保有率',
    guardianName: '张三',
    guardianCode: 'U001',
    department: '市场部',
    position: '高级分析师',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    status: 'active',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
  },
  {
    id: 2,
    metricCode: 'M202401002',
    metricName: '月均ARPU',
    guardianName: '李四',
    guardianCode: 'U002',
    department: '财务部',
    position: '数据分析师',
    email: 'lisi@example.com',
    phone: '13800138002',
    status: 'active',
    createTime: '2024-01-14 15:20:00',
    updateTime: '2024-01-18 09:10:00',
  },
  {
    id: 3,
    metricCode: 'M202401003',
    metricName: '客户流失率',
    guardianName: '王五',
    guardianCode: 'U003',
    department: '市场部',
    position: '运营经理',
    email: 'wangwu@example.com',
    phone: '13800138003',
    status: 'active',
    createTime: '2024-01-13 09:45:00',
    updateTime: '2024-01-22 16:30:00',
  },
  {
    id: 4,
    metricCode: 'M202401004',
    metricName: '5G流量使用量',
    guardianName: '赵六',
    guardianCode: 'U004',
    department: '网络部',
    position: '网络工程师',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    status: 'active',
    createTime: '2024-01-12 14:10:00',
    updateTime: '2024-01-19 11:25:00',
  },
  {
    id: 5,
    metricCode: 'M202401005',
    metricName: '融合业务渗透率',
    guardianName: '孙七',
    guardianCode: 'U005',
    department: '市场部',
    position: '业务经理',
    email: 'sunqi@example.com',
    phone: '13800138005',
    status: 'active',
    createTime: '2024-01-11 11:25:00',
    updateTime: '2024-01-17 13:40:00',
  },
  {
    id: 6,
    metricCode: 'M202401006',
    metricName: '渠道活跃度',
    guardianName: null,
    guardianCode: null,
    department: null,
    position: null,
    email: null,
    phone: null,
    status: 'unassigned',
    createTime: '2024-01-10 16:50:00',
    updateTime: '2024-01-10 16:50:00',
  },
  {
    id: 7,
    metricCode: 'M202401007',
    metricName: '客户满意度',
    guardianName: '吴九',
    guardianCode: 'U007',
    department: '客服部',
    position: '客服主管',
    email: 'wujiu@example.com',
    phone: '13800138007',
    status: 'active',
    createTime: '2024-01-09 08:15:00',
    updateTime: '2024-01-21 10:05:00',
  },
  {
    id: 8,
    metricCode: 'M202401008',
    metricName: '终端渗透率',
    guardianName: '郑十',
    guardianCode: 'U008',
    department: '市场部',
    position: '产品经理',
    email: 'zhengshi@example.com',
    phone: '13800138008',
    status: 'inactive',
    createTime: '2024-01-08 13:40:00',
    updateTime: '2024-01-15 15:30:00',
  },
];

const departments = ['全部', '市场部', '财务部', '网络部', '渠道部', '客服部', '运营部', '数据部'];
const statuses = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '停用' },
  { value: 'unassigned', label: '未分配' },
];

const statusConfig = {
  active: { label: '正常', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  inactive: { label: '停用', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  unassigned: { label: '未分配', color: 'bg-gray-100 text-gray-700', icon: Clock },
};

export default function MetricGuardianPage() {
  const [filters, setFilters] = useState<{
    keyword: string;
    department: string;
    status: string[];
  }>({
    keyword: '',
    department: '',
    status: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<typeof metricGuardians[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      department: '',
      status: [],
    });
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleAssign = (guardian: typeof metricGuardians[0]) => {
    setSelectedGuardian(guardian);
    setShowAssignDialog(true);
  };

  const handleEdit = (guardian: typeof metricGuardians[0]) => {
    setSelectedGuardian(guardian);
    setShowEditDialog(true);
  };

  const handleDetail = (guardian: typeof metricGuardians[0]) => {
    setSelectedGuardian(guardian);
    setShowDetailDialog(true);
  };

  const handleDelete = (guardian: typeof metricGuardians[0]) => {
    if (confirm(`确定要删除指标"${guardian.metricName}"的看管人"${guardian.guardianName}"吗？`)) {
      alert('删除成功');
    }
  };

  const getFilteredData = () => {
    let filtered = [...metricGuardians];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(g =>
        g.metricCode.toLowerCase().includes(keyword) ||
        g.metricName.toLowerCase().includes(keyword) ||
        (g.guardianName && g.guardianName.toLowerCase().includes(keyword))
      );
    }

    if (filters.department) {
      filtered = filtered.filter(g => g.department === filters.department);
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(g => filters.status.includes(g.status as string));
    }

    return filtered;
  };

  const getPaginatedData = () => {
    const filtered = getFilteredData();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  };

  const totalPages = Math.ceil(getFilteredData().length / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">指标看管人管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理指标的看管人，确保指标有人维护和更新</p>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 关键词搜索 */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              指标编码/名称/看管人
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="请输入指标编码、名称或看管人"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 归属部门 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              看管人部门
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部</option>
              {departments.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filters.status.join(',')}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('status', value ? value.split(',') : []);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? '收起' : '展开'}
            </button>
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
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标编码
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  看管人
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  看管人部门
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  职位
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPaginatedData().map((guardian) => {
                const statusInfo = statusConfig[guardian.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={guardian.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guardian.metricCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {guardian.metricName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {guardian.guardianName ? (
                            <User className="w-4 h-4 text-blue-600" />
                          ) : (
                            <UserPlus className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {guardian.guardianName || '未分配'}
                          </div>
                          {guardian.guardianCode && (
                            <div className="text-xs text-gray-500">
                              {guardian.guardianCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guardian.department || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guardian.position || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guardian.email || '-'}
                        {guardian.phone && (
                          <div className="text-xs text-gray-400">
                            {guardian.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {guardian.createTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDetail(guardian)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {guardian.guardianName ? (
                          <button
                            onClick={() => handleEdit(guardian)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssign(guardian)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="分配看管人"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {guardian.guardianName && (
                          <button
                            onClick={() => handleDelete(guardian)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页区域 */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">共 {getFilteredData().length} 项数据</span>
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

      {/* 分配看管人弹窗 */}
      {showAssignDialog && selectedGuardian && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">分配指标看管人</h3>
              <button
                onClick={() => setShowAssignDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <UserPlus className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">指标信息</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">指标编码：</span>
                    <span className="text-gray-900 font-medium">{selectedGuardian.metricCode}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">指标名称：</span>
                    <span className="text-gray-900 font-medium">{selectedGuardian.metricName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    看管人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入看管人姓名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入工号"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所属部门 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {departments.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    职位
                  </label>
                  <input
                    type="text"
                    placeholder="请输入职位"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="请输入邮箱"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号码
                  </label>
                  <input
                    type="tel"
                    placeholder="请输入手机号码"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    备注
                  </label>
                  <textarea
                    rows={3}
                    placeholder="请输入备注信息"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAssignDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('分配成功');
                  setShowAssignDialog(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                确认分配
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailDialog && selectedGuardian && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">指标看管人详情</h3>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    指标编码
                  </label>
                  <div className="text-sm text-gray-900">{selectedGuardian.metricCode}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    指标名称
                  </label>
                  <div className="text-sm text-gray-900">{selectedGuardian.metricName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    看管人
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.guardianName || '未分配'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    工号
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.guardianCode || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    所属部门
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.department || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    职位
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.position || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    邮箱
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.email || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    手机号码
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedGuardian.phone || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    状态
                  </label>
                  {(() => {
                    const statusInfo = statusConfig[selectedGuardian.status as keyof typeof statusConfig];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    创建时间
                  </label>
                  <div className="text-sm text-gray-900">{selectedGuardian.createTime}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    更新时间
                  </label>
                  <div className="text-sm text-gray-900">{selectedGuardian.updateTime}</div>
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
