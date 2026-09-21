'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DynamicFormRenderer } from './DynamicFormRenderer';

interface OperationalTask {
  id?: number;
  task_code?: string;
  task_name?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  actual_end_time?: string | null; // 活动实际结束时间
  duration_days?: number;
  province?: string;
  form_template_id?: number;
  form_template_name?: string;
  form_data?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface FormTemplate {
  id: number;
  template_code: string;
  template_name: string;
  description?: string;
  form_config: string;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: OperationalTask | null;
  onSave: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: TaskFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    taskName: '',
    startTime: '',
    endTime: '',
    actualEndTime: '',
    province: '全国',
    formTemplateId: null as number | null,
    formTemplateName: '',
    dynamicFormData: {} as Record<string, any>,
  });

  // 省份列表
  const provinces = ['全疆','乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'];;

  // 加载表单模板
  const loadFormTemplates = async () => {
    try {
      const response = await fetch('/api/form-templates');
      const result = await response.json();
      if (result.success) {
        setFormTemplates(result.data);
      }
    } catch (error) {
      console.error('加载表单模板失败:', error);
    }
  };

  useEffect(() => {
    loadFormTemplates();
  }, []);

  // 编辑模式：填充表单
  useEffect(() => {
    if (task && task.id) {
      const parsedFormData = task.form_data ? JSON.parse(task.form_data) : {};
      setFormData({
        taskName: task.task_name || '',
        startTime: task.start_time ? task.start_time.slice(0, 16) : '',
        endTime: task.end_time ? task.end_time.slice(0, 16) : '',
        actualEndTime: task.actual_end_time ? task.actual_end_time.slice(0, 16) : '',
        province: (task as any).province || '全国',
        formTemplateId: task.form_template_id || null,
        formTemplateName: task.form_template_name || '',
        dynamicFormData: parsedFormData,
      });
    } else {
      // 新增模式：重置表单
      setFormData({
        taskName: '',
        startTime: '',
        endTime: '',
        actualEndTime: '',
        province: '全国',
        formTemplateId: null,
        formTemplateName: '',
        dynamicFormData: {},
      });
    }
  }, [task, open]);

  // 选择表单模板
  const handleFormTemplateChange = (templateId: string) => {
    const id = parseInt(templateId);
    const template = formTemplates.find(t => t.id === id);
    if (template) {
      setFormData({
        ...formData,
        formTemplateId: id,
        formTemplateName: template.template_name,
        dynamicFormData: {},
      });
    }
  };

  // 验证表单
  const validateForm = () => {
    if (!formData.taskName.trim()) {
      toast.error('请输入运营任务名称');
      return false;
    }
    if (!formData.startTime) {
      toast.error('请选择开始时间');
      return false;
    }
    if (!formData.endTime) {
      toast.error('请选择结束时间');
      return false;
    }
    if (!formData.formTemplateId) {
      toast.error('请选择表单');
      return false;
    }

    return true;
  };

  // 保存
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = {
        taskName: formData.taskName,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        actualEndTime: formData.actualEndTime ? new Date(formData.actualEndTime).toISOString() : null,
        province: formData.province,
        formTemplateId: formData.formTemplateId,
        formTemplateName: formData.formTemplateName,
        formData: formData.dynamicFormData,
        createdBy: '集团市场运营人员',
      };

      const url = task?.id
        ? `/api/operational-tasks/${task.id}`
        : '/api/operational-tasks';
      const method = task?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(task?.id ? '更新成功' : '新增成功');
        onSave();
      } else {
        toast.error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task?.id ? '编辑运营任务' : '新增运营任务'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基础信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                运营任务名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="请输入运营任务名称"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  开始时间 <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  结束时间 <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  实际结束时间
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.actualEndTime}
                  onChange={(e) => setFormData({ ...formData, actualEndTime: e.target.value })}
                  placeholder="活动实际下线时填写"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                所属地州 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(value) => setFormData({ ...formData, province: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择地州" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                选择表单 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.formTemplateId?.toString() || ''}
                onValueChange={handleFormTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择表单" />
                </SelectTrigger>
                <SelectContent>
                  {formTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 动态表单渲染 */}
          {formData.formTemplateId && (
            <DynamicFormRenderer
              templateId={formData.formTemplateId}
              value={formData.dynamicFormData}
              onChange={(value) => setFormData({ ...formData, dynamicFormData: value })}
            />
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
