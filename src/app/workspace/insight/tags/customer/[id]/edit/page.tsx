'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Info, Plus, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// 标签分组选项
const tagGroups = ['通信行为', '投诉行为', '潜力属性', '消费行为'];

// 数据来源系统
const sourceSystems = ['CRM', 'BSS', 'DSS', 'OSS', '数仓', '大数据平台'];

// 最小粒度
const granularities = ['集团', '地州', '城市', '区县', '网格'];

// 单位选项
const units = ['个', '万', '千万', '亿', '%', '元', '万元', '亿元'];

// 数据接入方式
const accessMethods = ['实时接入', '离线接入', '手动接入'];

// 标签取值类型
const valueTypes = ['枚举', '区间'];

// 类型选项
const typeOptions = ['数值', '占比'];

// 格式选项
const formatOptions = ['数值', '百分比', '枚举'];

interface TagValue {
  value: string;
  meaning: string;
}

interface DataSourceConfig {
  type: string;
  format: string;
  sourceSystem: string;
  sourceTable: string;
  granularity: string;
  unit: string;
  accessMethod: string;
  sourceField: string;
}

// 模拟数据
const mockTagData = {
  id: 1,
  tagType: '固定标签',
  tagCode: 'u_three',
  tagName: '近三月降档情况',
  tagGroup: '通信行为',
  businessDefinition: '近三月降档情况',
  technicalDefinition: '近三月降档情况',
  valueType: '枚举',
  tagValues: [
    { value: '3', meaning: 'T-3月降档' },
    { value: '2', meaning: 'T-2月降档' },
    { value: '1', meaning: 'T-1月降档' },
  ],
  statDataValue: {
    type: '数值',
    format: '数值',
    sourceSystem: '大数据平台',
    sourceTable: 'user_behavior_table',
    granularity: '地州',
    unit: '万',
    accessMethod: '离线接入',
    sourceField: 'downgrade_flag',
  },
  statDataRatio: {
    type: '占比',
    format: '百分比',
    sourceSystem: '大数据平台',
    sourceTable: 'user_behavior_table',
    granularity: '地州',
    unit: '%',
    accessMethod: '离线接入',
    sourceField: 'downgrade_ratio',
  },
  featureDataValue: {
    type: '数值',
    format: '数值',
    sourceSystem: '大数据平台',
    sourceTable: 'user_feature_table',
    granularity: '地州',
    unit: '万',
    accessMethod: '离线接入',
    sourceField: 'feature_value',
  },
  featureDataRatio: {
    type: '占比',
    format: '百分比',
    sourceSystem: '大数据平台',
    sourceTable: 'user_feature_table',
    granularity: '地州',
    unit: '%',
    accessMethod: '离线接入',
    sourceField: 'feature_ratio',
  },
};

export default function EditCustomerTagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.id as string;

  // 标签类型（不可修改）
  const [tagType, setTagType] = useState<'固定标签' | '自定义标签'>('固定标签');

  // 基本信息
  const [tagCode, setTagCode] = useState('');
  const [tagName, setTagName] = useState('');
  const [tagGroup, setTagGroup] = useState('');
  const [businessDefinition, setBusinessDefinition] = useState('');
  const [technicalDefinition, setTechnicalDefinition] = useState('');
  const [valueType, setValueType] = useState('');
  const [tagValues, setTagValues] = useState<TagValue[]>([{ value: '', meaning: '' }]);

  // 标签统计数据取值来源
  const [statDataValue, setStatDataValue] = useState<DataSourceConfig>({
    type: '数值',
    format: '数值',
    sourceSystem: '',
    sourceTable: '',
    granularity: '',
    unit: '万',
    accessMethod: '',
    sourceField: '',
  });

  const [statDataRatio, setStatDataRatio] = useState<DataSourceConfig>({
    type: '占比',
    format: '百分比',
    sourceSystem: '',
    sourceTable: '',
    granularity: '',
    unit: '%',
    accessMethod: '',
    sourceField: '',
  });

  // 标签特征统计数据取值来源
  const [featureDataValue, setFeatureDataValue] = useState<DataSourceConfig>({
    type: '数值',
    format: '数值',
    sourceSystem: '',
    sourceTable: '',
    granularity: '',
    unit: '万',
    accessMethod: '',
    sourceField: '',
  });

  const [featureDataRatio, setFeatureDataRatio] = useState<DataSourceConfig>({
    type: '占比',
    format: '百分比',
    sourceSystem: '',
    sourceTable: '',
    granularity: '',
    unit: '%',
    accessMethod: '',
    sourceField: '',
  });

  // 加载数据
  useEffect(() => {
    // TODO: 从API加载数据
    // 这里使用模拟数据
    setTagType(mockTagData.tagType as '固定标签' | '自定义标签');
    setTagCode(mockTagData.tagCode);
    setTagName(mockTagData.tagName);
    setTagGroup(mockTagData.tagGroup);
    setBusinessDefinition(mockTagData.businessDefinition);
    setTechnicalDefinition(mockTagData.technicalDefinition);
    setValueType(mockTagData.valueType);
    setTagValues(mockTagData.tagValues);

    if (mockTagData.tagType === '固定标签') {
      setStatDataValue(mockTagData.statDataValue);
      setStatDataRatio(mockTagData.statDataRatio);
      setFeatureDataValue(mockTagData.featureDataValue);
      setFeatureDataRatio(mockTagData.featureDataRatio);
    }
  }, [tagId]);

  // 添加标签取值
  const addTagValue = () => {
    setTagValues([...tagValues, { value: '', meaning: '' }]);
  };

  // 删除标签取值
  const removeTagValue = (index: number) => {
    if (tagValues.length > 1) {
      setTagValues(tagValues.filter((_, i) => i !== index));
    }
  };

  // 更新标签取值
  const updateTagValue = (index: number, field: 'value' | 'meaning', value: string) => {
    const newValues = [...tagValues];
    newValues[index][field] = value;
    setTagValues(newValues);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    // TODO: 提交逻辑
    console.log('更新数据:', {
      id: tagId,
      tagCode,
      tagName,
      tagGroup,
      businessDefinition,
      technicalDefinition,
      valueType,
      tagValues,
      statDataValue: tagType === '固定标签' ? statDataValue : undefined,
      statDataRatio: tagType === '固定标签' ? statDataRatio : undefined,
      featureDataValue: tagType === '固定标签' ? featureDataValue : undefined,
      featureDataRatio: tagType === '固定标签' ? featureDataRatio : undefined,
    });
    router.push('/workspace/insight/tags/customer');
  };

  // 渲染数据来源配置卡片
  const renderDataSourceConfig = (
    title: string,
    config: DataSourceConfig,
    setConfig: React.Dispatch<React.SetStateAction<DataSourceConfig>>
  ) => (
    <Card className="p-4 flex-1">
      <div className="text-sm font-medium text-gray-700 mb-4">{title}</div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>类型</Label>
            <Select value={config.type} onValueChange={(v) => setConfig({ ...config, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>格式</Label>
            <RadioGroup
              value={config.format}
              onValueChange={(v) => setConfig({ ...config, format: v })}
              className="flex items-center gap-4 mt-2"
            >
              {formatOptions.map((opt) => (
                <div key={opt} className="flex items-center">
                  <RadioGroupItem value={opt} id={`${title}-${opt}-edit`} className="mr-1.5" />
                  <Label htmlFor={`${title}-${opt}-edit`} className="text-sm cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>数据来源系统</Label>
          <Select value={config.sourceSystem} onValueChange={(v) => setConfig({ ...config, sourceSystem: v })}>
            <SelectTrigger>
              <SelectValue placeholder="请选择数据来源系统" />
            </SelectTrigger>
            <SelectContent>
              {sourceSystems.map((sys) => (
                <SelectItem key={sys} value={sys}>{sys}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>数据源表</Label>
          <Select value={config.sourceTable} onValueChange={(v) => setConfig({ ...config, sourceTable: v })}>
            <SelectTrigger>
              <SelectValue placeholder="请选择数据源表" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_behavior_table">用户行为表</SelectItem>
              <SelectItem value="order_table">订单表</SelectItem>
              <SelectItem value="product_table">产品表</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>最小粒度</Label>
            <Select value={config.granularity} onValueChange={(v) => setConfig({ ...config, granularity: v })}>
              <SelectTrigger>
                <SelectValue placeholder="请选择最小粒度" />
              </SelectTrigger>
              <SelectContent>
                {granularities.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>单位</Label>
            <Select value={config.unit} onValueChange={(v) => setConfig({ ...config, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>数据接入方式</Label>
          <Select value={config.accessMethod} onValueChange={(v) => setConfig({ ...config, accessMethod: v })}>
            <SelectTrigger>
              <SelectValue placeholder="请选择数据接入方式" />
            </SelectTrigger>
            <SelectContent>
              {accessMethods.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block"><span className="text-red-500">*</span>数据源字段</Label>
          <Select value={config.sourceField} onValueChange={(v) => setConfig({ ...config, sourceField: v })}>
            <SelectTrigger>
              <SelectValue placeholder="请选择数据源字段" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_id">user_id</SelectItem>
              <SelectItem value="order_amount">order_amount</SelectItem>
              <SelectItem value="product_id">product_id</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 页面标题 */}
        <h1 className="text-xl font-semibold text-blue-600 mb-6">编辑标签</h1>

        {/* 标签编辑模块 */}
        <Card className="mb-6 p-6">
          <div className="flex items-center mb-6">
            <div className="w-1 h-5 bg-blue-600 mr-2"></div>
            <h2 className="text-base font-medium text-gray-900">标签编辑</h2>
          </div>

          {/* 标签类型（不可修改） */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <Label className="text-sm mb-2 block"><span className="text-red-500">*</span>标签类型</Label>
            <div className="flex items-center gap-8">
              <span className={`inline-flex items-center px-3 py-1.5 text-sm rounded ${
                tagType === '固定标签' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                固定标签
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 text-sm rounded ${
                tagType === '自定义标签' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                自定义标签
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">标签类型创建后不可修改</p>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* 左栏 */}
            <div className="space-y-4">
              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>标签编码
                </Label>
                <Input
                  placeholder="请输入标签编码"
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>标签分组
                </Label>
                <Select value={tagGroup} onValueChange={setTagGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择标签分组" />
                  </SelectTrigger>
                  <SelectContent>
                    {tagGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>技术口径
                </Label>
                <Textarea
                  placeholder="请输入技术口径"
                  value={technicalDefinition}
                  onChange={(e) => setTechnicalDefinition(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>标签取值类型
                </Label>
                <Select value={valueType} onValueChange={setValueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择标签取值类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {valueTypes.map((vt) => (
                      <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 右栏 */}
            <div className="space-y-4">
              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>标签名称
                </Label>
                <Input
                  placeholder="请输入标签名称"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-1.5 text-sm">
                  <span className="text-red-500">*</span>业务口径
                </Label>
                <Textarea
                  placeholder="请输入业务口径"
                  value={businessDefinition}
                  onChange={(e) => setBusinessDefinition(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Label className="text-sm">
                    <span className="text-red-500">*</span>标签取值
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[250px]">
                        <p className="text-xs">标签值和中文含义成对填写，如：标签值"1"，中文含义"男"</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  {tagValues.map((tv, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="标签值"
                        value={tv.value}
                        onChange={(e) => updateTagValue(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-gray-400">:</span>
                      <Input
                        placeholder="中文含义"
                        value={tv.meaning}
                        onChange={(e) => updateTagValue(index, 'meaning', e.target.value)}
                        className="flex-1"
                      />
                      {tagValues.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => removeTagValue(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {index === tagValues.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                          onClick={addTagValue}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 标签统计数据取值来源 - 仅固定标签显示 */}
        {tagType === '固定标签' && (
          <Card className="mb-6 p-6">
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-blue-600 mr-2"></div>
              <h2 className="text-base font-medium text-gray-900">标签统计数据取值来源</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {renderDataSourceConfig('数值', statDataValue, setStatDataValue)}
              {renderDataSourceConfig('占比', statDataRatio, setStatDataRatio)}
            </div>
          </Card>
        )}

        {/* 标签特征统计数据取值来源 - 仅固定标签显示 */}
        {tagType === '固定标签' && (
          <Card className="mb-6 p-6">
            <div className="flex items-center mb-6">
              <div className="w-1 h-5 bg-blue-600 mr-2"></div>
              <h2 className="text-base font-medium text-gray-900">标签特征统计数据取值来源</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {renderDataSourceConfig('数值', featureDataValue, setFeatureDataValue)}
              {renderDataSourceConfig('占比', featureDataRatio, setFeatureDataRatio)}
            </div>
          </Card>
        )}

        {/* 底部操作按钮 */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Check className="h-4 w-4" />
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
