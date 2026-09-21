'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Settings, ChevronRight, X } from 'lucide-react'
import {
  ReportAssociation,
  AssociationType,
  PageMetadata,
  PageType,
  ModuleId,
  ScenarioId,
  PageIds,
} from '@/lib/report-association/types'
import { AssociationValidator, PageManager } from '@/lib/report-association/utils'

// 页面选择器组件 - 支持树形结构
function PageSelector({
  onSelect,
  selectedPageId,
}: {
  onSelect: (page: PageMetadata) => void
  selectedPageId?: string
}) {
  const [pages, setPages] = useState<PageMetadata[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<{ module?: string; scenario?: string; pageType?: PageType }>({})

  useEffect(() => {
    PageManager.getAllPages(filter).then(setPages)
  }, [filter])

  const toggleNode = (pageId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }

  // 递归渲染树节点
  const renderTreeNode = (page: PageMetadata, level: number = 0) => {
    const hasChildren = page.children && page.children.length > 0
    const isExpanded = expandedNodes.has(page.pageId)
    const isSelected = selectedPageId === page.pageId

    return (
      <div key={page.pageId}>
        <div
          className={`flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-l-2 ${
            isSelected ? 'bg-blue-50 border-blue-500' : 'border-transparent'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(page.pageId)
            } else {
              onSelect(page)
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
            <div>
              <div className="font-medium text-sm">{page.pageName}</div>
              {page.scenarioName && page.pageType !== 'section' && (
                <div className="text-xs text-gray-500">{page.scenarioName}</div>
              )}
            </div>
          </div>
          {isSelected && (
            <Badge variant="default" className="bg-blue-500">
              已选择
            </Badge>
          )}
        </div>
        {hasChildren && isExpanded && page.children && (
          <div>
            {page.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={filter.module || 'all'} onValueChange={(value) => setFilter({ ...filter, module: value === 'all' ? undefined : value })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择模块" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模块</SelectItem>
            <SelectItem value={ModuleId.MARKET}>市场运营</SelectItem>
            <SelectItem value={ModuleId.CUSTOMER}>客户运营</SelectItem>
            <SelectItem value={ModuleId.PORTAL}>门户</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter.scenario || 'all'} onValueChange={(value) => setFilter({ ...filter, scenario: value === 'all' ? undefined : value })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择场景" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部场景</SelectItem>
            <SelectItem value={ScenarioId.MARKET}>市场运营</SelectItem>
            <SelectItem value={ScenarioId.CHURN}>离网维系</SelectItem>
            <SelectItem value={ScenarioId.MID_HIGH_END}>中高端客户运营</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.pageType || 'all'}
          onValueChange={(value) => setFilter({ ...filter, pageType: value === 'all' ? undefined : value as PageType })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="页面类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value={PageType.OVERVIEW}>概览页</SelectItem>
            <SelectItem value={PageType.TREE}>指标树</SelectItem>
            <SelectItem value={PageType.DASHBOARD}>仪表板</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[500px] overflow-y-auto border rounded-lg">
        {pages.map((page) => renderTreeNode(page))}
      </div>
    </div>
  )
}

// 关联项列表组件
function AssociationList({
  associations,
  onRemove,
  onEdit,
}: {
  associations: ReportAssociation[]
  onRemove: (index: number) => void
  onEdit: (index: number, association: ReportAssociation) => void
}) {
  const getAssociationTypeName = (type: AssociationType) => {
    const names: Record<AssociationType, string> = {
      [AssociationType.PAGE]: '精确关联',
      [AssociationType.SCENARIO]: '场景关联',
      [AssociationType.MODULE]: '模块关联',
      [AssociationType.TAG]: '标签匹配',
    }
    return names[type]
  }

  const getAssociationTargetName = (association: ReportAssociation) => {
    if (association.associationType === AssociationType.PAGE) {
      return association.pageId || ''
    }
    return association.targetId || ''
  }

  return (
    <div className="space-y-2">
      {associations.map((association, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{getAssociationTypeName(association.associationType)}</Badge>
              <span className="text-sm font-medium">{getAssociationTargetName(association)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={association.displayPriority || 0}
              onChange={(e) => onEdit(index, { ...association, displayPriority: parseInt(e.target.value) })}
              className="w-20 h-8"
              placeholder="优先级"
            />
            <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// 主组件
interface ReportAssociationSelectorProps {
  templateId?: number
  reportId?: number
  associations: ReportAssociation[]
  onChange: (associations: ReportAssociation[]) => void
}

export default function ReportAssociationSelector({
  templateId,
  reportId,
  associations,
  onChange,
}: ReportAssociationSelectorProps) {
  const [activeTab, setActiveTab] = useState<AssociationType | 'list'>('list')
  const [selectedPage, setSelectedPage] = useState<PageMetadata | null>(null)

  const handleAddAssociation = (association: ReportAssociation) => {
    const validation = AssociationValidator.validateAssociation(association)
    if (!validation.valid) {
      alert(`验证失败: ${validation.errors.join(', ')}`)
      return
    }
    onChange([...associations, { ...association, displayPriority: associations.length + 1 }])
    setActiveTab('list')
  }

  const handleRemoveAssociation = (index: number) => {
    const newAssociations = associations.filter((_, i) => i !== index)
    onChange(newAssociations)
  }

  const handleEditAssociation = (index: number, association: ReportAssociation) => {
    const newAssociations = [...associations]
    newAssociations[index] = association
    onChange(newAssociations)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          报告展示位置配置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssociationType | 'list')}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="list">已配置 ({associations.length})</TabsTrigger>
            <TabsTrigger value={AssociationType.PAGE}>精确关联</TabsTrigger>
            <TabsTrigger value={AssociationType.SCENARIO}>场景关联</TabsTrigger>
            <TabsTrigger value={AssociationType.MODULE}>模块关联</TabsTrigger>
            <TabsTrigger value={AssociationType.TAG}>标签匹配</TabsTrigger>
          </TabsList>

          {/* 已配置列表 */}
          <TabsContent value="list" className="space-y-4">
            {associations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无关联配置，请选择关联方式添加
              </div>
            ) : (
              <AssociationList
                associations={associations}
                onRemove={handleRemoveAssociation}
                onEdit={handleEditAssociation}
              />
            )}
          </TabsContent>

          {/* 精确关联 */}
          <TabsContent value={AssociationType.PAGE} className="space-y-4">
            <div className="space-y-3">
              <Label>选择要关联的页面</Label>
              <PageSelector
                onSelect={(page) => setSelectedPage(page)}
                selectedPageId={selectedPage?.pageId}
              />
              <Button
                onClick={() => {
                  if (selectedPage) {
                    handleAddAssociation({
                      templateId,
                      reportId,
                      associationType: AssociationType.PAGE,
                      pageId: selectedPage.pageId,
                      isDefault: !reportId,
                    })
                    setSelectedPage(null)
                  }
                }}
                disabled={!selectedPage}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加关联
              </Button>
            </div>
          </TabsContent>

          {/* 场景关联 */}
          <TabsContent value={AssociationType.SCENARIO} className="space-y-4">
            <div className="space-y-3">
              <Label>选择要关联的业务场景</Label>
              <Select
                onValueChange={(value) => {
                  handleAddAssociation({
                    templateId,
                    reportId,
                    associationType: AssociationType.SCENARIO,
                    targetId: value,
                    isDefault: !reportId,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择场景" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ScenarioId.MARKET}>市场运营</SelectItem>
                  <SelectItem value={ScenarioId.CHURN}>离网维系</SelectItem>
                  <SelectItem value={ScenarioId.MID_HIGH_END}>中高端客户运营</SelectItem>
                  <SelectItem value={ScenarioId.CHURN_WARNING}>中高端流失预警</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* 模块关联 */}
          <TabsContent value={AssociationType.MODULE} className="space-y-4">
            <div className="space-y-3">
              <Label>选择要关联的业务模块</Label>
              <Select
                onValueChange={(value) => {
                  handleAddAssociation({
                    templateId,
                    reportId,
                    associationType: AssociationType.MODULE,
                    targetId: value,
                    isDefault: !reportId,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择模块" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ModuleId.MARKET}>市场运营</SelectItem>
                  <SelectItem value={ModuleId.CUSTOMER}>客户运营</SelectItem>
                  <SelectItem value={ModuleId.PRODUCT}>产品运营</SelectItem>
                  <SelectItem value={ModuleId.PORTAL}>门户</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* 标签匹配 */}
          <TabsContent value={AssociationType.TAG} className="space-y-4">
            <div className="space-y-3">
              <Label>配置匹配标签（用逗号分隔多个标签）</Label>
              <Input placeholder="例如: churn,warning,priority" id="tag-input" />
              <div className="text-xs text-gray-500">
                系统将根据页面元数据中的标签进行智能匹配
              </div>
              <Button
                onClick={() => {
                  const input = document.getElementById('tag-input') as HTMLInputElement
                  if (input?.value) {
                    handleAddAssociation({
                      templateId,
                      reportId,
                      associationType: AssociationType.TAG,
                      targetId: input.value,
                      isDefault: !reportId,
                    })
                    input.value = ''
                  }
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加标签匹配
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
