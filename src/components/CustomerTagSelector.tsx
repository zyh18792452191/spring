'use client';

import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { CustomerTag, TagType } from '@/types/customerTag';
import { customerTags, getTagCategories, searchTags } from '@/data/customerTags';

interface CustomerTagSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onConfirm: (selectedTags: string[]) => void;
}

// 标签类型映射
const tagTypeLabels: Record<TagType, string> = {
  boolean: '是/否',
  number: '数值',
  percentage: '百分比',
  enum: '枚举',
  string: '文本',
};

export default function CustomerTagSelector({
  isOpen,
  onClose,
  selectedTags,
  onConfirm
}: CustomerTagSelectorProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>(selectedTags);
  const [isAllExpanded, setIsAllExpanded] = useState(true);

  if (!isOpen) return null;

  // 获取分类
  const categories = ['全部', ...getTagCategories()];

  // 过滤标签
  const filteredTags = searchTags(searchKeyword).filter(tag => {
    const categoryMatch = selectedCategory === 'all' || selectedCategory === '全部' || tag.category === selectedCategory;
    return categoryMatch;
  });

  // 按分类分组标签
  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, CustomerTag[]>);

  // 切换标签选中状态
  const toggleTag = (tagId: string) => {
    setTempSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = (select: boolean) => {
    if (select) {
      const allTagIds = filteredTags.map(tag => tag.id);
      setTempSelectedTags(prev => [...new Set([...prev, ...allTagIds])]);
    } else {
      const filteredTagIds = new Set(filteredTags.map(tag => tag.id));
      setTempSelectedTags(prev => prev.filter(id => !filteredTagIds.has(id)));
    }
  };

  // 检查分类是否全选
  const isCategoryAllSelected = (category: string): boolean => {
    const categoryTags = groupedTags[category] || [];
    if (categoryTags.length === 0) return false;
    return categoryTags.every(tag => tempSelectedTags.includes(tag.id));
  };

  // 检查分类是否部分选中
  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryTags = groupedTags[category] || [];
    if (categoryTags.length === 0) return false;
    const selectedCount = categoryTags.filter(tag => tempSelectedTags.includes(tag.id)).length;
    return selectedCount > 0 && selectedCount < categoryTags.length;
  };

  // 处理分类选中（切换该分类下所有标签）
  const handleCategoryToggle = (category: string) => {
    const categoryTags = groupedTags[category] || [];
    const isAllSelected = isCategoryAllSelected(category);

    if (isAllSelected) {
      // 取消选中该分类所有标签
      const categoryTagIds = new Set(categoryTags.map(tag => tag.id));
      setTempSelectedTags(prev => prev.filter(id => !categoryTagIds.has(id)));
    } else {
      // 选中该分类所有标签
      setTempSelectedTags(prev => [...new Set([...prev, ...categoryTags.map(tag => tag.id)])]);
    }
  };

  // 确认选择
  const handleConfirm = () => {
    onConfirm(tempSelectedTags);
    onClose();
  };

  const selectedCount = tempSelectedTags.length;
  const totalCount = customerTags.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-xl shadow-xl w-[1200px] max-h-[90vh] flex flex-col">
        {/* 标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">选择客户标签</h3>
            <p className="text-sm text-gray-500 mt-1">
              已选择 {selectedCount}/{totalCount} 个标签
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索标签名称或ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 分类筛选 */}
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 全选/取消全选 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              全选
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消全选
            </button>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(groupedTags).length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              未找到匹配的标签
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTags).map(([category, tags]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 分类标题 */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {isCategoryAllSelected(category) ? (
                          <Check className="w-4 h-4 text-blue-600" />
                        ) : isCategoryPartiallySelected(category) ? (
                          <div className="w-4 h-4 border-2 border-blue-600 rounded-sm bg-blue-600 relative">
                            <div className="absolute inset-x-1 bottom-1 h-0.5 bg-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-sm" />
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900">{category}</h4>
                      <span className="text-xs text-gray-500">({tags.length})</span>
                    </div>
                  </div>

                  {/* 标签列表 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`
                          p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${
                            tempSelectedTags.includes(tag.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {tempSelectedTags.includes(tag.id) ? (
                              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {tag.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                {tagTypeLabels[tag.type]}
                              </span>
                              <span>{tag.id}</span>
                            </div>
                            {tag.description && (
                              <div className="text-xs text-gray-400 line-clamp-1">
                                {tag.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            已选择 <span className="font-semibold text-gray-900">{selectedCount}</span> 个标签
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
              disabled={selectedCount === 0}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
