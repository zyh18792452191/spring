'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  maxLength?: number;
  rows?: number;
  min?: number;
  max?: number;
}

interface DynamicFormRendererProps {
  templateId: number | null;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  readonly?: boolean;
}

export function DynamicFormRenderer({
  templateId,
  value,
  onChange,
  readonly = false,
}: DynamicFormRendererProps) {
  const [formConfig, setFormConfig] = useState<FormField[]>([]);

  // 加载表单配置
  useEffect(() => {
    if (!templateId) return;

    const loadFormConfig = async () => {
      try {
        const response = await fetch('/api/form-templates');
        const result = await response.json();
        if (result.success) {
          const template = result.data.find((t: any) => t.id === templateId);
          if (template) {
            const config = JSON.parse(template.form_config);
            setFormConfig(config.fields || []);
          }
        }
      } catch (error) {
        console.error('加载表单配置失败:', error);
      }
    };

    loadFormConfig();
  }, [templateId]);

  // 渲染表单字段
  const renderField = (field: FormField) => {
    const fieldValue = value[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              placeholder={field.placeholder || '请输入'}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              maxLength={field.maxLength}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
            {field.maxLength && (
              <div className="text-xs text-gray-500 text-right">
                {fieldValue.length}/{field.maxLength}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder || '请输入'}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              maxLength={field.maxLength}
              rows={field.rows || 4}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
            {field.maxLength && (
              <div className="text-xs text-gray-500 text-right">
                {fieldValue.length}/{field.maxLength}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <select
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readonly ? 'bg-gray-50' : ''}`}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              disabled={readonly}
            >
              <option value="">{field.placeholder || '请选择'}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={fieldValue}
              onValueChange={(v) => !readonly && onChange({ ...value, [field.id]: v })}
              disabled={readonly}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} disabled={readonly} />
                  <Label htmlFor={`${field.id}-${option}`} className={`cursor-pointer ${readonly ? 'text-gray-600' : ''}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(fieldValue || []).includes(option)}
                    onCheckedChange={(checked) => {
                      if (!readonly) {
                        const currentValues = fieldValue || [];
                        if (checked) {
                          onChange({ ...value, [field.id]: [...currentValues, option] });
                        } else {
                          onChange({
                            ...value,
                            [field.id]: currentValues.filter((v: string) => v !== option),
                          });
                        }
                      }
                    }}
                    disabled={readonly}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className={`cursor-pointer ${readonly ? 'text-gray-600' : ''}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              placeholder={field.placeholder || '请输入'}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: parseFloat(e.target.value) })}
              min={field.min}
              max={field.max}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="date"
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
          </div>
        );

      case 'datetime':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="datetime-local"
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
          </div>
        );

      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="email"
              placeholder={field.placeholder || '请输入邮箱'}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="tel"
              placeholder={field.placeholder || '请输入手机号'}
              value={fieldValue}
              onChange={(e) => !readonly && onChange({ ...value, [field.id]: e.target.value })}
              disabled={readonly}
              className={readonly ? 'bg-gray-50' : ''}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!templateId) {
    return null;
  }

  if (formConfig.length === 0) {
    return <div className="text-center py-4 text-gray-500">加载表单配置中...</div>;
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-medium">表单信息</h3>
      <div className="grid grid-cols-2 gap-6">
        {formConfig.map((field) => (
          <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}
