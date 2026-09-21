'use client';

import { useState, useRef, WheelEvent } from 'react';
import {
  Trash2, Save, Eye, Upload, Search, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Maximize2, Minimize2, Tag as TagIcon, ChevronRight, ChevronDown
} from 'lucide-react';
import MetricGroupSelector, { MetricGroup } from './MetricGroupSelector';
import CustomerTagConfigModal from './CustomerTagConfigModal';
import { CustomerTagNodeData } from '@/types/customerTag';

// 导出类型定义，供父组件使用
export type NodeType = 'root' | 'category' | 'business_metric' | 'segment_metric' | 'customer_tag';

export interface TreeNode {
  id: string;
  name: string;
  metricCode?: string;
  type: NodeType;
  children: TreeNode[];
  collapsed?: boolean;
  // 业务指标/客群指标特有字段
  metricGroup?: string;
  metricGroupName?: string;
  defaultMetric?: string;
  additionalMetric?: string;
  metricShortName?: string;
  // 客户标签特有字段
  customerTagData?: CustomerTagNodeData;
}

// 导出指标树基本信息
export interface TreeBasicInfo {
  name: string;
  region: string;
  granularity: string;
  businessScenario: string;
  description: string;
  isTemplate: boolean;
}

// 指标树草稿数据类型
export interface MetricTreeDraft {
  id: string;
  code: string;
  name: string;
  businessScenario: string;
  status: 'draft';
  version: string;
  region: string;
  granularity: string;
  creator: string;
  createTime: string;
  validFrom: string;
  validTo: string;
  treeData: TreeNode;
  treeInfo: TreeBasicInfo;
}

interface MetricTreeEditorProps {
  initialTree?: TreeNode;
  initialInfo?: TreeBasicInfo;
  groupName: string;
  onSave: (tree: TreeNode, info: TreeBasicInfo) => void;
  onCancel: () => void;
  onSaveDraft?: (tree: TreeNode, info: TreeBasicInfo) => void;
  onPreview?: (tree: TreeNode, info: TreeBasicInfo) => void;
}

// 节点类型配置
const nodeTypeConfig = {
  root: { label: '根节点', color: 'bg-blue-50 border-blue-300' },
  category: { label: '分类节点', color: 'bg-purple-50 border-purple-300' },
  business_metric: { label: '业务指标', color: 'bg-green-50 border-green-300' },
  segment_metric: { label: '客群指标', color: 'bg-orange-50 border-orange-300' },
  customer_tag: { label: '客户标签', color: 'bg-pink-50 border-pink-300' },
};

// 节点卡片组件
const MetricCard = ({
  node,
  level,
  onAdd,
  onDelete,
  onSelect,
  selectedNodeId,
  onToggleCollapse
}: {
  node: TreeNode;
  level: number;
  onAdd: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  selectedNodeId: string;
  onToggleCollapse: (nodeId: string) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedNodeId;
  const config = nodeTypeConfig[node.type];

  return (
    <div className="flex items-start relative">
      {/* 卡片 */}
      <div className="relative" title={node.name}>
        <div
          className={`
            relative w-[180px] h-[80px] p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm flex flex-col
            ${isSelected ? config.color : 'bg-white border-gray-300'}
          `}
          onClick={() => onSelect(node.id)}
        >
          {/* 节点类型标签 */}
          <div className={`text-xs mb-1 shrink-0 ${isSelected ? 'text-gray-500' : 'text-gray-600'}`}>
            {config.label}
          </div>

          {/* 指标编码 */}
          {node.metricCode && (
            <div className={`text-xs mb-1 shrink-0 truncate ${isSelected ? 'text-gray-500' : 'text-gray-600'}`} title={node.metricCode}>
              {node.metricCode}
            </div>
          )}

          {/* 节点名称 - 支持省略 */}
          <div className={`text-sm font-medium leading-tight flex-1 overflow-hidden ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
            <div className="truncate" title={node.name}>
              {node.name}
            </div>
          </div>

          {/* 右侧：按钮容器 */}
          <div className="absolute top-3 right-2 flex flex-col gap-1 shrink-0">
            {/* 加号按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(node.id);
              }}
              className="w-5 h-5 bg-white hover:bg-gray-100 text-blue-600 rounded flex items-center justify-center shadow-sm transition-colors border border-gray-300"
              title="添加子节点"
            >
              <span className="text-sm font-medium leading-none">+</span>
            </button>

            {/* 减号按钮 */}
            {node.type !== 'root' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="w-5 h-5 bg-white hover:bg-gray-100 text-blue-600 rounded flex items-center justify-center shadow-sm transition-colors border border-gray-300"
                title="删除节点"
              >
                <span className="text-sm font-medium leading-none">-</span>
              </button>
            )}
          </div>

          {/* 展开收起按钮 - 右侧边缘 */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(node.id);
              }}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all z-10"
              title={node.collapsed ? "展开" : "收起"}
            >
              {node.collapsed ? (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 子节点容器 - 纵向排列 */}
      {hasChildren && !node.collapsed && (
        <div className="flex flex-col gap-6 ml-6 relative">
          {/* 从父节点右侧中心到第一个子节点的连接线 */}
          <div
            className="absolute left-0 bg-blue-400 pointer-events-none"
            style={{
              top: '40px', // 从父节点高度的一半（80px / 2）开始
              height: '20px',
              width: '2px',
              zIndex: 0,
            }}
          />

          {/* 垂直主线 - 贯穿所有子节点 */}
          <div
            className="absolute left-0 bg-blue-400 pointer-events-none"
            style={{
              top: '60px',
              bottom: '24px',
              width: '2px',
              zIndex: 0,
            }}
          />

          {/* 子节点 */}
          {node.children.map((child, index) => {
            const isLastChild = index === node.children.length - 1;

            return (
              <div key={child.id} className="relative flex items-start">
                {/* 水平分支 - 从垂直线精准延伸到子节点左侧中心 */}
                <div
                  className="absolute bg-blue-400 pointer-events-none flex items-center"
                  style={{
                    left: '0',
                    top: '40px', // 子节点高度的一半（80px / 2）
                    width: '24px',
                    height: '2px',
                    zIndex: 0,
                  }}
                >
                  {/* 添加箭头 - 指向子节点 */}
                  <svg
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 1L7 4L1 7"
                      stroke="#60B3E2"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="pl-6 relative">
                  <MetricCard
                    node={child}
                    level={level + 1}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    onSelect={onSelect}
                    selectedNodeId={selectedNodeId}
                    onToggleCollapse={onToggleCollapse}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function MetricTreeEditor({
  initialTree,
  initialInfo,
  groupName,
  onSave,
  onCancel,
  onSaveDraft,
  onPreview
}: MetricTreeEditorProps) {
  const [tree, setTree] = useState<TreeNode>(
    initialTree || {
      id: 'root',
      name: groupName,
      type: 'root',
      children: []
    }
  );

  // 指标树基本信息
  const [treeInfo, setTreeInfo] = useState<TreeBasicInfo>(
    initialInfo || {
      name: groupName,
      region: '全国',
      granularity: '',
      businessScenario: '',
      description: '',
      isTemplate: false
    }
  );

  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // 画布缩放和移动状态
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);

  // 指标组选择弹窗
  const [showMetricGroupSelector, setShowMetricGroupSelector] = useState(false);

  // 客户标签配置弹窗
  const [showCustomerTagConfig, setShowCustomerTagConfig] = useState(false);

  // 删除确认对话框
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [nodeToDeleteName, setNodeToDeleteName] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // 查找节点
  const findNode = (node: TreeNode, nodeId: string): TreeNode | null => {
    if (node.id === nodeId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  // 查找并更新节点
  const findAndUpdateNode = (
    node: TreeNode,
    nodeId: string,
    updateFn: (node: TreeNode) => TreeNode
  ): TreeNode => {
    if (node.id === nodeId) {
      return updateFn(node);
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map(child =>
          findAndUpdateNode(child, nodeId, updateFn)
        )
      };
    }

    return node;
  };

  // 从节点中删除子节点（递归）
  const removeNodeFromTree = (node: TreeNode, nodeId: string): TreeNode | null => {
    // 检查子节点中是否有要删除的节点
    if (node.children && node.children.some(child => child.id === nodeId)) {
      return {
        ...node,
        children: node.children.filter(child => child.id !== nodeId)
      };
    }

    // 递归检查子节点的子节点
    if (node.children) {
      const newChildren = node.children
        .map(child => removeNodeFromTree(child, nodeId))
        .filter(Boolean) as TreeNode[];

      return {
        ...node,
        children: newChildren
      };
    }

    return node;
  };

  // 添加节点
  const addNode = (parentId: string) => {
    const newId = `node-${Date.now()}`;

    // 查找父节点
    const parentNode = findNode(tree, parentId);

    // 如果父节点有customerTagData，则继承（深拷贝）
    const inheritedCustomerTagData = parentNode?.customerTagData ? {
      selectedTags: [...parentNode.customerTagData.selectedTags],
      segment: {
        id: `segment-${Date.now()}`,
        name: '新客群分层',
        tagConditions: parentNode.customerTagData.segment.tagConditions.map((cond: any) => ({
          tagId: cond.tagId,
          tagName: cond.tagName,
          tagType: cond.tagType,
          operator: cond.operator,
          value: { ...cond.value }
        })),
        logic: parentNode.customerTagData.segment.logic
      }
    } : undefined;

    const newNode: TreeNode = {
      id: newId,
      name: '请输入名称',
      type: 'category',
      children: [],
      customerTagData: inheritedCustomerTagData
    };

    // 更新树并自动选中新节点
    setTree(prev => {
      const updated = findAndUpdateNode(prev, parentId, node => ({
        ...node,
        children: [...(node.children || []), newNode]
      }));

      // 立即选中新节点
      setSelectedNodeId(newId);
      setSelectedNode(newNode);

      return updated;
    });
  };

  // 删除节点（打开确认对话框）
  const deleteNode = (nodeId: string) => {
    const node = findNode(tree, nodeId);
    if (node) {
      setNodeToDelete(nodeId);
      setNodeToDeleteName(node.name);
      setShowDeleteConfirm(true);
    }
  };

  // 确认删除节点
  const handleDeleteConfirm = () => {
    if (!nodeToDelete) return;

    setTree(prev => {
      // 递归删除节点，确保返回TreeNode
      const updated = removeNodeFromTree(prev, nodeToDelete) || prev;
      return updated;
    });

    // 如果删除的是选中节点，清除选中状态
    if (selectedNodeId === nodeToDelete) {
      setSelectedNodeId('');
      setSelectedNode(null);
    }

    // 关闭对话框并清除状态
    setShowDeleteConfirm(false);
    setNodeToDelete(null);
    setNodeToDeleteName('');
  };

  // 取消删除节点
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setNodeToDelete(null);
    setNodeToDeleteName('');
  };

  // 选择节点
  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const found = findNode(tree, nodeId);
    setSelectedNode(found);
  };

  // 更新节点属性
  const updateNode = (field: keyof TreeNode, value: any) => {
    if (!selectedNode) return;

    // 对customerTagData进行深拷贝，避免引用共享
    let newValue = value;
    if (field === 'customerTagData' && value) {
      newValue = {
        selectedTags: [...value.selectedTags],
        segment: {
          id: value.segment.id,
          name: value.segment.name,
          tagConditions: value.segment.tagConditions.map((cond: any) => ({
            tagId: cond.tagId,
            tagName: cond.tagName,
            tagType: cond.tagType,
            operator: cond.operator,
            value: { ...cond.value }
          })),
          logic: value.segment.logic
        }
      };
    }

    setTree(prev =>
      findAndUpdateNode(prev, selectedNode.id, node => ({
        ...node,
        [field]: newValue
      }))
    );

    setSelectedNode(prev => prev ? { ...prev, [field]: newValue } : null);
  };

  // 处理画布缩放
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  // 处理画布移动
  const handlePan = (direction: 'left' | 'right' | 'up' | 'down') => {
    const step = 100;
    setTranslateX(prev => direction === 'left' ? prev - step : direction === 'right' ? prev + step : prev);
    setTranslateY(prev => direction === 'up' ? prev - step : direction === 'down' ? prev + step : prev);
  };

  // 处理全屏/退出全屏
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => {
        const newScale = Math.max(0.25, Math.min(3, prev + delta));
        return newScale;
      });
    }
  };

  // 处理鼠标拖拽 - 优化拖拽体验
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只允许左键拖拽
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStartX(e.clientX - translateX);
      setDragStartY(e.clientY - translateY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && canvasRef.current) {
      // 使用 requestAnimationFrame 优化拖拽性能
      requestAnimationFrame(() => {
        setTranslateX(e.clientX - dragStartX);
        setTranslateY(e.clientY - dragStartY);
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 切换节点展开收起状态
  const toggleCollapse = (nodeId: string) => {
    setTree(prev =>
      findAndUpdateNode(prev, nodeId, node => ({
        ...node,
        collapsed: !node.collapsed
      }))
    );
  };

  // 指标组选择回调
  const handleSelectMetricGroup = (group: MetricGroup) => {
    updateNode('metricGroup', group.id);
    updateNode('metricGroupName', group.name);
    setShowMetricGroupSelector(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部按钮栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">创建指标树</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onSaveDraft?.(tree, treeInfo)}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            保存草稿
          </button>
          <button
            onClick={() => onPreview?.(tree, treeInfo)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            预览
          </button>
          <button
            onClick={() => onSave(tree, treeInfo)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            发布
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧：卡片树 */}
        <div className="flex-1 overflow-hidden relative">
          {/* 画布容器 */}
          <div
            ref={canvasRef}
            className={`absolute inset-0 bg-gray-50 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              if (e.target === canvasRef.current) {
                setSelectedNodeId('');
                setSelectedNode(null);
              }
            }}
          >
            {/* 可缩放和移动的内容 */}
            <div
              className="absolute origin-top-left"
              style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                left: '140px',
                top: '140px',
                willChange: 'transform',
              }}
            >
              <div className="flex items-start">
                <MetricCard
                  node={tree}
                  level={0}
                  onAdd={addNode}
                  onDelete={deleteNode}
                  onSelect={selectNode}
                  selectedNodeId={selectedNodeId}
                  onToggleCollapse={toggleCollapse}
                />
              </div>
            </div>
          </div>

          {/* 底部工具栏 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={() => handlePan('left')}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
              title="向左移动"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePan('right')}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
              title="向右移动"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={handleToggleFullscreen}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
              title="全屏"
            >
              {document.fullscreenElement ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 右侧：属性面板 */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              {selectedNode ? '节点属性' : '基本信息'}
            </h3>

            {/* 未选中节点 - 显示基本信息 */}
            {!selectedNode ? (
              <div className="space-y-4">
                {/* 指标树名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标树名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={treeInfo.name}
                    onChange={(e) => setTreeInfo({ ...treeInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入指标树名称"
                  />
                </div>

                {/* 归属区域 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    归属区域
                  </label>
                  <select
                    value={treeInfo.region}
                    onChange={(e) => setTreeInfo({ ...treeInfo, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="全国">全国</option>
                    <option value="华北">华北</option>
                    <option value="华东">华东</option>
                    <option value="华南">华南</option>
                    <option value="华中">华中</option>
                    <option value="西北">西北</option>
                    <option value="西南">西南</option>
                    <option value="东北">东北</option>
                  </select>
                </div>

                {/* 分析粒度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分析粒度
                  </label>
                  <select
                    value={treeInfo.granularity}
                    onChange={(e) => setTreeInfo({ ...treeInfo, granularity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    <option value="集团">集团</option>
                    <option value="省份">地州</option>
                  </select>
                </div>

                {/* 业务场景 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    业务场景
                  </label>
                  <select
                    value={treeInfo.businessScenario}
                    onChange={(e) => setTreeInfo({ ...treeInfo, businessScenario: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    <option value="离网">离网</option>
                    <option value="中高端">中高端</option>
                    <option value="全球通">全球通</option>
                    <option value="国际业务">国际业务</option>
                    <option value="家庭">家庭</option>
                    <option value="融合运营">融合运营</option>
                    <option value="用量运营">用量运营</option>
                    <option value="细分市场运营">细分市场运营</option>
                  </select>
                </div>

                {/* 指标树描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    指标树描述
                  </label>
                  <textarea
                    value={treeInfo.description}
                    onChange={(e) => setTreeInfo({ ...treeInfo, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="请输入指标树描述"
                  />
                </div>

                {/* 同时设置为模板 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    checked={treeInfo.isTemplate}
                    onChange={(e) => setTreeInfo({ ...treeInfo, isTemplate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isTemplate" className="ml-2 text-sm text-gray-700">
                    同时设置为模板
                  </label>
                </div>
              </div>
            ) : (
              /* 选中节点 - 显示节点属性 */
              <div className="space-y-4">
                {/* 节点名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    节点名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => updateNode('name', e.target.value)}
                    disabled={selectedNode.type === 'root'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="请输入节点名称"
                  />
                </div>

                {/* 节点类型 - 根节点不显示类型选择 */}
                {selectedNode.type !== 'root' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      节点类型
                    </label>
                    <select
                      value={selectedNode.type}
                      onChange={(e) => updateNode('type', e.target.value as NodeType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="category">分类节点</option>
                      <option value="business_metric">业务指标</option>
                      <option value="segment_metric">客群指标</option>
                      <option value="customer_tag">自定义客群</option>
                    </select>
                  </div>
                )}

                {/* 业务指标/客群指标/根节点特有字段 */}
                {(selectedNode.type === 'business_metric' || selectedNode.type === 'segment_metric' || selectedNode.type === 'root') && (
                  <>
                    {/* 业务指标组 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        业务指标组
                      </label>
                      <button
                        onClick={() => setShowMetricGroupSelector(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50"
                      >
                        <span className={selectedNode.metricGroupName ? 'text-gray-900' : 'text-gray-400'}>
                          {selectedNode.metricGroupName || '点击选择指标组'}
                        </span>
                        <Search className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* 默认指标 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        默认指标
                      </label>
                      <select
                        value={selectedNode.defaultMetric || ''}
                        onChange={(e) => updateNode('defaultMetric', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">请选择</option>
                        <option value="metric1">指标1</option>
                        <option value="metric2">指标2</option>
                        <option value="metric3">指标3</option>
                      </select>
                    </div>

                    {/* 附加指标 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        附加指标
                      </label>
                      <select
                        value={selectedNode.additionalMetric || ''}
                        onChange={(e) => updateNode('additionalMetric', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">请选择</option>
                        <option value="metric1">指标1</option>
                        <option value="metric2">指标2</option>
                        <option value="metric3">指标3</option>
                      </select>
                    </div>

                    {/* 指标简称 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        指标简称
                      </label>
                      <input
                        type="text"
                        value={selectedNode.metricShortName || ''}
                        onChange={(e) => updateNode('metricShortName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入指标简称"
                      />
                    </div>

                    {/* 指标编码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        指标编码
                      </label>
                      <input
                        type="text"
                        value={selectedNode.metricCode || ''}
                        onChange={(e) => updateNode('metricCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入指标编码"
                      />
                    </div>
                  </>
                )}

                {/* 客户标签特有字段 */}
                {selectedNode.type === 'customer_tag' && (
                  <>
                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TagIcon className="w-4 h-4 text-pink-600" />
                        <h4 className="text-sm font-medium text-pink-900">客户标签配置</h4>
                      </div>
                      <div className="space-y-2 text-sm text-pink-800">
                        <div>
                          已选择标签：<span className="font-semibold">{selectedNode.customerTagData?.selectedTags.length || 0}</span> 个
                        </div>
                        <div>
                          已配置条件：<span className="font-semibold">{selectedNode.customerTagData?.segment.tagConditions.length || 0}</span> 个
                        </div>
                      </div>
                    </div>

                    {/* 显示已选择的标签 */}
                    {selectedNode.customerTagData?.selectedTags && selectedNode.customerTagData.selectedTags.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-500 mb-2">已选择的标签：</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.customerTagData.selectedTags.map(tagId => {
                            const tag = require('@/data/customerTags').getTagById(tagId);
                            if (!tag) return null;
                            return (
                              <span
                                key={tagId}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowCustomerTagConfig(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-pink-600 bg-pink-50 border-2 border-pink-200 rounded-md hover:bg-pink-100 transition-colors"
                    >
                      <TagIcon className="w-4 h-4" />
                      配置客户标签和条件
                    </button>
                  </>
                )}

                {/* 删除按钮 */}
                {selectedNode.type !== 'root' && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => deleteNode(selectedNode.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除节点
                    </button>
                  </div>
                )}

                {/* 操作说明 */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">操作说明</h4>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 点击卡片选中节点</li>
                    <li>• 点击卡片右上角 + 添加子节点</li>
                    <li>• 在右侧面板编辑节点属性</li>
                    <li>• 使用底部工具栏缩放和移动画布</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 指标组选择弹窗 */}
      <MetricGroupSelector
        isOpen={showMetricGroupSelector}
        onClose={() => setShowMetricGroupSelector(false)}
        onSelect={handleSelectMetricGroup}
        selectedGroupId={selectedNode?.metricGroup}
      />

      {/* 客户标签配置弹窗 */}
      {selectedNode && selectedNode.type === 'customer_tag' && (
        <CustomerTagConfigModal
          isOpen={showCustomerTagConfig}
          onClose={() => setShowCustomerTagConfig(false)}
          data={selectedNode.customerTagData || {
            selectedTags: [],
            segment: {
              id: `segment-${Date.now()}`,
              name: selectedNode.name,
              tagConditions: [],
              logic: 'AND'
            }
          }}
          onChange={(data) => updateNode('customerTagData', data)}
        />
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩层 */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={handleDeleteCancel}
          />

          {/* 对话框 */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>

            <p className="text-gray-700 mb-6">
              确定要删除节点 "<span className="font-semibold">{nodeToDeleteName}</span>" 吗？
              <br />
              <span className="text-sm text-red-600">此操作将同时删除该节点及其所有子节点，且不可恢复。</span>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
