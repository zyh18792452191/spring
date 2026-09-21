'use client';

import { useState, useRef, WheelEvent } from 'react';
import {
  Trash2, Save, Eye, Upload, Search, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Maximize2, Minimize2,
  ChevronRight, ChevronDown, AlertTriangle, AlertCircle, BarChart3, Users, Info, Send, RefreshCw, LayoutDashboard, X,
  TrendingUp, TrendingDown
} from 'lucide-react';
import DataInsightReports from '@/components/DataInsightReports';

export type NodeType = 'root' | 'category' | 'business_metric' | 'segment_metric' | 'customer_tag';

export interface TreeNode {
  id: string;
  name: string;
  metricCode?: string;
  type: NodeType;
  children: TreeNode[];
  collapsed?: boolean;
  value?: string;
  yoy?: number;
  isProblem?: boolean;
  isAlert?: boolean;
  direction?: 'positive' | 'negative';
  // 业务指标/客群指标特有字段
  metricGroup?: string;
  metricGroupName?: string;
  defaultMetric?: string;
  additionalMetric?: string;
  metricShortName?: string;
}

export default function ChurnRetentionTreePage() {
  // 初始指标树数据
  const [tree] = useState<TreeNode>({
    id: 'root',
    name: '离网客户价值保有',
    type: 'root',
    children: [
      {
        id: 'node-1',
        name: '价值保有指标',
        type: 'category',
        children: [
          {
            id: 'node-1-1',
            name: '拍照离网客户价值保有率',
            type: 'business_metric',
            value: '78.5%',
            yoy: 2.1,
            isProblem: true,
            isAlert: true,
            direction: 'positive',
            children: [
              {
                id: 'node-1-1-1',
                name: '拍照中高端客户保有率',
                type: 'segment_metric',
                value: '85.2%',
                yoy: 1.5,
                isProblem: false,
                isAlert: false,
                direction: 'positive',
                children: []
              },
              {
                id: 'node-1-1-2',
                name: '拍照全球通客户保有率',
                type: 'segment_metric',
                value: '82.8%',
                yoy: 2.3,
                isProblem: true,
                isAlert: false,
                direction: 'positive',
                children: []
              }
            ]
          },
          {
            id: 'node-1-2',
            name: '离网客户价值提升',
            type: 'business_metric',
            value: '12.3%',
            yoy: 3.2,
            isProblem: false,
            isAlert: false,
            direction: 'positive',
            children: []
          }
        ]
      },
      {
        id: 'node-2',
        name: '规模保有指标',
        type: 'category',
        children: [
          {
            id: 'node-2-1',
            name: '拍照离网客户规模',
            type: 'business_metric',
            value: '125.6万',
            yoy: -8.2,
            isProblem: true,
            isAlert: false,
            direction: 'negative',
            children: [
              {
                id: 'node-2-1-1',
                name: '拍照中高端客户规模',
                type: 'segment_metric',
                value: '85.3万',
                yoy: -6.5,
                isProblem: false,
                isAlert: false,
                direction: 'negative',
                children: []
              },
              {
                id: 'node-2-1-2',
                name: '拍照全球通客户规模',
                type: 'segment_metric',
                value: '40.3万',
                yoy: -11.2,
                isProblem: true,
                isAlert: true,
                direction: 'negative',
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'node-3',
        name: '客户标签分析',
        type: 'category',
        children: [
          {
            id: 'node-3-1',
            name: '年龄18-25离网客户',
            type: 'customer_tag',
            children: []
          },
          {
            id: 'node-3-2',
            name: '年龄25-30离网客户',
            type: 'customer_tag',
            children: []
          },
          {
            id: 'node-3-3',
            name: '网龄10年以上客户',
            type: 'customer_tag',
            children: []
          }
        ]
      }
    ]
  });

  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [showAlertList, setShowAlertList] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // 节点类型配置
  const nodeTypeConfig = {
    root: { label: '根节点', color: 'bg-blue-50 border-blue-300' },
    category: { label: '分类节点', color: 'bg-purple-50 border-purple-300' },
    business_metric: { label: '业务指标', color: 'bg-green-50 border-green-300' },
    segment_metric: { label: '客群指标', color: 'bg-orange-50 border-orange-300' },
    customer_tag: { label: '客户标签', color: 'bg-pink-50 border-pink-300' },
  };

  // 节点卡片组件
  const MetricCard = ({
    node,
    onToggleCollapse,
    onSelect
  }: {
    node: TreeNode;
    onToggleCollapse: (nodeId: string) => void;
    onSelect: (nodeId: string) => void;
  }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.id === selectedNodeId;
    const config = nodeTypeConfig[node.type];

    return (
      <div className="relative" title={node.name}>
        <div
          className={`
            relative w-[180px] h-[100px] p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm flex flex-col
            ${isSelected ? config.color : 'bg-white border-gray-300'}
            ${node.isProblem ? 'ring-2 ring-red-400' : ''}
          `}
          onClick={() => onSelect(node.id)}
        >
          {/* 节点类型标签 */}
          <div className={`text-xs mb-1 shrink-0 ${isSelected ? 'text-gray-500' : 'text-gray-600'}`}>
            {config.label}
          </div>

          {/* 指标编码 */}
          {node.metricCode && (
            <div className={`text-xs mb-1 shrink-0 truncate ${isSelected ? 'text-gray-500' : 'text-gray-600'}`} title={node.metricCode}>
              {node.metricCode}
            </div>
          )}

          {/* 节点名称 */}
          <div className={`text-sm font-medium leading-tight flex-1 overflow-hidden ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
            <div className="truncate" title={node.name}>
              {node.name}
            </div>
          </div>

          {/* 指标值和环比 */}
          {node.value && (
            <div className="flex items-center justify-between mt-2 gap-1">
              <div
                className={`text-sm font-bold ${
                  node.direction === 'positive' && node.yoy && node.yoy < 0
                    ? 'text-red-600'
                    : node.direction === 'positive'
                    ? 'text-green-600'
                    : node.yoy && node.yoy > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {node.value}
              </div>
              {node.yoy !== undefined && node.yoy !== null && (
                <div
                  className={`flex items-center gap-0.5 text-xs ${
                    node.direction === 'negative' && node.yoy < 0
                      ? 'text-green-600'
                      : node.direction === 'negative'
                      ? 'text-red-600'
                      : node.yoy > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {node.yoy > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : node.yoy < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  <span>{Math.abs(node.yoy)}%</span>
                </div>
              )}
            </div>
          )}

          {/* 问题指标标识 */}
          {node.isProblem && (
            <div className="absolute top-3 right-12">
              <div className="w-2 h-2 bg-red-500 rounded-full" title="问题指标" />
            </div>
          )}

          {/* 预警图标 */}
          {node.isAlert && (
            <button className="absolute top-3 right-6 hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </button>
          )}

          {/* 业务口径说明按钮 */}
          <button className="absolute top-3 right-3 hover:bg-gray-100 rounded transition-colors" title="业务口径说明">
            <Info className="w-4 h-4 text-gray-500" />
          </button>

          {/* 展开/收起按钮 */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(node.id);
              }}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all z-10"
            >
              {node.collapsed ? (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const toggleCollapse = (nodeId: string) => {
    // 实现展开/收起逻辑
    console.log('Toggle collapse:', nodeId);
  };

  const handleSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (nodeId !== 'root') {
      setShowAnalysisPanel(true);
    }
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const handlePan = (direction: 'left' | 'right' | 'up' | 'down') => {
    const step = 100;
    setTranslateX(prev => direction === 'left' ? prev - step : direction === 'right' ? prev + step : prev);
    setTranslateY(prev => direction === 'up' ? prev - step : direction === 'down' ? prev + step : prev);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => {
        const newScale = Math.max(0.25, Math.min(3, prev + delta));
        return newScale;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStartX(e.clientX - translateX);
      setDragStartY(e.clientY - translateY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && canvasRef.current) {
      requestAnimationFrame(() => {
        setTranslateX(e.clientX - dragStartX);
        setTranslateY(e.clientY - dragStartY);
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">离网维系指标树</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LayoutDashboard className="w-4 h-4" />
            <span>市场数智运营</span>
            <span>/</span>
            <span>客户运营</span>
            <span>/</span>
            <span>存量运营</span>
            <span>/</span>
            <span>离网维系</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlertList(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            预警列表
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 指标树画布 */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={canvasRef}
            className={`absolute inset-0 bg-gray-50 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="absolute origin-top-left"
              style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                left: '140px',
                top: '140px',
                willChange: 'transform',
              }}
            >
              <div className="flex items-start">
                <MetricCard
                  node={tree}
                  onToggleCollapse={toggleCollapse}
                  onSelect={handleSelect}
                />
              </div>
            </div>
          </div>

          {/* 底部工具栏 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={() => handlePan('left')}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePan('right')}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={() => {
                setScale(1);
                setTranslateX(0);
                setTranslateY(0);
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 右侧分析面板 */}
        {showAnalysisPanel && selectedNodeId && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedNodeId === 'root' ? '指标树信息' : '指标分析'}
                </h3>
                <button
                  onClick={() => setShowAnalysisPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* 指标分析内容 */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">分析面板</h4>
                  <p className="text-sm text-gray-600">
                    点击指标树中的节点查看详细分析
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">指标分析</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    展示该指标的详细数据、趋势分析和影响因素
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
                    去调度
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">客群分析</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    展示该指标关联的客群特征和智能分群标签
                  </p>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm transition-colors">
                    客群调度
                  </button>
                </div>

                {/* 数据洞察报告 */}
                <div className="border border-gray-200 rounded-lg">
                  <DataInsightReports 
                    pageId="insight.churn.tree" 
                    maxDisplay={3} 
                    showViewAll={true} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 预警列表弹窗 */}
      {showAlertList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">预警指标列表</h3>
              <button
                onClick={() => setShowAlertList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {/* 预警指标项 */}
              {[
                { name: '离网客户价值保有率', level: '高', value: '78.5%', yoy: 2.1 },
                { name: '拍照全球通客户规模', level: '中', value: '40.3万', yoy: -11.2 }
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        预警级别：<span className={`font-semibold ${alert.level === '高' ? 'text-red-600' : 'text-orange-600'}`}>{alert.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{alert.value}</div>
                    <div className={`text-sm ${alert.yoy > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {alert.yoy > 0 ? '+' : ''}{alert.yoy}%
                    </div>
                  </div>
                  <button className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    去调度
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
