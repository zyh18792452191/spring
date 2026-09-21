'use client';

import { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Layers } from 'lucide-react';
import CustomerTagSelector from './CustomerTagSelector';
import SegmentConfigurator, { SegmentCalculationResult } from './SegmentConfigurator';
import { CustomerTagNodeData, CustomerSegment, TagCondition } from '@/types/customerTag';
import { getTagById } from '@/data/customerTags';

interface CustomerTagConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerTagNodeData;
  onChange: (data: CustomerTagNodeData) => void;
}

export default function CustomerTagConfigModal({
  isOpen,
  onClose,
  data,
  onChange
}: CustomerTagConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'tags' | 'conditions'>('tags');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  const [tempSegment, setTempSegment] = useState<CustomerSegment>({
    id: '',
    name: '',
    tagConditions: [],
    logic: 'AND'
  });

  // 计算结果状态
  const [calculationResult, setCalculationResult] = useState<SegmentCalculationResult | null>(null);

  // 错误提示状态
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 当打开弹窗时，深拷贝传入的data
  useEffect(() => {
    if (isOpen && data) {
      setTempSelectedTags([...data.selectedTags]);
      setTempSegment({
        id: data.segment.id,
        name: data.segment.name,
        tagConditions: data.segment.tagConditions.map(cond => ({
          tagId: cond.tagId,
          tagName: cond.tagName,
          tagType: cond.tagType,
          operator: cond.operator,
          value: { ...cond.value }
        })),
        logic: data.segment.logic
      });
    }
  }, [isOpen, data]);

  // 当标签变化时，自动初始化这些标签的条件
  useEffect(() => {
    // 保留已配置的条件，移除不再选中的标签的条件
    const existingConditions = tempSegment.tagConditions.filter(
      cond => tempSelectedTags.includes(cond.tagId)
    );

    // 为新选中的标签添加默认条件
    const newConditions: TagCondition[] = [];
    tempSelectedTags.forEach(tagId => {
      // 如果已经有条件则跳过
      if (existingConditions.some(cond => cond.tagId === tagId)) {
        return;
      }

      const tag = getTagById(tagId);
      if (tag) {
        newConditions.push({
          tagId: tag.id,
          tagName: tag.name,
          tagType: tag.type,
          operator: 'equal',
          value: {}
        });
      }
    });

    // 更新客群分层
    setTempSegment({
      ...tempSegment,
      tagConditions: [...existingConditions, ...newConditions]
    });
  }, [tempSelectedTags]); // 只在标签变化时触发

  // 校验客户标签和条件是否已配置
  const validateConfiguration = (): boolean => {
    // 检查客户标签是否已选择
    if (tempSelectedTags.length === 0) {
      setErrorMessage('请先选择客户标签');
      return false;
    }

    // 检查条件是否已配置（检查每个条件是否有有效的值）
    const hasIncompleteConditions = tempSegment.tagConditions.some(cond => {
      const { singleValue, rangeValue, multipleValue } = cond.value;
      // 检查是否没有任何值
      const hasNoValue =
        (singleValue === undefined || singleValue === null || singleValue === '') &&
        (!rangeValue || (rangeValue.min === undefined && rangeValue.max === undefined)) &&
        (!multipleValue || multipleValue.length === 0);

      return hasNoValue;
    });

    if (hasIncompleteConditions) {
      setErrorMessage('请为每个客户标签配置条件');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    // 校验客户标签和条件是否已配置
    if (!validateConfiguration()) {
      // 如果校验失败，切换到配置条件标签页
      if (tempSelectedTags.length > 0) {
        setActiveTab('conditions');
      }
      return;
    }

    // 深拷贝数据，避免引用共享
    onChange({
      selectedTags: [...tempSelectedTags],
      segment: {
        id: tempSegment.id,
        name: tempSegment.name,
        tagConditions: tempSegment.tagConditions.map(cond => ({
          tagId: cond.tagId,
          tagName: cond.tagName,
          tagType: cond.tagType,
          operator: cond.operator,
          value: { ...cond.value }
        })),
        logic: tempSegment.logic
      }
    });
    onClose();
  };

  const handleTagSelectorConfirm = (selectedTags: string[]) => {
    setTempSelectedTags(selectedTags);
    setShowTagSelector(false);
    // 切换到条件配置标签页
    setActiveTab('conditions');
  };

  // 处理客群分层变化
  const handleSegmentChange = (segment: CustomerSegment) => {
    setTempSegment(segment);
    // 清除错误提示
    setErrorMessage(null);
  };

  // 处理计算结果
  const handleCalculationResult = (result: SegmentCalculationResult | null) => {
    setCalculationResult(result);
  };

  // 从条件配置页面打开标签选择器
  const handleAddTag = () => {
    setShowTagSelector(true);
  };

  // 获取选中的标签详情
  const selectedTagDetails = tempSelectedTags.map(tagId => getTagById(tagId)).filter(Boolean);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 遮罩层 */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* 弹窗 */}
        <div className="relative bg-white rounded-xl shadow-xl w-[1000px] max-h-[90vh] flex flex-col">
          {/* 标题 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">自定义客群配置</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => { setActiveTab('tags'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'tags'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TagIcon className="w-4 h-4" />
              选择标签
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tempSelectedTags.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('conditions'); setErrorMessage(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'conditions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              配置条件
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tempSegment.tagConditions.length}
              </span>
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 错误提示 */}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {activeTab === 'tags' ? (
              /* 标签选择 */
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setShowTagSelector(true)}
                    className="w-full py-3 px-4 text-sm text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    + 选择标签
                  </button>
                </div>

                {selectedTagDetails.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                    暂未选择标签，点击上方按钮选择
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 已选择 <span className="font-semibold">{tempSelectedTags.length}</span> 个标签，点击"配置条件"标签页为每个标签设置筛选条件。
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTagDetails.map((tag) => {
                        if (!tag) return null;
                        return (
                          <div
                            key={tag.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {tag.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="inline-block px-1.5 py-0.5 bg-white rounded text-gray-600 border border-gray-200">
                                {tag.type}
                              </span>
                              <span>{tag.category}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 条件配置 */
              <div>
                {tempSelectedTags.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                    请先在"选择标签"标签页选择标签
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        💡 为每个标签配置筛选条件，所有条件组合起来就是一个客群分层。
                        例如：年龄0-18岁 + 网龄10年以上 + ARPU 100-150元 + 离网方式"主动销号" = "年轻客户高网龄高消费主动离网客户"
                      </p>
                    </div>

                    <SegmentConfigurator
                      segment={tempSegment}
                      onChange={handleSegmentChange}
                      selectedTags={tempSelectedTags}
                      onAddTag={handleAddTag}
                      onCalculationResult={handleCalculationResult}
                      onValidationError={(message) => setErrorMessage(message)}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              已选择 {tempSelectedTags.length} 个标签，配置了 {tempSegment.tagConditions.length} 个条件
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={tempSelectedTags.length === 0 || (calculationResult !== null && (calculationResult.warningLevel === 'danger' || calculationResult.warningLevel === 'critical'))}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 标签选择器弹窗 */}
      <CustomerTagSelector
        isOpen={showTagSelector}
        onClose={() => setShowTagSelector(false)}
        selectedTags={tempSelectedTags}
        onConfirm={handleTagSelectorConfirm}
      />
    </>
  );
}
