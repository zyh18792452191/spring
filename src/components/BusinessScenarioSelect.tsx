'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, HelpCircle, X } from 'lucide-react';
import { businessScenarios, BusinessScenarioItem } from '@/lib/business-scenarios';

interface BusinessScenarioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 业务场景三级联动下拉框组件
 * 用于模板管理、场景管理、页面管理等模块的业务场景选择
 */
export function BusinessScenarioSelect({ value, onChange }: BusinessScenarioSelectProps) {
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
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
                      selectedPath.level1 === option.name
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{option.name}</span>
                    {option.children && option.children.length > 0 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 第二级 */}
            {currentLevel >= 2 && level2Options.length > 0 && (
              <div className="flex-shrink-0 w-32">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleBackToLevel1}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    返回
                  </button>
                  <div className="text-sm font-medium text-gray-900">二级分类</div>
                </div>
                <div className="space-y-1">
                  {level2Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel2Click(option)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                        selectedPath.level2 === option.name
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{option.name}</span>
                      {option.children && option.children.length > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 第三级 */}
            {currentLevel >= 3 && level3Options.length > 0 && (
              <div className="flex-shrink-0 w-32">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleBackToLevel2}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    返回
                  </button>
                  <div className="text-sm font-medium text-gray-900">三级分类</div>
                </div>
                <div className="space-y-1">
                  {level3Options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleLevel3Click(option)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-gray-700 hover:bg-gray-50"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
