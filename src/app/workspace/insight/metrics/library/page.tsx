'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Download, ArrowUp, ArrowDown, MoreHorizontal, Filter, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import MetricRelationConfigDialog from '@/components/MetricRelationConfigDialog';
import ImportRelationDialog from '@/components/ImportRelationDialog';

// 模拟数据
const mockData = [
  {
    id: 1,
    code: 'ACTIVITY_PV_DAY',
    name: '活动PV（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 2,
    code: 'ACTIVITY_UV_DAY',
    name: '活动UV（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 3,
    code: 'SDJH_CYKHGM_DAY',
    name: '参与客户规模（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 4,
    code: 'SDJH_ZXD_DAY',
    name: '知晓度（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 5,
    code: 'SDJH_CYD_DAY',
    name: '参与度（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 6,
    code: 'SDJH_MYD_DAY',
    name: '满意度（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 7,
    code: 'SDJH_KHJZ_DAY',
    name: '全球通客户净增（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 8,
    code: 'SDJH_KHGBMYL_DAY',
    name: '全球通客户规模保有率（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 9,
    code: 'SDJH_DYLWGM_DAY',
    name: '当月离网规模（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '值',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
  {
    id: 10,
    code: 'SDJH_DYLWGM_MOM_DAY',
    name: '当月离网规模环比（日）',
    isCustomerMetric: '否',
    businessScenario: '公众市场/客户运营/统一营销进度',
    type: '环比',
    granularity: '地州',
    department: '集团根组织',
    owner: '集团管理员',
    effectiveDate: '2026-01-01',
    creator: 'admin',
    createTime: '2026-01-30 11:41:44',
    status: '已生效',
  },
];

export default function IndicatorLibraryPage() {
  const router = useRouter();
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems] = useState(529);
  const [totalPages] = useState(53);

  // 关联配置弹窗状态
  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{
    id: number;
    code: string;
    name: string;
    type: string;
  } | null>(null);

  // 导入关联关系弹窗状态
  const [importRelationDialogOpen, setImportRelationDialogOpen] = useState(false);

  // 判断是否显示关联配置按钮（仅值、占比、增量类型显示）
  const canShowRelationConfig = (type: string) => {
    return ['值', '占比', '增量'].includes(type);
  };

  // 打开关联配置弹窗
  const handleOpenRelationConfig = (item: typeof mockData[0]) => {
    setSelectedMetric({
      id: item.id,
      code: item.code,
      name: item.name,
      type: item.type,
    });
    setRelationDialogOpen(true);
  };

  // 保存关联配置
  const handleSaveRelation = (data: { metricId: number; yoyMetricId?: string; momMetricId?: string }) => {
    console.log('保存关联关系:', data);
    // TODO: 调用API保存
  };

  // 导入关联关系结果
  const handleImportRelation = (result: { total: number; success: number; failed: number }) => {
    console.log('导入结果:', result);
    // TODO: 刷新列表
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(mockData.map(item => item.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(prev => [...prev, id]);
    } else {
      setSelectedRowIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const isAllSelected = selectedRowIds.length === mockData.length;
  const isSomeSelected = selectedRowIds.length > 0 && selectedRowIds.length < mockData.length;

  return (
    <div className="p-6">
      {/* 顶部筛选区 */}
      <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择客群指标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">是</SelectItem>
                  <SelectItem value="no">否</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择业务场景" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">公众市场/客户运营/统一营销进度</SelectItem>
                  <SelectItem value="2">公众市场/客户运营/统一营销效果</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择指标最小粒度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="province">地州</SelectItem>
                  <SelectItem value="city">地市</SelectItem>
                  <SelectItem value="district">区县</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择统计周期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">日</SelectItem>
                  <SelectItem value="week">周</SelectItem>
                  <SelectItem value="month">月</SelectItem>
                </SelectContent>
              </Select>

              <button className="text-blue-500 text-sm hover:text-blue-600">
                展开
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2" size="sm">
                <RefreshCw className="w-4 h-4" />
                重置
              </Button>
              <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600" size="sm">
                <Search className="w-4 h-4" />
                搜索
              </Button>
            </div>
          </div>
        </Card>

        {/* 操作按钮区 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            已选择 <span className="text-blue-500 font-semibold">{selectedRowIds.length}</span> 项
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              size="sm"
              onClick={() => router.push('/workspace/insight/metrics/library/new')}
            >
              <Plus className="w-4 h-4" />
              新增指标
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-500" size="sm">
              <Download className="w-4 h-4" />
              批量导入
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-blue-500 text-blue-500" 
              size="sm"
              onClick={() => setImportRelationDialogOpen(true)}
            >
              <Link2 className="w-4 h-4" />
              导入关联关系
            </Button>
            <Button variant="outline" className="flex items-center gap-2" size="sm">
              <ArrowUp className="w-4 h-4" />
              上架
            </Button>
            <Button variant="outline" className="flex items-center gap-2" size="sm">
              <ArrowDown className="w-4 h-4" />
              下架
            </Button>
          </div>
        </div>

        {/* 表格区域 */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 sticky left-0 z-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap bg-gray-50 sticky left-10 z-10 min-w-[180px] shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                    指标编码
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[150px]">
                    指标名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                    客群指标
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[280px]">
                    业务场景
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                    指标类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[120px]">
                    指标最小粒度
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[120px]">
                    指标责任部门
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[120px]">
                    指标责任人
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[120px]">
                    生效日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                    创建人
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[180px]">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap min-w-[180px] bg-gray-50 sticky right-0 z-30 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockData.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap bg-white sticky left-0 z-10 group-hover:bg-gray-50">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                        className="border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium bg-white sticky left-10 z-10 min-w-[180px] group-hover:bg-gray-50 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 min-w-[150px]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px]">
                      {item.isCustomerMetric}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[280px]">
                      {item.businessScenario}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px]">
                      {item.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px]">
                      {item.granularity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px]">
                      {item.department}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px]">
                      {item.owner}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px]">
                      {item.effectiveDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px]">
                      {item.creator}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[180px]">
                      {item.createTime}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[100px]">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[220px] bg-white sticky right-0 z-30 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] group-hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-blue-500 text-sm hover:text-blue-600"
                          onClick={() => router.push(`/workspace/insight/metrics/library/${item.id}`)}
                        >
                          详情
                        </button>
                        <button className="text-blue-500 text-sm hover:text-blue-600">
                          编辑
                        </button>
                        {canShowRelationConfig(item.type) && (
                          <button 
                            className="text-blue-500 text-sm hover:text-blue-600"
                            onClick={() => handleOpenRelationConfig(item)}
                          >
                            关联配置
                          </button>
                        )}
                        <button className="text-blue-500 text-sm hover:text-blue-600">
                          下架
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 底部分页和统计 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            共 <span className="font-semibold">{totalItems}</span> 项数据
          </div>

          <div className="flex items-center gap-4">
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ArrowUp className="w-4 h-4 -rotate-90" />
              </button>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 2 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 3 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 4 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(4)}
              >
                4
              </button>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === 5 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(5)}
              >
                5
              </button>

              <span className="text-gray-400">...</span>

              <button
                className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                  currentPage === totalPages ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>

              <button
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              >
                <ArrowUp className="w-4 h-4 rotate-90" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">前往</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                className="w-16 h-8"
              />
              <span className="text-sm text-gray-600">页</span>
            </div>
          </div>
        </div>

      {/* 关联配置弹窗 */}
      <MetricRelationConfigDialog
        open={relationDialogOpen}
        onOpenChange={setRelationDialogOpen}
        metric={selectedMetric}
        onSave={handleSaveRelation}
      />

      {/* 导入关联关系弹窗 */}
      <ImportRelationDialog
        open={importRelationDialogOpen}
        onOpenChange={setImportRelationDialogOpen}
        onImport={handleImportRelation}
      />
    </div>
  );
}
