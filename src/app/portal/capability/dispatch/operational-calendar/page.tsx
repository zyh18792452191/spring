'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CalendarView } from '@/components/operational-calendar/CalendarView';
import { TaskFormDialog } from '@/components/operational-calendar/TaskFormDialog';
import { TaskDetailDialog } from '@/components/operational-calendar/TaskDetailDialog';
import { TaskMaterialManagement } from '@/components/material-management/TaskMaterialManagement';
import { toast } from 'sonner';

interface OperationalTask {
  id: number;
  task_code: string;
  task_name: string;
  status: string;
  start_time: string;
  end_time: string;
  actual_end_time?: string | null; // 活动实际结束时间
  duration_days: number;
  province: string;
  form_template_id: number;
  form_template_name: string;
  form_data: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function OperationalCalendarPageContent() {
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [status, setStatus] = useState('all');
  const [province, setProvince] = useState('全国');

  // 省份列表
  const provinces = ['全疆', '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
  // 对话框状态
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false); // 下线弹窗
  const [showEditActualEndTimeDialog, setShowEditActualEndTimeDialog] = useState(false); // 调整实际结束时间弹窗
  const [editingTask, setEditingTask] = useState<OperationalTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null);
  const [offlineTask, setOfflineTask] = useState<OperationalTask | null>(null); // 下线的任务
  const [offlineActualEndTime, setOfflineActualEndTime] = useState(''); // 下线时的实际结束时间
  const [editActualEndTimeTask, setEditActualEndTimeTask] = useState<OperationalTask | null>(null); // 调整实际结束时间的任务
  const [editActualEndTimeValue, setEditActualEndTimeValue] = useState(''); // 编辑的实际结束时间

  // 加载任务列表
  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchKeyword) params.append('taskName', searchKeyword);
      if (createdBy) params.append('createdBy', createdBy);
      if (status !== 'all') params.append('status', status);
      if (province !== 'all') params.append('province', province);

      const response = await fetch(`/api/operational-tasks?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTasks(result.data);
        setTotal(result.total);
      } else {
        toast.error(result.error || '加载任务列表失败');
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      toast.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [page, pageSize, searchKeyword, createdBy, status, province]);

  // 隐藏全局滚动条（仅运营日历页面）
  useEffect(() => {
    // 保存原始 overflow 样式
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalHtmlOverflowY = document.documentElement.style.overflowY;
    const originalBodyOverflow = document.body.style.overflow;

    // 找到 Layout 的 main 元素
    const mainElement = document.querySelector('main');

    // 保存 main 元素的原始 overflow
    const originalMainOverflow = mainElement ? (mainElement as HTMLElement).style.overflow : '';

    // 设置隐藏滚动条
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflow = 'hidden';
    if (mainElement) {
      (mainElement as HTMLElement).style.overflow = 'hidden';
    }

    // 组件卸载时恢复原始样式
    return () => {
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.documentElement.style.overflowY = originalHtmlOverflowY;
      document.body.style.overflow = originalBodyOverflow;
      if (mainElement) {
        (mainElement as HTMLElement).style.overflow = originalMainOverflow;
      }
    };
  }, []);

  // 搜索
  const handleSearch = () => {
    setPage(1);
    loadTasks();
  };

  // 重置
  const handleReset = () => {
    setSearchKeyword('');
    setCreatedBy('');
    setStatus('all');
    setProvince('全国');
    setPage(1);
    loadTasks();
  };

  // 导出列表数据
  const handleExport = () => {
    // 准备表头
    const headers = [
      '任务ID',
      '任务名称',
      '区域',
      '开始时间',
      '结束时间',
      '实际结束时间',
      '活动时长（天）',
      '创建人',
      '创建时间',
      '状态'
    ];

    // 准备数据行
    const rows = tasks.map(task => [
      task.task_code,
      task.task_name,
      task.province,
      new Date(task.start_time).toLocaleDateString('zh-CN'),
      new Date(task.end_time).toLocaleDateString('zh-CN'),
      task.actual_end_time ? new Date(task.actual_end_time).toLocaleDateString('zh-CN') : '-',
      task.duration_days,
      task.created_by,
      new Date(task.created_at).toLocaleString('zh-CN'),
      getStatusText(task.status)
    ]);

    // 组合数据
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 创建 Blob 并下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `运营任务列表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('导出成功');
  };

  // 打开新增对话框
  const handleAdd = () => {
    setEditingTask(null);
    setShowFormDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (task: OperationalTask) => {
    setEditingTask(task);
    setShowFormDialog(true);
  };

  // 查看详情
  const handleDetail = (task: OperationalTask) => {
    setSelectedTask(task);
    setShowDetailDialog(true);
  };

  // 删除任务
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该任务吗？')) return;

    try {
      const response = await fetch(`/api/operational-tasks/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('删除成功');
        loadTasks();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  };

  // 下线任务
  const handleOffline = (task: OperationalTask) => {
    setOfflineTask(task);
    setOfflineActualEndTime('');
    setShowOfflineDialog(true);
  };

  // 确认下线
  const handleConfirmOffline = async () => {
    if (!offlineTask) return;

    try {
      // 将日期格式（YYYY-MM-DD）转换为 ISO 格式的时间戳
      const actualEndTime = offlineActualEndTime 
        ? new Date(offlineActualEndTime + 'T23:59:59').toISOString()
        : null;

      const response = await fetch(`/api/operational-tasks/${offlineTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'offline',
          actual_end_time: actualEndTime,
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success('下线成功');
        setShowOfflineDialog(false);
        loadTasks();
      } else {
        toast.error(result.error || '下线失败');
      }
    } catch (error) {
      console.error('下线任务失败:', error);
      toast.error('下线任务失败');
    }
  };

  // 打开调整实际结束时间弹窗
  const handleEditActualEndTime = (task: OperationalTask) => {
    setEditActualEndTimeTask(task);
    setEditActualEndTimeValue(task.actual_end_time ? task.actual_end_time.slice(0, 16) : '');
    setShowEditActualEndTimeDialog(true);
  };

  // 确认调整实际结束时间
  const handleConfirmEditActualEndTime = async () => {
    if (!editActualEndTimeTask) return;

    try {
      const response = await fetch(`/api/operational-tasks/${editActualEndTimeTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actual_end_time: editActualEndTimeValue ? new Date(editActualEndTimeValue).toISOString() : null,
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success('修改成功');
        setShowEditActualEndTimeDialog(false);
        loadTasks();
      } else {
        toast.error(result.error || '修改失败');
      }
    } catch (error) {
      console.error('修改实际结束时间失败:', error);
      toast.error('修改失败');
    }
  };

  // 素材管理
  const handleMaterial = (task: OperationalTask) => {
    setSelectedTask(task);
    setShowMaterialDialog(true);
  };

  // 表单保存成功回调
  const handleFormSave = () => {
    setShowFormDialog(false);
    setEditingTask(null);
    loadTasks();
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started':
        return '未开始';
      case 'in_progress':
        return '进行中';
      case 'finished':
        return '已结束';
      case 'offline':
        return '已下线';
      default:
        return status;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'default'; // 灰色
      case 'in_progress':
        return 'default'; // 绿色（需要自定义样式）
      case 'finished':
        return 'secondary'; // 橙色
      case 'offline':
        return 'outline';
      default:
        return 'default';
    }
  };

  // 根据状态获取操作按钮
  const getActionButtons = (task: OperationalTask) => {
    const buttons = [];

    // 详情按钮（所有状态都有）
    buttons.push(
      <Button
        key="detail"
        variant="ghost"
        size="sm"
        onClick={() => handleDetail(task)}
      >
        详情
      </Button>
    );

    // 根据状态添加其他按钮
    switch (task.status) {
      case 'not_started':
        buttons.push(
          <Button key="edit" variant="ghost" size="sm" onClick={() => handleEdit(task)}>
            编辑
          </Button>,
          <Button key="material" variant="ghost" size="sm" onClick={() => handleMaterial(task)}>
            素材管理
          </Button>,
          <Button key="delete" variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
            删除
          </Button>
        );
        break;
      case 'in_progress':
        buttons.push(
          <Button key="offline" variant="ghost" size="sm" onClick={() => handleOffline(task)}>
            下线
          </Button>
        );
        break;
      case 'finished':
        buttons.push(
          <Button key="editActualEndTime" variant="ghost" size="sm" onClick={() => handleEditActualEndTime(task)}>
            调整实际结束时间
          </Button>,
          <Button key="delete" variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
            删除
          </Button>
        );
        break;
      case 'offline':
        buttons.push(
          <Button key="delete" variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
            删除
          </Button>
        );
        break;
    }

    return buttons;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* 页面标题 */}
      <div className="shrink-0 bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">运营日历</h1>
        </div>
      </div>

      {/* 视图切换和操作 */}
      <div className="shrink-0 bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list">列表视图</TabsTrigger>
              <TabsTrigger value="calendar">日历视图</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6 min-h-0">
        {/* 列表视图 */}
        {view === 'list' && (
          <div className="space-y-6 min-h-full">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">运营任务名称</label>
                    <Input
                      placeholder="请输入运营任务名称"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div className="w-[180px]">
                    <label className="text-sm font-medium mb-1 block">创建人</label>
                    <Input
                      placeholder="请输入创建人"
                      value={createdBy}
                      onChange={(e) => setCreatedBy(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div className="w-[180px]">
                    <label className="text-sm font-medium mb-1 block">状态</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="not_started">未开始</SelectItem>
                        <SelectItem value="in_progress">进行中</SelectItem>
                        <SelectItem value="finished">已结束</SelectItem>
                        <SelectItem value="offline">已下线</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-[180px]">
                    <label className="text-sm font-medium mb-1 block">区域</label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    搜索
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    重置
                  </Button>
                  {view === 'list' && (
                    <Button variant="outline" onClick={handleExport} className="ml-2">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      导出
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 任务列表 */}
            <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  加载中...
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">任务ID</TableHead>
                        <TableHead>运营任务名称</TableHead>
                        <TableHead className="w-[120px]">区域</TableHead>
                        <TableHead className="w-[200px]">开始-结束时间</TableHead>
                        <TableHead className="w-[200px]">活动实际结束时间</TableHead>
                        <TableHead className="w-[120px]">创建人</TableHead>
                        <TableHead className="w-[180px]">创建时间</TableHead>
                        <TableHead className="w-[100px]">状态</TableHead>
                        <TableHead className="w-[300px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="text-xs">{task.task_code}</TableCell>
                            <TableCell className="font-medium">{task.task_name}</TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline">{task.province}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(task.start_time).toLocaleDateString('zh-CN')} 至{' '}
                              {new Date(task.end_time).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-xs text-gray-600">
                              {task.actual_end_time ? new Date(task.actual_end_time).toLocaleDateString('zh-CN') : '-'}
                            </TableCell>
                            <TableCell>{task.created_by}</TableCell>
                            <TableCell className="text-xs text-gray-600">
                              {new Date(task.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(task.status)}>
                                {getStatusText(task.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {getActionButtons(task)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* 分页 */}
              {total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    共 {total} 项数据，第 {page} / {Math.ceil(total / pageSize)} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10条/页</SelectItem>
                        <SelectItem value="20">20条/页</SelectItem>
                        <SelectItem value="50">50条/页</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

      {/* 日历视图 */}
      {view === 'calendar' && (
        <CalendarView
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOffline={handleOffline}
        />
      )}

      {/* 新增/编辑任务对话框 */}
      <TaskFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        task={editingTask}
        onSave={handleFormSave}
      />

      {/* 任务详情对话框 */}
      <TaskDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        task={selectedTask}
      />

      {/* 素材管理对话框 */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>运营任务-素材管理</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="overflow-auto flex-1">
              <TaskMaterialManagement
                taskId={selectedTask.id}
                onCancel={() => setShowMaterialDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 下线任务弹窗 */}
      <Dialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>下线任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">任务名称</label>
              <div className="text-sm text-gray-600">{offlineTask?.task_name}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">活动实际结束时间 <span className="text-red-500">*</span></label>
              <Input
                type="date"
                value={offlineActualEndTime}
                onChange={(e) => setOfflineActualEndTime(e.target.value)}
                placeholder="请选择实际结束时间"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfflineDialog(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmOffline}>
              确认下线
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 调整实际结束时间弹窗 */}
      <Dialog open={showEditActualEndTimeDialog} onOpenChange={setShowEditActualEndTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整实际结束时间</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">任务名称</label>
              <div className="text-sm text-gray-600">{editActualEndTimeTask?.task_name}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">当前实际结束时间</label>
              <div className="text-sm text-gray-600">
                {editActualEndTimeTask?.actual_end_time ? new Date(editActualEndTimeTask.actual_end_time).toLocaleDateString('zh-CN') : '未设置'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">新的实际结束时间 <span className="text-red-500">*</span></label>
              <Input
                type="datetime-local"
                value={editActualEndTimeValue}
                onChange={(e) => setEditActualEndTimeValue(e.target.value)}
                placeholder="请选择实际结束时间"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditActualEndTimeDialog(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmEditActualEndTime}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default function OperationalCalendarPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <OperationalCalendarPageContent />
    </Suspense>
  );
}
