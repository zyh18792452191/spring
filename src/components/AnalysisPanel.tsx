'use client';

import React, { useMemo, useState, useRef, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertCircle, Calendar, MoreVertical, Network, Tag, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IndicatorCardData } from './IndicatorTreeCard';
import CustomerGroupDispatchDialog from './CustomerGroupDispatchDialog';
import IndicatorDispatchDialog from './IndicatorDispatchDialog';
import { useMounted } from '@/hooks/useMounted';
import { getRegionDimensionData, getTopRegions, getBottomRegions, getRegionDisplayName, getSubRegionTypeName, isNational } from '@/data/regionDataAdapter';

interface AnalysisPanelProps {
  indicatorName: string;
  selectedIndicator?: string | null;
  indicatorTreeData?: IndicatorCardData[];
  analysisReasons: string[];
  regionData: Array<{ name: string; value: number }>;
  topRegions: string[];
  bottomRegions: string[];
  trendData: Array<{ month: string; value: number }>;
  currentTab?: string; // 当前激活的 tab（用于返回时回到对应的指标树）
  from?: string; // 来源页面标识（用于返回时知道是从哪个页面来的）
  businessScenario?: string; // 业务场景
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }; // 选中的区域编码
  regionDisplay?: string; // 区域显示名称
  showIndicatorDispatch?: boolean; // 是否显示指标调度按钮（默认 true）
  headerRight?: ReactNode; // 标题区右上角自定义内容（如时间/地区筛选）
  onStrategyDispatch?: () => void; // 点击"策略调度"按钮时触发（提供时不再跳转独立页面）
  hideHeaderActions?: boolean; // 隐藏标题区右上角全部控件（时间/区域筛选与调度按钮，用于控件上移至弹窗层）
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  indicatorName,
  selectedIndicator,
  indicatorTreeData,
  analysisReasons,
  regionData,
  topRegions,
  bottomRegions,
  trendData,
  currentTab = 'overview', // 默认值
  from = 'churn-retention', // 默认从 churn-retention 页面来
  businessScenario,
  selectedRegion = { cityCode: '650100', districtCode: '', gridCode: '' }, // 默认新疆维吾尔自治区乌鲁木齐
  regionDisplay = '乌鲁木齐',
  showIndicatorDispatch = true,
  headerRight,
  onStrategyDispatch,
  hideHeaderActions = false,
}) => {
  const mounted = useMounted();
  const router = useRouter();

  // 根据选中的区域计算实际显示的区域数据
  const actualRegionData = useMemo(() => {
    // 如果有网格选中，显示网格数据
    if (selectedRegion?.gridCode) {
      return [{ name: regionDisplay, value: 50 }];
    }
    // 如果有城市选中，显示该城市的网格数据
    if (selectedRegion?.cityCode) {
      return regionData && regionData.length > 0 ? regionData.slice(0, 8) : [];
    }
    // 默认返回省级数据
    return regionData && regionData.length > 0 ? regionData : [];
  }, [regionData, selectedRegion, regionDisplay]);

  // 根据选中的区域计算TOP/BOTTOM区域
  const actualTopRegions = useMemo(() => {
    if (selectedRegion?.gridCode) {
      return [regionDisplay];
    }
    return topRegions && topRegions.length > 0 ? topRegions : [];
  }, [topRegions, selectedRegion, regionDisplay]);

  const actualBottomRegions = useMemo(() => {
    if (selectedRegion?.gridCode) {
      return [];
    }
    return bottomRegions && bottomRegions.length > 0 ? bottomRegions : [];
  }, [bottomRegions, selectedRegion, regionDisplay]);

  // 区域维度标题
  const regionDimensionTitle = useMemo(() => {
    if (selectedRegion?.gridCode) {
      return `区域维度（${regionDisplay}）`;
    }
    if (selectedRegion?.cityCode) {
      return `区域维度（${regionDisplay}网格）`;
    }
    return '区域维度';
  }, [selectedRegion, regionDisplay]);

  // 网络图缩放和平移状态
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 客群调度弹窗状态
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);

  // 指标调度弹窗状态
  const [indicatorDispatchDialogOpen, setIndicatorDispatchDialogOpen] = useState(false);

  const selectedNode = useMemo(() => {
    if (!selectedIndicator || !indicatorTreeData) return null;

    const findNode = (nodes: IndicatorCardData[]): IndicatorCardData | null => {
      for (const node of nodes) {
        if (node.id === selectedIndicator) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(indicatorTreeData);
  }, [selectedIndicator, indicatorTreeData]);

  // 判断是否是客群节点
  const isCustomerGroup = useMemo(() => {
    return selectedNode?.name.includes('潜在离网') || selectedNode?.name.includes('客群');
  }, [selectedNode?.name]);

  // 查找当前选中节点的父节点
  const parentNode = useMemo(() => {
    if (!selectedIndicator || !indicatorTreeData) return null;

    // 返回值: 找到父节点返回父节点，当前节点是顶层节点返回'root'，未找到返回null
    const findParent = (nodes: IndicatorCardData[], targetId: string, parent: IndicatorCardData | null): IndicatorCardData | null | 'root' => {
      for (const node of nodes) {
        if (node.id === targetId) return parent === null ? 'root' : parent;
        if (node.children) {
          const found = findParent(node.children, targetId, node);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const result = findParent(indicatorTreeData, selectedIndicator, null);
    return result === 'root' ? null : result;
  }, [selectedIndicator, indicatorTreeData]);

  // 显示的指标名称（优先显示选中的指标）
  const displayIndicatorName = selectedNode?.name || indicatorName;

  // 父级指标名称（用于客群调度指标设置）
  const parentIndicatorName = parentNode?.name || displayIndicatorName;

  // 缩放和平移处理函数
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(0.5, scale + delta), 3);
    setScale(newScale);
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // 左键拖拽
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  }, [translateX, translateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newTranslateX = e.clientX - dragStart.x;
      const newTranslateY = e.clientY - dragStart.y;
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // 根据省份名称确定柱状图颜色
  const getBarColor = (name: string) => {
    const excellent = ['巴州', '博州'];
    const poor = ['石河子', '昌吉'];
    if (excellent.includes(name)) return '#67C23A'; // 绿色
    if (poor.includes(name)) return '#F56C6C'; // 红色
    return '#0085D0'; // 蓝色
  };

  if (!mounted) return null;

  return (
    <div className="bg-white p-6 h-[600px] flex flex-col gap-6 overflow-y-auto">
      {/* 标题 */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            {isCustomerGroup ? (
              // 客群分析标题
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  客群分析-{displayIndicatorName}
                </h2>
                {selectedNode && (
                  <span className="bg-[#4080FF] text-white text-xs px-3 py-1 rounded-full">
                    客群规模 {selectedNode.value}
                  </span>
                )}
              </div>
            ) : (
              // 指标分析标题
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  指标分析
                </h2>
                <p className="text-sm text-gray-600 mt-1">{displayIndicatorName}</p>
                {selectedNode && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      当前值：
                    </span>
                    <span className="text-lg font-bold text-[#0085D0]">{selectedNode.value}</span>
                    {selectedNode.yoy && selectedNode.yoy !== '-' && (
                      <span className={`text-sm font-medium ${
                        selectedNode.yoy.toString().startsWith('-') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedNode.yoy}{selectedNode.yoyUnit || ''}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          {!hideHeaderActions && (
            <div className="flex items-center gap-2">
              {headerRight}
              {isCustomerGroup ? (
                // 客群分析按钮
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#1E88E5] font-medium hover:text-[#1565C0]"
                  onClick={() => setDispatchDialogOpen(true)}
                >
                  客群调度
                </Button>
              ) : (
                // 指标分析按钮
                <>
                  {showIndicatorDispatch && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setIndicatorDispatchDialogOpen(true)}
                    >
                      指标调度
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onStrategyDispatch) {
                        onStrategyDispatch();
                        return;
                      }
                      const url = new URL('/workspace/strategy/matching', window.location.origin);
                      url.searchParams.set('indicatorName', displayIndicatorName);
                      url.searchParams.set('from', from); // 传递来源页面
                      // 始终传递 tab 参数（除了 undefined 的情况）
                      if (currentTab) {
                        url.searchParams.set('tab', currentTab);
                      }
                      console.log('[AnalysisPanel] Navigate to:', url.toString(), 'currentTab:', currentTab, 'from:', from);
                      router.push(url.toString());
                    }}
                  >
                    策略调度
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 客群分析内容 */}
      {isCustomerGroup && (
        <>
          {/* 模块1: 客群关系网络图 */}
          <div className="flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-[#4080FF]" />
                客群关系网络图
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                  title="缩小"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                </Button>
                <span className="text-xs text-gray-600 w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                  title="放大"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 w-7 p-0 hover:bg-gray-200 ml-1"
                  title="重置"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                </Button>
              </div>
            </div>
            <div
              ref={containerRef}
              className="p-4 h-[350px] bg-white overflow-hidden"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div
                className="w-full h-full bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden"
                style={{
                  transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                {/* 网络图背景网格 */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9CA3AF" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* 核心节点 - 异网主卡客 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-20 h-20 rounded-full bg-[#4080FF] shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-2">{displayIndicatorName}</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">{selectedNode?.value}</span>
                </div>

                {/* 关联节点 - 当月ARPU */}
                <div className="absolute left-[20%] top-[30%] flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#6699FF] shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium">当月ARPU</span>
                  </div>
                </div>

                {/* 关联节点 - 当月流量 */}
                <div className="absolute right-[20%] top-[30%] flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#6699FF] shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium">当月流量</span>
                  </div>
                </div>

                {/* 关联节点 - 异网宽带用户 */}
                <div className="absolute left-[15%] bottom-[25%] flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#6699FF] shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">异网宽带用户</span>
                  </div>
                </div>

                {/* 关联节点 - 是否转低消保号 */}
                <div className="absolute right-[15%] bottom-[25%] flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#6699FF] shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">是否转低消保号</span>
                  </div>
                </div>

                {/* 关联节点 - 合约即将到期 */}
                <div className="absolute right-[45%] top-[15%] flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-[#6699FF] shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">合约即将到期</span>
                  </div>
                </div>

                {/* 属性节点 */}
                <div className="absolute left-[10%] top-[40%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">&lt;50元</span>
                  </div>
                </div>
                <div className="absolute left-[10%] top-[50%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">50-100元</span>
                  </div>
                </div>
                <div className="absolute right-[10%] top-[40%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">&lt;1GB</span>
                  </div>
                </div>
                <div className="absolute right-[10%] top-[50%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">1-5GB</span>
                  </div>
                </div>
                <div className="absolute left-[10%] bottom-[35%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">是</span>
                  </div>
                </div>
                <div className="absolute right-[10%] bottom-[35%]">
                  <div className="w-8 h-8 rounded-full bg-[#66CC99] shadow-sm flex items-center justify-center">
                    <span className="text-white text-[10px]">无合约</span>
                  </div>
                </div>

                {/* 连接线 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#9CA3AF" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#9CA3AF" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="15%" y2="75%" stroke="#9CA3AF" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="85%" y2="75%" stroke="#9CA3AF" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="55%" y2="15%" stroke="#9CA3AF" strokeWidth="1.5" />
                  <line x1="20%" y1="30%" x2="10%" y2="40%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="20%" y1="30%" x2="10%" y2="50%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="80%" y1="30%" x2="90%" y2="40%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="80%" y1="30%" x2="90%" y2="50%" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3" />
                </svg>
              </div>
            </div>
          </div>

          {/* 模块2: 智能分群标签TOP5 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#4080FF]" />
                智能分群标签TOP5
              </h3>
            </div>
            <div className="overflow-auto max-h-[200px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-xs font-medium text-gray-600 px-4 py-2 text-left w-12">排序</th>
                    <th className="text-xs font-medium text-gray-600 px-4 py-2 text-left">标签名称</th>
                    <th className="text-xs font-medium text-gray-600 px-4 py-2 text-left w-20">关联度</th>
                    <th className="text-xs font-medium text-gray-600 px-4 py-2 text-left">标签值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="text-xs font-medium text-gray-900 px-4 py-3">1</td>
                    <td className="text-xs text-gray-900 px-4 py-3">是否转低消保号</td>
                    <td className="text-xs text-gray-600 px-4 py-3">15.43%</td>
                    <td className="text-xs text-gray-600 px-4 py-3">【是】57.58%；【否】42.42%；</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="text-xs font-medium text-gray-900 px-4 py-3">2</td>
                    <td className="text-xs text-gray-900 px-4 py-3">异网宽带用户</td>
                    <td className="text-xs text-gray-600 px-4 py-3">11.42%</td>
                    <td className="text-xs text-gray-600 px-4 py-3">【是】65.06%；【否】34.94%；</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="text-xs font-medium text-gray-900 px-4 py-3">3</td>
                    <td className="text-xs text-gray-900 px-4 py-3">当月流量</td>
                    <td className="text-xs text-gray-600 px-4 py-3">10.38%</td>
                    <td className="text-xs text-gray-600 px-4 py-3">【&lt;1GB】35.52%；【1-5GB】29.94%；【5-10GB】17.94%；【10-20GB】10.52%；【20GB以上】6.10%；</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="text-xs font-medium text-gray-900 px-4 py-3">4</td>
                    <td className="text-xs text-gray-900 px-4 py-3">当月ARPU</td>
                    <td className="text-xs text-gray-600 px-4 py-3">9.36%</td>
                    <td className="text-xs text-gray-600 px-4 py-3">【&lt;50元】68.10%；【50-100元】14.90%；【100-150元】9.35%；【150-200元】5.45%；【200元以上】2.19%；</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="text-xs font-medium text-gray-900 px-4 py-3">5</td>
                    <td className="text-xs text-gray-900 px-4 py-3">合约即将到期</td>
                    <td className="text-xs text-gray-600 px-4 py-3">8.76%</td>
                    <td className="text-xs text-gray-600 px-4 py-3">【无合约】92.56%；【合约已到期】4.72%；【未到期】2.72%；</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 普通指标分析内容 */}
      {!isCustomerGroup && (
        <>
          {/* 分析原因 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-[#0085D0] px-4 py-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                分析原因
              </h3>
            </div>
            <div className="p-4 bg-white">
              <div className="space-y-2">
                {analysisReasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0085D0] font-medium">{index + 1}.</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 区域维度 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{regionDimensionTitle}</h3>

            {/* 前三后三 */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">前三</div>
                <div className="flex flex-wrap gap-2">
                  {actualTopRegions.map((region, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">后三</div>
                <div className="flex flex-wrap gap-2">
                  {actualBottomRegions.map((region, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 柱状图 */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actualRegionData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#60B3E2" radius={[4, 4, 0, 0]}>
                    {actualRegionData.map((entry, index) => (
                      <rect key={`bar-${index}`} fill={getBarColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 时间维度 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">时间维度（近6个月）</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0085D0"
                    fill="#0085D0"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* 客群调度弹窗 */}
      <CustomerGroupDispatchDialog
        open={dispatchDialogOpen}
        onClose={() => setDispatchDialogOpen(false)}
        indicatorName={parentIndicatorName}
        indicatorValue={String(selectedNode?.value || '')}
        businessScenario={businessScenario}
      />

      {/* 指标调度弹窗 */}
      <IndicatorDispatchDialog
        open={indicatorDispatchDialogOpen}
        onClose={() => setIndicatorDispatchDialogOpen(false)}
        indicatorName={displayIndicatorName}
        scenario={businessScenario}
      />
    </div>
  );
};

export default AnalysisPanel;
