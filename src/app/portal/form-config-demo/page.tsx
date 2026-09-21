'use client';

import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormConfigDialog, { FormTemplateConfig } from '@/components/FormConfigDialog';

export default function FormConfigDemoPage() {
  const [showConfig, setShowConfig] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplateConfig | undefined>();
  const [savedTemplates, setSavedTemplates] = useState<FormTemplateConfig[]>([]);

  const handleSaveTemplate = (template: FormTemplateConfig) => {
    setSavedTemplates(prev => {
      const index = prev.findIndex(t => t.id === template.id);
      if (index >= 0) {
        const newTemplates = [...prev];
        newTemplates[index] = template;
        return newTemplates;
      } else {
        return [...prev, template];
      }
    });
    setShowConfig(false);
  };

  const handleEditTemplate = (template: FormTemplateConfig) => {
    setCurrentTemplate(template);
    setShowConfig(true);
  };

  const handleCreateTemplate = () => {
    setCurrentTemplate(undefined);
    setShowConfig(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">工单回单配置管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            配置不同类型工单的回单表单字段，满足业务多样化需求
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="mb-6">
          <Button
            onClick={handleCreateTemplate}
            className="bg-[#3B82F6] hover:bg-[#2563EB]"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建新模板
          </Button>
        </div>

        {/* 模板列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">已保存的模板</h2>
          </div>

          {savedTemplates.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">暂无保存的模板，点击"创建新模板"开始配置</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {savedTemplates.map((template) => (
                <div key={template.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                        {template.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            默认模板
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {template.fields.length} 个字段
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="border-gray-300"
                      >
                        编辑
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>点击"创建新模板"开始配置新的回单表单</li>
            <li>支持添加预设字段（如客群ID、目标客户数等）快速开始</li>
            <li>也可以自定义添加字段，支持7种字段类型：文本框、数字框、日期、下拉框、多选框、多行文本、文件上传</li>
            <li>可以设置字段是否必填、默认值、占位提示、验证规则等</li>
            <li>支持字段排序（上移/下移），调整显示顺序</li>
            <li>实时预览回单表单效果，确认无误后保存</li>
            <li>可以为不同业务类型（指标调度、客群调度、策略调度）创建不同的模板</li>
          </ul>
        </div>
      </div>

      {/* 配置弹窗 */}
      <FormConfigDialog
        open={showConfig}
        onClose={() => setShowConfig(false)}
        template={currentTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
