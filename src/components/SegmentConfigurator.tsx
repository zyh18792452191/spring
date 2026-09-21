'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { CustomerSegment, TagCondition, Operator } from '@/types/customerTag';
import { getOperatorsByType, getOperatorLabel } from '@/types/customerTag';
import { getTagById } from '@/data/customerTags';

// 客群规模计算结果类型
export interface SegmentCalculationResult {
  customerScale: number; // 客群规模（单位：万）
  estimatedTime: number; // 预估耗时（单位：分钟）
  warningLevel: 'normal' | 'warning' | 'danger' | 'critical'; // 警告级别
  warningMessage: string; // 提示语
}

interface SegmentConfiguratorProps {
  segment: CustomerSegment;
  onChange: (segment: CustomerSegment) => void;
  readOnly?: boolean;
  selectedTags?: string[]; // 已选中的客户标签ID列表
  onAddTag?: () => void; // 添加标签的回调（用于弹出标签选择器）
  onCalculationResult?: (result: SegmentCalculationResult | null) => void; // 计算结果回调
  onValidationError?: (message: string) => void; // 校验错误回调
}

// 标签条件配置项组件
const TagConditionItem = ({
  condition,
  index,
  onChange,
  onRemove,
  readOnly
}: {
  condition: TagCondition;
  index: number;
  onChange: (index: number, condition: TagCondition) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}) => {
  const tag = getTagById(condition.tagId);

  const handleOperatorChange = (operator: Operator) => {
    onChange(index, {
      ...condition,
      operator,
      value: { singleValue: undefined, rangeValue: undefined, multipleValue: undefined }
    });
  };

  const renderValueInput = () => {
    switch (condition.tagType) {
      case 'boolean':
        return (
          <select
            value={condition.value.singleValue === true ? 'true' : condition.value.singleValue === false ? 'false' : ''}
            onChange={(e) => onChange(index, {
              ...condition,
              value: {
                singleValue: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined,
                rangeValue: undefined,
                multipleValue: undefined
              }
            })}
            disabled={readOnly}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        );

      case 'number':
        if (condition.operator === 'between') {
          const currentRange = condition.value.rangeValue || { min: 0, max: 0 };
          return (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="number"
                value={currentRange.min !== undefined ? String(currentRange.min) : ''}
                onChange={(e) => onChange(index, {
                  ...condition,
                  value: {
                    singleValue: undefined,
                    rangeValue: { min: Number(e.target.value), max: currentRange.max },
                    multipleValue: undefined
                  }
                })}
                disabled={readOnly}
                placeholder="最小值"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={currentRange.max !== undefined ? String(currentRange.max) : ''}
                onChange={(e) => onChange(index, {
                  ...condition,
                  value: {
                    singleValue: undefined,
                    rangeValue: { min: currentRange.min, max: Number(e.target.value) },
                    multipleValue: undefined
                  }
                })}
                disabled={readOnly}
                placeholder="最大值"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        } else {
          return (
            <input
              type="number"
              value={condition.value.singleValue !== undefined ? String(condition.value.singleValue) : ''}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                onChange(index, {
                  ...condition,
                  value: {
                    singleValue: isNaN(numValue) ? undefined : numValue,
                    rangeValue: undefined,
                    multipleValue: undefined
                  }
                });
              }}
              disabled={readOnly}
              placeholder="请输入数值"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        }

      case 'percentage':
        if (condition.operator === 'between') {
          const currentRange = condition.value.rangeValue || { min: 0, max: 0 };
          return (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={currentRange.min !== undefined ? String(currentRange.min) : ''}
                onChange={(e) => onChange(index, {
                  ...condition,
                  value: {
                    singleValue: undefined,
                    rangeValue: { min: Number(e.target.value), max: currentRange.max },
                    multipleValue: undefined
                  }
                })}
                disabled={readOnly}
                placeholder="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                max="100"
                value={currentRange.max !== undefined ? String(currentRange.max) : ''}
                onChange={(e) => onChange(index, {
                  ...condition,
                  value: {
                    singleValue: undefined,
                    rangeValue: { min: currentRange.min, max: Number(e.target.value) },
                    multipleValue: undefined
                  }
                })}
                disabled={readOnly}
                placeholder="100"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">%</span>
            </div>
          );
        } else {
          return (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={condition.value.singleValue !== undefined ? String(condition.value.singleValue) : ''}
                onChange={(e) => {
                  const numValue = Number(e.target.value);
                  onChange(index, {
                    ...condition,
                    value: {
                      singleValue: isNaN(numValue) ? undefined : numValue,
                      rangeValue: undefined,
                      multipleValue: undefined
                    }
                  });
                }}
                disabled={readOnly}
                placeholder="请输入百分比"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">%</span>
            </div>
          );
        }

      case 'enum':
        if (condition.operator === 'in') {
          return (
            <select
              multiple
              value={condition.value.multipleValue || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                onChange(index, {
                  ...condition,
                  value: {
                    singleValue: undefined,
                    rangeValue: undefined,
                    multipleValue: selected
                  }
                });
              }}
              disabled={readOnly}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={Math.min(5, tag?.options?.length || 3)}
            >
              {tag?.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        } else {
          return (
            <select
              value={condition.value.singleValue !== undefined ? String(condition.value.singleValue) : ''}
              onChange={(e) => onChange(index, {
                ...condition,
                value: {
                  singleValue: e.target.value,
                  rangeValue: undefined,
                  multipleValue: undefined
                }
              })}
              disabled={readOnly}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              {tag?.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        }

      case 'string':
        return (
          <input
            type="text"
            value={condition.value.singleValue !== undefined ? String(condition.value.singleValue) : ''}
            onChange={(e) => onChange(index, {
              ...condition,
              value: {
                singleValue: e.target.value,
                rangeValue: undefined,
                multipleValue: undefined
              }
            })}
            disabled={readOnly}
            placeholder="请输入文本"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 grid grid-cols-12 gap-3 items-center">
        {/* 标签名称 */}
        <div className="col-span-3">
          <div className="text-sm font-medium text-gray-900">
            {tag?.name || condition.tagName}
          </div>
          <div className="text-xs text-gray-500">{tag?.id}</div>
        </div>

        {/* 操作符 */}
        <div className="col-span-3">
          <select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value as Operator)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getOperatorsByType(condition.tagType).map(op => (
              <option key={op} value={op}>{getOperatorLabel(op)}</option>
            ))}
          </select>
        </div>

        {/* 值 */}
        <div className="col-span-5">
          {renderValueInput()}
        </div>

        {/* 删除按钮 */}
        <div className="col-span-1 flex justify-end">
          {!readOnly && (
            <button
              onClick={() => onRemove(index)}
              className="mt-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SegmentConfigurator({
  segment,
  onChange,
  readOnly = false,
  selectedTags,
  onAddTag,
  onCalculationResult,
  onValidationError
}: SegmentConfiguratorProps) {
  // 计算结果状态
  const [calculationResult, setCalculationResult] = useState<SegmentCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 更新条件
  const handleConditionChange = (index: number, condition: TagCondition) => {
    const newConditions = [...segment.tagConditions];
    newConditions[index] = condition;
    onChange({ ...segment, tagConditions: newConditions });

    // 清空之前的计算结果
    if (calculationResult) {
      setCalculationResult(null);
      onCalculationResult?.(null);
    }
  };

  // 删除条件
  const handleRemoveCondition = (index: number) => {
    const newConditions = segment.tagConditions.filter((_, i) => i !== index);
    onChange({ ...segment, tagConditions: newConditions });

    // 清空之前的计算结果
    if (calculationResult) {
      setCalculationResult(null);
      onCalculationResult?.(null);
    }
  };

  // 模拟计算客群规模
  const handleCalculateSegment = () => {
    // 校验客户标签是否已选择
    if (!selectedTags || selectedTags.length === 0) {
      onValidationError?.('请先选择客户标签');
      return;
    }

    // 校验条件是否已配置（检查每个条件是否有有效的值）
    const hasIncompleteConditions = segment.tagConditions.some(cond => {
      const { singleValue, rangeValue, multipleValue } = cond.value;
      // 检查是否没有任何值
      const hasNoValue =
        (singleValue === undefined || singleValue === null || singleValue === '') &&
        (!rangeValue || (rangeValue.min === undefined && rangeValue.max === undefined)) &&
        (!multipleValue || multipleValue.length === 0);

      return hasNoValue;
    });

    if (hasIncompleteConditions) {
      onValidationError?.('请为每个客户标签配置条件');
      return;
    }

    setIsCalculating(true);

    // 模拟计算延迟（500ms）
    setTimeout(() => {
      // 模拟计算逻辑：基于标签条件数量和复杂度
      const conditionCount = segment.tagConditions.length;
      const complexityScore = segment.tagConditions.reduce((score, cond) => {
        // 布尔类型权重最低
        if (cond.tagType === 'boolean') return score + 1;
        // 数值类型权重中等
        if (cond.tagType === 'number' || cond.tagType === 'percentage') return score + 2;
        // 枚举类型权重最高
        if (cond.tagType === 'enum') return score + 3;
        return score;
      }, 0);

      // 模拟客群规模（单位：万）：基于标签条件数量和复杂度
      // 条件越多，客群规模越小；复杂度越高，客群规模越小
      const baseScale = 5000; // 基础规模 5000 万
      const conditionReduction = conditionCount * 500; // 每个条件减少 500 万
      const complexityReduction = complexityScore * 200; // 每个复杂度减少 200 万
      const customerScale = Math.max(1, Math.floor((baseScale - conditionReduction - complexityReduction) * (0.5 + Math.random() * 0.5)));

      // 模拟预估耗时（单位：分钟）：基于客群规模
      // 客群规模越大，耗时越长
      // 假设每处理 100 万客户需要 1-2 分钟
      const baseTime = Math.ceil(customerScale / 100 * (1 + Math.random() * 1));

      // 确定警告级别和提示语
      let warningLevel: 'normal' | 'warning' | 'danger' | 'critical' = 'normal';
      let warningMessage = '';

      if (baseTime < 30) {
        // 30分钟以下：不展示提示语
        warningLevel = 'normal';
        warningMessage = '';
      } else if (baseTime < 60) {
        warningLevel = 'danger';
        warningMessage = `🚨 当前客群规模过大，客户清单生成预计耗时约 ${baseTime} 分钟，可能导致系统性能问题，强烈建议通过增加标签筛选条件来缩小客群范围。`;
      } else {
        warningLevel = 'critical';
        warningMessage = `❌ 当前客群规模过大，客户清单生成预计耗时约 ${baseTime} 分钟，严重影响指标树调度性能，必须重新设计标签筛选条件。`;
      }

      const result: SegmentCalculationResult = {
        customerScale,
        estimatedTime: baseTime,
        warningLevel,
        warningMessage
      };

      setCalculationResult(result);
      onCalculationResult?.(result);
      setIsCalculating(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* 标题和说明 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">客群条件配置</h3>
          <p className="text-sm text-gray-500">
            为每个标签配置筛选条件，所有条件之间为{segment.logic === 'AND' ? 'AND（与）' : 'OR（或）'}关系
          </p>
        </div>
        {!readOnly && onAddTag && (
          <button
            onClick={onAddTag}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加标签
          </button>
        )}
      </div>

      {/* 计算客群规模区域 */}
      {!readOnly && (
        <div className="space-y-3">
          {/* 计算按钮 */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCalculateSegment}
                disabled={isCalculating || segment.tagConditions.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Calculator className="w-4 h-4" />
                {isCalculating ? '计算中...' : '计算客群规模'}
              </button>
            </div>
          </div>

          {/* 计算结果展示 */}
          {calculationResult && (
            <div className={`p-4 rounded-lg border ${
              calculationResult.warningLevel === 'normal'
                ? 'bg-blue-50 border-blue-200'
                : calculationResult.warningLevel === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : calculationResult.warningLevel === 'danger'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`flex items-center ${calculationResult.estimatedTime >= 30 ? 'gap-6' : ''}`}>
                {/* 客群规模 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">客群规模</div>
                  <div className={`text-xl font-bold ${
                    calculationResult.warningLevel === 'normal'
                      ? 'text-blue-600'
                      : calculationResult.warningLevel === 'warning'
                      ? 'text-yellow-600'
                      : calculationResult.warningLevel === 'danger'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {calculationResult.customerScale.toLocaleString()} 万
                  </div>
                </div>

                {/* 预估耗时 - 始终显示 */}
                <div>
                  <div className="text-xs text-gray-600 mb-1">预估耗时</div>
                  <div className={`text-xl font-bold ${
                    calculationResult.warningLevel === 'normal'
                      ? 'text-blue-600'
                      : calculationResult.warningLevel === 'warning'
                      ? 'text-yellow-600'
                      : calculationResult.warningLevel === 'danger'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {calculationResult.estimatedTime} 分钟
                  </div>
                </div>
              </div>

              {/* 提示语 - 30分钟以上才显示 */}
              {calculationResult.estimatedTime >= 30 && calculationResult.warningMessage && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className={`text-sm ${
                    calculationResult.warningLevel === 'warning'
                      ? 'text-yellow-800'
                      : calculationResult.warningLevel === 'danger'
                      ? 'text-orange-800'
                      : 'text-red-800'
                  }`}>
                    {calculationResult.warningMessage}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 条件列表 */}
      <div className="space-y-3">
        {segment.tagConditions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
            暂无标签条件，点击"添加标签"开始配置
          </div>
        ) : (
          segment.tagConditions.map((condition, index) => (
            <TagConditionItem
              key={condition.tagId}
              condition={condition}
              index={index}
              onChange={handleConditionChange}
              onRemove={handleRemoveCondition}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
