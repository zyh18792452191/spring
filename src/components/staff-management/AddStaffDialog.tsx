'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { OrganizationTreeSelect } from './OrganizationTreeSelect';

export interface StaffItem {
  id: string;
  employee_no: string;
  name: string;
  phone: string;
  department: string;
  position: string;
  region: string;
  tags: string[];
  status: string;
}

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagId: string;
  tagName: string;
  onAddStaff: (staff: StaffItem[]) => void;
}

export default function AddStaffDialog({
  open,
  onOpenChange,
  tagId,
  tagName,
  onAddStaff,
}: AddStaffDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all'); // 合并后的组织筛选
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availableStaff, setAvailableStaff] = useState<StaffItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // 加载人员列表
  useEffect(() => {
    if (open) {
      loadStaffList();
    }
  }, [open, tagId, currentPage, searchQuery, organizationFilter, statusFilter]);

  const loadStaffList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tagId) {
        params.append('excludeTag', tagId);
      }
      params.append('page', currentPage.toString());
      params.append('pageSize', pageSize.toString());

      if (searchQuery) {
        params.append('name', searchQuery);
      }

      // 解析组织筛选参数
      if (organizationFilter && organizationFilter !== 'all') {
        const [region, department] = organizationFilter.split('-');
        params.append('region', region);
        if (department) {
          params.append('department', department);
        }
      }

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/staff-management?${params}`);
      const result = await response.json();

      if (result.success) {
        setAvailableStaff(result.data || []);
        setTotalCount(result.total || 0);
      }
    } catch (error) {
      console.error('加载人员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换选中状态
  const toggleSelect = (staffId: string) => {
    setSelectedStaff(prev => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedStaff.size === availableStaff.length) {
      setSelectedStaff(new Set());
    } else {
      setSelectedStaff(new Set(availableStaff.map(s => s.id)));
    }
  };

  // 确认添加
  const handleAdd = () => {
    const selectedItems = availableStaff.filter(s => selectedStaff.has(s.id));
    onAddStaff(selectedItems);
    onOpenChange(false);
    // 重置状态
    setSelectedStaff(new Set());
    setSearchQuery('');
    setCurrentPage(1);
    setOrganizationFilter('all');
    setStatusFilter('all');
  };

  // 取消
  const handleCancel = () => {
    onOpenChange(false);
    setSelectedStaff(new Set());
    setSearchQuery('');
    setCurrentPage(1);
    setOrganizationFilter('all');
    setStatusFilter('all');
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1400px] max-h-[85vh] flex flex-col" disableMaxWidth={true}>
        <DialogHeader>
          <DialogTitle>添加人员到标签：{tagName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden gap-4">
          {/* 搜索和筛选 */}
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[280px] max-w-[400px] relative">
              <Label className="text-xs text-gray-600 mb-1 block">搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索姓名或手机号..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-[280px]">
              <Label className="text-xs text-gray-600 mb-1 block">组织</Label>
              <OrganizationTreeSelect
                value={organizationFilter}
                onChange={(value) => {
                  setOrganizationFilter(value);
                  setCurrentPage(1);
                }}
                placeholder="全部组织"
                showAllOption={true}
              />
            </div>
            <div className="w-[110px]">
              <Label className="text-xs text-gray-600 mb-1 block">状态</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="inactive">离职</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              disabled={availableStaff.length === 0}
              className="mb-0 h-[36px]"
            >
              {selectedStaff.size === availableStaff.length ? '取消全选' : '全选'}
            </Button>
          </div>

          {/* 人员列表 */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                加载中...
              </div>
            ) : availableStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <UserPlus className="h-12 w-12 text-gray-300" />
                <p>未找到可添加的人员</p>
              </div>
            ) : (
              <div className="divide-y">
                {availableStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                      selectedStaff.has(staff.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleSelect(staff.id)}
                  >
                    {/* 复选框 */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedStaff.has(staff.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedStaff.has(staff.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* 人员信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{staff.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {staff.employee_no}
                        </Badge>
                        <Badge
                          variant={staff.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {staff.status === 'active' ? '在职' : '离职'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{staff.phone}</span>
                        <span className="text-gray-400">|</span>
                        <span>{staff.region}</span>
                        {staff.department && (
                          <>
                            <span className="text-gray-400">/</span>
                            <span>{staff.department}</span>
                          </>
                        )}
                        <span className="text-gray-400">|</span>
                        <span>{staff.position}</span>
                      </div>

                      {/* 已打标签 */}
                      {staff.tags && staff.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <TagIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            已打标签: {staff.tags.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {totalCount} 人，第 {currentPage} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    // 计算显示的页码范围
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + 4);
                    
                    // 调整起始页，确保显示5个页码（如果总页数足够）
                    if (endPage - startPage < 4 && totalPages > 5) {
                      startPage = Math.max(1, endPage - 4);
                    }
                    
                    const pageNumbers: number[] = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(i);
                    }
                    
                    // 去重
                    const uniquePages = Array.from(new Set(pageNumbers));
                    
                    return uniquePages.map(pageNum => (
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            已选择 <span className="font-medium text-blue-600">{selectedStaff.size}</span> 人
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleAdd} disabled={selectedStaff.size === 0}>
              确认添加
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
