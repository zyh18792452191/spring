'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTabs } from '@/contexts/TabsContext';
import { maskPhone } from '@/lib/mask';
import { getDispatchTypeByLabel } from '@/lib/dispatch-system';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, RotateCcw, Download, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== 工单类型分类 ====================
const workOrderCategoryMap: Record<string, string[]> = {
  '管理类': ['指标调度', '预警规则审批'],
  '生产类': ['策略调度', '客群调度', '商机调度', '区域攻坚调度', '预警调度', '保有任务调度', '督办调度'],
};
const allWorkOrderTypes = Object.values(workOrderCategoryMap).flat();

const getCategoryByType = (type: string) => {
  for (const [cat, types] of Object.entries(workOrderCategoryMap)) {
    if (types.includes(type)) return cat;
  }
  return '';
};

// ==================== 新疆区域数据 ====================
const xingjiangCities = [
  { name: '乌鲁木齐', districts: [{ name: '天山区', grids: ['天山网格1', '天山网格2'] }, { name: '沙依巴克区', grids: ['沙区网格1', '沙区网格2'] }, { name: '新市区', grids: ['新市网格1', '新市网格2'] }, { name: '水磨沟区', grids: ['水区网格1', '水区网格2'] }] },
  { name: '克拉玛依', districts: [{ name: '克拉玛依区', grids: ['克区网格1', '克区网格2'] }, { name: '独山子区', grids: ['独山子网格1'] }] },
  { name: '吐鲁番', districts: [{ name: '高昌区', grids: ['高昌网格1'] }, { name: '鄯善县', grids: ['鄯善网格1'] }] },
  { name: '哈密', districts: [{ name: '伊州区', grids: ['伊州网格1'] }] },
  { name: '昌吉', districts: [{ name: '昌吉市', grids: ['昌吉网格1'] }, { name: '阜康市', grids: ['阜康网格1'] }] },
  { name: '博州', districts: [{ name: '博乐市', grids: ['博乐网格1'] }] },
  { name: '巴州', districts: [{ name: '库尔勒市', grids: ['库尔勒网格1'] }, { name: '焉耆县', grids: ['焉耆网格1'] }] },
  { name: '阿克苏', districts: [{ name: '阿克苏市', grids: ['阿克苏网格1'] }] },
  { name: '克州', districts: [{ name: '阿图什市', grids: ['阿图什网格1'] }] },
  { name: '喀什', districts: [{ name: '喀什市', grids: ['喀什网格1'] }] },
  { name: '和田', districts: [{ name: '和田市', grids: ['和田网格1'] }] },
  { name: '伊犁', districts: [{ name: '伊宁市', grids: ['伊宁网格1'] }] },
  { name: '塔城', districts: [{ name: '塔城市', grids: ['塔城网格1'] }, { name: '乌苏市', grids: ['乌苏网格1'] }] },
  { name: '阿勒泰', districts: [{ name: '阿勒泰市', grids: ['阿勒泰网格1'] }] },
  { name: '奎屯', districts: [{ name: '奎屯市', grids: ['奎屯网格1'] }] },
  { name: '石河子', districts: [{ name: '石河子市', grids: ['石河子网格1'] }] },
];

// ==================== 状态标签组件 ====================
function StatusBadge({ type, value }: { type: string; value: string }) {
  const colorMap: Record<string, string> = {
    '处理中': 'bg-blue-500 text-white',
    '已完成': 'bg-gray-400 text-white',
    '进行中': 'bg-blue-500 text-white',
    '正常': 'bg-green-500 text-white',
    '已超时': 'bg-red-500 text-white',
    '失败': 'bg-gray-400 text-white',
    '成功': 'bg-green-500 text-white',
  };
  const color = colorMap[value] || 'bg-gray-400 text-white';
  if (type === 'order' && (value === '处理中' || value === '已完成')) {
    return <span className="flex items-center gap-1 text-xs"><span className={cn('w-1.5 h-1.5 rounded-full', value === '处理中' ? 'bg-blue-500' : 'bg-gray-400')}></span>{value}</span>;
  }
  return <span className={cn('text-xs px-1.5 py-0.5 rounded', color)}>{value}</span>;
}

// ==================== 数据类型 ====================
interface WorkOrder {
  id: string;
  title: string;
  type: string;
  alertType?: string;
  businessScene?: string;
  executionMode?: string;
  description: string;
  orderStatus: string;
  flowStatus: string;
  processStatus: string;
  timeoutStatus: string;
  processResult: string;
  customerPhone: string;
  currentStep: string;
  currentHandler: string;
  city: string;
  district: string;
  grid: string;
  updateTime: string;
  creator: string;
  createTime: string;
}

// ==================== 模拟数据生成 ====================
function generateMockData(): WorkOrder[] {
  const types = ['指标调度', '策略调度', '客群调度', '商机调度', '区域攻坚调度', '预警调度', '保有任务调度'];
  const alertTypes = ['携转预警', '宽带离网预警', '全球通离网预警', '投诉工单预警', '热线商机预警', '异动客户预警', '全球通客户离网追溯', '全球通客户停机赢回预警', '全球通停机客户赢回-铁通预警'];
  const executionModes = ['分包看管执行', '在线执行', '在线+分包看管执行', '自定义'] as const;
  const executionStepMap: Record<string, string> = {
    '在线执行': '在线处理',
    '分包看管执行': '10088处理',
    '在线+分包看管执行': '网格经理处理',
    '自定义': '地市集运处理',
  };
  const executionHandlerMap: Record<string, string> = {
    '在线执行': '在线系统',
    '分包看管执行': '10088坐席',
    '在线+分包看管执行': '网格经理',
    '自定义': '地市集运',
  };
  const cities = xingjiangCities.map(c => c.name);
  const steps = ['三级经理审批', '区领导审批', '生成营销群组', '网格端/KPI调度', '地州公司反馈', '指标调度-子流程-地州', '生成省群明细'];
  const handlers = ['新疆运营人员', '新疆市场部领导', '塔城运营人员', '博州运营人员', '马光超', '超级管理员', '超级王'];
  const titles = [
    '5G数据流量(MB)未达标', '当月DOU未达标', '累计本地数据流量(MB)未达标',
    '当月流量增幅未达标', '当月流量增量未达标', '剩余流量未达标',
    '2026年05月份塔城未达标', '移动数据流量收入未达标',
  ];
  const descriptions = [
    '当月流量增幅-0.3651000000pp 环比-0.7302000000pp没有达到公司要求。请反馈指标落后原因并制定提升计划。',
    '2026年05月当月流量增幅达50.05%、环比下降0.99pp，请如下网格反馈指标落后原因并参照相应策略对客户进行营销。',
    '202605月新疆累计本地数据流量(MB)达2.67亿GB, 环比下降0.02%, 请各网格参照相应策略对客户进行营销。',
    '202605月新疆5G数据流量(MB)达2.31亿GB, 环比下降0.02%, 请各网格参照相应策略。',
    '202605月新疆移动数据流量收入达3.83亿元, 环比上升0.01%, 请各网格参照相应策略。',
    '202605月新疆当月流量增幅达0.05%, 环比下降39pp, 请各网格参照相应策略对客...',
  ];

  const data: WorkOrder[] = [];
  const baseDate = new Date('2026-06-29');

  for (let i = 0; i < 412; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const cityIdx = Math.floor(Math.random() * cities.length);
    const city = cities[cityIdx];
    const cityData = xingjiangCities[cityIdx];

    // 预警调度必须地市/区县/网格全不为空
    const isAlertDispatch = type === '预警调度';
    const hasDistrict = isAlertDispatch ? true : Math.random() > 0.6;
    const district = hasDistrict && cityData.districts.length > 0 ? cityData.districts[Math.floor(Math.random() * cityData.districts.length)].name : '--';
    const grid = hasDistrict && district !== '--' ? (() => {
      const d = cityData.districts.find(dd => dd.name === district);
      return d && d.grids.length > 0 ? d.grids[Math.floor(Math.random() * d.grids.length)] : '--';
    })() : '--';

    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

    const isCompleted = Math.random() > 0.85;
    const isTimeout = Math.random() > 0.9;

    // 预警调度：预警类型=任务类，业务类型=携转预警等，执行模式=分包看管执行等
    const alertDispatchExecMode = executionModes[Math.floor(Math.random() * executionModes.length)];

    data.push({
      id: String(53575000000000000 + Math.floor(Math.random() * 90000000000000)),
      title: isAlertDispatch
        ? `${alertTypes[Math.floor(Math.random() * alertTypes.length)]}-客户触达工单`
        : (titles[Math.floor(Math.random() * titles.length)] + (Math.random() > 0.7 ? (city !== '乌鲁木齐' ? '' : '') : '')),
      type,
      alertType: isAlertDispatch ? '任务类' : undefined,
      businessScene: isAlertDispatch ? alertTypes[Math.floor(Math.random() * alertTypes.length)] : (type === '保有任务调度' ? alertTypes[Math.floor(Math.random() * alertTypes.length)] : undefined),
      executionMode: isAlertDispatch ? alertDispatchExecMode : (type === '保有任务调度' ? ['区公司执行', '地市执行'][Math.floor(Math.random() * 2)] : undefined),
      description: isAlertDispatch
        ? '预警规则触发，系统自动生成客户触达工单，由网格通执行客户维系'
        : (Math.random() > 0.3 ? descriptions[Math.floor(Math.random() * descriptions.length)] : '--'),
      orderStatus: isCompleted ? 'completed' : 'processing',
      flowStatus: isCompleted ? 'completed' : 'inProgress',
      processStatus: isCompleted ? 'completed' : 'inProgress',
      timeoutStatus: isTimeout ? 'timeout' : 'normal',
      processResult: isCompleted ? (Math.random() > 0.3 ? 'success' : 'failure') : '',
      customerPhone: isAlertDispatch
        ? `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`
        : (Math.random() > 0.8 ? `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}` : '--'),
      currentStep: isAlertDispatch
        ? (isCompleted ? '--' : executionStepMap[alertDispatchExecMode])
        : (isCompleted ? '--' : steps[Math.floor(Math.random() * steps.length)]),
      currentHandler: isAlertDispatch
        ? (isCompleted ? '--' : executionHandlerMap[alertDispatchExecMode])
        : (isCompleted ? '--' : handlers[Math.floor(Math.random() * handlers.length)]),
      city: isAlertDispatch ? city : (Math.random() > 0.4 ? city : '--'),
      district,
      grid,
      updateTime: dateStr,
      creator: isAlertDispatch ? '系统自动' : handlers[Math.floor(Math.random() * handlers.length)],
      createTime: dateStr,
    });
  }

  return data.sort((a, b) => b.createTime.localeCompare(a.createTime));
}

const allMockData = generateMockData();

// ==================== 督办调度 mock 数据（已完成状态，点击详情 → 我的督办任务-已完成查看页）====================
const supervisionQueryOrders: WorkOrder[] = [
  {
    id: 'SUP-2026-0804',
    title: '塔城宽带续费督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务已完成审批。',
    orderStatus: 'completed',
    flowStatus: 'completed',
    processStatus: 'completed',
    timeoutStatus: 'normal',
    processResult: 'success',
    customerPhone: '--',
    currentStep: '--',
    currentHandler: '--',
    city: '塔城',
    district: '',
    grid: '',
    updateTime: '2026-08-04 15:30:00',
    creator: '王经理',
    createTime: '2026-08-02 16:30:00',
  },
  {
    id: 'SUP-2026-0805',
    title: '伊犁携转挽留督办',
    type: '督办调度',
    businessScene: '预警工单督办',
    description: '督办任务已完成审批。',
    orderStatus: 'completed',
    flowStatus: 'completed',
    processStatus: 'completed',
    timeoutStatus: 'normal',
    processResult: 'success',
    customerPhone: '--',
    currentStep: '--',
    currentHandler: '--',
    city: '伊犁',
    district: '',
    grid: '',
    updateTime: '2026-08-03 17:00:00',
    creator: '孙主管',
    createTime: '2026-08-01 09:00:00',
  },
  {
    id: 'SUP-2026-0811',
    title: '克拉玛依流量增收督办',
    type: '督办调度',
    businessScene: '保有任务督办',
    description: '督办任务已完成审批。',
    orderStatus: 'completed',
    flowStatus: 'completed',
    processStatus: 'completed',
    timeoutStatus: 'normal',
    processResult: 'success',
    customerPhone: '--',
    currentStep: '--',
    currentHandler: '--',
    city: '克拉玛依',
    district: '',
    grid: '',
    updateTime: '2026-07-22 16:00:00',
    creator: '孙主管',
    createTime: '2026-07-18 16:00:00',
  },
  {
    id: 'SUP-2026-0812',
    title: '吐鲁番区域攻坚督办',
    type: '督办调度',
    businessScene: '其他督办任务',
    description: '督办任务已完成审批。',
    orderStatus: 'completed',
    flowStatus: 'completed',
    processStatus: 'completed',
    timeoutStatus: 'normal',
    processResult: 'success',
    customerPhone: '--',
    currentStep: '--',
    currentHandler: '--',
    city: '吐鲁番',
    district: '',
    grid: '',
    updateTime: '2026-07-20 11:00:00',
    creator: '孙主管',
    createTime: '2026-07-15 11:00:00',
  },
];

// 合并督办调度数据到全量数据
const mergedMockData = [...supervisionQueryOrders, ...allMockData];

export default function WorkOrderQueryPage() {
  const router = useRouter();
  const { addTab } = useTabs();

  // 合并localStorage提交的工单到模拟数据
  const [mergedData, setMergedData] = useState<WorkOrder[]>(() => {
    const base = [...mergedMockData];
    try {
      const stored = localStorage.getItem('pendingWorkOrders');
      if (stored) {
        const pendingOrders: WorkOrder[] = JSON.parse(stored);
        const existingIds = new Set(base.map(o => o.id));
        const newOrders = pendingOrders.filter(o => !existingIds.has(o.id));
        if (newOrders.length > 0) {
          return [...newOrders, ...base];
        }
      }
    } catch { /* ignore */ }
    return base;
  });

  // 监听localStorage变化
  useEffect(() => {
    const handleStorage = () => {
      const base = [...mergedMockData];
      try {
        const stored = localStorage.getItem('pendingWorkOrders');
        if (stored) {
          const pendingOrders: WorkOrder[] = JSON.parse(stored);
          const existingIds = new Set(base.map(o => o.id));
          const newOrders = pendingOrders.filter(o => !existingIds.has(o.id));
          if (newOrders.length > 0) {
            setMergedData([...newOrders, ...base]);
            return;
          }
        }
      } catch { /* ignore */ }
      setMergedData(base);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  // 基础筛选
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchTimeout, setSearchTimeout] = useState('all');
  const [defaultRange, setDefaultRange] = useState<'month' | 'all'>('month');

  // 从URL参数初始化筛选（如从预警规则审批详情跳转过来）
  const [urlParamsInitialized, setUrlParamsInitialized] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !urlParamsInitialized) {
      const params = new URLSearchParams(window.location.search);
      const urlType = params.get('type');
      const urlSearchId = params.get('searchId');
      if (urlType) {
        setSelectedTypes([urlType]);
      }
      if (urlSearchId) {
        setSearchId(urlSearchId);
      }
      if (urlType || urlSearchId) {
        setUrlParamsInitialized(true);
      }
    }
  }, [urlParamsInitialized]);

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 高级搜索面板
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);

  // 工单类型多选切换
  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  // 折叠状态
  const [collapseOrder, setCollapseOrder] = useState(false);
  const [collapseBiz, setCollapseBiz] = useState(false);
  const [collapseExtra, setCollapseExtra] = useState(false);

  // 高级搜索字段
  const [advOrderStatus, setAdvOrderStatus] = useState('all');
  const [advFlowStatus, setAdvFlowStatus] = useState('all');
  const [advTimeout, setAdvTimeout] = useState('all');
  const [advResult, setAdvResult] = useState('all');
  const [advCustomerNo, setAdvCustomerNo] = useState('');
  const [advCurrentStep, setAdvCurrentStep] = useState('');
  const [advGrid, setAdvGrid] = useState('');
  const [advUpdateTimeStart, setAdvUpdateTimeStart] = useState('');
  const [advUpdateTimeEnd, setAdvUpdateTimeEnd] = useState('');
  const [advCreator, setAdvCreator] = useState('');
  const [advCreateTimeStart, setAdvCreateTimeStart] = useState('');
  const [advCreateTimeEnd, setAdvCreateTimeEnd] = useState('');
  const [advCreateCity, setAdvCreateCity] = useState('all');
  const [advCreateDistrict, setAdvCreateDistrict] = useState('all');
  const [advCreateGrid, setAdvCreateGrid] = useState('all');
  const [advReceiveCity, setAdvReceiveCity] = useState('all');
  const [advReceiveDistrict, setAdvReceiveDistrict] = useState('all');
  const [advReceiveGrid, setAdvReceiveGrid] = useState('all');
  const [advProcessName, setAdvProcessName] = useState('all');
  const [advStepName, setAdvStepName] = useState('all');

  // 建单侧区县联动
  const createDistrictOptions = useMemo(() => {
    if (advCreateCity === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advCreateCity);
    return city ? city.districts.map(d => d.name) : [];
  }, [advCreateCity]);

  const createGridOptions = useMemo(() => {
    if (advCreateCity === 'all' || advCreateDistrict === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advCreateCity);
    if (!city) return [];
    const district = city.districts.find(d => d.name === advCreateDistrict);
    return district ? district.grids : [];
  }, [advCreateCity, advCreateDistrict]);

  // 接单侧区县联动
  const receiveDistrictOptions = useMemo(() => {
    if (advReceiveCity === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advReceiveCity);
    return city ? city.districts.map(d => d.name) : [];
  }, [advReceiveCity]);

  const receiveGridOptions = useMemo(() => {
    if (advReceiveCity === 'all' || advReceiveDistrict === 'all') return [];
    const city = xingjiangCities.find(c => c.name === advReceiveCity);
    if (!city) return [];
    const district = city.districts.find(d => d.name === advReceiveDistrict);
    return district ? district.grids : [];
  }, [advReceiveCity, advReceiveDistrict]);

  // 数据筛选
  const currentData = useMemo(() => {
    let data = [...mergedData];

    // 默认查询范围
    if (defaultRange === 'month') {
      const oneMonthAgo = new Date('2026-05-29');
      data = data.filter(o => new Date(o.createTime) >= oneMonthAgo);
    }

    if (searchId) {
      data = data.filter(o => o.id.includes(searchId));
    }
    if (searchTitle) {
      data = data.filter(o => o.title.includes(searchTitle));
    }
    if (selectedTypes.length > 0) {
      data = data.filter(o => selectedTypes.includes(o.type));
    }
    if (searchTimeout !== 'all') {
      if (searchTimeout === 'yes') {
        data = data.filter(o => o.timeoutStatus === 'timeout');
      } else {
        data = data.filter(o => o.timeoutStatus === 'normal');
      }
    }

    // 高级搜索条件
    if (advOrderStatus !== 'all') {
      data = data.filter(o => o.orderStatus === advOrderStatus);
    }
    if (advFlowStatus !== 'all') {
      data = data.filter(o => o.flowStatus === advFlowStatus);
    }
    if (advTimeout !== 'all') {
      if (advTimeout === 'timeout') {
        data = data.filter(o => o.timeoutStatus === 'timeout');
      } else {
        data = data.filter(o => o.timeoutStatus === 'normal');
      }
    }
    if (advResult !== 'all') {
      data = data.filter(o => o.processResult === advResult);
    }
    if (advCustomerNo) {
      data = data.filter(o => o.customerPhone && o.customerPhone.includes(advCustomerNo));
    }
    if (advCurrentStep) {
      data = data.filter(o => o.currentStep && o.currentStep.includes(advCurrentStep));
    }
    if (advGrid) {
      data = data.filter(o => o.grid && o.grid.includes(advGrid));
    }
    if (advCreator) {
      data = data.filter(o => o.creator.includes(advCreator));
    }
    if (advCreateCity !== 'all') {
      data = data.filter(o => o.city === advCreateCity);
    }
    if (advCreateDistrict !== 'all') {
      data = data.filter(o => o.district === advCreateDistrict);
    }
    if (advCreateGrid !== 'all') {
      data = data.filter(o => o.grid === advCreateGrid);
    }
    if (advReceiveCity !== 'all') {
      data = data.filter(o => o.city === advReceiveCity);
    }
    if (advReceiveDistrict !== 'all') {
      data = data.filter(o => o.district === advReceiveDistrict);
    }
    if (advReceiveGrid !== 'all') {
      data = data.filter(o => o.grid === advReceiveGrid);
    }

    return data;
  }, [mergedData, defaultRange, searchId, searchTitle, selectedTypes, searchTimeout,
      advOrderStatus, advFlowStatus, advTimeout, advResult, advCustomerNo,
      advCurrentStep, advGrid, advCreator, advCreateCity, advCreateDistrict,
      advCreateGrid, advReceiveCity, advReceiveDistrict, advReceiveGrid]);

  const totalPages = Math.max(1, Math.ceil(currentData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageData = currentData.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleReset = () => {
    setSearchId('');
    setSearchTitle('');
    setSelectedTypes([]);
    setSearchTimeout('all');
    setDefaultRange('month');
    resetAdvanced();
    setCurrentPage(1);
  };

  const resetAdvanced = () => {
    setAdvOrderStatus('all');
    setAdvFlowStatus('all');
    setAdvTimeout('all');
    setAdvResult('all');
    setAdvCustomerNo('');
    setAdvCurrentStep('');
    setAdvGrid('');
    setAdvUpdateTimeStart('');
    setAdvUpdateTimeEnd('');
    setAdvCreator('');
    setAdvCreateTimeStart('');
    setAdvCreateTimeEnd('');
    setAdvCreateCity('all');
    setAdvCreateDistrict('all');
    setAdvCreateGrid('all');
    setAdvReceiveCity('all');
    setAdvReceiveDistrict('all');
    setAdvReceiveGrid('all');
    setAdvProcessName('all');
    setAdvStepName('all');
  };

  const handleViewDetail = (orderId: string, orderType: string, orderStatus?: string) => {
    const fromPath = encodeURIComponent('/workspace/dispatch/query');

    // 督办调度：跳转至我的督办任务-已完成查看页
    if (orderType === '督办调度') {
      const path = `/workspace/dispatch/my-supervision/detail?id=${orderId}&fromPath=${fromPath}`;
      addTab({ id: path, title: '督办详情', path });
      router.push(path);
      return;
    }

    const type = getDispatchTypeByLabel(orderType);
    const statusParam = orderStatus === 'completed' ? '&status=completed' : '';
    const path = `/workspace/ticket-detail?id=${orderId}&type=${type}&fromPath=${fromPath}&mode=view${statusParam}`;
    addTab({ id: path, title: '工单详情', path });
    router.push(path);
  };

  // 分页器
  const renderPagination = () => {
    const total = currentData.length;
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-between px-2 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          共 {total} 条
        </div>
        <div className="flex items-center gap-1">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[80px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(safeCurrentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
            ) : (
              <Button
                key={p}
                variant={p === safeCurrentPage ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-sm"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(safeCurrentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 ml-2 text-sm text-muted-foreground">
            前往
            <Input
              className="w-12 h-8 text-center text-sm"
              value={safeCurrentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 1 && v <= totalPages) {
                  setCurrentPage(v);
                }
              }}
            />
            页
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 筛选查询区 */}
      <div className="px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单编号:</span>
            <Input
              placeholder="请输入"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单标题:</span>
            <Input
              placeholder="请输入"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-36 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">工单类型:</span>
            <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-52 justify-between text-sm font-normal">
                  {selectedTypes.length === 0
                    ? '请选择'
                    : selectedTypes.length === 1
                      ? selectedTypes[0]
                      : `已选${selectedTypes.length}项`}
                  <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2">
                  <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                      setSelectedTypes([...allWorkOrderTypes]);
                    }}>全选</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => {
                      setSelectedTypes([]);
                    }}>清空</Button>
                  </div>
                  {/* 管理类 */}
                  <div className="mb-1">
                    <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const mgmtTypes = workOrderCategoryMap['管理类'];
                        const allSelected = mgmtTypes.every(t => selectedTypes.includes(t));
                        if (allSelected) {
                          setSelectedTypes(prev => prev.filter(t => !mgmtTypes.includes(t)));
                        } else {
                          setSelectedTypes(prev => [...new Set([...prev, ...mgmtTypes])]);
                        }
                      }}>
                      <Checkbox checked={workOrderCategoryMap['管理类'].every(t => selectedTypes.includes(t))} className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">管理类</span>
                    </div>
                    <div className="ml-5">
                      {workOrderCategoryMap['管理类'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleType(t); }}>
                          <Checkbox checked={selectedTypes.includes(t)} className="h-3.5 w-3.5" />
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 生产类 */}
                  <div>
                    <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const prodTypes = workOrderCategoryMap['生产类'];
                        const allSelected = prodTypes.every(t2 => selectedTypes.includes(t2));
                        if (allSelected) {
                          setSelectedTypes(prev => prev.filter(t2 => !prodTypes.includes(t2)));
                        } else {
                          setSelectedTypes(prev => [...new Set([...prev, ...prodTypes])]);
                        }
                      }}>
                      <Checkbox checked={workOrderCategoryMap['生产类'].every(t => selectedTypes.includes(t))} className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">生产类</span>
                    </div>
                    <div className="ml-5">
                      {workOrderCategoryMap['生产类'].map(t => (
                        <div key={t} className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleType(t); }}>
                          <Checkbox checked={selectedTypes.includes(t)} className="h-3.5 w-3.5" />
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground whitespace-nowrap">超时状态:</span>
            <Select value={searchTimeout} onValueChange={setSearchTimeout}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="yes">已超时</SelectItem>
                <SelectItem value="no">正常</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 默认查询范围 */}
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateRangeQuery"
                checked={defaultRange === 'month'}
                onChange={() => { setDefaultRange('month'); setCurrentPage(1); }}
                className="accent-primary"
              />
              <span className="text-muted-foreground">默认查询一个月</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateRangeQuery"
                checked={defaultRange === 'all'}
                onChange={() => { setDefaultRange('all'); setCurrentPage(1); }}
                className="accent-primary"
              />
              <span className="text-muted-foreground">默认查询全部数据</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-primary text-sm hover:underline flex items-center gap-1"
            >
              高级搜索
              {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <Button variant="outline" size="sm" className="h-8" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              重置
            </Button>
            <Button size="sm" className="h-8" onClick={() => setCurrentPage(1)}>
              <Search className="h-3.5 w-3.5 mr-1" />
              查询
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1" />
              异步导出
            </Button>
          </div>
        </div>

        {/* 高级搜索面板（内嵌，无遮罩） */}
        {advancedOpen && (
          <div className="bg-card border border-border rounded-md shadow-sm p-4 space-y-3 mt-3">
            {/* 工单条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">工单条件</span>
                <button onClick={() => setCollapseOrder(!collapseOrder)} className="text-primary text-xs flex items-center gap-1">
                  {collapseOrder ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseOrder && 'rotate-180')} />
                </button>
              </div>
              {!collapseOrder && (
                <div className="grid grid-cols-3 gap-4 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">工单状态:</span>
                    <Select value={advOrderStatus} onValueChange={setAdvOrderStatus}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择工单状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="processing">处理中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">流程状态:</span>
                    <Select value={advFlowStatus} onValueChange={setAdvFlowStatus}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择流程状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="inProgress">进行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">超时状态:</span>
                    <Select value={advTimeout} onValueChange={setAdvTimeout}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择超时状态" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="timeout">已超时</SelectItem>
                        <SelectItem value="normal">正常</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* 业务条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">业务条件</span>
                <button onClick={() => setCollapseBiz(!collapseBiz)} className="text-primary text-xs flex items-center gap-1">
                  {collapseBiz ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseBiz && 'rotate-180')} />
                </button>
              </div>
              {!collapseBiz && (
                <div className="grid grid-cols-3 gap-4 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">处理结果:</span>
                    <Select value={advResult} onValueChange={setAdvResult}>
                      <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择处理结果" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                        <SelectItem value="failure">失败</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">客户号码:</span>
                    <Input placeholder="请输入客户号码" value={advCustomerNo} onChange={(e) => setAdvCustomerNo(e.target.value)} className="flex-1 h-8 text-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* 附加条件 */}
            <div className="border border-dashed border-border rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-t-md">
                <span className="text-sm font-medium">附加条件</span>
                <button onClick={() => setCollapseExtra(!collapseExtra)} className="text-primary text-xs flex items-center gap-1">
                  {collapseExtra ? '展开' : '收起'} <ChevronUp className={cn('h-3 w-3 transition-transform', collapseExtra && 'rotate-180')} />
                </button>
              </div>
              {!collapseExtra && (
                <div className="space-y-3 px-4 py-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">当前环节:</span>
                      <Input placeholder="请输入当前环节" value={advCurrentStep} onChange={(e) => setAdvCurrentStep(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">网格:</span>
                      <Input placeholder="请输入网格" value={advGrid} onChange={(e) => setAdvGrid(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">更新时间:</span>
                      <div className="flex items-center gap-1 flex-1">
                        <Input type="date" value={advUpdateTimeStart} onChange={(e) => setAdvUpdateTimeStart(e.target.value)} className="flex-1 h-8 text-sm" />
                        <span className="text-xs text-muted-foreground">至</span>
                        <Input type="date" value={advUpdateTimeEnd} onChange={(e) => setAdvUpdateTimeEnd(e.target.value)} className="flex-1 h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">提单人:</span>
                      <Input placeholder="请输入提单人" value={advCreator} onChange={(e) => setAdvCreator(e.target.value)} className="flex-1 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">提单时间:</span>
                      <div className="flex items-center gap-1 flex-1">
                        <Input type="date" value={advCreateTimeStart} onChange={(e) => setAdvCreateTimeStart(e.target.value)} className="flex-1 h-8 text-sm" />
                        <span className="text-xs text-muted-foreground">至</span>
                        <Input type="date" value={advCreateTimeEnd} onChange={(e) => setAdvCreateTimeEnd(e.target.value)} className="flex-1 h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单地市:</span>
                      <Select value={advCreateCity} onValueChange={(v) => { setAdvCreateCity(v); setAdvCreateDistrict('all'); setAdvCreateGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单地市" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {xingjiangCities.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单区县:</span>
                      <Select value={advCreateDistrict} onValueChange={(v) => { setAdvCreateDistrict(v); setAdvCreateGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单区县" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {createDistrictOptions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">建单网格:</span>
                      <Select value={advCreateGrid} onValueChange={setAdvCreateGrid}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择建单网格" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {createGridOptions.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单地市:</span>
                      <Select value={advReceiveCity} onValueChange={(v) => { setAdvReceiveCity(v); setAdvReceiveDistrict('all'); setAdvReceiveGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单地市" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {xingjiangCities.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单区县:</span>
                      <Select value={advReceiveDistrict} onValueChange={(v) => { setAdvReceiveDistrict(v); setAdvReceiveGrid('all'); }}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单区县" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {receiveDistrictOptions.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">接单网格:</span>
                      <Select value={advReceiveGrid} onValueChange={setAdvReceiveGrid}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择接单网格" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {receiveGridOptions.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">流程名称:</span>
                      <Select value={advProcessName} onValueChange={setAdvProcessName}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择流程名称" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="指标调度流程">指标调度流程</SelectItem>
                          <SelectItem value="策略调度流程">策略调度流程</SelectItem>
                          <SelectItem value="客群调度流程">客群调度流程</SelectItem>
                          <SelectItem value="商机调度流程">商机调度流程</SelectItem>
                          <SelectItem value="区域攻坚调度流程">区域攻坚调度流程</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground whitespace-nowrap min-w-[60px]">环节名称:</span>
                      <Select value={advStepName} onValueChange={setAdvStepName}>
                        <SelectTrigger className="flex-1 h-8 text-sm"><SelectValue placeholder="请选择环节名称" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="三级经理审批">三级经理审批</SelectItem>
                          <SelectItem value="区领导审批">区领导审批</SelectItem>
                          <SelectItem value="生成营销群组">生成营销群组</SelectItem>
                          <SelectItem value="网格端/KPI调度">网格端/KPI调度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 表格区 */}
      <div className="flex-1 overflow-auto px-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium w-48">工单编码</TableHead>
              <TableHead className="text-xs font-medium w-44">工单标题</TableHead>
              <TableHead className="text-xs font-medium w-36">工单类型</TableHead>
              <TableHead className="text-xs font-medium w-28">预警类型</TableHead>
              <TableHead className="text-xs font-medium w-24">业务类型</TableHead>
              <TableHead className="text-xs font-medium w-24">执行模式</TableHead>
              <TableHead className="text-xs font-medium min-w-[200px]">工单描述</TableHead>
              <TableHead className="text-xs font-medium w-20">工单状态</TableHead>
              <TableHead className="text-xs font-medium w-20">处理状态</TableHead>
              <TableHead className="text-xs font-medium w-20">超时状态</TableHead>
              <TableHead className="text-xs font-medium w-20">处理结果</TableHead>
              <TableHead className="text-xs font-medium w-32">客户号码</TableHead>
              <TableHead className="text-xs font-medium w-36">当前环节</TableHead>
              <TableHead className="text-xs font-medium w-28">当前处理人</TableHead>
              <TableHead className="text-xs font-medium w-20">地市</TableHead>
              <TableHead className="text-xs font-medium w-20">区县</TableHead>
              <TableHead className="text-xs font-medium w-24">网格</TableHead>
              <TableHead className="text-xs font-medium w-40">更新时间</TableHead>
              <TableHead className="text-xs font-medium w-24">提单人</TableHead>
              <TableHead className="text-xs font-medium w-40">提单时间</TableHead>
              <TableHead className="text-xs font-medium w-28 sticky right-0 bg-muted/50">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={21} className="h-32 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-mono text-primary">{order.id}</TableCell>
                  <TableCell className="text-xs">{order.title}</TableCell>
                  <TableCell className="text-xs">{getCategoryByType(order.type)}/{order.type}</TableCell>
                  <TableCell className="text-xs">{order.alertType || '--'}</TableCell>
                  <TableCell className="text-xs">{order.businessScene || '--'}</TableCell>
                  <TableCell className="text-xs">{order.executionMode || '--'}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate" title={order.description}>
                    {order.description}
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="order" value={order.orderStatus === 'processing' ? '处理中' : '已完成'} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="flow" value={order.processStatus === 'inProgress' ? '进行中' : '已完成'} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge type="timeout" value={order.timeoutStatus === 'timeout' ? '已超时' : '正常'} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.processResult ? (
                      <StatusBadge type="result" value={order.processResult === 'failure' ? '失败' : '成功'} />
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{maskPhone(order.customerPhone)}</TableCell>
                  <TableCell className="text-xs">{order.currentStep}</TableCell>
                  <TableCell className="text-xs">{order.currentHandler}</TableCell>
                  <TableCell className="text-xs">{order.city}</TableCell>
                  <TableCell className="text-xs">{order.district}</TableCell>
                  <TableCell className="text-xs">{order.grid}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.updateTime}</TableCell>
                  <TableCell className="text-xs">{order.creator}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.createTime}</TableCell>
                  <TableCell className="text-xs sticky right-0 bg-background">
                    <button
                      onClick={() => handleViewDetail(order.id, order.type, order.orderStatus)}
                      className="text-primary hover:underline text-sm"
                    >
                      详情
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页区 */}
      {renderPagination()}
    </div>
  );
}
