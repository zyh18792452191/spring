'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DynamicFormRenderer } from './DynamicFormRenderer';

interface OperationalTask {
  id?: number;
  task_code?: string;
  task_name?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  duration_days?: number;
  province?: string;
  form_template_id?: number;
  form_template_name?: string;
  form_data?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: OperationalTask | null;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // 获取并解析表单数据
  useEffect(() => {
    if (task?.form_data) {
      try {
        setFormData(JSON.parse(task.form_data));
      } catch {
        setFormData({});
      }
    } else {
      setFormData({});
    }
  }, [task, open]);

  const handleGenerateCase = () => {
    toast.success('案例生成成功');
    onOpenChange(false);
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>运营任务详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基础信息 - 只读展示 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                运营任务名称 <span className="text-red-500">*</span>
              </label>
              <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
                {task.task_name || '-'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                开始结束时间 <span className="text-red-500">*</span>
              </label>
              <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
                {task.start_time && task.end_time
                  ? `${new Date(task.start_time).toLocaleString('zh-CN')} 至 ${new Date(task.end_time).toLocaleString('zh-CN')}`
                  : '-'}
              </div>
            </div>
          </div>

          {/* 动态表单 - 只读模式 */}
          {task.form_template_id && (
            <DynamicFormRenderer
              templateId={task.form_template_id}
              value={formData}
              onChange={() => {}} // 只读模式，不允许修改
              readonly={true}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleGenerateCase}
          >
            生成案例
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
