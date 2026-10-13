'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronUp, X, Search,
  Home, Users, Calendar, FileText,
  MapPin, Clock, CheckCircle, ArrowLeft,
} from 'lucide-react';
import { loadDispatchData, type CommunityFilterTag, type CustomerFilterTag, type SelectedCommunity } from './utils';
import { indicatorModules } from '@/app/data/home/indicatorData';
import { getAllowedModuleIds } from '@/lib/evaluation-indicator';
import IndicatorSelectDialog from './IndicatorSelectDialog';
import AOIDetailDialog from './AOIDetailDialog';
import CommunityPortrait, { CellInfo } from '../components/CommunityPortrait';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import StrategyMakingPanel from '@/components/strategy/StrategyMakingPanel';
import ActivityConfigDialog from '@/components/strategy/ActivityConfigDialog';

// ==================== 默认数据 ====================

const defaultCommunityFilterTags: CommunityFilterTag[] = [
  { category: '流量低饱和小区', tagType: 'lowSaturation', color: '#1890ff' },
  { category: '流量超套高发小区', tagType: 'overageHighFreq', color: '#fa8c16' },
  { category: '异网高风险小区', tagType: 'competitorHighRisk', color: '#f5222d' },
];

const defaultCustomerFilterTags: CustomerFilterTag[] = [
  {
    group: '零低流量',
    items: [
      { label: '24-30岁零低流量客户', value: '是' },
      { label: '31-50岁零低流量客户', value: '是' },
    ],
  },
  {
    group: '低饱和',
    items: [
      { label: '31-50岁低饱和客户', value: '是' },
      { label: '50岁以上低饱和客户', value: '是' },
    ],
  },
  {
    group: '流量超套',
    items: [{ label: '是否流量超套客户', value: '是' }],
  },
  {
    group: '资费/融合/卡槽',
    items: [
      { label: '资费情况', value: '老资费' },
      { label: '融合情况', value: '未融合' },
      { label: '卡槽情况', value: '异网主卡' },
    ],
  },
];

const defaultSelectedCommunities: SelectedCommunity[] = [
  { id: 'C1001', aoiName: '天山区AOI', aoiCode: 'AOI-TS001', communityCode: 'TS001, TS002', city: '乌鲁木齐', district: '天山区', grid: '大巴扎网格', taskCustomerCount: 500, hasExistingTask: true, recentDispatchCount: 5 },
  { id: 'C1002', aoiName: '沙依巴克区AOI', aoiCode: 'AOI-SYB002', communityCode: 'SYB002, SYB003', city: '乌鲁木齐', district: '沙依巴克区', grid: '友好北路网格', taskCustomerCount: 800, hasExistingTask: false, recentDispatchCount: 3 },
  { id: 'C1003', aoiName: '新市区AOI', aoiCode: 'AOI-XS003', communityCode: 'XS003, XS004', city: '乌鲁木齐', district: '新市区', grid: '北京路网格', taskCustomerCount: 650, hasExistingTask: true, recentDispatchCount: 7 },
  { id: 'C1004', aoiName: '水磨沟区AOI', aoiCode: 'AOI-SMG004', communityCode: 'SMG004', city: '乌鲁木齐', district: '水磨沟区', grid: '南湖网格', taskCustomerCount: 420, hasExistingTask: false, recentDispatchCount: 2 },
  { id: 'C1005', aoiName: '头屯河区AOI', aoiCode: 'AOI-TTH005', communityCode: 'TTH005, TTH006', city: '乌鲁木齐', district: '头屯河区', grid: '开发区网格', taskCustomerCount: 380, hasExistingTask: true, recentDispatchCount: 4 },
];

// 审批人 - 人工选择
// 候选审批人列表（实际系统中从人员目录接口获取）

const APPROVER_OPTIONS = [
  { id: '1', name: '王建国', role: '区公司-市场部领导' },
  { id: '2', name: '李红梅', role: '区公司-市场部领导' },
  { id: '3', name: '张伟', role: '地州公司-领导（乌鲁木齐）' },
  { id: '4', name: '陈静', role: '地州公司-领导（克拉玛依）' },
  { id: '5', name: '赵明', role: '县公司-领导（天山区）' },
];

// ==================== 折叠面板组件 ====================

function CollapsePanel({
  title,
  icon,
  defaultOpen = true,
  children,
  required,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  required?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #e8e8e8',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: '#fafafa',
          borderBottom: open ? '1px solid #e8e8e8' : 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>
            {required && <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>}
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp style={{ width: '16px', height: '16px', color: '#999' }} />
        ) : (
          <ChevronDown style={{ width: '16px', height: '16px', color: '#999' }} />
        )}
      </div>

      {open && (
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      )}
    </div>
    </>
  );
}

// ==================== 分页按钮样式 ====================

function pageBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 10px',
    borderRadius: '4px',
    border: `1px solid ${active ? '#1677FF' : '#d9d9d9'}`,
    backgroundColor: active ? '#1677FF' : '#fff',
    color: active ? '#fff' : '#666',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };
}

// ==================== 主页面组件 ====================

export default function DispatchPage() {
  const router = useRouter();

  // 从sessionStorage读取回显数据
  const [communityTags, setCommunityTags] = useState<CommunityFilterTag[]>(defaultCommunityFilterTags);
  const [customerTags, setCustomerTags] = useState<CustomerFilterTag[]>(defaultCustomerFilterTags);
  const [customerSummary, setCustomerSummary] = useState('流量客户');
  const [communities, setCommunities] = useState<SelectedCommunity[]>(defaultSelectedCommunities);

  useEffect(() => {
    const data = loadDispatchData();
    if (data) {
      if (data.communityFilterTags) setCommunityTags(data.communityFilterTags);
      if (data.customerFilterTags) setCustomerTags(data.customerFilterTags);
      if (data.customerInfoSummary) setCustomerSummary(data.customerInfoSummary);
      if (data.selectedCommunities) setCommunities(data.selectedCommunities);
    }
  }, []);

  // 基础信息
  const [taskName, setTaskName] = useState('');
  const [validStartDate, setValidStartDate] = useState('');
  const [validEndDate, setValidEndDate] = useState('');
  // 触客策略 - 策略制定（方案比选 + 营销话术）
  const [confirmedStrategy, setConfirmedStrategy] = useState<{ plan: string; speech: string } | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  // 派单信息
  const dispatchSystem = '网格通';
  const [executionRole, setExecutionRole] = useState<string>('');
  // 评估指标：多选，每个指标含目标值
  const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<string[]>([]);
  const [indicatorTargetValues, setIndicatorTargetValues] = useState<Record<string, string>>({});
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  // AOI详情弹窗
  const [aoiDetailOpen, setAoiDetailOpen] = useState(false);
  const [selectedAOI, setSelectedAOI] = useState<SelectedCommunity | null>(null);
  // 小区画像弹窗（页面层渲染，脱离Radix Dialog事件系统）
  const [portraitCell, setPortraitCell] = useState<CellInfo | null>(null);
  const [portraitVisible, setPortraitVisible] = useState(false);

  // 当前场景允许的指标模块ID（区域攻坚调度-流量入口，只允许流量运营相关模块）
  const allowedModuleIds = getAllowedModuleIds('region-assault', 'traffic');
  // 后评估周期
  const [postEvalPeriodDay, setPostEvalPeriodDay] = useState<string>('30');    // 日度指标评估周期（天）
  const [postEvalPeriodMonth, setPostEvalPeriodMonth] = useState<string>('3'); // 月度指标评估周期（月）
  const [approver, setApprover] = useState<string>('');

  // 审批信息 - 人工选择审批人

  // 确认弹窗
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // 成功提示
  const [showSuccess, setShowSuccess] = useState(false);

  // AOI详情弹窗
  const handleShowAoiDetail = (c: SelectedCommunity) => {
    setSelectedAOI(c);
    setAoiDetailOpen(true);
  };

  // 计算
  const totalHouseholds = communities.reduce((sum, c) => sum + c.taskCustomerCount, 0);

  const canSubmit = taskName.trim() && validStartDate && validEndDate && confirmedStrategy
    && executionRole && approver;

  const handleSubmit = () => {
    setShowConfirmModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/portal/traffic-operations');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        height: '56px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/portal/traffic-operations')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '6px',
              border: '1px solid #d9d9d9', backgroundColor: '#fff',
              color: '#666', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1677FF'; e.currentTarget.style.color = '#1677FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.color = '#666'; }}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            返回
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e8e8e8' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '20px', backgroundColor: '#1677FF', borderRadius: '2px' }} />
            <span style={{ fontSize: '17px', fontWeight: 600, color: '#1a1a1a' }}>新建派单</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/portal/traffic-operations')}
            style={{
              padding: '8px 24px', borderRadius: '6px',
              border: '1px solid #d9d9d9', backgroundColor: '#fff',
              color: '#666', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1677FF'; e.currentTarget.style.color = '#1677FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.color = '#666'; }}
          >
            取消
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!canSubmit}
            style={{
              padding: '8px 24px', borderRadius: '6px',
              border: 'none',
              backgroundColor: canSubmit ? '#1677FF' : '#d9d9d9',
              color: canSubmit ? '#fff' : '#999',
              fontSize: '14px', cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#4096FF'; }}
            onMouseLeave={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#1677FF'; }}
          >
            提交派单
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* ==================== 1. 基础信息 ==================== */}
        <CollapsePanel
          title="基础信息"
          icon={<FileText style={{ width: '16px', height: '16px', color: '#1677FF' }} />}
          required
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 任务单名称 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>任务单名称
              </label>
              <input
                type="text"
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                placeholder="请输入任务单名称"
                style={{
                  width: '100%', height: '40px', padding: '0 12px',
                  border: '1px solid #d9d9d9', borderRadius: '6px',
                  fontSize: '14px', color: '#333', outline: 'none',
                  backgroundColor: '#fff',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#1677FF'}
                onBlur={e => e.currentTarget.style.borderColor = '#d9d9d9'}
              />
            </div>

            {/* 任务有效期 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>任务有效期
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="date"
                  value={validStartDate}
                  onChange={e => setValidStartDate(e.target.value)}
                  style={{
                    flex: 1, height: '40px', padding: '0 12px',
                    border: '1px solid #d9d9d9', borderRadius: '6px',
                    fontSize: '14px', color: '#333', outline: 'none',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ color: '#999', fontSize: '14px', flexShrink: 0 }}>至</span>
                <input
                  type="date"
                  value={validEndDate}
                  onChange={e => setValidEndDate(e.target.value)}
                  style={{
                    flex: 1, height: '40px', padding: '0 12px',
                    border: '1px solid #d9d9d9', borderRadius: '6px',
                    fontSize: '14px', color: '#333', outline: 'none',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>


          </div>
        </CollapsePanel>

        {/* ==================== 2. 小区标签 ==================== */}
        <CollapsePanel
          title="小区标签"
          icon={<MapPin style={{ width: '16px', height: '16px', color: '#fa8c16' }} />}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {communityTags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#fff',
                  backgroundColor: tag.color,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {tag.category}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
            基于大数据平台标签体系，显示上一页面已选的小区筛选标签
          </div>
        </CollapsePanel>

        {/* ==================== 3. 客户筛选标签 ==================== */}
        <CollapsePanel
          title="客户筛选标签"
          icon={<Users style={{ width: '16px', height: '16px', color: '#1677FF' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {customerTags.map((group, gIdx) => (
              <div key={gIdx}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  {group.group}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {group.items.map((item, iIdx) => (
                    <span
                      key={iIdx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#fff',
                        backgroundColor: '#1677FF',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}{item.value ? `=${item.value}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
            显示圈选条件中的客户筛选标签
          </div>
        </CollapsePanel>

        {/* ==================== 4. 触客策略 ==================== */}
        <CollapsePanel
          title="触客策略"
          required
        >
          <StrategyMakingPanel
            scenario="流量运营"
            onNewStrategy={() => setActivityDialogOpen(true)}
            onConfirm={(data) => setConfirmedStrategy({ plan: data.plan, speech: data.speech })}
          />
        </CollapsePanel>

        {/* ==================== 5. 已选小区列表 ==================== */}
        <CollapsePanel
          title="已选小区列表"
          icon={<Home style={{ width: '16px', height: '16px', color: '#1677FF' }} />}
        >
          {/* 统计栏 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px',
              backgroundColor: '#e6f7ff',
            }}>
              <Home style={{ width: '18px', height: '18px', color: '#1677FF' }} />
              <span style={{ fontSize: '14px', color: '#333' }}>小区总数</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#1677FF' }}>{communities.length}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px',
              backgroundColor: '#f9f0ff',
            }}>
              <Users style={{ width: '18px', height: '18px', color: '#722ed1' }} />
              <span style={{ fontSize: '14px', color: '#333' }}>总户数</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#722ed1' }}>{totalHouseholds.toLocaleString()}</span>
            </div>
          </div>

          {/* 表格 */}
          <div style={{
            border: '1px solid #e8e8e8',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                minWidth: '1000px',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    {['AOI名称', 'AOI编码', '小区编码', '地州', '区县', '网格', '任务客户数', '存在已派任务', '近三十日派单次数', '操作'].map((h, i) => (
                      <th key={i} style={{
                        padding: '12px 10px',
                        borderBottom: '2px solid #e8e8e8',
                        textAlign: i === 6 || i === 8 ? 'center' : 'left',
                        fontWeight: 600,
                        color: '#333',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {communities.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#333', fontWeight: 500 }}>{c.aoiName}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>{c.aoiCode}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>{c.communityCode}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#333' }}>{c.city}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#333' }}>{c.district}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#333' }}>{c.grid}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#1677FF', fontWeight: 600, textAlign: 'center' }}>{c.taskCustomerCount}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: c.hasExistingTask ? '#fff1f0' : '#f6ffed',
                          color: c.hasExistingTask ? '#ff4d4f' : '#52c41a',
                          border: `1px solid ${c.hasExistingTask ? '#ffccc7' : '#b7eb8f'}`,
                        }}>
                          {c.hasExistingTask ? '是' : '否'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', color: '#333', textAlign: 'center' }}>{c.recentDispatchCount}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                        <button style={{
                          padding: '2px 8px',
                          fontSize: '13px',
                          color: '#1677FF',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => handleShowAoiDetail(c)}
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 分页 */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid #e8e8e8',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#666',
            }}>
              <span>共 {communities.length} 条</span>
              <button style={pageBtnStyle(false)}>上一页</button>
              <button style={pageBtnStyle(true)}>1</button>
              <button style={pageBtnStyle(false)}>2</button>
              <button style={pageBtnStyle(false)}>3</button>
              <button style={pageBtnStyle(false)}>下一页</button>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
            以上小区从区域攻坚页面勾选回显
          </div>
        </CollapsePanel>

        {/* ==================== 5. 评估指标 ==================== */}
        <CollapsePanel
          title={<span><span style={{ color: '#ff4d4f', marginRight: '2px' }}>*</span>评估指标</span>}
          icon={<CheckCircle style={{ width: '16px', height: '16px', color: '#52c41a' }} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 指标选择按钮 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                选择评估指标（可多选）
              </label>
              <button
                type="button"
                onClick={() => setIndicatorDialogOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: selectedIndicatorIds.length > 0 ? '#333' : '#999',
                  width: '100%',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1677ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d9d9d9'; }}
              >
                <span>
                  {selectedIndicatorIds.length > 0
                    ? `已选 ${selectedIndicatorIds.length} 个评估指标`
                    : '点击选择评估指标'}
                </span>
                <Search style={{ width: '14px', height: '14px', color: '#999' }} />
              </button>
              {selectedIndicatorIds.length === 0 && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>请至少选择一个评估指标</div>
              )}
            </div>

            {/* 已选指标标签展示 */}
            {selectedIndicatorIds.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedIndicatorIds.map(indId => {
                  const indicator = indicatorModules.flatMap(m => m.indicators).find(ind => ind.id === indId);
                  if (!indicator) return null;
                  return (
                    <span
                      key={indId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #91caff',
                        background: '#e6f4ff',
                        fontSize: '12px',
                        color: '#1677ff',
                      }}
                    >
                      {indicator.name}
                      <X
                        style={{ width: '12px', height: '12px', cursor: 'pointer', color: '#999' }}
                        onClick={() => {
                          setSelectedIndicatorIds(prev => prev.filter(id => id !== indId));
                          setIndicatorTargetValues(prev => {
                            const next = { ...prev };
                            delete next[indId];
                            return next;
                          });
                        }}
                      />
                    </span>
                  );
                })}
              </div>
            )}

            {/* 已选指标的目标值配置 */}
            {selectedIndicatorIds.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                  指标目标值配置
                </label>
                {selectedIndicatorIds.map(indId => {
                  const indicator = indicatorModules.flatMap(m => m.indicators).find(ind => ind.id === indId);
                  if (!indicator) return null;
                  const unit = indicator.unit || '';
                  return (
                    <div key={indId} style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px 14px',
                      border: '1px solid #e8e8e8',
                      borderRadius: '6px',
                      background: '#fafafa',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#333', marginBottom: '2px' }}>
                          {indicator.name}
                          <span style={{
                            fontSize: '11px',
                            color: '#fff',
                            background: indicator.availableTimeMode === 'daily' ? '#1890ff' : indicator.availableTimeMode === 'monthly' ? '#722ed1' : '#52c41a',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginLeft: '6px',
                          }}>
                            {indicator.availableTimeMode === 'daily' ? '日度' : indicator.availableTimeMode === 'monthly' ? '月度' : '日/月'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          当前值：{indicator.value}{unit}
                        </div>
                      </div>
                      <div style={{ width: '180px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          目标值{unit && ` (${unit})`}
                        </label>
                        <input
                          type="number"
                          value={indicatorTargetValues[indId] || ''}
                          onChange={(e) => setIndicatorTargetValues(prev => ({ ...prev, [indId]: e.target.value }))}
                          placeholder="请输入目标值"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: `1px solid ${indicatorTargetValues[indId] ? '#d9d9d9' : '#ff4d4f'}`,
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 后评估周期（按日/月区分） */}
            {selectedIndicatorIds.length > 0 && (() => {
              const hasDaily = selectedIndicatorIds.some(id => {
                const ind = indicatorModules.flatMap(m => m.indicators).find(i => i.id === id);
                return ind && (ind.availableTimeMode === 'daily' || ind.availableTimeMode === 'both');
              });
              const hasMonthly = selectedIndicatorIds.some(id => {
                const ind = indicatorModules.flatMap(m => m.indicators).find(i => i.id === id);
                return ind && (ind.availableTimeMode === 'monthly' || ind.availableTimeMode === 'both');
              });
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
                    后评估周期
                  </label>
                  {hasDaily && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#333', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        <span style={{
                          fontSize: '11px', color: '#fff', background: '#1890ff',
                          padding: '1px 6px', borderRadius: '4px', marginRight: '4px',
                        }}>日度</span>
                        评估周期
                      </span>
                      <select
                        value={postEvalPeriodDay}
                        onChange={(e) => setPostEvalPeriodDay(e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: '4px', border: '1px solid #d9d9d9',
                          fontSize: '13px', outline: 'none', minWidth: '120px',
                        }}
                      >
                        <option value="7">7天</option>
                        <option value="14">14天</option>
                        <option value="30">30天</option>
                        <option value="45">45天</option>
                        <option value="60">60天</option>
                      </select>
                    </div>
                  )}
                  {hasMonthly && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#333', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        <span style={{
                          fontSize: '11px', color: '#fff', background: '#722ed1',
                          padding: '1px 6px', borderRadius: '4px', marginRight: '4px',
                        }}>月度</span>
                        评估周期
                      </span>
                      <select
                        value={postEvalPeriodMonth}
                        onChange={(e) => setPostEvalPeriodMonth(e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: '4px', border: '1px solid #d9d9d9',
                          fontSize: '13px', outline: 'none', minWidth: '120px',
                        }}
                      >
                        <option value="1">1个月</option>
                        <option value="3">3个月</option>
                        <option value="6">6个月</option>
                        <option value="12">12个月</option>
                      </select>
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px',
                    background: '#f0f5ff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#1677ff',
                  }}>
                    系统将在评估周期到期后自动对比指标当前值与目标值，计算达成率
                  </div>
                </div>
              );
            })()}

            {/* 评估指标选择弹窗 */}
            <IndicatorSelectDialog
              open={indicatorDialogOpen}
              onOpenChange={setIndicatorDialogOpen}
              allowedModuleIds={allowedModuleIds}
              indicatorModules={indicatorModules}
              selectedIds={selectedIndicatorIds}
              onConfirm={(ids) => {
                setSelectedIndicatorIds(ids);
                // 移除未选中指标的目标值
                setIndicatorTargetValues(prev => {
                  const next: Record<string, string> = {};
                  ids.forEach(id => {
                    if (prev[id]) next[id] = prev[id];
                  });
                  return next;
                });
              }}
            />
          </div>
        </CollapsePanel>

        {/* ==================== 6. 派单信息 ==================== */}
        <CollapsePanel
          title="派单信息"
          icon={<Clock style={{ width: '16px', height: '16px', color: '#1677FF' }} />}
          required
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 派发信息 */}
            <div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    派发系统
                  </div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', borderRadius: '6px',
                    border: '1px solid #1677FF', backgroundColor: '#e6f7ff',
                    fontSize: '14px', color: '#1677FF', cursor: 'default',
                  }}>
                    <input type="radio" checked readOnly style={{ accentColor: '#1677FF' }} />
                    网格通
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '4px' }}>当前仅支持网格通系统</span>
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    <span style={{ color: '#ff4d4f', marginRight: '2px' }}>*</span>执行角色
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['地市集运', '网格经理'].map(role => (
                      <label key={role} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '6px',
                        border: `1px solid ${executionRole === role ? '#1677FF' : '#d9d9d9'}`,
                        backgroundColor: executionRole === role ? '#e6f7ff' : '#fff',
                        fontSize: '14px', color: executionRole === role ? '#1677FF' : '#333',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <input
                          type="radio"
                          name="executionRole"
                          checked={executionRole === role}
                          onChange={() => setExecutionRole(role)}
                          style={{ accentColor: '#1677FF' }}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsePanel>

        {/* ==================== 7. 审批信息 ==================== */}
        <CollapsePanel
          title={<span><span style={{ color: '#ff4d4f', marginRight: '2px' }}>*</span>审批信息</span>}
          icon={<CheckCircle style={{ width: '16px', height: '16px', color: '#52c41a' }} />}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
              选择审批人
            </label>
            <select
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: `1px solid ${approver ? '#d9d9d9' : '#ff4d4f'}`,
                fontSize: '14px',
                color: approver ? '#333' : '#999',
                backgroundColor: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">请选择审批人</option>
              {APPROVER_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name} - {opt.role}</option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              请选择具有审批权限的人员，审批人将收到派单审批通知
            </p>
          </div>
        </CollapsePanel>
      </div>

      {/* 确认提交弹窗 */}
      {showConfirmModal && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1100 }}
            onClick={() => setShowConfirmModal(false)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '420px', backgroundColor: '#fff', borderRadius: '12px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)', zIndex: 1101,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: '#e6f7ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: '#1677FF' }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
                确认提交派单？
              </div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                任务将派发至对应人员，请确认信息无误
              </div>
            </div>
            <div style={{
              display: 'flex', gap: '12px', padding: '16px 24px 24px',
              justifyContent: 'center',
            }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '6px',
                  border: '1px solid #d9d9d9', backgroundColor: '#fff',
                  color: '#666', fontSize: '14px', cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '6px',
                  border: 'none', backgroundColor: '#1677FF',
                  color: '#fff', fontSize: '14px', cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                确认提交
              </button>
            </div>
          </div>
        </>
      )}

      {/* 成功提示 */}
      {showSuccess && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: '8px',
          backgroundColor: '#f6ffed', border: '1px solid #b7eb8f',
          color: '#52c41a', fontSize: '15px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1200,
        }}>
          <CheckCircle style={{ width: '18px', height: '18px' }} />
          派单提交成功！正在返回...
        </div>
      )}

      {/* AOI详情弹窗 */}
      <AOIDetailDialog
        open={aoiDetailOpen}
        onOpenChange={setAoiDetailOpen}
        aoi={selectedAOI}
        onCellDetail={(cell) => {
          setPortraitCell(cell);
          setPortraitVisible(true);
        }}
      />

      {/* 小区画像弹窗（Radix Dialog，z-index高于AOI弹窗，关闭按钮由Radix事件系统处理） */}
      <CommunityPortrait
        visible={portraitVisible}
        community={portraitCell}
        onClose={() => setPortraitVisible(false)}
      />

      {/* 新建策略活动弹窗 */}
      <ActivityConfigDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        onSubmitted={() => {
          setActivityDialogOpen(false);
          setConfirmedStrategy({ plan: '新建策略活动', speech: '' });
        }}
      />
    </div>
  );
}
