'use client';

import React, { useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (result: { total: number; success: number; failed: number }) => void;
}

export default function ImportTagDialog({
  open,
  onOpenChange,
  onImport,
}: ImportTagDialogProps) {
  const [tagType, setTagType] = useState<'固定标签' | '自定义标签'>('固定标签');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    show: boolean;
    total: number;
    success: number;
    failed: number;
    errors?: string[];
  } | null>(null);

  // 下载模板
  const handleDownloadTemplate = () => {
    const fileName = tagType === '固定标签' ? '固定标签导入模板.xlsx' : '自定义标签导入模板.xlsx';
    
    // 创建CSV内容（实际项目中应该生成真实的Excel文件）
    let csvContent = '';
    if (tagType === '固定标签') {
      csvContent = [
        '标签编码,标签名称,标签分组,业务口径,技术口径,标签取值类型,标签取值(格式:值1:含义1;值2:含义2),数值-数据来源系统,数值-数据源表,数值-最小粒度,数值-单位,数值-数据接入方式,数值-数据源字段,占比-数据来源系统,占比-数据源表,占比-最小粒度,占比-单位,占比-数据接入方式,占比-数据源字段',
        'tag_code_001,示例标签1,通信行为,示例业务口径,示例技术口径,枚举,1:男;2:女,大数据平台,user_table,地州,万,离线接入,user_id,大数据平台,user_table,地州,%,离线接入,user_id',
        'tag_code_002,示例标签2,消费行为,示例业务口径2,示例技术口径2,区间,0:<50元;1:50-100元,大数据平台,order_table,地州,万元,离线接入,order_amount,大数据平台,order_table,地州,%,离线接入,order_amount',
      ].join('\n');
    } else {
      csvContent = [
        '标签编码,标签名称,标签分组,业务口径,技术口径,标签取值类型,标签取值(格式:值1:含义1;值2:含义2)',
        'custom_tag_001,自定义标签1,通信行为,示例业务口径,示例技术口径,枚举,1:是;0:否',
        'custom_tag_002,自定义标签2,消费行为,示例业务口径2,示例技术口径2,区间,0:低;1:中;2:高',
      ].join('\n');
    }

    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace('.xlsx', '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  // 清除文件
  const handleClearFile = () => {
    setFile(null);
    setImportResult(null);
  };

  // 执行导入
  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    // 模拟导入过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟导入结果
    const result = {
      show: true,
      total: 10,
      success: 8,
      failed: 2,
      errors: ['第3行: 标签编码已存在', '第7行: 标签分组不正确'],
    };

    setImportResult(result);
    setImporting(false);
    
    if (result.failed === 0) {
      onImport?.({ total: result.total, success: result.success, failed: result.failed });
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    onOpenChange(false);
  };

  // 获取模板字段说明
  const getTemplateFields = () => {
    const baseFields = [
      { name: '标签编码', required: true, desc: '唯一标识，不可重复' },
      { name: '标签名称', required: true, desc: '标签中文名称' },
      { name: '标签分组', required: true, desc: '通信行为/投诉行为/潜力属性/消费行为' },
      { name: '业务口径', required: true, desc: '业务定义描述' },
      { name: '技术口径', required: true, desc: '技术定义描述' },
      { name: '标签取值类型', required: true, desc: '枚举/区间' },
      { name: '标签取值', required: true, desc: '格式: 值1:含义1;值2:含义2' },
    ];

    const fixedTagFields = [
      { name: '数值-数据来源系统', required: true, desc: 'CRM/BSS/DSS/OSS/数仓/大数据平台' },
      { name: '数值-数据源表', required: true, desc: '数据表名称' },
      { name: '数值-最小粒度', required: true, desc: '集团/地州/城市/区县/网格' },
      { name: '数值-单位', required: true, desc: '个/万/千万/亿/%/元/万元/亿元' },
      { name: '数值-数据接入方式', required: true, desc: '实时接入/离线接入/手动接入' },
      { name: '数值-数据源字段', required: true, desc: '字段名称' },
      { name: '占比-数据来源系统', required: true, desc: 'CRM/BSS/DSS/OSS/数仓/大数据平台' },
      { name: '占比-数据源表', required: true, desc: '数据表名称' },
      { name: '占比-最小粒度', required: true, desc: '集团/地州/城市/区县/网格' },
      { name: '占比-单位', required: true, desc: '%' },
      { name: '占比-数据接入方式', required: true, desc: '实时接入/离线接入/手动接入' },
      { name: '占比-数据源字段', required: true, desc: '字段名称' },
    ];

    return tagType === '固定标签' ? [...baseFields, ...fixedTagFields] : baseFields;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">批量导入标签</DialogTitle>
          <DialogDescription>
            请选择标签类型后下载对应模板，填写完成后上传文件
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* 标签类型选择 */}
          <div>
            <Label className="text-sm font-medium mb-3 block">标签类型</Label>
            <RadioGroup
              value={tagType}
              onValueChange={(v) => {
                setTagType(v as '固定标签' | '自定义标签');
                setFile(null);
                setImportResult(null);
              }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="固定标签" id="import-fixed" />
                <Label htmlFor="import-fixed" className="cursor-pointer">固定标签</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="自定义标签" id="import-custom" />
                <Label htmlFor="import-custom" className="cursor-pointer">自定义标签</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500 mt-2">
              {tagType === '固定标签' 
                ? '固定标签需要填写完整的数据来源配置信息' 
                : '自定义标签仅需填写基本信息'}
            </p>
          </div>

          {/* 模板下载 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {tagType === '固定标签' ? '固定标签导入模板' : '自定义标签导入模板'}
                </div>
                <div className="text-xs text-gray-500">支持 .xlsx、.xls、.csv 格式</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              下载模板
            </Button>
          </div>

          {/* 文件上传 */}
          <div>
            <Label className="text-sm font-medium mb-3 block">上传文件</Label>
            {file ? (
              <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  onClick={handleClearFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">点击或拖拽文件到此处上传</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* 导入结果 */}
          {importResult?.show && (
            <div className={`p-4 rounded-lg ${importResult.failed === 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                {importResult.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                <span className={`font-medium ${importResult.failed === 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  导入完成
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                  <div className="text-xs text-gray-500">总条数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-xs text-gray-500">成功</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-xs text-gray-500">失败</div>
                </div>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-white p-3 rounded border max-h-24 overflow-y-auto">
                  <div className="text-xs font-medium text-gray-700 mb-1">失败原因：</div>
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600">{error}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 模板字段说明 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">模板字段说明</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">字段名</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">是否必填</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getTemplateFields().map((field, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-900">{field.name}</td>
                      <td className="px-4 py-2">
                        {field.required ? (
                          <span className="text-red-500">必填</span>
                        ) : (
                          <span className="text-gray-400">选填</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{field.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? '导入中...' : '开始导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
