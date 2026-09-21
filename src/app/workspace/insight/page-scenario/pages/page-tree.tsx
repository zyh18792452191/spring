'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimplePagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  Grid,
  BarChart3,
  CheckCircle2,
  XCircle,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { BusinessScenarioSelect } from '@/components/BusinessScenarioSelect';

interface PageTreeNode {
  id: number;
  page_code: string;
  page_name: string;
  page_type: string;
  page_path: string;
  parent_id: number | null;
  level: number;
  scenario_id: number | null;
  scenario_code: string | null;
  scenario_name: string | null;
  sort_order: number;
  status: string;
  description: string | null;
  is_metric_tree: boolean;
  metric_tree_id: string | null;
  created_at: string;
  updated_at: string;
  children?: PageTreeNode[];
}

const pageTypes = [
  { code: 'folder', name: '目录', icon: Folder, color: 'bg-blue-100 text-blue-800' },
  { code: 'page', name: '页面', icon: FileText, color: 'bg-gray-100 text-gray-800' },
  { code: 'section', name: '区域', icon: Grid, color: 'bg-purple-100 text-purple-800' },
  { code: 'component', name: '组件', icon: BarChart3, color: 'bg-orange-100 text-orange-800' },
];


export default function PageManagementPage() {
  const [pageTree, setPageTree] = useState<PageTreeNode[]>([]);
  const [filteredPageTree, setFilteredPageTree] = useState<PageTreeNode[]>([]);
  const [paginatedRootNodes, setPaginatedRootNodes] = useState<PageTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [pageTypeFilter, setPageTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageTreeNode | null>(null);
  
  // 树形展开状态
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 3])); // 默认展开一级目录
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    pageCode: '',
    pageName: '',
    pageType: 'folder',
    pagePath: '',
    parentId: '',
    scenarioPath: '',
    sortOrder: 0,
    status: 'active',
    description: '',
    isMetricTree: false,
    metricTreeId: '',
  });

  // 静态树形数据
  const staticPageTree: PageTreeNode[] = [
    {
      id: 1,
      page_code: 'home',
      page_name: '首页',
      page_type: 'page',
      page_path: '/',
      parent_id: null,
      level: 1,
      scenario_id: null,
      scenario_code: null,
      scenario_name: null,
      sort_order: 1,
      status: 'active',
      description: null,
      is_metric_tree: false,
      metric_tree_id: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: 2,
      page_code: 'market-intel',
      page_name: '市场数智运营',
      page_type: 'folder',
      page_path: '',
      parent_id: null,
      level: 1,
      scenario_id: null,
      scenario_code: null,
      scenario_name: null,
      sort_order: 2,
      status: 'active',
      description: null,
      is_metric_tree: false,
      metric_tree_id: null,
      created_at: '',
      updated_at: '',
      children: [
        {
          id: 21,
          page_code: 'operation-overview',
          page_name: '运营总览',
          page_type: 'folder',
          page_path: '',
          parent_id: 2,
          level: 2,
          scenario_id: null,
          scenario_code: null,
          scenario_name: null,
          sort_order: 21,
          status: 'active',
          description: null,
          is_metric_tree: false,
          metric_tree_id: null,
          created_at: '',
          updated_at: '',
          children: [
            {
              id: 211,
              page_code: 'market-operation-overview',
              page_name: '市场运营总览',
              page_type: 'page',
              page_path: '/operation/market-overview',
              parent_id: 21,
              level: 3,
              scenario_id: null,
              scenario_code: null,
              scenario_name: null,
              sort_order: 211,
              status: 'active',
              description: null,
              is_metric_tree: false,
              metric_tree_id: null,
              created_at: '',
              updated_at: '',
            },
          ],
        },
        {
          id: 22,
          page_code: 'customer-operation',
          page_name: '客户运营',
          page_type: 'folder',
          page_path: '',
          parent_id: 2,
          level: 2,
          scenario_id: null,
          scenario_code: null,
          scenario_name: null,
          sort_order: 22,
          status: 'active',
          description: null,
          is_metric_tree: false,
          metric_tree_id: null,
          created_at: '',
          updated_at: '',
          children: [
            {
              id: 221,
              page_code: 'existing-customer',
              page_name: '存量运营',
              page_type: 'folder',
              page_path: '',
              parent_id: 22,
              level: 3,
              scenario_id: null,
              scenario_code: null,
              scenario_name: null,
              sort_order: 221,
              status: 'active',
              description: null,
              is_metric_tree: false,
              metric_tree_id: null,
              created_at: '',
              updated_at: '',
              children: [
                {
                  id: 2211,
                  page_code: 'high-end-customer',
                  page_name: '中高端客户运营',
                  page_type: 'folder',
                  page_path: '',
                  parent_id: 221,
                  level: 4,
                  scenario_id: 122,
                  scenario_code: 'mid_high_end',
                  scenario_name: '中高端',
                  sort_order: 2211,
                  status: 'active',
                  description: null,
                  is_metric_tree: false,
                  metric_tree_id: null,
                  created_at: '',
                  updated_at: '',
                  children: [
                    {
                      id: 22111,
                      page_code: 'high-end-overview',
                      page_name: '中高端客户运营概览',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/overview',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22111,
                      status: 'active',
                      description: null,
                      is_metric_tree: false,
                      metric_tree_id: null,
                      created_at: '',
                      updated_at: '',
                      children: [
                        {
                          id: 221111,
                          page_code: 'overall-metrics',
                          page_name: '整体指标',
                          page_type: 'section',
                          page_path: '/operation/customer/high-end/overall-metrics',
                          parent_id: 22111,
                          level: 6,
                          scenario_id: null,
                          scenario_code: null,
                          scenario_name: null,
                          sort_order: 221111,
                          status: 'active',
                          description: null,
                          is_metric_tree: false,
                          metric_tree_id: null,
                          created_at: '',
                          updated_at: '',
                        },
                        {
                          id: 221112,
                          page_code: 'value-enhancement',
                          page_name: '价值提升',
                          page_type: 'section',
                          page_path: '/operation/customer/high-end/value-enhancement',
                          parent_id: 22111,
                          level: 6,
                          scenario_id: null,
                          scenario_code: null,
                          scenario_name: null,
                          sort_order: 221112,
                          status: 'active',
                          description: null,
                          is_metric_tree: false,
                          metric_tree_id: null,
                          created_at: '',
                          updated_at: '',
                          children: [
                            {
                              id: 2211121,
                              page_code: 'positive-value-increase',
                              page_name: '正向提值',
                              page_type: 'component',
                              page_path: '/operation/customer/high-end/positive-value',
                              parent_id: 221112,
                              level: 7,
                              scenario_id: null,
                              scenario_code: null,
                              scenario_name: null,
                              sort_order: 2211121,
                              status: 'active',
                              description: null,
                              is_metric_tree: false,
                              metric_tree_id: null,
                              created_at: '',
                              updated_at: '',
                            },
                            {
                              id: 2211122,
                              page_code: 'reverse-loss-control',
                              page_name: '逆向控损',
                              page_type: 'component',
                              page_path: '/operation/customer/high-end/reverse-loss',
                              parent_id: 221112,
                              level: 7,
                              scenario_id: null,
                              scenario_code: null,
                              scenario_name: null,
                              sort_order: 2211122,
                              status: 'active',
                              description: null,
                              is_metric_tree: false,
                              metric_tree_id: null,
                              created_at: '',
                              updated_at: '',
                            },
                          ],
                        },
                        {
                          id: 221113,
                          page_code: 'scale-development',
                          page_name: '规模发展',
                          page_type: 'section',
                          page_path: '/operation/customer/high-end/scale-development',
                          parent_id: 22111,
                          level: 6,
                          scenario_id: null,
                          scenario_code: null,
                          scenario_name: null,
                          sort_order: 221113,
                          status: 'active',
                          description: null,
                          is_metric_tree: false,
                          metric_tree_id: null,
                          created_at: '',
                          updated_at: '',
                        },
                        {
                          id: 221114,
                          page_code: 'convergence-strengthening',
                          page_name: '融合加固',
                          page_type: 'section',
                          page_path: '/operation/customer/high-end/convergence-strengthening',
                          parent_id: 22111,
                          level: 6,
                          scenario_id: null,
                          scenario_code: null,
                          scenario_name: null,
                          sort_order: 221114,
                          status: 'active',
                          description: null,
                          is_metric_tree: false,
                          metric_tree_id: null,
                          created_at: '',
                          updated_at: '',
                        },
                        {
                          id: 221115,
                          page_code: 'customer-group-management',
                          page_name: '客群看管',
                          page_type: 'section',
                          page_path: '/operation/customer/high-end/customer-group',
                          parent_id: 22111,
                          level: 6,
                          scenario_id: null,
                          scenario_code: null,
                          scenario_name: null,
                          sort_order: 221115,
                          status: 'active',
                          description: null,
                          is_metric_tree: false,
                          metric_tree_id: null,
                          created_at: '',
                          updated_at: '',
                        },
                      ],
                    },
                    {
                      id: 22112,
                      page_code: 'high-end-scale-retention',
                      page_name: '拍照中高端客户规模保有率',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/scale-retention',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22112,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-001',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22113,
                      page_code: 'high-end-value-retention',
                      page_name: '拍照中高端客户价值保有率',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/value-retention',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22113,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-002',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22114,
                      page_code: 'high-end-decline-ratio',
                      page_name: '中高端一降到底占比',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/decline-ratio',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22114,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-003',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22115,
                      page_code: 'strategy-matching-highend',
                      page_name: '策略匹配',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/strategy-matching',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22115,
                      status: 'active',
                      description: null,
                      is_metric_tree: false,
                      metric_tree_id: null,
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22116,
                      page_code: 'dispatch-highend',
                      page_name: '调度派发',
                      page_type: 'page',
                      page_path: '/operation/customer/high-end/dispatch',
                      parent_id: 2211,
                      level: 5,
                      scenario_id: 122,
                      scenario_code: 'mid_high_end',
                      scenario_name: '中高端',
                      sort_order: 22116,
                      status: 'active',
                      description: null,
                      is_metric_tree: false,
                      metric_tree_id: null,
                      created_at: '',
                      updated_at: '',
                    },
                  ],
                },
                {
                  id: 2212,
                  page_code: 'churn-management',
                  page_name: '离网维系',
                  page_type: 'folder',
                  page_path: '',
                  parent_id: 221,
                  level: 4,
                  scenario_id: 127,
                  scenario_code: 'churn_retention',
                  scenario_name: '离网维系',
                  sort_order: 2212,
                  status: 'active',
                  description: null,
                  is_metric_tree: false,
                  metric_tree_id: null,
                  created_at: '',
                  updated_at: '',
                  children: [
                    {
                      id: 22121,
                      page_code: 'monthly-all-churn',
                      page_name: '当月全量客户离网客户数',
                      page_type: 'page',
                      page_path: '/operation/customer/churn/monthly-all',
                      parent_id: 2212,
                      level: 5,
                      scenario_id: 127,
                      scenario_code: 'churn_retention',
                      scenario_name: '离网维系',
                      sort_order: 22121,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-004',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22122,
                      page_code: 'monthly-high-end-churn',
                      page_name: '当月拍照中高端客户离网客户数',
                      page_type: 'page',
                      page_path: '/operation/customer/churn/monthly-high-end',
                      parent_id: 2212,
                      level: 5,
                      scenario_id: 127,
                      scenario_code: 'churn_retention',
                      scenario_name: '离网维系',
                      sort_order: 22122,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-005',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22123,
                      page_code: 'monthly-global-churn',
                      page_name: '当月拍照全球通客户离网客户数',
                      page_type: 'page',
                      page_path: '/operation/customer/churn/monthly-global',
                      parent_id: 2212,
                      level: 5,
                      scenario_id: 127,
                      scenario_code: 'churn_retention',
                      scenario_name: '离网维系',
                      sort_order: 22123,
                      status: 'active',
                      description: null,
                      is_metric_tree: true,
                      metric_tree_id: 'MT-006',
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22124,
                      page_code: 'strategy-matching-churn',
                      page_name: '策略匹配',
                      page_type: 'page',
                      page_path: '/operation/customer/churn/strategy-matching',
                      parent_id: 2212,
                      level: 5,
                      scenario_id: 127,
                      scenario_code: 'churn_retention',
                      scenario_name: '离网维系',
                      sort_order: 22124,
                      status: 'active',
                      description: null,
                      is_metric_tree: false,
                      metric_tree_id: null,
                      created_at: '',
                      updated_at: '',
                    },
                    {
                      id: 22125,
                      page_code: 'dispatch-churn',
                      page_name: '调度派发',
                      page_type: 'page',
                      page_path: '/operation/customer/churn/dispatch',
                      parent_id: 2212,
                      level: 5,
                      scenario_id: 127,
                      scenario_code: 'churn_retention',
                      scenario_name: '离网维系',
                      sort_order: 22125,
                      status: 'active',
                      description: null,
                      is_metric_tree: false,
                      metric_tree_id: null,
                      created_at: '',
                      updated_at: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      page_code: 'workspace',
      page_name: '我的工作台',
      page_type: 'folder',
      page_path: '',
      parent_id: null,
      level: 1,
      scenario_id: null,
      scenario_code: null,
      scenario_name: null,
      sort_order: 3,
      status: 'active',
      description: null,
      is_metric_tree: false,
      metric_tree_id: null,
      created_at: '',
      updated_at: '',
      children: [
        {
          id: 31,
          page_code: 'workspace-home',
          page_name: '工作台首页',
          page_type: 'page',
          page_path: '/workspace',
          parent_id: 3,
          level: 2,
          scenario_id: null,
          scenario_code: null,
          scenario_name: null,
          sort_order: 31,
          status: 'active',
          description: null,
          is_metric_tree: false,
          metric_tree_id: null,
          created_at: '',
          updated_at: '',
        },
      ],
    },
  ];

  const fetchPages = async () => {
    try {
      setLoading(true);
      
      // 应用前端过滤
      const filterNode = (node: PageTreeNode): PageTreeNode | null => {
        // 状态过滤
        if (statusFilter !== 'all' && node.status !== statusFilter) {
          return null;
        }
        // 类型过滤
        if (pageTypeFilter !== 'all' && node.page_type !== pageTypeFilter) {
          return null;
        }
        // 搜索过滤
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!node.page_name.toLowerCase().includes(term) &&
              !node.page_code.toLowerCase().includes(term) &&
              !node.page_path.toLowerCase().includes(term)) {
            return null;
          }
        }

        // 递归过滤子节点
        const filteredChildren = node.children
          ?.map(child => filterNode(child))
          .filter((child): child is PageTreeNode => child !== null);

        // 如果有子节点，返回带子节点的节点
        if (filteredChildren && filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }

        // 如果是目录类型但没有子节点被保留，也不保留该节点（除非它本身匹配搜索）
        if (node.page_type === 'folder' && (!filteredChildren || filteredChildren.length === 0)) {
          return searchTerm && (
            node.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.page_code.toLowerCase().includes(searchTerm.toLowerCase())
          ) ? node : null;
        }

        return { ...node, children: filteredChildren };
      };

      const filtered = staticPageTree
        .map(node => filterNode(node))
        .filter((node): node is PageTreeNode => node !== null);

      setFilteredPageTree(filtered);
      setPageTree(filtered);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('获取页面列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter, pageTypeFilter, searchTerm]);

  // 根节点分页逻辑
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredPageTree.slice(startIndex, endIndex);
    setPaginatedRootNodes(pageData);
  }, [filteredPageTree, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 切换每页条数时重置到第一页
  };

  const handleAdd = (parentId?: number) => {
    setEditingPage(null);
    setFormData({
      pageCode: '',
      pageName: '',
      pageType: 'folder',
      pagePath: '',
      parentId: parentId ? parentId.toString() : '',
      scenarioPath: '',
      sortOrder: 0,
      status: 'active',
      description: '',
      isMetricTree: false,
      metricTreeId: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (node: PageTreeNode) => {
    setEditingPage(node);
    setFormData({
      pageCode: node.page_code,
      pageName: node.page_name,
      pageType: node.page_type,
      pagePath: node.page_path,
      parentId: node.parent_id?.toString() || '',
      scenarioPath: node.scenario_name || '',
      sortOrder: node.sort_order,
      status: node.status,
      description: node.description || '',
      isMetricTree: node.is_metric_tree,
      metricTreeId: node.metric_tree_id || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (node: PageTreeNode) => {
    if (!confirm(`确定要删除"${node.page_name}"吗？`)) return;
    toast.success('删除成功');
  };

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 树形表格行组件
  const TreeNodeRow: React.FC<{
    node: PageTreeNode;
    level: number;
  }> = ({ node, level }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const typeInfo = pageTypes.find(t => t.code === node.page_type);

    return (
      <>
        <TableRow className="hover:bg-gray-50">
          <TableCell className="w-12">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNode(node.id)}
                className="w-8 h-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-8" />}
          </TableCell>
          <TableCell className="font-mono text-sm">{node.page_code}</TableCell>
          <TableCell>
            <div 
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {typeInfo && <typeInfo.icon className={`w-4 h-4 ${
                node.page_type === 'folder' ? 'text-blue-500' :
                node.page_type === 'component' ? 'text-orange-500' :
                node.page_type === 'section' ? 'text-purple-500' : 'text-gray-400'
              }`} />}
              <span className="font-medium">{node.page_name}</span>
            </div>
          </TableCell>
          <TableCell>
            {typeInfo && (
              <Badge variant="outline" className={typeInfo.color}>
                {typeInfo.name}
              </Badge>
            )}
          </TableCell>
          <TableCell className="font-mono text-sm text-muted-foreground">
            {node.page_path || '-'}
          </TableCell>
          <TableCell>{node.scenario_name || '-'}</TableCell>
          <TableCell className="text-center">
            {node.is_metric_tree ? (
              <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                <Target className="w-3 h-3 mr-1" />
                是 ({node.metric_tree_id})
              </Badge>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </TableCell>
          <TableCell className="text-center">{node.sort_order}</TableCell>
          <TableCell>
            {node.status === 'active' ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                启用
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                <XCircle className="w-3 h-3 mr-1" />
                停用
              </Badge>
            )}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAdd(node.id)}
                title="添加子节点"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(node)}
                title="编辑"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(node)}
                title="删除"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        
        {/* 子节点 */}
        {hasChildren && isExpanded && (
          <>
            {node.children!.map(child => (
              <TreeNodeRow key={child.id} node={child} level={level + 1} />
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            页面管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理系统页面、目录、区域和组件
          </p>
        </div>
        <Button onClick={() => handleAdd()} className="gap-2">
          <Plus className="w-4 h-4" />
          新建节点
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索页面名称或编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="页面类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {pageTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchPages} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 页面树形表格 */}
      <Card>
        <CardHeader>
          <CardTitle>页面列表</CardTitle>
          <CardDescription>
            共 {filteredPageTree.length} 个页面
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : filteredPageTree.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>编码</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>业务场景</TableHead>
                    <TableHead className="text-center">指标树</TableHead>
                    <TableHead className="text-center">排序</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-36">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRootNodes.map(node => (
                    <TreeNodeRow key={node.id} node={node} level={0} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination */}
          {filteredPageTree.length > 0 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="text-sm text-muted-foreground">
                共 {filteredPageTree.length} 条记录，第 {currentPage} 页
              </div>
              <SimplePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredPageTree.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? '编辑节点' : '新建节点'}</DialogTitle>
            <DialogDescription>
              {editingPage ? '修改节点信息' : '创建新的节点'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pageCode">
                  节点编码 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pageCode"
                  value={formData.pageCode}
                  onChange={(e) =>
                    setFormData({ ...formData, pageCode: e.target.value })
                  }
                  placeholder="例如: CUSTOMER_LIST"
                  disabled={!!editingPage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageName">
                  节点名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pageName"
                  value={formData.pageName}
                  onChange={(e) =>
                    setFormData({ ...formData, pageName: e.target.value })
                  }
                  placeholder="例如: 客户列表"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pageType">
                  节点类型 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.pageType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pageType: value })
                  }
                >
                  <SelectTrigger id="pageType">
                    <SelectValue placeholder="选择节点类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pagePath">节点路径</Label>
                <Input
                  id="pagePath"
                  value={formData.pagePath}
                  onChange={(e) =>
                    setFormData({ ...formData, pagePath: e.target.value })
                  }
                  placeholder="例如: /workspace/customer/list"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenarioPath">业务场景</Label>
                <BusinessScenarioSelect
                  value={formData.scenarioPath}
                  onChange={(value) =>
                    setFormData({ ...formData, scenarioPath: value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMetricTree"
                  checked={formData.isMetricTree}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMetricTree: checked as boolean })
                  }
                />
                <Label htmlFor="isMetricTree" className="flex items-center gap-2 cursor-pointer">
                  <Target className="w-4 h-4" />
                  是否指标树
                </Label>
              </div>
              {formData.isMetricTree && (
                <div className="space-y-2">
                  <Label htmlFor="metricTreeId">指标树ID</Label>
                  <Input
                    id="metricTreeId"
                    value={formData.metricTreeId}
                    onChange={(e) =>
                      setFormData({ ...formData, metricTreeId: e.target.value })
                    }
                    placeholder="例如: MT-001"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="节点描述..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              toast.success(editingPage ? '更新成功' : '创建成功');
              setDialogOpen(false);
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
