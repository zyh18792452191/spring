'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Plus, Calendar, Clock, Trash2, GripVertical, Save, SendHorizonal, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ==================== 预警类型+业务类型+约束矩阵配置 ====================

// 预警类型5大类（一级分类）
const ALERT_CATEGORIES = [
  { code: 'retain', name: '保有类', enabled: false },
  { code: 'task', name: '任务类', enabled: true },
  { code: 'remind', name: '提醒类', enabled: false },
  { code: 'effect', name: '效果类', enabled: false },
  { code: 'expire', name: '到期类', enabled: false },
] as const;

// 业务类型（二级分类，从属于任务类）
const BUSINESS_SCENES = [
  { code: 'PORT_OUT', name: '携转预警', theme: '存量运营' },
  { code: 'BROADBAND_CHURN', name: '宽带离网预警', theme: '存量运营' },
  { code: 'GOTONE_CHURN', name: '全球通离网预警', theme: '存量运营' },
  { code: 'COMPLAINT', name: '投诉工单预警', theme: '存量运营' },
  { code: 'HOTLINE_OPP', name: '热线商机预警', theme: '存量运营' },
  { code: 'ABNORMAL', name: '异动客户预警', theme: '存量运营' },
  { code: 'GOTONE_TRACE', name: '全球通客户离网追溯', theme: '存量运营' },
  { code: 'GOTONE_WINBACK', name: '全球通客户停机赢回预警', theme: '存量运营' },
  { code: 'GOTONE_TIELONG', name: '全球通停机客户赢回-铁通预警', theme: '存量运营' },
];

// 推荐话术（按业务类型联动，点击可填入描述框）
const RECOMMENDED_SCRIPTS: Record<string, { title: string; content: string }[]> = {
  PORT_OUT: [
    { title: '携转挽留', content: '尊敬的用户，感谢您长期以来的支持。我们注意到您近期可能有转网需求，特为您准备了专属优惠方案（含流量、话费权益），可保留原号续享，欢迎咨询您的客户经理办理。' },
    { title: '权益告知', content: '您好，我是中国移动客户经理。为回馈老用户，现为您申请了专属权益包（流量扩容+语音赠送），无需转网即可享受，请问是否方便为您开通？' },
  ],
  BROADBAND_CHURN: [
    { title: '续约提醒', content: '尊敬的用户，您的家庭宽带套餐即将到期，为避免影响正常使用，现推出老用户专属续约优惠（含提速和权益赠送），建议您及时办理续费。' },
    { title: '优惠推荐', content: '您好，您的宽带业务将于近期到期，现可享受限时续约礼包，办理后延续原资费并额外赠送提速，请问是否需要为您办理？' },
  ],
  GOTONE_CHURN: [
    { title: '权益回馈', content: '尊敬的全球通用户，感谢您的长期信赖。我们为您准备了全球通专属权益（机场贵宾厅、健康关怀、生日礼包等），无需额外付费即可享受，祝您生活愉快。' },
    { title: '套餐优化', content: '您好，作为全球通会员，我们根据您的使用习惯为您匹配了更优资费方案，同时可领取本月专属权益包，是否需要为您详细介绍？' },
  ],
  COMPLAINT: [
    { title: '致歉安抚', content: '尊敬的用户，非常抱歉给您带来不便。我们已收到您的反馈并加急处理，处理结果将第一时间告知您，感谢您的理解与支持。' },
    { title: '跟进反馈', content: '您好，关于您反映的问题，我们已安排专人跟进核实，预计X个工作日内给您满意答复，如有更多补充信息可随时联系我们。' },
  ],
  HOTLINE_OPP: [
    { title: '商机推荐', content: '您好，我是中国移动客服。根据您的使用需求，为您推荐近期热门的优惠活动（话费返还、流量扩容等），办理简单即办即享，是否需要为您介绍？' },
    { title: '限时活动', content: '尊敬的用户，现有一项专为您定制的限时优惠活动，名额有限先到先得，您是否有兴趣了解详情？' },
  ],
  ABNORMAL: [
    { title: '异动关怀', content: '尊敬的用户，我们关注到您近期消费情况有所变化，为帮助您合理规划资费，特为您提供专属套餐匹配建议，帮您节省不必要的支出。' },
    { title: '方案匹配', content: '您好，根据您的使用习惯，我们为您推荐了更合适的资费方案（月费更低、权益更多），是否需要为您办理？' },
  ],
  GOTONE_TRACE: [
    { title: '回馈挽留', content: '尊敬的用户，感谢您一直以来对全球通品牌的支持。我们为您准备了一份专属回馈礼包，同时可为您优化当前套餐，确保您用得舒心、省心。' },
    { title: '升级权益', content: '您好，经核实您为全球通长期优质客户，现可享受专属升级权益（流量翻倍、增值业务免费体验等），请问是否需要为您开通？' },
  ],
  GOTONE_WINBACK: [
    { title: '停机提醒', content: '尊敬的用户，您的号码因欠费已停机，为避免号码被回收造成不便，建议您尽快充值恢复使用，充值后可享话费返还优惠。' },
    { title: '复机礼包', content: '您好，您的号码目前处于停机状态，为保障您的正常通信，建议及时缴费。现推出停机用户专属复机礼包，复机即享，请尽快办理。' },
  ],
  GOTONE_TIELONG: [
    { title: '停机复通', content: '尊敬的用户，您的家庭宽带/固话业务因欠费停机，为避免影响正常使用，建议及时缴费复机，复机后可享专属权益。' },
    { title: '缴费引导', content: '您好，您的家庭通信业务当前停机，现为您提供便捷缴费通道及复机礼包，请尽快办理以免影响使用。' },
  ],
  '': [
    { title: '通用关怀', content: '尊敬的用户，感谢您长期以来对中国移动的支持，我们为您准备了专属优惠，欢迎随时咨询办理。' },
    { title: '客户经理问候', content: '您好，我是中国移动客户经理，为回馈老用户，现有一项专属权益请您查收，请问是否方便为您介绍？' },
  ],
};

// 执行模式（4种）
const EXECUTION_MODES = [
  { code: 'subcontract', name: '分包看管执行' },
  { code: 'online', name: '在线执行' },
  { code: 'online_subcontract', name: '在线+分包看管执行' },
  { code: 'custom', name: '自定义' },
];

// 执行角色（6种）
const EXECUTION_ROLES = [
  { code: '10086', name: '10086' },
  { code: 'grid_manager', name: '网格经理' },
  { code: '10088', name: '10088' },
  { code: 'enterprise_manager', name: '政企客户经理' },
  { code: 'central_dispatch', name: '地市集运' },
  { code: 'tietong_grid', name: '铁通随销-网格通' },
];

// 角色状态：selectable=可选 | default_on=默认选中可选 | greyed_off=置灰未选 | greyed_on=置灰选中 | hidden=不展示
type RoleState = 'selectable' | 'default_on' | 'greyed_off' | 'greyed_on' | 'hidden';

// 单个执行模式下的约束
interface ModeConstraint {
  code: string;
  selectable: boolean;
  defaultSelected: boolean;
  greyed: boolean;
  roles: Record<string, RoleState>;
  mutualExclusion?: [string, string][];
}

// 业务类型完整约束配置（按客户类型+执行模式）
interface SceneConfig {
  allowedCustomerTypes: string[];
  lockedCustomerType?: string;
  hasExecutionMode: boolean;
  customers: Record<string, { modes: ModeConstraint[] }>;
}

// ===== 9大业务类型约束矩阵 =====
const SCENE_CONFIGS: Record<string, SceneConfig> = {
  PORT_OUT: {
    allowedCustomerTypes: ['全球通客户', '腰部客户', '其他客户', '全量客户'],
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable' } },
        { code: 'online', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_on', grid_manager: 'greyed_off', '10088': 'greyed_off', enterprise_manager: 'greyed_off' } },
        { code: 'online_subcontract', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_on', grid_manager: 'default_on', '10088': 'selectable', enterprise_manager: 'selectable' } },
        { code: 'custom', selectable: true, defaultSelected: false, greyed: false, roles: {} },
      ]},
      all: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable' } },
        { code: 'online', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_on', grid_manager: 'greyed_off', '10088': 'greyed_off', enterprise_manager: 'greyed_off' } },
        { code: 'online_subcontract', selectable: true, defaultSelected: false, greyed: false, roles: { '10086': 'greyed_on', grid_manager: 'default_on', '10088': 'selectable', enterprise_manager: 'selectable' } },
        { code: 'custom', selectable: true, defaultSelected: false, greyed: false, roles: {} },
      ]},
      middle: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'greyed_on', '10088': 'greyed_off', enterprise_manager: 'greyed_off' } },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      other: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'greyed_on', '10088': 'greyed_off', enterprise_manager: 'greyed_off' } },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  BROADBAND_CHURN: {
    allowedCustomerTypes: ['全球通客户', '腰部客户', '其他客户', '全量客户'],
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      all: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      middle: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      other: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  GOTONE_CHURN: {
    allowedCustomerTypes: ['全球通客户'],
    lockedCustomerType: '全球通客户',
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  COMPLAINT: {
    allowedCustomerTypes: ['全球通客户'],
    lockedCustomerType: '全球通客户',
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'selectable' } },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  HOTLINE_OPP: {
    allowedCustomerTypes: ['全球通客户', '腰部客户', '其他客户', '全量客户'],
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      middle: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      other: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      all: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'greyed_off', enterprise_manager: 'greyed_off', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  ABNORMAL: {
    allowedCustomerTypes: ['全球通客户', '腰部客户', '其他客户', '全量客户'],
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      middle: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      other: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
      all: { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  GOTONE_TRACE: {
    allowedCustomerTypes: ['全球通客户'],
    lockedCustomerType: '全球通客户',
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'default_on', '10088': 'selectable', enterprise_manager: 'selectable' } },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  GOTONE_WINBACK: {
    allowedCustomerTypes: ['全球通客户'],
    lockedCustomerType: '全球通客户',
    hasExecutionMode: true,
    customers: {
      '全球通客户': { modes: [
        { code: 'subcontract', selectable: true, defaultSelected: true, greyed: true, roles: { '10086': 'greyed_off', grid_manager: 'selectable', '10088': 'selectable', enterprise_manager: 'selectable', central_dispatch: 'selectable' }, mutualExclusion: [['grid_manager', 'central_dispatch']] },
        { code: 'online', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'online_subcontract', selectable: false, defaultSelected: false, greyed: true, roles: {} },
        { code: 'custom', selectable: false, defaultSelected: false, greyed: true, roles: {} },
      ]},
    },
  },
  GOTONE_TIELONG: {
    allowedCustomerTypes: ['全球通客户'],
    lockedCustomerType: '全球通客户',
    hasExecutionMode: false,
    customers: {
      '全球通客户': { modes: [] },
    },
  },
};

const RULE_LIBRARY = [
  { id: 1, name: 'ARPU值', category: '指标', tags: ['价值'], valueType: 'number' as const },
  { id: 2, name: 'DOU月均流量(MB)', category: '指标', tags: ['流量'], valueType: 'number' as const },
  { id: 3, name: 'MOU通话分钟数', category: '指标', tags: ['语音'], valueType: 'number' as const },
  { id: 4, name: '宽带零流量天数', category: '指标', tags: ['宽带'], valueType: 'number' as const },
  { id: 5, name: '携转倾向评分', category: '标签', tags: ['携转'], valueType: 'number' as const },
  { id: 6, name: '近30天查询携转次数', category: '标签', tags: ['携转'], valueType: 'number' as const },
  { id: 7, name: '竞对套餐匹配度(%)', category: '标签', tags: ['携转'], valueType: 'number' as const },
  { id: 8, name: '是否宽带到期', category: '标签', tags: ['宽带'], valueType: 'boolean' as const },
  { id: 9, name: '是否全球通客户', category: '标签', tags: ['全球通'], valueType: 'boolean' as const },
  { id: 10, name: '投诉工单次数', category: '标签', tags: ['投诉'], valueType: 'number' as const },
  { id: 11, name: '热线商机意向等级', category: '标签', tags: ['商机'], valueType: 'enum' as const, options: ['高', '中', '低'] },
  { id: 12, name: '消费异动月均降幅(%)', category: '标签', tags: ['异动'], valueType: 'number' as const },
  { id: 13, name: '在网时长(月)', category: '指标', tags: ['价值'], valueType: 'number' as const },
  { id: 14, name: '是否政企客户关键人', category: '标签', tags: ['全球通'], valueType: 'boolean' as const },
  { id: 15, name: '是否白金卡/钻卡/金卡', category: '标签', tags: ['全球通'], valueType: 'boolean' as const },
  { id: 16, name: '是否宽带用户', category: '标签', tags: ['宽带'], valueType: 'boolean' as const },
];

// 16地州
const CITIES = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];

type AlertMode = 'indicator' | 'task';

function NewAlertRuleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id'); // 编辑模式：URL带id参数
  const isEditMode = !!editId;
  const urlType = searchParams.get('type') as AlertMode | null; // 从哪个Tab进来的
  const [alertMode] = useState<AlertMode>(urlType === 'task' ? 'task' : 'indicator');

  // ============ 指标预警状态（原有，不动） ============
  const [alertName, setAlertName] = useState('');
  const [metricGroup, setMetricGroup] = useState('');
  const [alertLevel, setAlertLevel] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('新疆');
  const [granularity, setGranularity] = useState('');
  const [scope, setScope] = useState('');
  const [frequency, setFrequency] = useState('天');
  const [reminderTime, setReminderTime] = useState('');
  const [sendSms, setSendSms] = useState<'yes' | 'no'>('no');
  const [reminderDays, setReminderDays] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [rules, setRules] = useState([
    { id: 1, metric: '', ruleType: '按指标值计算', operator: '', value: '', logic: '且' },
  ]);

  // ============ 任务预警状态 ============
  const [taskAlertName, setTaskAlertName] = useState('');
  const [alertCategory, setAlertCategory] = useState('task');
  const [taskBusinessScene, setTaskBusinessScene] = useState('');
  const [taskCustomerType, setTaskCustomerType] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [taskBusinessTheme, setTaskBusinessTheme] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  // 执行周期模式：naturalMonth自然月 / timeRange时间段 / naturalDay自然天
  const [taskPeriodMode, setTaskPeriodMode] = useState<'naturalMonth' | 'timeRange' | 'naturalDay'>('timeRange');
  const [taskStartMonth, setTaskStartMonth] = useState('');
  const [taskEndMonth, setTaskEndMonth] = useState('');
  const [taskDayCount, setTaskDayCount] = useState('7');
  // 话术内容（独立于描述，支持推荐话术与自定义）
  const [taskScript, setTaskScript] = useState('');

  // 规则阈值类型
  type ThresholdType = 'number' | 'boolean' | 'enum' | 'text';
  interface RuleThreshold {
    operator: string;  // > < >= <= = ≠ 包含 不包含
    value: string;     // 阈值
  }
  interface BranchRule {
    ruleId: number;
    threshold: RuleThreshold;
  }

  // 预警规则（多分支并集）
  const [branches, setBranches] = useState<{ id: number; rules: BranchRule[] }[]>([{ id: 1, rules: [] }]);
  const [activeBranchId, setActiveBranchId] = useState(1);
  const [ruleSearchText, setRuleSearchText] = useState('');
  const [ruleCategory, setRuleCategory] = useState('全量客户');
  const [updateCycleType, setUpdateCycleType] = useState('daily');
  const [updateCycleHour, setUpdateCycleHour] = useState('09');
  const [updateCycleMinute, setUpdateCycleMinute] = useState('00');
  const [updateCycleWeekDay, setUpdateCycleWeekDay] = useState('1');
  const [updateCycleMonthDay, setUpdateCycleMonthDay] = useState('1');

  // 执行配置
  const [executionMode, setExecutionMode] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({});
  const [cityModes, setCityModes] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    CITIES.forEach((c) => { m[c] = 'subcontract'; });
    return m;
  });
  // 自定义模式下每个地州的执行角色选中状态
  const [cityRoles, setCityRoles] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    CITIES.forEach((c) => { m[c] = {}; });
    return m;
  });

  // 获取当前业务类型配置
  const currentSceneConfig = taskBusinessScene ? SCENE_CONFIGS[taskBusinessScene] : null;
  const currentCustomerConfig = currentSceneConfig?.customers[taskCustomerType] ?? null;
  const currentModeIdx = EXECUTION_MODES.findIndex((m) => m.code === executionMode);
  const currentModeConstraint = currentCustomerConfig?.modes[currentModeIdx] ?? null;
  const isTietongScene = taskBusinessScene === 'GOTONE_TIELONG';

  // 业务类型变更时联动
  const handleSceneChange = (sceneCode: string) => {
    setTaskBusinessScene(sceneCode);
    const scene = BUSINESS_SCENES.find((s) => s.code === sceneCode);
    if (scene) setTaskBusinessTheme(scene.theme);
    const config = SCENE_CONFIGS[sceneCode];
    if (config?.lockedCustomerType) {
      setTaskCustomerType(config.lockedCustomerType);
    } else if (config) {
      setTaskCustomerType(config.allowedCustomerTypes[0]);
    } else {
      setTaskCustomerType('');
    }
    setExecutionMode('');
    setSelectedRoles({});
  };

  // 客户类型变更时重置执行配置
  const handleCustomerTypeChange = (ct: string) => {
    setTaskCustomerType(ct);
    setExecutionMode('');
    setSelectedRoles({});
  };

  // 执行模式变更时联动角色
  const handleModeChange = (modeCode: string) => {
    setExecutionMode(modeCode);
    if (modeCode === 'custom') {
      setSelectedRoles({});
      return;
    }
    const modeIdx = EXECUTION_MODES.findIndex((m) => m.code === modeCode);
    const constraint = currentSceneConfig?.customers[taskCustomerType]?.modes[modeIdx];
    if (constraint) {
      const newRoles: Record<string, boolean> = {};
      Object.entries(constraint.roles).forEach(([role, state]) => {
        newRoles[role] = state === 'default_on' || state === 'greyed_on';
      });
      setSelectedRoles(newRoles);
    } else {
      setSelectedRoles({});
    }
  };

  // 角色互斥处理
  const handleRoleToggle = (roleCode: string) => {
    const newRoles = { ...selectedRoles, [roleCode]: !selectedRoles[roleCode] };
    const modeIdx = EXECUTION_MODES.findIndex((m) => m.code === executionMode);
    const constraint = currentSceneConfig?.customers[taskCustomerType]?.modes[modeIdx];
    if (constraint?.mutualExclusion) {
      for (const [a, b] of constraint.mutualExclusion) {
        if (roleCode === a && newRoles[a]) { newRoles[b] = false; }
        if (roleCode === b && newRoles[b]) { newRoles[a] = false; }
      }
    }
    setSelectedRoles(newRoles);
  };

  // 规则筛选
  const filteredRules = RULE_LIBRARY.filter((r) => {
    if (ruleSearchText && !r.name.includes(ruleSearchText)) return false;
    if (ruleCategory !== '全量客户' && r.category !== ruleCategory) return false;
    return true;
  });

  // 添加/移除分支
  const addBranch = () => {
    const newId = Date.now();
    setBranches([...branches, { id: newId, rules: [] }]);
    setActiveBranchId(newId);
  };
  const removeBranch = (id: number) => {
    if (branches.length <= 1) return;
    setBranches(branches.filter((b) => b.id !== id));
    if (activeBranchId === id) setActiveBranchId(branches[0].id);
  };

  // 分支内添加/移除规则
  const toggleRuleInBranch = (ruleId: number) => {
    const rule = RULE_LIBRARY.find((r) => r.id === ruleId);
    if (!rule) return;
    setBranches(branches.map((b) => {
      if (b.id !== activeBranchId) return b;
      const exists = b.rules.find((r) => r.ruleId === ruleId);
      if (exists) {
        return { ...b, rules: b.rules.filter((r) => r.ruleId !== ruleId) };
      } else {
        const defaultOperator = rule.valueType === 'boolean' ? '=' : rule.valueType === 'enum' ? '=' : '>';
        return { ...b, rules: [...b.rules, { ruleId, threshold: { operator: defaultOperator, value: '' } }] };
      }
    }));
  };

  const updateBranchRuleThreshold = (branchId: number, ruleId: number, field: keyof RuleThreshold, value: string) => {
    setBranches(branches.map((b) => {
      if (b.id !== branchId) return b;
      return { ...b, rules: b.rules.map((r) => r.ruleId === ruleId ? { ...r, threshold: { ...r.threshold, [field]: value } } : r) };
    }));
  };

  // 指标预警原方法
  const addRule = () => {
    setRules([...rules, { id: Date.now(), metric: '', ruleType: '按指标值计算', operator: '', value: '', logic: '且' }]);
  };
  const removeRule = (id: number) => {
    if (rules.length > 1) setRules(rules.filter((rule) => rule.id !== id));
  };
  const updateRule = (id: number, field: string, value: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  // 推荐话术：跟随表单业务类型联动展示（未选时展示通用话术）
  const currentScripts = taskBusinessScene
    ? (RECOMMENDED_SCRIPTS[taskBusinessScene] ?? RECOMMENDED_SCRIPTS[''])
    : RECOMMENDED_SCRIPTS[''];

  // 点击推荐话术填入话术内容（可拼接多条）
  const appendScript = (content: string) => {
    setTaskScript((prev) => (prev ? `${prev}\n${content}` : content));
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-full">
      {/* 页面标题 */}
      <div className="px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-semibold text-gray-900">{isEditMode ? '编辑规则' : '新增规则'}</h1>
      </div>

      {/* 预警模式标识 */}
      <div className="px-6 pt-4">
        <Badge variant="secondary" className="bg-[#0085D0]/10 text-[#0085D0] text-sm px-3 py-1">
          {alertMode === 'indicator' ? '指标预警' : '任务预警'}
        </Badge>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        {alertMode === 'indicator' ? (
          <>
            {/* ===== 指标预警表单（原有，不动） ===== */}
            {/* 基本信息 */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">基本信息</h2>
              </div>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警名称</Label>
                    <Input placeholder="请输入" value={alertName} onChange={(e) => setAlertName(e.target.value)} className="mt-1.5 h-9" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 关联指标组</Label>
                    <Select value={metricGroup} onValueChange={setMetricGroup}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="拍照中高端升档增收价值">拍照中高端升档增收价值</SelectItem>
                        <SelectItem value="客户离网风险预警">客户离网风险预警</SelectItem>
                        <SelectItem value="ARPU下降预警">ARPU下降预警</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警等级</Label>
                    <Select value={alertLevel} onValueChange={setAlertLevel}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择预警等级" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="红色预警">红色预警</SelectItem>
                        <SelectItem value="橙色预警">橙色预警</SelectItem>
                        <SelectItem value="黄色预警">黄色预警</SelectItem>
                        <SelectItem value="蓝色预警">蓝色预警</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 归属区域</Label>
                    <Select value={region} onValueChange={setRegion} disabled>
                      <SelectTrigger className="mt-1.5 h-9 bg-gray-50"><SelectValue placeholder="请选择归属区域" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="新疆">新疆</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警粒度</Label>
                    <Select value={granularity} onValueChange={setGranularity}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择预警粒度" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="集团">集团</SelectItem>
                        <SelectItem value="省份">地州</SelectItem>
                        <SelectItem value="地市">地市</SelectItem>
                        <SelectItem value="区县">区县</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警范围</Label>
                    <Select value={scope} onValueChange={setScope}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择预警范围" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全国">全国</SelectItem>
                        <SelectItem value="集团">集团</SelectItem>
                        <SelectItem value="省域">省域</SelectItem>
                        <SelectItem value="地市">地市</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警规则描述</Label>
                    <Textarea placeholder="请输入" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 min-h-24" />
                  </div>
                </div>
              </Card>
            </div>
            {/* 预警提醒 */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">预警提醒</h2>
              </div>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 提醒频率</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="天">天</SelectItem>
                        <SelectItem value="周">周</SelectItem>
                        <SelectItem value="月">月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 提醒时间</Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择提醒时间" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 提醒日期</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm text-gray-600">每</span>
                      <Input placeholder="多少" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className="h-9" />
                      <span className="text-sm text-gray-600">天</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 生效日期</Label>
                    <div className="relative mt-1.5">
                      <Input type="date" placeholder="请选择生效日期" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="h-9" />
                      <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 是否发送短信</Label>
                    <div className="flex items-center gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="sendSms" value="yes" checked={sendSms === 'yes'} onChange={(e) => setSendSms(e.target.value as 'yes' | 'no')} className="w-4 h-4 text-[#0085D0]" />
                        <span className="text-sm text-gray-700">是</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="sendSms" value="no" checked={sendSms === 'no'} onChange={(e) => setSendSms(e.target.value as 'yes' | 'no')} className="w-4 h-4 text-[#0085D0]" />
                        <span className="text-sm text-gray-700">否</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            {/* 预警规则 */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">预警规则</h2>
              </div>
              <Card className="p-6">
                <div className="flex justify-end mb-4">
                  <Button className="bg-[#0085D0] hover:bg-[#006BB0]"><Plus className="w-4 h-4 mr-1" />添加</Button>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_140px_60px] gap-3 mb-3 pb-2 border-b">
                  <div className="text-sm font-medium text-gray-700">预警指标</div>
                  <div className="text-sm font-medium text-gray-700">规则类型</div>
                  <div className="text-sm font-medium text-gray-700">计算规则</div>
                  <div className="text-sm font-medium text-gray-700">数值</div>
                  <div className="text-sm font-medium text-gray-700 text-center">操作</div>
                </div>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="grid grid-cols-[1fr_1fr_1fr_140px_60px] gap-3 items-center">
                      <Select value={rule.metric} onValueChange={(value) => updateRule(rule.id, 'metric', value)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="请选择预警指标" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="离网客户数">离网客户数</SelectItem>
                          <SelectItem value="ARPU">ARPU</SelectItem>
                          <SelectItem value="DOU">DOU</SelectItem>
                          <SelectItem value="MOU">MOU</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={rule.ruleType} onValueChange={(value) => updateRule(rule.id, 'ruleType', value)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="按指标值计算">按指标值计算</SelectItem>
                          <SelectItem value="按变化率计算">按变化率计算</SelectItem>
                          <SelectItem value="按排名计算">按排名计算</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, 'operator', value)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="小于">小于</SelectItem>
                          <SelectItem value="大于">大于</SelectItem>
                          <SelectItem value="大于等于">大于等于</SelectItem>
                          <SelectItem value="等于">等于</SelectItem>
                          <SelectItem value="小于等于">小于等于</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="请输入" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)} className="h-9" />
                      <div className="flex justify-center">
                        <Button variant="ghost" onClick={() => removeRule(rule.id)} className="text-gray-600 hover:text-gray-900 p-0 h-9">删除</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* ===== 任务预警表单（精益融合4模块） ===== */}

            {/* 模块一：预警信息 */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">预警信息</h2>
              </div>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警名称</Label>
                    <div className="relative mt-1.5">
                      <Input placeholder="请输入" value={taskAlertName} onChange={(e) => setTaskAlertName(e.target.value)} maxLength={20} className="h-9 pr-14" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{taskAlertName.length}/20</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 预警类型</Label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {ALERT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.code}
                          className={cn(
                            'px-4 py-1.5 rounded-md text-sm border transition-colors',
                            alertCategory === cat.code
                              ? 'bg-[#0085D0] text-white border-[#0085D0]'
                              : cat.enabled
                                ? 'bg-white text-gray-700 border-gray-300 hover:border-[#0085D0] hover:text-[#0085D0]'
                                : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                          )}
                          disabled={!cat.enabled}
                          onClick={() => cat.enabled && setAlertCategory(cat.code)}
                        >
                          {cat.name}
                          {!cat.enabled && <span className="ml-1 text-xs">(未启用)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 业务专题</Label>
                    <Select value={taskBusinessTheme} onValueChange={setTaskBusinessTheme}>
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue placeholder="请选择业务专题" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="存量运营">存量运营</SelectItem>
                        <SelectItem value="合约续约" disabled>合约续约（暂无业务类型）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 业务类型</Label>
                    <Select value={taskBusinessScene} onValueChange={handleSceneChange}>
                      <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择业务类型" /></SelectTrigger>
                      <SelectContent>
                        {BUSINESS_SCENES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 客户类型</Label>
                    {currentSceneConfig?.lockedCustomerType ? (
                      <Input value={currentSceneConfig.lockedCustomerType} disabled className="mt-1.5 h-9 bg-gray-50" />
                    ) : (
                      <Select value={taskCustomerType} onValueChange={handleCustomerTypeChange} disabled={!taskBusinessScene}>
                        <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="请选择客户类型" /></SelectTrigger>
                        <SelectContent>
                          {currentSceneConfig?.allowedCustomerTypes.map((ct) => (
                            <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {currentSceneConfig?.lockedCustomerType && (
                      <p className="text-xs text-gray-400 mt-1">该业务类型客户类型固定为全球通客户，不可修改</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 执行周期</Label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {([
                        { code: 'naturalMonth', name: '自然月' },
                        { code: 'timeRange', name: '时间段' },
                        { code: 'naturalDay', name: '自然天' },
                      ] as const).map((mode) => (
                        <button
                          key={mode.code}
                          className={cn(
                            'px-4 py-1.5 rounded-md text-sm border transition-colors',
                            taskPeriodMode === mode.code
                              ? 'bg-[#0085D0] text-white border-[#0085D0]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#0085D0] hover:text-[#0085D0]'
                          )}
                          onClick={() => setTaskPeriodMode(mode.code)}
                        >
                          {mode.name}
                        </button>
                      ))}
                    </div>
                    {/* 动态配置区：按所选模式展示对应配置项 */}
                    <div className="mt-2">
                      {taskPeriodMode === 'naturalMonth' && (
                        <div className="flex items-center gap-2">
                          <Input type="month" value={taskStartMonth} onChange={(e) => setTaskStartMonth(e.target.value)} className="h-9 flex-1" />
                          <span className="text-sm text-gray-500">至</span>
                          <Input type="month" value={taskEndMonth} onChange={(e) => setTaskEndMonth(e.target.value)} className="h-9 flex-1" />
                        </div>
                      )}
                      {taskPeriodMode === 'timeRange' && (
                        <div className="flex items-center gap-2">
                          <Input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className="h-9 flex-1" />
                          <span className="text-sm text-gray-500">至</span>
                          <Input type="date" value={taskEndDate} onChange={(e) => setTaskEndDate(e.target.value)} className="h-9 flex-1" />
                        </div>
                      )}
                      {taskPeriodMode === 'naturalDay' && (
                        <div className="flex items-center gap-2">
                          <Input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className="h-9 flex-1" />
                          <span className="text-sm text-gray-500">起，共执行</span>
                          <Input type="number" min={1} max={30} value={taskDayCount} onChange={(e) => setTaskDayCount(e.target.value)} className="h-9 w-20" />
                          <span className="text-sm text-gray-500">个自然日</span>
                        </div>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Clock className="w-3 h-3" />规则到期前5天将发送提醒给用户，请注意查收
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700">描述</Label>
                    <textarea
                      placeholder="请输入预警描述"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="mt-1.5 w-full border rounded-md px-3 py-2 text-sm min-h-[60px] resize-y focus:outline-none focus:ring-1 focus:ring-[#0085D0]"
                    />
                  </div>
                  {/* 话术内容：独立字段，支持推荐话术与自定义 */}
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-700">话术内容</Label>
                    <textarea
                      placeholder="请输入话术内容，或点击下方推荐话术自动填入（可拼接多条）"
                      value={taskScript}
                      onChange={(e) => setTaskScript(e.target.value)}
                      className="mt-1.5 w-full border rounded-md px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-[#0085D0]"
                    />
                    {/* 推荐话术助手：跟随表单业务类型联动，点击填入话术内容 */}
                    <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/40 p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <MessageSquareText className="w-3.5 h-3.5 text-[#0085D0]" />
                          <span className="text-xs font-medium text-gray-600">推荐话术</span>
                          <span className="text-xs text-gray-400">（点击填入话术内容，可拼接多条）</span>
                        </div>
                        {taskScript && (
                          <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setTaskScript('')}>
                            清空
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentScripts.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            title="点击填入话术内容"
                            onClick={() => appendScript(s.content)}
                            className="max-w-full text-left bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-600 hover:border-[#0085D0] hover:text-[#0085D0] transition-colors"
                          >
                            <span className="text-[#0085D0] font-medium mr-1">[{s.title}]</span>
                            {s.content}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 模块二：预警规则（多分支并集） */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">预警规则</h2>
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="flex" style={{ minHeight: 300 }}>
                  {/* 左侧规则选择栏 */}
                  <div className="w-64 border-r p-4 flex flex-col">
                    <Input
                      placeholder="搜索规则"
                      value={ruleSearchText}
                      onChange={(e) => setRuleSearchText(e.target.value)}
                      className="h-8 mb-3"
                    />
                    <div className="flex gap-1 mb-3">
                      {['全量客户', '指标', '标签'].map((cat) => (
                        <button
                          key={cat}
                          className={cn(
                            'px-3 py-1 rounded text-xs',
                            ruleCategory === cat ? 'bg-[#0085D0] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                          onClick={() => setRuleCategory(cat)}
                        >
                          {cat === '全量客户' ? '全部' : cat}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {filteredRules.map((r) => {
                        const activeBranch = branches.find((b) => b.id === activeBranchId);
                        const isInActiveBranch = activeBranch?.rules.some((br) => br.ruleId === r.id) ?? false;
                        return (
                          <div
                            key={r.id}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm',
                              isInActiveBranch ? 'bg-blue-50 text-[#0085D0]' : 'hover:bg-gray-50 text-gray-700'
                            )}
                            onClick={() => toggleRuleInBranch(r.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isInActiveBranch}
                              onChange={() => toggleRuleInBranch(r.id)}
                              className="w-4 h-4 rounded"
                            />
                            <span className="flex-1 truncate">{r.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* 右侧分支编排画布 */}
                  <div className="flex-1 p-4">
                    {branches.every((b) => b.rules.length === 0) ? (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        请从左侧选择规则，已选规则将以"并集分支+交集组合"方式展示
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">规则编排</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>分支间=<Badge variant="secondary" className="text-xs">OR 并集</Badge></span>
                            <span>分支内=<Badge variant="secondary" className="text-xs">AND 交集</Badge></span>
                          </div>
                        </div>
                        {branches.map((branch, bIdx) => {
                          return (
                            <div key={branch.id} className={cn(
                              'border rounded-lg p-3',
                              activeBranchId === branch.id ? 'bg-blue-50/50 border-[#0085D0]' : 'bg-gray-50/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={cn('text-white text-xs', activeBranchId === branch.id ? 'bg-[#0085D0]' : 'bg-gray-400')}>分支 {bIdx + 1}</Badge>
                                <span className="text-xs text-gray-500">以下条件同时满足(AND)</span>
                                <div className="flex-1" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 text-gray-400 hover:text-[#0085D0]"
                                  onClick={() => setActiveBranchId(branch.id)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                {branches.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 text-gray-400 hover:text-red-500"
                                    onClick={() => removeBranch(branch.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              {branch.rules.length === 0 ? (
                                <div className="text-xs text-gray-400 py-2 text-center">请从左侧选择规则加入此分支</div>
                              ) : (
                                <div className="space-y-2">
                                  {branch.rules.map((br) => {
                                    const ruleDef = RULE_LIBRARY.find((r) => r.id === br.ruleId);
                                    if (!ruleDef) return null;
                                    const numOps = ['>', '<', '≥', '≤', '=', '≠'];
                                    const boolOps = ['='];
                                    const enumOps = ['=', '≠'];
                                    const operators = ruleDef.valueType === 'number' ? numOps : ruleDef.valueType === 'boolean' ? boolOps : enumOps;
                                    return (
                                      <div key={br.ruleId} className="bg-white rounded px-3 py-2 border">
                                        <div className="flex items-center gap-2">
                                          <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                                          <Badge variant="outline" className="text-xs shrink-0">{ruleDef.category}</Badge>
                                          <span className="text-sm text-gray-800 shrink-0">{ruleDef.name}</span>
                                          {/* 运算符 */}
                                          <Select value={br.threshold.operator} onValueChange={(val) => {
                                            setBranches(branches.map((b) =>
                                              b.id === branch.id ? {
                                                ...b,
                                                rules: b.rules.map((r) => r.ruleId === br.ruleId ? { ...r, threshold: { ...r.threshold, operator: val } } : r)
                                              } : b
                                            ));
                                          }}>
                                            <SelectTrigger className="w-16 h-7 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                              {operators.map((op) => (
                                                <SelectItem key={op} value={op} className="text-xs">{op}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          {/* 阈值 */}
                                          {ruleDef.valueType === 'number' && (
                                            <Input
                                              type="number"
                                              className="w-20 h-7 text-xs"
                                              placeholder="阈值"
                                              value={br.threshold.value}
                                              onChange={(e) => {
                                                setBranches(branches.map((b) =>
                                                  b.id === branch.id ? {
                                                    ...b,
                                                    rules: b.rules.map((r) => r.ruleId === br.ruleId ? { ...r, threshold: { ...r.threshold, value: e.target.value } } : r)
                                                  } : b
                                                ));
                                              }}
                                            />
                                          )}
                                          {ruleDef.valueType === 'boolean' && (
                                            <div className="flex items-center gap-2">
                                              <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                <input type="radio" name={`bool-${branch.id}-${br.ruleId}`} checked={br.threshold.value === '是'} onChange={() => {
                                                  setBranches(branches.map((b) =>
                                                    b.id === branch.id ? {
                                                      ...b,
                                                      rules: b.rules.map((r) => r.ruleId === br.ruleId ? { ...r, threshold: { ...r.threshold, value: '是' } } : r)
                                                    } : b
                                                  ));
                                                }} className="accent-[#0085D0]" /> 是
                                              </label>
                                              <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                <input type="radio" name={`bool-${branch.id}-${br.ruleId}`} checked={br.threshold.value === '否'} onChange={() => {
                                                  setBranches(branches.map((b) =>
                                                    b.id === branch.id ? {
                                                      ...b,
                                                      rules: b.rules.map((r) => r.ruleId === br.ruleId ? { ...r, threshold: { ...r.threshold, value: '否' } } : r)
                                                    } : b
                                                  ));
                                                }} className="accent-[#0085D0]" /> 否
                                              </label>
                                            </div>
                                          )}
                                          {ruleDef.valueType === 'enum' && ruleDef.options && (
                                            <Select value={br.threshold.value} onValueChange={(val) => {
                                              setBranches(branches.map((b) =>
                                                b.id === branch.id ? {
                                                  ...b,
                                                  rules: b.rules.map((r) => r.ruleId === br.ruleId ? { ...r, threshold: { ...r.threshold, value: val } } : r)
                                                } : b
                                              ));
                                            }}>
                                              <SelectTrigger className="w-20 h-7 text-xs"><SelectValue placeholder="选择值" /></SelectTrigger>
                                              <SelectContent>
                                                {ruleDef.options.map((opt) => (
                                                  <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}
                                          <div className="flex-1" />
                                          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-red-500 shrink-0" onClick={() => {
                                            setBranches(branches.map((b) =>
                                              b.id === branch.id ? { ...b, rules: b.rules.filter((r) => r.ruleId !== br.ruleId) } : b
                                            ));
                                          }}>
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {bIdx < branches.length - 1 && (
                                <div className="flex items-center justify-center mt-3 mb-1">
                                  <div className="px-3 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded">OR</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addBranch}>
                          <Plus className="w-4 h-4 mr-1" />添加分支(OR)
                        </Button>
                      </div>
                    )}
                    {/* 更新周期 */}
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 更新周期</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Select value={updateCycleType} onValueChange={setUpdateCycleType}>
                          <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">实时</SelectItem>
                            <SelectItem value="daily">日</SelectItem>
                            <SelectItem value="weekly">周</SelectItem>
                            <SelectItem value="monthly">月</SelectItem>
                          </SelectContent>
                        </Select>
                        {updateCycleType === 'daily' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">每日</span>
                            <Select value={updateCycleHour} onValueChange={setUpdateCycleHour}>
                              <SelectTrigger className="w-16 h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                                  <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">:</span>
                            <Select value={updateCycleMinute} onValueChange={setUpdateCycleMinute}>
                              <SelectTrigger className="w-16 h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['00', '15', '30', '45'].map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {updateCycleType === 'weekly' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">每周</span>
                            <Select value={updateCycleWeekDay} onValueChange={setUpdateCycleWeekDay}>
                              <SelectTrigger className="w-20 h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['一', '二', '三', '四', '五', '六', '日'].map((d, i) => (
                                  <SelectItem key={String(i + 1)} value={String(i + 1)}>周{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {updateCycleType === 'monthly' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">每月</span>
                            <Select value={updateCycleMonthDay} onValueChange={setUpdateCycleMonthDay}>
                              <SelectTrigger className="w-20 h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => String(i + 1)).map((d) => (
                                  <SelectItem key={d} value={d}>{d}号</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 模块三：执行配置 */}
            {!isTietongScene && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                  <h2 className="text-base font-semibold text-gray-900">执行配置</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* 执行模式 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 执行模式</Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {EXECUTION_MODES.map((mode) => {
                          const modeConstraint = currentCustomerConfig?.modes.find((m) => m.code === mode.code);
                          const selectable = modeConstraint?.selectable ?? false;
                          const defaultSelected = modeConstraint?.defaultSelected ?? false;
                          const greyed = modeConstraint?.greyed ?? true;
                          return (
                            <button
                              key={mode.code}
                              className={cn(
                                'px-4 py-2 rounded-md text-sm border transition-colors',
                                executionMode === mode.code
                                  ? 'bg-[#0085D0] text-white border-[#0085D0]'
                                  : selectable
                                    ? 'bg-white text-gray-700 border-gray-300 hover:border-[#0085D0] hover:text-[#0085D0]'
                                    : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                              )}
                              disabled={!selectable}
                              onClick={() => selectable && handleModeChange(mode.code)}
                            >
                              {mode.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* 执行角色（非自定义模式时展示） */}
                    {executionMode && executionMode !== 'custom' && currentModeConstraint && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 执行角色</Label>
                        <div className="mt-2 space-y-2">
                          {EXECUTION_ROLES.map((role) => {
                            const state = currentModeConstraint.roles[role.code];
                            if (!state || state === 'hidden') return null;
                            const checked = selectedRoles[role.code] ?? false;
                            const isDisabled = state === 'greyed_off' || state === 'greyed_on';
                            return (
                              <label key={role.code} className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors cursor-pointer',
                                isDisabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-[#0085D0]'
                              )}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => !isDisabled && handleRoleToggle(role.code)}
                                  disabled={isDisabled}
                                  className="w-4 h-4 rounded text-[#0085D0]"
                                />
                                <span className={cn('text-sm', isDisabled ? 'text-gray-400' : 'text-gray-700')}>{role.name}</span>
                                {state === 'greyed_on' && <span className="text-xs text-gray-400 ml-auto">(强制选中)</span>}
                                {state === 'greyed_off' && <span className="text-xs text-gray-400 ml-auto">(不可选)</span>}
                                {currentModeConstraint.mutualExclusion?.some(([a, b]) => a === role.code || b === role.code) && !isDisabled && (
                                  <span className="text-xs text-orange-500 ml-auto">(互斥)</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                        {currentModeConstraint.mutualExclusion && currentModeConstraint.mutualExclusion.length > 0 && (
                          <p className="text-xs text-orange-500 mt-2">
                            互斥规则：{currentModeConstraint.mutualExclusion.map(([a, b]) => {
                              const aName = EXECUTION_ROLES.find((r) => r.code === a)?.name;
                              const bName = EXECUTION_ROLES.find((r) => r.code === b)?.name;
                              return `${aName}与${bName}`;
                            }).join('、')}不可同时选中
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* 铁通特殊：仅一个执行角色 */}
            {isTietongScene && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                  <h2 className="text-base font-semibold text-gray-900">执行角色</h2>
                </div>
                <Card className="p-6">
                  <Label className="text-sm font-medium text-gray-700"><span className="text-red-500">*</span> 执行角色</Label>
                  <div className="mt-2">
                    <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-gray-50 border-gray-200 cursor-not-allowed">
                      <input type="checkbox" checked disabled className="w-4 h-4 rounded text-[#0085D0]" />
                      <span className="text-sm text-gray-400">铁通随销-网格通</span>
                      <span className="text-xs text-gray-400 ml-auto">(强制选中)</span>
                    </label>
                  </div>
                </Card>
              </div>
            )}

            {/* 模块四：工单执行预览 */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-5 bg-[#0085D0] mr-2"></div>
                <h2 className="text-base font-semibold text-gray-900">工单执行预览</h2>
              </div>
              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">地市</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">执行模式</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">执行角色</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CITIES.map((city, idx) => {
                      const cityMode = executionMode === 'custom' ? cityModes[city] : executionMode;
                      const modeLabel = EXECUTION_MODES.find((m) => m.code === cityMode)?.name ?? '—';
                      const modeIdx = EXECUTION_MODES.findIndex((m) => m.code === cityMode);
                      const constraint = currentSceneConfig?.customers[taskCustomerType]?.modes[modeIdx];
                      return (
                        <tr key={city} className={cn(idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                          <td className="px-4 py-2.5 text-gray-900">{city}</td>
                          <td className="px-4 py-2.5">
                            {executionMode === 'custom' ? (
                              <Select value={cityModes[city]} onValueChange={(v) => {
                                setCityModes({ ...cityModes, [city]: v });
                                // 重置该地州角色为默认值
                                const newModeIdx = EXECUTION_MODES.findIndex((m) => m.code === v);
                                const newConstraint = currentSceneConfig?.customers[taskCustomerType]?.modes[newModeIdx];
                                const defaultCityRoles: Record<string, boolean> = {};
                                if (newConstraint) {
                                  EXECUTION_ROLES.forEach((r) => {
                                    const s = newConstraint.roles[r.code];
                                    if (s === 'default_on' || s === 'greyed_on') defaultCityRoles[r.code] = true;
                                  });
                                }
                                setCityRoles({ ...cityRoles, [city]: defaultCityRoles });
                              }}>
                                <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="subcontract">分包看管执行</SelectItem>
                                  <SelectItem value="online">在线执行</SelectItem>
                                  <SelectItem value="online_subcontract">在线+分包看管</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-gray-600">{modeLabel}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {isTietongScene ? (
                              <label className="flex items-center gap-1.5 text-sm text-gray-500">
                                <input type="checkbox" checked readOnly className="rounded border-gray-300" />
                                铁通随销-网格通
                              </label>
                            ) : constraint ? (
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {EXECUTION_ROLES.map((role) => {
                                  const state = constraint.roles[role.code];
                                  if (!state || state === 'hidden') return null;
                                  const isDisabled = state === 'greyed_on' || state === 'greyed_off';
                                  const isOn = state === 'greyed_on' || state === 'default_on'
                                    || (executionMode === 'custom' ? cityRoles[city]?.[role.code] : selectedRoles[role.code]);
                                  const isSelectable = state === 'selectable' || state === 'default_on';
                                  const isPreviewDisabled = executionMode !== 'custom' || isDisabled;
                                  return (
                                    <label key={role.code} className={cn('flex items-center gap-1.5 text-sm', isPreviewDisabled ? 'text-gray-400' : 'text-gray-700')}>
                                      <input
                                        type="checkbox"
                                        checked={!!isOn}
                                        disabled={isPreviewDisabled}
                                        onChange={() => {
                                          if (executionMode === 'custom') {
                                            const newRoles = { ...cityRoles[city], [role.code]: !cityRoles[city]?.[role.code] };
                                            if (constraint.mutualExclusion) {
                                              for (const [a, b] of constraint.mutualExclusion) {
                                                if (role.code === a && newRoles[a]) newRoles[b] = false;
                                                if (role.code === b && newRoles[b]) newRoles[a] = false;
                                              }
                                            }
                                            setCityRoles({ ...cityRoles, [city]: newRoles });
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      {role.name}
                                    </label>
                                  );
                                })}
                              </div>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="px-6 py-4 border-t bg-white flex justify-between items-center">
        <Button variant="outline" className="h-9" onClick={() => router.push(`/workspace/insight/alert/config?tab=${alertMode}`)}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回
        </Button>
        <div className="flex items-center gap-3">
          {alertMode === 'task' && (
            <Button variant="outline" className="h-9">
              <Save className="w-4 h-4 mr-1" />保存草稿
            </Button>
          )}
          {alertMode === 'task' ? (
            <Button className="bg-[#0085D0] hover:bg-[#006BB0] h-9" onClick={() => {
              // 写入localStorage，在工单处理待审批列表中生成对应工单
              try {
                const stored = localStorage.getItem('pendingWorkOrders');
                const existing = stored ? JSON.parse(stored) : [];
                const ruleName = alertName || '新建预警规则';
                const newOrder = {
                  id: `ALR${Date.now()}${Math.floor(Math.random() * 1000)}`,
                  title: `${ruleName}-提交审批`,
                  type: '预警规则审批',
                  description: `预警规则"${ruleName}"提交审批，审批通过后规则即生效。`,
                  orderStatus: 'processing',
                  flowStatus: 'inProgress',
                  timeoutStatus: 'normal',
                  processResult: null,
                  alertType: alertMode === 'task' ? '任务类' : '指标类',
                  businessScene: BUSINESS_SCENES.find((s: { code: string; name: string }) => s.code === taskBusinessScene)?.name || '--',
                  executionMode: EXECUTION_MODES.find(m => m.code === executionMode)?.name || '--',
                  customerPhone: '--',
                  currentStep: '三级经理审批',
                  currentHandler: '新疆区公司三级经理',
                  city: '新疆',
                  district: '--',
                  grid: '--',
                  updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                  creator: '新疆运营人员',
                  createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                };
                localStorage.setItem('pendingWorkOrders', JSON.stringify([newOrder, ...existing]));
              } catch { /* ignore */ }
              toast.success('提交审批成功，已生成审批工单');
              router.push('/workspace/insight/alert/config?tab=task');
            }}>
              <SendHorizonal className="w-4 h-4 mr-1" />提交审批
            </Button>
          ) : (
            <Button className="bg-[#0085D0] hover:bg-[#006BB0] h-9">
              <Check className="w-4 h-4 mr-1" />确认
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewAlertRulePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen">加载中...</div>}>
      <NewAlertRuleContent />
    </Suspense>
  );
}
