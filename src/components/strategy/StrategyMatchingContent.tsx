'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, TrendingUp, AlertTriangle, Info, Plus, ChevronDown, Trash2, Edit2, Bot, X, ChevronUp, MapPin, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import StrategyMakingPanel, { PLAN_OPTIONS, type StrategyPlan } from './StrategyMakingPanel';
import ActivityConfigDialog from './ActivityConfigDialog';
import { type ActivitySubmitData } from './ActivityConfigForm';
import StrategyDispatchDialog from './StrategyDispatchDialog';

// 地市列表
const ALL_PROVINCES = [
  '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州',
  '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁',

];

// 指标方向类型
type IndicatorDirection = 'positive' | 'negative';

// 地州排名类型
type ProvinceRankType = 'top' | 'bottom';

// 客群-策略对
interface CustomerStrategyPair {
  id: number;
  customerGroup: string | null;  // 改为可空，支持无客群策略
  strategies: Strategy[];
}

interface Strategy {
  id: number;
  content: string;
  isAIGenerated: boolean;
  isEditing: boolean;
  dispatchProvinces: string[];   // 派发地州列表 - 移动到策略级别
  provinceRankType?: ProvinceRankType;  // 地州排名类型 - 移动到策略级别
}

// 根因指标卡片
interface RootCauseCard {
  id: number;
  indicatorName: string;
  indicatorId: string;
  correlation: string;
  isExpanded: boolean;
  rootCauseAnalysis: string;
  indicatorDirection: IndicatorDirection;  // 新增：指标方向
  customerStrategyPairs: CustomerStrategyPair[];
}

// 可选的潜在风险客群列表
const availableCustomerGroups = [
  '异网主卡客户',
  '异网主卡高价值客户',
  '异网主卡低流量客户',
  '套餐即将到期客户',
  '高投诉风险客户',
  '使用量大幅下降客户',
];

// AI 策略建议池（AI 改写 / AI 补全使用）
const AI_STRATEGY_SUGGESTIONS = [
  '基于客群历史消费与流量使用特征，建议以套餐升档为核心抓手，叠加流量包折扣，通过短信+外呼双通道触达，同步引导办理',
  '结合客户价值评分与在网时长，建议推送专属权益礼包，话术强调长期优惠，由网格人员电话触达确认办理意愿',
  '针对客群近期使用量下降趋势，建议先以关怀回访方式了解原因，再推荐适配当前消费分层的轻量套餐，降低客户感知门槛',
  '参考同类客群历史转化情况，建议在月末账期前 5 日集中触达，同步在营业厅与线上渠道展示对应活动，提升办理转化',
];

// 可选的根因指标列表
const availableIndicators = [
  { id: '1', name: '一降到底规模', direction: 'negative' as IndicatorDirection },
  { id: '2', name: '离网率', direction: 'negative' as IndicatorDirection },
  { id: '3', name: '降档率', direction: 'negative' as IndicatorDirection },
  { id: '4', name: '超套率', direction: 'negative' as IndicatorDirection },
  { id: '5', name: '保有率', direction: 'positive' as IndicatorDirection },
  { id: '6', name: '满意度', direction: 'positive' as IndicatorDirection },
];

// 指标元信息：指标ID / 指标描述 / 异常原因（AI 诊断根因）
const INDICATOR_META: Record<string, { id: string; desc: string; reason: string }> = {
  '一降到底规模': {
    id: 'IND-DECLINE-001',
    desc: '统计周期内套餐消费降至保底档位（一降到底）的客户规模，用于识别客户价值流失风险',
    reason: '中低端客户 5G 终端已具备但套餐未升档，存量升档触点缺失',
  },
  '离网率': {
    id: 'IND-CHURN-001',
    desc: '统计周期内主动离网客户数占在网客户总数的比例，衡量客户维系成效',
    reason: '到期前 15 天触达覆盖率不足，竞品低价套餐分流',
  },
  '降档率': {
    id: 'IND-DOWNGRADE-001',
    desc: '统计周期内套餐档位下调的客户占比，反映客户消费能力下降',
    reason: '客户消费能力下降或竞品争夺，套餐与需求不匹配',
  },
  '超套率': {
    id: 'IND-OVERUSE-001',
    desc: '统计周期内流量使用超出套餐额度的客户占比',
    reason: '套餐流量额度与客户实际使用量不匹配',
  },
  '保有率': {
    id: 'IND-RETAIN-001',
    desc: '统计周期内客户保有比例，衡量客户留存与维系效果',
    reason: '',
  },
  '满意度': {
    id: 'IND-SAT-001',
    desc: '客户满意度评分，反映客户对服务的整体评价',
    reason: '',
  },
};

// AI 定策与比选方案数据
const AI_PLANS = [
  { name: '方案 A · 升档礼包', confidence: '92%', desc: '套餐升档 + 流量包折扣，短信+外呼双触达', effect: '预期转化 18.3%' },
  { name: '方案 B · 权益回馈', confidence: '86%', desc: '专属权益礼包，网格电话触达确认意愿', effect: '预期转化 15.7%' },
  { name: '方案 C · 关怀维系', confidence: '78%', desc: '先关怀回访再推荐轻量套餐，降低感知门槛', effect: '预期转化 12.9%' },
];

// 根据指标方向获取默认派发地州
const getDefaultProvinces = (direction: IndicatorDirection): { provinces: string[]; rankType: ProvinceRankType } => {
  if (direction === 'positive') {
    // 正向指标（如保有率↑为好）：派发给排名靠后的地州（需改进）
    return {
      provinces: ['乌鲁木齐', '克拉玛依', '昌吉'],
      rankType: 'bottom'
    };
  } else {
    // 负向指标（如离网率↓为好）：派发给排名靠前的地州（问题严重）
    return {
      provinces: ['喀什', '阿克苏', '巴州'],
      rankType: 'top'
    };
  }
};

// 获取排名显示文本
const getRankDisplayText = (rankType?: ProvinceRankType, direction?: IndicatorDirection, indicatorName?: string): string => {
  if (!rankType || !direction) return '';
  
  // 提取指标名称中的关键部分作为显示
  const getShortName = (name?: string): string => {
    if (!name) return direction === 'positive' ? '保有率' : '离网率';
    if (name.includes('保有率')) return '保有率';
    if (name.includes('离网率')) return '离网率';
    if (name.includes('满意度')) return '满意度';
    if (name.includes('降档率')) return '降档率';
    if (name.includes('超套率')) return '超套率';
    // 默认返回原名称或默认值
    return name.length > 4 ? name.substring(0, 4) : name;
  };
  
  const shortName = getShortName(indicatorName);
  
  if (direction === 'positive') {
    return rankType === 'bottom' ? `${shortName}后3` : `${shortName}前3`;
  } else {
    return rankType === 'top' ? `${shortName}前3` : `${shortName}后3`;
  }
};

// 根据方案构建策略内容（用于推荐策略表格展示）
const buildPlanContent = (plan: StrategyPlan): string =>
  `${plan.name}：针对「${plan.targetGroup}」，推荐「${plan.product}」，通过「${plan.channel}」触达，预估转化 ${plan.conversion}。`;

// 根据新建策略弹窗提交数据构建策略内容
const buildStrategyContent = (data: ActivitySubmitData): string => {
  const group = data.targetGroup ? `（${data.targetGroup}）` : '';
  return `${data.activityName}${group}：${data.script}`;
};

interface StrategyMatchingContentProps {
  indicatorName?: string;      // 默认 '一降到底规模'
  indicatorId?: string;        // 默认 ''
  from?: string;               // 默认 'churn-retention'
  tab?: string;                // 默认 'overview'
  template?: string;           // 从模板/最佳实践带入定策的模板ID
  conclusion?: string;         // 诊断结论编号（来自接收诊断跳转）
  onReturn?: () => void;       // 提供时"返回"按钮调用它，否则保持原 router.push 跳转行为
  onNext?: (info: { indicatorName: string; indicatorId: string; from: string }) => void; // 提供时"下一步"调用它，否则保持原跳转
}

function StrategyMatchingContent({ indicatorName: indicatorNameProp, indicatorId = '', from = 'churn-retention', tab = 'overview', template, conclusion, onReturn, onNext }: StrategyMatchingContentProps) {
  const router = useRouter();
  const indicatorName = indicatorNameProp || '一降到底规模';
  const selectedIndicatorId = indicatorId;
  const indicatorMeta = INDICATOR_META[indicatorName] ?? { id: selectedIndicatorId || 'IND-DEFAULT', desc: '', reason: '' };

  // 根据指标名称判断指标方向
  const getIndicatorDirection = (name: string): IndicatorDirection => {
    const positiveKeywords = ['保有率', '满意度', '增长', '提升', '增加'];
    const negativeKeywords = ['离网率', '降档率', '超套率', '一降到底', '投诉', '流失', '下降'];
    
    // 优先检查正向关键词
    for (const keyword of positiveKeywords) {
      if (name.includes(keyword)) return 'positive';
    }
    // 再检查负向关键词
    for (const keyword of negativeKeywords) {
      if (name.includes(keyword)) return 'negative';
    }
    // 默认返回负向
    return 'negative';
  };

  // 根据指标名称获取初始指标方向
  const initialDirection = getIndicatorDirection(indicatorName);
  const initialProvinceConfig = getDefaultProvinces(initialDirection);

  // 根因指标卡片列表
  const [rootCauseCards, setRootCauseCards] = useState<RootCauseCard[]>([
    {
      id: 1,
      indicatorName: indicatorName,
      indicatorId: selectedIndicatorId,
      correlation: '50%',
      isExpanded: true,
      rootCauseAnalysis: '1、异网主卡客户略有减少，利好降档挽留',
      indicatorDirection: initialDirection,
      customerStrategyPairs: [
        {
          id: 1,
          customerGroup: '异网主卡客户',
          strategies: [
            {
              id: 1,
              content: buildPlanContent(PLAN_OPTIONS[0]),
              isAIGenerated: true,
              isEditing: false,
              dispatchProvinces: initialProvinceConfig.provinces,
              provinceRankType: initialProvinceConfig.rankType,
            },
          ],
        },
      ],
    },
  ]);

  // 编辑策略对话框状态
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    cardId: null as number | null,
    pairId: null as number | null,
    strategyId: null as number | null,
    content: '',
  });

  // 添加客群弹窗状态
  const [addGroupDialog, setAddGroupDialog] = useState({
    isOpen: false,
    cardId: null as number | null,
    selectedGroup: '',
  });

  // 新增指标弹窗状态
  // 客群-策略对拖拽排序状态（A3）
  const [draggingPair, setDraggingPair] = useState<{ cardId: number; pairId: number } | null>(null);
  const [dragOverPairId, setDragOverPairId] = useState<number | null>(null);

  // AI 改写 / AI 补全动作状态（A4）：key = `${cardId}-${pairId}-${strategyId}`
  const [aiActionState, setAiActionState] = useState<Record<string, 'loading' | 'adopted'>>({});

  const [addIndicatorDialog, setAddIndicatorDialog] = useState({
    isOpen: false,
    selectedIndicatorId: '',
  });

  // 历史效果参照：已引用的策略名（点击"引用"回填）
  const [referencedStrategy, setReferencedStrategy] = useState<string>('');
  // AI 定策与比选：当前选中的方案
  const [selectedPlan, setSelectedPlan] = useState<string>(AI_PLANS[0].name);
  // 方案比选弹窗开关
  const [compareOpen, setCompareOpen] = useState(false);

  // 引用历史策略要素（回填产品/话术/渠道提示）
  const handleReferenceStrategy = (strategyName: string) => {
    setReferencedStrategy(strategyName);
  };

  // 采用 / 切换 AI 方案
  const handleAdoptPlan = (planName: string) => {
    setSelectedPlan(planName);
  };

  // 确认采用该策略：更新下方「推荐策略」中首条策略内容为用户选中的方案
  const handleAdoptStrategy = (plan: StrategyPlan) => {
    const content = buildPlanContent(plan);
    setRootCauseCards((prev) =>
      prev.map((card, cardIndex) => {
        if (cardIndex !== 0) return card;
        return {
          ...card,
          customerStrategyPairs: card.customerStrategyPairs.map((pair, pairIndex) => {
            if (pairIndex !== 0) return pair;
            return {
              ...pair,
              strategies: pair.strategies.map((s, sIndex) =>
                sIndex === 0 ? { ...s, content, isAIGenerated: true } : s
              ),
            };
          }),
        };
      })
    );
  };

  // 编辑原因分析弹窗状态
  const [editAnalysisDialog, setEditAnalysisDialog] = useState({
    isOpen: false,
    cardId: null as number | null,
    content: '',
  });

  // 地州选择弹窗状态
  const [provinceDialog, setProvinceDialog] = useState({
    isOpen: false,
    cardId: null as number | null,
    pairId: null as number | null,
    strategyId: null as number | null,
    selectedProvinces: [] as string[],
    searchKeyword: '',
  });

  // 策略调度弹窗 + 新建活动弹窗
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityDialogHideTargetGroup, setActivityDialogHideTargetGroup] = useState(false);
  // 新建策略弹窗提交目标：cardId + pairId（pairId 为 null 表示「无需客群」，新增一个客群-策略对）
  const [activityDialogTarget, setActivityDialogTarget] = useState<{ cardId: number; pairId: number | null }>({ cardId: 1, pairId: 1 });
  // 新建策略弹窗预填内容（编辑方案时带入）
  const [activityDialogInitialData, setActivityDialogInitialData] = useState<Partial<ActivitySubmitData> | undefined>(undefined);

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
      return;
    }

    console.log('[strategy/matching] Return to:', from, 'tab:', tab);

    const url = new URL(`/portal/${from}`, window.location.origin);
    url.searchParams.set('fromStrategy', 'true');
    if (tab) {
      url.hash = tab;
    }

    console.log('[strategy/matching] Return URL:', url.toString());
    router.push(url.toString());
  };

  const handleNextStep = () => {
    if (onNext) {
      onNext({ indicatorName, indicatorId: selectedIndicatorId, from });
      return;
    }
    // 去调度：打开策略调度弹窗，复用策略调度工单流程
    setDispatchDialogOpen(true);
  };

  // 删除根因指标卡片
  const handleDeleteCard = (cardId: number) => {
    setRootCauseCards(rootCauseCards.filter(card => card.id !== cardId));
  };

  // 展开/收起卡片
  const handleToggleExpand = (cardId: number) => {
    setRootCauseCards(rootCauseCards.map(card => {
      if (card.id === cardId) {
        return { ...card, isExpanded: !card.isExpanded };
      }
      return card;
    }));
  };

  // 新增指标
  const handleOpenAddIndicatorDialog = () => {
    setAddIndicatorDialog({
      isOpen: true,
      selectedIndicatorId: '',
    });
  };

  const handleCloseAddIndicatorDialog = () => {
    setAddIndicatorDialog({
      isOpen: false,
      selectedIndicatorId: '',
    });
  };

  const handleConfirmAddIndicator = () => {
    if (!addIndicatorDialog.selectedIndicatorId) return;

    const selectedIndicator = availableIndicators.find(i => i.id === addIndicatorDialog.selectedIndicatorId);
    if (!selectedIndicator) return;

    const defaultProvinceConfig = getDefaultProvinces(selectedIndicator.direction);

    const newCard: RootCauseCard = {
      id: Date.now(),
      indicatorName: selectedIndicator.name,
      indicatorId: selectedIndicator.id,
      correlation: '50%',
      isExpanded: true,
      rootCauseAnalysis: '',
      indicatorDirection: selectedIndicator.direction,
      customerStrategyPairs: [],
    };

    setRootCauseCards([...rootCauseCards, newCard]);
    handleCloseAddIndicatorDialog();
  };

  // 编辑原因分析
  const handleOpenEditAnalysisDialog = (cardId: number) => {
    const card = rootCauseCards.find(c => c.id === cardId);
    if (card) {
      setEditAnalysisDialog({
        isOpen: true,
        cardId,
        content: card.rootCauseAnalysis,
      });
    }
  };

  const handleCloseEditAnalysisDialog = () => {
    setEditAnalysisDialog({
      isOpen: false,
      cardId: null,
      content: '',
    });
  };

  const handleSaveAnalysis = () => {
    if (editAnalysisDialog.cardId !== null) {
      setRootCauseCards(rootCauseCards.map(card => {
        if (card.id === editAnalysisDialog.cardId) {
          return { ...card, rootCauseAnalysis: editAnalysisDialog.content };
        }
        return card;
      }));
    }
    handleCloseEditAnalysisDialog();
  };

  // 删除客群-策略对
  const handleDeletePair = (cardId: number, pairId: number) => {
    setRootCauseCards(rootCauseCards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          customerStrategyPairs: card.customerStrategyPairs.filter(pair => pair.id !== pairId),
        };
      }
      return card;
    }));
  };

  // 打开添加客群弹窗
  const handleOpenAddGroupDialog = (cardId: number) => {
    setAddGroupDialog({
      isOpen: true,
      cardId,
      selectedGroup: '',
    });
  };

  // 关闭添加客群弹窗
  const handleCloseAddGroupDialog = () => {
    setAddGroupDialog({
      isOpen: false,
      cardId: null,
      selectedGroup: '',
    });
  };

  // 确认添加客群
  const handleConfirmAddGroup = () => {
    if (!addGroupDialog.cardId) return;

    const card = rootCauseCards.find(c => c.id === addGroupDialog.cardId);
    if (!card) return;

    const defaultProvinceConfig = getDefaultProvinces(card.indicatorDirection);

    const newPair: CustomerStrategyPair = {
      id: Date.now(),
      customerGroup: addGroupDialog.selectedGroup || null,
      strategies: [
        {
          id: Date.now(),
          content: '',
          isAIGenerated: false,
          isEditing: false,
          dispatchProvinces: defaultProvinceConfig.provinces,
          provinceRankType: defaultProvinceConfig.rankType,
        },
      ],
    };

    setRootCauseCards(rootCauseCards.map(card => {
      if (card.id === addGroupDialog.cardId) {
        return {
          ...card,
          customerStrategyPairs: [...card.customerStrategyPairs, newPair],
        };
      }
      return card;
    }));
    handleCloseAddGroupDialog();
  };

  // 打开新建策略弹窗（空表单，用于「新建策略」按钮）
  const handleOpenNewStrategyDialog = () => {
    setActivityDialogTarget({ cardId: 1, pairId: 1 });
    setActivityDialogHideTargetGroup(false);
    setActivityDialogInitialData(undefined);
    setActivityDialogOpen(true);
  };

  // 编辑方案：打开新建策略弹窗并预填方案内容
  const handleEditPlan = (plan: StrategyPlan) => {
    setActivityDialogTarget({ cardId: 1, pairId: 1 });
    setActivityDialogHideTargetGroup(false);
    setActivityDialogInitialData({
      activityName: plan.name,
      targetGroup: plan.targetGroup,
      channels: [plan.channel],
      products: [plan.product],
      script: plan.speech,
    });
    setActivityDialogOpen(true);
  };

  // 添加策略（无需客群）：打开新建策略弹窗，隐藏目标客群
  const handleAddStrategyWithoutGroup = (cardId: number) => {
    setActivityDialogTarget({ cardId, pairId: null });
    setActivityDialogHideTargetGroup(true);
    setActivityDialogInitialData(undefined);
    setActivityDialogOpen(true);
  };

  // 添加策略：打开新建策略弹窗（含目标客群），追加到指定客群-策略对
  const handleAddStrategy = (cardId: number, pairId: number) => {
    setActivityDialogTarget({ cardId, pairId });
    setActivityDialogHideTargetGroup(false);
    setActivityDialogInitialData(undefined);
    setActivityDialogOpen(true);
  };

  // 新建策略弹窗确认：将策略内容写入推荐策略表格
  const handleActivitySubmitted = (data: ActivitySubmitData) => {
    const content = buildStrategyContent(data);
    const { cardId, pairId } = activityDialogTarget;
    setRootCauseCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const defaultConfig = getDefaultProvinces(card.indicatorDirection);
        const newStrategy = {
          id: Date.now(),
          content,
          isAIGenerated: false,
          isEditing: false,
          dispatchProvinces: defaultConfig.provinces,
          provinceRankType: defaultConfig.rankType,
        };
        if (pairId === null) {
          // 无需客群：新增一个客群-策略对（无客群）
          return {
            ...card,
            customerStrategyPairs: [
              ...card.customerStrategyPairs,
              { id: Date.now(), customerGroup: null, strategies: [newStrategy] },
            ],
          };
        }
        // 添加策略：向指定客群-策略对追加策略（潜在风险客群合并单元格）
        return {
          ...card,
          customerStrategyPairs: card.customerStrategyPairs.map((pair) =>
            pair.id === pairId ? { ...pair, strategies: [...pair.strategies, newStrategy] } : pair
          ),
        };
      })
    );
    setActivityDialogOpen(false);
  };

  // 客群-策略对拖拽开始
  const handlePairDragStart = (cardId: number, pairId: number) => {
    setDraggingPair({ cardId, pairId });
  };

  // 客群-策略对拖拽结束
  const handlePairDragEnd = () => {
    setDraggingPair(null);
    setDragOverPairId(null);
  };

  // 客群-策略对拖拽放置（同一根因卡片内重排）
  const handlePairDrop = (cardId: number, targetPairId: number) => {
    if (!draggingPair || draggingPair.cardId !== cardId || draggingPair.pairId === targetPairId) {
      setDraggingPair(null);
      setDragOverPairId(null);
      return;
    }
    setRootCauseCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const list = [...card.customerStrategyPairs];
        const fromIndex = list.findIndex((p) => p.id === draggingPair.pairId);
        const toIndex = list.findIndex((p) => p.id === targetPairId);
        if (fromIndex === -1 || toIndex === -1) return card;
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        return { ...card, customerStrategyPairs: list };
      })
    );
    setDraggingPair(null);
    setDragOverPairId(null);
  };

  // AI 改写 / AI 补全（模拟 AI 生成过程：调用中 → 已采纳）
  const handleAiGenerateStrategy = (cardId: number, pairId: number, strategyId: number) => {
    const key = `${cardId}-${pairId}-${strategyId}`;
    if (aiActionState[key]) return;
    setAiActionState((prev) => ({ ...prev, [key]: 'loading' }));
    window.setTimeout(() => {
      const suggestion = AI_STRATEGY_SUGGESTIONS[strategyId % AI_STRATEGY_SUGGESTIONS.length];
      setRootCauseCards((prev) =>
        prev.map((card) =>
          card.id !== cardId
            ? card
            : {
                ...card,
                customerStrategyPairs: card.customerStrategyPairs.map((pair) =>
                  pair.id !== pairId
                    ? pair
                    : {
                        ...pair,
                        strategies: pair.strategies.map((s) =>
                          s.id !== strategyId
                            ? s
                            : { ...s, content: suggestion, isAIGenerated: true }
                        ),
                      }
                ),
              }
        )
      );
      setAiActionState((prev) => ({ ...prev, [key]: 'adopted' }));
    }, 900);
  };

  // 删除策略
  const handleDeleteStrategy = (cardId: number, pairId: number, strategyId: number) => {
    setRootCauseCards(rootCauseCards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          customerStrategyPairs: card.customerStrategyPairs.map(pair => {
            if (pair.id === pairId) {
              return {
                ...pair,
                strategies: pair.strategies.filter(strategy => strategy.id !== strategyId),
              };
            }
            return pair;
          }),
        };
      }
      return card;
    }));
  };

  // 打开编辑策略对话框
  const handleEditStrategy = (cardId: number, pairId: number, strategyId: number) => {
    const card = rootCauseCards.find(c => c.id === cardId);
    if (card) {
      const pair = card.customerStrategyPairs.find(p => p.id === pairId);
      if (pair) {
        const strategy = pair.strategies.find(s => s.id === strategyId);
        if (strategy) {
          setEditDialog({
            isOpen: true,
            cardId,
            pairId,
            strategyId,
            content: strategy.content,
          });
        }
      }
    }
  };

  // 关闭编辑对话框
  const handleCloseEditDialog = () => {
    setEditDialog({
      isOpen: false,
      cardId: null,
      pairId: null,
      strategyId: null,
      content: '',
    });
  };

  // 保存策略编辑
  const handleSaveStrategy = () => {
    if (editDialog.cardId !== null && editDialog.pairId !== null && editDialog.strategyId !== null) {
      setRootCauseCards(rootCauseCards.map(card => {
        if (card.id === editDialog.cardId) {
          return {
            ...card,
            customerStrategyPairs: card.customerStrategyPairs.map(pair => {
              if (pair.id === editDialog.pairId) {
                return {
                  ...pair,
                  strategies: pair.strategies.map(strategy => {
                    if (strategy.id === editDialog.strategyId) {
                      return {
                        ...strategy,
                        content: editDialog.content,
                        isAIGenerated: false,
                      };
                    }
                    return strategy;
                  }),
                };
              }
              return pair;
            }),
          };
        }
        return card;
      }));
    }
    handleCloseEditDialog();
  };

  // 打开地州选择弹窗
  const handleOpenProvinceDialog = (cardId: number, pairId: number, strategyId: number) => {
    const card = rootCauseCards.find(c => c.id === cardId);
    if (card) {
      const pair = card.customerStrategyPairs.find(p => p.id === pairId);
      if (pair) {
        const strategy = pair.strategies.find(s => s.id === strategyId);
        if (strategy) {
          setProvinceDialog({
            isOpen: true,
            cardId,
            pairId,
            strategyId,
            selectedProvinces: [...strategy.dispatchProvinces],
            searchKeyword: '',
          });
        }
      }
    }
  };

  // 关闭地州选择弹窗
  const handleCloseProvinceDialog = () => {
    setProvinceDialog({
      isOpen: false,
      cardId: null,
      pairId: null,
      strategyId: null,
      selectedProvinces: [],
      searchKeyword: '',
    });
  };

  // 切换地州选择
  const handleToggleProvince = (province: string) => {
    setProvinceDialog(prev => {
      const newSelected = prev.selectedProvinces.includes(province)
        ? prev.selectedProvinces.filter(p => p !== province)
        : [...prev.selectedProvinces, province];
      return { ...prev, selectedProvinces: newSelected };
    });
  };

  // 确认地州选择
  const handleConfirmProvinces = () => {
    if (provinceDialog.cardId !== null && provinceDialog.pairId !== null && provinceDialog.strategyId !== null) {
      setRootCauseCards(rootCauseCards.map(card => {
        if (card.id === provinceDialog.cardId) {
          return {
            ...card,
            customerStrategyPairs: card.customerStrategyPairs.map(pair => {
              if (pair.id === provinceDialog.pairId) {
                return {
                  ...pair,
                  strategies: pair.strategies.map(strategy => {
                    if (strategy.id === provinceDialog.strategyId) {
                      return {
                        ...strategy,
                        dispatchProvinces: provinceDialog.selectedProvinces,
                      };
                    }
                    return strategy;
                  }),
                };
              }
              return pair;
            }),
          };
        }
        return card;
      }));
    }
    handleCloseProvinceDialog();
  };

  // 移除单个地州
  const handleRemoveProvince = (cardId: number, pairId: number, strategyId: number, province: string) => {
    setRootCauseCards(rootCauseCards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          customerStrategyPairs: card.customerStrategyPairs.map(pair => {
            if (pair.id === pairId) {
              return {
                ...pair,
                strategies: pair.strategies.map(strategy => {
                  if (strategy.id === strategyId) {
                    return {
                      ...strategy,
                      dispatchProvinces: strategy.dispatchProvinces.filter(p => p !== province),
                    };
                  }
                  return strategy;
                }),
              };
            }
            return pair;
          }),
        };
      }
      return card;
    }));
  };

  // 过滤地州列表
  const filteredProvinces = ALL_PROVINCES.filter(province =>
    province.includes(provinceDialog.searchKeyword)
  );

  return (
    <>
      <div className="space-y-6">
        {/* 步骤导航 - 五步链路 */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          {['数据洞察', '策略匹配', '调度派发'].map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx <= 1 ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}>
                  {idx <= 1 ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-medium">{idx + 1}</span>}
                </div>
                <span className={`text-sm font-medium ${idx <= 1 ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
              </div>
              {idx < 2 && <div className={`w-10 h-0.5 ${idx < 1 ? 'bg-[#3B82F6]' : 'bg-gray-300'}`}></div>}
            </div>
          ))}
        </div>

            {/* 页面标题（当前分析指标） */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">策略制定</h1>
              <p className="text-sm text-gray-600">当前分析指标：{indicatorName}</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p><span className="text-gray-500">指标ID：</span><span className="font-medium text-gray-800">{indicatorMeta.id}</span></p>
                <p><span className="text-gray-500">指标描述：</span>{indicatorMeta.desc}</p>
                <p><span className="text-gray-500">异常原因：</span>{indicatorMeta.reason || '—'}</p>
                {conclusion && (
                  <p><span className="text-gray-500">关联诊断结论：</span><span className="font-medium text-gray-800">{conclusion}</span></p>
                )}
              </div>
            </div>

            {/* 策略制定（新增策略 + 话术，与策略调度弹窗一致） */}
            <div className="mb-6">
              <StrategyMakingPanel
                scenario="流量运营"
                onNewStrategy={handleOpenNewStrategyDialog}
                onConfirm={handleAdoptStrategy}
                onEditPlan={handleEditPlan}
              />
            </div>

            {/* 策略编辑（根因指标） */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">策略编辑</h2>
                <Button variant="outline" size="sm" onClick={handleOpenAddIndicatorDialog} className="border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-1" />
                  新增指标
                </Button>
              </div>

              {/* 根因指标卡片列表 */}
              {rootCauseCards.map((card) => (
                <Card key={card.id} className="p-6 border border-gray-200">
                  {/* 卡片标题 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{card.indicatorName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-[#3B82F6] text-xs font-medium">
                            关联度 {card.correlation}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            card.indicatorDirection === 'positive' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {card.indicatorDirection === 'positive' ? '正向指标' : '负向指标'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExpand(card.id)}
                      >
                        {card.isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 卡片内容 - 根据展开状态显示 */}
                  {card.isExpanded && (
                    <>
                      {/* 原因分析 - 可编辑 */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <h4 className="text-sm font-semibold text-red-600">原因分析</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditAnalysisDialog(card.id)}
                          >
                            <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          </Button>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                          <p className="text-sm text-gray-900">
                            {card.rootCauseAnalysis || '请输入原因分析内容'}
                          </p>
                        </div>
                      </div>

                      {/* 推荐策略 - 使用真正的表格布局 */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">推荐策略</h4>
                          <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>

                        {/* 真正的表格 */}
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 w-[200px]">
                                潜在风险客群
                              </th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                                策略
                              </th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 w-[220px]">
                                派发地州
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {card.customerStrategyPairs.map((pair) => (
                              pair.strategies.map((strategy, strategyIndex) => (
                                <tr
                                  key={`${pair.id}-${strategy.id}`}
                                  onDragOver={(e) => {
                                    if (draggingPair && draggingPair.cardId === card.id) {
                                      e.preventDefault();
                                      setDragOverPairId(pair.id);
                                    }
                                  }}
                                  onDragLeave={() =>
                                    setDragOverPairId((prev) => (prev === pair.id ? null : prev))
                                  }
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    handlePairDrop(card.id, pair.id);
                                  }}
                                  className={`border-b border-gray-200 transition-colors ${
                                    dragOverPairId === pair.id && draggingPair?.pairId !== pair.id
                                      ? "bg-ai-muted/60"
                                      : "hover:bg-gray-50"
                                  } ${draggingPair?.pairId === pair.id ? "opacity-50" : ""}`}
                                >
                                  {/* 左侧：客群 - 只在第一个策略行显示，使用 rowSpan */}
                                  {strategyIndex === 0 && (
                                    <td 
                                      className="px-4 py-4 border-r border-gray-200 align-top w-[200px]" 
                                      rowSpan={pair.strategies.length}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="cursor-grab active:cursor-grabbing"
                                          title="拖拽调整客群排序"
                                          draggable
                                          onDragStart={() => handlePairDragStart(card.id, pair.id)}
                                          onDragEnd={handlePairDragEnd}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                            <circle cx="9" cy="12" r="1"></circle>
                                            <circle cx="9" cy="5" r="1"></circle>
                                            <circle cx="9" cy="19" r="1"></circle>
                                            <circle cx="15" cy="12" r="1"></circle>
                                            <circle cx="15" cy="5" r="1"></circle>
                                            <circle cx="15" cy="19" r="1"></circle>
                                          </svg>
                                        </div>
                                        <p className="text-sm text-gray-900 flex-1">
                                          {pair.customerGroup || <span className="text-gray-400 italic">无客群</span>}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeletePair(card.id, pair.id)}
                                          className="p-1 h-auto"
                                        >
                                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                        </Button>
                                      </div>
                                    </td>
                                  )}

                                  {/* 中间：策略 */}
                                  <td className="px-4 py-4 border-r border-gray-200 align-top">
                                    <div className="space-y-3">
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm relative group">
                                        {/* 右侧操作区域 */}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                          {/* AI标记 - 一直显示 */}
                                          {strategy.isAIGenerated && (
                                            <Bot className="w-4 h-4 text-ai" />
                                          )}
                                          {/* 编辑和删除按钮 - hover时显示 */}
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEditStrategy(card.id, pair.id, strategy.id)}
                                              className="p-1 h-auto"
                                            >
                                              <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteStrategy(card.id, pair.id, strategy.id)}
                                              className="p-1 h-auto"
                                            >
                                              <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </Button>
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-900 leading-relaxed pr-12">
                                          {strategy.content || <span className="text-gray-400">请输入自定义策略</span>}
                                        </p>
                                        {/* AI 改写 / AI 补全（A4：调用中 → 已采纳） */}
                                        <div className="mt-2 flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs border-ai/40 text-ai hover:bg-ai/10 hover:text-ai disabled:opacity-60"
                                            disabled={Boolean(aiActionState[`${card.id}-${pair.id}-${strategy.id}`])}
                                            onClick={() => handleAiGenerateStrategy(card.id, pair.id, strategy.id)}
                                          >
                                            {aiActionState[`${card.id}-${pair.id}-${strategy.id}`] === "loading" ? (
                                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            ) : (
                                              <Sparkles className="w-3 h-3 mr-1" />
                                            )}
                                            {aiActionState[`${card.id}-${pair.id}-${strategy.id}`] === "adopted"
                                              ? "已采纳"
                                              : strategy.content
                                                ? "AI 改写"
                                                : "AI 补全"}
                                          </Button>
                                          {aiActionState[`${card.id}-${pair.id}-${strategy.id}`] === "adopted" && (
                                            <span className="text-xs text-gray-400">
                                              AI 建议已采纳，可继续手动编辑
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {/* 添加策略按钮 - 在最后一行显示，且仅对有客群的策略对显示 */}
                                      {strategyIndex === pair.strategies.length - 1 && pair.customerGroup !== null && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-[#3B82F6]"
                                          onClick={() => handleAddStrategy(card.id, pair.id)}
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          添加策略
                                        </Button>
                                      )}
                                    </div>
                                  </td>

                                  {/* 右侧：派发地州 - 每个策略对应一个配置区域 */}
                                  <td className="px-4 py-4 align-top">
                                    <div className="space-y-2">
                                      {/* 地州标签 */}
                                      <div className="flex flex-wrap gap-1.5">
                                        {strategy.dispatchProvinces.map((province) => (
                                          <Badge
                                            key={province}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-default text-xs"
                                          >
                                            {province}
                                            <button
                                              className="ml-1 hover:text-red-500"
                                              onClick={() => handleRemoveProvince(card.id, pair.id, strategy.id, province)}
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                      
                                      {/* 排名提示 */}
                                      {strategy.provinceRankType && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <MapPin className="w-3 h-3" />
                                          <span>{getRankDisplayText(strategy.provinceRankType, card.indicatorDirection, card.indicatorName)}</span>
                                        </div>
                                      )}
                                      
                                      {/* 添加地州按钮 */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs border-dashed border-gray-300 text-gray-600 hover:text-[#3B82F6] hover:border-[#3B82F6]"
                                        onClick={() => handleOpenProvinceDialog(card.id, pair.id, strategy.id)}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        添加地州
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3} className="px-4 py-3">
                                <div className="flex items-center gap-4">
                                  <Button variant="ghost" size="sm" className="text-[#3B82F6]" onClick={() => handleOpenAddGroupDialog(card.id)}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    添加潜在客户群
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleAddStrategyWithoutGroup(card.id)}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    添加策略（无需客群）
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={handleReturn} className="border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                去调度
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
      </div>

      {/* 编辑策略对话框 */}
      <Dialog open={editDialog.isOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑策略</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="请输入策略内容"
              value={editDialog.content}
              onChange={(e) => setEditDialog({ ...editDialog, content: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
                  取消
                </Button>
                <Button onClick={handleSaveStrategy} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                  保存
                </Button>
              </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加客群对话框 */}
      <Dialog open={addGroupDialog.isOpen} onOpenChange={(open) => setAddGroupDialog({ ...addGroupDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择潜在风险客群</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="customerGroup">客群类型（可选）</Label>
            <Select value={addGroupDialog.selectedGroup} onValueChange={(value) => setAddGroupDialog({ ...addGroupDialog, selectedGroup: value })}>
              <SelectTrigger id="customerGroup">
                <SelectValue placeholder="请选择客群类型（可跳过）" />
              </SelectTrigger>
              <SelectContent>
                {availableCustomerGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">提示：如不选择客群，将创建无客群的策略行</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseAddGroupDialog}>
                  取消
                </Button>
              <Button onClick={handleConfirmAddGroup} className="bg-[#3B82F6] hover:bg-[#2563EB]">
                  确认添加
                </Button>
              </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增指标对话框 */}
      <Dialog open={addIndicatorDialog.isOpen} onOpenChange={handleCloseAddIndicatorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择根因指标</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="indicator">指标名称</Label>
            <Select value={addIndicatorDialog.selectedIndicatorId} onValueChange={(value) => setAddIndicatorDialog({ ...addIndicatorDialog, selectedIndicatorId: value })}>
              <SelectTrigger id="indicator">
                <SelectValue placeholder="请选择根因指标" />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map((indicator) => (
                  <SelectItem key={indicator.id} value={indicator.id}>
                    <div className="flex items-center gap-2">
                      <span>{indicator.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        indicator.direction === 'positive' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {indicator.direction === 'positive' ? '正向' : '负向'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddIndicatorDialog}>
              取消
            </Button>
            <Button onClick={handleConfirmAddIndicator} className="bg-[#3B82F6] hover:bg-[#2563EB]" disabled={!addIndicatorDialog.selectedIndicatorId}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑原因分析对话框 */}
      <Dialog open={editAnalysisDialog.isOpen} onOpenChange={handleCloseEditAnalysisDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑原因分析</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="请输入原因分析内容"
              value={editAnalysisDialog.content}
              onChange={(e) => setEditAnalysisDialog({ ...editAnalysisDialog, content: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditAnalysisDialog}>
              取消
            </Button>
            <Button onClick={handleSaveAnalysis} className="bg-[#3B82F6] hover:bg-[#2563EB]">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 地州选择弹窗 */}
      <Dialog open={provinceDialog.isOpen} onOpenChange={handleCloseProvinceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择派发地州</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* 搜索框 */}
            <Input
              placeholder="搜索地州..."
              value={provinceDialog.searchKeyword}
              onChange={(e) => setProvinceDialog({ ...provinceDialog, searchKeyword: e.target.value })}
              className="mb-3"
            />
            
            {/* 已选地州 */}
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-2">已选择 {provinceDialog.selectedProvinces.length} 个地州</p>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-gray-50 rounded-lg">
                {provinceDialog.selectedProvinces.length === 0 ? (
                  <span className="text-xs text-gray-400">请选择地州</span>
                ) : (
                  provinceDialog.selectedProvinces.map((province) => (
                    <Badge
                      key={province}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs"
                    >
                      {province}
                      <button
                        className="ml-1 hover:text-red-500"
                        onClick={() => handleToggleProvince(province)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            
            {/* 地州列表 */}
            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              <div className="grid grid-cols-3 gap-1 p-2">
                {filteredProvinces.map((province) => (
                  <div
                    key={province}
                    className={`flex items-center gap-1.5 p-2 rounded cursor-pointer text-sm ${
                      provinceDialog.selectedProvinces.includes(province)
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleToggleProvince(province)}
                  >
                    <Checkbox
                      checked={provinceDialog.selectedProvinces.includes(province)}
                      className="h-4 w-4"
                    />
                    <span>{province}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseProvinceDialog}>
              取消
            </Button>
            <Button onClick={handleConfirmProvinces} className="bg-[#3B82F6] hover:bg-[#2563EB]">
              确认选择
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 方案比选弹窗 */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI 方案比选</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">方案</th>
                  <th className="py-2 pr-4 font-medium">置信度</th>
                  <th className="py-2 pr-4 font-medium">方案要点</th>
                  <th className="py-2 pr-4 font-medium">预期效果</th>
                  <th className="py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {AI_PLANS.map((p) => (
                  <tr key={p.name} className={`border-b border-gray-100 ${selectedPlan === p.name ? 'bg-blue-50/40' : ''}`}>
                    <td className="py-2 pr-4 text-gray-900 font-medium">{p.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{p.confidence}</td>
                    <td className="py-2 pr-4 text-gray-600">{p.desc}</td>
                    <td className="py-2 pr-4 text-gray-600">{p.effect}</td>
                    <td className="py-2">
                      <Button size="sm" variant={selectedPlan === p.name ? 'default' : 'outline'}
                        onClick={() => handleAdoptPlan(p.name)}
                        className={selectedPlan === p.name ? '' : 'border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50'}>
                        {selectedPlan === p.name ? '已采用' : '采用'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button onClick={() => setCompareOpen(false)} className="bg-[#3B82F6] hover:bg-[#2563EB]">
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 策略调度弹窗（复用策略调度工单流程，策略已在页面完成） */}
      <StrategyDispatchDialog
        open={dispatchDialogOpen}
        onOpenChange={setDispatchDialogOpen}
        indicatorName={indicatorName}
        scenario="流量运营"
        from={from}
        showStrategyMaking={false}
      />

      {/* 新建策略活动弹窗（复用活动配置的新建活动视图） */}
      <ActivityConfigDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        hideTargetGroup={activityDialogHideTargetGroup}
        initialData={activityDialogInitialData}
        onSubmitted={handleActivitySubmitted}
      />
    </>
  );
}

export default StrategyMatchingContent;
