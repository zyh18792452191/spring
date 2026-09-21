'use client';

import { useState } from 'react';
import { FilterConfig, FilterControlType, FilterOptionSource } from '../data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, Plus, Trash2, Edit2, MapPin } from 'lucide-react';

const CONTROL_TYPE_OPTIONS: Array<{ value: FilterControlType; label: string }> = [
  { value: 'select', label: '下拉单选' },
  { value: 'multiSelect', label: '下拉多选' },
  { value: 'dateRange', label: '日期范围' },
  { value: 'date', label: '单个日期' },
  { value: 'cascader', label: '级联选择' },
  { value: 'text', label: '文本输入' },
];

const OPTION_SOURCE_OPTIONS: Array<{ value: FilterOptionSource; label: string }> = [
  { value: 'static', label: '静态配置' },
  { value: 'system', label: '系统内置' },
  { value: 'dict', label: '数据字典' },
];

interface FilterConditionEditorProps {
  filterConfig: FilterConfig[];
  onChange: (config: FilterConfig[]) => void;
}

/** 单个筛选条件编辑行 */
function FilterConditionRow({
  config,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
}: {
  config: FilterConfig;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const typeLabel = CONTROL_TYPE_OPTIONS.find(t => t.value === config.type)?.label || config.type;
  const sourceLabel = OPTION_SOURCE_OPTIONS.find(s => s.value === config.optionSource)?.label || config.optionSource;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-background rounded border border-border hover:border-primary/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          {config.required && <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded">必填</span>}
          {config.type === 'cascader' && config.cascaderSource === 'region' && (
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              区域
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          ID: {config.id} · {typeLabel} · {sourceLabel}
          {config.type === 'select' && config.staticOptions && ` · ${config.staticOptions.length}个选项`}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} disabled={isFirst}>
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} disabled={isLast}>
          <ArrowDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/** 筛选条件编辑对话框 */
function FilterEditDialog({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (config: FilterConfig) => void;
  initialData?: FilterConfig;
}) {
  const [id, setId] = useState(initialData?.id || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [type, setType] = useState<FilterControlType>(initialData?.type || 'select');
  const [required, setRequired] = useState(initialData?.required || false);
  const [defaultValue, setDefaultValue] = useState(initialData?.defaultValue || '');
  const [optionSource, setOptionSource] = useState<FilterOptionSource>(initialData?.optionSource || 'static');
  const [staticOptions, setStaticOptions] = useState<Array<{ value: string; label: string }>>(
    initialData?.staticOptions || []
  );
  const [dictCode, setDictCode] = useState(initialData?.dictCode || '');
  const [cascaderSource, setCascaderSource] = useState<'region' | undefined>(initialData?.cascaderSource || 'region');
  const [newOptValue, setNewOptValue] = useState('');
  const [newOptLabel, setNewOptLabel] = useState('');

  const handleSave = () => {
    if (!id || !label) return;
    onSave({
      id,
      label,
      type,
      required,
      defaultValue,
      optionSource,
      staticOptions: optionSource === 'static' ? staticOptions : undefined,
      dictCode: optionSource === 'dict' ? dictCode : undefined,
      cascaderSource: type === 'cascader' ? cascaderSource : undefined,
      order: initialData?.order || 0,
    });
    onClose();
  };

  const addOption = () => {
    if (newOptValue && newOptLabel) {
      setStaticOptions([...staticOptions, { value: newOptValue, label: newOptLabel }]);
      setNewOptValue('');
      setNewOptLabel('');
    }
  };

  const removeOption = (idx: number) => {
    setStaticOptions(staticOptions.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑筛选条件' : '添加筛选条件'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">条件ID</Label>
              <Input className="h-8 text-xs mt-1" value={id} onChange={e => setId(e.target.value.replace(/\s/g, '_'))} placeholder="如 execution_mode" disabled={!!initialData} />
            </div>
            <div>
              <Label className="text-xs">显示名称</Label>
              <Input className="h-8 text-xs mt-1" value={label} onChange={e => setLabel(e.target.value)} placeholder="如 执行模式" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">控件类型</Label>
              <Select value={type} onValueChange={(v) => setType(v as FilterControlType)}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTROL_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">选项来源</Label>
              <Select value={optionSource} onValueChange={(v) => setOptionSource(v as FilterOptionSource)}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTION_SOURCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={required} onCheckedChange={setRequired} />
              <Label className="text-xs">必填</Label>
            </div>
            <div className="flex-1">
              <Label className="text-xs">默认值</Label>
              <Input className="h-8 text-xs mt-1" value={defaultValue} onChange={e => setDefaultValue(e.target.value)} placeholder="可选" />
            </div>
          </div>

          {type === 'cascader' && (
            <div>
              <Label className="text-xs">级联数据源</Label>
              <Select value={cascaderSource || 'region'} onValueChange={(v) => setCascaderSource(v as 'region')}>
                <SelectTrigger className="h-8 text-xs mt-1 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="region">区域（地州→区县→网格）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {optionSource === 'dict' && (
            <div>
              <Label className="text-xs">字典编码</Label>
              <Input className="h-8 text-xs mt-1" value={dictCode} onChange={e => setDictCode(e.target.value)} placeholder="如 complaint_type" />
              <p className="text-[10px] text-muted-foreground mt-1">运行时从后端数据字典接口加载选项</p>
            </div>
          )}

          {optionSource === 'static' && (type === 'select' || type === 'multiSelect') && (
            <div>
              <Label className="text-xs mb-2 block">静态选项列表</Label>
              {staticOptions.length > 0 && (
                <div className="space-y-1 mb-2">
                  {staticOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{opt.value}</span>
                      <span>=</span>
                      <span>{opt.label}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => removeOption(idx)}>
                        <Trash2 className="h-2.5 w-2.5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input className="h-7 text-xs w-[100px]" placeholder="value" value={newOptValue} onChange={e => setNewOptValue(e.target.value)} />
                <Input className="h-7 text-xs w-[100px]" placeholder="显示名" value={newOptLabel} onChange={e => setNewOptLabel(e.target.value)} />
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addOption} disabled={!newOptValue || !newOptLabel}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={handleSave} disabled={!id || !label}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FilterConditionEditor({ filterConfig, onChange }: FilterConditionEditorProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sortedConfig = [...filterConfig].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    setEditingIndex(null);
    setEditDialogOpen(true);
  };

  const handleAddRegion = () => {
    const maxOrder = filterConfig.length > 0 ? Math.max(...filterConfig.map(f => f.order)) : 0;
    const newFilter: FilterConfig = {
      id: 'region',
      label: '查询区域',
      type: 'cascader',
      required: false,
      defaultValue: 'all',
      optionSource: 'system',
      cascaderSource: 'region',
      order: maxOrder + 1,
    };
    // 检查是否已有region条件
    if (filterConfig.some(f => f.id === 'region')) return;
    onChange([...filterConfig, newFilter]);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const handleSave = (config: FilterConfig) => {
    if (editingIndex !== null) {
      const newConfig = [...filterConfig];
      newConfig[editingIndex] = config;
      onChange(newConfig);
    } else {
      const maxOrder = filterConfig.length > 0 ? Math.max(...filterConfig.map(f => f.order)) : 0;
      onChange([...filterConfig, { ...config, order: maxOrder + 1 }]);
    }
    setEditDialogOpen(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    onChange(filterConfig.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newConfig = [...filterConfig];
    const temp = newConfig[index].order;
    newConfig[index].order = newConfig[index - 1].order;
    newConfig[index - 1].order = temp;
    onChange(newConfig);
  };

  const handleMoveDown = (index: number) => {
    if (index === filterConfig.length - 1) return;
    const newConfig = [...filterConfig];
    const temp = newConfig[index].order;
    newConfig[index].order = newConfig[index + 1].order;
    newConfig[index + 1].order = temp;
    onChange(newConfig);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">筛选条件配置</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAddRegion} disabled={filterConfig.some(f => f.id === 'region')}>
            <MapPin className="h-3 w-3 mr-1" />
            添加区域筛选
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAdd}>
            <Plus className="h-3 w-3 mr-1" />
            添加筛选条件
          </Button>
        </div>
      </div>

      {sortedConfig.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            暂无筛选条件，点击上方按钮添加
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedConfig.map((fc, idx) => (
            <FilterConditionRow
              key={fc.id}
              config={fc}
              isFirst={idx === 0}
              isLast={idx === sortedConfig.length - 1}
              onEdit={() => handleEdit(filterConfig.indexOf(fc))}
              onMoveUp={() => handleMoveUp(filterConfig.indexOf(fc))}
              onMoveDown={() => handleMoveDown(filterConfig.indexOf(fc))}
              onDelete={() => handleDelete(filterConfig.indexOf(fc))}
            />
          ))}
        </div>
      )}

      <FilterEditDialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditingIndex(null); }}
        onSave={handleSave}
        initialData={editingIndex !== null ? filterConfig[editingIndex] : undefined}
      />
    </div>
  );
}
