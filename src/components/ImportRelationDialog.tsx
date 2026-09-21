'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ImportRelationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (data: ImportResult) => void;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors?: string[];
}

export default function ImportRelationDialog({
  open,
  onOpenChange,
  onImport,
}: ImportRelationDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        alert('请上传Excel文件（.xlsx或.xls格式）');
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    // 模拟下载模板
    const templateData = [
      ['指标编码', '指标名称', '同比指标编码', '环比指标编码'],
      ['ACTIVITY_PV_DAY', '活动PV（日）', 'ACTIVITY_PV_YOY', 'ACTIVITY_PV_MOM'],
      ['ACTIVITY_UV_DAY', '活动UV（日）', 'ACTIVITY_UV_YOY', 'ACTIVITY_UV_MOM'],
      ['SDJH_CYKHGM_DAY', '参与客户规模（日）', '', 'SDJH_CYKHGM_MOM'],
    ];

    // 创建CSV内容
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '指标关联关系导入模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    try {
      // TODO: 实际导入逻辑
      // 模拟导入过程
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result: ImportResult = {
        total: 10,
        success: 8,
        failed: 2,
        errors: [
          '第3行：同比指标编码 METRIC_XXX_YOY 不存在',
          '第7行：环比指标编码 METRIC_YYY_MOM 已与其他指标关联',
        ],
      };

      setImportResult(result);
      onImport?.(result);
    } catch (error) {
      console.error('导入失败:', error);
      setImportResult({
        total: 0,
        success: 0,
        failed: 0,
        errors: ['导入失败，请稍后重试'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">导入关联关系</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* 模板下载 */}
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-700">导入模板</div>
                <div className="text-xs text-gray-500">下载模板文件，按格式填写后上传</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-1" />
              下载模板
            </Button>
          </div>

          {/* 模板说明 */}
          <div className="mb-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-600 mb-1">模板说明</div>
            <ul className="list-disc list-inside space-y-1">
              <li>指标编码：必填，需与系统中已存在的指标编码一致</li>
              <li>同比指标编码：选填，填写已存在的同比类型指标编码</li>
              <li>环比指标编码：选填，填写已存在的环比类型指标编码</li>
              <li>仅支持"值"、"占比"、"增量"类型的指标配置关联关系</li>
            </ul>
          </div>

          {/* 文件上传区域 */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <div className="text-sm text-gray-600 mb-1">
                  点击上传或拖拽文件到此处
                </div>
                <div className="text-xs text-gray-400">
                  支持 .xlsx、.xls、.csv 格式
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 导入结果 */}
          {importResult && (
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                {importResult.failed > 0 ? (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                <span className="font-medium text-gray-700">导入结果</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold text-gray-700">{importResult.total}</div>
                  <div className="text-xs text-gray-500">总计</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-semibold text-green-600">{importResult.success}</div>
                  <div className="text-xs text-gray-500">成功</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="text-lg font-semibold text-orange-500">{importResult.failed}</div>
                  <div className="text-xs text-gray-500">失败</div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="text-xs text-gray-500">
                  <div className="font-medium text-gray-700 mb-1">失败原因：</div>
                  <ul className="list-disc list-inside space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="text-red-500">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleImport}
            disabled={!file || isImporting}
          >
            {isImporting ? '导入中...' : '开始导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
