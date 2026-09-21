'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Eye } from 'lucide-react';
import { ReportConfig, ColumnConfigNode } from '../data/types';
import { REPORT_CATEGORIES, getCategoryById } from '../data/categoryData';
import { saveReportAsTemplate, countLeafColumns } from '../data/mockReportData';
import { REGION_LEVEL_LABELS, REGION_DIMENSION_OPTIONS } from '../data/types';

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportConfig;
  onSaved?: (templateId: string) => void;
}

/** 构建表头结构预览文本 */
function buildHeaderPreviewText(nodes: ColumnConfigNode[], indent: number = 0): string {
  const lines: string[] = [];
  for (const node of nodes) {
    if (node.type === 'action') continue;
    const prefix = '  '.repeat(indent);
    if (node.type === 'group') {
      const childCount = node.children ? countLeafColumns(node.children) : 0;
      lines.push(`${prefix}📁 ${node.title} (${childCount}列)`);
      if (node.children) {
        lines.push(...buildHeaderPreviewText(node.children, indent + 1));
      }
    } else if (node.type === 'indicator') {
      lines.push(`${prefix}📊 ${node.title}`);
    }
  }
  return lines.join('\n');
}

export default function SaveAsTemplateDialog({
  open,
  onOpenChange,
  report,
  onSaved,
}: SaveAsTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [includeRegionConfig, setIncludeRegionConfig] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // 初始化默认值
  const isInitialized = useState(false);
  if (open && !isInitialized[0]) {
    setTemplateName(report.reportName + ' 模板');
    setTemplateDesc(report.reportDesc);
    setCategoryId(report.categoryId);
    setIncludeRegionConfig(true);
    isInitialized[1](true);
  }
  if (!open && isInitialized[0]) {
    isInitialized[1](false);
  }

  const category = getCategoryById(categoryId);
  const leafCount = useMemo(() => countLeafColumns(report.columnConfig), [report.columnConfig]);
  const headerPreviewText = useMemo(() => buildHeaderPreviewText(report.columnConfig), [report.columnConfig]);
  const regionLabel = useMemo(() => {
    if (report.regionMode === 'drill') {
      return '单列下钻（' + report.regionDimensions.map(d => REGION_LEVEL_LABELS[d]).join('→') + '）';
    }
    return '多列展开（' + report.regionDimensions.filter(d => d !== 'province').map(d => REGION_LEVEL_LABELS[d]).join('/') + '）';
  }, [report.regionMode, report.regionDimensions]);

  const handleSave = () => {
    if (!templateName.trim() || !categoryId) return;
    setSaving(true);
    try {
      const newTemplate = saveReportAsTemplate({
        reportId: report.reportId,
        templateName: templateName.trim(),
        templateDesc: templateDesc.trim(),
        categoryId,
        includeRegionConfig,
      });
      onSaved?.(newTemplate.templateId);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            另存为模板
          </DialogTitle>
          <DialogDescription>
            将当前报表配置保存为模板，供后续复用创建新报表
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 模板名称 */}
          <div className="space-y-2">
            <Label htmlFor="tpl-name">模板名称 <span className="text-red-500">*</span></Label>
            <Input
              id="tpl-name"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="输入模板名称"
            />
          </div>

          {/* 所属分类 */}
          <div className="space-y-2">
            <Label htmlFor="tpl-category">所属分类 <span className="text-red-500">*</span></Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="tpl-category">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.filter(c => c.status === 'active').map(cat => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 模板说明 */}
          <div className="space-y-2">
            <Label htmlFor="tpl-desc">模板说明</Label>
            <Textarea
              id="tpl-desc"
              value={templateDesc}
              onChange={e => setTemplateDesc(e.target.value)}
              placeholder="输入模板说明"
              rows={3}
            />
          </div>

          {/* 包含区域配置 */}
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <Checkbox
              id="tpl-region"
              checked={includeRegionConfig}
              onCheckedChange={checked => setIncludeRegionConfig(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="tpl-region" className="cursor-pointer">
                包含区域配置
              </Label>
              <p className="text-sm text-muted-foreground">
                {includeRegionConfig ? (
                  <>将区域模式（{regionLabel}）一并保存到模板中</>
                ) : (
                  <>不保存区域配置，基于此模板创建报表时需重新选择</>
                )}
              </p>
            </div>
          </div>

          {/* 列配置预览 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>列配置预览</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-7 text-xs"
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                {showPreview ? '收起' : '展开'}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{leafCount}个数据列</Badge>
              {category && <Badge variant="outline">{category.categoryName}</Badge>}
            </div>
            {showPreview && (
              <div className="max-h-48 overflow-auto rounded-md border border-border bg-muted/30 p-3">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap">{headerPreviewText}</pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!templateName.trim() || !categoryId || saving}
          >
            {saving ? '保存中...' : '确认另存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
