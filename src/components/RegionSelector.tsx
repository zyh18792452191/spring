'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { getAllRegionOptions, isNational, provinces, City, Grid } from '@/data/provinces';

interface RegionSelectorProps {
  value: string;           // 当前选中区域编码
  onChange: (code: string, name: string) => void;  // 切换回调
  className?: string;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 获取所有区域选项
  const allRegions = useMemo(() => getAllRegionOptions(), []);
  
  // 根据搜索文本过滤
  const filteredRegions = useMemo(() => {
    if (!searchText.trim()) {
      return allRegions;
    }
    const keyword = searchText.toLowerCase();
    return allRegions.filter(region => 
      region.name.toLowerCase().includes(keyword) ||
      region.shortName.toLowerCase().includes(keyword)
    );
  }, [allRegions, searchText]);
  
  // 获取当前选中的区域名称
  const selectedRegion = useMemo(() => {
    if (!value || isNational(value)) {
      return { name: '全国', shortName: '全国' };
    }
    return allRegions.find(r => r.code === value) || { name: '全国', shortName: '全国' };
  }, [value, allRegions]);
  
  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchText('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // 打开下拉时聚焦搜索框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleSelect = (code: string, name: string) => {
    onChange(code, name);
    setIsOpen(false);
    setSearchText('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchText('');
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-sm hover:border-[#0085D0] focus:border-[#0085D0] focus:outline-none transition-colors min-w-[100px]"
      >
        <MapPin className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-700">{selectedRegion.shortName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* 下拉面板 */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[280px]"
          onKeyDown={handleKeyDown}
        >
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索省/直辖市..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:border-[#0085D0] focus:outline-none"
              />
            </div>
          </div>
          
          {/* 选项列表 */}
          <div className="max-h-[320px] overflow-y-auto">
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => {
                const isSelected = (region.code === value) || 
                  (!value && region.code === '000000') ||
                  (isNational(value) && region.code === '000000');
                  
                return (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => handleSelect(region.code, region.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 text-[#0066CC]' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {region.code === '000000' && (
                        <span className="text-xs bg-[#0066CC] text-white px-1.5 py-0.5 rounded">全部</span>
                      )}
                      {region.name}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0066CC]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                未找到匹配的区域
              </div>
            )}
          </div>
          
          {/* 底部提示 */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            共 {allRegions.length} 个区域可选
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionSelector;
