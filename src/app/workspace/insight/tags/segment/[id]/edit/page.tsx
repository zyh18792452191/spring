'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { businessScenarios } from '@/lib/business-scenarios';

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

// 表单数据类型
interface FormData {
  code: string;
  name: string;
  businessScenario: string;
  businessDefinition: string;
  technicalDefinition: string;
  effectiveDate: string;
  expiryDate: string;
  status: '生效' | '失效';
}

// 模拟获取客群详情数据
const getSegmentById = (id: string): FormData | null => {
  const mockData: Record<string, FormData> = {
    '1': {
      code: 'test-0311-01',
      name: '客群测试',
      businessScenario: '公众市场 / 客户运营 / 离网维系',
      businessDefinition: '用于测试客群功能的测试数据',
      technicalDefinition: 'test_segment_flag = 1',
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
      effectiveDate: '2025-01-15',
      expiryDate: '2099-01-14',
      status: '生效',
    },
  };
  return mockData[id] || null;
};

export default function EditSegmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const scenarioOptions = getFlattenedScenarios();

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    businessScenario: '',
    businessDefinition: '',
    technicalDefinition: '',
    effectiveDate: '',
    expiryDate: '',
    status: '生效',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载数据
  useEffect(() => {
    const data = getSegmentById(id);
    if (data) {
      setFormData(data);
    }
    setLoading(false);
  }, [id]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('提交数据:', formData);
      alert('编辑成功');
      router.push('/workspace/insight/tags/segment');
    } catch {
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/workspace/insight/tags/segment');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-20">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">编辑客群</h1>
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
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-400">客群编码不可修改</p>
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
              placeholder="请输入业务口径定义"
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
              placeholder="请输入技术口径定义"
              value={formData.technicalDefinition}
              onChange={(e) => handleInputChange('technicalDefinition', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
