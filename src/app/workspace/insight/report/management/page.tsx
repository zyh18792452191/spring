'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, Plus, Copy, Download, Trash2, MoreHorizontal, FileText, ChevronRight, HelpCircle, Calendar, ChevronLeft, ChevronRight as ChevronRightIcon, MessageSquare } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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

  const handleLevel3Click = (option: BusinessScenarioItem) => {
    setSelectedPath((prev) => ({ ...prev, level3: option.name }));
    // 完成选择
    const selectedValue = `${selectedPath.level1} / ${selectedPath.level2} / ${option.name}`;
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleBackToLevel1 = () => {
    setCurrentLevel(1);
    setSelectedPath({ level1: selectedPath.level1 });
  };

  const handleBackToLevel2 = () => {
    setCurrentLevel(2);
    setSelectedPath({ level1: selectedPath.level1, level2: selectedPath.level2 });
  };

  const handleClear = () => {
    setSelectedPath({});
    setCurrentLevel(1);
    setLevel2Options([]);
    setLevel3Options([]);
    onChange('');
  };

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className="h-[38px] px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors bg-white"
          >
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>
              {value || '请选择'}
            </span>
            <div className="flex items-center gap-1">
              {value && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex p-3">
            {/* 第一级 */}
            <div className="flex-shrink-0 w-28">
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
              <div className="flex-shrink-0 w-28 border-l border-gray-200 pl-4">
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
              <div className="flex-shrink-0 w-28 border-l border-gray-200 pl-4">
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

// 报告类型选项
const reportTypes = ['日报', '周报', '月报', '季报', '年报', '自定义周期']

// 报告层级选项
const reportLevels = ['全国', '地州', '地市', '区县', '网格']

// 报告状态选项
const reportStatuses = ['全部', '生成成功', '生成中', '生成失败', '草稿']

// 模拟报告数据
const mockReports = [
  {
    id: 1,
    name: '测试下载2',
    status: '生成成功',
    reportPeriod: '2025-12',
    reportType: '月报',
    businessScenario: '公众市场 / 客户运营 / 中高端',
    reportLevel: '全国',
    description: '分析中高端客户运营情况',
    creator: 'super_admin',
    createTime: '2026-02-10'
  },
  {
    id: 2,
    name: '测试报告生成',
    status: '生成成功',
    reportPeriod: '2025-12',
    reportType: '月报',
    businessScenario: '公众市场 / 客户运营 / 中高端',
    reportLevel: '全国',
    description: '测试',
    creator: 'super_admin',
    createTime: '2026-02-10'
  },
  {
    id: 3,
    name: '市场运营周报',
    status: '生成中',
    reportPeriod: '2025-12-15',
    reportType: '周报',
    businessScenario: '公众市场 / 市场运营 / 市场运营',
    reportLevel: '全国',
    description: '分析市场运营情况',
    creator: 'super_admin',
    createTime: '2026-02-10'
  },
  {
    id: 4,
    name: '渠道运营月报',
    status: '生成失败',
    reportPeriod: '2025-12',
    reportType: '月报',
    businessScenario: '公众市场 / 渠道运营 / 中国移动APP',
    reportLevel: '全国',
    description: '渠道运营数据报告',
    creator: 'super_admin',
    createTime: '2026-02-10'
  },
  {
    id: 5,
    name: '新入网分析日报',
    status: '生成成功',
    reportPeriod: '2025-12-18',
    reportType: '日报',
    businessScenario: '公众市场 / 客户运营 / 新入网',
    reportLevel: '地州',
    description: '新入网客户分析',
    creator: 'super_admin',
    createTime: '2026-02-10'
  },
]

// 获取状态样式
const getStatusStyle = (status: string) => {
  switch (status) {
    case '生成成功':
      return 'bg-green-50 text-green-700 border-green-200'
    case '生成中':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case '生成失败':
      return 'bg-red-50 text-red-700 border-red-200'
    case '草稿':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// 获取状态图标颜色
const getStatusIconColor = (status: string) => {
  switch (status) {
    case '生成成功':
      return 'bg-green-500'
    case '生成中':
      return 'bg-blue-500'
    case '生成失败':
      return 'bg-red-500'
    case '草稿':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

// 根据状态获取操作菜单
const getActionMenu = (report: any) => {
  switch (report.status) {
    case '生成中':
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>生成中，暂无操作</DropdownMenuItem>
        </DropdownMenuContent>
      )
    case '生成成功':
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>查看报告</DropdownMenuItem>
          <DropdownMenuItem>下载</DropdownMenuItem>
          <DropdownMenuItem>重新生成</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
        </DropdownMenuContent>
      )
    case '生成失败':
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>重新生成</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
        </DropdownMenuContent>
      )
    case '草稿':
      return (
        <DropdownMenuContent align="end">
          <DropdownMenuItem>编辑</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
        </DropdownMenuContent>
      )
    default:
      return null
  }
}

export default function ReportManagementPage() {
  const router = useRouter()
  
  // 筛选条件状态
  const [filters, setFilters] = useState({
    reportName: '',
    businessScenario: '',
    reportType: '全部',
    reportLevel: '全部',
    status: '全部',
    startDate: '',
    endDate: '',
  })
  
  // 视图类型
  const [viewType, setViewType] = useState<'my' | 'team' | 'all'>('my')
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalCount, setTotalCount] = useState(144)

  const handleReset = () => {
    setFilters({
      reportName: '',
      businessScenario: '',
      reportType: '全部',
      reportLevel: '全部',
      status: '全部',
      startDate: '',
      endDate: '',
    })
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 顶部标签导航 */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-4">
        <button className="px-4 py-2 text-sm font-medium text-[#1D77FF] border-b-2 border-[#1D77FF]">
          报告列表
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => router.push('/workspace/insight/report/management/config')}
        >
          报告配置列表
        </button>
      </div>

      {/* 筛选条件区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">报告名称</div>
            <Input
              placeholder="请输入"
              value={filters.reportName}
              onChange={(e) => setFilters({ ...filters, reportName: e.target.value })}
            />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">业务场景</div>
            <BusinessScenarioSelect value={filters.businessScenario} onChange={(value) => setFilters({ ...filters, businessScenario: value })} />
          </div>
          <div>
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
          <div>
            <div className="text-sm text-gray-600 mb-1">报告层级</div>
            <Select value={filters.reportLevel} onValueChange={(value) => setFilters({ ...filters, reportLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                {reportLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">报告状态</div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                {reportStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">报告周期</div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="text-sm"
              />
              <span className="text-gray-400">~</span>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-sm">
            高级搜索
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
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
            className={viewType === 'my' ? 'bg-white text-[#1D77FF] border-[#1D77FF]' : ''}
          >
            我生成的
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
        <Button 
          className="bg-[#1D77FF] hover:bg-[#1565C0]"
          onClick={() => router.push('/workspace/insight/report/management/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          创建新报告
        </Button>
        <Button 
          variant="outline"
          className="border-[#1D77FF] text-[#1D77FF] hover:bg-blue-50"
          onClick={() => router.push('/workspace/ai-insight')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          AI洞察分析
        </Button>
      </div>

      {/* 报告卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#1D77FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium text-gray-900 truncate">{report.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getStatusStyle(report.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusIconColor(report.status)}`} />
                        {report.status}
                      </span>
                      <span className="text-xs text-gray-500">{report.reportPeriod}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {getActionMenu(report)}
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-blue-50 text-[#1D77FF] border-blue-200">
                  {report.reportType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {report.businessScenario}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {report.reportLevel}
                </Badge>
              </div>
              {report.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
              )}
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-gray-400">
                  {report.creator} · 创建于{report.createTime}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                  {report.status === '生成成功' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                  {report.status !== '生成中' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 分页区域 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">共 {totalCount} 项数据</span>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="w-24">
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
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 bg-[#1D77FF] text-white border-none">
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              3
            </Button>
            <span className="text-gray-400 px-2">...</span>
            <Button variant="outline" size="sm" className="h-8 w-8">
              12
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 12}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input
              type="number"
              min={1}
              max={12}
              defaultValue={1}
              className="w-16 h-8 text-center"
            />
            <span className="text-sm text-gray-600">页</span>
          </div>
        </div>
      </div>
    </div>
  )
}
