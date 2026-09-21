'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  FolderTree,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { SimplePagination } from '@/components/ui/pagination';
import { businessScenarios as sharedBusinessScenarios, BusinessScenarioItem } from '@/lib/business-scenarios';

interface ScenarioTreeNode {
  id: number;
  scenario_code: string;
  scenario_name: string;
  parent_id: number | null;
  level: number;
  sort_order: number;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  children?: ScenarioTreeNode[];
}

// 业务场景数据（来自模板管理的业务场景筛选条件）
const businessScenarios: ScenarioTreeNode[] = [
  // 公众市场
  {
    id: 1,
    scenario_code: 'public_market',
    scenario_name: '公众市场',
    parent_id: null,
    level: 1,
    sort_order: 1,
    status: 'active',
    description: '公众市场业务场景',
    created_at: '',
    updated_at: '',
    children: [
      {
        id: 11,
        scenario_code: 'market_operation',
        scenario_name: '市场运营',
        parent_id: 1,
        level: 2,
        sort_order: 11,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 111,
            scenario_code: 'market_operation',
            scenario_name: '市场运营',
            parent_id: 11,
            level: 3,
            sort_order: 111,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 112,
            scenario_code: 'new_subscriptions',
            scenario_name: '新入网',
            parent_id: 11,
            level: 3,
            sort_order: 112,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 113,
            scenario_code: 'group_customers',
            scenario_name: '集团成员客户',
            parent_id: 11,
            level: 3,
            sort_order: 113,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 12,
        scenario_code: 'customer_operation',
        scenario_name: '客户运营',
        parent_id: 1,
        level: 2,
        sort_order: 12,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 121,
            scenario_code: 'customer_operation',
            scenario_name: '客户运营',
            parent_id: 12,
            level: 3,
            sort_order: 121,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 122,
            scenario_code: 'mid_high_end',
            scenario_name: '中高端',
            parent_id: 12,
            level: 3,
            sort_order: 122,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 123,
            scenario_code: 'new_subscriptions',
            scenario_name: '新入网',
            parent_id: 12,
            level: 3,
            sort_order: 123,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 124,
            scenario_code: 'group_customers',
            scenario_name: '集团成员客户',
            parent_id: 12,
            level: 3,
            sort_order: 124,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 125,
            scenario_code: 'global',
            scenario_name: '全球通',
            parent_id: 12,
            level: 3,
            sort_order: 125,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 126,
            scenario_code: 'mid_high_end_warning',
            scenario_name: '中高端流失预警',
            parent_id: 12,
            level: 3,
            sort_order: 126,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 127,
            scenario_code: 'churn_retention',
            scenario_name: '离网维系',
            parent_id: 12,
            level: 3,
            sort_order: 127,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 13,
        scenario_code: 'product_operation',
        scenario_name: '产品运营',
        parent_id: 1,
        level: 2,
        sort_order: 13,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 131,
            scenario_code: 'product_operation',
            scenario_name: '产品运营',
            parent_id: 13,
            level: 3,
            sort_order: 131,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 132,
            scenario_code: 'data_products',
            scenario_name: '数据产品',
            parent_id: 13,
            level: 3,
            sort_order: 132,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 133,
            scenario_code: 'content_products',
            scenario_name: '内容产品',
            parent_id: 13,
            level: 3,
            sort_order: 133,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 14,
        scenario_code: 'channel_operation',
        scenario_name: '渠道运营',
        parent_id: 1,
        level: 2,
        sort_order: 14,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 141,
            scenario_code: 'channel_operation',
            scenario_name: '渠道运营',
            parent_id: 14,
            level: 3,
            sort_order: 141,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 142,
            scenario_code: 'online_channel',
            scenario_name: '线上渠道',
            parent_id: 14,
            level: 3,
            sort_order: 142,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 143,
            scenario_code: 'offline_channel',
            scenario_name: '线下渠道',
            parent_id: 14,
            level: 3,
            sort_order: 143,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 15,
        scenario_code: 'international_operation',
        scenario_name: '国际运营',
        parent_id: 1,
        level: 2,
        sort_order: 15,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 151,
            scenario_code: 'international_operation',
            scenario_name: '国际运营',
            parent_id: 15,
            level: 3,
            sort_order: 151,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 152,
            scenario_code: 'roaming',
            scenario_name: '漫游业务',
            parent_id: 15,
            level: 3,
            sort_order: 152,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 153,
            scenario_code: 'international',
            scenario_name: '国际业务',
            parent_id: 15,
            level: 3,
            sort_order: 153,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 16,
        scenario_code: 'segment_market',
        scenario_name: '细分市场运营',
        parent_id: 1,
        level: 2,
        sort_order: 16,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 161,
            scenario_code: 'segment_market',
            scenario_name: '细分市场运营',
            parent_id: 16,
            level: 3,
            sort_order: 161,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 162,
            scenario_code: 'youth',
            scenario_name: '青年市场',
            parent_id: 16,
            level: 3,
            sort_order: 162,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 163,
            scenario_code: 'silver',
            scenario_name: '银发市场',
            parent_id: 16,
            level: 3,
            sort_order: 163,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
    ],
  },
  // 政企市场
  {
    id: 2,
    scenario_code: 'enterprise_market',
    scenario_name: '政企市场',
    parent_id: null,
    level: 1,
    sort_order: 2,
    status: 'active',
    description: '政企市场业务场景',
    created_at: '',
    updated_at: '',
  },
  // 家庭市场
  {
    id: 3,
    scenario_code: 'home_market',
    scenario_name: '家庭市场',
    parent_id: null,
    level: 1,
    sort_order: 3,
    status: 'active',
    description: '家庭市场业务场景',
    created_at: '',
    updated_at: '',
    children: [
      {
        id: 31,
        scenario_code: 'broadband',
        scenario_name: '宽带业务',
        parent_id: 3,
        level: 2,
        sort_order: 31,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 311,
            scenario_code: 'broadband',
            scenario_name: '宽带业务',
            parent_id: 31,
            level: 3,
            sort_order: 311,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 312,
            scenario_code: 'fiber',
            scenario_name: '光纤宽带',
            parent_id: 31,
            level: 3,
            sort_order: 312,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 313,
            scenario_code: 'business_broadband',
            scenario_name: '企业宽带',
            parent_id: 31,
            level: 3,
            sort_order: 313,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 32,
        scenario_code: 'home_security',
        scenario_name: '家庭安防',
        parent_id: 3,
        level: 2,
        sort_order: 32,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 321,
            scenario_code: 'home_security',
            scenario_name: '家庭安防',
            parent_id: 32,
            level: 3,
            sort_order: 321,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 322,
            scenario_code: 'smart_lock',
            scenario_name: '智能门锁',
            parent_id: 32,
            level: 3,
            sort_order: 322,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 323,
            scenario_code: 'smart_camera',
            scenario_name: '智能摄像头',
            parent_id: 32,
            level: 3,
            sort_order: 323,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
    ],
  },
  // 产品市场
  {
    id: 4,
    scenario_code: 'product_market',
    scenario_name: '产品市场',
    parent_id: null,
    level: 1,
    sort_order: 4,
    status: 'active',
    description: '产品市场业务场景',
    created_at: '',
    updated_at: '',
    children: [
      {
        id: 41,
        scenario_code: '5g_products',
        scenario_name: '5G产品',
        parent_id: 4,
        level: 2,
        sort_order: 41,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 411,
            scenario_code: '5g_products',
            scenario_name: '5G产品',
            parent_id: 41,
            level: 3,
            sort_order: 411,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 412,
            scenario_code: '5g_packages',
            scenario_name: '5G套餐',
            parent_id: 41,
            level: 3,
            sort_order: 412,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 413,
            scenario_code: '5g_devices',
            scenario_name: '5G终端',
            parent_id: 41,
            level: 3,
            sort_order: 413,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        id: 42,
        scenario_code: 'cloud_services',
        scenario_name: '云服务',
        parent_id: 4,
        level: 2,
        sort_order: 42,
        status: 'active',
        description: null,
        created_at: '',
        updated_at: '',
        children: [
          {
            id: 421,
            scenario_code: 'cloud_services',
            scenario_name: '云服务',
            parent_id: 42,
            level: 3,
            sort_order: 421,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 422,
            scenario_code: 'cloud_storage',
            scenario_name: '云存储',
            parent_id: 42,
            level: 3,
            sort_order: 422,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
          {
            id: 423,
            scenario_code: 'cloud_computing',
            scenario_name: '云计算',
            parent_id: 42,
            level: 3,
            sort_order: 423,
            status: 'active',
            description: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
    ],
  },
];

export default function ScenarioManagementPage() {
  const [scenarioTree, setScenarioTree] = useState<ScenarioTreeNode[]>([]);
  const [filteredScenarioTree, setFilteredScenarioTree] = useState<ScenarioTreeNode[]>([]);
  const [paginatedRootNodes, setPaginatedRootNodes] = useState<ScenarioTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioTreeNode | null>(null);
  
  // 树形展开状态
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 3, 4])); // 默认展开一级目录
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    scenarioCode: '',
    scenarioName: '',
    parentId: '',
    sortOrder: 0,
    status: 'active',
    description: '',
  });

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      
      // 应用前端过滤
      const filterNode = (node: ScenarioTreeNode): ScenarioTreeNode | null => {
        // 状态过滤
        if (statusFilter !== 'all' && node.status !== statusFilter) {
          return null;
        }
        // 搜索过滤
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!node.scenario_name.toLowerCase().includes(term) &&
              !node.scenario_code.toLowerCase().includes(term)) {
            return null;
          }
        }

        // 递归过滤子节点
        const filteredChildren = node.children
          ?.map(child => filterNode(child))
          .filter((child): child is ScenarioTreeNode => child !== null);

        // 如果有子节点，返回带子节点的节点
        if (filteredChildren && filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }

        // 如果是目录类型但没有子节点被保留，也不保留该节点（除非它本身匹配搜索）
        if (node.children && node.children.length > 0 && (!filteredChildren || filteredChildren.length === 0)) {
          return searchTerm && (
            node.scenario_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.scenario_code.toLowerCase().includes(searchTerm.toLowerCase())
          ) ? node : null;
        }

        return { ...node, children: filteredChildren };
      };

      const filtered = businessScenarios
        .map(node => filterNode(node))
        .filter((node): node is ScenarioTreeNode => node !== null);

      setFilteredScenarioTree(filtered);
      setScenarioTree(filtered);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast.error('获取场景列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [statusFilter, searchTerm]);

  // 根节点分页逻辑
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredScenarioTree.slice(startIndex, endIndex);
    setPaginatedRootNodes(pageData);
  }, [filteredScenarioTree, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // 切换每页条数时重置到第一页
  };

  const handleAdd = (parentId?: number) => {
    setEditingScenario(null);
    setFormData({
      scenarioCode: '',
      scenarioName: '',
      parentId: parentId ? parentId.toString() : '',
      sortOrder: 0,
      status: 'active',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (node: ScenarioTreeNode) => {
    setEditingScenario(node);
    setFormData({
      scenarioCode: node.scenario_code,
      scenarioName: node.scenario_name,
      parentId: node.parent_id?.toString() || '',
      sortOrder: node.sort_order,
      status: node.status,
      description: node.description || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (node: ScenarioTreeNode) => {
    if (!confirm(`确定要删除场景"${node.scenario_name}"吗？`)) return;
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
    node: ScenarioTreeNode;
    level: number;
  }> = ({ node, level }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

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
          <TableCell className="font-mono text-sm">{node.scenario_code}</TableCell>
          <TableCell>
            <div 
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 16}px` }}
            >
              <FolderTree className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{node.scenario_name}</span>
            </div>
          </TableCell>
          <TableCell>{node.description || '-'}</TableCell>
          <TableCell className="text-center">{node.level}</TableCell>
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
                title="添加子场景"
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
            <FolderTree className="w-6 h-6" />
            业务场景管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理业务场景，支持多层级场景结构
          </p>
        </div>
        <Button onClick={() => handleAdd()} className="gap-2">
          <Plus className="w-4 h-4" />
          新建场景
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索场景名称或编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Button variant="outline" onClick={fetchScenarios} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 场景列表 - 树形表格 */}
      <Card>
        <CardHeader>
          <CardTitle>场景列表</CardTitle>
          <CardDescription>
            共 {countNodes(filteredScenarioTree)} 个场景
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : filteredScenarioTree.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>场景编码</TableHead>
                    <TableHead>场景名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="text-center">层级</TableHead>
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
          {filteredScenarioTree.length > 0 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="text-sm text-muted-foreground">
                共 {filteredScenarioTree.length} 条记录，第 {currentPage} 页
              </div>
              <SimplePagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredScenarioTree.length}
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
            <DialogTitle>{editingScenario ? '编辑场景' : '新建场景'}</DialogTitle>
            <DialogDescription>
              {editingScenario ? '修改场景信息' : '创建新的场景'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scenarioCode">
                  场景编码 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scenarioCode"
                  value={formData.scenarioCode}
                  onChange={(e) =>
                    setFormData({ ...formData, scenarioCode: e.target.value })
                  }
                  placeholder="例如: MARKET_OPERATION"
                  disabled={!!editingScenario}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenarioName">
                  场景名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="scenarioName"
                  value={formData.scenarioName}
                  onChange={(e) =>
                    setFormData({ ...formData, scenarioName: e.target.value })
                  }
                  placeholder="例如: 市场运营"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="场景描述..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              toast.success(editingScenario ? '更新成功' : '创建成功');
              setDialogOpen(false);
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 辅助函数：扁平化树形结构
function flattenTree(
  nodes: ScenarioTreeNode[],
  level: number = 0
): ScenarioTreeNode[] {
  const result: ScenarioTreeNode[] = [];
  nodes.forEach(node => {
    result.push({ ...node, level });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, level + 1));
    }
  });
  return result;
}

// 辅助函数：计算节点总数
function countNodes(nodes: ScenarioTreeNode[]): number {
  let count = 0;
  nodes.forEach(node => {
    count++;
    if (node.children) {
      count += countNodes(node.children);
    }
  });
  return count;
}
