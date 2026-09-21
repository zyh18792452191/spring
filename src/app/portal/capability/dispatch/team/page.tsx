'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Upload, Download, ArrowLeft, Layers, Tag, Star, UserMinus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { StaffDetailDialog } from '@/components/staff-management/StaffDetailDialog';
import { OrganizationTree } from '@/components/staff-management/OrganizationTree';
import TagSelect from '@/components/staff-management/TagSelect';
import TagManager from '@/components/staff-management/TagManager';
import { TagTreeSelect } from '@/components/staff-management/TagTreeSelect';
import AddStaffDialog, { StaffItem } from '@/components/staff-management/AddStaffDialog';
import StaffFormDialog from '@/components/staff-management/StaffFormDialog';
import { OrganizationTreeSelect } from '@/components/staff-management/OrganizationTreeSelect';

export default function StaffManagementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <StaffManagementPageContent />
    </Suspense>
  );
}

function StaffManagementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOverview = searchParams.get('from') === 'overview';

  const [viewMode, setViewMode] = useState<'visual' | 'list'>('list');
  const [stats, setStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 批量管理状态
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedStaffList, setSelectedStaffList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all'); // 组织筛选（合并原regionFilter和departmentFilter）
  const [receiverTypeFilter, setReceiverTypeFilter] = useState<string>('all'); // 接收人类型：默认接收人/普通
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>('all'); // 人员状态：在职/离职
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set()); // 批量选中的人员ID

  // 对话框状态
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTagManagerDialog, setShowTagManagerDialog] = useState(false);
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importTags, setImportTags] = useState<string[]>([]);

  // 返回总览页
  const handleBack = () => {
    router.push('/portal/capability/dispatch/overview');
  };

  // 加载统计数据
  useEffect(() => {
    loadStats();
    loadAllTaggedStaff();
  }, []);

  // 缓存tagCounts对象，避免每次渲染都创建新对象
  const tagCounts = useMemo(() => {
    return stats?.tagStats?.reduce((acc: { [key: string]: number }, item: { name: string; count: number }) => {
      acc[item.name] = item.count;
      return acc;
    }, {}) || {};
  }, [stats?.tagStats]);

  // 当选择标签变化时，加载该标签的人员
  useEffect(() => {
    if (selectedTag) {
      if (selectedTag === 'all') {
        loadAllTaggedStaff();
      } else {
        loadTagStaff(selectedTag);
      }
      setCurrentPage(1);
      // 重置筛选条件
      setSearchQuery('');
      setOrganizationFilter('all');
      setReceiverTypeFilter('all');
      setStaffStatusFilter('all');
    }
  }, [selectedTag]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/staff-management/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 加载所有已打标签的人员（只查询在职人员）
  const loadAllTaggedStaff = async () => {
    try {
      const response = await fetch('/api/staff-management?hasTags=true&status=active&pageSize=10000');
      const result = await response.json();

      if (result.success) {
        // 过滤掉空数组的数据
        const filteredData = (result.data || []).filter((staff: any) => staff.tags && staff.tags.length > 0);
        setSelectedStaffList(filteredData);
        setTotalCount(filteredData.length);
      }
    } catch (error) {
      console.error('加载人员列表失败:', error);
    }
  };

  // 标签管理关闭后的回调
  const handleTagManagerClose = (open: boolean) => {
    setShowTagManagerDialog(open);
    if (!open) {
      // 标签管理关闭后，重新加载数据以刷新所有标签选择组件
      loadStats();
      // 如果当前选中的标签不在新的标签列表中，重置为全部
      if (selectedTag !== 'all') {
        setSelectedTag('all');
        loadAllTaggedStaff();
      }
    }
  };

  // 加载某个标签的人员（只查询在职人员）
  const loadTagStaff = async (tagName: string) => {
    try {
      const childTags = getChildTags(tagName);
      const tagsToQuery = childTags.length > 0 ? childTags : [tagName];

      const requests = tagsToQuery.map(tag =>
        fetch(`/api/staff-management?tag=${encodeURIComponent(tag)}&status=active&pageSize=10000`)
      );

      const responses = await Promise.all(requests);
      const results = await Promise.all(responses.map(r => r.json()));

      const staffMap = new Map<string, any>();
      results.forEach(result => {
        if (result.success) {
          result.data.forEach((staff: any) => {
            // 过滤掉空数组的数据
            if (staff.tags && staff.tags.length > 0 && !staffMap.has(staff.id)) {
              staffMap.set(staff.id, staff);
            }
          });
        }
      });

      const staffList = Array.from(staffMap.values());
      setSelectedStaffList(staffList);
      setTotalCount(staffList.length);
    } catch (error) {
      console.error('加载人员列表失败:', error);
    }
  };

  // 判断是否为末级节点
  const isLeafNode = (tagName: string): boolean => {
    if (tagName === 'all') return false;
    if (tagName.includes('/')) return true;
    if (tagName === '存量运营') return false;
    return true;
  };

  // 获取标签的子标签列表
  const getChildTags = (tagName: string): string[] => {
    if (tagName === '存量运营') {
      return [
        '存量运营 / 中高端客户运营',
        '存量运营 / 离网维系',
        '存量运营 / 用量运营',
        '存量运营 / 融合运营',
        '存量运营 / 细分市场运营',
      ];
    }
    return [];
  };

  // 从标签名中提取标签 ID
  const extractTagId = (tagName: string): string => {
    if (tagName === 'all') return '';
    return tagName;
  };

  // 添加人员
  const handleAddStaff = async (staff: StaffItem[]) => {
    try {
      const tagName = extractTagId(selectedTag);
      await Promise.all(staff.map(s =>
        fetch(`/api/staff-management/${s.id}/tags`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagToAdd: tagName }),
        })
      ));

      if (selectedTag === 'all') {
        await loadAllTaggedStaff();
      } else {
        await loadTagStaff(selectedTag);
      }
    } catch (error) {
      console.error('添加标签失败:', error);
    }
  };

  // 编辑人员
  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setShowEditDialog(true);
  };

  // 提交编辑
  const handleSubmitEdit = async (formData: any) => {
    try {
      // 调用 API 更新人员信息
      await fetch(`/api/staff-management/${selectedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: formData.tags,
          is_default_receiver: formData.isDefaultReceiver,
        }),
      });

      // 重新加载数据
      if (selectedTag === 'all') {
        await loadAllTaggedStaff();
      } else {
        await loadTagStaff(selectedTag);
      }

      setShowEditDialog(false);
    } catch (error) {
      console.error('编辑人员失败:', error);
    }
  };

  // 移除人员
  const removeStaffFromTag = async (staffId: string) => {
    try {
      const tagName = extractTagId(selectedTag);

      await fetch(`/api/staff-management/${staffId}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagToRemove: tagName }),
      });

      if (selectedTag === 'all') {
        await loadAllTaggedStaff();
      } else {
        await loadTagStaff(selectedTag);
      }
    } catch (error) {
      console.error('移除人员失败:', error);
    }
  };

  // 设置默认接收人
  const toggleDefaultReceiver = async (id: string) => {
    try {
      await fetch(`/api/staff-management/${id}/default-receiver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (selectedTag === 'all') {
        await loadAllTaggedStaff();
      } else {
        await loadTagStaff(selectedTag);
      }
    } catch (error) {
      console.error('设置默认接收人失败:', error);
    }
  };

  // 计算筛选后的人员列表
  const filteredStaffList = useMemo(() => {
    return selectedStaffList.filter(staff => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = staff.name.toLowerCase().includes(query);
        const phoneMatch = staff.phone.includes(query);
        if (!nameMatch && !phoneMatch) return false;
      }

      if (organizationFilter !== 'all') {
        // organizationFilter格式: province 或 province-departmentId
        const [filterRegion, filterDept] = organizationFilter.split('-');
        if (filterDept) {
          // 精确匹配省公司和部门
          if (staff.region !== filterRegion || staff.department !== filterDept) return false;
        } else {
          // 只匹配省公司
          if (staff.region !== filterRegion) return false;
        }
      }

      // 接收人类型筛选（默认接收人/普通）
      if (receiverTypeFilter !== 'all') {
        if (receiverTypeFilter === 'default' && !staff.is_default_receiver) return false;
        if (receiverTypeFilter === 'normal' && staff.is_default_receiver) return false;
      }

      // 人员状态筛选（在职/离职）
      if (staffStatusFilter !== 'all') {
        if (staffStatusFilter === 'active' && staff.status !== 'active') return false;
        if (staffStatusFilter === 'inactive' && staff.status !== 'inactive') return false;
      }

      return true;
    });
  }, [selectedStaffList, searchQuery, organizationFilter, receiverTypeFilter, staffStatusFilter]);

  // 获取筛选后的人员列表（分页）
  const paginatedStaffList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStaffList.slice(startIndex, endIndex);
  }, [filteredStaffList, currentPage, pageSize]);

  // 获取总页数
  const totalPages = Math.ceil(filteredStaffList.length / pageSize);

  const handleDelete = async (id: string, name: string, status: string) => {
    // 只有离职人员才能删除
    if (status !== 'inactive') {
      alert('在职人员不允许删除！');
      return;
    }

    if (!confirm(`确定要删除 ${name} 吗？`)) return;

    try {
      const response = await fetch(`/api/staff-management/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        alert('删除成功');
        loadStats();
        loadAllTaggedStaff();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 批量选择/取消选择
  const toggleSelectStaff = (id: string) => {
    const newSelected = new Set(selectedStaffIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStaffIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedStaffIds.size === filteredStaffList.length) {
      setSelectedStaffIds(new Set());
    } else {
      setSelectedStaffIds(new Set(filteredStaffList.map((staff: any) => staff.id)));
    }
  };

  // 批量移除人员
  const handleBatchRemove = async () => {
    if (selectedStaffIds.size === 0) {
      alert('请先选择要移除的人员');
      return;
    }

    if (!confirm(`确定要批量移除选中的 ${selectedStaffIds.size} 人吗？`)) return;

    try {
      const promises = Array.from(selectedStaffIds).map(id =>
        fetch(`/api/staff-management/${id}`, { method: 'DELETE' })
      );
      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`批量移除完成：成功 ${successCount} 人，失败 ${failCount} 人`);
      } else {
        alert(`成功批量移除 ${successCount} 人`);
      }

      setSelectedStaffIds(new Set());
      loadStats();
      loadAllTaggedStaff();
    } catch (error) {
      console.error('批量移除失败:', error);
      alert('批量移除失败');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/staff-management/export');

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `运营人员数据_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('请选择要导入的文件');
      return;
    }

    if (importTags.length === 0) {
      alert('请选择至少一个标签');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('tags', JSON.stringify(importTags));

      const response = await fetch('/api/staff-management/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        alert(result.message);
        loadStats();
        loadAllTaggedStaff();
      } else {
        alert(result.error || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          {isFromOverview && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">运营人员管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理运营团队人员信息，支持人员增删改查、导入导出、标签管理等功能</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 搜索和筛选栏 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* 搜索框 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索手机号、姓名..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* 标签筛选 - 所有视图都显示 */}
              <TagTreeSelect
                data={stats?.tagStats?.map((item: { name: string; count: number }) => ({
                  name: item.name,
                  count: item.count,
                })) || []}
                value={selectedTag}
                onChange={(value) => {
                  setSelectedTag(value);
                  // 在列表模式下，也更新批量管理的标签
                  if (viewMode === 'list') {
                    setSelectedTag(value);
                  }
                }}
                placeholder="全部标签"
                allOptionLabel="全部标签"
                allOptionValue="all"
                className="w-[280px]"
              />

              {/* 列表视图时才显示组织、接收人类型、人员状态筛选 */}
              {viewMode === 'list' && (
                <>
                  {/* 组织筛选（树形选择器） */}
                  <OrganizationTreeSelect
                    value={organizationFilter === 'all' ? '' : organizationFilter}
                    onChange={(value) => setOrganizationFilter(value || 'all')}
                    placeholder="全部组织"
                    className="w-[280px]"
                  />

                  {/* 接收人类型筛选 */}
                  <Select value={receiverTypeFilter} onValueChange={setReceiverTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="全部接收人类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部接收人类型</SelectItem>
                      <SelectItem value="default">默认接收人</SelectItem>
                      <SelectItem value="normal">普通</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 人员状态筛选 */}
                  <Select value={staffStatusFilter} onValueChange={setStaffStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="全部人员状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部人员状态</SelectItem>
                      <SelectItem value="active">在职</SelectItem>
                      <SelectItem value="inactive">离职</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="h-4 w-4" />
                  导入
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  导出
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 视图切换 */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'visual' | 'list')}>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="visual" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                可视化视图
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                列表视图
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowTagManagerDialog(true)}
            >
              <Tag className="h-4 w-4" />
              标签管理
            </Button>
            {viewMode === 'list' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowAddStaffDialog(true)}
                disabled={!isLeafNode(selectedTag)}
              >
                <Plus className="h-4 w-4" />
                添加人员
                {!isLeafNode(selectedTag) && (
                  <span className="ml-2 text-xs text-gray-500">
                    （请选择具体标签）
                  </span>
                )}
              </Button>
            )}
            {viewMode === 'list' && (
              <Button
                size="sm"
                variant={selectedStaffIds.size > 0 ? "destructive" : "outline"}
                className="gap-2"
                onClick={handleBatchRemove}
                disabled={selectedStaffIds.size === 0}
              >
                <UserMinus className="h-4 w-4" />
                批量移除{selectedStaffIds.size > 0 && `（${selectedStaffIds.size}）`}
              </Button>
            )}
          </div>
        </div>

        {/* 可视化视图 */}
        {viewMode === 'visual' && (
          <OrganizationTree
            selectedTag={selectedTag}
          />
        )}

        {/* 列表视图 - 批量管理 */}
        {viewMode === 'list' && (
          <Card className="flex flex-col h-[700px] overflow-hidden">
          <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
            {/* 左侧：标签树 */}
            <div className="w-[300px] flex flex-col overflow-hidden border-r bg-gray-50">
              <div className="flex-1 overflow-y-auto p-4">
                <Label className="text-sm font-medium mb-3 block">标签筛选</Label>
                <TagSelect
                  value={selectedTag ? [selectedTag] : []}
                  onChange={(value) => setSelectedTag(value[0] || '全部')}
                  singleSelect={true}
                  showCount={true}
                  includeAll={true}
                  externalTagCounts={tagCounts}
                  totalCount={stats?.active}
                />
              </div>
            </div>

            {/* 右侧：运营人员列表 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex-none">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    运营人员 - {selectedTag === 'all' ? '全部' : selectedTag}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    共 {filteredStaffList.length} 人
                  </Badge>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {!selectedTag ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                    <Layers className="h-12 w-12 text-gray-300" />
                    <p>请选择标签</p>
                  </div>
                ) : paginatedStaffList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                    <UserMinus className="h-12 w-12 text-gray-300" />
                    <p>暂无人员</p>
                  </div>
                ) : (
                  <div className="overflow-auto flex-1">
                    <table className="w-full text-sm sticky-header">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-center font-medium text-gray-700 border-b w-12">
                            <input
                              type="checkbox"
                              checked={selectedStaffIds.size > 0 && selectedStaffIds.size === paginatedStaffList.length}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">工号</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">姓名</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">手机号</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">岗位</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">组织</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">标签</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-700 border-b">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paginatedStaffList.map((staff) => (
                          <tr
                            key={staff.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setShowDetailDialog(true);
                            }}
                          >
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedStaffIds.has(staff.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelectStaff(staff.id);
                                }}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3">{staff.employee_no}</td>
                            <td className="px-4 py-3 font-medium">{staff.name}</td>
                            <td className="px-4 py-3">{staff.phone}</td>
                            <td className="px-4 py-3">{staff.position}</td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900" title={staff.organization_full || staff.region}>
                                {staff.organization_name || staff.department || staff.region}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {staff.tags && staff.tags.length > 0 && staff.tags.map((tag: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStaff(staff);
                                    setShowDetailDialog(true);
                                  }}
                                  title="查看详情"
                                  className="h-7 px-2 text-xs"
                                >
                                  详情
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStaff(staff);
                                  }}
                                  title="修改"
                                  className="h-7 px-2 text-xs"
                                >
                                  修改
                                </Button>
                                <Button
                                  size="sm"
                                  variant={staff.is_default_receiver ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDefaultReceiver(staff.id);
                                  }}
                                  title={staff.is_default_receiver ? '取消默认接收人' : '设为默认接收人'}
                                  className="h-7 px-2 text-xs"
                                >
                                  {staff.is_default_receiver ? '已设默认' : '设为默认'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeStaffFromTag(staff.id);
                                  }}
                                  title="从标签中移除"
                                  className="h-7 px-2 text-xs text-red-600"
                                >
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      第 {currentPage} / {totalPages} 页，共 {filteredStaffList.length} 人
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const maxPagesToShow = 5;
                          let startPage: number;
                          let endPage: number;

                          if (totalPages <= maxPagesToShow) {
                            startPage = 1;
                            endPage = totalPages;
                          } else {
                            startPage = Math.max(1, currentPage - 2);
                            endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                            if (endPage - startPage < maxPagesToShow - 1) {
                              startPage = Math.max(1, endPage - maxPagesToShow + 1);
                            }
                          }

                          const pageNumbers: number[] = [];
                          for (let i = startPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }

                          return pageNumbers.map(pageNum => (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          ));
                        })()}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
        )}
      </div>

      {/* 人员详情弹窗 */}
      {showDetailDialog && selectedStaff && (
        <StaffDetailDialog
          staff={selectedStaff}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}

      {/* 导入人员弹窗 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入人员数据</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importTags">
                选择标签 <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <TagSelect
                  value={importTags}
                  onChange={(value) => setImportTags(value as any)}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                请选择要导入的人员所属标签
              </p>
            </div>

            <div>
              <Label htmlFor="importFile">选择CSV文件</Label>
              <Input
                id="importFile"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-2">
                请确保CSV文件包含"手机号码"列，用于匹配已存在的员工并为其打上选中的标签
              </p>
            </div>

            {importResult && (
              <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-medium ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
                {importResult.data?.errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">错误详情:</p>
                    <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                      {importResult.data.errors.slice(0, 5).map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {importResult.data.errors.length > 5 && (
                        <li>...还有 {importResult.data.errors.length - 5} 条错误</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setImportFile(null);
                setImportResult(null);
                setImportTags([]);
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!importFile || importTags.length === 0}
            >
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 标签管理弹窗 */}
      <TagManager
        open={showTagManagerDialog}
        onOpenChange={handleTagManagerClose}
      />

      {/* 添加人员弹窗 */}
      <AddStaffDialog
        open={showAddStaffDialog}
        onOpenChange={setShowAddStaffDialog}
        tagId={extractTagId(selectedTag)}
        tagName={selectedTag}
        onAddStaff={handleAddStaff}
      />

      {/* 编辑人员弹窗 */}
      {showEditDialog && selectedStaff && (
        <StaffFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleSubmitEdit}
          initialData={{
            employeeNo: selectedStaff.employee_no,
            name: selectedStaff.name,
            organizationId: selectedStaff.department 
              ? `${selectedStaff.region}-${selectedStaff.department}` 
              : selectedStaff.region,
            position: selectedStaff.position,
            phone: selectedStaff.phone,
            email: selectedStaff.email,
            status: selectedStaff.status,
            account4a: selectedStaff.account_4a,
            accountOa: selectedStaff.account_oa,
            accountProvincial: selectedStaff.account_provincial,
            tags: selectedStaff.tags || [],
            isDefaultReceiver: selectedStaff.is_default_receiver || false,
          }}
          isEdit={true}
        />
      )}
    </div>
  );
}
