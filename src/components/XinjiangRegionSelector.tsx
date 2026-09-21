'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { provinces, City, District, Grid } from '@/data/provinces';

// 新疆全疆标识
const XINJIANG_PROVINCE_CODE = '650000';
const XINJIANG_PROVINCE_NAME = '全疆';

interface XinjiangRegionSelectorProps {
  value: {
    cityCode?: string;
    districtCode?: string;
    gridCode?: string;
    isProvince?: boolean; // 是否选择了全疆
  };
  onChange: (
    cityCode: string,
    cityName: string,
    districtCode: string,
    districtName: string,
    gridCode: string,
    gridName: string,
    isProvince?: boolean
  ) => void;
  className?: string;
  /** 最深可选层级，控制tab可见范围 */
  maxLevel?: 'province' | 'city' | 'district' | 'grid';
  /** 限制只能选某个地市（地市级操作员），传入地市code */
  allowedCityCode?: string;
}

const XinjiangRegionSelector: React.FC<XinjiangRegionSelectorProps> = ({
  value,
  onChange,
  className = '',
  maxLevel = 'grid',
  allowedCityCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'province' | 'city' | 'district' | 'grid'>('city');
  const [searchCity, setSearchCity] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchGrid, setSearchGrid] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 新疆省数据
  const xinjiangProvince = useMemo(() => {
    return provinces.find(p => p.code === '650000');
  }, []);
  
  // 新疆省的市列表
  const cities = useMemo(() => {
    return xinjiangProvince?.cities || [];
  }, [xinjiangProvince]);
  
  // 根据当前选中的市获取区县列表
  const currentCity = useMemo(() => {
    return cities.find(c => c.code === value.cityCode);
  }, [cities, value.cityCode]);
  
  const districts = useMemo(() => {
    return currentCity?.districts || [];
  }, [currentCity]);
  
  // 根据当前选中的区县获取网格列表
  const currentDistrict = useMemo(() => {
    return districts.find(d => d.code === value.districtCode);
  }, [districts, value.districtCode]);
  
  const grids = useMemo(() => {
    return currentDistrict?.grids || [];
  }, [currentDistrict]);
  
  // 过滤后的市列表
  const filteredCities = useMemo(() => {
    if (!searchCity.trim()) return cities;
    const keyword = searchCity.toLowerCase();
    return cities.filter(city => city.name.toLowerCase().includes(keyword));
  }, [cities, searchCity]);
  
  // 过滤后的区县列表
  const filteredDistricts = useMemo(() => {
    if (!searchDistrict.trim()) return districts;
    const keyword = searchDistrict.toLowerCase();
    return districts.filter(d => d.name.toLowerCase().includes(keyword));
  }, [districts, searchDistrict]);
  
  // 过滤后的网格列表
  const filteredGrids = useMemo(() => {
    if (!searchGrid.trim()) return grids;
    const keyword = searchGrid.toLowerCase();
    return grids.filter(g => g.name.toLowerCase().includes(keyword));
  }, [grids, searchGrid]);
  
  // 判断是否选择了全疆
  const isSelectProvince = useMemo(() => {
    return value.isProvince || (!value.cityCode && !value.districtCode && !value.gridCode);
  }, [value]);
  
  // 获取当前选中的市名称
  const selectedCityName = useMemo(() => {
    if (isSelectProvince) return XINJIANG_PROVINCE_NAME;
    if (!value.cityCode) return '';
    return currentCity?.name || '';
  }, [value.cityCode, currentCity, isSelectProvince]);
  
  // 获取当前选中的区县名称
  const selectedDistrictName = useMemo(() => {
    if (!value.districtCode) return '';
    return currentDistrict?.name || '';
  }, [value.districtCode, currentDistrict]);
  
  // 获取当前选中的网格名称
  const selectedGridName = useMemo(() => {
    if (!value.gridCode) return '';
    const grid = grids.find(g => g.code === value.gridCode);
    return grid?.name || '';
  }, [value.gridCode, grids]);
  
  // 显示文本
  const displayText = useMemo(() => {
    if (isSelectProvince) return XINJIANG_PROVINCE_NAME;
    const parts = [selectedCityName, selectedDistrictName, selectedGridName].filter(Boolean);
    return parts.join('/') || '选择区域';
  }, [isSelectProvince, selectedCityName, selectedDistrictName, selectedGridName]);
  
  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchCity('');
        setSearchDistrict('');
        setSearchGrid('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // 选择全疆
  const handleSelectProvince = () => {
    onChange('', '', '', '', '', '', true);
    setIsOpen(false);
    setSearchCity('');
    setSearchDistrict('');
    setSearchGrid('');
  };
  
  // 选择地市
  const handleSelectCity = (city: City) => {
    onChange(city.code, city.name, '', '', '', '', false);
    if (showDistrictTab) setActiveTab('district');
    else setIsOpen(false);
    setSearchDistrict('');
  };
  
  // 选择区县
  const handleSelectDistrict = (district: District) => {
    if (currentCity) {
      onChange(currentCity.code, currentCity.name, district.code, district.name, '', '', false);
      if (showGridTab) setActiveTab('grid');
      else setIsOpen(false);
      setSearchGrid('');
    }
  };
  
  // 选择网格
  const handleSelectGrid = (grid: Grid) => {
    if (currentCity && currentDistrict) {
      onChange(currentCity.code, currentCity.name, currentDistrict.code, currentDistrict.name, grid.code, grid.name, false);
      setIsOpen(false);
      setSearchCity('');
      setSearchDistrict('');
      setSearchGrid('');
    }
  };
  
  // Tab切换时重置搜索
  const handleTabChange = (tab: 'province' | 'city' | 'district' | 'grid') => {
    setActiveTab(tab);
    if (tab === 'city') setSearchCity('');
    else if (tab === 'district') setSearchDistrict('');
    else if (tab === 'grid') setSearchGrid('');
  };
  
  // 各Tab是否可用
  const districtTabEnabled = !!value.cityCode;
  const gridTabEnabled = !!value.districtCode;

  // 层级可见性：根据maxLevel控制tab是否显示
  const levelOrder: Array<'province' | 'city' | 'district' | 'grid'> = ['province', 'city', 'district', 'grid'];
  const maxLevelIndex = levelOrder.indexOf(maxLevel);
  const showProvinceTab = maxLevelIndex >= 0;
  const showCityTab = maxLevelIndex >= 1;
  const showDistrictTab = maxLevelIndex >= 2;
  const showGridTab = maxLevelIndex >= 3;

  // 如果allowedCityCode限制了地市，过滤地市列表
  const effectiveCities = useMemo(() => {
    if (allowedCityCode) return cities.filter(c => c.code === allowedCityCode);
    return cities;
  }, [cities, allowedCityCode]);

  const filteredCitiesForSearch = useMemo(() => {
    if (!searchCity.trim()) return effectiveCities;
    const keyword = searchCity.toLowerCase();
    return effectiveCities.filter(city => city.name.toLowerCase().includes(keyword));
  }, [effectiveCities, searchCity]);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-sm hover:border-[#0085D0] focus:border-[#0085D0] focus:outline-none transition-colors min-w-[180px]"
      >
        <MapPin className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-700 flex-1 text-left truncate">
          {isSelectProvince ? (
            <span className="text-[#0085D0] font-medium">{XINJIANG_PROVINCE_NAME}</span>
          ) : (
            <span>{displayText}</span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[480px]">
          {/* Tab切换 - 全疆/地市/区县/网格 */}
          <div className="flex border-b border-gray-200">
            {showProvinceTab && (
            <button
              type="button"
              onClick={() => handleTabChange('province')}
              className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'province' 
                  ? 'text-[#0085D0] border-b-2 border-[#0085D0]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              全疆
            </button>
            )}
            {showCityTab && (
            <button
              type="button"
              onClick={() => handleTabChange('city')}
              className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'city' 
                  ? 'text-[#0085D0] border-b-2 border-[#0085D0]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              地市
            </button>
            )}
            {showDistrictTab && (
            <button
              type="button"
              onClick={() => handleTabChange('district')}
              disabled={!districtTabEnabled}
              className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'district' 
                  ? 'text-[#0085D0] border-b-2 border-[#0085D0]' 
                  : districtTabEnabled 
                    ? 'text-gray-500 hover:text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              区县
            </button>
            )}
            {showGridTab && (
            <button
              type="button"
              onClick={() => handleTabChange('grid')}
              disabled={!gridTabEnabled}
              className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'grid' 
                  ? 'text-[#0085D0] border-b-2 border-[#0085D0]' 
                  : gridTabEnabled 
                    ? 'text-gray-500 hover:text-gray-700' 
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              网格
            </button>
            )}
          </div>
          
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              {activeTab === 'province' ? (
                <div className="pl-8 pr-3 py-1.5 text-sm text-gray-400">
                  点击下方选项查看全疆数据
                </div>
              ) : (
                <input
                  type="text"
                  value={activeTab === 'city' ? searchCity : activeTab === 'district' ? searchDistrict : searchGrid}
                  onChange={(e) => {
                    if (activeTab === 'city') setSearchCity(e.target.value);
                    else if (activeTab === 'district') setSearchDistrict(e.target.value);
                    else setSearchGrid(e.target.value);
                  }}
                  placeholder={activeTab === 'city' ? '搜索地市...' : activeTab === 'district' ? '搜索区县...' : '搜索网格...'}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:border-[#0085D0] focus:outline-none"
                />
              )}
            </div>
          </div>
          
          {/* 选项列表 */}
          <div className="max-h-[300px] overflow-y-auto">
            {activeTab === 'province' ? (
              // 全疆选项
              <button
                type="button"
                onClick={handleSelectProvince}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  isSelectProvince ? 'bg-blue-50 text-[#0085D0]' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#0085D0] text-white text-xs rounded">全疆</span>
                  <span className="font-medium">新疆维吾尔自治区</span>
                </span>
                {isSelectProvince && <Check className="w-4 h-4 text-[#0085D0]" />}
              </button>
            ) : activeTab === 'city' ? (
              // 地市列表
              filteredCitiesForSearch.length > 0 ? (
                filteredCitiesForSearch.map((city) => {
                  const isSelected = city.code === value.cityCode && !value.isProvince;
                  return (
                    <button
                      key={city.code}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 text-[#0085D0]' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-6">{effectiveCities.indexOf(city) + 1}</span>
                        <span>{city.name}</span>
                        {city.districts && (
                          <span className="text-xs text-gray-400">({city.districts.length}个区县)</span>
                        )}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#0085D0]" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">未找到匹配的地市</div>
              )
            ) : activeTab === 'district' ? (
              // 区县列表
              districts.length > 0 ? (
                filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => {
                    const isSelected = district.code === value.districtCode;
                    return (
                      <button
                        key={district.code}
                        type="button"
                        onClick={() => handleSelectDistrict(district)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 text-[#0085D0]' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-6">{districts.indexOf(district) + 1}</span>
                          <span>{district.name}</span>
                          {district.grids && (
                            <span className="text-xs text-gray-400">({district.grids.length}个网格)</span>
                          )}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#0085D0]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">未找到匹配的区县</div>
                )
              ) : (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">请先选择地市</div>
              )
            ) : (
              // 网格列表
              grids.length > 0 ? (
                filteredGrids.length > 0 ? (
                  filteredGrids.map((grid) => {
                    const isSelected = grid.code === value.gridCode;
                    return (
                      <button
                        key={grid.code}
                        type="button"
                        onClick={() => handleSelectGrid(grid)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 text-[#0085D0]' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-6">{grids.indexOf(grid) + 1}</span>
                          <span>{grid.name}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#0085D0]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">未找到匹配的网格</div>
                )
              ) : (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  {currentDistrict ? `${currentDistrict.name}暂无网格数据` : '请先选择区县'}
                </div>
              )
            )}
          </div>
          
          {/* 底部提示 */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 flex items-center justify-between">
            <span>
              {activeTab === 'province' 
                ? '查看新疆全量数据'
                : activeTab === 'city' 
                  ? `共 ${effectiveCities.length} 个地市`
                  : activeTab === 'district'
                    ? `${selectedCityName} 共 ${districts.length} 个区县`
                    : `${selectedDistrictName} 共 ${grids.length} 个网格`
              }
            </span>
            {activeTab === 'city' && value.cityCode && showDistrictTab && (
              <button type="button" onClick={() => handleTabChange('district')} className="text-[#0085D0] hover:underline">
                选择区县 →
              </button>
            )}
            {activeTab === 'district' && value.districtCode && showGridTab && (
              <button type="button" onClick={() => handleTabChange('grid')} className="text-[#0085D0] hover:underline">
                选择网格 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default XinjiangRegionSelector;
