'use client';

import React, { useState } from 'react';
import {
  Phone, ChevronRight, ChevronDown, ChevronUp, User, RefreshCw, X,
  CheckCircle2, Loader2, Edit3, PhoneCall, Copy,
  Home, Bell, UserCircle, ArrowLeft, Shield, Wifi,
  Tv, Cloud, Eye, Tag, Package, BarChart3, Clock,
  MessageSquare, Zap, Activity, Gift, Search, ShoppingBag, UserPlus,
  Building2, Briefcase, TrendingUp, Target, FolderOpen,
  ClipboardList, AlertTriangle
} from 'lucide-react';

/* ─── Design Tokens ─── */
const T = {
  brand: '#0066FF',
  brandLight: 'rgba(0,102,255,0.08)',
  brandMedium: 'rgba(0,102,255,0.15)',
  warmGray: '#F5F6FA',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  green: '#10B981',
  greenLight: 'rgba(16,185,129,0.1)',
  orange: '#F59E0B',
  orangeLight: 'rgba(245,158,11,0.1)',
  red: '#EF4444',
  redLight: 'rgba(239,68,68,0.1)',
  gold: '#D97706',
  goldLight: 'rgba(217,119,6,0.1)',
  border: '#E5E7EB',
  shadow: '0 2px 12px rgba(0,0,0,0.06)',
  radius: '12px',
};

/* ─── Shared Data ─── */
const strategyList = [
  '全球通-流量运营-策略3-129元档', '全球通-流量运营-策略3-59元档',
  '全球通-流量运营-策略2-99元档', '全球通-流量运营-策略1-159元档',
  '全球通-语音运营-策略1-89元档', '全球通-语音运营-策略2-69元档',
  '全球通-宽带运营-策略1-129元档', '全球通-宽带运营-策略2-99元档',
  '全球通-合约运营-策略1-79元档', '全球通-合约运营-策略2-59元档',
  '全球通0合约低消95元档',
];

const pendingCustomers = [
  { phone: '183****6988', name: '苏**林' },
  { phone: '139****1879', name: '德**山' },
  { phone: '156****3456', name: '张**华' },
  { phone: '188****9012', name: '李**明' },
  { phone: '177****5678', name: '王**芳' },
  { phone: '135****2345', name: '刘**强' },
  { phone: '152****7890', name: '陈**娟' },
  { phone: '182****2975', name: '口**萍' },
  { phone: '166****1234', name: '赵**伟' },
  { phone: '199****5678', name: '周**丽' },
];

const processedCustomers = [
  { phone: '183****6988', name: '苏**林', claimTime: '2026-06-06 13:32:56', contactTime: '' },
  { phone: '139****1879', name: '德**山', claimTime: '2026-06-06 13:33:11', contactTime: '' },
];

const scriptParagraphs = [
  { num: '1', text: '如果客户不要宽带可推荐同档位个人套餐；如果客户表示贵，最低可平档推荐但不可低于59元档位推荐；' },
  { num: '2', text: '可根据客户情况次推低消合约、智家产品、省内亲情网（月费2元，编码20260002）等' },
  { num: '3', text: '【5GA全家享（爱家庭）129元】业务编码：20253083 结合您的资源使用情况，您只需给做个微调，包含1500分钟国内共享主叫通话，160GB国内共享通用流量，其中80GB为套餐内流量，80GB为促销流量（仅当月使用，不可结转，套餐内流量使用完后开始使用），享5G极速服务、移动高清1个、WiFi6路由器1台、室内安防摄像头1台（含3天全天AI云存服务）、语音遥控器1个，享5G极速服务、和留言基础功能、视频彩铃钻石会员、权益超市铂金会员、咪咕视频钻石会员、移动云盘白银会员及移动高清爱家畅享包，套餐月费129元/月，我这就给您添加，下个月就能享受到超大流量了。' },
  { num: '4', text: '【5GA畅享（升级版）套餐129元个人版】业务编码：20252068；套餐包含80G通用流量和80G促销流量合计160G国内流量，语音通话1500分钟，及权益超市铂金会员，仅需129元/月，现在为您申请办理，下个月您可以享受优惠了，好吧？' },
];

const scriptFullText = scriptParagraphs.map(s => `${s.num}、${s.text}`).join('\n');

/* ─── 商机运营数据 ─── */
const bizScenes = [
  { key: 'traffic', name: '流量运营', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', tasks: ['流量达量预警', '特定内容高频访问', '地板价套餐查询高流量套餐', '零流量使用预警'] },
  { key: 'mid-high', name: '中高端运营', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', tasks: ['中高端客户降档预警', 'ARPU下滑预警'] },
  { key: 'churn', name: '离网维系', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', tasks: ['离网高风险客户', '携转意向预警'] },
  { key: 'family', name: '家庭运营', color: '#10B981', bg: 'rgba(16,185,129,0.1)', tasks: ['宽带到期续费', '融合升级商机'] },
];

const bizScriptParagraphs = [
  { num: '1', text: '您好，我是中国移动网格服务专员。系统监测到您本月流量使用已达85%，即将触达套餐限量阈值，为避免产生高额费用，为您推荐10元20GB国内通用流量叠加包，当月有效、可随时退订，轻松应对月末流量高峰，您看需要我为您办理吗？' },
  { num: '2', text: '您当前为129元档全家享套餐用户，结合您的资源使用情况，建议升级为5GA全家享（爱家庭）129元档，包含1500分钟国内共享主叫通话与160GB国内共享通用流量，附赠WiFi6路由器1台、室内安防摄像头1台、视频彩铃钻石会员等权益，月费不变、权益升级。' },
  { num: '3', text: '检测到您近3个月ARPU呈下滑趋势，为您推荐低消合约保级方案，承诺月消费即可获得话费返还与流量赠送，稳固当前档位权益，避免因降档影响现有优惠，我这就为您登记。' },
  { num: '4', text: '您的家庭宽带将于本月到期，现为您推荐融合续费方案，宽带与手机套餐融合办理可享月费折扣，同时赠送移动高清电视服务，全家共享更划算。' },
];
const bizScriptFullText = bizScriptParagraphs.map(s => `${s.num}、${s.text}`).join('\n');

interface BizOpportunity {
  bizId: string;
  bizName: string;
  phone: string;
  name: string;
  scene: string;
  sceneColor: string;
  category: string;
  subCategory: string;
  contactTime: string;
  customerStatus: string;
  callStatus: string;
  remark: string;
  claimTime?: string;
}

const bizPendingCustomers: BizOpportunity[] = [
  { bizId: 'BIZ-2026-0001', bizName: '流量达量预警', phone: '183****6988', name: '苏**林', scene: '流量运营', sceneColor: '#3B82F6', category: '风险预警类', subCategory: '流量达量预警', contactTime: '2026-06-06 10:24', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
  { bizId: 'BIZ-2026-0002', bizName: '中高端客户降档预警', phone: '139****1879', name: '德**山', scene: '中高端运营', sceneColor: '#8B5CF6', category: '价值提升类', subCategory: '中高端客户降档预警', contactTime: '2026-06-06 10:31', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
  { bizId: 'BIZ-2026-0003', bizName: '离网高风险客户', phone: '156****3456', name: '张**华', scene: '离网维系', sceneColor: '#EF4444', category: '风险预警类', subCategory: '离网高风险客户', contactTime: '2026-06-06 10:37', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
  { bizId: 'BIZ-2026-0004', bizName: '宽带到期续费', phone: '188****9012', name: '李**明', scene: '家庭运营', sceneColor: '#10B981', category: '价值提升类', subCategory: '宽带到期续费', contactTime: '2026-06-06 10:42', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
  { bizId: 'BIZ-2026-0005', bizName: '特定内容高频访问', phone: '177****5678', name: '王**芳', scene: '流量运营', sceneColor: '#3B82F6', category: '价值提升类', subCategory: '特定内容高频访问', contactTime: '2026-06-06 10:48', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
  { bizId: 'BIZ-2026-0006', bizName: 'ARPU下滑预警', phone: '135****2345', name: '刘**强', scene: '中高端运营', sceneColor: '#8B5CF6', category: '风险预警类', subCategory: 'ARPU下滑预警', contactTime: '2026-06-06 10:55', customerStatus: '待维系', callStatus: '未接触', remark: '—' },
];

const bizProcessedCustomers: BizOpportunity[] = [
  { bizId: 'BIZ-2026-0001', bizName: '流量达量预警', phone: '183****6988', name: '苏**林', scene: '流量运营', sceneColor: '#3B82F6', category: '风险预警类', subCategory: '流量达量预警', contactTime: '—', customerStatus: '已维系', callStatus: '已接触', remark: '客户表示流量够用，暂不办理', claimTime: '2026-06-06 13:32:56' },
  { bizId: 'BIZ-2026-0002', bizName: '中高端客户降档预警', phone: '139****1879', name: '德**山', scene: '中高端运营', sceneColor: '#8B5CF6', category: '价值提升类', subCategory: '中高端客户降档预警', contactTime: '—', customerStatus: '已维系', callStatus: '已接触', remark: '已推荐低消合约保级方案', claimTime: '2026-06-06 13:33:11' },
];

/* ─── Tiny Components ─── */
const TopBar = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center relative px-4 py-3 bg-white border-b" style={{ borderColor: T.border }}>
    <ArrowLeft size={18} className="absolute left-3" style={{ color: T.textPrimary }} />
    <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{title}</span>
    <div className="absolute right-3 flex gap-3">
      <RefreshCw size={15} style={{ color: T.textSecondary }} />
      <X size={15} style={{ color: T.textSecondary }} />
    </div>
  </div>
);

const BottomNav = ({ active = 'task' }: { active?: string }) => (
  <div className="flex justify-around items-center py-2 bg-white border-t" style={{ borderColor: T.border }}>
    {[
      { key: 'task', icon: Home, label: '我的任务' },
      { key: 'alert', icon: Bell, label: '我的预警' },
      { key: 'me', icon: UserCircle, label: '我的' },
    ].map(item => (
      <div key={item.key} className="flex flex-col items-center gap-0.5">
        <item.icon size={18} style={{ color: active === item.key ? T.brand : T.textMuted }} />
        <span className="text-[10px]" style={{ color: active === item.key ? T.brand : T.textMuted }}>{item.label}</span>
        {active === item.key && <div className="w-1 h-1 rounded-full" style={{ background: T.brand }} />}
      </div>
    ))}
  </div>
);

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col rounded-[28px] overflow-hidden border-2 shrink-0" style={{ width: 375, height: 812, borderColor: '#D1D5DB', background: T.warmGray }}>
    {children}
  </div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center flex-1 py-3">
    <span className="text-2xl font-bold" style={{ color: T.brand }}>{value}</span>
    <span className="text-xs mt-1" style={{ color: T.textSecondary }}>{label}</span>
  </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-4 py-2.5">
    {icon}
    <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{title}</span>
  </div>
);

const TagBadge = ({ text, color, bg }: { text: string; color: string; bg: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ color, background: bg }}>{text}</span>
);

/* ─── 话术组件（2种模式：折叠2行 / 完整展开）─── */
const ScriptBlock = ({ mode, activityName, paragraphs }: { mode: 'collapsed' | 'expanded'; activityName?: string; paragraphs?: { num: string; text: string }[] }) => {
  const [open, setOpen] = useState(false);
  const list = paragraphs ?? scriptParagraphs;
  if (mode === 'collapsed') {
    return (
      <div className="px-4 py-3" style={{ background: T.brandLight }}>
        {activityName && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1 h-4 rounded-full" style={{ background: T.brand }} />
            <span className="text-xs font-medium" style={{ color: T.textPrimary }}>{activityName}</span>
          </div>
        )}
        {open ? (
          <div className="space-y-2">
            {list.map(p => (
              <div key={p.num} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.8)' }}>
                <p className="text-xs leading-relaxed" style={{ color: T.textPrimary }}>
                  <span className="font-medium" style={{ color: T.brand }}>{p.num}、</span>{p.text}
                </p>
              </div>
            ))}
            <button onClick={() => setOpen(false)} className="text-xs font-medium" style={{ color: T.brand }}>收起 &lt;</button>
          </div>
        ) : (
          <>
            <p className="text-xs leading-relaxed" style={{ color: T.textSecondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {list.map(p => `${p.num}、${p.text}`).join('')}
            </p>
            <button onClick={() => setOpen(true)} className="text-xs mt-1 font-medium" style={{ color: T.brand }}>展开全文 &gt;</button>
          </>
        )}
      </div>
    );
  }
  // expanded: 完整展示4段+状态
  return (
    <div className="px-4 py-3 space-y-2" style={{ background: T.brandLight }}>
      {activityName && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1 h-4 rounded-full" style={{ background: T.brand }} />
          <span className="text-xs font-medium" style={{ color: T.textPrimary }}>{activityName}</span>
        </div>
      )}
      {list.map(p => (
        <div key={p.num} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.8)' }}>
          <p className="text-xs leading-relaxed" style={{ color: T.textPrimary }}>
            <span className="font-medium" style={{ color: T.brand }}>{p.num}、</span>{p.text}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ─── 活动名行（可展开话术+状态） ─── */
const ActivityRow = ({ canCall = false, activityName, paragraphs, sceneColor = '#2E7CF6' }: { canCall?: boolean; activityName?: string; paragraphs?: { num: string; text: string }[]; sceneColor?: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-4 mt-3 rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-2 h-2 rounded-full" style={{ background: open ? sceneColor : T.textMuted }} />
        <span className="text-xs font-medium flex-1" style={{ color: T.textPrimary }}>{activityName ?? '全球通-流量运营-策略3-129元档'}</span>
        <TagBadge text="省级活动" color={sceneColor} bg={`${sceneColor}1A`} />
        <TagBadge text="未接触" color={T.orange} bg={T.orangeLight} />
        {open ? <ChevronUp size={14} style={{ color: T.textMuted }} /> : <ChevronDown size={14} style={{ color: T.textMuted }} />}
      </div>
      {open && (
        <div>
          <ScriptBlock mode="expanded" paragraphs={paragraphs} />
          <div className="px-4 py-2.5 space-y-1.5 border-t" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: T.textSecondary }}>办理状态:</span>
              <TagBadge text="未办理" color={T.orange} bg={T.orangeLight} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: T.textSecondary }}>拨打电话:</span>
              <TagBadge text="未拨打" color={T.textSecondary} bg="rgba(107,114,128,0.1)" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: T.textSecondary }}>用户意向:</span>
              <span className="text-xs" style={{ color: T.textMuted }}>(空)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── 客户画像完整页 ─── */
const PortraitPage = ({ variant, customerName: _cn, customerPhone: _cp, brandName: _bn, brandColor: _bc, brandBg: _bb, extraTop, activityName, paragraphs, sceneColor, hideExtra, claimButtonText }: { variant: 'pending' | 'processed'; customerName?: string; customerPhone?: string; brandName?: string; brandColor?: string; brandBg?: string; extraTop?: React.ReactNode; activityName?: string; paragraphs?: { num: string; text: string }[]; sceneColor?: string; hideExtra?: boolean; claimButtonText?: string }) => {
  const isPending = variant === 'pending';
  const customerName = _cn ?? (isPending ? '张*' : '苏*林');
  const customerPhone = _cp ?? (isPending ? '150****0296' : '183****6988');
  const brandName = _bn ?? (isPending ? '全球通' : '全球通金卡');
  const brandColor = _bc ?? (isPending ? T.brand : T.gold);
  const brandBg = _bb ?? (isPending ? T.brandLight : T.goldLight);
  const isBroadband = isPending ? false : true;
  const broadbandSpeed = isPending ? '无' : '1000Mbps';
  const flowSat = isPending ? '15.38%' : '58.49%';
  const voiceSat = isPending ? '2.36%' : '18.18%';
  const summaryText = isPending
    ? `流量饱和度${flowSat}，语音饱和度${voiceSat}；属于重合结合、合约融合、移动单卡客户；该客户为出账、22年以前套餐客户。`
    : `流量饱和度${flowSat}，语音饱和度${voiceSat}；属于轻合融合、固移融合、合约融合、我网主卡电信副卡客户；该客户为出账客户。`;
  const productTier = isPending ? '50-59元' : '50-59元';
  const arpu = isPending ? '188.56' : '79.93';

  const baseInfo = isPending ? [
    ['用户类型', '个人'], ['账号状态', '开通'],
    ['客户品牌', '全球通'], ['归属地区', '乌鲁木齐'],
    ['账户类型', '现金'], ['付费类型', '预付费'],
    ['是否宽带', '否'], ['是否集团', '否'],
  ] : [
    ['用户类型', '个人'], ['账号状态', '开通'],
    ['客户品牌', '全球通金卡'], ['归属地区', '乌鲁木齐'],
    ['账户类型', '现金'], ['付费类型', '预付费'],
    ['是否宽带', '是'], ['是否集团', '否'],
  ];

  const fusionTags = isPending ? [
    { label: '是否5G终端', value: '是' }, { label: '是否使用5G', value: '已使用网络' },
    { label: '是否宽带用户', value: '否' }, { label: '宽带带宽', value: '非千兆用户' },
    { label: '是否观看移动高清', value: '是' }, { label: '是否已订购', value: '未订购智能组网' },
    { label: '是否已订购安防产品', value: '未订购' }, { label: '集团成员类型', value: '非集团成员' },
    { label: '是否已订购权益资费', value: '已订购' }, { label: '是否使用云盘', value: '否' },
  ] : [
    { label: '是否5G终端', value: '是' }, { label: '是否使用5G', value: '已使用网络' },
    { label: '是否宽带用户', value: '是' }, { label: '宽带带宽', value: '千兆用户' },
    { label: '是否观看移动高清', value: '是' }, { label: '是否已订购', value: '未订购智能组网' },
    { label: '是否已订购安防产品', value: '未订购' }, { label: '集团成员类型', value: '非集团成员' },
    { label: '是否已订购权益资费', value: '未订购' }, { label: '是否使用云盘', value: '否' },
    { label: '是否已订购移动云盘', value: '未订购' },
  ];

  const consumption = isPending ? [
    ['当前月使用', '170-259元', '2GB-5GB', '50分钟'],
    ['近3月均', '170-259元', '20GB-30GB', '50分钟以上'],
    ['近6个月均', '130-169元', '40GB以上', '50分钟以下'],
  ] : [
    ['当前月使用', '60-69元', '1GB-2GB', '50分钟以下'],
    ['近3月均', '70-79元', '5GB-10GB', '201-500分钟'],
    ['近6个月均', '170-259元', '30GB-40GB', '201-500分钟'],
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: T.warmGray }}>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* 客户头部 */}
        <div className="px-4 py-4" style={{ background: T.brandLight }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: T.brandMedium }}>
            <User size={20} style={{ color: T.brand }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium" style={{ color: T.textPrimary }}>{customerName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: brandColor, background: brandBg }}>{brandName}</span>
            </div>
            <span className="text-xs mt-0.5" style={{ color: T.textSecondary }}>{customerPhone}</span>
          </div>
          {!isPending && (
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.brand }}>
                <Phone size={16} style={{ color: '#fff' }} />
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.brandLight }}>
                <Edit3 size={16} style={{ color: T.brand }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 商机信息卡插槽 */}
      {extraTop}

      {/* 活动名行（可展开话术+状态） */}
      <ActivityRow canCall={!isPending} activityName={activityName} paragraphs={paragraphs} sceneColor={sceneColor ?? T.brand} />

      {/* AI营销助手 */}
      {!hideExtra && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: T.brandLight }}>
          <MessageSquare size={16} style={{ color: T.brand }} />
          <span className="text-xs font-medium" style={{ color: T.brand }}>AI营销助手</span>
          <ChevronRight size={14} style={{ color: T.brand }} />
        </div>
      )}

      {/* 画像摘要 */}
      {!hideExtra && (
        <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <SectionHeader title="客户画像摘要" icon={<Eye size={14} style={{ color: T.brand }} />} />
          <div className="px-1 py-1 rounded-lg" style={{ borderLeft: `3px solid ${T.brand}`, background: T.brandLight, paddingLeft: 10 }}>
            <p className="text-xs leading-relaxed" style={{ color: T.textSecondary }}>{summaryText}</p>
          </div>
        </div>
      )}

      {/* 基本信息 */}
      <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: T.cardBg, boxShadow: T.shadow }}>
        <SectionHeader title="基本信息" icon={<User size={14} style={{ color: T.brand }} />} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-1">
          {baseInfo.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: T.textSecondary }}>{label}</span>
              <span className="text-xs font-medium" style={{ color: T.textPrimary }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 融合标签 */}
      <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: T.cardBg, boxShadow: T.shadow }}>
        <SectionHeader title="融合标签" icon={<Tag size={14} style={{ color: T.brand }} />} />
        <div className="flex flex-wrap gap-2 px-1">
          {fusionTags.map(tag => {
            const isPositive = ['是', '已', '千兆'].some(k => tag.value.startsWith(k));
            const color = isPositive ? T.green : T.textSecondary;
            const bg = isPositive ? T.greenLight : 'rgba(107,114,128,0.08)';
            return (
              <span key={tag.label} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px]" style={{ color, background: bg }}>
                {tag.label}: {tag.value}
              </span>
            );
          })}
        </div>
      </div>

      {/* 消费使用情况 */}
      <div className="mx-4 mt-3 mb-4 p-3 rounded-xl" style={{ background: T.cardBg, boxShadow: T.shadow }}>
        <SectionHeader title="消费使用情况" icon={<BarChart3 size={14} style={{ color: T.brand }} />} />
        <div className="px-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: T.textSecondary }}>产品档位</span>
            <span className="text-xs font-medium" style={{ color: T.textPrimary }}>{productTier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: T.textSecondary }}>宽带速率</span>
            <span className="text-xs font-medium" style={{ color: T.textPrimary }}>{broadbandSpeed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: T.textSecondary }}>近三个月折后ARPU</span>
            <span className="text-base font-bold" style={{ color: T.brand }}>{arpu}</span>
          </div>
          {/* 消费对比表格 */}
          <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: T.border }}>
            <table className="w-full text-[10px]">
              <thead>
                <tr style={{ background: T.warmGray }}>
                  <th className="text-left px-2 py-1.5 font-medium" style={{ color: T.textSecondary }}>档位名称</th>
                  <th className="text-center px-1 py-1.5 font-medium" style={{ color: T.textSecondary }}>月消费</th>
                  <th className="text-center px-1 py-1.5 font-medium" style={{ color: T.textSecondary }}>流量</th>
                  <th className="text-center px-1 py-1.5 font-medium" style={{ color: T.textSecondary }}>语音</th>
                </tr>
              </thead>
              <tbody>
                {consumption.map((row, i) => (
                  <tr key={i} className={i < consumption.length - 1 ? 'border-b' : ''} style={{ borderColor: T.border }}>
                    <td className="px-2 py-1.5" style={{ color: T.textPrimary }}>{row[0]}</td>
                    <td className="text-center px-1 py-1.5" style={{ color: T.textPrimary }}>{row[1]}</td>
                    <td className="text-center px-1 py-1.5" style={{ color: T.textPrimary }}>{row[2]}</td>
                    <td className="text-center px-1 py-1.5" style={{ color: T.textPrimary }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>

      {/* 底部操作栏 - 在滚动区域外面，固定底部 */}
      {isPending ? (
        <div className="px-4 py-3 bg-white border-t shrink-0" style={{ borderColor: T.border }}>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: T.brand }}>
            <UserPlus size={16} /> {claimButtonText ?? '认领该客户'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3 px-4 py-3 bg-white border-t shrink-0" style={{ borderColor: T.border }}>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: T.brand }}>
            <Phone size={16} /> 拨打
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: T.green }}>
            <ShoppingBag size={16} /> 办理
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   商机运营（新增：省级活动·商机运营分类，对齐网格通精益营销操作流程）
   流程：查看待处理商机 → 点击处理 → 查看商机详情 → 去处理（认领/外呼/办理/回访登记）
   ═══════════════════════════════════════════ */

/* 商机信息卡（对齐网格通「预警信息」表单：商机名称/商机描述/推荐产品/联系时间/用户状态/外呼状态/备注/商机大类/商机分类） */
const BizInfoCard = ({ opp }: { opp: BizOpportunity }) => {
  const productNames: Record<string, string> = {
    '流量达量预警': '10元20GB国内通用流量叠加包',
    '中高端客户降档预警': '低消合约保级方案（129元档）',
    '离网高风险客户': '全球通尊享礼包+话费返还合约',
    '宽带到期续费': '5GA全家享（爱家庭）129元档融合续费',
    '特定内容高频访问': '定向流量包+视频彩铃钻石会员',
    'ARPU下滑预警': '低消合约保级方案（99元档）',
  };
  const productRecommend = productNames[opp.subCategory] || '—';
  const bizDescMap: Record<string, string> = {
    '流量达量预警': '客户本月流量使用已达套餐限量阈值85%，预计3日内触达封顶值',
    '中高端客户降档预警': '客户近3个月ARPU持续下滑，存在主动降档或携转风险',
    '离网高风险客户': '客户近30天通话骤降、余额持续走低，离网风险评分高于阈值',
    '宽带到期续费': '客户家庭宽带合约将于本月到期，存在转网或断网风险',
    '特定内容高频访问': '客户近期特定内容访问频次异常增高，流量消耗超出预期',
    'ARPU下滑预警': '客户近3个月ARPU由159元降至112元，降幅达29.6%',
  };
  const bizDesc = bizDescMap[opp.subCategory] || '—';
  return (
    <div className="mx-4 mt-3 rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: T.border, background: `${opp.sceneColor}0F` }}>
        <AlertTriangle size={13} style={{ color: opp.sceneColor }} />
        <span className="text-[11px] font-medium" style={{ color: T.textPrimary }}>商机信息</span>
        <TagBadge text={opp.scene} color={opp.sceneColor} bg={`${opp.sceneColor}1A`} />
        <TagBadge text={opp.category} color={T.textSecondary} bg="rgba(107,114,128,0.1)" />
      </div>
      <div className="px-3 py-2 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>商机名称</span>
          <span className="text-[10px] font-medium leading-relaxed" style={{ color: T.textPrimary }}>{opp.bizName}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>商机描述</span>
          <span className="text-[9px] leading-relaxed" style={{ color: T.textSecondary }}>{bizDesc}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>商机分类</span>
          <span className="text-[10px] font-medium leading-relaxed" style={{ color: T.textPrimary }}>{opp.subCategory}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>推荐产品</span>
          <span className="text-[10px] font-medium leading-relaxed" style={{ color: T.textPrimary }}>{productRecommend}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>联系时间</span>
          <span className="text-[10px]" style={{ color: T.textPrimary }}>{opp.contactTime}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>客户状态</span>
          <TagBadge text={opp.customerStatus} color={opp.customerStatus === '待维系' ? T.orange : T.green} bg={opp.customerStatus === '待维系' ? T.orangeLight : 'rgba(16,185,129,0.1)'} />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>外呼状态</span>
          <TagBadge text={opp.callStatus} color={opp.callStatus === '未接触' ? T.textSecondary : T.green} bg={opp.callStatus === '未接触' ? 'rgba(107,114,128,0.1)' : 'rgba(16,185,129,0.1)'} />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] w-[52px] shrink-0 mt-0.5" style={{ color: T.textMuted }}>备注</span>
          <span className="text-[9px] leading-relaxed" style={{ color: T.textMuted }}>{opp.remark}</span>
        </div>
      </div>
    </div>
  );
};

/* 商机画像详情页（客户画像 + 商机信息卡；复用 PortraitPage 参数化能力） */
const BizPortraitPage = ({ variant, opp }: { variant: 'pending' | 'processed'; opp: BizOpportunity }) => (
  <PortraitPage
    variant={variant}
    customerName={opp.name}
    customerPhone={opp.phone}
    brandName="全球通"
    brandColor={opp.sceneColor}
    brandBg={`${opp.sceneColor}1A`}
    extraTop={<BizInfoCard opp={opp} />}
    activityName={`${opp.scene}-${opp.subCategory}`}
    paragraphs={bizScriptParagraphs}
    sceneColor={opp.sceneColor}
    hideExtra
    claimButtonText="认领该升级"
  />
);

/* B-P0: 任务分类首页（手风琴三层嵌套 - 与任务版一致） */
const BizPendingPage0 = () => {
  const [openSub, setOpenSub] = useState<string | null>(null);

  const categories = [
    {
      key: 'province',
      name: '省级活动',
      total: 6,
      icon: Briefcase,
      iconBg: '#E8F0FE',
      iconColor: '#3B82F6',
      subs: [
        { key: 'stock', name: '存量运营', count: 11, color: '#3B82F6', strategies: strategyList },
        { key: 'increment', name: '增量运营', count: 3, color: '#10B981', strategies: ['全球通-增量运营-策略1-89元档', '全球通-增量运营-策略2-69元档', '全球通-增量运营-策略3-49元档'] },
        { key: 'segment', name: '细分市场运营', count: 2, color: '#F59E0B', strategies: ['全球通-细分市场-策略1-129元档', '全球通-细分市场-策略2-99元档'] },
        {
          key: 'biz-opp',
          name: '商机运营',
          count: 4,
          color: '#8B5CF6',
          groups: [
            { name: '流量运营', color: '#3B82F6', strategies: ['流量达量预警', '特定内容高频访问', '地板价套餐查询高流量套餐', '零流量使用预警'] },
            { name: '中高端运营', color: '#8B5CF6', strategies: ['中高端客户降档预警', 'ARPU下滑预警'] },
            { name: '离网维系', color: '#EF4444', strategies: ['离网高风险客户', '携转意向预警'] },
            { name: '家庭运营', color: '#10B981', strategies: ['宽带到期续费', '融合升级商机'] },
          ],
        },
      ],
    },
    {
      key: 'city',
      name: '市级活动',
      total: 2,
      icon: Building2,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      subs: [
        { key: 'city-stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['乌鲁木齐-存量运营-策略1-99元档'] },
        { key: 'city-increment', name: '增量运营', count: 1, color: '#10B981', strategies: ['乌鲁木齐-增量运营-策略1-79元档'] },
      ],
    },
  ];

  return (
    <PhoneFrame>
      <TopBar title="市场运营" />
      <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
        {/* 统计区 */}
        <div className="mx-4 mt-3 rounded-xl flex" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <StatCard value="24734" label="待认领数" />
          <div className="w-px my-3" style={{ background: T.border }} />
          <StatCard value="1" label="已认领数" />
        </div>
        {/* Tab */}
        <div className="mx-4 mt-3 flex rounded-lg overflow-hidden" style={{ background: 'rgba(0,102,255,0.06)' }}>
          <button className="flex-1 py-2 text-xs font-medium rounded-lg" style={{ background: T.brand, color: '#fff' }}>待处理</button>
          <button className="flex-1 py-2 text-xs font-medium" style={{ color: T.textSecondary }}>处理中</button>
        </div>
        {/* 大类卡片（默认展开，不折叠） */}
        <div className="mx-4 mt-3 space-y-3 pb-2">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
                {/* 大类头（不可折叠，始终展示） */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cat.iconBg }}>
                    <CatIcon size={16} style={{ color: cat.iconColor }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{cat.name}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: cat.iconBg, color: cat.iconColor }}>{cat.total}</span>
                </div>
                {/* 小类列表（手风琴折叠） */}
                <div className="px-2 pb-2 space-y-1">
                  {cat.subs.map(sub => {
                    const isSubOpen = openSub === `${cat.key}-${sub.key}`;
                    return (
                      <div key={sub.key} className="rounded-lg overflow-hidden" style={{ background: isSubOpen ? '#fff' : T.warmGray }}>
                        {/* 小类行 */}
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2.5"
                          onClick={() => setOpenSub(isSubOpen ? null : `${cat.key}-${sub.key}`)}
                        >
                          <div className="w-1 h-4 rounded-full" style={{ background: sub.color }} />
                          <span className={`text-xs flex-1 text-left ${isSubOpen ? 'font-medium' : ''}`} style={{ color: T.textPrimary }}>{sub.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${sub.color}12`, color: sub.color }}>{sub.count}</span>
                          <div style={{ transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                            <ChevronRight size={12} style={{ color: T.textMuted }} />
                          </div>
                        </button>
                        {/* 策略列表（展开时显示；商机运营按运营场景分组） */}
                        {isSubOpen && (
                          <div className="px-2 pb-2 space-y-1" style={{ animation: 'fadeIn 0.2s ease' }}>
                            {sub.groups ? (
                              sub.groups.map(g => (
                                <div key={g.name} className="space-y-1">
                                  <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0.5">
                                    <span className="w-1 h-3 rounded-full" style={{ background: g.color }} />
                                    <span className="text-[10px] font-medium" style={{ color: g.color }}>{g.name}</span>
                                  </div>
                                  {g.strategies.map(s => (
                                    <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                      <Target size={10} style={{ color: g.color }} />
                                      <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                      <ChevronRight size={12} style={{ color: T.textMuted }} />
                                    </div>
                                  ))}
                                </div>
                              ))
                            ) : (
                              sub.strategies.map(s => (
                                <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                  <Target size={10} style={{ color: sub.color }} />
                                  <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                  <ChevronRight size={12} style={{ color: T.textMuted }} />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* B-P1: 待处理商机客户列表（商机任务名 + 话术默认2行 + 客户列表「处理」） */
const BizPendingPage1 = () => {
  const opp = bizPendingCustomers[0];
  return (
    <PhoneFrame>
      <div className="h-9 flex items-center justify-center relative shrink-0 border-b" style={{ borderColor: T.border, background: T.cardBg }}>
        <ArrowLeft size={15} style={{ color: T.textPrimary, position: 'absolute', left: 12 }} />
        <span className="text-[12px] font-medium" style={{ color: T.textPrimary }}>商机运营</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
        {/* 商机任务名行 */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${opp.sceneColor}1A` }}>
            <Briefcase size={13} style={{ color: opp.sceneColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium leading-tight truncate" style={{ color: T.textPrimary }}>{opp.scene}-{opp.subCategory}</div>
            <div className="text-[9px] mt-0.5" style={{ color: T.textMuted }}>省级活动 · 商机运营</div>
          </div>
          <TagBadge text="待处理" color={T.orange} bg={T.orangeLight} />
        </div>
        {/* 话术（默认2行展开） */}
        <div className="mx-4 mt-2.5 rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <ScriptBlock mode="collapsed" paragraphs={bizScriptParagraphs} activityName={`${opp.scene}-${opp.subCategory}`} />
        </div>
        {/* 商机列表 */}
        <div className="px-4 mt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium" style={{ color: T.textPrimary }}>待处理商机</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${opp.sceneColor}1A`, color: opp.sceneColor }}>{bizPendingCustomers.length}</span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: T.border }}>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>商机编号</th>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>商机分类</th>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>商机名称</th>
                  <th className="px-3 py-2 text-[9px] font-medium text-right" style={{ color: T.textMuted }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {bizPendingCustomers.map(c => (
                  <tr key={c.bizId} className="border-b last:border-b-0" style={{ borderColor: T.border }}>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: T.textSecondary }}>{c.bizId}</td>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: T.textPrimary }}>{c.scene}</td>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: T.textPrimary }}>{c.bizName}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md font-medium" style={{ background: `${c.sceneColor}1A`, color: c.sceneColor }}>
                        <ChevronRight size={9} /> 处理
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* B-P2: 待处理商机详情（商机信息卡 + 客户画像 + 底部「认领该客户」） */
const BizPendingPage2 = () => (
  <PhoneFrame>
    <BizPortraitPage variant="pending" opp={bizPendingCustomers[0]} />
  </PhoneFrame>
);

/* B-P3: 认领流程（独立页：列表 + 3态切换） */
const BizPendingPage3 = () => {
  const [stage, setStage] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const opp = bizPendingCustomers[0];
  return (
    <PhoneFrame>
      <div className="h-9 flex items-center justify-center relative shrink-0 border-b" style={{ borderColor: T.border, background: T.cardBg }}>
        <ArrowLeft size={15} style={{ color: T.textPrimary, position: 'absolute', left: 12 }} />
        <span className="text-[12px] font-medium" style={{ color: T.textPrimary }}>商机运营</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
        {/* 话术 */}
        <ScriptBlock mode="collapsed" paragraphs={bizScriptParagraphs} activityName={`${opp.scene}-${opp.subCategory}`} />
        {/* 商机列表 */}
        <div className="px-4 py-2">
          <div className="flex items-center px-2 py-2 rounded-t-lg" style={{ background: T.warmGray }}>
            <span className="text-[10px] font-medium flex-1" style={{ color: T.textSecondary }}>商机编号</span>
            <span className="text-[10px] font-medium w-16 text-center" style={{ color: T.textSecondary }}>商机分类</span>
            <span className="text-[10px] font-medium w-20 text-center" style={{ color: T.textSecondary }}>商机名称</span>
            <span className="text-[10px] font-medium w-12 text-center" style={{ color: T.textSecondary }}>操作</span>
          </div>
          <div className="rounded-b-lg overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            {bizPendingCustomers.map(c => (
              <div key={c.bizId} className="flex items-center px-2 py-2.5 border-t" style={{ borderColor: T.border }}>
                <span className="text-[10px] flex-1" style={{ color: T.textSecondary }}>{c.bizId}</span>
                <span className="text-[10px] w-16 text-center" style={{ color: T.textPrimary }}>{c.scene}</span>
                <span className="text-[10px] w-20 text-center" style={{ color: T.textPrimary }}>{c.bizName}</span>
                <div className="w-12 flex justify-center">
                  <button className="px-2 py-1 rounded-full text-[9px] font-medium text-white" style={{ background: '#8B5CF6' }}>认领</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 认领流程（独立页展示） */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-5" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            {/* 3态Tab切换 */}
            <div className="flex gap-2 mb-4">
              {(['confirm', 'loading', 'success'] as const).map(s => (
                <button key={s} onClick={() => setStage(s)} className="px-3 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: stage === s ? '#8B5CF6' : T.warmGray, color: stage === s ? '#fff' : T.textSecondary }}>
                  {s === 'confirm' ? '确认态' : s === 'loading' ? '加载态' : '成功态'}
                </button>
              ))}
            </div>
            {stage === 'confirm' && (
              <>
                <h3 className="text-sm font-medium text-center" style={{ color: T.textPrimary }}>认领确认</h3>
                <p className="text-xs text-center mt-2" style={{ color: T.textSecondary }}>确定认领商机「{opp.bizName}」吗？</p>
                <div className="flex gap-3 mt-5">
                  <button className="flex-1 py-2.5 rounded-xl text-xs font-medium border" style={{ borderColor: T.border, color: T.textSecondary }} onClick={() => setStage('success')}>取消</button>
                  <button className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white" style={{ background: '#8B5CF6' }} onClick={() => setStage('loading')}>确定认领</button>
                </div>
              </>
            )}
            {stage === 'loading' && (
              <div className="flex flex-col items-center py-4">
                <Loader2 size={32} className="animate-spin" style={{ color: '#8B5CF6' }} />
                <h3 className="text-sm font-medium mt-3" style={{ color: T.textPrimary }}>认领中，请稍等！</h3>
                <p className="text-xs mt-2 text-center" style={{ color: T.textSecondary }}>正在为您认领商机客户，请不要关闭窗口</p>
              </div>
            )}
            {stage === 'success' && (
              <div className="flex flex-col items-center py-4">
                <CheckCircle2 size={40} style={{ color: T.green }} />
                <h3 className="text-sm font-medium mt-3" style={{ color: T.textPrimary }}>认领成功！</h3>
                <p className="text-xs mt-2" style={{ color: T.textSecondary }}>商机客户已转入「处理中」列表</p>
                <button className="mt-4 px-5 py-2 rounded-xl text-xs font-medium text-white" style={{ background: '#8B5CF6' }}>前往处理中查看</button>
                <button className="mt-2 px-5 py-2 rounded-xl text-xs font-medium" style={{ color: T.textSecondary }}>我知道了</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

/* ═══════════════════════════════════════════
   待处理 4页
   ═══════════════════════════════════════════ */

/* P1: 任务分类首页（大类默认展开+图标，小类手风琴折叠） */
const PendingPage1 = () => {
  const [openSub, setOpenSub] = useState<string | null>(null);

  const categories = [
    {
      key: 'province',
      name: '省级活动',
      total: 6,
      icon: Briefcase,
      iconBg: '#E8F0FE',
      iconColor: '#3B82F6',
      subs: [
        { key: 'stock', name: '存量运营', count: 11, color: '#3B82F6', strategies: strategyList },
        { key: 'increment', name: '增量运营', count: 3, color: '#10B981', strategies: ['全球通-增量运营-策略1-89元档', '全球通-增量运营-策略2-69元档', '全球通-增量运营-策略3-49元档'] },
        { key: 'segment', name: '细分市场运营', count: 2, color: '#F59E0B', strategies: ['全球通-细分市场-策略1-129元档', '全球通-细分市场-策略2-99元档'] },
        {
          key: 'biz-opp',
          name: '商机运营',
          count: 4,
          color: '#8B5CF6',
          groups: [
            { name: '流量运营', color: '#3B82F6', strategies: ['流量达量预警', '特定内容高频访问', '地板价套餐查询高流量套餐', '零流量使用预警'] },
            { name: '中高端运营', color: '#8B5CF6', strategies: ['中高端客户降档预警', 'ARPU下滑预警'] },
            { name: '离网维系', color: '#EF4444', strategies: ['离网高风险客户', '携转意向预警'] },
            { name: '家庭运营', color: '#10B981', strategies: ['宽带到期续费', '融合升级商机'] },
          ],
        },
      ],
    },
    {
      key: 'city',
      name: '市级活动',
      total: 2,
      icon: Building2,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      subs: [
        { key: 'city-stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['乌鲁木齐-存量运营-策略1-99元档'] },
        { key: 'city-increment', name: '增量运营', count: 1, color: '#10B981', strategies: ['乌鲁木齐-增量运营-策略1-79元档'] },
      ],
    },
  ];

  return (
    <PhoneFrame>
      <TopBar title="市场运营" />
      <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
        {/* 统计区 */}
        <div className="mx-4 mt-3 rounded-xl flex" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <StatCard value="24734" label="待认领数" />
          <div className="w-px my-3" style={{ background: T.border }} />
          <StatCard value="1" label="已认领数" />
        </div>
        {/* Tab */}
        <div className="mx-4 mt-3 flex rounded-lg overflow-hidden" style={{ background: 'rgba(0,102,255,0.06)' }}>
          <button className="flex-1 py-2 text-xs font-medium rounded-lg" style={{ background: T.brand, color: '#fff' }}>待处理</button>
          <button className="flex-1 py-2 text-xs font-medium" style={{ color: T.textSecondary }}>处理中</button>
        </div>
        {/* 大类卡片（默认展开，不折叠） */}
        <div className="mx-4 mt-3 space-y-3 pb-2">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
                {/* 大类头（不可折叠，始终展示） */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cat.iconBg }}>
                    <CatIcon size={16} style={{ color: cat.iconColor }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{cat.name}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: cat.iconBg, color: cat.iconColor }}>{cat.total}</span>
                </div>
                {/* 小类列表（手风琴折叠） */}
                <div className="px-2 pb-2 space-y-1">
                  {cat.subs.map(sub => {
                    const isSubOpen = openSub === `${cat.key}-${sub.key}`;
                    return (
                      <div key={sub.key} className="rounded-lg overflow-hidden" style={{ background: isSubOpen ? '#fff' : T.warmGray }}>
                        {/* 小类行 */}
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2.5"
                          onClick={() => setOpenSub(isSubOpen ? null : `${cat.key}-${sub.key}`)}
                        >
                          <div className="w-1 h-4 rounded-full" style={{ background: sub.color }} />
                          <span className={`text-xs flex-1 text-left ${isSubOpen ? 'font-medium' : ''}`} style={{ color: T.textPrimary }}>{sub.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${sub.color}12`, color: sub.color }}>{sub.count}</span>
                          <div style={{ transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                            <ChevronRight size={12} style={{ color: T.textMuted }} />
                          </div>
                        </button>
                        {/* 策略列表（展开时显示；商机运营按运营场景分组） */}
                        {isSubOpen && (
                          <div className="px-2 pb-2 space-y-1" style={{ animation: 'fadeIn 0.2s ease' }}>
                            {sub.groups ? (
                              sub.groups.map(g => (
                                <div key={g.name} className="space-y-1">
                                  <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0.5">
                                    <span className="w-1 h-3 rounded-full" style={{ background: g.color }} />
                                    <span className="text-[10px] font-medium" style={{ color: g.color }}>{g.name}</span>
                                  </div>
                                  {g.strategies.map(s => (
                                    <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                      <Target size={10} style={{ color: g.color }} />
                                      <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                      <ChevronRight size={12} style={{ color: T.textMuted }} />
                                    </div>
                                  ))}
                                </div>
                              ))
                            ) : (
                              sub.strategies.map(s => (
                                <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                  <Target size={10} style={{ color: sub.color }} />
                                  <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                  <ChevronRight size={12} style={{ color: T.textMuted }} />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* P2: 活动客户列表 */
const PendingPage2 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
      {/* 可折叠话术（默认2行，含活动名称） */}
      <ScriptBlock mode="collapsed" activityName="全球通-流量运营-策略3-129元档" />
      {/* 客户列表 */}
      <div className="px-4 py-2">
        <div className="flex items-center px-2 py-2 rounded-t-lg" style={{ background: T.warmGray }}>
          <span className="text-[10px] font-medium flex-1" style={{ color: T.textSecondary }}>客户手机号</span>
          <span className="text-[10px] font-medium w-16 text-center" style={{ color: T.textSecondary }}>客户姓名</span>
          <span className="text-[10px] font-medium w-14 text-center" style={{ color: T.textSecondary }}>操作</span>
        </div>
        <div className="rounded-b-lg overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          {pendingCustomers.map(c => (
            <div key={c.phone} className="flex items-center px-2 py-2.5 border-t" style={{ borderColor: T.border }}>
              <span className="text-xs flex-1" style={{ color: T.textPrimary }}>{c.phone}</span>
              <span className="text-xs w-16 text-center" style={{ color: T.textPrimary }}>{c.name}</span>
              <div className="w-14 flex justify-center">
                <button className="px-3 py-1 rounded-full text-[10px] font-medium text-white" style={{ background: T.brand }}>认领</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </PhoneFrame>
);

/* P3: 认领流程（独立页 3态切换） */
const PendingPage3 = () => {
  const [step, setStep] = useState<'confirm' | 'loading' | 'success'>('confirm');
  return (
    <PhoneFrame>
      <TopBar title="市场运营" />
      {/* 客户列表 */}
      <div className="flex-1 overflow-y-auto relative" style={{ background: T.warmGray }}>
        <ScriptBlock mode="collapsed" activityName="全球通-流量运营-策略3-129元档" />
        <div className="px-4 py-2">
          <div className="flex items-center px-2 py-2 rounded-t-lg" style={{ background: T.warmGray }}>
            <span className="text-[10px] font-medium flex-1" style={{ color: T.textSecondary }}>客户手机号</span>
            <span className="text-[10px] font-medium w-16 text-center" style={{ color: T.textSecondary }}>客户姓名</span>
            <span className="text-[10px] font-medium w-14 text-center" style={{ color: T.textSecondary }}>操作</span>
          </div>
          <div className="rounded-b-lg overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            {pendingCustomers.map(c => (
              <div key={c.phone} className="flex items-center px-2 py-2.5 border-t" style={{ borderColor: T.border }}>
                <span className="text-xs flex-1" style={{ color: T.textPrimary }}>{c.phone}</span>
                <span className="text-xs w-16 text-center" style={{ color: T.textPrimary }}>{c.name}</span>
                <div className="w-14 flex justify-center">
                  <button className="px-3 py-1 rounded-full text-[10px] font-medium text-white" style={{ background: T.brand }}>认领</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 认领流程（独立页展示） */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl p-5" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            {/* 3态Tab切换 */}
            <div className="flex gap-2 mb-4">
              {(['confirm', 'loading', 'success'] as const).map(s => (
                <button key={s} onClick={() => setStep(s)} className="px-3 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: step === s ? T.brand : T.warmGray, color: step === s ? '#fff' : T.textSecondary }}>
                  {s === 'confirm' ? '确认态' : s === 'loading' ? '加载态' : '成功态'}
                </button>
              ))}
            </div>
            {step === 'confirm' && (
              <>
                <h3 className="text-sm font-medium text-center" style={{ color: T.textPrimary }}>认领确认</h3>
                <p className="text-xs text-center mt-2" style={{ color: T.textSecondary }}>确定认领183****6988吗？</p>
                <div className="flex gap-3 mt-5">
                  <button className="flex-1 py-2.5 rounded-xl text-xs font-medium border" style={{ borderColor: T.border, color: T.textSecondary }}>取消</button>
                  <button className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white" style={{ background: T.brand }}>确定</button>
                </div>
              </>
            )}
            {step === 'loading' && (
              <div className="flex flex-col items-center py-4">
                <Loader2 size={32} className="animate-spin" style={{ color: T.brand }} />
                <h3 className="text-sm font-medium mt-3" style={{ color: T.textPrimary }}>认领中，请稍等！</h3>
                <p className="text-xs mt-2 text-center" style={{ color: T.textSecondary }}>正在为您认领客户资源，请不要关闭窗口</p>
              </div>
            )}
            {step === 'success' && (
              <div className="flex flex-col items-center py-4">
                <CheckCircle2 size={40} style={{ color: T.green }} />
                <h3 className="text-sm font-medium mt-3" style={{ color: T.textPrimary }}>认领成功！</h3>
                <p className="text-xs mt-2" style={{ color: T.textSecondary }}>您已成功认领该客户资源</p>
                <button className="mt-4 px-5 py-2 rounded-xl text-xs font-medium text-white" style={{ background: T.brand }}>前往处理中查看</button>
                <button className="mt-2 px-5 py-2 rounded-xl text-xs font-medium" style={{ color: T.textSecondary }}>确定</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

/* P4: 客户画像完整页（待处理：认领底栏，无拨打/办理） */
const PendingPage4 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <PortraitPage variant="pending" />
  </PhoneFrame>
);

/* B-CP0: 任务分类首页（处理中，手风琴三层嵌套 - 与任务版一致） */
const BizProcessedPage0 = () => {
  const [openSub, setOpenSub] = useState<string | null>(null);

  const categories = [
    {
      key: 'province',
      name: '省级活动',
      total: 6,
      icon: Briefcase,
      iconBg: '#E8F0FE',
      iconColor: '#3B82F6',
      subs: [
        { key: 'stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['全球通-流量运营-策略3-129元档'] },
        { key: 'increment', name: '增量运营', count: 3, color: '#10B981', strategies: ['全球通-增量运营-策略1-89元档', '全球通-增量运营-策略2-69元档', '全球通-增量运营-策略3-49元档'] },
        { key: 'segment', name: '细分市场运营', count: 2, color: '#F59E0B', strategies: ['全球通-细分市场-策略1-129元档', '全球通-细分市场-策略2-99元档'] },
        {
          key: 'biz-opp',
          name: '商机运营',
          count: 4,
          color: '#8B5CF6',
          groups: [
            { name: '流量运营', color: '#3B82F6', strategies: ['流量达量预警', '特定内容高频访问', '地板价套餐查询高流量套餐', '零流量使用预警'] },
            { name: '中高端运营', color: '#8B5CF6', strategies: ['中高端客户降档预警', 'ARPU下滑预警'] },
            { name: '离网维系', color: '#EF4444', strategies: ['离网高风险客户', '携转意向预警'] },
            { name: '家庭运营', color: '#10B981', strategies: ['宽带到期续费', '融合升级商机'] },
          ],
        },
      ],
    },
    {
      key: 'city',
      name: '市级活动',
      total: 2,
      icon: Building2,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      subs: [
        { key: 'city-stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['乌鲁木齐-存量运营-策略1-99元档'] },
        { key: 'city-increment', name: '增量运营', count: 1, color: '#10B981', strategies: ['乌鲁木齐-增量运营-策略1-79元档'] },
      ],
    },
  ];

  return (
    <PhoneFrame>
      <TopBar title="市场运营" />
      <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
        <div className="mx-4 mt-3 rounded-xl flex" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <StatCard value="24732" label="待认领数" />
          <div className="w-px my-3" style={{ background: T.border }} />
          <StatCard value="3" label="已认领数" />
        </div>
        <div className="mx-4 mt-3 flex rounded-lg overflow-hidden" style={{ background: 'rgba(0,102,255,0.06)' }}>
          <button className="flex-1 py-2 text-xs font-medium" style={{ color: T.textSecondary }}>待处理</button>
          <button className="flex-1 py-2 text-xs font-medium rounded-lg" style={{ background: T.brand, color: '#fff' }}>处理中</button>
        </div>
        {/* 大类卡片（默认展开，不折叠） */}
        <div className="mx-4 mt-3 space-y-3 pb-2">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
                {/* 大类头（不可折叠，始终展示） */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cat.iconBg }}>
                    <CatIcon size={16} style={{ color: cat.iconColor }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{cat.name}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: cat.iconBg, color: cat.iconColor }}>{cat.total}</span>
                </div>
                {/* 小类列表（手风琴折叠） */}
                <div className="px-2 pb-2 space-y-1">
                  {cat.subs.map(sub => {
                    const isSubOpen = openSub === `${cat.key}-${sub.key}`;
                    return (
                      <div key={sub.key} className="rounded-lg overflow-hidden" style={{ background: isSubOpen ? '#fff' : T.warmGray }}>
                        {/* 小类行 */}
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2.5"
                          onClick={() => setOpenSub(isSubOpen ? null : `${cat.key}-${sub.key}`)}
                        >
                          <div className="w-1 h-4 rounded-full" style={{ background: sub.color }} />
                          <span className={`text-xs flex-1 text-left ${isSubOpen ? 'font-medium' : ''}`} style={{ color: T.textPrimary }}>{sub.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${sub.color}12`, color: sub.color }}>{sub.count}</span>
                          <div style={{ transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                            <ChevronRight size={12} style={{ color: T.textMuted }} />
                          </div>
                        </button>
                        {/* 策略列表（展开时显示；商机运营按运营场景分组） */}
                        {isSubOpen && (
                          <div className="px-2 pb-2 space-y-1" style={{ animation: 'fadeIn 0.2s ease' }}>
                            {sub.groups ? (
                              sub.groups.map(g => (
                                <div key={g.name} className="space-y-1">
                                  <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0.5">
                                    <span className="w-1 h-3 rounded-full" style={{ background: g.color }} />
                                    <span className="text-[10px] font-medium" style={{ color: g.color }}>{g.name}</span>
                                  </div>
                                  {g.strategies.map(s => (
                                    <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                      <Target size={10} style={{ color: g.color }} />
                                      <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                      <ChevronRight size={12} style={{ color: T.textMuted }} />
                                    </div>
                                  ))}
                                </div>
                              ))
                            ) : (
                              sub.strategies.map(s => (
                                <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                  <Target size={10} style={{ color: sub.color }} />
                                  <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                  <ChevronRight size={12} style={{ color: T.textMuted }} />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* B-C1: 已认领商机列表（商机任务名 + 话术 + 认领时间/接触时间） */
const BizProcessedPage1 = () => {
  const opp = bizProcessedCustomers[0];
  return (
    <PhoneFrame>
      <div className="h-9 flex items-center justify-center relative shrink-0 border-b" style={{ borderColor: T.border, background: T.cardBg }}>
        <ArrowLeft size={15} style={{ color: T.textPrimary, position: 'absolute', left: 12 }} />
        <span className="text-[12px] font-medium" style={{ color: T.textPrimary }}>商机运营</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${opp.sceneColor}1A` }}>
            <Briefcase size={13} style={{ color: opp.sceneColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium leading-tight truncate" style={{ color: T.textPrimary }}>{opp.scene}-{opp.subCategory}</div>
            <div className="text-[9px] mt-0.5" style={{ color: T.textMuted }}>省级活动 · 商机运营</div>
          </div>
          <TagBadge text="已认领" color={T.green} bg="rgba(16,185,129,0.1)" />
        </div>
        <div className="mx-4 mt-2.5 rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <ScriptBlock mode="collapsed" paragraphs={bizScriptParagraphs} activityName={`${opp.scene}-${opp.subCategory}`} />
        </div>
        <div className="px-4 mt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium" style={{ color: T.textPrimary }}>已认领商机</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${opp.sceneColor}1A`, color: opp.sceneColor }}>{bizProcessedCustomers.length}</span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: T.border }}>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>客户手机号</th>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>客户姓名</th>
                  <th className="px-3 py-2 text-[9px] font-medium" style={{ color: T.textMuted }}>认领时间</th>
                  <th className="px-3 py-2 text-[9px] font-medium text-right" style={{ color: T.textMuted }}>接触时间</th>
                </tr>
              </thead>
              <tbody>
                {bizProcessedCustomers.map(c => (
                  <tr key={c.phone} className="border-b last:border-b-0" style={{ borderColor: T.border }}>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: T.textPrimary }}>{c.phone}</td>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: T.textPrimary }}>{c.name}</td>
                    <td className="px-3 py-2.5 text-[9px]" style={{ color: T.textMuted }}>{c.claimTime}</td>
                    <td className="px-3 py-2.5 text-[9px] text-right" style={{ color: T.textMuted }}>{c.contactTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-[9px] mt-2" style={{ color: T.textMuted }}>没有更多了</p>
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* B-C2: 处理中商机详情（商机信息卡 + 客户画像 + 底部「拨打/办理」） */
const BizProcessedPage2 = () => (
  <PhoneFrame>
    <BizPortraitPage variant="processed" opp={bizProcessedCustomers[0]} />
  </PhoneFrame>
);

/* B-C3: 去处理-外呼提示 Sheet（对齐网格通外呼流程） */
/* B-C3: 去处理-外呼提示（独立页，无蒙版） */
const BizProcessedPage3 = () => {
  const opp = bizProcessedCustomers[0];
  return (
    <PhoneFrame>
      {/* 顶部导航 */}
      <div className="h-10 flex items-center justify-center relative shrink-0 border-b" style={{ borderColor: T.border, background: T.cardBg }}>
        <ArrowLeft size={16} style={{ color: T.textPrimary, position: 'absolute', left: 12 }} />
        <span className="text-[13px] font-medium" style={{ color: T.textPrimary }}>外呼提示</span>
        <span className="absolute right-3 text-[9px] flex items-center gap-1" style={{ color: T.textMuted }}>
          <PhoneCall size={11} /> 处理中
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
        {/* 客户+商机信息 */}
        <div className="mx-4 mt-3 rounded-xl p-3" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium" style={{ color: T.textPrimary }}>{opp.name} <span className="text-[10px] font-normal ml-1" style={{ color: T.textMuted }}>全球通</span></div>
              <div className="text-[11px] mt-1" style={{ color: T.textSecondary }}>{opp.phone}</div>
            </div>
            <TagBadge text={`${opp.scene}-${opp.subCategory}`} color={opp.sceneColor} bg={`${opp.sceneColor}1A`} />
          </div>
          <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between text-[9px]" style={{ borderColor: T.border }}>
            <span style={{ color: T.textMuted }}>认领时间 {opp.claimTime}</span>
            <span style={{ color: T.textMuted }}>状态 <span style={{ color: T.green }}>已认领</span></span>
          </div>
        </div>
        {/* 拨打对象 */}
        <div className="mx-4 mt-3 rounded-xl p-3 flex items-center justify-between" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <PhoneCall size={15} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: T.textPrimary }}>拨打对象</div>
              <div className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>网格通绑定工作号</div>
            </div>
          </div>
          <button className="px-5 py-2 rounded-lg text-white text-[12px] font-medium flex items-center gap-1.5" style={{ background: '#8B5CF6' }}>
            <PhoneCall size={13} /> 呼叫
          </button>
        </div>
        {/* 外呼前确认 */}
        <div className="mx-4 mt-3 rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <AlertTriangle size={13} style={{ color: T.orange }} className="mt-0.5 shrink-0" />
          <div>
            <div className="text-[11px] font-medium" style={{ color: T.orange }}>外呼前请确认</div>
            <p className="text-[9px] mt-1 leading-relaxed" style={{ color: T.textSecondary }}>请使用网格通绑定工作号拨打，若提示「绑定关系不存在」，请联系管理员完成账号绑定后再外呼。外呼完成后请进入「回访登记」填写外呼结果。</p>
          </div>
        </div>
      </div>
      {/* 底部导航 */}
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* ─── 处理中-商机 5: 回访登记（独立页，无蒙版） ─── */
const BizProcessedPage5 = () => {
  const [visitStatus, setVisitStatus] = useState('成功');
  const opp = bizProcessedCustomers[0];
  const issues = ['移动宽带故障', '手机上网慢', '宽带上网慢', '通话质量差', '资费贵', '其他费用问题', '竞对优惠大'];
  return (
    <PhoneFrame>
      {/* 顶部导航 */}
      <div className="h-10 flex items-center justify-center relative shrink-0 border-b" style={{ borderColor: T.border, background: T.cardBg }}>
        <ArrowLeft size={16} style={{ color: T.textPrimary, position: 'absolute', left: 12 }} />
        <span className="text-[13px] font-medium" style={{ color: T.textPrimary }}>回访登记</span>
        <span className="absolute right-3 text-[9px] flex items-center gap-1" style={{ color: T.textMuted }}>
          <ClipboardList size={11} /> 处理中
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
        {/* 客户+商机信息 */}
        <div className="mx-4 mt-3 rounded-xl p-3" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium" style={{ color: T.textPrimary }}>
                {opp.name} <span className="text-[10px] font-normal ml-1" style={{ color: T.textMuted }}>全球通</span>
              </div>
              <div className="text-[11px] mt-1" style={{ color: T.textSecondary }}>{opp.phone}</div>
            </div>
            <TagBadge text={`${opp.scene}-${opp.subCategory}`} color={opp.sceneColor} bg={`${opp.sceneColor}1A`} />
          </div>
          <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between text-[9px]" style={{ borderColor: T.border }}>
            <span style={{ color: T.textMuted }}>认领时间 {opp.claimTime}</span>
            <span style={{ color: T.textMuted }}>状态 <span style={{ color: T.orange }}>待登记</span></span>
          </div>
        </div>
        {/* 外呼状态 */}
        <div className="mx-4 mt-3">
          <div className="text-[11px] font-medium mb-2" style={{ color: T.textPrimary }}>外呼状态</div>
          <div className="grid grid-cols-4 gap-2">
            {['成功', '拒接', '待定', '失败'].map(s => (
              <button key={s} onClick={() => setVisitStatus(s)} className="py-2 rounded-lg text-[11px] font-medium" style={visitStatus === s ? { background: s === '成功' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: s === '成功' ? T.green : T.orange, border: `1px solid ${s === '成功' ? T.green : T.orange}` } : { background: T.cardBg, color: T.textSecondary, border: `1px solid ${T.border}` }}>{s}</button>
            ))}
          </div>
        </div>
        {/* 常见问题原因 */}
        <div className="mx-4 mt-3">
          <div className="text-[11px] font-medium mb-2" style={{ color: T.textPrimary }}>常见问题原因</div>
          <div className="flex flex-wrap gap-2">
            {issues.map(i => (
              <span key={i} className="px-2.5 py-1.5 rounded-lg text-[10px]" style={{ background: T.cardBg, color: T.textSecondary, border: `1px solid ${T.border}` }}>{i}</span>
            ))}
          </div>
        </div>
        {/* 用户营销备注 */}
        <div className="mx-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium" style={{ color: T.textPrimary }}>用户营销备注</span>
            <span className="text-[9px]" style={{ color: T.textMuted }}>剩余100字</span>
          </div>
          <textarea rows={3} placeholder="请输入备注内容…" className="w-full rounded-xl px-3 py-2.5 text-[10px] resize-none outline-none" style={{ background: T.cardBg, color: T.textPrimary, border: `1px solid ${T.border}` }} />
        </div>
        <div className="px-4 pt-4 pb-6">
          <button className="w-full py-3 rounded-xl text-white text-[13px] font-medium" style={{ background: '#F59E0B' }}>提交登记</button>
          <p className="text-[9px] mt-2 text-center" style={{ color: T.textMuted }}>登记结果将记录至维系历史，并回流商机管理模块</p>
        </div>
      </div>
      {/* 底部导航 */}
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* ═══════════════════════════════════════════
   处理中 5页
   ═══════════════════════════════════════════ */

/* P1: 任务分类首页（处理中，大类默认展开+图标，小类手风琴折叠） */
const ProcessedPage1 = () => {
  const [openSub, setOpenSub] = useState<string | null>(null);

  const categories = [
    {
      key: 'province',
      name: '省级活动',
      total: 6,
      icon: Briefcase,
      iconBg: '#E8F0FE',
      iconColor: '#3B82F6',
      subs: [
        { key: 'stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['全球通-流量运营-策略3-129元档'] },
        { key: 'increment', name: '增量运营', count: 3, color: '#10B981', strategies: ['全球通-增量运营-策略1-89元档', '全球通-增量运营-策略2-69元档', '全球通-增量运营-策略3-49元档'] },
        { key: 'segment', name: '细分市场运营', count: 2, color: '#F59E0B', strategies: ['全球通-细分市场-策略1-129元档', '全球通-细分市场-策略2-99元档'] },
        {
          key: 'biz-opp',
          name: '商机运营',
          count: 4,
          color: '#8B5CF6',
          groups: [
            { name: '流量运营', color: '#3B82F6', strategies: ['流量达量预警', '特定内容高频访问', '地板价套餐查询高流量套餐', '零流量使用预警'] },
            { name: '中高端运营', color: '#8B5CF6', strategies: ['中高端客户降档预警', 'ARPU下滑预警'] },
            { name: '离网维系', color: '#EF4444', strategies: ['离网高风险客户', '携转意向预警'] },
            { name: '家庭运营', color: '#10B981', strategies: ['宽带到期续费', '融合升级商机'] },
          ],
        },
      ],
    },
    {
      key: 'city',
      name: '市级活动',
      total: 2,
      icon: Building2,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      subs: [
        { key: 'city-stock', name: '存量运营', count: 1, color: '#3B82F6', strategies: ['乌鲁木齐-存量运营-策略1-99元档'] },
        { key: 'city-increment', name: '增量运营', count: 1, color: '#10B981', strategies: ['乌鲁木齐-增量运营-策略1-79元档'] },
      ],
    },
  ];

  return (
    <PhoneFrame>
      <TopBar title="市场运营" />
      <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
        <div className="mx-4 mt-3 rounded-xl flex" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          <StatCard value="24732" label="待认领数" />
          <div className="w-px my-3" style={{ background: T.border }} />
          <StatCard value="3" label="已认领数" />
        </div>
        <div className="mx-4 mt-3 flex rounded-lg overflow-hidden" style={{ background: 'rgba(0,102,255,0.06)' }}>
          <button className="flex-1 py-2 text-xs font-medium" style={{ color: T.textSecondary }}>待处理</button>
          <button className="flex-1 py-2 text-xs font-medium rounded-lg" style={{ background: T.brand, color: '#fff' }}>处理中</button>
        </div>
        {/* 大类卡片（默认展开，不折叠） */}
        <div className="mx-4 mt-3 space-y-3 pb-2">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.key} className="rounded-xl overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
                {/* 大类头（不可折叠，始终展示） */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cat.iconBg }}>
                    <CatIcon size={16} style={{ color: cat.iconColor }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{cat.name}</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: cat.iconBg, color: cat.iconColor }}>{cat.total}</span>
                </div>
                {/* 小类列表（手风琴折叠） */}
                <div className="px-2 pb-2 space-y-1">
                  {cat.subs.map(sub => {
                    const isSubOpen = openSub === `${cat.key}-${sub.key}`;
                    return (
                      <div key={sub.key} className="rounded-lg overflow-hidden" style={{ background: isSubOpen ? '#fff' : T.warmGray }}>
                        {/* 小类行 */}
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2.5"
                          onClick={() => setOpenSub(isSubOpen ? null : `${cat.key}-${sub.key}`)}
                        >
                          <div className="w-1 h-4 rounded-full" style={{ background: sub.color }} />
                          <span className={`text-xs flex-1 text-left ${isSubOpen ? 'font-medium' : ''}`} style={{ color: T.textPrimary }}>{sub.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${sub.color}12`, color: sub.color }}>{sub.count}</span>
                          <div style={{ transform: isSubOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                            <ChevronRight size={12} style={{ color: T.textMuted }} />
                          </div>
                        </button>
                        {/* 策略列表（展开时显示；商机运营按运营场景分组） */}
                        {isSubOpen && (
                          <div className="px-2 pb-2 space-y-1" style={{ animation: 'fadeIn 0.2s ease' }}>
                            {sub.groups ? (
                              sub.groups.map(g => (
                                <div key={g.name} className="space-y-1">
                                  <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0.5">
                                    <span className="w-1 h-3 rounded-full" style={{ background: g.color }} />
                                    <span className="text-[10px] font-medium" style={{ color: g.color }}>{g.name}</span>
                                  </div>
                                  {g.strategies.map(s => (
                                    <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                      <Target size={10} style={{ color: g.color }} />
                                      <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                      <ChevronRight size={12} style={{ color: T.textMuted }} />
                                    </div>
                                  ))}
                                </div>
                              ))
                            ) : (
                              sub.strategies.map(s => (
                                <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.warmGray }}>
                                  <Target size={10} style={{ color: sub.color }} />
                                  <span className="text-[10px] flex-1 leading-tight" style={{ color: T.textPrimary }}>{s}</span>
                                  <ChevronRight size={12} style={{ color: T.textMuted }} />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="task" />
    </PhoneFrame>
  );
};

/* P2: 已认领客户列表（处理中，含任务名+话术+认领时间+接触时间） */
const ProcessedPage2 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <div className="flex-1 overflow-y-auto" style={{ background: T.warmGray }}>
      {/* 任务名称 */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-sm font-medium" style={{ color: T.textPrimary }}>全球通-流量运营-策略3-129元档</span>
      </div>
      {/* 话术（默认2行可展开） */}
      <ScriptBlock mode="collapsed" />
      {/* 客户列表 */}
      <div className="px-4 py-2">
        <div className="flex items-center px-2 py-2 rounded-t-lg" style={{ background: T.warmGray }}>
          <span className="text-[10px] font-medium flex-1" style={{ color: T.textSecondary }}>客户手机号</span>
          <span className="text-[10px] font-medium w-14 text-center" style={{ color: T.textSecondary }}>客户姓名</span>
          <span className="text-[10px] font-medium w-20 text-center" style={{ color: T.textSecondary }}>认领时间</span>
          <span className="text-[10px] font-medium w-16 text-center" style={{ color: T.textSecondary }}>接触时间</span>
        </div>
        <div className="rounded-b-lg overflow-hidden" style={{ background: T.cardBg, boxShadow: T.shadow }}>
          {processedCustomers.map(c => (
            <div key={c.phone} className="flex items-center px-2 py-2.5 border-t" style={{ borderColor: T.border }}>
              <span className="text-[10px] flex-1" style={{ color: T.textPrimary }}>{c.phone}</span>
              <span className="text-[10px] w-14 text-center" style={{ color: T.textPrimary }}>{c.name}</span>
              <span className="text-[10px] w-20 text-center" style={{ color: T.textSecondary }}>{c.claimTime.slice(5)}</span>
              <span className="text-[10px] w-16 text-center" style={{ color: c.contactTime ? T.textPrimary : T.textMuted }}>{c.contactTime || '--'}</span>
            </div>
          ))}
          <div className="py-2 text-center">
            <span className="text-[10px]" style={{ color: T.textMuted }}>没有更多了</span>
          </div>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

/* P3: 客户画像完整页（处理中：无认领按钮，有拨打+办理底栏，去掉BottomNav） */
const ProcessedPage3 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <PortraitPage variant="processed" />
  </PhoneFrame>
);

/* P4: 办业务（独立页） */
const ProcessedPage4 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
      <div className="px-4 pt-4 pb-6">
        <h3 className="text-sm font-medium text-center mb-1" style={{ color: T.textPrimary }}>办业务</h3>
        <p className="text-[10px] text-center mb-4" style={{ color: T.textMuted }}>请选择需要办理的业务类型</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Gift size={20} style={{ color: T.brand }} />, label: '一事一案\n赠送类', bg: T.brandLight },
            { icon: <Tag size={20} style={{ color: T.green }} />, label: '一事一案\n营销类', bg: T.greenLight },
            { icon: <Package size={20} style={{ color: T.orange }} />, label: '产品优惠\n服务变更', bg: T.orangeLight },
            { icon: <Shield size={20} style={{ color: '#8B5CF6' }} />, label: '融合\n(合约)类', bg: 'rgba(139,92,246,0.1)' },
            { icon: <Wifi size={20} style={{ color: '#06B6D4' }} />, label: '融合\n(非合约)类', bg: 'rgba(6,182,212,0.1)' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-2 py-3 rounded-xl" style={{ background: item.bg }}>
              {item.icon}
              <span className="text-[10px] text-center leading-tight" style={{ color: T.textPrimary }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <AlertTriangle size={13} style={{ color: T.orange }} className="mt-0.5 shrink-0" />
          <p className="text-[10px] leading-relaxed" style={{ color: T.textSecondary }}>办理后向客户下发确认短信，客户回复「1 或是」后受理成功，客户将收到 10086 订购成功提醒短信。</p>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

/* P5: 外呼提示（独立页） */
const ProcessedPage5 = () => (
  <PhoneFrame>
    <TopBar title="市场运营" />
    <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', background: T.warmGray }}>
      <div className="px-4 pt-4 pb-6">
        <h3 className="text-sm font-medium text-center mb-4" style={{ color: T.textPrimary }}>请使用此号码外呼</h3>
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: T.brandLight }}>
          <PhoneCall size={16} style={{ color: T.brand }} />
          <span className="text-lg font-bold" style={{ color: T.brand }}>绑定关系不存在</span>
        </div>
        <p className="text-[10px] mt-2 text-center" style={{ color: T.textMuted }}>请先完成网格通账号绑定后，再发起外呼</p>
        <div className="flex gap-3 mt-5">
          <button className="flex-1 py-2.5 rounded-xl text-xs font-medium border" style={{ borderColor: T.border, color: T.textSecondary }}>取消</button>
          <button className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1" style={{ background: T.brand }}>
            <Phone size={14} /> 呼叫
          </button>
        </div>
      </div>
    </div>
  </PhoneFrame>
);

/* ═══════════════════════════════════════════
   主页面：11个手机模型展示
   ═══════════════════════════════════════════ */
export default function H5TaskRedesignPage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#0F172A' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h1 className="text-2xl font-bold text-white text-center mb-2">H5端「我的任务」重构方案</h1>
      <p className="text-sm text-center mb-8" style={{ color: '#94A3B8' }}>任务 9页 + 商机运营 5页 = 14页完整展示</p>

      {/* ── 待处理 ── */}
      <h2 className="text-lg font-bold text-white mb-4 mt-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full" style={{ background: T.brand }} />
        我的任务 - 待处理
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 mb-8">
        {[
          { title: '1. 任务分类首页\n（手风琴三层嵌套）', comp: <PendingPage1 /> },
          { title: '2. 活动客户列表\n（话术默认2行）', comp: <PendingPage2 /> },
          { title: '3. 客户画像完整页\n（活动名可展开话术+状态）', comp: <PendingPage4 /> },
          { title: '4. 认领流程\n（独立页 3态切换）', comp: <PendingPage3 /> },
        ].map((item, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
            <span className="text-xs text-center whitespace-pre-line font-medium" style={{ color: '#CBD5E1' }}>{item.title}</span>
            {item.comp}
          </div>
        ))}
      </div>

      {/* ── 待处理 · 商机运营 ── */}
      <h2 className="text-lg font-bold text-white mb-4 mt-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full" style={{ background: '#8B5CF6' }} />
        我的任务 - 待处理 · 商机运营
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 mb-8">
        {[
          { title: '1. 任务分类首页\n（手风琴三层嵌套）', comp: <BizPendingPage0 /> },
          { title: '2. 商机客户列表\n（话术默认2行）', comp: <BizPendingPage1 /> },
          { title: '3. 商机详情\n（画像+商机信息卡）', comp: <BizPendingPage2 /> },
          { title: '4. 认领流程\n（独立页 3态切换）', comp: <BizPendingPage3 /> },
        ].map((item, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
            <span className="text-xs text-center whitespace-pre-line font-medium" style={{ color: '#CBD5E1' }}>{item.title}</span>
            {item.comp}
          </div>
        ))}
      </div>

      {/* ── 处理中 ── */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full" style={{ background: T.green }} />
        我的任务 - 处理中
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 mb-8">
        {[
          { title: '1. 任务分类首页\n（手风琴三层嵌套）', comp: <ProcessedPage1 /> },
          { title: '2. 已认领客户列表\n（含任务名+话术）', comp: <ProcessedPage2 /> },
          { title: '3. 客户画像完整页\n（活动名可展开+拨打/办理底栏）', comp: <ProcessedPage3 /> },
          { title: '4. 办业务\n（独立页）', comp: <ProcessedPage4 /> },
          { title: '5. 外呼提示\n（独立页）', comp: <ProcessedPage5 /> },
        ].map((item, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
            <span className="text-xs text-center whitespace-pre-line font-medium" style={{ color: '#CBD5E1' }}>{item.title}</span>
            {item.comp}
          </div>
        ))}
      </div>

      {/* ── 处理中 · 商机运营 ── */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 rounded-full" style={{ background: '#8B5CF6' }} />
        我的任务 - 处理中 · 商机运营
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {[
          { title: '1. 任务分类首页\n（手风琴三层嵌套）', comp: <BizProcessedPage0 /> },
          { title: '2. 已认领商机列表\n（含商机名+话术）', comp: <BizProcessedPage1 /> },
          { title: '3. 商机详情\n（画像+商机信息卡+拨打/办理）', comp: <BizProcessedPage2 /> },
          { title: '4. 外呼提示 Sheet\n（绑定号码后呼叫）', comp: <BizProcessedPage3 /> },
          { title: '6. 回访登记\n（状态+原因+备注）', comp: <BizProcessedPage5 /> },
        ].map((item, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
            <span className="text-xs text-center whitespace-pre-line font-medium" style={{ color: '#CBD5E1' }}>{item.title}</span>
            {item.comp}
          </div>
        ))}
      </div>
    </div>
  );
}
