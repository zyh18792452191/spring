'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BattleCockpit from './BattleCockpit';
import OperationPanel from './OperationPanel';
import CommunityPortrait from './CommunityPortrait';
import {
  Layers, Crosshair
} from 'lucide-react';

// 区域类型接口
export interface AreaTypeItem {
  label: string;
  value: string;
}

// 重点指标接口
export interface FamilyMetricItem {
  label: string;
  value: string;
  unit: string;
  subLabel: string;
  subValue: string;
  trend: 'up' | 'down';
  trendValue: string;
}

interface RegionAssaultTabProps {
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
  setSelectedRegion?: (region: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }) => void;
  regionDisplay: string;
  setRegionDisplay?: (display: string) => void;
  areaTitle?: string;  // 区域标题，如"中高端攻坚区域"
  areaTypes?: AreaTypeItem[];  // 区域类型列表
  hideTabs?: boolean;  // 是否隐藏驾驶舱Tab
  familyMetrics?: FamilyMetricItem[];  // 重点指标列表
  familyMetricsTitle?: string;  // 重点指标标题
  recommendedTitle?: string;  // 推荐小区标题
  communityTypes?: string[];  // 小区类型列表
  operationPanelConfig?: {  // 运营作业面板配置
    title: string;
    filterTitle: string;
    tagOptions: { label: string; value: string }[];
  };
  scenario?: 'traffic' | 'mid-high' | 'churn-retention' | 'family';  // 业务场景
}
const mockCommunities = [
  {
    id: 'C1001', name: '天山花园', type: 'lowSaturation', address: '新疆乌鲁木齐天山区人民路天山花园',
    householdCount: 152, penetration: 32.5, share: 28.3,
    cellCode: '650102001001', cellType: '住宅', cityName: '乌鲁木齐', districtName: '天山区',
    networkName: '4G+5G', longitude: 87.6177, latitude: 43.7928,
    userCount: 1286, totalPorts: 320, unusedPorts: 86, portUsageRate: 73.1,
    isKeyCell: true, dataDate: '2025-01-15',
  },
  {
    id: 'C1002', name: '沙依巴克小区', type: 'zeroLowTraffic', address: '新疆乌鲁木齐沙依巴克区友好南路沙依巴克小区',
    householdCount: 118, penetration: 45.2, share: 35.7,
    cellCode: '650103002003', cellType: '商住', cityName: '乌鲁木齐', districtName: '沙依巴克区',
    networkName: '4G+5G', longitude: 87.5943, latitude: 43.8003,
    userCount: 968, totalPorts: 240, unusedPorts: 102, portUsageRate: 57.5,
    isKeyCell: false, dataDate: '2025-01-15',
  },
  {
    id: 'C1003', name: '高新区花园', type: 'overageHighFreq', address: '新疆乌鲁木齐新市区北京路高新区花园',
    householdCount: 196, penetration: 28.9, share: 22.1,
    cellCode: '650104003002', cellType: '住宅', cityName: '乌鲁木齐', districtName: '新市区',
    networkName: '4G+5G', longitude: 87.6065, latitude: 43.8356,
    userCount: 1623, totalPorts: 400, unusedPorts: 145, portUsageRate: 63.8,
    isKeyCell: true, dataDate: '2025-01-15',
  },
  {
    id: 'C1004', name: '水磨沟花园', type: 'competitorHighRisk', address: '新疆乌鲁木齐水磨沟区南湖路水磨沟花园',
    householdCount: 245, penetration: 38.7, share: 30.5,
    cellCode: '650105004001', cellType: '住宅', cityName: '乌鲁木齐', districtName: '水磨沟区',
    networkName: '4G', longitude: 87.6421, latitude: 43.8251,
    userCount: 2012, totalPorts: 480, unusedPorts: 168, portUsageRate: 65.0,
    isKeyCell: true, dataDate: '2025-01-15',
  },
  {
    id: 'C1005', name: '米东区小区', type: 'lowSaturation', address: '新疆乌鲁木齐米东区古牧地路米东区小区',
    householdCount: 103, penetration: 52.3, share: 40.2,
    cellCode: '650109005002', cellType: '住宅', cityName: '乌鲁木齐', districtName: '米东区',
    networkName: '4G+5G', longitude: 87.6568, latitude: 43.9742,
    userCount: 856, totalPorts: 200, unusedPorts: 52, portUsageRate: 74.0,
    isKeyCell: false, dataDate: '2025-01-15',
  },
];

// 乌鲁木齐主要区域
const urumqiDistricts = [
  '天山区', '沙依巴克区', '新市区', '水磨沟区', '头屯河区', '达坂城区',
  '米东区', '乌鲁木齐县'
];

// Window接口扩展已在其他组件中声明

export default function RegionAssaultTab({ 
  selectedRegion,
  setSelectedRegion,
  regionDisplay,
  setRegionDisplay,
  areaTitle,
  areaTypes,
  hideTabs,
  familyMetrics,
  familyMetricsTitle,
  recommendedTitle,
  communityTypes,
  operationPanelConfig,
  scenario = 'traffic',
}: RegionAssaultTabProps) {
  // 面板状态
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  // 地图状态
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const mapContainerId = 'battle-map-container';

  // 绘图工具状态
  const [activeDrawTool, setActiveDrawTool] = useState<'polygon' | 'circle' | 'rectangle' | null>(null);
  const [drawnOverlays, setDrawnOverlays] = useState<any[]>([]);
  const [circleSelectionCompleted, setCircleSelectionCompleted] = useState(false);

  // 小区画像弹窗
  const [communityPortraitVisible, setCommunityPortraitVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<typeof mockCommunities[0] | null>(null);

  // 派单处理
  const router = useRouter();
  const handleDispatch = () => {
    router.push('/portal/traffic-operations/dispatch');
  };

  // 搜索
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof mockCommunities>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 区域选择
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  // 百度地图初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapInitialized = false;

    const initMap = () => {
      try {
        if (!window.BMap || !window.BMap.Map) {
          console.log('等待百度地图SDK加载...');
          return false;
        }

        const container = document.getElementById(mapContainerId);
        if (!container) {
          console.log('等待地图容器渲染...');
          return false;
        }

        // 确保容器有实际尺寸
        const rect = container.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) {
          console.log('地图容器尺寸不足:', rect.width, rect.height);
          return false;
        }

        // 如果地图实例已存在且绑定到当前容器，重置尺寸即可
        if (window.mapInstance) {
          const currentContainer = window.mapInstance.getContainer();
          if (currentContainer === container) {
            window.mapInstance.reset();
            setMapReady(true);
            mapInitialized = true;
            return true;
          }
          // 地图实例绑定的是旧容器（可能是切换 Tab 前的），需要销毁重建
          try { window.mapInstance.disableScrollWheelZoom(); } catch {}
          window.mapInstance = null;
        }

        // 创建地图实例
        const map = new window.BMap.Map(mapContainerId, {
          enableMapClick: false,
        });
        map.centerAndZoom(new window.BMap.Point(87.617, 43.792), 11);
        map.enableScrollWheelZoom(true);

        window.mapInstance = map;

        // 不使用 setMapStyle + styleJson！
        // 原因：styleJson 会让百度地图切换到自定义瓦片服务，
        // 在当前环境下该服务请求失败，导致瓦片不渲染（只剩覆盖物）
        // 改用 CSS filter 实现浅色效果，瓦片走默认通道，稳定可靠

        // 添加比例尺
        map.addControl(new window.BMap.ScaleControl({
          anchor: window.BMAP_ANCHOR_TOP_RIGHT,
          offset: new window.BMap.Size(10, 60)
        }));

        // 绘制乌鲁木齐区县边界 + 区域名称标注
        const districtCenters: Record<string, { lng: number; lat: number }> = {
          '天山区': { lng: 87.630, lat: 43.790 },
          '沙依巴克区': { lng: 87.575, lat: 43.785 },
          '新市区': { lng: 87.560, lat: 43.860 },
          '水磨沟区': { lng: 87.660, lat: 43.830 },
          '头屯河区': { lng: 87.430, lat: 43.880 },
          '达坂城区': { lng: 88.320, lat: 43.630 },
          '米东区': { lng: 87.655, lat: 43.970 },
          '乌鲁木齐县': { lng: 87.380, lat: 43.480 },
        };

        const boundary = new window.BMap.Boundary();
        urumqiDistricts.forEach(district => {
          boundary.get('乌鲁木齐' + district, (result: any) => {
            if (result.boundaries && result.boundaries.length > 0) {
              result.boundaries.forEach((boundaryStr: string) => {
                const polygon = new window.BMap.Polygon(
                  boundaryStr,
                  {
                    strokeColor: 'rgba(30, 64, 175)',
                    fillColor: 'rgba(30, 64, 175)',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeOpacity: 1,
                    strokeStyle: 'solid'
                  }
                );
                map.addOverlay(polygon);
              });

              // 添加区域名称标注 - 白字+深蓝圆角背景框
              const center = districtCenters[district];
              if (center) {
                const label = new window.BMap.Label(district, {
                  position: new window.BMap.Point(center.lng, center.lat),
                  offset: new window.BMap.Size(0, 0)
                });
                label.setStyle({
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, "Microsoft YaHei", sans-serif',
                  backgroundColor: 'rgba(30, 64, 175, 0.85)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  textAlign: 'center',
                  lineHeight: '20px',
                  cursor: 'default',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  whiteSpace: 'nowrap',
                  transform: 'translate(-50%, -50%)',
                });
                map.addOverlay(label);
              }
            }
          });
        });

        // 小区标记 - 已隐藏

        // 初始化DrawingManager（绘制工具）
        if (window.BMapLib && window.BMapLib.DrawingManager) {
          const drawingManager = new window.BMapLib.DrawingManager(map, {
            isOpen: false,
            enableDrawingTool: false,
            circleOptions: {
              strokeColor: '#1677FF',
              fillColor: '#1677FF',
              fillOpacity: 0.15,
              strokeWeight: 2,
              strokeOpacity: 0.8
            },
            polygonOptions: {
              strokeColor: '#1677FF',
              fillColor: '#1677FF',
              fillOpacity: 0.15,
              strokeWeight: 2,
              strokeOpacity: 0.8
            },
            rectangleOptions: {
              strokeColor: '#1677FF',
              fillColor: '#1677FF',
              fillOpacity: 0.15,
              strokeWeight: 2,
              strokeOpacity: 0.8
            }
          });
          window.drawingManager = drawingManager;

          drawingManager.addEventListener('overlaycomplete', (e: any) => {
            const overlay = e.overlay;
            overlay.enableEditing?.();
            setDrawnOverlays(prev => [...prev, overlay]);
            setCircleSelectionCompleted(true);
            setActiveDrawTool(null);
            drawingManager.close();
          });
        }

        mapInitialized = true;
        setMapReady(true);
        console.log('百度地图初始化成功');

        // 监听瓦片加载完成
        map.addEventListener('tilesloaded', () => {
          console.log('百度地图瓦片加载完成');
        });

        return true;
      } catch (error) {
        console.error('百度地图初始化失败:', error);
        return false;
      }
    };

    // 监听小区画像事件
    const handleCommunityPortraitEvent = (e: any) => {
      const communityId = e.detail;
      const community = mockCommunities.find(c => c.id === communityId);
      if (community) {
        setSelectedCommunity(community);
        setCommunityPortraitVisible(true);
      }
    };
    document.addEventListener('showCommunityPortrait', handleCommunityPortraitEvent);

    // 加载百度地图SDK
    // 使用 callback 参数是百度地图官方推荐的 SPA 加载方式
    // 加上 callback 参数后，入口脚本不会调用 document.write，而是等核心JS加载完后调用回调
    const BAI_DU_MAP_AK = 'u0lnC8SRqpZV84R9Huzz7zZoUJbkH520';
    const callbackName = 'baiduMapInitCallback';

    // 定义全局回调（百度地图核心JS加载完后触发）
    (window as any)[callbackName] = () => {
      console.log('百度地图核心JS加载完成，开始初始化...');
      // 加载DrawingManager
      const dmScript = document.createElement('script');
      dmScript.src = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
      dmScript.async = true;
      dmScript.onload = () => {
        console.log('DrawingManager加载完成');
        setTimeout(() => initMap(), 200);
      };
      dmScript.onerror = () => {
        console.warn('DrawingManager加载失败，仅使用基础地图');
        initMap();
      };
      document.head.appendChild(dmScript);
    };

    if (!window.BMap) {
      // 加载DrawingManager CSS
      const drawingCSS = document.createElement('link');
      drawingCSS.rel = 'stylesheet';
      drawingCSS.href = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css';
      document.head.appendChild(drawingCSS);

      // 使用 callback 方式加载百度地图（避免 document.write 问题）
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=2.0&ak=${BAI_DU_MAP_AK}&callback=${callbackName}`;
      script.async = false; // 同步加载确保顺序
      script.onerror = () => {
        console.error('百度地图加载失败，尝试getscript备用方式...');
        // 备用：直接加载 getscript
        const fallback = document.createElement('script');
        fallback.src = `https://api.map.baidu.com/getscript?v=2.0&ak=${BAI_DU_MAP_AK}&services=&t=${Date.now()}`;
        fallback.async = true;
        fallback.onload = () => {
          (window as any)[callbackName]();
        };
        fallback.onerror = () => {
          console.error('百度地图所有加载方式均失败');
          setMapLoadError(true);
        };
        document.head.appendChild(fallback);
      };
      document.head.appendChild(script);
    } else {
      // BMap已存在，直接初始化
      if (!window.BMapLib || !window.BMapLib.DrawingManager) {
        const drawingCSS = document.createElement('link');
        drawingCSS.rel = 'stylesheet';
        drawingCSS.href = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css';
        document.head.appendChild(drawingCSS);

        const script2 = document.createElement('script');
        script2.src = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
        script2.async = true;
        script2.onload = () => setTimeout(() => initMap(), 50);
        script2.onerror = () => initMap();
        document.head.appendChild(script2);
      } else {
        initMap();
      }
    }

    // 首次初始化延迟到下一帧，确保 CSS 布局完成后再检测容器尺寸
    const rafId = requestAnimationFrame(() => {
      // 如果 BMap SDK 还未加载完成，initMap 会返回 false，由后续重试接管
      initMap();
    });

    // 定时重试初始化（作为兜底机制）
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      if (mapInitialized || retryCount > 20) {
        clearInterval(retryInterval);
        if (!mapInitialized) {
          console.warn('百度地图加载超时，当前环境可能无法访问百度地图服务');
          setMapLoadError(true);
        }
        return;
      }
      initMap();
      retryCount++;
    }, 300);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(retryInterval);
      document.removeEventListener('showCommunityPortrait', handleCommunityPortraitEvent);
      // 清除地图实例引用，避免切换Tab后旧实例残留
      if (window.mapInstance) {
        try { window.mapInstance.disableScrollWheelZoom(); } catch {}
        window.mapInstance = null;
      }
      if (window.drawingManager) {
        window.drawingManager = null;
      }
    };
  }, []);

  // 绘图工具操作
  const startDrawing = (mode: 'polygon' | 'circle' | 'rectangle') => {
    if (!window.drawingManager) return;
    setActiveDrawTool(mode);
    const drawModeMap: Record<string, any> = {
      polygon: window.BMAP_DRAWING_POLYGON,
      circle: window.BMAP_DRAWING_CIRCLE,
      rectangle: window.BMAP_DRAWING_RECTANGLE,
    };
    window.drawingManager.setDrawingMode(drawModeMap[mode]);
    window.drawingManager.open();
  };

  const completeDrawing = () => {
    if (!window.drawingManager) return;
    window.drawingManager.close();
    setActiveDrawTool(null);
    setCircleSelectionCompleted(true);
  };

  const deleteLastOverlay = () => {
    if (drawnOverlays.length === 0) return;
    const lastOverlay = drawnOverlays[drawnOverlays.length - 1];
    window.mapInstance?.removeOverlay(lastOverlay);
    setDrawnOverlays(prev => prev.slice(0, -1));
    if (drawnOverlays.length <= 1) {
      setCircleSelectionCompleted(false);
    }
  };

  const clearAllOverlays = () => {
    drawnOverlays.forEach(overlay => {
      window.mapInstance?.removeOverlay(overlay);
    });
    setDrawnOverlays([]);
    setCircleSelectionCompleted(false);
    setActiveDrawTool(null);
    window.drawingManager?.close();
  };

  // 搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = mockCommunities.filter(c =>
        c.name.includes(query) || c.address.includes(query)
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // 定位到小区
  const locateCommunity = (community: typeof mockCommunities[0]) => {
    const positions: Record<string, { lng: number; lat: number }> = {
      'C1001': { lng: 123.407, lat: 41.790 },
      'C1002': { lng: 123.459, lat: 41.796 },
      'C1003': { lng: 123.391, lat: 41.824 },
      'C1004': { lng: 123.469, lat: 41.808 },
      'C1005': { lng: 123.344, lat: 41.802 },
    };
    const pos = positions[community.id];
    if (pos && window.mapInstance) {
      window.mapInstance.centerAndZoom(new window.BMap.Point(pos.lng, pos.lat), 15);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // 打开小区画像
  const handleShowCommunityPortrait = (community: typeof mockCommunities[0]) => {
    setSelectedCommunity(community);
    setCommunityPortraitVisible(true);
  };

  return (
    <div className="relative" style={{ height: 'calc(100vh - 180px)', background: '#F5F7FA', color: '#333333', overflow: 'hidden' }}>
      {/* 左侧作战指挥驾驶舱 */}
      <BattleCockpit
        visible={leftPanelVisible}
        onToggleVisible={() => setLeftPanelVisible(!leftPanelVisible)}
        regionDisplay={regionDisplay}
        onDispatch={handleDispatch}
        areaTitle={areaTitle}
        areaTypes={areaTypes}
        hideTabs={hideTabs}
        familyMetrics={familyMetrics}
        familyMetricsTitle={familyMetricsTitle}
        scenario={scenario}
        regionValue={selectedRegion}
        onRegionChange={(cityCode, cityName, districtCode, districtName, gridCode, gridName, isProvince) => {
          if (setSelectedRegion) {
            setSelectedRegion({ cityCode, districtCode, gridCode, isProvince });
          }
          if (setRegionDisplay) {
            if (isProvince) {
              setRegionDisplay('新疆维吾尔自治区全疆');
            } else {
              setRegionDisplay(gridCode ? `${cityName}/${districtName}/${gridName}` : districtCode ? `${cityName}/${districtName}` : cityName);
            }
          }
        }}
        onCommunityClick={(community) => {
          // 将BattleCockpit的CommunityItem映射为CellInfo格式
          const cellInfo = {
            id: `BC${community.id}`,
            name: community.name,
            type: community.type,
            address: `新疆乌鲁木齐${community.name}`,
            householdCount: 0,
            penetration: 0,
            share: 0,
            cellCode: `650100${String(community.id).padStart(6, '0')}`,
            cellType: scenario === 'traffic' ? community.type : community.type,
            cityName: '乌鲁木齐',
            districtName: '',
            networkName: '4G+5G',
            longitude: 87.6177 + (community.id - 1) * 0.012,
            latitude: 43.7928 + (community.id - 1) * 0.008,
            userCount: 0,
            totalPorts: 0,
            unusedPorts: 0,
            portUsageRate: 0,
            isKeyCell: community.id <= 3,
            dataDate: new Date().toISOString().slice(0, 10),
            info: community.info,
          };
          setSelectedCommunity(cellInfo);
          setCommunityPortraitVisible(true);
        }}
      />

      {/* 中心地图区域 - 全宽铺满 */}
      <div className="absolute inset-0 flex flex-col">
        {/* 顶部工具栏 - 已隐藏 */}

        {/* 地图容器 */}
        <div className="flex-1 relative">
          {/* 地图容器 */}
          <div
            id={mapContainerId}
            className="absolute inset-0"
            style={{
              minHeight: '500px',
            }}
          />
          {!mapReady && !mapLoadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-500">正在加载地图...</p>
                <p className="text-xs text-gray-400 mt-1">加载百度地图SDK及区域数据</p>
              </div>
            </div>
          )}
          {mapLoadError && !mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-base font-medium text-gray-700 mb-2">地图加载中</p>
                <p className="text-sm text-gray-400 mb-4">百度地图SDK正在加载，请稍候或点击重试</p>
                <button
                  onClick={() => {
                    setMapLoadError(false);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  重新加载
                </button>
              </div>
            </div>
          )}

          {/* 地图左下角图例 - 已隐藏 */}

          {/* 地图右下角定位按钮 */}
          {mapReady && (
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (window.mapInstance) {
                    window.mapInstance.centerAndZoom(new window.BMap.Point(123.429, 41.796), 11);
                  }
                }}
                className="w-[32px] h-[32px] bg-[#f0f0f0] border-none rounded-[6px] flex items-center justify-center text-[#666666] cursor-pointer transition-all hover:bg-[#E8E8E8] hover:scale-110 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                title="复位到乌鲁木齐全图"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 右侧运营作业面板 */}
      <OperationPanel
        visible={rightPanelVisible}
        onToggleVisible={() => setRightPanelVisible(!rightPanelVisible)}
        onShowCommunityPortrait={handleShowCommunityPortrait}
        circleSelectionCompleted={circleSelectionCompleted}
        activeDrawTool={activeDrawTool}
        onStartDrawing={startDrawing}
        onCompleteDrawing={completeDrawing}
        onDeleteLastOverlay={deleteLastOverlay}
        onClearAllOverlays={clearAllOverlays}
        drawnOverlaysCount={drawnOverlays.length}
        onDispatch={handleDispatch}
        scenario={scenario}
      />

      {/* 小区画像弹窗 */}
      <CommunityPortrait
        visible={communityPortraitVisible}
        community={selectedCommunity}
        onClose={() => setCommunityPortraitVisible(false)}
        scenario={scenario}
      />
    </div>
  );
}
