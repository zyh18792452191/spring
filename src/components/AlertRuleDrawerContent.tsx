'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar } from 'lucide-react';

interface AlertRule {
  id: string;
  ruleName: string;
  metricName: string;
  condition: string;
  level: string;
  status: string;
}

interface RuleItem {
  id: number;
  metric: string;
  ruleType: string;
  operator: string;
  value: string;
  logic: string;
}

interface AlertRuleDrawerContentProps {
  open: boolean;
  onClose: () => void;
  metricName: string;
  metricId: string;
  mode: 'view' | 'edit' | 'create';
  setMode: (mode: 'view' | 'edit' | 'create') => void;
  rule: AlertRule | null;
  containerMode?: boolean;
}

const AlertRuleDrawerContent: React.FC<AlertRuleDrawerContentProps> = ({
  open,
  onClose,
  metricName,
  metricId,
  mode,
  setMode,
  rule,
  containerMode = false,
}) => {
  const [formData, setFormData] = useState({
    alertName: '',
    metricName: metricName,
    alertLevel: '',
    metricGroup: '',
    description: '',
    region: '',
    granularity: '',
    scope: '',
    frequency: '天',
    reminderTime: '',
    sendSms: 'no',
    reminderDays: '',
    effectiveDate: '',
  });

  const [rules, setRules] = useState<RuleItem[]>([
    {
      id: 1,
      metric: metricName,
      ruleType: '按指标值计算',
      operator: '',
      value: '',
      logic: '且',
    },
  ]);

  // 初始化表单数据
  useEffect(() => {
    if (mode === 'view' || mode === 'edit') {
      if (rule) {
        setFormData({
          alertName: rule.ruleName,
          metricName: rule.metricName,
          alertLevel: rule.level,
          metricGroup: '',
          description: '',
          region: '',
          granularity: '',
          scope: '',
          frequency: '天',
          reminderTime: '',
          sendSms: 'no',
          reminderDays: '',
          effectiveDate: '',
        });
      }
    } else {
      // create模式，清空表单
      setFormData({
        alertName: '',
        metricName: metricName,
        alertLevel: '',
        metricGroup: '',
        description: '',
        region: '',
        granularity: '',
        scope: '',
        frequency: '天',
        reminderTime: '',
        sendSms: 'no',
        reminderDays: '',
        effectiveDate: '',
      });
      setRules([
        {
          id: 1,
          metric: metricName,
          ruleType: '按指标值计算',
          operator: '',
          value: '',
          logic: '且',
        },
      ]);
    }
  }, [rule, mode, metricName]);

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

  const handleSave = () => {
    console.log('保存预警规则:', { formData, rules });
    // TODO: 保存预警规则
    onClose();
  };

  const renderContent = () => {
    return (
      <div className="h-full flex flex-col">
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 基本信息区块 */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h3 className="text-base font-semibold text-gray-900">基本信息</h3>
              </div>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 预警名称 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 预警名称
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.alertName || '-'}
                      </div>
                    ) : (
                      <Input
                        placeholder="请输入"
                        value={formData.alertName}
                        onChange={(e) => setFormData({ ...formData, alertName: e.target.value })}
                        className="mt-1.5 h-9"
                      />
                    )}
                  </div>

                  {/* 指标名称 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 指标名称
                    </Label>
                    <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                      {formData.metricName}
                    </div>
                  </div>

                  {/* 预警等级 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 预警等级
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.alertLevel || '-'}
                      </div>
                    ) : (
                      <Select value={formData.alertLevel} onValueChange={(value) => setFormData({ ...formData, alertLevel: value })}>
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
                    )}
                  </div>

                  {/* 预警分组 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 预警分组
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.metricGroup || '-'}
                      </div>
                    ) : (
                      <Select value={formData.metricGroup} onValueChange={(value) => setFormData({ ...formData, metricGroup: value })}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="group1">离网预警组</SelectItem>
                          <SelectItem value="group2">业务预警组</SelectItem>
                          <SelectItem value="group3">运营预警组</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* 预警描述 */}
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      预警描述
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 min-h-[80px] p-3 bg-gray-50 rounded-md text-sm">
                        {formData.description || '-'}
                      </div>
                    ) : (
                      <Textarea
                        placeholder="请输入预警描述"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1.5 min-h-[80px]"
                      />
                    )}
                  </div>

                  {/* 归属区域 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 归属区域
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.region || '-'}
                      </div>
                    ) : (
                      <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全疆</SelectItem>
                          <SelectItem value="group">集团</SelectItem>
                          <SelectItem value="wulumuqi">乌鲁木齐</SelectItem>
                          <SelectItem value="kelamayi">克拉玛依</SelectItem>
                          <SelectItem value="tulufan">吐鲁番</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* 指标粒度 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 指标粒度
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.granularity || '-'}
                      </div>
                    ) : (
                      <Select value={formData.granularity} onValueChange={(value) => setFormData({ ...formData, granularity: value })}>
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
                    )}
                  </div>

                  {/* 监控范围 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 监控范围
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.scope || '-'}
                      </div>
                    ) : (
                      <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
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
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* 预警提醒区块（原告警设置） */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h3 className="text-base font-semibold text-gray-900">预警提醒</h3>
              </div>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 频率
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.frequency}
                      </div>
                    ) : (
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="天">天</SelectItem>
                          <SelectItem value="周">周</SelectItem>
                          <SelectItem value="月">月</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 告警时间
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.reminderTime || '-'}
                      </div>
                    ) : (
                      <Input
                        placeholder="请输入"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                        className="mt-1.5 h-9"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      是否发送短信
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.sendSms === 'yes' ? '是' : '否'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 mt-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sms"
                            value="yes"
                            checked={formData.sendSms === 'yes'}
                            onChange={() => setFormData({ ...formData, sendSms: 'yes' })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">是</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sms"
                            value="no"
                            checked={formData.sendSms === 'no'}
                            onChange={() => setFormData({ ...formData, sendSms: 'no' })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">否</span>
                        </label>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      提前提醒天数
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.reminderDays || '-'}
                      </div>
                    ) : (
                      <Input
                        placeholder="请输入"
                        value={formData.reminderDays}
                        onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                        className="mt-1.5 h-9"
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> 生效日期
                    </Label>
                    {mode === 'view' ? (
                      <div className="mt-1.5 h-9 flex items-center px-3 bg-gray-50 rounded-md text-sm">
                        {formData.effectiveDate || '-'}
                      </div>
                    ) : (
                      <div className="relative mt-1.5">
                        <Input
                          type="date"
                          value={formData.effectiveDate}
                          onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                          className="h-9 pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* 预警规则区块（原触发规则） */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h3 className="text-base font-semibold text-gray-900">预警规则</h3>
              </div>
              <Card className="p-6">
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          规则 {index + 1}
                        </span>
                        {mode !== 'view' && rules.length > 1 && (
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
                          {mode === 'view' ? (
                            <div className="mt-1.5 h-9 flex items-center px-3 bg-white rounded-md text-sm">
                              {rule.metric || '-'}
                            </div>
                          ) : (
                            <Input
                              placeholder="请选择指标"
                              value={rule.metric}
                              onChange={(e) => updateRule(rule.id, 'metric', e.target.value)}
                              className="mt-1.5 h-9"
                            />
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            <span className="text-red-500">*</span> 规则类型
                          </Label>
                          {mode === 'view' ? (
                            <div className="mt-1.5 h-9 flex items-center px-3 bg-white rounded-md text-sm">
                              {rule.ruleType}
                            </div>
                          ) : (
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
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            <span className="text-red-500">*</span> 运算符
                          </Label>
                          {mode === 'view' ? (
                            <div className="mt-1.5 h-9 flex items-center px-3 bg-white rounded-md text-sm">
                              {rule.operator || '-'}
                            </div>
                          ) : (
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
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            <span className="text-red-500">*</span> 阈值
                          </Label>
                          {mode === 'view' ? (
                            <div className="mt-1.5 h-9 flex items-center px-3 bg-white rounded-md text-sm">
                              {rule.value || '-'}
                            </div>
                          ) : (
                            <Input
                              placeholder="请输入"
                              value={rule.value}
                              onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                              className="mt-1.5 h-9"
                            />
                          )}
                        </div>
                      </div>

                      {index < rules.length - 1 && (
                        <div className="mt-4">
                          <Select value={rule.logic} onValueChange={(value) => updateRule(rule.id, 'logic', value)} disabled={mode === 'view'}>
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

                  {mode !== 'view' && (
                    <Button
                      variant="outline"
                      onClick={addRule}
                      className="w-full border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加规则
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-white shrink-0">
          {mode === 'view' ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setMode('edit');
                }}
              >
                修改
              </Button>
              <Button
                onClick={onClose}
              >
                关闭
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                保存
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // 根据containerMode决定渲染方式
  if (containerMode) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};

export default AlertRuleDrawerContent;
