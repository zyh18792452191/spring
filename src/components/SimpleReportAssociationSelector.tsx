'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, X, Check, FileText, LayoutDashboard, ChevronRight, ChevronDown, FolderTree, FolderOpen, AlertCircle, Grid, BarChart3 } from 'lucide-react'
import type { ReportAssociation } from '@/lib/report-association/types'
import { AssociationType } from '@/lib/report-association/types'

interface SimpleReportAssociationSelectorProps {
  businessScenario: string // 从模板基本信息中获取的业务场景
  associations: ReportAssociation[]
  onChange: (associations: ReportAssociation[]) => void
}

// 树形节点类型定义
interface PageTreeNode {
  id: string
  name: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  type: 'folder' | 'page' | 'section' | 'component'
  pageId?: string
  sectionId?: string // 区域ID
  componentId?: string // 组件ID
  pageCode?: string
  pageName?: string
  sectionName?: string
  componentName?: string
  pagePath?: string
  children?: PageTreeNode[]
}

// 获取节点图标
const getNodeIcon = (node: PageTreeNode) => {
  if (node.type === 'component') {
    return BarChart3
  }
  if (node.type === 'section') {
    return Grid
  }
  if (node.type === 'page') {
    return LayoutDashboard
  }
  return FileText
}

// 获取节点类型标签
const getNodeTypeLabel = (node: PageTreeNode) => {
  if (node.type === 'component') {
    return '组件'
  }
  if (node.type === 'section') {
    return '区域'
  }
  if (node.type === 'page') {
    return '页面'
  }
  return ''
}

// 生成关联ID（用于标识是页面、区域还是组件）
const generateAssociationId = (node: PageTreeNode): string => {
  if (node.type === 'section' && node.sectionId) {
    return `${node.pageId}#${node.sectionId}`
  }
  if (node.type === 'component' && node.componentId) {
    return `${node.pageId}#${node.componentId}`
  }
  return node.pageId || node.id
}

// 递归树节点组件
const TreeNode: React.FC<{
  node: PageTreeNode
  selectedIds: Set<string>
  onToggleNode: (node: PageTreeNode) => void
  searchQuery: string
  level: number
}> = ({ node, selectedIds, onToggleNode, searchQuery, level }) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelectable = node.type === 'page' || node.type === 'section' || node.type === 'component'
  const associationId = generateAssociationId(node)
  const isSelected = isSelectable && selectedIds.has(associationId)

  // 搜索过滤
  const shouldRender = !searchQuery || 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (hasChildren && node.children!.some(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    ))

  if (!shouldRender) return null

  const Icon = getNodeIcon(node)

  return (
    <div>
      {/* 当前节点 */}
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-white rounded-md cursor-pointer border border-transparent hover:border-gray-200 ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        } ${node.type === 'section' ? 'bg-blue-50/50' : ''} ${
          node.type === 'component' ? 'bg-orange-50/50' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={() => {
          if (isSelectable) {
            onToggleNode(node)
          } else {
            setExpanded(!expanded)
          }
        }}
      >
        {hasChildren && (
          <ChevronRight 
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          />
        )}
        {!hasChildren && <div className="w-4 h-4" />}
        
        <Icon className={`w-4 h-4 ${
          node.type === 'component' 
            ? 'text-orange-500' 
            : node.type === 'section' 
            ? 'text-purple-500' 
            : (isSelectable && isSelected ? 'text-blue-600' : 'text-gray-400')
        }`} />
        
        <span className={`flex-1 text-sm ${
          node.type === 'component' 
            ? 'text-orange-700' 
            : node.type === 'section' 
            ? 'text-purple-700' 
            : (isSelectable ? 'font-medium text-gray-900' : 'text-gray-700')
        }`}>
          {node.name}
        </span>

        {isSelectable && (
          <>
            <Checkbox
              checked={isSelected}
              onChange={() => onToggleNode(node)}
              onClick={(e) => e.stopPropagation()}
            />
            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
          </>
        )}

        {isSelectable && (
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              node.type === 'component' 
                ? 'bg-orange-100 text-orange-700' 
                : node.type === 'section' 
                ? 'bg-purple-100 text-purple-700' 
                : ''
            }`}
          >
            {getNodeTypeLabel(node)}
          </Badge>
        )}
      </div>

      {/* 子节点 */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedIds={selectedIds}
              onToggleNode={onToggleNode}
              searchQuery={searchQuery}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SimpleReportAssociationSelector({
  businessScenario,
  associations,
  onChange,
}: SimpleReportAssociationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(associations.map(a => a.pageId || '').filter(Boolean))
  )
  const [pageTree, setPageTree] = useState<PageTreeNode[]>([])
  const [loading, setLoading] = useState(true)

  // 使用静态数据
  useEffect(() => {
    // 静态层级数据 - 市场运营平台
    const staticTree: PageTreeNode[] = [
      {
        id: 'home',
        name: '首页',
        level: 1,
        type: 'page',
        pageId: 'home',
        pageCode: 'home',
        pageName: '首页',
        pagePath: '/',
      },
      {
        id: 'market-intel',
        name: '市场数智运营',
        level: 1,
        type: 'folder',
        children: [
          {
            id: 'operation-overview',
            name: '运营总览',
            level: 2,
            type: 'folder',
            children: [
              {
                id: 'market-operation-overview',
                name: '市场运营总览',
                level: 3,
                type: 'page',
                pageId: 'market-operation-overview',
                pageCode: 'market-operation-overview',
                pageName: '市场运营总览',
                pagePath: '/operation/market-overview',
                      },
            ],
          },
          {
            id: 'customer-operation',
            name: '客户运营',
            level: 2,
            type: 'folder',
            children: [
              {
                id: 'existing-customer',
                name: '存量运营',
                level: 3,
                type: 'folder',
                children: [
                  {
                    id: 'high-end-customer',
                    name: '中高端客户运营',
                    level: 4,
                    type: 'folder',
                    children: [
                      {
                        id: 'high-end-overview',
                        name: '中高端客户运营概览',
                        level: 5,
                        type: 'page',
                        pageId: 'high-end-overview',
                        pageCode: 'high-end-overview',
                        pageName: '中高端客户运营概览',
                        pagePath: '/operation/customer/high-end/overview',
                                        children: [
                          {
                            id: 'overall-metrics',
                            name: '整体指标',
                            level: 6,
                            type: 'section',
                            pageId: 'high-end-overview',
                            sectionId: 'overall-metrics',
                            sectionName: '整体指标',
                            pagePath: '/operation/customer/high-end/overall-metrics',
                                              },
                          {
                            id: 'value-enhancement',
                            name: '价值提升',
                            level: 6,
                            type: 'section',
                            pageId: 'high-end-overview',
                            sectionId: 'value-enhancement',
                            sectionName: '价值提升',
                            pagePath: '/operation/customer/high-end/value-enhancement',
                                                children: [
                              {
                                id: 'positive-value-increase',
                                name: '正向提值',
                                level: 7,
                                type: 'component',
                                componentId: 'positive-value-increase',
                                componentName: '正向提值',
                                pageId: 'high-end-overview',
                                pagePath: '/operation/customer/high-end/positive-value',
                                                      },
                              {
                                id: 'reverse-loss-control',
                                name: '逆向控损',
                                level: 7,
                                type: 'component',
                                componentId: 'reverse-loss-control',
                                componentName: '逆向控损',
                                pageId: 'high-end-overview',
                                pagePath: '/operation/customer/high-end/reverse-loss',
                                                      },
                            ],
                          },
                          {
                            id: 'scale-development',
                            name: '规模发展',
                            level: 6,
                            type: 'section',
                            pageId: 'high-end-overview',
                            sectionId: 'scale-development',
                            sectionName: '规模发展',
                            pagePath: '/operation/customer/high-end/scale-development',
                                              },
                          {
                            id: 'convergence-strengthening',
                            name: '融合加固',
                            level: 6,
                            type: 'section',
                            pageId: 'high-end-overview',
                            sectionId: 'convergence-strengthening',
                            sectionName: '融合加固',
                            pagePath: '/operation/customer/high-end/convergence-strengthening',
                                              },
                          {
                            id: 'customer-group-management',
                            name: '客群看管',
                            level: 6,
                            type: 'section',
                            pageId: 'high-end-overview',
                            sectionId: 'customer-group-management',
                            sectionName: '客群看管',
                            pagePath: '/operation/customer/high-end/customer-group',
                                              },
                        ],
                      },
                      {
                        id: 'high-end-scale-retention',
                        name: '拍照中高端客户规模保有率',
                        level: 5,
                        type: 'page',
                        pageId: 'high-end-scale-retention',
                        pageCode: 'high-end-scale-retention',
                        pageName: '拍照中高端客户规模保有率',
                        pagePath: '/operation/customer/high-end/scale-retention',
                                      },
                      {
                        id: 'high-end-value-retention',
                        name: '拍照中高端客户价值保有率',
                        level: 5,
                        type: 'page',
                        pageId: 'high-end-value-retention',
                        pageCode: 'high-end-value-retention',
                        pageName: '拍照中高端客户价值保有率',
                        pagePath: '/operation/customer/high-end/value-retention',
                                      },
                      {
                        id: 'high-end-decline-ratio',
                        name: '中高端一降到底占比',
                        level: 5,
                        type: 'page',
                        pageId: 'high-end-decline-ratio',
                        pageCode: 'high-end-decline-ratio',
                        pageName: '中高端一降到底占比',
                        pagePath: '/operation/customer/high-end/decline-ratio',
                                      },
                      {
                        id: 'strategy-matching-highend',
                        name: '策略匹配',
                        level: 5,
                        type: 'page',
                        pageId: 'strategy-matching-highend',
                        pageCode: 'strategy-matching-highend',
                        pageName: '策略匹配',
                        pagePath: '/operation/customer/high-end/strategy-matching',
                                      },
                      {
                        id: 'dispatch-highend',
                        name: '调度派发',
                        level: 5,
                        type: 'page',
                        pageId: 'dispatch-highend',
                        pageCode: 'dispatch-highend',
                        pageName: '调度派发',
                        pagePath: '/operation/customer/high-end/dispatch',
                                      },
                    ],
                  },
                  {
                    id: 'churn-management',
                    name: '离网维系',
                    level: 4,
                    type: 'folder',
                    children: [
                      {
                        id: 'monthly-all-churn',
                        name: '当月全量客户离网客户数',
                        level: 5,
                        type: 'page',
                        pageId: 'monthly-all-churn',
                        pageCode: 'monthly-all-churn',
                        pageName: '当月全量客户离网客户数',
                        pagePath: '/operation/customer/churn/monthly-all',
                                      },
                      {
                        id: 'monthly-high-end-churn',
                        name: '当月拍照中高端客户离网客户数',
                        level: 5,
                        type: 'page',
                        pageId: 'monthly-high-end-churn',
                        pageCode: 'monthly-high-end-churn',
                        pageName: '当月拍照中高端客户离网客户数',
                        pagePath: '/operation/customer/churn/monthly-high-end',
                                      },
                      {
                        id: 'monthly-global-churn',
                        name: '当月拍照全球通客户离网客户数',
                        level: 5,
                        type: 'page',
                        pageId: 'monthly-global-churn',
                        pageCode: 'monthly-global-churn',
                        pageName: '当月拍照全球通客户离网客户数',
                        pagePath: '/operation/customer/churn/monthly-global',
                                      },
                      {
                        id: 'strategy-matching-churn',
                        name: '策略匹配',
                        level: 5,
                        type: 'page',
                        pageId: 'strategy-matching-churn',
                        pageCode: 'strategy-matching-churn',
                        pageName: '策略匹配',
                        pagePath: '/operation/customer/churn/strategy-matching',
                                      },
                      {
                        id: 'dispatch-churn',
                        name: '调度派发',
                        level: 5,
                        type: 'page',
                        pageId: 'dispatch-churn',
                        pageCode: 'dispatch-churn',
                        pageName: '调度派发',
                        pagePath: '/operation/customer/churn/dispatch',
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
        id: 'workspace',
        name: '我的工作台',
        level: 1,
        type: 'folder',
        children: [
          {
            id: 'workspace-home',
            name: '工作台首页',
            level: 2,
            type: 'page',
            pageId: 'workspace-home',
            pageCode: 'workspace-home',
            pageName: '工作台首页',
            pagePath: '/workspace',
          },
        ],
      },
    ]

    setPageTree(staticTree)
    setLoading(false)
  }, [])

  // 获取所有可选择的节点（页面、区域和组件）
  const getAllSelectableNodes = (nodes: PageTreeNode[]): PageTreeNode[] => {
    const selectableNodes: PageTreeNode[] = []
    const traverse = (node: PageTreeNode) => {
      if (node.type === 'page' || node.type === 'section' || node.type === 'component') {
        selectableNodes.push(node)
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    nodes.forEach(traverse)
    return selectableNodes
  }

  const allSelectableNodes = getAllSelectableNodes(pageTree)

  // 切换节点选中状态
  const toggleNode = (node: PageTreeNode) => {
    // 只允许选择页面、区域和组件类型
    if (node.type !== 'page' && node.type !== 'section' && node.type !== 'component') {
      return
    }

    const associationId = generateAssociationId(node)
    const newSelectedIds = new Set(selectedIds)
    
    if (newSelectedIds.has(associationId)) {
      newSelectedIds.delete(associationId)
    } else {
      newSelectedIds.add(associationId)
    }
    
    setSelectedIds(newSelectedIds)

    // 更新 associations
    const newAssociations: ReportAssociation[] = Array.from(newSelectedIds).map((id, index) => {
      // 判断是页面、区域还是组件
      const [pageId, subId] = id.split('#')
      const node = allSelectableNodes.find(n => generateAssociationId(n) === id)
      const associationId = node?.type === 'component' ? node.componentId : (node?.sectionId || subId)

      return {
        id: associations[index]?.id || Date.now() + index,
        associationType: AssociationType.PAGE, // 都是页面类型，但区域或组件有额外标识
        pageId: pageId,
        sectionId: node?.type === 'section' ? node.sectionId : undefined,
        componentId: node?.type === 'component' ? node.componentId : undefined,
        targetId: subId ? `${pageId}#${subId}` : pageId, // 区域或组件使用组合ID
        displayPriority: index + 1,
        isDefault: true,
      }
    })
    onChange(newAssociations)
  }

  // 获取已选中节点的详情
  const getSelectedNodeDetails = () => {
    return allSelectableNodes.filter(node => {
      const associationId = generateAssociationId(node)
      return selectedIds.has(associationId)
    })
  }

  // Loading 状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mr-2" />
        加载页面列表...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="搜索页面或区域..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 页面树 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
        {pageTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            没有可用的页面
          </div>
        ) : (
          <div>
            {pageTree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                selectedIds={selectedIds}
                onToggleNode={toggleNode}
                searchQuery={searchQuery}
                level={0}
              />
            ))}
          </div>
        )}
      </div>

      {/* 已关联节点展示 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="font-medium text-gray-900">
            已关联 ({getSelectedNodeDetails().length})
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedIds(new Set())
              onChange([])
            }}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            清空全部
          </Button>
        </div>

        {getSelectedNodeDetails().length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            还没有关联任何页面或区域
          </div>
        ) : (
          <div className="space-y-2">
            {getSelectedNodeDetails().map((node, index) => {
              const Icon = getNodeIcon(node)
              const associationId = generateAssociationId(node)
              return (
                <div
                  key={associationId}
                  className={`flex items-center justify-between rounded-md p-3 border ${
                    node.type === 'section' 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className={`w-4 h-4 ${
                        node.type === 'component' 
                          ? 'text-orange-500' 
                          : node.type === 'section' 
                          ? 'text-purple-500' 
                          : 'text-gray-400'
                      }`} 
                    />
                    <div>
                      <div className={`text-sm font-medium ${
                        node.type === 'component' 
                          ? 'text-orange-900' 
                          : node.type === 'section' 
                          ? 'text-purple-900' 
                          : 'text-gray-900'
                      }`}>
                        {node.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(node.type === 'section' || node.type === 'component') && node.pageName && (
                          <span className="mr-2">{node.pageName}</span>
                        )}
                        {getNodeTypeLabel(node)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(node)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-900 mb-1">使用说明</div>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>报告可以关联到<strong>整个页面</strong>或<strong>页面下的具体区域或组件</strong></li>
              <li>页面节点可展开查看其包含的区域和组件</li>
              <li>区域用紫色标识，组件用橙色标识，页面用蓝色标识</li>
              <li>页面、区域、组件可以同时选中</li>
              <li>同时选中页面和区域/组件时，报告会在多个位置同时展示</li>
              <li>使用搜索框可以快速查找页面、区域或组件</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
