"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 业务场景数据结构
export interface BusinessScenarioItem {
  id: string;
  name: string;
  children?: BusinessScenarioItem[];
}

export interface BusinessScenarioSelectProps {
  value: string[]; // 已选中的业务场景数组
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

// 业务场景数据
const BUSINESS_SCENARIOS: BusinessScenarioItem[] = [
  {
    id: 'public_market',
    name: '公众市场',
    children: [
      {
        id: 'customer_operation',
        name: '客户运营',
        children: [
          { id: 'mid_high_end', name: '中高端客户运营' },
          { id: 'churn_retention', name: '离网维系' },
          { id: 'international_operation', name: '国际业务运营' },
          { id: 'home_operation', name: '家庭运营' },
          { id: 'usage_operation', name: '用量运营' },
          { id: 'integration_operation', name: '融合运营' },
          { id: 'segment_market_operation', name: '细分市场运营' },
        ],
      },
      {
        id: 'market_operation',
        name: '市场运营',
        children: [],
      },
      {
        id: 'product_operation',
        name: '产品运营',
        children: [],
      },
      {
        id: 'channel_operation',
        name: '渠道运营',
        children: [],
      },
    ],
  },
  {
    id: 'enterprise_market',
    name: '政企市场',
    children: [],
  },
  {
    id: 'home_market',
    name: '家庭市场',
    children: [],
  },
  {
    id: 'product_market',
    name: '产品市场',
    children: [],
  },
];

export default function BusinessScenarioSelect({
  value,
  onChange,
  disabled = false,
}: BusinessScenarioSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedPath, setSelectedPath] = useState<{ level1?: string; level2?: string }>({});
  const [level2Options, setLevel2Options] = useState<BusinessScenarioItem[]>([]);
  const [level3Options, setLevel3Options] = useState<BusinessScenarioItem[]>([]);

  // 初始化已选中的业务场景显示
  useEffect(() => {
    // 这里可以根据已选的value值恢复面包屑状态
    // 由于是多选，暂时不做复杂的恢复逻辑
  }, [value]);

  const handleLevel1Click = (option: BusinessScenarioItem) => {
    setSelectedPath({ level1: option.name });
    setCurrentLevel(2);

    if (option.children && option.children.length > 0) {
      setLevel2Options(option.children);
    } else {
      // 没有二级选项，直接选中
      toggleSelection(option.name);
    }
  };

  const handleLevel2Click = (option: BusinessScenarioItem) => {
    setSelectedPath((prev) => ({ ...prev, level2: option.name }));
    setCurrentLevel(3);

    if (option.children && option.children.length > 0) {
      setLevel3Options(option.children);
    } else {
      // 没有三级选项，直接选中
      const selectedValue = `${selectedPath.level1} / ${option.name}`;
      toggleSelection(selectedValue);
    }
  };

  const handleLevel3Click = (option: BusinessScenarioItem) => {
    const selectedValue = `${selectedPath.level1} / ${selectedPath.level2} / ${option.name}`;
    toggleSelection(selectedValue);
    // 保持打开状态，方便继续选择
  };

  const handleBackToLevel1 = () => {
    setCurrentLevel(1);
    setSelectedPath({});
  };

  const handleBackToLevel2 = () => {
    setCurrentLevel(2);
    setSelectedPath((prev) => ({ ...prev, level2: undefined }));
  };

  const toggleSelection = (scenarioName: string) => {
    if (value.includes(scenarioName)) {
      // 已选中，移除
      onChange(value.filter(v => v !== scenarioName));
    } else {
      // 未选中，添加（限制最多5个）
      if (value.length >= 5) {
        alert('最多只能选择5个业务场景');
        return;
      }
      onChange([...value, scenarioName]);
    }
  };

  const removeSelection = (scenarioName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== scenarioName));
  };

  const isSelected = (scenarioName: string) => {
    return value.includes(scenarioName);
  };

  return (
    <div className="relative">
      {/* 已选中的业务场景 */}
      <div className="flex flex-wrap gap-2 min-h-[36px] p-2 border border-gray-300 rounded-md bg-white">
        {value.length === 0 ? (
          <span
            className="text-gray-400 text-sm cursor-pointer flex-1"
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            请选择业务场景（最多5个）
          </span>
        ) : (
          value.map((scenario) => (
            <Badge
              key={scenario}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {scenario}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(e) => !disabled && removeSelection(scenario, e)}
              />
            </Badge>
          ))
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 下拉面板 */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start gap-4">
            {/* 第一级 */}
            <div className="flex-shrink-0 w-32">
              <div className="text-sm font-medium text-gray-900 mb-2">一级分类</div>
              <div className="space-y-1">
                {BUSINESS_SCENARIOS.map((option) => (
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
              <div className="flex-shrink-0 w-40 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">二级分类</div>
                <div className="space-y-1">
                  {level2Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel2Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                        selectedPath.level2 === option.name ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{option.name}</span>
                      {option.children && option.children.length > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    </button>
                  ))}
                  {level2Options.length === 0 && (
                    <div className="text-sm text-gray-500 py-2">无二级分类</div>
                  )}
                </div>
              </div>
            )}

            {/* 第三级 */}
            {currentLevel >= 3 && selectedPath.level2 && (
              <div className="flex-shrink-0 w-40 border-l border-gray-200 pl-4">
                <div className="text-sm font-medium text-gray-900 mb-2">三级分类</div>
                <div className="space-y-1">
                  {level3Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel3Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        isSelected(option.name) || isSelected(`${selectedPath.level1} / ${selectedPath.level2} / ${option.name}`)
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{option.name}</span>
                      {isSelected(option.name) && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                  {level3Options.length === 0 && (
                    <div className="text-sm text-gray-500 py-2">无三级分类</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={handleBackToLevel1}>
              返回一级
            </Button>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">
                已选择 {value.length}/5 个业务场景
              </span>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                完成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
