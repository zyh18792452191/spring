'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { businessScenarios } from '@/lib/business-scenarios';
import TagAssociationDialog from '@/components/TagAssociationDialog';
import IndicatorAssociationDialog from '@/components/IndicatorAssociationDialog';

// 业务场景选项（扁平化）
const getFlattenedScenarios = () => {
  const result: { value: string; label: string }[] = [];
  businessScenarios.forEach(level1 => {
    if (level1.children) {
      level1.children.forEach(level2 => {
        if (level2.children) {
          level2.children.forEach(level3 => {
            result.push({
              value: `${level1.name} / ${level2.name} / ${level3.name}`,
              label: `${level1.name} / ${level2.name} / ${level3.name}`,
            });
          });
        } else {
          result.push({
            value: `${level1.name} / ${level2.name}`,
            label: `${level1.name} / ${level2.name}`,
          });
        }
      });
    } else {
      result.push({
        value: level1.name,
        label: level1.name,
      });
    }
  });
  return result;
};

// 模拟获取客群详情数据
const getSegmentById = (id: string) => {
  const mockData: Record<string, {
    code: string;
    name: string;
    businessScenario: string;
    businessDefinition: string;
    technicalDefinition: string;
    segmentRule: string;
    relatedTags: string[];
    relatedIndicators: string[];
    effectiveDate: string;
    expiryDate: string;
    status: '生效' | '失效';
  }> = {
    '1': {
      code: 'test-0311-01',
      name: '客群测试',
      businessScenario: '公众市场 / 客户运营 / 离网维系',
      businessDefinition: '用于测试客群功能的测试数据',
      technicalDefinition: 'test_segment_flag = 1',
      segmentRule: 'test_segment_flag = 1 AND monthly_fee > 0',
      relatedTags: ['测试标签'],
      relatedIndicators: ['月均消费额'],
      effectiveDate: '2026-03-03',
      expiryDate: '2026-03-31',
      status: '生效',
    },
    '2': {
      code: 'SEG_CHURN_011',
      name: '低饱和客户',
      businessScenario: '公众市场 / 客户运营 / 离网维系',
      businessDefinition: '流量使用饱和度低于30%的客户群体',
      technicalDefinition: 'saturation_rate < 0.3',
      segmentRule: 'saturation_rate < 0.3 AND months_inactive > 2',
      relatedTags: ['低饱和', '沉默用户'],
      relatedIndicators: ['流量饱和度', '沉默时长'],
      effectiveDate: '2025-01-15',
      expiryDate: '2099-01-14',
      status: '生效',
    },
  };
  return mockData[id] || null;
};

function SegmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const segmentId = searchParams.get('id');

  const scenarioOptions = getFlattenedScenarios();

  // 表单数据
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    businessScenario: '',
    businessDefinition: '',
    technicalDefinition: '',
    segmentRule: '',
    relatedTags: [] as string[],
    relatedIndicators: [] as string[],
    effectiveDate: '',
    expiryDate: '',
    status: '生效' as '生效' | '失效',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 弹窗状态
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);

  // 编辑模式下加载数据
  useEffect(() => {
    if (isEditMode && segmentId) {
      const data = getSegmentById(segmentId);
      if (data) {
        setFormData(data);
      }
    }
  }, [isEditMode, segmentId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.code.trim()) {
      alert('请输入客群编码');
      return;
    }
    if (!formData.name.trim()) {
      alert('请输入客群名称');
      return;
    }
    if (!formData.businessScenario) {
      alert('请选择业务场景');
      return;
    }
    if (!formData.businessDefinition.trim()) {
      alert('请输入业务口径');
      return;
    }
    if (!formData.technicalDefinition.trim()) {
      alert('请输入技术口径');
      return;
    }
    if (!formData.effectiveDate) {
      alert('请选择生效日期');
      return;
    }
    if (!formData.expiryDate) {
      alert('请选择失效日期');
      return;
    }

    setIsSubmitting(true);
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('提交数据:', formData);
      alert(isEditMode ? '编辑成功' : '新增成功');
      router.push('/workspace/insight/tags/segment');
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/workspace/insight/tags/segment');
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? '编辑客群' : '新增客群'}
          </h1>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>

      {/* 表单区域 */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 客群编码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              客群编码 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="请输入客群编码"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={isEditMode}
            />
            {isEditMode && (
              <p className="text-xs text-gray-400">客群编码不可修改</p>
            )}
          </div>

          {/* 客群名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              客群名称 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="请输入客群名称"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* 业务场景 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              业务场景 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.businessScenario}
              onValueChange={(value) => handleInputChange('businessScenario', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择业务场景" />
              </SelectTrigger>
              <SelectContent>
                {scenarioOptions.slice(0, 30).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 状态 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              状态 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value as '生效' | '失效')}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="生效">生效</SelectItem>
                <SelectItem value="失效">失效</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 生效日期 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              生效日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
            />
          </div>

          {/* 失效日期 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              失效日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>

          {/* 业务口径 */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              业务口径 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="请输入业务口径定义，描述该客群的业务含义和筛选规则"
              value={formData.businessDefinition}
              onChange={(e) => handleInputChange('businessDefinition', e.target.value)}
              rows={3}
            />
          </div>

          {/* 技术口径 */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              技术口径 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="请输入技术口径定义，描述该客群的技术实现规则（如SQL条件、字段取值等）"
              value={formData.technicalDefinition}
              onChange={(e) => handleInputChange('technicalDefinition', e.target.value)}
              rows={3}
            />
          </div>

          {/* 客群规则 */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              客群规则
            </label>
            <Textarea
              placeholder="请输入客群规则"
              value={formData.segmentRule}
              onChange={(e) => handleInputChange('segmentRule', e.target.value)}
              rows={3}
            />
          </div>

          {/* 关联标签 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              关联标签
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="点击选择关联标签"
                value={formData.relatedTags.join('、')}
                readOnly
                className="bg-gray-50 cursor-pointer"
                onClick={() => setTagDialogOpen(true)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTagDialogOpen(true)}
              >
                选择
              </Button>
            </div>
          </div>

          {/* 关联指标 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              关联指标
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="点击选择关联指标"
                value={formData.relatedIndicators.join('、')}
                readOnly
                className="bg-gray-50 cursor-pointer"
                onClick={() => setIndicatorDialogOpen(true)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIndicatorDialogOpen(true)}
              >
                选择
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 标签关联弹窗 */}
      <TagAssociationDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        segmentId={null}
        onSave={(selectedTags) => {
          setFormData(prev => ({ ...prev, relatedTags: selectedTags }));
          setTagDialogOpen(false);
        }}
      />

      {/* 指标关联弹窗 */}
      <IndicatorAssociationDialog
        open={indicatorDialogOpen}
        onOpenChange={setIndicatorDialogOpen}
        segmentId={null}
        onSave={(selectedIndicators) => {
          setFormData(prev => ({ ...prev, relatedIndicators: selectedIndicators }));
          setIndicatorDialogOpen(false);
        }}
      />
    </div>
  );
}

export default function SegmentFormPage() {
  return (
    <Suspense fallback={<div className="p-6">加载中...</div>}>
      <SegmentFormContent />
    </Suspense>
  );
}
