'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Briefcase, Send, Settings, Plus, Search, FolderOpen } from 'lucide-react';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import StrategyMatchingContent from '@/components/strategy/StrategyMatchingContent';
import StrategyDispatchContent from '@/components/strategy/StrategyDispatchContent';
import { generateAnalysisData } from '@/data/trafficAnalysisUtils';
import { getScenarioIndicators, OperationIndicator } from '@/data/operationScenarios';

// ========== 顶部栏菜单数据 ==========
// 左侧运营菜单（箭头朝右，仅切换选中态不跳转）
const leftMenus = [
  { name: '流量运营', bg: 'btn-header-item.png', bgActive: 'btn-header-item-active.png' },
  { name: '中高端运营', bg: 'btn-header-item.png', bgActive: 'btn-header-item-active.png' },
  { name: '离网维系', bg: 'btn-header-item.png', bgActive: 'btn-header-item-active.png' },
];

// 右侧运营菜单（样式同左侧，箭头朝左，仅切换选中态不跳转）
const rightMenus = [
  { name: '家庭运营', bg: 'btn-header-item-right.png', bgActive: 'btn-header-item-right-active.png' },
  { name: '国际运营', bg: 'btn-header-item-right.png', bgActive: 'btn-header-item-right-active.png' },
];

const farRightMenus = [
  { name: '运营', icon: Settings, action: 'operation' as const },
];

// ========== 督办人员数据（参考客户商机选择审批人） ==========

const supervisorList = [
  { id: 'li_manager', name: '李主管', dept: '新疆市场部' },
  { id: 'zhao_director', name: '赵部长', dept: '新疆运维部' },
  { id: 'wang_manager', name: '王经理', dept: '乌鲁木齐分公司' },
  { id: 'sun_supervisor', name: '孙主管', dept: '昌吉分公司' },
  { id: 'chen_leader', name: '陈组长', dept: '伊犁分公司' },
];

// ========== 主页面组件 ==========

// ========== 运营弹窗内容组件（按运营场景展示指标树分析，无顶部导航） ==========

function OperationScenarioAnalysis({ scenario, indicators, view, onViewChange }: {
  scenario: string;
  indicators: OperationIndicator[];
  view: 'analysis' | 'matching' | 'dispatch';
  onViewChange: (view: 'analysis' | 'matching' | 'dispatch') => void;
}) {
  // 当前选中的指标（默认选中第一个）
  const [activeIndicatorName, setActiveIndicatorName] = useState<string>(indicators[0]?.name || '');
  const activeIndicator = (indicators.find(i => i.name === activeIndicatorName) || indicators[0])!;

  // 指标树与选中节点（切换指标时重置并默认选中根节点）
  const [indicatorTreeData, setIndicatorTreeData] = useState<IndicatorCardData[]>(() => [activeIndicator.tree]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>(() => activeIndicator.tree.id);

  // 时间与区域筛选（同各运营页面右上角）
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [regionValue, setRegionValue] = useState<{ cityCode?: string; districtCode?: string; gridCode?: string; isProvince?: boolean }>({});
  const [regionLabel, setRegionLabel] = useState('全疆');

  // 根据选中的指标生成动态分析数据
  const dynamicAnalysisData = useMemo(
    () => generateAnalysisData(selectedIndicator, indicatorTreeData),
    [selectedIndicator, indicatorTreeData]
  );

  // 切换指标Tab：更新指标树并默认选中根节点
  const handleIndicatorChange = (name: string) => {
    const ind = indicators.find(i => i.name === name);
    if (!ind) return;
    setActiveIndicatorName(name);
    setIndicatorTreeData([ind.tree]);
    setSelectedIndicator(ind.tree.id);
  };

  // 策略匹配视图（弹窗内闭环）
  if (view === 'matching') {
    return (
      <div className="bg-white p-4 min-h-full">
        <StrategyMatchingContent
          indicatorName={activeIndicatorName}
          from="stock-view"
          onReturn={() => onViewChange('analysis')}
          onNext={() => onViewChange('dispatch')}
        />
      </div>
    );
  }

  // 调度派发视图（弹窗内闭环）
  if (view === 'dispatch') {
    return (
      <div className="bg-white p-4 min-h-full">
        <StrategyDispatchContent
          indicatorName={activeIndicatorName}
          from="stock-view"
          embed
          onBack={() => onViewChange('matching')}
          onSubmitSuccess={() => onViewChange('analysis')}
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 flex flex-col gap-4 rounded-lg min-h-full">
      {/* 指标Tab栏 + 右上角筛选/策略调度（同一行） */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* 指标Tab（不含指标概览，默认选中第一个，可切换） */}
        <div className="flex items-center gap-2 flex-wrap">
          {indicators.map(ind => {
            const isActive = ind.name === activeIndicatorName;
            return (
              <button
                key={ind.name}
                onClick={() => handleIndicatorChange(ind.name)}
                className={`h-7 px-3 rounded text-sm font-medium transition-colors ${isActive ? 'bg-[#0085D0] text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              >
                {ind.name}
              </button>
            );
          })}
        </div>

        {/* 右上角：时间 + 区域选择 + 策略调度 */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-[#0085D0] focus:outline-none"
          />
          <XinjiangRegionSelector
            value={regionValue}
            onChange={(cityCode, cityName, districtCode, districtName, gridCode, gridName) => {
              setRegionValue({ cityCode, districtCode, gridCode });
              const label = gridName || districtName || cityName || '全疆';
              setRegionLabel(label);
            }}
          />
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onViewChange('matching')}>
            策略调度
          </Button>
        </div>
      </div>

      {/* 主内容区：左侧指标树 + 右侧分析面板 */}
      <div className="flex gap-4">
        {/* 左侧指标树 - 占55%，固定高度600px */}
        <div className="w-[55%] h-[600px] border border-gray-200 rounded-lg overflow-auto relative bg-white">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
            <h3 className="text-sm font-semibold text-gray-700">指标树 - {activeIndicatorName}</h3>
            <span className="text-sm text-gray-600">{selectedMonth}</span>
          </div>

          {/* 指标树内容 */}
          <div className="px-4 py-3">
            <IndicatorTree
              data={indicatorTreeData}
              onCardClick={setSelectedIndicator}
              selectedId={selectedIndicator}
            />
          </div>
        </div>

        {/* 右侧分析面板 - 占45% */}
        <div className="w-[45%] overflow-hidden">
          {/* 上部分：分析面板 - 固定高度600px */}
          <div className="h-[600px] mb-4 rounded-lg overflow-hidden">
            <AnalysisPanel
              indicatorName={activeIndicatorName}
              selectedIndicator={selectedIndicator}
              indicatorTreeData={indicatorTreeData}
              analysisReasons={dynamicAnalysisData.analysisReasons}
              regionData={dynamicAnalysisData.regionData}
              topRegions={dynamicAnalysisData.topRegions}
              bottomRegions={dynamicAnalysisData.bottomRegions}
              trendData={dynamicAnalysisData.trendData}
              currentTab="growth-tree"
              from="stock-view"
              businessScenario={scenario}
              selectedRegion={{
                cityCode: regionValue.cityCode || '',
                districtCode: regionValue.districtCode || '',
                gridCode: regionValue.gridCode || '',
                isProvince: !regionValue.cityCode,
              }}
              regionDisplay={regionLabel}
              showIndicatorDispatch={false}
              hideHeaderActions
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StockViewPage() {
  // 调度弹窗（创建督办）
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [supervisorDialogOpen, setSupervisorDialogOpen] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [tempSupervisor, setTempSupervisor] = useState('');
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  const [dispatchForm, setDispatchForm] = useState({ name: '', content: '' });

  // 运营弹窗（流量运营分析 - 当月流量增幅）
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);
  // 运营弹窗内视图：analysis=指标分析，matching=策略匹配，dispatch=调度派发
  const [opView, setOpView] = useState<'analysis' | 'matching' | 'dispatch'>('analysis');

  // 顶部运营菜单选中项（进入页面默认选中流量运营）
  const [activeMenu, setActiveMenu] = useState('流量运营');

  // 点击顶部菜单按钮
  const handleMenuClick = (action: 'dispatch' | 'operation') => {
    if (action === 'dispatch') {
      setDispatchForm({ name: '', content: '' });
      setSelectedSupervisors([]);
      setDispatchDialogOpen(true);
    } else {
      setOpView('analysis');
      setOperationDialogOpen(true);
    }
  };

  // 督办人员选择确定
  const handleSupervisorConfirm = () => {
    setSelectedSupervisors(prev =>
      tempSupervisor && !prev.includes(tempSupervisor) ? [...prev, tempSupervisor] : prev
    );
    setSupervisorDialogOpen(false);
    setTempSupervisor('');
    setSupervisorSearch('');
  };

  // 移除督办人员
  const handleRemoveSupervisor = (id: string) => {
    setSelectedSupervisors(prev => prev.filter(s => s !== id));
  };

  // 调度弹窗确认
  const handleDispatchConfirm = () => {
    if (!dispatchForm.name) { toast.error('请输入督办名称'); return; }
    if (selectedSupervisors.length === 0) { toast.error('请添加督办人员'); return; }
    if (!dispatchForm.content) { toast.error('请输入督办内容'); return; }
    toast.success('督办已创建');
    setDispatchDialogOpen(false);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/stock-view/bg.png')" }}
    >
      {/* ====== 顶部栏（参照大屏 product-marketing-content-header 布局） ====== */}
      <header className="relative shrink-0 h-[100px]">
        {/* 顶部提亮底色 + 纵向暗化遮罩（参照大屏框架三段衬底） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(8,32,70,0.75), rgba(21,72,124,0.45), rgba(8,32,70,0.75)), linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.08), rgba(0,0,0,0))',
          }}
        />

        {/* 居中 LOGO（大屏顶部 logo） */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/stock-view/logo.png"
            alt="新疆移动客户运营平台"
            width={1920}
            height={95}
            priority
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* 左侧菜单（参照 header-item 样式，箭头朝右，点击切换选中态） */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-[6px]">
          {leftMenus.map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className="header-item flex items-center justify-center text-[18px] font-bold leading-none whitespace-nowrap cursor-pointer"
                style={{
                  width: 140,
                  height: 33,
                  color: isActive ? '#ff3b30' : '#ffffff',
                  backgroundImage: `url('/stock-view/${isActive ? item.bgActive : item.bg}')`,
                  backgroundSize: '100% 100%',
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* 右侧菜单（运营菜单样式同左侧，箭头朝左，点击切换选中态） */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-[10px]">
          {rightMenus.map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className="header-item flex items-center justify-center text-[18px] font-bold leading-none whitespace-nowrap cursor-pointer"
                style={{
                  width: 140,
                  height: 33,
                  color: isActive ? '#ff3b30' : '#ffffff',
                  backgroundImage: `url('/stock-view/${isActive ? item.bgActive : item.bg}')`,
                  backgroundSize: '100% 100%',
                }}
              >
                {item.name}
              </button>
            );
          })}
          {/* 我的工作台 — 跳转到市场运营平台运营概览 */}
          <Link
            href="/"
            className="operate-icon flex items-center justify-center gap-[7px] text-base font-semibold text-[#e1f2ff] leading-none whitespace-nowrap"
            style={{
              width: 88,
              height: 40,
              backgroundImage: "url('/stock-view/btn-operate-icon.png')",
              backgroundSize: '100% 100%',
            }}
          >
            <Briefcase className="w-4 h-4" />
            我的工作台
          </Link>
          {farRightMenus.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.action)}
                className="operate-icon flex items-center justify-center gap-[7px] text-base font-semibold text-[#e1f2ff] leading-none whitespace-nowrap"
                style={{
                  width: 88,
                  height: 40,
                  backgroundImage: "url('/stock-view/btn-operate-icon.png')",
                  backgroundSize: '100% 100%',
                }}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* ====== 主体内容区域（空白，展示大屏底图） ====== */}
      <main className="flex-1 relative overflow-hidden" />

      {/* ====== 调度弹窗（创建督办） ====== */}
      <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>创建督办</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 基本信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-1 h-4 bg-[#0aa5f0] rounded-full" />
                基本信息
              </div>
              {/* 督办名称 */}
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label className="text-sm justify-end">
                  <span className="text-red-500">*</span> 督办名称
                </Label>
                <div className="relative">
                  <Input
                    placeholder="请输入督办名称"
                    maxLength={30}
                    value={dispatchForm.name}
                    onChange={e => setDispatchForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {dispatchForm.name.length}/30
                  </span>
                </div>
              </div>
            </div>

            {/* 督办信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-1 h-4 bg-[#0aa5f0] rounded-full" />
                督办信息
              </div>
              {/* 督办人员 */}
              <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                <Label className="text-sm justify-end mt-2">
                  <span className="text-red-500">*</span> 督办人员
                </Label>
                <div className="space-y-2">
                  {/* 已选人员标签 */}
                  {selectedSupervisors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedSupervisors.map(id => {
                        const p = supervisorList.find(s => s.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {p?.name || id}
                            <button
                              onClick={() => handleRemoveSupervisor(id)}
                              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                            >
                              <Plus className="w-3 h-3 rotate-45" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  {/* 添加督办人员按钮 */}
                  <button
                    onClick={() => { setTempSupervisor(''); setSupervisorSearch(''); setSupervisorDialogOpen(true); }}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    添加督办人员
                  </button>
                </div>
              </div>
              {/* 督办内容 */}
              <div className="grid grid-cols-[100px_1fr] items-start gap-4">
                <Label className="text-sm justify-end mt-2">
                  <span className="text-red-500">*</span> 督办内容
                </Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="请输入督办内容"
                  value={dispatchForm.content}
                  onChange={e => setDispatchForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchDialogOpen(false)}>取消</Button>
            <Button onClick={handleDispatchConfirm} className="bg-gradient-to-b from-[#67edfd] via-[#0aa5f0] to-[#0163e0] text-white border-t border-white/30">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== 选择督办人员弹窗（参考客户商机选择审批人） ====== */}
      <Dialog open={supervisorDialogOpen} onOpenChange={setSupervisorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>选择督办人员</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 min-h-[280px]">
            {/* 左侧组织架构 */}
            <div className="w-1/3 border-r pr-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <FolderOpen className="h-4 w-4" />组织架构
              </div>
              <div className="space-y-1">
                <div className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 cursor-pointer">
                  中国移动通信集团新疆有限公司
                </div>
              </div>
            </div>
            {/* 右侧人员列表 */}
            <div className="flex-1">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="输入人员名称"
                  value={supervisorSearch}
                  onChange={(e) => setSupervisorSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-1 max-h-[220px] overflow-y-auto">
                {supervisorList
                  .filter(p => !supervisorSearch || p.name.includes(supervisorSearch) || p.dept.includes(supervisorSearch))
                  .map(p => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors ${tempSupervisor === p.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <input
                        type="radio"
                        name="supervisor"
                        checked={tempSupervisor === p.id}
                        onChange={() => setTempSupervisor(p.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.dept}</div>
                      </div>
                    </label>
                  ))}
                {supervisorList.filter(p => !supervisorSearch || p.name.includes(supervisorSearch) || p.dept.includes(supervisorSearch)).length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-8">未找到匹配的人员</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupervisorDialogOpen(false)}>取消</Button>
            <Button onClick={handleSupervisorConfirm} className="bg-gradient-to-b from-[#67edfd] via-[#0aa5f0] to-[#0163e0] text-white border-t border-white/30">确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== 运营弹窗（流量运营分析 + 策略调度闭环） ====== */}
      <Dialog open={operationDialogOpen} onOpenChange={(open) => {
        setOperationDialogOpen(open);
        if (!open) setOpView('analysis');
      }}>
        <DialogContent
          disableMaxWidth
          className="w-[98vw] max-w-[98vw] min-w-[920px] max-h-[95vh] flex flex-col gap-0 overflow-hidden rounded-xl p-0 [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5"
        >
          <DialogHeader className="flex-shrink-0 px-6 py-3 border-b">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-base font-semibold">
                {opView === 'analysis' && `${activeMenu}${activeMenu.includes('运营') ? '' : '运营'}分析`}
                {opView === 'matching' && '策略匹配'}
                {opView === 'dispatch' && '调度派发'}
              </DialogTitle>
              {opView !== 'analysis' && (
                <button
                  onClick={() => setOpView('analysis')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  返回指标分析
                </button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto p-4">
            <OperationScenarioAnalysis
              scenario={activeMenu}
              indicators={getScenarioIndicators(activeMenu)}
              view={opView}
              onViewChange={setOpView}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
