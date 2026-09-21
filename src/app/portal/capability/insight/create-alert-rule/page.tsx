'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

function CreateAlertRuleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [metricName, setMetricName] = useState('');
  const [metricId, setMetricId] = useState('');

  // 从 URL 参数获取指标名称和ID
  useEffect(() => {
    const metricNameParam = searchParams.get('metricName');
    const metricIdParam = searchParams.get('metricId');
    if (metricNameParam) {
      setMetricName(metricNameParam);
    }
    if (metricIdParam) {
      setMetricId(metricIdParam);
    }
  }, [searchParams]);

  const [alertName, setAlertName] = useState('');
  const [metricGroup, setMetricGroup] = useState('');
  const [alertLevel, setAlertLevel] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [granularity, setGranularity] = useState('');
  const [scope, setScope] = useState('');

  const [frequency, setFrequency] = useState('天');
  const [reminderTime, setReminderTime] = useState('');
  const [sendSms, setSendSms] = useState<'yes' | 'no'>('no');
  const [reminderDays, setReminderDays] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const [rules, setRules] = useState([
    {
      id: 1,
      metric: metricName,
      ruleType: '按指标值计算',
      operator: '',
      value: '',
      logic: '且',
    },
  ]);

  // 当指标名称变化时，更新第一条规则的指标
  useEffect(() => {
    if (metricName) {
      setRules([
        {
          ...rules[0],
          metric: metricName,
        },
      ]);
    }
  }, [metricName]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        metric: '',
        ruleType: '按指标值计算',
        operator: '',
        value: '',
        logic: '且',
      },
    ]);
  };

  const removeRule = (id: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const updateRule = (id: number, field: string, value: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  const handleBack = () => {
    const params = new URLSearchParams();
    params.set('view', 'metric');
    if (metricId) {
      params.set('scrollTo', metricId);
    }
    router.push(`/portal/capability/insight/overview?${params.toString()}`);
  };

  const handleSave = () => {
    // TODO: 保存逻辑
    console.log('保存数据:', {
      alertName,
      metricName,
      metricId,
      alertLevel,
      description,
      rules,
      frequency,
      reminderTime,
      sendSms,
      reminderDays,
      effectiveDate,
    });
    const params = new URLSearchParams();
    params.set('view', 'metric');
    if (metricId) {
      params.set('scrollTo', metricId);
    }
    router.push(`/portal/capability/insight/overview?${params.toString()}`);
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
          <h2 className="text-lg font-semibold text-gray-900">新增预警规则</h2>
          {metricName && (
            <span className="text-sm text-gray-500">
              - {metricName}
            </span>
          )}
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

      {/* 表单内容 */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* 基本信息区块 */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">基本信息</h2>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* 第一行 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 预警名称
                </Label>
                <Input
                  placeholder="请输入"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 指标名称
                </Label>
                <Input
                  placeholder="请选择"
                  value={metricName}
                  readOnly
                  className="mt-1.5 h-9 bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 预警等级
                </Label>
                <Select value={alertLevel} onValueChange={setAlertLevel}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="红色">红色</SelectItem>
                    <SelectItem value="橙色">橙色</SelectItem>
                    <SelectItem value="黄色">黄色</SelectItem>
                    <SelectItem value="蓝色">蓝色</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 预警分组
                </Label>
                <Select value={metricGroup} onValueChange={setMetricGroup}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group1">离网预警组</SelectItem>
                    <SelectItem value="group2">业务预警组</SelectItem>
                    <SelectItem value="group3">运营预警组</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 第二行 */}
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  预警描述
                </Label>
                <Textarea
                  placeholder="请输入预警描述"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              {/* 第三行 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 归属区域
                </Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全国</SelectItem>
                    <SelectItem value="group">集团</SelectItem>
                    <SelectItem value="wulumuqi">乌鲁木齐</SelectItem>
                    <SelectItem value="kelamayi">克拉玛依</SelectItem>
                    <SelectItem value="tulufan">吐鲁番</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 指标粒度
                </Label>
                <Select value={granularity} onValueChange={setGranularity}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="province">省</SelectItem>
                    <SelectItem value="city">地市</SelectItem>
                    <SelectItem value="district">区县</SelectItem>
                    <SelectItem value="grid">网格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 第四行 */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 监控范围
                </Label>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="north">北方</SelectItem>
                    <SelectItem value="south">南方</SelectItem>
                    <SelectItem value="east">东方</SelectItem>
                    <SelectItem value="west">西方</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div></div>
            </div>
          </Card>
        </div>

        {/* 触发规则区块 */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">触发规则</h2>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      规则 {index + 1}
                    </span>
                    {rules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                        className="text-red-600 hover:text-red-700 h-8"
                      >
                        删除
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        <span className="text-red-500">*</span> 指标
                      </Label>
                      <Input
                        placeholder="请选择指标"
                        value={rule.metric}
                        onChange={(e) => updateRule(rule.id, 'metric', e.target.value)}
                        className="mt-1.5 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        <span className="text-red-500">*</span> 规则类型
                      </Label>
                      <Select value={rule.ruleType} onValueChange={(value) => updateRule(rule.id, 'ruleType', value)}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="按指标值计算">按指标值计算</SelectItem>
                          <SelectItem value="按趋势计算">按趋势计算</SelectItem>
                          <SelectItem value="按同比计算">按同比计算</SelectItem>
                          <SelectItem value="按环比计算">按环比计算</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        <span className="text-red-500">*</span> 运算符
                      </Label>
                      <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, 'operator', value)}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">大于</SelectItem>
                          <SelectItem value="<">小于</SelectItem>
                          <SelectItem value="=">等于</SelectItem>
                          <SelectItem value=">=">大于等于</SelectItem>
                          <SelectItem value="<=">小于等于</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        <span className="text-red-500">*</span> 阈值
                      </Label>
                      <Input
                        placeholder="请输入"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                        className="mt-1.5 h-9"
                      />
                    </div>
                  </div>

                  {index < rules.length - 1 && (
                    <div className="mt-4">
                      <Select value={rule.logic} onValueChange={(value) => updateRule(rule.id, 'logic', value)}>
                        <SelectTrigger className="h-8 w-32 mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="且">且</SelectItem>
                          <SelectItem value="或">或</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addRule}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加规则
              </Button>
            </div>
          </Card>
        </div>

        {/* 告警设置区块 */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
            <h2 className="text-base font-semibold text-gray-900">告警设置</h2>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 频率
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="mt-1.5 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="天">天</SelectItem>
                    <SelectItem value="周">周</SelectItem>
                    <SelectItem value="月">月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 告警时间
                </Label>
                <Input
                  placeholder="请输入"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  是否发送短信
                </Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sms"
                      value="yes"
                      checked={sendSms === 'yes'}
                      onChange={() => setSendSms('yes')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">是</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sms"
                      value="no"
                      checked={sendSms === 'no'}
                      onChange={() => setSendSms('no')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">否</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  提前提醒天数
                </Label>
                <Input
                  placeholder="请输入"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> 生效日期
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="h-9 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreateAlertRulePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateAlertRuleContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
