'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ChevronRight, Plus, BarChart2, LayoutList, FileText, Zap, Table as TableIcon, Columns, Minus, ChevronDown, ChevronUp, Trash2, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// 组件分类定义
const componentCategories = [
  {
    id: 'text',
    name: '文本类',
    components: [
      {
        id: 'static-text',
        name: '静态文本',
        icon: FileText,
        description: '添加固定文本内容',
      },
      {
        id: 'smart-summary',
        name: '智能摘要',
        icon: Zap,
        description: '生成智能提炼的文本内容',
      },
    ],
  },
  {
    id: 'data',
    name: '数据类',
    components: [
      {
        id: 'smart-table',
        name: '智能表格',
        icon: TableIcon,
        description: '展示结构化数据表格',
      },
      {
        id: 'chart',
        name: '图表',
        icon: BarChart2,
        description: '生成可视化数据图表',
      },
      {
        id: 'horizontal-compare',
        name: '横向对比',
        icon: Columns,
        description: '多维度数据横向对比展示',
      },
    ],
  },
  {
    id: 'structure',
    name: '结构类',
    components: [
      {
        id: 'chapter-container',
        name: '章节容器',
        icon: LayoutList,
        description: '划分报告的章节结构',
      },
    ],
  },
];

export default function TemplateEditorPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['text', 'data', 'structure']);
  const [activeTab, setActiveTab] = useState('properties');
  
  // 章节容器状态
  const [hasChapterContainer, setHasChapterContainer] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('iiii');
  const [defaultCollapsed, setDefaultCollapsed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chapterNumber, setChapterNumber] = useState('一');

  // 组件状态
  const [components, setComponents] = useState<Array<{
    id: string;
    type: string;
    title: string;
    showTitle: boolean;
    textType: 'top-title' | 'normal';
    content: string;
    dataSource?: 'metrics' | 'metrics-tree';
    analysisAngles?: string[];
    region?: string;
  }>>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleCancel = () => {
    router.push('/workspace/insight/report/template');
  };

  const handlePrevious = () => {
    router.push('/workspace/insight/report/template/create');
  };

  const handleSaveDraft = () => {
    // 保存草稿逻辑
    console.log('保存草稿');
  };

  const handlePreview = () => {
    // 预览逻辑
    console.log('预览模板');
  };

  const handlePublish = () => {
    // 发布模板逻辑
    console.log('发布模板');
  };

  const handleAddChapter = () => {
    // 添加章节容器逻辑
    setHasChapterContainer(true);
    setChapterTitle('iiii');
  };

  const handleManageContainers = () => {
    // 容器管理逻辑
    console.log('容器管理');
  };

  const handleDeleteChapter = () => {
    // 删除章节容器
    setHasChapterContainer(false);
    setChapterTitle('iiii');
    setDefaultCollapsed(false);
    setIsCollapsed(false);
    setComponents([]);
    setSelectedComponentId(null);
  };

  const handleToggleCollapse = () => {
    // 切换折叠状态
    setIsCollapsed(!isCollapsed);
  };

  const handleAddComponent = (componentType: string) => {
    // 添加组件到章节容器
    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      title: componentType === 'static-text' ? '静态文本' : 
              componentType === 'smart-summary' ? '智能摘要' : '未命名',
      showTitle: true,
      textType: 'top-title' as const,
      content: componentType === 'static-text' 
        ? '{报告期}{报告名称}\n报告日期: {报告日期}\n编制部门: {编制部门}\n统计周期: {周期开始}-{周期结束}'
        : componentType === 'smart-summary'
        ? '1、总体评价: 截止2025年10月31日,公司拍照中高端客户规模保有率97.71%,整体经营态势[稳健增长/面临挑战/符合预期]。\n\n2、关键亮点:\n(1) 5G发展持续加速: 5G套餐用户净增XX万户,累计达到XXX万户,渗透率提升至XX.X%。\n(2) 家庭市场表现亮眼: 家庭宽带用户净增X.X万户,智慧家庭增值业务如移动高清、和家固话收入同比增长XX%。\n(3) 数字化转型成效显现: 云业务收入达到X.X亿元,同比增长XX.X%。\n\n3、主要挑战:\n(1) 个人市场饱和: 个人市场用户净增仅X.X万户,环比下降X.X%,市场竞争加剧。\n(2) ARPU值承压: 个人市场ARPU为XX.X元,同比下降X.X元,主要受流量资费下调及竞争影响。\n(3) 部分区域发展不均: [XX地州]用户流失率高于全疆均值,需重点关注。'
        : '',
      dataSource: componentType === 'smart-summary' ? 'metrics' as const : undefined,
      analysisAngles: componentType === 'smart-summary' ? ['总体评价', '亮点发现'] as string[] : undefined,
      region: componentType === 'smart-summary' ? '' : undefined,
    };
    setComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  };

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleDeleteComponent = (componentId: string) => {
    setComponents(components.filter(c => c.id !== componentId));
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<typeof components[0]>) => {
    setComponents(components.map(c => c.id === componentId ? { ...c, ...updates } : c));
  };

  const handleInsertParameter = (param: string) => {
    if (selectedComponentId) {
      const component = components.find(c => c.id === selectedComponentId);
      if (component) {
        handleUpdateComponent(selectedComponentId, {
          content: component.content + `{${param}}`
        });
      }
    }
  };

  // 组件卡片组件（内部定义以访问handleAddComponent）
  const ComponentCard = ({ component }: { component: typeof componentCategories[number]['components'][number] }) => {
    const Icon = component.icon;
    return (
      <div
        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 group"
        draggable
        onClick={() => {
          if (hasChapterContainer) {
            handleAddComponent(component.id);
          }
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{component.name}</span>
        </div>
        <p className="text-xs text-gray-500 pl-10">{component.description}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部流程导航区 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-center max-w-lg mx-auto">
            {/* 步骤1：基础信息 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">基础信息</span>
            </div>

            {/* 连接线 */}
            <div className="w-24 h-px bg-blue-600 mx-2" />

            {/* 步骤2：模板编辑 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">模板编辑</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域：三栏布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：组件库面板 */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* 组件库标题 */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-blue-600">组件</h2>
              <div className="h-0.5 w-8 bg-blue-600" />
            </div>
          </div>

          {/* 组件搜索框 */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索组件"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* 组件列表 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {componentCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              return (
                <div key={category.id} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 mt-2">
                      {category.components.map((component) => (
                        <ComponentCard key={component.id} component={component} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 中间：模板配置画布区 */}
        <div className="flex-1 bg-gray-50 flex flex-col relative overflow-hidden">
          {/* 顶部工具栏 */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageContainers}
              className="bg-white shadow-sm"
            >
              ☰ 容器管理
            </Button>
          </div>

          {/* 画布内容 */}
          <div className="flex-1 flex items-center justify-center p-8">
            {hasChapterContainer ? (
              // 章节容器内容
              <div className="w-full max-w-4xl">
                {/* 模板配置标题 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">模板配置</h3>
                </div>
                
                {/* 章节容器 */}
                <div className="border-2 border-blue-500 rounded-lg bg-white p-4 relative">
                  {/* 容器操作按钮 */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                      onClick={handleToggleCollapse}
                    >
                      {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDeleteChapter}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* 章节内容 */}
                  {!isCollapsed ? (
                    <>
                      {/* 章节标题 */}
                      <div className="mb-4 pr-16">
                        <h4 className="text-base font-bold text-gray-900">{chapterNumber}、{chapterTitle}</h4>
                      </div>

                      {/* 组件放置区域 */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                        {components.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-gray-500">请拖拽组件至此</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {components.map((component) => {
                              const isSelected = selectedComponentId === component.id;
                              return (
                                <div
                                  key={component.id}
                                  className={`border-2 rounded-lg p-4 bg-white cursor-pointer transition-colors ${
                                    isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => handleSelectComponent(component.id)}
                                >
                                  {/* 组件操作按钮 */}
                                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900">
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900">
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900">
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteComponent(component.id);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>

                                  {/* 组件内容 */}
                                  <div className="pr-16">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                      {component.content}
                                    </pre>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-2 pr-16">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        {chapterNumber}、{chapterTitle}
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 初始引导状态
              <div className="text-center max-w-md">
                {/* 插画 */}
                <div className="mb-6 flex justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                    {/* 简化的插画 SVG */}
                    <svg viewBox="0 0 200 200" className="w-40 h-40">
                      <rect x="40" y="100" width="120" height="60" rx="8" fill="#60A5FA" />
                      <rect x="50" y="110" width="40" height="8" rx="4" fill="#93C5FD" />
                      <rect x="50" y="125" width="60" height="8" rx="4" fill="#93C5FD" />
                      <rect x="50" y="140" width="50" height="8" rx="4" fill="#93C5FD" />
                      <circle cx="150" cy="130" r="20" fill="#FCD34D" />
                      <circle cx="150" cy="130" r="8" fill="#60A5FA" />
                    </svg>
                  </div>
                </div>

                {/* 引导文字 */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">开始设计您的报告模板</h3>
                <p className="text-sm text-gray-500 mb-6">从左侧组件库拖拽组件到画布中，或点击下方组件快速添加</p>

                {/* 添加章节容器按钮 */}
                <Button onClick={handleAddChapter} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  添加章节容器
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：组件属性配置面板 */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* 标签页 */}
          <div className="border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-10 bg-transparent border-none rounded-none">
                <TabsTrigger
                  value="containers"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-sm font-medium rounded-none"
                >
                  容器管理
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-sm font-medium rounded-none"
                >
                  组件属性
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 属性面板内容 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'properties' && (
              <>
                {hasChapterContainer ? (
                  <>
                    {/* 选中组件属性 */}
                    {selectedComponentId ? (() => {
                      const component = components.find(c => c.id === selectedComponentId);
                      if (!component) return null;

                      return (
                        <div className="space-y-6">
                          {/* 标题 */}
                          <div>
                            <h3 className="text-base font-bold text-gray-900 border-b border-blue-600 pb-2 mb-4">
                              组件属性-{component.title}
                            </h3>
                          </div>

                          {/* 模块标题配置 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium text-gray-700">
                                模块标题 <span className="text-red-500">*</span>
                              </Label>
                              <div className="flex items-center">
                                <Checkbox
                                  id="show-title"
                                  checked={component.showTitle}
                                  onCheckedChange={(checked) => 
                                    handleUpdateComponent(component.id, { showTitle: checked as boolean })
                                  }
                                  className="data-[state=checked]:bg-blue-600"
                                />
                                <label htmlFor="show-title" className="ml-2 text-sm text-gray-600 cursor-pointer">
                                  展示标题
                                </label>
                              </div>
                            </div>
                            <Input
                              type="text"
                              value={component.title}
                              onChange={(e) => 
                                handleUpdateComponent(component.id, { title: e.target.value })
                              }
                              placeholder="请输入"
                              className="h-10"
                            />
                          </div>

                          {/* 文本类型配置 */}
                          {component.type === 'static-text' && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  文本类型
                                </Label>
                              </div>
                              <div className="space-y-2">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`text-type-${component.id}`}
                                    value="top-title"
                                    checked={component.textType === 'top-title'}
                                    onChange={() => 
                                      handleUpdateComponent(component.id, { textType: 'top-title' })
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">顶部标题</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`text-type-${component.id}`}
                                    value="normal"
                                    checked={component.textType === 'normal'}
                                    onChange={() => 
                                      handleUpdateComponent(component.id, { textType: 'normal' })
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">普通文本</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* 文本内容配置 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium text-gray-700">
                                文本内容
                              </Label>
                            </div>
                            <textarea
                              value={component.content}
                              onChange={(e) => 
                                handleUpdateComponent(component.id, { content: e.target.value })
                              }
                              className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md text-sm font-mono resize-none"
                              placeholder="请输入文本内容"
                            />
                          </div>

                          {/* 插入参数配置 */}
                          {component.type === 'static-text' && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  插入参数
                                </Label>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('报告名称')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  报告名称
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('报告期')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  报告期
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('报告日期')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  报告日期
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('编制部门')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  编制部门
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('周期开始')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  周期开始
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleInsertParameter('周期结束')}
                                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                >
                                  周期结束
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* 智能摘要组件特有的配置 */}
                          {component.type === 'smart-summary' && (
                            <>
                              {/* 数据源配置 */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium text-gray-700">
                                    数据源 <span className="text-red-500">*</span>
                                  </Label>
                                </div>
                                <div className="space-y-2">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`data-source-${component.id}`}
                                      value="metrics"
                                      checked={component.dataSource === 'metrics'}
                                      onChange={() => 
                                        handleUpdateComponent(component.id, { dataSource: 'metrics' })
                                      }
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">指标</span>
                                  </label>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`data-source-${component.id}`}
                                      value="metrics-tree"
                                      checked={component.dataSource === 'metrics-tree'}
                                      onChange={() => 
                                        handleUpdateComponent(component.id, { dataSource: 'metrics-tree' })
                                      }
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">指标树</span>
                                  </label>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full mt-3 justify-start border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  添加指标
                                </Button>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                  已选: {0}个指标
                                </p>
                              </div>

                              {/* 分析角度配置 */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium text-gray-700">
                                    分析角度 <span className="text-red-500">*</span>
                                  </Label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {['总体评价', '亮点发现', '问题预警', '原因推测', '行动建议', '趋势预测'].map((angle) => {
                                    const isSelected = component.analysisAngles?.includes(angle);
                                    return (
                                      <button
                                        key={angle}
                                        onClick={() => {
                                          const currentAngles = component.analysisAngles || [];
                                          if (isSelected) {
                                            handleUpdateComponent(component.id, {
                                              analysisAngles: currentAngles.filter(a => a !== angle)
                                            });
                                          } else {
                                            handleUpdateComponent(component.id, {
                                              analysisAngles: [...currentAngles, angle]
                                            });
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                                          isSelected 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                        }`}
                                      >
                                        {angle}
                                        <HelpCircle className="w-3 h-3 ml-1 inline-block" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 区域配置 */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium text-gray-700">
                                    区域
                                  </Label>
                                </div>
                                <div className="relative">
                                  <select
                                    value={component.region || ''}
                                    onChange={(e) => 
                                      handleUpdateComponent(component.id, { region: e.target.value })
                                    }
                                    className="w-full h-10 px-3 pr-8 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-blue-500 appearance-none bg-white"
                                  >
                                    <option value="">请选择区域</option>
                                    <option value="全国">全国</option>
                                    <option value="省份">地州</option>
                                    <option value="地市">地市</option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })() : (
                      // 章节容器属性配置
                      <div className="space-y-6">
                        {/* 标题 */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 border-b border-blue-600 pb-2 mb-4">
                            组件属性-章节容器
                          </h3>
                        </div>

                        {/* 章节标题配置 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">
                              章节标题 <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          
                          {/* 默认折叠复选框 */}
                          <div className="flex items-center mb-3">
                            <Checkbox
                              id="default-collapsed"
                              checked={defaultCollapsed}
                              onCheckedChange={(checked) => setDefaultCollapsed(checked as boolean)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <label htmlFor="default-collapsed" className="ml-2 text-sm text-gray-600 cursor-pointer">
                              默认折叠
                            </label>
                          </div>

                          {/* 章节标题输入框 */}
                          <div className="relative">
                            <Input
                              type="text"
                              value={chapterTitle}
                              onChange={(e) => setChapterTitle(e.target.value.slice(0, 50))}
                              placeholder="请输入"
                              className="h-10 pr-12"
                              maxLength={50}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                              {chapterTitle.length}/50
                            </span>
                          </div>
                        </div>

                        {/* 自动编号预览 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">自动编号预览</Label>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-2">
                            <span className="text-sm font-medium text-gray-600">{chapterNumber}、</span>
                          </div>
                          <p className="text-xs text-gray-500">当前路径: {chapterNumber}、{chapterTitle}</p>
                        </div>

                        {/* 章节内容统计 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">章节内容统计</Label>
                            <span className="text-xs text-gray-500">当前包括: {components.length}个组件</span>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <p className="text-sm text-gray-500">
                              {components.length === 0 ? '暂无非容器组件' : `包含${components.length}个组件`}
                            </p>
                          </div>
                        </div>

                        {/* 子章节管理 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">子章节管理</Label>
                            <span className="text-xs text-gray-500">0个子章节</span>
                          </div>
                          <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-600 hover:bg-blue-50">
                            <LayoutList className="w-4 h-4 mr-2" />
                            管理子章节
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">暂无子章节</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // 未选择组件状态
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutList className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-base font-medium text-gray-900 mb-2">暂未选择组件</h4>
                    <p className="text-sm text-gray-500">在画布中选择组件进行编辑属性</p>
                  </div>
                )}
              </>
            )}
            {activeTab === 'containers' && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutList className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-base font-medium text-gray-900 mb-2">暂无章节容器</h4>
                <p className="text-sm text-gray-500">点击上方"添加章节容器"按钮开始设计</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部：全局操作栏 */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
        <Button variant="outline" onClick={handleCancel}>
          取消
        </Button>
        <Button variant="outline" onClick={handlePrevious}>
          上一步
        </Button>
        <Button variant="outline" onClick={handleSaveDraft}>
          保存草稿
        </Button>
        <Button onClick={handlePreview} className="bg-blue-600 hover:bg-blue-700">
          预览
        </Button>
        <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700">
          发布模板
        </Button>
      </div>
    </div>
  );
}
