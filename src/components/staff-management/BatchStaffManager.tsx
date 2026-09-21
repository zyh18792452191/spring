'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, UserMinus, Save, Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TagSelect from './TagSelect';
import AddStaffDialog, { StaffItem } from './AddStaffDialog';

export interface SelectedStaff {
  id: string;
  employee_no: string;
  name: string;
  phone: string;
  department: string;
  position: string;
  region: string;
  tags: string[];
  isDefaultReceiver: boolean;
}

interface BatchStaffManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (selectedStaff: SelectedStaff[]) => void;
  stats?: { tagStats: { name: string; count: number }[] }; // 统计数据，用于显示标签人数
}

export default function BatchStaffManager({ open, onOpenChange, onSave, stats }: BatchStaffManagerProps) {
  // 左侧：标签选择
  const [selectedTag, setSelectedTag] = useState<string>('全部');

  // 右侧：已选人员列表
  const [selectedStaffList, setSelectedStaffList] = useState<SelectedStaff[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 添加人员弹窗
  const [showAddDialog, setShowAddDialog] = useState(false);

  // 未保存更改确认
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);

  // 弹窗打开时，加载所有已选人员
  useEffect(() => {
    if (open) {
      loadAllTaggedStaff();
      setSelectedTag('全部');
      setCurrentPage(1);
      // 重置筛选条件
      setSearchQuery('');
      setRegionFilter('all');
      setDepartmentFilter('all');
      setStatusFilter('all');
    }
  }, [open]);

  // 当选择标签变化时，加载该标签的人员
  useEffect(() => {
    if (selectedTag) {
      if (selectedTag === '全部') {
        loadAllTaggedStaff();
      } else {
        loadTagStaff(selectedTag);
      }
      setCurrentPage(1);
      // 重置筛选条件
      setSearchQuery('');
      setRegionFilter('all');
      setDepartmentFilter('all');
      setStatusFilter('all');
    }
  }, [selectedTag]);

  // 加载所有已打标签的人员
  const loadAllTaggedStaff = async () => {
    try {
      // 使用大分页大小获取所有数据
      const response = await fetch('/api/staff-management?hasTags=true&pageSize=10000');
      const result = await response.json();

      if (result.success) {
        const staffList: SelectedStaff[] = result.data.map((staff: any) => ({
          id: staff.id,
          employee_no: staff.employee_no,
          name: staff.name,
          phone: staff.phone,
          department: staff.department || '',
          position: staff.position || '',
          region: staff.region,
          tags: staff.tags || [],
          isDefaultReceiver: staff.is_default_receiver || false,
        }));

        setSelectedStaffList(staffList);
      }
    } catch (error) {
      console.error('加载人员列表失败:', error);
    }
  };

  // 加载某个标签的人员
  const loadTagStaff = async (tagName: string) => {
    try {
      // 检查是否为父标签
      const childTags = getChildTags(tagName);
      const tagsToQuery = childTags.length > 0 ? childTags : [tagName];

      // 使用大分页大小获取所有数据
      const requests = tagsToQuery.map(tag =>
        fetch(`/api/staff-management?tag=${encodeURIComponent(tag)}&pageSize=10000`)
      );

      const responses = await Promise.all(requests);
      const results = await Promise.all(responses.map(r => r.json()));

      // 合并所有结果
      const staffMap = new Map<string, SelectedStaff>();
      results.forEach(result => {
        if (result.success) {
          result.data.forEach((staff: any) => {
            if (!staffMap.has(staff.id)) {
              staffMap.set(staff.id, {
                id: staff.id,
                employee_no: staff.employee_no,
                name: staff.name,
                phone: staff.phone,
                department: staff.department || '',
                position: staff.position || '',
                region: staff.region,
                tags: staff.tags || [],
                isDefaultReceiver: staff.is_default_receiver || false,
              });
            }
          });
        }
      });

      const staffList = Array.from(staffMap.values());
      setSelectedStaffList(staffList);
    } catch (error) {
      console.error('加载人员列表失败:', error);
    }
  };

  // 判断是否为末级节点（没有子节点）
  const isLeafNode = (tagName: string): boolean => {
    // "全部"不是末级节点
    if (tagName === '全部') return false;
    // 检查是否包含斜杠，包含斜杠的是二级标签，是末级节点
    if (tagName.includes('/')) return true;
    // "存量运营"有子节点，不是末级节点
    if (tagName === '存量运营') return false;
    // 其他一级标签（国际业务运营、家庭运营）都是末级节点
    return true;
  };

  // 获取标签的子标签列表（返回完整的标签名称）
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
    // "全部"不需要 ID
    if (tagName === '全部') return '';
    // 直接返回标签名称
    return tagName;
  };

  // 添加人员
  const handleAddStaff = (staff: StaffItem[]) => {
    // 调用 API 为选中的人员添加标签
    const tagName = extractTagId(selectedTag);
    addTagToStaff(staff.map(s => s.id), tagName);
  };

  // 为人员添加标签
  const addTagToStaff = async (staffIds: string[], tagName: string) => {
    try {
      // 这里需要调用 API 为多个人员添加标签
      // 暂时先重新加载列表
      await loadTagStaff(selectedTag === '全部' ? '' : selectedTag);
    } catch (error) {
      console.error('添加标签失败:', error);
    }
  };

  // 移除人员（从当前标签中移除）
  const removeStaffFromTag = async (staffId: string) => {
    try {
      const tagName = extractTagId(selectedTag);

      // 调用 API 移除标签
      await fetch(`/api/staff-management/${staffId}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagToRemove: tagName }),
      });

      // 重新加载列表
      if (selectedTag === '全部') {
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

      // 重新加载列表
      if (selectedTag === '全部') {
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
      // 搜索筛选（姓名/手机号）
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = staff.name.toLowerCase().includes(query);
        const phoneMatch = staff.phone.includes(query);
        if (!nameMatch && !phoneMatch) return false;
      }

      // 组织筛选
      if (regionFilter !== 'all') {
        const regionNames: Record<string, string> = {
          '乌鲁木齐': '中国移动新疆公司乌鲁木齐分公司',
          '克拉玛依': '中国移动新疆公司克拉玛依分公司',
          '吐鲁番': '中国移动新疆公司吐鲁番分公司',
          '哈密': '中国移动新疆公司哈密分公司',
          '昌吉': '中国移动新疆公司昌吉分公司',
          '阿克苏': '中国移动新疆公司阿克苏分公司',
          '喀什': '中国移动新疆公司喀什分公司',
          '伊犁': '中国移动新疆公司伊犁分公司',
        };

        const targetRegion = regionNames[regionFilter] || regionFilter;
        if (staff.region !== targetRegion) return false;
      }

      // 部门筛选
      if (departmentFilter !== 'all' && staff.department !== departmentFilter) {
        return false;
      }

      // 状态筛选
      if (statusFilter !== 'all') {
        if (statusFilter === 'default' && !staff.isDefaultReceiver) return false;
        if (statusFilter === 'normal' && staff.isDefaultReceiver) return false;
      }

      return true;
    });
  }, [selectedStaffList, searchQuery, regionFilter, departmentFilter, statusFilter]);

  // 获取筛选后的人员列表（分页）
  const paginatedStaffList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStaffList.slice(startIndex, endIndex);
  }, [filteredStaffList, currentPage, pageSize]);

  // 获取总页数
  const totalPages = Math.ceil(filteredStaffList.length / pageSize);

  // 保存
  const saveStaffPool = () => {
    if (onSave) {
      onSave(selectedStaffList);
    }
    onOpenChange(false);
  };

  // 关闭弹窗时检查是否有未保存的更改
  const handleClose = () => {
    onOpenChange(false);
  };

  // 不保存直接关闭
  const closeWithoutSaving = () => {
    setShowUnsavedChangesDialog(false);
    onOpenChange(false);
  };

  // 保存后关闭
  const closeWithSaving = () => {
    setShowUnsavedChangesDialog(false);
    saveStaffPool();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="w-[1400px] h-[700px] overflow-hidden flex flex-col"
          disableMaxWidth={true}
        >
          <DialogHeader>
            <DialogTitle>批量管理人员</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
            {/* 左侧：标签树 */}
            <div className="w-[300px] flex flex-col overflow-hidden border-r bg-gray-50">
              <div className="flex-1 overflow-y-auto p-4">
                <TagSelect
                  value={selectedTag ? [selectedTag] : []}
                  onChange={(value) => setSelectedTag(value[0] || '全部')}
                  singleSelect={true}
                  showCount={true}
                  includeAll={true}
                  externalTagCounts={stats?.tagStats?.reduce((acc: { [key: string]: number }, item: { name: string; count: number }) => {
                    acc[item.name] = item.count;
                    return acc;
                  }, {})}
                />
              </div>

              {/* 添加人员按钮 - 始终显示 */}
              <div className="p-4 border-t bg-white">
                <Button
                  className="w-full"
                  onClick={() => setShowAddDialog(true)}
                  disabled={!isLeafNode(selectedTag)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加人员
                  {!isLeafNode(selectedTag) && (
                    <span className="ml-2 text-xs text-gray-500">
                      （请选择具体标签）
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* 右侧：已选人员列表 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    已选人员 - {selectedTag || '全部'}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    共 {filteredStaffList.length} 人
                  </Badge>
                </div>

                {/* 搜索和筛选 */}
                <div className="flex gap-2 items-end flex-wrap">
                  {/* 搜索框 */}
                  <div className="flex-1 min-w-[200px] max-w-[300px]">
                    <Input
                      placeholder="搜索姓名或手机号..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-8"
                    />
                  </div>

                  {/* 组织筛选 */}
                  <Select
                    value={regionFilter}
                    onValueChange={(value) => {
                      setRegionFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="选择组织" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部组织</SelectItem>
                      <SelectItem value="乌鲁木齐">乌鲁木齐</SelectItem>
                      <SelectItem value="克拉玛依">克拉玛依</SelectItem>
                      <SelectItem value="吐鲁番">吐鲁番</SelectItem>
                      <SelectItem value="昌吉">昌吉</SelectItem>
                      <SelectItem value="哈密">哈密</SelectItem>
                      <SelectItem value="博州">博州</SelectItem>
                      <SelectItem value="克州">克州</SelectItem>
                      <SelectItem value="喀什">喀什</SelectItem>
                      <SelectItem value="和田">和田</SelectItem>
                      <SelectItem value="巴州">巴州</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 部门筛选 */}
                  <Select
                    value={departmentFilter}
                    onValueChange={(value) => {
                      setDepartmentFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="选择部门" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部部门</SelectItem>
                      <SelectItem value="市场部">市场部</SelectItem>
                      <SelectItem value="营销中心">营销中心</SelectItem>
                      <SelectItem value="销售部">销售部</SelectItem>
                      <SelectItem value="运营部">运营部</SelectItem>
                      <SelectItem value="客服部">客服部</SelectItem>
                      <SelectItem value="技术部">技术部</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 状态筛选 */}
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="default">默认接收人</SelectItem>
                      <SelectItem value="normal">普通</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            工号
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            姓名
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            手机号
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            部门
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            岗位
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            归属组织
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">
                            标签
                          </th>
                          <th className="px-4 py-3 text-center font-medium text-gray-700">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paginatedStaffList.map((staff) => (
                          <tr
                            key={staff.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              {staff.employee_no}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {staff.name}
                            </td>
                            <td className="px-4 py-3">
                              {staff.phone}
                            </td>
                            <td className="px-4 py-3">
                              {staff.department}
                            </td>
                            <td className="px-4 py-3">
                              {staff.position}
                            </td>
                            <td className="px-4 py-3">
                              {staff.region}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {staff.tags && staff.tags.length > 0 ? (
                                  staff.tags.map((tag, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    无标签
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant={
                                    staff.isDefaultReceiver ? 'default' : 'outline'
                                  }
                                  onClick={() => toggleDefaultReceiver(staff.id)}
                                  title={
                                    staff.isDefaultReceiver
                                      ? '取消默认接收人'
                                      : '设为默认接收人'
                                  }
                                  className="h-7 px-2 text-xs"
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      staff.isDefaultReceiver
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : ''
                                    }`}
                                  />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeStaffFromTag(staff.id)}
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <div className="flex items-center gap-1">
                        {(() => {
                          // 计算显示的页码范围
                          const maxPagesToShow = 5;
                          let startPage: number;
                          let endPage: number;

                          if (totalPages <= maxPagesToShow) {
                            // 总页数少于等于5，显示所有页码
                            startPage = 1;
                            endPage = totalPages;
                          } else {
                            // 总页数大于5，显示当前页周围的页码
                            startPage = Math.max(1, currentPage - 2);
                            endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                            // 如果起始页太小，向后调整
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
                              variant={
                                currentPage === pageNum ? 'default' : 'outline'
                              }
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
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

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button onClick={saveStaffPool}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加人员弹窗 */}
      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        tagId={extractTagId(selectedTag)}
        tagName={selectedTag}
        onAddStaff={handleAddStaff}
      />

      {/* 未保存更改确认对话框 */}
      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未保存的更改</AlertDialogTitle>
            <AlertDialogDescription>
              您有未保存的更改，是否要保存？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeWithoutSaving}>
              不保存
            </AlertDialogCancel>
            <AlertDialogAction onClick={closeWithSaving}>
              保存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
