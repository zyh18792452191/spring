'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RefreshCw, Plus, FileText, ChevronRight, HelpCircle } from 'lucide-react'
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

// 配置状态选项
const configStatuses = ['已启用', '禁用', '草稿']

// 模拟报告配置数据
const mockReportConfigs = [
  {
    id: 'RC20250118001',
    name: '中高端客户运营分析报告',
    businessScenario: '公众市场 / 客户运营 / 中高端',
    version: 'V1.0',
    status: '已启用',
    reportType: '月报',
    reportLevel: '全国',
    area: '全国',
    creator: '超级管理员',
    createTime: '2025-01-18 10:30:25'
  },
  {
    id: 'RC20250118002',
    name: '市场运营周报配置',
    businessScenario: '公众市场 / 市场运营 / 市场运营',
    version: 'V1.2',
    status: '已启用',
    reportType: '周报',
    reportLevel: '全国',
    area: '全国',
    creator: '集团市场运营部',
    createTime: '2025-01-18 11:45:30'
  },
  {
    id: 'RC20250118003',
    name: '渠道运营分析报告',
    businessScenario: '公众市场 / 渠道运营 / 中国移动APP',
    version: 'V1.0',
    status: '禁用',
    reportType: '月报',
    reportLevel: '全国',
    area: '全国',
    creator: '超级管理员',
    createTime: '2025-01-18 14:20:15'
  },
  {
    id: 'RC20250118004',
    name: '新入网客户分析',
    businessScenario: '公众市场 / 客户运营 / 新入网',
    version: 'V0.5',
    status: '草稿',
    reportType: '日报',
    reportLevel: '全国',
    area: '全国',
    creator: '超级管理员',
    createTime: '2025-01-18 16:05:40'
  },
  {
    id: 'RC20250118005',
    name: '银发市场分析报告',
    businessScenario: '公众市场 / 客户运营 / 银发市场',
    version: 'V1.1',
    status: '已启用',
    reportType: '月报',
    reportLevel: '全国',
    area: '全国',
    creator: '集团市场运营部',
    createTime: '2025-01-18 17:30:50'
  },
]

// 获取状态样式
const getStatusStyle = (status: string) => {
  switch (status) {
    case '已启用':
      return 'bg-green-50 text-green-700 border-green-200'
    case '禁用':
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
    case '已启用':
      return 'bg-green-500'
    case '禁用':
      return 'bg-red-500'
    case '草稿':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

// 根据状态获取操作按钮
const getActionButtons = (config: any) => {
  switch (config.status) {
    case '已启用':
      return (
        <>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            详情
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            禁用
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            复制
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            生成报告
          </Button>
        </>
      )
    case '禁用':
      return (
        <>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            详情
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            修改
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600 hover:text-red-700">
            删除
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            启用
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            复制
          </Button>
        </>
      )
    case '草稿':
      return (
        <>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            详情
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[#1D77FF] hover:text-[#1565C0]">
            修改
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600 hover:text-red-700">
            删除
          </Button>
        </>
      )
    default:
      return null
  }
}

export default function ReportConfigListPage() {
  const router = useRouter()
  
  // 筛选条件状态
  const [filters, setFilters] = useState({
    reportName: '',
    businessScenario: '',
    reportType: '全部',
    reportLevel: '全部',
    status: '全部',
    createTime: '',
    startDate: '',
    endDate: '',
  })
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(52)

  const handleReset = () => {
    setFilters({
      reportName: '',
      businessScenario: '',
      reportType: '全部',
      reportLevel: '全部',
      status: '全部',
      createTime: '',
      startDate: '',
      endDate: '',
    })
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 顶部标签导航 */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-200 pb-4">
        <button 
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => router.push('/workspace/insight/report/management')}
        >
          报告列表
        </button>
        <button className="px-4 py-2 text-sm font-medium text-[#1D77FF] border-b-2 border-[#1D77FF]">
          报告配置列表
        </button>
      </div>

      {/* 筛选条件区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">报告名称</div>
                <Input
                  placeholder="请输入"
                  value={filters.reportName}
                  onChange={(e) => setFilters({ ...filters, reportName: e.target.value })}
                />
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">业务场景</div>
                <BusinessScenarioSelect value={filters.businessScenario} onChange={(value) => setFilters({ ...filters, businessScenario: value })} />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">状态</div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {configStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">创建时间</div>
                  <Input
                    type="date"
                    value={filters.createTime}
                    onChange={(e) => setFilters({ ...filters, createTime: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">报告周期</div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="text-sm flex-1"
                    />
                    <span className="text-gray-400 text-sm">~</span>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="text-sm flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="text-sm">
              高级搜索
            </Button>
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

      {/* 创建按钮 */}
      <div className="flex justify-end mb-6">
        <Button 
          className="bg-[#1D77FF] hover:bg-[#1565C0]"
          onClick={() => router.push('/workspace/insight/report/management/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          创建新报告
        </Button>
      </div>

      {/* 报告配置表格 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-gray-700">报告配置编码</TableHead>
              <TableHead className="font-medium text-gray-700">报告名称</TableHead>
              <TableHead className="font-medium text-gray-700">业务场景</TableHead>
              <TableHead className="font-medium text-gray-700">报告配置版本号</TableHead>
              <TableHead className="font-medium text-gray-700">状态</TableHead>
              <TableHead className="font-medium text-gray-700">报告类型</TableHead>
              <TableHead className="font-medium text-gray-700">报告层级</TableHead>
              <TableHead className="font-medium text-gray-700">归属区域</TableHead>
              <TableHead className="font-medium text-gray-700">创建人</TableHead>
              <TableHead className="font-medium text-gray-700">创建时间</TableHead>
              <TableHead className="font-medium text-gray-700 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReportConfigs.map((config, index) => (
              <TableRow key={config.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="text-sm text-gray-900">{config.id}</TableCell>
                <TableCell className="text-sm text-gray-900 font-medium">{config.name}</TableCell>
                <TableCell className="text-sm text-gray-600 max-w-xs truncate">{config.businessScenario}</TableCell>
                <TableCell className="text-sm text-gray-600">{config.version}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getStatusStyle(config.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusIconColor(config.status)}`} />
                    {config.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-50 text-[#1D77FF] border-blue-200">
                    {config.reportType}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{config.reportLevel}</TableCell>
                <TableCell className="text-sm text-gray-600">{config.area}</TableCell>
                <TableCell className="text-sm text-gray-600 max-w-[120px] truncate">{config.creator}</TableCell>
                <TableCell className="text-sm text-gray-600">{config.createTime}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    {getActionButtons(config)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页区域 */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-600">共 {totalCount} 项数据</span>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1}>
              <HelpCircle className="w-4 h-4" />
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
              6
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 6}>
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600">前往</span>
            <Input
              type="number"
              min={1}
              max={6}
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
