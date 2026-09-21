'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, ArrowRight, Save, Upload, X, Plus, Trash2, GripVertical,
  ChevronRight, HelpCircle, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw,
  Play, Circle, Diamond, User, Settings, Globe, MousePointer, Link2,
  UploadIcon, Minus, Search
} from 'lucide-react';

// ===================== TYPES =====================

type StepType = 'basic' | 'fillForm' | 'feedbackForm' | 'flowDesign' | 'evaluation';

interface BasicInfo {
  name: string;
  businessType: string;
  ticketType: string;
  roles: string[];
  launchSystem: 'self' | 'external';
  timeLimitType: 'configured' | 'none' | 'onFill';
  timeLimitHours: number;
  timeLimitCalc: string;
  excludeNonWork: string;
  setProperty: 'both' | 'flow' | 'template';
  description: string;
}

interface FormComponent {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  fieldName: string;
  required: boolean;
  options?: { label: string; value: string }[];
  gridSpan?: number;
}

interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'gateway' | 'system' | 'external';
  name: string;
  x: number;
  y: number;
  properties?: Record<string, string>;
  branchConditions?: { condition: string; targetId: string }[];
}

interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

// ===================== DATA =====================

const BUSINESS_TYPES = ['管理类', '生产类', '审批类', '测试'];
const TICKET_TYPES = ['指标调度', '策略调度', '客群调度', '商机调度', '区域攻坚调度', '预警调度'];
const TIME_LIMIT_CALCS = ['不排除法定节假日和周末', '排除法定节假日', '排除法定节假日和周末'];
const EXCLUDE_OPTIONS = ['是', '否'];

const FORM_COMPONENT_TYPES = [
  { type: 'input', label: '单行输入框', icon: '📝' },
  { type: 'textarea', label: '多行输入框', icon: '📄' },
  { type: 'select', label: '下拉选择', icon: '📋' },
  { type: 'cascader', label: '级联选择', icon: '🔗' },
  { type: 'region', label: '省市区', icon: '📍' },
  { type: 'radio', label: '单选框组', icon: '◉' },
  { type: 'checkbox', label: '多选框组', icon: '☑' },
  { type: 'time', label: '时间选择', icon: '🕐' },
  { type: 'date', label: '日期选择', icon: '📅' },
  { type: 'datetime', label: '日期时间选择', icon: '📆' },
  { type: 'daterange', label: '日期范围', icon: '📊' },
  { type: 'rate', label: '星级', icon: '⭐' },
  { type: 'attachment', label: '附件', icon: '📎' },
  { type: 'image', label: '图片', icon: '🖼' },
  { type: 'description', label: '工单描述', icon: '📋' },
  { type: 'idcard', label: '身份证号', icon: '🪪' },
  { type: 'email', label: '邮箱', icon: '✉' },
  { type: 'phone', label: '手机号', icon: '📱' },
  { type: 'number', label: '数字输入框', icon: '🔢' },
  { type: 'layout', label: '布局容器', icon: '📦' },
  { type: 'table', label: '表格/明细', icon: '📊' },
];

const GATEWAY_CONDITIONS = [
  '是否全球通客户', '是否政企客户关键人', '是否白金卡钻卡金卡', '是否宽带用户', '是否装维包保',
  '执行模式', '地市派单方式', '省级派单方式', '网格派单方式', '区县派单方式',
  '是否开启审批', '是否审批', '审批结果网关',
  '是否有地市', '是否有区县', '是否有网格', '是否有渠道', '是否有集团客户经理',
  'iop自动网关', '挽留结果网关', '退单层级网关', '营销层级网关',
  '是否集团包保', '是否微格包保', '是否上门挽留网关', '是否高端用户网关',
  '使用对象', '数据源类型网关', '申请类型', '是否大于等于5万',
];

const ALL_ROLES = [
  '超级管理员', '访客', '集团公众市场运营人员', '省公司管理员',
  '省公司运营人员', '集团运营人员', '运维经理', '集团管理员',
  '概览查看', '平台运维', '集团政企运营人员', '10086',
  '网格经理', '10088', '政企客户经理', '地市集运',
  '装维', '铁通随销-网格通', '客户经理',
];

// ===================== SUB-COMPONENTS =====================

function StepIndicator({ steps, currentStep }: { steps: { key: StepType; label: string }[]; currentStep: StepType }) {
  const currentIdx = steps.findIndex(s => s.key === currentStep);
  return (
    <div className="flex items-center gap-1 text-sm">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1">
          <span className={i <= currentIdx ? 'text-primary font-medium' : 'text-muted-foreground'}>
            {step.label}
          </span>
          {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

function RoleSelectDialog({ open, onClose, selected, onConfirm }: { open: boolean; onClose: () => void; selected: string[]; onConfirm: (roles: string[]) => void }) {
  const [tempSelected, setTempSelected] = useState<string[]>(selected);
  const [searchText, setSearchText] = useState('');
  const [scope, setScope] = useState('all');

  useEffect(() => { setTempSelected(selected); }, [selected]);

  const filteredRoles = ALL_ROLES.filter(r => !searchText || r.includes(searchText));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg w-[600px] max-h-[500px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">角色</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Left: selected */}
          <div className="w-1/3 border-r p-3">
            <div className="text-xs text-muted-foreground mb-2">已选择角色: <span className="text-primary">{tempSelected.length} / 10</span></div>
            {tempSelected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-xs text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">👤</div>
                暂无选中数据
              </div>
            ) : (
              <div className="space-y-1">
                {tempSelected.map(role => (
                  <div key={role} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                    <span>{role}</span>
                    <button onClick={() => setTempSelected(prev => prev.filter(r => r !== role))}><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Right: role list */}
          <div className="w-2/3 p-3">
            <Input placeholder="搜索角色" value={searchText} onChange={e => setSearchText(e.target.value)} className="h-8 text-xs mb-2" />
            <div className="flex items-center gap-2 mb-2">
              {['全部角色', '全国', '省', '市', '区县', '网格'].map(s => (
                <button key={s} className={`text-xs px-2 py-0.5 rounded ${scope === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`} onClick={() => setScope(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-1 overflow-auto max-h-[280px]">
              {filteredRoles.map(role => (
                <label key={role} className="flex items-center gap-2 text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer">
                  <Checkbox
                    checked={tempSelected.includes(role)}
                    onCheckedChange={checked => {
                      if (checked) setTempSelected(prev => [...prev, role]);
                      else setTempSelected(prev => prev.filter(r => r !== role));
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={() => { onConfirm(tempSelected); onClose(); }}>确定</Button>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================

export default function FlowConfigNewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">加载中...</div>}>
      <FlowConfigNewPageContent />
    </Suspense>
  );
}

function FlowConfigNewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  // Flow template presets
  const simpleTemplate = {
    nodes: [
      { id: 'start', type: 'start' as const, name: '发起', x: 40, y: 200 },
      { id: 'task1', type: 'task' as const, name: '分管领导审批', x: 220, y: 200 },
      { id: 'task2', type: 'task' as const, name: '网格长执行', x: 420, y: 200 },
      { id: 'task3', type: 'external' as const, name: '外系统推送', x: 620, y: 200 },
      { id: 'end', type: 'end' as const, name: '任务结束', x: 820, y: 200 },
    ],
    edges: [
      { id: 'e1', from: 'start', to: 'task1' },
      { id: 'e2', from: 'task1', to: 'task2' },
      { id: 'e3', from: 'task2', to: 'task3' },
      { id: 'e4', from: 'task3', to: 'end' },
    ],
    basicInfo: { name: '简易分包看管流程', businessType: '生产类', ticketType: '预警调度' },
  };

  const mnpTemplate = {
    nodes: [
      { id: 'start', type: 'start' as const, name: '发起', x: 40, y: 200 },
      { id: 'gw1', type: 'gateway' as const, name: '是否全球通客户', x: 180, y: 183, branchConditions: [{ condition: '是', targetId: 'task1' }, { condition: '否', targetId: 'gw2' }] },
      { id: 'task1', type: 'task' as const, name: '客户经理执行', x: 380, y: 170 },
      { id: 'gw2', type: 'gateway' as const, name: '是否白金卡钻卡金卡', x: 180, y: 330, branchConditions: [{ condition: '是', targetId: 'task2' }, { condition: '否', targetId: 'task3' }] },
      { id: 'task2', type: 'external' as const, name: '10088执行', x: 380, y: 320 },
      { id: 'gw3', type: 'gateway' as const, name: '是否宽带用户', x: 560, y: 330, branchConditions: [{ condition: '是', targetId: 'task4' }, { condition: '否', targetId: 'end' }] },
      { id: 'task3', type: 'external' as const, name: '网格经理/地市集运执行', x: 380, y: 430 },
      { id: 'task4', type: 'external' as const, name: '装维执行', x: 750, y: 320 },
      { id: 'end', type: 'end' as const, name: '任务结束', x: 920, y: 200 },
    ],
    edges: [
      { id: 'e1', from: 'start', to: 'gw1' },
      { id: 'e2a', from: 'gw1', to: 'task1', label: '是' },
      { id: 'e2b', from: 'gw1', to: 'gw2', label: '否' },
      { id: 'e3a', from: 'gw2', to: 'task2', label: '是' },
      { id: 'e3b', from: 'gw2', to: 'task3', label: '否' },
      { id: 'e4', from: 'task2', to: 'gw3' },
      { id: 'e5', from: 'gw3', to: 'task4', label: '是' },
      { id: 'e6', from: 'gw3', to: 'end', label: '否' },
      { id: 'e7', from: 'task1', to: 'end' },
      { id: 'e8', from: 'task3', to: 'end' },
      { id: 'e9', from: 'task4', to: 'end' },
    ],
    basicInfo: { name: '携转预警执行流程', businessType: '生产类', ticketType: '预警调度' },
  };

  const retainTemplate = {
    nodes: [
      { id: 'start', type: 'start' as const, name: '发起', x: 40, y: 200 },
      { id: 'task1', type: 'task' as const, name: '分管领导审批', x: 200, y: 200 },
      { id: 'gw1', type: 'gateway' as const, name: '执行模式', x: 380, y: 200, branchConditions: [{ condition: '分包看管执行', targetId: 'task3' }, { condition: '在线执行', targetId: 'task2' }, { condition: '在线+分包看管', targetId: 'task2' }] },
      { id: 'task2', type: 'task' as const, name: '网格长执行(在线)', x: 560, y: 100 },
      { id: 'task3', type: 'task' as const, name: '分包看管执行', x: 560, y: 200 },
      { id: 'task4', type: 'external' as const, name: 'CRM维系推送', x: 740, y: 200 },
      { id: 'end', type: 'end' as const, name: '任务结束', x: 920, y: 150 },
    ],
    edges: [
      { id: 'e1', from: 'start', to: 'task1' },
      { id: 'e2', from: 'task1', to: 'gw1' },
      { id: 'e3', from: 'gw1', to: 'task2', label: '在线' },
      { id: 'e4', from: 'gw1', to: 'task3', label: '分包看管' },
      { id: 'e5', from: 'task2', to: 'end' },
      { id: 'e6', from: 'task3', to: 'task4' },
      { id: 'e7', from: 'task4', to: 'end' },
    ],
    basicInfo: { name: '保有任务调度流程', businessType: '生产类', ticketType: '保有任务调度' },
  };

  type TemplateData = {
    nodes: Array<{ id: string; type: 'start' | 'task' | 'external' | 'gateway' | 'end'; name: string; x: number; y: number; branchConditions?: { condition: string; targetId: string }[] }>;
    edges: Array<{ id: string; from: string; to: string; label?: string }>;
    basicInfo: { name: string; businessType: string; ticketType: string };
  };

  const templateMap: Record<string, TemplateData> = {
    'tpl-simple': simpleTemplate,
    'tpl-mnp': mnpTemplate,
    'tpl-retain': retainTemplate,
  };
  const selectedTemplate = templateId ? templateMap[templateId] || null : null;
  const [currentStep, setCurrentStep] = useState<StepType>('basic');

  const steps: { key: StepType; label: string }[] = [
    { key: 'basic', label: '基础设置' },
    { key: 'fillForm', label: '填单表单设计' },
    { key: 'feedbackForm', label: '反馈表单设计' },
    { key: 'flowDesign', label: '流程设计' },
    { key: 'evaluation', label: '评价设置' },
  ];

  // Basic info state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: selectedTemplate?.basicInfo.name || '',
    businessType: selectedTemplate?.basicInfo.businessType || '',
    ticketType: selectedTemplate?.basicInfo.ticketType || '',
    roles: [],
    launchSystem: 'self', timeLimitType: 'configured', timeLimitHours: 24,
    timeLimitCalc: '不排除法定节假日和周末', excludeNonWork: '是',
    setProperty: 'both', description: '',
  });
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Form design state
  const [fillFormComponents, setFillFormComponents] = useState<FormComponent[]>([]);
  const [feedbackFormComponents, setFeedbackFormComponents] = useState<FormComponent[]>([]);
  const [selectedFormComponent, setSelectedFormComponent] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<'props' | 'mapping'>('props');

  // Flow design state
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>(
    selectedTemplate?.nodes || [
      { id: 'start', type: 'start', name: '发起', x: 40, y: 200 },
      { id: 'gw1', type: 'gateway', name: '是否全球通客户', x: 180, y: 183, branchConditions: [{ condition: '是', targetId: 'task1' }, { condition: '否', targetId: 'gw2' }] },
      { id: 'task1', type: 'task', name: '客户经理执行', x: 380, y: 170 },
      { id: 'gw2', type: 'gateway', name: '是否白金卡钻卡金卡', x: 180, y: 330, branchConditions: [{ condition: '是', targetId: 'task2' }, { condition: '否', targetId: 'task3' }] },
      { id: 'task2', type: 'external', name: '10088执行', x: 380, y: 320 },
      { id: 'gw3', type: 'gateway', name: '是否宽带用户', x: 560, y: 330, branchConditions: [{ condition: '是', targetId: 'task4' }, { condition: '否', targetId: 'end' }] },
      { id: 'task3', type: 'external', name: '网格经理/地市集运执行', x: 380, y: 430 },
      { id: 'task4', type: 'external', name: '装维执行', x: 750, y: 320 },
      { id: 'end', type: 'end', name: '任务结束', x: 920, y: 200 },
    ]
  );
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>(
    selectedTemplate?.edges || [
      { id: 'e1', from: 'start', to: 'gw1' },
      { id: 'e2a', from: 'gw1', to: 'task1', label: '是' },
      { id: 'e2b', from: 'gw1', to: 'gw2', label: '否' },
      { id: 'e3a', from: 'gw2', to: 'task2', label: '是' },
      { id: 'e3b', from: 'gw2', to: 'task3', label: '否' },
      { id: 'e4', from: 'task2', to: 'gw3' },
      { id: 'e5', from: 'gw3', to: 'task4', label: '是' },
      { id: 'e6', from: 'gw3', to: 'end', label: '否' },
      { id: 'e7', from: 'task1', to: 'end' },
      { id: 'e8', from: 'task3', to: 'end' },
      { id: 'e9', from: 'task4', to: 'end' },
    ]
  );
  const [selectedFlowNode, setSelectedFlowNode] = useState<string | null>(null);
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  // Keyboard delete support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFlowNode) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
        e.preventDefault();
        setFlowNodes(prev => prev.filter(n => n.id !== selectedFlowNode));
        setFlowEdges(prev => prev.filter(e => e.from !== selectedFlowNode && e.to !== selectedFlowNode));
        setSelectedFlowNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFlowNode]);

  // Drag state for form components
  const [draggedType, setDraggedType] = useState<string | null>(null);

  // Evaluation state
  const [evaluationEnabled, setEvaluationEnabled] = useState(false);
  const [evaluationItems, setEvaluationItems] = useState<{ id: string; name: string; type: string }[]>([]);

  const addFormComponent = useCallback((type: string, isFeedback: boolean) => {
    const setter = isFeedback ? setFeedbackFormComponents : setFillFormComponents;
    const comps = isFeedback ? feedbackFormComponents : fillFormComponents;
    const fieldNum = comps.length + 1;
    const compType = FORM_COMPONENT_TYPES.find(c => c.type === type);
    const newComp: FormComponent = {
      id: `field_${Date.now()}_${fieldNum}`,
      type,
      label: compType?.label || type,
      placeholder: `请输入${compType?.label || type}`,
      fieldName: `field${fieldNum}`,
      required: false,
      gridSpan: 24,
      ...(type === 'select' ? { options: [{ label: '选项一', value: '1' }, { label: '选项二', value: '2' }] } : {}),
    };
    setter(prev => [...prev, newComp]);
  }, [fillFormComponents, feedbackFormComponents]);

  const removeFormComponent = useCallback((id: string, isFeedback: boolean) => {
    const setter = isFeedback ? setFeedbackFormComponents : setFillFormComponents;
    setter(prev => prev.filter(c => c.id !== id));
    setSelectedFormComponent(null);
  }, []);

  const moveFormComponent = useCallback((id: string, direction: 'up' | 'down', isFeedback: boolean) => {
    const setter = isFeedback ? setFeedbackFormComponents : setFillFormComponents;
    setter(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }, []);

  // ===================== RENDER =====================

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/workspace/dispatch/config/process')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> 流程配置
          </button>
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>
        <div className="flex items-center gap-2">
          {currentStep !== 'basic' && (
            <Button variant="outline" size="sm" onClick={() => {
              const idx = steps.findIndex(s => s.key === currentStep);
              if (idx > 0) setCurrentStep(steps[idx - 1].key);
            }}>
              <ArrowLeft className="w-3 h-3 mr-1" />上一步
            </Button>
          )}
          {currentStep !== 'evaluation' && (
            <Button size="sm" onClick={() => {
              const idx = steps.findIndex(s => s.key === currentStep);
              if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].key);
            }}>
              下一步<ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {currentStep === 'flowDesign' && (
            <>
              <Button variant="outline" size="sm"><Save className="w-3 h-3 mr-1" />保存草稿</Button>
              <Button size="sm"><Play className="w-3 h-3 mr-1" />发布</Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push('/workspace/dispatch/config/process')}>取消</Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* ============ STEP 1: 基础设置 ============ */}
        {currentStep === 'basic' && (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm">*流程名称</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={basicInfo.name} onChange={e => setBasicInfo(prev => ({ ...prev, name: e.target.value }))} placeholder="请输入流程名称" maxLength={30} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{basicInfo.name.length}/30</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">*业务类型</Label>
                  <Select value={basicInfo.businessType} onValueChange={v => setBasicInfo(prev => ({ ...prev, businessType: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="请选择业务类型" /></SelectTrigger>
                    <SelectContent>{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">*工单类型</Label>
                  <Select value={basicInfo.ticketType} onValueChange={v => setBasicInfo(prev => ({ ...prev, ticketType: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="请选择工单类型" /></SelectTrigger>
                    <SelectContent>{TICKET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label className="text-sm">*流程发起角色</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {basicInfo.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {basicInfo.roles.map(r => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShowRoleDialog(true)}>
                      <Plus className="w-3 h-3 mr-1" />添加角色
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">*流程发起系统</Label>
                  <RadioGroup value={basicInfo.launchSystem} onValueChange={v => setBasicInfo(prev => ({ ...prev, launchSystem: v as 'self' | 'external' }))} className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="self" /><span className="text-sm">本系统</span></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="external" /><span className="text-sm">外系统</span></div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm flex items-center gap-1">*流程时限 <HelpCircle className="w-3 h-3 text-muted-foreground" /></Label>
                  <RadioGroup value={basicInfo.timeLimitType} onValueChange={v => setBasicInfo(prev => ({ ...prev, timeLimitType: v as 'configured' | 'none' | 'onFill' }))} className="space-y-1 mt-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="none" /><span className="text-sm">无流程时限</span></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="configured" /><span className="text-sm">流程配置时限</span></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="onFill" /><span className="text-sm">填单时配置流程时限</span></div>
                  </RadioGroup>
                </div>

                {basicInfo.timeLimitType === 'configured' && (
                  <>
                    <div>
                      <Label className="text-sm">*时限(小时)</Label>
                      <Input type="number" value={basicInfo.timeLimitHours} onChange={e => setBasicInfo(prev => ({ ...prev, timeLimitHours: Number(e.target.value) }))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm">*时限计算方式</Label>
                      <Select value={basicInfo.timeLimitCalc} onValueChange={v => setBasicInfo(prev => ({ ...prev, timeLimitCalc: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{TIME_LIMIT_CALCS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">*是否排除非工作时间</Label>
                      <Select value={basicInfo.excludeNonWork} onValueChange={v => setBasicInfo(prev => ({ ...prev, excludeNonWork: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{EXCLUDE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-sm">*设置属性</Label>
                  <RadioGroup value={basicInfo.setProperty} onValueChange={v => setBasicInfo(prev => ({ ...prev, setProperty: v as 'both' | 'flow' | 'template' }))} className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="both" /><span className="text-sm">流程&模板</span></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="flow" /><span className="text-sm">流程</span></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="template" /><span className="text-sm">模板</span></div>
                  </RadioGroup>
                </div>

                <div className="col-span-2">
                  <Label className="text-sm">流程说明</Label>
                  <textarea
                    value={basicInfo.description}
                    onChange={e => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请输入流程说明"
                    className="w-full mt-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* ============ STEP 2 & 3: 表单设计 ============ */}
        {(currentStep === 'fillForm' || currentStep === 'feedbackForm') && (() => {
          const isFeedback = currentStep === 'feedbackForm';
          const components = isFeedback ? feedbackFormComponents : fillFormComponents;
          const setComponents = isFeedback ? setFeedbackFormComponents : setFillFormComponents;
          const selectedComp = components.find(c => c.id === selectedFormComponent);

          return (
            <div className="flex h-full">
              {/* Left: component palette */}
              <div className="w-56 border-r bg-muted/20 flex flex-col">
                <div className="flex border-b">
                  <button className={`flex-1 py-2 text-xs font-medium ${formTab === 'props' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>常用组件</button>
                  <button className={`flex-1 py-2 text-xs font-medium text-muted-foreground`}>定制组件</button>
                </div>
                <div className="flex-1 overflow-auto p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {FORM_COMPONENT_TYPES.map(comp => (
                      <div
                        key={comp.type}
                        draggable
                        onDragStart={() => setDraggedType(comp.type)}
                        onDragEnd={() => setDraggedType(null)}
                        onClick={() => addFormComponent(comp.type, isFeedback)}
                        className="flex flex-col items-center gap-0.5 p-2 rounded-md border border-transparent hover:border-primary/30 hover:bg-primary/5 cursor-pointer text-xs transition-colors"
                      >
                        <span className="text-base">{comp.icon}</span>
                        <span className="text-[10px] text-center leading-tight">{comp.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: canvas */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 p-2 border-b bg-background">
                  <Button variant="outline" size="sm" className="h-7 text-xs">引入流程</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">引入模板</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">预览</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setComponents([])}>清空</Button>
                </div>
                <div
                  className="flex-1 overflow-auto p-4 bg-muted/10"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (draggedType) { addFormComponent(draggedType, isFeedback); setDraggedType(null); } }}
                >
                  <div className="bg-background rounded-lg border max-w-2xl mx-auto p-4 min-h-[300px]">
                    <div className="text-sm font-medium mb-3 text-muted-foreground">
                      {isFeedback ? '反馈信息(新增使用)' : '扩展信息(新增使用)'}
                    </div>
                    {components.length === 0 ? (
                      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                        从左侧拖入或点选组件进行表单设计
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {components.map(comp => (
                          <div
                            key={comp.id}
                            className={`border rounded-md p-3 cursor-pointer transition-colors ${selectedFormComponent === comp.id ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/30'}`}
                            onClick={() => setSelectedFormComponent(comp.id)}
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              <Label className="text-sm flex-shrink-0">{comp.label}：</Label>
                              {comp.type === 'select' ? (
                                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder={comp.placeholder} /></SelectTrigger></Select>
                              ) : comp.type === 'textarea' ? (
                                <textarea placeholder={comp.placeholder} className="flex-1 h-16 rounded border border-input px-2 py-1 text-xs resize-none" readOnly />
                              ) : (
                                <Input placeholder={comp.placeholder} className="h-8 text-xs" readOnly />
                              )}
                              <div className="flex items-center gap-1">
                                <button className="text-muted-foreground hover:text-foreground" onClick={e => { e.stopPropagation(); moveFormComponent(comp.id, 'up', isFeedback); }}>
                                  <Undo2 className="w-3.5 h-3.5 rotate-90" />
                                </button>
                                <button className="text-muted-foreground hover:text-foreground" onClick={e => { e.stopPropagation(); moveFormComponent(comp.id, 'down', isFeedback); }}>
                                  <Redo2 className="w-3.5 h-3.5 rotate-90" />
                                </button>
                                <button className="text-destructive hover:text-destructive/80" onClick={e => { e.stopPropagation(); removeFormComponent(comp.id, isFeedback); }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: property panel */}
              <div className="w-64 border-l bg-background flex flex-col">
                <div className="flex border-b">
                  <button className={`flex-1 py-2 text-xs font-medium ${formTab === 'props' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setFormTab('props')}>组件属性</button>
                  <button className={`flex-1 py-2 text-xs font-medium ${formTab === 'mapping' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setFormTab('mapping')}>映射属性</button>
                </div>
                {selectedComp ? (
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                      <div>
                        <Label className="text-xs">标题</Label>
                        <Input value={selectedComp.label} onChange={e => setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, label: e.target.value } : c))} className="h-7 text-xs mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">占位提示</Label>
                        <Input value={selectedComp.placeholder} onChange={e => setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, placeholder: e.target.value } : c))} className="h-7 text-xs mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">字段名</Label>
                        <Input value={selectedComp.fieldName} readOnly className="h-7 text-xs mt-1 bg-muted" />
                      </div>
                      <div>
                        <Label className="text-xs">业务属性</Label>
                        <Select><SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="请选择业务属性" /></SelectTrigger></Select>
                      </div>
                      <div>
                        <Label className="text-xs">表单栅格</Label>
                        <input type="range" min={6} max={24} value={selectedComp.gridSpan || 24} className="w-full mt-1" onChange={e => setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, gridSpan: Number(e.target.value) } : c))} />
                      </div>
                      {selectedComp.type === 'select' && (
                        <div>
                          <Label className="text-xs">选项</Label>
                          <div className="space-y-1 mt-1">
                            {(selectedComp.options || []).map((opt, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <Input value={opt.label} className="h-6 text-xs flex-1" onChange={e => setComponents(prev => prev.map(c => {
                                  if (c.id !== selectedComp.id || !c.options) return c;
                                  const newOpts = [...c.options];
                                  newOpts[i] = { ...newOpts[i], label: e.target.value };
                                  return { ...c, options: newOpts };
                                }))} />
                                <Input value={opt.value} className="h-6 text-xs w-12" onChange={e => setComponents(prev => prev.map(c => {
                                  if (c.id !== selectedComp.id || !c.options) return c;
                                  const newOpts = [...c.options];
                                  newOpts[i] = { ...newOpts[i], value: e.target.value };
                                  return { ...c, options: newOpts };
                                }))} />
                                <button onClick={() => setComponents(prev => prev.map(c => {
                                  if (c.id !== selectedComp.id || !c.options) return c;
                                  return { ...c, options: c.options.filter((_, j) => j !== i) };
                                }))}><Minus className="w-3.5 h-3.5 text-destructive" /></button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="h-6 text-xs w-full" onClick={() => setComponents(prev => prev.map(c => {
                              if (c.id !== selectedComp.id) return c;
                              const newOpts = [...(c.options || []), { label: `选项${(c.options?.length || 0) + 1}`, value: `${(c.options?.length || 0) + 1}` }];
                              return { ...c, options: newOpts };
                            }))}>添加选项</Button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch checked={selectedComp.required} onCheckedChange={v => setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, required: v } : c))} />
                        <Label className="text-xs">是否必填</Label>
                      </div>
                      {selectedComp.required && <p className="text-[10px] text-destructive">(勾选后可作为流程条件)</p>}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">请选择组件</div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ============ STEP 4: 流程设计 ============ */}
        {currentStep === 'flowDesign' && (
          <div className="flex h-full">
            {/* Left: node palette - draggable nodes */}
            <div className="w-14 border-r bg-muted/20 flex flex-col items-center py-3 gap-2">
              <button className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="抓手"><MousePointer className="w-5 h-5" /></button>
              <button className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="连线"><Link2 className="w-5 h-5" /></button>
              <Separator className="w-8" />
              {[
                { type: 'start' as const, title: '开始节点', icon: <Circle className="w-5 h-5" /> },
                { type: 'end' as const, title: '结束节点', icon: <div className="w-5 h-5 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-500" /></div></div> },
                { type: 'task' as const, title: '人工节点', icon: <User className="w-5 h-5" /> },
                { type: 'system' as const, title: '系统节点', icon: <Settings className="w-5 h-5" /> },
                { type: 'external' as const, title: '外部节点', icon: <Globe className="w-5 h-5" /> },
                { type: 'gateway' as const, title: '网关节点', icon: <Diamond className="w-5 h-5" /> },
              ].map(item => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('flowNodeType', item.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="p-2 rounded hover:bg-muted text-blue-500 cursor-grab active:cursor-grabbing select-none"
                  title={`拖拽到画布添加${item.title}`}
                >
                  {item.icon}
                </div>
              ))}
            </div>

            {/* Center: canvas */}
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b bg-background">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Save className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Undo2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Redo2 className="w-3.5 h-3.5" /></Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><ZoomIn className="w-3.5 h-3.5" /></Button>
                  <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}><ZoomOut className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(1)}><RotateCcw className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">引用流程</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">引用模板</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">初始化</Button>
                </div>
              </div>

              {/* Canvas - supports drop from palette and node drag repositioning */}
              <div
                className="flex-1 overflow-auto bg-muted/5 relative"
                ref={canvasRef}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={e => {
                  const nodeType = e.dataTransfer.getData('flowNodeType') as FlowNode['type'] | '';
                  if (!nodeType) return;
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const scrollLeft = canvasRef.current?.scrollLeft ?? 0;
                  const scrollTop = canvasRef.current?.scrollTop ?? 0;
                  const x = (e.clientX - rect.left + scrollLeft) / zoom - (nodeType === 'start' || nodeType === 'end' ? 25 : nodeType === 'gateway' ? 25 : 50);
                  const y = (e.clientY - rect.top + scrollTop) / zoom - (nodeType === 'start' || nodeType === 'end' ? 25 : nodeType === 'gateway' ? 25 : 20);
                  const id = `node_${Date.now()}`;
                  const nameMap: Record<string, string> = { start: '开始任务', end: '任务结束', task: '人工节点', system: '系统节点', external: '外部节点', gateway: '网关节点' };
                  setFlowNodes(prev => [...prev, { id, type: nodeType, name: nameMap[nodeType] || nodeType, x: Math.max(0, x), y: Math.max(0, y) }]);
                }}
                onMouseMove={e => {
                  if (!draggingNodeId || !canvasRef.current) return;
                  const dx = e.clientX - dragStartPosRef.current.x;
                  const dy = e.clientY - dragStartPosRef.current.y;
                  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    hasDraggedRef.current = true;
                  }
                  const rect = canvasRef.current.getBoundingClientRect();
                  const scrollLeft = canvasRef.current.scrollLeft;
                  const scrollTop = canvasRef.current.scrollTop;
                  const mx = (e.clientX - rect.left + scrollLeft) / zoom - dragOffset.x;
                  const my = (e.clientY - rect.top + scrollTop) / zoom - dragOffset.y;
                  setFlowNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: Math.max(0, mx), y: Math.max(0, my) } : n));
                }}
                onMouseUp={() => { setDraggingNodeId(null); }}
                onMouseLeave={() => { setDraggingNodeId(null); }}
              >
                <svg
                  className="absolute inset-0"
                  style={{ minWidth: 1000 * zoom, minHeight: 600 * zoom }}
                  onClick={() => { if (!draggingNodeId) setSelectedFlowNode(null); }}
                >
                  {/* Grid pattern */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="0.5" fill="#d4d4d8" />
                    </pattern>
                    {/* Arrow marker */}
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
                    </marker>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Edges - horizontal orthogonal polylines with arrows */}
                  {flowEdges.map(edge => {
                    const from = flowNodes.find(n => n.id === edge.from);
                    const to = flowNodes.find(n => n.id === edge.to);
                    if (!from || !to) return null;
                    // Calculate ports: right-center output, left-center input
                    const getPortRight = (n: FlowNode) => {
                      if (n.type === 'start' || n.type === 'end') return { x: n.x * zoom + 50 * zoom, y: n.y * zoom + 25 * zoom };
                      if (n.type === 'gateway') return { x: n.x * zoom + 50 * zoom, y: n.y * zoom + 25 * zoom };
                      return { x: n.x * zoom + 100 * zoom, y: n.y * zoom + 20 * zoom };
                    };
                    const getPortLeft = (n: FlowNode) => {
                      if (n.type === 'start' || n.type === 'end') return { x: n.x * zoom, y: n.y * zoom + 25 * zoom };
                      if (n.type === 'gateway') return { x: n.x * zoom, y: n.y * zoom + 25 * zoom };
                      return { x: n.x * zoom, y: n.y * zoom + 20 * zoom };
                    };
                    // Determine if the edge should go down (gateway "否" branch) or right
                    const isDownBranch = edge.label === '否' && from.type === 'gateway';
                    const isUpBranch = to.y < from.y;
                    let fromPort, toPort, path;

                    if (isDownBranch) {
                      // Gateway "否": exit from bottom, enter target from left
                      const gwCx = from.x * zoom + 25 * zoom;
                      const gwBottom = from.y * zoom + 50 * zoom;
                      fromPort = { x: gwCx, y: gwBottom };
                      toPort = getPortLeft(to);
                      const midX = (fromPort.x + toPort.x) / 2;
                      path = `M ${fromPort.x} ${fromPort.y} L ${fromPort.x} ${toPort.y} L ${toPort.x} ${toPort.y}`;
                    } else if (isUpBranch && from.type === 'gateway') {
                      // Gateway "是" going up-right
                      fromPort = getPortRight(from);
                      toPort = getPortLeft(to);
                      path = `M ${fromPort.x} ${fromPort.y} L ${toPort.x} ${fromPort.y} L ${toPort.x} ${toPort.y}`;
                    } else {
                      // Normal right-to-left flow
                      fromPort = getPortRight(from);
                      toPort = getPortLeft(to);
                      const midX = (fromPort.x + toPort.x) / 2;
                      path = `M ${fromPort.x} ${fromPort.y} L ${midX} ${fromPort.y} L ${midX} ${toPort.y} L ${toPort.x} ${toPort.y}`;
                    }
                    return (
                      <g key={edge.id}>
                        <path d={path} fill="none" stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arrowhead)" />
                        {edge.label && (
                          <g transform={`translate(${(fromPort.x + toPort.x) / 2}, ${(fromPort.y + toPort.y) / 2 - 8})`}>
                            <rect x={-12} y={-8} width={24} height={16} rx={3} fill="white" stroke="#e2e8f0" strokeWidth={0.5} />
                            <text fontSize={9} fill="#64748b" textAnchor="middle" dominantBaseline="middle">
                              {edge.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes - uniform blue theme */}
                  {flowNodes.map(node => {
                    const x = node.x * zoom;
                    const y = node.y * zoom;
                    const isSelected = selectedFlowNode === node.id;
                    const BLUE = '#3b82f6';
                    const BLUE_LIGHT = '#eff6ff';

                    return (
                      <g
                        key={node.id}
                        className={draggingNodeId === node.id ? 'cursor-grabbing' : 'cursor-grab'}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasDraggedRef.current) {
                            setSelectedFlowNode(node.id);
                          }
                        }}
                        onMouseDown={e => {
                          e.stopPropagation();
                          hasDraggedRef.current = false;
                          dragStartPosRef.current = { x: e.clientX, y: e.clientY };
                          const nodeX = node.x * zoom;
                          const nodeY = node.y * zoom;
                          setDragOffset({ x: e.clientX - canvasRef.current!.getBoundingClientRect().left - nodeX + (canvasRef.current?.scrollLeft ?? 0), y: e.clientY - canvasRef.current!.getBoundingClientRect().top - nodeY + (canvasRef.current?.scrollTop ?? 0) });
                          setDraggingNodeId(node.id);
                          setSelectedFlowNode(node.id);
                        }}
                      >
                        {node.type === 'gateway' ? (
                          /* Gateway: diamond with X inside */
                          <g>
                            <g transform={`translate(${x + 25 * zoom}, ${y + 25 * zoom}) rotate(45)`}>
                              <rect x={-18 * zoom} y={-18 * zoom} width={36 * zoom} height={36 * zoom} fill="white" stroke={BLUE} strokeWidth={isSelected ? 2.5 : 1.5} rx={2} />
                            </g>
                            {/* X pattern inside */}
                            <line x1={x + (25 - 8) * zoom} y1={y + (25 - 8) * zoom} x2={x + (25 + 8) * zoom} y2={y + (25 + 8) * zoom} stroke={BLUE} strokeWidth={1.5} opacity={0.5} />
                            <line x1={x + (25 + 8) * zoom} y1={y + (25 - 8) * zoom} x2={x + (25 - 8) * zoom} y2={y + (25 + 8) * zoom} stroke={BLUE} strokeWidth={1.5} opacity={0.5} />
                            {/* Name below */}
                            <text x={x + 25 * zoom} y={y + 25 * zoom + 32 * zoom} fontSize={10 * zoom} fill="#1e293b" textAnchor="middle" dominantBaseline="middle" fontWeight={500}>{node.name}</text>
                          </g>
                        ) : node.type === 'start' ? (
                          /* Start: hollow circle */
                          <g>
                            <circle cx={x + 25 * zoom} cy={y + 25 * zoom} r={18 * zoom} fill="white" stroke={BLUE} strokeWidth={isSelected ? 2.5 : 1.5} />
                            <text x={x + 25 * zoom} y={y + 25 * zoom + 1} fontSize={10 * zoom} fill={BLUE} textAnchor="middle" dominantBaseline="middle" fontWeight={500}>{node.name}</text>
                          </g>
                        ) : node.type === 'end' ? (
                          /* End: double circle (bullseye) */
                          <g>
                            <circle cx={x + 25 * zoom} cy={y + 25 * zoom} r={18 * zoom} fill="white" stroke={BLUE} strokeWidth={isSelected ? 2.5 : 1.5} />
                            <circle cx={x + 25 * zoom} cy={y + 25 * zoom} r={10 * zoom} fill={BLUE} />
                            <text x={x + 25 * zoom} y={y + 25 * zoom + 28 * zoom} fontSize={10 * zoom} fill="#1e293b" textAnchor="middle" dominantBaseline="middle" fontWeight={500}>{node.name}</text>
                          </g>
                        ) : (
                          /* Task / System / Message: rounded rectangle with icon */
                          <g>
                            <rect x={x} y={y} width={100 * zoom} height={40 * zoom} rx={6 * zoom} fill="white" stroke={BLUE} strokeWidth={isSelected ? 2.5 : 1.5} />
                            {/* Top icon area */}
                            <circle cx={x + 14 * zoom} cy={y + 10 * zoom} r={6 * zoom} fill={BLUE_LIGHT} stroke={BLUE} strokeWidth={0.8} />
                            {node.type === 'task' && (
                              <text x={x + 14 * zoom} y={y + 10 * zoom + 1} fontSize={7 * zoom} fill={BLUE} textAnchor="middle" dominantBaseline="middle">👤</text>
                            )}
                            {node.type === 'system' && (
                              <text x={x + 14 * zoom} y={y + 10 * zoom + 1} fontSize={7 * zoom} fill={BLUE} textAnchor="middle" dominantBaseline="middle">⚙</text>
                            )}
                            {node.type === 'external' && (
                              <text x={x + 14 * zoom} y={y + 10 * zoom + 1} fontSize={7 * zoom} fill={BLUE} textAnchor="middle" dominantBaseline="middle">🌐</text>
                            )}
                            {/* Node name */}
                            <text x={x + 50 * zoom} y={y + 28 * zoom} fontSize={10 * zoom} fill="#1e293b" textAnchor="middle" dominantBaseline="middle" fontWeight={500}>{node.name}</text>
                          </g>
                        )}
                        {/* Selection dashed border */}
                        {isSelected && (
                          <rect
                            x={x - 4}
                            y={y - 4}
                            width={(node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom}
                            height={(node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 74 : 48) * zoom}
                            rx={4}
                            fill="none"
                            stroke={BLUE}
                            strokeWidth={1}
                            strokeDasharray="4 2"
                          />
                        )}
                        {/* Delete button on selected node */}
                        {isSelected && (
                          <g
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlowNodes(prev => prev.filter(n => n.id !== node.id));
                              setFlowEdges(prev => prev.filter(e => e.from !== node.id && e.to !== node.id));
                              setSelectedFlowNode(null);
                            }}
                          >
                            <circle
                              cx={x + (node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom + 4}
                              cy={y - 2}
                              r={8}
                              fill="#ef4444"
                              stroke="white"
                              strokeWidth={1.5}
                            />
                            <line
                              x1={x + (node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom + 4 - 4}
                              y1={y - 2 - 4}
                              x2={x + (node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom + 4 + 4}
                              y2={y - 2 + 4}
                              stroke="white"
                              strokeWidth={1.5}
                            />
                            <line
                              x1={x + (node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom + 4 + 4}
                              y1={y - 2 - 4}
                              x2={x + (node.type === 'start' || node.type === 'end' ? 58 : node.type === 'gateway' ? 58 : 108) * zoom + 4 - 4}
                              y2={y - 2 + 4}
                              stroke="white"
                              strokeWidth={1.5}
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right: flow info / node properties */}
            <div className="w-72 border-l bg-background flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  {selectedFlowNode ? (
                    <>
                      <div className="flex border-b">
                        <button className="flex-1 py-2 text-xs font-medium text-primary border-b-2 border-primary">属性配置</button>
                        <button className="flex-1 py-2 text-xs font-medium text-muted-foreground">反馈表单配置</button>
                      </div>
                      {(() => {
                        const node = flowNodes.find(n => n.id === selectedFlowNode);
                        if (!node) return null;
                        return (
                          <>
                            <div>
                              <Label className="text-xs">*节点名称</Label>
                              <Input value={node.name} onChange={e => setFlowNodes(prev => prev.map(n => n.id === node.id ? { ...n, name: e.target.value } : n))} className="h-7 text-xs mt-1" />
                            </div>
                            {node.type === 'external' ? (
                              <>
                                <div>
                                  <Label className="text-xs">*节点类型</Label>
                                  <Select value="external" disabled>
                                    <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="external">外部接口</SelectItem></SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">*节点名称</Label>
                                  <Input value={node.name} onChange={e => setFlowNodes(prev => prev.map(n => n.id === node.id ? { ...n, name: e.target.value } : n))} className="h-7 text-xs mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">*派单接口</Label>
                                  <Select><SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="请选择派单接口" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="command-dispatch">指挥调度</SelectItem>
                                      <SelectItem value="sms-platform">短信平台</SelectItem>
                                      <SelectItem value="crm-system">CRM系统</SelectItem>
                                      <SelectItem value="billing-system">计费系统</SelectItem>
                                      <SelectItem value="outbound-platform">外呼平台</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            ) : node.type === 'gateway' ? (
                              <>
                                <div>
                                  <Label className="text-xs">派单方式</Label>
                                  <RadioGroup defaultValue="auto" className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1"><RadioGroupItem value="auto" /><span className="text-xs">自动派单</span></div>
                                    <div className="flex items-center gap-1"><RadioGroupItem value="manual" /><span className="text-xs">手动派单</span></div>
                                  </RadioGroup>
                                </div>
                                <div>
                                  <p className="text-[10px] text-amber-600 font-medium">注意: 修改网关条件 — 分支条件需重新选择</p>
                                </div>
                                <div>
                                  <Label className="text-xs">条件配置</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {GATEWAY_CONDITIONS.filter(c => selectedConditions.includes(c) || c === node.name).map(c => (
                                      <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                                    ))}
                                  </div>
                                  <Button variant="outline" size="sm" className="h-6 text-xs mt-1" onClick={() => setShowConditionDialog(true)}>
                                    <Plus className="w-3 h-3 mr-1" />选择条件
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <Label className="text-xs">处理方式</Label>
                                  <RadioGroup defaultValue="default" className="space-y-1 mt-1">
                                    <div className="flex items-center gap-1"><RadioGroupItem value="default" /><span className="text-xs">默认</span></div>
                                    <div className="flex items-center gap-1"><RadioGroupItem value="rollback" /><span className="text-xs">回退发起人</span></div>
                                    <div className="flex items-center gap-1"><RadioGroupItem value="assign" /><span className="text-xs">指派发起人</span></div>
                                  </RadioGroup>
                                </div>
                                <div>
                                  <Label className="text-xs">执行对象</Label>
                                  <RadioGroup defaultValue="role" className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1"><RadioGroupItem value="role" /><span className="text-xs">执行角色</span></div>
                                    <div className="flex items-center gap-1"><RadioGroupItem value="dept" /><span className="text-xs">执行部门</span></div>
                                  </RadioGroup>
                                  <Button variant="outline" size="sm" className="h-6 text-xs mt-1"><Plus className="w-3 h-3 mr-1" />添加角色</Button>
                                </div>
                                <div>
                                  <Label className="text-xs">处理规则</Label>
                                  <div className="grid grid-cols-2 gap-1 mt-1">
                                    {['是否转派', '是否抄送', '是否领单', '是否抢单', '是否延期', '是否暂挂', '是否IOP调度', '是否配置表单'].map(rule => (
                                      <label key={rule} className="flex items-center gap-1 text-[10px]">
                                        <Checkbox />{rule}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">环节时限(分钟)</Label>
                                  <Input placeholder="请输入时限" className="h-7 text-xs mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">时限计算方式</Label>
                                  <Select><SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="请选择" /></SelectTrigger>
                                    <SelectContent>{TIME_LIMIT_CALCS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">是否排除非工作时间</Label>
                                  <Select><SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="请选择" /></SelectTrigger>
                                    <SelectContent>{EXCLUDE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">超时规则</Label>
                                  <Button variant="outline" size="sm" className="h-6 text-xs w-full mt-1"><Plus className="w-3 h-3 mr-1" />添加规则</Button>
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                      <div className="pt-2 border-t mt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => {
                            setFlowNodes(prev => prev.filter(n => n.id !== selectedFlowNode));
                            setFlowEdges(prev => prev.filter(e => e.from !== selectedFlowNode && e.to !== selectedFlowNode));
                            setSelectedFlowNode(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />删除节点
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="text-xs font-semibold text-foreground mb-2">流程信息</h4>
                      {[
                        ['流程名称（必填）', basicInfo.name || '—'],
                        ['业务类型', basicInfo.businessType || '—'],
                        ['工单类型', basicInfo.ticketType || '—'],
                        ['流程发起角色', basicInfo.roles.length > 0 ? basicInfo.roles.join('、') : '—'],
                        ['流程发起系统', basicInfo.launchSystem === 'self' ? '本系统' : '外系统'],
                        ['是否评价', evaluationEnabled ? '是' : '否'],
                        ['流程时限', basicInfo.timeLimitType === 'configured' ? '流程配置时限' : basicInfo.timeLimitType === 'onFill' ? '填单时限' : '不设时限'],
                        ['时限(小时)', String(basicInfo.timeLimitHours)],
                        ['时限计算方式', basicInfo.timeLimitCalc || '—'],
                        ['是否排除非工作时间', basicInfo.excludeNonWork || '—'],
                        ['设置属性', basicInfo.setProperty === 'both' ? '流程&模板' : basicInfo.setProperty === 'flow' ? '流程' : '模板'],
                        ['流程说明', basicInfo.description || '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between items-start py-1.5 border-b border-border/50">
                          <span className="text-[11px] text-muted-foreground">{label}</span>
                          <span className="text-[11px] text-foreground text-right max-w-[140px]">{value}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* ============ STEP 5: 评价设置 ============ */}
        {currentStep === 'evaluation' && (
          <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium">评价设置</h2>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">是否评价</Label>
                  <Switch checked={evaluationEnabled} onCheckedChange={setEvaluationEnabled} />
                </div>
              </div>
              {evaluationEnabled && (
                <>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">评价项</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEvaluationItems(prev => [...prev, { id: `${Date.now()}`, name: '', type: 'score' }])}>
                        <Plus className="w-3 h-3 mr-1" />添加评价项
                      </Button>
                    </div>
                    {evaluationItems.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">暂无评价项，点击"添加评价项"开始配置</div>
                    ) : (
                      <div className="space-y-2">
                        {evaluationItems.map((item, i) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                            <Input value={item.name} onChange={e => setEvaluationItems(prev => prev.map(ei => ei.id === item.id ? { ...ei, name: e.target.value } : ei))} placeholder="评价项名称" className="h-8 text-xs flex-1" />
                            <Select value={item.type} onValueChange={v => setEvaluationItems(prev => prev.map(ei => ei.id === item.id ? { ...ei, type: v } : ei))}>
                              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="score">评分</SelectItem>
                                <SelectItem value="text">文本评价</SelectItem>
                                <SelectItem value="single">单选</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setEvaluationItems(prev => prev.filter(ei => ei.id !== item.id))}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/workspace/dispatch/config/process')}>取消</Button>
                    <Button size="sm"><Save className="w-3 h-3 mr-1" />保存草稿</Button>
                    <Button size="sm"><Play className="w-3 h-3 mr-1" />发布</Button>
                  </div>
                </>
              )}
              {!evaluationEnabled && (
                <div className="text-sm text-muted-foreground text-center py-12">
                  当前流程未启用评价功能
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Role select dialog */}
      <RoleSelectDialog
        open={showRoleDialog}
        onClose={() => setShowRoleDialog(false)}
        selected={basicInfo.roles}
        onConfirm={roles => setBasicInfo(prev => ({ ...prev, roles }))}
      />

      {/* Condition select dialog */}
      {showConditionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-lg w-[500px] max-h-[500px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">选择条件</h3>
              <button onClick={() => setShowConditionDialog(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div>
                <p className="text-xs font-medium mb-1">填单表单条件</p>
                <p className="text-[10px] text-muted-foreground">步骤二：表单设计中未配置网关可用节点</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">反馈表单条件</p>
                <p className="text-[10px] text-muted-foreground">步骤二：反馈表单设计中未配置网关可用节点</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">定制条件</p>
                <div className="grid grid-cols-3 gap-1">
                  {GATEWAY_CONDITIONS.map(cond => (
                    <label key={cond} className="flex items-center gap-1 text-xs p-1 hover:bg-muted/50 rounded cursor-pointer">
                      <Checkbox
                        checked={selectedConditions.includes(cond)}
                        onCheckedChange={checked => {
                          if (checked) setSelectedConditions(prev => [...prev, cond]);
                          else setSelectedConditions(prev => prev.filter(c => c !== cond));
                        }}
                      />
                      {cond}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowConditionDialog(false)}>取消</Button>
              <Button size="sm" onClick={() => setShowConditionDialog(false)}>确定</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
