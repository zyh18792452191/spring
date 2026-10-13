'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Film, Plus, Trash2, Users, MessageSquare, Phone, Monitor,
  Store, Send, Clock, ArrowDown, CheckCircle, X, GripVertical,
  Package, FileText, Settings2, Sparkles
} from 'lucide-react';

/** 剧本类型 */
type ScriptType = 'multi-wave' | 'batch';

/** 流程节点类型 */
type NodeType = 'customerGroup' | 'channel' | 'product' | 'script' | 'rule';

/** 节点类型配置 */
const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string; icon: React.ElementType }> = {
  customerGroup: { label: '选客群', color: 'bg-blue-500', icon: Users },
  channel: { label: '选渠道', color: 'bg-emerald-500', icon: Send },
  product: { label: '选产品', color: 'bg-blue-500', icon: Package },
  script: { label: '选话术', color: 'bg-violet-500', icon: FileText },
  rule: { label: '幕间规则', color: 'bg-amber-500', icon: Settings2 },
};

/** 渠道选项 */
const CHANNEL_OPTIONS = [
  { value: 'crm-unified', label: 'CRM统一运营位' },
  { value: 'crm-front', label: 'CRM前台营业厅' },
  { value: 'sms', label: '短信营业平台' },
  { value: '5g-msg', label: '5G消息' },
  { value: 'timing-lib', label: '时机库' },
  { value: '10086', label: '10086客服' },
  { value: 'internet', label: '互联网公司' },
  { value: 'app-alliance', label: '渠道联盟APP' },
  { value: 'online-outbound', label: '在线外呼' },
  { value: 'install-app', label: '装维APP' },
  { value: 'smart-outbound', label: '智能外呼' },
  { value: 'mms', label: '彩信' },
  { value: 'wechat-hall', label: '微信营业厅' },
  { value: 'lebo-tv', label: '乐播TV' },
  { value: 'migu-app', label: '咪咕通APP' },
];

/** 业务场景选项 */
const SCENARIOS = [
  '流量运营', '中高端客户运营', '离网维系', '家庭融合运营', '国际业务运营', '增量运营',
];

/** 流程节点 */
interface FlowNode {
  id: string;
  type: NodeType;
  data: Record<string, string>;
}

/** 幕间规则 */
interface IntermissionRule {
  id: string;
  contactStatus: string;
  orderStatus: string;
  timeWindow: number;
  timeUnit: 'hours' | 'days';
}

/** 批量活动流程 */
interface BatchFlow {
  id: string;
  name: string;
  nodes: FlowNode[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

/** 创建默认幕节点序列 */
function createDefaultActNodes(prefillCustomerGroup = ''): FlowNode[] {
  return [
    { id: generateId(), type: 'customerGroup', data: { customerGroup: prefillCustomerGroup } },
    { id: generateId(), type: 'channel', data: { channel: '', position: '', activityType: '', triggerEvent: '', wording: '' } },
    { id: generateId(), type: 'product', data: { product: '' } },
    { id: generateId(), type: 'script', data: { script: '' } },
  ];
}

/** 画布节点卡片 */
function CanvasNodeCard({
  node,
  isSelected,
  actIndex,
  onClick,
  onDelete,
}: {
  node: FlowNode;
  isSelected: boolean;
  actIndex: number;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const config = NODE_TYPE_CONFIG[node.type];
  const Icon = config.icon;

  /** 获取节点摘要文本 */
  const getSummary = (): string => {
    switch (node.type) {
      case 'customerGroup': return node.data.customerGroup || '未选择客群';
      case 'channel': return node.data.channel ? CHANNEL_OPTIONS.find(c => c.value === node.data.channel)?.label || node.data.channel : '未选择渠道';
      case 'product': return node.data.product || '未选择产品';
      case 'script': return node.data.script ? `${node.data.script.substring(0, 20)}...` : '未配置话术';
      case 'rule': return `${node.data.contactStatus || '未接触'} + ${node.data.orderStatus || '未办理'} → 等待${node.data.timeWindow || 3}${node.data.timeUnit === 'days' ? '天' : '小时'}`;
      default: return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-card border rounded-lg cursor-pointer transition-all duration-200
        hover:shadow-md group
        ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border'}
      `}
    >
      {/* 标题栏 */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-white text-sm font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
        {actIndex > 0 && (
          <span className="ml-auto text-xs opacity-80">第{actIndex}幕</span>
        )}
      </div>
      {/* 内容 */}
      <div className="px-3 py-2">
        <p className="text-sm text-foreground truncate">{getSummary()}</p>
      </div>
      {/* 删除按钮 */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-muted/80 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/** 节点间箭头连接 */
function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      {label && <span className="text-xs text-amber-600 font-medium mb-0.5">{label}</span>}
      <ArrowDown className="w-5 h-5 text-emerald-500" />
    </div>
  );
}

/** 底部组件库拖拽项 */
function ComponentLibraryItem({ type, onAdd }: { type: NodeType; onAdd: () => void }) {
  const config = NODE_TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm"
    >
      <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-foreground">{config.label}</span>
      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}

/** 右侧配置面板 */
function ConfigPanel({
  node,
  onUpdate,
  onClose,
}: {
  node: FlowNode;
  onUpdate: (data: Record<string, string>) => void;
  onClose: () => void;
}) {
  const config = NODE_TYPE_CONFIG[node.type];
  const Icon = config.icon;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg h-full flex flex-col">
      {/* 面板头 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded flex items-center justify-center text-white ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium">{config.label}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {node.type === 'customerGroup' && (
          <>
            <div>
              <Label className="text-sm font-medium">客群名称</Label>
              <Input
                value={node.data.customerGroup || ''}
                onChange={(e) => onUpdate({ ...node.data, customerGroup: e.target.value })}
                placeholder="输入或选择客群"
                className="mt-1.5"
              />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              可从经分标签圈选、标签库筛选、客群编码导入等方式选择客群
            </div>
          </>
        )}

        {node.type === 'channel' && (
          <>
            {/* 渠道标签选择 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">渠道类型</Label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNEL_OPTIONS.map(ch => (
                  <button
                    key={ch.value}
                    onClick={() => onUpdate({ ...node.data, channel: ch.value })}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      node.data.channel === ch.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
            {/* 已选渠道标签 */}
            {node.data.channel && (
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {CHANNEL_OPTIONS.find(c => c.value === node.data.channel)?.label}
                </Badge>
                <button
                  onClick={() => onUpdate({ ...node.data, channel: '' })}
                  className="w-4 h-4 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <Separator />
            {/* 渠道配置表单 */}
            <div>
              <Label className="text-sm font-medium">运营位 <span className="text-destructive">*</span></Label>
              <Select value={node.data.position || ''} onValueChange={(v) => onUpdate({ ...node.data, position: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="请选择运营位" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unified-crm">统一运营位CRM</SelectItem>
                  <SelectItem value="front-crm">前台运营位CRM</SelectItem>
                  <SelectItem value="sms-platform">短信平台运营位</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">活动类型 <span className="text-destructive">*</span></Label>
              <Select value={node.data.activityType || ''} onValueChange={(v) => onUpdate({ ...node.data, activityType: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="请选择活动类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">主推活动</SelectItem>
                  <SelectItem value="assist">辅助活动</SelectItem>
                  <SelectItem value="follow">跟进活动</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">触发事件 <span className="text-destructive">*</span></Label>
              <Select value={node.data.triggerEvent || ''} onValueChange={(v) => onUpdate({ ...node.data, triggerEvent: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="请选择触发事件" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm-biz">CRM业务办理触发事件</SelectItem>
                  <SelectItem value="sms-receive">短信接收触发事件</SelectItem>
                  <SelectItem value="app-login">手厅登录触发事件</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">活动用语 <span className="text-destructive">*</span></Label>
              <Input
                value={node.data.wording || ''}
                onChange={(e) => onUpdate({ ...node.data, wording: e.target.value })}
                placeholder="请输入活动展示用语"
                className="mt-1.5"
              />
            </div>
          </>
        )}

        {node.type === 'product' && (
          <>
            <div>
              <Label className="text-sm font-medium">推荐产品/套餐</Label>
              <Select value={node.data.product || ''} onValueChange={(v) => onUpdate({ ...node.data, product: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="请选择产品" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100-flow">100元流量月包</SelectItem>
                  <SelectItem value="5g-upgrade">5G升级包</SelectItem>
                  <SelectItem value="family-fusion">家庭融合套餐</SelectItem>
                  <SelectItem value="global-pass">全球通尊享套餐</SelectItem>
                  <SelectItem value="broadband">千兆宽带套餐</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              产品来自产商品中心，可按业务场景筛选
            </div>
          </>
        )}

        {node.type === 'script' && (
          <>
            <div>
              <Label className="text-sm font-medium">话术模板</Label>
              <Select value={node.data.script || ''} onValueChange={(v) => onUpdate({ ...node.data, script: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="请选择话术模板" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flow-alert">流量达量预警话术</SelectItem>
                  <SelectItem value="5g-recommend">5G升级推荐话术</SelectItem>
                  <SelectItem value="retain-offer">维系挽留话术</SelectItem>
                  <SelectItem value="family-promo">家庭融合推荐话术</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">自定义话术</Label>
              <textarea
                value={node.data.customScript || ''}
                onChange={(e) => onUpdate({ ...node.data, customScript: e.target.value })}
                placeholder="可在此编辑自定义话术内容..."
                className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </>
        )}

        {node.type === 'rule' && (
          <>
            <div>
              <Label className="text-sm font-medium">接触状态</Label>
              <Select value={node.data.contactStatus || '未接触'} onValueChange={(v) => onUpdate({ ...node.data, contactStatus: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="已接触">已接触</SelectItem>
                  <SelectItem value="未接触">未接触</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">办理状态</Label>
              <Select value={node.data.orderStatus || '未办理'} onValueChange={(v) => onUpdate({ ...node.data, orderStatus: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="已办理">已办理</SelectItem>
                  <SelectItem value="未办理">未办理</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">等待时间窗口</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="number"
                  value={node.data.timeWindow || '3'}
                  onChange={(e) => onUpdate({ ...node.data, timeWindow: e.target.value })}
                  className="w-20"
                />
                <Select value={node.data.timeUnit || 'days'} onValueChange={(v) => onUpdate({ ...node.data, timeUnit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">小时</SelectItem>
                    <SelectItem value="days">天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded p-2 border border-amber-200 dark:border-amber-800">
              幕间规则：当前幕执行后，按接触状态和办理状态筛选客户，等待指定时间后进入下一幕
            </div>
          </>
        )}
      </div>

      {/* 底部确定按钮 */}
      <div className="px-4 py-3 border-t border-border">
        <Button className="w-full" onClick={onClose}>确定</Button>
      </div>
    </div>
  );
}

export function ScriptMarketingContent({ embedded = false }: { embedded?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL预填参数
  const prefillCustomerGroup = searchParams.get('prefillCustomerGroup') || '';
  const sourceType = searchParams.get('sourceType') || '';
  const workOrderId = searchParams.get('workOrderId') || '';

  // 基础状态
  const [scriptType, setScriptType] = useState<ScriptType>('multi-wave');
  const [activityName, setActivityName] = useState('');
  const [scenario, setScenario] = useState('');
  const [execTimeRange, setExecTimeRange] = useState({ start: '', end: '' });
  const [approver, setApprover] = useState('');

  // 画布状态
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // 多波次流程：每幕是一组nodes，幕间是rule节点
  const [actNodes, setActNodes] = useState<FlowNode[][]>([
    createDefaultActNodes(prefillCustomerGroup),
  ]);
  const [intermissionRules, setIntermissionRules] = useState<FlowNode[]>([]);

  // 批量策划：每个活动是一组nodes
  const [batchFlows, setBatchFlows] = useState<BatchFlow[]>([
    { id: generateId(), name: '活动1', nodes: createDefaultActNodes(prefillCustomerGroup) },
  ]);

  // 客群预填
  useEffect(() => {
    if (prefillCustomerGroup) {
      if (scriptType === 'multi-wave') {
        setActNodes(prev => {
          if (prev[0]) {
            const firstAct = [...prev[0]];
            const cgIndex = firstAct.findIndex(n => n.type === 'customerGroup');
            if (cgIndex >= 0) {
              firstAct[cgIndex] = { ...firstAct[cgIndex], data: { ...firstAct[cgIndex].data, customerGroup: prefillCustomerGroup } };
            }
            return [firstAct, ...prev.slice(1)];
          }
          return prev;
        });
      } else {
        setBatchFlows(prev => {
          if (prev[0]) {
            const firstFlow = { ...prev[0], nodes: [...prev[0].nodes] };
            const cgIndex = firstFlow.nodes.findIndex(n => n.type === 'customerGroup');
            if (cgIndex >= 0) {
              firstFlow.nodes[cgIndex] = { ...firstFlow.nodes[cgIndex], data: { ...firstFlow.nodes[cgIndex].data, customerGroup: prefillCustomerGroup } };
            }
            return [firstFlow, ...prev.slice(1)];
          }
          return prev;
        });
      }
    }
  }, [prefillCustomerGroup, scriptType]);

  // 获取当前选中的节点
  const getSelectedNode = useCallback((): FlowNode | null => {
    // 多波次
    for (const act of actNodes) {
      const found = act.find(n => n.id === selectedNodeId);
      if (found) return found;
    }
    const ruleFound = intermissionRules.find(n => n.id === selectedNodeId);
    if (ruleFound) return ruleFound;
    // 批量
    for (const flow of batchFlows) {
      const found = flow.nodes.find(n => n.id === selectedNodeId);
      if (found) return found;
    }
    return null;
  }, [selectedNodeId, actNodes, intermissionRules, batchFlows]);

  // 更新节点数据
  const updateNodeData = useCallback((nodeId: string, data: Record<string, string>) => {
    // 多波次 actNodes
    setActNodes(prev => prev.map(act =>
      act.map(n => n.id === nodeId ? { ...n, data } : n)
    ));
    // 幕间规则
    setIntermissionRules(prev => prev.map(n =>
      n.id === nodeId ? { ...n, data } : n
    ));
    // 批量
    setBatchFlows(prev => prev.map(flow => ({
      ...flow,
      nodes: flow.nodes.map(n => n.id === nodeId ? { ...n, data } : n),
    })));
  }, []);

  // 节点点击
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowConfigPanel(true);
  };

  // 添加幕（多波次）
  const addAct = () => {
    const newNodes = createDefaultActNodes();
    const newRule: FlowNode = {
      id: generateId(), type: 'rule',
      data: { contactStatus: '未接触', orderStatus: '未办理', timeWindow: '3', timeUnit: 'days' },
    };
    setActNodes([...actNodes, newNodes]);
    setIntermissionRules([...intermissionRules, newRule]);
  };

  // 删除幕
  const removeAct = (actIndex: number) => {
    if (actIndex === 0) return;
    setActNodes(actNodes.filter((_, i) => i !== actIndex));
    setIntermissionRules(intermissionRules.filter((_, i) => i !== actIndex - 1));
  };

  // 在幕中添加节点
  const addNodeToAct = (actIndex: number, type: NodeType) => {
    const newNode: FlowNode = { id: generateId(), type, data: {} };
    setActNodes(prev => prev.map((act, i) => i === actIndex ? [...act, newNode] : act));
  };

  // 从幕中删除节点
  const removeNodeFromAct = (actIndex: number, nodeId: string) => {
    setActNodes(prev => prev.map((act, i) => i === actIndex ? act.filter(n => n.id !== nodeId) : act));
  };

  // 批量：添加/删除活动
  const addBatchFlow = () => {
    setBatchFlows([...batchFlows, { id: generateId(), name: `活动${batchFlows.length + 1}`, nodes: createDefaultActNodes() }]);
  };
  const removeBatchFlow = (index: number) => {
    setBatchFlows(batchFlows.filter((_, i) => i !== index));
  };
  const addNodeToBatch = (flowIndex: number, type: NodeType) => {
    const newNode: FlowNode = { id: generateId(), type, data: {} };
    setBatchFlows(prev => prev.map((f, i) => i === flowIndex ? { ...f, nodes: [...f.nodes, newNode] } : f));
  };
  const removeNodeFromBatch = (flowIndex: number, nodeId: string) => {
    setBatchFlows(prev => prev.map((f, i) => i === flowIndex ? { ...f, nodes: f.nodes.filter(n => n.id !== nodeId) } : f));
  };

  // 提交审批
  const handleSubmit = () => {
    alert('剧本营销活动已提交审批，将在IOP平台创建活动。');
  };

  // 返回
  const handleBack = () => {
    if (sourceType) {
      router.back();
    } else {
      router.push('/portal/capability/strategy/script-marketing');
    }
  };

  const selectedNode = getSelectedNode();

  return (
    <div className={embedded ? 'h-[75vh] flex flex-col bg-background border rounded-lg overflow-hidden' : 'h-screen flex flex-col bg-background'}>
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          {!embedded && (
            <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← 返回列表
            </button>
          )}
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <span className="font-medium">剧本营销</span>
          </div>
          {prefillCustomerGroup && (
            <Badge variant="outline" className="text-xs">
              客群：{prefillCustomerGroup}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* 剧本类型切换 */}
          <RadioGroup value={scriptType} onValueChange={(v) => setScriptType(v as ScriptType)} className="flex gap-1">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="multi-wave" id="multi-wave" />
              <Label htmlFor="multi-wave" className="text-sm cursor-pointer">多波次流程</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="batch" id="batch" />
              <Label htmlFor="batch" className="text-sm cursor-pointer">批量策划多个活动</Label>
            </div>
          </RadioGroup>
          <Separator orientation="vertical" className="h-4" />
          {/* 基础信息 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>活动名称：</span>
            <Input
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="请输入"
              className="w-40 h-7 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 主体：画布 + 配置面板 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：流程画布区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 画布内容 */}
          <div className="flex-1 overflow-auto p-6" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}>
            {scriptType === 'multi-wave' ? (
              /* 多波次流程画布 */
              <div className="max-w-md mx-auto">
                {actNodes.map((act, actIndex) => (
                  <React.Fragment key={actIndex}>
                    {/* 幕标签 */}
                    {actIndex > 0 && (
                      <div className="text-center mb-2">
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300">
                          第{actIndex + 1}幕
                        </Badge>
                      </div>
                    )}
                    {actIndex === 0 && (
                      <div className="text-center mb-2">
                        <Badge className="bg-blue-500">第一幕</Badge>
                      </div>
                    )}
                    {/* 幕内节点 */}
                    {act.map((node, nodeIndex) => (
                      <React.Fragment key={node.id}>
                        <CanvasNodeCard
                          node={node}
                          isSelected={selectedNodeId === node.id}
                          actIndex={actIndex + 1}
                          onClick={() => handleNodeClick(node.id)}
                          onDelete={node.type !== 'customerGroup' ? () => removeNodeFromAct(actIndex, node.id) : undefined}
                        />
                        {nodeIndex < act.length - 1 && <FlowArrow />}
                      </React.Fragment>
                    ))}
                    {/* 删除幕按钮 */}
                    {actIndex > 0 && (
                      <div className="flex justify-end mt-1">
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => removeAct(actIndex)}>
                          <Trash2 className="w-3 h-3 mr-1" />删除此幕
                        </Button>
                      </div>
                    )}
                    {/* 幕间规则 */}
                    {actIndex < actNodes.length - 1 && intermissionRules[actIndex] && (
                      <>
                        <FlowArrow />
                        <CanvasNodeCard
                          node={intermissionRules[actIndex]}
                          isSelected={selectedNodeId === intermissionRules[actIndex].id}
                          actIndex={actIndex + 1}
                          onClick={() => handleNodeClick(intermissionRules[actIndex].id)}
                        />
                        <FlowArrow />
                      </>
                    )}
                    {actIndex === actNodes.length - 1 && actNodes.length > 1 && <FlowArrow />}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* 批量策划画布 */
              <div className="flex gap-6 flex-wrap justify-center">
                {batchFlows.map((flow, flowIndex) => (
                  <div key={flow.id} className="w-64 border border-border rounded-lg bg-card/50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        value={flow.name}
                        onChange={(e) => setBatchFlows(prev => prev.map((f, i) => i === flowIndex ? { ...f, name: e.target.value } : f))}
                        className="h-7 text-sm font-medium border-none bg-transparent p-0 focus-visible:ring-0"
                      />
                      {flowIndex > 0 && (
                        <button onClick={() => removeBatchFlow(flowIndex)} className="w-5 h-5 rounded hover:bg-destructive/10 flex items-center justify-center">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                    {flow.nodes.map((node, nodeIndex) => (
                      <React.Fragment key={node.id}>
                        <CanvasNodeCard
                          node={node}
                          isSelected={selectedNodeId === node.id}
                          actIndex={flowIndex + 1}
                          onClick={() => handleNodeClick(node.id)}
                          onDelete={node.type !== 'customerGroup' ? () => removeNodeFromBatch(flowIndex, node.id) : undefined}
                        />
                        {nodeIndex < flow.nodes.length - 1 && <FlowArrow />}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
                {/* 添加活动卡片 */}
                <button
                  onClick={addBatchFlow}
                  className="w-64 min-h-[200px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">添加活动</span>
                </button>
              </div>
            )}
          </div>

          {/* 底部：活动元素组件库 */}
          <div className="shrink-0 border-t border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">活动元素组件</span>
              <div className="flex gap-2">
                {(['customerGroup', 'channel', 'product', 'script'] as NodeType[]).map(type => (
                  <ComponentLibraryItem
                    key={type}
                    type={type}
                    onAdd={() => {
                      if (scriptType === 'multi-wave') {
                        addNodeToAct(actNodes.length - 1, type);
                      } else {
                        addNodeToBatch(batchFlows.length - 1, type);
                      }
                    }}
                  />
                ))}
                {scriptType === 'multi-wave' && (
                  <button
                    onClick={addAct}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-sm text-amber-700 dark:text-amber-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>添加新幕</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：节点配置面板 */}
        {showConfigPanel && selectedNode && (
          <div className="w-[380px] shrink-0 border-l border-border p-3">
            <ConfigPanel
              node={selectedNode}
              onUpdate={(data) => updateNodeData(selectedNode.id, data)}
              onClose={() => { setShowConfigPanel(false); setSelectedNodeId(null); }}
            />
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-border bg-card">
        <Button variant="outline" onClick={handleBack}>
          返回
        </Button>
        <div className="flex items-center gap-3">
          {/* 基础信息快捷输入 */}
          <div className="flex items-center gap-2 text-sm">
            <Label className="text-muted-foreground shrink-0">业务场景</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger className="w-36 h-7 text-sm"><SelectValue placeholder="请选择" /></SelectTrigger>
              <SelectContent>
                {SCENARIOS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Label className="text-muted-foreground shrink-0">审批人</Label>
            <Input value={approver} onChange={(e) => setApprover(e.target.value)} placeholder="请输入" className="w-28 h-7 text-sm" />
          </div>
          <Button onClick={handleSubmit} disabled={!activityName || !scenario || !approver}>
            提交审批
          </Button>
        </div>
      </div>
    </div>
  );
}
