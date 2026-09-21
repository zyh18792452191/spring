'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function CreateMetricPage() {
  const router = useRouter();

  // 表单状态
  const [formData, setFormData] = useState({
    // 基本信息
    metricName: '',
    isCustomerMetric: '是',
    metricType: '',
    statisticalPeriod: '',
    metricFormat: '',
    metricPurpose: '',
    metricCode: '',
    businessScenario: '',
    metricGranularity: '',
    metricTimeliness: '',
    metricUnit: '',
    metricDirection: '正向指标',
    metricBusinessDefinition: '',
    metricTechnicalDefinition: '',
    metricBusinessDescription: '',

    // 扩展属性
    sourceSystem: '',
    sourceTable: '',
    responsiblePerson: '',
    integrationMethod: '',
    sourceField: '',
    effectiveDate: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.push('/portal/capability/insight/overview?view=metric');
  };

  const handleSave = () => {
    // TODO: 保存逻辑
    console.log('保存数据:', formData);
    router.push('/portal/capability/insight/overview?view=metric');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">新增指标</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-1" />
            保存
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* 基本信息区块 */}
        <Card className="mb-6 p-6">
          <div className="flex items-center mb-6">
            <div className="w-1 h-5 bg-blue-600 mr-2"></div>
            <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* 左栏 */}
            <div className="space-y-4">
              {/* 指标名称 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标名称
                </Label>
                <Input
                  placeholder="请输入"
                  value={formData.metricName}
                  onChange={(e) => handleInputChange('metricName', e.target.value)}
                />
              </div>

              {/* 客群指标 */}
              <div>
                <Label className="block mb-1">客群指标</Label>
                <RadioGroup
                  value={formData.isCustomerMetric}
                  onValueChange={(value) => handleInputChange('isCustomerMetric', value)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <RadioGroupItem value="是" id="yes" className="mr-2" />
                      <Label htmlFor="yes" className="cursor-pointer">是</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="否" id="no" className="mr-2" />
                      <Label htmlFor="no" className="cursor-pointer">否</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* 指标类型 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标类型
                </Label>
                <Select
                  value={formData.metricType}
                  onValueChange={(value) => handleInputChange('metricType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="复合指标">复合指标</SelectItem>
                    <SelectItem value="原子指标">原子指标</SelectItem>
                    <SelectItem value="派生指标">派生指标</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 统计周期 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>统计周期
                </Label>
                <RadioGroup
                  value={formData.statisticalPeriod}
                  onValueChange={(value) => handleInputChange('statisticalPeriod', value)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <RadioGroupItem value="月" id="month" className="mr-2" />
                      <Label htmlFor="month" className="cursor-pointer">月</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="周" id="week" className="mr-2" />
                      <Label htmlFor="week" className="cursor-pointer">周</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="日" id="day" className="mr-2" />
                      <Label htmlFor="day" className="cursor-pointer">日</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* 指标格式 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标格式
                </Label>
                <RadioGroup
                  value={formData.metricFormat}
                  onValueChange={(value) => handleInputChange('metricFormat', value)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <RadioGroupItem value="数值" id="number" className="mr-2" />
                      <Label htmlFor="number" className="cursor-pointer">数值</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="百分比" id="percent" className="mr-2" />
                      <Label htmlFor="percent" className="cursor-pointer">百分比</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="枚举" id="enum" className="mr-2" />
                      <Label htmlFor="enum" className="cursor-pointer">枚举</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* 指标用途 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标用途
                </Label>
                <Select
                  value={formData.metricPurpose}
                  onValueChange={(value) => handleInputChange('metricPurpose', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="业务监控">业务监控</SelectItem>
                    <SelectItem value="绩效考核">绩效考核</SelectItem>
                    <SelectItem value="决策分析">决策分析</SelectItem>
                    <SelectItem value="数据应用">数据应用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 右栏 */}
            <div className="space-y-4">
              {/* 指标编码 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标编码
                </Label>
                <Input
                  placeholder="请输入"
                  value={formData.metricCode}
                  onChange={(e) => handleInputChange('metricCode', e.target.value)}
                />
              </div>

              {/* 业务场景 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>业务场景
                </Label>
                <Select
                  value={formData.businessScenario}
                  onValueChange={(value) => handleInputChange('businessScenario', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="市场运营">市场运营</SelectItem>
                    <SelectItem value="客户服务">客户服务</SelectItem>
                    <SelectItem value="产品管理">产品管理</SelectItem>
                    <SelectItem value="风险管控">风险管控</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标最小粒度 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标最小粒度
                </Label>
                <Select
                  value={formData.metricGranularity}
                  onValueChange={(value) => handleInputChange('metricGranularity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="集团">集团</SelectItem>
                    <SelectItem value="省份">地州</SelectItem>
                    <SelectItem value="城市">城市</SelectItem>
                    <SelectItem value="区县">区县</SelectItem>
                    <SelectItem value="网格">网格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标及时性 */}
              <div>
                <Label className="block mb-1">指标及时性</Label>
                <Input
                  placeholder="请输入"
                  value={formData.metricTimeliness}
                  onChange={(e) => handleInputChange('metricTimeliness', e.target.value)}
                />
              </div>

              {/* 指标单位 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标单位
                </Label>
                <Select
                  value={formData.metricUnit}
                  onValueChange={(value) => handleInputChange('metricUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="个">个</SelectItem>
                    <SelectItem value="万">万</SelectItem>
                    <SelectItem value="千万">千万</SelectItem>
                    <SelectItem value="亿">亿</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="元">元</SelectItem>
                    <SelectItem value="万元">万元</SelectItem>
                    <SelectItem value="亿元">亿元</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标方向 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标方向
                </Label>
                <RadioGroup
                  value={formData.metricDirection}
                  onValueChange={(value) => handleInputChange('metricDirection', value)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <RadioGroupItem value="正向指标" id="positive" className="mr-2" />
                      <Label htmlFor="positive" className="cursor-pointer">正向指标</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="负向指标" id="negative" className="mr-2" />
                      <Label htmlFor="negative" className="cursor-pointer">负向指标</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* 通栏字段 */}
          <div className="mt-4 space-y-4">
            {/* 指标业务口径 */}
            <div>
              <Label className="block mb-1">
                <span className="text-red-500">*</span>指标业务口径
              </Label>
              <Textarea
                placeholder="请输入"
                value={formData.metricBusinessDefinition}
                onChange={(e) => handleInputChange('metricBusinessDefinition', e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* 指标技术口径 */}
            <div>
              <Label className="block mb-1">
                <span className="text-red-500">*</span>指标技术口径
              </Label>
              <Textarea
                placeholder="请输入"
                value={formData.metricTechnicalDefinition}
                onChange={(e) => handleInputChange('metricTechnicalDefinition', e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* 指标业务描述 */}
            <div>
              <Label className="block mb-1">指标业务描述</Label>
              <Textarea
                placeholder="请输入"
                value={formData.metricBusinessDescription}
                onChange={(e) => handleInputChange('metricBusinessDescription', e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>
          </div>
        </Card>

        {/* 扩展属性区块 */}
        <Card className="mb-6 p-6">
          <div className="flex items-center mb-6">
            <div className="w-1 h-5 bg-blue-600 mr-2"></div>
            <h2 className="text-lg font-medium text-gray-900">扩展属性</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* 左栏 */}
            <div className="space-y-4">
              {/* 指标来源系统 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标来源系统
                </Label>
                <Select
                  value={formData.sourceSystem}
                  onValueChange={(value) => handleInputChange('sourceSystem', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="BSS">BSS</SelectItem>
                    <SelectItem value="DSS">DSS</SelectItem>
                    <SelectItem value="OSS">OSS</SelectItem>
                    <SelectItem value="数仓">数仓</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标数据源表 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标数据源表
                </Label>
                <Select
                  value={formData.sourceTable}
                  onValueChange={(value) => handleInputChange('sourceTable', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择表" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table1">用户行为表</SelectItem>
                    <SelectItem value="table2">订单表</SelectItem>
                    <SelectItem value="table3">产品表</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标责任人 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标责任人
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.responsiblePerson}
                    onValueChange={(value) => handleInputChange('responsiblePerson', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">张三</SelectItem>
                      <SelectItem value="user2">李四</SelectItem>
                      <SelectItem value="user3">王五</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="px-4">
                    请选择
                  </Button>
                </div>
              </div>
            </div>

            {/* 右栏 */}
            <div className="space-y-4">
              {/* 指标接入方式 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标接入方式
                </Label>
                <Select
                  value={formData.integrationMethod}
                  onValueChange={(value) => handleInputChange('integrationMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="实时接入">实时接入</SelectItem>
                    <SelectItem value="离线接入">离线接入</SelectItem>
                    <SelectItem value="手动接入">手动接入</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标数据源字段 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标数据源字段
                </Label>
                <Select
                  value={formData.sourceField}
                  onValueChange={(value) => handleInputChange('sourceField', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择字段" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field1">用户ID</SelectItem>
                    <SelectItem value="field2">订单金额</SelectItem>
                    <SelectItem value="field3">产品ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 指标生效日期 */}
              <div>
                <Label className="block mb-1">
                  <span className="text-red-500">*</span>指标生效日期
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    placeholder="请选择"
                    value={formData.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
