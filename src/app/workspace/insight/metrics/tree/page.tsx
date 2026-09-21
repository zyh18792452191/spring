'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, RotateCcw, ChevronLeft, ChevronRight,
  Eye, Edit2, Copy, Trash2, Upload, Download, Filter,
  CheckCircle2, Clock, AlertCircle, ArrowLeft, X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { TreeNode, TreeBasicInfo, MetricTreeDraft } from '@/components/MetricTreeEditor';

// 动态导入 MetricTreeEditor 组件（客户端组件）
const MetricTreeEditor = dynamic(() => import('@/components/MetricTreeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">加载编辑器...</div>
    </div>
  )
});

// 模拟数据
const metricTrees = [
  {
    id: 1,
    code: 'MT202401001',
    name: '中高端客户保有率指标树',
    businessScenario: '客户保有',
    status: 'published',
    version: 'v1.2',
    region: '全国',
    granularity: '地州',
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
    validFrom: '2024-01-15',
    validTo: '2024-12-31',
  },
  {
    id: 2,
    code: 'MT202401002',
    name: 'ARPU提升指标树',
    businessScenario: '价值提升',
    status: 'draft',
    version: 'v1.0',
    region: '全国',
    granularity: '地市',
    creator: '李四',
    createTime: '2024-01-14 15:20:00',
    validFrom: '2024-01-14',
    validTo: '2024-12-31',
  },
  {
    id: 3,
    code: 'MT202401003',
    name: '客户流失预警指标树',
    businessScenario: '风险监控',
    status: 'published',
    version: 'v2.1',
    region: '全国',
    granularity: '地州',
    creator: '王五',
    createTime: '2024-01-13 09:45:00',
    validFrom: '2024-01-13',
    validTo: '2024-12-31',
  },
  {
    id: 4,
    code: 'MT202401004',
    name: '5G流量运营指标树',
    businessScenario: '流量运营',
    status: 'offline',
    version: 'v1.5',
    region: '全国',
    granularity: '地市',
    creator: '赵六',
    createTime: '2024-01-12 14:10:00',
    validFrom: '2024-01-12',
    validTo: '2024-06-30',
  },
  {
    id: 5,
    code: 'MT202401005',
    name: '融合业务指标树',
    businessScenario: '融合营销',
    status: 'published',
    version: 'v1.3',
    region: '全国',
    granularity: '地州',
    creator: '孙七',
    createTime: '2024-01-11 11:25:00',
    validFrom: '2024-01-11',
    validTo: '2024-12-31',
  },
  {
    id: 6,
    code: 'MT202401006',
    name: '终端运营指标树',
    businessScenario: '终端运营',
    status: 'draft',
    version: 'v1.0',
    region: '全国',
    granularity: '地市',
    creator: '周八',
    createTime: '2024-01-10 16:50:00',
    validFrom: '2024-01-10',
    validTo: '2024-12-31',
  },
  {
    id: 7,
    code: 'MT202401007',
    name: '渠道效能指标树',
    businessScenario: '渠道运营',
    status: 'published',
    version: 'v2.0',
    region: '全国',
    granularity: '地市',
    creator: '吴九',
    createTime: '2024-01-09 08:15:00',
    validFrom: '2024-01-09',
    validTo: '2024-12-31',
  },
  {
    id: 8,
    code: 'MT202401008',
    name: '客户满意度指标树',
    businessScenario: '服务质量',
    status: 'published',
    version: 'v1.1',
    region: '全国',
    granularity: '地州',
    creator: '郑十',
    createTime: '2024-01-08 13:40:00',
    validFrom: '2024-01-08',
    validTo: '2024-12-31',
  },
];

const regions = ['全部', '全国', '华东', '华南', '华北', '华中', '西北', '西南', '东北'];
const granularities = ['全部', '地州', '地市', '区县'];
const businessScenarios = ['全部', '客户保有', '风险监控', '价值提升', '流量运营', '融合营销', '终端运营', '渠道运营', '服务质量'];
const statuses = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下线' },
];

const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: Clock },
  published: { label: '已发布', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  offline: { label: '已下线', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

// 模拟指标组数据
const metricGroups = [
  {
    id: 1,
    name: '参与客户数（月）',
    category: '公众市场/客户运营/统一营销进度',
    sinkGranularity: '地州',
    granularity: '月',
    metricCount: 1,
  },
  {
    id: 2,
    name: '知晓度（月）',
    category: '公众市场/客户运营/统一营销进度',
    sinkGranularity: '地州',
    granularity: '月',
    metricCount: 1,
  },
  {
    id: 3,
    name: '参与度（月）',
    category: '公众市场/客户运营/统一营销进度',
    sinkGranularity: '地州',
    granularity: '月',
    metricCount: 1,
  },
  {
    id: 4,
    name: '满意度（月）',
    category: '公众市场/客户运营/统一营销进度',
    sinkGranularity: '地州',
    granularity: '月',
    metricCount: 1,
  },
  {
    id: 5,
    name: '活动UV（月）',
    category: '公众市场/客户运营/统一营销进度',
    sinkGranularity: '地州',
    granularity: '月',
    metricCount: 1,
  },
];

const businessScenariosForSelect = ['全部', '公众市场', '政企市场', '家庭市场', '新兴市场'];

export default function MetricTreePage() {
  const [filters, setFilters] = useState({
    region: '',
    granularity: '',
    businessScenario: '',
    status: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showTreeEditor, setShowTreeEditor] = useState(false);
  const [showGroupSelectDialog, setShowGroupSelectDialog] = useState(false);
  const [selectedTree, setSelectedTree] = useState<MetricTreeDraft | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<typeof metricGroups[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedDrafts, setSavedDrafts] = useState<MetricTreeDraft[]>([]);

  // 指标组筛选状态
  const [groupFilters, setGroupFilters] = useState({
    businessScenario: '',
    groupName: '',
  });

  // 从localStorage加载保存的草稿
  useEffect(() => {
    try {
      const saved = localStorage.getItem('metricTreeDrafts');
      if (saved) {
        setSavedDrafts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  }, []);

  // 保存草稿到localStorage
  const saveDraftToStorage = (treeData: TreeNode, info: TreeBasicInfo, groupName: string, isEditMode: boolean = false) => {
    try {
      const draft: MetricTreeDraft = {
        id: isEditMode && selectedTree ? selectedTree.id : `draft-${Date.now()}`,
        code: isEditMode && selectedTree ? selectedTree.code : `MT${Date.now()}`,
        name: info.name || '未命名指标树',
        businessScenario: info.businessScenario || '未分类',
        status: 'draft',
        version: isEditMode && selectedTree ? selectedTree.version : 'v1.0',
        region: info.region || '全国',
        granularity: info.granularity || '地州',
        creator: '张三',
        createTime: isEditMode && selectedTree ? selectedTree.createTime : new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        validFrom: new Date().toLocaleDateString('zh-CN'),
        validTo: '2024-12-31',
        treeData,
        treeInfo: info,
      };

      let updatedDrafts: MetricTreeDraft[];

      if (isEditMode && selectedTree) {
        // 编辑模式：更新现有记录
        updatedDrafts = savedDrafts.map(d => d.id === draft.id ? draft : d);
      } else {
        // 新建模式：新增记录
        updatedDrafts = [...savedDrafts, draft];
      }

      setSavedDrafts(updatedDrafts);
      localStorage.setItem('metricTreeDrafts', JSON.stringify(updatedDrafts));

      return draft;
    } catch (error) {
      console.error('保存草稿失败:', error);
      return null;
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      region: '',
      granularity: '',
      businessScenario: '',
      status: [],
    });
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setShowGroupSelectDialog(true);
  };

  // 处理选择指标组
  const handleSelectGroup = (group: typeof metricGroups[0]) => {
    setSelectedGroup(group);
    setShowGroupSelectDialog(false);
    setShowTreeEditor(true);
  };

  const handleEdit = (tree: any) => {
    if (tree.treeData) {
      // 草稿数据
      setSelectedTree(tree);
      setShowGroupSelectDialog(false);
      setShowTreeEditor(true);
    } else {
      // 模拟数据，不支持编辑
      alert('模拟数据不支持编辑功能');
    }
  };

  const handleDetail = (tree: any) => {
    setSelectedTree(tree);
    setShowDetailDialog(true);
  };

  const handlePublish = (tree: any) => {
    if (confirm(`确定要发布指标树"${tree.name}"吗？`)) {
      alert('发布成功');
    }
  };

  const handleOffline = (tree: any) => {
    if (confirm(`确定要下线指标树"${tree.name}"吗？`)) {
      alert('下线成功');
    }
  };

  const handleDelete = (tree: any) => {
    if (confirm(`确定要删除指标树"${tree.name}"吗？`)) {
      // 判断是草稿数据还是模拟数据
      if (tree.treeData) {
        // 草稿数据，支持删除
        try {
          const updatedDrafts = savedDrafts.filter(d => d.id !== tree.id);
          setSavedDrafts(updatedDrafts);
          localStorage.setItem('metricTreeDrafts', JSON.stringify(updatedDrafts));
          alert('删除成功');
        } catch (error) {
          console.error('删除草稿失败:', error);
          alert('删除失败，请重试！');
        }
      } else {
        // 模拟数据，不支持删除
        alert('模拟数据不支持删除功能');
      }
    }
  };

  const handleCopy = (tree: any) => {
    if (confirm(`确定要复制指标树"${tree.name}"吗？`)) {
      alert('复制成功');
    }
  };

  const getPaginatedData = () => {
    // 合并模拟数据和保存的草稿
    const allData = [...metricTrees, ...savedDrafts];

    // 按创建时间倒序排列
    allData.sort((a, b) => {
      const timeA = new Date(a.createTime.replace(/\//g, '-')).getTime();
      const timeB = new Date(b.createTime.replace(/\//g, '-')).getTime();
      return timeB - timeA; // 降序
    });

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allData.slice(start, end);
  };

  const totalPages = Math.ceil((metricTrees.length + savedDrafts.length) / pageSize);

  return (
    <>
      {showTreeEditor ? (
        <MetricTreeEditor
          initialTree={selectedTree?.treeData}
          initialInfo={selectedTree?.treeInfo}
          groupName={selectedTree?.treeInfo?.name || selectedGroup?.name || ''}
          onSave={(treeData: TreeNode, info: TreeBasicInfo) => {
            console.log('保存指标树:', treeData);
            console.log('指标树基本信息:', info);
            console.log('选择的指标组:', selectedGroup);
            alert('指标树保存成功！');
            setShowTreeEditor(false);
            setSelectedGroup(null);
            setSelectedTree(null);
          }}
          onCancel={() => {
            setShowTreeEditor(false);
            setSelectedGroup(null);
            setSelectedTree(null);
          }}
          onSaveDraft={(treeData: TreeNode, info: TreeBasicInfo) => {
            const draft = saveDraftToStorage(treeData, info, selectedGroup?.name || '', !!selectedTree);
            if (draft) {
              alert('草稿保存成功！');
              setShowTreeEditor(false);
              setSelectedGroup(null);
              setSelectedTree(null);
            } else {
              alert('草稿保存失败，请重试！');
            }
          }}
          onPreview={(treeData: TreeNode, info: TreeBasicInfo) => {
            console.log('预览指标树:', treeData);
            console.log('指标树基本信息:', info);
            console.log('选择的指标组:', selectedGroup);
            alert('进入预览模式！');
          }}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">指标树管理</h1>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 归属区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              归属区域
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部</option>
              {regions.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 分析粒度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分析粒度
            </label>
            <select
              value={filters.granularity}
              onChange={(e) => handleFilterChange('granularity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部</option>
              {granularities.map(item => (
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
              <option value="">全部</option>
              {businessScenarios.map(item => (
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
          <button
            onClick={handleCreate}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建指标树
          </button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标树编码
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标树名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  业务场景
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  归属区域
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分析粒度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建人
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有效期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPaginatedData().map((tree: any) => {
                const statusInfo = statusConfig[tree.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={tree.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tree.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tree.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.businessScenario}
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
                        {tree.version}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.region}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.granularity}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.creator}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.createTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tree.validFrom} 至 {tree.validTo}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDetail(tree)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(tree)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(tree)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="复制"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {tree.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(tree)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="发布"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        {tree.status === 'published' && (
                          <button
                            onClick={() => handleOffline(tree)}
                            className="p-1 text-orange-600 hover:text-orange-800 transition-colors"
                            title="下线"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tree)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <span className="text-sm text-gray-700">共 {metricTrees.length} 项数据</span>
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

      {/* 创建指标树弹窗 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">创建指标树</h3>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标树名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入指标树名称"
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
                    归属区域 <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">请选择</option>
                    {regions.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分析粒度 <span className="text-red-500">*</span>
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
                    生效日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    失效日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
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
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('创建成功');
                  setShowCreateDialog(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailDialog && selectedTree && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">指标树详情</h3>
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
                    指标树编码
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    指标树名称
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    业务场景
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.businessScenario}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    状态
                  </label>
                  {(() => {
                    const statusInfo = statusConfig[selectedTree.status as keyof typeof statusConfig];
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
                    版本
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.version}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    归属区域
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.region}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    分析粒度
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.granularity}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    创建人
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.creator}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    创建时间
                  </label>
                  <div className="text-sm text-gray-900">{selectedTree.createTime}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    有效期
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedTree.validFrom} 至 {selectedTree.validTo}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">指标树结构</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 text-center">
                    这里展示指标树的结构图
                  </div>
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

      {/* 指标组选择弹窗 */}
      {showGroupSelectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">选择指标组</h3>
              <button
                onClick={() => setShowGroupSelectDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                {/* 业务场景 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    业务场景
                  </label>
                  <select
                    value={groupFilters.businessScenario}
                    onChange={(e) => setGroupFilters(prev => ({ ...prev, businessScenario: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">全部</option>
                    {businessScenariosForSelect.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* 指标组名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标组名称
                  </label>
                  <input
                    type="text"
                    placeholder="请输入指标组名称"
                    value={groupFilters.groupName}
                    onChange={(e) => setGroupFilters(prev => ({ ...prev, groupName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 查询按钮 */}
                <div className="flex items-end">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                    <Search className="w-4 h-4" />
                    查询
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                      选择
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      指标组名称
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      指标分类
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      指标下沉粒度
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      指标粒度
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      指标数量
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metricGroups.map((group) => (
                    <tr
                      key={group.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedGroup?.id === group.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="radio"
                          name="metricGroup"
                          checked={selectedGroup?.id === group.id}
                          onChange={() => setSelectedGroup(group)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {group.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {group.sinkGranularity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {group.granularity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {group.metricCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowGroupSelectDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (selectedGroup) {
                    handleSelectGroup(selectedGroup);
                  } else {
                    alert('请先选择一个指标组');
                  }
                }}
                disabled={!selectedGroup}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </>
  );
}
