'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Upload,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings,
  FolderTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ========== 数据类型定义 ==========

interface TreeNode {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  businessCategory: string;
  displayOrder: number;
  allowChildren: boolean;
  priority: number;
  status: '已生效' | '未生效' | '已停用';
  autoCloseOnTimeout: boolean;
  icon: string | null;
  description: string;
  children: TreeNode[];
}

// ========== 初始数据 ==========

const initialTreeData: TreeNode[] = [
  {
    id: 'cat-manage',
    name: '管理类',
    code: '1000',
    parentId: null,
    businessCategory: '管理类',
    displayOrder: 1,
    allowChildren: true,
    priority: 0,
    status: '已生效',
    autoCloseOnTimeout: false,
    icon: null,
    description: '管理类工单',
    children: [
      {
        id: 'type-indicator',
        name: '指标调度',
        code: '5110',
        parentId: 'cat-manage',
        businessCategory: '管理类',
        displayOrder: 1,
        allowChildren: false,
        priority: 3,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
      {
        id: 'type-alert-approval',
        name: '预警规则审批',
        code: '5120',
        parentId: 'cat-manage',
        businessCategory: '管理类',
        displayOrder: 2,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
    ],
  },
  {
    id: 'cat-production',
    name: '生产类',
    code: '2000',
    parentId: null,
    businessCategory: '客户类',
    displayOrder: 2,
    allowChildren: true,
    priority: 0,
    status: '已生效',
    autoCloseOnTimeout: false,
    icon: null,
    description: '测试q12222',
    children: [
      {
        id: 'type-opportunity',
        name: '商机调度',
        code: '5210',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 1,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
      {
        id: 'type-strategy',
        name: '策略调度',
        code: '5220',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 2,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
      {
        id: 'type-group',
        name: '客群调度',
        code: '5230',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 3,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
      {
        id: 'type-region',
        name: '区域攻坚调度',
        code: '5240',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 4,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '',
        children: [],
      },
      {
        id: 'type-alert',
        name: '预警调度',
        code: '5250',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 5,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '基于预警规则自动触发的调度工单',
        children: [],
      },
      {
        id: 'type-retain',
        name: '保有任务调度',
        code: '5260',
        parentId: 'cat-production',
        businessCategory: '客户类',
        displayOrder: 6,
        allowChildren: false,
        priority: 2,
        status: '已生效',
        autoCloseOnTimeout: false,
        icon: null,
        description: '存量客群保有维系任务，由运营人员选择客群后手动提交',
        children: [],
      },
    ],
  },
];

// ========== 辅助函数 ==========

let idCounter = 100;
function generateId(): string {
  idCounter += 1;
  return `node-${idCounter}`;
}

function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

function findParentNode(nodes: TreeNode[], childId: string): TreeNode | null {
  for (const node of nodes) {
    for (const child of node.children) {
      if (child.id === childId) return node;
    }
    const found = findParentNode(node.children, childId);
    if (found) return found;
  }
  return null;
}

function removeNodeById(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: removeNodeById(n.children, id),
    }));
}

function updateNodeInTree(nodes: TreeNode[], id: string, updater: (n: TreeNode) => TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    return { ...n, children: updateNodeInTree(n.children, id, updater) };
  });
}

function addChildToNode(nodes: TreeNode[], parentId: string, child: TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, child] };
    }
    return { ...n, children: addChildToNode(n.children, parentId, child) };
  });
}

function addRootNode(nodes: TreeNode[], node: TreeNode): TreeNode[] {
  return [...nodes, node];
}

function flattenTree(nodes: TreeNode[], depth = 0): { node: TreeNode; depth: number }[] {
  const result: { node: TreeNode; depth: number }[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}

function countAllNodes(nodes: TreeNode[]): number {
  let count = 0;
  for (const n of nodes) {
    count += 1;
    count += countAllNodes(n.children);
  }
  return count;
}

// ========== 业务分类选项 ==========
const businessCategories = ['客户类', '管理类', '产品类', '营销类', '服务类'];

// ========== 特征字段模拟数据 ==========
interface FeatureField {
  id: string;
  name: string;
  code: string;
  fieldType: string;
  required: boolean;
  displayOrder: number;
  status: string;
}

const defaultFeatureFields: Record<string, FeatureField[]> = {
  'type-indicator': [
    { id: 'f1', name: '指标名称', code: 'indicator_name', fieldType: '文本', required: true, displayOrder: 1, status: '已生效' },
    { id: 'f2', name: '指标编码', code: 'indicator_code', fieldType: '文本', required: true, displayOrder: 2, status: '已生效' },
    { id: 'f3', name: '异常阈值', code: 'threshold', fieldType: '数值', required: false, displayOrder: 3, status: '已生效' },
    { id: 'f4', name: '监测周期', code: 'monitor_cycle', fieldType: '下拉', required: true, displayOrder: 4, status: '已生效' },
  ],
  'type-opportunity': [
    { id: 'f5', name: '商机来源', code: 'opp_source', fieldType: '下拉', required: true, displayOrder: 1, status: '已生效' },
    { id: 'f6', name: '客户名称', code: 'customer_name', fieldType: '文本', required: true, displayOrder: 2, status: '已生效' },
    { id: 'f7', name: '联系电话', code: 'phone', fieldType: '文本', required: true, displayOrder: 3, status: '已生效' },
  ],
  'type-strategy': [
    { id: 'f8', name: '策略名称', code: 'strategy_name', fieldType: '文本', required: true, displayOrder: 1, status: '已生效' },
    { id: 'f9', name: '策略类型', code: 'strategy_type', fieldType: '下拉', required: true, displayOrder: 2, status: '已生效' },
  ],
  'type-group': [
    { id: 'f10', name: '客群名称', code: 'group_name', fieldType: '文本', required: true, displayOrder: 1, status: '已生效' },
    { id: 'f11', name: '客群规模', code: 'group_size', fieldType: '数值', required: false, displayOrder: 2, status: '已生效' },
  ],
  'type-region': [
    { id: 'f12', name: '攻坚区域', code: 'region_name', fieldType: '下拉', required: true, displayOrder: 1, status: '已生效' },
    { id: 'f13', name: '目标小区数', code: 'target_count', fieldType: '数值', required: true, displayOrder: 2, status: '已生效' },
  ],
};

// ========== 主页面组件 ==========

export default function WorkOrderTypeManagementPage() {
  const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['cat-manage', 'cat-production']));
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [activeTab, setActiveTab] = useState<'type' | 'feature'>('type');

  // 新增弹窗
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    name: '',
    businessCategory: '',
    allowChildren: false,
    status: '已生效' as '已生效' | '未生效' | '已停用',
    autoCloseOnTimeout: false,
    icon: null as string | null,
    description: '',
    displayOrder: 1,
    priority: 0,
  });

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 编辑状态（右侧表单是否可编辑）
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TreeNode | null>(null);

  // 特征字段管理
  const [featureFields, setFeatureFields] = useState<Record<string, FeatureField[]>>(defaultFeatureFields);
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    code: '',
    fieldType: '文本',
    required: false,
    displayOrder: 1,
  });

  const selectedNode = selectedNodeId ? findNodeById(treeData, selectedNodeId) : null;

  // ====== 树节点操作 ======

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab('type');
    setIsEditing(false);
    const node = findNodeById(treeData, nodeId);
    if (node) {
      setEditForm({ ...node });
    }
  };

  // 打开新增弹窗
  const handleOpenAdd = (parentId: string | null) => {
    setAddParentId(parentId);
    setAddForm({
      name: '',
      businessCategory: '',
      allowChildren: false,
      status: '已生效',
      autoCloseOnTimeout: false,
      icon: null,
      description: '',
      displayOrder: parentId ? (findNodeById(treeData, parentId)?.children.length || 0) + 1 : treeData.length + 1,
      priority: 0,
    });
    setAddDialogOpen(true);
  };

  // 确认新增
  const handleConfirmAdd = () => {
    if (!addForm.name.trim()) return;
    const newNode: TreeNode = {
      id: generateId(),
      name: addForm.name,
      code: '',
      parentId: addParentId,
      businessCategory: addForm.businessCategory,
      displayOrder: addForm.displayOrder,
      allowChildren: addForm.allowChildren,
      priority: addForm.priority,
      status: addForm.status,
      autoCloseOnTimeout: addForm.autoCloseOnTimeout,
      icon: addForm.icon,
      description: addForm.description,
      children: [],
    };

    if (addParentId) {
      setTreeData((prev) => addChildToNode(prev, addParentId, newNode));
      setExpandedNodes((prev) => new Set([...prev, addParentId]));
    } else {
      setTreeData((prev) => addRootNode(prev, newNode));
    }

    setAddDialogOpen(false);
    setSelectedNodeId(newNode.id);
    setEditForm(newNode);
  };

  // 删除
  const handleOpenDelete = (nodeId: string) => {
    setDeleteTargetId(nodeId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const node = findNodeById(treeData, deleteTargetId);
    if (!node) return;

    setTreeData((prev) => removeNodeById(prev, deleteTargetId));

    // 清理特征字段
    if (featureFields[deleteTargetId]) {
      setFeatureFields((prev) => {
        const next = { ...prev };
        delete next[deleteTargetId];
        return next;
      });
    }

    if (selectedNodeId === deleteTargetId) {
      setSelectedNodeId(null);
      setEditForm(null);
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editForm || !selectedNodeId) return;
    setTreeData((prev) =>
      updateNodeInTree(prev, selectedNodeId, (n) => ({
        ...n,
        name: editForm.name,
        code: editForm.code,
        businessCategory: editForm.businessCategory,
        displayOrder: editForm.displayOrder,
        allowChildren: editForm.allowChildren,
        priority: editForm.priority,
        status: editForm.status,
        autoCloseOnTimeout: editForm.autoCloseOnTimeout,
        icon: editForm.icon,
        description: editForm.description,
      }))
    );
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (selectedNode) {
      setEditForm({ ...selectedNode });
    }
    setIsEditing(false);
  };

  // 特征字段新增
  const handleAddField = () => {
    if (!selectedNodeId || !newField.name.trim() || !newField.code.trim()) return;
    const field: FeatureField = {
      id: `f-${Date.now()}`,
      name: newField.name,
      code: newField.code,
      fieldType: newField.fieldType,
      required: newField.required,
      displayOrder: newField.displayOrder,
      status: '已生效',
    };
    setFeatureFields((prev) => ({
      ...prev,
      [selectedNodeId]: [...(prev[selectedNodeId] || []), field],
    }));
    setNewField({ name: '', code: '', fieldType: '文本', required: false, displayOrder: 1 });
    setAddFieldDialogOpen(false);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedNodeId) return;
    setFeatureFields((prev) => ({
      ...prev,
      [selectedNodeId]: (prev[selectedNodeId] || []).filter((f) => f.id !== fieldId),
    }));
  };

  // ====== 搜索过滤 ======

  const filteredTreeData = useMemo(() => {
    if (!searchText.trim() && filterCategory === '全部') return treeData;

    function filterNodes(nodes: TreeNode[]): TreeNode[] {
      return nodes.reduce<TreeNode[]>((acc, node) => {
        const nameMatch = !searchText.trim() || node.name.includes(searchText.trim());
        const categoryMatch = filterCategory === '全部' || node.businessCategory === filterCategory;
        const matchesSelf = nameMatch && categoryMatch;
        const filteredChildren = filterNodes(node.children);
        const hasMatchingChildren = filteredChildren.length > 0;

        if (matchesSelf || hasMatchingChildren) {
          acc.push({ ...node, children: hasMatchingChildren ? filteredChildren : node.children });
        }
        return acc;
      }, []);
    }

    return filterNodes(treeData);
  }, [treeData, searchText, filterCategory]);

  // ====== 渲染树节点 ======

  const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isLeaf = !node.allowChildren && node.children.length === 0;

    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center group cursor-pointer rounded-md px-2 py-1.5 text-sm
            hover:bg-accent/50 transition-colors
            ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}
          `}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => handleSelectNode(node.id)}
        >
          {/* 展开/收起箭头 */}
          {hasChildren || node.allowChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="mr-1 p-0.5 rounded hover:bg-muted"
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <span className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* 图标 */}
          {isLeaf ? (
            <FileText className="h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <FolderTree className="h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
          )}

          {/* 名称 */}
          <span className="flex-1 truncate">{node.name}</span>

          {/* 状态Badge */}
          {node.status !== '已生效' && (
            <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4">
              {node.status}
            </Badge>
          )}

          {/* 悬浮操作按钮 */}
          <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
            {node.allowChildren && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAdd(node.id);
                      }}
                      className="p-0.5 rounded hover:bg-primary/20 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">添加子类型</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(node.id);
                    }}
                    className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">删除</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 子节点 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ====== 获取父节点名称 ======
  const getParentName = (nodeId: string): string => {
    if (!nodeId) return '';
    const parent = findParentNode(treeData, nodeId);
    return parent ? parent.name : '';
  };

  const currentFeatureFields = selectedNodeId ? featureFields[selectedNodeId] || [] : [];

  return (
    <div className="flex h-full bg-background">
      {/* ====== 左侧：树形导航 ====== */}
      <div className="w-72 border-r bg-card flex flex-col">
        {/* 筛选区 */}
        <div className="p-3 border-b space-y-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="业务分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              {businessCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="请输入工单类型"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-8 text-xs pl-7"
            />
          </div>
        </div>

        {/* 树形列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* 根节点标题 + 新增根节点按钮 */}
          <div className="flex items-center justify-between mb-1 px-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">工单类型</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleOpenAdd(null)}
                    className="p-1 rounded hover:bg-primary/10 text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>新增根节点</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {filteredTreeData
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((node) => renderTreeNode(node))}
        </div>

        {/* 统计 */}
        <div className="px-3 py-2 border-t text-[11px] text-muted-foreground">
          共 {countAllNodes(treeData)} 个工单类型
        </div>
      </div>

      {/* ====== 右侧：内容区 ====== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNode && editForm ? (
          <>
            {/* Tab切换 */}
            <div className="border-b px-6 pt-4 flex items-center gap-6">
              <button
                onClick={() => setActiveTab('type')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'type'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                工单类型
              </button>
              <button
                onClick={() => setActiveTab('feature')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'feature'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                特征字段
              </button>
            </div>

            {/* Tab内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'type' ? (
                /* 工单类型表单 */
                <div className="max-w-2xl space-y-5">
                  {/* 工单类型名称 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">
                      <span className="text-destructive">*</span> 工单类型名称
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        maxLength={20}
                      />
                    ) : (
                      <span className="text-sm">{selectedNode.name}</span>
                    )}
                  </div>

                  {/* 工单类型编码 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">工单类型编码</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.code}
                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                        placeholder="请输入工单类型编码"
                      />
                    ) : (
                      <span className="text-sm">{selectedNode.code || '-'}</span>
                    )}
                  </div>

                  {/* 上级类型 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">上级类型</Label>
                    <span className="text-sm text-muted-foreground">
                      {getParentName(selectedNode.id) || '（无）'}
                    </span>
                  </div>

                  {/* 业务分类 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">业务分类</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.businessCategory}
                        onValueChange={(v) => setEditForm({ ...editForm, businessCategory: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择业务分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessCategories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{selectedNode.businessCategory || '-'}</span>
                    )}
                  </div>

                  {/* 显示顺序 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">
                      <span className="text-destructive">*</span> 显示顺序
                    </Label>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editForm.displayOrder}
                          onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })}
                          className="w-24"
                        />
                        <div className="flex flex-col">
                          <button
                            onClick={() => setEditForm({ ...editForm, displayOrder: editForm.displayOrder + 1 })}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditForm({ ...editForm, displayOrder: Math.max(1, editForm.displayOrder - 1) })}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">{selectedNode.displayOrder}</span>
                    )}
                  </div>

                  {/* 允许添加子类 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">允许添加子类</Label>
                    {isEditing ? (
                      <RadioGroup
                        value={editForm.allowChildren ? '是' : '否'}
                        onValueChange={(v) => setEditForm({ ...editForm, allowChildren: v === '是' })}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="是" id="allow-yes" />
                          <Label htmlFor="allow-yes" className="text-sm">是</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="否" id="allow-no" />
                          <Label htmlFor="allow-no" className="text-sm">否</Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <span className="text-sm">{selectedNode.allowChildren ? '是' : '否'}</span>
                    )}
                  </div>

                  {/* 处理优先级 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">处理优先级</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: parseInt(e.target.value) || 0 })}
                        placeholder="请输入处理优先级"
                      />
                    ) : (
                      <span className="text-sm">{selectedNode.priority}</span>
                    )}
                  </div>

                  {/* 工单类型状态 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">工单类型状态</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.status}
                        onValueChange={(v) => setEditForm({ ...editForm, status: v as TreeNode['status'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="已生效">已生效</SelectItem>
                          <SelectItem value="未生效">未生效</SelectItem>
                          <SelectItem value="已停用">已停用</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={selectedNode.status === '已生效' ? 'default' : selectedNode.status === '未生效' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {selectedNode.status}
                      </Badge>
                    )}
                  </div>

                  {/* 超时自动关单 */}
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm text-right">超时自动关单</Label>
                    {isEditing ? (
                      <Switch
                        checked={editForm.autoCloseOnTimeout}
                        onCheckedChange={(v) => setEditForm({ ...editForm, autoCloseOnTimeout: v })}
                      />
                    ) : (
                      <Switch checked={selectedNode.autoCloseOnTimeout} disabled />
                    )}
                  </div>

                  {/* 类型图标 */}
                  <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                    <Label className="text-sm text-right pt-2">类型图标</Label>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Upload className="h-3.5 w-3.5" />
                            上传图标
                          </Button>
                          <p className="text-[11px] text-muted-foreground">
                            只能上传jpg/png文件，且不超过500kb
                          </p>
                        </div>
                      ) : selectedNode.icon ? (
                        <span className="text-sm">已上传</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">未上传</span>
                      )}
                    </div>
                  </div>

                  {/* 工单描述 */}
                  <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                    <Label className="text-sm text-right pt-2">工单描述</Label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="请输入工单描述"
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    ) : (
                      <span className="text-sm">{selectedNode.description || '-'}</span>
                    )}
                  </div>
                </div>
              ) : (
                /* 特征字段Tab */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">特征字段列表</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewField({ name: '', code: '', fieldType: '文本', required: false, displayOrder: currentFeatureFields.length + 1 });
                        setAddFieldDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      新增字段
                    </Button>
                  </div>

                  {currentFeatureFields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      暂无特征字段，点击"新增字段"添加
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="text-left px-4 py-3 font-medium">字段名称</th>
                            <th className="text-left px-4 py-3 font-medium">字段编码</th>
                            <th className="text-left px-4 py-3 font-medium">字段类型</th>
                            <th className="text-center px-4 py-3 font-medium">必填</th>
                            <th className="text-center px-4 py-3 font-medium">显示顺序</th>
                            <th className="text-center px-4 py-3 font-medium">状态</th>
                            <th className="text-center px-4 py-3 font-medium">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentFeatureFields
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((field) => (
                              <tr key={field.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-4 py-2.5">{field.name}</td>
                                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{field.code}</td>
                                <td className="px-4 py-2.5">
                                  <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {field.required ? (
                                    <Badge className="text-[10px] bg-primary/10 text-primary hover:bg-primary/10">必填</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-center">{field.displayOrder}</td>
                                <td className="px-4 py-2.5 text-center">
                                  <Badge variant="secondary" className="text-xs">{field.status}</Badge>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <button
                                    onClick={() => handleDeleteField(field.id)}
                                    className="text-destructive hover:text-destructive/80 text-xs"
                                  >
                                    删除
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            <div className="border-t px-6 py-3 flex items-center justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    保存
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setSelectedNodeId(null)}>
                    取消
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    编辑
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          /* 未选择节点时的空状态 */
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm">请在左侧选择一个工单类型</p>
              <p className="text-xs mt-1">或点击 + 按钮新增工单类型</p>
            </div>
          </div>
        )}
      </div>

      {/* ====== 新增工单类型弹窗 ====== */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加工单类型</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 工单类型名称 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">
                <span className="text-destructive">*</span> 类型名称
              </Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                maxLength={20}
                placeholder="请输入工单类型名称"
              />
            </div>

            {/* 上级类型（只读） */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">上级类型</Label>
              <span className="text-sm text-muted-foreground">
                {addParentId ? findNodeById(treeData, addParentId)?.name || '-' : '（无，作为根节点）'}
              </span>
            </div>

            {/* 业务分类 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">业务分类</Label>
              <Select
                value={addForm.businessCategory}
                onValueChange={(v) => setAddForm({ ...addForm, businessCategory: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择业务分类" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 允许添加子类 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">允许添加子类</Label>
              <RadioGroup
                value={addForm.allowChildren ? '是' : '否'}
                onValueChange={(v) => setAddForm({ ...addForm, allowChildren: v === '是' })}
                className="flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="是" id="add-allow-yes" />
                  <Label htmlFor="add-allow-yes" className="text-sm">是</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="否" id="add-allow-no" />
                  <Label htmlFor="add-allow-no" className="text-sm">否</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 显示顺序 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">
                <span className="text-destructive">*</span> 显示顺序
              </Label>
              <Input
                type="number"
                value={addForm.displayOrder}
                onChange={(e) => setAddForm({ ...addForm, displayOrder: parseInt(e.target.value) || 1 })}
                placeholder="请输入显示顺序"
              />
            </div>

            {/* 处理优先级 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">处理优先级</Label>
              <Input
                type="number"
                value={addForm.priority}
                onChange={(e) => setAddForm({ ...addForm, priority: parseInt(e.target.value) || 0 })}
                placeholder="请输入处理优先级"
              />
            </div>

            {/* 工单类型状态 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">工单类型状态</Label>
              <Select
                value={addForm.status}
                onValueChange={(v) => setAddForm({ ...addForm, status: v as TreeNode['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择工单类型状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="已生效">已生效</SelectItem>
                  <SelectItem value="未生效">未生效</SelectItem>
                  <SelectItem value="已停用">已停用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 超时自动关单 */}
            <div className="grid grid-cols-[100px_1fr] items-center gap-3">
              <Label className="text-sm text-right">超时自动关单</Label>
              <Switch
                checked={addForm.autoCloseOnTimeout}
                onCheckedChange={(v) => setAddForm({ ...addForm, autoCloseOnTimeout: v })}
              />
            </div>

            {/* 类型图标 */}
            <div className="grid grid-cols-[100px_1fr] items-start gap-3">
              <Label className="text-sm text-right pt-2">类型图标</Label>
              <div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  上传图标
                </Button>
                <p className="text-[11px] text-muted-foreground mt-1">
                  只能上传jpg/png文件，且不超过500kb
                </p>
              </div>
            </div>

            {/* 工单描述 */}
            <div className="grid grid-cols-[100px_1fr] items-start gap-3">
              <Label className="text-sm text-right pt-2">工单描述</Label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="请输入工单描述"
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmAdd} disabled={!addForm.name.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== 删除确认弹窗 ====== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            确定要删除工单类型「{deleteTargetId ? findNodeById(treeData, deleteTargetId)?.name : ''}」吗？
            {deleteTargetId && findNodeById(treeData, deleteTargetId)?.children.length ? (
              <span className="text-destructive block mt-1">该类型下还有子类型，将一并删除。</span>
            ) : null}
            此操作不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== 新增特征字段弹窗 ====== */}
      <Dialog open={addFieldDialogOpen} onOpenChange={setAddFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增特征字段</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <Label className="text-sm text-right"><span className="text-destructive">*</span> 字段名称</Label>
              <Input value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} placeholder="请输入字段名称" />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <Label className="text-sm text-right"><span className="text-destructive">*</span> 字段编码</Label>
              <Input value={newField.code} onChange={(e) => setNewField({ ...newField, code: e.target.value })} placeholder="请输入字段编码" />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <Label className="text-sm text-right">字段类型</Label>
              <Select value={newField.fieldType} onValueChange={(v) => setNewField({ ...newField, fieldType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="文本">文本</SelectItem>
                  <SelectItem value="数值">数值</SelectItem>
                  <SelectItem value="下拉">下拉</SelectItem>
                  <SelectItem value="日期">日期</SelectItem>
                  <SelectItem value="多选">多选</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <Label className="text-sm text-right">必填</Label>
              <Switch checked={newField.required} onCheckedChange={(v) => setNewField({ ...newField, required: v })} />
            </div>
            <div className="grid grid-cols-[80px_1fr] items-center gap-3">
              <Label className="text-sm text-right">显示顺序</Label>
              <Input type="number" value={newField.displayOrder} onChange={(e) => setNewField({ ...newField, displayOrder: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFieldDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddField} disabled={!newField.name.trim() || !newField.code.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
