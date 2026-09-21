'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRightLeft,
  Building2,
  Layers,
  Settings2,
  BarChart3,
  Zap,
  Shield,
  Network,
  Target,
  TrendingUp,
  Users,
  MapPin,
  FileText,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

/* ─── 类型定义 ─── */
type AlignStatus = 'full' | 'partial' | 'none' | 'surpass';
type BuildMethod = 'reuse' | 'optimize' | 'new' | 'integrate';

interface AlignItem {
  id: string;
  l1: string;
  l2: string;
  feature: string;
  mandatory: 'M' | 'O' | '-';
  groupSpec: string;
  leanStatus: string;
  alignStatus: AlignStatus;
  buildMethod: BuildMethod;
  effort: string;
  dispatchRelated?: boolean;
  notes: string;
}

/* ─── 对标数据 ─── */
const alignmentData: AlignItem[] = [
  // ========== 一、平台基础与统一规范 ==========
  {
    id: 'B01', l1: '平台基础与统一规范', l2: '统一规范化', feature: '平台命名统一', mandatory: 'M',
    groupSpec: '严格采用"XX移动市场运营平台"标准命名，与集团备案名称一致',
    leanStatus: '精益平台已按新疆移动标准命名', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '更名即可，无开发量'
  },
  {
    id: 'B02', l1: '平台基础与统一规范', l2: '统一规范化', feature: '菜单结构统一', mandatory: 'M',
    groupSpec: '一级菜单包含"运营概览、运营专区、能力中心、基础功能"四大模块；运营专区下含流量/存量/细分市场',
    leanStatus: '精益平台菜单为事前预警/事中监控/营销评估体系，菜单结构差异较大', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '1.5', notes: '需按集团规范重新组织菜单层级，精益平台功能作为子模块嵌入'
  },
  {
    id: 'B03', l1: '平台基础与统一规范', l2: '统一规范化', feature: '界面框架统一', mandatory: 'M',
    groupSpec: '顶部导航+左侧菜单+中间内容区+底部状态栏标准布局',
    leanStatus: '精益平台采用顶部Tab导航+左侧菜单，基本框架一致', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0.5', notes: '微调布局即可，集团版本自带UI框架'
  },
  {
    id: 'B04', l1: '平台基础与统一规范', l2: '统一规范化', feature: '统一权限管理', mandatory: 'M',
    groupSpec: '省-市-县-格-人五级权限管控，集成4A认证，支持单点登录',
    leanStatus: '精益平台已对接4A系统，支持省/市/县/格层级权限', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台4A对接能力直接复用，集团版本部署时对接同一4A'
  },

  // ========== 二、核心运营场景 ==========
  {
    id: 'S01', l1: '核心运营场景', l2: '运营概览', feature: '市场运营关键指标可视化', mandatory: 'M',
    groupSpec: '展示市场运营关键指标及数据趋势，支持数据下钻；调度跟踪看板可视化',
    leanStatus: '精益平台有整体数据概览、工单概览、营销任务概览，但指标维度不如集团全面', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '1.275', notes: '需按集团指标体系补充指标维度，调度看板复用精益平台工单概览'
  },
  {
    id: 'S02', l1: '核心运营场景', l2: '流量运营', feature: '场景概览', mandatory: 'M',
    groupSpec: '展示流量运营核心指标（流量规模、价值转化、客户规模、用量、来源分析），支持异常指标告警',
    leanStatus: '精益平台不具备流量运营场景', alignStatus: 'none', buildMethod: 'new',
    effort: '7.65', notes: '全新建设，需对接大数据平台流量相关指标数据'
  },
  {
    id: 'S03', l1: '核心运营场景', l2: '流量运营', feature: '指标-客群驱动模式', mandatory: 'M',
    groupSpec: '指标树展示→异动监控→根因分析→客群定位→策略匹配→调度执行→效果评估',
    leanStatus: '精益平台不具备指标树和根因分析能力，部分具备调度执行和效果评估', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '8', dispatchRelated: true,
    notes: '指标树和根因分析为新增能力；调度执行和效果评估复用精益平台'
  },
  {
    id: 'S04', l1: '核心运营场景', l2: '流量运营', feature: '商机驱动模式', mandatory: 'M',
    groupSpec: '商机识别→评级→策略匹配→调度触达→效果跟踪',
    leanStatus: '精益平台不具备商机识别和评级能力', alignStatus: 'none', buildMethod: 'new',
    effort: '6', dispatchRelated: true,
    notes: '商机体系全新建设；调度触达复用精益平台工单下发能力'
  },
  {
    id: 'S05', l1: '核心运营场景', l2: '流量运营', feature: '区域攻坚模式', mandatory: 'M',
    groupSpec: 'GIS地图+大数据识别攻坚区域→作战地图→策略制定→派发→执行闭环→效果评估',
    leanStatus: '精益平台不具备，经分有地图', alignStatus: 'none', buildMethod: 'new',
    effort: '10', dispatchRelated: true,
    notes: 'GIS地图和攻坚分析全新建设；工单派发和执行跟踪复用精益平台调度链路'
  },
  {
    id: 'S06', l1: '核心运营场景', l2: '存量运营-离网维系', feature: '场景概览', mandatory: 'M',
    groupSpec: '展示离网维系关键指标（离网规模、离网率、离网损失、挽回率等），支持异常指标告警',
    leanStatus: '精益平台有存量业务视图、携转视图、中高价值客户视图，但指标体系不如集团完整', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '3', notes: '补充集团指标体系，视图框架复用精益平台'
  },
  {
    id: 'S07', l1: '核心运营场景', l2: '存量运营-离网维系', feature: '指标-客群驱动模式', mandatory: 'M',
    groupSpec: '离网指标树→异动监控→根因分析→风险客群定位→挽留策略匹配→调度执行→效果评估',
    leanStatus: '精益平台有预警触发和工单下发能力，不具备指标树和根因分析', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '5', dispatchRelated: true,
    notes: '指标树新增；预警+调度+评估复用精益平台'
  },
  {
    id: 'S08', l1: '核心运营场景', l2: '存量运营-离网维系', feature: '商机驱动模式', mandatory: 'M',
    groupSpec: '携转商机/离网商机识别→评级→策略匹配→调度→效果跟踪',
    leanStatus: '精益平台有携转挽留、全球通离网预警等场景，但无商机评级体系', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '4', dispatchRelated: true,
    notes: '精益平台预警场景可改造为商机驱动模式；调度链路复用'
  },
  {
    id: 'S09', l1: '核心运营场景', l2: '存量运营-中高端保有', feature: '场景概览', mandatory: 'M',
    groupSpec: '中高端客户规模、保有率、预警挽留指标展示，过程性指标（三量三率）+结果性指标',
    leanStatus: '精益平台有中高价值客户视图和看管体系', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '3', notes: '精益平台视图框架复用，补充集团指标体系'
  },
  {
    id: 'S10', l1: '核心运营场景', l2: '存量运营-中高端保有', feature: '数据概览（三量三率）', mandatory: 'M',
    groupSpec: '派单量/处理量/接通量/成功量、处理率/接通率/成功率及环比',
    leanStatus: '精益平台有工单执行数据统计，维度类似', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台工单统计能力复用，补充集团标准三量三率计算口径'
  },
  {
    id: 'S11', l1: '核心运营场景', l2: '存量运营-中高端保有', feature: '节点分析', mandatory: 'M',
    groupSpec: '省/地市/区县/网格各节点运营数据+渠道-客群效能矩阵',
    leanStatus: '精益平台有四级下钻能力（全疆→地市→区县→网格）', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台下钻能力复用，补充渠道-客群交叉分析'
  },
  {
    id: 'S12', l1: '核心运营场景', l2: '存量运营-中高端保有', feature: '维系模式对比分析', mandatory: 'M',
    groupSpec: '主动/被动维系对比+关联强度验证（皮尔逊系数）',
    leanStatus: '精益平台有主动维系（预警触发）和被动维系（工单派发）流程，但无对比分析', alignStatus: 'none', buildMethod: 'new',
    effort: '3', notes: '全新建设分析模型'
  },
  {
    id: 'S13', l1: '核心运营场景', l2: '存量运营-中高端保有', feature: '渠道效能分析', mandatory: 'M',
    groupSpec: '各渠道效能排名+渠道-客群交叉分析',
    leanStatus: '精益平台有分渠道执行情况展示和多渠道对比', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台渠道分析能力复用，补充客群交叉维度'
  },
  {
    id: 'S14', l1: '核心运营场景', l2: '存量运营-家庭融合运营', feature: '场景概览+指标-客群驱动', mandatory: 'M',
    groupSpec: '家庭客户运营指标体系+指标树+客群驱动+调度执行',
    leanStatus: '精益平台不具备家庭运营场景', alignStatus: 'none', buildMethod: 'new',
    effort: '8', dispatchRelated: true,
    notes: '全新建设；调度执行复用精益平台'
  },
  {
    id: 'S15', l1: '核心运营场景', l2: '细分市场-校园运营', feature: '场景概览+运营模式', mandatory: 'M',
    groupSpec: '校园客户运营指标+场景运营+调度执行',
    leanStatus: '精益平台不具备校园运营场景', alignStatus: 'none', buildMethod: 'new',
    effort: '6', dispatchRelated: true,
    notes: '全新建设；调度执行复用精益平台'
  },

  // ========== 三、共享中心 ==========
  {
    id: 'C01', l1: '共享中心', l2: '指标中心', feature: '指标地图', mandatory: 'M',
    groupSpec: '多维度筛选（业务条线/分类/场景/来源/指标分类）+指标列表+详情查看',
    leanStatus: '精益平台有指标库和指标管理，但筛选维度较简单（仅按场景、类型）', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '3', notes: '集团版本指标中心直接使用，精益平台指标数据迁移至集团指标库'
  },
  {
    id: 'C02', l1: '共享中心', l2: '指标中心', feature: '指标详情', mandatory: 'M',
    groupSpec: '指标基本信息+关联指标导航+区域/时间维度趋势图',
    leanStatus: '精益平台指标详情较简单，无关联导航和多维趋势', alignStatus: 'none', buildMethod: 'new',
    effort: '2', notes: '集团版本指标详情直接使用'
  },
  {
    id: 'C03', l1: '共享中心', l2: '指标中心', feature: '指标树模板库', mandatory: 'M',
    groupSpec: '三级分类筛选+卡片式展示+模板预览',
    leanStatus: '精益平台不具备指标树模板能力', alignStatus: 'none', buildMethod: 'new',
    effort: '4', notes: '集团版本指标树模板库直接使用'
  },
  {
    id: 'C04', l1: '共享中心', l2: '策略中心', feature: '策略管理', mandatory: 'M',
    groupSpec: '多渠道策略策划+画布式配置+策略审批+策略库管理',
    leanStatus: '精益平台有画布式策略策划、策略管理、策略审批能力', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '3', notes: '精益平台策略中心能力较强，可复用画布和审批流；需适配集团标准接口'
  },
  {
    id: 'C05', l1: '共享中心', l2: '策略中心', feature: 'AI话术生成', mandatory: 'O',
    groupSpec: '对接集团AI话术能力，匹配策略自动生成话术',
    leanStatus: '精益平台已对接集团AI话术能力', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台AI话术对接能力直接复用'
  },
  {
    id: 'C06', l1: '共享中心', l2: '调度中心', feature: '工单调度', mandatory: 'M',
    groupSpec: '支持多种调度类型（指标调度/策略调度/客群调度/商机调度/区域攻坚调度），工单全流程管理',
    leanStatus: '精益平台有完善的工单调度能力：保有类/营销类/维系类/管理类/提醒类工单管理，工单列表、下发、督办', alignStatus: 'partial', buildMethod: 'integrate',
    effort: '5', dispatchRelated: true,
    notes: '⭐关键复用点：精益平台工单调度核心能力复用，需适配集团调度类型分类和工单模板'
  },
  {
    id: 'C07', l1: '共享中心', l2: '调度中心', feature: '渠道协同调度', mandatory: 'M',
    groupSpec: '支持多渠道派单（网格经理/10086/10088/装维/营业厅等），渠道间工单转派',
    leanStatus: '精益平台已对接3大类触点（网格通、在线、装维），支持网格经理/10088/装维间转派', alignStatus: 'partial', buildMethod: 'integrate',
    effort: '3', dispatchRelated: true,
    notes: '⭐关键复用点：精益平台已打通网格通+IOP+在线+装维，渠道转派规则可复用'
  },
  {
    id: 'C08', l1: '共享中心', l2: '调度中心', feature: '分包看管模式派单', mandatory: 'M',
    groupSpec: '按客户属性（全球通等级/是否政企/是否宽带）自动匹配执行渠道',
    leanStatus: '精益平台已实现分包看管派单逻辑：全球通→客户经理/10088/网格经理，宽带→装维', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '⭐核心复用：精益平台分包看管逻辑可直接复用，这是精益平台的核心差异化能力'
  },
  {
    id: 'C09', l1: '共享中心', l2: '调度中心', feature: '执行渠道配置', mandatory: 'M',
    groupSpec: '灵活配置各场景的执行渠道和派单规则',
    leanStatus: '精益平台有执行渠道配置页面，支持场景维度的渠道配置', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '精益平台执行渠道配置能力复用'
  },
  {
    id: 'C10', l1: '共享中心', l2: '评估中心', feature: '工单效能评估', mandatory: 'M',
    groupSpec: '工单响应时长/处理时长/完成率等核心指标，多维度统计展示',
    leanStatus: '精益平台有工单全流程盯控报表，支持工单维度统计和四级下钻', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台工单盯控能力复用，补充集团标准的效能指标体系'
  },
  {
    id: 'C11', l1: '共享中心', l2: '评估中心', feature: '策略转化评估', mandatory: 'M',
    groupSpec: '策略触达率/办理率/转化率等，多维度分析',
    leanStatus: '精益平台有策略转化评估（触达率/办理率等）', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台策略评估能力复用，补充集团标准指标'
  },
  {
    id: 'C12', l1: '共享中心', l2: '评估中心', feature: '渠道效能评估', mandatory: 'M',
    groupSpec: '各渠道触达率/转化率，多渠道对比+四级下钻',
    leanStatus: '精益平台有分渠道执行情况分析和四级下钻', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台渠道效能评估能力直接复用'
  },
  {
    id: 'C13', l1: '共享中心', l2: '评估中心', feature: 'ABTest对比分析', mandatory: 'O',
    groupSpec: '已运营/未运营客户对比+省份级留存差异分析',
    leanStatus: '精益平台不具备ABTest能力', alignStatus: 'none', buildMethod: 'new',
    effort: '3', notes: '全新建设'
  },
  {
    id: 'C14', l1: '共享中心', l2: '评估中心', feature: '异常及共性分析', mandatory: 'M',
    groupSpec: 'AI驱动的异常数据识别+共性问题提炼+优化建议',
    leanStatus: '精益平台不具备AI异常分析能力', alignStatus: 'none', buildMethod: 'new',
    effort: '4', notes: '全新建设，依赖集团AI大模型能力'
  },
  {
    id: 'C15', l1: '共享中心', l2: '素材中心', feature: '素材广场+素材预览+授权管理', mandatory: 'O',
    groupSpec: '素材资源管理、下载、授权申请、预览',
    leanStatus: '精益平台不具备素材管理能力', alignStatus: 'none', buildMethod: 'new',
    effort: '3', notes: '集团版本素材中心直接使用'
  },

  // ========== 四、预警能力 ==========
  {
    id: 'W01', l1: '预警能力', l2: '预警配置', feature: '预警规则自定义配置', mandatory: 'M',
    groupSpec: '支持指标规则配置、多指标交叉计算、预警阈值自定义',
    leanStatus: '精益平台有完善的预警配置能力：预警指标拖拉拽、规则配置、周期/阈值自定义', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台预警配置能力直接复用，这是其核心优势'
  },
  {
    id: 'W02', l1: '预警能力', l2: '预警配置', feature: '预警自动触发+工单生成', mandatory: 'M',
    groupSpec: '预警触发后自动生成工单、输出客群',
    leanStatus: '精益平台已实现预警自动触发→工单自动下发→客群输出', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '精益平台预警触发链路完整，直接复用'
  },
  {
    id: 'W03', l1: '预警能力', l2: '预警场景', feature: '携转挽留预警', mandatory: 'M',
    groupSpec: '实时携转预警→10086外呼+网格维系',
    leanStatus: '精益平台已实现，3种模式：在线→网格→转派装维', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '精益平台携转挽留场景成熟，直接复用'
  },
  {
    id: 'W04', l1: '预警能力', l2: '预警场景', feature: '全球通离网预警', mandatory: 'M',
    groupSpec: '全球通客户离网概率预警→分包看管派单',
    leanStatus: '精益平台已实现，离网概率/排名配置→分包看管派单', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '精益平台全球通离网预警场景成熟，直接复用'
  },
  {
    id: 'W05', l1: '预警能力', l2: '预警场景', feature: '宽带离网预警', mandatory: 'M',
    groupSpec: '宽带客户离网预警→装维/网格维系',
    leanStatus: '精益平台已实现宽带离网预警场景', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '精益平台宽带离网预警场景成熟，直接复用'
  },
  {
    id: 'W06', l1: '预警能力', l2: '预警场景', feature: '合约到期续约', mandatory: 'M',
    groupSpec: '合约到期自动监控→自动圈选目标客户→下发续约任务',
    leanStatus: '精益平台已实现合约到期监控+一事一案+自动续约', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台合约续约场景成熟，直接复用'
  },

  // ========== 五、外围系统对接 ==========
  {
    id: 'I01', l1: '外围系统对接', l2: '下游触点', feature: '网格通对接', mandatory: 'M',
    groupSpec: '工单下发至网格通，网格经理执行+反馈',
    leanStatus: '精益平台已对接网格通：工单推送+执行反馈+存量看管+网格分配', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '⭐核心复用：精益平台网格通对接链路直接复用'
  },
  {
    id: 'I02', l1: '外围系统对接', l2: '下游触点', feature: 'IOP平台对接', mandatory: 'M',
    groupSpec: '营销任务→IOP活动配置+审批+执行',
    leanStatus: '精益平台已对接IOP：任务推送→活动创建→审批→执行反馈', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '⭐核心复用：精益平台IOP对接链路直接复用'
  },
  {
    id: 'I03', l1: '外围系统对接', l2: '下游触点', feature: '在线平台对接（10086/10088）', mandatory: 'M',
    groupSpec: '外呼任务下发+执行结果回传',
    leanStatus: '精益平台已对接在线：10086/10088外呼+结果反馈', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '⭐核心复用：精益平台在线对接链路直接复用'
  },
  {
    id: 'I04', l1: '外围系统对接', l2: '下游触点', feature: '装维APP对接', mandatory: 'M',
    groupSpec: '上门维系工单下发+执行反馈',
    leanStatus: '精益平台已对接装维APP：转派装维+执行反馈', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', dispatchRelated: true,
    notes: '⭐核心复用：精益平台装维对接链路直接复用'
  },
  {
    id: 'I05', l1: '外围系统对接', l2: '上游数据', feature: '大数据平台对接', mandatory: 'M',
    groupSpec: '指标数据+客户数据+模型预测结果接入',
    leanStatus: '精益平台已对接大数据平台：新大陆接口7个+FTP数据交换', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台大数据对接链路复用，集团版本指标另行接入'
  },
  {
    id: 'I06', l1: '外围系统对接', l2: '上游数据', feature: '精准营销平台对接', mandatory: 'M',
    groupSpec: '客群创建+客群查询+客群推送',
    leanStatus: '精益平台已对接精准营销平台：客群查询+发布通知', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台精准营销对接链路复用'
  },
  {
    id: 'I07', l1: '外围系统对接', l2: '上游数据', feature: 'CRM/产商品中心对接', mandatory: 'M',
    groupSpec: '产品信息+办理数据+客户资料',
    leanStatus: '精益平台已对接CRM和产商品中心', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台CRM对接链路复用'
  },
  {
    id: 'I08', l1: '外围系统对接', l2: '其他系统', feature: '4A系统对接', mandatory: 'M',
    groupSpec: '统一认证+单点登录',
    leanStatus: '精益平台已对接4A系统', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '复用精益平台4A对接'
  },
  {
    id: 'I09', l1: '外围系统对接', l2: '其他系统', feature: 'OA系统对接', mandatory: 'M',
    groupSpec: '待办推送+组织架构同步',
    leanStatus: '精益平台已对接OA：待办提醒+组织同步', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '复用精益平台OA对接'
  },

  // ========== 六、运营管理 ==========
  {
    id: 'M01', l1: '运营管理', l2: '任务督办', feature: '督办任务管理', mandatory: 'M',
    groupSpec: '督办任务新增/审批/变更/下线，固化督办触发机制',
    leanStatus: '精益平台有任务督办能力：新增/查看/审批/变更/下线', alignStatus: 'full', buildMethod: 'reuse',
    effort: '0', notes: '精益平台督办能力直接复用'
  },
  {
    id: 'M02', l1: '运营管理', l2: '人员管理', feature: '存量运营人员管理', mandatory: 'M',
    groupSpec: '组织架构可视化+人员列表+工号校验+提醒配置',
    leanStatus: '精益平台有账号管理/角色管理/权限管理，但无组织架构可视化和提醒配置', alignStatus: 'partial', buildMethod: 'optimize',
    effort: '2', notes: '精益平台人员管理基础能力复用，补充集团标准的可视化和提醒功能'
  },
  {
    id: 'M03', l1: '运营管理', l2: '数据稽核', feature: '数据质量稽核', mandatory: 'M',
    groupSpec: '事前校验（接口层强制）+事后审计+AI异常识别',
    leanStatus: '精益平台不具备数据稽核能力', alignStatus: 'none', buildMethod: 'new',
    effort: '3', notes: '全新建设，集团标准能力'
  },
];

/* ─── 辅助函数 ─── */
const statusConfig: Record<AlignStatus, { label: string; color: string; icon: React.ReactNode; bgClass: string }> = {
  full: { label: '完全具备', color: 'text-emerald-600', icon: <CheckCircle2 className="w-4 h-4" />, bgClass: 'bg-emerald-50 border-emerald-200' },
  partial: { label: '部分具备', color: 'text-amber-600', icon: <AlertCircle className="w-4 h-4" />, bgClass: 'bg-amber-50 border-amber-200' },
  none: { label: '不具备', color: 'text-red-500', icon: <XCircle className="w-4 h-4" />, bgClass: 'bg-red-50 border-red-200' },
  surpass: { label: '超越集团', color: 'text-blue-600', icon: <TrendingUp className="w-4 h-4" />, bgClass: 'bg-blue-50 border-blue-200' },
};

const methodConfig: Record<BuildMethod, { label: string; color: string; bgClass: string }> = {
  reuse: { label: '复用', color: 'text-emerald-700', bgClass: 'bg-emerald-100' },
  optimize: { label: '优化改造', color: 'text-amber-700', bgClass: 'bg-amber-100' },
  new: { label: '新建', color: 'text-red-700', bgClass: 'bg-red-100' },
  integrate: { label: '集成对接', color: 'text-violet-700', bgClass: 'bg-violet-100' },
};

/* ─── 统计 ─── */
function getStats(data: AlignItem[]) {
  const total = data.length;
  const full = data.filter(d => d.alignStatus === 'full').length;
  const partial = data.filter(d => d.alignStatus === 'partial').length;
  const none = data.filter(d => d.alignStatus === 'none').length;
  const dispatchItems = data.filter(d => d.dispatchRelated);
  const dispatchFull = dispatchItems.filter(d => d.alignStatus === 'full').length;
  const dispatchPartial = dispatchItems.filter(d => d.alignStatus === 'partial').length;
  const totalEffort = data.reduce((sum, d) => sum + parseFloat(d.effort || '0'), 0);
  const newEffort = data.filter(d => d.buildMethod === 'new').reduce((sum, d) => sum + parseFloat(d.effort || '0'), 0);
  const optimizeEffort = data.filter(d => d.buildMethod === 'optimize').reduce((sum, d) => sum + parseFloat(d.effort || '0'), 0);
  const integrateEffort = data.filter(d => d.buildMethod === 'integrate').reduce((sum, d) => sum + parseFloat(d.effort || '0'), 0);

  return { total, full, partial, none, dispatchItems: dispatchItems.length, dispatchFull, dispatchPartial, totalEffort, newEffort, optimizeEffort, integrateEffort };
}

/* ─── 分组 ─── */
function groupByL1(data: AlignItem[]) {
  const map = new Map<string, AlignItem[]>();
  data.forEach(d => {
    const list = map.get(d.l1) || [];
    list.push(d);
    map.set(d.l1, list);
  });
  return map;
}

/* ─── 主组件 ─── */
export default function AlignmentPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['调度能力复用方案']));
  const [filterStatus, setFilterStatus] = useState<AlignStatus | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState<BuildMethod | 'all'>('all');
  const [showDispatchOnly, setShowDispatchOnly] = useState(false);

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedGroups(next);
  };

  const filtered = alignmentData.filter(d => {
    if (filterStatus !== 'all' && d.alignStatus !== filterStatus) return false;
    if (filterMethod !== 'all' && d.buildMethod !== filterMethod) return false;
    if (showDispatchOnly && !d.dispatchRelated) return false;
    return true;
  });

  const stats = getStats(alignmentData);
  const dispatchStats = getStats(alignmentData.filter(d => d.dispatchRelated));
  const groups = groupByL1(filtered);

  return (
    <div className="min-h-screen bg-background">
      {/* 页面标题 */}
      <div className="border-b bg-card">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <ArrowRightLeft className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">集团标准版本 vs 新疆精益平台 能力对标分析</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            基于集团《一级营服运营平台需求规格说明书V1.0》及《市场运营工作台需求说明书》与新疆精益平台现有能力进行逐项对标，识别复用能力与建设工作量
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-5 space-y-6">
        {/* ─── 总览统计卡片 ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="border">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">对标项总数</div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">必选(M) {alignmentData.filter(d => d.mandatory === 'M').length} 项</div>
            </CardContent>
          </Card>
          <Card className="border border-emerald-200">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">完全具备(可复用)</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.full}</div>
              <div className="text-xs text-emerald-600">{Math.round(stats.full / stats.total * 100)}%</div>
            </CardContent>
          </Card>
          <Card className="border border-amber-200">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">部分具备(需优化)</div>
              <div className="text-2xl font-bold text-amber-600">{stats.partial}</div>
              <div className="text-xs text-amber-600">{Math.round(stats.partial / stats.total * 100)}%</div>
            </CardContent>
          </Card>
          <Card className="border border-red-200">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">不具备(需新建)</div>
              <div className="text-2xl font-bold text-red-500">{stats.none}</div>
              <div className="text-xs text-red-500">{Math.round(stats.none / stats.total * 100)}%</div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">预估总投入</div>
              <div className="text-2xl font-bold">{stats.totalEffort.toFixed(1)}<span className="text-sm font-normal text-muted-foreground"> 人月</span></div>
            </CardContent>
          </Card>
          <Card className="border border-violet-200">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-xs text-muted-foreground mb-1">调度相关项</div>
              <div className="text-2xl font-bold text-violet-600">{stats.dispatchItems}</div>
              <div className="text-xs text-violet-600">其中{stats.dispatchFull}项可复用</div>
            </CardContent>
          </Card>
        </div>

        {/* ─── 投入分布 ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              建设方式投入分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-700 mb-1">复用(0投入)</div>
                <div className="text-lg font-bold text-emerald-700">{alignmentData.filter(d => d.buildMethod === 'reuse').length} 项</div>
                <div className="text-xs text-muted-foreground">0 人月</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">优化改造</div>
                <div className="text-lg font-bold text-amber-700">{alignmentData.filter(d => d.buildMethod === 'optimize').length} 项</div>
                <div className="text-xs text-muted-foreground">{stats.optimizeEffort.toFixed(1)} 人月</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-violet-50 border border-violet-200">
                <div className="text-xs text-violet-700 mb-1">集成对接</div>
                <div className="text-lg font-bold text-violet-700">{alignmentData.filter(d => d.buildMethod === 'integrate').length} 项</div>
                <div className="text-xs text-muted-foreground">{stats.integrateEffort.toFixed(1)} 人月</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-xs text-red-700 mb-1">新建</div>
                <div className="text-lg font-bold text-red-700">{alignmentData.filter(d => d.buildMethod === 'new').length} 项</div>
                <div className="text-xs text-muted-foreground">{stats.newEffort.toFixed(1)} 人月</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── 调度能力复用方案（重点） ─── */}
        <Card className="border-violet-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 cursor-pointer" onClick={() => toggleGroup('调度能力复用方案')}>
              {expandedGroups.has('调度能力复用方案') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Zap className="w-4 h-4 text-violet-600" />
              调度能力复用方案（重点分析）
            </CardTitle>
          </CardHeader>
          {expandedGroups.has('调度能力复用方案') && (
            <CardContent className="space-y-4">
              {/* 核心结论 */}
              <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-violet-900 mb-2">核心结论</div>
                    <p className="text-sm text-violet-800 leading-relaxed">
                      集团标准版本拿到新疆部署后，调度能力是与精益平台整合的<strong>最关键环节</strong>。
                      精益平台已打通网格通、IOP、在线（10086/10088）、装维APP四大下游触点的工单下发与执行反馈链路，
                      且实现了基于客户属性的分包看管派单逻辑。集团版本应<strong>复用精益平台的调度执行层</strong>，
                      而非重新对接下游系统。推荐采用<strong>&quot;集团版本编排层 + 精益平台执行层&quot;</strong>的架构模式。
                    </p>
                  </div>
                </div>
              </div>

              {/* 复用架构图 */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-medium mb-3">推荐架构：集团版本编排层 + 精益平台执行层</div>
                <div className="font-mono text-xs bg-muted/50 p-4 rounded-lg leading-relaxed whitespace-pre overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────────┐
│                    集团标准版本（编排层）                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 指标调度  │ │ 策略调度  │ │ 客群调度  │ │ 商机调度  │ │区域攻坚调度│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       └────────────┴────────────┴────────────┴────────────┘        │
│                            │ 统一调度API                             │
└────────────────────────────┼────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    精益平台（执行层）                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 调度适配服务（新增）：接收集团调度请求，转换为精益工单格式      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│       │                  │                 │               │        │
│  ┌────▼─────┐    ┌───────▼──────┐   ┌─────▼─────┐  ┌─────▼─────┐ │
│  │  网格通   │    │  IOP平台     │   │在线10086/88│  │  装维APP  │ │
│  │ 网格经理  │    │ 营销活动配置  │   │  外呼维系  │  │  上门维系  │ │
│  └──────────┘    └──────────────┘   └───────────┘  └───────────┘ │
│       │                  │                 │               │        │
│       └──────────────────┴─────────────────┴───────────────┘        │
│                            │ 执行反馈                                │
│                  ┌─────────▼──────────┐                              │
│                  │  效能评估 & 反馈回传  │──── 回传集团版本            │
│                  └────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘`}
                </div>
              </div>

              {/* 精益平台已打通的调度链路 */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-medium mb-3">精益平台已打通的调度链路明细</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">下游系统</TableHead>
                      <TableHead className="w-[120px]">执行角色</TableHead>
                      <TableHead>对接方式</TableHead>
                      <TableHead className="w-[100px]">接口数量</TableHead>
                      <TableHead className="w-[100px]">复用状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { system: '网格通', role: '网格经理/政企客户经理/地市集运', method: 'HTTP API + FTP数据交换', count: '3个接口+2个FTP', status: 'full' },
                      { system: 'IOP平台', role: '运营人员（活动配置）', method: 'HTTP API（营销活动同步+执行节点反馈）', count: '2个接口', status: 'full' },
                      { system: '在线平台', role: '10086/10088外呼人员', method: 'HTTP API（预警工单+结果查询）', count: '1个接口', status: 'full' },
                      { system: '装维APP', role: '装维人员', method: '转派模式（网格/在线→装维）', count: '转派接口', status: 'full' },
                      { system: '大数据平台', role: '数据源（新大陆）', method: 'HTTP API + FTP', count: '7个接口+3个FTP', status: 'full' },
                      { system: '精准营销平台', role: '客群创建', method: 'HTTP API', count: '2个接口', status: 'full' },
                      { system: 'CRM/产商品', role: '产品/客户数据', method: '接口对接', count: '多个', status: 'full' },
                      { system: '4A系统', role: '认证/权限', method: 'SSO集成', count: '1个', status: 'full' },
                      { system: 'OA系统', role: '待办/组织', method: '接口对接', count: '2个', status: 'full' },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.system}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell className="text-xs">{row.method}</TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            可复用
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 复用方案三条路径 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border-2 border-emerald-300 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-600">推荐方案</Badge>
                    <span className="font-medium text-sm">API适配层模式</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    在精益平台新增&quot;调度适配服务&quot;，集团版本通过统一调度API将工单推送到适配服务，
                    适配服务将集团工单格式转换为精益平台工单格式，复用精益平台现有派单逻辑和下游对接链路。
                    执行结果通过适配服务回传集团版本。
                  </p>
                  <div className="mt-2 text-xs">
                    <div className="text-emerald-700">优点：改动最小、复用度最高、下游零改造</div>
                    <div className="text-amber-700">缺点：精益平台需新增适配服务</div>
                  </div>
                  <div className="mt-2 text-xs font-medium">预估工作量：5人月</div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">备选方案A</Badge>
                    <span className="font-medium text-sm">消息队列解耦模式</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    集团版本和精益平台通过消息中间件（如Kafka）进行调度指令和执行结果的异步通信。
                    精益平台订阅调度主题，集团版本订阅反馈主题。解耦更彻底，但增加运维复杂度。
                  </p>
                  <div className="mt-2 text-xs">
                    <div className="text-emerald-700">优点：松耦合、可扩展</div>
                    <div className="text-amber-700">缺点：需部署消息中间件、一致性保障复杂</div>
                  </div>
                  <div className="mt-2 text-xs font-medium">预估工作量：8人月</div>
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">备选方案B</Badge>
                    <span className="font-medium text-sm">精益平台微服务化</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    将精益平台调度能力抽取为独立微服务（工单派发服务、渠道协同服务、
                    执行反馈服务），集团版本直接调用微服务API。架构更清晰但改造量大。
                  </p>
                  <div className="mt-2 text-xs">
                    <div className="text-emerald-700">优点：架构清晰、可独立演进</div>
                    <div className="text-amber-700">缺点：精益平台改造量大、周期长</div>
                  </div>
                  <div className="mt-2 text-xs font-medium">预估工作量：15人月</div>
                </div>
              </div>

              {/* 调度相关对标项 */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-medium mb-3">调度相关对标项一览</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">编号</TableHead>
                      <TableHead className="w-[140px]">功能项</TableHead>
                      <TableHead>集团规范要求</TableHead>
                      <TableHead className="w-[120px]">精益现状</TableHead>
                      <TableHead className="w-[80px]">对标结果</TableHead>
                      <TableHead className="w-[80px]">建设方式</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alignmentData.filter(d => d.dispatchRelated).map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell className="font-medium text-sm">{item.feature}</TableCell>
                        <TableCell className="text-xs">{item.groupSpec.slice(0, 60)}...</TableCell>
                        <TableCell className="text-xs">{item.leanStatus.slice(0, 40)}...</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${statusConfig[item.alignStatus].color}`}>
                            {statusConfig[item.alignStatus].icon}
                            <span className="text-xs">{statusConfig[item.alignStatus].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${methodConfig[item.buildMethod].bgClass} ${methodConfig[item.buildMethod].color}`}>
                            {methodConfig[item.buildMethod].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* ─── 指标库策略 ─── */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              指标库策略说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 leading-relaxed">
              <strong>指标库直接采用集团版本</strong>，不复用精益平台指标库。原因如下：
              <ol className="mt-2 ml-4 list-decimal space-y-1">
                <li>集团指标中心体系更完善（指标地图+指标详情+指标树模板库），筛选维度更丰富（业务条线/分类/场景/来源/指标分类）</li>
                <li>集团指标与运营场景深度绑定，指标树模板可直接复用到各省</li>
                <li>精益平台指标库功能较简单（仅按场景/类型筛选），指标维度不够丰富</li>
                <li>集团版本指标数据从一经平台和大数据平台统一接入，口径更标准</li>
              </ol>
              <p className="mt-2">精益平台指标库中的<strong>预警指标配置数据</strong>（如离网概率阈值、携转预警规则等）需迁移至集团指标中心。</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── 筛选条件 ─── */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">筛选：</span>
              <div className="flex gap-1">
                {([['all', '全部'], ['full', '完全具备'], ['partial', '部分具备'], ['none', '不具备']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilterStatus(val === 'all' ? 'all' : val as AlignStatus)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      filterStatus === val
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex gap-1">
                {([['all', '全部方式'], ['reuse', '复用'], ['optimize', '优化'], ['new', '新建'], ['integrate', '集成']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilterMethod(val === 'all' ? 'all' : val as BuildMethod)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      filterMethod === val
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setShowDispatchOnly(!showDispatchOnly)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${
                  showDispatchOnly
                    ? 'bg-violet-100 text-violet-700 border-violet-300'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                <Zap className="w-3 h-3" />
                仅看调度相关
              </button>
              <span className="text-xs text-muted-foreground ml-2">
                显示 {filtered.length} / {alignmentData.length} 项
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ─── 对标明细表 ─── */}
        {Array.from(groups.entries()).map(([l1, items]) => (
          <Card key={l1}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {l1 === '平台基础与统一规范' && <Shield className="w-4 h-4 text-blue-600" />}
                {l1 === '核心运营场景' && <Target className="w-4 h-4 text-amber-600" />}
                {l1 === '共享中心' && <Settings2 className="w-4 h-4 text-violet-600" />}
                {l1 === '预警能力' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {l1 === '外围系统对接' && <Network className="w-4 h-4 text-emerald-600" />}
                {l1 === '运营管理' && <Users className="w-4 h-4 text-sky-600" />}
                {l1}
                <Badge variant="outline" className="text-xs font-normal">{items.length}项</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">编号</TableHead>
                      <TableHead className="w-[60px]">必选</TableHead>
                      <TableHead className="w-[140px]">二级分类</TableHead>
                      <TableHead className="w-[140px]">功能项</TableHead>
                      <TableHead>集团规范要求</TableHead>
                      <TableHead className="w-[200px]">精益平台现状</TableHead>
                      <TableHead className="w-[90px]">对标结果</TableHead>
                      <TableHead className="w-[80px]">建设方式</TableHead>
                      <TableHead className="w-[60px]">投入</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id} className={item.dispatchRelated ? 'bg-violet-50/30' : ''}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell>
                          <Badge variant={item.mandatory === 'M' ? 'default' : 'outline'} className="text-xs">
                            {item.mandatory}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{item.l2}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {item.feature}
                          {item.dispatchRelated && <Zap className="w-3 h-3 text-violet-500 inline ml-1" />}
                        </TableCell>
                        <TableCell className="text-xs max-w-[300px]">{item.groupSpec}</TableCell>
                        <TableCell className="text-xs">{item.leanStatus}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${statusConfig[item.alignStatus].color}`}>
                            {statusConfig[item.alignStatus].icon}
                            <span className="text-xs whitespace-nowrap">{statusConfig[item.alignStatus].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs whitespace-nowrap ${methodConfig[item.buildMethod].bgClass} ${methodConfig[item.buildMethod].color}`}>
                            {methodConfig[item.buildMethod].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center">{item.effort || '-'}</TableCell>
                        <TableCell className="text-xs max-w-[200px]">{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* ─── 精益平台需配合的工作清单 ─── */}
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              精益平台侧需配合的工作清单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">序号</TableHead>
                  <TableHead className="w-[200px]">工作内容</TableHead>
                  <TableHead>详细说明</TableHead>
                  <TableHead className="w-[100px]">优先级</TableHead>
                  <TableHead className="w-[80px]">预估工作量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { no: 1, name: '新增调度适配服务', desc: '在精益平台侧新增调度适配API服务，接收集团版本的统一调度请求，转换为精益平台工单格式（包括工单类型映射、执行渠道匹配、客户属性校验等），复用现有派单逻辑', priority: 'P0-关键', effort: '3人月' },
                  { no: 2, name: '执行结果回传接口', desc: '新增执行结果回传接口，将精益平台工单执行状态和结果实时同步到集团版本，支持集团版本的调度跟踪和效果评估', priority: 'P0-关键', effort: '1人月' },
                  { no: 3, name: '分包看管派单逻辑适配', desc: '精益平台分包看管派单逻辑（全球通等级→客户经理/10088/网格经理，宽带→装维）需适配集团版本的调度类型分类，确保不同调度类型（指标/策略/客群/商机/区域攻坚）都能正确匹配执行渠道', priority: 'P0-关键', effort: '1人月' },
                  { no: 4, name: '预警指标数据迁移', desc: '将精益平台预警配置数据（离网概率阈值、携转预警规则、合约到期规则等）迁移至集团指标中心，并确保集团指标中心能触发精益平台的预警流程', priority: 'P1-重要', effort: '1人月' },
                  { no: 5, name: '工单类型扩展', desc: '精益平台现有工单类型（保有类/营销类/维系类/管理类/提醒类）需扩展以支持集团版本的6种调度类型（指标/策略/客群/客户商机/客群商机/区域攻坚），建立类型映射关系', priority: 'P1-重要', effort: '1人月' },
                  { no: 6, name: '策略中心接口适配', desc: '精益平台策略中心（画布式策划+审批流）需提供标准API供集团版本调用，实现策略的创建/查询/审批/执行全链路打通', priority: 'P1-重要', effort: '1.5人月' },
                  { no: 7, name: '评估数据对接', desc: '精益平台工单效能评估、策略转化评估、渠道效能评估的数据需按集团标准格式输出，供集团版本评估中心汇总展示', priority: 'P2-一般', effort: '1人月' },
                  { no: 8, name: '菜单结构改造', desc: '精益平台菜单需按集团规范重新组织（运营概览/运营专区/能力中心/基础功能），精益平台原有功能作为子模块嵌入', priority: 'P2-一般', effort: '0.5人月' },
                  { no: 9, name: '4A统一认证对接', desc: '确保集团版本和精益平台共用同一4A认证体系，实现单点登录和统一权限管理', priority: 'P1-重要', effort: '0.5人月' },
                ].map(row => (
                  <TableRow key={row.no}>
                    <TableCell className="text-center">{row.no}</TableCell>
                    <TableCell className="font-medium text-sm">{row.name}</TableCell>
                    <TableCell className="text-xs">{row.desc}</TableCell>
                    <TableCell>
                      <Badge variant={row.priority.includes('P0') ? 'default' : row.priority.includes('P1') ? 'outline' : 'secondary'} className="text-xs">
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{row.effort}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <strong>精益平台侧配合工作总量预估：约 10.5 人月</strong>
              <span className="text-muted-foreground ml-2">（其中P0关键项 5人月，P1重要项 3人月，P2一般项 2.5人月）</span>
            </div>
          </CardContent>
        </Card>

        {/* ─── 总结 ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              总结与建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="font-medium text-emerald-800 mb-2">精益平台核心可复用能力</div>
                <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc">
                  <li><strong>调度执行层</strong>：已打通网格通+IOP+在线+装维四大下游触点，工单下发与反馈链路完整</li>
                  <li><strong>分包看管派单</strong>：基于客户属性自动匹配执行渠道的派单逻辑，是核心差异化能力</li>
                  <li><strong>预警配置与触发</strong>：6大预警场景（携转/全球通离网/宽带离网/异动修复/全球通投诉/合约到期）成熟</li>
                  <li><strong>策略中心</strong>：画布式策略策划+AI话术+审批流，能力完善</li>
                  <li><strong>渠道效能评估</strong>：多渠道对比+四级下钻，评估体系完整</li>
                  <li><strong>任务督办</strong>：督办全流程（新增/审批/变更/下线）成熟</li>
                  <li><strong>外围系统对接</strong>：10大系统对接（大数据+精准营销+CRM+IOP+网格通+在线+装维+4A+OA+产商品）</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="font-medium text-red-800 mb-2">需新建的核心能力（集团版本自带）</div>
                <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                  <li><strong>指标树</strong>：多层级指标拆解+异动监控+根因分析</li>
                  <li><strong>商机体系</strong>：商机识别→评级→匹配→调度全链路</li>
                  <li><strong>区域攻坚</strong>：GIS地图+攻坚区域识别+作战指挥</li>
                  <li><strong>流量运营</strong>：流量指标体系+客群驱动+商机驱动</li>
                  <li><strong>家庭融合运营</strong>：家庭客户运营场景</li>
                  <li><strong>校园运营</strong>：校园客户运营场景</li>
                  <li><strong>ABTest分析</strong>：运营策略效果对比验证</li>
                  <li><strong>AI异常分析</strong>：共性问题识别+优化建议</li>
                  <li><strong>数据稽核</strong>：事前校验+事后审计</li>
                </ul>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="font-medium text-blue-800 mb-2">实施路径建议</div>
              <ol className="text-xs text-blue-700 space-y-2 ml-4 list-decimal">
                <li><strong>第一阶段</strong>：部署集团标准版本，开通指标中心+运营概览+各运营专区框架，指标库直接使用集团版本</li>
                <li><strong>第二阶段</strong>：建设精益平台调度适配服务，打通集团版本→精益平台→下游触点的工单调度链路</li>
                <li><strong>第三阶段</strong>：将精益平台预警场景（携转/全球通/宽带/合约等）接入集团版本，复用精益平台预警+调度能力</li>
                <li><strong>第四阶段</strong>：建设集团版本独有的新能力（指标树+商机+区域攻坚+ABTest+AI分析等）</li>
                <li><strong>第五阶段</strong>：统一数据口径，完善评估体系，实现集团版本和精益平台的数据融合和展示统一</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
