// ==================== 预设报表模板数据 ====================
import { ReportTemplate, ColumnConfigNode, FilterConfig } from './types';

// ---------- 通用筛选条件预设 ----------
const REGION_FILTER: FilterConfig = {
  id: 'region', label: '查询区域', type: 'cascader', required: false, defaultValue: 'all',
  optionSource: 'system', cascaderSource: 'region', order: 90,
};
const TIME_RANGE_FILTER: FilterConfig = {
  id: 'time_range', label: '时间范围', type: 'dateRange', required: false, defaultValue: '',
  optionSource: 'static', dateFieldStart: 'start_time', dateFieldEnd: 'end_time', order: 80,
};
const EXECUTION_MODE_FILTER: FilterConfig = {
  id: 'execution_mode', label: '执行模式', type: 'select', required: false, defaultValue: 'all',
  optionSource: 'static', order: 70,
  staticOptions: [
    { value: 'all', label: '全部' },
    { value: 'online_subcontract', label: '在线+分包看管' },
    { value: 'online', label: '在线模式' },
    { value: 'subcontract', label: '分包看管模式' },
  ],
};

// T01 携转预警筛选条件
const t01Filters: FilterConfig[] = [
  EXECUTION_MODE_FILTER,
  { id: 'order_time', label: '工单下发时间', type: 'dateRange', required: false, defaultValue: '',
    optionSource: 'static', dateFieldStart: 'order_time_start', dateFieldEnd: 'order_time_end', order: 60 },
  { id: 'execution_time', label: '执行时间', type: 'dateRange', required: false, defaultValue: '',
    optionSource: 'static', dateFieldStart: 'execution_time_start', dateFieldEnd: 'execution_time_end', order: 50 },
  REGION_FILTER,
];

// T02 宽带预警筛选条件
const t02Filters: FilterConfig[] = [
  { id: 'dispatch_type', label: '装维类型', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 70,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'install', label: '新装' },
      { value: 'repair', label: '维修' },
      { value: 'migrate', label: '移机' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T03 全球通离网筛选条件
const t03Filters: FilterConfig[] = [
  { id: 'customer_level', label: '客户等级', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 70,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'diamond', label: '钻石卡' },
      { value: 'gold', label: '金卡' },
      { value: 'silver', label: '银卡' },
    ],
  },
  { id: 'network_duration', label: '在网时长', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'lt1', label: '1年以下' },
      { value: '1to3', label: '1-3年' },
      { value: '3to5', label: '3-5年' },
      { value: 'gt5', label: '5年以上' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T04 投诉工单筛选条件
const t04Filters: FilterConfig[] = [
  { id: 'complaint_type', label: '投诉类型', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'COMPLAINT_TYPE', order: 70,
  },
  { id: 'work_order_status', label: '工单状态', type: 'multiSelect', required: false, defaultValue: '',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'completed', label: '已完成' },
      { value: 'closed', label: '已关闭' },
    ],
  },
  { id: 'accept_time', label: '受理时间', type: 'dateRange', required: false, defaultValue: '',
    optionSource: 'static', dateFieldStart: 'accept_time_start', dateFieldEnd: 'accept_time_end', order: 50 },
  REGION_FILTER,
];

// T05 指标调度筛选条件
const t05Filters: FilterConfig[] = [
  { id: 'indicator_category', label: '指标分类', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'INDICATOR_CATEGORY', order: 70,
  },
  { id: 'trigger_level', label: '触发级别', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'critical', label: '紧急' },
      { value: 'major', label: '重要' },
      { value: 'minor', label: '一般' },
    ],
  },
  { id: 'dispatch_status', label: '调度状态', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 50,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待调度' },
      { value: 'dispatching', label: '调度中' },
      { value: 'completed', label: '已完成' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T06 策略调度筛选条件
const t06Filters: FilterConfig[] = [
  { id: 'strategy_type', label: '策略类型', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'STRATEGY_TYPE', order: 70,
  },
  { id: 'channel', label: '推荐渠道', type: 'multiSelect', required: false, defaultValue: '',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'sms', label: '短信' },
      { value: 'call', label: '外呼' },
      { value: 'app', label: 'APP推送' },
      { value: 'offline', label: '线下' },
    ],
  },
  { id: 'dispatch_status', label: '调度状态', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 50,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待调度' },
      { value: 'dispatching', label: '调度中' },
      { value: 'completed', label: '已完成' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T07 客群调度筛选条件
const t07Filters: FilterConfig[] = [
  { id: 'group_tag', label: '客群标签', type: 'multiSelect', required: false, defaultValue: '',
    optionSource: 'dict', dictCode: 'GROUP_TAG', order: 70,
  },
  { id: 'reach_channel', label: '触达渠道', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'sms', label: '短信' },
      { value: 'call', label: '外呼' },
      { value: 'app', label: 'APP推送' },
      { value: 'offline', label: '线下' },
    ],
  },
  { id: 'dispatch_status', label: '调度状态', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 50,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待调度' },
      { value: 'dispatching', label: '调度中' },
      { value: 'completed', label: '已完成' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T08 客户商机调度筛选条件
const t08Filters: FilterConfig[] = [
  { id: 'opportunity_category', label: '商机分类', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'OPPORTUNITY_CATEGORY', order: 70,
  },
  { id: 'opportunity_source', label: '商机源', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'OPPORTUNITY_SOURCE', order: 60,
  },
  { id: 'execution_status', label: '执行状态', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 50,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'unassigned', label: '未派单' },
      { value: 'assigned', label: '已派单' },
      { value: 'executing', label: '执行中' },
      { value: 'completed', label: '已完成' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// T09 客群商机调度/区域攻坚调度筛选条件
const t09Filters: FilterConfig[] = [
  { id: 'predict_model', label: '预测模型', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'dict', dictCode: 'PREDICT_MODEL', order: 70,
  },
  { id: 'dispatch_status', label: '调度状态', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 60,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待调度' },
      { value: 'dispatching', label: '调度中' },
      { value: 'completed', label: '已完成' },
    ],
  },
  { id: 'conversion_result', label: '转化结果', type: 'select', required: false, defaultValue: 'all',
    optionSource: 'static', order: 50,
    staticOptions: [
      { value: 'all', label: '全部' },
      { value: 'converted', label: '已转化' },
      { value: 'not_converted', label: '未转化' },
      { value: 'in_progress', label: '转化中' },
    ],
  },
  TIME_RANGE_FILTER,
  REGION_FILTER,
];

// ---------- T01 携转预警执行分析 ----------
// 区域列由regionMode+regionDimensions运行时动态生成，columnConfig中不再包含region列
const t01Columns: ColumnConfigNode[] = [
  // 基础预警指标(10个)
  { id: 'g1', type: 'group', title: '基础预警指标', children: [
    { id: 'a0101', type: 'indicator', title: '预警触发数', indicatorCode: 'A0101', tooltip: '满足预警条件的客户数', rowSpan: 2 },
    { id: 'a0102', type: 'indicator', title: '执行完成数', indicatorCode: 'A0102', tooltip: '已反馈执行结果的工单数', rowSpan: 2 },
    { id: 'a0103', type: 'indicator', title: '执行成功数', indicatorCode: 'A0103', tooltip: '客户接受维系方案且未离网/携转', rowSpan: 2 },
    { id: 'a0104', type: 'indicator', title: '执行中', indicatorCode: 'A0104', tooltip: '已下发但尚未反馈执行结果', rowSpan: 2 },
    { id: 'a0105', type: 'indicator', title: '未执行数', indicatorCode: 'A0105', tooltip: '已下发但执行人员尚未领取/处理', rowSpan: 2 },
    { id: 'a0106', type: 'indicator', title: '维系前已携转', indicatorCode: 'A0106', tooltip: '预警触发后、执行前已完成号码携出', rowSpan: 2 },
    { id: 'a0107', type: 'indicator', title: '维系前已离网', indicatorCode: 'A0107', tooltip: '预警触发后、执行前已完成离网', rowSpan: 2 },
    { id: 'a0108', type: 'indicator', title: '维系前状态异常', indicatorCode: 'A0108', tooltip: '预警触发后客户状态异常(停机/半停)', rowSpan: 2 },
    { id: 'a0109', type: 'indicator', title: '携出客户数', indicatorCode: 'A0109', tooltip: '统计周期内已完成号码携出', rowSpan: 2 },
    { id: 'a0110', type: 'indicator', title: '离网客户数', indicatorCode: 'A0110', tooltip: '统计周期内已完成离网', rowSpan: 2 },
  ]},
  // 在线执行
  { id: 'g2', type: 'group', title: '在线执行', children: [
    { id: 'g2s1', type: 'group', title: '在线执行统计', children: [
      { id: 'b020101', type: 'indicator', title: '在线工单数', indicatorCode: 'B020101', tooltip: '通过在线渠道下发的预警工单总数', rowSpan: 1 },
      { id: 'b020102', type: 'indicator', title: '在线未执行数', indicatorCode: 'B020102', tooltip: '在线渠道工单中未触达客户的数量', rowSpan: 1 },
      { id: 'b020103', type: 'indicator', title: '在线执行中数', indicatorCode: 'B020103', tooltip: '已触达但客户尚未反馈的数量', rowSpan: 1 },
      { id: 'b020104', type: 'indicator', title: '在线执行完成数', indicatorCode: 'B020104', tooltip: '客户已明确反馈的数量', rowSpan: 1 },
      { id: 'b020105', type: 'indicator', title: '在线执行成功数', indicatorCode: 'B020105', tooltip: '客户接受维系方案的数量', rowSpan: 1 },
      { id: 'b020106', type: 'indicator', title: '在线拒绝数', indicatorCode: 'B020106', tooltip: '客户明确拒绝的数量', rowSpan: 1 },
    ]},
    { id: 'g2s2', type: 'group', title: '外显10086', children: [
      { id: 'b020201', type: 'indicator', title: '10086执行成功数', indicatorCode: 'B020201', tooltip: '10086外呼触达且客户接受维系方案', rowSpan: 1 },
      { id: 'b020202', type: 'indicator', title: '10086未接通数', indicatorCode: 'B020202', tooltip: '10086外呼未接通(含关机/无人接听/忙线)', rowSpan: 1 },
      { id: 'b020203', type: 'indicator', title: '10086拒绝数', indicatorCode: 'B020203', tooltip: '10086外呼接通后客户明确拒绝', rowSpan: 1 },
    ]},
    { id: 'g2s3', type: 'group', title: '特定专席', children: [
      { id: 'b020301', type: 'indicator', title: '专席执行成功数', indicatorCode: 'B020301', tooltip: '特定专席外呼触达且客户接受', rowSpan: 1 },
      { id: 'b020302', type: 'indicator', title: '专席未接通数', indicatorCode: 'B020302', tooltip: '特定专席外呼未接通', rowSpan: 1 },
      { id: 'b020303', type: 'indicator', title: '专席拒绝数', indicatorCode: 'B020303', tooltip: '特定专席外呼接通后客户明确拒绝', rowSpan: 1 },
    ]},
    { id: 'b020401', type: 'indicator', title: '重复工单数', indicatorCode: 'B020401', tooltip: '在线返回重复工单+在线登记数量', rowSpan: 2 },
    { id: 'g2s5', type: 'group', title: '在线预警工单执行时效', children: [
      { id: 'b020501', type: 'indicator', title: '≤30分钟', indicatorCode: 'B020501', tooltip: '从在线预警工单下发起至首次触达客户≤30分钟', rowSpan: 1 },
      { id: 'b020502', type: 'indicator', title: '30-60分钟', indicatorCode: 'B020502', tooltip: '首次触达客户耗时30-60分钟', rowSpan: 1 },
      { id: 'b020503', type: 'indicator', title: '60-120分钟', indicatorCode: 'B020503', tooltip: '首次触达客户耗时60-120分钟', rowSpan: 1 },
      { id: 'b020504', type: 'indicator', title: '2-12小时', indicatorCode: 'B020504', tooltip: '首次触达客户耗时2-12小时', rowSpan: 1 },
      { id: 'b020505', type: 'indicator', title: '12-24小时', indicatorCode: 'B020505', tooltip: '首次触达客户耗时12-24小时', rowSpan: 1 },
      { id: 'b020506', type: 'indicator', title: '24小时以上', indicatorCode: 'B020506', tooltip: '首次触达客户耗时超过24小时', rowSpan: 1 },
    ]},
  ]},
  // 网格经理执行
  { id: 'g3', type: 'group', title: '网格经理执行', children: [
    { id: 'g3s1', type: 'group', title: '网格经理执行统计', children: [
      { id: 'c030101', type: 'indicator', title: '网格经理工单数', indicatorCode: 'C030101', tooltip: '分配给网格经理的预警工单总数', rowSpan: 1 },
      { id: 'c030102', type: 'indicator', title: '网格经理未执行数', indicatorCode: 'C030102', tooltip: '网格经理尚未领取/处理的工单数', rowSpan: 1 },
      { id: 'c030103', type: 'indicator', title: '网格经理执行中数', indicatorCode: 'C030103', tooltip: '已领取但尚未反馈结果的工单数', rowSpan: 1 },
      { id: 'c030104', type: 'indicator', title: '网格经理执行完成数', indicatorCode: 'C030104', tooltip: '已反馈执行结果的工单数', rowSpan: 1 },
      { id: 'c030105', type: 'indicator', title: '网格经理执行成功数', indicatorCode: 'C030105', tooltip: '客户接受维系方案的工单数', rowSpan: 1 },
      { id: 'c030106', type: 'indicator', title: '网格经理拒绝数', indicatorCode: 'C030106', tooltip: '客户明确拒绝的工单数', rowSpan: 1 },
      { id: 'c030107', type: 'indicator', title: '网格经理转派数', indicatorCode: 'C030107', tooltip: '将工单转派给其他渠道/人员的数量', rowSpan: 1 },
    ]},
    { id: 'g3s2', type: 'group', title: '网格经理执行时效', children: [
      { id: 'c030201', type: 'indicator', title: '≤2小时', indicatorCode: 'C030201', tooltip: '首次触达客户≤2小时', rowSpan: 1 },
      { id: 'c030202', type: 'indicator', title: '2-6小时', indicatorCode: 'C030202', tooltip: '首次触达耗时2-6小时', rowSpan: 1 },
      { id: 'c030203', type: 'indicator', title: '6-24小时', indicatorCode: 'C030203', tooltip: '首次触达耗时6-24小时', rowSpan: 1 },
      { id: 'c030204', type: 'indicator', title: '24-48小时', indicatorCode: 'C030204', tooltip: '首次触达耗时24-48小时', rowSpan: 1 },
      { id: 'c030205', type: 'indicator', title: '>48小时', indicatorCode: 'C030205', tooltip: '首次触达耗时超过48小时', rowSpan: 1 },
    ]},
  ]},
  // 地市集运
  { id: 'g4', type: 'group', title: '地市集运执行', children: [
    { id: 'd040101', type: 'indicator', title: '地市集运工单数', indicatorCode: 'D040101', tooltip: '分配给地市集运的预警工单总数', rowSpan: 2 },
    { id: 'd040102', type: 'indicator', title: '地市集运认领数', indicatorCode: 'D040102', tooltip: '地市集运人员主动认领的工单数', rowSpan: 2 },
    { id: 'd040103', type: 'indicator', title: '地市集运执行数', indicatorCode: 'D040103', tooltip: '地市集运人员已执行的工单数', rowSpan: 2 },
    { id: 'd040104', type: 'indicator', title: '地市集运呼通数', indicatorCode: 'D040104', tooltip: '地市集运外呼接通的工单数', rowSpan: 2 },
    { id: 'd040105', type: 'indicator', title: '地市集运有效执行数', indicatorCode: 'D040105', tooltip: '外呼接通且客户反馈有效的工单数', rowSpan: 2 },
    { id: 'd040106', type: 'indicator', title: '48小时内有效执行数', indicatorCode: 'D040106', tooltip: '工单下发48小时内完成有效执行', rowSpan: 2 },
    { id: 'd040107', type: 'indicator', title: '地市集运认领率', indicatorCode: 'D040107', tooltip: '认领数/工单数×100%', rowSpan: 2 },
    { id: 'd040108', type: 'indicator', title: '地市集运执行率', indicatorCode: 'D040108', tooltip: '执行数/认领数×100%', rowSpan: 2 },
    { id: 'd040109', type: 'indicator', title: '地市集运呼通率', indicatorCode: 'D040109', tooltip: '呼通数/执行数×100%', rowSpan: 2 },
    { id: 'd040110', type: 'indicator', title: '地市集运有效执行率', indicatorCode: 'D040110', tooltip: '有效执行数/呼通数×100%', rowSpan: 2 },
    { id: 'd040111', type: 'indicator', title: '48小时内有效执行率', indicatorCode: 'D040111', tooltip: '48小时内有效执行数/有效执行数×100%', rowSpan: 2 },
    { id: 'd040112', type: 'indicator', title: '地市集运转派数', indicatorCode: 'D040112', tooltip: '转派给其他渠道的数量', rowSpan: 2 },
    { id: 'd040113', type: 'indicator', title: '转派至网格经理数', indicatorCode: 'D040113', tooltip: '转派目标为网格经理的数量', rowSpan: 2 },
    { id: 'd040114', type: 'indicator', title: '转派至装维数', indicatorCode: 'D040114', tooltip: '转派目标为装维人员的数量', rowSpan: 2 },
  ]},
  // 操作列(固定右侧)
  { id: 'act1', type: 'action', title: '操作', rowSpan: 3, fixed: 'right', required: true },
];

// ---------- T02 宽带预警执行分析 ----------
const t02Columns: ColumnConfigNode[] = [
  { id: 'g1', type: 'group', title: '基础预警指标', children: [
    { id: 'a0101', type: 'indicator', title: '预警触发数', indicatorCode: 'A0101', tooltip: '满足预警条件的客户数', rowSpan: 2 },
    { id: 'a0102', type: 'indicator', title: '执行完成数', indicatorCode: 'A0102', tooltip: '已反馈执行结果的工单数', rowSpan: 2 },
    { id: 'a0103', type: 'indicator', title: '执行成功数', indicatorCode: 'A0103', tooltip: '客户接受维系方案', rowSpan: 2 },
    { id: 'a0104', type: 'indicator', title: '执行中', indicatorCode: 'A0104', tooltip: '已下发尚未反馈执行结果', rowSpan: 2 },
    { id: 'a0105', type: 'indicator', title: '未执行数', indicatorCode: 'A0105', tooltip: '执行人员尚未领取/处理', rowSpan: 2 },
  ]},
  { id: 'g7', type: 'group', title: '装维人员执行', children: [
    { id: 'g7s1', type: 'group', title: '装维人员执行统计', children: [
      { id: 'g070101', type: 'indicator', title: '装维工单数', indicatorCode: 'G070101', tooltip: '分配给装维人员的预警工单总数', rowSpan: 1 },
      { id: 'g070102', type: 'indicator', title: '装维未执行数', indicatorCode: 'G070102', tooltip: '装维人员尚未领取/处理的工单数', rowSpan: 1 },
      { id: 'g070103', type: 'indicator', title: '装维执行中数', indicatorCode: 'G070103', tooltip: '已领取但尚未反馈结果', rowSpan: 1 },
      { id: 'g070104', type: 'indicator', title: '装维执行完成数', indicatorCode: 'G070104', tooltip: '已反馈执行结果的工单数', rowSpan: 1 },
      { id: 'g070105', type: 'indicator', title: '装维成功数', indicatorCode: 'G070105', tooltip: '上门服务且问题解决的数量', rowSpan: 1 },
      { id: 'g070106', type: 'indicator', title: '装维失败数', indicatorCode: 'G070106', tooltip: '上门服务但未能解决的数量', rowSpan: 1 },
      { id: 'g070107', type: 'indicator', title: '装维拒绝数', indicatorCode: 'G070107', tooltip: '客户拒绝装维上门服务', rowSpan: 1 },
    ]},
    { id: 'g7s2', type: 'group', title: '装维人员执行时效', children: [
      { id: 'g070201', type: 'indicator', title: '≤48小时', indicatorCode: 'G070201', tooltip: '首次触达≤48小时', rowSpan: 1 },
      { id: 'g070202', type: 'indicator', title: '≤7天', indicatorCode: 'G070202', tooltip: '首次触达≤7天', rowSpan: 1 },
      { id: 'g070203', type: 'indicator', title: '≤15天', indicatorCode: 'G070203', tooltip: '首次触达≤15天', rowSpan: 1 },
      { id: 'g070204', type: 'indicator', title: '>15天', indicatorCode: 'G070204', tooltip: '首次触达超过15天', rowSpan: 1 },
    ]},
  ]},
  { id: 'g3', type: 'group', title: '网格经理执行', children: [
    { id: 'c030101', type: 'indicator', title: '网格经理工单数', indicatorCode: 'C030101', tooltip: '分配给网格经理的预警工单总数', rowSpan: 2 },
    { id: 'c030105', type: 'indicator', title: '网格经理执行成功数', indicatorCode: 'C030105', tooltip: '客户接受维系方案', rowSpan: 2 },
    { id: 'c030107', type: 'indicator', title: '网格经理转派数', indicatorCode: 'C030107', tooltip: '转派给其他渠道/人员的数量', rowSpan: 2 },
  ]},
  { id: 'act1', type: 'action', title: '操作', rowSpan: 3, fixed: 'right', required: true },
];

// ---------- T03 全球通离网预警执行分析 ----------
const t03Columns: ColumnConfigNode[] = [
  { id: 'g1', type: 'group', title: '基础预警指标', children: [
    { id: 'a0101', type: 'indicator', title: '预警触发数', indicatorCode: 'A0101', tooltip: '满足预警条件的客户数', rowSpan: 2 },
    { id: 'a0102', type: 'indicator', title: '执行完成数', indicatorCode: 'A0102', tooltip: '已反馈执行结果的工单数', rowSpan: 2 },
    { id: 'a0103', type: 'indicator', title: '执行成功数', indicatorCode: 'A0103', tooltip: '客户接受维系方案且未离网', rowSpan: 2 },
    { id: 'a0104', type: 'indicator', title: '执行中', indicatorCode: 'A0104', tooltip: '已下发尚未反馈执行结果', rowSpan: 2 },
    { id: 'a0105', type: 'indicator', title: '未执行数', indicatorCode: 'A0105', tooltip: '执行人员尚未领取/处理', rowSpan: 2 },
    { id: 'a0107', type: 'indicator', title: '维系前已离网', indicatorCode: 'A0107', tooltip: '预警触发后、执行前已完成离网', rowSpan: 2 },
    { id: 'a0108', type: 'indicator', title: '维系前状态异常', indicatorCode: 'A0108', tooltip: '预警触发后客户状态异常', rowSpan: 2 },
    { id: 'a0110', type: 'indicator', title: '离网客户数', indicatorCode: 'A0110', tooltip: '统计周期内已完成离网', rowSpan: 2 },
  ]},
  { id: 'g2', type: 'group', title: '在线执行', children: [
    { id: 'b020101', type: 'indicator', title: '在线工单数', indicatorCode: 'B020101', tooltip: '通过在线渠道下发的预警工单总数', rowSpan: 2 },
    { id: 'b020105', type: 'indicator', title: '在线执行成功数', indicatorCode: 'B020105', tooltip: '客户接受维系方案的数量', rowSpan: 2 },
    { id: 'b020106', type: 'indicator', title: '在线拒绝数', indicatorCode: 'B020106', tooltip: '客户明确拒绝的数量', rowSpan: 2 },
  ]},
  { id: 'g5', type: 'group', title: '10088执行', children: [
    { id: 'g5s1', type: 'group', title: '10088执行统计', children: [
      { id: 'e050101', type: 'indicator', title: '10088工单数', indicatorCode: 'E050101', tooltip: '分配给10088外呼的预警工单总数', rowSpan: 1 },
      { id: 'e050102', type: 'indicator', title: '10088未执行数', indicatorCode: 'E050102', tooltip: '10088渠道工单中未触达客户的数量', rowSpan: 1 },
      { id: 'e050105', type: 'indicator', title: '10088执行成功数', indicatorCode: 'E050105', tooltip: '客户接受维系方案', rowSpan: 1 },
      { id: 'e050106', type: 'indicator', title: '10088拒绝数', indicatorCode: 'E050106', tooltip: '客户明确拒绝', rowSpan: 1 },
    ]},
    { id: 'g5s2', type: 'group', title: '10088执行时效', children: [
      { id: 'e050201', type: 'indicator', title: '≤48小时', indicatorCode: 'E050201', tooltip: '首次触达≤48小时', rowSpan: 1 },
      { id: 'e050202', type: 'indicator', title: '≤7天', indicatorCode: 'E050202', tooltip: '首次触达≤7天', rowSpan: 1 },
      { id: 'e050203', type: 'indicator', title: '≤15天', indicatorCode: 'E050203', tooltip: '首次触达≤15天', rowSpan: 1 },
      { id: 'e050204', type: 'indicator', title: '>15天', indicatorCode: 'E050204', tooltip: '首次触达超过15天', rowSpan: 1 },
    ]},
  ]},
  { id: 'g3', type: 'group', title: '网格经理执行', children: [
    { id: 'c030101', type: 'indicator', title: '网格经理工单数', indicatorCode: 'C030101', tooltip: '分配给网格经理的预警工单总数', rowSpan: 2 },
    { id: 'c030105', type: 'indicator', title: '网格经理执行成功数', indicatorCode: 'C030105', tooltip: '客户接受维系方案', rowSpan: 2 },
    { id: 'c030107', type: 'indicator', title: '网格经理转派数', indicatorCode: 'C030107', tooltip: '转派给其他渠道/人员', rowSpan: 2 },
  ]},
  { id: 'act1', type: 'action', title: '操作', rowSpan: 3, fixed: 'right', required: true },
];

// ---------- T04 投诉工单执行分析 ----------
const t04Columns: ColumnConfigNode[] = [
  { id: 'g1', type: 'group', title: '基础预警指标', children: [
    { id: 'a0101', type: 'indicator', title: '预警触发数', indicatorCode: 'A0101', tooltip: '满足预警条件的客户数', rowSpan: 2 },
    { id: 'a0102', type: 'indicator', title: '执行完成数', indicatorCode: 'A0102', tooltip: '已反馈执行结果的工单数', rowSpan: 2 },
    { id: 'a0103', type: 'indicator', title: '执行成功数', indicatorCode: 'A0103', tooltip: '客户接受维系方案', rowSpan: 2 },
    { id: 'a0104', type: 'indicator', title: '执行中', indicatorCode: 'A0104', tooltip: '已下发尚未反馈执行结果', rowSpan: 2 },
    { id: 'a0105', type: 'indicator', title: '未执行数', indicatorCode: 'A0105', tooltip: '执行人员尚未领取/处理', rowSpan: 2 },
  ]},
  { id: 'g8', type: 'group', title: '投诉专项指标', children: [
    { id: 'g8s1', type: 'group', title: '工单类型', children: [
      { id: 'h080101', type: 'indicator', title: '不满意工单数', indicatorCode: 'H080101', tooltip: '客户评价为不满意的投诉工单数', rowSpan: 1 },
      { id: 'h080102', type: 'indicator', title: '重复工单数', indicatorCode: 'H080102', tooltip: '同一客户同一问题重复投诉', rowSpan: 1 },
      { id: 'h080103', type: 'indicator', title: '超时工单数', indicatorCode: 'H080103', tooltip: '超过规定处理时限的投诉工单数', rowSpan: 1 },
    ]},
    { id: 'g8s2', type: 'group', title: '投诉类型', children: [
      { id: 'h080201', type: 'indicator', title: '办理质疑', indicatorCode: 'H080201', tooltip: '投诉类型为办理质疑', rowSpan: 1 },
      { id: 'h080202', type: 'indicator', title: '解释差错', indicatorCode: 'H080202', tooltip: '投诉类型为解释差错', rowSpan: 1 },
      { id: 'h080203', type: 'indicator', title: '办理差错', indicatorCode: 'H080203', tooltip: '投诉类型为办理差错', rowSpan: 1 },
      { id: 'h080204', type: 'indicator', title: '宽带拆机', indicatorCode: 'H080204', tooltip: '投诉类型为宽带拆机', rowSpan: 1 },
      { id: 'h080205', type: 'indicator', title: '智家退订', indicatorCode: 'H080205', tooltip: '投诉类型为智家退订', rowSpan: 1 },
      { id: 'h080206', type: 'indicator', title: '装维质量', indicatorCode: 'H080206', tooltip: '投诉类型为装维质量', rowSpan: 1 },
      { id: 'h080207', type: 'indicator', title: '功能使用', indicatorCode: 'H080207', tooltip: '投诉类型为功能使用', rowSpan: 1 },
      { id: 'h080208', type: 'indicator', title: '其他', indicatorCode: 'H080208', tooltip: '投诉类型为其他', rowSpan: 1 },
    ]},
    { id: 'g8s3', type: 'group', title: '执行成功细分', children: [
      { id: 'h080301', type: 'indicator', title: '已联系客服核实解决', indicatorCode: 'H080301', tooltip: '已联系客服核实并解决', rowSpan: 1 },
      { id: 'h080302', type: 'indicator', title: '已联系渠道核实/推进解决', indicatorCode: 'H080302', tooltip: '已联系渠道核实并推进解决', rowSpan: 1 },
      { id: 'h080303', type: 'indicator', title: '已联系装维核实/推进解决', indicatorCode: 'H080303', tooltip: '已联系装维核实并推进解决', rowSpan: 1 },
      { id: 'h080304', type: 'indicator', title: '已联系客服并向上一级反馈', indicatorCode: 'H080304', tooltip: '已联系客服并向上一级反馈', rowSpan: 1 },
    ]},
    { id: 'g8s4', type: 'group', title: '其他执行结果细分', children: [
      { id: 'h080401', type: 'indicator', title: '未联系客户-渠道核实/推进解决', indicatorCode: 'H080401', tooltip: '未成功联系客户但已联系渠道核实/推进解决', rowSpan: 1 },
      { id: 'h080402', type: 'indicator', title: '未联系客户-装维核实/推进解决', indicatorCode: 'H080402', tooltip: '未成功联系客户但已联系装维核实/推进解决', rowSpan: 1 },
    ]},
  ]},
  { id: 'act1', type: 'action', title: '操作', rowSpan: 3, fixed: 'right', required: true },
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    templateId: 'T01',
    templateName: '携转预警执行分析',
    templateDesc: '号码携转预警场景的全渠道执行分析报表，覆盖在线执行、网格经理执行、地市集运执行三大渠道及完整时效分档',
    categoryId: 'CAT01',
    source: 'system',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: t01Columns,
    filterConfig: t01Filters,
    usageCount: 12,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T02',
    templateName: '宽带预警执行分析',
    templateDesc: '宽带业务预警场景的执行分析报表，以装维人员执行为核心，辅以网格经理执行渠道',
    categoryId: 'CAT02',
    source: 'system',
    regionMode: 'flat',
    regionDimensions: ['city', 'district', 'grid'],
    columnConfig: t02Columns,
    filterConfig: t02Filters,
    usageCount: 8,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T03',
    templateName: '全球通离网预警执行分析',
    templateDesc: '全球通品牌客户离网预警场景的执行分析报表，覆盖在线执行、10088外呼、网格经理三大渠道',
    categoryId: 'CAT03',
    source: 'system',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: t03Columns,
    filterConfig: t03Filters,
    usageCount: 15,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T04',
    templateName: '投诉工单执行分析',
    templateDesc: '投诉工单场景的专项执行分析报表，按工单类型、投诉类型、执行结果细分维度展开',
    categoryId: 'CAT04',
    source: 'system',
    regionMode: 'flat',
    regionDimensions: ['city', 'district', 'grid'],
    columnConfig: t04Columns,
    filterConfig: t04Filters,
    usageCount: 6,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T05',
    templateName: '商机预警执行分析',
    templateDesc: '商机预警场景的执行分析报表，关注商机转化与执行效率',
    categoryId: 'CAT05',
    source: 'system',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: t01Columns, // 复用T01基础结构，实际业务确认后定制
    filterConfig: t05Filters,
    usageCount: 3,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T06',
    templateName: '消费异动预警执行分析',
    templateDesc: '消费异动预警场景的执行分析报表，关注ARPU异动客户维系效果',
    categoryId: 'CAT06',
    source: 'system',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: t01Columns, // 复用T01基础结构，实际业务确认后定制
    filterConfig: t06Filters,
    usageCount: 2,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T07',
    templateName: '流量异动预警执行分析',
    templateDesc: '流量异动预警场景的执行分析报表，关注流量突降/突增客户维系效果',
    categoryId: 'CAT06',
    source: 'system',
    regionMode: 'flat',
    regionDimensions: ['city', 'district'],
    columnConfig: t01Columns, // 复用T01基础结构，实际业务确认后定制
    filterConfig: t07Filters,
    usageCount: 1,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T08',
    templateName: '套餐到期预警执行分析',
    templateDesc: '套餐到期预警场景的执行分析报表，关注续约转化率',
    categoryId: 'CAT06',
    source: 'system',
    regionMode: 'flat',
    regionDimensions: ['city', 'district'],
    columnConfig: t01Columns, // 复用T01基础结构，实际业务确认后定制
    filterConfig: t08Filters,
    usageCount: 4,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
  {
    templateId: 'T09',
    templateName: '综合预警执行分析',
    templateDesc: '全场景汇总的综合预警执行分析报表，覆盖所有预警类型和执行渠道',
    categoryId: 'CAT99',
    source: 'system',
    regionMode: 'drill',
    regionDimensions: ['province', 'city', 'district', 'grid'],
    columnConfig: t01Columns, // 复用T01基础结构，实际业务确认后定制
    filterConfig: t09Filters,
    usageCount: 5,
    createdBy: 'system',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
  },
];

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.templateId === id);
}

export function addTemplate(template: ReportTemplate): void {
  REPORT_TEMPLATES.push(template);
}
