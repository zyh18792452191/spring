'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    BMap: any;
    BMapLib: any;
    BMAP_DRAWING_MARKER: string;
    BMAP_DRAWING_POLYGON: string;
    BMAP_DRAWING_CIRCLE: string;
    BMAP_DRAWING_RECTANGLE: string;
    BMAP_ANCHOR_TOP_RIGHT: string;
    DrawingManager: any;
    mapInstance: any;
    drawingManager: any;
  }
}

export interface CommunityMarker {
  id: string;
  name: string;
  address: string;
  position: { lng: number; lat: number };
  penetration: number;
  share: number;
  customerCount: number;
  type: string;
}

export interface AOIPolygon {
  polygon: any;
  type: string;
}

interface UseBaiduMapOptions {
  containerId: string;
  center?: { lng: number; lat: number };
  zoom?: number;
  onCommunityClick?: (community: CommunityMarker) => void;
  onAOIDrawn?: (polygon: any) => void;
}

export function useBaiduMap(options: UseBaiduMapOptions) {
  const { containerId, center = { lng: 116.404, lat: 39.915 }, zoom = 12, onCommunityClick, onAOIDrawn } = options;
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const drawingManagerRef = useRef<any>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityMarker | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnAOIs, setDrawnAOIs] = useState<AOIPolygon[]>([]);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!window.BMap || !document.getElementById(containerId)) return;

    const map = new window.BMap.Map(containerId);
    map.centerAndZoom(new window.BMap.Point(center.lng, center.lat), zoom);
    map.enableScrollWheelZoom(true);
    mapRef.current = map;

    // 初始化DrawingManager
    if (window.DrawingManager) {
      const drawingManager = new window.DrawingManager({
        map: map,
        isOpen: false,
        enableDrawingTool: true,
        drawingToolOptions: {
          anchor: window.BMAP_ANCHOR_TOP_RIGHT,
          offset: new window.BMap.Size(10, 10),
          drawingModes: [
            window.BMAP_DRAWING_MARKER,
            window.BMAP_DRAWING_POLYGON,
            window.BMAP_DRAWING_CIRCLE,
            window.BMAP_DRAWING_RECTANGLE
          ]
        },
        polygonOptions: {
          strokeColor: '#1890ff',
          fillColor: '#1890ff',
          fillOpacity: 0.3,
          strokeWeight: 2
        },
        circleOptions: {
          strokeColor: '#1890ff',
          fillColor: '#1890ff',
          fillOpacity: 0.3,
          strokeWeight: 2
        },
        rectangleOptions: {
          strokeColor: '#1890ff',
          fillColor: '#1890ff',
          fillOpacity: 0.3,
          strokeWeight: 2
        }
      });

      drawingManagerRef.current = drawingManager;

      // 监听绘制完成事件
      drawingManager.addEventListener('overlaycomplete', (e: any) => {
        const overlay = e.overlay;
        overlay.enableEditing?.();
        overlaysRef.current.push(overlay);
        
        const aoiPolygon: AOIPolygon = {
          polygon: overlay,
          type: e.drawingMode
        };
        setDrawnAOIs(prev => [...prev, aoiPolygon]);
        
        if (onAOIDrawn) {
          onAOIDrawn(overlay);
        }
        
        // 关闭绘制模式
        drawingManager.close();
        setIsDrawingMode(false);
      });
    }

    setIsMapReady(true);
  }, [containerId, center, zoom, onAOIDrawn]);

  // 加载百度地图SDK
  useEffect(() => {
    // 如果已经加载，直接初始化
    if (window.BMap && window.BMap.Map) {
      initMap();
      return;
    }

    // 加载百度地图SDK
    const script1 = document.createElement('script');
    script1.src = 'https://api.map.baidu.com/api?v=2.0&ak=u0lnC8SRqpZV84R9Huzz7zZoUJbkH520';
    script1.async = true;
    
    const script2 = document.createElement('script');
    script2.src = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
    script2.async = true;

    script1.onload = () => {
      document.head.appendChild(script2);
      // 等待DrawingManager加载
      const checkDrawingManager = setInterval(() => {
        if (window.DrawingManager) {
          clearInterval(checkDrawingManager);
          initMap();
        }
      }, 100);
    };

    document.head.appendChild(script1);

    return () => {
      // 清理
      overlaysRef.current.forEach(overlay => {
        mapRef.current?.removeOverlay(overlay);
      });
    };
  }, [initMap]);

  // 添加小区标记
  const addCommunityMarkers = useCallback((communities: CommunityMarker[]) => {
    if (!mapRef.current) return;

    // 清除旧标记
    markersRef.current.forEach(marker => {
      mapRef.current.removeOverlay(marker);
    });
    markersRef.current = [];

    communities.forEach(community => {
      const point = new window.BMap.Point(community.position.lng, community.position.lat);
      
      // 创建标记
      const marker = new window.BMap.Marker(point, {
        enableDragging: false
      });

      // 创建信息窗口
      const infoWindow = new window.BMap.InfoWindow(`
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px; font-weight: 600;">${community.name}</h4>
          <p style="margin: 4px 0; font-size: 12px;">地址: ${community.address}</p>
          <p style="margin: 4px 0; font-size: 12px;">渗透率: ${community.penetration}%</p>
          <p style="margin: 4px 0; font-size: 12px;">客户份额: ${community.share}%</p>
        </div>
      `);

      marker.addEventListener('click', () => {
        mapRef.current.openInfoWindow(infoWindow, point);
        setSelectedCommunity(community);
        if (onCommunityClick) {
          onCommunityClick(community);
        }
      });

      mapRef.current.addOverlay(marker);
      markersRef.current.push(marker);
    });
  }, [onCommunityClick]);

  // 切换AOI绘制模式
  const toggleDrawingMode = useCallback((drawingType?: string) => {
    if (!drawingManagerRef.current || !mapRef.current) return;

    if (isDrawingMode) {
      drawingManagerRef.current.close();
      setIsDrawingMode(false);
    } else {
      // 打开绘制模式
      if (drawingType === 'polygon') {
        drawingManagerRef.current.setDrawingMode(window.BMAP_DRAWING_POLYGON);
      } else if (drawingType === 'circle') {
        drawingManagerRef.current.setDrawingMode(window.BMAP_DRAWING_CIRCLE);
      } else if (drawingType === 'rectangle') {
        drawingManagerRef.current.setDrawingMode(window.BMAP_DRAWING_RECTANGLE);
      } else {
        drawingManagerRef.current.setDrawingMode(window.BMAP_DRAWING_POLYGON);
      }
      drawingManagerRef.current.open();
      setIsDrawingMode(true);
    }
  }, [isDrawingMode]);

  // 取消AOI绘制
  const cancelDrawing = useCallback(() => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.close();
      setIsDrawingMode(false);
    }
  }, []);

  // 清除所有AOI
  const clearAllAOI = useCallback(() => {
    overlaysRef.current.forEach(overlay => {
      mapRef.current?.removeOverlay(overlay);
    });
    overlaysRef.current = [];
    setDrawnAOIs([]);
  }, []);

  // 定位到指定区域
  const panTo = useCallback((lng: number, lat: number, zoomLevel?: number) => {
    if (!mapRef.current) return;
    const point = new window.BMap.Point(lng, lat);
    mapRef.current.centerAndZoom(point, zoomLevel || zoom);
  }, [zoom]);

  return {
    mapRef,
    isMapReady,
    selectedCommunity,
    setSelectedCommunity,
    isDrawingMode,
    drawnAOIs,
    addCommunityMarkers,
    toggleDrawingMode,
    cancelDrawing,
    clearAllAOI,
    panTo
  };
}

export default useBaiduMap;
