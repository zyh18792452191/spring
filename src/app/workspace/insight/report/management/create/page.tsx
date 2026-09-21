'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ChevronDown, Calendar, Eye, Minus, Plus, Settings, Check, MapPin, Layers, Tag, ChevronUp, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import SimpleReportAssociationSelector from '@/components/SimpleReportAssociationSelector'
import type { ReportAssociation } from '@/lib/report-association/types'

// 模拟报告模板数据
const mockTemplates = [
  { id: 'tpl001', name: '中高端客户运营分析报告模板0112', version: '474782048799539201' },
  { id: 'tpl002', name: '市场运营周报模板', version: '474782048799539202' },
  { id: 'tpl003', name: '渠道运营分析报告模板', version: '474782048799539203' },
]

// 报告层级选项
const reportLevels = ['全国', '地州', '地市', '区县', '网格']

// 时间范围选项
const timeRangeOptions = ['近3个月', '近6个月', '近12个月', '本年度', '上年度']

// 数据区域选项

// 模拟报告组件配置
const reportComponents = [
  {
    id: 'title',
    name: '报告标题',
    type: '静态文本',
    needConfig: false,
    description: '报告标题(静态文本) 无需配置',
  },
  {
    id: 'chapter1',
    name: '一 总体分析',
    type: 'section',
    children: [
      {
        id: 'summary',
        name: '概要',
        type: '智能摘要',
        needConfig: true,
        description: '概要(智能摘要)',
        configFields: [
          { key: 'dataRegion', label: '数据区域', required: true, type: 'select', placeholder: '请选择' }
        ]
      }
    ]
  },
  {
    id: 'chapter1_1',
    name: '1.1 趋势分析',
    type: 'section',
    children: [
      {
        id: 'trend',
        name: '客户规模趋势分析',
        type: '智能图表',
        needConfig: true,
        description: '客户规模趋势分析(智能图表)',
        configFields: [
          { key: 'dataRegion', label: '数据区域', required: true, type: 'select', placeholder: '请选择' },
          { key: 'timeRange', label: '时间范围', required: true, type: 'select', defaultValue: '近6个月' }
        ]
      }
    ]
  },
  {
    id: 'chapter1_2',
    name: '1.2 区域分析',
    type: 'section',
    children: [
      {
        id: 'regional',
        name: '区域对比分析',
        type: '横向对比',
        needConfig: true,
        description: '区域对比分析(横向对比)',
        configFields: [
          { 
            key: 'dataRegion', 
            label: '数据区域', 
            required: true, 
            type: 'multiSelect', 
            placeholder: '请选择',
            options: ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '伊犁', '阿克苏', '喀什', '巴州', '和田', '塔城', '石河子', '博州']
          }
        ]
      }
    ]
  },
  {
    id: 'chapter2',
    name: '二 客户保有率情况',
    type: 'section',
    children: [
      {
        id: 'scale',
        name: '客户规模情况分析',
        type: '智能表格',
        needConfig: true,
        description: '客户规模情况分析(智能表格)',
        configFields: [
          { key: 'dataRegion', label: '数据区域', required: true, type: 'select', placeholder: '请选择' }
        ]
      },
      {
        id: 'operation',
        name: '运营总结',
        type: '智能摘要',
        needConfig: true,
        description: '运营总结(智能摘要)',
        configFields: [
          { key: 'dataRegion', label: '数据区域', required: true, type: 'select', defaultValue: '全国' }
        ]
      }
    ]
  }
]

export default function CreateReportConfigPage() {
  const router = useRouter()
  
  const dataRegionOptions = ['全疆', '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
  
  // 基础配置
  const [basicConfig, setBasicConfig] = useState({
    templateId: '',
    version: '',
    generateType: 'immediate' as 'immediate' | 'scheduled',
    reportName: '',
    reportDate: '',
    reportPeriodStart: '',
    reportPeriodEnd: '',
    organization: '集团根组织',
    reportPeriod: '',
    reportLevel: '全国',
  })

  // 报告关联配置状态
  const [showAssociationConfig, setShowAssociationConfig] = useState(false)
  const [templateAssociations, setTemplateAssociations] = useState<ReportAssociation[]>([])
  const [reportAssociations, setReportAssociations] = useState<ReportAssociation[]>([])
  const [overrideTemplateAssociation, setOverrideTemplateAssociation] = useState(false)

  // 报告期选项（根据报告类型联动）
  const getReportPeriodOptions = (reportType: string) => {
    // 这里需要根据模板的报告类型返回对应的选项
    // 暂时返回通用选项
    return ['T-1', 'T-2', 'T-3']
  }
  
  // 组件配置
  const [componentConfigs, setComponentConfigs] = useState<Record<string, any>>({})
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())

  // 初始化展开所有组件
  useEffect(() => {
    const allExpanded = new Set<string>()
    reportComponents.forEach(comp => {
      allExpanded.add(comp.id)
      if (comp.children) {
        comp.children.forEach(child => allExpanded.add(child.id))
      }
    })
    setExpandedComponents(allExpanded)
  }, [])

  // 当选择模板时加载模板的关联配置
  useEffect(() => {
    if (basicConfig.templateId) {
      // 这里应该调用API获取模板的关联配置
      // 暂时使用模拟数据
      const selectedTemplate = mockTemplates.find(t => t.id === basicConfig.templateId)
      const mockTemplateAssociations: ReportAssociation[] = []
      
      // 根据模板ID生成不同的关联配置
      if (basicConfig.templateId === 'tpl001') {
        // 中高端客户运营分析报告模板
        mockTemplateAssociations.push(
          { id: 1, associationType: 'page' as any, pageId: 'market.mid_high_end.overview', isDefault: true, displayPriority: 1 },
          { id: 2, associationType: 'page' as any, pageId: 'market.mid_high_end.tree.scale_retention', isDefault: true, displayPriority: 2 },
          { id: 3, associationType: 'page' as any, pageId: 'market.mid_high_end.tree.value_retention', isDefault: true, displayPriority: 3 },
          { id: 4, associationType: 'page' as any, pageId: 'market.mid_high_end.tree.decline_ratio', isDefault: true, displayPriority: 4 },
        )
      } else if (basicConfig.templateId === 'tpl002') {
        // 市场运营周报模板
        mockTemplateAssociations.push(
          { id: 1, associationType: 'page' as any, pageId: 'market.market.overview', isDefault: true, displayPriority: 1 },
          { id: 2, associationType: 'page' as any, pageId: 'market.market.tree.market_tree_1', isDefault: true, displayPriority: 2 },
        )
      }
      
      setTemplateAssociations(mockTemplateAssociations)
    } else {
      setTemplateAssociations([])
    }
  }, [basicConfig.templateId])

  const toggleComponentExpand = (id: string) => {
    setExpandedComponents(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleComponentConfigChange = (componentId: string, fieldKey: string, value: any) => {
    setComponentConfigs(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [fieldKey]: value
      }
    }))
  }

  const handleBack = () => {
    router.back()
  }

  const handleSaveDraft = () => {
    console.log('保存草稿', { basicConfig, componentConfigs })
    alert('草稿已保存')
  }

  const handleGenerateReport = () => {
    console.log('生成报告', { basicConfig, componentConfigs })
    alert('报告生成成功')
    router.push('/workspace/insight/report/management')
  }

  const renderConfigField = (componentId: string, field: any) => {
    const value = componentConfigs[componentId]?.[field.key] || field.defaultValue || ''

    if (field.type === 'select') {
      return (
        <Select value={value} onValueChange={(val) => handleComponentConfigChange(componentId, field.key, val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {dataRegionOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'multiSelect') {
      return (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[38px]">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((v: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                {v}
                <button 
                  onClick={() => {
                    const newValue = value.filter((_: string, i: number) => i !== idx)
                    handleComponentConfigChange(componentId, field.key, newValue)
                  }}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">{field.placeholder}</span>
          )}
          <Select onValueChange={(val) => {
            const currentVal = componentConfigs[componentId]?.[field.key] || []
            if (!currentVal.includes(val)) {
              handleComponentConfigChange(componentId, field.key, [...currentVal, val])
            }
          }}>
            <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent">
              <Plus className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent>
              {(field.options || dataRegionOptions).map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    return null
  }

  const renderComponent = (component: any, level: number = 0) => {
    const isExpanded = expandedComponents.has(component.id)
    const paddingLeft = level * 16

    if (!component.needConfig) {
      return (
        <div key={component.id} style={{ paddingLeft: `${paddingLeft}px` }} className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Minus className="w-4 h-4 text-gray-400" />
            <span>{component.description}</span>
          </div>
        </div>
      )
    }

    if (component.type === 'section' && component.children) {
      return (
        <div key={component.id} className="border-b border-gray-200">
          <div 
            className="w-full hover:bg-gray-50 flex items-center gap-2 text-left p-4 cursor-pointer"
            onClick={() => toggleComponentExpand(component.id)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <span className="font-medium text-gray-900">{component.name}</span>
          </div>
          {isExpanded && (
            <div className="pb-4">
              {component.children.map((child: any) => renderComponent(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={component.id} style={{ paddingLeft: `${paddingLeft + 16}px` }} className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="space-y-3">
          <div className="text-sm text-gray-600">{component.description}</div>
          {component.configFields && component.configFields.map((field: any) => (
            <div key={field.key}>
              <Label className="text-sm text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="mt-1.5">
                {renderConfigField(component.id, field)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">创建新报告</h1>
        </div>

        {/* 模板与生成方式配置 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                模板<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={basicConfig.templateId} onValueChange={(value) => setBasicConfig({ ...basicConfig, templateId: value, version: mockTemplates.find(t => t.id === value)?.version || '' })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="请选择模板" />
                </SelectTrigger>
                <SelectContent>
                  {mockTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                版本<span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Select value={basicConfig.version} onValueChange={(value) => setBasicConfig({ ...basicConfig, version: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="请选择版本" />
                  </SelectTrigger>
                  <SelectContent>
                    {basicConfig.version && (
                      <SelectItem value={basicConfig.version}>{basicConfig.version}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="text-[#1D77FF]">
                  <Eye className="w-4 h-4 mr-1" />
                  预览模板
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Label className="text-sm font-medium text-gray-700">配置参数</Label>
            <RadioGroup 
              value={basicConfig.generateType} 
              onValueChange={(value: 'immediate' | 'scheduled') => {
                if (value === 'scheduled') {
                  router.push('/workspace/insight/report/management/scheduled')
                } else {
                  setBasicConfig({ ...basicConfig, generateType: value })
                }
              }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="cursor-pointer">立即生成</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="cursor-pointer">定时生成</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500 mt-2">
              根据选择模板配置的相关参数联动，如模板未选择报告期、统计周期等，则在此处不配置相关参数，配置后的参数将展示在报告标题。
            </p>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="reportName" className="text-sm font-medium text-gray-700">
                报告名称<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="reportName"
                value={basicConfig.reportName}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= 50) {
                    setBasicConfig({ ...basicConfig, reportName: value })
                  }
                }}
                placeholder="请输入报告名称"
                className="mt-1.5"
                maxLength={50}
              />
              <div className="text-xs text-gray-500 mt-1">
                {basicConfig.reportName.length}/50
              </div>
            </div>
            <div>
              <Label htmlFor="reportDate" className="text-sm font-medium text-gray-700">报告日期</Label>
              <div className="relative mt-1.5">
                <Input
                  id="reportDate"
                  type="date"
                  value={basicConfig.reportDate}
                  onChange={(e) => setBasicConfig({ ...basicConfig, reportDate: e.target.value })}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500 mt-1">默认为报告生成日期</p>
            </div>
            <div>
              <Label htmlFor="reportPeriod" className="text-sm font-medium text-gray-700">
                报告周期<span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2 mt-1.5">
                <Input
                  id="reportPeriod"
                  type="date"
                  value={basicConfig.reportPeriodStart}
                  onChange={(e) => setBasicConfig({ ...basicConfig, reportPeriodStart: e.target.value })}
                />
                <span className="text-gray-400">~</span>
                <Input
                  type="date"
                  value={basicConfig.reportPeriodEnd}
                  onChange={(e) => setBasicConfig({ ...basicConfig, reportPeriodEnd: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">根据报告期联动，日期范围默认为报告期的期初日期、期末日期</p>
            </div>
            <div>
              <Label htmlFor="organization" className="text-sm font-medium text-gray-700">编制部门</Label>
              <Input
                id="organization"
                value={basicConfig.organization}
                readOnly
                className="mt-1.5 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">默认为当前登录用户的归属部门</p>
            </div>
            <div>
              <Label htmlFor="reportPeriodType" className="text-sm font-medium text-gray-700">
                报告期<span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={basicConfig.reportPeriod} onValueChange={(value) => setBasicConfig({ ...basicConfig, reportPeriod: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {getReportPeriodOptions('').map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">根据选择模板的报告类型默认填充，默认为T-1，支持选择T-2、T-3</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">报告层级</Label>
              <Select value={basicConfig.reportLevel} onValueChange={(value) => setBasicConfig({ ...basicConfig, reportLevel: value })}>
                <SelectTrigger className="mt-1.5 bg-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">根据模板的报告层级自动填充，不可修改</p>
            </div>
          </div>
        </div>

        {/* 组件数据范围配置 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">组件数据范围</span>
            </div>
          </div>
          <div>
            {reportComponents.map(component => renderComponent(component))}
          </div>
        </div>

        {/* 报告展示位置配置 */}
        <Collapsible open={showAssociationConfig} onOpenChange={setShowAssociationConfig}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full mb-6 flex items-center justify-between hover:bg-gray-50 px-6">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">报告展示位置</span>
                {templateAssociations.length > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {templateAssociations.length}个默认位置
                  </Badge>
                )}
                {reportAssociations.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    已调整
                  </Badge>
                )}
              </div>
              {showAssociationConfig ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* 模板默认配置 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-medium text-gray-900">模板默认配置</h3>
                    <span className="text-xs text-gray-500">
                      根据模板的业务场景自动关联，报告将展示在这些位置
                    </span>
                  </div>
                  {overrideTemplateAssociation && (
                    <span className="text-xs text-orange-600">当前已覆盖默认配置</span>
                  )}
                </div>
                
                {templateAssociations.length > 0 ? (
                  <div className="space-y-2">
                    {/* 按场景分组展示 */}
                    {(() => {
                      const { MOCK_PAGES, PageGroupBuilder } = require('@/lib/report-association/page-groups')
                      const { ScenarioConfigs } = require('@/lib/report-association/types')
                      
                      // 定义页面到场景的映射关系
                      const pageToScenarioMap: Record<string, string> = {
                        'home': 'home',
                        'operation-overview': 'market-intel',
                        'market-operation-overview': 'market-intel',
                        'customer-operation': 'market-intel',
                        'high-end-overview': 'market-intel',
                        'overall-metrics': 'market-intel',
                        'value-enhancement': 'market-intel',
                        'positive-value-increase': 'market-intel',
                        'reverse-loss-control': 'market-intel',
                        'scale-development': 'market-intel',
                        'convergence-strengthening': 'market-intel',
                        'customer-group-management': 'market-intel',
                        'high-end-scale-retention': 'market-intel',
                        'high-end-value-retention': 'market-intel',
                        'high-end-decline-ratio': 'market-intel',
                        'strategy-matching-highend': 'market-intel',
                        'dispatch-highend': 'market-intel',
                        'monthly-all-churn': 'market-intel',
                        'monthly-high-end-churn': 'market-intel',
                        'monthly-global-churn': 'market-intel',
                        'strategy-matching-churn': 'market-intel',
                        'dispatch-churn': 'market-intel',
                        'workspace-home': 'workspace',
                      }
                      
                      // 获取关联的页面详情
                      const associatedPages = templateAssociations
                        .map(assoc => ({
                          ...assoc,
                          page: MOCK_PAGES.find((p: any) => p.pageId === assoc.pageId)
                        }))
                        .filter((item: any) => item.page)
                      
                      // 按场景分组
                      const groupedByScenario = associatedPages.reduce((acc, item) => {
                        const scenarioId = item.pageId ? (pageToScenarioMap[item.pageId] || 'other') : 'other'
                        
                        if (!acc[scenarioId]) {
                          acc[scenarioId] = []
                        }
                        acc[scenarioId].push(item)
                        return acc
                      }, {} as Record<string, any[]>)
                      
                      // 按场景配置顺序展示
                      const scenarioOrder = ScenarioConfigs.map((s: any) => s.id)
                      
                      return scenarioOrder.filter((id: string) => groupedByScenario[id]).map((scenarioId: string) => {
                        const scenario = ScenarioConfigs.find((s: any) => s.id === scenarioId)
                        return (
                          <div key={scenarioId} className="space-y-1">
                            <div className={`text-xs font-medium px-3 py-1 rounded ${
                              overrideTemplateAssociation ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {scenario?.name || scenarioId}
                            </div>
                            <div className="pl-4 space-y-1">
                              {groupedByScenario[scenarioId].map((item: any, index: number) => (
                                <div 
                                  key={`${item.id}-${index}`}
                                  className={`flex items-center gap-2 p-2.5 rounded-md border ${
                                    overrideTemplateAssociation 
                                      ? 'bg-gray-50 border-gray-200 text-gray-400 line-through' 
                                      : 'bg-green-50 border-green-200'
                                  }`}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="text-sm flex-1">
                                    {item.page.pageName}
                                  </span>
                                  {item.page.pageType && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.page.pageType === 'overview' ? '概览页' : 
                                       item.page.pageType === 'dashboard' ? '仪表板' : '指标树'}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
                    模板未配置展示位置，报告仅能在报告管理页面查看
                  </div>
                )}
              </div>

              {/* 覆盖配置 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">自定义配置</h3>
                    <span className="text-xs text-gray-500">
                      可选：覆盖模板默认配置，仅当前报告生效
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="override-association"
                      checked={overrideTemplateAssociation}
                      onCheckedChange={(checked) => {
                        setOverrideTemplateAssociation(checked as boolean)
                        // 如果取消覆盖，清空自定义配置
                        if (!checked) {
                          setReportAssociations([])
                        }
                      }}
                    />
                    <label htmlFor="override-association" className="text-sm text-gray-700 cursor-pointer">
                      覆盖默认配置
                    </label>
                  </div>
                </div>

                {overrideTemplateAssociation && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      配置完成后，报告将仅展示在以下位置（不展示在模板默认位置）
                    </p>
                    
                    {/* 获取模板的业务场景 */}
                    {(() => {
                      // 从模板中获取业务场景（模拟）
                      const selectedTemplate = mockTemplates.find(t => t.id === basicConfig.templateId)
                      const businessScenario = selectedTemplate?.id === 'tpl001' 
                        ? 'mid_high_end' 
                        : selectedTemplate?.id === 'tpl002'
                        ? 'market'
                        : 'churn'
                      
                      return (
                        <SimpleReportAssociationSelector
                          businessScenario={businessScenario}
                          associations={reportAssociations}
                          onChange={setReportAssociations}
                        />
                      )
                    })()}
                  </div>
                )}

                {!overrideTemplateAssociation && (
                  <div className="text-sm text-gray-400 p-4 bg-gray-50 rounded-md text-center">
                    勾选"覆盖默认配置"后可自定义展示位置
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 底部操作按钮 */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleBack}>
            取消
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            保存草稿
          </Button>
          <Button 
            className="bg-[#1D77FF] hover:bg-[#1565C0]"
            onClick={handleGenerateReport}
          >
            生成报告
          </Button>
        </div>
      </div>
    </div>
  )
}
