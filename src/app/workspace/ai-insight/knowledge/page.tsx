'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Lightbulb,
  BarChart3,
  Tag,
  Calendar,
  Link2,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  BookOpen,
  Users,
  TrendingUp,
  Zap,
  Activity,
  Edit3,
  Trash2,
  Brain,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { indicatorModules } from '@/app/data/home/indicatorData';
import { Checkbox } from '@/components/ui/checkbox';

type InsightType = 'trend' | 'group_diff' | 'correlation' | 'anomaly' | 'incremental' | 'international';

interface Insight {
  id: string;
  conclusion: string;
  title?: string; // 洞察标题（可选，用于引用弹窗）
  content?: string; // 洞察详细内容（可选，用于引用弹窗）
  indicators: string[];
  relatedIndicators?: string[]; // 关联指标（用于引用弹窗中的指标列表）
  sceneTag: string;
  dataRange: string;
  sourceReport: string;
  sourceType: 'ai_auto' | 'report_auto';
  insightType: InsightType;
  citedCount: number;
  attributionLevel: string;
  attributionPath: { conclusion: string; contribution: string; confidence: 'high' | 'medium' | 'low'; evidence: string }[];
  caliber: string;
  dataSource: string;
  createdAt: string;
  algorithmSource?: string; // 生成该洞察的算法来源
  relatedInsights?: string[]; // 关联洞察ID
  verifyStatus: 'pending_confirm' | 'verified' | 'rejected';
}

/* ─── 指标选择弹窗 ─── */
function IndicatorPickerDialog({ selected, onConfirm, onClose }: { selected: string[]; onConfirm: (indicators: string[]) => void; onClose: () => void }) {
  const [checked, setChecked] = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(indicatorModules.map(m => m.id)));

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  const toggleIndicator = (name: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleModuleAll = (moduleId: string) => {
    const module = indicatorModules.find(m => m.id === moduleId);
    if (!module) return;
    const allNames = module.indicators.flatMap(ind => [ind.name, ...ind.subIndicators.map(s => s.name)]).filter(n => !search || n.includes(search));
    const allChecked = allNames.every(n => checked.has(n));
    setChecked(prev => {
      const next = new Set(prev);
      allNames.forEach(n => { if (allChecked) next.delete(n); else next.add(n); });
      return next;
    });
  };

  const filteredModules = indicatorModules.map(m => ({
    ...m,
    indicators: m.indicators.map(ind => ({
      ...ind,
      subIndicators: ind.subIndicators.filter(s => !search || s.name.includes(search) || ind.name.includes(search)),
    })).filter(ind => !search || ind.name.includes(search) || ind.subIndicators.length > 0),
  })).filter(m => m.indicators.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-[520px] border max-h-[75vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h3 className="font-medium text-sm">选择关联指标</h3>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="px-4 py-2 border-b shrink-0">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索指标名称..." className="h-8 text-sm" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredModules.map(mod => (
            <div key={mod.id} className="mb-1">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleModule(mod.id)}>
                {expandedModules.has(mod.id) ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
                <span className="text-xs font-medium">{mod.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{mod.indicators.reduce((s, i) => s + 1 + i.subIndicators.length, 0)}个指标</span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={e => { e.stopPropagation(); toggleModuleAll(mod.id); }}>
                  {mod.indicators.flatMap(i => [i.name, ...i.subIndicators.map(s => s.name)]).filter(n => !search || n.includes(search)).every(n => checked.has(n)) ? '取消全选' : '全选'}
                </Button>
              </div>
              {expandedModules.has(mod.id) && mod.indicators.map(ind => (
                <div key={ind.id || ind.name} className="ml-5">
                  <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/30 cursor-pointer text-sm">
                    <Checkbox checked={checked.has(ind.name)} onCheckedChange={() => toggleIndicator(ind.name)} className="h-3.5 w-3.5" />
                    <span className="font-medium text-xs">{ind.name}</span>
                  </label>
                  {ind.subIndicators.map(sub => (
                    <label key={sub.id} className="flex items-center gap-2 px-2 py-0.5 ml-4 rounded hover:bg-muted/20 cursor-pointer text-sm">
                      <Checkbox checked={checked.has(sub.name)} onCheckedChange={() => toggleIndicator(sub.name)} className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">{sub.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">已选 {checked.size} 个指标</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
            <Button size="sm" onClick={() => { onConfirm(Array.from(checked)); onClose(); }}>确认选择</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const confidenceConfig = {
  high: { label: '高', className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: '中', className: 'bg-amber-100 text-amber-700' },
  low: { label: '低', className: 'bg-red-100 text-red-700' },
};

const insightTypeConfig: Record<InsightType, { label: string; icon: React.ElementType; color: string; bgColor: string; description: string }> = {
  trend: { label: '流量运营', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', description: '流量运营域相关洞察' },
  group_diff: { label: '离网维系', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', description: '离网维系域相关洞察' },
  correlation: { label: '家庭运营', icon: Activity, color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', description: '家庭运营域相关洞察' },
  anomaly: { label: '中高端客户运营', icon: Zap, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', description: '中高端客户运营域相关洞察' },
  incremental: { label: '增量运营', icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200', description: '增量运营域相关洞察' },
  international: { label: '国际业务运营', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', description: '国际业务运营域相关洞察' },
};

const mockInsights: Insight[] = [
  { id: 'i1', conclusion: '5G套餐升级对ARPU提升效应显著，5G用户ARPU是4G用户的1.6倍', indicators: ['移动ARPU', '5G渗透率', 'DOU'], sceneTag: '流量运营', dataRange: '2026年6月', sourceReport: '6月经营分析报告', sourceType: 'ai_auto', verifyStatus: 'verified', insightType: 'group_diff', citedCount: 3, attributionLevel: '分解归因', attributionPath: [{ conclusion: '5G用户ARPU=58.3元，4G用户ARPU=36.2元', contribution: '62%', confidence: 'high', evidence: '6月经分数据.xlsx，分层统计' }, { conclusion: '5G升级转化率仅38%，有较大提升空间', contribution: '38%', confidence: 'medium', evidence: '套餐迁转明细.xlsx，月度迁转统计' }], caliber: 'ARPU=月出账收入/出账用户数', dataSource: '大数据平台月度指标', algorithmSource: '分组对比算法', createdAt: '06-29' },
  { id: 'i2', conclusion: '新入网用户低档套餐占比62%，是拉低整体ARPU的主要因素', indicators: ['移动ARPU', '新入网用户数'], sceneTag: '中高端运营', dataRange: '2026年6月', sourceReport: '6月经营分析报告', sourceType: 'ai_auto', verifyStatus: 'verified', insightType: 'group_diff', citedCount: 2, attributionLevel: '分解归因', attributionPath: [{ conclusion: '新入网用户低档套餐占比62%，拉低ARPU约0.5元', contribution: '78%', confidence: 'high', evidence: '5月CRM导出.csv，新入网套餐分布' }, { conclusion: '存量降档用户占比8.3%，贡献ARPU下降约0.3元', contribution: '22%', confidence: 'medium', evidence: '套餐迁转明细.xlsx，降档统计' }], caliber: '新入网低档占比=新入网低档套餐用户数/新入网总用户数', dataSource: 'CRM系统新入网数据', algorithmSource: '分组对比算法', createdAt: '06-29' },
  { id: 'i3', conclusion: '南疆三地市(喀什、和田、克州)5G渗透率仅45.6%，与北疆差距26.7pp', indicators: ['5G渗透率', '5G用户数'], sceneTag: '流量运营', dataRange: '2026年6月', sourceReport: '6月经营分析报告', sourceType: 'ai_auto', verifyStatus: 'verified', insightType: 'group_diff', citedCount: 1, attributionLevel: '区域归因', attributionPath: [{ conclusion: '南疆网络覆盖不足导致5G终端使用受限', contribution: '55%', confidence: 'medium', evidence: '地市流量明细.xlsx，5G流量占比' }, { conclusion: '南疆营销资源投入低于北疆', contribution: '45%', confidence: 'low', evidence: '区域营销投入统计（待补充）' }], caliber: '5G渗透率=5G套餐用户数/移动出账用户数', dataSource: '大数据平台区域指标', algorithmSource: '分组对比算法', createdAt: '06-29' },
  { id: 'i4', conclusion: '降档客户中68%在降档前30天内有过套餐查询行为，可作为预警信号', indicators: ['降档率', '套餐查询量'], sceneTag: '离网维系', dataRange: '2026年H1', sourceReport: '中高端客户保有分析', sourceType: 'ai_auto', verifyStatus: 'verified', insightType: 'correlation', citedCount: 4, attributionLevel: '因果推断', attributionPath: [{ conclusion: '套餐查询行为与降档正相关（r=0.72）', contribution: '68%', confidence: 'high', evidence: '客户行为日志，查询-降档时间差分析' }, { conclusion: '查询后30天内降档概率68%', contribution: '-', confidence: 'high', evidence: '6个月跟踪统计' }], caliber: '降档率=当月降档用户数/月初存量用户数', dataSource: 'CRM系统+行为日志', algorithmSource: '相关性分析', createdAt: '06-25' },
  { id: 'i5', conclusion: '宽带新增用户中融合套餐占比从42%提升至61%，有效降低单宽带离网率', indicators: ['宽带新增', '融合套餐占比', '宽带离网率'], sceneTag: '家庭运营', dataRange: '2026年H1', sourceReport: '宽带业务分析报告', sourceType: 'report_auto', verifyStatus: 'verified', insightType: 'trend', citedCount: 2, attributionLevel: '对比归因', attributionPath: [{ conclusion: '融合套餐用户宽带离网率1.2%，单宽带离网率4.8%', contribution: '75%', confidence: 'high', evidence: '宽带用户数据.csv，套餐类型-离网率分层统计' }], caliber: '融合套餐占比=融合宽带新增/宽带总新增', dataSource: '宽带用户管理系统', createdAt: '06-22' },
  { id: 'i6', conclusion: 'DOU同比增长15.3%，但流量收入增速仅6.8%，量收剪刀差持续扩大', indicators: ['DOU', '流量收入', '流量单价'], sceneTag: '流量运营', dataRange: '2026年6月', sourceReport: '流量运营专项分析', sourceType: 'ai_auto', verifyStatus: 'pending_confirm', insightType: 'trend', citedCount: 1, attributionLevel: '分解归因', attributionPath: [{ conclusion: '流量单价同比下降7.4%，降价主要来自不限量套餐占比上升', contribution: '82%', confidence: 'high', evidence: '地市流量明细.xlsx，套餐-流量收入矩阵' }, { conclusion: '5G流量占比提升但ARPU提振未达预期', contribution: '18%', confidence: 'medium', evidence: '5G/4G流量收入对比' }], caliber: '量收差=DOU增速-流量收入增速', dataSource: '大数据平台流量指标', algorithmSource: '时间趋势分析', createdAt: '06-15' },
  { id: 'i7', conclusion: '乌鲁木齐5月DOU突增32%远超均值，排查为不限量套餐集中生效所致', indicators: ['DOU', '不限量套餐占比'], sceneTag: '流量运营', dataRange: '2026年5月', sourceReport: '5月流量异常分析', sourceType: 'ai_auto', verifyStatus: 'pending_confirm', insightType: 'anomaly', citedCount: 1, attributionLevel: '因果推断', attributionPath: [{ conclusion: '5月1日不限量套餐批量生效，当日DOU环比增28%', contribution: '85%', confidence: 'high', evidence: '套餐生效日志+日粒度DOU监控' }, { conclusion: '营销活动推送带动短期流量激增', contribution: '15%', confidence: 'medium', evidence: '营销推送日志' }], caliber: 'DOU环比增幅=(当月DOU-上月DOU)/上月DOU', dataSource: '日粒度流量监控数据', algorithmSource: '异常检测算法', createdAt: '05-28' },
  { id: 'i8', conclusion: '喀什地市ARPU连续3个月环比下降，降幅从1.2%扩大至3.5%，需关注', indicators: ['移动ARPU', '降档率'], sceneTag: '中高端运营', dataRange: '2026年Q2', sourceReport: 'Q2经营趋势分析', sourceType: 'ai_auto', verifyStatus: 'pending_confirm', insightType: 'anomaly', citedCount: 2, attributionLevel: '区域归因', attributionPath: [{ conclusion: '低档套餐用户占比上升7.2pp是主因', contribution: '70%', confidence: 'high', evidence: '地市ARPU分层拆解' }, { conclusion: '竞品低价套餐抢夺中高端用户', contribution: '30%', confidence: 'low', evidence: '市场调研反馈（待量化）' }], caliber: 'ARPU环比变化率=(当月ARPU-上月ARPU)/上月ARPU', dataSource: '大数据平台区域指标', algorithmSource: '异常检测算法', createdAt: '06-10' },
];

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); });
  return (
    <div className="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right">
      <CheckCircle className="w-4 h-4" />{message}
    </div>
  );
}

export default function KnowledgePage() {
  const router = useRouter();
  const [sceneFilter, setSceneFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [verifyFilter, setVerifyFilter] = useState<string>('all');
  const [businessDomainFilter, setBusinessDomainFilter] = useState<string>('all');
  const [indicatorFilter, setIndicatorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [toast, setToast] = useState<string | null>(null);
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);
  const [editIndicatorPicker, setEditIndicatorPicker] = useState(false);
  const [deletingInsightId, setDeletingInsightId] = useState<string | null>(null);
  const [citingInsight, setCitingInsight] = useState<Insight | null>(null);

  const allIndicators = [...new Set(insights.flatMap(i => i.indicators))];

  const filteredInsights = insights.filter(ins => {
    const matchScene = sceneFilter === 'all' || ins.sceneTag === sceneFilter;
    const matchSource = sourceFilter === 'all' || ins.sourceType === sourceFilter;
    const matchDomain = businessDomainFilter === 'all' || ins.sceneTag === businessDomainFilter;
    const matchIndicator = indicatorFilter === 'all' || ins.indicators.includes(indicatorFilter);
    const matchSearch = !searchQuery || ins.conclusion.includes(searchQuery) || ins.indicators.some(ind => ind.includes(searchQuery));
    const matchVerify = verifyFilter === 'all' || ins.verifyStatus === verifyFilter;
    return matchScene && matchSource && matchDomain && matchIndicator && matchSearch && matchVerify;
  });

  const scenes = [...new Set(insights.map(i => i.sceneTag))];

  const handleSaveInsight = (partial: Partial<Insight>) => {
    const newInsight: Insight = {
      id: `i${insights.length + 1}`,
      conclusion: partial.conclusion || '',
      indicators: partial.indicators || [],
      sceneTag: partial.sceneTag || '',
      dataRange: '2026年6月',
      sourceReport: partial.sourceType === 'report_auto' ? '报告定稿提取' : (partial.sourceReport || 'AI自动归集'),
      sourceType: partial.sourceType || 'ai_auto',
      insightType: partial.insightType || 'trend',
      citedCount: 0,
      verifyStatus: 'pending_confirm',
      attributionLevel: partial.attributionLevel || '',
      attributionPath: [],
      caliber: partial.caliber || '',
      dataSource: partial.dataSource || '',
      createdAt: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    };
    setInsights([newInsight, ...insights]);
    setToast('洞察已成功记录');
  };

  const handleUpdateInsight = (updated: Insight) => {
    setInsights(insights.map(i => i.id === updated.id ? updated : i));
    setEditingInsight(null);
    setToast('洞察已更新');
  };

  const handleDeleteInsight = () => {
    if (deletingInsightId) {
      setInsights(insights.filter(i => i.id !== deletingInsightId));
      setDeletingInsightId(null);
      setToast('洞察已删除');
    }
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-background">
      {/* 页头 */}
      <div className="px-6 py-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">洞察知识库</h1>
            <p className="text-xs text-muted-foreground mt-0.5">沉淀与复用AI分析洞察，确保口径一致、归因可追溯</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {([
                { type: 'trend' as InsightType, bg: 'bg-blue-50 border-blue-200' },
                { type: 'group_diff' as InsightType, bg: 'bg-purple-50 border-purple-200' },
                { type: 'correlation' as InsightType, bg: 'bg-emerald-50 border-emerald-200' },
                { type: 'anomaly' as InsightType, bg: 'bg-red-50 border-red-200' },
              ]).map(({ type, bg }) => {
                const cfg = insightTypeConfig[type];
                const Icon = cfg.icon;
                return (
                  <div key={type} className={`flex items-center gap-1 px-2 py-1 rounded-md border ${bg}`}>
                    <Icon className={`w-3 h-3 ${cfg.color}`} />
                    <span className={cfg.color}>{cfg.label} {insights.filter(i => i.insightType === type).length}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                <Brain className="w-3 h-3" />
                <span>AI自动归集 {insights.filter(i => i.sourceType === 'ai_auto').length}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                <CheckCircle className="w-3 h-3" />
                <span>已验证 {insights.filter(i => i.verifyStatus === 'verified').length}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                <Clock className="w-3 h-3" />
                <span>待确认 {insights.filter(i => i.verifyStatus === 'pending_confirm').length}</span>
              </div>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => router.push('/workspace/ai-insight')}>
              <Zap className="w-4 h-4" />AI洞察助手
            </Button>

          </div>
        </div>
      </div>

      {/* 筛选区 */}
      <div className="px-6 py-3 border-b flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">运营域</span>
          <Select value={sceneFilter} onValueChange={setSceneFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="关联运营域" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {scenes.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">来源</span>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="ai_auto">AI自动归集</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">状态</span>
          <Select value={verifyFilter} onValueChange={setVerifyFilter}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="验证状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="verified">已验证</SelectItem>
              <SelectItem value="pending_confirm">待确认</SelectItem>
              <SelectItem value="rejected">已废弃</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={indicatorFilter} onValueChange={setIndicatorFilter}>
          <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="关联指标" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部指标</SelectItem>
            {allIndicators.map(ind => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索洞察结论..." className="pl-8 h-8 text-sm" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">共 {filteredInsights.length} 条</span>
      </div>

      {/* 卡片列表区 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="space-y-3">
          {filteredInsights.map(insight => {
            const isExpanded = expandedId === insight.id;
            const typeConfig = insightTypeConfig[insight.insightType];
            const TypeIcon = typeConfig.icon;
            return (
              <div key={insight.id} className="border rounded-lg overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : insight.id)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><Lightbulb className="w-5 h-5 text-amber-500" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold">{insight.conclusion}</h3>
                        <Badge variant="outline" className={`text-xs h-5 border-0 shrink-0 ${typeConfig.bgColor} ${typeConfig.color}`}>
                          <TypeIcon className="w-3 h-3 mr-0.5" />{typeConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{insight.indicators.join('、')}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{insight.sceneTag}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{insight.dataRange}</span>
                        <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{insight.sourceReport}</span>
                        <span className="flex items-center gap-1">
                          {insight.sourceType === 'ai_auto' ? <Sparkles className="w-3 h-3 text-primary" /> : <BookOpen className="w-3 h-3" />}
                          {insight.sourceType === 'ai_auto' ? 'AI自动归集' : '报告提取'}
                        </span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />被引用 {insight.citedCount} 次</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">{insight.attributionLevel}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                    <div className="mt-3 space-y-3">
                      {insight.attributionPath.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-muted-foreground">归因路径</h4>
                            {insight.attributionPath.length > 2 && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                                const el = document.getElementById(`attr-detail-${insight.id}`);
                                if (el) el.classList.toggle('hidden');
                              }}>
                                展开全部归因
                              </Button>
                            )}
                          </div>
                          {/* L1 核心归因：贡献度最高的前2条 */}
                          <div className="space-y-1.5">
                            {insight.attributionPath
                              .filter(ap => ap.contribution !== '-')
                              .sort((a, b) => parseInt(b.contribution) - parseInt(a.contribution))
                              .slice(0, 2)
                              .map((ap, i) => {
                                const cc = confidenceConfig[ap.confidence];
                                return (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span>{ap.conclusion}</span>
                                        <Badge variant="outline" className="text-xs h-5">贡献度 {ap.contribution}</Badge>
                                        <Badge variant="outline" className={`${cc.className} text-xs h-5 border-0`}>置信度：{cc.label}</Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">证据：{ap.evidence}</div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                          {/* L2 展开区域：所有归因项 */}
                          {insight.attributionPath.length > 2 && (
                            <div id={`attr-detail-${insight.id}`} className="hidden mt-2 pt-2 border-t border-border space-y-1.5">
                              {insight.attributionPath.map((ap, i) => {
                                const cc = confidenceConfig[ap.confidence];
                                return (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1 w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span>{ap.conclusion}</span>
                                        {ap.contribution !== '-' && <Badge variant="outline" className="text-xs h-5">贡献度 {ap.contribution}</Badge>}
                                        <Badge variant="outline" className={`${cc.className} text-xs h-5 border-0`}>置信度：{cc.label}</Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">证据：{ap.evidence}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded px-3 py-2"><div className="text-xs font-semibold text-muted-foreground mb-1">计算口径</div><div className="text-sm">{insight.caliber}</div></div>
                        <div className="bg-background rounded px-3 py-2"><div className="text-xs font-semibold text-muted-foreground mb-1">数据来源</div><div className="text-sm">{insight.dataSource}</div></div>
                      </div>
                      {insight.algorithmSource && (
                        <div className="bg-background rounded px-3 py-2">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">算法来源</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs h-5 border-0 ${typeConfig.bgColor} ${typeConfig.color}`}>
                              <TypeIcon className="w-3 h-3 mr-0.5" />{insight.algorithmSource}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{typeConfig.description}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        {insight.verifyStatus === 'pending_confirm' ? (
                          <>
                            <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={() => { setInsights(prev => prev.map(i => i.id === insight.id ? {...i, verifyStatus: 'verified' as const} : i)); setToast('洞察已确认'); }}>
                              <CheckCircle className="w-3 h-3" />确认
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => { setInsights(prev => prev.filter(i => i.id !== insight.id)); setToast('洞察已废弃'); }}>
                              <Trash2 className="w-3 h-3" />废弃
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setCitingInsight(insight)}>
                              <Link2 className="w-3 h-3" />引用此洞察
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditingInsight(insight)}>
                              <Edit3 className="w-3 h-3" />编辑
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => setDeletingInsightId(insight.id)}>
                              <Trash2 className="w-3 h-3" />删除
                            </Button>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            来自「{insight.sourceReport}」自动归集
                          </span>
                          {insight.verifyStatus === 'pending_confirm' ? (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-orange-300 text-orange-600">待确认</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-green-300 text-green-600">已验证</Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 分页 */}
      <div className="px-6 py-3 border-t flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground">显示 1-{filteredInsights.length} / 共 {filteredInsights.length} 条</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled>上一页</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs w-7 bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">下一页</Button>
        </div>
      </div>

      {/* 弹窗 */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* 编辑洞察弹窗 */}
      {editingInsight && (
        <Dialog open={!!editingInsight} onOpenChange={() => setEditingInsight(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>编辑洞察</DialogTitle>
              <DialogDescription>修改洞察内容和分类信息</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">洞察结论</label>
                <Textarea value={editingInsight.conclusion} onChange={e => setEditingInsight({...editingInsight, conclusion: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">洞察类型</label>
                  <Select value={editingInsight.insightType || 'trend'} onValueChange={v => setEditingInsight({...editingInsight, insightType: v as InsightType})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trend">趋势洞察</SelectItem>
                      <SelectItem value="group_diff">群体差异</SelectItem>
                      <SelectItem value="correlation">相关性洞察</SelectItem>
                      <SelectItem value="anomaly">异常告警</SelectItem>
                      <SelectItem value="report_extract">报告提取</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">场景标签</label>
                  <Select value={editingInsight.sceneTag} onValueChange={v => setEditingInsight({...editingInsight, sceneTag: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="流量运营">流量运营</SelectItem>
                      <SelectItem value="中高端运营">中高端运营</SelectItem>
                      <SelectItem value="离网维系">离网维系</SelectItem>
                      <SelectItem value="家庭运营">家庭运营</SelectItem>
                      <SelectItem value="增量运营">增量运营</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">归因层级</label>
                  <Select value={editingInsight.attributionLevel} onValueChange={v => setEditingInsight({...editingInsight, attributionLevel: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="分解归因">分解归因</SelectItem>
                      <SelectItem value="对比归因">对比归因</SelectItem>
                      <SelectItem value="区域归因">区域归因</SelectItem>
                      <SelectItem value="客群归因">客群归因</SelectItem>
                      <SelectItem value="因果推断">因果推断</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">关联指标</label>
                  <div className="space-y-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-start" onClick={() => setEditIndicatorPicker(true)}>
                      <BarChart3 className="w-3.5 h-3.5 mr-1" />
                      {editingInsight.indicators.length > 0 ? `已选 ${editingInsight.indicators.length} 个指标` : '点击选择指标'}
                    </Button>
                    {editingInsight.indicators.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {editingInsight.indicators.map((ind: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] h-5 gap-0.5">
                            {ind}
                            <X className="w-2.5 h-2.5 cursor-pointer ml-0.5" onClick={() => setEditingInsight({...editingInsight, indicators: editingInsight.indicators.filter((_: string, j: number) => j !== i)})} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {editIndicatorPicker && editingInsight && (
                    <IndicatorPickerDialog
                      selected={editingInsight.indicators}
                      onConfirm={(inds: string[]) => setEditingInsight({...editingInsight, indicators: inds})}
                      onClose={() => setEditIndicatorPicker(false)}
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">计算口径</label>
                <Input value={editingInsight.caliber} onChange={e => setEditingInsight({...editingInsight, caliber: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">数据来源</label>
                <Input value={editingInsight.dataSource} onChange={e => setEditingInsight({...editingInsight, dataSource: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingInsight(null)}>取消</Button>
              <Button onClick={() => handleUpdateInsight(editingInsight)}>保存修改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认弹窗 */}
      <Dialog open={!!deletingInsightId} onOpenChange={() => setDeletingInsightId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>删除后该洞察将从知识库中移除，无法恢复。确定要删除吗？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingInsightId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteInsight}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 引用洞察确认弹窗 */}
      <Dialog open={!!citingInsight} onOpenChange={(v) => !v && setCitingInsight(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>引用洞察</DialogTitle>
            <DialogDescription>
              将此洞察作为当前分析的参考知识注入AI洞察助手，AI后续分析时会参考此洞察。
            </DialogDescription>
          </DialogHeader>
          {citingInsight && (
            <div className="space-y-3 py-2">
              <div className="bg-muted/50 rounded-md p-3">
                <p className="font-medium text-sm">{citingInsight.conclusion}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">口径：{citingInsight.caliber}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>来源：{citingInsight.sourceType === 'ai_auto' ? 'AI自动归集' : '报告提取'}</p>
                {citingInsight.indicators.length > 0 && (
                  <p>关联指标：{citingInsight.indicators.join('、')}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCitingInsight(null)}>取消</Button>
            <Button onClick={() => {
              if (citingInsight) {
                router.push(`/workspace/ai-insight?mode=knowledge&insightId=${citingInsight.id}&insightTitle=${encodeURIComponent(citingInsight.title || citingInsight.conclusion)}`);
                setCitingInsight(null);
              }
            }}>确认引用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
