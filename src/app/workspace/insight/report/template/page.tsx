'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, Plus, Copy, Download, Trash2, MoreHorizontal, FileText, ChevronRight, HelpCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// 业务场景数据
// 业务场景数据结构定义
type BusinessScenarioItem = {
  id: string;
  name: string;
  children?: BusinessScenarioItem[];
};

const businessScenarios: BusinessScenarioItem[] = [
  {
    id: 'public_market',
    name: '公众市场',
    children: [
      {
        id: 'market_operation',
        name: '市场运营',
        children: [
          { id: 'market_operation', name: '市场运营' },
        ],
      },
      {
        id: 'customer_operation',
        name: '客户运营',
        children: [
          { id: 'customer_operation', name: '客户运营' },
          { id: 'mid_high_end', name: '中高端' },
          { id: 'new_subscriptions', name: '新入网' },
          { id: 'group_customers', name: '集团成员客户' },
          { id: 'global', name: '全球通' },
          { id: 'mid_high_end_warning', name: '中高端流失预警' },
          { id: 'international_operation', name: '国际业务运营' },
          { id: 'silver_market', name: '银发市场' },
          { id: 'young_market', name: '年轻市场' },
          { id: 'university_market', name: '高校市场' },
        ],
      },
      {
        id: 'product_operation',
        name: '产品运营',
        children: [
          { id: 'product_operation', name: '产品运营' },
        ],
      },
      {
        id: 'channel_operation',
        name: '渠道运营',
        children: [
          { id: 'channel_operation', name: '渠道运营' },
          { id: 'mobile_app', name: '中国移动APP' },
          { id: 'hotline', name: '热线' },
          { id: 'business_hall', name: '营业厅' },
          { id: 'sales', name: '随销行销' },
        ],
      },
    ],
  },
  {
    id: 'enterprise_market',
    name: '政企市场',
  },
  {
    id: 'home_market',
    name: '家庭市场',
  },
  {
    id: 'product_market',
    name: '产品市场',
  },
];

// 业务场景三级联动下拉框组件
const BusinessScenarioSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedPath, setSelectedPath] = useState<{ level1?: string; level2?: string; level3?: string }>({});
  const [level1Options] = useState<BusinessScenarioItem[]>(businessScenarios);
  const [level2Options, setLevel2Options] = useState<BusinessScenarioItem[]>([]);
  const [level3Options, setLevel3Options] = useState<BusinessScenarioItem[]>([]);

  useEffect(() => {
    if (value) {
      // 解析已选中的值，显示面包屑
      const parts = value.split(' / ');
      if (parts.length >= 1) {
        setSelectedPath({ level1: parts[0], level2: parts[1], level3: parts[2] });
      }
    }
  }, [value]);

  const handleLevel1Click = (option: BusinessScenarioItem) => {
    setSelectedPath({ level1: option.name });
    setCurrentLevel(2);

    if (option.children && option.children.length > 0) {
      setLevel2Options(option.children);
    } else {
      // 没有二级选项，直接完成选择
      onChange(option.name);
      setIsOpen(false);
    }
  };

  const handleLevel2Click = (option: BusinessScenarioItem) => {
    setSelectedPath((prev) => ({ ...prev, level2: option.name }));
    setCurrentLevel(3);

    if (option.children && option.children.length > 0) {
      setLevel3Options(option.children);
    } else {
      // 没有三级选项，完成选择
      const selectedValue = `${selectedPath.level1} / ${option.name}`;
      onChange(selectedValue);
      setIsOpen(false);
    }
  };

  const handleLevel3Click = (option: { id: string; name: string }) => {
    const selectedValue = `${selectedPath.level1} / ${selectedPath.level2} / ${option.name}`;
    onChange(selectedValue);
    setIsOpen(false);
    setCurrentLevel(1);
  };

  const handleBackToLevel1 = () => {
    setCurrentLevel(1);
  };

  const handleBackToLevel2 = () => {
    setCurrentLevel(2);
  };

  const handleReset = () => {
    setSelectedPath({});
    setCurrentLevel(1);
    setLevel2Options([]);
    setLevel3Options([]);
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-10 px-3 border border-gray-300 rounded-md flex items-center justify-between cursor-pointer hover:border-gray-400 bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || '请选择'}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
      </div>

      {/* 面包屑显示 */}
      {value && (
        <div className="mt-2 text-sm text-gray-600 bg-blue-50 inline-block px-3 py-1.5 rounded-md">
          {value}
        </div>
      )}

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start gap-4">
            {/* 第一级 */}
            <div className="flex-shrink-0 w-32">
              <div className="text-sm font-medium text-gray-900 mb-2">一级分类</div>
              <div className="space-y-1">
                {level1Options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleLevel1Click(option)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                      selectedPath.level1 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{option.name}</span>
                    {option.children && option.children.length > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 第二级 */}
            {currentLevel >= 2 && selectedPath.level1 && (
              <div className="flex-shrink-0 w-32 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">二级分类</div>
                <div className="space-y-1">
                  <button
                    onClick={handleBackToLevel1}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 mb-2"
                  >
                    &lt; 返回
                  </button>
                  {level2Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel2Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        selectedPath.level2 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{option.name}</span>
                      {option.children && option.children.length > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 第三级 */}
            {currentLevel >= 3 && selectedPath.level2 && (
              <div className="flex-shrink-0 w-40 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">三级分类</div>
                <div className="space-y-1">
                  <button
                    onClick={handleBackToLevel2}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 mb-2"
                  >
                    &lt; 返回
                  </button>
                  {level3Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel3Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedPath.level3 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部操作按钮 */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// 报告类型选项
const reportTypes = ['日报', '周报', '月报', '季报', '年报', '自定义周期']

// 报告层级选项
const reportLevels = ['全部', '全国', '地州', '地市', '区县', '网格']

// 模板状态选项
const templateStatuses = ['全部', '草稿', '已发布', '已下架']

// 模拟模板数据
const mockTemplates = [
  {
    id: 1,
    name: '测试模板',
    status: 'published',
    version: '20250130001',
    reportType: '月报',
    scenario: ['公众市场', '市场运营', '市场运营'],
    level: '全国',
    description: '测试模板描述',
    creator: '超级管理员',
    createTime: '2026-01-30 15:32:50',
  },
  {
    id: 2,
    name: '测试版本问题',
    status: 'draft',
    version: '20250129002',
    reportType: '日报',
    scenario: ['公众市场', '客户运营', '中高端'],
    level: '全国',
    description: '发布已下架的模板，不修改内容 看版本号是否变化',
    creator: '超级管理员',
    createTime: '2026-01-30 15:32:50',
  },
  {
    id: 3,
    name: '测试模板3',
    status: 'published',
    version: '20250130003',
    reportType: '周报',
    scenario: ['公众市场', '客户运营', '国际业务运营'],
    level: '地州',
    description: '测试',
    creator: '超级管理员',
    createTime: '2026-01-30 15:32:50',
  },
  {
    id: 4,
    name: '测试模板4',
    status: 'draft',
    version: '20250129004',
    reportType: '月报',
    scenario: ['政企市场'],
    level: '地市',
    description: '12',
    creator: '超级管理员',
    createTime: '2026-01-30 15:32:50',
  },
]

export default function ReportTemplatePage() {
  const router = useRouter()
  const [viewType, setViewType] = useState<'my' | 'team' | 'all'>('my')
  const [filters, setFilters] = useState({
    templateName: '',
    reportType: '全部',
    reportLevel: '全部',
    businessScenario: '',
    status: '全部',
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
      published: { label: '已发布', color: 'bg-green-100 text-green-600' },
      offline: { label: '已下架', color: 'bg-gray-100 text-gray-400' },
    }
    return config[status as keyof typeof config] || config.draft
  }

  // 获取操作菜单
  const getActionMenu = (template: any) => {
    if (template.status === 'draft') {
      // 草稿：支持详情、修改、删除、发布
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>查看详情</DropdownMenuItem>
          <DropdownMenuItem>修改</DropdownMenuItem>
          <DropdownMenuItem>删除</DropdownMenuItem>
          <DropdownMenuItem>发布</DropdownMenuItem>
        </DropdownMenuContent>
      )
    } else if (template.status === 'published') {
      // 已发布：支持详情、下架、复制
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>查看详情</DropdownMenuItem>
          <DropdownMenuItem>下架</DropdownMenuItem>
          <DropdownMenuItem>复制</DropdownMenuItem>
          <DropdownMenuItem>查看历史版本</DropdownMenuItem>
        </DropdownMenuContent>
      )
    } else if (template.status === 'offline') {
      // 已下架：支持详情、修改、删除、发布
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>查看详情</DropdownMenuItem>
          <DropdownMenuItem>修改</DropdownMenuItem>
          <DropdownMenuItem>删除</DropdownMenuItem>
          <DropdownMenuItem>发布</DropdownMenuItem>
        </DropdownMenuContent>
      )
    } else {
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>查看详情</DropdownMenuItem>
        </DropdownMenuContent>
      )
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 筛选条件区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm text-gray-600 mb-1">模板名称</div>
            <Input
              placeholder="请输入模板名称"
              value={filters.templateName}
              onChange={(e) => setFilters({ ...filters, templateName: e.target.value })}
            />
          </div>
          <div className="w-[180px]">
            <div className="text-sm text-gray-600 mb-1">报告类型</div>
            <Select value={filters.reportType} onValueChange={(value) => setFilters({ ...filters, reportType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                {reportTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <div className="text-sm text-gray-600 mb-1">报告层级</div>
            <Select value={filters.reportLevel} onValueChange={(value) => setFilters({ ...filters, reportLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                {reportLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[280px]">
            <div className="text-sm text-gray-600 mb-1">业务场景</div>
            <BusinessScenarioSelect value={filters.businessScenario} onChange={(value) => setFilters({ ...filters, businessScenario: value })} />
          </div>
          <div className="w-[180px]">
            <div className="text-sm text-gray-600 mb-1">模板状态</div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                {templateStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-sm">
            高级搜索
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setFilters({
                templateName: '',
                reportType: '全部',
                reportLevel: '全部',
                businessScenario: '',
                status: '全部',
              })
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button size="sm" className="bg-[#1D77FF] hover:bg-[#1565C0]">
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>
      </div>

      {/* 视图切换和操作区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewType === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('my')}
            className={viewType === 'my' ? 'bg-blue-50 text-[#0085D0] hover:bg-blue-100' : ''}
          >
            我创建的
          </Button>
          <Button
            variant={viewType === 'team' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('team')}
          >
            团队
          </Button>
          <Button
            variant={viewType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('all')}
          >
            全部
          </Button>
        </div>
        <Button className="bg-[#1D77FF] hover:bg-[#1565C0]" onClick={() => router.push('/workspace/insight/report/template/create')}>
          <Plus className="w-4 h-4 mr-2" />
          创建新模板
        </Button>
      </div>

      {/* 列表卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockTemplates.map((template) => {
          const statusBadge = getStatusBadge(template.status)
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-1 truncate">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {statusBadge.label}
                      </span>
                      <span className="text-gray-400">| 最新版本: {template.version}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                    {template.reportType}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {template.scenario.join('/')}  {template.level}
                  </span>
                </div>
                <CardDescription className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-400">
                  {template.creator}·创建于 {template.createTime}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    {getActionMenu(template)}
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* 分页区域 */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          共 84 项数据
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12条/页</SelectItem>
              <SelectItem value="24">24条/页</SelectItem>
              <SelectItem value="48">48条/页</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1}>
              &lt;
            </Button>
            <Button variant={currentPage === 1 ? "default" : "outline"} size="icon" className="h-8 w-8 bg-[#1D77FF]">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              ...
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              8
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 8}>
              &gt;
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>前往</span>
            <Input type="number" min={1} max={8} className="w-16 h-8 text-center" />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  )
}
