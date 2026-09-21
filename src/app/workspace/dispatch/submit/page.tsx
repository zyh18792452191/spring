'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Star,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Users,
  Send,
  X,
} from 'lucide-react';

// ========== 数据类型 ==========

interface TicketType {
  id: string;
  name: string;
  code: string;
  triggerMode: '人工发起' | '系统触发';
  category: string;
  status: '已生效' | '未生效' | '已停用';
}

interface FlowItem {
  id: string;
  name: string;
  ticketType: string;
  ticketTypeCode: string;
  nodes: number;
  creator: string;
  createdAt: string;
}

interface CustomerGroup {
  id: string;
  name: string;
  code: string;
  type: string;
  source: string;
  triggerTime: string;
}

// ========== 模拟数据 ==========

const ticketTypes: TicketType[] = [
  { id: 'type-retain', name: '保有任务调度', code: '5260', triggerMode: '人工发起', category: '生产类', status: '已生效' },
];

const flows: FlowItem[] = [
  { id: 'flow-retain-1', name: '保有任务调度流程', ticketType: '保有任务调度', ticketTypeCode: '5260', nodes: 5, creator: '系统预置', createdAt: '2026-07-11' },
];

const customerGroups: CustomerGroup[] = [
  { id: 'cg-001', name: '高离网风险客户群', code: 'CG202607001', type: '精准营销客群', source: '精准平台', triggerTime: '2026-07-01 10:30:00' },
  { id: 'cg-002', name: '低ARPU高潜力客群', code: 'CG202607002', type: '智能推荐客群', source: '智能推荐', triggerTime: '2026-07-02 14:20:00' },
  { id: 'cg-003', name: '宽带到期预警客群', code: 'CG202607003', type: '精准营销客群', source: '精准平台', triggerTime: '2026-07-03 09:15:00' },
  { id: 'cg-004', name: '全球通降档风险客群', code: 'CG202607004', type: '精准营销客群', source: '精准平台', triggerTime: '2026-07-04 16:45:00' },
  { id: 'cg-005', name: '异网携转意向客群', code: 'CG202607005', type: '智能推荐客群', source: '智能推荐', triggerTime: '2026-07-05 11:00:00' },
  { id: 'cg-006', name: '新入网3月未激活客群', code: 'CG202607006', type: '自定义客群', source: '自定义', triggerTime: '2026-07-06 08:30:00' },
  { id: 'cg-007', name: '套餐到期未续客群', code: 'CG202607007', type: '精准营销客群', source: '精准平台', triggerTime: '2026-07-07 13:20:00' },
  { id: 'cg-008', name: '高频投诉客户群', code: 'CG202607008', type: '自定义客群', source: '自定义', triggerTime: '2026-07-08 15:40:00' },
  { id: 'cg-009', name: '5G套餐适配客群', code: 'CG202607009', type: '智能推荐客群', source: '智能推荐', triggerTime: '2026-07-09 10:10:00' },
];

const businessTopics = ['存量运营'];

const businessScenesMap: Record<string, string[]> = {
  '存量运营': ['携转预警', '宽带离网预警', '全球通离网预警', '投诉工单预警', '热线商机预警', '异动客户预警', '全球通客户离网追溯', '全球通客户停机赢回预警', '全球通停机客户赢回-铁通预警'],
};

const executionModes = [
  { value: 'region', label: '区公司执行' },
  { value: 'city', label: '地市执行' },
];

const dispatchPreviewData: Record<string, { org: string; executor: string }[]> = {
  region: [
    { org: '新疆区公司', executor: '张建国' },
  ],
  city: [
    { org: '乌鲁木齐分公司', executor: '张伟' },
    { org: '克拉玛依分公司', executor: '李明' },
    { org: '吐鲁番分公司', executor: '王强' },
    { org: '哈密分公司', executor: '陈刚' },
    { org: '昌吉分公司', executor: '王磊' },
    { org: '博州分公司', executor: '杨波' },
    { org: '巴州分公司', executor: '马超' },
    { org: '阿克苏分公司', executor: '刘洋' },
    { org: '克州分公司', executor: '孙鹏' },
    { org: '喀什分公司', executor: '周杰' },
    { org: '和田分公司', executor: '吴勇' },
    { org: '伊犁分公司', executor: '赵刚' },
    { org: '塔城分公司', executor: '郑涛' },
    { org: '阿勒泰分公司', executor: '钱峰' },
    { org: '奎屯分公司', executor: '何明' },
    { org: '石河子分公司', executor: '罗辉' },
  ],
};

// ========== 左侧分类树节点 ==========

interface CategoryNode {
  key: string;
  label: string;
  count: number;
  children?: CategoryNode[];
}

function buildCategoryTree(types: TicketType[], favorites: string[]): CategoryNode[] {
  const categories: Record<string, TicketType[]> = {};
  types.forEach(t => {
    if (t.triggerMode === '人工发起' && t.status === '已生效') {
      const cat = t.category || '其他';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(t);
    }
  });

  const favFlows = flows.filter(f => favorites.includes(f.id));
  const tree: CategoryNode[] = [
    { key: 'favorites', label: '我的收藏', count: favFlows.length },
  ];

  Object.entries(categories).forEach(([cat, items]) => {
    tree.push({
      key: cat,
      label: cat,
      count: items.length,
      children: items.map(item => ({
        key: item.code,
        label: item.name,
        count: 1,
      })),
    });
  });

  return tree;
}

// ========== 主页面组件 ==========

export default function TicketSubmitPage() {
  const router = useRouter();
  // 页面状态：select=选择流程, form=填写工单
  const [pageState, setPageState] = useState<'select' | 'form'>('select');

  // 左侧树状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('5260');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['生产类']);
  const [favorites, setFavorites] = useState<string[]>([]);

  // 选中的流程
  const [selectedFlow, setSelectedFlow] = useState<FlowItem | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    businessTopic: '存量运营',
    businessScene: '',
    deadline: '',
    executionMode: 'region',
    groupName: '',
    groupCode: '',
    remark: '',
  });

  // 客群弹窗
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupSearchName, setGroupSearchName] = useState('');
  const [groupSearchCode, setGroupSearchCode] = useState('');
  const [groupSearchSource, setGroupSearchSource] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [groupDialogSelected, setGroupDialogSelected] = useState<CustomerGroup | null>(null);
  const [groupPage, setGroupPage] = useState(1);

  // 提交确认弹窗
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // 修改执行人弹窗
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  // 候选执行人列表
  const candidatePersons = [
    '张建国', '张伟', '李明', '王强', '陈刚', '王磊', '杨波', '马超',
    '刘洋', '孙鹏', '周杰', '吴勇', '赵刚', '郑涛', '钱峰', '何明', '罗辉',
    '黄涛', '林峰', '徐磊', '韩鹏', '曹军', '谢亮', '邓勇', '冯杰',
  ];
  const filteredPersons = personSearch
    ? candidatePersons.filter(p => p.includes(personSearch))
    : candidatePersons;

  // 构建分类树
  const categoryTree = useMemo(() => buildCategoryTree(ticketTypes, favorites), [favorites]);

  // 筛选当前分类下的流程
  const filteredFlows = useMemo(() => {
    let result = flows;
    if (selectedCategory === 'favorites') {
      result = flows.filter(f => favorites.includes(f.id));
    } else if (selectedCategory) {
      // 判断 selectedCategory 是父分类还是叶子节点(code)
      const isParentCategory = ticketTypes.some(t => t.category === selectedCategory);
      if (isParentCategory) {
        // 父分类被选中时不展示流程（需选择具体工单类型）
        result = [];
      } else {
        // 叶子节点：通过code找到对应的工单类型名称
        const typeName = ticketTypes.find(t => t.code === selectedCategory)?.name;
        if (typeName) {
          result = flows.filter(f => f.ticketType === typeName);
        } else {
          result = [];
        }
      }
    } else {
      result = [];
    }
    if (searchKeyword) {
      result = result.filter(f => f.name.includes(searchKeyword));
    }
    return result;
  }, [selectedCategory, searchKeyword, favorites]);

  // 客群弹窗筛选
  const filteredGroups = useMemo(() => {
    let result = customerGroups;
    if (groupSearchName) result = result.filter(g => g.name.includes(groupSearchName));
    if (groupSearchCode) result = result.filter(g => g.code.includes(groupSearchCode));
    if (groupSearchSource) result = result.filter(g => g.source === groupSearchSource);
    return result;
  }, [groupSearchName, groupSearchCode, groupSearchSource]);

  const groupPageSize = 8;
  const groupTotalPages = Math.ceil(filteredGroups.length / groupPageSize);
  const pagedGroups = filteredGroups.slice((groupPage - 1) * groupPageSize, groupPage * groupPageSize);

  // 派发预览数据（可修改执行人）
  const [previewData, setPreviewData] = useState<{ org: string; executor: string }[]>(() =>
    dispatchPreviewData[formData.executionMode] || []
  );
  // 执行模式变更时重置预览数据
  const prevModeRef = useState(formData.executionMode);
  if (prevModeRef[0] !== formData.executionMode) {
    prevModeRef[1](formData.executionMode);
    setPreviewData(dispatchPreviewData[formData.executionMode] || []);
  }

  // 业务类型联动
  const availableScenes = useMemo(() => {
    return businessScenesMap[formData.businessTopic] || [];
  }, [formData.businessTopic]);

  // 收藏切换
  const toggleFavorite = (flowId: string) => {
    setFavorites(prev => prev.includes(flowId) ? prev.filter(id => id !== flowId) : [...prev, flowId]);
  };

  // 选择流程进入填单
  const handleSelectFlow = (flow: FlowItem) => {
    setSelectedFlow(flow);
    setPageState('form');
  };

  // 返回选择页
  const handleBack = () => {
    setPageState('select');
    setSelectedFlow(null);
    setFormData({ name: '', businessTopic: '存量运营', businessScene: '', deadline: '', executionMode: 'region', groupName: '', groupCode: '', remark: '' });
    setSelectedGroup(null);
  };

  // 客群弹窗确定
  const handleGroupConfirm = () => {
    if (groupDialogSelected) {
      setSelectedGroup(groupDialogSelected);
      setFormData(prev => ({ ...prev, groupName: groupDialogSelected.name, groupCode: groupDialogSelected.code }));
    }
    setGroupDialogOpen(false);
    setGroupDialogSelected(null);
  };

  // 提交审批
  const handleSubmit = () => {
    setSubmitDialogOpen(true);
  };

  const handleSubmitConfirm = () => {
    setSubmitDialogOpen(false);

    // 生成工单编码
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const ticketId = `RET-${dateStr}-${seq}`;

    // 构造待办工单数据
    const executionModeLabels: Record<string, string> = { region: '区公司执行', city: '地市执行', grid: '网格执行' };
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newOrder = {
      id: ticketId,
      title: formData.name || '保有任务调度工单',
      type: '保有任务调度',
      alertType: '',
      businessScene: formData.businessScene || '',
      executionMode: executionModeLabels[formData.executionMode] || formData.executionMode,
      description: formData.remark || '保有任务调度工单',
      orderStatus: 'processing',
      flowStatus: 'inProgress',
      timeoutStatus: 'normal',
      processResult: null,
      customerPhone: '--',
      currentStep: '三级经理审批',
      currentHandler: '新疆区公司三级经理',
      city: '全疆',
      district: '--',
      grid: '--',
      updateTime: timeStr,
      creator: '新疆运营人员',
      createTime: timeStr,
      // 扩展字段用于工单详情页
      _dispatchType: 'retention-task' as const,
      _businessTopic: formData.businessTopic,
      _groupCode: formData.groupCode,
      _groupName: formData.groupName,
      _deadline: formData.deadline,
    };

    // 写入localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('pendingWorkOrders') || '[]');
      existing.unshift(newOrder);
      localStorage.setItem('pendingWorkOrders', JSON.stringify(existing));
    } catch {
      localStorage.setItem('pendingWorkOrders', JSON.stringify([newOrder]));
    }

    handleBack();
    // 跳转到工单处理页待办Tab
    router.push('/workspace/dispatch/process?tab=todo');
  };

  // 分类展开/收起
  const toggleCategory = (key: string, hasChildren: boolean) => {
    if (hasChildren) {
      // 父节点：仅展开/收起，不选中
      setExpandedCategories(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    } else {
      // 叶子节点：选中该工单类型
      setSelectedCategory(key);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 页面标题 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          {pageState === 'form' && (
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>返回上一页</span>
            </button>
          )}
          {pageState === 'form' && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {pageState === 'form' && selectedFlow && (
            <span className="text-sm text-muted-foreground">{selectedFlow.name}</span>
          )}
          {pageState === 'form' && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {pageState === 'form' && (
            <span className="text-sm font-medium">手动创建工单</span>
          )}
          {pageState === 'select' && (
            <h1 className="text-lg font-semibold">工单提交</h1>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {pageState === 'select' ? (
          <>
            {/* 左侧：工单类型分类 */}
            <div className="w-64 border-r flex flex-col bg-card">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  工单类型
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="请输入工单类型关键字"
                    className="pl-8 h-8 text-sm"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {categoryTree.map(node => (
                  <div key={node.key}>
                    <button
                      onClick={() => toggleCategory(node.key, !!(node.children && node.children.length > 0))}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        node.children && node.children.some(c => c.key === selectedCategory)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {node.children && node.children.length > 0 ? (
                        expandedCategories.includes(node.key) ? (
                          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                        )
                      ) : (
                        <span className="w-3.5 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-left">{node.label}</span>
                      <span className="text-xs text-muted-foreground">({node.count})</span>
                    </button>
                    {node.children && node.children.length > 0 && expandedCategories.includes(node.key) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {node.children.map(child => (
                          <button
                            key={child.key}
                            onClick={() => setSelectedCategory(child.key)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              selectedCategory === child.key
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <span className="flex-1 text-left">{child.label}</span>
                            <span className="text-xs text-muted-foreground">({child.count})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：流程列表 */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedCategory && ticketTypes.some(t => t.category === selectedCategory) ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">请选择具体的工单类型</p>
                  <p className="text-xs mt-1">点击左侧叶子节点查看可用流程</p>
                </div>
              ) : selectedCategory === 'favorites' && filteredFlows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Star className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">暂无收藏的流程</p>
                  <p className="text-xs mt-1">点击流程卡片上的星标即可收藏</p>
                </div>
              ) : filteredFlows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">该分类下暂无可用流程</p>
                </div>
              ) : (
                <>
                  {/* 我的收藏分组 */}
                  {selectedCategory !== 'favorites' && (() => {
                    const favFlows = filteredFlows.filter(f => favorites.includes(f.id));
                    if (favFlows.length === 0) return null;
                    return (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-primary rounded-full" />
                          <h3 className="text-sm font-medium">我的收藏({favFlows.length})</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {favFlows.map(flow => (
                            <FlowCard
                              key={flow.id}
                              flow={flow}
                              isFavorite={true}
                              onToggleFavorite={() => toggleFavorite(flow.id)}
                              onSelect={() => handleSelectFlow(flow)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 当前分类分组 */}
                  {(() => {
                    const catFlows = selectedCategory === 'favorites'
                      ? filteredFlows
                      : filteredFlows.filter(f => !favorites.includes(f.id));
                    if (catFlows.length === 0) return null;
                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-primary rounded-full" />
                          <h3 className="text-sm font-medium">
                            {selectedCategory === 'favorites' ? '收藏流程' : ticketTypes.find(t => t.code === selectedCategory)?.name || selectedCategory}({catFlows.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {catFlows.map(flow => (
                            <FlowCard
                              key={flow.id}
                              flow={flow}
                              isFavorite={favorites.includes(flow.id)}
                              onToggleFavorite={() => toggleFavorite(flow.id)}
                              onSelect={() => handleSelectFlow(flow)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </>
        ) : (
          /* 填单页面 */
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
            {/* 工单信息 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold">工单信息</h3>
              </div>
              <div className="space-y-4">
                {/* 工单名称 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 工单名称
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="请输入工单名称"
                      maxLength={20}
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {formData.name.length}/20
                    </span>
                  </div>
                </div>

                {/* 业务专题 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 业务专题
                  </Label>
                  <Select
                    value={formData.businessTopic}
                    onValueChange={val => setFormData(prev => ({ ...prev, businessTopic: val, businessScene: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTopics.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 业务类型 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 业务类型
                  </Label>
                  <Select
                    value={formData.businessScene}
                    onValueChange={val => setFormData(prev => ({ ...prev, businessScene: val }))}
                    disabled={!formData.businessTopic}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.businessTopic ? '请选择' : '请先选择业务专题'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScenes.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 执行截止时间 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 执行截止时间
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 工单执行模式 */}
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <Label className="text-sm justify-end mt-2">
                    <span className="text-destructive">*</span> 工单执行模式
                  </Label>
                  <RadioGroup
                    value={formData.executionMode}
                    onValueChange={val => setFormData(prev => ({ ...prev, executionMode: val }))}
                    className="flex gap-6"
                  >
                    {executionModes.map(mode => (
                      <div key={mode.value} className="flex items-center gap-2">
                        <RadioGroupItem value={mode.value} id={`mode-${mode.value}`} />
                        <Label htmlFor={`mode-${mode.value}`} className="text-sm cursor-pointer">{mode.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* 客群名称 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 客群名称
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="请选择客群"
                      value={formData.groupName}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGroupDialogSelected(null);
                        setGroupSearchName('');
                        setGroupSearchCode('');
                        setGroupSearchSource('');
                        setGroupPage(1);
                        setGroupDialogOpen(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      筛选客群
                    </Button>
                  </div>
                </div>

                {/* 客群编码 */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label className="text-sm justify-end">
                    <span className="text-destructive">*</span> 客群编码
                  </Label>
                  <Input
                    placeholder="选择客群后自动填入"
                    value={formData.groupCode}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {/* 备注信息 */}
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <Label className="text-sm justify-end mt-2">备注信息</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入备注信息"
                    value={formData.remark}
                    onChange={e => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* 工单派发预览 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-base font-semibold">工单派发预览</h3>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">序号</TableHead>
                      <TableHead>所属组织</TableHead>
                      <TableHead>执行人</TableHead>
                      <TableHead className="w-20 text-center">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-center">{idx + 1}</TableCell>
                          <TableCell>{row.org}</TableCell>
                          <TableCell>{row.executor}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => { setEditingRowIdx(idx); setPersonSearch(''); setSelectedPerson(row.executor); setPersonDialogOpen(true); }}>修改</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end gap-3 pb-6">
              <Button variant="outline" onClick={handleBack}>取消</Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.businessTopic || !formData.businessScene || !formData.deadline || !formData.groupName}
              >
                <Send className="h-4 w-4 mr-1" />
                提交审批
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 客群选择弹窗 */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent disableMaxWidth className="w-[1000px] h-[800px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <DialogTitle>选择客群</DialogTitle>
            </div>
          </DialogHeader>

          {/* 搜索区 */}
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">客群名称</Label>
              <Input
                placeholder="请输入客群名称"
                value={groupSearchName}
                onChange={e => { setGroupSearchName(e.target.value); setGroupPage(1); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">客群编码</Label>
              <Input
                placeholder="请输入客群编码"
                value={groupSearchCode}
                onChange={e => { setGroupSearchCode(e.target.value); setGroupPage(1); }}
                className="h-8 text-sm"
              />
            </div>
            <div className="w-32">
              <Label className="text-xs text-muted-foreground mb-1 block">标签来源</Label>
              <Select value={groupSearchSource} onValueChange={val => { setGroupSearchSource(val); setGroupPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="精准平台">精准平台</SelectItem>
                  <SelectItem value="智能推荐">智能推荐</SelectItem>
                  <SelectItem value="自定义">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => { setGroupSearchName(''); setGroupSearchCode(''); setGroupSearchSource(''); setGroupPage(1); }}>
              重置
            </Button>
            <Button size="sm" className="h-8">查询</Button>
          </div>

          {/* 客群列表 */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">选择</TableHead>
                  <TableHead>客群名称</TableHead>
                  <TableHead>客群编码</TableHead>
                  <TableHead>客群类型</TableHead>
                  <TableHead>触发时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      暂无匹配客群
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedGroups.map(group => (
                    <TableRow
                      key={group.id}
                      className={`cursor-pointer ${groupDialogSelected?.id === group.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setGroupDialogSelected(group)}
                    >
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name="groupSelect"
                          checked={groupDialogSelected?.id === group.id}
                          onChange={() => setGroupDialogSelected(group)}
                          className="accent-primary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-muted-foreground">{group.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{group.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{group.triggerTime}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-muted-foreground">共{filteredGroups.length}条</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={groupPage <= 1}
                onClick={() => setGroupPage(prev => prev - 1)}
              >
                &lt;
              </Button>
              <span className="text-sm">{groupPage}/{groupTotalPages || 1}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={groupPage >= groupTotalPages}
                onClick={() => setGroupPage(prev => prev + 1)}
              >
                &gt;
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>取消</Button>
            <Button onClick={handleGroupConfirm} disabled={!groupDialogSelected}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改执行人弹窗 */}
      <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>修改执行人</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="text-sm text-muted-foreground">
              为 <span className="font-medium text-foreground">{editingRowIdx !== null ? previewData[editingRowIdx]?.org : ''}</span> 选择执行人
            </div>
            <Input
              placeholder="搜索姓名"
              value={personSearch}
              onChange={e => setPersonSearch(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {filteredPersons.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">无匹配人员</div>
              ) : (
                filteredPersons.map(person => (
                  <button
                    key={person}
                    onClick={() => setSelectedPerson(person)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                      selectedPerson === person ? 'bg-primary/10 text-primary font-medium' : ''
                    }`}
                  >
                    {person}
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonDialogOpen(false)}>取消</Button>
            <Button
              onClick={() => {
                if (editingRowIdx !== null && selectedPerson) {
                  setPreviewData(prev => prev.map((row, i) => i === editingRowIdx ? { ...row, executor: selectedPerson } : row));
                }
                setPersonDialogOpen(false);
              }}
              disabled={!selectedPerson}
            >确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提交确认弹窗 */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认提交</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <Send className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">确认提交该工单至审批流程？</p>
                <p className="text-xs text-muted-foreground mt-1">
                  工单将发送至三级经理审批，审批通过后自动派发执行
                </p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-md p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">工单名称</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">业务专题</span>
                <span>{formData.businessTopic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">业务类型</span>
                <span>{formData.businessScene}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">执行模式</span>
                <span>{executionModes.find(m => m.value === formData.executionMode)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">客群</span>
                <span>{formData.groupName}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmitConfirm}>确认提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== 流程卡片组件 ==========

function FlowCard({
  flow,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: {
  flow: FlowItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className="group border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{flow.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {flow.ticketType}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{flow.nodes}个节点</span>
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
          className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
        >
          <Star
            className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}`}
          />
        </button>
      </div>
    </div>
  );
}
