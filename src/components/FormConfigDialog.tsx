'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Edit, Eye, ChevronUp, ChevronDown, Save, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// 字段类型定义
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiSelect' | 'textarea' | 'file';

// 字段配置接口
export interface FormFieldConfig {
  id: string;
  name: string;
  code: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  description?: string;
}

// 模拟当前用户信息（实际应该从后端获取）
export const getCurrentUser = () => {
  // 服务器端渲染时返回默认用户
  if (typeof window === 'undefined') {
    return {
      id: 'user-001',
      name: '张三',
      department: '存量运营中心',
    };
  }

  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    return JSON.parse(userStr);
  }
  // 默认用户（用于演示）
  const defaultUser = {
    id: 'user-001',
    name: '张三',
    department: '存量运营中心',
  };
  localStorage.setItem('currentUser', JSON.stringify(defaultUser));
  return defaultUser;
};

// 表单模板配置接口
export interface FormTemplateConfig {
  id: string;
  name: string;
  type: 'indicator' | 'customer' | 'strategy' | 'custom';
  description?: string;
  fields: FormFieldConfig[];
  isDefault?: boolean;
  
  // 新增字段
  creatorId: string;           // 创建者ID
  creatorName: string;         // 创建者姓名
  department?: string;         // 所属部门
  isSystem?: boolean;          // 是否系统模板
  createdAt: string;           // 创建时间（ISO格式）
  updatedAt?: string;          // 更新时间
}

interface FormConfigDialogProps {
  open: boolean;
  onClose: () => void;
  template?: FormTemplateConfig;
  onSave: (template: FormTemplateConfig) => void;
}

const FormConfigDialog: React.FC<FormConfigDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);

  // 预设字段（快速添加）- 必须在 fields useState 之前定义
  const presetFields: Array<Omit<FormFieldConfig, 'id' | 'order'>> = [
    // 客群相关
    { name: '客群ID', code: 'group_id', type: 'text', required: true, placeholder: '请输入客群ID' },
    { name: '客群名称', code: 'group_name', type: 'text', required: true, placeholder: '请输入客群名称' },
    { name: '目标客户数', code: 'target_customer_count', type: 'number', required: true, placeholder: '请输入目标客户数', defaultValue: 0, validation: { min: 0 } },
    { name: '触达客户数', code: 'reach_customer_count', type: 'number', required: true, placeholder: '请输入触达客户数', defaultValue: 0, validation: { min: 0 } },
    { name: '营销成功客户数', code: 'success_customer_count', type: 'number', required: true, placeholder: '请输入营销成功客户数', defaultValue: 0, validation: { min: 0 } },

    // 活动相关
    { name: '活动编码', code: 'activity_code', type: 'text', required: false, placeholder: '请输入活动编码' },
    { name: '活动名称', code: 'activity_name', type: 'text', required: false, placeholder: '请输入活动名称' },

    // 策略相关
    { name: '策略ID', code: 'strategy_id', type: 'text', required: false, placeholder: '请输入策略ID' },
    { name: '策略名称', code: 'strategy_name', type: 'text', required: false, placeholder: '请输入策略名称' },

    // 执行相关
    { name: '执行渠道', code: 'execution_channel', type: 'select', required: false, placeholder: '请选择执行渠道', options: [{ value: '短信', label: '短信' }, { value: '彩信', label: '彩信' }, { value: '外呼', label: '外呼' }, { value: 'APP推送', label: 'APP推送' }] },

    // 产品相关
    { name: '产品编码', code: 'product_code', type: 'text', required: false, placeholder: '请输入产品编码' },
    { name: '产品名称', code: 'product_name', type: 'text', required: false, placeholder: '请输入产品名称' },
    { name: '业务订购量', code: 'business_order_count', type: 'number', required: false, placeholder: '请输入业务订购量', defaultValue: 0, validation: { min: 0 } },

    // 其他
    { name: '说明备注', code: 'description', type: 'textarea', required: false, placeholder: '请输入说明备注' },
  ];

  // 模板基础信息
  const [templateInfo, setTemplateInfo] = useState({
    name: template?.name || '客群调度标准模板',
    type: (template?.type || 'customer') as FormTemplateConfig['type'],
    description: template?.description || '用于客群营销工单的标准回单模板',
    isDefault: template?.isDefault || false,
  });

  // 字段列表 - 默认使用预设字段
  const [fields, setFields] = useState<FormFieldConfig[]>(() => {
    if (template?.fields && template.fields.length > 0) {
      return template.fields;
    }
    // 默认加载所有预设字段
    return presetFields.map((field, index) => ({
      ...field,
      id: `field_${Date.now()}_${index}`,
      order: index,
    }));
  });

  // 字段编辑表单
  const [fieldForm, setFieldForm] = useState<FormFieldConfig>({
    id: '',
    name: '',
    code: '',
    type: 'text',
    required: true,
    defaultValue: '',
    placeholder: '',
    options: [],
    validation: {},
    order: fields.length,
    description: '',
  });

  // 下拉选项编辑
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  // 字段类型映射
  const fieldTypeMap: Record<FieldType, string> = {
    text: '文本框',
    number: '数字框',
    date: '日期',
    select: '下拉框',
    multiSelect: '多选框',
    textarea: '多行文本',
    file: '文件上传',
  };

  // 打开字段编辑器（添加新字段）
  const handleAddField = () => {
    setEditingField(null);
    setFieldForm({
      id: `field_${Date.now()}`,
      name: '',
      code: '',
      type: 'text',
      required: true,
      defaultValue: '',
      placeholder: '',
      options: [],
      validation: {},
      order: fields.length,
      description: '',
    });
    setShowFieldEditor(true);
  };

  // 打开字段编辑器（编辑现有字段）
  const handleEditField = (field: FormFieldConfig) => {
    setEditingField(field);
    setFieldForm({ ...field });
    setShowFieldEditor(true);
  };

  // 删除字段
  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  // 保存字段
  const handleSaveField = () => {
    if (editingField) {
      // 编辑模式
      setFields(prev => prev.map(f => f.id === editingField.id ? { ...fieldForm } : f));
    } else {
      // 添加模式
      setFields(prev => [...prev, { ...fieldForm, order: prev.length }]);
    }
    setShowFieldEditor(false);
    setEditingField(null);
  };

  // 添加下拉选项
  const handleAddOption = () => {
    if (newOption.value && newOption.label) {
      setFieldForm(prev => ({
        ...prev,
        options: [...(prev.options || []), { ...newOption }],
      }));
      setNewOption({ value: '', label: '' });
    }
  };

  // 删除下拉选项
  const handleDeleteOption = (index: number) => {
    setFieldForm(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  // 上移字段
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setFields(newFields.map((f, i) => ({ ...f, order: i })));
    }
  };

  // 下移字段
  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields.map((f, i) => ({ ...f, order: i })));
    }
  };

  // 保存模板
  const handleSaveTemplate = () => {
    const user = getCurrentUser();
    const templateData: FormTemplateConfig = {
      id: template?.id || `template_${Date.now()}`,
      name: templateInfo.name,
      type: templateInfo.type,
      description: templateInfo.description,
      fields: fields,
      isDefault: templateInfo.isDefault,
      
      // 自动填充创建者信息
      creatorId: template?.creatorId || user.id,
      creatorName: template?.creatorName || user.name,
      department: template?.department || user.department,
      isSystem: template?.isSystem || false,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(templateData);
  };

  // 从预设字段快速添加
  const handleAddPresetField = (preset: Omit<FormFieldConfig, 'id' | 'order'>) => {
    const newField: FormFieldConfig = {
      ...preset,
      id: `field_${Date.now()}`,
      order: fields.length,
    };
    setFields(prev => [...prev, newField]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[800px] !max-h-[650px] !w-[800px] !h-[650px] overflow-hidden flex flex-col z-[100]">
        <DialogTitle className="text-lg font-semibold">
          工单回单配置
        </DialogTitle>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'config' | 'preview')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">字段配置</TabsTrigger>
            <TabsTrigger value="preview">预览效果</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6">
              {/* 基础信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">基础信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">模板名称 *</Label>
                    <Input
                      value={templateInfo.name}
                      onChange={(e) => setTemplateInfo({ ...templateInfo, name: e.target.value })}
                      placeholder="请输入模板名称"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">模板类型 *</Label>
                    <Select value={templateInfo.type} onValueChange={(v) => setTemplateInfo({ ...templateInfo, type: v as FormTemplateConfig['type'] })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indicator">指标调度</SelectItem>
                        <SelectItem value="customer">客群调度</SelectItem>
                        <SelectItem value="strategy">策略调度</SelectItem>
                        <SelectItem value="custom">自定义</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">模板说明</Label>
                  <Textarea
                    value={templateInfo.description}
                    onChange={(e) => setTemplateInfo({ ...templateInfo, description: e.target.value })}
                    placeholder="请输入模板说明"
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={templateInfo.isDefault}
                    onCheckedChange={(checked) => setTemplateInfo({ ...templateInfo, isDefault: checked })}
                  />
                  <Label className="text-sm">设为默认模板</Label>
                </div>
              </div>

              {/* 字段配置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">字段配置</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPresetSelector(true)} className="text-[#3B82F6] border-[#3B82F6]">
                      <Plus className="w-4 h-4 mr-1" />
                      添加预设字段
                    </Button>
                    <Button size="sm" onClick={handleAddField} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                      <Plus className="w-4 h-4 mr-1" />
                      添加字段
                    </Button>
                  </div>
                </div>

                {/* 字段列表 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-12">操作</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">字段名称</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">字段编码</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">类型</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-16">必填</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-32">编辑</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                            暂无字段，请点击"添加字段"或"添加预设字段"
                          </td>
                        </tr>
                      ) : (
                        fields.map((field, index) => (
                          <tr key={field.id} className="border-t border-gray-100">
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMoveUp(index)}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveDown(index)}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  disabled={index === fields.length - 1}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{field.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{field.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{fieldTypeMap[field.type]}</td>
                            <td className="px-4 py-3">
                              {field.required ? (
                                <span className="text-red-500 text-xs">必填</span>
                              ) : (
                                <span className="text-gray-400 text-xs">选填</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditField(field)}
                                  className="text-gray-400 hover:text-[#3B82F6]"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteField(field.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">回单表单预览</h3>

              {/* 预览表单 */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h4 className="text-base font-semibold text-gray-900 mb-4">{templateInfo.name}</h4>

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    暂无字段，请先配置字段
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.id}>
                        <Label className="text-sm">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {/* 文本框 */}
                        {field.type === 'text' && (
                          <Input
                            placeholder={field.placeholder || `请输入${field.name}`}
                            defaultValue={field.defaultValue as string}
                            className="mt-2"
                          />
                        )}

                        {/* 数字框 */}
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            placeholder={field.placeholder || `请输入${field.name}`}
                            defaultValue={field.defaultValue as number}
                            min={field.validation?.min}
                            max={field.validation?.max}
                            className="mt-2"
                          />
                        )}

                        {/* 日期 */}
                        {field.type === 'date' && (
                          <Input
                            type="date"
                            placeholder={field.placeholder || `请选择${field.name}`}
                            className="mt-2"
                          />
                        )}

                        {/* 下拉框 */}
                        {field.type === 'select' && (
                          <Select>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder={field.placeholder || `请选择${field.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* 多选框 */}
                        {field.type === 'multiSelect' && (
                          <div className="mt-2 space-y-2">
                            {field.options?.map((option) => (
                              <div key={option.value} className="flex items-center gap-2">
                                <Checkbox id={option.value} />
                                <label htmlFor={option.value} className="text-sm text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 多行文本 */}
                        {field.type === 'textarea' && (
                          <Textarea
                            placeholder={field.placeholder || `请输入${field.name}`}
                            defaultValue={field.defaultValue as string}
                            className="mt-2"
                            rows={3}
                          />
                        )}

                        {/* 文件上传 */}
                        {field.type === 'file' && (
                          <div className="mt-2">
                            <Input
                              type="file"
                              className="cursor-pointer"
                            />
                          </div>
                        )}

                        {field.description && (
                          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="border-gray-300">
            取消
          </Button>
          <Button onClick={handleSaveTemplate} className="bg-[#3B82F6] hover:bg-[#2563EB]">
            保存配置
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>

      {/* 预设字段选择器 */}
      {showPresetSelector && (
        <Dialog open={showPresetSelector} onOpenChange={setShowPresetSelector}>
          <DialogContent className="!max-w-[800px] !max-h-[650px] !w-[800px] !h-[650px] overflow-hidden flex flex-col z-[101]">
            <DialogTitle className="text-lg font-semibold">
              添加预设字段
            </DialogTitle>

            <div className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-2 gap-3">
                {presetFields.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      handleAddPresetField(preset);
                      setShowPresetSelector(false);
                    }}
                    className="text-left justify-start h-auto py-3 px-4"
                  >
                    <div>
                      <div className="font-medium text-sm">{preset.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {fieldTypeMap[preset.type]} {preset.required ? '· 必填' : ''}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setShowPresetSelector(false)} className="border-gray-300">
                取消
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 字段编辑弹窗 - 自定义字段 */}
      {showFieldEditor && (
        <Dialog open={showFieldEditor} onOpenChange={setShowFieldEditor}>
          <DialogContent className="!max-w-[800px] !max-h-[650px] !w-[800px] !h-[650px] overflow-hidden flex flex-col z-[101]">
            <DialogTitle className="text-lg font-semibold">
              {editingField ? '编辑字段' : '添加字段'}
            </DialogTitle>

            <div className="flex-1 overflow-auto mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">字段名称 *</Label>
                  <Input
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                    placeholder="请输入字段名称"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">字段编码 *</Label>
                  <Input
                    value={fieldForm.code}
                    onChange={(e) => setFieldForm({ ...fieldForm, code: e.target.value })}
                    placeholder="请输入字段编码（英文）"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">字段类型 *</Label>
                  <Select value={fieldForm.type} onValueChange={(v) => setFieldForm({ ...fieldForm, type: v as FieldType })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文本框</SelectItem>
                      <SelectItem value="number">数字框</SelectItem>
                      <SelectItem value="date">日期</SelectItem>
                      <SelectItem value="select">下拉框</SelectItem>
                      <SelectItem value="multiSelect">多选框</SelectItem>
                      <SelectItem value="textarea">多行文本</SelectItem>
                      <SelectItem value="file">文件上传</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={fieldForm.required}
                    onCheckedChange={(checked) => setFieldForm({ ...fieldForm, required: checked })}
                  />
                  <Label className="text-sm">必填</Label>
                </div>
              </div>

              <div>
                <Label className="text-sm">默认值</Label>
                <Input
                  value={fieldForm.defaultValue?.toString() || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, defaultValue: e.target.value })}
                  placeholder="请输入默认值"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm">占位提示</Label>
                <Input
                  value={fieldForm.placeholder || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  placeholder="请输入占位提示"
                  className="mt-2"
                />
              </div>

              {/* 下拉选项配置（仅下拉框和多选框） */}
              {(fieldForm.type === 'select' || fieldForm.type === 'multiSelect') && (
                <div>
                  <Label className="text-sm">下拉选项</Label>
                  <div className="mt-2 space-y-2">
                    {fieldForm.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...fieldForm.options!];
                            newOptions[index].value = e.target.value;
                            setFieldForm({ ...fieldForm, options: newOptions });
                          }}
                          placeholder="选项值"
                          className="flex-1"
                        />
                        <Input
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...fieldForm.options!];
                            newOptions[index].label = e.target.value;
                            setFieldForm({ ...fieldForm, options: newOptions });
                          }}
                          placeholder="选项标签"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOption(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newOption.value}
                        onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                        placeholder="选项值"
                        className="flex-1"
                      />
                      <Input
                        value={newOption.label}
                        onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                        placeholder="选项标签"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="text-[#3B82F6] border-[#3B82F6]"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 验证规则（仅数字框） */}
              {fieldForm.type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">最小值</Label>
                    <Input
                      type="number"
                      value={fieldForm.validation?.min || ''}
                      onChange={(e) => setFieldForm({
                        ...fieldForm,
                        validation: { ...fieldForm.validation, min: parseFloat(e.target.value) || undefined }
                      })}
                      placeholder="请输入最小值"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">最大值</Label>
                    <Input
                      type="number"
                      value={fieldForm.validation?.max || ''}
                      onChange={(e) => setFieldForm({
                        ...fieldForm,
                        validation: { ...fieldForm.validation, max: parseFloat(e.target.value) || undefined }
                      })}
                      placeholder="请输入最大值"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm">字段说明</Label>
                <Textarea
                  value={fieldForm.description || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                  placeholder="请输入字段说明"
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setShowFieldEditor(false)} className="border-gray-300">
                取消
              </Button>
              <Button onClick={handleSaveField} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                {editingField ? '保存' : '添加'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default FormConfigDialog;
