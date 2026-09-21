'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, RefreshCw, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface CalendarData {
  tasks: OperationalTask[];
  statistics: {
    totalCount: number;
    inProgressCount: number;
    finishedCount: number;
  };
}

interface CalendarViewProps {
  onDetail?: (task: OperationalTask) => void;
  onEdit?: (task: OperationalTask) => void;
  onDelete?: (taskId: number) => void;
  onOffline?: (task: OperationalTask) => void;
}

export function CalendarView({
  onDetail,
  onEdit,
  onDelete,
  onOffline,
}: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [recentTasks, setRecentTasks] = useState<OperationalTask[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentTotal, setRecentTotal] = useState(0);
  const [recentPage, setRecentPage] = useState(1);
  const [recentPageSize, setRecentPageSize] = useState(10);

  // 搜索筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [province, setProvince] = useState('all');

  // 弹窗状态
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<OperationalTask[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogPage, setDialogPage] = useState(1);
  const [dialogPageSize] = useState(10);

  // 任务筛选
  const [taskSearchKeyword, setTaskSearchKeyword] = useState('');
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null);
  const [showTaskSearchDropdown, setShowTaskSearchDropdown] = useState(false);

  // 视图切换（日历/月历）
  const [viewMode, setViewMode] = useState<'calendar' | 'year'>('calendar');

  // 月份详情弹窗
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [selectedMonthTasks, setSelectedMonthTasks] = useState<OperationalTask[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthDialogPage, setMonthDialogPage] = useState(1);
  const [monthDialogPageSize] = useState(10);

  // 省份列表
  const provinces = ['全部','全疆','乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'];;

  // 加载日历数据
  const loadCalendarData = async () => {
    try {
      const params = new URLSearchParams({
        year: currentYear.toString(),
      });

      // 只有在日历视图下才传 month 参数
      if (viewMode === 'calendar') {
        params.append('month', currentMonth.toString());
      }

      if (province !== 'all') {
        params.append('province', province);
      }

      const response = await fetch(
        `/api/operational-tasks/calendar?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setCalendarData(result.data);
      }
    } catch (error) {
      console.error('加载日历数据失败:', error);
    }
  };

  // 加载近期活动列表
  const loadRecentTasks = async () => {
    setRecentLoading(true);
    try {
      const params = new URLSearchParams({
        page: recentPage.toString(),
        pageSize: recentPageSize.toString(),
      });

      // 根据视图模式设置时间范围
      params.append('days', viewMode === 'calendar' ? '7' : '30');

      if (searchKeyword) params.append('taskName', searchKeyword);
      if (status !== 'all') params.append('status', status);
      if (province !== 'all') params.append('province', province);

      const response = await fetch(`/api/operational-tasks/recent?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setRecentTasks(result.data);
        setRecentTotal(result.total);
      }
    } catch (error) {
      console.error('加载近期活动失败:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentYear, currentMonth, province, viewMode]);

  useEffect(() => {
    loadRecentTasks();
  }, [recentPage, recentPageSize, searchKeyword, status, province, viewMode]);

  // 点击外部关闭任务搜索下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTaskSearchDropdown && !target.closest('.task-search-dropdown')) {
        setShowTaskSearchDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTaskSearchDropdown]);

  // 获取当月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 获取当月第一天是星期几（0-6，0是周日）
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // 获取某一天的任务
  const getTasksForDay = (day: number) => {
    if (!calendarData) return [];
    // 创建当天的日期对象（使用字符串格式避免时区问题）
    const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 如果有选中的任务，只显示该任务
    if (selectedTask) {
      const startDateStr = selectedTask.start_time.split('T')[0];
      const endDateStr = selectedTask.end_time.split('T')[0];
      // 检查选中的任务是否在当天
      if (startDateStr <= dayStr && endDateStr >= dayStr) {
        return [selectedTask];
      } else {
        return [];
      }
    }

    // 没有选中任务，返回所有在当天的任务
    return calendarData.tasks.filter((task) => {
      const startDateStr = task.start_time.split('T')[0];
      const endDateStr = task.end_time.split('T')[0];
      // 任务开始日期 <= 当天日期 且 任务结束日期 >= 当天日期
      return startDateStr <= dayStr && endDateStr >= dayStr;
    });
  };

  // 切换月份
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 获取某年某月的任务数量
  const getTasksForMonth = (month: number) => {
    if (!calendarData) return { count: 0, tasks: [] };
    
    const monthTasks = calendarData.tasks.filter((task) => {
      const taskMonth = new Date(task.start_time).getMonth() + 1;
      const taskYear = new Date(task.start_time).getFullYear();
      return taskYear === currentYear && taskMonth === month;
    });

    return { count: monthTasks.length, tasks: monthTasks };
  };

  // 判断月份是否在选中任务的时间跨度内
  const isMonthInSelectedTaskRange = (month: number) => {
    if (!selectedTask) return null;
    
    const taskStartMonth = new Date(selectedTask.start_time).getMonth() + 1;
    const taskStartYear = new Date(selectedTask.start_time).getFullYear();
    const taskEndMonth = new Date(selectedTask.end_time).getMonth() + 1;
    const taskEndYear = new Date(selectedTask.end_time).getFullYear();

    if (taskStartYear !== currentYear && taskEndYear !== currentYear) {
      return null;
    }

    // 任务开始年小于当前年，或任务结束年大于当前年
    if (taskStartYear < currentYear && taskEndYear > currentYear) {
      return 'all'; // 整年都在任务范围内
    }

    // 任务在当前年开始
    if (taskStartYear === currentYear && taskEndYear > currentYear) {
      if (month === taskStartMonth) {
        return 'start';
      } else if (month > taskStartMonth) {
        return 'middle';
      }
      return null;
    }

    // 任务在当前年结束
    if (taskStartYear < currentYear && taskEndYear === currentYear) {
      if (month === taskEndMonth) {
        return 'end';
      } else if (month < taskEndMonth) {
        return 'middle';
      }
      return null;
    }

    // 任务完全在当前年
    if (taskStartYear === currentYear && taskEndYear === currentYear) {
      if (taskStartMonth === taskEndMonth) {
        return month === taskStartMonth ? 'both' : null;
      } else if (month === taskStartMonth) {
        return 'start';
      } else if (month === taskEndMonth) {
        return 'end';
      } else if (month > taskStartMonth && month < taskEndMonth) {
        return 'middle';
      }
      return null;
    }

    return null;
  };

  // 打开月份详情弹窗
  const handleShowMonthTasks = (month: number) => {
    const { tasks } = getTasksForMonth(month);
    setSelectedMonthTasks(tasks);
    setSelectedMonth(month);
    setMonthDialogPage(1);
    setMonthDialogOpen(true);
  };

  // 跳转到今天
  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // 跳转到本月（月历视图使用）
  const handleThisYear = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
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
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-green-100 text-green-700';
      case 'finished':
        return 'bg-orange-100 text-orange-700';
      case 'offline':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // 获取操作按钮
  const getActionButtons = (task: OperationalTask) => {
    return (
      <div className="flex gap-1 flex-wrap">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onDetail?.(task)}>
          详情
        </Button>
        {task.status === 'not_started' && (
          <>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEdit?.(task)}>
              编辑
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onDelete?.(task.id)}>
              删除
            </Button>
          </>
        )}
        {task.status === 'in_progress' && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onOffline?.(task)}>
            下线
          </Button>
        )}
        {task.status === 'finished' && (
          <>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEdit?.(task)}>
              编辑
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onDelete?.(task.id)}>
              删除
            </Button>
          </>
        )}
      </div>
    );
  };

  // 打开当天活动弹窗
  const handleShowMoreTasks = (day: number) => {
    const tasks = getTasksForDay(day);
    console.log(`点击 ${day} 号，查询到 ${tasks.length} 条任务`);
    setSelectedDayTasks(tasks);
    setSelectedDay(day);
    setDialogPage(1); // 重置分页
    setDayDialogOpen(true);
  };

  // 判断日期是否在选中任务的时间跨度内
  const isDayInSelectedTaskRange = (day: number) => {
    if (!selectedTask) return null;
    const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const startDateStr = selectedTask.start_time.split('T')[0];
    const endDateStr = selectedTask.end_time.split('T')[0];

    if (dayStr < startDateStr || dayStr > endDateStr) {
      return null;
    }

    // 判断是否是开始日期、结束日期还是中间日期
    if (dayStr === startDateStr && dayStr === endDateStr) {
      return 'both';
    } else if (dayStr === startDateStr) {
      return 'start';
    } else if (dayStr === endDateStr) {
      return 'end';
    } else {
      return 'middle';
    }
  };

  // 生成日历网格
  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const weeks: React.ReactNode[] = [];
    let currentWeek: React.ReactNode[] = [];
    let dayCount = 1;
    const maxTasksPerDay = 3;

    // 获取今天的日期
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    // 第一周（可能包含上月的天数）
    for (let i = 0; i < 7; i++) {
      if (i < firstDay) {
        currentWeek.push(
          <div key={`empty-${i}`} className="min-h-[100px] bg-gray-50 border" />
        );
      } else if (dayCount <= daysInMonth) {
        const tasks = getTasksForDay(dayCount);
        const displayTasks = tasks.slice(0, maxTasksPerDay);
        const remainingCount = tasks.length - maxTasksPerDay;
        const currentDay = dayCount; // 捕获当前日期
        const taskRangePosition = isDayInSelectedTaskRange(dayCount); // 判断是否在选中任务的时间跨度内
        const isToday = currentDay === todayDay && currentMonth === todayMonth && currentYear === todayYear;

        // 根据任务跨度位置应用不同的样式
        let cellClassName = "min-h-[100px] border p-2 hover:bg-blue-50 cursor-pointer";
        if (isToday && !taskRangePosition) {
          cellClassName += " bg-blue-100 border-blue-500 border-2";
        }
        if (taskRangePosition) {
          if (taskRangePosition === 'both') {
            cellClassName += " bg-blue-50 border-l-4 border-r-4 border-blue-500";
          } else if (taskRangePosition === 'start') {
            cellClassName += " bg-blue-50 border-l-4 border-blue-500";
          } else if (taskRangePosition === 'end') {
            cellClassName += " bg-blue-50 border-r-4 border-blue-500";
          } else {
            cellClassName += " bg-blue-50";
          }
        }

        currentWeek.push(
          <div
            key={dayCount}
            className={cellClassName}
            onClick={() => handleShowMoreTasks(currentDay)}
            title={selectedTask && taskRangePosition ? `${selectedTask.task_name} (${selectedTask.task_code})` : undefined}
          >
            <div className="text-sm font-medium mb-1">
              {currentDay}
              {isToday && <Badge variant="default" className="ml-1 text-[10px] px-1 py-0">今天</Badge>}
            </div>
            <div className="space-y-1">
              {displayTasks.map((task) => (
                <div
                  key={task.id}
                  className="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 truncate"
                  title={`${task.task_name}\n时间: ${new Date(task.start_time).toLocaleDateString('zh-CN')} - ${new Date(task.end_time).toLocaleDateString('zh-CN')}\n实际结束: ${task.actual_end_time && new Date(task.actual_end_time).toLocaleDateString('zh-CN') || '-'}\n活动时长: ${task.duration_days}天`}
                >
                  {task.task_name}
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="text-xs text-blue-600 px-1 py-0.5 cursor-pointer hover:bg-blue-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMoreTasks(currentDay);
                  }}
                >
                  更多{remainingCount}条
                </div>
              )}
            </div>
          </div>
        );
        dayCount++;
      }
    }
    weeks.push(<div key="week-0" className="grid grid-cols-7 border-t">{currentWeek}</div>);

    // 剩余的周
    let weekNum = 1;
    while (dayCount <= daysInMonth) {
      currentWeek = [];
      for (let i = 0; i < 7; i++) {
        if (dayCount <= daysInMonth) {
          const tasks = getTasksForDay(dayCount);
          const displayTasks = tasks.slice(0, maxTasksPerDay);
          const remainingCount = tasks.length - maxTasksPerDay;
          const currentDay = dayCount; // 捕获当前日期
          const taskRangePosition = isDayInSelectedTaskRange(dayCount); // 判断是否在选中任务的时间跨度内
          const isToday = currentDay === todayDay && currentMonth === todayMonth && currentYear === todayYear;

          // 根据任务跨度位置应用不同的样式
          let cellClassName = "min-h-[100px] border p-2 hover:bg-blue-50 cursor-pointer";
          if (isToday && !taskRangePosition) {
            cellClassName += " bg-blue-100 border-blue-500 border-2";
          }
          if (taskRangePosition) {
            if (taskRangePosition === 'both') {
              cellClassName += " bg-blue-50 border-l-4 border-r-4 border-blue-500";
            } else if (taskRangePosition === 'start') {
              cellClassName += " bg-blue-50 border-l-4 border-blue-500";
            } else if (taskRangePosition === 'end') {
              cellClassName += " bg-blue-50 border-r-4 border-blue-500";
            } else {
              cellClassName += " bg-blue-50";
            }
          }

          currentWeek.push(
            <div
              key={dayCount}
              className={cellClassName}
              onClick={() => handleShowMoreTasks(currentDay)}
              title={selectedTask && taskRangePosition ? `${selectedTask.task_name} (${selectedTask.task_code})` : undefined}
            >
              <div className="text-sm font-medium mb-1">
                {currentDay}
                {isToday && <Badge variant="default" className="ml-1 text-[10px] px-1 py-0">今天</Badge>}
              </div>
              <div className="space-y-1">
                {displayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 truncate"
                    title={`${task.task_name}\n时间: ${new Date(task.start_time).toLocaleDateString('zh-CN')} - ${new Date(task.end_time).toLocaleDateString('zh-CN')}\n实际结束: ${task.actual_end_time && new Date(task.actual_end_time).toLocaleDateString('zh-CN') || '-'}\n活动时长: ${task.duration_days}天`}
                  >
                    {task.task_name}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div
                    className="text-xs text-blue-600 px-1 py-0.5 cursor-pointer hover:bg-blue-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowMoreTasks(currentDay);
                    }}
                  >
                    更多{remainingCount}条
                  </div>
                )}
              </div>
            </div>
          );
          dayCount++;
        } else {
          currentWeek.push(
            <div key={`empty-week-${weekNum}-${i}`} className="min-h-[100px] bg-gray-50 border" />
          );
        }
      }
      weeks.push(
        <div key={`week-${weekNum}`} className="grid grid-cols-7 border-t">
          {currentWeek}
        </div>
      );
      weekNum++;
    }

    return weeks;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左侧日历 */}
      <div className="flex-1 h-[900px]">
        <Card className="h-full flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select
                  value={currentYear.toString()}
                  onValueChange={(value) => setCurrentYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i} value={(2020 + i).toString()}>
                        {2020 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {viewMode === 'calendar' ? (
                  /* 日历视图控制 */
                  <>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-1">
                        {[...Array(12)].map((_, i) => (
                          <Button
                            key={i}
                            variant={i + 1 === currentMonth ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCurrentMonth(i + 1)}
                          >
                            {i + 1}月
                          </Button>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                      今天
                    </Button>
                  </>
                ) : (
                  /* 月历视图控制 */
                  <Button variant="outline" size="sm" onClick={handleThisYear}>
                    本月
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  日历
                </Button>
                <Button
                  variant={viewMode === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('year')}
                >
                  月历
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* 活动统计 */}
          <CardContent className="flex-1">
            {calendarData && (
              <div className="flex flex-col min-h-0">
                {/* 筛选条件 */}
                <div className="flex items-center gap-6 mb-4 shrink-0 flex-wrap">
                  {/* 省份筛选 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">所属地州：</span>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((prov) => (
                          <SelectItem key={prov} value={prov === '全部' ? 'all' : prov}>
                            {prov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 任务筛选 */}
                  <div className="flex items-center gap-2 relative task-search-dropdown">
                    <span className="text-sm font-medium">任务筛选：</span>
                    <div className="relative w-[250px]">
                      <Input
                        placeholder="搜索任务名称..."
                        value={taskSearchKeyword}
                        onChange={(e) => setTaskSearchKeyword(e.target.value)}
                        onFocus={() => setShowTaskSearchDropdown(true)}
                        className="pr-8"
                      />
                      {taskSearchKeyword && (
                        <button
                          onClick={() => {
                            setTaskSearchKeyword('');
                            setSelectedTask(null);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {/* 任务搜索下拉框 */}
                      {showTaskSearchDropdown && taskSearchKeyword && (
                        <div className="task-search-dropdown absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
                          {calendarData.tasks
                            .filter(task =>
                              task.task_name.toLowerCase().includes(taskSearchKeyword.toLowerCase())
                            )
                            .slice(0, 10)
                            .map(task => (
                              <div
                                key={task.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskSearchKeyword(task.task_name);
                                  setShowTaskSearchDropdown(false);
                                }}
                              >
                                <div className="font-medium">{task.task_name}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(task.start_time).toLocaleDateString('zh-CN')} - {new Date(task.end_time).toLocaleDateString('zh-CN')}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    {selectedTask && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTask(null)}
                        className="h-8 text-xs"
                      >
                        清除筛选
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{selectedTask ? '当前任务' : '活动概括'}</span>
                  <div className="flex-1" />
                  {selectedTask ? (
                    <>
                      <div className="text-sm">
                        任务名称 <span className="font-bold text-blue-600">{selectedTask.task_name}</span>
                      </div>
                      <div className="text-sm">
                        状态 <span className="font-bold text-green-600">{getStatusText(selectedTask.status)}</span>
                      </div>
                      <div className="text-sm">
                        时间 <span className="font-bold text-orange-600">
                          {new Date(selectedTask.start_time).toLocaleDateString('zh-CN')} - {new Date(selectedTask.end_time).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm">
                        {viewMode === 'calendar' ? '本月' : '本年'}活动数 <span className="font-bold text-blue-600">{calendarData.statistics.totalCount}</span> 个
                      </div>
                      <div className="text-sm">
                        {viewMode === 'calendar' ? '本月' : '本年'}进行中活动 <span className="font-bold text-green-600">{calendarData.statistics.inProgressCount}</span> 个
                      </div>
                      <div className="text-sm">
                        {viewMode === 'calendar' ? '本月' : '本年'}已结束活动 <span className="font-bold text-orange-600">{calendarData.statistics.finishedCount}</span> 个
                      </div>
                    </>
                  )}
                </div>

                {/* 日历网格或年视图 */}
                {viewMode === 'calendar' ? (
                  <div className="border rounded-lg overflow-hidden shrink-0">
                    {/* 星期表头 */}
                    <div className="grid grid-cols-7 bg-gray-50 shrink-0">
                      {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium border">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* 日历主体 */}
                    <div className="overflow-hidden">
                      {generateCalendarGrid()}
                    </div>
                  </div>
                ) : (
                  /* 年视图 */
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(12)].map((_, monthIndex) => {
                      const month = monthIndex + 1;
                      const { count, tasks } = getTasksForMonth(month);
                      const isSelected = selectedMonth === month;
                      const isInRange = isMonthInSelectedTaskRange(month);
                      const displayTasks = tasks.slice(0, 3); // 最多显示3个任务
                      const isCurrentMonth = month === new Date().getMonth() + 1 && currentYear === new Date().getFullYear();

                      return (
                        <div
                          key={month}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedTask && !isInRange ? 'opacity-30' : ''
                          } ${selectedTask && isInRange ? 'bg-yellow-50 border-yellow-300' : ''} ${
                            isCurrentMonth && !selectedTask ? 'border-blue-500 border-2' : ''
                          }`}
                          onClick={() => handleShowMonthTasks(month)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-lg">
                              {month}月
                              {isCurrentMonth && (
                                <Badge variant="default" className="ml-2 text-xs">
                                  本月
                                </Badge>
                              )}
                            </div>
                            {count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {count}个活动
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {selectedTask && isInRange ? (
                              <div className="text-sm text-gray-600">
                                ✓ 包含选中任务
                              </div>
                            ) : count > 0 ? (
                              displayTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 truncate"
                                  title={`${task.task_name}\n时间: ${new Date(task.start_time).toLocaleDateString('zh-CN')} - ${new Date(task.end_time).toLocaleDateString('zh-CN')}\n实际结束: ${task.actual_end_time && new Date(task.actual_end_time).toLocaleDateString('zh-CN') || '-'}\n活动时长: ${task.duration_days}天`}
                                >
                                  {task.task_name}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-400">
                                暂无活动
                              </div>
                            )}
                            {count > 3 && (
                              <div className="text-xs text-blue-600">
                                还有 {count - 3} 个活动...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 右侧近期活动 */}
      <div className="w-full lg:w-[400px] h-[900px]">
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {viewMode === 'calendar' ? '近一周活动' : '近一月活动'}
            </CardTitle>
            {selectedTask && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskSearchKeyword('');
                }}
                className="h-7 text-xs"
              >
                清除筛选
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
            {/* 搜索筛选 */}
            <div className="space-y-2 mb-3 shrink-0">
              <Input
                placeholder="请输入运营任务名称"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="h-9"
              />
              <div className="flex gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="not_started">未开始</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="finished">已结束</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => { setSearchKeyword(''); setStatus('all'); }} className="h-9 px-2">
                  重置
                </Button>
                <Button onClick={loadRecentTasks} className="h-9 px-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 活动列表 */}
            <div className="overflow-y-auto space-y-2 flex-1" style={{ minHeight: 0 }}>
              {recentLoading ? (
                <div className="text-center py-4 text-gray-500 text-sm">加载中...</div>
              ) : recentTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">暂无数据</div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-md bg-white transition-colors cursor-pointer ${
                      selectedTask?.id === task.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-blue-200 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskSearchKeyword(task.task_name);
                    }}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1 truncate">{task.task_name}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(task.start_time).toLocaleDateString('zh-CN')} ~ {new Date(task.end_time).toLocaleDateString('zh-CN')}
                          </div>
                          {task.actual_end_time && (
                            <div className="text-xs text-gray-500">
                              实际结束: {new Date(task.actual_end_time).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            <Badge variant="outline" className="text-[10px]">{task.province}</Badge>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(task.status)} shrink-0 text-xs`}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-1">
                        {getActionButtons(task)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 分页 */}
            {recentTotal > 0 && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t shrink-0">
                <div className="text-xs text-gray-600">
                  共 {recentTotal} 条
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecentPage(recentPage - 1)}
                    disabled={recentPage === 1}
                    className="h-7 px-2"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-xs px-1">{recentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecentPage(recentPage + 1)}
                    disabled={recentPage >= Math.ceil(recentTotal / recentPageSize)}
                    className="h-7 px-2"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 当天活动详情弹窗 */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent
          className="w-[800px] h-[600px] overflow-hidden flex flex-col"
          style={{ width: '800px', height: '600px', maxWidth: 'none', maxHeight: 'none' }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {currentYear}年{currentMonth}月{selectedDay}日活动列表
              <span className="text-sm text-gray-500 ml-2">
                共 {selectedDayTasks.length} 条活动
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* 活动列表 */}
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无活动</div>
            ) : (
              selectedDayTasks
                .slice((dialogPage - 1) * dialogPageSize, dialogPage * dialogPageSize)
                .map((task) => (
                <div
                  key={task.id}
                  className="border border-blue-200 rounded-md bg-white hover:bg-blue-50 transition-colors p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-2">{task.task_name}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">活动编码：</span>
                          {task.task_code}
                        </div>
                        <div>
                          <span className="font-medium">状态：</span>
                          <Badge className={`${getStatusColor(task.status)} ml-2`}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">开始时间：</span>
                          {new Date(task.start_time).toLocaleString('zh-CN')}
                        </div>
                        <div>
                          <span className="font-medium">结束时间：</span>
                          {new Date(task.end_time).toLocaleString('zh-CN')}
                        </div>
                        <div>
                          <span className="font-medium">实际结束时间：</span>
                          {task.actual_end_time ? new Date(task.actual_end_time).toLocaleString('zh-CN') : '-'}
                        </div>
                        <div>
                          <span className="font-medium">活动时长：</span>
                          {task.duration_days}天
                        </div>
                        <div>
                          <span className="font-medium">所属地州：</span>
                          <Badge variant="outline">{task.province}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">创建人：</span>
                          {task.created_by}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    {getActionButtons(task)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页控件 */}
          {selectedDayTasks.length > 0 && (
            <div className="shrink-0 border-t pt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {selectedDayTasks.length} 条数据，第 {dialogPage} / {Math.ceil(selectedDayTasks.length / dialogPageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogPage(dialogPage - 1)}
                  disabled={dialogPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogPage(dialogPage + 1)}
                  disabled={dialogPage >= Math.ceil(selectedDayTasks.length / dialogPageSize)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 月份详情弹窗 */}
      <Dialog open={monthDialogOpen} onOpenChange={setMonthDialogOpen}>
        <DialogContent
          className="w-[800px] h-[600px] overflow-hidden flex flex-col"
          style={{ width: '800px', height: '600px', maxWidth: 'none', maxHeight: 'none' }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {currentYear}年{selectedMonth}月活动列表
              <span className="text-sm text-gray-500 ml-2">
                共 {selectedMonthTasks.length} 条活动
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* 活动列表 */}
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
            {selectedMonthTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无活动</div>
            ) : (
              selectedMonthTasks
                .slice((monthDialogPage - 1) * monthDialogPageSize, monthDialogPage * monthDialogPageSize)
                .map((task) => (
                <div
                  key={task.id}
                  className="border border-blue-200 rounded-md bg-white hover:bg-blue-50 transition-colors p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-2">{task.task_name}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">活动编码：</span>
                          {task.task_code}
                        </div>
                        <div>
                          <span className="font-medium">状态：</span>
                          <Badge className={`${getStatusColor(task.status)} ml-2`}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">开始时间：</span>
                          {new Date(task.start_time).toLocaleString('zh-CN')}
                        </div>
                        <div>
                          <span className="font-medium">结束时间：</span>
                          {new Date(task.end_time).toLocaleString('zh-CN')}
                        </div>
                        <div>
                          <span className="font-medium">实际结束时间：</span>
                          {task.actual_end_time ? new Date(task.actual_end_time).toLocaleString('zh-CN') : '-'}
                        </div>
                        <div>
                          <span className="font-medium">活动时长：</span>
                          {task.duration_days}天
                        </div>
                        <div>
                          <span className="font-medium">所属地州：</span>
                          <Badge variant="outline">{task.province}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">创建人：</span>
                          {task.created_by}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    {getActionButtons(task)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页控件 */}
          {selectedMonthTasks.length > 0 && (
            <div className="shrink-0 border-t pt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {selectedMonthTasks.length} 条数据，第 {monthDialogPage} / {Math.ceil(selectedMonthTasks.length / monthDialogPageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthDialogPage(monthDialogPage - 1)}
                  disabled={monthDialogPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthDialogPage(monthDialogPage + 1)}
                  disabled={monthDialogPage >= Math.ceil(selectedMonthTasks.length / monthDialogPageSize)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
