'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// 商机分类数据（参考商机分类管理）- 仅包含4种
const categoryOptions = {
  level1: [
    { value: 'C001', label: '风险预警类' },
    { value: 'C004', label: '价值提升类' },
    { value: 'C005', label: '生命周期类' },
  ],
  level2: {
    'C001': [
      { value: 'C001-001', label: '流量预警' },
    ],
    'C004': [
      { value: 'C004-001', label: '流量经营' },
    ],
    'C005': [
      { value: 'C005-002', label: '沉默流失预警' },
    ],
  },
  level3: {
    'C001-001': [
      { value: 'C001-001-001', label: '流量达量预警' },
    ],
    'C004-001': [
      { value: 'C004-001-001', label: '特定内容高频访问' },
      { value: 'C004-001-002', label: '地板价套餐查询高流量套餐' },
    ],
    'C005-002': [
      { value: 'C005-002-001', label: '零流量使用预警' },
    ],
  },
};

// 商机源数据
const sourceOptions = [
  { value: 'CRM系统', label: 'CRM系统' },
  { value: '营销活动平台', label: '营销活动平台' },
  { value: '外呼系统', label: '外呼系统' },
  { value: '线上渠道', label: '线上渠道' },
  { value: '线下营业厅', label: '线下营业厅' },
  { value: '代理商系统', label: '代理商系统' },
  { value: '微信小程序', label: '微信小程序' },
  { value: '企业微信', label: '企业微信' },
];

export default function AddOpportunityPage() {
  const router = useRouter();

  // 表单数据
  const [formData, setFormData] = useState({
    categoryL1: '',
    categoryL2: '',
    categoryL3: '',
    source: '',
    rating: '',
    type: 'customer' as 'customer' | 'group',
    phone: '',
    relatedTags: [] as string[],
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取二三级分类选项
  const level2Options = formData.categoryL1 
    ? categoryOptions.level2[formData.categoryL1 as keyof typeof categoryOptions.level2] || [] 
    : [];
  
  const level3Options = formData.categoryL2 
    ? categoryOptions.level3[formData.categoryL2 as keyof typeof categoryOptions.level3] || [] 
    : [];

  const handleInputChange = (field: string, value: string) => {
    if (field === 'categoryL1') {
      setFormData(prev => ({ ...prev, categoryL1: value, categoryL2: '', categoryL3: '' }));
    } else if (field === 'categoryL2') {
      setFormData(prev => ({ ...prev, categoryL2: value, categoryL3: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.categoryL3) {
      alert('请选择商机分类');
      return;
    }
    if (!formData.source) {
      alert('请选择商机源');
      return;
    }
    if (!formData.rating) {
      alert('请选择评级');
      return;
    }
    if (formData.type === 'customer' && !formData.phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (formData.type === 'group' && formData.relatedTags.length === 0) {
      alert('请选择客群标签');
      return;
    }
    if (!formData.reason.trim()) {
      alert('请输入商机录入原因');
      return;
    }

    setIsSubmitting(true);
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('提交数据:', formData);
      alert('新增成功');
      router.push('/workspace/business-opportunity/customer');
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/workspace/business-opportunity/customer');
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
            新增商机
          </h1>
        </div>
        <Button
          className="bg-[#0085D0] hover:bg-[#0070B8]"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>

      {/* 基本信息 */}
      <Card className="p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 商机分类 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              商机分类 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Select
                value={formData.categoryL1}
                onValueChange={(value) => handleInputChange('categoryL1', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="一级分类" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.level1.map(item => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.categoryL2}
                onValueChange={(value) => handleInputChange('categoryL2', value)}
                disabled={!formData.categoryL1}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="二级分类" />
                </SelectTrigger>
                <SelectContent>
                  {level2Options.map(item => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.categoryL3}
                onValueChange={(value) => handleInputChange('categoryL3', value)}
                disabled={!formData.categoryL2}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="三级分类" />
                </SelectTrigger>
                <SelectContent>
                  {level3Options.map(item => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 商机源 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              商机源 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择商机源" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 评级 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              评级 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.rating}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择评级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="高">高</SelectItem>
                <SelectItem value="中">中</SelectItem>
                <SelectItem value="低">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 目标客户 */}
      <Card className="p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">目标客户</h3>
        <div className="space-y-4">
          {/* 手机号 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              手机号 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="请输入手机号"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-80"
            />
          </div>
        </div>
      </Card>

      {/* 商机录入原因 */}
      <Card className="p-6 mb-6">

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            商机录入原因 <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="请输入商机录入原因"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            rows={4}
            className="resize-none"
          />
        </div>
      </Card>


    </div>
  );
}
