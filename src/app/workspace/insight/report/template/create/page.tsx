'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SimpleReportAssociationSelector from '@/components/SimpleReportAssociationSelector';
import type { ReportAssociation } from '@/lib/report-association/types';

// 业务场景数据结构定义
type BusinessScenarioItem = {
  id: string;
  name: string;
  children?: BusinessScenarioItem[];
};

const businessScenarios: BusinessScenarioItem[] = [
  {
    id: 'public_market',
    name: '公众市场',
    children: [
      {
        id: 'market_operation',
        name: '市场运营',
        children: [
          { id: 'market_operation', name: '市场运营' },
          { id: 'new_subscriptions', name: '新入网' },
          { id: 'group_customers', name: '集团成员客户' },
        ],
      },
      {
        id: 'customer_operation',
        name: '客户运营',
        children: [
          { id: 'customer_operation', name: '客户运营' },
          { id: 'mid_high_end', name: '中高端' },
          { id: 'new_subscriptions', name: '新入网' },
          { id: 'group_customers', name: '集团成员客户' },
          { id: 'global', name: '全球通' },
          { id: 'mid_high_end_warning', name: '中高端流失预警' },
        ],
      },
      {
        id: 'product_operation',
        name: '产品运营',
        children: [
          { id: 'product_operation', name: '产品运营' },
          { id: 'data_products', name: '数据产品' },
          { id: 'content_products', name: '内容产品' },
        ],
      },
      {
        id: 'channel_operation',
        name: '渠道运营',
        children: [
          { id: 'channel_operation', name: '渠道运营' },
          { id: 'online_channel', name: '线上渠道' },
          { id: 'offline_channel', name: '线下渠道' },
        ],
      },
      {
        id: 'international_operation',
        name: '国际运营',
        children: [
          { id: 'international_operation', name: '国际运营' },
          { id: 'roaming', name: '漫游业务' },
          { id: 'international', name: '国际业务' },
        ],
      },
      {
        id: 'segment_market',
        name: '细分市场运营',
        children: [
          { id: 'segment_market', name: '细分市场运营' },
          { id: 'youth', name: '青年市场' },
          { id: 'silver', name: '银发市场' },
        ],
      },
    ],
  },
  {
    id: 'enterprise_market',
    name: '政企市场',
  },
  {
    id: 'home_market',
    name: '家庭市场',
    children: [
      {
        id: 'broadband',
        name: '宽带业务',
        children: [
          { id: 'broadband', name: '宽带业务' },
          { id: 'fiber', name: '光纤宽带' },
          { id: 'business_broadband', name: '企业宽带' },
        ],
      },
      {
        id: 'home_security',
        name: '家庭安防',
        children: [
          { id: 'home_security', name: '家庭安防' },
          { id: 'smart_lock', name: '智能门锁' },
          { id: 'smart_camera', name: '智能摄像头' },
        ],
      },
    ],
  },
  {
    id: 'product_market',
    name: '产品市场',
    children: [
      {
        id: '5g_products',
        name: '5G产品',
        children: [
          { id: '5g_products', name: '5G产品' },
          { id: '5g_packages', name: '5G套餐' },
          { id: '5g_devices', name: '5G终端' },
        ],
      },
      {
        id: 'cloud_services',
        name: '云服务',
        children: [
          { id: 'cloud_services', name: '云服务' },
          { id: 'cloud_storage', name: '云存储' },
          { id: 'cloud_computing', name: '云计算' },
        ],
      },
    ],
  },
];

// 业务场景三级联动下拉框组件
const BusinessScenarioSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedPath, setSelectedPath] = useState<{ level1?: string; level2?: string; level3?: string }>({});
  const [level1Options] = useState<BusinessScenarioItem[]>(businessScenarios);
  const [level2Options, setLevel2Options] = useState<BusinessScenarioItem[]>([]);
  const [level3Options, setLevel3Options] = useState<BusinessScenarioItem[]>([]);

  useEffect(() => {
    if (value) {
      // 解析已选中的值，显示面包屑
      const parts = value.split(' / ');
      if (parts.length >= 1) {
        setSelectedPath({ level1: parts[0], level2: parts[1], level3: parts[2] });
      }
    }
  }, [value]);

  const handleLevel1Click = (option: BusinessScenarioItem) => {
    setSelectedPath({ level1: option.name });
    setCurrentLevel(2);

    if (option.children && option.children.length > 0) {
      setLevel2Options(option.children);
    } else {
      // 没有二级选项，直接完成选择
      onChange(option.name);
      setIsOpen(false);
    }
  };

  const handleLevel2Click = (option: BusinessScenarioItem) => {
    setSelectedPath((prev) => ({ ...prev, level2: option.name }));
    setCurrentLevel(3);

    if (option.children && option.children.length > 0) {
      setLevel3Options(option.children);
    } else {
      // 没有三级选项，完成选择
      const selectedValue = `${selectedPath.level1} / ${option.name}`;
      onChange(selectedValue);
      setIsOpen(false);
    }
  };

  const handleLevel3Click = (option: { id: string; name: string }) => {
    const selectedValue = `${selectedPath.level1} / ${selectedPath.level2} / ${option.name}`;
    onChange(selectedValue);
    setIsOpen(false);
    setCurrentLevel(1);
  };

  const handleBackToLevel1 = () => {
    setCurrentLevel(1);
  };

  const handleBackToLevel2 = () => {
    setCurrentLevel(2);
  };

  const handleReset = () => {
    setSelectedPath({});
    setCurrentLevel(1);
    setLevel2Options([]);
    setLevel3Options([]);
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-10 px-3 border border-gray-300 rounded-md flex items-center justify-between cursor-pointer hover:border-gray-400 bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || '请选择'}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
      </div>

      {/* 面包屑显示 */}
      {value && (
        <div className="mt-2 text-sm text-gray-600 bg-blue-50 inline-block px-3 py-1.5 rounded-md">
          {value}
        </div>
      )}

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start gap-4">
            {/* 第一级 */}
            <div className="flex-shrink-0 w-32">
              <div className="text-sm font-medium text-gray-900 mb-2">一级分类</div>
              <div className="space-y-1">
                {level1Options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleLevel1Click(option)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                      selectedPath.level1 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{option.name}</span>
                    {option.children && option.children.length > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 第二级 */}
            {currentLevel >= 2 && selectedPath.level1 && (
              <div className="flex-shrink-0 w-32 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">二级分类</div>
                <div className="space-y-1">
                  <button
                    onClick={handleBackToLevel1}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 mb-2"
                  >
                    &lt; 返回
                  </button>
                  {level2Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel2Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        selectedPath.level2 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{option.name}</span>
                      {option.children && option.children.length > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 第三级 */}
            {currentLevel >= 3 && selectedPath.level2 && (
              <div className="flex-shrink-0 w-40 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">三级分类</div>
                <div className="space-y-1">
                  <button
                    onClick={handleBackToLevel2}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 mb-2"
                  >
                    &lt; 返回
                  </button>
                  {level3Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel3Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedPath.level3 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部操作按钮 */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreateTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [reportType, setReportType] = useState('日报');
  const [reportLevel, setReportLevel] = useState('全国');
  const [businessScenario, setBusinessScenario] = useState('公众市场 / 客户运营 / 中高端');
  const [templateDescription, setTemplateDescription] = useState('');
  const [reportAssociation, setReportAssociation] = useState<ReportAssociation[]>([]);

  const handleCancel = () => {
    router.back();
  };

  const handleNext = () => {
    // 这里可以添加表单验证逻辑
    console.log({
      templateName,
      reportType,
      reportLevel,
      businessScenario,
      templateDescription,
    });
    // 跳转到下一步：模板编辑页面
    router.push('/workspace/insight/report/template/create/editor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部步骤导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center">
            {/* 步骤1：基础信息 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">基础信息</span>
            </div>

            {/* 连接线 */}
            <div className="w-20 h-px bg-gray-300 mx-2 border-t border-dashed border-gray-300" />

            {/* 步骤2：模板编辑 */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm text-gray-400">模板编辑</span>
            </div>
          </div>
        </div>
      </div>

      {/* 表单主体区域 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">基础信息</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* 模板名称 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="templateName" className="text-sm font-medium text-gray-700">
                *模板名称
              </Label>
              <span className="text-xs text-gray-400">{templateName.length}/50</span>
            </div>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value.slice(0, 50))}
              placeholder="请输入"
              className="mt-1.5 h-10"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-red-500">请输入模板名称</p>
          </div>

          {/* 报告类型 */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              *报告类型
            </Label>
            <div className="flex gap-6">
              {['日报', '周报', '月报', '季报', '年报', '自定义周期'].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={type}
                    checked={reportType === type}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 报告层级 */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              *报告层级
            </Label>
            <div className="flex gap-6">
              {['全国', '地州', '地市'].map((level) => (
                <label key={level} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reportLevel"
                    value={level}
                    checked={reportLevel === level}
                    onChange={(e) => setReportLevel(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 业务场景 */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              *业务场景
            </Label>
            <BusinessScenarioSelect value={businessScenario} onChange={setBusinessScenario} />
          </div>

          {/* 模板描述 */}
          <div className="mb-6">
            <Label htmlFor="templateDescription" className="text-sm font-medium text-gray-700">
              模板描述
            </Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="请输入模板描述，帮助理解模板用途"
              className="mt-1.5 min-h-[120px] resize-none"
              rows={4}
            />
          </div>

          {/* 报告展示位置 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                报告展示位置
              </Label>
              <span className="text-xs text-gray-400">配置生成的报告将展示在哪些页面</span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <SimpleReportAssociationSelector 
                businessScenario={businessScenario}
                associations={reportAssociation} 
                onChange={setReportAssociation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
            下一步
          </Button>
        </div>
      </div>
    </div>
  );
}
